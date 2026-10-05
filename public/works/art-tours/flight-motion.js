// Speed is governed by the upcoming view direction, so a fast straight never
// forces the camera to whip around when it reaches a narrow street corner.
export function createMotionProfile(THREE,path,routeAt,length){
 const step=.75,count=Math.ceil(length/step),angles=[],pitches=[],limit=[];
 const pointAt=s=>{const p=path.getPointAt(Math.min(s/length,1));if(s>length)p.addScaledVector(path.getTangentAt(1),s-length);return p;};
 for(let i=0;i<=count;i++){const s=Math.min(i*step,length),p=pointAt(s),f=pointAt(s+12);angles.push(Math.atan2(f.x-p.x,f.z-p.z));pitches.push(Math.atan2(f.y-p.y,Math.hypot(f.x-p.x,f.z-p.z)));}
 for(let i=0;i<=count;i++){
  let curvature=0,pitchCurve=0;for(let k=Math.max(0,i-3);k<Math.min(count,i+3);k++){const delta=Math.atan2(Math.sin(angles[k+1]-angles[k]),Math.cos(angles[k+1]-angles[k]));curvature=Math.max(curvature,Math.abs(delta)/step);pitchCurve=Math.max(pitchCurve,Math.abs(pitches[k+1]-pitches[k])/step);}
  limit.push(Math.min(65,.29/Math.max(curvature,.0001),.105/Math.max(pitchCurve,.0001)));
 }
 return {limit,step, safeSpeed(time){
  const u=routeAt(time),s=u*length,lo=Math.max(0,time-.1),hi=Math.min(360,time+.1),base=Math.max(.01,(routeAt(hi)-routeAt(lo))*length/(hi-lo||.1));
  let safe=65;for(const d of [0,2,5,9,15,24,36,52,72,96,128]){const i=Math.min(count,Math.round((s+d)/step));safe=Math.min(safe,Math.sqrt(limit[i]*limit[i]+2*4.2*d));}
  return Math.max(.5,safe/base);
 }};
}
