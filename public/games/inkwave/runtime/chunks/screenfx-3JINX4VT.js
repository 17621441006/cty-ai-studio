import{c as pe}from"./chunk-C5NYPTVO.js";import{C as K,G as re,P as N,R as U,T as J,Ua as ce,X as E,Y as ne,_a as Q,da as P,fa as he,g as ie,h as W,hb as fe,l as I,nb as me,ra as ue,wa as X}from"./chunk-A4GFMTBS.js";import{E as Z}from"./chunk-GS5HPC5T.js";import{a as de,b as T,d,e as Y,f as M}from"./chunk-UAF7E3YD.js";import"./chunk-VC46IEJQ.js";var D=Math.PI*2,k=new J,V=new J,q=new P,ee=new P,we=new P(.06,.34,.62),$=new P(1,.16,.05),H=new P(1,1,1),O=y=>1-Math.pow(1-d(y,0,1),3),ye=y=>(y=d(y,0,1),y<.5?4*y*y*y:1-Math.pow(-2*y+2,3)/2),n=(y,s)=>y+Math.random()*(s-y),ve=typeof matchMedia=="function"?matchMedia("(prefers-reduced-motion: reduce)"):null,Te=()=>!!(ve&&ve.matches),Me="varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",ke=`
  uniform sampler2D tDiffuse;
  uniform sampler2D tLens;
  uniform vec2 uRes;
  uniform float uAspect;
  uniform float uTime;
  uniform float uSpeed;
  uniform vec3 uSpeedTint;
  uniform float uStretch;
  uniform float uPunch;
  uniform vec2 uPunchPos;
  uniform float uBlast;
  uniform vec2 uBlastPos;
  uniform float uBlastRing;
  uniform vec3 uBlastColor;
  uniform float uChroma;
  uniform float uLensOn;
  uniform vec2 uLensTexel;
  uniform vec3 uLensColA;
  uniform vec3 uLensColB;
  uniform vec4 uEdgeInk;
  uniform vec4 uAura;
  uniform vec4 uHeart;
  uniform float uHurt;
  uniform vec4 uUrgency;
  uniform vec4 uSwim;
  uniform float uFocus;
  uniform vec4 uShimmer;
  uniform vec4 uFlood;
  uniform float uFloodDrip;
  uniform float uFloodClear;
  uniform float uHole;
  uniform vec3 uHoleRim;
  uniform vec4 uFlash;
  uniform float uDesat;
  uniform float uSat;
  uniform vec4 uKill;
  uniform vec4 uCharge;
  varying vec2 vUv;

  float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
  float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }

  // distance (in screen-height units) to the nearest screen edge, with rounded inner corners
  float edgeD(vec2 uv) {
    vec2 p = uv * vec2(uAspect, 1.0);
    float dx = min(p.x, uAspect - p.x), dy = min(p.y, 1.0 - p.y);
    const float k = 16.0;
    return -log(exp(-k * dx) + exp(-k * dy)) / k;
  }
  // gooey ink band hugging the screen edges: > 0 inside the ink
  float gooBand(vec2 uv, float width, float wob, float seed) {
    vec2 p = uv * vec2(uAspect, 1.0);
    float n = fbm(p * 3.2 + vec2(seed, uTime * 0.12)) - 0.44;
    float n2 = vnoise(p * 10.0 + vec2(uTime * 0.25, seed * 1.7)) - 0.5;
    return width * (1.0 + n * wob * 2.2 + n2 * wob * 0.7) - edgeD(uv);
  }
  // ink drips hanging from the top edge: > 0 inside
  float drips(vec2 uv, float len, float seed, float top) {
    const float N = 19.0;
    float x = uv.x * N;
    float id = floor(x);
    float h = hash12(vec2(id, seed));
    float h2 = hash12(vec2(id, seed + 7.3));
    float fx = (fract(x) - 0.5 - (h2 - 0.5) * 0.5) / N * uAspect;   // horizontal distance, height units
    float L = len * (0.12 + 0.88 * h * h) * (0.9 + 0.1 * sin(uTime * (0.7 + h) + h * 6.28));
    float y = 1.0 - uv.y - top;
    if (y < -0.02) return -1.0;
    float w = (0.005 + 0.011 * h2) * (0.55 + 0.45 * step(0.35, h));
    float bulb = w * 1.55;
    float inTail = clamp(y / max(L, 1e-4), 0.0, 1.0);
    float rad = mix(w * 1.2, w, smoothstep(0.0, 0.3, inTail));
    rad = mix(rad, bulb, smoothstep(0.8, 1.0, inTail));
    float d = length(vec2(fx, max(y - L, 0.0))) - rad;
    return -d;
  }
  // glossy wet-ink shading for a surface with normal n
  vec3 inkShade(vec3 inkCol, vec3 behind, vec3 n, float thick) {
    vec3 L = normalize(vec3(-0.42, 0.62, 0.66));
    float ndl = clamp(dot(n, L), 0.0, 1.0);
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    float spec = pow(clamp(dot(n, H), 0.0, 1.0), 64.0);
    float spec2 = pow(clamp(dot(n, normalize(vec3(0.5, -0.3, 0.8))), 0.0, 1.0), 18.0);
    float fres = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.0);
    vec3 base = inkCol * (0.42 + 0.62 * ndl);
    base = mix(base, behind * (0.35 + inkCol * 1.1), (1.0 - thick) * 0.28);
    return base * (1.0 - fres * 0.45) + spec * 2.4 + spec2 * inkCol * 0.25;
  }

  vec3 sceneTap(vec2 uv, vec2 ca) {
    if (uChroma > 0.0005) return vec3(texture2D(tDiffuse, uv + ca).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - ca).b);
    return texture2D(tDiffuse, uv).rgb;
  }

  void main() {
    vec2 uv = vUv;
    vec2 c0 = vUv - 0.5;
    vec2 q = c0 * vec2(uAspect, 1.0);
    float r = length(q);

    // ---------------------------------------------------------------- geometric distortion
    uv = uPunchPos + (uv - uPunchPos) * (1.0 - uPunch);
    if (uStretch > 0.0001) { vec2 d = uv - 0.5; vec2 da = d * vec2(uAspect, 1.0); uv = 0.5 + d * (1.0 - uStretch * dot(da, da)); }
    if (uSwim.a > 0.001) uv += vec2(sin(uv.y * 37.0 + uTime * 2.6) + 0.5 * sin(uv.y * 71.0 - uTime * 3.3), cos(uv.x * 29.0 + uTime * 2.1)) * 0.0011 * uSwim.a;
    if (uBlast > 0.001) {
      vec2 bd = (uv - uBlastPos) * vec2(uAspect, 1.0);
      float bl = length(bd);
      float ring = exp(-pow((bl - uBlastRing) * 18.0, 2.0));
      uv -= (bd / max(bl, 1e-4)) / vec2(uAspect, 1.0) * ring * 0.028 * uBlast;
    }

    // ---------------------------------------------------------------- sampling: radial blurs + chromatic split
    float edgeW = smoothstep(0.22, 0.95, r);
    vec2 blurDir = (vec2(0.5) - uv) * (uSpeed * 0.055 * edgeW) + (uBlastPos - uv) * (uBlast * 0.05);
    vec2 ca = c0 * uChroma * 0.011 * (0.35 + r);
    vec3 col;
    if (dot(blurDir, blurDir) > 1e-7) {
      col = vec3(0.0);
      for (int i = 0; i < TAPS; i++) {
        float t = float(i) / float(TAPS - 1);
        col += sceneTap(uv + blurDir * t, ca);
      }
      col /= float(TAPS);
    } else {
      col = sceneTap(uv, ca);
    }

    // ---------------------------------------------------------------- grading-type adjustments
    float l0 = luma(col);
    col = max(mix(vec3(l0), col, uSat * (1.0 - uDesat)), 0.0);
    if (uFocus > 0.001) {
      float v = smoothstep(0.3, 0.92, r);
      col *= 1.0 - v * uFocus * 0.5;
      col += uCharge.rgb * exp(-abs(r - mix(0.95, 0.3, uCharge.a)) * 40.0) * uCharge.a * 0.35 * step(0.01, uCharge.a);
    }

    // ---------------------------------------------------------------- speed streaks
    if (uSpeed > 0.001) {
      float ang = atan(q.y, q.x);
      float a = ang / 6.28318 * 96.0;
      float id = floor(a);
      float h = hash12(vec2(id, 7.0));
      float lane = abs(fract(a) - 0.5);
      float lw = 0.05 + 0.1 * h;
      float streak = smoothstep(lw, lw * 0.25, lane);
      float mv = fract(r * (1.2 + h) - uTime * (2.2 + 2.4 * h) + h * 10.0);
      float dash = smoothstep(0.0, 0.08, mv) * smoothstep(0.55, 0.25, mv);
      float s = streak * dash * smoothstep(0.42, 1.0, r) * step(0.5, h) * uSpeed;
      col += uSpeedTint * s * 1.3;
    }

    // ---------------------------------------------------------------- swim: submerged tint + caustic glints
    if (uSwim.a > 0.001) {
      float v = smoothstep(0.35, 1.05, r);
      col = mix(col, col * (0.55 + uSwim.rgb * 0.9), v * 0.45 * uSwim.a);
      float cst = vnoise(q * 16.0 + vec2(uTime * 0.7, -uTime * 0.4)) * vnoise(q * 21.0 - vec2(uTime * 0.5, uTime * 0.6));
      col += uSwim.rgb * pow(cst, 3.0) * 1.6 * uSwim.a * v;
    }

    // ---------------------------------------------------------------- low HP heartbeat vignette
    if (uHeart.a > 0.001 || uHurt > 0.001) {
      float v = smoothstep(0.42, 1.08, r + (fbm(q * 2.6 + uTime * 0.08) - 0.44) * 0.18);
      float k = clamp(v * (uHurt * 0.5 + uHeart.a * 0.65), 0.0, 0.9);
      col = mix(col, col * 0.3 + uHeart.rgb * (0.12 + 0.22 * uHeart.a), k);
    }

    // ---------------------------------------------------------------- final-seconds urgency
    if (uUrgency.a > 0.001) {
      float v = smoothstep(0.5, 1.12, r);
      col = mix(col, col * vec3(1.1, 0.78, 0.72) + uUrgency.rgb * 0.2, v * uUrgency.a);
    }

    // ---------------------------------------------------------------- special aura / super-jump charge / kill flash / spawn shimmer
    if (uAura.a > 0.001) {
      float e = edgeD(vUv);
      float ang = atan(q.y, q.x);
      float flow = vnoise(vec2(ang * 4.0 - uTime * 1.2, e * 10.0 - uTime * 2.6));
      float rim = exp(-e * 55.0) * (0.55 + 0.6 * flow);
      float lane = 0.5 + 0.5 * sin(ang * 26.0 - uTime * 7.0 + flow * 3.0);
      float dashes = smoothstep(0.82, 0.97, lane) * exp(-e * 22.0) * 0.9;
      float tint = smoothstep(0.16, 0.0, e) * 0.22;
      col = mix(col, col * (0.7 + uAura.rgb * 0.45), tint * uAura.a);
      col += uAura.rgb * (rim + dashes) * uAura.a;
    }
    if (uKill.a > 0.001) col += uKill.rgb * smoothstep(0.5, 1.15, r) * uKill.a;
    if (uShimmer.a > 0.001) {
      float s = 0.5 + 0.5 * sin(uTime * 9.0 + r * 24.0 - atan(q.y, q.x) * 3.0);
      col += uShimmer.rgb * smoothstep(0.62, 1.12, r) * s * uShimmer.a * 0.35;
    }

    // ---------------------------------------------------------------- blast glow
    if (uBlast > 0.001) {
      float bd = length((vUv - uBlastPos) * vec2(uAspect, 1.0));
      col += uBlastColor * exp(-bd * 6.0) * uBlast * 0.2;
    }

    // ---------------------------------------------------------------- enemy ink underfoot: gooey edge band
    if (uEdgeInk.a > 0.001) {
      float bottom = smoothstep(0.6, 0.0, vUv.y);
      float w = uEdgeInk.a * (0.002 + 0.08 * bottom * bottom + 0.012 * bottom);
      float f = gooBand(vUv, w, 0.85, 11.0);
      float aa = fwidth(f) + 0.0015;
      float m = smoothstep(-aa, aa, f);
      if (m > 0.0) {
        float hgt = smoothstep(0.0, 0.028, f);
        vec3 n = normalize(vec3(-vec2(dFdx(hgt), dFdy(hgt)) * 0.028 * uRes.y * 0.9, 1.0));
        col = mix(col, inkShade(uEdgeInk.rgb, col, n, hgt), m * 0.94);
      }
    }

    // ---------------------------------------------------------------- lens ink (metaball field rendered by LensInk)
    if (uLensOn > 0.5) {
      vec4 Lc = texture2D(tLens, vUv);
      float fs = Lc.r + Lc.g;
      if (fs > 0.03) {
        vec2 tx = uLensTexel * 1.5;
        vec4 Lx1 = texture2D(tLens, vUv + vec2(tx.x, 0.0)), Lx0 = texture2D(tLens, vUv - vec2(tx.x, 0.0));
        vec4 Ly1 = texture2D(tLens, vUv + vec2(0.0, tx.y)), Ly0 = texture2D(tLens, vUv - vec2(0.0, tx.y));
        vec2 gi = vec2((Lx1.r + Lx1.g) - (Lx0.r + Lx0.g), (Ly1.r + Ly1.g) - (Ly0.r + Ly0.g));
        vec3 n = normalize(vec3(-gi * 1.35, 1.0));
        float aa = fwidth(fs) * 1.1 + 0.012;
        float cov = smoothstep(0.5 - aa, 0.5 + aa, fs);
        float film = smoothstep(0.08, 0.5, fs) * (1.0 - cov);
        float thick = clamp((fs - 0.5) * 1.3, 0.0, 1.0);
        vec3 inkCol = (Lc.r * uLensColA + Lc.g * uLensColB) / max(fs, 1e-4);
        vec3 behind = texture2D(tDiffuse, vUv + n.xy * 0.03).rgb;
        vec3 body = inkShade(inkCol, behind, n, thick);
        float rim = smoothstep(0.5, 0.56, fs) * (1.0 - smoothstep(0.56, 0.75, fs));
        body *= 1.0 - rim * 0.3;
        col = mix(col, behind * mix(vec3(1.0), inkCol * 1.5 + 0.1, 0.55), film * 0.42);
        col = mix(col, body, cov);
      }
      float fw = Lc.b;
      if (fw > 0.03) {
        vec2 tx = uLensTexel * 1.5;
        float wx = texture2D(tLens, vUv + vec2(tx.x, 0.0)).b - texture2D(tLens, vUv - vec2(tx.x, 0.0)).b;
        float wy = texture2D(tLens, vUv + vec2(0.0, tx.y)).b - texture2D(tLens, vUv - vec2(0.0, tx.y)).b;
        vec3 n = normalize(vec3(-vec2(wx, wy) * 1.6, 1.0));
        float aa = fwidth(fw) * 1.1 + 0.012;
        float cov = smoothstep(0.5 - aa, 0.5 + aa, fw);
        vec3 refr = texture2D(tDiffuse, vUv - n.xy * 0.07).rgb;
        vec3 L = normalize(vec3(-0.42, 0.62, 0.66));
        float spec = pow(clamp(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0, 1.0), 80.0);
        float fres = pow(1.0 - n.z, 1.6);
        vec3 wcol = refr * (1.02 - fres * 0.55) * vec3(0.93, 0.98, 1.04) + spec * 2.6;
        col = mix(col, wcol, cov);
        col = mix(col, col * 0.92, smoothstep(0.1, 0.5, fw) * (1.0 - cov) * 0.4);
      }
    }

    // ---------------------------------------------------------------- splatted ink flood + respawn iris reveal
    if (uFlood.a > 0.001) {
      float width = uFlood.a * 1.05;
      float f = gooBand(vUv, width, 0.3 * (1.0 - 0.5 * smoothstep(0.7, 1.0, uFlood.a)), 3.7);
      f = max(f, drips(vUv, uFloodDrip, 1.3, width * 0.8));
      if (uHole > 0.0) {
        float hn = (fbm(q * 4.5 + vec2(uTime * 0.4, 0.0)) - 0.44) * 0.16;
        f = min(f, r + hn - uHole);
      }
      float aa = fwidth(f) + 0.0015;
      float m = smoothstep(-aa, aa, f);
      if (m > 0.0) {
        // thickness: bevelled rim + slow glossy undulations inside the sheet
        float und = fbm(q * 2.2 + vec2(uTime * 0.05, -uTime * 0.03)) - 0.44;
        float hgt = smoothstep(0.0, 0.05, f) + und * 1.6 * smoothstep(0.01, 0.16, f);
        vec3 n = normalize(vec3(-vec2(dFdx(hgt), dFdy(hgt)) * 0.05 * uRes.y * 0.8, 1.0));
        if (uFloodClear > 0.5) {
          // sea water sheet: refract + tint instead of opaque ink
          vec3 refr = texture2D(tDiffuse, vUv - n.xy * 0.09).rgb;
          vec3 L = normalize(vec3(-0.42, 0.62, 0.66));
          float spec = pow(clamp(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0, 1.0), 70.0);
          vec3 w = mix(refr, refr * uFlood.rgb * 2.2 + uFlood.rgb * 0.12, 0.55 + 0.3 * clamp(hgt, 0.0, 1.0)) + spec * 2.2;
          col = mix(col, w, m);
        } else {
          float grain = vnoise(q * 60.0) * 0.05;
          col = mix(col, inkShade(uFlood.rgb * (0.94 + grain), col, n, clamp(hgt, 0.0, 1.0)), m);
        }
      }
      if (uHole > 0.0) {
        float rd = abs(r + (fbm(q * 4.5 + vec2(uTime * 0.4, 0.0)) - 0.44) * 0.16 - uHole);
        col += uHoleRim * exp(-rd * 26.0) * 0.9 * (1.0 - smoothstep(0.9, 1.25, uHole));
      }
    }

    // ---------------------------------------------------------------- whiteout flash
    if (uFlash.a > 0.001) {
      col = mix(col, vec3(luma(col)), clamp(uFlash.a * 0.35, 0.0, 0.5));
      col += uFlash.rgb * uFlash.a * (0.2 + 0.8 * smoothstep(0.12, 0.95, r));   // edge-weighted: the centre (the action) stays readable
    }
    gl_FragColor = vec4(col, 1.0);
  }
`,Ee=`
  attribute vec4 iA;   // x, y (uv), rx, ry (screen-height units)
  attribute vec4 iB;   // rotation, intensity, channel, unused
  uniform float uAspect;
  varying vec2 vP; varying float vI; varying vec3 vCh;
  void main() {
    vec2 corner = position.xy;
    float c = cos(iB.x), s = sin(iB.x);
    vec2 lp = vec2(corner.x * iA.z, corner.y * iA.w);
    vec2 rp = vec2(c * lp.x - s * lp.y, s * lp.x + c * lp.y);
    vec2 p = iA.xy + vec2(rp.x / uAspect, rp.y);
    vP = corner; vI = iB.y;
    vCh = iB.z < 0.5 ? vec3(1.0, 0.0, 0.0) : iB.z < 1.5 ? vec3(0.0, 1.0, 0.0) : vec3(0.0, 0.0, 1.0);
    gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
  }`,Pe=`
  varying vec2 vP; varying float vI; varying vec3 vCh;
  void main() {
    float d2 = dot(vP, vP);
    if (d2 >= 1.0) discard;
    float k = 1.0 - d2; k = k * k;
    gl_FragColor = vec4(vCh * k * vI, 0.0);
  }`,G=220,F=0,ge=1,Ce=2,te=class{constructor(s){this.r=s,this.parts=[],this.pool=[];let a=new ce(2,2),t=new me;t.index=a.index,t.setAttribute("position",a.getAttribute("position")),this.aA=new X(new Float32Array(G*4),4).setUsage(N),this.aB=new X(new Float32Array(G*4),4).setUsage(N),t.setAttribute("iA",this.aA),t.setAttribute("iB",this.aB),t.instanceCount=0,this.geo=t,this.mat=new Q({uniforms:{uAspect:{value:16/9}},vertexShader:Ee,fragmentShader:Pe,depthTest:!1,depthWrite:!1,transparent:!0,blending:ie,blendEquation:W,blendSrc:I,blendDst:I,blendEquationAlpha:W,blendSrcAlpha:I,blendDstAlpha:I});let o=new ue(t,this.mat);o.frustumCulled=!1,this.scene=new he,this.scene.add(o),this.cam=new fe,this.rt=new ne(4,4,{type:re,depthBuffer:!1,stencilBuffer:!1,minFilter:K,magFilter:K}),this.texel=new U(.25,.25),this.scale=1/3,this.dirty=!1}resize(s,a,t){let o=Math.max(64,Math.round(s*t)),e=Math.max(36,Math.round(a*t));(this.rt.width!==o||this.rt.height!==e)&&(this.rt.setSize(o,e),this.texel.set(1/o,1/e),this.dirty=!0)}_new(){if(this.parts.length>=G){let a=-1,t=1/0;for(let e=0;e<this.parts.length;e++){let l=this.parts[e],i=l.kind==="trail"?l.I:l.I+10;i<t&&(t=i,a=e)}let o=this.parts[a];this.parts.splice(a,1),this.pool.push(o)}let s=this.pool.pop()||{};return s.vx=0,s.vy=0,s.rot=0,s.age=0,s.slide=!1,s.trailT=0,s.hold=0,s.pop=1,s.grow=0,s.seed=Math.random()*100,this.parts.push(s),s}add(s,a,t,o,e,{rx:l=e,ry:i=e,rot:h=0,I:r=1,life:c=1.5,stick:m=99,pop:p=.09}={}){let u=this._new();return u.kind=s,u.ch=a,u.x=t,u.y=o,u.r=e,u.rx=l,u.ry=i,u.rot=h,u.I0=u.I=r,u.life=c,u.stick=m,u.pop=p,u.grow=p>0?0:1,u}splat(s,a,t,o,e,{arms:l=6,sats:i=6,life:h=2.1}={}){let r=Math.random()*D,c=(u,v,g,b)=>[u+Math.cos(g)*b/e,v+Math.sin(g)*b],m=this.add("drop",s,a,t,o*.92,{I:1.4,life:h*n(.95,1.15),stick:n(.25,.55)});m.mass=1;let p=3+(Math.random()*2|0);for(let u=0;u<p;u++){let v=r+u/p*D+n(-.5,.5),[g,b]=c(a,t,v,o*n(.3,.55)),C=this.add("drop",s,g,b,o*n(.5,.72),{I:1.25,life:h*n(.75,1),stick:n(.5,1.2)});C.mass=.6}for(let u=0;u<l;u++){let v=r+(u+n(-.3,.3))/l*D,g=Math.random()<.3,b=o*(g?n(1.35,1.8):n(.85,1.2)),[C,x]=c(a,t,v,b*.5);this.add("arm",s,C,x,o*.3,{rx:o*n(.2,.3)*(g?.8:1),ry:b*.5,rot:v-Math.PI/2,I:1.3,life:h*n(.6,.85)});let[A,R]=c(a,t,v,b),S=this.add("drop",s,A,R,o*(g?n(.26,.34):n(.3,.42)),{I:1.35,life:h*n(.7,1),stick:n(.4,1.1)});S.mass=.4}for(let u=0;u<i;u++){let v=Math.random()*D,g=o*n(1.45,2.5),b=o*n(.07,.16),[C,x]=c(a,t,v,g),A=Math.random()<.4;this.add("sat",s,C,x,b,{rx:b*(A?.7:1),ry:b*(A?1.9:1),rot:v-Math.PI/2,I:1.3,life:n(.5,1.3),pop:.05})}this.dirty=!0}droplet(s,a,t,o,{slide:e=.25,life:l=1.1}={}){let i=this.add("drop",s,a,t,o,{I:1.3,life:l,stick:e,pop:.05});return i.mass=.3,this.dirty=!0,i}clear(){for(;this.parts.length;)this.pool.push(this.parts.pop());this.dirty=!0}update(s,a){let t=this.parts;for(let o=t.length-1;o>=0;o--){let e=t[o];e.age+=s,e.grow<1&&(e.grow=Math.min(1,e.grow+s/Math.max(.01,e.pop)));let l=e.age>e.life?1-(e.age-e.life)/(e.kind==="trail"?.9:.55):1;if(e.kind==="trail"?e.I=e.I0*d(1-e.age/e.life,0,1):e.I=e.I0*d(l,0,1),e.I<=.01){t.splice(o,1),this.pool.push(e);continue}if(e.kind==="drop"){if(!e.slide&&e.age>e.stick&&e.r>.012&&(e.slide=!0),e.slide){e.hold-=s,e.hold<=0&&Math.random()<s*.45&&(e.hold=n(.06,.22));let i=e.hold>0?0:1.05*(e.r/.05)*(.55+.45*(e.mass||1));e.vy-=i*s,e.vy*=Math.exp(-s*(e.hold>0?12:2.1)),e.vx=Math.sin(e.age*2.3+e.seed)*.006+Math.sin(e.age*6.1+e.seed*2)*.003;let h=e.vx*s,r=e.vy*s;e.x+=h,e.y+=r;let c=-e.vy;e.trailT+=Math.hypot(h*a,r),e.trailT>e.r*.55&&(e.trailT=0,this.add("trail",e.ch,e.x,e.y+e.r*.45,e.r*.55,{rx:e.r*.42,ry:e.r*.72,I:.5,life:1.2,pop:0}),e.r*=.965),e.ry=e.r*(1+Math.min(.9,c*9)),e.rx=e.r*(1-Math.min(.25,c*2.5)),e.r<.01&&(e.slide=!1,e.life=Math.min(e.life,e.age+.2))}else e.rx=e.ry=e.r;if(e.y<-.1){t.splice(o,1),this.pool.push(e);continue}}}this.dirty=!0}render(s){let a=this.parts,t=Math.min(a.length,G),o=this.aA.array,e=this.aB.array;for(let r=0;r<t;r++){let c=a[r],m=c.grow<1?.35+.65*O(c.grow)*(1+.12*Math.sin(c.grow*Math.PI)):1;o[r*4]=c.x,o[r*4+1]=c.y,o[r*4+2]=c.rx*m,o[r*4+3]=c.ry*m,e[r*4]=c.rot,e[r*4+1]=c.I,e[r*4+2]=c.ch,e[r*4+3]=0}this.aA.needsUpdate=!0,this.aB.needsUpdate=!0,this.geo.instanceCount=t,this.mat.uniforms.uAspect.value=s;let l=this.r,i=l.getRenderTarget();l.getClearColor(ee);let h=l.getClearAlpha();l.setRenderTarget(this.rt),l.setClearColor(0,0),l.clear(!0,!1,!1),t&&l.render(this.scene,this.cam),l.setRenderTarget(i),l.setClearColor(ee,h),this.dirty=!1}dispose(){this.rt.dispose(),this.geo.dispose(),this.mat.dispose()}},be=class{constructor(s,a){this.R=s,this.G=a||de,this.renderer=s.renderer,this.time=0,this.lens=new te(this.renderer),this.taps=0,this.mat=new Q({name:"InkwaveScreenFX",defines:{TAPS:8},uniforms:{tDiffuse:{value:null},tLens:{value:this.lens.rt.texture},uRes:{value:new U(1600,900)},uAspect:{value:16/9},uTime:{value:0},uSpeed:{value:0},uSpeedTint:{value:new P(1,1,1)},uStretch:{value:0},uPunch:{value:0},uPunchPos:{value:new U(.5,.5)},uBlast:{value:0},uBlastPos:{value:new U(.5,.5)},uBlastRing:{value:0},uBlastColor:{value:new P(1,.9,.8)},uChroma:{value:0},uLensOn:{value:0},uLensTexel:{value:this.lens.texel},uLensColA:{value:new P(.1,.2,1)},uLensColB:{value:new P(1,.4,.05)},uEdgeInk:{value:new E(0,0,0,0)},uAura:{value:new E(0,0,0,0)},uHeart:{value:new E(.6,.02,.06,0)},uHurt:{value:0},uUrgency:{value:new E($.r,$.g,$.b,0)},uSwim:{value:new E(0,0,0,0)},uFocus:{value:0},uCharge:{value:new E(1,1,1,0)},uShimmer:{value:new E(0,0,0,0)},uFlood:{value:new E(0,0,0,0)},uFloodDrip:{value:0},uFloodClear:{value:0},uHole:{value:0},uHoleRim:{value:new P(1,1,1)},uFlash:{value:new E(1,1,1,0)},uDesat:{value:0},uSat:{value:1},uKill:{value:new E(1,1,1,0)}},vertexShader:Me,fragmentShader:ke,depthTest:!1,depthWrite:!1}),this.U=this.mat.uniforms,this.pass=new pe(this.mat),this.pass.enabled=!1,s.setExtraPass(this.pass),this.s={speed:0,stretch:0,punch:0,punchV:0,blast:0,blastT:9,chroma:0,edgeInk:0,aura:0,auraPulse:0,heart:0,heartPh:0,hurt:0,urg:0,urgBase:0,swim:0,focus:0,chargePulse:0,shimmer:0,kill:0,flash:0,desat:0,sat:1,satPop:0,flood:0,floodDrip:0,hole:0,floodMode:null,floodT:0,holeT:0,jump:null,jumpCharge:0,wasJump:!1,stepT:0,rainT:0,emergeT:0,lastForm:"kid",dmgAcc:0,dmgT:0,dmgAng:null,dmgAtk:null,lastBlast:{t:-9,x:0,y:0,z:0}},this._aspect=16/9,this._w=0,this._h=0,this._inMatch=!1,this._local=null,this.debugHold=0,this.stats={lensParts:0,enabled:!1},this._size=new U,this._bind(),this.G.hud?.attachScreenFX?.(this),this.G.screenfx=this}_bind(){let s=this.G,a=()=>{let e=s.match;return!!(e&&!e.attract&&s.mode==="match"&&(e.state==="playing"||e.state==="intro"||e.state==="finish"))},t=e=>!!(e&&e.isLocal&&a());T("damage",({victim:e,attacker:l,amount:i,source:h})=>{if(!t(e)||i<=0)return;let r=this.s;r.dmgAcc+=i,r.dmgAtk=l||r.dmgAtk,r.dmgT<=0&&(r.dmgT=.06);let c=d(i/60,.1,1);r.chroma=Math.min(.9,r.chroma+.12+c*.4),i>=40&&this._kickPunch(-.005-.008*c)}),T("hit",({attacker:e,killed:l})=>{t(e)&&l&&(this.s.kill=1,this.s.chroma=Math.min(1,this.s.chroma+.3),this._kickPunch(.012))}),T("splatted",({victim:e,attacker:l,cause:i})=>{a()&&e?.isLocal&&this._startFlood(l,i)}),T("respawn",({actor:e})=>{t(e)&&this._startReveal(e)}),T("superjump",({actor:e,phase:l})=>{if(!t(e))return;let i=this.s;l==="charge"?i.jump={phase:"charge",t:0}:l==="flight"&&(i.jump={phase:"flight",t:0},i.flash=.5,i.chroma=Math.min(1.2,i.chroma+.6),this._kickPunch(-.04))}),T("superjump:land",({actor:e})=>{t(e)&&this._land(e)}),T("special:use",({actor:e,id:l})=>{t(e)&&(this.s.auraPulse=1,this.s.chroma=Math.min(1,this.s.chroma+.25),l==="storm"&&(this.s.aura=Math.max(this.s.aura,.9)))});let o=(e,l,i)=>{if(!e||!a())return;let h=this.s.lastBlast;if(this.time-h.t<.05&&Math.abs(h.x-e.x)+Math.abs(h.y-e.y)+Math.abs(h.z-e.z)<.8){i&&this.U.uBlastColor.value.copy(i).lerp(H,.35);return}h.t=this.time,h.x=e.x,h.y=e.y,h.z=e.z,this._blast(e,l,i)};T("shake",({amount:e,pos:l})=>{l&&o(l,e,null)}),T("bomb:explode",({pos:e,team:l})=>o(e,.6,s.teamColors?.[l])),T("special:slam",({pos:e,actor:l})=>{o(e,1,l?s.teamColors?.[l.team]:null),l&&l.isLocal&&(this.s.blast*=.55,this.s.chroma*=.7)}),T("match:state",({state:e,match:l})=>{if(!l||l.attract)return;let i=this.s;e==="intro"&&this.reset(),e==="playing"&&(i.satPop=1,i.chroma=Math.min(1,i.chroma+.35),this._kickPunch(.015)),(e==="judge"||e==="results")&&(i.floodMode=i.flood>0?"fadeout":null,i.floodT=0,this.lens.clear())}),T("weapon:impact",({pos:e,team:l,kind:i})=>{if(!a()||!e||i==="roll")return;let h=s.match&&s.match.local,r=s.camera;if(!h||!h.alive||l===h.team||!r)return;let c=r.position.distanceToSquared(e);if(c>2.4*2.4||(V.copy(e).project(r),V.z>1))return;let m=Math.min(.97,Math.max(.03,V.x*.5+.5)),p=Math.min(.97,Math.max(.05,V.y*.5+.5)),u=c<1.2?3:1+(Math.random()*2|0);for(let v=0;v<u;v++)this.lens.droplet(F,Math.min(.98,Math.max(.02,m+n(-.06,.06))),Math.min(.97,Math.max(.04,p+n(-.06,.06))),n(.008,.02),{slide:n(.1,.35),life:n(.5,1)})}),T("match:count",({n:e})=>{a()&&(this.s.urg=1,this.s.urgBase=d((11-e)/10,0,1)*.35)})}_kickPunch(s){this.s.punchV+=s*22}_blast(s,a,t){let o=this.G,e=o.camera;if(!e)return;let l=e.position.distanceTo(s),i=a*d(1-(l-3)/24,0,1);if(i<.04)return;k.copy(s).project(e);let h=k.z<1&&Math.abs(k.x)<1.25&&Math.abs(k.y)<1.25,r=this.s;h&&(this.U.uBlastPos.value.set(k.x*.5+.5,k.y*.5+.5),r.blast=Math.min(1.2,Math.max(r.blast,i*1.1)),r.blastT=0,this.U.uBlastColor.value.copy(t||H).lerp(H,.35),this.U.uPunchPos.value.copy(this.U.uBlastPos.value)),r.chroma=Math.min(1.3,r.chroma+i*.9),this._kickPunch(.02*i)}_teamColor(s){return this.G.teamColors?.[s]||H}_startFlood(s,a){let t=this.s,o=this.U,e=a==="water"?we:s?this._teamColor(s.team):this._teamColor(this._local?this._local.enemyTeam:1);if(o.uFlood.value.set(e.r,e.g,e.b,t.flood),o.uFloodClear.value=a==="water"?1:0,t.floodMode="in",t.floodT=0,t.hole=0,t.jump=null,t.chroma=Math.min(1.4,t.chroma+.9),this._kickPunch(-.03),a==="water"){let l=this._aspect;for(let i=0;i<34;i++)this.lens.droplet(Ce,Math.random(),n(.05,1),n(.01,.034),{slide:n(.3,1.2),life:n(1.8,3.6)})}}_startReveal(s){let a=this.s,t=this.U,o=this._teamColor(s.team);t.uFlood.value.set(o.r,o.g,o.b,1),t.uFloodClear.value=0,t.uHoleRim.value.copy(o).lerp(H,.55).multiplyScalar(1.6),a.flood=1,a.floodMode="reveal",a.floodT=0,a.hole=1e-4,a.floodDrip=.05,this.lens.clear(),a.desat=Math.min(a.desat,.3),a.shimmer=1}_land(s){let a=this.s;this.time-(this._landT??-9)<.3||(this._landT=this.time,a.jump=null,this.U.uPunchPos.value.set(.5,.3),this.U.uBlastPos.value.set(.5,.18),this.U.uBlastColor.value.copy(this._teamColor(s.team)).lerp(H,.3),a.blast=Math.max(a.blast,.75),a.blastT=0,a.chroma=Math.min(1.3,a.chroma+.7),this._kickPunch(.045),a.flash=Math.max(a.flash,.35))}_damageSplat(s,a){let t=this.G,o=t.camera,e=this._aspect,l=d(s/70,.18,1.2),i=null;if(a&&o&&a.pos){k.copy(a.pos),k.y+=1,k.project(o);let r=k.x,c=k.y,m=k.z>1;m&&(r=-r,c=-c),!m&&Math.abs(r)<1&&Math.abs(c)<1?(i=r>=0?0:Math.PI,i+=n(-.35,.35)):i=Math.atan2(c,r*e)}i===null&&(i=Math.random()*D);let h=l>.7?2:1;for(let r=0;r<h;r++){let c=i+(r?n(-.7,.7):n(-.18,.18)),m=(.045+.05*l)*(r?.6:1)*n(.85,1.15),p=this._edgePoint(c,m*n(.2,.9));this.lens.splat(F,p.x,p.y,m,e,{arms:6+(Math.random()*4|0),sats:5+(Math.random()*5|0),life:1.5+l*.9})}}_edgePoint(s,a){let t=this._aspect,o=Math.cos(s),e=Math.sin(s),l=Math.min(t/2/Math.max(.001,Math.abs(o)),.5/Math.max(.001,Math.abs(e))),i=t/2+o*l,h=.5+e*l;i-=Math.sign(o)*a*(Math.abs(o)>.25?1:.3),h-=Math.sign(e)*a*(Math.abs(e)>.25?1:.3);let r=i/t,c=h;return c<.5&&Math.abs(r-.5)<.2&&(r=.5+Math.sign(r-.5||Math.random()-.5)*n(.22,.3)),{x:d(r,.02,.98),y:d(c,.03,.97)}}reset(){let s=this.s;this.lens.clear(),Object.assign(s,{speed:0,stretch:0,punch:0,punchV:0,blast:0,chroma:0,edgeInk:0,aura:0,auraPulse:0,heart:0,hurt:0,urg:0,urgBase:0,swim:0,focus:0,shimmer:0,kill:0,flash:0,desat:0,sat:1,satPop:0,flood:0,floodDrip:0,hole:0,floodMode:null,jump:null,dmgAcc:0,dmgT:0})}update(s,a){let t=this.G,o=this.s,e=this.U,l=a?.match||t.match,i=!!(l&&!l.attract&&t.mode==="match"),h=!!(l&&l.paused);!i&&this._inMatch&&this.reset(),this._inMatch=i;let r=i?l.local:null;this._local=r,this.debugHold=Math.max(0,this.debugHold-s);let c=i||this.debugHold>0,m=h?0:s;this.time+=m,this.renderer.getDrawingBufferSize(this._size);let p=this._size.x,u=this._size.y;(p!==this._w||u!==this._h)&&(this._w=p,this._h=u,e.uRes.value.set(p,u)),this._aspect=p/Math.max(1,u),e.uAspect.value=this._aspect;let v=Z[t.settings?.quality]||Z.high,g=v.particles>=1?8:v.particles>=.7?6:5;g!==this.taps&&(this.taps=g,this.mat.defines.TAPS=g,this.mat.needsUpdate=!0),this.lens.resize(p,u,v.particles>=1?1/3:1/4);let b=d(t.settings?.cameraShake??1,0,1),C=Te()?.35:1,x=b*C;c&&!h?this._sim(m,l,r):c||this._decayAll(s),this.force&&this.debugHold>0?Object.assign(o,this.force):this.force&&this.debugHold<=0&&(this.force=null);let A=!!(r&&r.alive);if(e.uTime.value=this.time,e.uSpeed.value=o.speed*x,e.uStretch.value=o.stretch*x,e.uPunch.value=d(o.punch,-.08,.08)*x,e.uBlast.value=o.blast*x,e.uBlastRing.value=O(o.blastT/.55)*.9,e.uChroma.value=Math.min(1.5,o.chroma)*x,e.uEdgeInk.value.w=o.edgeInk,e.uAura.value.w=o.aura*(.55+.45*x),e.uHeart.value.w=o.heart,e.uHurt.value=o.hurt,e.uUrgency.value.w=o.urg,e.uSwim.value.w=o.swim,e.uFocus.value=o.focus,e.uCharge.value.w=o.chargePulse*x,e.uShimmer.value.w=o.shimmer,e.uKill.value.w=o.kill*(.5+.5*x),e.uFlash.value.w=o.flash*(.3+.7*x),e.uDesat.value=o.desat,e.uSat.value=o.sat+o.satPop*.28,e.uFlood.value.w=o.flood,e.uFloodDrip.value=o.floodDrip,e.uHole.value=o.hole,r){let f=this._teamColor(r.team),L=this._teamColor(r.enemyTeam);e.uLensColA.value.copy(L),e.uLensColB.value.copy(f),e.uEdgeInk.value.set(L.r,L.g,L.b,o.edgeInk),q.copy(L).lerp(ee.setRGB(.55,0,.04),.55),e.uHeart.value.set(q.r,q.g,q.b,o.heart),e.uAura.value.set(f.r*1.6,f.g*1.6,f.b*1.6,e.uAura.value.w),e.uSwim.value.set(f.r,f.g,f.b,o.swim),e.uSpeedTint.value.copy(f).lerp(H,.6),e.uKill.value.set(f.r*1.3,f.g*1.3,f.b*1.3,e.uKill.value.w),e.uShimmer.value.set(f.r+.3,f.g+.3,f.b+.3,o.shimmer),e.uCharge.value.set(f.r+.5,f.g+.5,f.b+.5,e.uCharge.value.w)}let R=this.lens.parts.length>0;e.uLensOn.value=R?1:0,R&&!a?._skipRender&&this.lens.render(this._aspect),this.stats.lensParts=this.lens.parts.length;let S=R||o.speed>.002||o.stretch>5e-4||Math.abs(o.punch)>4e-4||o.blast>.002||o.chroma>.004||o.edgeInk>.002||o.aura>.002||o.heart>.002||o.hurt>.002||o.urg>.002||o.swim>.002||o.focus>.002||o.chargePulse>.002||o.shimmer>.002||o.kill>.002||o.flash>.002||o.desat>.002||Math.abs(o.sat-1)>.002||o.satPop>.002||o.flood>.001;this.pass.enabled=S,this.stats.enabled=S}_decayAll(s){let a=this.s,t=Math.exp(-s*6);for(let o of["speed","stretch","blast","chroma","edgeInk","aura","auraPulse","heart","hurt","urg","swim","focus","chargePulse","shimmer","kill","flash","desat","satPop","flood"])a[o]*=t,a[o]<.001&&(a[o]=0);a.punch*=t,a.punchV=0,a.sat=M(a.sat,1,6,s),a.hole=0,a.floodMode=null,this.lens.update(s,this._aspect),this.lens.parts.length&&s>0}_sim(s,a,t){let o=this.G,e=this.s,l=!!(t&&t.alive),i=a?a.state:"playing";e.dmgT>0&&(e.dmgT-=s,e.dmgT<=0&&(e.dmgAcc>0&&l&&this._damageSplat(e.dmgAcc,e.dmgAtk),e.dmgAcc=0,e.dmgAtk=null));let h=l?Math.hypot(t.vel.x,t.vel.z):0,r=l?t.anim.form:"kid",c=r==="swim"||r==="climb",m=c?d((h-6.5)/5.3,0,1)*.55:0,p=c?d((h-7)/4.8,0,1)*.045:0,u=l?t.superJumpState:null;if(u&&u.phase==="flight"){let w=d(u.t/(u.dur||1.2),0,1);m=.55+.45*Math.abs(Math.cos(w*Math.PI)),p=.06*(.4+.6*Math.abs(Math.cos(w*Math.PI)))}e.speed=M(e.speed,m,m>e.speed?5:3,s),e.stretch=M(e.stretch,p,4,s);let v=e.wasJump;if(e.wasJump=!!(u&&u.phase==="flight"),v&&!e.wasJump&&l&&this._land(t),u&&u.phase==="charge"?e.jumpCharge=Math.min(1,e.jumpCharge+s/.75):e.jumpCharge=Math.max(0,e.jumpCharge-s*3),e.swim=M(e.swim,l&&r==="swim"?1:0,7,s),l&&e.lastForm==="swim"&&r!=="swim"&&r!=="climb"&&(h>7||t.vel.y>4)&&e.emergeT<=0){e.emergeT=.6;let w=2+(Math.random()*3|0);for(let _=0;_<w;_++){let B=Math.random()<.5?n(.04,.3):n(.7,.96);this.lens.droplet(ge,B,n(.03,.22),n(.008,.016),{slide:n(.05,.2),life:n(.45,.8)})}}e.emergeT-=s,e.lastForm=r;let g=l&&(t.onEnemy!==void 0?!!t.onEnemy:t.grounded&&t.groundTeam===2&&!t.submerged);if(e.edgeInk=M(e.edgeInk,g?1:0,g?9:3,s),g&&h>.8&&(e.stepT-=s*(.6+h/3),e.stepT<=0)){e.stepT=n(.22,.4);let w=Math.random()<.5?n(.03,.34):n(.66,.97);this.lens.droplet(F,w,n(.02,.14),n(.012,.024),{slide:n(.1,.4),life:n(.6,1.1)})}let b=o.projectiles?.clouds;if(l&&b&&b.length)for(let w of b){let _=w.group?.position;if(!_)continue;let B=_.x-t.pos.x,oe=_.z-t.pos.z;if(B*B+oe*oe<3.6*3.6&&w.t<w.dur){if(e.rainT-=s,e.rainT<=0){e.rainT=n(.05,.12);let xe=w.team===t.team?ge:F,j=Math.random(),le=n(.15,1);Math.abs(j-.5)<.16&&Math.abs(le-.5)<.2&&(j+=.3*Math.sign(j-.5||1)),this.lens.droplet(xe,d(j,.02,.98),le,n(.008,.02),{slide:n(.02,.2),life:n(.5,1.1)})}break}}let C=l?d(t.hp/100,0,1):1,x=l?d((.5-C)/.38,0,1):0;if(e.hurt=M(e.hurt,x,4,s),x>0){let w=80+70*x;e.heartPh=(e.heartPh+s*w/60)%1;let _=e.heartPh,B=Math.exp(-Math.pow((_-.04)/.05,2))+.7*Math.exp(-Math.pow((_-.24)/.055,2));e.heart=x*B}else e.heart=M(e.heart,0,6,s);let A=l&&!!t.specialActive;e.auraPulse=Math.max(0,e.auraPulse-s*1.4);let R=Math.max(A?.75:0,e.jumpCharge*.9,e.auraPulse*.9);e.aura=M(e.aura,R,R>e.aura?10:2.5,s);let S=l?t.weaponRunner:null,f=S&&S.charging?S.charge:0;e.focus=M(e.focus,f>0?.25+.75*f:0,8,s),f>=.999&&!e._fullCharge&&(e._fullCharge=!0,e.chargePulse=1),f<.999&&(e._fullCharge=!1),e.chargePulse=Math.max(0,e.chargePulse-s*2.4),e.shimmer=M(e.shimmer,l&&t.invuln>0&&i==="playing"?.7:0,5,s),e.urg=Math.max(i==="playing"&&a&&a.time<=10.2?e.urgBase:0,e.urg-s*1.6),i!=="playing"&&(e.urgBase=0);let L=i==="finish"?.45:e.floodMode&&e.floodMode!=="reveal"&&e.floodMode!=="fadeout"?.62:0;e.desat=M(e.desat,L,5,s),e.sat=M(e.sat,i==="finish"?.92:1,4,s),e.satPop=Math.max(0,e.satPop-s*2.2),e.kill=Math.max(0,e.kill-s*2.4),e.flash=Math.max(0,e.flash-s*(e.flash>.6?4.5:2.6)),e.chroma=Math.max(0,e.chroma-s*3.2),e.blast=Math.max(0,e.blast-s*2.4),e.blastT+=s;let z=16,ae=Math.max(1,Math.ceil(z*s/.12)),se=s/ae;for(let w=0;w<ae;w++)e.punchV+=(-z*z*e.punch-2*z*e.punchV)*se,e.punch+=e.punchV*se;e.jumpCharge>0&&(e.punch=Y(e.punch,-.012*e.jumpCharge,.2)),this._simFlood(s),this.lens.update(s,this._aspect)}_simFlood(s){let a=this.s;if(!a.floodMode){a.flood=Math.max(0,a.flood-s*2),a.hole=0;return}a.floodT+=s;let t=a.floodT;if(a.floodMode==="in")t<.24?a.flood=ye(t/.24):t<.5?a.flood=1:a.flood=Y(1,.17,O((t-.5)/.8)),a.floodDrip=Math.min(.4,t<.5?.05:.05+(t-.5)*.08);else if(a.floodMode==="reveal"){a.flood=1,a.floodDrip=.05;let o=d((t-.1)/.72,0,1);a.hole=t<.1?1e-4:(Math.pow(o,1.7)*.75+O(o)*.25)*1.32,t>.86&&(a.floodMode=null,a.flood=0,a.hole=0)}else a.floodMode==="fadeout"&&(a.flood=Math.max(0,a.flood-s*2.5),a.flood<=0&&(a.floodMode=null))}test(s,a={}){let t=this.s,o=this._local||this.G.match?.local||null;this.debugHold=a.hold??8;let e=o?o.team:0,l=this._teamColor(e),i=this._teamColor(1-e);switch(o||(this.U.uLensColA.value.copy(i),this.U.uLensColB.value.copy(l),this.U.uEdgeInk.value.set(i.r,i.g,i.b,0)),s){case"splat":{let h=a.angle??Math.random()*D,r=this._edgePoint(h,a.inset??.05);this.lens.splat(F,a.x??r.x,a.y??r.y,a.size??.08,this._aspect,{life:a.life??2.2});break}case"damage":this._damageSplat(a.amount??50,a.attacker||null),t.chroma=Math.min(1.2,t.chroma+.7),this._kickPunch(-.025);break;case"water":this._startFlood(null,"water");break;case"flood":this.U.uFlood.value.set(i.r,i.g,i.b,0),this.U.uFloodClear.value=0,t.floodMode="in",t.floodT=a.t??0;break;case"reveal":this.U.uFloodClear.value=0,this.U.uFlood.value.set(l.r,l.g,l.b,1),this.U.uHoleRim.value.copy(l).lerp(H,.55).multiplyScalar(1.6),t.floodMode="reveal",t.floodT=a.t??0,t.flood=1;break;case"blast":this.U.uBlastPos.value.set(a.x??.5,a.y??.45),this.U.uPunchPos.value.copy(this.U.uBlastPos.value),this.U.uBlastColor.value.copy(l).lerp(H,.35),t.blast=a.amount??1,t.blastT=0,t.chroma=1,this._kickPunch(.02);break;case"jump":t.flash=.5,t.chroma=1,t.speed=1,t.stretch=.06,this._kickPunch(-.04);break;case"land":o?this._land(o):(this.U.uBlastPos.value.set(.5,.18),t.blast=.75,t.blastT=0,t.chroma=1,this._kickPunch(.045),t.flash=.35);break;case"speed":t.speed=a.amount??.6,t.stretch=.045;break;case"heart":t.hurt=a.amount??.8,t.heart=1,this.force={...this.force||{},hurt:a.amount??.8,heart:a.beat??.9};break;case"urgency":t.urg=1,t.urgBase=.3;break;case"aura":t.aura=.8,t.auraPulse=1,this.force={...this.force||{},aura:.8};break;case"kill":t.kill=1,t.chroma=.3;break;case"edge":t.edgeInk=1,this.force={...this.force||{},edgeInk:1};break;case"swim":t.swim=1,this.force={...this.force||{},swim:1,speed:.55,stretch:.045};break;case"focus":t.focus=1,t.chargePulse=1,this.force={...this.force||{},focus:1};break;case"urgencyHold":this.force={...this.force||{},urg:a.amount??.8};break;case"rain":for(let h=0;h<30;h++)this.lens.droplet(F,Math.random(),n(.1,1),n(.008,.02),{slide:n(.02,.2),life:n(.8,1.6)});break;case"clear":this.reset(),this.force=null;break;default:console.warn("[screenfx] unknown test",s)}return s}dispose(){this.lens.dispose(),this.mat.dispose()}};export{be as ScreenFX};
