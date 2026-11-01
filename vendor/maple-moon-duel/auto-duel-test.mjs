import assert from 'node:assert/strict';
import {AutoDuel,SHOWCASE_LABEL,COMBAT_RATE} from '../../public/games/maple-moon-duel/auto-duel.mjs';
import {Duel,RUN_SPEED} from '../../public/games/maple-moon-duel/core.mjs';
const kinds=['cat','xiaosi'];
const allMoves=['attack','skill','dash','jump','roar','charm','launch','ultimate'];
function fingerprint(d){return{t:d.t,elapsed:d.elapsed,hp:[d.player.hp,d.enemy.hp],log:d.actionLog,events:d.events.map(e=>({type:e.type,actor:e.actor?.kind,source:e.source?.kind,skill:e.skill,phase:e.phase,damage:e.damage,blocked:e.blocked,chain:e.chain,won:e.won}))}}
function run(pattern,{duel=new AutoDuel(),pause=false,drain=false}={}){
 const d=duel;d.start();const totals={cat:0,xiaosi:0},counts={cat:{},xiaosi:{}},record=[];let wall=0,frame=0,seen=0,pauseDone=false;
 const health={cat:480,xiaosi:480};
 while(!d.ended&&wall<100){
  const dt=pattern[frame++%pattern.length];
  if(pause&&!pauseDone&&wall>4){
   const before=JSON.stringify(fingerprint(d)),acc=d.accumulator;d.paused=true;for(let i=0;i<20;i++)d.step(.1);
   assert.equal(JSON.stringify(fingerprint(d)),before,'pause freezes fight and decisions');assert.equal(d.accumulator,acc);d.paused=false;pauseDone=true;
  }
  d.step(dt);wall+=dt;
  for(const a of[d.player,d.enemy]){assert(a.x>=100-1e-8&&a.x<=1500+1e-8);assert(Number.isFinite(a.y)&&a.y>=0);assert.equal(a.maxHp,480)}
  const events=d.events.slice(seen);
  for(const e of events){record.push(e);if(e.type==='hit'){health[e.actor.kind]-=e.damage;totals[e.source.kind]+=e.damage;counts[e.source.kind].hits=(counts[e.source.kind].hits||0)+1}if(e.type==='block')counts[e.actor.kind].blocks=(counts[e.actor.kind].blocks||0)+1}
  // Audits every health change against real damage events, including overkill.
  assert.equal(d.player.hp,health.cat,'cat HP only changes through hit events');assert.equal(d.enemy.hp,health.xiaosi,'Xiaosi HP only changes through hit events');
  seen=d.events.length;if(drain){d.events.length=0;seen=0}
 }
 assert(d.ended,'showcase ends in bounded time');assert.equal(COMBAT_RATE,.94);assert(Math.abs(d.elapsed*COMBAT_RATE-5508/120)<1e-8,'slowed presentation preserves all5508 V10 combat ticks');assert(d.elapsed+3<60,'real combat plus real3s breathing finale fits60s');assert(wall+3+.8<60,'sampled frame-end plus3s finale and.8s entry fits60s');assert(d.elapsed>=45&&d.elapsed<60,'elapsed includes hitstop and excludes pause');assert(d.elapsed>d.t+2,'elapsed accounts for cinematic hitstop');assert(Math.abs(wall-d.elapsed)<Math.max(...pattern)+1e-8);assert(wall>=45&&wall<60,'showcase completes below60 seconds including hitstop');
 assert.equal(d.player.kind,'cat');assert.equal(d.enemy.kind,'xiaosi');assert.equal(d.player.hp,0);assert.equal(d.enemy.hp,209);
 const ends=record.filter(e=>e.type==='end');assert.equal(ends.length,1);assert.equal(ends[0].won,false);assert(d.time>100,'KO, not a round timer decision');
 assert.equal(record.filter(e=>e.type==='hit').at(-1).actor.kind,'cat','final actual strike knocks out cat');
 assert.equal(totals.cat,271);assert.equal(totals.xiaosi,480);
 for(const kind of kinds){
  const moves=d.actionLog.filter(e=>e.kind===kind);for(const move of allMoves)assert(moves.some(e=>e.type===move),`${kind} performs ${move}`);
  assert(moves.length>=30,'both fighters actively perform dozens of moves');assert(!moves.some(e=>e.type==='showcase'),'sentinel never reaches action dispatch');
  assert(record.some(e=>e.type==='jump'&&e.actor.kind===kind),'actual jump, not only a queued input');
  assert(record.some(e=>e.type==='slash'&&e.chain===2&&e.actor.kind===kind),'both finish a real normal three-hit chain');
  assert(counts[kind].hits>=20);assert(counts[kind].blocks>=1,'both successfully defend');
 }
 return {d,wall,totals,counts,record};
}
assert(SHOWCASE_LABEL.includes('编排'),'exhibition disclosure available to UI');
// The inherited random enemy decision tree must never execute in the showcase.
const random=Math.random;Math.random=()=>{throw Error('showcase must not use uncontrolled RNG')};
try{
 const baseline=run([1/60]);const reference=fingerprint(baseline.d);
 for(const pattern of [[1/30],[1/144],[.05,1/144,.009,.033,.1],[.25,1/60],[.1],[.5],[2]]){
  const result=run(pattern);assert.deepEqual(fingerprint(result.d),reference,'fixed ticks preserve exact winner, actions and hit timeline across frame rates');
 }
 const paused=run([1/60],{pause:true});assert.deepEqual(fingerprint(paused.d),reference,'pause/resume preserves deterministic timeline');
 const streamed=run([1/60],{drain:true});assert.deepEqual(streamed.d.actionLog,baseline.d.actionLog,'UI draining events does not alter choreography');
 baseline.d.reset();assert(!baseline.d.started);assert(!baseline.d.ended);assert.equal(baseline.d.accumulator,0);assert.equal(baseline.d.elapsed,0);assert.equal(baseline.d.actionLog.length,0);assert.equal(baseline.d.player.hp,480);assert.equal(baseline.d.enemy.hp,480);
 const replay=run([1/60],{duel:baseline.d});assert.deepEqual(fingerprint(replay.d),reference,'reset replays exact choreography');
 const invalid=new AutoDuel();invalid.start();for(const dt of [0,-1,NaN,Infinity])invalid.step(dt);assert.equal(invalid.t,0);
 console.log(JSON.stringify({passed:true,seconds:+replay.wall.toFixed(3),activeRealSeconds:replay.d.elapsed,withThreeSecondFinale:replay.d.elapsed+3,combatRate:COMBAT_RATE,simulation:replay.d.t,winner:'xiaosi',remainingHp:replay.d.enemy.hp,damage:replay.totals,counters:replay.counts,moves:Object.fromEntries(kinds.map(k=>[k,replay.d.actionLog.filter(e=>e.kind===k).reduce((out,e)=>(out[e.type]=(out[e.type]||0)+1,out),{})])),verified:'8 frame schedules (including100/500/2000ms); pause; event draining; reset replay; real HP ledger; no RNG; both active with all moves and combinations'},null,2));
}finally{Math.random=random}
assert.equal(RUN_SPEED,400);const manual=new Duel();manual.start();manual.enemy.stun=100;const x=manual.player.x;manual.step(.02,{right:true});assert.equal(manual.player.x-x,8,'manual normal speed is 400px/s');

// V7 quantitative footwork regression at the same fixed simulation resolution.
{
 const d=new AutoDuel();d.start();let wall=0,idle=0,maxIdle=0,crossings=0,lastOrder=1;
 const spacing=[0,0,0,0],metrics=Object.fromEntries(kinds.map(k=>[k,{moving:0,voluntary:0,retreat:0,eligible:0,idle:0,blocked:0,travel:0}]));
 while(!d.ended&&wall<60){
  const p=d.player,e=d.enemy,px=p.x,ex=e.x,py=p.y,ey=e.y,before=d.t;
  d.step(1/120);wall+=1/120;const dt=d.t-before;if(dt<=0)continue;
  const distance=Math.abs(e.x-p.x);spacing[distance<145?0:distance<260?1:distance<430?2:3]+=dt;
  const order=Math.sign(e.x-p.x);if(order!==lastOrder){crossings++;lastOrder=order}
  let bothIdle=true;
  for(const[a,x,otherX,y]of[[p,px,ex,py],[e,ex,px,ey]]){
   const m=metrics[a.kind],dx=a.x-x;m.travel+=Math.abs(dx);
   if(Math.abs(dx)>.1){m.moving+=dt;if(a.moving)m.voluntary+=dt}
   if(a.moving&&dx*Math.sign(otherX-x)<-.1)m.retreat+=dt;
   const eligible=!a.action&&!a.heldBy&&a.stun<=0&&a.charmed<=0&&a.knockdown<=0&&!a.guarding&&a.rooted<=0;
   const still=Math.abs(dx)<.1&&Math.abs(a.y-y)<.1;
   if(eligible){m.eligible+=dt;if(still)m.idle+=dt}
   if(a.moving&&Math.abs(dx)<.1)m.blocked+=dt;
   bothIdle&&=eligible&&a.y===0&&still;
  }
  idle=distance<180&&bothIdle?idle+dt:0;maxIdle=Math.max(maxIdle,idle);
 }
 assert(d.ended&&wall<60);assert(maxIdle/COMBAT_RATE<.35,'no long mutual head-to-head idle waiting even on slowed real clock');assert(crossings>=6,'jump/dash offense repeatedly changes sides');
 assert(spacing[0]>10&&spacing[1]>10&&spacing[2]>2,'close combat, mid-range footwork and ranged spacing each occur');
 for(const k of kinds){const m=metrics[k];assert(m.moving/d.t>.4,`${k} actually translates for over40% of fight`);assert(m.voluntary/d.t>.3,`${k} movement is mostly intentional, not knockback`);assert(m.retreat>6,`${k} intentionally retreats/re-spaces`);assert(m.idle/m.eligible<.03,`${k} spends under3% actionable time idle`);assert(m.blocked/d.t<.03,`${k} does not fake movement by running in place`);assert(m.travel>4000,`${k} covers meaningful arena distance`)}
 console.log(JSON.stringify({V7Footwork:true,wall:+wall.toFixed(3),maxHeadToHeadIdle:maxIdle,crossings,spacingSeconds:spacing,metrics},null,2));
}

// Finale belongs to the UI real-time clock; ended combat never advances it.
{
 const d=new AutoDuel();d.start();d.step(1);assert(Math.abs(d.elapsed-1)<1/(120*COMBAT_RATE)+1e-8);assert(d.t<.95,'actual combat/physics clock is slowed, not just labels');
 while(!d.ended)d.step(.5);const finished=fingerprint(d);d.step(3);assert.deepEqual(fingerprint(d),finished,'three-second finale does not advance ended combat');
}
