import{a as ee}from"./chunk-AHFCMGAG.js";import{$ as ze,A as Rt,C as fe,D as Xe,E as nt,Ea as Oe,F as Tt,G as Ge,Ga as Dt,Ha as Ie,I as Ee,Ia as Gt,Ja as Pt,K as St,M as Me,P as Ue,R as ke,S as _t,T as Q,Ua as It,Wa as Ye,X as J,Xa as Re,Y as Ve,Ya as Lt,Za as rt,_a as Te,aa as Ht,ab as ce,b as gt,c as Ne,ca as it,da as K,ea as Ct,f as wt,fa as Ke,g as yt,ga as kt,gb as Bt,h as bt,ha as Pe,ib as Wt,k as Et,ka as ne,l as st,lb as ct,m as Mt,ma as ve,mb as Zt,na as Ft,ob as Nt,q as zt,ra as oe,sb as lt,tb as Xt,ua as qe,ub as Ut,wa as At,xa as Fe,z as at}from"./chunk-A4GFMTBS.js";import{g as Vt}from"./chunk-GS5HPC5T.js";import{a as ge}from"./chunk-UAF7E3YD.js";import"./chunk-VC46IEJQ.js";var W=Vt.waterY,me=Math.PI/180,_e=48,He=24,oo=.1,so=10;var je={day:{sunAz:222,sunEl:39,sunColor:"#fff0dc",sunIntensity:3.3,skySun:2.75,hemiSky:"#b4d0ff",hemiGround:"#dcc3a0",hemiGroundK:2.2,hemiIntensity:.45,envK:.45,zenith:"#1d6fdc",skyMid:"#5aa8f2",horizon:"#d4ecfa",ground:"#6fa4bd",horizonGlow:"#fff4dc",horizonGlowK:.05,glowColor:"#fff0cc",glow:[900,.9,7,.06],sunDisk:"#fff6e6",sunDiskK:34,sunRadius:1.25,cloudLit:"#ffffff",cloudLitK:.94,cloudShade:"#a9bfdc",cloud:[.44,1,1,.5],seaDeep:"#0a4f8a",seaShallow:"#12a7b8",seaCrest:"#48e2d6",foam:"#f7fcff",seaAmbientK:.62,sunSpec:1,waveStrength:1,haze:[1/1850,.9,260],fog:[25,900],night:0,grade:{uExposure:.9,uSat:1.1,uVib:.12,uContrast:1.09,uLift:0,uVignette:.2,uShadowTint:[.92,.97,1.1],uHighTint:[1.035,1,.955]},marina:{channel:"#0b4552",shade:"#05121a",calm:.55,lap:1,caustic:2,wet:.5}},sunset:{sunAz:206,sunEl:15,sunColor:"#ffac4c",sunIntensity:4.6,skySun:3.7,hemiSky:"#5e7fd6",hemiGround:"#c08a66",hemiGroundK:1.6,hemiIntensity:.6,envK:.42,zenith:"#1b2768",skyMid:"#56509e",horizon:"#ffa266",ground:"#4a4f7a",horizonGlow:"#ff8a4a",horizonGlowK:.55,glowColor:"#ffb35c",glow:[260,2.2,5.5,.55],sunDisk:"#ffd9a0",sunDiskK:22,sunRadius:1.7,cloudLit:"#ffc39a",cloudLitK:.95,cloudShade:"#62598f",cloud:[.4,1,1,.44],seaDeep:"#1a2c5e",seaShallow:"#2f6f8f",seaCrest:"#6a8fc4",foam:"#ffe2cf",seaAmbientK:.5,sunSpec:1.35,waveStrength:1,haze:[1/1100,.9,260],fog:[25,800],night:1,grade:{uExposure:1,uSat:1.05,uVib:.1,uContrast:1.07,uLift:0,uVignette:.28,uShadowTint:[.88,.96,1.16],uHighTint:[1.07,1,.88],bloom:[.4,.55,1.7]},marina:{channel:"#132140",shade:"#04060d",calm:.55,lap:1,caustic:1.7,wet:.55}},golden:{sunAz:194,sunEl:28,sunColor:"#ffd9ae",sunIntensity:3.6,skySun:3.35,hemiSky:"#aecaf0",hemiGround:"#cfb08a",hemiGroundK:1.8,hemiIntensity:.42,envK:.5,zenith:"#2a62b2",skyMid:"#72a3d6",horizon:"#f0d8b8",ground:"#5b7d90",horizonGlow:"#ffbf80",horizonGlowK:.3,glowColor:"#ffd29a",glow:[480,1.5,6,.24],sunDisk:"#fff1d8",sunDiskK:26,sunRadius:1.35,cloudLit:"#f4fbf4",cloudLitK:.95,cloudShade:"#909fbc",cloud:[.42,1,.85,.46],cloudCov:.4,cloudSeed:7,seaDeep:"#0a3f53",seaShallow:"#16707a",seaCrest:"#5fc9b6",foam:"#fff6ea",seaAmbientK:.6,sunSpec:1.2,waveStrength:.8,haze:[1/1650,.9,240],fog:[30,1e3],night:0,shafts:1,grade:{uExposure:.95,uSat:1.05,uVib:.12,uContrast:1.1,uLift:0,uVignette:.22,uShadowTint:[.93,.98,1.09],uHighTint:[1.06,1,.925]},marina:{channel:"#0d3a37",shade:"#06110f",calm:.55,lap:1,caustic:2.2,wet:.55}}},Le=(r,t=1)=>new K(r).multiplyScalar(t),pt=`
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float hash13(vec3 p3){ p3 = fract(p3 * 0.1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
float vnoise2(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash12(i), hash12(i+vec2(1.0,0.0)), u.x), mix(hash12(i+vec2(0.0,1.0)), hash12(i+vec2(1.0,1.0)), u.x), u.y); }
float vnoise3(vec3 p){ vec3 i = floor(p), f = fract(p); vec3 u = f*f*(3.0-2.0*f);
  float a = hash13(i), b = hash13(i+vec3(1.0,0.0,0.0)), c = hash13(i+vec3(0.0,1.0,0.0)), d = hash13(i+vec3(1.0,1.0,0.0));
  float e = hash13(i+vec3(0.0,0.0,1.0)), f1 = hash13(i+vec3(1.0,0.0,1.0)), g = hash13(i+vec3(0.0,1.0,1.0)), h = hash13(i+vec3(1.0,1.0,1.0));
  return mix(mix(mix(a,b,u.x), mix(c,d,u.x), u.y), mix(mix(e,f1,u.x), mix(g,h,u.x), u.y), u.z); }
float fbm2(vec2 p){ float s = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++){ s += a * vnoise2(p); p = m * p + 3.7; a *= 0.5; } return s / 0.96875; }
// Round cumulus lobes: nearest jittered feature point; x = 1 - (d/r)^2 (>0 inside a puff), yz = offset from its centre.
vec3 lobes(vec2 p, float period){
  vec2 i = floor(p), f = fract(p);
  // smooth (soft-min) blend of neighbouring lobes \u2192 no Voronoi seams; creases between puffs stay soft
  float acc = 0.0; vec2 ob = vec2(0.0);
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 c = i + g;
    if (period > 0.0) c.x = mod(c.x, period);
    vec2 h = vec2(hash12(c), hash12(c + 17.31));
    float rad = 0.6 + 0.35 * hash12(c + 5.13);
    vec2 o = (g + 0.2 + 0.6 * h - f) / rad;
    float w = exp(-5.0 * dot(o, o));
    acc += w; ob -= w * o;
  }
  acc = max(acc, 1e-6);
  return vec3(1.0 + log(acc) / 5.0, ob / acc);
}
float fbm3(vec3 p){ float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){ s += a * vnoise3(p); p = p * 2.02 + vec3(1.7, 9.2, 4.1); a *= 0.5; } return s / 0.96875; }
`,ot=`
uniform float uTime;
uniform vec3 uSunDir;
uniform vec3 uZenith;
uniform vec3 uSkyMid;
uniform vec3 uHorizon;
uniform vec3 uGround;
uniform vec3 uHorizonGlow;
uniform vec3 uGlowColor;
uniform vec4 uGlowParams;   // x tight power, y tight strength, z horizon band sharpness, w wide strength
uniform vec4 uHaze;         // x density (1/m), y max, z height falloff (m)
uniform float uNight;

vec3 skyGradient(vec3 d) {
  float h = d.y;
  float hp = max(h, 0.0);
  float t = sqrt(hp);
  vec3 c = mix(uHorizon, uSkyMid, smoothstep(0.0, 0.52, t));
  c = mix(c, uZenith, smoothstep(0.4, 1.0, t));
  vec2 sh = normalize(uSunDir.xz + vec2(1e-5));
  vec2 dh = normalize(d.xz + vec2(1e-5));
  float az = dot(sh, dh) * 0.5 + 0.5;
  float band = exp(-hp * uGlowParams.z);
  c += uHorizonGlow * band * (0.2 + 0.8 * az * az * az);
  float sd = max(dot(normalize(vec3(d.x, hp, d.z)), uSunDir), 0.0);
  c += uGlowColor * (pow(sd, uGlowParams.x) * uGlowParams.y + pow(sd, 6.0) * uGlowParams.w);
  // dusk: the horizon opposite the sun lies in the earth's shadow \u2014 cooler and dimmer than the sunward side, so the
  // far shore / skyline away from the sun hazes into lavender-blue instead of glowing salmon (sky, env map and haze)
  float anti = (1.0 - az) * (1.0 - az);
  c *= mix(vec3(1.0), vec3(0.7, 0.74, 0.95), uNight * anti * exp(-hp * 2.5));
  c = mix(c, uGround, smoothstep(0.0, -0.22, h));
  return c;
}
vec3 hazeColor(vec3 d) {
  vec3 h = skyGradient(normalize(vec3(d.x, clamp(d.y, 0.0, 1.0) * 0.3, d.z)));
  h = mix(h, uSkyMid * 1.08 + uHorizon * 0.12, 0.22);   // aerial perspective: distant land turns bluer
  // looking down through the haze you see scattered ambient, not the glowing horizon band
  return mix(h, uGround * 1.15 + uSkyMid * 0.25, smoothstep(-0.02, -0.45, d.y) * 0.75);
}
vec3 applyHaze(vec3 col, vec3 wp) {
  vec3 dv = wp - cameraPosition;
  float dist = length(dv);
  vec3 dir = dv / max(dist, 1e-3);
  float hf = exp(-max(wp.y, 0.0) / uHaze.z);
  float f = 1.0 - exp(-dist * uHaze.x * mix(0.45, 1.0, hf));
  return mix(col, hazeColor(dir), min(f, uHaze.y));
}
`,ht=2048,$e=640,ao=`
${ot}
uniform vec2 uRes;
uniform vec3 uCloudLit;
uniform vec3 uCloudShade;
uniform vec3 uSunCol;
uniform vec4 uCloudParams;
uniform float uSeed;
uniform float uCov;
vec3 hash33c(vec3 p) { p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx) * 2.0 - 1.0; }
vec4 hash42c(vec2 p) { vec4 p4 = fract(vec4(p.xyxy) * vec4(0.1031, 0.1030, 0.0973, 0.1099)); p4 += dot(p4, p4.wzxy + 33.33); return fract((p4.xxyz + p4.yzzw) * p4.zywx); }
float gn3(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash33c(i), f), b = dot(hash33c(i + vec3(1, 0, 0)), f - vec3(1, 0, 0));
  float c = dot(hash33c(i + vec3(0, 1, 0)), f - vec3(0, 1, 0)), d = dot(hash33c(i + vec3(1, 1, 0)), f - vec3(1, 1, 0));
  float e = dot(hash33c(i + vec3(0, 0, 1)), f - vec3(0, 0, 1)), g = dot(hash33c(i + vec3(1, 0, 1)), f - vec3(1, 0, 1));
  float h = dot(hash33c(i + vec3(0, 1, 1)), f - vec3(0, 1, 1)), k = dot(hash33c(i + vec3(1, 1, 1)), f - vec3(1, 1, 1));
  return mix(mix(mix(a, b, u.x), mix(c, d, u.x), u.y), mix(mix(e, g, u.x), mix(h, k, u.x), u.y), u.z);
}
const float HB = 1150.0, CELL = 2700.0, RMAX = 55000.0, TOPMAX = 3300.0;
// signed distance (m) to the cumulus field: flattened-base ellipsoid heaps per cell, smooth-merged, then eroded into
// cauliflower lobes by billowy noise that grows toward the tops. hf = height fraction inside the nearest heap.
float smin2(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float ellip(vec3 p, vec2 c, float cy, float r, float ht, float flt) {
  vec3 q = vec3((p.x - c.x) / r, (p.y - cy) / ht, (p.z - c.y) / r);
  q.y = q.y < 0.0 ? q.y * flt : q.y;
  return (length(q) - 1.0) * min(r, ht);
}
// cumulus: a wide low base heap with up to two bubbling turrets on top, smooth-merged across neighbouring cells
float cloudSD(vec3 p, out float hf) {
  vec2 c = floor(p.xz / CELL);
  float sd = 1e5; hf = 0.0; float best = 1e5;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 cc = c + vec2(float(i), float(j));
    vec4 h = hash42c(cc + uSeed);
    if (h.x > uCov) continue;
    vec2 ctr = (cc + 0.2 + 0.6 * h.yz) * CELL;
    float r = mix(560.0, 1500.0, h.w * h.w);
    vec4 h2 = hash42c(cc.yx + 17.3);
    float tower = h2.x;
    float hb = HB + 160.0 * h2.y;
    float ht = r * mix(0.4, 0.6, h2.z);
    float e = ellip(p, ctr, hb, r, ht, 2.5);
    float top = hb + ht;
    for (int k = 0; k < 2; k++) {
      vec4 hk = hash42c(cc * 1.31 + vec2(11.0 + float(k) * 7.0, 3.0));
      if (hk.x > 0.85) continue;
      vec2 o = (hk.yz - 0.5) * r * 0.8;
      float rr = r * mix(0.4, 0.62, hk.w) * (tower > 0.8 ? 1.25 : 1.0);
      float hh = rr * mix(0.85, 1.25, hk.x) * (tower > 0.8 ? 1.6 : 1.0);
      float cy = hb + ht * mix(0.2, 0.55, hk.y);
      e = smin2(e, ellip(p, ctr + o, cy, rr, hh, 1.6), 220.0);
      top = max(top, cy + hh);
    }
    if (e < best) { best = e; hf = clamp((p.y - hb) / max(top - hb, 1.0), 0.0, 1.0); }
    sd = smin2(sd, e, 380.0);
  }
  return sd;
}
float cloudDens(vec3 p, out float hf, out float sdo) {
  float sd = cloudSD(p, hf);
  sdo = sd;
  if (sd > 520.0) return 0.0;
  vec3 w = p / 520.0 + vec3(uSeed * 3.1, 0.0, 0.0);
  float b = 1.0 - abs(gn3(w)) * 1.9;                          // billows
  b += 0.5 * (1.0 - abs(gn3(w * 2.3 + 11.7)) * 1.9);
  float fine = gn3(w * 5.1 + 3.3);
  sd += (0.55 - b * 0.45) * mix(310.0, 430.0, hf) + fine * 22.0;
  sdo = sd;
  return clamp(-sd / 42.0, 0.0, 1.0) * smoothstep(HB - 120.0, HB + 60.0, p.y);
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float az = (uv.x - 0.5) * 6.28318531;
  float sy = pow(uv.y, 1.6);
  float cy = sqrt(max(1.0 - sy * sy, 0.0));
  vec3 d = vec3(cos(az) * cy, sy, sin(az) * cy);
  vec3 L = vec3(0.0); float T = 1.0;
  if (d.y > 0.004) {
    float t0 = (HB - 60.0) / d.y, t1 = min(TOPMAX / d.y, RMAX);
    if (t0 < t1) {
      float span = t1 - t0;
      const float dt = 16.0;
      float t = t0;
      float cosT = dot(d, uSunDir);
      float g1 = 0.62, g2 = -0.18;
      float ph = min(mix((1.0 - g1 * g1) / pow(1.0 + g1 * g1 - 2.0 * g1 * cosT, 1.5), (1.0 - g2 * g2) / pow(1.0 + g2 * g2 - 2.0 * g2 * cosT, 1.5), 0.62), 2.6);
      float tHit = -1.0;
      for (int s = 0; s < 320; s++) {
        if (t > t1 || T < 0.015) break;
        vec3 p = d * t;
        float hf, sdv;
        float den = cloudDens(p, hf, sdv);
        if (den <= 0.002) { t += clamp(sdv * 0.6, dt, 900.0); continue; }   // sphere-trace the empty space
        {
          if (tHit < 0.0) tHit = t;
          // light march toward the sun (self-shadowing)
          float od = 0.0, ls = 45.0; vec3 lp = p;
          for (int k = 0; k < 6; k++) { lp += uSunDir * ls; float hk, sk; od += cloudDens(lp, hk, sk) * ls; ls *= 1.9; }
          float Tl = exp(-od * 0.0105);
          float powder = 1.0 - exp(-den * 3.0);
          float sun = Tl * mix(0.55, 1.0, powder) * ph * 1.35;
          float amb = mix(0.6, 1.0, smoothstep(0.0, 0.9, hf)) * (0.62 + 0.38 * powder);
          vec3 S = uSunCol * uCloudLit * sun + uCloudShade * amb * 0.95;
          float sig = den * 0.02;
          float Ts = exp(-sig * dt);
          L += T * S * (1.0 - Ts);
          T *= Ts;
        }
        t += dt;
      }
      if (tHit > 0.0) {
        // aerial perspective: far heaps melt into the horizon haze
        float f = 1.0 - exp(-tHit / 26000.0);
        vec3 hz = hazeColor(d);
        L = mix(L, (1.0 - T) * hz, clamp(f * 0.9, 0.0, 0.92));
        // fade the far edge of the field so there is no hard cut-off line
        float edge = smoothstep(RMAX, RMAX * 0.7, tHit);
        L *= edge; T = mix(1.0, T, edge);
      }
    }
  }
  gl_FragColor = vec4(L, 1.0 - T);
}
`,no=`
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0);
  gl_Position = vec4(p.xy, p.w * 0.99999, p.w);
}
`,io=`
${ot}
${pt}
uniform vec3 uSunDisk;
uniform float uSunCos;
uniform vec3 uCloudLit;
uniform vec3 uCloudShade;
uniform vec4 uCloudParams;   // x overhead coverage, y horizon bank amount, z drift speed, w bank height
uniform sampler2D uCloudTex;
varying vec3 vDir;

void main() {
  vec3 d = normalize(vDir);
  vec3 col = skyGradient(d);
  float sd = dot(d, uSunDir);
  float cloudA = 0.0;
  vec2 sunH = normalize(uSunDir.xz + vec2(1e-4));

  // ---- baked volumetric cumulus (slow drift = rotation of the whole field) ----
  {
    float u = atan(d.z, d.x) / 6.28318531 + 0.5 + uTime * 0.00035 * uCloudParams.z;
    float v = pow(clamp(d.y, 0.0, 1.0), 1.0 / 1.6);
    vec4 cl = textureLod(uCloudTex, vec2(u, v), 0.0);
    cl *= smoothstep(-0.002, 0.012, d.y);
    col = col * (1.0 - cl.a) + cl.rgb;
    cloudA = cl.a;
  }
  // ---- high cirrus veil: faint, streaky, far above the cumulus ----
  if (d.y > 0.02) {
    vec2 cp = d.xz / (d.y + 0.08) * 0.9 + vec2(uTime * 0.004, uTime * 0.0015) * uCloudParams.z;
    vec2 cs = vec2(cp.x * 0.35 + cp.y * 0.9, cp.y * 0.35 - cp.x * 0.9);
    float ci = fbm2(cs * vec2(0.55, 3.2) + 4.0) - 0.52;
    ci = smoothstep(0.02, 0.3, ci) * smoothstep(0.06, 0.35, d.y) * (1.0 - cloudA) * 0.11;
    col = mix(col, uCloudLit * 0.95 + uGlowColor * 0.1, ci);
  }
#if defined(SKY_SHAFTS) && !defined(ENV_PASS)
  // crepuscular rays: walk from this direction toward the sun across the baked cloud layer \u2014 clear paths glow, paths
  // behind a heap fall into its shade, so shafts fan out from the sun between the clouds
  {
    float sdo = dot(d, uSunDir);
    if (sdo > 0.35 && d.y > -0.05) {
      float occ = 0.0;
      for (int k = 0; k < 6; k++) {
        vec3 s = normalize(mix(d, uSunDir, (float(k) + 0.5) / 6.0));
        float uu = atan(s.z, s.x) / 6.28318531 + 0.5 + uTime * 0.00035 * uCloudParams.z;
        float vv = pow(clamp(s.y, 0.0, 1.0), 1.0 / 1.6);
        occ += textureLod(uCloudTex, vec2(uu, vv), 0.0).a * smoothstep(-0.002, 0.012, s.y);
      }
      occ /= 6.0;
      float w = smoothstep(0.35, 1.0, sdo);
      w *= w;
      col += uGlowColor * (1.0 - occ) * w * 0.1 * (1.0 - cloudA);
      col *= 1.0 - occ * w * 0.2 * (1.0 - cloudA);
    }
  }
#endif

#ifndef ENV_PASS
  // ---- sun disk + tight halo (HDR \u2192 blooms) ----
  float aa = 0.00012;
  float disk = smoothstep(uSunCos - aa, uSunCos + aa, sd);
  col += uSunDisk * disk * (1.0 - cloudA * 0.94);
  col += uSunDisk * 0.02 * pow(max(sd, 0.0), 1400.0) * (1.0 - cloudA * 0.6);
#else
  // env map: soft sun lobe only (a tiny HDR disk would sparkle in rough mips)
  col += uGlowColor * pow(max(sd, 0.0), 64.0) * 1.2;
  col *= 0.72;
#endif

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
#ifndef ENV_PASS
  gl_FragColor.rgb += (hash12(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0;
#endif
}
`,Yt=`
uniform vec4 uRects[${_e}];
uniform vec2 uRectAx[${_e}];
uniform int uRectCount;
// axis-aligned rect given as (minX, minZ, maxX, maxZ) \u2014 the arena bounds
float sdRect(vec2 p, vec4 r) {
  vec2 c = (r.xy + r.zw) * 0.5; vec2 h = (r.zw - r.xy) * 0.5;
  vec2 q = abs(p - c) - h;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}
// oriented rect: r = (centre, half extents), a = local x axis
float sdORect(vec2 p, vec4 r, vec2 a) {
  vec2 d = p - r.xy;
  vec2 q = abs(vec2(dot(d, a), dot(d, vec2(-a.y, a.x)))) - r.zw;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}
#ifdef DECK_FIELD
// more rects than uniform slots: the deck union (R) and the marina hull union (G) baked into a signed-distance field
// (Environment._bakeDeckField), exact within uDeckFieldK.y of any rect; past that, the distance to the rects' AABB
uniform sampler2D uDeckField;
uniform vec4 uDeckFieldRect;   // field origin (x, z), 1 / field size (x, z)
uniform vec4 uDeckFieldK;      // x: texel (m), y: exact reach (m)
uniform vec4 uDeckBox;         // AABB of the deck rects (minX, minZ, maxX, maxZ)
uniform vec4 uWetBox;          // AABB of the hull rects
vec2 deckField(vec2 p) { return textureLod(uDeckField, clamp((p - uDeckFieldRect.xy) * uDeckFieldRect.zw, 0.0, 1.0), 0.0).rg; }
float sdDeck(vec2 p) { return max(deckField(p).r, sdRect(p, uDeckBox)); }
#else
float sdDeck(vec2 p) {
  float d = 1e5;
  for (int i = 0; i < ${_e}; i++) { if (i >= uRectCount) break; d = min(d, sdORect(p, uRects[i], uRectAx[i])); }
  return d;
}
#endif
#ifdef MARINA
uniform vec4 uWet[${He}];
uniform vec2 uWetAx[${He}];
uniform int uWetCount;
uniform vec4 uArena;        // arena bounds (minX, minZ, maxX, maxZ): the harbour basin around it is sheltered
float basinK(vec2 p) { return smoothstep(60.0, 210.0, sdRect(p, uArena)); }   // 0 in the basin \u2192 1 open sea
#ifdef DECK_FIELD
float sdWet(vec2 p) { return max(deckField(p).g, sdRect(p, uWetBox)); }
#else
float sdWet(vec2 p) {
  float d = 1e5;
  for (int i = 0; i < ${He}; i++) { if (i >= uWetCount) break; d = min(d, sdORect(p, uWet[i], uWetAx[i])); }
  return d;
}
#endif
#endif
`,ro=`
// long gentle swell; returns height (unit amplitude) and writes gradient
float swell(vec2 p, float t, out vec2 g) {
  float h = 0.0; g = vec2(0.0);
  vec2 k; float ph;
  k = vec2(0.110, 0.047); ph = dot(p, k) + t * 0.95;        h += 0.45 * sin(ph); g += 0.45 * k * cos(ph);
  k = vec2(-0.052, 0.097); ph = dot(p, k) + t * 1.13 + 1.7; h += 0.35 * sin(ph); g += 0.35 * k * cos(ph);
  k = vec2(0.173, -0.141); ph = dot(p, k) + t * 1.61 + 4.1; h += 0.20 * sin(ph); g += 0.20 * k * cos(ph);
  return h;
}
float swellAmp(float dDeck) { return mix(0.035, 0.16, smoothstep(3.0, 70.0, dDeck)); }
`,co=`
${pt}
uniform sampler2D uReflTex;
uniform mat4 uReflMat;
uniform float uReflOn;
uniform samplerCube uFarCube;   // far scenery (hills, city, port, bridge) baked from the arena centre, alpha = coverage
uniform float uFarOn;
uniform sampler2D uCloudTex;
uniform vec4 uCloudParams;
uniform vec3 uChannelCol;
uniform vec3 uShadeCol;
uniform vec4 uMarinaK;     // x calm (wave-normal scale hugging faces), y face-ripple strength, z reflection distortion (m)
// distance (m) + outward unit gradient (world xz) to an oriented rect / the nearest rect of a set. The gradient is
// found in the rect's frame and rotated back (g.x\xB7a + g.y\xB7(\u2212a.y, a.x)); exact for axis-aligned rects (a = (1, 0)).
vec3 sdORectG(vec2 p, vec4 r, vec2 a) {
  vec2 b = vec2(-a.y, a.x);
  vec2 d = p - r.xy;
  vec2 l = vec2(dot(d, a), dot(d, b));
  vec2 s = vec2(l.x < 0.0 ? -1.0 : 1.0, l.y < 0.0 ? -1.0 : 1.0);
  vec2 q = abs(l) - r.zw;
  vec3 o;
  if (max(q.x, q.y) > 0.0) { vec2 m = max(q, 0.0); float len = max(length(m), 1e-4); o = vec3(len, s * m / len); }
  else o = q.x > q.y ? vec3(q.x, s.x, 0.0) : vec3(q.y, 0.0, s.y);
  return vec3(o.x, o.y * a + o.z * b);
}
#ifdef DECK_FIELD
// field mode: both unions + outward gradients from five taps (central differences one texel apart)
void deckWetG(vec2 p, out vec3 gd, out vec3 gw) {
  float h = uDeckFieldK.x;
  vec2 c = deckField(p);
  vec2 dx = deckField(p + vec2(h, 0.0)) - deckField(p - vec2(h, 0.0));
  vec2 dz = deckField(p + vec2(0.0, h)) - deckField(p - vec2(0.0, h));
  vec2 nd = vec2(dx.x, dz.x), nw = vec2(dx.y, dz.y);
  float ld = length(nd), lw = length(nw);
  gd = vec3(max(c.x, sdRect(p, uDeckBox)), ld > 1e-5 ? nd / ld : vec2(0.0, 1.0));
  gw = vec3(max(c.y, sdRect(p, uWetBox)), lw > 1e-5 ? nw / lw : vec2(0.0, 1.0));
}
#else
vec3 sdDeckG(vec2 p) {
  vec3 b = vec3(1e5, 0.0, 1.0);
  for (int i = 0; i < ${_e}; i++) { if (i >= uRectCount) break; vec3 r = sdORectG(p, uRects[i], uRectAx[i]); if (r.x < b.x) b = r; }
  return b;
}
vec3 sdWetG(vec2 p) {
  vec3 b = vec3(1e5, 0.0, 1.0);
  for (int i = 0; i < ${He}; i++) { if (i >= uWetCount) break; vec3 r = sdORectG(p, uWet[i], uWetAx[i]); if (r.x < b.x) b = r; }
  return b;
}
#endif
vec3 skyRefl(vec3 R) {
  vec3 c = skyGradient(normalize(R + vec3(0.0, 0.015, 0.0)));
  float u = atan(R.z, R.x) / 6.28318531 + 0.5 + uTime * 0.00035 * uCloudParams.z;
  float v = pow(clamp(R.y, 0.0, 1.0), 1.0 / 1.6);
  vec4 cl = textureLod(uCloudTex, vec2(u, v), 0.0) * smoothstep(-0.002, 0.012, R.y);
  return c * (1.0 - cl.a) + cl.rgb;
}
void main() {
  vec3 P = vWorld;
  vec3 toCam = cameraPosition - P;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  vec2 p = P.xz;
  float detail = 1.0 - smoothstep(35.0, 380.0, dist);

  // the per-rect work only matters near the stage: past 24 m from the arena every face is out of reach
  float dA = sdRect(p, uArena);
  vec3 gw = vec3(dA, 0.0, 1.0), gd = gw;
  if (dA < 24.0) {
#ifdef DECK_FIELD
    deckWetG(p, gd, gw);
    if (gw.x < -0.03) discard;
#else
    gw = sdWetG(p);
    if (gw.x < -0.03) discard;                     // inside a hull / over a sunken floor: no sea
    gd = sdDeckG(p);
#endif
  }
  vec3 gs = gd.x < gw.x ? gd : gw;                 // nearest face: distance + outward normal
  float dS = gs.x;
  float shelter = smoothstep(0.3, 9.0, max(dS, 0.0));

  vec4 w1 = texture2D(uWaveTex, p * 0.041 + uTime * vec2(0.012, 0.007));
  vec4 w2 = texture2D(uWaveTex, p * 0.097 + vec2(0.37, 0.61) + uTime * vec2(-0.019, 0.013));
  vec4 w3 = texture2D(uWaveTex, p * 0.0083 + uTime * vec2(0.0034, -0.0022));
  float nearF = 1.0 - smoothstep(6.0, 40.0, dist);
  vec4 w4 = texture2D(uWaveTex, p * 0.29 + vec2(0.71, 0.13) + uTime * vec2(0.031, -0.026));
  vec2 g = (w3.xy - 0.5) * 0.9 + ((w1.xy - 0.5) * 0.85 + (w2.xy - 0.5) * 0.55) * mix(0.3, 1.0, detail);
  float basin = smoothstep(60.0, 210.0, dA);   // = basinK(p)
  g *= uWaveStrength * 0.42 * mix(uMarinaK.x, 1.0, shelter) * mix(0.62, 1.0, basin);
  // fine cat's-paw ripples close to the camera are not damped: glassy, never dead flat
  g += (w4.xy - 0.5) * 0.45 * nearF * uWaveStrength * 0.42 * 0.85;
  // ripples bounced off the faces: crests parallel to the nearest face, running outward, gone within ~3 m
  float along = dot(p, vec2(-gs.z, gs.y));
  float ph1 = dS * 4.4 - uTime * 1.8 + sin(along * 0.62 + uTime * 0.55) * 0.9 + w2.z * 3.0;
  float ph2 = dS * 7.1 - uTime * 2.6 + sin(along * 1.25 - uTime * 0.45) * 0.8 + w1.z * 2.2;
  float lapA = uMarinaK.y * exp(-max(dS, 0.0) * 0.85) * smoothstep(-0.25, 0.1, dS) * (0.4 + 0.9 * w3.z);
  g += gs.yz * lapA * (0.055 * sin(ph1) + 0.03 * sin(ph2)) * detail;
  vec2 gRip = g;
  g += vSwellGrad;
  vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
  float crest = (w1.z * 0.9 + w2.z * 0.5 + w3.z * 0.9) / 2.3;

  vec2 fuv = (p - uFoamRect.xy) * uFoamRect.zw;
  float inField = step(0.0, fuv.x) * step(fuv.x, 1.0) * step(0.0, fuv.y) * step(fuv.y, 1.0);
  float dObj = mix(uMarinaK.w, texture2D(uFoamTex, clamp(fuv, 0.0, 1.0)).r * uMarinaK.w, inField);

  // light: the shadow map (it covers every slab and hull here); no sky / sun under the floating slabs
  float shadow = getShadowMask();
  float under = smoothstep(0.0, -0.8, gd.x);
  float skyVis = mix(0.55, 1.0, smoothstep(-0.2, 3.0, dS)) * (1.0 - 0.9 * under);

  vec3 body = mix(uSeaDeep, uSeaShallow, clamp(0.4 + 0.5 * (w3.z - 0.5), 0.0, 1.0));
  body = mix(uChannelCol, body, 0.3 + 0.7 * shelter);
  body += uSeaCrest * smoothstep(0.55, 0.95, crest) * (0.3 + 0.7 * shadow) * 0.3 * mix(0.25, 1.0, detail) * shelter;
  float NdL = max(dot(N, uSunDir), 0.0);
  vec3 lit = body * (uSeaAmbient * skyVis + uSunLight * (0.35 + 0.65 * NdL) * shadow * 0.5);

  // reflection: sky + clouds, then the planar reflection of everything standing above the water
  vec3 R = reflect(-V, N);
  R.y = abs(R.y);
  vec3 refl = skyRefl(R);
  float occl = 0.0;
  if (uFarOn > 0.5) {
    vec4 fc = textureLod(uFarCube, R, clamp(log2(1.0 + dist * 0.008) + length(gRip) * 4.0, 0.0, 5.0));
    float fa = clamp(fc.a, 0.0, 1.0);
    refl = refl * (1.0 - fa) + fc.rgb;
    occl = fa;
  }
  refl *= skyVis;
  if (uReflOn > 0.5) {
    vec2 off = (N.xz - vSwellGrad * 0.5) * uMarinaK.z;
    vec4 rp = uReflMat * vec4(P.x + off.x, ${W.toFixed(3)}, P.z + off.y, 1.0);
    vec2 ruv = rp.xy / max(rp.w, 1e-4);
    float lod = clamp(log2(1.0 + dist * 0.035) + length(gRip) * 5.0, 0.0, 4.5);
    vec4 rc = textureLod(uReflTex, clamp(ruv, 0.001, 0.999), lod);
    float ra = clamp(rc.a, 0.0, 1.0);   // coverage: anything additive in the mirror must never push it past 1
    refl = refl * (1.0 - ra) + rc.rgb;
    occl = max(occl, ra);
  }
  float NdV = clamp(dot(N, V), 0.0, 1.0);
  float fres = min((0.025 + 0.975 * pow(1.0 - NdV, 5.0)) * 1.1, 1.0);
  vec3 col = mix(lit, refl, fres);
  col = mix(col, uShadeCol * (uSeaAmbient + 0.02), under * 0.85);

  // sun glints (blocked by shadows and by anything reflected in front of the sky)
  float rs = clamp(dot(R, uSunDir), 0.0, 1.0);
  float spec = pow(rs, 1600.0) * 9.0 + pow(rs, 200.0) * 0.38 + pow(rs, 24.0) * 0.04;
  col += uSunLight * spec * uSunSpec * shadow * (1.0 - under) * (1.0 - occl);

  // foam \u2014 calm harbour water: a thin, broken froth line where the water laps a hull or anything standing in it (the
  // contour field: piles, fenders, moored boats), a few drifting clumps, faint rings pushed off by the lapping
  float dC = min(gw.x, dObj);                       // nearest thing standing in the water
  if (dC < 1.2) {
    float fn = w2.z * 0.6 + w1.z * 0.4;
    // non-repeating value noise (the wave texture tiles every ~1 m at froth scale)
    float nA = vnoise2(p * 3.3 + uTime * vec2(0.13, -0.09));
    float nB = vnoise2(p * 0.8 + vec2(17.0, 3.0) - uTime * vec2(0.05, 0.03));
    float froth = nA * 0.55 + nB * 0.45;
    float contact = smoothstep(0.03 + 0.07 * nA, 0.0, dC) * (0.35 + 0.65 * smoothstep(0.3, 0.7, nB)) * smoothstep(-0.04, 0.0, gw.x);
    float clump = smoothstep(0.66, 0.86, froth) * smoothstep(0.7, 0.05, dC) * smoothstep(0.35, 0.8, nB);
    float lapF = smoothstep(0.05, 0.0, abs(fract(dC * 1.5 - uTime * 0.2 + fn * 0.4) - 0.5) - 0.46)
      * smoothstep(1.1, 0.1, dC) * smoothstep(0.4, 0.75, nB);
    float foam = clamp(contact * 0.7 + clump * 0.35 + lapF * 0.15, 0.0, 1.0) * (1.0 - 0.8 * under);
    vec3 foamCol = uFoamColor * (uSeaAmbient * 1.2 * skyVis + uSunLight * (0.3 + 0.7 * shadow) * 0.55);
    col = mix(col, foamCol, foam * detail);
  }

  col = applyHaze(col, P);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,lo=`
#include <common>
#include <shadowmap_pars_vertex>
uniform float uTime;
${Yt}
${ro}
varying vec3 vWorld;
varying vec2 vSwellGrad;
varying float vDeckD;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  float dd = sdDeck(worldPosition.xz);
#ifdef MARINA
  dd = min(dd, sdWet(worldPosition.xz));
#endif
  float amp = swellAmp(dd);
#ifdef MARINA
  amp *= mix(0.45, 1.0, basinK(worldPosition.xz));
#endif
  vec2 g;
  float h = swell(worldPosition.xz, uTime, g);
  worldPosition.y += h * amp;
  vWorld = worldPosition.xyz;
  vSwellGrad = g * amp;
  vDeckD = dd;
  vec4 mvPosition = viewMatrix * worldPosition;
  vec3 transformedNormal = normalMatrix * vec3(0.0, 1.0, 0.0);
  #include <shadowmap_vertex>
  gl_Position = projectionMatrix * mvPosition;
}
`,ho=`
#include <common>
#include <packing>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
${ot}
${Yt}
uniform sampler2D uWaveTex;
uniform sampler2D uFoamTex;
uniform vec4 uFoamRect;
uniform vec3 uSeaDeep;
uniform vec3 uSeaShallow;
uniform vec3 uSeaCrest;
uniform vec3 uFoamColor;
uniform vec3 uSunLight;
uniform vec3 uSeaAmbient;
uniform float uSunSpec;
uniform float uWaveStrength;
varying vec3 vWorld;
varying vec2 vSwellGrad;
varying float vDeckD;

#ifdef MARINA
${co}
#else
void main() {
  vec3 P = vWorld;
  vec3 toCam = cameraPosition - P;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  vec2 p = P.xz;
  float detail = 1.0 - smoothstep(35.0, 380.0, dist);

  vec4 w1 = texture2D(uWaveTex, p * 0.041 + uTime * vec2(0.012, 0.007));
  vec4 w2 = texture2D(uWaveTex, p * 0.097 + vec2(0.37, 0.61) + uTime * vec2(-0.019, 0.013));
  vec4 w3 = texture2D(uWaveTex, p * 0.0083 + uTime * vec2(0.0034, -0.0022));
  float nearF = 1.0 - smoothstep(6.0, 40.0, dist);
  vec4 w4 = texture2D(uWaveTex, p * 0.29 + vec2(0.71, 0.13) + uTime * vec2(0.031, -0.026));
  vec2 g = (w3.xy - 0.5) * 0.9 + ((w1.xy - 0.5) * 0.85 + (w2.xy - 0.5) * 0.55) * mix(0.3, 1.0, detail) + (w4.xy - 0.5) * 0.45 * nearF;
  g = g * uWaveStrength * 0.42 + vSwellGrad;
  vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
  float crest = (w1.z * 0.9 + w2.z * 0.5 + w3.z * 0.9) / 2.3;

  float dEdge = sdDeck(p);
  // the sea never shows through inside the arena footprint (e.g. dry-dock trenches below sea level)
  if (dEdge < -0.05) discard;
  vec2 fuv = (p - uFoamRect.xy) * uFoamRect.zw;
  float inField = step(0.0, fuv.x) * step(fuv.x, 1.0) * step(0.0, fuv.y) * step(fuv.y, 1.0);
  float dObj = mix(8.0, texture2D(uFoamTex, clamp(fuv, 0.0, 1.0)).r * 8.0, inField);

  // shadows: real shadow map (deck, walls, boats) + analytic deck-slab shadow as a fallback outside the shadow camera
  float sm = getShadowMask();
  vec2 q = p + uSunDir.xz * ((-0.6 - P.y) / max(uSunDir.y, 0.06));
  float ash = smoothstep(-0.2, 0.45, sdDeck(q));
  float shadow = min(sm, ash);
  float under = smoothstep(0.3, -2.4, dEdge);

  // body colour: turquoise shallows near the pier, deep blue further out; crests catch light
  float shallow = smoothstep(8.0, 0.5, dEdge) * (0.7 + 0.6 * (w3.z - 0.5));
  vec3 body = mix(uSeaDeep, uSeaShallow, clamp(shallow, 0.0, 1.0) * 0.6);
  body += uSeaCrest * smoothstep(0.55, 0.95, crest) * (0.3 + 0.7 * shadow) * 0.4 * mix(0.25, 1.0, detail);
  float NdL = max(dot(N, uSunDir), 0.0);
  vec3 lit = body * (uSeaAmbient + uSunLight * (0.4 + 0.6 * NdL) * shadow * 0.55);

  // reflection of the sky
  vec3 R = reflect(-V, N);
  R.y = abs(R.y);
  vec3 refl = skyGradient(normalize(R + vec3(0.0, 0.015, 0.0)));
  float NdV = clamp(dot(N, V), 0.0, 1.0);
  float fres = 0.035 + 0.965 * pow(1.0 - NdV, 5.0);
  fres = min(fres * 1.1, 1.0);
  vec3 col = mix(lit, refl, fres * mix(1.0, 0.45, under));
  col *= mix(1.0, 0.2, under);

  // sun glint: broad sheen + tight sparkles from the fine normals
  float rs = clamp(dot(R, uSunDir), 0.0, 1.0);
  float spec = pow(rs, 1600.0) * 9.0 + pow(rs, 200.0) * 0.38 + pow(rs, 24.0) * 0.04;
  col += uSunLight * spec * uSunSpec * shadow * (1.0 - under);

  // foam: lapping band along the deck edge, rings around pilings / boats / buoys
  float fn = w2.z * 0.6 + w1.z * 0.4;
  float edgeF = smoothstep(0.75, 0.0, dEdge + (fn - 0.5) * 0.9) * smoothstep(-1.0, -0.2, dEdge);
  float lapPhase = fract(dEdge * 0.7 - uTime * 0.3);
  float lap = smoothstep(0.1, 0.0, abs(lapPhase - 0.5) - 0.4) * smoothstep(3.4, 0.5, dEdge) * step(0.0, dEdge);
  lap *= smoothstep(0.35, 0.7, fn + 0.15);
  float objF = smoothstep(0.55, 0.0, dObj + (fn - 0.5) * 0.45);
  objF += 0.45 * smoothstep(0.1, 0.0, abs(fract(dObj * 0.9 - uTime * 0.35) - 0.5) - 0.42) * smoothstep(2.2, 0.4, dObj) * smoothstep(0.35, 0.7, fn + 0.1);
  float foam = clamp(edgeF + lap * 0.5 + objF, 0.0, 1.0) * mix(1.0, 0.35, under);
  vec3 foamCol = uFoamColor * (uSeaAmbient * 1.3 + uSunLight * (0.35 + 0.65 * shadow) * 0.6);
  col = mix(col, foamCol, foam * detail);

  col = applyHaze(col, P);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
#endif
`,uo=`
uniform float uTime;
attribute float glow;
varying float vGlow;
varying vec3 vHzWorld;
varying vec3 vHzNormal;
varying float vHzSeed;
#ifdef HZ_GULL
attribute float aPhase;
#endif
#ifdef HZ_CITY
attribute vec3 bld;
varying vec3 vBld;
#endif
`,fo=`
#ifdef HZ_GULL
{
  float side = abs(transformed.x);
  float glide = 0.35 + 0.65 * smoothstep(-0.3, 0.6, sin(uTime * 0.55 + aPhase * 17.0));
  float flap = sin(uTime * 8.5 + aPhase * 6.2831);
  transformed.y += flap * glide * side * 0.62 * smoothstep(0.08, 0.35, side);
  transformed.y -= 0.12 * side * side;
}
#endif
`,mo=`
{
  vec4 hzW = vec4(transformed, 1.0);
  vec3 hzN = objectNormal;
  vHzSeed = 0.0;
#ifdef USE_INSTANCING
  hzW = instanceMatrix * hzW;
  hzN = mat3(instanceMatrix) * hzN;
  vHzSeed = fract(sin(dot(instanceMatrix[3].xz, vec2(12.9898, 78.233))) * 43758.5453);
#endif
  hzW = modelMatrix * hzW;
  vHzWorld = hzW.xyz;
  vHzNormal = normalize(mat3(modelMatrix) * hzN);
  vGlow = glow;
#ifdef HZ_CITY
  vBld = bld;
#endif
}
`,po=`
${ot}
${pt}
#ifdef HZ_CITY
varying vec3 vBld;
float aaBand(float x, float a, float b, float w) { return smoothstep(a - w, a + w, x) * smoothstep(b + w, b - w, x); }
float aaLine(float x, float hw, float w) { float d = min(x, 1.0 - x); return smoothstep(hw + w, hw - w, d); }
vec3 hzLitCol = vec3(0.0);
#endif
varying float vGlow;
varying vec3 vHzWorld;
varying vec3 vHzNormal;
varying float vHzSeed;
float hzWin = 0.0;
float hzLit = 0.0;
vec3 hzEmit = vec3(0.0);   // night lights: added after the haze so they punch through it (and bloom)
`,vo=`
#ifdef HZ_CITY
{
  // facade styles (vBld.x): 0 solid, 1 punched windows w/ mullion, 2 ribbon bands, 3 curtain wall, 4 vertical piers, 5 bands only (round towers)
  vec3 wn = normalize(vHzNormal);
  float style = floor(vBld.x + 0.5);
  float seed = vBld.y;
  float v = vHzWorld.y - vBld.z;
  if (style > 0.5 && abs(wn.y) < 0.5) {
    vec2 tdir = normalize(vec2(-wn.z, wn.x));
    float u = dot(vHzWorld.xz, tdir) + seed * 37.0;
    float bay = style < 1.5 ? 3.3 : style < 2.5 ? 1.7 : style < 3.5 ? 1.5 : style < 4.5 ? 2.8 : 2.0;
    float flH = style < 2.5 ? 3.5 : 3.9;
    vec2 cell = vec2(u / bay, v / flH);
    vec2 f = fract(cell), id = floor(cell);
    vec2 fw = fwidth(cell);
    float far = smoothstep(0.22, 0.75, max(fw.x, fw.y));
    float glass = 0.0, mull = 0.0, avg = 0.5;
    if (style < 1.5) {
      glass = aaBand(f.x, 0.2, 0.8, fw.x) * aaBand(f.y, 0.27, 0.86, fw.y);
      mull = aaBand(f.x, 0.485, 0.515, fw.x) * glass;
      avg = 0.6 * 0.59;
    } else if (style < 2.5) {
      glass = aaBand(f.y, 0.3, 0.9, fw.y);
      mull = aaLine(f.x, 0.04, fw.x) * glass;
      avg = 0.58;
    } else if (style < 3.5) {
      glass = 1.0;
      mull = max(aaLine(f.x, 0.035, fw.x), aaLine(f.y, 0.05, fw.y) * 0.8);
      avg = 0.86;
    } else if (style < 4.5) {
      glass = aaBand(f.x, 0.32, 0.92, fw.x) * aaBand(f.y, 0.06, 0.97, fw.y);
      mull = aaLine(f.y, 0.04, fw.y) * glass;
      avg = 0.52;
    } else {
      glass = aaBand(f.y, 0.36, 0.9, fw.y);
      avg = 0.54;
    }
    glass = mix(glass * (1.0 - mull), avg, far);
    // ground-floor storefront band, and no glass right at the roofline
    glass = mix(glass, 0.75 * smoothstep(0.5, 0.9, v), 1.0 - smoothstep(3.6, 4.2, v));
    float r = hash12(id + seed * 113.0);
    vec3 gcol = mix(vec3(0.11, 0.16, 0.23), vec3(0.2, 0.27, 0.33), r);                 // blinds / interiors vary per window
    if (style > 2.5 && style < 3.5) gcol = mix(vec3(0.24, 0.37, 0.47), vec3(0.34, 0.47, 0.55), r * 0.7) * mix(0.9, 1.08, fract(seed * 7.1));
    gcol = mix(gcol, vec3(0.22, 0.29, 0.36), far);
    diffuseColor.rgb = mix(diffuseColor.rgb, gcol, glass);
    diffuseColor.rgb *= 1.0 - mull * 0.3 * (1.0 - far);
    // floor-line grooves on the solid parts
    diffuseColor.rgb *= 1.0 - 0.07 * aaLine(f.y, 0.025, fw.y) * (1.0 - glass) * (1.0 - far);
    hzWin = glass;
    float lit = step(r, style > 2.5 && style < 3.5 ? 0.34 : 0.44);
    lit = mix(lit, 0.38, far);
    vec3 lc = mix(vec3(1.0, 0.72, 0.4), vec3(0.8, 0.88, 1.0), step(0.78, hash12(id * 1.7 + seed)));
    hzLitCol = lc * lit * glass;
  }
}
#endif
#ifdef HZ_TERRAIN
{
  // stylised hills: meadow grass on gentle slopes, clumpy woodland canopy, warm dry meadows on the tops, layered rock on
  // steep faces, a sand + wet-sand beach line at the shore; vGlow carries baked fold AO
  vec3 wn = normalize(vHzNormal);
  float hgt = vHzWorld.y - ${W.toFixed(3)};
  vec2 tp = vHzWorld.xz;
  float n1 = fbm2(tp * 0.011);
  float n2 = vnoise2(tp * 0.05) * 0.6 + vnoise2(tp * 0.17) * 0.4;
  float nt = vnoise2(tp * 0.3) * 0.55 + vnoise2(tp * 0.83 + 7.0) * 0.45;
  vec3 tint = diffuseColor.rgb;
  float slope = 1.0 - wn.y;
  vec3 grass = tint * mix(0.9, 1.08, n1);
  float wood = smoothstep(0.47, 0.62, n1 + (n2 - 0.5) * 0.3) * smoothstep(0.62, 0.3, slope) * smoothstep(1.5, 5.0, hgt);
  vec3 canopy = tint * vec3(0.5, 0.66, 0.52) * mix(0.68, 1.14, smoothstep(0.3, 0.78, nt));
  grass = mix(grass, canopy, wood * 0.92);
  grass = mix(grass, tint * vec3(1.12, 1.06, 0.8), smoothstep(0.34, 0.12, n1) * (1.0 - wood) * 0.5);
  vec3 rock = vec3(0.56, 0.55, 0.51) * (0.82 + 0.3 * n2);
  rock *= 0.9 + 0.1 * sin(vHzWorld.y * 0.85 + n2 * 5.0);
  float rockM = smoothstep(0.34, 0.54, slope + (n2 - 0.5) * 0.2) * 0.88;
  vec3 sand = vec3(0.95, 0.88, 0.72) * (0.95 + 0.08 * n2);
  float sandM = smoothstep(1.6, 0.6, hgt + (n1 - 0.5) * 1.6);
  vec3 c = mix(grass, rock, rockM);
  c = mix(c, sand, sandM);
  c = mix(c, sand * vec3(0.72, 0.7, 0.66), smoothstep(0.45, 0.1, hgt) * sandM);
  diffuseColor.rgb = c * vGlow;
}
#endif
#ifdef HZ_WATERLINE
{
  float wl = vHzWorld.y - ${W.toFixed(3)};
  diffuseColor.rgb *= mix(0.5, 1.0, smoothstep(0.0, 0.45, wl));
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16, 0.27, 0.18), smoothstep(0.3, 0.0, wl) * 0.55);
}
#endif
#ifdef HZ_SHORE
{
  float wl = vHzWorld.y - ${W.toFixed(3)};
  float wob = 0.12 * sin(uTime * 1.2 + vHzWorld.x * 0.21 + vHzWorld.z * 0.17);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.95, 0.97, 0.98), smoothstep(0.45, 0.05, abs(wl - 0.12 - wob)) * 0.85);
}
#endif
`,xo=`
#ifdef HZ_CITY
roughnessFactor = mix(roughnessFactor, 0.14, hzWin);
#endif
`,go=`
{
  float blink = step(0.55, fract(uTime * 0.7 + vHzWorld.x * 0.013 + vHzWorld.z * 0.007));
#ifndef HZ_TERRAIN
  float gAmt = vGlow > 1.5 ? blink * 1.5 : vGlow;
  hzEmit += vColor.rgb * gAmt * (vGlow > 1.5 ? max(uNight, 0.35) : uNight) * 7.0;
#endif
#ifdef HZ_CITY
  hzEmit += uNight * hzLitCol * 1.5;   // warm lit windows, not white: 3.0 blew them out through the tone curve
#endif
#ifdef HZ_WATERLINE
  float wl2 = vHzWorld.y - ${W.toFixed(3)};
  vec2 cq = vHzWorld.xz * 1.7 + vec2(vHzWorld.y * 2.3, 0.0);
  float cz = sin(cq.x + uTime * 1.3 + sin(cq.y * 1.3 + uTime * 0.9) * 1.6) * sin(cq.y * 1.1 - uTime * 1.1 + sin(cq.x * 0.9 - uTime * 0.7) * 1.4);
  float side = 1.0 - abs(normalize(vHzNormal).y);
  totalEmissiveRadiance += uGlowColor * 0.07 * side * smoothstep(0.45, 0.95, cz) * smoothstep(1.1, 0.15, wl2) * step(0.0, wl2);
#endif
}
`,wo=`
#include <opaque_fragment>
#ifdef HZ_CITY
{
  // glass reflects the sky gradient (grazing angles \u2192 mirror-bright), so towers pick up the sky's colours
  vec3 wn2 = normalize(vHzNormal);
  vec3 V = normalize(vHzWorld - cameraPosition);
  vec3 Rr = reflect(V, wn2);
  float fres = 0.05 + 0.95 * pow(1.0 - clamp(dot(-V, wn2), 0.0, 1.0), 5.0);
  vec3 refl = min(skyGradient(normalize(vec3(Rr.x, max(Rr.y, 0.02), Rr.z))), vec3(1.1));
  gl_FragColor.rgb = mix(gl_FragColor.rgb, refl * mix(0.92, 0.55, uNight), hzWin * clamp(0.18 + fres * 0.75, 0.0, 0.85) * (1.0 - uNight * 0.75));
  // dusk: the skyline across the bay settles a stop darker so its lit windows carry it (was one flat salmon glow)
  gl_FragColor.rgb *= 1.0 - 0.38 * uNight;
}
#endif
gl_FragColor.rgb = applyHaze(gl_FragColor.rgb, vHzWorld) + hzEmit * exp(-length(vHzWorld - cameraPosition) * uHaze.x * 0.35);
`,yo=`
#include <common>
#include <shadowmap_pars_vertex>
uniform vec3 uSunDir;
attribute vec4 aInfo;        // rgb = face albedo (linear), a = kind (0 slab fascia / underside, 1 hull in the water)
varying vec3 vP;
varying vec3 vPw;
varying vec3 vN;
varying vec4 vInfo;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vP = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vInfo = aInfo;
  float h = max(wp.y - ${W.toFixed(3)}, 0.0);
  vec2 k = uSunDir.xz / max(uSunDir.y, 0.08);
  vPw = vec3(wp.x + k.x * h, ${W.toFixed(3)}, wp.z + k.y * h);
  vec4 worldPosition = vec4(vPw, 1.0);
  vec4 mvPosition = viewMatrix * wp;
  vec3 transformedNormal = normalMatrix * vec3(0.0, 1.0, 0.0);
  #include <shadowmap_vertex>
  gl_Position = projectionMatrix * mvPosition;
}
`,bo=`
#include <common>
#include <packing>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
uniform float uTime;
uniform vec3 uSunDir;
uniform vec3 uSunLight;
uniform vec4 uStripK;      // x caustic strength, y wet-band darkening
varying vec3 vP;
varying vec3 vPw;
varying vec3 vN;
varying vec4 vInfo;
vec2 hash22s(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
// distance to the nearest cell border of a jittered grid whose points wander (F2 \u2212 F1): 0 on the borders
float cellEdge(vec2 p, float t) {
  vec2 i = floor(p), f = fract(p);
  float d1 = 8.0, d2 = 8.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 h = hash22s(i + g);
    vec2 o = 0.5 + 0.4 * sin(t * (0.7 + 0.6 * h) + 6.2831 * h.yx);
    float d = length(g + o - f);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
  }
  return d2 - d1;
}
// focused-light network of a rippled surface (mean \u2248 1)
float caustic(vec2 p, float t, float blur) {
  vec2 w = p + 0.3 * vec2(sin(p.y * 1.1 + t * 0.8), sin(p.x * 0.9 - t * 0.7));
  float c1 = 1.0 - smoothstep(0.0, 0.08 + blur, cellEdge(w * 2.2, t * 1.2));
  float c2 = 1.0 - smoothstep(0.0, 0.08 + blur * 1.4, cellEdge(w * 3.3 + 7.3, t * 1.5));
  return (c1 * 0.8 + c2 * 0.5 + c1 * c2 * 1.4) * 2.4;
}
float swellH(vec2 p, float t) {
  return 0.45 * sin(dot(p, vec2(0.110, 0.047)) + t * 0.95) + 0.35 * sin(dot(p, vec2(-0.052, 0.097)) + t * 1.13 + 1.7) + 0.20 * sin(dot(p, vec2(0.173, -0.141)) + t * 1.61 + 4.1);
}
void main() {
  vec3 n = normalize(vN);
  float h = vP.y - ${W.toFixed(3)};
  // cosine between the face and the light bouncing up off the water (away from the sun)
  float facing = max(dot(n, vec3(uSunDir.x, -uSunDir.y, uSunDir.z)), 0.0);
  vec3 add = vec3(0.0);
  if (facing > 0.002) {
    float lit = getShadowMask();
    if (lit > 0.002) {
      float c = caustic(vPw.xz, uTime, 0.02 + max(h, 0.0) * 0.1);
      float fall = exp(-max(h, 0.0) * 0.8) * smoothstep(-0.02, 0.05, h);
      vec3 alb = max(vInfo.rgb, vec3(0.12));
      add = uSunLight * alb * (c * 0.06) * facing * lit * fall * uStripK.x;
    }
  }
  float mul = 1.0;
  if (vInfo.a > 0.5) {
    // hull in the water: the line bobs with the swell; a dark wet band above it, freshest right at the line
    float wl = ${W.toFixed(3)} + 0.035 * swellH(vP.xz, uTime) + 0.018 * sin(uTime * 1.7 + (vP.x + vP.z) * 1.3);
    float top = 0.22 + 0.07 * sin(vP.x * 1.7 + vP.z * 1.3) + 0.04 * sin(vP.x * 5.1 - vP.z * 4.3);
    float band = smoothstep(wl + top, wl + top - 0.14, vP.y);
    float fresh = smoothstep(wl + 0.05, wl + 0.004, vP.y);
    mul = 1.0 - uStripK.y * (0.75 * band + 0.25 * fresh);
    add *= 1.0 - 0.5 * band;
  }
  gl_FragColor = vec4(add, mul);
}
`;function de(r,t,e={}){let o=[];e.city&&o.push("HZ_CITY"),e.terrain&&o.push("HZ_TERRAIN"),e.waterline&&o.push("HZ_WATERLINE"),e.shore&&o.push("HZ_SHORE"),e.gull&&o.push("HZ_GULL"),r.defines=r.defines||{};for(let s of o)r.defines[s]="";return r.fog=!1,r.onBeforeCompile=s=>{for(let n of["uTime","uSunDir","uZenith","uSkyMid","uHorizon","uGround","uHorizonGlow","uGlowColor","uGlowParams","uHaze","uNight"])s.uniforms[n]=t[n];s.vertexShader=s.vertexShader.replace("#include <common>",`#include <common>
`+uo).replace("#include <begin_vertex>",`#include <begin_vertex>
`+fo).replace("#include <project_vertex>",`#include <project_vertex>
`+mo),s.fragmentShader=s.fragmentShader.replace("#include <common>",`#include <common>
`+po).replace("#include <color_fragment>",`#include <color_fragment>
`+vo).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
`+xo).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
`+go).replace("#include <opaque_fragment>",wo)},r.customProgramCacheKey=()=>"inkwave-env:"+o.join(","),r}function tt(r){let t=r>>>0;return()=>{t|=0,t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function Ae(r,t){let e=Math.sin(r*127.1+t*311.7)*43758.5453;return e-Math.floor(e)}function Eo(r,t){let e=Math.floor(r),o=Math.floor(t),s=r-e,n=t-o,u=s*s*(3-2*s),E=n*n*(3-2*n),y=Ae(e,o),c=Ae(e+1,o),b=Ae(e,o+1),R=Ae(e+1,o+1);return y+(c-y)*u+(b-y)*E+(y-c-b+R)*u*E}function ut(r,t,e=4){let o=0,s=.5,n=0;for(let u=0;u<e;u++)o+=s*Eo(r,t),n+=s,r=r*2.03+5.3,t=t*2.03-1.7,s*=.5;return o/n}var mt=(r,t,e)=>{let o=Math.min(1,Math.max(0,(e-r)/(t-r)));return o*o*(3-2*o)},ie=(r,t)=>[Math.cos(r*me)*t,Math.sin(r*me)*t];function Be(r){if(r.hx===void 0)return{...r,cx:(r.minX+r.maxX)/2,cz:(r.minZ+r.maxZ)/2,hx:(r.maxX-r.minX)/2,hz:(r.maxZ-r.minZ)/2,ax:1,az:0,aligned:!0};let t=r.ax??1,e=r.az??0,o=r.hx,s=r.hz,n=Math.hypot(t,e)||1;t/=n,e/=n,Math.abs(e)<1e-7?(t=1,e=0):Math.abs(t)<1e-7&&(t=1,e=0,[o,s]=[s,o]);let u=t===1&&e===0,E={...r,hx:o,hz:s,ax:t,az:e,aligned:u};if(!(u&&r.minX!==void 0)){let y=Math.abs(t)*o+Math.abs(e)*s,c=Math.abs(e)*o+Math.abs(t)*s;E.minX=r.cx-y,E.maxX=r.cx+y,E.minZ=r.cz-c,E.maxZ=r.cz+c}return E}function Mo(r){return r.aligned?Be({minX:r.aabbMin.x,maxX:r.aabbMax.x,minZ:r.aabbMin.z,maxZ:r.aabbMax.z}):Math.abs(r.axes[1].y)<.9999?null:Be({cx:r.center.x,cz:r.center.z,hx:r.half.x,hz:r.half.z,ax:r.axes[0].x,az:r.axes[0].z})}function Qe(r,t,e,o=0){if(r.aligned)return t>r.minX-o&&t<r.maxX+o&&e>r.minZ-o&&e<r.maxZ+o;let s=t-r.cx,n=e-r.cz;return Math.abs(s*r.ax+n*r.az)<r.hx+o&&Math.abs(n*r.ax-s*r.az)<r.hz+o}function zo(r,t,e){let o=t-r.cx,s=e-r.cz,n=Math.abs(o*r.ax+s*r.az)-r.hx,u=Math.abs(s*r.ax-o*r.az)-r.hz;return n>0||u>0?Math.sqrt((n>0?n*n:0)+(u>0?u*u:0)):Math.max(n,u)}var De=(r,t,e)=>[r.cx+t*r.ax-e*r.az,r.cz+t*r.az+e*r.ax];function Ro(r){let t,e;return r.aligned?(t=[[r.minX,r.minZ],[r.maxX,r.minZ],[r.maxX,r.maxZ],[r.minX,r.maxZ]],e=[[0,-1],[1,0],[0,1],[-1,0]]):(t=[De(r,-r.hx,-r.hz),De(r,r.hx,-r.hz),De(r,r.hx,r.hz),De(r,-r.hx,r.hz)],e=[[r.az,-r.ax],[r.ax,r.az],[-r.az,r.ax],[-r.ax,-r.az]]),t.map((o,s)=>({ax:o[0],az:o[1],bx:t[s+1&3][0],bz:t[s+1&3][1],nx:e[s][0]+0,nz:e[s][1]+0}))}var ae=new ze,xe=new _t,pe=new Ht,ye=new Q,be=new Q,Je=[new Q,new Q,new Q,new Q],ft=new ke,Kt=[new J,new J],Se=new Ft,qt=new K,To=new kt,So=new ze;function j(r,t="#ffffff",e=0){let o=r.index?r.toNonIndexed():r;for(let n of Object.keys(o.attributes))n!=="position"&&n!=="normal"&&n!=="color"&&n!=="glow"&&o.deleteAttribute(n);o.clearGroups(),o.attributes.normal||o.computeVertexNormals();let s=o.attributes.position.count;if(!o.attributes.color){let n=new K(t),u=new Float32Array(s*3);for(let E=0;E<s;E++)u[E*3]=n.r,u[E*3+1]=n.g,u[E*3+2]=n.b;o.setAttribute("color",new Pe(u,3))}return o.attributes.glow||o.setAttribute("glow",new Pe(new Float32Array(s).fill(e),1)),o}function d(r,t=0,e=0,o=0,s=0,n=0,u=0,E=1,y=1,c=1){return pe.set(n,s,u,"YXZ"),xe.setFromEuler(pe),ae.compose(ye.set(t,e,o),xe,be.set(E,y,c)),r.applyMatrix4(ae),r}var L=(r,t,e,o,s)=>j(new Oe(r,t,e),o,s),Z=(r,t,e,o,s,n,u=!1)=>j(new Ie(r,t,e,o,1,u),s,n),q=(r,t,e,o,s)=>j(new Ye(r,t,e),o,s);function te(r,t,e,o,s,n,u,E,y=0){let c=o-r,b=s-t,R=n-e,T=Math.hypot(c,b,R),h=L(u,T,u,E,y);return xe.setFromUnitVectors(ye.set(0,1,0),be.set(c/T,b/T,R/T)),ae.compose(ye.set((r+o)/2,(t+s)/2,(e+n)/2),xe,be.set(1,1,1)),h.applyMatrix4(ae),h}function dt(r,t,e,o=4,s=0){let n=new Pt(r.map(u=>new Q(u[0],u[1],u[2])));return j(new Lt(n,Math.max(4,Math.round(r.length*1.2)),t,o,!1),e,s)}function _o(r,t,e,o=12){let s=[];for(let n=0;n<=o;n++){let u=n/o;s.push([r[0]+(t[0]-r[0])*u,r[1]+(t[1]-r[1])*u-e*4*u*(1-u),r[2]+(t[2]-r[2])*u])}return s}function we(r,t,e=!0,o=0){let s=e?new Float32Array(r.length*2):new Float32Array(r);if(e){s.set(r,0);for(let u=0;u<r.length;u+=9)s.set([r[u],r[u+1],r[u+2],r[u+6],r[u+7],r[u+8],r[u+3],r[u+4],r[u+5]],r.length+u)}let n=new ve;return n.setAttribute("position",new Pe(s,3)),n.computeVertexNormals(),j(n,t,o)}function jt(r,t){let e=r.attributes.position,o=r.attributes.normal,s=r.attributes.color;for(let n=0;n<e.count;n++){let u=t(e.getX(n),e.getY(n),e.getZ(n),o.getX(n),o.getY(n),o.getZ(n));u&&s.setXYZ(n,u.r,u.g,u.b)}return r}function Ho(r=256,t=11){let e=tt(t),o=[],s=.55;for(let x=0;x<44;x++){let D=2+Math.pow(e(),1.5)*26,_=s+(e()-.5)*2.4,M=Math.round(Math.cos(_)*D),S=Math.round(Math.sin(_)*D);M===0&&S===0&&(M=2);let z=Math.hypot(M,S);o.push([M,S,1/Math.pow(z,1.3),e()*Math.PI*2])}let n=r*r,u=new Float32Array(n),E=new Float32Array(n),y=new Float32Array(n),c=1/0,b=-1/0,R=0,T=Math.PI*2;for(let x=0;x<r;x++)for(let D=0;D<r;D++){let _=D/r,M=x/r,S=0,z=0,A=0;for(let I=0;I<o.length;I++){let G=o[I],k=T*(G[0]*_+G[1]*M)+G[3],a=Math.sin(k),f=Math.cos(k);S+=G[2]*a,z+=G[2]*G[0]*f,A+=G[2]*G[1]*f}let H=x*r+D;u[H]=S,E[H]=z,y[H]=A,S<c&&(c=S),S>b&&(b=S),R=Math.max(R,Math.abs(z),Math.abs(A))}let h=new Uint8Array(n*4);for(let x=0;x<n;x++){let D=(u[x]-c)/(b-c);h[x*4]=Math.round((E[x]/R*.5+.5)*255),h[x*4+1]=Math.round((y[x]/R*.5+.5)*255),h[x*4+2]=Math.round(Math.pow(D,1.8)*255),h[x*4+3]=255}let m=new qe(h,r,r,Ee,nt);return m.wrapS=m.wrapT=at,m.magFilter=fe,m.minFilter=Xe,m.generateMipmaps=!0,m.anisotropy=8,m.colorSpace=Me,m.needsUpdate=!0,m}function et({L:r,B:t,D:e,F:o,sheer:s=.3,hull:n="#ffffff",stripe:u="#3c6e8f",bottom:E="#c75c52",deck:y="#d9c7a6"}){let R=[];for(let k=0;k<=14;k++){let a=k/14,f=(a-.5)*r,i;if(a<.55)i=.5*t*(.82+.18*Math.sin(a/.55*Math.PI/2));else{let p=(a-.55)/.45;i=.5*t*Math.sqrt(Math.max(0,1-p*p*.995))}let l=-e*(a<.62?1:1-.8*Math.pow((a-.62)/.38,1.4)),g=o+s*a*a,v=[];for(let p=-5;p<=5;p++){let F=Math.abs(p)/5,w=Math.sign(p)*i*Math.pow(Math.sin(F*Math.PI/2),.75),C=l+(g-l)*(1-Math.cos(F*Math.PI/2));v.push([w,C,f])}R.push({pts:v,top:g,z:f,w:i})}let T=[],h=(k,a,f,i)=>{let l=a[0]-k[0],g=a[1]-k[1],v=a[2]-k[2],p=f[0]-k[0],F=f[1]-k[1],w=f[2]-k[2],C=g*w-v*F,P=v*p-l*w,B=(k[0]+a[0]+f[0])/3,N=(k[1]+a[1]+f[1])/3;C*B+P*(N-i)<0?T.push(...k,...f,...a):T.push(...k,...a,...f)};for(let k=0;k<14;k++){let a=R[k].pts,f=R[k+1].pts,i=R[k].top*.7;for(let l=0;l<a.length-1;l++)h(a[l],a[l+1],f[l+1],i),h(a[l],f[l+1],f[l],i)}let m=new ve;m.setAttribute("position",new ne(T,3)),m.computeVertexNormals(),j(m,n);let x=new K(n),D=new K(u),_=new K(E),M=new K("#2b3440");jt(m,(k,a,f)=>{let i=Math.min(14,Math.max(0,Math.round((f/r+.5)*14))),l=R[i].top;return a<.02?_:a<.12?M:a>l-.2?D:x});let S=[m],z=[];for(let k=0;k<14;k++){let a=R[k],f=R[k+1],i=a.top-.14,l=f.top-.14,g=[-a.w*.96,i,a.z],v=[a.w*.96,i,a.z],p=[-f.w*.96,l,f.z],F=[f.w*.96,l,f.z];z.push(...g,...F,...v,...g,...p,...F)}S.push(we(z,y,!1));let A=R[0].pts,H=[],I=(A[0][1]+A[5][1])*.5,G=R[0].z;for(let k=0;k<A.length-1;k++)H.push(0,I,G,...A[k+1],...A[k]);return S.push(we(H,n,!0)),ee(S)}function Co(r){let{x:t,z:e,rx:o,rz:s,h:n,seed:u=1,rot:E=0,plateau:y=!1,R:c=12,S:b=44,grass:R="#9ccf7f",ridge:T=.3}=r,h=Math.cos(E),m=Math.sin(E),x=(v,p)=>{let F=Math.hypot(v,p),w=Math.atan2(p,v),C=1+(ut(Math.cos(w)*1.2+u*3.7,Math.sin(w)*1.2-u*1.9,3)-.5)*.34,P=F/C;if(P>=1)return-(P-1)*30-.6;let B=ut(v*1.15+u*5.1,p*1.15-u*2.3,4);if(y)return n*mt(1,.8,P)*(.92+.16*B)+(1-P)*.6-.35;let N=2*ut(v*1.7+u*1.7,p*1.7-u*.9,3)-1,X=1-Math.sqrt(N*N+.035),se=Math.pow(1-P*P,1.35);return n*se*(.52+.6*B+T*X*X)+(1-P)*.6-.35},D=(v,p)=>{let F=v-t,w=p-e;return[(F*h+w*m)/o,(-F*m+w*h)/s]},_=(v,p)=>[t+v*o*h-p*s*m,e+v*o*m+p*s*h],M=[],S=[],z=[],A=[],H=[],I=new K(R),G=.05,k=Math.max(o,s)*.012,a=(v,p)=>{let[F,w]=D(v,p);return x(F,w)},f=(v,p,F)=>{let[w,C]=_(v,p),P=F??x(v,p);if(M.push(w,W+P,C),F!==void 0)H.push(0,1,0);else{let X=(a(w+k,C)-a(w-k,C))/(2*k),se=(a(w,C+k)-a(w,C-k))/(2*k),re=1/Math.hypot(X,1,se);H.push(-X*re,re,-se*re)}let B=.94+.12*Ae(Math.round(w),Math.round(C));S.push(I.r*B,I.g*B,I.b*B);let N=(x(v+G,p)+x(v-G,p)+x(v,p+G)+x(v,p-G))/4-P;z.push(F!==void 0?1:1-Math.min(1,Math.max(0,N/(.02*n+.4)))*.42)};f(0,0);let i=c+2;for(let v=1;v<i;v++){let p=v===i-1?1.4:v/c*1.1;for(let F=0;F<b;F++){let w=F/b*Math.PI*2;f(Math.cos(w)*p,Math.sin(w)*p,v===i-1?-6:void 0)}}let l=(v,p)=>1+(v-1)*b+(p+b)%b;for(let v=0;v<b;v++)A.push(0,l(1,v+1),l(1,v));for(let v=1;v<i-1;v++)for(let p=0;p<b;p++){let F=l(v,p),w=l(v,p+1),C=l(v+1,p+1),P=l(v+1,p);A.push(F,C,P,F,w,C)}let g=new ve;return g.setAttribute("position",new ne(M,3)),g.setAttribute("normal",new ne(H,3)),g.setAttribute("color",new ne(S,3)),g.setAttribute("glow",new ne(z,1)),g.setIndex(A),{geo:j(g),heightAt:(v,p)=>{let[F,w]=D(v,p);return W+x(F,w)},localF:(v,p)=>{let[F,w]=D(v,p);return Math.hypot(F,w)},sample:(v,p=.8)=>{let F=v()*Math.PI*2,w=Math.sqrt(v())*p;return _(Math.cos(F)*w,Math.sin(F)*w)}}}var Ot=class{static get THEMES(){return je}constructor(t,e,o={}){this.renderer=t,this.scene=e;let s=o.bounds||{minX:-25,maxX:25,minZ:-44,maxZ:44};this.bounds={minX:s.minX,maxX:s.maxX,minZ:s.minZ,maxZ:s.maxZ},this.footprint=(o.footprint&&o.footprint.length?o.footprint:[this.bounds]).map(Be),this.shadowSize=o.shadowSize||4096,this.waterY=W,this.time=0,this.theme=null,this.envMap=null,this.fogColor=new K,this._envRT=null,this.root=new it,this.root.name="Environment",e.add(this.root),this._marina=this._stageMarina(),this._frameId=0,this.reflections=!0,this._initUniforms(),this._buildLights(),this._buildSky(),this._buildSea(),this._buildDock(),this._buildScenery(),this._buildLife(),e.fog=new Ct(this.fogColor,70,1500),this.setTheme(o.theme||"day")}_initUniforms(){let t=()=>({value:new Q}),e=()=>({value:new K});this.U={uTime:{value:0},uSunDir:t(),uZenith:e(),uSkyMid:e(),uHorizon:e(),uGround:e(),uHorizonGlow:e(),uGlowColor:e(),uGlowParams:{value:new J},uHaze:{value:new J},uNight:{value:0},uSunDisk:e(),uSunCos:{value:.9998},uCloudLit:e(),uCloudShade:e(),uCloudParams:{value:new J},uRects:{value:Array.from({length:_e},()=>new J)},uRectCount:{value:0},uRectAx:{value:Array.from({length:_e},()=>new ke(1,0))},uWaveTex:{value:null},uFoamTex:{value:null},uFoamRect:{value:new J},uSeaDeep:e(),uSeaShallow:e(),uSeaCrest:e(),uFoamColor:e(),uSunLight:e(),uSeaAmbient:e(),uSunSpec:{value:1},uWaveStrength:{value:1},uCloudTex:{value:null},uWet:{value:Array.from({length:He},()=>new J)},uWetCount:{value:0},uArena:{value:new J},uWetAx:{value:Array.from({length:He},()=>new ke(1,0))},uDeckField:{value:null},uDeckFieldRect:{value:new J},uDeckFieldK:{value:new J},uDeckBox:{value:new J},uWetBox:{value:new J},uReflTex:{value:null},uReflMat:{value:new ze},uReflOn:{value:0},uFarCube:{value:null},uFarOn:{value:0},uChannelCol:e(),uShadeCol:e(),uMarinaK:{value:new J(1,1,.3,0)},uStripK:{value:new J(1,.4,0,0)}},this._syncDeckShading()}_syncDeckShading(){let t=this.U,e=this._marina?this._marinaData:null,o=e?e.decks:this.footprint,s=e?e.wet:[],n=o.length>_e||s.length>He||!!this.forceDeckField;n?(this._bakeDeckField(o,s),t.uRectCount.value=0,t.uWetCount.value=0):(this._writeRects(o),this._writeWet(s),this._fieldRT&&(this._fieldRT.dispose(),this._fieldRT=null,this._fieldKey=null,t.uDeckField.value=null)),this.seaMat&&"DECK_FIELD"in this.seaMat.defines!==n&&(n?this.seaMat.defines.DECK_FIELD="":delete this.seaMat.defines.DECK_FIELD,this.seaMat.needsUpdate=!0)}_bakeDeckField(t,e){let o=this.U,s=this.bounds,n=so,u=_=>{if(!_.length)return[1e4,1e4,1e4,1e4];let M=[1/0,1/0,-1/0,-1/0];for(let S of _)M[0]=Math.min(M[0],S.minX),M[1]=Math.min(M[1],S.minZ),M[2]=Math.max(M[2],S.maxX),M[3]=Math.max(M[3],S.maxZ);return M},E=u(t),y=u(e),c=s.minX,b=s.minZ,R=s.maxX,T=s.maxZ;for(let _ of[...t,...e])c=Math.min(c,_.minX),b=Math.min(b,_.minZ),R=Math.max(R,_.maxX),T=Math.max(T,_.maxZ);c=Math.max(c,s.minX-60)-n-1,b=Math.max(b,s.minZ-60)-n-1,R=Math.min(R,s.maxX+60)+n+1,T=Math.min(T,s.maxZ+60)+n+1;let h=oo;for(;(R-c)/h*((T-b)/h)>22e5;)h*=1.25;let m=Math.ceil((R-c)/h),x=Math.ceil((T-b)/h),D=[c,b,m,x,h,...[t,e].map(_=>_.map(M=>[M.cx,M.cz,M.hx,M.hz,M.ax,M.az].join()).join(";"))].join("|");if(D!==this._fieldKey){let _=performance.now();this._fieldKey=D;let M=Math.max(1,t.length,e.length),S=new Float32Array(2*M*2*4);[t,e].forEach((k,a)=>k.forEach((f,i)=>S.set([f.cx,f.cz,f.hx,f.hz,f.ax,f.az,0,0],(a*2*M+2*i)*4)));let z=new qe(S,2*M,2,Ee,Tt);z.needsUpdate=!0,this._fieldMat||(this._fieldMat=new Te({name:"DeckFieldBake",depthTest:!1,depthWrite:!1,uniforms:{uRectTex:{value:null},uN:{value:new ke},uField:{value:new J},uR:{value:n}},vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:`
            uniform sampler2D uRectTex; uniform vec2 uN; uniform vec4 uField; uniform float uR;
            varying vec2 vUv;
            float sdSet(vec2 p, int n, int row) {
              float d = uR;
              for (int i = 0; i < n; i++) {
                vec4 r = texelFetch(uRectTex, ivec2(2 * i, row), 0);
                vec2 a = texelFetch(uRectTex, ivec2(2 * i + 1, row), 0).xy;
                vec2 e = p - r.xy;
                vec2 q = abs(vec2(dot(e, a), dot(e, vec2(-a.y, a.x)))) - r.zw;
                d = min(d, length(max(q, 0.0)) + min(max(q.x, q.y), 0.0));
              }
              return d;
            }
            void main() { vec2 p = uField.xy + vUv * uField.zw; gl_FragColor = vec4(sdSet(p, int(uN.x), 0), sdSet(p, int(uN.y), 1), 0.0, 1.0); }`}),this._fieldQuad=new oe(new It(2,2),this._fieldMat),this._fieldQuad.frustumCulled=!1,this._fieldScene=new Ke,this._fieldScene.add(this._fieldQuad),this._fieldCam=new ct(-1,1,1,-1,0,1));let A=this._fieldMat.uniforms;A.uRectTex.value=z,A.uN.value.set(t.length,e.length),A.uField.value.set(c,b,m*h,x*h),(!this._fieldRT||this._fieldRT.width!==m||this._fieldRT.height!==x)&&(this._fieldRT?.dispose(),this._fieldRT=new Ve(m,x,{type:Ge,format:Ee,depthBuffer:!1,stencilBuffer:!1,generateMipmaps:!1,minFilter:fe,magFilter:fe,colorSpace:Me}));let H=this.renderer,I=H.getRenderTarget(),G=H.xr.enabled;H.xr.enabled=!1,H.setRenderTarget(this._fieldRT),H.render(this._fieldScene,this._fieldCam),H.setRenderTarget(I),H.xr.enabled=G,z.dispose(),o.uDeckField.value=this._fieldRT.texture,this.fieldBakeMs=performance.now()-_}o.uDeckFieldRect.value.set(c,b,1/(m*h),1/(x*h)),o.uDeckFieldK.value.set(h,n,0,0),o.uDeckBox.value.set(...E),o.uWetBox.value.set(...y)}_writeRects(t=this.footprint){let e=this.U;t.forEach((o,s)=>{e.uRects.value[s].set(o.cx,o.cz,o.hx,o.hz),e.uRectAx.value[s].set(o.ax,o.az)}),e.uRectCount.value=t.length}_writeWet(t){let e=this.U;t.forEach((o,s)=>{e.uWet.value[s].set(o.cx,o.cz,o.hx,o.hz),e.uWetAx.value[s].set(o.ax,o.az)}),e.uWetCount.value=t.length}_buildLights(){let t=new Zt(16777215,3);t.name="Sun",t.castShadow=!0,t.shadow.mapSize.set(this.shadowSize,this.shadowSize),t.shadow.radius=2.2*(this.shadowSize/4096)+.8;let e=(this.bounds.minX+this.bounds.maxX)/2,o=(this.bounds.minZ+this.bounds.maxZ)/2;t.target.position.set(e,0,o),this.scene.add(t,t.target),this.sun=t,this.hemi=new Bt(16777215,8947848,.5),this.hemi.name="SkyFill",this.scene.add(this.hemi)}_fitShadow(){let t=this.bounds,e=6,o=(t.minX+t.maxX)/2,s=(t.minZ+t.maxZ)/2,n=this.U.uSunDir.value,u=new Q(o,0,s),E=u.clone().addScaledVector(n,160);this.sun.position.copy(E),this.sun.target.position.copy(u),this.sun.target.updateMatrixWorld();let y=new ze().lookAt(E,u,new Q(0,1,0)),c=new ze().makeTranslation(E.x,E.y,E.z).multiply(y).invert(),b=1/0,R=-1/0,T=1/0,h=-1/0,m=1/0,x=-1/0,D=new Q;for(let z of[t.minX-e,t.maxX+e])for(let A of[W-.3,14])for(let H of[t.minZ-e,t.maxZ+e])D.set(z,A,H).applyMatrix4(c),b=Math.min(b,D.x),R=Math.max(R,D.x),T=Math.min(T,D.y),h=Math.max(h,D.y),m=Math.min(m,D.z),x=Math.max(x,D.z);let _=this.sun.shadow.camera;_.left=b,_.right=R,_.bottom=T,_.top=h,_.near=Math.max(.5,-x-30),_.far=-m+2,_.updateProjectionMatrix();let M=_.far-_.near;this.sun.shadow.bias=-.025/M;let S=Math.max(R-b,h-T)/this.shadowSize;this.sun.shadow.normalBias=Math.max(.012,S*1.4),this.sun.shadow.needsUpdate=!0}_buildSky(){let t=new Ye(1,48,24),e=s=>new Te({name:s?"SkyEnv":"Sky",uniforms:this.U,vertexShader:no,fragmentShader:io,side:gt,depthWrite:!1,depthTest:!s,depthFunc:zt,fog:!1,defines:s?{ENV_PASS:""}:{}});this.skyMat=e(!1),this.sky=new oe(t,this.skyMat),this.sky.name="SkyDome",this.sky.frustumCulled=!1,this.sky.renderOrder=9e3,this._initCloudBake(),this.root.add(this.sky),this._envScene=new Ke;let o=new oe(t,e(!0));o.frustumCulled=!1,this._envScene.add(o),this._pmrem=new Xt(this.renderer)}_initCloudBake(){this._cloudRT=new Ve(ht,$e,{type:Ge,format:Ee,colorSpace:Me,minFilter:fe,magFilter:fe,generateMipmaps:!1,wrapS:at,wrapT:Rt,depthBuffer:!1,stencilBuffer:!1}),this.U.uCloudTex.value=this._cloudRT.texture,this._cloudMat=new Te({name:"CloudBake",vertexShader:"void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:ao,uniforms:{...this.U,uRes:{value:new ke(ht,$e)},uSunCol:{value:new K},uSeed:{value:3},uCov:{value:.46}},depthTest:!1,depthWrite:!1,toneMapped:!1});let t=new ve;t.setAttribute("position",new ne([-1,-1,0,3,-1,0,-1,3,0],3));let e=new oe(t,this._cloudMat);e.frustumCulled=!1,this._cloudScene=new Ke,this._cloudScene.add(e),this._cloudCam=new ct(-1,1,1,-1,0,1)}_bakeClouds(t){let e=this.renderer,o=this._cloudMat.uniforms;o.uSunCol.value.copy(Le(t.sunColor,(t.skySun??t.sunIntensity)/2.75)),o.uCov.value=t.cloudCov??.46,o.uSeed.value=t.cloudSeed??3;let s=e.getRenderTarget(),n=e.autoClear,u=e.xr.enabled;e.autoClear=!1,e.xr.enabled=!1;let E=this._cloudRT;e.setRenderTarget(E),e.setClearColor(0,0),e.clear(!0,!1,!1);let y=10,c=Math.ceil($e/y);E.scissorTest=!0;for(let b=0;b<y;b++)E.scissor.set(0,b*c,ht,Math.min(c,$e-b*c)),e.setRenderTarget(E),e.render(this._cloudScene,this._cloudCam);E.scissorTest=!1,e.setRenderTarget(s),e.autoClear=n,e.xr.enabled=u}_rebuildEnvMap(){let t=this._envRT;this._envRT=this._pmrem.fromScene(this._envScene,0,.1,100,{size:256});let e=this.envMap;this.envMap=this._envRT.texture,(this.scene.environment===e||this.scene.environment==null)&&(this.scene.environment=this.envMap),t&&t.dispose()}_buildSea(){this.U.uWaveTex.value=Ho(256,11);let t=[0],e=1.5;for(;e<6e3;)t.push(e),e=e*1.1+.5;t.push(6e3);let o=128,s=[],n=[];s.push(0,0,0);for(let y=1;y<t.length;y++)for(let c=0;c<o;c++){let b=c/o*Math.PI*2;s.push(Math.cos(b)*t[y],0,Math.sin(b)*t[y])}for(let y=0;y<o;y++)n.push(0,1+(y+1)%o,1+y);for(let y=1;y<t.length-1;y++){let c=1+(y-1)*o,b=1+y*o;for(let R=0;R<o;R++){let T=(R+1)%o;n.push(c+R,c+T,b+T,c+R,b+T,b+R)}}let u=new ve;u.setAttribute("position",new ne(s,3)),u.setAttribute("normal",new ne(new Float32Array(s.length).map((y,c)=>c%3===1?1:0),3)),u.setIndex(n);let E={...rt.clone(lt.lights),...this.U};this.seaMat=new Te({name:"Sea",uniforms:E,vertexShader:lo,fragmentShader:ho,lights:!0,fog:!1}),this.sea=new oe(u,this.seaMat),this.sea.name="Sea",this.sea.position.y=W,this.sea.frustumCulled=!1,this.sea.receiveShadow=!0,this.sea.renderOrder=-1,this.sea.onBeforeRender=(y,c,b)=>this._renderReflection(y,c,b),this.root.add(this.sea)}_renderReflection(t,e,o){let s=this.U;if(!this._marina||this._reflBusy||e.overrideMaterial||this._reflFrame===this._frameId)return;this._reflFrame=this._frameId;let n=ge.settings?.quality||"high",u=!this.reflections||n==="low"?0:(n==="medium"?.28:n==="ultra"?.5:.4)*(this.reflScale??1),E=Je[0].setFromMatrixPosition(o.matrixWorld);if(!u||E.y<W+.05){s.uReflOn.value=0;return}this._reflRT||(this._reflRT=new Ve(64,64,{type:Ge,format:Ee,colorSpace:Me,depthBuffer:!0,stencilBuffer:!1,minFilter:Xe,magFilter:fe,generateMipmaps:!0}),this._reflRT.texture.name="SeaReflection",this._reflCam=new Wt,this._reflCam.matrixAutoUpdate=!0,s.uReflTex.value=this._reflRT.texture);let y=this._reflRT,c=this._reflCam;t.getDrawingBufferSize(ft);let b=Math.max(64,Math.round(ft.x*u)),R=Math.max(64,Math.round(ft.y*u));(y.width!==b||y.height!==R)&&y.setSize(b,R);let T=Je[1].set(0,0,-1).transformDirection(o.matrixWorld),h=Je[2].set(0,1,0).transformDirection(o.matrixWorld);T.y=-T.y,h.y=-h.y,c.position.set(E.x,2*W-E.y,E.z),c.up.copy(h),c.lookAt(Je[3].copy(c.position).add(T)),c.updateMatrixWorld(!0),c.layers.mask=o.layers.mask,c.projectionMatrix.copy(o.projectionMatrix),Se.normal.set(0,1,0),Se.constant=-W,Se.applyMatrix4(c.matrixWorldInverse);let m=Kt[0].set(Se.normal.x,Se.normal.y,Se.normal.z,Se.constant),x=c.projectionMatrix.elements,D=Kt[1].set((Math.sign(m.x)+x[8])/x[0],(Math.sign(m.y)+x[9])/x[5],-1,(1+x[10])/x[14]);m.multiplyScalar(2/m.dot(D)),x[2]=m.x,x[6]=m.y,x[10]=m.z+1,x[14]=m.w,c.projectionMatrixInverse.copy(c.projectionMatrix).invert(),s.uReflMat.value.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(c.projectionMatrix).multiply(c.matrixWorldInverse);let _=t.getRenderTarget(),M=t.xr.enabled,S=t.shadowMap.autoUpdate,z=t.shadowMap.needsUpdate;t.getClearColor(qt);let A=t.getClearAlpha(),H=[this.sea,this.sky,this.lhBeam,this.city,this.terrain,this.staticScenery,this.ferris,this.trees,this.sailInst,this.gullInst];if(n!=="ultra"){for(let G of ge.actors||[])G.character&&G.character.root&&H.push(G.character.root);H.push(...this._reflSkips(e))}for(let G=H.length-1;G>=0;G--)H[G]||H.splice(G,1);let I=H.map(G=>G.visible);this._reflBusy=!0;try{for(let G of H)G.visible=!1;t.xr.enabled=!1,t.shadowMap.autoUpdate=!1,t.shadowMap.needsUpdate=!1,t.setRenderTarget(y),t.setClearColor(0,0),t.clear(!0,!0,!1),t.render(e,c)}finally{H.forEach((G,k)=>{G.visible=I[k]}),t.xr.enabled=M,t.shadowMap.autoUpdate=S,t.shadowMap.needsUpdate=z,t.setClearColor(qt,A),t.setRenderTarget(_),this._reflBusy=!1}s.uReflOn.value=1}_bakeFarReflection(){let t=this.U;if(!this._marina){t.uFarOn.value=0;return}let e=this.renderer;this._farRT||(this._farRT=new Ut(512,{type:Ge,format:Ee,colorSpace:Me,generateMipmaps:!0,minFilter:Xe,magFilter:fe}),this._farRT.texture.name="FarReflection",this._farCam=new Nt(2,3e4,this._farRT),t.uFarCube.value=this._farRT.texture);let o=new Set([this.terrain,this.city,this.staticScenery,this.ferris,this.trees].filter(Boolean)),s=[];for(let T of this.scene.children)T!==this.root&&T.visible&&!T.isLight&&(T.visible=!1,s.push(T));for(let T of this.root.children)T.visible&&!o.has(T)&&(T.visible=!1,s.push(T));let n=this.bounds;this._farCam.position.set((n.minX+n.maxX)/2,W+1.5,(n.minZ+n.maxZ)/2),this._farCam.updateMatrixWorld(!0);let u=e.getRenderTarget(),E=e.autoClear,y=e.getClearColor(new K),c=e.getClearAlpha(),b=e.shadowMap.autoUpdate,R=e.shadowMap.needsUpdate;try{e.shadowMap.autoUpdate=!1,e.shadowMap.needsUpdate=!this.sun.shadow.map,e.autoClear=!0,e.setClearColor(0,0),this._farCam.update(e,this.scene)}finally{for(let T of s)T.visible=!0;e.setClearColor(y,c),e.autoClear=E,e.setRenderTarget(u),e.shadowMap.autoUpdate=b,e.shadowMap.needsUpdate=R}t.uFarOn.value=1}_reflSkips(t){let e=t.children.find(n=>n.name==="props"),o=t.children.length+":"+(e?e.uuid+e.children.length:"-");if(this._reflSkipKey===o)return this._reflSkipList;let s=[];for(let n of t.children)(n.name==="FX"||n.name==="decor")&&s.push(n);if(e)for(let n of e.children)/glow|blink|flags|spin:|fence|blob|foliage/.test(n.name||"")&&s.push(n);return this._reflSkipKey=o,this._reflSkipList=s,s}_stageMarina(){let t=ge.level&&ge.level.layout;return!!(t&&(t.water==="marina"||t.id==="halyard"))}_marinaSets(){let t=ge.level,e=[],o=[];if(t)for(let s of t.blocks){if(!s.solid||s.hidden||s.grate)continue;let n=s.aabbMin,u=s.aabbMax,E=n.y<W-.02&&u.y>-30,y=!E&&n.y>=W-.02&&n.y<W+.9;if(!E&&!y)continue;let c=Mo(s);c&&(c.y0=n.y,c.y1=u.y,(E?o:e).push(c))}return{decks:e,wet:o}}_applyMarina(){let t=this.U;this.marinaFx&&(this.root.remove(this.marinaFx),this.marinaFx.traverse(s=>{s.geometry&&s.geometry.dispose()}),this.marinaFx=null);let e=this._marina;if("MARINA"in this.seaMat.defines!==e&&(e?this.seaMat.defines.MARINA="":delete this.seaMat.defines.MARINA,this.seaMat.needsUpdate=!0),!e){this._marinaData=null,t.uWetCount.value=0,t.uReflOn.value=0,this._syncDeckShading();return}let o=this._marinaData=this._marinaSets();t.uArena.value.set(this.bounds.minX,this.bounds.minZ,this.bounds.maxX,this.bounds.maxZ),this._syncDeckShading(),this._buildFoamField([...this._foamShapes||[],...this._waterContours(o.wet)]),this._buildMarinaFx(o)}_buildMarinaFx(t){let e=ge.level;if(!e)return;let o=new it;o.name="MarinaWaterline";let s=(h,m)=>!t.decks.some(x=>Qe(x,h,m))&&!t.wet.some(x=>Qe(x,h,m)),n=[],u=[],E=[],y=(h,m,x,D,_,M,S)=>{n.push(...h,...m,...x,...h,...x,...D);for(let z=0;z<6;z++)u.push(_.x,_.y,_.z),E.push(M.r,M.g,M.b,S)},c=.012;for(let h of e.faces){let m=e.blocks[h.block];if(!h.wall||!m.aligned&&Math.abs(m.axes[1].y)<.9999||m.hidden||m.grate||!m.solid)continue;let x=m.aabbMin.y,D=m.aabbMax.y,_=x<W-.02&&D>W+.02,M=!_&&x>=W-.02&&x<W+.9;if(!_&&!M)continue;let S=_?.035:c,z=_?W-.1:x+.004,A=Math.min(_?D-.16:D-.36,_?W+1.7:x+1.15);if(A<z+.15)continue;let H=h.n,I=h.u,G=Math.max(2,Math.ceil(h.su/.2)),k=h.su/G,a=(i,l)=>{let g=i<.01?.15:.03,v=l>h.su-.01?.15:.03;if(i+=g,l-=v,l-i<.25)return;let p=(F,w)=>[h.origin.x+I.x*F+H.x*S,w,h.origin.z+I.z*F+H.z*S];y(p(i,z),p(l,z),p(l,A),p(i,A),H,h.color,_?1:0)},f=-1;for(let i=0;i<=G;i++){let l=i*k,g=s(h.origin.x+I.x*l+H.x*.3,h.origin.z+I.z*l+H.z*.3);g&&f<0&&(f=l),f>=0&&(!g||i===G)&&(a(f,g?l:l-k),f=-1)}}let b=[],R=new Q(0,-1,0),T=new K("#2e2923");for(let h of t.decks){let m=h.y0-.002,x=.004,D,_,M,S;if(h.aligned)D=[h.minX+x,m,h.minZ+x],_=[h.maxX-x,m,h.minZ+x],M=[h.maxX-x,m,h.maxZ-x],S=[h.minX+x,m,h.maxZ-x];else{let A=(G,k)=>{let a=De(h,G,k);return[a[0],m,a[1]]},H=h.hx-x,I=h.hz-x;D=A(-H,-I),_=A(H,-I),M=A(H,I),S=A(-H,I)}b.push(...D,..._,...M,...D,...M,...S);let z=m-.006;y([D[0],z,D[2]],[_[0],z,_[2]],[M[0],z,M[2]],[S[0],z,S[2]],R,T.clone().multiplyScalar(4),0)}if(b.length){let h=new ve;h.setAttribute("position",new ne(b,3)),h.computeVertexNormals();let m=new oe(h,this._underMat||(this._underMat=new ce({color:T,roughness:.95,metalness:0})));m.name="SlabUndersides",o.add(m)}if(n.length){let h=new ve;if(h.setAttribute("position",new ne(n,3)),h.setAttribute("normal",new ne(u,3)),h.setAttribute("aInfo",new ne(E,4)),!this._stripMat){let x={...rt.clone(lt.lights),uTime:this.U.uTime,uSunDir:this.U.uSunDir,uSunLight:this.U.uSunLight,uStripK:this.U.uStripK};this._stripMat=new Te({name:"Waterline",uniforms:x,vertexShader:yo,fragmentShader:bo,lights:!0,fog:!1,transparent:!0,depthWrite:!1,blending:yt,blendEquation:bt,blendSrc:st,blendDst:Mt,blendSrcAlpha:Et,blendDstAlpha:st,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-4})}let m=new oe(h,this._stripMat);m.name="WaterlineStrips",m.receiveShadow=!0,m.frustumCulled=!1,o.add(m)}this.marinaFx=o,this.root.add(o)}_buildFoamField(t){let e=this._marina,o=this.bounds,s=22,n=e?.1:.2,u=e?2.5:8,E=o.minX-s,y=o.minZ-s,c=Math.ceil((o.maxX-o.minX+s*2)/n),b=Math.ceil((o.maxZ-o.minZ+s*2)/n),R=new Uint8Array(c*b).fill(255),T=(m,x,D,_,M,S)=>{let z=M-D,A=S-_,H=z*z+A*A,I=H>0?Math.min(1,Math.max(0,((m-D)*z+(x-_)*A)/H)):0;return Math.hypot(m-D-z*I,x-_-A*I)};for(let m of t){let x=m.r+(m.reach??3),D=Math.max(0,Math.floor((Math.min(m.ax,m.bx)-x-E)/n)),_=Math.min(c-1,Math.ceil((Math.max(m.ax,m.bx)+x-E)/n)),M=Math.max(0,Math.floor((Math.min(m.az,m.bz)-x-y)/n)),S=Math.min(b-1,Math.ceil((Math.max(m.az,m.bz)+x-y)/n));for(let z=M;z<=S;z++)for(let A=D;A<=_;A++){let H=E+(A+.5)*n,I=y+(z+.5)*n,G=Math.max(0,T(H,I,m.ax,m.az,m.bx,m.bz)-m.r),k=Math.min(255,Math.round(G/u*255)),a=z*c+A;k<R[a]&&(R[a]=k)}}let h=new qe(R,c,b,St,nt);h.unpackAlignment=1,h.magFilter=fe,h.minFilter=fe,h.colorSpace=Me,h.needsUpdate=!0,this.U.uFoamTex.value&&this.U.uFoamTex.value.dispose(),this.U.uFoamTex.value=h,this.U.uFoamRect.value.set(E,y,1/(c*n),1/(b*n)),this.U.uMarinaK.value.w=u}_waterContours(t){let e=[],o=this.bounds,s=21,n=o.minX-s,u=o.maxX+s,E=o.minZ-s,y=o.maxZ+s,c=W,b=new Q,R=new Q,T=new Q,h=[],m=(M,S)=>t.some(z=>Qe(z,M,S,.12)),x=(M,S)=>{let z=(c-M.y)/(S.y-M.y);h.push(M.x+(S.x-M.x)*z,M.z+(S.z-M.z)*z)},D=(M,S)=>{let z=M.attributes.position,A=M.index;if(!z)return;M.boundingBox||M.computeBoundingBox();let H=To.copy(M.boundingBox);if(S&&H.applyMatrix4(S),H.min.y>c||H.max.y<c||H.max.x<n||H.min.x>u||H.max.z<E||H.min.z>y)return;let I=A?A.count:z.count;for(let G=0;G+2<I;G+=3){let k=A?A.getX(G):G,a=A?A.getX(G+1):G+1,f=A?A.getX(G+2):G+2;if(!S){let F=z.getY(k)-c,w=z.getY(a)-c,C=z.getY(f)-c;if(F>0&&w>0&&C>0||F<=0&&w<=0&&C<=0)continue}b.fromBufferAttribute(z,k),R.fromBufferAttribute(z,a),T.fromBufferAttribute(z,f),S&&(b.applyMatrix4(S),R.applyMatrix4(S),T.applyMatrix4(S));let i=b.y>c,l=R.y>c,g=T.y>c;if(i===l&&l===g||(h.length=0,i!==l&&x(b,R),l!==g&&x(R,T),g!==i&&x(T,b),h.length!==4))continue;let v=(h[0]+h[2])/2,p=(h[1]+h[3])/2;v<n||v>u||p<E||p>y||m(v,p)||e.push({ax:h[0],az:h[1],bx:h[2],bz:h[3],r:0,reach:1.6})}},_=new ze;for(let M of this.scene.children)M===this.root||M.name!=="props"||(M.updateMatrixWorld(!0),M.traverse(S=>{if(!(!S.isMesh||!S.geometry||S.visible===!1))if(S.isInstancedMesh)for(let z=0;z<S.count;z++)S.getMatrixAt(z,_),_.premultiply(S.matrixWorld),D(S.geometry,_);else D(S.geometry,S.matrixWorld.equals(So)?null:S.matrixWorld)}));return e}_insideFootprint(t,e){return this.footprint.some(o=>Qe(o,t,e))}_insideBounds(t,e){let o=this.bounds;return t>o.minX+.01&&t<o.maxX-.01&&e>o.minZ+.01&&e<o.maxZ-.01}_boundaryRuns(){let t=[];for(let e of this.footprint)for(let o of Ro(e)){let s=Math.hypot(o.bx-o.ax,o.bz-o.az),n=.25,u=-1,E=Math.floor(s/n);for(let y=0;y<=E;y++){let c=y*n,b=c/s,R=o.ax+(o.bx-o.ax)*b,T=o.az+(o.bz-o.az)*b,h=!this._insideFootprint(R+o.nx*.05,T+o.nz*.05);if(h&&u<0&&(u=c),u>=0&&(!h||y===E)){let m=h?c:c-n;m-u>.6&&t.push({...o,len:s,s0:u,s1:m}),u=-1}}}return t}_buildDock(){let t=this.bounds,e=this._marina,o=this._boundaryRuns();this._runs=o;let s=[],n=[];for(let a of e?[]:o){let f=(a.bx-a.ax)/a.len,i=(a.bz-a.az)/a.len,l=a.s1-a.s0,g=Math.max(2,Math.round(l/3.4)+1);for(let v=0;v<g;v++){let p=a.s0+.3+(l-.6)*(v/(g-1)),F=a.ax+f*p,w=a.az+i*p,C=F+a.nx*.24,P=w+a.nz*.24,B=-.07,N=.2;this._insideBounds(C,P)&&(C=F-a.nx*.45,P=w-a.nz*.45,B=-1.2,N=.24),s.push([C,P,N,B]),n.push({ax:C,az:P,bx:C,bz:P,r:N})}}for(let a of this.footprint)if(a.aligned)for(let f=a.minX+3.5;f<=a.maxX-3.5;f+=7)for(let i=a.minZ+3.5;i<=a.maxZ-3.5;i+=7)s.push([f,i,.3,-1.2]);else for(let f=-a.hx+3.5;f<=a.hx-3.5+1e-6;f+=7)for(let i=-a.hz+3.5;i<=a.hz-3.5+1e-6;i+=7){let[l,g]=De(a,f,i);s.push([l,g,.3,-1.2])}let u=e||ge.level?.layout?.envBoats===!1?[]:[{kind:"fishing",x:t.maxX+3.25,z:t.minZ+(t.maxZ-t.minZ)*.77,yaw:0},{kind:"launch",x:t.minX-2.85,z:t.minZ+(t.maxZ-t.minZ)*.2,yaw:Math.PI},{kind:"row",x:t.minX-1.75,z:t.minZ+(t.maxZ-t.minZ)*.86,yaw:.12}];this._mooredSpec=u;let E=(a,f,i,l)=>{let g=null,v=8;for(let p of o){if(p.nx*i+p.nz*l<.5)continue;let F=(p.bx-p.ax)/p.len,w=(p.bz-p.az)/p.len,C=Math.min(p.s1,Math.max(p.s0,(a-p.ax)*F+(f-p.az)*w)),P=p.ax+F*C,B=p.az+w*C,N=Math.hypot(P-a,B-f);N<v&&(v=N,g={x:P,z:B,nx:p.nx,nz:p.nz})}return g&&v<1e-6&&g.nx===i&&g.nz===l?{x:a,z:f,nx:i,nz:l}:g},y=a=>c.push(d(j(new Re(.09,.02,5,10),"#8d969e"),a.x+a.nx*.04,-.36,a.z+a.nz*.04,a.nz===0?Math.PI/2:Math.atan2(a.nx,a.nz))),c=[],b=(a,f,i=.35,l=.035)=>c.push(dt(_o(a,f,i),l,"#dccaa0")),R=(a,f,i=-.28)=>{for(let l=0;l<3;l++){let g=l*2.094+.3;s.push([a+Math.cos(g)*.42,f+Math.sin(g)*.42,.22,i-.25])}return n.push({ax:a,az:f,bx:a,bz:f,r:.7}),c.push(d(L(1.5,.45,1.5,"#d6cfc2"),a,i,f)),c.push(d(L(1.56,.08,1.56,"#b8b0a2"),a,i-.26,f)),c.push(d(Z(.16,.19,.38,10,"#44505b"),a,i+.41,f)),c.push(d(Z(.26,.22,.12,12,"#f1c95a"),a,i+.62,f)),[a,i+.45,f]};for(let a of u){let f=a.kind==="fishing"?8.6:a.kind==="launch"?6.4:3.4,i=a.x>0?1:-1,l=Math.cos(a.yaw)>=0?1:-1;n.push({ax:a.x,az:a.z-f*.46,bx:a.x,bz:a.z+f*.46,r:a.kind==="row"?.55:1.05});let g=i>0?t.maxX:t.minX;if(a.kind!=="row"){let v=R(a.x+i*.4,a.z+l*(f*.5+3.2)),p=R(a.x+i*.4,a.z-l*(f*.5+3.2)),F=a.kind==="fishing"?1.15:.85,w=[a.x,W+F+.35,a.z+l*f*.42],C=[a.x,W+F+.05,a.z-l*f*.44];b(w,v,.35),b(C,p,.35);let P=E(g,a.z+2.8,i,0),B=E(g,a.z-3.2,i,0);P&&b([a.x-i*1,W+F,a.z+1],[P.x+P.nx*.06,-.3,P.z+P.nz*.06],.2),B&&b([a.x-i*1,W+F,a.z-1.4],[B.x+B.nx*.06,-.3,B.z+B.nz*.06],.2);for(let N of[P,B])N&&y(N)}else{let v=E(g,a.z+2.6,i,0);v&&(b([a.x,W+.5,a.z+1.5],[v.x+v.nx*.06,-.3,v.z+v.nz*.06],.25,.025),y(v))}}let T=[];for(let a of e?[]:o){let f=(a.bx-a.ax)/a.len,i=(a.bz-a.az)/a.len,l=a.ax+f*(a.s0+a.s1)/2+a.nx*.3,g=a.az+i*(a.s0+a.s1)/2+a.nz*.3;if(!this._insideBounds(l,g))for(let v=a.s0+2.1;v<a.s1-1.5;v+=6.8)T.push({run:a,s:v,dx:f,dz:i})}let h=new Re(.34,.13,6,12);T.forEach(a=>{let{run:f,s:i,dx:l,dz:g}=a,v=f.ax+l*i+f.nx*.16,p=f.az+g*i+f.nz*.16,F=Math.atan2(f.nx,f.nz);c.push(d(j(h.clone(),"#3b3f47"),v,-.66,p,F)),c.push(d(Z(.022,.022,.42,5,"#d8c69c"),v+f.nx*.02,-.12,p+f.nz*.02))});let m=(a,f,i,l)=>{let g=Math.atan2(i,l),v=Math.cos(g),p=-Math.sin(g),F=.08;for(let w of[-.28,.28])c.push(d(Z(.035,.035,2.3,6,"#aab3bb"),a+i*F+v*w,-.95,f+l*F+p*w));for(let w=-1.9;w<0;w+=.32)c.push(d(Z(.025,.025,.56,5,"#aab3bb"),a+i*F,w,f+l*F,g,0,Math.PI/2));c.push(dt([[a+i*F+v*.28,-.1,f+l*F+p*.28],[a+i*.02+v*.28,.02,f+l*.02+p*.28]],.035,"#aab3bb"))};if(u.length)for(let[a,f,i]of[[t.maxX,u[0].z-5.5,1],[t.minX,u[1].z+4.5,-1]]){let l=E(a,f,i,0);l&&m(l.x,l.z,l.nx,l.nz)}let x=ee([j(new Ie(1,1,1,9,1,!0),"#ffffff"),d(j(new Dt(1,9),"#ffffff"),0,.5,0,0,-Math.PI/2)]);d(x,0,.5,0),jt(x,(a,f,i,l,g)=>g>.5?new K("#e3d8c4"):null);let D=de(new ce({vertexColors:!0,roughness:.85,metalness:0}),this.U,{waterline:!0}),_=new Fe(x,D,s.length),M=tt(5),S=new K("#b99c7d"),z=new K("#a88d74"),A=new K("#b7b3aa"),H=new K,I=W-3.5;s.forEach((a,f)=>{let i=a[3]-I;ae.compose(ye.set(a[0],I,a[1]),xe.setFromEuler(pe.set(0,M()*6,0)),be.set(a[2],i,a[2])),_.setMatrixAt(f,ae),a[2]>=.29?H.copy(A):H.copy(S).lerp(z,M()),_.setColorAt(f,H)}),_.name="Pilings",_.receiveShadow=!0,_.castShadow=!0,_.computeBoundingSphere(),this.root.add(_),this.pilings=_;let G=de(new ce({vertexColors:!0,roughness:.7,metalness:.05}),this.U,{waterline:!0});this.dockProps=new oe(c.length?ee(c):new ve,G),this.dockProps.name="DockProps",this.dockProps.receiveShadow=!0,this.dockProps.castShadow=!0,this.root.add(this.dockProps);let k=de(new ce({vertexColors:!0,roughness:.58,metalness:0}),this.U,{waterline:!0});this.moored=[];for(let a of u){let f=a.kind==="fishing"?this._fishingBoatGeo():a.kind==="launch"?this._launchGeo():this._rowboatGeo(),i=new oe(f,k);i.name="Moored_"+a.kind,i.castShadow=!0,i.receiveShadow=!0,i.position.set(a.x,W,a.z),i.rotation.y=a.yaw,this.root.add(i),this.moored.push({mesh:i,spec:a,phase:M()*10,roll:a.kind==="row"?.05:.025})}this._foamShapes=n}_fishingBoatGeo(){let t=[et({L:8.6,B:2.9,D:.75,F:1.15,sheer:.55,hull:"#f4f1ea",stripe:"#5f93b8",bottom:"#d0675c",deck:"#d7c29c"})];t.push(d(L(2,1.6,2.2,"#f7f5f0"),0,1.85,-.9)),t.push(d(L(2.25,.14,2.5,"#5f93b8"),0,2.72,-.9));for(let e of[-1.01,1.01])t.push(d(L(.04,.6,1.5,"#23364a"),e,2.1,-.9));return t.push(d(L(1.6,.6,.04,"#23364a"),0,2.1,.21)),t.push(d(Z(.06,.08,3.6,6,"#e8e4dc"),0,3.9,-.6)),t.push(te(0,3.2,-.6,0,1.6,3.2,.08,"#e8e4dc")),t.push(d(L(.9,.08,.2,"#dfe3e6"),0,5.2,-.6)),t.push(d(q(.1,8,6,"#ffe7b0",1),0,5.75,-.6)),t.push(d(Z(.45,.45,1.3,12,"#6b8f6a"),0,1.45,-3.1,0,0,Math.PI/2)),t.push(d(L(.7,.35,.5,"#f0a66b"),.6,1.2,2)),t.push(d(L(.7,.35,.5,"#8cc3d9"),-.5,1.2,2.3)),t.push(d(j(new Re(.28,.07,6,14),"#ff7f5c"),1.03,1.9,-1.2,Math.PI/2)),ee(t)}_launchGeo(){let t=[et({L:6.4,B:2.3,D:.55,F:.85,sheer:.4,hull:"#dff0ec",stripe:"#e98b6d",bottom:"#3d5c7a",deck:"#e7dcc6"})];t.push(d(L(1.6,.9,1.4,"#fbfaf7"),0,1.25,.4)),t.push(te(-.75,1.7,1.1,.75,1.7,1.1,.05,"#2a3b4d")),t.push(d(L(1.5,.5,.05,"#23364a"),0,1.95,1.05,0,-.5)),t.push(d(L(1.8,.08,1.6,"#e98b6d"),0,2.15,.2));for(let e of[-.8,.8])t.push(d(Z(.03,.03,.75,5,"#d0d6da"),e,1.78,-.45));return t.push(d(L(.45,.9,.5,"#3a3f47"),0,.85,-3.35)),t.push(d(L(1.9,.08,1.6,"#e7dcc6"),0,.85,-1.9)),ee(t)}_rowboatGeo(){let t=[et({L:3.4,B:1.35,D:.3,F:.45,sheer:.18,hull:"#f2d38b",stripe:"#c8745b",bottom:"#8e5b4a",deck:"#b58b62"})];for(let e of[-.6,.45])t.push(d(L(1.2,.06,.28,"#b58b62"),0,.42,e));return t.push(te(-.5,.52,-.2,.9,.3,1.2,.05,"#d9b98c")),t.push(te(.5,.52,-.2,-.3,.35,1.3,.05,"#d9b98c")),ee(t)}_buildScenery(){let t=this.U,e=[],o=de(new ce({vertexColors:!0,roughness:.92,metalness:0}),t,{shore:!0}),s=tt(42),n=[],u=[],E=w=>{let C=Co(w);return u.push(C.geo),n.push({...w,isl:C}),C},[y,c]=ie(22,900),b=E({x:y,z:c,rx:600,rz:360,h:3.2,seed:3,rot:112*me,plateau:!0,R:10,S:56,grass:"#c5d3ac"});this._cityIsland=b,this._cityFrame={cx:y,cz:c,rot:112*me};for(let[w,C,P,B,N]of[[8,1450,420,210,11],[40,1520,380,260,12],[68,1380,300,170,13],[-22,1320,330,150,14],[95,1600,360,230,15]]){let[X,se]=ie(w,C);E({x:X,z:se,rx:P,rz:P*.62,h:B*.85,seed:N,rot:(w+90)*me,R:20,S:84,grass:"#7fb86f",ridge:.4})}let R=[{a:178,d:640,rx:250,rz:120,h:72,seed:21,trees:60},{a:236,d:300,rx:42,rz:30,h:13,seed:22,trees:14},{a:300,d:470,rx:95,rz:60,h:28,seed:23,trees:22},{a:94,d:1080,rx:220,rz:150,h:62,seed:24,trees:26},{a:153,d:1e3,rx:240,rz:160,h:70,seed:25,trees:30},{a:188,d:1500,rx:380,rz:200,h:120,seed:26},{a:262,d:1350,rx:420,rz:180,h:150,seed:27},{a:318,d:1600,rx:380,rz:200,h:210,seed:28},{a:232,d:1750,rx:300,rz:150,h:90,seed:29}];for(let w of R){let[C,P]=ie(w.a,w.d),B=w.rx>150,N=E({x:C,z:P,rx:w.rx,rz:w.rz,h:w.h,seed:w.seed,rot:(w.a+90)*me+(Ae(w.seed,1)-.5),R:B?20:12,S:B?84:48,ridge:w.h>100?.4:.25,grass:w.h>100?"#7fb86f":"#8fca74"});w.isl=N}let[T,h]=ie(248,178),x=E({x:T,z:h,rx:24,rz:17,h:7.5,seed:31,rot:.4,R:9,S:32,ridge:.6,grass:"#a7cf8a"}).heightAt(T,h);this._buildLighthouse(e,T,x-.3,h);let[D,_]=ie(-52,335),M=Math.atan2(-D,-_),S=W+2.7,z=d(L(210,S-W+6,80,"#cfc9bd"),D,(S+W-6)/2,_,M);e.push(z);let A=(w,C)=>{let P=Math.cos(M),B=Math.sin(M);return[D+w*P+C*B,_-w*B+C*P]},H=["#e8927f","#6fa6cf","#e8927f"];[-55,0,55].forEach((w,C)=>{let[P,B]=A(w,30);e.push(this._craneGeo(P,S,B,M,H[C]))});let I=["#e9967a","#7fb8c9","#e8c56b","#a99fd3","#8fcf9f","#f2efe8","#d97f8f","#6f9fd8"];for(let w=0;w<7;w++)for(let C=0;C<12;C++){if(s()<.18)continue;let P=1+Math.floor(s()*4),B=-85+C*14.5,N=-25+w*3.1;for(let X=0;X<P;X++){let[se,re]=A(B+(s()-.5)*.6,N);e.push(d(L(12.2,2.6,2.45,I[Math.floor(s()*I.length)]),se,S+1.3+X*2.6,re,M+Math.PI/2+(s()-.5)*.02))}}for(let w=-100;w<=100;w+=25){let[C,P]=A(w,38);e.push(d(Z(.25,.3,9,5,"#9aa4ad"),C,S+4.5,P)),e.push(d(q(.9,6,4,"#ffd9a0",1),C,S+9.3,P))}this._buildBridge(e,ie(97,960),ie(150,890));let G=470;for(;G<900&&!(b.heightAt(...ie(4,G))>W+2.6);G+=3);let[k,a]=ie(4,G+30);this._buildFerris(e,k,b.heightAt(k,a)-.3,a);for(let w=-14;w<=58;w+=1.3){let C=480;for(;C<900&&!(b.heightAt(...ie(w,C))>W+2.2);C+=4);if(C>=900)continue;let[P,B]=ie(w,C+6);e.push(d(Z(.3,.35,7,5,"#a3a9b3"),P,b.heightAt(P,B)+3.5,B)),e.push(d(q(1.1,6,4,"#ffcf8f",1),P,b.heightAt(P,B)+7.4,B))}let f=de(new ce({vertexColors:!0,roughness:.95,metalness:0}),t,{terrain:!0,shore:!0});this.terrain=new oe(ee(u),f),this.terrain.name="Terrain",this.terrain.frustumCulled=!1,this.root.add(this.terrain),this.staticScenery=new oe(ee(e),o),this.staticScenery.name="FarScenery",this.staticScenery.frustumCulled=!1,this.root.add(this.staticScenery),this._buildCity(b,s);let i=[d(Z(.35,.5,3.2,5,"#8a6a52"),0,1.6,0),d(q(2.6,8,6,"#ffffff"),0,4.8,0,.3,0,0,1,.9,1),d(q(1.8,7,5,"#ffffff"),.6,6.5,.3,1.1)],l=ee(i),g=[];for(let w of R){if(!w.trees)continue;let C=0,P=0;for(;C<w.trees&&P++<w.trees*12;){let[B,N]=w.isl.sample(s,.78),X=w.isl.heightAt(B,N);X<W+2.2||Math.abs(w.isl.heightAt(B+3,N)-w.isl.heightAt(B-3,N))+Math.abs(w.isl.heightAt(B,N+3)-w.isl.heightAt(B,N-3))>7||(g.push([B,X-.3,N,.8+s()*1.1]),C++)}}let v=de(new ce({vertexColors:!0,roughness:.9}),t,{}),p=new Fe(l,v,g.length),F=[new K("#79b86a"),new K("#5fa35e"),new K("#93c979"),new K("#6aa98a")];g.forEach((w,C)=>{ae.compose(ye.set(w[0],w[1],w[2]),xe.setFromEuler(pe.set(0,s()*6.28,0)),be.set(w[3],w[3]*(.9+s()*.4),w[3])),p.setMatrixAt(C,ae),p.setColorAt(C,F[C%F.length])}),p.name="Trees",p.frustumCulled=!1,this.root.add(p),this.trees=p}_buildLighthouse(t,e,o,s){let n=["#f7f4ee","#ea7f6e","#f7f4ee","#ea7f6e","#f7f4ee"];t.push(d(Z(3.4,3.8,2.2,14,"#d9d2c4"),e,o+1.1,s));for(let m=0;m<n.length;m++){let x=m/n.length,D=(m+1)/n.length;t.push(d(Z(2.5+(1.75-2.5)*D,2.5+(1.75-2.5)*x,17/n.length,16,n[m]),e,o+2.2+(x+D)/2*17,s))}let c=o+2.2+17;t.push(d(Z(2.5,2.3,.45,16,"#4c5661"),e,c+.22,s));for(let m=0;m<12;m++){let x=m/12*Math.PI*2;t.push(d(Z(.05,.05,1,4,"#4c5661"),e+Math.cos(x)*2.35,c+.95,s+Math.sin(x)*2.35))}t.push(d(j(new Re(2.35,.06,4,24),"#4c5661"),e,c+1.45,s,0,Math.PI/2)),t.push(d(Z(1.3,1.3,2.3,12,"#ffe6a6",1),e,c+1.6,s));for(let m=0;m<6;m++){let x=m/6*Math.PI*2;t.push(d(L(.12,2.3,.12,"#4c5661"),e+Math.cos(x)*1.32,c+1.6,s+Math.sin(x)*1.32))}t.push(d(Z(.2,1.6,1.3,12,"#ea7f6e"),e,c+3.4,s)),t.push(d(q(.3,8,6,"#4c5661"),e,c+4.1,s));let b=e+6.5,R=s+3;t.push(d(L(6,3.2,4.5,"#f4efe4"),b,o+1.3,R,.4)),t.push(d(j(new Ie(.01,3.5,2.2,4,1),"#6f8fb7"),b,o+3.9,R,.4+Math.PI/4,0,0,1.25,1,.9)),t.push(d(L(.9,1,.05,"#ffe2a0",1),b+Math.sin(.4)*2.28,o+1.6,R+Math.cos(.4)*2.28,.4)),this.lighthouseTop=new Q(e,c+1.6,s);let T=new Ie(9,.4,150,20,1,!0);T.translate(0,75,0),T.rotateZ(-Math.PI/2);let h=new Te({uniforms:{uNight:this.U.uNight,uCol:{value:new K("#ffe2a8")}},vertexShader:`varying float vA; varying vec3 vN; varying vec3 vV;
        void main(){ vA = clamp(position.x / 150.0, 0.0, 1.0); vec4 wp = modelMatrix * vec4(position, 1.0);
          vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }`,fragmentShader:`uniform float uNight; uniform vec3 uCol; varying float vA; varying vec3 vN; varying vec3 vV;
        void main(){ float e = pow(clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), 2.0); float a = e * pow(max(1.0 - vA, 0.0), 1.6) * smoothstep(0.0, 0.03, vA) * 0.5 * uNight;
          gl_FragColor = vec4(uCol * a, 1.0); }`,transparent:!0,depthWrite:!1,blending:wt,side:Ne,fog:!1});this.lhBeam=new oe(T,h),this.lhBeam.name="LighthouseBeam",this.lhBeam.position.copy(this.lighthouseTop),this.lhBeam.frustumCulled=!1,this.root.add(this.lhBeam)}_craneGeo(t,e,o,s,n){let u=[],E="#f3f0ea";for(let c of[-9,9])for(let b of[-7,7])u.push(d(L(1.4,38,1.4,n),c,19,b));for(let c of[-7,7])u.push(d(L(20,1.8,1.6,n),0,38,c));for(let c of[-9,9])u.push(d(L(1.6,1.8,16,n),c,38,0)),u.push(d(L(1,1.2,14,n),c,16,0));for(let c of[-7,7])u.push(te(-9,2,c,9,36,c,.6,n)),u.push(d(L(20,1.2,1.2,n),0,22,c));u.push(d(L(3.2,3.2,100,E),0,41,20)),u.push(d(L(4.6,1.2,100,n),0,39,20));for(let c of[-4,4])u.push(te(c,40,-6,0,64,-8,1.1,n)),u.push(te(c,40,6,0,64,-8,1,n));u.push(te(0,64,-8,0,42.5,68,.35,"#8f9aa5")),u.push(te(0,64,-8,0,42.5,40,.35,"#8f9aa5")),u.push(te(0,64,-8,0,42.5,-28,.35,"#8f9aa5")),u.push(d(L(10,6,12,E),0,45.5,-20)),u.push(d(L(8,1,10,n),0,49,-20)),u.push(d(L(3,3.8,4,E),0,36,10)),u.push(d(L(4,2.2,6,"#7a8591"),0,38.4,34)),u.push(te(0,37.5,34,0,16,34,.25,"#58626c")),u.push(d(L(3,1.2,12,"#e8c56b"),0,15.5,34)),u.push(d(q(.8,6,4,"#ff4a3a",2),0,65,-8)),u.push(d(q(.7,6,4,"#ff4a3a",2),0,43.5,69));for(let c of[-9,9])for(let b of[-7,7])u.push(d(L(2.4,1.6,3.2,"#5c6670"),c,.8,b));let y=ee(u);return d(y,t,e,o,s)}_buildBridge(t,e,o){let s=e[0],n=e[1],u=o[0],E=o[1],y=Math.hypot(u-s,E-n),c=(u-s)/y,b=(E-n)/y,R=-b,T=c,h=Math.atan2(c,b),m=32,x=100,D="#e59c86",_="#d98c77",M=(H,I,G)=>[s+c*y*H+R*I,G,n+b*y*H+T*I],S=(s+u)/2,z=(n+E)/2;t.push(d(L(22,3.2,y+120,"#d8d3ca"),S,m,z,h)),t.push(d(L(22.5,1.2,y+120,D),S,m-2.1,z,h));let A=[.22,.78];for(let H of A){for(let k of[-10.5,10.5]){let[a,f,i]=M(H,k,0);t.push(d(L(4.2,x+6,4.2,D),a,W+(x+6)/2-4,i,h))}for(let k of[m+22,m+48,x-6]){let[a,,f]=M(H,0,0);t.push(d(L(25,3,3.4,D),a,W+k,f,h))}let[I,,G]=M(H,0,0);t.push(d(L(30,8,10,"#cfc9bd"),I,W+1,G,h))}for(let H of[-10.5,10.5]){let I=A[0],G=A[1],k=W+x-2,a=[],f=[],i=[];for(let l=0;l<=24;l++){let g=I+(G-I)*(l/24),v=l/24;a.push(M(g,H,k-(k-m-3)*(1-Math.pow(2*v-1,2))))}for(let l=0;l<=8;l++){let g=l/8;f.push(M(-.05+(I+.05)*g,H,m+1+(k-m-1)*g*g)),i.push(M(G+(1.05-G)*g,H,k-(k-m-1)*(1-(1-g)*(1-g))))}for(let l of[a,f,i])t.push(dt(l,1,_,5));for(let l=1;l<24;l++){let g=a[l];t.push(d(L(.7,g[1]-m,.7,_),g[0],(g[1]+m)/2,g[2]))}for(let l=0;l<=24;l+=2){let g=a[l];t.push(d(q(1.2,6,4,"#fff1c9",1),g[0],g[1]+1.2,g[2]))}for(let l=-.04;l<=1.04;l+=.035){let g=M(l,H*1.02,m+2.4);t.push(d(q(.9,5,3,"#ffcf8f",1),g[0],g[1],g[2]))}}for(let H of A)for(let I of[-10.5,10.5]){let[G,,k]=M(H,I,0);t.push(d(q(1,6,4,"#ff4a3a",2),G,W+x+2,k))}}_buildFerris(t,e,o,s){let u=o+24+5,E=Math.atan2(-e,-s),y=[];for(let T of[-3.2,3.2])y.push(te(-12,0,T,0,29,T*.35,1.1,"#f1ede6")),y.push(te(12,0,T,0,29,T*.35,1.1,"#f1ede6"));y.push(d(L(30,1.5,12,"#d6cfc2"),0,.3,0)),y.push(d(L(10,5,8,"#8fbfd9"),0,2.5,0)),t.push(d(ee(y),e,o,s,E));let c=[];for(let T of[-1.8,1.8])c.push(d(j(new Re(24,.45,5,64),"#f6f3ee"),0,0,T));let b=18,R=["#ff9f8a","#8fd0e0","#ffd27a","#b6a6e8","#9fdcae","#ff9fc4"];for(let T=0;T<b;T++){let h=T/b*Math.PI*2,m=Math.cos(h),x=Math.sin(h);for(let _ of[-1.8,1.8])c.push(te(0,0,_,m*24,x*24,_,.28,"#e7e2da"));c.push(te(m*24,x*24,-1.8,m*24,x*24,1.8,.3,"#e7e2da")),c.push(d(L(2.4,2.6,2.4,R[T%R.length]),m*(24+1.5),x*(24+1.5)-1.2,0)),c.push(d(q(.55,5,3,"#fff0c0",1),m*(24+.2),x*(24+.2),2.3));let D=h+Math.PI/b;c.push(d(q(.45,5,3,"#ffc2e0",1),Math.cos(D)*(24*.55),Math.sin(D)*(24*.55),2.1))}c.push(d(Z(1.6,1.6,5,10,"#d6cfc2"),0,0,0,0,Math.PI/2)),this._ferrisGeo=ee(c),this._ferrisPose={x:e,y:u,z:s,yaw:E}}_buildCity(t,e){let o=this.U,s=this._cityFrame,n=Math.cos(s.rot),u=Math.sin(s.rot),E=[n,u],y=[-u,n],c=-s.rot,b=[],R=[["#eee4d2","#d8cab0"],["#e8c4b0","#d3a791"],["#f4f2ed","#d9d6cf"],["#eadbb6","#d3bf94"],["#d4dbe1","#bac4cc"],["#dcd4ea","#c4bad9"],["#d2e6d8","#b6d1be"],["#f1d8d6","#dcbcba"],["#e3ddd3","#c9c0b2"]],T=[["#a9c0d2","#e6ebef"],["#a6cbc9","#e3ecea"],["#bcc1d8","#e9eaf1"],["#b8cfdc","#eef2f4"]],h=(a,f,i,l)=>{let g=a.attributes.position.count,v=new Float32Array(g*3);for(let p=0;p<g;p++)v[p*3]=f,v[p*3+1]=i,v[p*3+2]=l;return a.setAttribute("bld",new Pe(v,3)),a},m=(a,f)=>{let i=a.attributes.color.array;for(let l=0;l<i.length;l++)i[l]*=f;return a},x=(a,f,i,l)=>{for(let g of a)d(g,f,0,i,l),b.push(g)},D=(a,f,i,l,g,v,p,F)=>{let w=[],C=e(),P=v>88,B=v>38,N=P?e()<.72:B&&e()<.3,X=N?T[Math.floor(e()*T.length)]:R[Math.floor(e()*R.length)],se=N?e()<.8?3:4:P?4:B?[1,2,4,1][Math.floor(e()*4)]:e()<.6?1:2,re=.95+e()*.1,le=(U,V,Y,ue,Ce,Qt,Jt=0,eo=0,to=0)=>{w.push(h(m(d(L(U,V,Y,Ce,to),Jt,ue+V/2,eo),re),Qt,C,p))},O=p-.6,$=l,he=g,vt=v;if(v>70&&e()<.5){let U=9+e()*6;le(l*1.32,U,g*1.3,O,X[1]==="#e6ebef"?"#dfe3e6":X[0],2),le(l*1.36,.8,g*1.34,O+U-.4,X[1],0),O+=U,vt-=U}let We=P&&e()<.8?v>140?3:2:B&&e()<.3?2:1,$t=We===1?[1]:We===2?[.7,.3]:[.56,.27,.17];for(let U=0;U<We;U++){let V=vt*$t[U];if(le($,V,he,O,X[0],se),le($+.9,.8,he+.9,O+V-.5,X[1],0),O+=V,U<We-1){let Y=.7+e()*.14;$*=Y,he*=.7+e()*.14}}let Ze=e(),xt="#b7bcc2";if(P&&Ze<.28){let U=$,V=he,Y=O;for(let ue=0;ue<3;ue++){U*=.72,V*=.72;let Ce=5-ue;le(U,Ce,V,Y,X[0],0),Y+=Ce}w.push(h(d(Z(.25,.7,16,6,"#d6dadf"),0,Y+8,0),0,C,p)),w.push(h(d(q(.8,6,4,"#ff4a3a",2),0,Y+16.4,0),0,C,p))}else if(P&&Ze<.5){let U=j(new Oe($,16,he),X[0]),V=U.attributes.position;for(let Y=0;Y<V.count;Y++)V.getY(Y)>0&&V.getX(Y)>0&&V.setY(Y,V.getY(Y)-13);U.computeVertexNormals(),w.push(h(m(d(U,0,O+8,0),re),3,C,p))}else if(P&&Ze<.72){le($*.5,4,he*.5,O,xt,0);for(let[U,V]of[[-$*.12,18+e()*16],[$*.14,10+e()*8]])w.push(h(d(Z(.3,.45,V,5,"#d0d4d9"),U,O+4+V/2,0),0,C,p)),w.push(h(d(q(.75,6,4,"#ff4a3a",2),U,O+4+V+.4,0),0,C,p))}else if(P)w.push(h(d(Z(.01,Math.min($,he)*.7,12,4,e()<.5?"#9cc4b4":"#d9a58e"),0,O+6,0,Math.PI/4),0,C,p));else if(B&&Ze<.4){let U=(e()-.5)*$*.4,V=(e()-.5)*he*.4;for(let[Y,ue]of[[-1.1,-1.1],[1.1,-1.1],[1.1,1.1],[-1.1,1.1]])w.push(h(d(L(.25,3.2,.25,"#6b5a4c"),U+Y,O+1.6,V+ue),0,C,p));w.push(h(d(Z(1.7,1.7,3.4,10,"#b58d67"),U,O+4.9,V),0,C,p)),w.push(h(d(Z(.12,1.9,1.5,10,"#8b7361"),U,O+7.3,V),0,C,p))}else{let U=1+Math.floor(e()*3);for(let V=0;V<U;V++){let Y=2.5+e()*4,ue=2.5+e()*4,Ce=1.4+e()*2.2;le(Y,Ce,ue,O,V===0&&e()<.5?X[1]:xt,0,(e()-.5)*($-Y)*.8,(e()-.5)*(he-ue)*.8)}e()<.4&&w.push(h(d(Z(.7,.7,2.2,8,"#c4c8cc"),(e()-.5)*$*.6,O+1.1,(e()-.5)*he*.6),0,C,p))}x(w,a,f,i)},_=(a,f,i,l,g,v,p)=>{let F=e(),w=[];w.push(h(d(Z(i,i,l,24,v),0,g-.6+l/2,0),5,F,g)),w.push(h(d(Z(i+.6,i+.6,.9,24,p),0,g+l-.9,0),0,F,g)),w.push(h(d(Z(i*.55,i*.8,6,16,p),0,g+l+2.4,0),0,F,g)),x(w,a,f,0)},M=[],S=(a,f)=>{let[i,l]=ie(a,f);return[i,l,t.heightAt(i,l)]};{let[a,f,i]=S(13,600),l=[],g=e();l.push(h(d(Z(2.2,4.2,128,12,"#eef0f2"),0,i+64,0),0,g,i));for(let v=0;v<3;v++){let p=v*2.094;l.push(h(te(Math.cos(p)*9,i,Math.sin(p)*9,Math.cos(p)*2,i+40,Math.sin(p)*2,1.2,"#e3e6ea"),0,g,i))}l.push(h(d(Z(12,7,6,28,"#f5f6f8"),0,i+125,0),0,g,i)),l.push(h(d(Z(12.6,12.6,3.4,28,"#9fb7c9"),0,i+129.7,0),5,g,i+128)),l.push(h(d(Z(7,12.6,3,28,"#f5f6f8"),0,i+132.9,0),0,g,i));for(let v=0;v<14;v++){let p=v/14*Math.PI*2;l.push(h(d(q(.6,5,3,"#fff0c8",1),Math.cos(p)*12.4,i+128.2,Math.sin(p)*12.4),0,g,i))}l.push(h(d(Z(.45,1.1,36,6,"#dfe2e6"),0,i+152,0),0,g,i)),l.push(h(d(q(.9,6,4,"#ff4a3a",2),0,i+170.5,0),0,g,i)),x(l,a,f,0),M.push([a,f,22])}{let[a,f,i]=S(27,790),l=[],g=e();for(let v=0;v<40;v++){let p=h(d(L(25,4.25,25,"#aec6d6"),0,i+v*4.2+2.1,0,v*.042),3,g,i);l.push(p)}l.push(h(d(L(18,3,18,"#e8edf0"),0,i+169.5,0,40*.042),0,g,i)),l.push(h(d(Z(.35,.8,26,6,"#dfe2e6"),0,i+184,0),0,g,i)),l.push(h(d(q(.9,6,4,"#ff4a3a",2),0,i+197.5,0),0,g,i)),x(l,a,f,c),M.push([a,f,24])}{let[a,f,i]=S(41,590),l=[],g=e();l.push(h(d(L(46,12,30,"#f2ece0"),0,i+5.4,0),1,g,i)),l.push(h(d(L(47,1,31,"#dccfb8"),0,i+11.6,0),0,g,i)),l.push(h(d(Z(12,12,9,28,"#efe8da"),0,i+16.5,0),1,g,i)),l.push(h(d(j(new Ye(12.4,28,10,0,Math.PI*2,0,Math.PI/2),"#9fcabd"),0,i+21,0),0,g,i)),l.push(h(d(Z(1.6,1.6,4,10,"#f2ece0"),0,i+35,0),0,g,i)),l.push(h(d(q(1.9,10,6,"#9fcabd"),0,i+37.5,0),0,g,i)),x(l,a,f,c),M.push([a,f,30])}{let[a,f,i]=S(5,770),l=e(),g=[];for(let v of[-15,15])g.push(h(d(L(20,124,20,"#b7c9d8"),v,i+61.4,0),3,l,i)),g.push(h(d(L(21,1,21,"#eef1f3"),v,i+123.5,0),0,l,i)),g.push(h(d(L(12,8,12,"#b7c9d8"),v,i+128,0),3,l,i)),g.push(h(d(Z(.3,.6,20,5,"#dfe2e6"),v,i+142,0),0,l,i)),g.push(h(d(q(.8,6,4,"#ff4a3a",2),v,i+152.4,0),0,l,i));g.push(h(d(L(10,6,7,"#e9edf0"),0,i+84,0),2,l,i)),x(g,a,f,c),M.push([a,f,32])}{let[a,f,i]=S(34,705);D(a,f,c,30,30,150,i,1),M.push([a,f,24])}{let[a,f,i]=S(19,840),l=e(),g=[];g.push(h(d(L(30,160,24,"#a9c0d2"),0,i+79.4,0),3,l,i));let v=j(new Oe(30,26,24),"#a9c0d2"),p=v.attributes.position;for(let F=0;F<p.count;F++)p.getY(F)>0&&p.getX(F)>0&&p.setY(F,p.getY(F)-22);v.computeVertexNormals(),g.push(h(d(v,0,i+172,0),3,l,i)),x(g,a,f,c),M.push([a,f,24])}let z=(a,f,i)=>M.some(l=>Math.hypot(l[0]-a,l[1]-f)<l[2]+i),[A,H]=ie(24,760),I=46;for(let a=-13;a<=13;a++)for(let f=-8;f<=8;f++){let i=s.cx+E[0]*a*I+y[0]*f*I,l=s.cz+E[1]*a*I+y[1]*f*I;if(t.localF(i,l)>.78||t.heightAt(i,l)<W+2.4)continue;let g=Math.hypot(i-A,l-H),v=Math.max(0,1-g/380),p=e()<.35+v*.3?[[0,0,1]]:e()<.6?[[-.25,0,.5],[.25,0,.5]]:[[-.25,-.25,.5],[.25,-.25,.5],[-.25,.25,.5],[.25,.25,.5]];for(let[F,w,C]of p){if(e()<.08)continue;let P=F*I+(e()-.5)*3,B=w*I+(e()-.5)*3,N=i+E[0]*P+y[0]*B,X=l+E[1]*P+y[1]*B,se=(I-10)*C,re=se*(.72+e()*.28),le=se*(.72+e()*.28);if(z(N,X,Math.max(re,le)*.6))continue;let O=t.heightAt(N,X);if(O<W+2.4)continue;let $=12+e()*22+v*v*(50+e()*110)*(C===1?1:.7);if(f>=5&&($=Math.min($,26+e()*16)),$>60&&e()<.1){_(N,X,Math.min(re,le)*.5,$,O,"#d9e3ec","#eef1f3");continue}D(N,X,c+(e()-.5)*.04,re,le,$,O,v)}}let G=ee(b),k=de(new ce({vertexColors:!0,roughness:.82,metalness:0}),o,{city:!0});this.city=new oe(G,k),this.city.name="CitySkyline",this.city.frustumCulled=!1,this.root.add(this.city)}_buildLife(){let t=this.U,e=tt(77),o=this.staticScenery.material;this.ferris=new oe(this._ferrisGeo,o),this.ferris.name="FerrisWheel",this.ferris.position.set(this._ferrisPose.x,this._ferrisPose.y,this._ferrisPose.z),this.ferris.rotation.set(0,this._ferrisPose.yaw,0,"YXZ"),this.ferris.frustumCulled=!1,this.root.add(this.ferris);let s=[et({L:7,B:2.3,D:.7,F:.8,sheer:.3,hull:"#fbfaf6",stripe:"#6fa6cf",bottom:"#d0675c",deck:"#d8c7a4"})];s.push(d(Z(.07,.09,10,6,"#e6e2da"),0,5.8,.4)),s.push(te(0,1.8,.4,0,1.7,-3.2,.1,"#e6e2da")),s.push(we([0,1.9,.3,0,10.4,.3,0,1.9,-3.1],"#fffdf7")),s.push(we([0,1.3,3.4,0,9.8,.55,0,1.3,.6],"#fff4e8")),s.push(d(L(.5,.3,.05,"#ff8f7a"),.2,10.7,.4));let n=ee(s),u=de(new ce({vertexColors:!0,roughness:.6,side:Ne}),t,{}),E=[[192,150,1],[285,240,-1],[74,235,1],[160,335,-1],[334,205,1],[40,310,-1],[120,420,1]];this.sailboats=E.map(([z,A,H])=>({a:z*me,d:A,w:H*(.9+e()*.5)/A,phase:e()*10,s:.9+e()*.35})),this.sailInst=new Fe(n,u,this.sailboats.length),this.sailInst.name="Sailboats",this.sailInst.frustumCulled=!1,this.sailInst.instanceMatrix.setUsage(Ue),this.root.add(this.sailInst);let y=[d(Z(.42,.5,1.3,12,"#ffffff"),0,.2,0),d(Z(.05,.42,.7,12,"#ffffff"),0,1.2,0),d(j(new Re(.55,.12,4,10),"#3b3f47"),0,-.05,0,0,Math.PI/2),d(Z(.03,.03,.6,4,"#4b525b"),.15,1.6,0),d(Z(.03,.03,.6,4,"#4b525b"),-.15,1.6,0),d(q(.12,8,6,"#fff6d8",1),0,1.95,0)],c=ee(y),b=de(new ce({vertexColors:!0,roughness:.4}),t,{waterline:!0}),R=this.bounds,T=[],h=.625,m=-.781;for(let z=0;z<4;z++){let A=62+z*40*h,H=-70+z*40*m;T.push({x:A-m*14,z:H+h*14,col:"#ef6b61",s:1.1}),T.push({x:A+m*14,z:H-h*14,col:"#4fb47e",s:1.1})}for(let[z,A,H]of[[R.maxX+16,12,"#ffd463"],[R.minX-18,-6,"#ffd463"],[8,R.maxZ+17,"#f7f5f0"],[-14,R.minZ-16,"#f7f5f0"],[R.maxX+26,-30,"#ef9d61"],[R.minX-30,40,"#ef9d61"]])T.push({x:z,z:A,col:H,s:.85});this.buoys=T.map(z=>({...z,phase:e()*10})),this.buoyInst=new Fe(c,b,this.buoys.length),this.buoys.forEach((z,A)=>this.buoyInst.setColorAt(A,new K(z.col))),this.buoyInst.name="Buoys",this.buoyInst.frustumCulled=!1,this.buoyInst.instanceMatrix.setUsage(Ue),this.root.add(this.buoyInst);for(let z of this.buoys)this._foamShapes.push({ax:z.x,az:z.z,bx:z.x,bz:z.z,r:.55*z.s});this._marina||this._buildFoamField(this._foamShapes);let x=[];x.push(d(q(.5,8,6,"#fbfbf8"),0,0,0,0,0,0,.22,.2,.72)),x.push(d(q(.14,8,6,"#fbfbf8"),0,.08,.38)),x.push(d(j(new Gt(.04,.16,5),"#f2b340"),0,.06,.55,0,Math.PI/2)),x.push(we([0,0,-.35,0,0,-.62,.14,0,-.55],"#e9ecef")),x.push(we([0,0,-.35,0,0,-.62,-.14,0,-.55],"#e9ecef"));for(let z of[1,-1])x.push(we([.05*z,.02,.2,.62*z,.02,.12,.05*z,.02,-.2,.62*z,.02,.12,.62*z,.02,-.18,.05*z,.02,-.2],"#f4f5f6")),x.push(we([.62*z,.02,.12,1.15*z,.02,-.16,.62*z,.02,-.18],"#9aa3ad"));let D=ee(x),_=11,M=new Float32Array(_);this.gulls=[];for(let z=0;z<_;z++){let A=z%4,I=[[0,0,58,26],[R.maxX+35,-20,28,18],[R.minX-40,30,34,22],[70,90,45,30]][A];this.gulls.push({cx:I[0],cz:I[1],r:I[2]*(.8+e()*.4),h:I[3]+(e()-.5)*6,w:(.18+e()*.12)*(e()<.5?1:-1),a0:e()*6.28,s:1.4+e()*.4}),M[z]=e()}D.setAttribute("aPhase",new At(M,1));let S=de(new ce({vertexColors:!0,roughness:.7,side:Ne}),t,{gull:!0});this.gullInst=new Fe(D,S,_),this.gullInst.name="Gulls",this.gullInst.frustumCulled=!1,this.gullInst.instanceMatrix.setUsage(Ue),this.root.add(this.gullInst),this._animate(0)}waterHeightAt(t,e,o=this.time){let s=1e5,n=this._marinaData;for(let y of n?[n.decks,n.wet]:[this.footprint])for(let c of y){let b=Math.max(c.minX-t,t-c.maxX,0),R=Math.max(c.minZ-e,e-c.maxZ,0);b*b+R*R<s*s&&(s=Math.min(s,zo(c,t,e)))}let u=.035+(.16-.035)*mt(3,70,s);if(n){let y=this.bounds,c=Math.abs(t-(y.minX+y.maxX)/2)-(y.maxX-y.minX)/2,b=Math.abs(e-(y.minZ+y.maxZ)/2)-(y.maxZ-y.minZ)/2,R=Math.hypot(Math.max(c,0),Math.max(b,0))+Math.min(Math.max(c,b),0);u*=.45+.55*mt(60,210,R)}let E=.45*Math.sin(t*.11+e*.047+o*.95)+.35*Math.sin(-t*.052+e*.097+o*1.13+1.7)+.2*Math.sin(t*.173-e*.141+o*1.61+4.1);return W+E*u}deckEdges(t=1.6){let e=[];for(let o of this._runs||[]){let s=o.s1-o.s0,n=Math.max(1,Math.floor(s/t)),u=(o.bx-o.ax)/o.len,E=(o.bz-o.az)/o.len;for(let y=0;y<n;y++){let c=o.s0+s*(y+.5)/n;e.push({x:o.ax+u*c+o.nx*.05,z:o.az+E*c+o.nz*.05,nx:o.nx,nz:o.nz})}}return e}get seaState(){return this._marina?.15:1}getSkyColors(){let t=this.U;return{zenith:t.uZenith.value,sky:t.uSkyMid.value,horizon:t.uHorizon.value,ground:this.hemi.groundColor,sun:this.sun.color,sunColor:this.sun.color,sunIntensity:this.sun.intensity,sunDir:t.uSunDir.value,fog:this.fogColor,cloud:t.uCloudLit.value,night:t.uNight.value}}rebuildForArena(t,e){this._marina=this._stageMarina(),this.bounds={...t},this.footprint=(e&&e.length?e:[this.bounds]).map(Be),this._rebuildDock(),this._applyMarina(),this._fitShadow(),this._bakeFarReflection()}_rebuildDock(){for(let t of[this.pilings,this.dockProps,...(this.moored||[]).map(e=>e.mesh)])t&&(this.root.remove(t),t.geometry?.dispose());this._buildDock();for(let t of this.buoys||[])this._foamShapes.push({ax:t.x,az:t.z,bx:t.x,bz:t.z,r:.55*t.s});this._marina||this._buildFoamField(this._foamShapes)}setFootprint(t){this.footprint=t.map(Be),this._syncDeckShading()}setTheme(t){let e=je[t]||je.day,o=this.renderer;this.theme=je[t]?t:"day";let s=this.U,n=e.sunEl*me,u=e.sunAz*me;s.uSunDir.value.set(Math.cos(n)*Math.cos(u),Math.sin(n),Math.cos(n)*Math.sin(u)).normalize(),s.uZenith.value.set(e.zenith),s.uSkyMid.value.set(e.skyMid),s.uHorizon.value.set(e.horizon),s.uGround.value.set(e.ground),s.uHorizonGlow.value.copy(Le(e.horizonGlow,e.horizonGlowK)),s.uGlowColor.value.set(e.glowColor),s.uGlowParams.value.set(...e.glow),s.uHaze.value.set(e.haze[0],e.haze[1],e.haze[2],0),s.uNight.value=e.night,s.uSunDisk.value.copy(Le(e.sunDisk,e.sunDiskK)),s.uSunCos.value=Math.cos(e.sunRadius*me),s.uCloudLit.value.copy(Le(e.cloudLit,e.cloudLitK)),s.uCloudShade.value.set(e.cloudShade),s.uCloudParams.value.set(...e.cloud),s.uSeaDeep.value.set(e.seaDeep),s.uSeaShallow.value.set(e.seaShallow),s.uSeaCrest.value.set(e.seaCrest),s.uFoamColor.value.set(e.foam),s.uSunLight.value.copy(Le(e.sunColor,(e.skySun??e.sunIntensity)/Math.PI)),s.uSeaAmbient.value.copy(s.uSkyMid.value).lerp(s.uHorizon.value,.5).multiplyScalar(e.seaAmbientK),s.uSunSpec.value=e.sunSpec,s.uWaveStrength.value=e.waveStrength,this.grade=e.grade;let E=!!e.shafts;"SKY_SHAFTS"in this.skyMat.defines!==E&&(E?this.skyMat.defines.SKY_SHAFTS="":delete this.skyMat.defines.SKY_SHAFTS,this.skyMat.needsUpdate=!0);let y=this._stageMarina();y!==this._marina&&(this._marina=y,this._rebuildDock());let c={channel:null,shade:null,calm:.55,lap:1,caustic:1.5,wet:.5,...e.marina||{}};c.channel?s.uChannelCol.value.set(c.channel):s.uChannelCol.value.set(e.seaDeep).multiplyScalar(.65),c.shade?s.uShadeCol.value.set(c.shade):s.uShadeCol.value.set(e.seaDeep).multiplyScalar(.12),s.uMarinaK.value.x=c.calm,s.uMarinaK.value.y=c.lap,s.uMarinaK.value.z=.35,s.uStripK.value.set(c.caustic,c.wet,0,0),this._applyMarina(),this.sun.color.set(e.sunColor),this.sun.intensity=e.sunIntensity,this.hemi.color.set(e.hemiSky),this.hemi.groundColor.set(e.hemiGround).multiplyScalar(e.hemiGroundK??1),this.hemi.intensity=e.hemiIntensity,this.scene.environmentIntensity=e.envK??.66,this.fogColor.copy(s.uHorizon.value).lerp(s.uSkyMid.value,.15),this.scene.fog&&this.scene.fog.isFog&&(this.scene.fog.color.copy(this.fogColor),this.scene.fog.near=e.fog[0],this.scene.fog.far=e.fog[1]),this.lhBeam.visible=e.night>.01,this._fitShadow();let b=o.getClearColor(new K),R=o.getClearAlpha();this._bakeClouds(e),o.setClearColor(b,R),this._rebuildEnvMap(),this._bakeFarReflection()}update(t,e){t=Math.min(t||0,.1),this.time+=t,this._frameId++,this.U.uTime.value=this.time,e&&this.sky.position.copy(e.position),this._animate(t)}_animate(){let t=this.time;for(let e of this.moored){let o=e.spec;e.mesh.position.y=this.waterHeightAt(o.x,o.z,t)+.03*Math.sin(t*1.3+e.phase),e.mesh.rotation.z=e.roll*Math.sin(t*.9+e.phase),e.mesh.rotation.x=.012*Math.sin(t*.7+e.phase*2)}for(let e=0;e<this.sailboats.length;e++){let o=this.sailboats[e],s=o.a+o.w*t,n=Math.cos(s)*o.d,u=Math.sin(s)*o.d,E=Math.atan2(-Math.sin(s)*Math.sign(o.w),Math.cos(s)*Math.sign(o.w)),y=this.waterHeightAt(n,u,t);pe.set(.03*Math.sin(t*.8+o.phase),E,(.13+.05*Math.sin(t*.6+o.phase))*Math.sign(o.w),"YXZ"),ae.compose(ye.set(n,y,u),xe.setFromEuler(pe),be.setScalar(o.s)),this.sailInst.setMatrixAt(e,ae)}this.sailInst.instanceMatrix.needsUpdate=!0;for(let e=0;e<this.buoys.length;e++){let o=this.buoys[e],s=this.waterHeightAt(o.x,o.z,t)+.06*Math.sin(t*1.7+o.phase);pe.set(.09*Math.sin(t*1.1+o.phase),o.phase,.09*Math.cos(t*.93+o.phase*1.3),"YXZ"),ae.compose(ye.set(o.x,s,o.z),xe.setFromEuler(pe),be.setScalar(o.s)),this.buoyInst.setMatrixAt(e,ae)}this.buoyInst.instanceMatrix.needsUpdate=!0;for(let e=0;e<this.gulls.length;e++){let o=this.gulls[e],s=o.a0+o.w*t,n=o.cx+Math.cos(s)*o.r,u=o.cz+Math.sin(s)*o.r,E=o.h+Math.sin(t*.4+o.a0)*1.5,y=Math.sign(o.w),c=Math.atan2(-Math.sin(s)*y,Math.cos(s)*y);pe.set(0,c,-.35*y,"YXZ"),ae.compose(ye.set(n,E,u),xe.setFromEuler(pe),be.setScalar(o.s)),this.gullInst.setMatrixAt(e,ae)}this.gullInst.instanceMatrix.needsUpdate=!0,this.ferris.rotation.z=t*.045,this.lhBeam.rotation.y=t*.55}dispose(){this.scene.remove(this.root,this.sun,this.sun.target,this.hemi),this.root.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&t.material.dispose()}),this._envRT&&this._envRT.dispose(),this._cloudRT?.dispose(),this._cloudMat?.dispose(),this._reflRT?.dispose(),this._farRT?.dispose(),this._stripMat?.dispose(),this._underMat?.dispose(),this._pmrem.dispose(),this.U.uWaveTex.value?.dispose(),this.U.uFoamTex.value?.dispose(),this._fieldRT?.dispose(),this._fieldMat?.dispose(),this._fieldQuad?.geometry.dispose()}};export{Ot as Environment};
