export type CompanionCue='tap'|'jump'|'land'|'meow'|'lasso'|'catch'|'put'|'shield'|'portal'|'spell'|'counter'|'clash'|'patronus'|'launch'|'firework'|'phoenix';
/** Small synthesized foley: no downloads, speech service or autoplay workaround. */
export function createCompanionSound(){
 let ctx:AudioContext|null=null,master:GainNode|null=null,enabled=true,duck=false;
 const last=new Map<CompanionCue,number>(),voices=new Set<AudioScheduledSourceNode>();
 async function unlock(){if(!enabled)return;try{if(!ctx){ctx=new AudioContext();master=ctx.createGain();master.gain.value=duck?.065:.14;master.connect(ctx.destination)}if(ctx.state==='suspended')await ctx.resume().catch(()=>{});}catch{}}
 function level(){if(ctx&&master)master.gain.setTargetAtTime(enabled?(duck?.065:.14):0,ctx.currentTime,.04)}
 function play(cue:CompanionCue){
  if(!enabled||!ctx||!master||ctx.state!=='running'||document.hidden||voices.size>18)return;
  const now=ctx.currentTime,gap=cue==='meow'?1.3:cue==='firework'?.6:.22;if(now-(last.get(cue)??-10)<gap)return;last.set(cue,now);
  const tone=(frequency:number,end:number,delay:number,duration:number,volume:number,type:OscillatorType='sine')=>{const c=ctx!,o=c.createOscillator(),g=c.createGain(),start=now+delay;o.type=type;o.frequency.setValueAtTime(frequency,start);o.frequency.exponentialRampToValueAtTime(end,start+duration);g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(volume,start+.018);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g);g.connect(master!);voices.add(o);o.onended=()=>{voices.delete(o);o.disconnect();g.disconnect()};o.start(start);o.stop(start+duration+.025)};
  const noise=(frequency:number,duration:number,volume:number,delay=0)=>{const c=ctx!,b=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,1.8);const s=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();s.buffer=b;filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.7;gain.gain.value=volume;s.connect(filter);filter.connect(gain);gain.connect(master!);voices.add(s);s.onended=()=>{voices.delete(s);s.disconnect();filter.disconnect();gain.disconnect()};s.start(now+delay)};
  switch(cue){
   case 'meow':{ // Voiced pitch bend and two formants make a brief, soft "myaow".
    const c=ctx!,o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(570,now);o.frequency.exponentialRampToValueAtTime(805,now+.10);o.frequency.exponentialRampToValueAtTime(410,now+.43);f.type='bandpass';f.frequency.setValueAtTime(1450,now);f.frequency.exponentialRampToValueAtTime(780,now+.43);f.Q.value=1.9;g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(.30,now+.07);g.gain.exponentialRampToValueAtTime(.001,now+.47);o.connect(f);f.connect(g);g.connect(master);voices.add(o);o.onended=()=>{voices.delete(o);o.disconnect();f.disconnect();g.disconnect()};o.start(now);o.stop(now+.5);tone(568,405,.015,.43,.045);break;}
   case 'jump':tone(240,680,0,.14,.14,'triangle');break;
   case 'land':noise(220,.11,.27);tone(105,52,0,.11,.22);break;
   case 'lasso':noise(2500,.25,.18);tone(650,1100,0,.22,.045);break;
   case 'catch':tone(610,920,0,.1,.14,'triangle');break;
   case 'put':tone(440,660,0,.12,.15);tone(880,880,.07,.14,.09);break;
   case 'shield':noise(1700,.16,.32);[620,1120,1630].forEach((hz,i)=>tone(hz,hz*.88,0,.40+i*.07,.17/(i+1)));break;
   case 'portal':noise(630,.65,.21);[220,330,495].forEach((hz,i)=>tone(hz,hz*2,i*.07,.48,.12));break;
   case 'spell':noise(2100,.33,.19);tone(180,960,0,.36,.11,'triangle');break;
   case 'counter':tone(980,240,0,.29,.17,'triangle');noise(1200,.22,.13);break;
   case 'clash':noise(1500,.27,.32);tone(840,350,0,.24,.13);break;
   case 'patronus':[392,587,784,1174].forEach((hz,i)=>tone(hz,hz*1.015,i*.065,.9,.10));noise(2900,.8,.07);break;
   case 'launch':noise(750,.45,.23);tone(120,1400,0,.64,.13);break;
   case 'firework':noise(380,.45,.30);[1318,1760,2093].forEach((hz,i)=>tone(hz,hz*.93,.13+i*.05,.42,.045));break;
   case 'phoenix':[740,988,1480].forEach((hz,i)=>tone(hz,hz*1.2,i*.10,.65,.09));noise(1300,.48,.10);break;
   default:tone(880,440,0,.13,.14);
  }
 }
 return {unlock,play,setEnabled(value:boolean){enabled=value;level()},setDucking(value:boolean){duck=value;level()},close(){for(const v of voices){try{v.stop()}catch{}}voices.clear();void ctx?.close();ctx=null;master=null}};
}
