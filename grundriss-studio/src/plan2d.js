// Grundriss Studio – 2D floor plan editor (SVG)
import {
  EPS, uid, clamp, round, r2, deg, rad, normDeg, add, sub, mul, dot, dist, norm, perp, same, rot,
  closestOnSegment, lineIntersect, onSegmentInterior, bbox, fmtM, fmtMShort, fmtArea, fmtCm, escapeHtml,
  mix, shade, parseLength,
} from './util.js';
import {
  getDerived, openingFrame, nearestWall, itemCorners, uniqueVertices, endsAt, levelBelow, levelBounds,
  addWallSegment, normalizeWalls,
} from './model.js';
import { ITEMS, OPENINGS, itemParts, resolveMaterial, isDoorKind, defaultItem } from './catalog.js';
import { floorDataUrl, floorTileSize, FLOOR_BY_ID } from './textures.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const f1 = (v) => Math.round(v * 10) / 10;
const P = (p) => f1(p.x) + ' ' + f1(p.y);
const pathD = (pts) => 'M' + pts.map(P).join('L') + 'Z';

export const PLAN_CSS = `
.paper{fill:var(--plan-paper)}
.g-minor{stroke:var(--plan-grid);fill:none;stroke-width:1}
.g-major{stroke:var(--plan-grid-major);fill:none;stroke-width:1}
.room{stroke:none}
.room-veil{fill:var(--plan-veil);pointer-events:none}
.room.nofloor{fill:var(--plan-paper)}
.wall{fill:var(--plan-wall);stroke:var(--plan-wall);stroke-width:.8;vector-effect:non-scaling-stroke;stroke-linejoin:round}
.t-select .wall:hover{fill:var(--plan-wall-hover);stroke:var(--plan-wall-hover)}
.wall.sel{fill:var(--accent);stroke:var(--accent)}
.op-cut{fill:var(--plan-paper);stroke:none}
.op-jamb{stroke:var(--plan-wall);stroke-width:1.4;vector-effect:non-scaling-stroke;fill:none}
.op-line{stroke:var(--plan-wall);stroke-width:1;vector-effect:non-scaling-stroke;fill:none}
.op-glass{stroke:var(--plan-glass);stroke-width:1.6;vector-effect:non-scaling-stroke;fill:none}
.op-leaf{stroke:var(--plan-ink);stroke-width:1.6;vector-effect:non-scaling-stroke;fill:none}
.op-arc{stroke:var(--plan-ink);stroke-width:.8;vector-effect:non-scaling-stroke;fill:none;stroke-dasharray:5 3;opacity:.75}
.op-dash{stroke:var(--plan-ink);stroke-width:.8;vector-effect:non-scaling-stroke;fill:none;stroke-dasharray:6 4;opacity:.7}
.op-hit{fill:transparent;stroke:none}
.opening.sel .op-cut{fill:var(--accent-soft)}
.opening.sel .op-leaf,.opening.sel .op-glass{stroke:var(--accent)}
.t-select .opening:hover .op-cut{fill:var(--accent-soft)}
.ip{stroke-width:.7;vector-effect:non-scaling-stroke;stroke-linejoin:round}
.item-hit{fill:transparent;stroke:none}
.item.sel .item-hit{stroke:var(--accent);stroke-width:1.6;vector-effect:non-scaling-stroke;stroke-dasharray:5 3}
.t-select .item:hover .item-hit{stroke:var(--accent);stroke-width:1.2;vector-effect:non-scaling-stroke}
.roof-line{fill:none;stroke:var(--plan-roof);stroke-width:1.2;vector-effect:non-scaling-stroke;stroke-dasharray:10 5}
.roof-ridge{fill:none;stroke:var(--plan-roof);stroke-width:1.2;vector-effect:non-scaling-stroke}
.roof-hit{fill:none;stroke:transparent;stroke-width:10;vector-effect:non-scaling-stroke;pointer-events:stroke}
.item.sel .roof-line,.item.sel .roof-ridge{stroke:var(--accent)}
.rl-name{font-family:var(--font-ui);font-weight:600;fill:var(--plan-ink);text-anchor:middle;paint-order:stroke;stroke:var(--plan-halo);stroke-linejoin:round}
.rl-area{font-family:var(--font-num);font-weight:500;fill:var(--plan-muted);text-anchor:middle;paint-order:stroke;stroke:var(--plan-halo);stroke-linejoin:round}
.room-label{cursor:pointer}
.dim-t{font-family:var(--font-num);font-weight:500;fill:var(--plan-dim);text-anchor:middle;dominant-baseline:central;paint-order:stroke;stroke:var(--plan-halo);stroke-linejoin:round}
.dim-l{stroke:var(--plan-dim);stroke-width:.9;vector-effect:non-scaling-stroke;fill:none}
.dim-x{stroke:var(--plan-dim);stroke-width:.6;vector-effect:non-scaling-stroke;fill:none;opacity:.6}
.dim.sel .dim-l{stroke:var(--accent)}
.dim-hit{stroke:transparent;stroke-width:12;vector-effect:non-scaling-stroke;fill:none}
.lbl{font-family:var(--font-ui);font-weight:500;fill:var(--plan-ink);paint-order:stroke;stroke:var(--plan-halo);stroke-linejoin:round}
.lbl.sel{fill:var(--accent)}
.ghost{fill:none;stroke:var(--plan-ghost);stroke-width:1;vector-effect:non-scaling-stroke;stroke-dasharray:6 4}
.ov-line{stroke:var(--accent);stroke-width:1.5;vector-effect:non-scaling-stroke;fill:none}
.ov-dash{stroke:var(--accent);stroke-width:1.2;vector-effect:non-scaling-stroke;fill:none;stroke-dasharray:5 4}
.ov-fill{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.2;vector-effect:non-scaling-stroke}
.ov-guide{stroke:var(--plan-guide);stroke-width:1;vector-effect:non-scaling-stroke;stroke-dasharray:3 3;fill:none}
.ov-handle{fill:var(--plan-paper);stroke:var(--accent);stroke-width:1.6;vector-effect:non-scaling-stroke;cursor:pointer}
.ov-handle.rot{cursor:grab}
.ov-snap{fill:none;stroke:var(--accent);stroke-width:1.6;vector-effect:non-scaling-stroke}
.ov-t{font-family:var(--font-num);font-weight:600;fill:var(--accent-ink);text-anchor:middle;dominant-baseline:central}
.ov-tbg{fill:var(--accent)}
.ov-dist{stroke:var(--plan-dim);stroke-width:1;vector-effect:non-scaling-stroke;stroke-dasharray:2 3;fill:none}
.ov-room{fill:none;stroke:var(--accent);stroke-width:2.2;vector-effect:non-scaling-stroke}
.ov-marquee{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1;vector-effect:non-scaling-stroke;stroke-dasharray:4 3}
.ghost-item{opacity:.65}
.l-overlay *{pointer-events:none}
.l-overlay .ov-handle{pointer-events:all}
.tb-box{fill:var(--plan-paper);stroke:var(--plan-ink);stroke-width:1}
.tb-t{font-family:var(--font-ui);fill:var(--plan-ink)}
.tb-m{font-family:var(--font-num);fill:var(--plan-muted)}
`;

export const EXPORT_VARS = `svg{--plan-paper:#ffffff;--plan-grid:rgba(40,70,90,.06);--plan-grid-major:rgba(40,70,90,.12);--plan-veil:rgba(255,255,255,.28);--plan-wall:#2a3034;--plan-wall-hover:#454d52;--plan-ink:#1e262b;--plan-muted:#56646b;--plan-halo:rgba(255,255,255,.85);--plan-dim:#5b6a72;--plan-glass:#4f93b8;--plan-ghost:#9aa7ad;--plan-roof:#7a4a3a;--plan-guide:#3c8fb5;--accent:#e2571e;--accent-soft:rgba(226,87,30,.14);--accent-ink:#fff;--font-ui:Barlow,'Segoe UI',Roboto,Arial,sans-serif;--font-num:'Barlow Condensed','Arial Narrow',Arial,sans-serif}`;

export function createPlan2D(app, host) {
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', 'plan-svg');
  svg.setAttribute('role', 'application');
  svg.setAttribute('aria-label', 'Grundriss-Editor');
  svg.innerHTML = `<style>${PLAN_CSS}</style><defs><g id="pd-floors"></g><g id="pd-grid"></g></defs>
    <rect class="paper" width="100%" height="100%"/>
    <rect class="grid-r" width="100%" height="100%" fill="url(#gMinor)"/>
    <rect class="grid-r" width="100%" height="100%" fill="url(#gMajor)"/>
    <g class="world"><g class="l-rooms"></g><g class="l-bg"></g><g class="l-ghost"></g><g class="l-items"></g><g class="l-walls"></g><g class="l-openings"></g><g class="l-roofs"></g><g class="l-labels"></g><g class="l-dims"></g><g class="l-overlay"></g></g>`;
  host.appendChild(svg);
  const lenInput = document.createElement('input');
  lenInput.className = 'len-input';
  lenInput.id = 'plan-length-input';
  lenInput.setAttribute('aria-label', 'Wandlänge');
  lenInput.placeholder = 'Länge';
  lenInput.hidden = true;
  host.appendChild(lenInput);

  const $ = (sel) => svg.querySelector(sel);
  const world = $('.world');
  const L = {
    bg: $('.l-bg'), ghost: $('.l-ghost'), rooms: $('.l-rooms'), items: $('.l-items'), walls: $('.l-walls'),
    openings: $('.l-openings'), roofs: $('.l-roofs'), labels: $('.l-labels'), dims: $('.l-dims'), overlay: $('.l-overlay'),
  };
  const defsFloors = svg.querySelector('#pd-floors');
  const defsGrid = svg.querySelector('#pd-grid');
  const gridRects = svg.querySelectorAll('.grid-r');

  const view = { s: 0.5, tx: 200, ty: 120 };
  let cursorWorld = null;
  let gesture = null;
  let chain = null; // wall drawing: {pts: []}
  let roomFirst = null; // room tool two-click mode
  let measureFirst = null;
  let calibFirst = null;
  let placement = null; // {kind, type, world}
  let hoverSnap = null;
  let spaceDown = false;
  const pointers = new Map();
  const symCache = new Map();
  const floorPatterns = new Set();

  const S = () => app.project.settings;
  const LV = () => app.level;

  // ---------------------------------------------------------------- view
  function toWorld(cx, cy) {
    const r = svg.getBoundingClientRect();
    return { x: (cx - r.left - view.tx) / view.s, y: (cy - r.top - view.ty) / view.s };
  }
  function toScreen(p) {
    return { x: p.x * view.s + view.tx, y: p.y * view.s + view.ty };
  }
  function size() {
    const r = svg.getBoundingClientRect();
    return { w: r.width || 800, h: r.height || 600 };
  }
  function zoomAt(k, sx, sy) {
    const ns = clamp(view.s * k, 0.04, 10);
    const kk = ns / view.s;
    view.tx = sx - (sx - view.tx) * kk;
    view.ty = sy - (sy - view.ty) * kk;
    view.s = ns;
    render();
    app.emit('zoom', view.s);
  }
  function zoomBy(k) {
    const { w, h } = size();
    zoomAt(k, w / 2, h / 2);
  }
  function houseBounds() {
    const lv = LV();
    if (!lv.walls.length) return levelBounds(lv);
    const pts = [];
    for (const w of lv.walls) pts.push(w.a, w.b);
    const b = bbox(pts);
    const pad = Math.max(b.w, b.h) * 0.08 + 40;
    return { minX: b.minX - pad, minY: b.minY - pad, maxX: b.maxX + pad, maxY: b.maxY + pad, w: b.w + 2 * pad, h: b.h + 2 * pad };
  }
  function fit(bounds) {
    const b = bounds || levelBounds(LV()) || { minX: -100, minY: -100, maxX: 900, maxY: 700, w: 1000, h: 800 };
    trackSize();
    const { w, h } = size();
    const pad = 60;
    const s = clamp(Math.min((w - pad * 2) / Math.max(b.w, 200), (h - pad * 2) / Math.max(b.h, 200)), 0.04, 4);
    view.s = s;
    view.tx = w / 2 - ((b.minX + b.maxX) / 2) * s;
    view.ty = h / 2 - ((b.minY + b.maxY) / 2) * s;
    render();
    app.emit('zoom', view.s);
  }
  function worldCenter() {
    const { w, h } = size();
    return toWorld(svg.getBoundingClientRect().left + w / 2, svg.getBoundingClientRect().top + h / 2);
  }

  // ---------------------------------------------------------------- render
  let raf = 0, rafView = 0;
  function render() {
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); });
  }
  function renderView() {
    if (raf) return;
    if (!rafView) rafView = requestAnimationFrame(() => { rafView = 0; drawView(); });
  }
  let lastW = 0, lastH = 0;
  function trackSize() {
    const r = svg.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      if (lastW && (r.width !== lastW || r.height !== lastH)) {
        view.tx += (r.width - lastW) / 2;
        view.ty += (r.height - lastH) / 2;
      }
      lastW = r.width;
      lastH = r.height;
    }
  }
  function drawView() {
    trackSize();
    world.setAttribute('transform', `translate(${f1(view.tx)} ${f1(view.ty)}) scale(${view.s})`);
    drawGrid();
  }
  function drawGrid() {
    const show = S().showGrid !== false;
    gridRects.forEach((r) => (r.style.display = show ? '' : 'none'));
    if (!show) return;
    const s = view.s;
    const minor = [10, 50, 100, 500, 1000].find((st) => st * s >= 8) || 1000;
    const major = [100, 500, 1000, 5000, 10000].find((st) => st > minor && st * s >= 50) || 10000;
    const pat = (id, step, cls) => {
      const px = step * s;
      return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${f1(px)}" height="${f1(px)}" x="${f1(view.tx)}" y="${f1(view.ty)}"><path class="${cls}" d="M${f1(px)} 0L0 0 0 ${f1(px)}"/></pattern>`;
    };
    defsGrid.innerHTML = pat('gMinor', minor, 'g-minor') + pat('gMajor', major, 'g-major');
  }

  function floorPatternId(fid) {
    const id = 'fl-' + (FLOOR_BY_ID[fid] ? fid : 'oak');
    if (!floorPatterns.has(id)) {
      floorPatterns.add(id);
      const t = floorTileSize(fid);
      const el = document.createElementNS(SVGNS, 'pattern');
      el.setAttribute('id', id);
      el.setAttribute('patternUnits', 'userSpaceOnUse');
      el.setAttribute('width', t);
      el.setAttribute('height', t);
      el.innerHTML = `<image href="${floorDataUrl(fid, 128)}" width="${t}" height="${t}" preserveAspectRatio="none"/>`;
      defsFloors.appendChild(el);
    }
    return id;
  }

  const isSel = (kind, id) => app.selection.some((s) => s.kind === kind && s.id === id);

  function draw() {
    const lv = LV();
    const d = getDerived(lv);
    svg.setAttribute('class', 'plan-svg t-' + app.tool + (gesture && gesture.moved ? ' dragging' : ''));
    drawView();
    L.bg.innerHTML = renderBackground(lv);
    L.ghost.innerHTML = S().showGhost !== false ? renderGhost(lv) : '';
    L.rooms.innerHTML = renderRooms(lv, d);
    L.items.innerHTML = renderItems(lv, false);
    L.walls.innerHTML = renderWalls(d);
    L.openings.innerHTML = renderOpenings(lv);
    L.roofs.innerHTML = renderItems(lv, true);
    L.labels.innerHTML = renderLabels(lv, d);
    L.dims.innerHTML = renderDims(lv, d);
    L.overlay.innerHTML = renderOverlay(lv, d);
  }

  function renderBackground(lv) {
    const bg = lv.background;
    if (!bg) return '';
    const src = app.project.assets?.[bg.asset];
    if (!src) return '';
    const h = bg.width * (bg.aspect || 1);
    return `<image href="${src}" x="${f1(bg.x)}" y="${f1(bg.y)}" width="${f1(bg.width)}" height="${f1(h)}" opacity="${bg.opacity}" preserveAspectRatio="none" style="pointer-events:none"/>`;
  }

  function renderGhost(lv) {
    const below = levelBelow(app.project, lv);
    if (!below) return '';
    const d = getDerived(below);
    let s = '';
    for (const info of d.walls.values()) s += `<path class="ghost" d="${pathD(info.poly)}"/>`;
    return s;
  }

  function renderRooms(lv, d) {
    let s = '';
    for (const f of d.faces) {
      const room = lv.rooms.find((r) => r.id === f.roomId);
      if (!room) continue;
      const pd = pathD(f.poly);
      if (room.showFloor === false) {
        s += `<path class="room nofloor" d="${pd}" data-k="room" data-id="${room.id}"/>`;
      } else {
        s += `<path class="room" d="${pd}" fill="url(#${floorPatternId(room.floor)})" data-k="room" data-id="${room.id}"/><path class="room-veil" d="${pd}"/>`;
      }
    }
    return s;
  }

  function renderWalls(d) {
    let s = '';
    for (const info of d.walls.values()) {
      s += `<path class="wall${isSel('wall', info.id) ? ' sel' : ''}" d="${pathD(info.poly)}" data-k="wall" data-id="${info.id}"/>`;
    }
    return s;
  }

  function arcPath(c, from, to) {
    const a1 = Math.atan2(from.y - c.y, from.x - c.x), a2 = Math.atan2(to.y - c.y, to.x - c.x);
    let da = a2 - a1;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    const r = dist(c, from);
    return `M${P(from)}A${f1(r)} ${f1(r)} 0 0 ${da > 0 ? 1 : 0} ${P(to)}`;
  }

  function openingSymbol(def, o, t) {
    const w = o.width, hw = w / 2, ht = t / 2;
    const sg = o.swing ? -1 : 1;
    let s = `<rect class="op-hit" x="${f1(-hw)}" y="${f1(-ht - 4)}" width="${f1(w)}" height="${f1(t + 8)}"/>`;
    s += `<rect class="op-cut" x="${f1(-hw)}" y="${f1(-ht - 0.4)}" width="${f1(w)}" height="${f1(t + 0.8)}"/>`;
    s += `<path class="op-jamb" d="M${f1(-hw)} ${f1(-ht)}L${f1(-hw)} ${f1(ht)}M${f1(hw)} ${f1(-ht)}L${f1(hw)} ${f1(ht)}"/>`;
    const leaf = (hu, len, dir) => {
      const hinge = { x: hu, y: sg * ht };
      const open = { x: hu, y: sg * (ht + len) };
      const closed = { x: hu + dir * len, y: sg * ht };
      return `<path class="op-leaf" d="M${P(hinge)}L${P(open)}"/><path class="op-arc" d="${arcPath(hinge, open, closed)}"/>`;
    };
    const windowLines = () => {
      let x = `<path class="op-line" d="M${f1(-hw)} ${f1(-ht)}L${f1(hw)} ${f1(-ht)}M${f1(-hw)} ${f1(ht)}L${f1(hw)} ${f1(ht)}"/>`;
      x += `<path class="op-glass" d="M${f1(-hw)} -1.5L${f1(hw)} -1.5M${f1(-hw)} 1.5L${f1(hw)} 1.5"/>`;
      const panes = def.panes || 1;
      for (let i = 1; i < panes; i++) {
        const u = -hw + (w * i) / panes;
        x += `<path class="op-line" d="M${f1(u)} ${f1(-ht)}L${f1(u)} ${f1(ht)}"/>`;
      }
      return x;
    };
    switch (def.kind) {
      case 'door': s += leaf(o.flip ? hw : -hw, w, o.flip ? -1 : 1); break;
      case 'double': s += leaf(-hw, hw, 1) + leaf(hw, hw, -1); break;
      case 'sliding':
        s += `<rect class="op-leaf" x="${f1(-hw)}" y="${f1(-ht * 0.45 - 2)}" width="${f1(hw + 4)}" height="3"/>`;
        s += `<rect class="op-leaf" x="${f1(-4)}" y="${f1(ht * 0.45 - 1)}" width="${f1(hw + 4)}" height="3"/>`;
        break;
      case 'passage':
        s += `<path class="op-dash" d="M${f1(-hw)} ${f1(-ht)}L${f1(hw)} ${f1(-ht)}M${f1(-hw)} ${f1(ht)}L${f1(hw)} ${f1(ht)}"/>`;
        break;
      case 'garage':
        s += `<path class="op-dash" d="M${f1(-hw)} 0L${f1(hw)} 0"/><path class="op-line" d="M${f1(-hw)} ${f1(-ht)}L${f1(hw)} ${f1(-ht)}"/>`;
        break;
      case 'french':
        s += windowLines();
        if ((def.panes || 1) > 1) s += leaf(-hw, hw, 1) + leaf(hw, hw, -1);
        else s += leaf(o.flip ? hw : -hw, w, o.flip ? -1 : 1);
        break;
      case 'fixed':
        s += windowLines();
        break;
      default:
        s += windowLines();
    }
    return s;
  }

  function renderOpenings(lv) {
    let s = '';
    for (const o of lv.openings) {
      const def = OPENINGS[o.type];
      const fr = openingFrame(lv, o);
      if (!def || !fr) continue;
      s += `<g class="opening${isSel('opening', o.id) ? ' sel' : ''}" transform="translate(${P(fr.c)}) rotate(${f1(fr.ang)})" data-k="opening" data-id="${o.id}">${openingSymbol(def, o, fr.info.wall.thickness)}</g>`;
    }
    return s;
  }

  function topOf(p) {
    if (p.t === 'sph') return p.z + p.rz;
    if (p.t === 'hcyl') return p.z + p.r;
    return p.z + p.h;
  }

  function partSvg(p, it, def) {
    const m = resolveMaterial(p.m, it, def);
    let fill, stroke;
    if (m.opacity != null && m.opacity < 0.5) {
      fill = 'rgba(160,200,220,.18)';
      stroke = '#5c95b3';
    } else {
      fill = mix(m.color, '#ffffff', 0.06);
      stroke = shade(m.color, -0.55);
    }
    const st = `fill="${fill}" stroke="${stroke}"`;
    switch (p.t) {
      case 'box': {
        const rx = Math.min(p.r || 0, p.w / 2, p.d / 2);
        const tr = p.rz ? ` transform="rotate(${f1(p.rz)} ${f1(p.x)} ${f1(p.y)})"` : '';
        return `<rect class="ip" x="${f1(p.x - p.w / 2)}" y="${f1(p.y - p.d / 2)}" width="${f1(p.w)}" height="${f1(p.d)}" rx="${f1(rx)}" ${st}${tr}/>`;
      }
      case 'cyl': {
        const r = Math.max(p.r, p.r2);
        return `<ellipse class="ip" cx="${f1(p.x)}" cy="${f1(p.y)}" rx="${f1(r * (p.sx || 1))}" ry="${f1(r * (p.sy || 1))}" ${st}/>`;
      }
      case 'sph':
        return `<ellipse class="ip" cx="${f1(p.x)}" cy="${f1(p.y)}" rx="${f1(p.rx)}" ry="${f1(p.ry)}" ${st}/>`;
      case 'hcyl': {
        const w = p.axis === 'x' ? p.len : p.r * 2, dd = p.axis === 'x' ? p.r * 2 : p.len;
        return `<rect class="ip" x="${f1(p.x - w / 2)}" y="${f1(p.y - dd / 2)}" width="${f1(w)}" height="${f1(dd)}" rx="${f1(Math.min(w, dd) / 2)}" ${st}/>`;
      }
      default:
        return '';
    }
  }

  function roofSymbol(kind, it) {
    const w = it.w, d = it.d, hw = w / 2, hd = d / 2;
    let s = `<rect class="roof-hit" x="${f1(-hw)}" y="${f1(-hd)}" width="${f1(w)}" height="${f1(d)}"/>`;
    s += `<rect class="roof-line" x="${f1(-hw)}" y="${f1(-hd)}" width="${f1(w)}" height="${f1(d)}"/>`;
    if (kind === 'gable') s += `<path class="roof-ridge" d="M${f1(-hw)} 0L${f1(hw)} 0"/>`;
    else if (kind === 'hip') {
      if (w >= d) {
        const rx = (w - d) / 2;
        s += `<path class="roof-ridge" d="M${f1(-rx)} 0L${f1(rx)} 0M${f1(-hw)} ${f1(-hd)}L${f1(-rx)} 0L${f1(-hw)} ${f1(hd)}M${f1(hw)} ${f1(-hd)}L${f1(rx)} 0L${f1(hw)} ${f1(hd)}"/>`;
      } else {
        const ry = (d - w) / 2;
        s += `<path class="roof-ridge" d="M0 ${f1(-ry)}L0 ${f1(ry)}M${f1(-hw)} ${f1(-hd)}L0 ${f1(-ry)}L${f1(hw)} ${f1(-hd)}M${f1(-hw)} ${f1(hd)}L0 ${f1(ry)}L${f1(hw)} ${f1(hd)}"/>`;
      }
    } else if (kind === 'shed') {
      s += `<path class="roof-ridge" d="M0 ${f1(-hd * 0.7)}L0 ${f1(hd * 0.7)}M${f1(-hd * 0.12)} ${f1(hd * 0.55)}L0 ${f1(hd * 0.7)}L${f1(hd * 0.12)} ${f1(hd * 0.55)}"/>`;
    } else {
      s += `<rect class="roof-ridge" x="${f1(-hw + 15)}" y="${f1(-hd + 15)}" width="${f1(Math.max(1, w - 30))}" height="${f1(Math.max(1, d - 30))}"/>`;
    }
    return s;
  }

  function itemSymbol(it) {
    const def = ITEMS[it.type];
    if (!def) return '';
    const key = [it.type, it.w, it.d, it.h, it.color, it.color2].join('|');
    let s = symCache.get(key);
    if (s != null) return s;
    s = '';
    if (def.custom) s = roofSymbol(def.custom, it);
    else {
      const parts = itemParts(it).map((p, i) => ({ p, top: topOf(p), i })).sort((a, b) => a.top - b.top || a.i - b.i);
      for (const { p } of parts) s += partSvg(p, it, def);
      if (def.custom2d === 'stairs') {
        const hd = it.d / 2;
        s += `<circle cx="0" cy="${f1(hd - 12)}" r="3" fill="#333"/><path d="M0 ${f1(hd - 12)}L0 ${f1(-hd + 14)}M-6 ${f1(-hd + 24)}L0 ${f1(-hd + 14)}L6 ${f1(-hd + 24)}" fill="none" stroke="#333" stroke-width="1.4" vector-effect="non-scaling-stroke"/>`;
      }
    }
    if (symCache.size > 600) symCache.clear();
    symCache.set(key, s);
    return s;
  }

  function itemTransform(it) {
    return `translate(${f1(it.x)} ${f1(it.y)}) rotate(${f1(it.rot || 0)})${it.flip ? ' scale(-1 1)' : ''}`;
  }

  function renderItems(lv, roofs) {
    const list = lv.items
      .filter((it) => ITEMS[it.type] && !!ITEMS[it.type].custom === roofs)
      .sort((a, b) => {
        const ca = ITEMS[a.type].mount === 'ceiling' ? 1 : 0, cb = ITEMS[b.type].mount === 'ceiling' ? 1 : 0;
        return ca - cb || (a.elev || 0) - (b.elev || 0) || a.h - b.h;
      });
    let s = '';
    for (const it of list) {
      const sel = isSel('item', it.id);
      const hit = roofs ? '' : `<rect class="item-hit" x="${f1(-it.w / 2)}" y="${f1(-it.d / 2)}" width="${f1(it.w)}" height="${f1(it.d)}"/>`;
      s += `<g class="item${sel ? ' sel' : ''}" transform="${itemTransform(it)}" data-k="item" data-id="${it.id}">${itemSymbol(it)}${hit}</g>`;
    }
    return s;
  }

  function renderLabels(lv, d) {
    const fs = 13 / view.s, sw = 3.2 / view.s;
    let s = '';
    for (const f of d.faces) {
      const room = lv.rooms.find((r) => r.id === f.roomId);
      if (!room) continue;
      const b = bbox(f.inner);
      const wpx = b.w * view.s, hpx = b.h * view.s;
      if (wpx < 44 || hpx < 26) continue;
      const showName = room.name && hpx > 46 && room.name.length * 7.4 + 12 < wpx;
      s += `<g class="room-label" transform="translate(${P(f.label)})" data-k="room" data-id="${room.id}">`;
      if (showName) s += `<text class="rl-name" y="${f1(-fs * 0.15)}" font-size="${fs}" stroke-width="${sw}">${escapeHtml(room.name)}</text>`;
      s += `<text class="rl-area" y="${f1(showName ? fs * 1.05 : fs * 0.35)}" font-size="${fs * 0.92}" stroke-width="${sw}">${fmtArea(f.netArea)}</text></g>`;
    }
    for (const lb of lv.labels) {
      const size = (lb.size || 16) / view.s;
      s += `<text class="lbl${isSel('label', lb.id) ? ' sel' : ''}" x="${f1(lb.x)}" y="${f1(lb.y)}" font-size="${f1(size)}" stroke-width="${f1(sw)}" data-k="label" data-id="${lb.id}">${escapeHtml(lb.text)}</text>`;
    }
    return s;
  }

  function dimLine(a, b, offsetPx, text, cls = '', attrs = '') {
    const dd = norm(sub(b, a));
    const n = perp(dd);
    const off = offsetPx / view.s;
    const A = add(a, mul(n, off)), Bp = add(b, mul(n, off));
    const tick = 5 / view.s;
    const t1 = add(A, mul(add(dd, n), tick * 0.7)), t2 = sub(A, mul(add(dd, n), tick * 0.7));
    const t3 = add(Bp, mul(add(dd, n), tick * 0.7)), t4 = sub(Bp, mul(add(dd, n), tick * 0.7));
    let ang = deg(Math.atan2(dd.y, dd.x));
    if (ang > 90.5 || ang < -89.5) ang += 180;
    const mid = mul(add(A, Bp), 0.5);
    const tp = add(mid, mul(n, (off >= 0 ? 1 : -1) * 8 / view.s));
    const fs = 11.5 / view.s;
    let s = `<g class="dim ${cls}" ${attrs}>`;
    if (offsetPx) s += `<path class="dim-x" d="M${P(a)}L${P(add(A, mul(n, (off >= 0 ? 3 : -3) / view.s)))}M${P(b)}L${P(add(Bp, mul(n, (off >= 0 ? 3 : -3) / view.s)))}"/>`;
    s += `<path class="dim-l" d="M${P(A)}L${P(Bp)}M${P(t1)}L${P(t2)}M${P(t3)}L${P(t4)}"/>`;
    s += `<path class="dim-hit" d="M${P(A)}L${P(Bp)}"/>`;
    s += `<text class="dim-t" transform="translate(${P(tp)}) rotate(${f1(ang)})" font-size="${f1(fs)}" stroke-width="${f1(3 / view.s)}">${text}</text></g>`;
    return s;
  }

  function renderDims(lv, d) {
    let s = '';
    if (S().showDims !== false) {
      const fs = 11 / view.s, sw = 3 / view.s;
      for (const f of d.faces) {
        const pts = f.inner;
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i], b = pts[(i + 1) % pts.length];
          const L0 = dist(a, b);
          if (L0 * view.s < 64 || view.s < 0.22) continue;
          const dd = norm(sub(b, a));
          const n = perp(dd);
          let ang = deg(Math.atan2(dd.y, dd.x));
          if (ang > 90.5 || ang < -89.5) ang += 180;
          const mid = add(mul(add(a, b), 0.5), mul(n, 9 / view.s));
          s += `<text class="dim-t" transform="translate(${P(mid)}) rotate(${f1(ang)})" font-size="${f1(fs)}" stroke-width="${f1(sw)}">${fmtMShort(L0)}</text>`;
        }
      }
      // overall building dimensions
      if (d.walls.size) {
        const pts = [];
        for (const info of d.walls.values()) pts.push(...info.poly);
        const b = bbox(pts);
        if (b.w * view.s > 60) s += dimLine({ x: b.minX, y: b.minY }, { x: b.maxX, y: b.minY }, -34, fmtM(b.w));
        if (b.h * view.s > 60) s += dimLine({ x: b.minX, y: b.maxY }, { x: b.minX, y: b.minY }, -34, fmtM(b.h));
      }
    }
    for (const dm of lv.dims) {
      s += dimLine(dm.a, dm.b, 0, fmtM(dist(dm.a, dm.b)), isSel('dim', dm.id) ? 'sel' : '', `data-k="dim" data-id="${dm.id}"`);
    }
    return s;
  }

  // overlay helpers
  const hr = () => 6 / view.s;
  function handle(p, h, extra = '', cls = '') {
    return `<circle class="ov-handle ${cls}" cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(hr())}" data-h="${h}" ${extra}/>`;
  }
  function tag(p, text) {
    const fs = 11.5 / view.s;
    const w = (text.length * 6.4 + 12) / view.s, h = 18 / view.s;
    return `<g transform="translate(${P(p)})"><rect class="ov-tbg" x="${f1(-w / 2)}" y="${f1(-h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(4 / view.s)}"/><text class="ov-t" font-size="${f1(fs)}">${escapeHtml(text)}</text></g>`;
  }

  function wallOutlineSegments() {
    const d = getDerived(LV());
    const segs = [];
    for (const info of d.walls.values()) {
      const pts = info.poly;
      for (let i = 0; i < pts.length; i++) segs.push([pts[i], pts[(i + 1) % pts.length]]);
    }
    return segs;
  }

  function rayHit(o, dir, segs, maxD = 2000) {
    let best = maxD;
    for (const [a, b] of segs) {
      const X = lineIntersect(o, dir, a, sub(b, a));
      if (!X || X.t <= 0.5) continue;
      const u = dot(sub(X, a), sub(b, a)) / dot(sub(b, a), sub(b, a));
      if (u < -0.001 || u > 1.001) continue;
      if (X.t < best) best = X.t;
    }
    return best < maxD ? best : null;
  }

  function itemDistances(it) {
    const segs = wallOutlineSegments();
    let s = '';
    const dirs = [[0, -1, it.d / 2], [0, 1, it.d / 2], [-1, 0, it.w / 2], [1, 0, it.w / 2]];
    const side = rot({ x: 1, y: 0 }, it.rot || 0);
    for (const [lx, ly, ext] of dirs) {
      const dir = rot({ x: lx * (it.flip && lx ? -1 : 1), y: ly }, it.rot || 0);
      const o = add({ x: it.x, y: it.y }, mul(dir, ext));
      const t = rayHit(o, dir, segs, 600);
      if (t == null || t < 2) continue;
      const e = add(o, mul(dir, t));
      s += `<path class="ov-dist" d="M${P(o)}L${P(e)}"/>`;
      let tp = mul(add(o, e), 0.5);
      if (ly < 0) tp = add(tp, mul(side, 30 / view.s));
      if (t * view.s > 28) s += tag(tp, fmtCm(Math.round(t)));
    }
    return s;
  }

  function renderOverlay(lv, d) {
    let s = '';
    const single = app.selection.length === 1 ? app.selection[0] : null;
    // selection
    for (const sel of app.selection) {
      if (sel.kind === 'room') {
        const f = d.faces.find((f) => f.roomId === sel.id);
        if (f) s += `<path class="ov-room" d="${pathD(f.inner)}"/>`;
      } else if (sel.kind === 'item') {
        const it = lv.items.find((i) => i.id === sel.id);
        if (!it) continue;
        if (single) {
          const c = { x: it.x, y: it.y };
          const top = add(c, rot({ x: 0, y: -it.d / 2 }, it.rot || 0));
          const hpos = add(c, rot({ x: 0, y: -it.d / 2 - 26 / view.s }, it.rot || 0));
          if (!gesture || gesture.type !== 'rotate') s += itemDistances(it);
          s += `<path class="ov-line" d="M${P(top)}L${P(hpos)}"/>`;
          s += handle(hpos, 'rot', '', 'rot');
          itemCorners(it).forEach((p, i) => (s += handle(p, 'rs' + i, '', 'rs')));
          if (gesture && gesture.type === 'rotate') s += tag(add(hpos, rot({ x: 0, y: -18 / view.s }, it.rot || 0)), Math.round(normDeg(it.rot || 0)) + '°');
          if (gesture && gesture.type === 'resize') s += tag(add(c, { x: 0, y: 0 }), `${Math.round(it.w)} × ${Math.round(it.d)} cm`);
        }
      } else if (sel.kind === 'wall') {
        const info = d.walls.get(sel.id);
        if (!info) continue;
        const w = info.wall;
        s += handle(w.a, 'v', `data-x="${w.a.x}" data-y="${w.a.y}"`);
        s += handle(w.b, 'v', `data-x="${w.b.x}" data-y="${w.b.y}"`);
        const mid = mul(add(w.a, w.b), 0.5);
        s += tag(add(mid, mul(info.n, info.h + 16 / view.s)), fmtM(info.len));
      } else if (sel.kind === 'opening') {
        const o = lv.openings.find((x) => x.id === sel.id);
        const fr = o && openingFrame(lv, o);
        if (!fr) continue;
        const info = fr.info;
        const pL = add(info.a, mul(info.d, fr.u0)), pR = add(info.a, mul(info.d, fr.u1));
        if (single) {
          s += handle(pL, 'opL') + handle(pR, 'opR');
          const off = info.h + 16 / view.s;
          const A0 = add(info.a, mul(info.d, info.uMin)), A1 = add(info.a, mul(info.d, info.uMax));
          if (fr.u0 - info.uMin > 1) s += `<path class="ov-dist" d="M${P(add(A0, mul(info.n, off)))}L${P(add(pL, mul(info.n, off)))}"/>` + tag(add(mul(add(A0, pL), 0.5), mul(info.n, off)), fmtCm(Math.round(fr.u0 - info.uMin)));
          if (info.uMax - fr.u1 > 1) s += `<path class="ov-dist" d="M${P(add(pR, mul(info.n, off)))}L${P(add(A1, mul(info.n, off)))}"/>` + tag(add(mul(add(pR, A1), 0.5), mul(info.n, off)), fmtCm(Math.round(info.uMax - fr.u1)));
          s += tag(add(fr.c, mul(info.n, -(info.h + 16 / view.s))), fmtCm(Math.round(o.width)));
        }
      } else if (sel.kind === 'dim') {
        const dm = lv.dims.find((x) => x.id === sel.id);
        if (dm) s += handle(dm.a, 'dimA') + handle(dm.b, 'dimB');
      }
    }
    // tool previews
    const g = gesture;
    if (g && g.type === 'marquee' && g.cur) {
      const x0 = Math.min(g.start.x, g.cur.x), y0 = Math.min(g.start.y, g.cur.y);
      s += `<rect class="ov-marquee" x="${f1(x0)}" y="${f1(y0)}" width="${f1(Math.abs(g.cur.x - g.start.x))}" height="${f1(Math.abs(g.cur.y - g.start.y))}"/>`;
    }
    if (app.tool === 'wall') {
      if (chain && chain.pts.length && hoverSnap) {
        const last = chain.pts[chain.pts.length - 1];
        const q = hoverSnap;
        const L0 = dist(last, q);
        if (L0 > 0.5) {
          const dd = norm(sub(q, last)), n = perp(dd), h = S().wallThickness / 2;
          const band = [add(last, mul(n, h)), add(q, mul(n, h)), sub(q, mul(n, h)), sub(last, mul(n, h))];
          s += `<path class="ov-fill" d="${pathD(band)}"/>`;
          s += `<path class="ov-line" d="M${P(last)}L${P(q)}"/>`;
          let a = Math.round(normDeg(deg(Math.atan2(-dd.y, dd.x))));
          s += tag(add(mul(add(last, q), 0.5), mul(n, h + 16 / view.s)), fmtM(L0) + (a % 90 ? `  ${a}°` : ''));
        }
        if (chain.pts.length > 1) s += `<path class="ov-dash" d="M${chain.pts.map(P).join('L')}"/>`;
      }
    }
    if (g && g.type === 'roomRect' && g.cur) s += roomPreview(g.start, g.cur);
    if (app.tool === 'room' && roomFirst && hoverSnap && !g) s += roomPreview(roomFirst, hoverSnap);
    const mStart = (g && g.type === 'measure' && g.start) || measureFirst;
    if ((app.tool === 'measure' || app.tool === 'calibrate') && (mStart || calibFirst) && hoverSnap) {
      const a = mStart || calibFirst;
      s += `<path class="ov-line" d="M${P(a)}L${P(hoverSnap)}"/>` + tag(mul(add(a, hoverSnap), 0.5), fmtM(dist(a, hoverSnap)));
    }
    if (hoverSnap && ['wall', 'room', 'measure', 'calibrate'].includes(app.tool)) {
      const r = 7 / view.s;
      if (hoverSnap.kind === 'vertex') s += `<rect class="ov-snap" x="${f1(hoverSnap.x - r)}" y="${f1(hoverSnap.y - r)}" width="${f1(r * 2)}" height="${f1(r * 2)}"/>`;
      else s += `<circle class="ov-snap" cx="${f1(hoverSnap.x)}" cy="${f1(hoverSnap.y)}" r="${f1(r * (hoverSnap.kind === 'wall' ? 0.9 : 0.6))}"/>`;
      for (const gl of hoverSnap.guides || []) s += `<path class="ov-guide" d="M${P(gl[0])}L${P(gl[1])}"/>`;
    }
    if (g && g.guides) for (const gl of g.guides) s += `<path class="ov-guide" d="M${P(gl[0])}L${P(gl[1])}"/>`;
    if (placement && placement.preview) s += placement.preview;
    return s;
  }

  function roomPreview(a, b) {
    const x0 = Math.min(a.x, b.x), y0 = Math.min(a.y, b.y), w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
    const t = S().wallThickness;
    let s = `<rect class="ov-fill" x="${f1(x0 - t / 2)}" y="${f1(y0 - t / 2)}" width="${f1(w + t)}" height="${f1(h + t)}"/>`;
    s += `<rect class="ov-line" x="${f1(x0)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(h)}" fill="none"/>`;
    s += tag({ x: x0 + w / 2, y: y0 - t / 2 - 14 / view.s }, fmtM(w));
    s += tag({ x: x0 - t / 2 - 30 / view.s, y: y0 + h / 2 }, fmtM(h));
    if (w > 50 && h > 50) s += tag({ x: x0 + w / 2, y: y0 + h / 2 }, fmtArea(Math.max(0, (w - t) * (h - t))));
    return s;
  }

  // ---------------------------------------------------------------- snapping
  function snapPoint(p, opts = {}) {
    const lv = LV();
    const tol = 11 / view.s;
    const out = { x: p.x, y: p.y, kind: 'free', guides: [] };
    if (opts.free) return out;
    const verts = uniqueVertices(lv).filter((v) => !opts.exclude || !opts.exclude.some((e) => same(e, v)));
    if (opts.extra) verts.push(...opts.extra);
    let best = null;
    for (const v of verts) {
      const dd = dist(v, p);
      if (dd < tol && (!best || dd < best.d)) best = { v, d: dd };
    }
    if (best) return { x: best.v.x, y: best.v.y, kind: 'vertex', guides: [] };
    let q = { x: p.x, y: p.y };
    let dir = null;
    const from = opts.from;
    if (from && dist(from, p) > 2) {
      const a = Math.atan2(p.y - from.y, p.x - from.x);
      const step = Math.PI / 4;
      const sa = Math.round(a / step) * step;
      if (Math.abs(a - sa) < rad(6)) {
        const L0 = dist(from, p);
        dir = { x: Math.cos(sa), y: Math.sin(sa) };
        if (Math.abs(dir.x) < 1e-9) dir.x = 0;
        if (Math.abs(dir.y) < 1e-9) dir.y = 0;
        q = add(from, mul(dir, L0));
      }
    }
    // walls
    const excludeWalls = opts.excludeWalls || new Set();
    let onWall = null;
    for (const w of lv.walls) {
      if (excludeWalls.has(w.id)) continue;
      if (dir) {
        const X = lineIntersect(from, dir, w.a, sub(w.b, w.a));
        if (X && X.t > 1) {
          const c = closestOnSegment(X, w.a, w.b);
          if (c.d < 0.5 && dist(X, q) < tol && (!onWall || dist(X, q) < onWall.d)) onWall = { x: X.x, y: X.y, d: dist(X, q) };
        }
      } else {
        const c = closestOnSegment(q, w.a, w.b);
        if (c.d < tol * 0.8 && (!onWall || c.d < onWall.d)) onWall = { x: c.x, y: c.y, d: c.d };
      }
    }
    if (onWall) return { x: r2(onWall.x), y: r2(onWall.y), kind: 'wall', guides: [] };
    // alignment guides
    const guides = [];
    let alignedX = false, alignedY = false;
    const canX = !dir || Math.abs(dir.y) > 0.99 ? false : Math.abs(dir.x) > 0.99; // moving horizontally → align x
    const canY = !dir ? false : Math.abs(dir.y) > 0.99;
    let bx = null, by = null;
    for (const v of verts) {
      const dx = Math.abs(v.x - q.x), dy = Math.abs(v.y - q.y);
      if ((!dir || canX) && dx < tol && (!bx || dx < bx.d)) bx = { v, d: dx };
      if ((!dir || canY) && dy < tol && (!by || dy < by.d)) by = { v, d: dy };
    }
    if (bx) { q.x = bx.v.x; alignedX = true; }
    if (by) { q.y = by.v.y; alignedY = true; }
    if (bx) guides.push([{ x: bx.v.x, y: bx.v.y }, { x: q.x, y: q.y }]);
    if (by) guides.push([{ x: by.v.x, y: by.v.y }, { x: q.x, y: q.y }]);
    if (S().snap !== false) {
      if (dir && !alignedX && !alignedY) {
        const L0 = round(dist(from, q), 5);
        q = add(from, mul(dir, L0));
      } else if (!dir) {
        if (!alignedX) q.x = round(q.x, 5);
        if (!alignedY) q.y = round(q.y, 5);
      }
    }
    return { x: r2(q.x), y: r2(q.y), kind: dir ? 'angle' : 'free', guides };
  }

  // ---------------------------------------------------------------- magnet for furniture
  function magnet(it) {
    const def = ITEMS[it.type];
    if (!def || !def.snap || S().magnet === false || def.custom) return null;
    const d = getDerived(LV());
    const back = rot({ x: 0, y: -1 }, it.rot || 0);
    let best = null;
    for (const info of d.walls.values()) {
      for (const side of [1, -1]) {
        const fn = mul(info.n, side);
        if (dot(back, fn) > -Math.cos(rad(35))) continue;
        const faceP = add(info.a, mul(fn, info.h));
        const backC = add({ x: it.x, y: it.y }, mul(back, it.d / 2));
        const rel = sub(backC, faceP);
        const distN = dot(rel, fn);
        const u = dot(rel, info.d);
        if (u < -it.w / 2 + 5 || u > info.len + it.w / 2 - 5) continue;
        if (distN < -12 || distN > 22) continue;
        if (!best || Math.abs(distN) < Math.abs(best.distN)) best = { info, fn, distN, faceP };
      }
    }
    if (!best) return null;
    const { info, fn, faceP } = best;
    it.rot = r2(normDeg(deg(Math.atan2(-fn.x, fn.y))));
    const c = { x: it.x, y: it.y };
    const uC = dot(sub(c, faceP), info.d);
    let center = add(add(faceP, mul(info.d, uC)), mul(fn, it.d / 2 + 0.2));
    // slide into corners
    for (const info2 of d.walls.values()) {
      if (info2 === info) continue;
      for (const side of [1, -1]) {
        const fn2 = mul(info2.n, side);
        if (Math.abs(dot(fn2, info.d)) < 0.97) continue;
        const face2 = add(info2.a, mul(fn2, info2.h));
        const edge = add(center, mul(fn2, -it.w / 2));
        const dn = dot(sub(edge, face2), fn2);
        const along = dot(sub(center, face2), info2.d);
        if (along < -it.d || along > info2.len + it.d) continue;
        if (dn > -8 && dn < 16) center = add(center, mul(fn2, -dn + 0.2));
      }
    }
    it.x = r2(center.x);
    it.y = r2(center.y);
    return best;
  }

  // ---------------------------------------------------------------- hit testing
  function hitInfo(e) {
    const t = e.target;
    const h = t.closest && t.closest('[data-h]');
    if (h) return { handle: h.getAttribute('data-h'), el: h };
    const k = t.closest && t.closest('[data-k]');
    if (k) return { kind: k.getAttribute('data-k'), id: k.getAttribute('data-id') };
    return {};
  }

  function vertexNear(p, tolPx = 9) {
    const tol = tolPx / view.s;
    let best = null;
    for (const v of uniqueVertices(LV())) {
      const dd = dist(v, p);
      if (dd < tol && (!best || dd < best.d)) best = { v, d: dd };
    }
    return best ? best.v : null;
  }

  // ---------------------------------------------------------------- pointer handling
  function onDown(e) {
    if (e.button === 2 && app.tool === 'wall' && chain) {
      finishChain();
      return;
    }
    svg.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [p1, p2] = [...pointers.values()];
      if (gesture && gesture.moved && gesture.key) endGesture(true);
      gesture = { type: 'pinch', d0: Math.hypot(p1.x - p2.x, p1.y - p2.y), s0: view.s, mid0: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }, tx0: view.tx, ty0: view.ty };
      return;
    }
    if (pointers.size > 2) return;
    const w = toWorld(e.clientX, e.clientY);
    const base = { sx: e.clientX, sy: e.clientY, start: w, moved: false, pointerType: e.pointerType, shift: e.shiftKey, alt: e.altKey };
    if (e.button === 1 || e.button === 2 || spaceDown) {
      gesture = { ...base, type: 'pan', tx0: view.tx, ty0: view.ty };
      return;
    }
    const hit = hitInfo(e);
    switch (app.tool) {
      case 'select': return downSelect(e, w, hit, base);
      case 'wall': gesture = { ...base, type: 'click', tx0: view.tx, ty0: view.ty }; return;
      case 'room': {
        const sp = snapPoint(w);
        if (roomFirst) { gesture = { ...base, type: 'click', tx0: view.tx, ty0: view.ty }; return; }
        gesture = { ...base, type: 'roomRect', start: { x: sp.x, y: sp.y }, cur: null, tx0: view.tx, ty0: view.ty };
        return;
      }
      case 'measure': {
        if (measureFirst) { gesture = { ...base, type: 'click', tx0: view.tx, ty0: view.ty }; return; }
        const sp = snapPoint(w);
        gesture = { ...base, type: 'measure', start: { x: sp.x, y: sp.y }, tx0: view.tx, ty0: view.ty };
        return;
      }
      default:
        gesture = { ...base, type: 'click', tx0: view.tx, ty0: view.ty };
    }
  }

  function downSelect(e, w, hit, base) {
    const lv = LV();
    if (hit.handle) {
      const sel = app.selection[0];
      const key = 'drag:' + uid();
      if (hit.handle === 'rot') gesture = { ...base, type: 'rotate', id: sel.id, key };
      else if (hit.handle.startsWith('rs')) {
        const it = lv.items.find((i) => i.id === sel.id);
        const idx = +hit.handle.slice(2);
        const corners = itemCorners(it);
        gesture = { ...base, type: 'resize', id: sel.id, idx, anchor: corners[(idx + 2) % 4], w0: it.w, d0: it.d, key };
      } else if (hit.handle === 'v') {
        const v = { x: +hit.el.getAttribute('data-x'), y: +hit.el.getAttribute('data-y') };
        startVertexDrag(v, base);
      } else if (hit.handle === 'opL' || hit.handle === 'opR') gesture = { ...base, type: 'opResize', id: sel.id, side: hit.handle === 'opL' ? -1 : 1, key };
      else if (hit.handle === 'dimA' || hit.handle === 'dimB') gesture = { ...base, type: 'dimEnd', id: sel.id, end: hit.handle === 'dimA' ? 'a' : 'b', key };
      return;
    }
    // vertex grab near wall corners
    if (!hit.kind || hit.kind === 'wall' || hit.kind === 'room') {
      const v = vertexNear(w, base.pointerType === 'touch' ? 14 : 9);
      if (v) {
        startVertexDrag(v, base);
        return;
      }
    }
    if (hit.kind === 'item' || hit.kind === 'opening' || hit.kind === 'wall' || hit.kind === 'label' || hit.kind === 'dim') {
      const already = isSel(hit.kind, hit.id);
      if (e.shiftKey) app.toggleSelect({ kind: hit.kind, id: hit.id });
      else if (!already) app.select([{ kind: hit.kind, id: hit.id }]);
      const key = 'drag:' + uid();
      if (hit.kind === 'item' || hit.kind === 'label') {
        const ids = app.selection.filter((s) => s.kind === 'item' || s.kind === 'label');
        gesture = {
          ...base, type: 'move', key,
          origs: ids.map((s) => {
            const o = s.kind === 'item' ? lv.items.find((i) => i.id === s.id) : lv.labels.find((l) => l.id === s.id);
            return o ? { kind: s.kind, id: s.id, x: o.x, y: o.y, rot: o.rot } : null;
          }).filter(Boolean),
          primary: hit.id,
        };
      } else if (hit.kind === 'opening') gesture = { ...base, type: 'opMove', id: hit.id, key };
      else if (hit.kind === 'wall') {
        const wall = lv.walls.find((x) => x.id === hit.id);
        gesture = {
          ...base, type: 'wallMove', id: hit.id, key, n: perp(norm(sub(wall.b, wall.a))),
          A: { ...wall.a }, B: { ...wall.b }, endsA: endsAt(lv, wall.a).map((e2) => ({ id: e2.w.id, end: e2.end })), endsB: endsAt(lv, wall.b).map((e2) => ({ id: e2.w.id, end: e2.end })),
        };
      } else if (hit.kind === 'dim') gesture = { ...base, type: 'dimMove', id: hit.id, key, a0: { ...lv.dims.find((x) => x.id === hit.id).a }, b0: { ...lv.dims.find((x) => x.id === hit.id).b } };
      return;
    }
    gesture = { ...base, type: 'pending', hit, tx0: view.tx, ty0: view.ty };
  }

  function startVertexDrag(v, base) {
    const lv = LV();
    const ends = endsAt(lv, v).map((e) => ({ id: e.w.id, end: e.end }));
    gesture = { ...base, type: 'vertex', v0: { ...v }, ends, key: 'drag:' + uid(), excludeWalls: new Set(ends.map((e) => e.id)) };
  }

  function onMove(e) {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const w = toWorld(e.clientX, e.clientY);
    cursorWorld = w;
    app.emit('cursor', w);
    const g = gesture;
    if (g && g.type === 'pinch') {
      if (pointers.size < 2) return;
      const [p1, p2] = [...pointers.values()];
      const d0 = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const r = svg.getBoundingClientRect();
      const ns = clamp(g.s0 * (d0 / g.d0), 0.04, 10);
      const wx = (g.mid0.x - r.left - g.tx0) / g.s0, wy = (g.mid0.y - r.top - g.ty0) / g.s0;
      view.s = ns;
      view.tx = mid.x - r.left - wx * ns;
      view.ty = mid.y - r.top - wy * ns;
      render();
      return;
    }
    if (!g) {
      updateHover(w, e);
      return;
    }
    const dx = e.clientX - g.sx, dy = e.clientY - g.sy;
    const thr = g.pointerType === 'touch' ? 7 : 4;
    if (!g.moved && Math.hypot(dx, dy) < thr) return;
    const first = !g.moved;
    g.moved = true;
    switch (g.type) {
      case 'pan':
      case 'click':
      case 'pending': {
        if (g.type === 'pending' && g.shift) {
          g.type = 'marquee';
          g.cur = w;
          render();
          return;
        }
        if (g.type !== 'pan') g.type = 'pan';
        view.tx = g.tx0 + dx;
        view.ty = g.ty0 + dy;
        renderView();
        return;
      }
      case 'marquee':
        g.cur = w;
        render();
        return;
      case 'move': return dragMove(g, w, e);
      case 'rotate': return dragRotate(g, w, e);
      case 'resize': return dragResize(g, w, e);
      case 'opMove': return dragOpening(g, w);
      case 'opResize': return dragOpResize(g, w);
      case 'vertex': return dragVertex(g, w, e);
      case 'wallMove': return dragWall(g, w);
      case 'dimEnd': {
        const sp = snapPoint(w);
        app.mutate(() => {
          const dm = LV().dims.find((x) => x.id === g.id);
          if (dm) dm[g.end] = { x: sp.x, y: sp.y };
        }, g.key);
        hoverSnap = sp;
        return;
      }
      case 'dimMove': {
        const dd = sub(w, g.start);
        app.mutate(() => {
          const dm = LV().dims.find((x) => x.id === g.id);
          if (dm) { dm.a = add(g.a0, dd); dm.b = add(g.b0, dd); }
        }, g.key);
        return;
      }
      case 'roomRect':
      case 'measure': {
        const sp = snapPoint(w, g.type === 'measure' ? { from: g.start } : {});
        g.cur = { x: sp.x, y: sp.y };
        hoverSnap = sp;
        render();
        return;
      }
      default:
        if (first) render();
    }
  }

  function updateHover(w, e) {
    const tool = app.tool;
    if (tool === 'wall') {
      hoverSnap = snapPoint(w, { from: chain ? chain.pts[chain.pts.length - 1] : null, free: e.altKey, extra: chain ? chain.pts.slice(0, -1) : [] });
      positionLenInput();
      render();
    } else if (tool === 'room' || tool === 'measure' || tool === 'calibrate') {
      const from = tool === 'measure' ? measureFirst : tool === 'calibrate' ? calibFirst : null;
      hoverSnap = tool === 'calibrate' ? { x: w.x, y: w.y, kind: 'free', guides: [] } : snapPoint(w, { from, free: e.altKey });
      render();
    } else if (hoverSnap) {
      hoverSnap = null;
      render();
    }
  }

  function dragMove(g, w, e) {
    const lv = LV();
    let delta = sub(w, g.start);
    app.mutate(() => {
      const prim = g.origs.find((o) => o.id === g.primary) || g.origs[0];
      for (const o of g.origs) {
        const obj = o.kind === 'item' ? lv.items.find((i) => i.id === o.id) : lv.labels.find((l) => l.id === o.id);
        if (!obj) continue;
        obj.x = r2(o.x + delta.x);
        obj.y = r2(o.y + delta.y);
        if (o.kind === 'item') obj.rot = o.rot;
      }
      // magnet only when one item moves
      if (g.origs.length === 1 && prim.kind === 'item' && !e.altKey) {
        const it = lv.items.find((i) => i.id === prim.id);
        if (it && !magnet(it) && S().snap !== false) {
          it.x = round(it.x, 1);
          it.y = round(it.y, 1);
        }
      }
    }, g.key);
  }

  function dragRotate(g, w, e) {
    const it = LV().items.find((i) => i.id === g.id);
    if (!it) return;
    let a = deg(Math.atan2(w.x - it.x, -(w.y - it.y)));
    if (!e.shiftKey) a = Math.round(a / 15) * 15;
    app.mutate(() => { it.rot = r2(normDeg(a)); }, g.key);
    g.guides = null;
  }

  function dragResize(g, w, e) {
    const it = LV().items.find((i) => i.id === g.id);
    if (!it) return;
    const def = ITEMS[it.type];
    const signs = [[-1, -1], [1, -1], [1, 1], [-1, 1]][g.idx];
    const q = rot(sub(w, g.anchor), -(it.rot || 0));
    let nw = Math.max(5, q.x * signs[0]), nd = Math.max(5, q.y * signs[1]);
    if (def.keepRatio || e.shiftKey) {
      const k = Math.max(nw / g.w0, nd / g.d0);
      nw = g.w0 * k;
      nd = g.d0 * k;
    }
    const st = S().snap !== false ? 5 : 1;
    nw = Math.max(5, round(nw, st));
    nd = Math.max(5, round(nd, st));
    const c = add(g.anchor, rot({ x: (signs[0] * nw) / 2, y: (signs[1] * nd) / 2 }, it.rot || 0));
    app.mutate(() => {
      it.w = nw; it.d = nd; it.x = r2(c.x); it.y = r2(c.y);
    }, g.key);
  }

  function dragOpening(g, w) {
    const lv = LV();
    const o = lv.openings.find((x) => x.id === g.id);
    if (!o) return;
    const nw = nearestWall(lv, w, 90 / view.s);
    if (!nw) return;
    const st = S().snap !== false ? 5 : 1;
    app.mutate(() => {
      if (o.wallId !== nw.info.id) o.wallId = nw.info.id;
      o.offset = r2(round(nw.u, st));
      const fr = openingFrame(lv, o);
      if (fr) o.offset = r2(fr.u);
    }, g.key);
  }

  function dragOpResize(g, w) {
    const lv = LV();
    const o = lv.openings.find((x) => x.id === g.id);
    const fr = o && openingFrame(lv, o);
    if (!fr) return;
    const info = fr.info;
    const u = clamp(dot(sub(w, info.a), info.d), info.uMin, info.uMax);
    const other = g.side < 0 ? fr.u1 : fr.u0;
    const st = S().snap !== false ? 5 : 1;
    let nw = Math.max(30, round(Math.abs(other - u), st));
    const center = g.side < 0 ? other - nw / 2 : other + nw / 2;
    app.mutate(() => {
      o.width = nw;
      o.offset = r2(center);
    }, g.key);
  }

  function dragVertex(g, w, e) {
    const lv = LV();
    const cur = (() => {
      const first = g.ends[0];
      const wall = first && lv.walls.find((x) => x.id === first.id);
      return wall ? wall[first.end] : g.v0;
    })();
    const sp = snapPoint(w, { exclude: [cur], excludeWalls: g.excludeWalls, free: e.altKey });
    hoverSnap = null;
    g.guides = sp.guides;
    app.mutate(() => {
      for (const en of g.ends) {
        const wall = lv.walls.find((x) => x.id === en.id);
        if (wall) wall[en.end] = { x: sp.x, y: sp.y };
      }
    }, g.key);
  }

  function dragWall(g, w) {
    const lv = LV();
    let off = dot(sub(w, g.start), g.n);
    if (S().snap !== false) off = round(off, 5);
    const dv = mul(g.n, off);
    const A = add(g.A, dv), B = add(g.B, dv);
    app.mutate(() => {
      for (const en of g.endsA) {
        const wall = lv.walls.find((x) => x.id === en.id);
        if (wall) wall[en.end] = { x: r2(A.x), y: r2(A.y) };
      }
      for (const en of g.endsB) {
        const wall = lv.walls.find((x) => x.id === en.id);
        if (wall) wall[en.end] = { x: r2(B.x), y: r2(B.y) };
      }
    }, g.key);
  }

  function onUp(e) {
    pointers.delete(e.pointerId);
    const g = gesture;
    if (!g) return;
    if (g.type === 'pinch') {
      if (pointers.size === 0) gesture = null;
      return;
    }
    const w = toWorld(e.clientX, e.clientY);
    if (!g.moved) {
      gesture = null;
      clickAt(w, g, e);
      render();
      return;
    }
    endGesture(false, w);
  }

  function endGesture(cancelled, w) {
    const g = gesture;
    gesture = null;
    if (!g) return;
    const lv = LV();
    if (g.type === 'vertex' || g.type === 'wallMove') {
      app.mutate(() => normalizeWalls(lv), g.key);
    } else if (g.type === 'marquee' && g.cur) {
      const x0 = Math.min(g.start.x, g.cur.x), x1 = Math.max(g.start.x, g.cur.x);
      const y0 = Math.min(g.start.y, g.cur.y), y1 = Math.max(g.start.y, g.cur.y);
      const inside = (p) => p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1;
      const sel = [];
      for (const it of lv.items) if (inside(it)) sel.push({ kind: 'item', id: it.id });
      for (const l of lv.labels) if (inside(l)) sel.push({ kind: 'label', id: l.id });
      for (const wl of lv.walls) if (inside(wl.a) && inside(wl.b)) sel.push({ kind: 'wall', id: wl.id });
      app.select(sel);
    } else if (g.type === 'roomRect' && !cancelled) {
      if (g.cur) createRoomRect(g.start, g.cur);
    } else if (g.type === 'measure' && !cancelled && g.cur) {
      if (dist(g.start, g.cur) > 5) {
        const dm = { id: uid('dm_'), a: { ...g.start }, b: { ...g.cur } };
        app.mutate(() => lv.dims.push(dm));
        app.select([{ kind: 'dim', id: dm.id }]);
      }
    }
    g.guides = null;
    hoverSnap = null;
    render();
  }

  function clickAt(w, g, e) {
    const lv = LV();
    switch (app.tool) {
      case 'select': {
        if (g.type === 'pending') {
          if (g.hit && g.hit.kind === 'room') {
            if (g.shift) app.toggleSelect({ kind: 'room', id: g.hit.id });
            else app.select([{ kind: 'room', id: g.hit.id }]);
          } else if (!g.shift) app.select([]);
        }
        return;
      }
      case 'wall': return wallClick(w, e);
      case 'room': {
        if (g.type === 'roomRect') {
          roomFirst = g.start;
          app.hint('Zweite Ecke anklicken, um den Raum zu erstellen.');
          return;
        }
        if (roomFirst) {
          const sp = snapPoint(w);
          createRoomRect(roomFirst, sp);
          roomFirst = null;
        }
        return;
      }
      case 'measure': {
        if (g.type === 'measure') {
          measureFirst = g.start;
          return;
        }
        if (measureFirst) {
          const sp = snapPoint(w, { from: measureFirst });
          if (dist(sp, measureFirst) > 5) {
            const dm = { id: uid('dm_'), a: { ...measureFirst }, b: { x: sp.x, y: sp.y } };
            app.mutate(() => lv.dims.push(dm));
          }
          measureFirst = null;
        }
        return;
      }
      case 'text': {
        const lb = { id: uid('lb_'), x: r2(w.x), y: r2(w.y), text: 'Text', size: 16 };
        app.mutate(() => lv.labels.push(lb));
        app.setTool('select');
        app.select([{ kind: 'label', id: lb.id }]);
        app.focusField('label-text');
        return;
      }
      case 'calibrate': {
        if (!calibFirst) {
          calibFirst = { x: w.x, y: w.y };
          app.hint('Jetzt den zweiten Punkt anklicken.');
          return;
        }
        const a = calibFirst, b = { x: w.x, y: w.y };
        calibFirst = null;
        const measured = dist(a, b);
        if (measured < 5) return;
        app.askLength('Wie lang ist diese Strecke in Wirklichkeit?', fmtM(measured)).then((real) => {
          if (!real || !lv.background) return;
          const k = real / measured;
          app.mutate(() => {
            const bg = lv.background;
            bg.x = r2(a.x + (bg.x - a.x) * k);
            bg.y = r2(a.y + (bg.y - a.y) * k);
            bg.width = r2(bg.width * k);
          });
          app.setTool('select');
          app.toast('Massstab der Vorlage angepasst.');
        });
        return;
      }
      default:
    }
  }

  function createRoomRect(a, b) {
    const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
    if (x1 - x0 < 30 || y1 - y0 < 30) return;
    const lv = LV();
    const t = S().wallThickness;
    app.mutate(() => {
      const pts = [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }];
      for (let i = 0; i < 4; i++) addWallSegment(lv, pts[i], pts[(i + 1) % 4], { thickness: t });
      normalizeWalls(lv);
    });
    const d = getDerived(lv);
    const c = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
    const f = d.faces.find((f) => f.poly.length && pointInPoly(c, f.poly));
    if (f) app.select([{ kind: 'room', id: f.roomId }]);
  }

  function pointInPoly(p, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const a = pts[i], b = pts[j];
      if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
  }

  // ---------------------------------------------------------------- wall tool
  function wallClick(w, e) {
    const sp = snapPoint(w, { from: chain ? chain.pts[chain.pts.length - 1] : null, free: e && e.altKey, extra: chain ? chain.pts.slice(0, -1) : [] });
    const p = { x: sp.x, y: sp.y };
    if (!chain) {
      chain = { pts: [p] };
      hoverSnap = sp;
      app.hint('Nächsten Punkt anklicken · Länge eintippen + Enter · Doppelklick oder Esc beendet die Wand.');
      app.emit('chain', true);
      return;
    }
    addChainPoint(p);
  }

  function addChainPoint(p) {
    const last = chain.pts[chain.pts.length - 1];
    if (dist(last, p) < 1) {
      finishChain();
      return;
    }
    const lv = LV();
    app.mutate(() => {
      addWallSegment(lv, last, p, { thickness: S().wallThickness });
      normalizeWalls(lv);
    });
    chain.pts.push(p);
    if (chain.pts.length > 2 && same(p, chain.pts[0], 1)) finishChain();
  }

  function finishChain() {
    chain = null;
    lenInput.hidden = true;
    hoverSnap = null;
    app.emit('chain', false);
    app.hint(toolHint('wall'));
    render();
  }

  function positionLenInput() {
    if (lenInput.hidden || !chain) return;
    const last = chain.pts[chain.pts.length - 1];
    const sp = toScreen(hoverSnap || last);
    lenInput.style.left = Math.round(sp.x + 14) + 'px';
    lenInput.style.top = Math.round(sp.y + 14) + 'px';
  }

  function applyTypedLength() {
    const L0 = parseLength(lenInput.value);
    lenInput.value = '';
    lenInput.hidden = true;
    svg.focus?.();
    if (!chain || !(L0 > 1)) return;
    const last = chain.pts[chain.pts.length - 1];
    let dir = hoverSnap && dist(hoverSnap, last) > 1 ? norm(sub(hoverSnap, last)) : { x: 1, y: 0 };
    const p = { x: r2(last.x + dir.x * L0), y: r2(last.y + dir.y * L0) };
    addChainPoint(p);
    hoverSnap = { ...p, kind: 'free', guides: [] };
    render();
  }

  lenInput.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') { e.preventDefault(); applyTypedLength(); }
    else if (e.key === 'Escape') { lenInput.value = ''; lenInput.hidden = true; }
  });

  function toolHint(tool) {
    switch (tool) {
      case 'wall': return 'Startpunkt der Wand anklicken. Raster und Ecken rasten ein (Alt = frei).';
      case 'room': return 'Rechteck aufziehen oder zwei Ecken anklicken, um einen Raum mit Wänden zu erstellen.';
      case 'measure': return 'Zwei Punkte anklicken, um eine Masslinie zu setzen.';
      case 'text': return 'Klicken, um einen Text zu platzieren.';
      case 'calibrate': return 'Zwei Punkte auf der Vorlage anklicken, deren echter Abstand bekannt ist.';
      default: return 'Klicken = auswählen · Ziehen = verschieben · leere Fläche ziehen = Ansicht schieben · Shift+Ziehen = Mehrfachauswahl';
    }
  }

  // ---------------------------------------------------------------- keyboard (called by app)
  function onKey(e) {
    if (app.tool === 'wall' && chain) {
      if (/^[0-9.,]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
        lenInput.hidden = false;
        lenInput.value = e.key;
        positionLenInput();
        lenInput.focus();
        e.preventDefault();
        return true;
      }
      if (e.key === 'Enter' || e.key === 'Escape') { finishChain(); return true; }
      if (e.key === 'Backspace') {
        if (chain.pts.length > 1) { app.undo(); chain.pts.pop(); render(); }
        else finishChain();
        return true;
      }
    }
    if (e.key === 'Escape') {
      if (roomFirst || measureFirst || calibFirst || gesture) {
        roomFirst = measureFirst = calibFirst = null;
        if (gesture) endGesture(true);
        render();
        return true;
      }
    }
    if (e.key === ' ' && !e.repeat) { spaceDown = true; svg.classList.add('panning'); }
    return false;
  }
  function onKeyUp(e) {
    if (e.key === ' ') { spaceDown = false; svg.classList.remove('panning'); }
  }

  function onWheel(e) {
    e.preventDefault();
    const r = svg.getBoundingClientRect();
    const sx = e.clientX - r.left, sy = e.clientY - r.top;
    if (e.ctrlKey || e.metaKey) {
      zoomAt(Math.exp(-e.deltaY * 0.01), sx, sy);
    } else if (Math.abs(e.deltaX) > 1 && Math.abs(e.deltaX) >= Math.abs(e.deltaY) * 0.5) {
      view.tx -= e.deltaX;
      view.ty -= e.deltaY;
      renderView();
    } else {
      const dy = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
      zoomAt(Math.exp(-dy * 0.0016), sx, sy);
    }
  }

  function onDbl(e) {
    if (app.tool !== 'select') return;
    const hit = hitInfo(e);
    if (hit.kind === 'room') app.focusField('room-name');
    else if (hit.kind === 'label') app.focusField('label-text');
    else if (hit.kind) app.openProps();
  }

  svg.addEventListener('pointerdown', onDown);
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerup', onUp);
  svg.addEventListener('pointercancel', onUp);
  svg.addEventListener('pointerleave', () => { if (!gesture && hoverSnap) { hoverSnap = null; render(); } });
  svg.addEventListener('wheel', onWheel, { passive: false });
  svg.addEventListener('dblclick', onDbl);
  svg.addEventListener('contextmenu', (e) => e.preventDefault());

  // ---------------------------------------------------------------- placement from catalogue
  function buildPlacement(kind, type, w) {
    const lv = LV();
    if (kind === 'item') {
      const it = { ...defaultItem(type), id: 'ghost', x: r2(w.x), y: r2(w.y) };
      const def = ITEMS[type];
      if (def.mount === 'ceiling') it.elev = Math.max(0, lv.height - it.h);
      if (def.custom) it.elev = lv.height;
      magnet(it);
      return { item: it, preview: `<g class="ghost-item" transform="${itemTransform(it)}">${itemSymbol(it)}</g>` };
    }
    const def = OPENINGS[type];
    const nw = nearestWall(lv, w, 120 / view.s);
    if (!nw) return { preview: tag(w, 'Auf eine Wand ziehen') };
    const o = { id: 'ghost', wallId: nw.info.id, type, offset: nw.u, width: def.w, height: def.h, sill: def.sill, flip: false, swing: nw.side < 0, color: def.color };
    const fr = openingFrame(lv, o);
    if (!fr) return { preview: '' };
    o.offset = fr.u;
    return { opening: o, preview: `<g class="ghost-item" transform="translate(${P(fr.c)}) rotate(${f1(fr.ang)})">${openingSymbol(def, o, fr.info.wall.thickness)}</g>` };
  }

  function placementPreview(kind, type, cx, cy) {
    const w = toWorld(cx, cy);
    placement = { kind, type, ...buildPlacement(kind, type, w) };
    render();
  }
  function clearPlacement() {
    placement = null;
    render();
  }
  function placeAt(kind, type, cx, cy) {
    const w = toWorld(cx, cy);
    const pl = buildPlacement(kind, type, w);
    placement = null;
    return commitPlacement(kind, pl);
  }
  function commitPlacement(kind, pl) {
    const lv = LV();
    if (kind === 'item' && pl.item) {
      const it = { ...pl.item, id: uid('it_') };
      app.mutate(() => lv.items.push(it));
      app.select([{ kind: 'item', id: it.id }]);
      return true;
    }
    if (kind === 'opening' && pl.opening) {
      const o = { ...pl.opening, id: uid('op_') };
      app.mutate(() => lv.openings.push(o));
      app.select([{ kind: 'opening', id: o.id }]);
      return true;
    }
    if (kind === 'opening') app.toast('Türen und Fenster bitte auf eine Wand ziehen.');
    render();
    return false;
  }
  function placeDefault(kind, type) {
    const c = worldCenter();
    if (kind === 'opening') {
      const nw = nearestWall(LV(), c, Infinity);
      if (!nw) {
        app.toast('Zuerst Wände zeichnen, dann Türen und Fenster platzieren.');
        return false;
      }
      const p = add(nw.info.a, mul(nw.info.d, nw.u));
      return commitPlacement(kind, buildPlacement(kind, type, p));
    }
    return commitPlacement(kind, buildPlacement(kind, type, c));
  }

  // ---------------------------------------------------------------- export
  function exportSvgString({ withTitle = true } = {}) {
    const lv = LV();
    const d = getDerived(lv);
    const b = levelBounds(lv) || { minX: 0, minY: 0, maxX: 500, maxY: 400, w: 500, h: 400 };
    const pxPerCm = 1.0;
    const margin = 90;
    const titleH = withTitle ? 120 : 0;
    const W = Math.round(b.w * pxPerCm + margin * 2);
    const H = Math.round(b.h * pxPerCm + margin * 2 + titleH);
    const saved = { ...view };
    const savedSel = app.selection;
    view.s = pxPerCm;
    view.tx = margin - b.minX * pxPerCm;
    view.ty = margin - b.minY * pxPerCm;
    app.selection = [];
    const body = `<g transform="translate(${f1(view.tx)} ${f1(view.ty)}) scale(${view.s})">${renderRooms(lv, d)}${renderBackground(lv)}${renderItems(lv, false)}${renderWalls(d)}${renderOpenings(lv)}${renderItems(lv, true)}${renderLabels(lv, d)}${renderDims(lv, d)}</g>`;
    const floorDefs = defsFloors.innerHTML;
    let title = '';
    if (withTitle) {
      const stats = d.faces.reduce((s, f) => s + f.netArea, 0);
      const date = new Date().toLocaleDateString('de-CH');
      const bx = W - margin - 340, by = H - titleH + 10;
      const scaleLen = 100 * pxPerCm;
      title = `<g><rect class="tb-box" x="${bx}" y="${by}" width="340" height="86"/>
        <text class="tb-t" x="${bx + 14}" y="${by + 28}" font-size="18" font-weight="700">${escapeHtml(app.project.name)}</text>
        <text class="tb-m" x="${bx + 14}" y="${by + 52}" font-size="14">${escapeHtml(lv.name)} · Wohnfläche ${fmtArea(stats)}</text>
        <text class="tb-m" x="${bx + 14}" y="${by + 72}" font-size="13">${date} · Grundriss Studio</text>
        <path d="M${margin} ${by + 60}h${scaleLen}" stroke="#1e262b" stroke-width="3"/><path d="M${margin} ${by + 52}v16M${margin + scaleLen} ${by + 52}v16" stroke="#1e262b" stroke-width="1.5"/>
        <text class="tb-m" x="${margin}" y="${by + 44}" font-size="13">1 m</text></g>`;
    }
    view.s = saved.s; view.tx = saved.tx; view.ty = saved.ty;
    app.selection = savedSel;
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><style>${EXPORT_VARS}${PLAN_CSS}</style><defs>${floorDefs}</defs><rect width="100%" height="100%" fill="#ffffff"/>${body}${title}</svg>`,
      width: W, height: H,
    };
  }

  async function exportPngBlob(scale = 2) {
    const { svg: str, width, height } = exportSvgString();
    const img = new Image();
    img.decoding = 'async';
    const url = URL.createObjectURL(new Blob([str], { type: 'image/svg+xml' }));
    try {
      img.src = url;
      await img.decode();
      const k = Math.min(scale, 8000 / Math.max(width, height));
      const c = document.createElement('canvas');
      c.width = Math.round(width * k);
      c.height = Math.round(height * k);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      return await new Promise((res) => c.toBlob(res, 'image/png'));
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // ---------------------------------------------------------------- api
  return {
    el: svg,
    render,
    fit,
    fitHouse() { fit(houseBounds()); },
    zoomBy,
    zoomAt,
    get scale() { return view.s; },
    worldCenter,
    toWorld,
    onKey,
    onKeyUp,
    toolChanged(tool) {
      chain = null;
      roomFirst = measureFirst = calibFirst = null;
      hoverSnap = null;
      lenInput.hidden = true;
      app.hint(toolHint(tool));
      render();
    },
    finishChain,
    get drawing() { return !!chain; },
    placementPreview,
    clearPlacement,
    placeAt,
    placeDefault,
    exportSvgString,
    exportPngBlob,
    resized() { render(); },
    clearSymbolCache() { symCache.clear(); },
    magnet,
  };
}
