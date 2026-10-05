import type {TrafficState} from './desktop-scenery';
export type TrafficTrick={kind:'shield'|'portal';carId:number;catX:number;direction:1|-1;startX:number;width:number;height:number;speed:number;frontWheel:number;rearWheel:number;elapsed:number;duration:number;entry:number;exit:number;ingest:number};
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const trafficDefenseAt=(index:number)=> (['shield','portal','hop'] as const)[index%3];
/** The visible disc and the front-wheel path share these exact contact points. */
export function shieldGeometry(catX:number,direction:1|-1){
 const tilt=.76,radius=47,cx=catX+43-direction*49,cy=-radius*Math.cos(tilt);
 return {cx,cy,tilt,radius,footX:cx-direction*radius*Math.sin(tilt),tipX:cx+direction*radius*Math.sin(tilt),rise:2*radius*Math.cos(tilt)};
}
export function shieldSequence(t:TrafficTrick){
 const g=shieldGeometry(t.catX,t.direction),front=t.startX+t.width*(t.direction===1?t.frontWheel:1-t.frontWheel);
 const approach=Math.max(0,t.direction*(g.footX-front)/t.speed),ramp=Math.abs(g.tipX-g.footX)/t.speed;
 const velocity=145+t.width*.85,gravity=290,air=(velocity+Math.sqrt(velocity*velocity+2*gravity*g.rise))/gravity;
 return {...g,approach,ramp,velocity,gravity,air,launch:approach+ramp,duration:approach+ramp+air};
}
export function beginTrafficTrick(kind:TrafficTrick['kind'],car:TrafficState,catX:number):TrafficTrick{
 const center=catX+43,entry=center-car.direction*90,exit=center+car.direction*104;
 const rear=car.direction===1?car.x:car.x+car.width,ingest=Math.max(0,car.direction*(entry-rear))/car.speed;
 const t:TrafficTrick={kind,carId:car.id,catX,direction:car.direction,startX:car.x,width:car.width,height:car.height,speed:car.speed,frontWheel:car.frontWheel??.78,rearWheel:car.rearWheel??.20,elapsed:0,entry,exit,ingest,duration:ingest+.76+(car.width+80)/car.speed+.35};
 if(kind==='shield')t.duration=shieldSequence(t).duration;
 return t;
}
/** One clock controls both the vehicle mask and the two separately opened portals. */
export function portalSequence(trick:TrafficTrick){
 const {elapsed:t,ingest,duration}=trick,closeEnd=ingest+.22,exitStart=closeEnd+.24,emergeStart=exitStart+.30;
 const smooth=(v:number)=>{v=clamp(v);return v*v*(3-2*v)};
 const entryOpen=smooth(Math.min(t/.17,(closeEnd-t)/.22));
 const exitOpen=smooth(Math.min((t-exitStart)/.30,(duration-t)/.27));
 return {entryOpen,exitOpen,emergeStart,hidden:t>=ingest&&t<emergeStart};
}
export function sampleTrafficTrick(trick:TrafficTrick){
 const {kind,direction:d,startX,width,speed,elapsed,duration,entry,exit,ingest}=trick,p=clamp(elapsed/duration);
 if(kind==='shield'){
  const s=shieldSequence(trick),time=Math.min(elapsed,duration),wheelbase=width*(trick.frontWheel-trick.rearWheel);
  let frontX=startX+width*(d===1?trick.frontWheel:1-trick.frontWheel)+d*speed*time,frontLift=0,rotation=0;
  if(time>s.approach&&time<=s.launch){
   const u=clamp((time-s.approach)/s.ramp);frontX=s.footX+d*speed*(time-s.approach);frontLift=s.rise*u;
   // The front tyre rolls along the shield; the rear axle follows into the launch.
   rotation=-d*Math.atan2(frontLift,wheelbase);
  }else if(time>s.launch){
   const a=time-s.launch,ap=clamp(a/s.air),launchAngle=Math.atan2(s.rise,wheelbase);
   frontX=s.tipX+d*speed*a;frontLift=Math.max(0,s.rise+s.velocity*a-.5*s.gravity*a*a);
   rotation=-d*launchAngle*Math.pow(1-clamp(ap/.55),2)+d*.15*Math.sin(Math.PI*clamp((ap-.45)/.55));
  }
  // CSS rotates about 50% 100%; solve its translation from the front tyre contact.
  const offset=d*width*(trick.frontWheel-.5),x=frontX-Math.cos(rotation)*offset-width/2,lift=frontLift+Math.sin(rotation)*offset;
  return {x,lift:Math.max(0,lift),angle:rotation*180/Math.PI,clipLeft:0,clipRight:0,p,done:elapsed>=duration,frontX,frontLift};
 }
 const sequence=portalSequence(trick);
 const incoming=elapsed<ingest,x=incoming?startX+d*speed*elapsed:(d===1?exit-width:exit)+d*speed*Math.max(0,elapsed-sequence.emergeStart);
 if(sequence.hidden)return {x,lift:0,angle:0,clipLeft:width,clipRight:0,p,done:false};
 const plane=incoming?entry:exit;
 const left=(incoming&&d===-1)||(!incoming&&d===1)?clamp(plane-x,0,width):0;
 const right=(incoming&&d===1)||(!incoming&&d===-1)?clamp(x+width-plane,0,width):0;
 return {x,lift:0,angle:0,clipLeft:left,clipRight:right,p,done:elapsed>=duration};
}
