'use client';
import {useWindowVisible,useVisibleInterval} from './AnimationScope';
import {useEffect,useRef,useState} from 'react';
import {Gamepad2,CodeXml,BrainCircuit,Box,Images,Disc3,FileCode2,Palette} from 'lucide-react';
export type LoadingTheme='television'|'python'|'algorithm'|'ai'|'spatial'|'album'|'music'|'arcade'|'art'|'file';
export function loadingTheme(name:string):LoadingTheme{
 if(/minecraft|python|方块/i.test(name))return 'python';
 if(/usaco|算法|编程竞赛/i.test(name))return 'algorithm';
 if(/唱片|音乐|电车|live house|五个房间/i.test(name))return 'music';
 if(/电视|视频|短片|影像/i.test(name))return 'television';
 if(/相册|照片|表情|建筑相册/i.test(name))return 'album';
 if(/游戏|圣旗|帝国|afterspan|aquas|星星|关卡|见缝/i.test(name))return 'arcade';
 if(/文艺|梵高|哈利|星夜|甜境/i.test(name))return 'art';
 if(/3d|房屋|隅间|展厅|马特|法罗|尘路|雪夜|世界|漫游|空间/i.test(name))return 'spatial';
 if(/ai|研习|助手|小脏|模型/i.test(name))return 'ai';
 return 'file';
}
const captions:Record<LoadingTheme,string>={television:'正在接收信号',python:'Python → 方块世界',algorithm:'读取题目 · 准备评测',ai:'正在连接知识与灵感',spatial:'正在展开空间',album:'正在展开回忆',music:'唱针就位，音乐将至',arcade:'准备进入游戏',art:'画中旅程即将开始',file:'正在打开作品'};
export function LoadingVisual({theme}:{theme:LoadingTheme}){
 const visible=useWindowVisible();
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{if(!visible||theme!=='television')return;const c=canvas.current,ctx=c?.getContext('2d');if(!c||!ctx)return;const draw=()=>{if(document.hidden)return;const data=ctx.createImageData(96,60);for(let i=0;i<data.data.length;i+=4){const v=Math.random()*130+35;data.data[i]=v*.72;data.data[i+1]=v*.85;data.data[i+2]=v;data.data[i+3]=255}ctx.putImageData(data,0,0)};draw();if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const t=setInterval(draw,140);return()=>clearInterval(t)},[theme,visible]);
 if(theme==='television')return <div className="loading-tv" aria-hidden="true"><div className="loading-aerial"/><div className="loading-tv-case"><div className="loading-screen"><canvas ref={canvas} width={96} height={60}/><span>CTY · CH 01</span><b>正在接收信号</b></div><div className="loading-knobs"><i/><i/><em/></div></div><div className="loading-feet"/></div>;
 if(theme==='python')return <div className="load-scene load-python" aria-hidden="true"><div className="load-code"><CodeXml size={20}/><code><span>from mcpi import minecraft</span><span>world = Minecraft.create()</span><span>for floor in range(118):</span><span>　build_floor(floor)<i>▌</i></span></code></div><div className="load-chunks">{Array.from({length:20},(_,i)=><i key={i} style={{animationDelay:`${i*.11}s`}}/>)}</div></div>;
 if(theme==='algorithm')return <div className="load-scene load-algorithm" aria-hidden="true"><div className="load-bars">{[3,6,2,7,4,1,5].map((v,i)=><i key={v} style={{'--bar':v,'--index':i} as React.CSSProperties}><span>{v}</span></i>)}</div><div className="load-tests">{Array.from({length:7},(_,i)=><i key={i} style={{animationDelay:`${i*.24}s`}}>✓</i>)}</div><code>INPUT → SOLVE → CHECK</code></div>;
 if(theme==='ai')return <div className="load-scene load-ai" aria-hidden="true"><svg viewBox="0 0 280 156"><path d="M30 35L105 30L140 78L75 120L30 35M105 30L233 29L140 78L247 113L75 120M233 29L247 113"/>{[[30,35],[105,30],[233,29],[247,113],[75,120]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={5} style={{animationDelay:`${i*.3}s`}}/>)}</svg><BrainCircuit size={44}/><div className="load-thinking"><i/><i/><i/></div></div>;
 if(theme==='spatial')return <div className="load-scene load-spatial" aria-hidden="true"><span>SCENE / GEOMETRY</span><svg viewBox="0 0 280 156"><g><path d="M140 15L224 57L224 110L140 150L56 110L56 57ZM56 57L140 97L224 57M140 97V150M140 15V70M98 36L183 77L183 129M182 36L98 77L98 130M56 84L140 125L224 84"/><path className="load-slice" d="M57 57L140 97L224 57L140 15Z"/></g></svg><Box size={20}/></div>;
 if(theme==='album')return <div className="load-scene load-album" aria-hidden="true">{['family-1','family-2','family-3'].map((id,i)=><div key={id} style={{'--index':i} as React.CSSProperties}><img src={`/works/photos/${id}-thumb.webp`} alt=""/><Images size={13}/></div>)}</div>;
 if(theme==='music')return <div className="load-scene load-music" aria-hidden="true"><img src="/assets/mosaic-vinyl.webp" alt=""/><Disc3 size={34}/><div className="load-equalizer">{Array.from({length:12},(_,i)=><i key={i} style={{animationDelay:`${i*.09}s`}}/>)}</div></div>;
 if(theme==='arcade')return <div className="load-scene load-arcade" aria-hidden="true"><Gamepad2 size={78}/><code>READY PLAYER</code><div>{Array.from({length:12},(_,i)=><i key={i} style={{animationDelay:`${i*.13}s`}}/>)}</div></div>;
 if(theme==='art')return <div className="load-scene load-art" aria-hidden="true"><Palette size={66}/><div>{['#d5ac53','#568a9b','#41578a','#e0d2ab','#506e4b'].map((c,i)=><i key={c} style={{background:c,animationDelay:`${i*.18}s`}}/>)}</div></div>;
 return <div className="load-scene load-file" aria-hidden="true"><FileCode2 size={65}/><div><i/><i/><i/></div></div>;
}
export default function AppLoading({name='作品',detail='正在载入画面',onRetry,elapsed=false,theme:override}:{name?:string;detail?:string;onRetry?:()=>void;elapsed?:boolean;theme?:LoadingTheme}){
 const [seconds,setSeconds]=useState(0),theme=override||loadingTheme(name);
 useEffect(()=>setSeconds(0),[name]);
 useVisibleInterval(()=>setSeconds(s=>s+1),1000);
 return <div className={`app-loading theme-${theme}`} role="status" aria-live="polite"><LoadingVisual theme={theme}/><strong>{name}</strong><p>{detail}{elapsed&&seconds>0?` · ${seconds} 秒`:''}</p><div className="loading-caption">{captions[theme]}<span aria-hidden="true">…</span></div>{seconds>18&&onRetry&&<div className="loading-retry"><span>连接还在继续，可以稍等或重试。</span><button onClick={onRetry}>重新连接</button></div>}</div>
}
export function LoadedFrame({src,title,allow='fullscreen; autoplay; clipboard-write'}:{src?:string;title:string;allow?:string}){
 const [ready,setReady]=useState(false),[revision,setRevision]=useState(0);
 useEffect(()=>setReady(false),[src]);
 return <div className="loaded-frame"><iframe key={`${src}-${revision}`} title={title} src={src} allow={allow} allowFullScreen onLoad={()=>setReady(true)}/>{!ready&&<AppLoading key={revision} name={title} detail="正在连接并加载网页" elapsed onRetry={()=>{setReady(false);setRevision(v=>v+1)}}/>}</div>
}
