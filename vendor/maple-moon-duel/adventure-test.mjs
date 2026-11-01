import assert from 'node:assert/strict';
import {Adventure,ADVENTURE_ARENA,ADVENTURE_SKILLS} from '../../public/games/maple-moon-duel/adventure-core.mjs';
const advance=(d,time,input={})=>{for(let t=0;t<time&&!d.ended;t+=1/120)d.step(1/120,input)};
function isolated(){const d=new Adventure();d.start();for(const e of d.enemies){e.x=1450;e.depth=220;e.stun=999}d.player.x=500;d.player.depth=100;return d}
{
 const d=isolated(),p=d.player;d.step(.1,{right:true});assert(Math.abs(p.x-537)<1e-8);assert.equal(p.depth,100);
 d.step(.1,{down:true});assert(Math.abs(p.depth-123.5)<1e-8);assert(Math.abs(p.x-537)<1e-8,'depth input is independent of horizontal');
 for(let i=0;i<100;i++)d.step(.1,{left:true,up:true});assert.equal(p.x,80);assert.equal(p.depth,0);
 for(let i=0;i<100;i++)d.step(.1,{right:true,down:true});assert(p.x<=1520&&p.depth<=220);
 d.paused=true;const before=JSON.stringify([p.x,p.depth,d.t,d.elapsed]);d.step(1,{left:true});assert.equal(JSON.stringify([p.x,p.depth,d.t,d.elapsed]),before);assert(!d.action('attack'));
}
for(const depthDelta of [0,90]){
 const d=isolated(),e=d.enemies[0];e.x=610;e.depth=100+depthDelta;assert(d.action('J'));advance(d,.2);assert.equal(e.hp,depthDelta?48:29,'melee requires depth alignment');
}
{
 const d=isolated(),e=d.enemies[0];e.x=390;e.depth=100;d.action('attack');advance(d,.2);assert.equal(e.hp,48,'melee cannot hit behind facing');
}
for(const depthDelta of [0,90]){
 const d=isolated(),e=d.enemies[0];e.x=800;e.depth=100+depthDelta;d.action('K');advance(d,.7);assert.equal(e.hp,depthDelta?48:22,'projectile remains in its real depth lane');
}
for(const [key,expected]of[['I',48],['O',0],['P',40],['U',95]]){
 const d=isolated(),p=d.player,e=d.enemies[0];e.maxHp=e.hp=200;e.x=key==='P'?800:620;e.depth=100;p.energy=100;
 assert(d.action(key));assert(!d.action(key),'committed action cannot stack');advance(d,key==='O'?.3:1.4);
 assert.equal(e.hp,200-expected,`${key} real attack damage`);if(key==='O')assert(e.charmed>0);assert(!d.action(key),'cooldown or spent ultimate resource prevents immediate repeat');
}
{
 const d=isolated(),p=d.player,e=d.enemies[0];e.x=600;e.depth=100;e.face=-1;d.step(.01,{guard:true});assert(p.guarding);assert(!d.action('attack'));d.hit(p,30,e);assert.equal(p.hp,474);assert(d.events.some(e=>e.type==='block'));p.invuln=0;e.x=400;d.hit(p,30,e);assert.equal(p.hp,444,'rear hit bypasses guard');
}
for(const dodge of ['jump','dash','depth','none']){
 const d=isolated(),p=d.player,e=d.enemies[0];e.x=900;e.depth=180;e.face=-1;
 d.hazard(e,p.x,p.depth,90,20,.25,30,'slam');if(dodge==='jump')d.action('jump');if(dodge==='dash')d.action('dash');advance(d,.32,dodge==='depth'?{down:true}:{});
 assert.equal(p.hp,dodge==='none'?450:480,`${dodge} hazard resolution`);assert(d.events.some(v=>v.type==='hazard'&&v.phase==='impact'));
}
{
 const d=isolated(),e=d.enemies[0];d.hazard(e,500,100,100,60,.4,20,'claw');d.hit(e,19,d.player);assert(!d.hazards.some(h=>h.owner===e),'interrupt cancels uncommitted mob strike');
 const boss=d.actor('boss',600,100,420);d.enemies=[boss];d.hazard(boss,500,100,100,60,.4,20,'slam');boss.action={type:'slam',t:0,duration:1};d.hit(boss,19,d.player);assert(boss.action,'normal hit cannot erase boss telegraph');assert(d.hazards.length);boss.invuln=0;d.hit(boss,0,d.player,{charm:true});assert.equal(boss.action,null);assert.equal(d.hazards.length,0,'charm provides explicit boss interrupt counterplay');
}
{
 const d=new Adventure();d.start();d.spawnWave();assert.equal(d.enemies.length,3,'cannot double-spawn an active wave');
 for(let i=0;i<10000&&!d.ended;i++)d.step(1/120);
 assert(d.ended&&!d.won&&d.player.hp===0,'passive play naturally loses');d.reset();assert.equal(d.player.hp,480);assert(!d.started&&!d.ended);assert.equal(d.wave,0);assert.equal(d.enemies.length,0);assert.equal(d.hazards.length,0);d.start();assert.equal(d.wave,1);assert.equal(d.enemies.length,3);
}

// Complete-stage controller: ONLY standard movement inputs + action calls.
// No HP, position, cooldown, facing, wave or invulnerability writes.
function clearStage(dt){
 const d=new Adventure();d.start();let maxEnemies=0,wall=0;
 while(!d.ended&&wall<180){
  const p=d.player,e=d.enemies.slice().sort((a,b)=>(Math.abs(a.x-p.x)+Math.abs(a.depth-p.depth)*2)-(Math.abs(b.x-p.x)+Math.abs(b.depth-p.depth)*2))[0];let input={};
  if(e){const dx=e.x-p.x,dz=e.depth-p.depth;input={left:dx<-105,right:dx>105,up:dz<-18,down:dz>18};
   const danger=d.hazards.find(h=>!h.fired&&h.delay-h.age<.48&&Math.abs(h.x-p.x)<h.rx+15&&Math.abs(h.depth-p.depth)<h.rd+15);
   if(danger){if(!p.action&&p.y===0)d.action('jump');if(p.y===0){input.up=p.depth>110;input.down=!input.up}}
   else if(!p.action&&!p.stun){
    if(Math.sign(dx)!==p.face){input.left=dx<0;input.right=dx>0}
    else if(p.energy>=100)d.action('ultimate');else if(Math.abs(dz)<42&&Math.abs(dx)<145)d.action('attack');else if(Math.abs(dz)<35&&Math.abs(dx)<600)d.action('skill');
   }
  }
  d.step(dt,input);wall+=dt;maxEnemies=Math.max(maxEnemies,d.enemies.length);assert(d.enemies.length<=ADVENTURE_ARENA.maxEnemies);for(const a of[d.player,...d.enemies])assert(a.x>=80&&a.x<=1520&&a.depth>=0&&a.depth<=220);
 }
 assert(d.ended&&d.won,'real-input controller can clear whole stage');assert.equal(d.defeated,16);assert.equal(d.wave,4);assert.equal(maxEnemies,7);assert.deepEqual(d.events.filter(e=>e.type==='wave').map(e=>e.count),[3,5,7,1]);
 assert.deepEqual(d.events.filter(e=>e.type==='bossphase').map(e=>e.phase),[2,3]);for(const skill of['claw','bolt','slam','sweep','storm'])assert(d.events.some(e=>e.type==='telegraph'&&e.skill===skill),`real stage includes ${skill}`);
 const damage=d.events.filter(e=>e.type==='hit'&&e.source===d.player).reduce((s,e)=>s+e.damage,0),totalHP=d.events.filter(e=>e.type==='spawn').reduce((s,e)=>s+e.actor.maxHp,0);assert.equal(damage,totalHP,'all enemy HP removed by real hit events');
 assert.equal(d.events.filter(e=>e.type==='end').length,1);const endTime=d.t;d.step(1);assert.equal(d.t,endTime);return{wall:+wall.toFixed(2),hp:d.player.hp,damage,maxEnemies,defeated:d.defeated};
}
console.log('Adventure passed: independent depth movement, depth hit/miss, all skills, guard/rear counter, jump/dash/depth hazard dodges, telegraph interrupt, walls, pause, spawn cap, loss/retry.');
console.log('Real-input full-stage clears:',[1/30,1/60,1/120].map(clearStage));

for(const edge of [150,1450]){
 const d=isolated(),b=d.actor('boss',edge,100,420);d.enemies=[b];d.wave=4;d.player.x=edge===150?80:1520;d.player.depth=100;b.think=100;advance(d,2);assert(b.x>=150&&b.x<=1450,'boss stays inside sprite-safe wall bounds');
}

{
 const d=isolated();d.action('launch');advance(d,.08);assert(d.player.pounceVisual);d.hit(d.player,9,d.enemies[0]);assert.equal(d.player.pounceVisual,null,'interrupted pre-leap marker is cleaned');
 d.player.invuln=0;d.player.hp=1;d.player.y=100;d.hit(d.player,9,d.enemies[0]);assert.equal(d.player.y,0);assert.equal(d.player.state,'knockdown');assert.equal(d.player.pounceVisual,null);
}
