import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildWorld } from './world.js';
import { Particles, mergeStatic, V3, clamp, START_Z, END_Z, PLAZA_Z, SH } from './util.js';
import * as T from './textures.js';
import { sfx } from './audio.js';
import { createSpells, SPELLS } from './spells.js';
import { createTour } from './tour.js';
import { loadModels } from './models.js';
import { DUMBLEDORE_GLB, MODEL_LOAD } from './characters.js';

// ---------------------------------------------------------------- 渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.03, 700);
camera.position.set(0, 1.65, -1.5);
scene.add(camera);

const fx = {
  sparks: new Particles(3500, T.sparkTex()),
  fire: new Particles(2000, T.glowTex()),
  smoke: new Particles(1200, T.smokeTex(), THREE.NormalBlending),
};
Object.values(fx).forEach((p) => scene.add(p.points));

// ---------------------------------------------------------------- HUD
const $ = (id) => document.getElementById(id);
let msgTimer = 0;
function say(text, sec = 5) {
  $('msg').textContent = text;
  $('msg').classList.add('show');
  msgTimer = sec;
}

const W = {
  scene, camera, fx, sfx, say,
  colliders: [], interactables: [], zones: [], updaters: [],
  npcs: [], walkers: [], lightSources: [], doors: [],
};

// ---------------------------------------------------------------- 碰撞
const R = 0.32;
function collide(p) {
  for (let it = 0; it < 3; it++) {
    for (const c of W.colliders) {
      if (c.off) continue;
      if (c.circle) {
        const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = c.r + R;
        if (d < m && d > 1e-6) { p.x = c.x + (dx / d) * m; p.z = c.z + (dz / d) * m; }
        continue;
      }
      if (p.x < c.minX - R || p.x > c.maxX + R || p.z < c.minZ - R || p.z > c.maxZ + R) continue;
      const cx = clamp(p.x, c.minX, c.maxX), cz = clamp(p.z, c.minZ, c.maxZ);
      const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
      if (d2 >= R * R) continue;
      if (d2 > 1e-10) {
        const d = Math.sqrt(d2);
        p.x = cx + (dx / d) * R; p.z = cz + (dz / d) * R;
      } else {
        const l = p.x - c.minX, r = c.maxX - p.x, b = p.z - c.minZ, f = c.maxZ - p.z;
        const m = Math.min(l, r, b, f);
        if (m === l) p.x = c.minX - R; else if (m === r) p.x = c.maxX + R; else if (m === b) p.z = c.minZ - R; else p.z = c.maxZ + R;
      }
    }
  }
}
function pointBlocked(p) {
  if (p.y < 0.02) return true;
  for (const c of W.colliders) {
    if (c.off) continue;
    if (c.circle) { if (Math.hypot(p.x - c.x, p.z - c.z) < c.r && p.y < 3) return true; continue; }
    if (p.x > c.minX && p.x < c.maxX && p.z > c.minZ && p.z < c.maxZ && p.y < 30) return true;
  }
  return false;
}

// ---------------------------------------------------------------- 魔杖与咒语
const spells = createSpells(W, camera, pointBlocked);
W.spells = spells;

// ---------------------------------------------------------------- 构建世界
// 先加载人物模型（邓布利多 GLB），失败时自动回退到程序化人物
$('loading') && ($('loading').textContent = '正在加载人物模型…');
await loadModels(MODEL_LOAD);
buildWorld(W);
mergeStatic(scene);

// 天空环境贴图：湿润石板与玻璃的反射（昼夜切换时重新生成）
const pmrem = new THREE.PMREMGenerator(renderer);
function regenEnv() {
  const old = scene.environment;
  scene.environment = pmrem.fromScene(W.envScene, 0.02).texture;
  if (old) old.dispose();
}
regenEnv();

// ---------------------------------------------------------------- 灯光池
// 场景里登记了上百个光源，但只用少量真实 PointLight：每帧分配给离镜头最近的光源。
// 灯光数量恒定 => 不会触发着色器重新编译；新分配的灯淡入，避免突兀闪烁。
const POOL = 12;
const pool = [];
for (let i = 0; i < POOL; i++) {
  const L = new THREE.PointLight('#ffffff', 0, 10, 2);
  scene.add(L);
  pool.push({ L, src: null, f: 0 });
}
W.extMul = W.extMul ?? 1;
const srcI = (s) => s.intensity * (s.ext ? W.extMul : 1);
const _sorted = [];
function updateLightPool(dt) {
  const p = camera.position;
  _sorted.length = 0;
  for (const s of W.lightSources) {
    const I = srcI(s);
    if (I <= 0.01) continue; // 白天熄灭的街灯/蜡烛不占槽位
    const d = Math.hypot(s.p.x - p.x, (s.p.y - p.y) * 0.5, s.p.z - p.z);
    // 强光源权重更高；已分配的光源有滞后，避免来回切换
    s._score = s.always ? -1e9 : d / Math.sqrt(I / 12) - (s._slot ? 2.5 : 0);
    _sorted.push(s);
  }
  _sorted.sort((a, b) => a._score - b._score);
  const want = new Set(_sorted.slice(0, POOL));
  // 释放不再需要的槽位
  for (const sl of pool) if (sl.src && !want.has(sl.src)) { sl.src._slot = null; sl.src = null; sl.f = 0; }
  for (const s of want) {
    if (s._slot) continue;
    const sl = pool.find((x) => !x.src);
    if (!sl) break;
    sl.src = s; s._slot = sl; sl.f = s.always || W.instantLights ? 1 : 0;
  }
  for (const sl of pool) {
    const L = sl.L;
    if (!sl.src) { L.intensity = 0; continue; }
    sl.f = Math.min(1, sl.f + dt * 2.5);
    const s = sl.src;
    L.position.copy(s.p);
    L.color.copy(s.color);
    L.distance = s.distance;
    // 轻微的火焰摇曳
    L.intensity = srcI(s) * sl.f * (s.always ? 1 : 0.94 + Math.sin(performance.now() * 0.011 + s.p.x * 3.1 + s.p.z) * 0.03 + Math.random() * 0.03);
  }
}

// ---------------------------------------------------------------- 后期
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.5, 0.45, 0.92);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------------------------------------------------------------- 昼夜切换
W.isDay = false;
function applyDay(day) {
  W.isDay = day;
  W.setDay(day);
  renderer.toneMappingExposure = day ? 1.0 : 1.3;
  bloom.strength = day ? 0.18 : 0.5;
  bloom.threshold = day ? 0.97 : 0.9;
  regenEnv();
  const b = $('dayBtn');
  if (b) b.textContent = day ? '切换到夜晚 (N)' : '切换到白天 (N)';
}
W.applyDay = applyDay;

// ---------------------------------------------------------------- 咒语栏
const spellBar = $('spells');
spellBar.innerHTML = SPELLS.map((s, i) => `<div class="sp" data-i="${i}"><b>${i + 1}</b>${s.cn}<small>${s.en}</small></div>`).join('');
W.onSpellSelect = (i) => spellBar.querySelectorAll('.sp').forEach((el, k) => el.classList.toggle('on', k === i));
W.onSpellSelect(0);

// ---------------------------------------------------------------- 控制
const controls = new PointerLockControls(camera, document.body);
const overlay = $('overlay');
const tour = createTour(W, camera, {
  onStart() { document.body.classList.add('touring'); overlay.classList.add('hidden'); W.touring = true; },
  onEnd() {
    document.body.classList.remove('touring');
    W.touring = false;
    if (!controls.isLocked) { overlay.classList.remove('hidden'); $('start').textContent = '继续探索'; }
  },
});
W.tour = tour;
$('start').addEventListener('click', () => { sfx.init(); controls.lock(); });
$('tourBtn').addEventListener('click', () => { sfx.init(); tour.start(); });
$('dayBtn')?.addEventListener('click', () => applyDay(!W.isDay));
controls.addEventListener('lock', () => { overlay.classList.add('hidden'); if (tour.active) tour.stop(); });
controls.addEventListener('unlock', () => {
  if (tour.active) return;
  overlay.classList.remove('hidden');
  $('start').textContent = '继续探索';
});

const keys = {};
addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'KeyN') { applyDay(!W.isDay); say(W.isDay ? '阳光洒满了对角巷。' : '夜幕降临，蜡烛与街灯亮了起来。', 2.5); return; }
  if (tour.active) {
    if (e.code === 'KeyT' || e.code === 'Escape') tour.stop();
    return;
  }
  if (!controls.isLocked) return;
  if (e.code === 'KeyE' && W.bus?.riding) { if (W.bus.state === 'stop') W.bus.alight(); else say('车还在开！等到站再下车吧。', 2); return; }
  if (e.code === 'KeyV') { const n = W.switchWand?.(); if (n) say(`你换上了「${n}」。`, 2.5); }
  if (e.code === 'KeyE' && currentInteract) currentInteract.action();
  if (e.code === 'KeyL') spells.toggleLumos();
  if (e.code === 'KeyM') $('minimap').classList.toggle('hidden');
  if (e.code === 'KeyT') { controls.unlock(); tour.start(); }
  const n = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code);
  if (n >= 0) spells.select(n);
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
addEventListener('mousedown', (e) => {
  if (!controls.isLocked || e.button !== 0) return;
  spells.cast();
});
addEventListener('wheel', (e) => {
  if (!controls.isLocked) return;
  spells.select(spells.idx + (e.deltaY > 0 ? 1 : -1));
}, { passive: true });

// ---------------------------------------------------------------- 小地图
const mm = $('minimap'), mctx = mm.getContext('2d');
const MS = 1.9, MX0 = -18, MZ0 = END_Z - 6;
mm.width = 36 * MS + 8;
mm.height = (START_Z - MZ0 + 2) * MS + 8;
const mapX = (x) => (x - MX0) * MS + 4;
const mapY = (z) => (z - MZ0) * MS + 4;
const mapBg = document.createElement('canvas');
mapBg.width = mm.width; mapBg.height = mm.height;
{
  const g = mapBg.getContext('2d');
  g.fillStyle = 'rgba(20,14,8,0.75)';
  g.fillRect(0, 0, mm.width, mm.height);
  g.fillStyle = '#6a5a44';
  g.fillRect(mapX(-SH), mapY(PLAZA_Z), SH * 2 * MS, (START_Z - PLAZA_Z) * MS);
  g.fillRect(mapX(-17), mapY(END_Z), 34 * MS, (PLAZA_Z - END_Z) * MS);
  g.fillStyle = '#d8d0c0';
  g.fillRect(mapX(-18), mapY(END_Z - 6), 36 * MS, 6 * MS);
  g.beginPath(); g.arc(mapX(0), mapY(END_Z), 6 * MS, 0, Math.PI); g.fill();
  for (const z of W.zones) {
    if (z.name.includes('古灵阁') || z.name.includes('破釜')) continue;
    g.fillStyle = '#c9a227';
    g.fillRect(mapX(z.minX), mapY(z.maxZ), (z.maxX - z.minX) * MS, (z.minZ - z.maxZ) * MS);
  }
}
const _np = new V3();
function drawMap() {
  if (mm.classList.contains('hidden')) return;
  mctx.clearRect(0, 0, mm.width, mm.height);
  mctx.drawImage(mapBg, 0, 0);
  // 街上的人物
  mctx.fillStyle = '#9fd0ff';
  for (const n of W.npcs) {
    n.ch.root.getWorldPosition(_np);
    mctx.beginPath(); mctx.arc(mapX(_np.x), mapY(_np.z), 1.6, 0, Math.PI * 2); mctx.fill();
  }
  const p = camera.position, d = camera.getWorldDirection(new V3());
  if (W.bus) {
    mctx.fillStyle = '#9a5cff';
    mctx.fillRect(mapX(W.bus.x) - 2 * W.bus.squeeze, mapY(W.bus.z) - 6, 4 * W.bus.squeeze, 12);
  }
  const a = Math.atan2(d.z, d.x);
  mctx.save();
  mctx.translate(mapX(p.x), mapY(p.z));
  mctx.rotate(a);
  mctx.fillStyle = '#ff5a3a';
  mctx.beginPath(); mctx.moveTo(7, 0); mctx.lineTo(-5, 4.5); mctx.lineTo(-3, 0); mctx.lineTo(-5, -4.5); mctx.closePath(); mctx.fill();
  mctx.restore();
}

// ---------------------------------------------------------------- 主循环
const clock = new THREE.Clock();
let t = 0, bob = 0, currentInteract = null, currentZone = '';
const fwd = new V3(), right = new V3(), move = new V3();

function update(dt) {
  t += dt;
  // ---- 移动 ----
  let moving = false;
  if (tour.active) {
    tour.update(dt);
  } else if (W.bus?.riding) {
    // 乘坐骑士公共汽车：镜头由 extras.js 固定在车厢里，只能转头
  } else if (controls.isLocked) {
    camera.getWorldDirection(fwd);
    fwd.y = 0; fwd.normalize();
    right.crossVectors(fwd, camera.up).normalize();
    move.set(0, 0, 0);
    if (keys.KeyW || keys.ArrowUp) move.add(fwd);
    if (keys.KeyS || keys.ArrowDown) move.sub(fwd);
    if (keys.KeyD || keys.ArrowRight) move.add(right);
    if (keys.KeyA || keys.ArrowLeft) move.sub(right);
    moving = move.lengthSq() > 0;
    if (moving) {
      const speed = keys.ShiftLeft || keys.ShiftRight ? 6.5 : 3.2;
      move.normalize().multiplyScalar(speed * dt);
      const steps = Math.ceil(move.length() / 0.15);
      for (let i = 0; i < steps; i++) {
        camera.position.addScaledVector(move, 1 / steps);
        collide(camera.position);
      }
      bob += dt * speed * 2.2;
    }
    camera.position.y = 1.65 + (moving ? Math.sin(bob) * 0.03 : 0);
  }
  spells.update(dt, bob, moving);

  // ---- 世界更新 ----
  for (const f of W.updaters) f(dt, t);
  for (const p of Object.values(fx)) p.update(dt);
  updateLightPool(dt);

  // ---- 交互提示 ----
  currentInteract = null;
  let best = 1e9;
  camera.getWorldDirection(fwd);
  for (const it of W.interactables) {
    const dx = it.pos.x - camera.position.x, dz = it.pos.z - camera.position.z;
    const d = Math.hypot(dx, dz);
    if (d > it.r) continue;
    const facing = (dx * fwd.x + dz * fwd.z) / Math.max(0.001, d * Math.hypot(fwd.x, fwd.z));
    if (facing < 0.25 && d > 0.8) continue;
    const score = d - facing;
    if (score < best) { best = score; currentInteract = it; }
  }
  const prompt = $('prompt');
  if (currentInteract && controls.isLocked && !tour.active) { prompt.textContent = currentInteract.label(); prompt.classList.add('show'); }
  else prompt.classList.remove('show');

  // ---- 区域名称 ----
  const p = camera.position;
  let zone = '对角巷';
  for (const z of W.zones) if (p.x >= z.minX && p.x <= z.maxX && p.z >= z.minZ && p.z <= z.maxZ) { zone = z.name; break; }
  if (zone !== currentZone) {
    currentZone = zone;
    const el = $('location');
    el.textContent = zone;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  }

  if (msgTimer > 0) { msgTimer -= dt; if (msgTimer <= 0) $('msg').classList.remove('show'); }
  drawMap();
}

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  const scale = (innerHeight * renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  Object.values(fx).forEach((f) => (f.mat.uniforms.scale.value = scale));
}
addEventListener('resize', resize);
resize();

// FPS
let frames = 0, fpsT = 0, paused = false;
// 嵌入作品集时：窗口隐藏 / 最小化则暂停渲染，节省性能
addEventListener('message', (e) => {
  if (e.origin !== location.origin || e.data?.type !== 'cty:game-visibility') return;
  paused = !e.data.active;
  if (paused && controls.isLocked) controls.unlock();
  clock.getDelta();
});
renderer.setAnimationLoop(() => {
  if (paused) return;
  const dt = Math.min(0.05, clock.getDelta());
  update(dt);
  composer.render();
  frames++; fpsT += dt;
  if (fpsT > 1) { $('fps').textContent = `${frames} FPS`; frames = 0; fpsT = 0; }
});
$('loading').remove();
// 调试：?cam=x,z,yaw[,pitch] 直接定位镜头（用于截图）；&lumos 打开荧光；&cast=i 立即施咒；&sim=秒 预先模拟；&day 白天
const qs = new URLSearchParams(location.search);
applyDay(qs.has('day'));
say(W.isDay ? '欢迎来到白天的对角巷！按 N 可切换到夜晚。' : '欢迎来到夜晚的对角巷！按 N 可切换到白天。', 4);

const camParam = qs.get('cam');
if (qs.has('dbg')) setTimeout(() => {
  const hits = [];
  const bb = new THREE.Box3();
  scene.traverse((o) => { if (o.isMesh && o.visible) { bb.setFromObject(o); if (bb.containsPoint(camera.position)) hits.push(`${o.type}:${o.name || o.geometry.type}:${o.material.type}:${o.material.color?.getHexString()}:${bb.getSize(new THREE.Vector3()).toArray().map((v) => v.toFixed(1))}`); } });
  console.log('DBG bus', W.bus && JSON.stringify({ z: W.bus.z.toFixed(1), x: W.bus.x.toFixed(2), st: W.bus.state, v: W.bus.v.toFixed(1), sq: W.bus.squeeze.toFixed(2), next: W.bus.nextIdx, h: W.bus.heading }), 'enclosing', hits.length);
}, 5000);
if (camParam) {
  W.instantLights = true;
  if (qs.has('nobloom')) bloom.enabled = false;
  if (qs.has('hide')) for (const k of qs.get('hide').split(',')) { if (k === 'bus' && W.bus) W.bus.group.visible = false; if (k === 'npc') W.npcs.forEach((n) => (n.ch.root.visible = false)); }
  if (W.bus && qs.has('busz')) { W.bus.z = +qs.get('busz'); W.bus.state = 'stop'; W.bus.timer = 999; if (qs.has('busyaw')) W.bus.yaw = +qs.get('busyaw'); if (qs.has('squeeze')) W.bus.state = 'spin', W.bus.spin = 0.5; }
  if (W.bus && qs.has('ride')) W.bus.board();
  if (qs.has('wand')) W.switchWand?.();
  const [x, z, yaw, pitch = 0] = camParam.split(',').map(Number);
  camera.position.set(x, 1.65, z);
  camera.rotation.set(THREE.MathUtils.degToRad(pitch), THREE.MathUtils.degToRad(yaw), 0, 'YXZ');
  overlay.classList.add('hidden');
  if (qs.has('lumos')) spells.lumosOn = true;
  if (qs.has('spell')) spells.select(+qs.get('spell'));
  const sim = +(qs.get('sim') || 0);
  for (let i = 0; i < sim * 30; i++) {
    for (const f of W.updaters) f(1 / 30, i / 30);
    for (const p of Object.values(fx)) p.update(1 / 30);
  }
  if (qs.has('cast')) {
    const ci = +qs.get('cast'), at = +(qs.get('castT') || 0.5);
    spells.cast(ci);
    const n = Math.round(at * 30);
    for (let i = 0; i < n; i++) { spells.update(1 / 30, 0, false); for (const p of Object.values(fx)) p.update(1 / 30); }
  }
  if (qs.has('tour')) {
    const sec = +qs.get('tour');
    tour.startNow();
    let i = 0;
    for (; i < sec * 30 && tour.active; i++) {
      tour.update(1 / 30);
      spells.update(1 / 30, 0, false);
      for (const f of W.updaters) f(1 / 30, i / 30);
      for (const p of Object.values(fx)) p.update(1 / 30);
    }
    console.log('TOUR sim', (i / 30).toFixed(1), 's active=', tour.active, 'pos', camera.position.toArray().map((v) => v.toFixed(2)).join(','));
  }
}
