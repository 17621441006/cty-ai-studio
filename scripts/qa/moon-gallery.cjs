/* Test the real spherical layout, occlusion and navigation math without a browser. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const THREE=require('three'),ts=require('typescript'),root=path.resolve(__dirname,'../..'),cache=new Map();
async function main(){
 const bufferUtils=await import('three/addons/utils/BufferGeometryUtils.js');
 function load(file){
  if(cache.has(file))return cache.get(file);
  if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
  const source=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,m={exports:{}};
  vm.runInNewContext(source,{module:m,exports:m.exports,require:name=>{
   if(name==='three')return THREE;if(name==='three/addons/utils/BufferGeometryUtils.js')return bufferUtils;
   let location=name.startsWith('@/')?name.slice(2):name.startsWith('.')?path.normalize(path.join(path.dirname(file),name)):null;
   if(location)return load(location.endsWith('.json')||location.endsWith('.ts')?location:location+'.ts');return require(name);
  },console,Float32Array,Math,Map,Set});cache.set(file,m.exports);return m.exports;
 }
 const gallery=load('lib/moon-gallery.ts'),model=load('app/components/moon/moon-model.ts'),apps=load('lib/desktop-apps.ts');
 const {moonWorks,moonCategories,getMoonWorks,orbitWorks,moonFramePose,moonCameraDistance,EXHIBITS_PER_ORBIT}=gallery;
 assert.equal(new Set(moonWorks.map(work=>work.id)).size,moonWorks.length);
 const catalogue=apps.catalogueApps.filter(work=>work.id!=='zp-next-ai');assert.equal(moonWorks.length,catalogue.length);
 let largestPage=0;
 for(const category of moonCategories){
  const works=getMoonWorks(category),pages=Math.ceil(works.length/EXHIBITS_PER_ORBIT),found=[];
  for(let i=0;i<pages;i++){
   const page=orbitWorks(works,i);assert.ok(page.length>0&&page.length<=18);found.push(...page.map(work=>work.id));
   const paths=new Set(page.map(work=>work.cover));let bytes=0;
   for(const cover of paths){assert.ok(cover.startsWith('/'));const file=path.join(root,'public',cover);assert.ok(fs.existsSync(file),`missing ${cover}`);bytes+=fs.statSync(file).size;}
   largestPage=Math.max(largestPage,bytes);
  }
  assert.deepEqual(found,Array.from(works,work=>work.id));
 }
 console.log(`PASS: ${moonWorks.length} works, ${moonCategories.length-1} categories, all destinations/assets present; largest orbit ${(largestPage/1024).toFixed(0)} KiB of covers.`);
 const geometry=new THREE.PlaneGeometry(1.78,1.3),material=new THREE.MeshBasicMaterial();let checks=0;
 for(const count of [1,2,3,7,12,16,18])for(const aspect of [.45,.7,1,1.6,2.4,3.3]){
  const camera=new THREE.PerspectiveCamera(42,aspect,.1,200);camera.position.z=moonCameraDistance(aspect);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  for(let i=0;i<count;i++){
   const pose=moonFramePose(i,count),point=new THREE.Vector3(pose.x,pose.y,pose.z);
   const group=new THREE.Group(),frame=new THREE.Mesh(geometry,material);frame.position.copy(point);frame.lookAt(point.clone().multiplyScalar(2));group.add(frame);
   group.rotation.set(pose.latitude,-pose.longitude,0,'XYZ');group.updateMatrixWorld(true);
   const world=frame.getWorldPosition(new THREE.Vector3());assert.ok(Math.hypot(world.x,world.y)<1e-6,'selection did not rotate to front');assert.ok(world.z>5.2);
   for(const x of [-.89,.89])for(const y of [-.65,.65]){const projected=frame.localToWorld(new THREE.Vector3(x,y,0)).project(camera);assert.ok(Math.abs(projected.x)<.99&&Math.abs(projected.y)<.99,'focused frame clipped');}
   const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(0,0),camera);assert.equal(model.pickMoonExhibit(ray,[frame]),frame,'front frame cannot open');
   group.rotation.y+=Math.PI;group.updateMatrixWorld(true);const direction=frame.getWorldPosition(new THREE.Vector3()).sub(camera.position).normalize();ray.set(camera.position,direction);
   if(frame.getWorldPosition(new THREE.Vector3()).z<0)assert.equal(model.pickMoonExhibit(ray,[frame]),undefined,'clicked through the opaque moon');checks++;
  }
 }
 console.log(`PASS: ${checks} phone/desktop spherical poses, focus alignment, frame margins and rear-frame occlusion.`);
 for(const compact of [true,false]){
  const moon=model.createMosaicMoon(compact);let instances=0,triangles=0;
  moon.traverse(mesh=>{if(mesh.isMesh){mesh.geometry.computeBoundingSphere();assert.ok(Number.isFinite(mesh.geometry.boundingSphere.radius));const count=mesh.isInstancedMesh?mesh.count:1;triangles+=(mesh.geometry.index?.count||mesh.geometry.attributes.position.count)/3*count;if(mesh.isInstancedMesh)instances+=count;}});
  assert.ok(instances<(compact?3200:5500));assert.ok(triangles<80000);console.log(`PASS: ${compact?'phone':'desktop'} moon uses ${instances} batched tesserae, ${triangles.toLocaleString()} triangles.`);
 }
 const frame=model.createFrameGeometry();frame.computeBoundingBox();assert.ok(frame.boundingBox.max.x<1.1&&frame.boundingBox.max.y<.9);
 const page=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');assert.match(page,/moonOpen&&<MoonSpace open onChange=\{setMoonOpen\} onOpen=\{open\}/);
 assert.match(page,/const MoonSpace=dynamic/);assert.match(page,/sceneryPaused=moonOpen/);
 console.log('PASS: gallery remains an on-demand module and reuses the desktop open callback/background pause.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
