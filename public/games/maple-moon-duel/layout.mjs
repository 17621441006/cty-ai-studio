export const WORLD={width:1600,height:900,ground:701};
export function viewportLayout(width,height){
 const scale=Math.min(width/WORLD.width,height/800);
 // Background fills the entire viewport; actors stay uniformly scaled.
 // The shared ground is the terrace line in the stretched background.
 const ground=height*WORLD.ground/WORLD.height;
 return{width,height,scale,ox:(width-WORLD.width*scale)/2,oy:ground-WORLD.ground*scale,ground,bgX:width/WORLD.width,bgY:height/WORLD.height};
}
export const CHARACTER={cat:{height:286,pivotX:171,pivotY:301},xiaosi:{height:244,pivotX:130,pivotY:301},bear:{height:276,pivotX:128,pivotY:300}};
