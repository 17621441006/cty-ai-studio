const running=new WeakMap<HTMLElement,()=>void>();
export function cancelWindowDissolve(element:HTMLElement){running.get(element)?.();element.style.removeProperty('visibility')}
/** Dissolve the actual window pixels with a mask. No screenshots, duplicate iframes or network requests. */
export function dissolveWindow(element:HTMLElement){
 cancelWindowDissolve(element);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduced)return 0;
 const rect=element.getBoundingClientRect();if(!rect.width||!rect.height)return 0;
 const duration=680,size=14,cols=Math.ceil(rect.width/size),rows=Math.ceil(rect.height/size);
 const cells=Array.from({length:cols*rows},(_,i)=>({x:i%cols,y:Math.floor(i/cols),at:Math.random()*.66}));
 const mask=document.createElement('canvas');mask.width=Math.ceil(rect.width);mask.height=Math.ceil(rect.height);const m=mask.getContext('2d');
 const canvas=document.createElement('canvas');canvas.className='window-particle-canvas';canvas.width=Math.ceil(rect.width+200);canvas.height=Math.ceil(rect.height+180);
 Object.assign(canvas.style,{left:`${rect.left-100}px`,top:`${rect.top-95}px`,width:`${canvas.width}px`,height:`${canvas.height}px`,zIndex:String(Number(element.style.zIndex||20)+1)});document.body.appendChild(canvas);const ctx=canvas.getContext('2d');
 if(!m||!ctx){canvas.remove();return 0}
 const palette=['#254d79','#3f729e','#5799bf','#8ab5ce','#d9b676','#b3d1d8','#173655'];
 const bits=cells.filter(()=>Math.random()<.12).map(c=>({...c,s:4+Math.random()*7,dx:(Math.random()-.5)*100,dy:-25-Math.random()*100,color:palette[Math.floor(Math.random()*palette.length)]}));
 const start=performance.now();let raf=0,last=-1;
 element.style.maskRepeat='no-repeat';element.style.maskSize='100% 100%';element.style.setProperty('-webkit-mask-size','100% 100%');
 const finish=()=>{running.delete(element);cancelAnimationFrame(raf);canvas.remove();element.style.removeProperty('mask-image');element.style.removeProperty('-webkit-mask-image');element.style.removeProperty('mask-size');element.style.removeProperty('-webkit-mask-size');element.style.removeProperty('mask-repeat')};
 running.set(element,finish);
 function draw(now:number){if(!element.isConnected){finish();return}const p=Math.min(1,(now-start)/duration);const step=Math.floor(p*20);
  if(step!==last){last=step;m!.clearRect(0,0,mask.width,mask.height);m!.fillStyle='#fff';for(const c of cells)if(p<c.at+.08)m!.fillRect(c.x*size,c.y*size,size,size);const url=`url("${mask.toDataURL()}")`;element.style.maskImage=url;element.style.setProperty('-webkit-mask-image',url)}
  ctx!.clearRect(0,0,canvas.width,canvas.height);for(const b of bits){const age=(p-b.at)/.45;if(age<0||age>1)continue;ctx!.globalAlpha=1-age;ctx!.fillStyle=b.color;ctx!.fillRect(100+b.x*size+b.dx*age,95+b.y*size+b.dy*age+28*age*age,b.s,b.s)}ctx!.globalAlpha=1;
  if(p<1)raf=requestAnimationFrame(draw);else{canvas.remove();element.style.visibility='hidden';finish()}
 }
 raf=requestAnimationFrame(draw);return duration+25;
}
