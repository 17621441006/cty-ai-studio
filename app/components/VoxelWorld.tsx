"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SoftwareRenderer } from "./SoftwareRenderer";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
export type WorldConfig={kind:"tower"|"palace";night:boolean;grand:boolean;seed:number};
type Block={x:number;y:number;z:number;w:number;h:number;d:number;c:string};
export default function VoxelWorld({config,onProgress}:{config:WorldConfig;onProgress:(n:number,count:number)=>void}){
 const host=useRef<HTMLDivElement>(null);const progressRef=useRef(onProgress);progressRef.current=onProgress;
 useEffect(()=>{if(!host.current)return;const el=host.current;let renderer:THREE.WebGLRenderer|SoftwareRenderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"});}catch{renderer=new SoftwareRenderer();}
 const scene=new THREE.Scene();const night=config.night;scene.background=new THREE.Color(night?"#081525":"#9dc4d2");scene.fog=new THREE.Fog(night?"#081525":"#9dc4d2",260,650);
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=night?1.25:1.1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;el.appendChild(renderer.domElement);
 const palace=config.kind==="palace";const camera=new THREE.PerspectiveCamera(40,1,.5,1200);camera.position.set(palace?138:155,palace?118:155,palace?160:205);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,palace?12:62,0);controls.enableDamping=true;controls.dampingFactor=.055;controls.minDistance=40;controls.maxDistance=380;controls.maxPolarAngle=Math.PI/2-.025;controls.autoRotate=true;controls.autoRotateSpeed=.35;controls.enablePan=false;controls.addEventListener("start",()=>{controls.autoRotate=false});
 scene.add(new THREE.HemisphereLight(night?0x759ccd:0xe9f5ff,0x59694a,night?1.65:2.5));const sunlight=new THREE.DirectionalLight(night?0xc8dcff:0xffe0ad,night?2.2:3.5);sunlight.position.set(-80,160,75);sunlight.castShadow=true;sunlight.shadow.mapSize.set(2048,2048);Object.assign(sunlight.shadow.camera,{left:-140,right:140,top:140,bottom:-140,near:1,far:400});sunlight.shadow.bias=-.001;scene.add(sunlight);const fill=new THREE.DirectionalLight(0x5cc5d5,1.1);fill.position.set(90,60,-90);scene.add(fill);
 const geometry=new THREE.BoxGeometry(1,1,1);const mats:THREE.Material[]=[];const simple=(w:number,h:number,d:number,x:number,y:number,z:number,color:string,rough=1)=>{const m=new THREE.MeshStandardMaterial({color,roughness:rough,metalness:rough<.5?.35:0});mats.push(m);const o=new THREE.Mesh(geometry,m);o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;};
 simple(176,7,156,0,-4,0,"#26392f");simple(174,1,154,0,0,0,"#465c42");simple(550,.5,550,0,-8,0,night?"#102e42":"#507f8c",.2);
 const blocks:Block[]=[];const b=(x:number,y:number,z:number,w:number,h:number,d:number,c:string)=>blocks.push({x,y,z,w,h,d,c});
 function tree(x:number,z:number,s=1){b(x,2.6*s,z,1.1*s,5*s,1.1*s,"#61422c");b(x,6.2*s,z,6*s,4*s,6*s,"#294c37");b(x,9*s,z,4.3*s,3*s,4.3*s,"#3c6844");b(x,11*s,z,2.4*s,2*s,2.4*s,"#608653");}
 const rand=(i:number)=>{const n=Math.sin(i*127.1+38.2)*43758.54;return n-Math.floor(n)};
 if(!palace){
 simple(78,.6,116,0,.8,0,"#566265");simple(28,.2,132,0,1.2,0,"#708178");
 // A twisting, tapering triangular tower, assembled from individually visible voxel panels.
 const floors=config.grand?126:104;const height=126;const segments=54;
 for(let y=0;y<floors;y++){const t=y/(floors-1);const r=13*(1-.52*t);const twist=t*Math.PI*.65;const yy=3+t*height;
 for(let j=0;j<segments;j++){const a=j/segments*Math.PI*2;const rr=r*(1+.115*Math.cos(3*a));const x=Math.cos(a+twist)*rr,z=Math.sin(a+twist)*rr;const glass=(j+y)%8===0;const c=night?(glass?"#d1ae70":(j%3?"#4689a4":"#79b2be")):(j%4?"#73adbc":"#b7d4d7");b(x,yy,z,1.48,height/floors*.9,1.48,c);}
 if(y%8===0)b(0,yy,0,r*1.3,.6,r*1.3,"#758c8f");}
 for(let k=0;k<10;k++)b(0,130+k,0,5-k*.35,1.1,5-k*.35,k%2?"#bee8e9":"#97b7b8");
 // Contextual skyline, lit window grids, plazas and a river promenade.
 for(let i=0;i<(config.grand?42:26);i++){let x=(rand(i+1)-.5)*145,z=(rand(i+94)-.5)*127;if(Math.abs(x)<25&&Math.abs(z)<39)continue;let h=8+rand(i+47)*37,w=5+rand(i+67)*8,d=6+rand(i+82)*9; b(x,h/2+1,z,w,h,d,i%2?"#496574":"#6c7f81");for(let yy=4;yy<h;yy+=3)for(let xx=-w/2+1;xx<w/2;xx+=2)b(x+xx,yy,z+d/2+.1,.9,1.25,.2,night?"#e9bd78":"#aed1d3");}
 for(let i=0;i<22;i++){tree(i%2?-37:38,-66+i*6,.55);if(i%3===0)tree(-65+i*6,57,.65);}
 for(let i=0;i<8;i++)b(-25+i*7,1.6,62,4,.5,6,"#b8b6a1");
 }else{
 simple(156,.7,134,0,.8,0,"#847d69");simple(42,.4,140,0,1.3,0,"#b2a58a");
 const stone="#cec8ad",red="#932f22",gold="#c68a30";
 function roof(cx:number,cy:number,cz:number,w:number,d:number){for(let k=0;k<10;k++){const ww=w-k*2.1,dd=d-k*2.5;if(ww<=0||dd<=0)break;for(let x=-ww/2;x<=ww/2;x+=1.8){b(cx+x,cy+k*.7,cz-dd/2,1.8,.8,2.1,k%2?"#dda03e":gold);b(cx+x,cy+k*.7,cz+dd/2,1.8,.8,2.1,k%2?"#dda03e":gold);}for(let z=-dd/2+1.8;z<dd/2;z+=1.8){b(cx-ww/2,cy+k*.7,cz+z,2.1,.8,1.8,gold);b(cx+ww/2,cy+k*.7,cz+z,2.1,.8,1.8,gold);}}
 b(cx,cy+7.2,cz,w-19,1.3,2.1,"#e7b550");for(const sx of [-1,1])for(const sz of [-1,1]){for(let k=0;k<4;k++)b(cx+sx*(w/2+k*.45),cy+k*.65,cz+sz*(d/2+k*.45),1.5,.8,1.5,"#e7b550");}}
 function hall(cx:number,cz:number,w:number,d:number,base:number,scale=1){b(cx,base+5*scale,cz,w-4,10*scale,d-4,red);for(let x=-w/2+2;x<w/2;x+=5*scale){for(const z of [-d/2,d/2]){b(cx+x,base+5*scale,cz+z,1.2*scale,10*scale,1.2*scale,"#ae3427");b(cx+x,base+10*scale,cz+z,2,1,2,"#297366");}if(x<w/2-3)b(cx+x+2,base+4.5*scale,cz+d/2-.6,2.5,6*scale,.4,"#b88a45");}roof(cx,base+10*scale,cz,w+6,d+7);b(cx,base+15*scale,cz,w*.73,4*scale,d*.72,red);roof(cx,base+17*scale,cz,w*.84,d*.9);}
 // Triple marble terrace, stair flights, stone balustrades, central imperial hall.
 for(let j=0;j<3;j++){let w=87-j*8,d=63-j*7;b(0,2+j*2.1,-8,w,2,d,stone);for(let x=-w/2;x<=w/2;x+=4)for(const z of [-d/2,d/2]){b(x,4.5+j*2.1,-8+z,.7,2.2,.7,"#eee6c9");b(x,5.5+j*2.1,-8+z,1,.5,1,"#e7dfc2");}for(let z=-d/2;z<=d/2;z+=4)for(const x of [-w/2,w/2])b(x,4.5+j*2.1,z-8,.7,2.2,.7,"#eee6c9");}
 for(let k=0;k<10;k++)b(0,1+k*.6,42-k*1.8,18,.65,2,stone);
 hall(0,-8,65,33,7,1);hall(-58,10,23,17,2,.6);hall(58,10,23,17,2,.6);
 for(const x of [-74,74]){b(x,4,0,2,7,133,red);roof(x,7,0,5,133);}b(0,4,-65,146,7,2,red);for(let x=-66;x<68;x+=12)b(x,8,-65,11,1.5,6,gold);
 for(let i=0;i<16;i++){tree(i<8?-47:47,35+(i%8)*4.5,.5);}
 for(const x of [-26,26])for(const z of [25,41,57]){b(x,2.8,z,2,5,2,"#9b7441");b(x,6,z,4,2,4,"#d6a248");}
 if(config.grand){hall(-55,-42,27,18,2,.65);hall(55,-42,27,18,2,.65);for(let i=0;i<32;i++)tree(i%2?-82:82,-65+i*4,.7);}
 }
 // A ginger voxel Persian explores the same world.
 const cat=new THREE.Group();function catPart(w:number,h:number,d:number,x:number,y:number,z:number,c:string){const m=new THREE.MeshStandardMaterial({color:c,roughness:1});mats.push(m);const mesh=new THREE.Mesh(geometry,m);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);mesh.castShadow=true;cat.add(mesh);}catPart(3.5,3.6,4.6,0,2.8,0,"#c47b38");catPart(4.5,3.3,3.3,0,5.5,1.4,"#d99750");catPart(1.2,1.4,1.2,-1.5,7.5,1.3,"#d99750");catPart(1.2,1.4,1.2,1.5,7.5,1.3,"#d99750");catPart(2.8,2.4,.4,0,3.8,2.5,"#f3e4c8");catPart(1.1,.5,.5,-1.2,5.8,3.1,"#24211a");catPart(1.1,.5,.5,1.2,5.8,3.1,"#24211a");catPart(.5,.4,.5,0,5,3.2,"#8d5443");for(const x of [-1,1])catPart(1.2,.6,1.8,x,.9,1.5,"#f3e4c8");catPart(1.3,1.3,4,2.1,1.8,-1,"#b26a2e");cat.position.set(palace?22:27,1.6,palace?42:34);cat.rotation.y=-.35;scene.add(cat);
 blocks.sort((a,b)=>a.y-b.y);const mat=new THREE.MeshStandardMaterial({roughness:palace?.9:.55,metalness:palace?.05:.25});const voxels=new THREE.InstancedMesh(geometry,mat,blocks.length);voxels.castShadow=true;voxels.receiveShadow=true;const dummy=new THREE.Object3D();const color=new THREE.Color();blocks.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();voxels.setMatrixAt(i,dummy.matrix);voxels.setColorAt(i,color.set(v.c));});voxels.instanceMatrix.needsUpdate=true;if(voxels.instanceColor)voxels.instanceColor.needsUpdate=true;voxels.count=0;scene.add(voxels);
 const scan=new THREE.Mesh(new THREE.PlaneGeometry(174,154),new THREE.MeshBasicMaterial({color:0x75e2dc,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false}));scan.rotation.x=-Math.PI/2;scene.add(scan);
 if(night){const stars=new Float32Array(1100*3);for(let i=0;i<1100;i++){stars[i*3]=(rand(i+100)*2-1)*550;stars[i*3+1]=110+rand(i+800)*320;stars[i*3+2]=(rand(i+1200)*2-1)*550;}const sg=new THREE.BufferGeometry();sg.setAttribute("position",new THREE.BufferAttribute(stars,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xc3dbe7,size:.7})));}
 const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(el);resize();let raf=0,start=performance.now(),last=-1;const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 function animate(now:number){raf=requestAnimationFrame(animate);const progress=reduce?1:Math.min(1,(now-start)/5200);voxels.count=Math.floor(blocks.length*progress);const pct=Math.round(progress*100);if(pct!==last){last=pct;progressRef.current(pct,blocks.length);}scan.visible=progress<1;scan.position.y=palace?progress*39:progress*141;cat.position.y=1.6+Math.sin(now*.002)*.09;controls.update();renderer.render(scene,camera);}raf=requestAnimationFrame(animate);
 return()=>{cancelAnimationFrame(raf);observer.disconnect();controls.dispose();scene.traverse(o=>{const mesh=o as THREE.Mesh;if(mesh.geometry&&mesh.geometry!==geometry)mesh.geometry.dispose();if(mesh.material){const a=Array.isArray(mesh.material)?mesh.material:[mesh.material];a.forEach(m=>m.dispose());}});geometry.dispose();renderer.dispose();if(el.contains(renderer.domElement))el.removeChild(renderer.domElement);};
 },[config]);
 return <div className="voxel-canvas" ref={host}/>
}
