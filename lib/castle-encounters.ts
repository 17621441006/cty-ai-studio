export type CastleEncounterKind='harry'|'dumbledore'|'duel'|'dementors';
export type CastleEncounter={kind:CastleEncounterKind;elapsed:number;duration:number;seed:number;catX:number;catFootY?:number;support?:string|null;direction:1|-1;startX:number;stopX:number;approach:number};
export type CastleCast='rest'|'wand'|'patronus';
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const smooth=(n:number)=>{n=clamp(n);return n*n*(3-2*n)};
/** A shuffled bag gives each encounter a turn without consecutive repeats. */
export function castleEncounterBag(previous?:CastleEncounterKind,random:()=>number=Math.random):CastleEncounterKind[]{
 const bag:CastleEncounterKind[]=['harry','dumbledore','duel','dementors'];
 for(let i=bag.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}
 if(bag[0]===previous)[bag[0],bag[1]]=[bag[1],bag[0]];return bag;
}
export function newCastleEncounter(kind:CastleEncounterKind,width:number,catX:number,random:()=>number=Math.random):CastleEncounter{
 const direction:1|-1=catX<width/2?-1:1,range=kind==='dumbledore'?88:Math.min(240,Math.max(124,width*.21));
 const stopX=clamp(catX-direction*range,38,width-38),startX=direction===1?-75:width+75;
 const approach=kind==='dementors'?4.9:clamp(Math.abs(stopX-startX)/(kind==='dumbledore'?115:68),1.6,9);
 return {kind,elapsed:0,duration:kind==='harry'?10.5:kind==='dumbledore'?approach+12:kind==='duel'?approach+6.8:12.5,seed:random()*1000,catX,direction,startX,stopX,approach};
}
export function sampleCastleEncounter(e:CastleEncounter,w:number,ground:number){
 const {elapsed:t,kind,direction:d,approach:a}=e,q=t-a;
 const entering=clamp(t/a),leaving=kind==='duel'?smooth((q-4.5)/2.3):0;
 let x=e.startX+(e.stopX-e.startX)*entering,y=ground,cast:CastleCast='rest';
 if(q>0)x=e.stopX+(e.startX-e.stopX)*leaving;
 if(kind==='harry'){const p=clamp(t/e.duration);x=(d===1?p:1-p)*(w+300)-150;y=ground-92-Math.sin(p*Math.PI)*43+Math.sin(t*1.6+e.seed)*8;}
 if(kind==='duel'&&q>.78&&q<4.65)cast='wand';
 if(kind==='dementors'&&q>0&&q<5.8)cast='patronus';
 return {x,y,q,entering,leaving,walking:kind!=='harry'&&(t<a||leaving>0),cast,catDirection:-d as 1|-1,done:t>=e.duration,
  green:kind==='duel'?smooth((q-.3)/.65)*(1-smooth((q-3.6)/.55)):0,
  counter:kind==='duel'?smooth((q-1)/.65)*(1-smooth((q-4.05)/.5)):0,
  clash:kind==='duel'?smooth((q-1.65)/.2)*(1-smooth((q-3.6)/.7)):0,
  flame:kind==='dumbledore'?smooth((q-.45)/.65)*(1-smooth((q-7.8)/1.0)):0,
  clap:kind==='dumbledore'?smooth((q-7.3)/.55):0,
  phoenix:kind==='dumbledore'?smooth((q-8.1)/.8):0,
  patronus:kind==='dementors'?smooth(q/.65)*(1-smooth((q-4.8)/1.0)):0,
  repel:kind==='dementors'?smooth((q-.65)/4.1):0,
 };
}
/** Closest approach is deliberately near the cat, before the outward wave begins. */
export function sampleDementor(e:CastleEncounter,w:number,ground:number,i:number){
 const f=sampleCastleEncounter(e,w,ground),side=i===1?-e.direction:e.direction;
 const target=e.catX-side*(52+i*17),start=side===1?-85:w+85;
 const approach=smooth((e.elapsed-i*.15)/(e.approach-i*.15));
 return {x:start+(target-start)*approach-side*f.repel*(w*.55+95),
  y:(e.catFootY??ground)-(i===1?38:-3)-Math.sin(e.elapsed*1.7+i*2)*5-f.repel*(105+i*22),side,alpha:1-f.repel,
  tilt:side*(.23+Math.sin(e.elapsed*.8+i)*.06)};
}

/** Shared by the rising flame, first burst and sound cue: no separate delay. */
export const FIRE_LAUNCH_START=.55;
export const FIRE_BURST_AT=1.40;
export function fireCelebrationAnchor(x:number,d:number,w:number,ground:number){return {x:clamp(x+d*80,w*.25,w*.75),y:Math.max(68,ground*.19)}}
export function fireBurstCenter(k:number,anchor:{x:number;y:number},w:number){return k===0?anchor:{x:clamp(anchor.x+Math.sin(k*2.399)*Math.min(185,w*.25),42,w-42),y:anchor.y+Math.cos(k*2.4)*44+54}}
