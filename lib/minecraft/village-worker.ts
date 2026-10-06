import {decodeVillageDistance} from './village-codec';

const scope=self as unknown as {onmessage:(event:MessageEvent)=>void;postMessage:(message:unknown,transfer:Transferable[])=>void};
scope.onmessage=({data:{id,buffer}})=>{
 try{
  const geometry=decodeVillageDistance(buffer),attributes=Object.fromEntries(Object.entries(geometry.attributes).map(([key,a])=>[key,{array:a.array,itemSize:a.itemSize,normalized:a.normalized}]));
  const index=geometry.index!.array,sphere=geometry.boundingSphere!;
  scope.postMessage({id,attributes,index,sphere:{center:sphere.center.toArray(),radius:sphere.radius}},[...Object.values(attributes).map(a=>a.array.buffer as ArrayBuffer),index.buffer as ArrayBuffer]);
 }catch(error){scope.postMessage({id,error:error instanceof Error?error.message:'村庄解码失败'},[]);}
};
