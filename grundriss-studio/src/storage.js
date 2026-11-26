// Grundriss Studio – persistence: browser storage, optional cloud (claude db capability), file downloads
import { debounce, uid } from './util.js';

const LS_INDEX = 'gs.index.v1';
const LS_LAST = 'gs.last.v1';
const lsKey = (id) => 'gs.p.' + id;

function lsGet(k) {
  try { return localStorage.getItem(k); } catch (e) { return null; }
}
function lsSet(k, v) {
  try { localStorage.setItem(k, v); return true; } catch (e) { return false; }
}
function lsDel(k) {
  try { localStorage.removeItem(k); } catch (e) { /* ignore */ }
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36) + ':' + s.length;
}

export function createStorage(app) {
  let db = null;
  let userId = null;
  let downloads = null;
  let downloadsState = window.claude && window.claude.use ? 'pending' : 'native';
  const assetHashes = new Map();
  let cloudChain = Promise.resolve();
  let state = 'idle';

  const setState = (s, detail) => {
    state = s;
    app.emit('save-state', s, detail);
  };

  // ------------------------------------------------------------------ local
  function localIndex() {
    try {
      const v = JSON.parse(lsGet(LS_INDEX) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }
  function writeIndex(list) {
    lsSet(LS_INDEX, JSON.stringify(list.slice(0, 200)));
  }
  function summary(p) {
    return { id: p.id, name: p.name, updatedAt: p.updatedAt, levels: p.levels.length };
  }
  function saveLocal(p) {
    let ok = lsSet(lsKey(p.id), JSON.stringify(p));
    let partial = false;
    if (!ok) {
      const lite = { ...p, assets: {}, levels: p.levels.map((l) => ({ ...l, background: null })) };
      ok = lsSet(lsKey(p.id), JSON.stringify(lite));
      partial = ok;
    }
    if (ok) {
      const idx = localIndex().filter((e) => e.id !== p.id);
      idx.unshift(summary(p));
      writeIndex(idx);
      lsSet(LS_LAST, p.id);
    }
    return { ok, partial };
  }
  function loadLocal(id) {
    try {
      const s = lsGet(lsKey(id));
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  }
  function deleteLocal(id) {
    lsDel(lsKey(id));
    writeIndex(localIndex().filter((e) => e.id !== id));
  }
  function loadLast() {
    const id = lsGet(LS_LAST);
    return id ? loadLocal(id) : null;
  }

  // ------------------------------------------------------------------ cloud
  async function initCloud() {
    if (!window.claude || !window.claude.use) return false;
    try {
      const [dbNs, userNs] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!dbNs || !userNs) return false;
      const id = await userNs.id();
      if (!id) return false;
      db = dbNs;
      userId = id;
      app.emit('cloud', true);
      return true;
    } catch (e) {
      return false;
    }
  }
  const cloudOn = () => !!(db && userId);
  const col = () => db.collection('data/users/' + userId);

  async function cloudList() {
    if (!cloudOn()) return [];
    const snap = await col().where('updatedAt', '>', 0).get();
    return snap.docs
      .filter((d) => d.exists && d.id.startsWith('proj_') && !d.id.includes('~'))
      .map((d) => {
        const x = d.data() || {};
        return { id: d.id, name: x.name || 'Projekt', updatedAt: x.updatedAt || 0, levels: x.levels || 1 };
      });
  }

  async function cloudLoad(id) {
    if (!cloudOn()) return null;
    const snap = await col().doc(id).get();
    if (!snap.exists) return null;
    const x = snap.data();
    const p = JSON.parse(x.json);
    p.assets = {};
    if (x.chunks > 0) {
      let s = '';
      for (let i = 0; i < x.chunks; i++) {
        const c = await col().doc(id + '~a' + i).get();
        if (c.exists) s += c.data().s || '';
      }
      try {
        p.assets = JSON.parse(s);
        assetHashes.set(id, x.assetsHash);
      } catch (e) {
        p.assets = {};
      }
    }
    return p;
  }

  async function cloudSave(p) {
    if (!cloudOn()) return false;
    const { assets, ...rest } = p;
    const json = JSON.stringify(rest);
    if (json.length > 240000) throw Object.assign(new Error('too_large'), { code: 'too_large' });
    const aj = JSON.stringify(assets || {});
    const ah = hashStr(aj);
    let chunks = 0;
    if (aj.length > 2) {
      const size = 190000;
      chunks = Math.ceil(aj.length / size);
      if (assetHashes.get(p.id) !== ah) {
        for (let i = 0; i < chunks; i++) await col().doc(p.id + '~a' + i).set({ s: aj.slice(i * size, (i + 1) * size) });
        assetHashes.set(p.id, ah);
      }
    }
    await col().doc(p.id).set({ name: p.name, updatedAt: p.updatedAt, levels: p.levels.length, json, chunks, assetsHash: ah });
    return true;
  }

  async function cloudDelete(id) {
    if (!cloudOn()) return;
    const snap = await col().doc(id).get();
    const chunks = snap.exists ? snap.data().chunks || 0 : 0;
    await col().doc(id).delete();
    for (let i = 0; i < chunks; i++) await col().doc(id + '~a' + i).delete();
  }

  // ------------------------------------------------------------------ autosave
  const saveLocalSoon = debounce(() => {
    const p = app.project;
    if (!p) return;
    const r = saveLocal(p);
    if (!cloudOn()) setState(r.ok ? (r.partial ? 'local-partial' : 'local') : 'error-local');
  }, 900);

  const saveCloudSoon = debounce(() => {
    const p = app.project;
    if (!p || !cloudOn()) return;
    const snapshot = JSON.parse(JSON.stringify(p));
    setState('saving');
    cloudChain = cloudChain
      .then(() => cloudSave(snapshot))
      .then(() => setState('cloud'))
      .catch((e) => setState(e && e.code === 'too_large' ? 'error-size' : 'error-cloud'));
  }, 2500);

  function scheduleSave() {
    setState('pending');
    saveLocalSoon();
    saveCloudSoon();
  }
  function flush() {
    saveLocalSoon.flush();
    if (cloudOn()) saveCloudSoon.flush();
  }

  async function listAll() {
    const local = localIndex().map((e) => ({ ...e, local: true }));
    let cloud = [];
    try { cloud = await cloudList(); } catch (e) { cloud = []; }
    const map = new Map();
    for (const e of local) map.set(e.id, { ...e });
    for (const e of cloud) {
      const m = map.get(e.id);
      if (m) {
        m.cloud = true;
        if (e.updatedAt > m.updatedAt) { m.updatedAt = e.updatedAt; m.name = e.name; m.cloudNewer = true; }
      } else map.set(e.id, { ...e, cloud: true });
    }
    return [...map.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async function load(entry) {
    const local = loadLocal(entry.id);
    if (entry.cloud && (!local || entry.cloudNewer || (local.updatedAt || 0) < entry.updatedAt)) {
      try {
        const c = await cloudLoad(entry.id);
        if (c) return c;
      } catch (e) { /* fall back */ }
    }
    return local;
  }

  async function remove(id) {
    deleteLocal(id);
    try { await cloudDelete(id); } catch (e) { /* ignore */ }
  }

  // ------------------------------------------------------------------ downloads
  async function initDownloads() {
    if (!window.claude || !window.claude.use) { downloadsState = 'native'; return; }
    try {
      downloads = await window.claude.use('downloads');
      downloadsState = downloads ? 'available' : 'unavailable';
    } catch (e) {
      downloadsState = 'unavailable';
    }
    app.emit('downloads', downloadsState);
  }

  async function saveFile(filename, data) {
    if (downloads) {
      try {
        await downloads.save({ filename, data });
        return 'saved';
      } catch (e) {
        const code = e && e.code;
        if (code === 'declined') return 'declined';
        if (code === 'rate_limited') return 'busy';
        return 'error';
      }
    }
    if (downloadsState === 'native') {
      const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return 'saved';
    }
    return 'unavailable';
  }

  return {
    loadLast, loadLocal, saveLocal, listAll, load, remove, scheduleSave, flush,
    initCloud, initDownloads, saveFile,
    get cloud() { return cloudOn(); },
    get canDownload() { return downloadsState === 'available' || downloadsState === 'native' || downloadsState === 'pending'; },
    get state() { return state; },
    async cloudCopy(id) {
      try { return cloudOn() ? await cloudLoad(id) : null; } catch (e) { return null; }
    },
  };
}
