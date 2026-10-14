import * as THREE from 'three';
import { rnd, pick } from './util.js';

// 所有贴图均用 Canvas 程序化生成，无需外部图片资源

function make(w, h, draw, { srgb = true, repeat = [1, 1], wrap = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (wrap) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function speckle(g, w, h, n, alpha, light = true) {
  for (let i = 0; i < n; i++) {
    const v = light ? (Math.random() * 255) | 0 : (Math.random() * 60) | 0;
    g.fillStyle = `rgba(${v},${v},${v},${alpha * Math.random()})`;
    g.fillRect(Math.random() * w, Math.random() * h, rnd(1, 3), rnd(1, 3));
  }
}

function blotches(g, w, h, n, rMin, rMax, colors) {
  for (let i = 0; i < n; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = rnd(rMin, rMax);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, pick(colors));
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    // draw wrapped so the texture tiles seamlessly
    for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) {
      g.save(); g.translate(dx, dy); g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
    }
  }
}

export function cobbleTex() {
  return make(512, 512, (g, w, h) => {
    g.fillStyle = '#16130f';
    g.fillRect(0, 0, w, h);
    const rows = 14, rh = h / rows;
    const stone = (cx, cy, rx, ry) => {
      const l = rnd(26, 46), hue = rnd(20, 40);
      const gr = g.createRadialGradient(cx - rx * 0.3, cy - ry * 0.35, 1, cx, cy, Math.max(rx, ry) * 1.1);
      gr.addColorStop(0, `hsl(${hue},${rnd(4, 12)}%,${l + 14}%)`);
      gr.addColorStop(0.7, `hsl(${hue},8%,${l}%)`);
      gr.addColorStop(1, `hsl(${hue},8%,${l - 12}%)`);
      g.fillStyle = gr;
      g.beginPath();
      g.ellipse(cx, cy, rx, ry, rnd(-0.12, 0.12), 0, Math.PI * 2);
      g.fill();
    };
    for (let r = 0; r < rows; r++) {
      let x = -rnd(0, 30);
      while (x < w) {
        const sw = rnd(28, 48);
        const cx = x + sw / 2, cy = r * rh + rh / 2 + rnd(-1.5, 1.5);
        const rx = sw / 2 - rnd(1.5, 3), ry = rh / 2 - rnd(1.5, 3);
        stone(cx, cy, rx, ry);
        if (cx + rx > w) stone(cx - w, cy, rx, ry);
        if (cx - rx < 0) stone(cx + w, cy, rx, ry);
        x += sw;
      }
    }
    blotches(g, w, h, 10, 40, 110, ['rgba(10,15,25,0.35)', 'rgba(60,50,40,0.2)']); // 湿润的水渍
    speckle(g, w, h, 5000, 0.15);
  });
}

export function flagTex() {
  return make(512, 512, (g, w, h) => {
    g.fillStyle = '#2a2622';
    g.fillRect(0, 0, w, h);
    const rows = 4;
    for (let r = 0; r < rows; r++) {
      let x = r % 2 ? -64 : 0;
      while (x < w) {
        const sw = pick([128, 192, 128, 96]);
        const l = rnd(36, 50);
        g.fillStyle = `hsl(35,${rnd(5, 10)}%,${l}%)`;
        g.fillRect(x + 3, r * 128 + 3, sw - 6, 122);
        x += sw;
      }
    }
    blotches(g, w, h, 18, 20, 70, ['rgba(0,0,0,0.25)', 'rgba(255,240,220,0.08)']);
    speckle(g, w, h, 6000, 0.2);
  });
}

export function brickTex(hue = 12, sat = 45, lum = 33) {
  return make(512, 512, (g, w, h) => {
    g.fillStyle = '#5a524a';
    g.fillRect(0, 0, w, h);
    const bw = 64, bh = 32;
    for (let r = 0; r < h / bh; r++) {
      const off = r % 2 ? bw / 2 : 0;
      for (let c = -1; c < w / bw + 1; c++) {
        g.fillStyle = `hsl(${hue + rnd(-6, 6)},${sat + rnd(-10, 6)}%,${lum + rnd(-9, 8)}%)`;
        g.fillRect(c * bw + off + 2, r * bh + 2, bw - 4, bh - 4);
        g.fillStyle = 'rgba(0,0,0,0.15)';
        g.fillRect(c * bw + off + 2, r * bh + bh - 6, bw - 4, 4);
      }
    }
    blotches(g, w, h, 14, 30, 100, ['rgba(0,0,0,0.25)', 'rgba(40,60,30,0.15)', 'rgba(255,255,255,0.06)']);
    speckle(g, w, h, 8000, 0.2);
  });
}

export function plasterTex(color = '#d8ccb0') {
  return make(512, 512, (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    blotches(g, w, h, 40, 30, 140, ['rgba(0,0,0,0.10)', 'rgba(255,255,255,0.10)', 'rgba(90,70,40,0.12)']);
    // 雨水留下的竖向污渍
    for (let i = 0; i < 18; i++) {
      const x = Math.random() * w, ww = rnd(4, 18);
      const gr = g.createLinearGradient(0, 0, 0, rnd(80, 300));
      gr.addColorStop(0, 'rgba(40,30,20,0.18)');
      gr.addColorStop(1, 'rgba(40,30,20,0)');
      g.fillStyle = gr;
      g.fillRect(x, 0, ww, h);
    }
    speckle(g, w, h, 9000, 0.12);
  });
}

export function woodTex(hue = 28, sat = 40, lum = 28, planks = true) {
  return make(512, 512, (g, w, h) => {
    g.fillStyle = `hsl(${hue},${sat}%,${lum}%)`;
    g.fillRect(0, 0, w, h);
    const pw = planks ? 64 : 512;
    for (let x = 0; x < w; x += pw) {
      g.fillStyle = `hsla(${hue + rnd(-4, 4)},${sat}%,${lum + rnd(-6, 6)}%,1)`;
      g.fillRect(x, 0, pw, h);
      for (let i = 0; i < 26; i++) {
        g.strokeStyle = `hsla(${hue},${sat}%,${lum - rnd(6, 14)}%,${rnd(0.2, 0.6)})`;
        g.lineWidth = rnd(0.5, 2);
        g.beginPath();
        const gx = x + Math.random() * pw;
        g.moveTo(gx, 0);
        for (let y = 0; y <= h; y += 32) g.lineTo(gx + Math.sin(y * 0.02 + i) * rnd(1, 4), y);
        g.stroke();
      }
      if (planks) {
        g.fillStyle = 'rgba(0,0,0,0.55)';
        g.fillRect(x, 0, 2, h);
        const cut = Math.random() * h;
        g.fillRect(x, cut, pw, 2);
      }
    }
    speckle(g, w, h, 3000, 0.1);
  });
}

export function slateTex() {
  return make(512, 512, (g, w, h) => {
    g.fillStyle = '#1c1d22';
    g.fillRect(0, 0, w, h);
    const th = 32, tw = 42;
    for (let r = 0; r < h / th; r++) {
      const off = r % 2 ? tw / 2 : 0;
      for (let c = -1; c < w / tw + 1; c++) {
        const l = rnd(18, 32);
        g.fillStyle = `hsl(${rnd(205, 230)},${rnd(6, 14)}%,${l}%)`;
        g.fillRect(c * tw + off + 1, r * th + 1, tw - 2, th - 2);
        const gr = g.createLinearGradient(0, r * th, 0, r * th + th);
        gr.addColorStop(0, 'rgba(0,0,0,0.45)');
        gr.addColorStop(0.3, 'rgba(0,0,0,0)');
        g.fillStyle = gr;
        g.fillRect(c * tw + off + 1, r * th + 1, tw - 2, th - 2);
      }
    }
    blotches(g, w, h, 12, 30, 90, ['rgba(70,90,50,0.18)', 'rgba(0,0,0,0.2)']);
    speckle(g, w, h, 4000, 0.15);
  }, { repeat: [0.33, 0.33] });
}

export function stoneTex() {
  return make(512, 512, (g, w, h) => {
    g.fillStyle = '#8a857c';
    g.fillRect(0, 0, w, h);
    const bw = 128, bh = 64;
    for (let r = 0; r < h / bh; r++) {
      const off = r % 2 ? bw / 2 : 0;
      for (let c = -1; c < w / bw + 1; c++) {
        g.fillStyle = `hsl(40,${rnd(5, 12)}%,${rnd(76, 86)}%)`;
        g.fillRect(c * bw + off + 1.5, r * bh + 1.5, bw - 3, bh - 3);
      }
    }
    blotches(g, w, h, 30, 30, 120, ['rgba(60,55,50,0.14)', 'rgba(255,255,255,0.1)', 'rgba(40,40,45,0.1)']);
    speckle(g, w, h, 9000, 0.12);
  });
}

export function scaleTex() {
  return make(256, 256, (g, w, h) => {
    g.fillStyle = '#8f8a80';
    g.fillRect(0, 0, w, h);
    const s = 16;
    for (let r = 0; r < h / (s * 0.6) + 2; r++) {
      const off = r % 2 ? s / 2 : 0;
      for (let c = -1; c < w / s + 1; c++) {
        const x = c * s + off, y = r * s * 0.6;
        const gr = g.createRadialGradient(x, y - 3, 1, x, y, s * 0.7);
        const l = rnd(70, 86);
        gr.addColorStop(0, `hsl(45,8%,${l}%)`);
        gr.addColorStop(1, `hsl(40,6%,${l - 30}%)`);
        g.fillStyle = gr;
        g.beginPath();
        g.arc(x, y, s * 0.62, 0, Math.PI);
        g.fill();
      }
    }
  });
}

export function furTex() {
  return make(128, 128, (g, w, h) => {
    g.fillStyle = '#3d2814';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1500; i++) {
      g.strokeStyle = `hsla(${rnd(20, 35)},${rnd(30, 50)}%,${rnd(10, 40)}%,0.8)`;
      g.beginPath();
      const x = Math.random() * w, y = Math.random() * h;
      g.moveTo(x, y);
      g.lineTo(x + rnd(-4, 4), y + rnd(3, 9));
      g.stroke();
    }
  });
}

export function strawTex() {
  return make(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 700; i++) {
      g.strokeStyle = `hsla(${rnd(40, 50)},${rnd(50, 70)}%,${rnd(40, 70)}%,0.9)`;
      g.lineWidth = rnd(1, 2.5);
      const x = rnd(20, w - 20), y = rnd(20, h - 20), a = Math.random() * Math.PI, l = rnd(8, 30);
      const d = Math.hypot(x - w / 2, y - h / 2);
      if (d > w * 0.45) continue;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      g.stroke();
    }
  }, { wrap: false });
}

/** 招牌贴图. lines: [{t, s, f}] 或字符串. */
export function signTex(lines, o = {}) {
  const W = o.w || 1024, H = o.h || 256;
  return make(W, H, (g, w, h) => {
    const bg = o.bg || '#2a1a10', fg = o.fg || '#e8c66a', border = o.border || '#b8913a';
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    // 做旧
    blotches(g, w, h, 20, 20, 120, ['rgba(0,0,0,0.25)', 'rgba(255,255,255,0.05)']);
    speckle(g, w, h, 2500, 0.1);
    if (border !== 'none') {
      g.strokeStyle = border;
      g.lineWidth = Math.max(4, h * 0.03);
      g.strokeRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12);
      g.lineWidth = 2;
      g.strokeRect(h * 0.1, h * 0.1, w - h * 0.2, h - h * 0.2);
    }
    const ls = lines.map((l) => (typeof l === 'string' ? { t: l } : l));
    const total = ls.reduce((a, l) => a + (l.s || 1), 0);
    let y = h * 0.14;
    const avail = h * 0.72;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (const l of ls) {
      const lh = (avail * (l.s || 1)) / total;
      let size = lh * 0.78;
      const font = (s) => `${l.i ? 'italic ' : ''}${l.b === false ? '' : 'bold '}${s}px ${l.f || o.font || 'Georgia, "Times New Roman", serif'}`;
      g.font = font(size);
      while (g.measureText(l.t).width > w * 0.86 && size > 8) { size -= 2; g.font = font(size); }
      g.shadowColor = 'rgba(0,0,0,0.6)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 3;
      g.fillStyle = l.c || fg;
      g.fillText(l.t, w / 2, y + lh / 2);
      g.shadowColor = 'transparent';
      y += lh;
    }
  }, { wrap: false });
}

export function posterTex() {
  return make(256, 360, (g, w, h) => {
    g.fillStyle = '#d9c9a0';
    g.fillRect(0, 0, w, h);
    blotches(g, w, h, 20, 20, 80, ['rgba(120,80,30,0.2)', 'rgba(0,0,0,0.08)']);
    g.fillStyle = '#2a1a10';
    g.textAlign = 'center';
    g.font = 'bold 44px Georgia';
    g.fillText('WANTED', w / 2, 52);
    // 照片框
    g.fillStyle = '#3a3530';
    g.fillRect(40, 72, w - 80, 190);
    const gr = g.createRadialGradient(w / 2, 150, 10, w / 2, 160, 100);
    gr.addColorStop(0, '#8a8070');
    gr.addColorStop(1, '#2a2520');
    g.fillStyle = gr;
    g.fillRect(46, 78, w - 92, 178);
    g.fillStyle = '#1a1612';
    g.beginPath(); g.ellipse(w / 2, 150, 36, 46, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(w / 2, 240, 70, 40, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#2a1a10';
    g.font = 'bold 30px Georgia';
    g.fillText('SIRIUS BLACK', w / 2, 296);
    g.font = 'italic 16px Georgia';
    g.fillText('Ministry of Magic · Reward', w / 2, 326);
    g.fillText('10,000 Galleons', w / 2, 346);
  }, { wrap: false });
}

export function glowTex() {
  return make(64, 64, (g, w, h) => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.25, 'rgba(255,255,255,0.7)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  }, { wrap: false, srgb: false });
}

export function sparkTex() {
  return make(64, 64, (g, w, h) => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 14);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.9)';
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(32, 2); g.lineTo(32, 62); g.moveTo(2, 32); g.lineTo(62, 32); g.stroke();
  }, { wrap: false, srgb: false });
}

export function smokeTex() {
  return make(128, 128, (g, w, h) => {
    for (let i = 0; i < 26; i++) {
      const x = 64 + rnd(-24, 24), y = 64 + rnd(-24, 24), r = rnd(16, 40);
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(255,255,255,0.22)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
    }
  }, { wrap: false, srgb: false });
}

// =====================================================================
// PBR 地面：花岗岩方石（参考约克 Shambles / 环球影城对角巷的湿润石板路）
// =====================================================================
function cv(S) {
  const c = document.createElement('canvas');
  c.width = c.height = S;
  return { c, g: c.getContext('2d') };
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function heightToNormal(hc, strength) {
  const S = hc.width;
  const src = hc.getContext('2d').getImageData(0, 0, S, S).data;
  const out = document.createElement('canvas');
  out.width = out.height = S;
  const og = out.getContext('2d');
  const img = og.createImageData(S, S);
  const d = img.data;
  const H = (x, y) => src[(((y + S) % S) * S + ((x + S) % S)) * 4] / 255;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * strength;
      const dy = (H(x, y + 1) - H(x, y - 1)) * strength;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * S + x) * 4;
      d[i] = (-dx / l * 0.5 + 0.5) * 255;
      d[i + 1] = (dy / l * 0.5 + 0.5) * 255;
      d[i + 2] = (1 / l * 0.5 + 0.5) * 255;
      d[i + 3] = 255;
    }
  }
  og.putImageData(img, 0, 0);
  return out;
}

function wrapDraw(S, x, y, w, h, fn) {
  for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) {
    if (x + dx + w < 0 || x + dx > S || y + dy + h < 0 || y + dy > S) continue;
    fn(x + dx, y + dy);
  }
}

function finishPBR(col, hgt, rgh, strength) {
  // 柔化高度图，得到圆润倒角
  const blur = cv(hgt.c.width);
  blur.g.filter = 'blur(2px)';
  blur.g.drawImage(hgt.c, 0, 0);
  const nrm = heightToNormal(blur.c, strength);
  const mk = (canvas, srgb) => {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 16;
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    return t;
  };
  return { map: mk(col.c, true), normalMap: mk(nrm, false), roughnessMap: mk(rgh.c, false) };
}

function puddles(S, col, hgt, rgh, n) {
  for (let i = 0; i < n; i++) {
    const x = Math.random() * S, y = Math.random() * S, r = rnd(S * 0.06, S * 0.16);
    const sx = rnd(0.6, 1.6);
    wrapDraw(S, x - r * sx, y - r, r * 2 * sx, r * 2, (px, py) => {
      const cx = px + r * sx, cy = py + r;
      for (const [g, c0] of [[rgh.g, 'rgba(10,10,10,0.85)'], [col.g, 'rgba(5,8,14,0.28)'], [hgt.g, 'rgba(120,120,120,0.45)']]) {
        g.save();
        g.translate(cx, cy);
        g.scale(sx, 1);
        const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
        gr.addColorStop(0, c0);
        gr.addColorStop(0.6, c0);
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr;
        g.fillRect(-r, -r, r * 2, r * 2);
        g.restore();
      }
    });
  }
}

/** 小块花岗岩方石（setts），错缝排列，带湿润水洼 */
export function settsPBR() {
  const S = 1024;
  const col = cv(S), hgt = cv(S), rgh = cv(S);
  col.g.fillStyle = '#191817'; col.g.fillRect(0, 0, S, S);
  hgt.g.fillStyle = '#202020'; hgt.g.fillRect(0, 0, S, S);
  rgh.g.fillStyle = 'rgb(95,95,95)'; rgh.g.fillRect(0, 0, S, S); // 缝隙里有水，较光滑
  const rows = 20, rh = S / rows;
  for (let r = 0; r < rows; r++) {
    let x = -rnd(0, 70);
    const y0 = r * rh;
    while (x < S) {
      const w = rnd(56, 86);
      const gap = rnd(2.5, 4.5);
      const sx = x + gap + rnd(-1.5, 1.5), sy = y0 + gap + rnd(-1.5, 1.5);
      const sw = w - gap * 2, sh = rh - gap * 2;
      const warm = Math.random() < 0.3;
      const hue = warm ? rnd(22, 38) : rnd(200, 228);
      const sat = rnd(3, warm ? 12 : 9), lum = rnd(24, 44);
      const base = rnd(150, 215);
      const rough = rnd(150, 205);
      wrapDraw(S, sx, sy, sw, sh, (px, py) => {
        // 颜色
        col.g.save();
        roundRect(col.g, px, py, sw, sh, 8);
        col.g.clip();
        const gr = col.g.createLinearGradient(px, py, px + sw * 0.3, py + sh);
        gr.addColorStop(0, `hsl(${hue},${sat}%,${lum + 6}%)`);
        gr.addColorStop(1, `hsl(${hue},${sat}%,${lum - 5}%)`);
        col.g.fillStyle = gr;
        col.g.fillRect(px, py, sw, sh);
        for (let k = 0; k < 60; k++) { // 花岗岩颗粒
          const v = Math.random() < 0.5 ? 255 : 0;
          col.g.fillStyle = `rgba(${v},${v},${v},${rnd(0.04, 0.16)})`;
          col.g.fillRect(px + Math.random() * sw, py + Math.random() * sh, rnd(1, 2.5), rnd(1, 2.5));
        }
        col.g.strokeStyle = 'rgba(0,0,0,0.35)';
        col.g.lineWidth = 3;
        roundRect(col.g, px, py, sw, sh, 8);
        col.g.stroke();
        col.g.restore();
        // 高度：外圈低、内圈高 => 磨圆的石面
        hgt.g.fillStyle = `rgb(${base - 70},${base - 70},${base - 70})`;
        roundRect(hgt.g, px, py, sw, sh, 8); hgt.g.fill();
        hgt.g.fillStyle = `rgb(${base},${base},${base})`;
        roundRect(hgt.g, px + 5, py + 5, sw - 10, sh - 10, 6); hgt.g.fill();
        // 粗糙度：石面被磨得半光
        rgh.g.fillStyle = `rgb(${rough},${rough},${rough})`;
        roundRect(rgh.g, px, py, sw, sh, 8); rgh.g.fill();
      });
      x += w;
    }
  }
  puddles(S, col, hgt, rgh, 9);
  return finishPBR(col, hgt, rgh, 2.2);
}

/** 人行道大石板 */
export function flagsPBR(lightness = 1) {
  const S = 1024;
  const col = cv(S), hgt = cv(S), rgh = cv(S);
  col.g.fillStyle = '#1e1d1b'; col.g.fillRect(0, 0, S, S);
  hgt.g.fillStyle = '#303030'; hgt.g.fillRect(0, 0, S, S);
  rgh.g.fillStyle = 'rgb(110,110,110)'; rgh.g.fillRect(0, 0, S, S);
  const rows = 4, rh = S / rows;
  for (let r = 0; r < rows; r++) {
    let x = r % 2 ? -rnd(100, 200) : -rnd(0, 80);
    while (x < S) {
      const w = pick([256, 320, 384, 220]);
      const gap = 4;
      const sx = x + gap, sy = r * rh + gap, sw = w - gap * 2, sh = rh - gap * 2;
      const lum = rnd(34, 50) * lightness, hue = rnd(25, 45);
      const base = rnd(170, 220), rough = rnd(150, 210);
      wrapDraw(S, sx, sy, sw, sh, (px, py) => {
        col.g.save();
        roundRect(col.g, px, py, sw, sh, 5);
        col.g.clip();
        col.g.fillStyle = `hsl(${hue},${rnd(4, 9)}%,${lum}%)`;
        col.g.fillRect(px, py, sw, sh);
        for (let k = 0; k < 6; k++) {
          const bx = px + Math.random() * sw, by = py + Math.random() * sh, br = rnd(20, 70);
          const gr = col.g.createRadialGradient(bx, by, 0, bx, by, br);
          gr.addColorStop(0, `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,250,240'},0.10)`);
          gr.addColorStop(1, 'rgba(0,0,0,0)');
          col.g.fillStyle = gr;
          col.g.fillRect(bx - br, by - br, br * 2, br * 2);
        }
        for (let k = 0; k < 400; k++) {
          const v = Math.random() < 0.5 ? 255 : 0;
          col.g.fillStyle = `rgba(${v},${v},${v},${rnd(0.03, 0.1)})`;
          col.g.fillRect(px + Math.random() * sw, py + Math.random() * sh, rnd(1, 2), rnd(1, 2));
        }
        col.g.restore();
        hgt.g.fillStyle = `rgb(${base - 60},${base - 60},${base - 60})`;
        roundRect(hgt.g, px, py, sw, sh, 5); hgt.g.fill();
        hgt.g.fillStyle = `rgb(${base},${base},${base})`;
        roundRect(hgt.g, px + 4, py + 4, sw - 8, sh - 8, 4); hgt.g.fill();
        rgh.g.fillStyle = `rgb(${rough},${rough},${rough})`;
        roundRect(rgh.g, px, py, sw, sh, 5); rgh.g.fill();
      });
      x += w;
    }
  }
  puddles(S, col, hgt, rgh, 5);
  return finishPBR(col, hgt, rgh, 1.6);
}

// =====================================================================
// 夜晚窗户
// =====================================================================
/** 亮灯的窗户：暖光 + 窗帘剪影 */
export function windowGlowTex(variant = 0) {
  return make(256, 320, (g, w, h) => {
    const warm = [['#ffd69a', '#d77a2c'], ['#ffe3b0', '#c98a3a'], ['#ffc77a', '#a8501c'], ['#f6dcb0', '#8a6a40']][variant % 4];
    const gr = g.createRadialGradient(w * 0.5, h * 0.55, 10, w * 0.5, h * 0.5, h * 0.7);
    gr.addColorStop(0, warm[0]);
    gr.addColorStop(1, warm[1]);
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    // 室内远处的墙/家具剪影
    g.fillStyle = 'rgba(60,30,10,0.35)';
    g.fillRect(0, h * 0.72, w, h * 0.28);
    if (variant % 2 === 0) { g.fillStyle = 'rgba(40,20,8,0.45)'; g.fillRect(w * 0.55, h * 0.45, w * 0.3, h * 0.3); }
    // 窗帘
    const cc = pick(['rgba(90,20,20,0.9)', 'rgba(30,60,30,0.9)', 'rgba(70,50,30,0.9)', 'rgba(40,30,70,0.9)']);
    for (const side of [0, 1]) {
      g.fillStyle = cc;
      g.beginPath();
      const x0 = side ? w : 0, dir = side ? -1 : 1, cw = w * rnd(0.18, 0.32);
      g.moveTo(x0, 0);
      g.lineTo(x0 + dir * cw, 0);
      g.quadraticCurveTo(x0 + dir * cw * 0.5, h * 0.5, x0 + dir * cw * 0.9, h);
      g.lineTo(x0, h);
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.3)';
      for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x0 + dir * cw * k / 4, 0); g.lineTo(x0 + dir * cw * k / 4 * 0.8, h); g.stroke(); }
    }
    if (variant === 1) { // 窗台上的烛光
      const cg = g.createRadialGradient(w * 0.5, h * 0.8, 0, w * 0.5, h * 0.8, 50);
      cg.addColorStop(0, 'rgba(255,240,200,0.9)'); cg.addColorStop(1, 'rgba(255,200,120,0)');
      g.fillStyle = cg; g.fillRect(0, 0, w, h);
    }
  }, { wrap: false });
}

/** 店铺橱窗：暖光中的货架与商品 */
export function shopDisplayTex(seed = 0) {
  return make(1024, 384, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#6a3a18');
    gr.addColorStop(0.5, '#e8a858');
    gr.addColorStop(1, '#5a3010');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    for (let k = 0; k < 5; k++) {
      const x = Math.random() * w, r = rnd(80, 200);
      const lg = g.createRadialGradient(x, h * 0.3, 0, x, h * 0.3, r);
      lg.addColorStop(0, 'rgba(255,230,170,0.6)'); lg.addColorStop(1, 'rgba(255,200,120,0)');
      g.fillStyle = lg; g.fillRect(0, 0, w, h);
    }
    const pal = ['#5a1a1a', '#1a3a2a', '#2a2a5a', '#6a4a1a', '#3a1a3a', '#8a6a2a', '#2a1a10', '#4a6a6a'];
    for (const sy of [0.32, 0.6, 0.88]) {
      g.fillStyle = '#2a160a';
      g.fillRect(0, h * sy, w, 8);
      let x = rnd(0, 20);
      while (x < w) {
        const t = Math.random();
        const iw = rnd(14, 46), ih = rnd(30, 90);
        g.fillStyle = pick(pal);
        if (t < 0.4) g.fillRect(x, h * sy - ih, iw, ih);
        else if (t < 0.7) { g.beginPath(); g.ellipse(x + iw / 2, h * sy - ih / 2, iw / 2, ih / 2, 0, 0, Math.PI * 2); g.fill(); }
        else { g.beginPath(); g.moveTo(x, h * sy); g.lineTo(x + iw / 2, h * sy - ih); g.lineTo(x + iw, h * sy); g.fill(); }
        g.fillStyle = 'rgba(255,240,200,0.25)';
        g.fillRect(x + 2, h * sy - ih + 4, 3, ih * 0.6);
        x += iw + rnd(4, 30);
      }
    }
  });
}

export function stripeTex(c1, c2, n = 8) {
  return make(64, 256, (g, w, h) => {
    for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? c2 : c1; g.fillRect(0, (i * h) / n, w, h / n); }
  });
}

export function nameTex(text, sub) {
  return make(512, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(15,10,6,0.6)';
    roundRect(g, 40, 14, w - 80, h - 28, 22);
    g.fill();
    g.strokeStyle = 'rgba(200,160,80,0.8)';
    g.lineWidth = 2;
    g.stroke();
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#f3d98a';
    g.font = 'bold 40px "Microsoft YaHei", "PingFang SC", sans-serif';
    g.fillText(text, w / 2, sub ? 52 : h / 2);
    if (sub) { g.font = 'italic 22px Georgia, serif'; g.fillStyle = '#d8c8a8'; g.fillText(sub, w / 2, 92); }
  }, { wrap: false });
}
