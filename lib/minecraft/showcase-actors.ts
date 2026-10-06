import * as THREE from 'three';
import {loadDragon} from './dragon-model';
import {createSuppliedKakashi} from './kakashi-character';
import {createPain} from './pain-character';
import {presentHumanoid,actorTileY} from './actor-presentation';
export type CodeActor={id:number;type:string;x:number;y:number;z:number};
export type ShowcaseActor={root:THREE.Group;tick:(dt:number,time:number,moving:number,flying:boolean)=>void;dispose:()=>void};
export async function loadShowcaseActor(type:string,signal:AbortSignal,options:{compact?:boolean}={}):Promise<ShowcaseActor>{
 if(type==='fire_dragon'||type==='storm_dragon'){
  const d=await loadDragon(signal,type==='storm_dragon'?'storm':'fire');return {root:d.root,tick:(dt,t,m,f)=>d.animate(dt,t,f,m,0,0,false),dispose:d.dispose};
 }
 if(type!=='pain'&&type!=='kakashi')throw Error(`当前展览可召唤 fire_dragon、storm_dragon、pain、kakashi（收到 ${type}）。`);
 const a=type==='pain'?createPain(true):createSuppliedKakashi(true,options.compact);
 const abort=()=>a.dispose();signal.addEventListener('abort',abort,{once:true});const ok=await a.ready;signal.removeEventListener('abort',abort);
 if(!ok||signal.aborted){a.dispose();throw Error('角色贴图载入失败，请重新运行示例。');}
 return {root:a.root,tick:(_dt,t,m,f)=>a.animate(t,m,false,f),dispose:a.dispose};
}
/** Same assets and rigs as BlockCraft; each canvas owns its resources and aborts pending loads. */
export function createActorLayer(scene:THREE.Scene,status:(s:string)=>void){
 const actors=new Map<number,{actor:ShowcaseActor;target:THREE.Vector3;previous:THREE.Vector3;type:string}>(),pending=new Map<number,AbortController>();
 let current:CodeActor[]=[],disposed=false,errors='';
 const updateStatus=()=>{if(!disposed)status(errors|| (pending.size?`正在载入 ${pending.size} 个角色与贴图…`:''));};
 function set(entities:CodeActor[]){current=entities;const ids=new Set(entities.map(e=>e.id));
  for(const [id,c] of pending)if(!ids.has(id)){c.abort();pending.delete(id);}
  for(const [id,a] of actors)if(!ids.has(id)||entities.find(e=>e.id===id)?.type!==a.type){scene.remove(a.actor.root);a.actor.dispose();actors.delete(id);}
  for(const e of entities){const present=actors.get(e.id);if(present){present.target.set(e.x,actorTileY(e.type,e.y),e.z);continue;}if(pending.has(e.id))continue;
   const controller=new AbortController();pending.set(e.id,controller);errors='';
   loadShowcaseActor(e.type,controller.signal).then(loaded=>{const actor=presentHumanoid(loaded,e.type);const latest=current.find(v=>v.id===e.id&&v.type===e.type);if(disposed||controller.signal.aborted||!latest){actor.dispose();return;}actor.root.position.set(latest.x,actorTileY(latest.type,latest.y),latest.z);scene.add(actor.root);actors.set(e.id,{actor,target:actor.root.position.clone(),previous:actor.root.position.clone(),type:e.type});}).catch(error=>{if(!disposed&&!controller.signal.aborted)errors=String(error.message||error);}).finally(()=>{if(pending.get(e.id)===controller)pending.delete(e.id);updateStatus();});
  }updateStatus();
 }
 return {set,tick(dt:number,time:number){for(const a of actors.values()){const root=a.actor.root;a.previous.copy(root.position);root.position.lerp(a.target,1-Math.exp(-dt*12));const dx=root.position.x-a.previous.x,dz=root.position.z-a.previous.z,dist=Math.hypot(dx,dz);if(dist>.0001)root.rotation.y=Math.atan2(dx,dz);a.actor.tick(dt,time,Math.min(1,dist/Math.max(dt,.001)),a.type.includes('dragon')&&root.position.y>2);}},dispose(){disposed=true;pending.forEach(c=>c.abort());actors.forEach(a=>{scene.remove(a.actor.root);a.actor.dispose();});actors.clear();pending.clear();}};
}
