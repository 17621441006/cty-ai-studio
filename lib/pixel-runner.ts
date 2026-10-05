export const RUNNER_FLOOR=295;
export const RUNNER_FINISH=5400;
export type RunnerItem={id:number;kind:'coin'|'note'|'crate'|'platform';x:number;y:number;w:number;h:number};
export type RunnerInput={jump:boolean;dash:boolean;axis:number};
export type Runner={x:number;feet:number;vy:number;world:number;time:number;hp:number;coins:number;score:number;combo:number;best:number;jumps:number;grounded:boolean;coyote:number;buffer:number;dash:number;cooldown:number;immune:number;magnet:number;status:'running'|'won'|'over';taken:Set<number>;broken:Set<number>;effects:{x:number;y:number;age:number;text:string;color:string}[]};
export const runnerItems:RunnerItem[]=[];
let id=0;
for(let segment=0;segment<6;segment++){
 const start=segment*900;
 runnerItems.push({id:id++,kind:'crate',x:start+510,y:263,w:32,h:32},{id:id++,kind:'platform',x:start+655,y:220,w:170,h:14});
 for(let j=0;j<6;j++)runnerItems.push({id:id++,kind:'coin',x:start+290+j*32,y:267,w:14,h:18});
 for(let j=0;j<5;j++)runnerItems.push({id:id++,kind:'coin',x:start+654+j*32,y:188,w:14,h:18});
 runnerItems.push({id:id++,kind:'note',x:start+534,y:173,w:20,h:24});
}
export const newRunner=():Runner=>({x:118,feet:RUNNER_FLOOR,vy:0,world:0,time:0,hp:3,coins:0,score:0,combo:0,best:0,jumps:0,grounded:true,coyote:.1,buffer:0,dash:0,cooldown:0,immune:0,magnet:0,status:'running',taken:new Set(),broken:new Set(),effects:[]});
export function runnerBounds(s:Runner){return {left:s.world+s.x+5,right:s.world+s.x+39,top:s.feet-48,bottom:s.feet};}
const overlap=(a:{left:number;right:number;top:number;bottom:number},b:RunnerItem,pad=0)=>a.right>=b.x-pad&&a.left<=b.x+b.w+pad&&a.bottom>=b.y-pad&&a.top<=b.y+b.h+pad;
function feedback(s:Runner,text:string,color='#ffe7a3'){s.effects.push({x:s.world+s.x+21,y:s.feet-60,age:0,text,color})}
/** Fixed substeps keep fast dashes from skipping narrow coins on low-frame-rate devices. */
export function stepRunner(s:Runner,input:RunnerInput,delta:number,auto=false){
 if(s.status!=='running')return;
 if(input.jump){s.buffer=.14;input.jump=false}
 if(input.dash){if(s.cooldown<=0){s.dash=.45;s.cooldown=2.4;feedback(s,'DASH','#9be3df')}input.dash=false}
 const count=Math.max(1,Math.ceil(Math.min(.1,Math.max(0,delta))/(1/120))),dt=Math.min(.1,Math.max(0,delta))/count;
 for(let n=0;n<count;n++){
  if(s.status!=='running')break;
  s.time+=dt;for(const key of ['buffer','dash','cooldown','immune','magnet','coyote'] as const)s[key]=Math.max(0,s[key]-dt);
  const speed=s.dash>0?330:132+Math.min(24,Math.floor(s.world/1800)*12);
  if(auto&&s.grounded){const front=s.world+s.x+39;const target=runnerItems.find(o=>(o.kind==='crate'&&!s.broken.has(o.id)||o.kind==='platform')&&o.x-front>0&&o.x-front<(o.kind==='crate'?35:70));if(target)s.buffer=.14}
  if(s.buffer>0&&(s.grounded||s.coyote>0||s.jumps<2)){
   s.vy=-485;s.buffer=0;s.jumps=s.grounded||s.coyote>0?1:s.jumps+1;s.grounded=false;s.coyote=0;
   if(s.jumps===2)feedback(s,'DOUBLE','#9ed5f4');
  }
  const previousFeet=s.feet;s.world+=speed*dt;s.x=Math.max(45,Math.min(480,s.x+input.axis*170*dt));s.vy+=1150*dt;s.feet+=s.vy*dt;
  const box=runnerBounds(s);let surface=RUNNER_FLOOR;
  for(const o of runnerItems)if(o.kind==='platform'&&box.right>o.x&&box.left<o.x+o.w&&previousFeet<=o.y+1&&s.feet>=o.y&&s.vy>=0)surface=Math.min(surface,o.y);
  if(s.feet>=surface&&s.vy>=0){s.feet=surface;s.vy=0;s.grounded=true;s.jumps=0;s.coyote=.1}else{if(s.grounded)s.coyote=.1;s.grounded=false;}
  const body=runnerBounds(s);
  for(const o of runnerItems){
   if(o.x+o.w<body.left-85||o.x>body.right+85||s.taken.has(o.id))continue;
   if(o.kind==='coin'||o.kind==='note'){
    const attraction=(s.magnet>0||s.dash>0)&&Math.hypot((o.x+o.w/2)-(body.left+body.right)/2,(o.y+o.h/2)-(body.top+body.bottom)/2)<83;
    if(overlap(body,o,6)||attraction){s.taken.add(o.id);if(o.kind==='coin'){s.coins++;s.combo++;s.best=Math.max(s.best,s.combo);const bonus=10+Math.min(4,Math.floor(s.combo/5))*5;s.score+=bonus;feedback(s,'+'+bonus)}else{s.magnet=7;s.score+=30;feedback(s,'MAGNET 7s','#e3b4f5')}}
   }else if(o.kind==='crate'&&!s.broken.has(o.id)&&overlap(body,o,-2)){
    if(s.dash>0){s.broken.add(o.id);s.score+=20;feedback(s,'SMASH +20','#9be3df')}
    else if(s.immune<=0){s.hp--;s.combo=0;s.immune=1.5;s.vy=-270;s.feet-=5;s.grounded=false;feedback(s,'OUCH!','#f3a59b');if(s.hp<=0)s.status='over'}
   }
  }
  for(const e of s.effects){e.age+=dt;e.y-=dt*24}s.effects=s.effects.filter(e=>e.age<.85);
  if(s.world>=RUNNER_FINISH){s.world=RUNNER_FINISH;s.status='won';s.score+=s.hp*100}
 }
}
