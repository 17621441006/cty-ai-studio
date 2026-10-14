import * as THREE from 'three';
import { rnd } from './util.js';
import { stripeTex, nameTex } from './textures.js';
import { hasModel, modelCharacter } from './models.js';

export const DUMBLEDORE_GLB = './assets/dumbledore.glb';

// ------------------------------------------------------------------
// 程序化角色：长袍 + 头发/胡子/帽子/眼镜/围巾 等辨识特征
// 原点在脚底，面朝本地 +z
// ------------------------------------------------------------------
const std = (o) => new THREE.MeshStandardMaterial(o);
const _wp = new THREE.Vector3();
const cache = {};
const M = (c, o = {}) => {
  const k = c + JSON.stringify(o);
  return cache[k] || (cache[k] = std({ color: c, roughness: 0.8, ...o }));
};
const G = {
  sphere: new THREE.SphereGeometry(1, 18, 14),
  cap: new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.56),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 12),
  cone: new THREE.ConeGeometry(1, 1, 18),
  box: new THREE.BoxGeometry(1, 1, 1),
  sleeve: new THREE.CylinderGeometry(0.055, 0.09, 0.56, 12, 1, true),
  ring: new THREE.TorusGeometry(0.026, 0.0045, 6, 20),
  half: new THREE.TorusGeometry(0.026, 0.0045, 6, 12, Math.PI),
  square: new THREE.TorusGeometry(0.03, 0.0045, 4, 4),
};
function mesh(geo, mat, p = [0, 0, 0], s = [1, 1, 1], r = [0, 0, 0]) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...p);
  m.scale.set(...s);
  m.rotation.set(...r);
  m.castShadow = true;
  return m;
}

const ROBE_PROFILE = [[0.0, 0.2], [0.34, 0.2], [0.32, 0.45], [0.27, 0.8], [0.235, 1.1], [0.215, 1.32], [0.17, 1.43], [0.07, 1.5], [0.0, 1.51]];

function addHair(head, s) {
  const hc = M(s.hair?.color || '#2a1a10', { roughness: 0.95 });
  const type = s.hair?.type || 'short';
  const cap = mesh(G.cap, hc, [0, 0.012, -0.008], [0.108, 0.118, 0.114], [-0.38, 0, 0]);
  head.add(cap);
  const blob = (p, r) => head.add(mesh(G.sphere, hc, p, [r, r, r]));
  if (type === 'messy') {
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2, e = rnd(0.25, 1.2);
      const dir = new THREE.Vector3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e) - 0.25).normalize();
      const sp = mesh(G.cone, hc, dir.clone().multiplyScalar(0.11).toArray(), [0.028, 0.08, 0.028]);
      sp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      head.add(sp);
    }
    head.add(mesh(G.box, hc, [0.02, 0.07, 0.085], [0.12, 0.03, 0.04], [0.4, 0, 0.2])); // 刘海
  } else if (type === 'short') {
    head.add(mesh(G.box, hc, [0, 0.075, 0.08], [0.15, 0.03, 0.04], [0.5, 0, 0]));
  } else if (type === 'bushy') {
    for (let i = 0; i < 24; i++) {
      const a = rnd(-Math.PI * 0.95, Math.PI * 0.95) + Math.PI, y = rnd(-0.22, 0.1);
      const R = rnd(0.1, 0.135);
      blob([Math.sin(a) * R, y, Math.cos(a) * R * 0.9 - 0.02], rnd(0.05, 0.075));
    }
    head.add(mesh(G.box, hc, [0, 0.08, 0.075], [0.17, 0.04, 0.05], [0.5, 0, 0]));
  } else if (type === 'long') {
    head.add(mesh(G.box, hc, [0, -0.1, -0.075], [0.2, 0.3, 0.06]));
    for (const sd of [-1, 1]) head.add(mesh(G.box, hc, [sd * 0.095, -0.08, -0.01], [0.03, 0.24, 0.12]));
  } else if (type === 'curtain') {
    head.add(mesh(G.box, hc, [0, -0.1, -0.075], [0.21, 0.28, 0.06]));
    for (const sd of [-1, 1]) head.add(mesh(G.box, hc, [sd * 0.1, -0.06, 0.02], [0.03, 0.22, 0.16]));
    head.add(mesh(G.box, hc, [0, 0.085, 0.07], [0.19, 0.04, 0.06], [0.5, 0, 0]));
  } else if (type === 'bun') {
    blob([0, 0.03, -0.125], 0.05);
  } else if (type === 'wild') {
    for (let i = 0; i < 18; i++) {
      const a = rnd(0, Math.PI * 2), y = rnd(-0.06, 0.12);
      blob([Math.sin(a) * 0.11, y, Math.cos(a) * 0.1 - 0.03], rnd(0.035, 0.06));
    }
  } else if (type === 'giant') {
    for (let i = 0; i < 26; i++) {
      const a = rnd(0, Math.PI * 2), y = rnd(-0.12, 0.13);
      blob([Math.sin(a) * 0.12, y, Math.cos(a) * 0.11 - 0.03], rnd(0.05, 0.08));
    }
  } else if (type === 'wavy') {
    for (let i = 0; i < 14; i++) {
      const a = rnd(-2.6, 2.6) + Math.PI, y = rnd(-0.04, 0.12);
      blob([Math.sin(a) * 0.105, y, Math.cos(a) * 0.1], rnd(0.04, 0.06));
    }
    blob([0.03, 0.1, 0.06], 0.055);
  }
  // 胡子
  if (s.beard) {
    const bm = M(s.beard.color, { roughness: 0.95 });
    if (s.beard.type === 'long') {
      head.add(mesh(G.cone, bm, [0, -0.33, 0.07], [0.105, 0.5, 0.06], [Math.PI, 0, 0]));
      head.add(mesh(G.box, bm, [0, -0.045, 0.1], [0.09, 0.025, 0.03]));
    } else if (s.beard.type === 'bushy') {
      for (let i = 0; i < 22; i++) {
        const a = rnd(-1.6, 1.6), y = rnd(-0.22, -0.03);
        head.add(mesh(G.sphere, bm, [Math.sin(a) * 0.095, y, Math.cos(a) * 0.08 + 0.01], [rnd(0.045, 0.07), rnd(0.045, 0.07), rnd(0.04, 0.06)]));
      }
    } else {
      head.add(mesh(G.sphere, bm, [0, -0.07, 0.07], [0.07, 0.05, 0.04]));
    }
  }
}

function addHat(head, s) {
  if (!s.hat) return;
  const hm = M(s.hat.color, { roughness: 0.85 });
  const tall = s.hat.type === 'wizard' ? 0.42 : 0.32;
  const brim = s.hat.type === 'wizard' ? 0.17 : 0.22;
  const g = new THREE.Group();
  g.position.set(0, 0.075, -0.01);
  g.rotation.x = -0.12;
  g.add(mesh(G.cyl, hm, [0, 0, 0], [brim, 0.012, brim]));
  g.add(mesh(G.cone, hm, [0, tall * 0.45, 0], [0.105, tall * 0.9, 0.105]));
  g.add(mesh(G.cone, hm, [0.02, tall * 0.95, -0.03], [0.04, tall * 0.25, 0.04], [-0.5, 0, -0.3]));
  if (s.hat.band) g.add(mesh(G.cyl, M(s.hat.band), [0, 0.03, 0], [0.108, 0.03, 0.108]));
  head.add(g);
}

function addGlasses(head, s) {
  if (!s.glasses) return;
  const gm = M(s.glasses === 'half' ? '#b8913a' : '#151515', { metalness: 0.6, roughness: 0.4 });
  const geo = s.glasses === 'half' ? G.half : s.glasses === 'square' ? G.square : G.ring;
  for (const sd of [-1, 1]) {
    const r = mesh(geo, gm, [sd * 0.038, 0.016, 0.098]);
    if (s.glasses === 'half') r.rotation.z = Math.PI;
    if (s.glasses === 'square') r.rotation.z = Math.PI / 4;
    head.add(r);
  }
  head.add(mesh(G.box, gm, [0, 0.02, 0.102], [0.02, 0.004, 0.004]));
}

export function makeCharacter(s) {
  // 有外部 3D 模型时优先使用（细节更丰富）
  if (s.model && hasModel(s.model)) {
    let label = null;
    if (s.name) {
      label = new THREE.Sprite(new THREE.SpriteMaterial({ map: nameTex(s.name, s.en), transparent: true, depthWrite: false, opacity: 0 }));
      label.scale.set(0.9, 0.225, 1);
    }
    return modelCharacter(s, label);
  }
  const root = new THREE.Group();
  root.userData.dyn = true;
  const body = new THREE.Group();
  root.add(body);
  const skin = M(s.skin || '#eac4a4', { roughness: 0.6 });
  const robeM = M(s.robe, { roughness: 0.88, side: THREE.DoubleSide });
  const w = s.w || 1;

  // 腿与鞋
  const legs = [];
  for (const sd of [-1, 1]) {
    const L = new THREE.Group();
    L.position.set(sd * 0.09, 0.9, 0);
    L.add(mesh(G.cyl, M(s.trouser || '#1d1d20'), [0, -0.42, 0], [0.055, 0.84, 0.055]));
    L.add(mesh(G.box, M(s.shoes || '#141010', { roughness: 0.35 }), [0, -0.865, 0.04], [0.1, 0.07, 0.25]));
    body.add(L);
    legs.push(L);
  }
  // 长袍（正面开襟）
  const prof = ROBE_PROFILE.map(([r, y]) => new THREE.Vector2(r, y));
  const open = s.open !== false;
  const robe = new THREE.Mesh(new THREE.LatheGeometry(prof, 28, open ? 0.32 : 0, open ? Math.PI * 2 - 0.64 : Math.PI * 2), robeM);
  robe.castShadow = true;
  robe.scale.set(w, 1, w);
  body.add(robe);
  if (open) {
    const inner = new THREE.Mesh(new THREE.LatheGeometry(prof.map((v) => new THREE.Vector2(v.x * 0.95, v.y)), 20), M(s.inner || '#3a3a3a'));
    inner.scale.set(w, 1, w);
    body.add(inner);
  }
  // 兜帽/领子
  body.add(mesh(new THREE.TorusGeometry(0.12, 0.035, 8, 20), robeM, [0, 1.45, -0.02], [w, 1, w], [Math.PI / 2 + 0.25, 0, 0]));
  if (s.tie) {
    body.add(mesh(G.box, M('#ecebe6'), [0, 1.36, 0.165 * w], [0.09, 0.12, 0.02], [-0.25, 0, 0]));
    body.add(mesh(G.box, M(s.tie), [0, 1.3, 0.19 * w], [0.035, 0.22, 0.02], [-0.18, 0, 0]));
  }
  // 手臂
  const arms = [];
  for (const sd of [-1, 1]) {
    const A = new THREE.Group();
    A.position.set(sd * 0.2 * w, 1.42, 0);
    A.rotation.z = sd * 0.12;
    A.add(mesh(G.sleeve, robeM, [0, -0.27, 0], [w, 1, w]));
    A.add(mesh(G.sphere, skin, [0, -0.58, 0.01], [0.045, 0.055, 0.045]));
    body.add(A);
    arms.push(A);
  }
  // 围巾（格兰芬多）
  if (s.scarf) {
    const sm = std({ map: stripeTex(s.scarf[0], s.scarf[1], 10), roughness: 0.9 });
    body.add(mesh(new THREE.TorusGeometry(0.1, 0.038, 8, 20), sm, [0, 1.47, 0.01], [1, 1, 1], [Math.PI / 2 + 0.2, 0, 0]));
    body.add(mesh(G.box, sm, [0.07, 1.25, 0.2], [0.08, 0.36, 0.025], [-0.15, 0, 0.05]));
  }
  // 头
  body.add(mesh(G.cyl, skin, [0, 1.53, 0], [0.042, 0.09, 0.042]));
  const head = new THREE.Group();
  head.position.set(0, 1.635, 0);
  body.add(head);
  head.add(mesh(G.sphere, skin, [0, 0, 0], [0.098, 0.118, 0.106]));
  head.add(mesh(G.sphere, skin, [0, -0.012, 0.103], [0.016, s.nose || 0.024, 0.024]));
  for (const sd of [-1, 1]) {
    head.add(mesh(G.sphere, skin, [sd * 0.097, 0, -0.005], [0.018, 0.032, 0.02]));
    head.add(mesh(G.sphere, M('#f4f0ea', { roughness: 0.3 }), [sd * 0.037, 0.016, 0.088], [0.017, 0.012, 0.01]));
    head.add(mesh(G.sphere, M(s.eyes || '#2a1a10', { roughness: 0.2 }), [sd * 0.037, 0.016, 0.096], [0.009, 0.009, 0.006]));
    head.add(mesh(G.box, M(s.brow || s.hair?.color || '#2a1a10'), [sd * 0.037, 0.04, 0.096], [0.034, 0.008, 0.01], [0, 0, sd * -0.12]));
  }
  head.add(mesh(G.box, M('#9a5a50'), [0, -0.052, 0.094], [0.034, 0.006, 0.01]));
  addHair(head, s);
  addHat(head, s);
  addGlasses(head, s);

  // 名牌
  let label = null;
  if (s.name) {
    label = new THREE.Sprite(new THREE.SpriteMaterial({ map: nameTex(s.name, s.en), transparent: true, depthWrite: false, opacity: 0 }));
    label.scale.set(0.9, 0.225, 1);
    label.position.y = 2.08 + (s.hat ? 0.3 : 0);
    root.add(label);
  }
  root.scale.setScalar(s.h || 1);

  const ch = {
    root, head, body, arms, legs, label, spec: s,
    phase: Math.random() * 6, t: Math.random() * 10, headYaw: 0, gestureT: 0,
    gesture(sec = 1.6) { this.gestureT = sec; },
    update(dt, speed, cam) {
      this.t += dt;
      const h = s.h || 1;
      if (speed > 0.05) {
        this.phase += (dt * speed * 5.4) / h;
        const a = Math.sin(this.phase);
        legs[0].rotation.x = a * 0.45;
        legs[1].rotation.x = -a * 0.45;
        arms[0].rotation.x = -a * 0.35;
        arms[1].rotation.x = a * 0.35;
        body.position.y = Math.abs(Math.cos(this.phase)) * 0.025;
        robe.rotation.y = a * 0.04;
      } else {
        for (const L of legs) L.rotation.x *= 0.85;
        arms[0].rotation.x = Math.sin(this.t * 0.9) * 0.04;
        arms[1].rotation.x = -Math.sin(this.t * 0.9) * 0.04;
        body.position.y *= 0.85;
        body.scale.y = 1 + Math.sin(this.t * 1.6) * 0.006;
      }
      if (this.gestureT > 0) {
        this.gestureT -= dt;
        const k = Math.sin(Math.min(1, this.gestureT / 1.6) * Math.PI);
        arms[1].rotation.x = -1.3 * k;
        arms[1].rotation.z = 0.12 + Math.sin(this.t * 6) * 0.15 * k;
      }
      // 看向玩家
      let target = 0;
      const d = root.getWorldPosition(_wp).distanceTo(cam);
      if (d < 4.5) {
        const l = root.worldToLocal(cam.clone());
        target = Math.max(-1.1, Math.min(1.1, Math.atan2(l.x, l.z)));
      }
      this.headYaw += (target - this.headYaw) * Math.min(1, dt * 3);
      head.rotation.y = this.headYaw;
      if (label) {
        const want = d < 7 ? 1 : 0;
        label.material.opacity += (want - label.material.opacity) * Math.min(1, dt * 4);
        label.visible = label.material.opacity > 0.02;
      }
    },
  };
  return ch;
}

// ------------------------------------------------------------------
// 角色设定
// ------------------------------------------------------------------
const STUDENT = { robe: '#141416', inner: '#55555a', tie: '#7a1414', trouser: '#2a2a2e' };

// 外部模型（已离线减面 + 压缩）。rig = 静态模型自动绑骨参数（身高比例）
const MD = './assets/models/';
export const MODELS = {
  harry: MD + 'harry.glb', ron: MD + 'ron.glb', arcane: MD + 'arcane.glb', darkwitch: MD + 'darkwitch.glb',
  blackwitch: MD + 'blackwitch.glb', raincaller: MD + 'raincaller.glb', maiden: MD + 'maiden.glb',
  icewisp: MD + 'icewisp.glb', grump: MD + 'grump.glb', potionhouse: MD + 'potionhouse.glb',
  wand: MD + 'wand.glb', bus: MD + 'knightbus.glb',
};
export const MODEL_LOAD = [
  DUMBLEDORE_GLB,
  { url: MODELS.harry, rig: { shoulderY: 0.8, shoulderX: 0.1, handY: 0.53, handX: 0.35, armR: 0.075, hipY: 0.5, kneeY: 0.27, neckY: 0.85 } },
  { url: MODELS.ron, rig: { shoulderY: 0.82, shoulderX: 0.1, handY: 0.46, handX: 0.135, armR: 0.045, hipY: 0.5, kneeY: 0.27, neckY: 0.86 } },
  ...['arcane', 'darkwitch', 'blackwitch', 'raincaller', 'maiden', 'icewisp', 'grump', 'potionhouse', 'wand', 'bus'].map((k) => MODELS[k]),
];

export const CAST = {
  harry: { ...STUDENT, model: MODELS.harry, armDown: 0, legAmp: 0.38, name: '哈利·波特', en: 'Harry Potter', h: 0.9, skin: '#f0caa8', eyes: '#1f6a2a', hair: { type: 'messy', color: '#16120e' }, glasses: 'round', scarf: ['#7a0a0a', '#d4a020'],
    lines: ['嗨！我是哈利。你也是来买课本的吗？', '海格说古灵阁是除了霍格沃茨以外最安全的地方。', '我的魔杖是冬青木的，凤凰羽毛杖芯——和伏地魔的是兄弟杖……'] },
  ron: { ...STUDENT, model: MODELS.ron, armDown: 0, name: '罗恩·韦斯莱', en: 'Ron Weasley', h: 0.94, skin: '#f4d0b4', eyes: '#3a5a8a', hair: { type: 'short', color: '#c8501a' }, scarf: ['#7a0a0a', '#d4a020'],
    lines: ['血腥的地狱……这些东西也太贵了！', '要不要去魁地奇精品店看看光轮2001？', '我妈让我们别乱跑，弗雷德和乔治肯定又溜去把戏坊了。'] },
  hermione: { ...STUDENT, name: '赫敏·格兰杰', en: 'Hermione Granger', h: 0.88, skin: '#f2cdb0', eyes: '#5a3a1a', hair: { type: 'bushy', color: '#6a4426' },
    lines: ['你读过《霍格沃茨：一段校史》吗？丽痕书店刚好有货！', '是 Levi-O-sa，不是 Levi-o-SA！', '我已经把所有课本都背下来了——当然，只是为了预习。'] },
  hagrid: { name: '鲁伯·海格', en: 'Rubeus Hagrid', robe: '#4a3626', open: false, w: 1.45, h: 1.5, skin: '#d8a88a', hair: { type: 'giant', color: '#16110c' }, beard: { type: 'bushy', color: '#16110c' }, trouser: '#2a2018', shoes: '#2a1a10',
    lines: ['你是个巫师，知道吗？……啊，抱歉，习惯了。', '我得去给哈利买只猫头鹰当生日礼物。', '我不该说的……我不该说的……'] },
  dumbledore: { model: DUMBLEDORE_GLB, name: '阿不思·邓布利多', en: 'Albus Dumbledore', robe: '#5a2a6a', inner: '#3a1a46', h: 1.03, skin: '#ecd2c0', eyes: '#3a6aaa', hair: { type: 'long', color: '#e6e4de' }, beard: { type: 'long', color: '#e6e4de' }, hat: { type: 'wizard', color: '#5a2a6a', band: '#c9a227' }, glasses: 'half', nose: 0.034,
    lines: ['幸福在最黑暗的时候也能找到，只要你记得把灯打开。（试试按 L）', '决定我们成为什么样的人的，不是我们的能力，而是我们的选择。', '啊，比比多味豆……年轻时我不幸吃到过一颗呕吐味的。'] },
  mcgonagall: { name: '米勒娃·麦格', en: 'Minerva McGonagall', robe: '#14432a', inner: '#0c2a1a', h: 1.0, skin: '#ecd0bc', hair: { type: 'bun', color: '#8a8a8a' }, hat: { type: 'witch', color: '#103620' }, glasses: 'square',
    lines: ['即使在对角巷，也请注意你的言行举止。', '格兰芬多扣五分——开玩笑的，我们还没开学。', '我一向喜欢一场精彩的魁地奇比赛。'] },
  snape: { name: '西弗勒斯·斯内普', en: 'Severus Snape', robe: '#0a0a0c', inner: '#0a0a0c', open: false, h: 1.04, skin: '#e2d4be', hair: { type: 'curtain', color: '#0c0c0e' }, nose: 0.034,
    lines: ['……别挡路。', '显然，名气并不代表一切。', '我可以教你们如何装瓶名声、酿造荣耀，甚至阻止死亡。'] },
  witch: { name: '路过的女巫', en: 'Witch', robe: '#3a2a4a', inner: '#2a1a30', h: 0.98, hair: { type: 'long', color: '#5a3a20' }, hat: { type: 'witch', color: '#2a1a36' },
    lines: ['今晚的猫头鹰邮件特别多呢。', '福洛林的冰淇淋今天出了新口味！'] },
  wizard: { model: DUMBLEDORE_GLB, tint: { material_0: '#7f95c8' }, name: '路过的老巫师', en: 'Wizard', robe: '#22344e', inner: '#14202e', h: 0.98, hair: { type: 'short', color: '#7a7a7a' }, beard: { type: 'short', color: '#7a7a7a' }, hat: { type: 'wizard', color: '#1a2a40' },
    lines: ['《预言家日报》说今晚有流星雨。', '小心翻倒巷，年轻人。'] },
  aberforth: { model: DUMBLEDORE_GLB, tint: { material_0: '#9a8a6a' }, name: '阿不福思·邓布利多', en: 'Aberforth Dumbledore', robe: '#4a4030', inner: '#2a2418', h: 1.0, hair: { type: 'long', color: '#bdb6a8' }, beard: { type: 'long', color: '#bdb6a8' },
    lines: ['我是猪头酒吧的老板，不是来逛街的。', '我哥哥？……他总是有太多秘密。', '山羊比大多数巫师都可靠。'] },
  doge: { model: DUMBLEDORE_GLB, tint: { material_0: '#8a7ab0' }, name: '埃非亚斯·多吉', en: 'Elphias Doge', robe: '#3a2a5a', inner: '#22183a', h: 0.95, hair: { type: 'short', color: '#e0ded8' }, beard: { type: 'short', color: '#e0ded8' },
    lines: ['我和阿不思是在霍格沃茨第一天认识的。', '我正打算给《预言家日报》写一篇悼念……呃，纪念文章。', '小心那个丽塔·斯基特，孩子。'] },
  // 店主
  ollivander: { name: '加里克·奥利凡德', en: 'Garrick Ollivander', robe: '#5a564e', inner: '#2e2a24', h: 0.97, skin: '#ecdcd0', eyes: '#b8c4cc', hair: { type: 'wild', color: '#e4e0d8' },
    lines: ['我一直在等你……', '魔杖选择巫师，先生——这一点永远不会改变。', '每一根奥利凡德魔杖都有强大的魔法物质做杖芯。'] },
  lockhart: { name: '吉德罗·洛哈特', en: 'Gilderoy Lockhart', robe: '#6a8ad8', inner: '#3a5aa8', h: 1.0, skin: '#f0d0b4', eyes: '#3a7ad8', hair: { type: 'wavy', color: '#e0be5a' },
    lines: ['梅林爵士团三级勋章、黑魔法防御联盟荣誉会员，以及五次荣获《女巫周刊》最迷人微笑奖——我就不提了。', '要签名吗？别客气，我带了孔雀羽毛笔！', '记住——遗忘咒是我最擅长的咒语。'] },
  bookclerk: { model: MODELS.arcane, turnToCam: true, name: '丽痕书店女巫店员', en: 'Bookseller', robe: '#4a2a1a', inner: '#2a1a10', h: 0.98, hair: { type: 'short', color: '#4a3a2a' }, glasses: 'round',
    lines: ['《妖怪们的妖怪书》？我宁可去卖《隐形术的隐形书》……', '一年级课本在左手边第三排。'] },
  apothecary: { model: DUMBLEDORE_GLB, tint: { material_0: '#8fb08a' }, name: '药剂师', en: 'Apothecary', robe: '#2e3a22', inner: '#1a2214', h: 0.96, hair: { type: 'short', color: '#9a9a90' }, beard: { type: 'short', color: '#9a9a90' },
    lines: ['甲虫眼睛，五纳特一勺。', '火灰蛇的蛋要冷藏，别碰那个罐子！'] },
  owlkeeper: { name: '咿啦猫头鹰店主', en: 'Owl Keeper', robe: '#5a3048', inner: '#3a1a2a', h: 0.95, hair: { type: 'bun', color: '#5a3a20' }, hat: { type: 'witch', color: '#3a1a2a' },
    lines: ['雪鸮最适合送长途信件。', '别把手指伸进笼子——那只雕鸮会咬人。'] },
  // ---- 用户提供的模型 ----
  bellatrix: { model: MODELS.darkwitch, turnToCam: true, name: '贝拉特里克斯·莱斯特兰奇', en: 'Bellatrix Lestrange', h: 0.97,
    lines: ['哦～小宝贝迷路了？翻倒巷可就在那边……', '我杀了小天狼星·布莱克！……哦，抱歉，说漏嘴了。', '黑魔王会回来的——他一直都在。'] },
  hag: { model: MODELS.blackwitch, turnToCam: true, name: '翻倒巷的老巫婆', en: 'Knockturn Hag', h: 0.9,
    lines: ['要买人指甲吗？新鲜的，一个纳特一把。', '嘿嘿……迷路的小巫师，跟我来……', '别告诉魔法部你见过我。'] },
  fleur: { model: MODELS.raincaller, turnToCam: true, name: '芙蓉·德拉库尔', en: 'Fleur Delacour', h: 0.95,
    lines: ['Bonjour！我在古灵阁实习，是为了提高我的英语。', '比尔说韦斯莱家的花园有地精……真可爱。', '三强争霸赛？那是很久以前的事了。'] },
  greylady: { model: MODELS.maiden, ghost: { opacity: 0.55, glow: '#cfe0ff', intensity: 0.45 }, float: 0.35, turnToCam: true, name: '格雷女士（幽灵）', en: 'The Grey Lady', h: 0.98,
    lines: ['……我是海莲娜·拉文克劳。', '你在寻找什么？冠冕早已不在这里了。', '夜晚的对角巷，只有我们幽灵还记得它从前的样子。'] },
  wisp: { model: MODELS.icewisp, ghost: { opacity: 0.75, glow: '#9fd8ff', intensity: 0.3 }, float: 1.6, name: '冰霜精灵', en: 'Ice Wisp', h: 0.45,
    lines: ['呜～（它在你身边绕了一圈，空气一下子凉了下来）', '咻——！（它冲你眨了眨发光的眼睛）'] },
  stan: { name: '斯坦·桑帕克', en: 'Stan Shunpike', robe: '#3a2a6a', inner: '#2a1a4a', open: false, h: 0.92, skin: '#f0cfb4', hair: { type: 'short', color: '#3a2a1a' }, hat: { type: 'witch', color: '#2a1a5a' },
    lines: ['欢迎乘坐骑士公共汽车，为困境中的巫师提供紧急交通服务！', '我叫斯坦·桑帕克，今晚由我担任售票员。', '只要伸出握魔杖的手，我们就来接你——去哪儿都行！'] },
  ernie: { name: '厄恩·普朗', en: 'Ernie Prang', robe: '#2a2a3a', inner: '#1a1a2a', open: false, h: 0.88, skin: '#e8c8b0', hair: { type: 'short', color: '#9a9a9a' }, glasses: 'round',
    lines: ['坐稳了！', '我开车从来不看路——路会自己让开的。', '下一站：对角巷中段，停十秒！'] },
};
