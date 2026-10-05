'use client';
import {useEffect,useRef,type MutableRefObject} from 'react';
import {sampleCastleEncounter,sampleDementor,smooth,FIRE_LAUNCH_START,FIRE_BURST_AT,fireCelebrationAnchor,fireBurstCenter,type CastleEncounter} from '@/lib/castle-encounters';
import {catGroundLevel} from '@/lib/desktop-scenery';
import {paintPhoenixRig} from '@/lib/phoenix-rig';
const TAU=Math.PI*2;
export type CharacterArt={harry:HTMLImageElement;dumbledore:HTMLImageElement;voldemort:HTMLImageElement;dementor:HTMLImageElement;clap:HTMLImageElement;phoenix:HTMLImageElement};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const glowSprites=new Map<string,HTMLCanvasElement>();
function glow(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,color:string,strength:number){
 if(strength<=0||r<=0)return;let sprite=glowSprites.get(color);if(!sprite){sprite=document.createElement('canvas');sprite.width=sprite.height=96;const c=sprite.getContext('2d')!,g=c.createRadialGradient(48,48,0,48,48,48);g.addColorStop(0,color);g.addColorStop(1,'#00000000');c.fillStyle=g;c.fillRect(0,0,96,96);glowSprites.set(color,sprite)}
 ctx.save();ctx.globalAlpha=strength;ctx.drawImage(sprite,x-r,y-r,r*2,r*2);ctx.restore();
}
const fireRays=Array.from({length:7},(_,k)=>Array.from({length:56},(_,j)=>{const a=j*2.399+k*.7,n=Math.sin(j*127.1+k*13.7)*43758.5;return {cos:Math.cos(a),sin:Math.sin(a),variation:.36+.64*(n-Math.floor(n)),group:j%9===0?0:j%3?1:2}}));
function character(ctx:CanvasRenderingContext2D,img:HTMLImageElement,x:number,y:number,height:number,face:number,walk:number,time:number,alpha=1){
 if(!img.complete||!img.naturalWidth)return;const width=height*img.naturalWidth/img.naturalHeight;
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(face,1);ctx.imageSmoothingEnabled=false;
 const step=Math.sin(walk*.14),bob=walk?Math.abs(step)*1.5:0;
 // Independently sway the lower robe; the face and upper silhouette remain stable.
 const upper=.75,bottom=walk?.93:1,hem=img.naturalHeight*(bottom-upper);ctx.drawImage(img,0,0,img.naturalWidth,img.naturalHeight*upper,-width/2,-height-bob,width,height*upper);
 for(let i=0;i<5;i++){const band=hem/5;ctx.drawImage(img,0,img.naturalHeight*upper+i*band,img.naturalWidth,band,-width/2+Math.sin(time*3+i*.35)*(i+1)*.33*(walk?1:.25),-height*(1-upper)+i*height*(bottom-upper)/5-bob,width,height*(bottom-upper)/5+.4)}if(walk)for(let i=0;i<2;i++){const step=Math.sin(walk*.14+i*Math.PI);ctx.drawImage(img,img.naturalWidth*i/2,img.naturalHeight*.93,img.naturalWidth/2,img.naturalHeight*.07,-width/2+i*width/2+step*1.8,-height*.07-Math.max(0,step)*2,width/2,height*.07)}ctx.restore();
}
function wand(ctx:CanvasRenderingContext2D,x:number,y:number,face:number,color:string,lit:boolean){ctx.strokeStyle='#a78964';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-face*15,y+11);ctx.lineTo(x,y);ctx.stroke();if(lit){glow(ctx,x,y,17,color,.85);ctx.fillStyle='#fff8d9';ctx.fillRect(x-1.5,y-1.5,3,3)}}
function beam(ctx:CanvasRenderingContext2D,from:{x:number;y:number},to:{x:number;y:number},time:number,color:string,amount:number){
 if(amount<=0)return;const x=from.x+(to.x-from.x)*amount,y=from.y+(to.y-from.y)*amount;
 ctx.save();ctx.lineJoin='round';for(const [lineWidth,alpha] of [[10,.10],[5,.25],[1.7,1]]){ctx.lineWidth=lineWidth;ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=lineWidth===1.7?9:0;ctx.beginPath();ctx.moveTo(from.x,from.y);for(let i=1;i<=18;i++){const p=i/18;ctx.lineTo(from.x+(x-from.x)*p,from.y+(y-from.y)*p+Math.sin(i*2.7+time*23)*Math.sin(p*Math.PI)*2.4)}ctx.stroke()}ctx.restore();
}
function paintFireCelebration(ctx:CanvasRenderingContext2D,e:CastleEncounter,w:number,ground:number,art:CharacterArt,detail=1){
 const f=sampleCastleEncounter(e,w,ground),q=f.q,d=e.direction,scale=w<500?.88:1;
 const wx=f.x+d*26,wy=ground-100*scale,anchor=fireCelebrationAnchor(f.x,d,w,ground),skyY=anchor.y,skyX=anchor.x;
 const personAlpha=1-f.phoenix;
 if(f.clap<1)character(ctx,art.dumbledore,f.x,ground,112*scale,d,f.walking?e.elapsed*115:0,e.elapsed,personAlpha*(1-f.clap));
 if(f.clap>0)character(ctx,art.clap,f.x,ground,151*scale,d,0,e.elapsed,personAlpha*f.clap);
 if(f.flame>0){
  glow(ctx,wx,ground-2,125*scale,'#ff852e',f.flame*.13);
  const flight=1-Math.pow(1-clamp((q-FIRE_LAUNCH_START)/(FIRE_BURST_AT-FIRE_LAUNCH_START)),2),hy=wy+(skyY-wy)*flight,hx=wx+(skyX-wx)*flight;
  // Braided fire rises continuously from the wand to the high sky.
  if(q<FIRE_BURST_AT+.65){const fade=1-smooth((q-FIRE_BURST_AT)/.65);ctx.save();ctx.globalCompositeOperation='lighter';
   for(let arm=0;arm<3;arm++){ctx.beginPath();for(let j=0;j<80;j++){const p=j/79,x=wx+(hx-wx)*p+Math.sin(p*19-q*5+arm*2.094)*16*Math.sin(p*Math.PI),y=wy+(hy-wy)*p; j?ctx.lineTo(x,y):ctx.moveTo(x,y)}
    ctx.strokeStyle=arm===0?'#ffe39a':'#f97824';ctx.lineWidth=arm===0?2.4:5;ctx.globalAlpha=f.flame*fade*(arm===0?.9:.29);ctx.stroke();}
   glow(ctx,hx,hy,34,'#ffac37',q<FIRE_BURST_AT?fade*.75:0);
   for(let i=0;i<145;i++){const p=(q*.64+i*.618)%1,x=wx+(hx-wx)*p+Math.sin(i*2.4+q*2)*p*26,y=wy+(hy-wy)*p+Math.sin(i)*7;
    ctx.globalAlpha=Math.sin(p*Math.PI)*f.flame*fade;ctx.fillStyle=i%4?'#ffc25f':'#fff1bc';ctx.fillRect(x,y,i%8?1.5:3,3+3*p);}
   ctx.restore();
  }
  // Overlapping high-altitude chrysanthemum bursts with falling gold embers.
  for(let k=0;k<7;k++){const age=q-(FIRE_BURST_AT+k*.55);if(age<0||age>3.65)continue;
   const p=age/3.65,spread=(1-Math.exp(-age*1.7))*Math.min(w*.24,153)*(k%3===0?1.13:.86),fade=Math.pow(1-p,1.3),center=fireBurstCenter(k,anchor,w),bx=center.x,by=center.y;
   glow(ctx,bx,by,Math.max(4,spread*1.45),k%2?'#fa9936':'#f86728',fade*.16);
   if(age<.18)glow(ctx,bx,by,18+age*90,'#fff4d4',(1-age/.18)*.85);
   ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
   // Same seven blooms with a bounded ray budget, batched by color; no per-ray blur or gradient.
   const count=Math.max(24,Math.round((w<500?32:56)*detail)),rays=fireRays[k].slice(0,count).map(ray=>{const rad=spread*ray.variation;return {...ray,rad,x:bx+ray.cos*rad,y:by+ray.sin*rad*.88+age*age*13}}),tail=.30+.26*(1-p);
   for(let color=0;color<3;color++){
    const group=rays.filter(ray=>ray.group===color);ctx.strokeStyle=['#efa1d8','#ef862a','#ffd282'][color];ctx.globalAlpha=fade*.34;ctx.lineWidth=color===0?2.2:1.3;ctx.beginPath();
    for(const ray of group){const tx=ray.x-ray.cos*ray.rad*tail,ty=ray.y-ray.sin*ray.rad*tail-age*9;ctx.moveTo(tx,ty);ctx.quadraticCurveTo((tx+ray.x)/2,(ty+ray.y)/2-age*4,ray.x,ray.y)}ctx.stroke();
    ctx.strokeStyle=['#ffd0ec','#ffd282','#fff4d4'][color];ctx.globalAlpha=fade*.86;ctx.lineWidth=color===0?1.8:1.1;ctx.beginPath();for(const ray of group){ctx.moveTo(ray.x-ray.cos*ray.rad*tail*.4,ray.y-ray.sin*ray.rad*tail*.4-age*3);ctx.lineTo(ray.x,ray.y)}ctx.stroke();
    ctx.fillStyle=ctx.strokeStyle;for(const ray of group)ctx.fillRect(ray.x-.8,ray.y-.8,1.6,1.6);
   }
   ctx.fillStyle='#ffd080';for(let tail=1;tail<4;tail++){ctx.globalAlpha=fade*(1-tail*.24)*.48;ctx.beginPath();for(const ray of rays)ctx.rect(ray.x-ray.cos*tail*age*3,ray.y-ray.sin*tail*age*3+tail*age*2,1,1);ctx.fill()}
   ctx.restore();
  }
 }
 if(f.phoenix>0){
  const fly=Math.max(0,q-8.7),p=Math.min(1,fly/5.4),x=f.x+d*(p*w*.29+Math.sin(p*6)*25),y=ground-92-p*(ground+80);
  const transform=Math.sin(Math.min(1,(q-8.1)/1.0)*Math.PI);
  glow(ctx,f.x,ground-89,100*scale,'#ffc260',transform*.75);
  glow(ctx,x,y,75,'#e9631b',f.phoenix*.32*(1-smooth((p-.85)/.15)));
  for(let j=0;j<65;j++){const age=(q*1.1+j*.618)%1,a=j*2.4,rad=age*(40+transform*80);ctx.globalAlpha=(1-age)*f.phoenix*.8*(1-p*.7);ctx.fillStyle=j%4?'#ffad41':'#ffebae';ctx.fillRect(x-d*age*55+Math.cos(a)*rad*.3,y+age*100+Math.sin(a)*rad*.2,1.5,3)}
  const img=art.phoenix;if(img.complete&&img.naturalWidth){const size=130*scale,height=size*img.naturalHeight/img.naturalWidth;ctx.save();ctx.globalAlpha=f.phoenix*(1-smooth((p-.90)/.1));ctx.translate(x,y);ctx.rotate(d*-.12);ctx.scale(d,1);ctx.translate(-size/2,-height/2);paintPhoenixRig(ctx,img,size,fly);ctx.restore();}
  ctx.globalAlpha=1;
 }
}
function paintPatronus(ctx:CanvasRenderingContext2D,e:CastleEncounter,w:number,ground:number){
 const f=sampleCastleEncounter(e,w,ground),cx=e.catX,catGround=e.catFootY??ground,cy=catGround-39;
 if(f.patronus<=0)return;
 ctx.save();ctx.globalCompositeOperation='lighter';
 glow(ctx,cx,cy,92,'#d6f5ff',f.patronus*.38);glow(ctx,cx,catGround-2,145,'#a4d3ef',f.patronus*.16);
 for(let i=0;i<5;i++){
  const age=f.q-i*.48;if(age<0||age>3.9)continue;const p=age/3.9,r=18+p*Math.min(600,w*1.05),alpha=(1-p)*f.patronus;
  ctx.save();ctx.translate(cx,cy);ctx.scale(1,.76);ctx.globalAlpha=alpha;
  // Broad feathered shells, with no hard ring outline.
  const g=ctx.createRadialGradient(0,0,r*.35,0,0,r*1.14);g.addColorStop(0,'#a1d1f000');g.addColorStop(.40,'#a1d1f003');g.addColorStop(.70,'#c7edff25');g.addColorStop(.83,'#f2fcff40');g.addColorStop(1,'#e6f6ff00');ctx.fillStyle=g;ctx.fillRect(-r*1.15,-r*1.15,r*2.3,r*2.3);ctx.restore();
  for(let j=0;j<46;j++){const a=j*2.399+i*.7,rad=r*(.68+(j%7)*.065),x=cx+Math.cos(a)*rad,y=cy+Math.sin(a)*rad*.76;ctx.globalAlpha=alpha*(.25+.45*Math.sin(e.elapsed*2+j)**2);ctx.fillStyle='#e0f4ff';ctx.fillRect(x,y,j%11?1:2,j%11?1:2);}
 }
 ctx.restore();
}
export function paintCastleEncounter(ctx:CanvasRenderingContext2D,e:CastleEncounter,w:number,floor:number,art:CharacterArt,detail=1){
 const ground=catGroundLevel(floor),f=sampleCastleEncounter(e,w,ground),t=e.elapsed,d=e.direction,small=w<500,scale=small?.88:1;
 ctx.save();ctx.imageSmoothingEnabled=false;
 if(e.kind==='harry'){
  const img=art.harry,sw=(small?126:154),sh=sw*img.naturalHeight/Math.max(1,img.naturalWidth),tilt=Math.cos(t*1.6+e.seed)*.08;
  if(img.complete&&img.naturalWidth){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(tilt*d);ctx.scale(d,1);ctx.drawImage(img,-sw/2,-sh/2,sw,sh);ctx.restore()}
  const sx=f.x+d*(sw*.66+Math.sin(t*4)*9),sy=f.y-12+Math.sin(t*6)*9;glow(ctx,sx,sy,15,'#ffd670',.55);ctx.fillStyle='#e8c052';ctx.fillRect(sx-3,sy-3,6,6);ctx.fillStyle='#fff2af';ctx.fillRect(sx-1,sy-2,2,2);ctx.strokeStyle='#f8efd4';ctx.lineWidth=2;const flap=3+Math.abs(Math.sin(t*25))*7;ctx.beginPath();ctx.moveTo(sx-3,sy);ctx.lineTo(sx-11,sy-flap);ctx.moveTo(sx+3,sy);ctx.lineTo(sx+11,sy-flap);ctx.stroke();
  for(let i=0;i<14;i++){ctx.globalAlpha=(1-i/14)*.35;ctx.fillStyle='#e6c982';ctx.fillRect(sx-d*i*5,sy+Math.sin(t*6-i*.3)*3,1.2,1.2)}ctx.globalAlpha=1;
 }else if(e.kind==='dumbledore'){
  paintFireCelebration(ctx,e,w,ground,art,detail);
 }else if(e.kind==='duel'){
  const fleeing=f.leaving>0,face=fleeing?-d:d;character(ctx,art.voldemort,f.x,ground,98*scale,face,f.walking?t*(fleeing?175:68):0,t,1-smooth((f.q-6)/.8));
  const from={x:f.x+d*26*scale,y:ground-64*scale},cat={x:e.catX-d*41.5,y:ground-35},collision={x:(from.x+cat.x)*.5,y:(from.y+cat.y)*.5};
  if(f.q>0&&!fleeing)wand(ctx,from.x,from.y,d,'#79e786',f.green>0);
  if(f.green>0){const target=f.counter>0?collision:cat;beam(ctx,from,target,t,'#50d997',f.green)}
  if(f.counter>0)beam(ctx,cat,collision,t+.4,'#ff831c',f.counter);
  if(f.clash>0){glow(ctx,collision.x,collision.y,27+Math.sin(t*9)*3,'#fff0ba',f.clash*.63);for(let i=0;i<27;i++){const p=(t*1.7+i*.618)%1,a=i*2.4;ctx.globalAlpha=(1-p)*f.clash;ctx.fillStyle=i%2?'#c9f2ad':'#f7c081';ctx.fillRect(collision.x+Math.cos(a)*p*47,collision.y+Math.sin(a)*p*32+p*p*12,2,2)}ctx.globalAlpha=1;}
  if(f.q>3.6&&f.q<4.5){const p=clamp((f.q-3.6)/.9);glow(ctx,collision.x+(from.x-collision.x)*p,collision.y+(from.y-collision.y)*p,24,'#ffdcb3',Math.sin(p*Math.PI)*.8)}
  if(fleeing)for(let i=0;i<25;i++){const p=(t+i*.067)%1;glow(ctx,f.x+d*p*45+Math.sin(i)*14,ground-28-p*78,5+p*10,'#8199ad',.11*(1-p))}
 }else{
  for(let i=0;i<3;i++){
   const p=sampleDementor(e,w,ground,i),img=art.dementor,height=103*scale,width=height*img.naturalWidth/Math.max(1,img.naturalHeight);
   glow(ctx,p.x,p.y-30,48,'#4c7385',.09*p.alpha);
   if(img.complete&&img.naturalWidth){ctx.save();ctx.globalAlpha=p.alpha;ctx.translate(p.x,p.y-height*.5);ctx.rotate(p.tilt);ctx.scale(p.side,1);ctx.drawImage(img,-width/2,-height/2,width,height);ctx.restore();}
  }
  paintPatronus(ctx,e,w,ground);
 }
 ctx.restore();
}
export default function CastleVisitors({floor,encounter}:{floor:MutableRefObject<number>;encounter:MutableRefObject<CastleEncounter|null>}){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;let raf=0,w=0,h=0,dpr=1,painted=false,detail=1,cost=0;
  const art={} as CharacterArt;for(const [name,file] of Object.entries({harry:'castle-harry-v20.png',dumbledore:'castle-dumbledore-v20.png',voldemort:'castle-voldemort-v20.png',dementor:'castle-dementor-v22.png',clap:'castle-clap-v22.png',phoenix:'castle-phoenix-v22.png'})){const img=new Image();img.decoding='async';img.src='/assets/scenery/'+file;art[name as keyof CharacterArt]=img;}
  const resize=()=>{w=window.innerWidth;h=window.innerHeight;dpr=1;el.width=w*dpr;el.height=h*dpr;encounter.current=null;painted=true;};resize();window.addEventListener('resize',resize);
  const tick=(now:number)=>{raf=requestAnimationFrame(tick);if(document.hidden)return;const e=encounter.current;if(!e&&!painted)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);painted=!!e;if(e){const start=performance.now();paintCastleEncounter(ctx,e,w,floor.current,art,detail);cost=cost*.92+(performance.now()-start)*.08;if(cost>7&&detail>.45){detail=Math.max(.45,detail-.1);cost=0}}else{detail=1;cost=0}};raf=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize)};
 },[floor,encounter]);
 return <canvas className="castle-visitors" ref={canvas} aria-hidden="true"/>;
}
