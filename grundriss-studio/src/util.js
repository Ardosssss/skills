// Grundriss Studio – shared helpers (geometry, formatting, misc)
// Plan coordinates are centimetres, x to the right, y downwards (screen orientation).

export const EPS = 0.5; // cm – two points closer than this are the same vertex

export function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 8) + (Date.now() % 1e6).toString(36);
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const round = (v, step = 1) => Math.round(v / step) * step;
export const r2 = (v) => Math.round(v * 100) / 100;
export const deg = (rad) => (rad * 180) / Math.PI;
export const rad = (d) => (d * Math.PI) / 180;
export const normDeg = (a) => ((a % 360) + 360) % 360;

export const pt = (x, y) => ({ x, y });
export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a, k) => ({ x: a.x * k, y: a.y * k });
export const dot = (a, b) => a.x * b.x + a.y * b.y;
export const cross = (a, b) => a.x * b.y - a.y * b.x;
export const len = (a) => Math.hypot(a.x, a.y);
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const norm = (a) => {
  const l = Math.hypot(a.x, a.y) || 1;
  return { x: a.x / l, y: a.y / l };
};
export const perp = (a) => ({ x: -a.y, y: a.x });
export const same = (a, b, eps = EPS) => Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) < eps;
export const rot = (p, angDeg) => {
  const c = Math.cos(rad(angDeg)), s = Math.sin(rad(angDeg));
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
};

/** Closest point on segment ab to p. Returns {x,y,t,d} with t in [0,1]. */
export function closestOnSegment(p, a, b) {
  const ab = sub(b, a);
  const l2 = dot(ab, ab);
  let t = l2 ? dot(sub(p, a), ab) / l2 : 0;
  t = clamp(t, 0, 1);
  const q = { x: a.x + ab.x * t, y: a.y + ab.y * t };
  return { x: q.x, y: q.y, t, d: dist(p, q) };
}

/** True when p lies on the open segment ab (not within eps of its ends). */
export function onSegmentInterior(p, a, b, eps = EPS) {
  const ab = sub(b, a);
  const L = len(ab);
  if (L < eps * 2) return false;
  const t = dot(sub(p, a), ab) / (L * L);
  if (t * L < eps || (1 - t) * L < eps) return false;
  const q = { x: a.x + ab.x * t, y: a.y + ab.y * t };
  return dist(p, q) < eps;
}

/** Intersection of lines p + t*r and q + u*s. Returns point or null when parallel. */
export function lineIntersect(p, r, q, s) {
  const rxs = cross(r, s);
  if (Math.abs(rxs) < 1e-9) return null;
  const t = cross(sub(q, p), s) / rxs;
  return { x: p.x + r.x * t, y: p.y + r.y * t, t };
}

/** Proper intersection of segments ab and cd (interior of both). */
export function segmentsCross(a, b, c, d, eps = EPS) {
  const r = sub(b, a), s = sub(d, c);
  const rxs = cross(r, s);
  if (Math.abs(rxs) < 1e-9) return null;
  const qp = sub(c, a);
  const t = cross(qp, s) / rxs;
  const u = cross(qp, r) / rxs;
  const L1 = len(r), L2 = len(s);
  if (t * L1 < eps || (1 - t) * L1 < eps || u * L2 < eps || (1 - u) * L2 < eps) return null;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return { x: a.x + r.x * t, y: a.y + r.y * t, t, u };
}

/** Signed area (shoelace). Positive = counter-clockwise in raw coordinates. */
export function polygonArea(pts) {
  let a = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    a += p.x * q.y - q.x * p.y;
  }
  return a / 2;
}

export function pointInPolygon(p, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

export function polygonCentroid(pts) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    const f = p.x * q.y - q.x * p.y;
    a += f; cx += (p.x + q.x) * f; cy += (p.y + q.y) * f;
  }
  if (Math.abs(a) < 1e-9) {
    const b = bbox(pts);
    return { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
  }
  return { x: cx / (3 * a), y: cy / (3 * a) };
}

/** A point well inside the polygon, good for a label. */
export function labelPoint(pts) {
  const c = polygonCentroid(pts);
  const score = (p) => {
    let m = Infinity;
    for (let i = 0; i < pts.length; i++) m = Math.min(m, closestOnSegment(p, pts[i], pts[(i + 1) % pts.length]).d);
    return m;
  };
  let best = pointInPolygon(c, pts) ? { p: c, s: score(c) } : null;
  const b = bbox(pts);
  // scanlines: take the middle of the widest inside interval
  for (let k = 1; k < 8; k++) {
    const y = b.minY + ((b.maxY - b.minY) * k) / 8;
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      if ((p.y > y) !== (q.y > y)) xs.push(p.x + ((y - p.y) * (q.x - p.x)) / (q.y - p.y));
    }
    xs.sort((u, v) => u - v);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const cand = { x: (xs[i] + xs[i + 1]) / 2, y };
      const s = score(cand);
      if (!best || s > best.s * 1.15) best = { p: cand, s };
    }
  }
  return best ? best.p : c;
}

export function bbox(pts) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

/**
 * Offset every edge of a polygon to its left (relative to the vertex order) by its own distance.
 * For a counter-clockwise polygon (positive area) this shrinks it.
 */
export function offsetPolygonLeft(pts, dists) {
  const n = pts.length;
  const lines = [];
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const d = norm(sub(b, a));
    const l = perp(d);
    lines.push({ p: add(a, mul(l, dists[i])), d, l });
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const L1 = lines[(i - 1 + n) % n], L2 = lines[i];
    const X = lineIntersect(L1.p, L1.d, L2.p, L2.d);
    const fallback = add(pts[i], mul(L2.l, dists[i]));
    if (!X || dist(X, pts[i]) > Math.max(dists[i], dists[(i - 1 + n) % n]) * 6) out.push(fallback);
    else out.push({ x: X.x, y: X.y });
  }
  return out;
}

/** Keep the part of a polygon where dot(n, p) <= c (Sutherland–Hodgman, one half-plane). */
export function clipHalfPlane(pts, n, c) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    const dp = dot(n, p) - c, dq = dot(n, q) - c;
    if (dp <= 1e-9) out.push(p);
    if ((dp < -1e-9 && dq > 1e-9) || (dp > 1e-9 && dq < -1e-9)) {
      const t = dp / (dp - dq);
      out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
    }
  }
  return out;
}

// ---------- formatting (Swiss German conventions: 4.50 m, 12.5 m²) ----------
const nf1 = new Intl.NumberFormat('de-CH', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf0 = new Intl.NumberFormat('de-CH', { maximumFractionDigits: 0 });
export const fmtM = (cm) => nf2.format(cm / 100) + ' m';
export const fmtMShort = (cm) => nf2.format(cm / 100);
export const fmtCm = (cm) => nf0.format(cm) + ' cm';
export const fmtArea = (cm2) => nf1.format(cm2 / 10000) + ' m²';
export const fmtArea2 = (cm2) => nf2.format(cm2 / 10000) + ' m²';
export const fmtNum = (v, digits = 0) =>
  new Intl.NumberFormat('de-CH', { maximumFractionDigits: digits }).format(v);

/** Parse a user length. "450" → 450 cm, "4.5m" / "4,5 m" → 450 cm, "4.5" → 450 cm (decimal < 30 means metres). */
export function parseLength(str) {
  if (str == null) return NaN;
  let s = String(str).trim().toLowerCase().replace(/\s+/g, '').replace(',', '.');
  if (!s) return NaN;
  let unit = '';
  const m = s.match(/^(-?\d*\.?\d+)(mm|cm|m)?$/);
  if (!m) return NaN;
  const v = parseFloat(m[1]);
  unit = m[2] || '';
  if (unit === 'm') return v * 100;
  if (unit === 'mm') return v / 10;
  if (unit === 'cm') return v;
  if (m[1].includes('.') && v < 30) return v * 100;
  return v;
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function debounce(fn, ms) {
  let t = 0;
  const d = (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
  d.flush = (...args) => {
    clearTimeout(t);
    fn(...args);
  };
  d.cancel = () => clearTimeout(t);
  return d;
}

export const deepClone = (o) => JSON.parse(JSON.stringify(o));

// ---------- colour helpers ----------
export function hexToRgb(hex) {
  let h = String(hex || '#000').replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16) || 0;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
export function rgbToHex({ r, g, b }) {
  const c = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}
/** Mix colour a towards b by t (0..1). */
export function mix(a, b, t) {
  const x = hexToRgb(a), y = hexToRgb(b);
  return rgbToHex({ r: x.r + (y.r - x.r) * t, g: x.g + (y.g - x.g) * t, b: x.b + (y.b - x.b) * t });
}
export const shade = (hex, t) => (t >= 0 ? mix(hex, '#ffffff', t) : mix(hex, '#000000', -t));
export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Small seeded PRNG so procedural textures look the same every time. */
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return (s >>> 0) / 4294967296;
  };
}

export const svgNum = (v) => (Math.round(v * 10) / 10).toString();
