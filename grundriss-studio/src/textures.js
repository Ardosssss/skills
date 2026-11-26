// Grundriss Studio – procedural textures (canvas) and material catalogues
import { rng, shade, mix, hexToRgb, clamp } from './util.js';

export const FLOORS = [
  { id: 'oak', name: 'Parkett Eiche', tex: 'planks', color: '#c39a6b' },
  { id: 'walnut', name: 'Parkett Nussbaum', tex: 'planks', color: '#7a5236' },
  { id: 'lightwood', name: 'Laminat hell', tex: 'planks', color: '#dcc39f' },
  { id: 'greywood', name: 'Laminat grau', tex: 'planks', color: '#a8a199' },
  { id: 'basket', name: 'Würfelparkett', tex: 'basket', color: '#b98c5c' },
  { id: 'tiles-white', name: 'Fliesen weiss', tex: 'tiles', color: '#eeece7', grout: '#cdc8bf', n: 4 },
  { id: 'tiles-grey', name: 'Fliesen grau 60', tex: 'tiles', color: '#9c9d99', grout: '#7d7e7a', n: 2 },
  { id: 'tiles-anthracite', name: 'Fliesen anthrazit', tex: 'tiles', color: '#4b4e52', grout: '#3a3c3f', n: 2 },
  { id: 'terracotta', name: 'Terrakotta', tex: 'tiles', color: '#b5673f', grout: '#d9c8b4', n: 4 },
  { id: 'checker', name: 'Schachbrett', tex: 'checker', color: '#efede8', color2: '#2f3033', n: 4 },
  { id: 'marble', name: 'Marmor', tex: 'marble', color: '#ebe9e4' },
  { id: 'concrete', name: 'Beton', tex: 'concrete', color: '#a7a8a4' },
  { id: 'carpet-beige', name: 'Teppich beige', tex: 'carpet', color: '#cdbda2' },
  { id: 'carpet-blue', name: 'Teppich blau', tex: 'carpet', color: '#5d7188' },
  { id: 'carpet-grey', name: 'Teppich grau', tex: 'carpet', color: '#8b8d8f' },
  { id: 'stone', name: 'Steinplatten', tex: 'pavers', color: '#b4afa4' },
  { id: 'deck', name: 'Holzdeck', tex: 'deck', color: '#9c7550' },
  { id: 'grass', name: 'Rasen', tex: 'grass', color: '#7c9c55' },
];
export const FLOOR_BY_ID = Object.fromEntries(FLOORS.map((f) => [f.id, f]));

export const WALL_TEXTURES = [
  { id: 'paint', name: 'Farbe' },
  { id: 'plaster', name: 'Putz' },
  { id: 'brick', name: 'Backstein' },
  { id: 'wallTiles', name: 'Wandfliesen' },
  { id: 'woodPanel', name: 'Holztäfer' },
  { id: 'stoneWall', name: 'Naturstein' },
];

export const WALL_COLORS = [
  '#f4f2ee', '#ffffff', '#ece6da', '#e3ddd2', '#d4cfc6', '#bfc3c1', '#8e9392', '#4b5053',
  '#e8d9c0', '#d9b99b', '#c98f6e', '#b56a4c', '#dfe6d6', '#a9b89b', '#6f8a6a', '#dbe5ea',
  '#a7bfcd', '#5d7d92', '#2f4b5c', '#e9d5d3', '#c9a0a3', '#efe1a8', '#d8b45a', '#3b3d40',
];

export const ITEM_COLORS = [
  '#f4f2ee', '#d9d4ca', '#a59d90', '#6b6760', '#3a3a3c', '#1f2022', '#c49a6b', '#8a5f3c',
  '#5b3b26', '#d9c7a7', '#7d8c96', '#4c6b84', '#2c4155', '#6f8a6a', '#3f5b43', '#b7c6a3',
  '#b5673f', '#9c3d34', '#d3a14a', '#e5c9a8', '#c48b9f', '#7a5c86', '#e9e4da', '#b6b9bb',
];

const cache = new Map();

function canvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

function rgba(hex, a = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function noise(ctx, size, amount, seed, scale = 1) {
  const r = rng(seed);
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let y = 0; y < size; y += scale) {
    for (let x = 0; x < size; x += scale) {
      const v = (r() - 0.5) * amount;
      for (let yy = 0; yy < scale; yy++) {
        for (let xx = 0; xx < scale; xx++) {
          const i = ((y + yy) * size + (x + xx)) * 4;
          d[i] = clamp(d[i] + v, 0, 255);
          d[i + 1] = clamp(d[i + 1] + v, 0, 255);
          d[i + 2] = clamp(d[i + 2] + v, 0, 255);
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

function grain(ctx, x, y, w, h, color, r, horizontal = true) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const lines = Math.max(3, Math.round((horizontal ? h : w) / 3));
  for (let i = 0; i < lines; i++) {
    ctx.strokeStyle = rgba(shade(color, -0.25 - r() * 0.15), 0.12 + r() * 0.12);
    ctx.lineWidth = 0.6 + r() * 1.1;
    ctx.beginPath();
    const off = (horizontal ? y : x) + (i + r() * 0.8) * ((horizontal ? h : w) / lines);
    const amp = 1 + r() * 2.5, freq = 0.01 + r() * 0.03, ph = r() * 6;
    for (let t = 0; t <= (horizontal ? w : h); t += 6) {
      const o = off + Math.sin(t * freq + ph) * amp;
      if (horizontal) ctx.lineTo(x + t, o); else ctx.lineTo(o, y + t);
    }
    ctx.stroke();
  }
  // knots
  if (r() < 0.35) {
    const kx = x + r() * w, ky = y + r() * h;
    ctx.fillStyle = rgba(shade(color, -0.35), 0.25);
    ctx.beginPath();
    ctx.ellipse(kx, ky, 4 + r() * 6, 2 + r() * 3, horizontal ? 0 : Math.PI / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function planks(c, base, seed, rows = 6, gap = '#000') {
  const S = c.width, ctx = c.getContext('2d');
  const r = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  const ph = S / rows;
  for (let row = 0; row < rows; row++) {
    let x = -r() * S * 0.6;
    const y = row * ph;
    while (x < S) {
      const L = S * (0.45 + r() * 0.55);
      const col = shade(base, (r() - 0.5) * 0.18);
      const draw = (ox) => {
        ctx.fillStyle = col;
        ctx.fillRect(x + ox, y, L, ph);
        grain(ctx, x + ox, y, L, ph, col, r);
        ctx.fillStyle = rgba(gap, 0.28);
        ctx.fillRect(x + ox + L - 1, y, 1.5, ph);
      };
      draw(0);
      if (x + L > S) draw(-S);
      if (x < 0) draw(S);
      x += L;
    }
    ctx.fillStyle = rgba(gap, 0.32);
    ctx.fillRect(0, y, S, 1.4);
  }
  noise(ctx, S, 10, seed + 3);
}

function basket(c, base, seed) {
  const S = c.width, ctx = c.getContext('2d');
  const r = rng(seed);
  const n = 4, cell = S / n, strips = 3, sw = cell / strips;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const horizontal = (i + j) % 2 === 0;
      for (let k = 0; k < strips; k++) {
        const col = shade(base, (r() - 0.5) * 0.2);
        const x = horizontal ? i * cell : i * cell + k * sw;
        const y = horizontal ? j * cell + k * sw : j * cell;
        const w = horizontal ? cell : sw, h = horizontal ? sw : cell;
        ctx.fillStyle = col;
        ctx.fillRect(x, y, w, h);
        grain(ctx, x, y, w, h, col, r, horizontal);
        ctx.strokeStyle = rgba('#000', 0.22);
        ctx.lineWidth = 1.2;
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      }
    }
  }
  noise(ctx, S, 8, seed + 9);
}

function tiles(c, base, grout, n, seed) {
  const S = c.width, ctx = c.getContext('2d');
  const r = rng(seed);
  ctx.fillStyle = grout;
  ctx.fillRect(0, 0, S, S);
  const t = S / n, g = Math.max(1.5, S / 260);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const col = shade(base, (r() - 0.5) * 0.06);
      ctx.fillStyle = col;
      ctx.fillRect(i * t + g / 2, j * t + g / 2, t - g, t - g);
      const grd = ctx.createLinearGradient(i * t, j * t, i * t + t, j * t + t);
      grd.addColorStop(0, rgba('#ffffff', 0.08));
      grd.addColorStop(1, rgba('#000000', 0.05));
      ctx.fillStyle = grd;
      ctx.fillRect(i * t + g / 2, j * t + g / 2, t - g, t - g);
    }
  }
  noise(ctx, S, 7, seed + 1);
}

function checker(c, a, b, n) {
  const S = c.width, ctx = c.getContext('2d');
  const t = S / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    ctx.fillStyle = (i + j) % 2 ? b : a;
    ctx.fillRect(i * t, j * t, t, t);
  }
  ctx.strokeStyle = rgba('#888', 0.4);
  ctx.lineWidth = 1;
  for (let i = 0; i <= n; i++) {
    ctx.beginPath(); ctx.moveTo(i * t, 0); ctx.lineTo(i * t, S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * t); ctx.lineTo(S, i * t); ctx.stroke();
  }
  noise(ctx, S, 6, 5);
}

function marble(c, base, seed) {
  const S = c.width, ctx = c.getContext('2d');
  const r = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  for (let k = 0; k < 14; k++) {
    ctx.strokeStyle = rgba(shade(base, -0.35 - r() * 0.2), 0.12 + r() * 0.25);
    ctx.lineWidth = 0.6 + r() * 2.2;
    ctx.beginPath();
    let x = r() * S, y = 0;
    ctx.moveTo(x, y);
    while (y < S) {
      x += (r() - 0.5) * 40;
      y += 10 + r() * 30;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const t = S / 2;
  ctx.strokeStyle = rgba('#000', 0.12);
  ctx.strokeRect(0.5, 0.5, t, t);
  ctx.strokeRect(t + 0.5, t + 0.5, t, t);
  noise(ctx, S, 6, seed + 2);
}

function concrete(c, base, seed) {
  const S = c.width, ctx = c.getContext('2d');
  const r = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = rgba(r() < 0.5 ? '#000' : '#fff', 0.03 + r() * 0.05);
    ctx.beginPath();
    ctx.arc(r() * S, r() * S, 2 + r() * 26, 0, Math.PI * 2);
    ctx.fill();
  }
  noise(ctx, S, 22, seed + 4);
}

function carpet(c, base, seed) {
  const S = c.width, ctx = c.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  noise(ctx, S, 34, seed, 2);
  noise(ctx, S, 14, seed + 7, 1);
}

function pavers(c, base, seed) {
  const S = c.width, ctx = c.getContext('2d');
  const r = rng(seed);
  ctx.fillStyle = shade(base, -0.35);
  ctx.fillRect(0, 0, S, S);
  const rows = 3, h = S / rows, g = 4;
  for (let row = 0; row < rows; row++) {
    let x = row % 2 ? -S / 6 : 0;
    while (x < S) {
      const w = S / 3 + (r() - 0.5) * S * 0.08;
      const col = shade(base, (r() - 0.5) * 0.16);
      for (const ox of [0, x + w > S ? -S : null].filter((v) => v !== null)) {
        ctx.fillStyle = col;
        ctx.fillRect(x + ox + g / 2, row * h + g / 2, w - g, h - g);
      }
      x += w;
    }
  }
  noise(ctx, S, 18, seed + 2);
}

function deck(c, base, seed) {
  planks(c, base, seed, 5, '#1b130c');
}

function grass(c, base, seed) {
  const S = c.width, ctx = c.getContext('2d');
  const r = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 2600; i++) {
    const x = r() * S, y = r() * S;
    ctx.strokeStyle = rgba(shade(base, (r() - 0.45) * 0.5), 0.55);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (r() - 0.5) * 4, y - 3 - r() * 6);
    ctx.stroke();
  }
  noise(ctx, S, 14, seed + 6);
}

function brick(c, base, seed) {
  const S = c.width, ctx = c.getContext('2d');
  const r = rng(seed);
  ctx.fillStyle = '#d8d2c6';
  ctx.fillRect(0, 0, S, S);
  const rows = 14, h = S / rows, w = S / 4, g = 3;
  for (let row = 0; row < rows; row++) {
    const off = row % 2 ? w / 2 : 0;
    for (let k = -1; k < 5; k++) {
      ctx.fillStyle = shade(base, (r() - 0.5) * 0.22);
      ctx.fillRect(k * w + off + g / 2, row * h + g / 2, w - g, h - g);
    }
  }
  noise(ctx, S, 16, seed + 3);
}

function plaster(c, base, seed) {
  const S = c.width, ctx = c.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  noise(ctx, S, 12, seed, 2);
  noise(ctx, S, 6, seed + 1, 1);
}

function woodPanel(c, base, seed) {
  const S = c.width, ctx = c.getContext('2d');
  const r = rng(seed);
  const n = 7, w = S / n;
  for (let i = 0; i < n; i++) {
    const col = shade(base, (r() - 0.5) * 0.14);
    ctx.fillStyle = col;
    ctx.fillRect(i * w, 0, w, S);
    grain(ctx, i * w, 0, w, S, col, r, false);
    ctx.fillStyle = rgba('#000', 0.3);
    ctx.fillRect(i * w, 0, 1.5, S);
  }
  noise(ctx, S, 8, seed + 2);
}

function stoneWall(c, base, seed) {
  const S = c.width, ctx = c.getContext('2d');
  const r = rng(seed);
  ctx.fillStyle = shade(base, -0.4);
  ctx.fillRect(0, 0, S, S);
  let y = 0;
  while (y < S) {
    const h = 30 + r() * 40;
    let x = -r() * 40;
    while (x < S) {
      const w = 50 + r() * 80;
      ctx.fillStyle = shade(base, (r() - 0.5) * 0.3);
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, w - 4, h - 4, 8);
      ctx.fill();
      x += w;
    }
    y += h;
  }
  noise(ctx, S, 18, seed + 5);
}

/** Canvas with the texture of a floor material (cached). size 512 for 3D, smaller for 2D. */
export function floorCanvas(id, size = 512) {
  const key = 'f:' + id + ':' + size;
  if (cache.has(key)) return cache.get(key);
  const f = FLOOR_BY_ID[id] || FLOORS[0];
  const c = canvas(size);
  const seed = [...f.id].reduce((s, ch) => s + ch.charCodeAt(0) * 7, 11);
  switch (f.tex) {
    case 'planks': planks(c, f.color, seed); break;
    case 'basket': basket(c, f.color, seed); break;
    case 'tiles': tiles(c, f.color, f.grout || shade(f.color, -0.2), f.n || 4, seed); break;
    case 'checker': checker(c, f.color, f.color2 || '#333', f.n || 4); break;
    case 'marble': marble(c, f.color, seed); break;
    case 'concrete': concrete(c, f.color, seed); break;
    case 'carpet': carpet(c, f.color, seed); break;
    case 'pavers': pavers(c, f.color, seed); break;
    case 'deck': deck(c, f.color, seed); break;
    case 'grass': grass(c, f.color, seed); break;
    default: plaster(c, f.color, seed);
  }
  cache.set(key, c);
  return c;
}

/** Wall finish texture tinted with a colour (cached). Returns null for plain paint. */
export function wallCanvas(tex, color, size = 256) {
  if (!tex || tex === 'paint') return null;
  const key = 'w:' + tex + ':' + color + ':' + size;
  if (cache.has(key)) return cache.get(key);
  const c = canvas(size);
  switch (tex) {
    case 'plaster': plaster(c, color, 3); break;
    case 'brick': brick(c, mix(color, '#a5543a', 0.65), 4); break;
    case 'wallTiles': tiles(c, color, shade(color, -0.12), 5, 6); break;
    case 'woodPanel': woodPanel(c, mix(color, '#b08155', 0.7), 8); break;
    case 'stoneWall': stoneWall(c, mix(color, '#9d968a', 0.6), 9); break;
    default: plaster(c, color, 3);
  }
  cache.set(key, c);
  return c;
}

const urlCache = new Map();
export function floorDataUrl(id, size = 128) {
  const key = id + ':' + size;
  if (!urlCache.has(key)) urlCache.set(key, floorCanvas(id, size).toDataURL('image/jpeg', 0.82));
  return urlCache.get(key);
}
export function wallTexDataUrl(tex, color, size = 96) {
  const c = wallCanvas(tex, color, size);
  if (!c) return null;
  const key = 'w:' + tex + ':' + color + ':' + size;
  if (!urlCache.has(key)) urlCache.set(key, c.toDataURL('image/jpeg', 0.82));
  return urlCache.get(key);
}

/** World size (cm) one texture tile covers. */
export function floorTileSize(id) {
  const f = FLOOR_BY_ID[id];
  if (!f) return 120;
  if (f.tex === 'tiles') return f.n === 2 ? 120 : 100;
  if (f.tex === 'checker') return 120;
  if (f.tex === 'grass') return 200;
  if (f.tex === 'carpet') return 100;
  if (f.tex === 'pavers') return 150;
  if (f.tex === 'marble') return 120;
  if (f.tex === 'concrete') return 200;
  return 120;
}
