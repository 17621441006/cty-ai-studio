import * as THREE from 'three';
import { V3, rnd, pick, clamp } from './util.js';
import { hasModel, cloneStatic } from './models.js';
import { makeCharacter, CAST, MODELS } from './characters.js';
import { addLight } from './world.js';
import { nameTex } from './textures.js';

// =====================================================================
// 用户提供的模型：魔药小屋、克鲁克山、骑士公共汽车
// =====================================================================

/** 把卡通风格的贴图压暗、降饱和，并统一成场景的粗糙质感，避免“贴上去”的违和感 */
function harmonize(root, { tint = '#d6ccc0', rough = 0.9, env = 0.35 } = {}) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    const m = o.material.clone();
    m.color.multiply(new THREE.Color(tint));
    m.roughness = Math.max(m.roughness, rough);
    m.metalness = 0;
    m.envMapIntensity = env;
    o.material = m;
  });
}

// ---------------------------------------------------------------- 魔药小屋
export function potionHouse(W) {
  if (!hasModel(MODELS.potionhouse)) return;
  const h = cloneStatic(MODELS.potionhouse, { height: 6.2 });
  harmonize(h, { tint: '#c9bfb6', rough: 0.88 });
  // 夜晚窗户透出微光：复用基础色贴图作为自发光（只有亮色的窗户会明显发光）
  const mats = [];
  h.traverse((o) => {
    if (!o.isMesh) return;
    o.material.emissive = new THREE.Color('#ffb070');
    o.material.emissiveMap = o.material.map;
    mats.push(o.material);
  });
  h.position.set(-11.5, 0, -87.6);
  h.rotation.y = Math.PI * 0.32;
  W.scene.add(h);
  W.colliders.push({ circle: true, x: -11.5, z: -87.6, r: 2.9 });
  addLight(W, new V3(-9.2, 2.2, -85.6), '#ffb46a', 14, 9);
  W.dayHooks = W.dayHooks || [];
  W.dayHooks.push((day) => mats.forEach((m) => (m.emissiveIntensity = day ? 0 : 0.16)));
  W.interactables.push({
    pos: new V3(-9.4, 1.5, -85.4), r: 3,
    label: () => '按 E 敲敲「魔药小屋」的门',
    action: () => { W.sfx.knock?.(); W.say('门里传来咕嘟咕嘟的冒泡声：「今天的复方汤剂卖完啦，明天请早！」', 5); },
  });
  W.zones.push({ name: '魔药小屋', minX: -15, maxX: -8, minZ: -91, maxZ: -84.5 });
}

// ---------------------------------------------------------------- 克鲁克山
export function crookshanks(W) {
  if (!hasModel(MODELS.grump)) return;
  const cat = cloneStatic(MODELS.grump, { length: 0.78 });
  harmonize(cat, { tint: '#e8dccc', rough: 0.95 });
  const g = new THREE.Group();
  g.add(cat);
  // 趴在神奇动物园门口的木桶上
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.72, 16), new THREE.MeshStandardMaterial({ color: '#5a3a20', roughness: 0.8 }));
  barrel.position.y = 0.36;
  barrel.castShadow = barrel.receiveShadow = true;
  g.add(barrel);
  cat.position.y = 0.72;
  cat.rotation.y = -Math.PI / 2 - 0.4;
  g.position.set(4.25, 0, -30.2);
  g.userData.dyn = true;
  W.scene.add(g);
  W.colliders.push({ circle: true, x: 4.25, z: -30.2, r: 0.42 });
  let t = 0;
  W.updaters.push((dt) => { t += dt; cat.scale.y = 1 + Math.sin(t * 1.7) * 0.025; }); // 呼吸
  W.interactables.push({
    pos: new V3(4.25, 1.2, -30.2), r: 2,
    label: () => '按 E 摸摸「克鲁克山」',
    action: () => W.say(pick(['克鲁克山：「喵……」（它很不情愿地让你摸了一下）', '克鲁克山眯起眼睛盯着你——它似乎在怀疑你口袋里藏着一只老鼠。', '克鲁克山：「呼噜噜……」赫敏的猫今天心情不错。']), 4),
  });
}

// ---------------------------------------------------------------- 骑士公共汽车
const STOPS = [
  { z: -9, name: '破釜酒吧后院', wait: 5, end: true },
  { z: -44, name: '对角巷中段', wait: 10 },
  { z: -80, name: '古灵阁广场', wait: 5, end: true },
];
const HALF_L = 3.15, HALF_W = 1.05;

export function knightBus(W) {
  if (!hasModel(MODELS.bus)) return;
  const bus = new THREE.Group();
  bus.userData.dyn = true;
  const body = new THREE.Group(); // 挤扁 / 摇晃都作用在 body 上
  bus.add(body);
  const shell = cloneStatic(MODELS.bus, { height: 5.2 });
  shell.traverse((o) => {
    if (!o.isMesh) return;
    o.material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.15, envMapIntensity: 0.9, side: THREE.DoubleSide });
  });
  body.add(shell);

  // 车厢内部：三层暖光车厢（透过窗户可见），黄铜吊灯、床铺
  const glowMat = new THREE.MeshStandardMaterial({ color: '#2a1810', emissive: '#ff9a4a', emissiveIntensity: 0.55, side: THREE.BackSide, roughness: 1 });
  const decks = [[0.62, 1.55], [2.25, 1.45], [3.8, 1.25]];
  const rooms = [];
  for (const [y, hgt] of decks) {
    const room = new THREE.Mesh(new THREE.BoxGeometry(1.55, hgt, 4.9), glowMat);
    room.position.set(0, y + hgt / 2, -0.3);
    body.add(room);
    rooms.push(room);
    const floor = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.06, 4.9), new THREE.MeshStandardMaterial({ color: '#4a2a18', roughness: 0.8 }));
    floor.position.set(0, y, -0.3);
    floor.receiveShadow = true;
    body.add(floor);
    // 黄铜床架
    for (let k = 0; k < 3; k++) {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 1.5), new THREE.MeshStandardMaterial({ color: '#7a2a2a', roughness: 0.9 }));
      bed.position.set(k % 2 ? 0.52 : -0.52, y + 0.3, -2.2 + k * 1.5);
      body.add(bed);
    }
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 2.6, 1.2) }));
    lamp.position.set(0, y + hgt - 0.18, 0.2);
    body.add(lamp);
  }
  // 车头灯
  const headMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 4.4, 3) });
  for (const s of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), headMat);
    hl.position.set(s * 0.72, 0.92, 3.08);
    body.add(hl);
  }
  // 车头牌
  const signTex = nameTex('骑士公共汽车', 'THE KNIGHT BUS');
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.38), new THREE.MeshBasicMaterial({ map: signTex, transparent: true }));
  sign.position.set(0, 2.05, 3.0);
  body.add(sign);
  // 车内光（专用灯，不占灯光池）
  const inner = new THREE.PointLight('#ffb070', 6, 7, 2);
  inner.position.set(0, 2.4, 0);
  body.add(inner);
  const headSrc = addLight(W, new V3(), '#fff0d0', 30, 16);

  // 司机厄恩和售票员斯坦
  const ernie = makeCharacter(CAST.ernie);
  ernie.root.position.set(-0.45, 0.2, 2.15);
  body.add(ernie.root);
  const stan = makeCharacter(CAST.stan);
  stan.root.position.set(0.62, 0.55, -2.75);
  stan.root.rotation.y = Math.PI / 2;
  body.add(stan.root);

  W.scene.add(bus);

  // ---- 运行状态 ----
  const B = {
    group: bus, z: STOPS[0].z, x: 0, heading: -1, yaw: Math.PI, v: 0, cruise: 6, stopIdx: 0, nextIdx: 1,
    state: 'stop', timer: 3, squeeze: 1, spin: 0, riding: false, rideStops: 0, boardStop: 0, roll: 0, pitch: 0, lastYaw: Math.PI,
  };
  W.bus = B;
  const newCruise = () => {
    const r = Math.random();
    return r < 0.3 ? rnd(2.2, 3.8) : r < 0.75 ? rnd(5.5, 9) : rnd(13, 19); // 有时慢悠悠，有时飞驰
  };
  const peds = [];
  const _wp = new V3();

  function arrive() {
    const s = STOPS[B.nextIdx];
    B.stopIdx = B.nextIdx;
    B.state = 'stop';
    B.timer = s.wait;
    B.v = 0;
    if (B.riding) {
      B.rideStops++;
      W.say(`斯坦：「${s.name}到了！停车 ${s.wait} 秒——${B.rideStops >= 2 ? '一圈坐完啦，请下车！' : '按 E 可以在这里下车。'}」`, 4);
      if (B.rideStops >= 3 || (B.rideStops >= 2 && B.stopIdx === B.boardStop)) alight();
    } else if (Math.hypot(W.camera.position.x - B.x, W.camera.position.z - B.z) < 14) {
      W.say(`骑士公共汽车「砰」地一声停在了${s.name}，售票员斯坦探出头来招呼乘客。`, 4);
    }
  }
  function depart() {
    // 终点站掉头：原地旋转 180°
    if (STOPS[B.stopIdx].end && (B.stopIdx === 0 ? B.heading > 0 : B.heading < 0)) {
      B.state = 'spin'; B.spin = 0; return;
    }
    B.nextIdx = B.stopIdx + (B.heading < 0 ? 1 : -1);
    B.cruise = newCruise();
    B.state = 'drive';
    if (B.cruise > 12) W.sfx.zap?.();
  }

  function board() {
    B.riding = true; B.rideStops = 0; B.boardStop = B.stopIdx;
    document.body.classList.add('riding');
    W.say('斯坦：「上车啦！坐稳了——厄恩，走！」（乘坐中 · 到站后按 E 下车）', 5);
  }
  function alight() {
    B.riding = false;
    document.body.classList.remove('riding');
    // 落在车尾门外的人行道一侧
    const side = new V3(1.9, 0, -2.6).applyAxisAngle(new V3(0, 1, 0), B.yaw);
    W.camera.position.set(clamp(B.x + side.x, -4.3, 4.3), 1.65, B.z + side.z);
    W.say('你下了骑士公共汽车，腿还有点发软……', 4);
  }
  B.board = board; B.alight = alight;

  // ---- 交互：售票员（上车 / 交谈）与司机 ----
  const doorPos = new V3(), driverPos = new V3();
  W.interactables.push({
    pos: doorPos, r: 3.2,
    label: () => (B.riding ? (B.state === 'stop' ? '按 E 下车' : '乘坐中……') : B.state === 'stop' ? '按 E 上车（骑士公共汽车 · 11 西可）' : '按 E 与售票员「斯坦」交谈'),
    action: () => {
      if (B.riding) { if (B.state === 'stop') alight(); return; }
      if (B.state === 'stop') { board(); return; }
      W.say(`斯坦·桑帕克：「${pick(CAST.stan.lines)}」`, 5);
      stan.gesture(1.4);
    },
  });
  W.interactables.push({
    pos: driverPos, r: 2.8,
    label: () => (B.riding ? '' : '按 E 与司机「厄恩」交谈'),
    action: () => { if (!B.riding) { W.say(`厄恩·普朗：「${pick(CAST.ernie.lines)}」`, 5); ernie.gesture(1.4); } },
  });

  const up = new V3(0, 1, 0), tmp = new V3();
  W.updaters.push((dt) => {
    const cam = W.camera.position;
    // ---- 行人检测：车身前后范围内有人 => 挤扁车身，并向空隙偏移 ----
    peds.length = 0;
    for (const n of W.npcs) {
      if (!n.ch.root.parent || n.ch.root.parent === body) continue;
      n.ch.root.getWorldPosition(_wp);
      if (Math.abs(_wp.z - B.z) < HALF_L + 3.5 + Math.abs(B.v) * 0.25 && Math.abs(_wp.x) < 4.6) peds.push(_wp.x);
    }
    if (!B.riding && !W.touring && Math.abs(cam.z - B.z) < HALF_L + 3.5 + Math.abs(B.v) * 0.25) peds.push(cam.x);
    let squeezeT = 1, xT = 0;
    if (peds.length && B.state !== 'stop') {
      const tooClose = peds.some((px) => Math.abs(px - B.x) < HALF_W + 0.5);
      if (tooClose) {
        squeezeT = 0.3;
        // 在 [-1.6, 1.6] 中选一个离所有行人最远的位置
        let best = 0, bestD = -1;
        for (let x = -1.6; x <= 1.61; x += 0.2) {
          const d = Math.min(...peds.map((px) => Math.abs(px - x)));
          if (d > bestD) { bestD = d; best = x; }
        }
        xT = best;
      }
    }
    if (B.state === 'spin') squeezeT = 0.55;
    B.squeeze += (squeezeT - B.squeeze) * Math.min(1, dt * 7);
    B.x += (xT - B.x) * Math.min(1, dt * 2.5);

    // ---- 状态机 ----
    let acc = 0;
    if (B.state === 'stop') {
      B.timer -= dt;
      if (B.timer <= 0) depart();
    } else if (B.state === 'spin') {
      B.spin += dt / 2.2;
      const k = Math.min(1, B.spin);
      const from = B.heading < 0 ? Math.PI : 0;
      B.yaw = from + Math.PI * (k * k * (3 - 2 * k));
      if (k >= 1) { B.heading = -B.heading; B.yaw = B.heading < 0 ? Math.PI : 0; depart(); }
    } else if (B.state === 'drive') {
      const target = STOPS[B.nextIdx].z;
      const dist = Math.abs(target - B.z);
      if (Math.random() < dt * 0.08) B.cruise = newCruise(); // 途中随机变速
      const vMax = Math.min(B.cruise, Math.sqrt(2 * 5 * Math.max(0, dist - 0.05)) + 0.3);
      const a = B.v < vMax ? (B.cruise > 12 ? 9 : 4.5) : -9;
      const nv = clamp(B.v + a * dt, 0, Math.max(vMax, 0));
      acc = (nv - B.v) / Math.max(dt, 1e-3);
      B.v = nv;
      B.z += B.heading * B.v * dt;
      if (dist < 0.08 || (B.heading < 0 ? B.z <= target : B.z >= target)) { B.z = target; arrive(); }
    }
    // ---- 姿态：加减速前后点头、左右摇晃 ----
    B.pitch += (clamp(-acc * 0.006, -0.06, 0.06) - B.pitch) * Math.min(1, dt * 4);
    const t = performance.now() / 1000;
    B.roll = Math.sin(t * 2.1) * 0.012 * Math.min(1, B.v / 6) + (B.state === 'spin' ? Math.sin(B.spin * Math.PI) * 0.08 : 0);
    bus.position.set(B.x, 0, B.z);
    bus.rotation.set(0, B.yaw, 0);
    body.scale.set(B.squeeze, 1 + (1 - B.squeeze) * 0.12, 1);
    body.rotation.set(B.pitch, 0, B.roll);
    bus.updateMatrixWorld(true);
    // 车头灯光源跟随
    headSrc.p.copy(tmp.set(0, 1.0, 3.6)).applyMatrix4(bus.matrixWorld);
    inner.intensity = B.riding ? 1.2 : W.isDay ? 1.5 : 6;
    stan.update(dt, 0, cam);
    ernie.update(dt, 0, cam);
    doorPos.set(0.9, 0, -2.75).applyMatrix4(bus.matrixWorld); doorPos.y = 1.5;
    driverPos.set(-0.9, 0, 2.2).applyMatrix4(bus.matrixWorld); driverPos.y = 1.5;

    // ---- 乘车：镜头固定在上层车厢前排，随车转向 ----
    rooms.forEach((r) => (r.visible = !B.riding));
    if (B.riding) {
      cam.copy(tmp.set(0.3, 3.4, 1.85)).applyMatrix4(body.matrixWorld);
      const dy = B.yaw - B.lastYaw;
      if (dy) W.camera.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(up, dy));
    } else if (!W.touring) {
      // ---- 推开挡在车身里的玩家 ----
      tmp.copy(cam).sub(bus.position).applyAxisAngle(up, -B.yaw);
      const hw = HALF_W * B.squeeze + 0.32;
      if (Math.abs(tmp.x) < hw && Math.abs(tmp.z) < HALF_L + 0.3) {
        tmp.x = tmp.x >= 0 ? hw : -hw;
        tmp.applyAxisAngle(up, B.yaw).add(bus.position);
        cam.x = clamp(tmp.x, -4.6, 4.6); cam.z = tmp.z;
      }
    }
    B.lastYaw = B.yaw;
  });
}
