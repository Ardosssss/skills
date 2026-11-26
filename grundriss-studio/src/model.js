// Grundriss Studio – project model, wall graph and room detection
import {
  EPS, uid, clamp, r2, add, sub, mul, dot, cross, dist, norm, perp, same, len, deg,
  onSegmentInterior, segmentsCross, lineIntersect, polygonArea, pointInPolygon, labelPoint,
  offsetPolygonLeft, bbox, deepClone, rot,
} from './util.js';

export const APP_ID = 'grundriss-studio';
export const FORMAT_VERSION = 1;

export const DEFAULT_SETTINGS = {
  wallThickness: 20,
  wallHeight: 250,
  exteriorColor: '#ece8e1',
  exteriorTex: 'plaster',
  groundColor: '#a9b78f',
  showDims: true,
  showGrid: true,
  snap: true,
  magnet: true,
  showGhost: true,
  doorsOpen: false,
};

export const ROOM_NAMES = [
  'Wohnzimmer', 'Küche', 'Essbereich', 'Wohnen & Essen', 'Schlafzimmer', 'Kinderzimmer', 'Gästezimmer',
  'Bad', 'Dusche/WC', 'Gäste-WC', 'Flur', 'Eingang', 'Büro', 'Ankleide', 'Abstellraum', 'Reduit',
  'Waschküche', 'Technik', 'Keller', 'Garage', 'Treppenhaus', 'Balkon', 'Terrasse', 'Wintergarten', 'Garten',
];

/** Floor material suggestion per room name. */
export const ROOM_FLOOR_HINT = {
  'Küche': 'tiles-grey', 'Bad': 'tiles-white', 'Dusche/WC': 'tiles-white', 'Gäste-WC': 'tiles-white',
  'Flur': 'tiles-grey', 'Eingang': 'stone', 'Waschküche': 'concrete', 'Technik': 'concrete', 'Keller': 'concrete',
  'Garage': 'concrete', 'Balkon': 'deck', 'Terrasse': 'stone', 'Garten': 'grass', 'Kinderzimmer': 'lightwood',
  'Schlafzimmer': 'oak', 'Wohnzimmer': 'oak', 'Wohnen & Essen': 'oak', 'Büro': 'oak', 'Reduit': 'concrete',
};

// ---------------------------------------------------------------------------
// Creation
// ---------------------------------------------------------------------------
export function createProject(name = 'Neues Projekt') {
  const now = Date.now();
  return {
    app: APP_ID,
    version: FORMAT_VERSION,
    id: uid('proj_'),
    name,
    createdAt: now,
    updatedAt: now,
    settings: { ...DEFAULT_SETTINGS },
    levels: [createLevel('Erdgeschoss', 0, DEFAULT_SETTINGS.wallHeight)],
    assets: {},
  };
}

export function createLevel(name, elevation, height) {
  return {
    id: uid('lv_'), name, elevation, height,
    walls: [], openings: [], rooms: [], items: [], labels: [], dims: [], background: null,
  };
}

export function createRoomRecord(level, anchor) {
  const used = new Set(level.rooms.map((r) => r.name));
  let n = 1;
  while (used.has('Raum ' + n)) n++;
  return {
    id: uid('rm_'), name: 'Raum ' + n, floor: 'oak', wallColor: '#f4f2ee', wallTex: 'paint',
    ceiling: true, showFloor: true, anchor: anchor ? { x: anchor.x, y: anchor.y } : null,
  };
}

// ---------------------------------------------------------------------------
// Vertices & helpers
// ---------------------------------------------------------------------------
export const wallLength = (w) => dist(w.a, w.b);
export const wallHeight = (level, w) => (w.height == null ? level.height : w.height);
const vkey = (p) => Math.round(p.x * 10) + ',' + Math.round(p.y * 10);

export function uniqueVertices(level) {
  const out = [];
  for (const w of level.walls) {
    for (const p of [w.a, w.b]) if (!out.some((v) => same(v, p))) out.push({ x: p.x, y: p.y });
  }
  return out;
}

/** All wall endpoints at point p: [{w, end:'a'|'b'}]. */
export function endsAt(level, p, eps = EPS) {
  const out = [];
  for (const w of level.walls) {
    if (same(w.a, p, eps)) out.push({ w, end: 'a' });
    if (same(w.b, p, eps)) out.push({ w, end: 'b' });
  }
  return out;
}

function splitWallAt(level, w, pts) {
  const sorted = pts
    .map((p) => ({ p, t: dist(w.a, p) }))
    .sort((x, y) => x.t - y.t);
  let cur = w;
  let consumed = 0;
  for (const { p, t } of sorted) {
    const tt = t - consumed;
    if (tt < EPS || dist(p, cur.b) < EPS) continue;
    const w2 = { ...deepClone(cur), id: uid('w_'), a: { x: p.x, y: p.y }, b: { ...cur.b } };
    cur.b = { x: p.x, y: p.y };
    level.walls.splice(level.walls.indexOf(cur) + 1, 0, w2);
    for (const o of level.openings) {
      if (o.wallId === cur.id && o.offset > tt) {
        o.wallId = w2.id;
        o.offset -= tt;
      }
    }
    consumed += tt;
    cur = w2;
  }
}

/** Split one wall at a point on it (used by the "split wall" action). */
export function splitWallAtPoint(level, wallId, p) {
  const w = level.walls.find((x) => x.id === wallId);
  if (!w) return;
  splitWallAt(level, w, [{ x: r2(p.x), y: r2(p.y) }]);
}

/**
 * Insert a wall segment a→b into the level's wall graph: existing walls are split where
 * the new segment touches or crosses them, overlapping parts are not duplicated.
 */
export function addWallSegment(level, a, b, props = {}) {
  a = { x: r2(a.x), y: r2(a.y) };
  b = { x: r2(b.x), y: r2(b.y) };
  for (const v of uniqueVertices(level)) {
    if (same(v, a)) a = { x: v.x, y: v.y };
    if (same(v, b)) b = { x: v.x, y: v.y };
  }
  const L = dist(a, b);
  if (L < 1) return [];
  const newPts = [{ x: a.x, y: a.y, t: 0 }, { x: b.x, y: b.y, t: 1 }];
  const splitMap = new Map();
  const addSplit = (w, p) => {
    if (!splitMap.has(w.id)) splitMap.set(w.id, []);
    splitMap.get(w.id).push(p);
  };
  const ab = sub(b, a);
  for (const w of level.walls) {
    if (onSegmentInterior(a, w.a, w.b)) addSplit(w, a);
    if (onSegmentInterior(b, w.a, w.b)) addSplit(w, b);
    for (const q of [w.a, w.b]) {
      if (onSegmentInterior(q, a, b)) newPts.push({ x: q.x, y: q.y, t: dot(sub(q, a), ab) / (L * L) });
    }
    const X = segmentsCross(a, b, w.a, w.b);
    if (X) {
      const p = { x: r2(X.x), y: r2(X.y) };
      addSplit(w, p);
      newPts.push({ ...p, t: X.t });
    }
  }
  for (const [wid, pts] of splitMap) {
    const w = level.walls.find((x) => x.id === wid);
    if (w) splitWallAt(level, w, pts);
  }
  newPts.sort((p, q) => p.t - q.t);
  const pts = [];
  for (const p of newPts) if (!pts.length || dist(pts[pts.length - 1], p) > EPS) pts.push(p);
  const created = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const p = pts[i], q = pts[i + 1];
    if (dist(p, q) < 1) continue;
    const dup = level.walls.some((w) => (same(w.a, p) && same(w.b, q)) || (same(w.a, q) && same(w.b, p)));
    if (dup) continue;
    const w = {
      id: uid('w_'), a: { x: p.x, y: p.y }, b: { x: q.x, y: q.y },
      thickness: props.thickness ?? DEFAULT_SETTINGS.wallThickness,
      height: props.height ?? null,
    };
    level.walls.push(w);
    created.push(w);
  }
  return created;
}

/** Remove walls (and their openings), then clean the graph. */
export function removeWalls(level, ids) {
  const set = ids instanceof Set ? ids : new Set(ids);
  level.walls = level.walls.filter((w) => !set.has(w.id));
  level.openings = level.openings.filter((o) => !set.has(o.wallId));
  normalizeWalls(level);
}

/** Make the wall graph planar and tidy: snap vertices, split T-junctions & crossings, drop duplicates, merge straight runs. */
export function normalizeWalls(level) {
  const tiny = new Set(level.walls.filter((w) => dist(w.a, w.b) < 1).map((w) => w.id));
  if (tiny.size) {
    level.walls = level.walls.filter((w) => !tiny.has(w.id));
    level.openings = level.openings.filter((o) => !tiny.has(o.wallId));
  }
  const verts = [];
  for (const w of level.walls) {
    for (const k of ['a', 'b']) {
      const v = verts.find((v) => same(v, w[k]));
      if (v) w[k] = { x: v.x, y: v.y };
      else verts.push({ x: w[k].x, y: w[k].y });
    }
  }
  for (let iter = 0; iter < 60; iter++) {
    let changed = false;
    const vs = uniqueVertices(level);
    for (const w of [...level.walls]) {
      const pts = vs.filter((v) => onSegmentInterior(v, w.a, w.b));
      if (pts.length) {
        splitWallAt(level, w, pts);
        changed = true;
      }
    }
    const ws = level.walls;
    let crossed = false;
    for (let i = 0; i < ws.length && !crossed; i++) {
      for (let j = i + 1; j < ws.length; j++) {
        const X = segmentsCross(ws[i].a, ws[i].b, ws[j].a, ws[j].b);
        if (X) {
          const p = { x: r2(X.x), y: r2(X.y) };
          const wi = ws[i], wj = ws[j];
          splitWallAt(level, wi, [p]);
          splitWallAt(level, wj, [p]);
          crossed = true;
          break;
        }
      }
    }
    if (!changed && !crossed) break;
  }
  const seen = new Map();
  level.walls = level.walls.filter((w) => {
    if (dist(w.a, w.b) < 1) return false;
    const k1 = vkey(w.a), k2 = vkey(w.b);
    const k = k1 < k2 ? k1 + '|' + k2 : k2 + '|' + k1;
    const keep = seen.get(k);
    if (keep) {
      for (const o of level.openings) {
        if (o.wallId === w.id) {
          o.wallId = keep.id;
          if (!same(keep.a, w.a)) o.offset = dist(w.a, w.b) - o.offset;
        }
      }
      return false;
    }
    seen.set(k, w);
    return true;
  });
  mergeCollinear(level);
  const ids = new Set(level.walls.map((w) => w.id));
  level.openings = level.openings.filter((o) => ids.has(o.wallId));
}

function mergeCollinear(level) {
  for (let guard = 0; guard < 500; guard++) {
    const m = new Map();
    for (const w of level.walls) {
      for (const end of ['a', 'b']) {
        const k = vkey(w[end]);
        if (!m.has(k)) m.set(k, []);
        m.get(k).push({ w, end });
      }
    }
    let merged = false;
    for (const list of m.values()) {
      if (list.length !== 2) continue;
      const [e1, e2] = list;
      const w1 = e1.w, w2 = e2.w;
      if (w1 === w2) continue;
      if (w1.thickness !== w2.thickness || (w1.height ?? null) !== (w2.height ?? null)) continue;
      const v = w1[e1.end];
      const P = w1[e1.end === 'a' ? 'b' : 'a'];
      const Q = w2[e2.end === 'a' ? 'b' : 'a'];
      const o1 = norm(sub(P, v)), o2 = norm(sub(Q, v));
      if (dot(o1, o2) > -0.99998) continue;
      const moved = level.openings
        .filter((o) => o.wallId === w1.id || o.wallId === w2.id)
        .map((o) => {
          const w = o.wallId === w1.id ? w1 : w2;
          return { o, c: add(w.a, mul(norm(sub(w.b, w.a)), o.offset)) };
        });
      w1.a = { x: P.x, y: P.y };
      w1.b = { x: Q.x, y: Q.y };
      level.walls = level.walls.filter((w) => w !== w2);
      for (const { o, c } of moved) {
        o.wallId = w1.id;
        o.offset = dist(P, c);
      }
      merged = true;
      break;
    }
    if (!merged) break;
  }
}

// ---------------------------------------------------------------------------
// Derived geometry: wall outlines with mitred joins, rooms (faces of the wall graph)
// ---------------------------------------------------------------------------
const derivedCache = new Map();

function wallsKey(level) {
  let s = '';
  for (const w of level.walls) s += w.id + ':' + w.a.x + ',' + w.a.y + ',' + w.b.x + ',' + w.b.y + ',' + w.thickness + '|';
  return s;
}

export function getDerived(level) {
  const key = wallsKey(level);
  const c = derivedCache.get(level.id);
  if (c && c.key === key && c.level === level && c.roomsRef === level.rooms) return c;
  const d = derive(level);
  d.key = key;
  d.level = level;
  syncRooms(level, d);
  d.roomsRef = level.rooms;
  derivedCache.set(level.id, d);
  return d;
}

export function invalidateDerived() {
  derivedCache.clear();
}

function derive(level) {
  const V = [];
  const vid = (p) => {
    for (let i = 0; i < V.length; i++) if (same(V[i], p)) return i;
    V.push({ x: p.x, y: p.y, ends: [] });
    return V.length - 1;
  };
  const W = new Map();
  for (const w of level.walls) {
    const L = dist(w.a, w.b);
    if (L < 0.5) continue;
    const ia = vid(w.a), ib = vid(w.b);
    if (ia === ib) continue;
    const d = { x: (w.b.x - w.a.x) / L, y: (w.b.y - w.a.y) / L };
    const info = {
      wall: w, id: w.id, ia, ib, a: V[ia], b: V[ib], d, n: perp(d), len: L, h: Math.max(1, w.thickness) / 2,
      pA: null, nA: null, pB: null, nB: null, centerA: false, centerB: false, poly: null,
      sideP: null, sideN: null, roomP: null, roomN: null, uMin: 0, uMax: L,
    };
    W.set(w.id, info);
    V[ia].ends.push({ info, out: d, isStart: true });
    V[ib].ends.push({ info, out: { x: -d.x, y: -d.y }, isStart: false });
  }

  const setCorner = (e, side, p) => {
    const info = e.info;
    if (e.isStart) {
      if (side > 0) info.pA = p; else info.nA = p;
    } else if (side > 0) info.nB = p; else info.pB = p;
  };

  for (const v of V) {
    const E = v.ends;
    for (const e of E) e.ang = Math.atan2(e.out.y, e.out.x);
    E.sort((p, q) => p.ang - q.ang);
    const k = E.length;
    if (k === 1) {
      const e = E[0];
      const l = perp(e.out), h = e.info.h;
      setCorner(e, 1, { x: v.x + l.x * h, y: v.y + l.y * h });
      setCorner(e, -1, { x: v.x - l.x * h, y: v.y - l.y * h });
      continue;
    }
    for (let i = 0; i < k; i++) {
      const e1 = E[i], e2 = E[(i + 1) % k];
      const l1 = perp(e1.out), l2 = perp(e2.out);
      const h1 = e1.info.h, h2 = e2.info.h;
      const p1 = { x: v.x + l1.x * h1, y: v.y + l1.y * h1 };
      const p2 = { x: v.x - l2.x * h2, y: v.y - l2.y * h2 };
      let c1 = p1, c2 = p2;
      const X = lineIntersect(p1, e1.out, p2, e2.out);
      if (X && dist(X, v) <= Math.max(h1, h2) * 5) {
        c1 = { x: X.x, y: X.y };
        c2 = c1;
      }
      setCorner(e1, 1, c1);
      setCorner(e2, -1, c2);
    }
    for (const e of E) e.info[e.isStart ? 'centerA' : 'centerB'] = true;
  }

  for (const info of W.values()) {
    const a = info.a, b = info.b;
    const pts = [info.pA, info.pB];
    if (info.centerB) pts.push({ x: b.x, y: b.y });
    pts.push(info.nB, info.nA);
    if (info.centerA) pts.push({ x: a.x, y: a.y });
    info.poly = pts;
    const u = (p) => dot(sub(p, a), info.d);
    info.uMin = clamp(Math.max(u(info.pA), u(info.nA), 0), 0, info.len);
    info.uMax = clamp(Math.min(u(info.pB), u(info.nB), info.len), info.uMin, info.len);
  }

  // --- faces ---------------------------------------------------------------
  const alive = new Set(W.keys());
  const deg = V.map((v) => v.ends.length);
  const stack = [];
  deg.forEach((d, i) => { if (d === 1) stack.push(i); });
  while (stack.length) {
    const i = stack.pop();
    if (deg[i] !== 1) continue;
    const e = V[i].ends.find((e) => alive.has(e.info.id));
    if (!e) continue;
    alive.delete(e.info.id);
    deg[i]--;
    const j = e.isStart ? e.info.ib : e.info.ia;
    deg[j]--;
    if (deg[j] === 1) stack.push(j);
  }
  // half-edges: key wallId + dir
  const outList = V.map((v) => v.ends.filter((e) => alive.has(e.info.id)));
  const heKey = (info, fwd) => info.id + (fwd ? '+' : '-');
  const visited = new Set();
  const faces = [];
  const nextHE = (info, fwd) => {
    const vto = fwd ? info.ib : info.ia;
    const list = outList[vto];
    // twin: outgoing from vto along same wall
    const idx = list.findIndex((e) => e.info === info && e.isStart === !fwd);
    if (idx < 0) return null;
    const prev = list[(idx - 1 + list.length) % list.length];
    return { info: prev.info, fwd: prev.isStart };
  };
  for (const id of alive) {
    const info0 = W.get(id);
    for (const fwd0 of [true, false]) {
      if (visited.has(heKey(info0, fwd0))) continue;
      const hes = [];
      let cur = { info: info0, fwd: fwd0 };
      let guard = 0;
      while (cur && !visited.has(heKey(cur.info, cur.fwd)) && guard++ < 5000) {
        visited.add(heKey(cur.info, cur.fwd));
        hes.push(cur);
        cur = nextHE(cur.info, cur.fwd);
      }
      if (hes.length < 3) continue;
      const poly = hes.map((he) => (he.fwd ? he.info.a : he.info.b)).map((p) => ({ x: p.x, y: p.y }));
      const area = polygonArea(poly);
      if (area <= 1000) continue; // outer boundary (negative) or sliver
      const inner = offsetPolygonLeft(poly, hes.map((he) => he.info.h));
      const netArea = Math.abs(polygonArea(inner));
      const fi = faces.length;
      faces.push({ index: fi, poly, inner, area, netArea, label: labelPoint(inner), halfEdges: hes, roomId: null });
      for (const he of hes) {
        if (he.fwd) he.info.sideP = fi; else he.info.sideN = fi;
      }
    }
  }
  return { verts: V, walls: W, faces };
}

function syncRooms(level, d) {
  const used = new Set();
  const records = level.rooms || [];
  // largest faces first so a room keeps its record when split
  const order = [...d.faces].sort((a, b) => b.area - a.area);
  for (const f of order) {
    let rec = records.find((r) => !used.has(r.id) && r.anchor && pointInPolygon(r.anchor, f.poly));
    if (!rec) {
      rec = createRoomRecord({ rooms: records }, f.label);
      records.push(rec);
    }
    used.add(rec.id);
    f.roomId = rec.id;
    rec.anchor = { x: r2(f.label.x), y: r2(f.label.y) };
  }
  level.rooms = records.filter((r) => used.has(r.id));
  for (const info of d.walls.values()) {
    info.roomP = info.sideP != null ? d.faces[info.sideP].roomId : null;
    info.roomN = info.sideN != null ? d.faces[info.sideN].roomId : null;
  }
}

export function faceOfRoom(level, roomId) {
  return getDerived(level).faces.find((f) => f.roomId === roomId) || null;
}

export function deleteRoom(level, roomId) {
  const f = faceOfRoom(level, roomId);
  if (!f) return;
  const del = new Set();
  for (const he of f.halfEdges) {
    const other = he.fwd ? he.info.roomN : he.info.roomP;
    if (other == null || other === roomId) del.add(he.info.id);
  }
  removeWalls(level, del);
}

// ---------------------------------------------------------------------------
// Openings
// ---------------------------------------------------------------------------
/** Geometry of an opening on its wall: centre, along-wall interval, angle. */
export function openingFrame(level, o) {
  const d = getDerived(level);
  const info = d.walls.get(o.wallId);
  if (!info) return null;
  const half = o.width / 2;
  const lo = info.uMin + half, hi = info.uMax - half;
  const u = lo <= hi ? clamp(o.offset, lo, hi) : (info.uMin + info.uMax) / 2;
  const c = add(info.a, mul(info.d, u));
  return { info, u, c, u0: u - half, u1: u + half, ang: deg(Math.atan2(info.d.y, info.d.x)) };
}

/** Nearest wall to point p within maxDist; returns {info, u, d, side}. */
export function nearestWall(level, p, maxDist = Infinity) {
  const d = getDerived(level);
  let best = null;
  for (const info of d.walls.values()) {
    const rel = sub(p, info.a);
    const u = clamp(dot(rel, info.d), 0, info.len);
    const q = add(info.a, mul(info.d, u));
    const dd = dist(p, q);
    if (dd <= maxDist && (!best || dd < best.d)) best = { info, u, d: dd, side: dot(rel, info.n) >= 0 ? 1 : -1 };
  }
  return best;
}

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------
export function itemCorners(it, pad = 0) {
  const hw = it.w / 2 + pad, hd = it.d / 2 + pad;
  return [
    { x: -hw, y: -hd }, { x: hw, y: -hd }, { x: hw, y: hd }, { x: -hw, y: hd },
  ].map((p) => add(rot(p, it.rot || 0), { x: it.x, y: it.y }));
}

export function itemContains(it, p) {
  const q = rot(sub(p, { x: it.x, y: it.y }), -(it.rot || 0));
  return Math.abs(q.x) <= it.w / 2 && Math.abs(q.y) <= it.d / 2;
}

// ---------------------------------------------------------------------------
// Bounds & stats
// ---------------------------------------------------------------------------
export function levelBounds(level, includeItems = true) {
  const pts = [];
  for (const w of level.walls) pts.push(w.a, w.b);
  if (includeItems) for (const it of level.items) pts.push(...itemCorners(it));
  for (const l of level.labels) pts.push(l);
  for (const dm of level.dims) pts.push(dm.a, dm.b);
  if (!pts.length) return null;
  const b = bbox(pts);
  const pad = 30;
  return { minX: b.minX - pad, minY: b.minY - pad, maxX: b.maxX + pad, maxY: b.maxY + pad, w: b.w + 2 * pad, h: b.h + 2 * pad };
}

export function projectBounds(project) {
  let out = null;
  for (const lv of project.levels) {
    const b = levelBounds(lv);
    if (!b) continue;
    if (!out) out = { ...b };
    else {
      out.minX = Math.min(out.minX, b.minX); out.minY = Math.min(out.minY, b.minY);
      out.maxX = Math.max(out.maxX, b.maxX); out.maxY = Math.max(out.maxY, b.maxY);
    }
  }
  if (out) { out.w = out.maxX - out.minX; out.h = out.maxY - out.minY; }
  return out;
}

export function levelStats(level) {
  const d = getDerived(level);
  const rooms = d.faces.map((f) => ({ room: level.rooms.find((r) => r.id === f.roomId), net: f.netArea, face: f }));
  const total = rooms.reduce((s, r) => s + r.net, 0);
  return { rooms, total };
}

// ---------------------------------------------------------------------------
// Levels
// ---------------------------------------------------------------------------
export function addLevel(project, fromLevel, copyExterior, below = false) {
  const top = project.levels.reduce((m, l) => (l.elevation > m.elevation ? l : m), project.levels[0]);
  const bottom = project.levels.reduce((m, l) => (l.elevation < m.elevation ? l : m), project.levels[0]);
  const height = below ? 240 : top.height;
  const elevation = below ? bottom.elevation - height - 20 : top.elevation + top.height + 20;
  const used = new Set(project.levels.map((l) => l.name));
  const above = ['Obergeschoss', 'Dachgeschoss', '2. Obergeschoss', '3. Obergeschoss', '4. Obergeschoss'];
  const under = ['Untergeschoss', '2. Untergeschoss'];
  const name = (below ? under : above).find((n) => !used.has(n)) || `Geschoss ${project.levels.length + 1}`;
  const lv = createLevel(name, elevation, height);
  if (copyExterior && fromLevel) {
    const d = getDerived(fromLevel);
    for (const info of d.walls.values()) {
      if (info.roomP == null || info.roomN == null) {
        lv.walls.push({ id: uid('w_'), a: { ...info.wall.a }, b: { ...info.wall.b }, thickness: info.wall.thickness, height: null });
      }
    }
    normalizeWalls(lv);
  }
  project.levels.push(lv);
  return lv;
}

export function levelBelow(project, level) {
  let best = null;
  for (const l of project.levels) if (l.elevation < level.elevation && (!best || l.elevation > best.elevation)) best = l;
  return best;
}

export function sortedLevels(project) {
  return [...project.levels].sort((a, b) => a.elevation - b.elevation);
}

// ---------------------------------------------------------------------------
// Import validation
// ---------------------------------------------------------------------------
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const str = (v, d = '') => (typeof v === 'string' ? v.slice(0, 200) : d);
const ptv = (p) => ({ x: num(p?.x), y: num(p?.y) });
const color = (v, d) => (typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v) ? v : d);

export function sanitizeProject(raw, itemTypes, openingTypes) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.levels)) throw new Error('Keine gültige Projektdatei.');
  const p = createProject(str(raw.name, 'Importiertes Projekt'));
  if (typeof raw.id === 'string' && /^[\w-]{3,60}$/.test(raw.id)) p.id = raw.id;
  p.createdAt = num(raw.createdAt, Date.now());
  p.updatedAt = num(raw.updatedAt, Date.now());
  const s = raw.settings || {};
  p.settings = {
    ...DEFAULT_SETTINGS,
    wallThickness: clamp(num(s.wallThickness, DEFAULT_SETTINGS.wallThickness), 2, 100),
    wallHeight: clamp(num(s.wallHeight, DEFAULT_SETTINGS.wallHeight), 100, 1000),
    exteriorColor: color(s.exteriorColor, DEFAULT_SETTINGS.exteriorColor),
    exteriorTex: str(s.exteriorTex, DEFAULT_SETTINGS.exteriorTex),
    groundColor: color(s.groundColor, DEFAULT_SETTINGS.groundColor),
    showDims: s.showDims !== false,
    showGrid: s.showGrid !== false,
    snap: s.snap !== false,
    magnet: s.magnet !== false,
    showGhost: s.showGhost !== false,
    doorsOpen: !!s.doorsOpen,
  };
  p.assets = {};
  if (raw.assets && typeof raw.assets === 'object') {
    for (const [k, v] of Object.entries(raw.assets)) {
      if (typeof v === 'string' && /^data:image\/(png|jpe?g|webp);base64,/.test(v)) p.assets[k] = v;
    }
  }
  p.levels = raw.levels.slice(0, 12).map((rl, i) => {
    const lv = createLevel(str(rl.name, `Geschoss ${i + 1}`), num(rl.elevation, i * 270), clamp(num(rl.height, 250), 100, 1000));
    if (typeof rl.id === 'string') lv.id = rl.id;
    lv.walls = (rl.walls || []).filter((w) => w && w.a && w.b).map((w) => ({
      id: str(w.id) || uid('w_'), a: ptv(w.a), b: ptv(w.b), thickness: clamp(num(w.thickness, 20), 1, 200),
      height: w.height == null ? null : clamp(num(w.height, 250), 10, 2000),
    }));
    const wallIds = new Set(lv.walls.map((w) => w.id));
    lv.openings = (rl.openings || []).filter((o) => o && wallIds.has(o.wallId) && openingTypes[o.type]).map((o) => ({
      id: str(o.id) || uid('op_'), wallId: o.wallId, type: o.type, offset: num(o.offset),
      width: clamp(num(o.width, 90), 10, 2000), height: clamp(num(o.height, 210), 10, 1000),
      sill: clamp(num(o.sill, 0), 0, 1000), flip: !!o.flip, swing: !!o.swing, color: color(o.color, '#f4f3ef'),
    }));
    lv.rooms = (rl.rooms || []).filter((r) => r && r.anchor).map((r) => ({
      id: str(r.id) || uid('rm_'), name: str(r.name, 'Raum'), floor: str(r.floor, 'oak'),
      wallColor: color(r.wallColor, '#f4f2ee'), wallTex: str(r.wallTex, 'paint'),
      ceiling: r.ceiling !== false, showFloor: r.showFloor !== false, anchor: ptv(r.anchor),
    }));
    lv.items = (rl.items || []).filter((it) => it && itemTypes[it.type]).map((it) => ({
      id: str(it.id) || uid('it_'), type: it.type, x: num(it.x), y: num(it.y), rot: num(it.rot),
      w: clamp(num(it.w, 50), 1, 5000), d: clamp(num(it.d, 50), 1, 5000), h: clamp(num(it.h, 50), 0.5, 3000),
      elev: clamp(num(it.elev, 0), -500, 3000), color: color(it.color, null), color2: color(it.color2, null),
      flip: !!it.flip, name: typeof it.name === 'string' ? it.name.slice(0, 80) : undefined,
    }));
    lv.labels = (rl.labels || []).filter((l) => l && typeof l.text === 'string').map((l) => ({
      id: str(l.id) || uid('lb_'), x: num(l.x), y: num(l.y), text: l.text.slice(0, 200), size: clamp(num(l.size, 16), 6, 200),
    }));
    lv.dims = (rl.dims || []).filter((dm) => dm && dm.a && dm.b).map((dm) => ({ id: str(dm.id) || uid('dm_'), a: ptv(dm.a), b: ptv(dm.b) }));
    if (rl.background && typeof rl.background.asset === 'string' && p.assets[rl.background.asset]) {
      const b = rl.background;
      lv.background = {
        asset: b.asset, x: num(b.x), y: num(b.y), width: clamp(num(b.width, 1000), 10, 100000),
        opacity: clamp(num(b.opacity, 0.5), 0.05, 1), locked: !!b.locked, aspect: num(b.aspect, 1),
      };
    }
    return lv;
  });
  if (!p.levels.length) p.levels = [createLevel('Erdgeschoss', 0, 250)];
  return p;
}

export function cloneWithNewIds(project) {
  const p = deepClone(project);
  p.id = uid('proj_');
  return p;
}
