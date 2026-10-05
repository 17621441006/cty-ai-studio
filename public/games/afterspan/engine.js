(function(root){
'use strict';
const W=1120,H=600,DT=1/120;
const overlap=(a,b)=>a.x<b.x+b.w-.001&&a.x+a.w>b.x+.001&&a.y<b.y+b.h-.001&&a.y+a.h>b.y+.001;
const rect=(x,y,w,h,mask=3,extra={})=>({x,y,w,h,mask,...extra});
const floor=(x,w,y=520,mask=3)=>rect(x,y,w,Math.max(20,600-y),mask);
const gate=(x,y)=>({x,y,w:34,h:58});
const at=(s,t)=>s.move?{...s,x:s.x+Math.sin(t*s.move.speed+(s.move.phase||0))*s.move.x,y:s.y+Math.sin(t*s.move.speed+(s.move.phase||0))*s.move.y}:s;
class Game {
 constructor(rooms){this.rooms=rooms;this.deaths=0;this.total=0;this.events=[];this.load(0);}
 emit(type,data={}){this.events.push({type,...data});}
 load(i){
  this.roomIndex=i;this.room=this.rooms[i];this.timeline=this.room.startTimeline||0;this.time=0;this.falling={};this.dead=0;this.finished=false;
  this.p={x:this.room.spawn[0],y:this.room.spawn[1],w:18,h:28,vx:0,vy:0,ground:false,wall:0,face:1,coyote:0,buffer:0,wallLock:0};
  this.cameraY=Math.max(0,Math.min((this.room.height||H)-H,this.p.y-380));this.emit('room',{index:i});
 }
 restart(death=false){if(death){this.deaths++;this.emit('death',{index:this.roomIndex});}else this.emit('restart');this.load(this.roomIndex);}
 solids(timeline=this.timeline,time=this.time){
  const result=[];
  this.room.solids.forEach((s,index)=>{if((s.mask&(1<<timeline))&&!(this.falling[index]>(s.delay||.52)))result.push({...at(s,time),index});});
  return result;
 }
 shift(){
  if(this.room.shift===false)return false;
  const blocks=this.solids(1-this.timeline).filter(s=>overlap(this.p,s));
  if(blocks.length){this.emit('reject',{blocks});return false;}
  // No player or camera fields change. Both eras share the same clock.
  this.timeline=1-this.timeline;this.emit('shift');return true;
 }
 kill(){if(!this.dead){this.dead=.10;this.emit('burst',{x:this.p.x+9,y:this.p.y+14});}}
 hazards(timeline=this.timeline){return (this.room.hazards||[]).filter(h=>(h.mask??3)&(1<<timeline)).map(h=>at(h,this.time));}
 step(input={},dt=DT){
  if(this.finished)return;this.total+=dt;
  if(input.restart){this.restart();return;}
  if(this.dead){this.dead-=dt;if(this.dead<=0)this.restart(true);return;}
  const p=this.p,oldTime=this.time;this.time+=dt;
  // Supports run in both eras at all times. Only a current-era rider is carried.
  for(const s of this.solids(this.timeline,oldTime)){
   if(!s.move||!p.ground||Math.abs(p.y+p.h-s.y)>.1||p.x+p.w<=s.x||p.x>=s.x+s.w)continue;
   const current=at(this.room.solids[s.index],this.time);p.x+=current.x-s.x;p.y+=current.y-s.y;
  }
  for(const key of Object.keys(this.falling)){
   this.falling[key]+=dt;
   // A reforming ledge waits if occupied instead of rebuilding inside a body.
   if(this.falling[key]>2.8&&!overlap(p,at(this.room.solids[key],this.time)))delete this.falling[key];
  }
  if(input.shift)this.shift();
  p.coyote=p.ground?.095:Math.max(0,p.coyote-dt);p.buffer=input.jump?.12:Math.max(0,p.buffer-dt);p.wallLock=Math.max(0,p.wallLock-dt);
  const axis=(input.right?1:0)-(input.left?1:0);if(axis)p.face=axis;
  if(p.wallLock<=0){const target=axis*265,accel=axis?2600:(p.ground?3400:1500);p.vx+=Math.max(-accel*dt,Math.min(accel*dt,target-p.vx));}
  else if(axis===Math.sign(p.vx))p.vx+=axis*140*dt;
  p.vy=Math.min(p.vy+1480*dt,720);
  if(!input.jumpHeld&&p.vy< -200)p.vy+=2100*dt;
  if(p.wall&&axis===p.wall&&p.vy>0){p.vy=Math.min(p.vy,95);if(Math.floor(this.time*30)!==Math.floor(oldTime*30))this.emit('slide');}
  if(p.buffer>0){
   if(p.coyote>0){p.vy=-535;p.buffer=0;p.coyote=0;p.ground=false;this.emit('jump');}
   else if(p.wall){p.vy=-510;p.vx=-p.wall*340;p.face=-p.wall;p.wallLock=.16;p.buffer=0;this.emit('walljump');}
  }
  const wasGround=p.ground;p.ground=false;p.wall=0;
  const solids=this.solids(),hazards=this.hazards();
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(p.vx*dt),Math.abs(p.vy*dt))/3));
  for(let n=0;n<steps;n++){
   const dx=p.vx*dt/steps;p.x+=dx;
   for(const s of solids)if(overlap(p,s)){if(dx>0){p.x=s.x-p.w;p.wall=1;}else if(dx<0){p.x=s.x+s.w;p.wall=-1;}p.vx=0;}
   const dy=p.vy*dt/steps;p.y+=dy;
   for(const s of solids)if(overlap(p,s)){
    if(dy>0){p.y=s.y-p.h;p.ground=true;if(s.crumble&&this.falling[s.index]===undefined){this.falling[s.index]=.001;this.emit('crumble');}}
    else if(dy<0){p.y=s.y+s.h;}p.vy=0;
   }
   if(hazards.some(h=>hazardHit(p,h)))this.kill();
  }
  if(p.x<0){p.x=0;p.vx=Math.max(0,p.vx);}
  if(p.x+p.w>W){p.x=W-p.w;p.vx=Math.min(0,p.vx);}
  if(!p.wall){if(solids.some(s=>overlap({...p,x:p.x+1},s)))p.wall=1;else if(solids.some(s=>overlap({...p,x:p.x-1},s)))p.wall=-1;}
  if(solids.some(s=>overlap(p,s)))this.kill();
  if(p.ground&&!wasGround)this.emit('land');
  if(p.y>(this.room.height||H)+30)this.kill();
  // Stable dead zone; this is driven only by movement, never by a shift.
  if(p.y-this.cameraY<190)this.cameraY=p.y-190;
  if(p.y-this.cameraY>410)this.cameraY=p.y-410;
  this.cameraY=Math.max(0,Math.min((this.room.height||H)-H,this.cameraY));
  if(!this.dead&&overlap(p,this.room.exit)){
   this.emit('complete',{index:this.roomIndex,id:this.room.id,time:this.time});
   if(this.roomIndex+1<this.rooms.length)this.load(this.roomIndex+1);else{this.finished=true;this.emit('win');}
  }
 }
}
function spikeHit(p,h){
 if(!overlap(p,h))return false;
 const y=Math.min(p.y+p.h,h.y+h.h),half=6*(y-h.y)/h.h;
 for(let x=h.x;x<h.x+h.w;x+=12)if(p.x<x+6+half&&p.x+p.w>x+6-half)return true;
 return false;
}
function hazardHit(p,h){
 if(h.kind==='saw'){const r=h.w/2,cx=h.x+r,cy=h.y+r;return Math.hypot(cx-Math.max(p.x,Math.min(cx,p.x+p.w)),cy-Math.max(p.y,Math.min(cy,p.y+p.h)))<r-2;}
 if(h.kind==='crusher')return overlap(p,h)||overlap(p,{x:h.x,y:h.y+h.h,w:h.w,h:6});
 return spikeHit(p,h);
}
const API={Game,rect,floor,gate,overlap,at,hazardHit,W,H,DT};if(typeof module!=='undefined')module.exports=API;root.Afterspan=API;
})(typeof window!=='undefined'?window:globalThis);
