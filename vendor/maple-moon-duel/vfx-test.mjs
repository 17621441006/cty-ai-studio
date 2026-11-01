import assert from 'node:assert/strict';
import {ParticleVFX,cryEyeAnchors,loveHit} from '../../public/games/maple-moon-duel/particle-vfx.mjs';

// This is a numeric/state regression harness, not a visual or FPS substitute.
let calls=0;
function finite(value,label){
 if(typeof value==='number')assert(Number.isFinite(value),`${label} is not finite: ${value}`);
}
function argsFinite(args,label){args.forEach((value,i)=>finite(value,`${label}[${i}]`))}
function context(){
 const methods={};
 for(const name of ['save','restore','beginPath','closePath','fill','stroke','moveTo','lineTo','translate','rotate','scale','fillRect','clearRect','bezierCurveTo','quadraticCurveTo']){
  methods[name]=(...args)=>{calls++;argsFinite(args,name)};
 }
 methods.ellipse=(...args)=>{calls++;argsFinite(args,'ellipse');assert(args[2]>=0&&args[3]>=0,'ellipse radii must be nonnegative')};
 methods.drawImage=(image,...args)=>{calls++;assert(image&&Number.isFinite(image.width),'drawImage needs a valid image');argsFinite(args,'drawImage')};
 for(const name of ['createLinearGradient','createRadialGradient'])methods[name]=(...args)=>{
  calls++;argsFinite(args,name);return{addColorStop(offset,color){finite(offset,'gradient offset');assert(offset>=0&&offset<=1);assert.equal(typeof color,'string')}};
 };
 return new Proxy(methods,{set(target,key,value){finite(value,`ctx.${String(key)}`);if(key==='globalAlpha')assert(value>=0&&value<=1,`alpha out of range ${value}`);target[key]=value;return true}});
}
class FakeOffscreenCanvas{
 constructor(width,height){this.width=width;this.height=height;this.context=context()}
 getContext(kind){assert.equal(kind,'2d');return this.context}
}
const previousOffscreen=globalThis.OffscreenCanvas;
globalThis.OffscreenCanvas=FakeOffscreenCanvas;
const realRandom=Math.random;let seed=7865;
Math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
const ctx=context();
const assets={Fire01:{width:2048,height:1024,src:'Fire01'},Effect36:{width:1024,height:1024,src:'Effect36'},Effect51:{width:1024,height:1024,src:'Effect51'},slashSweep:{width:1536,height:256,src:'slashSweep'}};
const cat={kind:'cat',x:620,y:0,face:1},xiaosi={kind:'xiaosi',x:980,y:70,face:-1};
function check(v,label){
 assert(v.particles.length<=500,`${label}: particle cap exceeded`);
 assert(v.effects.length<=24,`${label}: effect cap exceeded`);
 for(const [type,items] of[['particle',v.particles],['effect',v.effects]])for(const item of items)for(const [key,value] of Object.entries(item))finite(value,`${label}.${type}.${key}`);
}
function advance(v,seconds,options={}){
 for(let t=0;t<seconds;t+=1/60){v.draw(ctx,1/60,{assets,ground:701,...options});check(v,'advance')}
}
try{
 const v=new ParticleVFX();
 // V8: source-cell eye anchors use the same pivot/scale/facing as opaque sprites.
 const eyeActor={kind:'xiaosi',x:500,y:20,face:1,action:{skill:'cry',t:.2}};
 const right=cryEyeAnchors(eyeActor),left=cryEyeAnchors({...eyeActor,face:-1});
 for(let i=0;i<2;i++){assert(Math.abs(right[i].x+left[i].x-1000)<1e-8);assert.equal(right[i].y,left[i].y);assert(right[i].y<540&&right[i].y>510,'eyes must be at head, not torso');}
 const moved=cryEyeAnchors({...eyeActor,x:537,y:35});assert.equal(moved[0].x-right[0].x,37);assert.equal(moved[0].y-right[0].y,-15);
 const info={x:520,y:650,face:-1,h:244,row:8,frame:3,sample:{px:130,py:301}};
 const rendered=cryEyeAnchors({...eyeActor,renderInfo:info});assert.equal(rendered[0].x,520-2*244/320);assert.equal(rendered[0].y,650+(98-301)*244/320);
 const lover={...eyeActor,action:{skill:'love'}},beloved={...cat,heldBy:lover};
 assert(loveHit({type:'hit',actor:beloved,source:lover}));
 v.emit({type:'hit',actor:beloved,source:lover,damage:9});assert.equal(v.effects.length+v.particles.length,0,'love ticks never emit generic cuts/sparks');
 // A hearts-only effect cannot invoke ring, glow, lines or strokes.
 const hearts=new ParticleVFX();let heartCount=0;hearts.heart=()=>heartCount++;
 const forbidden=new Proxy({}, {get(_t,k){return()=>assert.fail('love drew forbidden geometry: '+String(k))}});
 hearts.love(forbidden,{actorRef:lover,targetRef:beloved,x:500,h:0,face:1,t:.5,life:1.85,seed:1});assert(heartCount>0);
 v.emit('burst',cat);assert.equal(v.effects[0].pace,1/1.8);advance(v,3);assert(v.effects.some(f=>f.type==='burst'),'ultimate visibly lasts beyond old 2.45s');advance(v,4);assert.equal(v.effects.length+v.particles.length,0);
 v.emit({type:'special',actor:eyeActor,skill:'cry',phase:'start'});advance(v,.3);assert(v.effects.length);advance(v,4);assert.equal(v.effects.length+v.particles.length,0);

 v.emit('ultimate',cat);v.emit('ultimate',xiaosi);
 assert.equal(v.effects.length,2);assert(v.effects.some(f=>f.cat));assert(v.effects.some(f=>!f.cat));
 advance(v,1);assert.equal(v.effects.length,0,'charge phases expire');
 v.emit('burst',cat);v.emit('burst',xiaosi);advance(v,.42);
 assert.equal(v.effects.length,2);assert(v.effects.every(f=>f.fired.size>0),'both ultimates trigger staged emissions');
 assert(v.particles.length>0,'ultimates emit particles');
 assert(v.cache.size>0,'glow/sprite cache exercised');
 advance(v,6);assert.equal(v.effects.length,0);assert.equal(v.particles.length,0,'all residual particles expire');

 // V10 K differs by draw route: no normal slash atlas, independent flying crescent.
 {
  const k=new ParticleVFX();let casts=0,charges=0,crescents=0;
  k.moonCast=()=>casts++;k.moonCharge=()=>charges++;
  k.sheet=()=>assert.fail('Xiaosi K must not reuse the normal J slash atlas');
  k.emit('charge',xiaosi);k.emit('cast',xiaosi);k.draw(ctx,.03,{assets});assert.equal(casts,1);assert.equal(charges,1);
  const projectile={owner:xiaosi,x:800,y:85,vx:620,life:2.2};const snapshot=JSON.stringify(projectile);
  const real=new ParticleVFX(),originalCrescent=real.crescent.bind(real);real.crescent=(...args)=>{crescents++;originalCrescent(...args)};
  for(const face of[-1,1])for(const reduced of[false,true]){real.reduced=reduced;real.moonBladeProjectile(ctx,{...projectile,vx:face*620},.8,701)}
  assert(crescents>=16,'moving K draws luminous crescent plus trailing moons');assert.equal(JSON.stringify(projectile),snapshot,'VFX never modifies projectile balance/state');
 }
 // Sprite-backed slash, casting, hit severity, jump landing, and dash paths.
 for(const actor of[cat,xiaosi])for(const type of['slash','cast','charge','hit','dash','land'])v.emit({type,actor,source:actor,damage:62,chain:2});
 advance(v,4);assert.equal(v.effects.length,0);assert.equal(v.particles.length,0);

 // V4: every directional skill phase, both silhouettes, and target tracking.
 for(const actor of [cat,xiaosi])for(const skill of ['roar','charm','launch']){
  const target=actor===cat?xiaosi:cat,type=skill==='launch'?'launcher':skill;
  v.emit({type:'special',actor,kind:actor.kind,skill,phase:'start',range:skill==='roar'?340:skill==='charm'?250:155});
  const effect=v.effects.find(f=>f.type===type&&f.actorRef===actor);
  assert(effect,`${actor.kind} ${skill} starts a visible effect`);assert.equal(effect.cat,actor.kind==='cat');
  advance(v,.25);
  v.emit({type:'special',actor,kind:actor.kind,skill,phase:'pulse',pulse:1});
  v.emit({type:'special',actor,kind:actor.kind,skill,phase:'hit',target});
  assert.equal(effect.targetRef,target,'hit phase attaches actual target');
  advance(v,.2);target.x+=12;target.y+=20;advance(v,.2);target.x-=12;target.y-=20;
  advance(v,4);assert.equal(v.effects.length+v.particles.length,0,`${skill} cleans completely`);
 }
 for(const actor of [cat,xiaosi]){
  v.emit({type:'hit',actor,source:actor===cat?xiaosi:cat,damage:18,airborne:true,combo:7,juggleHits:7});
  assert(v.effects.some(f=>f.type==='hit'&&f.airborne),'airborne hit preserves juggle render flag');advance(v,.3);
  v.emit({type:'knockdown',actor,reason:'combo-cap',recoveryDuration:3});assert(v.effects.some(f=>f.type==='knockdown'));advance(v,.55);
  // Recovery protection is rendered by the game actor layer, not ParticleVFX.
  v.emit({type:'recover',actor,duration:3});advance(v,4);assert.equal(v.effects.length+v.particles.length,0);
 }
 // Stress all V4 event paths as well as the original ultimate stress below.
 for(let frame=0;frame<90;frame++){
  for(const actor of [cat,xiaosi])for(const skill of ['roar','charm','launch'])for(const phase of ['start','pulse','hit'])v.emit({type:'special',actor,kind:actor.kind,skill,phase,target:actor===cat?xiaosi:cat,range:340});
  v.emit({type:'hit',actor:cat,source:xiaosi,damage:24,airborne:true,juggleHits:29});v.emit({type:'knockdown',actor:xiaosi});v.emit({type:'recover',actor:xiaosi,duration:3});
  check(v,'V4 stress emission');v.draw(ctx,1/60,{assets});check(v,'V4 stress render');
 }
 advance(v,6);assert.equal(v.effects.length+v.particles.length,0,'V4 stress cleans completely');
 // V5 stateful choreography: capture/release, rooted tears, belly landing.
 for(const reducedMode of [false,true]){
  v.draw(ctx,0,{assets,reduced:reducedMode});
  v.emit({type:'special',actor:xiaosi,skill:'love',phase:'start',range:145});
  let love=v.effects.find(f=>f.type==='love');assert(love);advance(v,.4,{reduced:reducedMode});
  v.emit({type:'special',actor:xiaosi,skill:'love',phase:'grab',target:cat});assert(love.grabbed);assert.equal(love.targetRef,cat);
  for(let pulse=1;pulse<=3;pulse++){v.emit({type:'special',actor:xiaosi,skill:'love',phase:'tick',target:cat,pulse});advance(v,.25,{reduced:reducedMode})}
  const beforeRelease=love.life;v.emit({type:'special',actor:xiaosi,skill:'love',phase:'release',target:cat});assert(love.life<=beforeRelease);assert(love.life<=love.t+.300001);
  advance(v,1,{reduced:reducedMode});assert(!v.effects.some(f=>f.type==='love'),'released embrace expires');
  v.emit({type:'special',actor:xiaosi,skill:'cry',phase:'start',range:290});advance(v,.24,{reduced:reducedMode});
  v.emit({type:'special',actor:xiaosi,skill:'cry',phase:'pulse'});v.emit({type:'special',actor:xiaosi,skill:'cry',phase:'hit',target:cat});assert.equal(v.effects.find(f=>f.type==='cry').targetRef,cat);advance(v,3,{reduced:reducedMode});
  v.emit({type:'special',actor:cat,skill:'pounce',phase:'start',range:185});advance(v,.18,{reduced:reducedMode});v.emit({type:'special',actor:cat,skill:'pounce',phase:'leap'});
  cat.y=140;advance(v,.4,{reduced:reducedMode});cat.y=0;v.emit({type:'land',actor:cat,skill:'pounce'});
  const pounce=v.effects.find(f=>f.type==='pounce');assert(pounce.landed);assert.equal(pounce.landX,cat.x);const particles=v.particles.length;
  v.emit({type:'special',actor:cat,skill:'pounce',phase:'pulse'});v.emit({type:'special',actor:cat,skill:'pounce',phase:'hit',target:xiaosi});assert.equal(v.particles.length,particles,'land + pulse do not double landing explosion');advance(v,4,{reduced:reducedMode});
  for(const actor of [cat,xiaosi])for(const type of ['block','guardbreak']){
   const source=actor===cat?xiaosi:cat;v.emit({type,actor,source,damage:3,prevented:11,guard:type==='block'?80:0});const f=v.effects.findLast(f=>f.type===type);assert(f);assert.equal(f.impactFace,source.face);advance(v,1.5,{reduced:reducedMode});
  }
  assert.equal(v.effects.length+v.particles.length,0,'all V5 lifetimes clean in both quality modes');
 }
 // V9 screenshot regression: the long diagonal bundle was unlanded pounce,
 // while the enclosing corkscrew/rings belonged to residual cry and charm.
 {
  const clean=new ParticleVFX(),a={kind:'cat',x:600,y:90,face:1},b={kind:'xiaosi',x:650,y:0,face:-1};
  const noStroke=new Proxy({}, {get(_t,k){return()=>assert.fail('forbidden flight/charm geometry '+String(k))}});
  clean.glow=()=>{};clean.heart=()=>{};clean.petal=()=>{};
  clean.pounce(noStroke,{actorRef:a,x:a.x,h:a.y,face:1,t:.4,life:3.2,seed:1});
  clean.charm(noStroke,{actorRef:a,targetRef:b,x:a.x,h:a.y,face:1,t:.4,life:1.6,seed:1,cat:true});
  // Inactive cry can emit ONLY its short rain strokes; no loops or cages.
  let from=null,segments=0;const rain=context();rain.moveTo=(x,y)=>{from=[x,y]};rain.lineTo=(x,y)=>{assert(from);assert(Math.hypot(x-from[0],y-from[1])<16,'rain unexpectedly draws long binding line');segments++;};rain.ellipse=()=>assert.fail('cry drew enclosing ellipse');
  clean.cry(rain,{actorRef:b,targetRef:a,x:b.x,h:0,face:-1,t:.5,life:2,seed:1});assert(segments>0);
  // Actual draw dispatch, not just isolated helpers: interrupted pounce and
  // old cry disappear while love hearts and unrelated ultimate remain alive.
  const overlap=new ParticleVFX();overlap.emit({type:'special',actor:a,skill:'pounce',phase:'start'});
  overlap.emit({type:'special',actor:b,skill:'cry',phase:'start'});overlap.emit({type:'special',actor:b,skill:'cry',phase:'hit',target:a});
  overlap.emit({type:'special',actor:b,skill:'love',phase:'start'});a.heldBy=b;overlap.emit({type:'special',actor:b,skill:'love',phase:'grab',target:a});overlap.emit('burst',b);
  let loves=0,ults=0;overlap.love=()=>loves++;overlap.moon=()=>ults++;overlap.pounce=()=>assert.fail('held actor retained flight bars');overlap.cry=()=>assert.fail('old root enclosed love');
  overlap.draw(ctx,.02,{assets});assert.equal(loves,1);assert.equal(ults,1);assert(!overlap.effects.some(f=>f.type==='cry'||f.type==='pounce'));
  const charmOverlap=new ParticleVFX();a.heldBy=null;a.charmed=1;charmOverlap.emit({type:'special',actor:a,skill:'pounce',phase:'start'});charmOverlap.draw(ctx,.02,{assets});assert.equal(charmOverlap.effects.length,0,'charm interrupts flight cosmetics');
 }
 // Missed grab and interrupted pounce also expire without a release/land event.
 for(const [actor,skill] of [[xiaosi,'love'],[xiaosi,'cry'],[cat,'pounce']])v.emit({type:'special',actor,skill,phase:'start'});
 advance(v,5);assert.equal(v.effects.length+v.particles.length,0,'aborted V5 effects cannot leak');
 for(let frame=0;frame<90;frame++){
  for(const [actor,skill] of [[xiaosi,'love'],[xiaosi,'cry'],[cat,'pounce']]){
   v.emit({type:'special',actor,skill,phase:'start'});v.emit({type:'special',actor,skill,phase:'grab',target:actor===cat?xiaosi:cat});v.emit({type:'special',actor,skill,phase:'pulse'});
  }
  v.emit({type:'block',actor:cat,source:xiaosi,damage:3});v.emit({type:'guardbreak',actor:xiaosi,source:cat});
  check(v,'V5 stress emission');v.draw(ctx,1/60,{assets});check(v,'V5 stress render');
 }
 advance(v,6);assert.equal(v.effects.length+v.particles.length,0,'V5 repeated bursts fully clean');
 let peakParticles=0,peakEffects=0;
 for(let frame=0;frame<120;frame++){
  for(let i=0;i<14;i++)v.emit('burst',i%2?cat:xiaosi);
  v.emit({type:'hit',actor:cat,damage:62});v.emit('cast',xiaosi);
  check(v,'stress emission');v.draw(ctx,1/60,{assets});check(v,'stress render');
  peakParticles=Math.max(peakParticles,v.particles.length);peakEffects=Math.max(peakEffects,v.effects.length);
 }
 assert.equal(peakEffects,24,'stress reaches effect cap');assert.equal(peakParticles,500,'stress reaches particle cap');
 advance(v,8);assert.equal(v.effects.length,0);assert.equal(v.particles.length,0,'stress debris fully cleaned');

 const full=new ParticleVFX(),reduced=new ParticleVFX();
 full.draw(ctx,0,{assets,reduced:false});reduced.draw(ctx,0,{assets,reduced:true});
 full.emit('burst',cat);full.emit('burst',xiaosi);reduced.emit('burst',cat);reduced.emit('burst',xiaosi);
 advance(full,.3,{reduced:false});advance(reduced,.3,{reduced:true});
 assert(reduced.particles.length<full.particles.length,`reduced particles ${reduced.particles.length} must be fewer than full ${full.particles.length}`);
 const reducedCount=reduced.particles.length,fullCount=full.particles.length;
 advance(full,6);advance(reduced,6,{reduced:true});
 assert.equal(full.particles.length+reduced.particles.length,0);
 full.emit('hit',cat);full.reset();assert.equal(full.particles.length+full.effects.length,0,'reset clears active state');
 for(const dt of[NaN,-1,Infinity,0]){v.draw(ctx,dt,{assets});check(v,'delta guard')}
 console.log(`ParticleVFX passed: both ultimate phases; V4/V5 skill phases, love/cry/pounce, guard/break, airborne/recovery; all event paths with sprite assets; ${calls} finite canvas calls; stress caps ${peakParticles} particles/${peakEffects} effects; complete lifetime/reset cleanup; reduced ${reducedCount} < full ${fullCount}.`);
}finally{Math.random=realRandom;if(previousOffscreen===undefined)delete globalThis.OffscreenCanvas;else globalThis.OffscreenCanvas=previousOffscreen}
