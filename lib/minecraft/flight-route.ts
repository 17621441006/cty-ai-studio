import * as THREE from 'three';
// Measured against the source's v48 meshes; >13m root clearance on the landmark corridor.
export const flightPoints=[[-851,49,796],[-821,56,765],[-789,71,746],[-757,71,721],[-726,72,696],[-705,75,681],[-690,92,665],[-670,118,647],[-647,135,617],[-610,145,580],[-536,152,556],[-506,153,745],[-650,147,856],[-792,107,868],[-880,67,841]];
export const flightRoute=new THREE.CatmullRomCurve3(flightPoints.map(p=>new THREE.Vector3(...p as [number,number,number])),true,'centripetal');
export function poseRider(root:THREE.Group){for(const [side,z] of [['left',-.35],['right',.35]] as const){const hip=root.getObjectByName('teacher-hip-'+side),knee=root.getObjectByName('teacher-knee-'+side);if(hip){hip.rotation.x=-1.2;hip.rotation.z=z;}if(knee)knee.rotation.x=1.5;}root.updateMatrixWorld(true);}
