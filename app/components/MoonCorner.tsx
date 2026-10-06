'use client';
import {useEffect,useRef} from 'react';
import {moonLayout} from '@/lib/scene-layout';
import {moonPhases,moonIsLit} from '@/lib/desktop-scenery';
export default function MoonCorner({phase,onChange,width,height,compact=false,onEnter}:{onEnter?:()=>void;compact?:boolean;phase:number;onChange:(phase:number)=>void;width:number;height:number}){
 const lastTap=useRef(0),touchStart=useRef({x:0,y:0});
 const canvas=useRef<HTMLCanvasElement>(null),previous=useRef({light:1,side:1});
 const choice=moonPhases[phase],placement=moonLayout(width,height);
 useEffect(()=>{const ctx=canvas.current?.getContext('2d');if(!ctx)return;let raf=0;const start=performance.now(),from=previous.current,motion=matchMedia('(prefers-reduced-motion: reduce)');
  const draw=(now:number)=>{const p=motion.matches?1:Math.min(1,(now-start)/560),ease=p*p*(3-2*p),light=from.light+(choice.light-from.light)*ease;previous.current={light,side:choice.side};ctx.clearRect(0,0,512,512);ctx.save();ctx.beginPath();ctx.arc(256,256,255,0,Math.PI*2);ctx.clip();for(let y=0;y<512;y+=6)for(let x=0;x<512;x+=6){const nx=(x+3-256)/256,ny=(y+3-256)/256;if(nx*nx+ny*ny>1.03)continue;if(!moonIsLit(nx,ny,light,choice.side)){ctx.fillStyle=light<.02?'rgba(2,9,26,.97)':'rgba(3,13,32,.94)';ctx.fillRect(x,y,6,6)}}ctx.restore();if(p<1)raf=requestAnimationFrame(draw)};raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf);
 },[choice]);
 return <aside className={"moon-corner "+(compact?"moon-compact":"")} style={{left:placement.left,top:placement.top,width:placement.size,right:'auto'}} aria-label="月相与工作室" onContextMenu={e=>e.stopPropagation()}>
  <div className={'moon-orbit '+(phase===4?'moon-eclipse':'')} role="group" aria-label="月相拨盘" onKeyDown={e=>{if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();const next=(phase+(['ArrowRight','ArrowDown'].includes(e.key)?1:7))%8;onChange(next);e.currentTarget.querySelectorAll<HTMLButtonElement>('[data-phase]')[next]?.focus()}}}>
   <div className="mosaic-moon"><img src="/assets/scenery/moon.webp" alt="蓝白马赛克月球" width={768} height={768}/><canvas ref={canvas} width={512} height={512} aria-hidden="true"/>{onEnter&&<button className="moon-core-trigger" aria-label="双击进入月之空间；键盘按 Enter 进入" title="双击，去月亮的另一边" onDoubleClick={e=>{e.stopPropagation();onEnter()}} onClick={e=>{if(e.detail===0)onEnter()}} onPointerDown={e=>{touchStart.current={x:e.clientX,y:e.clientY}}} onPointerUp={e=>{if(e.pointerType==='mouse'||Math.hypot(e.clientX-touchStart.current.x,e.clientY-touchStart.current.y)>12)return;const now=performance.now();if(lastTap.current>0&&now-lastTap.current<360){lastTap.current=0;onEnter()}else lastTap.current=now}}/>}</div>
   {!compact&&moonPhases.map((p,i)=>{const a=(i*45-90)*Math.PI/180;return <button data-phase key={p.name} style={{left:`${50+47*Math.cos(a)}%`,top:`${50+47*Math.sin(a)}%`}} onClick={()=>onChange(i)} aria-label={`切换到${p.name}`} aria-pressed={i===phase} title={p.name}><span aria-hidden="true">{p.glyph}</span></button>})}
  </div>
  <div className="moon-caption" aria-live="polite">{compact?<button onClick={()=>onChange((phase+1)%8)} aria-label={`当前${choice.name}，切换月相`}>{choice.glyph} {choice.name} · 切换</button>:<><span>{choice.name}</span><i/>月相拨盘</>}</div>
  {!compact&&<div className="desktop-brand"><h1>CTY AI STUDIO</h1></div>}
 </aside>
}
