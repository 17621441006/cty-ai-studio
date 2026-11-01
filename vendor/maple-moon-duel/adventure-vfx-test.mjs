import assert from 'node:assert/strict';
import {AdventureVFX} from '../../public/games/maple-moon-duel/adventure-vfx.mjs';
// Numeric/state regression only: this mock does not replace visual browser QA.
let calls=0;
const gradient={addColorStop(offset){assert(Number.isFinite(offset)&&offset>=0&&offset<=1)}};
function context(){return new Proxy({},{
 get:(object,key)=>key in object?object[key]:(...args)=>{
  calls++;for(const value of args)if(typeof value==='number')assert(Number.isFinite(value),`${String(key)} argument must be finite`);
  if(key==='ellipse')assert(args[2]>=0&&args[3]>=0,'ellipse radii nonnegative');
  if(String(key).includes('Gradient'))return gradient;
 },
 set:(object,key,value)=>{if(typeof value==='number')assert(Number.isFinite(value),`${String(key)} finite`);if(key==='globalAlpha')assert(value>=0&&value<=1,'alpha within bounds');object[key]=value;return true}
})}
const oldCanvas=globalThis.OffscreenCanvas,oldRandom=Math.random;
let seed=8127;
Math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
globalThis.OffscreenCanvas=class{constructor(width,height){this.width=width;this.height=height}getContext(){return context()}};
const assets={Fire01:{width:1024,height:1024,src:'fire'},Effect36:{width:512,height:512,src:'orb'},Effect51:{width:512,height:512,src:'ring'},slashSweep:{width:768,height:150,src:'slash'}};
function bounds(v){
 assert(v.groups.length<=12,'depth group cap');assert(v.impacts.length<=12,'hazard impact cap');assert(v.particleCount<=96,'shared particle cap');
 assert(v.groups.reduce((n,g)=>n+g.vfx.effects.length,0)<=24,'shared reusable effect cap');
}
try{
 for(const reduced of [false,true]){
  const v=new AdventureVFX(),c=context(),a={kind:'cat',x:650,depth:100,y:0,face:1};
  v.feed({type:'hazard',phase:'warn',hazard:{kind:'slam',x:700,depth:80}});assert.equal(v.impacts.length,0,'warning belongs to the UI renderer');
  v.feed({type:'burst',actor:a});assert.equal(v.groups[0].ground,580);a.depth=200;assert.equal(v.groups[0].ground,580,'eruption keeps its captured depth footprint');
  const h={kind:'storm',x:700,depth:80,rx:150,rd:60,id:2,owner:a};v.feed({type:'hazard',phase:'impact',hazard:h});h.depth=150;assert.equal(v.impacts[0].ground,560,'hazard depth is snapshotted');
  for(let frame=0;frame<80;frame++){
   for(const kind of ['slam','sweep','storm','bolt','claw'])v.feed({type:'hazard',phase:'impact',hazard:{kind,x:700,depth:80,rx:150,rd:60,id:2,owner:a}});
   for(const type of ['slash','cast','charge','burst','ultimate','hit','block','guardbreak','dash','land'])v.feed({type,actor:a,source:a,damage:30});
   for(const skill of ['roar','charm','pounce'])v.feed({type:'special',actor:a,skill,phase:'start'});
   v.draw(c,1/60,{reduced,assets});bounds(v);
  }
  for(let frame=0;frame<600;frame++){v.draw(c,1/60,{reduced,assets});bounds(v)}
  assert.equal(v.groups.length+v.impacts.length+v.particleCount,0,'all residual effects expire');
  // Pounce phase events follow the original effect layer, even if actor depth changed.
  a.depth=40;v.feed({type:'special',actor:a,skill:'pounce',phase:'start'});a.depth=100;
  v.feed({type:'land',actor:a,skill:'pounce'});assert.equal(v.groups.length,1);assert.equal(v.groups[0].ground,520);assert(v.groups[0].vfx.effects.some(f=>f.landed));
  v.feed({type:'hazard',phase:'impact',hazard:h});v.reset();assert.equal(v.groups.length+v.impacts.length+v.particleCount,0,'reset clears active effects');
  for(const dt of [NaN,-1,Infinity,0]){v.draw(c,dt,{reduced,assets});bounds(v)}
 }
 console.log(`AdventureVFX PASS: ${calls} finite canvas calls; captured actor/hazard depth; warning exclusion; pounce phase routing; caps96particles/24effects/12impacts; reduced/full cleanup/reset.`);
}finally{
 Math.random=oldRandom;if(oldCanvas===undefined)delete globalThis.OffscreenCanvas;else globalThis.OffscreenCanvas=oldCanvas;
}
