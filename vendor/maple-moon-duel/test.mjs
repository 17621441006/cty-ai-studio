import assert from 'node:assert/strict';import{Duel,specialFor}from'../../public/games/maple-moon-duel/core.mjs';
let d=new Duel();d.start();d.enemy.x=530;d.action(d.player,'attack');for(let i=0;i<30;i++)d.step(1/60);assert(d.enemy.hp<d.enemy.maxHp);assert(d.player.energy>35);
let hp=d.enemy.hp;d.player.cooldowns.skill=0;d.action(d.player,'skill');for(let i=0;i<60;i++)d.step(1/60);assert(d.enemy.hp<hp);
d.player.action=null;d.player.stun=0;d.player.energy=99;assert.equal(d.action(d.player,'ultimate'),false);d.player.energy=100;assert(d.action(d.player,'ultimate'));assert.equal(d.player.energy,0);
d=new Duel();d.start();let x=d.player.x;d.step(.03,{right:true});assert(d.player.x>x);assert(d.action(d.player,'jump'));for(let i=0;i<100;i++)d.step(1/60);assert.equal(d.player.y,0);
d=new Duel();d.start();for(let i=0;i<3600&&!d.ended;i++)d.step(1/60);assert(d.player.hp<d.player.maxHp,'AI must attack without input');assert(d.ended,'AI can finish fight');
d=new Duel();d.start();d.paused=true;d.step(.03,{right:true});assert.equal(d.player.x,430);assert.equal(d.time,180);console.log('Passed: melee, energy, ranged skill, ultimate gate, movement, jump landing, AI damage and victory, pause.');

// Deterministic corner-escape and collision regressions.
const oldRandom=Math.random;Math.random=()=>.5;
const inBounds=(duel,label)=>{for(const a of[duel.player,duel.enemy])assert(a.x>=100-1e-8&&a.x<=1500+1e-8,`${label}: ${a.kind} outside arena at ${a.x}`)};
for(const choice of['cat','xiaosi'])for(const side of['left','right']){
 const duel=new Duel(choice);duel.start();const direction=side==='left'?1:-1;
 duel.player.x=side==='left'?100:1500;duel.enemy.x=duel.player.x+direction*94;
 duel.player.face=direction;duel.enemy.face=-direction;
 assert(duel.action(duel.player,'jump'));let peak=0,crossed=false,landed=false;
 for(let i=0;i<90;i++){
  duel.step(1/60,{right:direction===1,left:direction===-1});peak=Math.max(peak,duel.player.y);
  if((duel.player.x-duel.enemy.x)*direction>30&&duel.player.y>78)crossed=true;
  if(i>30&&duel.player.y===0)landed=true;inBounds(duel,`${choice} ${side} live-AI jump`);
 }
 assert(crossed,`${choice} must cross live opponent from ${side} corner`);
 assert(peak>210,`${choice} must visibly clear opponent`);assert(landed,`${choice} must land`);
}
for(const side of['left','right']){
 const duel=new Duel();duel.start();duel.enemy.stun=100;
 duel.player.x=side==='left'?194:1406;duel.enemy.x=side==='left'?100:1500;
 for(let i=0;i<1000;i++){
  duel.step(1/60,{left:side==='left',right:side==='right'});inBounds(duel,'wall pressure');
  assert(Math.abs(duel.player.x-duel.enemy.x)>=94-1e-8,'grounded bodies must stay separated');
 }
 // Exact overlap at a wall is resolved without choosing an out-of-bounds escape.
 duel.player.x=duel.enemy.x=side==='left'?100:1500;duel.resolveBodies();inBounds(duel,'coincident wall spawn');
 assert(Math.abs(duel.player.x-duel.enemy.x)>=94-1e-8);
}
for(const side of['left','right']){
 const duel=new Duel();duel.start();const direction=side==='left'?1:-1;
 duel.player.x=side==='left'?100:1500;duel.enemy.x=duel.player.x+direction*94;
 duel.player.face=direction;duel.enemy.stun=100;
 assert(duel.action(duel.player,'dash'));
 for(let i=0;i<20;i++){duel.step(1/60);inBounds(duel,'dash escape')}
 assert((duel.player.x-duel.enemy.x)*direction>40,`dash must cross from ${side}`);
}
{
 const duel=new Duel();duel.start();duel.enemy.stun=100;
 duel.hit(duel.player,14,duel.enemy);assert(duel.action(duel.player,'jump'),'jump input accepted during stun');
 for(let i=0;i<24;i++)duel.step(1/60,{right:true});assert(duel.player.y>0,'buffered jump fires after stun');
}
{
 const duel=new Duel();duel.start();duel.hitstop=.105;
 duel.step(.2,{right:true});assert.equal(duel.hitstop,0,'hitstop consumes full real delta');
 assert(duel.player.x>430,'simulation resumes in remaining frame time');
}
Math.random=oldRandom;
console.log('Passed: cat/xiaosi live-AI left/right corner jump-over and landing; 2,000 wall-pressure frames; coincident wall separation; both-direction dash crossing; stun-buffered jump; real-time hitstop.');

// Double health, never damage: exact combat-value and reset regressions.
for(const choice of['cat','xiaosi']){
 const duel=new Duel(choice);duel.start();duel.enemy.stun=100;
 for(const a of[duel.player,duel.enemy]){assert.equal(a.hp,480);assert.equal(a.maxHp,480)}
 for(const damage of[14,19,24]){
  duel.enemy.x=duel.player.x+100;duel.player.face=1;
  const before=duel.enemy.hp;assert(duel.action(duel.player,'attack'));
  for(let i=0;i<33;i++)duel.step(1/60);
  assert.equal(before-duel.enemy.hp,damage,`${choice} chain damage must stay ${damage}`);
 }
 for(let i=0;i<90;i++)duel.step(1/60);
 duel.enemy.x=duel.player.x+100;let before=duel.enemy.hp;
 assert(duel.action(duel.player,'skill'));
 for(let i=0;i<48;i++)duel.step(1/60);
 assert.equal(before-duel.enemy.hp,23,`${choice} ranged damage remains 23`);
 duel.enemy.x=duel.player.x+100;duel.player.energy=100;before=duel.enemy.hp;
 assert(duel.action(duel.player,'ultimate'));assert.equal(duel.player.energy,0);
 for(let i=0;i<72;i++)duel.step(1/60);
 assert.equal(before-duel.enemy.hp,62,`${choice} ultimate damage remains 62`);
 duel.player.hp=1;duel.enemy.hp=2;duel.reset();
 assert.equal(duel.player.hp,480);assert.equal(duel.enemy.hp,480);
 assert.equal(duel.player.maxHp,480);assert.equal(duel.enemy.maxHp,480);
}
console.log('Passed: both characters have 480/480 HP, reset fully, exact chain 14/19/24, ranged 23 and ultimate 62 damage unchanged.');

// V4: I/O/P skills and bounded aerial-combo recovery. Simulation time excludes hitstop.
const advance=(duel,seconds,input={})=>{const end=duel.t+seconds;let guard=0;while(duel.t<end-1e-8&&!duel.ended&&guard++<10000)duel.step(Math.min(1/120,end-duel.t),input);assert(guard<10000)};
const quiet=(choice='cat')=>{const duel=new Duel(choice);duel.start();duel.aiTime=1000;duel.player.x=600;duel.enemy.x=730;return duel};
for(const choice of ['cat','xiaosi'])for(const key of ['roar','charm','launch']){
 const duel=quiet(choice),p=duel.player,e=duel.enemy,spec=specialFor(choice,key);
 if(spec.skill==='pounce'){e.x=990;e.stun=100}
 assert(duel.action(p,key));assert(!duel.action(p,key));assert.equal(p.action.skill,spec.skill);
 advance(duel,spec.duration+.03);
 assert(duel.events.some(v=>v.type==='special'&&v.skill===spec.skill&&v.kind===choice));
 const expected={roar:32,charm:0,pounce:26,love:27,cry:6,launch:18};assert.equal(480-e.hp,expected[spec.skill],`${choice} ${spec.skill} damage`);
 assert(!duel.action(p,key),'cooldown prevents repeat');advance(duel,p.cooldowns[key]+.02);assert(duel.action(p,key));
 duel.reset();for(const a of[duel.player,duel.enemy]){assert.equal(a.hp,480);assert.equal(a.guard,100);assert.equal(a.heldBy,null);assert.equal(a.holding,null);for(const field of ['rooted','juggleHits','knockdown','recovery','charmed'])assert.equal(a[field],0)}
}
for(const choice of ['cat','xiaosi'])for(const key of ['roar','charm','launch'])for(const position of ['far','behind','high']){
 const duel=quiet(choice);duel.enemy.stun=100;duel.player.x=300;duel.enemy.x=position==='far'?1450:position==='behind'?150:430;if(position==='high'){duel.enemy.y=900;duel.enemy.vy=1200}
 duel.action(duel.player,key);advance(duel,1.7);assert.equal(duel.enemy.hp,480,`${choice} ${key} cannot damage ${position}`);
}
for(const side of ['left','right']){
 const duel=quiet();const p=duel.player,e=duel.enemy;p.x=side==='left'?194:1406;e.x=side==='left'?100:1500;p.face=side==='left'?-1:1;
 for(let count=1;count<=30;count++){
  e.invuln=0;assert(duel.hit(e,1,p,45,{launch:count===1}));inBounds(duel,'air juggle wall');
  const event=duel.events.at(-1);assert.equal(event.type,'hit');assert(event.airborne);assert.equal(event.juggleHits,count);
  if(count<30){assert(e.y>0&&e.vy>=520);advance(duel,.025)}
 }
 assert.equal(e.hp,450);assert.equal(e.y,0);assert.equal(e.vy,0);assert.equal(e.state,'knockdown');assert.equal(e.juggleHits,0);
 assert(!duel.hit(e,1,p));assert(!duel.action(e,'launch'));
 advance(duel,.54);assert(e.knockdown>0);assert.equal(e.recovery,0);
 advance(duel,.02);assert.equal(e.knockdown,0);assert(e.recovery>2.98);assert(duel.events.some(v=>v.type==='recover'&&v.duration===3));
 const protectedFor=e.recovery;advance(duel,protectedFor-.01);assert(e.recovery>0);assert(!duel.hit(e,1,p));
 advance(duel,.02);assert.equal(e.recovery,0);assert.equal(e.invuln,0);assert(duel.hit(e,1,p),'protection ends, not infinite');
}
{
 const duel=quiet();const e=duel.enemy;assert(duel.hit(e,1,duel.player,0,{launch:true}));advance(duel,.14);const fallingVy=e.vy;e.invuln=0;assert(duel.hit(e,1,duel.player,0));assert(e.vy>=520&&e.vy>=fallingVy,'successive airborne hits re-lift');advance(duel,2);assert.equal(e.y,0);assert.equal(e.juggleHits,0);
}
{
 const random=Math.random;Math.random=()=>0;
 try{const duel=quiet();duel.t=7;duel.aiTime=0;duel.enemy.face=-1;advance(duel,1.5);assert(duel.events.some(v=>v.type==='special'&&v.actor===duel.enemy),'AI can use limited telegraphed specials');assert(duel.enemy.cooldowns.launch>0)}finally{Math.random=random}
}
console.log('Passed V4: both characters I/O/P, 4-pulse pressure, charm lock/release, launcher/gravity, exact cooldowns, range/direction/height misses, reset, both-wall 30-hit caps, .55s knockdown + exactly 3s finite protection, successive lift, telegraphed enemy specials.');

{const duel=quiet();duel.player.y=20;assert.equal(duel.action(duel.player,'charm'),false,'lie-down charm is grounded only');assert.equal(duel.player.cooldowns.charm,0)}
for(const kind of ['cat','xiaosi']){
 const duel=quiet(kind),p=duel.player,e=duel.enemy;e.stun=100;p.chain=1;p.lastAttack=0;
 assert(duel.action(p,'attack'));advance(duel,.2);assert.equal(e.hp,456);assert(e.y>0&&e.juggleHits===1,'third normal strike launches');
 advance(duel,1.4);p.energy=100;e.x=p.x+110;e.invuln=0;assert(duel.action(p,'ultimate'));advance(duel,.42);assert.equal(e.hp,394);assert(e.y>0&&e.juggleHits===1,'ultimate launches');
}
{
 const duel=quiet('xiaosi'),p=duel.player,e=duel.enemy;e.pending='attack';e.x=p.x+110;
 assert(duel.action(p,'launch'));advance(duel,.28);assert.equal(e.juggleHits,1);
 // Air-to-air normal hit, using the same range/gravity/action pipeline as play.
 advance(duel,.4);p.y=e.y;p.vy=e.vy;p.x=e.x-100;p.action=null;p.face=1;e.invuln=0;
 assert(duel.action(p,'attack'));advance(duel,.18);assert(e.juggleHits>=2,'normal air hit extends launched juggle');assert(e.vy>400);
}
console.log('Passed V4 follow-up: grounded-only charm; both J3 and U launch with unchanged damage; actual air-to-air J extends P juggle.');

{
 const duel=quiet(),p=duel.player,e=duel.enemy;assert(duel.hit(e,1,p,0,{launch:true}));
 for(let strike=0;strike<6;strike++){
  advance(duel,.3);assert(e.y<=300,'launched target has reachable 300px ceiling');
  // A normal jump peaks above 210px: at its apex every launched target
  // remains in the existing 105px melee height window, not an infinite lift.
  p.y=220;p.vy=0;p.x=e.x-100;p.face=1;p.action=null;p.cooldowns.attack=0;e.invuln=0;
  const hits=e.juggleHits;assert(duel.action(p,'attack'));advance(duel,.17);
  assert(e.juggleHits>hits,'repeated actual air normal attacks connect below ceiling');assert(e.y<=300);
 }
 advance(duel,2);assert.equal(e.y,0);assert.equal(e.juggleHits,0);
}
console.log('Passed: six successive normal-air hits stay within 300px juggle ceiling and fall/land afterward.');

{
 const duel=quiet();duel.action(duel.player,'jump');advance(duel,1.3);assert(duel.events.some(e=>e.type==='land'&&e.actor===duel.player&&e.airborne===false));
 duel.hit(duel.enemy,1,duel.player,0,{launch:true});advance(duel,1.5);assert(duel.events.some(e=>e.type==='land'&&e.actor===duel.enemy&&e.airborne===true));assert.equal(duel.enemy.recovery,0,'natural launched landing grants no three-second immunity');
}

// V5 defense: front skill/normal chip is real, rear/grabs are counters.
for(const choice of ['cat','xiaosi']){
 const duel=quiet(choice),p=duel.player,e=duel.enemy;p.face=1;e.face=-1;
 duel.step(.01,{guard:true});assert(p.guarding);const startX=p.x;advance(duel,.1,{guard:true,right:true});assert.equal(p.x,startX);assert(!duel.action(p,'attack'));assert(!duel.action(p,'skill'));
 assert(duel.hit(p,50,e,40,{launch:true}));assert.equal(p.hp,470);assert.equal(p.y,0);assert.equal(p.juggleHits,0);assert(p.guard<55);
 const ev=duel.events.filter(x=>x.type==='hit').at(-1);assert.equal(ev.damage,10);assert.equal(ev.blocked,true);assert.equal(duel.events.filter(x=>x.type==='block').at(-1).prevented,40);
 advance(duel,.15,{guard:true});assert(duel.hit(p,0,e,0,{charm:true}));assert.equal(p.charmed,0);
 advance(duel,.15,{guard:true});e.x=p.x-100;e.face=1;assert(duel.hit(p,20,e));assert.equal(p.hp,450,'rear bypasses guard');assert(!duel.events.filter(x=>x.type==='hit').at(-1).blocked);
 advance(duel,.3);assert(!p.guarding);assert(duel.action(p,'attack'),'release guard permits attack');
}
{
 const duel=quiet(),p=duel.player,e=duel.enemy;p.face=1;e.face=-1;duel.step(.01,{guard:true});
 for(let i=0;i<3;i++){p.invuln=0;assert(duel.hit(p,50,e));}
 assert.equal(p.guard,0);assert(p.guardBreak>0);assert(!p.guarding);assert(p.stun>0);assert(duel.events.some(v=>v.type==='guardbreak'));
 advance(duel,1.5,{guard:true});assert(!p.guarding,'broken guard requires minimum stamina before rearm');advance(duel,1);assert(p.guard>15,'guard regens on release');
 p.guard=1;p.guarding=true;advance(duel,.2,{guard:true});assert(p.guardBreak>0,'holding guard has finite passive stamina');
}
{
 const duel=quiet('xiaosi'),p=duel.player,e=duel.enemy;e.pending='attack';e.guarding=true;
 assert(duel.action(p,'roar'));advance(duel,.12);assert.equal(e.heldBy,null,'close grab keeps brief counterplay startup');advance(duel,.04);assert.equal(e.heldBy,p);assert.equal(p.holding,e);assert.equal(e.state,'held');assert.equal(e.x,p.x+p.face*62);assert.equal(e.y,45);assert(!duel.action(e,'attack'));assert.equal(e.hp,480,'faster capture does not frontload the unchanged damage ticks');assert.equal(p.action.duration,1.65,'capture startup does not alter action duration');
 advance(duel,1.5);assert.equal(e.hp,453);assert.equal(e.heldBy,null);assert.equal(p.holding,null);assert.equal(e.y,0);assert.equal(duel.events.filter(v=>v.type==='special'&&v.skill==='love'&&v.phase==='tick').length,3);
}
// A prompt grab still respects its .14s startup and invulnerable escape window.
{
 const duel=quiet('xiaosi'),p=duel.player,e=duel.enemy;e.pending='attack';
 duel.action(p,'roar');advance(duel,.1);e.invuln=.2;advance(duel,.08);
 assert.equal(e.heldBy,null,'startup dash/jump invulnerability can evade prompt capture');
}
for(const mode of ['interrupt','ko','reset','immune']){
 const duel=quiet('xiaosi'),p=duel.player,e=duel.enemy;e.pending='attack';
 if(mode==='immune')e.recovery=3;
 duel.action(p,'roar');advance(duel,.43);
 if(mode==='immune'){assert.equal(p.holding,null);assert.equal(e.heldBy,null);continue}
 assert.equal(e.heldBy,p);
 if(mode==='interrupt'){p.invuln=0;duel.hit(p,14,e);assert.equal(p.action,null)}
 if(mode==='ko'){e.invuln=0;e.hp=1;duel.hit(e,9,p,0,{holdTick:true,bypassGuard:true});assert(duel.ended);assert.equal(duel.events.filter(v=>v.type==='hit').at(-1).damage,1,'overkill event reports actual HP lost')}
 if(mode==='reset')duel.reset();
 assert.equal(p.holding,null,`${mode} releases owner`);assert.equal(e.heldBy,null,`${mode} releases target`);
}
{
 // Rooted target retains defense and attacks, unlike charm or a grab.
 const duel=quiet('cat'),p=duel.player,e=duel.enemy;e.face=-1;assert(duel.action(e,'charm'));advance(duel,.27);assert(p.rooted>0);assert.equal(p.stun,0);const x=p.x;
 advance(duel,.1,{left:true});assert.equal(p.x,x);duel.step(.01,{guard:true});assert(p.guarding);duel.step(.01);assert(duel.action(p,'attack'));advance(duel,.45);assert(p.rooted>0);assert(!duel.action(p,'dash'));advance(duel,1.1);assert.equal(p.rooted,0);
}
for(const side of ['left','right']){
 const duel=quiet(),p=duel.player,e=duel.enemy;p.x=side==='left'?110:1490;p.face=side==='left'?-1:1;e.x=800;e.stun=100;
 duel.action(p,'launch');let peak=0;for(let i=0;i<180;i++){duel.step(1/120);peak=Math.max(peak,p.y);inBounds(duel,'pounce corner')}
 assert(peak>120);assert.equal(p.y,0);assert(duel.events.some(v=>v.type==='land'&&v.skill==='pounce'));assert.equal(p.action,null);
}
console.log('Passed V5: per-character skills, guard chip/rear/break/drain/regen, love three ticks/follow/release/interrupt/KO/reset/immunity, rooted defense/attack, pounce landing/bounds, actual overkill damage.');
{
 const duel=quiet('cat'),p=duel.player,e=duel.enemy;e.face=-1;p.face=1;
 duel.action(e,'roar');advance(duel,.41,{guard:true});assert.equal(p.heldBy,e,'love captures actively held frontal guard');assert(!p.guarding);advance(duel,1.2,{guard:true});assert.equal(p.hp,453,'grab ticks bypass guard');assert.equal(p.heldBy,null);
}
{
 const duel=quiet('cat'),p=duel.player,e=duel.enemy;e.face=-1;p.face=1;duel.action(e,'charm');advance(duel,.3,{guard:true});assert.equal(p.rooted,0,'guard blocks cry root');assert.equal(p.hp,479,'cry only deals rounded chip when guarded');
}
{
 const duel=quiet('xiaosi'),p=duel.player,e=duel.enemy;e.pending='attack';duel.action(p,'roar');advance(duel,.43);assert(p.holding);duel.time=.001;duel.step(.02);assert(duel.ended);assert.equal(p.holding,null);assert.equal(e.heldBy,null);assert.equal(e.y,0,'timeout releases held target to ground');
}

for(const distance of [100,130,250,390]){
 const duel=quiet(),p=duel.player,e=duel.enemy;e.x=p.x+distance;e.stun=100;duel.action(p,'launch');advance(duel,1.25);assert.equal(e.hp,454,`pounce lands on opponent at ${distance}px rather than overshooting`);assert.equal(p.y,0);
}

// V5.1 visual-only lifecycle survives hit-cancel, without changing combat.
for(const face of [1,-1])for(const interrupted of [false,true]){
 const duel=quiet(),p=duel.player,e=duel.enemy;p.x=800;p.face=face;e.x=800+face*300;e.stun=100;
 assert(duel.action(p,'launch'));assert.equal(p.pounceVisual.phase,'charge');advance(duel,.34);
 assert.equal(p.pounceVisual.phase,'flight');assert(p.pounceVisual.flightAge>.14);assert(p.y>0);const age=p.pounceVisual.age;
 if(interrupted){p.invuln=0;duel.hit(p,14,e,0);assert.equal(p.action,null);assert(p.pounceVisual.interrupted);assert.equal(p.pounceVisual.age,age)}
 let guard=0;while(p.y>0&&guard++<300){duel.step(1/120);assert(p.pounceVisual,'visual marker survives whole flight');inBounds(duel,'pounce visual flight')}
 assert(guard<300);assert.equal(p.pounceVisual.phase,'impact');assert.equal(p.pounceVisual.impactAge,0);
 advance(duel,.21);assert.equal(p.pounceVisual.phase,'impact','full-sized impact can hold .2s');advance(duel,.15);assert.equal(p.pounceVisual,null,'visual clears .35s after actual landing');
 assert.equal(e.hp,interrupted?480:454,'visual does not restore canceled landing damage');
 // Next cast receives a fresh clock, without stale pose or growth state.
 advance(duel,p.cooldowns.launch+.02);p.x=800;p.face=face;e.x=800+face*300;e.stun=100;p.action=null;
 assert(duel.action(p,'launch'));assert.equal(p.pounceVisual.age,0);assert(!p.pounceVisual.interrupted);assert.equal(p.pounceVisual.phase,'charge');
}
for(const mode of ['charge-interrupt','reset','ko','timeout','combo-cap']){
 const duel=quiet(),p=duel.player,e=duel.enemy;duel.action(p,'launch');advance(duel,mode==='charge-interrupt'?.1:.34);
 if(mode==='charge-interrupt'){duel.hit(p,14,e,0);assert.equal(p.pounceVisual,null)}
 if(mode==='reset'){duel.reset();assert.equal(p.pounceVisual,null);assert.equal(duel.player.pounceVisual,null);assert.equal(duel.enemy.pounceVisual,null)}
 if(mode==='ko'){p.invuln=0;p.hp=1;duel.hit(p,14,e,0);assert(duel.ended);assert.equal(p.pounceVisual,null);assert.equal(e.pounceVisual,null)}
 if(mode==='timeout'){duel.time=.001;duel.step(.02);assert(duel.ended);assert.equal(p.pounceVisual,null)}
 if(mode==='combo-cap'){for(let i=0;i<30;i++){p.invuln=0;duel.hit(p,1,e,0)}assert.equal(p.pounceVisual.phase,'impact');advance(duel,.36);assert.equal(p.pounceVisual,null,'forced grounding cannot leave perpetual flight marker')}
}
console.log('Passed V5.1: both-face full/interrupted pounce visual flight + .35s actual-land lifetime, fresh repeat, charge cancel, reset, KO, timeout, forced grounding; damage unchanged.');
