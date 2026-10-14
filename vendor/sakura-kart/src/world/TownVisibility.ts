import * as THREE from 'three';
export interface TownPlacement {matrix:THREE.Matrix4;color:THREE.Color;bounds:THREE.Sphere}
/** The cap is by source GLB identity, regardless of paint, scale or shop sign. */
export function visibleTownCopies(placements:TownPlacement[],frustum:THREE.Frustum,eye:THREE.Vector3,limit=5,out:TownPlacement[]=[]):TownPlacement[] {
 out.length=0;
 for(const p of placements)if(frustum.intersectsSphere(p.bounds))out.push(p);
 if(limit<placements.length){
  out.sort((a,b)=>eye.distanceToSquared(a.bounds.center)-eye.distanceToSquared(b.bounds.center));
  out.length=Math.min(out.length,Math.max(0,limit));
 }
 return out;
}
