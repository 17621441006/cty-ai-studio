import * as THREE from 'three';
import metadata from './village-flight-data.json';
import {applyLeafBlockShader} from './village-codec';
import {createVillageDecoder} from './village-decoder';
const base='/works/minecraft';
/** Original village surfaces; compact transport and merged untextured flat faces. */
export async function loadShowcaseVillage(scene:THREE.Scene,signal:AbortSignal,onProgress:(n:number)=>void){
 const group=new THREE.Group();group.name='木叶村';const materials=new Map<string,THREE.MeshStandardMaterial>(),decoder=createVillageDecoder();let texture:THREE.Texture|undefined,closed=false;
 const dispose=()=>{closed=true;decoder.dispose();scene.remove(group);group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose()});materials.forEach(m=>m.dispose());materials.clear();texture?.dispose();group.clear();};
 signal.addEventListener('abort',dispose,{once:true});
 try{
  const textureReady=new THREE.TextureLoader().loadAsync(base+metadata.texture).then(t=>{if(closed||signal.aborted){t.dispose();throw new DOMException('场景已关闭','AbortError');}texture=t;texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;materials.forEach(m=>{if(m.userData.atlas){m.map=texture!;m.needsUpdate=true;}});});
  const colors:Record<number,string>={1:'#999990',2:'#73913e',3:'#826643',4:'#868e88',5:'#b48a4e',7:'#3f4243',9:'#398ba4',12:'#c6b18a',17:'#6a4d32',18:'#526b31',35:'#dbd6ba',41:'#d6a64f',45:'#af6141',89:'#edc280',98:'#858e8b'};
  const material=(id:number,data:number)=>{const key=id+':'+data;if(materials.has(key))return materials.get(key)!;const m=new THREE.MeshStandardMaterial({color:id===251?'#ffffff':colors[id]||'#949987',roughness:id===9?.3:.95,metalness:0});if(id===251){m.userData.atlas=true;m.map=texture??null;m.onBeforeCompile=applyLeafBlockShader;m.customProgramCacheKey=()=> 'cty-leaf-v48';}if(id===9){m.transparent=true;m.opacity=.86;}if(id===89){m.emissive.set('#efb557');m.emissiveIntensity=.3;}materials.set(key,m);return m;};
  let complete=0;const total=metadata.tiles.reduce((n,t)=>n+t.bytes,0),queue=[...metadata.tiles];
  // Atlas and geometry start together. Decoding runs off the UI thread.
  await Promise.all([textureReady,...Array.from({length:3},async()=>{while(queue.length){signal.throwIfAborted();const tile=queue.shift()!,r=await fetch(base+tile.url,{cache:'force-cache',signal:AbortSignal.any([signal,AbortSignal.timeout(45000)])});if(!r.ok)throw Error('木叶村方块载入失败');let data=await r.arrayBuffer();if(new Uint8Array(data)[0]===31)data=await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();signal.throwIfAborted();const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');if(digest!==tile.sha256)throw Error('木叶村数据校验失败，请重新载入');const geometry=await decoder.decode(data);if(closed||signal.aborted){geometry.dispose();signal.throwIfAborted();throw Error('场景已关闭');}const mats=tile.groups.map((g,i)=>{geometry.addGroup(g.start/4*6,g.count/4*6,i);return material(g.id,g.data);});const mesh=new THREE.Mesh(geometry,mats);mesh.position.fromArray(metadata.origin);mesh.updateMatrix();mesh.matrixAutoUpdate=false;group.add(mesh);complete+=tile.bytes;onProgress(complete/total);}})]);signal.throwIfAborted();decoder.dispose();scene.add(group);
  return {root:group,dispose(){signal.removeEventListener('abort',dispose);dispose();}};
 }catch(error){dispose();signal.removeEventListener('abort',dispose);throw error;}
}
