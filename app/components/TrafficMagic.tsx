'use client';
import {useAnimationClock} from "@/app/components/AnimationScope";
import {useEffect,useRef,type MutableRefObject} from 'react';
import type {TrafficState} from '@/lib/desktop-scenery';
import {portalSequence,shieldGeometry,shieldSequence,sampleTrafficTrick} from '@/lib/cat-traffic';
const TAU=Math.PI*2;
  export function paintTrafficShield(ctx:CanvasRenderingContext2D,x:number,y:number,face:number,scale:number){ctx.save();ctx.translate(x,y);ctx.rotate(-face*.76);ctx.scale(scale,scale);ctx.shadowBlur=12;ctx.shadowColor='#ffd79555';
   for(const [rx,ry,color] of [[17,47,'#203e58'],[15.5,44,'#be554e'],[12.3,35,'#e6dfcb'],[9.2,26,'#b95348'],[6.7,19,'#345e7e']] as [number,number,string][]){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);ctx.fill();ctx.shadowBlur=0}
   ctx.save();ctx.scale(.37,1);ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?7:16;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fillStyle='#f7edcf';ctx.fill();ctx.restore();ctx.strokeStyle='#fff0c8a0';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(-1,-1,15,44,0,Math.PI,Math.PI*1.8);ctx.stroke();ctx.restore();
  }

export default function TrafficMagic({traffic,floor}:{traffic:MutableRefObject<TrafficState>;floor:MutableRefObject<number>}){
 const animationClock=useAnimationClock(),{requestFrame,cancelFrame}=animationClock;
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;let raf=0,painted=false,dpr=1,w=0,h=0;
  const resize=()=>{w=window.innerWidth;h=window.innerHeight;dpr=Math.min(2,devicePixelRatio||1);el.width=w*dpr;el.height=h*dpr};resize();window.addEventListener('resize',resize);
  function portal(x:number,y:number,age:number,scale:number,reverse=false,tall=1){if(!ctx)return;ctx.save();ctx.translate(x,y);ctx.scale(scale,scale*tall);ctx.fillStyle='#020612ef';ctx.beginPath();ctx.ellipse(0,0,15,43,-.08,0,TAU);ctx.fill();ctx.shadowColor='#ff8c27';ctx.shadowBlur=14;ctx.strokeStyle='#ffd793';ctx.lineWidth=2.3;ctx.beginPath();ctx.ellipse(0,0,18,46,-.08,0,TAU);ctx.stroke();ctx.shadowBlur=0;
   for(let i=0;i<84;i++){const a=i*2.39996+age*(reverse?-4.7:4.7),life=(age*1.7+i*.618)%1,r=1+life*.85,rx=19*r,ry=47*r,x=Math.cos(a)*rx,y=Math.sin(a)*ry;ctx.globalAlpha=(1-life)*.85;ctx.strokeStyle=i%4?'#ffa62c':'#fff3b3';ctx.lineWidth=i%5?1:1.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-Math.sin(a)*(2+life*8),y+Math.cos(a)*(4+life*10));ctx.stroke()}
   ctx.restore();
  }
  const tick=()=>{raf=requestFrame(tick);const t=traffic.current.trick;if(document.hidden)return;if(!t&&!painted)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);painted=!!t;el.dataset.kind=t?.kind||'';if(!t)return;
   const open=Math.min(1,t.elapsed/.17,(t.duration-t.elapsed)/.27),ease=Math.max(0,open)*Math.max(0,open)*(3-2*Math.max(0,open));
   if(t.kind==='portal'){const radius=Math.max(46,t.height/2+15),cy=floor.current-radius+3,sequence=portalSequence(t);if(sequence.entryOpen>0)portal(t.entry,cy,t.elapsed,sequence.entryOpen,false,radius/46);if(sequence.exitOpen>0)portal(t.exit,cy,t.elapsed,sequence.exitOpen,true,radius/46)}else{const face=-t.direction,g=shieldGeometry(t.catX,t.direction),sequence=shieldSequence(t);paintTrafficShield(ctx,g.cx,floor.current+g.cy,face,ease);if(t.elapsed>=sequence.approach&&t.elapsed<sequence.launch+.16){const pose=sampleTrafficTrick(t),k=(t.elapsed-sequence.approach)/sequence.ramp;ctx.globalAlpha=.7;ctx.strokeStyle='#ffdf8b';for(let i=0;i<7;i++){const a=i*.45-2.9,x=pose.frontX??g.tipX,y=floor.current-(pose.frontLift??g.rise);ctx.beginPath();ctx.moveTo(x+Math.cos(a)*k*10,y+Math.sin(a)*k*10);ctx.lineTo(x+Math.cos(a)*k*27,y+Math.sin(a)*k*27);ctx.stroke()}ctx.globalAlpha=1}}
  };raf=requestFrame(tick);return()=>{cancelFrame(raf);window.removeEventListener('resize',resize)};
 },[floor,traffic]);
 return <canvas ref={canvas} className="traffic-magic" aria-hidden="true"/>;
}
