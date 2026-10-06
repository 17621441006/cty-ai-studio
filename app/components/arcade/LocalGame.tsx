'use client';
import {useWindowVisible} from '@/app/components/AnimationScope';
import {useEffect,useRef,useState} from 'react';
import {Maximize2,RotateCw} from 'lucide-react';
import AppLoading from '../AppLoading';
const games={
 inkwave:{name:'INKWAVE · 墨浪',src:'/games/inkwave/index.html?map=halyard&skipTitle=1',help:'电脑对战 · WASD 移动 · 鼠标瞄准/开火 · Shift 潜墨 · 空格跳跃 · Esc 暂停；触屏建议横屏'},
 loire:{name:'圣旗纪元 · 卢瓦尔河畔',src:'/games/loire/index.html',help:'点选 / 框选部队 · 右键下令 · 贞德骑乘建议使用电脑键盘'},
 afterspan:{name:'AFTERSPAN · 时隙',src:'/games/afterspan/index.html',help:'A / D 移动 · 空格跳跃 · Q 切换时空 · 手机可用屏幕按键'},
};
export default function LocalGame({id,active=true}:{id:keyof typeof games;active?:boolean}){
 const visible=useWindowVisible();
 const frame=useRef<HTMLIFrameElement>(null),stage=useRef<HTMLDivElement>(null),[loaded,setLoaded]=useState(false),[revision,setRevision]=useState(0),[error,setError]=useState('');const game=games[id];
 function visibility(){frame.current?.contentWindow?.postMessage({type:'cty:game-visibility',active:active&&visible&&!document.hidden},location.origin)}
 useEffect(()=>{const receive=(e:MessageEvent)=>{if(e.source!==frame.current?.contentWindow||e.origin!==location.origin)return;if(e.data?.type==='cty:inkwave-error')setError(e.data.message);if(e.data?.type==='cty:inkwave-ready')setError('')};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive)},[]);
 useEffect(()=>{visibility();document.addEventListener('visibilitychange',visibility);return()=>document.removeEventListener('visibilitychange',visibility)},[active,visible,loaded,id]);
 return <div className="local-game"><div className="local-game-stage" ref={stage}><iframe key={id+revision} ref={frame} src={game.src} title={game.name+'试玩'} allow="fullscreen; autoplay" allowFullScreen onLoad={()=>{setLoaded(true);visibility()}}/>{!loaded&&<AppLoading name={game.name} detail="正在载入游戏与场景资源"/>}{!active&&<div className="game-suspended"><p>游戏已暂停，回到窗口后继续。</p></div>}</div><footer className="local-game-toolbar"><span role="status">{error||game.help}</span><div><button onClick={()=>{if(window.confirm(id==='loire'?'重新开始这场战役？当前战局会重置。':id==='inkwave'?'重新载入墨浪？当前对局会重新开始，装备设置会保留。':'重新载入游戏？已保存的关卡进度会保留。')){setLoaded(false);setRevision(v=>v+1)}}} aria-label="重新载入游戏"><RotateCw size={14}/></button><button onClick={()=>{setError('');stage.current?.requestFullscreen?.().catch(()=>setError('请用窗口右上角的最大化按钮展开。'))}}><Maximize2 size={14}/>全屏</button></div></footer></div>;
}
