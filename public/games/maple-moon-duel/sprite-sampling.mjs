const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
export function pounceScale(v){
 if(!v||v.phase==='charge')return 1;
 if(v.phase==='flight')return 1+1.1*smooth(v.flightAge/.1);
 if(v.phase==='impact')return 1+1.1*(1-smooth((v.impactAge-.18)/.17));
 return 1;
}
export class RunCycle{
 constructor(){this.states=new WeakMap()}
 frame(a,walking){let q=this.states.get(a);if(!q){q={x:a.x,distance:0};this.states.set(a,q)}if(walking)q.distance+=Math.min(20,Math.abs(a.x-q.x));q.x=a.x;return Math.floor(q.distance/210*16)%16}
}
export function spriteSample(kind,pose,spec,{held=false,walkFrame=null}={}){
 let px=spec.pivotX,py=spec.pivotY,frame=Math.max(0,Math.min(7,Math.round(pose.frame)));
 if(kind==='cat'&&pose.row===5){const f=Math.floor(Math.max(0,pose.frame))%16;return{key:'cat-charm',sx:f%8*256,sy:Math.floor(f/8)*320,px:128,py:300}}
 if(walkFrame!==null)return{key:kind+'-run',sx:(walkFrame%8)*256,sy:Math.floor(walkFrame/8)*320,px,py};
 if(pose.row>=5){px=kind==='xiaosi'&&pose.row>=7?130:128;py=kind==='xiaosi'&&pose.row>=7?301:300}
 if(held&&pose.row===7){px=128;py=160}
 return{key:kind,sx:frame*256,sy:pose.row*320,px,py};
}
/** One opaque body sample. Never alpha-crossfade neighboring poses. */
export function drawSprite(c,image,sample,h){c.drawImage(image,sample.sx,sample.sy,256,320,-h*sample.px/320,-h*sample.py/320,h*256/320,h)}
export function boundedVisualX(x,size,height,pivotX=128,face=1){if(size<=1.01)return x;let left=height*size*pivotX/320,right=height*size*(256-pivotX)/320;if(face<0)[left,right]=[right,left];return clamp(x,left,1600-right)}
