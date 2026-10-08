'use client';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {useAnimationClock} from '../AnimationScope';
import {buildDiagon} from './diagon/scene';
import {advanceTour,EYE_HEIGHT,poseAt,stepYaw,STOPS} from './diagon/route.mjs';
import './diagon/walk.css';
type WalkApi={seek:(u:number)=>void;resetLook:()=>void;snapshot:()=>void};
export default function DiagonWalk(){
 const clock=useAnimationClock(),host=useRef<HTMLDivElement>(null),api=useRef<WalkApi|null>(null),state=useRef({playing:true,speed:1,offsetYaw:0,offsetPitch:0});
 const [playing,setPlaying]=useState(true),[speed,setSpeed]=useState(1),[progress,setProgress]=useState(0),[loading,setLoading]=useState(0),[error,setError]=useState(''),[retry,setRetry]=useState(0),[photo,setPhoto]=useState(''),[help,setHelp]=useState(true),[texturesMissing,setTexturesMissing]=useState(false);
 useEffect(()=>{state.current.playing=playing;state.current.speed=speed;},[playing,speed]);
 useEffect(()=>{
  const parent=host.current;if(!parent)return;let disposed=false,raf=0,last=0,elapsed=0,u=0,targetU:number|null=null,lookYaw=0,lookPitch=0,lastReport=0,rendered=false,drag:{id:number;x:number;y:number}|null=null,slow=0;
  setLoading(0);setError('');setTexturesMissing(false);state.current.offsetYaw=state.current.offsetPitch=0;
  let renderer:T.WebGLRenderer;try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});}catch{setError('当前浏览器未能启动 3D 画面，请关闭其他大型 3D 页面后重试。');return;}
  const mobile=matchMedia('(max-width:760px)').matches;renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','对角巷第一人称夜游，拖动环顾四周，空格暂停');canvas.style.touchAction='none';parent.appendChild(canvas);
  const scene=new T.Scene();scene.background=new T.Color('#182a38');scene.fog=new T.FogExp2('#182a38',.014);
  const camera=new T.PerspectiveCamera(mobile?67:61,1,.06,180);camera.rotation.order='YXZ';
  scene.add(new T.HemisphereLight('#a6c6de','#856242',1.7));const moon=new T.DirectionalLight('#becfe7',1.6);moon.position.set(-18,35,4);moon.target.position.set(3,0,-25);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);Object.assign(moon.shadow.camera,{left:-43,right:43,top:43,bottom:-43,near:1,far:110});moon.shadow.normalBias=.035;moon.shadow.bias=-.0004;scene.add(moon,moon.target);
  const manager=new T.LoadingManager();let assetsReady=false;
  manager.onProgress=(_,loaded,total)=>{if(!disposed)setLoading(Math.min(92,Math.round(loaded/Math.max(total,1)*90)));};
  manager.onLoad=()=>{assetsReady=true;renderer.shadowMap.needsUpdate=true;};manager.onError=()=>{if(!disposed)setTexturesMissing(true);};
  let world:ReturnType<typeof buildDiagon>;try{world=buildDiagon(manager);}catch(e){renderer.dispose();canvas.remove();setError('街景创建失败，请重试。');console.error(e);return;}
  scene.add(world.group);const length=world.route.getLength(),initial=poseAt(world.route,0);let yaw=initial.yaw;camera.position.copy(initial.position);camera.rotation.y=yaw;
  const resize=()=>{const {clientWidth:w,clientHeight:h}=parent;if(w&&h){renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}};const observer=new ResizeObserver(resize);observer.observe(parent);resize();
  const down=(e:PointerEvent)=>{if(!e.isPrimary||e.button>0)return;e.preventDefault();canvas.focus({preventScroll:true});drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);setHelp(false);};
  const move=(e:PointerEvent)=>{if(!drag||e.pointerId!==drag.id)return;e.preventDefault();state.current.offsetYaw-=(e.clientX-drag.x)*.0034;state.current.offsetPitch=T.MathUtils.clamp(state.current.offsetPitch-(e.clientY-drag.y)*.0028,-.62,.85);drag.x=e.clientX;drag.y=e.clientY;};
  const up=(e:PointerEvent)=>{if(drag?.id===e.pointerId){drag=null;try{canvas.releasePointerCapture(e.pointerId);}catch{}}};
  const key=(e:KeyboardEvent)=>{if(e.key===' '){e.preventDefault();setPlaying(p=>!p);}if(e.key==='ArrowUp'||e.key.toLowerCase()==='w'){e.preventDefault();targetU=Math.min(1,u+.012);}if(e.key==='ArrowDown'||e.key.toLowerCase()==='s'){e.preventDefault();targetU=Math.max(0,u-.012);}if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a'){e.preventDefault();state.current.offsetYaw+=.08;}if(e.key==='ArrowRight'||e.key.toLowerCase()==='d'){e.preventDefault();state.current.offsetYaw-=.08;}if(e.key==='Escape'){state.current.offsetPitch=state.current.offsetYaw=0;}};
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('lostpointercapture',up);canvas.addEventListener('keydown',key);
  const lost=(e:Event)=>{e.preventDefault();setError('3D 画面暂时中断，点击重试即可重新进入。');};canvas.addEventListener('webglcontextlost',lost);
  const keysClear=()=>{drag=null;};window.addEventListener('blur',keysClear);document.addEventListener('visibilitychange',keysClear);
  api.current={seek(value){targetU=T.MathUtils.clamp(value,0,1);state.current.offsetYaw=state.current.offsetPitch=0;setHelp(false);},resetLook(){state.current.offsetYaw=state.current.offsetPitch=0;},snapshot(){renderer.render(scene,camera);setPhoto(canvas.toDataURL('image/jpeg',.9));}};
  function frame(now:number){if(disposed)return;raf=clock.requestFrame(frame);const dt=Math.min(.05,last?(now-last)/1000:0);last=now;if(document.hidden||!parent?.clientWidth||!parent.clientHeight)return;
   const s=state.current;if(assetsReady){elapsed+=dt;if(targetU!==null){const max=dt*7/length,d=targetU-u;u+=Math.sign(d)*Math.min(Math.abs(d),max);if(Math.abs(targetU-u)<.00005)targetU=null;}else if(s.playing){u=advanceTour(u,dt,.82*s.speed,length);if(u>=1){s.playing=false;setPlaying(false);}}}
   const pose=poseAt(world.route,u);yaw=stepYaw(yaw,pose.yaw,dt);lookYaw=stepYaw(lookYaw,s.offsetYaw,dt);lookPitch=T.MathUtils.lerp(lookPitch,s.offsetPitch,1-Math.exp(-10*dt));camera.position.copy(pose.position);camera.position.y=EYE_HEIGHT;camera.rotation.set(lookPitch+T.MathUtils.smoothstep(u,.84,1)*.12,yaw+lookYaw,0,'YXZ');world.tick(elapsed,camera.position);
   renderer.render(scene,camera);if(assetsReady&&!rendered){rendered=true;setLoading(100);}if(now-lastReport>250){lastReport=now;setProgress(u);}
   // Reduce raster cost once on slow devices; geometry and route quality stay unchanged.
   if(rendered&&dt>.038)slow++;else slow=Math.max(0,slow-1);if(slow>75&&renderer.getPixelRatio()>1){renderer.setPixelRatio(1);resize();slow=0;}
  }
  raf=clock.requestFrame(frame);
  return()=>{disposed=true;clock.cancelFrame(raf);observer.disconnect();api.current=null;canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('lostpointercapture',up);canvas.removeEventListener('keydown',key);canvas.removeEventListener('webglcontextlost',lost);window.removeEventListener('blur',keysClear);document.removeEventListener('visibilitychange',keysClear);world.dispose();moon.shadow.map?.dispose();renderer.dispose();canvas.remove();};
 },[clock,retry]);
 const stop=[...STOPS].reverse().find(s=>progress>=s.u-.06)||STOPS[0];
 return <div className="diagon-walk"><header className="diagon-top"><div><small>AFTER HOURS / DIAGON ALLEY</small><h2>对角巷夜游</h2></div><button onClick={()=>api.current?.snapshot()} aria-label="拍一张街景">拍照</button><button onClick={()=>api.current?.resetLook()}>视线回正</button></header><div className="diagon-stage"><div className="diagon-canvas" ref={host}/><div className="diagon-vignette"/>{loading<100&&!error&&<div className="diagon-loading"><span className="diagon-wand">✧</span><small>砖墙后的另一重世界</small><p>{loading<15?'正在打开对角巷…':'正在点亮橱窗…'}</p><div><i style={{width:`${Math.max(8,loading)}%`}}/></div><span>{loading}%</span></div>}{error&&<div className="diagon-loading" role="alert"><p>{error}</p><button onClick={()=>setRetry(v=>v+1)}>重新进入</button></div>}<aside className="diagon-caption"><small>THE WIZARDING WORLD</small><p>{stop.name}</p>{help&&<span>自动漫步 · 拖动看看橱窗与屋顶</span>}{texturesMissing&&<span>部分材质未加载，可点击重试重新载入。</span>}</aside>{photo&&<div className="diagon-photo"><img src={photo} alt="对角巷夜游拍照"/><div><a download="diagon-alley.jpg" href={photo}>保存照片</a><button onClick={()=>setPhoto('')}>返回街道</button></div></div>}</div><div className="diagon-controls"><button className="diagon-play" disabled={loading<100||!!error} onClick={()=>{if(progress>=.999){api.current?.seek(0);}setPlaying(v=>!v);}}>{progress>=.999?'再走一遍':playing?'停下来看看':'继续漫步'}</button><label>步速 <select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={.65}>慢慢走</option><option value={1}>散步</option><option value={1.4}>轻快</option></select></label><div className="diagon-route"><input aria-label="漫步路线位置" type="range" min="0" max="1000" value={Math.round(progress*1000)} onChange={e=>api.current?.seek(Number(e.target.value)/1000)}/><span>砖拱门 <b>—</b> 魔法商店 <b>—</b> 古灵阁</span></div></div><nav className="diagon-stops" aria-label="夜游地点">{STOPS.map((s,i)=><button key={s.name} onClick={()=>api.current?.seek(s.u)} aria-current={stop===s?'location':undefined}><small>0{i+1}</small>{s.name.split(' · ')[0]}</button>)}</nav></div>;
}
