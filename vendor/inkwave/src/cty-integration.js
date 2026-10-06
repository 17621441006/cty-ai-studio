// CTY adapter: parent-window pause, soft audio defaults, and touch input.
export function installCTYGame(game,G){
  document.getElementById('cty-boot')?.remove();
  let audioWasRunning=false;
  const unsubscribe=window.__ctyHost?.subscribe(active=>{
    game.input.keys.clear();game.input.pressed.clear();
    game.input.mouse.left=game.input.mouse.right=false;
    game.input.mouse.dx=game.input.mouse.dy=0;
    game.ctyTouch?.reset();
    if(!active){
      game.pause();game.input.exitLock();
      audioWasRunning=G.audio?.ctx?.state==='running';
      G.music?.pause?.();G.audio?.ctx?.suspend?.().catch(()=>{});
    }else{
      game.timer.reset?.();game._lastTs=undefined;
      if(game.menus)game.menus._lastT=performance.now();
      if(audioWasRunning){G.audio?.resume?.();if(!game.match?.paused)G.music?.resume?.()}
    }
  });
  if(matchMedia('(pointer: coarse)').matches)game.ctyTouch=installTouch(game,G);
  addEventListener('pagehide',e=>{if(e.persisted)return;unsubscribe?.();G.music?.pause?.();G.audio?.ctx?.close?.().catch(()=>{});});
  parent.postMessage({type:'cty:inkwave-ready'},location.origin);
}

export function installTouch(game,G){
  const input=game.input;input.touchEnabled=true;
  const el=document.createElement('div');el.className='cty-touch';el.hidden=true;
  el.innerHTML='<div class="cty-aim" aria-label="拖动调整视角"></div><div class="cty-stick" aria-label="移动摇杆"><i></i></div><div class="cty-touch-actions"><button data-key="ShiftLeft">潜墨</button><button data-key="Space">跳跃</button><button data-key="KeyE">副武器</button><button data-key="KeyF">大招</button><button class="cty-fire" data-fire="true">开火</button></div><button class="cty-map" data-key="Tab">地图</button><button class="cty-pause">暂停</button>';
  document.body.append(el);
  const hold=new Map(),directions=['KeyW','KeyA','KeyS','KeyD'];
  const key=(code,on)=>{if(on){if(!input.keys.has(code))input.pressed.add(code);input.keys.add(code)}else input.keys.delete(code)};
  for(const button of el.querySelectorAll('[data-key],[data-fire]')){
    const set=on=>{if(button.dataset.fire){input.mouse.left=on;if(on)input.mouse.leftPressed=true}else key(button.dataset.key,on);button.classList.toggle('held',on)};
    button.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();button.setPointerCapture(e.pointerId);hold.set(e.pointerId,()=>set(false));set(true);G.audio?.init?.()});
    const end=e=>{hold.get(e.pointerId)?.();hold.delete(e.pointerId)};
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,end);
  }
  const stick=el.querySelector('.cty-stick'),knob=stick.firstElementChild;
  let stickId=null,aimId=null,start=null,last=null;
  function stickEnd(){directions.forEach(k=>key(k,false));knob.style.transform='';stickId=null}
  stick.addEventListener('pointerdown',e=>{e.preventDefault();if(stickId!==null)return;stickId=e.pointerId;start={x:e.clientX,y:e.clientY};stick.setPointerCapture(e.pointerId)});
  stick.addEventListener('pointermove',e=>{if(e.pointerId!==stickId)return;const dx=e.clientX-start.x,dy=e.clientY-start.y,len=Math.hypot(dx,dy),scale=Math.min(1,35/(len||1));knob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;key('KeyA',dx< -9);key('KeyD',dx>9);key('KeyW',dy< -9);key('KeyS',dy>9)});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(type,e=>{if(e.pointerId===stickId)stickEnd()});
  const aim=el.querySelector('.cty-aim');
  aim.addEventListener('pointerdown',e=>{if(aimId!==null)return;aimId=e.pointerId;last={x:e.clientX,y:e.clientY};aim.setPointerCapture(e.pointerId)});
  aim.addEventListener('pointermove',e=>{if(e.pointerId!==aimId)return;input.mouse.dx+=(e.clientX-last.x)*2;input.mouse.dy+=(e.clientY-last.y)*2;last={x:e.clientX,y:e.clientY}});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])aim.addEventListener(type,e=>{if(e.pointerId===aimId)aimId=null});
  el.querySelector('.cty-pause').addEventListener('click',()=>game.pause());
  function reset(){for(const release of hold.values())release();hold.clear();stickEnd();aimId=null}
  return {reset,update(){const show=G.mode==='match'&&game.match&&!game.match.attract&&!game.match.paused&&!game.menus?.current;if(el.hidden===!!show){el.hidden=!show;if(!show)reset()}}};
}
