/** Orange Persian portrait shared by CTY's games; articulated here for Catch Stars. */
export const PIXEL_CAT_ATLAS='/assets/cat-avatars.webp';
export const PIXEL_CAT_CROP={x:1102,y:139,width:485,height:505};
export const STAR_CAT_SIZE={width:24,height:25};
export const starCatBounds=(x:number,feet:number)=>({x0:x-10.5,x1:x+10.5,y0:feet-23,y1:feet});
type CatState={walking:boolean;walkTime:number;face:number;dizzy:boolean;time:number;soot?:boolean};

export function createStarCatSkin(){
 const image=new Image();let disposed=false,portrait:HTMLCanvasElement|null=null,sooty:HTMLCanvasElement|null=null;
 image.decoding='async';
 image.onload=()=>{
  if(disposed)return;const canvas=document.createElement('canvas');canvas.width=48;canvas.height=50;
  const ctx=canvas.getContext('2d');if(!ctx)return;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  const crop=PIXEL_CAT_CROP;ctx.drawImage(image,crop.x,crop.y,crop.width,crop.height,0,0,48,50);portrait=canvas;
  sooty=document.createElement('canvas');sooty.width=48;sooty.height=50;
  const sc=sooty.getContext('2d');if(sc){sc.drawImage(canvas,0,0);sc.globalCompositeOperation='source-atop';sc.fillStyle='rgba(20,23,32,.93)';sc.fillRect(0,0,48,50);}
 };
 image.src=PIXEL_CAT_ATLAS;
 return {
  draw(ctx:CanvasRenderingContext2D,x:number,feet:number,state:CatState){
   const stride=state.walking?Math.sin(state.walkTime*18):0;
   const lift=Math.abs(stride)*.6,lean=state.dizzy?Math.sin(state.time*11)*.04:state.walking?.055:0;
   ctx.save();ctx.translate(Math.round(x),feet);ctx.scale(state.face<0?-1:1,1);ctx.imageSmoothingEnabled=false;
   // The tail trails behind the direction of travel, with a soft tip flick.
   ctx.save();ctx.translate(-7,-8);ctx.rotate(-.35+Math.sin(state.walkTime*9+state.time*.7)*.16);
   ctx.strokeStyle=state.soot?'#202432':'#bd773b';ctx.lineWidth=4;ctx.lineCap='square';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-7,-1);ctx.lineTo(-9,-5);ctx.lineTo(-8,-9);ctx.stroke();
   ctx.strokeStyle=state.soot?'#303442':'#eab576';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-9,-5);ctx.lineTo(-8,-9);ctx.stroke();ctx.restore();
   const skin=state.soot&&sooty?sooty:portrait;
   if(skin){
    // Paws have both forward travel and lift; the supporting paw remains grounded.
    ctx.drawImage(skin,0,42,24,8,-11+stride*1.8,-4-Math.max(0,stride)*2,11,4);
    ctx.drawImage(skin,24,42,24,8,1-stride*1.8,-4-Math.max(0,-stride)*2,11,4);
    ctx.save();ctx.translate(state.walking?1:0,-lift);ctx.rotate(lean);
    ctx.drawImage(skin,0,26,48,17,-12,-12,24,8.5);
    // Head turns toward travel: forward offset + slight width compression and nod.
    ctx.translate(state.walking?1.5:0,state.walking?Math.sin(state.walkTime*18)*.45:Math.sin(state.time*1.5)*.2);
    ctx.drawImage(skin,0,0,48,28,state.walking?-11.3:-12,-25,state.walking?22.6:24,14);
    if(state.soot){ctx.fillStyle='#fff1c8';ctx.fillRect(-6,-19,4,2);ctx.fillRect(4,-19,4,2);ctx.fillStyle='#171d2a';ctx.fillRect(-4,-19,1,2);ctx.fillRect(6,-19,1,2);}
    ctx.restore();
   }else{
    ctx.fillStyle=state.soot?'#202432':'#b67232';ctx.fillRect(-10,-20,20,18);ctx.fillRect(-9,-25,6,7);ctx.fillRect(4,-25,6,7);
    ctx.fillStyle=state.soot?'#303442':'#e9ac62';ctx.fillRect(-11,-18,22,11);ctx.fillRect(-8,-22,16,15);
    ctx.fillStyle=state.soot?'#252a35':'#fff0cd';ctx.fillRect(-7,-9,14,6);ctx.fillRect(-8+stride*2,-3-Math.max(0,stride)*2,6,3);ctx.fillRect(3-stride*2,-3-Math.max(0,-stride)*2,6,3);ctx.fillRect(-3,-15,6,5);
    ctx.fillStyle=state.soot?'#fff1c8':'#241d1b';ctx.fillRect(-7,-18,3,3);ctx.fillRect(4,-18,3,3);ctx.fillRect(-1,-13,2,2);
   }
   ctx.restore();
  },
  dispose(){disposed=true;image.onload=null;image.onerror=null;portrait=null;sooty=null}
 };
}
