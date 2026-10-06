/* Original artwork, procedural sound, and local campaign for AFTERSPAN. */
(()=>{'use strict';
const {Game,W,H,DT,SaveStore}=Afterspan,$=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d');
let storage;try{storage=window.localStorage;}catch{storage={getItem(){throw Error('unavailable');},setItem(){throw Error('unavailable');},removeItem(){}};}
const save=new SaveStore(storage,Afterspan.ROOMS);
let game=new Game(Afterspan.ROOMS),mode='menu',muted=!save.data.settings.sound,audio=null,musicClock=0,musicStep=0,fx=save.data.settings.effects,last=performance.now(),acc=0,visualTime=0,flash=0,reject=0,blocks=[],particles=[],echoes=[],toastTime=0,keys={},pressed={};
let rafId=0,hostInactive=false;const touches=new Map();let touchPressed={};
function clearInput(){keys={};pressed={};touches.clear();touchPressed={};document.querySelectorAll('[data-touch-code]').forEach(b=>b.classList.remove('held'));}
function touchHeld(code){return [...touches.values()].includes(code);}
function scheduleFrame(){if(!rafId&&!hostInactive&&!document.hidden)rafId=requestAnimationFrame(frame);}
function stopFrame(){if(rafId)cancelAnimationFrame(rafId);rafId=0;acc=0;}
function synchronize(){if(hostInactive||document.hidden){clearInput();if(mode==='play')pause();stopFrame();audio?.suspend().catch(()=>{});}else{last=performance.now();acc=0;scheduleFrame();}}
window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='cty:game-visibility'||typeof e.data.active!=='boolean')return;hostInactive=!e.data.active;synchronize();});
for(const button of document.querySelectorAll('[data-touch-code]')){
 const code=button.dataset.touchCode;
 button.addEventListener('pointerdown',e=>{e.preventDefault();if(mode!=='play')return;button.setPointerCapture(e.pointerId);if(!touchHeld(code))touchPressed[code]=true;touches.set(e.pointerId,code);button.classList.add('held');initAudio();});
 const release=e=>{touches.delete(e.pointerId);button.classList.toggle('held',touchHeld(code));};
 button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
}
const palettes=[{sky:'#0d202d',fog:'#2c5260',far:'#193541',mid:'#23414c',metal:'#142a36',edge:'#42717b',light:'#8ee3db',ghost:'#d9a96b',warm:false},{sky:'#292528',fog:'#80604a',far:'#433c36',mid:'#655045',metal:'#342e2b',edge:'#92775b',light:'#ffd38d',ghost:'#8adbe7',warm:true}];
function tone(freq,duration=.08,type='sine',gain=.06,end){if(!audio||muted||hostInactive||document.hidden)return;const o=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime;o.type=type==='sawtooth'?'triangle':type;o.frequency.setValueAtTime(freq,now);if(end)o.frequency.exponentialRampToValueAtTime(end,now+duration);g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(Math.min(gain,.07)*.45,now+Math.min(.025,duration/3));g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(g);g.connect(audio.destination);o.onended=()=>{o.disconnect();g.disconnect()};o.start();o.stop(now+duration+.02);}
function initAudio(){try{if(!audio){const Audio=window.AudioContext||window.webkitAudioContext;if(Audio)audio=new Audio();}audio?.resume().catch(()=>{});}catch{}}
function sound(type){if(type==='shift'){tone(game.timeline?330:494,.20,'sine',.06,game.timeline?494:330);setTimeout(()=>tone(660,.24,'sine',.035),70);}else if(type==='reject'){tone(330,.13,'sine',.04,294);setTimeout(()=>tone(294,.15,'sine',.03),90);}else if(type==='jump'||type==='walljump')tone(392,.14,'triangle',.045,587);else if(type==='burst')tone(294,.18,'triangle',.035,262);else if(type==='land')tone(262,.12,'sine',.035,247);else if(type==='complete'){tone(523,.24,'sine',.055);setTimeout(()=>tone(784,.28,'sine',.04),110);}}
function burst(x,y,color,n=10,speed=70){for(let i=0;i<n;i++){let a=Math.random()*Math.PI*2,v=20+Math.random()*speed;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.2+Math.random()*.3,max:.5,color});}}
function processEvents(){
 for(const e of game.events){sound(e.type);const p=game.p;
  if(e.type==='shift'){toast(game.timeline?'2076 · 已回到过去':'2091 · 已返回现在',1.3);flash=.12;echoes.push({x:p.x,y:p.y,life:.18,t:1-game.timeline});burst(p.x+9,p.y+14,palettes[game.timeline].light,12,65);}
  if(e.type==='reject'){reject=.22;blocks=e.blocks;toast('目标时空有障碍物 · 移到空处再按 Q',1.8);}
  if(e.type==='jump'||e.type==='walljump'||e.type==='land')burst(p.x+9,p.y+28,'#bfd7cc',7,42);
  if(e.type==='slide')burst(p.x+(p.wall===1?19:0),p.y+20,'#aad3ce',1,14);
  if(e.type==='burst')burst(e.x,e.y,'#ffb187',25,145);
  if(e.type==='room'){particles=[];echoes=[];flash=0;reject=0;updateHUD();}
  if(e.type==='death'){save.death(e.index);updateStorage();}
  if(e.type==='complete'){save.complete(e.index,e.time);updateStorage();}
  if(e.type==='win')win();
 }game.events=[];
}
function toast(s,t=2){$('toast').textContent=s;toastTime=t;}
function duration(t){return String(Math.floor(t/60)).padStart(2,'0')+':'+(t%60).toFixed(1).padStart(4,'0');}
function updateHUD(){const r=game.room;$('sector').textContent=String(game.roomIndex+1).padStart(2,'0')+' / 22 — '+Afterspan.SECTIONS[r.section];$('room-title').textContent=r.name;$('hint').textContent=r.hint;}
function updateStorage(){
 $('save-state').textContent=save.status==='saved'?'● LOCAL SAVE':'○ SESSION ONLY';
 $('storage-notice').textContent=save.status==='saved'?'':save.message;
 const count=Afterspan.ROOMS.filter(r=>save.data.rooms[r.id]?.completed).length;
 $('progress-summary').textContent=`${count} / 22 COMPLETE · ${save.data.totalDeaths} FALLS · SAVED ON THIS DEVICE`;
 const hasProgress=save.data.started||save.data.highestUnlocked>0||save.data.totalDeaths>0||count>0;
 $('continue').hidden=!hasProgress;
 $('start').title='Begin at room 1. Existing unlocks and records are kept; Reset Save clears them.';
}
function hidePanels(){for(const id of ['menu','pause-menu','room-menu','win','reset-menu'])$(id).hidden=true;}
function start(i=0){
 if(!save.select(i))return;
 initAudio();game=new Game(Afterspan.ROOMS);game.load(i);mode='play';clearInput();hidePanels();$('hud').hidden=false;$('hint').hidden=false;particles=[];echoes=[];updateHUD();updateStorage();canvas.focus();
}
function pause(){if(mode==='pause')initAudio();if(mode==='play'){mode='pause';clearInput();$('pause-menu').hidden=false;}else if(mode==='pause'){mode='play';$('pause-menu').hidden=true;canvas.focus();}}
function directory(){
 hidePanels();mode='directory';clearInput();$('hud').hidden=true;$('hint').hidden=true;$('room-menu').hidden=false;$('room-grid').innerHTML='';
 $('directory-stats').textContent=`${save.data.highestUnlocked+1} / 22 UNLOCKED · ${save.data.totalDeaths} TOTAL FALLS`;
 Afterspan.SECTIONS.forEach((name,section)=>{
  const heading=document.createElement('h3');heading.textContent=String(section+1).padStart(2,'0')+' / '+name;$('room-grid').append(heading);
  const group=document.createElement('div');group.className='section-rooms';$('room-grid').append(group);
  Afterspan.ROOMS.forEach((r,i)=>{if(r.section!==section)return;const record=save.data.rooms[r.id],locked=i>save.data.highestUnlocked,b=document.createElement('button');
   b.disabled=locked;b.innerHTML='<b>'+String(i+1).padStart(2,'0')+(record?.completed?' · COMPLETE':'')+(locked?' <span class="locked">LOCKED</span>':'')+'</b>'+r.name+'<small>'+(locked?'Complete the previous room':`${record?.deaths||0} falls${record?.bestTime?' · BEST '+duration(record.bestTime):''}`)+'</small>';
   b.onclick=()=>start(i);group.append(b);
  });
 });
}
function win(){mode='win';$('hud').hidden=true;$('hint').hidden=true;$('win').hidden=false;$('win-stats').textContent=`22 rooms complete · ${save.data.totalDeaths} total falls · ${save.status==='saved'?'Progress saved on this device.':'Progress kept for this session.'}`;}
function home(){mode='menu';hidePanels();$('menu').hidden=false;$('hud').hidden=true;$('hint').hidden=true;clearInput();document.body.classList.remove('past');updateStorage();}
$('start').onclick=()=>{start(0);if(save.data.highestUnlocked>0)toast('NEW RUN · your unlocked rooms and records are kept',3);};
$('continue').onclick=()=>start(Math.max(0,save.index(save.data.resumeRoom)));
$('pause').onclick=pause;$('resume').onclick=pause;
$('restart').onclick=()=>{initAudio();game.restart();mode='play';$('pause-menu').hidden=true;clearInput();canvas.focus();};
$('select').onclick=directory;$('rooms').onclick=directory;$('room-back').onclick=home;$('back').onclick=home;$('again').onclick=()=>start();$('win-rooms').onclick=directory;
$('home').onclick=e=>{e.preventDefault();home();};
$('effects').checked=fx;$('effects').onchange=e=>{fx=e.target.checked;save.setting('effects',fx);updateStorage();};
function updateSound(){$('sound').innerHTML='SOUND <span>'+(muted?'OFF':'ON')+'</span>';}
$('sound').onclick=()=>{initAudio();muted=!muted;save.setting('sound',!muted);updateSound();updateStorage();};updateSound();
$('fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else $('app').requestFullscreen().catch(()=>toast('Fullscreen is unavailable in this preview.'));};
$('reset-save').onclick=()=>{hidePanels();mode='reset';$('reset-menu').hidden=false;};$('reset-cancel').onclick=home;
$('reset-confirm').onclick=()=>{save.reset();muted=!save.data.settings.sound;fx=save.data.settings.effects;$('effects').checked=fx;updateSound();home();};
const handled=['ArrowLeft','ArrowRight','Space','KeyA','KeyD','KeyQ','KeyR','Escape'];
window.addEventListener('keydown',e=>{if(!handled.includes(e.code))return;if(mode==='play'||e.code==='Escape')e.preventDefault();if(e.code==='Escape'&&!e.repeat){if(mode==='directory'||mode==='reset')home();else pause();return;}if(!keys[e.code]&&!e.repeat)pressed[e.code]=true;keys[e.code]=true;});
window.addEventListener('keyup',e=>{keys[e.code]=false;});
window.addEventListener('blur',()=>{clearInput();if(mode==='play')pause();});
document.addEventListener('visibilitychange',synchronize);
function held(){return {left:keys.KeyA||keys.ArrowLeft||touchHeld('ArrowLeft'),right:keys.KeyD||keys.ArrowRight||touchHeld('ArrowRight'),jumpHeld:keys.Space||touchHeld('Space')};}
function input(){const i={...held(),jump:pressed.Space||touchPressed.Space,shift:pressed.KeyQ||touchPressed.KeyQ,restart:pressed.KeyR};pressed={};touchPressed={};return i;}
function box(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}function line(x1,y1,x2,y2,c,width=1){ctx.strokeStyle=c;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}function poly(points,c){ctx.fillStyle=c;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();}function text(s,x,y,color='#8aa4af',size=9){ctx.fillStyle=color;ctx.font=`${size}px Consolas,monospace`;ctx.fillText(s,x,y);}function circle(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function background(t,menu=false){const c=palettes[t];let grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,c.sky);grad.addColorStop(.76,c.fog);grad.addColorStop(1,c.sky);ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 // Receding ridgelines far below a suspended, visibly continuous station.
 poly([[0,410],[95,363],[150,388],[248,328],[335,399],[429,348],[530,413],[657,354],[775,395],[889,314],[1000,380],[1120,337],[1120,600],[0,600]],c.far);
 poly([[0,475],[111,414],[234,483],[383,426],[535,492],[700,430],[840,476],[995,406],[1120,440],[1120,600],[0,600]],c.mid);
 for(let i=0;i<5;i++){let y=442+i*31;box(0,y,W,9,t?'#b99d7520':'#b5dfdf12');}
 // The distant station hangs on cables, over the same mountain silhouettes.
 const sx=menu?630:780,sy=menu?190:255;line(sx+25,0,sx+25,sy+140,'#10202ae0',3);line(sx+231,0,sx+231,sy+140,'#10202ae0',3);box(sx,sy,270,68,'#152630');box(sx-24,sy+15,318,8,'#294550');box(sx+40,sy+68,180,42,'#1a303a');poly([[sx+40,sy+110],[sx+220,sy+110],[sx+175,sy+180],[sx+95,sy+180]],'#162c37');for(let i=0;i<12;i++)box(sx+10+i*22,sy+26,11,7,t?'#e0ad6f':'#6d989a');line(sx-120,sy+40,sx+340,sy+40,'#223945',4);for(let i=0;i<6;i++)line(sx-110+i*70,sy+42,sx-75+i*70,sy+70,'#304c55',2);
 // Shared frame, mullions and numbered research equipment keep the eras legible.
 for(let i=0;i<5;i++){let x=56+i*250;box(x,0,11,480,'#101e29aa');line(x+11,0,x+11,480,c.edge+'66');line(x+15,110,x+233,315,'#162c3680',3);}
 box(0,82,W,8,'#101f2b');line(0,90,W,90,c.edge+'66');box(0,335,W,6,'#182c36aa');
 for(let i=0;i<4;i++){let x=96+i*280;box(x,96,92,6,'#14252e');const lit=t||Math.sin(visualTime*7.3+i*14)<.965;box(x+4,101,t?84:38,2,c.light+(lit?'aa':'22'));let glow=ctx.createLinearGradient(x,104,x,170);glow.addColorStop(0,c.light+(lit?'13':'03'));glow.addColorStop(1,c.light+'00');ctx.fillStyle=glow;ctx.fillRect(x-14,104,118,70);}
 // Monumental phase resonator: original nested industrial silhouette.
 const rx=menu?790:565,ry=menu?265:284;ctx.save();ctx.translate(rx,ry);ctx.strokeStyle=c.light+'12';ctx.lineWidth=24;ctx.beginPath();ctx.arc(0,0,147,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=c.light+'38';ctx.lineWidth=1;for(const r of [123,133,164]){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();}for(let i=0;i<24;i++){let a=i*Math.PI/12;line(Math.cos(a)*145,Math.sin(a)*145,Math.cos(a)*154,Math.sin(a)*154,c.light+'65',i%3===0?3:1);}ctx.rotate(visualTime*(t?.065:.009));for(let i=0;i<3;i++){ctx.rotate(Math.PI*2/3);poly([[60,-10],[111,-19],[120,19],[60,10]],c.light+'13');}circle(0,0,18,c.light+'15');circle(0,0,4,c.light+'88');ctx.restore();
 text('AER  /  ATMOSPHERIC ENERGY RESEARCH',menu?663:405,menu?459:464,c.light+'68',8);
 if(!t){for(let i=0;i<9;i++){let x=45+i*133,y=96+(i%3)*9;line(x,y,x+8,y+46,'#56807080',2);for(let j=0;j<4;j++)poly([[x+3,y+12+j*9],[x+12,y+6+j*9],[x+9,y+19+j*9]],'#507b6580');}}
 for(let i=0;i<32;i++){let x=(i*131.7+visualTime*(t?-5:3))%W,y=(i*79.3+Math.sin(visualTime*.3+i)*14)%H;box(x,y,1,i%4===0?3:1,c.light+(i%3===0?'44':'20'));}
 if(menu){box(555,506,565,94,'#0e202b');line(555,506,1120,506,c.light+'85',2);for(let i=0;i<13;i++)line(558+i*46,520,600+i*46,555,'#29404b',2);box(907,375,99,131,'#172e39');line(906,375,1006,375,'#60837f',2);text('07',925,414,'#6c8d91',28);line(929,439,986,439,'#5d9d93');drawPlayer({x:827,y:478,vx:0,vy:0,face:-1,ground:true},t);}
}
function solid(s,t,ghost=false){const c=palettes[t];ctx.save();if(ghost){ctx.globalAlpha=.38;ctx.setLineDash([4,5]);ctx.strokeStyle=c.ghost;ctx.lineWidth=1;ctx.strokeRect(s.x+.5,s.y+.5,s.w-1,s.h-1);ctx.setLineDash([]);for(let x=s.x+8;x<s.x+s.w;x+=22)line(x,s.y+3,Math.min(x+6,s.x+s.w),s.y+9,c.ghost+'55');ctx.restore();return;}
 box(s.x,s.y,s.w,s.h,c.metal);box(s.x,s.y,s.w,3,c.edge);box(s.x,s.y,s.w,1,c.light+'ac');box(s.x,s.y+3,s.w,4,'#00000033');
 if(s.mask!==3){box(s.x,s.y+5,Math.min(s.w,30),2,t?'#ffd096':'#80dfe7');if(s.w>45){text(t?'−15 Y':'NOW',s.x+8,s.y+17,c.light+'a0',7);}}
 if(s.w>50&&s.h>28){for(let x=s.x+22;x<s.x+s.w-12;x+=48){box(x,s.y+21,3,3,c.edge+'88');line(x+8,s.y+15,x+27,s.y+35,c.edge+'40');}if(s.h>60)line(s.x,s.y+46,s.x+s.w,s.y+46,c.edge+'55');}
 if(s.w<65&&s.h>65){for(let y=s.y+26;y<s.y+s.h;y+=42){line(s.x+4,y,s.x+s.w-4,y,c.edge+'55');box(s.x+5,y-6,2,2,c.edge);}}
 if(!t&&s.w>60){line(s.x+36,s.y+6,s.x+44,s.y+18,'#070e18',1);line(s.x+44,s.y+18,s.x+40,s.y+30,'#070e18',1);if(s.x%3===0){for(let i=0;i<3;i++)poly([[s.x+10+i*9,s.y],[s.x+5+i*9,s.y-9-i*3],[s.x+14+i*9,s.y]],'#567e68');}}
 if(s.crumble){for(let x=s.x+4;x<s.x+s.w-4;x+=14)line(x,s.y+5,x+7,s.y+12,'#d4ac6a',2);let id=s.index;if(game.falling[id]){ctx.globalAlpha=.5+.4*Math.sin(visualTime*55);box(s.x,s.y,s.w,s.h,'#ffbd79');}}
 if(s.move){box(s.x+5,s.y+s.h-5,s.w-10,2,c.light);}ctx.restore();}
function drawPlayer(p,t,alpha=1){ctx.save();ctx.globalAlpha=alpha;const cx=p.x+9,cy=p.y+15;ctx.translate(cx,cy);const squash=p.ground?1+Math.sin(visualTime*18)*Math.min(Math.abs(p.vx)/5000,.045):.96;ctx.scale(squash,1/squash);
 // A brass pressure suit, ceramic helmet and a luminous woven phase tether.
 const flip=p.face||1;let flutter=Math.sin(visualTime*17)*3;poly([[-flip*4,-5],[-flip*(15+Math.abs(p.vx)*.025),-4+flutter],[-flip*17,1+flutter],[-flip*5,0]],palettes[t].light);box(-6,0,12,10,'#d5a06c');box(-8,0,4,9,'#976b47');box(-5,10,4,4,'#122534');box(2,10,4,4,'#122534');circle(0,-7,8,'#e2e5cd');box(flip>0?0:-7,-10,7,5,'#183a45');box(flip>0?2:-6,-9,4,2,palettes[t].light);box(-4,1,8,3,'#354b49');circle(0,5,2,palettes[t].light);{ctx.shadowColor='#bfffdb';ctx.shadowBlur=9;circle(0,5,1.4,'#e1ffdf');}ctx.restore();}
function scene(){let t=mode==='menu'?0:game.timeline,c=palettes[t];background(t,mode==='menu');if(mode==='menu')return;
 ctx.save();ctx.translate(0,-game.cameraY);
 for(let y=120;y<(game.room.height||H);y+=260){line(0,y,W,y,c.edge+'26');text('AER / '+String(Math.floor(y/260)+1).padStart(2,'0'),24,y-10,c.edge+'66',8);}
 for(const s of game.room.solids)if(s.move){line(s.x+s.w/2-s.move.x,s.y-s.move.y,s.x+s.w/2+s.move.x,s.y+s.move.y,c.light+'55',1);circle(s.x+s.w/2-s.move.x,s.y-s.move.y,3,c.light+'55');circle(s.x+s.w/2+s.move.x,s.y+s.move.y,3,c.light+'55');}

 for(const s of game.solids(1-t))if(!(s.mask&(1<<t)))solid(s,t,true);
 for(const s of game.solids())solid(s,t);
 for(const sign of game.room.signs||[])if(sign.mask&(1<<t))text(sign.text,sign.x,sign.y,c.light,9);
 for(const h of game.hazards(1-t))if(!(h.mask&(1<<t))){ctx.save();ctx.globalAlpha=.55;ctx.strokeStyle=palettes[1-t].light;ctx.setLineDash([2,3]);if(h.kind==='saw'){ctx.beginPath();ctx.arc(h.x+h.w/2,h.y+h.w/2,h.w/2,0,Math.PI*2);ctx.stroke();}else{for(let x=h.x;x<h.x+h.w;x+=12){ctx.beginPath();ctx.moveTo(x,h.y+h.h);ctx.lineTo(x+6,h.y);ctx.lineTo(x+12,h.y+h.h);ctx.stroke();}}ctx.setLineDash([]);text(t?'2091 / DANGER':'2076 / DANGER',h.x,h.y-8,palettes[1-t].light,7);ctx.restore();}
 // Environmental notes are short markings in the room, never a cutscene.
 if(game.room.note){const pastNotes=['ALL SYSTEMS NOMINAL / WELCOME TO AER','TRANSIT CORRIDOR / NO BARRIERS AUTHORIZED','BRIDGE LOAD VERIFIED / 2076','PHASE ARRAY / FIRST SIGNAL RECEIVED','MAINTENANCE SHIFT / RETURN BEFORE THE TEST','FIELD LOG / THE ECHO ARRIVED BEFORE THE SIGNAL','VECTOR ARRAY / DISCHARGE TEST AT 06:14','SAFETY LOG / CONTAINMENT REQUEST DENIED','TURBINE 03 / OVERRIDE FROM UPPER ARCHIVE','OUTGOING TRANSMISSION / NO RECIPIENT FOUND'];text(t?(pastNotes[game.roomIndex]||game.room.note):game.room.note,72,160,c.light+'88',9);}
 const e=game.room.exit;box(e.x-5,e.y-7,e.w+10,e.h+7,'#11282d');ctx.strokeStyle='#b6e9c288';ctx.lineWidth=1;ctx.strokeRect(e.x-4,e.y-7,e.w+8,e.h+7);box(e.x,e.y,e.w,e.h,'#a8f5c917');box(e.x+3,e.y+4,2,e.h-8,'#bfffd280');text('↗',e.x+6,e.y+32,'#c7ffdf',23);text('EXIT',e.x+4,e.y-14,'#c5e9ce',8);
 for(const h of game.hazards()){if(h.kind==='saw'){let r=h.w/2;ctx.save();ctx.translate(h.x+r,h.y+r);ctx.rotate(visualTime*2);for(let i=0;i<12;i++){ctx.rotate(Math.PI/6);poly([[r-7,-5],[r+1,0],[r-4,7]],'#e99b72');}circle(0,0,r-7,'#382c2b');circle(0,0,r-11,'#b77758');circle(0,0,4,'#fbd49e');ctx.restore();if(h.move)line(h.x+r-h.move.x, h.y+r,h.x+r+h.move.x,h.y+r,'#ddac6755');}else if(h.kind==='crusher'){box(h.x,h.y,h.w,h.h,'#673f39');for(let x=h.x;x<h.x+h.w-8;x+=15)poly([[x,h.y+h.h],[x+7,h.y+h.h+6],[x+14,h.y+h.h]],'#ffa582');line(h.x,h.y+h.h-4,h.x+h.w,h.y+h.h-4,'#f4ba78',3);}else{for(let x=h.x;x<h.x+h.w;x+=12)poly([[x,h.y+h.h],[x+6,h.y],[x+12,h.y+h.h]],'#f0b397');line(h.x,h.y+h.h,h.x+h.w,h.y+h.h,'#754e44',3);}}
 for(const tr of echoes)drawPlayer({x:tr.x,y:tr.y,vx:0,face:game.p.face},tr.t,tr.life/.2*.35);
 if(!game.dead)drawPlayer(game.p,t);
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/p.max);box(p.x,p.y,2,2,p.color);}ctx.globalAlpha=1;
 if(reject>0){ctx.strokeStyle='#ffc59c';ctx.lineWidth=2;for(const s of blocks){ctx.strokeRect(s.x-1,s.y-1,s.w+2,s.h+2);box(s.x,s.y,s.w,s.h,'#ff95791a');}box(game.p.x-2,game.p.y-2,22,32,'#fff0dd66');}
 if(flash>0&&fx){ctx.globalAlpha=flash/.12;line(game.p.x+9,game.cameraY,game.p.x+9,game.cameraY+H,c.light+'aa',2);ctx.strokeStyle=c.light+'90';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(game.p.x+9,game.p.y+14,(1-flash/.12)*190+12,(1-flash/.12)*100+10,0,0,Math.PI*2);ctx.stroke();box(0,game.cameraY,W,H,c.light+'07');ctx.globalAlpha=1;}
 ctx.restore();
}
function frame(now){
 rafId=0;if(hostInactive||document.hidden)return;document.body.dataset.playing=String(mode==='play');
 let dt=Math.min((now-last)/1000,.05);last=now;visualTime+=dt;flash=Math.max(0,flash-dt);reject=Math.max(0,reject-dt);toastTime-=dt;if(toastTime<=0)$('toast').textContent='';
 if(mode==='play'){
  acc+=dt;let first=true;
  while(acc>=DT){game.step(first?input():held());processEvents();acc-=DT;first=false;if(mode!=='play')break;}
  musicClock+=dt;
  if(musicClock>1.6){musicClock=0;const notes=game.timeline?[146.83,220,293.66,329.63,220,196,293.66,220]:[73.42,110,146.83,98,73.42,130.81,110,98];tone(notes[musicStep++%8],1.5,'sine',.019);if(game.timeline)tone(notes[(musicStep+2)%8]*2,.9,'triangle',.007);}
 }else acc=0;
 for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=180*dt;}particles=particles.filter(p=>p.life>0);
 for(const echo of echoes)echo.life-=dt;echoes=echoes.filter(echo=>echo.life>0);
 scene();
 if(mode==='play'){
  document.body.classList.toggle('past',game.timeline===1);$('era').textContent=game.timeline?'PAST':'PRESENT';$('year').textContent=game.timeline?'2076':'2091';
  $('deaths').textContent=String(save.data.totalDeaths).padStart(2,'0')+' TOTAL FALLS';$('timer').textContent='ROOM '+duration(game.time);
 }
 scheduleFrame();
}
updateStorage();scheduleFrame();
})();
