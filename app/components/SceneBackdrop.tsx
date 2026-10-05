'use client';
import {useEffect,useRef,useState,type MutableRefObject} from 'react';
import type {WallpaperId,TrafficState} from '@/lib/desktop-scenery';
import {moonLayout} from '@/lib/scene-layout';
import {getShopLayout} from './scenery/shop-layout';
import {AnimationScope,useAnimationClock} from './AnimationScope';
import {sampleTrafficTrick} from '@/lib/cat-traffic';
import {trafficVehicles,harborVehicles} from '@/lib/traffic-vehicles';
import TrafficMagic from './TrafficMagic';
import type {AppId} from '@/lib/desktop-apps';
type Props={animate?:boolean;wallpaper:WallpaperId;floor:MutableRefObject<number>;traffic:MutableRefObject<TrafficState>;onOpen:(id:AppId)=>void;onError:()=>void;onDisplayed:(id:WallpaperId)=>void;light:number};
function SceneLayer({kind,light,enter=false}:{kind:WallpaperId;light:number;enter?:boolean}){
 const clock=useAnimationClock();
 const canvas=useRef<HTMLCanvasElement>(null),lightRef=useRef(light);lightRef.current=light;
 useEffect(()=>{if(kind==='clouds'||!canvas.current)return;let cancelled=false,size={w:1364,h:888},renderer:{resize:(w:number,h:number)=>void;dispose:()=>void}|undefined;const el=canvas.current;
  const resize=()=>{size={w:el.clientWidth,h:el.clientHeight};if(size.w&&size.h)renderer?.resize(size.w,size.h)};
  const observer=new ResizeObserver(resize);observer.observe(el);resize();
  const load=async()=>{try{const module=kind==='castle'?await import('./scenery/pixel-castle'):await import('./scenery/pixel-scenery');if(cancelled)return;
   renderer='createPixelCastle' in module?module.createPixelCastle(el,{getLight:()=>lightRef.current,clock}):module.createPixelScenery(el,kind as 'shanghai'|'harbor',{getLight:()=>lightRef.current,getMoonX:()=>moonLayout(size.w,size.h).centerX,clock});resize();
  }catch{if(!cancelled)el.dataset.failed='true'}};void load();
  return()=>{cancelled=true;observer.disconnect();renderer?.dispose()};
 },[kind,clock]);
 return <div className={'scene-layer'+(enter?' scene-enter':'')} data-scene={kind} style={{filter:kind==='castle'?undefined:`brightness(${.72+light*.28})`,transition:'filter 1.2s ease'}}>{kind==='clouds'?<><img className="scene-image" src="/assets/scenery/clouds.webp" alt=""/><div className="cloud-drift"><img className="scene-image" src="/assets/scenery/clouds.webp" alt=""/></div></>:<canvas ref={canvas} className="pixel-scenery-canvas"/>}</div>
}
export default function SceneBackdrop({wallpaper,floor,traffic,onOpen,onError,onDisplayed,light,animate=true}:Props){
 const {requestFrame,cancelFrame}=useAnimationClock();
 const [shown,setShown]=useState<WallpaperId>(wallpaper),[old,setOld]=useState<WallpaperId|null>(null),[size,setSize]=useState({w:1364,h:888});
 const root=useRef<HTMLDivElement>(null),car=useRef<HTMLDivElement>(null),shownRef=useRef(shown),callbacks=useRef({onError,onDisplayed});shownRef.current=shown;callbacks.current={onError,onDisplayed};
 useEffect(()=>{let cancelled=false;const apply=()=>{if(cancelled)return;setOld(shownRef.current===wallpaper?null:shownRef.current);setShown(wallpaper);callbacks.current.onDisplayed(wallpaper)};if(wallpaper==='clouds'||wallpaper==='castle'){const img=new Image();img.onload=apply;img.onerror=()=>!cancelled&&callbacks.current.onError();img.src=wallpaper==='castle'?'/assets/scenery/hogwarts-night.webp':'/assets/scenery/clouds.webp'}else apply();return()=>{cancelled=true}},[wallpaper]);
 useEffect(()=>{const timer=setTimeout(()=>setOld(null),1400);return()=>clearTimeout(timer)},[shown]);
 useEffect(()=>{const resize=()=>{if(root.current)setSize({w:root.current.clientWidth,h:root.current.clientHeight})};resize();const observer=new ResizeObserver(resize);if(root.current)observer.observe(root.current);return()=>observer.disconnect()},[]);
 useEffect(()=>{
  if(shown!=='shanghai'&&shown!=='harbor'){traffic.current.active=false;traffic.current.trick=undefined;return}
  let raf=0,last=0,elapsed=0,next=7,disposed=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),state=traffic.current,ready=new Set<string>(['taxi']),vehicles=shown==='harbor'?harborVehicles:trafficVehicles;
  state.active=false;state.trick=undefined;
  if(shown==='shanghai'||shown==='harbor')for(const vehicle of vehicles){const img=new Image();img.onload=()=>{if(!disposed)ready.add(vehicle.id)};img.src=vehicle.src;}
  function spawn(){
   const choice=vehicles[state.id%vehicles.length],vehicle=ready.has(choice.id)?choice:shown==='harbor'?vehicles.find(v=>ready.has(v.id)):trafficVehicles[2];if(!vehicle)return;
   state.active=true;state.id++;state.direction=state.id%2?1:-1;state.width=vehicle.width;state.height=vehicle.height;state.speed=vehicle.speed;state.frontWheel=vehicle.frontWheel;state.rearWheel=vehicle.rearWheel;
   state.x=state.direction===1?-vehicle.width-25:window.innerWidth+25;
   if(car.current){car.current.dataset.vehicle=vehicle.id;car.current.style.setProperty('--vehicle-width',`${vehicle.width}px`);car.current.style.setProperty('--vehicle-height',`${vehicle.height}px`);for(const img of car.current.querySelectorAll('img'))img.src=vehicle.src;}
   next=elapsed+22+Math.random()*10;
  }
  function tick(now:number){
   raf=requestFrame(tick);const dt=Math.min(.04,(now-last)/1000||0);last=now;
   if(document.hidden||reduced.matches||(shown!=='shanghai'&&shown!=='harbor')){state.active=false;state.trick=undefined;if(car.current)car.current.hidden=true;return;}
   elapsed+=dt;if(!state.active&&elapsed>next)spawn();
   let lift=0,angle=0,left=0,right=0;
   if(state.active){
    if(state.trick){state.trick.elapsed+=dt;const pose=sampleTrafficTrick(state.trick);state.x=pose.x;lift=pose.lift;angle=pose.angle;left=pose.clipLeft;right=pose.clipRight;if(pose.done)state.trick=undefined;}
    else state.x+=state.direction*state.speed*dt;
    if(state.x>window.innerWidth+40||state.x<-state.width-40){state.active=false;state.trick=undefined;}
   }
   if(car.current){car.current.hidden=!state.active;car.current.style.transform=`translate3d(${state.x}px,${floor.current-state.height-lift}px,0) rotate(${angle}deg)`;car.current.style.clipPath=left||right?`inset(-40px ${right}px -25px ${left}px)`:'none';car.current.style.setProperty('--taxi-direction',String(state.direction));car.current.style.setProperty('--taxi-reflection',String(lift>8?0:.14));}
  }
  raf=requestFrame(tick);return()=>{disposed=true;cancelFrame(raf);state.active=false;state.trick=undefined;};
 },[shown,floor,traffic]);
 const shops=getShopLayout(size.w,size.h);
 return <><div className="scene-backdrop" ref={root} aria-hidden="true"><AnimationScope active={animate}>{old&&<SceneLayer key={old} kind={old} light={light}/>}<SceneLayer key={shown} kind={shown} light={light} enter/></AnimationScope></div>
 {shown==='shanghai'&&<div className="night-shops live-shops" aria-label="外滩夜间小店">{shops.map(shop=><button key={shop.id} className={'night-shop live-shop shop-'+shop.id} style={{left:shop.x,top:shop.y,width:shop.width,height:shop.height}} onClick={()=>onOpen(shop.app as AppId)} title={shop.id==='family'?'全家 · 找 AI 小脏':shop.id==='tims'?'Tims · 听一首歌':'逛一逛 · 打开作品'} aria-label={shop.label+' · 打开'+(shop.app==='music'?'唱片机':shop.app==='cat'?'AI 小脏':'作品')}><span data-short-label={shop.id==='family'?'全家':shop.id==='pancake'?'葱油饼':shop.id==='tims'?'TIMS':shop.label}>{shop.label}</span></button>)}</div>}
 {(shown==='shanghai'||shown==='harbor')&&<div ref={car} className="night-taxi" hidden aria-hidden="true"><img src="/assets/scenery/taxi.webp" alt=""/><img className="taxi-reflection" src="/assets/scenery/taxi.webp" alt=""/></div>}{(shown==='shanghai'||shown==='harbor')&&<TrafficMagic traffic={traffic} floor={floor}/>}<div className="desktop-ground-line" aria-hidden="true"/>
 </>;
}
