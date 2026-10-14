import * as THREE from 'three';
import * as T from './textures.js';
import { box, boxGeo, cyl, sphere, rnd, pick, V3, SH, DEPTH, GH, START_Z, PLAZA_Z, END_Z } from './util.js';
import * as I from './interiors.js';
import { buildDragon } from './dragon.js';
import { buildStreetNPCs } from './npcs.js';
import { potionHouse, crookshanks, knightBus } from './extras.js';

/** 注册一个光源（由 main.js 的灯光池分配真实 PointLight）。ext = 室外光源（白天会熄灭） */
export function addLight(W, p, color, intensity, distance, always = false, ext = true) {
  const s = { p: p.clone(), color: new THREE.Color(color), intensity, distance, always, ext };
  W.lightSources.push(s);
  return s;
}

const std = (o) => new THREE.MeshStandardMaterial(o);

function makeMaterials() {
  const setts = T.settsPBR(), flagP = T.flagsPBR(1.15), gutP = T.flagsPBR(0.8);
  const plasterCache = {}, paintCache = {};
  const M = {
    // 湿润的花岗岩小方石（参考约克 Shambles）
    cobble: std({ ...setts, normalScale: new THREE.Vector2(1.1, 1.1), roughness: 1, metalness: 0, color: '#d8d6d4', envMapIntensity: 0.55 }),
    flags: std({ ...flagP, normalScale: new THREE.Vector2(0.9, 0.9), roughness: 1, color: '#d4d0ca', envMapIntensity: 0.9 }),
    gutter: std({ ...gutP, roughness: 0.7, color: '#a8a8ae', envMapIntensity: 1.2 }),
    curb: std({ map: T.stoneTex(), color: '#7d7c7c', roughness: 0.6 }),
    brick: std({ map: T.brickTex(12, 45, 33), roughness: 0.9 }),
    brickDark: std({ map: T.brickTex(20, 22, 22), roughness: 0.9 }),
    beam: std({ map: T.woodTex(22, 30, 13), roughness: 0.85 }),
    wood: std({ map: T.woodTex(28, 42, 32), roughness: 0.7 }),
    woodDark: std({ map: T.woodTex(20, 35, 15), roughness: 0.75 }),
    floor: std({ map: T.woodTex(30, 35, 26, true), roughness: 0.6 }),
    slate: std({ map: T.slateTex(), roughness: 0.8 }),
    stone: std({ map: T.stoneTex(), roughness: 0.85 }),
    iron: std({ color: '#1b1b1d', metalness: 0.7, roughness: 0.45 }),
    brass: std({ color: '#b8913a', metalness: 0.85, roughness: 0.35 }),
    gold: std({ color: '#d4af37', metalness: 1, roughness: 0.3 }),
    bronze: std({ color: '#8a6232', metalness: 0.9, roughness: 0.4 }),
    frame: std({ color: '#2a2420', roughness: 0.6 }),
    glassLit: std({ color: '#3a2a1a', emissive: '#ffb060', emissiveIntensity: 0.9, roughness: 0.2 }),
    glassWarm: std({ color: '#3a2a1a', emissive: '#ff9a48', emissiveIntensity: 0.75, roughness: 0.2 }),
    glassDark: std({ color: '#0e131c', roughness: 0.12, metalness: 0.6, envMapIntensity: 0.8 }),
    glassClear: std({ color: '#9fb4c8', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.12, depthWrite: false }),
    lampGlow: new THREE.MeshBasicMaterial({ color: new THREE.Color(3.4, 1.9, 0.75) }),
    flame: new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 3, 1.2) }),
  };
  // 亮灯的窗户（窗帘 + 室内暖光）
  M.winLit = [0, 1, 2, 3].map((v) => {
    const t = T.windowGlowTex(v);
    return std({ color: '#000000', emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.85, roughness: 0.12, metalness: 0.2 });
  });
  // 店铺橱窗陈列
  M.display = [0, 1, 2].map((v) => {
    const t = T.shopDisplayTex(v);
    return std({ color: '#000000', emissive: '#d8c8b0', emissiveMap: t, emissiveIntensity: 0.5, roughness: 0.08, metalness: 0.3 });
  });
  const slateCone = T.slateTex(); slateCone.repeat.set(10, 4);
  M.slateCone = std({ map: slateCone, roughness: 0.8 });
  M.plaster = (c) => plasterCache[c] || (plasterCache[c] = std({ map: T.plasterTex(c), roughness: 0.95 }));
  M.paint = (c) => paintCache[c] || (paintCache[c] = std({ color: c, roughness: 0.55 }));
  M.signMat = (tex) => std({ map: tex, roughness: 0.5, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.22 });
  return M;
}

/** 一块地块: 本地坐标中 +x 朝向街道, 建筑占据 x∈[-DEPTH,0], z∈[-w/2,w/2] */
function makeLot(W, side, z0, z1) {
  const w = z0 - z1, zc = (z0 + z1) / 2;
  const g = new THREE.Group();
  g.position.set(side * SH, 0, zc);
  g.rotation.y = side === 1 ? Math.PI : 0;
  W.scene.add(g);
  const s = -side, off = side * SH;
  return {
    W, side, w, zc, g,
    toWorld(lx, lz, y = 0) { return new V3(s * lx + off, y, zc + s * lz); },
    collider(lx0, lx1, lz0, lz1) {
      const a = this.toWorld(lx0, lz0), b = this.toWorld(lx1, lz1);
      const c = { minX: Math.min(a.x, b.x), maxX: Math.max(a.x, b.x), minZ: Math.min(a.z, b.z), maxZ: Math.max(a.z, b.z) };
      W.colliders.push(c);
      return c;
    },
    circle(lx, lz, r) { const p = this.toWorld(lx, lz); const c = { circle: true, x: p.x, z: p.z, r }; W.colliders.push(c); return c; },
    zone(name, lx0, lx1, lz0, lz1) {
      const a = this.toWorld(lx0, lz0), b = this.toWorld(lx1, lz1);
      W.zones.push({ name, minX: Math.min(a.x, b.x), maxX: Math.max(a.x, b.x), minZ: Math.min(a.z, b.z), maxZ: Math.max(a.z, b.z) });
    },
  };
}

export function buildWorld(W) {
  const M = makeMaterials();
  W.M = M;
  W.chimneys = [];
  sky(W);
  lighting(W);
  street(W, M);
  entrance(W, M);

  const LEFT = [
    [START_Z, -10, { cn: '摩金夫人长袍专卖店', name: "Madam Malkin's", sub: 'Robes for All Occasions', style: 'plaster', color: '#9a7a9c', paint: '#3e2a4a', floors: 3, roof: 'gable' }],
    [-10, -24, { cn: '奥利凡德魔杖店', name: 'OLLIVANDERS', sub: 'Makers of Fine Wands since 382 B.C.', style: 'brick', dark: true, paint: '#2e1a26', door: '#2a1a14', floors: 3, roof: 'ridge', enter: I.ollivanders, hang: 'OLLIVANDERS', interior: 'olli' }],
    [-24, -33, { cn: '魁地奇精品店', name: 'Quality Quidditch Supplies', style: 'timber', color: '#d8ccb0', paint: '#1f3a5a', floors: 3, roof: 'gable', hang: 'QUIDDITCH' }],
    [-33, -47, { cn: '斯拉格与吉格斯药店', name: 'Slug & Jiggers', sub: 'Apothecary · Est. 1782', style: 'timber', color: '#cbbf9a', paint: '#24402a', door: '#1d2a18', floors: 3, roof: 'gable', enter: I.apothecary, hang: 'APOTHECARY', interior: 'apo' }],
    [-47, -58, { cn: '韦斯莱魔法把戏坊', name: "Weasleys' Wizard Wheezes", style: 'plaster', color: '#d8651e', paint: '#5a2a7a', floors: 4, roof: 'ridge', hang: 'WWW', loud: true }],
    [-58, -70, { cn: '福洛林冰淇淋店', name: "Florean Fortescue's", sub: 'Ice Cream Parlour', style: 'plaster', color: '#d8a8b0', paint: '#7a3a4a', floors: 3, roof: 'gable' }],
    [-70, PLAZA_Z, { cn: '晦涩书局', name: 'Obscurus Books', style: 'brick', paint: '#2a2a3a', floors: 4, roof: 'ridge' }],
  ];
  const RIGHT = [
    [START_Z, -12, { cn: '咕噜嘣嘣笑话店', name: 'Gambol and Japes', sub: 'Wizarding Joke Shop', style: 'timber', color: '#d0c4a2', paint: '#8a1f1f', floors: 3, roof: 'gable', hang: 'JOKES' }],
    [-12, -26, { cn: '丽痕书店', name: 'Flourish and Blotts', sub: 'Booksellers', style: 'plaster', color: '#bfb08a', paint: '#4a1a16', door: '#2a1410', floors: 3, roof: 'ridge', enter: I.flourish, hang: 'BOOKS', interior: 'books' }],
    [-26, -35, { cn: '神奇动物园', name: 'Magical Menagerie', style: 'timber', color: '#c8c0a0', paint: '#1e4a4a', floors: 3, roof: 'gable' }],
    [-35, -49, { cn: '咿啦猫头鹰商店', name: 'Eeylops Owl Emporium', sub: 'Tawny · Screech · Barn · Brown · Snowy', style: 'timber', color: '#d8cfb5', paint: '#3a2814', door: '#2a1a0c', floors: 3, roof: 'gable', enter: I.eeylops, hang: 'OWLS', interior: 'owls' }],
    [-49, -60, { cn: '特威福和塔廷斯服装店', name: "Twilfitt and Tatting's", style: 'brick', paint: '#1c2a48', floors: 3, roof: 'ridge' }],
    [-60, -71, { cn: '斯克里文林羽毛笔店', name: 'Scribbulus', sub: 'Writing Implements', style: 'plaster', color: '#c9a95a', paint: '#3a2a10', floors: 3, roof: 'gable', hang: 'QUILLS' }],
    [-71, PLAZA_Z, { cn: '博金坩埚店', name: "Potage's Cauldron Shop", style: 'brick', dark: true, paint: '#3a2a1a', floors: 4, roof: 'ridge' }],
  ];
  for (const [z0, z1, o] of LEFT) buildLot(W, M, -1, z0, z1, o);
  for (const [z0, z1, o] of RIGHT) buildLot(W, M, 1, z0, z1, o);

  lamps(W, M);
  gringotts(W, M);
  dressing(W, M);
  floatingCandles(W);
  buildStreetNPCs(W);
  potionHouse(W);
  crookshanks(W);
  knightBus(W);

  // 街区区域名称
  W.zones.push({ name: '古灵阁巫师银行', minX: -17, maxX: 17, minZ: END_Z - 1, maxZ: PLAZA_Z + 4 });
  W.zones.push({ name: '破釜酒吧后院', minX: -5, maxX: 5, minZ: -5, maxZ: START_Z });

  // 烟囱冒烟
  W.scene.updateMatrixWorld(true);
  const chimPts = W.chimneys.map((o) => o.getWorldPosition(new V3()));
  let acc = 0;
  W.updaters.push((dt) => {
    acc += dt;
    if (acc < 0.25) return;
    acc = 0;
    for (const p of chimPts) {
      if (Math.random() < 0.6) W.fx.smoke.emit({ p: p.clone().add(new V3(rnd(-0.1, 0.1), 0, rnd(-0.1, 0.1))), v: new V3(rnd(0.2, 0.6), rnd(0.8, 1.3), rnd(-0.2, 0.2)), life: 5, size: 0.6, sizeEnd: 3.2, alpha: 0.28, c: new THREE.Color(0.32, 0.3, 0.33) });
    }
  });
}

// ------------------------------------------------------------------ 天空与光照
function sky(W) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { t: { value: 0 }, stars: { value: 1 }, day: { value: 0 } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform float t; varying vec3 vDir;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
      float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=0.5; } return v; }
      vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }
      uniform float stars;
      uniform float day;
      void main(){
        vec3 d = normalize(vDir); float h = d.y;
        // ---- 夜晚（蓝调时刻）：深蓝天顶，地平线带一点城市暖光 ----
        vec3 zen = lin(vec3(0.035,0.06,0.15)), mid = lin(vec3(0.09,0.14,0.28)), hor = lin(vec3(0.24,0.28,0.40));
        vec3 col = mix(hor, mid, smoothstep(0.0, 0.22, h));
        col = mix(col, zen, smoothstep(0.22, 0.8, h));
        col += lin(vec3(0.34,0.22,0.12)) * (1.0 - smoothstep(0.0, 0.14, abs(h))) * 0.4;
        vec3 md = normalize(vec3(-0.3, 0.5, -0.8));
        float m = max(0.0, dot(d, md));
        // ---- 白天：晴朗的英伦天空 + 积云 ----
        vec3 sdir = normalize(vec3(0.45, 0.75, -0.5));
        float sn = max(0.0, dot(d, sdir));
        vec3 dcol = mix(lin(vec3(0.74,0.82,0.92)), lin(vec3(0.32,0.53,0.86)), smoothstep(0.0, 0.55, h));
        dcol += lin(vec3(1.0,0.92,0.78)) * pow(sn, 8.0) * 0.3;
        float c = 0.0, c2 = 0.0;
        if (h > 0.0) {
          vec2 uv = d.xz / (h + 0.18) * 1.3 + vec2(t*0.006, t*0.0025);
          c = fbm(uv); c2 = fbm(uv*2.4 + 3.1);
          // 星星
          vec3 sd = d * 300.0;
          vec2 cell = floor(sd.xz / (h + 0.3) * 0.9);
          float st = hash(cell);
          float tw = 0.6 + 0.4 * sin(t * 2.0 + st * 50.0);
          col += vec3(0.9,0.95,1.0) * step(0.9975, st) * tw * smoothstep(0.15, 0.5, h) * stars;
          // 夜云：被月光照亮的边缘
          float cl = smoothstep(0.48, 0.82, c*0.75 + c2*0.35);
          vec3 cDark = lin(vec3(0.08,0.10,0.16));
          vec3 cLit = lin(vec3(0.34,0.38,0.50));
          vec3 cc = mix(cDark, cLit, clamp((1.0-c2)*0.35 + pow(m, 6.0)*0.9, 0.0, 1.0));
          col = mix(col, cc, cl * smoothstep(0.0, 0.12, h) * 0.85);
          // 白云
          float dcl = smoothstep(0.45, 0.78, c*0.75 + c2*0.35);
          vec3 dcc = mix(lin(vec3(0.62,0.66,0.74)), vec3(1.0), clamp((1.0-c2)*0.8 + pow(sn,4.0)*0.4, 0.0, 1.0));
          dcol = mix(dcol, dcc, dcl * smoothstep(0.0, 0.1, h) * 0.9);
        } else {
          col = mix(hor, lin(vec3(0.05,0.055,0.07)), smoothstep(0.0, -0.2, h));
          dcol = mix(lin(vec3(0.74,0.82,0.92)), lin(vec3(0.4,0.4,0.42)), smoothstep(0.0, -0.2, h));
        }
        // 月亮 + 光晕
        col += lin(vec3(0.75,0.82,1.0)) * pow(m, 60.0) * 0.5 * stars;
        col += vec3(1.0, 0.98, 0.92) * smoothstep(0.99955, 0.9997, m) * 3.0 * stars;
        // 太阳
        dcol += vec3(1.0, 0.95, 0.85) * smoothstep(0.9993, 0.9996, sn) * 12.0 * stars;
        gl_FragColor = vec4(mix(col, dcol, day), 1.0);
      }`,
  });
  const s = new THREE.Mesh(new THREE.SphereGeometry(450, 32, 16), mat);
  s.userData.dyn = true;
  s.renderOrder = -1;
  W.scene.add(s);
  W.updaters.push((dt, t) => { mat.uniforms.t.value = t; s.position.copy(W.camera.position); });
  W.scene.fog = new THREE.FogExp2('#18223a', 0.0095);

  // 环境贴图场景：天空（无星星）+ 远处暖色灯光，让湿润的石板反射出夜空与灯火
  const envMat = mat.clone();
  envMat.uniforms.stars.value = 0;
  envMat.uniforms.t.value = 0;
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), envMat));
  const warm = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.3, 0.55) });
  const warmBalls = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const b = new THREE.Mesh(new THREE.SphereGeometry(1.6, 8, 6), warm);
    b.position.set(Math.cos(a) * 40, rnd(2, 9), Math.sin(a) * 40);
    env.add(b);
    warmBalls.push(b);
  }
  W.envScene = env;
  W.skyMat = mat;
  W.envMat = envMat;
  W.envWarm = warmBalls;
}

function lighting(W) {
  const hemi = new THREE.HemisphereLight('#4a5c90', '#4a3826', 1.0);
  W.scene.add(hemi);
  // 月光 / 阳光（投射阴影）
  const sun = new THREE.DirectionalLight('#a8bcff', 0.9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = sc.bottom = -40; sc.right = sc.top = 40; sc.near = 1; sc.far = 160;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  W.scene.add(sun, sun.target);
  const MOON = new V3(-0.3, 0.5, -0.8).normalize().multiplyScalar(60);
  const SUN = new V3(0.45, 0.75, -0.5).normalize().multiplyScalar(60);
  let off = MOON;
  W.updaters.push(() => {
    const p = W.camera.position;
    sun.target.position.set(Math.round(p.x), 0, Math.round(p.z));
    sun.position.copy(sun.target.position).add(off);
  });

  /** 切换白天 / 夜晚 */
  W.isDay = false;
  W.extMul = 1;
  W.setDay = (day) => {
    const M = W.M;
    W.isDay = day;
    W.skyMat.uniforms.day.value = W.envMat.uniforms.day.value = day ? 1 : 0;
    W.envWarm.forEach((b) => (b.visible = !day));
    W.scene.fog.color.set(day ? '#b9c7d8' : '#18223a');
    W.scene.fog.density = day ? 0.0055 : 0.0095;
    hemi.color.set(day ? '#cdd8ec' : '#4a5c90');
    hemi.groundColor.set(day ? '#8f7e64' : '#4a3826');
    hemi.intensity = day ? 1.25 : 1.0;
    sun.color.set(day ? '#ffe8c4' : '#a8bcff');
    sun.intensity = day ? 3.6 : 0.9;
    off = day ? SUN : MOON;
    // 室外灯光白天熄灭，室内灯照常
    W.extMul = day ? 0 : 1;
    M.lampGlow.color.setRGB(...(day ? [0.9, 0.82, 0.62] : [3.4, 1.9, 0.75]));
    M.winLit.forEach((m) => (m.emissiveIntensity = day ? 0.12 : 1.0));
    M.display.forEach((m) => (m.emissiveIntensity = day ? 0.3 : 0.55));
    M.glassLit.emissiveIntensity = day ? 0.15 : 0.9;
    M.glassWarm.emissiveIntensity = day ? 0.12 : 0.75;
    M.cobble.envMapIntensity = day ? 0.35 : 0.6;
    (W.dayHooks || []).forEach((f) => f(day));
    W.onDayChange && W.onDayChange(day);
  };
}

// ------------------------------------------------------------------ 街道
function street(W, M) {
  const len = START_Z - END_Z + 2;
  const geo = new THREE.PlaneGeometry(36, len);
  geo.rotateX(-Math.PI / 2);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * 36) / 2.2, (uv.getY(i) * len) / 2.2);
  const g = new THREE.Mesh(geo, M.cobble);
  g.position.set(0, 0, (START_Z + END_Z) / 2 - 1);
  g.receiveShadow = true;
  W.scene.add(g);
  // 两侧石板人行道 + 花岗岩路缘 + 中央排水沟
  const sl = START_Z - PLAZA_Z;
  for (const s of [-1, 1]) {
    W.scene.add(box(1.3, 0.06, sl, M.flags, s * (SH - 0.65), 0.03, (START_Z + PLAZA_Z) / 2, 2.6));
    W.scene.add(box(0.16, 0.09, sl, M.curb, s * (SH - 1.36), 0.045, (START_Z + PLAZA_Z) / 2, 1));
  }
  W.scene.add(box(0.6, 0.012, sl + 8, M.gutter, 0, 0.006, (START_Z + PLAZA_Z) / 2 - 4, 1.2));
  for (const s of [-1, 1]) W.scene.add(box(0.08, 0.025, sl + 8, M.curb, s * 0.34, 0.0125, (START_Z + PLAZA_Z) / 2 - 4, 1));
  // 街道边界
  W.colliders.push({ minX: -18, maxX: 18, minZ: START_Z, maxZ: START_Z + 2 });
  W.colliders.push({ minX: -19, maxX: -17, minZ: END_Z - 5, maxZ: START_Z });
  W.colliders.push({ minX: 17, maxX: 19, minZ: END_Z - 5, maxZ: START_Z });
}

function entrance(W, M) {
  const g = new THREE.Group();
  g.position.set(0, 0, START_Z);
  W.scene.add(g);
  g.add(box(36, 15, 1, M.brick, 0, 7.5, 0.5, 2.5));
  // 石拱门（通往破釜酒吧的砖墙通道）
  const arch = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.22, 10, 32, Math.PI), M.stone);
  arch.position.set(0, 2.9, 0);
  g.add(arch);
  for (const s of [-1, 1]) g.add(box(0.44, 2.9, 0.44, M.stone, s * 2.2, 1.45, 0));
  g.add(box(0.8, 0.5, 0.5, M.stone, 0, 5.1, 0));
  // 墙上的告示
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.0), std({ map: T.posterTex(), roughness: 0.9 }));
  poster.position.set(3.6, 1.8, -0.02);
  poster.rotation.y = Math.PI;
  g.add(poster);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.7), M.signMat(T.signTex([{ t: 'The Leaky Cauldron', s: 1.2, i: true }, { t: 'Charing Cross Road ⟶ ', s: 0.6 }], { bg: '#1a120c' })));
  sign.position.set(0, 6.2, -0.02);
  sign.rotation.y = Math.PI;
  g.add(sign);
  W.interactables.push({
    pos: new V3(0, 1.5, START_Z - 0.3), r: 2.6,
    label: () => '按 E 用魔杖敲击砖墙',
    action: () => {
      W.burst(new V3(0, 1.6, START_Z - 0.2), new THREE.Color(1.5, 1.2, 0.6), 80);
      W.sfx.chime();
      W.say('左三，上二……砖块微微颤动——这是回破釜酒吧的路，但对角巷还没逛完呢！');
    },
  });
}

// ------------------------------------------------------------------ 建筑
function buildLot(W, M, side, z0, z1, o) {
  const lot = makeLot(W, side, z0, z1);
  const { g, w } = lot;
  const wallMat = o.style === 'brick' ? (o.dark ? M.brickDark : M.brick) : M.plaster(o.color || '#d8ccb0');
  const ts = o.style === 'brick' ? 2.5 : 3;
  if (o.enter) enterable(W, M, lot, o);
  else {
    g.add(box(DEPTH, GH, w, wallMat, -DEPTH / 2, GH / 2, 0, ts));
    lot.collider(-DEPTH, 0.35, -w / 2, w / 2);
    shopfront(W, M, lot, o);
  }
  upper(W, M, lot, o, wallMat, ts);
  if (o.hang) hangingSign(W, M, lot, o);
}

function fascia(M, g, w, o, y, x) {
  const paint = M.paint(o.paint);
  g.add(box(0.3, 0.9, w - 0.3, paint, x, y, 0));
  const lines = [{ t: o.name, s: 1 }];
  if (o.sub) lines.push({ t: o.sub, s: 0.45, i: true, b: false });
  const tex = T.signTex(lines, { bg: o.paint, fg: o.loud ? '#ffd23a' : '#e6c46a', border: '#a8843a', w: 1400, h: 200 });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.7, 0.75), M.signMat(tex));
  sign.rotation.y = Math.PI / 2;
  sign.position.set(x + 0.16, y, 0);
  g.add(sign);
}

function shopfront(W, M, lot, o) {
  const { g, w } = lot;
  const paint = M.paint(o.paint);
  const doorZ = (Math.random() < 0.5 ? -1 : 1) * (w / 2 - 1.6);
  g.add(box(0.25, 0.6, w - 0.2, paint, 0.1, 0.3, 0));
  for (const z of [-w / 2 + 0.25, w / 2 - 0.25]) g.add(box(0.35, GH - 0.9, 0.4, paint, 0.12, (GH - 0.9) / 2, z));
  g.add(box(0.12, 2.6, 1.25, M.paint(o.door || '#3a1f14'), 0.06, 1.3, doorZ));
  g.add(sphere(0.05, M.gold, 0.16, 1.25, doorZ + 0.42 * Math.sign(-doorZ)));
  g.add(box(0.06, 0.45, 1.2, M.glassLit, 0.1, 2.85, doorZ));
  g.add(box(0.3, 0.12, 1.6, paint, 0.12, 3.12, doorZ));
  const a = doorZ > 0 ? -w / 2 + 0.45 : doorZ + 0.8;
  const b = doorZ > 0 ? doorZ - 0.8 : w / 2 - 0.45;
  const len = b - a, cz = (a + b) / 2;
  const disp = new THREE.PlaneGeometry(len, 2.3);
  disp.rotateY(Math.PI / 2);
  const duv = disp.attributes.uv;
  const u0 = Math.random();
  for (let i = 0; i < duv.count; i++) duv.setX(i, u0 + (duv.getX(i) * len) / 3);
  const dm = new THREE.Mesh(disp, pick(M.display));
  dm.position.set(0.1, 1.75, cz);
  g.add(dm);
  const n = Math.max(2, Math.round(len / 0.75));
  for (let k = 1; k < n; k++) g.add(box(0.08, 2.3, 0.05, paint, 0.14, 1.75, a + (k * len) / n));
  g.add(box(0.08, 0.05, len, paint, 0.14, 2.45, cz));
  g.add(box(0.3, 0.15, w - 0.2, paint, 0.12, 2.95, 0));
  // 橱窗透出的暖光洒在石板路上
  addLight(W, lot.toWorld(1.2, cz, 1.8), '#ffb469', 7, 9);
  wallLantern(W, M, lot, 0.2, doorZ + Math.sign(doorZ) * 0.95, 2.75);
  fascia(M, g, w, o, GH - 0.55, 0.15);
}

/** 门边的铁艺壁灯 */
function wallLantern(W, M, lot, x, z, y) {
  const g = lot.g;
  g.add(box(0.5, 0.05, 0.05, M.iron, x + 0.2, y + 0.35, z));
  g.add(box(0.05, 0.4, 0.05, M.iron, x + 0.42, y + 0.15, z));
  g.add(box(0.13, 0.22, 0.13, M.lampGlow, x + 0.42, y - 0.15, z));
  for (const a of [-1, 1]) for (const b of [-1, 1]) g.add(box(0.02, 0.3, 0.02, M.iron, x + 0.42 + a * 0.08, y - 0.15, z + b * 0.08));
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.16, 4), M.iron);
  cap.position.set(x + 0.42, y + 0.05, z);
  cap.rotation.y = Math.PI / 4;
  g.add(cap);
  g.add(box(0.22, 0.03, 0.22, M.iron, x + 0.42, y - 0.31, z));
  addLight(W, lot.toWorld(x + 0.6, z, y - 0.15), '#ffae5c', 9, 10);
}

function addWindow(par, M, x, y, z, ww, wh, lit, style) {
  par.add(box(0.14, wh + 0.16, ww + 0.16, M.frame, x + 0.02, y, z));
  if (lit) {
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), pick(M.winLit));
    pane.rotation.y = Math.PI / 2;
    pane.position.set(x + 0.09, y, z);
    par.add(pane);
  } else par.add(box(0.04, wh, ww, M.glassDark, x + 0.09, y, z));
  par.add(box(0.06, wh, 0.05, M.frame, x + 0.11, y, z));
  for (const f of [-1, 1]) par.add(box(0.06, 0.04, ww, M.frame, x + 0.11, y + (f * wh) / 6, z));
  par.add(box(0.28, 0.07, ww + 0.3, style === 'brick' ? M.stone : M.frame, x + 0.1, y - wh / 2 - 0.1, z));
  if (style === 'brick') par.add(box(0.2, 0.22, ww + 0.4, M.stone, x + 0.05, y + wh / 2 + 0.18, z));
}

function upper(W, M, lot, o, wallMat, ts) {
  const { g, w } = lot;
  const up = new THREE.Group();
  up.position.y = GH;
  up.rotation.z = rnd(-0.022, 0.022);
  up.rotation.x = rnd(-0.012, 0.012);
  g.add(up);
  const floors = o.floors || 3;
  const jetty = o.style === 'timber' ? 0.45 : o.style === 'plaster' ? 0.3 : 0.12;
  let y = 0, over = 0;
  for (let i = 0; i < floors; i++) {
    over += jetty * (i === 0 ? 1 : rnd(0.5, 1));
    const fh = i === floors - 1 ? 3.0 : 3.3;
    up.add(box(DEPTH + over, fh, w, wallMat, (-DEPTH + over) / 2, y + fh / 2, 0, ts));
    const n = Math.max(1, Math.round(w / 3.4));
    const segw = w / n;
    const ww = o.style === 'brick' ? 1.0 : 1.3;
    const wh = 1.7, wy = y + fh * 0.52;
    if (o.style === 'timber') {
      const B = M.beam, x = over + 0.04;
      up.add(box(0.14, 0.24, w, B, x, y + 0.12, 0));
      up.add(box(0.14, 0.2, w, B, x, y + fh - 0.1, 0));
      for (let k = 0; k < n; k++) {
        const cz = -w / 2 + (k + 0.5) * segw;
        for (const s of [-1, 1]) {
          up.add(box(0.14, fh, 0.2, B, x, y + fh / 2, cz + (s * segw) / 2));
          up.add(box(0.14, fh, 0.14, B, x, y + fh / 2, cz + s * (ww / 2 + 0.12)));
          // 斜撑
          const z0 = cz + s * (ww / 2 + 0.12), z1 = cz + (s * segw) / 2;
          const pw = Math.abs(z1 - z0), ph = fh - 0.4;
          if (pw > 0.3) {
            const L = Math.hypot(pw, ph);
            const br = box(0.12, L, 0.13, B, x, y + fh / 2, (z0 + z1) / 2);
            br.rotation.x = Math.atan2(pw, ph) * s * (i % 2 ? 1 : -1);
            up.add(br);
          }
        }
        up.add(box(0.14, 0.14, ww + 0.2, B, x, wy - wh / 2 - 0.25, cz));
      }
    } else {
      up.add(box(0.25, 0.18, w, o.style === 'brick' ? M.stone : M.frame, over + 0.05, y + 0.09, 0));
    }
    for (let k = 0; k < n; k++) {
      addWindow(up, M, over, wy, -w / 2 + (k + 0.5) * segw, ww, wh, Math.random() < (o.loud ? 0.9 : 0.5), o.style);
    }
    y += fh;
  }
  // 屋顶
  const roofMats = [wallMat, M.slate];
  if (o.roof === 'gable') {
    const rh = w * 0.5;
    const sh = new THREE.Shape();
    sh.moveTo(-w / 2 - 0.3, 0); sh.lineTo(w / 2 + 0.3, 0); sh.lineTo(0, rh); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: DEPTH + over + 0.5, bevelEnabled: false });
    geo.rotateY(Math.PI / 2);
    geo.translate(-DEPTH - 0.25, 0, 0);
    const r = new THREE.Mesh(geo, roofMats);
    r.position.y = y;
    r.castShadow = r.receiveShadow = true;
    up.add(r);
    const L = Math.hypot(w / 2 + 0.3, rh);
    for (const s of [-1, 1]) {
      const bb = box(0.12, 0.28, L, M.beam, over + 0.3, y + rh / 2, (s * (w / 2 + 0.3)) / 2);
      bb.rotation.x = s * Math.atan2(rh, w / 2 + 0.3);
      up.add(bb);
    }
    addWindow(up, M, over + 0.2, y + rh * 0.35, 0, 0.8, 1.0, Math.random() < 0.6, o.style);
  } else {
    const rh = 4;
    const sh = new THREE.Shape();
    sh.moveTo(-DEPTH - 0.3, 0); sh.lineTo(over + 0.4, 0); sh.lineTo((over - DEPTH) / 2, rh); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: w + 0.1, bevelEnabled: false });
    geo.translate(0, 0, -w / 2 - 0.05);
    const r = new THREE.Mesh(geo, roofMats);
    r.position.y = y;
    r.castShadow = r.receiveShadow = true;
    up.add(r);
    // 老虎窗
    const nd = Math.max(1, Math.round(w / 5));
    for (let k = 0; k < nd; k++) {
      const z = -w / 2 + (k + 0.5) * (w / nd);
      up.add(box(1.6, 1.5, 1.4, wallMat, over - 1.2, y + 1.2, z, ts));
      const cap = box(1.9, 0.12, 1.7, M.slate, over - 1.2, y + 2.0, z, 1);
      cap.rotation.z = -0.15;
      up.add(cap);
      addWindow(up, M, over - 0.4, y + 1.2, z, 0.8, 0.9, Math.random() < 0.5, o.style);
    }
  }
  // 烟囱
  const cz = rnd(-w / 2 + 1, w / 2 - 1), cx = rnd(-DEPTH + 2, -5);
  up.add(box(0.9, 4, 0.9, M.brickDark, cx, y + 3.2, cz, 2.5));
  up.add(cyl(0.15, 0.18, 0.5, M.iron, cx, y + 5.45, cz));
  const marker = new THREE.Object3D();
  marker.position.set(cx, y + 5.8, cz);
  up.add(marker);
  W.chimneys.push(marker);
}

function hangingSign(W, M, lot, o) {
  const { g, w } = lot;
  const z = o.enter ? -w / 2 + 1.2 : -w / 2 + 0.8;
  const y = GH - 0.25;
  g.add(box(1.9, 0.07, 0.07, M.iron, 1.05, y, z));
  const curl = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 6, 16, Math.PI * 1.5), M.iron);
  curl.position.set(0.45, y - 0.22, z);
  g.add(curl);
  const piv = new THREE.Group();
  piv.position.set(1.15, y, z);
  piv.userData.dyn = true;
  g.add(piv);
  const tex = T.signTex([{ t: o.hang, s: 1 }], { w: 512, h: 384, bg: o.paint, fg: o.loud ? '#ffd23a' : '#e8c66a' });
  const sm = M.signMat(tex);
  const bw = 1.3, bh = 0.95;
  const board = new THREE.Mesh(boxGeo(bw, bh, 0.06), [M.woodDark, M.woodDark, M.woodDark, M.woodDark, sm, sm]);
  board.position.y = -0.15 - bh / 2;
  board.castShadow = true;
  piv.add(board);
  for (const s of [-1, 1]) piv.add(box(0.02, 0.15, 0.02, M.iron, s * bw * 0.4, -0.075, 0));
  const ph = Math.random() * 6;
  W.updaters.push((dt, t) => { piv.rotation.x = Math.sin(t * 1.1 + ph) * 0.06; });
}

function enterable(W, M, lot, o) {
  const { g, w } = lot;
  const hw = w / 2, t = 0.3, doorZ = hw - 2.2, dw = 0.75, DH = 2.8;
  const style = I.styles(M)[o.interior];
  const inMat = style.wall, extPaint = M.paint(o.paint);
  const fm = [extPaint, inMat, inMat, inMat, inMat, inMat];
  // 地板 / 天花 / 梁
  g.add(box(DEPTH - 2 * t, 0.04, w - 2 * t, style.floor, -DEPTH / 2, 0.02, 0, 2));
  g.add(box(DEPTH, 0.25, w, style.ceil, -DEPTH / 2, GH - 0.125, 0, 2));
  for (const x of [-2.6, -5.2, -7.8, -10.4]) g.add(box(0.25, 0.25, w - 2 * t, M.beam, x, GH - 0.37, 0, 2));
  // 后墙 / 侧墙
  g.add(box(t, GH, w, inMat, -DEPTH + t / 2, GH / 2, 0, 2));
  lot.collider(-DEPTH, -DEPTH + t, -hw, hw);
  for (const s of [-1, 1]) {
    g.add(box(DEPTH, GH, t, inMat, -DEPTH / 2, GH / 2, s * (hw - t / 2), 2));
    lot.collider(-DEPTH, 0, s > 0 ? hw - t : -hw, s > 0 ? hw : -hw + t);
  }
  // 前墙（带门洞和大橱窗）
  const piece = (z0, z1, y0, y1) => {
    const m = new THREE.Mesh(boxGeo(t, y1 - y0, z1 - z0, 2), fm);
    m.position.set(-t / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
  };
  piece(-hw, doorZ - dw, 0, 0.8);
  piece(doorZ + dw, hw, 0, 0.8);
  piece(-hw, hw, DH, GH);
  const winA = -hw + 0.5, winB = doorZ - dw - 0.35, midZ = (winA + winB) / 2;
  piece(-hw, winA, 0.8, DH);
  piece(winB, doorZ - dw, 0.8, DH);
  piece(doorZ + dw, hw, 0.8, DH);
  piece(midZ - 0.2, midZ + 0.2, 0.8, DH);
  for (const [a, b] of [[winA, midZ - 0.2], [midZ + 0.2, winB]]) {
    const len = b - a, cz = (a + b) / 2;
    g.add(box(0.03, DH - 0.8, len, M.glassClear, -0.12, (DH + 0.8) / 2, cz));
    const n = Math.round(len / 0.8);
    for (let k = 1; k < n; k++) g.add(box(0.06, DH - 0.8, 0.05, extPaint, -0.1, (DH + 0.8) / 2, a + (k * len) / n));
    g.add(box(0.06, 0.05, len, extPaint, -0.1, 2.25, cz));
  }
  lot.collider(-t, 0.08, -hw, doorZ - dw);
  lot.collider(-t, 0.08, doorZ + dw, hw);
  // 外立面装饰
  for (const z of [-hw + 0.25, midZ, winB + 0.15, doorZ + dw + 0.15, hw - 0.25]) g.add(box(0.14, DH - 0.2, 0.3, extPaint, 0.05, (DH - 0.2) / 2, z));
  g.add(box(0.2, 0.5, w - 0.4, extPaint, 0.06, 0.25, 0));
  fascia(M, g, w, o, GH - 0.65, 0.15);

  // 门（可开关）
  const piv = new THREE.Group();
  piv.position.set(-t / 2, 0, doorZ - dw);
  piv.userData.dyn = true;
  g.add(piv);
  const doorMat = M.paint(o.door || '#2a1a10');
  piv.add(box(0.08, DH - 0.03, 2 * dw - 0.04, doorMat, 0, DH / 2, dw));
  piv.add(box(0.1, 0.8, 0.9, M.glassWarm, 0, 2.0, dw));
  for (const s of [-1, 1]) piv.add(sphere(0.05, M.gold, s * 0.07, 1.2, 2 * dw - 0.2));
  const dc = lot.collider(-t, 0, doorZ - dw, doorZ + dw);
  const state = { open: false, a: 0 };
  W.updaters.push((dt) => {
    const target = state.open ? -1.75 : 0;
    state.a += (target - state.a) * Math.min(1, dt * 5);
    piv.rotation.y = state.a;
  });
  const door = {
    pos: lot.toWorld(0, doorZ, 1.5),
    get open() { return state.open; },
    set(v) { if (state.open !== v) { state.open = v; dc.off = v; W.sfx.bell(); } },
  };
  W.doors.push(door);
  W.interactables.push({
    pos: door.pos, r: 2.8,
    label: () => (state.open ? '按 E 关门' : `按 E 推门进入「${o.cn}」`),
    action: () => door.set(!state.open),
  });
  wallLantern(W, M, lot, 0.1, doorZ + dw + 0.62, 2.7);
  lot.zone(o.cn, -DEPTH, -0.05, -hw, hw);
  o.enter(W, M, lot, { hw, t, doorZ, dw, X0: -DEPTH + t, X1: -t, Z0: -hw + t, Z1: hw - t, H: GH - 0.25 });
}

// ------------------------------------------------------------------ 路灯
function lamps(W, M) {
  const spots = [[-1, -5, 1], [1, -9, 0], [-1, -29, 0], [1, -31, 1], [-1, -52, 1], [1, -56, 0], [-1, -76, 0], [1, -79, 1], [-1, -87, 1, 10], [1, -87, 1, 10]];
  for (const [s, z, light, xx] of spots) {
    const x = s * (xx || SH - 0.7);
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    W.scene.add(g);
    g.add(cyl(0.18, 0.22, 0.4, M.iron, 0, 0.2, 0, 10));
    g.add(cyl(0.06, 0.09, 3.4, M.iron, 0, 1.9, 0, 10));
    g.add(cyl(0.12, 0.08, 0.15, M.iron, 0, 3.6, 0, 8));
    g.add(box(0.36, 0.05, 0.36, M.iron, 0, 3.7, 0));
    for (const a of [-1, 1]) for (const b of [-1, 1]) g.add(box(0.03, 0.5, 0.03, M.iron, a * 0.16, 3.95, b * 0.16));
    g.add(box(0.26, 0.42, 0.26, M.lampGlow, 0, 3.95, 0));
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.3, 4), M.iron);
    cap.position.set(0, 4.35, 0);
    cap.rotation.y = Math.PI / 4;
    g.add(cap);
    g.add(sphere(0.05, M.iron, 0, 4.52, 0, 6, 4));
    W.colliders.push({ circle: true, x, z, r: 0.2 });
    addLight(W, new V3(x, 3.9, z), '#ffb366', light ? 24 : 20, 20);
  }
}

// ------------------------------------------------------------------ 古灵阁
function gringotts(W, M) {
  const g = new THREE.Group();
  g.position.set(0, 0, END_Z);
  W.scene.add(g);
  const S = M.stone;
  g.add(box(36, 22, 26, S, 0, 11, -13, 3));
  W.colliders.push({ minX: -18, maxX: 18, minZ: END_Z - 26, maxZ: END_Z });
  for (const y of [0.6, 6.2, 11.5, 16.8, 22]) g.add(box(36.4, y === 0.6 ? 1.2 : 0.5, 0.6, S, 0, y, 0.2, 3));
  for (const x of [-15.5, -10.5, 10.5, 15.5]) {
    for (const [y, lit] of [[3.2, true], [8.8, false], [14.1, false], [19.3, false]]) {
      g.add(box(1.8, 3.2, 0.3, S, x, y, 0.1, 3));
      g.add(box(1.3, 2.6, 0.2, lit ? M.glassLit : M.glassDark, x, y, 0.2));
      g.add(box(0.06, 2.6, 0.24, S, x, y, 0.22));
      g.add(box(0.5, 0.4, 0.4, S, x, y + 1.6, 0.2));
    }
  }
  // 圆形塔楼（分层 + 柱廊）
  const tiers = [{ y0: 0, y1: 6.2, r: 6.0, cols: true }, { y0: 6.2, y1: 11.5, r: 5.6 }, { y0: 11.5, y1: 16.8, r: 5.2, cols: true }, { y0: 16.8, y1: 21, r: 4.8 }];
  for (const tr of tiers) {
    const h = tr.y1 - tr.y0;
    const c = new THREE.Mesh(new THREE.CylinderGeometry(tr.r, tr.r, h, 48), S);
    const uv = c.geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 8, uv.getY(i) * h / 3);
    c.position.y = tr.y0 + h / 2;
    c.castShadow = c.receiveShadow = true;
    g.add(c);
    g.add(cyl(tr.r + 0.35, tr.r + 0.35, 0.45, S, 0, tr.y1, 0, 48));
    if (tr.cols) {
      for (const deg of [-87.5, -62.5, -37.5, -12.5, 12.5, 37.5, 62.5, 87.5]) {
        const a = (deg * Math.PI) / 180, R = tr.r + 0.6;
        const x = Math.sin(a) * R, z = Math.cos(a) * R;
        g.add(cyl(0.3, 0.34, h - 0.9, S, x, tr.y0 + 0.3 + (h - 0.9) / 2, z, 16));
        g.add(box(0.8, 0.3, 0.8, S, x, tr.y0 + 0.15, z));
        g.add(box(0.85, 0.35, 0.85, S, x, tr.y1 - 0.42, z));
      }
    } else {
      for (const deg of [-60, -30, 0, 30, 60]) {
        const a = (deg * Math.PI) / 180;
        const win = new THREE.Group();
        win.position.set(Math.sin(a) * tr.r, tr.y0 + (tr.y1 - tr.y0) / 2, Math.cos(a) * tr.r);
        win.rotation.y = a;
        win.add(box(1.4, 2.6, 0.3, S, 0, 0, 0.05));
        win.add(box(1.0, 2.1, 0.2, M.glassDark, 0, 0, 0.15));
        win.add(box(1.8, 0.15, 0.6, S, 0, -1.35, 0.3));
        g.add(win);
      }
      // 阳台栏杆
      g.add(cyl(tr.r + 0.75, tr.r + 0.75, 0.08, M.iron, 0, tr.y0 + 1.1, 0, 48));
      for (let deg = -90; deg <= 90; deg += 9) {
        const a = (deg * Math.PI) / 180;
        g.add(cyl(0.025, 0.025, 1.0, M.iron, Math.sin(a) * (tr.r + 0.75), tr.y0 + 0.6, Math.cos(a) * (tr.r + 0.75), 4));
      }
    }
  }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(4.8, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), std({ map: M.stone.map, color: '#a8a6a0', roughness: 0.7 }));
  dome.scale.y = 0.6;
  dome.position.y = 21;
  dome.castShadow = dome.receiveShadow = true;
  g.add(dome);
  // 大门 + 台阶
  g.add(box(3.6, 5.0, 0.5, S, 0, 2.5, 5.9));
  g.add(box(2.8, 4.3, 0.2, M.bronze, 0, 2.15, 6.15));
  g.add(box(0.04, 4.3, 0.24, M.iron, 0, 2.15, 6.16));
  for (const s of [-1, 1]) g.add(sphere(0.1, M.gold, s * 0.35, 2.1, 6.3));
  [[7.6, 0.12], [7.2, 0.24], [6.8, 0.36]].forEach(([r, h]) => g.add(cyl(r, r, h, S, 0, h / 2, 0, 48)));
  const tex = T.signTex([{ t: 'GRINGOTTS BANK', s: 1 }], { bg: '#c9c3b6', fg: '#8a6a1a', border: '#8a7a5a', w: 1400, h: 180 });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 0.66), std({ map: tex, roughness: 0.6, metalness: 0.2 }));
  sign.position.set(0, 5.62, 6.62);
  g.add(sign);
  W.colliders.push({ circle: true, x: 0, z: END_Z, r: 7.3 });
  // 尖顶塔楼
  for (const s of [-1, 1]) {
    const x = s * 14.5;
    const tw = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 26, 24), S);
    tw.position.set(x, 13, -0.5);
    tw.castShadow = true;
    g.add(tw);
    const sp = new THREE.Mesh(new THREE.ConeGeometry(2.9, 10, 24), M.slateCone);
    sp.position.set(x, 31, -0.5);
    sp.castShadow = true;
    g.add(sp);
    g.add(cyl(0.05, 0.05, 2.5, M.iron, x, 37, -0.5, 4));
    for (const y of [8, 14, 20]) g.add(box(0.8, 1.6, 0.2, M.glassDark, x, y, 1.9));
    W.colliders.push({ circle: true, x, z: END_Z - 0.5, r: 2.5 });
  }
  // 龙
  const dragon = buildDragon(W);
  dragon.position.set(0, 21 + 4.8 * 0.6 - 0.65, 0.3);
  dragon.scale.setScalar(1.35);
  dragon.rotation.y = 0.55;
  g.add(dragon);
  addLight(W, new V3(0, 27, END_Z + 8), '#ffe2c0', 220, 30, true);
  for (const s of [-1, 1]) addLight(W, new V3(s * 5.5, 0.6, END_Z + 8.5), '#ffcf8a', 40, 16);

  W.interactables.push({
    pos: new V3(0, 1.5, END_Z + 7.5), r: 3,
    label: () => '按 E 叩响古灵阁的青铜大门',
    action: () => { W.sfx.knock(); W.say('「请进，陌生人，但务必留心：贪婪之罪必有恶报……」大门纹丝不动——妖精们今天不接待访客。'); },
  });
}

// ------------------------------------------------------------------ 街道装饰
function dressing(W, M) {
  const S = W.scene;
  // 木桶与板条箱
  const barrels = [[-4.1, -2.5], [-4.2, -3.4], [4.0, -27.5], [4.2, -60.8], [-4.1, -57], [4.1, -71.8], [-4.0, -48.2]];
  for (const [x, z] of barrels) {
    const b = new THREE.Group();
    b.position.set(x, 0, z);
    b.rotation.y = Math.random() * 6;
    b.add(cyl(0.34, 0.3, 0.95, M.wood, 0, 0.475, 0, 14));
    for (const y of [0.15, 0.8]) {
      const h = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.02, 4, 18), M.iron);
      h.rotation.x = Math.PI / 2;
      h.position.y = y;
      b.add(h);
    }
    S.add(b);
    W.colliders.push({ circle: true, x, z, r: 0.38 });
  }
  const crates = [[3.9, -3.5], [3.95, -4.4], [-3.9, -67.5], [3.9, -52.5]];
  for (const [x, z] of crates) {
    const c = box(0.75, 0.7, 0.75, M.wood, x, 0.35, z, 1.5);
    c.rotation.y = rnd(-0.3, 0.3);
    S.add(c);
    if (Math.random() < 0.6) { const c2 = box(0.55, 0.5, 0.55, M.wood, x, 0.95, z, 1.5); c2.rotation.y = rnd(-0.5, 0.5); S.add(c2); }
    W.colliders.push({ circle: true, x, z, r: 0.5 });
  }
  // 横跨街道的彩旗
  const flagMats = ['#8a1a1a', '#c9a227', '#1a4a2a', '#3a2a6a', '#1a3a6a'].map((c) => std({ color: c, roughness: 0.8, side: THREE.DoubleSide }));
  const tri = new THREE.Shape();
  tri.moveTo(-0.16, 0); tri.lineTo(0.16, 0); tri.lineTo(0, -0.42); tri.closePath();
  const triG = new THREE.ShapeGeometry(tri);
  for (const z of [-18, -40, -63]) {
    const y0 = 7.2, sag = 0.9;
    const pts = [];
    for (let i = 0; i <= 20; i++) { const x = -SH - 0.4 + (i / 20) * (2 * SH + 0.8); pts.push(new V3(x, y0 - sag * (1 - Math.pow(x / (SH + 0.4), 2)), z)); }
    const rope = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.012, 4), M.iron);
    S.add(rope);
    for (let i = 1; i < 26; i++) {
      const x = -SH + (i / 26) * 2 * SH;
      const f = new THREE.Mesh(triG, flagMats[i % flagMats.length]);
      f.position.set(x, y0 - sag * (1 - Math.pow(x / (SH + 0.4), 2)), z);
      S.add(f);
    }
  }
  // 通缉令
  const pm = std({ map: T.posterTex(), roughness: 0.9 });
  for (const [x, z, ry] of [[-9, PLAZA_Z - 0.02, Math.PI], [11, PLAZA_Z - 0.02, Math.PI]]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.0), pm);
    p.position.set(x, 1.9, z);
    p.rotation.y = ry;
    S.add(p);
  }
}

// ------------------------------------------------------------------ 空中漂浮的蜡烛（霍格沃茨礼堂式）
function floatingCandles(W) {
  const N = 110;
  const items = [];
  for (let i = 0; i < N; i++) {
    const plaza = i >= 92;
    items.push({
      x: plaza ? rnd(-14, 14) : rnd(-4.0, 4.0),
      z: plaza ? rnd(-86, -79) : rnd(-80, -2),
      y: plaza ? rnd(7, 11) : rnd(4.9, 8.2),
      h: rnd(0.16, 0.32), ph: Math.random() * 6.28, sp: rnd(0.4, 0.8), amp: rnd(0.06, 0.16),
    });
  }
  const body = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.028, 0.032, 1, 8),
    std({ color: '#efe6d2', emissive: '#ffcf90', emissiveIntensity: 0.35, roughness: 0.7 }),
    N,
  );
  body.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  body.userData.dyn = true;
  body.frustumCulled = false;
  W.scene.add(body);
  // 火焰：外层暖色光晕 + 内层亮芯
  const glow = T.glowTex();
  const mkPts = (size, col, opacity) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3).setUsage(THREE.DynamicDrawUsage));
    const m = new THREE.PointsMaterial({ map: glow, size, sizeAttenuation: true, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(...col) });
    const p = new THREE.Points(g, m);
    p.frustumCulled = false;
    p.userData.dyn = true;
    W.scene.add(p);
    return p;
  };
  const halo = mkPts(0.55, [1.6, 0.9, 0.35], 0.9);
  const core = mkPts(0.13, [3.2, 2.6, 1.6], 1);
  // 蜡烛群向周围洒下暖光（登记到灯光池）
  for (let z = -5; z > -82; z -= 8) addLight(W, new V3(rnd(-1.2, 1.2), 6.3, z), '#ffc898', 16, 15);
  addLight(W, new V3(0, 9, -82), '#ffc898', 28, 20);

  W.dayHooks = W.dayHooks || [];
  W.dayHooks.push((day) => { halo.material.opacity = day ? 0.35 : 0.9; core.material.opacity = day ? 0.6 : 1; body.material.emissiveIntensity = day ? 0.05 : 0.35; });

  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new V3(), pos = new V3();
  const hp = halo.geometry.attributes.position, cp = core.geometry.attributes.position;
  W.updaters.push((dt, t) => {
    for (let i = 0; i < N; i++) {
      const c = items[i];
      const y = c.y + Math.sin(t * c.sp + c.ph) * c.amp;
      const x = c.x + Math.sin(t * 0.13 + c.ph) * 0.12;
      pos.set(x, y, c.z);
      sc.set(1, c.h, 1);
      mtx.compose(pos, q, sc);
      body.setMatrixAt(i, mtx);
      const fy = y + c.h / 2 + 0.05;
      const fl = Math.sin(t * 13 + c.ph * 5) * 0.008;
      hp.setXYZ(i, x, fy + 0.02, c.z);
      cp.setXYZ(i, x + fl, fy, c.z);
    }
    body.instanceMatrix.needsUpdate = true;
    hp.needsUpdate = cp.needsUpdate = true;
  });
}
