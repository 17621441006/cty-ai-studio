// CTY Catch Stars: original moonlit pixel stage, with an isolated 120-second game model.
import {palette as C} from './cat-pixels-original.js';
import {createStarCatSkin, STAR_CAT_SIZE} from '../../../../lib/pixel-cat';
import {WIDTH, ROUND_SECONDS, clamp, createGame, startGame, stepGame, clearInput, resizeGame, formatTime, dragTarget} from './stars-game.mjs';

function element(tag, className, text) {
  const node=document.createElement(tag); if(className)node.className=className;
  if(text!=null)node.textContent=text; return node;
}
function pixelStar(ctx,x,y,size=4,color=C.goldHi){
  ctx.fillStyle=color;ctx.beginPath();
  for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,r=i%2?size*.32:size;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}
  ctx.closePath();ctx.fill();ctx.fillStyle=C.creamHi;ctx.fillRect(Math.round(x),Math.round(y),1,1);
}
function shield(ctx,x,y,size=1){
  ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.fillStyle='#79def0';ctx.strokeStyle='#dafaff';ctx.lineWidth=.8;
  ctx.beginPath();ctx.moveTo(-4,-5);ctx.lineTo(4,-5);ctx.lineTo(4,0);ctx.lineTo(0,5);ctx.lineTo(-4,0);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#246984';ctx.fillRect(-.7,-3,1.4,5);ctx.fillRect(-2,-1.7,4,1.4);ctx.restore();
}
export function createStarsRuntime(host={emit(){},isActive(){return true;}},{storageKey='cty-stars-best-120',sound={}}={}){
  const skin=createStarCatSkin(), game=createGame();
  const root=element('div','app game');root.tabIndex=-1;
  const score=element('span','gm-score px','0'),timer=element('span','gm-time px','2:00'),best=element('span','gm-best px');
  const timebar=element('span','gm-timebar');timebar.setAttribute('aria-hidden','true');
  for(let i=0;i<15;i++)timebar.append(element('i','is-on'));
  const hud=element('div','gm-hud'),left=element('span','gm-hud__l'),middle=element('span','gm-hud__m');
  left.append(element('span','gm-star','★'),score);middle.append(timebar,timer);hud.append(left,middle,best);
  const stage=element('div','gm-stage'),canvas=element('canvas','gm-cv'),overlay=element('div','gm-ov');
  canvas.width=WIDTH*2;canvas.height=game.height*2;canvas.setAttribute('aria-label','接星星游戏：左右拖动小猫，或使用方向键。每局两分钟。');
  const ctx=canvas.getContext('2d'),power=element('div','gm-power'),hint=element('div','gm-drag-hint','在画面任意位置左右拖动 · 不用按键');
  power.setAttribute('role','status');power.setAttribute('aria-live','polite');stage.append(canvas,power,overlay);root.append(hud,stage,hint);
  let high=0;try{high=Number(localStorage.getItem(storageKey))||0;}catch{}
  let visible=false,destroyed=false,raf=0,lastFrame=0,paintTime=0,background=null,drag=null;
  let parts=[],pops=[],rings=[],lastHud='',lastStatus='',newBest=false,smokeIn=0;
  const soundCall=(name,...args)=>{if(typeof sound[name]==='function')sound[name](...args);};
  const floor=()=>game.height-12;
  function updateHud(){
    const signature=[game.score,Math.ceil(game.time),Math.ceil(game.cat.invincible),Math.ceil(game.cat.shield),Math.ceil(game.cat.dizzy),high,game.state].join(':');
    if(signature===lastHud)return;lastHud=signature;
    score.textContent=String(game.score);timer.textContent=formatTime(game.time);best.textContent=`最高 ${high}`;
    timer.setAttribute('aria-label',`剩余 ${Math.ceil(game.time)} 秒`);
    const segments=Math.ceil(game.time/ROUND_SECONDS*15);Array.from(timebar.children).forEach((node,i)=>node.classList.toggle('is-on',i<segments));
    root.classList.toggle('is-hurry',game.state==='playing'&&game.time<=10);
    const statuses=[];if(game.cat.invincible>0)statuses.push(`✦ 无敌 ${Math.ceil(game.cat.invincible)}s`);
    if(game.cat.shield>0)statuses.push(`◇ 护盾 ${Math.ceil(game.cat.shield)}s`);
    if(game.cat.dizzy>0)statuses.push(`晕乎乎 ${game.cat.dizzy.toFixed(1)}s`);
    const status=statuses.join('　');if(status!==lastStatus){power.textContent=status;lastStatus=status;}power.hidden=!status;
  }
  function button(label,action){const node=element('button','btn btn--gold gm-go',label);node.type='button';node.addEventListener('click',action);return node;}
  function renderOverlay(){
    overlay.replaceChildren();overlay.hidden=game.state==='playing';if(overlay.hidden)return;
    if(game.state==='title'){
      overlay.append(element('small','gm-eyebrow','MOONLIGHT ARCADE · 02:00'),element('div','gm-ov__t px','接星星'),element('p','gm-ov__p','跟着脏脏包，在月光下接一场星星雨。'));
      const legend=element('div','gm-ov__legend');
      for(const [mark,text] of [['★','金星 +1 · 连击加分'],['✦','闪光星 +5 · 无敌 5 秒'],['◇','头顶护盾 · 挡伤害 5 秒'],['■','蓝方块 −3 · 短暂眩晕'],['☄','斜落陨石 −10 · 眩晕 2.8 秒'],['●','抛物线炸弹 −7 · 变成小煤球']]){const row=element('span');row.append(element('b','',mark),document.createTextNode(text));legend.append(row);}
      overlay.append(legend,element('p','gm-ov__keys','手机左右拖动 · 电脑 ← → / A D / 鼠标'),button('开始 · 2 分钟',start));
    }else if(game.state==='paused'){
      overlay.append(element('div','gm-ov__t px','休息一下'),element('p','gm-ov__p','时间和道具效果都已暂停。'),button('继续接星星',resume));
    }else{
      overlay.append(element('div','gm-ov__t px','星夜收工！'),element('div','gm-ov__score px',`★ ${game.score}`),element('p','gm-ov__p',`接住 ${game.caught} 颗 · 最高连击 ${game.maxCombo}`),element('p',newBest?'gm-ov__new px':'gm-ov__dim',newBest?'新纪录！':`两分钟最高分 ${high}`),button('再来一场星星雨',start));
    }
  }
  function releaseInput(){clearInput(game);const previous=drag;drag=null;if(previous){try{canvas.releasePointerCapture(previous.id);}catch{}}}
  function start(){startGame(game);newBest=false;parts=[];pops=[];rings=[];smokeIn=0;releaseInput();renderOverlay();updateHud();root.focus({preventScroll:true});soundCall('select');host.emit('game',{type:'start'});}
  function pause(){if(game.state==='playing'){game.state='paused';releaseInput();renderOverlay();updateHud();}}
  function resume(){if(game.state==='paused'){game.state='playing';releaseInput();renderOverlay();updateHud();root.focus({preventScroll:true});}}
  function makeBackground(){
    background=document.createElement('canvas');background.width=WIDTH;background.height=game.height;
    const b=background.getContext('2d'),gradient=b.createLinearGradient(0,0,0,game.height);
    gradient.addColorStop(0,C.night0);gradient.addColorStop(.7,C.night2);gradient.addColorStop(1,C.night3);b.fillStyle=gradient;b.fillRect(0,0,WIDTH,game.height);
    b.fillStyle='rgba(244,228,196,.09)';b.beginPath();b.arc(136,22,17,0,Math.PI*2);b.fill();
    for(let y=-11;y<=11;y++)for(let x=-11;x<=11;x++)if(x*x+y*y<=121){b.fillStyle=(x*7+y*13+99)%9===0?C.blue8:x+y<-6?C.creamHi:C.cream;b.fillRect(136+x,22+y,1,1);}
    for(let i=0;i<48;i++){b.fillStyle=i%5?'#617b9c':C.goldHi;b.fillRect((i*37)%WIDTH,(i*53)%(game.height-40),1,1);}
    // Blue mosaic ground stays static and is drawn only when the viewport changes.
    for(let x=0;x<WIDTH;x+=4)for(let y=floor();y<game.height;y+=4){const c=(x*7+y*3)%11;b.fillStyle=y===floor()?(c<6?C.goldHi:C.cream):(c<3?C.blue8:c<7?C.blue6:C.blue5);b.fillRect(x,y,3,3);b.fillStyle='rgba(255,255,255,.2)';b.fillRect(x,y,3,1);}
  }
  function resize(){
    if(!root.clientWidth||!root.clientHeight)return;
    const w=Math.max(1,Math.min(680,root.clientWidth-24)),h=Math.max(1,root.clientHeight-hud.offsetHeight-hint.offsetHeight-48);
    const scale=Math.min(w/WIDTH,h/120),height=clamp(Math.floor(h/scale),120,260);
    if(height!==game.height||!background){resizeGame(game,height);canvas.height=height*2;makeBackground();}
    const width=WIDTH*scale,displayHeight=height*scale;
    canvas.style.width=stage.style.width=`${width}px`;canvas.style.height=stage.style.height=`${displayHeight}px`;
    draw();
  }
  function burst(x,y,colors,count=10){
    for(let i=0;i<count&&parts.length<100;i++){const angle=Math.random()*Math.PI*2,speed=10+Math.random()*35;parts.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-12,life:.4+Math.random()*.3,age:0,color:colors[i%colors.length],smoke:false});}
  }
  function processEvents(){
    for(const event of game.events){
      if(event.kind==='over'){
        if(game.score>high){high=game.score;newBest=true;try{localStorage.setItem(storageKey,String(high));}catch{}}
        renderOverlay();soundCall('sparkle');host.emit('game',{type:'over',score:game.score});continue;
      }
      const warm=event.type==='meteor'||event.type==='bomb';
      if(event.kind==='hit'){
        burst(event.x,event.y,warm?['#ffc67d','#d9975d','#a59485']:[C.blue7,C.blue8],16);
        if(event.type==='bomb')rings.push({x:event.x,y:event.y,age:0,color:'#ffdba0'});
        pops.push({x:game.cat.x,y:floor()-31,text:`−${event.points}`,color:'#ffbe9d',age:0});soundCall('blip',220,.055);
      }else if(event.kind==='blocked'){
        burst(event.x,event.y,['#d8fcff','#79d9ec'],8);rings.push({x:event.x,y:event.y,age:0,color:'#a7ecf1'});
      }else if(event.kind==='ground'){burst(event.x,event.y,['#728499','#b8a989'],4);}
      else{
        burst(event.x,event.y,event.type==='shield'?['#79def0','#dafaff']:[C.gold,C.goldHi,C.creamHi],12);
        pops.push({x:event.x,y:event.y-4,text:event.type==='shield'?'护盾 5s':event.type==='flash'?'无敌 5s':`+${event.points}`,color:event.type==='shield'?'#99ebef':C.goldHi,age:0});soundCall(event.type==='star'?'hover':'sparkle',game.combo);
      }
    }
    game.events.length=0;
  }
  function animateEffects(dt){
    for(const p of parts){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(!p.smoke)p.vy+=55*dt;}
    parts=parts.filter(p=>p.age<p.life);for(const p of pops)p.age+=dt;pops=pops.filter(p=>p.age<1.1);
    for(const ring of rings)ring.age+=dt;rings=rings.filter(r=>r.age<.5);
    smokeIn-=dt;if(game.cat.soot>0&&smokeIn<=0){smokeIn=.13;if(parts.length<100)parts.push({x:game.cat.x+(Math.random()-.5)*11,y:floor()-25,vx:(Math.random()-.5)*5,vy:-8,life:.9,age:0,color:'#aeb8c8',smoke:true});}
  }
  function drawItem(item){
    const x=item.x,y=item.y,time=item.age;
    if(item.warning>0){
      const edge=clamp(x,8,WIDTH-8);ctx.globalAlpha=.55+.35*Math.sin(paintTime*10);ctx.fillStyle='#ffca8f';ctx.fillRect(edge-4,8,8,9);ctx.fillStyle='#392a3b';ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.fillText('!',edge,15);ctx.globalAlpha=1;return;
    }
    if(item.type==='meteor'){
      const len=24,hypot=Math.hypot(item.vx,item.vy),dx=-item.vx/hypot,dy=-item.vy/hypot;
      ctx.fillStyle='#dd7c4355';ctx.beginPath();ctx.moveTo(x+5,y);ctx.lineTo(x+dx*len,y+dy*len);ctx.lineTo(x-5,y);ctx.fill();
      ctx.fillStyle='#ffcf86';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#986d67';ctx.fillRect(x-3,y-3,6,6);ctx.fillStyle='#dca477';ctx.fillRect(x-3,y-3,4,2);
    }else if(item.type==='bomb'){
      ctx.save();ctx.translate(x,y);ctx.rotate(time*2);ctx.strokeStyle='#c59f65';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-4);ctx.quadraticCurveTo(4,-9,5,-5);ctx.stroke();pixelStar(ctx,5,-5,1.8,'#ffd68b');ctx.fillStyle='#050b16';ctx.strokeStyle='#818d9e';ctx.beginPath();ctx.arc(0,0,4.5,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#919baa';ctx.fillRect(-2,-3,2,1);ctx.restore();
    }else if(item.type==='block'){
      ctx.fillStyle=C.grout;ctx.fillRect(x-4,y-4,8,8);ctx.fillStyle=C.blue6;ctx.fillRect(x-3,y-3,6,6);ctx.fillStyle=C.blue8;ctx.fillRect(x-3,y-3,6,1);
    }else if(item.type==='shield')shield(ctx,x,y);
    else{
      const flash=item.type==='flash';if(flash){ctx.globalAlpha=.12+.1*Math.sin(time*8);ctx.fillStyle='#fff2b8';ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;pixelStar(ctx,x+7,y-5,1.5,'#b7eff3');}
      pixelStar(ctx,x,y,flash?6:3.5,flash?(Math.sin(time*7)>0?'#fff8d9':'#efc46b'):C.goldHi);
    }
  }
  function draw(){
    if(!background||!ctx)return;
    ctx.setTransform(2,0,0,2,0,0);ctx.imageSmoothingEnabled=false;ctx.globalAlpha=1;ctx.drawImage(background,0,0);
    for(let i=0;i<8;i++){ctx.globalAlpha=.35+.45*(.5+.5*Math.sin(paintTime*(.6+i*.05)+i));pixelStar(ctx,(i*41+9)%WIDTH,(i*29+11)%(game.height-50),i%3?1:2,C.creamHi);}ctx.globalAlpha=1;
    for(const item of game.items)drawItem(item);
    const cat=game.cat,y=floor();ctx.fillStyle='#020a2155';ctx.fillRect(cat.x-11,y-1,22,2);
    if(cat.invincible>0){ctx.strokeStyle='#fff0b8';ctx.fillStyle='#f6d78314';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(cat.x,y-14,17,20,0,0,Math.PI*2);ctx.fill();ctx.stroke();for(let i=0;i<4;i++){const a=paintTime*2+i*Math.PI/2;pixelStar(ctx,cat.x+Math.cos(a)*17,y-14+Math.sin(a)*19,2,'#fff7c9');}}
    skin.draw(ctx,cat.x,y,{walking:cat.moving>0&&cat.dizzy<=0&&game.state==='playing',walkTime:cat.walkT,face:cat.face,dizzy:cat.dizzy>0,soot:cat.soot>0,time:paintTime});
    if(cat.shield>0){
      ctx.strokeStyle='#92e7f3';ctx.lineWidth=1.3;ctx.fillStyle='#a2ecff30';ctx.beginPath();ctx.ellipse(cat.x,y-28,16,5,0,Math.PI,Math.PI*2);ctx.lineTo(cat.x+16,y-28);ctx.lineTo(cat.x-16,y-28);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.strokeStyle='#d9f9f7';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(cat.x+8,y-13);ctx.lineTo(cat.x+10,y-27);ctx.stroke();
    }
    if(cat.dizzy>0)for(let i=0;i<3;i++){const a=paintTime*6+i*2.1;pixelStar(ctx,cat.x+Math.cos(a)*8,y-STAR_CAT_SIZE.height-3+Math.sin(a)*2,1.6,i?'#a4d6eb':C.goldHi);}
    for(const p of parts){ctx.globalAlpha=(1-p.age/p.life)*(p.smoke?.5:1);ctx.fillStyle=p.color;const size=p.smoke?2+p.age*3:1;ctx.fillRect(Math.round(p.x),Math.round(p.y),size,size);}ctx.globalAlpha=1;
    for(const ring of rings){ctx.globalAlpha=1-ring.age/.5;ctx.strokeStyle=ring.color;ctx.lineWidth=1;ctx.beginPath();ctx.arc(ring.x,ring.y,3+ring.age*30,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;
    ctx.textAlign='center';ctx.font='5px monospace';for(const p of pops){ctx.globalAlpha=Math.min(1,(1.1-p.age)*2);ctx.fillStyle=p.color;ctx.fillText(p.text,clamp(p.x,17,143),p.y-p.age*12);}ctx.globalAlpha=1;
  }
  function frame(now){
    raf=0;if(destroyed||!visible||document.hidden)return;
    const dt=lastFrame?Math.min((now-lastFrame)/1000,.06):0;lastFrame=now;
    if(game.state!=='paused')paintTime+=dt;
    if(game.state==='playing'){
      // Fixed small collision steps prevent quick hazards tunnelling through the cat.
      let remaining=dt;while(remaining>0){const step=Math.min(remaining,1/60);stepGame(game,step);remaining-=step;}
      processEvents();animateEffects(dt);updateHud();
    }
    draw();raf=requestAnimationFrame(frame);
  }
  function startLoop(){if(!raf&&visible&&!document.hidden&&!destroyed){lastFrame=0;raf=requestAnimationFrame(frame);}}
  function stopLoop(){cancelAnimationFrame(raf);raf=0;lastFrame=0;}
  function pointerDown(event){
    if(game.state!=='playing'||drag||(!event.isPrimary)||event.button>0)return;
    event.preventDefault();root.focus({preventScroll:true});drag={id:event.pointerId,startClientX:event.clientX,startCatX:game.cat.x,width:canvas.getBoundingClientRect().width};
    game.input.target=game.cat.x;game.input.dragging=true;canvas.setPointerCapture(event.pointerId);hint.classList.add('is-used');
  }
  function pointerMove(event){
    if(game.state!=='playing')return;
    if(drag&&event.pointerId===drag.id){event.preventDefault();game.input.target=dragTarget(drag.startCatX,drag.startClientX,event.clientX,drag.width);}
    else if(event.pointerType==='mouse'&&!drag){const rect=canvas.getBoundingClientRect();game.input.target=clamp((event.clientX-rect.left)/rect.width*WIDTH,13,147);}
  }
  function pointerUp(event){if(drag&&event.pointerId===drag.id)releaseInput();}
  function pointerLeave(event){if(!drag&&event.pointerType==='mouse')game.input.target=null;}
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('lostpointercapture',pointerUp);canvas.addEventListener('pointerleave',pointerLeave);
  function key(event,pressed){
    if(!visible||!host.isActive('game')||event.target.closest?.('input,textarea,select,[contenteditable]'))return;
    if(['ArrowLeft','a','A','ArrowRight','d','D'].includes(event.key)){
      game.input[['ArrowLeft','a','A'].includes(event.key)?'left':'right']=pressed;game.input.target=null;event.preventDefault();
    }
    if(pressed&&!event.repeat&&['p','P','Escape'].includes(event.key)){game.state==='playing'?pause():resume();event.preventDefault();}
    if(pressed&&!event.repeat&&[' ','Enter'].includes(event.key)&&!event.target.closest?.('button')){if(game.state==='title'||game.state==='over')start();else if(game.state==='paused')resume();event.preventDefault();}
  }
  const keyDown=e=>key(e,true),keyUp=e=>key(e,false),blur=()=>{releaseInput();pause();};
  const visibility=()=>{if(document.hidden){blur();stopLoop();}else startLoop();};
  const observer=new ResizeObserver(()=>{if(root.clientWidth&&root.clientHeight)resize();});observer.observe(root);
  window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);document.addEventListener('keydown',keyDown);document.addEventListener('keyup',keyUp);
  renderOverlay();updateHud();
  return {el:root,start,pause,resume,get state(){return game.state;},get score(){return game.score;},
    onShow(){visible=true;resize();startLoop();},onHide(){visible=false;pause();releaseInput();stopLoop();},onResize:resize,
    focusTarget:()=>game.state==='playing'?root:overlay.querySelector('button')||root,
    peek(){return {cat:{...game.cat},items:game.items.map(item=>({...item})),time:game.time};},
    destroy(){destroyed=true;visible=false;stopLoop();releaseInput();skin.dispose();observer.disconnect();window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);document.removeEventListener('keydown',keyDown);document.removeEventListener('keyup',keyUp);parts=[];pops=[];rings=[];game.items=[];}
  };
}
