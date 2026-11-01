const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
/** Explicit pose priority: control states > air reaction > voluntary wuxia jump > action. */
export function spritePose(a,ambient,started=true,landingAge=99){
 if(!started)return{row:0,frame:Math.floor(ambient*6)%8};
 if(a.knockdown>0)return{row:6,frame:5+2*clamp(1-a.knockdown/.55)};
 if(a.heldBy)return{row:7,frame:((a.heldBy.action?.t||0)*9)%7};
 if(a.guarding)return{row:9,frame:(ambient*4)%7};
 if(a.action?.skill==='love')return{row:7,frame:(a.action.t*8)%7};
 if(a.action?.skill==='cry')return{row:8,frame:(a.action.t*9)%7};
 if(a.action?.skill==='pounce'){const t=a.action.t;return{row:8,frame:t<.18?t/.18*1.5:a.y>0?2+2*clamp((680-a.vy)/1100):5+2*clamp((t-.95)/.25)}}
 if(a.action?.type==='charm'&&a.kind==='cat')return{row:5,frame:(a.action.t/1.8*16)%16};
 if(a.y>0&&(a.juggleHits>0||a.state==='hurt'))return{row:6,frame:Math.min(4,1+clamp((600-a.vy)/1000)*3)};
 if(a.y>0||a.state==='jump'||a.state==='airborne'){
  // A strong tucked silhouette is held through apex and most descent.
  const f=a.vy>620?2+clamp((840-a.vy)/220):a.vy>80?3+clamp((620-a.vy)/540):a.vy>-550?4:4+clamp((-a.vy-550)/250);
  return{row:4,frame:f};
 }
 if(a.charmed>0)return{row:0,frame:Math.floor(ambient*5)%8};
 if(!a.action&&landingAge<.18)return{row:4,frame:6+clamp(landingAge/.14)};
 const rows={idle:0,run:1,attack:2,hurt:3};let row=rows[a.state]??0;
 let frame=a.state==='attack'?Math.min(7,a.stateT/.055):a.state==='hurt'?Math.min(7,a.stateT/.04):(a.stateT*(a.state==='run'?12:6))%8;
 return{row,frame};
}
