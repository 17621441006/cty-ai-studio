import * as THREE from 'three';
const leafPalette=["#e9dca6", "#e0cc92", "#d5c196", "#dcbf76", "#d6b478", "#bbb493", "#d5ac69", "#b6ac87", "#c5a183", "#c7a068", "#d4a142", "#c29d4a", "#ada077", "#919d8c", "#bc9163", "#c09138", "#a88f61", "#94907d", "#948e55", "#798e7d", "#ad7f5f", "#9c7d5b", "#a78035", "#a07434", "#8c8069", "#8b7461", "#8c7a3c", "#718073", "#6f7469", "#737f42", "#6f7441", "#597968", "#457765", "#9c6842", "#8c6544", "#846445", "#78694a", "#785c40", "#646859", "#54685a", "#605c53", "#5f6830", "#5f5c2d", "#85503c", "#705037", "#5c514a", "#5c502c", "#823f37", "#703c34", "#5c4030", "#5b302b", "#486563", "#486332", "#2e647c", "#34633b", "#445049", "#445021", "#2f4f4e", "#3f413a", "#3e401d", "#403426", "#293a2e", "#302821", "#1a211e"];
export function decodeVillageDistance(data:ArrayBuffer){
 const v=new DataView(data),count=data.byteLength>=8?v.getUint32(4,true):0;
 if(data.byteLength!==8+count*14||count%4||v.getUint32(0)!==0x42434633)throw Error('村庄静态资源不完整');
 const positions=new Uint16Array(count*3),normals=new Int8Array(count*3),uvs=new Uint16Array(count*2),colors=new Uint8Array(count*3),blockUV=new Uint8Array(count*2),indices=new Uint32Array(count/4*6),palette=leafPalette.map(c=>new THREE.Color(c).toArray()),corners=[[0,255],[0,0],[255,255],[255,0]];
 for(let i=0;i<count;i++){const o=8+i*14,color=v.getUint8(o+9);if(!palette[color])throw Error('静态材质无效');
  for(let j=0;j<3;j++){positions[i*3+j]=v.getUint16(o+j*2,true);normals[i*3+j]=v.getInt8(o+6+j);colors[i*3+j]=Math.round(palette[color][j]*255);}
  uvs[i*2]=v.getUint16(o+10,true);uvs[i*2+1]=v.getUint16(o+12,true);blockUV.set(corners[i%4],i*2);
  if(i%4===0)indices.set([i,i+1,i+2,i+1,i+3,i+2],i/4*6);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));g.setAttribute('normal',new THREE.BufferAttribute(normals,3,true));g.setAttribute('uv',new THREE.BufferAttribute(uvs,2,true));g.setAttribute('fallbackColor',new THREE.BufferAttribute(colors,3,true));g.setAttribute('blockUv',new THREE.BufferAttribute(blockUV,2,true));g.setIndex(new THREE.BufferAttribute(indices,1));g.computeBoundingSphere();return g;
}

export function applyLeafBlockShader(s:THREE.WebGLProgramParametersWithUniforms){
    s.vertexShader='attribute vec2 blockUv; attribute vec3 fallbackColor; varying vec2 leafBlockUv; varying vec3 leafFallbackColor;\n'+s.vertexShader;
    s.vertexShader=s.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nleafBlockUv=blockUv; leafFallbackColor=fallbackColor;');
    s.fragmentShader='varying vec2 leafBlockUv; varying vec3 leafFallbackColor;\n'+s.fragmentShader;
    s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb=mix(leafFallbackColor,diffuseColor.rgb,diffuseColor.a); diffuseColor.a=1.;\nvec2 leafEdge=min(leafBlockUv,1.-leafBlockUv); diffuseColor.rgb*=mix(0.88,1.0,smoothstep(0.0,0.035,min(leafEdge.x,leafEdge.y)));');
}

