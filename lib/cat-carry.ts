export type CarryPhase='approach'|'cast'|'reel'|'carry'|'deposit'|'done';
export type CarryPoint={x:number;y:number};
export type CarryTrip={phase:CarryPhase;time:number;approachX:number;targetX:number;source:CarryPoint;destination:CarryPoint;vy:number;bagOffset?:number};
export type CarryFrame={phase:CarryPhase;cat:CarryPoint;direction:number;hand:CarryPoint;bag:CarryPoint;loop:CarryPoint;icon:CarryPoint;iconScale:number;loopSize:number;caught:boolean;done:boolean};
const ease=(p:number)=>{p=Math.max(0,Math.min(1,p));return p*p*(3-2*p)};
const lerp=(a:CarryPoint,b:CarryPoint,p:number)=>({x:a.x+(b.x-a.x)*p,y:a.y+(b.y-a.y)*p});
/** Movement has a speed budget, including when a carry is requested on the other side. */
export function stepCarry(trip:CarryTrip,cat:CarryPoint,direction:number,groundY:number,dt:number):CarryFrame{
 const next={...cat};dt=Math.min(.05,Math.max(0,dt));
 if(next.y<groundY-.1){trip.vy+=1400*dt;next.y=Math.min(groundY,next.y+trip.vy*dt);}
 else{
  next.y=groundY;trip.vy=0;
  if(trip.phase==='approach'||trip.phase==='carry'){
   const goal=trip.phase==='approach'?trip.approachX:trip.targetX,dx=goal-next.x;
   if(Math.abs(dx)>.1)direction=Math.sign(dx);next.x+=Math.sign(dx)*Math.min(Math.abs(dx),dt*58);
   if(Math.abs(goal-next.x)<.1){trip.phase=trip.phase==='approach'?'cast':'deposit';trip.time=0;}
  }else{
   trip.time+=dt;const duration=trip.phase==='cast'?.68:trip.phase==='reel'?.48:.58;
   if(trip.time>=duration){trip.phase=trip.phase==='cast'?'reel':trip.phase==='reel'?'carry':'done';trip.time=0;}
  }
 }
 if(trip.phase==='cast'||trip.phase==='reel')direction=trip.source.x>=next.x+43?1:-1;
 const targetOffset=-direction*21;trip.bagOffset??=targetOffset;trip.bagOffset+=(targetOffset-trip.bagOffset)*Math.min(1,dt*11);
 const hand={x:next.x+43+direction*25,y:next.y+51},bag={x:next.x+43+trip.bagOffset,y:next.y+43};
 let loop=hand,icon=trip.source,iconScale=1,loopSize=5;
 if(trip.phase==='cast'){const p=ease(trip.time/.68);loop=lerp(hand,trip.source,p);loop.y-=Math.sin(p*Math.PI)*45;loopSize=5+16*p;}
 if(trip.phase==='reel'){const p=ease(trip.time/.48);loop=lerp(trip.source,bag,p);icon=loop;iconScale=1-p*.46;loopSize=21*(1-p)+5;}
 if(trip.phase==='carry'){loop=bag;icon=bag;iconScale=.54;}
 if(trip.phase==='deposit'||trip.phase==='done'){const p=trip.phase==='done'?1:ease(trip.time/.58);icon=lerp(bag,trip.destination,p);icon.y-=Math.sin(p*Math.PI)*38;loop=icon;iconScale=.54+p*.46;loopSize=4;}
 return {phase:trip.phase,cat:next,direction,hand,bag,loop,icon,iconScale,loopSize,caught:['reel','carry','deposit','done'].includes(trip.phase),done:trip.phase==='done'};
}
