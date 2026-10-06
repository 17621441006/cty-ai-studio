import{a as n}from"./chunk-VC46IEJQ.js";var i={plain:0,deck:1,tiles:2,concrete:3,hazard:4,container:5,wood:6,metal:7,spawn:8,planter:9,asphalt:10,metalpanel:11,grate:12,brick:13,rubber:14,glasstile:15,pavers:16,planks:17,hullpaint:18,nonslip:19,gelcoat:20,yard:21,weatherboard:22,render:23,treads:24,stonestep:25,rampboard:26,gangdeck:27};function v(e,o,t,a,s,r,c={}){return{kind:"box",min:[e,t,s],max:[o,a,r],...c}}function o0(e,o,t,a={}){return{kind:"ramp",low:e,high:o,width:t,thickness:a.thickness??.6,...a}}function B(e,o,t,a,s,r,c,l={}){return{kind:"obox",center:[e,(s+r)/2,o],size:[t,r-s,a],rotY:c,...l}}function t0(e,o,t,a,s,r={}){let c=t*Math.cos(Math.PI/8),l=t*Math.sin(Math.PI/8),f={...r,oct:[e,o,t]},u=[v(e-c,e+c,a,s,o-l,o+l,f),v(e-l,e+l,a,s,o+l,o+c,f),v(e-l,e+l,a,s,o-c,o-l,f)],p=c-l*Math.SQRT2+Math.min(.3,.12*t),w=(c-p/2)/Math.SQRT2;for(let[b,g]of[[1,1],[1,-1],[-1,1],[-1,-1]])u.push(B(e+b*w,o+g*w,2*l,p,a,s-.1,b*g>0?45:-45,f));return u}var j={};n(j,{SURF:()=>F,SURFACES:()=>q});var F={herringbone:28,terrazzo:29,stucco:30},$={detail:.6,scale:2.4,tint:!0,mask:!0,alpha:!1,mode:0,sym:0,hr:[-.012,.0014],ao:.5,prep:`f[0] = FB(uv, ivec2(4), 4, 0.5, 2801u); f[1] = FB(uv, ivec2(40), 3, 0.5, 2803u); f[2] = FB(uv, ivec2(160), 2, 0.5, 2807u);
  w[0] = WO(uv, ivec2(120), 1.0, 2809u);`,surf:`
  // 90\xB0 herringbone of 2:1 bricks on a 120 mm cell grid: along each diagonal strand a stretcher (2 x 1 cells) and a
  // soldier (1 x 2) alternate; strands repeat every 4 cells, so the pattern tiles on 20 cells = 2.4 m exactly
  const float W = 0.12;
  vec2 p = P / W;
  ivec2 cc = ivec2(floor(p));
  float dd = float(cc.x - cc.y); dd -= 4.0 * floor(dd / 4.0);
  vec2 org = vec2(cc), ext = vec2(1.0, 2.0);
  if (dd < 1.5) { org.x -= dd; ext = vec2(2.0, 1.0); }
  else if (dd < 2.5) { org.y -= 1.0; }
  vec2 hb = ext * (0.5 * W);
  vec2 q = (p - org) * W - hb;
  float e = -sdRB(q, hb, 0.008);
  vec2 pr = edgeProf(e, 0.0028, 0.01, 0.0026, 0.009);
  float inJ = pr.y;
  ivec2 bid = wrp(ivec2(org), ivec2(20));
  float b1 = hf(bid, 3u), b2 = hf(bid, 5u), b3 = hf(bid, 7u), b4 = hf(bid, 11u);
  float mott = n[0], tex = n[1], sand = n[2];
  vec4 wc = c[0];
  float pit = step(0.9, wc.z) * (1.0 - aa(0.0025 + 0.002 * fract(wc.z * 7.3), wc.x * (2.4 / 120.0))) * (1.0 - inJ);
  vec2 qn = q / hb;
  float crown = 1.0 - 0.6 * dot(qn * qn, vec2(1.0));
  float tone = 0.8 * (1.0 + 0.24 * (b1 - 0.5)) * (1.0 + 0.06 * mott + 0.045 * tex + 0.03 * sand) * (1.0 - 0.14 * pit);
  tone *= b2 > 0.91 ? 0.74 : (b2 < 0.06 ? 1.12 : 1.0);                       // a few over-fired / pale bricks
  float arris = clamp(1.0 - (e - 0.0028) / 0.012, 0.0, 1.0) * (1.0 - inJ);
  float grime = (1.0 - smoothstep(0.0, 0.03, e - 0.0028)) * (1.0 - inJ) * (0.6 + 0.4 * smoothstep(-0.3, 0.6, mott));
  tone *= (1.0 - 0.1 * arris) * (1.0 - 0.14 * grime);
  float worn = smoothstep(0.1, 0.8, mott * 0.5 + 0.5 + 0.3 * (b4 - 0.5)) * max(crown, 0.0);   // foot-polished crowns
  vec3 joint = lin(vec3(0.63, 0.59, 0.51)) * (0.72 + 0.2 * sand + 0.16 * mott);
  s.alb = joint * inJ;
  s.a = (1.0 - inJ) * tone * (1.0 + 0.05 * worn);
  s.h = pr.x + (0.0006 * max(crown, 0.0) * (0.4 + 0.6 * b3) + 0.00015 * tex + 0.00008 * sand - 0.0012 * pit) * (1.0 - inJ);
  s.rough = mix(0.8 + 0.06 * tex - 0.14 * worn, 0.95, inJ);
  s.cav = mix(1.0, 0.55, inJ) * (1.0 - 0.3 * pit);`},z={detail:.3,scale:2.4,tint:!0,mask:!0,alpha:!1,mode:1,sym:4,hr:[-.0016,6e-4],ao:.3,prep:`f[0] = FB(uv, ivec2(4), 4, 0.5, 2901u); f[1] = FB(uv, ivec2(64), 2, 0.5, 2903u); f[2] = FB(uv, ivec2(12), 3, 0.5, 2907u);
  w[0] = WO(uv, ivec2(72), 1.0, 2909u); w[1] = WO(uv, ivec2(180), 1.0, 2911u);`,surf:`
  // 1.2 m panels in a two-tone chequer, each framed by an 11 cm darker border band; brass divider strips on the panel
  // joints and a finer one at the band's inner edge; the matrix takes the block colour, the chips keep their own
  // (mostly pale marble, a little grey, rare black / coral / seafoam) \u2014 calm at distance, crisp close up
  ivec2 pc = wrp(ivec2(floor(P / 1.2)), ivec2(2));
  float chk = float((pc.x + pc.y) & 1);
  float dS = min(jd(P.x, 1.2), jd(P.y, 1.2));
  float strip = 1.0 - aa(0.0024, dS);
  float line2 = 1.0 - aa(0.0016, abs(dS - 0.11));
  float band = 1.0 - aa(0.11, dS);
  vec4 A = c[0], Bc = c[1];
  float rA = 0.16 + 0.2 * fract(A.z * 5.3), rB = 0.2 + 0.18 * fract(Bc.z * 3.7);
  float chipA = (1.0 - smoothstep(rA - 0.05, rA + 0.05, A.x)) * step(0.3, A.z);
  float chipB = (1.0 - smoothstep(rB - 0.08, rB + 0.08, Bc.x)) * step(0.35, Bc.z) * (1.0 - chipA);
  vec3 cw = lin(vec3(0.95, 0.94, 0.91)), cc2 = lin(vec3(0.86, 0.83, 0.77)), cg = lin(vec3(0.6, 0.6, 0.59)), ck = lin(vec3(0.2, 0.2, 0.21));
  vec3 cp = lin(vec3(0.86, 0.62, 0.54)), cs = lin(vec3(0.55, 0.72, 0.66));
  float ia = fract(A.z * 13.37), ib = fract(Bc.z * 7.77);
  vec3 colA = ia < 0.4 ? cw : (ia < 0.66 ? cc2 : (ia < 0.82 ? cg : (ia < 0.89 ? ck : (ia < 0.95 ? cp : cs))));
  vec3 colB = ib < 0.55 ? cw : (ib < 0.85 ? cc2 : cg);
  float mott = n[0], fine = n[1], cloud = n[2];
  float tone = 0.8 * mix(1.0, 0.86, chk) * mix(1.0, 0.7, band) * (1.0 + 0.05 * mott + 0.035 * cloud + 0.02 * fine);
  float dirt = (1.0 - smoothstep(0.0, 0.05, dS)) * (1.0 - strip) * smoothstep(-0.2, 0.6, mott);
  tone *= 1.0 - 0.1 * dirt;
  vec3 own = vec3(0.0); float cov = 1.0;
  own = mix(own, colA * (0.9 + 0.18 * fract(A.z * 3.1)), chipA); cov *= 1.0 - chipA;
  own = mix(own, colB * (0.92 + 0.12 * fine), chipB); cov *= 1.0 - chipB;
  float br = max(strip, line2 * 0.85);
  vec3 brass = lin(vec3(0.74, 0.58, 0.32)) * (0.8 + 0.25 * fine + 0.1 * mott);
  own = mix(own, brass, br); cov *= 1.0 - br;
  s.alb = own; s.a = cov * tone;
  float worn = smoothstep(-0.1, 0.7, cloud);
  s.h = 0.00018 * mott + 0.00004 * fine + 0.00005 * (chipA + chipB) - 0.0005 * dirt - 0.0002 * br;
  s.rough = mix(0.44 + 0.06 * fine + 0.12 * worn, 0.3, chipA + chipB);
  s.rough = mix(s.rough, 0.38, br);
  s.metal = br * 0.8;
  s.cav = 1.0 - 0.2 * dirt;`},S={detail:.6,scale:2.4,tint:!0,mask:!0,alpha:!1,mode:1,sym:1,hr:[-.008,.0012],ao:.5,prep:`f[0] = FB(uv, ivec2(4), 4, 0.55, 3001u); f[1] = FB(uv, ivec2(24), 3, 0.5, 3003u); f[2] = FB(uv, ivec2(28, 3), 3, 0.5, 3007u);
  f[3] = FB(uv, ivec2(96), 2, 0.5, 3011u); w[0] = WO(uv, ivec2(10), 0.85, 3013u); w[1] = WO(uv, ivec2(200), 1.0, 3017u);`,surf:`
  // ashlar lining: 400 mm courses, 1.2 m blocks in half bond, V-grooved bed joints (8 mm half-width) and finer
  // perpends; float-finished paint with trowel undulation, soot/rain streaks under each bed joint, hairline cracks,
  // a few flakes of paint lost to the grey render beneath (untinted)
  const float CH = 0.4, BL = 1.2;
  float row = floor(P.y / CH);
  float ly = P.y - row * CH;
  float bx = P.x - mod(row, 2.0) * 0.6;
  float col = floor(bx / BL);
  float lx = bx - col * BL;
  ivec2 bid = wrp(ivec2(int(col), int(row)), ivec2(2, 6));
  float eH = min(ly, CH - ly), eV = min(lx, BL - lx);
  float gH = max(0.0, 1.0 - eH / 0.007), gV = max(0.0, 1.0 - eV / 0.0035);
  float groove = max(gH, gV * 0.8);
  float hJ = -max(0.0045 * gH, 0.002 * gV);
  float b1 = hf(bid, 3u), b2 = hf(bid, 5u);
  float mott = n[0], und = n[1], streak = n[2], fine = n[3];
  vec4 k = c[0];
  float crack = (1.0 - aa(0.0014, (k.y - k.x) * 0.24)) * step(0.7, fract(k.z * 9.1 + k.w * 3.3)) * smoothstep(0.1, 0.5, mott);
  vec4 g = c[1];
  float grain = smoothstep(0.03, 0.25, g.y - g.x) * (1.0 - g.x * g.x);
  float flake = step(0.9, fract(k.w * 13.7 + k.z)) * (1.0 - aa(0.0, (k.x - 0.1 - 0.06 * fine) * 0.24)) * step(0.25, mott);
  float soot = (1.0 - smoothstep(0.0, 0.16, CH - ly)) * smoothstep(0.1, 0.8, streak * 0.5 + 0.5);   // under each bed joint
  float rain = smoothstep(0.35, 0.95, streak * 0.5 + 0.5) * (0.5 + 0.5 * smoothstep(-0.2, 0.6, mott));
  float paint = 0.8 * (1.0 + 0.035 * (b1 - 0.5) + 0.03 * und + 0.025 * fine + 0.04 * mott) * (1.0 - 0.07 * soot - 0.06 * rain) * (1.0 - 0.12 * crack);
  paint *= 1.0 - 0.12 * groove;
  vec3 bare = lin(vec3(0.56, 0.55, 0.52)) * (1.0 + 0.08 * grain);
  s.alb = bare * flake; s.a = (1.0 - flake) * paint;
  s.h = hJ + (0.0005 * und + 0.00025 * grain + 0.00008 * fine) * (1.0 - groove) - 0.0006 * crack - 0.0004 * flake;
  s.rough = 0.74 + 0.06 * mott - 0.04 * und + 0.06 * flake + 0.05 * rain;
  s.cav = (1.0 - 0.32 * groove) * (1.0 - 0.15 * crack);`},q=[{slot:28,name:"herringbone",mat:$,onWall:30},{slot:29,name:"terrazzo",mat:z,onWall:30},{slot:30,name:"stucco",mat:S,onTop:29}];var C={};n(C,{SURF:()=>W,SURFACES:()=>_});var W={tarmac:31,quay:32,chequer:33},x=1,J=2,_=[{slot:31,name:"tarmac",onWall:i.concrete,mat:{detail:.6,scale:4,tint:!0,mask:!0,alpha:!1,mode:J,sym:7,hr:[-.004,.0012],ao:.45,prep:`f[0] = FB(uv, ivec2(3), 4, 0.5, 3101u); f[1] = FB(uv, ivec2(8), 3, 0.5, 3107u); f[2] = FB(uv, ivec2(48), 2, 0.5, 3109u);
  f[3] = FB(uv, ivec2(4), 3, 0.55, 3113u); w[0] = WO(uv, ivec2(190), 1.0, 3119u); w[1] = WO(uv, ivec2(7), 0.9, 3121u);`,surf:`
  // dense-graded wearing course: aggregate set in binder (the tinted part), a sealed crack network (glossy black
  // bitumen bands, own colour), oil drips, rubber scuffs, lighter traffic-polished patches
  vec4 wc = c[0];
  float stone = smoothstep(0.08, 0.3, wc.y - wc.x);
  float light = step(0.9, wc.z);
  float big = n[0], mid = n[1], fine = n[2];
  float tone = mix(0.6 + 0.05 * fine, 0.74 + 0.16 * fract(wc.z * 7.13), stone);
  tone = mix(tone, 0.98, light * stone * 0.55);
  float worn = smoothstep(-0.05, 0.6, big);
  tone *= 1.0 + 0.07 * big + 0.04 * mid + 0.06 * worn;
  // crack network: coarse worley cell borders where the low-frequency noise allows it; sealant band ~4 cm
  vec4 cr = c[1];
  float edgeM = (cr.y - cr.x) * (4.0 / 7.0);
  float edgeSel = fract((cr.z + cr.w) * 13.7 + abs(cr.z - cr.w) * 5.3);     // per cell border: sealed / open / none
  float crackOn = smoothstep(0.3, 0.62, n[3]) * step(0.55, edgeSel);
  float seal = (1.0 - aa(0.016 + 0.006 * mid, edgeM)) * crackOn;
  float crack = (1.0 - aa(0.0018, edgeM)) * step(edgeSel, 0.3) * smoothstep(0.1, 0.4, n[3]) * 0.7;
  // oil drips + rubber scuffs (own dark colours)
  float oil = smoothstep(0.66, 0.84, 0.5 + 0.5 * mid) * smoothstep(0.1, 0.5, 0.5 + 0.5 * fine) * (1.0 - seal);
  float scuff = smoothstep(0.7, 0.9, 0.5 + 0.5 * n[3]) * smoothstep(0.3, 0.7, 0.5 + 0.5 * big) * 0.5;
  vec3 own = vec3(0.0); float cov = 1.0;
  own = mix(own, vec3(0.035, 0.035, 0.038) * (1.0 + 0.3 * fine), seal * 0.85); cov *= 1.0 - seal * 0.85;
  own = mix(own, vec3(0.03, 0.028, 0.026), oil * 0.55); cov *= 1.0 - oil * 0.55;
  own = mix(own, vec3(0.05), crack * 0.6); cov *= 1.0 - crack * 0.6;
  s.alb = own;
  s.a = cov * clamp(tone * 1.18 * (1.0 - 0.22 * scuff), 0.0, 1.0);
  s.h = (-0.0011 * (1.0 - stone) + 0.0005 * stone * (1.0 - wc.x * wc.x) + 0.0001 * big) * (1.0 - seal) + 0.0006 * seal - 0.002 * crack;
  s.rough = mix(mix(mix(0.93, 0.8, stone) - 0.1 * worn, 0.38, seal * 0.9), 0.5, oil * 0.6);
  s.cav = (1.0 - 0.25 * (1.0 - stone)) * (1.0 - 0.4 * crack);`}},{slot:32,name:"quay",onWall:i.concrete,mat:{detail:.9,scale:4.8,tint:!0,mask:!0,alpha:!1,mode:x,sym:7,hr:[-.008,.001],ao:.5,prep:`f[0] = FB(uv, ivec2(4), 5, 0.55, 3201u); f[1] = FB(uv, ivec2(12), 3, 0.5, 3203u);
  f[2] = FB(uv, ivec2(4, 150), 1, 0.5, 3209u); f[3] = FB(uv, ivec2(150, 4), 1, 0.5, 3211u);
  w[0] = WO(uv, ivec2(160), 1.0, 3217u); w[1] = WO(uv, ivec2(6), 0.85, 3221u);`,surf:`
  // 2.4 m cast apron slabs (2 x 2 per repeat): sawn joints filled with dark sealant, rounded arrises, a broom finish
  // whose direction alternates slab to slab, per-slab tone, exposed aggregate where traffic wore the laitance off,
  // rust bleeding from dropped lashing gear, hairline cracks, rubber scuffs
  ivec2 cell = ivec2(floor(P / 2.4));
  ivec2 cw = wrp(cell, ivec2(2));
  vec2 lp = P - (vec2(cell) * 2.4 + 1.2);
  float e = -sdRB(lp, vec2(1.2), 0.004);
  vec2 pr = edgeProf(e, 0.005, 0.007, 0.0025, 0.008);
  float inJ = pr.y;
  float hid = hf(cw, 3u), hid2 = hf(cw, 5u);
  bool du = ((cw.x + cw.y) & 1) == 0;
  float broom = du ? n[2] : n[3];
  float mott = n[0], cloud = n[1];
  vec4 ag = c[0];
  float agg = smoothstep(0.1, 0.3, ag.y - ag.x);
  float worn = smoothstep(0.15, 0.7, mott + 0.3 * cloud);
  float tone = 0.8 * (1.0 + 0.09 * (hid - 0.5) + 0.07 * mott + 0.04 * cloud + 0.035 * broom);
  tone *= mix(1.0, 0.86 + 0.28 * fract(ag.z * 9.1), agg * worn * 0.7);
  float grime = (1.0 - smoothstep(0.0, 0.07, e - 0.005)) * (1.0 - inJ);
  tone *= 1.0 - 0.1 * grime;
  // rust stains: a few blotches per repeat (coarse worley cells), fading out from a darker core
  vec4 rs = c[1];
  float rsel = step(0.72, rs.z) * step(0.03, e);
  float rust = rsel * (1.0 - smoothstep(0.05, 0.28 + 0.1 * cloud, rs.x * 0.8)) * smoothstep(-0.3, 0.4, cloud);
  float crack = (1.0 - aa(0.0022, (rs.y - rs.x) * 0.8)) * step(0.5, fract(rs.z * 5.7 + rs.w * 3.1)) * smoothstep(0.2, 0.5, mott) * step(0.05, e);
  float scuff = smoothstep(0.72, 0.92, 0.5 + 0.5 * cloud) * smoothstep(0.35, 0.8, 0.5 + 0.5 * mott) * 0.6;
  vec3 own = vec3(0.0); float cov = 1.0;
  own = mix(own, vec3(0.03, 0.03, 0.032), inJ); cov *= 1.0 - inJ;
  own = mix(own, vec3(0.34, 0.16, 0.07) * (0.85 + 0.3 * cloud), rust * 0.55); cov *= 1.0 - rust * 0.55;
  own = mix(own, vec3(0.08), crack * 0.55); cov *= 1.0 - crack * 0.55;
  s.alb = own;
  s.a = cov * tone * (1.0 - 0.2 * scuff);
  s.h = pr.x + (0.00012 * broom + 0.0002 * mott + 0.0003 * agg * worn) * (1.0 - inJ) - 0.0015 * crack;
  s.rough = mix(mix(0.86 + 0.05 * broom - 0.08 * worn + 0.04 * hid2, 0.45, inJ), 0.8, rust * 0.5);
  s.cav = mix(1.0, 0.5, inJ) * (1.0 - 0.35 * crack) * (1.0 - 0.1 * grime);`}},{slot:33,name:"chequer",onWall:i.hullpaint,mat:{detail:.3,scale:1.2,tint:!0,mask:!0,alpha:!1,mode:x,sym:3,hr:[-.004,.003],ao:.3,prep:`f[0] = FB(uv, ivec2(3), 4, 0.5, 3301u); f[1] = FB(uv, ivec2(24), 2, 0.5, 3303u); f[2] = FB(uv, ivec2(6), 3, 0.5, 3307u);
  f[3] = FB(uv, ivec2(10), 3, 0.5, 3309u); w[0] = WO(uv, ivec2(8), 0.9, 3311u);`,surf:`
  // painted steel chequer plate: raised lugs on a 40 mm grid alternating \xB145\xB0, a butt-welded seam with a bolt row on
  // the repeat border, paint worn off the lug tops along the walking lines (bare steel, own colour), rust spots
  const float CS = 0.04;
  vec2 cp = P / CS;
  ivec2 ci = ivec2(floor(cp));
  vec2 cf = cp - vec2(ci) - 0.5;
  bool odd = ((ci.x + ci.y) & 1) == 1;
  vec2 q = (odd ? vec2(cf.x + cf.y, cf.y - cf.x) : vec2(cf.x - cf.y, cf.x + cf.y)) * 0.70710678;
  float ld = length(vec2(max(abs(q.x) - 0.26, 0.0), q.y)) - 0.1;
  float lw = PX / CS;
  float lug = 1.0 - smoothstep(-lw, lw, ld);
  float dome = sqrt(clamp(-ld / 0.1, 0.0, 1.0));
  float dS = min(jd(P.x, 1.2), jd(P.y, 1.2));
  float bead = exp(-dS * dS / 0.00004);
  float nearS = 1.0 - smoothstep(0.004, 0.012, dS);
  lug *= 1.0 - nearS;
  float bu = abs(fract(P.x / 0.15) - 0.5) * 0.15, bv = abs(fract(P.y / 0.15) - 0.5) * 0.15;
  float bd = min(length(vec2(bu, jd(P.y, 1.2) - 0.03)), length(vec2(bv, jd(P.x, 1.2) - 0.03)));
  float bolt = 1.0 - aa(0.009, bd);
  float mott = n[0], fineN = n[1], wearN = n[2], rustN = n[3];
  float wear = lug * dome * smoothstep(0.45, 0.8, 0.5 + 0.5 * wearN);
  float edgeWear = bead * smoothstep(0.5, 0.8, 0.5 + 0.5 * wearN) * 0.7;
  vec4 rc = c[0];
  float rust = step(0.86, rc.z) * (1.0 - smoothstep(0.04, 0.2 + 0.08 * rustN, rc.x * 0.15)) * smoothstep(-0.2, 0.4, rustN);
  vec3 steel = vec3(0.42, 0.43, 0.44) * (1.0 + 0.08 * fineN);
  vec3 rustC = vec3(0.3, 0.13, 0.05) * (0.8 + 0.4 * fineN);
  vec3 own = vec3(0.0); float cov = 1.0;
  own = mix(own, steel, wear * 0.85); cov *= 1.0 - wear * 0.85;
  own = mix(own, steel * 0.9, edgeWear); cov *= 1.0 - edgeWear;
  own = mix(own, rustC, rust * 0.7); cov *= 1.0 - rust * 0.7;
  s.alb = own;
  s.a = cov * 0.8 * (1.0 + 0.05 * mott + 0.03 * fineN) * (1.0 - 0.12 * (1.0 - lug) * (1.0 - bolt) * 0.0) * (1.0 + 0.06 * lug * dome);
  s.h = 0.0018 * lug * dome + 0.0008 * bead - 0.0012 * nearS * (1.0 - bead) + 0.0014 * bolt;
  s.rough = mix(mix(0.5 + 0.06 * mott, 0.32, wear), 0.82, rust * 0.7);
  s.metal = wear * 0.8 + edgeWear * 0.6;
  s.cav = (1.0 - 0.2 * (1.0 - lug) * smoothstep(-0.05, 0.02, ld) * 0.0) * (1.0 - 0.3 * nearS * (1.0 - bead));`}}];var R={};n(R,{SURF:()=>A,SURFACES:()=>O});var A={salt:34,mud:35,timber:36},d=1,O=[{slot:34,name:"saltcrust",mat:{detail:.45,scale:3.2,tint:!0,mask:!0,alpha:!1,mode:d,sym:7,hr:[-.005,.003],ao:.35,prep:`f[0] = FB(uv, ivec2(3), 4, 0.55, 811u); f[1] = FB(uv, ivec2(12), 3, 0.5, 821u); f[2] = FB(uv, ivec2(48), 3, 0.5, 827u);
  vec2 wq = uv + 0.012 * vec2(sin(TAU * (3.0 * uv.y + 2.0 * uv.x)), sin(TAU * (3.0 * uv.x - 2.0 * uv.y) + 1.1));
  w[0] = WO(wq, ivec2(7), 0.92, 831u); w[1] = WO(uv, ivec2(90), 1.0, 839u);`,surf:`
  // crystallising-pan floor: 0.45 m crust plates (slightly domed, per-plate tone) with raised crystal ridges along their
  // borders and a hairline split on the crest; fine crystal facets; shallow pink brine pools where the crust is thin \u2014
  // glossy, the layer's own colour \u2014 with a slushy wet margin and little hopper crystals floating at the edges
  vec4 wc = c[0], xc = c[1];
  float big = n[0], mott = n[1], fine = n[2];
  float eP = (wc.y - wc.x) * (3.2 / 7.0);
  float ridge = (1.0 - smoothstep(0.0, 0.04, eP)) * (0.5 + 0.5 * step(0.35, fract((wc.z + wc.w) * 7.1)));
  float seam = 1.0 - aa(0.0025, eP);
  float dome = smoothstep(0.0, 0.18, eP);
  float facet = smoothstep(0.02, 0.35, xc.y - xc.x);
  float ftone = fract(xc.z * 7.31);
  float wf = 0.92 * big + 0.1 * mott + 0.14 * (wc.z - 0.5);
  float pool = smoothstep(0.02, -0.12, wf) * (1.0 - 0.75 * ridge * smoothstep(-0.3, -0.1, wf));
  float slush = smoothstep(0.16, 0.0, wf) * (1.0 - pool);
  // hopper crystals: small turned squares in the pool margins
  ivec2 hi = ivec2(floor(uv * 29.0));
  vec2 hq = fract(uv * 29.0) - 0.5 - (hf2(wrp(hi, ivec2(29)), 871u) - 0.5) * 0.5;
  float ha = hf(wrp(hi, ivec2(29)), 873u) * 1.57;
  hq = mat2(cos(ha), sin(ha), -sin(ha), cos(ha)) * hq;
  float hsz = 0.07 + 0.08 * hf(wrp(hi, ivec2(29)), 877u);
  float hop = step(0.55, hf(wrp(hi, ivec2(29)), 879u)) * (1.0 - smoothstep(hsz - 0.03, hsz, max(abs(hq.x), abs(hq.y))))
            * smoothstep(0.1, 0.6, slush + pool * (1.0 - pool) * 2.0);
  float tone = 0.95 + 0.08 * (fract(wc.z * 13.7) - 0.5);
  float crustL = 0.8 * tone * (1.0 + 0.035 * mott + 0.03 * fine) * (0.97 + 0.05 * ftone * facet) * (1.0 + 0.05 * ridge) * (1.0 - 0.05 * (1.0 - dome));
  crustL *= 1.0 - 0.12 * seam;
  vec3 brine = mix(lin(vec3(0.94, 0.83, 0.81)), lin(vec3(0.9, 0.73, 0.71)), smoothstep(-0.1, -0.5, wf)) * (0.95 + 0.05 * mott);
  vec3 wetC = lin(vec3(0.94, 0.87, 0.85)) * (0.96 + 0.05 * fine);
  vec3 own = vec3(0.0); float cov = 1.0;
  own = mix(own, wetC, slush * 0.55); cov *= 1.0 - slush * 0.55;
  own = mix(own, brine, pool); cov *= 1.0 - pool;
  own = mix(own, lin(vec3(0.97, 0.95, 0.94)), hop); cov *= 1.0 - hop;
  s.alb = own; s.a = cov * crustL;
  float hC = 0.0012 * dome + 0.0013 * ridge + 0.00035 * facet + 0.0002 * fine - 0.0009 * seam;
  s.h = mix(mix(hC, -0.0012 + 0.0003 * fine, slush * 0.7), -0.0028, pool) + 0.0006 * hop;
  s.rough = mix(mix(mix(0.74 - 0.12 * facet + 0.04 * mott, 0.34, slush), 0.05, pool), 0.4, hop);
  s.cav = 1.0 - 0.35 * seam;`}},{slot:35,name:"drymud",onWall:36,mat:{detail:.9,scale:2.4,tint:!0,mask:!0,alpha:!1,mode:d,sym:7,hr:[-.016,.003],ao:.55,prep:`f[0] = FB(uv, ivec2(4), 4, 0.55, 851u); f[1] = FB(uv, ivec2(24), 3, 0.5, 853u); f[2] = FB(uv, ivec2(96), 2, 0.5, 857u);
  vec2 wq = uv + 0.025 * vec2(sin(TAU * (2.0 * uv.y + uv.x)) + 0.5 * sin(TAU * (5.0 * uv.y - 3.0 * uv.x) + 0.7),
                              sin(TAU * (2.0 * uv.x - uv.y) + 1.3) + 0.5 * sin(TAU * (4.0 * uv.x + 5.0 * uv.y) + 2.1));
  w[0] = WO(wq, ivec2(6), 0.95, 859u); w[1] = WO(uv, ivec2(18), 1.0, 861u);`,surf:`
  // sun-baked tidal clay: 0.4 m shrinkage-crack plates (cracks 8\u201320 mm, plate rims curled up and bleached by the sun),
  // finer secondary cracks, silt grain, damp darker patches; salt bloom (own white) crusting in and along the cracks
  // and over damp patches, crack floors dark (own), a few shell fragments
  vec4 wc = c[0], sc = c[1];
  float big = n[0], silt = n[1], grit = n[2];
  float e1 = (wc.y - wc.x) * 0.4;
  float cw = 0.0025 + 0.0045 * (0.5 + 0.5 * big) + 0.003 * fract(wc.z * 5.1);
  float healed = step(0.72, fract((wc.z + wc.w) * 17.3)) * smoothstep(-0.2, 0.3, silt);
  float crack = (1.0 - aa(cw, e1)) * (1.0 - 0.85 * healed);
  float rim = (1.0 - smoothstep(cw, cw + 0.045, e1)) * (1.0 - crack);
  float cup = smoothstep(0.0, 0.16, e1);
  float e2 = (sc.y - sc.x) * (2.4 / 18.0);
  float sec = (1.0 - aa(0.0016, e2)) * step(0.42, fract(sc.z * 3.7 + sc.w * 1.3)) * smoothstep(0.02, 0.05, e1);
  float damp = smoothstep(0.2, 0.6, -big);
  float ptone = 0.93 + 0.12 * (fract(wc.z * 11.3) - 0.5);
  float mudL = 0.8 * ptone * (1.0 + 0.06 * silt + 0.05 * grit) * (1.0 - 0.12 * damp) * (1.0 + 0.08 * rim) * (1.0 - 0.28 * sec);
  float bloomF = smoothstep(0.3, 0.75, 0.55 * big + 0.45 * silt);
  float bloom = max((1.0 - smoothstep(0.0, 0.035, e1 - cw)) * bloomF, 0.55 * damp * smoothstep(0.1, 0.5, grit + 0.3)) * (1.0 - crack * 0.4);
  float shell = step(0.985, fract(sc.z * 13.3)) * (1.0 - aa(0.012, sc.x * 0.133)) * (1.0 - crack);
  vec3 own = vec3(0.0); float cov = 1.0;
  own = mix(own, lin(vec3(0.93, 0.92, 0.9)) * (0.95 + 0.06 * grit), bloom * 0.8); cov *= 1.0 - bloom * 0.8;
  own = mix(own, lin(vec3(0.86, 0.81, 0.74)), shell); cov *= 1.0 - shell;
  own = mix(own, lin(vec3(0.24, 0.2, 0.17)) * (0.8 + 0.3 * silt), crack); cov *= 1.0 - crack;
  s.alb = own; s.a = cov * mudL;
  s.h = -0.014 * crack + 0.0024 * rim + 0.0008 * cup - 0.0015 * sec + 0.0004 * silt + 0.00015 * grit + 0.0003 * bloom + 0.0005 * shell;
  s.rough = mix(mix(0.93 - 0.05 * rim, 0.72, bloom), 1.0, crack);
  s.cav = (1.0 - 0.6 * crack) * (1.0 - 0.25 * sec);`}},{slot:36,name:"saltboard",mat:{detail:.35,scale:2.4,tint:!0,mask:!0,alpha:!1,mode:d,sym:1,hr:[-.02,.0015],ao:.45,prep:`int row = int(floor(P.y / 0.2)); float ly = P.y - float(row) * 0.2;
  f[0] = Req(vec2(uv.x * 6.0, ly * 30.0 + float(row) * 5.37), ivec2(6, 4096), 3, 0.55, 881u);
  f[1] = FB(uv, ivec2(5), 4, 0.5, 883u);
  f[2] = Req(vec2(uv.x * 3.0, float(row) * 2.31), ivec2(3, 4096), 3, 0.5, 887u);
  f[3] = FB(uv, ivec2(48), 2, 0.5, 889u);
  w[0] = WO(uv, ivec2(4, 12), 1.0, 891u);`,surf:`
  // bleached salt-works timber: 200 mm boards along u, 7 mm gaps, one staggered butt joint per board per repeat, silvered
  // grain (tinted), latewood lines, checks running in from the butt ends; salt crusted into the gaps and along the board
  // ends (own white), gaps dark (own), a pair of rusty nails over each joist (every 0.6 m) with rust bleeding into the wood
  const float PW = 0.2;
  int row = int(floor(P.y / PW));
  float ly = P.y - float(row) * PW;
  int js[12] = int[12](0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2);
  float jx = 0.3 + 0.6 * float(js[row]);
  float eE = jd(P.x - jx, 2.4);
  float eS = min(ly, PW - ly);
  vec2 ps = edgeProf(eS, 0.0035, 0.006, 0.002, 0.02);
  vec2 pe = edgeProf(eE, 0.0015, 0.004, 0.0016, 0.016);
  float gap = max(ps.y, pe.y);
  float b1 = hf(ivec2(row, 0), 5u), b2 = hf(ivec2(row, 1), 5u), b3 = hf(ivec2(row, 2), 5u);
  float q = clamp((ly - PW * 0.5) / (PW * 0.5 - 0.0035), -1.0, 1.0);
  float cupH = mix(-0.0006, 0.0008, b2) * (1.0 - q * q);
  float streak = n[0], patchN = n[1], warp = n[2], fib = n[3];
  float late = smoothstep(0.72, 0.96, 0.5 + 0.5 * cos(TAU * (q * (1.4 + 1.2 * b1) + 1.1 * warp + 3.0 * b3)));
  // checks from the butt ends
  float chk = 0.0;
  for (int k = 0; k < 2 * uOne; k++) {
    float h1 = hf(ivec2(row, k + 3), 41u), h2 = hf(ivec2(row, k + 3), 43u);
    if (h1 > 0.6) continue;
    float L = 0.05 + 0.25 * h2;
    float xc = jx + (k == 0 ? 1.0 : -1.0) * (0.01 + L);
    float yc = 0.03 + h1 * (PW - 0.06) / 0.6;
    float taper = clamp(1.0 - jd(P.x - xc, 2.4) / L, 0.0, 1.0);
    float d = abs(ly - yc - 0.002 * sin(P.x * 29.0 + h1 * 40.0));
    chk = max(chk, (1.0 - smoothstep(0.0003 + 0.0012 * taper, 0.0003 + 0.0012 * taper + PX, d)) * step(0.001, taper));
  }
  chk *= 1.0 - gap;
  // nails: a pair over every joist, 35 mm in from each board edge
  float nx = jd(P.x - 0.3, 0.6);
  float ny = min(abs(ly - 0.035), abs(PW - 0.035 - ly));
  float nd = length(vec2(nx, ny));
  float nail = 1.0 - aa(0.0045, nd);
  float halo = (1.0 - smoothstep(0.0045, 0.03, nd)) * (1.0 - nail) * step(0.4, hf(wrp(ivec2(int(floor(P.x / 0.6 + 0.5)), row), ivec2(4, 12)), 51u));
  float board = 0.8 * (0.86 + 0.26 * b1) * (1.0 + 0.1 * streak) * (1.0 - 0.1 * late) * (1.0 + 0.03 * fib) * (1.0 + 0.05 * patchN);
  board *= (1.0 - 0.35 * chk) * (1.0 - 0.12 * (1.0 - smoothstep(0.0, 0.03, eE)));
  // salt bloom: along the gaps + board ends, patchy
  float sEdge = (1.0 - smoothstep(0.0, 0.012 + 0.012 * patchN, min(eS - 0.0035, eE - 0.0015))) * smoothstep(-0.2, 0.5, patchN + 0.3 * fib);
  float sPatch = smoothstep(0.55, 0.85, c[0].z * 0.5 + 0.5 * (0.5 + 0.5 * patchN)) * (1.0 - smoothstep(0.1, 0.35, c[0].x)) * 0.5;
  float salt = clamp(max(sEdge * 0.75, sPatch), 0.0, 0.8) * (1.0 - gap);
  vec3 own = vec3(0.0); float cov = 1.0;
  own = mix(own, lin(vec3(0.94, 0.93, 0.91)) * (0.95 + 0.05 * fib), salt); cov *= 1.0 - salt;
  own = mix(own, lin(vec3(0.45, 0.24, 0.12)) * (0.8 + 0.4 * fib), halo * 0.45); cov *= 1.0 - halo * 0.45;
  own = mix(own, lin(vec3(0.3, 0.17, 0.1)) * (0.7 + 0.5 * smoothstep(0.0045, 0.0, nd)), nail); cov *= 1.0 - nail;
  own = mix(own, mix(lin(vec3(0.05, 0.045, 0.04)), lin(vec3(0.6, 0.58, 0.55)), 0.2 * smoothstep(-0.2, 0.6, patchN)), gap); cov *= 1.0 - gap;
  s.alb = own; s.a = cov * board;
  float h = min(ps.x, pe.x);
  h += (cupH + 0.00012 * streak + 0.00018 * late + 0.00006 * fib - 0.0025 * chk + 0.0002 * salt) * (1.0 - gap);
  s.h = mix(h, -0.0006 + 0.0003 * smoothstep(0.0045, 0.0, nd), nail);
  s.rough = mix(mix(0.78 + 0.08 * (fib * 0.5 + 0.5) + 0.04 * late, 0.7, salt), 0.95, gap);
  s.metal = nail * 0.3;
  s.cav = mix(1.0, 0.3, gap) * (1.0 - 0.35 * chk);`}}];var L={};n(L,{SURF:()=>M,SURFACES:()=>H});var M={setts:37,ashlar:38,tramway:39},k=1,T=0,m=(e,o,t,a,s,r,c)=>`
  float rowf_${e} = floor(b / ${o});
  int rid_${e} = wrp(ivec2(int(rowf_${e}), 0), ivec2(${s}, 1)).x;
  float ly_${e} = b - rowf_${e} * ${o};
  float xs_${e} = a - hf(ivec2(rid_${e}, 3), 5u) * ${t};
  float kf_${e} = floor(xs_${e} / ${t});
  float b0_${e} = kf_${e} * ${t} + (hf(wrp(ivec2(int(kf_${e}), rid_${e}), ivec2(${a}, ${s})), 7u) - 0.5) * ${r};
  float b1_${e} = (kf_${e} + 1.0) * ${t} + (hf(wrp(ivec2(int(kf_${e}) + 1, rid_${e}), ivec2(${a}, ${s})), 7u) - 0.5) * ${r};
  if (xs_${e} < b0_${e}) { b1_${e} = b0_${e}; kf_${e} -= 1.0; b0_${e} = kf_${e} * ${t} + (hf(wrp(ivec2(int(kf_${e}), rid_${e}), ivec2(${a}, ${s})), 7u) - 0.5) * ${r}; }
  else if (xs_${e} > b1_${e}) { b0_${e} = b1_${e}; kf_${e} += 1.0; b1_${e} = (kf_${e} + 1.0) * ${t} + (hf(wrp(ivec2(int(kf_${e}) + 1, rid_${e}), ivec2(${a}, ${s})), 7u) - 0.5) * ${r}; }
  ivec2 sid_${e} = wrp(ivec2(int(kf_${e}), rid_${e}), ivec2(${a}, ${s}));
  vec2 hb_${e} = vec2((b1_${e} - b0_${e}) * 0.5, ${o} * 0.5);
  vec2 lp_${e} = vec2(xs_${e} - (b0_${e} + b1_${e}) * 0.5, ly_${e} - ${o} * 0.5);
  float e_${e} = -sdRB(lp_${e}, hb_${e}, ${c});
  vec4 ${e} = vec4(e_${e}, lp_${e} / hb_${e}, hf(sid_${e}, 11u));
`,y=`
  float t1 = q.w, t2 = fract(q.w * 7.31), t3 = fract(q.w * 13.7);
  vec3 hue = t2 < 0.34 ? vec3(1.05, 0.985, 0.94) : (t2 < 0.67 ? vec3(0.955, 0.99, 1.04) : vec3(1.0));
  float dome = clamp((1.0 - q.y * q.y) * (1.0 - q.z * q.z), 0.0, 1.0);
  float wear = smoothstep(0.15, 0.75, n[0] * 0.5 + 0.5 + 0.35 * (t3 - 0.5)) * dome;           // traffic-polished crowns
  vec4 g = c[0];
  float cell = g.x * GS;
  float fleck = step(0.86, g.z) * (1.0 - aa(0.0035 + 0.002 * fract(g.z * 5.3), cell));        // dark mica flecks
  float felds = step(0.9, fract(g.z * 7.1)) * (1.0 - aa(0.003, cell)) * (1.0 - step(0.86, g.z)); // pale feldspar
  float tone = 0.8 * (1.0 + 0.26 * (t1 - 0.5)) * (1.0 + 0.05 * n[1] + 0.03 * n[2]);
  vec3 stone = vec3(tone) * hue * (1.0 - 0.3 * fleck) * (1.0 + 0.18 * felds) * (1.0 + 0.07 * wear);
  stone *= 1.0 - 0.1 * clamp(1.0 - (q.x - 0.006) / 0.02, 0.0, 1.0);                          // darker toward the arris
  float moss = smoothstep(0.25, 0.8, n[1] * 0.5 + 0.5 + 0.25 * n[3]);
  vec3 joint = mix(vec3(0.33, 0.315, 0.29), vec3(0.25, 0.3, 0.2), moss * 0.7) * (1.0 + 0.18 * n[2]);
`,H=[{slot:37,name:"setts",onWall:38,mat:{detail:.55,scale:1.92,tint:!0,alpha:!1,mode:k,sym:3,hr:[-.02,.006],ao:.6,prep:`f[0] = FB(uv, ivec2(3), 4, 0.5, 3701u); f[1] = FB(uv, ivec2(12), 3, 0.5, 3703u); f[2] = FB(uv, ivec2(96), 2, 0.5, 3709u);
  f[3] = FB(uv, ivec2(40), 2, 0.5, 3713u); w[0] = WO(uv, ivec2(150), 1.0, 3711u);`,surf:`
  // granite setts: 0.16 m courses along u, setts 0.24 m \xB1 4 cm with a random bond per course, 11 mm sand joints (grit
  // and a little moss), domed and traffic-polished crowns, per-sett granite (grey / warm / blue-grey), mica + feldspar
  const float GS = 1.92 / 150.0;
  float a = P.x, b = P.y;
  ${m("q","0.16","0.24",8,12,"0.08","0.024")}
  ${y}
  vec2 pr = edgeProf(q.x, 0.0055, 0.03, 0.009, 0.016);
  float inJ = pr.y;
  s.alb = mix(stone, joint, inJ);
  s.h = pr.x + 0.0045 * dome * (1.0 - inJ) + 0.00015 * n[1] - 0.0002 * fleck;
  s.rough = mix(0.74 - 0.26 * wear + 0.05 * n[2], 0.96, inJ);
  s.cav = mix(1.0, 0.42, inJ);`}},{slot:38,name:"ashlar",mat:{detail:.8,scale:2.88,tint:!0,alpha:!1,mode:k,sym:1,hr:[-.009,.0025],ao:.5,prep:`f[0] = FB(uv, ivec2(4), 4, 0.5, 3801u); f[1] = FB(uv, ivec2(12), 3, 0.5, 3803u); f[2] = FB(uv, ivec2(120), 2, 0.5, 3807u);
  f[3] = Req(vec2(uv.x * 6.0, uv.y * 90.0), ivec2(6, 90), 3, 0.5, 3809u); w[0] = WO(uv, ivec2(48), 0.9, 3811u);`,surf:`
  // coursed sandstone ashlar: 0.36 m courses, blocks 0.72 m \xB1 0.18 in a random bond, 7 mm lime joints, a drafted
  // margin (smooth 25 mm band) round a boasted face with diagonal tooling, per-block tone + bedding lines, a few
  // weathered / iron-stained blocks. On top faces it reads as flagstones in running bond.
  float a = P.x, b = P.y;
  ${m("q","0.36","0.72",4,8,"0.36","0.004")}
  vec2 pr = edgeProf(q.x, 0.0035, 0.006, 0.0022, 0.006);
  float inJ = pr.y;
  float face = smoothstep(0.018, 0.03, q.x);                       // 0 in the drafted margin, 1 on the tooled face
  float t1 = q.w, t2 = fract(q.w * 7.31), t3 = fract(q.w * 3.77);
  float tool = 0.5 + 0.5 * sin((a + b) * 190.0 + 3.0 * n[2] + t1 * 20.0);
  float bed = n[3];
  vec3 hue = mix(vec3(1.035, 0.99, 0.935), vec3(0.975, 0.99, 1.015), t2);
  float tone = 0.8 * (1.0 + 0.14 * (t1 - 0.5)) * (1.0 + 0.04 * n[1] + 0.03 * bed) * (1.0 - 0.035 * face * tool);
  float worn = step(0.86, t3) * smoothstep(-0.2, 0.5, n[0]);         // weathered block: darker, rougher, pitted
  vec4 g = c[0];
  float pit = worn * step(0.6, g.z) * (1.0 - aa(0.006, g.x * (2.88 / 48.0) * 0.4));
  float stain = step(0.95, fract(t1 * 17.3)) * smoothstep(0.2, -0.6, q.z) * 0.6;   // rust run from an old iron fixing
  vec3 col = vec3(tone) * hue * (1.0 - 0.1 * worn) * (1.0 - 0.25 * pit);
  col = mix(col, col * vec3(1.06, 0.86, 0.7), stain);
  col *= 1.0 + 0.03 * (1.0 - face);                                   // the smoother margin catches a little more light
  vec3 mort = vec3(0.9, 0.88, 0.83) * (1.0 + 0.05 * n[2]);
  s.alb = mix(col, mort, inJ);
  s.h = pr.x + (0.0012 * face * (0.55 + 0.45 * n[2]) + 0.00025 * face * tool - 0.0015 * pit + 0.0002 * bed) * (1.0 - inJ);
  s.rough = mix(0.78 + 0.06 * face + 0.08 * worn, 0.93, inJ);
  s.cav = mix(1.0, 0.7, inJ) * (1.0 - 0.3 * pit);`}},{slot:39,name:"tramway",onWall:38,mat:{detail:.5,scale:2.5,tint:!0,mask:!0,alpha:!1,mode:T,sym:0,hr:[-.028,.006],ao:.6,prep:`f[0] = FB(uv, ivec2(3), 4, 0.5, 3901u); f[1] = FB(uv, ivec2(12), 3, 0.5, 3903u); f[2] = FB(uv, ivec2(96), 2, 0.5, 3907u);
  f[3] = FB(uv, ivec2(40), 2, 0.5, 3913u); w[0] = WO(uv, ivec2(190), 1.0, 3911u);`,surf:`
  // tramway strip (2.5 m across v, the track along u): two grooved girder rails at 1.435 m gauge, a border course of
  // long setts along each rail, and elsewhere setts in courses ACROSS the track. albedo.a = sett (block colour),
  // rgb = the rails' own steel (bright polished head, dark groove, duller lip). Plain repeat (the rails sit at fixed v).
  const float GS = 2.5 / 190.0;
  float yc = P.y - 1.25;
  float d = abs(yc) - 0.7175;                      // signed distance from the rail's gauge line (< 0 = inside the gauge)
  float a, b;
  vec4 q;
  bool border = abs(d) < 0.17;
  if (border) {
    // one course of long setts (0.3125 m, 8 per repeat) running along the rail either side of it
    a = P.x; b = (d < 0.0 ? -d - 0.05 : d - 0.05) + (yc > 0.0 ? 0.0 : 0.37);
    ${m("q1","0.12","0.3125",8,4,"0.05","0.018")}
    q = q1;
  } else {
    // setts in courses across the track: courses stacked along u (16 per repeat), setts along v
    a = P.y; b = P.x;
    ${m("q2","0.15625","0.25",10,16,"0.08","0.024")}
    q = q2;
  }
  ${y}
  vec2 pr = edgeProf(q.x, 0.0055, 0.03, 0.009, 0.016);
  float inJ = pr.y;
  // rail: head (outer side), groove (inner side), guard lip \u2014 0.07 m across, set flush in a tarred joint
  float rz = 1.0 - smoothstep(0.052 - PX, 0.052 + PX, abs(d + 0.008));
  float head = (1.0 - smoothstep(0.03 - PX, 0.03 + PX, abs(d - 0.018))) * rz;
  float groove = (1.0 - smoothstep(0.016 - PX, 0.016 + PX, abs(d + 0.02))) * rz;
  float lip = rz * (1.0 - head) * (1.0 - groove);
  float tar = (1.0 - smoothstep(0.052, 0.062, abs(d + 0.008))) * (1.0 - rz);
  vec3 steelHi = lin(vec3(0.74, 0.74, 0.76)) * (1.0 + 0.05 * n[2]), steelLo = lin(vec3(0.36, 0.33, 0.3)) * (1.0 + 0.1 * n[1]);
  vec3 grooveC = lin(vec3(0.12, 0.1, 0.09));
  vec3 railC = head * steelHi + groove * grooveC + lip * steelLo;
  float sett = (1.0 - rz) * (1.0 - tar);
  vec3 own = railC * rz + lin(vec3(0.09)) * tar;
  float lumS = mix(dot(stone, vec3(0.3333)), dot(joint, vec3(0.3333)) * 0.85, inJ);
  s.alb = own * (1.0 - sett);
  s.a = sett * lumS;
  s.h = mix(pr.x + 0.0045 * dome * (1.0 - inJ), -0.022 * groove - 0.001 * tar, 1.0 - sett);
  s.rough = mix(mix(0.74 - 0.26 * wear, 0.96, inJ), mix(0.3, 0.8, groove + lip * 0.6), 1.0 - sett);
  s.metal = (1.0 - sett) * (head * 0.9 + lip * 0.5);
  s.cav = mix(mix(1.0, 0.42, inJ), mix(1.0, 0.35, groove), 1.0 - sett);`}}];var N={};n(N,{SURF:()=>E,SURFACES:()=>U});var E={setts:40,engbrick:41,hoofsteps:42},h=1,U=[{slot:40,name:"setts",onWall:41,mat:{detail:.6,scale:2,tint:!0,mask:!0,alpha:!1,mode:h,sym:1,hr:[-.016,.006],ao:.55,prep:`f[0] = FB(uv, ivec2(5), 4, 0.5, 4001u); f[1] = FB(uv, ivec2(12), 3, 0.5, 4003u); f[2] = FB(uv, ivec2(48), 2, 0.5, 4007u);
  w[0] = WO(uv, ivec2(260), 1.0, 4011u); w[1] = WO(uv, ivec2(40), 0.9, 4013u);`,surf:`
  // granite setts laid in courses along u: 125 mm courses, each course its own sett length (2 m / 8\u202611) and phase,
  // 10-16 mm joints of dark grit (moss creeping in along damp patches), domed polished tops, arris wear, per-sett tone
  // (grey, pink and blue-grey granite), crystal speckle. albedo.a = the stone (block colour), rgb = joints + speckle.
  const float RH = 0.125;
  int row = int(floor(P.y / RH));
  int rw = int(mod(float(row), 16.0));
  float ly = P.y - float(row) * RH;
  float nr = 8.0 + floor(hf(ivec2(rw, 0), 41u) * 3.999);
  float SL = 2.0 / nr;
  float xs = P.x - hf(ivec2(rw, 1), 43u) * SL;
  float ci = floor(xs / SL);
  float lx = xs - ci * SL;
  ivec2 sid = ivec2(int(mod(ci, nr)), rw);
  vec2 jit = (hf2(sid, 47u) - 0.5) * vec2(0.012, 0.006);
  float jw = 0.0055 + 0.0025 * hf(sid, 53u);
  vec2 lp = vec2(lx - SL * 0.5, ly - RH * 0.5) - jit;
  vec2 hs = vec2(SL * 0.5 - jw - 0.002, RH * 0.5 - jw - 0.001);
  float e = jw - sdRB(lp, hs, 0.02);
  vec2 pr = edgeProf(e, jw, 0.016, 0.005, 0.013);
  float inJ = pr.y;
  float dome = max(0.0, 1.0 - pow(lp.x / hs.x, 2.0)) * max(0.0, 1.0 - pow(lp.y / hs.y, 2.0));
  vec2 tilt = hf2(sid, 59u) - 0.5;
  float h1 = hf(sid, 61u), h2 = hf(sid, 67u);
  float mott = n[0], cloud = n[1], fine = n[2];
  vec4 g = c[0];
  float crystal = smoothstep(0.05, 0.25, g.y - g.x);
  float spk = step(0.86, g.z) * crystal, dk = step(g.z, 0.12) * crystal;
  float tone = 0.8 * (0.84 + 0.3 * h1) * (1.0 + 0.05 * mott + 0.03 * fine);
  float polish = smoothstep(0.35, 0.9, dome) * smoothstep(-0.2, 0.5, cloud);
  tone *= 1.0 + 0.06 * polish;
  float arris = clamp(1.0 - (e - jw) / 0.02, 0.0, 1.0) * (1.0 - inJ);
  tone *= 1.0 - 0.1 * arris;
  // stone hue: most grey, some pink (warm), some blue-grey (cool): own-colour offsets are added on top of the tint
  vec3 hue = h2 < 0.22 ? lin(vec3(0.16, 0.09, 0.07)) : (h2 > 0.8 ? lin(vec3(0.05, 0.07, 0.1)) : vec3(0.0));
  float moss = smoothstep(0.25, 0.75, cloud * 0.6 + 0.4 * mott) * (0.4 + 0.6 * smoothstep(0.0, 0.02, 0.02 - (e - jw)));
  vec3 grit = mix(lin(vec3(0.2, 0.19, 0.17)) * (0.8 + 0.4 * fine), lin(vec3(0.2, 0.25, 0.12)), moss * 0.8);
  vec3 own = hue * (1.0 - inJ) * 0.6;
  own = mix(own, lin(vec3(0.9, 0.88, 0.84)), spk * 0.5 * (1.0 - inJ));
  own = mix(own, lin(vec3(0.08, 0.08, 0.09)), dk * 0.5 * (1.0 - inJ));
  own = mix(own, grit, inJ);
  float cov = (1.0 - inJ) * (1.0 - 0.5 * spk) * (1.0 - 0.5 * dk);
  // a thin film of moss on the sett edges in the damp patches
  float edgeMoss = moss * arris * 0.5;
  own = mix(own, lin(vec3(0.16, 0.22, 0.1)), edgeMoss); cov *= 1.0 - edgeMoss;
  s.alb = own; s.a = cov * tone;
  s.h = pr.x + (0.0045 * dome + dot(tilt, lp) * 0.02) * (1.0 - inJ) + 0.00012 * fine * (1.0 - inJ) + 0.0002 * crystal * (g.z - 0.5);
  s.rough = mix(0.78 - 0.22 * polish + 0.05 * mott - 0.1 * spk, 0.96, inJ);
  s.cav = mix(1.0, 0.45, inJ) * (1.0 - 0.15 * arris);`}},{slot:41,name:"engbrick",onTop:40,mat:{detail:.55,scale:1.8,tint:!0,mask:!0,alpha:!1,mode:h,sym:1,hr:[-.009,.001],ao:.5,prep:`f[0] = FB(uv, ivec2(72), 3, 0.5, 4101u); f[1] = FB(uv, ivec2(5), 4, 0.5, 4103u); f[2] = FB(uv, ivec2(144), 2, 0.5, 4107u);
  f[3] = FB(uv, ivec2(9, 3), 3, 0.5, 4109u); w[0] = WO(uv, ivec2(150), 1.0, 4111u);`,surf:`
  // English bond engineering brick (225 x 75 mm stretchers, 112 mm headers, 10 mm lime joints struck flush and a
  // little recessed): alternating stretcher / header courses, a share of the headers vitrified blue-black and glossy,
  // per-brick tone + firing variation, crisp arrises, lime bloom and damp darkening toward the foot of the repeat.
  // albedo.a = the brick body (block colour: red or blue), rgb = mortar, vitrified faces, bloom.
  const float CH = 0.075;
  int row = int(floor(P.y / CH));
  float ly = P.y - float(row) * CH;
  bool header = int(mod(float(row), 2.0)) == 1;
  float BL = header ? 0.1125 : 0.225;
  float bx = P.x - (header ? 0.0 : 0.05625);
  int ci = int(floor(bx / BL));
  float lx = bx - float(ci) * BL;
  ivec2 bid = wrp(ivec2(ci, row), ivec2(header ? 16 : 8, 24));
  vec2 lp = vec2(lx - BL * 0.5, ly - CH * 0.5);
  float e = 0.005 - sdRB(lp, vec2(BL * 0.5 - 0.005, CH * 0.5 - 0.005), 0.003);
  vec2 pr = edgeProf(e, 0.005, 0.004, 0.0015, 0.004);
  float inM = pr.y;
  float h1 = hf(bid, 3u), h2 = hf(bid, 5u), h3 = hf(bid, 7u);
  float sand = n[0], mott = n[1], fine = n[2];
  bool vit = header && h2 < 0.42;
  float tone = 0.8 * (0.8 + 0.34 * h1) * (1.0 + 0.03 * sand + 0.03 * mott);
  float face = max(0.0, 1.0 - pow(lp.x / (BL * 0.5), 6.0)) * max(0.0, 1.0 - pow(lp.y / (CH * 0.5), 6.0));
  // lime bloom: soft white runs under some joints + a chalky band near the foot; damp darkening at the foot
  float foot = 1.0 - smoothstep(0.0, 0.55, P.y);
  float bloom = smoothstep(0.35, 0.85, n[3] * 0.5 + 0.5) * (0.35 + 0.65 * foot) * smoothstep(0.1, 0.9, mott * 0.5 + 0.5);
  float damp = foot * smoothstep(-0.3, 0.4, mott) * 0.5;
  vec3 mortar = lin(vec3(0.66, 0.64, 0.6)) * (0.9 + 0.12 * fine + 0.05 * sand);
  vec3 vitC = lin(vec3(0.16, 0.17, 0.2)) * (0.8 + 0.5 * h3) * (1.0 + 0.1 * sand);
  vec3 own = vec3(0.0); float cov = 1.0;
  if (vit) { own = vitC; cov = 0.12; }
  own = mix(own, mortar, inM); cov *= 1.0 - inM;
  own = mix(own, lin(vec3(0.82, 0.8, 0.76)), bloom * 0.35); cov *= 1.0 - bloom * 0.35;
  own *= 1.0 - 0.3 * damp;
  s.alb = own; s.a = cov * tone * (1.0 - 0.3 * damp) * (1.0 - 0.06 * (1.0 - face) * (1.0 - inM));
  s.h = pr.x + (0.0004 * face * h3 + 0.00015 * sand) * (1.0 - inM) - 0.0006 * inM * fine;
  s.rough = mix(vit ? 0.34 + 0.1 * sand : 0.78 + 0.06 * sand - 0.05 * h1, 0.93, inM);
  s.rough = mix(s.rough, 0.9, bloom * 0.4);
  s.cav = mix(1.0, 0.62, inM) * (1.0 - 0.1 * damp);`}},{slot:42,name:"hoofsteps",onWall:41,mat:{detail:.5,scale:1.8,stair:[.45,4,.55,3],tint:!0,mask:!0,alpha:!1,mode:h,sym:1,hr:[-.016,.03],ao:.4,prep:`f[0] = FB(uv, ivec2(5), 4, 0.5, 4201u); f[1] = FB(uv, ivec2(12), 3, 0.5, 4203u); f[2] = FB(uv, ivec2(48), 2, 0.5, 4207u);
  w[0] = WO(uv, ivec2(220), 1.0, 4211u);`,surf:`
  // horse steps: every 0.45 m down the slope a raised granite kerb rib (110 mm, 25 mm proud, rounded, darker and
  // polished by hooves and boots) across the ramp; between the ribs setts in courses across the slope, dished a little
  // toward the rib below. v runs downhill. albedo.a = stone (block colour).
  const float PD = 0.45, RH = 0.1125;
  float j = floor(P.y / PD);
  float a = P.y - j * PD;                                  // metres below this period's rib line
  float rb = 0.055 - abs(a - 0.055);                       // inside the rib when > 0 (rib spans a 0 \u2026 0.11)
  float rib = smoothstep(-PX, PX, rb);
  float ribH = 0.025 * sqrt(clamp(rb / 0.02, 0.0, 1.0));
  // setts between the ribs: 4 courses of 112 mm, per-course length + phase
  float sy = a - 0.11;
  int crs = int(floor(max(sy, 0.0) / 0.085));
  int cw = int(mod(j * 4.0 + float(crs), 16.0));
  float ly = sy - float(crs) * 0.085;
  float nr = 7.0 + floor(hf(ivec2(cw, 0), 71u) * 2.999);
  float SL = 1.8 / nr;
  float xs = P.x - hf(ivec2(cw, 1), 73u) * SL;
  float ci = floor(xs / SL);
  float lx = xs - ci * SL;
  ivec2 sid = ivec2(int(mod(ci, nr)), cw);
  vec2 lp = vec2(lx - SL * 0.5, ly - 0.0425);
  vec2 hs = vec2(SL * 0.5 - 0.007, 0.0425 - 0.006);
  float e = 0.006 - sdRB(lp, hs, 0.016);
  vec2 pr = edgeProf(e, 0.006, 0.012, 0.004, 0.012);
  float inJ = pr.y * (1.0 - rib) * step(0.0, sy);
  float dome = max(0.0, 1.0 - pow(lp.x / hs.x, 2.0)) * max(0.0, 1.0 - pow(lp.y / hs.y, 2.0));
  float dish = -0.012 * (1.0 - smoothstep(0.11, PD, a));   // worn hollow just below each rib
  float h1 = hf(sid, 79u);
  float mott = n[0], cloud = n[1], fine = n[2];
  vec4 g = c[0];
  float crystal = smoothstep(0.05, 0.25, g.y - g.x);
  float spk = step(0.87, g.z) * crystal;
  float tone = 0.8 * (0.85 + 0.28 * h1) * (1.0 + 0.05 * mott + 0.03 * fine);
  float ribTone = 0.8 * (0.72 + 0.1 * hf(ivec2(int(mod(j, 4.0)), 0), 83u)) * (1.0 + 0.04 * fine);
  float ribPol = rib * smoothstep(0.004, 0.02, rb);
  vec3 grit = lin(vec3(0.2, 0.19, 0.17)) * (0.8 + 0.4 * fine);
  vec3 own = mix(vec3(0.0), lin(vec3(0.9, 0.88, 0.84)), spk * 0.4);
  own = mix(own, grit, inJ);
  float cov = (1.0 - inJ) * (1.0 - 0.4 * spk);
  // grit banked against the uphill face of each rib
  float bank = (1.0 - smoothstep(0.11, 0.16 + 0.03 * cloud, a)) * (1.0 - rib) * smoothstep(-0.2, 0.4, cloud);
  own = mix(own, grit * 1.2, bank * 0.6); cov *= 1.0 - bank * 0.6;
  s.alb = own;
  s.a = cov * mix(tone, ribTone * (1.0 + 0.12 * ribPol), rib);
  float hS = pr.x + 0.004 * dome * (1.0 - inJ) + dish;
  s.h = mix(hS, max(hS, ribH), rib) + 0.00012 * fine;
  s.rough = mix(mix(0.8 + 0.05 * mott - 0.1 * spk, 0.96, inJ), 0.5 - 0.15 * ribPol, rib);
  s.cav = mix(1.0, 0.45, inJ) * (1.0 - 0.45 * exp(-pow((a - 0.113) / 0.008, 2.0)) * (1.0 - rib));`}}];var Q={};n(Q,{SURF:()=>X,SURFACES:()=>V});var X={calce:43,cotto:44,pebble:45},D={detail:.7,scale:3.6,tint:!0,mask:!0,alpha:!1,mode:0,sym:0,hr:[-.004,.002],ao:.3,prep:`f[0] = FB(uv, ivec2(3), 4, 0.55, 4301u); f[1] = FB(uv, ivec2(14), 3, 0.5, 4303u); f[2] = FB(uv, ivec2(64), 2, 0.5, 4307u);
  f[3] = FB(uv, ivec2(36, 3), 3, 0.5, 4309u);
  vec2 wq = uv + 0.01 * vec2(sin(TAU * (5.0 * uv.y + 2.0 * uv.x)), sin(TAU * (4.0 * uv.x - 3.0 * uv.y) + 1.3));
  w[0] = WO(wq, ivec2(7, 11), 0.75, 4311u); w[1] = WO(uv + 0.012 * vec2(sin(TAU * 7.0 * uv.y), sin(TAU * 5.0 * uv.x)), ivec2(24), 0.9, 4313u);`,surf:`
  // rubble courses under a thick wash: stones ~0.5 x 0.33 m only read as soft bulges and faint joint shadows
  vec4 st = c[0];
  float sEdge = st.y - st.x;
  float joint = 1.0 - smoothstep(0.0, 0.22, sEdge);
  float dome = smoothstep(0.0, 0.6, sEdge);
  float blot = n[0], brush = n[1], grain = n[2];
  float runs = smoothstep(0.15, 0.75, n[3]);                                   // vertical runs of wash
  float wash = 0.87 * (1.0 + 0.035 * blot + 0.025 * brush + 0.02 * grain) * (1.0 - 0.035 * runs) * (1.0 - 0.012 * joint);
  wash *= 1.0 + 0.02 * (fract(st.z * 5.31) - 0.5);                              // each stone takes the wash a bit differently
  // flakes: wash lost to the stone and mortar beneath, in a few clusters
  vec4 fk = c[1];
  float cluster = smoothstep(0.25, 0.6, blot) * step(0.84, fract(fk.z * 7.3 + fk.w * 1.7));
  float flake = cluster * (1.0 - aa(0.0, (fk.x - 0.34 - 0.14 * grain) * 0.15));
  vec3 stoneC = mix(lin(vec3(0.66, 0.62, 0.55)), lin(vec3(0.56, 0.55, 0.52)), fract(st.z * 3.7)) * (0.9 + 0.18 * fract(st.z * 11.3));
  vec3 bare = mix(stoneC, lin(vec3(0.72, 0.69, 0.62)) * (0.95 + 0.1 * grain), smoothstep(0.4, 0.9, joint));
  // a hairline crack along a few joints
  float crack = (1.0 - aa(0.0005, sEdge * 0.35)) * step(0.88, fract(st.z * 13.1 + st.w * 5.7)) * smoothstep(0.1, 0.5, blot);
  s.alb = bare * flake;
  s.a = (1.0 - flake) * wash * (1.0 - 0.3 * crack);
  s.h = 0.0007 * dome - 0.0003 * joint * joint + 0.0004 * brush + 0.0001 * grain - 0.0012 * flake - 0.0005 * crack;
  s.rough = 0.9 - 0.05 * blot + 0.03 * flake;
  s.cav = 1.0 - 0.02 * joint - 0.2 * flake * joint - 0.25 * crack;`},I={detail:.35,scale:1.2,tint:!0,alpha:!1,mode:1,sym:7,hr:[-.004,.0012],ao:.45,prep:`ivec2 tc = wrp(ivec2(floor(P / 0.3)), ivec2(4));
  f[0] = FB(uv, ivec2(4), 3, 0.5, 4401u); f[1] = FB(uv, ivec2(16), 3, 0.5, 4403u + uint(tc.x * 4 + tc.y) * 97u);
  f[2] = FB(uv, ivec2(96), 2, 0.5, 4407u); w[0] = WO(uv, ivec2(140), 1.0, 4411u);`,surf:`
  // 0.3 m octagonal terracotta tiles; 9 cm glazed majolica squares (tozzetti) where four octagons meet; 6 mm lime joints
  const float TS = 0.3, TH = 0.15, TC = 0.2511;          // tile size, half size, corner cut (|x| + |y| <= TC)
  ivec2 cell = ivec2(floor(P / TS));
  ivec2 cw = wrp(cell, ivec2(4));
  vec2 lp = P - (vec2(cell) + 0.5) * TS;
  vec2 ap = abs(lp);
  float d1 = TH - max(ap.x, ap.y);                       // to the straight joints (cell border)
  float d2 = (TC - (ap.x + ap.y)) * 0.70710678;          // to the corner cut (< 0 = inside the insert)
  bool ins = d2 < 0.0;
  float e = ins ? -d2 : min(d1, d2);
  vec2 pr = edgeProf(e, 0.003, ins ? 0.004 : 0.009, ins ? 0.0008 : 0.0022, 0.004);
  float inJ = pr.y;
  // tile tone: fired terracotta, per-tile value / hue, soft mottling, a few dark "flashed" tiles, worn paler centres
  float hid = hf(cw, 3u), hid2 = hf(cw, 7u), hid3 = hf(cw, 13u);
  vec3 terra = mix(lin(vec3(0.74, 0.47, 0.35)), lin(vec3(0.76, 0.55, 0.43)), hid2);
  terra = mix(terra, lin(vec3(0.6, 0.36, 0.27)), step(0.88, hid3) * 0.55);
  terra *= (0.9 + 0.18 * hid) * (1.0 + 0.08 * n[0] + 0.07 * n[1] + 0.03 * n[2]);
  float wear = smoothstep(0.03, 0.12, e) * smoothstep(-0.2, 0.6, n[0]);
  terra = mix(terra, terra * vec3(1.08, 1.1, 1.14), 0.35 * wear);
  float grain = smoothstep(0.05, 0.25, c[0].y - c[0].x) * (c[0].z - 0.5);
  terra *= 1.0 + 0.08 * grain;
  // tozzetti: glazed squares, mostly cobalt, some white and lemon, one per tile corner (id from the corner point)
  ivec2 corner = wrp(cell + ivec2(lp.x > 0.0 ? 1 : 0, lp.y > 0.0 ? 1 : 0), ivec2(4));
  float kid = hf(corner, 17u);
  vec3 glaze = kid < 0.3 ? lin(vec3(0.2, 0.36, 0.6)) : (kid < 0.95 ? lin(vec3(0.88, 0.86, 0.79)) : lin(vec3(0.88, 0.74, 0.34)));
  float ring = 1.0 - smoothstep(0.004, 0.012, e);          // a darker glaze line round each insert
  glaze *= (1.0 + 0.05 * n[1]) * (1.0 - 0.25 * ring);
  vec3 grout = lin(vec3(0.7, 0.66, 0.58)) * (1.0 + 0.06 * n[2]);
  vec3 col = ins ? glaze : terra;
  s.alb = mix(col, grout, inJ);
  s.h = pr.x + (ins ? 0.0002 * n[1] : 0.00025 * n[0] + 0.0001 * grain) * (1.0 - inJ);
  s.rough = mix(ins ? 0.22 + 0.05 * n[1] : 0.72 - 0.12 * wear + 0.06 * hid2, 0.93, inJ);
  s.cav = mix(1.0, 0.55, inJ);`},G={detail:.5,scale:2.4,tint:!0,alpha:!1,mode:1,sym:7,hr:[-.007,.003],ao:.4,prep:`f[0] = FB(uv, ivec2(4), 4, 0.5, 4501u); f[1] = FB(uv, ivec2(24), 3, 0.5, 4503u); f[2] = FB(uv, ivec2(120), 2, 0.5, 4507u);
  w[0] = WO(uv, ivec2(40), 0.92, 4511u);`,surf:`
  // limestone strips (14 cm) along the repeat borders, jointed every 0.6 m; rounded pebbles (~6 cm) set in mortar
  float db = min(jd(P.x, 2.4), jd(P.y, 2.4));
  bool alongX = jd(P.y, 2.4) < jd(P.x, 2.4);
  float band = 1.0 - aa(0.07, db);
  float bj = jd(alongX ? P.x : P.y, 0.6);
  vec2 pb = edgeProf(min(0.07 - db, bj), 0.0025, 0.008, 0.002, 0.005);
  vec4 pc = c[0];
  float pe = pc.y - pc.x;                                  // pebble edge distance (cell units)
  float peb = smoothstep(0.04, 0.15, pe);
  float dome = sqrt(clamp(pe / 0.45, 0.0, 1.0));
  float id = pc.z, id2 = fract(id * 7.13);
  vec3 pcol = id < 0.4 ? lin(vec3(0.7, 0.69, 0.66)) : id < 0.7 ? lin(vec3(0.72, 0.68, 0.61)) : id < 0.84 ? lin(vec3(0.8, 0.79, 0.75))
            : id < 0.93 ? lin(vec3(0.55, 0.55, 0.54)) : lin(vec3(0.7, 0.63, 0.52));
  pcol *= (0.92 + 0.14 * id2) * (1.0 + 0.06 * n[2]) * (0.94 + 0.08 * dome);
  vec3 mortar = lin(vec3(0.66, 0.62, 0.55)) * (1.0 + 0.08 * n[1] + 0.04 * n[0]);
  vec3 lime = lin(vec3(0.8, 0.77, 0.7)) * (1.0 + 0.05 * n[0] + 0.04 * n[1] + 0.03 * n[2]) * (0.95 + 0.1 * hf(ivec2(floor((alongX ? P.x : P.y) / 0.6), 0), 5u));
  vec3 fill = mix(mortar, pcol, peb);
  float grime = smoothstep(0.1, 0.7, n[0]) * 0.08;
  s.alb = mix(fill, mix(lime, lime * 0.7, pb.y), band) * (1.0 - grime);
  s.h = mix(-0.004 + 0.0065 * dome * peb + 0.0002 * n[2], pb.x + 0.0002 * n[1], band);
  s.rough = mix(mix(0.93, 0.6 + 0.1 * id2, peb), mix(0.74, 0.92, pb.y), band);
  s.cav = mix(mix(0.7, 1.0, peb), mix(1.0, 0.65, pb.y), band);`},V=[{slot:43,name:"calce",onTop:44,mat:D},{slot:44,name:"cotto",onWall:43,mat:I},{slot:45,name:"pebble",onWall:43,mat:G}];var e0={};n(e0,{SURF:()=>K,SURFACES:()=>Z});var K={tarmac:46,quay:47,chequer:48},P=1,Y=2,Z=[{slot:46,name:"tarmac",onWall:i.concrete,mat:{detail:.6,scale:4,tint:!0,mask:!0,alpha:!1,mode:Y,sym:7,hr:[-.004,.0012],ao:.45,prep:`f[0] = FB(uv, ivec2(3), 4, 0.5, 3101u); f[1] = FB(uv, ivec2(8), 3, 0.5, 3107u); f[2] = FB(uv, ivec2(48), 2, 0.5, 3109u);
  f[3] = FB(uv, ivec2(4), 3, 0.55, 3113u); w[0] = WO(uv, ivec2(190), 1.0, 3119u); w[1] = WO(uv, ivec2(7), 0.9, 3121u);`,surf:`
  // dense-graded wearing course: aggregate set in binder (the tinted part), a sealed crack network (glossy black
  // bitumen bands, own colour), oil drips, rubber scuffs, lighter traffic-polished patches
  vec4 wc = c[0];
  float stone = smoothstep(0.08, 0.3, wc.y - wc.x);
  float light = step(0.9, wc.z);
  float big = n[0], mid = n[1], fine = n[2];
  float tone = mix(0.6 + 0.05 * fine, 0.74 + 0.16 * fract(wc.z * 7.13), stone);
  tone = mix(tone, 0.98, light * stone * 0.55);
  float worn = smoothstep(-0.05, 0.6, big);
  tone *= 1.0 + 0.07 * big + 0.04 * mid + 0.06 * worn;
  // crack network: coarse worley cell borders where the low-frequency noise allows it; sealant band ~4 cm
  vec4 cr = c[1];
  float edgeM = (cr.y - cr.x) * (4.0 / 7.0);
  float edgeSel = fract((cr.z + cr.w) * 13.7 + abs(cr.z - cr.w) * 5.3);     // per cell border: sealed / open / none
  float crackOn = smoothstep(0.3, 0.62, n[3]) * step(0.55, edgeSel);
  float seal = (1.0 - aa(0.016 + 0.006 * mid, edgeM)) * crackOn;
  float crack = (1.0 - aa(0.0018, edgeM)) * step(edgeSel, 0.3) * smoothstep(0.1, 0.4, n[3]) * 0.7;
  // oil drips + rubber scuffs (own dark colours)
  float oil = smoothstep(0.66, 0.84, 0.5 + 0.5 * mid) * smoothstep(0.1, 0.5, 0.5 + 0.5 * fine) * (1.0 - seal);
  float scuff = smoothstep(0.7, 0.9, 0.5 + 0.5 * n[3]) * smoothstep(0.3, 0.7, 0.5 + 0.5 * big) * 0.5;
  vec3 own = vec3(0.0); float cov = 1.0;
  own = mix(own, vec3(0.035, 0.035, 0.038) * (1.0 + 0.3 * fine), seal * 0.85); cov *= 1.0 - seal * 0.85;
  own = mix(own, vec3(0.03, 0.028, 0.026), oil * 0.55); cov *= 1.0 - oil * 0.55;
  own = mix(own, vec3(0.05), crack * 0.6); cov *= 1.0 - crack * 0.6;
  s.alb = own;
  s.a = cov * clamp(tone * 1.18 * (1.0 - 0.22 * scuff), 0.0, 1.0);
  s.h = (-0.0011 * (1.0 - stone) + 0.0005 * stone * (1.0 - wc.x * wc.x) + 0.0001 * big) * (1.0 - seal) + 0.0006 * seal - 0.002 * crack;
  s.rough = mix(mix(mix(0.93, 0.8, stone) - 0.1 * worn, 0.38, seal * 0.9), 0.5, oil * 0.6);
  s.cav = (1.0 - 0.25 * (1.0 - stone)) * (1.0 - 0.4 * crack);`}},{slot:47,name:"quay",onWall:i.concrete,mat:{detail:.9,scale:4.8,tint:!0,mask:!0,alpha:!1,mode:P,sym:7,hr:[-.008,.001],ao:.5,prep:`f[0] = FB(uv, ivec2(4), 5, 0.55, 3201u); f[1] = FB(uv, ivec2(12), 3, 0.5, 3203u);
  f[2] = FB(uv, ivec2(4, 150), 1, 0.5, 3209u); f[3] = FB(uv, ivec2(150, 4), 1, 0.5, 3211u);
  w[0] = WO(uv, ivec2(160), 1.0, 3217u); w[1] = WO(uv, ivec2(6), 0.85, 3221u);`,surf:`
  // 2.4 m cast apron slabs (2 x 2 per repeat): sawn joints filled with dark sealant, rounded arrises, a broom finish
  // whose direction alternates slab to slab, per-slab tone, exposed aggregate where traffic wore the laitance off,
  // rust bleeding from dropped lashing gear, hairline cracks, rubber scuffs
  ivec2 cell = ivec2(floor(P / 2.4));
  ivec2 cw = wrp(cell, ivec2(2));
  vec2 lp = P - (vec2(cell) * 2.4 + 1.2);
  float e = -sdRB(lp, vec2(1.2), 0.004);
  vec2 pr = edgeProf(e, 0.005, 0.007, 0.0025, 0.008);
  float inJ = pr.y;
  float hid = hf(cw, 3u), hid2 = hf(cw, 5u);
  bool du = ((cw.x + cw.y) & 1) == 0;
  float broom = du ? n[2] : n[3];
  float mott = n[0], cloud = n[1];
  vec4 ag = c[0];
  float agg = smoothstep(0.1, 0.3, ag.y - ag.x);
  float worn = smoothstep(0.15, 0.7, mott + 0.3 * cloud);
  float tone = 0.8 * (1.0 + 0.09 * (hid - 0.5) + 0.07 * mott + 0.04 * cloud + 0.035 * broom);
  tone *= mix(1.0, 0.86 + 0.28 * fract(ag.z * 9.1), agg * worn * 0.7);
  float grime = (1.0 - smoothstep(0.0, 0.07, e - 0.005)) * (1.0 - inJ);
  tone *= 1.0 - 0.1 * grime;
  // rust stains: a few blotches per repeat (coarse worley cells), fading out from a darker core
  vec4 rs = c[1];
  float rsel = step(0.72, rs.z) * step(0.03, e);
  float rust = rsel * (1.0 - smoothstep(0.05, 0.28 + 0.1 * cloud, rs.x * 0.8)) * smoothstep(-0.3, 0.4, cloud);
  float crack = (1.0 - aa(0.0022, (rs.y - rs.x) * 0.8)) * step(0.5, fract(rs.z * 5.7 + rs.w * 3.1)) * smoothstep(0.2, 0.5, mott) * step(0.05, e);
  float scuff = smoothstep(0.72, 0.92, 0.5 + 0.5 * cloud) * smoothstep(0.35, 0.8, 0.5 + 0.5 * mott) * 0.6;
  vec3 own = vec3(0.0); float cov = 1.0;
  own = mix(own, vec3(0.03, 0.03, 0.032), inJ); cov *= 1.0 - inJ;
  own = mix(own, vec3(0.34, 0.16, 0.07) * (0.85 + 0.3 * cloud), rust * 0.55); cov *= 1.0 - rust * 0.55;
  own = mix(own, vec3(0.08), crack * 0.55); cov *= 1.0 - crack * 0.55;
  s.alb = own;
  s.a = cov * tone * (1.0 - 0.2 * scuff);
  s.h = pr.x + (0.00012 * broom + 0.0002 * mott + 0.0003 * agg * worn) * (1.0 - inJ) - 0.0015 * crack;
  s.rough = mix(mix(0.86 + 0.05 * broom - 0.08 * worn + 0.04 * hid2, 0.45, inJ), 0.8, rust * 0.5);
  s.cav = mix(1.0, 0.5, inJ) * (1.0 - 0.35 * crack) * (1.0 - 0.1 * grime);`}},{slot:48,name:"chequer",onWall:i.hullpaint,mat:{detail:.3,scale:1.2,tint:!0,mask:!0,alpha:!1,mode:P,sym:3,hr:[-.004,.003],ao:.3,prep:`f[0] = FB(uv, ivec2(3), 4, 0.5, 3301u); f[1] = FB(uv, ivec2(24), 2, 0.5, 3303u); f[2] = FB(uv, ivec2(6), 3, 0.5, 3307u);
  f[3] = FB(uv, ivec2(10), 3, 0.5, 3309u); w[0] = WO(uv, ivec2(8), 0.9, 3311u);`,surf:`
  // painted steel chequer plate: raised lugs on a 40 mm grid alternating \xB145\xB0, a butt-welded seam with a bolt row on
  // the repeat border, paint worn off the lug tops along the walking lines (bare steel, own colour), rust spots
  const float CS = 0.04;
  vec2 cp = P / CS;
  ivec2 ci = ivec2(floor(cp));
  vec2 cf = cp - vec2(ci) - 0.5;
  bool odd = ((ci.x + ci.y) & 1) == 1;
  vec2 q = (odd ? vec2(cf.x + cf.y, cf.y - cf.x) : vec2(cf.x - cf.y, cf.x + cf.y)) * 0.70710678;
  float ld = length(vec2(max(abs(q.x) - 0.26, 0.0), q.y)) - 0.1;
  float lw = PX / CS;
  float lug = 1.0 - smoothstep(-lw, lw, ld);
  float dome = sqrt(clamp(-ld / 0.1, 0.0, 1.0));
  float dS = min(jd(P.x, 1.2), jd(P.y, 1.2));
  float bead = exp(-dS * dS / 0.00004);
  float nearS = 1.0 - smoothstep(0.004, 0.012, dS);
  lug *= 1.0 - nearS;
  float bu = abs(fract(P.x / 0.15) - 0.5) * 0.15, bv = abs(fract(P.y / 0.15) - 0.5) * 0.15;
  float bd = min(length(vec2(bu, jd(P.y, 1.2) - 0.03)), length(vec2(bv, jd(P.x, 1.2) - 0.03)));
  float bolt = 1.0 - aa(0.009, bd);
  float mott = n[0], fineN = n[1], wearN = n[2], rustN = n[3];
  float wear = lug * dome * smoothstep(0.45, 0.8, 0.5 + 0.5 * wearN);
  float edgeWear = bead * smoothstep(0.5, 0.8, 0.5 + 0.5 * wearN) * 0.7;
  vec4 rc = c[0];
  float rust = step(0.86, rc.z) * (1.0 - smoothstep(0.04, 0.2 + 0.08 * rustN, rc.x * 0.15)) * smoothstep(-0.2, 0.4, rustN);
  vec3 steel = vec3(0.42, 0.43, 0.44) * (1.0 + 0.08 * fineN);
  vec3 rustC = vec3(0.3, 0.13, 0.05) * (0.8 + 0.4 * fineN);
  vec3 own = vec3(0.0); float cov = 1.0;
  own = mix(own, steel, wear * 0.85); cov *= 1.0 - wear * 0.85;
  own = mix(own, steel * 0.9, edgeWear); cov *= 1.0 - edgeWear;
  own = mix(own, rustC, rust * 0.7); cov *= 1.0 - rust * 0.7;
  s.alb = own;
  s.a = cov * 0.8 * (1.0 + 0.05 * mott + 0.03 * fineN) * (1.0 - 0.12 * (1.0 - lug) * (1.0 - bolt) * 0.0) * (1.0 + 0.06 * lug * dome);
  s.h = 0.0018 * lug * dome + 0.0008 * bead - 0.0012 * nearS * (1.0 - bead) + 0.0014 * bolt;
  s.rough = mix(mix(0.5 + 0.06 * mott, 0.32, wear), 0.82, rust * 0.7);
  s.metal = wear * 0.8 + edgeWear * 0.6;
  s.cav = (1.0 - 0.2 * (1.0 - lug) * smoothstep(-0.05, 0.02, ld) * 0.0) * (1.0 - 0.3 * nearS * (1.0 - bead));`}}];export{i as a,v as b,o0 as c,B as d,t0 as e,F as f,j as g,W as h,C as i,A as j,R as k,M as l,L as m,E as n,N as o,X as p,Q as q,K as r,e0 as s};
