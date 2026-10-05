import {buildWizardAlley} from './wizard-alley.js?v=20261005-magic4';
/** A physical wizarding world. Only the sky and masonry use image textures. */
export function buildWizardWorld(THREE, {textures = {}, mobile = false, glow} = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111b2c);
  scene.fog = new THREE.FogExp2(0x18263d, 0.00175);
  const V = (x,y,z) => new THREE.Vector3(x,y,z);
  const buildingBounds = [], animated = [], batches = new Map(), lightCandidates = [];
  let seed = 9241;
  const rand = (a=0,b=1) => {seed=(seed*16807)%2147483647;return a+(b-a)*(seed/2147483647);};
  const pathNodes = [
    [0,3.2,32],[0,3.2,14],[0,3.4,-10],[0,3.6,-35],[1,4,-60],
    [5,4.6,-83],[13,5.6,-109],[20,6.5,-135],[32.5,6.2,-159],
    [39.4,5.3,-185],[45,4.7,-211],[49,5,-240],[52,5.8,-266],
    [57,7.7,-291],[65,14.6,-315],[75,15.2,-338],[85,15.1,-362],
    [94,13.8,-386],[106,15.5,-411],[120,18.6,-441],[134,22.8,-475],
    [146,27.7,-511],[155,32.4,-545],[166,36.5,-575],[179,39.5,-605],
    [187,41,-635],[190,43,-665],[190,46.8,-695],[190,52.5,-725],
    [190,58,-752],[190,61.5,-781]
  ].map(p=>V(...p));
  const landmarks = [pathNodes[0],pathNodes[6],pathNodes[10],pathNodes[16],pathNodes[20],pathNodes[25],pathNodes.at(-1)].map(p=>p.clone());
  const chapters = [
    {time:0,title:'对角巷的灯火',place:'伦敦 · 魔法世界的入口',text:'穿过鹅卵石街道，橱窗里的暖光正在醒来。',image:'wizard-alley.jpg'},
    {time:60,title:'古灵阁与白龙',place:'对角巷 · 白色石柱之上',text:'抬头望向古灵阁，一头白龙展开了双翼。',image:'wizard-alley2.jpg'},
    {time:120,title:'雪落霍格莫德',place:'霍格莫德 · 屋檐下的冬夜',text:'掠过覆雪的尖屋顶，温暖藏在每一扇窗后。',image:'wizard-snow.jpg'},
    {time:180,title:'跨过拱桥',place:'山谷 · 通往城堡的路',text:'沿着石桥缓缓升起，远方的城堡逐渐显现。',image:'wizard-snow.jpg'},
    {time:240,title:'黑湖上的月光',place:'黑湖 · 群山与倒影',text:'贴近静谧的湖面，向霍格沃茨的灯火飞去。',image:'wizard-alley2.jpg'},
    {time:300,title:'霍格沃茨的群塔',place:'霍格沃茨 · 星空下的归处',text:'穿过庭院，越过塔尖，把整座魔法城堡收入眼中。',image:'wizard-alley.jpg'}
  ];
  const mat = (color,extra={}) => new THREE.MeshStandardMaterial({color,roughness:.91,metalness:0,...extra});
  const repeat = (tex,x,y) => {if(!tex)return null;const t=tex.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(x,y);t.needsUpdate=true;return t;};
  const stoneMap=repeat(textures['wizard-stone'],1,1);
  const M = {
    stone:mat(0xc4b8a3,{map:stoneMap,bumpMap:stoneMap,bumpScale:.075}), pale:mat(0xd6c9ae,{map:stoneMap,bumpMap:stoneMap,bumpScale:.05}), darkStone:mat(0x857d70,{map:stoneMap,bumpMap:stoneMap,bumpScale:.075}),
    ivory:mat(0xe6e0ce,{bumpMap:stoneMap,bumpScale:.027,roughness:.82}), snow:mat(0xe3e9ee,{roughness:1,bumpMap:repeat(textures['wizard-cobblestone'],18,18),bumpScale:.018}), slate:mat(0x253037), slate2:mat(0x3c474d),
    wood:mat(0x38241c), woodLight:mat(0x6a4832), green:mat(0x17372f), burgundy:mat(0x4b232b), blue:mat(0x263d50),
    plaster:mat(0xbaaa8b), plaster2:mat(0x817562), brass:mat(0xb79c64,{metalness:.55,roughness:.47}),
    iron:mat(0x111a21,{metalness:.6,roughness:.65}), ground:mat(0x343b36), cobble:mat(0x655f51,{map:repeat(textures['wizard-stone'],16,48)}),
    dark:mat(0x0c1519), glass:mat(0x9b825c,{emissive:0xe9ac4e,emissiveIntensity:.12,roughness:.28}),
    amber:mat(0xffce80,{emissive:0xffb64b,emissiveIntensity:1.6}), red:mat(0xa1523a,{emissive:0xc2723f,emissiveIntensity:.24}),
    dragon:mat(0xe4ded0,{roughness:.78}), dragonWing:mat(0xd8d1c1,{side:THREE.DoubleSide,roughness:.95}),
    rock:mat(0x555e60), pine:mat(0x1e3330), distant:mat(0x253c48)
  };
  const G = {
    box:new THREE.BoxGeometry(1,1,1), cylinder:new THREE.CylinderGeometry(1,1,1,12),
    cone:new THREE.ConeGeometry(1,1,12), sphere:new THREE.SphereGeometry(1,12,8),
    lowSphere:new THREE.IcosahedronGeometry(1,1), roof:new THREE.ConeGeometry(1,1,4),
    torus:new THREE.TorusGeometry(1,.075,5,20),
    pointed:new THREE.ConeGeometry(1,1,8), pyramid:new THREE.ConeGeometry(1,1,4)
  };
  const placed = (geo,material,x,y,z,sx=1,sy=1,sz=1,parent=scene) => {
    const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=!material.transparent;o.receiveShadow=true;parent.add(o);return o;
  };
  const box=(m,x,y,z,w,h,d,parent=scene)=>placed(G.box,m,x,y,z,w,h,d,parent);
  const cyl=(m,x,y,z,r,h,parent=scene)=>placed(G.cylinder,m,x,y,z,r,h,r,parent);
  const sphere=(m,x,y,z,a,b,c,parent=scene)=>placed(G.sphere,m,x,y,z,a,b,c,parent);
  const beam=(a,b,r,m,parent=scene)=>{const d=b.clone().sub(a),o=cyl(m,0,0,0,r,d.length(),parent);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return o;};
  const bounds=(x,z,w,h,d,bottom=0)=>buildingBounds.push(new THREE.Box3(V(x-w/2,bottom,z-d/2),V(x+w/2,bottom+h,z+d/2)));
  const emissiveGlow=(x,y,z,size=2,opacity=.3,parent=scene)=>{
    if(!glow)return;const material=new THREE.SpriteMaterial({map:glow,color:0xffd596,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending});
    const s=new THREE.Sprite(material);s.position.set(x,y,z);s.scale.set(size,size,1);parent.add(s);return s;
  };
  const lamp=(x,y,z,parent=scene,light=false)=>{
    cyl(M.iron,x,y-.42,z,.07,.85,parent);box(M.iron,x,y,z,.45,.68,.45,parent);box(M.amber,x,y,z,.33,.48,.33,parent);
    const cap=placed(G.pyramid,M.iron,x,y+.49,z,.36,.35,.36,parent);cap.rotation.y=Math.PI/4;
    if(light)emissiveGlow(x,y,z,2,.25,parent);
    if(light)lightCandidates.push({parent,position:V(x,y,z)});
  };
  // Closed camera-centered sky: spherical projection, wrap edge blend and a soft horizon.
  const skyMaterial=new THREE.ShaderMaterial({
    uniforms:{skyMap:{value:textures['wizard-sky']||null}},
    vertexShader:'varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:`uniform sampler2D skyMap;varying vec3 vDir;
      void main(){vec3 d=normalize(vDir);float u=fract(atan(d.z,d.x)/6.2831853+.5);
      float v=.14+.81*pow(max(d.y,0.0),.6);float edge=smoothstep(0.0,.095,min(u,1.-u));
      vec3 a=texture2D(skyMap,vec2(u,v)).rgb;vec3 b=texture2D(skyMap,vec2(fract(u+.5),v)).rgb;
      vec3 c=mix(b,a,edge);c=mix(vec3(.025,.055,.09),c,smoothstep(-.14,.12,d.y));
      c=mix(c,vec3(.025,.045,.09),smoothstep(.86,1.,d.y)*.38);gl_FragColor=vec4(c,1.);
      #include <colorspace_fragment>
      }`,side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false,toneMapped:false
  });
  const sky=new THREE.Mesh(new THREE.SphereGeometry(800,mobile?40:64,32),skyMaterial);sky.renderOrder=-100;sky.frustumCulled=false;scene.add(sky);
  scene.add(new THREE.HemisphereLight(0xb3c6db,0x685548,.95));
  const moon=new THREE.DirectionalLight(0xb6c5de,2.0);moon.position.set(60,95,55);moon.castShadow=true;moon.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);moon.shadow.camera.left=-40;moon.shadow.camera.right=40;moon.shadow.camera.top=42;moon.shadow.camera.bottom=-42;moon.shadow.camera.near=1;moon.shadow.camera.far=220;moon.shadow.bias=-.0002;moon.shadow.normalBias=.035;moon.shadow.radius=2;scene.add(moon);scene.add(moon.target);
  const warm=new THREE.DirectionalLight(0xf3d4a5,.68);warm.position.set(-130,55,80);scene.add(warm);
  // Foundation is continuous, while snow and road are actual local surface meshes.
  const land=placed(new THREE.CircleGeometry(1500,80),M.ground,130,-.35,-370);land.rotation.x=-Math.PI/2;
  const alley=buildWizardAlley(THREE,{scene,textures,mobile,glow,buildingBounds,lightCandidates});const {windowFace,pitchedRoof}=alley;
  // Gringotts: white classical bank, broad columns, triangular stone pediment.
  const bank=new THREE.Group();bank.position.set(-13,0,-145);bank.rotation.z=.025;scene.add(bank);
  box(M.ivory,0,11,0,32,22,24,bank);bounds(-13,-145,34,29,26);
  for(let i=0;i<5;i++)box(M.pale,0,.35+i*.4,15-i*.9,35-i*.6,.4,9-i*.6,bank);
  for(let i=0;i<7;i++){
    const x=-13+i*4.3;cyl(M.ivory,x,10.3,13.5,.68,17.5,bank);cyl(M.pale,x,1.65,13.5,.98,.45,bank);cyl(M.pale,x,19.35,13.5,1.02,.65,bank);
    // Fluted column grooves are modeled narrow rods, catching the moonlight.
    for(let k=0;k<8;k++){const a=k*Math.PI/4;cyl(M.pale,x+Math.cos(a)*.6,10.3,13.5+Math.sin(a)*.6,.035,16.5,bank);}
  }
  box(M.ivory,0,20.3,13.5,35,1.2,3.2,bank);box(M.pale,0,21.2,13.5,36,.55,3.8,bank);
  const pedimentShape=new THREE.Shape();pedimentShape.moveTo(-18,0);pedimentShape.lineTo(0,7.5);pedimentShape.lineTo(18,0);pedimentShape.closePath();
  const pediment=new THREE.Mesh(new THREE.ExtrudeGeometry(pedimentShape,{depth:2.2,bevelEnabled:false}),M.ivory);pediment.position.set(0,21.5,12.7);bank.add(pediment);
  box(M.dark,0,7,12.1,8,13,.12,bank);box(M.brass,0,6,12.25,5.6,11,.15,bank);
  for(const x of [-1.45,1.45])box(M.dark,x,7.4,12.36,2.25,6,.08,bank);
  for(let i=-2;i<=2;i++)windowFace(bank,i*5.3,10,-12.1,2.1,6,Math.PI,true);
  for(const x of [-14,14])lamp(x,5,17,bank,true);
  const bankLabel=document.createElement('canvas');bankLabel.width=1024;bankLabel.height=150;const bq=bankLabel.getContext('2d');bq.fillStyle='#c8c2b4';bq.fillRect(0,0,1024,150);bq.fillStyle='#3b403b';bq.font='72px Georgia';bq.textAlign='center';bq.fillText('GRINGOTTS',512,104);const bankTexture=new THREE.CanvasTexture(bankLabel);bankTexture.colorSpace=THREE.SRGBColorSpace;const sign=placed(new THREE.PlaneGeometry(27,2.8),new THREE.MeshStandardMaterial({map:bankTexture,roughness:.8}),0,20.45,15.2,1,1,1,bank);sign.name='shop-sign-GRINGOTTS';
  const rotunda=cyl(M.ivory,0,20,-4,13,13,bank);const crown=cyl(M.ivory,0,27,-4,13.8,1.2,bank);const cupola=placed(new THREE.SphereGeometry(1,32,16,0,Math.PI*2,0,Math.PI/2),M.ivory,0,28,-4,13.8,6.4,13.8,bank);
  // A modeled pale dragon arches over the bank: bones, head, claws and membranes.
  const dragon=new THREE.Group();dragon.position.set(0,30,-1);dragon.rotation.y=-.48;bank.add(dragon);
  sphere(M.dragon,0,1,0,2.6,3.4,5.9,dragon);sphere(M.dragon,0,2.8,3.9,1.8,2.5,2.3,dragon);
  const neckPoints=[V(0,2.8,4),V(.3,5.7,5.2),V(.7,8.4,5.8),V(1.2,9.8,7.1)];
  const neck=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(neckPoints),20,1.12,8,false),M.dragon);dragon.add(neck);
  sphere(M.dragon,1.3,10,8.3,1.6,1.15,2.3,dragon);sphere(M.dragon,1.3,9.65,10.3,1.3,.55,1.6,dragon);
  for(const side of [-1,1]){
    sphere(M.dark,1.3+side*1.25,10.45,9,.14,.15,.17,dragon);
    beam(V(1.3+side*.8,10.6,7.4),V(1.3+side*1.5,13.1,5.8),.26,M.dragon,dragon);
    for(const z of [-3.7,2.8]){beam(V(side*1.8,0,z),V(side*3.8,-3.5,z+1),.54,M.dragon,dragon);beam(V(side*3.8,-3.5,z+1),V(side*4.2,-6,z+2),.33,M.dragon,dragon);for(let k=0;k<3;k++)beam(V(side*4.2,-6,z+2),V(side*(4.4+k*.3),-6.4,z+3+k*.3),.12,M.ivory,dragon);}
    const a=V(side*1.6,3,-1),b=V(side*7.5,7,-3),c=V(side*19,10,-7),d=V(side*16,5,5),e=V(side*9,2.2,7);
    for(const [p,q,r] of [[a,b,.42],[b,c,.3],[b,d,.18],[b,e,.17]])beam(p,q,r,M.dragon,dragon);
    const verts=[...a.toArray(),...b.toArray(),...e.toArray(),...b.toArray(),...d.toArray(),...e.toArray(),...b.toArray(),...c.toArray(),...d.toArray()];
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.computeVertexNormals();dragon.add(new THREE.Mesh(g,M.dragonWing));
  }
  const tailCurve=new THREE.CatmullRomCurve3([V(0,1,-4),V(-1,1.5,-9),V(-5,3,-13),V(-8,5,-14),V(-9,7,-12)]);
  dragon.add(new THREE.Mesh(new THREE.TubeGeometry(tailCurve,24,.63,7,false),M.dragon));
  for(let i=0;i<9;i++){const z=-5+i*1.25;const spike=placed(G.cone,M.ivory,0,4.2,z,.34,1.8,.34,dragon);spike.rotation.x=-.25;}
  // Transition into the Highlands, with winding, snowy Hogsmeade streets.
  const snowfield=placed(new THREE.PlaneGeometry(190,220),M.snow,48,-.08,-245);snowfield.rotation.x=-Math.PI/2;
  for(let i=0;i<35;i++){const z=-172-i*4.2,x=48+(i%2?1:-1)*(25+(i%5)*10);placed(G.sphere,M.snow,x,-.10,z,4+(i%4),.35+(i%3)*.24,4+(i%5));}
  // Bridge geometry has true holes below the deck; arches are thick stone rings.
  function archedBridge(cx,cz,length=70,width=13,deck=12,arches=5,rotate=0){
    const g=new THREE.Group();g.position.set(cx,0,cz);g.rotation.y=rotate;scene.add(g);
    box(M.stone,0,deck-.55,0,width,1.1,length,g);
    for(const side of [-1,1]){
      box(M.darkStone,side*(width/2-.4),deck+.7,0,.8,1.4,length,g);
      box(M.pale,side*(width/2-.4),deck+1.5,0,1.1,.25,length+.5,g);
      for(let i=0;i<=arches;i++){
        const z=-length/2+i*length/arches;box(M.stone,side*(width/2-.9),4.6,z,1.7,9.2,2.1,g);
      }
      for(let i=0;i<arches;i++){
        const z=-length/2+(i+.5)*length/arches,r=length/arches*.42;
        const ring=new THREE.Mesh(new THREE.TorusGeometry(r,1.05,5,18,Math.PI),M.stone);
        ring.rotation.set(0,Math.PI/2,0);ring.position.set(side*(width/2-.9),4.6,z);g.add(ring);
      }
    }
    for(const z of [-length/2+3,length/2-3])for(const side of [-1,1]){box(M.pale,side*(width/2-.6),deck+2,z,1.5,2,1.5,g);lamp(side*(width/2-.6),deck+3.7,z,g,true);}
    // Short transformed collider segments preserve the central lane on the rotated bridge.
    g.updateMatrixWorld(true);
    buildingBounds.push(new THREE.Box3(V(-width/2,deck-1.1,-length/2),V(width/2,deck,length/2)).applyMatrix4(g.matrixWorld));
    for(const side of [-1,1])for(let z=-length/2;z<length/2;z+=4){
      const x=side*(width/2-.4);buildingBounds.push(new THREE.Box3(V(x-.6,deck,z),V(x+.6,deck+1.8,Math.min(z+4,length/2))).applyMatrix4(g.matrixWorld));
    }
    return g;
  }
  const bridge=archedBridge(79.5,-350,73,15,11.4,5,-.39);
  // A rocky ravine reveals the bridge's modeled arches when looking sideways.
  for(let i=0;i<25;i++){
    const side=i%2?-1:1,x=80+side*rand(16,53),z=-315-rand(0,95),h=rand(3,16);
    placed(G.lowSphere,M.rock,x,h/2-3,z,rand(5,12),h,rand(5,13));
    if(i%3===0)placed(G.lowSphere,M.snow,x,h*.75-2,z,7,.5,7);
  }
  // Black Lake is a continuous physical horizontal surface with restrained ripples.
  const waterMaterial=new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:'varying vec3 vWorld;void main(){vec4 p=modelMatrix*vec4(position,1.);vWorld=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}',
    fragmentShader:`varying vec3 vWorld;uniform float uTime;void main(){
      float wave=sin(vWorld.x*.19+vWorld.z*.09+uTime*.12)*sin(vWorld.z*.33-uTime*.1);
      float fine=sin(vWorld.z*1.8+wave*.6+uTime*.08);vec3 c=mix(vec3(.022,.055,.071),vec3(.058,.105,.132),wave*.5+.5);
      float moon=exp(-pow((vWorld.x-127.)/20.,2.))*pow(max(0.,fine),8.)*.085;
      c+=vec3(.33,.46,.58)*moon;gl_FragColor=vec4(c,1.);
      #include <colorspace_fragment>
    }`,side:THREE.DoubleSide});
  const water=placed(new THREE.PlaneGeometry(410,300,1,1),waterMaterial,123,-.17,-491);water.rotation.x=-Math.PI/2;
  // Short broken moon reflections are geometry on the lake, not screen effects.
  const shimmer=new THREE.MeshBasicMaterial({color:0x8ca7b5,transparent:true,opacity:.09,depthWrite:false});
  for(let i=0;i<35;i++){const o=box(shimmer,124+rand(-10,10),-.135,-399-i*4.5,rand(.2,3.5),.005,rand(.03,.17));animated.push({o,phase:i*.6,base:.09,kind:'reflection'});}
  for(let i=0;i<12;i++){
    const x=i%2?-55:305,z=-382-i*18,h=rand(7,21);placed(G.lowSphere,M.rock,x,h*.3,z,rand(15,25),h,rand(12,23));
  }
  function pine(x,z,h=17,snow=false){
    cyl(M.wood,x,h*.35,z,.28,h*.7);
    for(let j=0;j<4;j++){const y=h*(.35+j*.15),r=h*(.23-j*.035);placed(G.cone,M.pine,x,y,z,r,h*.42,r);if(snow)placed(G.cone,M.snow,x,y+.2,z,r*.82,h*.39,r*.82);}
  }
  for(let i=0;i<45;i++){const z=-152-i*13.2,side=i%2?-1:1;pine((side<0?-40:144)+rand(-20,20),z,rand(12,27),z>-395);}
  // Mountain shoulders frame the lake and castle, safely outside the flight corridor.
  for(let i=0;i<17;i++){
    const x=i%2?-140-rand(0,70):460+rand(0,90),z=-550-i*34,h=rand(65,125);
    placed(G.lowSphere,M.distant,x,h*.12-15,z,rand(60,110),h,rand(50,105));
  }
  // Hogwarts stands on a rock promontory with a central open flight corridor.
  for(const x of [123,257])placed(G.lowSphere,M.rock,x,9,-680,55,33,100);
  box(M.darkStone,190,13,-670,186,26,158); // substantial foundations below all castle flight heights
  bounds(190,-670,186,26,158,0);
  function turret(x,z,r,h,{base=25,pale=false,roof=15}={}){
    const m=pale?M.pale:M.stone;cyl(m,x,base+h/2,z,r,h);bounds(x,z,r*2,h+roof,r*2,base);
    cyl(M.darkStone,x,base+1,z,r*1.12,2);cyl(M.pale,x,base+h-1,z,r*1.07,.8);
    for(let floor=0;floor<Math.floor(h/7);floor++)for(let k=0;k<8;k++){
      const a=k*Math.PI/4,xx=x+Math.sin(a)*(r+.04),zz=z+Math.cos(a)*(r+.04),y=base+4.4+floor*6.8;
      windowFace(scene,xx,y,zz,1.05,2.75,a,(floor+k)%5!==0);
    }
    for(let k=0;k<12;k++){const a=k*Math.PI/6;box(M.pale,x+Math.sin(a)*r,base+h+.5,z+Math.cos(a)*r,1.1,1.6,1.1);}
    const top=placed(G.cone,M.slate,x,base+h+roof/2,z,r*1.27,roof,r*1.27);
    cyl(M.brass,x,base+h+roof+.8,z,.08,2);
    return top;
  }
  function castleWing(x,z,w,h,d){
    box(M.stone,x,25+h/2,z,w,h,d);bounds(x,z,w,h+9,d,25);pitchedRoof(scene,x,25+h+4.5,z,w+2,9,d+2,false);
    for(const side of [-1,1])for(let i=0;i<Math.floor(d/6);i++){
      const zz=z-d*.42+i*6;windowFace(scene,x+side*(w/2+.04),36,zz,1.6,5,side>0?Math.PI/2:-Math.PI/2,true);
      if(h>23)windowFace(scene,x+side*(w/2+.04),47,zz,1.3,4.6,side>0?Math.PI/2:-Math.PI/2,i%3!==0);
      box(M.darkStone,x+side*(w/2+1),31,zz+2.5,2,12,2);
    }
    for(let i=0;i<Math.floor(w/5);i++)windowFace(scene,x-w*.4+i*5,36,z+d/2+.04,1.3,5,0,true);
  }
  // West great hall and east teaching wing open around the courtyard's center x=190.
  castleWing(130,-655,48,29,90);castleWing(252,-667,40,31,98);
  turret(106,-606,8,34,{roof:18});turret(151,-607,6.5,26,{roof:14});
  turret(112,-706,11,45,{roof:23});turret(155,-722,8,39,{roof:18});
  turret(234,-611,8,38,{roof:17});turret(271,-624,10,48,{roof:23});turret(269,-720,8,42,{roof:20});
  // Courtyard masonry, cloister piers and vaults surround rather than block the route.
  box(M.pale,190,26.3,-656,70,.55,91);
  for(const x of [164,216])for(let i=0;i<8;i++){
    const z=-617-i*11.3;box(M.darkStone,x,32,z,2.2,11.5,2.2);box(M.stone,x,39,z,3,2,11.5);
    const arch=new THREE.Mesh(new THREE.TorusGeometry(4.3,.7,5,18,Math.PI),M.pale);arch.rotation.y=Math.PI/2;arch.position.set(x,32,z-5.5);scene.add(arch);
  }
  // An open stone portal spans overhead at 50m, with ample broom clearance.
  for(const x of [175,205]){box(M.pale,x,39.5,-704,6,27,7);bounds(x,-704,6,27,7,26);}
  const portal=new THREE.Mesh(new THREE.TorusGeometry(12,1.5,7,24,Math.PI),M.pale);portal.position.set(190,48,-704);scene.add(portal);
  // Distant keep faces the final viewpoint, continuing the skyline beyond the fly-through.
  box(M.darkStone,190,13,-825,178,26,93);bounds(190,-825,178,26,93);
  for(const x of [130,248])placed(G.lowSphere,M.rock,x,5,-818,49,31,65);
  castleWing(132,-808,41,38,54);castleWing(249,-806,42,37,51);
  turret(141,-805,12,69,{base:25,roof:29});turret(235,-814,11,59,{base:25,roof:27});
  turret(173,-843,7,48,{base:25,roof:22});turret(206,-843,8,54,{base:25,roof:24});
  box(M.stone,190,45,-849,38,40,24);bounds(190,-849,38,48,24,25);pitchedRoof(scene,190,69,-849,41,9,27);
  for(let i=0;i<6;i++)windowFace(scene,176+i*5.5,48,-836.8,1.6,9,0,true);
  for(const x of [177,203])for(const z of [-615,-660,-700])lamp(x,29.7,z,scene,true);
  // A handful of glowing floating candles adds atmosphere without obscuring flight.
  for(let i=0;i<12;i++){
    const x=i%2?207:173,z=-626-i*6,y=rand(36,47);cyl(M.ivory,x,y,z,.07,.52);
    const flame=sphere(M.amber,x,y+.36,z,.07,.17,.07);emissiveGlow(x,y+.4,z,.9,.18);
    animated.push({o:flame,y:y+.36,phase:rand(0,6),kind:'candle'});
  }
  // Snow is local to Hogsmeade, sparse and slow, with a comfort-mode stop.
  const snowCount=mobile?100:210,snowPositions=new Float32Array(snowCount*3),snowSeeds=[];
  for(let i=0;i<snowCount;i++){const x=rand(-12,114),y=rand(1,39),z=rand(-160,-310);snowPositions.set([x,y,z],i*3);snowSeeds.push({x,y,z,speed:rand(.13,.32),phase:rand(0,6)});}
  const snowGeometry=new THREE.BufferGeometry();snowGeometry.setAttribute('position',new THREE.BufferAttribute(snowPositions,3));
  const snow=new THREE.Points(snowGeometry,new THREE.PointsMaterial({color:0xdde7f1,size:.09,transparent:true,opacity:.54,depthWrite:false,sizeAttenuation:true}));scene.add(snow);
  // Eight deliberately spaced practical lights keep all six areas warm at modest rendering cost.
  scene.updateMatrixWorld(true);
  const lightPositions=lightCandidates.map(c=>c.position.clone().applyMatrix4(c.parent.matrixWorld));
  const lightZ=mobile?[0,-125,-230,-350,-640,-704]:[0,-65,-125,-200,-265,-350,-640,-704];
  const used=new Set();
  for(const z of lightZ){let index=-1,best=Infinity;lightPositions.forEach((p,i)=>{if(!used.has(i)&&Math.abs(p.z-z)<best){index=i;best=Math.abs(p.z-z);}});if(index>=0){used.add(index);const l=new THREE.PointLight(0xffbe66,110,19,2);l.position.copy(lightPositions[index]);scene.add(l);}}
  // Consolidate reusable opaque geometry into instanced batches, preserving all true 3D surfaces.
  scene.updateMatrixWorld(true);
  const originals=[];
  scene.traverse(o=>{
    if(!o.isMesh||o.isInstancedMesh||o===sky||o.material.transparent||o.material.isShaderMaterial)return;
    const key=o.geometry.uuid+':'+o.material.uuid;if(!batches.has(key))batches.set(key,{geometry:o.geometry,material:o.material,objects:[]});batches.get(key).objects.push(o);originals.push(o);
  });
  for(const b of batches.values()){
    if(b.objects.length<3)continue;
    const instance=new THREE.InstancedMesh(b.geometry,b.material,b.objects.length);
    for(let i=0;i<b.objects.length;i++){instance.setMatrixAt(i,b.objects[i].matrixWorld);b.objects[i].removeFromParent();}
    instance.castShadow=b.objects.some(o=>o.castShadow);instance.receiveShadow=true;instance.instanceMatrix.needsUpdate=true;instance.computeBoundingSphere();scene.add(instance);
  }
  // Merge remaining unique opaque parts by material, including all transformed groups.
  const remaining=new Map();scene.updateMatrixWorld(true);scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.material.isShaderMaterial)return;const id=o.material.uuid;if(!remaining.has(id))remaining.set(id,[]);remaining.get(id).push(o);});
  for(const objects of remaining.values()){
    if(objects.length<2)continue;const p=[],n=[],uv=[];
    for(const o of objects){const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,a=g.attributes.position,b=g.attributes.normal,t=g.attributes.uv,nm=new THREE.Matrix3().getNormalMatrix(o.matrixWorld);
      for(let i=0;i<a.count;i++){const v=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);p.push(v.x,v.y,v.z);const nn=b?new THREE.Vector3().fromBufferAttribute(b,i).applyNormalMatrix(nm):V(0,1,0);n.push(nn.x,nn.y,nn.z);uv.push(t?t.getX(i):0,t?t.getY(i):0);}o.removeFromParent();if(g!==o.geometry)g.dispose();}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeBoundingSphere();const o=new THREE.Mesh(g,objects[0].material);o.castShadow=objects.some(o=>o.castShadow);o.receiveShadow=true;scene.add(o);
  }
  // Remove empty facade transform containers left after instancing.
  const emptyGroups=[];scene.traverse(o=>{if(o.isGroup)emptyGroups.push(o);});
  for(const g of emptyGroups.reverse())if(!g.children.length)g.removeFromParent();
  // Flame geometry is intentionally stable while the surrounding snowfall and water move.
  function update(time,comfort=false,viewPosition){
    if(viewPosition){moon.position.copy(viewPosition).add(V(60,95,45));moon.target.position.copy(viewPosition).add(V(0,0,-14));moon.target.updateMatrixWorld();}
    waterMaterial.uniforms.uTime.value=comfort?0:time;
    if(!comfort){
      const p=snowGeometry.attributes.position.array;
      for(let i=0;i<snowSeeds.length;i++){const s=snowSeeds[i];p[i*3]=s.x+Math.sin(time*.07+s.phase)*.35;p[i*3+1]=1+((s.y-time*s.speed)%38+38)%38;}
      snowGeometry.attributes.position.needsUpdate=true;
    }
    snow.visible=!comfort;
    for(const a of animated){if(a.kind==='reflection')a.o.material.opacity=comfort?a.base:a.base*(.87+.13*Math.sin(time*.17+a.phase));}
  }
  return {scene,sky,chapters,pathNodes,landmarks,buildingBounds,update,cobbleCount:alley.cobbleCount};
}
