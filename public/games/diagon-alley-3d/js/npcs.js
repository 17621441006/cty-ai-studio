import * as THREE from 'three';
import { makeCharacter, CAST } from './characters.js';
import { V3, pick, rnd } from './util.js';

const _p = new V3();

/** 注册一个可交谈的角色（交互点会跟随角色移动） */
function talkable(W, ch, onTalk) {
  const it = {
    pos: new V3(), r: 2.2,
    label: () => `按 E 与「${ch.spec.name}」交谈`,
    action: () => {
      W.say(`${ch.spec.name}：「${pick(ch.spec.lines)}」`, 6);
      ch.gesture(1.6);
      onTalk && onTalk();
    },
  };
  W.interactables.push(it);
  W.updaters.push(() => { ch.root.getWorldPosition(it.pos); it.pos.y = 1.5; });
  return it;
}

/** 店铺里的 NPC：放在地块本地坐标中，yaw 为本地朝向（0 = 本地 +z，π/2 = 朝街道） */
export function placeKeeper(W, lot, key, lx, lz, yaw) {
  const ch = makeCharacter(CAST[key]);
  ch.root.position.set(lx, 0, lz);
  ch.root.rotation.y = yaw;
  lot.g.add(ch.root);
  const r = 0.32 * (CAST[key].w || 1);
  const col = lot.circle(lx, lz, r);
  W.npcs.push({ ch, col, hit: () => { ch.gesture(1.2); W.say(`${ch.spec.name}：「嘿！店里禁止施咒！」`, 3); } });
  W.updaters.push((dt) => ch.update(dt, 0, W.camera.position));
  talkable(W, ch);
  return ch;
}

/** 街上行走的角色组。members: [[key, dx]]，沿 z 方向往返 */
function walker(W, members, x, zMin, zMax, speed, startZ, dir) {
  const g = {
    x, z: startZ, dir, speed, yaw: dir < 0 ? Math.PI : 0, state: 'walk', turnT: 0, pause: 0,
    members: members.map(([key, dx]) => {
      const ch = makeCharacter(CAST[key]);
      W.scene.add(ch.root);
      const col = { circle: true, x: 0, z: 0, r: 0.32 * (CAST[key].w || 1) * (CAST[key].h || 1) };
      W.colliders.push(col);
      const m = { ch, dx, col };
      W.npcs.push({ ch, col, hit: () => { g.pause = 3; ch.gesture(1.2); W.say(`${ch.spec.name}：「${pick(['嘿！小心点！', '你差点打中我！', '收起你的魔杖！'])}」`, 3); } });
      talkable(W, ch, () => { g.pause = 6; });
      return m;
    }),
  };
  W.walkers.push(g);
  W.updaters.push((dt) => {
    const cam = W.camera.position;
    let moving = false;
    g.pause -= dt;
    if (g.state === 'turn') {
      g.turnT -= dt;
      if (g.turnT <= 0) g.state = 'walk';
    } else if (g.pause <= 0) {
      // 前方有玩家或其他行人则停下
      let blocked = false;
      for (const m of g.members) {
        const mx = g.x + m.dx;
        const ahead = (cam.z - g.z) * g.dir;
        if (ahead > 0 && ahead < 1.9 && Math.abs(cam.x - mx) < 0.9) blocked = true;
        for (const o of W.walkers) {
          if (o === g) continue;
          for (const om of o.members) {
            const a2 = (o.z - g.z) * g.dir;
            if (a2 > 0 && a2 < 1.4 && Math.abs(o.x + om.dx - mx) < 0.75) blocked = true;
          }
        }
      }
      if (!blocked) {
        g.z += g.dir * g.speed * dt;
        moving = true;
        if (g.z < zMin || g.z > zMax) {
          g.z = Math.max(zMin, Math.min(zMax, g.z));
          g.dir = -g.dir;
          g.state = 'turn';
          g.turnT = 1.6;
        }
      }
    }
    // 朝向：说话时面向玩家
    let targetYaw = g.dir < 0 ? Math.PI : 0;
    if (g.pause > 0) targetYaw = Math.atan2(cam.x - g.x, cam.z - g.z);
    let d = targetYaw - g.yaw;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    g.yaw += d * Math.min(1, dt * 2.5);
    const weave = Math.sin(g.z * 0.12) * 0.25;
    // 玩家靠近时侧身让路
    let want = 0;
    const lat = cam.x - (g.x + weave);
    const span = Math.max(...g.members.map((m) => Math.abs(m.dx)));
    if (Math.abs(cam.z - g.z) < 2.6 && Math.abs(lat) < 1.3 + span) want = (lat > 0 ? -1 : 1) * (1.35 + span - Math.abs(lat));
    if (g.x + want < -4.2 || g.x + want > 4.2) want = -want;
    g.side = (g.side || 0) + (want - (g.side || 0)) * Math.min(1, dt * 2.2);
    for (const m of g.members) {
      const px = g.x + m.dx + weave + g.side, pz = g.z;
      m.ch.root.position.set(px, 0, pz);
      m.ch.root.rotation.y = g.yaw;
      m.col.x = px; m.col.z = pz;
      m.ch.update(dt, moving ? g.speed : (g.state === 'turn' ? 0.6 : 0), cam);
    }
  });
  return g;
}

export function buildStreetNPCs(W) {
  // 金色三人组并排而行
  walker(W, [['hermione', -0.65], ['harry', 0], ['ron', 0.65]], -1.6, -76, -6, 1.05, -20, -1);
  walker(W, [['hagrid', 0]], 2.3, -78, -5, 0.95, -55, 1);
  walker(W, [['dumbledore', 0]], -3.3, -74, -8, 0.7, -40, 1);
  walker(W, [['mcgonagall', 0]], 0.9, -80, -4, 1.1, -10, -1);
  walker(W, [['snape', 0]], 3.4, -79, -6, 1.45, -66, -1);
  walker(W, [['witch', 0]], 0.0, -70, -12, 0.9, -60, 1);
  walker(W, [['wizard', 0]], -0.7, -60, -3, 0.85, -30, -1);
  walker(W, [['aberforth', 0]], 2.8, -70, -10, 0.8, -25, 1);
  walker(W, [['doge', 0]], -2.5, -76, -14, 0.65, -60, -1);
  // 幽灵：格雷女士缓缓飘过街道（不阻挡行人）
  const gl = walker(W, [['greylady', 0]], -0.9, -72, -10, 0.45, -48, 1);
  gl.members.forEach((m) => { m.col.r = 0; });
  // 街边站立的角色（面朝街道）
  standing(W, 'bellatrix', -4.15, -61.5, Math.PI / 2 + 0.3);
  standing(W, 'hag', -4.2, -63.4, Math.PI / 2 - 0.2);
  standing(W, 'fleur', 5.2, -85.6, -0.5);
  // 冰霜精灵：在古灵阁广场上空盘旋
  const wisp = makeCharacter(CAST.wisp);
  W.scene.add(wisp.root);
  const wcol = { circle: true, x: 0, z: 0, r: 0 };
  W.npcs.push({ ch: wisp, col: { r: 0.4 }, hit: () => { W.say('冰霜精灵：「咻——！」（它躲开了你的咒语）', 3); } });
  talkable(W, wisp);
  let wt = 0;
  W.updaters.push((dt) => {
    wt += dt * 0.35;
    const x = Math.cos(wt) * 4.2, z = -84.5 + Math.sin(wt) * 2.6;
    wisp.root.position.set(x, 0, z);
    wisp.root.rotation.y = -wt + Math.PI;
    wcol.x = x; wcol.z = z;
    wisp.update(dt, 0, W.camera.position);
  });
}

/** 站着不动的角色（会转身看向靠近的玩家） */
function standing(W, key, x, z, yaw) {
  const ch = makeCharacter(CAST[key]);
  ch.root.position.set(x, 0, z);
  ch.root.rotation.y = yaw;
  W.scene.add(ch.root);
  const col = { circle: true, x, z, r: 0.35 };
  W.colliders.push(col);
  W.npcs.push({ ch, col, hit: () => { ch.gesture(1.2); W.say(`${ch.spec.name}：「${pick(['你敢对我施咒？', '有意思……', '小心你的魔杖！'])}」`, 3); } });
  W.updaters.push((dt) => ch.update(dt, 0, W.camera.position));
  talkable(W, ch);
  return ch;
}

/** 咒语命中 NPC 检测 */
export function npcHitTest(W, p) {
  for (const n of W.npcs) {
    n.ch.root.getWorldPosition(_p);
    const h = 1.8 * (n.ch.spec.h || 1);
    if (p.y < h && Math.hypot(p.x - _p.x, p.z - _p.z) < n.col.r + 0.15) { n.hit(); return true; }
  }
  return false;
}
