/* Exercise the real audio graph without requiring an audio device. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript');
const root=path.resolve(__dirname,'../..');
class Param {
  constructor(){this.value=0;this.events=[]}
  setValueAtTime(value,time){this.events.push({method:'set',value,time});return this}
  linearRampToValueAtTime(value,time){this.events.push({method:'linear',value,time});return this}
  exponentialRampToValueAtTime(value,time){assert.ok(value>0);this.events.push({method:'exponential',value,time});return this}
  setTargetAtTime(value,time,constant){assert.ok(constant>0);this.events.push({method:'target',value,time,constant});return this}
}
class Node {
  constructor(){this.connections=[];this.disconnected=false}
  connect(to){this.connections.push(to);return to}
  disconnect(){this.disconnected=true;this.connections=[]}
}
let latest,contexts=0;
class AudioContext {
  constructor(){latest=this;contexts++;this.currentTime=0;this.state='suspended';this.destination=new Node();this.gains=[];this.sources=[];this.nodes=[]}
  createGain(){const n=new Node();n.gain=new Param();this.gains.push(n);this.nodes.push(n);return n}
  createBiquadFilter(){const n=new Node();n.frequency=new Param();n.Q=new Param();this.nodes.push(n);return n}
  createDynamicsCompressor(){const n=new Node();for(const p of ['threshold','knee','ratio','attack','release'])n[p]=new Param();this.nodes.push(n);return n}
  createOscillator(){const n=new Node();n.frequency=new Param();n.start=t=>{n.startAt=t};n.stop=t=>{n.stopAt=t??this.currentTime};this.sources.push(n);return n}
  async resume(){this.state='running'}
  async close(){this.state='closed';for(const n of this.sources)if(!n.ended){n.ended=true;n.onended?.()}}
  advance(seconds){this.currentTime+=seconds;for(const n of this.sources)if(!n.ended&&n.stopAt<=this.currentTime){n.ended=true;n.onended?.()}}
}
const source=fs.readFileSync(path.join(root,'lib/companion-sound.ts'),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const exported={exports:{}},document={hidden:false};
vm.runInNewContext(compiled,{module:exported,exports:exported.exports,AudioContext,document});
(async()=>{
 const player=exported.exports.createCompanionSound();
 player.play('shield');assert.equal(contexts,0,'must wait for user gesture');
 await player.unlock();const ctx=latest,master=ctx.gains[0];assert.ok(master.gain.value<=.10);
 assert.equal(master.connections[0].type,'lowpass');assert.equal(master.connections[0].connections[0].connections[0],ctx.destination);
 const cues=[...source.split('\n')[0].matchAll(/'([^']+)'/g)].map(x=>x[1]);
 for(const cue of cues){
  ctx.advance(2);const before=ctx.sources.length;player.play(cue);assert.ok(ctx.sources.length>before,`${cue} has no sound`);
  const count=ctx.sources.length;player.play(cue);assert.equal(ctx.sources.length,count,'immediate repeats must be suppressed');
  for(const n of ctx.sources.slice(before)){
   assert.ok(['sine','triangle'].includes(n.type));assert.ok(n.stopAt-n.startAt<1,'a cue must not leave an endless oscillator');
   for(const e of n.frequency.events)assert.ok(e.value>=200&&e.value<=1000,'avoid sub-bass/high-pitched shocks');
  }
  ctx.advance(2);for(const n of ctx.sources.slice(before)){assert.ok(n.ended&&n.disconnected,'voices must release their graph')}
 }
 for(const g of ctx.gains.slice(1)){
  const events=g.gain.events,attack=events.find(e=>e.method==='linear');assert.ok(attack);
  assert.ok(attack.time-events[0].time>=.025,'avoid instantaneous gain clicks');assert.ok(attack.value<=.16);
  assert.ok(g.disconnected);
 }
 let count=ctx.sources.length;document.hidden=true;player.play('shield');assert.equal(ctx.sources.length,count);document.hidden=false;
 player.setEnabled(false);player.play('clash');assert.equal(ctx.sources.length,count);assert.equal(master.gain.events.at(-1).value,0);
 player.setEnabled(true);player.setDucking(true);assert.ok(master.gain.events.at(-1).value<=.04);player.setDucking(false);
 for(let i=0;i<80;i++){ctx.advance(.11);player.play(cues[i%cues.length]);assert.ok(ctx.sources.filter(n=>!n.ended).length<=12,'rapid events must stay bounded')}
 player.close();assert.equal(ctx.state,'closed');assert.ok(ctx.sources.every(n=>n.ended&&n.disconnected));
 console.log(`PASS: ${cues.length} cues, soft attacks, bounded pitch/gain, repeat and overlap limits, mute/duck/hidden guards, gesture unlock and graph cleanup.`);
})().catch(e=>{console.error(e);process.exitCode=1});
