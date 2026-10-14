// 程序化合成的音效（WebAudio），无需外部音频文件
let ctx = null, master = null, ambient = null;

function noiseBuffer(sec = 2) {
  const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

function tone(freq, dur, { type = 'sine', vol = 0.2, attack = 0.005, at = 0, slide = null } = {}) {
  if (!ctx) return;
  const t0 = ctx.currentTime + at;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

export const sfx = {
  init() {
    if (ctx) { ctx.resume(); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
    // 街道环境底噪（轻微的风声与人群嘈杂）
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(4);
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 0.6;
    ambient = ctx.createGain();
    ambient.gain.value = 0.035;
    src.connect(f).connect(ambient).connect(master);
    src.start();
  },
  bell() {
    [1, 2.76, 5.4].forEach((m, i) => tone(1320 * m, 1.4, { vol: 0.12 / (i + 1) }));
    [1, 2.76].forEach((m, i) => tone(1180 * m, 1.2, { vol: 0.08 / (i + 1), at: 0.12 }));
  },
  chime() {
    [880, 1175, 1568, 2093].forEach((f, i) => tone(f, 0.9, { vol: 0.07, at: i * 0.07 }));
  },
  zap() {
    tone(1400, 0.25, { type: 'triangle', vol: 0.08, slide: 300 });
    tone(2600, 0.15, { vol: 0.04, slide: 900 });
  },
  hoot() {
    tone(420, 0.35, { vol: 0.18, attack: 0.05, slide: 380 });
    tone(400, 0.6, { vol: 0.18, attack: 0.08, at: 0.45, slide: 330 });
  },
  knock() {
    for (let i = 0; i < 3; i++) tone(90, 0.25, { type: 'square', vol: 0.12, at: i * 0.28, slide: 50 });
  },
  bubble() {
    for (let i = 0; i < 8; i++) tone(200 + Math.random() * 300, 0.12, { vol: 0.08, at: i * 0.07 + Math.random() * 0.05, slide: 600 + Math.random() * 400 });
  },
  roar(dist = 30) {
    if (!ctx) return;
    const vol = Math.min(0.5, 12 / Math.max(6, dist));
    const t0 = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(3.5);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(300, t0);
    f.frequency.linearRampToValueAtTime(1200, t0 + 0.6);
    f.frequency.linearRampToValueAtTime(250, t0 + 3.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.3);
    src.connect(f).connect(g).connect(master);
    src.start(t0);
    tone(70, 2.5, { type: 'sawtooth', vol: vol * 0.4, attack: 0.3, slide: 45 });
  },
};
