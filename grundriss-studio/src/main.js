// Grundriss Studio – application controller
import { uid, r2, normDeg, deepClone, clamp } from './util.js';
import {
  createProject, invalidateDerived, removeWalls, deleteRoom, nearestWall, openingFrame, sanitizeProject, sortedLevels,
} from './model.js';
import { ITEMS, OPENINGS } from './catalog.js';
import { createPlan2D } from './plan2d.js';
import { createView3D } from './view3d.js';
import { createUI } from './ui.js';
import { createStorage } from './storage.js';
import { createSampleProject } from './sample.js';

const $ = (id) => document.getElementById(id);

const app = {
  project: null,
  levelId: null,
  selection: [],
  tool: 'select',
  viewMode: '2d',
};
const listeners = {};
app.on = (ev, fn) => (listeners[ev] = listeners[ev] || []).push(fn);
app.emit = (ev, ...args) => (listeners[ev] || []).forEach((fn) => fn(...args));
Object.defineProperty(app, 'level', {
  get() {
    return app.project.levels.find((l) => l.id === app.levelId) || app.project.levels[0];
  },
});

let plan, view3d, ui, storage;

// ------------------------------------------------------------------ history
const undoStack = [];
const redoStack = [];
let lastKey = null;
let lastTime = 0;

function snapshot() {
  const { assets, ...rest } = app.project;
  return JSON.stringify(rest);
}
function restore(str) {
  const p = JSON.parse(str);
  p.assets = app.project.assets;
  app.project = p;
  if (!p.levels.some((l) => l.id === app.levelId)) app.levelId = sortedLevels(p)[0].id;
  invalidateDerived();
  changed();
}
app.mutate = (fn, key) => {
  const now = performance.now();
  const coalesce = key && key === lastKey && (key.startsWith('drag:') || now - lastTime < 1500);
  if (!coalesce) {
    undoStack.push(snapshot());
    if (undoStack.length > 150) undoStack.shift();
    redoStack.length = 0;
  }
  lastKey = key || null;
  lastTime = now;
  fn();
  changed();
};
app.undo = () => {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  lastKey = null;
  restore(undoStack.pop());
};
app.redo = () => {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  lastKey = null;
  restore(redoStack.pop());
};
app.canUndo = () => undoStack.length > 0;
app.canRedo = () => redoStack.length > 0;

// ------------------------------------------------------------------ change propagation
let rafUI = 0, raf3d = 0;
let lastWallCount = -1;
function changed() {
  app.project.updatedAt = Date.now();
  const wc = app.level.walls.length;
  if (lastWallCount === 0 && wc > 0 && view3d) {
    if (app.viewMode !== '2d') requestAnimationFrame(() => view3d.resetView());
    else app._needs3dReset = true;
  }
  lastWallCount = wc;
  pruneSelection();
  plan.render();
  if (view3d && !raf3d) raf3d = requestAnimationFrame(() => { raf3d = 0; view3d.sync(); });
  if (!rafUI) rafUI = requestAnimationFrame(() => { rafUI = 0; ui.refresh(); });
  storage.scheduleSave();
}

function exists(s) {
  const lv = app.level;
  switch (s.kind) {
    case 'item': return lv.items.some((x) => x.id === s.id);
    case 'opening': return lv.openings.some((x) => x.id === s.id);
    case 'wall': return lv.walls.some((x) => x.id === s.id);
    case 'room': return lv.rooms.some((x) => x.id === s.id);
    case 'label': return lv.labels.some((x) => x.id === s.id);
    case 'dim': return lv.dims.some((x) => x.id === s.id);
    default: return false;
  }
}
function pruneSelection() {
  const before = app.selection.length;
  app.selection = app.selection.filter(exists);
  if (app.selection.length !== before) app.emit('selection');
}

// ------------------------------------------------------------------ selection & tools
app.select = (list) => {
  app.selection = (list || []).filter(exists);
  plan.render();
  view3d && view3d.refreshSelection();
  ui.renderProps(true);
  app.emit('selection');
};
app.toggleSelect = (s) => {
  const i = app.selection.findIndex((x) => x.kind === s.kind && x.id === s.id);
  if (i >= 0) app.select(app.selection.filter((_, k) => k !== i));
  else app.select([...app.selection, s]);
};
app.setTool = (t) => {
  if (view3d && view3d.walking) view3d.exitWalk();
  if (t !== 'select' && app.viewMode === '3d') app.setView(window.innerWidth >= 1100 ? 'split' : '2d');
  app.tool = t;
  plan.toolChanged(t);
  ui.refresh();
};
app.setView = (mode) => {
  if (!view3d && mode !== '2d') {
    ui.toast('3D ist in diesem Browser nicht verfügbar (WebGL fehlt).');
    mode = '2d';
  }
  if (view3d && view3d.walking && mode === '2d') view3d.exitWalk();
  const reset3d = mode !== '2d' && (app._needs3dReset || (app.viewMode === '2d' && !app._seen3d));
  app.viewMode = mode;
  $('stage').dataset.view = mode;
  try { localStorage.setItem('gs.view', mode); } catch (e) { /* ignore */ }
  if (view3d) view3d.setVisible(mode !== '2d');
  if (reset3d && view3d) { app._seen3d = true; app._needs3dReset = false; view3d.resetView(); }
  requestAnimationFrame(() => plan.resized());
  ui.refresh();
};
app.setLevel = (id) => {
  if (!app.project.levels.some((l) => l.id === id)) return;
  if (view3d && view3d.walking) view3d.exitWalk();
  app.levelId = id;
  app.selection = [];
  lastWallCount = app.level.walls.length;
  plan.toolChanged(app.tool);
  plan.render();
  view3d && view3d.sync();
  ui.refresh();
  ui.renderProps(true);
};
app.hint = (t) => ui.setHint(t);
app.toast = (t) => ui.toast(t);
app.askLength = (q, p) => ui.askLength(q, p);
app.focusField = (id) => ui.focusField(id);
app.openProps = () => ui.openSheet('props');
app.snapItem = (it) => plan.magnet(it);

// ------------------------------------------------------------------ editing actions
app.duplicate = () => {
  const lv = app.level;
  const out = [];
  if (!app.selection.length) return;
  app.mutate(() => {
    for (const s of app.selection) {
      if (s.kind === 'item') {
        const it = lv.items.find((x) => x.id === s.id);
        if (!it) continue;
        const c = { ...deepClone(it), id: uid('it_'), x: r2(it.x + 30), y: r2(it.y + 30) };
        lv.items.push(c);
        out.push({ kind: 'item', id: c.id });
      } else if (s.kind === 'label') {
        const l = lv.labels.find((x) => x.id === s.id);
        if (!l) continue;
        const c = { ...l, id: uid('lb_'), x: l.x + 30, y: l.y + 30 };
        lv.labels.push(c);
        out.push({ kind: 'label', id: c.id });
      } else if (s.kind === 'opening') {
        const o = lv.openings.find((x) => x.id === s.id);
        if (!o) continue;
        const c = { ...o, id: uid('op_'), offset: o.offset + o.width + 30 };
        const fr = openingFrame(lv, c);
        if (fr) c.offset = fr.u;
        lv.openings.push(c);
        out.push({ kind: 'opening', id: c.id });
      } else if (s.kind === 'dim') {
        const dm = lv.dims.find((x) => x.id === s.id);
        if (!dm) continue;
        const c = { id: uid('dm_'), a: { x: dm.a.x + 30, y: dm.a.y + 30 }, b: { x: dm.b.x + 30, y: dm.b.y + 30 } };
        lv.dims.push(c);
        out.push({ kind: 'dim', id: c.id });
      }
    }
  });
  if (out.length) app.select(out);
  else ui.toast('Wände und Räume lassen sich nicht duplizieren.');
};

app.deleteSelection = async () => {
  const sel = app.selection;
  if (!sel.length) return;
  const lv = app.level;
  if (sel.some((s) => s.kind === 'room')) {
    const ok = await ui.confirm('Raum löschen?', 'Die Wände des Raums, die an keinen anderen Raum grenzen, werden entfernt. Möbel bleiben stehen.', 'Raum löschen', true);
    if (!ok) return;
  }
  app.mutate(() => {
    const wallIds = new Set();
    for (const s of sel) {
      if (s.kind === 'item') lv.items = lv.items.filter((x) => x.id !== s.id);
      else if (s.kind === 'opening') lv.openings = lv.openings.filter((x) => x.id !== s.id);
      else if (s.kind === 'label') lv.labels = lv.labels.filter((x) => x.id !== s.id);
      else if (s.kind === 'dim') lv.dims = lv.dims.filter((x) => x.id !== s.id);
      else if (s.kind === 'wall') wallIds.add(s.id);
      else if (s.kind === 'room') deleteRoom(lv, s.id);
    }
    if (wallIds.size) removeWalls(lv, wallIds);
  });
  app.select([]);
};

app.rotateSelection = (deg) => {
  const items = app.selection.filter((s) => s.kind === 'item');
  if (!items.length) return;
  const lv = app.level;
  app.mutate(() => {
    for (const s of items) {
      const it = lv.items.find((x) => x.id === s.id);
      if (it) it.rot = r2(normDeg((it.rot || 0) + deg));
    }
  }, 'rot:' + items.map((s) => s.id).join());
};

function nudge(dx, dy) {
  const lv = app.level;
  const sel = app.selection.filter((s) => s.kind === 'item' || s.kind === 'label');
  if (!sel.length) return false;
  app.mutate(() => {
    for (const s of sel) {
      const o = s.kind === 'item' ? lv.items.find((x) => x.id === s.id) : lv.labels.find((x) => x.id === s.id);
      if (o) { o.x = r2(o.x + dx); o.y = r2(o.y + dy); }
    }
  }, 'nudge:' + sel.map((s) => s.id).join());
  return true;
}

app.placeDefault = (kind, type) => {
  if (app.viewMode === '3d' && view3d) {
    const c = view3d.targetPlan();
    if (kind === 'opening') return app.placeOpeningNear(type, c);
    const lv = app.level;
    const def = ITEMS[type];
    const it = { type, w: def.w, d: def.d, h: def.h, elev: def.elev || 0, rot: 0, color: def.color || null, color2: def.color2 || null, flip: false, id: uid('it_'), x: r2(c.x), y: r2(c.y) };
    if (def.mount === 'ceiling') it.elev = Math.max(0, lv.height - it.h);
    if (def.custom) it.elev = lv.height;
    app.mutate(() => lv.items.push(it));
    app.select([{ kind: 'item', id: it.id }]);
    return true;
  }
  return plan.placeDefault(kind, type);
};

app.placeOpeningNear = (type, w) => {
  const lv = app.level;
  const nw = nearestWall(lv, w, 400);
  if (!nw) {
    ui.toast('Zuerst Wände zeichnen, dann Türen und Fenster platzieren.');
    return false;
  }
  const def = OPENINGS[type];
  const o = { id: uid('op_'), wallId: nw.info.id, type, offset: nw.u, width: def.w, height: def.h, sill: def.sill, flip: false, swing: nw.side < 0, color: def.color };
  const fr = openingFrame(lv, o);
  if (fr) o.offset = fr.u;
  app.mutate(() => lv.openings.push(o));
  app.select([{ kind: 'opening', id: o.id }]);
  return true;
};

// ------------------------------------------------------------------ projects
function openProject(p) {
  app.project = p;
  const lv = sortedLevels(p).reduce((best, l) => (Math.abs(l.elevation) < Math.abs(best.elevation) ? l : best), p.levels[0]);
  app.levelId = lv.id;
  app.selection = [];
  undoStack.length = 0;
  redoStack.length = 0;
  lastKey = null;
  invalidateDerived();
  const used = new Set(p.levels.map((l) => l.background && l.background.asset).filter(Boolean));
  p.assets = p.assets || {};
  for (const k of Object.keys(p.assets)) if (!used.has(k)) delete p.assets[k];
  app.tool = 'select';
  plan.toolChanged('select');
  plan.render();
  requestAnimationFrame(() => plan.fitHouse());
  if (view3d) {
    view3d.sync();
    if (app.viewMode !== '2d') view3d.resetView();
    else app._needs3dReset = true;
  }
  lastWallCount = app.level.walls.length;
  ui.refresh();
  ui.renderProps(true);
  storage.scheduleSave();
}

function loadValid(raw) {
  const p = sanitizeProject(raw, ITEMS, OPENINGS);
  if (raw && typeof raw.id === 'string') p.id = raw.id;
  return p;
}

app.newProject = () => {
  storage.flush();
  openProject(createProject('Mein Haus'));
  app.setTool('room');
  ui.toast('Neues Projekt: Ziehe mit «Raum» deinen ersten Raum auf.');
};
app.openSample = () => {
  storage.flush();
  openProject(createSampleProject());
  ui.toast('Beispielhaus geöffnet.');
};
app.openEntry = async (entry) => {
  storage.flush();
  const raw = await storage.load(entry);
  if (!raw) {
    ui.toast('Das Projekt konnte nicht geladen werden.');
    return;
  }
  try {
    openProject(loadValid(raw));
  } catch (e) {
    ui.toast('Das Projekt ist beschädigt und konnte nicht geöffnet werden.');
  }
};

// ------------------------------------------------------------------ export / import
const slug = (s) => (s || 'grundriss')
  .toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'grundriss';

app.exportFile = async (kind) => {
  const base = slug(app.project.name);
  let result;
  try {
    if (kind === 'plan-png') {
      const blob = await plan.exportPngBlob(2);
      result = await storage.saveFile(`${base}-${slug(app.level.name)}.png`, blob);
    } else if (kind === 'plan-svg') {
      const { svg } = plan.exportSvgString();
      result = await storage.saveFile(`${base}-${slug(app.level.name)}.svg`, new Blob([svg], { type: 'image/svg+xml' }));
    } else if (kind === '3d-png') {
      if (!view3d) return ui.toast('3D ist in diesem Browser nicht verfügbar.');
      if (app.viewMode === '2d') {
        app.setView(window.innerWidth >= 1100 ? 'split' : '3d');
        await new Promise((r) => setTimeout(r, 300));
      }
      const blob = await view3d.exportPngBlob();
      result = await storage.saveFile(`${base}-3d.png`, blob);
    } else if (kind === 'json') {
      const json = JSON.stringify(app.project);
      result = await storage.saveFile(`${base}.json`, new Blob([json], { type: 'application/json' }));
    }
  } catch (e) {
    result = 'error';
  }
  if (result === 'saved') ui.toast('Datei gespeichert.');
  else if (result === 'unavailable') ui.toast('Downloads sind in dieser Ansicht nicht verfügbar.');
  else if (result === 'busy') ui.toast('Bitte kurz warten, ein Download läuft noch.');
  else if (result === 'error') ui.toast('Die Datei konnte nicht erstellt werden.');
};

$('file-json').addEventListener('change', async (e) => {
  const f = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    const raw = JSON.parse(await f.text());
    const p = sanitizeProject(raw, ITEMS, OPENINGS);
    p.id = uid('proj_');
    p.updatedAt = Date.now();
    storage.flush();
    openProject(p);
    ui.toast(`«${p.name}» importiert.`);
  } catch (err) {
    ui.toast('Diese Datei ist keine gültige Grundriss-Studio-Projektdatei (.json).');
  }
});

function readImage(file, maxSide = 2200) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.naturalWidth * k));
      c.height = Math.max(1, Math.round(img.naturalHeight * k));
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve({ url: c.toDataURL('image/jpeg', 0.85), w: c.width, h: c.height });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')); };
    img.src = url;
  });
}

$('file-image').addEventListener('change', async (e) => {
  const f = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    const im = await readImage(f);
    const id = uid('as_');
    app.project.assets[id] = im.url;
    const lv = app.level;
    const c = app.viewMode === '3d' && view3d ? view3d.targetPlan() : plan.worldCenter();
    const width = 1400;
    const aspect = im.h / im.w;
    app.mutate(() => {
      lv.background = { asset: id, x: r2(c.x - width / 2), y: r2(c.y - (width * aspect) / 2), width, opacity: 0.55, aspect, locked: false };
    });
    if (app.viewMode === '3d') app.setView('2d');
    app.setTool('calibrate');
    ui.toast('Vorlage geladen. Klicke zwei Punkte mit bekanntem Abstand an (z.B. die Enden einer bemassten Wand).');
  } catch (err) {
    ui.toast('Das Bild konnte nicht gelesen werden. Bitte PNG oder JPG verwenden.');
  }
});

// ------------------------------------------------------------------ keyboard
window.addEventListener('keydown', (e) => {
  const t = e.target;
  const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
  if (typing) return;
  if (document.querySelector('.backdrop')) return;
  if (view3d && view3d.walking && app.viewMode !== '2d') {
    if (view3d.onKey(e)) { e.preventDefault(); return; }
  }
  const k = e.key;
  const mod = e.ctrlKey || e.metaKey;
  if (mod) {
    const lk = k.toLowerCase();
    if (lk === 'z') { e.preventDefault(); if (e.shiftKey) app.redo(); else app.undo(); }
    else if (lk === 'y') { e.preventDefault(); app.redo(); }
    else if (lk === 'd') { e.preventDefault(); app.duplicate(); }
    else if (lk === 's') { e.preventDefault(); storage.flush(); ui.toast('Gespeichert.'); }
    return;
  }
  if (app.viewMode !== '3d' && plan.onKey(e)) { e.preventDefault(); return; }
  switch (k) {
    case 'Delete':
    case 'Backspace':
      if (app.selection.length) { e.preventDefault(); app.deleteSelection(); }
      break;
    case 'Escape':
      if (app.tool !== 'select') app.setTool('select');
      else if (app.selection.length) app.select([]);
      ui.closeSheets();
      break;
    case 'v': case 'V': app.setTool('select'); break;
    case 'w': case 'W': app.setTool('wall'); break;
    case 'r': case 'R': app.setTool('room'); break;
    case 'm': case 'M': app.setTool('measure'); break;
    case 't': case 'T': app.setTool('text'); break;
    case '1': app.setView('2d'); break;
    case '2': app.setView('3d'); break;
    case '3': app.setView('split'); break;
    case 'f': case 'F': plan.fit(); break;
    case 'q': case 'Q': app.rotateSelection(e.shiftKey ? -90 : -15); break;
    case 'e': case 'E': app.rotateSelection(e.shiftKey ? 90 : 15); break;
    case '+': case '=': plan.zoomBy(1.2); break;
    case '-': plan.zoomBy(1 / 1.2); break;
    case 'ArrowLeft': if (nudge(e.shiftKey ? -10 : -1, 0)) e.preventDefault(); break;
    case 'ArrowRight': if (nudge(e.shiftKey ? 10 : 1, 0)) e.preventDefault(); break;
    case 'ArrowUp': if (nudge(0, e.shiftKey ? -10 : -1)) e.preventDefault(); break;
    case 'ArrowDown': if (nudge(0, e.shiftKey ? 10 : 1)) e.preventDefault(); break;
    default:
  }
});
window.addEventListener('keyup', (e) => {
  plan && plan.onKeyUp(e);
  view3d && view3d.onKeyUp(e);
});
window.addEventListener('blur', () => view3d && ['w', 'a', 's', 'd', 'shift', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].forEach((k) => view3d.walkKey(k, false)));

// ------------------------------------------------------------------ boot
function boot() {
  storage = createStorage(app);
  app.storage = storage;
  ui = createUI(app);
  plan = createPlan2D(app, $('plan-host'));
  app.plan = plan;
  view3d = createView3D(app, $('view3d-host'));
  app.view3d = view3d;
  if (!view3d) {
    document.querySelectorAll('#view-switch [data-view="3d"], #view-switch [data-view="split"], [data-toggle-view]').forEach((b) => (b.disabled = true));
  }
  ui.renderCatalog();

  app.on('save-state', (s) => ui.setSaveState(s));
  app.on('cursor', (w) => ui.setCoords(w));
  app.on('zoom', (s) => ui.setZoom(s));
  app.on('cloud', () => ui.refresh());
  app.on('walk', (on) => {
    $('walk-hud').hidden = !on;
    $('dpad').hidden = !on || !window.matchMedia('(pointer: coarse)').matches;
    $('v3-walk').setAttribute('aria-pressed', String(on));
    ui.renderSelbar();
  });

  // 3D controls
  if (view3d) {
    $('v3-walk').addEventListener('click', () => (view3d.walking ? view3d.exitWalk() : view3d.enterWalk()));
    $('walk-exit').addEventListener('click', () => view3d.exitWalk());
    $('v3-top').addEventListener('click', () => view3d.topView());
    $('v3-reset').addEventListener('click', () => view3d.resetView());
    $('v3-levels').addEventListener('click', (e) => {
      view3d.setShowAll(!view3d.showAll);
      e.currentTarget.setAttribute('aria-pressed', String(view3d.showAll));
    });
    $('v3-doors').addEventListener('click', () => app.mutate(() => { app.project.settings.doorsOpen = !app.project.settings.doorsOpen; }));
    $('v3-photo').addEventListener('click', () => app.exportFile('3d-png'));
    for (const b of document.querySelectorAll('#dpad [data-k]')) {
      const key = b.dataset.k;
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.setPointerCapture(e.pointerId); view3d.walkKey(key, true); });
      const up = () => view3d.walkKey(key, false);
      b.addEventListener('pointerup', up);
      b.addEventListener('pointercancel', up);
      b.addEventListener('lostpointercapture', up);
    }
    const themeChanged = () => view3d.applyTheme();
    new MutationObserver(themeChanged).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', themeChanged);
  }

  let p = null;
  let firstRun = false;
  const last = storage.loadLast();
  if (last) {
    try { p = loadValid(last); } catch (e) { p = null; }
  }
  if (!p) {
    p = createSampleProject();
    firstRun = true;
  }
  let view = null;
  try { view = localStorage.getItem('gs.view'); } catch (e) { view = null; }
  if (!['2d', '3d', 'split'].includes(view)) view = window.innerWidth >= 1200 ? 'split' : '2d';
  if (window.innerWidth < 760 && view === 'split') view = '2d';
  openProject(p);
  app.setView(view);
  if (view !== '2d' && view3d) { app._seen3d = true; view3d.resetView(); }
  plan.toolChanged('select');
  if (firstRun) setTimeout(() => ui.toast('Willkommen! Das ist ein Beispielhaus. Unter «Projekte» startest du dein eigenes.'), 600);

  storage.initDownloads();
  storage.initCloud().then(async (ok) => {
    if (!ok) return;
    try {
      const list = await storage.listAll();
      const cur = list.find((x) => x.id === app.project.id);
      if (firstRun && list.length && !cur) {
        const newest = list[0];
        const raw = await storage.load(newest);
        if (raw) { openProject(loadValid(raw)); ui.toast(`«${newest.name}» aus deinem Konto geöffnet.`); return; }
      }
      if (cur && cur.cloudNewer) {
        const raw = await storage.cloudCopy(app.project.id);
        if (raw && raw.updatedAt > app.project.updatedAt + 1000) {
          openProject(loadValid(raw));
          ui.toast('Neuere Version aus deinem Konto geladen.');
          return;
        }
      }
      storage.scheduleSave();
    } catch (e) { /* cloud is optional */ }
  });

  window.addEventListener('pagehide', () => storage.flush());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') storage.flush(); });
  window.addEventListener('resize', () => plan.resized());
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
