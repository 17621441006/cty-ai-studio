import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {Progress} from './types';
import {legPose,type CharacterMotion} from './character-motion';

/** Articulated game model: every garment follows its shoulder, elbow, hip or knee. */
export function createKakashi(realistic=false){
 const root=new THREE.Group();root.name='kakashi';
 const pelvis=new THREE.Group();root.add(pelvis);
 const torso=new THREE.Group();torso.position.y=.91;pelvis.add(torso);
 const sphere=new THREE.SphereGeometry(1,20,14),box=new RoundedBoxGeometry(1,1,1,2,.12),cylinder=new THREE.CylinderGeometry(1,1,1,16),cone=new THREE.ConeGeometry(1,1,5);
 const geometries:THREE.BufferGeometry[]=[sphere,box,cylinder,cone],materials=new Map<string,THREE.MeshStandardMaterial>();
 const cloth='#202b3c',vest='#65785a',edge='#889675',skin='#dab994',silver='#c8d4df',dark='#131e2b';
 function mat(color:string,metal=false,lit=false){const id=color+metal+lit;if(!materials.has(id))materials.set(id,new THREE.MeshStandardMaterial({color,roughness:metal?.3:realistic?.72:.85,metalness:metal?.72:0,emissive:lit?color:'#000000',emissiveIntensity:lit?2:0}));return materials.get(id)!;}
 function mesh(parent:THREE.Object3D,g:THREE.BufferGeometry,p:number[],s:number[],color:string,metal=false){const m=new THREE.Mesh(g,mat(color,metal));m.position.set(p[0],p[1],p[2]);m.scale.set(s[0],s[1],s[2]);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const oval=(p:THREE.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,c:string)=>mesh(p,sphere,[x,y,z],[w,h,d],c);
 const panel=(p:THREE.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,c:string,metal=false)=>mesh(p,box,[x,y,z],[w,h,d],c,metal);
 function joint(parent:THREE.Object3D,name:string,x:number,y:number,z:number){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;}
 // Fitted flak jacket with a tapered waist, padded collar and six separate pockets.
 oval(torso,0,.24,0,.285,.32,.155,cloth);
 const profile=[[.22,-.015],[.27,.06],[.285,.28],[.32,.43],[.26,.5]].map(([r,y])=>new THREE.Vector2(r,y));
 const jacket=new THREE.LatheGeometry(profile,24);geometries.push(jacket);mesh(torso,jacket,[0,.04,0],[1,1,.65],vest);
 panel(torso,0,.245,.182,.025,.47,.032,'#c5bf9d',true);
 for(const side of [-1,1]){
  const collar=panel(torso,side*.19,.56,-.015,.13,.27,.32,edge);collar.rotation.z=side*.23;
  for(let i=0;i<3;i++){panel(torso,side*(.073+i*.074),.26,.195,.063,.24,.055,vest);panel(torso,side*(.073+i*.074),.38,.225,.061,.035,.025,edge);}
  panel(torso,side*.265,.17,.045,.035,.38,.24,edge);
 }
 panel(torso,0,.03,0,.55,.13,.34,vest);panel(torso,0,-.025,.135,.48,.055,.06,dark);
 oval(torso,.22,-.02,-.2,.13,.14,.07,'#a79b7e');panel(torso,.22,.06,-.25,.18,.05,.04,'#d2c4a6');
 // Head and exposed eye: left eye stays hidden under the tilted metal forehead protector.
 const head=joint(torso,'head',0,.75,.005);
 oval(head,0,.045,0,.205,.255,.175,skin);oval(head,-.204,.025,0,.038,.072,.041,skin);oval(head,.204,.025,0,.038,.072,.041,skin);
 oval(head,0,-.065,.086,.196,.155,.117,dark);
 panel(head,0,-.028,.195,.28,.012,.01,'#364354');
 const protector=joint(head,'forehead-protector',0,.147,.02);protector.rotation.z=-.17;
 panel(protector,0,0,0,.438,.13,.34,cloth);panel(protector,.002,-.006,.179,.302,.105,.025,silver,true);
 for(const x of [-.125,.125])for(const y of [-.03,.025])oval(protector,x,y,.198,.009,.009,.004,'#778894');
 // Engraved spiral emblem, shared shaded geometry rather than an image decal.
 const curve=new THREE.CatmullRomCurve3(Array.from({length:25},(_,i)=>{const a=i/24*Math.PI*3,r=.007+i/24*.029;return new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,.201);}));
 const emblem=new THREE.TubeGeometry(curve,28,.0035,5,false);geometries.push(emblem);mesh(protector,emblem,[0,0,0],[1,1,1],'#566575');
 const covered=panel(head,.1,.062,.183,.20,.12,.028,cloth);covered.rotation.z=-.2;
 oval(head,-.095,.062,.165,.061,.018,.017,'#eee7dc');oval(head,-.091,.062,.181,.014,.017,.009,'#27313c');
 const brow=panel(head,-.103,.096,.173,.109,.018,.02,'#707d89');brow.rotation.z=.08;
 // Swept, asymmetrical silver hair: broad locks, smaller fringe and a darker root cap.
 oval(head,0,.20,-.024,.22,.15,.183,'#929fac');
 function lock(x:number,y:number,z:number,dx:number,dy:number,dz:number,r:number,color:string){const v=new THREE.Vector3(dx,dy,dz);const m=mesh(head,cone,[x+dx/2,y+dy/2,z+dz/2],[r,v.length(),r*.58],color);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());}
 for(let layer=0;layer<3;layer++)for(let i=0;i<7;i++){const a=(i/6-.5)*2.7;const x=Math.sin(a)*.17,z=-.01-Math.cos(a)*(.025+layer*.07);lock(x,.22+layer*.012,z,.12+Math.sin(a)*.17,.21+(i%3)*.045,layer===0?.015:-.08,.071+(i%2)*.012,i%3===0?'#a5b3c1':silver);}
 for(let i=0;i<5;i++)lock(-.16+i*.075,.23,.125,.06,-.09-(i%2)*.035,.065,.042,'#d7dfe6');
 const ties=[joint(head,'headband-tail-left',.05,.13,-.16),joint(head,'headband-tail-right',.12,.13,-.16)];
 ties.forEach((g,i)=>{panel(g,0,-.07,-.14,.06,.025,.30,cloth).rotation.x=-.3-i*.2;});
 // Jointed arms, with connected gloves and visible fingers.
 const arms=[-1,1].map(side=>{
  const upper=joint(torso,side<0?'shoulder-left':'shoulder-right',side*.315,.46,0);
  oval(upper,0,-.08,0,.105,.16,.105,cloth);oval(upper,0,-.22,0,.08,.12,.08,cloth);
  const patch=mesh(upper,cylinder,[side*.093,-.08,0],[.057,.013,.057],'#943e41');patch.rotation.z=Math.PI/2;
  const elbow=joint(upper,side<0?'elbow-left':'elbow-right',0,-.30,0);oval(elbow,0,-.015,0,.077,.08,.077,cloth);
  oval(elbow,0,-.145,0,.075,.15,.075,cloth);panel(elbow,0,-.23,0,.15,.055,.15,'#71808b');
  const hand=joint(elbow,side<0?'hand-left':'hand-right',0,-.305,0);oval(hand,0,0,.012,.073,.087,.044,skin);panel(hand,0,.02,-.035,.13,.11,.035,cloth);panel(hand,0,.02,-.057,.075,.055,.013,silver,true);
  for(let i=0;i<4;i++)oval(hand,-.042+i*.028,-.064,.017,.012,.034,.027,skin);
  return {upper,elbow,hand};
 });
 const legs=[-1,1].map(side=>{
  const hip=joint(pelvis,side<0?'hip-left':'hip-right',side*.13,.9,0);
  oval(hip,0,-.19,0,.13,.24,.125,cloth);const knee=joint(hip,side<0?'knee-left':'knee-right',0,-.42,0);oval(knee,0,0,0,.095,.10,.102,cloth);oval(knee,0,-.16,0,.084,.20,.085,cloth);
  for(let i=0;i<6;i++)mesh(knee,cylinder,[0,-.20-i*.025,0],[.087,.02,.089],i%2?'#c8d0cd':'#e3e7dd');
  const foot=joint(knee,side<0?'ankle-left':'ankle-right',0,-.40,0);panel(foot,0,-.034,.055,.19,.085,.32,dark);oval(foot,0,.014,.142,.084,.04,.065,skin);panel(foot,0,.035,.057,.18,.065,.13,cloth);
  for(let i=0;i<4;i++)oval(foot,-.052+i*.034,.008,.19,.018,.025,.025,skin);
  if(side===1){for(const y of [-.18,-.23])mesh(hip,cylinder,[0,y,0],[.133,.035,.13],'#c6cec8');panel(hip,.11,-.25,-.025,.09,.18,.12,'#687466');}
  return {hip,knee,foot};
 });
 const outfit=joint(torso,'equipment',0,0,0),handOutfit=joint(arms[1].hand,'equipped-hand',0,0,0);let cape:THREE.Group|undefined,wings:THREE.Group[]=[];
 function setEquipment(e:Progress['equipment']){
  outfit.clear();handOutfit.clear();cape=undefined;wings=[];
  if(e.head){panel(outfit,0,1.035,0,.46,.055,.39,e.head==='sun-crown'?'#d9bc65':'#6b985e');if(e.head==='wizard-hat')mesh(outfit,cone,[0,1.22,0],[.25,.4,.25],'#776292');}
  if(e.back==='forest-cape'){cape=joint(outfit,'cape',0,.47,-.2);panel(cape,0,-.33,-.02,.53,.68,.035,'#39766f');panel(cape,0,-.66,-.02,.54,.035,.04,'#cfb572');}
  if(e.back==='crystal-wings')for(const side of [-1,1]){const wing=joint(outfit,'wing',side*.12,.36,-.2);for(let i=0;i<4;i++){const feather=panel(wing,side*(.15+i*.13),.03-i*.06,0,.14,.48-i*.06,.045,'#94e4ed');feather.rotation.z=-side*.4;}wings.push(wing);}
  if(e.body)for(const side of [-1,1])panel(outfit,side*.23,.3,.18,.10,.25,.025,'#a2b6bc');
  if(e.hand){panel(handOutfit,0,0,.21,.04,.04,.55,'#6c5944');if(e.hand==='iron-pickaxe')panel(handOutfit,0,0,.46,.42,.055,.075,silver,true);else if(e.hand==='iron-shovel')panel(handOutfit,0,0,.46,.18,.04,.22,silver,true);else if(e.hand==='crystal-sword')panel(handOutfit,0,0,.49,.06,.035,.58,'#91e4f0',true);else panel(handOutfit,0,0,.1,.3,.38,.05,'#728986');}
 }
 let lastTime:number|undefined,phase=0,speed=0,landing=0,wasGrounded=true,swingAt=-100,air=0;
 const smooth=(a:number,b:number,dt:number,rate=14)=>THREE.MathUtils.lerp(a,b,1-Math.exp(-dt*rate));
 function animate(time:number,moving:number,swing=false,flying=false,motion:CharacterMotion={}){
  const dt=lastTime===undefined?1/60:Math.min(.05,Math.max(0,time-lastTime));lastTime=time;
  const grounded=motion.grounded??!flying,vertical=motion.verticalSpeed??0;
  speed=smooth(speed,motion.speed??moving*4.8,dt,9);const sprint=THREE.MathUtils.smoothstep(speed,5.4,8.8),run=Math.min(1,speed/9.4),blend=Math.min(1,speed/1.6);
  air=smooth(air,grounded?0:1,dt,18);
  // Continuous phase: changing speed changes cadence, never the current pose.
  phase+=dt*((1.25+run*1.1)*blend+air*(1-blend)*.85)*Math.PI*2;
  if(grounded&&!wasGrounded)landing=.10;wasGrounded=grounded;landing*=Math.exp(-dt*12);
  const charge=(motion.jumpCharge||0)*.10,crouch=landing+charge;
  const settle=-.018-sprint*.026;
  pelvis.position.y=(settle+blend*Math.cos(phase*2)*(.016-sprint*.007))*(1-air)-crouch;
  // Move the centre of mass with the stride. A deep bend at the waist leaves
  // the hips behind the planted feet and reads as a crouch rather than a run.
  pelvis.position.z=smooth(pelvis.position.z,sprint*.095*(1-air),dt,10);
  pelvis.rotation.y=Math.sin(phase)*blend*.025;
  torso.rotation.x=smooth(torso.rotation.x,motion.swimming?.65:blend*(.035+sprint*.145)*(1-air*.3)+air*.08,dt);
  torso.rotation.y=smooth(torso.rotation.y,Math.sin(phase)*blend*(.055-sprint*.02),dt);
  torso.rotation.z=smooth(torso.rotation.z,-(motion.turn||0)*.018+Math.sin(phase)*blend*(.026-sprint*.014),dt);
  head.rotation.y=-torso.rotation.y*.65;head.rotation.x=-torso.rotation.x*.65;
  torso.position.y=.91+Math.sin(time*2.4)*.004*(1-blend);
  const footTravel:number[]=[];
  legs.forEach((leg,i)=>{
   const t=((phase/(Math.PI*2)+i*.5)%1+1)%1,contact=.62-run*.13,stance=t<contact;
   const stride=(.19+run*.18)*blend,u=stance?t/contact:(t-contact)/(1-contact);
   const z=(stance?stride*(1-2*u):stride*(-Math.cos(u*Math.PI)))-pelvis.position.z;
   footTravel[i]=stride>0?z/stride:0;
   const lift=stance?0:Math.sin(u*Math.PI)**2*(.075+run*.14)*blend;
   // Keep the sole on the ground during stance, within the two-bone reach.
   // The previous fixed-height target exceeded the leg length at every big step.
   const floorY=.077-(.9+pelvis.position.y),reach=Math.sqrt(Math.max(.01,.816**2-z*z));
   const pose=legPose(Math.max(-reach,floorY+lift),z);
   const airSwing=Math.sin(phase+i*Math.PI),airHip=airSwing*(.46+run*.28)-(vertical>0?.10:0),airKnee=.16+Math.max(0,-airSwing)*.68;
   leg.hip.rotation.x=smooth(leg.hip.rotation.x,pose.hip*(1-air)+airHip*air,dt,32);
   leg.knee.rotation.x=smooth(leg.knee.rotation.x,pose.knee*(1-air)+airKnee*air,dt,32);
   leg.foot.rotation.x=smooth(leg.foot.rotation.x,(pose.ankle+(stance?0:-Math.sin(u*Math.PI)*.18))*(1-air)+(-airHip*.4-airKnee*.55)*air,dt,32);
  });
  if(swing)swingAt=time;
  const attack=motion.ability&&(motion.abilityAge??100)>=0&&((motion.abilityAge??100)<(motion.ability==='k'?2.1:motion.ability==='j'?.7:.26));
  arms.forEach((arm,i)=>{
   // Walk with contralateral arm swing, then blend into the open ninja trail.
   const side=i?1:-1,ninja=sprint,swingPhase=Math.sin(phase+i*Math.PI);
   let shoulder=blend*(footTravel[i]*.68*(1-ninja)+ninja*(.55+run*.13+swingPhase*.13));
   let elbow=-.10-blend*(.14+.10*Math.max(0,-footTravel[i]))*(1-ninja)-ninja*(.18+Math.max(0,swingPhase)*.10)-air*.025;
   shoulder=shoulder*(1-air*.15)+swingPhase*air*.085;
   let roll=side*(.055+blend*(.045+ninja*.075)+air*.025);
   arm.hand.rotation.x=smooth(arm.hand.rotation.x,-blend*ninja*.13,dt);
   arm.hand.rotation.z=smooth(arm.hand.rotation.z,side*blend*.05,dt);
   if(motion.swimming){shoulder=Math.sin(phase+i*Math.PI)*1.1-1.1;elbow=-.5;}
   if(motion.technique==='z'&&(motion.techniqueAge??100)<.9){shoulder=-.65;elbow=-1.55;roll=-side*.26;}
   else if(attack){if(motion.ability==='k'){shoulder=i?-2.45:-.65;elbow=-.7;roll=i?-.2:.3;}else{shoulder=i?-1.1:.25;elbow=i?-.45:-1.2;roll=i?-.12:.35;}}
   else if(i===1&&time-swingAt<.28){shoulder=-Math.sin((time-swingAt)/.28*Math.PI)*1.35;elbow=-.5;}
   if(motion.grappling){shoulder=i?-1.3:-.7;elbow=i?-.2:-.65;roll=side*.12;}
   arm.upper.rotation.x=smooth(arm.upper.rotation.x,shoulder,dt,20);arm.elbow.rotation.x=smooth(arm.elbow.rotation.x,elbow,dt,20);arm.upper.rotation.z=smooth(arm.upper.rotation.z,roll,dt);
  });
  // Keep held blades/tools trailing with the hand instead of pointing into the legs.
  const weaponTrail=blend*sprint*(!attack&&time-swingAt>.35?1:0);
  handOutfit.rotation.x=smooth(handOutfit.rotation.x,weaponTrail*(Math.PI+.12-torso.rotation.x-arms[1].upper.rotation.x-arms[1].elbow.rotation.x-arms[1].hand.rotation.x),dt,12);
  ties.forEach((g,i)=>{g.rotation.x=-.13-run*.6+Math.sin(time*8+i)*(.025+run*.06);g.rotation.y=Math.sin(time*5+i)*.09;});
  if(cape)cape.rotation.x=-run*.4-Math.sin(time*5)*.04;
  wings.forEach((w,i)=>w.rotation.y=(i?1:-1)*(flying?.4+Math.sin(time*7)*.3:.9));
 }
 animate(0,0);
 return {root,height:2.25,setEquipment,animate,castOrigin:()=>{root.updateWorldMatrix(true,true);return arms[1].hand.getWorldPosition(new THREE.Vector3());},dispose:()=>{geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
