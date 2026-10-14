import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

// =====================================================================
// 外部 GLB 角色模型：加载、克隆、换色，以及程序化骨骼动画（行走 / 手势 / 转头）
// 任何带骨骼的人形 GLB 都可以用：按骨骼名称自动识别髋、膝、肩、肘、头。
// 没有骨骼的静态模型（如 AI 生成的角色）可在加载时“自动绑骨”：按身体比例
// 把顶点分配给髋 / 膝 / 肩 / 肘 / 头，得到可行走、可转头的蒙皮网格。
// 所有资源都已离线减面（≤ 2.4 万面）并压缩为 meshopt + WebP。
// =====================================================================

const cache = {};
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

/** urls: 字符串，或 { url, rig: {...自动绑骨参数} } */
export async function loadModels(urls) {
  await Promise.all(urls.map(async (item) => {
    const u = typeof item === 'string' ? item : item.url;
    try {
      const g = await loader.loadAsync(u);
      if (item.rig) autoRig(g.scene, item.rig);
      g.scene.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(g.scene);
      cache[u] = { gltf: g, box };
    } catch (e) {
      console.warn('模型加载失败，使用程序化角色代替：', u, e);
    }
  }));
}
export const hasModel = (u) => !!cache[u];
export const getModel = (u) => cache[u];

/** 克隆一个静态模型（建筑 / 车辆 / 道具），按目标尺寸缩放，原点在底面中心 */
export function cloneStatic(u, { height, length, width } = {}) {
  const { gltf, box } = cache[u];
  const inner = gltf.scene.clone(true);
  const size = box.getSize(new THREE.Vector3());
  const k = height ? height / size.y : length ? length / size.z : width ? width / size.x : 1;
  inner.scale.setScalar(k);
  const c = box.getCenter(new THREE.Vector3());
  inner.position.set(-c.x * k, -box.min.y * k, -c.z * k);
  const root = new THREE.Group();
  root.add(inner);
  root.userData.dyn = true;
  inner.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    if (!o.geometry.attributes.normal) { o.geometry = toFloat(o.geometry.clone()); o.geometry.computeVertexNormals(); }
  });
  return root;
}

// ---------------------------------------------------------------- 自动绑骨
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** 量化 / 交错的属性转成普通 Float32，便于烘焙变换 */
function toFloat(geo) {
  for (const k of Object.keys(geo.attributes)) {
    const a = geo.attributes[k];
    if (a.isInterleavedBufferAttribute || a.normalized || !(a.array instanceof Float32Array)) {
      const out = new Float32Array(a.count * a.itemSize);
      const get = [a.getX, a.getY, a.getZ, a.getW];
      for (let i = 0; i < a.count; i++) for (let j = 0; j < a.itemSize; j++) out[i * a.itemSize + j] = get[j].call(a, i);
      geo.setAttribute(k, new THREE.BufferAttribute(out, a.itemSize));
    }
  }
  return geo;
}

/**
 * 给静态人形模型生成骨架和蒙皮权重。模型需面朝 +z、脚在最低点。
 * 参数均为身高比例：shoulderY 肩高、shoulderX 肩宽(半)、hipY 髋高、kneeY 膝高、
 * handY / handX 手的位置（用于确定手臂方向，A 字或自然下垂都可以）、armR 手臂粗细、neckY 颈高
 */
export function autoRig(scene, o) {
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(scene);
  const H = box.max.y - box.min.y, y0 = box.min.y;
  const cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2;
  const P = (x, y, z = 0) => new THREE.Vector3(cx + x * H, y0 + y * H, cz + z * H);
  const p = {
    shoulderY: 0.8, shoulderX: 0.11, hipY: 0.5, kneeY: 0.27, neckY: 0.86, handY: 0.5, handX: 0.16, armR: 0.075, legX: 0.06, ...o,
  };
  // 骨骼（全部在模型空间，旋转为单位阵）
  const mk = (name, pos, parent) => {
    const b = new THREE.Bone();
    b.name = name;
    const pw = parent ? parent.userData.wp : new THREE.Vector3();
    b.position.copy(pos).sub(pw);
    b.userData.wp = pos.clone();
    if (parent) parent.add(b);
    return b;
  };
  const hips = mk('Auto_Hips', P(0, p.hipY));
  const spine = mk('Auto_midSpine', P(0, (p.hipY + p.shoulderY) / 2), hips);
  const neck = mk('Auto_Neck', P(0, p.neckY), spine);
  const head = mk('Auto_Head', P(0, p.neckY + 0.02), neck);
  const sideBones = {};
  for (const [s, L] of [[1, 'l'], [-1, 'r']]) {
    const sh = P(s * p.shoulderX, p.shoulderY), hand = P(s * p.handX, p.handY);
    const el = sh.clone().lerp(hand, 0.5);
    const bs = mk(`Auto_${L}Shoulder`, sh, spine);
    const be = mk(`Auto_${L}Elbow`, el, bs);
    const hp = mk(`Auto_${L}Hip`, P(s * p.legX, p.hipY), hips);
    const kn = mk(`Auto_${L}Knee`, P(s * p.legX, p.kneeY), hp);
    sideBones[L] = { s, sh, hand, el, bs, be, hp, kn };
  }
  const bones = [];
  hips.traverse((b) => b.isBone && bones.push(b));
  const bi = (b) => bones.indexOf(b);
  const skeleton = new THREE.Skeleton(bones);
  scene.add(hips);
  scene.updateMatrixWorld(true);
  skeleton.calculateInverses();

  const meshes = [];
  scene.traverse((m) => { if (m.isMesh && !m.isSkinnedMesh) meshes.push(m); });
  const v = new THREE.Vector3(), d = new THREE.Vector3(), a = new THREE.Vector3();
  for (const m of meshes) {
    const geo = toFloat(m.geometry.clone());
    geo.applyMatrix4(m.matrixWorld); // 烘焙到模型空间
    const pos = geo.attributes.position, n = pos.count;
    const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      v.fromBufferAttribute(pos, i);
      const w = new Map();
      const add = (b, x) => { if (x > 0.001) w.set(bi(b), (w.get(bi(b)) || 0) + x); };
      const y = (v.y - y0) / H, x = (v.x - cx) / H;
      let rest = 1;
      // 手臂：沿肩->手方向的圆柱区域
      for (const L of ['l', 'r']) {
        const sb = sideBones[L];
        a.subVectors(sb.hand, sb.sh);
        const len = a.length(); a.normalize();
        d.subVectors(v, sb.sh);
        const t = d.dot(a) / len;
        const r = d.addScaledVector(a, -t * len).length() / H;
        if (Math.sign(x) === sb.s && t > -0.15 && t < 1.35 && r < p.armR * (t < 0.1 ? 1.4 : 1.0)) {
          const k = sstep(-0.1, 0.12, t) * rest;
          const kel = sstep(0.42, 0.58, t);
          add(sb.be, k * kel);
          add(sb.bs, k * (1 - kel));
          rest -= k;
        }
      }
      // 头
      if (rest > 0) { const k = sstep(p.neckY - 0.02, p.neckY + 0.03, y) * rest; add(head, k); rest -= k; }
      // 腿：髋以下按左右分配（中线附近平滑过渡，长袍不会撕裂）
      if (rest > 0 && y < p.hipY + 0.04) {
        const kLeg = sstep(p.hipY + 0.04, p.hipY - 0.08, y) * rest;
        const kl = sstep(-0.035, 0.035, x);
        const kKnee = sstep(p.kneeY + 0.05, p.kneeY - 0.05, y);
        add(sideBones.l.kn, kLeg * kl * kKnee); add(sideBones.l.hp, kLeg * kl * (1 - kKnee));
        add(sideBones.r.kn, kLeg * (1 - kl) * kKnee); add(sideBones.r.hp, kLeg * (1 - kl) * (1 - kKnee));
        rest -= kLeg;
      }
      if (rest > 0) {
        const ks = sstep(p.hipY, (p.hipY + p.shoulderY) / 2, y);
        add(spine, rest * ks); add(hips, rest * (1 - ks));
      }
      const top = [...w.entries()].sort((q, r2) => r2[1] - q[1]).slice(0, 4);
      const sum = top.reduce((s, e) => s + e[1], 0) || 1;
      top.forEach(([b, x2], j) => { si[i * 4 + j] = b; sw[i * 4 + j] = x2 / sum; });
    }
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
    geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
    const sm = new THREE.SkinnedMesh(geo, m.material);
    sm.name = m.name;
    m.parent.remove(m);
    scene.add(sm);
    sm.updateMatrixWorld(true);
    sm.bind(skeleton, new THREE.Matrix4());
  }
  // 静止姿态：把 A 字形的手臂放下来（绕 z 轴旋转肩部）
  for (const L of ['l', 'r']) {
    const sb = sideBones[L];
    const cur = Math.atan2(sb.hand.y - sb.sh.y, Math.abs(sb.hand.x - sb.sh.x)); // 负值 = 向下
    const target = -Math.PI / 2 + 0.12; // 接近竖直，略微外张
    const delta = target - cur;
    sb.bs.rotation.z = sb.s * delta;
  }
  scene.updateMatrixWorld(true);
}

const BONES = {
  lHip: /(left|[_\W]l)_?(hip|upleg|thigh)/i,
  rHip: /(right|[_\W]r)_?(hip|upleg|thigh)/i,
  lKnee: /(left|[_\W]l)_?(knee|leg$|calf|shin)/i,
  rKnee: /(right|[_\W]r)_?(knee|leg$|calf|shin)/i,
  lArm: /(left|[_\W]l)_?(shoulder|upperarm|arm$)/i,
  rArm: /(right|[_\W]r)_?(shoulder|upperarm|arm$)/i,
  lElbow: /(left|[_\W]l)_?(elbow|forearm|lowerarm)/i,
  rElbow: /(right|[_\W]r)_?(elbow|forearm|lowerarm)/i,
  head: /(^|[_\W])head(_\d+)?$/i,
  spine: /(mid_?spine|spine1|spine_?02|chest)/i,
  capeBack: /cape_?back_?mid(_\d+)?$/i,
};

const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _v = new THREE.Vector3();

/**
 * 从缓存的 GLB 生成一个角色，接口与 characters.js 的 makeCharacter 一致。
 * spec.model: url；spec.tint: { 材质名: 颜色 } 换色；spec.h: 身高系数
 * spec.ghost: 半透明发光的幽灵；spec.float: 离地漂浮高度；spec.rotY: 模型朝向修正
 */
export function modelCharacter(s, labelSprite) {
  const { gltf, box } = cache[s.model];
  const root = new THREE.Group();
  root.userData.dyn = true;
  const inner = SkeletonUtils.clone(gltf.scene);
  const H = 1.86 * (s.h || 1);
  const sc = H / (box.max.y - box.min.y);
  inner.scale.setScalar(sc);
  const baseY = -box.min.y * sc + (s.float || 0);
  inner.position.set(-((box.min.x + box.max.x) / 2) * sc, baseY, -((box.min.z + box.max.z) / 2) * sc);
  const yawWrap = new THREE.Group();
  yawWrap.rotation.y = s.rotY || 0;
  yawWrap.add(inner);
  root.add(yawWrap);

  // 材质：每个实例独立克隆，便于换色
  inner.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = !s.ghost;
    o.receiveShadow = !s.ghost;
    o.frustumCulled = false;
    const m = o.material.clone();
    if (s.tint && s.tint[m.name]) m.color.set(s.tint[m.name]);
    m.roughness = Math.max(m.roughness, 0.75);
    m.envMapIntensity = 0.4;
    if (s.ghost) {
      m.transparent = true;
      m.opacity = s.ghost.opacity ?? 0.6;
      m.depthWrite = false;
      m.emissive = new THREE.Color(s.ghost.glow || '#9fc8ff');
      m.emissiveIntensity = s.ghost.intensity ?? 0.5;
      if (m.map) m.emissiveMap = m.map;
    }
    o.material = m;
  });

  // 识别骨骼并记录静止姿态
  inner.updateMatrixWorld(true);
  const all = [];
  inner.traverse((o) => { if (o.isBone) all.push(o); });
  const B = {};
  for (const [k, re] of Object.entries(BONES)) B[k] = all.find((b) => re.test(b.name));
  const innerQ = inner.getWorldQuaternion(new THREE.Quaternion()).invert();
  const rig = {};
  for (const [k, b] of Object.entries(B)) {
    if (!b) continue;
    // 父骨骼在模型空间中的朝向 => 把模型空间的旋转轴换算到骨骼局部
    const pq = b.parent.getWorldQuaternion(new THREE.Quaternion());
    const rel = innerQ.clone().multiply(pq).invert();
    rig[k] = { b, q0: b.quaternion.clone(), toLocal: rel };
  }
  const rigged = Object.keys(rig).length > 0;
  const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
  // 依次叠加多个模型空间旋转
  function pose(k, rots) {
    const r = rig[k];
    if (!r) return;
    _q.identity();
    for (const [axis, ang] of rots) {
      if (!ang) continue;
      _v.copy(axis).applyQuaternion(r.toLocal);
      _q2.setFromAxisAngle(_v, ang);
      _q.premultiply(_q2);
    }
    r.b.quaternion.copy(_q).multiply(r.q0);
  }

  if (labelSprite) {
    labelSprite.position.y = H + 0.22 + (s.float || 0);
    root.add(labelSprite);
  }

  const armDown = s.armDown ?? 0.28; // 把 A 字姿态的手臂放下来一些
  const legAmp = s.legAmp ?? 0.42;
  const _wp = new THREE.Vector3();
  const ch = {
    root, head: rig.head?.b, body: inner, arms: [], legs: [], label: labelSprite, spec: s,
    phase: Math.random() * 6, t: Math.random() * 10, headYaw: 0, gestureT: 0, walkAmt: 0,
    gesture(sec = 1.6) { this.gestureT = sec; },
    update(dt, speed, cam) {
      this.t += dt;
      const moving = speed > 0.05;
      this.walkAmt += ((moving ? 1 : 0) - this.walkAmt) * Math.min(1, dt * 5);
      if (moving) this.phase += (dt * speed * 5.0) / (s.h || 1);
      const w = this.walkAmt, a = Math.sin(this.phase);
      let g = 0;
      if (this.gestureT > 0) { this.gestureT -= dt; g = Math.sin(Math.min(1, this.gestureT / 1.6) * Math.PI); }
      if (rigged) {
        // 腿
        pose('lHip', [[X, -a * legAmp * w]]);
        pose('rHip', [[X, a * legAmp * w]]);
        pose('lKnee', [[X, Math.max(0, Math.sin(this.phase - 1.2)) * 0.55 * w]]);
        pose('rKnee', [[X, Math.max(0, -Math.sin(this.phase - 1.2)) * 0.55 * w]]);
        // 手臂：放下 + 前后摆动 + 手势
        const breathe = Math.sin(this.t * 1.5) * 0.02;
        pose('lArm', [[Z, -armDown - breathe], [X, a * 0.3 * w]]);
        pose('rArm', [[Z, armDown + breathe], [X, -a * 0.3 * w - g * 1.25], [Y, g * 0.3]]);
        pose('rElbow', [[X, -g * 0.7 + Math.sin(this.t * 6) * 0.15 * g]]);
        pose('spine', [[Y, a * 0.06 * w], [X, 0.03 * w]]);
        pose('capeBack', [[X, -0.12 * w - Math.abs(a) * 0.05 * w + Math.sin(this.t * 1.3) * 0.02]]);
      } else {
        // 无骨骼：轻微摇摆与呼吸，说话时微微前倾
        yawWrap.rotation.z = Math.sin(this.t * 0.9) * 0.015 + a * 0.03 * w;
        yawWrap.rotation.x = g * 0.06;
      }
      const bob = s.float ? Math.sin(this.t * 1.6) * 0.12 : Math.abs(Math.cos(this.phase)) * 0.025 * w;
      inner.position.y = baseY + bob;
      // 看向玩家
      let target = 0;
      const d = root.getWorldPosition(_wp).distanceTo(cam);
      if (d < 4.5) {
        const l = root.worldToLocal(cam.clone());
        target = Math.max(-1.0, Math.min(1.0, Math.atan2(l.x, l.z)));
      }
      this.headYaw += (target - this.headYaw) * Math.min(1, dt * 3);
      if (rig.head) pose('head', [[Y, this.headYaw]]);
      else if (s.turnToCam) yawWrap.rotation.y = (s.rotY || 0) + this.headYaw * 0.6;
      if (labelSprite) {
        const want = d < 7 ? 1 : 0;
        labelSprite.material.opacity += (want - labelSprite.material.opacity) * Math.min(1, dt * 4);
        labelSprite.visible = labelSprite.material.opacity > 0.02;
      }
    },
  };
  return ch;
}
