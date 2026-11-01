const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
/** Explicit pose priority: control states > air reaction > voluntary wuxia jump > upright martial actions.
 * Never uses row 6 (knockdown/tumble) for attacks or skills, keeping all characters upright and natural.
 */
export function spritePose(a,ambient,started=true,landingAge=99){
 if(!started)return{row:0,frame:Math.floor(ambient*6)%8};
 if(a.knockdown>0)return{row:6,frame:5+2*clamp(1-a.knockdown/.55)};
 if(a.heldBy)return{row:7,frame:((a.heldBy.action?.t||0)*9)%7};
 if(a.guarding)return{row:9,frame:(ambient*4)%7};
 if(a.action?.skill==='love')return{row:7,frame:(a.action.t*8)%7};
 if(a.action?.skill==='cry')return{row:8,frame:(a.action.t*9)%7};
 if(a.action?.skill==='pounce'){const t=a.action.t;return{row:8,frame:t<.18?t/.18*1.5:a.y>0?2+2*clamp((680-a.vy)/1100):5+2*clamp((t-.95)/.25)}}
 if(a.action?.type==='charm'&&a.kind==='cat')return{row:5,frame:(a.action.t/1.8*16)%16};
 if(a.action?.skill==='toreador')return{row:5,frame:(a.action.t*8)%8};
 if(a.action?.skill==='jumpscare')return{row:7,frame:clamp(a.action.t/Math.max(.2,a.action.duration||1.3))*7};
 if(a.action?.skill==='gearlaunch')return{row:8,frame:clamp(a.action.t/Math.max(.2,a.action.duration||.75))*7};
 if(a.y>0&&(a.juggleHits>0||a.state==='hurt'))return{row:6,frame:Math.min(4,1+clamp((600-a.vy)/1000)*3)};
 if(a.y>0||a.state==='jump'||a.state==='airborne'){
  // A strong tucked silhouette is held through apex and most descent.
  const f=a.vy>620?2+clamp((840-a.vy)/220):a.vy>80?3+clamp((620-a.vy)/540):a.vy>-550?4:4+clamp((-a.vy-550)/250);
  return{row:4,frame:f};
 }
 if(a.charmed>0)return{row:0,frame:Math.floor(ambient*5)%8};
 if(!a.action&&landingAge<.18)return{row:4,frame:6+clamp(landingAge/.14)};
 if(a.action){
  const dur=Math.max(.18,a.action.duration||.42);
  const p=clamp(a.action.t/dur);
  if(a.action.type==='attack'){
   const ch=a.action.chain||0;
   if(ch===0)return{row:2,frame:clamp(p*1.15)*5};
   if(ch===1)return{row:2,frame:2+clamp(p*1.15)*5};
   if(a.kind==='cat')return{row:8,frame:clamp(p*1.1)*6};
   if(a.kind==='bear')return{row:8,frame:clamp(p*1.1)*7};
   return{row:2,frame:clamp(p*1.15)*7};
  }
  if(a.action.type==='skill')return{row:2,frame:clamp(p*1.1)*7};
  if(a.action.type==='roar')return{row:a.kind==='bear'?7:2,frame:(a.action.t*10)%7};
  if(a.action.type==='launch')return{row:a.kind==='bear'?8:2,frame:clamp(p*1.2)*7};
  if(a.action.type==='ultimate')return{row:a.kind==='bear'?7:2,frame:clamp(p*1.1)*7};
  if(a.action.type==='dash')return{row:1,frame:(a.action.t*18)%8};
 }
 const rows={idle:0,run:1,attack:2,hurt:3};let row=rows[a.state]??0;
 let frame=a.state==='attack'?Math.min(7,a.stateT/.055):a.state==='hurt'?Math.min(7,a.stateT/.04):(a.stateT*(a.state==='run'?12:6))%8;
 return{row,frame};
}
