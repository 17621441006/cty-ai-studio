import * as THREE from 'three';
// Measured against the source's v48 meshes; >13m root clearance on the landmark corridor.
export const flightPoints=[[-851,49,796],[-821,56,765],[-789,71,746],[-757,71,721],[-726,72,696],[-705,75,681],[-690,92,665],[-670,118,647],[-647,135,617],[-610,145,580],[-536,152,556],[-506,153,745],[-650,147,856],[-792,107,868],[-880,67,841]];
export const flightRoute=new THREE.CatmullRomCurve3(flightPoints.map(p=>new THREE.Vector3(...p as [number,number,number])),true,'centripetal');
export type FlightView='follow'|'side'|'rider';
export function createFlightFrame(){return {center:new THREE.Vector3(),forward:new THREE.Vector3(),heading:new THREE.Vector3(),right:new THREE.Vector3(),eye:new THREE.Vector3(),look:new THREE.Vector3()};}
const up=new THREE.Vector3(0,1,0);
/** A climbing tangent is aircraft pitch, never the camera's viewing direction. */
export function sampleFlightFrame(distance:number,view:FlightView,frame:ReturnType<typeof createFlightFrame>,aspect=1){
 const {center,forward,heading,right,eye,look}=frame;
 flightRoute.getPointAt(((distance%1)+1)%1,center);
 flightRoute.getTangentAt(((distance%1)+1)%1,forward).normalize();
 heading.copy(forward).setY(0).normalize();right.crossVectors(up,heading).normalize();
 const fit=aspect<.85?1.16:1;
 if(view==='rider'){
  eye.copy(center).addScaledVector(up,3.6).addScaledVector(heading,1);
  // Look into the village, including on the outer turn. No upward-facing or
  // off-map sightline, even while the dragon climbs past the Hokage cliffs.
  look.copy(center).addScaledVector(heading,85);
  look.x=THREE.MathUtils.clamp(look.x,-885,-505);
  look.z=THREE.MathUtils.clamp(look.z,550,842);
  look.y=Math.min(36,center.y-20);
 }else if(view==='side'){
  eye.copy(center).addScaledVector(right,20*fit).addScaledVector(heading,-5).addScaledVector(up,10*fit);
  look.copy(center).addScaledVector(heading,3).addScaledVector(up,-4);
 }else{
  eye.copy(center).addScaledVector(heading,-18*fit).addScaledVector(right,5).addScaledVector(up,10*fit);
  look.copy(center).addScaledVector(heading,7).addScaledVector(up,-4);
 }
 return frame;
}
export function poseRider(root:THREE.Group){for(const [side,z] of [['left',-.35],['right',.35]] as const){const hip=root.getObjectByName('teacher-hip-'+side),knee=root.getObjectByName('teacher-knee-'+side);if(hip){hip.rotation.x=-1.2;hip.rotation.z=z;}if(knee)knee.rotation.x=1.5;}root.updateMatrixWorld(true);}
