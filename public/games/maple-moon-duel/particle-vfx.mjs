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
 constructor(){this.particles=[];this.effects=[];this.cache=new Map();this.ground=701;this.reduced=false;}
 reset(){this.particles.length=this.effects.length=0;}
 emit(event,actor,extra={}){
  let e=typeof event==='string'?{type:event,actor,...extra}:event;const a=e.actor;if(!a)return;
  // Love damage retains game bookkeeping, but must not spawn combat cuts/sparks.
  if(loveHit(e))return;
  if(e.type==='special'){
   const type=e.skill==='launch'?'launcher':e.skill,live=this.effects.findLast(f=>f.type===type&&f.actorRef===a);
   if(e.phase!=='start'){
    if(live&&e.target){live.targetRef=e.target;if(type==='charm')live.life=Math.max(live.life,live.t+1.1);}
    if(type==='love'&&live){if(e.phase==='grab')live.grabbed=true;if(e.phase==='release')live.life=Math.min(live.life,live.t+.3);}
    if(type==='pounce'&&e.phase==='pulse'&&live)this.pounceLand(live,a);
    if(e.phase==='pulse'&&type==='roar')this.spray(a.x+a.face*95,this.ground-a.y-110,10,a.kind==='cat'?'#ffcf87':'#d4baff',a.face*350,0,100,.6);
    return;
   }
   e={...e,type};
  }
  if(e.type==='land'&&e.skill==='pounce'){const live=this.effects.findLast(f=>f.type==='pounce'&&f.actorRef===a);if(live)this.pounceLand(live,a);return;}
  const cat=(e.source||a).kind==='cat',color=cat?'#ffc36c':'#c5a4ff';
  const f={type:e.type,x:a.x,h:a.y||0,face:a.face||1,cat,color,t:0,seed:rand(1,999),chain:e.chain||0,life:1,pace:['ultimate','burst'].includes(e.type)?1/1.8:['love','cry','pounce','roar','charm','launcher','cast','charge','guardbreak'].includes(e.type)?1/1.35:1,fired:new Set(),actorRef:a,targetRef:e.target,airborne:!!e.airborne,range:e.range,impactFace:e.source?.face||a.face||1,damage:e.damage||0};
  if(['love','cry','pounce'].includes(e.type)){f.life=e.type==='love'?1.85:e.type==='cry'?2:3.2;this.effects.push(f);}
  else if(e.type==='block'||e.type==='guardbreak'){f.life=e.type==='block'?.3:.65;this.effects.push(f);this.spray(f.x+a.face*35,this.ground-f.h-90,e.type==='block'?14:35,'#bfe4ff',-f.impactFace*170,-90,190,.5);}
  else if(['roar','charm','launcher'].includes(e.type)){f.life=e.type==='roar'?1.4:e.type==='charm'?1.6:.95;this.effects.push(f);}
  else if(e.type==='knockdown'){f.life=.7;this.effects.push(f);this.spray(f.x,this.ground-6,45,'#efc3a1',0,-180,380,.75);}
  else if(e.type==='burst'){f.life=2.45;this.effects.push(f);}
  else if(e.type==='ultimate'){f.life=.48;this.effects.push(f);}
  else if(e.type==='slash'||e.type==='cast'){f.life=e.type==='cast'?.75:.42;this.effects.push(f);this.spray(f.x+f.face*60,this.ground-f.h-90,24,color,f.face*300,-90,260,.6);}
  else if(e.type==='charge'){f.life=.35;this.effects.push(f);}
  else if(e.type==='hit'&&e.damage>0){this.spray(f.x,this.ground-f.h-90,e.damage>=40?52:22,color,f.impactFace*(e.damage>=40?380:250),-100,260,.5);f.life=.23;this.effects.push(f);}
  else if(e.type==='dash')this.spray(f.x,this.ground-f.h-65,20,color,-f.face*250,0,130,.4);
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
 draw(ctx,dt,{reduced=false,assets={},ground=701}={}){
  this.ground=ground;this.reduced=reduced;dt=clamp(Number(dt)||0,0,.05);ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  // Romantic beats own their participants' local visual space. Old root rain
  // must not enclose an embrace just because its cosmetic lifetime is longer.
  const romantic=new Set();
  for(const f of this.effects)if((f.type==='love'||f.type==='charm')&&f.t<f.life){romantic.add(f.actorRef);if(f.targetRef)romantic.add(f.targetRef);}
  for(const f of this.effects){f.t+=dt*(f.pace||1);this.emissionPace=f.pace||1;
   if(f.type==='cry'&&(romantic.has(f.actorRef)||romantic.has(f.targetRef))){f.life=0;continue;}
   if(f.type==='pounce'&&!f.landed&&(f.actorRef?.heldBy||f.actorRef?.charmed>0)){f.life=0;continue;}
const t=f.t,q=clamp(1-t/f.life),x=f.x,y=ground-f.h-95,face=f.face;
   if(f.type==='cast'&&!f.cat){this.moonCast(ctx,f);
   }else if(f.type==='charge'&&!f.cat){this.moonCharge(ctx,f);
   }else if(f.type==='burst'){ctx.save();ctx.translate(f.x,ground);ctx.scale(1.16,1.08);ctx.translate(-f.x,-ground);if(f.cat)this.volcano(ctx,f,assets);else this.moon(ctx,f,assets);ctx.restore();}
   else if(f.type==='ultimate'||f.type==='charge'){
    const p=clamp(t/f.life),r=130*(1-p)+20;this.glow(ctx,x,y,180*p,200*p,f.color,.7);for(let i=0;i<12;i++){let a=i/12*TAU+t*5;this.glow(ctx,x+Math.cos(a)*r,y+Math.sin(a)*r,12,12,f.color,q);}
    for(let i=0;i<3;i++)this.ring(ctx,x,ground-3,r*(1+i*.2),r*.14,f.color,q*.6);
   }else if((f.type==='slash'||f.type==='cast')&&f.cat){this.claw(ctx,x+face*(f.type==='cast'?110+t*140:76),y,face,t/f.life,f.color,f.type==='cast'?1.7:1+f.chain*.1);
   }else if(f.type==='roar'){this.roar(ctx,f,assets);
   }else if(f.type==='charm'){this.charm(ctx,f);
   }else if(f.type==='launcher'){this.launcher(ctx,f,assets);
   }else if(f.type==='knockdown'){this.knockdown(ctx,f);
   }else if(f.type==='slash'||f.type==='cast'){
    const p=t/f.life,big=f.type==='cast',w=big?460:240,h=big?240:160;
    ctx.save();ctx.translate(x+face*(big?100+p*150:65),y);ctx.scale(face,1);ctx.rotate(-.28+p*.5);
    if(assets.slashSweep){this.sheet(ctx,assets.slashSweep,t,f.life,6,1,0,0,w,h,q);}
    for(let k=0;k<3;k++){ctx.globalAlpha=q*(.9-k*.2);ctx.strokeStyle=k===0?'#fff6dc':f.color;ctx.lineWidth=(big?12:8)-k*2;ctx.beginPath();ctx.ellipse(0,0,w*.48+k*8,h*.5+k*9,-.2,-1.45+p*.5,1.3+p*.5);ctx.stroke();}
    this.glow(ctx,30,0,w*.8,h*.8,f.color,q*.25);ctx.restore();
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
  const p=clamp(f.t/f.life),a=f.actorRef,x=a?.x??f.x,y=this.ground-(a?.y??f.h)-95;
  this.glow(c,x+f.face*45,y,190,190,'#ae99ff',p*.4);
  for(let k=0;k<3;k++){const ang=k*TAU/3+f.t*4,r=85*(1-p)+32;this.crescent(c,x+Math.cos(ang)*r,y+Math.sin(ang)*r*.75,16+p*15,ang,p*.8);}
 }
 moonCast(c,f){
  const p=clamp(f.t/f.life),fade=(1-p),x=f.x+f.face*65,y=this.ground-f.h-85;
  this.glow(c,x,y,320,260,'#b6a3ff',fade*.38);
  // A short-lived tilted orbital launch seal stays at the cast point;
  // the actual moving blade is drawn from the live physics projectile below.
  c.save();c.translate(x,y);c.scale(f.face,1);c.rotate(-.5);
  for(let k=0;k<2;k++){c.globalAlpha=fade*(.65-k*.2);c.strokeStyle=k?'#9eaeff':'#e5dcff';c.lineWidth=k?1.5:3;c.beginPath();c.ellipse(0,0,80+p*110,43+p*55,k*.7,p*2,p*2+Math.PI*1.5);c.stroke();}
  for(let k=0;k<4;k++){const ang=k*TAU/4+p*2;this.crescent(c,Math.cos(ang)*(65+p*70),Math.sin(ang)*(40+p*40),10+fade*10,ang,fade*.75);}
  c.restore();
 }
 moonBladeProjectile(c,z,time,ground=701){
  const face=z.vx>=0?1:-1,age=Math.max(0,2.5-z.life),r=72+8*Math.sin(Math.min(1,age/.2)*Math.PI),x=z.x,y=ground-z.y;
  c.save();c.globalCompositeOperation='lighter';c.translate(x,y);c.scale(face,1);
  this.glow(c,-15,0,230,205,'#a999ff',.45);
  // Separate curved echoes give direction, instead of duplicating J arcs.
  for(let k=3;k>=1;k--)this.crescent(c,-k*29,Math.sin(age*5-k)*4,r*(1-k*.07),-.15,.16*(1-k*.18));
  this.crescent(c,0,0,r,-.15,.95);
  for(let k=0;k<(this.reduced?3:6);k++){const ang=time*3+k*TAU/6,rr=r*(1.05+(k%2)*.18),xx=Math.cos(ang)*rr*.65-8,yy=Math.sin(ang)*rr;this.petal(c,xx,yy,4+k%2,ang,'#e7dbff',.75);}
  this.glow(c,r*.58,-5,35,70,'#f4efff',.65);c.restore();
 }
 pounceLand(f,a){if(f.landed)return;f.landed=true;f.landX=a.x;f.landT=f.t;f.life=f.t+.9;this.spray(a.x,this.ground-8,65,'#ffd09b',0,-200,460,.9);}
 love(c,f){
  const a=f.actorRef,b=f.targetRef,x=a?.x??f.x,y=this.ground-(a?.y??f.h)-110,tx=b?.x??x,ty=this.ground-(b?.y??f.h)-105,t=f.t,fade=clamp((f.life-t)/.3),mx=(x+tx)/2,my=(y+ty)/2;
  // Hearts ONLY: no embracing frame, ribbons, halo, glow, rays or impact lines.
  for(let k=0;k<(this.reduced?7:15);k++){
   const p=(t*.36+k/15)%1,side=k%2?1:-1;
   const xx=mx+side*(10+p*(65+hash(f.seed+k)*55))+Math.sin(t*1.7+k)*8;
   const yy=my+35-p*(145+hash(f.seed+k*3)*60);
   this.heart(c,xx,yy,6+Math.sin(p*Math.PI)*9,Math.sin(t+k)*.15,k%3?'#ffc0de':'#edc4ff',fade*Math.sin(p*Math.PI));
  }
 }
 tear(c,x,y,size,alpha){c.globalAlpha=alpha;c.fillStyle='#bceaff';c.beginPath();c.moveTo(x,y-size*1.8);c.bezierCurveTo(x-size,y-size*.1,x-size,y+size*.8,x,y+size);c.bezierCurveTo(x+size,y+size*.8,x+size,y-size*.1,x,y-size*1.8);c.fill();}
 cry(c,f){
  const a=f.actorRef,b=f.targetRef,x=a?.x??f.x,y=this.ground-(a?.y??f.h)-120,tx=b?.x??x+f.face*180,ty=this.ground-(b?.y??0),t=f.t,fade=clamp((f.life-t)/.4);
  this.glow(c,tx,ty-60,360,170,'#a3cbff',fade*.3);
  // Match the actual source cell, 130/301 pivot and 244px body height.
  // Stop face streams when the cry pose is interrupted; no tears from a running torso.
  if(a?.action?.skill==='cry'||a?.cryVisual){
   const eyes=cryEyeAnchors(a,this.ground),face=a.face||1;
   eyes.forEach((eye,index)=>{
    const side=(index===0?-1:1)*face,reach=90+index*18,lift=36,drop=120;
    const point=p=>({x:eye.x+side*reach*p,y:eye.y-lift*4*p*(1-p)+drop*p*p});
    c.globalAlpha=fade*.72;c.strokeStyle='#9edfff';c.lineWidth=4.5;c.beginPath();c.moveTo(eye.x,eye.y);
    for(let j=1;j<=28;j++){const p=point(j/28);c.lineTo(p.x,p.y)}c.stroke();
    c.globalAlpha=fade*.95;c.strokeStyle='#f0fcff';c.lineWidth=1.5;c.stroke();
    for(let k=0;k<7;k++){const p=(t*1.05+k/7)%1,pos=point(p);this.tear(c,pos.x,pos.y,2.7+2.1*p,fade*(1-p*.7));}
   });
  }
  // Short rain accents convey the root without a cage, enclosing helix or rings.
  for(let k=0;k<(this.reduced?12:30);k++){let p=(t*1.45+hash(f.seed+k))%1,xx=tx+(hash(k*19+f.seed)-.5)*280,yy=ty-270+p*255;c.globalAlpha=fade*.55;c.strokeStyle=k%3?'#aacfff':'#e2f6ff';c.lineWidth=1.2;c.beginPath();c.moveTo(xx,yy-14);c.lineTo(xx-5,yy);c.stroke();}

 }
 pounce(c,f){
  const a=f.actorRef,x=f.landed?f.landX:(a?.x??f.x),h=f.landed?0:(a?.y??f.h),g=this.ground,y=g-h-90,t=f.t;
  if(!f.landed){
   // A restrained body glow, never the eight long diagonal bars/floor ellipse
   // that used to linger around held or enchanted actors after interruption.
   const q=clamp((f.life-t)/.2);this.glow(c,x,y,210,150,'#ffc17b',q*.16);return;
  }
  const age=t-f.landT,q=clamp(1-age/.85);this.glow(c,x,g-15,650,160,'#ffb578',q*.65);
  for(let side of [-1,1]){c.globalAlpha=q;c.fillStyle='#ffda9c';c.beginPath();c.moveTo(x,g);c.lineTo(x+side*(70+age*380),g-24*q);c.lineTo(x+side*(240+age*220),g+6);c.lineTo(x+side*70,g+15);c.closePath();c.fill();}
  for(let k=0;k<12;k++){let a=k/12*TAU,dist=50+age*(170+hash(f.seed+k)*160),xx=x+Math.cos(a)*dist,yy=g+Math.sin(a)*dist*.17-Math.sin(clamp(age/.85)*Math.PI)*45;c.save();c.translate(xx,yy);c.rotate(a+age*3);c.globalAlpha=q*.8;c.fillStyle=k%2?'#ddb099':'#8b6874';c.beginPath();c.moveTo(-8,-3);c.lineTo(-3,-13);c.lineTo(9,-6);c.lineTo(6,6);c.lineTo(-6,8);c.closePath();c.fill();c.restore();}
  for(let k=0;k<3;k++)this.ring(c,x,g,40+age*(270+k*110),7+age*(45+k*16),'#ffdaa3',q*(.7-k*.15),3-k*.6);
 }
 shield(c,f,broken=false){const x=f.x+f.face*37,y=this.ground-f.h-90,t=f.t,q=clamp(1-t/f.life);if(!broken){this.glow(c,x,y,110,180,'#a1dfff',q*.4);c.globalAlpha=q;c.strokeStyle='#c2edff';c.lineWidth=4;c.beginPath();c.ellipse(x,y,24+30*t,78,0,-Math.PI*.65+(f.face<0?Math.PI:0),Math.PI*.65+(f.face<0?Math.PI:0));c.stroke();for(let k=0;k<3;k++){c.globalAlpha=q*.45;c.lineWidth=1;c.beginPath();c.ellipse(x-f.face*k*8,y,22,65-k*7,0,-1.3+(f.face<0?Math.PI:0),1.3+(f.face<0?Math.PI:0));c.stroke();}}
  else{for(let k=0;k<12;k++){let a=k/12*TAU,r=55+t*160,xx=f.x+Math.cos(a)*r,yy=y+Math.sin(a)*r+t*t*80;c.save();c.translate(xx,yy);c.rotate(a+t*3);c.globalAlpha=q*.7;c.fillStyle=k%2?'#b8dfff':'#ffe2ad';c.beginPath();c.moveTo(-11,-15);c.lineTo(12,-5);c.lineTo(4,14);c.lineTo(-7,4);c.closePath();c.fill();c.restore();}}}
 impact(c,f){const x=f.x,y=this.ground-f.h-95,t=f.t,q=clamp(1-t/f.life),dir=f.impactFace||f.face,strong=f.damage>=40;this.glow(c,x,y,strong?190:100,strong?135:90,'#fff0d5',q*.75);c.save();c.translate(x,y);c.scale(dir,1);
  // Forward tapered wedges and trailing cut lines communicate transferred momentum.
  for(let k=0;k<7;k++){const ang=(hash(f.seed+k)-.5)*1.25,len=(strong?230:135)*(1+hash(k+f.seed))*(.3+t*2.5);c.save();c.rotate(ang);c.globalAlpha=q*(k? .7:1);c.fillStyle=k%2?f.color:'#fff2dc';c.beginPath();c.moveTo(-20,0);c.lineTo(len,-(k?2:5)*q);c.lineTo(len+20,0);c.lineTo(12,(k?2:6)*q);c.closePath();c.fill();c.restore();}
  if(f.airborne){for(let k=0;k<3;k++){c.globalAlpha=q*.6;c.strokeStyle=f.color;c.lineWidth=2;c.beginPath();c.moveTo((k-1)*27,-10);c.lineTo((k-1)*27-20,95+t*80);c.stroke();}}
  c.restore();
 }
 // Three separated tapered cuts read as claws rather than a sword arc.
 claw(c,x,y,face,p,color,scale=1){
  c.save();c.translate(x,y);c.scale(face*scale,scale);const fade=clamp(1-p),sweep=clamp(p*3);
  for(let k=0;k<3;k++){const dx=(k-1)*35,dy=(k-1)*9;c.globalAlpha=fade*.9;c.fillStyle=color;c.beginPath();c.moveTo(dx-62,-97);c.bezierCurveTo(dx+54,-58,dx+81,17,dx+51,95*sweep);c.bezierCurveTo(dx+46,25,dx+17,-34,dx-62,-97);c.fill();c.globalAlpha=fade;c.strokeStyle='#fff4cb';c.lineWidth=2.3;c.beginPath();c.moveTo(dx-56,-93);c.bezierCurveTo(dx+42,-53,dx+65,18,dx+51,92*sweep);c.stroke();}
  c.restore();
 }
 heart(c,x,y,size,rotation,color,alpha){c.save();c.translate(x,y);c.rotate(rotation);c.scale(size,size);c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();c.moveTo(0,.9);c.bezierCurveTo(-.4,.5,-1,-.05,-1,-.5);c.bezierCurveTo(-1,-1.15,-.2,-1.25,0,-.65);c.bezierCurveTo(.2,-1.25,1,-1.15,1,-.5);c.bezierCurveTo(1,-.05,.4,.5,0,.9);c.fill();c.restore();}
 petal(c,x,y,size,rotation,color,alpha){c.save();c.translate(x,y);c.rotate(rotation);c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();c.moveTo(-size,0);c.bezierCurveTo(-size*.3,-size,size*.8,-size*.6,size,0);c.bezierCurveTo(size*.3,size*.8,-size*.6,size*.5,-size,0);c.fill();c.restore();}
 roar(c,f,assets){
  const a=f.actorRef,x=a?.x??f.x,y=this.ground-(a?.y??f.h)-110,face=f.face,t=f.t,fade=clamp((f.life-t)/.28),color=f.color;
  this.glow(c,x+face*80,y,200,170,color,fade*.22);
  c.save();c.translate(x+face*55,y);c.scale(face,1);
  // Layered expanding cones have a visible open mouth and direction.
  for(let k=0;k<7;k++){const u=(t*1.8+k/7)%1,d=45+u*300,h=30+u*120,alpha=fade*(1-u)*.75;c.globalAlpha=alpha;c.strokeStyle=f.cat?'#ffe0a2':'#e6d4ff';c.lineWidth=2+4*(1-u);c.beginPath();c.ellipse(d,0,20+u*50,h,0,-1.27,1.27);c.stroke();
   if(!f.cat){c.globalAlpha=alpha*.6;c.lineWidth=2;c.beginPath();c.moveTo(8,-18);c.bezierCurveTo(d*.4,-h-20,d*.6,h+20,d,h*.8*Math.sin(t*4+k));c.stroke();}}
  const cone=c.createLinearGradient(0,0,340,0);cone.addColorStop(0,color+'00');cone.addColorStop(.25,color+'28');cone.addColorStop(1,color+'00');c.globalAlpha=fade;c.fillStyle=cone;c.beginPath();c.moveTo(0,-20);c.lineTo(340,-125);c.quadraticCurveTo(385,0,340,125);c.lineTo(0,20);c.closePath();c.fill();
  if(f.cat){for(let k=0;k<2;k++){let p=(t*1.6+k*.5)%1;this.claw(c,85+p*220,0,1,p,'#ffd990',.7+p*.3);}}
  else{for(let k=0;k<5;k++){let p=(t*.8+k*.2)%1;this.petal(c,50+p*285,Math.sin(t*4+k)*70,8,p*7,'#e2caff',fade*(1-p));}}
  c.restore();
  const tick=Math.floor(t*10);if(!f.fired.has(tick)){f.fired.add(tick);this.spray(x+face*90,y,4,color,face*420,0,60,.55);}
 }
 charm(c,f){
  const a=f.actorRef,x=a?.x??f.x,y=this.ground-(a?.y??f.h)-(f.cat?50:95),target=f.targetRef,tx=target?.x??f.tx??(x+f.face*(f.range||250)),ty=this.ground-(target?.y??0)-110,t=f.t,fade=clamp((f.life-t)/.4);
  this.glow(c,x,y,220,150,f.cat?'#ff9fba':'#d6abff',fade*.23);
  for(let k=0;k<13;k++){let p=(t*.65+k/13)%1,hump=Math.sin(p*Math.PI),xx=x+(tx-x)*p,yy=y+(ty-y)*p-hump*(50+hash(f.seed+k)*90)+Math.sin(t*3+k)*9,alpha=fade*Math.sin(p*Math.PI),size=9+hash(f.seed+k*2)*9;
   if(f.cat)this.heart(c,xx,yy,size,Math.sin(t*2+k)*.25,k%2?'#ffc4d7':'#ff91b8',alpha);
   else{this.petal(c,xx,yy,size,t*2+k,'#e9caff',alpha);this.petal(c,xx+10,yy-9,size*.7,-t*2+k,'#fff2ff',alpha*.6);}}
  // Enchantment is conveyed by hearts/petals only, without an enclosing halo.
  for(let k=0;k<5;k++){const ang=t*1.5+k*TAU/5,xx=tx+Math.cos(ang)*57,yy=ty-50+Math.sin(ang)*20;if(f.cat)this.heart(c,xx,yy,8,ang*.1,'#ffd0dd',fade*.6);else{for(let j=0;j<5;j++)this.petal(c,xx+Math.cos(j*TAU/5)*6,yy+Math.sin(j*TAU/5)*6,6,j*TAU/5,'#e7ceff',fade*.65);}}
 }
 launcher(c,f,assets){
  const t=f.t,g=this.ground-f.h,x=f.x+f.face*85,fade=clamp((f.life-t)/.4),height=380*clamp(t/.3),color=f.color;
  this.glow(c,x,g-height*.5,240,height+80,color,fade*.33);this.ring(c,x,g,110,20,color,fade*.8,3);
  if(f.cat){for(let k=0;k<3;k++){c.globalAlpha=fade*(.8-k*.15);c.strokeStyle=k===0?'#fff0c5':color;c.lineWidth=5-k;c.beginPath();for(let j=0;j<=45;j++){let p=j/45,ang=p*TAU*1.6-t*13+k*TAU/3,xx=x+Math.cos(ang)*(90-p*50),yy=g-p*height;j?c.lineTo(xx,yy):c.moveTo(xx,yy)}c.stroke();}this.claw(c,x,g-height*.65,f.face,clamp(t/f.life),color,1.3);this.sheet(c,assets.Fire01,t,.75,8,4,x,g-height*.45,170,height,fade*.65);}
  else{for(let k=-1;k<=1;k++){const h=height*(k===0?1:.75),xx=x+k*60;c.globalAlpha=fade*.2;c.fillStyle='#d9c3ff';c.beginPath();c.moveTo(xx-23,g);c.lineTo(xx-12,g-h+32);c.lineTo(xx,g-h);c.lineTo(xx+12,g-h+32);c.lineTo(xx+23,g);c.closePath();c.fill();c.globalAlpha=fade;c.strokeStyle='#eee2ff';c.lineWidth=2;c.stroke();for(let j=0;j<3;j++)this.ring(c,xx,g-h*(j+1)/4,35,8,'#c8b3ff',fade*.5,1.5);}this.sheet(c,this.tintSheet(assets.Effect51,'#d6b4ff'),t,.9,4,4,x,g-height*.65,220,220,fade*.8);}
  if(!f.fired.has(1)&&t>.12){f.fired.add(1);this.spray(x,g-45,55,color,0,-540,190,.9);}
 }
 knockdown(c,f){const t=f.t,q=clamp(1-t/f.life),g=this.ground;this.glow(c,f.x,g-8,350,80,'#ffddaa',q*.6);for(let k=0;k<3;k++)this.ring(c,f.x,g,30+t*(330+k*90),8+t*(30+k*15),k%2?'#bcb1cb':'#ffe0aa',q*(.8-k*.2),3-k*.7);c.globalAlpha=q*.7;c.strokeStyle='#e4c4b0';c.lineWidth=2;for(let j=0;j<9;j++){let a=j/9*TAU;c.beginPath();c.moveTo(f.x+Math.cos(a)*25,g+Math.sin(a)*6);c.lineTo(f.x+Math.cos(a)*100,g+Math.sin(a)*23);c.lineTo(f.x+Math.cos(a+.2)*140,g+Math.sin(a+.2)*30);c.stroke();}}
 volcano(c,f,assets){
  const t=f.t,g=this.ground,center=f.x+f.face*70,fade=clamp((2.35-t)/.7),rise=clamp(t/.12);
  this.glow(c,center,g-30,1050*rise,150,'#ffa04c',fade*.65);this.ring(c,center,g+1,Math.min(570,t*750),Math.min(75,t*110),'#ffe9a0',clamp(1-t/.9),3);
  // A branching molten fissure joins the vents into one continuous ground rupture.
  const reach=Math.min(490,t*850);
  for(let side of [-1,1]){c.globalAlpha=fade*.8;c.lineWidth=9;c.strokeStyle='#d36a39';c.beginPath();c.moveTo(center,g-3);for(let j=1;j<14;j++){const xx=center+side*reach*j/13,yy=g+(hash(f.seed+j*side)-.5)*19;c.lineTo(xx,yy);}c.stroke();c.globalAlpha=fade;c.lineWidth=2;c.strokeStyle='#ffdc8b';c.stroke();
   for(let j=1;j<5;j++){let xx=center+side*reach*j/5,yy=g+(hash(f.seed+j)-.5)*12;c.lineWidth=1.5;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+side*26,g+19);c.lineTo(xx+side*47,g+22);c.stroke();}}
  // Eleven distinct delayed vents spread outward rather than a single radial flash.
  for(let i=0;i<11;i++){
   const side=i-5,delay=Math.abs(side)*.095,age=t-delay;if(age<0)continue;const x=center+side*83+(hash(f.seed+i*9)-.5)*29,h=110+hash(f.seed+i)*190,life=clamp((1.8-age)/.65),grow=1-Math.pow(1-clamp(age/.22),3);
   if(!f.fired.has(i)){f.fired.add(i);this.spray(x,g-15,22,'#ffd07a',side*38,-380,350,1.15);}
   this.glow(c,x,g-50,170,150,'#ff793c',life*.8);
   // Basalt silhouettes and lit, serrated gold seams give the eruption weight.
   c.save();c.globalCompositeOperation='source-over';c.globalAlpha=life;const top=g-h*grow,lean=side*5+(hash(f.seed+i*31)-.5)*60,bw=34+hash(f.seed+i*23)*29;
   let grad=c.createLinearGradient(x,top,x,g);grad.addColorStop(0,'#473044');grad.addColorStop(.62,'#372332');grad.addColorStop(1,'#a44d38');c.fillStyle=grad;
   c.beginPath();c.moveTo(x-bw,g);c.lineTo(x-bw*.8,top+h*grow*.65);c.lineTo(x-bw*.43+lean*.5,top+h*grow*.31);c.lineTo(x-9+lean,top+25*grow);c.lineTo(x+8+lean,top);c.lineTo(x+bw*.5+lean*.5,top+h*grow*.42);c.lineTo(x+bw*.7,top+h*grow*.77);c.lineTo(x+bw,g);c.closePath();c.fill();
   c.fillStyle='#6a414c';c.beginPath();c.moveTo(x+8+lean,top);c.lineTo(x-9+lean,top+25*grow);c.lineTo(x-13,g-3);c.lineTo(x+12,top+h*grow*.62);c.closePath();c.fill();
   c.fillStyle='#281e30';c.beginPath();c.moveTo(x+8+lean,top);c.lineTo(x+12,top+h*grow*.62);c.lineTo(x+3,g);c.lineTo(x+bw,g);c.lineTo(x+bw*.7,top+h*grow*.77);c.closePath();c.fill();
   // Smaller oblique fragments break up the skyline and create a broad rocky foot.
   for(let k=0;k<3;k++){let bx=x+(k-1)*30, bh=(30+hash(f.seed+i*13+k)*85)*grow,bl=(hash(i*17+k+f.seed)-.5)*65;c.fillStyle=k%2?'#51313f':'#382333';c.beginPath();c.moveTo(bx-26,g);c.lineTo(bx+bl-9,g-bh+15*grow);c.lineTo(bx+bl+8,g-bh);c.lineTo(bx+27,g);c.closePath();c.fill();c.strokeStyle='#ed9a60';c.lineWidth=1;c.beginPath();c.moveTo(bx+bl+8,g-bh);c.lineTo(bx+5,g-8);c.stroke();}
   c.strokeStyle='#ffca79';c.lineWidth=2.2;c.globalAlpha=life*.9;c.beginPath();c.moveTo(x+8+lean,top);c.lineTo(x-2,top+h*grow*.42);c.lineTo(x+13,top+h*grow*.58);c.lineTo(x+3,g-8);c.stroke();c.restore();
   this.sheet(c,assets.Fire01,Math.max(0,age-.03),1.4,8,4,x,g-h*.45,125,h*1.2,life*.85);
   if(age<.65)this.bolt(c,x,g-6,x+lean,Math.max(top,g-210),f.seed+i,t,'#ffd783',1.3,life*.7,false);
   this.ring(c,x,g,40+age*36,8+age*4,'#ffc975',life*.6,1.5);
  }
  for(let j=0;j<5;j++){let age=t-j*.08;if(age>=0&&age<.65){c.globalAlpha=(1-age/.65)*.55;c.strokeStyle='#ffe6a0';c.lineWidth=2;c.beginPath();c.ellipse(center,g-80,100+age*600,70+age*150,0,Math.PI,TAU);c.stroke();}}
 }
 moon(c,f,assets){
  const t=f.t,g=this.ground,x=f.x+f.face*85,y=g-175-f.h,fade=clamp((2.3-t)/.65),r=(1-Math.pow(1-clamp(t/.32),3))*190;
  this.glow(c,x,y,650,570,'#a883ff',fade*.42);this.glow(c,x,g,1000,100,'#a48aff',fade*.55);
  // Transparent electric globe with broken orbital ribbons, not an opaque disk.
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
}
