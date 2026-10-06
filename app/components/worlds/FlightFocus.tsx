'use client';
import {useEffect,useId,useState} from 'react';
import {ChevronDown,ChevronUp,Pause,Play,Timer} from 'lucide-react';
import {useWindowVisible} from '../AnimationScope';

/** Isolated one-second updates: the world doesn't rerender with the clock. */
export default function FlightFocus({active}:{active:boolean}){
 const visible=useWindowVisible(),panel=useId();
 const [expanded,setExpanded]=useState(false),[duration,setDuration]=useState(25),[remaining,setRemaining]=useState(25*60),[running,setRunning]=useState(false),[completed,setCompleted]=useState(false);
 useEffect(()=>{
  if(!running||!active||!visible)return;
  let previous=performance.now();
  const interval=setInterval(()=>{const now=performance.now(),elapsed=Math.min(2,(now-previous)/1000);previous=now;if(!document.hidden)setRemaining(value=>Math.max(0,value-elapsed));},1000);
  return()=>clearInterval(interval);
 },[running,active,visible]);
 useEffect(()=>{if(remaining===0&&running){setRunning(false);setCompleted(true);}},[remaining,running]);
 const time=`${Math.floor(remaining/60).toString().padStart(2,'0')}:${Math.floor(remaining%60).toString().padStart(2,'0')}`;
 const toggle=()=>{if(completed){setRemaining(duration*60);setCompleted(false);}setRunning(value=>!value);setExpanded(false);};
 const action=running?'暂停专注':completed?'重新专注':'开始专注';
 return <section className="flight-focus-widget" aria-label="飞行专注计时器">
  <div className="flight-focus-pill">
   <Timer size={13} aria-hidden="true"/><output aria-label={`专注剩余 ${time}`}>{time}</output>
   <button type="button" onClick={toggle} title={action} aria-label={action}>{running?<Pause size={14}/>:<Play size={14}/>}</button>
   <button type="button" aria-label={expanded?'收起计时设置':'展开计时设置'} aria-expanded={expanded} aria-controls={panel} onClick={()=>setExpanded(value=>!value)}>{expanded?<ChevronUp size={15}/>:<ChevronDown size={15}/>}</button>
  </div>
  {expanded&&<div className="flight-focus-settings" id={panel}>
   <small>{completed?'一段专注，已经抵达。':'让世界陪你专注'}</small>
   <div role="group" aria-label="专注时长">{[15,25,50].map(minutes=><button key={minutes} type="button" disabled={running} aria-pressed={duration===minutes} onClick={()=>{setDuration(minutes);setRemaining(minutes*60);setCompleted(false)}}>{minutes} 分</button>)}</div>
   <button type="button" className="flight-focus-start" onClick={toggle}>{action}</button>
  </div>}
  <span className="sr-only" role="status">{completed?'本次专注已完成':''}</span>
 </section>;
}
