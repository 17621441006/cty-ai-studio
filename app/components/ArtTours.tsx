'use client';
import {useEffect,useRef,useState} from 'react';
import AppLoading from './AppLoading';
export default function ArtTours({world,active=true}:{world:'vangogh'|'wizard';active?:boolean}){
 const frame=useRef<HTMLIFrameElement>(null),[loaded,setLoaded]=useState(false);
 useEffect(()=>{const sync=()=>frame.current?.contentWindow?.postMessage({type:'cty:tour-visibility',active:active&&!document.hidden},location.origin);sync();document.addEventListener('visibilitychange',sync);return()=>document.removeEventListener('visibilitychange',sync);},[active,loaded]);
 return <div className="art-tour-frame"><iframe ref={frame} src={'/works/art-tours/index.html?world='+world} title={world==='vangogh'?'梵高 · 漫游星夜':'哈利波特 · 魔法世界漫游'} allow="fullscreen; autoplay" allowFullScreen onLoad={()=>setLoaded(true)}/>{!loaded&&<AppLoading name="文艺复习" detail="正在展开漫游场景"/>}</div>;
}
