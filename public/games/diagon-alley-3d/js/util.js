import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ---- 场景尺寸常量 ----
export const SH = 5;        // 街道半宽 (街面 x ∈ [-5, 5])
export const DEPTH = 12;    // 建筑进深
export const GH = 4.2;      // 底层（店铺）层高
export const START_Z = 2;   // 入口砖墙
export const PLAZA_Z = -84; // 古灵阁广场起点
export const END_Z = -92;   // 古灵阁正立面

export const V3 = THREE.Vector3;
export const rnd = (a, b) => a + Math.random() * (b - a);
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** BoxGeometry whose UVs are scaled to world units (ts = meters per texture tile). */
export function boxGeo(w, h, d, ts = 1) {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) {
    for (let i = 0; i < 4; i++) {
      const k = f * 4 + i;
      uv.setXY(k, (uv.getX(k) * dims[f][0]) / ts, (uv.getY(k) * dims[f][1]) / ts);
    }
  }
  return g;
}

export function box(w, h, d, mat, x = 0, y = 0, z = 0, ts = 1) {
  const m = new THREE.Mesh(boxGeo(w, h, d, ts), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}

export function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 14) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}

export function sphere(r, mat, x = 0, y = 0, z = 0, ws = 16, hs = 12) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

/** Cylinder spanning from a to b with radius r0 at a and r1 at b. */
export function boneBetween(a, b, r0, r1, mat, seg = 8) {
  const len = a.distanceTo(b);
  const g = new THREE.CylinderGeometry(r1, r0, len, seg);
  g.translate(0, len / 2, 0);
  const m = new THREE.Mesh(g, mat);
  m.position.copy(a);
  m.quaternion.setFromUnitVectors(new V3(0, 1, 0), b.clone().sub(a).normalize());
  m.castShadow = true;
  return m;
}

/** Tube along a curve whose radius varies with t∈[0,1]. */
export function taperedTube(curve, tSeg, rSeg, rFn) {
  const frames = curve.computeFrenetFrames(tSeg, false);
  const pos = [], nor = [], uvs = [], idx = [];
  const P = new V3(), n = new V3();
  for (let i = 0; i <= tSeg; i++) {
    const t = i / tSeg;
    curve.getPointAt(t, P);
    const N = frames.normals[i], B = frames.binormals[i];
    const r = rFn(t);
    for (let j = 0; j <= rSeg; j++) {
      const v = (j / rSeg) * Math.PI * 2;
      const s = Math.sin(v), c = -Math.cos(v);
      n.set(c * N.x + s * B.x, c * N.y + s * B.y, c * N.z + s * B.z).normalize();
      pos.push(P.x + r * n.x, P.y + r * n.y, P.z + r * n.z);
      nor.push(n.x, n.y, n.z);
      uvs.push(t, j / rSeg);
    }
  }
  for (let i = 1; i <= tSeg; i++) {
    for (let j = 1; j <= rSeg; j++) {
      const a = (rSeg + 1) * (i - 1) + (j - 1), b = (rSeg + 1) * i + (j - 1);
      const c = (rSeg + 1) * i + j, d = (rSeg + 1) * (i - 1) + j;
      idx.push(a, b, d, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  return g;
}

/** GPU point-sprite particle pool with per-particle size / alpha / color. */
export class Particles {
  constructor(max, tex, blending = THREE.AdditiveBlending) {
    this.max = max;
    this.cursor = 0;
    this.pos = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.alpha = new Float32Array(max);
    this.size = new Float32Array(max);
    this.vel = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.maxLife = new Float32Array(max).fill(1);
    this.s0 = new Float32Array(max);
    this.s1 = new Float32Array(max);
    this.a0 = new Float32Array(max);
    this.grav = new Float32Array(max);
    this.drag = new Float32Array(max);
    const g = new THREE.BufferGeometry();
    const mk = (arr, n) => new THREE.BufferAttribute(arr, n).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', mk(this.pos, 3));
    g.setAttribute('pcolor', mk(this.col, 3));
    g.setAttribute('alpha', mk(this.alpha, 1));
    g.setAttribute('psize', mk(this.size, 1));
    this.geo = g;
    this.mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: tex }, scale: { value: 500 } },
      vertexShader: `
        attribute float alpha; attribute float psize; attribute vec3 pcolor;
        varying vec3 vC; varying float vA; uniform float scale;
        void main(){
          vC = pcolor; vA = alpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = psize * scale / max(0.1, -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform sampler2D map; varying vec3 vC; varying float vA;
        void main(){
          vec4 t = texture2D(map, gl_PointCoord);
          if (vA * t.a < 0.003) discard;
          gl_FragColor = vec4(vC * t.rgb, t.a * vA);
        }`,
      transparent: true,
      depthWrite: false,
      blending,
    });
    this.points = new THREE.Points(g, this.mat);
    this.points.frustumCulled = false;
    this.points.userData.dyn = true;
  }
  emit(o) {
    const i = this.cursor;
    this.cursor = (i + 1) % this.max;
    const i3 = i * 3;
    this.pos[i3] = o.p.x; this.pos[i3 + 1] = o.p.y; this.pos[i3 + 2] = o.p.z;
    const v = o.v || { x: 0, y: 0, z: 0 };
    this.vel[i3] = v.x; this.vel[i3 + 1] = v.y; this.vel[i3 + 2] = v.z;
    const c = o.c || { r: 1, g: 1, b: 1 };
    this.col[i3] = c.r; this.col[i3 + 1] = c.g; this.col[i3 + 2] = c.b;
    this.life[i] = this.maxLife[i] = o.life || 1;
    this.s0[i] = o.size ?? 0.1;
    this.s1[i] = o.sizeEnd ?? this.s0[i];
    this.a0[i] = o.alpha ?? 1;
    this.grav[i] = o.g ?? 0;
    this.drag[i] = o.drag ?? 0;
  }
  update(dt) {
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) { this.alpha[i] = 0; continue; }
      this.life[i] -= dt;
      const k = Math.max(0, this.life[i] / this.maxLife[i]);
      const i3 = i * 3;
      const dr = Math.max(0, 1 - this.drag[i] * dt);
      this.vel[i3] *= dr; this.vel[i3 + 1] = this.vel[i3 + 1] * dr + this.grav[i] * dt; this.vel[i3 + 2] *= dr;
      this.pos[i3] += this.vel[i3] * dt;
      this.pos[i3 + 1] += this.vel[i3 + 1] * dt;
      this.pos[i3 + 2] += this.vel[i3 + 2] * dt;
      this.size[i] = this.s1[i] + (this.s0[i] - this.s1[i]) * k;
      this.alpha[i] = this.a0[i] * Math.min(1, k * 2.5) * Math.min(1, (1 - k) * 12 + 0.05);
    }
    const a = this.geo.attributes;
    a.position.needsUpdate = a.pcolor.needsUpdate = a.alpha.needsUpdate = a.psize.needsUpdate = true;
  }
}

/** Merge all static single-material meshes by material to cut draw calls. */
export function mergeStatic(root) {
  root.updateMatrixWorld(true);
  const buckets = new Map();
  const remove = [];
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || Array.isArray(o.material)) return;
    for (let p = o; p; p = p.parent) if (p.userData.dyn) return;
    const src = o.geometry;
    if (!src.attributes.uv || !src.attributes.normal) return;
    const g = src.index ? src.toNonIndexed() : src.clone();
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    g.morphAttributes = {};
    g.clearGroups();
    g.applyMatrix4(o.matrixWorld);
    const key = o.material.uuid + (o.castShadow ? 's' : 'n');
    if (!buckets.has(key)) buckets.set(key, { mat: o.material, geos: [], cast: o.castShadow });
    buckets.get(key).geos.push(g);
    remove.push(o);
  });
  remove.forEach((o) => o.parent.remove(o));
  for (const b of buckets.values()) {
    const g = mergeGeometries(b.geos, false);
    if (!g) continue;
    const m = new THREE.Mesh(g, b.mat);
    m.castShadow = b.cast;
    m.receiveShadow = true;
    m.matrixAutoUpdate = false;
    root.add(m);
  }
}
