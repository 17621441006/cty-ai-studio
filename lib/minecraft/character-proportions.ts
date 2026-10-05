import * as THREE from 'three';
import type {LeafModel} from './types';

/** Art direction per character, relative to the imported 2.15-unit models. */
export const teacherProportions:Record<LeafModel,{scale:[number,number,number];stance:number}>={
 sakura:{scale:[.83,.88,.87],stance:.13},
 hayate:{scale:[.94,.97,.95],stance:.15},
 hiashi:{scale:[1.01,1.02,1],stance:.16},
 madara:{scale:[1.07,1.04,1.04],stance:.16},
 pain:{scale:[1,1,1],stance:.15},
};

export function applyTeacherProportions(model:THREE.Object3D,key:LeafModel){
 if(model.userData.teacherProportions)return;
 const scale=teacherProportions[key].scale;model.scale.multiply(new THREE.Vector3(...scale));model.position.y*=scale[1];model.userData.eyeHeight=1.85*scale[1];model.userData.teacherProportions=key;
}

/** Close the imported A-pose at the joints, preserving skin weights and foot tilt.
 * Apply once, before idle/movement animation records its rest transforms. */
export function relaxLegStance(model:THREE.Object3D,key:LeafModel){
 if(model.userData.relaxedLegs)return;
 model.updateMatrixWorld(true);
 const native=!!model.userData.teacherRig?.native;
 const names=(side:string)=>native?['Hiashi'+side+'UpLeg','Hiashi'+side+'Leg','Hiashi'+side+'Foot']:['teacher-hip-'+side.toLowerCase(),'teacher-knee-'+side.toLowerCase(),'teacher-foot-'+side.toLowerCase()];
 const rootQ=model.getWorldQuaternion(new THREE.Quaternion()),rootInverse=rootQ.clone().invert();
 const worldPoint=(bone:THREE.Object3D)=>bone.getWorldPosition(new THREE.Vector3());
 const rotate=(bone:THREE.Object3D,angle:number)=>{
  const parent=bone.parent!.getWorldQuaternion(new THREE.Quaternion()),turn=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),angle);
  bone.quaternion.premultiply(parent.clone().invert().multiply(rootQ).multiply(turn).multiply(rootInverse).multiply(parent));model.updateMatrixWorld(true);
 };
 let lift=0;
 for(const [side,sign] of [['Left',1],['Right',-1]] as const){
  const [hip,knee,foot]=names(side).map(name=>model.getObjectByName(name));if(!hip||!knee||!foot)continue;
  const a=worldPoint(hip),b=worldPoint(knee),c=worldPoint(foot),before=c.y;
  const upper=b.clone().sub(a).applyQuaternion(rootInverse),lower=c.clone().sub(b).applyQuaternion(rootInverse);
  const desiredUpper=sign*.008,desiredLower=sign*(teacherProportions[key].stance-Math.abs(a.clone().sub(model.getWorldPosition(new THREE.Vector3())).applyQuaternion(rootInverse).x)-.008);
  const first=Math.atan2(desiredUpper,-upper.y)-Math.atan2(upper.x,-upper.y);
  const total=Math.atan2(desiredLower,-lower.y)-Math.atan2(lower.x,-lower.y);
  rotate(hip,first);rotate(knee,total-first);rotate(foot,-total);
  lift+=before-worldPoint(foot).y;
 }
 // Closing the legs extends them a few millimetres; keep the soles on the floor.
 model.position.y+=lift/2;model.updateMatrixWorld(true);model.userData.relaxedLegs=true;
}
