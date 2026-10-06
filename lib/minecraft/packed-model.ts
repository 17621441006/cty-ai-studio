import * as THREE from 'three';

/** Typed attributes replace the original 54 MB JSON number arrays. */
export function decodePackedModel(buffer:ArrayBuffer):THREE.Object3D {
 const view=new DataView(buffer);
 if(buffer.byteLength<8||view.getUint32(0)!==0x4354594d)throw Error('角色资源格式不完整');
 const length=view.getUint32(4,true),start=8+length;
 if(start>buffer.byteLength||start%4)throw Error('角色资源头部不完整');
 const json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,8,length)));
 const constructors={Float32Array,Uint16Array,Uint32Array};
 for(const geometry of json.geometries){
  for(const attribute of [...Object.values(geometry.data.attributes),geometry.data.index] as Array<{type:keyof typeof constructors;buffer:{offset:number;length:number};array?:ArrayLike<number>}>){
   const Ctor=constructors[attribute.type],spec=attribute.buffer;
   if(!Ctor||!spec||spec.offset<0||spec.length<0||start+spec.offset+spec.length*Ctor.BYTES_PER_ELEMENT>buffer.byteLength)throw Error('角色顶点资源不完整');
   attribute.array=new Ctor(buffer,start+spec.offset,spec.length);
  }
 }
 return new THREE.ObjectLoader().parse(json);
}
