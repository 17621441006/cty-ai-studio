'use client';
import {useAnimationClock} from "@/app/components/AnimationScope";
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {loadDragon} from '@/lib/minecraft/dragon-model';
import {loadShowcaseActor,type ShowcaseActor} from '@/lib/minecraft/showcase-actors';
import {loadShowcaseVillage} from '@/lib/minecraft/village-showcase';
import {flightRoute,poseRider} from '@/lib/minecraft/flight-route';
import AppLoading from '../AppLoading';
type View='follow'|'side'|'rider';
export default function DragonFlight({active=true}:{active?:boolean}){
 const animationClock=useAnimationClock(),{requestFrame,cancelFrame}=animationClock;
 const host=useRef<HTMLDivElement>(null),[loaded,setLoaded]=useState(false),[progress,setProgress]=useState(0),[error,setError]=useState(''),[revision,setRevision]=useState(0),[view,setView]=useState<View>('follow'),[flying,setFlying]=useState(true),[speed,setSpeed]=useState(1),[duration,setDuration]=useState(25),[remaining,setRemaining]=useState(25*60),[focusing,setFocusing]=useState(false),[completed,setCompleted]=useState(false);
 const prefs=useRef({active,view,flying,speed});prefs.current={active,view,flying,speed};
 useEffect(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)setFlying(false)},[]);
 useEffect(()=>{if(!focusing||!active)return;let previous=performance.now();const id=setInterval(()=>{const now=performance.now(),dt=Math.min(2,(now-previous)/1000);previous=now;if(!document.hidden)setRemaining(r=>Math.max(0,r-dt));},250);return()=>clearInterval(id)},[focusing,active]);
 useEffect(()=>{if(remaining===0&&focusing){setFocusing(false);setCompleted(true);}},[remaining,focusing]);
 useEffect(()=>{const el=host.current;if(!el)return;const abort=new AbortController();let disposed=false,raf=0,dragon:Awaited<ReturnType<typeof loadDragon>>|undefined,rider:ShowcaseActor|undefined,village:Awaited<ReturnType<typeof loadShowcaseVillage>>|undefined;setLoaded(false);setError('');setProgress(0);
 let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:innerWidth>760,powerPreference:'high-performance'});}catch{setError('当前浏览器无法启用 3D 加速，请使用支持 WebGL 的浏览器打开。');return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1.25:1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;el.appendChild(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#afd1e4');scene.fog=new THREE.Fog('#bfd3d9',380,1050);
 scene.add(new THREE.HemisphereLight('#d9edff','#665a44',2.2));const sun=new THREE.DirectionalLight('#fff0cf',2.4);sun.position.set(-450,450,700);scene.add(sun);const fill=new THREE.DirectionalLight('#b0d2f3',.7);fill.position.set(-950,100,400);scene.add(fill);
 const camera=new THREE.PerspectiveCamera(51,1,.15,1400);const resize=()=>{if(!el.clientWidth||!el.clientHeight)return;renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();};const ro=new ResizeObserver(resize);ro.observe(el);resize();
 const center=new THREE.Vector3(),forward=new THREE.Vector3(),right=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),eye=new THREE.Vector3(),look=new THREE.Vector3();let distance=0,time=0,last=performance.now(),first=true;
 const load=async()=>{try{await Promise.all([
  loadShowcaseVillage(scene,abort.signal,p=>{if(!disposed)setProgress(Math.round(p*80));}).then(v=>{if(disposed)v.dispose();else village=v;}),
  loadDragon(abort.signal).then(d=>{if(disposed)d.dispose();else{dragon=d;scene.add(d.root);}}),
  loadShowcaseActor('kakashi',abort.signal).then(a=>{if(disposed)a.dispose();else{rider=a;scene.add(a.root);}}),
 ]);if(disposed)return;setProgress(100);setLoaded(true);last=performance.now();tick();}catch(e){if(!disposed){abort.abort();setError(e instanceof Error?e.message:'场景载入失败，请重试。');}}};
 function tick(){if(disposed)return;raf=requestFrame(tick);const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;if(document.hidden||!prefs.current.active)return;if(!dragon||!rider)return;const cfg=prefs.current;if(cfg.flying){distance=(distance+dt*cfg.speed/160)%1;time+=dt;}flightRoute.getPointAt(distance,center);flightRoute.getTangentAt(distance,forward).normalize();const yaw=Math.atan2(forward.x,forward.z);right.crossVectors(up,forward).normalize();
  dragon.root.position.copy(center);dragon.root.rotation.set(0,yaw,0);dragon.animate(cfg.flying?dt:0,time,true,cfg.flying?8*cfg.speed:0,Math.sin(time*.3)*.12,forward.y*8,false);
  rider.root.position.copy(center).addScaledVector(up,1.25);rider.root.rotation.set(0,yaw,0);rider.tick(cfg.flying?dt:0,time,0,true);poseRider(rider.root);rider.root.visible=cfg.view!=='rider';
  if(cfg.view==='side'){eye.copy(center).addScaledVector(right,13).addScaledVector(forward,-5).addScaledVector(up,8);look.copy(center).addScaledVector(forward,3).addScaledVector(up,1.7);}else if(cfg.view==='rider'){eye.copy(center).addScaledVector(up,3.3).addScaledVector(forward,1);look.copy(center).addScaledVector(forward,30).addScaledVector(up,3);}else{eye.copy(center).addScaledVector(forward,-13).addScaledVector(right,5).addScaledVector(up,8);look.copy(center).addScaledVector(forward,7).addScaledVector(up,2);}
  // Snap modes instead of sweeping the camera through the rider or nearby terrain.
  if(first||camera.userData.view!==cfg.view){camera.position.copy(eye);first=false;}else camera.position.lerp(eye,1-Math.exp(-dt*7));camera.userData.view=cfg.view;camera.lookAt(look);renderer.render(scene,camera);
 }
 void load();return()=>{disposed=true;cancelFrame(raf);abort.abort();ro.disconnect();dragon?.dispose();rider?.dispose();village?.dispose();renderer.dispose();renderer.domElement.remove();};
 },[revision]);
 const timeText=`${Math.floor(remaining/60).toString().padStart(2,'0')}:${Math.floor(remaining%60).toString().padStart(2,'0')}`;
 return <div className="dragon-flight"><div className="dragon-flight-tools"><span>尘路 <small>· 龙背上的木叶</small></span><div role="group" aria-label="飞行视角">{([['follow','跟随'],['side','侧观'],['rider','龙背']] as const).map(([id,label])=><button key={id} aria-pressed={view===id} onClick={()=>setView(id)}>{label}</button>)}</div><label>速度 <select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={.6}>悠游</option><option value={1}>巡航</option><option value={1.4}>疾行</option></select></label><button onClick={()=>setFlying(v=>!v)} disabled={!loaded}>{flying?'暂停飞行':'继续飞行'}</button></div><div className="dragon-flight-stage"><div ref={host} className="dragon-flight-canvas"/>{!loaded&&!error&&<AppLoading name="尘路 · 龙背上的木叶" detail={progress<80?`正在展开木叶村 · ${progress}%`:'木叶村已就绪 · 正在载入卡卡西与龙'} elapsed/>}{error&&<div className="flight-error" role="alert"><p>{error}</p><button onClick={()=>setRevision(n=>n+1)}>重新载入</button></div>}{loaded&&<><div className="flight-caption"><span>HIDDEN LEAF VILLAGE</span><p>村口 · 火影大楼 · 火影岩</p></div><section className="flight-focus" aria-label="飞行专注计时器"><small>{completed?'一段专注，已经抵达。':focusing?'专注中 · 山川慢慢经过':'让世界陪你专注'}</small><output>{timeText}</output><div>{[15,25,50].map(m=><button key={m} disabled={focusing} aria-pressed={duration===m} onClick={()=>{setDuration(m);setRemaining(m*60);setCompleted(false)}}>{m} 分</button>)}</div><button className="gold-button" onClick={()=>{if(completed){setRemaining(duration*60);setCompleted(false);}setFocusing(v=>!v)}}>{focusing?'暂停计时':completed?'再出发':'开始专注'}</button></section></>}</div></div>;
}
