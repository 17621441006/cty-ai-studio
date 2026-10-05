import type {BoatPose} from '@/lib/harbor-voyage';
/** Reuses the harbour's original wheelhouse, ropes and pixel hull. */
export function drawHarborSkiff(ctx:CanvasRenderingContext2D,boat:BoatPose,front=false){
 ctx.save();ctx.translate(boat.x,boat.y);ctx.scale(boat.width/42,boat.width/42);
 const boatX=5,boatY=0;
 const rect=(x:number,y:number,w:number,h:number,color:string)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
 const path=(points:number[][],color:string)=>{ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()};
 if(front){
  path([[0,0],[42,0],[39,6],[7,6],[1,3]],'#6d4e31');rect(1,0,40,1,'#d0a66a');rect(6,3,33,2,'#254953');rect(11,2,23,1,'#9c754a');ctx.restore();return;
 }
  ctx.globalAlpha=.43;
  rect(boatX-7,boatY+7,49,2,'#071e31');
  rect(boatX,boatY+10,37,1,'#0b273c');
  ctx.globalAlpha=1;
  path([[boatX-5,boatY],[boatX+37,boatY],[boatX+34,boatY+6],[boatX+2,boatY+6],[boatX-4,boatY+3]],'#6d4e31');
  rect(boatX-4,boatY,41,1,'#c09154');
  rect(boatX+1,boatY+3,33,2,'#254953');
  rect(boatX+3,boatY-6,17,6,'#302e28');
  path([[boatX+1,boatY-6],[boatX+5,boatY-10],[boatX+17,boatY-10],[boatX+22,boatY-6]],'#242c2b');
  rect(boatX+5,boatY-8,13,2,'#756747');
  rect(boatX+5,boatY-5,4,4,'#568896');
  rect(boatX+10,boatY-5,3,4,'#6e9aa2');
  rect(boatX+14,boatY-5,3,4,'#b0ae7b');
  rect(boatX+29,boatY-20,1,20,'#344947');
  rect(boatX+28,boatY-17,4,2,'#d4be7d');
  rect(boatX+27,boatY-18,5,1,'#657569');
  for(let i=0;i<8;i++) rect(boatX+22+i,boatY-12+i,1,1,'#485b50');
  rect(boatX+34,boatY-3,2,4,'#8a7651');
  rect(boatX-8,boatY+5,6,1,'#67969d');
  rect(boatX+38,boatY+3,5,1,'#6996a0');


 ctx.restore();
}
