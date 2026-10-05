'use client';
import {useAnimationClock} from "@/app/components/AnimationScope";
import {useEffect,useRef,useState,type CSSProperties,type MutableRefObject} from 'react';
import {getApp,type AppId} from '@/lib/desktop-apps';
import {planJump,sampleJump,measureRowPitch,type Jump} from '@/lib/cat-jump';
import CatCarryOverlay from './CatCarryOverlay';
import {stepCarry,type CarryTrip,type CarryFrame} from '@/lib/cat-carry';
import type {CompanionCue} from '@/lib/companion-sound';
import {iconContact} from '@/lib/icon-contact';
import CatSprite from './CatSprite';
import HarborBoat from './HarborBoat';
import CastleVisitors from './CastleVisitors';
import {FIRE_BURST_AT,castleEncounterBag,newCastleEncounter,sampleCastleEncounter,type CastleEncounter,type CastleEncounterKind} from '@/lib/castle-encounters';
import {harborLayout,newHarborVoyage,sampleHarborVoyage,cancelHarborVoyage,type HarborVoyage} from '@/lib/harbor-voyage';
import {beginTrafficTrick,trafficDefenseAt} from '@/lib/cat-traffic';
import {trafficHop} from '@/lib/traffic-vehicles';
import {carApproachesCat,catFootBaseline,catGroundLevel,type TrafficState,type WallpaperId} from '@/lib/desktop-scenery';
type WindowInfo={id:AppId;min:boolean;z:number;motion?:string};
type Surface={key:string;kind:'icon'|'window'|'pier';left:number;right:number;top:number;z:number};
type Mood='walk'|'rest'|'perch'|'grab'|'fall'|'leap'|'carry'|'hop'|'shield'|'portal'|'sail'|'fish'|'wand'|'patronus';
type Props={wallpaper:WallpaperId;floor:MutableRefObject<number>;traffic:MutableRefObject<TrafficState>;windows:WindowInfo[];onAsk:()=>void;onMusic:()=>void;onWorks:()=>void;onSwapIcons:(first:AppId,second:AppId,carried?:boolean)=>void;onArrange:()=>void;onSound:(cue:CompanionCue)=>void};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export default function DesktopCompanion(props:Props){
 const animationClock=useAnimationClock(),{requestFrame,cancelFrame}=animationClock;
 const voyage=useRef<HarborVoyage|null>(null);
 const encounter=useRef<CastleEncounter|null>(null),magicBag=useRef<CastleEncounterKind[]>([]),lastMagic=useRef<CastleEncounterKind|undefined>(undefined);
 const latest=useRef(props);latest.current=props;
 const travel=useRef(0),airProgress=useRef(0),scrollUntil=useRef(0),holdTimer=useRef<ReturnType<typeof setTimeout>|null>(null),held=useRef(false);
 const menuNode=useRef<HTMLDivElement>(null);
 const pet=useRef<HTMLDivElement>(null),pointer=useRef<{id:number;px:number;py:number;ox:number;oy:number;moved:boolean;mode:Mood;support:string|null}|null>(null),near=useRef(false);
 const m=useRef({x:420,y:650,vy:0,direction:1,mode:'walk' as Mood,support:null as string|null,offset:0,elapsed:0,until:0,nextPerch:7,nextCarry:45,nextFish:36,nextMagic:9,known:new Set<string>(),hop:null as null|{start:number;carId:number;duration:number;height:number},lastCar:0,nextDefense:0,leap:null as null|{start:number;path:Jump;target:Surface},carry:null as null|{id:AppId;other:AppId;trip:CarryTrip}});
 const carryVisual=useRef<CarryFrame|null>(null);
 const [cargo,setCargo]=useState<{id:AppId;label:string}|null>(null);
 const [mood,setMood]=useState<Mood>('walk'),[menu,setMenu]=useState(false),[side,setSide]=useState('right');const menuRef=useRef(false);menuRef.current=menu;
 const platformsCache=useRef<{windows:WindowInfo[]|null;at:number;width:number;height:number;items:Surface[]}>({windows:null,at:-Infinity,width:0,height:0,items:[]});
 const visibleCache=useRef<{source:WindowInfo[]|null;items:WindowInfo[]}>({source:null,items:[]});
 function visibleWindows(){const source=latest.current.windows;if(source!==visibleCache.current.source)visibleCache.current={source,items:source.filter(w=>!w.min&&!w.motion).sort((a,b)=>b.z-a.z)};return visibleCache.current.items}
 function windowElement(id:string){return document.querySelector<HTMLElement>(`[data-window-id="${id}"]`)}
 function cancelCarry(render=true,preserveSource=false){const c=m.current.carry;if(c){for(const id of (preserveSource?[c.other]:[c.id,c.other]))document.querySelector<HTMLElement>(`.movable-icons [data-app="${id}"]`)?.classList.remove('cat-carry-origin','cat-carry-target');m.current.carry=null;carryVisual.current=null;if(m.current.mode==='carry'){m.current.mode=m.current.y<catGroundLevel(latest.current.floor.current)-catFootBaseline-.5?'fall':'rest';m.current.vy=0}if(render)setCargo(null)}}
 function surfaces():Surface[]{
 const active=visibleWindows(),height=latest.current.floor.current,width=window.innerWidth,cached=platformsCache.current,at=animationClock.now();
 if(cached.windows===latest.current.windows&&cached.width===width&&cached.height===height&&at-cached.at<100)return cached.items;
 const rects=active.map(w=>({w,r:windowElement(w.id)?.getBoundingClientRect()})).filter(v=>v.r&&v.r.width>0) as {w:WindowInfo;r:DOMRect}[],found:Surface[]=[];
 for(const {w,r} of rects){const left=Math.max(12,r.left+20),right=Math.min(width-20,r.right-118),cx=(left+right)/2;if(r.top<72||r.top>height-30||right-left<55)continue;if(rects.some(o=>o.w.z>w.z&&cx>=o.r.left&&cx<=o.r.right&&r.top>=o.r.top&&r.top<=o.r.bottom))continue;found.push({key:'window:'+w.id,kind:'window',left,right,top:r.top,z:w.z})}
 const pane=document.querySelector<HTMLElement>('.mobile-home')||document.querySelector<HTMLElement>('.movable-icons'),bounds=pane?.getBoundingClientRect();
 if(pane&&getComputedStyle(pane).visibility!=='hidden')for(const el of document.querySelectorAll<HTMLElement>('.movable-icons [data-app]')){
  const icon=el.querySelector<HTMLElement>('.pixel-icon,.utility-icon'),r=(icon?.querySelector('svg')||icon)?.getBoundingClientRect();
  if(!r||r.width<10||r.top<Math.max(75,bounds?.top||0)||r.bottom>Math.min(height-8,bounds?.bottom||height)||r.left<0||r.right>width)continue;
  const contact=iconContact(getApp(el.dataset.app as AppId).icon,r,icon?.dataset.normalized==='true'),cx=(contact.left+contact.right)/2;
  if(rects.some(o=>cx>=o.r.left&&cx<=o.r.right&&contact.top>=o.r.top&&contact.top<=o.r.bottom))continue;
  found.push({key:'icon:'+el.dataset.app,kind:'icon',...contact,z:3});
 }
 if(latest.current.wallpaper==='harbor'){
  const l=harborLayout(width,height),left=l.pierStart.x-12,right=l.pierEnd.x+14,top=l.pierStart.y,cx=(left+right)/2;
  if(!rects.some(o=>cx>=o.r.left&&cx<=o.r.right&&top>=o.r.top&&top<=o.r.bottom))found.push({key:'harbor:pier',kind:'pier',left,right,top,z:3});
 }
 platformsCache.current={windows:latest.current.windows,at,width,height,items:found};return found;
 }
 function land(target:Surface,now:number){const model=m.current;latest.current.onSound('land');model.support=target.key;if(target.kind==='icon')model.x=(target.left+target.right)/2-43;model.offset=model.x-target.left;model.y=target.top-(target.kind==='window'?76:catFootBaseline);model.mode=target.kind==='window'?'perch':'rest';model.vy=0;model.until=now+2600+Math.random()*2200;model.nextPerch=model.elapsed+4}
 function perch(){const model=m.current;if(['leap','hop','grab','shield','portal','wand','patronus'].includes(model.mode))return;cancelCarry();const all=surfaces(),tops=Array.from(document.querySelectorAll<HTMLElement>('.movable-icons [data-app]')).map(el=>el.getBoundingClientRect().top),pitch=measureRowPitch(tops,96),from={x:model.x+43,y:model.y+(model.mode==='perch'?76:catFootBaseline)};
 const reachable=all.filter(a=>a.key!==model.support).map(target=>{const x=target.kind==='icon'?(target.left+target.right)/2:clamp(model.x+43,target.left+24,target.right-24);const path=planJump(from,{x,y:target.top},{rowPitch:pitch,width:window.innerWidth,safeTop:window.innerWidth<760?48:8});return {target,path}}).filter((v):v is {target:Surface;path:Jump}=>!!v.path);
 const upward=reachable.filter(v=>v.target.top<from.y-10),pool=upward.length?upward:reachable,choice=pool.sort((a,b)=>Math.abs(a.path.to.x-from.x)+Math.abs(a.path.to.y-from.y)*.4-Math.abs(b.path.to.x-from.x)-Math.abs(b.path.to.y-from.y)*.4)[Math.floor(Math.random()*Math.min(3,pool.length))];
 if(!choice){if(model.support){model.support=null;model.mode='fall';model.y+=8;model.vy=15;model.nextPerch=model.elapsed+12}else{model.nextPerch=model.elapsed+10;}return}
 model.support=null;model.carry=null;model.hop=null;airProgress.current=0;model.leap={start:animationClock.now(),path:choice.path,target:choice.target};model.direction=choice.path.to.x>=from.x?1:-1;model.mode='leap';model.nextPerch=model.elapsed+8;latest.current.onSound('jump');
 }
 function carry(){
  cancelCarry();const model=m.current,pane=document.querySelector<HTMLElement>('.movable-icons');
  if(pane&&pane.scrollTop>0){model.nextCarry=model.elapsed+60;return}
  const bounds=pane?.getBoundingClientRect(),icons=Array.from(document.querySelectorAll<HTMLElement>('.movable-icons [data-app]')).filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(!bounds||r.top>=bounds.top&&r.bottom<=Math.min(bounds.bottom,latest.current.floor.current-20))});
  if(icons.length<2){model.nextCarry=model.elapsed+30;return}
  const pool=icons.filter(el=>el.getBoundingClientRect().left<Math.min(window.innerWidth*.6,480)),source=pool[Math.floor(Math.random()*pool.length)];if(!source)return;
  const sr=source.getBoundingClientRect(),candidates=icons.filter(el=>el!==source&&Math.abs(el.getBoundingClientRect().left-sr.left)>45),target=candidates[Math.floor(Math.random()*candidates.length)];if(!target)return;
  const tr=target.getBoundingClientRect(),id=source.dataset.app as AppId,other=target.dataset.app as AppId;
  const iconCenter=(el:HTMLElement)=>{const r=el.querySelector<HTMLElement>('.pixel-icon,.utility-icon')!.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}};
  model.support=null;model.leap=null;model.hop=null;model.vy=0;model.mode='carry';
  model.carry={id,other,trip:{phase:'approach',time:0,approachX:clamp(sr.left+40,4,Math.min(window.innerWidth-90,400)),targetX:clamp(tr.left+40,4,window.innerWidth-90),source:iconCenter(source),destination:iconCenter(target),vy:0}};
  model.nextCarry=model.elapsed+90;setCargo({id,label:source.textContent?.trim()||getApp(id).name});
 }


 function leaveBoat(){const v=voyage.current;if(!v||v.cancelled)return;cancelHarborVoyage(v,harborLayout(window.innerWidth,latest.current.floor.current));const model=m.current;model.support=null;model.mode='fall';model.vy=0;model.nextFish=model.elapsed+100;pet.current?.setAttribute('data-aboard','false')}
 function fishing(boarded=false){
  if(latest.current.wallpaper!=='harbor')return;const model=m.current;cancelCarry();model.support=null;model.leap=null;model.hop=null;latest.current.traffic.current.trick=undefined;
  const v=newHarborVoyage({x:model.x+43,y:model.y+catFootBaseline},harborLayout(window.innerWidth,latest.current.floor.current));
  if(boarded)v.elapsed=v.approach+1.15+3.8+.95;
  voyage.current=v;model.mode=boarded?'sail':'walk';model.nextFish=model.elapsed+120;
 }
 const actions=useRef({perch,carry,fishing});actions.current={perch,carry,fishing};
 useEffect(()=>{const scrolled=()=>{platformsCache.current.at=-Infinity;scrollUntil.current=animationClock.now()+650;if(m.current.carry){cancelCarry();m.current.mode='fall';m.current.vy=0}};document.addEventListener('scroll',scrolled,true);const interrupt=()=>{platformsCache.current.at=-Infinity;if(m.current.carry){cancelCarry();m.current.until=animationClock.now()+1000}};window.addEventListener('cty-icon-layout-change',interrupt);window.addEventListener('resize',interrupt);return()=>{document.removeEventListener('scroll',scrolled,true);if(holdTimer.current)clearTimeout(holdTimer.current);window.removeEventListener('cty-icon-layout-change',interrupt);window.removeEventListener('resize',interrupt)}},[]);
 useEffect(()=>{if(!menu)return;const close=(e:PointerEvent)=>{if(!pet.current?.contains(e.target as Node))setMenu(false)},key=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(false)};document.addEventListener('pointerdown',close);window.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',close);window.removeEventListener('keydown',key)}},[menu]);
 useEffect(()=>{let observedWindows:WindowInfo[]|null=null;let raf=0,last=0,renderedMood:Mood='walk';const rootValues=new Map<string,string>();const setRoot=(key:string,value:string)=>{if(rootValues.get(key)!==value){document.documentElement.style.setProperty(key,value);rootValues.set(key,value)}};const model=m.current;model.x=window.innerWidth*.42;model.y=catGroundLevel(latest.current.floor.current)-catFootBaseline;const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const tick=(now:number)=>{raf=requestFrame(tick);const dt=Math.min((now-last)/1000||0,.04);last=now;if(document.hidden)return;const road=latest.current.floor.current,ground=catGroundLevel(road),oldX=model.x,oldMode=model.mode;model.elapsed+=dt;
   const active=visibleWindows();if(!encounter.current&&['wand','patronus'].includes(model.mode)){model.mode='rest';model.until=now+1200;model.nextMagic=model.elapsed+18}const changed=observedWindows!==active,newWindow=changed&&active.some(w=>!model.known.has(w.id));if(changed){model.known=new Set(active.map(w=>w.id));observedWindows=active;}
   const platforms=model.support||model.mode==='leap'||model.mode==='fall'?surfaces():[],approaching=latest.current.traffic.current,trafficDistance=approaching.direction===1?model.x+25-(approaching.x+approaching.width):approaching.x-(model.x+61),waitForTraffic=approaching.active&&trafficDistance>=-8&&trafficDistance<approaching.speed*6.5;
   let voyageControls=false,aboard=false;
   if(latest.current.wallpaper!=='harbor'&&voyage.current){voyage.current=null;model.mode='fall';model.support=null;model.vy=0;model.nextFish=model.elapsed+36}
   if(latest.current.wallpaper==='harbor'&&!voyage.current&&model.elapsed>model.nextFish&&active.length===0&&!waitForTraffic&&!pointer.current&&!menuRef.current&&!near.current&&!reduce.matches&&!model.carry&&!['shield','portal','hop','carry'].includes(model.mode))actions.current.fishing();
   const trip=voyage.current;
   if(trip){
    const before=sampleHarborVoyage(trip,harborLayout(window.innerWidth,road),model.elapsed),car=latest.current.traffic.current;
    const avoidTraffic=!trip.cancelled&&before.phase==='approach'&&!before.jumping&&(['shield','portal','hop'].includes(model.mode)||(car.id!==model.lastCar&&carApproachesCat(car,model.x)));
    if((!menuRef.current||trip.cancelled)&&!avoidTraffic)trip.elapsed+=dt;
    const frame=sampleHarborVoyage(trip,harborLayout(window.innerWidth,road),model.elapsed);
    if(frame.done){if(!trip.cancelled&&frame.cat){model.x=frame.cat.x-43;model.y=frame.cat.y-catFootBaseline;model.mode='rest';model.until=now+2200;model.nextPerch=model.elapsed+12}voyage.current=null;model.nextFish=model.elapsed+80+Math.random()*65}
    else if(frame.cat&&!pointer.current&&!avoidTraffic){voyageControls=true;aboard=frame.aboard;model.support=null;model.x=frame.cat.x-43;model.y=frame.cat.y-catFootBaseline;model.mode=frame.aboard?(frame.cast>0?'fish':'sail'):frame.jumping?'leap':'walk';model.direction=frame.aboard?1:Math.abs(model.x-oldX)>.01?(model.x>oldX?1:-1):model.direction;airProgress.current=frame.progress;}
   }
   if(pet.current&&pet.current.dataset.aboard!==String(aboard))pet.current.dataset.aboard=String(aboard);
   const petZ=Math.max(8,...active.map(w=>w.z+2));setRoot('--cat-water-z',String(trip&&!trip.cancelled?petZ:4));
   if(!voyageControls&&(!encounter.current||encounter.current.kind==='dementors')&&model.support&&!pointer.current){const support=platforms.find(s=>s.key===model.support);if(!support){encounter.current=null;model.support=null;model.mode='fall';model.vy=20}else{model.x=support.kind==='icon'?(support.left+support.right)/2-43:clamp(support.left+model.offset,support.left-20,support.right-53);model.y=support.top-(support.kind==='window'?76:catFootBaseline);if(!encounter.current&&now>model.until&&!near.current&&!menuRef.current&&now>scrollUntil.current&&!reduce.matches)actions.current.perch()}}
   let castleControls=false;
   if(latest.current.wallpaper!=='castle'||reduce.matches||pointer.current||menuRef.current||model.carry||(active.length>0&&!model.support&&encounter.current?.kind!=='dementors')){
    if(encounter.current){encounter.current=null;if(['wand','patronus'].includes(model.mode)){model.mode=model.support?.startsWith('window:')?'perch':'rest';model.until=now+1500}model.nextMagic=model.elapsed+14}
   }else{
    if(!encounter.current&&model.elapsed>model.nextMagic&&!near.current&&!['leap','hop','fall','carry'].includes(model.mode)){
     if(!magicBag.current.length)magicBag.current=castleEncounterBag(lastMagic.current);
     const kind:CastleEncounterKind=model.support?'dementors':magicBag.current.shift()!;lastMagic.current=kind;
     const event=newCastleEncounter(kind,window.innerWidth,model.x+43);event.support=model.support;event.catFootY=model.support?platforms.find(p=>p.key===model.support)?.top:ground;
     encounter.current=event;model.nextPerch=model.elapsed+30;
    }
    const event=encounter.current;
    if(event){const previousQ=event.elapsed-event.approach;event.elapsed+=dt;
     if(event.kind==='dementors'&&model.support){event.catX=model.x+43;event.catFootY=platforms.find(p=>p.key===model.support)?.top??ground;}
     const frame=sampleCastleEncounter(event,window.innerWidth,ground);castleControls=event.kind!=='harry';
     if(castleControls){model.x=event.catX-43;model.y=(event.catFootY??ground)-catFootBaseline;model.mode=frame.cast;model.direction=frame.catDirection;model.nextPerch=model.elapsed+8}
     const cue=(q:number,sound:CompanionCue)=>{if(previousQ<q&&frame.q>=q)latest.current.onSound(sound)};
     if(event.kind==='duel'){cue(.3,'spell');cue(1,'counter');cue(1.65,'clash')}
     if(event.kind==='dementors')cue(0,'patronus');
     if(event.kind==='dumbledore'){cue(.45,'launch');cue(FIRE_BURST_AT,'firework');cue(FIRE_BURST_AT+1.1,'firework');cue(FIRE_BURST_AT+2.2,'firework');cue(8.1,'phoenix')}
     if(frame.done){encounter.current=null;castleControls=false;model.mode=model.support?.startsWith('window:')?'perch':'rest';if(model.mode==='perch')model.y=(event.catFootY??ground)-76;model.until=now+1500;model.nextMagic=model.elapsed+20+Math.random()*25;model.nextPerch=model.elapsed+8;}
    }
   }
   if(!pointer.current&&!voyageControls&&!castleControls){
    const car=latest.current.traffic.current;if((model.mode==='walk'||model.mode==='rest')&&!reduce.matches&&!model.support&&car.id!==model.lastCar&&carApproachesCat(car,model.x)){model.lastCar=car.id;const kind=trafficDefenseAt(model.nextDefense++);model.direction=-car.direction;if(kind!=='hop'){car.trick=beginTrafficTrick(kind,car,model.x);model.mode=kind;model.until=now+car.trick.duration*1000;}else{model.hop={start:now,carId:car.id,...trafficHop(car)};model.mode='hop'}model.nextPerch=model.elapsed+12;latest.current.onSound(kind==='hop'?'jump':kind)}
    if(model.mode==='shield'||model.mode==='portal'){model.y=ground-catFootBaseline;if(!car.trick||car.trick.carId!==model.lastCar){model.mode='rest';model.until=now+1600}}
    else if(model.mode==='hop'&&model.hop){const p=reduce.matches?1:clamp((now-model.hop.start)/model.hop.duration,0,1);airProgress.current=p;model.y=ground-catFootBaseline-Math.sin(Math.PI*p)*model.hop.height;if(p>=1){model.hop=null;model.mode='rest';model.until=now+1100;latest.current.onSound('land')}}
    else if(model.mode==='leap'&&model.leap){const l=model.leap,p=reduce.matches?1:clamp((now-l.start)/(l.path.seconds*1000),0,1),point=sampleJump(l.path,p);airProgress.current=p;model.x=point.x-43;model.y=point.y-catFootBaseline;const target=platforms.find(s=>s.key===l.target.key);if(!target||Math.abs(target.top-l.target.top)>12||Math.abs(target.left-l.target.left)>12){model.mode='fall';model.vy=point.vy;model.leap=null}else if(p>=1){land(target,now);model.leap=null}}
    else if(model.mode==='fall'){const before=model.y+catFootBaseline;if(reduce.matches)model.y=ground-catFootBaseline;else{model.vy+=1400*dt;model.y+=model.vy*dt}const after=model.y+catFootBaseline,cx=model.x+43,landing=model.vy>=0?platforms.filter(s=>cx>s.left+3&&cx<s.right-3&&before<=s.top&&after>=s.top).sort((a,b)=>a.top-b.top)[0]:undefined;if(landing)land(landing,now);else if(after>=ground){latest.current.onSound('land');if(model.vy>260)latest.current.onSound('meow');model.y=ground-catFootBaseline;model.mode='rest';model.until=now+1300;model.vy=0;model.nextPerch=model.elapsed+8}}
    else if(model.mode==='carry'&&model.carry){
     const c=model.carry,source=document.querySelector<HTMLElement>(`.movable-icons [data-app="${c.id}"]`),target=document.querySelector<HTMLElement>(`.movable-icons [data-app="${c.other}"]`);
     if(!source||!target){cancelCarry();model.mode='fall';model.vy=0}else{
      const wasAirborne=model.y<ground-catFootBaseline-.1,before=c.trip.phase,frame=stepCarry(c.trip,{x:model.x,y:model.y},model.direction,ground-catFootBaseline,menuRef.current?0:dt);carryVisual.current=frame;model.x=frame.cat.x;model.y=frame.cat.y;model.direction=frame.direction;
      if(wasAirborne&&model.y>=ground-catFootBaseline-.1)latest.current.onSound('land');
      if(frame.phase!==before){if(frame.phase==='cast')latest.current.onSound('lasso');if(frame.phase==='reel'){source.classList.add('cat-carry-origin');target.classList.add('cat-carry-target');latest.current.onSound('catch')}if(frame.phase==='done')latest.current.onSound('put')}
      if(frame.done){const first=c.id,second=c.other;cancelCarry(true,true);latest.current.onSwapIcons(first,second,true);model.mode='rest';model.until=now+2200;model.nextCarry=model.elapsed+80;model.nextMagic=model.elapsed+14;}
     }
    }
    else if((model.mode==='walk'||model.mode==='rest')&&!model.support){model.y=ground-catFootBaseline;if(!reduce.matches&&!near.current&&!menuRef.current){if(!encounter.current&&!waitForTraffic&&model.elapsed<model.nextCarry&&(newWindow||model.elapsed>model.nextPerch)&&model.elapsed>4&&now>scrollUntil.current){actions.current.perch();model.nextPerch=model.elapsed+10}else if(!encounter.current&&!waitForTraffic&&model.elapsed>model.nextCarry&&active.length===0){actions.current.carry()}else{const walking=model.elapsed%30<19&&now>model.until;model.mode=walking?'walk':'rest';if(walking)model.x+=model.direction*dt*23}}else model.mode='rest'}
   }
   if(model.x>window.innerWidth-90){model.x=window.innerWidth-90;model.direction=-1}if(model.x<4){model.x=4;model.direction=1}model.y=clamp(model.y,model.support||['perch','leap'].includes(model.mode)?-81:0,ground-65);
   if(['walk','carry'].includes(oldMode)&&['walk','carry'].includes(model.mode)&&Math.abs(model.x-oldX)<8)travel.current+=Math.abs(model.x-oldX);
   if(pet.current){const el=pet.current;const data=(key:string,value:string)=>{if(el.dataset[key]!==value)el.dataset[key]=value};data('ready','true');setRoot('--cat-magic-z',String(petZ-1));data('facing',model.direction===1?'right':'left');const transform=`translate3d(${model.x}px,${model.y}px,0)`;if(el.style.transform!==transform)el.style.transform=transform;if(el.style.getPropertyValue('--pet-facing')!==String(model.direction))el.style.setProperty('--pet-facing',String(model.direction));if(el.style.zIndex!==String(petZ))el.style.zIndex=String(petZ);if(model.mode==='shield')setRoot('--cat-shield-z',String(petZ+1));data('mood',model.mode);data('menuPlacement',model.y<325?'below':'above')}
   if(menuNode.current&&pet.current){const el=menuNode.current,w=el.offsetWidth,h=el.offsetHeight,screenY=clamp(model.y>=h+86?model.y-h-5:model.y+86,8,window.innerHeight-h-50);el.style.left=`${clamp(model.x+5,8,window.innerWidth-w-8)-model.x}px`;el.style.right='auto';el.style.top=`${screenY-model.y}px`;el.style.bottom='auto';pet.current.dataset.menuPlacement=screenY<model.y?'above':'below'}
   if(renderedMood!==model.mode){renderedMood=model.mode;setMood(model.mode)}
  };raf=requestFrame(tick);return()=>{cancelFrame(raf);cancelCarry(false)};
 },[]);
 function release(e:React.PointerEvent<HTMLButtonElement>){if(holdTimer.current)clearTimeout(holdTimer.current);const p=pointer.current;if(!p||p.id!==e.pointerId)return;pointer.current=null;const model=m.current;if(p.moved){latest.current.onSound('meow');const l=harborLayout(window.innerWidth,latest.current.floor.current),boat=sampleHarborVoyage(voyage.current,l).boat;if(latest.current.wallpaper==='harbor'&&Math.abs(model.x+43-(boat.x+boat.width*.63))<boat.width*.6&&Math.abs(model.y+catFootBaseline-(boat.y+5))<50){fishing(true);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);return}const target=surfaces().filter(s=>model.x+43>s.left&&model.x+43<s.right&&Math.abs(model.y+catFootBaseline-s.top)<42).sort((a,b)=>Math.abs(model.y+catFootBaseline-a.top)-Math.abs(model.y+catFootBaseline-b.top))[0];if(target){land(target,animationClock.now());}else{model.mode='fall';model.support=null;model.vy=0}}else{model.mode=['hop','leap','carry','fall','shield','portal'].includes(p.mode)?'fall':p.mode;model.support=p.support;model.leap=null;model.hop=null;model.vy=0;if(!held.current)setMenu(true)}if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}
 function run(action:()=>void){leaveBoat();encounter.current=null;m.current.nextMagic=m.current.elapsed+20;if(m.current.carry){cancelCarry();m.current.until=animationClock.now()+1000}setMenu(false);action()}
 return <>{cargo&&<CatCarryOverlay id={cargo.id} frame={carryVisual}/>} {props.wallpaper==='castle'&&<CastleVisitors floor={props.floor} encounter={encounter}/>} {props.wallpaper==='harbor'&&<HarborBoat floor={props.floor} voyage={voyage}/>}<div ref={pet} className="tiny-companion companion-interactive" data-mood={mood} style={{'--pet-facing':1} as CSSProperties} onPointerEnter={()=>{near.current=true}} onPointerLeave={()=>{near.current=false}} onContextMenu={e=>{e.preventDefault();e.stopPropagation();setSide(m.current.x>window.innerWidth-300?'left':'right');setMenu(true)}}><span className="companion-ground-shadow" aria-hidden="true"/><button className="tiny-cat" aria-label="AI小脏：拖动移动，右键打开互动菜单" title="拖我到应用上 · 长按 / 右键和我玩" onPointerDown={e=>{if(e.button!==0||pointer.current)return;e.preventDefault();e.stopPropagation();const model=m.current;leaveBoat();encounter.current=null;model.nextMagic=model.elapsed+18;if(model.carry)cancelCarry();pointer.current={id:e.pointerId,px:e.clientX,py:e.clientY,ox:model.x,oy:model.y,moved:false,mode:['carry','wand','patronus'].includes(model.mode)?'rest':model.mode,support:model.support};model.mode='grab';e.currentTarget.setPointerCapture(e.pointerId);setMenu(false);held.current=false;if(e.pointerType!=='mouse')holdTimer.current=setTimeout(()=>{if(pointer.current&&!pointer.current.moved){held.current=true;setMenu(true)}},550)}} onPointerMove={e=>{const p=pointer.current;if(!p||p.id!==e.pointerId)return;const model=m.current;if(Math.hypot(e.clientX-p.px,e.clientY-p.py)>8){p.moved=true;if(holdTimer.current)clearTimeout(holdTimer.current)}if(p.moved){model.mode='grab';model.support=null;model.leap=null;model.hop=null;model.x=clamp(p.ox+e.clientX-p.px,0,window.innerWidth-86);model.y=clamp(p.oy+e.clientY-p.py,0,catGroundLevel(latest.current.floor.current)-catFootBaseline)}}} onPointerUp={release} onLostPointerCapture={e=>{if(pointer.current?.id===e.pointerId){pointer.current.moved=true;release(e)}}} onPointerCancel={e=>{if(pointer.current)pointer.current.moved=true;release(e)}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '||e.key==='ContextMenu'){e.preventDefault();setMenu(v=>!v)}}}><CatSprite mood={mood} travel={travel} airProgress={airProgress}/>{mood==='grab'&&<span className="cat-grab-hand" aria-hidden="true"><svg viewBox="0 0 16 18" shapeRendering="crispEdges"><path fill="#213d5a" d="M6 0h4v6h2V4h3v9h-2v5H5v-3H3v-3H1V8h3v2h2z"/><path fill="#f1dfb0" d="M7 1h2v8h2V6h3v6h-2v5H6v-3H4v-3H2V9h1v2h4z"/><path fill="#bc9c6e" d="M9 8h1v4H9zM11 8h1v4h-1zM5 13h2v2H5z"/></svg></span>}{mood==='perch'&&<span className="cat-sleep-mark" aria-hidden="true">z</span>}</button>{menu&&<div ref={menuNode} className={'cat-play-menu menu-'+side} role="group" aria-label="AI小脏互动"><b>喵，今天想做什么？</b><div><button autoFocus onClick={()=>run(props.onAsk)}>和我闲聊 / 提问</button><button onClick={()=>run(props.onMusic)}>放首歌 ♪</button><button onClick={()=>run(props.onWorks)}>看看作品</button><button onClick={()=>run(perch)}>跳上应用 / 再跳一层</button><button onClick={()=>run(carry)}>套索搬运图标</button>{props.wallpaper==='harbor'&&<button onClick={()=>run(()=>fishing())}>出海钓鱼</button>}<button onClick={()=>run(props.onArrange)}>整理回原位</button><button onClick={()=>run(()=>{m.current.support=null;m.current.leap=null;m.current.y+=8;m.current.mode='fall';m.current.vy=0;m.current.until=animationClock.now()+3000})}>回地面散步</button></div><small>按住可以提起我 · Esc 收起</small></div>}</div></>
}
