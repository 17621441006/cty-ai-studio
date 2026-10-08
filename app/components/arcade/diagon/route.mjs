import {CatmullRomCurve3,Vector3,MathUtils} from 'three';
export const EYE_HEIGHT=1.68;
export const STOPS=[{u:0,name:'破釜酒吧 · 砖墙之后'},{u:.17,name:'奥利凡德 · 魔杖橱窗'},{u:.285,name:'丽痕书店 · 旧书与星光'},{u:.59,name:'韦斯莱 · 奇妙笑话商店'},{u:1,name:'古灵阁 · 月下广场'}];
// Arc-length sampling keeps both walking speed and the turns smooth.
export function makeRoute(){return new CatmullRomCurve3([[0,13],[0,5],[-.8,-5],[0,-15],[5,-25],[10,-33],[9,-42],[3,-50],[0,-56]].map(([x,z])=>new Vector3(x,EYE_HEIGHT,z)),false,'centripetal');}
export function poseAt(route,u){u=MathUtils.clamp(u,0,1);const position=route.getPointAt(u);const tangent=route.getTangentAt(u).normalize();
 // At the square, settle the gaze on the bank instead of looking past its side wall.
 if(u>.82){const bank=new Vector3(-position.x,0,-72-position.z).normalize();tangent.lerp(bank,MathUtils.smoothstep(u,.82,1)).normalize();}
 return {position,tangent,yaw:Math.atan2(-tangent.x,-tangent.z)};}
export function advanceTour(u,dt,speed,length){return Math.min(1,Math.max(0,u+Math.min(Math.max(dt,0),.05)*speed/length));}
export function stepYaw(current,target,dt){return current+Math.atan2(Math.sin(target-current),Math.cos(target-current))*(1-Math.exp(-5*Math.min(dt,.05)));}
