import * as THREE from 'three';
import { V3 } from './util.js';

// =====================================================================
// 自动巡游：沿预设路线慢速走完整条街一个来回，并进入四家店铺
// 防眩晕设计：慢速(≈1.4m/s)、加减速平滑、转向角速度上限、几乎无头部晃动
// =====================================================================

const EYE = 1.65;
const P = (x, z) => new V3(x, EYE, z);
const L = (x, y, z) => new V3(x, y, z);

function script(W) {
  const say = (t, s = 5) => () => W.say(t, s);
  return [
    { say: '自动巡游开始——放松，让我们慢慢逛一圈对角巷。（按 T 或 Esc 可随时退出）', wait: 1.5 },
    // ---- 奥利凡德魔杖店 ----
    { move: [P(0, -1.5), P(-0.8, -7), P(-2.8, -11.2), P(-4.6, -12.2), P(-6.2, -12.4), P(-7.9, -14.2), P(-8.0, -16.6), P(-7.7, -18.8)] },
    { look: L(-10.1, 1.55, -19.4), dur: 2.2 },
    { act: () => W.olliTry && W.olliTry(), wait: 3.2 },
    { look: L(-14.5, 2.4, -15.2), dur: 3.0 },
    { look: L(-13, 1.3, -21.8), dur: 2.6 },
    { move: [P(-7.7, -18.8), P(-7.9, -15.8), P(-6.8, -12.8), P(-5.0, -12.2), P(-3.0, -12.8), P(0.5, -17), P(2.6, -22.6), P(4.2, -23.7), P(5.6, -23.9), P(6.9, -23.5), P(7.8, -22.2), P(8.2, -20.7)] },
    // ---- 丽痕书店 ----
    { look: L(11.5, 1.6, -19.4), dur: 2.2 },
    { act: () => { if (W.lockhart) { W.lockhart.gesture(2); W.say('吉德罗·洛哈特：「哎呀，一位新读者！要签名吗？我带了孔雀羽毛笔！」', 4.5); } }, wait: 3 },
    { look: L(11, 2.8, -19.5), dur: 3.2 },
    { look: L(7.9, 1.2, -13.4), dur: 2.6 },
    { act: say('笼子里的《妖怪们的妖怪书》正咔哒咔哒地咬着铁栏杆……', 3.5), wait: 0.5 },
    { move: [P(8.2, -20.7), P(7.6, -22.6), P(6.2, -24.1), P(4.6, -23.8), P(2.8, -24.8), P(-0.8, -30.5), P(-3.0, -34.6), P(-4.6, -35.2), P(-6.4, -34.8), P(-8.0, -36.0), P(-8.4, -37.7)] },
    // ---- 斯拉格与吉格斯药店 ----
    { look: L(-11.5, 0.9, -42.8), dur: 2.6 },
    { act: () => { W.sfx.bubble(); W.say('坩埚里咕嘟咕嘟冒着泡——空气里混着薄荷、硫磺和干蟾蜍的味道。', 4); }, wait: 1.5 },
    { look: L(-15.6, 1.5, -44.4), dur: 2.6 },
    { look: L(-12.5, 3.2, -39.5), dur: 2.4 },
    { move: [P(-8.4, -37.7), P(-7.8, -35.6), P(-6.2, -34.9), P(-4.6, -35.2), P(-2.6, -36.4), P(1.0, -42), P(3.0, -46.2), P(4.6, -46.8), P(6.4, -47.3), P(7.5, -46.4)] },
    // ---- 咿啦猫头鹰商店 ----
    { look: L(8.2, 1.35, -44), dur: 2.2 },
    { act: () => W.hedwigHello && W.hedwigHello(), wait: 3 },
    { look: L(12.5, 2.0, -41.5), dur: 2.6 },
    { look: L(9.6, 1.5, -38.2), dur: 2.4 },
    { move: [P(7.5, -46.4), P(6.4, -47.3), P(4.6, -46.8), P(2.8, -48.5), P(0.6, -56), P(0, -64), P(0, -70)] },
    // ---- 古灵阁 ----
    { act: () => { W.dragonBreath && W.dragonBreath(); W.say('抬头看——古灵阁屋顶上的乌克兰铁肚皮龙！', 4); } },
    { look: L(0, 24, -91), dur: 7.5 },
    { look: L(0, 3.2, -85.5), dur: 2.5 },
    { act: () => W.spells && W.spells.cast(3), wait: 4.5 },
    // ---- 返回 ----
    { move: [P(0, -70), P(0.6, -60), P(-1.0, -46), P(1.0, -31), P(-0.6, -16), P(0, -4)] },
    { look: L(0, 2.2, 2), dur: 2 },
    { say: '巡游结束！欢迎再来对角巷。（已回到手动模式，可继续自由探索）', end: true },
  ];
}

const wrap = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

export function createTour(W, camera, hooks = {}) {
  const fade = document.getElementById('fade');
  const T = { active: false };
  let steps = [], si = 0, st = null;
  let yaw = 0, pitch = 0, t = 0;
  const opened = new Set();

  function angTo(target) {
    const p = camera.position;
    const dx = target.x - p.x, dy = target.y - p.y, dz = target.z - p.z;
    return [Math.atan2(-dx, -dz), Math.atan2(dy, Math.hypot(dx, dz))];
  }
  // 平滑 + 角速度上限的转向
  function turnTo(ty, tp, dt, maxRate = 0.75) {
    const dy = wrap(ty - yaw), dp = tp - pitch;
    const k = 1 - Math.exp(-1.7 * dt);
    yaw = wrap(yaw + Math.max(-maxRate * dt, Math.min(maxRate * dt, dy * k)));
    pitch += Math.max(-maxRate * 0.7 * dt, Math.min(maxRate * 0.7 * dt, dp * k));
    pitch = Math.max(-1.0, Math.min(1.0, pitch));
    return Math.abs(dy) + Math.abs(dp) * 0.5;
  }

  function begin(i) {
    si = i;
    if (si >= steps.length) { T.stop(); return; }
    const s = steps[si];
    st = { s, t: 0 };
    if (s.move) {
      const curve = new THREE.CatmullRomCurve3(s.move, false, 'centripetal', 0.5);
      st.curve = curve;
      st.len = curve.getLength();
      st.d = 0;
      st.v = 0;
      st.aligned = false;
    }
    if (s.act) s.act();
    if (s.say) W.say(s.say, s.end ? 6 : 5);
  }

  T.start = () => {
    if (T.active) return;
    T.active = true;
    steps = script(W);
    hooks.onStart && hooks.onStart();
    fade.classList.add('on');
    setTimeout(() => {
      // 传送到起点
      camera.position.copy(steps[1].move[0]);
      yaw = 0; pitch = 0;
      camera.rotation.set(0, 0, 0, 'YXZ');
      for (const d of W.doors) d.set(false);
      opened.clear();
      begin(0);
      setTimeout(() => fade.classList.remove('on'), 150);
    }, 650);
    st = null;
  };

  // 调试用：无渐变立即开始
  T.startNow = () => {
    T.active = true;
    steps = script(W);
    hooks.onStart && hooks.onStart();
    camera.position.copy(steps[1].move[0]);
    yaw = 0; pitch = 0;
    begin(0);
  };

  T.stop = (silent) => {
    if (!T.active) return;
    T.active = false;
    st = null;
    camera.position.y = EYE;
    hooks.onEnd && hooks.onEnd();
    if (!silent && si < steps.length - 1) W.say('已退出自动巡游。', 2);
  };

  const ahead = new V3(), tan = new V3();
  T.update = (dt) => {
    if (!T.active || !st) return;
    t += dt;
    const s = st.s;
    st.t += dt;
    let done = false;
    if (s.move) {
      const c = st.curve;
      // 先原地转向路线方向，避免边走边大幅扭头
      if (!st.aligned) {
        c.getPointAt(Math.min(1, 2.5 / st.len), ahead);
        ahead.y = 1.55;
        const [ty, tp] = angTo(ahead);
        const err = turnTo(ty, tp, dt, 0.85);
        if (err < 0.22 || st.t > 6) st.aligned = true;
      } else {
        const A = 0.7, VMAX = 1.4;
        const remain = st.len - st.d;
        const vt = Math.min(VMAX, Math.sqrt(2 * A * Math.max(0, remain)) + 0.12);
        st.v += Math.max(-A * 1.5 * dt, Math.min(A * dt, vt - st.v));
        st.d = Math.min(st.len, st.d + st.v * dt);
        const u = st.d / st.len;
        c.getPointAt(u, camera.position);
        // 视线：前方 3 米处
        const la = st.d + 3;
        if (la <= st.len) c.getPointAt(la / st.len, ahead);
        else { c.getPointAt(1, ahead); c.getTangentAt(1, tan); ahead.addScaledVector(tan, la - st.len); }
        ahead.y = 1.55;
        const [ty, tp] = angTo(ahead);
        turnTo(ty, tp, dt);
        // 极轻微的步伐起伏
        camera.position.y = EYE + Math.sin(st.d * 3.6) * 0.008 * Math.min(1, st.v);
        if (st.d >= st.len - 1e-3) done = true;
      }
    } else if (s.look) {
      const [ty, tp] = angTo(s.look);
      turnTo(ty, tp, dt);
      if (st.t >= s.dur) done = true;
    } else {
      if (st.t >= (s.wait || 0)) done = true;
    }
    if (s.end && st.t >= 0.1) { T.stop(true); return; }
    camera.rotation.set(pitch, yaw, 0, 'YXZ');

    // 自动开门 / 离开后关门
    for (const d of W.doors) {
      const dist = Math.hypot(d.pos.x - camera.position.x, d.pos.z - camera.position.z);
      if (dist < 4.2 && !d.open) { d.set(true); opened.add(d); }
      else if (dist > 9 && d.open && opened.has(d)) { d.set(false); opened.delete(d); }
    }
    if (done) begin(si + 1);
  };

  return T;
}
