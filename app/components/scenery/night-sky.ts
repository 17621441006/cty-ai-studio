const TAU=Math.PI*2;
const stars=Array.from({length:136},(_,i)=>({x:((i*79.131+13)%997)/997,y:((i*i*31.47+7)%991)/991,phase:i*1.79,size:i%13===0?1.5:i%4===0?1:.65}));
export function skyEventAt(time:number){const cycle=time%210;return {shower:cycle>=32&&cycle<53,showerAge:cycle-32};}
/** Shared sky for the cloud desktop and castle, painted beneath architectural silhouettes. */
export function paintNightSky(ctx:CanvasRenderingContext2D,w:number,h:number,time:number,light:number,castle=false,_mark?:HTMLImageElement,reduced=false){
 const skyHeight=castle?Math.max(h*.4,h-Math.min(h*.9,w/1.5)+h*.12):h*.68,event=skyEventAt(time);
 ctx.save();ctx.beginPath();ctx.rect(0,0,w,skyHeight);ctx.clip();
 for(const s of stars){const twinkle=reduced?.45:.26+.74*Math.pow((Math.sin(time*(.32+(s.phase%3)*.13)+s.phase)+1)/2,2);
  ctx.globalAlpha=(.24+twinkle*.64)*(1-light*.34);ctx.fillStyle=s.size>1?'#ffdfaa':'#d8eaff';const x=s.x*w,y=s.y*skyHeight;
  ctx.fillRect(x,y,s.size,s.size);if(s.size>1&&twinkle>.85){ctx.globalAlpha*=.28;ctx.fillRect(x-2,y+.5,5,1);ctx.fillRect(x+.5,y-2,1,5);}
 }
 if(!reduced&&event.shower){
  for(let i=0;i<70;i++){const age=event.showerAge-i*.267,duration=1.0+(i%6)*.13;if(age<0||age>duration)continue;
   const p=age/duration,startX=(((i*137.71)%971)/971*1.12+.08)*w,startY=((i*37.9)%251)/251*skyHeight*.68;
   const distance=w*(.16+(i%5)*.015),x=startX-p*distance,y=startY+p*distance*.58,tail=Math.min(distance*.38,w*.14),alpha=Math.sin(p*Math.PI)*.8;
   const g=ctx.createLinearGradient(x,y,x+tail,y-tail*.58);g.addColorStop(0,i%8===0?'#fff0c7':'#e6f2ff');g.addColorStop(.28,'#bddcff88');g.addColorStop(1,'#a1c6ff00');ctx.globalAlpha=alpha;ctx.strokeStyle=g;ctx.lineWidth=i%9===0?1.4:.85;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+tail,y-tail*.58);ctx.stroke();ctx.fillStyle='#fff7de';ctx.fillRect(x-.6,y-.6,1.3,1.3);
  }
 }
 ctx.restore();
}
