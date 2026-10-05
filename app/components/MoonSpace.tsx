'use client';
import {useAnimationClock} from "@/app/components/AnimationScope";
import {useEffect,useRef} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import MoonCorner from './MoonCorner';
import {moonPhases} from '@/lib/desktop-scenery';

function LunarSky(){
 const animationClock=useAnimationClock(),{requestFrame,cancelFrame}=animationClock;
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;
  let w=1000,h=700,dpr=1,raf=0,last=0,t=0,px=0,py=0,tx=0,ty=0;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'),stars=Array.from({length:230},(_,i)=>({x:((i*0.61803398875)%1),y:((i*0.41421356237)%1),z:.3+(i%11)/13,r:i%17===0?1.6:.5+(i%3)*.3}));
  const wishes:{x:number;y:number;age:number}[]=[];
  const resize=()=>{w=el.clientWidth;h=el.clientHeight;dpr=Math.min(2,devicePixelRatio||1);el.width=w*dpr;el.height=h*dpr};
  const observer=new ResizeObserver(resize);observer.observe(el);resize();
  const move=(e:PointerEvent)=>{const r=el.getBoundingClientRect();tx=(e.clientX-r.left-w/2)/w;ty=(e.clientY-r.top-h/2)/h};
  const leave=()=>{tx=ty=0};
  const wish=(e:PointerEvent)=>{const r=el.getBoundingClientRect();wishes.push({x:e.clientX-r.left,y:e.clientY-r.top,age:0});if(wishes.length>12)wishes.shift()};
  el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);el.addEventListener('pointerdown',wish);
  const draw=(now:number)=>{raf=requestFrame(draw);const dt=Math.min(.04,(now-last)/1000||0);last=now;if(document.hidden)return;t+=reduce.matches?0:dt;px+=(tx-px)*.035;py+=(ty-py)*.035;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
   const glow=ctx.createRadialGradient(w*.5,h*.46,10,w*.5,h*.46,Math.max(w,h)*.65);glow.addColorStop(0,'#123047');glow.addColorStop(.45,'#08182c');glow.addColorStop(1,'#020815');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
   for(const s of stars){const x=s.x*w+(reduce.matches?0:px*24*s.z),y=s.y*h+(reduce.matches?0:py*18*s.z);ctx.globalAlpha=.3+s.z*.5+(reduce.matches?0:Math.sin(t*.65+s.x*20)*.12);ctx.fillStyle=s.r>1?'#f1deac':'#94bdd5';ctx.fillRect(x,y,s.r,s.r);if(s.r>1){ctx.globalAlpha*=.23;ctx.fillRect(x-3,y+.5,7,1);ctx.fillRect(x+.5,y-3,1,7)}}
   ctx.globalAlpha=1;ctx.strokeStyle='#91bfd018';ctx.lineWidth=1;
   for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(w/2,h*.47,Math.min(w*.44,h*.55)+i*36,Math.min(w*.15,h*.15)+i*19,-.24,0,Math.PI*2);ctx.stroke()}
   for(let i=wishes.length-1;i>=0;i--){const s=wishes[i];s.age+=dt;const a=Math.max(0,1-s.age/4);if(!a){wishes.splice(i,1);continue}ctx.globalAlpha=a;ctx.strokeStyle='#f3d79e';ctx.beginPath();ctx.arc(s.x,s.y,3+(reduce.matches?0:s.age*18),0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff3c9';ctx.fillRect(s.x-1.5,s.y-1.5,3,3)}ctx.globalAlpha=1;
  };raf=requestFrame(draw);
  return()=>{cancelFrame(raf);observer.disconnect();el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave);el.removeEventListener('pointerdown',wish)};
 },[]);
 return <canvas ref={canvas} className="lunar-sky" aria-hidden="true"/>;
}
export default function MoonSpace({open,onChange,phase,onPhase}:{open:boolean;onChange:(v:boolean)=>void;phase:number;onPhase:(v:number)=>void}){
 return <Dialog open={open} onOpenChange={onChange}><DialogContent className="lunar-space" showCloseButton={false}>
  <LunarSky/><header className="lunar-header"><div><span>CTY STUDIO / SECRET ROOM</span><DialogTitle>月之空间</DialogTitle></div><button autoFocus onClick={()=>onChange(false)}>返回桌面 <span>Esc</span></button></header>
  <DialogDescription className="lunar-description">月亮的另一边，也有一盏灯。</DialogDescription>
  <div className="lunar-observatory"><MoonCorner phase={phase} onChange={onPhase} width={1200} height={900}/></div>
  <footer className="lunar-footer"><div><span>MOON ARCHIVE</span><b>{String(phase+1).padStart(2,'0')} / 08 <i>{moonPhases[phase].name}</i></b></div><p>拨动月相 · 轻点夜空，留下一颗星</p><span className="lunar-coordinates">CTY / MOON<br/>静静待一会儿。</span></footer>
 </DialogContent></Dialog>;
}
