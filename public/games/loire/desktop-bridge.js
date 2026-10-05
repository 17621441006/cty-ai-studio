/* CTY window lifecycle. The original, self-contained game bundle stays intact. */
(()=>{
 'use strict';
 const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);
 let active=true,sequence=0;
 const pending=new Map();
 const stopped=()=>!active||document.hidden;
 function schedule(item,id){if(stopped()||item.native)return;item.native=request(time=>{item.native=0;if(stopped())return;pending.delete(id);item.callback(time)});}
 window.requestAnimationFrame=callback=>{const id=++sequence,item={callback,native:0};pending.set(id,item);schedule(item,id);return id;};
 window.cancelAnimationFrame=id=>{const item=pending.get(id);if(item?.native)cancel(item.native);pending.delete(id);};
 function synchronize(){
  if(stopped()){
   window.dispatchEvent(new Event('blur'));
   const pause=document.getElementById('pause');if(pause?.getAttribute('aria-label')==='暂停游戏')pause.click();
   for(const item of pending.values()){if(item.native)cancel(item.native);item.native=0;}
  }else for(const [id,item] of pending)schedule(item,id);
 }
 window.addEventListener('message',event=>{if(event.source!==parent||event.origin!==location.origin||event.data?.type!=='cty:game-visibility'||typeof event.data.active!=='boolean')return;active=event.data.active;synchronize();});
 document.addEventListener('visibilitychange',synchronize);
})();
