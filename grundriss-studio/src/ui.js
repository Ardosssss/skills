// Grundriss Studio – user interface: tools, catalogue, properties, dialogs
import {
  escapeHtml, fmtArea, fmtArea2, fmtM, fmtCm, fmtNum, parseLength, clamp, r2, uid, dist, norm, sub, add, mul,
  normDeg, polygonArea,
} from './util.js';
import { ITEMS, OPENINGS, CATEGORIES, searchCatalog, isDoorKind } from './catalog.js';
import { FLOORS, FLOOR_BY_ID, WALL_COLORS, ITEM_COLORS, WALL_TEXTURES, floorDataUrl } from './textures.js';
import {
  getDerived, ROOM_NAMES, ROOM_FLOOR_HINT, levelStats, sortedLevels, endsAt, normalizeWalls, openingFrame,
  faceOfRoom, deleteRoom, removeWalls, splitWallAtPoint, addLevel,
} from './model.js';

const GROUND_COLORS = ['#a9b78f', '#8da26c', '#7b8f5c', '#c6c0ac', '#b4afa4', '#d9d3c4', '#9c9a93', '#6f7f63'];
const TOOLS = [
  { id: 'select', icon: 'i-select', label: 'Wählen', key: 'V' },
  { id: 'wall', icon: 'i-wall', label: 'Wand', key: 'W' },
  { id: 'room', icon: 'i-room', label: 'Raum', key: 'R' },
  { id: 'measure', icon: 'i-measure', label: 'Messen', key: 'M' },
  { id: 'text', icon: 'i-text', label: 'Text', key: 'T' },
  { id: 'image', icon: 'i-image', label: 'Vorlage', key: '' },
];

const icon = (id) => `<svg class="i"><use href="#${id}"/></svg>`;
const shortLevel = (name) => {
  const map = { Erdgeschoss: 'EG', Obergeschoss: 'OG', Dachgeschoss: 'DG', Untergeschoss: 'UG', Keller: 'UG', Attika: 'AT' };
  if (map[name]) return map[name];
  const m = name.match(/^(\d+)\.\s*(\w)/);
  if (m) return m[1] + '.' + m[2].toUpperCase() + 'G';
  return name.slice(0, 3);
};

export function createUI(app) {
  const $ = (id) => document.getElementById(id);
  const el = {
    tools: $('tools'), catTabs: $('cat-tabs'), catGrid: $('cat-grid'), catSearch: $('cat-search'), props: $('props'),
    hint: $('hint'), coords: $('coords'), levels: $('levels'), viewSwitch: $('view-switch'), projectName: $('project-name'),
    saveState: $('save-state'), toasts: $('toasts'), selbar: $('selbar'), libPanel: $('lib-panel'), propsPanel: $('props-panel'),
    backdrop: $('sheet-backdrop'), mobilebar: $('mobilebar'), zoomVal: $('zoom-val'), undo: $('btn-undo'), redo: $('btn-redo'),
    stageEmpty: $('stage-empty'), propsTitle: $('props-title'),
  };
  const thumbs = new Map();
  let category = 'living';
  let query = '';

  // ------------------------------------------------------------------ tools
  el.tools.innerHTML = TOOLS.map((t) =>
    `<button class="tool" data-tool="${t.id}" title="${t.label}${t.key ? ' (' + t.key + ')' : ''}" aria-pressed="false">${icon(t.icon)}<span>${t.label}</span></button>`).join('');
  el.tools.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tool]');
    if (!b) return;
    if (b.dataset.tool === 'image') return imageTool();
    app.setTool(b.dataset.tool);
  });
  function imageTool() {
    const lv = app.level;
    if (lv.background) {
      app.select([]);
      openSheet('props');
      focusField('bg-opacity');
      toast('Plan-Vorlage: Einstellungen in der Übersicht rechts.');
    } else $('file-image').click();
  }
  function syncTools() {
    for (const b of el.tools.querySelectorAll('[data-tool]')) b.setAttribute('aria-pressed', String(b.dataset.tool === app.tool));
    for (const b of el.mobilebar.querySelectorAll('[data-tool]')) b.setAttribute('aria-pressed', String(b.dataset.tool === app.tool));
  }

  // ------------------------------------------------------------------ catalogue
  el.catTabs.innerHTML = CATEGORIES.map((c) => `<button class="cat-tab" data-cat="${c.id}" aria-pressed="false">${c.name}</button>`).join('');
  el.catTabs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    category = b.dataset.cat;
    query = '';
    el.catSearch.value = '';
    renderCatalog();
  });
  el.catSearch.addEventListener('input', () => {
    query = el.catSearch.value;
    renderCatalog();
  });

  function entriesFor() {
    if (query.trim()) return searchCatalog(query);
    const out = [];
    for (const [id, def] of Object.entries(ITEMS)) if (def.cat === category) out.push({ kind: 'item', id, def });
    for (const [id, def] of Object.entries(OPENINGS)) if (def.cat === category) out.push({ kind: 'opening', id, def });
    return out;
  }

  function thumbImg(kind, type) {
    const key = kind + ':' + type;
    const src = thumbs.get(key);
    return src ? `<img alt="" src="${src}">` : `<span class="ph" data-thumb="${key}"></span>`;
  }

  function requestThumbs(root) {
    if (!app.view3d) return;
    for (const ph of root.querySelectorAll('[data-thumb]')) {
      const key = ph.getAttribute('data-thumb');
      const [kind, type] = key.split(':');
      if (thumbs.has(key)) continue;
      app.view3d.queueThumb(kind, type, (src) => {
        if (!src) return;
        thumbs.set(key, src);
        document.querySelectorAll(`[data-thumb="${key}"]`).forEach((n) => {
          const img = document.createElement('img');
          img.alt = '';
          img.src = src;
          n.replaceWith(img);
        });
      });
    }
  }

  function renderCatalog() {
    for (const b of el.catTabs.querySelectorAll('[data-cat]')) b.setAttribute('aria-pressed', String(!query.trim() && b.dataset.cat === category));
    const list = entriesFor();
    if (!list.length) {
      el.catGrid.innerHTML = `<div class="cat-empty">Nichts gefunden für «${escapeHtml(query)}».</div>`;
      return;
    }
    el.catGrid.innerHTML = list.map(({ kind, id, def }) => {
      const dims = kind === 'item' ? `${def.w} × ${def.d} × ${def.h}` : `${def.w} × ${def.h}${def.sill ? ' · Brüstung ' + def.sill : ''}`;
      return `<button class="card" data-kind="${kind}" data-type="${id}" title="${escapeHtml(def.name)} – klicken oder in den Plan ziehen"><span class="thumb">${thumbImg(kind, id)}</span><span class="c-name">${escapeHtml(def.name)}</span><span class="c-dim">${dims} cm</span></button>`;
    }).join('');
    requestThumbs(el.catGrid);
  }

  // drag & drop from catalogue (mouse / pen); touch uses tap to place
  let catDrag = null;
  el.catGrid.addEventListener('pointerdown', (e) => {
    const card = e.target.closest('.card');
    if (!card || e.button !== 0) return;
    catDrag = { card, kind: card.dataset.kind, type: card.dataset.type, x: e.clientX, y: e.clientY, id: e.pointerId, active: false, touch: e.pointerType === 'touch' };
  });
  window.addEventListener('pointermove', (e) => {
    if (!catDrag || e.pointerId !== catDrag.id || catDrag.touch) return;
    if (!catDrag.active) {
      if (Math.hypot(e.clientX - catDrag.x, e.clientY - catDrag.y) < 6) return;
      catDrag.active = true;
      document.body.classList.add('dragging-item');
      const g = document.createElement('div');
      g.className = 'drag-ghost';
      const src = thumbs.get(catDrag.kind + ':' + catDrag.type);
      g.innerHTML = src ? `<img alt="" src="${src}">` : '';
      document.body.appendChild(g);
      catDrag.ghost = g;
    }
    catDrag.ghost.style.left = e.clientX + 'px';
    catDrag.ghost.style.top = e.clientY + 'px';
    const over = document.elementFromPoint(e.clientX, e.clientY);
    const onPlan = over && app.plan && app.plan.el.contains(over);
    catDrag.ghost.style.opacity = onPlan ? '0' : '1';
    if (onPlan) app.plan.placementPreview(catDrag.kind, catDrag.type, e.clientX, e.clientY);
    else app.plan && app.plan.clearPlacement();
  });
  const endCatDrag = (e) => {
    if (!catDrag || e.pointerId !== catDrag.id) return;
    const d = catDrag;
    catDrag = null;
    document.body.classList.remove('dragging-item');
    if (d.ghost) d.ghost.remove();
    if (!d.active) return;
    app.plan && app.plan.clearPlacement();
    if (e.type === 'pointercancel') return;
    const over = document.elementFromPoint(e.clientX, e.clientY);
    if (over && app.plan && app.plan.el.contains(over)) app.plan.placeAt(d.kind, d.type, e.clientX, e.clientY);
    else if (over && app.view3d && app.view3d.el.contains(over)) app.view3d.placeAt(d.kind, d.type, e.clientX, e.clientY);
    d.card.dataset.suppressClick = '1';
    setTimeout(() => delete d.card.dataset.suppressClick, 50);
  };
  window.addEventListener('pointerup', endCatDrag);
  window.addEventListener('pointercancel', endCatDrag);
  el.catGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card || card.dataset.suppressClick) return;
    if (app.placeDefault(card.dataset.kind, card.dataset.type)) closeSheets();
  });

  // ------------------------------------------------------------------ top bar
  el.projectName.addEventListener('change', () => {
    const v = el.projectName.value.trim() || 'Unbenanntes Projekt';
    app.mutate(() => { app.project.name = v.slice(0, 120); }, 'pname');
  });
  el.projectName.addEventListener('keydown', (e) => { if (e.key === 'Enter') el.projectName.blur(); });
  el.undo.addEventListener('click', () => app.undo());
  el.redo.addEventListener('click', () => app.redo());
  el.viewSwitch.addEventListener('click', (e) => {
    const b = e.target.closest('[data-view]');
    if (b) app.setView(b.dataset.view);
  });
  el.levels.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.add) return addLevelDialog();
    app.setLevel(b.dataset.level);
  });
  $('btn-projects').addEventListener('click', () => projectsDialog());
  $('btn-export').addEventListener('click', (e) => openMenu(e.currentTarget, exportItems()));
  $('btn-more').addEventListener('click', (e) => openMenu(e.currentTarget, moreItems()));
  $('zoom-in').addEventListener('click', () => app.plan.zoomBy(1.25));
  $('zoom-out').addEventListener('click', () => app.plan.zoomBy(0.8));
  $('zoom-fit').addEventListener('click', () => app.plan.fit());

  function exportItems() {
    const can = app.storage.canDownload;
    const items = [
      { icon: 'i-2d', label: 'Grundriss als Bild (PNG)', act: () => app.exportFile('plan-png') },
      { icon: 'i-pencil', label: 'Grundriss als Vektor (SVG)', act: () => app.exportFile('plan-svg') },
      { icon: 'i-camera', label: '3D-Ansicht als Bild (PNG)', act: () => app.exportFile('3d-png') },
      { sep: true },
      { icon: 'i-download', label: 'Projektdatei sichern (.json)', act: () => app.exportFile('json') },
      { icon: 'i-upload', label: 'Projektdatei importieren', act: () => $('file-json').click() },
    ];
    if (!can) items.unshift({ label: 'Downloads sind in dieser Ansicht nicht verfügbar.', disabled: true });
    return items;
  }
  function moreItems() {
    const items = [
      { icon: 'i-help', label: 'Anleitung & Tastenkürzel', act: () => helpDialog() },
      { icon: 'i-image', label: app.level.background ? 'Plan-Vorlage bearbeiten' : 'Plan-Vorlage (Bild) laden', act: () => imageTool() },
      { sep: true },
    ];
    if (window.matchMedia('(max-width: 760px)').matches) {
      for (const lv of sortedLevels(app.project)) items.push({ icon: 'i-layers', label: (lv === app.level ? '✓ ' : '') + lv.name, act: () => app.setLevel(lv.id) });
      items.push({ icon: 'i-plus', label: 'Geschoss hinzufügen', act: () => addLevelDialog() });
      items.push({ sep: true });
      items.push(...exportItems());
    } else {
      items.push({ icon: 'i-plus', label: 'Geschoss hinzufügen', act: () => addLevelDialog() });
    }
    return items;
  }

  // ------------------------------------------------------------------ status bar
  const opt = (id, key) => {
    const c = $(id);
    c.addEventListener('change', () => app.mutate(() => { app.project.settings[key] = c.checked; }, 'opt:' + key));
    return c;
  };
  const opts = { snap: opt('opt-snap', 'snap'), magnet: opt('opt-magnet', 'magnet'), showDims: opt('opt-dims', 'showDims'), showGrid: opt('opt-grid', 'showGrid') };

  // ------------------------------------------------------------------ mobile bar & sheets
  el.mobilebar.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.tool) { app.setTool(b.dataset.tool); closeSheets(); }
    else if (b.dataset.sheet) toggleSheet(b.dataset.sheet);
    else if (b.hasAttribute('data-toggle-view')) { closeSheets(); app.setView(app.viewMode === '3d' ? '2d' : '3d'); }
  });
  document.querySelectorAll('[data-close-sheet]').forEach((b) => b.addEventListener('click', closeSheets));
  el.backdrop.addEventListener('click', closeSheets);
  function openSheet(which) {
    const p = which === 'lib' ? el.libPanel : el.propsPanel;
    const other = which === 'lib' ? el.propsPanel : el.libPanel;
    other.classList.remove('open');
    p.classList.add('open');
    if (window.matchMedia('(max-width: 760px)').matches) el.backdrop.hidden = false;
    for (const b of el.mobilebar.querySelectorAll('[data-sheet]')) b.setAttribute('aria-pressed', String(b.dataset.sheet === which));
  }
  function closeSheets() {
    el.libPanel.classList.remove('open');
    el.propsPanel.classList.remove('open');
    el.backdrop.hidden = true;
    for (const b of el.mobilebar.querySelectorAll('[data-sheet]')) b.setAttribute('aria-pressed', 'false');
  }
  function toggleSheet(which) {
    const p = which === 'lib' ? el.libPanel : el.propsPanel;
    if (p.classList.contains('open')) closeSheets();
    else openSheet(which);
  }

  // ------------------------------------------------------------------ menus
  let menuEl = null;
  function closeMenu() {
    if (menuEl) { menuEl.remove(); menuEl = null; }
  }
  function openMenu(anchor, items) {
    closeMenu();
    const m = document.createElement('div');
    m.className = 'menu';
    m.setAttribute('role', 'menu');
    m.innerHTML = items.map((it, i) => it.sep ? '<hr>' : `<button role="menuitem" data-i="${i}" ${it.disabled ? 'disabled' : ''}>${it.icon ? icon(it.icon) : ''}<span>${escapeHtml(it.label)}</span></button>`).join('');
    document.body.appendChild(m);
    const r = anchor.getBoundingClientRect();
    const mw = m.offsetWidth, mh = m.offsetHeight;
    m.style.left = clamp(r.right - mw, 8, window.innerWidth - mw - 8) + 'px';
    m.style.top = (r.bottom + 6 + mh > window.innerHeight ? Math.max(8, r.top - mh - 6) : r.bottom + 6) + 'px';
    m.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]');
      if (!b) return;
      const it = items[+b.dataset.i];
      closeMenu();
      it.act && it.act();
    });
    menuEl = m;
    setTimeout(() => {
      const off = (e) => {
        if (menuEl && !menuEl.contains(e.target)) { closeMenu(); document.removeEventListener('pointerdown', off, true); }
      };
      document.addEventListener('pointerdown', off, true);
    });
    m.querySelector('button:not([disabled])')?.focus();
  }

  // ------------------------------------------------------------------ dialogs
  function openDialog(html, bind) {
    const bd = document.createElement('div');
    bd.className = 'backdrop';
    bd.innerHTML = `<div class="dialog" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(bd);
    const dlg = bd.firstElementChild;
    const close = () => { bd.remove(); document.removeEventListener('keydown', onKey, true); };
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    document.addEventListener('keydown', onKey, true);
    bd.addEventListener('pointerdown', (e) => { if (e.target === bd) close(); });
    bind && bind(dlg, close);
    (dlg.querySelector('[autofocus]') || dlg.querySelector('input,button'))?.focus();
    return { el: dlg, close };
  }

  function confirmDialog(title, text, okLabel = 'OK', danger = false) {
    return new Promise((res) => {
      let done = false;
      const d = openDialog(`<h2>${escapeHtml(title)}</h2><p class="lead">${escapeHtml(text)}</p><div class="actions"><button class="btn" data-no>Abbrechen</button><button class="btn ${danger ? 'primary' : 'primary'}" data-yes autofocus>${escapeHtml(okLabel)}</button></div>`, (dlg, close) => {
        dlg.querySelector('[data-no]').onclick = () => { done = true; close(); res(false); };
        dlg.querySelector('[data-yes]').onclick = () => { done = true; close(); res(true); };
      });
      const obs = new MutationObserver(() => { if (!document.body.contains(d.el)) { obs.disconnect(); if (!done) res(false); } });
      obs.observe(document.body, { childList: true });
    });
  }

  function askLength(question, placeholder) {
    return new Promise((res) => {
      let done = false;
      const d = openDialog(`<h2>${escapeHtml(question)}</h2><p class="lead">Zum Beispiel «4.50 m» oder «450». Gemessen: ${escapeHtml(placeholder || '')}</p>
        <label class="f"><span class="f-l">Echte Länge</span><span class="num"><input id="ask-len" inputmode="decimal" autofocus placeholder="z.B. 4.50 m"><span class="u">m / cm</span></span></label>
        <div class="actions"><button class="btn" data-no>Abbrechen</button><button class="btn primary" data-yes>Übernehmen</button></div>`, (dlg, close) => {
        const inp = dlg.querySelector('#ask-len');
        const ok = () => {
          const v = parseLength(inp.value);
          if (!(v > 0)) { inp.focus(); return; }
          done = true; close(); res(v);
        };
        dlg.querySelector('[data-yes]').onclick = ok;
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok(); });
        dlg.querySelector('[data-no]').onclick = () => { done = true; close(); res(null); };
      });
      const obs = new MutationObserver(() => { if (!document.body.contains(d.el)) { obs.disconnect(); if (!done) res(null); } });
      obs.observe(document.body, { childList: true });
    });
  }

  async function projectsDialog() {
    const fmtDate = (t) => new Date(t).toLocaleString('de-CH', { dateStyle: 'medium', timeStyle: 'short' });
    const d = openDialog(`<h2>Projekte</h2><p class="lead">${app.storage.cloud ? 'Deine Projekte werden in deinem Konto gespeichert und zusätzlich in diesem Browser.' : 'Deine Projekte werden in diesem Browser gespeichert. Sichere wichtige Pläne zusätzlich als Projektdatei.'}</p>
      <div class="row"><button class="btn primary" data-new>${icon('i-plus')}Neues Projekt</button><button class="btn" data-sample>${icon('i-room')}Beispielhaus</button><button class="btn" data-import>${icon('i-upload')}Datei importieren</button></div>
      <div class="plist" id="plist"><p class="note">Lade Projekte …</p></div>
      <div class="actions"><button class="btn" data-close>Schliessen</button></div>`, (dlg, close) => {
      dlg.querySelector('[data-close]').onclick = close;
      dlg.querySelector('[data-new]').onclick = () => { close(); app.newProject(); };
      dlg.querySelector('[data-sample]').onclick = () => { close(); app.openSample(); };
      dlg.querySelector('[data-import]').onclick = () => { close(); $('file-json').click(); };
    });
    const list = await app.storage.listAll();
    const box = d.el.querySelector('#plist');
    if (!box) return;
    if (!list.length) { box.innerHTML = '<p class="note">Noch keine gespeicherten Projekte.</p>'; return; }
    box.innerHTML = list.map((p) => `<div class="prow${p.id === app.project.id ? ' cur' : ''}" data-id="${escapeHtml(p.id)}">
      <div><b>${escapeHtml(p.name)}</b><small>${fmtDate(p.updatedAt)} · ${p.levels || 1} Geschoss${(p.levels || 1) > 1 ? 'e' : ''}${p.cloud ? ' · Konto' : ''}${p.local ? ' · Browser' : ''}${p.id === app.project.id ? ' · geöffnet' : ''}</small></div>
      <div class="row"><button class="btn" data-open>Öffnen</button><button class="btn icon danger" data-del aria-label="Löschen" title="Löschen">${icon('i-trash')}</button></div></div>`).join('');
    box.addEventListener('click', async (e) => {
      const row = e.target.closest('.prow');
      if (!row) return;
      const entry = list.find((x) => x.id === row.dataset.id);
      if (e.target.closest('[data-open]')) {
        d.close();
        app.openEntry(entry);
      } else if (e.target.closest('[data-del]')) {
        const b = e.target.closest('[data-del]');
        if (!b.dataset.armed) {
          b.dataset.armed = '1';
          b.classList.remove('icon');
          b.textContent = 'Wirklich löschen?';
          setTimeout(() => { if (document.body.contains(b)) { delete b.dataset.armed; b.classList.add('icon'); b.innerHTML = icon('i-trash'); } }, 3500);
          return;
        }
        await app.storage.remove(entry.id);
        row.remove();
        if (entry.id === app.project.id) toast('Das geöffnete Projekt bleibt offen, bis du ein anderes wählst.');
      }
    });
  }

  function helpDialog() {
    openDialog(`<h2>So planst du dein Haus</h2>
      <ol class="steps">
        <li><b>Räume zeichnen:</b> Werkzeug «Raum» wählen und Rechtecke aufziehen, oder mit «Wand» Punkt für Punkt zeichnen. Länge eintippen + Enter setzt exakte Masse. Geschlossene Wände ergeben automatisch einen Raum mit Fläche.</li>
        <li><b>Türen & Fenster:</b> im Katalog unter «Türen» oder «Fenster» auf eine Wand ziehen. Abstände zu den Ecken siehst du beim Verschieben.</li>
        <li><b>Einrichten:</b> Möbel in den Plan ziehen. Mit «Magnet» richten sie sich an Wänden aus. Drehen am runden Griff, Grösse an den Ecken.</li>
        <li><b>Räume gestalten:</b> Raum anklicken und rechts Name, Boden und Wandfarbe wählen.</li>
        <li><b>3D & Rundgang:</b> oben «3D» oder «Beides» wählen, dann «Rundgang» für die Ego-Perspektive.</li>
        <li><b>Eigener Plan als Vorlage:</b> Bild vom Grundriss laden, Massstab mit zwei Punkten festlegen und Wände nachzeichnen.</li>
      </ol>
      <h2 style="margin-top:16px;font-size:16px">Tastenkürzel</h2>
      <div class="keys">
        <kbd>V W R M T</kbd><span>Wählen, Wand, Raum, Messen, Text</span>
        <kbd>Ctrl Z / Ctrl ⇧ Z</kbd><span>Rückgängig / Wiederholen</span>
        <kbd>Entf</kbd><span>Auswahl löschen</span>
        <kbd>Ctrl D</kbd><span>Duplizieren</span>
        <kbd>Q / E</kbd><span>Drehen um 15° (mit ⇧ 90°)</span>
        <kbd>Pfeiltasten</kbd><span>Verschieben um 1 cm (mit ⇧ 10 cm)</span>
        <kbd>1 / 2 / 3</kbd><span>2D, 3D, beides</span>
        <kbd>F</kbd><span>Ganzen Plan zeigen</span>
        <kbd>Leertaste + Ziehen</kbd><span>Ansicht verschieben</span>
        <kbd>Alt</kbd><span>Einrasten kurz ausschalten</span>
        <kbd>Esc</kbd><span>Abbrechen / Wand beenden</span>
      </div>
      <div class="actions"><button class="btn primary" data-close autofocus>Los geht's</button></div>`, (dlg, close) => { dlg.querySelector('[data-close]').onclick = close; });
  }

  function addLevelDialog() {
    openDialog(`<h2>Geschoss hinzufügen</h2><p class="lead">Das neue Geschoss kann die Aussenwände von «${escapeHtml(app.level.name)}» übernehmen. Innenwände zeichnest du danach selbst.</p>
      <div class="plist">
        <button class="prow" data-mode="above-copy" style="text-align:left"><div><b>Obergeschoss mit Aussenwänden</b><small>Empfohlen für Einfamilienhäuser</small></div>${icon('i-up')}</button>
        <button class="prow" data-mode="above" style="text-align:left"><div><b>Leeres Obergeschoss</b><small>Zum Beispiel für ein Dachgeschoss</small></div>${icon('i-up')}</button>
        <button class="prow" data-mode="below-copy" style="text-align:left"><div><b>Untergeschoss / Keller</b><small>Unter dem untersten Geschoss, mit Aussenwänden</small></div>${icon('i-down')}</button>
      </div>
      <div class="actions"><button class="btn" data-close>Abbrechen</button></div>`, (dlg, close) => {
      dlg.querySelector('[data-close]').onclick = close;
      dlg.querySelectorAll('[data-mode]').forEach((b) => (b.onclick = () => {
        const mode = b.dataset.mode;
        let lv;
        app.mutate(() => { lv = addLevel(app.project, app.level, mode.endsWith('copy'), mode.startsWith('below')); });
        close();
        app.setLevel(lv.id);
        toast(`«${lv.name}» angelegt.`);
      }));
    });
  }

  // ------------------------------------------------------------------ toasts, hint
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    el.toasts.appendChild(t);
    setTimeout(() => t.remove(), 3800);
    while (el.toasts.children.length > 3) el.toasts.firstChild.remove();
  }
  function setHint(text) {
    el.hint.textContent = text || '';
  }
  const SAVE_LABEL = {
    idle: 'Bereit', pending: 'Ungespeichert', saving: 'Speichert …', cloud: 'Im Konto gespeichert', local: 'Im Browser gespeichert',
    'local-partial': 'Gespeichert (ohne Vorlage)', 'error-local': 'Speicher voll', 'error-cloud': 'Konto-Speicherung fehlgeschlagen', 'error-size': 'Projekt zu gross für Konto',
  };
  function setSaveState(s) {
    el.saveState.dataset.state = s;
    el.saveState.textContent = SAVE_LABEL[s] || s;
  }

  // ------------------------------------------------------------------ properties
  let handlers = { fields: {}, acts: {} };
  let propsDirty = false;
  let lastPropsKey = '';

  const num = (field, label, value, unit, extra = '') =>
    `<label class="f"><span class="f-l">${label}</span><span class="num"><input id="pf-${field}" data-field="${field}" inputmode="decimal" value="${escapeHtml(value)}" ${extra}><span class="u">${unit}</span></span></label>`;
  const text = (field, label, value, extra = '') =>
    `<label class="f"><span class="f-l">${label}</span><input class="txt" id="pf-${field}" data-field="${field}" value="${escapeHtml(value)}" ${extra}></label>`;
  const check = (field, label, on) => `<label class="check"><input type="checkbox" id="pf-${field}" data-field="${field}" ${on ? 'checked' : ''}>${label}</label>`;
  const btn = (act, label, ic = '', cls = '', extra = '') => `<button class="btn ${cls}" data-act="${act}" ${extra}>${ic ? icon(ic) : ''}${label}</button>`;
  const swatches = (field, value, colors) => {
    const v = (value || '').toLowerCase();
    return `<div class="sw-row">${colors.map((c) => `<button class="sw" style="--c:${c}" data-sw="${field}" data-c="${c}" aria-label="Farbe ${c}" aria-pressed="${c.toLowerCase() === v}"></button>`).join('')}<input type="color" id="pf-${field}" data-field="${field}" value="${/^#[0-9a-f]{6}$/i.test(value || '') ? value : '#cccccc'}" aria-label="Eigene Farbe"></div>`;
  };
  const sec = (title, body, extra = '') => `<div class="sec"><div class="sec-t"><span>${title}</span>${extra}</div>${body}</div>`;
  const fmt0 = (v) => fmtNum(Math.round(v * 10) / 10, 1);

  function parseNum(v) {
    const n = parseFloat(String(v).replace(',', '.').replace(/[^\d.\-]/g, ''));
    return Number.isFinite(n) ? n : NaN;
  }

  el.props.addEventListener('change', (e) => {
    const t = e.target;
    const f = t.dataset && t.dataset.field;
    if (!f || !handlers.fields[f]) return;
    const val = t.type === 'checkbox' ? t.checked : t.value;
    handlers.fields[f](val, t);
  });
  el.props.addEventListener('input', (e) => {
    const t = e.target;
    if (t.type === 'color' || t.type === 'range') {
      const f = t.dataset.field;
      if (f && handlers.fields[f]) handlers.fields[f](t.value, t, true);
    }
  });
  el.props.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input[data-field]')) e.target.blur();
  });
  el.props.addEventListener('click', (e) => {
    const sw = e.target.closest('[data-sw]');
    if (sw) {
      const f = sw.dataset.sw;
      handlers.fields[f] && handlers.fields[f](sw.dataset.c, sw);
      return;
    }
    const a = e.target.closest('[data-act]');
    if (a && handlers.acts[a.dataset.act]) handlers.acts[a.dataset.act](a);
  });
  el.props.addEventListener('focusout', () => {
    setTimeout(() => {
      if (propsDirty && !el.props.contains(document.activeElement)) renderProps(true);
    }, 0);
  });

  function renderProps(force) {
    const active = document.activeElement;
    if (!force && active && el.props.contains(active) && active.matches('input[type=text],input:not([type]),input[inputmode],textarea')) {
      propsDirty = true;
      return;
    }
    propsDirty = false;
    handlers = { fields: {}, acts: {} };
    const sel = app.selection;
    const lv = app.level;
    let html = '';
    let title = 'Übersicht';
    if (sel.length > 1) { html = multiPanel(sel); title = 'Auswahl'; }
    else if (sel.length === 1) {
      const s = sel[0];
      if (s.kind === 'item') { const it = lv.items.find((x) => x.id === s.id); if (it) { html = itemPanel(it); title = ITEMS[it.type]?.name || 'Objekt'; } }
      else if (s.kind === 'opening') { const o = lv.openings.find((x) => x.id === s.id); if (o) { html = openingPanel(o); title = OPENINGS[o.type]?.name || 'Öffnung'; } }
      else if (s.kind === 'wall') { const w = lv.walls.find((x) => x.id === s.id); if (w) { html = wallPanel(w); title = 'Wand'; } }
      else if (s.kind === 'room') { const r = lv.rooms.find((x) => x.id === s.id); if (r) { html = roomPanel(r); title = r.name || 'Raum'; } }
      else if (s.kind === 'label') { const l = lv.labels.find((x) => x.id === s.id); if (l) { html = labelPanel(l); title = 'Text'; } }
      else if (s.kind === 'dim') { const dm = lv.dims.find((x) => x.id === s.id); if (dm) { html = dimPanel(dm); title = 'Masslinie'; } }
    }
    if (!html) html = overviewPanel();
    el.props.innerHTML = html;
    el.propsTitle.textContent = title;
    requestThumbs(el.props);
    renderSelbar();
  }

  function mut(fn, key) {
    app.mutate(fn, key);
  }

  // --- item
  function itemPanel(it) {
    const def = ITEMS[it.type];
    const lv = app.level;
    const cat = CATEGORIES.find((c) => c.id === def.cat);
    const F = handlers.fields, A = handlers.acts;
    const setDim = (k, min, max) => (v) => {
      const n = parseLength(v);
      if (!(n > 0)) return renderProps(true);
      mut(() => { it[k] = r2(clamp(n, min, max)); }, 'p:' + it.id + k);
    };
    F.w = setDim('w', 1, 5000);
    F.d = setDim('d', 1, 5000);
    F.h = setDim('h', 0.5, 3000);
    F.rot = (v) => { const n = parseNum(v); if (Number.isFinite(n)) mut(() => { it.rot = r2(normDeg(n)); }, 'p:' + it.id + 'rot'); else renderProps(true); };
    F.elev = (v) => { const n = parseLength(v); if (Number.isFinite(n)) mut(() => { it.elev = r2(clamp(n, -500, 3000)); }, 'p:' + it.id + 'elev'); else renderProps(true); };
    F.color = (v) => mut(() => { it.color = v; }, 'p:' + it.id + 'color');
    F.color2 = (v) => mut(() => { it.color2 = v; }, 'p:' + it.id + 'color2');
    A.rotL = () => mut(() => { it.rot = normDeg((it.rot || 0) - 90); });
    A.rotR = () => mut(() => { it.rot = normDeg((it.rot || 0) + 90); });
    A.flip = () => mut(() => { it.flip = !it.flip; });
    A.dup = () => app.duplicate();
    A.del = () => app.deleteSelection();
    A.ceil = () => mut(() => { it.elev = Math.max(0, lv.height - it.h); });
    A.floor = () => mut(() => { it.elev = 0; });
    A.wallTop = () => mut(() => { it.elev = lv.height; });
    let elevHelp = '';
    if (def.custom) elevHelp = `<div class="row">${btn('wallTop', 'Auf Wandhöhe setzen', 'i-up')}</div><p class="note">Dächer passt du über Breite, Tiefe und Höhe an. Ein paar Zentimeter Überstand je Seite sehen natürlich aus.</p>`;
    else if (def.mount === 'ceiling') elevHelp = `<div class="row">${btn('ceil', 'An die Decke', 'i-up')}</div>`;
    return `<div class="p-head"><span class="thumb">${thumbImg('item', it.type)}</span><div><div class="p-title">${escapeHtml(def.name)}</div><div class="p-sub">${escapeHtml(cat ? cat.name : '')}</div></div></div>`
      + sec('Grösse', `<div class="grid3">${num('w', 'Breite', fmt0(it.w), 'cm')}${num('d', 'Tiefe', fmt0(it.d), 'cm')}${num('h', 'Höhe', fmt0(it.h), 'cm')}</div>`)
      + sec('Lage', `<div class="grid2">${num('rot', 'Drehung', fmt0(it.rot || 0), '°')}${num('elev', 'Über Boden', fmt0(it.elev || 0), 'cm')}</div><div class="row">${btn('rotL', '90°', 'i-rotl')}${btn('rotR', '90°', 'i-rotr')}${btn('flip', 'Spiegeln', 'i-flip')}</div>${elevHelp}`)
      + sec('Farbe', swatches('color', it.color || def.color, ITEM_COLORS) + (def.color2 ? `<span class="f-l">Zweitfarbe</span>${swatches('color2', it.color2 || def.color2, ITEM_COLORS)}` : ''))
      + sec('', `<div class="row">${btn('dup', 'Duplizieren', 'i-copy')}${btn('del', 'Löschen', 'i-trash', 'danger')}</div>`);
  }

  // --- opening
  function openingPanel(o) {
    const def = OPENINGS[o.type];
    const lv = app.level;
    const F = handlers.fields, A = handlers.acts;
    const isDoor = def.kind === 'door' || def.kind === 'double' || def.kind === 'french';
    F.type = (v) => mut(() => {
      const nd = OPENINGS[v];
      if (!nd) return;
      o.type = v; o.width = nd.w; o.height = nd.h; o.sill = nd.sill; o.color = nd.color;
    });
    F.width = (v) => { const n = parseLength(v); if (n > 10) mut(() => { o.width = r2(clamp(n, 20, 1500)); }, 'p:' + o.id + 'w'); else renderProps(true); };
    F.height = (v) => { const n = parseLength(v); if (n > 10) mut(() => { o.height = r2(clamp(n, 20, 800)); }, 'p:' + o.id + 'h'); else renderProps(true); };
    F.sill = (v) => { const n = parseLength(v); if (n >= 0) mut(() => { o.sill = r2(clamp(n, 0, 600)); }, 'p:' + o.id + 's'); else renderProps(true); };
    F.color = (v) => mut(() => { o.color = v; }, 'p:' + o.id + 'c');
    A.flip = () => mut(() => { o.flip = !o.flip; });
    A.swing = () => mut(() => { o.swing = !o.swing; });
    A.dup = () => app.duplicate();
    A.del = () => app.deleteSelection();
    const fr = openingFrame(lv, o);
    const options = Object.entries(OPENINGS).filter(([, d]) => d.cat === def.cat).map(([id, d]) => `<option value="${id}" ${id === o.type ? 'selected' : ''}>${escapeHtml(d.name)}</option>`).join('');
    const dist0 = fr ? `${fmtCm(Math.round(fr.u0 - fr.info.uMin))} / ${fmtCm(Math.round(fr.info.uMax - fr.u1))}` : '–';
    return `<div class="p-head"><span class="thumb">${thumbImg('opening', o.type)}</span><div><div class="p-title">${escapeHtml(def.name)}</div><div class="p-sub">Abstand zu den Wandenden: ${dist0}</div></div></div>`
      + sec('Typ', `<select class="txt" id="pf-type" data-field="type">${options}</select>`)
      + sec('Masse', `<div class="grid3">${num('width', 'Breite', fmt0(o.width), 'cm')}${num('height', 'Höhe', fmt0(o.height), 'cm')}${num('sill', 'Brüstung', fmt0(o.sill || 0), 'cm')}</div>`)
      + (isDoor || def.kind === 'sliding' ? sec('Öffnung', `<div class="row">${btn('flip', 'Anschlag wechseln', 'i-flip')}${btn('swing', 'Andere Seite', 'i-door')}</div>`) : '')
      + sec('Rahmenfarbe', swatches('color', o.color || def.color, ['#f7f7f5', '#e8e6e1', '#cfcac2', '#9aa0a5', '#5b5f63', '#3a3f45', '#262729', '#c49a6b', '#8a5f3c', '#5b3b26', '#34444f', '#2c4155', '#6f8a6a', '#9c3d34']))
      + sec('', `<div class="row">${btn('dup', 'Duplizieren', 'i-copy')}${btn('del', 'Löschen', 'i-trash', 'danger')}</div>`);
  }

  // --- wall
  function wallPanel(w) {
    const lv = app.level;
    const d = getDerived(lv);
    const info = d.walls.get(w.id);
    const F = handlers.fields, A = handlers.acts;
    const L = dist(w.a, w.b);
    F.len = (v) => {
      const n = parseLength(v);
      if (!(n > 5)) return renderProps(true);
      mut(() => {
        const dir = norm(sub(w.b, w.a));
        const nb = add(w.a, mul(dir, n));
        for (const e of endsAt(lv, w.b)) e.w[e.end] = { x: r2(nb.x), y: r2(nb.y) };
        normalizeWalls(lv);
      });
    };
    F.thickness = (v) => { const n = parseLength(v); if (n > 1) mut(() => { w.thickness = r2(clamp(n, 2, 120)); normalizeWalls(lv); }); else renderProps(true); };
    F.height = (v) => {
      const s = String(v).trim();
      if (!s) return mut(() => { w.height = null; });
      const n = parseLength(s);
      if (n > 10) mut(() => { w.height = r2(clamp(n, 10, 2000)); }); else renderProps(true);
    };
    A.split = () => mut(() => splitWallAtPoint(lv, w.id, { x: (w.a.x + w.b.x) / 2, y: (w.a.y + w.b.y) / 2 }));
    A.del = () => app.deleteSelection();
    A.applyAll = () => mut(() => {
      const ids = new Set(app.selection.filter((s) => s.kind === 'wall').map((s) => s.id));
      for (const x of lv.walls) if (ids.has(x.id)) x.thickness = w.thickness;
    });
    const name = (id) => (id ? lv.rooms.find((r) => r.id === id)?.name || 'Raum' : 'Aussen');
    const sides = info ? `${escapeHtml(name(info.roomP))} · ${escapeHtml(name(info.roomN))}` : '';
    return `<div class="p-head"><div><div class="p-title">Wand ${fmtM(L)}</div><div class="p-sub">${sides}</div></div></div>`
      + sec('Masse', `${num('len', 'Länge (Achse)', fmt0(L), 'cm')}<div class="grid2">${num('thickness', 'Dicke', fmt0(w.thickness), 'cm')}${num('height', 'Höhe', w.height == null ? '' : fmt0(w.height), 'cm', `placeholder="${lv.height}"`)}</div><p class="note">Ziehe die runden Griffe an den Enden, um Ecken zu verschieben. Die Wand selbst lässt sich quer verschieben. Leere Höhe = Geschosshöhe.</p>`)
      + sec('', `<div class="row">${btn('split', 'Wand teilen', 'i-plus')}${btn('del', 'Löschen', 'i-trash', 'danger')}</div>`);
  }

  // --- room
  function roomPanel(r) {
    const lv = app.level;
    const f = faceOfRoom(lv, r.id);
    const F = handlers.fields, A = handlers.acts;
    F['room-name'] = (v) => mut(() => {
      const name = String(v).trim().slice(0, 60) || 'Raum';
      if (ROOM_FLOOR_HINT[name] && r.floor === 'oak' && r.name !== name) r.floor = ROOM_FLOOR_HINT[name];
      r.name = name;
    }, 'p:' + r.id + 'name');
    F.floor = (v) => mut(() => { r.floor = v; });
    F.wallColor = (v) => mut(() => { r.wallColor = v; }, 'p:' + r.id + 'wc');
    F.wallTex = (v) => mut(() => { r.wallTex = v; });
    F.ceiling = (v) => mut(() => { r.ceiling = !!v; });
    F.showFloor = (v) => mut(() => { r.showFloor = !!v; });
    A.floor = (b) => mut(() => { r.floor = b.dataset.v; });
    A.delRoom = async () => {
      const ok = await confirmDialog('Raum löschen?', `Die Wände von «${r.name}», die an keinen anderen Raum grenzen, werden entfernt. Möbel bleiben stehen.`, 'Raum löschen', true);
      if (ok) { mut(() => deleteRoom(lv, r.id)); app.select([]); }
    };
    let perim = 0;
    if (f) for (let i = 0; i < f.inner.length; i++) perim += dist(f.inner[i], f.inner[(i + 1) % f.inner.length]);
    const floors = FLOORS.map((fl) => `<button class="fl" data-act="floor" data-v="${fl.id}" aria-pressed="${fl.id === r.floor}" style="background-image:url(${floorDataUrl(fl.id, 96)})" title="${escapeHtml(fl.name)}"><span>${escapeHtml(fl.name)}</span></button>`).join('');
    const texOpts = WALL_TEXTURES.map((t) => `<option value="${t.id}" ${t.id === (r.wallTex || 'paint') ? 'selected' : ''}>${t.name}</option>`).join('');
    return `<div class="p-head"><div><div class="p-title">${escapeHtml(r.name)}</div><div class="p-sub">Raum auf ${escapeHtml(lv.name)}</div></div></div>`
      + sec('Raum', `${text('room-name', 'Name', r.name, 'list="room-names" autocomplete="off"')}<datalist id="room-names">${ROOM_NAMES.map((n) => `<option value="${escapeHtml(n)}">`).join('')}</datalist>
          <div class="stat"><span>Nettofläche</span><b>${f ? fmtArea2(f.netArea) : '–'}</b></div><div class="stat"><span>Umfang innen</span><b>${fmtM(perim)}</b></div><div class="stat"><span>Raumhöhe</span><b>${fmtM(lv.height)}</b></div>`)
      + sec('Boden', `<div class="floors">${floors}</div>${check('showFloor', 'Boden anzeigen (aus = Öffnung, z.B. Treppenloch)', r.showFloor !== false)}`)
      + sec('Wände innen', `${swatches('wallColor', r.wallColor || '#f4f2ee', WALL_COLORS)}<label class="f"><span class="f-l">Belag</span><select class="txt" id="pf-wallTex" data-field="wallTex">${texOpts}</select></label>`)
      + sec('Decke', check('ceiling', 'Decke im Rundgang zeigen', r.ceiling !== false))
      + sec('', `<div class="row">${btn('delRoom', 'Raum löschen', 'i-trash', 'danger')}</div>`);
  }

  function labelPanel(l) {
    const F = handlers.fields, A = handlers.acts;
    F['label-text'] = (v) => mut(() => { l.text = String(v).slice(0, 200) || 'Text'; }, 'p:' + l.id + 't');
    F.size = (v) => { const n = parseNum(v); if (n > 4) mut(() => { l.size = clamp(n, 6, 120); }, 'p:' + l.id + 's'); };
    A.del = () => app.deleteSelection();
    return `<div class="p-head"><div><div class="p-title">Text</div><div class="p-sub">Beschriftung im Plan</div></div></div>`
      + sec('Inhalt', `${text('label-text', 'Text', l.text)}${num('size', 'Schriftgrösse', l.size || 16, 'px')}`)
      + sec('', `<div class="row">${btn('del', 'Löschen', 'i-trash', 'danger')}</div>`);
  }

  function dimPanel(dm) {
    handlers.acts.del = () => app.deleteSelection();
    return `<div class="p-head"><div><div class="p-title">Masslinie</div><div class="p-sub">${fmtM(dist(dm.a, dm.b))}</div></div></div>`
      + sec('', `<p class="note">Ziehe die Endpunkte, um die Messung anzupassen.</p><div class="row">${btn('del', 'Löschen', 'i-trash', 'danger')}</div>`);
  }

  function multiPanel(sel) {
    handlers.acts.dup = () => app.duplicate();
    handlers.acts.del = () => app.deleteSelection();
    const counts = {};
    for (const s of sel) counts[s.kind] = (counts[s.kind] || 0) + 1;
    const names = { item: 'Objekte', wall: 'Wände', opening: 'Öffnungen', label: 'Texte', dim: 'Masslinien', room: 'Räume' };
    return `<div class="p-head"><div><div class="p-title">${sel.length} ausgewählt</div><div class="p-sub">${Object.entries(counts).map(([k, n]) => n + ' ' + names[k]).join(' · ')}</div></div></div>`
      + sec('', `<p class="note">Ziehe ein ausgewähltes Objekt, um alle gemeinsam zu verschieben.</p><div class="row">${btn('dup', 'Duplizieren', 'i-copy')}${btn('del', 'Löschen', 'i-trash', 'danger')}</div>`);
  }

  function overviewPanel() {
    const p = app.project, lv = app.level, st = p.settings;
    const F = handlers.fields, A = handlers.acts;
    const stats = levelStats(lv);
    let total = 0;
    for (const l of p.levels) total += levelStats(l).total;
    F.wallThickness = (v) => { const n = parseLength(v); if (n > 1) mut(() => { st.wallThickness = r2(clamp(n, 2, 100)); }, 'st:wt'); else renderProps(true); };
    F.levelHeight = (v) => { const n = parseLength(v); if (n > 100) mut(() => { lv.height = r2(clamp(n, 150, 800)); }, 'st:lh'); else renderProps(true); };
    F.exteriorColor = (v) => mut(() => { st.exteriorColor = v; }, 'st:ec');
    F.exteriorTex = (v) => mut(() => { st.exteriorTex = v; });
    F.groundColor = (v) => mut(() => { st.groundColor = v; }, 'st:gc');
    F.showGhost = (v) => mut(() => { st.showGhost = !!v; });
    F['bg-opacity'] = (v, t, live) => mut(() => { if (lv.background) lv.background.opacity = clamp(parseFloat(v) / 100, 0.05, 1); }, 'st:bgo');
    F.bgX = (v) => { const n = parseLength(v); if (Number.isFinite(n) && lv.background) mut(() => { lv.background.x = n; }); };
    F.bgY = (v) => { const n = parseLength(v); if (Number.isFinite(n) && lv.background) mut(() => { lv.background.y = n; }); };
    F.bgW = (v) => { const n = parseLength(v); if (n > 10 && lv.background) mut(() => { lv.background.width = n; }); };
    for (const l of p.levels) {
      F['lvName:' + l.id] = (v) => mut(() => { l.name = String(v).trim().slice(0, 40) || l.name; });
      F['lvH:' + l.id] = (v) => { const n = parseLength(v); if (n > 100) mut(() => { l.height = r2(clamp(n, 150, 800)); }); else renderProps(true); };
      F['lvE:' + l.id] = (v) => { const n = parseLength(v); if (Number.isFinite(n)) mut(() => { l.elevation = r2(n); }); else renderProps(true); };
    }
    A.addLevel = () => addLevelDialog();
    A.delLevel = async (b) => {
      const l = p.levels.find((x) => x.id === b.dataset.id);
      if (!l || p.levels.length < 2) return;
      const ok = await confirmDialog(`«${l.name}» löschen?`, 'Alle Wände, Räume und Möbel dieses Geschosses werden entfernt. Du kannst das mit Rückgängig wiederherstellen.', 'Geschoss löschen', true);
      if (!ok) return;
      mut(() => { p.levels = p.levels.filter((x) => x !== l); });
      app.setLevel(sortedLevels(p)[0].id);
    };
    A.room = (b) => app.select([{ kind: 'room', id: b.dataset.id }]);
    A.bgLoad = () => $('file-image').click();
    A.bgCal = () => { app.setTool('calibrate'); closeSheets(); };
    A.bgDel = () => mut(() => { lv.background = null; });
    A.help = () => helpDialog();
    const lvRows = sortedLevels(p).map((l) => `<div class="lv-row"><input class="txt" data-field="lvName:${l.id}" value="${escapeHtml(l.name)}" aria-label="Name"><span class="num"><input data-field="lvH:${l.id}" inputmode="decimal" value="${fmt0(l.height)}" aria-label="Raumhöhe"><span class="u">cm</span></span><button class="btn icon ghost danger" data-act="delLevel" data-id="${l.id}" aria-label="Geschoss löschen" ${p.levels.length < 2 ? 'disabled' : ''}>${icon('i-trash')}</button></div>`).join('');
    const rooms = stats.rooms.filter((r) => r.room).sort((a, b) => b.net - a.net).map((r) => `<button data-act="room" data-id="${r.room.id}"><span>${escapeHtml(r.room.name)}</span><span>${fmtArea(r.net)}</span></button>`).join('');
    const bg = lv.background;
    const bgHtml = bg
      ? `<label class="f"><span class="f-l">Deckkraft</span><input class="range" type="range" min="5" max="100" id="pf-bg-opacity" data-field="bg-opacity" value="${Math.round(bg.opacity * 100)}"></label>
         <div class="grid3">${num('bgX', 'X', fmt0(bg.x), 'cm')}${num('bgY', 'Y', fmt0(bg.y), 'cm')}${num('bgW', 'Breite', fmt0(bg.width), 'cm')}</div>
         <div class="row">${btn('bgCal', 'Massstab festlegen', 'i-measure')}${btn('bgDel', 'Entfernen', 'i-trash', 'danger')}</div>`
      : `<p class="note">Lade einen bestehenden Grundriss als Bild (z.B. vom Architekten) und zeichne die Wände darauf nach.</p><div class="row">${btn('bgLoad', 'Bild laden', 'i-image')}</div>`;
    const texOpts = WALL_TEXTURES.map((t) => `<option value="${t.id}" ${t.id === (st.exteriorTex || 'plaster') ? 'selected' : ''}>${t.name}</option>`).join('');
    return `<div class="p-head"><div><div class="p-title">${escapeHtml(p.name)}</div><div class="p-sub">Übersicht · nichts ausgewählt</div></div></div>`
      + sec('Flächen', `<div class="stat"><span>Wohnfläche ${escapeHtml(lv.name)}</span><b>${fmtArea2(stats.total)}</b></div>${p.levels.length > 1 ? `<div class="stat"><span>Alle Geschosse</span><b>${fmtArea2(total)}</b></div>` : ''}<div class="rooms-list">${rooms || '<p class="note">Noch keine Räume. Zeichne geschlossene Wände, dann entsteht automatisch ein Raum.</p>'}</div>`)
      + sec('Geschosse', `${lvRows}<p class="note">Name und Raumhöhe (Boden bis Decke).</p>`, `<button class="btn ghost" data-act="addLevel" style="min-height:28px;padding:3px 8px">${icon('i-plus')}Neu</button>`)
      + sec('Neue Wände', `<div class="grid2">${num('wallThickness', 'Wanddicke', fmt0(st.wallThickness), 'cm')}${num('levelHeight', 'Raumhöhe', fmt0(lv.height), 'cm')}</div>`)
      + sec('Fassade', `${swatches('exteriorColor', st.exteriorColor, WALL_COLORS)}<label class="f"><span class="f-l">Belag aussen</span><select class="txt" data-field="exteriorTex" id="pf-exteriorTex">${texOpts}</select></label>`)
      + sec('Gelände', swatches('groundColor', st.groundColor, GROUND_COLORS))
      + sec('Plan-Vorlage', bgHtml)
      + sec('Darstellung', check('showGhost', 'Geschoss darunter im Plan einblenden', st.showGhost !== false))
      + sec('', `<div class="row">${btn('help', 'Anleitung & Tastenkürzel', 'i-help')}</div>`);
  }

  // ------------------------------------------------------------------ selection bar
  function renderSelbar() {
    const sel = app.selection;
    const lv = app.level;
    if (!sel.length || app.view3d?.walking) { el.selbar.hidden = true; return; }
    let name = '', buttons = '';
    const b = (act, ic, label) => `<button class="btn icon" data-sb="${act}" title="${label}" aria-label="${label}">${icon(ic)}</button>`;
    const s = sel[0];
    if (sel.length > 1) {
      name = sel.length + ' ausgewählt';
      buttons = b('dup', 'i-copy', 'Duplizieren') + b('del', 'i-trash', 'Löschen');
    } else if (s.kind === 'item') {
      const it = lv.items.find((x) => x.id === s.id);
      name = it ? ITEMS[it.type]?.name : '';
      buttons = b('rotL', 'i-rotl', 'Drehen −90°') + b('rotR', 'i-rotr', 'Drehen +90°') + b('dup', 'i-copy', 'Duplizieren') + b('del', 'i-trash', 'Löschen');
    } else if (s.kind === 'opening') {
      const o = lv.openings.find((x) => x.id === s.id);
      const def = o && OPENINGS[o.type];
      name = def ? def.name : '';
      if (def && isDoorKind(def.kind) && def.kind !== 'passage' && def.kind !== 'garage') buttons += b('oflip', 'i-flip', 'Anschlag wechseln') + b('oswing', 'i-door', 'Öffnungsseite wechseln');
      buttons += b('dup', 'i-copy', 'Duplizieren') + b('del', 'i-trash', 'Löschen');
    } else if (s.kind === 'wall') {
      const w = lv.walls.find((x) => x.id === s.id);
      name = w ? 'Wand ' + fmtM(dist(w.a, w.b)) : 'Wand';
      buttons = b('del', 'i-trash', 'Löschen');
    } else if (s.kind === 'room') {
      const r = lv.rooms.find((x) => x.id === s.id);
      const f = r && faceOfRoom(lv, r.id);
      name = r ? `${r.name} · ${f ? fmtArea(f.netArea) : ''}` : '';
      buttons = '';
    } else {
      name = s.kind === 'label' ? 'Text' : 'Masslinie';
      buttons = b('del', 'i-trash', 'Löschen');
    }
    buttons += `<button class="btn icon" data-sb="props" title="Details" aria-label="Details">${icon('i-sliders')}</button>`;
    el.selbar.innerHTML = `<span class="sb-name">${escapeHtml(name || '')}</span>${buttons}`;
    el.selbar.hidden = false;
  }
  el.selbar.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sb]');
    if (!b) return;
    const act = b.dataset.sb;
    const lv = app.level;
    const s = app.selection[0];
    if (act === 'del') app.deleteSelection();
    else if (act === 'dup') app.duplicate();
    else if (act === 'props') toggleSheet('props');
    else if (act === 'rotL' || act === 'rotR') app.rotateSelection(act === 'rotL' ? -90 : 90);
    else if (act === 'oflip' || act === 'oswing') {
      const o = lv.openings.find((x) => x.id === s.id);
      if (o) app.mutate(() => { if (act === 'oflip') o.flip = !o.flip; else o.swing = !o.swing; });
    }
  });

  // ------------------------------------------------------------------ global refresh
  function renderLevels() {
    const lvls = sortedLevels(app.project).reverse();
    el.levels.innerHTML = lvls.map((l) => `<button data-level="${l.id}" aria-pressed="${l === app.level}" title="${escapeHtml(l.name)}">${escapeHtml(shortLevel(l.name))}</button>`).join('')
      + `<button class="lv-add" data-add="1" title="Geschoss hinzufügen" aria-label="Geschoss hinzufügen">${icon('i-plus')}</button>`;
  }
  function syncView() {
    for (const b of el.viewSwitch.querySelectorAll('[data-view]')) b.setAttribute('aria-pressed', String(b.dataset.view === app.viewMode));
    const t = el.mobilebar.querySelector('[data-toggle-view]');
    if (t) {
      const to3d = app.viewMode !== '3d';
      t.innerHTML = `${icon(to3d ? 'i-3d' : 'i-2d')}<span>${to3d ? '3D' : '2D'}</span>`;
    }
  }
  function refresh() {
    const p = app.project;
    if (document.activeElement !== el.projectName) el.projectName.value = p.name;
    el.undo.disabled = !app.canUndo();
    el.redo.disabled = !app.canRedo();
    opts.snap.checked = p.settings.snap !== false;
    opts.magnet.checked = p.settings.magnet !== false;
    opts.showDims.checked = p.settings.showDims !== false;
    opts.showGrid.checked = p.settings.showGrid !== false;
    $('v3-doors').setAttribute('aria-pressed', String(!!p.settings.doorsOpen));
    el.stageEmpty.hidden = app.level.walls.length > 0 || app.level.items.length > 0 || !!app.level.background;
    renderLevels();
    syncTools();
    syncView();
    renderProps();
  }
  function setZoom(s) {
    el.zoomVal.textContent = Math.round(s * 200) + '%';
  }
  function setCoords(w) {
    el.coords.textContent = w ? `x ${fmtNum(w.x / 100, 2)}  y ${fmtNum(w.y / 100, 2)} m` : '';
  }
  function focusField(id) {
    setTimeout(() => {
      const f = document.getElementById('pf-' + id) || document.getElementById(id);
      if (f) {
        if (window.matchMedia('(max-width: 980px)').matches) openSheet('props');
        f.focus();
        f.select && f.select();
      }
    }, 30);
  }

  renderCatalog();

  return {
    refresh, renderProps, renderCatalog, setHint, setCoords, setZoom, toast, confirm: confirmDialog, askLength, focusField,
    openSheet, closeSheets, setSaveState, helpDialog, projectsDialog, renderSelbar,
    clearThumbs() { thumbs.clear(); },
  };
}
