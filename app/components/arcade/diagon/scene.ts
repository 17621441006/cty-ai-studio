import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {makeRoute} from './route.mjs';
import {DIAGON_MATERIALS} from './assets.mjs';
const V=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
export function buildDiagon(images:Map<string,HTMLImageElement>){
 const group=new T.Group(),textures:T.Texture[]=[],materials=new Set<T.Material>(),geometries=new Set<T.BufferGeometry>(),route=makeRoute();
 const lamps:T.Vector3[]=[],animated:{mesh:T.Object3D;phase:number}[]=[],windows:T.MeshStandardMaterial[]=[];
 const boxGeo=new T.BoxGeometry(1,1,1),cylGeo=new T.CylinderGeometry(1,1,1,12),ballGeo=new T.SphereGeometry(1,12,8);geometries.add(boxGeo);geometries.add(cylGeo);geometries.add(ballGeo);
 const material=(color:string,roughness=.8,extra:T.MeshStandardMaterialParameters={})=>{const m=new T.MeshStandardMaterial({color,roughness,...extra});materials.add(m);return m;};
 function textured(name:string,color:string,repeat:number,roughness=.8){const m=material(color,roughness);for(const key of ['map','normalMap','roughnessMap'] as const){const url=DIAGON_MATERIALS[name][key],image=images.get(url);if(!image)throw new Error(`Missing prepared material: ${url}`);const t=new T.Texture(image);t.needsUpdate=true;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=4;if(key==='map')t.colorSpace=T.SRGBColorSpace;m[key]=t;textures.push(t);}m.normalScale.set(.55,.55);return m;}
 const brick=textured('brick','#a68b79',2.6),plaster=textured('plaster','#b8b19b',1),stone=textured('paving','#a5aaa5',1),cobble=textured('cobble','#b5bcc0',1,.78);cobble.normalScale.set(.9,.9);
 const cream=material('#aca087'),slate=material('#263740',.62),wood=material('#312520'),iron=material('#182526',.48,{metalness:.55}),brass=material('#b99a5c',.3,{metalness:.7}),dark=material('#142526');
 const finishes=['#294948','#523e37','#594334','#4b405b','#73402c','#384a44'].map(c=>material(c,.65));
 const wine=material('#793c42'),bookMats=[wine,material('#3e6465'),material('#c4aa75'),material('#544e72')];
 const glass=material('#95b3b0',.17,{transparent:true,opacity:.13,depthWrite:false,metalness:.15});
 const warm=material('#ffe6af',.58,{emissive:'#ffc77e',emissiveIntensity:1.5});
 const potionMats=['#77b9a3','#b293d0','#edac67'].map(c=>material(c,.27,{emissive:c,emissiveIntensity:.22,metalness:.15}));
 function mesh(parent:T.Object3D,g:T.BufferGeometry,m:T.Material,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=!m.transparent;o.receiveShadow=true;parent.add(o);return o;}
 function box(parent:T.Object3D,w:number,h:number,d:number,m:T.Material,x=0,y=0,z=0){const o=mesh(parent,boxGeo,m,x,y,z);o.scale.set(w,h,d);return o;}
 function cylinder(parent:T.Object3D,r:number,h:number,m:T.Material,x=0,y=0,z=0){const o=mesh(parent,cylGeo,m,x,y,z);o.scale.set(r,h,r);return o;}
 function ball(parent:T.Object3D,r:number,m:T.Material,x=0,y=0,z=0){const o=mesh(parent,ballGeo,m,x,y,z);o.scale.setScalar(r);return o;}
 function beam(parent:T.Object3D,a:T.Vector3,b:T.Vector3,r:number,m:T.Material){const o=cylinder(parent,r,a.distanceTo(b),m);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(V(0,1,0),b.clone().sub(a).normalize());return o;}
 function custom(parent:T.Object3D,g:T.BufferGeometry,m:T.Material,x=0,y=0,z=0){geometries.add(g);return mesh(parent,g,m,x,y,z);}
 const signs=new Map<string,T.MeshStandardMaterial>();
 function label(parent:T.Object3D,text:string,sub:string,w:number,h:number,finish:string,x:number,y:number,z:number){
  const key=[text,sub,w,h,finish].join('|'),existing=signs.get(key);if(existing)return custom(parent,new T.PlaneGeometry(w,h),existing,x,y,z);
 const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);const ctx=c.getContext('2d')!;ctx.fillStyle=finish;ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle='#c5ae78';ctx.lineWidth=2;ctx.strokeRect(6,6,c.width-12,c.height-12);ctx.strokeRect(10,10,c.width-20,c.height-20);ctx.fillStyle='#efdeaf';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${Math.round(c.height*(sub?.37:.5))}px Georgia,serif`;ctx.fillText(text,256,c.height*(sub?.4:.51),480);if(sub){ctx.font=`${Math.round(c.height*.15)}px Georgia,serif`;ctx.fillText(sub,256,c.height*.76,450);}const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;textures.push(texture);const m=material('#ffffff',.8,{map:texture,emissive:'#ad8c56',emissiveMap:texture,emissiveIntensity:.25});signs.set(key,m);return custom(parent,new T.PlaneGeometry(w,h),m,x,y,z);
 }
 const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;const gc=glowCanvas.getContext('2d')!,gr=gc.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'#fff3d2cc');gr.addColorStop(.18,'#ffd9a577');gr.addColorStop(1,'#ffb86900');gc.fillStyle=gr;gc.fillRect(0,0,64,64);const glowTex=new T.CanvasTexture(glowCanvas);textures.push(glowTex);
 const glowMat=new T.SpriteMaterial({map:glowTex,color:'#ffdcb0',transparent:true,opacity:.65,depthWrite:false,blending:T.AdditiveBlending});materials.add(glowMat);
 function glow(parent:T.Object3D,x:number,y:number,z:number,s:number){const o=new T.Sprite(glowMat);o.position.set(x,y,z);o.scale.setScalar(s);parent.add(o);return o;}
 function lantern(parent:T.Object3D,x:number,y:number,z:number){
  beam(parent,V(x,y+.6,z-.55),V(x,y+.6,z),.028,iron);box(parent,.3,.43,.3,warm,x,y,z);
  for(const a of [-.18,.18])for(const b of [-.18,.18])beam(parent,V(x+a,y-.27,z+b),V(x+a,y+.26,z+b),.022,iron);
  box(parent,.43,.065,.43,iron,x,y-.27,z);const roof=custom(parent,new T.ConeGeometry(.35,.28,4),iron,x,y+.38,z);roof.rotation.y=Math.PI/4;ball(parent,.045,brass,x,y+.57,z);glow(parent,x,y,z,1.3);
  parent.updateWorldMatrix(true,false);lamps.push(parent.localToWorld(V(x,y-.05,z)));
 }
 function arch(parent:T.Object3D,w:number,h:number,depth:number,mat:T.Material,x:number,y:number,z:number){
  const s=new T.Shape(),r=w/2;s.moveTo(-r,0);s.lineTo(-r,h-r);s.absarc(0,h-r,r,Math.PI,0,true);s.lineTo(r,0);s.closePath();return custom(parent,new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:1,curveSegments:16}),mat,x,y,z);
 }
 function sash(parent:T.Object3D,x:number,y:number,z:number,w:number,h:number,lit:boolean){
  arch(parent,w+.2,h+.12,.1,cream,x,y,z-.05);const fill=lit?windows[Math.abs(Math.round(x*3+y))%windows.length]:dark;arch(parent,w,h,.02,fill,x,y+.04,z+.06);
  for(const xx of [-w/2,0,w/2])box(parent,.045,h-w/2,.12,wood,x+xx,y+(h-w/2)/2,z+.15);box(parent,w,.045,.12,wood,x,y+h*.44,z+.15);box(parent,w+.35,.12,.38,cream,x,y-.07,z+.04);
  box(parent,w,.045,.13,wood,x,y+h-w/2,z+.16);for(const a of [.45,.9,1.35,1.8,2.25,2.7])beam(parent,V(x,y+h-w/2,z+.17),V(x+Math.cos(a)*w*.47,y+h-w/2+Math.sin(a)*w*.47,z+.17),.013,wood);
  for(const xx of [-w*.25,w*.25])box(parent,.024,h-w/2,.06,brass,x+xx,y+(h-w/2)/2,z+.2);
 }
 for(let i=0;i<3;i++)windows.push(material('#e1be83',.7,{emissive:'#ffbb6c',emissiveIntensity:.4+i*.15}));
 // Curved cobbled street: correct, metre-scaled UVs, raised pavements and actual curbs.
 function ribbon(left:number,right:number,y:number,m:T.Material){const positions:number[]=[],uv:number[]=[],indices:number[]=[],n=180,len=route.getLength();for(let i=0;i<=n;i++){const p=route.getPointAt(i/n),t=route.getTangentAt(i/n),normal=V(-t.z,0,t.x).normalize();for(const side of [left,right]){const q=p.clone().addScaledVector(normal,side);positions.push(q.x,y,q.z);uv.push(side/2.2,i/n*len/2.2);}if(i<n){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return custom(group,g,m);}
 ribbon(-2.85,2.85,0,cobble);ribbon(-4.15,-2.85,.12,stone);ribbon(2.85,4.15,.12,stone);
 ribbon(-2.82,-2.66,.008,dark);ribbon(2.66,2.82,.008,dark);
 // Individually jointed kerbstones and drainage grates give the road a readable human scale.
 const streetLength=route.getLength();for(let d=0;d<streetLength;d+=.63){const p=route.getPointAt(d/streetLength),t=route.getTangentAt(d/streetLength),n=V(-t.z,0,t.x);for(const side of [-1,1]){const q=p.clone().addScaledVector(n,side*2.89),o=box(group,.17,.15,.60,stone,q.x,.085,q.z);o.rotation.y=Math.atan2(t.x,t.z);}}
 for(let d=3;d<streetLength;d+=7){const p=route.getPointAt(d/streetLength),t=route.getTangentAt(d/streetLength),n=V(-t.z,0,t.x);for(const side of [-1,1]){const grate=new T.Group();grate.position.copy(p).addScaledVector(n,side*2.7);grate.position.y=.015;grate.rotation.y=Math.atan2(t.x,t.z);group.add(grate);box(grate,.27,.016,.54,iron);for(let k=0;k<7;k++)box(grate,.23,.014,.02,dark,0,.016,k*.068-.2);}}
 box(group,120,.3,160,material('#252b2d'),0,-.26,-25);
 // Street furniture uses real silhouettes and small stock arranged inside recesses.
 function stock(parent:T.Object3D,kind:number,x:number,z:number){for(let row=0;row<3;row++){const y=.64+row*.59;box(parent,1.65,.065,.55,wood,x,y,z);for(let j=0;j<6;j++){const xx=x-.64+j*.25;if(kind%3===0){box(parent,.2,.1,.5,bookMats[(j+row)%4],xx,y+.09,z);box(parent,.2,.1,.5,bookMats[(j+row+1)%4],xx,y+.2,z);}else if(kind%3===1){const b=box(parent,.18,.33+(j%3)*.06,.27,bookMats[(j+row)%4],xx,y+.24,z);b.rotation.z=(j%3-1)*.09;box(parent,.016,.25,.28,brass,xx-.055,y+.22,z+.005);}else{ball(parent,.092,potionMats[j%3],xx,y+.14,z);cylinder(parent,.035,.15,potionMats[j%3],xx,y+.27,z);cylinder(parent,.04,.035,wood,xx,y+.35,z);}}}}
 const shopNames=[['OLLIVANDERS','MAKERS OF FINE WANDS'],['FLOURISH & BLOTTS','BOOKSELLERS • SINCE 1654'],['SLUG & JIGGERS','APOTHECARY'],['MADAM MALKIN’S','ROBES FOR ALL OCCASIONS'],['WEASLEYS’ WIZARD WHEEZES','MAGICAL MISCHIEF'],['EEYLOPS','OWL EMPORIUM'],['QUALITY QUIDDITCH','SUPPLIES & RACING BROOMS'],['POTAGE’S','CAULDRON SHOP']];
 let shopCount=0;
 function shop(u:number,side:number,index:number,placement?:{x:number;z:number;yaw:number}){shopCount++;const p=route.getPointAt(u),t=route.getTangentAt(u),n=V(-t.z,0,t.x).normalize(),g=new T.Group();g.position.set(placement?.x??p.x+n.x*side*6.5,0,placement?.z??p.z+n.z*side*6.5);g.rotation.y=placement?.yaw??Math.atan2(-n.x*side,-n.z*side);group.add(g);const w=6.65,h=7.5+(index%3)*1.35,finish=finishes[index%finishes.length],wall=index%3===1?plaster:brick;
  box(g,w,h-3.2,4.6,wall,0,(h+3.2)/2,0);box(g,w,.14,4.6,stone,0,.11,0);box(g,w,.14,4.6,wood,0,3.18,0);box(g,w,3.2,.16,wood,0,1.6,-2.22);for(const x of [-w/2,w/2])box(g,.17,3.2,4.6,wall,x,1.6,0);
  // Deep shop windows project out towards the street; no pasted flat facade.
  for(const x of [-1.63,1.63]){const bay=new T.Group();bay.position.set(x,0,2.19);g.add(bay);const r=.98;
   for(let j=0;j<7;j++){const angle=-Math.PI*.43+j/6*Math.PI*.86,xx=Math.sin(angle)*r,zz=Math.cos(angle)*r;
    const frame=box(bay,.055,2.36,.075,finish,xx,1.46,zz);frame.rotation.y=angle;
    if(j<6){const a=angle+Math.PI*.86/12,glassPane=box(bay,.43,2.26,.016,glass,Math.sin(a)*r,1.46,Math.cos(a)*r);glassPane.rotation.y=a;}
   }
   for(const y of [.31,1.52,2.65]){const geo=new T.TorusGeometry(r,.045,5,24,Math.PI*.86),o=custom(bay,geo,finish,0,y,0);o.rotation.set(Math.PI/2,0,Math.PI*.07);}
   const base=cylinder(bay,1.04,.29,finish,0,.25,0);base.scale.z=.95;const cap=cylinder(bay,1.07,.15,finish,0,2.76,0);cap.scale.z=.95;
   stock(g,index,x,2.1);box(g,1.7,.03,.8,warm,x,2.73,1.9);glow(g,x,1.65,2.82,1.7);
  }
  for(const x of [-3.05,3.05]){box(g,.35,3.1,.22,finish,x,1.64,2.4);for(const y of [.38,2.65])box(g,.46,.09,.3,brass,x,y,2.47);}
  // Central doorway with arched fanlight, brass handle and recessed threshold.
  arch(g,1.02,2.85,.08,finish,0,.16,2.37);arch(g,.79,2.61,.035,dark,0,.24,2.48);sash(g,0,1.1,2.54,.58,1.23,true);box(g,.75,.6,.05,finish,0,.6,2.54);ball(g,.035,brass,.28,1.28,2.59);box(g,1.16,.11,.5,stone,0,.17,2.62);
  const named=shopNames[index%shopNames.length];label(g,named[0],named[1],5.1,.63,['#213b37','#342923','#392e3c'][index%3],0,3.04,2.64);
  for(const y of [3.55,6.55,h])box(g,w+.2,.17,4.86,cream,0,y,0);
  for(const y of [4.05,6.93])if(y+1.65<h+.1)for(const x of [-1.55,0,1.55]){sash(g,x,y,2.35,1.02,1.73,(index+Math.round(x*2))%3!==0);for(const sx of [-1,1])box(g,.2,1.64,.13,finish,x+sx*.68,y+.79,2.49);}
  for(const x of [-3.23,3.23]){beam(g,V(x,.2,2.44),V(x,h+.05,2.44),.055,iron);for(let j=0;j<Math.floor(h/.6);j++)box(g,.28,.19,.15,cream,x,j*.6+.5,2.46);}
  // Overhanging pitched slate roofs, dormers, ridges and terracotta chimney pots.
  for(const s of [-1,1]){const roof=box(g,w+.55,.17,2.95,slate,0,h+.68,s*1.18);roof.rotation.x=s*.54;for(let k=0;k<6;k++){const seam=box(g,w+.57,.035,.045,iron,0,h+.13+k*.235,s*(2.37-k*.4));seam.rotation.x=s*.54;}}
  beam(g,V(-3.6,h+1.41,0),V(3.6,h+1.41,0),.085,slate);
  box(g,.66,1.85,.65,brick,1.35,h+1.3,-.5);box(g,.9,.14,.87,cream,1.35,h+2.23,-.5);for(const x of [1.17,1.54])cylinder(g,.12,.38,wine,x,h+2.48,-.5);
  if(index%2===0){box(g,1.38,1.5,1.3,wall,-1.05,h+.48,1);sash(g,-1.05,h+.01,1.69,.82,1.06,true);for(const s of [-1,1]){const roof=box(g,.93,.12,1.75,slate,-1.05+s*.32,h+1.35,1);roof.rotation.z=-s*.63;}}
  lantern(g,-2.4,2.6,3.2);
  // Suspended, double-sided gilded signs sway gently; no changing building transforms.
  const hanger=new T.Group();hanger.position.set(2.37,3.8,3.14);hanger.userData.dynamic=true;g.add(hanger);beam(g,V(0,.7,-.75),V(0,.7,.45),.032,iron);for(const z of [-.1,.32])beam(hanger,V(0,0,z),V(0,-.35,z),.012,brass);const plaque=label(hanger,index%2?'BOOKS':'WANDS','',.95,.46,'#253632',0,-.5,.35);plaque.rotation.y=Math.PI/2;const back=plaque.clone();back.rotation.y=-Math.PI/2;back.position.x=-.02;hanger.add(back);animated.push({mesh:hanger,phase:index});
  if(index===4){const giant=new T.Group();g.add(giant);giant.position.set(0,5.95,3.04);cylinder(giant,.54,.92,finishes[4],0,0,0);cylinder(giant,.73,.09,brass,0,-.48,0);ball(giant,.33,cream,0,-.83,0).scale.y*=1.3;for(const x of [-.14,.14])ball(giant,.045,dark,x,-.75,.31);beam(giant,V(.3,-1.15,0),V(.95,-.55,.1),.08,finishes[4]);}
  if(index%3===2){const cauldron=ball(g,.35,iron,-2.26,.46,3.38);cauldron.scale.y*=.8;custom(g,new T.TorusGeometry(.29,.038,6,20),brass,-2.26,.66,3.38).rotation.x=Math.PI/2;for(const a of [0,2.1,4.2])beam(g,V(-2.26+Math.cos(a)*.21,.24,3.38+Math.sin(a)*.21),V(-2.26+Math.cos(a)*.27,.12,3.38+Math.sin(a)*.27),.035,iron);}
  if(index%3===1){const crates=new T.Group();g.add(crates);crates.position.set(2.25,.12,3.45);for(let j=0;j<3;j++){box(crates,.7,.5,.63,wood,(j%2)*.47,j===2?.77:.26,0);for(let k=0;k<4;k++)box(crates,.7,.035,.055,cream,(j%2)*.47,(j===2?.56:.05)+k*.13,.34);}}
 }
 const order=[6,0,1,2,3,4,5,7];
 for(let i=0;i<8;i++)for(const side of [-1,1])shop(.075+i*.103,side,order[(i+(side===1?3:0))%8]);
 // Continue the shops through the last bend and all the way to the bank steps.
 for(const side of [-1,1]){shop(.893,side,side===1?2:3);shop(.986,side,side===1?7:5);shop(1,side,side===1?1:0,{x:side*7.3,z:-62,yaw:-side*Math.PI/2});}
 // Gateway framing the first view, with individually shaped arch stones.
 function gateway(z:number){for(const x of [-5,5])box(group,3.6,6,2.3,brick,x,3,z);for(let i=0;i<21;i++){const a=i/20*Math.PI,o=box(group,.52,.65,2.5,stone,Math.cos(a)*3.35,3.1+Math.sin(a)*3.35,z);o.rotation.z=a-Math.PI/2;}label(group,'DIAGON ALLEY','BEYOND THE ORDINARY',4,.64,'#243431',0,6.5,z+1.2);}
 gateway(9);
 // A spacious, pale-stone bank terminates the route; the traveller never walks into it.
 const bank=new T.Group();bank.position.set(0,0,-72);bank.scale.setScalar(.9);group.add(bank);box(bank,19,12,7,plaster,0,6,0);for(let s=0;s<4;s++)box(bank,17-s*.35,.16,5.2-s*.6,stone,0,s*.16+.05,4.3);
 for(const x of [-7,-4.6,4.6,7]){const column=new T.Group();column.position.set(x,.55,4.4);column.rotation.z=-x*.007;bank.add(column);cylinder(column,.35,6.25,cream,0,3.12,0);for(const y of [0,6.25]){cylinder(column,.52,.18,cream,0,y,0);box(column,.97,.14,.97,stone,0,y+.1,0);}for(let i=0;i<10;i++){const a=i/10*Math.PI*2;beam(column,V(Math.cos(a)*.36,.22,Math.sin(a)*.36),V(Math.cos(a)*.36,6.08,Math.sin(a)*.36),.035,stone);}}
 arch(bank,3.6,5.9,.25,brass,0,.58,3.54);arch(bank,3.2,5.55,.2,dark,0,.6,3.82);for(const x of [-.77,.77])box(bank,1.49,3.9,.08,wood,x,2.6,4.07);box(bank,.1,4.1,.15,brass,0,2.65,4.15);
 box(bank,17.2,.58,2,cream,0,7.15,4.1);label(bank,'GRINGOTTS','WIZARDING BANK',12,.95,'#77745f',0,8.07,4.65);
 const pediment=new T.Shape();pediment.moveTo(-8.9,0);pediment.lineTo(0,3.4);pediment.lineTo(8.9,0);pediment.closePath();custom(bank,new T.ExtrudeGeometry(pediment,{depth:1.3,bevelEnabled:false}),cream,0,8.8,3.2);
 for(const x of [-7,-4.8,4.8,7])sash(bank,x,8.65,3.55,1.12,2.8,true);for(const x of [-7.7,7.7])lantern(bank,x,3.5,5);
 // The same metre-scaled cobbles continue into the square; no enormous stretched paving tile.
 const plazaGeo=new T.PlaneGeometry(31,30);plazaGeo.rotateX(-Math.PI/2);plazaGeo.translate(0,-.024,-62);const plazaUV=plazaGeo.getAttribute('uv'),plazaPos=plazaGeo.getAttribute('position');for(let i=0;i<plazaUV.count;i++)plazaUV.setXY(i,plazaPos.getX(i)/2.2,plazaPos.getZ(i)/2.2);custom(group,plazaGeo,cobble);
 for(const side of [-1,1]){
  const wing=new T.Group();wing.position.set(side*12.6,0,-64);wing.rotation.y=-side*.2;group.add(wing);box(wing,7.1,11,7,brick,0,5.5,0);
  for(const x of [-2.2,0,2.2])for(const y of [1.1,4.6,8])sash(wing,x,y,3.55,1.3,2.1,(x+y)%3!==0);
  for(const y of [.35,4,7.5,11])box(wing,7.35,.19,7.3,cream,0,y,0);
  for(const s of [-1,1]){const roof=box(wing,7.7,.2,4.65,slate,0,12,s*1.75);roof.rotation.x=s*.53;}
  box(wing,.78,2.1,.75,brick,1.5,12.8,0);cylinder(wing,.19,.4,wine,1.5,14.02,0);
  // Small iron railings and planted stone urns frame, rather than empty, the square.
  for(const z of [-57.8,-60.8,-64]){const x=side*3.35;cylinder(group,.045,.95,iron,x,.52,z);ball(group,.075,brass,x,1,z);}
  for(const y of [.34,.78])beam(group,V(side*3.35,y,-57.8),V(side*3.35,y,-64),.026,iron);
  const urn=cylinder(group,.35,.68,stone,side*3.6,.46,-65);urn.scale.y*=1.1;ball(group,.51,finishes[0],side*3.6,1,-65).scale.y*=1.3;
 }
 // A narrow, roofed side passage, hanging pennants and an old wall clock give the end its own identity.
 const passage=new T.Group();passage.position.set(-8,0,-51);passage.rotation.y=Math.PI/2;group.add(passage);label(passage,'KNOCKTURN ALLEY','',2.5,.4,'#28342e',0,3.75,2.6);
 for(const x of [-1.25,1.25])box(passage,.28,3.1,.34,stone,x,1.65,2.4);box(passage,2.8,.27,.55,stone,0,3.15,2.4);
 const clock=new T.Group();clock.position.set(3.8,4.5,-62);clock.rotation.y=-Math.PI/2;group.add(clock);const clockFace=cylinder(clock,.42,.09,cream);clockFace.rotation.x=Math.PI/2;custom(clock,new T.TorusGeometry(.43,.035,6,32),brass,0,0,.055);beam(clock,V(0,0,.09),V(0,.27,.09),.019,iron);beam(clock,V(0,0,.10),V(-.21,-.10,.10),.022,iron);
 // plaza sits under route, without z-fighting.
 // Thin puddles and warm light pools add grounded highlights without reflections/postprocessing.
 const poolMat=new T.MeshBasicMaterial({color:'#e6b565',transparent:true,opacity:.085,depthWrite:false,map:glowTex});materials.add(poolMat);
 for(const p of lamps){const pool=custom(group,new T.PlaneGeometry(3,4.5),poolMat,p.x,.021,p.z);pool.rotation.x=-Math.PI/2;}
 const water=material('#607984',.16,{metalness:.35,transparent:true,opacity:.25,depthWrite:false});
 for(let i=0;i<9;i++){const u=.08+i*.103,p=route.getPointAt(u),t=route.getTangentAt(u),n=V(-t.z,0,t.x),shape=new T.Shape();for(let j=0;j<=20;j++){const a=j/20*Math.PI*2,r=1+.13*Math.sin(j*2.7+i);const x=Math.cos(a)*(.35+i%3*.11)*r,y=Math.sin(a)*(.85+i%2*.25)*r;if(j===0)shape.moveTo(x,y);else shape.lineTo(x,y);}const puddle=custom(group,new T.ShapeGeometry(shape,12),water,p.x+n.x*(i%2?1.6:-1.6),.013,p.z+n.z*(i%2?1.6:-1.6));puddle.rotation.x=-Math.PI/2;puddle.rotation.z=-Math.atan2(t.x,t.z);puddle.castShadow=false;}
 // Fine floating motes, deliberately bounded and subtle.
 const points=new Float32Array(72*3);for(let i=0;i<72;i++){const p=route.getPointAt((i*.618)%1);points[i*3]=p.x+Math.sin(i*7)*3;points[i*3+1]=.6+(i%11)*.4;points[i*3+2]=p.z;}
 const particleGeo=new T.BufferGeometry();particleGeo.setAttribute('position',new T.BufferAttribute(points,3));geometries.add(particleGeo);const pm=new T.PointsMaterial({color:'#ffdda8',size:.045,transparent:true,opacity:.65,depthWrite:false,map:glowTex});materials.add(pm);const motes=new T.Points(particleGeo,pm);group.add(motes);
 // Merge static geometry by material once. No thousands of per-frame object updates.
 group.updateMatrixWorld(true);const buckets=new Map<T.Material,T.BufferGeometry[]>(),remove:T.Mesh[]=[];
 group.traverse(o=>{if(!(o instanceof T.Mesh)||Array.isArray(o.material))return;let p:T.Object3D|null=o;while(p){if(p.userData.dynamic)return;p=p.parent;}const geo=o.geometry.clone().applyMatrix4(o.matrixWorld),flat=geo.index?geo.toNonIndexed():geo;if(flat!==geo)geo.dispose();const list=buckets.get(o.material)||[];list.push(flat);buckets.set(o.material,list);remove.push(o);});
 for(const m of remove)m.removeFromParent();for(const [m,gs] of buckets){const merged=mergeGeometries(gs,false);gs.forEach(g=>g.dispose());if(merged)custom(group,merged,m);}
 const lightTargets=[new T.Vector3(),new T.Vector3()];
 const lights=[new T.PointLight('#ffd297',28,13,2),new T.PointLight('#ffc989',24,12,2)];lights.forEach(l=>group.add(l));let lastLights=-10;
 return {group,route,lamps,textures,stats:{staticBatches:buckets.size,shops:shopCount},tick(time:number,camera:T.Vector3){for(const a of animated)a.mesh.rotation.z=Math.sin(time*.7+a.phase)*.025;windows.forEach((m,i)=>m.emissiveIntensity=.52+.1*Math.sin(time*.42+i*2.2));motes.position.y=Math.sin(time*.24)*.14;if(time-lastLights>.3){const initial=lastLights===-10;lastLights=time;const near=[...lamps].sort((a,b)=>a.distanceToSquared(camera)-b.distanceToSquared(camera));lights.forEach((l,i)=>{if(near[i])lightTargets[i].copy(near[i]);if(initial)l.position.copy(lightTargets[i]);});}lights.forEach((l,i)=>l.position.lerp(lightTargets[i],.12));},dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
