'use client';
import {useEffect,useRef,useState} from 'react';
import {Maximize2,RotateCw} from 'lucide-react';
import {AppId,AppInfo} from '@/lib/desktop-apps';
import Icon from './DesktopIcon';
const MusicRooms=dynamic(()=>import('./MusicRooms'),{ssr:false,loading:()=> <AppLoading name="音乐房间"/>});
const MoonPlayer=dynamic(()=>import('./MusicRooms').then(m=>m.MoonPlayer),{ssr:false,loading:()=> <AppLoading name="月相唱机"/>});
import OriginalWorld,{originalWorlds} from './OriginalWorld';
import dynamic from 'next/dynamic';
import AppLoading from './AppLoading';
import {useWindowVisible} from './AnimationScope';
const ArtTours=dynamic(()=>import('./ArtTours'),{ssr:false});
const DragonFlight=dynamic(()=>import('./worlds/DragonFlight'),{ssr:false,loading:()=> <AppLoading name="尘路 · 龙背上的木叶" detail="正在载入飞行引擎"/>});
const FocusWorld=dynamic(()=>import('./worlds/FocusWorld'),{ssr:false,loading:()=> <AppLoading name="创作世界" detail="正在载入场景引擎"/>});
const WorldExhibit=dynamic(()=>import('./worlds/WorldExhibit'),{ssr:false,loading:()=> <AppLoading name="创作世界" detail="正在载入场景引擎"/>});
import catalogue from './benchmark-data.json';
import {batchFor,rebuildBatches} from './rebuild-plan';
const LocalGame=dynamic(()=>import('./arcade/LocalGame'),{ssr:false,loading:()=> <AppLoading name="游戏机" detail="正在载入游戏"/>});
import ArcadeWork,{arcadeIds} from './arcade/ArcadeWork';
type Demo={group:string;model:string;title:string;path:string;viewport:{width:number;height:number};scroll:boolean;video?:string};
const demos:Demo[]=catalogue;
const modelNames:Record<string,string>={opus:'Opus 5.5',sol:'GPT-6 Sol',luna:'GPT-6 Luna',astra:'GPT-6 Astra'};
const groups=[['pelican','鹈鹕骑车'],['websites','十种网站'],['dinosaur','恐龙小城'],['promo','创作短片'],['matterhorn','雪山 3D']];
const asset=(path:string)=>'/works/benchmark/'+path;
function Movie({demo}:{demo:Demo}){const video=useRef<HTMLVideoElement>(null),visible=useWindowVisible();useEffect(()=>{if(!visible)video.current?.pause()},[visible]);return <div className="local-cinema"><header><b>{demo.title}</b><span>模型创作短片</span></header><video ref={video} key={demo.video} src={asset(demo.video!)} controls playsInline preload="none" poster={demo.model==='opus'?asset('covers/opus-promo-cover.webp'):undefined}/></div>}
function FittedDemo({demo}:{demo:Demo}){
 const visible=useWindowVisible();
 useEffect(()=>{if(!visible)setLoaded(false)},[visible]);
 const container=useRef<HTMLDivElement>(null),frame=useRef<HTMLIFrameElement>(null),[box,setBox]=useState({w:1,h:1}),[fit,setFit]=useState(true),[revision,setRevision]=useState(0),[fullError,setFullError]=useState(false),[loaded,setLoaded]=useState(false);
 useEffect(()=>{const el=container.current;if(!el)return;const observer=new ResizeObserver(entries=>{const rect=entries[0].contentRect;setBox({w:Math.max(1,rect.width),h:Math.max(1,rect.height)})});observer.observe(el);return()=>observer.disconnect()},[]);
 const scale=fit?Math.min(1,box.w/demo.viewport.width,box.h/demo.viewport.height):1;
 return <><div ref={container} className="fitted-stage" style={!fit?{overflow:'auto',display:'block'}:undefined}><div className="fitted-canvas" style={{width:demo.viewport.width*scale,height:demo.viewport.height*scale,...(!fit?{position:'relative',top:0,left:0,transform:'none'}:{})}}>{visible&&<iframe ref={frame} onLoad={()=>setLoaded(true)} key={demo.path+revision} src={asset(demo.path)} title={demo.title+' · '+modelNames[demo.model]} width={demo.viewport.width} height={demo.viewport.height} style={{width:demo.viewport.width,height:demo.viewport.height,transform:`scale(${scale})`}} sandbox="allow-scripts allow-same-origin allow-downloads allow-pointer-lock" allow="fullscreen; autoplay" allowFullScreen/>}</div>{!loaded&&<AppLoading name={demo.title} detail="正在载入作品"/>}</div><div className="local-work-status"><span>{fullError?'请用窗口右上角最大化。':fit?'完整画面 · '+Math.round(scale*100)+'%':demo.scroll?'原尺寸 · 向下滚动浏览':'原尺寸 · 可滚动查看'}</span><button onClick={()=>setFit(v=>!v)}>{fit?'原尺寸':'适应窗口'}</button><button aria-label="重播作品" onClick={()=>{setLoaded(false);setRevision(v=>v+1)}}><RotateCw size={14}/></button><button aria-label="全屏作品" onClick={()=>{setFullError(false);frame.current?.requestFullscreen?.().catch(()=>setFullError(true))}}><Maximize2 size={14}/></button></div></>;
}
function Benchmark({cinema=false}:{cinema?:boolean}){
 const [group,setGroup]=useState(cinema?'promo':'pelican'),[selected,setSelected]=useState('');const options=demos.filter(d=>d.group===group),demo=options.find(d=>d.path===selected)||options[0];
 return <div className="local-work">{!cinema&&<nav className="local-work-toolbar" aria-label="作品分类">{groups.map(([id,title])=><button key={id} className={group===id?'chosen':''} onClick={()=>{setGroup(id);setSelected('')}}>{title}</button>)}<span>21 WORKS</span></nav>}<div className="benchmark-variants">{group==='websites'?<select aria-label="选择网站作品" value={demo.path} onChange={e=>setSelected(e.target.value)} style={{background:'#102841',border:'1px solid #65735e',color:'#e6cf98',padding:'7px 10px',maxWidth:'100%',fontSize:14}}>{options.map(d=><option key={d.path} value={d.path}>{modelNames[d.model]} · {d.title}</option>)}</select>:options.map(d=><button key={d.path} onClick={()=>setSelected(d.path)} className={demo.path===d.path?'chosen':''}>{modelNames[d.model]}</button>)}<span>{demo.title}</span></div>{demo.video?<Movie demo={demo}/>:<FittedDemo key={demo.path} demo={demo}/>}</div>;
}
export default function LocalWork({app,open,active=true}:{app:AppInfo;open:(id:AppId)=>void;active?:boolean}){
 if(app.id==='zp-vangogh-tour'||app.id==='zp-wizard-tour')return <ArtTours world={app.id==='zp-vangogh-tour'?'vangogh':'wizard'} active={active}/>;
 if(app.id==='zp-inkwave')return <LocalGame id="inkwave" active={active}/>;
 if(app.id==='zp-loire'||app.id==='zp-afterspan')return <LocalGame id={app.id==='zp-loire'?'loire':'afterspan'} active={active}/>;
 if(arcadeIds.includes(app.id.replace(/^zp-/,'')))return <ArcadeWork id={app.id.replace(/^zp-/,'')}/>;
 if(app.id==='zp-rooms'||app.id==='zp-music-rooms')return <MusicRooms/>;
 if(app.id.startsWith('zp-room-'))return <MusicRooms initialRoom={app.id.replace('zp-room-','')}/>;
 if(app.id==='zp-original-music')return <MoonPlayer/>;
 if(app.id in originalWorlds)return <OriginalWorld id={app.id as keyof typeof originalWorlds}/>;
 if(app.id==='zp-pixel-focus')return <FocusWorld/>;
 if(app.id==='zp-dust-road')return <DragonFlight active={active}/>;

 if(app.id==='zp-stillroom')return <WorldExhibit kind="room"/>;

 if(app.id==='zp-benchmark')return <Benchmark/>;
 if(app.id==='zp-tv'||app.id==='zp-promo')return <Benchmark cinema/>;
 const id=app.referenceId||app.id.replace(/^zp-/,''),batch=batchFor(id),overview=app.id==='zp-desktop';
 return <div className="rebuild-view"><div className="rebuild-intro"><Icon n={app.icon}/><div><small>{overview?'CTY STUDIO · 作品迁入计划':app.id==='zp-next-ai'?'等待新作品':`第 ${batch.number} 批 · 待重构`}</small><h2>{overview?'作品慢慢搬进来。':app.name}</h2><p>{overview?'第五批已补充甜品资料与长旅存档。精细的雪山、群岛和微缩世界恢复原版场景；游戏保留主要规则与场景。':app.description}</p>{!overview&&<p>这个位置留给下一项 AI 作品，内容确定后再加入。</p>}</div></div><div className="rebuild-list">{rebuildBatches.filter(b=>overview||b.number===batch.number).map(b=><section key={b.number} className={'rebuild-batch '+(b.number===(overview?1:batch.number)?'current':'')}><header><span>0{b.number}</span><h3>{b.title}</h3><small>{b.state}</small></header><p>{b.works}</p><p>{b.details}</p></section>)}</div><button className="gold-button" onClick={()=>open('zp-benchmark')}>进入 AI 创作实验室</button>{!overview&&<button className="rebuild-plan-link" onClick={()=>open('zp-desktop')}>查看全部重构安排</button>}</div>;
}
