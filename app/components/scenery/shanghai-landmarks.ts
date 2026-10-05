type Ctx=CanvasRenderingContext2D;
type RGB=readonly [number,number,number];
const TAU=Math.PI*2;
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
const ease=(p:number)=>{p=clamp(p);return p*p*(3-2*p)};
const mix=(a:RGB,b:RGB,p:number):RGB=>a.map((n,i)=>Math.round(n+(b[i]-n)*p)) as unknown as RGB;
const rgb=(a:RGB,alpha=1)=>`rgba(${a[0]},${a[1]},${a[2]},${alpha})`;
const palettes:readonly (readonly RGB[])[]=[
 [[75,162,255],[161,107,255],[127,231,255]],
 [[164,109,255],[252,120,188],[255,207,143]],
 [[56,204,228],[114,143,255],[174,255,232]],
 [[255,158,96],[239,113,185],[255,224,159]],
];
type Landmark='pearl'|'financial'|'tower'|'jin';
// Each building keeps its own colour family, clock and seeded palette order.
const buildingPalettes:Record<Landmark,readonly (readonly RGB[])[]>={
 pearl:[[[247,91,160],[197,105,245],[255,196,224]],[[220,86,220],[132,98,231],[255,178,206]],[[252,113,130],[243,93,174],[255,217,225]]],
 financial:[[[65,147,248],[89,188,255],[174,228,255]],[[91,116,247],[124,153,255],[188,216,255]],[[55,177,219],[78,127,225],[167,243,255]]],
 tower:[[[56,224,191],[73,167,207],[171,255,228]],[[57,206,218],[71,143,225],[191,252,247]],[[103,224,173],[58,175,191],[222,255,207]]],
 jin:[[[248,185,91],[214,133,81],[255,230,172]],[[234,157,96],[192,111,82],[255,217,153]],[[232,205,132],[191,160,96],[255,240,193]]],
};
export function landmarkPalette(id:Landmark,seconds:number,reduced=false){
 const index=['pearl','financial','tower','jin'].indexOf(id),period=[31,43,37,53][index],offset=[0,12,23,7][index];
 const t=(reduced?0:Math.max(0,seconds))+offset,era=Math.floor(t/period),blend=ease((t%period-(period-8))/8);
 const select=(n:number)=>((n*(index%2+1)+index)%3+3)%3;
 const a=buildingPalettes[id][select(era)],b=buildingPalettes[id][select(era+1)];
 return {primary:mix(a[0],b[0],blend),secondary:mix(a[1],b[1],blend),accent:mix(a[2],b[2],blend)};
}
/** A quiet 80-second programme. Brightness changes take seconds, never strobe frames. */
export function shanghaiLightCue(seconds:number,reduced=false){
 const t=reduced?0:Math.max(0,seconds),cycle=t%80,era=Math.floor(t/28),blend=ease((t%28-21)/7);
 const a=palettes[era%palettes.length],b=palettes[(era+1)%palettes.length];
 const sweep=cycle>=8&&cycle<18?{position:1-(cycle-8)/10,direction:-1}:cycle>=23&&cycle<33?{position:(cycle-23)/10,direction:1}:null;
 const welcome=cycle>=37&&cycle<54?ease((cycle-37)/1.3)*ease((54-cycle)/1.6):0;
 const beat=cycle>=61&&cycle<68?Math.pow(Math.sin((cycle-61)/7*Math.PI*2),2)*ease((cycle-61)/.8)*ease((68-cycle)/.8):0;
 return {primary:mix(a[0],b[0],blend),secondary:mix(a[1],b[1],blend),accent:mix(a[2],b[2],blend),sweep,welcome,rotation:-(cycle-37)*.8,pulse:beat};
}
export function createShanghaiLandmarks(w:number,h:number){
 // A tiny local CJK subset keeps the crown legible even on systems without Chinese fonts.
 void document.fonts?.load('700 10px CTYShanghaiLED','上海欢迎你').catch(()=>{});
 const base=h*.77,span=Math.min(h,w*1.24),Y=(f:number)=>base-(.77-f)*span;
 const pearl={x:w*.278,top:Y(.190),upper:Y(.411),lower:Y(.652),small:Y(.313),r:Math.max(4,Math.min(w*.020,span*.028))};
 const financial={x:w*.501,y:Y(.273),w:w*.041};
 const tower={x:w*.581,y:Y(.137),w:w*.041};
 const jin={x:w*.456,y:Y(.351),w:w*.031};
 const rect=(c:Ctx,x:number,y:number,rw:number,rh:number,color:string)=>{if(rw<=0||rh<=0)return;c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(rw)),Math.max(1,Math.round(rh)))};
 const line=(c:Ctx,x1:number,y1:number,x2:number,y2:number,color:string,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);c.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);c.stroke()};
 const poly=(c:Ctx,points:number[][],color:string)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill()};
 const oval=(c:Ctx,x:number,y:number,rx:number,ry:number,color:string)=>{c.fillStyle=color;for(let dy=-Math.ceil(ry);dy<=ry;dy++){const half=Math.sqrt(Math.max(0,1-dy*dy/(ry*ry)))*rx;c.fillRect(Math.round(x-half),Math.round(y+dy),Math.round(half*2),1)}};
 function halo(c:Ctx,x:number,y:number,rx:number,ry:number,color:RGB,strength:number){
  c.save();c.translate(x,y);c.scale(rx,ry);const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,rgb(color,strength));g.addColorStop(.38,rgb(color,strength*.38));g.addColorStop(1,rgb(color,0));c.fillStyle=g;c.fillRect(-1,-1,2,2);c.restore();
 }
 function towerRow(y:number){const p=clamp((y-tower.y)/(base-tower.y)),breadth=tower.w*(.57+p*.43),left=tower.x+(1-p)*tower.w*.15+Math.sin(p*4.4)*tower.w*.12;return {left,breadth,p}}
 function jinRow(y:number){const p=clamp((y-jin.y)/(base-jin.y)),breadth=jin.w*(p<.23?.28+Math.floor(p/.029)*.09:.97);return {left:jin.x-breadth/2,breadth,p}}
 function sphere(c:Ctx,cy:number,r:number){
  oval(c,pearl.x,cy,r+1,r*.83+1,'#283b62');oval(c,pearl.x,cy,r,r*.83,'#5d648a');
  for(let dy=-r*.75;dy<r*.8;dy+=2){const half=Math.sqrt(Math.max(0,1-dy*dy/(r*.83)**2))*r;rect(c,pearl.x-half,cy+dy,half*2,1,dy<0?'#bec4d5':'#797b9e');}
  for(let q=-2;q<=2;q++){const xx=pearl.x+q*r*.27;line(c,xx,cy-r*.7,xx,cy+r*.7,'#354d72');}
  rect(c,pearl.x-r-1,cy-1,r*2+2,2,'#cfbfdb');rect(c,pearl.x-r*.80,cy+r*.24,r*1.6,2,'#283e63');
  for(let q=0;q<7;q++)rect(c,pearl.x-r*.73+q*r*.24,cy+r*.24,1,1,'#dbeaf6');
 }
 function paintStatic(c:Ctx){
  const p=pearl,shaft=Math.max(3,p.r*.31),stemTop=p.small+3;
  // Three concrete shafts, cross braces and splayed supports, plus the small space capsule.
  for(const offset of [-1,0,1]){const x=p.x+offset*shaft*.83;rect(c,x,stemTop,Math.max(1,shaft*.55),base-stemTop,'#718da8');rect(c,x,stemTop,1,base-stemTop,'#b5c6d0');}
  for(let yy=p.upper+p.r+5;yy<p.lower-p.r;yy+=Math.max(9,span*.036)){
   line(c,p.x-shaft,yy,p.x+shaft,yy+7,'#b2bcd0');line(c,p.x+shaft,yy,p.x-shaft,yy+7,'#3c567d');rect(c,p.x-shaft,yy,shaft*2,1,'#cbd1df');
  }
  const legs=p.r*1.27;
  for(const side of [-1,1]){poly(c,[[p.x+side*shaft*.4,p.lower+p.r*.3],[p.x+side*legs,base],[p.x+side*(legs-4),base],[p.x-side*shaft*.15,p.lower+p.r*.3]],'#8299ad');line(c,p.x+side*shaft*.3,p.lower+p.r*.6,p.x+side*legs,base,'#b7c7d5');}
  rect(c,p.x-1,p.top,2,p.small-p.top,'#b6c9dd');rect(c,p.x-2,p.top+span*.041,4,2,'#d7d9e1');
  for(let yy=p.top+span*.052;yy<p.small-3;yy+=4)rect(c,p.x-1,yy,3,1,'#6f90bd');
  oval(c,p.x,p.small,p.r*.32,p.r*.26,'#b5bada');rect(c,p.x-p.r*.32,p.small,p.r*.64,1,'#e7def7');
  sphere(c,p.upper,p.r);sphere(c,p.lower,p.r*1.12);
  rect(c,p.x-p.r*.34,p.upper-p.r-5,p.r*.68,5,'#9db7c8');
  // Financial Center: glazed side, sloping crown and the complete trapezoid aperture.
  const f=financial,cap=Math.max(11,span*.072);
  poly(c,[[f.x,base],[f.x+2,f.y+cap*.44],[f.x+f.w-3,f.y],[f.x+f.w+2,base]],'#223c61');
  poly(c,[[f.x+f.w-3,f.y],[f.x+f.w+4,f.y+5],[f.x+f.w+7,base],[f.x+f.w+2,base]],'#172c4a');
  line(c,f.x+2,f.y+cap*.44,f.x,base,'#7498b4');line(c,f.x+f.w-3,f.y,f.x+f.w+2,base,'#8da8be');
  poly(c,[[f.x+5,f.y+cap*.51],[f.x+f.w-6,f.y+cap*.22],[f.x+f.w-5,f.y+cap*.93],[f.x+5,f.y+cap*.93]],'#101c33');
  line(c,f.x+5,f.y+cap*.93,f.x+f.w-5,f.y+cap*.93,'#b0c8d1');
  for(let yy=f.y+cap+3;yy<base;yy+=4){rect(c,f.x+2,yy,f.w-3,1,'#496080');for(let xx=f.x+4;xx<f.x+f.w-2;xx+=4)rect(c,xx,yy+1,1,1,'#b3b6c5');}
  // Shanghai Tower is slightly taller, with a curved crown and continuous twisting glass.
  for(let yy=tower.y;yy<base;yy++){
   const r=towerRow(yy);rect(c,r.left,yy,r.breadth,1,Math.floor(yy/4)%2?'#243c5b':'#304b69');
   rect(c,r.left,yy,1,1,'#8caec2');rect(c,r.left+r.breadth-1,yy,1,1,'#63849f');
   if(Math.round(yy)%4===0)for(let xx=r.left+3;xx<r.left+r.breadth-1;xx+=3)rect(c,xx,yy,1,1,'#a6b4c4');
   if(Math.round(yy)%3===0)rect(c,r.left+r.breadth*(.35+.22*Math.sin(r.p*8)),yy,1,1,'#b3c9d3');
  }
  const crown=towerRow(tower.y);oval(c,crown.left+crown.breadth/2,tower.y,crown.breadth/2,Math.max(2,span*.01),'#92adbd');
  rect(c,crown.left+crown.breadth*.67,tower.y-span*.02,1,span*.017,'#b2c6da');
  // Jin Mao: a stepped pagoda crown, structural ribs and rows of warm office windows.
  for(let yy=jin.y;yy<base;yy++){
   const r=jinRow(yy);rect(c,r.left,yy,r.breadth,1,'#3d4355');
   for(let col=0;col<5;col++){const xx=r.left+col*r.breadth/4;rect(c,xx,yy,1,1,col%2?'#a2a8b8':'#75889f');}
   if(Math.floor(yy-jin.y)%4===0)rect(c,r.left,yy,r.breadth,1,'#b8ad94');
  }
  for(let q=0;q<9;q++){const yy=jin.y+(base-jin.y)*.029*q,r=jinRow(yy+.5);rect(c,r.left-1,yy,r.breadth+2,1,'#d9cda9');}
  rect(c,jin.x,jin.y-span*.036,1,span*.036,'#c1cad6');
  for(let q=0;q<3;q++)rect(c,jin.x-2-q,jin.y-5+q*2,4+q*2,1,'#d7d4c5');
 }
 function paintLights(c:Ctx,seconds:number,reduced=false){
  const cue=shanghaiLightCue(seconds,reduced),p=pearl,pc=landmarkPalette('pearl',seconds,reduced),fc=landmarkPalette('financial',seconds,reduced),tc=landmarkPalette('tower',seconds,reduced),jc=landmarkPalette('jin',seconds,reduced);
  let {primary,secondary:second,accent}=pc;
  const glow=.20+cue.pulse*.14;
  c.save();
  // Small pools of light stay around real surfaces, with distant atmospheric bloom.
  halo(c,p.x,p.upper,p.r*3.7,p.r*3.6,primary,.23+cue.pulse*.11);
  halo(c,p.x,p.lower,p.r*4,p.r*3.7,second,.19+cue.pulse*.14);
  halo(c,tower.x+tower.w*.45,tower.y+span*.035,tower.w*2,span*.09,tc.primary,glow);
  halo(c,financial.x+financial.w*.5,financial.y+span*.03,financial.w*1.8,span*.065,fc.primary,glow*.8);
  halo(c,jin.x,jin.y+span*.02,jin.w*2,span*.07,jc.accent,glow*.7);
  const brightness=(y:number,top:number)=>{
   const rel=clamp((y-top)/(base-top)),wave=cue.sweep?Math.max(0,1-Math.abs(rel-cue.sweep.position)/.06):0;
   return {wave,a:.43+wave*.48+cue.pulse*.24};
  };
  const stroke=(x1:number,y1:number,x2:number,y2:number,color:RGB,a=.72)=>{
   line(c,x1,y1,x2,y2,rgb(color,a*.08),5);line(c,x1,y1,x2,y2,rgb(color,a*.17),3);line(c,x1,y1,x2,y2,rgb(color,a),1);
  };
  stroke(p.x,p.top,p.x,p.small,accent,.85);
  const shaft=Math.max(3,p.r*.31);
  for(const side of [-1,1])stroke(p.x+side*shaft,p.small+4,p.x+side*shaft,p.lower,primary,.68+cue.pulse*.25);
  for(let yy=p.upper+p.r+5;yy<p.lower-p.r;yy+=Math.max(9,span*.036)){
   const a=brightness(yy,p.top).a;stroke(p.x-shaft,yy,p.x+shaft,yy+7,accent,a);rect(c,p.x-shaft,yy,shaft*2,1,rgb(primary,.65));
  }
  for(const [cy,r,color] of [[p.upper,p.r,primary],[p.lower,p.r*1.12,second],[p.small,p.r*.32,accent]] as [number,number,RGB][]){
   for(let dy=-r*.8;dy<=r*.8;dy+=2){
    const half=Math.sqrt(Math.max(0,1-(dy/(r*.84))**2))*r,a=brightness(cy+dy,p.top).a;
    rect(c,p.x-half,cy+dy,half*2,1,rgb(color,a));
    for(let xx=-half+1;xx<half;xx+=3)rect(c,p.x+xx,cy+dy,1,1,rgb(accent,.76+cue.pulse*.2));
   }
   rect(c,p.x-r,cy-1,r*2,1,rgb(accent,.87));
   for(const side of [-1,1])rect(c,p.x+side*r*.73,cy-r*.45,1,r*.9,rgb(primary,.9));
  }
  for(const side of [-1,1])stroke(p.x+side*shaft,p.lower+p.r*.3,p.x+side*p.r*1.27,base,primary,.75);
  // Shared light-show sweeps, independent blue / jade / amber facade palettes.
  ({primary,secondary:second,accent}=fc);
  const f=financial,cap=Math.max(11,span*.072);
  stroke(f.x+2,f.y+cap*.44,f.x,base,primary,.66);stroke(f.x+f.w-3,f.y,f.x+f.w+2,base,second,.72);
  stroke(f.x+2,f.y+cap*.44,f.x+f.w-3,f.y,accent,.86);stroke(f.x+5,f.y+cap*.93,f.x+f.w-5,f.y+cap*.93,accent,.9);
  for(let yy=f.y+cap+3;yy<base;yy+=3){const k=brightness(yy,f.y);rect(c,f.x+3,yy,f.w-4,1,rgb(k.wave>.2?accent:primary,k.a));for(let xx=f.x+5;xx<f.x+f.w-2;xx+=4)rect(c,xx,yy+1,1,1,rgb(second,.34+cue.pulse*.35));}
  ({primary,secondary:second,accent}=tc);
  for(let yy=tower.y;yy<base;yy+=2){
   const r=towerRow(yy),k=brightness(yy,tower.y),color=k.wave>.2?accent:primary;
   rect(c,r.left,yy,r.breadth,1,rgb(color,k.a));
   for(let xx=r.left+2;xx<r.left+r.breadth-1;xx+=3)rect(c,xx,yy,1,1,rgb(second,.62+cue.pulse*.22));
   const twist=r.left+r.breadth*(.35+.22*Math.sin(r.p*8));rect(c,twist,yy,1,2,rgb(accent,.82));
   rect(c,r.left,yy,1,2,rgb(accent,.73));rect(c,r.left+r.breadth-1,yy,1,2,rgb(primary,.85));
  }
  ({primary,secondary:second,accent}=jc);
  for(let yy=jin.y;yy<base;yy+=3){const r=jinRow(yy),k=brightness(yy,jin.y);rect(c,r.left,yy,r.breadth,1,rgb(k.wave>.2?primary:accent,k.a*.78));for(let col=0;col<3;col++)rect(c,r.left+(col+.5)*r.breadth/3,yy,1,2,rgb(second,.5+cue.pulse*.25));}
  for(let q=0;q<9;q++){const yy=jin.y+(base-jin.y)*.029*q,r=jinRow(yy+.5);stroke(r.left-1,yy,r.left+r.breadth+1,yy,accent,.76+cue.pulse*.24);}
  stroke(jin.x,jin.y-span*.036,jin.x,jin.y,accent,.95);
  if(cue.welcome>0)paintWelcome(c,cue.rotation,cue.welcome,tc.accent);
  c.restore();
 }
 function paintWelcome(c:Ctx,rotation:number,alpha:number,color:RGB){
  const row=towerRow(tower.y+span*.035),cx=row.left+row.breadth/2,cy=tower.y+span*.037;
  // A cylindrical crown sign: letters narrow and disappear as they turn around its back.
  const fontSize=Math.max(6,Math.min(10,w*.0115)),radius=Math.max(row.breadth*.8,fontSize*2.5);
  halo(c,cx,cy,radius*1.7,fontSize*2.1,color,alpha*.18);
  c.save();c.font=`700 ${fontSize}px CTYShanghaiLED,'Microsoft YaHei','PingFang SC','Noto Sans CJK SC',sans-serif`;c.textAlign='center';c.textBaseline='middle';
  c.strokeStyle=rgb(color,alpha*.4);c.lineWidth=1;c.beginPath();c.ellipse(cx,cy+fontSize*.8,radius,3,0,0,TAU);c.stroke();
  const text='上海欢迎你',spacing=.48;
  const chars=Array.from(text).map((char,i)=>({char,a:rotation+(i-2)*spacing})).map(v=>({...v,front:Math.cos(v.a)})).filter(v=>v.front>0).sort((a,b)=>a.front-b.front);
  for(const letter of chars){c.save();c.translate(cx+Math.sin(letter.a)*radius,cy+(1-letter.front)*2);c.scale(Math.max(.18,letter.front),1);c.globalAlpha=alpha*(.25+.75*letter.front);c.shadowColor=rgb(color);c.shadowBlur=3;c.fillStyle='#fff0c9';c.fillText(letter.char,0,0);c.restore();}
  c.restore();
 }
 return {paintStatic,paintLights};
}
