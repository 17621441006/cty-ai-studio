/** Original Canvas2D choreography; optional third-party sprite sheets credited in assets/effects/new. */
import {CHARACTER} from './layout.mjs';
import {spriteSample} from './sprite-sampling.mjs';
// Pixel anchors inspected on the existing Xiaosi row 8, all eight frames.
const CRY_EYES=Array.from({length:8},()=>[[132,98],[143,95]]);
export function cryEyeAnchors(actor,ground=701,frame=null){
 const spec=CHARACTER[actor.kind]||CHARACTER.xiaosi;
 const f=frame??((actor.action?.t||actor.cryVisual?.t||0)*9)%7;
 const info=actor.renderInfo?.row===8?actor.renderInfo:null;
 const sample=info?.sample||spriteSample(actor.kind,{row:8,frame:f},spec);
 const eyes=CRY_EYES[Math.min(7,Math.max(0,Math.round(info?.frame??f)))],scale=(info?.h??spec.height)/320;
 return eyes.map(([x,y])=>({x:(info?.x??actor.x)+(info?.face??actor.face??1)*(x-sample.px)*scale,y:(info?.y??(ground-(actor.y||0)))+(y-sample.py)*scale}));
}
export function loveHit(event){return event.type==='hit'&&(event.skill==='love'||event.holdTick||event.source?.action?.skill==='love'||(event.actor?.heldBy&&event.actor.heldBy===event.source));}
const TAU=Math.PI*2, clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const rand=(a,b)=>a+Math.random()*(b-a), hash=n=>{let v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
export class ParticleVFX {
 constructor(){this.particles=[];this.effects=[];this.cache=new Map();this.ground=701;this.reduced=false;this.charScale=1;}
 reset(){this.particles.length=this.effects.length=0;}
 emit(event,actor,extra={}){
  let e=typeof event==='string'?{type:event,actor,...extra}:event;const a=e.actor;if(!a)return;
  const cs=this.charScale||1;
  // Love damage retains game bookkeeping, but must not spawn combat cuts/sparks.
  if(loveHit(e))return;
  if(e.type==='special'){
   const type=(e.skill==='launch'||e.skill==='gearlaunch')?'launcher':e.skill==='jumpscare'?'roar':e.skill==='toreador'?'charm':e.skill,live=this.effects.findLast(f=>f.type===type&&f.actorRef===a);
   if(e.phase!=='start'){
    if(live&&e.target){live.targetRef=e.target;if(type==='charm')live.life=Math.max(live.life,live.t+1.1);}
    if(type==='love'&&live){if(e.phase==='grab')live.grabbed=true;if(e.phase==='release')live.life=Math.min(live.life,live.t+.3);}
    if(type==='pounce'&&e.phase==='pulse'&&live)this.pounceLand(live,a);
    if(e.phase==='pulse'&&type==='roar')this.spray(a.x+a.face*95*cs,this.ground-a.y-110*cs,12,a.kind==='cat'?'#ffcf87':a.kind==='bear'?'#ff4d79':'#d4baff',a.face*380,0,115,.65);
    return;
   }
   e={...e,type};
  }
  if(e.type==='land'&&e.skill==='pounce'){const live=this.effects.findLast(f=>f.type==='pounce'&&f.actorRef===a);if(live)this.pounceLand(live,a);return;}
  const kind=(e.source||a).kind,cat=kind==='cat',bear=kind==='bear',color=cat?'#ffd470':bear?'#ffbe42':'#e6f0ff';
  const f={type:e.type,x:a.x,h:a.y||0,face:a.face||1,kind,cat,bear,color,t:0,seed:rand(1,999),chain:e.chain||0,life:1,pace:['ultimate','burst'].includes(e.type)?1/1.8:['love','cry','pounce','roar','charm','launcher','cast','charge','guardbreak','airescape'].includes(e.type)?1/1.35:1,fired:new Set(),actorRef:a,targetRef:e.target,airborne:!!e.airborne,range:e.range,impactFace:e.source?.face||a.face||1,damage:e.damage||0};
  if(['love','cry','pounce'].includes(e.type)){f.life=e.type==='love'?1.85:e.type==='cry'?2:3.2;this.effects.push(f);}
  else if(e.type==='airescape'){f.life=.85;this.effects.push(f);this.spray(f.x,this.ground-f.h-40*cs,36,'#ffffff',0,-260,240,.75);}
  else if(e.type==='block'||e.type==='guardbreak'){f.life=e.type==='block'?.3:.65;this.effects.push(f);this.spray(f.x+a.face*35*cs,this.ground-f.h-90*cs,e.type==='block'?14:35,'#bfe4ff',-f.impactFace*170,-90,190,.5);}
  else if(['roar','charm','launcher'].includes(e.type)){f.life=e.type==='roar'?1.4:e.type==='charm'?1.6:cat?.95:1.28;this.effects.push(f);}
  else if(e.type==='knockdown'){f.life=.7;this.effects.push(f);this.spray(f.x,this.ground-6,45,'#efc3a1',0,-180,380,.75);}
  else if(e.type==='burst'){f.life=2.45;this.effects.push(f);}
  else if(e.type==='ultimate'){f.life=.48;this.effects.push(f);}
  else if(e.type==='slash'||e.type==='cast'){f.life=e.type==='cast'?.75:.42;this.effects.push(f);this.spray(f.x+f.face*60*cs,this.ground-f.h-90*cs,24,color,f.face*300,-90,260,.6);}
  else if(e.type==='charge'){f.life=.35;this.effects.push(f);}
  else if(e.type==='hit'&&e.damage>0){this.spray(f.x,this.ground-f.h-90*cs,e.damage>=40?52:22,color,f.impactFace*(e.damage>=40?380:250),-100,260,.5);f.life=.23;this.effects.push(f);}
  else if(e.type==='dash')this.spray(f.x,this.ground-f.h-65*cs,20,color,-f.face*250,0,130,.4);
  else if(e.type==='land')this.spray(f.x,this.ground,12,'#b6a3bc',0,-50,130,.35);
  if(this.effects.length>24)this.effects.splice(0,this.effects.length-24);
 }
 spray(x,y,n,color,vx=0,vy=0,spread=300,life=.8){
  n=Math.round(n*(this.reduced?.35:1));const pace=this.emissionPace||1;life/=pace;vx*=pace;vy*=pace;spread*=pace;
  for(let i=0;i<n;i++){let ang=rand(0,TAU),s=rand(.2,1)*spread,l=rand(.4,1)*life;this.particles.push({x,y,px:x,py:y,vx:vx+Math.cos(ang)*s,vy:vy+Math.sin(ang)*s,t:0,life:l,color,w:rand(.8,3),drag:rand(.5,2),gravity:rand(130,400)*pace*pace});}
  if(this.particles.length>500)this.particles.splice(0,this.particles.length-500);
 }
 glow(c,x,y,w,h,color,alpha=1){
  if(!this.cache.has(color)){let b=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(128,128):document.createElement('canvas');b.width=b.height=128;let z=b.getContext('2d'),g=z.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,color);g.addColorStop(.18,color+'aa');g.addColorStop(.5,color+'35');g.addColorStop(1,color+'00');z.fillStyle=g;z.fillRect(0,0,128,128);this.cache.set(color,b);}
  c.globalAlpha=alpha;c.drawImage(this.cache.get(color),x-w/2,y-h/2,w,h);
 }
 tintSheet(img,color){
  if(!img||!img.width)return img;const key='sheet:'+img.src+color;if(this.cache.has(key))return this.cache.get(key);
  let b=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(img.width,img.height):document.createElement('canvas');b.width=img.width;b.height=img.height;let z=b.getContext('2d');z.drawImage(img,0,0);z.globalCompositeOperation='source-atop';z.globalAlpha=.6;z.fillStyle=color;z.fillRect(0,0,b.width,b.height);this.cache.set(key,b);return b;
 }
 sheet(c,img,t,duration,cols,rows,x,y,w,h,alpha=1){if(!img||!img.width)return;c.globalAlpha=alpha;let frame=Math.min(cols*rows-1,Math.floor(clamp(t/duration)*cols*rows)),sw=img.width/cols,sh=img.height/rows;c.drawImage(img,frame%cols*sw,Math.floor(frame/cols)*sh,sw,sh,x-w/2,y-h/2,w,h);}
 bolt(c,x1,y1,x2,y2,seed,time,color,width=2,alpha=1,branch=true){
  const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),steps=Math.max(5,Math.round(len/24)),phase=Math.floor(time*(this.reduced?5:19)),pts=[];
  for(let j=0;j<=steps;j++){let p=j/steps,o=(hash(seed+j*8+phase*23)-.5)*Math.sin(Math.PI*p)*40;pts.push([x1+dx*p-dy/(len||1)*o,y1+dy*p+dx/(len||1)*o]);}
  c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=width*4;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.globalAlpha=alpha*.2;c.stroke();c.globalAlpha=alpha;c.lineWidth=width;c.stroke();c.strokeStyle='#fff5ff';c.lineWidth=width*.35;c.stroke();
  if(branch&&len>100){for(let j=2;j<pts.length-1;j+=3){const p=pts[j],sign=j%2?1:-1;this.bolt(c,p[0],p[1],p[0]+dx*.13+sign*dy*.12,p[1]+dy*.13-sign*dx*.12,seed+j,time,color,width*.5,alpha*.65,false);}}
 }
 ring(c,x,y,rx,ry,color,alpha,width=2){c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);c.stroke();}
 draw(ctx,dt,{reduced=false,assets={},ground=701,charScale=1}={}){
  this.ground=ground;this.reduced=reduced;this.charScale=charScale||1;const cs=this.charScale;dt=clamp(Number(dt)||0,0,.05);ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  // Romantic beats own their participants' local visual space. Old root rain
  // must not enclose an embrace just because its cosmetic lifetime is longer.
  const romantic=new Set();
  for(const f of this.effects)if((f.type==='love'||f.type==='charm')&&f.t<f.life){romantic.add(f.actorRef);if(f.targetRef)romantic.add(f.targetRef);}
  for(const f of this.effects){f.t+=dt*(f.pace||1);this.emissionPace=f.pace||1;
   if(f.type==='cry'&&(romantic.has(f.actorRef)||romantic.has(f.targetRef))){f.life=0;continue;}
   if(f.type==='pounce'&&!f.landed&&(f.actorRef?.heldBy||f.actorRef?.charmed>0)){f.life=0;continue;}
   const t=f.t,q=clamp(1-t/f.life),x=f.x,y=ground-f.h-95*cs,face=f.face;
   if(f.type==='airescape'){this.airEscapeFx(ctx,f,assets);
   }else if(f.type==='cast'&&f.bear){this.bearCast(ctx,f);
   }else if(f.type==='charge'&&f.bear){this.bearCharge(ctx,f);
   }else if(f.type==='cast'&&!f.cat){this.moonCast(ctx,f);
   }else if(f.type==='charge'&&!f.cat){this.moonCharge(ctx,f);
   }else if(f.type==='burst'){ctx.save();ctx.translate(f.x,ground);ctx.scale(1.16,1.08);ctx.translate(-f.x,-ground);if(f.cat)this.volcano(ctx,f,assets);else if(f.bear)this.bearCurtainCall(ctx,f,assets);else this.moon(ctx,f,assets);ctx.restore();}
   else if(f.type==='ultimate'||f.type==='charge'){
    const p=clamp(t/f.life),r=(130*(1-p)+20)*cs;this.glow(ctx,x,y,180*p*cs,200*p*cs,f.color,.7);for(let i=0;i<12;i++){let a=i/12*TAU+t*5;this.glow(ctx,x+Math.cos(a)*r,y+Math.sin(a)*r,12,12,f.color,q);}
    for(let i=0;i<3;i++)this.ring(ctx,x,ground-3,r*(1+i*.2),r*.14,f.color,q*.6);
   }else if((f.type==='slash'||f.type==='cast')&&f.cat){this.claw(ctx,x+face*(f.type==='cast'?110+t*140:76)*cs,y,face,t/f.life,f.color,(f.type==='cast'?1.55:0.92+f.chain*.1)*cs);
   }else if(f.type==='roar'){this.roar(ctx,f,assets);
   }else if(f.type==='charm'){this.charm(ctx,f,assets);
   }else if(f.type==='launcher'){this.launcher(ctx,f,assets);
   }else if(f.type==='knockdown'){this.knockdown(ctx,f);
   }else if(f.type==='slash'||f.type==='cast'){
    const p=t/f.life,big=f.type==='cast',w=(big?420:220)*cs,h=(big?220:148)*cs;
    ctx.save();ctx.translate(x+face*(big?95+p*140:60)*cs,y);ctx.scale(face,1);ctx.rotate(-.28+p*.5);
    if(assets.slashSweep){this.sheet(ctx,assets.slashSweep,t,f.life,6,1,0,0,w,h,q);}
    for(let k=0;k<3;k++){ctx.globalAlpha=q*(.9-k*.2);ctx.strokeStyle=k===0?'#fff6dc':f.color;ctx.lineWidth=(big?11:7)-k*1.8;ctx.beginPath();ctx.ellipse(0,0,w*.48+k*7,h*.5+k*8,-.2,-1.45+p*.5,1.3+p*.5);ctx.stroke();}
    this.glow(ctx,26*cs,0,w*.8,h*.8,f.color,q*.28);ctx.restore();
   }else if(f.type==='love'){this.love(ctx,f);
   }else if(f.type==='cry'){this.cry(ctx,f);
   }else if(f.type==='pounce'){this.pounce(ctx,f);
   }else if(f.type==='block'){this.shield(ctx,f);
   }else if(f.type==='guardbreak'){this.shield(ctx,f,true);
   }else if(f.type==='hit'){this.impact(ctx,f);}
  }
  this.emissionPace=1;
  for(const p of this.particles){p.t+=dt;p.px=p.x;p.py=p.y;p.vx*=Math.exp(-p.drag*dt);p.vy+=p.gravity*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;let q=clamp(1-p.t/p.life),speed=Math.hypot(p.vx,p.vy),len=Math.min(42,5+speed*.035),nx=p.vx/(speed||1),ny=p.vy/(speed||1);ctx.globalAlpha=q;ctx.fillStyle=p.color;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-nx*len-ny*p.w*q,p.y-ny*len+nx*p.w*q);ctx.lineTo(p.x-nx*len+ny*p.w*q,p.y-ny*len-nx*p.w*q);ctx.closePath();ctx.fill();if(p.w>2.4)this.glow(ctx,p.x,p.y,13,13,p.color,q*.65);}
  this.particles=this.particles.filter(p=>p.t<p.life);this.effects=this.effects.filter(f=>f.t<f.life);ctx.restore();
 }
 // K moon blade: filled crescent + orbital satellites, never the J slash atlas
 // or U's stationary lightning globe. All geometry is purely cosmetic.
 crescent(c,x,y,r,angle,alpha=1){
  c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=alpha;
  c.fillStyle='#f5efff';c.shadowColor='#b496ff';c.shadowBlur=18;
  c.beginPath();c.moveTo(0,-r);c.bezierCurveTo(r*1.2,-r*.65,r*1.2,r*.65,0,r);c.bezierCurveTo(r*.42,r*.42,r*.42,-r*.42,0,-r);c.closePath();c.fill();
  c.shadowBlur=0;c.strokeStyle='#c8a5ff';c.lineWidth=2;c.stroke();c.restore();
 }
 moonCharge(c,f){
  const cs=this.charScale||1,p=clamp(f.t/f.life),a=f.actorRef,x=a?.x??f.x,y=this.ground-(a?.y??f.h)-95*cs;
  this.glow(c,x+f.face*45*cs,y,190*cs,190*cs,'#ae99ff',p*.4);
  for(let k=0;k<3;k++){const ang=k*TAU/3+f.t*4,r=(85*(1-p)+32)*cs;this.crescent(c,x+Math.cos(ang)*r,y+Math.sin(ang)*r*.75,(16+p*15)*cs,ang,p*.8);}
 }
 moonCast(c,f){
  const cs=this.charScale||1,p=clamp(f.t/f.life),fade=(1-p),x=f.x+f.face*65*cs,y=this.ground-f.h-85*cs;
  this.glow(c,x,y,320*cs,260*cs,'#b6a3ff',fade*.38);
  c.save();c.translate(x,y);c.scale(f.face,1);c.rotate(-.5);
  for(let k=0;k<2;k++){c.globalAlpha=fade*(.65-k*.2);c.strokeStyle=k?'#9eaeff':'#e5dcff';c.lineWidth=k?1.5:3;c.beginPath();c.ellipse(0,0,(80+p*110)*cs,(43+p*55)*cs,k*.7,p*2,p*2+Math.PI*1.5);c.stroke();}
  for(let k=0;k<4;k++){const ang=k*TAU/4+p*2;this.crescent(c,Math.cos(ang)*(65+p*70)*cs,Math.sin(ang)*(40+p*40)*cs,(10+fade*10)*cs,ang,fade*.75);}
  c.restore();
 }
 moonBladeProjectile(c,z,time,ground=701){
  const cs=this.charScale||1,face=z.vx>=0?1:-1,age=Math.max(0,2.5-z.life),r=(72+8*Math.sin(Math.min(1,age/.2)*Math.PI))*(0.78+0.22*cs),x=z.x,y=ground-(z.y-85+85*cs);
  c.save();c.globalCompositeOperation='lighter';c.translate(x,y);c.scale(face,1);
  this.glow(c,-15,0,220*cs,195*cs,'#a999ff',.45);
  for(let k=3;k>=1;k--)this.crescent(c,-k*26*cs,Math.sin(age*5-k)*4,r*(1-k*.07),-.15,.16*(1-k*.18));
  this.crescent(c,0,0,r,-.15,.95);
  for(let k=0;k<(this.reduced?3:6);k++){const ang=time*3+k*TAU/6,rr=r*(1.05+(k%2)*.18),xx=Math.cos(ang)*rr*.65-8,yy=Math.sin(ang)*rr;this.petal(c,xx,yy,4+k%2,ang,'#e7dbff',.75);}
  this.glow(c,r*.58,-5,35,70,'#f4efff',.65);c.restore();
 }
 pounceLand(f,a){if(f.landed)return;f.landed=true;f.landX=a.x;f.landT=f.t;f.life=f.t+.9;this.spray(a.x,this.ground-8,65,'#ffd09b',0,-200,460,.9);}
 love(c,f){
  const cs=this.charScale||1,a=f.actorRef,b=f.targetRef,x=a?.x??f.x,y=this.ground-(a?.y??f.h)-110*cs,tx=b?.x??x,ty=this.ground-(b?.y??f.h)-105*cs,t=f.t,fade=clamp((f.life-t)/.3),mx=(x+tx)/2,my=(y+ty)/2;
  for(let k=0;k<(this.reduced?7:15);k++){
   const p=(t*.36+k/15)%1,side=k%2?1:-1;
   const xx=mx+side*(10+p*(65+hash(f.seed+k)*55))*cs+Math.sin(t*1.7+k)*8;
   const yy=my+35*cs-p*(145+hash(f.seed+k*3)*60)*cs;
   this.heart(c,xx,yy,(6+Math.sin(p*Math.PI)*9)*cs,Math.sin(t+k)*.15,k%3?'#ffc0de':'#edc4ff',fade*Math.sin(p*Math.PI));
  }
 }
 tear(c,x,y,size,alpha){c.globalAlpha=alpha;c.fillStyle='#bceaff';c.beginPath();c.moveTo(x,y-size*1.8);c.bezierCurveTo(x-size,y-size*.1,x-size,y+size*.8,x,y+size);c.bezierCurveTo(x+size,y+size*.8,x+size,y-size*.1,x,y-size*1.8);c.fill();}
 cry(c,f){
  const cs=this.charScale||1,a=f.actorRef,b=f.targetRef,x=a?.x??f.x,y=this.ground-(a?.y??f.h)-120*cs,tx=b?.x??x+f.face*180,ty=this.ground-(b?.y??0),t=f.t,fade=clamp((f.life-t)/.4);
  this.glow(c,tx,ty-60*cs,340*cs,160*cs,'#a3cbff',fade*.3);
  if(a?.action?.skill==='cry'||a?.cryVisual){
   const eyes=cryEyeAnchors(a,this.ground),face=a.face||1;
   eyes.forEach((eye,index)=>{
    const side=(index===0?-1:1)*face,reach=(90+index*18)*cs,lift=36*cs,drop=120*cs;
    const point=p=>({x:eye.x+side*reach*p,y:eye.y-lift*4*p*(1-p)+drop*p*p});
    c.globalAlpha=fade*.72;c.strokeStyle='#9edfff';c.lineWidth=4.5*cs;c.beginPath();c.moveTo(eye.x,eye.y);
    for(let j=1;j<=28;j++){const p=point(j/28);c.lineTo(p.x,p.y)}c.stroke();
    c.globalAlpha=fade*.95;c.strokeStyle='#f0fcff';c.lineWidth=1.5*cs;c.stroke();
    for(let k=0;k<7;k++){const p=(t*1.05+k/7)%1,pos=point(p);this.tear(c,pos.x,pos.y,(2.7+2.1*p)*cs,fade*(1-p*.7));}
   });
  }
  for(let k=0;k<(this.reduced?12:30);k++){let p=(t*1.45+hash(f.seed+k))%1,xx=tx+(hash(k*19+f.seed)-.5)*260,yy=ty-250*cs+p*235*cs;c.globalAlpha=fade*.55;c.strokeStyle=k%3?'#aacfff':'#e2f6ff';c.lineWidth=1.2;c.beginPath();c.moveTo(xx,yy-14);c.lineTo(xx-5,yy);c.stroke();}
 }
 pounce(c,f){
  const cs=this.charScale||1,a=f.actorRef,x=f.landed?f.landX:(a?.x??f.x),h=f.landed?0:(a?.y??f.h),g=this.ground,y=g-h-90*cs,t=f.t;
  if(!f.landed){
   const q=clamp((f.life-t)/.2);this.glow(c,x,y,210*cs,150*cs,'#ffc17b',q*.24);return;
  }
  const age=t-f.landT,q=clamp(1-age/.85);this.glow(c,x,g-15,650,160,'#ffb578',q*.65);
  for(let side of [-1,1]){c.globalAlpha=q;c.fillStyle='#ffda9c';c.beginPath();c.moveTo(x,g);c.lineTo(x+side*(70+age*380),g-24*q);c.lineTo(x+side*(240+age*220),g+6);c.lineTo(x+side*70,g+15);c.closePath();c.fill();}
  for(let k=0;k<12;k++){let a=k/12*TAU,dist=50+age*(170+hash(f.seed+k)*160),xx=x+Math.cos(a)*dist,yy=g+Math.sin(a)*dist*.17-Math.sin(clamp(age/.85)*Math.PI)*45;c.save();c.translate(xx,yy);c.rotate(a+age*3);c.globalAlpha=q*.8;c.fillStyle=k%2?'#ddb099':'#8b6874';c.beginPath();c.moveTo(-8,-3);c.lineTo(-3,-13);c.lineTo(9,-6);c.lineTo(6,6);c.lineTo(-6,8);c.closePath();c.fill();c.restore();}
  for(let k=0;k<3;k++)this.ring(c,x,g,40+age*(270+k*110),7+age*(45+k*16),'#ffdaa3',q*(.7-k*.15),3-k*.6);
 }
 shield(c,f,broken=false){const cs=this.charScale||1,x=f.x+f.face*37*cs,y=this.ground-f.h-90*cs,t=f.t,q=clamp(1-t/f.life);if(!broken){this.glow(c,x,y,110*cs,180*cs,'#a1dfff',q*.4);c.globalAlpha=q;c.strokeStyle='#c2edff';c.lineWidth=4;c.beginPath();c.ellipse(x,y,(24+30*t)*cs,78*cs,0,-Math.PI*.65+(f.face<0?Math.PI:0),Math.PI*.65+(f.face<0?Math.PI:0));c.stroke();for(let k=0;k<3;k++){c.globalAlpha=q*.45;c.lineWidth=1;c.beginPath();c.ellipse(x-f.face*k*8*cs,y,22*cs,(65-k*7)*cs,0,-1.3+(f.face<0?Math.PI:0),1.3+(f.face<0?Math.PI:0));c.stroke();}}
  else{for(let k=0;k<12;k++){let a=k/12*TAU,r=(55+t*160)*cs,xx=f.x+Math.cos(a)*r,yy=y+Math.sin(a)*r+t*t*80;c.save();c.translate(xx,yy);c.rotate(a+t*3);c.globalAlpha=q*.7;c.fillStyle=k%2?'#b8dfff':'#ffe2ad';c.beginPath();c.moveTo(-11,-15);c.lineTo(12,-5);c.lineTo(4,14);c.lineTo(-7,4);c.closePath();c.fill();c.restore();}}}
 impact(c,f){const cs=this.charScale||1,x=f.x,y=this.ground-f.h-90*cs,t=f.t,q=clamp(1-t/f.life),dir=f.impactFace||f.face,strong=f.damage>=40;this.glow(c,x,y,(strong?190:105)*cs,(strong?135:95)*cs,'#fff0d5',q*.8);c.save();c.translate(x,y);c.scale(dir,1);
  for(let k=0;k<7;k++){const ang=(hash(f.seed+k)-.5)*1.25,len=(strong?220:130)*cs*(1+hash(k+f.seed))*(.3+t*2.5);c.save();c.rotate(ang);c.globalAlpha=q*(k?.7:1);c.fillStyle=k%2?f.color:'#fff2dc';c.beginPath();c.moveTo(-18*cs,0);c.lineTo(len,-(k?2:5)*q);c.lineTo(len+18*cs,0);c.lineTo(12*cs,(k?2:6)*q);c.closePath();c.fill();c.restore();}
  if(f.airborne){for(let k=0;k<3;k++){c.globalAlpha=q*.6;c.strokeStyle=f.color;c.lineWidth=2;c.beginPath();c.moveTo((k-1)*24*cs,-10*cs);c.lineTo((k-1)*24*cs-18*cs,(85+t*75)*cs);c.stroke();}}
  c.restore();
 }
 claw(c,x,y,face,p,color,scale=1){
  c.save();c.translate(x,y);c.scale(face*scale,scale);const fade=clamp(1-p),sweep=clamp(p*3);
  for(let k=0;k<3;k++){const dx=(k-1)*35,dy=(k-1)*9;c.globalAlpha=fade*.9;c.fillStyle=color;c.beginPath();c.moveTo(dx-62,-97);c.bezierCurveTo(dx+54,-58,dx+81,17,dx+51,95*sweep);c.bezierCurveTo(dx+46,25,dx+17,-34,dx-62,-97);c.fill();c.globalAlpha=fade;c.strokeStyle='#fff4cb';c.lineWidth=2.3;c.beginPath();c.moveTo(dx-56,-93);c.bezierCurveTo(dx+42,-53,dx+65,18,dx+51,92*sweep);c.stroke();}
  c.restore();
 }
 clockworkGear(c,x,y,r,teeth,rot,color,alpha,scaleY=1){
  c.save();c.translate(x,y);c.scale(1,scaleY);c.rotate(rot);c.globalAlpha=alpha;
  c.strokeStyle=color;c.fillStyle=color+'44';c.lineWidth=2.4;
  c.beginPath();
  for(let i=0;i<teeth*2;i++){
   const ang=(i/(teeth*2))*TAU,next=((i+0.65)/(teeth*2))*TAU;
   const rad=i%2===0?r*1.16:r*0.92;
   const px=Math.cos(ang)*rad,py=Math.sin(ang)*rad;
   i===0?c.moveTo(px,py):c.lineTo(px,py);
   c.lineTo(Math.cos(next)*rad,Math.sin(next)*rad);
  }
  c.closePath();c.fill();c.stroke();
  c.beginPath();c.arc(0,0,r*0.58,0,TAU);c.stroke();
  for(let k=0;k<6;k++){
   const a=k*TAU/6;
   c.beginPath();c.moveTo(Math.cos(a)*r*0.2,Math.sin(a)*r*0.2);c.lineTo(Math.cos(a)*r*0.88,Math.sin(a)*r*0.88);c.stroke();
  }
  c.fillStyle='#ffffff';c.beginPath();c.arc(0,0,r*0.18,0,TAU);c.fill();
  c.restore();
 }
 musicNote(c,x,y,size,rot,color,alpha,doubleNote=false){
  c.save();c.translate(x,y);c.rotate(rot);c.globalAlpha=alpha;
  c.fillStyle=color;c.strokeStyle=color;c.lineWidth=Math.max(1.8,size*0.22);
  c.beginPath();c.ellipse(-size*0.3,size*0.4,size*0.46,size*0.34,-0.35,0,TAU);c.fill();
  c.beginPath();c.moveTo(size*0.08,size*0.35);c.lineTo(size*0.08,-size*1.15);
  if(doubleNote){
   c.lineTo(size*1.05,-size*0.95);c.lineTo(size*1.05,size*0.55);c.stroke();
   c.beginPath();c.ellipse(size*0.68,size*0.6,size*0.46,size*0.34,-0.35,0,TAU);c.fill();
  }else{
   c.quadraticCurveTo(size*0.75,-size*0.85,size*0.58,-size*0.25);c.stroke();
  }
  c.restore();
 }
 airEscapeFx(c,f,assets){
  const cs=this.charScale||1,a=f.actorRef,x=a?.x??f.x,y=this.ground-(a?.y??f.h),t=f.t,q=clamp(1-t/f.life);
  this.glow(c,x,y-40*cs,260*cs,180*cs,'#ffffff',q*0.65);
  for(let k=0;k<3;k++){
   const rr=(45+k*26+t*155)*cs;
   this.ring(c,x,y,rr,rr*0.24,k===0?'#ffffff':f.color,q*(0.9-k*0.24),3.2-k*0.7);
  }
  for(let s=0;s<2;s++){
   c.save();c.globalAlpha=q*0.85;c.strokeStyle=s===0?'#ffffff':f.color;c.lineWidth=3*cs;
   c.beginPath();
   for(let j=0;j<=24;j++){
    const p=j/24,ang=p*TAU*1.4-t*12+s*Math.PI,rad=(52*(1-p*0.4))*cs;
    const xx=x+Math.cos(ang)*rad,yy=y+15*cs-p*135*cs;
    j?c.lineTo(xx,yy):c.moveTo(xx,yy);
   }
   c.stroke();c.restore();
  }
  if(assets.spark_01){
   const sz=(120+40*t)*cs;
   c.save();c.translate(x,y-20*cs);c.rotate(t*3);c.globalAlpha=q*0.8;
   c.drawImage(this.tintSheet(assets.spark_01,'#ffffff'),-sz/2,-sz/2,sz,sz);c.restore();
  }
 }
 bearCharge(c,f){
  const cs=this.charScale||1,p=clamp(f.t/f.life),a=f.actorRef,x=a?.x??f.x,y=this.ground-(a?.y??f.h)-95*cs;
  this.glow(c,x+f.face*52*cs,y,210*cs,210*cs,'#ffbe42',p*0.48);
  this.clockworkGear(c,x+f.face*48*cs,y,(52*(1-p*0.45))*cs,8,f.t*6,'#ffd86b',p*0.85);
  for(let k=0;k<4;k++){
   const ang=k*TAU/4-f.t*5,r=(88*(1-p)+28)*cs;
   this.musicNote(c,x+f.face*48*cs+Math.cos(ang)*r,y+Math.sin(ang)*r*0.75,11*cs,Math.sin(f.t*4+k)*0.2,k%2?'#ffdf78':'#d58aff',p*0.9,k%2===0);
  }
 }
 bearCast(c,f){
  const cs=this.charScale||1,p=clamp(f.t/f.life),fade=1-p,x=f.x+f.face*68*cs,y=this.ground-f.h-90*cs;
  this.glow(c,x,y,330*cs,260*cs,'#ffbe42',fade*0.45);
  this.clockworkGear(c,x,y,(38+p*85)*cs,10,f.t*8,'#ffe07d',fade*0.82);
  for(let k=0;k<3;k++){
   this.ring(c,x+f.face*k*22*cs,y,(30+p*95)*cs,(55+p*115)*cs,k===0?'#ffffff':k===1?'#ffcb52':'#c86bff',fade*(0.85-k*0.22),3.5-k*0.8);
  }
 }
 bearSonicProjectile(c,z,time,ground=701){
  const cs=this.charScale||1,face=z.vx>=0?1:-1,age=Math.max(0,2.5-z.life),r=(48+6*Math.sin(time*14))*(0.8+0.2*cs),x=z.x,y=ground-(z.y-85+85*cs);
  c.save();c.globalCompositeOperation='lighter';c.translate(x,y);c.scale(face,1);
  this.glow(c,-12,0,250*cs,210*cs,'#ffbe42',0.52);
  this.glow(c,8,0,160*cs,160*cs,'#c86bff',0.45);
  // Musical 5-line golden staff wave trail behind the sonic orb
  for(let line=-2;line<=2;line++){
   c.globalAlpha=0.58-Math.abs(line)*0.08;
   c.strokeStyle=line%2===0?'#ffe285':'#d88cff';
   c.lineWidth=1.8*cs;
   c.beginPath();
   for(let j=0;j<=18;j++){
    const u=j/18,tx=-u*175*cs,ty=line*9*cs+Math.sin(time*18-u*7+line)*8*cs*(1-u*0.4);
    j?c.lineTo(tx,ty):c.moveTo(tx,ty);
   }
   c.stroke();
  }
  // Spinning golden clockwork gear core + concentric sonic rings
  this.clockworkGear(c,0,0,r*0.82,10,time*9,'#ffe485',0.95);
  this.clockworkGear(c,0,0,r*0.48,6,-time*12,'#e2a4ff',0.9);
  for(let k=0;k<3;k++){
   const pulse=((time*3.2+k/3)%1);
   c.globalAlpha=(1-pulse)*0.85;
   c.strokeStyle=k%2?'#ffcf5c':'#ffffff';
   c.lineWidth=(3.2-pulse*2)*cs;
   c.beginPath();c.ellipse(12*cs,0,(18+pulse*42)*cs,(36+pulse*68)*cs,0,-1.25,1.25);c.stroke();
  }
  for(let k=0;k<(this.reduced?3:5);k++){
   const ang=time*4.5+k*TAU/5,nx=Math.cos(ang)*r*0.95-18*cs,ny=Math.sin(ang)*r*0.85;
   this.musicNote(c,nx,ny,10*cs,Math.sin(time*6+k)*0.25,k%2?'#fff099':'#e09eff',0.9,k%2===0);
  }
  c.restore();
 }
 heart(c,x,y,size,rotation,color,alpha){c.save();c.translate(x,y);c.rotate(rotation);c.scale(size,size);c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();c.moveTo(0,.9);c.bezierCurveTo(-.4,.5,-1,-.05,-1,-.5);c.bezierCurveTo(-1,-1.15,-.2,-1.25,0,-.65);c.bezierCurveTo(.2,-1.25,1,-1.15,1,-.5);c.bezierCurveTo(1,-.05,.4,.5,0,.9);c.fill();c.restore();}
 petal(c,x,y,size,rotation,color,alpha){c.save();c.translate(x,y);c.rotate(rotation);c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();c.moveTo(-size,0);c.bezierCurveTo(-size*.3,-size,size*.8,-size*.6,size,0);c.bezierCurveTo(size*.3,size*.8,-size*.6,size*.5,-size,0);c.fill();c.restore();}
 roar(c,f,assets){
  const cs=this.charScale||1,a=f.actorRef,x=a?.x??f.x,y=this.ground-(a?.y??f.h)-110*cs,face=f.face,t=f.t,fade=clamp((f.life-t)/.28),color=f.color;
  if(f.bear){
   // FREDDY FAZBEAR '午夜咆哮' (JUMPSCARE SONIC ROAR)
   this.glow(c,x+face*115*cs,y,360*cs,240*cs,'#ff2e63',fade*0.42);
   this.glow(c,x+face*70*cs,y,240*cs,190*cs,'#ffbe42',fade*0.48);
   c.save();c.translate(x+face*55*cs,y);c.scale(face,1);
   const cone=c.createLinearGradient(0,0,360*cs,0);
   cone.addColorStop(0,'rgba(255, 46, 99, 0)');
   cone.addColorStop(0.22,'rgba(255, 65, 110, 0.34)');
   cone.addColorStop(0.65,'rgba(195, 95, 255, 0.24)');
   cone.addColorStop(1,'rgba(255, 190, 66, 0)');
   c.globalAlpha=fade;c.fillStyle=cone;
   c.beginPath();c.moveTo(0,-24*cs);c.lineTo(355*cs,-138*cs);c.quadraticCurveTo(405*cs,0,355*cs,138*cs);c.lineTo(0,24*cs);c.closePath();c.fill();
   // High-frequency crimson & gold acoustic shockwave rings + jagged soundwaves
   for(let k=0;k<8;k++){
    const u=(t*2.2+k/8)%1,d=(42+u*315)*(0.82+0.18*cs),h=(34+u*132)*cs,alpha=fade*(1-u)*0.9;
    c.globalAlpha=alpha;
    c.strokeStyle=k%3===0?'#ff4778':k%3===1?'#ffdf78':'#d282ff';
    c.lineWidth=(3.2+4.5*(1-u))*cs;
    c.beginPath();c.ellipse(d,0,(24+u*54)*cs,h,0,-1.32,1.32);c.stroke();
   }
   // Phantom Animatronic Bear Jaws & Glowing Eyes lunging through the sonic cone!
   const jawP=(t*1.9)%1,jawX=(75+jawP*235)*cs,jawAlpha=fade*Math.sin(jawP*Math.PI)*0.88;
   const jawOpen=(28+38*Math.sin(jawP*Math.PI))*cs;
   c.globalAlpha=jawAlpha;c.strokeStyle='#ffe485';c.fillStyle='rgba(255, 56, 100, 0.35)';c.lineWidth=3*cs;
   // Upper & lower animatronic fangs
   for(let sign of[-1,1]){
    c.beginPath();
    c.moveTo(jawX-35*cs,sign*jawOpen);
    for(let tooth=0;tooth<5;tooth++){
     const tx=jawX-28*cs+tooth*14*cs;
     c.lineTo(tx+7*cs,sign*(jawOpen-18*cs));
     c.lineTo(tx+14*cs,sign*jawOpen);
    }
    c.stroke();
   }
   // Twin glowing animatronic eyes in the roar
   this.glow(c,jawX-12*cs,-jawOpen-18*cs,34*cs,34*cs,'#ff2a55',jawAlpha);
   this.glow(c,jawX+16*cs,-jawOpen-18*cs,34*cs,34*cs,'#ffdd66',jawAlpha);
   for(let k=0;k<5;k++){
    const u=(t*1.5+k/5)%1;
    this.musicNote(c,(55+u*280)*cs,Math.sin(t*7+k)*68*cs,11*cs,u*4,k%2?'#ffe27a':'#ff5c8a',fade*(1-u),k%2===0);
   }
   c.restore();
   if(assets.Effect36)this.sheet(c,this.tintSheet(assets.Effect36,'#ff5e8e'),(t%.75),.75,4,4,x+face*165*cs,y,250*cs,250*cs,fade*0.7);
   for(let b=0;b<2;b++){
    this.bolt(c,x+face*45*cs,y+(b?18:-18)*cs,x+face*330*cs,y+Math.sin(t*9+b)*75*cs,f.seed+b*13,t,b?'#ffdf78':'#ff4778',2.0,fade*0.8,false);
   }
   const tick=Math.floor(t*12);if(!f.fired.has(tick)){f.fired.add(tick);this.spray(x+face*95*cs,y,6,'#ffbe42',face*460,0,75,.58);}
   return;
  }
  this.glow(c,x+face*80*cs,y,200*cs,170*cs,color,fade*.22);
  c.save();c.translate(x+face*55*cs,y);c.scale(face,1);
  for(let k=0;k<7;k++){const u=(t*1.8+k/7)%1,d=(45+u*300)*(0.82+0.18*cs),h=(30+u*120)*cs,alpha=fade*(1-u)*.75;c.globalAlpha=alpha;c.strokeStyle=f.cat?'#ffe0a2':'#e6d4ff';c.lineWidth=2+4*(1-u);c.beginPath();c.ellipse(d,0,(20+u*50)*cs,h,0,-1.27,1.27);c.stroke();
   if(!f.cat){c.globalAlpha=alpha*.6;c.lineWidth=2;c.beginPath();c.moveTo(8,-18*cs);c.bezierCurveTo(d*.4,-h-20*cs,d*.6,h+20*cs,d,h*.8*Math.sin(t*4+k));c.stroke();}}
  const cone=c.createLinearGradient(0,0,340,0);cone.addColorStop(0,color+'00');cone.addColorStop(.25,color+'28');cone.addColorStop(1,color+'00');c.globalAlpha=fade;c.fillStyle=cone;c.beginPath();c.moveTo(0,-20*cs);c.lineTo(340,-125*cs);c.quadraticCurveTo(385,0,340,125*cs);c.lineTo(0,20*cs);c.closePath();c.fill();
  if(f.cat){for(let k=0;k<2;k++){let p=(t*1.6+k*.5)%1;this.claw(c,85+p*220,0,1,p,'#ffd990',(.7+p*.3)*cs);}}
  else{for(let k=0;k<5;k++){let p=(t*.8+k*.2)%1;this.petal(c,50+p*285,Math.sin(t*4+k)*70*cs,8,p*7,'#e2caff',fade*(1-p));}}
  c.restore();
  const tick=Math.floor(t*10);if(!f.fired.has(tick)){f.fired.add(tick);this.spray(x+face*90*cs,y,4,color,face*420,0,60,.55);}
 }
 charm(c,f,assets={}){
  const cs=this.charScale||1,a=f.actorRef,x=a?.x??f.x,y=this.ground-(a?.y??f.h)-(f.cat?50:95)*cs,target=f.targetRef,tx=target?.x??f.tx??(x+f.face*(f.range||250)),ty=this.ground-(target?.y??0)-110*cs,t=f.t,fade=clamp((f.life-t)/.4);
  if(f.bear){
   // FREDDY FAZBEAR '八音盒舞' (TOREADOR MUSIC BOX DANCE)
   const g=this.ground;
   this.glow(c,x,y,260*cs,190*cs,'#ffbe42',fade*0.38);
   this.glow(c,tx,ty,260*cs,210*cs,'#c86bff',fade*0.42);
   // Ground Golden Clockwork Music Box Array under both Freddy and Target
   this.clockworkGear(c,x,g,(95+12*Math.sin(t*4))*cs,12,t*2.4,'#ffd86b',fade*0.75,0.24);
   this.clockworkGear(c,tx,g,(105+15*Math.cos(t*4))*cs,12,-t*2.8,'#d488ff',fade*0.82,0.24);
   if(assets.magic_03){
    c.save();c.translate(tx,g);c.scale(1,0.24);c.rotate(t*2.2);c.globalAlpha=fade*0.75;
    const sz=210*cs;
    c.drawImage(this.tintSheet(assets.magic_03,'#ffe285'),-sz/2,-sz/2,sz,sz);c.restore();
   }
   // Arcing stream of Toreador musical notes & golden gears
   for(let k=0;k<14;k++){
    const p=(t*0.78+k/14)%1,hump=Math.sin(p*Math.PI);
    const xx=x+(tx-x)*p,yy=y+(ty-y)*p-hump*(55+hash(f.seed+k)*85)*cs+Math.sin(t*5+k)*10;
    const alpha=fade*Math.sin(p*Math.PI)*0.95;
    const col=k%3===0?'#ffe482':k%3===1?'#d98bff':'#ff6b9d';
    if(k%3===0)this.clockworkGear(c,xx,yy,13*cs,8,t*5+k,col,alpha);
    else this.musicNote(c,xx,yy,(10+hash(f.seed+k)*5)*cs,Math.sin(t*4+k)*0.3,col,alpha,k%2===0);
   }
   // Revolving Music Box Cage around the target
   for(let k=0;k<6;k++){
    const ang=t*2.8+k*TAU/6,rx=tx+Math.cos(ang)*68*cs,ry=ty+Math.sin(ang)*24*cs;
    this.musicNote(c,rx,ry,11*cs,Math.sin(t*3+k)*0.2,k%2?'#ffe68a':'#dfa0ff',fade*0.88,k%2===0);
   }
   return;
  }
  this.glow(c,x,y,220*cs,150*cs,f.cat?'#ff9fba':'#d6abff',fade*.23);
  for(let k=0;k<13;k++){let p=(t*.65+k/13)%1,hump=Math.sin(p*Math.PI),xx=x+(tx-x)*p,yy=y+(ty-y)*p-hump*(50+hash(f.seed+k)*90)*cs+Math.sin(t*3+k)*9,alpha=fade*Math.sin(p*Math.PI),size=(9+hash(f.seed+k*2)*9)*(0.8+0.2*cs);
   if(f.cat)this.heart(c,xx,yy,size,Math.sin(t*2+k)*.25,k%2?'#ffc4d7':'#ff91b8',alpha);
   else{this.petal(c,xx,yy,size,t*2+k,'#e9caff',alpha);this.petal(c,xx+10,yy-9,size*.7,-t*2+k,'#fff2ff',alpha*.6);}}
  for(let k=0;k<5;k++){const ang=t*1.5+k*TAU/5,xx=tx+Math.cos(ang)*57*cs,yy=ty-50*cs+Math.sin(ang)*20*cs;if(f.cat)this.heart(c,xx,yy,8*cs,ang*.1,'#ffd0dd',fade*.6);else{for(let j=0;j<5;j++)this.petal(c,xx+Math.cos(j*TAU/5)*6,yy+Math.sin(j*TAU/5)*6,6*cs,j*TAU/5,'#e7ceff',fade*.65);}}
 }
 lotusPetal3D(c,x,y,len,wid,tiltX,openY,alpha,isInner=false){
  c.save();
  c.translate(x,y);
  c.rotate(tiltX);
  c.scale(1,openY);
  c.globalAlpha=alpha;
  const g=c.createLinearGradient(0,0,0,-len);
  if(isInner){
   g.addColorStop(0,'rgba(210, 232, 255, 0.92)');
   g.addColorStop(0.55,'rgba(242, 249, 255, 0.88)');
   g.addColorStop(1,'#ffffff');
  }else{
   g.addColorStop(0,'rgba(165, 198, 255, 0.45)');
   g.addColorStop(0.5,'rgba(225, 240, 255, 0.72)');
   g.addColorStop(0.88,'rgba(248, 252, 255, 0.95)');
   g.addColorStop(1,'#ffffff');
  }
  c.fillStyle=g;
  c.beginPath();
  c.moveTo(0,0);
  c.bezierCurveTo(-wid*0.95,-len*0.26,-wid*1.08,-len*0.72,0,-len);
  c.bezierCurveTo(wid*1.08,-len*0.72,wid*0.95,-len*0.26,0,0);
  c.closePath();
  c.fill();
  c.strokeStyle='#ffffff';
  c.lineWidth=isInner?1.9:1.4;
  c.stroke();
  c.globalAlpha=alpha*0.65;
  c.beginPath();
  c.moveTo(0,-len*0.1);
  c.lineTo(0,-len*0.88);
  c.stroke();
  c.restore();
 }
 lotusBloom3D(c,cx,cy,radius,bloom,t,fade,pass='all'){
  const tiers=[
   {count:10,rMul:1.08,len:radius*0.92,wid:radius*0.29,rot:t*1.35,open:0.42+bloom*0.42,inner:false},
   {count:8,rMul:0.78,len:radius*0.82,wid:radius*0.25,rot:-t*1.65+0.4,open:0.55+bloom*0.35,inner:false},
   {count:6,rMul:0.48,len:radius*0.68,wid:radius*0.21,rot:t*2.1+0.9,open:0.72+bloom*0.24,inner:true}
  ];
  for(const tier of tiers){
   for(let i=0;i<tier.count;i++){
    const ang=(i/tier.count)*TAU+tier.rot;
    const depth=Math.sin(ang);
    if(pass==='back'&&depth>=0)continue;
    if(pass==='front'&&depth<0)continue;
    const px=cx+Math.cos(ang)*radius*tier.rMul*(0.35+0.65*bloom);
    const py=cy+depth*radius*0.22*tier.rMul;
    const tilt=Math.cos(ang)*(0.38+0.48*bloom)*(tier.inner?0.62:1);
    const openY=tier.open*(0.78+0.22*Math.abs(depth));
    const pAlpha=fade*(depth<0?0.52:0.92);
    this.lotusPetal3D(c,px,py,tier.len*(0.55+0.45*bloom),tier.wid,tilt,openY,pAlpha,tier.inner);
   }
  }
 }
 launcher(c,f,assets){
  const cs=this.charScale||1,t=f.t,g=this.ground-f.h,x=f.x+f.face*85*cs,fade=clamp((f.life-t)/.42);
  const rise=1-Math.pow(1-clamp(t/.28),3);
  const height=380*(0.82+0.18*cs)*rise,color=f.color;
  if(f.cat){
   this.glow(c,x,g-height*.5,240,height+80,color,fade*.33);this.ring(c,x,g,110,20,color,fade*.8,3);
   for(let k=0;k<3;k++){c.globalAlpha=fade*(.8-k*.15);c.strokeStyle=k===0?'#fff0c5':color;c.lineWidth=5-k;c.beginPath();for(let j=0;j<=45;j++){let p=j/45,ang=p*TAU*1.6-t*13+k*TAU/3,xx=x+Math.cos(ang)*(90-p*50)*cs,yy=g-p*height;j?c.lineTo(xx,yy):c.moveTo(xx,yy)}c.stroke();}
   this.claw(c,x,g-height*.65,f.face,clamp(t/f.life),color,1.2*cs);
   this.sheet(c,assets.Fire01,t,.75,8,4,x,g-height*.45,170*cs,height,fade*.65);
   if(!f.fired.has(1)&&t>.12){f.fired.add(1);this.spray(x,g-45,55,color,0,-540,190,.9);}
   return;
  }
  if(f.bear){
   // =========================================================================
   // FREDDY BEAR '发条升龙' (CLOCKWORK OVERDRIVE GEYSER)
   // =========================================================================
   const bloom=1-Math.pow(1-clamp(t/.28),3);
   const baseR=(115+26*bloom)*cs;
   this.glow(c,x,g-height*0.48,340*cs,height+140,'#b56eff',fade*0.52);
   this.glow(c,x,g-8,360*cs,95*cs,'#ffd363',fade*0.68);
   // 3 Interlocking 3D Golden/Purple Clockwork Gears on Ground
   c.save();
   c.translate(x,g);
   c.scale(1,0.28);
   this.clockworkGear(c,0,0,baseR*1.12,14,t*3.8,'#ffd363',fade*0.92);
   this.clockworkGear(c,-baseR*0.92,18*cs,baseR*0.58,10,-t*5.4,'#c27dff',fade*0.82);
   this.clockworkGear(c,baseR*0.92,-16*cs,baseR*0.58,10,-t*5.4,'#ff6e9c',fade*0.82);
   c.restore();
   // Central Overdrive Lightning & Clockwork Energy Column
   c.save();
   const colW=64*cs*(0.65+0.35*bloom);
   const colGrad=c.createLinearGradient(x,g,x,g-height-35);
   colGrad.addColorStop(0,'rgba(255, 224, 120, 0.96)');
   colGrad.addColorStop(0.35,'rgba(198, 120, 255, 0.82)');
   colGrad.addColorStop(0.75,'rgba(255, 90, 145, 0.48)');
   colGrad.addColorStop(1,'rgba(255, 224, 120, 0)');
   c.fillStyle=colGrad;
   c.globalAlpha=fade*0.92;
   c.beginPath();
   c.moveTo(x-colW,g);
   c.lineTo(x-colW*0.32,g-height);
   c.lineTo(x,g-height-38*cs);
   c.lineTo(x+colW*0.32,g-height);
   c.lineTo(x+colW,g);
   c.closePath();
   c.fill();
   c.restore();
   if(assets.Effect51){
    this.sheet(c,this.tintSheet(assets.Effect51,'#ffd363'),t,.92,4,4,x,g-height*0.55,275*cs,300*cs,fade*0.88);
   }
   if(assets.Fire01){
    this.sheet(c,this.tintSheet(assets.Fire01,'#c77dff'),t,.95,8,4,x,g-height*0.42,180*cs,height*1.08,fade*0.75);
   }
   for(let b=0;b<3;b++){
    const bx=x+(b-1)*24*cs;
    this.bolt(c,bx,g-8,bx+(hash(f.seed+b)-.5)*36*cs,g-height,f.seed+b*13,t,b===1?'#ffe48a':'#d58cff',2.2,fade*0.88,false);
   }
   // Ascending Spiral of Gears & Music Notes
   for(let k=0;k<7;k++){
    const p=(t*1.3+k/7)%1;
    const ang=p*TAU*1.9-t*8+k;
    const rad=baseR*0.82*(1-p*0.48);
    const gx=x+Math.cos(ang)*rad,gy=g-p*height*1.02;
    if(k%2===0){
     this.clockworkGear(c,gx,gy,(15+10*(1-p))*cs,8,t*6+k,'#ffd86b',fade*Math.sin(p*Math.PI)*0.92);
    }else{
     this.musicNote(c,gx,gy,(12+6*(1-p))*cs,Math.sin(t*5+k)*0.2,'#e0aaff',fade*Math.sin(p*Math.PI)*0.92,k%3===1);
    }
   }
   // Aerial Clockwork Gear Platform beneath Freddy's feet
   const actor=f.actorRef;
   if(actor&&actor.y>12){
    const ax=actor.x,ay=this.ground-actor.y+6*cs;
    this.glow(c,ax,ay,135*cs,46*cs,'#ffd363',fade*0.72);
    c.save();
    c.translate(ax,ay);
    c.scale(1,0.32);
    this.clockworkGear(c,0,0,54*cs,10,-t*6,'#ffd363',fade*0.92);
    c.restore();
   }
   if(!f.fired.has(1)&&t>.05){
    f.fired.add(1);
    this.spray(x,g-35,45,'#ffd363',0,-560,210,.95);
    this.spray(x,g-85,35,'#c77dff',0,-440,240,.88);
   }
   return;
  }
  // =========================================================================
  // XIAOSI '踏月升莲' (MOON-STEPPING BLOOMING SILVER LOTUS)
  // =========================================================================
  const bloom=1-Math.pow(1-clamp(t/.34),3);
  const baseR=(118+28*bloom)*cs;

  // 1. Radiant Silver-White & Moonlight-Blue Ambient Column Glow
  this.glow(c,x,g-height*0.48,340*cs,height+140,'#d8ebff',fade*0.46);
  this.glow(c,x,g-8,360*cs,95*cs,'#ffffff',fade*0.62);

  // 2. Ground Sacred Moon-Lotus Magic Array (rotating perspective seals)
  if(assets.magic_03||assets.circle_01){
   c.save();
   c.translate(x,g);
   c.scale(1,0.25);
   const sealR=baseR*2.35;
   if(assets.circle_01){
    c.save();
    c.rotate(-t*1.8);
    c.globalAlpha=fade*0.65;
    const im1=this.tintSheet(assets.circle_01,'#dcecff');
    c.drawImage(im1,-sealR,-sealR,sealR*2,sealR*2);
    c.restore();
   }
   if(assets.magic_03){
    c.save();
    c.rotate(t*2.4);
    c.globalAlpha=fade*0.88;
    const im2=this.tintSheet(assets.magic_03,'#ffffff');
    c.drawImage(im2,-sealR*0.86,-sealR*0.86,sealR*1.72,sealR*1.72);
    c.restore();
   }
   c.restore();
  }
  for(let k=0;k<3;k++){
   const rr=baseR*(0.85+k*0.36+t*0.55);
   this.ring(c,x,g,rr,rr*0.21,k===0?'#ffffff':k===1?'#d8ecff':'#b8d2ff',fade*(0.85-k*0.22),3.2-k*0.7);
  }

  // 3. Back Half of the 3D Blooming Giant Crystal Moon Lotus (behind the pillar)
  this.lotusBloom3D(c,x,g+4,baseR,bloom,t,fade,'back');
  const upperY=g-height*0.44;
  if(t>0.06){
   this.lotusBloom3D(c,x,upperY,baseR*0.68,clamp((t-0.06)/.32),t*1.3+1.2,fade*0.78,'back');
  }

  // 4. Sculpted Central Silver-Moon Cascade Pillar (bell-calyx base -> celestial spire)
  c.save();
  const colW=68*cs*(0.65+0.35*bloom);
  const colGrad=c.createLinearGradient(x,g,x,g-height-35);
  colGrad.addColorStop(0,'rgba(255, 255, 255, 0.96)');
  colGrad.addColorStop(0.28,'rgba(225, 242, 255, 0.82)');
  colGrad.addColorStop(0.68,'rgba(185, 218, 255, 0.46)');
  colGrad.addColorStop(1,'rgba(255, 255, 255, 0)');
  c.globalAlpha=fade*0.92;
  c.fillStyle=colGrad;
  c.beginPath();
  c.moveTo(x-colW*1.15,g);
  c.bezierCurveTo(x-colW*0.52,g-height*0.28,x-colW*0.26,g-height*0.72,x,g-height-28*cs);
  c.bezierCurveTo(x+colW*0.26,g-height*0.72,x+colW*0.52,g-height*0.28,x+colW*1.15,g);
  c.closePath();
  c.fill();

  // Inner pure white-silver core beam
  const coreGrad=c.createLinearGradient(x,g,x,g-height);
  coreGrad.addColorStop(0,'#ffffff');
  coreGrad.addColorStop(0.65,'rgba(245, 250, 255, 0.88)');
  coreGrad.addColorStop(1,'rgba(255, 255, 255, 0)');
  c.fillStyle=coreGrad;
  c.beginPath();
  c.moveTo(x-colW*0.42,g);
  c.quadraticCurveTo(x-colW*0.14,g-height*0.5,x,g-height);
  c.quadraticCurveTo(x+colW*0.14,g-height*0.5,x+colW*0.42,g);
  c.closePath();
  c.fill();
  c.restore();

  // 5. Open-source Sprite Sheet Energy Eruptions (Effect51 & Effect36 tinted in Silver-Moon)
  if(assets.Effect36){
   this.sheet(c,this.tintSheet(assets.Effect36,'#e4f2ff'),(t%.85),.85,4,4,x,g-height*0.26,255*cs,255*cs,fade*0.78);
  }
  if(assets.Effect51){
   this.sheet(c,this.tintSheet(assets.Effect51,'#ffffff'),t,.92,4,4,x,g-height*0.58,285*cs,310*cs,fade*0.9);
  }

  // 6. Double-Helix Ascending Silver Ribbons & Orbiting Crescent Blades
  for(let strand=0;strand<3;strand++){
   c.save();
   c.globalAlpha=fade*(strand===0?0.95:0.68);
   c.strokeStyle=strand===0?'#ffffff':strand===1?'#d6ecff':'#b8d4ff';
   c.lineWidth=(strand===0?4.2:2.6)*cs;
   c.beginPath();
   for(let j=0;j<=42;j++){
    const p=j/42;
    const ang=p*TAU*1.85-t*11.5+strand*TAU/3;
    const rad=(baseR*0.82*(1-p*0.62)+Math.sin(p*Math.PI)*22)*cs;
    const xx=x+Math.cos(ang)*rad;
    const yy=g-p*height;
    j?c.lineTo(xx,yy):c.moveTo(xx,yy);
   }
   c.stroke();
   c.restore();
  }

  const crescentCount=this.reduced?3:6;
  for(let k=0;k<crescentCount;k++){
   const p=(t*1.25+k/crescentCount)%1;
   const ang=p*TAU*1.85-t*9+k*1.1;
   const rad=baseR*0.85*(1-p*0.52);
   const cx=x+Math.cos(ang)*rad;
   const cy=g-p*height*1.04;
   this.crescent(c,cx,cy,(16+12*(1-p))*cs,ang+0.6,fade*Math.sin(p*Math.PI)*0.95);
  }
  const petalCount=this.reduced?8:18;
  for(let k=0;k<petalCount;k++){
   const p=(t*0.92+hash(f.seed+k))%1;
   const ang=p*TAU*2.1+k*1.7-t*4.5;
   const rad=(24+(1-p)*baseR*1.05)*(0.6+0.4*hash(f.seed+k*3));
   const px=x+Math.cos(ang)*rad;
   const py=g-p*(height+45*cs);
   const pCol=k%3===0?'#ffffff':k%3===1?'#dff0ff':'#c9dcff';
   this.petal(c,px,py,(6.5+5*Math.sin(p*Math.PI))*cs,ang+t*3,pCol,fade*Math.sin(p*Math.PI)*0.92);
  }

  // 7. Front Half of the 3D Blooming Giant Crystal Moon Lotus (wrapping the front of the pillar)
  this.lotusBloom3D(c,x,g+4,baseR,bloom,t,fade,'front');
  if(t>0.06){
   this.lotusBloom3D(c,x,upperY,baseR*0.68,clamp((t-0.06)/.32),t*1.3+1.2,fade*0.85,'front');
  }

  // 8. Aerial Footstep Lotus Platform ('踏月莲台') blooming directly beneath Xiaosi's feet as she leaps!
  const actor=f.actorRef;
  if(actor&&actor.y>12){
   const ax=actor.x,ay=this.ground-actor.y+6*cs;
   this.glow(c,ax,ay,135*cs,46*cs,'#ffffff',fade*0.68);
   this.ring(c,ax,ay,48*cs,11*cs,'#ffffff',fade*0.85,2.2);
   this.lotusBloom3D(c,ax,ay+3*cs,46*cs,bloom,t*1.8,fade*0.9,'all');
  }

  // 9. Apex Starlight Burst & Particle Spray
  if(assets.spark_01){
   const spSize=(125+45*Math.sin(t*12))*cs;
   c.save();
   c.translate(x,g-height);
   c.rotate(t*2.5);
   c.globalAlpha=fade*0.85;
   c.drawImage(this.tintSheet(assets.spark_01,'#ffffff'),-spSize/2,-spSize/2,spSize,spSize);
   c.restore();
  }
  if(!f.fired.has(1)&&t>.05){
   f.fired.add(1);
   this.spray(x,g-35,45,'#ffffff',0,-560,210,.95);
   this.spray(x,g-85,35,'#cfe6ff',0,-440,240,.88);
  }
 }
 knockdown(c,f){const t=f.t,q=clamp(1-t/f.life),g=this.ground;this.glow(c,f.x,g-8,350,80,'#ffddaa',q*.6);for(let k=0;k<3;k++)this.ring(c,f.x,g,30+t*(330+k*90),8+t*(30+k*15),k%2?'#bcb1cb':'#ffe0aa',q*(.8-k*.2),3-k*.7);c.globalAlpha=q*.7;c.strokeStyle='#e4c4b0';c.lineWidth=2;for(let j=0;j<9;j++){let a=j/9*TAU;c.beginPath();c.moveTo(f.x+Math.cos(a)*25,g+Math.sin(a)*6);c.lineTo(f.x+Math.cos(a)*100,g+Math.sin(a)*23);c.lineTo(f.x+Math.cos(a+.2)*140,g+Math.sin(a+.2)*30);c.stroke();}}
 volcano(c,f,assets){
  const t=f.t,g=this.ground,center=f.x+f.face*70,fade=clamp((2.35-t)/.7),rise=clamp(t/.12);
  this.glow(c,center,g-30,1050*rise,150,'#ffa04c',fade*.65);this.ring(c,center,g+1,Math.min(570,t*750),Math.min(75,t*110),'#ffe9a0',clamp(1-t/.9),3);
  const reach=Math.min(490,t*850);
  for(let side of [-1,1]){c.globalAlpha=fade*.8;c.lineWidth=9;c.strokeStyle='#d36a39';c.beginPath();c.moveTo(center,g-3);for(let j=1;j<14;j++){const xx=center+side*reach*j/13,yy=g+(hash(f.seed+j*side)-.5)*19;c.lineTo(xx,yy);}c.stroke();c.globalAlpha=fade;c.lineWidth=2;c.strokeStyle='#ffdc8b';c.stroke();
   for(let j=1;j<5;j++){let xx=center+side*reach*j/5,yy=g+(hash(f.seed+j)-.5)*12;c.lineWidth=1.5;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+side*26,g+19);c.lineTo(xx+side*47,g+22);c.stroke();}}
  for(let i=0;i<11;i++){
   const side=i-5,delay=Math.abs(side)*.095,age=t-delay;if(age<0)continue;const x=center+side*83+(hash(f.seed+i*9)-.5)*29,h=110+hash(f.seed+i)*190,life=clamp((1.8-age)/.65),grow=1-Math.pow(1-clamp(age/.22),3);
   if(!f.fired.has(i)){f.fired.add(i);this.spray(x,g-15,22,'#ffd07a',side*38,-380,350,1.15);}
   this.glow(c,x,g-50,170,150,'#ff793c',life*.8);
   c.save();c.globalCompositeOperation='source-over';c.globalAlpha=life;const top=g-h*grow,lean=side*5+(hash(f.seed+i*31)-.5)*60,bw=34+hash(f.seed+i*23)*29;
   let grad=c.createLinearGradient(x,top,x,g);grad.addColorStop(0,'#473044');grad.addColorStop(.62,'#372332');grad.addColorStop(1,'#a44d38');c.fillStyle=grad;
   c.beginPath();c.moveTo(x-bw,g);c.lineTo(x-bw*.8,top+h*grow*.65);c.lineTo(x-bw*.43+lean*.5,top+h*grow*.31);c.lineTo(x-9+lean,top+25*grow);c.lineTo(x+8+lean,top);c.lineTo(x+bw*.5+lean*.5,top+h*grow*.42);c.lineTo(x+bw*.7,top+h*grow*.77);c.lineTo(x+bw,g);c.closePath();c.fill();
   c.fillStyle='#6a414c';c.beginPath();c.moveTo(x+8+lean,top);c.lineTo(x-9+lean,top+25*grow);c.lineTo(x-13,g-3);c.lineTo(x+12,top+h*grow*.62);c.closePath();c.fill();
   c.fillStyle='#281e30';c.beginPath();c.moveTo(x+8+lean,top);c.lineTo(x+12,top+h*grow*.62);c.lineTo(x+3,g);c.lineTo(x+bw,g);c.lineTo(x+bw*.7,top+h*grow*.77);c.closePath();c.fill();
   for(let k=0;k<3;k++){let bx=x+(k-1)*30, bh=(30+hash(f.seed+i*13+k)*85)*grow,bl=(hash(i*17+k+f.seed)-.5)*65;c.fillStyle=k%2?'#51313f':'#382333';c.beginPath();c.moveTo(bx-26,g);c.lineTo(bx+bl-9,g-bh+15*grow);c.lineTo(bx+bl+8,g-bh);c.lineTo(bx+27,g);c.closePath();c.fill();c.strokeStyle='#ed9a60';c.lineWidth=1;c.beginPath();c.moveTo(bx+bl+8,g-bh);c.lineTo(bx+5,g-8);c.stroke();}
   c.strokeStyle='#ffca79';c.lineWidth=2.2;c.globalAlpha=life*.9;c.beginPath();c.moveTo(x+8+lean,top);c.lineTo(x-2,top+h*grow*.42);c.lineTo(x+13,top+h*grow*.58);c.lineTo(x+3,g-8);c.stroke();c.restore();
   this.sheet(c,assets.Fire01,Math.max(0,age-.03),1.4,8,4,x,g-h*.45,125,h*1.2,life*.85);
   if(age<.65)this.bolt(c,x,g-6,x+lean,Math.max(top,g-210),f.seed+i,t,'#ffd783',1.3,life*.7,false);
   this.ring(c,x,g,40+age*36,8+age*4,'#ffc975',life*.6,1.5);
  }
  for(let j=0;j<5;j++){let age=t-j*.08;if(age>=0&&age<.65){c.globalAlpha=(1-age/.65)*.55;c.strokeStyle='#ffe6a0';c.lineWidth=2;c.beginPath();c.ellipse(center,g-80,100+age*600,70+age*150,0,Math.PI,TAU);c.stroke();}}
 }
 moon(c,f,assets){
  const cs=this.charScale||1,t=f.t,g=this.ground,x=f.x+f.face*85*cs,y=g-165*cs-f.h,fade=clamp((2.3-t)/.65),r=(1-Math.pow(1-clamp(t/.32),3))*185;
  this.glow(c,x,y,650,570,'#a883ff',fade*.42);this.glow(c,x,g,1000,100,'#a48aff',fade*.55);
  this.ring(c,x,y,r,r,'#dccaff',fade*.4,2);this.ring(c,x,y,r*1.015,r*.97,'#9875f9',fade*.25,8);
  for(let k=0;k<4;k++){c.save();c.translate(x,y);c.rotate(k*.8+t*.35);c.globalAlpha=fade*.55;c.strokeStyle=k%2?'#f5eaff':'#bfa1ff';c.lineWidth=1.5;c.beginPath();c.ellipse(0,0,r,r*(.25+k*.13),0,t+k,t+k+4);c.stroke();c.restore();}
  this.sheet(c,this.tintSheet(assets.Effect36,'#d6b4ff'),(t%.85),.85,4,4,x,y,330,330,fade*.8);
  for(let j=0;j<11;j++){let a=j/11*TAU+t*.15,ex=x+Math.cos(a)*r,ey=y+Math.sin(a)*r;this.bolt(c,x+Math.cos(a+.3)*r*.28,y+Math.sin(a+.3)*r*.28,ex,ey,f.seed+j,t,'#c9acff',1.7,fade*.85);this.glow(c,ex,ey,20,20,'#f1dfff',fade*.8);}
  for(let side of[-1,1])for(let j=0;j<3;j++){let delay=.2+j*.13,age=t-delay;if(age<0)continue;let ex=x+side*(250+j*130),ey=g-20-j*12;
   if(!f.fired.has(side*10+j)){f.fired.add(side*10+j);this.spray(ex,ey,25,'#e0c6ff',side*160,-230,320,1.1);}
   if(age<1.1){this.bolt(c,x+side*r*.65,y+80,ex,ey,f.seed+side*30+j,t,'#d9c2ff',2,fade*clamp((1.1-age)/.4));this.ring(c,ex,g,50+age*45,10+age*7,'#d2adff',clamp(1-age/1.1)*.7,2);this.sheet(c,this.tintSheet(assets.Effect51,'#d6b4ff'),age,1.1,4,4,ex,ey-25,180,180,fade*.6);}
  }
  if(!f.fired.has(99)&&t>.25){f.fired.add(99);this.spray(x,y,70,'#f0deff',0,-30,600,1.2);}
  this.glow(c,x,y,85,85,'#fff0ff',fade*.8);
 }
 bearCurtainCall(c,f,assets){
  // =========================================================================
  // FREDDY BEAR ULTIMATE '午夜 · 惊魂谢幕' (MIDNIGHT CLOCKWORK CURTAIN CALL)
  // =========================================================================
  const cs=this.charScale||1,t=f.t,g=this.ground,center=f.x+f.face*80*cs,skyY=g-225*cs-f.h,fade=clamp((2.35-t)/.65),dialR=(1-Math.pow(1-clamp(t/.3),3))*195;
  this.glow(c,center,skyY,760,620,'#9d4edd',fade*0.52);
  this.glow(c,center,g,1050,125,'#ffd363',fade*0.62);
  // Giant Midnight Clockwork Dial in the Sky (12:00 / 6 AM Chime)
  c.save();
  c.translate(center,skyY);
  this.clockworkGear(c,0,0,dialR,18,t*0.85,'#ffd363',fade*0.85);
  this.clockworkGear(c,0,0,dialR*0.66,12,-t*1.65,'#c77dff',fade*0.78);
  // Clock hour ticks & spinning hands
  c.globalAlpha=fade*0.92;
  c.strokeStyle='#fff4cc';
  for(let h=0;h<12;h++){
   const ang=h*TAU/12-Math.PI/2;
   c.lineWidth=h%3===0?3.5:1.8;
   c.beginPath();
   c.moveTo(Math.cos(ang)*dialR*0.72,Math.sin(ang)*dialR*0.72);
   c.lineTo(Math.cos(ang)*dialR*0.86,Math.sin(ang)*dialR*0.86);
   c.stroke();
  }
  // Hour & Minute Hands sweeping toward Midnight
  for(let hand=0;hand<2;hand++){
   const hAng=-Math.PI/2+t*(hand?9.5:1.8);
   const hLen=dialR*(hand?0.74:0.5);
   c.lineWidth=hand?3.2:5.2;
   c.strokeStyle=hand?'#ff6e9c':'#ffe694';
   c.beginPath();
   c.moveTo(0,0);
   c.lineTo(Math.cos(hAng)*hLen,Math.sin(hAng)*hLen);
   c.stroke();
  }
  c.restore();
  if(assets.Effect36){
   this.sheet(c,this.tintSheet(assets.Effect36,'#ffd363'),(t%.85),.85,4,4,center,skyY,350,350,fade*0.85);
  }
  // 8 Lightning Arcs from the Sky Clockwork Dial to the Stage Floor
  for(let j=0;j<8;j++){
   const side=j-3.5,delay=Math.abs(side)*0.07,age=t-delay;
   if(age<0)continue;
   const px=center+side*125,life=clamp((1.9-age)/.6);
   if(!f.fired.has(j)){
    f.fired.add(j);
    this.spray(px,g-18,26,j%2?'#ffd363':'#d58cff',side*42,-360,320,1.1);
   }
   this.glow(c,px,g-55,180,150,j%2?'#ffbe42':'#b56eff',life*0.78);
   if(age<1.15){
    this.bolt(c,center+side*22,skyY+35,px,g-8,f.seed+j*19,t,j%2?'#ffe48a':'#e0aaff',2.4,life*0.92,true);
    if(assets.Effect51){
     this.sheet(c,this.tintSheet(assets.Effect51,j%2?'#ffd363':'#c77dff'),age,1.1,4,4,px,g-95,195,220,life*0.78);
    }
   }
   c.save();
   c.translate(px,g);
   c.scale(1,0.26);
   this.clockworkGear(c,0,0,58+age*25,10,t*5*(j%2?1:-1),j%2?'#ffd363':'#c77dff',life*0.75);
   c.restore();
  }
  // Swirling Golden Music Notes Across the Stage
  for(let m=0;m<10;m++){
   const p=(t*0.85+m/10)%1;
   const mx=center+Math.sin(p*TAU+m)*380;
   const my=g-40-p*320;
   this.musicNote(c,mx,my,15,Math.sin(t*4+m)*0.22,m%2?'#ffe694':'#ff7aa8',fade*Math.sin(p*Math.PI)*0.9,m%3===0);
  }
  if(!f.fired.has(99)&&t>.22){
   f.fired.add(99);
   this.spray(center,skyY,75,'#ffe48a',0,-40,620,1.25);
  }
 }
}
