// Grundriss Studio – the example house shown on first start
import { uid, dot, sub, pointInPolygon } from './util.js';
import { createProject, addWallSegment, normalizeWalls, getDerived, nearestWall } from './model.js';
import { OPENINGS, defaultItem } from './catalog.js';

export function createSampleProject() {
  const p = createProject('Beispielhaus (Vorlage)');
  const lv = p.levels[0];
  lv.height = 250;
  const W = (ax, ay, bx, by, t) => addWallSegment(lv, { x: ax, y: ay }, { x: bx, y: by }, { thickness: t });
  // exterior 11 × 8 m, interior walls 12 cm
  W(0, 0, 1100, 0, 30); W(1100, 0, 1100, 800, 30); W(1100, 800, 0, 800, 30); W(0, 800, 0, 0, 30);
  W(0, 450, 1100, 450, 12);
  W(650, 0, 650, 800, 12);
  W(400, 450, 400, 800, 12);
  W(800, 450, 800, 800, 12);
  normalizeWalls(lv);

  const op = (type, x, y, opts = {}) => {
    const nw = nearestWall(lv, { x, y }, 30);
    if (!nw) return;
    const def = OPENINGS[type];
    const o = {
      id: uid('op_'), wallId: nw.info.id, type, offset: nw.u, width: opts.w ?? def.w, height: opts.h ?? def.h,
      sill: opts.sill ?? def.sill, flip: !!opts.flip, swing: false, color: opts.color ?? def.color,
    };
    if (opts.towards) o.swing = dot(sub(opts.towards, nw.info.a), nw.info.n) < 0;
    lv.openings.push(o);
  };
  // doors
  op('entrance', 725, 800, { towards: { x: 725, y: 700 }, flip: true });
  op('door', 725, 450, { w: 80, towards: { x: 725, y: 300 } });
  op('door', 650, 560, { w: 80, towards: { x: 500, y: 560 } });
  op('door', 800, 560, { w: 80, towards: { x: 950, y: 560 }, flip: true });
  op('door', 330, 450, { w: 80, towards: { x: 330, y: 600 } });
  op('passage', 650, 300, { w: 140 });
  // windows
  op('slidingDoor', 470, 0, { w: 240 });
  op('window2', 0, 225);
  op('window2', 875, 0);
  op('window', 1100, 300);
  op('window2', 0, 625);
  op('smallWindow', 525, 800, { w: 70, h: 70, sill: 140 });
  op('window2', 950, 800);
  op('window', 1100, 640);

  const it = (type, x, y, rot = 0, extra = {}) => {
    const item = { ...defaultItem(type), id: uid('it_'), x, y, rot, ...extra };
    lv.items.push(item);
    return item;
  };
  // living & dining
  it('tvStand', 165, 36);
  it('tv', 165, 34, 0, { elev: 48 });
  it('rug', 165, 250, 0, { w: 240, d: 170 });
  it('sofaL', 150, 354, 180);
  it('coffeeTable', 175, 245);
  it('floorLamp', 318, 412);
  it('plant', 46, 46);
  it('diningTable', 500, 250, 90);
  for (const y of [195, 250, 305]) {
    it('chair', 434, y, 270);
    it('chair', 566, y, 90);
  }
  it('sideboard', 621, 110, 90);
  it('pendant', 500, 250, 0, { elev: 160 });
  // kitchen
  it('kitchenRow', 950, 46, 0, { w: 260 });
  it('fridge', 789, 48);
  it('wallCabinet', 990, 32.5, 0, { elev: 145 });
  it('wallCabinet', 1050, 32.5, 0, { elev: 145 });
  it('island', 900, 255);
  it('barStool', 855, 330);
  it('barStool', 945, 330);
  // bedroom
  it('doubleBed', 205, 680, 180);
  it('nightstand', 90, 765, 180);
  it('nightstand', 320, 765, 180);
  it('wardrobe', 120, 486, 0);
  it('ceilingLamp', 205, 600, 0, { elev: 238 });
  // bathroom
  it('bathtub', 494, 747.5, 180);
  it('toilet', 439, 610, 270);
  it('washbasin', 525, 480);
  it('mirror', 525, 457.5, 0, { elev: 110 });
  it('ceilingLamp', 525, 620, 0, { elev: 238, w: 35, d: 35 });
  // hall
  it('rug', 725, 610, 0, { w: 80, d: 200, color: '#6f8a6a' });
  it('ceilingLamp', 725, 560, 0, { elev: 238, w: 35, d: 35 });
  // kids room
  it('singleBed', 1035, 561, 0, { w: 100, color2: '#d3a14a' });
  it('desk', 900, 755, 180, { w: 120, d: 60 });
  it('officeChair', 900, 690, 0, { color: '#4c6b84' });
  it('wardrobe', 836, 705, 270, { w: 120 });
  it('rugRound', 945, 600, 0, { w: 130, d: 130, color: '#c48b9f' });
  it('ceilingLamp', 945, 620, 0, { elev: 238 });
  // garden
  it('slab', 330, -175, 0, { w: 520, d: 320, h: 5, color: '#b9b2a5' });
  it('gardenTable', 440, -175, 0);
  it('chair', 400, -232, 0, { elev: 5 });
  it('chair', 480, -232, 0, { elev: 5 });
  it('chair', 400, -118, 180, { elev: 5 });
  it('chair', 480, -118, 180, { elev: 5 });
  it('lounger', 190, -175, 90, { elev: 5 });
  it('parasol', 300, -175, 0, { elev: 5, w: 260, d: 260 });
  it('tree', -260, -140, 0);
  it('tree', 1330, 140, 0, { w: 260, d: 260, h: 520 });
  it('conifer', -200, 900, 0);
  it('bush', 1180, 860, 0);
  it('bush', -110, 380, 0, { w: 100, d: 100, h: 90 });
  it('hedge', 650, -360, 0, { w: 900, d: 50, h: 130 });
  it('car', 960, 1090, 0);
  for (const e of lv.items) if (e.type === 'gardenTable') e.elev = 5;

  // rooms
  const d = getDerived(lv);
  const room = (x, y, props) => {
    const f = d.faces.find((f) => pointInPolygon({ x, y }, f.poly));
    const r = f && lv.rooms.find((r) => r.id === f.roomId);
    if (r) Object.assign(r, props);
  };
  room(300, 200, { name: 'Wohnen & Essen', floor: 'oak', wallColor: '#f4f2ee' });
  room(870, 200, { name: 'Küche', floor: 'tiles-grey', wallColor: '#dfe6d6' });
  room(200, 620, { name: 'Schlafzimmer', floor: 'lightwood', wallColor: '#dbe5ea' });
  room(525, 620, { name: 'Bad', floor: 'tiles-white', wallColor: '#eef1f2', wallTex: 'wallTiles' });
  room(725, 620, { name: 'Flur', floor: 'stone', wallColor: '#f4f2ee' });
  room(945, 620, { name: 'Kinderzimmer', floor: 'basket', wallColor: '#efe1a8' });
  p.settings.wallThickness = 12;
  return p;
}
