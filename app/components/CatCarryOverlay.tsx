'use client';
import {useEffect,useRef,type MutableRefObject} from 'react';
import {Backpack} from 'lucide-react';
import Icon from './DesktopIcon';
import {getApp,type AppId} from '@/lib/desktop-apps';
import type {CarryFrame} from '@/lib/cat-carry';
export default function CatCarryOverlay({id,frame}:{id:AppId;frame:MutableRefObject<CarryFrame|null>}){
 const canvas=useRef<HTMLCanvasElement>(null),bag=useRef<HTMLDivElement>(null),icon=useRef<HTMLDivElement>(null);
 useEffect(()=>{const c=canvas.current,ctx=c?.getContext('2d');if(!c||!ctx)return;let raf=0,w=0,h=0,dpr=1;
  const size=()=>{w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);c.width=w*dpr;c.height=h*dpr};size();addEventListener('resize',size);
  const tick=()=>{raf=requestAnimationFrame(tick);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const f=frame.current;if(!f)return;
   const lasso=['cast','reel','deposit'].includes(f.phase);
   if(lasso){ctx.lineCap='round';for(const [width,color] of [[3.6,'#182534'],[1.8,'#ddc28e']] as const){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(f.hand.x,f.hand.y);ctx.quadraticCurveTo((f.hand.x+f.loop.x)/2,Math.max(f.hand.y,f.loop.y)+18,f.loop.x,f.loop.y);ctx.stroke();ctx.beginPath();ctx.ellipse(f.loop.x,f.loop.y,f.loopSize,f.loopSize*.65,-.35,0,Math.PI*2);ctx.stroke();}}
   if(bag.current){bag.current.style.transform=`translate(${f.bag.x-19}px,${f.bag.y-3}px)`;bag.current.style.opacity=f.phase==='approach'?'0':'1';}
   if(icon.current){icon.current.style.transform=`translate(${f.icon.x-25}px,${f.icon.y-25}px) scale(${f.iconScale})`;icon.current.style.opacity=f.caught?'1':'0';}
  };raf=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf);removeEventListener('resize',size)};
 },[frame]);
 return <div className="cat-carry-layer" aria-hidden="true"><canvas ref={canvas}/><div ref={icon} className="lasso-cargo"><Icon n={getApp(id).icon} normalized/></div><div ref={bag} className="cat-cargo-bag"><Backpack size={38} strokeWidth={1.4}/></div></div>;
}
