import * as THREE from 'three';
import { box, cyl, sphere, rnd, pick, V3, taperedTube, clamp } from './util.js';
import * as T from './textures.js';
import { placeKeeper } from './npcs.js';

const std = (o) => new THREE.MeshStandardMaterial(o);
const C = (c) => new THREE.Color(c);

let _styles = null;
export function styles(M) {
  if (_styles) return _styles;
  _styles = {
    olli: { wall: M.woodDark, floor: M.floor, ceil: M.woodDark },
    books: { wall: M.plaster('#7a6a50'), floor: M.floor, ceil: M.woodDark },
    apo: { wall: M.plaster('#5e6a52'), floor: M.flags, ceil: M.woodDark },
    owls: { wall: M.wood, floor: M.floor, ceil: M.woodDark },
  };
  return _styles;
}

// ------------------------------------------------------------ 通用：书架单元
// 单元本地坐标：x∈[-len/2,len/2]，背板在 z=0，正面朝 +z，深度 dep
function caseUnit(mat, len, h, dep, rows) {
  const u = new THREE.Group();
  u.add(box(len, h, 0.04, mat, 0, h / 2, 0.02, 2));
  for (const s of [-1, 1]) u.add(box(0.06, h, dep, mat, s * (len / 2 - 0.03), h / 2, dep / 2, 2));
  const ys = [];
  const gap = (h - 0.2) / rows;
  for (let i = 0; i <= rows; i++) {
    const y = 0.08 + i * gap;
    u.add(box(len, 0.035, dep, mat, 0, y, dep / 2, 2));
    if (i < rows) ys.push(y + 0.018);
  }
  u.add(box(len + 0.1, 0.1, dep + 0.06, mat, 0, h - 0.05, dep / 2 + 0.01, 2));
  return { u, ys, gap };
}

function place(lot, obj, x, z, rot) {
  obj.position.set(x, 0, z);
  obj.rotation.y = rot;
  lot.g.add(obj);
}

function unitCollider(lot, x, z, rot, len, dep) {
  const r = ((rot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const near = (a) => Math.abs(r - a) < 0.01;
  if (near(0)) lot.collider(x - len / 2, x + len / 2, z, z + dep);
  else if (near(Math.PI)) lot.collider(x - len / 2, x + len / 2, z - dep, z);
  else if (near(Math.PI / 2)) lot.collider(x, x + dep, z - len / 2, z + len / 2);
  else lot.collider(x - dep, x, z - len / 2, z + len / 2);
}

const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new V3(), _s = new V3();
function instanced(parent, geo, mat, items, cast = false) {
  if (!items.length) return null;
  const im = new THREE.InstancedMesh(geo, mat, items.length);
  items.forEach((it, i) => {
    _e.set(...(it.r || [0, 0, 0]));
    _q.setFromEuler(_e);
    _m4.compose(_p.set(...it.p), _q, _s.set(...it.s));
    im.setMatrixAt(i, _m4);
    if (it.c) im.setColorAt(i, it.c);
  });
  im.castShadow = cast;
  im.receiveShadow = true;
  parent.add(im);
  return im;
}

const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
const UNIT_CYL = new THREE.CylinderGeometry(1, 1, 1, 10);

function bookItems(len, ys, gap) {
  const pal = ['#6b1f1f', '#1f3b2a', '#2a2f55', '#5a3a1a', '#3d1f3d', '#7a5a20', '#222222', '#8a6a4a', '#40202a', '#1d4a4a', '#5a1010', '#2a4a1a'];
  const items = [];
  for (const y of ys) {
    let x = -len / 2 + 0.07;
    while (x < len / 2 - 0.1) {
      if (Math.random() < 0.03) { x += rnd(0.1, 0.3); continue; }
      const bw = rnd(0.03, 0.075), bh = Math.min(gap - 0.05, rnd(0.2, 0.34)), bd = rnd(0.15, 0.22);
      const lean = Math.random() < 0.04 ? rnd(0.15, 0.35) : 0;
      items.push({ p: [x + bw / 2, y + bh / 2, 0.04 + bd / 2], s: [bw, bh, bd], r: [0, 0, -lean], c: C(pick(pal)).offsetHSL(0, 0, rnd(-0.04, 0.08)) });
      x += bw + 0.003 + (lean ? 0.08 : 0);
    }
  }
  return items;
}

function wandBoxItems(len, ys, gap) {
  const pal = ['#3a2416', '#1a1410', '#4a1a1a', '#2a3040', '#6a5a40', '#2a1a10', '#50402a', '#1e2a22'];
  const items = [];
  const maxStack = Math.floor((gap - 0.03) / 0.076);
  for (const y of ys) {
    let x = -len / 2 + 0.08;
    while (x < len / 2 - 0.1) {
      const n = Math.random() < 0.06 ? 0 : 1 + Math.floor(Math.random() * maxStack);
      for (let k = 0; k < n; k++) {
        const out = Math.random() < 0.1 ? rnd(0.04, 0.16) : rnd(0, 0.02);
        items.push({ p: [x + 0.04 + rnd(-0.006, 0.006), y + 0.037 + k * 0.076, 0.04 + 0.17 + out], s: [0.075, 0.07, 0.34], r: [0, rnd(-0.04, 0.04), 0], c: C(pick(pal)).offsetHSL(0, 0, rnd(-0.03, 0.05)) });
      }
      x += 0.084;
    }
  }
  return items;
}

function jarItems(len, ys, gap, dep) {
  const pal = ['#5a8a3a', '#7a3a8a', '#3a6a8a', '#8a5a2a', '#a8a070', '#3a8a7a', '#8a2a3a', '#c8b890'];
  const glowPal = [new THREE.Color(0.4, 2.0, 0.6), new THREE.Color(1.6, 0.5, 2.0), new THREE.Color(0.4, 1.2, 2.2), new THREE.Color(2.2, 1.0, 0.3)];
  const jars = [], lids = [], glow = [];
  for (const y of ys) {
    let x = -len / 2 + 0.1;
    while (x < len / 2 - 0.2) {
      const r = rnd(0.045, 0.09), h = rnd(0.12, Math.min(gap - 0.1, 0.32));
      const z = dep / 2 + rnd(-0.06, 0.06);
      if (Math.random() < 0.12) glow.push({ p: [x + r, y + h * 0.4, z], s: [r * 0.85, h * 0.75, r * 0.85], c: pick(glowPal) });
      jars.push({ p: [x + r, y + h / 2, z], s: [r, h, r], c: C(pick(pal)) });
      lids.push({ p: [x + r, y + h + 0.015, z], s: [r * 0.7, 0.03, r * 0.7] });
      x += 2 * r + rnd(0.015, 0.06);
    }
  }
  return { jars, lids, glow };
}

function addCase(lot, M, o) {
  const { u, ys, gap } = caseUnit(o.mat || M.woodDark, o.len, o.h, o.dep, o.rows);
  if (o.fill === 'books') instanced(u, UNIT_BOX, std({ roughness: 0.8 }), bookItems(o.len, ys, gap));
  if (o.fill === 'wands') instanced(u, UNIT_BOX, std({ roughness: 0.7 }), wandBoxItems(o.len, ys, gap));
  if (o.fill === 'jars') {
    const { jars, lids, glow } = jarItems(o.len, ys, gap, o.dep);
    instanced(u, UNIT_CYL, std({ roughness: 0.12, transparent: true, opacity: 0.72 }), jars);
    instanced(u, UNIT_CYL, std({ color: '#6a4a2a', roughness: 0.9 }), lids);
    instanced(u, UNIT_CYL, new THREE.MeshBasicMaterial({ color: '#ffffff' }), glow);
  }
  place(lot, u, o.x, o.z, o.rot);
  unitCollider(lot, o.x, o.z, o.rot, o.len, o.dep);
  return u;
}

/** 三面墙的书架（后墙 + 两侧墙），sideEnd 为侧墙书架离前墙的距离 */
function wallCases(lot, M, info, fill, rows, dep, sideEnd = 1.2) {
  const { X0, X1, Z0, Z1, H } = info;
  addCase(lot, M, { x: X0, z: 0, rot: Math.PI / 2, len: Z1 - Z0 - 0.05, h: H, dep, rows, fill });
  const a = X0 + dep + 0.05, b = X1 - sideEnd, len = b - a;
  addCase(lot, M, { x: (a + b) / 2, z: Z0, rot: 0, len, h: H, dep, rows, fill });
  addCase(lot, M, { x: (a + b) / 2, z: Z1, rot: Math.PI, len, h: H, dep, rows, fill });
}

function pointLight(lot, color, intensity, x, y, z, dist = 16) {
  // 注册到全局灯光池（main.js 每帧把最近的光源分配给少量真实 PointLight）
  const s = { p: lot.toWorld(x, z, y), color: new THREE.Color(color), intensity: intensity * 2.6, distance: dist * 1.25, always: false };
  lot.W.lightSources.push(s);
  return s;
}

function counter(lot, M, x, z, lenX, lenZ, h = 1.0) {
  lot.g.add(box(lenX, h, lenZ, M.woodDark, x, h / 2, z, 2));
  lot.g.add(box(lenX + 0.1, 0.06, lenZ + 0.1, M.wood, x, h + 0.03, z, 2));
  lot.collider(x - lenX / 2 - 0.05, x + lenX / 2 + 0.05, z - lenZ / 2 - 0.05, z + lenZ / 2 + 0.05);
}

let dustTex = null;
function dust(W, lot, info, color = '#ffd9a0', n = 220) {
  const { X0, X1, Z0, Z1, H } = info;
  const pos = new Float32Array(n * 3), base = [];
  for (let i = 0; i < n; i++) {
    base.push([rnd(X0, X1), rnd(0.3, H - 0.2), rnd(Z0, Z1), Math.random() * 6]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ color, map: dustTex || (dustTex = T.glowTex()), size: 0.03, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
  p.frustumCulled = false;
  p.userData.dyn = true;
  lot.g.add(p);
  W.updaters.push((dt, t) => {
    for (let i = 0; i < n; i++) {
      const b = base[i];
      pos[i * 3] = b[0] + Math.sin(t * 0.13 + b[3]) * 0.4;
      pos[i * 3 + 1] = b[1] + Math.sin(t * 0.21 + b[3] * 2) * 0.25;
      pos[i * 3 + 2] = b[2] + Math.cos(t * 0.11 + b[3]) * 0.4;
    }
    g.attributes.position.needsUpdate = true;
  });
}

function ladder(lot, M, x, z, h, rotY = 0) {
  const l = new THREE.Group();
  for (const s of [-1, 1]) l.add(box(0.05, h, 0.05, M.wood, 0, h / 2, s * 0.22));
  for (let y = 0.3; y < h; y += 0.3) l.add(box(0.04, 0.04, 0.44, M.wood, 0, y, 0));
  l.position.set(x, 0, z);
  l.rotation.set(0, rotY, 0.17);
  lot.g.add(l);
}

// ============================================================ 奥利凡德魔杖店
export function ollivanders(W, M, lot, info) {
  const { X0, X1, Z0, Z1, H } = info;
  const g = lot.g;
  wallCases(lot, M, info, 'wands', 10, 0.45);
  // 中间一排背靠背的高架
  for (const rot of [0, Math.PI]) addCase(lot, M, { x: -8.4, z: -1.5, rot, len: 4.2, h: 3.4, dep: 0.42, rows: 9, fill: 'wands' });
  ladder(lot, M, X0 + 0.85, 3.2, 3.7);
  // 柜台
  counter(lot, M, -4.2, -2.6, 0.9, 4.4);
  // 柜台上的黄铜台灯
  const lx = -4.2, lz = -4.3, ty = 1.06;
  g.add(cyl(0.12, 0.14, 0.04, M.brass, lx, ty + 0.02, lz));
  g.add(cyl(0.015, 0.015, 0.45, M.brass, lx, ty + 0.25, lz, 6));
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.18, 16, 1, true), std({ color: '#2a4a2a', roughness: 0.5, side: THREE.DoubleSide }));
  shade.position.set(lx, ty + 0.5, lz);
  g.add(shade);
  g.add(sphere(0.05, M.lampGlow, lx, ty + 0.46, lz));
  pointLight(lot, '#ffb36b', 12, lx, ty + 0.4, lz, 12);
  pointLight(lot, '#ffcf95', 20, -7.5, H - 0.6, 2.5, 16);
  pointLight(lot, '#ffc488', 14, -9.5, H - 0.6, -4.0, 12);
  pointLight(lot, '#ffd8a8', 6, -3.4, 2.6, -2.4, 6);
  // 柜台上的魔杖盒
  for (let i = 0; i < 6; i++) {
    const b = box(0.34, 0.07, 0.08, M.paint(pick(['#3a2416', '#1a1410', '#4a1a1a'])), lx + rnd(-0.2, 0.2), ty + 0.035 + Math.floor(i / 2) * 0.072, -2.6 + (i % 2) * 0.1);
    b.rotation.y = rnd(-0.3, 0.3);
    g.add(b);
  }
  // 打开的盒子 + 一根魔杖
  g.add(box(0.36, 0.05, 0.1, M.paint('#2a1a10'), lx, ty + 0.025, -1.5));
  g.add(box(0.33, 0.012, 0.08, M.paint('#4a1a4a'), lx, ty + 0.055, -1.5));
  const wand = cyl(0.006, 0.011, 0.32, M.paint('#5a3a1e'), lx, ty + 0.07, -1.5, 6);
  wand.rotation.z = Math.PI / 2;
  g.add(wand);
  const lid = box(0.36, 0.012, 0.1, M.paint('#2a1a10'), lx, ty + 0.1, -1.38);
  lid.rotation.x = -1.1;
  g.add(lid);
  // 小铃铛 & 量尺
  g.add(sphere(0.05, M.brass, lx, ty + 0.03, -0.7, 10, 6));
  // 椅子
  const ch = new THREE.Group();
  ch.add(box(0.45, 0.05, 0.45, M.woodDark, 0, 0.5, 0));
  for (const a of [-1, 1]) for (const b of [-1, 1]) ch.add(box(0.04, 0.5, 0.04, M.woodDark, a * 0.19, 0.25, b * 0.19));
  ch.add(box(0.04, 0.6, 0.45, M.woodDark, -0.2, 0.8, 0));
  ch.position.set(-2.2, 0, 2.2);
  ch.rotation.y = 0.6;
  g.add(ch);
  // 橱窗里的单根魔杖
  g.add(box(0.5, 0.8, 0.5, M.woodDark, -0.8, 0.4, -3.2));
  g.add(box(0.45, 0.06, 0.6, M.paint('#4a1a4a'), -0.8, 0.83, -3.2));
  const w2 = cyl(0.007, 0.012, 0.34, M.paint('#3a2414'), -0.8, 0.88, -3.2, 6);
  w2.rotation.x = Math.PI / 2;
  g.add(w2);
  lot.collider(-1.05, -0.55, -3.45, -2.95);
  dust(W, lot, info);

  const results = [
    ['冬青木，凤凰尾羽，11英寸，质地柔韧……奇怪，真是奇怪！', '#ffd36a', true],
    ['山毛榉木，龙心弦，9英寸——不行，不行！（一排盒子被震飞）', '#ff5a3a', false],
    ['葡萄藤木，龙心弦，10¾英寸——魔杖选择巫师，先生。', '#a0ff7a', true],
    ['紫杉木，凤凰尾羽，13½英寸，威力强大……也许过于强大。', '#ffb050', true],
    ['乌木，独角兽毛，8英寸——不，显然不是！', '#6a7aff', false],
    ['柳木，独角兽毛，10¼英寸，很适合施魔咒！', '#d0a0ff', true],
  ];
  const olli = placeKeeper(W, lot, 'ollivander', -5.1, -2.4, Math.PI / 2);
  W.olliTry = () => {
    const [text, col, ok] = pick(results);
    olli.gesture(1.8);
    W.say('奥利凡德先生：「' + text + '」');
    W.setWandColor(col);
    W.wandBurst(new THREE.Color(col).multiplyScalar(ok ? 2.5 : 1.5), ok ? 120 : 50);
    if (ok) W.sfx.chime(); else W.sfx.zap();
  };
  W.interactables.push({
    pos: lot.toWorld(-3.4, -2.6, 1.2), r: 2.4,
    label: () => '按 E 试一试魔杖',
    action: () => W.olliTry(),
  });
}

// ============================================================ 丽痕书店
export function flourish(W, M, lot, info) {
  const { X0, X1, Z0, Z1, H } = info;
  const g = lot.g;
  wallCases(lot, M, info, 'books', 9, 0.4);
  for (const rot of [0, Math.PI]) addCase(lot, M, { x: -8.6, z: -2.4, rot, len: 3.6, h: 2.5, dep: 0.38, rows: 6, fill: 'books' });
  ladder(lot, M, X0 + 0.8, -3.5, 3.6);
  // 桌子与书堆
  const table = (x, z, lx, lz) => {
    g.add(box(lx, 0.06, lz, M.wood, x, 0.8, z, 2));
    for (const a of [-1, 1]) for (const b of [-1, 1]) g.add(box(0.07, 0.8, 0.07, M.woodDark, x + a * (lx / 2 - 0.08), 0.4, z + b * (lz / 2 - 0.08)));
    lot.collider(x - lx / 2, x + lx / 2, z - lz / 2, z + lz / 2);
    const items = [];
    const pal = ['#6b1f1f', '#1f3b2a', '#2a2f55', '#5a3a1a', '#3d1f3d', '#7a5a20'];
    for (let s = 0; s < 6; s++) {
      const sx = x + rnd(-lx / 2 + 0.25, lx / 2 - 0.25), sz = z + rnd(-lz / 2 + 0.2, lz / 2 - 0.2);
      let y = 0.83;
      const n = 3 + Math.floor(Math.random() * 7);
      for (let k = 0; k < n; k++) {
        const th = rnd(0.035, 0.06);
        items.push({ p: [sx + rnd(-0.02, 0.02), y + th / 2, sz + rnd(-0.02, 0.02)], s: [rnd(0.22, 0.3), th, rnd(0.16, 0.22)], r: [0, rnd(-0.3, 0.3), 0], c: C(pick(pal)) });
        y += th;
      }
    }
    instanced(g, UNIT_BOX, std({ roughness: 0.8 }), items, true);
  };
  table(-5.2, 0.6, 1.8, 1.0);
  table(-7.6, 2.4, 1.2, 1.2);
  // 柜台 + 收银机
  counter(lot, M, -2.4, Z0 + 0.8, 2.2, 0.8);
  g.add(box(0.4, 0.3, 0.3, M.brass, -2.0, 1.21, Z0 + 0.8));
  // 吊灯
  const cx = -6, cy = H - 1.0, cz = 0.5;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.03, 6, 32), M.brass);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(cx, cy, cz);
  g.add(ring);
  g.add(cyl(0.015, 0.015, H - cy, M.iron, cx, (H + cy) / 2, cz, 4));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = cx + Math.cos(a) * 0.75, z = cz + Math.sin(a) * 0.75;
    g.add(cyl(0.025, 0.025, 0.16, std({ color: '#f0e6d0' }), x, cy + 0.1, z, 6));
    g.add(sphere(0.022, M.flame, x, cy + 0.21, z, 6, 4));
  }
  pointLight(lot, '#ffc98a', 16, cx, cy - 0.1, cz, 15);
  pointLight(lot, '#ffd7a0', 10, -2.5, H - 0.5, -1.5, 10);

  // 会飞的书
  const books = [];
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Group();
    b.userData.dyn = true;
    const col = M.paint(pick(['#7a1f1f', '#1f4b3a', '#2a2f65', '#6a4a1a', '#4d1f4d']));
    const page = std({ color: '#efe6cc', roughness: 0.9 });
    const covers = [];
    for (const s of [1, -1]) {
      const pv = new THREE.Group();
      const c = box(0.2, 0.012, 0.28, col, 0.1, 0, 0);
      const p = box(0.185, 0.02, 0.26, page, 0.095, 0.014, 0);
      pv.add(c, p);
      pv.scale.x = s;
      b.add(pv);
      covers.push(pv);
    }
    g.add(b);
    books.push({ b, covers, r: rnd(1.0, 2.2), sp: rnd(0.4, 0.8) * (Math.random() < 0.5 ? -1 : 1), ph: Math.random() * 6, y: rnd(2.2, 3.1), f: rnd(6, 10) });
  }
  W.updaters.push((dt, t) => {
    for (const k of books) {
      const a = t * k.sp + k.ph;
      k.b.position.set(cx + Math.cos(a) * k.r, k.y + Math.sin(t * 1.3 + k.ph) * 0.2, cz + Math.sin(a) * k.r);
      k.b.rotation.y = -a + (k.sp < 0 ? Math.PI : 0);
      k.b.rotation.z = Math.sin(t * 0.8 + k.ph) * 0.2;
      const flap = 0.25 + 0.6 * (0.5 + 0.5 * Math.sin(t * k.f + k.ph));
      k.covers[0].rotation.z = flap;
      k.covers[1].rotation.z = -flap;
    }
  });

  // 《妖怪们的妖怪书》关在笼子里
  const mx = -2.9, mz = Z0 + 0.8, my = 1.06;
  const cage = new THREE.Group();
  cage.position.set(mx, my, mz);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    cage.add(cyl(0.006, 0.006, 0.42, M.iron, Math.cos(a) * 0.26, 0.21, Math.sin(a) * 0.26, 4));
  }
  for (const y of [0.01, 0.42]) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.01, 4, 24), M.iron);
    r.rotation.x = Math.PI / 2;
    r.position.y = y;
    cage.add(r);
  }
  g.add(cage);
  const monster = new THREE.Group();
  monster.userData.dyn = true;
  monster.position.set(mx, my + 0.08, mz);
  const fur = std({ map: T.furTex(), roughness: 1 });
  monster.add(box(0.3, 0.13, 0.24, fur));
  const eyeM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 1.6, 0.2) });
  for (let i = 0; i < 4; i++) monster.add(sphere(0.018, eyeM, -0.06 + i * 0.04, 0.035, 0.122, 6, 4));
  for (let i = 0; i < 8; i++) {
    const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.04, 4), std({ color: '#f0e8d0' }));
    tooth.position.set(-0.12 + i * 0.034, -0.01, 0.122);
    tooth.rotation.x = Math.PI;
    monster.add(tooth);
  }
  g.add(monster);
  let calm = 0;
  W.updaters.push((dt, t) => {
    calm -= dt;
    const k = calm > 0 ? 0.05 : 1;
    const j = Math.sin(t * 23) * Math.sin(t * 3.1);
    monster.position.x = mx + j * 0.03 * k;
    monster.position.y = my + 0.08 + Math.abs(Math.sin(t * 17)) * 0.04 * k;
    monster.rotation.y = Math.sin(t * 9) * 0.4 * k;
    monster.rotation.z = Math.sin(t * 13) * 0.15 * k;
  });
  W.interactables.push({
    pos: lot.toWorld(mx + 0.4, mz + 0.8, 1.2), r: 2.0,
    label: () => (calm > 0 ? '它睡着了……' : '按 E 抚摸书脊'),
    action: () => { calm = 8; W.say('你轻轻抚摸书脊——《妖怪们的妖怪书》发出一声满足的呼噜，安静下来了……暂时。'); W.sfx.chime(); },
  });
  W.interactables.push({
    pos: lot.toWorld(-5.2, 0.6, 1.2), r: 1.8,
    label: () => '按 E 翻阅书籍',
    action: () => W.say(pick([
      '《标准咒语，初级》米兰达·戈沙克 著——一年级必备。',
      '《魔法史》巴希达·巴沙特 著。书页间夹着一根羽毛。',
      '《千种神奇药草及蕈类》——书页散发出淡淡的薄荷味。',
      '《与女鬼决裂》吉德罗·洛哈特 著——封面上的洛哈特冲你眨了眨眼。',
      '《神奇动物在哪里》纽特·斯卡曼德 著。',
    ])),
  });
  dust(W, lot, info, '#ffe8c0', 150);
  // 洛哈特在签名售书；店员守着柜台
  W.lockhart = placeKeeper(W, lot, 'lockhart', -6.5, 0.4, Math.PI / 2);
  placeKeeper(W, lot, 'bookclerk', -1.0, Z0 + 1.0, 0.3);
}

// ============================================================ 斯拉格与吉格斯药店
function cauldron(lot, M, x, z, liquid) {
  const g = lot.g;
  const pts = [[0, 0], [0.3, 0.02], [0.45, 0.12], [0.52, 0.32], [0.5, 0.5], [0.43, 0.6], [0.47, 0.64], [0.44, 0.66]].map(([a, b]) => new THREE.Vector2(a, b));
  const pot = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), std({ color: '#151515', metalness: 0.6, roughness: 0.5, side: THREE.DoubleSide }));
  pot.position.set(x, 0.18, z);
  pot.castShadow = true;
  g.add(pot);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    g.add(cyl(0.03, 0.03, 0.3, M.iron, x + Math.cos(a) * 0.3, 0.15, z + Math.sin(a) * 0.3, 5));
  }
  const surf = new THREE.Mesh(new THREE.CircleGeometry(0.44, 24), new THREE.MeshBasicMaterial({ color: liquid.clone().multiplyScalar(0.6) }));
  surf.rotation.x = -Math.PI / 2;
  surf.position.set(x, 0.18 + 0.62, z);
  g.add(surf);
  // 炭火
  g.add(sphere(0.12, std({ color: '#2a1008', emissive: '#ff3a00', emissiveIntensity: 1.5 }), x, 0.06, z, 8, 6));
  lot.circle(x, z, 0.6);
  return { x, z, y: 0.74, c: liquid };
}

export function apothecary(W, M, lot, info) {
  const { X0, X1, Z0, Z1, H } = info;
  const g = lot.g;
  wallCases(lot, M, info, 'jars', 7, 0.4, 1.6);
  // 坩埚
  const pots = [
    cauldron(lot, M, -6.5, -2.8, new THREE.Color(0.3, 1.7, 0.4)),
    cauldron(lot, M, -8.8, 1.0, new THREE.Color(1.3, 0.4, 1.8)),
    cauldron(lot, M, -4.6, 0.6, new THREE.Color(1.8, 0.9, 0.25)),
  ];
  pointLight(lot, '#7aff9a', 6, -6.5, 1.4, -2.8, 6);
  pointLight(lot, '#ffc078', 14, -5.5, H - 0.5, 2.5, 15);
  pointLight(lot, '#ffc078', 8, -9, H - 0.5, -3.5, 10);
  pointLight(lot, '#ffd3a0', 10, -10.5, 2.6, -0.5, 9);
  const wp = (p) => lot.toWorld(p.x, p.z, p.y);
  W.updaters.push((dt) => {
    for (const p of pots) {
      if (Math.random() < dt * 14) {
        const a = Math.random() * 6.28, r = Math.random() * 0.38;
        const q = wp(p).add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
        W.fx.sparks.emit({ p: q, v: new V3(0, rnd(0.2, 0.5), 0), life: rnd(0.3, 0.7), size: rnd(0.03, 0.07), c: p.c });
      }
      if (Math.random() < dt * 3) {
        W.fx.smoke.emit({ p: wp(p).add(new V3(rnd(-0.2, 0.2), 0.1, rnd(-0.2, 0.2))), v: new V3(rnd(-0.05, 0.05), 0.35, rnd(-0.05, 0.05)), life: 4, size: 0.3, sizeEnd: 1.4, alpha: 0.18, c: p.c.clone().multiplyScalar(0.4).addScalar(0.3) });
      }
    }
  });
  // 天花板上倒挂的草药束
  const herbMats = ['#4a6a2a', '#6a5a2a', '#3a4a2a', '#7a6a3a', '#5a3a2a'].map((c) => std({ color: c, roughness: 1 }));
  for (const bx of [-2.6, -5.2, -7.8, -10.4]) {
    for (let i = 0; i < 6; i++) {
      const z = rnd(Z0 + 0.6, Z1 - 0.6), len = rnd(0.25, 0.5), y = H - 0.25;
      g.add(box(0.008, 0.15, 0.008, M.frame, bx, y - 0.07, z));
      const c = new THREE.Mesh(new THREE.ConeGeometry(rnd(0.06, 0.11), len, 7), pick(herbMats));
      c.position.set(bx, y - 0.15 - len / 2, z);
      c.castShadow = true;
      g.add(c);
    }
  }
  // 悬挂的鳄鱼标本
  const croc = new THREE.CatmullRomCurve3([new V3(-9.5, 3.1, 1), new V3(-8, 3.15, 1.1), new V3(-6.5, 3.12, 0.9), new V3(-5.2, 3.1, 1.0), new V3(-4.4, 3.08, 1.05)]);
  const crocM = std({ map: T.scaleTex(), color: '#4a5a3a', roughness: 0.8 });
  const body = new THREE.Mesh(taperedTube(croc, 60, 10, (t) => (t < 0.55 ? 0.03 + 0.22 * Math.pow(t / 0.55, 1.2) : 0.25 - 0.17 * ((t - 0.55) / 0.45))), crocM);
  body.scale.y = 0.6;
  body.position.y = 1.2;
  const crocG = new THREE.Group();
  crocG.add(body);
  for (const [x, s] of [[-6.2, 1], [-6.2, -1], [-7.4, 1], [-7.4, -1]]) {
    const leg = cyl(0.04, 0.03, 0.3, crocM, x, 3.12 + 1.2 * 0.6 - 1.2 * 0.6, 1 + s * 0.2, 5);
    leg.position.y = 3.06 * 0.6 + 1.2 - 0.1;
    leg.rotation.x = s * 0.9;
    crocG.add(leg);
  }
  g.add(crocG);
  for (const x of [-8.5, -5.5]) g.add(cyl(0.006, 0.006, 0.3, M.iron, x, H - 0.4, 1, 4));
  // 木桶
  for (const [x, z] of [[-2.2, Z0 + 0.7], [-3.0, Z0 + 0.6], [-2.4, Z1 - 0.8]]) {
    g.add(cyl(0.32, 0.28, 0.85, M.wood, x, 0.425, z));
    for (const y of [0.12, 0.72]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.018, 4, 16), M.iron); h.rotation.x = Math.PI / 2; h.position.set(x, y, z); g.add(h); }
    lot.circle(x, z, 0.36);
  }
  // 柜台 + 天平
  counter(lot, M, -9.6, -4.6, 0.9, 3.0);
  const sx = -9.6, sz = -4.6, sy = 1.06;
  g.add(cyl(0.1, 0.12, 0.04, M.brass, sx, sy + 0.02, sz));
  g.add(cyl(0.012, 0.012, 0.5, M.brass, sx, sy + 0.27, sz, 6));
  g.add(box(0.02, 0.02, 0.6, M.brass, sx, sy + 0.52, sz));
  for (const s of [-1, 1]) {
    g.add(cyl(0.004, 0.004, 0.2, M.brass, sx, sy + 0.42, sz + s * 0.29, 4));
    g.add(cyl(0.1, 0.06, 0.03, M.brass, sx, sy + 0.31, sz + s * 0.29, 14));
  }
  dust(W, lot, info, '#c0ffc0', 120);
  placeKeeper(W, lot, 'apothecary', -10.65, -4.4, Math.PI / 2);

  const brews = ['复方汤剂——闻起来像下水道，冒着泥浆般的泡泡。', '福灵剂，液体像熔化的金子，在锅里欢快地跳跃。', '迷情剂，散发着珍珠般的光泽，蒸汽呈螺旋状上升。', '生骨灵——光是闻着就让人骨头发痒。', '缩身药水，颜色本应是酸绿色……这锅好像熬过头了。'];
  W.interactables.push({
    pos: lot.toWorld(-5.6, -0.8, 1.0), r: 2.5,
    label: () => '按 E 搅拌坩埚',
    action: () => {
      W.say(pick(brews));
      W.sfx.bubble();
      for (const p of pots) {
        for (let i = 0; i < 30; i++) W.fx.smoke.emit({ p: wp(p), v: new V3(rnd(-0.4, 0.4), rnd(0.6, 1.4), rnd(-0.4, 0.4)), life: 3, size: 0.3, sizeEnd: 1.6, alpha: 0.35, c: p.c.clone().multiplyScalar(0.45) });
        for (let i = 0; i < 25; i++) W.fx.sparks.emit({ p: wp(p), v: new V3(rnd(-0.6, 0.6), rnd(1, 2.2), rnd(-0.6, 0.6)), life: 1, size: 0.06, c: p.c, g: -2 });
      }
    },
  });
}

// ============================================================ 咿啦猫头鹰商店
const OWL_TYPES = {
  snowy: { body: '#f2f0ea', face: '#ffffff', belly: '#ffffff', eye: [1.4, 1.1, 0.2] },
  tawny: { body: '#7a5232', face: '#b08a62', belly: '#9a7250', eye: [0.08, 0.05, 0.03] },
  barn: { body: '#c9a066', face: '#f5efe6', belly: '#f0e6d0', eye: [0.05, 0.04, 0.03] },
  grey: { body: '#7d7d78', face: '#a8a8a0', belly: '#9a9a92', eye: [1.2, 0.9, 0.15] },
  eagle: { body: '#8a5a2a', face: '#a87a4a', belly: '#b08a5a', eye: [1.6, 0.6, 0.1], tufts: true },
};
const owlGeo = {
  body: new THREE.SphereGeometry(0.16, 16, 12),
  head: new THREE.SphereGeometry(0.13, 16, 12),
  eye: new THREE.SphereGeometry(0.034, 10, 8),
  pupil: new THREE.SphereGeometry(0.018, 8, 6),
  beak: new THREE.ConeGeometry(0.018, 0.05, 6),
  tuft: new THREE.ConeGeometry(0.025, 0.09, 5),
};
const owlMats = {};
function owlMat(c, basic = false) {
  const k = c + basic;
  if (!owlMats[k]) owlMats[k] = basic ? new THREE.MeshBasicMaterial({ color: new THREE.Color(...c) }) : std({ color: c, roughness: 0.95 });
  return owlMats[k];
}
function makeOwl(type) {
  const T = OWL_TYPES[type];
  const o = new THREE.Group();
  o.userData.dyn = true;
  const bm = owlMat(T.body), fm = owlMat(T.face), lm = owlMat(T.belly);
  const mk = (geo, mat, p, s, r) => { const m = new THREE.Mesh(geo, mat); m.position.set(...p); if (s) m.scale.set(...s); if (r) m.rotation.set(...r); m.castShadow = true; return m; };
  o.add(mk(owlGeo.body, bm, [0, 0.2, 0], [1, 1.35, 0.9]));
  o.add(mk(owlGeo.body, lm, [0, 0.18, 0.06], [0.8, 1.1, 0.6]));
  for (const s of [-1, 1]) o.add(mk(owlGeo.body, bm, [s * 0.13, 0.2, -0.02], [0.35, 1.1, 0.85], [0, 0, s * 0.12]));
  for (const s of [-1, 1]) o.add(mk(owlGeo.beak, owlMat('#3a3020'), [s * 0.05, 0.01, 0.05], [1.2, 0.6, 1.2], [Math.PI, 0, 0]));
  const head = new THREE.Group();
  head.position.y = 0.42;
  o.add(head);
  head.add(mk(owlGeo.head, bm, [0, 0, 0], [1.12, 0.95, 1]));
  head.add(mk(owlGeo.head, fm, [0, -0.005, 0.07], [0.85, 0.78, 0.5]));
  const eyes = [];
  const em = owlMat(T.eye, true), pm = owlMat([0, 0, 0], true);
  for (const s of [-1, 1]) {
    const e = new THREE.Group();
    e.position.set(s * 0.045, 0.012, 0.115);
    e.add(mk(owlGeo.eye, em, [0, 0, 0]));
    e.add(mk(owlGeo.pupil, pm, [0, 0, 0.022]));
    head.add(e);
    eyes.push(e);
    if (T.tufts) head.add(mk(owlGeo.tuft, bm, [s * 0.08, 0.11, 0], null, [0, 0, -s * 0.35]));
  }
  head.add(mk(owlGeo.beak, owlMat('#4a3a20'), [0, -0.035, 0.135], null, [Math.PI * 0.7, 0, 0]));
  o.userData.head = head;
  o.userData.eyes = eyes;
  o.userData.blink = rnd(1, 6);
  return o;
}

function makeCage(M, r = 0.3, h = 0.6) {
  const c = new THREE.Group();
  c.add(cyl(r + 0.03, r + 0.04, 0.05, M.brass, 0, 0.025, 0, 18));
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    c.add(cyl(0.005, 0.005, h, M.brass, Math.cos(a) * r, h / 2, Math.sin(a) * r, 4));
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 4, 24), M.brass);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = h;
  c.add(ring);
  for (let i = 0; i < 3; i++) {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 4, 16, Math.PI), M.brass);
    arc.position.y = h;
    arc.rotation.y = (i * Math.PI) / 3;
    c.add(arc);
  }
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 4, 12), M.brass);
  hook.position.y = h + r + 0.04;
  c.add(hook);
  const perch = cyl(0.012, 0.012, r * 2, M.wood, 0, 0.22, 0, 5);
  perch.rotation.z = Math.PI / 2;
  c.add(perch);
  return c;
}

export function eeylops(W, M, lot, info) {
  const { X0, X1, Z0, Z1, H } = info;
  const g = lot.g;
  const owls = [];
  const types = ['tawny', 'barn', 'grey', 'eagle', 'tawny', 'barn', 'snowy'];
  const putOwl = (parent, x, y, z, s, type, rotY = 0) => {
    const o = makeOwl(type);
    o.position.set(x, y, z);
    o.rotation.y = rotY;
    o.scale.setScalar(s);
    parent.add(o);
    owls.push(o);
    return o;
  };
  // 墙上的层板 + 鸟笼
  const shelf = (x0, z0, x1, z1, y, faceRot) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const sh = box(Math.abs(x1 - x0) || 0.45, 0.05, Math.abs(z1 - z0) || 0.45, M.woodDark, (x0 + x1) / 2, y, (z0 + z1) / 2, 2);
    g.add(sh);
    const n = Math.floor(len / 0.85);
    for (let k = 0; k < n; k++) {
      const f = (k + 0.5) / n;
      const x = x0 + (x1 - x0) * f, z = z0 + (z1 - z0) * f;
      const cg = makeCage(M, 0.27, 0.55);
      cg.position.set(x, y + 0.025, z);
      g.add(cg);
      if (Math.random() < 0.8) putOwl(g, x, y + 0.025 + 0.18, z, 0.62, pick(types), faceRot + rnd(-0.4, 0.4));
    }
  };
  const bx = X0 + 0.25;
  for (const y of [1.0, 2.1, 3.1]) shelf(bx, Z0 + 0.5, bx, Z1 - 0.5, y, Math.PI / 2);
  for (const y of [1.3, 2.4]) {
    shelf(X0 + 1.0, Z0 + 0.25, X1 - 1.8, Z0 + 0.25, y, 0);
    shelf(X0 + 1.0, Z1 - 0.25, X1 - 3.2, Z1 - 0.25, y, Math.PI);
  }
  lot.collider(X0, X0 + 0.5, Z0, Z1);
  lot.collider(X0, X1 - 1.8, Z0, Z0 + 0.5);
  lot.collider(X0, X1 - 3.2, Z1 - 0.5, Z1);
  // 天花板吊笼
  for (const [x, z] of [[-4.0, -2.5], [-6.5, 1.5], [-8.5, -2.0], [-5.5, -4.5]]) {
    const cg = makeCage(M, 0.33, 0.7);
    const y = H - 1.4;
    cg.position.set(x, y, z);
    g.add(cg);
    g.add(cyl(0.006, 0.006, H - y - 0.8, M.iron, x, (H + y + 0.8) / 2, z, 4));
    putOwl(g, x, y + 0.24, z, 0.75, pick(types), rnd(0, 6));
  }
  // 落地栖木
  const stand = (x, z, n) => {
    g.add(cyl(0.25, 0.3, 0.06, M.woodDark, x, 0.03, z));
    g.add(cyl(0.04, 0.05, 1.6, M.wood, x, 0.8, z, 8));
    const bar = cyl(0.03, 0.03, 1.1, M.wood, x, 1.6, z, 8);
    bar.rotation.x = Math.PI / 2;
    g.add(bar);
    for (let i = 0; i < n; i++) putOwl(g, x, 1.62, z + (n === 1 ? 0 : (i - (n - 1) / 2) * 0.5), 0.95, pick(types), Math.PI / 2 + rnd(-0.5, 0.5));
    lot.circle(x, z, 0.35);
  };
  stand(-7.0, -1.0, 2);
  stand(-9.5, 2.8, 2);
  // 海德薇（雪鸮）
  const hx = -3.2, hz = 2.0;
  g.add(cyl(0.3, 0.35, 0.9, M.woodDark, hx, 0.45, hz));
  const hcg = makeCage(M, 0.4, 0.8);
  hcg.position.set(hx, 0.9, hz);
  g.add(hcg);
  const hedwig = putOwl(g, hx, 0.9 + 0.24, hz, 1.05, 'snowy', Math.PI / 2);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.2), M.signMat(T.signTex([{ t: 'Snowy Owl', s: 1 }, { t: '雪鸮 · 7 Galleons', s: 0.7 }], { w: 512, h: 200, bg: '#2a1a0c' })));
  plaque.position.set(hx + 0.36, 0.55, hz);
  plaque.rotation.y = Math.PI / 2;
  g.add(plaque);
  lot.circle(hx, hz, 0.45);
  // 柜台
  counter(lot, M, -2.6, Z0 + 0.8, 2.0, 0.8);
  // 地上的稻草
  const straw = std({ map: T.strawTex(), transparent: true, alphaTest: 0.3, roughness: 1, depthWrite: false });
  for (let i = 0; i < 18; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(rnd(0.6, 1.2), rnd(0.6, 1.2)), straw);
    s.rotation.set(-Math.PI / 2, 0, Math.random() * 6);
    s.position.set(rnd(X0 + 0.6, X1 - 0.6), 0.045 + i * 0.0005, rnd(Z0 + 0.6, Z1 - 0.6));
    s.receiveShadow = true;
    g.add(s);
  }
  pointLight(lot, '#ffbf80', 13, -5.5, H - 0.6, 0, 14);
  pointLight(lot, '#ffd9a8', 4, -3.0, 3.4, 2.0, 8);

  // 猫头鹰转头盯着玩家、眨眼
  const cam = new V3(), loc = new V3();
  W.updaters.push((dt) => {
    cam.copy(W.camera.position);
    if (Math.abs(cam.z - lot.zc) > 20) return;
    for (const o of owls) {
      const h = o.userData.head;
      loc.copy(cam);
      o.worldToLocal(loc);
      loc.y -= 0.42;
      const yaw = clamp(Math.atan2(loc.x, loc.z), -2.3, 2.3);
      const pitch = clamp(-Math.atan2(loc.y, Math.hypot(loc.x, loc.z)), -0.6, 0.6);
      h.rotation.y += (yaw - h.rotation.y) * Math.min(1, dt * 3);
      h.rotation.x += (pitch * 0.6 - h.rotation.x) * Math.min(1, dt * 3);
      o.userData.blink -= dt;
      const closed = o.userData.blink < 0;
      for (const e of o.userData.eyes) e.scale.y = closed ? 0.1 : 1;
      if (o.userData.blink < -0.13) o.userData.blink = rnd(2, 7);
    }
    if (Math.random() < dt * 0.6) {
      const p = lot.toWorld(rnd(X0 + 1, X1 - 1), rnd(Z0 + 1, Z1 - 1), H - 0.4);
      W.fx.smoke.emit({ p, v: new V3(rnd(-0.1, 0.1), -0.25, rnd(-0.1, 0.1)), life: 9, size: 0.06, sizeEnd: 0.06, alpha: 0.9, c: new THREE.Color(1, 0.98, 0.95) });
    }
  });
  W.hedwigHello = () => {
    W.sfx.hoot();
    W.say('雪白的猫头鹰轻轻啄了啄你的手指，琥珀色的眼睛眨了眨——也许你该给她起个名字，比如……海德薇？');
    const p = hedwig.getWorldPosition(new V3()).add(new V3(0, 0.5, 0));
    for (let i = 0; i < 20; i++) W.fx.smoke.emit({ p: p.clone(), v: new V3(rnd(-0.8, 0.8), rnd(0, 1), rnd(-0.8, 0.8)), life: 4, size: 0.07, alpha: 0.9, g: -0.3, drag: 1.5, c: new THREE.Color(1, 1, 1) });
  };
  W.interactables.push({
    pos: lot.toWorld(hx + 0.6, hz, 1.2), r: 2.2,
    label: () => '按 E 和雪鸮打招呼',
    action: () => W.hedwigHello(),
  });
  placeKeeper(W, lot, 'owlkeeper', -4.6, -4.0, 0.6);
}
