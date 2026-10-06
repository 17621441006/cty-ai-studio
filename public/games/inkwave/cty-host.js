/* CTY iframe lifecycle. Keep queued frames, but run no WebGL/UI work while hidden. */
(() => {
  const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);
  const pending=new Map(),listeners=new Set();
  let hostVisible=true,active=!document.hidden,seq=0,frame=0;
  function schedule(){if(active&&!frame&&pending.size)frame=request(flush)}
  function flush(time){frame=0;const batch=[...pending];for(const [id,callback]of batch){if(!active)break;if(pending.delete(id)){try{callback(time)}catch(error){setTimeout(()=>{throw error},0)}}}schedule()}
  window.requestAnimationFrame=callback=>{const id=++seq;pending.set(id,callback);schedule();return id};
  window.cancelAnimationFrame=id=>{pending.delete(id);if(!pending.size&&frame){cancel(frame);frame=0}};
  function update(){const next=hostVisible&&!document.hidden;if(next===active)return;active=next;document.documentElement.classList.toggle('cty-suspended',!active);if(!active&&frame){cancel(frame);frame=0}for(const fn of listeners)fn(active);schedule()}
  window.__ctyHost={get active(){return active},subscribe(fn){listeners.add(fn);fn(active);return()=>listeners.delete(fn)}};
  addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='cty:game-visibility'||typeof e.data.active!=='boolean')return;hostVisible=e.data.active;update()});
  document.addEventListener('visibilitychange',update);
  addEventListener('pagehide',()=>{hostVisible=false;update()});
  addEventListener('pageshow',()=>{hostVisible=true;update()});
  addEventListener('unhandledrejection',()=>{const el=document.getElementById('cty-boot');if(el)el.lastElementChild.textContent='加载遇到问题，请点击下方重载按钮重试。'});
})();
