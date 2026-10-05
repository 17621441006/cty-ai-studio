import * as THREE from 'three';
import type {ShowcaseActor} from './showcase-actors';

type SoleSample={mesh:THREE.Mesh;index:number};
/** Showcase-only scale and foot anchoring; the dragon-flight rider keeps its original rig. */
export function presentHumanoid(actor:ShowcaseActor,type:string):ShowcaseActor{
 if(type!=='pain'&&type!=='kakashi')return actor;
 const root=new THREE.Group();root.name=type+'-showcase';root.add(actor.root);actor.root.scale.multiplyScalar(1.65);
 actor.tick(0,0,0,false);root.updateMatrixWorld(true);
 const point=new THREE.Vector3(),samples:SoleSample[]=[],meshes:THREE.Mesh[]=[];
 root.traverseVisible(o=>{if(o instanceof THREE.Mesh&&o.geometry.attributes.position)meshes.push(o);});
 let min=Infinity,max=-Infinity;
 for(const mesh of meshes){if(mesh instanceof THREE.SkinnedMesh)mesh.skeleton.update();for(let i=0;i<mesh.geometry.attributes.position.count;i++){mesh.getVertexPosition(i,point);point.applyMatrix4(mesh.matrixWorld);min=Math.min(min,point.y);max=Math.max(max,point.y);}}
 // Keep the lowest point in each small sole cell, not thousands of duplicate triangles.
 const soleCells=new Map<string,SoleSample&{y:number}>();
 for(const mesh of meshes)for(let i=0;i<mesh.geometry.attributes.position.count;i++){
  mesh.getVertexPosition(i,point);point.applyMatrix4(mesh.matrixWorld);
  if(point.y>min+(max-min)*.10)continue;
  const key=Math.round(point.x*24)+','+Math.round(point.z*24),old=soleCells.get(key);
  if(!old||point.y<old.y)soleCells.set(key,{mesh,index:i,y:point.y});
 }
 samples.push(...soleCells.values());
 const inverse=new THREE.Matrix4();
 function plant(){
  actor.root.position.y=0;root.updateMatrixWorld(true);inverse.copy(root.matrixWorld).invert();
  for(const mesh of meshes)if(mesh instanceof THREE.SkinnedMesh)mesh.skeleton.update();
  let sole=Infinity;for(const {mesh,index} of samples){mesh.getVertexPosition(index,point);point.applyMatrix4(mesh.matrixWorld).applyMatrix4(inverse);sole=Math.min(sole,point.y);}
  actor.root.position.y=- (Number.isFinite(sole)?sole:min);root.updateMatrixWorld(true);
 }
 const shadowGeometry=new THREE.CircleGeometry(.72,32),shadowMaterial=new THREE.MeshBasicMaterial({color:'#132127',transparent:true,opacity:.19,depthWrite:false});
 const shadow=new THREE.Mesh(shadowGeometry,shadowMaterial);shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;shadow.scale.set(1,.62,1);root.add(shadow);plant();
 root.userData.soleSampleCount=samples.length;
 return {root,tick(dt,time,moving,flying){actor.tick(dt,time,moving,flying);plant();},dispose(){actor.dispose();shadowGeometry.dispose();shadowMaterial.dispose();root.clear();}};
}
export const actorTileY=(type:string,y:number)=>type==='pain'||type==='kakashi'?y-.5:y;
