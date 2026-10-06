import * as THREE from 'three';
import {decodeVillageDistance} from './village-codec';
import VillageWorker from './village-worker?worker';

/** One worker per open scene; transferable buffers never duplicate the village. */
export function createVillageDecoder(){
 let worker:Worker|undefined,sequence=0,closed=false;
 const pending=new Map<number,{resolve:(g:THREE.BufferGeometry)=>void;reject:(e:Error)=>void}>();
 const stop=(error:Error)=>{closed=true;worker?.terminate();pending.forEach(job=>job.reject(error));pending.clear();};
 // Vite owns the public URL. Vinext rewrites import.meta.url during RSC analysis,
 // so constructing a worker from that value can accidentally produce file:///.
 try{if(typeof Worker!=='undefined')worker=new VillageWorker();}catch{/* Browsers without worker support still load the same assets. */}
 if(worker){
  worker.onmessage=({data})=>{const job=pending.get(data.id);if(!job)return;pending.delete(data.id);if(data.error){job.reject(Error(data.error));return;}
   const geometry=new THREE.BufferGeometry();
   for(const [name,attribute] of Object.entries(data.attributes) as [string,{array:Uint16Array|Uint8Array|Int8Array;itemSize:number;normalized:boolean}][])geometry.setAttribute(name,new THREE.BufferAttribute(attribute.array,attribute.itemSize,attribute.normalized));
   geometry.setIndex(new THREE.BufferAttribute(data.index,1));geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3().fromArray(data.sphere.center),data.sphere.radius);job.resolve(geometry);
  };
  worker.onerror=()=>stop(Error('村庄解码未完成，请重新载入'));
 }
 return {
  decode(buffer:ArrayBuffer):Promise<THREE.BufferGeometry>{
   if(closed)return Promise.reject(new DOMException('场景已关闭','AbortError'));
   if(!worker)return Promise.resolve(decodeVillageDistance(buffer));
   return new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});worker!.postMessage({id,buffer},[buffer]);});
  },
  dispose(){stop(new DOMException('场景已关闭','AbortError'));},
 };
}
