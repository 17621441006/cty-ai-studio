/** CSS-pixel geometry shared by the moon, water reflection and floor. */
export function moonLayout(width:number,height:number){
 const compact=width<760;
 const size=Math.max(118,Math.min(compact?width*.39:width*.245,height*.355,compact?174:300));
 const right=compact?12:Math.max(24,width*.055);
 const top=Math.max(27,Math.min(54,height*.055));
 return {left:width-right-size,top,size,centerX:width-right-size/2,skyBottom:top+size};
}
export const taskbarHeight=48;
