import * as THREE from 'three';
import { V3, taperedTube, boneBetween, rnd } from './util.js';
import { scaleTex } from './textures.js';

/**
 * 古灵阁屋顶上的白色乌克兰铁肚皮龙。
 * 原点位于穹顶顶点，龙头朝向 +z（街道方向）。
 */
export function buildDragon(W) {
  const d = new THREE.Group();
  d.userData.dyn = true;

  const st = scaleTex();
  const skinTube = new THREE.MeshStandardMaterial({ color: '#d8d3c8', map: st, bumpMap: st, bumpScale: 2, roughness: 0.75, emissive: '#4a4440', emissiveMap: st, emissiveIntensity: 0.5 });
  st.repeat.set(40, 4);
  const st2 = st.clone(); st2.repeat.set(3, 3); st2.needsUpdate = true;
  const skin = new THREE.MeshStandardMaterial({ color: '#d8d3c8', map: st2, bumpMap: st2, bumpScale: 2, roughness: 0.75, emissive: '#4a4440', emissiveMap: st2, emissiveIntensity: 0.5 });
  const membrane = new THREE.MeshStandardMaterial({ color: '#8f8272', roughness: 0.9, side: THREE.DoubleSide, emissive: '#3a2618', emissiveIntensity: 0.35 });
  const horn = new THREE.MeshStandardMaterial({ color: '#6a645a', roughness: 0.5 });
  const eyeM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 1.6, 1.8) });

  // ---- 主体：从尾尖到颈部的一条连续变径管 ----
  const pts = [
    [-3.6, -3.4, 2.2], [-4.3, -2.4, -0.5], [-2.8, -1.2, -3.2], [-0.8, 0.4, -3.0], [0, 1.1, -1.5],
    [0, 1.5, 0.5], [0, 2.0, 1.9], [0, 2.3, 3.0], [0, 2.0, 4.1], [0, 1.4, 4.9],
  ].map((p) => new V3(...p));
  const curve = new THREE.CatmullRomCurve3(pts);
  const rFn = (t) => {
    if (t < 0.62) return 0.06 + 0.64 * Math.pow(t / 0.62, 1.6);
    if (t < 0.82) return 0.7 + 0.12 * Math.sin((Math.PI * (t - 0.62)) / 0.2);
    return 0.7 + (0.34 - 0.7) * ((t - 0.82) / 0.18);
  };
  const body = new THREE.Mesh(taperedTube(curve, 160, 18, rFn), skinTube);
  body.castShadow = true;
  d.add(body);

  // 脊刺
  const up = new V3(0, 1, 0);
  for (let t = 0.12; t < 0.97; t += 0.025) {
    const P = curve.getPointAt(t), T = curve.getTangentAt(t);
    const u = up.clone().sub(T.clone().multiplyScalar(up.dot(T))).normalize();
    const r = rFn(t);
    const h = 0.15 + r * 0.55;
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.06 + r * 0.12, h, 6), horn);
    c.position.copy(P).addScaledVector(u, r * 0.85 + h * 0.4);
    c.quaternion.setFromUnitVectors(up, u.clone().addScaledVector(T, -0.5).normalize());
    d.add(c);
  }

  // ---- 腿 ----
  const legs = [
    [[0.55, 1.6, 1.4], [1.15, 0.9, 2.2], [1.1, -0.5, 2.7]],
    [[-0.55, 1.6, 1.4], [-1.15, 0.9, 2.2], [-1.1, -0.5, 2.7]],
    [[0.6, 1.0, -1.4], [1.4, 0.6, -1.0], [1.45, -0.5, -2.4]],
    [[-0.6, 1.0, -1.4], [-1.4, 0.6, -1.0], [-1.45, -0.5, -2.4]],
  ];
  for (const L of legs) {
    const c = new THREE.CatmullRomCurve3(L.map((p) => new V3(...p)));
    const m = new THREE.Mesh(taperedTube(c, 24, 10, (t) => 0.38 - t * 0.22), skin);
    m.castShadow = true;
    d.add(m);
    const foot = new V3(...L[2]);
    for (let k = -1; k <= 1; k++) {
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.4, 6), horn);
      claw.position.copy(foot).add(new V3(k * 0.15, -0.08, 0.2));
      claw.rotation.set(Math.PI / 2 + 0.5, 0, k * 0.3);
      d.add(claw);
    }
  }

  // ---- 头 ----
  const neckEnd = pts[pts.length - 1];
  const head = new THREE.Group();
  head.position.copy(neckEnd);
  head.rotation.x = 0.45;
  d.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 14), skin);
  skull.scale.set(1.05, 0.85, 1.35);
  skull.position.set(0, 0.05, 0.15);
  head.add(skull);
  const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.3, 0.95, 14), skin);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, 0.02, 0.85);
  head.add(snout);
  const jawPivot = new THREE.Group();
  jawPivot.position.set(0, -0.18, 0.3);
  head.add(jawPivot);
  const jaw = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.24, 0.95, 12), skin);
  jaw.rotation.x = Math.PI / 2;
  jaw.scale.set(1, 1, 0.55);
  jaw.position.set(0, -0.04, 0.5);
  jawPivot.add(jaw);
  // 牙齿
  for (let i = 0; i < 6; i++) {
    for (const s of [-1, 1]) {
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.1, 4), horn);
      tooth.position.set(s * (0.13 - i * 0.012), -0.12, 0.55 + i * 0.12);
      tooth.rotation.x = Math.PI;
      head.add(tooth);
    }
  }
  for (const s of [-1, 1]) {
    const hornM = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.85, 8), horn);
    hornM.position.set(s * 0.25, 0.3, -0.25);
    hornM.rotation.set(-2.1, 0, s * -0.35);
    head.add(hornM);
    const hornS = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.45, 6), horn);
    hornS.position.set(s * 0.38, 0.05, -0.15);
    hornS.rotation.set(-1.9, 0, s * -0.9);
    head.add(hornS);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), eyeM);
    eye.position.set(s * 0.3, 0.14, 0.38);
    head.add(eye);
    // 颌边棘
    for (let i = 0; i < 4; i++) {
      const sp = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.22, 4), horn);
      sp.position.set(s * 0.3, -0.18, 0.1 - i * 0.12);
      sp.rotation.set(-2.3, 0, s * -0.6);
      head.add(sp);
    }
  }
  const mouth = new THREE.Object3D();
  mouth.position.set(0, -0.1, 1.35);
  head.add(mouth);
  const fireLight = new THREE.PointLight('#ff7a20', 0, 60, 2);
  fireLight.position.set(0, 0, 2.2);
  head.add(fireLight);

  // ---- 翅膀 ----
  const wings = [];
  for (const side of [1, -1]) {
    const wg = new THREE.Group();
    wg.position.set(side * 0.55, 2.1, 0.9);
    wg.scale.x = side;
    d.add(wg);
    const sh = new V3(0, 0, 0), el = new V3(2.2, 1.6, -0.6), wr = new V3(4.0, 3.0, -0.2);
    const tips = [new V3(7.8, 1.4, -0.8), new V3(6.6, -1.0, -1.8), new V3(4.8, -2.5, -2.6), new V3(2.7, -2.7, -2.6)];
    const root = new V3(0.2, -1.1, -1.7);
    const chain = [];
    for (let i = 0; i < tips.length; i++) {
      chain.push(tips[i]);
      const next = i < tips.length - 1 ? tips[i + 1] : root;
      const mid = tips[i].clone().lerp(next, 0.5).lerp(wr, 0.22);
      chain.push(mid);
    }
    chain.push(root, sh, el);
    const verts = [];
    for (let i = 0; i < chain.length - 1; i++) {
      verts.push(wr.x, wr.y, wr.z, chain[i].x, chain[i].y, chain[i].z, chain[i + 1].x, chain[i + 1].y, chain[i + 1].z);
    }
    const mg = new THREE.BufferGeometry();
    mg.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    mg.computeVertexNormals();
    const mem = new THREE.Mesh(mg, membrane);
    mem.castShadow = true;
    wg.add(mem);
    wg.add(boneBetween(sh, el, 0.22, 0.16, skin));
    wg.add(boneBetween(el, wr, 0.16, 0.12, skin));
    for (const t of tips) wg.add(boneBetween(wr, t, 0.08, 0.025, skin, 6));
    const thumb = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.45, 6), horn);
    thumb.position.copy(wr).add(new V3(0, 0.25, 0.1));
    wg.add(thumb);
    wg.userData.side = side;
    wings.push(wg);
  }

  // ---- 动画：呼吸、扇翅、周期性喷火 ----
  const tmp = new V3(), dir = new V3(), q = new THREE.Quaternion();
  const fireCol = [new THREE.Color(2.5, 1.2, 0.3), new THREE.Color(2.2, 0.6, 0.1), new THREE.Color(2.8, 2.0, 0.8)];
  let cycle = 6; // 首次喷火时间
  const PERIOD = 15;
  let roared = false;
  // 供自动巡游调用：立即开始下一次喷火（若当前不在喷火中）
  W.dragonBreath = () => { if (cycle > 5.5) cycle = PERIOD + 0.01; };
  W.updaters.push((dt, t) => {
    cycle += dt;
    if (cycle > PERIOD) { cycle = 0; roared = false; }
    const ph = cycle;
    // 头部动作: 0-1.2s 抬头蓄力, 1.2-4.2s 喷火, 之后回位
    let pitch = 0.45 + Math.sin(t * 0.6) * 0.04, yaw = Math.sin(t * 0.25) * 0.25, jawOpen = 0.05;
    let firing = false, wingAmp = 0.05;
    if (ph < 1.2) { const k = ph / 1.2; pitch = 0.45 - 0.55 * k; jawOpen = 0.05 + 0.25 * k; wingAmp = 0.12; }
    else if (ph < 4.2) { const k = (ph - 1.2) / 3; pitch = -0.1 + 0.75 * Math.min(1, k * 3); yaw = Math.sin(k * Math.PI * 2) * 0.35; jawOpen = 0.55; firing = true; wingAmp = 0.18; }
    else if (ph < 5.5) { const k = (ph - 4.2) / 1.3; pitch = 0.65 - 0.2 * k; jawOpen = 0.55 * (1 - k) + 0.05; }
    head.rotation.x += (pitch - head.rotation.x) * Math.min(1, dt * 4);
    head.rotation.y += (yaw - head.rotation.y) * Math.min(1, dt * 3);
    jawPivot.rotation.x += (jawOpen - jawPivot.rotation.x) * Math.min(1, dt * 8);
    for (const wg of wings) {
      wg.rotation.z = 0.15 + Math.sin(t * (firing ? 3 : 0.9)) * wingAmp;
      wg.rotation.y = -0.15 + Math.sin(t * 0.7) * 0.03;
    }
    body.scale.setScalar(1 + Math.sin(t * 1.2) * 0.006);

    if (firing) {
      if (!roared) { roared = true; W.sfx && W.sfx.roar(mouth.getWorldPosition(tmp).distanceTo(W.camera.position)); }
      mouth.getWorldPosition(tmp);
      head.getWorldQuaternion(q);
      dir.set(0, -0.05, 1).applyQuaternion(q).normalize();
      const n = Math.floor(dt * 180) + 1;
      for (let i = 0; i < n; i++) {
        const sp = rnd(13, 18);
        W.fx.fire.emit({
          p: tmp.clone().addScaledVector(dir, rnd(0, 0.5)),
          v: new V3(dir.x * sp + rnd(-1.2, 1.2), dir.y * sp + rnd(-1, 1.5), dir.z * sp + rnd(-1.2, 1.2)),
          life: rnd(0.7, 1.1), size: rnd(0.5, 0.9), sizeEnd: rnd(3.5, 5.5), c: fireCol[(Math.random() * 3) | 0], drag: 1.2, g: 2,
        });
      }
      if (Math.random() < 0.3) {
        W.fx.smoke.emit({ p: tmp.clone().addScaledVector(dir, 8), v: new V3(rnd(-1, 1), 2, rnd(-1, 1)), life: 3, size: 2, sizeEnd: 6, alpha: 0.35, c: new THREE.Color(0.25, 0.22, 0.2) });
      }
      fireLight.intensity = 900 + Math.random() * 500;
    } else {
      fireLight.intensity *= Math.max(0, 1 - dt * 6);
      if (ph > 4.2 && ph < 6 && Math.random() < 0.3) {
        mouth.getWorldPosition(tmp);
        W.fx.smoke.emit({ p: tmp.clone(), v: new V3(rnd(-0.3, 0.3), 1.2, rnd(0, 0.6)), life: 2.5, size: 0.4, sizeEnd: 2, alpha: 0.4, c: new THREE.Color(0.4, 0.38, 0.36) });
      }
    }
  });

  return d;
}
