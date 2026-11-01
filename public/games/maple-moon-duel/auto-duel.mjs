import {Duel,ARENA,RUN_SPEED,clamp,specialFor} from './core.mjs';

/** A disclosed, deterministic choreographed exhibition, not competitive AI.
 * No HP writes, altered damage, invulnerability grants or forced end events.
 * Both actors use Duel.action / Duel.hit; a fixed tick makes playback portable.
 */
// Presentation pacing only: all physics, inputs, damage and hitstop share this clock.
export const COMBAT_RATE=.94;
export const SHOWCASE_LABEL='编排演武 · 小司获胜';
export class AutoDuel extends Duel {
 constructor(){super('cat')}
 reset(){
  super.reset();this.accumulator=0;this.elapsed=0;this.showcase=true;this.actionLog=[];
  this.directors={cat:{next:0,move:0,lastJump:-10,lastDash:-10,airDir:0,airUntil:0,footDir:0,footUntil:0},xiaosi:{next:.4,move:0,lastJump:-10,lastDash:-10,airDir:0,airUntil:0,footDir:0,footUntil:0}};
 }
 action(actor,type){const ok=super.action(actor,type);if(ok&&this.actionLog)this.actionLog.push({t:this.t,kind:actor.kind,type,skill:actor.action?.skill});return ok}
 step(realDt){
  if(!this.started||this.paused||this.ended)return;
  const dt=Number(realDt);if(!Number.isFinite(dt)||dt<=0)return;
  this.accumulator+=Math.min(dt,2)*COMBAT_RATE;
  while(this.accumulator+1e-10>=1/120&&!this.ended){this.accumulator-=1/120;this.elapsed+=1/(120*COMBAT_RATE);this.tick()}
 }
 free(a){return !a.heldBy&&a.stun<=0&&a.charmed<=0&&a.knockdown<=0}
 plan(a,o){
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
   // V10: slightly tighter Xiaosi recovery spacing matches the shared .14s grab startup.
   if(type&&this.action(a,type))b.next=this.t+(type==='attack'&&a.chain<2?.44:(a.action?.duration||.45)+(a.kind==='cat'?.65:.48));
  }
  if(!defending&&a.rooted<=0){
   let move=0;
   if(a.y>0&&this.t<b.airUntil)move=b.airDir;
   else if(this.t>=b.footUntil){
    // Recovery is active footwork: make room, bait a whiff, then re-enter.
    // The actors use different distances and phases rather than marching in sync.
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
 tick(){
  const p=this.player,e=this.enemy;
  // Suppress only the inherited autonomous decision tree. Its physical body,
  // guard windows, timers, hit reactions and every attack remain unchanged.
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
