'use client';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {useAnimationClock} from '../AnimationScope';
import {buildDiagon} from './diagon/scene';
import {loadDiagonImages,prepareDiagon} from './diagon/assets.mjs';
import {advanceTour,EYE_HEIGHT,poseAt,stepYaw,STOPS} from './diagon/route.mjs';
import './diagon/walk.css';

type WalkApi={enter:()=>void;seek:(u:number)=>void;resetLook:()=>void;snapshot:()=>void};
const stageNames:Record<string,string>={textures:'正在收拾橱窗与石板路',geometry:'正在打开砖墙后的街道',lighting:'正在点亮街灯与玻璃橱窗',frame:'正在检查第一眼的风景',ready:'街道已准备好，夜游可以开始了'};
export default function DiagonWalk(){
 const clock=useAnimationClock(),host=useRef<HTMLDivElement>(null),api=useRef<WalkApi|null>(null);
 const state=useRef({playing:true,speed:1,entered:false,offsetYaw:0,offsetPitch:0});
 const [playing,setPlaying]=useState(true),[speed,setSpeed]=useState(1),[progress,setProgress]=useState(0),[loading,setLoading]=useState(0),[stage,setStage]=useState('textures');
 const [entered,setEntered]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0),[photo,setPhoto]=useState(''),[help,setHelp]=useState(true),[note,setNote]=useState('首次打开会稍久，准备好后再出发。');
 useEffect(()=>{state.current.playing=playing;state.current.speed=speed;},[playing,speed]);
 useEffect(()=>{
  const parent=host.current;if(!parent)return;
  const controller=new AbortController(),{signal}=controller;
  let disposed=false,failed=false,raf=0,last=0,elapsed=0,u=0,targetU:number|null=null,lookYaw=0,lookPitch=0,lastReport=0,slow=0,yaw=0,length=1,shaderFailed=false;
  let renderer:T.WebGLRenderer|undefined,world:ReturnType<typeof buildDiagon>|undefined,observer:ResizeObserver|undefined,canvas:HTMLCanvasElement|undefined;
  let drag:{id:number;x:number;y:number}|null=null;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(61,1,.06,180);
  scene.background=new T.Color('#111e2a');scene.fog=new T.FogExp2('#111e2a',.012);camera.rotation.order='YXZ';
  const moon=new T.DirectionalLight('#bacde6',1.55);moon.position.set(-18,35,4);moon.target.position.set(3,0,-25);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);Object.assign(moon.shadow.camera,{left:-43,right:43,top:43,bottom:-43,near:1,far:110});moon.shadow.camera.updateProjectionMatrix();moon.shadow.normalBias=.035;moon.shadow.bias=-.0004;
  scene.add(new T.HemisphereLight('#a0bad0','#645440',1.35),moon,moon.target);
  state.current.entered=false;state.current.offsetYaw=state.current.offsetPitch=0;
  setEntered(false);setLoading(0);setProgress(0);setError('');setStage('textures');setHelp(true);setPhoto('');setNote('首次打开会稍久，准备好后再出发。');
  const abortError=()=>new DOMException('Loading cancelled','AbortError');
  function check(){if(signal.aborted||disposed)throw abortError();}
  function fail(message:string){if(disposed||failed)return;failed=true;controller.abort();clock.cancelFrame(raf);setError(message);}
  // Only a few preparation paints use the native clock; the tour itself uses the sleeping window clock.
  function paint(){return new Promise<void>((resolve,reject)=>{
   if(signal.aborted){reject(abortError());return;}
   const stop=()=>{cancelAnimationFrame(id);reject(abortError());};
   const id=requestAnimationFrame(()=>{signal.removeEventListener('abort',stop);resolve();});signal.addEventListener('abort',stop,{once:true});
  });}
  async function bounded<TValue>(task:Promise<TValue>,ms:number){
   let timer:ReturnType<typeof setTimeout>|undefined;let cancel=()=>{};
   try{return await Promise.race([task,new Promise<never>((_,reject)=>{cancel=()=>reject(abortError());signal.addEventListener('abort',cancel,{once:true});timer=setTimeout(()=>reject(new Error('GPU preparation timed out')),ms);})]);}
   finally{clearTimeout(timer);signal.removeEventListener('abort',cancel);}
  }
  function resize(){if(!renderer)return;const w=parent!.clientWidth,h=parent!.clientHeight;if(w&&h){renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}}
  const down=(e:PointerEvent)=>{if(!state.current.entered||!e.isPrimary||e.button>0||!canvas)return;e.preventDefault();canvas.focus({preventScroll:true});drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);setHelp(false);};
  const move=(e:PointerEvent)=>{if(!drag||e.pointerId!==drag.id)return;e.preventDefault();state.current.offsetYaw-=(e.clientX-drag.x)*.0034;state.current.offsetPitch=T.MathUtils.clamp(state.current.offsetPitch-(e.clientY-drag.y)*.0028,-.62,.85);drag.x=e.clientX;drag.y=e.clientY;};
  const up=(e:PointerEvent)=>{if(drag?.id===e.pointerId){drag=null;try{canvas?.releasePointerCapture(e.pointerId);}catch{}}};
  const key=(e:KeyboardEvent)=>{if(!state.current.entered)return;if(e.key===' '){e.preventDefault();setPlaying(p=>!p);}if(e.key==='ArrowUp'||e.key.toLowerCase()==='w'){e.preventDefault();targetU=Math.min(1,u+.012);}if(e.key==='ArrowDown'||e.key.toLowerCase()==='s'){e.preventDefault();targetU=Math.max(0,u-.012);}if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a'){e.preventDefault();state.current.offsetYaw+=.08;}if(e.key==='ArrowRight'||e.key.toLowerCase()==='d'){e.preventDefault();state.current.offsetYaw-=.08;}if(e.key==='Escape'){state.current.offsetPitch=state.current.offsetYaw=0;}};
  const lost=(e:Event)=>{e.preventDefault();fail('3D 画面被浏览器中断了，点击重试可以重新准备街景。');};
  const keysClear=()=>{drag=null;};
  function frame(now:number){
   if(disposed||failed||!world||!renderer)return;
   const dt=Math.min(.05,last?(now-last)/1000:0);last=now;
   if(!document.hidden&&parent?.clientWidth&&parent.clientHeight){
    try{
     const s=state.current;elapsed+=dt;
     if(s.entered){if(targetU!==null){const max=dt*7/length,d=targetU-u;u+=Math.sign(d)*Math.min(Math.abs(d),max);if(Math.abs(targetU-u)<.00005)targetU=null;}else if(s.playing){u=advanceTour(u,dt,.82*s.speed,length);if(u>=1){s.playing=false;setPlaying(false);}}}
     const pose=poseAt(world.route,u);yaw=stepYaw(yaw,pose.yaw,dt);lookYaw=stepYaw(lookYaw,s.offsetYaw,dt);lookPitch=T.MathUtils.lerp(lookPitch,s.offsetPitch,1-Math.exp(-10*dt));camera.position.copy(pose.position);camera.position.y=EYE_HEIGHT;camera.rotation.set(lookPitch+T.MathUtils.smoothstep(u,.84,1)*.12,yaw+lookYaw,0,'YXZ');world.tick(elapsed,camera.position);renderer.render(scene,camera);
     if(now-lastReport>250){lastReport=now;setProgress(u);}
     if(s.entered&&dt>.038)slow++;else slow=Math.max(0,slow-1);if(slow>75&&renderer.getPixelRatio()>1){renderer.setPixelRatio(1);resize();slow=0;}
    }catch(e){console.error('Diagon Alley render failed',e);fail('画面绘制未完成，请重试重新准备街景。');return;}
   }
   raf=clock.requestFrame(frame);
  }
  async function initialize(){
   try{
    await paint();
    await prepareDiagon({signal,
     load:()=>loadDiagonImages({signal,onProgress:(done:number,total:number)=>{if(!disposed){setLoading(Math.round(done/total*65));setNote(`已准备 ${done} / ${total} 组材质`);}},onRetry:(_url:string,n:number)=>{if(!disposed)setNote(`有一组材质需要重新连接，正在第 ${n} 次重试…`);}}),
     build:async(images:Map<string,HTMLImageElement>)=>{
      await paint();check();world=buildDiagon(images);scene.add(world.group);length=world.route.getLength();const initial=poseAt(world.route,0);yaw=initial.yaw;camera.position.copy(initial.position);camera.rotation.y=yaw;
      const mobile=matchMedia('(max-width:760px)').matches;
      renderer=new T.WebGLRenderer({antialias:!mobile,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.17;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
      canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','对角巷第一人称夜游，拖动环顾四周，空格暂停');canvas.style.touchAction='none';parent!.appendChild(canvas);camera.fov=mobile?67:61;
      observer=new ResizeObserver(resize);observer.observe(parent!);resize();
      canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('lostpointercapture',up);canvas.addEventListener('keydown',key);canvas.addEventListener('webglcontextlost',lost);window.addEventListener('blur',keysClear);document.addEventListener('visibilitychange',keysClear);
      return world;
     },
     warm:async()=>{
      await paint();check();world!.tick(0,camera.position);shaderFailed=false;renderer!.debug.onShaderError=()=>{shaderFailed=true;};
      for(let i=0;i<world!.textures.length;i++){renderer!.initTexture(world!.textures[i]);if(i%4===3){await paint();check();}}
      await bounded(renderer!.compileAsync(scene,camera),45000);check();if(shaderFailed)throw new Error('Shader compilation failed');
     },
     render:async()=>{check();resize();renderer!.shadowMap.needsUpdate=true;renderer!.render(scene,camera);await paint();check();renderer!.render(scene,camera);if(shaderFailed)throw new Error('Shader compilation failed');if(renderer!.getContext().isContextLost())throw new Error('WebGL context lost');},
     onStage:(value:string)=>{if(disposed)return;setStage(value);if(value!=='textures')setLoading({geometry:70,lighting:82,frame:96,ready:100}[value]??0);}
    });
    check();setNote('材质、灯光与画面均已就绪。');
    api.current={enter(){if(failed||disposed)return;state.current.entered=true;state.current.playing=true;setPlaying(true);setEntered(true);last=0;canvas?.focus({preventScroll:true});},seek(value){if(!state.current.entered)return;targetU=T.MathUtils.clamp(value,0,1);state.current.offsetYaw=state.current.offsetPitch=0;setHelp(false);},resetLook(){state.current.offsetYaw=state.current.offsetPitch=0;},snapshot(){if(!renderer||!canvas||!state.current.entered)return;renderer.render(scene,camera);setPhoto(canvas.toDataURL('image/jpeg',.9));}};
    raf=clock.requestFrame(frame);
   }catch(e){if(disposed||signal.aborted)return;console.error('Diagon Alley preparation failed',e);fail('街景还没准备完整。可能是材质连接中断或 3D 画面初始化失败，请点击重试。');}
  }
  void initialize();
  return()=>{disposed=true;controller.abort();clock.cancelFrame(raf);observer?.disconnect();api.current=null;canvas?.removeEventListener('pointerdown',down);canvas?.removeEventListener('pointermove',move);canvas?.removeEventListener('pointerup',up);canvas?.removeEventListener('pointercancel',up);canvas?.removeEventListener('lostpointercapture',up);canvas?.removeEventListener('keydown',key);canvas?.removeEventListener('webglcontextlost',lost);window.removeEventListener('blur',keysClear);document.removeEventListener('visibilitychange',keysClear);world?.dispose();moon.shadow.map?.dispose();renderer?.dispose();canvas?.remove();};
 },[clock,retry]);
 const stop=[...STOPS].reverse().find(s=>progress>=s.u-.06)||STOPS[0],interactive=entered&&!error;
 return <div className="diagon-walk"><header className="diagon-top"><div><small>AFTER HOURS / DIAGON ALLEY</small><h2>对角巷夜游</h2></div><button disabled={!interactive} onClick={()=>api.current?.snapshot()} aria-label="拍一张街景">拍照</button><button disabled={!interactive} onClick={()=>api.current?.resetLook()}>视线回正</button></header>
  <div className={`diagon-stage ${entered?'is-entered':''}`}><div className="diagon-canvas" ref={host}/><div className="diagon-vignette"/>
   {!entered&&!error&&<div className="diagon-loading" role="status" aria-live="polite"><div className="diagon-door" aria-hidden="true"><i/><i/><i/><span>✦</span></div><small>砖墙后的另一重世界</small><p>{stageNames[stage]}</p><div className="diagon-load-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={loading} aria-label="街景准备进度"><i style={{width:`${loading}%`}}/></div><span>{loading}%</span><em>{note}</em>{loading===100&&<button className="diagon-enter" onClick={()=>api.current?.enter()}>进入对角巷 <span>→</span></button>}</div>}
   {error&&<div className="diagon-loading" role="alert"><span className="diagon-wand">✧</span><small>稍等，砖墙还没打开</small><p>{error}</p><button onClick={()=>setRetry(v=>v+1)}>重新准备街景</button></div>}
   {entered&&<aside className="diagon-caption"><small>THE WIZARDING WORLD</small><p>{stop.name}</p>{help&&<span>自动漫步 · 拖动看看橱窗与屋顶</span>}</aside>}
   {photo&&<div className="diagon-photo"><img src={photo} alt="对角巷夜游拍照"/><div><a download="diagon-alley.jpg" href={photo}>保存照片</a><button onClick={()=>setPhoto('')}>返回街道</button></div></div>}
  </div>
  <div className="diagon-controls"><button className="diagon-play" disabled={!interactive} onClick={()=>{if(progress>=.999)api.current?.seek(0);setPlaying(v=>!v);}}>{progress>=.999?'再走一遍':playing?'停下来看看':'继续漫步'}</button><label>步速 <select disabled={!interactive} value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={.65}>慢慢走</option><option value={1}>散步</option><option value={1.4}>轻快</option></select></label><div className="diagon-route"><input disabled={!interactive} aria-label="漫步路线位置" type="range" min="0" max="1000" value={Math.round(progress*1000)} onChange={e=>api.current?.seek(Number(e.target.value)/1000)}/><span>砖拱门 <b>—</b> 魔法商店 <b>—</b> 古灵阁</span></div></div>
  <nav className="diagon-stops" aria-label="夜游地点">{STOPS.map((s,i)=><button disabled={!interactive} key={s.name} onClick={()=>api.current?.seek(s.u)} aria-current={stop===s?'location':undefined}><small>0{i+1}</small>{s.name.split(' · ')[0]}</button>)}</nav>
 </div>;
}
