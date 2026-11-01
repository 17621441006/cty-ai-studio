/** One-stage depth-aware beat-em-up. Independent of Duel and its balance. */
export const ADVENTURE_ARENA={left:80,right:1520,front:0,back:220,bossLeft:150,bossRight:1450,maxEnemies:7};
export const ADVENTURE_SKILLS={attack:{cooldown:.29,duration:.38},skill:{cooldown:2.3,duration:.5},dash:{cooldown:1.3,duration:.25},ultimate:{cooldown:1,duration:1},roar:{cooldown:6,duration:1.25},charm:{cooldown:9,duration:.75},launch:{cooldown:4.5,duration:1.15}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const within=(a,b,x,d)=>Math.abs(a.x-b.x)<=x&&Math.abs(a.depth-b.depth)<=d;
export class Adventure{
 constructor(){this.reset()}
 reset(){this.t=0;this.elapsed=0;this.accumulator=0;this.started=false;this.paused=false;this.ended=false;this.won=false;this.wave=0;this.waveDelay=0;this.nextId=1;this.enemies=[];this.hazards=[];this.projectiles=[];this.effects=[];this.events=[];this.defeated=0;this.player=this.actor('cat',410,110,480);this.player.energy=35;this.player.player=true}
 actor(kind,x,depth,hp){return{id:this.nextId++,kind,x,depth,y:0,vy:0,face:1,hp,maxHp:hp,energy:0,state:'idle',stateT:0,action:null,cooldowns:Object.fromEntries(Object.keys(ADVENTURE_SKILLS).map(k=>[k,0])),invuln:0,stun:0,charmed:0,guard:100,maxGuard:100,guarding:false,guardBreak:0,guardDelay:0,chain:0,lastAttack:-10,moving:false,think:.8,phase:1,attackCount:0,pounceVisual:null}}
 emit(type,data={}){this.events.push({type,...data})}
 start(){if(this.started||this.ended)return;this.started=true;this.spawnWave()}
 spawnWave(){
  if(this.enemies.some(e=>e.hp>0))return false;
  if(this.wave>=4){this.finish(true);return}this.wave++;this.waveDelay=0;this.hazards=[];this.projectiles=[];
  if(this.wave>4){this.finish(true);return}
  const count=this.wave===4?1:[3,5,7][this.wave-1];
  for(let i=0;i<count;i++){
   const kind=this.wave===4?'boss':this.wave>=2&&i%4===1?'ranger':this.wave>=2&&i%3===2?'brute':'grunt',hp=kind==='boss'?420:kind==='brute'?76:kind==='ranger'?42:48;
   const e=this.actor(kind,this.wave===4?1270:i%2?1420-i*13:170+i*17,30+(i*67)%175,hp);e.face=e.x<this.player.x?1:-1;e.think=.7+i*.17;e.attackCount=i%3;this.enemies.push(e);this.emit('spawn',{actor:e,wave:this.wave});
  }
  if(this.wave>1){const before=this.player.hp;this.player.hp=Math.min(480,this.player.hp+32);this.player.energy=Math.min(100,this.player.energy+18);this.emit('heal',{actor:this.player,amount:this.player.hp-before})}
  this.emit('wave',{wave:this.wave,count,boss:this.wave===4,text:this.wave===4?'首领登场 · 月魇守卫':`第 ${this.wave} 波`});
 }
 finish(won){if(this.ended)return;this.ended=true;this.won=won;this.hazards=[];this.projectiles=[];this.player.action=null;this.player.guarding=false;this.player.pounceVisual=null;this.player.y=0;this.player.vy=0;this.player.state=won?'idle':'knockdown';this.emit('end',{won,wave:this.wave,defeated:this.defeated})}
 action(key){
  const aliases={j:'attack',k:'skill',l:'dash',u:'ultimate',i:'roar',o:'charm',p:'launch',space:'jump'},type=aliases[String(key).toLowerCase()]||key,a=this.player;
  if(!this.started||this.paused||this.ended||a.stun>0||a.guarding)return false;
  if(type==='jump'){if(a.y>0||a.action)return false;a.vy=820;a.state='jump';this.emit('jump',{actor:a});return true}
  const spec=ADVENTURE_SKILLS[type];if(!spec||a.action||a.cooldowns[type]>0)return false;
  if((type==='launch'||type==='charm')&&a.y>0)return false;
  if(type==='ultimate'&&a.energy<100)return false;
  a.cooldowns[type]=spec.cooldown;a.action={type,skill:type==='launch'?'pounce':type,t:0,duration:spec.duration,hit:false,pulses:0};a.state='attack';a.stateT=0;
  if(type==='attack'){a.chain=this.t-a.lastAttack<1.05?(a.chain+1)%3:0;a.lastAttack=this.t;a.action.chain=a.chain;this.emit('swing',{actor:a})}
  else if(type==='dash'){a.invuln=.3;this.emit('dash',{actor:a})}
  else if(type==='ultimate'){a.energy=0;a.invuln=.75;this.emit('ultimate',{actor:a,text:'赤焰 · 裂地燎原'})}
  else if(type==='skill')this.emit('charge',{actor:a});
  else{if(type==='launch')a.pounceVisual={age:0,phase:'charge',flightAge:0,impactAge:0};this.emit('special',{actor:a,kind:'cat',skill:a.action.skill,phase:'start'})}
  return true;
 }
 hit(target,damage,source,{knock=25,launch=false,charm=false}={}){
  if(this.ended||target.hp<=0||target.invuln>0)return false;
  let dealt=Math.min(target.hp,damage),blocked=false;
  if(target===this.player&&target.guarding&&(source.x-target.x)*target.face>=-5){blocked=true;dealt=Math.min(target.hp,Math.max(1,Math.round(damage*.2)));target.guard=Math.max(0,target.guard-Math.max(14,damage));target.guardDelay=1.2;this.emit('block',{actor:target,source,damage:dealt});if(!target.guard){target.guarding=false;target.guardBreak=1.3;target.stun=.5;this.emit('guardbreak',{actor:target,source})}}
  target.hp-=dealt;target.invuln=target===this.player?.38:.15;
  if(!blocked){if(target.pounceVisual){if(target.pounceVisual.phase==='charge')target.pounceVisual=null;else target.pounceVisual.interrupted=true}target.stun=charm?(target.kind==='boss'?.65:1.8):target.kind==='boss'?0:.18;target.charmed=charm?target.stun:0;if(target.kind!=='boss'||charm){target.action=null;this.hazards=this.hazards.filter(h=>h.owner!==target||h.fired)}target.state=charm?'charmed':target.action?'attack':'hurt';target.stateT=0;target.x=clamp(target.x+(source.face||1)*(target.kind==='boss'?0:knock),80,1520);if(launch&&target.kind!=='boss'){target.y=Math.max(8,target.y);target.vy=560}}
  if(source===this.player)this.player.energy=Math.min(100,this.player.energy+8);
  this.emit('hit',{actor:target,source,damage:dealt,blocked,airborne:target.y>0,depth:target.depth});
  if(target.hp===0){this.hazards=this.hazards.filter(h=>h.owner!==target);target.state='knockdown';target.action=null;this.emit('defeat',{actor:target});if(target===this.player)this.finish(false);else{this.defeated++;this.player.energy=Math.min(100,this.player.energy+10)}}return true;
 }
 strike(a,damage,reach,depth,options={}){
  let hits=0;for(const e of this.enemies)if(e.hp>0&&within(a,e,reach,depth)&&Math.abs(a.y-e.y)<125&&(options.radial||(e.x-a.x)*a.face>=-24))hits+=this.hit(e,damage,a,options)?1:0;return hits;
 }
 step(realDt,input={}){
  if(!this.started||this.paused||this.ended)return;const dt=Number(realDt);if(!Number.isFinite(dt)||dt<=0)return;
  this.accumulator+=Math.min(dt,1);while(this.accumulator+1e-10>=1/120&&!this.ended){this.accumulator-=1/120;this.elapsed+=1/120;this.tick(1/120,input)}
 }
 timers(a,dt){
  a.stateT+=dt;a.moving=false;for(const k of['invuln','stun','charmed','guardBreak','guardDelay'])a[k]=Math.max(0,a[k]-dt);for(const k in a.cooldowns)a.cooldowns[k]=Math.max(0,a.cooldowns[k]-dt);
  if(a.y>0||a.vy>0){const was=a.y>0;a.y=Math.max(0,a.y+a.vy*dt);a.vy-=1600*dt;if(a.y===0){a.vy=0;if(was){this.emit('land',{actor:a,skill:a.action?.skill});if(a.pounceVisual){a.pounceVisual.phase='impact';a.pounceVisual.impactAge=0}}}}
  if(a.pounceVisual){a.pounceVisual.age+=dt;if(a.pounceVisual.phase==='flight')a.pounceVisual.flightAge+=dt;if(a.pounceVisual.phase==='impact'){a.pounceVisual.impactAge+=dt;if(a.pounceVisual.impactAge>.35)a.pounceVisual=null}}
 }
 tick(dt,input){
  this.t+=dt;const a=this.player;this.timers(a,dt);a.energy=Math.min(100,a.energy+dt*1.2);
  a.guarding=!!input.guard&&!a.action&&!a.stun&&a.y===0&&a.guardBreak<=0&&(a.guarding?a.guard>0:a.guard>=15);
  if(a.guarding){a.state='guard';a.guard=Math.max(0,a.guard-dt*7);if(a.guard===0){a.guardBreak=1.3;a.guarding=false;a.guardDelay=1.3;this.emit('guardbreak',{actor:a})}}else if(a.guardDelay===0)a.guard=Math.min(100,a.guard+dt*17);
  if(!a.stun&&!a.guarding){
   if(a.action)this.playerAction(a,dt);
   const canMove=!a.action||(a.y>0&&a.action.type!=='dash'&&a.action.type!=='launch');
   if(canMove){let x=(input.right?1:0)-(input.left?1:0),z=(input.down?1:0)-(input.up?1:0),n=Math.hypot(x,z)||1;x/=n;z/=n;a.x=clamp(a.x+x*370*dt,80,1520);a.depth=clamp(a.depth+z*235*dt,0,220);if(x)a.face=Math.sign(x);a.moving=!!(x||z);if(!a.action)a.state=a.y>0?'airborne':a.moving?'run':'idle'}
  }
  for(const e of this.enemies)if(e.hp>0){this.timers(e,dt);this.enemyStep(e,dt)}
  if(this.ended)return;this.collisions();
  for(const p of this.projectiles){p.x+=p.vx*dt;p.life-=dt;for(const e of this.enemies)if(e.hp>0&&within(p,e,36,32)&&Math.abs(p.y-e.y-70)<100){if(this.hit(e,26,a,{knock:40})){p.life=0;break}}if(p.x<30||p.x>1570)p.life=0}
  this.projectiles=this.projectiles.filter(p=>p.life>0);
  for(const h of this.hazards){h.age+=dt;if(!h.fired&&h.age>=h.delay){h.fired=true;h.active=true;this.emit('hazard',{hazard:h,phase:'impact',actor:h.owner});if(a.y<70&&within(h,a,h.rx,h.rd))this.hit(a,h.damage,h.owner,{knock:45})}}
  this.hazards=this.hazards.filter(h=>h.age<h.delay+.35);
  this.enemies=this.enemies.filter(e=>e.hp>0);
  if(!this.ended&&this.enemies.length===0){if(!this.waveDelay){this.waveDelay=1.25;this.emit('waveclear',{wave:this.wave})}this.waveDelay-=dt;if(this.waveDelay<=0)this.spawnWave()}
 }
 playerAction(a,dt){
  const z=a.action;z.t+=dt;
  if(z.type==='dash'){a.x=clamp(a.x+a.face*850*dt,80,1520);a.moving=true}
  if(z.type==='attack'&&!z.hit&&z.t>=.14){z.hit=true;this.emit('slash',{actor:a,chain:z.chain});this.strike(a,19+z.chain*6,145+z.chain*10,43,{launch:z.chain===2,knock:22})}
  if(z.type==='skill'&&!z.hit&&z.t>=.20){z.hit=true;this.projectiles.push({id:this.nextId++,x:a.x+a.face*42,depth:a.depth,y:a.y+70,vx:a.face*680,life:2,owner:a});this.emit('cast',{actor:a})}
  if(z.type==='roar'&&z.pulses<4&&z.t>=.17+z.pulses*.28){z.pulses++;this.strike(a,12,340,65,{knock:28});this.emit('special',{actor:a,kind:'cat',skill:'roar',phase:'pulse',pulse:z.pulses})}
  if(z.type==='charm'&&!z.hit&&z.t>=.25){z.hit=true;this.strike(a,0,230,75,{charm:true,knock:0});this.emit('special',{actor:a,kind:'cat',skill:'charm',phase:'pulse'})}
  if(z.type==='ultimate'&&!z.hit&&z.t>=.4){z.hit=true;this.strike(a,95,620,150,{radial:true,launch:true,knock:60});this.emit('burst',{actor:a})}
  if(z.type==='launch'){
   if(!z.leapt&&z.t>=.16){z.leapt=true;a.y=1;a.vy=650;if(a.pounceVisual)a.pounceVisual.phase='flight';this.emit('special',{actor:a,kind:'cat',skill:'pounce',phase:'leap'})}
   if(z.leapt&&!z.hit){a.x=clamp(a.x+a.face*310*dt,80,1520);if(a.y===0){z.hit=true;this.strike(a,40,195,85,{radial:true,launch:true,knock:45});this.emit('special',{actor:a,kind:'cat',skill:'pounce',phase:'pulse'})}}
  }
  if(z.t>=z.duration)a.action=null;
 }
 enemyStep(e,dt){
  const p=this.player;if(e.stun>0){e.state=e.charmed?'charmed':'hurt';return}
  if(e.kind==='boss'){const phase=e.hp<140?3:e.hp<280?2:1;if(phase!==e.phase){e.phase=phase;this.emit('bossphase',{actor:e,phase})}}
  if(e.action){e.action.t+=dt;if(e.action.t>=e.action.duration){e.action=null;e.think=e.kind==='boss'?1.1-e.phase*.16:1.1+e.id%3*.18}return}
  e.face=p.x>e.x?1:-1;e.think-=dt;
  const desired=e.kind==='boss'?210:e.kind==='ranger'?310:88,dx=p.x-e.x,dz=p.depth-e.depth;
  if(Math.abs(dx)>desired||Math.abs(dz)>23){const n=Math.hypot(dx,dz*1.5)||1,speed=e.kind==='boss'?115:e.kind==='brute'?105:140;e.x=clamp(e.x+dx/n*speed*dt,e.kind==='boss'?150:80,e.kind==='boss'?1450:1520);e.depth=clamp(e.depth+dz/n*speed*1.25*dt,0,220);e.moving=true;e.state='run'}else if(e.kind==='ranger'&&Math.abs(dx)<180){e.x=clamp(e.x-e.face*90*dt,80,1520);e.moving=true;e.state='run'}else e.state='idle';
  if(e.think<=0&&(e.kind==='boss'?within(e,p,650,220):e.kind==='ranger'?within(e,p,600,40):within(e,p,130,40))){
   const move=e.kind==='boss'?['slam','sweep','storm'][e.attackCount++%3]:e.kind==='ranger'?'bolt':'claw',delay=e.kind==='boss'?1.05-e.phase*.1:e.kind==='brute'?.7:.6;e.action={type:move,skill:move,t:0,duration:delay+.35};e.state='attack';e.stateT=0;
   if(move==='bolt')this.hazard(e,e.x+e.face*260,e.depth,285,20,.8,11,move);
   if(move==='claw')this.hazard(e,e.x+e.face*72,e.depth,82,36,delay,e.kind==='brute'?14:9,move);
   if(move==='slam')this.hazard(e,p.x,p.depth,150,70,delay,32,move);
   if(move==='sweep')this.hazard(e,e.x+e.face*185,e.depth,265,32,delay,26,move);
   if(move==='storm')for(let i=-1;i<=1;i++)this.hazard(e,clamp(p.x+i*170,80,1520),clamp(p.depth+i*65,0,220),90,42,delay+Math.abs(i)*.22,22,move);
   this.emit('telegraph',{actor:e,skill:move,delay,phase:e.phase});
  }
 }
 hazard(owner,x,depth,rx,rd,delay,damage,kind){const h={id:this.nextId++,owner,x,depth,rx,rd,delay,damage,kind,shape:'rect',age:0,duration:delay+.35,active:false,fired:false};this.hazards.push(h);this.emit('hazard',{hazard:h,phase:'warn',actor:owner})}
 collisions(){
  // Elliptical depth-space bodies, with dash/jump escape and wall-safe clamping.
  const all=[this.player,...this.enemies];for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
   const a=all[i],b=all[j];if(a.hp<=0||b.hp<=0||Math.abs(a.y-b.y)>60||a.action?.type==='dash'||b.action?.type==='dash')continue;
   let dx=b.x-a.x,dz=(b.depth-a.depth)*2,n=Math.hypot(dx,dz);if(n>=58)continue;if(n<.001){dx=a.id<b.id?1:-1;dz=0;n=1}
   const push=(58-n)/2,nx=dx/n,nz=dz/n;for(const [o,sign]of[[a,-1],[b,1]]){o.x=clamp(o.x+nx*push*sign,o.kind==='boss'?150:80,o.kind==='boss'?1450:1520);o.depth=clamp(o.depth+nz*push*sign/2,0,220)}
  }
 }
}
