'use client';
import {useAnimationClock} from "@/app/components/AnimationScope";
import {useEffect,useRef,type MutableRefObject} from 'react';
import {harborLayout,sampleHarborVoyage,type HarborVoyage,type VoyageFrame} from '@/lib/harbor-voyage';
import {drawHarborSkiff} from './scenery/harbor-skiff';
export function paintHarborBoat(ctx:CanvasRenderingContext2D,frame:VoyageFrame,time:number,cat:HTMLImageElement|null,fish:HTMLImageElement|null){
 const b=frame.boat,s=b.width/42;
 if(frame.moving){ctx.strokeStyle='#a5d9d54a';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(b.x+b.width*.4,b.y+15+i*7,40+i*13,2,0,0,Math.PI);ctx.stroke()}}
 drawHarborSkiff(ctx,b);
 if(frame.aboard&&frame.cat){
  const p=frame.cat,seatHeight=61,seatWidth=cat?.naturalWidth&&cat.naturalHeight?cat.naturalWidth/cat.naturalHeight*seatHeight:48;
  if(cat?.complete&&cat.naturalWidth)ctx.drawImage(cat,p.x-seatWidth/2,p.y-seatHeight,seatWidth,seatHeight);
  // The pole bends from the paws; the float dips before the line is reeled in.
  if(frame.cast>0){
   const arm={x:p.x+12,y:p.y-29},angle=-.9+frame.cast*.42-frame.reel*.95,tip={x:arm.x+Math.cos(angle)*69,y:arm.y+Math.sin(angle)*69};
   ctx.lineWidth=3;ctx.strokeStyle='#402b21';ctx.beginPath();ctx.moveTo(arm.x-6,arm.y+7);ctx.quadraticCurveTo(arm.x+25,arm.y-28,tip.x,tip.y);ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle='#d5ae72';ctx.stroke();
   const atWater={x:p.x+103,y:b.y+34+Math.sin(time*2)*1.2},hook={x:atWater.x+(tip.x-atWater.x)*frame.reel,y:atWater.y+(tip.y+20-atWater.y)*frame.reel};
   if(frame.phase.startsWith('cast')){hook.x=tip.x+(atWater.x-tip.x)*frame.cast;hook.y=tip.y+12+(atWater.y-tip.y-12)*frame.cast}
   const nibble=frame.phase.startsWith('wait')&&frame.progress>.78?Math.sin(time*15)*2.5:0;hook.y+=nibble;
   ctx.strokeStyle='#d2e3d099';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tip.x,tip.y);ctx.quadraticCurveTo(tip.x+8,hook.y*.55+tip.y*.45,hook.x,hook.y);ctx.stroke();
   ctx.fillStyle='#fae1b1';ctx.fillRect(hook.x-2,hook.y-4,4,3);ctx.fillStyle='#ed8981';ctx.fillRect(hook.x-2,hook.y-1,4,4);
   if(frame.reel<.12){ctx.strokeStyle='#b7dfd777';ctx.beginPath();ctx.ellipse(hook.x,atWater.y+3,9+Math.sin(time*3)*2,2.5,0,0,Math.PI*2);ctx.stroke()}
   if(frame.caught&&fish?.complete&&fish.naturalWidth&&frame.reel>.03){ctx.save();ctx.translate(hook.x,hook.y+9);ctx.rotate(-.6+Math.sin(time*12)*.3);ctx.drawImage(fish,-14,-6,28,14);ctx.restore()}
  }
 }
 drawHarborSkiff(ctx,b,true);
 // A tiny catch in the stern appears after reeling, without a speech bubble.
 if(frame.fishCount>0&&fish?.complete&&fish.naturalWidth)ctx.drawImage(fish,b.x+10*s,b.y-7*s,12*s,6*s);
}
export default function HarborBoat({floor,voyage}:{floor:MutableRefObject<number>;voyage:MutableRefObject<HarborVoyage|null>}){
 const animationClock=useAnimationClock(),{requestFrame,cancelFrame}=animationClock;
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const c=canvas.current,ctx=c?.getContext('2d');if(!c||!ctx)return;const cat=new Image(),fish=new Image();cat.src='/assets/scenery/cat-sitting.webp';fish.src='/assets/scenery/caught-fish.webp';const reduced=matchMedia('(prefers-reduced-motion: reduce)');let raf=0,last=0,t=0,width=0,height=0,dpr=1;
  const draw=(now:number)=>{raf=requestFrame(draw);if(now-last<1000/30)return;const dt=Math.min(.08,(now-last)/1000||0);last=now;if(document.hidden)return;if(!reduced.matches)t+=dt;const w=window.innerWidth,h=floor.current;if(width!==w||height!==h){width=w;height=h;dpr=Math.min(devicePixelRatio||1,w<760?1:1.5);c.width=Math.ceil(w*dpr);c.height=Math.ceil(h*dpr);c.style.width=w+'px';c.style.height=h+'px'}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=false;paintHarborBoat(ctx,sampleHarborVoyage(voyage.current,harborLayout(w,h),t),t,cat,fish)};raf=requestFrame(draw);return()=>cancelFrame(raf);
 },[floor,voyage]);
 return <canvas ref={canvas} className="harbor-voyage-canvas" aria-hidden="true"/>
}
