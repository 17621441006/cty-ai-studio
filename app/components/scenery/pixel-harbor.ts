/** Hand-painted-in-code pixel harbour. Coordinates are in the internal canvas pixels. */
let seaCache: HTMLCanvasElement | null = null;
let seaCacheKey = '';
let staticLayers: {key:string;islands?:HTMLCanvasElement;pier?:HTMLCanvasElement}|null=null;

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const hash = (n: number) => {
  const a = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return a - Math.floor(a);
};

function getSea(w: number, h: number, horizon: number, floor: number) {
  const key = `${w}:${h}:${horizon}:${floor}`;
  if (seaCache && seaCacheKey === key) return seaCache;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext('2d')!;
  const depth = floor - horizon;
  // Each stripe is one internal pixel; the fine stipple breaks up every stripe.
  for (let y = horizon; y < floor; y++) {
    const p = (y - horizon) / depth;
    c.fillStyle = `rgb(${Math.round(20 - p * 11)},${Math.round(66 - p * 31)},${Math.round(92 - p * 35)})`;
    c.fillRect(0, y, w, 1);
  }
  const tones = ['#174b68', '#1b5574', '#24617c', '#2e7390', '#397e99', '#458ca4', '#619eac', '#78b2ba', '#0d314c', '#123d59', '#22536b', '#336e85'];
  // Hundreds of interwoven little wavelets, not broad horizontal colour bands.
  for (let y = horizon; y < floor; y += 2) {
    const p = (y - horizon) / depth;
    for (let x = -5; x < w + 5; x += 3) {
      const seed = x * 9.73 + y * 71.91;
      const a = hash(seed);
      const b = hash(seed + 7.27);
      const wave = Math.sin(x * .057 + y * .23) + Math.sin(x * .021 - y * .33);
      const tone = Math.floor((a * 6.6 + wave * 1.3 + (1 - p) * 1.5 + 13) % 12);
      c.fillStyle = tones[tone];
      const xx = x + Math.floor(hash(seed + 22) * 3);
      const yy = y + (b > .58 ? 1 : 0);
      const len = 1 + Math.floor(hash(seed + 46) * (2 + p * 4));
      c.fillRect(xx, yy, len, 1);
      if (a > .58) {
        c.fillStyle = tones[Math.floor(b * 6)];
        c.fillRect(xx + len - 1, yy + 1, 2, 1);
      }
    }
  }
  // More open, long, dark ripples give the foreground depth without empty areas.
  for (let i = 0; i < 1050; i++) {
    const p = Math.sqrt(hash(i * 19 + 2));
    const x = hash(i * 29 + 8) * w;
    const y = horizon + p * depth;
    c.fillStyle = i % 3 === 0 ? '#092a43' : '#164961';
    c.fillRect(Math.floor(x), Math.floor(y), Math.floor(2 + p * hash(i + 94) * 9), 1);
    if (i % 5 === 0) {
      c.fillStyle = '#6196a4';
      c.fillRect(Math.floor(x + 2), Math.floor(y + 1), Math.floor(2 + p * 5), 1);
    }
  }
  seaCache = canvas;
  seaCacheKey = key;
  return canvas;
}

export function drawHarbor(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  light: number,
  moonX: number,
): void {
  const sx = w / 720;
  const sy = h / 426;
  const horizon = Math.round(h * .604);
  const floor = h - Math.round(16 * sy);
  const moon = clamp(light, 0, 1);
  const rect = (x: number, y: number, ww: number, hh: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x * sx), Math.round(y * sy), Math.max(1, Math.round(ww * sx)), Math.max(1, Math.round(hh * sy)));
  };
  const path = (points: number[][], color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(Math.round(x * sx), Math.round(y * sy)) : ctx.moveTo(Math.round(x * sx), Math.round(y * sy)));
    ctx.closePath();
    ctx.fill();
  };
  const cacheKey=`${w}:${h}`;
  if(staticLayers?.key!==cacheKey)staticLayers={key:cacheKey};
  const layers=staticLayers;
  const cached=(key:'islands'|'pier',paint:()=>void)=>{
    let image=layers[key];
    if(!image){image=document.createElement('canvas');image.width=w;image.height=h;const screen=ctx;ctx=image.getContext('2d')!;paint();ctx=screen;layers[key]=image;}
    ctx.drawImage(image,0,0);
  };
  const hz = horizon / sy;
  const bottom = floor / sy;
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  cached('islands',()=>{
  // Layered island silhouettes leave the night sky completely to the caller.
  path([[0,hz],[0,hz-10],[36,hz-10],[36,hz-14],[68,hz-14],[68,hz-9],[99,hz-9],[99,hz-13],[135,hz-13],[135,hz-9],[164,hz-9],[164,hz-5],[195,hz-5],[195,hz-11],[223,hz-11],[223,hz-18],[244,hz-18],[244,hz-21],[281,hz-21],[281,hz-17],[315,hz-17],[315,hz-14],[350,hz-14],[350,hz-10],[378,hz-10],[378,hz-6],[413,hz-6],[413,hz-3],[464,hz-3],[464,hz],[720,hz]], '#123045');
  path([[0,hz+1],[0,hz-4],[122,hz-4],[122,hz-7],[167,hz-7],[167,hz-12],[203,hz-12],[203,hz-20],[237,hz-20],[237,hz-23],[283,hz-23],[283,hz-22],[309,hz-22],[309,hz-19],[341,hz-19],[341,hz-15],[366,hz-15],[366,hz-12],[399,hz-12],[399,hz-8],[431,hz-8],[431,hz-4],[474,hz-4],[474,hz-1],[502,hz-1],[502,hz+1]], '#081e30');
  // Small stepped pine crowns pick out the island skyline.
  for (let i = 0; i < 38; i++) {
    const x = 152 + i * 6.9;
    const arch = Math.sin((i / 37) * Math.PI);
    const y = hz - 6 - arch * 17;
    const size = 2 + hash(i + 217) * 3;
    rect(x, y, size, 3, '#091e30');
    rect(x + 1, y - 2, size - 2, 3, '#091e30');
    rect(x - 2, y + 3, size + 4, 3, '#091e30');
  }
  // Far harbour lights and their tiny distant vertical echoes.
  for (let i = 0; i < 29; i++) {
    const x = 22 + hash(i * 27.13 + 41) * 419;
    const y = hz - 2 - hash(i + 311) * 4;
    rect(x, y, hash(i + 118) > .6 ? 2 : 1, 1, i % 3 ? '#baac73' : '#e4c887');
  }

  });

  // The rotating lighthouse beam is a sparse translucent pixel fan.
  const towerX = 318;
  const towerY = hz - 28;
  const beamAngle = Math.sin(t * .14) * .16 - .08;
  const beamReach = 104 + Math.cos(t * .14) * 19;
  const beamY = towerY + 1 + beamAngle * beamReach;
  ctx.globalAlpha = .055 + .045 * (Math.cos(t * .14) + 1) / 2;
  path([[towerX+5,towerY+1],[towerX+beamReach,beamY-8],[towerX+beamReach,beamY+7],[towerX+5,towerY+3]], '#d3e2b9');
  ctx.globalAlpha = .08;
  path([[towerX+5,towerY+1],[towerX+beamReach*.72,beamY-3],[towerX+beamReach*.72,beamY+4],[towerX+5,towerY+3]], '#d3e2b9');
  ctx.globalAlpha = 1;
  rect(towerX-2,towerY-3,9,2,'#607d80');
  rect(towerX-1,towerY-1,7,6,'#6e7f75');
  rect(towerX+1,towerY,3,2,'#fff1ba');
  rect(towerX,towerY+5,5,18,'#d9d3b6');
  rect(towerX,towerY+8,5,3,'#b84642');
  rect(towerX,towerY+15,5,3,'#b84642');
  rect(towerX-1,towerY+23,7,2,'#526565');

  ctx.drawImage(getSea(w, h, horizon, floor), 0, 0);
  // Phase gently dims the water but never destroys its blue detail.
  ctx.fillStyle = `rgba(2,15,32,${.08 + (1-moon)*.13})`;
  ctx.fillRect(0,horizon,w,floor-horizon);

  // The sea moves in tiny uncorrelated pixel fragments, with no travelling band.
  for (let i = 0; i < 630; i++) {
    const depth = hash(i * 37.61 + 73);
    const x = hash(i * 17.43 + 6) * 720 + Math.sin(t * .31 + i * 2.31) * (1 + depth * 2);
    const y = hz + depth * (bottom-hz);
    const twinkle = Math.sin(t * .72 + i * 1.931);
    if (twinkle < -.3) continue;
    ctx.globalAlpha = .14 + (twinkle + 1) * .13;
    rect(x,y,1+hash(i+801)*(2+depth*5),1,i%4 ? '#82b8bd' : '#afd3cb');
  }
  ctx.globalAlpha = 1;

  // Golden moon road: broken slender wavelets broaden towards the shore.
  const reflectedX = clamp(moonX, 0, 1) * 720;
  const reflectionStrength = Math.pow(moon, .82);
  for (let row = 0; row < bottom - hz - 1; row++) {
    const p = row / (bottom-hz);
    const center = reflectedX + Math.sin(row * .098 + t*.17) * (1.4+p*2.5) + Math.sin(row * .43) * 1.6;
    const width = 1.8 + Math.pow(p, .82) * 29 + p*p*9;
    const y = hz + row;
    const segments = 4 + Math.floor(p*5);
    // An irregular warm heart makes the reflection read as light, not noise.
    if (hash(row * 67 + 992) > .13) {
      const heart = width * (.76 + hash(row * 43 + 71) * .55);
      ctx.globalAlpha = reflectionStrength * (.38 + hash(row * 73 + 98) * .28);
      rect(center-heart*.5+Math.sin(row*1.8)*2,y,heart,1,'#efdaa8');
    }
    for (let j = 0; j < segments; j++) {
      const seed = row * 91 + j * 37;
      const spread = (hash(seed + 277) * 2 - 1);
      const flicker = .78 + Math.sin(t * .65 + row*.73 + j*2.1)*.2;
      const xx = center + spread * width;
      const length = (1.5 + hash(seed + 721) * (3.4+p*5)) * (1-Math.abs(spread)*.38);
      const palette = ['#d8c895','#f3e3b4','#fff0bf','#b9c2a8','#91b2b5'];
      ctx.globalAlpha = reflectionStrength * flicker * (.39+(1-Math.abs(spread))*.59);
      rect(xx,y,length,1,palette[Math.floor(hash(seed+51)*palette.length)]);
    }
    if (row % 4 === 0) {
      ctx.globalAlpha = reflectionStrength * .32;
      rect(center-width-4-hash(row+8)*5,y,3+hash(row+12)*5,1,'#a7c9c1');
      rect(center+width+hash(row+14)*3,y,2+hash(row+28)*5,1,'#a7c9c1');
    }
  }
  ctx.globalAlpha = 1;

  cached('pier',()=>{
  // The left stone quay and the warm wood jetty stand firmly in the water.
  const pierY = hz + 61;
  rect(0,pierY-4,120,bottom-pierY+4,'#152738');
  rect(0,pierY-5,122,3,'#4f6067');
  rect(0,pierY-2,119,2,'#273c4b');
  for(let row=0;row<9;row++) {
    for(let col=0;col<10;col++) {
      const x=col*13 + (row%2)*6;
      const y=pierY+3+row*10;
      rect(x,y,10,7,(row+col)%3 ? '#192e40' : '#1d3242');
      rect(x+10,y+3,1,4,'#0f2336');
    }
  }
  // Pilings, their wet edges, and short dark reflections below the dock.
  for(let i=0;i<10;i++) {
    const x=124+i*21;
    const height=13+(i%3)*2;
    rect(x+1,pierY+8,4,height,'#1c252b');
    rect(x,pierY+7,3,height,'#72543a');
    rect(x,pierY+8,1,height-1,'#a2794e');
    rect(x+3,pierY+8,2,height,'#3a332c');
    ctx.globalAlpha=.45;
    rect(x-2,pierY+height+8,9,1,'#061d2e');
    rect(x+2,pierY+height+11,6,1,'#09243a');
    ctx.globalAlpha=1;
  }
  rect(116,pierY,224,8,'#694e35');
  rect(116,pierY-1,225,2,'#ba9560');
  rect(116,pierY+2,224,1,'#987044');
  rect(116,pierY+8,224,2,'#241f22');
  for(let i=0;i<27;i++) rect(119+i*8.1,pierY+2,1,6,'#3d342b');
  for(let i=0;i<10;i++) rect(123+i*22,pierY,6,1,'#d2ad72');
  // Low rail along the back half leaves the water visible between slender posts.
  for(let i=0;i<5;i++) {
    const x=129+i*37;
    rect(x,pierY-8,2,8,'#514c3a');
    rect(x,pierY-8,1,2,'#8b7954');
  }
  rect(129,pierY-7,150,1,'#6b6247');
  rect(129,pierY-4,150,1,'#393f35');
  // Rope coil and a pair of small dock crates.
  rect(211,pierY-3,10,3,'#bba675');
  rect(213,pierY-4,5,1,'#d2be88');
  rect(214,pierY-2,4,1,'#6c5a3b');
  rect(143,pierY-5,6,5,'#7e7150');
  rect(144,pierY-4,4,1,'#aca077');
  rect(304,pierY+2,7,4,'#fcdf97');
  rect(305,pierY+3,5,2,'#fff2bf');

  // Dock lantern, softly glowing in concentric pixel rectangles.
  const lampX=334, lampY=pierY-39;
  for(let k=5;k>0;k--) {
    ctx.globalAlpha=(6-k)*.013;
    rect(lampX-2-k*2,lampY-1-k*2,6+k*4,7+k*4,'#f4d68d');
  }
  ctx.globalAlpha=1;
  rect(lampX,pierY-33,2,33,'#394b48');
  rect(lampX+2,pierY-33,1,33,'#1b3339');
  rect(lampX-2,lampY,7,9,'#7b8467');
  rect(lampX-1,lampY+1,5,6,'#f8d884');
  rect(lampX,lampY+2,3,4,'#fff1b3');
  rect(lampX-3,lampY-1,9,2,'#3e5552');
  rect(lampX-2,lampY+9,7,1,'#243d43');
  ctx.globalAlpha=.5;
  for(let i=0;i<9;i++) rect(lampX-3+Math.sin(i*4)*4,pierY+13+i*3,2+hash(i+982)*5,1,'#b4ac71');
  ctx.globalAlpha=1;

  // The interactive skiff is painted by HarborBoat at the same shared dock coordinates.

  });

  // Small anchored buoys at different depths, each with a broken reflection.
  const lanterns = [[177,hz+110,1.0],[483,hz+125,.92],[632,hz+87,.78]];
  for(let i=0;i<lanterns.length;i++) {
    const [x,baseY,scale]=lanterns[i];
    const yy=baseY+Math.sin(t*.6+i*2)*.8;
    const bw=13*scale,bh=15*scale;
    for(let k=3;k>0;k--) {
      ctx.globalAlpha=.025;
      rect(x-k*3,yy-k*3,bw+k*6,bh+k*6,'#f6d68c');
    }
    ctx.globalAlpha=1;
    rect(x-2,yy-2,bw+4,2,'#8d8c70');
    rect(x-1,yy,bw+2,bh,'#bdaa7a');
    rect(x+1,yy+1,bw-2,bh-2,'#f4dda2');
    rect(x+4*scale,yy+2,3*scale,bh-4,'#f1b47a');
    rect(x+2,yy+2,2,bh-3,'#fff0b9');
    rect(x-2,yy+bh,bw+4,2,'#d78f8f');
    rect(x-3,yy+bh+2,bw+6,2,'#406c5b');
    for(let j=0;j<4;j++) rect(x+j*4,yy+bh+1,2,1,'#ffe5ba');
    for(let j=0;j<6;j++) {
      if(yy+bh+7+j*2>bottom-1) break;
      ctx.globalAlpha=.42-j*.052;
      rect(x-1+Math.sin(j*2+i)*3,yy+bh+5+j*2,bw+hash(i*31+j)*4,1,j%2?'#b7b392':'#e6ce94');
    }
    ctx.globalAlpha=1;
  }
  // Tiny distant red and green navigation buoys.
  rect(506,hz+26+Math.sin(t*.8)*.4,2,4,'#a8655c');
  rect(505,hz+30,4,1,'#243e48');
  rect(565,hz+49+Math.sin(t*.65+2)*.5,2,4,'#6d9a75');
  rect(564,hz+53,4,1,'#223e48');

  // Shore ledge is the shared ground line on which the parent places the cat.
  rect(0,bottom,720,2,'#9c8b64');
  rect(0,bottom+2,720,1,'#455363');
  rect(0,bottom+3,720,13,'#0c1c31');
  rect(0,bottom+4,720,1,'#172d43');
  for(let i=0;i<42;i++) {
    const x=i*18 + hash(i+41)*8;
    rect(x,bottom+5+Math.floor(hash(i+237)*9),3+hash(i+84)*9,1,'#12273d');
    if(i%3===0) rect(x,bottom+1,5,1,'#b6a074');
  }
  ctx.restore();
}
