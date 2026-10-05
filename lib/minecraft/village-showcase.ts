import * as THREE from 'three';
import metadata from './village-data.json';
import {decodeVillageDistance,applyLeafBlockShader} from './village-codec';
const base='/works/minecraft';
/** The original v48 integer-block village, with its original texture atlas. */
export async function loadShowcaseVillage(scene:THREE.Scene,signal:AbortSignal,onProgress:(n:number)=>void){
 const group=new THREE.Group();group.name='木叶村 · v48';const materials=new Map<string,THREE.MeshStandardMaterial>();let texture:THREE.Texture|undefined;
 const dispose=()=>{scene.remove(group);group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose()});materials.forEach(m=>m.dispose());materials.clear();texture?.dispose();group.clear();};
 signal.addEventListener('abort',dispose,{once:true});
 try{
  texture=await new THREE.TextureLoader().loadAsync(base+'/regions/hidden-leaf/village-atlas-v26.webp');signal.throwIfAborted();texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;
  const colors:Record<number,string>={1:'#999990',2:'#73913e',3:'#826643',4:'#868e88',5:'#b48a4e',7:'#3f4243',9:'#398ba4',12:'#c6b18a',17:'#6a4d32',18:'#526b31',35:'#dbd6ba',41:'#d6a64f',45:'#af6141',89:'#edc280',98:'#858e8b'};
  const material=(id:number,data:number)=>{const key=id+':'+data;if(materials.has(key))return materials.get(key)!;const m=new THREE.MeshStandardMaterial({color:id===251?'#ffffff':colors[id]||'#949987',roughness:id===9?.3:.95,metalness:0});if(id===251){m.map=texture!;m.onBeforeCompile=applyLeafBlockShader;m.customProgramCacheKey=()=> 'cty-leaf-v48';}if(id===9){m.transparent=true;m.opacity=.86;}if(id===89){m.emissive.set('#efb557');m.emissiveIntensity=.3;}materials.set(key,m);return m;};
  let complete=0;const queue=[...metadata.tiles];await Promise.all(Array.from({length:3},async()=>{while(queue.length){signal.throwIfAborted();const tile=queue.shift()!,r=await fetch(base+tile.url,{signal:AbortSignal.any([signal,AbortSignal.timeout(45000)])});if(!r.ok)throw Error('木叶村方块载入失败');let data=await r.arrayBuffer();if(new Uint8Array(data)[0]===31)data=await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();signal.throwIfAborted();const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');if(digest!==tile.sha256)throw Error('木叶村数据校验失败，请重新载入');const geometry=decodeVillageDistance(data);const mats=tile.groups.map((g,i)=>{geometry.addGroup(g.start/4*6,g.count/4*6,i);return material(g.id,g.data);});const mesh=new THREE.Mesh(geometry,mats);mesh.position.fromArray(metadata.origin);group.add(mesh);onProgress(++complete/metadata.tiles.length);await new Promise<void>(resolve=>setTimeout(resolve,0));}}));signal.throwIfAborted();scene.add(group);
  return {root:group,dispose(){signal.removeEventListener('abort',dispose);dispose();}};
 }catch(error){dispose();signal.removeEventListener('abort',dispose);throw error;}
}
