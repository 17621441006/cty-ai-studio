import {Box3,type Object3D} from 'three';
export type FloorBounds={minX:number;maxX:number;minZ:number;maxZ:number};
/** Keep the whole rotated piece on the floor, including its overhanging parts. */
export function constrainToFloor(object:Object3D,floor:FloorBounds){
 object.updateWorldMatrix(true,true);
 const box=new Box3().setFromObject(object);
 if(box.isEmpty())return;
 const correction=(min:number,max:number,lo:number,hi:number)=>max-min>hi-lo?(lo+hi-min-max)/2:min<lo?lo-min:max>hi?hi-max:0;
 object.position.x+=correction(box.min.x,box.max.x,floor.minX,floor.maxX);
 object.position.z+=correction(box.min.z,box.max.z,floor.minZ,floor.maxZ);
 object.updateWorldMatrix(true,true);
}
