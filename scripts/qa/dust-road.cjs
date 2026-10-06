/* Asset equivalence, full flight-loop visibility and compact timer interactions. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),zlib=require('node:zlib');
const THREE=require('three'),ts=require('typescript'),root=path.resolve(__dirname,'../..');
const compile=file=>ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function load(file,requireOverride=require){const m={exports:{}};vm.runInNewContext(compile(file),{module:m,exports:m.exports,require:requireOverride,TextDecoder,DataView,Uint8Array,Uint16Array,Uint32Array,Int8Array,Float32Array,console,DOMException});return m.exports;}
const ab=buffer=>buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength);
const read=filename=>fs.readFileSync(path.join(root,filename));
const inflate=filename=>zlib.gunzipSync(read(filename));
const {decodePackedModel}=load('lib/minecraft/packed-model.ts');
const original=JSON.parse(inflate('public/works/minecraft/models/kakashi/kakashi.json.gz'));
const oldModel=new THREE.ObjectLoader().parse(original);
const packed=decodePackedModel(ab(inflate('public/works/minecraft/models/kakashi/kakashi-flight-v32.bin.gz')));
const before=new Map(),after=new Map();oldModel.traverse(o=>before.set(o.uuid,o));packed.traverse(o=>after.set(o.uuid,o));
assert.equal(after.size,before.size);
for(const [id,a] of before){
 const b=after.get(id);assert.ok(b);assert.deepEqual(b.matrix.toArray(),a.matrix.toArray());
 if(a.isMesh){
  const ai=a.geometry.index.array,bi=b.geometry.index.array;assert.equal(ai.length,bi.length);
  for(const key of Object.keys(a.geometry.attributes)){
   const av=a.geometry.attributes[key],bv=b.geometry.attributes[key];
   for(let i=0;i<ai.length;i++)for(let k=0;k<av.itemSize;k++)assert.equal(bv.array[bi[i]*bv.itemSize+k],av.array[ai[i]*av.itemSize+k],`changed ${key} on ${id}`);
  }
  if(a.isSkinnedMesh){assert.deepEqual(b.skeleton.bones.map(b=>b.uuid),a.skeleton.bones.map(b=>b.uuid));assert.deepEqual(b.bindMatrix.toArray(),a.bindMatrix.toArray());}
 }
}
console.log('PASS: Kakashi indexed positions, normals, UVs, skin weights, bones and bind poses are identical.');
const oldData=JSON.parse(read('lib/minecraft/village-data.json')),newData=JSON.parse(read('lib/minecraft/village-flight-data.json'));
const {decodeVillageDistance}=load('lib/minecraft/village-codec.ts');
const WIDTH=512,heights=new Float32Array(WIDTH*WIDTH).fill(-8);
let oldBytes=0,newBytes=0,oldVertices=0,newVertices=0;
for(let t=0;t<oldData.tiles.length;t++){
 const previous=oldData.tiles[t],next=newData.tiles[t];
 const oldRaw=inflate('public/works/minecraft'+previous.url),encoded=inflate('public/works/minecraft'+next.url),count=encoded.readUInt32LE(4),raw=Buffer.alloc(count*14);
 for(let lane=0;lane<14;lane++)for(let i=0;i<count;i++)raw[i*14+lane]=encoded[8+lane*count+i];
 const crypto=require('node:crypto');assert.equal(crypto.createHash('sha256').update(encoded).digest('hex'),next.sha256);
 for(let g=0;g<previous.groups.length;g++){
  const a=previous.groups[g],b=next.groups[g];assert.equal(a.id,b.id);
  if(a.id===251)assert.ok(oldRaw.subarray(8+a.start*14,8+(a.start+a.count)*14).equals(raw.subarray(b.start*14,(b.start+b.count)*14)),'textured landmark faces changed');
  else{
   // Compare every unit square of each plane, including orientation. Merging
   // must not leave holes, overlaps, missing water or changed terrain edges.
   const faces=(buffer,base,group)=>{
    const result=new Set();
    for(let i=group.start;i<group.start+group.count;i+=4){
     const off=base+i*14,n=[0,1,2].map(k=>buffer.readInt8(off+6+k)),axis=n.findIndex(v=>v),axes=[0,1,2].filter(k=>k!==axis),u=axes[0],v=axes[1];
     const lo=[0,1,2].map(k=>Math.min(...[0,1,2,3].map(c=>buffer.readUInt16LE(off+c*14+k*2)))),hi=[0,1,2].map(k=>Math.max(...[0,1,2,3].map(c=>buffer.readUInt16LE(off+c*14+k*2))));
     for(let x=lo[u];x<hi[u];x++)for(let y=lo[v];y<hi[v];y++){const key=`${axis}:${n[axis]}:${lo[axis]}:${x}:${y}`;assert.ok(!result.has(key),'duplicate flat face');result.add(key);}
    }return result;
   };
   const aFaces=faces(oldRaw,8,a),bFaces=faces(raw,0,b);assert.equal(bFaces.size,aFaces.size);for(const key of aFaces)assert.ok(bFaces.has(key),'missing flat surface');
  }
 }
 const geo=decodeVillageDistance(ab(encoded)),position=geo.attributes.position.array,normal=geo.attributes.normal.array;
 assert.ok(Number.isFinite(geo.boundingSphere.radius));
 for(let i=0;i<position.length/3;i+=4){
  if(normal[i*3+1]!==127)continue;
  const xs=[0,1,2,3].map(c=>position[(i+c)*3]),zs=[0,1,2,3].map(c=>position[(i+c)*3+2]),height=position[i*3+1]+newData.origin[1];
  for(let z=Math.min(...zs);z<Math.max(...zs);z++)for(let x=Math.min(...xs);x<Math.max(...xs);x++)heights[z*WIDTH+x]=Math.max(heights[z*WIDTH+x],height);
 }
 geo.dispose();oldBytes+=previous.bytes;newBytes+=next.bytes;oldVertices+=previous.vertices;newVertices+=next.vertices;
}
assert.ok(newVertices<oldVertices*.5);assert.ok(newBytes<oldBytes*.4);
console.log(`PASS: all village surfaces preserved; ${oldVertices.toLocaleString()} -> ${newVertices.toLocaleString()} vertices; ${(newBytes/1048576).toFixed(2)} MiB geometry.`);
const {createFlightFrame,sampleFlightFrame}=load('lib/minecraft/flight-route.ts');
const frame=createFlightFrame(),camera=new THREE.PerspectiveCamera(51,1,.15,1400),ray=new THREE.Vector3(),point=new THREE.Vector3();
function terrainInView(y){
 ray.set(0,y,.5).unproject(camera).sub(camera.position).normalize();
 for(let distance=1;distance<1000;distance+=1.5){
  point.copy(camera.position).addScaledVector(ray,distance);const x=Math.floor(point.x-newData.origin[0]),z=Math.floor(point.z-newData.origin[2]);
  if(x<0||z<0||x>=WIDTH||z>=WIDTH)continue;
  if(point.y<=heights[z*WIDTH+x])return true;
 }return false;
}
let samples=0;const failures=[],clearance={follow:Infinity,side:Infinity,rider:Infinity};
for(const aspect of [.7,393/455,1,16/9])for(const view of ['follow','side','rider'])for(let i=0;i<=640;i++){
 sampleFlightFrame(i/320,view,frame,aspect); // two complete closed loops
 const ex=Math.floor(frame.eye.x-newData.origin[0]),ez=Math.floor(frame.eye.z-newData.origin[2]);if(ex>=0&&ez>=0&&ex<WIDTH&&ez<WIDTH)clearance[view]=Math.min(clearance[view],frame.eye.y-heights[ez*WIDTH+ex]);
 assert.ok(frame.look.y<frame.eye.y-10,'camera looks up');
 assert.ok(frame.center.y>40&&frame.center.y<160,'flight escaped altitude corridor');
 for(const vector of Object.values(frame))assert.ok(vector.toArray().every(Number.isFinite));
 camera.aspect=aspect;camera.updateProjectionMatrix();camera.position.copy(frame.eye);camera.lookAt(frame.look);camera.updateMatrixWorld(true);
 if(!terrainInView(0)&&!terrainInView(-.55)&&!terrainInView(-.85))failures.push({view,aspect,second:i/2});
 samples++;
}
assert.deepEqual(failures,[],'camera lost the village');for(const height of Object.values(clearance))assert.ok(height>10,'camera clipped terrain');
const a=createFlightFrame(),b=createFlightFrame();sampleFlightFrame(0,'rider',a);sampleFlightFrame(1,'rider',b);assert.ok(a.eye.distanceTo(b.eye)<1e-8);assert.ok(a.look.distanceTo(b.look)<1e-8);
console.log(`PASS: ${samples} camera samples across mobile/desktop, all 3 views, 2 full laps; terrain stays visible and loop seam is continuous.`);
let slots=[],cursor=0;
const react={useState:init=>{const id=cursor++;if(!slots[id])slots[id]={value:typeof init==='function'?init():init};return [slots[id].value,v=>slots[id].value=typeof v==='function'?v(slots[id].value):v]},useId:()=> 'focus-settings',useEffect(){}};
const jsx={jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
const Focus=load('app/components/worlds/FlightFocus.tsx',name=>name==='react'?react:name.includes('jsx-runtime')?jsx:name.includes('AnimationScope')?{useWindowVisible:()=>true}:new Proxy({},{get:(_,key)=>key})).default;
const render=()=>{cursor=0;return Focus({active:true})};
function find(node,predicate){if(!node||typeof node!=='object')return null;if(predicate(node))return node;for(const child of [node.props?.children].flat(2)){const result=find(child,predicate);if(result)return result;}return null;}
let tree=render();assert.equal(find(tree,n=>n.props?.className==='flight-focus-settings'),null);
find(tree,n=>n.props?.['aria-label']==='展开计时设置').props.onClick();tree=render();assert.ok(find(tree,n=>n.props?.className==='flight-focus-settings'));
find(tree,n=>n.props?.className==='flight-focus-start').props.onClick();tree=render();assert.equal(find(tree,n=>n.props?.className==='flight-focus-settings'),null);assert.ok(find(tree,n=>n.props?.['aria-label']==='暂停专注'));
console.log('PASS: compact by default, settings expand, starting focus collapses the panel and exposes pause.');
