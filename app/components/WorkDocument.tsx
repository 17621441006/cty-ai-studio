'use client';
import {useEffect,useRef,useState} from 'react';
import {useWindowVisible} from './AnimationScope';
import AppLoading from './AppLoading';

export default function WorkDocument(){
 const frame=useRef<HTMLIFrameElement>(null),visible=useWindowVisible();
 const [ready,setReady]=useState(false),[revision,setRevision]=useState(0);
 useEffect(()=>{
  const sync=()=>frame.current?.contentWindow?.postMessage({type:'cty:work-visibility',active:visible&&!document.hidden},location.origin);
  sync();document.addEventListener('visibilitychange',sync);
  return()=>document.removeEventListener('visibilitychange',sync);
 },[visible,ready]);
 return <div className="art-tour-frame work-document">
  <iframe key={revision} ref={frame} src="/works/work/supply-chain-ai/index.html" title="供应链 · AI 升级改造方案" allow="fullscreen" allowFullScreen onLoad={()=>setReady(true)}/>
  {!ready&&<AppLoading name="供应链 AI 升级方案" detail="正在载入交互方案与图表" elapsed onRetry={()=>{setReady(false);setRevision(v=>v+1)}}/>}
 </div>;
}
