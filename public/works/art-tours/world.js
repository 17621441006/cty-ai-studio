let ctyTourActive=true;
import * as THREE from './assets/three.module.js';
import {buildWizardWorld} from './wizard-world.js?v=20261005-magic4';
import {createMotionProfile} from './flight-motion.js';
const $=id=>document.getElementById(id), mobile=matchMedia('(max-width:700px)').matches;
const state={ready:false,started:false,playing:false,time:0,speed:2.5,scrubbing:false,comfort:matchMedia('(prefers-reduced-motion:reduce)').matches,chapter:-1,drag:false,yaw:0,pitch:0,targetYaw:0,targetPitch:0,jumping:false,sound:false};
let chapters=[
 {time:0,title:'夜间咖啡馆',place:'阿尔勒 · 一盏暖灯',text:'灯还亮着，夜刚刚开始。',image:'cafe.jpg'},
 {time:60,title:'走过蓝色街巷',place:'阿尔勒 · 画外的路',text:'穿过暖黄的露台，河岸就在前方。',image:'cafe.jpg'},
 {time:120,title:'罗讷河上的星夜',place:'罗讷河 · 光落在水面',text:'顺着金色倒影，贴近一条安静的河。',image:'rhone.jpg'},
 {time:180,title:'帆船与倒影',place:'河心 · 停留片刻',text:'绕过帆船，让星光在脚下缓缓流动。',image:'boat-detail.jpg'},
 {time:240,title:'向星空，慢慢升起',place:'夜空 · 绵延的笔触',text:'离开河面，飞向那片旋转的蓝色。',image:'stars-detail.jpg'},
 {time:300,title:'星月夜里的村庄',place:'圣雷米 · 夜色中的归处',text:'越过柏树，在群星之下安静停留。',image:'starry.jpg'}
];
let renderer,scene,camera,sky,flightWind,last=0,velocity=0,bankAngle=0,lastHeading=null,audioContext,audioGain,riverMaterial;
const animatedStars=[],lamps=[],boats=[],textures={};let buildingBounds=[];
const worlds={};let activeWorld='vangogh',motionProfile,yawRate=0,pitchRate=0;
const rnd=(a=0,b=1)=>a+Math.random()*(b-a);
const pos=(x,y,z)=>new THREE.Vector3(x,y,z);
const clamp=THREE.MathUtils.clamp;
const pathNodes=[
 [0,2.7,24], [0,2.7,12], [1,2.8,-4], [1.2,3,-20], [1,3.1,-36], [1,3.2,-51], [4,3.4,-65], [10,3.6,-77], [22,3.7,-88], [36,3.8,-94], [50,4,-98], [67,4.1,-101], [84,4.4,-105], [100,4.8,-111], [118,5.2,-119], [137,6,-128], [154,9,-138], [170,13,-147], [186,17,-158], [202,20,-171], [214,18,-182], [227,15,-196], [240,10,-211], [252,6,-225], [262,4.3,-233], [267,3.2,-241], [267,3,-253], [267,3,-263], [266,3.1,-269], [262,3.1,-273], [252,3.1,-273], [244,3.1,-273], [240,3.1,-276], [239,3.2,-281], [239,3.5,-292], [239,4,-306], [239,5.7,-320], [244,7,-328], [251,8,-334]
].map(p=>pos(...p));
let flightPath=new THREE.CatmullRomCurve3(pathNodes,false,'centripetal',.5);flightPath.arcLengthDivisions=2200;
let routeLength=flightPath.getLength();
// Chapter boundaries follow actual locations, even after extending the village streets.
const landmarks=[pathNodes[0],pos(1,3.1,-36),pos(44,3.9,-96),pos(118,5.2,-119),pos(186,17,-158),pos(267,3.2,-241),pathNodes.at(-1)];
let routeFractions=landmarks.map((p,idx)=>{if(idx===0)return 0;if(idx===6)return 1;let nearest=0,best=Infinity;for(let i=0;i<=2200;i++){const u=i/2200,d=flightPath.getPointAt(u).distanceToSquared(p);if(d<best){nearest=u;best=d;}}return nearest;});
let routeSlopes=routeFractions.slice(1).map((n,i)=>n-routeFractions[i]);
let routeDerivatives=routeFractions.map((_,i)=>i===0?routeSlopes[0]:i===6?routeSlopes[5]:2*routeSlopes[i-1]*routeSlopes[i]/(routeSlopes[i-1]+routeSlopes[i]));
function routeAt(time){const x=clamp(time/60,0,6),i=Math.min(5,Math.floor(x)),t=x-i,t2=t*t,t3=t2*t;return (2*t3-3*t2+1)*routeFractions[i]+(t3-2*t2+t)*routeDerivatives[i]+(-2*t3+3*t2)*routeFractions[i+1]+(t3-t2)*routeDerivatives[i+1];}
const materialCache=new Map();
function materialKey(kind,color,map){return `${kind}:${color}:${map?.image?.src||''}:${map?.repeat?.x||1}:${map?.repeat?.y||1}:${map?.offset?.x||0}:${map?.offset?.y||0}`;}
function basic(map,color=0xffffff){const k=materialKey('b',color,map);if(!materialCache.has(k))materialCache.set(k,new THREE.MeshBasicMaterial({map,color,side:THREE.DoubleSide}));return materialCache.get(k);}
function painter(color,map){const k=materialKey('p',color,map);if(!materialCache.has(k))materialCache.set(k,new THREE.MeshStandardMaterial({color,...(map?{map}:{}),roughness:1,metalness:0,flatShading:true}));return materialCache.get(k);}
const boxGeo=new THREE.BoxGeometry(1,1,1),cylGeo=new THREE.CylinderGeometry(1,1,1,10),sphereGeo=new THREE.IcosahedronGeometry(1,1);
function mesh(geo,mat,x,y,z,sx=1,sy=1,sz=1,parent=scene){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;}
function box(mat,x,y,z,sx,sy,sz,parent){return mesh(boxGeo,mat,x,y,z,sx,sy,sz,parent);}
function plane(map,x,y,z,w,h,ry=0,parent=scene){const o=mesh(new THREE.PlaneGeometry(w,h),basic(map),x,y,z,1,1,1,parent);o.rotation.y=ry;return o;}
function lineBetween(a,b,r,mat,parent=scene){const d=new THREE.Vector3().subVectors(b,a);const o=mesh(cylGeo,mat,0,0,0,r,d.length(),r,parent);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(pos(0,1,0),d.normalize());return o;}
function repeat(t,x,y){const n=t.clone();n.wrapS=n.wrapT=THREE.RepeatWrapping;n.repeat.set(x,y);n.needsUpdate=true;return n;}
function cropTexture(t,x,y,w,h){const n=t.clone();n.repeat.set(w,h);n.offset.set(x,y);n.needsUpdate=true;return n;}
function glowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const q=c.getContext('2d');const g=q.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,237,169,1)');g.addColorStop(.16,'rgba(255,230,120,.85)');g.addColorStop(.42,'rgba(255,200,80,.19)');g.addColorStop(1,'rgba(255,190,70,0)');q.fillStyle=g;q.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
let glow;
function sprite(x,y,z,size,opacity=.65){const m=new THREE.SpriteMaterial({map:glow,color:0xffdc8e,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending});const s=new THREE.Sprite(m);s.position.set(x,y,z);s.scale.set(size,size,1);scene.add(s);return s;}
function buildSky(){
 // A single closed sphere surrounds every viewpoint. No partial cylinders or picture panels.
 const material=new THREE.ShaderMaterial({
  uniforms:{panorama:{value:textures.panorama},rhone:{value:textures['rhone-sky']},starry:{value:textures.starry},rhoneMix:{value:0},starryMix:{value:0}},
  vertexShader:`varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`
   uniform sampler2D panorama;uniform sampler2D rhone;uniform sampler2D starry;uniform float rhoneMix;uniform float starryMix;varying vec3 vDirection;
   vec3 skySample(sampler2D tex,float u,float v,vec2 start,vec2 size){
    float w=fract(u);float edge=smoothstep(0.0,0.14,min(w,1.0-w));
    vec3 a=texture2D(tex,start+vec2(w,v)*size).rgb;
    vec3 b=texture2D(tex,start+vec2(fract(w+0.5),v)*size).rgb;
    return mix(b,a,edge);
   }
   void main(){vec3 d=normalize(vDirection);float u=atan(d.z,d.x)/6.2831853+0.5;
    float v=0.19+0.78*pow(max(d.y,0.0),0.6);
    vec3 base=skySample(panorama,u,v,vec2(0.0),vec2(1.0));
    vec3 river=skySample(rhone,u+0.17,v,vec2(0.0),vec2(1.0))*vec3(0.97,1.02,1.1);
    vec3 village=skySample(starry,u+0.34,v,vec2(0.35,0.4),vec2(0.64,0.59));
    vec3 c=mix(base,river,rhoneMix*0.56);c=mix(c,village,starryMix*0.6);
    c=mix(vec3(0.065,0.13,0.23),c,smoothstep(-0.22,0.06,d.y));
    c=mix(c,vec3(0.055,0.13,0.255),smoothstep(0.85,1.0,d.y)*0.45);
    gl_FragColor=vec4(c,1.0);
    #include <colorspace_fragment>
   }`,side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false,toneMapped:false});
 sky=new THREE.Mesh(new THREE.SphereGeometry(600,64,36),material);sky.renderOrder=-100;sky.frustumCulled=false;scene.add(sky);
 for(let i=0;i<45;i++){const a=rnd(-2.3,1.8),r=rnd(180,330),y=rnd(65,210);const star=sprite(115+Math.sin(a)*r,y,-125-Math.cos(a)*r,rnd(2,6),rnd(.15,.35));animatedStars.push({s:star,phase:rnd(0,6),opacity:star.material.opacity});}
 // A dark, continuous terrain foundation hides all patch boundaries beneath the scenery.
 const land=mesh(new THREE.CircleGeometry(1100,96),painter(0x29435a,repeat(textures.hills,28,28)),120,-.4,-170);land.rotation.x=-Math.PI/2;
}
function buildCafe(){
 const ground=mesh(new THREE.PlaneGeometry(39,115),painter(0xe3c982,repeat(textures.cobbles,3,10)),0,-.03,-22);ground.rotation.x=-Math.PI/2;
 const walkway=box(painter(0x9d8450,repeat(textures.cobbles,1,5)),-8,.08,-22,8,.15,110);
 const blue=painter(0x304565,repeat(textures.hills,1,2)),ochre=painter(0xffcd40,repeat(textures.ochre,2,2)),dark=painter(0x182b4d),wood=painter(0x704f29);
 const wall=box(ochre,-14,7.8,-11,3,16,61);buildingBounds.push(new THREE.Box3(pos(-15.5,0,-41.5),pos(-12.5,16,19.5))); 
 // Facade is sampled from the supplied cafe painting, applied to a real building.
 const facade=plane(cropTexture(textures.cafe,.1,.27,.45,.57),-12.45,6.9,-12,58,14,Math.PI/2);
 for(let j=0;j<6;j++){const z=13-j*11;const h=12+(j%3)*3;box(blue,14,h/2,z,9,h,10);buildingBounds.push(new THREE.Box3(pos(9.2,0,z-5.5),pos(18.8,h+2,z+5.5)));box(painter(0x15274b),14,h+.6,z,10,1.1,11);
  for(let k=0;k<3;k++)for(let l=0;l<2;l++){const mm=(k+l+j)%4===0?basic(null,0xd9ac49):basic(null,0x58728d);box(mm,9.42,2.3+k*3.4,z-2.8+l*4.8,.07,1.9,1.3);box(wood,9.34,2.3+k*3.4,z-2.8+l*4.8,.07,.09,1.5);}
 }
 // Shutters, pilasters, illuminated canopy and cafe doors.
 for(let j=0;j<8;j++){const z=14-j*7;box(blue,-12.25,11.7,z,.22,2.8,1.6);for(let k=0;k<7;k++)box(dark,-12.04,10.55+k*.37,z,.15,.1,1.55);box(wood,-12.15,3,z, .3,5,2.8);box(basic(null,0xffd860),-11.97,3,z,.02,4.6,2.1);}
 const canopyGeo=new THREE.BufferGeometry();canopyGeo.setAttribute('position',new THREE.Float32BufferAttribute([-12,6,19,-12,6,-43,-5,4.8,19,-5,4.8,19,-12,6,-43,-5,4.8,-43],3));canopyGeo.computeVertexNormals();scene.add(new THREE.Mesh(canopyGeo,painter(0xffd44e,repeat(textures.ochre,2,5))));box(ochre,-5,4.6,-12,.15,.65,63);
 for(let z=15;z>-45;z-=12){const light=new THREE.PointLight(0xffce50,22,17,1.5);light.position.set(-7,4,z);scene.add(light);sprite(-8,3.8,z,3,.32);}
 const ivory=painter(0xe9e9c5),seat=painter(0xc19b46);
 for(let j=0;j<9;j++){const z=14-j*6.2;for(let k=0;k<2;k++){
  const x=k?-5.9:-9.3;mesh(cylGeo,ivory,x,1.13,z,.92,.1,.92);mesh(cylGeo,wood,x,.57,z,.09,1.05,.09);
  for(let c=0;c<3;c++){const angle=c*2.1+(k?.5:0);const cx=x+Math.cos(angle)*1.35,cz=z+Math.sin(angle)*1.35;mesh(cylGeo,seat,cx,.64,cz,.37,.09,.37);const back=mesh(new THREE.TorusGeometry(.36,.045,4,14,Math.PI),wood,cx,1.17,cz,.95,1.15,1);back.rotation.y=-angle;back.rotation.z=0;for(const dx of [-.23,.23])for(const dz of [-.23,.23])lineBetween(pos(cx+dx,.05,cz+dz),pos(cx+dx,.62,cz+dz),.035,wood);}
  // Small still-life on each table.
  mesh(cylGeo,ivory,x+.25,1.26,z,.09,.16,.09);mesh(cylGeo,painter(0x75634a),x-.25,1.19,z-.12,.2,.018,.2);
 }}
 for(let j=0;j<8;j++){const z=12-j*10;box(painter(0xd4a749),4.8,.03,z,.3,.04,5);}
 // Lanterns create warm pools without camera-following light.
 for(let z=10;z>-67;z-=19){lineBetween(pos(7,0,z),pos(7,4.8,z),.07,wood);box(wood,7,4.6,z,.55,.9,.55);box(basic(null,0xffda79),7,4.62,z,.4,.65,.4);sprite(7,4.62,z,3,.3);}
}
function addBuilding(x,z,w,h,d,color,parent=scene){buildingBounds.push(new THREE.Box3(pos(x-w*.56,0,z-d*.56),pos(x+w*.56,h+2.7,z+d*.56)));const mat=painter(color,repeat(textures.hills,1,1));box(mat,x,h/2,z,w,h,d,parent);
 const roof=mesh(new THREE.ConeGeometry(1,1,4),painter(0x273852,repeat(textures.hills,1,1)),x,h+1.2,z,w*.77,2.4,d*.77,parent);roof.rotation.y=Math.PI/4;
 const wm=basic(null,0xf2c36e);for(let k=0;k<Math.max(1,Math.floor(w/2.4));k++)for(let l=0;l<Math.max(1,Math.floor(h/3));l++)if((k+l+Math.floor(x))%3!==0)box(wm,x-w*.32+k*2.4,1.8+l*2.7,z+d/2+.03,.55,.83,.035,parent);return roof;
}
function buildRiver(){
 const bank=mesh(new THREE.PlaneGeometry(215,24),painter(0xb4b384,repeat(cropTexture(textures['shore-detail'],0,0,1,.32),15,2)),98,.02,-91);bank.rotation.x=-Math.PI/2;
 const farbank=mesh(new THREE.PlaneGeometry(290,75),painter(0x354d45,repeat(textures.hills,5,3)),115,.12,-229);farbank.rotation.x=-Math.PI/2;
 // The river shader moves paint slowly; its geometry is an actual horizontal surface.
 riverMaterial=new THREE.ShaderMaterial({uniforms:{map:{value:repeat(textures.water,9,5)},uTime:{value:0}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform sampler2D map;uniform float uTime;varying vec2 vUv;void main(){vec2 p=vUv*vec2(7.0,3.0); p.x+=sin(p.y*65.0+uTime*.18)*.0015;p.y+=sin(p.x*76.0+uTime*.13)*.001;vec3 c=texture2D(map,p).rgb; float edge=.86+.14*sin(p.y*150.0);gl_FragColor=vec4(c*vec3(.54,.71,1.02)*edge,1.0);}',side:THREE.DoubleSide});
 const water=mesh(new THREE.PlaneGeometry(290,102),riverMaterial,115,-.13,-151);water.rotation.x=-Math.PI/2;
 const rail=painter(0x6a715b),gold=basic(null,0xebcc6c);
 box(painter(0x5c6450),101,.23,-102,216,.6,.8);
 for(let i=0;i<33;i++){const x=-5+i*6.7;box(rail,x,.8,-101.8,.13,1.25,.13);}box(rail,101,1.1,-101.8,216,.1,.1);
 for(let j=0;j<26;j++){const x=-25+j*11,w=rnd(5,9),h=rnd(4,9);if(x>232&&x<258)continue;addBuilding(x,-211,w,h,10,[0x405667,0x897d58,0x6c7960,0x33495a][j%4]);const s=sprite(x,3.2,-204,4,.36);lamps.push(s);}
 // Warm brushstroke reflections, instanced into broken flecks across the water.
 const refl=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),gold,760);const dummy=new THREE.Object3D();let ix=0;
 for(let j=0;j<19;j++){const x=-5+j*11;for(let k=0;k<40;k++){dummy.position.set(x+rnd(-1.1,1.1),-.08,-199+k*2.28);dummy.rotation.set(-Math.PI/2,0,rnd(-.12,.12));dummy.scale.set(rnd(.4,2.2)*(1+k/70),rnd(.11,.34),1);dummy.updateMatrix();refl.setMatrixAt(ix++,dummy.matrix);refl.setColorAt(ix-1,new THREE.Color().setHSL(.12,rnd(.4,.72),rnd(.28,.61)));}}
 scene.add(refl);refl.instanceMatrix.needsUpdate=true;
 for(let z of [-120,-178])for(let x of [78,114,142])makeBoat(x,z);
 for(let j=0;j<9;j++){const x=12+j*21;lineBetween(pos(x,0,-87),pos(x,5,-87),.08,rail);box(rail,x,5,-87,.7,1,.7);box(gold,x,5,-87,.5,.7,.5);sprite(x,5,-87,3,.4);}
 const jetty=box(painter(0x725e35,repeat(textures.ochre,2,6)),86,.18,-111,4,.4,18);for(let z=-104;z>-121;z-=4)for(let x of [83.8,88.2])mesh(cylGeo,rail,x,.5,z,.14,1.2,.14);
}
function makeBoat(x,z){const b=new THREE.Group();b.position.set(x,.04,z);b.rotation.y=rnd(-.22,.22);scene.add(b);
 const hull=painter(0x514d3a,repeat(textures.hills,1,1)),mast=painter(0x94864f),sail=painter(0xd4c98c,repeat(textures.ochre,1,2));
 const shape=new THREE.Shape();shape.moveTo(-1.1,-3);shape.quadraticCurveTo(-2.1,0,-1.1,3);shape.quadraticCurveTo(0,4,1.1,3);shape.quadraticCurveTo(2.1,0,1.1,-3);shape.quadraticCurveTo(0,-4,-1.1,-3);
 const body=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.7,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.2,bevelThickness:.15}),hull);body.rotation.x=-Math.PI/2;body.position.y=.1;b.add(body);
 lineBetween(pos(0,.6,0),pos(0,10,0),.065,mast,b);lineBetween(pos(0,1,0),pos(0,9.3,0),.06,mast,b);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,9,0,0,2.8,0,0,2.8,3.6],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,1,0,0,1,0],2));g.computeVertexNormals();const sm=new THREE.Mesh(g,sail);b.add(sm);
 for(const end of [pos(-1,1,-3),pos(1,1,3)])lineBetween(pos(0,9.5,0),end,.013,mast,b);boats.push({b,phase:rnd(0,6)});
}
function hill(x,z,w,h,d,color){const g=new THREE.SphereGeometry(1,32,18,0,Math.PI*2,0,Math.PI/2);const o=mesh(g,painter(color,repeat(textures.hills,2,1)),x,0,z,w,h,d);return o;}
function cypress(x,z,h=22){const mat=painter(0x253c2a,repeat(textures.hills,1,3));const trunk=painter(0x51462b);mesh(cylGeo,trunk,x,h*.33,z,.25,h*.66,.25);
 for(let j=0;j<8;j++){const y=h*(.15+j*.1),r=h*.15*(1-j*.1);const o=mesh(new THREE.ConeGeometry(1,1,9),mat,x+Math.sin(j*2)*.5,y,z,r,h*.35,r*.6);o.rotation.z=Math.sin(j)*.09;}
}
function roadRibbon(points,width){
 const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>pos(x,.25,z))),verts=[],uvs=[],indices=[];
 for(let i=0;i<=60;i++){const t=i/60,p=curve.getPoint(t),d=curve.getTangent(t),side=pos(-d.z,0,d.x).normalize().multiplyScalar(width/2);for(const sign of [-1,1]){const v=p.clone().addScaledVector(side,sign);verts.push(v.x,v.y,v.z);uvs.push((sign+1)/2,t*5);}if(i<60){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();scene.add(new THREE.Mesh(g,painter(0xb0afa0,repeat(textures.cobbles,1,1))));
}
function buildVillage(){
 const base=mesh(new THREE.PlaneGeometry(175,220,24,24),painter(0x59674a,repeat(textures.hills,5,6)),262,-.1,-277);base.rotation.x=-Math.PI/2;
 for(let j=0;j<9;j++)hill(165+j*24,-415-rnd(0,30),rnd(25,54),rnd(8,25),rnd(25,40),[0x244567,0x2b4e70,0x3a5877][j%3]);
 roadRibbon([[230,-195],[241,-210],[252,-225],[262,-234],[267,-241]],8);
 // Reserve two real lanes and a cross street before placing the houses.
 for(const z of [-242,-260,-286,-309])for(const x of [211,226,252,282,298,314])addBuilding(x,z,rnd(7.5,9.3),rnd(5,8),rnd(7,9.2),[0x56667b,0x827b67,0x4c5c70,0x727454][Math.floor(x)%4]);
 const church=painter(0x869189,repeat(textures.hills,1,2)),roof=painter(0x21394e);box(church,291,5,-296,9,10,16);box(church,281,8,-293,3.6,16,3.6);const spire=mesh(new THREE.ConeGeometry(1,1,4),roof,281,23,-293,2.5,15,2.5);spire.rotation.y=Math.PI/4;box(basic(null,0xf9cd69),281,9,-291.17,1,2,.05);
 buildingBounds.push(new THREE.Box3(pos(286.2,0,-304.5),pos(295.8,11.5,-287.5)),new THREE.Box3(pos(278.5,0,-295.5),pos(283.5,31,-290.5)));
 for(let j=0;j<16;j++)cypress(202+rnd(-9,5),-218-j*6,rnd(14,23));cypress(239,-248,31);cypress(321,-250,22);
 buildRoadUnion([[267,-278,9,118],[239,-304,9,65],[253,-273,42,9]]);
 for(const z of [-242,-260,-282,-305])for(const x of [261.7,272.3]){const post=painter(0x655d3d);lineBetween(pos(x,0,z),pos(x,3.8,z),.06,post);box(basic(null,0xe5cc7b),x,3.8,z,.28,.45,.28);sprite(x,3.8,z,1.7,.25);}
 const moon=sprite(301,85,-390,32,.42);animatedStars.push({s:moon,phase:2,opacity:.42});
}
// Tessellate the union once: each ground cell belongs to exactly one triangle pair.
function buildRoadUnion(rectangles){
 const xs=[...new Set(rectangles.flatMap(([x,z,w,d])=>[x-w/2,x+w/2]))].sort((a,b)=>a-b),zs=[...new Set(rectangles.flatMap(([x,z,w,d])=>[z-d/2,z+d/2]))].sort((a,b)=>a-b),vertices=[],uv=[];
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){const x=(xs[i]+xs[i+1])/2,z=(zs[j]+zs[j+1])/2;if(!rectangles.some(([cx,cz,w,d])=>Math.abs(x-cx)<w/2&&Math.abs(z-cz)<d/2))continue;
  for(const [xx,zz] of [[xs[i],zs[j]],[xs[i],zs[j+1]],[xs[i+1],zs[j]],[xs[i+1],zs[j]],[xs[i],zs[j+1]],[xs[i+1],zs[j+1]]]){vertices.push(xx,.22,zz);uv.push(xx/5,zz/5);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();const road=new THREE.Mesh(g,painter(0xb6b69b,repeat(textures.cobbles,1,1)));road.name='village-road-union';scene.add(road);
}
function batchStaticMeshes(){
 scene.updateMatrixWorld(true);const batches=new Map();
 for(const o of [...scene.children]){if(!o.isMesh||o.isInstancedMesh||o.material.transparent||o.material.isShaderMaterial)continue;const id=o.material.uuid;if(!batches.has(id))batches.set(id,[]);batches.get(id).push(o);}
 for(const parts of batches.values()){if(parts.length<2)continue;const positions=[],normals=[],uvs=[];for(const o of parts){const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry;const p=g.getAttribute('position'),n=g.getAttribute('normal'),uv=g.getAttribute('uv'),nm=new THREE.Matrix3().getNormalMatrix(o.matrixWorld);for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);positions.push(v.x,v.y,v.z);const nv=n?new THREE.Vector3().fromBufferAttribute(n,i).applyNormalMatrix(nm):pos(0,1,0);normals.push(nv.x,nv.y,nv.z);uvs.push(uv?uv.getX(i):0,uv?uv.getY(i):0);}scene.remove(o);if(g!==o.geometry)g.dispose();}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.computeBoundingSphere();const batch=new THREE.Mesh(g,parts[0].material);batch.castShadow=parts.some(o=>o.castShadow);batch.receiveShadow=parts.some(o=>o.receiveShadow);scene.add(batch);}
}
function buildFlightWind(){
 const count=mobile?40:64,points=new Float32Array(count*6),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(points,3));
 flightWind=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xdadcb5,transparent:true,opacity:0,depthTest:false,depthWrite:false,fog:false,blending:THREE.AdditiveBlending}));
 flightWind.userData.seeds=Array.from({length:count},()=>({angle:rnd(0,Math.PI*2),radius:rnd(10,17),phase:rnd(0,1)}));flightWind.frustumCulled=false;flightWind.renderOrder=999;scene.add(flightWind);
}
const targetQuat=new THREE.Quaternion(),lookObj=new THREE.Object3D(),viewQuat=new THREE.Quaternion(),euler=new THREE.Euler(0,0,0,'YXZ'),offset=pos(0,0,0);
function updateCamera(dt,snap=false){
 const routeTime=state.comfort?chapters[Math.max(0,state.chapter)].time:state.time,u=routeAt(routeTime),p=flightPath.getPointAt(u);
 camera.position.copy(p);
 const fast=state.comfort?0:THREE.MathUtils.smoothstep(velocity,4,20);
 const nextDistance=u*routeLength+12,f=flightPath.getPointAt(Math.min(nextDistance/routeLength,1));
 if(nextDistance>routeLength)f.addScaledVector(flightPath.getTangentAt(1),nextDistance-routeLength);
 if(activeWorld==='vangogh'){
  const cafeGaze=1-THREE.MathUtils.smoothstep(routeTime,38,56);f.x-=cafeGaze*1.1;f.y+=cafeGaze*.8;
  const skyGaze=THREE.MathUtils.smoothstep(routeTime,230,246)*(1-THREE.MathUtils.smoothstep(routeTime,264,284));f.y+=skyGaze*1.1;
 }
 lookObj.position.copy(p);lookObj.lookAt(f);targetQuat.copy(lookObj.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(pos(0,1,0),Math.PI));
 if(!state.drag){state.targetYaw*=Math.exp(-dt/3.5);state.targetPitch*=Math.exp(-dt/3.5);}const a=1-Math.exp(-dt/.35);state.yaw+=(state.targetYaw-state.yaw)*a;state.pitch+=(state.targetPitch-state.pitch)*a;
 euler.set(state.pitch,state.yaw,0);viewQuat.setFromEuler(euler);targetQuat.multiply(viewQuat);
 const desired=new THREE.Euler().setFromQuaternion(targetQuat,'YXZ'),orientation=new THREE.Euler().setFromQuaternion(camera.quaternion,'YXZ');
 desired.x=clamp(desired.x,-.38,.48);
 if(snap){orientation.copy(desired);yawRate=pitchRate=0;}else{
  const yawError=Math.atan2(Math.sin(desired.y-orientation.y),Math.cos(desired.y-orientation.y));
  const wantedYaw=clamp(yawError/.62,-.42,.42),wantedPitch=clamp((desired.x-orientation.x)/.7,-.16,.16);
  yawRate+=clamp(wantedYaw-yawRate,-.8*dt,.8*dt);pitchRate+=clamp(wantedPitch-pitchRate,-.32*dt,.32*dt);
  const yawStep=yawRate*dt,pitchStep=pitchRate*dt;
  orientation.y+=yawStep;orientation.x=clamp(orientation.x+pitchStep,-.38,.48);
 }
 // Keep the horizon level even at broom speed.
 orientation.z=0;camera.quaternion.setFromEuler(orientation);
 const fov=(innerWidth<700?55:50)+fast*12;
 if(Math.abs(camera.fov-fov)>.02){camera.fov+=(fov-camera.fov)*(1-Math.exp(-dt/.85));camera.updateProjectionMatrix();}
 sky.position.copy(p);if(sky.material.uniforms?.rhoneMix){sky.material.uniforms.rhoneMix.value=THREE.MathUtils.smoothstep(routeTime,86,135)*(1-THREE.MathUtils.smoothstep(routeTime,222,280));sky.material.uniforms.starryMix.value=THREE.MathUtils.smoothstep(routeTime,230,312);}
 if(flightWind){flightWind.position.copy(p);flightWind.quaternion.copy(camera.quaternion);flightWind.material.opacity=state.comfort?0:fast*.10;
  const buf=flightWind.geometry.attributes.position.array;flightWind.userData.seeds.forEach((seed,i)=>{const z=-38+((state.time*.24+seed.phase)%1)*37,r=seed.radius,x=Math.cos(seed.angle)*r,y=Math.sin(seed.angle)*r*.75;buf.set([x,y,z,x,y,z-(1.2+fast*3.5)],i*6);});flightWind.geometry.attributes.position.needsUpdate=true;
 }
}
function notify(text){$('notice').textContent=text;$('notice').classList.add('visible');clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('notice').classList.remove('visible'),3200);}
function currentChapter(){return Math.min(5,Math.floor(state.time/60));}
function updateUI(){const ch=currentChapter();if(ch!==state.chapter){state.chapter=ch;const c=chapters[ch];$('sceneNumber').textContent=`0${ch+1} / 06 · ${c.place}`;$('sceneTitle').textContent=c.title;$('sceneText').textContent=c.text;document.querySelectorAll('.chapter-card').forEach((b,i)=>b.classList.toggle('active',ch===i));}
 if(!state.scrubbing)$('progress').value=state.time;$('progress').style.setProperty('--progress',`${state.time/3.6}%`);if(!state.scrubbing)$('elapsed').textContent=`${Math.floor(state.time/60)}:${String(Math.floor(state.time%60)).padStart(2,'0')}`;
 $('playBtn').setAttribute('aria-label',state.playing?'暂停飞行':'继续飞行');$('playIcon').innerHTML=state.playing?'<path d="M7 5h4v14H7zm6 0h4v14h-4z"/>':'<path d="m8 5 11 7-11 7V5Z"/>';
 $('statusText').textContent=state.time>=360?'旅程结束 · 再走一遍':state.comfort?'静观 · 固定视点':state.playing?(state.speed>=20?'扫帚疾驰':state.speed>=6?'正在快速穿行':state.speed>=2.5?'正在巡游':'正在慢游'):state.started?'已暂停 · 自在环顾':'飞行未开始';$('comfortBtn').setAttribute('aria-pressed',String(state.comfort));
}
function start(){if(!state.ready)return;state.started=true;document.body.classList.add('started');if(state.comfort){state.playing=false;notify('已按减少动态效果偏好启用静观，可点击「静观模式」切换');}else state.playing=true;updateUI();}
function togglePlay(){if(!state.ready)return;if(!state.started){start();return;}if(state.time>=360){jump(0,true);return;}if(state.comfort){state.comfort=false;notify('已开启飞行');}state.playing=!state.playing;updateUI();}
async function jump(time,resume=state.playing){if(state.jumping||!state.ready)return;state.jumping=true;state.playing=false;const f=$('fade');f.style.opacity='1';await new Promise(r=>setTimeout(r,state.comfort?180:720));state.time=clamp(time,0,360);state.targetYaw=state.targetPitch=state.yaw=state.pitch=0;velocity=yawRate=pitchRate=0;lastHeading=null;bankAngle=0;state.started=true;document.body.classList.add('started');updateUI();updateCamera(1,true);renderer.render(scene,camera);f.style.opacity='0';await new Promise(r=>setTimeout(r,state.comfort?180:720));state.playing=resume&&!state.comfort&&state.time<360;state.jumping=false;updateUI();}
function render(now){requestAnimationFrame(render);const dt=Math.min((now-last)/1000||.016,.055);last=now;if(document.hidden||!ctyTourActive)return;
 const target=state.playing&&!state.jumping?Math.min(state.speed,motionProfile.safeSpeed(state.time)):0;state.effectiveSpeed=velocity;velocity+=(target-velocity)*(1-Math.exp(-dt/(target>velocity?1.1:.38)));if(state.playing)state.time=Math.min(360,state.time+dt*velocity);if(state.time>=360){state.playing=false;velocity=0;}
 updateUI();updateCamera(dt);const t=now/1000;if(riverMaterial)riverMaterial.uniforms.uTime.value=state.comfort?0:t;worlds[activeWorld]?.update?.(t,state.comfort,camera.position);
 if(!state.comfort&&activeWorld==='vangogh'){for(const b of boats){b.b.rotation.z=Math.sin(t*.19+b.phase)*.009;b.b.position.y=.04+Math.sin(t*.22+b.phase)*.02;}for(const x of animatedStars)x.s.material.opacity=x.opacity*(.94+.06*Math.sin(t*.25+x.phase));}
 renderer.render(scene,camera);
 if(renderer.info.render.frame%120===0){window.__vanGoghInfo={time:state.time,playing:state.playing,comfort:state.comfort,chapter:state.chapter,objects:scene.children.length,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};}
}
async function init(){try{
 renderer=new THREE.WebGLRenderer({canvas:$('canvas'),antialias:!mobile,alpha:false,powerPreference:mobile?'low-power':'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.45:1.8));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.23;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 scene=new THREE.Scene();scene.background=new THREE.Color(0x18355a);scene.fog=new THREE.FogExp2(0x1c3e63,.0011);camera=new THREE.PerspectiveCamera(mobile?55:50,innerWidth/innerHeight,.35,1400);scene.add(new THREE.AmbientLight(0xb7cce5,2.15));const sun=new THREE.DirectionalLight(0xaabfe9,2.2);sun.position.set(40,100,20);scene.add(sun);const warm=new THREE.DirectionalLight(0xffd279,1.2);warm.position.set(-40,25,10);scene.add(warm);
 const files=['cafe','rhone','boat-detail','stars-detail','shore-detail','starry','ochre','cobbles','water','hills','rhone-sky','panorama','wizard-sky','wizard-stone','wizard-cobblestone','wizard-brick','wizard-painted-wood'];const loader=new THREE.TextureLoader();let loaded=0;await Promise.all(files.map(async n=>{const t=await loader.loadAsync(`assets/${n}.jpg`);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);textures[n]=t;loaded++;$('startLabel').textContent=`正在点亮世界 · ${Math.round(loaded/files.length*100)}%`;}));glow=glowTexture();
 buildSky();buildCafe();buildRiver();buildVillage();buildFlightWind();batchStaticMeshes();
 worlds.vangogh={scene,sky,chapters,flightPath,routeFractions,routeLength,buildingBounds,riverMaterial,flightWind};
 const wizard=buildWizardWorld(THREE,{textures,mobile,glow});if(renderer.isWebGLRenderer){textures['wizard-sky'].mapping=THREE.EquirectangularReflectionMapping;const pmrem=new THREE.PMREMGenerator(renderer);wizard.scene.environment=pmrem.fromEquirectangular(textures['wizard-sky']).texture;wizard.scene.environmentIntensity=.32;pmrem.dispose();}scene=wizard.scene;buildFlightWind();wizard.flightWind=flightWind;batchStaticMeshes();
 wizard.flightPath=new THREE.CatmullRomCurve3(wizard.pathNodes.map(p=>Array.isArray(p)?pos(...p):p),false,'centripetal',.5);wizard.flightPath.arcLengthDivisions=3200;wizard.routeLength=wizard.flightPath.getLength();
 wizard.routeFractions=wizard.landmarks.map((p,i)=>{if(i===0)return 0;if(i===6)return 1;const v=Array.isArray(p)?pos(...p):p;let u=0,best=Infinity;for(let j=0;j<=2400;j++){const d=wizard.flightPath.getPointAt(j/2400).distanceToSquared(v);if(d<best){best=d;u=j/2400;}}return u;});worlds.wizard=wizard;
 activateWorld(new URLSearchParams(location.search).get('world')==='vangogh'?'vangogh':'wizard');state.ready=true;updateUI();updateCamera(1,true);renderer.render(scene,camera);$('canvas').classList.add('ready');$('backdrop').style.opacity='0';$('startBtn').disabled=false;$('startLabel').textContent=activeWorld==='wizard'?'骑上扫帚':'进入画中';if(state.comfort)$('startLabel').textContent='静观这个世界';requestAnimationFrame(render);
 window.__vanGogh={state,camera,renderer,jump,switchWorld,worlds,routeAt,get scene(){return scene},get chapters(){return chapters},get flightPath(){return flightPath},get routeFractions(){return routeFractions},get routeLength(){return routeLength},get buildingBounds(){return buildingBounds},get sky(){return sky},get motionProfile(){return motionProfile}};
 }catch(err){console.error(err);$('error').hidden=false;$('errorText').textContent='未能打开三维空间。请重新打开页面，或换用支持 WebGL 2 的浏览器。';$('startLabel').textContent='画布未能展开';}}
$('startBtn').addEventListener('click',start);$('playBtn').addEventListener('click',togglePlay);$('speed').addEventListener('change',e=>{const speed=Number(e.target.value);if(![1,2.5,6,20].includes(speed))return;state.speed=speed;if(state.speed>=6&&state.comfort){state.comfort=false;notify('快速飞行已准备好，点击播放开始');}else notify(`已切换为${e.target.selectedOptions[0].textContent}`);updateUI();});
$('comfortBtn').addEventListener('click',()=>{state.comfort=!state.comfort;state.playing=false;velocity=yawRate=pitchRate=0;if(state.comfort){state.time=chapters[currentChapter()].time;}updateUI();updateCamera(1,true);notify(state.comfort?'固定视点，点击「旅程」逐章欣赏':'已切换为飞行模式，点击播放继续');});
$('progress').addEventListener('pointerdown',()=>{state.scrubbing=true;state.scrubResume=state.playing;state.playing=false;});$('progress').addEventListener('change',e=>{const t=Number(e.target.value);state.scrubbing=false;jump(t,state.scrubResume??state.playing);});$('progress').addEventListener('pointercancel',()=>{state.scrubbing=false;});$('progress').addEventListener('input',e=>{$('elapsed').textContent=`${Math.floor(e.target.value/60)}:${String(Math.floor(e.target.value%60)).padStart(2,'0')}`;});
function closeDialog(id){$(id).close();if(id==='chapterPanel')$('chaptersBtn').setAttribute('aria-expanded','false');}
$('chaptersBtn').addEventListener('click',()=>{state.playing=false;updateUI();$('chapterPanel').showModal();$('chaptersBtn').setAttribute('aria-expanded','true');});$('closeChapters').addEventListener('click',()=>closeDialog('chapterPanel'));
$('guideBtn').addEventListener('click',()=>{state.playing=false;updateUI();$('guide').showModal();});$('closeGuide').addEventListener('click',()=>closeDialog('guide'));
for(const id of ['guide','chapterPanel']){$(id).addEventListener('click',e=>{if(e.target===$(id)){const b=$(id).getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeDialog(id);}});}
$('chapterPanel').addEventListener('close',()=>$('chaptersBtn').setAttribute('aria-expanded','false'));
function renderChapters(){
 $('chapterList').innerHTML='';chapters.forEach((c,i)=>{const b=document.createElement('button');b.className='chapter-card';b.innerHTML=`<img src="assets/${c.image}" alt="${c.title}"><span><small>0${i+1} · ${Math.floor(c.time/60)}:00</small><b>${c.title}</b></span>`;b.addEventListener('click',()=>{closeDialog('chapterPanel');jump(c.time,false);});$('chapterList').append(b);});
}
function activateWorld(key){
 activeWorld=key;state.world=key;const w=worlds[key];({scene,sky,chapters,flightPath,routeLength,routeFractions,buildingBounds,flightWind}=w);riverMaterial=w.riverMaterial;
 routeSlopes=routeFractions.slice(1).map((n,i)=>n-routeFractions[i]);routeDerivatives=routeFractions.map((_,i)=>i===0?routeSlopes[0]:i===6?routeSlopes[5]:2*routeSlopes[i-1]*routeSlopes[i]/(routeSlopes[i-1]+routeSlopes[i]));
 motionProfile=createMotionProfile(THREE,flightPath,routeAt,routeLength);state.time=0;state.chapter=-1;velocity=yawRate=pitchRate=0;state.targetYaw=state.targetPitch=state.yaw=state.pitch=0;
 renderer.toneMappingExposure=key==='wizard'?1.10:1.23;renderer.shadowMap.needsUpdate=true;document.body.dataset.world=key;document.title=key==='wizard'?'哈利波特 · 月下飞行':'梵高 · 漫游星夜';
 $('brandTitle').textContent=key==='wizard'?'月下魔法':'漫游星夜';$('brandSub').textContent=key==='wizard'?'THE WIZARDING WORLD':"VINCENT'S WORLD";
 $('introEyebrow').textContent=key==='wizard'?'一趟穿越魔法世界的飞行':'一段进入画中的旅程';$('introTitle').innerHTML=key==='wizard'?'今夜，<br>骑着扫帚去霍格沃茨。':'今夜，<br>住进梵高的画里。';$('introText').innerHTML=key==='wizard'?'穿过雪夜街巷，越过黑湖，<br>飞向灯火中的城堡。':'从一盏暖灯出发，沿着河流，<br>慢慢飞向星空。';
 $('startLabel').textContent=key==='wizard'?'骑上扫帚':'进入画中';$('chapterTicks').innerHTML=(key==='wizard'?['对角巷','霍格莫德','石桥','黑湖','霍格沃茨']:['咖啡馆','罗讷河','帆船','星空','星月夜']).map(t=>`<span>${t}</span>`).join('');
 $('chapterHeading').textContent=key==='wizard'?'跟着魔法飞':'跟着星光走';$('worldVangogh').setAttribute('aria-pressed',String(key==='vangogh'));$('worldWizard').setAttribute('aria-pressed',String(key==='wizard'));renderChapters();updateUI();
}
async function switchWorld(key){if(!state.ready||state.jumping||!worlds[key]||key===activeWorld)return;state.jumping=true;const resume=state.started&&state.playing;state.playing=false;$('fade').style.opacity='1';await new Promise(r=>setTimeout(r,720));activateWorld(key);updateCamera(1,true);renderer.render(scene,camera);$('fade').style.opacity='0';await new Promise(r=>setTimeout(r,720));state.jumping=false;state.playing=resume&&!state.comfort;updateUI();}
$('worldVangogh').addEventListener('click',()=>switchWorld('vangogh'));$('worldWizard').addEventListener('click',()=>switchWorld('wizard'));
$('fullBtn').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else notify('横屏观看，可以看到更宽的画面');}catch{notify('横屏观看，可以看到更宽的画面');}});
document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();jump(0,false);});
let pointer={x:0,y:0};const canvas=$('canvas');canvas.addEventListener('pointerdown',e=>{if(!state.ready)return;state.drag=true;pointer={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!state.drag)return;state.targetYaw=clamp(state.targetYaw-(e.clientX-pointer.x)*.0024,-.6,.6);state.targetPitch=clamp(state.targetPitch-(e.clientY-pointer.y)*.002,-.16,.20);pointer={x:e.clientX,y:e.clientY};});const endDrag=()=>{state.drag=false;};canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
addEventListener('keydown',e=>{if(['SELECT','INPUT','BUTTON'].includes(e.target.tagName)||$('guide').open||$('chapterPanel').open)return;if(e.code==='Space'){e.preventDefault();togglePlay();}if(e.code==='ArrowRight'){e.preventDefault();jump(chapters[Math.min(5,currentChapter()+1)].time,false);}if(e.code==='ArrowLeft'){e.preventDefault();jump(chapters[Math.max(0,currentChapter()-1)].time,false);}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){state.playing=false;velocity=0;updateUI();}});addEventListener('resize',()=>{if(!renderer)return;camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<700?55:50;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();state.playing=false;notify('画布暂停了，请刷新页面重新展开');});
$('soundBtn').addEventListener('click',async()=>{try{if(!audioContext){audioContext=new (window.AudioContext||window.webkitAudioContext)();audioGain=audioContext.createGain();audioGain.gain.value=0;audioGain.connect(audioContext.destination);for(const [hz,gain] of [[130.81,.016],[196,.009],[261.63,.006],[392,.003]]){const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.value=hz;g.gain.value=gain;o.connect(g).connect(audioGain);o.start();}}await audioContext.resume();state.sound=!state.sound;audioGain.gain.setTargetAtTime(state.sound?.85:0,audioContext.currentTime,1.6);$('soundBtn').setAttribute('aria-label',state.sound?'关闭环境声音':'开启环境声音');$('soundBtn').style.color=state.sound?'#f6d88c':'';notify(state.sound?'环境声音已开启':'环境声音已关闭');}catch{notify('此浏览器暂时无法播放环境声音');}});
// Structured controls mirror the journey's existing user interface.
if(document.modelContext?.registerTool){for(const tool of [{name:'read_flight_state',description:'Read the selected flight world, viewpoint and playback state.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({world:activeWorld,chapter:currentChapter()+1,title:chapters[currentChapter()].title,time:state.time,playing:state.playing,comfort:state.comfort,speed:state.speed})},{name:'navigate_van_gogh_chapter',description:'Pause the tour and move gently to one of its six chapters.',inputSchema:{type:'object',properties:{chapter:{type:'integer',minimum:1,maximum:6}},required:['chapter'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async input=>{if(!Number.isInteger(input?.chapter)||input.chapter<1||input.chapter>6)throw new Error('chapter must be an integer from 1 to 6');if(!state.ready)throw new Error('The canvas is still loading');await jump(chapters[input.chapter-1].time,false);return {chapter:state.chapter+1,title:chapters[state.chapter].title,playing:state.playing};}}]){try{Promise.resolve(document.modelContext.registerTool(tool)).catch(console.warn);}catch(e){console.warn(e);}}}
init();

// Desktop integration: retain the original tour position while minimized.
addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='cty:tour-visibility')return;ctyTourActive=e.data.active===true;if(typeof audioContext!=='undefined'&&audioContext){if(ctyTourActive&&state.sound)audioContext.resume().catch(()=>{});else audioContext.suspend().catch(()=>{});}});
