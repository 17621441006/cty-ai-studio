import assert from 'node:assert/strict';
import {MoveCallouts,MOVE_NAMES} from '../../public/games/maple-moon-duel/move-callouts.mjs';
const cat={kind:'cat',chain:0,guarding:false},xiaosi={kind:'xiaosi',chain:0,guarding:false};
const c=new MoveCallouts();
for(const actor of [cat,xiaosi]){
 for(const [type,key] of [['swing','J'],['charge','K'],['ultimate','U']]){
  c.reset();const v=c.feed({type,actor},1);assert.ok(v);assert.equal(v.key,key);assert.equal(v.kind,actor.kind);assert.ok(v.name);assert.ok(Object.isFrozen(v));
 }
 for(let chain=0;chain<3;chain++){c.reset();assert.equal(c.feed({type:'swing',actor,chain},0).name,MOVE_NAMES[actor.kind].attack[chain]);}
 const skills=actor===cat?['roar','charm','pounce']:['love','cry','launch'];
 skills.forEach((skill,i)=>{c.reset();const v=c.feed({type:'special',phase:'start',skill,actor},0);assert.equal(v.key,['I','O','P'][i]);assert.equal(v.category,'special');assert.equal(c.feed({type:'special',phase:'pulse',skill,actor},.1),null);assert.equal(c.feed({type:'special',phase:'hit',skill,actor},.2),null);});
}
c.reset();const e={type:'swing',actor:cat};c.feed(e,0);const id=c.snapshot(0).cat.id;assert.equal(c.feed(e,.1),null);assert.equal(c.snapshot(.1).cat.id,id);
c.feed({type:'ultimate',actor:xiaosi},.1);assert.equal(c.snapshot(.2).cat.id,id);assert.equal(c.snapshot(.2).xiaosi.key,'U');
c.feed({type:'charge',actor:cat},.25);assert.equal(c.snapshot(.25).cat.key,'K');assert.equal(c.snapshot(.25).xiaosi.key,'U');
assert.equal(c.snapshot(2).cat,null);assert.equal(c.snapshot(2).xiaosi,null);
c.reset();for(const type of['jump','dash','land','recover','block','guardbreak','idle']){assert.equal(c.feed({type,actor:cat},0),null);}cat.guarding=true;assert.equal(c.guard(cat,0),null);assert.deepEqual(c.snapshot(0),{cat:null,xiaosi:null,bear:null});
assert.equal(c.feed({type:'hit',actor:cat},0),null);assert.equal(c.feed({type:'swing',actor:{kind:'unknown'}},0),null);assert.equal(c.feed({type:'swing',actor:cat},NaN),null);
assert.throws(()=>{MOVE_NAMES.cat.attack[0]='changed';},TypeError);
console.log('move-callouts: action mappings, chains, dual lanes, identity dedupe, guard edges, block throttle, priority, expiry, reset, immutable catalog PASS');
// Integration: only accepted core emissions create announcements (not raw key input).
const {Duel}=await import('../../public/games/maple-moon-duel/core.mjs');
for(const kind of ['cat','xiaosi']){
 for(const [action,key] of [['attack','J'],['skill','K'],['roar','I'],['charm','O'],['launch','P'],['ultimate','U']]){
  const duel=new Duel(kind),calls=new MoveCallouts();duel.start();duel.events=[];duel.player.energy=100;
  assert.equal(duel.action(duel.player,action),true);
  for(const event of duel.events)calls.feed(event,duel.t);
  const v=calls.snapshot(duel.t)[kind];assert.equal(v.key,key,`${kind} ${action} core mapping`);assert.equal(v.started,duel.t);assert.equal(v.expires,v.started+v.duration);
 }
 const duel=new Duel(kind),calls=new MoveCallouts();duel.start();duel.events=[];duel.player.energy=0;
 assert.equal(duel.action(duel.player,'ultimate'),false);duel.events.forEach(e=>calls.feed(e,0));assert.equal(calls.snapshot(0)[kind],null);
 duel.player.guarding=true;calls.guard(duel.player,0);duel.player.guard=10;duel.hit(duel.player,20,duel.enemy,0);
 duel.events.forEach(e=>calls.feed(e,.1));assert.equal(calls.snapshot(.1)[kind],null);
}
const real=new Duel('cat'),read=new MoveCallouts();real.start();real.events=[];
for(let chain=0;chain<3;chain++){
 real.t=chain*.4;real.player.action=null;real.player.cooldowns.attack=0;assert.ok(real.action(real.player,'attack'));real.events.splice(0).forEach(e=>read.feed(e,real.t));assert.equal(read.snapshot(real.t).cat.name,MOVE_NAMES.cat.attack[chain]);
}
console.log('move-callouts: actual Duel emissions for both characters, rejected ultimate, guardbreak and three-hit chain PASS');
