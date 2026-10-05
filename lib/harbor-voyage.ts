import {catGroundLevel} from './desktop-scenery';
export type HarborPoint={x:number;y:number};
export type HarborLayout=ReturnType<typeof harborLayout>;
export type BoatPose={x:number;y:number;width:number};
export type HarborVoyage={elapsed:number;start:HarborPoint;approach:number;catches:boolean[];cancelled?:{at:number;boat:HarborPoint}};
export type VoyageFrame={phase:string;boat:BoatPose;cat:HarborPoint|null;aboard:boolean;walking:boolean;jumping:boolean;progress:number;cast:number;reel:number;caught:boolean;fishCount:number;moving:boolean;done:boolean};
const lerp=(a:number,b:number,p:number)=>a+(b-a)*p;
const ease=(p:number)=>{p=Math.max(0,Math.min(1,p));return p*p*(3-2*p)};
export function harborLayout(width:number,height:number){
 const pierY=height*(.604+60/426),boatWidth=Math.max(108,Math.min(146,width*.08));
 return {width,height,shore:{x:width*.185,y:catGroundLevel(height)},pierStart:{x:width*.23,y:pierY},pierEnd:{x:width*340/720-22,y:pierY},dock:{x:width*340/720+15,y:pierY+24},sea:{x:Math.max(12,Math.min(width-boatWidth*.63-115,width*.64)),y:height*.69},boatWidth};
}
export function newHarborVoyage(start:HarborPoint,layout:HarborLayout,random=Math.random):HarborVoyage{
 return {elapsed:0,start:{x:start.x/layout.width,y:start.y/layout.height},approach:Math.max(1.7,Math.min(18,Math.hypot(start.x-layout.shore.x,start.y-layout.shore.y)/78)),catches:[random()<.66,random()<.66,random()<.66]};
}
function interpolate(a:HarborPoint,b:HarborPoint,p:number,height=0):HarborPoint{return {x:lerp(a.x,b.x,p),y:lerp(a.y,b.y,p)-Math.sin(Math.PI*p)*height}}
export function sampleHarborVoyage(v:HarborVoyage|null,l:HarborLayout,time=0):VoyageFrame{
 const bob=Math.sin(time*1.5)*1.2,boat:BoatPose={...l.dock,y:l.dock.y+bob,width:l.boatWidth};
 const result:VoyageFrame={phase:'moored',boat,cat:null,aboard:false,walking:false,jumping:false,progress:0,cast:0,reel:0,caught:false,fishCount:0,moving:false,done:false};
 if(!v)return result;
 if(v.cancelled){const p=ease((v.elapsed-v.cancelled.at)/6);result.boat={...interpolate({x:v.cancelled.boat.x*l.width,y:v.cancelled.boat.y*l.height},l.dock,p),width:l.boatWidth};result.boat.y+=bob;result.phase='return-empty';result.moving=true;result.done=p>=1;return result}
 let t=v.elapsed;
 const steps:[string,number][]=[['approach',v.approach],['jump-pier',1.15],['pier-walk',3.8],['board',.95],['sail-out',8.5],['cast-0',1],['wait-0',4.4],['reel-0',1.8],['rest-0',1],['cast-1',1],['wait-1',5.3],['reel-1',1.8],['rest-1',1],['cast-2',1],['wait-2',4.8],['reel-2',1.8],['rest-2',1.5],['sail-home',8.5],['disembark',.95],['pier-home',3.8],['jump-shore',1.15]];
 let phase='done',progress=1;
 for(const [name,duration] of steps){if(t<duration){phase=name;progress=Math.max(0,t/duration);break}t-=duration}
 result.phase=phase;result.progress=progress;const p=ease(progress);
 const start={x:v.start.x*l.width,y:v.start.y*l.height};
 if(phase==='approach'){result.jumping=Math.abs(start.y-l.height)>10;result.walking=!result.jumping;result.cat=interpolate(start,l.shore,p,result.jumping?65:0)}
 else if(phase==='jump-pier'){result.cat=interpolate(l.shore,l.pierStart,p,78);result.jumping=true}
 else if(phase==='pier-walk'){result.cat=interpolate(l.pierStart,l.pierEnd,progress);result.walking=true}
 else if(phase==='board'){result.cat=interpolate(l.pierEnd,{x:boat.x+boat.width*.63,y:boat.y+5},p,51);result.jumping=true}
 else if(phase==='disembark'){result.cat=interpolate({x:boat.x+boat.width*.63,y:boat.y+5},l.pierEnd,p,51);result.jumping=true}
 else if(phase==='pier-home'){result.cat=interpolate(l.pierEnd,l.pierStart,progress);result.walking=true}
 else if(phase==='jump-shore'){result.cat=interpolate(l.pierStart,l.shore,p,58);result.jumping=true}
 else if(phase==='done'){result.cat=l.shore;result.done=true}
 else{
  result.aboard=true;
  let point=l.sea;
  if(phase==='sail-out'){point=interpolate(l.dock,l.sea,p);result.moving=true}
  if(phase==='sail-home'){point=interpolate(l.sea,l.dock,p);result.moving=true}
  result.boat={...point,y:point.y+bob,width:l.boatWidth};result.cat={x:result.boat.x+result.boat.width*.63,y:result.boat.y+5};
  const [action,indexText]=phase.split('-'),index=Number(indexText);
  if(['cast','wait','reel','rest'].includes(action)){
   result.cast=action==='cast'?p:action==='rest'?0:1;result.reel=action==='reel'?p:0;
   result.caught=action==='reel'&&v.catches[index];result.fishCount=v.catches.slice(0,index+(action==='rest'?1:0)).filter(Boolean).length;
  }else if(phase==='sail-home')result.fishCount=v.catches.filter(Boolean).length;
 }
 return result;
}
export function cancelHarborVoyage(v:HarborVoyage,l:HarborLayout){if(v.cancelled)return;const f=sampleHarborVoyage(v,l);v.cancelled={at:v.elapsed,boat:{x:f.boat.x/l.width,y:f.boat.y/l.height}}}
