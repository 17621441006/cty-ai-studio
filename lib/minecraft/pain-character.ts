import * as THREE from 'three';
import {createKakashi} from './kakashi';
import {loadLeafModel,disposeLeafModel} from './leaf-npc-models';
import {createTeacherAnimation} from './leaf-npc-animation';
import {legPose,type CharacterMotion} from './character-motion';
import type {Progress} from './types';

export function createPainAnimation(model:THREE.Object3D){
 const idle=createTeacherAnimation(model,'pain');
 const bone=(name:string)=>model.getObjectByName('teacher-'+name)!;
 const pelvis=bone('pelvis'),baseY=pelvis.position.y,spine=bone('spine'),chest=bone('chest'),head=bone('head'),drop=-.43;
 const legs=['left','right'].map((side,i)=>{const hip=bone('hip-'+side),foot=bone('foot-'+side);return {hip,foot,sign:i===0?1:-1,restZ:hip.rotation.z,footZ:foot.rotation.z};});
 const lateralTurn=new THREE.Quaternion(),footPoint=new THREE.Vector3();
 let last:number|undefined,phase=0,speed=0,air=0,sprint=0,drape=0,bank=0,swingAt=-100,landing=0,wasGrounded=true;
 function animate(time:number,moving:number,swing=false,flying=false,motion:CharacterMotion={}){
  const dt=last===undefined?1/60:Math.max(0,Math.min(.05,time-last));last=time;const blendRate=1-Math.exp(-dt*12);
  speed+=((motion.speed??moving*4.8)-speed)*blendRate;const grounded=motion.grounded??!flying;air+=((grounded?0:1)-air)*blendRate;
  if(grounded&&!wasGrounded)landing=.08;wasGrounded=grounded;landing*=Math.exp(-dt*11);
  if(swing)swingAt=time;idle.update(time);
  const age=motion.techniqueAge??100,key=motion.technique;
  const duration=key==='v'?2.7:key==='t'?1.25:key==='z'?.9:key==='f'?.7:.6;
  const cast=age>=0&&age<duration?Math.min(1,age/.10)*Math.min(1,(duration-age)/.18):0;
  const attackAge=time-swingAt,melee=attackAge>=0&&attackAge<.42?Math.sin(attackAge/.42*Math.PI):0;
  const active=Math.min(1,speed/1.5),target=(!flying&&!motion.swimming&&!motion.weaponDrawn)?THREE.MathUtils.smoothstep(speed,5.2,9.3):0;
  sprint+=(target-sprint)*(1-Math.exp(-dt*8));
  // Blend the body into a low ninja run; casting takes priority over locomotion.
  const run=sprint*(1-air*.55)*(1-cast)*(1-melee);
  drape+=(run-drape)*(1-Math.exp(-dt*(run>drape?6:4)));
  bank+=((THREE.MathUtils.clamp(motion.turn??0,-3,3)*-.025*run)-bank)*(1-Math.exp(-dt*7));
  phase+=dt*(1.5+run*.55)*Math.PI*2*active;
  const bob=active*(-.025-run*.035+Math.cos(phase*2)*(.014+run*.006))*(1-air)-landing;
  const hipLean=run*.065;
  pelvis.position.y=baseY+bob;pelvis.rotation.x+=hipLean;
  // Spread the lean across the torso and counter-rotate the legs to keep foot plants.
  spine.rotation.x+=run*.085;spine.rotation.z+=bank;
  chest.rotation.x+=active*.025+run*.065;chest.rotation.y+=Math.sin(phase)*active*.055;
  head.rotation.x-=active*.02+run*.16;head.rotation.z-=bank*.65;
  for(const [side,sign] of [['left',1],['right',-1]] as const){
   const legPhase=phase+(sign===1?0:Math.PI),recovery=Math.max(0,Math.cos(legPhase)),travel=-Math.sin(legPhase)*(.28+run*.23)*active,lift=recovery*(.115+run*.15)*active;
   const pose=legPose(-.98+lift-bob+air*.15,travel*(1-air)+air*(sign===1?.1:-.1),.5,.48);
   const amount=Math.max(active,air);bone('hip-'+side).rotation.x=pose.hip*amount-hipLean;bone('knee-'+side).rotation.x=pose.knee*amount;bone('foot-'+side).rotation.x=pose.ankle*amount-run*recovery*.16;
   const coat=model.getObjectByName('teacher-coat-'+side);if(coat){
    const trailing=.59+Math.sin(legPhase)*.055+Math.sin(time*11+sign)*.022;
    coat.rotation.x=THREE.MathUtils.lerp(pose.hip*amount*.35+Math.sin(time*2+sign)*.018,trailing,drape);
    coat.rotation.z=-sign*(active*.035+air*.05+drape*.075);coat.rotation.y=bank*.4;
   }
   const shoulder=bone('shoulder-'+side),elbow=bone('elbow-'+side);shoulder.rotation.x=Math.sin(legPhase)*active*(.10+run*.07)*(1-air)-air*.18;elbow.rotation.x=-.06-active*.025;
   shoulder.rotation.z=sign*(drop+air*.07);
   // Keep both wrists outside the cloak silhouette; a small front bend reads as relaxed.
   elbow.rotation.z=0;
   if(side==='left'){shoulder.rotation.x=-.10+Math.sin(phase)*active*.025;elbow.rotation.x=-.42;}
   shoulder.rotation.x=THREE.MathUtils.lerp(shoulder.rotation.x,.58+Math.sin(legPhase)*.10,run);
   shoulder.rotation.z=THREE.MathUtils.lerp(shoulder.rotation.z,sign*-.28,run);
   elbow.rotation.x=THREE.MathUtils.lerp(elbow.rotation.x,-.25-Math.max(0,Math.sin(legPhase))*.08,run);
  }
  // An imported knee offset should not widen the stance as the knee folds.
  // Correct the hip's lateral angle after the sagittal walk/run solve.
  for(const leg of legs){
   leg.hip.rotation.y=0;leg.hip.rotation.z=leg.restZ;leg.foot.rotation.z=leg.footZ;
   model.updateMatrixWorld(true);leg.foot.getWorldPosition(footPoint);pelvis.worldToLocal(footPoint);footPoint.sub(leg.hip.position);
   const target=leg.sign*.15-leg.hip.position.x,radius=Math.hypot(footPoint.x,footPoint.y);
   if(radius>Math.abs(target)+.01){const y=-Math.sqrt(radius*radius-target*target),angle=Math.atan2(target,-y)-Math.atan2(footPoint.x,-footPoint.y);
    leg.hip.quaternion.premultiply(lateralTurn.setFromAxisAngle(new THREE.Vector3(0,0,1),angle));leg.foot.rotation.z-=angle;
   }
  }
  const coatBack=model.getObjectByName('teacher-coat-back');if(coatBack){coatBack.rotation.x=THREE.MathUtils.lerp(active*.10+air*.12+Math.sin(time*1.6)*.014,.64+Math.sin(time*11)*.025,drape);coatBack.rotation.z=bank*.5;}
  for(const [side,sign] of [['left',1],['right',-1]] as const){
   const arm=bone('shoulder-'+side),elbow=bone('elbow-'+side),hand=bone('hand-'+side),lead=side==='right';
   const both=key==='r'||key==='v'||key==='z',strength=cast*(both||lead?1:.15);
   const reach=key==='z'?-.6:key==='v'?-2.3:key==='r'?-1.25:key==='t'?-.95:key==='f'?-.65:-1.12;
   arm.rotation.x=THREE.MathUtils.lerp(arm.rotation.x,reach,strength);arm.rotation.z=THREE.MathUtils.lerp(arm.rotation.z,sign*(key==='z'?drop*.9:key==='v'?drop*.25:drop*.65),strength);
   elbow.rotation.x=THREE.MathUtils.lerp(elbow.rotation.x,key==='t'?-.25-Math.min(1,age)*.85:key==='z'?-1.5:key==='f'?-1.15:-.18,strength);
   elbow.rotation.z=THREE.MathUtils.lerp(elbow.rotation.z,0,strength);hand.rotation.y=sign*.25*strength;
   if(motion.grappling){arm.rotation.x=lead?-1.3:-.8;elbow.rotation.x=lead?-.18:-.6;arm.rotation.z=sign*-.25;chest.rotation.x+=.07;}
   if(lead&&melee>0&&cast===0){arm.rotation.x-=melee*1.2;elbow.rotation.x-=melee*.35;chest.rotation.y-=melee*.15;}
  }
 }
 animate(0,0);last=undefined;return {animate};
}

export function createPain(realistic=false){
 const root=new THREE.Group();root.name='pain';
 // Retain the established equipment builder and its resource owner. Its body
 // is only a fallback; the supplied textured Pain skin is the displayed hero.
 const equipmentBuilder=createKakashi(realistic);equipmentBuilder.root.visible=false;root.add(equipmentBuilder.root);
 let model:THREE.Object3D|null=null,animation:ReturnType<typeof createPainAnimation>|null=null,disposed=false;
 let worn:Progress['equipment']={};const abort=new AbortController(),outfit=new THREE.Group(),handItems=new THREE.Group();
 function setEquipment(e:Progress['equipment']){worn={...e};equipmentBuilder.setEquipment(e);outfit.clear();handItems.clear();
  const body=equipmentBuilder.root.getObjectByName('equipment'),hand=equipmentBuilder.root.getObjectByName('equipped-hand');
  if(body)for(const child of body.children)outfit.add(child.clone(true));if(hand)for(const child of hand.children)handItems.add(child.clone(true));
 }
 const ready=loadLeafModel('pain',abort.signal).then(candidate=>{
  if(disposed){disposeLeafModel(candidate);return false;}model=candidate;animation=createPainAnimation(model);root.add(model);
  const chest=model.getObjectByName('teacher-chest')!,hand=model.getObjectByName('teacher-hand-right')!;outfit.position.set(0,-.55,0);chest.add(outfit);hand.add(handItems);setEquipment(worn);return true;
 }).catch(error=>{if(!disposed){equipmentBuilder.root.visible=true;console.warn('Pain model unavailable',error);}return false;});
 return {root,ready,height:2.15,setEquipment,castOrigin:()=>{root.updateWorldMatrix(true,true);return model?.getObjectByName('teacher-hand-right')?.getWorldPosition(new THREE.Vector3())||root.localToWorld(new THREE.Vector3(-.35,1.2,.3));},animate:(time:number,moving:number,swing=false,flying=false,motion:CharacterMotion={})=>{if(animation)animation.animate(time,moving,swing,flying,motion);else equipmentBuilder.animate(time,moving,swing,flying,motion);},dispose:()=>{disposed=true;abort.abort();outfit.clear();handItems.clear();if(model)disposeLeafModel(model);equipmentBuilder.dispose();}};
}
