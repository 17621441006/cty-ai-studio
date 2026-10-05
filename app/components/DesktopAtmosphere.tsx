'use client';
import {useEffect,useRef,type ComponentProps} from 'react';
import DesktopCompanion from './DesktopCompanion';
import {paintNightSky} from './scenery/night-sky';
import type {WallpaperId} from '@/lib/desktop-scenery';
export default function DesktopAtmosphere({wallpaper,light,...props}:ComponentProps<typeof DesktopCompanion>&{wallpaper:WallpaperId;light:number}){
 const canvas=useRef<HTMLCanvasElement>(null),level=useRef(light);level.current=light;
 useEffect(()=>{const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx||wallpaper==='castle'||wallpaper==='shanghai')return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');let raf=0,last=0,time=0,w=0,h=0,dpr=1;
  const resize=()=>{w=window.innerWidth;h=window.innerHeight;dpr=Math.min(2,devicePixelRatio||1);el.width=w*dpr;el.height=h*dpr;};resize();window.addEventListener('resize',resize);
  const tick=(now:number)=>{raf=requestAnimationFrame(tick);if(document.hidden){last=now;return}if(now-last<(motion.matches?500:1000/24))return;const dt=last?Math.min(.1,(now-last)/1000):0;last=now;if(!motion.matches)time+=dt;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);paintNightSky(ctx,w,h,time,level.current,false,undefined,motion.matches);};raf=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);ctx.clearRect(0,0,el.width,el.height)};
 },[wallpaper]);
 return <><canvas ref={canvas} className="ambient-night-sky" style={{display:wallpaper==='castle'||wallpaper==='shanghai'?'none':undefined}} aria-hidden="true"/><DesktopCompanion {...props} wallpaper={wallpaper}/></>;
}
