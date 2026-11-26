// Grundriss Studio – furniture, doors & windows catalogue.
// Every model is a list of simple parts (boxes, cylinders, ellipsoids) in item-local centimetres:
// x to the right, y towards the front (the back of a piece stands against the wall at -d/2), z up.
// The same part list drives the 3D mesh and the 2D top-view symbol.
import { shade } from './util.js';

export const CATEGORIES = [
  { id: 'living', name: 'Wohnen' },
  { id: 'dining', name: 'Essen' },
  { id: 'kitchen', name: 'Küche' },
  { id: 'bedroom', name: 'Schlafen' },
  { id: 'bath', name: 'Bad' },
  { id: 'office', name: 'Büro' },
  { id: 'light', name: 'Licht' },
  { id: 'deco', name: 'Deko' },
  { id: 'doors', name: 'Türen' },
  { id: 'windows', name: 'Fenster' },
  { id: 'build', name: 'Bauteile' },
  { id: 'outdoor', name: 'Garten' },
];

export const MATERIALS = {
  wood: { color: '#b88b5e', rough: 0.7 },
  darkwood: { color: '#5e3f29', rough: 0.65 },
  lightwood: { color: '#d8bd96', rough: 0.7 },
  white: { color: '#f3f3f1', rough: 0.55 },
  'white-': { color: '#e2e2df', rough: 0.55 },
  black: { color: '#262729', rough: 0.5 },
  metal: { color: '#8f959a', rough: 0.35, metal: 0.7 },
  chrome: { color: '#d4d8dc', rough: 0.18, metal: 0.95 },
  glass: { color: '#cfe3ec', rough: 0.05, opacity: 0.28 },
  glassDark: { color: '#2c3a44', rough: 0.1, opacity: 0.85 },
  mirror: { color: '#dfe8ee', rough: 0.02, metal: 1 },
  screen: { color: '#111418', rough: 0.25 },
  ceramic: { color: '#f8f8f6', rough: 0.15 },
  ceramicDark: { color: '#dfe3e4', rough: 0.2 },
  tubInner: { color: '#e9eef0', rough: 0.15 },
  mattress: { color: '#f2f0ea', rough: 0.9 },
  pillow: { color: '#faf8f3', rough: 0.9 },
  leaf: { color: '#4f7b3b', rough: 0.85 },
  leaf2: { color: '#6a9a48', rough: 0.85 },
  leafDark: { color: '#2f5a37', rough: 0.85 },
  trunk: { color: '#6b4f36', rough: 0.9 },
  soil: { color: '#3f3226', rough: 1 },
  pot: { color: '#c3714d', rough: 0.8 },
  lampshade: { color: '#f5ead2', rough: 0.8, emissive: '#ffd9a0', ei: 0.55 },
  bulb: { color: '#fff6e0', rough: 0.3, emissive: '#ffe7b0', ei: 1.4 },
  water: { color: '#6fb8d3', rough: 0.08, opacity: 0.8 },
  stone: { color: '#a9a49a', rough: 0.9 },
  rubber: { color: '#1d1e20', rough: 0.9 },
  book1: { color: '#9c3d34', rough: 0.8 },
  book2: { color: '#2c4155', rough: 0.8 },
  book3: { color: '#d3a14a', rough: 0.8 },
  book4: { color: '#3f5b43', rough: 0.8 },
  book5: { color: '#e5dccb', rough: 0.8 },
  roofTile: { color: '#8a4a35', rough: 0.85 },
};

// --- part helpers ------------------------------------------------------------
const B = (x, y, z, w, d, h, m = 'main', r = 0, rz = 0) => ({ t: 'box', x, y, z, w, d, h, m, r, rz });
const C = (x, y, z, rad, h, m = 'main', rTop = null, seg = 28) => ({ t: 'cyl', x, y, z, r: rad, r2: rTop ?? rad, h, m, seg });
const S = (x, y, z, rx, ry, rz, m = 'main') => ({ t: 'sph', x, y, z, rx, ry, rz, m });
const HC = (x, y, z, rad, length, axis, m = 'main') => ({ t: 'hcyl', x, y, z, r: rad, len: length, axis, m });

function legs(w, d, inset, size, h, m = 'second', round = false) {
  const xs = w / 2 - inset - size / 2, ys = d / 2 - inset - size / 2;
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) =>
    round ? C(sx * xs, sy * ys, 0, size / 2, h, m, null, 14) : B(sx * xs, sy * ys, 0, size, size, h, m));
}

function sofaParts(w, d, h, seatsOverride) {
  const arm = Math.min(22, w * 0.12), back = Math.min(22, d * 0.24), legH = 10, seatTop = Math.min(44, h * 0.52);
  const n = seatsOverride || (w >= 200 ? 3 : w >= 125 ? 2 : 1);
  const parts = [
    ...legs(w, d, 6, 5, legH, 'darkwood', true),
    B(0, 0, legH, w, d, seatTop - legH - 12, 'main', 3),
    B(0, -d / 2 + back / 2, legH, w, back, h - legH, 'main', 5),
    B(-w / 2 + arm / 2, 0, legH, arm, d, Math.min(h - legH, seatTop + 16 - legH), 'main', 5),
    B(w / 2 - arm / 2, 0, legH, arm, d, Math.min(h - legH, seatTop + 16 - legH), 'main', 5),
  ];
  const inner = w - 2 * arm, cw = inner / n;
  for (let i = 0; i < n; i++) {
    const cx = -inner / 2 + cw * (i + 0.5);
    parts.push(B(cx, back / 2, seatTop - 12, cw - 1.5, d - back - 2, 12, 'main+', 5));
    parts.push(B(cx, -d / 2 + back + 7, seatTop, cw - 3, 14, Math.max(10, h - seatTop - 8), 'main+', 6));
  }
  return parts;
}

function cabinetFronts(w, d, z, h, cols, m = 'main+', handle = 'chrome', handleTop = true) {
  const parts = [];
  const cw = w / cols;
  for (let i = 0; i < cols; i++) {
    const cx = -w / 2 + cw * (i + 0.5);
    parts.push(B(cx, d / 2 - 0.8, z + 1, cw - 0.8, 1.6, h - 2, m, 0.3));
    if (handle) parts.push(B(cx, d / 2 + 0.6, handleTop ? z + h - 8 : z + 6, Math.min(30, cw * 0.5), 1.5, 1.5, handle));
  }
  return parts;
}

function baseCabinet(w, d, h) {
  return [
    B(0, -2, 0, w - 1, d - 8, 10, 'black'),
    B(0, -1, 10, w - 0.4, d - 2, h - 14, 'main'),
    B(0, 0.5, h - 4, w, d + 1, 4, 'second', 0.5),
  ];
}

function cooktop(x, y, z, w, d) {
  const parts = [B(x, y, z, w, d, 0.8, 'black', 0.3)];
  const ox = w * 0.24, oy = d * 0.22;
  for (const [sx, sy, r] of [[-1, -1, 9], [1, -1, 7], [-1, 1, 7], [1, 1, 9]]) parts.push(C(x + sx * ox, y + sy * oy, z + 0.8, r, 0.3, 'metal', null, 24));
  return parts;
}

function sink(x, y, z, w, d) {
  return [
    B(x, y, z - 0.2, w, d, 0.6, 'chrome', 0.3),
    B(x, y + 1, z + 0.3, w - 6, d - 8, 0.2, 'metal', 0.1),
    C(x, y - d / 2 - 2, z, 1.6, 24, 'chrome', null, 14),
    B(x, y - d / 2 + 6, z + 22, 2.6, 16, 2.6, 'chrome'),
  ];
}

// --- furniture ---------------------------------------------------------------
export const ITEMS = {
  // Wohnen
  sofa3: { name: 'Sofa 3-Sitzer', cat: 'living', w: 220, d: 95, h: 84, color: '#7d8c96', snap: true, tags: 'couch', model: (w, d, h) => sofaParts(w, d, h) },
  sofa2: { name: 'Sofa 2-Sitzer', cat: 'living', w: 165, d: 92, h: 84, color: '#b6a58c', snap: true, tags: 'couch', model: (w, d, h) => sofaParts(w, d, h, 2) },
  sofaL: {
    name: 'Ecksofa', cat: 'living', w: 270, d: 180, h: 84, color: '#6b6760', snap: true, tags: 'couch l-sofa', model: (w, d, h) => {
      const D0 = Math.min(95, d * 0.55), arm = 22, back = 22, legH = 10, seat = 44;
      const parts = [
        ...legs(w, D0, 6, 5, legH, 'darkwood', true).map((p) => ({ ...p, y: p.y - d / 2 + D0 / 2 })),
        B(0, -d / 2 + D0 / 2, legH, w, D0, seat - legH - 12, 'main', 3),
        B(w / 2 - D0 / 2, D0 / 2, legH, D0, d - D0, seat - legH - 12, 'main', 3),
        C(w / 2 - 8, d / 2 - 8, 0, 2.5, legH, 'darkwood', null, 12),
        C(w / 2 - D0 + 8, d / 2 - 8, 0, 2.5, legH, 'darkwood', null, 12),
        B(0, -d / 2 + back / 2, legH, w, back, h - legH, 'main', 5),
        B(-w / 2 + arm / 2, -d / 2 + D0 / 2, legH, arm, D0, seat + 14 - legH, 'main', 5),
      ];
      const inner = w - arm - D0;
      for (let i = 0; i < 2; i++) {
        const cx = -w / 2 + arm + inner / 4 + (inner / 2) * i;
        parts.push(B(cx, -d / 2 + back + (D0 - back) / 2, seat - 12, inner / 2 - 1.5, D0 - back - 2, 12, 'main+', 5));
        parts.push(B(cx, -d / 2 + back + 7, seat, inner / 2 - 3, 14, h - seat - 8, 'main+', 6));
      }
      parts.push(B(w / 2 - D0 / 2, -d / 2 + back + (d - back) / 2, seat - 12, D0 - 2, d - back - 2, 12, 'main+', 5));
      parts.push(B(w / 2 - D0 / 2, -d / 2 + back + 7, seat, D0 - 4, 14, h - seat - 8, 'main+', 6));
      return parts;
    },
  },
  armchair: {
    name: 'Sessel', cat: 'living', w: 82, d: 85, h: 88, color: '#c48b5a', snap: true, tags: 'sessel fauteuil', model: (w, d, h) => [
      ...legs(w, d, 6, 4, 12, 'darkwood', true),
      B(0, 0, 12, w, d, 26, 'main', 4),
      B(0, -d / 2 + 9, 12, w, 18, h - 12, 'main', 6),
      B(-w / 2 + 8, 0, 12, 16, d, 50, 'main', 5),
      B(w / 2 - 8, 0, 12, 16, d, 50, 'main', 5),
      B(0, 7, 38, w - 34, d - 22, 11, 'main+', 5),
    ],
  },
  coffeeTable: {
    name: 'Couchtisch', cat: 'living', w: 110, d: 60, h: 40, color: '#c49a6b', color2: '#2b2b2c', tags: 'salontisch tisch', model: (w, d, h) => [
      ...legs(w, d, 4, 4, h - 3),
      B(0, 0, 10, w - 10, d - 10, 2, 'main'),
      B(0, 0, h - 3, w, d, 3, 'main', 1),
    ],
  },
  tvStand: {
    name: 'TV-Möbel', cat: 'living', w: 180, d: 42, h: 48, color: '#efece6', color2: '#7a5236', snap: true, tags: 'lowboard fernsehmöbel', model: (w, d, h) => [
      ...legs(w, d, 5, 4, 8, 'second'),
      B(0, -1, 8, w, d - 2, h - 8, 'main', 0.5),
      ...cabinetFronts(w, d, 9, h - 10, Math.max(2, Math.round(w / 60)), 'main+', null),
    ],
  },
  tv: {
    name: 'Fernseher', cat: 'living', w: 140, d: 25, h: 88, elev: 48, color: '#1e1f21', snap: true, tags: 'tv fernseher bildschirm', model: (w, d, h) => [
      B(0, 0, 0, w * 0.32, d, 2.5, 'main', 1),
      B(0, -2, 2.5, 8, 4, Math.max(4, h - (w * 0.5625) - 6), 'main'),
      B(0, -1, h - w * 0.5625 - 2, w, 5, w * 0.5625 + 2, 'main', 1),
      B(0, 1.7, h - w * 0.5625, w - 3, 0.4, w * 0.5625 - 1, 'screen'),
    ],
  },
  bookshelf: {
    name: 'Bücherregal', cat: 'living', w: 100, d: 34, h: 200, color: '#ece8e0', snap: true, tags: 'regal bücher', model: (w, d, h) => {
      const n = Math.max(2, Math.round(h / 38));
      const parts = [
        B(-w / 2 + 1.5, 0, 0, 3, d, h, 'main'), B(w / 2 - 1.5, 0, 0, 3, d, h, 'main'),
        B(0, -d / 2 + 0.75, 0, w - 6, 1.5, h, 'main-'),
      ];
      const books = ['book1', 'book2', 'book3', 'book4', 'book5'];
      for (let i = 0; i <= n; i++) {
        const z = Math.min(h - 2.5, (i * (h - 2.5)) / n);
        parts.push(B(0, 0, z, w - 6, d, 2.5, 'main'));
        if (i < n) {
          const gap = (h - 2.5) / n - 2.5;
          let x = -w / 2 + 6, k = i * 3;
          while (x < w / 2 - 14) {
            const bw = 6 + ((k * 7) % 9), bh = Math.min(gap - 3, gap * (0.6 + ((k * 13) % 30) / 100));
            if (x + bw > w / 2 - 6) break;
            parts.push(B(x + bw / 2, -d / 2 + 13, z + 2.5, bw - 0.5, 20, bh, books[k % books.length]));
            x += bw + ((k % 4 === 3) ? 12 : 0);
            k++;
          }
        }
      }
      return parts;
    },
  },
  sideboard: {
    name: 'Sideboard', cat: 'living', w: 160, d: 45, h: 80, color: '#7a5236', color2: '#262729', snap: true, tags: 'kommode anrichte', model: (w, d, h) => [
      ...legs(w, d, 5, 3, 14),
      B(0, -1, 14, w, d - 2, h - 14, 'main', 0.5),
      ...cabinetFronts(w, d, 15, h - 16, Math.max(2, Math.round(w / 45)), 'main+', 'second'),
    ],
  },
  fireplace: {
    name: 'Kamin', cat: 'living', w: 120, d: 45, h: 110, color: '#e4e0d8', color2: '#6b6760', snap: true, tags: 'cheminée ofen', model: (w, d, h) => [
      B(0, 0, 0, w, d, h - 6, 'main'),
      B(0, d / 2 - 2, 10, w * 0.55, 5, h * 0.5, 'black'),
      B(0, 3, h - 6, w + 8, d + 6, 6, 'second'),
      B(0, d / 2 + 15, 0, w + 10, 30, 3, 'second'),
    ],
  },
  // Essen
  diningTable: {
    name: 'Esstisch', cat: 'dining', w: 180, d: 90, h: 75, color: '#c49a6b', tags: 'tisch', model: (w, d, h) => [
      ...legs(w, d, 6, 7, h - 4, 'main'),
      B(0, 0, h - 12, w - 20, d - 20, 8, 'main-'),
      B(0, 0, h - 4, w, d, 4, 'main', 1.5),
    ],
  },
  roundTable: {
    name: 'Runder Tisch', cat: 'dining', w: 110, d: 110, h: 75, color: '#f1eee8', color2: '#3a3a3c', keepRatio: true, tags: 'tisch rund', model: (w, d, h) => [
      C(0, 0, 0, Math.min(w, d) * 0.24, 3, 'second'),
      C(0, 0, 3, 5, h - 7, 'second', null, 18),
      { ...C(0, 0, h - 4, w / 2, 4, 'main', null, 40), sx: 1, sy: d / w },
    ],
  },
  chair: {
    name: 'Stuhl', cat: 'dining', w: 46, d: 52, h: 88, color: '#c49a6b', color2: '#3a3a3c', tags: 'stuhl sitz', model: (w, d, h) => [
      ...legs(w, d - 4, 2, 3, 44, 'second').map((p) => ({ ...p, y: p.y + 2 })),
      B(0, 2, 44, w, d - 4, 4, 'main', 1.5),
      B(-w / 2 + 2.5, -d / 2 + 3, 48, 3, 3, h - 48, 'second'),
      B(w / 2 - 2.5, -d / 2 + 3, 48, 3, 3, h - 48, 'second'),
      B(0, -d / 2 + 3, h - 22, w - 2, 3, 20, 'main', 1),
    ],
  },
  barStool: {
    name: 'Barhocker', cat: 'dining', w: 40, d: 40, h: 76, color: '#3a3a3c', keepRatio: true, tags: 'hocker', model: (w, d, h) => [
      C(0, 0, 0, w * 0.42, 3, 'chrome'),
      C(0, 0, 3, 2.5, h - 8, 'chrome', null, 14),
      C(0, 0, h * 0.35, w * 0.32, 1.5, 'chrome', null, 24),
      C(0, 0, h - 5, w / 2, 5, 'main', null, 30),
    ],
  },
  bench: {
    name: 'Sitzbank', cat: 'dining', w: 160, d: 38, h: 46, color: '#c49a6b', tags: 'bank', model: (w, d, h) => [
      B(-w / 2 + 6, 0, 0, 5, d - 4, h - 4, 'main'), B(w / 2 - 6, 0, 0, 5, d - 4, h - 4, 'main'),
      B(0, 0, h - 4, w, d, 4, 'main', 1),
    ],
  },
  // Küche
  kitchenRow: {
    name: 'Küchenzeile', cat: 'kitchen', w: 270, d: 62, h: 90, color: '#f2f1ee', color2: '#3b3d40', snap: true, tags: 'küche einbauküche', model: (w, d, h) => {
      const cols = Math.max(2, Math.round(w / 60));
      const parts = [...baseCabinet(w, d, h), ...cabinetFronts(w - 0.4, d - 2, 10, h - 14, cols)];
      parts.push(...sink(-w / 2 + Math.min(w * 0.22, 55), 2, h, Math.min(60, w * 0.2), 42));
      parts.push(...cooktop(w / 2 - Math.min(w * 0.22, 60), 2, h, 58, 50));
      parts.push(B(w / 2 - Math.min(w * 0.22, 60), d / 2 - 0.6, 20, 56, 1.8, 46, 'screen', 0.5));
      return parts;
    },
  },
  kitchenBase: {
    name: 'Unterschrank', cat: 'kitchen', w: 60, d: 62, h: 90, color: '#f2f1ee', color2: '#3b3d40', snap: true, tags: 'küche schrank', model: (w, d, h) => [
      ...baseCabinet(w, d, h), ...cabinetFronts(w - 0.4, d - 2, 10, h - 14, Math.max(1, Math.round(w / 60))),
    ],
  },
  kitchenSink: {
    name: 'Spülenschrank', cat: 'kitchen', w: 80, d: 62, h: 90, color: '#f2f1ee', color2: '#3b3d40', snap: true, tags: 'spüle abwaschbecken', model: (w, d, h) => [
      ...baseCabinet(w, d, h), ...cabinetFronts(w - 0.4, d - 2, 10, h - 14, 2), ...sink(0, 2, h, Math.min(60, w - 16), 42),
    ],
  },
  stove: {
    name: 'Herd mit Backofen', cat: 'kitchen', w: 60, d: 62, h: 90, color: '#f2f1ee', color2: '#3b3d40', snap: true, tags: 'herd ofen kochfeld', model: (w, d, h) => [
      ...baseCabinet(w, d, h),
      B(0, d / 2 - 1.4, 14, w - 4, 1.8, h - 26, 'black', 0.5),
      B(0, d / 2 - 0.2, 26, w - 14, 0.6, h - 46, 'screen'),
      B(0, d / 2 + 0.8, h - 16, w * 0.6, 1.5, 1.5, 'chrome'),
      ...cooktop(0, 2, h, w - 4, d - 10),
    ],
  },
  fridge: {
    name: 'Kühlschrank', cat: 'kitchen', w: 60, d: 66, h: 185, color: '#e9eaea', snap: true, tags: 'kühlschrank gefrierschrank', model: (w, d, h) => [
      B(0, 0, 0, w, d, h, 'main', 2),
      B(0, d / 2 - 0.3, h * 0.38, w - 0.5, 1, 0.7, 'black'),
      B(w / 2 - 6, d / 2 + 1.2, h * 0.45, 2, 2.4, h * 0.2, 'chrome'),
      B(w / 2 - 6, d / 2 + 1.2, h * 0.18, 2, 2.4, h * 0.14, 'chrome'),
    ],
  },
  dishwasher: {
    name: 'Geschirrspüler', cat: 'kitchen', w: 60, d: 62, h: 90, color: '#f2f1ee', color2: '#3b3d40', snap: true, tags: 'spülmaschine', model: (w, d, h) => [
      ...baseCabinet(w, d, h),
      B(0, d / 2 - 1.2, 11, w - 1, 1.8, h - 16, 'metal', 0.4),
      B(0, d / 2 + 0.6, h - 10, w * 0.7, 1.5, 1.5, 'chrome'),
    ],
  },
  wallCabinet: {
    name: 'Oberschrank', cat: 'kitchen', w: 60, d: 35, h: 70, elev: 145, color: '#f2f1ee', snap: true, mount: 'wall', tags: 'hängeschrank', model: (w, d, h) => [
      B(0, -0.8, 0, w - 0.4, d - 1.6, h, 'main', 0.4),
      ...cabinetFronts(w - 0.4, d - 1.6, 0, h, Math.max(1, Math.round(w / 60)), 'main+', 'chrome', false),
    ],
  },
  hood: {
    name: 'Dunstabzug', cat: 'kitchen', w: 60, d: 50, h: 70, elev: 150, color: '#c9cdd0', snap: true, mount: 'wall', tags: 'abzugshaube', model: (w, d, h) => [
      B(0, 0, 0, w, d, 10, 'main', 1),
      B(0, -d / 2 + 13, 10, 26, 26, h - 10, 'main', 0.5),
    ],
  },
  island: {
    name: 'Kücheninsel', cat: 'kitchen', w: 180, d: 95, h: 90, color: '#f2f1ee', color2: '#3b3d40', tags: 'insel theke', model: (w, d, h) => [
      B(0, -12, 0, w - 8, d - 32, 10, 'black'),
      B(0, -12, 10, w - 4, d - 28, h - 14, 'main'),
      ...cabinetFronts(w - 4, d - 28, 10, h - 14, Math.max(2, Math.round(w / 60))).map((p) => ({ ...p, y: p.y - 12 })),
      B(0, 0, h - 4, w, d, 4, 'second', 0.6),
    ],
  },
  // Schlafen
  doubleBed: {
    name: 'Doppelbett', cat: 'bedroom', w: 180, d: 210, h: 100, color: '#cdbfae', color2: '#dfe6ea', snap: true, tags: 'bett', model: (w, d, h) => [
      ...legs(w, d, 6, 6, 12, 'darkwood'),
      B(0, 4, 12, w, d - 8, 22, 'main', 2),
      B(0, -d / 2 + 4, 12, w + 2, 8, h - 12, 'main', 3),
      B(0, 6, 34, w - 8, d - 20, 20, 'mattress', 6),
      B(-w / 4 + 2, -d / 2 + 30, 54, w / 2 - 16, 34, 13, 'pillow', 6),
      B(w / 4 - 2, -d / 2 + 30, 54, w / 2 - 16, 34, 13, 'pillow', 6),
      B(0, 24, 54, w - 4, d - 62, 7, 'second', 3),
    ],
  },
  singleBed: {
    name: 'Einzelbett', cat: 'bedroom', w: 100, d: 210, h: 90, color: '#e8e2d8', color2: '#c9d6c3', snap: true, tags: 'bett', model: (w, d, h) => [
      ...legs(w, d, 5, 5, 12, 'darkwood'),
      B(0, 4, 12, w, d - 8, 20, 'main', 2),
      B(0, -d / 2 + 4, 12, w + 2, 8, h - 12, 'main', 3),
      B(0, 6, 32, w - 8, d - 20, 18, 'mattress', 6),
      B(0, -d / 2 + 28, 50, w - 26, 32, 12, 'pillow', 6),
      B(0, 24, 50, w - 4, d - 62, 7, 'second', 3),
    ],
  },
  crib: {
    name: 'Kinderbett', cat: 'bedroom', w: 76, d: 146, h: 90, color: '#f3f1ec', color2: '#e9c9b5', snap: true, tags: 'babybett', model: (w, d, h) => {
      const parts = [
        ...legs(w, d, 0, 5, h, 'main'),
        B(0, 0, 25, w - 4, d - 4, 10, 'mattress', 3),
        B(0, 12, 35, w - 10, d - 40, 4, 'second', 2),
        B(-w / 2 + 2, 0, h - 5, 4, d, 5, 'main'), B(w / 2 - 2, 0, h - 5, 4, d, 5, 'main'),
        B(0, -d / 2 + 2, h - 5, w, 4, 5, 'main'), B(0, d / 2 - 2, h - 5, w, 4, 5, 'main'),
      ];
      const n = Math.round(d / 10);
      for (let i = 1; i < n; i++) {
        const y = -d / 2 + (d * i) / n;
        parts.push(B(-w / 2 + 2, y, 25, 2, 2, h - 30, 'main'), B(w / 2 - 2, y, 25, 2, 2, h - 30, 'main'));
      }
      return parts;
    },
  },
  nightstand: {
    name: 'Nachttisch', cat: 'bedroom', w: 45, d: 40, h: 50, color: '#c49a6b', color2: '#262729', snap: true, tags: 'nachtkästchen', model: (w, d, h) => [
      ...legs(w, d, 3, 3, 12),
      B(0, -0.5, 12, w, d - 1, h - 12, 'main', 0.6),
      B(0, d / 2 - 0.6, 14, w - 2, 1.2, (h - 14) / 2 - 1, 'main+'),
      B(0, d / 2 - 0.6, 14 + (h - 14) / 2, w - 2, 1.2, (h - 14) / 2 - 2, 'main+'),
      C(0, d / 2 + 0.5, h - 10, 1.4, 1.2, 'second', null, 10),
    ],
  },
  wardrobe: {
    name: 'Kleiderschrank', cat: 'bedroom', w: 200, d: 60, h: 220, color: '#f0ede6', snap: true, tags: 'schrank garderobe', model: (w, d, h) => {
      const n = Math.max(1, Math.round(w / 50));
      const parts = [B(0, -1, 0, w, d - 2, h, 'main', 0.5)];
      const dw = w / n;
      for (let i = 0; i < n; i++) {
        const cx = -w / 2 + dw * (i + 0.5);
        parts.push(B(cx, d / 2 - 1, 2, dw - 0.8, 1.8, h - 4, 'main+', 0.3));
        const hx = cx + (i % 2 ? -1 : 1) * (dw / 2 - 5);
        parts.push(B(hx, d / 2 + 0.8, h * 0.42, 1.6, 2, 26, 'chrome'));
      }
      return parts;
    },
  },
  dresser: {
    name: 'Kommode', cat: 'bedroom', w: 120, d: 48, h: 85, color: '#efece6', color2: '#b88b5e', snap: true, tags: 'schubladen', model: (w, d, h) => {
      const parts = [...legs(w, d, 4, 4, 10, 'second'), B(0, -1, 10, w, d - 2, h - 10, 'main', 0.5)];
      const rows = 3, rh = (h - 12) / rows;
      for (let r = 0; r < rows; r++) {
        for (const sx of [-1, 1]) {
          parts.push(B((sx * w) / 4, d / 2 - 0.8, 11 + r * rh, w / 2 - 1.2, 1.6, rh - 1.2, 'main+', 0.3));
          parts.push(B((sx * w) / 4, d / 2 + 0.6, 11 + r * rh + rh / 2 - 0.8, 14, 1.5, 1.5, 'second'));
        }
      }
      return parts;
    },
  },
  // Bad
  toilet: {
    name: 'WC', cat: 'bath', w: 40, d: 66, h: 80, color: '#f8f8f6', snap: true, tags: 'toilette klo', model: (w, d, h) => [
      B(0, 4, 0, w * 0.55, d * 0.42, 32, 'main', 6),
      S(0, d * 0.12, 34, w / 2, d * 0.36, 9, 'main'),
      S(0, d * 0.12, 43.5, w / 2 - 0.5, d * 0.34, 2, 'white'),
      B(0, -d / 2 + 9, 40, w, 17, h - 40, 'main', 3),
      B(0, -d / 2 + 9, h, 9, 5, 0.8, 'chrome', 0.3),
    ],
  },
  washbasin: {
    name: 'Waschtisch', cat: 'bath', w: 80, d: 48, h: 85, color: '#7a5236', snap: true, tags: 'lavabo waschbecken', model: (w, d, h) => [
      B(0, -1, 30, w, d - 2, h - 34, 'main', 0.6),
      ...cabinetFronts(w, d - 2, 30, h - 34, 2, 'main+', 'chrome'),
      B(0, 0, h - 4, w, d, 4, 'ceramic', 1.5),
      S(0, 3, h, Math.min(w * 0.32, 25), d * 0.3, 0.6, 'ceramicDark'),
      C(0, -d / 2 + 6, h, 1.6, 14, 'chrome', null, 14),
      B(0, -d / 2 + 11, h + 12, 2.4, 10, 2.4, 'chrome'),
    ],
  },
  bathtub: {
    name: 'Badewanne', cat: 'bath', w: 170, d: 75, h: 58, color: '#f8f8f6', snap: true, tags: 'wanne', model: (w, d, h) => [
      B(0, 0, 0, w, d, h, 'main', 4),
      B(4, 0, h - 0.2, w - 22, d - 16, 0.4, 'tubInner', 8),
      C(-w / 2 + 6, 0, h, 1.8, 10, 'chrome', null, 12),
      B(-w / 2 + 11, 0, h + 8, 10, 2.5, 2.5, 'chrome'),
    ],
  },
  shower: {
    name: 'Dusche', cat: 'bath', w: 90, d: 90, h: 205, color: '#f8f8f6', snap: true, tags: 'duschkabine', model: (w, d, h) => [
      B(0, 0, 0, w, d, 5, 'main', 1.5),
      C(0, 0, 5, 4, 0.3, 'chrome', null, 16),
      B(0, d / 2 - 1, 5, w, 1, h - 5, 'glass'),
      B(w / 2 - 1, 0, 5, 1, d - 2, h - 5, 'glass'),
      B(0, d / 2 - 1, 5, w, 2.5, 2, 'chrome'),
      B(-w / 2 + 3, -d / 2 + 3, 90, 2.5, 2.5, h - 105, 'chrome'),
      C(-w / 2 + 14, -d / 2 + 14, h - 20, 11, 1.5, 'chrome', null, 24),
    ],
  },
  washer: {
    name: 'Waschmaschine', cat: 'bath', w: 60, d: 60, h: 85, color: '#f3f3f1', snap: true, tags: 'tumbler trockner', model: (w, d, h) => [
      B(0, 0, 0, w, d, h, 'main', 2),
      HC(0, d / 2, h * 0.45, Math.min(w, h) * 0.27, 2.5, 'y', 'chrome'),
      HC(0, d / 2 + 0.5, h * 0.45, Math.min(w, h) * 0.2, 2.5, 'y', 'glassDark'),
      B(0, d / 2 - 0.4, h - 12, w - 6, 1.2, 9, 'white-'),
    ],
  },
  mirror: {
    name: 'Spiegel', cat: 'bath', w: 70, d: 3, h: 90, elev: 110, color: '#2b2b2c', snap: true, mount: 'wall', tags: 'spiegel', model: (w, d, h) => [
      B(0, 0, 0, w, d, h, 'main', 0.5),
      B(0, d / 2 - 0.2, 2, w - 4, 0.5, h - 4, 'mirror'),
    ],
  },
  towelRail: {
    name: 'Handtuchheizkörper', cat: 'bath', w: 50, d: 8, h: 120, elev: 20, color: '#f3f3f1', snap: true, mount: 'wall', tags: 'radiator heizung', model: (w, d, h) => {
      const parts = [B(-w / 2 + 2, 0, 0, 3, d, h, 'main'), B(w / 2 - 2, 0, 0, 3, d, h, 'main')];
      for (let z = 6; z < h - 2; z += 9) parts.push(HC(0, 0, z, 1.4, w - 4, 'x', 'main'));
      return parts;
    },
  },
  // Büro
  desk: {
    name: 'Schreibtisch', cat: 'office', w: 140, d: 70, h: 75, color: '#efece6', color2: '#2b2b2c', snap: true, tags: 'pult arbeitstisch', model: (w, d, h) => [
      B(-w / 2 + 3, 0, 0, 4, d - 6, h - 3, 'second'),
      B(w / 2 - 3, 0, 0, 4, d - 6, h - 3, 'second'),
      B(0, -d / 2 + 8, h - 25, w - 10, 2, 20, 'second'),
      B(0, 0, h - 3, w, d, 3, 'main', 1),
    ],
  },
  officeChair: {
    name: 'Bürostuhl', cat: 'office', w: 62, d: 62, h: 105, color: '#3a3f45', keepRatio: false, tags: 'drehstuhl', model: (w, d, h) => {
      const parts = [];
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const r = Math.min(w, d) * 0.4;
        parts.push(B((Math.cos(a) * r) / 2, (Math.sin(a) * r) / 2, 4, r, 4, 3, 'black', 0, (a * 180) / Math.PI));
        parts.push(C(Math.cos(a) * r, Math.sin(a) * r, 0, 2.5, 4, 'black', null, 10));
      }
      parts.push(C(0, 0, 6, 2.6, 38, 'chrome', null, 14));
      parts.push(B(0, 3, 44, w * 0.78, d * 0.74, 8, 'main', 4));
      parts.push(B(0, -d * 0.34, 56, w * 0.72, 7, h - 56, 'main', 3));
      parts.push(B(-w * 0.41, 2, 56, 5, d * 0.42, 3, 'black', 1));
      parts.push(B(w * 0.41, 2, 56, 5, d * 0.42, 3, 'black', 1));
      parts.push(B(-w * 0.41, 2, 48, 3, 3, 8, 'black'));
      parts.push(B(w * 0.41, 2, 48, 3, 3, 8, 'black'));
      return parts;
    },
  },
  monitor: {
    name: 'Monitor', cat: 'office', w: 60, d: 20, h: 45, elev: 75, color: '#1e1f21', tags: 'bildschirm computer', model: (w, d, h) => [
      B(0, 0, 0, w * 0.35, d, 1.5, 'main', 0.5),
      B(0, -3, 1.5, 4, 3, h * 0.35, 'main'),
      B(0, -2, h - w * 0.58, w, 3, w * 0.58, 'main', 0.8),
      B(0, -0.3, h - w * 0.58 + 1, w - 2, 0.4, w * 0.58 - 2, 'screen'),
    ],
  },
  fileCabinet: {
    name: 'Rollcontainer', cat: 'office', w: 42, d: 55, h: 62, color: '#efece6', tags: 'schubladen büro', model: (w, d, h) => [
      ...legs(w, d, 4, 4, 5, 'black', true),
      B(0, 0, 5, w, d, h - 5, 'main', 0.6),
      B(0, d / 2 - 0.6, 6, w - 2, 1.2, (h - 8) / 3 - 1, 'main+'),
      B(0, d / 2 - 0.6, 6 + (h - 8) / 3, w - 2, 1.2, (h - 8) / 3 - 1, 'main+'),
      B(0, d / 2 - 0.6, 6 + (2 * (h - 8)) / 3, w - 2, 1.2, (h - 8) / 3 - 1, 'main+'),
    ],
  },
  // Licht
  floorLamp: {
    name: 'Stehlampe', cat: 'light', w: 42, d: 42, h: 165, color: '#262729', keepRatio: true, tags: 'lampe leuchte', model: (w, d, h) => [
      C(0, 0, 0, w * 0.36, 2.5, 'main'),
      C(0, 0, 2.5, 1.2, h - 34, 'main', null, 10),
      C(0, 0, h - 32, w / 2, 30, 'lampshade', w * 0.36),
    ],
  },
  tableLamp: {
    name: 'Tischlampe', cat: 'light', w: 30, d: 30, h: 50, color: '#c3714d', keepRatio: true, tags: 'lampe nachttischlampe', model: (w, d, h) => [
      C(0, 0, 0, w * 0.28, 3, 'main'),
      S(0, 0, h * 0.3, w * 0.25, d * 0.25, h * 0.22, 'main'),
      C(0, 0, h * 0.48, 0.8, h * 0.12, 'chrome', null, 8),
      C(0, 0, h * 0.55, w / 2, h * 0.45, 'lampshade', w * 0.36),
    ],
  },
  pendant: {
    name: 'Pendelleuchte', cat: 'light', w: 40, d: 40, h: 90, color: '#2b2b2c', mount: 'ceiling', keepRatio: true, tags: 'hängelampe', model: (w, d, h) => [
      C(0, 0, h - 1.5, 6, 1.5, 'main', null, 16),
      C(0, 0, 26, 0.4, h - 27, 'black', null, 6),
      C(0, 0, 0, w / 2, 26, 'main', w * 0.09),
      S(0, 0, 4, 5, 5, 5, 'bulb'),
    ],
  },
  ceilingLamp: {
    name: 'Deckenleuchte', cat: 'light', w: 50, d: 50, h: 12, color: '#f3f3f1', mount: 'ceiling', keepRatio: true, tags: 'deckenlampe', model: (w, d, h) => [
      C(0, 0, h * 0.4, w * 0.15, h * 0.6, 'main', null, 18),
      C(0, 0, 0, w / 2, h * 0.45, 'lampshade', w * 0.46, 36),
    ],
  },
  wallLamp: {
    name: 'Wandleuchte', cat: 'light', w: 24, d: 16, h: 26, elev: 175, color: '#c9a45c', mount: 'wall', snap: true, tags: 'wandlampe applique', model: (w, d, h) => [
      B(0, -d / 2 + 1, h * 0.2, 10, 2, h * 0.5, 'main', 0.5),
      B(0, -d / 2 + 5, h * 0.42, 2, 8, 2, 'main'),
      C(0, 2, h * 0.25, w / 2, h * 0.65, 'lampshade', w * 0.38),
    ],
  },
  // Deko
  rug: {
    name: 'Teppich', cat: 'deco', w: 200, d: 140, h: 1, color: '#c9b79c', tags: 'teppich', model: (w, d, h) => [
      B(0, 0, 0, w, d, Math.max(0.6, h), 'main-'),
      B(0, 0, 0.05, w - 14, d - 14, Math.max(0.6, h), 'main'),
    ],
  },
  rugRound: {
    name: 'Runder Teppich', cat: 'deco', w: 160, d: 160, h: 1, color: '#8e9b8f', keepRatio: true, tags: 'teppich rund', model: (w, d, h) => [
      { ...C(0, 0, 0, w / 2, Math.max(0.6, h), 'main', null, 48), sx: 1, sy: d / w },
      { ...C(0, 0, 0.05, w / 2 - 8, Math.max(0.6, h), 'main+', null, 48), sx: 1, sy: (d - 16) / (w - 16) },
    ],
  },
  plant: {
    name: 'Zimmerpflanze', cat: 'deco', w: 55, d: 55, h: 130, color: '#c3714d', keepRatio: true, tags: 'pflanze grün', model: (w, d, h) => [
      C(0, 0, 0, w * 0.26, h * 0.26, 'main', w * 0.32),
      C(0, 0, h * 0.25, w * 0.3, 1.5, 'soil'),
      C(0, 0, h * 0.26, 1.6, h * 0.3, 'trunk', null, 8),
      S(0, 0, h * 0.72, w / 2, d / 2, h * 0.24, 'leaf'),
      S(w * 0.14, -d * 0.1, h * 0.86, w * 0.32, d * 0.32, h * 0.14, 'leaf2'),
      S(-w * 0.16, d * 0.12, h * 0.6, w * 0.3, d * 0.3, h * 0.13, 'leaf2'),
    ],
  },
  picture: {
    name: 'Wandbild', cat: 'deco', w: 80, d: 3, h: 60, elev: 140, color: '#5d7d92', color2: '#2b2b2c', snap: true, mount: 'wall', tags: 'bild poster', model: (w, d, h) => [
      B(0, 0, 0, w, d, h, 'second'),
      B(0, d / 2 - 0.2, 3, w - 6, 0.5, h - 6, 'white'),
      B(-w * 0.1, d / 2 + 0.1, h * 0.2, w * 0.5, 0.4, h * 0.45, 'main'),
      S(w * 0.2, d / 2 + 0.2, h * 0.65, w * 0.12, 0.3, w * 0.12, 'book3'),
    ],
  },
  curtain: {
    name: 'Vorhang', cat: 'deco', w: 160, d: 12, h: 240, color: '#e9e2d4', snap: true, mount: 'wall', tags: 'gardine', model: (w, d, h) => {
      const n = Math.max(3, Math.round(w / 18));
      const parts = [C(0, 0, h - 2, 1, 2, 'metal'), B(0, -d / 2 + 2, h - 3, w + 10, 2, 2, 'metal')];
      for (let i = 0; i < n; i++) {
        const x = -w / 2 + (w * (i + 0.5)) / n;
        parts.push(C(x, (i % 2 ? 1 : -1) * d * 0.12, 0, w / n / 1.6, h - 4, 'main', null, 10));
      }
      return parts;
    },
  },
  // Bauteile
  stairs: {
    name: 'Treppe gerade', cat: 'build', w: 100, d: 300, h: 270, color: '#d9cdb8', tags: 'treppe stufen', custom2d: 'stairs', model: (w, d, h) => {
      const n = Math.max(3, Math.round(h / 18));
      const run = d / n, rise = h / n;
      const parts = [];
      for (let i = 0; i < n; i++) {
        const y = d / 2 - run * (i + 0.5);
        parts.push(B(0, y, 0, w, run + 0.2, rise * (i + 1), 'main'));
        parts.push(B(0, y - 0.5, rise * (i + 1) - 4, w + 1, run + 2, 4, 'main+'));
      }
      return parts;
    },
  },
  spiralStairs: {
    name: 'Wendeltreppe', cat: 'build', w: 160, d: 160, h: 270, color: '#8f959a', keepRatio: true, tags: 'treppe spindel', model: (w, d, h) => {
      const n = Math.max(6, Math.round(h / 19));
      const R = Math.min(w, d) / 2;
      const parts = [C(0, 0, 0, 6, h + 90, 'main', null, 18)];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 300 - 90;
        const rr = R / 2 + 2;
        parts.push(B(Math.cos((a * Math.PI) / 180) * rr, Math.sin((a * Math.PI) / 180) * rr, ((i + 1) * h) / n - 4, R - 6, 26, 4, 'lightwood', 0, a));
      }
      return parts;
    },
  },
  column: {
    name: 'Säule', cat: 'build', w: 30, d: 30, h: 250, color: '#efede8', keepRatio: true, tags: 'stütze pfeiler', model: (w, d, h) => [
      { ...C(0, 0, 0, w / 2, h, 'main', null, 32), sx: 1, sy: d / w },
    ],
  },
  pillar: {
    name: 'Pfeiler eckig', cat: 'build', w: 30, d: 30, h: 250, color: '#efede8', tags: 'stütze', model: (w, d, h) => [B(0, 0, 0, w, d, h, 'main')],
  },
  radiator: {
    name: 'Heizkörper', cat: 'build', w: 100, d: 10, h: 60, elev: 15, color: '#f3f3f1', snap: true, mount: 'wall', tags: 'heizung radiator', model: (w, d, h) => {
      const parts = [B(0, -1, 0, w, d - 4, h, 'main', 1)];
      for (let x = -w / 2 + 4; x < w / 2 - 2; x += 5) parts.push(B(x, d / 2 - 2, 2, 2.5, 2, h - 4, 'white-'));
      return parts;
    },
  },
  roofGable: { name: 'Satteldach', cat: 'build', w: 1000, d: 800, h: 300, elev: 250, color: '#8a4a35', color2: '#ece8e1', custom: 'gable', tags: 'dach giebel' },
  roofHip: { name: 'Walmdach', cat: 'build', w: 1000, d: 800, h: 280, elev: 250, color: '#5b5f63', custom: 'hip', tags: 'dach' },
  roofShed: { name: 'Pultdach', cat: 'build', w: 1000, d: 800, h: 150, elev: 250, color: '#4b5053', color2: '#ece8e1', custom: 'shed', tags: 'dach' },
  roofFlat: { name: 'Flachdach', cat: 'build', w: 1000, d: 800, h: 25, elev: 250, color: '#8e9392', custom: 'flat', tags: 'dach decke' },
  slab: { name: 'Bodenplatte', cat: 'build', w: 300, d: 200, h: 15, color: '#b4afa4', tags: 'podest platte terrasse', model: (w, d, h) => [B(0, 0, 0, w, d, h, 'main')] },
  // Garten
  tree: {
    name: 'Laubbaum', cat: 'outdoor', w: 320, d: 320, h: 600, color: '#4f7b3b', keepRatio: true, tags: 'baum', model: (w, d, h) => [
      C(0, 0, 0, w * 0.045, h * 0.5, 'trunk', w * 0.032, 14),
      S(0, 0, h * 0.66, w / 2, d / 2, h * 0.3, 'main'),
      S(w * 0.15, d * 0.1, h * 0.82, w * 0.3, d * 0.3, h * 0.17, 'leaf2'),
      S(-w * 0.18, -d * 0.12, h * 0.56, w * 0.28, d * 0.28, h * 0.15, 'leaf2'),
    ],
  },
  conifer: {
    name: 'Nadelbaum', cat: 'outdoor', w: 220, d: 220, h: 700, color: '#2f5a37', keepRatio: true, tags: 'tanne baum', model: (w, d, h) => [
      C(0, 0, 0, w * 0.05, h * 0.25, 'trunk', null, 12),
      C(0, 0, h * 0.18, w / 2, h * 0.38, 'main', w * 0.12, 18),
      C(0, 0, h * 0.42, w * 0.4, h * 0.34, 'main', w * 0.08, 18),
      C(0, 0, h * 0.66, w * 0.28, h * 0.34, 'main', 1, 18),
    ],
  },
  bush: {
    name: 'Busch', cat: 'outdoor', w: 120, d: 120, h: 100, color: '#5b8a45', tags: 'strauch', model: (w, d, h) => [
      S(0, 0, h * 0.48, w / 2, d / 2, h * 0.48, 'main'),
      S(w * 0.2, d * 0.15, h * 0.62, w * 0.3, d * 0.3, h * 0.34, 'leaf2'),
    ],
  },
  hedge: { name: 'Hecke', cat: 'outdoor', w: 200, d: 60, h: 150, color: '#3f6b38', tags: 'hecke', model: (w, d, h) => [B(0, 0, 0, w, d, h, 'main', Math.min(12, d / 2 - 1))] },
  gardenTable: {
    name: 'Gartentisch', cat: 'outdoor', w: 160, d: 90, h: 74, color: '#a07850', color2: '#3a3a3c', tags: 'tisch', model: (w, d, h) => {
      const parts = [...legs(w, d, 5, 4, h - 3)];
      const n = Math.max(4, Math.round(d / 11));
      for (let i = 0; i < n; i++) parts.push(B(0, -d / 2 + (d * (i + 0.5)) / n, h - 3, w, d / n - 1.2, 3, 'main'));
      return parts;
    },
  },
  lounger: {
    name: 'Liegestuhl', cat: 'outdoor', w: 70, d: 195, h: 45, color: '#a07850', color2: '#e8e1d1', tags: 'liege', model: (w, d, h) => [
      ...legs(w, d, 4, 5, 18, 'main'),
      B(0, 0, 18, w, d, 5, 'main', 1),
      B(0, 18, 23, w - 6, d - 60, 6, 'second', 2.5),
      B(0, -d / 2 + 30, 23, w - 6, 56, Math.max(8, h - 23), 'second', 3),
    ],
  },
  parasol: {
    name: 'Sonnenschirm', cat: 'outdoor', w: 300, d: 300, h: 250, color: '#e9e2d4', keepRatio: true, tags: 'schirm', model: (w, d, h) => [
      C(0, 0, 0, 25, 6, 'black'),
      C(0, 0, 6, 2, h - 6, 'metal', null, 10),
      C(0, 0, h - 45, w / 2, 40, 'main', 4, 8),
    ],
  },
  pool: {
    name: 'Pool', cat: 'outdoor', w: 400, d: 800, h: 12, color: '#d9d4ca', tags: 'schwimmbad', model: (w, d, h) => [
      B(-w / 2 + 15, 0, 0, 30, d, h, 'main'), B(w / 2 - 15, 0, 0, 30, d, h, 'main'),
      B(0, -d / 2 + 15, 0, w - 60, 30, h, 'main'), B(0, d / 2 - 15, 0, w - 60, 30, h, 'main'),
      B(0, 0, 0, w - 60, d - 60, h - 3, 'water'),
    ],
  },
  car: {
    name: 'Auto', cat: 'outdoor', w: 182, d: 460, h: 148, color: '#4c6b84', tags: 'auto wagen', model: (w, d, h) => [
      HC(-w / 2 + 13, -d * 0.31, 33, 33, 22, 'x', 'rubber'), HC(w / 2 - 13, -d * 0.31, 33, 33, 22, 'x', 'rubber'),
      HC(-w / 2 + 13, d * 0.3, 33, 33, 22, 'x', 'rubber'), HC(w / 2 - 13, d * 0.3, 33, 33, 22, 'x', 'rubber'),
      B(0, 0, 22, w, d, h * 0.42, 'main', 14),
      B(0, d * 0.04, h * 0.5, w * 0.84, d * 0.5, h * 0.5, 'main', 16),
      B(0, d * 0.04, h * 0.53, w * 0.86, d * 0.46, h * 0.4, 'glassDark', 14),
      B(-w * 0.32, -d / 2 + 1, h * 0.42, 30, 2, 10, 'lampshade', 1),
      B(w * 0.32, -d / 2 + 1, h * 0.42, 30, 2, 10, 'lampshade', 1),
    ],
  },
};

// --- doors & windows -----------------------------------------------------------
export const OPENINGS = {
  door: { name: 'Innentür', cat: 'doors', kind: 'door', w: 90, h: 210, sill: 0, color: '#f4f3ef', tags: 'tür' },
  doorGlass: { name: 'Glastür', cat: 'doors', kind: 'door', glass: true, w: 90, h: 210, sill: 0, color: '#e9e9e7', tags: 'tür glas' },
  doubleDoor: { name: 'Doppeltür', cat: 'doors', kind: 'double', w: 150, h: 210, sill: 0, color: '#f4f3ef', tags: 'flügeltür' },
  slidingDoor: { name: 'Schiebetür', cat: 'doors', kind: 'sliding', w: 180, h: 215, sill: 0, color: '#dcdcda', tags: 'hebeschiebetür glas' },
  entrance: { name: 'Haustür', cat: 'doors', kind: 'door', solid: true, w: 100, h: 215, sill: 0, color: '#34444f', tags: 'eingangstür' },
  passage: { name: 'Durchgang', cat: 'doors', kind: 'passage', w: 100, h: 210, sill: 0, color: '#f4f3ef', tags: 'öffnung' },
  garage: { name: 'Garagentor', cat: 'doors', kind: 'garage', w: 250, h: 220, sill: 0, color: '#d6d6d3', tags: 'tor' },
  window: { name: 'Fenster', cat: 'windows', kind: 'window', panes: 1, w: 100, h: 130, sill: 90, color: '#f7f7f5', tags: 'fenster' },
  window2: { name: 'Fenster 2-flüglig', cat: 'windows', kind: 'window', panes: 2, w: 140, h: 140, sill: 85, color: '#f7f7f5', tags: 'fenster' },
  window3: { name: 'Fenster 3-flüglig', cat: 'windows', kind: 'window', panes: 3, w: 220, h: 140, sill: 85, color: '#f7f7f5', tags: 'fenster' },
  smallWindow: { name: 'Kleines Fenster', cat: 'windows', kind: 'window', panes: 1, w: 60, h: 60, sill: 150, color: '#f7f7f5', tags: 'bad fenster' },
  french: { name: 'Fenstertür', cat: 'windows', kind: 'french', panes: 1, w: 90, h: 220, sill: 0, color: '#f7f7f5', tags: 'balkontür' },
  frenchDouble: { name: 'Balkontür 2-flüglig', cat: 'windows', kind: 'french', panes: 2, w: 150, h: 220, sill: 0, color: '#f7f7f5', tags: 'terrassentür' },
  panorama: { name: 'Panoramafenster', cat: 'windows', kind: 'fixed', w: 240, h: 220, sill: 10, color: '#3a3f45', tags: 'fixverglasung' },
};

export const isDoorKind = (kind) => ['door', 'double', 'sliding', 'passage', 'garage', 'french'].includes(kind);

/** Resolve a part material key to a concrete material description for an item. */
export function resolveMaterial(key, item, def) {
  const main = item.color || def.color || '#cccccc';
  const second = item.color2 || def.color2 || '#333333';
  switch (key) {
    case 'main': return { color: main, rough: 0.75 };
    case 'main+': return { color: shade(main, 0.1), rough: 0.8 };
    case 'main-': return { color: shade(main, -0.12), rough: 0.75 };
    case 'second': return { color: second, rough: 0.6 };
    case 'second+': return { color: shade(second, 0.12), rough: 0.6 };
    default: return MATERIALS[key] || { color: main, rough: 0.7 };
  }
}

export function itemParts(item) {
  const def = ITEMS[item.type];
  if (!def || !def.model) return [];
  try {
    return def.model(item.w, item.d, item.h);
  } catch (e) {
    return [B(0, 0, 0, item.w, item.d, item.h, 'main')];
  }
}

export function defaultItem(type) {
  const def = ITEMS[type];
  return {
    type, w: def.w, d: def.d, h: def.h, elev: def.elev || 0, rot: 0,
    color: def.color || null, color2: def.color2 || null, flip: false,
  };
}

export function searchCatalog(q) {
  const s = q.trim().toLowerCase();
  const out = [];
  for (const [id, def] of Object.entries(ITEMS)) {
    if (!s || def.name.toLowerCase().includes(s) || (def.tags || '').includes(s)) out.push({ kind: 'item', id, def });
  }
  for (const [id, def] of Object.entries(OPENINGS)) {
    if (!s || def.name.toLowerCase().includes(s) || (def.tags || '').includes(s)) out.push({ kind: 'opening', id, def });
  }
  return out;
}
