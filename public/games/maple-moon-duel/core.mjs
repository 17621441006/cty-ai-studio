export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const RUN_SPEED=400;
export const ARENA={left:100,right:1500,bodyGap:94,clearance:78};
export const SPECIALS={roar:{cooldown:6,duration:1.3,range:340},charm:{cooldown:9,duration:.8,range:250},launch:{cooldown:4.5,duration:.65,range:155}};
export function specialFor(kind,key){
 const base=SPECIALS[key];if(!base)return null;
 if(kind==='xiaosi'&&key==='roar')return{skill:'love',cooldown:8,duration:1.65,range:145};
 if(kind==='xiaosi'&&key==='charm')return{skill:'cry',cooldown:8,duration:.75,range:290};
 if(kind==='cat'&&key==='launch')return{skill:'pounce',cooldown:4.5,duration:1.2,range:185};
 return{...base,skill:key};
}
export class Duel{
 constructor(choice='cat'){this.choice=choice;this.reset()}
 reset(){this.clearPounceVisuals();if(this.player)this.releaseHold(this.player);if(this.enemy)this.releaseHold(this.enemy);this.time=180;this.t=0;this.started=false;this.ended=false;this.paused=false;this.effects=[];this.projectiles=[];this.events=[];this.combo=0;this.comboUntil=0;this.hitstop=0;this.aiTime=1.5;this.nextId=0;this.player=this.actor(this.choice,430,true);this.enemy=this.actor(this.choice==='cat'?'xiaosi':'cat',1170,false);this.player.face=1;this.enemy.face=-1}
 actor(kind,x,player){return{kind,x,y:0,vy:0,face:player?1:-1,hp:480,maxHp:480,energy:35,state:'idle',stateT:0,action:null,cooldowns:{attack:0,skill:0,dash:0,ultimate:0,roar:0,charm:0,launch:0},guard:100,maxGuard:100,guarding:false,guardBreak:0,guardDelay:0,rooted:0,heldBy:null,holding:null,juggleHits:0,knockdown:0,recovery:0,charmed:0,invuln:0,stun:0,jumpBuffer:0,player,chain:0,lastAttack:-10,moving:false,trail:0,pounceVisual:null}}
 start(){this.started=true;this.emit('announce',{text:'切磋开始'})}
 emit(type,data={}){this.events.push({type,...data})}
 tryJump(a){
  // A queued jump survives hit-stop and short hit-stun. A late attack recovery
  // can be cancelled into escape, but a committed ultimate cannot.
  const recovery=!a.action||(a.action.type==='attack'&&a.action.t>=.12)||(a.action.type==='skill'&&a.action.t>=.25);
  if(a.jumpBuffer<=0||a.y>0||a.stun>0||a.knockdown>0||a.charmed>0||a.guarding||a.rooted>0||a.heldBy||!recovery)return false;
  a.jumpBuffer=0;a.action=null;a.vy=840;a.state='jump';a.stateT=0;
  a.invuln=Math.max(a.invuln,.16);this.emit('jump',{actor:a});return true;
 }
 action(a,type){
  if(!this.started||this.paused||this.ended)return false;
  if(type==='jump'){a.jumpBuffer=.28;this.tryJump(a);return true}
  if(a.stun>0||a.knockdown>0||a.charmed>0||a.guarding||a.heldBy||a.cooldowns[type]>0||a.action)return false;
  if(a.rooted>0&&(type==='dash'||type==='launch'))return false;
  if((type==='charm'||(a.kind==='xiaosi'&&type==='roar')||(a.kind==='cat'&&type==='launch'))&&a.y>0)return false;
  if(SPECIALS[type]){const spec=specialFor(a.kind,type);a.cooldowns[type]=spec.cooldown;a.action={type,skill:spec.skill,t:0,duration:spec.duration,hit:false,pulses:0};a.state='attack';a.stateT=0;if(spec.skill==='pounce')a.pounceVisual={age:0,phase:'charge',phaseAge:0,flightAge:0,impactAge:0,interrupted:false};this.emit('special',{actor:a,kind:a.kind,skill:spec.skill,phase:'start',range:spec.range});return true}
  if(type==='ultimate'&&a.energy<100){if(a.player)this.emit('notice',{text:'积蓄能量后释放绝技'});return false}
  if(type==='dash'){a.cooldowns.dash=1.2;a.invuln=.34;a.action={type,t:0,duration:.26};a.state='run';this.emit('dash',{actor:a});return true}
  if(type==='attack'){a.chain=this.t-a.lastAttack<1.1?(a.chain+1)%3:0;a.lastAttack=this.t;a.cooldowns.attack=.28;a.action={type,t:0,duration:.39,hit:false,chain:a.chain};a.state='attack';a.stateT=0;this.emit('swing',{actor:a});return true}
  if(type==='skill'){a.cooldowns.skill=2.4;a.action={type,t:0,duration:.58,hit:false};a.state='attack';a.stateT=0;this.emit('charge',{actor:a});return true}
  if(type==='ultimate'){a.energy=0;a.cooldowns.ultimate=1;a.invuln=.85;a.action={type,t:0,duration:.95,hit:false};a.state='attack';a.stateT=0;this.emit('ultimate',{actor:a,text:a.kind==='cat'?'赤焰 · 裂地燎原':'月华 · 雷月领域'});return true}
  return false;
 }
 clearPounceVisuals(){for(const a of[this.player,this.enemy])if(a)a.pounceVisual=null}
 releaseHold(a){
  const owner=a.heldBy||a,target=owner.holding;if(!target)return;
  owner.holding=null;target.heldBy=null;target.y=0;target.vy=0;
  target.stun=Math.min(target.stun,.15);target.invuln=Math.max(target.invuln,.15);
  this.emit('special',{actor:owner,target,kind:owner.kind,skill:'love',phase:'release'});
 }
 breakGuard(a,source){
  a.guard=0;a.guarding=false;a.guardBreak=1.4;a.guardDelay=1.4;a.stun=.65;a.state='hurt';
  this.emit('guardbreak',{actor:a,source});
 }
 hit(target,damage,source,knock=45,options={}){
  if(target.invuln>0||target.knockdown>0||target.recovery>0||this.ended)return false;
  if(target.guarding&&!options.bypassGuard&&(source.x-target.x)*target.face>=-5){
   const actual=Math.min(target.hp,damage>0?Math.max(1,Math.round(damage*.2)):0),prevented=damage-actual;
   target.hp=Math.max(0,target.hp-actual);target.guard=Math.max(0,target.guard-Math.max(12,damage*.9));target.guardDelay=1.2;target.invuln=.1;
   target.x=clamp(target.x+source.face*knock*.15,ARENA.left,ARENA.right);
   this.hitstop=Math.max(this.hitstop,.035);this.emit('block',{actor:target,source,damage:actual,prevented,guard:target.guard});
   this.emit('hit',{actor:target,source,damage:actual,blocked:true,airborne:false,combo:0,juggleHits:target.juggleHits});
   if(target.guard===0)this.breakGuard(target,source);
   if(target.hp===0){this.releaseHold(target);this.releaseHold(source);this.ended=true;this.clearPounceVisuals();this.emit('end',{won:target!==this.player})}return true;
  }
  if(!options.holdTick){this.releaseHold(target);target.guarding=false;if(target.pounceVisual){if(target.pounceVisual.phase==='charge')target.pounceVisual=null;else target.pounceVisual.interrupted=true}}
  const airborne=!options.holdTick&&(target.y>0||!!options.launch);
  const actualDamage=Math.min(target.hp,damage);target.hp=Math.max(0,target.hp-damage);target.invuln=airborne?.12:.26;target.stun=damage>=40?.24:.18;target.action=null;target.pending=null;target.state='hurt';target.stateT=0;
  target.x=clamp(target.x+source.face*knock,ARENA.left,ARENA.right);
  if(airborne){target.juggleHits++;target.y=Math.max(12,target.y);target.vy=options.launch?760:Math.max(target.vy,520);target.y=Math.min(target.y,300)}
  if(options.root){target.rooted=1.5;target.stun=0;target.state='idle'}
  if(options.charm){target.charmed=1.1;target.stun=1.1;target.state='charmed';target.vy=0}
  const juggleHits=target.juggleHits;
  if(juggleHits>=30){target.y=0;target.vy=0;target.juggleHits=0;target.knockdown=.55;target.stun=.55;target.charmed=0;target.jumpBuffer=0;target.state='knockdown';if(target.pounceVisual){target.pounceVisual.phase='impact';target.pounceVisual.phaseAge=0;target.pounceVisual.impactAge=0}this.emit('knockdown',{actor:target,source,reason:'combo-cap',recoveryDuration:3})}
  target.energy=clamp(target.energy+8,0,100);source.energy=clamp(source.energy+12,0,100);
  this.hitstop=Math.max(this.hitstop,damage>=40?.105:damage>=20?.07:.045);
  if(source.player){this.combo=this.t<this.comboUntil?this.combo+1:1;this.comboUntil=this.t+1.9}
  this.emit('hit',{actor:target,source,holdTick:!!options.holdTick,skill:options.holdTick?'love':source?.action?.skill,damage:actualDamage,blocked:false,airborne,combo:this.combo,juggleHits});
  if(target.hp===0){this.releaseHold(target);this.releaseHold(source);this.ended=true;this.clearPounceVisuals();this.emit('end',{won:target!==this.player})}return true;
 }
 specialPulse(a,z){
  const o=a===this.player?this.enemy:this.player,spec=specialFor(a.kind,z.type),skill=spec.skill;
  this.emit('special',{actor:a,kind:a.kind,skill,phase:'pulse',range:spec.range,pulse:z.pulses});
  if(Math.abs(o.x-a.x)>spec.range||(o.x-a.x)*a.face<-20||Math.abs(o.y-a.y)>150)return;
  const ok=skill==='roar'?this.hit(o,8,a,24):skill==='charm'?this.hit(o,0,a,0,{charm:true}):skill==='cry'?this.hit(o,6,a,0,{root:true}):skill==='pounce'?this.hit(o,26,a,65,{launch:true}):this.hit(o,18,a,25,{launch:true});
  if(ok)this.emit('special',{actor:a,target:o,kind:a.kind,skill,phase:'hit',range:spec.range});
 }
 specialStep(a,z,dt){
  const spec=specialFor(a.kind,z.type),o=a===this.player?this.enemy:this.player;
  if(spec.skill==='love'){
   // Prompt capture, shared by manual PK and the disclosed exhibition.
   if(!z.hit&&z.t>=.14){z.hit=true;
    if(Math.abs(o.x-a.x)<=spec.range&&(o.x-a.x)*a.face>=-20&&o.y<50&&o.invuln<=0&&o.recovery<=0&&o.knockdown<=0){
     this.releaseHold(o);a.holding=o;o.heldBy=a;o.action=null;o.pending=null;o.guarding=false;o.pounceVisual=null;o.vy=0;o.jumpBuffer=0;o.state='held';
     this.emit('special',{actor:a,target:o,kind:a.kind,skill:'love',phase:'grab',range:spec.range});
    }
   }
   if(a.holding&&z.pulses<3&&z.t>=.48+z.pulses*.35){z.pulses++;this.hit(o,9,a,0,{bypassGuard:true,holdTick:true});this.emit('special',{actor:a,target:o,kind:a.kind,skill:'love',phase:'tick',pulse:z.pulses})}
   if(z.t>=1.5)this.releaseHold(a);
  }else if(spec.skill==='pounce'){
   if(!z.leapt&&z.t>=.18){z.leapt=true;if(a.pounceVisual){a.pounceVisual.phase='flight';a.pounceVisual.phaseAge=0;a.pounceVisual.flightAge=0}z.travel=clamp((o.x-a.x)*a.face-60,80,360);a.vy=680;a.y=1;this.emit('special',{actor:a,kind:a.kind,skill:'pounce',phase:'leap',range:spec.range})}
   if(z.leapt&&!z.hit){const travel=Math.min(z.travel,430*dt);a.x=clamp(a.x+a.face*travel,ARENA.left,ARENA.right);z.travel-=travel;a.moving=travel>0;
    if(a.y===0){z.hit=true;this.specialPulse(a,z)}
   }
  }else if(spec.skill==='roar'){
   if(z.pulses<4&&z.t>=.18+z.pulses*.30){z.pulses++;this.specialPulse(a,z)}
  }else if(!z.hit&&z.t>=.24){z.hit=true;this.specialPulse(a,z)}
 }
 resolveBodies(){
  const p=this.player,e=this.enemy;
  p.x=clamp(p.x,ARENA.left,ARENA.right);e.x=clamp(e.x,ARENA.left,ARENA.right);
  // A lifted body or invulnerable dash may pass through the horizontal lane.
  if(p.heldBy||e.heldBy)return;
  if(Math.abs(p.y-e.y)>=ARENA.clearance||p.action?.type==='dash'||e.action?.type==='dash')return;
  const sign=p.x<e.x?-1:p.x>e.x?1:(p.face===1?-1:1),overlap=ARENA.bodyGap-Math.abs(p.x-e.x);
  if(overlap<=0)return;
  p.x=clamp(p.x+sign*overlap/2,ARENA.left,ARENA.right);
  e.x=clamp(e.x-sign*overlap/2,ARENA.left,ARENA.right);
  // Transfer blocked displacement to the actor with free space. Never push the
  // cornered actor outside the arena after the boundary clamp.
  let remaining=ARENA.bodyGap-Math.abs(p.x-e.x);
  if(remaining>0){const before=p.x;p.x=clamp(p.x+sign*remaining,ARENA.left,ARENA.right);remaining-=Math.abs(p.x-before)}
  if(remaining>0)e.x=clamp(e.x-sign*remaining,ARENA.left,ARENA.right);
 }
 step(realDt,input={}){
  if(!this.started||this.paused||this.ended)return;
  // Hit-stop consumes wall-clock delta, not the capped simulation delta.
  let dt=Math.max(0,Number(realDt)||0);
  if(this.hitstop>0){const stopped=Math.min(dt,this.hitstop);this.hitstop-=stopped;dt-=stopped}
  dt=Math.min(dt,.04);if(dt<=0)return;
  this.time=Math.max(0,this.time-dt);this.t+=dt;
  if(this.time===0){this.releaseHold(this.player);this.releaseHold(this.enemy);this.ended=true;this.clearPounceVisuals();this.emit('end',{won:this.player.hp>=this.enemy.hp});return}
  const p=this.player,e=this.enemy;
  // Guard is sampled before combat for this frame, and releases immediately
  // with F. Enemies only guard briefly in a predictable defensive window.
  for(const a of[p,e]){
   const wants=a===p?!!input.guard:(this.t>6&&this.t%5<.65&&!!p.action&&Math.abs(p.x-e.x)<400);
   a.guarding=wants&&!a.action&&a.y===0&&a.stun<=0&&a.knockdown<=0&&a.charmed<=0&&!a.heldBy&&a.guardBreak<=0&&(a.guarding?a.guard>0:a.guard>=15);
  }
  for(const a of[p,e]){
   const wasDown=a.knockdown>0;
   const visual=a.pounceVisual;if(visual){visual.age+=dt;visual.phaseAge+=dt;if(visual.phase==='flight')visual.flightAge+=dt;if(visual.phase==='impact'){visual.impactAge+=dt;if(visual.impactAge>=.35)a.pounceVisual=null}}
   a.rooted=Math.max(0,a.rooted-dt);a.guardBreak=Math.max(0,a.guardBreak-dt);a.guardDelay=Math.max(0,a.guardDelay-dt);
   if(a.guarding){a.guard=Math.max(0,a.guard-8*dt);if(a.guard===0)this.breakGuard(a,null)}else if(a.guardDelay<=0)a.guard=Math.min(a.maxGuard,a.guard+18*dt);
   a.knockdown=Math.max(0,a.knockdown-dt);a.recovery=Math.max(0,a.recovery-dt);a.charmed=Math.max(0,a.charmed-dt);
   if(wasDown&&a.knockdown===0){a.recovery=3;a.invuln=3+dt;a.state='idle';this.emit('recover',{actor:a,duration:3})}
   a.stateT+=dt;a.invuln=Math.max(0,a.invuln-dt);a.stun=Math.max(0,a.stun-dt);a.energy=clamp(a.energy+dt*1.3,0,100);
   for(const k in a.cooldowns)a.cooldowns[k]=Math.max(0,a.cooldowns[k]-dt);
   a.moving=false;if(a.heldBy){a.state='held';continue}this.tryJump(a);a.jumpBuffer=Math.max(0,a.jumpBuffer-dt);
   if(a.y>0||a.vy>0){const wasAir=a.y>0;a.y=Math.max(0,a.y+a.vy*dt);a.vy-=1650*dt;
    // Launched opponents stay within a normal jump's melee reach. At the
    // juggle ceiling cancel upward velocity so every re-lift visibly falls.
    if(a.juggleHits>0&&a.y>=300){a.y=300;a.vy=Math.min(0,a.vy)}
    if(a.y===0){a.vy=0;if(wasAir){if(a.pounceVisual?.phase==='flight'){a.pounceVisual.phase='impact';a.pounceVisual.phaseAge=0;a.pounceVisual.impactAge=0}const airborne=a.juggleHits>0;a.juggleHits=0;this.emit('land',{actor:a,airborne,skill:a.action?.skill})}}}
   if(a.knockdown>0){a.state='knockdown';continue}
   if(a.charmed>0){a.state='charmed';continue}
   if(a.stun>0){a.state='hurt';continue}
   if(a.action){const z=a.action;z.t+=dt;
    if(SPECIALS[z.type])this.specialStep(a,z,dt);
    if(z.type==='dash'){a.x+=a.face*780*dt;a.moving=true}
    if(z.type==='attack'&&z.t>=.16&&!z.hit){z.hit=true;const o=a===p?e:p,reach=136+z.chain*12;this.emit('slash',{actor:a,chain:z.chain});if(Math.abs(o.x-a.x)<reach&&Math.abs(o.y-a.y)<105&&(o.x-a.x)*a.face>-20)this.hit(o,14+z.chain*5,a,28+z.chain*13,{launch:z.chain===2})}
    if(z.type==='skill'&&z.t>=.23&&!z.hit){z.hit=true;this.projectiles.push({x:a.x+a.face*60,y:a.y+85,vx:a.face*620,owner:a,life:2.5,id:this.nextId++});this.emit('cast',{actor:a})}
    if(z.type==='ultimate'&&z.t>=.39&&!z.hit){z.hit=true;const o=a===p?e:p;this.emit('burst',{actor:a});if(Math.abs(o.x-a.x)<620&&Math.abs(o.y-a.y)<280)this.hit(o,62,a,90,{launch:true})}
    if(z.t>=z.duration){this.releaseHold(a);a.action=null;}
   }else if(a.y>0)a.state='airborne';else a.state=a.guarding?'guard':'idle';
  }
  // Full air steering is preserved during attacks; dash uses its own impulse.
  if(!p.guarding&&!p.heldBy&&p.rooted<=0&&p.stun<=0&&p.knockdown<=0&&p.charmed<=0&&(!p.action||(p.y>0&&p.action.type!=='dash'&&p.action.skill!=='pounce'))){
   const dir=(input.right?1:0)-(input.left?1:0);
   if(dir){p.x+=dir*(p.y>0?370:RUN_SPEED)*dt;p.face=dir;p.moving=true;if(!p.y&&!p.action)p.state='run'}else p.face=e.x>p.x?1:-1;
  }
  this.aiTime-=dt;
  if(!e.action&&!e.guarding&&!e.heldBy&&e.stun<=0&&e.knockdown<=0&&e.charmed<=0){
   e.face=p.x>e.x?1:-1;const distance=Math.abs(e.x-p.x);
   if(e.rooted<=0&&distance>116&&!e.pending){e.x+=e.face*(distance>500?225:160)*dt;e.state=e.y>0?'jump':'run';e.moving=true}
   if(this.aiTime<=0&&!e.pending){if(this.t>6&&Math.random()<.24&&distance<300){const available=['launch','roar','charm'].filter(k=>e.cooldowns[k]<=0&&distance<specialFor(e.kind,k).range);e.pending=available[Math.floor(Math.random()*available.length)]||'attack';this.aiTime=.8}else if(e.energy>=100&&distance<550){e.pending='ultimate';this.aiTime=.65}else if(distance<145){e.pending='attack';this.aiTime=.48}else{e.pending='skill';this.aiTime=.6}this.emit('telegraph',{actor:e})}
   if(e.pending&&this.aiTime<.05){this.action(e,e.pending);e.pending=null;this.aiTime=1.0+Math.random()*.7}
  }
  for(const owner of[p,e])if(owner.holding){const held=owner.holding;held.x=clamp(owner.x+owner.face*62,ARENA.left,ARENA.right);held.y=45;held.vy=0;held.state='held'}
  this.resolveBodies();
  for(const z of this.projectiles){z.x+=z.vx*dt;z.life-=dt;const o=z.owner===p?e:p;if(Math.abs(z.x-o.x)<43&&Math.abs(z.y-(o.y+85))<90){if(this.hit(o,23,z.owner,50))z.life=0}if(z.x<20||z.x>1580)z.life=0}
  this.projectiles=this.projectiles.filter(x=>x.life>0);
 }
}
