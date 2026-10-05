// Architecture and surfaces are physical meshes; lettering is printed on signs.
export function buildWizardAlley(T,{scene,textures,mobile,glow,buildingBounds,lightCandidates}){
 const V=(x,y,z)=>new T.Vector3(x,y,z),cache=new Map(),paintCache=new Map();let seed=631;const rnd=(a=0,b=1)=>{seed=seed*16807%2147483647;return a+(b-a)*seed/2147483647};
 const tex=n=>{const t=textures[n].clone();t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1,1);return t};
 const brick=tex('wizard-brick'),wood=tex('wizard-painted-wood'),paving=tex('wizard-cobblestone'),stone=tex('wizard-stone');
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.82,...extra});
 const M={brick:mat(0xc6b2a0,{map:brick,bumpMap:brick,bumpScale:.055}),stone:mat(0xb8ada0,{map:stone,bumpMap:stone,bumpScale:.08}),
  plaster:mat(0x8f8478,{map:stone,bumpMap:stone,bumpScale:.025}),dark:mat(0x121817),oak:mat(0x66513d,{map:wood,bumpMap:wood,bumpScale:.026}),
  brass:mat(0xd0af65,{roughness:.36,metalness:.78}),iron:mat(0x172025,{roughness:.6,metalness:.65}),slate:mat(0x354048,{map:paving,bumpMap:paving,bumpScale:.035}),
  snow:mat(0xe1e9ed,{roughness:.95}),amber:mat(0xefb75b,{emissive:0xffbc5b,emissiveIntensity:1.3}),
  glass:new T.MeshPhysicalMaterial({color:0x678c92,roughness:.16,metalness:.28,transparent:true,opacity:.19,depthWrite:false,clearcoat:1,clearcoatRoughness:.16}),
  upperGlass:mat(0x728382,{roughness:.24,metalness:.35}),inside:mat(0x3d2c23),paper:mat(0xd7c8aa),red:mat(0x8d4140),blue:mat(0x3c6172),green:mat(0x415a42),purple:mat(0x603561),
  road:mat(0xe0ddd5,{map:paving,bumpMap:paving,bumpScale:.10,roughness:.46,metalness:.04}),joint:mat(0x353a3b,{map:paving,bumpMap:paving,bumpScale:.035,roughness:.7}),
  wet: new T.MeshPhysicalMaterial({color:0x354c57,roughness:.16,metalness:.22,transparent:true,opacity:.28,depthWrite:false,clearcoat:1}), moss:mat(0x384438)};
 // World-space coordinates keep one material tile continuous over many physical stones.
 M.road.userData.worldUVScale=3.3;M.road.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
 vec4 pavingPoint=vec4(transformed,1.0);
 #ifdef USE_INSTANCING
 pavingPoint=instanceMatrix*pavingPoint;
 #endif
 vec2 pavingUv=(modelMatrix*pavingPoint).xz/3.3;
 #ifdef USE_MAP
 vMapUv=pavingUv;
 #endif
 #ifdef USE_BUMPMAP
 vBumpMapUv=pavingUv;
 #endif
 `);};M.road.customProgramCacheKey=()=>'world-paving-v4';
 function neutralWood(m){m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
#ifdef USE_MAP
vec4 woodSample=texture2D(map,vMapUv);
float woodGrain=dot(woodSample.rgb,vec3(.299,.587,.114))*3.6;
diffuseColor*=vec4(vec3(woodGrain),woodSample.a);
#endif
`);};m.customProgramCacheKey=()=>'neutral-painted-wood-v4';return m;}neutralWood(M.oak);
 const paint=color=>{if(!paintCache.has(color))paintCache.set(color,neutralWood(mat(color,{map:wood,bumpMap:wood,bumpScale:.035,roughness:.62})));return paintCache.get(color)};
 const unit=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(1,1,1,16),sphere=new T.SphereGeometry(1,18,12);
 function mappedBox(w,h,d){const key=[w,h,d].map(n=>n.toFixed(2)).join(':');if(cache.has(key))return cache.get(key);const g=new T.BoxGeometry(w,h,d),uv=g.attributes.uv;for(let i=0;i<uv.count;i++){const face=Math.floor(i/4),u=face<2?d:face<4?w:w,v=face<2?h:face<4?d:h;uv.setXY(i,uv.getX(i)*u/3.3,uv.getY(i)*v/3.3);}cache.set(key,g);return g;}
 function mesh(geo,m,x,y,z,sx=1,sy=1,sz=1,parent=scene){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=!m.transparent;o.receiveShadow=true;parent.add(o);return o;}
 function box(m,x,y,z,w,h,d,parent=scene){return m.map?mesh(mappedBox(w,h,d),m,x,y,z,1,1,1,parent):mesh(unit,m,x,y,z,w,h,d,parent)}
 const cyl=(m,x,y,z,r,h,parent=scene)=>mesh(cylinder,m,x,y,z,r,h,r,parent);
 const ball=(m,x,y,z,a,b,c,parent=scene)=>mesh(sphere,m,x,y,z,a,b,c,parent);
 function beam(a,b,r,m,parent=scene){const d=b.clone().sub(a),o=cyl(m,0,0,0,r,d.length(),parent);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return o;}
 function textSign(text,w,h,bg='#193c35',fg='#d8bb80',small=''){
  const c=document.createElement('canvas');c.width=h/w>.5?(mobile?256:512):(mobile?512:1024);c.height=Math.round(c.width*h/w);const q=c.getContext('2d');q.fillStyle=bg;q.fillRect(0,0,c.width,c.height);q.strokeStyle=fg;q.lineWidth=5;q.strokeRect(14,14,c.width-28,c.height-28);q.strokeRect(24,24,c.width-48,c.height-48);q.fillStyle=fg;q.textAlign='center';q.textBaseline='middle';let fs=Math.min(c.height*(small?.40:.51),c.width/text.length*1.52);q.font=`600 ${fs}px Georgia,serif`;q.fillText(text,c.width/2,c.height*(small?.43:.52),c.width*.92);if(small){q.font=`${c.height*.13}px Georgia,serif`;q.fillText(small,c.width/2,c.height*.79,c.width*.9);}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map:t,color:0xffffff,roughness:.73});
 }
 function printed(text,x,y,z,w,h,ry,parent,bg,small){const sign=mesh(new T.PlaneGeometry(w,h),textSign(text,w,h,bg,'#d8bb80',small),x,y,z,1,1,1,parent);sign.rotation.y=ry;sign.name='shop-sign-'+text;return sign;}
 function lamp(x,y,z,parent=scene){const g=new T.Group();g.position.set(x,y,z);parent.add(g);beam(V(0,.2,0),V(0,1.0,-.25),.04,M.iron,g);box(M.iron,0,0,0,.46,.75,.46,g);box(M.amber,0,0,0,.32,.55,.32,g);const top=mesh(new T.ConeGeometry(.38,.25,4),M.iron,0,.52,0,1,1,1,g);top.rotation.y=Math.PI/4;for(const x of [-.19,.19])for(const z of [-.19,.19])box(M.iron,x,0,z,.045,.77,.045,g);if(glow){const s=new T.Sprite(new T.SpriteMaterial({map:glow,color:0xffc774,transparent:true,opacity:.18,depthWrite:false,blending:T.AdditiveBlending}));s.position.set(0,0,0);s.scale.set(1.8,1.8,1);g.add(s);}lightCandidates.push({parent:g,position:V(0,0,0)});}
 function pitchedRoof(parent,x,y,z,w,h,d,snow=false){
  const p=[-w/2,-h/2,-d/2,w/2,-h/2,-d/2,0,h/2,-d/2,-w/2,-h/2,d/2,w/2,-h/2,d/2,0,h/2,d/2],index=[0,2,1,3,4,5,0,3,5,0,5,2,1,2,5,1,5,4,0,1,4,0,4,3];
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(index);g.computeVertexNormals();const gn=g.toNonIndexed(),uv=[];for(let i=0;i<gn.attributes.position.count;i++){const v=gn.attributes.position;uv.push(v.getX(i)/3,v.getZ(i)/3);}gn.setAttribute('uv',new T.Float32BufferAttribute(uv,2));const r=mesh(gn,snow?M.snow:M.slate,x,y,z,1,1,1,parent);
  // Separate rows of tile edges make the roof read as slate rather than a flat pyramid.
  if(!snow)for(const side of [-1,1])for(let k=1;k<6;k++){const yy=y+h/2-k*h/6,xx=x+side*k*w/12;box(M.slate,xx,yy,z,.075,.09,d+.08,parent).rotation.z=-side*Math.atan2(h,w/2);}
  for(const side of [-1,1])beam(V(x+side*w/2,y-h/2,z-d/2),V(x,y+h/2,z-d/2),.10,M.oak,parent);
  return r;
 }
 function windowFace(parent,x,y,z,w,h,rotation=0,lit=true){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;parent.add(g);box(M.dark,0,0,0,w+.24,h+.25,.18,g);box(lit?M.inside:M.upperGlass,0,0,.12,w,h,.02,g);if(lit){box(M.paper,-w*.17,0,.15,w*.21,h*.9,.025,g);box(M.paper,w*.2,0,.15,w*.15,h*.9,.025,g);box(M.amber,0,-h*.16,.17,w*.22,h*.30,.03,g);}for(const xx of [-w/2,0,w/2])box(M.oak,xx,0,.27,.08,h+.2,.11,g);for(const yy of [-h/2,0,h/2])box(M.oak,0,yy,.27,w+.15,.07,.1,g);box(M.stone,0,-h/2-.16,0,w+.5,.22,.55,g);return g;}
 const lane=z=>{const nodes=[[42,0],[-60,1],[-83,5],[-109,13],[-135,20],[-159,32.5],[-185,39.4],[-211,45],[-240,49],[-266,52],[-291,57],[-315,65]];for(let i=0;i<nodes.length-1;i++)if(z<=nodes[i][0]&&z>=nodes[i+1][0]){const t=(nodes[i][0]-z)/(nodes[i][0]-nodes[i+1][0]);return T.MathUtils.lerp(nodes[i][1],nodes[i+1][1],t);}return z>42?0:65;};
 function goods(g,index,z0){
  const books=index%4===0,wands=index%4===1,bottles=index%4===2;
  for(let shelf=0;shelf<3;shelf++){const y=1.1+shelf*.75;box(M.oak,.45,y-.1,z0,1.6,.11,2.9,g);for(let j=0;j<7;j++){
   const z=z0-1.16+j*.37;if(books){const m=[M.red,M.green,M.blue,M.paper,M.purple][(j+shelf)%5];box(m,.0,y+.22,z,.34,.44,.22,g);box(M.brass,-.18,y+.22,z,.025,.025,.22,g);}else if(wands){box(M.oak,.0,y+.12,z,.5,.17,.25,g);box(M.brass,-.27,y+.13,z,.015,.04,.15,g);beam(V(-.1,y+.25,z),V(.65,y+.27,z+.12),.016,M.oak,g);}else if(bottles){ball([M.green,M.red,M.blue][j%3],0,y+.19,z,.12,.2,.12,g);cyl(M.brass,0,y+.42,z,.052,.11,g);}else{ball(M.purple,.0,y+.25,z,.17,.2,.17,g);box(M.paper,-.16,y+.24,z,.02,.12,.13,g);}
  }}
 }
 const names=['OLLIVANDERS','FLOURISH & BLOTTS','QUALITY QUIDDITCH','MADAM MALKIN’S','EELLOPS OWL EMPORIUM','SLUG & JIGGERS','MAGICAL MENAGERIE','BORGIN & BURKES'];
 function shop(cx,z,w,h,d,index,side,snow=false){
  const g=new T.Group();g.position.set(cx,0,z);g.rotation.y=rnd(-.025,.025);scene.add(g);const front=-side*w/2,bayHeight=[.91,1.02,1.12,.96][index%4],trim=paint(snow?[0x538d73,0x7f4551,0x375066][index%3]:[0x577f63,0x885b5a,0x667f89,0x745347][index%4]);
  const body=box(index%3===0?M.brick:index%3===1?M.plaster:M.stone,0,h/2,0,w,h,d,g);body.name='weathered-shop-body';
  const upper= new T.Group();upper.position.set(-side*.3,0,0);upper.rotation.z=-side*((index%3)+1)*.013;g.add(upper);
  box(index%3===1?M.brick:M.plaster,0,9.0,0,w+.28,5.8,d+.25,upper);
  // Cornices, pilasters, rain pipes and deep segmented bow windows.
  for(const yy of [4.9*bayHeight,11.9+(index%3-1)*.35,h])box(M.stone,front-side*.15,yy,0,.44,.20,d+.6,g);
  for(const zz of [-d/2+.18,d/2-.18])box(trim,front-side*.15,2.55,zz,.42,4.8,.25,g);
  const bay=new T.Group();bay.position.set(front-side*.38,0,-d*.12);bay.rotation.y=side<0?Math.PI/2:-Math.PI/2;bay.scale.y=bayHeight;g.add(bay);
  // Bay local +z points toward the street. A dark void exposes stocked shelves behind glass.
  box(trim,0,.45,.43,d*.69,.63,1.2,bay);box(M.inside,0,2.4,-.25,d*.67,3.5,.08,bay);
  for(const q of [-1,1]){const b=new T.Group();b.position.set(q*d*.23,0,-.08);b.rotation.y=-q*.20;bay.add(b);box(trim,0,2.45,.18,d*.23+.08,3.6,.12,b);box(M.glass,0,2.5,.27,d*.215,3.25,.022,b);for(const xx of [-d*.115,0,d*.115])box(trim,xx,2.5,.31,.075,3.45,.12,b);for(const yy of [.84,1.64,2.48,3.34,4.16])box(trim,0,yy,.31,d*.23+.10,.075,.12,b);}
  box(M.glass,0,2.5,.55,d*.23,3.25,.025,bay);for(const xx of [-d*.115,0,d*.115])box(trim,xx,2.5,.59,.075,3.45,.12,bay);for(const yy of [.84,1.64,2.48,3.34,4.16])box(trim,0,yy,.59,d*.23+.10,.075,.12,bay);
  // Stock sits inside the bow, never pasted into its glass.
  const stock=new T.Group();stock.position.set(0,0,.12);stock.rotation.y=Math.PI/2;bay.add(stock);goods(stock,index,-d*.23);goods(stock,index,d*.08);
  box(trim,0,4.65,.12,d*.77,.57,1.5,bay);box(M.stone,0,4.99,.13,d*.80,.16,1.65,bay);
  const shopName=snow?['HONEYDUKES','THE THREE BROOMSTICKS','DERVISH & BANGES','ZONKO’S'][index%4]:names[index%names.length];
  printed(shopName,0,4.65,.89,d*.73,.47,0,bay,'#18352e');
  // An inset panelled door with a fanlight and a curved stone hood.
  const doorZ=d*.35;box(trim,front-side*.04,1.8,doorZ,.24,3.55,1.5,g);for(const yy of [.72,1.87])box(M.oak,front-side*.20,yy,doorZ,.08,.80,1.10,g);ball(M.brass,front-side*.29,1.7,doorZ+.40,.065,.065,.065,g);windowFace(g,front-side*.13,3.78,doorZ,1.2,.7,side<0?Math.PI/2:-Math.PI/2,true);box(M.stone,front-side*.60,.15,doorZ,1.0,.25,1.9,g);
  for(let floor=0;floor<Math.floor((h-5)/3.7);floor++)for(const zz of [-d*.28,d*.08,d*.34])windowFace(upper,front-side*.12,6.45+floor*3.7,zz,1.45,2.2,side<0?Math.PI/2:-Math.PI/2,(floor+index)%3!==0);
  // Upper projecting bay distinguishes the skyline from repeated flat walls.
  if(index%3===0){box(trim,front-side*.42,9.9,-d*.1,1.0,2.8,3.8,upper);windowFace(upper,front-side*.97,9.9,-d*.1,3.1,2.1,side<0?Math.PI/2:-Math.PI/2,false);box(M.stone,front-side*.62,8.43,-d*.1,1.5,.19,4.1,upper);}
  pitchedRoof(g,0,h+2.2,0,w+1,4.8,d+1,snow);
  for(const zz of [-d*.3,d*.22]){box(M.brick,side*w*.15,h+3.9,zz,1.0,3.9,1.1,g);box(M.stone,side*w*.15,h+5.95,zz,1.3,.26,1.4,g);for(const dx of [-.28,.28])cyl(M.oak,side*w*.15+dx,h+6.25,zz,.17,.5,g);}
  beam(V(front-side*.40,.35,-d*.42),V(front-side*.40,h,-d*.42),.055,M.iron,g);lamp(front-side*.78,5.5,d*.32,g);
  // Sideways hanging named sign, readable while passing the building.
  beam(V(front,6.8,0),V(front-side*1.55,6.8,0),.05,M.iron,g);const hang=box(trim,front-side*1.40,6.05,0,.10,1.15,1.6,g);printed(snow?'HOGSMEADE':shopName.split(' ')[0],front-side*1.46,6.05,.056,1.6,1.15,side<0?Math.PI/2:-Math.PI/2,g,'#263c34');
  g.updateMatrixWorld(true);const bodyBound=new T.Box3().setFromObject(body);bodyBound.min.y=0;bodyBound.max.y=h+5;bodyBound.expandByScalar(.15);buildingBounds.push(bodyBound);
  if(!snow&&side>0&&index===2)weasleys(g,front,side,d,h);
  return g;
 }
 function weasleys(g,front,side,d,h){
  const orange=mat(0xc66d2f,{map:brick,bumpMap:brick,bumpScale:.035,roughness:.77}),violet=paint(0xb1839d);
  box(orange,front-side*.14,h*.5,0,.34,h,d*.90,g);
  const by=new T.Group();by.position.set(front-side*.6,0,0);by.rotation.y=-Math.PI/2;g.add(by);
  for(const yy of [5.9,9.2,12.6]){box(violet,0,yy,0,d*.7,2.65,1.5,by);windowFace(by,0,yy,.83,d*.55,2.0,0,false);box(M.brass,0,yy-1.45,.25,d*.75,.15,1.9,by);}
  printed('WEASLEYS’',0,4.95,1.18,d*.76,.8,0,by,'#653e61','WIZARD WHEEZES');
  // The tall hat-lifting shop figure is a deliberately sculptural facade ornament.
  const face=mat(0xbb967a),hair=mat(0x9f512b);box(violet,0,16.0,.3,2.7,3.8,1.6,by);ball(face,0,19.0,.6,1.17,1.35,.95,by);ball(hair,0,19.75,.38,1.23,.72,.86,by);ball(M.oak,-.35,19.16,1.5,.075,.08,.07,by);ball(M.oak,.35,19.16,1.5,.075,.08,.07,by);ball(face,0,18.91,1.59,.21,.23,.27,by);beam(V(1.2,16.7,.2),V(2.4,19.0,.1),.39,violet,by);beam(V(2.4,19,.1),V(1.8,21.2,.1),.28,violet,by);cyl(M.iron,0,21.9,.4,1.18,2.3,by);cyl(M.iron,0,20.77,.4,1.57,.17,by);
 }
 // A continuous gently bending flight corridor, with irregular attached frontages.
 for(let i=0;i<9;i++)for(const side of [-1,1]){const z=26-i*16.9,w=rnd(7.4,10.8),h=[15.5,19.5,16.5,21,17.5][(i+(side>0?1:0))%5];if(side<0&&i>7)continue;shop(lane(z)+side*(6.5+w/2),z,w,h,rnd(13.8,15.5),i+(side>0?1:0),side,false);}
 for(let i=0;i<8;i++)for(const side of [-1,1]){const z=-172-i*18.5,w=rnd(8,11.2);shop(lane(z)+side*(7+w/2),z,w,rnd(10,16),16.2,i+2,side,true);}
 // Cobbles have real bevels and variable heights. Chunking permits frustum culling.
 const s=new T.Shape();s.moveTo(-.5,-.5);s.lineTo(.5,-.5);s.lineTo(.5,.5);s.lineTo(-.5,.5);s.closePath();const slab=new T.ExtrudeGeometry(s,{depth:.065,bevelEnabled:true,bevelSize:.025,bevelThickness:.016,bevelSegments:1,steps:1});slab.rotateX(-Math.PI/2);
 const bw=mobile?.76:.64,bd=mobile?.61:.49,dummy=new T.Object3D();let cobbleCount=0;
 for(let zStart=42;zStart>-308;zStart-=18){const matrices=[],colors=[];for(let z=zStart;z>zStart-18;z-=bd){const c=lane(z),snow=z<-158;for(let i=-Math.ceil((snow?7:6.5)/bw);i<=Math.ceil((snow?7:6.5)/bw);i++){const x=c+i*bw+(Math.floor((42-z)/bd)%2)*bw*.5;if(Math.abs(x-c)>(snow?7:6.5))continue;dummy.position.set(x,.035+rnd(-.010,.016),z+rnd(-.025,.025));dummy.rotation.set(0,rnd(-.025,.025),0);dummy.scale.set(bw-rnd(.035,.07),1,bd-rnd(.025,.055));dummy.updateMatrix();matrices.push(dummy.matrix.clone());colors.push(new T.Color().setHSL(.09+rnd(-.03,.015),rnd(.025,.09),rnd(.68,.91)));}}
  const stones=new T.InstancedMesh(slab,M.road,matrices.length);for(let i=0;i<matrices.length;i++){stones.setMatrixAt(i,matrices[i]);stones.setColorAt(i,colors[i]);}stones.receiveShadow=true;stones.castShadow=false;stones.name='bevelled-street-cobbles';stones.instanceMatrix.needsUpdate=true;stones.computeBoundingSphere();scene.add(stones);cobbleCount+=matrices.length;
 }
 // World-scale diffuse paving between stones, raised sidewalks and gutter ironwork.
 function groundRibbon(){const p=[],uv=[],ind=[],n=280;for(let i=0;i<=n;i++){const z=44-i*1.3,c=lane(z);for(const side of [-1,1]){const x=c+side*8;p.push(x,.012,z);uv.push(x/3.3,z/3.3);}if(i<n){const k=i*2;ind.push(k,k+1,k+2,k+1,k+3,k+2);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ind);g.computeVertexNormals();mesh(g,M.joint,0,0,0);}
 groundRibbon();
 for(let z=38;z>-305;z-=1.6)for(const side of [-1,1]){const c=lane(z);box(M.stone,c+side*6.65,.14,z,.23,.25,1.58);if(Math.floor(z)%8===0)box(M.iron,c+side*6.45,.032,z,.25,.035,1.12);}
 for(let i=0;i<55;i++){const z=rnd(-145,36),x=lane(z)+rnd(-5.8,5.8);const o=mesh(new T.CircleGeometry(1,18),M.wet,x,.133,z,rnd(.25,1.0),rnd(.16,.46),1);o.rotation.x=-Math.PI/2;o.rotation.z=rnd(0,Math.PI);}
 // Everyday street stock, broom displays, barrels, notices and drainage grates.
 for(let i=0;i<25;i++){const z=19-i*11.8,side=i%2?1:-1,x=lane(z)+side*5.7;
  if(i%3===0){const b=cyl(M.oak,x,.65,z,.43,1.2);for(const y of [.22,1.04]){const ring=mesh(new T.TorusGeometry(.44,.035,5,18),M.iron,x,y,z);ring.rotation.x=Math.PI/2;}box(M.oak,x,.44,z+.6,.74,.84,.63);}
  else if(i%3===1){box(M.oak,x,.38,z,.66,.7,.70);for(let j=0;j<3;j++){const a=V(x+j*.14,2.85,z),b=V(x+.22+j*.14,.30,z+.24);beam(a,b,.026,M.oak);const br=mesh(new T.ConeGeometry(.16,.62,7),M.oak,b.x,.42,b.z);br.rotation.z=-.15;}}
  else{const sign=new T.Group();sign.position.set(x,0,z);scene.add(sign);box(M.oak,0,.70,0,.13,1.4,.72,sign);printed('OPEN',-.07,.9,.0,.72,.50,Math.PI/2,sign,'#1a2c28');for(const dz of [-.22,.22])beam(V(0,.06,dz),V(.3,1.23,0),.034,M.oak,sign);}
 }
 // Hanging lanterns sag over the lane and frame, rather than hide, the night sky.
 for(const z of [-12,-60,-101]){const c=lane(z),curve=new T.CatmullRomCurve3([V(c-8,12.8,z),V(c,11.5,z),V(c+8,13.2,z)]);mesh(new T.TubeGeometry(curve,24,.022,4,false),M.iron,0,0,0);for(const x of [-4,0,4])lamp(c+x,11.5+x*x*.02,z);}
 return {windowFace,pitchedRoof,cobbleCount,materials:M};
}
