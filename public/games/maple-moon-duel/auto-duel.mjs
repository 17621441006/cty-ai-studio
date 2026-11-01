import {Duel,ARENA,RUN_SPEED,clamp,specialFor} from './core.mjs';

/** A disclosed, deterministic choreographed exhibition with top-tier combat tactics.
 * No HP writes, altered damage, invulnerability grants or forced end events.
 * Both actors use Duel.action / Duel.hit; a fixed tick makes playback portable.
 * Supports both 'bear' (弗雷迪 vs 小司) and 'cat' (脏脏包 vs 小司) showcases,
 * finishing under 60 seconds with Xiaosi winning.
 */
export const COMBAT_RATE=.94;
export const SHOWCASE_LABEL='编排演武 · 小司获胜';
export class AutoDuel extends Duel {
 constructor(challenger='cat'){super(challenger,'xiaosi')}
 reset(){
  super.reset();this.accumulator=0;this.elapsed=0;this.showcase=true;this.actionLog=[];
  this.legacyAirRule=this.choice==='cat';
  this.rate=this.choice==='bear'?1.20:COMBAT_RATE;
  this.directors=this.choice==='bear'
   ?{
    bear:{next:.22,move:0,lastJump:-10,lastDash:-10,airDir:0,airUntil:0,footDir:0,footUntil:0},
    xiaosi:{next:.12,move:0,lastJump:-10,lastDash:-10,airDir:0,airUntil:0,footDir:0,footUntil:0}
   }
   :{
    cat:{next:0,move:0,lastJump:-10,lastDash:-10,airDir:0,airUntil:0,footDir:0,footUntil:0},
    xiaosi:{next:.4,move:0,lastJump:-10,lastDash:-10,airDir:0,airUntil:0,footDir:0,footUntil:0}
   };
 }
 action(actor,type){const ok=super.action(actor,type);if(ok&&this.actionLog)this.actionLog.push({t:this.t,kind:actor.kind,type,skill:actor.action?.skill});return ok}
 step(realDt){
  if(!this.started||this.paused||this.ended)return;
  const dt=Number(realDt);if(!Number.isFinite(dt)||dt<=0)return;
  const rate=this.rate||COMBAT_RATE;
  this.accumulator+=Math.min(dt,2)*rate;
  while(this.accumulator+1e-10>=1/120&&!this.ended){this.accumulator-=1/120;this.elapsed+=1/(120*rate);this.tick()}
 }
 free(a){return !a.heldBy&&a.stun<=0&&a.charmed<=0&&a.knockdown<=0}
 plan(a,o){
  if(this.choice==='bear')return this.planBear(a,o);
  const b=this.directors[a.kind],distance=Math.abs(a.x-o.x),direction=o.x>a.x?1:-1;
  if(!a.action&&this.free(a))a.face=direction;
  const defending=a.kind==='cat'?(this.t%8>4.2&&this.t%8<5.5&&!!o.action&&o.action.skill!=='love'):(this.t>6&&this.t%5<.65&&!!o.action);
  const input={guard:defending,left:false,right:false};
  if(!this.free(a))return input;
  if(!a.action&&!defending&&this.t>=b.next){
   let type;
   if(a.energy>=100&&distance<510)type='ultimate';
   else if(a.kind==='xiaosi'&&a.y===0&&o.y<50&&distance<145&&a.cooldowns.roar<=0)type='roar';
   else if(a.chain<2&&this.t-a.lastAttack<.95&&distance<155)type='attack';
   else if(this.t>3&&this.t-b.lastDash>9&&distance>100&&distance<450){type='dash';b.lastDash=this.t}
   else if(this.t>5&&this.t-b.lastJump>11&&distance<180){type='jump';b.lastJump=this.t;b.airDir=direction;b.airUntil=this.t+1.05}
   else {
    const sequence=a.kind==='cat'?['launch','roar','attack','attack','attack','charm','skill']:['charm','attack','attack','attack','roar','launch','skill'];
    for(let tries=0;tries<sequence.length;tries++){
     const candidate=sequence[b.move%sequence.length];b.move++;
     const range=candidate==='attack'?150:candidate==='skill'?650:specialFor(a.kind,candidate).range+(candidate==='launch'&&a.kind==='cat'?220:0);
     if(a.cooldowns[candidate]<=0&&distance<range&&!(a.y>0&&(candidate==='charm'||(a.kind==='xiaosi'&&candidate==='roar')||(a.kind==='cat'&&candidate==='launch')))){type=candidate;break}
    }
   }
   if(type&&this.action(a,type))b.next=this.t+(type==='attack'&&a.chain<2?.44:(a.action?.duration||.45)+(a.kind==='cat'?.65:.48));
  }
  if(!defending&&a.rooted<=0){
   let move=0;
   if(a.y>0&&this.t<b.airUntil)move=b.airDir;
   else if(this.t>=b.footUntil){
    const recovering=this.t<b.next-.18;
    const desired=recovering?(a.kind==='cat'?185:225):112;
    move=distance<desired-12?-direction:distance>desired+12?direction:(Math.sin(this.t*3+(a.kind==='cat'?0:2))>0?direction:-direction);
    if(a.x<ARENA.left+85&&move<0||a.x>ARENA.right-85&&move>0)move=direction;
    b.footDir=move;b.footUntil=this.t+.20;
   }else move=b.footDir;
   input.left=move<0;input.right=move>0;
  }
  return input;
 }
 planBear(a,o){
  const b=this.directors[a.kind]||this.directors.bear,distance=Math.abs(a.x-o.x),direction=o.x>a.x?1:-1;
  // Elite tactical reaction: if knocked airborne (juggled) and 30s Air-Escape is ready, trigger Spacebar float escape!
  if(a.y>0&&a.juggleHits>0&&!a.heldBy&&a.knockdown<=0&&a.cooldowns.airEscape<=0){
   if(a.kind==='xiaosi'||(a.juggleHits>=2&&this.t>10)){
    this.action(a,'jump');
    return {guard:false,left:false,right:false};
   }
  }
  if(!a.action&&this.free(a))a.face=direction;
  const isChallenger=a.kind!=='xiaosi';
  const defending=isChallenger
   ?(this.t%8.2>4.8&&this.t%8.2<5.6&&!!o.action&&o.action.skill!=='love')
   :((this.t>3.5&&this.t%4.2<.85&&!!o.action&&o.action.skill!=='jumpscare')||(a.hp<140&&!!o.action&&distance<220&&o.action.t<.32));
  const input={guard:defending,left:false,right:false};
  if(!this.free(a))return input;
  if(a.y>0&&(a.juggleHits>0||a.airEscaped))return input;
  if(!a.action&&!defending&&this.t>=b.next){
   let type;
   if(a.energy>=100&&distance<510)type='ultimate';
   else if(a.kind==='xiaosi'&&a.y===0&&o.y<50&&distance<145&&a.cooldowns.roar<=0)type='roar';
   else if(a.chain<2&&this.t-a.lastAttack<.95&&distance<160)type='attack';
   else if(this.t>2.2&&this.t-b.lastDash>(isChallenger?8.5:5.8)&&distance>115&&distance<460){type='dash';b.lastDash=this.t}
   else if(this.t>4.5&&this.t-b.lastJump>11.5&&distance<185){type='jump';b.lastJump=this.t;b.airDir=direction;b.airUntil=this.t+1.0}
   else {
    const sequence=a.kind==='bear'
     ?['launch','roar','attack','attack','attack','charm','skill']
     :['charm','launch','attack','attack','attack','roar','skill'];
    for(let tries=0;tries<sequence.length;tries++){
     const candidate=sequence[b.move%sequence.length];b.move++;
     const spec=specialFor(a.kind,candidate);
     const range=candidate==='attack'?155:candidate==='skill'?650:(spec?spec.range:180)+(candidate==='launch'&&a.kind==='bear'?55:0);
     if(a.cooldowns[candidate]<=0&&distance<range&&!(a.y>0&&(candidate==='charm'||(a.kind==='xiaosi'&&candidate==='roar')))){type=candidate;break}
    }
   }
   const clutch=a.kind==='xiaosi'&&(a.hp<180||o.hp<160);
   const recGap=isChallenger?(a.hp<160?.82:.72):(clutch?.22:.32);
   if(type&&this.action(a,type))b.next=this.t+(type==='attack'&&a.chain<2?.34:(a.action?.duration||.45)+recGap);
  }
  if(!defending&&a.rooted<=0){
   let move=0;
   if(a.y>0&&this.t<b.airUntil)move=b.airDir;
   else if(this.t>=b.footUntil){
    const recovering=this.t<b.next-.16;
    const desired=recovering?(isChallenger?175:225):106;
    move=distance<desired-12?-direction:distance>desired+12?direction:(Math.sin(this.t*3.2+(isChallenger?0:2.1))>0?direction:-direction);
    if(a.x<ARENA.left+85&&move<0||a.x>ARENA.right-85&&move>0)move=direction;
    b.footDir=move;b.footUntil=this.t+.18;
   }else move=b.footDir;
   input.left=move<0;input.right=move>0;
  }
  return input;
 }
 tick(){
  const p=this.player,e=this.enemy;
  e.pending='showcase';this.aiTime=1e6;
  const input=this.hitstop>0?{}:this.plan(p,e),enemyInput=this.hitstop>0?{}:this.plan(e,p);
  const before=this.t;super.step(1/120,input);const dt=this.t-before;
  if(dt>0&&!this.ended&&this.free(e)&&!e.guarding&&e.rooted<=0&&(!e.action||(e.y>0&&e.action.type!=='dash'&&e.action.skill!=='pounce'))){
   const direction=(enemyInput.right?1:0)-(enemyInput.left?1:0);
   if(direction){e.x=clamp(e.x+direction*(e.y>0?370:RUN_SPEED)*dt,ARENA.left,ARENA.right);e.face=direction;e.moving=true;if(!e.action)e.state=e.y>0?'airborne':'run'}
  }
  this.resolveBodies();
 }
}
