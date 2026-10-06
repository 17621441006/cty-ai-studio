/** The same original orange Persian cat used in CTY's pixel music adventure. */
export const PIXEL_CAT_ATLAS='/assets/cat-avatars.webp';
export const PIXEL_CAT_CROP={x:1102,y:139,width:485,height:505};
export const STAR_CAT_SIZE={width:24,height:25};
export const starCatBounds=(x:number,feet:number)=>({x0:x-10.5,x1:x+10.5,y0:feet-23,y1:feet});
type CatState={walking:boolean;walkTime:number;face:number;dizzy:boolean;time:number};

export function createStarCatSkin(){
 const image=new Image();let disposed=false,portrait:HTMLCanvasElement|null=null;
 image.decoding='async';
 image.onload=()=>{
  if(disposed)return;const canvas=document.createElement('canvas');canvas.width=48;canvas.height=50;
  const ctx=canvas.getContext('2d');if(!ctx)return;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  const crop=PIXEL_CAT_CROP;ctx.drawImage(image,crop.x,crop.y,crop.width,crop.height,0,0,48,50);portrait=canvas;
 };
 image.src=PIXEL_CAT_ATLAS;
 return {
  draw(ctx:CanvasRenderingContext2D,x:number,feet:number,state:CatState){
   ctx.save();ctx.translate(Math.round(x),feet);ctx.scale(state.face<0?-1:1,1);
   ctx.imageSmoothingEnabled=false;
   if(portrait){
    // Keep the original face and body proportions. Alternate the existing paws,
    // with a small sway above them; the lower paw always touches the ground.
    const stride=state.walking?Math.sin(state.walkTime*14):0,lean=state.dizzy?Math.sin(state.time*13)*.055:stride*.018;
    ctx.save();ctx.rotate(lean);ctx.drawImage(portrait,0,0,48,44,-12,-25,24,22);ctx.restore();
    ctx.drawImage(portrait,0,44,24,6,-12,-3-Math.max(0,stride)*.65,12,3);
    ctx.drawImage(portrait,24,44,24,6,0,-3-Math.max(0,-stride)*.65,12,3);
   }else{
    // Warm placeholder while the shared atlas decodes; never fall back to the old black cat.
    ctx.fillStyle='#b67232';ctx.fillRect(-10,-20,20,18);ctx.fillRect(-9,-25,6,7);ctx.fillRect(4,-25,6,7);
    ctx.fillStyle='#e9ac62';ctx.fillRect(-11,-18,22,11);ctx.fillRect(-8,-22,16,15);
    ctx.fillStyle='#fff0cd';ctx.fillRect(-7,-9,14,8);ctx.fillRect(-8,-3,6,3);ctx.fillRect(3,-3,6,3);ctx.fillRect(-3,-15,6,5);
    ctx.fillStyle='#241d1b';ctx.fillRect(-7,-18,3,3);ctx.fillRect(4,-18,3,3);ctx.fillRect(-1,-13,2,2);
   }
   ctx.restore();
  },
  dispose(){disposed=true;image.onload=null;image.onerror=null;portrait=null}
 };
}
