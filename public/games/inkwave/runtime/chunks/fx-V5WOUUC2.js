import{Ha as At,P as zt,Sa as qt,T,_a as Z,c as _t,ca as Tt,da as H,e as Et,f as wt,ka as Mt,nb as ut,ra as Q,wa as yt}from"./chunk-A4GFMTBS.js";import{E as Ct,g as Pt}from"./chunk-GS5HPC5T.js";import"./chunk-VC46IEJQ.js";var z=new T(0,1,0),b=Math.PI*2,o=Math.random,at=Object.freeze({}),ct=M=>1-(1-M)*(1-M)*(1-M),tt=(M,t,i)=>M<t?t:M>i?i:M,k=1,xt=2,W=4,N=8,rt=16,q=0,G=10,bt=20;var Dt=0,It=1,Ot=2,Ht=3,nt=4,Y=0,it=1,vt=2,Lt=3,Vt=4,pt=5,Nt=6,U=7,ft=`
float fxHash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float fxNoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(fxHash(i), fxHash(i+vec2(1.0,0.0)), u.x), mix(fxHash(i+vec2(0.0,1.0)), fxHash(i+vec2(1.0,1.0)), u.x), u.y); }
`,ot=`
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`,jt=`
attribute vec4 aPosR;   // xyz, radius
attribute vec4 aVelS;   // velocity, stretch
attribute vec4 aColA;   // rgb, gloss
varying vec2 vUv;
varying vec3 vCol;
varying vec2 vAx;
varying float vGloss;
varying float vTail;
void main() {
  vec4 c = viewMatrix * vec4(aPosR.xyz, 1.0);
  vec3 vv = mat3(viewMatrix) * aVelS.xyz;
  float s3 = length(vv), s2 = length(vv.xy);
  vec2 ax = s2 > 1e-4 ? vv.xy / s2 : vec2(0.0, 1.0);
  float st = 1.0 + (aVelS.w - 1.0) * (s3 > 1e-4 ? s2 / s3 : 0.0);
  vec2 bx = vec2(ax.y, -ax.x);   // right-handed with ax so the quad stays front-facing
  float r = aPosR.w;
  c.xy += ax * position.y * r * st + bx * position.x * r / sqrt(st);
  c.xyz += normalize(-c.xyz) * r * 0.6;
  vUv = position.xy;
  vCol = aColA.rgb;
  vGloss = aColA.a;
  vAx = ax;
  vTail = clamp((st - 1.15) / 1.1, 0.0, 1.0);
  gl_Position = projectionMatrix * c;
}
`,Yt=`
uniform vec3 uSunDirV;
uniform vec3 uUpV;
uniform vec3 uSunCol;
uniform vec3 uSkyCol;
uniform vec3 uGroundCol;
varying vec2 vUv;
varying vec3 vCol;
varying vec2 vAx;
varying float vGloss;
varying float vTail;
void main() {
  // silhouette: a sphere, pulled into a teardrop as the drop speeds up (head at +y = the direction of travel)
  float yc = 0.42 * vTail, rh = 1.0 - yc, rt = mix(rh, 0.1, vTail);
  vec2 A = vec2(0.0, yc), Bp = vec2(0.0, -1.0 + rt);      // the tail's end cap stays inside the quad
  vec2 pa = vUv - A, ba = Bp - A;
  float h = vTail > 0.0 ? clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0) : 0.0;
  vec2 o = pa - ba * h;
  float rad = mix(rh, rt, h);
  float sd = length(o) - rad;
  float fw = max(fwidth(sd), 1e-4);
  float cov = 1.0 - smoothstep(-fw, fw, sd);
  if (cov <= 0.0) discard;
  vec2 q = o / max(rad, 1e-3);
  float z = sqrt(max(1.0 - dot(q, q), 0.0));
  vec2 bx = vec2(vAx.y, -vAx.x);
  vec3 n = normalize(vec3(bx * q.x + vAx * q.y, z + 0.05));
  float g = vGloss;
  float ndl = dot(n, uSunDirV);
  float up = dot(n, uUpV) * 0.5 + 0.5;
  vec3 amb = mix(uGroundCol, uSkyCol, up);
  vec3 base = vCol * (amb * 0.55 + uSunCol * clamp(ndl * 0.6 + 0.4, 0.0, 1.0) * 0.8 + 0.14);
  float edge = 1.0 - z;
  // light passes through the ink and exits on the far side: a saturated glow opposite the sun, strongest near the rim
  vec2 sxy = normalize(vec2(dot(uSunDirV.xy, bx), dot(uSunDirV.xy, vAx)) + 1e-4);
  float trans = pow(clamp(-dot(q, sxy), 0.0, 1.0), 1.5) * (0.35 + 0.65 * edge);
  base += vCol * (vCol + 0.25) * trans * 0.7 * g;
  // lens rim: the curved edge of the liquid reads darker and richer
  base *= mix(1.0, 0.6, pow(edge, 2.2) * g);
  vec3 R = reflect(vec3(0.0, 0.0, -1.0), n);
  float rup = dot(R, uUpV);
  vec3 env = mix(uGroundCol * 0.7, uSkyCol * 1.4, smoothstep(-0.15, 0.35, rup));
  float fres = (0.04 + 0.96 * pow(edge, 4.0)) * g;
  vec3 col = mix(base, env, fres * 0.42);
  float rl = clamp(dot(R, uSunDirV), 0.0, 1.0);
  col += uSunCol * (pow(rl, 150.0) * 7.0 + pow(rl, 16.0) * 0.28) * g;
  col *= mix(0.85, 1.0, g);
  gl_FragColor = vec4(col, cov);
  ${ot}
}
`,$t=`
attribute vec4 aPosSize;
attribute vec4 aColA;
attribute vec4 aMisc;   // x rotation, y seed, z t (0..1), w kind
varying vec2 vUv;
varying vec4 vCol;
varying vec4 vMisc;
void main() {
  vec3 camR = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 camU = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  float c = cos(aMisc.x), s = sin(aMisc.x);
  vec2 q = mat2(c, s, -s, c) * position.xy;
  vec3 wp = aPosSize.xyz + (camR * q.x + camU * q.y) * aPosSize.w;
  vUv = position.xy * 2.0;
  vCol = aColA;
  vMisc = aMisc;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`,Kt=`
${ft}
varying vec2 vUv;
varying vec4 vCol;
varying vec4 vMisc;
void main() {
  float r = length(vUv);
  float seed = vMisc.y * 37.0;
  float ang = atan(vUv.y, vUv.x);
  float n = fxNoise(vec2(cos(ang), sin(ang)) * 2.2 + seed) * 0.6 + fxNoise(vUv * 3.1 + seed + vMisc.z * 1.5) * 0.4;
  float a = 0.0;
  vec3 col = vCol.rgb;
  float kind = vMisc.w;
  if (kind > 3.5) {
    // dust: grainy, soft-edged, lit from the top
    float n2 = fxNoise(vUv * 4.0 + seed + vMisc.z * 2.0);
    float edge = 0.55 + (n - 0.5) * 0.6;
    a = smoothstep(1.0, edge * 0.4, r + (n2 - 0.5) * 0.35) * (0.72 + 0.28 * n2);
    col = vCol.rgb * (0.86 + 0.24 * clamp(vUv.y * 0.8 + 0.2, -1.0, 1.0)) * (0.92 + 0.12 * n2);
  } else if (kind > 2.5) {
    // squid ghost: pointed mantle with fins, round head, two dark eyes, four wavy tentacles
    vec2 q = vUv * vec2(1.0, 1.05);
    float t = clamp((q.y - 0.05) / 0.9, 0.0, 1.0);
    float mw = mix(0.46, 0.0, pow(t, 0.9));
    float fin = 0.22 * exp(-pow((q.y - 0.3) / 0.12, 2.0));
    float mantle = step(0.02, q.y) * step(q.y, 0.95) * smoothstep(mw + fin + 0.025, mw + fin - 0.025, abs(q.x));
    float head = smoothstep(0.43, 0.39, length(q - vec2(0.0, -0.12)));
    float tent = 0.0;
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      float wx = -0.27 + 0.18 * fi + 0.05 * sin(q.y * 9.0 + vMisc.z * 14.0 + fi * 1.7);
      tent = max(tent, smoothstep(0.07, 0.045, abs(q.x - wx)) * smoothstep(-0.95, -0.85, q.y) * step(q.y, -0.25));
    }
    float body = max(max(mantle, head), tent);
    float eyes = max(smoothstep(0.105, 0.085, length(q - vec2(-0.15, -0.1))), smoothstep(0.105, 0.085, length(q - vec2(0.15, -0.1))));
    float shine = smoothstep(0.035, 0.02, length(q - vec2(-0.17, -0.07))) + smoothstep(0.035, 0.02, length(q - vec2(0.13, -0.07)));
    a = body;
    col = mix(vCol.rgb, vec3(1.0), 0.3) * (0.88 + 0.22 * clamp(q.y + 0.4, 0.0, 1.0));
    col = mix(col, vec3(0.06, 0.06, 0.1), eyes * 0.9);
    col = mix(col, vec3(1.0), clamp(shine, 0.0, 1.0));
  } else if (kind > 1.5) {
    // feather: tapered curved vane with barbs, a notch and a quill
    vec2 q = vUv;
    float y = q.y;
    float xv = q.x - 0.07 * (1.0 - y * y);
    float halfW = 0.3 * sqrt(max(0.0, 1.0 - y * y)) * (1.0 - 0.25 * y);
    float vane = smoothstep(halfW, halfW - 0.07, abs(xv)) * step(-0.78, y);
    float notch = 1.0 - smoothstep(0.03, 0.0, abs(y - 0.2 - xv * 0.7)) * step(0.0, xv) * 0.85;
    float shaft = smoothstep(0.035, 0.0, abs(xv)) * step(y, 0.98);
    float barbs = 0.84 + 0.16 * sin(y * 34.0 + abs(xv) * 24.0 + (xv > 0.0 ? 0.0 : 1.7));
    a = max(vane * notch, shaft);
    col = vCol.rgb * barbs * (0.88 + 0.14 * y);
    col = mix(col, vCol.rgb * 0.78, shaft);
  } else if (kind > 0.5) {
    // storm cloud puff: crisp billowy edge, bright top, dark inky belly
    float rr = r + (n - 0.5) * 0.16;
    a = smoothstep(1.0, 0.84, rr);
    float top = smoothstep(-0.85, 0.75, vUv.y + (n - 0.5) * 0.2);
    col = mix(vCol.rgb * 0.45, mix(vCol.rgb, vec3(1.0), 0.32), top);
    col += vec3(0.18) * smoothstep(0.6, 0.95, rr) * smoothstep(0.0, 0.6, vUv.y);
  } else {
    // soft ink mist, cartoon-lit from the top
    float edge = 0.62 + (n - 0.5) * 0.5;
    a = smoothstep(1.0, edge * 0.55, r + (n - 0.5) * 0.25);
    float lit = 0.78 + 0.32 * clamp(vUv.y * 0.8 + 0.25, -1.0, 1.0) + (n - 0.5) * 0.18;
    col = vCol.rgb * lit;
  }
  gl_FragColor = vec4(col, a * vCol.a);
  if (gl_FragColor.a < 0.004) discard;
  ${ot}
}
`,Jt=`
varying vec2 vUv;
varying vec4 vCol;
varying vec4 vMisc;
void main() {
  float r = length(vUv);
  float kind = floor(vMisc.w / 10.0 + 0.001);
  float core = vMisc.w - kind * 10.0;
  vec3 col;
  if (kind < 0.5) {
    float g = pow(max(1.0 - r, 0.0), 2.2);
    float c = pow(max(1.0 - r * 1.8, 0.0), 3.0);
    col = vCol.rgb * g + vec3(1.0, 0.97, 0.92) * c * core;
  } else if (kind < 1.5) {
    // star glint: 4-point cross flare + faint diagonals + tight hot core
    vec2 q = vUv;
    float cr = max(exp(-abs(q.x) * 22.0) * exp(-abs(q.y) * 2.6), exp(-abs(q.y) * 22.0) * exp(-abs(q.x) * 2.6));
    vec2 d = vec2(q.x + q.y, q.x - q.y) * 0.7071;
    float dg = max(exp(-abs(d.x) * 30.0) * exp(-abs(d.y) * 6.0), exp(-abs(d.y) * 30.0) * exp(-abs(d.x) * 6.0)) * 0.4;
    float halo = pow(max(1.0 - r, 0.0), 3.0) * 0.45;
    float hot = pow(max(1.0 - r * 3.2, 0.0), 2.0);
    col = vCol.rgb * (cr + dg + halo) + vec3(1.0, 0.98, 0.95) * hot * core;
  } else if (kind < 2.5) {
    // bubble: thin bright rim + specular dot
    float rim = smoothstep(0.16, 0.0, abs(r - 0.8)) * 0.8 + smoothstep(0.5, 0.95, r) * step(r, 0.9) * 0.25;
    float hl = smoothstep(0.24, 0.0, length(vUv - vec2(-0.3, 0.34)));
    col = vCol.rgb * rim + vec3(1.0) * hl * (0.6 + core * 0.2);
  } else {
    // halo ring flash
    float ring = exp(-pow((r - 0.78) * 7.0, 2.0));
    col = vCol.rgb * ring + vec3(1.0) * ring * ring * core * 0.3;
  }
  gl_FragColor = vec4(col * vCol.a, 1.0);
  ${ot}
}
`,Qt=`
attribute vec4 aPosR;   // xyz, radius (current)
attribute vec4 aNrmT;   // normal, t (0..1)
attribute vec4 aColA;
attribute vec4 aMisc;   // x seed, y style, z thickness
varying vec2 vUv;
varying vec4 vCol;
varying vec4 vMisc;
varying float vT;
void main() {
  vec3 n = normalize(aNrmT.xyz);
  vec3 ref = abs(n.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t = normalize(cross(ref, n));
  vec3 b = cross(n, t);
  vec3 wp = aPosR.xyz + (t * position.x + b * position.y) * aPosR.w + n * 0.025;
  vUv = position.xy;
  vCol = aColA; vMisc = aMisc; vT = aNrmT.w;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`,Zt=`
${ft}
uniform float uTime;
varying vec2 vUv;
varying vec4 vCol;
varying vec4 vMisc;
varying float vT;
void main() {
  float r = length(vUv);
  if (r > 1.0) discard;
  float ang = atan(vUv.y, vUv.x);
  float seed = vMisc.x * 53.0;
  float wob = fxNoise(vec2(cos(ang), sin(ang)) * 3.0 + seed) - 0.5;
  float a = 0.0;
  vec3 col = vCol.rgb;
  float st = vMisc.y;
  if (st < 0.5) {
    // ink shockwave: thick wobbly band that thins as it expands, plus droplet beads on the rim
    float outer = 0.93 + wob * 0.1;
    float w = mix(0.34, 0.07, vT) * vMisc.z;
    float band = smoothstep(outer + 0.02, outer - 0.02, r) * smoothstep(outer - w - 0.03, outer - w + 0.02, r);
    float beads = smoothstep(0.35, 0.0, length(vec2(fract(ang / 6.2831 * 18.0 + seed) - 0.5, (r - outer) * 7.0))) * step(0.45, fxHash(vec2(floor(ang / 6.2831 * 18.0 + seed), seed)));
    float fill = pow(1.0 - vT, 4.0) * 0.45 * smoothstep(outer, outer * 0.3, r);
    a = max(max(band, beads * (1.0 - vT)), fill);
    col *= 0.9 + 0.35 * smoothstep(outer - w, outer, r);
    a *= pow(1.0 - vT, 1.3);
  } else if (st < 1.5) {
    // water / swim ripple: thin soft outline
    float outer = 0.9 + wob * 0.06;
    a = smoothstep(outer + 0.06, outer, r) * smoothstep(outer - 0.16, outer - 0.03, r) * (1.0 - vT) * (1.0 - vT);
    col = mix(col, vec3(1.0), 0.35);
  } else if (st < 2.5) {
    // splash disc: quick filled blot
    a = smoothstep(0.95 + wob * 0.2, 0.7 + wob * 0.2, r) * pow(1.0 - vT, 2.0);
  } else if (st < 3.5) {
    // bomb danger zone: bold rim, rotating dashes, pulses that quicken with the fuse (vT), tinted fill, dark outline
    float spin = uTime * (0.5 + vT * 1.8);
    float rim = smoothstep(0.045, 0.012, abs(r - 0.955));
    float dashes = step(0.45, fract(ang / 6.2831853 * 16.0 - spin)) * smoothstep(0.04, 0.012, abs(r - 0.87));
    float ph = fract(uTime * (1.0 + vT * 4.0));
    float wave = smoothstep(0.07, 0.0, abs(r - ph * 0.95)) * (1.0 - ph) * 0.85;
    float fill = (0.1 + 0.24 * vT) * (0.55 + 0.45 * smoothstep(0.0, 0.95, r)) * step(r, 0.955);
    float dark = smoothstep(0.03, 0.0, abs(r - 0.99));
    a = max(max(rim, dashes * 0.9), max(wave, fill));
    col = mix(col, vec3(1.0), rim * 0.3 + wave * 0.25);
    col = mix(col, vec3(0.04), dark * 0.7); a = max(a, dark * 0.5);
  } else if (st < 4.5) {
    // super-jump target: rim, inner ring, four rotating inward chevrons, contracting pulse, blinking core
    float spin = uTime * 1.2;
    float outer = smoothstep(0.045, 0.012, abs(r - 0.94));
    float dark = smoothstep(0.035, 0.0, abs(r - 0.99));
    float inner = smoothstep(0.03, 0.008, abs(r - 0.56)) * 0.85;
    float sa = ang - spin;
    float seg = mod(sa + 0.3927, 1.5707963) - 0.7853981;
    vec2 pl = vec2(r - 0.76, seg * 0.76);
    float chev = smoothstep(0.04, 0.0, abs(pl.x + abs(pl.y) * 0.9 - 0.02)) * step(abs(pl.y), 0.14);
    float ph = fract(uTime * 1.1);
    float wave = smoothstep(0.05, 0.0, abs(r - (1.0 - ph) * 0.9)) * ph * 0.85;
    float core = smoothstep(0.2, 0.14, r) * (0.7 + 0.3 * sin(uTime * 9.0));
    float fill = 0.14 * step(r, 0.94);
    a = max(max(outer, inner), max(max(chev, wave), max(core, fill)));
    col = mix(col, vec3(1.0), outer * 0.25 + core * 0.45 + chev * 0.25);
    col = mix(col, vec3(0.04), dark * 0.7); a = max(a, dark * 0.55);
  } else if (st < 5.5) {
    // dust ring: soft noisy band
    float nn = fxNoise(vUv * 5.0 + seed);
    float outer = 0.86 + wob * 0.16;
    float band = smoothstep(outer, outer - 0.3, r) * smoothstep(outer - 0.78, outer - 0.25, r);
    a = band * (0.55 + 0.45 * nn) * pow(1.0 - vT, 1.6);
    col *= 0.9 + 0.2 * nn;
  } else if (st < 6.5) {
    // glossy splat blot with spiky rim + highlight
    float spikes = fxNoise(vec2(ang * 2.6 + seed, seed));
    float edge = 0.55 + 0.38 * spikes + wob * 0.2;
    a = smoothstep(edge, edge - 0.14, r) * pow(1.0 - vT, 1.5);
    float hl = smoothstep(0.35, 0.0, length(vUv - vec2(-0.22, 0.26)));
    col = col * (0.82 + 0.3 * (1.0 - r)) + vec3(0.3) * hl;
  } else {
    // thin shockwave (air bursts / pulses)
    float w = mix(0.14, 0.035, vT) * max(vMisc.z, 0.3);
    float d = (r - 0.93) / w;
    a = exp(-d * d) * pow(1.0 - vT, 1.1);
    col = mix(col, vec3(1.0), 0.4);
  }
  gl_FragColor = vec4(col, a * vCol.a);
  if (gl_FragColor.a < 0.004) discard;
  ${ot}
}
`,t0=`
${ft}
float fxH3v(vec3 p) { return fxHash(p.xy + p.z * vec2(37.13, 17.31)); }
float fxN3v(vec3 p) {
  vec3 i = floor(p), f = fract(p); vec3 u = f * f * (3.0 - 2.0 * f);
  float a = mix(fxH3v(i), fxH3v(i + vec3(1.0, 0.0, 0.0)), u.x), b = mix(fxH3v(i + vec3(0.0, 1.0, 0.0)), fxH3v(i + vec3(1.0, 1.0, 0.0)), u.x);
  float c = mix(fxH3v(i + vec3(0.0, 0.0, 1.0)), fxH3v(i + vec3(1.0, 0.0, 1.0)), u.x), d = mix(fxH3v(i + vec3(0.0, 1.0, 1.0)), fxH3v(i + vec3(1.0, 1.0, 1.0)), u.x);
  return mix(mix(a, b, u.y), mix(c, d, u.y), u.z);
}
attribute vec4 aPosR;
attribute vec4 aColA;
attribute vec4 aMisc;   // x t, y seed, z -, w wobble amount
attribute vec4 aAxis;   // crown axis (the surface normal), crown amount (0 = free burst, 1 = crown splash)
uniform float uTime;
varying vec3 vN;
varying vec3 vW;
varying vec4 vCol;
varying vec4 vMisc;
varying vec4 vAxis;
varying float vNear;
void main() {
  vec3 n = normalize(position);
  vNear = 1.0 - smoothstep(aPosR.w * 1.3, aPosR.w * 3.2 + 0.6, distance(cameraPosition, aPosR.xyz));
  float s = aMisc.y * 17.0;
  float w = sin(n.x * 5.1 + s + uTime * 7.0) * sin(n.y * 4.3 + s * 1.7 + uTime * 5.3) * sin(n.z * 4.7 + s * 0.6 - uTime * 6.1);
  w += 0.5 * sin(n.x * 11.0 - n.z * 9.0 + s * 2.1 + uTime * 9.0);
  // jets: the sheet is pushed out into a few blunt spikes where the ink was thrown hardest
  float jet = max(fxN3v(n * 3.3 + s) - 0.52, 0.0) * 2.1;
  float rad = aPosR.w * (1.0 + w * aMisc.w + jet * jet * 0.55 * (1.0 - aAxis.w));
  vec3 ax = aAxis.xyz; float cr = aAxis.w;
  float up = dot(n, ax);
  // crown splash: a squat bowl whose wall flares out toward the (torn-open) rim
  vec3 off = mix(n, (n - ax * up) * (1.0 + 0.4 * smoothstep(0.0, 0.9, up)) + ax * up * 0.62, cr) * rad;
  vec3 wp = aPosR.xyz + off;
  vN = n;
  vW = wp;
  vCol = aColA; vMisc = aMisc; vAxis = aAxis;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`,i0=`
${ft}
uniform vec3 uSunDir;
uniform vec3 uSunCol;
uniform vec3 uSkyCol;
varying vec3 vN;
varying vec3 vW;
varying vec4 vCol;
varying vec4 vMisc;
varying vec4 vAxis;
varying float vNear;
float fxH3(vec3 p) { return fxHash(p.xy + p.z * vec2(37.13, 17.31)); }
float fxN3(vec3 p) {
  vec3 i = floor(p), f = fract(p); vec3 u = f * f * (3.0 - 2.0 * f);
  float a = mix(fxH3(i), fxH3(i + vec3(1.0, 0.0, 0.0)), u.x), b = mix(fxH3(i + vec3(0.0, 1.0, 0.0)), fxH3(i + vec3(1.0, 1.0, 0.0)), u.x);
  float c = mix(fxH3(i + vec3(0.0, 0.0, 1.0)), fxH3(i + vec3(1.0, 0.0, 1.0)), u.x), d = mix(fxH3(i + vec3(0.0, 1.0, 1.0)), fxH3(i + vec3(1.0, 1.0, 1.0)), u.x);
  return mix(mix(a, b, u.y), mix(c, d, u.y), u.z);
}
void main() {
  vec3 N = normalize(vN);
  float t = vMisc.x;
  float s = vMisc.y * 17.0;
  float nz = fxN3(N * 2.4 + s) * 0.6 + fxN3(N * 6.1 + s * 1.9) * 0.4;
  float thr = mix(0.3, 1.04, smoothstep(0.0, 0.78, t)) + (1.0 - vCol.a) * 0.6;
  thr += vAxis.w * 1.3 * smoothstep(0.3, 0.78, dot(N, vAxis.xyz));      // a crown is open at the top from the start
  thr += vNear * (0.35 + 0.5 * t);                                        // right in front of the camera: mostly holes
  float m = nz - thr;
  float fw = max(fwidth(m), 1e-4);
  float cov = smoothstep(-fw, fw, m);
  if (cov <= 0.0) discard;
  vec3 V = normalize(cameraPosition - vW);
  float facing = dot(N, V);
  float inner = step(facing, 0.0);
  vec3 Nf = facing >= 0.0 ? N : -N;
  float rim = 1.0 - smoothstep(0.0, 0.09, m);
  float ndl = dot(Nf, uSunDir);
  vec3 col = vCol.rgb * (0.5 + 0.6 * clamp(ndl * 0.65 + 0.35, 0.0, 1.0));
  col *= mix(1.0, 0.58, inner);
  col *= 1.0 + 0.3 * rim;
  vec3 R = reflect(-V, Nf);
  float fres = pow(1.0 - abs(facing), 3.0) * (1.0 - inner);
  col = mix(col, uSkyCol * 1.25, fres * 0.32);
  col += uSunCol * (pow(clamp(dot(R, uSunDir), 0.0, 1.0), 70.0) * 3.2 + rim * 0.12) * (1.0 - inner);
  gl_FragColor = vec4(col, cov);
  ${ot}
}
`,s0=`
attribute vec4 aPosR;   // base pos, radius
attribute vec4 aColA;
attribute vec4 aMisc;   // x t, y height, z seed, w mode (0 geyser, 1 pillar)
varying vec3 vN;
varying vec3 vW;
varying float vH;
varying vec4 vCol;
varying vec4 vMisc;
void main() {
  float h = position.y;             // 0..1
  float bulge = aMisc.w > 0.5 ? 1.0 : 1.0 + 0.25 * sin(h * 9.0 + aMisc.z * 10.0 - aMisc.x * 30.0) * (1.0 - h);
  float taper = aMisc.w > 0.5 ? mix(1.0, 0.8, h) : mix(1.0, 0.55, h);
  vec3 wp = aPosR.xyz + vec3(position.x * aPosR.w * bulge * taper, h * aMisc.y, position.z * aPosR.w * bulge * taper);
  vN = normalize(vec3(position.x, 0.0, position.z));
  vW = wp; vH = h; vCol = aColA; vMisc = aMisc;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`,o0=`
${ft}
uniform float uTime;
varying vec3 vN;
varying vec3 vW;
varying float vH;
varying vec4 vCol;
varying vec4 vMisc;
void main() {
  vec3 V = normalize(cameraPosition - vW);
  float facing = abs(dot(normalize(vN), V));
  float ang = atan(vN.z, vN.x);
  float rim = pow(max(1.0 - facing, 0.0), 1.5);
  float a; vec3 col;
  if (vMisc.w > 0.5) {
    float streak = fxNoise(vec2(ang * 3.0 + vMisc.z * 13.0, vH * 7.0 - uTime * 2.6));
    a = (0.12 + 0.55 * rim) * (0.45 + 0.75 * streak) * smoothstep(1.0, 0.25, vH) * smoothstep(0.0, 0.04, vH);
    col = vCol.rgb * (1.1 + 0.8 * streak) + vec3(1.2) * pow(streak, 4.0) * (1.0 - vH);
  } else {
    float streak = fxNoise(vec2(ang * 3.0 + vMisc.z * 13.0, vH * 5.0 - vMisc.x * 9.0));
    a = (0.3 + 0.7 * rim) * (0.45 + 0.8 * streak);
    a *= smoothstep(1.0, 0.4, vH) * smoothstep(0.0, 0.05, vH);
    col = vCol.rgb * (1.0 + 0.9 * streak) + vec3(3.2) * pow(streak, 5.0) * (1.0 - vH) * (1.0 - vMisc.x);
  }
  gl_FragColor = vec4(col, clamp(a * vCol.a, 0.0, 1.0));
  ${ot}
}
`,e0=`
attribute vec4 aSeed;
uniform float uTime;
uniform vec3 uCam;
uniform float uBox;
uniform vec3 uWind;
uniform vec3 uSunDir;
varying float vA;
varying vec2 vUv;
void main() {
  vec3 base = aSeed.xyz * uBox + uWind * uTime * (0.55 + aSeed.w * 0.9);
  base += vec3(sin(uTime * 0.71 + aSeed.w * 40.0), sin(uTime * 0.53 + aSeed.x * 30.0) * 0.6, cos(uTime * 0.61 + aSeed.y * 25.0)) * 0.3;
  vec3 rel = mod(base - uCam + 0.5 * uBox, uBox) - 0.5 * uBox;
  vec3 wp = uCam + rel;
  float d = length(rel);
  vA = smoothstep(0.35, 1.3, d) * (1.0 - smoothstep(uBox * 0.28, uBox * 0.5, d));
  vec3 V = rel / max(d, 1e-3);
  float fwd = pow(max(dot(V, uSunDir), 0.0), 4.0);
  vA *= 0.16 + 1.5 * fwd;
  vA *= 0.55 + 0.45 * sin(uTime * (1.3 + aSeed.w * 3.0) + aSeed.x * 50.0);
  vA *= smoothstep(-0.2, 0.4, wp.y);
  float size = mix(0.011, 0.03, aSeed.w * aSeed.w);
  vec3 camR = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 camU = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  wp += (camR * position.x + camU * position.y) * size * 2.0;
  vUv = position.xy * 2.0;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`,a0=`
uniform vec3 uCol;
varying float vA;
varying vec2 vUv;
void main() {
  float r = length(vUv);
  float g = pow(max(1.0 - r, 0.0), 2.4);
  if (g * vA < 0.002) discard;
  gl_FragColor = vec4(uCol * g * vA, 1.0);
  ${ot}
}
`,u=new T,v=new T,p=new T,S=new T,V=new T,I=new T,j=new T,Ut=new T,et=new T,st=new T,mt=new T,dt=new T,F=new T,$=new T,O=new H,g=new H(1,1,1),L=new H,gt=new H,K=new H("#b8a98f"),c0=new H("#b9ae9c"),X=new H("#eef9ff"),kt=new H("#bfe9ff"),r0=new H("#f3f0e8");function D(M,t,i){let s=Math.cos(t),e=1-o()*(1-s),c=Math.sqrt(Math.max(0,1-e*e)),a=o()*b;return Math.abs(M.y)<.95?j.set(0,1,0):j.set(1,0,0),j.cross(M).normalize(),Ut.copy(M).cross(j),i.copy(M).multiplyScalar(e).addScaledVector(j,c*Math.cos(a)).addScaledVector(Ut,c*Math.sin(a))}function J(M){let t=o()*2-1,i=Math.sqrt(1-t*t),s=o()*b;return M.set(i*Math.cos(s),t,i*Math.sin(s))}function Rt(M,t,i){Math.abs(M.y)<.95?t.set(0,1,0):t.set(1,0,0),t.cross(M).normalize(),i.copy(M).cross(t)}function Bt(M,t){let i=new ut;i.setAttribute("position",new Mt([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3)),i.setIndex([0,1,2,0,2,3]);let s=[];for(let[e,c]of t){let a=new yt(new Float32Array(M*c),c);a.setUsage(zt),i.setAttribute(e,a),s.push(a)}return i.instanceCount=0,i.userData.dyn=s,i}function Ft(M,t,i){let s=new ut;s.index=M.index,s.setAttribute("position",M.attributes.position),M.attributes.normal&&s.setAttribute("normal",M.attributes.normal);let e=[];for(let[c,a]of i){let r=new yt(new Float32Array(t*a),a);r.setUsage(zt),s.setAttribute(c,r),e.push(r)}return s.instanceCount=0,s.userData.dyn=e,s}function lt(M,t){let i=M.userData.dyn;for(let s=0;s<i.length;s++){let e=i[s],c=e._fxRange||(e._fxRange={start:0,count:0});c.start=0,c.count=Math.max(1,t)*e.itemSize,e.updateRanges.length=0,e.updateRanges.push(c),e.needsUpdate=!0}}var ht=1,n0=2,l0=3,Xt=class{constructor(t,i={}){this.scene=t;let s=i.quality;this.q=typeof s=="number"?s:(typeof s=="object"&&s?s.particles:(Ct[s]||Ct.high).particles)??1,this.q=Math.max(.25,this.q),this.waterY=i.waterY??Pt.waterY,this.gravity=i.gravity??17,this.collider=null,this.onDropletLand=null,this.onSpeck=null,this.onRipple=null,this.paintEffects=!0,this.maxChecks=Math.round(1100*this.q),this._checks=0,this._dt=1/60,this._time=0,this._recycle=0,this._colCache=new Map,this._col=new H,this._colB=new H,this._camPos=new T(0,10,0),this._camDir=new T(0,0,-1),this._light={sunDir:new T(-.41,.83,-.38).normalize(),sunCol:new H(1,.93,.84),sky:new H(.42,.62,.95),ground:new H(.5,.46,.42)},this.sunDir=this._light.sunDir,this.root=new Tt,this.root.name="FX",t.add(this.root),this._initDrops(Math.round(2600*this.q)),this._initSprites(Math.round(520*this.q),Math.round(300*this.q)),this._initRings(Math.round(300*this.q)),this._initShells(32),this._initBeams(10),this._initMotes(Math.round(300*this.q)),this._sq=new Float32Array(1344),this._sqN=0}setCollider(t){this.collider=t}_color(t,i){if(t&&t.isColor)return i.copy(t);if(typeof t=="number")return i.setHex(t);if(typeof t=="string"){let s=this._colCache.get(t);return s||(s=new H(t),this._colCache.set(t,s)),i.copy(s)}return t&&t.r!==void 0?i.setRGB(t.r,t.g,t.b):i.set(16777215)}_near(t,i){return this._camPos.distanceToSquared(t)<i*i}_initDrops(t){this.dCap=t,this.dN=0,this.dP=new Float32Array(t*3),this.dV=new Float32Array(t*3),this.dC=new Float32Array(t*3),this.dK=new Float32Array(t*3),this.dA=new Float32Array(t*8);let i=Bt(t,[["aPosR",4],["aVelS",4],["aColA",4]]);i.attributes.position.array.forEach((a,r,_)=>{_[r]=a*2});let s=this._light;this._dropU={uSunDirV:{value:new T(0,1,0)},uUpV:{value:new T(0,1,0)},uSunCol:{value:s.sunCol},uSkyCol:{value:s.sky},uGroundCol:{value:s.ground}};let e=new Z({uniforms:this._dropU,vertexShader:jt,fragmentShader:Yt,alphaToCoverage:!0,fog:!1}),c=new Q(i,e);c.frustumCulled=!1,c.renderOrder=4,c.name="FX_Droplets",this.dGeo=i,this.dMesh=c,this.root.add(c)}_spawnDrop(t,i,s,e,c,a,r,_,f,h,y,n){let l;this.dN<this.dCap?l=this.dN++:(l=this._recycle%this.dCap,this._recycle+=7);let x=l*3,m=l*8;this.dP[x]=t,this.dP[x+1]=i,this.dP[x+2]=s,this.dK[x]=t,this.dK[x+1]=i,this.dK[x+2]=s,this.dV[x]=e,this.dV[x+1]=c,this.dV[x+2]=a,this.dC[x]=r.r,this.dC[x+1]=r.g,this.dC[x+2]=r.b;let d=this.dA;return d[m]=_,d[m+1]=0,d[m+2]=f,d[m+3]=h,d[m+4]=y,d[m+5]=o(),d[m+6]=0,d[m+7]=n,l}_killDrop(t){let i=--this.dN;t!==i&&(this.dP.copyWithin(t*3,i*3,i*3+3),this.dV.copyWithin(t*3,i*3,i*3+3),this.dC.copyWithin(t*3,i*3,i*3+3),this.dK.copyWithin(t*3,i*3,i*3+3),this.dA.copyWithin(t*8,i*8,i*8+8))}_ripple(t,i,s,e,c,a=z,r=null){if(this.onRipple){this.onRipple(t,i,s,e,c);return}r&&this._ringRaw(t,a,r,e*c*.8+.1,c*.7,it,.45,1)}_landDrop(t,i,s,e,c,a,r,_){let f=t*3,h=t*8,y=this.dA,n=y[h],l=y[h+7];if(O.setRGB(this.dC[f],this.dC[f+1],this.dC[f+2]),_){if(l&(rt|N))return;F.set(i,this.waterY+.01,e),this._ringRaw(F,z,O.lerp(g,.55),.18+n*2.5,.45,it,.7,1);return}if(F.set(i,s,e),$.set(c,a,r),l&k&&this.onDropletLand?(this.onDropletLand(F,$,O,n),O.setRGB(this.dC[f],this.dC[f+1],this.dC[f+2]),F.set(i,s,e),$.set(c,a,r)):this.onSpeck&&!(l&rt)&&n>.012&&this._near(F,26)&&(this.onSpeck(F,$,O,n),O.setRGB(this.dC[f],this.dC[f+1],this.dC[f+2]),F.set(i,s,e),$.set(c,a,r)),!(l&rt)&&(!(l&k)&&(l&xt||n>.03)&&this._ripple(F,.0016+n*.05,.07+n*.5,.75,.42,$,l&xt?O:null),!(l&N)&&(!this.onSpeck&&!(l&k)&&this._ringRaw(F,$,O,n*2.3+.03,.2+n*.6,vt,.95,1),n>.075&&this.dN<this.dCap-8&&o()<.6))){let x=1+(o()<.5?1:0);for(let m=0;m<x;m++){D($,1.15,S);let d=1.3+o()*1.9;this._spawnDrop(i+c*.03,s+a*.03,e+r*.03,S.x*d,S.y*d,S.z*d,O,n*.3,.45,1,1,W)}}}_updateDrops(t){let i=this.dP,s=this.dV,e=this.dA,c=this.dK,a=this.gravity,r=this.waterY,_=this.collider;for(let n=0;n<this.dN;n++){let l=n*3,x=n*8;if(e[x+1]+=t,e[x+1]>=e[x+2]){this._killDrop(n),n--;continue}let m=1-.35*t;s[l]*=m,s[l+2]*=m,s[l+1]=s[l+1]*m-a*e[x+3]*t;let d=i[l],w=i[l+1],A=i[l+2],E=d+s[l]*t,C=w+s[l+1]*t,R=A+s[l+2]*t;i[l]=E,i[l+1]=C,i[l+2]=R;let P=e[x+7];if(!(P&W)&&_&&this._checks<this.maxChecks){this._checks++,et.set(c[l],c[l+1],c[l+2]),st.set(E,C,R);let B=_(et,st);if(c[l]=E,c[l+1]=C,c[l+2]=R,B){mt.copy(B.point),dt.copy(B.normal),this._landDrop(n,mt.x,mt.y,mt.z,dt.x,dt.y,dt.z,!1),this._killDrop(n),n--;continue}}else P&W&&(c[l]=E,c[l+1]=C,c[l+2]=R);if(w>=r&&C<r){let B=(w-r)/Math.max(1e-5,w-C);this._landDrop(n,d+(E-d)*B,r,A+(R-A)*B,0,1,0,!0),this._killDrop(n),n--;continue}}let f=this.dGeo.attributes.aPosR.array,h=this.dGeo.attributes.aVelS.array,y=this.dGeo.attributes.aColA.array;for(let n=0;n<this.dN;n++){let l=n*3,x=n*4,m=n*8,d=e[m],w=e[m+1],A=e[m+2],E=s[l],C=s[l+1],R=s[l+2],P=Math.sqrt(E*E+C*C+R*R),B=e[m+4],St=1+Math.min(P*.062*B,2.3*B);St*=1+.14*Math.sin(w*38+e[m+5]*20)*Math.min(1,w*6);let Gt=Math.min(1,w*22+.35),Wt=Math.min(1,(A-w)/.12);f[x]=i[l],f[x+1]=i[l+1],f[x+2]=i[l+2],f[x+3]=d*Gt*Wt,h[x]=E,h[x+1]=C,h[x+2]=R,h[x+3]=Math.max(1,St),y[x]=this.dC[l],y[x+1]=this.dC[l+1],y[x+2]=this.dC[l+2],y[x+3]=e[m+7]&rt?0:1}this.dGeo.instanceCount=this.dN,lt(this.dGeo,this.dN)}_initSprites(t,i){let s=[["aPosSize",4],["aColA",4],["aMisc",4]],e=(c,a,r,_,f)=>{let h=Bt(c,s),y=new Z({vertexShader:$t,fragmentShader:a,transparent:!0,depthWrite:!1,blending:r,fog:!1}),n=new Q(h,y);return n.frustumCulled=!1,n.renderOrder=_,n.name=f,this.root.add(n),{cap:c,n:0,geo:h,mesh:n,P:new Float32Array(c*3),V:new Float32Array(c*3),C:new Float32Array(c*3),X:new Float32Array(c*14)}};this.puffs=e(t,Kt,Et,12,"FX_Puffs"),this.glows=e(i,Jt,wt,20,"FX_Glows")}_sprite(t,i,s,e,c,a,r,_,f,h,y,n,l=2.2,x=0,m=0,d=.08,w=1.2,A=0,E=0){let C;t.n<t.cap?C=t.n++:C=Math.floor(o()*t.cap);let R=C*3,P=C*14;t.P[R]=i,t.P[R+1]=s,t.P[R+2]=e,t.V[R]=c,t.V[R+1]=a,t.V[R+2]=r,t.C[R]=_.r,t.C[R+1]=_.g,t.C[R+2]=_.b;let B=t.X;return B[P]=f,B[P+1]=h,B[P+2]=0,B[P+3]=y,B[P+4]=n,B[P+5]=t===this.puffs&&m===Ht?0:o()*b,B[P+6]=(o()-.5)*w,B[P+7]=l,B[P+8]=x,B[P+9]=m,B[P+10]=d,B[P+11]=o(),B[P+12]=A,B[P+13]=E,C}_updateSprites(t,i,s){let e=t.P,c=t.V,a=t.C,r=t.X,_=t.geo.attributes.aPosSize.array,f=t.geo.attributes.aColA.array,h=t.geo.attributes.aMisc.array;for(let y=0;y<t.n;y++){let n=y*14;if(r[n+2]+=i,r[n+2]>=r[n+3]){let d=--t.n;y!==d&&(e.copyWithin(y*3,d*3,d*3+3),c.copyWithin(y*3,d*3,d*3+3),a.copyWithin(y*3,d*3,d*3+3),r.copyWithin(n,d*14,d*14+14)),y--;continue}let l=y*3,x=Math.max(0,1-r[n+7]*i);c[l]*=x,c[l+1]=c[l+1]*x+r[n+8]*i,c[l+2]*=x;let m=r[n+12];if(m>0){let d=r[n+2]*2.1+r[n+11]*40;c[l]+=Math.cos(d)*m*i*2.4,c[l+2]+=Math.sin(d*.83)*m*i*2.4}e[l]+=c[l]*i,e[l+1]+=c[l+1]*i,e[l+2]+=c[l+2]*i,r[n+5]+=r[n+6]*i}for(let y=0;y<t.n;y++){let n=y*14,l=y*3,x=y*4,m=r[n+2],d=r[n+3],w=m/d,A=r[n]+(r[n+1]-r[n])*ct(w),E=r[n+10]>0?Math.min(1,m/r[n+10]):1,C=r[n+13]>0?Math.min(1,(d-m)/r[n+13]):s?1-w:1-w*w,R=r[n+4]*E*C;_[x]=e[l],_[x+1]=e[l+1],_[x+2]=e[l+2],_[x+3]=A,f[x]=a[l],f[x+1]=a[l+1],f[x+2]=a[l+2],f[x+3]=R,h[x]=r[n+5],h[x+1]=r[n+11],h[x+2]=w,h[x+3]=r[n+9]}t.geo.instanceCount=t.n,lt(t.geo,t.n)}_initRings(t){let s=Bt(t+48,[["aPosR",4],["aNrmT",4],["aColA",4],["aMisc",4]]);s.attributes.position.array.forEach((a,r,_)=>{_[r]=a*2}),this._ringU={uTime:{value:0}};let e=new Z({uniforms:this._ringU,vertexShader:Qt,fragmentShader:Zt,transparent:!0,depthWrite:!1,fog:!1,side:_t,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),c=new Q(s,e);c.frustumCulled=!1,c.renderOrder=8,c.name="FX_Rings",this.root.add(c),this.rings={cap:t,n:0,geo:s,mesh:c,P:new Float32Array(t*3),V:new Float32Array(t*3),N:new Float32Array(t*3),C:new Float32Array(t*3),X:new Float32Array(t*8)},this.marks={cap:48,n:0,P:new Float32Array(144),N:new Float32Array(144),C:new Float32Array(144),X:new Float32Array(288)}}_ringRaw(t,i,s,e,c,a,r,_,f=0,h=0,y=0){let n=this.rings,l;n.n<n.cap?l=n.n++:l=Math.floor(o()*n.cap);let x=l*3,m=l*8;n.P[x]=t.x,n.P[x+1]=t.y,n.P[x+2]=t.z,n.V[x]=f,n.V[x+1]=h,n.V[x+2]=y;let d=Math.hypot(i.x,i.y,i.z)||1;return n.N[x]=i.x/d,n.N[x+1]=i.y/d,n.N[x+2]=i.z/d,n.C[x]=s.r,n.C[x+1]=s.g,n.C[x+2]=s.b,n.X[m]=e,n.X[m+1]=0,n.X[m+2]=c,n.X[m+3]=r,n.X[m+4]=a,n.X[m+5]=_,n.X[m+6]=o(),n.X[m+7]=a===vt||a===Nt?.55:a===pt?.35:.22,l}mark(t,i,s,e,c=Vt,a=1,r=0,_=1,f=.5){let h=this.marks;if(h.n>=h.cap)return;let y=h.n++,n=y*3,l=y*6,x=this._color(s,this._colB);h.P[n]=t.x,h.P[n+1]=t.y,h.P[n+2]=t.z;let m=i||z,d=Math.hypot(m.x,m.y,m.z)||1;h.N[n]=m.x/d,h.N[n+1]=m.y/d,h.N[n+2]=m.z/d,h.C[n]=x.r,h.C[n+1]=x.g,h.C[n+2]=x.b,h.X[l]=e,h.X[l+1]=r,h.X[l+2]=a,h.X[l+3]=c,h.X[l+4]=_,h.X[l+5]=f}_updateRings(t){let i=this.rings,s=i.X,e=i.geo.attributes.aPosR.array,c=i.geo.attributes.aNrmT.array,a=i.geo.attributes.aColA.array,r=i.geo.attributes.aMisc.array;for(let y=0;y<i.n;y++){let n=y*8,l=y*3;if(s[n+1]+=t,s[n+1]>=s[n+2]){let w=--i.n;y!==w&&(i.P.copyWithin(l,w*3,w*3+3),i.V.copyWithin(l,w*3,w*3+3),i.N.copyWithin(l,w*3,w*3+3),i.C.copyWithin(l,w*3,w*3+3),s.copyWithin(n,w*8,w*8+8)),y--;continue}let x=i.V[l],m=i.V[l+1],d=i.V[l+2];if(x!==0||m!==0||d!==0){let w=Math.max(0,1-1.6*t);i.P[l]+=x*t,i.P[l+1]+=m*t,i.P[l+2]+=d*t,i.V[l]=x*w,i.V[l+1]=m*w,i.V[l+2]=d*w}}for(let y=0;y<i.n;y++){let n=y*8,l=y*3,x=y*4,m=s[n+1]/s[n+2],d=s[n]*(s[n+7]+(1-s[n+7])*ct(m));e[x]=i.P[l],e[x+1]=i.P[l+1],e[x+2]=i.P[l+2],e[x+3]=d,c[x]=i.N[l],c[x+1]=i.N[l+1],c[x+2]=i.N[l+2],c[x+3]=m,a[x]=i.C[l],a[x+1]=i.C[l+1],a[x+2]=i.C[l+2],a[x+3]=s[n+3],r[x]=s[n+6],r[x+1]=s[n+4],r[x+2]=s[n+5],r[x+3]=0}let _=this.marks,f=_.X,h=i.n;for(let y=0;y<_.n;y++,h++){let n=y*6,l=y*3,x=h*4;e[x]=_.P[l],e[x+1]=_.P[l+1],e[x+2]=_.P[l+2],e[x+3]=f[n],c[x]=_.N[l],c[x+1]=_.N[l+1],c[x+2]=_.N[l+2],c[x+3]=f[n+1],a[x]=_.C[l],a[x+1]=_.C[l+1],a[x+2]=_.C[l+2],a[x+3]=f[n+2],r[x]=f[n+5],r[x+1]=f[n+3],r[x+2]=f[n+4],r[x+3]=0}_.n=0,i.geo.instanceCount=h,lt(i.geo,h)}_initShells(t){let i=new qt(1,3),s=Ft(i,t,[["aPosR",4],["aColA",4],["aMisc",4],["aAxis",4]]),e=this._light;this._shellUniforms={uTime:{value:0},uSunDir:{value:this.sunDir},uSunCol:{value:e.sunCol},uSkyCol:{value:e.sky}};let c=new Z({uniforms:this._shellUniforms,vertexShader:t0,fragmentShader:i0,side:_t,alphaToCoverage:!0,fog:!1}),a=new Q(s,c);a.frustumCulled=!1,a.renderOrder=5,a.name="FX_Shells",this.root.add(a),this.shells={cap:t,n:0,geo:s,mesh:a,P:new Float32Array(t*3),V:new Float32Array(t*3),C:new Float32Array(t*3),X:new Float32Array(t*9),A:new Float32Array(t*4)}}_shell(t,i,s,e,c,a,r,_,f=0,h=.08,y=null,n=0){let l=this.shells,x;l.n<l.cap?x=l.n++:x=Math.floor(o()*l.cap);let m=x*3,d=x*9;l.P[m]=t.x,l.P[m+1]=t.y,l.P[m+2]=t.z,l.V[m]=0,l.V[m+1]=f,l.V[m+2]=0,l.C[m]=i.r,l.C[m+1]=i.g,l.C[m+2]=i.b,l.X[d]=s,l.X[d+1]=e,l.X[d+2]=0,l.X[d+3]=a,l.X[d+4]=c,l.X[d+5]=r,l.X[d+6]=_,l.X[d+7]=o(),l.X[d+8]=h;let w=x*4;y?(l.A[w]=y.x,l.A[w+1]=y.y,l.A[w+2]=y.z,l.A[w+3]=n):(l.A[w]=0,l.A[w+1]=1,l.A[w+2]=0,l.A[w+3]=0)}_updateShells(t){let i=this.shells,s=i.X,e=i.geo.attributes.aPosR.array,c=i.geo.attributes.aColA.array,a=i.geo.attributes.aMisc.array,r=i.geo.attributes.aAxis.array;for(let _=0;_<i.n;_++){let f=_*9,h=_*3;if(s[f+2]+=t,s[f+2]>=s[f+3]){let y=--i.n;_!==y&&(i.P.copyWithin(h,y*3,y*3+3),i.V.copyWithin(h,y*3,y*3+3),i.C.copyWithin(h,y*3,y*3+3),s.copyWithin(f,y*9,y*9+9),i.A.copyWithin(_*4,y*4,y*4+4)),_--;continue}i.P[h+1]+=i.V[h+1]*t}for(let _=0;_<i.n;_++){let f=_*9,h=_*3,y=_*4,n=s[f+2],l=s[f+3],x=Math.min(1,n/s[f+4]),m=s[f]+(s[f+1]-s[f])*ct(x),d=n/l;e[y]=i.P[h],e[y+1]=i.P[h+1],e[y+2]=i.P[h+2],e[y+3]=m,c[y]=i.C[h],c[y+1]=i.C[h+1],c[y+2]=i.C[h+2],c[y+3]=s[f+5],a[y]=d,a[y+1]=s[f+7],a[y+2]=s[f+6],a[y+3]=s[f+8]*(1-x*.6),r[y]=i.A[y],r[y+1]=i.A[y+1],r[y+2]=i.A[y+2],r[y+3]=i.A[y+3]}i.geo.instanceCount=i.n,lt(i.geo,i.n)}_initBeams(t){let s=new At(1,1,1,24,7,!0);s.translate(0,.5,0);let e=Ft(s,t+8,[["aPosR",4],["aColA",4],["aMisc",4]]);this._beamU={uTime:{value:0}};let c=new Z({uniforms:this._beamU,vertexShader:s0,fragmentShader:o0,transparent:!0,depthWrite:!1,side:_t,fog:!1}),a=new Q(e,c);a.frustumCulled=!1,a.renderOrder=18,a.name="FX_Beams",this.root.add(a),this.beams={cap:t,n:0,geo:e,mesh:a,P:new Float32Array(t*3),C:new Float32Array(t*3),X:new Float32Array(t*5)},this.pillars={cap:8,n:0,P:new Float32Array(24),C:new Float32Array(32),X:new Float32Array(24)}}_beam(t,i,s,e,c){let a=this.beams,r;a.n<a.cap?r=a.n++:r=0,a.P[r*3]=t.x,a.P[r*3+1]=t.y,a.P[r*3+2]=t.z,a.C[r*3]=i.r,a.C[r*3+1]=i.g,a.C[r*3+2]=i.b,a.X[r*5]=s,a.X[r*5+1]=e,a.X[r*5+2]=0,a.X[r*5+3]=c,a.X[r*5+4]=o()}pillar(t,i,s=.5,e=8,c=.6,a=.3){let r=this.pillars;if(r.n>=r.cap)return;let _=r.n++,f=this._color(i,this._colB);r.P[_*3]=t.x,r.P[_*3+1]=t.y,r.P[_*3+2]=t.z,r.C[_*4]=f.r,r.C[_*4+1]=f.g,r.C[_*4+2]=f.b,r.C[_*4+3]=c,r.X[_*3]=s,r.X[_*3+1]=e,r.X[_*3+2]=a}_updateBeams(t){let i=this.beams,s=i.X,e=i.geo.attributes.aPosR.array,c=i.geo.attributes.aColA.array,a=i.geo.attributes.aMisc.array;for(let f=0;f<i.n;f++){let h=f*5;if(s[h+2]+=t,s[h+2]>=s[h+3]){let y=--i.n;f!==y&&(i.P.copyWithin(f*3,y*3,y*3+3),i.C.copyWithin(f*3,y*3,y*3+3),s.copyWithin(h,y*5,y*5+5)),f--;continue}}for(let f=0;f<i.n;f++){let h=f*5,y=f*3,n=f*4,l=s[h+2]/s[h+3],x=s[h+1]*ct(Math.min(1,l*3.2)),m=s[h]*(.55+.6*ct(Math.min(1,l*4)))*(1-.5*l);e[n]=i.P[y],e[n+1]=i.P[y+1],e[n+2]=i.P[y+2],e[n+3]=m,c[n]=i.C[y],c[n+1]=i.C[y+1],c[n+2]=i.C[y+2],c[n+3]=Math.pow(1-l,1.6)*Math.min(1,l*25),a[n]=l,a[n+1]=x,a[n+2]=s[h+4],a[n+3]=0}let r=this.pillars,_=i.n;for(let f=0;f<r.n;f++,_++){let h=_*4;e[h]=r.P[f*3],e[h+1]=r.P[f*3+1],e[h+2]=r.P[f*3+2],e[h+3]=r.X[f*3],c[h]=r.C[f*4],c[h+1]=r.C[f*4+1],c[h+2]=r.C[f*4+2],c[h+3]=r.C[f*4+3],a[h]=.35,a[h+1]=r.X[f*3+1],a[h+2]=r.X[f*3+2],a[h+3]=1}r.n=0,i.geo.instanceCount=_,lt(i.geo,_)}_initMotes(t){let i=new ut;i.setAttribute("position",new Mt([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3)),i.setIndex([0,1,2,0,2,3]);let s=new Float32Array(t*4);for(let a=0;a<s.length;a++)s[a]=o();i.setAttribute("aSeed",new yt(s,4)),i.instanceCount=t,this._moteU={uTime:{value:0},uCam:{value:new T},uBox:{value:16},uWind:{value:new T(.28,.05,.12)},uSunDir:{value:this.sunDir},uCol:{value:new H(1,.94,.8).multiplyScalar(.9)}};let e=new Z({uniforms:this._moteU,vertexShader:e0,fragmentShader:a0,transparent:!0,depthWrite:!1,blending:wt,fog:!1}),c=new Q(i,e);c.frustumCulled=!1,c.renderOrder=21,c.name="FX_Motes",this.motes=c,this.root.add(c)}_after(t,i,s,e,c,a=0,r=0,_=0){if(this._sqN>=96)return;let f=this._sqN++*14,h=this._sq;h[f]=t,h[f+1]=i,h[f+2]=s.x,h[f+3]=s.y,h[f+4]=s.z,h[f+5]=e.x,h[f+6]=e.y,h[f+7]=e.z,h[f+8]=c.r,h[f+9]=c.g,h[f+10]=c.b,h[f+11]=a,h[f+12]=r,h[f+13]=_}_runSchedule(t){let i=this._sq;for(let s=0;s<this._sqN;s++){let e=s*14;if(i[e]-=t,i[e]>0)continue;V.set(i[e+2],i[e+3],i[e+4]),I.set(i[e+5],i[e+6],i[e+7]),gt.setRGB(i[e+8],i[e+9],i[e+10]);let c=i[e+1],a=i[e+11],r=i[e+12],_=i[e+13],f=--this._sqN;s!==f&&i.copyWithin(e,f*14,f*14+14),s--,c===ht?this._ringRaw(V,I,gt,a,r,_,.9,1):c===n0?this._crown(V,I,gt,a,r,_):c===l0&&this._dustRing(V,gt,a,r)}}_probeDown(t,i,s,e){if(this.collider){et.copy(t),st.copy(t),st.y-=i;let c=this.collider(et,st);if(c)return s.copy(c.point),e.copy(c.normal),!0}return t.y-i<=this.waterY&&t.y>=this.waterY?(s.set(t.x,this.waterY+.01,t.z),e.set(0,1,0),!0):!1}_crown(t,i,s,e,c,a,r=0){Rt(i,j,S);let _=Math.max(1,Math.round(e*this.q)),f=o()*b;for(let h=0;h<_;h++){let y=f+h/_*b+(o()-.5)*.5,n=Math.cos(y),l=Math.sin(y),x=.7+o()*.9,m=.6+o()*.6,d=c*(.6+o()*.6),w=(j.x*n+S.x*l)*m+i.x*x,A=(j.y*n+S.y*l)*m+i.y*x,E=(j.z*n+S.z*l)*m+i.z*x,C=a*(.55+o()*.8);this._spawnDrop(t.x+i.x*.04,t.y+i.y*.04,t.z+i.z*.04,w*d,A*d,E*d,s,C,1.2,1,1,r)}}_dustRing(t,i,s,e){let c=Math.max(2,Math.round(s*this.q)),a=o()*b;for(let r=0;r<c;r++){let _=a+r/c*b+(o()-.5)*.4,f=e*(.6+o()*.6);this._sprite(this.puffs,t.x+Math.cos(_)*.25,t.y+.12+o()*.12,t.z+Math.sin(_)*.25,Math.cos(_)*f,.3+o()*.5,Math.sin(_)*f,i,.16+o()*.1,.5+o()*.35,.55+o()*.35,.3,3.2,.25,nt,.05,1.2)}}_grains(t,i,s,e){let c=Math.max(1,Math.round(s*this.q));for(let a=0;a<c;a++){D(i,.9,u);let r=e*(.6+o()*.7);this._spawnDrop(t.x,t.y+.03,t.z,u.x*r,u.y*r,u.z*r,c0,.01+o()*.012,.3+o()*.2,1.1,1,W|rt)}}_toCam(t,i){return i.copy(this._camPos).sub(t).normalize()}burst(t,i,s,e=at){let c=this._color(s,this._col),a=Math.max(1,Math.round((e.count??12)*this.q)),r=e.speed??4,_=e.size??.1,f=e.spread??.9,h=e.gravity??1,y=e.paint?k:0;p.copy(i||z),p.lengthSq()<1e-6&&p.copy(z),p.normalize();let n=t.x+p.x*.04,l=t.y+p.y*.04,x=t.z+p.z*.04;for(let d=0;d<a;d++){D(p,Math.max(.05,f)*Math.PI*.5,u);let w=r*(.5+o()*.8),A=_*(.35+o()*.6);if(this._spawnDrop(n,l,x,u.x*w,u.y*w,u.z*w,c,A,1.6+o()*.6,h,1.3,y),o()<.45){let E=w*(.7+o()*.5);this._spawnDrop(n,l,x,u.x*E+(o()-.5)*.8,u.y*E+(o()-.5)*.8,u.z*E+(o()-.5)*.8,c,A*.4,1.2,h,1.3,0)}}let m=_*(1.6+.5*Math.sqrt(a));a>=4&&e.sheet!==!1&&this._near(t,24)&&(v.copy(t).addScaledVector(p,m*.12),this._shell(v,c,m*.35,m*1.1,.07,.17+m*.12,.95,0,0,.2,p,1)),this._ripple(t,.0035+_*.03,.1,1,.5,p,null),e.ring===!0&&this._ringRaw(t,p,c,.22+_*3.2,.26,Y,.9,1.1),e.mist===!0&&a>=6&&(this._colB.copy(c).lerp(g,.3),this._sprite(this.puffs,n,l,x,p.x*1.2,p.y*1.2,p.z*1.2,this._colB,_*2,_*5,.35,.3,5))}drop(t,i,s,e=at){let c=this._color(s,this._col);this._spawnDrop(t.x,t.y,t.z,i.x,i.y,i.z,c,e.size??.1,e.life??1.2,e.gravity??1,e.stretch??1,(e.paint?k:0)|(e.ring?xt:0)|(e.quiet?N:0)|(e.noCollide?W:0))}ring(t,i,s,e=at){let c=this._color(s,this._col),a=i||z,r=t;if(this.collider&&e.snap!==!1){et.copy(t).addScaledVector(a,.25),st.copy(t).addScaledVector(a,-1.4);let _=this.collider(et,st);if(!_)return;r=F.copy(_.point).addScaledVector(a,.02)}this._ringRaw(r,a,c,e.radius??1.5,e.life??.35,e.style??Y,e.alpha??.95,e.thickness??1)}explosion(t,i,s=3){let e=this._color(i,this._col),c=this.q,a=s,r=Math.min(a,2.4),_=this.paintEffects?k:0,f=Math.sqrt(a/3);this._colB.copy(e).multiplyScalar(4.5),this._sprite(this.glows,t.x,t.y,t.z,0,0,0,this._colB,r*.4,r*.85,.12,1,2.2,0,q+6,0),this._colB.copy(e).multiplyScalar(1.15),this._sprite(this.glows,t.x,t.y,t.z,0,0,0,this._colB,r*.9,r*1.6,.17,.5,2.2,0,q,0),this._shell(t,e,r*.2,r*.78,.09,.34,1,0,0,.2),this._burstDrops(t,e,r,f,_,26,6,18),this._probeDown(t,a+1.5,v,p)&&this._ripple(v,.011+.0028*a,.24+.03*a,2.1+.4*a,1.05,p,e),this._colB.copy(e).lerp(g,.42);let h=Math.round(4*c);for(let y=0;y<h;y++){J(u),u.y=Math.abs(u.y)*.5;let n=a*(.2+o()*.4);this._sprite(this.puffs,t.x+u.x*n,t.y+u.y*n*.6,t.z+u.z*n,u.x*1.8,.5+o()*.6,u.z*1.8,this._colB,r*(.25+o()*.15),r*(.55+o()*.25),.55+o()*.3,.12,2.8,.2)}}_burstDrops(t,i,s,e,c,a,r,_){let f=this.q,h=Math.round(a*f);for(let y=0;y<h;y++){J(u),u.y=Math.abs(u.y)*.85+.12,u.normalize();let n=(6+o()*7)*e,l=s*.3;this._spawnDrop(t.x+u.x*l,t.y+u.y*l,t.z+u.z*l,u.x*n,u.y*n,u.z*n,i,.03+o()*.03,1.6,1,1.5,o()<.3?c:0)}h=Math.round(r*f);for(let y=0;y<h;y++){let n=o()*b,l=(2.2+o()*2.6)*e;this._spawnDrop(t.x,t.y+.2,t.z,Math.cos(n)*l,3.2+o()*3,Math.sin(n)*l,i,.07+o()*.035,2.2,1,1,c)}h=Math.round(_*f);for(let y=0;y<h;y++){J(u),u.y=Math.abs(u.y)*.7+.2,u.normalize();let n=(4+o()*6)*e;this._spawnDrop(t.x,t.y,t.z,u.x*n,u.y*n,u.z*n,i,.011+o()*.016,1,1,1.3,0)}}splatted(t,i){let s=this._color(i,this._col),e=this.q,c=this.paintEffects?k:0;this._colB.copy(s).multiplyScalar(3.6),this._sprite(this.glows,t.x,t.y,t.z,0,0,0,this._colB,.8,1.6,.14,1,2.2,0,q+5,0),this._shell(t,s,.28,.9,.09,.34,1,0,0,.2),this._burstDrops(t,s,1.2,1,c,30,7,22),this._colB.copy(s).lerp(g,.45);for(let a=0;a<Math.round(3*e);a++)J(u),this._sprite(this.puffs,t.x+u.x*.35,t.y+u.y*.3,t.z+u.z*.35,u.x*1.4,.8+o()*.5,u.z*1.4,this._colB,.4,1+o()*.3,.6+o()*.3,.14,2,.5);this._probeDown(t,3,v,p)&&this._ripple(v,.014,.26,2.4,1.1,p,s)}wake(t,i,s,e=8,c=z){if(!this._near(t,45))return;let a=this._color(s,this._col),r=Math.min(1,e/11.8),_=i.z,f=-i.x,h=Math.floor((.5+3*r*r)*this.q+o());for(;h-- >0;){let y=e*(.06+o()*.1),n=1.5+o()*1.3+1.5*r,l=(o()-.5)*(.7+.9*r);u.set(-i.x*y+c.x*n+_*l,-i.y*y+c.y*n,-i.z*y+c.z*n+f*l),this._spawnDrop(t.x-i.x*.34,t.y+.05,t.z-i.z*.34,u.x,u.y,u.z,a,.016+o()*.018+.012*r,.6,1,1.7,0)}o()<.28*this.q+.08&&(this._colB.copy(a).lerp(g,.5).multiplyScalar(1.1),this._sprite(this.glows,t.x-i.x*(.35+o()*.6)+(o()-.5)*.3,t.y+.05,t.z-i.z*(.35+o()*.6)+(o()-.5)*.3,0,.22,0,this._colB,.045+o()*.04,.09,.3+o()*.15,.7,1,0,bt+1,.03,0))}swimCarve(t,i,s,e,c=1){if(!this._near(t,32))return;let a=this._color(e,this._col),r=Math.max(1,Math.round((1+2.5*c)*this.q));for(;r-- >0;){let _=1.6+o()*1.8*c,f=1.8+o()*1.6*c,h=(o()-.3)*1.2;this._spawnDrop(t.x+s.x*.18,t.y+.05,t.z+s.z*.18,s.x*_+i.x*h,f,s.z*_+i.z*h,a,.018+o()*.022,.65,1,1.6,0)}}muzzle(t,i,s,e="shooter"){let c=this._color(s,this._col);if(p.copy(i).normalize(),e==="blaster"){this._colB.copy(c).multiplyScalar(4.5),this._sprite(this.glows,t.x+p.x*.1,t.y+p.y*.1,t.z+p.z*.1,p.x*2,p.y*2,p.z*2,this._colB,.35,.7,.09,1,2.2,0,q+4,0),this._colB.copy(c).lerp(g,.3),this._ringRaw(v.copy(t).addScaledVector(p,.25),p,this._colB,.55,.16,U,.9,1.2,p.x*3,p.y*3,p.z*3);let r=Math.max(3,Math.round(9*this.q));for(let _=0;_<r;_++){D(p,.4,u);let f=6+o()*6;this._spawnDrop(t.x,t.y,t.z,u.x*f,u.y*f,u.z*f,c,.03+o()*.035,.4+o()*.2,.8,1.3,0)}this._colB.copy(c).lerp(g,.45);for(let _=0;_<2;_++)this._sprite(this.puffs,t.x+p.x*.3,t.y+p.y*.3,t.z+p.z*.3,p.x*(2+_*1.5),p.y*2+.4,p.z*(2+_*1.5),this._colB,.2,.7,.4,.32,5);return}if(e==="charger"){this._colB.copy(c).lerp(g,.4).multiplyScalar(3.5),this._sprite(this.glows,t.x,t.y,t.z,0,0,0,this._colB,.7,.4,.14,1,0,0,G+3,0,0),this._colB.copy(c).lerp(g,.3),this._ringRaw(v.copy(t).addScaledVector(p,.15),p,this._colB,.38,.14,U,.9,1,p.x*2,p.y*2,p.z*2);let r=Math.max(2,Math.round(5*this.q));for(let _=0;_<r;_++){D(p,.14,u);let f=10+o()*8;this._spawnDrop(t.x,t.y,t.z,u.x*f,u.y*f,u.z*f,c,.018+o()*.02,.25,.4,1.8,N)}return}this._colB.copy(c).multiplyScalar(4),this._sprite(this.glows,t.x+p.x*.05,t.y+p.y*.05,t.z+p.z*.05,p.x*2,p.y*2,p.z*2,this._colB,.2,.38,.07,1,2.2,0,q+4,0),this._colB.copy(c).multiplyScalar(1.2),this._sprite(this.glows,t.x,t.y,t.z,0,0,0,this._colB,.4,.6,.1,.8,2.2,0,q,0);let a=Math.max(2,Math.round(5*this.q));for(let r=0;r<a;r++){D(p,.28,u);let _=6+o()*7;this._spawnDrop(t.x,t.y,t.z,u.x*_,u.y*_,u.z*_,c,.022+o()*.028,.28+o()*.12,.6,1.4,0)}this._colB.copy(c).lerp(g,.4),this._sprite(this.puffs,t.x+p.x*.15,t.y+p.y*.15,t.z+p.z*.15,p.x*2.5,p.y*2.5+.3,p.z*2.5,this._colB,.12,.38,.28,.3,6)}spawnFlash(t,i){let s=this._color(i,this._col),e=this.q;this._colB.copy(s).multiplyScalar(1.25),this._beam(t,this._colB,1.15,10,1),this._colB.copy(s).multiplyScalar(4),this._sprite(this.glows,t.x,t.y+.8,t.z,0,0,0,this._colB,2.2,3.8,.3,1,2.2,0,q+5,0),this._ringRaw(t,z,s,2.8,.6,Y,.95,1.3),this._after(.12,ht,t,z,s,3.6,.6,U),this._ripple(t,.012,.24,2.6,1.1,z,s);let c=Math.round(40*e);for(let a=0;a<c;a++){let r=o()*b,_=o()*.7,f=7+o()*9,h=Math.cos(r)*(.6+o()*1.8),y=Math.sin(r)*(.6+o()*1.8);this._spawnDrop(t.x+Math.cos(r)*_,t.y+.1,t.z+Math.sin(r)*_,h,f,y,s,.05+o()*.07,1.6,1,1.2,0)}this._colB.copy(s).lerp(g,.3);for(let a=0;a<Math.round(8*e);a++){let r=o()*b;this._sprite(this.puffs,t.x+Math.cos(r)*.8,t.y+.3,t.z+Math.sin(r)*.8,Math.cos(r)*2.5,.8,Math.sin(r)*2.5,this._colB,.5,1.3,.7+o()*.4,.45,3,.4)}this._colB.copy(s).lerp(g,.55).multiplyScalar(2.4);for(let a=0;a<6;a++){let r=a/6*b+o()*.5,_=.9+o()*.8;this._sprite(this.glows,t.x+Math.cos(r)*_,t.y+.5+o()*2.5,t.z+Math.sin(r)*_,0,1.2+o(),0,this._colB,.35,.18,.5+o()*.3,1,1,0,G+2,.05,1.5)}}rain(t,i=3.4,s,e=this._dt,c=at){let a=this._color(s,this._col),r=i*i,_=Math.floor(r*8.5*this.q*e+o());for(;_-- >0;){let f=o()*b,h=Math.sqrt(o())*i*.92,y=15+o()*5;this._spawnDrop(t.x+Math.cos(f)*h,t.y-.25-o()*.4,t.z+Math.sin(f)*h,.4,-y,.15,a,.03+o()*.018,1.4,1,3.2,(c.paint?k:0)|xt)}if(c.cloud!==!1){let f=Math.floor(e*(14+i*3.5)+o());for(this._colB.copy(a).lerp(g,.1);f-- >0;){let h=o()*b,y=Math.sqrt(o())*i*.9,n=(1-y/i)*.6;this._sprite(this.puffs,t.x+Math.cos(h)*y,t.y+n+(o()-.4)*.5,t.z+Math.sin(h)*y,(o()-.5)*.3,.04,(o()-.5)*.3,this._colB,i*.3,i*(.4+o()*.14),1.6+o()*.6,1,1,0,It,.3,.25)}}}footstep(t,i,s=0,e=null,c=5){let a=this._color(i,this._col),r=e?e.x:0,_=e?e.z:0;if(s===0){if(c<3.2)return;this._sprite(this.puffs,t.x-r*.1,t.y+.08,t.z-_*.1,-r*.6+(o()-.5)*.3,.3+o()*.2,-_*.6+(o()-.5)*.3,K,.1+o()*.05,.34+o()*.14,.5+o()*.2,.42,3.2,.15,nt,.04,1.2),p.set(-r*.7,.75,-_*.7).normalize(),this._grains(t,p,2,1.5);return}let f=tt(c/7,.3,1.2);if(p.set(-r*.55,1,-_*.55).normalize(),v.set(t.x,t.y+.01,t.z),s===1){let h=Math.max(1,Math.round((2+2.5*f)*this.q));for(let y=0;y<h;y++){D(p,.75,u);let n=1.4+o()*1.5*f;this._spawnDrop(t.x,t.y+.03,t.z,u.x*n,u.y*n,u.z*n,a,.018+o()*.022,.6,1,1.2,0)}this._colB.copy(a).lerp(g,.2),this._ripple(v,.0035+.002*f,.1,.9,.55,z,this._colB)}else{let h=Math.max(1,Math.round(3*this.q));for(let y=0;y<h;y++){D(p,.6,u);let n=.9+o()*.9;this._spawnDrop(t.x,t.y+.03,t.z,u.x*n,u.y*n,u.z*n,a,.026+o()*.022,.6,1.3,.8,0)}this._ripple(v,.003,.08,.55,.5,z,a),this.enemyInkSizzle(t,a)}}land(t,i,s=0,e=8){let c=this._color(i,this._col),a=tt((e-3)/12,0,1);if(v.set(t.x,t.y+.01,t.z),s===0){L.copy(K),this._ringRaw(v,z,L,.8+1.1*a,.5,pt,.62,1),this._dustRing(t,L,4+6*a,1.4+1.6*a),p.set(0,1,0),this._grains(t,p,4+6*a,1.6+a*1.5),a>.5&&this._ringRaw(v,z,L,1.3+a,.3,U,.55,1);return}this._crown(t,z,c,8+16*a,2.4+2.2*a,.04+.018*a),a>.25&&(S.set(t.x,t.y+.05,t.z),this._shell(S,c,.15,.4+.35*a,.07,.22,.95,0,0,.2,z,1)),this._colB.copy(c).lerp(g,.2),this._ripple(v,.007+.006*a,.16,1.6+a,.8,z,this._colB)}jumpOff(t,i,s=0,e=!1){let c=this._color(i,this._col);if(v.set(t.x,t.y+.01,t.z),e||s===1){let a=Math.max(2,Math.round(8*this.q));for(let r=0;r<a;r++){D(z,.5,u);let _=3+o()*2.5;this._spawnDrop(t.x+(o()-.5)*.3,t.y+.05,t.z+(o()-.5)*.3,u.x*_,u.y*_,u.z*_,c,.02+o()*.025,.9,1,1.3,0)}this._colB.copy(c).lerp(g,.2),this._ripple(v,.006,.13,1.3,.7,z,this._colB)}else s===2?this.footstep(t,c,2,null,5):(this._sprite(this.puffs,t.x,t.y+.08,t.z,.3,.2,0,K,.1,.36,.45,.24,3.5,.2,nt,.03,1),this._sprite(this.puffs,t.x,t.y+.08,t.z,-.3,.2,0,K,.1,.34,.45,.22,3.5,.2,nt,.03,1),this._grains(t,z,3,1.4),this._ringRaw(v,z,K,.45,.35,pt,.35,1))}formPop(t,i,s=!0,e=!1){let c=this._color(i,this._col),a=t.y+(s?.35:.55);this._colB.copy(c).lerp(g,.35),this._sprite(this.puffs,t.x,a,t.z,0,s?-.2:.6,0,this._colB,.22,.62,.26,e?.25:.38,5),v.set(t.x,a,t.z),this._toCam(v,S),this._colB.copy(c).lerp(g,.4),this._ringRaw(v,S,this._colB,.5,.16,U,.7,1);let r=Math.max(2,Math.round(5*this.q));for(let _=0;_<r;_++){let f=_/r*b+o()*.6,h=1.4+o()*1.2;this._spawnDrop(t.x,a,t.z,Math.cos(f)*h,1.2+o()*1.6,Math.sin(f)*h,c,.022+o()*.02,.6,1,1,0)}}dive(t,i,s=4){let e=this._color(i,this._col);v.set(t.x,t.y+.01,t.z),this._crown(v,z,e,10+s*.6,2.2+Math.min(2.5,s*.18),.036),s>3&&(S.set(t.x,t.y+.04,t.z),this._shell(S,e,.12,.34+Math.min(.25,s*.02),.06,.2,.95,0,0,.2,z,1)),this._colB.copy(e).lerp(g,.2),this._ripple(v,.008+Math.min(.006,s*6e-4),.15,1.5,.85,z,this._colB),this.bubbles(t,e,3)}emerge(t,i,s=4){let e=this._color(i,this._col);v.set(t.x,t.y+.01,t.z);let c=Math.max(2,Math.round(8*this.q));for(let a=0;a<c;a++){D(z,.55,u);let r=2.5+o()*2;this._spawnDrop(t.x+(o()-.5)*.25,t.y+.08,t.z+(o()-.5)*.25,u.x*r,u.y*r,u.z*r,e,.022+o()*.026,.9,1,1.3,0)}this._colB.copy(e).lerp(g,.2),this._ripple(v,.007,.14,1.3,.75,z,this._colB)}bubbles(t,i,s=3){let e=this._color(i,this._col);this._colB.copy(e).lerp(g,.55).multiplyScalar(1.1);let c=Math.max(1,Math.round(s*this.q));for(let a=0;a<c;a++)this._sprite(this.glows,t.x+(o()-.5)*.5,t.y+.05+o()*.05,t.z+(o()-.5)*.5,0,.3+o()*.3,0,this._colB,.04+o()*.04,.08+o()*.04,.3+o()*.25,.8,1,0,bt+1,.04+o()*.1,0)}climbDrip(t,i,s){let e=this._color(s,this._col);this._spawnDrop(t.x+i.x*.06+(o()-.5)*.2,t.y+(o()-.5)*.2,t.z+i.z*.06+(o()-.5)*.2,i.x*.25+(o()-.5)*.2,-.4-o()*.6,i.z*.25+(o()-.5)*.2,e,.024+o()*.022,1.4,.5,1.3,0),v.copy(t).addScaledVector(i,.03),this._colB.copy(e).lerp(g,.2),o()<.5&&this._ripple(v,.004,.12,.9,.55,i,this._colB)}climbPop(t,i,s){let e=this._color(s,this._col);p.set(i.x*.5,1,i.z*.5).normalize();let c=Math.max(3,Math.round(10*this.q));for(let a=0;a<c;a++){D(p,.55,u);let r=2.5+o()*2.5;this._spawnDrop(t.x,t.y+.1,t.z,u.x*r,u.y*r,u.z*r,e,.03+o()*.03,1,1,1,0)}this._colB.copy(e).lerp(g,.35),this._sprite(this.puffs,t.x,t.y+.3,t.z,i.x,1.2,i.z,this._colB,.15,.5,.35,.3,4)}hurtDrip(t,i,s=.035){let e=this._color(i,this._col);this._spawnDrop(t.x,t.y,t.z,(o()-.5)*.5,-.2-o()*.4,(o()-.5)*.5,e,s*(.7+o()*.6),1.6,1,1.3,0)}hitSplash(t,i,s,e=30,c=!1){let a=this._color(s,this._col),r=tt(e/60,.3,1.5);p.copy(i),p.y*=.5,p.lengthSq()<1e-6&&p.set(0,0,1),p.normalize(),S.copy(p).negate(),v.copy(t).addScaledVector(S,.28),this._shell(v,a,.08,.26+.12*r,.06,.2,.95,0,0,.18);let _=Math.max(3,Math.round((6+8*r)*this.q));for(let f=0;f<_;f++){let h=f%3===0;D(h?S:p,h?1:.65,u),u.y+=.3;let y=h?1.8+o()*1.8:3+o()*3.2;this._spawnDrop(v.x,v.y,v.z,u.x*y,u.y*y,u.z*y,a,.02+o()*.03*r,1.1,1,1.4,0)}this._colB.copy(a).multiplyScalar(2.6),this._sprite(this.glows,v.x,v.y,v.z,0,0,0,this._colB,.25,.45+.15*r,.07,1,0,0,q+2,0),c||(this._colB.copy(a).lerp(g,.35),this._sprite(this.puffs,v.x,v.y,v.z,p.x*1.5,.3,p.z*1.5,this._colB,.18,.45+.15*r,.28,.22,4))}mist(t,i,s,e=.2,c=.25){let a=this._color(s,this._col);this._colB.copy(a).lerp(g,.4),this._sprite(this.puffs,t.x,t.y,t.z,i?i.x:0,i?i.y:0,i?i.z:0,this._colB,e*.45,e*1.4,.3+o()*.12,c,4.5,.2)}shotTrail(t,i,s,e=!1){let c=this._color(s,this._col);this._colB.copy(c).lerp(g,.42);let a=e?.3:.14;this._sprite(this.puffs,t.x,t.y,t.z,i.x*.06,i.y*.06+.1,i.z*.06,this._colB,a*.5,a*1.5,e?.4:.26,e?.3:.2,5,.1),o()<(e?.8:.35)&&this._spawnDrop(t.x,t.y,t.z,i.x*.25+(o()-.5),i.y*.25,i.z*.25+(o()-.5),c,e?.03+o()*.02:.016+o()*.012,.8,1,1.4,N)}dryFire(t,i){this._sprite(this.puffs,t.x,t.y,t.z,i.x*.8,i.y*.8+.3,i.z*.8,K,.05,.22,.35,.35,5,.3,nt,.02,1)}chargeGlow(t,i,s){let e=this._color(i,this._col),c=.85+.15*Math.sin(this._time*40);this._colB.copy(e).lerp(g,.2+.4*s).multiplyScalar(1.5+2.5*s),this._sprite(this.glows,t.x,t.y,t.z,0,0,0,this._colB,(.07+.2*s)*c,(.07+.2*s)*c,Math.max(.03,this._dt*1.6),1,0,0,q+1+3*s,0,0);let a=Math.floor((10+36*s)*this._dt*Math.max(.5,this.q)+o());for(this._colB.copy(e).lerp(g,.5).multiplyScalar(2.2);a-- >0;){J(u);let r=.3+o()*.25;this._sprite(this.glows,t.x+u.x*r,t.y+u.y*r,t.z+u.z*r,-u.x*r/.17,-u.y*r/.17,-u.z*r/.17,this._colB,.05,.02,.17,1,0,0,q+1,.03,0)}}chargeFull(t,i){let s=this._color(i,this._col);this._colB.copy(s).lerp(g,.5).multiplyScalar(3.2),this._sprite(this.glows,t.x,t.y,t.z,0,0,0,this._colB,1,.5,.32,1,0,0,G+3,0,.6),this._toCam(t,S),this._colB.copy(s).lerp(g,.35),this._ringRaw(t,S,this._colB,.6,.2,U,.9,1),this._colB.copy(s).lerp(g,.5).multiplyScalar(2);for(let e=0;e<8;e++)J(u),this._sprite(this.glows,t.x,t.y,t.z,u.x*2.2,u.y*2.2,u.z*2.2,this._colB,.12,.05,.3,1,3,0,G+1,0,2)}laserDot(t,i,s,e=.5){let c=this._color(s,this._col),a=.8+.2*Math.sin(this._time*22);this._colB.copy(c).lerp(g,.35).multiplyScalar(2+2*e),v.copy(t).addScaledVector(i,.03),this._sprite(this.glows,v.x,v.y,v.z,0,0,0,this._colB,(.08+.1*e)*a,(.08+.1*e)*a,Math.max(.03,this._dt*1.6),1,0,0,G+1+2*e,0,0),this.mark(v,i,c,.12+.12*e,Nt,.5,0,1,.3)}beamImpact(t,i,s,e=1){let c=this._color(s,this._col),a=tt(e,0,1);this._colB.copy(c).multiplyScalar(4),this._sprite(this.glows,t.x,t.y,t.z,0,0,0,this._colB,.4+.5*a,.9+.6*a,.12,1,0,0,q+4,0),this._colB.copy(c).lerp(g,.5).multiplyScalar(2.6),this._sprite(this.glows,t.x,t.y,t.z,0,0,0,this._colB,.9,.4,.22,1,0,0,G+3,0,1),v.copy(t).addScaledVector(i,.02),this._ringRaw(v,i,c,.55+.6*a,.3,Y,.95,1),this._ringRaw(v,i,c,.9+a,.2,U,.8,1);let r=Math.max(3,Math.round((8+10*a)*this.q));for(let _=0;_<r;_++){D(i,.95,u);let f=3+o()*3.5;this._spawnDrop(v.x,v.y,v.z,u.x*f,u.y*f,u.z*f,c,.03+o()*.04,1.1,1,1,0)}}beamTrail(t,i,s,e=1){let c=this._color(s,this._col);p.copy(i).sub(t);let a=p.length();if(a<.5)return;p.multiplyScalar(1/a);let r=.75,_=Math.min(40,Math.floor(a/r));this._colB.copy(c).lerp(g,.45);for(let f=1;f<=_;f++){let h=f*r-o()*.3,y=t.x+p.x*h,n=t.y+p.y*h,l=t.z+p.z*h;(f%2===0||this.q>=1)&&this._sprite(this.puffs,y,n,l,(o()-.5)*.3,.15,(o()-.5)*.3,this._colB,.06,.2+.1*e,.3+o()*.2,.28,4,.1),o()<.45*this.q&&this._spawnDrop(y,n,l,(o()-.5)*.6,-.5-o(),(o()-.5)*.6,c,.016+o()*.018,.9,1,1.4,N)}}rollerSpray(t,i,s,e,c=1){let a=this._color(e,this._col),r=i.z,_=-i.x,f=Math.floor(30*c*this.q*this._dt+o());for(;f-- >0;){let h=(o()-.5)*s,y=1.6+o()*2.2;this._spawnDrop(t.x+r*h+i.x*.05,t.y+.1,t.z+_*h+i.z*.05,i.x*y*c+r*Math.sign(h)*.7,1.4+o()*1.8,i.z*y*c+_*Math.sign(h)*.7,a,.025+o()*.03,1,1,1,o()<.3?k:0)}if(o()<8*this._dt*c){let h=o()<.5?-1:1;this._colB.copy(a).lerp(g,.4),this._sprite(this.puffs,t.x+r*h*s*.5,t.y+.15,t.z+_*h*s*.5,r*h*.8+i.x,.5,_*h*.8+i.z,this._colB,.1,.35,.3,.28,4)}}flickCurtain(t,i,s,e=50){let c=this._color(s,this._col),a=this.paintEffects?k:0,r=Math.atan2(i.x,i.z),_=e*Math.PI/180,f=Math.max(6,Math.round(30*this.q));for(let h=0;h<f;h++){let y=h/(f-1)*2-1,n=r+y*_*.55+(o()-.5)*.08,l=.35+o()*.35,x=6+o()*5*(1-.4*Math.abs(y)),m=Math.cos(l),d=.03+o()*.04;this._spawnDrop(t.x+Math.sin(n)*.4,t.y+(o()-.3)*.4,t.z+Math.cos(n)*.4,Math.sin(n)*m*x,Math.sin(l)*x,Math.cos(n)*m*x,c,d,1.4,1,1.2,d>.055?a:0)}this._colB.copy(c).lerp(g,.4);for(let h=0;h<3;h++){let y=r+(h-1)*_*.35;this._sprite(this.puffs,t.x+Math.sin(y)*.8,t.y+.2,t.z+Math.cos(y)*.8,Math.sin(y)*3,1,Math.cos(y)*3,this._colB,.2,.7,.4,.3,4)}}dangerRing(t,i,s,e=3.1,c=0){this.mark(t,i,s,e,Lt,.95,c,1,.37)}beepPulse(t,i,s,e,c=3.1,a=0){let r=this._color(e,this._col);this._colB.copy(r).lerp(g,.3).multiplyScalar(3+3*a),this._sprite(this.glows,t.x,t.y,t.z,0,0,0,this._colB,.35,.8+.4*a,.14,1,0,0,q+2+3*a,0),i&&this._ringRaw(i,s||z,r,c,.32,U,.55+.35*a,1.2)}bombTrail(t,i,s){let e=this._color(s,this._col);o()<.5*this.q+.2&&this._spawnDrop(t.x,t.y,t.z,i.x*.1+(o()-.5)*.6,i.y*.1,i.z*.1+(o()-.5)*.6,e,.02+o()*.02,.8,1,1.2,0),o()<.35&&(this._colB.copy(e).lerp(g,.45),this._sprite(this.puffs,t.x,t.y,t.z,0,.2,0,this._colB,.06,.2,.25,.22,4))}bounceSplash(t,i,s){let e=this._color(s,this._col);this._crown(t,i,e,6,2,.03),v.copy(t).addScaledVector(i,.01),this._ripple(v,.006,.12,1.2,.6,i,e)}spinUp(t,i,s,e=.5,c=!1){let a=this._color(s,this._col),r=tt(e,0,1);p.copy(i),p.lengthSq()<1e-6&&p.set(0,0,1),p.normalize();let _=(.045+.1*r)*(1+.06*r*r*Math.sin(this._time*12));this._colB.copy(a).lerp(g,.2+.4*r).multiplyScalar(1.1+3.4*r*r),this._sprite(this.glows,t.x+p.x*.03,t.y+p.y*.03,t.z+p.z*.03,0,0,0,this._colB,_,_,Math.max(.03,this._dt*1.6),1,0,0,q+1+3*r,0,0);let f=Math.floor((c?30:3+38*r*r)*this._dt*Math.max(.5,this.q)+o());if(!(f<=0))for(Rt(p,u,v);f-- >0;){let h=o()*b,y=Math.cos(h),n=Math.sin(h),l=u.x*y+v.x*n,x=u.y*y+v.y*n,m=u.z*y+v.z*n,d=-u.x*n+v.x*y,w=-u.y*n+v.y*y,A=-u.z*n+v.z*y,E=.06+o()*.16,C=(1.2+3.6*r)*(.7+o()*.6),R=c?2+o()*2:.2+o()*.5;this._spawnDrop(t.x-p.x*E+l*.065,t.y-p.y*E+x*.065,t.z-p.z*E+m*.065,d*C+l*C*.35+p.x*R,w*C+x*C*.35+p.y*R+.5,A*C+m*C*.35+p.z*R,a,.011+o()*.013+.008*r,.75,1,1.5,o()<.55?N:0)}}spinFull(t,i,s){let e=this._color(s,this._col);p.copy(i),p.lengthSq()<1e-6&&p.set(0,0,1),p.normalize(),this._colB.copy(e).lerp(g,.55).multiplyScalar(3.2),this._sprite(this.glows,t.x,t.y,t.z,0,0,0,this._colB,.34,.12,.16,1,0,0,q+3,0),this._colB.copy(e).lerp(g,.35),this._ringRaw(S.copy(t).addScaledVector(p,-.08),p,this._colB,.46,.2,U,.85,.8),Rt(p,u,v);let c=Math.max(6,Math.round(16*this.q));for(let a=0;a<c;a++){let r=a/c*b+o()*.3,_=Math.cos(r),f=Math.sin(r),h=u.x*_+v.x*f,y=u.y*_+v.y*f,n=u.z*_+v.z*f,l=-u.x*f+v.x*_,x=-u.y*f+v.y*_,m=-u.z*f+v.z*_,d=3.2+o()*1.6;this._spawnDrop(t.x-p.x*.1+h*.07,t.y-p.y*.1+y*.07,t.z-p.z*.1+n*.07,(h*.8+l*.6)*d,(y*.8+x*.6)*d+.8,(n*.8+m*.6)*d,e,.016+o()*.014,.8,1,1.5,0)}}dodgeSplash(t,i,s){let e=this._color(s,this._col);v.set(t.x,t.y+.03,t.z),p.set(-i.x*.8,.9,-i.z*.8).normalize();let c=Math.max(4,Math.round(14*this.q));for(let a=0;a<c;a++){D(p,1.05,u);let r=2.4+o()*2.8;this._spawnDrop(v.x,v.y+.05,v.z,u.x*r,u.y*r,u.z*r,e,.02+o()*.026,1,1,1.4,o()<.25?k:0)}this._shell(v,e,.12,.5,.06,.2,.95,0,0,.2,z,1),this._ripple(v,.008,.15,1.6,.8,z,e)}dodgeSkid(t,i,s,e=0){let c=this._color(s,this._col),a=1-tt(e,0,1),r=i.z,_=-i.x,f=Math.floor((10+46*a)*this._dt*Math.max(.5,this.q)+o());for(;f-- >0;){let h=(o()-.5)*2,y=(3+o()*3)*(.5+.5*a);this._spawnDrop(t.x+i.x*.3+r*h*.25,t.y+.05,t.z+i.z*.3+_*h*.25,i.x*y+r*h*1.6,.5+o()*1.1,i.z*y+_*h*1.6,c,.011+o()*.014,.55,1,1.7,N)}for(f=Math.floor(22*a*this._dt*Math.max(.5,this.q)+o());f-- >0;){J(u),u.y=Math.abs(u.y)*.8+.3;let h=1.5+o()*2;this._spawnDrop(t.x+u.x*.25,t.y+.35+u.y*.2,t.z+u.z*.25,u.x*h+i.x*2.2,u.y*h,u.z*h+i.z*2.2,c,.015+o()*.018,.9,1,1.3,0)}}dodgePlant(t,i,s){let e=this._color(s,this._col);p.set(i.x*.7,1,i.z*.7).normalize();let c=Math.max(3,Math.round(9*this.q));for(let a=0;a<c;a++){D(p,.75,u);let r=1.8+o()*2;this._spawnDrop(t.x,t.y+.04,t.z,u.x*r,u.y*r,u.z*r,e,.016+o()*.02,.8,1,1.3,0)}v.set(t.x,t.y+.01,t.z),this._ripple(v,.0065,.13,1.3,.7,z,e)}sloshTrail(t,i,s,e=!1){let c=this._color(s,this._col),a=e?2:o()<.6?1:0;for(;a-- >0;)this._spawnDrop(t.x+(o()-.5)*.08,t.y-.04,t.z+(o()-.5)*.08,i.x*.25+(o()-.5)*.8,i.y*.2-.5,i.z*.25+(o()-.5)*.8,c,(e?.026:.018)+o()*.016,1.1,1,1.5,0)}sloshImpact(t,i,s,e){let c=this._color(e,this._col),a=i||z;v.copy(t).addScaledVector(a,.03),this._shell(v,c,.3,1.05,.08,.3,.97,0,0,.22,a,1);let r=s.x,_=s.z,f=Math.hypot(r,_)||1,h=r/f,y=_/f,n=y,l=-h,x=this.paintEffects?k:0,m=Math.max(6,Math.round(18*this.q));for(let d=0;d<m;d++){let w=(o()-.5)*2,A=3.5+o()*3.5;this._spawnDrop(v.x+n*w*.3,v.y+.05,v.z+l*w*.3,h*A+n*w*2.2,1.2+o()*2.2,y*A+l*w*2.2,c,.02+o()*.03,1.2,1,1.5,o()<.3?x:0)}m=Math.max(2,Math.round(5*this.q));for(let d=0;d<m;d++){let w=o()*b,A=1.6+o()*1.8;this._spawnDrop(v.x,v.y+.1,v.z,Math.cos(w)*A+h*1.2,3+o()*2.2,Math.sin(w)*A+y*1.2,c,.06+o()*.03,1.8,1,1,x)}this._ripple(v,.014,.26,2.3,1.05,a,c)}slamLaunch(t,i){let s=this._color(i,this._col);v.set(t.x,t.y+.02,t.z),this._ringRaw(v,z,s,1.5,.4,Y,.9,1.1),this._colB.copy(s).lerp(g,.2),this._ripple(v,.01,.2,1.8,.9,z,this._colB);let e=Math.max(6,Math.round(18*this.q));for(let c=0;c<e;c++){D(z,.45,u);let a=5+o()*5;this._spawnDrop(t.x+(o()-.5)*.4,t.y+.1,t.z+(o()-.5)*.4,u.x*a,u.y*a,u.z*a,s,.035+o()*.045,1.4,1,1.3,0)}this._colB.copy(s).lerp(g,.35);for(let c=0;c<3;c++)this._sprite(this.puffs,t.x,t.y+.3,t.z,(o()-.5)*2,1.5+o(),(o()-.5)*2,this._colB,.3,.9,.5,.32,3)}slamCharge(t,i,s=.5){let e=this._color(i,this._col);this._colB.copy(e).lerp(g,.25).multiplyScalar(1.6+2*s),this._sprite(this.glows,t.x,t.y,t.z,0,0,0,this._colB,.9+.6*s,.9+.6*s,Math.max(.03,this._dt*1.6),.8,0,0,q+1+2*s,0,0);let c=Math.floor(40*this._dt*Math.max(.5,this.q)+o());for(this._colB.copy(e).lerp(g,.5).multiplyScalar(2.4);c-- >0;){J(u);let a=1.2+o()*.6;this._sprite(this.glows,t.x+u.x*a,t.y+u.y*a*.7,t.z+u.z*a,-u.x*a/.22,-u.y*a*.7/.22,-u.z*a/.22,this._colB,.14,.05,.22,1,0,0,G+1,.03,2)}}slamFall(t,i){let s=this._color(i,this._col);this._colB.copy(s).lerp(g,.45);let e=Math.max(1,Math.round(3*this.q));for(;e-- >0;){let c=o()*b,a=.25+o()*.4;this._spawnDrop(t.x+Math.cos(c)*a,t.y+.6+o()*1.2,t.z+Math.sin(c)*a,0,-14-o()*4,0,this._colB,.018+o()*.015,.14,0,3.4,W|N)}}slamWave(t,i,s=5.2){let e=this._color(i,this._col),c=s;this._probeDown(v.set(t.x,t.y+.5,t.z),2.5,V,I)||(V.copy(t),I.copy(z)),this._ringRaw(V,I,e,c*1.45,.6,Y,.95,1.4),this._after(.1,ht,V,I,e,c*1.85,.5,U),this._ripple(V,.016,.32,3.2,1.3,I,e),L.copy(K).lerp(e,.25),this._ringRaw(V,I,L,c*1.1,.7,pt,.55,1),this._dustRing(V,L,14,6);let a=this.paintEffects?k:0,r=Math.max(6,Math.round(20*this.q));for(let _=0;_<r;_++){let f=_/r*b+o()*.3,h=5+o()*4;this._spawnDrop(V.x+Math.cos(f)*.6,V.y+.3,V.z+Math.sin(f)*.6,Math.cos(f)*h,4+o()*3,Math.sin(f)*h,e,.1+o()*.06,2.2,1,1.1,a)}this._colB.copy(e).multiplyScalar(1.2),this._beam(V,this._colB,1.3,5.5,.6)}stormStart(t,i,s=3.4){let e=this._color(i,this._col);this._colB.copy(e).lerp(g,.2);for(let c=0;c<Math.round(10*this.q)+2;c++){let a=o()*b,r=o()*s*.6;this._sprite(this.puffs,t.x+Math.cos(a)*r,t.y+(o()-.5)*.6,t.z+Math.sin(a)*r,Math.cos(a)*3.4,(o()-.3)*1.5,Math.sin(a)*3.4,this._colB,s*.25,s*.6,.7+o()*.4,.4,2.5,0,Dt,.05,.4)}this._colB.copy(e).multiplyScalar(3),this._sprite(this.glows,t.x,t.y,t.z,0,0,0,this._colB,s*.5,s*1.3,.25,1,0,0,q+3,0),this._toCam(t,S),this._ringRaw(t,S,e,s*1.4,.3,U,.8,1.3)}rainSheet(t,i,s,e=this._dt){let c=this._color(s,this._col);this._colB.copy(c).lerp(g,.35);let a=Math.floor(i*i*3.2*this.q*e+o());for(;a-- >0;){let r=o()*b,_=Math.sqrt(o())*i*.95;this._spawnDrop(t.x+Math.cos(r)*_,t.y-.4-o()*.5,t.z+Math.sin(r)*_,.35,-19-o()*4,.12,this._colB,.022+o()*.012,1,1,5.5,N)}}stormPuddle(t,i,s){let e=this._color(s,this._col);v.copy(t).addScaledVector(i||z,.01),this._colB.copy(e).lerp(g,.15),this._ripple(v,.004+o()*.003,.09,.8,.5,i||z,this._colB),o()<.35&&this._crown(v,i||z,e,2,1.4,.02,N)}stormFlash(t,i,s=3.4){let e=this._color(i,this._col);this._colB.copy(e).lerp(g,.5).multiplyScalar(2.5),this._sprite(this.glows,t.x+(o()-.5)*s,t.y+(o()-.3)*.8,t.z+(o()-.5)*s,0,0,0,this._colB,s*.4,s*.7,.12,1,0,0,q+1,0)}superJumpCharge(t,i,s=.5){let e=this._color(i,this._col),c=Math.max(.5,this.q),a=Math.floor((24+30*s)*this._dt*c+o());for(this._colB.copy(e).lerp(g,.5).multiplyScalar(2.2);a-- >0;){let r=this._time*9+o()*b,_=.75-.35*s+o()*.15,f=Math.cos(r),h=Math.sin(r);this._sprite(this.glows,t.x+f*_,t.y+.1+o()*.4,t.z+h*_,-h*2.4,2.5+2*s,f*2.4,this._colB,.12,.05,.4,1,1.5,0,G+1,.03,1.5)}for(a=Math.floor((14+24*s)*this._dt*c+o());a-- >0;){let r=o()*b,_=.5+o()*.3;this._spawnDrop(t.x+Math.cos(r)*_,t.y+.05,t.z+Math.sin(r)*_,-Math.sin(r)*1.8,2.5+o()*3*(.5+s),Math.cos(r)*1.8,e,.025+o()*.025,.7,.8,1.3,N)}this._colB.copy(e).lerp(g,.2).multiplyScalar(1.4+2*s),this._sprite(this.glows,t.x,t.y+.45,t.z,0,0,0,this._colB,.7+.5*s,.7+.5*s,Math.max(.03,this._dt*1.6),.7,0,0,q+2*s,0,0),o()<5*this._dt&&this._ringRaw(v.set(t.x,t.y+.02,t.z),z,e,1.1+.4*s,.35,U,.7,1)}superJumpLaunch(t,i){let s=this._color(i,this._col);this._colB.copy(s).multiplyScalar(1.3),this._beam(t,this._colB,.9,12,.8),v.set(t.x,t.y+.02,t.z),this._ringRaw(v,z,s,2.2,.45,Y,.95,1.2),this._ringRaw(v,z,s,2.9,.3,U,.8,1);let e=Math.max(8,Math.round(30*this.q));for(let c=0;c<e;c++){D(z,.35,u);let a=9+o()*7;this._spawnDrop(t.x+(o()-.5)*.5,t.y+.1,t.z+(o()-.5)*.5,u.x*a,u.y*a,u.z*a,s,.035+o()*.05,1.6,1,1.5,0)}this._colB.copy(s).lerp(g,.3);for(let c=0;c<Math.round(6*this.q)+1;c++){let a=o()*b;this._sprite(this.puffs,t.x+Math.cos(a)*.5,t.y+.2,t.z+Math.sin(a)*.5,Math.cos(a)*3,.8,Math.sin(a)*3,this._colB,.3,.9,.6,.4,3)}this._colB.copy(s).multiplyScalar(4),this._sprite(this.glows,t.x,t.y+.6,t.z,0,0,0,this._colB,1.2,2.4,.22,1,0,0,q+4,0)}superJumpTrail(t,i,s){let e=this._color(s,this._col),c=Math.max(1,Math.round(2*this.q));for(;c-- >0;)this._spawnDrop(t.x+(o()-.5)*.3,t.y+(o()-.5)*.3,t.z+(o()-.5)*.3,i.x*.15+(o()-.5),i.y*.15,i.z*.15+(o()-.5),e,.03+o()*.035,1.1,1,1.4,0);this._colB.copy(e).lerp(g,.2).multiplyScalar(2.2),this._sprite(this.glows,t.x,t.y,t.z,0,0,0,this._colB,.55,.3,.16,.9,0,0,q+1.5,0),o()<.5&&(this._colB.copy(e).lerp(g,.35),this._sprite(this.puffs,t.x,t.y,t.z,0,.2,0,this._colB,.2,.55,.45,.3,3))}jumpMarker(t,i,s=0){let e=this._color(i,this._col);v.set(t.x,t.y+.03,t.z),this.mark(v,z,e,1.5,Vt,1,s,1,.5),this._colB.copy(e).multiplyScalar(1.5),this.pillar(v,this._colB,.5,9,.55+.15*Math.sin(this._time*6),.4)}superJumpLand(t,i){let s=this._color(i,this._col);v.set(t.x,t.y+.02,t.z),this._ringRaw(v,z,s,2.4,.45,Y,.95,1.2),this._ringRaw(v,z,s,3,.3,U,.8,1),this._crown(v,z,s,26,4.2,.045),S.set(t.x,t.y+.1,t.z),this._shell(S,s,.2,.9,.08,.3,.95,0,0,.18,z,1),this._ripple(v,.013,.24,2.4,1.1,z,s),this._colB.copy(s).multiplyScalar(3),this._sprite(this.glows,t.x,t.y+.5,t.z,0,0,0,this._colB,.8,1.8,.18,1,0,0,q+3,0),L.copy(K).lerp(s,.2),this._dustRing(v,L,8,3)}ghost(t,i){let s=this._color(i,this._col);this._colB.copy(s).lerp(g,.3),this._sprite(this.puffs,t.x,t.y+.35,t.z,0,.5,0,this._colB,.55,.85,1.5,.8,1.2,.9,Ht,.18,0,.35,.6)}waterSplash(t,i=1){v.set(t.x,this.waterY+.02,t.z),this._crown(v,z,kt,22*i,4+2*i,.06),this._ringRaw(v,z,X,1.2*i,.6,it,.8,1),this._after(.12,ht,v,z,X,2.2*i,.9,it),this._ringRaw(v,z,X,.6*i,.4,vt,.7,1);for(let e=0;e<Math.round(5*this.q)+1;e++)this._sprite(this.puffs,t.x+(o()-.5),this.waterY+.4,t.z+(o()-.5),(o()-.5)*1.5,1.5+o(),(o()-.5)*1.5,X,.3,1,.9+o()*.4,.4,2,.1);let s=Math.max(3,Math.round(8*this.q));for(let e=0;e<s;e++){D(z,.25,u);let c=6+o()*4*i;this._spawnDrop(t.x+(o()-.5)*.4,this.waterY+.1,t.z+(o()-.5)*.4,u.x*c,u.y*c,u.z*c,X,.05+o()*.05,1.6,1,1.4,W)}}waterPlop(t,i=.3){v.set(t.x,this.waterY+.02,t.z),this._ringRaw(v,z,X,.35+i,.5,it,.7,1),this._crown(v,z,kt,4+i*8,1.8+i*2,.03,W)}specialSparkle(t,i,s=1.5){let e=this._color(i,this._col),c=o()*b,a=.38+o()*.18,r=.2+o()*s;this._colB.copy(e).lerp(g,.35).multiplyScalar(2.4),this._sprite(this.glows,t.x+Math.cos(c)*a,t.y+r,t.z+Math.sin(c)*a,-Math.sin(c)*.6,.45+o()*.3,Math.cos(c)*.6,this._colB,.26+o()*.12,.07,.5+o()*.2,1,.5,0,G+1.5,.08,3),o()<.35&&(this._colB.copy(e).multiplyScalar(2),this._sprite(this.glows,t.x+Math.cos(c+2)*a*.8,t.y+r*.6,t.z+Math.sin(c+2)*a*.8,0,.8,0,this._colB,.07,.03,.6,1,.5,0,q+1,.05,0))}enemyInkSizzle(t,i){let s=this._color(i,this._col);this._colB.copy(s).lerp(g,.35).multiplyScalar(1.3);let e=1+(o()<.5?1:0);for(let c=0;c<e;c++){let a=o()*b,r=.12+o()*.25;this._sprite(this.glows,t.x+Math.cos(a)*r,t.y+.04,t.z+Math.sin(a)*r,0,.22+o()*.2,0,this._colB,.035+o()*.03,.07+o()*.03,.28+o()*.18,.85,1,0,bt+1,.05,0)}o()<.3&&this._spawnDrop(t.x+(o()-.5)*.3,t.y+.04,t.z+(o()-.5)*.3,(o()-.5)*.4,.8+o()*.6,(o()-.5)*.4,s,.018+o()*.012,.4,1,1,N)}seaSpray(t,i,s=1){let e=tt(s,.3,1.6),c=-i.z,a=i.x,r=Math.max(6,Math.round((16+20*e)*this.q)),_=(o()-.5)*.6;for(let h=0;h<r;h++){let y=_+(o()-.5)*2.6*e,n=(7.5+o()*4.5)*(.75+.3*e),l=.3+o()*1.6;this._spawnDrop(t.x+c*y+i.x*.12,t.y+o()*.25,t.z+a*y+i.z*.12,i.x*l+c*(o()-.5)*1.4,n,i.z*l+a*(o()-.5)*1.4,X,.03+o()*.06,2.2,1,1.25,W|(o()<.3?0:N))}let f=Math.max(3,Math.round((5+4*e)*this.q));for(let h=0;h<f;h++){let y=_+(o()-.5)*2.8*e,n=o();this._sprite(this.puffs,t.x+c*y+i.x*(.25+n*.4),t.y+.8+n*1.6*e,t.z+a*y+i.z*(.25+n*.4),i.x*.7+.25,(2.6+o()*2.2)*e,i.z*.7+.1,X,.4*e,(1.1+o()*.7)*e,1+o()*.6,.42,2.2,-1.2,Dt,.06,.4,.3)}v.set(t.x+i.x*.8,this.waterY+.03,t.z+i.z*.8),this._ringRaw(v,z,X,1.5*e+.5,.9,it,.8,1),this._ringRaw(v,z,X,.9*e,.55,vt,.5,1),this._after(.18,ht,v,z,X,2.4*e+.6,.9,it)}feather(t){this._sprite(this.puffs,t.x,t.y,t.z,(o()-.5)*.4,-.25,(o()-.5)*.4,r0,.24,.24,11+o()*4,.97,1.6,-.7,Ot,.5,1.8,.9,1.5)}glint(t,i,s=.12){let e=this._color(i,this._col);this._colB.copy(e).lerp(g,.6).multiplyScalar(2.6),this._sprite(this.glows,t.x,t.y,t.z,0,0,0,this._colB,s*.4,s,.35+o()*.2,1,0,0,G+2,.12,.8)}update(t,i){if(t=Math.min(t||0,.05),this._dt=t>0?t:this._dt,this._time+=t,this._checks=0,this._shellUniforms.uTime.value=this._time,this._ringU.uTime.value=this._time,this._beamU.uTime.value=this._time,i){i.getWorldPosition(this._camPos),i.getWorldDirection(this._camDir);let s=i.matrixWorldInverse;this._dropU.uSunDirV.value.copy(this._light.sunDir).transformDirection(s),this._dropU.uUpV.value.copy(z).transformDirection(s),this._moteU.uCam.value.copy(this._camPos)}this._moteU.uTime.value=this._time,this._runSchedule(t),this._updateDrops(t),this._updateSprites(this.puffs,t,!1),this._updateSprites(this.glows,t,!0),this._updateRings(t),this._updateShells(t),this._updateBeams(t)}clear(){this.dN=0,this.dGeo.instanceCount=0;for(let t of[this.puffs,this.glows,this.rings,this.shells,this.beams])t.n=0,t.geo.instanceCount=0;this.marks.n=0,this.pillars.n=0,this._sqN=0}setLighting(t=at){let i=this._light;t.sunDir&&i.sunDir.copy(t.sunDir).normalize();let s=t.sunColor||t.sun;s&&i.sunCol.copy(s).multiplyScalar(Math.min(1.25,(t.sunIntensity??3)/3));let e=t.sky||t.zenith;e&&(i.sky.copy(e),t.horizon&&i.sky.lerp(t.horizon,.45)),t.ground&&i.ground.copy(t.ground),s&&this._moteU.uCol.value.copy(s).lerp(g,.35).multiplyScalar(.9)}setSunDir(t){this._light.sunDir.copy(t).normalize()}stats(){return{drops:this.dN,puffs:this.puffs.n,glows:this.glows.n,rings:this.rings.n,shells:this.shells.n,beams:this.beams.n,checks:this._checks,sched:this._sqN,caps:{drops:this.dCap,puffs:this.puffs.cap,glows:this.glows.cap,rings:this.rings.cap}}}triangles(){let t=i=>(i.index?i.index.count:i.attributes.position.count)/3;return(this.dGeo.instanceCount+this.puffs.geo.instanceCount+this.glows.geo.instanceCount+this.rings.geo.instanceCount)*2+this.shells.geo.instanceCount*t(this.shells.geo)+this.beams.geo.instanceCount*t(this.beams.geo)+(this.motes.visible?this.motes.geometry.instanceCount*2:0)}dispose(){this.scene.remove(this.root),this.root.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&t.material.dispose()})}};export{Xt as FX};
