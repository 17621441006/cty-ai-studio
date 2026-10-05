import { drawHarbor } from './pixel-harbor';
import { createShanghaiLandmarks } from './shanghai-landmarks';

export type PixelSceneryKind = 'shanghai' | 'harbor';
export type PixelShop = { id: string; label: string; subLabel: string; app: string; x: number; y: number; width: number; height: number; color: string };
type SceneryOptions = { getLight: () => number; getMoonX: () => number; onReady?: () => void };
type PixelWindow = { x: number; y: number; w: number; h: number; seed: number; color: number; period: number };
type Building = { id: number; x: number; y: number; w: number; h: number; plane: number; color: string; trim: string; windows: PixelWindow[]; antenna: boolean; heritage?: 'colonnade' | 'dome' | 'clock' | 'pyramid' };
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const hash = (n: number) => { const q = Math.sin(n * 127.1 + 311.7) * 43758.5453; return q - Math.floor(q); };
const shopSpecs = [
  { id: 'family', label: 'FamilyMart 全家', subLabel: '24H · 灵感补给', app: 'cat', x: 0, w: 108, color: '#49e8c0' },
  { id: 'pancake', label: '老上海葱油饼', subLabel: '热乎的街头故事', app: 'zp-sweetrove', x: 0, w: 108, color: '#ffc575' },
  { id: 'zhen', label: '振鼎鸡', subLabel: '今夜也有好味道', app: 'works', x: 0, w: 90, color: '#ff787e' },
  { id: 'tims', label: 'TIMS COFFEE', subLabel: '咖啡与一首唱片', app: 'music', x: 0, w: 112, color: '#ff9aaf' },
];
export function getShopLayout(width: number, height: number): PixelShop[] {
  const signHeight = clamp(height * .028, 20, 25), road = clamp(height * .0493, 36, 44), body = clamp(height * .056, 40, 54);
  const factor=clamp(width/1364,.65,1.2), gap=12*factor, total=shopSpecs.reduce((n,s)=>n+s.w*factor,0)+gap*3;
  let left=width*.54-total/2;
  return shopSpecs.map(s => { const x=left; left+=s.w*factor+gap; return ({ id: s.id, label: s.label, subLabel: s.subLabel, app: s.app, x, y: height - road - body - signHeight, width: s.w*factor, height: signHeight, color: s.color }); });
}

/** Pixel geometry is independent of devicePixelRatio: one painted pixel stays visible. */
export function createPixelScenery(canvas: HTMLCanvasElement, kind: PixelSceneryKind, options: SceneryOptions) {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D is unavailable');
  const scenery = document.createElement('canvas'), sky = document.createElement('canvas'), distant = document.createElement('canvas');
  const sceneryCtx = scenery.getContext('2d')!, skyCtx = sky.getContext('2d')!, distantCtx = distant.getContext('2d')!;
  const reduced = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  let w = 0, h = 0, cssW = 0, cssH = 0, scale = .5, raf = 0, last = 0, time = 0, disposed = false, ready = false, lastLight = -1, lastMoon = -1;
  let buildings: Building[] = [], shops: PixelShop[] = [];
  let landmarks: ReturnType<typeof createShanghaiLandmarks> | null = null;
  const warmWindows = ['#e7ac60', '#f3cf86', '#b87957', '#fee6a6', '#f0bb79', '#83bcd3', '#c5c0ec', '#51809c'];
  const rect = (c: CanvasRenderingContext2D, x: number, y: number, rw: number, rh: number, color: string) => { c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(rw)), Math.max(1, Math.round(rh))); };
  const line = (c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, thickness = 1) => { c.strokeStyle = color; c.lineWidth = thickness; c.beginPath(); c.moveTo(Math.round(x1) + .5, Math.round(y1) + .5); c.lineTo(Math.round(x2) + .5, Math.round(y2) + .5); c.stroke(); };
  const polygon = (c: CanvasRenderingContext2D, points: number[][], color: string) => { c.fillStyle = color; c.beginPath(); points.forEach((p, i) => i ? c.lineTo(Math.round(p[0]), Math.round(p[1])) : c.moveTo(Math.round(p[0]), Math.round(p[1]))); c.closePath(); c.fill(); };
  function steppedOval(c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string) {
    c.fillStyle = color;
    for (let yy = -Math.ceil(ry); yy <= ry; yy++) { const half = Math.sqrt(Math.max(0, 1 - yy * yy / (ry * ry))) * rx; c.fillRect(Math.round(x - half), Math.round(y + yy), Math.round(half * 2), 1); }
  }
  function drawSky() {
    skyCtx.imageSmoothingEnabled = false;
    const gradient = skyCtx.createLinearGradient(0, 0, 0, h * .78);
    gradient.addColorStop(0, '#080e25'); gradient.addColorStop(.5, kind === 'shanghai' ? '#161831' : '#0b2d48'); gradient.addColorStop(1, kind === 'shanghai' ? '#283044' : '#1d5570');
    skyCtx.fillStyle = gradient; skyCtx.fillRect(0, 0, w, h);
    // A sparse ordered dither keeps the sky tactile, without a photographic veil.
    for (let y = 1; y < h * .71; y += 3) for (let x = (y % 2) * 2; x < w; x += 4) {
      const n = hash(x * 17 + y * 41);
      if (n > .51) rect(skyCtx, x, y, 1, 1, n > .9 ? 'rgba(73,102,141,.12)' : 'rgba(44,69,102,.065)');
    }
    for (let i = 0; i < 178; i++) {
      const x = hash(i + 803) * w, y = hash(i + 1241) * h * .68;
      if (x > w * .74 && y < h * .49) continue;
      const a = .2 + hash(i + 419) * .43;
      rect(skyCtx, x, y, i % 39 === 0 ? 2 : 1, i % 47 === 0 ? 2 : 1, `rgba(177,203,220,${a})`);
    }
    // Horizontal cloud fragments remain behind the illuminated architecture.
    for (let i = 0; i < 34; i++) {
      const x = hash(i + 604) * w * .7, y = h * (.22 + hash(i + 947) * .39);
      rect(skyCtx, x, y, 14 + hash(i + 373) * 55, 1 + i % 2, 'rgba(76,84,117,.045)');
    }
  }
  function makeBuilding(id: number, x: number, top: number, bw: number, plane: number): Building {
    const bottom = h - clamp(cssH * .0493, 36, 44) * scale;
    const colors = plane === 0 ? ['#172538', '#18263b', '#1a2b3e'] : plane === 1 ? ['#1b233b', '#1d243e', '#20253e'] : ['#161d33', '#191e35', '#1a2035', '#202137'];
    const b: Building = { id, x: Math.round(x), y: Math.round(top), w: Math.round(bw), h: Math.round(bottom - top), plane, color: colors[id % colors.length], trim: plane === 2 ? '#3b405b' : '#293b52', windows: [], antenna: id % 3 === 0 };
    const ww = plane === 0 ? 1 : plane === 1 ? 2 : 4, wh = plane === 0 ? 2 : plane === 1 ? 3 : 6;
    const gx = plane === 0 ? 5 : plane === 1 ? 7 : 11, gy = plane === 0 ? 7 : plane === 1 ? 8 : 15;
    for (let y = b.y + (plane === 2 ? 11 : 6), row = 0; y < bottom - (plane === 2 ? 46 : 7); y += gy, row++) {
      for (let x = b.x + (plane === 2 ? 7 : 4), col = 0; x < b.x + b.w - ww - 3; x += gx, col++) {
        const seed = id * 1709 + row * 107 + col * 31;
        b.windows.push({ x, y, w: ww, h: wh, seed, color: Math.floor(hash(seed + 19) * 8), period: 8 + hash(seed + 6) * 19 });
      }
    }
    return b;
  }
  function buildCity() {
    buildings = [];
    // The Bund stays low across the river: only the Pudong landmarks own the skyline.
    for (let i = 0, x = -4; x < w; i++) {
      const bw = (10 + hash(i + 641) * 23) * w / 720;
      const top = h * (.66 + hash(i + 227) * .15);
      buildings.push(makeBuilding(i + 100, x, top, bw, 0)); x += bw + 2;
    }
    const middle = [[-.01,.101,.76],[.103,.069,.73],[.176,.07,.76],[.255,.087,.78],[.351,.06,.78],[.426,.063,.78],[.504,.082,.78],[.600,.085,.77],[.694,.081,.76],[.787,.11,.81],[.906,.10,.80]];
    middle.forEach((b,i) => buildings.push(makeBuilding(i + 60, b[0] * w, b[2] * h, b[1] * w, 1)));
    const front = [[-.012,.139,.732],[.136,.108,.733],[.251,.111,.749],[.369,.115,.742],[.491,.083,.761],[.582,.110,.729],[.700,.089,.757],[.798,.126,.770],[.932,.086,.768]];
    const roofs: NonNullable<Building['heritage']>[] = ['dome','clock','colonnade','colonnade','colonnade','pyramid','colonnade','colonnade','colonnade'];
    front.forEach((box,i) => {
      const b=makeBuilding(i+1,box[0]*w,box[2]*h,box[1]*w,2);
      b.heritage=roofs[i];b.antenna=false;b.windows=[];
      const gap=Math.max(6,Math.round(w*.013)),ww=Math.max(2,Math.round(gap*.36)),wh=Math.max(4,Math.round(h*.016));
      for(let y=b.y+12,row=0;y<b.y+b.h-8;y+=wh+9,row++)for(let x=b.x+6,col=0;x<b.x+b.w-ww-5;x+=gap,col++){
        const seed=b.id*1709+row*107+col*31;
        b.windows.push({x,y,w:ww,h:wh,seed,color:[0,1,3,4][col%4],period:12+hash(seed+6)*20});
      }
      buildings.push(b);
    });
    // Lights cannot shine through nearer shopfronts or the historic roof silhouettes.
    const storefronts=getShopLayout(cssW,cssH).map(s=>({x:s.x*scale-4,y:s.y*scale-7,w:s.width*scale+8,h:h-s.y*scale+7}));
    const overlaps=(win:PixelWindow,box:{x:number;y:number;w:number;h:number})=>win.x+win.w>box.x&&win.x<box.x+box.w&&win.y+win.h>box.y&&win.y<box.y+box.h;
    const roofBounds=buildings.filter(b=>b.heritage&&b.heritage!=='colonnade').map(b=>({x:b.x+b.w*(b.heritage==='clock'?.30:.20),w:b.w*(b.heritage==='clock'?.40:.60),y:b.y-(b.heritage==='clock'?h*.145+24:b.heritage==='dome'?h*.030+22:h*.068+5),h:b.heritage==='clock'?h*.145+24:b.heritage==='dome'?h*.030+22:h*.068+5}));
    buildings.forEach((b,index) => { b.windows = b.windows.filter(win => ![...buildings.slice(index+1),...storefronts,...roofBounds].some(front=>overlaps(win,front))); });
    sceneryCtx.clearRect(0, 0, w, h);distantCtx.clearRect(0,0,w,h);
    for (const b of buildings.filter(b => b.plane === 0)) drawBuilding(b,distantCtx);
    landmarks=createShanghaiLandmarks(w,h);landmarks.paintStatic(distantCtx);
    for (const b of buildings.filter(b => b.plane > 0)) drawBuilding(b);
    drawNeonFixtures(sceneryCtx);
    drawShops(sceneryCtx);
    drawStreet(sceneryCtx);
  }
  function drawBuilding(b: Building,c=sceneryCtx) {
    if(b.heritage){drawHeritage(b);return;}
    const {x,y,w:bw,h:bh,plane} = b;
    rect(c,x,y,bw,bh,b.color);
    rect(c,x,y,bw,2,b.trim); rect(c,x+bw-3,y+2,3,bh-2,'#10172a');
    if (plane > 0) {
      rect(c,x+2,y+3,1,bh-4,plane === 2 ? '#45405a' : '#2c334c');
      rect(c,x,y-2,bw+2,2,plane === 2 ? '#54566f' : '#34435a');
      rect(c,x+3,y-4,bw-4,2,'#20283e');
      if (b.id % 3 === 0) { rect(c,x+bw*.54,y-10,bw*.23,7,'#252d43'); rect(c,x+bw*.54-1,y-11,bw*.23+2,2,'#586077'); for(let q=0;q<3;q++)rect(c,x+bw*.55+q*3,y-9,1,4,'#131e31'); }
      if (b.antenna && x < w*.7) { const ax=x+bw*.37; rect(c,ax,y-24,1,23,'#657087'); line(c,ax-4,y-12,ax+5,y-12,'#596074');line(c,ax-3,y-18,ax+3,y-18,'#596074');rect(c,ax-1,y-26,3,2,'#904857'); }
      // Brick courses, drain pipes and floor ledges are distinct from lit windows.
      if (plane === 2) {
        for(let yy=y+14; yy<y+bh-47; yy+=15){rect(c,x+3,yy+9,bw-7,1,'#34374e');rect(c,x+3,yy+10,bw-7,1,'#12182c');}
        for(let yy=y+6; yy<y+bh-48; yy+=5) for(let xx=x+4+(Math.floor(yy/5)%2)*4;xx<x+bw-6;xx+=9) if(hash(xx+yy+b.id)>.65)rect(c,xx,yy,3,1,'#2b2d45');
        rect(c,x+bw-6,y+5,1,bh-8,'#3c3b51');
      }
    }
    for (const win of b.windows) {
      if(plane===2){rect(c,win.x-2,win.y-2,win.w+4,win.h+4,'#30334c');rect(c,win.x-1,win.y-1,win.w+2,win.h+2,'#0c1429');rect(c,win.x-2,win.y+win.h+1,win.w+5,1,'#43405a');}
      else rect(c,win.x-1,win.y-1,win.w+2,win.h+2,'#142039');
    }
    // Small rooftop water tanks and air conditioning units.
    if (plane === 2 && b.id % 2 === 0) {
      const tx=x+bw*.68; rect(c,tx,y-12,9,9,'#27293e');rect(c,tx-1,y-13,11,2,'#5a5262');rect(c,tx+1,y-10,7,1,'#4d475d');rect(c,tx+1,y-7,7,1,'#4d475d');rect(c,tx+1,y-3,1,3,'#555365');rect(c,tx+7,y-3,1,3,'#555365');
    }
  }
  function drawHeritage(b: Building) {
    const c=sceneryCtx,{x,y,w:bw,h:bh}=b,center=x+bw/2;
    // Sandstone, cornices and recessed arches read as buildings, not tall neon slabs.
    rect(c,x,y,bw,bh,'#655951');rect(c,x+bw-4,y,4,bh,'#343744');
    rect(c,x+2,y+7,bw-7,bh-7,'#82715b');
    for(let yy=y+9;yy<y+bh;yy+=6){rect(c,x+2,yy,bw-7,1,'#5c524d');for(let xx=x+3+(Math.floor(yy/6)%2)*5;xx<x+bw-5;xx+=10)rect(c,xx,yy,1,5,'#6a5c50');}
    for(const yy of [y-4,y+3,y+bh*.45,y+bh-5]){rect(c,x-2,yy,bw+3,2,'#ddba7a');rect(c,x-1,yy+2,bw+1,2,'#9b805b');rect(c,x+1,yy+4,bw-2,1,'#4c4545');}
    for(let xx=x+4;xx<x+bw-3;xx+=7){rect(c,xx,y-7,3,3,'#b2986b');rect(c,xx,y-5,1,2,'#ffe2a0');}
    const columns=Math.max(3,Math.floor(bw/12));
    for(let q=0;q<=columns;q++){
      const xx=x+4+(bw-12)*q/columns;
      rect(c,xx,y+7,3,bh-13,'#b99a68');rect(c,xx,y+7,1,bh-13,'#ebc990');rect(c,xx-1,y+7,5,2,'#f0d59c');rect(c,xx-1,y+bh-8,5,3,'#d2b480');
    }
    for(const win of b.windows){
      rect(c,win.x-1,win.y-1,win.w+2,win.h+3,'#d0ad75');
      steppedOval(c,win.x+win.w/2,win.y,win.w/2+1,3,'#d0ad75');
      rect(c,win.x,win.y,win.w,win.h,'#25303b');
      rect(c,win.x-2,win.y+win.h+2,win.w+4,1,'#f4d7a0');
    }
    const roof=b.heritage;
    if(roof==='dome'){
      const rx=bw*.20,ry=h*.030,cy=y-8;
      rect(c,center-rx-2,cy-3,rx*2+4,11,'#b4986b');
      steppedOval(c,center,cy-3,rx,ry,'#424b4e');
      for(let yy=-ry;yy<0;yy+=3){const half=Math.sqrt(Math.max(0,1-yy*yy/(ry*ry)))*rx;rect(c,center-half,cy-3+yy,half*2,1,'#b29969');}
      for(const offset of [-.56,0,.56])line(c,center,cy-ry-3,center+rx*offset,cy-3,'#d5b881');
      rect(c,center-3,cy-ry-7,6,5,'#ccb886');rect(c,center-1,cy-ry-11,2,5,'#f0d59d');
      rect(c,center-rx-4,cy,rx*2+8,2,'#ffe0a0');
      polygon(c,[[x+5,y+2],[center,y-7],[x+bw-5,y+2]],'#e6c890');
    }else if(roof==='clock'){
      const tw=Math.max(13,bw*.35),top=y-h*.145,cx=center;
      rect(c,cx-tw/2,top,tw,y-top+1,'#9e8966');rect(c,cx-tw/2+2,top+3,2,y-top-2,'#f4d59a');rect(c,cx+tw/2-3,top+3,3,y-top-2,'#625a51');
      for(let yy=top+5;yy<y;yy+=7)rect(c,cx-tw/2+1,yy,tw-3,1,'#c7a775');
      rect(c,cx-tw/2-2,top-3,tw+4,3,'#ffe0a1');rect(c,cx-tw*.36,top-8,tw*.72,5,'#a28f6b');
      polygon(c,[[cx-tw*.39,top-8],[cx,top-17],[cx+tw*.39,top-8]],'#b4a77e');rect(c,cx,top-24,1,9,'#e5c487');
      const cr=Math.max(4,tw*.33),cy=top+cr+5;
      steppedOval(c,cx,cy,cr+1,cr+1,'#4a493f');steppedOval(c,cx,cy,cr,cr,'#f5dda4');
      for(let q=0;q<12;q++){const a=q*Math.PI/6;rect(c,cx+Math.sin(a)*(cr-1),cy-Math.cos(a)*(cr-1),1,1,'#7c674b');}
      line(c,cx,cy,cx-cr*.5,cy-cr*.3,'#4d4a45');line(c,cx,cy,cx+cr*.3,cy-cr*.65,'#4d4a45');
      rect(c,cx-2,cy+cr+7,4,Math.max(5,y-cy-cr-13),'#303e45');rect(c,cx-1,cy+cr+8,1,Math.max(4,y-cy-cr-15),'#e4c38a');
    }else if(roof==='pyramid'){
      const rw=bw*.45,top=y-h*.068;
      rect(c,center-rw/2,y-7,rw,8,'#b29669');
      polygon(c,[[center-rw*.64,y-8],[center,top],[center+rw*.64,y-8]],'#366765');
      polygon(c,[[center,top],[center+rw*.64,y-8],[center,y-8]],'#294b53');
      line(c,center,top,center-rw*.64,y-8,'#7ca597');line(c,center,top,center+rw*.64,y-8,'#91afa0');
      for(let q=1;q<6;q++){const yy=top+(y-8-top)*q/6;rect(c,center-rw*.64*q/6,yy,rw*1.28*q/6,1,'#527c71');}
      rect(c,center,top-5,1,5,'#dbcb9a');
    }else{
      polygon(c,[[center-bw*.24,y-3],[center,y-11],[center+bw*.24,y-3]],'#baa078');
      line(c,center-bw*.25,y-3,center,y-12,'#f0d5a0');line(c,center,y-12,center+bw*.25,y-3,'#d5b680');
    }
  }
  function drawNeonFixtures(c: CanvasRenderingContext2D) {
    const nx=w*.706,ny=h*.757-18,nw=w*.078;
    rect(c,nx-2,ny-2,nw+4,15,'#15162c');rect(c,nx,ny,nw,12,'#4e2548');rect(c,nx,ny,nw,1,'#9d497d');rect(c,nx,ny+11,nw,1,'#9d497d');
    c.font=`bold ${Math.max(5,Math.floor(h*.023))}px monospace`;c.textBaseline='middle';c.fillStyle='#f48ab7';c.fillText('SHANGHAI',nx+3,ny+6,Math.max(6,nw-6));
    // Warm string lights over the little lane between buildings.
    const sx=w*.416,ex=w*.548,sy=h*.842;
    c.strokeStyle='#576277';c.lineWidth=1;c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo((sx+ex)/2,sy+11,ex,sy-3);c.stroke();
    for(let i=0;i<11;i++){const p=i/10,yy=sy+(1-Math.pow(p*2-1,2))*5-p*3;rect(c,sx+(ex-sx)*p,yy,2,2,['#e6b476','#d886a9','#86b99d','#7aaac0'][i%4]);}
  }
  function drawShops(c: CanvasRenderingContext2D) {
    const floor=h-clamp(cssH*.0493,36,44)*scale;
    shops = getShopLayout(cssW,cssH).map(s=>({...s,x:s.x*scale,y:s.y*scale,width:s.width*scale,height:s.height*scale}));
    for(let i=0;i<shops.length;i++){
      const s=shops[i],x=Math.round(s.x),y=Math.round(s.y),sw=Math.round(s.width),sh=Math.round(s.height),body=floor-y-sh;
      rect(c,x-3,y-5,sw+6,floor-y+5,'#0c1427');rect(c,x-4,y-7,sw+8,2,'#56556a');rect(c,x-2,y-5,sw+4,3,'#343346');
      rect(c,x,y,sw,sh,['#e0e8d8','#5c2d27','#eee0c8','#74343e','#dedcce'][i]);
      if(i===0){rect(c,x,y,sw,3,'#309c7d');rect(c,x,y+sh-3,sw,3,'#2375b9');rect(c,x+2,y+sh+2,sw-4,body-3,'#849f9a');}
      if(i===1){rect(c,x+1,y+1,sw-2,1,'#be7b46');rect(c,x,y+sh,sw,2,'#c56e43');}
      if(i===2){rect(c,x,y,sw,2,'#d25453');rect(c,x,y+sh-2,sw,2,'#b9414b');}
      if(i===3){rect(c,x,y,sw,1,'#dc858b');rect(c,x,y+sh-1,sw,1,'#d08789');}
      if(i===4){rect(c,x,y,sw,1,'#eee8d6');rect(c,x,y+sh-1,sw,1,'#eee8d6');}
      // Canopies, mullions, counters, refrigerators, shelving and tiny merchandise.
      const wy=y+sh+3,wh=body-6;
      const lightColors=['#b9d3b0','#d7a061','#ecd2a0','#bb785d','#babac0'];
      rect(c,x+2,wy,sw-4,wh,'#203240');
      for(let panel=0;panel<2;panel++){
        const pw=(sw-7)/2,px=x+3+panel*(pw+1);
        rect(c,px,wy+1,pw-2,wh-3,lightColors[i]);rect(c,px,wy+1,pw-2,2,i===4?'#f0e4cb':'#f7d995');
        rect(c,px+1,wy+4,1,wh-7,'rgba(255,238,199,.4)');
        if(i===0){
          for(let shelf=0;shelf<3;shelf++){const sy=wy+7+shelf*6;rect(c,px,sy,pw-2,1,'#536f69');for(let q=0;q<Math.floor(pw/4)-1;q++)rect(c,px+2+q*4,sy-3,2,3,['#86a366','#c6c66c','#ad7278','#81a7b1'][Math.floor(hash(panel*33+shelf*8+q)*4)]);}
        }else if(i===4){
          const mx=px+pw/2;rect(c,mx-1,wy+6,3,3,'#d7b8a0');polygon(c,[[mx-2,wy+10],[mx+3,wy+10],[mx+6,wy+22],[mx-6,wy+22]],panel%2?'#5d6d7c':'#d7c4b0');rect(c,mx-3,wy+22,2,7,'#433c49');rect(c,mx+2,wy+22,2,7,'#433c49');rect(c,px+2,wy+wh-3,pw-7,2,'#534950');
        }else{
          rect(c,px,wy+wh*.60,pw-2,wh*.39,i===1?'#855336':i===2?'#ad7155':'#674d46');rect(c,px,wy+wh*.59,pw-2,2,'#e6bb80');
          for(let q=0;q<3;q++){rect(c,px+3+q*5,wy+wh*.48,3,3,i===2?'#ce7755':'#dac19b');}
          // A small cook/barista silhouette makes each lit window a little room.
          if(panel===1){rect(c,px+pw*.6,wy+6,3,3,'#e2b493');rect(c,px+pw*.6-1,wy+9,5,7,i===2?'#f0dec0':'#4d4350');}
          if(i===3){rect(c,px+3,wy+4,7,8,'#322f39');rect(c,px+4,wy+5,5,1,'#b59a82');rect(c,px+4,wy+8,4,1,'#b59a82');}
        }
        rect(c,px+pw-3,wy,2,wh,'#303441');
      }
      // The central door opens visually onto a dark, glassy vertical frame.
      const dx=x+sw*.5;rect(c,dx,wy,2,wh,'#303844');rect(c,dx+2,wy+wh*.47,1,4,'#f0dcb3');
      rect(c,x-1,floor-3,sw+2,3,'#77706b');rect(c,x-1,floor-1,sw+2,1,'#a29b87');
      // Real sign typography is supplied by accessible DOM buttons at these exact boxes.
    }
    // Street furnishings in the quiet gaps between shopfronts.
    for(const lx of [w*.22,w*.792]){
      rect(c,lx,floor-63,2,63,'#3b4a5c');rect(c,lx-2,floor-63,7,2,'#626772');rect(c,lx-2,floor-68,7,5,'#4f5b64');rect(c,lx-1,floor-67,5,3,'#fbd393');rect(c,lx-3,floor-2,9,2,'#42495c');
    }
    const vx=w*.668;rect(c,vx,floor-28,10,28,'#424856');rect(c,vx+1,floor-27,8,2,'#a76b81');rect(c,vx+2,floor-23,6,15,'#192c41');for(let q=0;q<3;q++){rect(c,vx+3,floor-22+q*4,2,2,['#adcca2','#b88088','#779cc0'][q]);rect(c,vx+6,floor-22+q*4,1,2,'#d6cfb1');}rect(c,vx+2,floor-5,6,2,'#222939');
    // Flower pots, cardboard boxes, bicycle wheels.
    rect(c,w*.493,floor-8,5,7,'#735948');rect(c,w*.49,floor-12,8,5,'#385848');rect(c,w*.494,floor-14,4,4,'#547454');
    const cx=w*.777;for(let side=0;side<2;side++){const xx=cx+side*9;c.strokeStyle='#647384';c.lineWidth=1;c.beginPath();c.arc(xx,floor-5,4,0,Math.PI*2);c.stroke();}line(c,cx,floor-5,cx+5,floor-12,'#8b6b78');line(c,cx+5,floor-12,cx+9,floor-5,'#8b6b78');line(c,cx+5,floor-12,cx+7,floor-14,'#82929b');
  }
  function drawStreet(c: CanvasRenderingContext2D) {
    const floor=h-clamp(cssH*.0493,36,44)*scale;
    rect(c,0,floor,w,h-floor,'#0d1525');rect(c,0,floor-1,w,1,'#59637a');rect(c,0,floor+1,w,2,'#272e42');
    for(let x=0;x<w;x+=11){rect(c,x,floor-7,10,5,'#333b50');rect(c,x,floor-7,10,1,'#454c60');rect(c,x+1,floor-4,9,1,'#2b3247');}
    for(let i=0;i<290;i++){const x=hash(i+994)*w,y=floor+4+hash(i+1821)*(h-floor-5);rect(c,x,y,2+hash(i+232)*14,1,i%4===0?'#252d42':'#172438');}
    for(let x=13;x<w;x+=43)rect(c,x,h-5,18,1,'#827757');
    rect(c,0,h-1,w,1,'#b09662');
  }
  function drawNeonLight(t: number) {
    const nx=w*.706,ny=h*.757-18,nw=w*.078;
    for(let pad=5;pad>=1;pad-=2){ctx!.globalAlpha=.035+(Math.sin(t*.55)+1)*.013;rect(ctx!,nx-pad,ny-pad,nw+pad*2,12+pad*2,'#ef55a1');}
    ctx!.globalAlpha=.50;rect(ctx!,nx,ny+11,nw,1,'#f090c1');ctx!.globalAlpha=1;
  }
  function drawHeritageLights(t:number) {
    for(const b of buildings){
      if(!b.heritage)continue;
      // Each facade has a short, staggered warm-light swell followed by a long quiet interval.
      const phase=(t+b.id*3.7)%38,p=clamp((phase-23)/9,0,1),swell=phase>=23&&phase<32?Math.sin(p*Math.PI)**2:0;
      const visibleBottom=Math.min(b.y+b.h-6,...shops.filter(s=>s.x<b.x+b.w&&s.x+s.width>b.x).map(s=>s.y-8));
      ctx!.save();
      const glow=ctx!.createLinearGradient(0,b.y,0,visibleBottom);glow.addColorStop(0,`rgba(255,201,112,${.015+swell*.09})`);glow.addColorStop(1,'rgba(255,201,112,0)');
      ctx!.fillStyle=glow;ctx!.fillRect(b.x,b.y,b.w,Math.max(0,visibleBottom-b.y));
      ctx!.globalAlpha=.15+swell*.62;
      rect(ctx!,b.x-1,b.y-4,b.w+2,1,'#ffe8b1');
      const columns=Math.max(3,Math.floor(b.w/12));
      for(let q=0;q<=columns;q++){const x=b.x+4+(b.w-12)*q/columns;rect(ctx!,x,b.y+7,1,Math.max(1,visibleBottom-b.y-9),'#ffe1a0');}
      if(swell>.01){ctx!.globalAlpha=swell*.38;rect(ctx!,b.x,b.y+3,b.w,1,'#fff0c7');if(b.y+b.h*.45<visibleBottom)rect(ctx!,b.x,b.y+b.h*.45,b.w,1,'#ffe7a9');}
      ctx!.restore();
    }
  }
  function drawCityDynamic(t: number, light: number) {
    drawHeritageLights(t);
    for(const b of buildings){
      const plane=b.plane;if(plane===0)continue;
      for(const win of b.windows){
        // Rooms are stable for seconds, then switch independently rather than flicker.
        const era=Math.floor((t+hash(win.seed+53)*20)/win.period),on=hash(win.seed+era*13.7)>(plane===0?.60:plane===1?.47:.40);
        if(!on) continue;
        let color=warmWindows[win.color];if(plane===0)color=win.color%3?'#54717d':'#a59979';if(plane===1)color=win.color%4===0?'#9cb3b7':win.color%3===0?'#b59773':'#887e7b';
        ctx!.globalAlpha=plane===0?.50:plane===1?.75:.91;rect(ctx!,win.x,win.y,win.w,win.h,color);
        if(plane===2){if(win.seed%5===0)rect(ctx!,win.x,win.y+2,win.w,1,'#50494b');if(win.seed%7===0)rect(ctx!,win.x+1,win.y+3,2,win.h-3,'#4b5050');if(win.seed%9===0)rect(ctx!,win.x,win.y,1,win.h,'#f8dcaa');}
      }
      ctx!.globalAlpha=1;
      if(b.antenna&&b.x<w*.70&&Math.sin(t*1.2+b.id)> .4){rect(ctx!,b.x+b.w*.37-1,b.y-26,3,2,'#db697b');rect(ctx!,b.x+b.w*.37,b.y-27,1,1,'#ffd1a7');}
      if(plane===2&&b.id%3===1){
        const glide=(t*2.2+b.id*37)%(b.h+35)-20;
        if(glide>3&&glide<b.h-46){ctx!.globalAlpha=.16;rect(ctx!,b.x+4,b.y+glide,b.w-9,1,'#9bb7d1');ctx!.globalAlpha=1;}
      }
    }
    drawNeonLight(t);
    // Neon breathes almost imperceptibly; the lettered DOM signs remain crisp.
    const neon=.08+(Math.sin(t*.7)+1)*.025;
    for(let i=0;i<shops.length;i++){const s=shops[i];ctx!.globalAlpha=neon;rect(ctx!,s.x-2,s.y-2,s.width+4,s.height+4,s.color);ctx!.globalAlpha=1;}
    // Broken, horizontal puddle reflections -- no blurry mirrored photographic wash.
    const floor=h-clamp(cssH*.0493,36,44)*scale;
    for(let i=0;i<135;i++){
      const shop=shops[i%shops.length],n=hash(i+63),yy=floor+3+hash(i+300)*(h-floor-5),xx=shop.x+hash(i+817)*shop.width;
      ctx!.globalAlpha=.10+(.5+.5*Math.sin(t*.8+i*1.72))*.15;
      rect(ctx!,xx+Math.sin(t*.5+i)*2,yy,2+n*13,1,shop.color);
    }
    ctx!.globalAlpha=1;
    // Rain is sparse enough to read the city, slanting in one quiet wind.
    for(let i=0;i<103;i++){
      const speed=26+hash(i+830)*36,yy=(hash(i+281)*h+t*speed)%h,xx=(hash(i+712)*w-t*speed*.13+w*100)%w;
      ctx!.globalAlpha=.1+hash(i+443)*.15;line(ctx!,xx,yy,xx-1,yy+3+hash(i+399)*4,'#adbdcf');
      if(yy>floor){rect(ctx!,xx-2,yy,4,1,'#afbac5');}
    }
    ctx!.globalAlpha=1;
    // Tiny warm wall sconces live below the skyline and respond to the moonlight.
    for(let i=0;i<shops.length;i++){const s=shops[i];ctx!.globalAlpha=.07+light*.035;rect(ctx!,s.x+2,s.y+s.height,Math.max(2,s.width-4),8,'#ffd895');}ctx!.globalAlpha=1;
  }
  function render() {
    if(!w||!h||disposed)return;
    const light=clamp(Number(options.getLight())||0,0,1),rawMoon=Number(options.getMoonX()),moon=clamp(rawMoon>1?rawMoon/cssW:rawMoon||.845,.05,.98);
    ctx!.imageSmoothingEnabled=false;ctx!.globalAlpha=1;ctx!.drawImage(sky,0,0);
    // A low-opacity pixel glow ties the external moon to the night without drawing another moon.
    if(light>.02){const gx=moon*w,gy=h*.245;ctx!.fillStyle=`rgba(110,169,193,${light*.025})`;for(let r=5;r>0;r--)steppedOval(ctx!,gx,gy,w*(.12+r*.035),h*(.13+r*.035),`rgba(110,169,193,${light*.005})`);}
    if(kind==='shanghai'){ctx!.drawImage(distant,0,0);landmarks?.paintLights(ctx!,time,reduced?.matches===true);ctx!.drawImage(scenery,0,0);drawCityDynamic(time,light);}else drawHarbor(ctx!,w,h,time,light,moon);
    // A few distant stars scintillate without moving their positions.
    for(let i=0;i<15;i++) { const x=hash(i+683)*w*.72,y=hash(i+483)*h*.35,a=.15+(Math.sin(time*.65+i)+1)*.13;ctx!.globalAlpha=a;rect(ctx!,x,y,1,1,'#e4d6ab'); }ctx!.globalAlpha=1;
    lastLight=light;lastMoon=moon;
    if(!ready){ready=true;options.onReady?.();}
  }
  function tick(now: number) {
    if(disposed)return;
    raf=requestAnimationFrame(tick);
    if(document.hidden){last=now;return;}
    const frameDelay=reduced?.matches?180:1000/24;
    if(now-last<frameDelay)return;
    const dt=last?Math.min(.15,(now-last)/1000):0;last=now;
    if(!reduced?.matches)time+=dt;
    // Reduced motion still accepts immediate moon-phase changes.
    const raw=options.getMoonX(),moon=raw>1?raw/cssW:raw;
    if(reduced?.matches&&lastLight===options.getLight()&&Math.abs(lastMoon-moon)<.0001)return;
    render();
  }
  function resize(width: number,height: number) {
    if(disposed||width<=0||height<=0)return;
    cssW=width;cssH=height;w=Math.min(960,Math.max(160,Math.round(width/2)));scale=w/width;h=Math.max(120,Math.round(height*scale));
    canvas.width=w;canvas.height=h;scenery.width=w;scenery.height=h;sky.width=w;sky.height=h;distant.width=w;distant.height=h;
    ctx!.imageSmoothingEnabled=false;drawSky();if(kind==='shanghai')buildCity();render();
  }
  const visibility=()=>{last=performance.now();if(!document.hidden)render();};
  document.addEventListener('visibilitychange',visibility);
  const motion=()=>{last=0;render();};reduced?.addEventListener?.('change',motion);
  resize(canvas.clientWidth||window.innerWidth,canvas.clientHeight||window.innerHeight);
  raf=requestAnimationFrame(tick);
  return { resize, dispose(){disposed=true;cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',visibility);reduced?.removeEventListener?.('change',motion);buildings=[];landmarks=null;} };
}
