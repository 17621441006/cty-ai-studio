/** Fixed body scale; each wing rotates about its own shoulder at 2.1 beats/s. */
export function phoenixWingAngle(seconds:number){return Math.sin(seconds*Math.PI*2*2.1)*.38;}
const left=[[0,0],[.47,0],[.48,.27],[.52,.36],[.61,.42],[.58,.48],[.49,.55],[.32,.60],[0,.54]];
const right=[[.72,.40],[.72,.32],[.75,.15],[.75,0],[1,0],[1,.61],[.76,.62],[.68,.49]];
function outline(ctx:CanvasRenderingContext2D,points:number[][],width:number,height:number){ctx.moveTo(points[0][0]*width,points[0][1]*height);for(const [x,y] of points.slice(1))ctx.lineTo(x*width,y*height);ctx.closePath();}
export function paintPhoenixRig(ctx:CanvasRenderingContext2D,img:HTMLImageElement,width:number,seconds:number){
 const height=width*img.naturalHeight/img.naturalWidth,angle=phoenixWingAngle(seconds);
 const wing=(points:number[][],px:number,py:number,rotation:number)=>{ctx.save();ctx.translate(px*width,py*height);ctx.rotate(rotation);ctx.translate(-px*width,-py*height);ctx.beginPath();outline(ctx,points,width,height);ctx.clip();ctx.drawImage(img,0,0,width,height);ctx.restore()};
 // Wings are behind the unscaled body, maintaining a consistent head and tail.
 wing(left,.59,.44,-angle);wing(right,.72,.44,angle);
 ctx.save();ctx.beginPath();ctx.rect(0,0,width,height);outline(ctx,left,width,height);outline(ctx,right,width,height);ctx.clip('evenodd');ctx.drawImage(img,0,0,width,height);ctx.restore();
}
