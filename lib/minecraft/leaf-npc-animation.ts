import * as THREE from 'three';
import type {LeafModel} from './types';
import {relaxLegStance} from './character-proportions';

export type TeacherAttention={distance:number;yaw:number;pitch:number;talking:boolean};
type Joint={set:(x:number,y:number,z:number)=>void};
const clamp=THREE.MathUtils.clamp;
const profiles:Record<LeafModel,{phase:number;pace:number;hand:number;open:number}>={
 sakura:{phase:.4,pace:1,hand:.80,open:.16},
 hiashi:{phase:2.7,pace:.72,hand:.52,open:.19},
 hayate:{phase:4.3,pace:.9,hand:.73,open:.12},
 madara:{phase:6.1,pace:.64,hand:.62,open:.26},
 pain:{phase:8.4,pace:.68,hand:.50,open:.12},
};

/** Animate joints, never the complete mesh. Native FBX axes are converted to
 * the same character-space axes as the newly skinned OBJ/GLB models. */
export function createTeacherAnimation(model:THREE.Object3D,key:LeafModel){
 const native=model.userData.teacherRig?.native===true;
 if(model.userData.teacherRig?.version!==1)throw Error('Teaching model needs an articulated rig');
 relaxLegStance(model,key);
 model.updateMatrixWorld(true);
 const rootInverse=model.getWorldQuaternion(new THREE.Quaternion()).invert();
 const nativeNames:Record<string,string>={pelvis:'Hips',spine:'Spine1',chest:'Spine2',head:'Head','shoulder-left':'LeftArm','elbow-left':'LeftForeArm','hand-left':'LeftHand','shoulder-right':'RightArm','elbow-right':'RightForeArm','hand-right':'RightHand'};
 const joints:Record<string,Joint>={};
 for(const name of Object.keys(nativeNames)){
  const bone=model.getObjectByName(native?'Hiashi'+nativeNames[name]:'teacher-'+name);
  if(!bone?.parent)throw Error(`Missing teaching joint: ${key}/${name}`);
  const rest=bone.quaternion.clone(),frame=rootInverse.clone().multiply(bone.parent.getWorldQuaternion(new THREE.Quaternion())),inverse=frame.clone().invert();
  const rotation=new THREE.Quaternion(),angles=new THREE.Euler();
  joints[name]={set(x,y,z){rotation.setFromEuler(angles.set(x,y,z));bone.quaternion.copy(inverse).multiply(rotation).multiply(frame).multiply(rest);}};
 }
 // Conservative bounds include raised hands; no stale bind-pose frustum culling.
 model.traverse(o=>{if(o instanceof THREE.SkinnedMesh){o.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,1.1,0),3);o.frustumCulled=false;}});
 const profile=profiles[key],drop=Number(model.userData.teacherRig.armDrop)||0;
 let last:number|undefined,attention=0,conversation=0,headYaw=0,headPitch=0,near=false,greetAt=-100;
 function update(time:number,target?:TeacherAttention){
  const dt=last===undefined?1/60:clamp(time-last,0,.1);last=time;
  const close=!!target&&target.distance<6,looking=!!target&&target.distance<12;
  if(close&&!near)greetAt=time;near=close;
  const blend=1-Math.exp(-dt*5);
  attention+=((close?1:0)-attention)*blend;
  conversation+=((target?.talking?1:0)-conversation)*blend;
  headYaw+=((looking?clamp(target.yaw,-.55,.55):Math.sin(time*.24+profile.phase)*.08)-headYaw)*blend;
  headPitch+=((looking?clamp(target.pitch,-.20,.22):0)-headPitch)*blend;
  const t=time*profile.pace+profile.phase,breath=Math.sin(t*1.65),weight=Math.sin(t*.63);
  const age=time-greetAt,greeting=age>=0&&age<2.4?Math.pow(Math.sin(Math.PI*age/2.4),2):0;
  // Every gesture has a rest interval. Nearby teachers do not loop a wave at
  // full intensity; an active conversation adds a slower explanatory gesture.
  const beat=(t%9+9)%9,explain=beat<3.8?Math.pow(Math.sin(Math.PI*beat/3.8),2):0;
  const gesture=clamp(greeting*.85+explain*(attention*.22+conversation*.65),0,1);
  joints.pelvis.set(0,0,0); // Keep both feet on their station floor.
  joints.spine.set(.006*breath,.008*weight,.015*weight);
  joints.chest.set(-.005*breath,.018*weight,-.009*weight);
  joints.head.set(headPitch+.012*breath-conversation*.035*explain,headYaw,-.014*weight);
  for(const [side,sign] of [['left',1],['right',-1]] as const){
   const lead=side==='right',secondary=key==='hiashi'?.55:key==='pain'?.38:.10;
   const g=gesture*(lead?1:secondary);
   joints['shoulder-'+side].set(-.035-.25*g,sign*(.025+.10*g),sign*drop-sign*(.012*breath)+sign*profile.open*g);
   joints['elbow-'+side].set(-.14-profile.hand*g,sign*.025,0);
   joints['hand-'+side].set(-.025-.10*g,sign*(.08+.22*g),sign*.08*g);
  }
 }
 update(0); // No single-frame flash of the imported A pose after loading.
 last=undefined;
 return {update};
}
