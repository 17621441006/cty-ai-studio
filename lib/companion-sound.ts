export type CompanionCue='tap'|'jump'|'land'|'meow'|'lasso'|'catch'|'put'|'shield'|'portal'|'spell'|'counter'|'clash'|'patronus'|'launch'|'firework'|'phoenix';
/** Quiet, rounded musical cues. No downloads, impact noise or autoplay workaround. */
export function createCompanionSound(){
 let ctx:AudioContext|null=null,master:GainNode|null=null,enabled=true,duck=false,lastCue=-10;
 const last=new Map<CompanionCue,number>(),voices=new Set<AudioScheduledSourceNode>();
 async function unlock(){if(!enabled)return;try{if(!ctx){
  ctx=new AudioContext();master=ctx.createGain();master.gain.value=duck?.04:.10;
  const warmth=ctx.createBiquadFilter(),limiter=ctx.createDynamicsCompressor();warmth.type='lowpass';warmth.frequency.value=2400;warmth.Q.value=.5;
  limiter.threshold.value=-30;limiter.knee.value=12;limiter.ratio.value=4;limiter.attack.value=.015;limiter.release.value=.20;
  master.connect(warmth);warmth.connect(limiter);limiter.connect(ctx.destination);
 }if(ctx.state==='suspended')await ctx.resume().catch(()=>{});}catch{}}
 function level(){if(ctx&&master)master.gain.setTargetAtTime(enabled?(duck?.04:.10):0,ctx.currentTime,.08)}
 function play(cue:CompanionCue){
  if(!enabled||!ctx||!master||ctx.state!=='running'||document.hidden||voices.size>=12)return;
  const now=ctx.currentTime,gap=cue==='meow'?1.6:cue==='firework'?.85:.25;
  if((cue!=='meow'&&now-lastCue<.10)||now-(last.get(cue)??-10)<gap)return;last.set(cue,now);lastCue=now;
  const tone=(frequency:number,end:number,delay:number,duration:number,volume:number,type:OscillatorType='sine')=>{
   if(voices.size>=12)return;const c=ctx!,o=c.createOscillator(),g=c.createGain(),start=now+delay;
   o.type=type;o.frequency.setValueAtTime(frequency,start);o.frequency.exponentialRampToValueAtTime(end,start+duration);
   g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(Math.min(volume,.16),start+.035);g.gain.exponentialRampToValueAtTime(.0001,start+duration);
   o.connect(g);g.connect(master!);voices.add(o);o.onended=()=>{voices.delete(o);o.disconnect();g.disconnect()};o.start(start);o.stop(start+duration+.025);
  };
  switch(cue){
   case 'meow':{ // Restore the voiced "myaow" formant sweep, at the softer v28 volume.
    const c=ctx!,o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';
    o.frequency.setValueAtTime(570,now);o.frequency.exponentialRampToValueAtTime(805,now+.10);o.frequency.exponentialRampToValueAtTime(410,now+.43);
    f.type='bandpass';f.frequency.setValueAtTime(1450,now);f.frequency.exponentialRampToValueAtTime(780,now+.43);f.Q.value=1.3;
    g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(.14,now+.07);g.gain.exponentialRampToValueAtTime(.0001,now+.47);
    o.connect(f);f.connect(g);g.connect(master);voices.add(o);o.onended=()=>{voices.delete(o);o.disconnect();f.disconnect();g.disconnect()};o.start(now);o.stop(now+.50);tone(568,405,.015,.43,.035);break;
   }
   case 'jump':tone(392,587,0,.19,.12,'triangle');break;
   case 'land':tone(294,277,0,.17,.12);tone(587,554,.035,.18,.025);break;
   case 'lasso':tone(440,554,0,.25,.075);tone(660,740,.09,.23,.035);break;
   case 'catch':tone(587,587,0,.16,.11,'triangle');tone(784,784,.065,.20,.04);break;
   case 'put':tone(440,440,0,.18,.10);tone(660,660,.075,.22,.045);break;
   case 'shield':tone(440,440,0,.28,.14);tone(660,660,.025,.34,.065);tone(880,880,.065,.30,.025);break;
   case 'portal':[330,440,660].forEach((hz,i)=>tone(hz,hz*1.025,i*.085,.43,.065));break;
   case 'spell':tone(392,494,0,.25,.095);tone(660,740,.08,.30,.035);break;
   case 'counter':tone(554,440,0,.25,.10);tone(740,660,.05,.30,.035);break;
   case 'clash':tone(440,440,0,.25,.11);tone(587,587,.045,.30,.055);break;
   case 'patronus':[392,587,784].forEach((hz,i)=>tone(hz,hz,i*.11,.65,.06));break;
   case 'launch':tone(330,494,0,.38,.09);tone(660,740,.16,.32,.035);break;
   case 'firework':[440,660,880].forEach((hz,i)=>tone(hz,hz,i*.065,.37,.07/(i+1)));break;
   case 'phoenix':[440,554,740].forEach((hz,i)=>tone(hz,hz,i*.12,.52,.065));break;
   default:tone(554,554,0,.15,.085);
  }
 }
 return {unlock,play,setEnabled(value:boolean){enabled=value;level()},setDucking(value:boolean){duck=value;level()},close(){for(const v of voices){try{v.stop()}catch{}}voices.clear();last.clear();lastCue=-10;void ctx?.close();ctx=null;master=null}};
}
