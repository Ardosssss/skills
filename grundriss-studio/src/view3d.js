// Grundriss Studio – 3D view (three.js)
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  clamp, rad, deg, add, sub, mul, dot, dist, norm, perp, polygonArea, clipHalfPlane, closestOnSegment,
  shade, mix, uid, r2, labelPoint,
} from './util.js';
import { getDerived, openingFrame, sortedLevels, projectBounds, levelBounds } from './model.js';
import { ITEMS, OPENINGS, MATERIALS, itemParts, resolveMaterial, defaultItem } from './catalog.js';
import { FLOOR_BY_ID, floorCanvas, floorTileSize, wallCanvas } from './textures.js';

const M = 0.01; // cm → m

export function createView3D(app, host) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (e) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.className = 'view3d-canvas';
  renderer.domElement.setAttribute('aria-label', '3D-Ansicht');
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 800);
  camera.position.set(12, 11, 14);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.09;
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.minDistance = 0.6;
  controls.maxDistance = 220;
  controls.screenSpacePanning = false;
  controls.target.set(5, 0, 4);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x9a958a, 0.55);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1dd, 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.025;
  scene.add(sun);
  scene.add(sun.target);

  const groundMat = new THREE.MeshStandardMaterial({ color: 0xa9b78f, roughness: 1 });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(160, 64), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.004;
  ground.receiveShadow = true;
  ground.userData.pick = { kind: 'ground' };
  scene.add(ground);
  {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(256, 256);
    let s = 7;
    for (let i = 0; i < img.data.length; i += 4) {
      s = (s * 16807) % 2147483647;
      const v = 222 + (s % 34);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(120, 120);
    t.colorSpace = THREE.SRGBColorSpace;
    groundMat.map = t;
  }

  const root = new THREE.Group();
  scene.add(root);
  const selBox = new THREE.Box3Helper(new THREE.Box3(), 0xe2571e);
  selBox.visible = false;
  scene.add(selBox);

  // ------------------------------------------------------------------ caches
  const matCache = new Map();
  const texCache = new Map();
  const geoCache = new Map();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  function canvasTexture(key, canvas) {
    if (texCache.has(key)) return texCache.get(key);
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    texCache.set(key, t);
    return t;
  }

  function stdMat(desc) {
    const key = JSON.stringify(desc);
    if (matCache.has(key)) return matCache.get(key);
    const m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(desc.color || '#cccccc'),
      roughness: desc.rough ?? 0.7,
      metalness: desc.metal ?? 0,
      envMapIntensity: desc.env ?? 0.7,
    });
    if (desc.opacity != null && desc.opacity < 1) {
      m.transparent = true;
      m.opacity = desc.opacity;
      m.depthWrite = false;
    }
    if (desc.emissive) {
      m.emissive = new THREE.Color(desc.emissive);
      m.emissiveIntensity = desc.ei ?? 0.5;
    }
    if (desc.map) {
      m.map = desc.map;
    }
    if (desc.side === 'double') m.side = THREE.DoubleSide;
    if (desc.side === 'back') m.side = THREE.BackSide;
    matCache.set(key, m);
    return m;
  }

  function floorMaterial(fid) {
    const key = 'floor:' + fid;
    if (matCache.has(key)) return matCache.get(key);
    const f = FLOOR_BY_ID[fid] || FLOOR_BY_ID.oak;
    const map = canvasTexture('f:' + f.id, floorCanvas(f.id, 512));
    const rough = ['tiles', 'marble', 'checker'].includes(f.tex) ? 0.28 : f.tex === 'carpet' || f.tex === 'grass' ? 0.95 : 0.6;
    const m = new THREE.MeshStandardMaterial({ map, roughness: rough, metalness: 0, envMapIntensity: 0.6 });
    matCache.set(key, m);
    return m;
  }

  function wallMaterial(color, tex) {
    const key = 'wall:' + color + ':' + (tex || 'paint');
    if (matCache.has(key)) return matCache.get(key);
    const c = wallCanvas(tex, color, 256);
    let m;
    if (c) m = new THREE.MeshStandardMaterial({ map: canvasTexture('w:' + tex + color, c), roughness: tex === 'wallTiles' ? 0.3 : 0.85, envMapIntensity: 0.5 });
    else m = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.9, envMapIntensity: 0.5 });
    matCache.set(key, m);
    return m;
  }

  const revealMat = () => stdMat({ color: '#eceae5', rough: 0.9, env: 0.5 });
  const capMat = () => stdMat({ color: '#454b50', rough: 0.9, env: 0.3 });
  const slabMat = () => stdMat({ color: '#e7e5e0', rough: 0.95, env: 0.4 });
  const ceilingMat = () => stdMat({ color: '#f7f6f3', rough: 0.95, env: 0.5, side: 'back' });

  // ------------------------------------------------------------------ geometry helpers
  function buildGroupedGeometry(tris) {
    // tris: [{p:[3 x [x,y,z]], n:[x,y,z], uv:[3 x [u,v]], g}]
    const byGroup = new Map();
    for (const t of tris) {
      if (!byGroup.has(t.g)) byGroup.set(t.g, []);
      byGroup.get(t.g).push(t);
    }
    const pos = [], nor = [], uvs = [];
    const geo = new THREE.BufferGeometry();
    let start = 0;
    for (const g of [...byGroup.keys()].sort((a, b) => a - b)) {
      const list = byGroup.get(g);
      for (const t of list) {
        for (let k = 0; k < 3; k++) {
          pos.push(...t.p[k]);
          nor.push(...t.n);
          uvs.push(...(t.uv ? t.uv[k] : [0, 0]));
        }
      }
      geo.addGroup(start, list.length * 3, g);
      start += list.length * 3;
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    return geo;
  }

  function pushTri(out, a, b, c, n, uv, g) {
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const cr = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
    if (cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] < 0) {
      out.push({ p: [a, c, b], n, uv: uv ? [uv[0], uv[2], uv[1]] : null, g });
    } else out.push({ p: [a, b, c], n, uv, g });
  }

  /** Vertical prism from a plan polygon (cm), between heights y0..y1 (cm). classify(edgeOutwardNormal) → group. */
  function prismTris(out, poly, y0, y1, classify, capGroupTop = 3, capGroupBottom = 2) {
    let pts = poly;
    if (polygonArea(pts) < 0) pts = pts.slice().reverse();
    const Y0 = y0 * M, Y1 = y1 * M;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      const ex = q.x - p.x, ey = q.y - p.y;
      const L = Math.hypot(ex, ey);
      if (L < 0.05) continue;
      const on = { x: ey / L, y: -ex / L };
      const g = classify(on);
      const n = [on.x, 0, on.y];
      const u0 = ((p.x * ex + p.y * ey) / L) * M, u1 = u0 + L * M;
      const A = [p.x * M, Y0, p.y * M], B = [q.x * M, Y0, q.y * M], C = [q.x * M, Y1, q.y * M], D = [p.x * M, Y1, p.y * M];
      pushTri(out, A, B, C, n, [[u0, Y0], [u1, Y0], [u1, Y1]], g);
      pushTri(out, A, C, D, n, [[u0, Y0], [u1, Y1], [u0, Y1]], g);
    }
    const contour = pts.map((p) => new THREE.Vector2(p.x, p.y));
    let tris = [];
    try { tris = THREE.ShapeUtils.triangulateShape(contour, []); } catch (e) { tris = []; }
    for (const [i, j, k] of tris) {
      const a = pts[i], b = pts[j], c = pts[k];
      const uv = (p) => [p.x * M, p.y * M];
      pushTri(out, [a.x * M, Y1, a.y * M], [b.x * M, Y1, b.y * M], [c.x * M, Y1, c.y * M], [0, 1, 0], [uv(a), uv(b), uv(c)], capGroupTop);
      pushTri(out, [a.x * M, Y0, a.y * M], [b.x * M, Y0, b.y * M], [c.x * M, Y0, c.y * M], [0, -1, 0], [uv(a), uv(b), uv(c)], capGroupBottom);
    }
  }

  function boxGeo(w, h, d, r) {
    const rr = Math.min(r, w / 2, h / 2, d / 2);
    const key = `b${w.toFixed(4)}|${h.toFixed(4)}|${d.toFixed(4)}|${rr > 0.004 ? rr.toFixed(4) : 0}`;
    if (geoCache.has(key)) return geoCache.get(key);
    const g = rr > 0.004 ? new RoundedBoxGeometry(w, h, d, 2, rr) : new THREE.BoxGeometry(w, h, d);
    geoCache.set(key, g);
    return g;
  }
  function cylGeo(rt, rb, h, seg) {
    const key = `c${rt.toFixed(4)}|${rb.toFixed(4)}|${h.toFixed(4)}|${seg}`;
    if (geoCache.has(key)) return geoCache.get(key);
    const g = new THREE.CylinderGeometry(Math.max(rt, 0.0005), Math.max(rb, 0.0005), Math.max(h, 0.001), seg);
    geoCache.set(key, g);
    return g;
  }
  const sphereGeo = new THREE.SphereGeometry(1, 22, 16);

  function mesh(geo, mat, opts = {}) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = opts.cast !== false && !(mat.transparent);
    m.receiveShadow = opts.receive !== false;
    return m;
  }

  // ------------------------------------------------------------------ items
  function partMesh(p, it, def) {
    const desc = resolveMaterial(p.m, it, def);
    const mat = stdMat({ color: desc.color, rough: desc.rough, metal: desc.metal, opacity: desc.opacity, emissive: desc.emissive, ei: desc.ei });
    let m;
    switch (p.t) {
      case 'box': {
        m = mesh(boxGeo(Math.max(p.w, 0.1) * M, Math.max(p.h, 0.1) * M, Math.max(p.d, 0.1) * M, (p.r || 0) * M), mat);
        m.position.set(p.x * M, (p.z + p.h / 2) * M, p.y * M);
        if (p.rz) m.rotation.y = -rad(p.rz);
        break;
      }
      case 'cyl': {
        m = mesh(cylGeo(p.r2 * M, p.r * M, p.h * M, p.seg || 24), mat);
        m.position.set(p.x * M, (p.z + p.h / 2) * M, p.y * M);
        if (p.sx || p.sy) m.scale.set(p.sx || 1, 1, p.sy || 1);
        break;
      }
      case 'sph': {
        m = mesh(sphereGeo, mat);
        m.scale.set(Math.max(p.rx, 0.1) * M, Math.max(p.rz, 0.1) * M, Math.max(p.ry, 0.1) * M);
        m.position.set(p.x * M, p.z * M, p.y * M);
        break;
      }
      case 'hcyl': {
        m = mesh(cylGeo(p.r * M, p.r * M, p.len * M, 22), mat);
        m.position.set(p.x * M, p.z * M, p.y * M);
        if (p.axis === 'x') m.rotation.z = Math.PI / 2;
        else m.rotation.x = Math.PI / 2;
        break;
      }
      default:
        return null;
    }
    return m;
  }

  function polyMesh(verts, faces, mats) {
    // verts in item-local cm (x, y=front, z=up); faces: [[indices...], group]
    const out = [];
    const V = verts.map((v) => [v[0] * M, v[2] * M, v[1] * M]);
    for (const [idx, g] of faces) {
      const a = V[idx[0]], b = V[idx[1]], c = V[idx[2]];
      const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      let n = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
      const l = Math.hypot(...n) || 1;
      n = n.map((x) => x / l);
      for (let k = 1; k + 1 < idx.length; k++) {
        const p0 = V[idx[0]], p1 = V[idx[k]], p2 = V[idx[k + 1]];
        const uv = (p) => [p[0] + p[2], p[1]];
        out.push({ p: [p0, p1, p2], n, uv: [uv(p0), uv(p1), uv(p2)], g });
      }
    }
    const geo = buildGroupedGeometry(out);
    return mesh(geo, mats);
  }

  function roofObject(kind, it, def) {
    const w = it.w, d = it.d, h = it.h, hw = w / 2, hd = d / 2;
    const roofM = stdMat({ color: it.color || def.color, rough: 0.8 });
    const gableM = stdMat({ color: it.color2 || def.color2 || '#ece8e1', rough: 0.9 });
    const under = stdMat({ color: '#d9d6cf', rough: 0.95 });
    const mats = [roofM, gableM, under];
    let m;
    if (kind === 'gable') {
      const v = [[-hw, -hd, 0], [hw, -hd, 0], [hw, hd, 0], [-hw, hd, 0], [-hw, 0, h], [hw, 0, h]];
      // outward orientation is handled by explicit normals per face order
      m = polyMesh(v, [[[0, 1, 5, 4], 0], [[2, 3, 4, 5], 0], [[3, 0, 4], 1], [[1, 2, 5], 1], [[0, 3, 2, 1], 2]], mats);
    } else if (kind === 'hip') {
      let v, f;
      if (w >= d) {
        const rx = (w - d) / 2;
        v = [[-hw, -hd, 0], [hw, -hd, 0], [hw, hd, 0], [-hw, hd, 0], [-rx, 0, h], [rx, 0, h]];
        f = [[[0, 1, 5, 4], 0], [[2, 3, 4, 5], 0], [[3, 0, 4], 0], [[1, 2, 5], 0], [[0, 3, 2, 1], 2]];
      } else {
        const ry = (d - w) / 2;
        v = [[-hw, -hd, 0], [hw, -hd, 0], [hw, hd, 0], [-hw, hd, 0], [0, -ry, h], [0, ry, h]];
        f = [[[0, 1, 4], 0], [[2, 3, 5], 0], [[3, 0, 4, 5], 0], [[1, 2, 5, 4], 0], [[0, 3, 2, 1], 2]];
      }
      m = polyMesh(v, f, mats);
    } else if (kind === 'shed') {
      const v = [[-hw, -hd, 0], [hw, -hd, 0], [hw, hd, 0], [-hw, hd, 0], [-hw, -hd, h], [hw, -hd, h]];
      m = polyMesh(v, [[[3, 2, 5, 4], 0], [[0, 4, 5, 1], 1], [[0, 3, 4], 1], [[1, 5, 2], 1], [[0, 1, 2, 3], 2]], mats);
    } else {
      m = mesh(boxGeo(w * M, h * M, d * M, 0), roofM);
      m.position.y = (h / 2) * M;
    }
    // make faces render from both sides for robustness with custom winding
    if (m.material && Array.isArray(m.material)) m.material = m.material.map((x) => doubleSided(x));
    return m;
  }
  function doubleSided(m) {
    const key = m.uuid + ':ds';
    if (matCache.has(key)) return matCache.get(key);
    const c = m.clone();
    c.side = THREE.DoubleSide;
    matCache.set(key, c);
    return c;
  }

  function buildItem(it) {
    const def = ITEMS[it.type];
    const g = new THREE.Group();
    if (!def) return g;
    if (def.custom) g.add(roofObject(def.custom, it, def));
    else for (const p of itemParts(it)) {
      const m = partMesh(p, it, def);
      if (m) g.add(m);
    }
    g.position.set(it.x * M, (it.elev || 0) * M, it.y * M);
    g.rotation.y = -rad(it.rot || 0);
    if (it.flip) g.scale.x = -1;
    g.traverse((o) => { o.userData.pick = { kind: 'item', id: it.id }; });
    return g;
  }

  // ------------------------------------------------------------------ openings
  function frameMat(color) {
    return stdMat({ color: color || '#f4f3ef', rough: 0.5 });
  }
  const glassMat = () => stdMat({ color: '#cfe3ec', rough: 0.04, metal: 0.1, opacity: 0.3, env: 1 });

  function addBox(g, w, h, d, x, y, z, mat) {
    const m = mesh(boxGeo(w, h, d, 0), mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  }

  function buildOpeningModel(o, thicknessCm, insideSide, doorsOpen) {
    const def = OPENINGS[o.type];
    const g = new THREE.Group();
    if (!def) return g;
    const W = o.width * M, H = o.height * M, T = thicknessCm * M, S = (o.sill || 0) * M;
    const fw = 0.06, fd = Math.max(0.06, T + 0.016);
    const fm = frameMat(o.color || def.color);
    const sg = o.swing ? -1 : 1;
    const kind = def.kind;
    const jambs = (depth = fd, z = 0) => {
      addBox(g, fw, H, depth, -W / 2 + fw / 2, S + H / 2, z, fm);
      addBox(g, fw, H, depth, W / 2 - fw / 2, S + H / 2, z, fm);
      addBox(g, W, fw, depth, 0, S + H - fw / 2, z, fm);
    };
    const leaf = (lw, hingeX, dir, mat, glass) => {
      // leaf hinged at hingeX (local x), extends towards dir (+1 / -1)
      const pivot = new THREE.Group();
      pivot.position.set(hingeX, S, sg * (T / 2 - 0.025));
      const lh = H - fw - 0.01;
      if (glass) {
        const t = 0.04, b = 0.07;
        const lg = new THREE.Group();
        addBox(lg, b, lh, t, dir * (b / 2), lh / 2, 0, mat);
        addBox(lg, b, lh, t, dir * (lw - b / 2), lh / 2, 0, mat);
        addBox(lg, lw, b, t, dir * (lw / 2), b / 2, 0, mat);
        addBox(lg, lw, b, t, dir * (lw / 2), lh - b / 2, 0, mat);
        addBox(lg, lw - 2 * b, lh - 2 * b, 0.01, dir * (lw / 2), lh / 2, 0, glassMat());
        pivot.add(lg);
      } else {
        addBox(pivot, lw, lh, 0.04, dir * (lw / 2), lh / 2, 0, mat);
      }
      const hx = dir * (lw - 0.08);
      const hm = stdMat({ color: '#c9cdd1', rough: 0.25, metal: 0.9 });
      addBox(pivot, 0.12, 0.02, 0.02, hx - dir * 0.04, 1.05 - S + 0, 0.04, hm);
      addBox(pivot, 0.12, 0.02, 0.02, hx - dir * 0.04, 1.05 - S + 0, -0.04, hm);
      if (doorsOpen) pivot.rotation.y = dir * sg * (Math.PI / 2) * 0.92 * -1;
      g.add(pivot);
      return pivot;
    };
    switch (kind) {
      case 'door': {
        jambs();
        const lw = W - 2 * fw;
        const hingeX = o.flip ? W / 2 - fw : -W / 2 + fw;
        const leafMat = def.solid ? stdMat({ color: o.color || def.color, rough: 0.45 }) : fm;
        leaf(lw, hingeX, o.flip ? -1 : 1, leafMat, !!def.glass);
        break;
      }
      case 'double': {
        jambs();
        const lw = (W - 2 * fw) / 2;
        leaf(lw, -W / 2 + fw, 1, fm, false);
        leaf(lw, W / 2 - fw, -1, fm, false);
        break;
      }
      case 'sliding': {
        jambs(fd);
        const pw = (W - 2 * fw) / 2 + 0.04;
        for (const [x, z] of [[-W / 2 + fw + pw / 2, 0.025], [W / 2 - fw - pw / 2, -0.025]]) {
          const b = 0.06, ph = H - fw;
          addBox(g, b, ph, 0.04, x - pw / 2 + b / 2, S + ph / 2, z, fm);
          addBox(g, b, ph, 0.04, x + pw / 2 - b / 2, S + ph / 2, z, fm);
          addBox(g, pw, b, 0.04, x, S + b / 2, z, fm);
          addBox(g, pw, b, 0.04, x, S + ph - b / 2, z, fm);
          addBox(g, pw - 2 * b, ph - 2 * b, 0.01, x, S + ph / 2, z, glassMat());
        }
        break;
      }
      case 'garage': {
        jambs();
        const pm = stdMat({ color: o.color || def.color, rough: 0.5, metal: 0.2 });
        const panels = 4, ph = (H - fw) / panels;
        for (let i = 0; i < panels; i++) addBox(g, W - 2 * fw, ph - 0.012, 0.045, 0, S + ph * (i + 0.5), -sg * (T / 2 - 0.05), pm);
        break;
      }
      case 'passage':
        break;
      default: {
        // windows, french windows, fixed glazing
        const depth = 0.08;
        jambs(depth, 0);
        addBox(g, W, fw, depth, 0, S + fw / 2, 0, fm);
        const panes = kind === 'fixed' ? 1 : def.panes || 1;
        const innerW = W - 2 * fw;
        for (let i = 1; i < panes; i++) addBox(g, fw * 0.9, H - 2 * fw, depth, -W / 2 + fw + (innerW * i) / panes, S + H / 2, 0, fm);
        const paneW = innerW / panes;
        for (let i = 0; i < panes; i++) {
          const cx = -W / 2 + fw + paneW * (i + 0.5);
          if (kind !== 'fixed') {
            const b = 0.045;
            addBox(g, b, H - 2 * fw, 0.06, cx - paneW / 2 + b / 2 + 0.01, S + H / 2, 0, fm);
            addBox(g, b, H - 2 * fw, 0.06, cx + paneW / 2 - b / 2 - 0.01, S + H / 2, 0, fm);
            addBox(g, paneW - 0.02, b, 0.06, cx, S + fw + b / 2, 0, fm);
            addBox(g, paneW - 0.02, b, 0.06, cx, S + H - fw - b / 2, 0, fm);
          }
          addBox(g, paneW - 0.04, H - 2 * fw - 0.04, 0.012, cx, S + H / 2, 0, glassMat());
        }
        if (S > 0.05 && insideSide) {
          addBox(g, W + 0.06, 0.025, 0.07, 0, S - 0.0125, insideSide * (T / 2 + 0.01), stdMat({ color: '#f1efea', rough: 0.4 }));
          addBox(g, W + 0.04, 0.02, 0.08, 0, S - 0.03, -insideSide * (T / 2 + 0.02), stdMat({ color: '#9aa0a5', rough: 0.4, metal: 0.6 }));
        }
      }
    }
    return g;
  }

  // ------------------------------------------------------------------ structure per level
  function wallTopFor(lv, levels) {
    const above = levels.find((l) => l.elevation > lv.elevation);
    return above ? Math.max(lv.height, above.elevation - lv.elevation) : lv.height;
  }

  function buildStructure(lv, levels, opts) {
    const g = new THREE.Group();
    const d = getDerived(lv);
    const roomById = new Map(lv.rooms.map((r) => [r.id, r]));
    const st = app.project.settings;
    const extMat = wallMaterial(st.exteriorColor || '#ece8e1', st.exteriorTex || 'plaster');
    const topDefault = wallTopFor(lv, levels);

    // floors, slabs, ceilings
    for (const f of d.faces) {
      const room = roomById.get(f.roomId);
      if (!room) continue;
      const shape = new THREE.Shape(f.poly.map((p) => new THREE.Vector2(p.x * M, -p.y * M)));
      if (room.showFloor !== false) {
        const geo = new THREE.ShapeGeometry(shape);
        geo.rotateX(-Math.PI / 2);
        const tile = floorTileSize(room.floor) * M;
        const uv = geo.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / tile, uv.getY(i) / tile);
        const fm = mesh(geo, floorMaterial(room.floor), { cast: false });
        fm.position.y = 0.002;
        fm.userData.pick = { kind: 'room', id: room.id };
        g.add(fm);
        if (lv.elevation > 1) {
          const slab = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: false });
          slab.rotateX(-Math.PI / 2);
          const sm = mesh(slab, slabMat());
          sm.position.y = -0.2;
          sm.userData.pick = { kind: 'room', id: room.id };
          g.add(sm);
        }
      }
      if (opts.ceilings && room.ceiling !== false) {
        const cg = new THREE.ShapeGeometry(shape);
        cg.rotateX(-Math.PI / 2);
        const cm = mesh(cg, ceilingMat(), { cast: false });
        cm.position.y = lv.height * M - 0.002;
        g.add(cm);
      }
    }

    // walls
    for (const info of d.walls.values()) {
      const wall = info.wall;
      const H = wall.height == null ? topDefault : wall.height;
      const ops = lv.openings
        .filter((o) => o.wallId === wall.id && OPENINGS[o.type])
        .map((o) => ({ o, fr: openingFrame(lv, o) }))
        .filter((x) => x.fr)
        .sort((a, b) => a.fr.u0 - b.fr.u0);
      const cuts = [];
      for (const { fr } of ops) {
        if (cuts.length && fr.u0 <= cuts[cuts.length - 1][1]) cuts[cuts.length - 1][1] = Math.max(cuts[cuts.length - 1][1], fr.u1);
        else cuts.push([fr.u0, fr.u1]);
      }
      const ad = dot(info.a, info.d);
      const clipU = (poly, lo, hi) => {
        let p = poly;
        if (hi !== Infinity) p = clipHalfPlane(p, info.d, hi + ad);
        if (lo !== -Infinity && p.length) p = clipHalfPlane(p, mul(info.d, -1), -(lo + ad));
        return p;
      };
      const tris = [];
      const classify = (on) => {
        const k = dot(on, info.n);
        return k > 0.7 ? 0 : k < -0.7 ? 1 : 2;
      };
      let prev = -Infinity;
      for (const [u0, u1] of cuts) {
        const piece = clipU(info.poly, prev, u0);
        if (piece.length >= 3) prismTris(tris, piece, 0, H, classify);
        prev = u1;
      }
      const last = clipU(info.poly, prev, Infinity);
      if (last.length >= 3) prismTris(tris, last, 0, H, classify);
      for (const { o, fr } of ops) {
        const a0 = add(info.a, mul(info.d, fr.u0)), a1 = add(info.a, mul(info.d, fr.u1));
        const rect = [add(a0, mul(info.n, info.h)), add(a1, mul(info.n, info.h)), sub(a1, mul(info.n, info.h)), sub(a0, mul(info.n, info.h))];
        const top = Math.min(H, (o.sill || 0) + o.height);
        if ((o.sill || 0) > 0.5) prismTris(tris, rect, 0, Math.min(o.sill, H), classify);
        if (top < H - 0.5) prismTris(tris, rect, top, H, classify);
      }
      if (!tris.length) continue;
      const roomP = info.roomP && roomById.get(info.roomP);
      const roomN = info.roomN && roomById.get(info.roomN);
      const mP = roomP ? wallMaterial(roomP.wallColor || '#f4f2ee', roomP.wallTex) : extMat;
      const mN = roomN ? wallMaterial(roomN.wallColor || '#f4f2ee', roomN.wallTex) : extMat;
      const wm = mesh(buildGroupedGeometry(tris), [mP, mN, revealMat(), capMat()]);
      wm.userData.pick = { kind: 'wall', id: wall.id };
      g.add(wm);

      for (const { o, fr } of ops) {
        const inside = roomP && !roomN ? 1 : roomN && !roomP ? -1 : 0;
        const model = buildOpeningModel(o, wall.thickness, inside, !!app.project.settings.doorsOpen || opts.walk);
        const c = add(info.a, mul(info.d, fr.u));
        model.position.set(c.x * M, 0, c.y * M);
        model.rotation.y = Math.atan2(-info.d.y, info.d.x);
        model.traverse((x) => { x.userData.pick = { kind: 'opening', id: o.id }; });
        g.add(model);
        const def = OPENINGS[o.type];
        if ((o.sill || 0) < 1 && (!roomP || !roomN) && def.kind !== 'window') {
          // threshold for exterior doors
          const th = mesh(boxGeo(o.width * M, 0.02, wall.thickness * M + 0.02, 0), stdMat({ color: '#b9b4aa', rough: 0.8 }), { cast: false });
          th.position.set(c.x * M, 0.0, c.y * M);
          th.rotation.y = Math.atan2(-info.d.y, info.d.x);
          g.add(th);
        }
      }
    }
    return g;
  }

  // ------------------------------------------------------------------ sync scene with model
  const levelEntries = new Map();
  let showAll = false;
  let structureDirty = true;

  function structKey(lv, levels, opts) {
    const s = app.project.settings;
    return JSON.stringify([lv.walls, lv.openings, lv.rooms, lv.height, wallTopFor(lv, levels), s.exteriorColor, s.exteriorTex, s.doorsOpen, opts.ceilings, opts.walk]);
  }

  function sync() {
    const project = app.project;
    const levels = sortedLevels(project);
    const cur = app.level;
    const curIdx = levels.indexOf(cur);
    const visible = new Set(levels.filter((l, i) => showAll || i <= curIdx).map((l) => l.id));
    const opts = { ceilings: !!walk, walk: !!walk };
    for (const [id, e] of levelEntries) {
      if (!visible.has(id) || !project.levels.includes(e.level)) {
        root.remove(e.group);
        levelEntries.delete(id);
      }
    }
    for (const lv of levels) {
      if (!visible.has(lv.id)) continue;
      let e = levelEntries.get(lv.id);
      if (!e || e.level !== lv) {
        if (e) root.remove(e.group);
        e = { level: lv, group: new THREE.Group(), structKey: null, struct: null, items: new Map() };
        root.add(e.group);
        levelEntries.set(lv.id, e);
      }
      e.group.position.y = lv.elevation * M;
      const sk = structKey(lv, levels, opts);
      if (sk !== e.structKey) {
        if (e.struct) e.group.remove(e.struct);
        e.struct = buildStructure(lv, levels, opts);
        e.group.add(e.struct);
        e.structKey = sk;
      }
      const seen = new Set();
      for (const it of lv.items) {
        seen.add(it.id);
        const k = JSON.stringify(it);
        const ie = e.items.get(it.id);
        if (ie && ie.key === k) continue;
        if (ie) e.group.remove(ie.obj);
        const obj = buildItem(it);
        e.group.add(obj);
        e.items.set(it.id, { key: k, obj });
      }
      for (const [id, ie] of e.items) {
        if (!seen.has(id)) {
          e.group.remove(ie.obj);
          e.items.delete(id);
        }
      }
    }
    groundMat.color.set(project.settings.groundColor || '#a9b78f');
    updateSelection();
    updateSun();
    needsRender = true;
  }

  function updateSun() {
    const b = projectBounds(app.project) || { minX: 0, minY: 0, maxX: 1000, maxY: 800, w: 1000, h: 800 };
    const cx = ((b.minX + b.maxX) / 2) * M, cz = ((b.minY + b.maxY) / 2) * M;
    const r = (Math.max(b.w, b.h) * M) / 2 + 4;
    sun.position.set(cx - r * 0.9, r * 1.6 + 8, cz + r * 1.3);
    sun.target.position.set(cx, 0, cz);
    const cam = sun.shadow.camera;
    cam.left = -r * 1.3; cam.right = r * 1.3; cam.top = r * 1.3; cam.bottom = -r * 1.3;
    cam.near = 0.5; cam.far = r * 6 + 30;
    cam.updateProjectionMatrix();
  }

  function updateSelection() {
    const sel = app.selection.length === 1 ? app.selection[0] : null;
    selBox.visible = false;
    if (!sel || (sel.kind !== 'item' && sel.kind !== 'opening')) return;
    const e = levelEntries.get(app.level.id);
    if (!e) return;
    let obj = null;
    if (sel.kind === 'item') obj = e.items.get(sel.id)?.obj;
    else e.struct?.traverse((o) => { if (!obj && o.isGroup && o.userData.pick && o.userData.pick.id === sel.id) obj = o; });
    if (!obj) return;
    selBox.box.setFromObject(obj);
    selBox.visible = !selBox.box.isEmpty();
  }

  // ------------------------------------------------------------------ camera
  function visibleBounds() {
    const lv = app.level;
    if (lv.walls.length) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const w of lv.walls) for (const p of [w.a, w.b]) {
        minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
      }
      return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
    }
    const b = levelBounds(lv) || projectBounds(app.project);
    return b || { minX: 0, minY: 0, maxX: 1000, maxY: 800, w: 1000, h: 800 };
  }

  function resetView(top = false) {
    const b = visibleBounds();
    const cx = ((b.minX + b.maxX) / 2) * M, cz = ((b.minY + b.maxY) / 2) * M;
    const y = app.level.elevation * M;
    const span = Math.max(b.w, b.h) * M;
    const dist0 = Math.max(6, span * 1.35) / Math.min(1, Math.max(0.55, camera.aspect));
    controls.target.set(cx, y + 0.6, cz);
    if (top) camera.position.set(cx, y + dist0 * 1.15, cz + 0.001);
    else camera.position.set(cx + dist0 * 0.55, y + dist0 * 0.78, cz + dist0 * 0.82);
    camera.near = 0.05;
    camera.updateProjectionMatrix();
    controls.update();
    needsRender = true;
  }

  // ------------------------------------------------------------------ walk mode
  let walk = null;
  const keys = new Set();
  let saved = null;

  function collisionSegments() {
    const lv = app.level;
    const d = getDerived(lv);
    const segs = [];
    for (const info of d.walls.values()) {
      const ops = lv.openings
        .filter((o) => o.wallId === info.id && OPENINGS[o.type])
        .map((o) => ({ o, fr: openingFrame(lv, o), def: OPENINGS[o.type] }))
        .filter((x) => x.fr && (x.o.sill || 0) < 40 && x.def.kind !== 'window' && x.def.kind !== 'fixed')
        .sort((a, b) => a.fr.u0 - b.fr.u0);
      let prev = 0;
      for (const { fr } of ops) {
        if (fr.u0 > prev + 1) segs.push({ a: add(info.a, mul(info.d, prev)), b: add(info.a, mul(info.d, fr.u0)), h: info.h });
        prev = fr.u1;
      }
      if (info.len > prev + 1) segs.push({ a: add(info.a, mul(info.d, prev)), b: info.b, h: info.h });
    }
    return segs;
  }

  function enterWalk() {
    if (walk) return;
    const lv = app.level;
    const d = getDerived(lv);
    let start = null;
    if (d.faces.length) {
      const f = [...d.faces].sort((a, b) => b.netArea - a.netArea)[0];
      start = f.label;
    } else {
      start = { x: controls.target.x / M, y: controls.target.z / M };
    }
    saved = { pos: camera.position.clone(), target: controls.target.clone(), fov: camera.fov };
    walk = { pos: { x: start.x, y: start.y }, yaw: -Math.PI / 2, pitch: -0.05, segs: collisionSegments(), last: performance.now() };
    controls.enabled = false;
    camera.fov = 68;
    camera.near = 0.05;
    camera.updateProjectionMatrix();
    structureDirtyAll();
    sync();
    app.emit('walk', true);
  }

  function exitWalk() {
    if (!walk) return;
    walk = null;
    keys.clear();
    controls.enabled = true;
    if (saved) {
      camera.position.copy(saved.pos);
      controls.target.copy(saved.target);
      camera.fov = saved.fov;
      camera.updateProjectionMatrix();
    }
    structureDirtyAll();
    sync();
    controls.update();
    app.emit('walk', false);
  }

  function structureDirtyAll() {
    for (const e of levelEntries.values()) e.structKey = null;
  }

  function stepWalk(dt) {
    const w = walk;
    let fx = 0, fz = 0;
    if (keys.has('w') || keys.has('arrowup')) fz += 1;
    if (keys.has('s') || keys.has('arrowdown')) fz -= 1;
    if (keys.has('a') || keys.has('arrowleft')) fx -= 1;
    if (keys.has('d') || keys.has('arrowright')) fx += 1;
    if (fx || fz) {
      const speed = (keys.has('shift') ? 300 : 140) * dt;
      const fwd = { x: Math.cos(w.yaw), y: Math.sin(w.yaw) };
      const right = { x: -fwd.y, y: fwd.x };
      const l = Math.hypot(fx, fz);
      let np = add(w.pos, mul(add(mul(fwd, fz / l), mul(right, fx / l)), speed));
      const R = 22;
      for (let iter = 0; iter < 3; iter++) {
        for (const s of w.segs) {
          const c = closestOnSegment(np, s.a, s.b);
          const minD = s.h + R;
          if (c.d < minD) {
            const dir = c.d > 0.01 ? norm(sub(np, c)) : perp(norm(sub(s.b, s.a)));
            np = add(c, mul(dir, minD));
          }
        }
      }
      w.pos = np;
      needsRender = true;
    }
    const lv = app.level;
    const eye = (lv.elevation + 160) * M;
    camera.position.set(w.pos.x * M, eye, w.pos.y * M);
    const look = new THREE.Vector3(Math.cos(w.yaw) * Math.cos(w.pitch), Math.sin(w.pitch), Math.sin(w.yaw) * Math.cos(w.pitch));
    camera.lookAt(camera.position.clone().add(look));
  }

  // ------------------------------------------------------------------ picking & dragging
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let down = null;

  function pick(cx, cy) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects([root], true);
    for (const h of hits) {
      if (h.object.userData.pick) return { ...h.object.userData.pick, point: h.point };
    }
    const g = raycaster.intersectObject(ground);
    return g.length ? { kind: 'ground', point: g[0].point } : null;
  }

  function planePoint(cx, cy, y) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -y);
    const p = new THREE.Vector3();
    return raycaster.ray.intersectPlane(plane, p) ? p : null;
  }

  const canvas = renderer.domElement;
  canvas.addEventListener('pointerdown', (e) => {
    down = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false, button: e.button };
    if (walk) {
      canvas.setPointerCapture(e.pointerId);
      down.yaw = walk.yaw;
      down.pitch = walk.pitch;
      return;
    }
    if (e.button !== 0) return;
    const hit = pick(e.clientX, e.clientY);
    if (hit && hit.kind === 'item' && app.selection.some((s) => s.kind === 'item' && s.id === hit.id)) {
      const it = app.level.items.find((i) => i.id === hit.id);
      const p = it && planePoint(e.clientX, e.clientY, app.level.elevation * M);
      if (it && p) {
        controls.enabled = false;
        canvas.setPointerCapture(e.pointerId);
        down.drag = { id: it.id, off: { x: it.x - p.x / M, y: it.y - p.z / M }, key: 'drag:' + uid() };
      }
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!down || e.pointerId !== down.id) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (!down.moved && Math.hypot(dx, dy) > 4) down.moved = true;
    if (walk && down.moved) {
      walk.yaw = down.yaw + dx * 0.005;
      walk.pitch = clamp(down.pitch - dy * 0.004, -1.2, 1.2);
      needsRender = true;
      return;
    }
    if (down.drag && down.moved) {
      const p = planePoint(e.clientX, e.clientY, app.level.elevation * M);
      if (!p) return;
      const it = app.level.items.find((i) => i.id === down.drag.id);
      if (!it) return;
      app.mutate(() => {
        it.x = r2(p.x / M + down.drag.off.x);
        it.y = r2(p.z / M + down.drag.off.y);
        if (!e.altKey) app.snapItem?.(it);
      }, down.drag.key);
    }
  });
  const endPointer = (e) => {
    if (!down || e.pointerId !== down.id) return;
    const d0 = down;
    down = null;
    if (d0.drag) controls.enabled = !walk;
    if (!d0.moved && !walk && d0.button === 0) {
      const hit = pick(e.clientX, e.clientY);
      if (hit && ['item', 'wall', 'opening', 'room'].includes(hit.kind)) app.select([{ kind: hit.kind, id: hit.id }]);
      else app.select([]);
    }
  };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('dblclick', (e) => {
    if (walk) return;
    const hit = pick(e.clientX, e.clientY);
    if (hit && hit.point) {
      controls.target.copy(hit.point);
      controls.update();
      needsRender = true;
    }
  });
  controls.addEventListener('change', () => { needsRender = true; });

  function onKey(e) {
    if (!walk) return false;
    const k = e.key.toLowerCase();
    if (k === 'escape') { exitWalk(); return true; }
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) {
      keys.add(k);
      return true;
    }
    return false;
  }
  function onKeyUp(e) {
    keys.delete(e.key.toLowerCase());
  }

  // ------------------------------------------------------------------ loop
  let needsRender = true;
  let visible = false;
  let running = false;
  let lastT = performance.now();

  function frame(t) {
    if (!visible) { running = false; return; }
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;
    if (walk) stepWalk(dt);
    else if (controls.update()) needsRender = true;
    if (needsRender) {
      needsRender = false;
      renderer.render(scene, camera);
    }
  }

  function setVisible(v) {
    visible = v;
    if (v) {
      resize();
      sync();
      if (!running) {
        running = true;
        lastT = performance.now();
        requestAnimationFrame(frame);
      }
    }
  }

  function resize() {
    const r = host.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    needsRender = true;
  }
  new ResizeObserver(() => { if (visible) resize(); }).observe(host);

  function applyTheme() {
    const cs = getComputedStyle(document.documentElement);
    const top = cs.getPropertyValue('--sky-top').trim() || '#c9d9e3';
    const bottom = cs.getPropertyValue('--sky-bottom').trim() || '#eef2f2';
    const c = document.createElement('canvas');
    c.width = 4; c.height = 256;
    const ctx = c.getContext('2d');
    const gr = ctx.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, top);
    gr.addColorStop(0.62, bottom);
    gr.addColorStop(1, bottom);
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    if (scene.background && scene.background.dispose) scene.background.dispose();
    scene.background = t;
    scene.fog = new THREE.Fog(new THREE.Color(bottom), 70, 190);
    needsRender = true;
  }
  applyTheme();

  // ------------------------------------------------------------------ placement by drop
  function placeAt(kind, type, cx, cy) {
    const lv = app.level;
    const p = planePoint(cx, cy, lv.elevation * M);
    if (!p) return false;
    const w = { x: p.x / M, y: p.z / M };
    if (kind === 'item') {
      const def = ITEMS[type];
      const it = { ...defaultItem(type), id: uid('it_'), x: r2(w.x), y: r2(w.y) };
      if (def.mount === 'ceiling') it.elev = Math.max(0, lv.height - it.h);
      if (def.custom) it.elev = lv.height;
      app.snapItem?.(it);
      app.mutate(() => lv.items.push(it));
      app.select([{ kind: 'item', id: it.id }]);
      return true;
    }
    return app.placeOpeningNear(type, w);
  }

  // ------------------------------------------------------------------ thumbnails
  let thumbR = null, thumbScene = null, thumbCam = null;
  const thumbQueue = [];
  let thumbBusy = false;
  function initThumbs() {
    if (thumbR) return;
    thumbR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    thumbR.setPixelRatio(1);
    thumbR.setSize(160, 160, false);
    thumbR.toneMapping = THREE.ACESFilmicToneMapping;
    thumbR.toneMappingExposure = 1.1;
    thumbScene = new THREE.Scene();
    thumbScene.environment = new THREE.PMREMGenerator(thumbR).fromScene(new RoomEnvironment(thumbR), 0.04).texture;
    thumbScene.add(new THREE.HemisphereLight(0xffffff, 0x8a8a8a, 0.8));
    const dl = new THREE.DirectionalLight(0xffffff, 1.6);
    dl.position.set(3, 6, 4);
    thumbScene.add(dl);
    thumbCam = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
  }
  function renderThumb(kind, type) {
    initThumbs();
    let obj;
    if (kind === 'item') {
      const it = { ...defaultItem(type), id: 'thumb', x: 0, y: 0, elev: 0 };
      obj = buildItem(it);
      obj.position.set(0, 0, 0);
    } else {
      const def = OPENINGS[type];
      obj = buildOpeningModel({ type, width: def.w, height: def.h, sill: 0, color: def.color, flip: false, swing: false }, 12, 0, false);
      const wallM = stdMat({ color: '#d7d3cc', rough: 0.9 });
      const W = def.w * M, H = def.h * M;
      addBox(obj, 0.25, H + 0.25, 0.12, -W / 2 - 0.125, (H + 0.25) / 2, 0, wallM);
      addBox(obj, 0.25, H + 0.25, 0.12, W / 2 + 0.125, (H + 0.25) / 2, 0, wallM);
      addBox(obj, W, 0.25, 0.12, 0, H + 0.125, 0, wallM);
    }
    const box = new THREE.Box3().setFromObject(obj);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const c = sphere.center;
    const r = Math.max(sphere.radius, 0.05);
    const az = kind === 'item' ? rad(35) : rad(20), el = kind === 'item' ? rad(28) : rad(8);
    const dd = r / Math.sin(rad(15)) * 1.02;
    thumbCam.position.set(c.x + dd * Math.sin(az) * Math.cos(el), c.y + dd * Math.sin(el), c.z + dd * Math.cos(az) * Math.cos(el));
    thumbCam.near = dd / 50;
    thumbCam.far = dd * 4;
    thumbCam.updateProjectionMatrix();
    thumbCam.lookAt(c);
    thumbScene.add(obj);
    thumbR.render(thumbScene, thumbCam);
    thumbScene.remove(obj);
    return thumbR.domElement.toDataURL('image/png');
  }
  function queueThumb(kind, type, cb) {
    thumbQueue.push({ kind, type, cb });
    if (!thumbBusy) {
      thumbBusy = true;
      const step = () => {
        const t0 = performance.now();
        while (thumbQueue.length && performance.now() - t0 < 24) {
          const j = thumbQueue.shift();
          try { j.cb(renderThumb(j.kind, j.type)); } catch (e) { j.cb(null); }
        }
        if (thumbQueue.length) requestAnimationFrame(step);
        else thumbBusy = false;
      };
      requestAnimationFrame(step);
    }
  }

  async function exportPngBlob() {
    const old = renderer.getPixelRatio();
    renderer.setPixelRatio(Math.max(2, old));
    const r = host.getBoundingClientRect();
    renderer.setSize(Math.round(r.width), Math.round(r.height), false);
    renderer.render(scene, camera);
    const blob = await new Promise((res) => renderer.domElement.toBlob(res, 'image/png'));
    renderer.setPixelRatio(old);
    renderer.setSize(Math.round(r.width), Math.round(r.height), false);
    needsRender = true;
    return blob;
  }

  return {
    el: canvas,
    sync() { if (visible) sync(); else structureDirty = true; },
    setVisible,
    resize,
    resetView,
    topView: () => resetView(true),
    enterWalk,
    exitWalk,
    get walking() { return !!walk; },
    setShowAll(v) { showAll = v; sync(); },
    get showAll() { return showAll; },
    onKey,
    onKeyUp,
    walkKey(k, on) { if (on) keys.add(k); else keys.delete(k); },
    queueThumb,
    placeAt,
    exportPngBlob,
    applyTheme,
    refreshSelection() { updateSelection(); needsRender = true; },
    targetPlan() { return { x: controls.target.x / M, y: controls.target.z / M }; },
  };
}
