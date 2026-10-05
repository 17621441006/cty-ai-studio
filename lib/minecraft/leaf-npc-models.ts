import * as THREE from 'three';
import type {LeafModel} from './types';
import {createTeacherAnimation,type TeacherAttention} from './leaf-npc-animation';
import {applyTeacherProportions} from './character-proportions';
type Actor={root:THREE.Group;animate:(time:number,moving:boolean,attention?:TeacherAttention)=>void;dispose:()=>void};

export function disposeLeafModel(object:THREE.Object3D){
 const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),skeletons=new Set<THREE.Skeleton>(),textures=new Set<THREE.Texture>();
 object.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);const map=(m as THREE.MeshStandardMaterial).map;if(map)textures.add(map);}if(o instanceof THREE.SkinnedMesh)skeletons.add(o.skeleton);}});
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());skeletons.forEach(s=>s.dispose());textures.forEach(t=>t.dispose());
}
/** Each consumer owns its skin and textures; portrait, NPC and hero never share a pose. */
export async function loadLeafModel(key:LeafModel,signal:AbortSignal){
 const response=await fetch(`/works/minecraft/models/leaf/${key}.json.gz?rig=2`,{signal:AbortSignal.any([signal,AbortSignal.timeout(30000)])});
 if(!response.ok)throw Error('角色模型下载失败');let bytes=await response.arrayBuffer();const header=new Uint8Array(bytes);
 if(header[0]===31&&header[1]===139)bytes=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 signal.throwIfAborted();const model=new THREE.ObjectLoader().parse(JSON.parse(new TextDecoder().decode(bytes)));
 try{
  const files=new Map<string,Promise<THREE.Texture>>(),pending:Promise<void>[]=[];
  model.traverse(o=>{if(!(o instanceof THREE.Mesh))return;for(const m of Array.isArray(o.material)?o.material:[o.material]){const material=m as THREE.MeshStandardMaterial,file=material.userData.texture;if(!file)continue;
   if(!files.has(file))files.set(file,new THREE.TextureLoader().loadAsync('/works/minecraft/models/leaf/'+file).then(t=>{t.colorSpace=THREE.SRGBColorSpace;t.flipY=material.userData.flipY!==false;t.anisotropy=4;return t;}));
   pending.push(files.get(file)!.then(t=>{material.map=t;material.needsUpdate=true;}));
  }o.castShadow=true;o.receiveShadow=true;});
  const results=await Promise.allSettled(pending);signal.throwIfAborted();if(results.some(r=>r.status==='rejected'))throw Error('角色纹理加载失败');
  return model;
 }catch(error){disposeLeafModel(model);throw error;}
}

/** Load when a teaching station enters view. */
export function createLeafNPC(key:LeafModel,fallback:Actor):Actor{
 const root=new THREE.Group();applyTeacherProportions(root,key);root.add(fallback.root);let disposed=false,loading=false,model:THREE.Object3D|null=null,retryAt=0;
 let animation:ReturnType<typeof createTeacherAnimation>|null=null;const abort=new AbortController();
 async function load(){if(disposed||model||loading||performance.now()<retryAt)return;loading=true;let candidate:THREE.Object3D|null=null;
  try{candidate=await loadLeafModel(key,abort.signal);if(disposed)throw Error('disposed');animation=createTeacherAnimation(candidate,key);model=candidate;candidate=null;root.remove(fallback.root);fallback.dispose();root.add(model);}
  catch{if(candidate)disposeLeafModel(candidate);if(!disposed){retryAt=performance.now()+30000;console.warn('Teaching model will retry',key);}}
  finally{loading=false;}
 }
 return {root,animate(time,moving,attention){if(!root.visible)return;if(!model){void load();fallback.animate(time,moving);return;}animation?.update(time,attention);},dispose(){disposed=true;abort.abort();if(model)disposeLeafModel(model);else fallback.dispose();animation=null;}};
}
