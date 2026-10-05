import lightMap from './castle-lightmap.json';
type CastleWindow=typeof lightMap[number];
import {getDefaultFrameClock,type FrameClock} from '@/lib/animation-clock';
import {paintNightSky} from './night-sky';
import {newCastleFlight,sampleCastleFlight,type Flight} from '@/lib/castle-flight';
import {castleObjects,traceCastleObject,castleWindowLight,castleFacadeLight} from './castle-objects';
type Options={getLight:()=>number;clock?:FrameClock};
/** Static masonry is cached; room lighting updates at 6 Hz, water at 24 Hz. */
export function createPixelCastle(canvas:HTMLCanvasElement,{getLight,clock=getDefaultFrameClock()}:Options){
 const {requestFrame,cancelFrame}=clock;
 const ctx=canvas.getContext('2d')!;let w=1,h=1,raf=0,last=0,lastTime=0,time=0,next=38+Math.random()*15,flight:Flight|null=null,flightStart=0,disposed=false,lights:CastleWindow[]=[],allLights:CastleWindow[]=lightMap,illumination=getLight(),lightTime=-Infinity;
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),background=new Image(),rider=new Image(),lampAtlas=new Image();
 const base=document.createElement('canvas'),masonry=document.createElement('canvas'),lighting=document.createElement('canvas');
 const bridgeGlow=document.createElement('canvas');bridgeGlow.width=bridgeGlow.height=48;const gc=bridgeGlow.getContext('2d')!,gg=gc.createRadialGradient(24,24,1,24,24,24);gg.addColorStop(0,'#ffbd6355');gg.addColorStop(1,'#ffb45a00');gc.fillStyle=gg;gc.fillRect(0,0,48,48);
 background.decoding=rider.decoding=lampAtlas.decoding='async';background.src='/assets/scenery/hogwarts-night.webp';rider.src='/assets/scenery/castle-harry-v20-display.webp';lampAtlas.src='/assets/scenery/castle-light-atlas.png';
 const layout=()=>{const height=Math.min(h*.90,w/1.5);return {height,top:h-height,sx:w/1536,sy:height/1024}};
 function cache(){
  if(!background.complete||!background.naturalWidth)return;
  const {height,top,sx,sy}=layout();for(const c of [base,masonry,lighting]){c.width=w;c.height=h}
  const b=base.getContext('2d')!;b.imageSmoothingEnabled=false;b.fillStyle='#020d26';b.fillRect(0,0,w,h);b.drawImage(background,0,top,w,height);
  const g=b.createLinearGradient(0,Math.max(0,top-1),0,top+height*.13);g.addColorStop(0,'#020d26');g.addColorStop(1,'#020d2600');b.fillStyle=g;b.fillRect(0,Math.max(0,top-1),w,height*.13+1);
  const m=masonry.getContext('2d')!;m.imageSmoothingEnabled=false;m.translate(0,top);m.scale(sx,sy);for(const object of castleObjects){m.save();traceCastleObject(m,object);m.clip();m.drawImage(background,0,0,1536,1024);m.restore()}
  // Reserve the large, legible windows first, then distribute the rest spatially.
  // A modest 50% increase keeps the same four canvases and 6 Hz lighting budget.
  const budget=w<380?72:144;lights=[];let remaining=budget;
  castleObjects.forEach((object,index)=>{
   const group=allLights.filter(l=>l.objectId===object.id&&l.w*l.h>=9).sort((a,b)=>a.y-b.y||a.x-b.x),count=Math.min(group.length,Math.ceil(remaining/(castleObjects.length-index)));
   const landmarks=[...group].sort((a,b)=>b.w*b.h-a.w*a.h).slice(0,Math.floor(count*.4)),pool=group.filter(light=>!landmarks.includes(light)),fill=count-landmarks.length;
   lights.push(...landmarks);for(let i=0;i<fill;i++)lights.push(pool[Math.floor((i+.5)*pool.length/fill)]);remaining-=count;
  });
  lightTime=-Infinity;
 }
 function paintLights(){
  if(!lampAtlas.complete||!lampAtlas.naturalWidth||time-lightTime<1/6)return;lightTime=time;const l=lighting.getContext('2d')!,{top,sx,sy}=layout();l.setTransform(1,0,0,1,0,0);l.clearRect(0,0,w,h);l.save();l.translate(0,top);l.scale(sx,sy);const t=motion.matches?0:time;
  for(const light of lights){const bright=castleWindowLight(light,t),accent=castleFacadeLight(light.objectId,t);l.globalCompositeOperation='source-over';l.globalAlpha=1-bright;l.drawImage(lampAtlas,light.maskX,light.maskY,light.w,light.h,light.x,light.y,light.w,light.h);l.globalCompositeOperation='lighter';l.globalAlpha=bright*accent*.46;
   l.drawImage(lampAtlas,light.haloX,light.haloY,light.w+12,light.h+12,light.x-6,light.y-6,light.w+12,light.h+12);
  }
  l.globalCompositeOperation='lighter';l.globalAlpha=castleFacadeLight('stone-bridge',t);for(let i=0;i<8;i++)l.drawImage(bridgeGlow,615+i*21,527+i*3.5,48,66);
  // Reuse the tiny glow sprite for a softly breathing chapel facade, clipped to stone.
  l.save();traceCastleObject(l,castleObjects.find(object=>object.id==='waterside-chapel')!);l.clip();l.globalAlpha=castleFacadeLight('waterside-chapel',t)*.85;l.drawImage(bridgeGlow,1045,665,145,135);l.restore();l.restore();
 }
 function drawFlight(){if(!flight||!rider.complete||!rider.naturalWidth)return;const p=(time-flightStart)/flight.duration,a=sampleCastleFlight(flight,p-.035,w,h),snitch=sampleCastleFlight(flight,p+.06,w,h),sw=29,sh=sw*rider.naturalHeight/rider.naturalWidth;
  ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.angle*a.direction);ctx.scale(a.direction,1);ctx.drawImage(rider,-sw/2,-sh/2,sw,sh);ctx.restore();
  ctx.save();ctx.translate(snitch.x,snitch.y);ctx.fillStyle='#ffe89c';ctx.fillRect(-1,-1,2,2);ctx.scale(flight.direction,.58+Math.abs(Math.sin(time*22))*.7);ctx.fillStyle='#fff1ba';ctx.fillRect(-5,-1,3,1);ctx.fillRect(2,-1,3,1);ctx.restore();
 }
 function render(){
  ctx.imageSmoothingEnabled=false;if(!background.complete||!background.naturalWidth){ctx.fillStyle='#020d26';ctx.fillRect(0,0,w,h);return}
  const {top,sx,sy}=layout();ctx.drawImage(base,0,0);paintNightSky(ctx,w,h,time,illumination,true,undefined,motion.matches);drawFlight();ctx.drawImage(masonry,0,0);paintLights();ctx.drawImage(lighting,0,0);
  for(let y=784;y<934;y+=3){const wave=motion.matches?0:Math.sin(time*.72+y*.13)*(.55+(y-784)/120);ctx.drawImage(background,0,y,1536,3,wave,top+y*sy,w,Math.max(1,3*sy))}
  for(let i=0;i<4;i++){const x=((i*427+time*(i%2?3:-2.3))%1850+1850)%1850-160;ctx.globalAlpha=.04+Math.sin(time*.16+i)*.015;ctx.fillStyle='#89adcc';ctx.fillRect(x*sx,top+(809+i*25)*sy,(220+i*73)*sx,Math.max(1,sy*2))}ctx.globalAlpha=1;
  ctx.drawImage(background,0,934,1536,90,0,top+934*sy,w,90*sy);ctx.fillStyle=`rgba(0,5,18,${(1-illumination)*.32})`;ctx.fillRect(0,0,w,h);
 }
 function resize(width:number,height:number){w=Math.max(160,Math.min(960,Math.round(width/2)));h=Math.max(120,Math.round(height*w/Math.max(1,width)));canvas.width=w;canvas.height=h;cache();render()}
 function tick(now:number){raf=requestFrame(tick);if(document.hidden){last=lastTime=now;return}const interval=motion.matches?300:1000/24,elapsed=now-last;if(elapsed<interval)return;const dt=lastTime?Math.min(.1,(now-lastTime)/1000):0;lastTime=now;last=now-(elapsed%interval);if(!motion.matches){time+=dt;illumination+=(getLight()-illumination)*Math.min(1,dt*2.8);if(!flight&&time>=next){flight=newCastleFlight();flightStart=time}if(flight&&time>flightStart+flight.duration){flight=null;next=time+38+Math.random()*44}}else{flight=null;illumination=getLight()}render()}
 const loaded=()=>{if(disposed)return;lightTime=-Infinity;cache();render()};background.onload=loaded;rider.onload=()=>{if(!disposed)render()};lampAtlas.onload=loaded;loaded();raf=requestFrame(tick);
 return {resize,dispose(){disposed=true;cancelFrame(raf);background.onload=null;rider.onload=null;lampAtlas.onload=null}};
}
