import * as THREE from 'three';
import * as T from './textures.js';
import { V3, rnd } from './util.js';
import { npcHitTest } from './npcs.js';
import { getModel } from './models.js';
import { MODELS } from './characters.js';

// =====================================================================
// 第一人称：手 + 老魔杖（接骨木魔杖）+ 挥杖动作 + 四种咒语
// =====================================================================

const WAND_LEN = 0.38; // 15 英寸

/** 老魔杖：带一节节凸起的接骨木杖身 */
function elderWand() {
  const nodes = [];
  // 手柄处密集的节
  for (const y of [0.006, 0.026, 0.046, 0.066, 0.088]) nodes.push([y, y < 0.01 ? 0.0055 : 0.0032, 0.0045]);
  // 杖身上较稀疏、逐渐变小的节
  for (let y = 0.125, k = 0; y < WAND_LEN - 0.03; y += 0.042 + k * 0.003, k++) nodes.push([y, 0.0026 * (1 - (y / WAND_LEN) * 0.6), 0.0055]);
  const pts = [];
  const N = 120;
  for (let i = 0; i <= N; i++) {
    const y = (i / N) * WAND_LEN;
    let r = y < 0.1 ? 0.0122 : 0.0105 - ((y - 0.1) / (WAND_LEN - 0.1)) * 0.0068;
    if (y < 0.1 && y > 0.095) r = 0.0122 - (y - 0.095) * 0.34;
    for (const [ny, amp, w] of nodes) r += amp * Math.exp(-(((y - ny) / w) ** 2));
    if (i === 0) r = 0.004;
    if (i === N) r = 0.0012;
    pts.push(new THREE.Vector2(r, y));
  }
  const geo = new THREE.LatheGeometry(pts, 12);
  // 轻微的弯曲，让它看起来像天然树枝
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    p.setX(i, p.getX(i) + Math.sin(y * 21) * 0.0016 * (y / WAND_LEN));
    p.setZ(i, p.getZ(i) + Math.sin(y * 13 + 1) * 0.0012 * (y / WAND_LEN));
  }
  geo.computeVertexNormals();
  const tex = T.woodTex(30, 12, 52, false);
  tex.repeat.set(1, 6);
  const mat = new THREE.MeshStandardMaterial({ color: '#b8ab98', map: tex, roughness: 0.62, metalness: 0.0 });
  return new THREE.Mesh(geo, mat);
}

/** 右手握杖（以魔杖轴为 +y 的局部坐标系） */
function hand() {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: '#d9a988', roughness: 0.72, envMapIntensity: 0.45 });
  const sleeveM = new THREE.MeshStandardMaterial({ color: '#0d0c10', roughness: 0.9, side: THREE.DoubleSide });
  // 四根手指环绕杖柄
  const radii = [0.0175, 0.0185, 0.0188, 0.0178];
  [0.03, 0.049, 0.068, 0.086].forEach((y, i) => {
    const f = new THREE.Mesh(new THREE.TorusGeometry(radii[i], 0.0098 - i * 0.0004, 8, 18, Math.PI * 1.45), skin);
    f.rotation.x = Math.PI / 2;
    f.rotation.z = -0.35;
    f.position.y = y;
    f.scale.set(1, 1, 1.1);
    g.add(f);
  });
  // 手背 + 掌心
  const back = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), skin);
  back.scale.set(0.024, 0.052, 0.034);
  back.position.set(0.018, 0.052, -0.006);
  g.add(back);
  const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), skin);
  palm.scale.set(0.02, 0.045, 0.026);
  palm.position.set(-0.004, 0.045, -0.014);
  g.add(palm);
  // 拇指：沿杖身压在上方
  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.0085, 0.04, 4, 8), skin);
  thumb.position.set(-0.012, 0.096, 0.012);
  thumb.rotation.set(0.25, 0, 0.35);
  g.add(thumb);
  const thumbBase = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), skin);
  thumbBase.scale.set(0.017, 0.028, 0.017);
  thumbBase.position.set(-0.012, 0.062, 0.006);
  g.add(thumbBase);
  // 手腕与前臂
  const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, 0.12, 12), skin);
  wrist.position.set(0.01, -0.03, -0.006);
  g.add(wrist);
  // 黑色长袍袖子
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.075, 0.5, 16, 1, true), sleeveM);
  sleeve.position.set(0.012, -0.34, -0.01);
  g.add(sleeve);
  const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 6, 20), sleeveM);
  cuff.rotation.x = Math.PI / 2;
  cuff.position.set(0.012, -0.09, -0.01);
  g.add(cuff);
  g.traverse((o) => { if (o.isMesh) o.castShadow = false; });
  g.userData.skin = skin;
  return g;
}

// ---------------------------------------------------------------- 雄鹿守护神
function patronusStag() {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.8, 1.6), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const ell = (sx, sy, sz, x, y, z, par = g) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), mat);
    m.scale.set(sx, sy, sz);
    m.position.set(x, y, z);
    par.add(m);
    return m;
  };
  const limb = (a, b, r0, r1, par) => {
    const d = b.clone().sub(a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, d.length(), 8), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize());
    par.add(m);
    return m;
  };
  ell(0.22, 0.24, 0.55, 0, 1.15, 0); // 身体
  ell(0.2, 0.22, 0.25, 0, 1.2, 0.35); // 胸
  const neck = new THREE.Group();
  neck.position.set(0, 1.3, 0.48);
  neck.rotation.x = -0.6;
  g.add(neck);
  limb(new V3(0, 0, 0), new V3(0, 0.45, 0.05), 0.12, 0.08, neck);
  const head = new THREE.Group();
  head.position.set(0, 0.5, 0.06);
  head.rotation.x = 0.9;
  neck.add(head);
  ell(0.085, 0.09, 0.2, 0, 0, 0.08, head);
  for (const s of [-1, 1]) {
    ell(0.025, 0.07, 0.015, s * 0.08, 0.06, -0.02, head).rotation.z = s * -0.8; // 耳朵
    // 鹿角：主干 + 分叉
    const base = new V3(s * 0.04, 0.08, -0.02);
    const m1 = new V3(s * 0.2, 0.35, -0.12), m2 = new V3(s * 0.32, 0.62, -0.08), tip = new V3(s * 0.3, 0.85, 0.05);
    limb(base, m1, 0.018, 0.015, head);
    limb(m1, m2, 0.015, 0.012, head);
    limb(m2, tip, 0.012, 0.006, head);
    limb(m1, new V3(s * 0.12, 0.45, 0.12), 0.012, 0.005, head);
    limb(m2, new V3(s * 0.5, 0.72, -0.15), 0.01, 0.004, head);
    limb(m2, new V3(s * 0.22, 0.8, -0.18), 0.009, 0.004, head);
  }
  ell(0.05, 0.08, 0.04, 0, 1.28, -0.55).rotation.x = 0.6; // 尾巴
  const legs = [];
  for (const [x, z] of [[-0.12, 0.38], [0.12, 0.38], [-0.12, -0.36], [0.12, -0.36]]) {
    const L = new THREE.Group();
    L.position.set(x, 1.0, z);
    g.add(L);
    limb(new V3(0, 0.05, 0), new V3(0, -0.5, z > 0 ? 0.02 : -0.06), 0.06, 0.035, L);
    limb(new V3(0, -0.5, z > 0 ? 0.02 : -0.06), new V3(0, -0.98, 0), 0.03, 0.02, L);
    legs.push(L);
  }
  g.userData = { mat, legs, head: neck };
  return g;
}

// =====================================================================
export const SPELLS = [
  { key: 'expelliarmus', cn: '除你武器', en: 'Expelliarmus', col: '#ff3a2a', motion: 'flick', release: 0.2, dur: 0.62 },
  { key: 'lumos', cn: '荧光闪烁·最强', en: 'Lumos Maxima', col: '#dfe8ff', motion: 'raise', release: 0.32, dur: 0.7 },
  { key: 'incendio', cn: '火焰熊熊', en: 'Incendio', col: '#ff8a20', motion: 'thrust', release: 0.16, dur: 1.65 },
  { key: 'patronus', cn: '呼神护卫', en: 'Expecto Patronum', col: '#9fd8ff', motion: 'circle', release: 0.78, dur: 1.15 },
];

const ease = (x) => x * x * (3 - 2 * x);

export function createSpells(W, camera, pointBlocked) {
  const { fx, scene } = W;

  // ---- 手持装置 ----
  const arm = new THREE.Group();
  arm.userData.dyn = true;
  const REST_P = new V3(0.2, -0.24, -0.38), REST_R = new THREE.Euler(0.02, 0.34, -0.1);
  arm.position.copy(REST_P);
  arm.rotation.copy(REST_R);
  camera.add(arm);
  const grip = new THREE.Group();
  grip.rotation.x = -1.22;
  arm.add(grip);
  const wandMesh = elderWand();
  wandMesh.position.y = -0.012;
  const handG = hand();
  grip.add(wandMesh, handG);
  // 可切换的第二根魔杖：德拉科·马尔福的山楂木魔杖（用户提供的 GLB）
  let dracoWand = null;
  W.wandName = '老魔杖';
  W.switchWand = () => {
    const m = getModel(MODELS.wand);
    if (!m) return null;
    if (!dracoWand) {
      dracoWand = m.gltf.scene.clone(true);
      const len = m.box.max.y - m.box.min.y, k = WAND_LEN / len;
      dracoWand.scale.setScalar(k);
      dracoWand.position.set(-((m.box.min.x + m.box.max.x) / 2) * k, -m.box.min.y * k - 0.012, -((m.box.min.z + m.box.max.z) / 2) * k);
      dracoWand.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.material = o.material.clone(); o.material.envMapIntensity = 0.6; } });
      dracoWand.visible = false;
      grip.add(dracoWand);
    }
    const toDraco = !dracoWand.visible;
    dracoWand.visible = toDraco;
    wandMesh.visible = !toDraco;
    W.wandName = toDraco ? '德拉科的山楂木魔杖' : '老魔杖';
    return W.wandName;
  };
  {
    const skin = handG.userData.skin, base = skin.color.clone();
    W.dayHooks = W.dayHooks || [];
    W.dayHooks.push((day) => skin.color.copy(base).multiplyScalar(day ? 0.42 : 1));
  }
  const tip = new THREE.Object3D();
  tip.position.y = WAND_LEN - 0.012;
  grip.add(tip);
  const tipGlowMat = new THREE.SpriteMaterial({ map: T.glowTex(), color: new THREE.Color(3, 2.6, 1.6), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const tipGlow = new THREE.Sprite(tipGlowMat);
  tipGlow.scale.setScalar(0.0001);
  tip.add(tipGlow);
  // 魔杖尖的光（Lumos）
  const lumos = new THREE.PointLight('#cfe0ff', 0, 14, 2);
  tip.add(lumos);
  arm.traverse((o) => { o.frustumCulled = false; if (o.isMesh) o.renderOrder = 2; });

  // ---- 专用灯光：咒语闪光 / 光球 ----
  const spellLight = new THREE.PointLight('#ffffff', 0, 18, 2);
  scene.add(spellLight);
  const ballLight = new THREE.PointLight('#dfe8ff', 0, 26, 2);
  scene.add(ballLight);

  const S = {
    tip, idx: 0, lumosOn: false, wandColor: new THREE.Color('#ffd36a'),
    swing: null, kick: 0,
  };
  const tipPos = () => tip.getWorldPosition(new V3());
  const camDir = () => camera.getWorldDirection(new V3());

  W.setWandColor = (c) => { S.wandColor = new THREE.Color(c); };
  W.burst = (p, col, n = 60, sp = 3) => {
    for (let i = 0; i < n; i++) {
      const v = new V3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize().multiplyScalar(rnd(0.5, sp));
      fx.sparks.emit({ p: p.clone(), v, life: rnd(0.5, 1.3), size: rnd(0.04, 0.1), c: col, drag: 2, g: -1.5 });
    }
  };
  W.wandBurst = (col, n) => { S.kick = 1; startSwing('flick', 0.5, 0.12, () => W.burst(tipPos(), col, n)); };

  // ---- 冲击波光环 ----
  const ringGeo = new THREE.RingGeometry(0.82, 1, 48);
  const rings = [];
  function shockwave(p, col, size = 3.2) {
    const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(1.6), transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    m.position.copy(p);
    m.lookAt(camera.position);
    scene.add(m);
    rings.push({ m, t: 0, size });
  }
  let flash = 0;
  function lightFlash(p, col, power = 60) {
    spellLight.position.copy(p);
    spellLight.color.copy(col);
    flash = power;
  }

  // ---- 挥杖动作 ----
  function startSwing(motion, dur, release, onRelease) {
    S.swing = { motion, dur, release, onRelease, t: 0, fired: false };
  }
  const off = { p: new V3(), r: new V3() };
  function swingPose(sw) {
    const t = sw.t;
    off.p.set(0, 0, 0); off.r.set(0, 0, 0);
    if (sw.motion === 'flick') {
      if (t < 0.12) { const k = ease(t / 0.12); off.r.set(0.55 * k, 0.12 * k, -0.25 * k); off.p.set(0.02 * k, 0.05 * k, 0.04 * k); }
      else if (t < 0.22) { const k = ease((t - 0.12) / 0.1); off.r.set(0.55 - 1.2 * k, 0.12 - 0.3 * k, -0.25 + 0.35 * k); off.p.set(0.02 - 0.05 * k, 0.05 - 0.07 * k, 0.04 - 0.14 * k); }
      else { const k = ease(Math.min(1, (t - 0.22) / (sw.dur - 0.22))); off.r.set(-0.65 * (1 - k), -0.18 * (1 - k), 0.1 * (1 - k)); off.p.set(-0.03 * (1 - k), -0.02 * (1 - k), -0.1 * (1 - k)); }
    } else if (sw.motion === 'raise') {
      if (t < 0.3) { const k = ease(t / 0.3); off.r.set(0.95 * k, -0.15 * k, 0); off.p.set(-0.04 * k, 0.12 * k, -0.06 * k); }
      else { const k = ease(Math.min(1, (t - 0.3) / (sw.dur - 0.3))); off.r.set(0.95 * (1 - k), -0.15 * (1 - k), 0); off.p.set(-0.04 * (1 - k), 0.12 * (1 - k), -0.06 * (1 - k)); }
    } else if (sw.motion === 'thrust') {
      if (t < 0.14) { const k = ease(t / 0.14); off.r.set(0.2 * k, 0, 0); off.p.set(0, 0.02 * k, 0.06 * k); }
      else if (t < 1.35) { const k = ease(Math.min(1, (t - 0.14) / 0.12)); const j = Math.sin(t * 40) * 0.01; off.r.set(0.2 - 0.32 * k + j, Math.sin(t * 3) * 0.06, 0); off.p.set(0, 0.02 - 0.03 * k, 0.06 - 0.16 * k); }
      else { const k = ease(Math.min(1, (t - 1.35) / (sw.dur - 1.35))); off.r.set(-0.12 * (1 - k), 0, 0); off.p.set(0, -0.01 * (1 - k), -0.1 * (1 - k)); }
    } else if (sw.motion === 'circle') {
      if (t < 0.7) {
        const a = (t / 0.7) * Math.PI * 2, k = Math.sin((t / 0.7) * Math.PI), rp = ease(Math.min(1, t / 0.12));
        off.r.set((0.25 + Math.sin(a) * 0.35 * (0.4 + k)) * rp, Math.cos(a) * 0.35 * (0.4 + k) * rp, 0);
        off.p.set(Math.cos(a) * 0.04 * rp, (0.04 + Math.sin(a) * 0.04) * rp, -0.02 * rp);
      } else if (t < 0.82) { const k = ease((t - 0.7) / 0.12); off.r.set(0.25 - 0.6 * k, 0.14 * (1 - k), 0); off.p.set(0.04 * (1 - k), 0.04 - 0.04 * k, -0.02 - 0.12 * k); }
      else { const k = ease(Math.min(1, (t - 0.82) / (sw.dur - 0.82))); off.r.set(-0.35 * (1 - k), 0, 0); off.p.set(0, 0, -0.14 * (1 - k)); }
    }
    return off;
  }

  // ---- 咒语实现 ----
  const bolts = [];
  function expelliarmus() {
    const p = tipPos(), d = camDir();
    const col = new THREE.Color(2.6, 0.35, 0.22);
    bolts.push({ p, v: d.multiplyScalar(30), life: 1.6, col, base: new THREE.Color('#ff3a2a'), ph: 0 });
    for (let i = 0; i < 40; i++) fx.sparks.emit({ p: p.clone(), v: new V3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).multiplyScalar(1.5), life: rnd(0.2, 0.5), size: rnd(0.03, 0.07), c: col, drag: 4 });
    lightFlash(p, new THREE.Color('#ff5a3a'), 25);
    W.sfx.zap();
  }

  const ball = { on: false, life: 0, p: new V3(), v: new V3(), sprite: null };
  ball.sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.glowTex(), color: new THREE.Color(4, 4.4, 5), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  ball.sprite.visible = false;
  scene.add(ball.sprite);
  function lumosMaxima() {
    const p = tipPos(), d = camDir();
    ball.on = true; ball.life = 12;
    ball.p.copy(p);
    ball.v.copy(d).multiplyScalar(5.5); ball.v.y += 1.6;
    ball.sprite.visible = true;
    W.burst(p, new THREE.Color(3, 3.2, 3.6), 60, 2);
    W.sfx.chime();
  }

  let flame = 0;
  function incendio() { flame = 1.2; W.sfx.roar(20); }

  const stags = [];
  function patronus() {
    const p = tipPos(), d = camDir();
    d.y = 0; d.normalize();
    const s = patronusStag();
    s.position.set(p.x + d.x * 0.8, 0, p.z + d.z * 0.8);
    s.rotation.y = Math.atan2(d.x, d.z);
    s.scale.setScalar(0.01);
    scene.add(s);
    stags.push({ s, d, t: 0 });
    for (let i = 0; i < 120; i++) {
      const v = d.clone().multiplyScalar(rnd(1, 4)).add(new V3(rnd(-1, 1), rnd(-0.5, 1.2), rnd(-1, 1)));
      if (i % 3 === 0) fx.smoke.emit({ p: p.clone(), v, life: rnd(0.8, 1.6), size: 0.1, sizeEnd: 0.7, alpha: 0.1, drag: 1.5, c: new THREE.Color(0.75, 0.9, 1.0) });
      fx.sparks.emit({ p: p.clone(), v: v.multiplyScalar(1.2), life: rnd(0.6, 1.4), size: rnd(0.03, 0.08), drag: 1.2, c: new THREE.Color(1.6, 2.2, 3.2) });
    }
    W.sfx.chime();
  }
  const IMPL = [expelliarmus, lumosMaxima, incendio, patronus];

  S.select = (i) => {
    S.idx = (i + SPELLS.length) % SPELLS.length;
    S.wandColor = new THREE.Color(SPELLS[S.idx].col);
    W.onSpellSelect && W.onSpellSelect(S.idx);
  };
  S.cast = (i = S.idx) => {
    if (S.swing && S.swing.t < S.swing.dur * 0.75) return false;
    const sp = SPELLS[i];
    startSwing(sp.motion, sp.dur, sp.release, IMPL[i]);
    W.say(`${sp.cn}！（${sp.en}）`, 1.6);
    return true;
  };
  S.toggleLumos = () => { S.lumosOn = !S.lumosOn; W.say(S.lumosOn ? '荧光闪烁！(Lumos)' : '诺克斯！(Nox)', 1.5); W.sfx.chime(); };

  // ---- 每帧 ----
  const tmp = new V3();
  S.update = (dt, bob, moving) => {
    // 挥杖
    let o = null;
    if (S.swing) {
      const sw = S.swing;
      sw.t += dt;
      if (!sw.fired && sw.t >= sw.release) { sw.fired = true; sw.onRelease && sw.onRelease(); }
      o = swingPose(sw);
      if (sw.t >= sw.dur) S.swing = null;
    }
    const bx = moving ? Math.cos(bob * 0.5) * 0.008 : 0, by = moving ? Math.abs(Math.sin(bob * 0.5)) * 0.01 : 0;
    arm.position.set(REST_P.x + bx + (o ? o.p.x : 0), REST_P.y + by + (o ? o.p.y : 0), REST_P.z + (o ? o.p.z : 0));
    arm.rotation.set(REST_R.x + (o ? o.r.x : 0), REST_R.y + (o ? o.r.y : 0), REST_R.z + (o ? o.r.z : 0));
    S.kick = Math.max(0, S.kick - dt * 4);

    // 杖尖辉光
    const lumTarget = S.lumosOn ? 7 : 0;
    lumos.intensity += (lumTarget - lumos.intensity) * Math.min(1, dt * 8);
    const charging = S.swing && !S.swing.fired ? Math.min(1, S.swing.t / S.swing.release) : 0;
    tipGlow.scale.setScalar(0.0001 + (lumos.intensity / 7) * 0.12 + charging * 0.09 + (flame > 0 ? 0.12 : 0));
    tipGlowMat.color.copy(S.lumosOn ? new THREE.Color(3, 3.2, 3.6) : S.wandColor.clone().multiplyScalar(3));
    const tp = tipPos();
    if (Math.random() < dt * (8 + charging * 60)) {
      fx.sparks.emit({ p: tp.clone(), v: new V3(rnd(-0.05, 0.05), rnd(0.05, 0.15), rnd(-0.05, 0.05)), life: 0.6, size: 0.012 + charging * 0.02, c: S.wandColor.clone().multiplyScalar(2) });
    }

    // 除你武器光弹：螺旋拖尾
    let litBolt = null;
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i];
      b.life -= dt;
      const steps = 6;
      let hit = false;
      for (let s = 0; s < steps && !hit; s++) {
        b.p.addScaledVector(b.v, dt / steps);
        b.ph += dt / steps * 40;
        if (pointBlocked(b.p)) hit = true;
        else if (npcHitTest(W, b.p)) hit = true;
        // 两条螺旋
        const dir = tmp.copy(b.v).normalize();
        const side = new V3().crossVectors(dir, new V3(0, 1, 0)).normalize();
        const up = new V3().crossVectors(side, dir);
        for (const sgn of [1, -1]) {
          const q = b.p.clone().addScaledVector(side, Math.cos(b.ph) * 0.09 * sgn).addScaledVector(up, Math.sin(b.ph) * 0.09 * sgn);
          fx.sparks.emit({ p: q, v: new V3(rnd(-0.2, 0.2), rnd(-0.2, 0.2), rnd(-0.2, 0.2)), life: rnd(0.3, 0.6), size: rnd(0.04, 0.07), c: sgn > 0 ? b.col : new THREE.Color(2.4, 1.6, 1.2) });
        }
      }
      fx.fire.emit({ p: b.p.clone(), life: 0.1, size: 0.6, c: b.col.clone().multiplyScalar(0.7) });
      fx.fire.emit({ p: b.p.clone(), life: 0.06, size: 0.25, c: new THREE.Color(3, 2.4, 2.2) });
      if (hit || b.life <= 0) {
        W.burst(b.p, b.col, 160, 5);
        W.burst(b.p, new THREE.Color(3, 2.6, 2.2), 50, 3);
        shockwave(b.p, b.base, 3.5);
        lightFlash(b.p, b.base, 90);
        bolts.splice(i, 1);
        continue;
      }
      litBolt = b;
    }

    // 火焰熊熊：持续喷火
    if (flame > 0) {
      flame -= dt;
      const d = camDir();
      const nf = Math.max(1, Math.round(dt * 200));
      for (let k = 0; k < nf; k++) {
        const v = d.clone().multiplyScalar(rnd(7, 11)).add(new V3(rnd(-0.6, 0.6), rnd(-0.3, 0.8), rnd(-0.6, 0.6)));
        const age = Math.random() * 0.04;
        fx.fire.emit({ p: tp.clone().addScaledVector(d, 0.3).addScaledVector(v, age), v, life: rnd(0.4, 0.7), size: rnd(0.06, 0.14), sizeEnd: rnd(0.6, 1.1), drag: 1.8, g: 1.5, alpha: 0.55, c: new THREE.Color(rnd(1.3, 1.8), rnd(0.45, 0.75), 0.12) });
      }
      if (Math.random() < 0.6) fx.smoke.emit({ p: tp.clone().addScaledVector(d, 3), v: d.clone().multiplyScalar(2).add(new V3(0, 1.2, 0)), life: 2.5, size: 0.6, sizeEnd: 2.5, alpha: 0.25, c: new THREE.Color(0.2, 0.18, 0.17) });
      // 喷到 NPC
      for (let s = 1; s <= 4; s++) { if (npcHitTest(W, tp.clone().addScaledVector(d, s * 1.2))) { flame = Math.min(flame, 0.15); break; } }
      spellLight.position.copy(tp).addScaledVector(d, 2.5);
      spellLight.color.set('#ff7a2a');
      flash = Math.max(flash, 28 + Math.random() * 14);
    }

    // 守护神雄鹿
    for (let i = stags.length - 1; i >= 0; i--) {
      const st = stags[i];
      st.t += dt;
      const L = 4.2;
      const grow = Math.min(1, st.t / 0.45), fade = st.t > L - 1 ? Math.max(0, (L - st.t) / 1) : 1;
      st.s.scale.setScalar(0.01 + ease(grow) * 0.99);
      st.s.userData.mat.opacity = 0.62 * fade * (0.85 + Math.sin(st.t * 18) * 0.08);
      const speed = 4.2;
      st.s.position.addScaledVector(st.d, speed * dt);
      const ph = st.t * 9;
      st.s.userData.legs.forEach((lg, k) => { lg.rotation.x = Math.sin(ph + (k < 2 ? 0 : Math.PI) + (k % 2) * 0.6) * 0.55; });
      st.s.position.y = Math.abs(Math.sin(ph)) * 0.18;
      st.s.userData.head.rotation.x = -0.6 + Math.sin(ph) * 0.06;
      for (let k = 0; k < 6; k++) {
        const q = st.s.position.clone().add(new V3(rnd(-0.3, 0.3), rnd(0.4, 1.8), rnd(-0.6, 0.6)));
        fx.sparks.emit({ p: q, v: new V3(rnd(-0.2, 0.2), rnd(0, 0.4), rnd(-0.2, 0.2)).addScaledVector(st.d, -1), life: rnd(0.5, 1.2), size: rnd(0.025, 0.06), c: new THREE.Color(1.4, 2.0, 3.0).multiplyScalar(fade), drag: 1 });
      }
      spellLight.position.copy(st.s.position).add(new V3(0, 1.3, 0));
      spellLight.color.set('#9fd0ff');
      flash = Math.max(flash, 30 * fade);
      if (st.t > L) {
        for (let k = 0; k < 120; k++) fx.sparks.emit({ p: st.s.position.clone().add(new V3(rnd(-0.4, 0.4), rnd(0.3, 1.9), rnd(-0.7, 0.7))), v: new V3(rnd(-1, 1), rnd(-0.2, 1.4), rnd(-1, 1)), life: rnd(0.6, 1.6), size: rnd(0.03, 0.07), c: new THREE.Color(1.4, 2.0, 3.0), drag: 1.5 });
        scene.remove(st.s);
        stags.splice(i, 1);
      }
    }

    // 光弹跟随光
    if (litBolt) { spellLight.position.copy(litBolt.p); spellLight.color.copy(litBolt.base); flash = Math.max(flash, 22); }
    spellLight.intensity = flash;
    flash *= Math.pow(0.02, dt);

    // 冲击波
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.t += dt;
      const k = r.t / 0.5;
      r.m.scale.setScalar(0.2 + ease(Math.min(1, k)) * r.size);
      r.m.material.opacity = Math.max(0, 1 - k);
      r.m.lookAt(camera.position);
      if (k >= 1) { scene.remove(r.m); r.m.material.dispose(); rings.splice(i, 1); }
    }

    // 荧光闪烁·最强：悬浮光球
    if (ball.on) {
      ball.life -= dt;
      ball.v.multiplyScalar(Math.pow(0.25, dt));
      const prev = ball.p.clone();
      ball.p.addScaledVector(ball.v, dt);
      if (pointBlocked(ball.p)) { ball.p.copy(prev); ball.v.set(0, 0, 0); }
      ball.p.y = Math.min(ball.p.y, 3.6);
      const fade = Math.min(1, ball.life / 1.5);
      const wob = Math.sin(ball.life * 3) * 0.05;
      ball.sprite.position.set(ball.p.x, ball.p.y + wob, ball.p.z);
      ball.sprite.scale.setScalar((0.9 + Math.sin(ball.life * 7) * 0.05) * fade + 0.0001);
      ballLight.position.copy(ball.sprite.position);
      ballLight.intensity = 36 * fade;
      if (Math.random() < 0.5) fx.sparks.emit({ p: ball.sprite.position.clone().add(new V3(rnd(-0.2, 0.2), rnd(-0.2, 0.2), rnd(-0.2, 0.2))), v: new V3(rnd(-0.1, 0.1), rnd(-0.3, 0.1), rnd(-0.1, 0.1)), life: 1, size: 0.03, c: new THREE.Color(2.5, 2.7, 3) });
      if (ball.life <= 0) { ball.on = false; ball.sprite.visible = false; ballLight.intensity = 0; }
    }
  };

  S.select(0);
  return S;
}
