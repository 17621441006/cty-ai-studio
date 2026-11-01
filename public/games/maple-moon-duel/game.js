import{getSetting,setSetting}from'./settings.mjs';import{Finale}from'./finale.mjs?v=14';import{MoveCallouts}from'./move-callouts.mjs?v=14';import{AutoDuel,COMBAT_RATE}from'./auto-duel.mjs?v=14';import{pounceScale,RunCycle,spriteSample,drawSprite,boundedVisualX}from'./sprite-sampling.mjs?v=14';import{ComboReadout}from'./combo.mjs?v=14';import{ParticleVFX}from'./particle-vfx.mjs?v=14';import{spritePose}from'./animation.mjs?v=14';import{Duel,clamp,SPECIALS,specialFor}from'./core.mjs?v=14';import{Scene}from'./scene.js?v=14';import{viewportLayout,CHARACTER}from'./layout.mjs?v=14';

const $=s=>document.querySelector(s),canvas=$('#stage'),ctx=canvas.getContext('2d'),scene=new Scene();
let duel=new Duel('cat'),choice='cat',showcaseChallenger='bear',mode='manual',finale=null,roundSerial=0,resultTimer=null,ready=false,ambient=0,last=0,fx=[],texts=[],flash=0,shake=0,announceTime=0,pausedByHelp=false,audioOn=getSetting('sound','on')!=='off',audio=null,assets={},input={left:false,right:false,guard:false};
const vfx=new ParticleVFX(),comboReadout=new ComboReadout(),moveCallouts=new MoveCallouts();
let moveIds={};let runCycle=new RunCycle(),hitVisual=new WeakMap();let landTimes=new WeakMap(),slamTimes=new WeakMap();
const H=900,W=1600,GROUND=701;
let scale=1,ox=0,oy=0,view=null,reduced=getSetting('motion',matchMedia('(prefers-reduced-motion: reduce)').matches?'light':'full')==='light',lastGhost=0;

// Ori 2.5D art mode, nimble character proportion, and Xiaosi Outfit controls
const SCALE_PRESETS=[
 {val:0.72,label:'体型 奥日72%'},
 {val:0.64,label:'体型 远景64%'},
 {val:0.85,label:'体型 适中85%'},
 {val:1.00,label:'体型 原版100%'}
];
const OUTFIT_PRESETS=[
 {id:'moon',label:'服饰 月华流仙',name:'月华流仙裳'},
 {id:'maple',label:'服饰 绯枫金翊',name:'绯枫金翊裳'},
 {id:'classic',label:'服饰 原版休闲',name:'原版休闲装'}
];
const STAGE_PRESETS=[
 {id:'sanctuary',label:'场景 奥日枫庭',name:'奥日幻林枫庭'},
 {id:'eclipse',label:'场景 月蚀古庭',name:'月蚀星门古庭'}
];
let charScale=parseFloat(getSetting('charScale','0.72'))||0.72;
if(!SCALE_PRESETS.some(p=>Math.abs(p.val-charScale)<0.01))charScale=0.72;
let oriMode=getSetting('oriMode','on')!=='off';
let xiaosiOutfit=getSetting('xiaosiOutfit','moon');
if(!OUTFIT_PRESETS.some(o=>o.id===xiaosiOutfit))xiaosiOutfit='moon';
let stageTheme=getSetting('stageTheme','sanctuary');
if(!STAGE_PRESETS.some(s=>s.id===stageTheme))stageTheme='sanctuary';

const ROLE_META={
 cat:{
  name:'脏脏包',
  title:'赤焰游侠',
  portrait:()=>'assets/cat-portrait.png',
  skillName:'焰爪',
  skillDesc:'远程焰爪',
  specials:{roar:'猫吼功',charm:'躺平撒娇',launch:'大橘为重'},
  tips:'I 猫吼压制 · O 躺平撒娇 · P 巨橘飞扑 · 被击飞按空格凌空浮空(30s)'
 },
 xiaosi:{
  name:'小司',
  title:'月影剑客',
  portrait:()=>xiaosiPortraitUrl(),
  skillName:'月刃',
  skillDesc:'远程剑气',
  specials:{roar:'强制爱',charm:'哭给你看',launch:'踏月升莲'},
  tips:'I 近身强制爱 · O 哭哭定身 · P 踏月升莲 · 被击飞按空格凌空浮空(30s)'
 },
 bear:{
  name:'弗雷迪',
  title:'午夜机甲',
  portrait:()=>'assets/bear-portrait.png',
  skillName:'音律震波',
  skillDesc:'齿轮音波',
  specials:{roar:'午夜咆哮',charm:'八音盒舞',launch:'发条升龙'},
  tips:'I 午夜咆哮 · O 八音盒舞 · P 发条升龙 · 被击飞按空格凌空浮空(30s)'
 }
};
const roleName=k=>(ROLE_META[k]||ROLE_META.cat).name;

// Reusable 256x320 offscreen buffer for Ori character rim-lighting & hit silhouette flash
const rimCanvas=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(256,320):document.createElement('canvas');
rimCanvas.width=256;rimCanvas.height=320;
const rimCtx=rimCanvas.getContext('2d');

function xiaosiPortraitUrl(){
 return xiaosiOutfit==='classic'?'assets/xiaosi-portrait.png':`assets/xiaosi-${xiaosiOutfit}-portrait.png`;
}
function updatePortraits(){
 if(!duel?.player)return;
 const pKind=duel.player.kind,eKind=duel.enemy.kind;
 if($('#pPortrait'))$('#pPortrait').src=(ROLE_META[pKind]||ROLE_META.cat).portrait();
 if($('#ePortrait'))$('#ePortrait').src=(ROLE_META[eKind]||ROLE_META.xiaosi).portrait();
}
function updateOriButtons(){
 const om=$('#oriMode'),cs=$('#charScaleBtn'),ob=$('#outfitBtn'),sb=$('#stageBtn');
 if(om){om.textContent=oriMode?'画风 奥日2.5D':'画风 经典平面';om.classList.toggle('ori-active',oriMode);}
 if(cs){const preset=SCALE_PRESETS.find(p=>Math.abs(p.val-charScale)<0.01)||SCALE_PRESETS[0];cs.textContent=preset.label;}
 if(ob){const op=OUTFIT_PRESETS.find(o=>o.id===xiaosiOutfit)||OUTFIT_PRESETS[0];ob.textContent=op.label;}
 if(sb){const sp=STAGE_PRESETS.find(s=>s.id===stageTheme)||STAGE_PRESETS[0];sb.textContent=sp.label;}
 document.querySelectorAll('[data-outfit]').forEach(btn=>btn.classList.toggle('selected',btn.dataset.outfit===xiaosiOutfit));
 document.querySelectorAll('[data-stage]').forEach(btn=>btn.classList.toggle('selected',btn.dataset.stage===stageTheme));
 updatePortraits();
}
function setXiaosiOutfit(id){
 if(!OUTFIT_PRESETS.some(o=>o.id===id))return;
 xiaosiOutfit=id;
 setSetting('xiaosiOutfit',xiaosiOutfit);
 updateOriButtons();
}
function setStageTheme(id){
 if(!STAGE_PRESETS.some(s=>s.id===id))return;
 stageTheme=id;
 setSetting('stageTheme',stageTheme);
 updateOriButtons();
}
updateOriButtons();
if($('#oriMode'))$('#oriMode').onclick=()=>{oriMode=!oriMode;setSetting('oriMode',oriMode?'on':'off');updateOriButtons();};
if($('#charScaleBtn'))$('#charScaleBtn').onclick=()=>{
 const idx=SCALE_PRESETS.findIndex(p=>Math.abs(p.val-charScale)<0.01);
 const next=SCALE_PRESETS[(idx+1)%SCALE_PRESETS.length];
 charScale=next.val;setSetting('charScale',String(charScale));updateOriButtons();
};
if($('#outfitBtn'))$('#outfitBtn').onclick=()=>{
 const idx=OUTFIT_PRESETS.findIndex(o=>o.id===xiaosiOutfit);
 const next=OUTFIT_PRESETS[(idx+1)%OUTFIT_PRESETS.length];
 setXiaosiOutfit(next.id);
};
if($('#stageBtn'))$('#stageBtn').onclick=()=>{
 const idx=STAGE_PRESETS.findIndex(s=>s.id===stageTheme);
 const next=STAGE_PRESETS[(idx+1)%STAGE_PRESETS.length];
 setStageTheme(next.id);
};
document.querySelectorAll('[data-outfit]').forEach(b=>b.onclick=()=>setXiaosiOutfit(b.dataset.outfit));
document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>setStageTheme(b.dataset.stage));

function resize(){let d=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;view=viewportLayout(canvas.width,canvas.height);({scale,ox,oy}=view)}
addEventListener('resize',resize);resize();

function load(name,url){return new Promise((res,rej)=>{let i=new Image();i.onload=()=>{assets[name]=i;res(i)};i.onerror=()=>rej(new Error(url));i.src=url+'?v=14'})}
function tint(name,color){let key=name+color;if(assets[key])return assets[key];let i=assets[name];if(!i)return null;let c=document.createElement('canvas');c.width=i.width;c.height=i.height;let x=c.getContext('2d');x.drawImage(i,0,0);x.globalCompositeOperation='source-in';x.fillStyle=color;x.fillRect(0,0,c.width,c.height);assets[key]=c;return c}
$('#sound').textContent='音效 '+(audioOn?'开':'关');

const loading=[
 load('cat','assets/cat.png'),load('xiaosi','assets/xiaosi.png'),load('bear','assets/bear.png'),
 load('cat-run','assets/cat-run.png'),load('xiaosi-run','assets/xiaosi-run.png'),load('bear-run','assets/bear-run.png'),
 load('cat-charm','assets/cat-charm.png'),load('cat-defeat','assets/cat-defeat.png'),load('xiaosi-defeat','assets/xiaosi-defeat.png'),load('bear-defeat','assets/bear-defeat.png'),
 load('xiaosi-moon','assets/xiaosi-moon.png'),load('xiaosi-moon-run','assets/xiaosi-moon-run.png'),load('xiaosi-moon-defeat','assets/xiaosi-moon-defeat.png'),
 load('xiaosi-maple','assets/xiaosi-maple.png'),load('xiaosi-maple-run','assets/xiaosi-maple-run.png'),load('xiaosi-maple-defeat','assets/xiaosi-maple-defeat.png'),
 load('adventure-arena','assets/adventure-arena.png')
];
for(const n of['slash_01','slash_02','slash_03','fire_01','magic_03','spark_01','light_01','circle_01'])loading.push(load(n,`assets/effects/${n}.png`));
for(const n of ['Fire01','Effect36','Effect51'])loading.push(load(n,`assets/effects/new/soluna/${n}.png`));
loading.push(load('slashSweep','assets/effects/new/slashSweep.png'));

Promise.all(loading).then(()=>{
 ready=true;
 $('#start').disabled=false;
 document.querySelectorAll('.showcase-start').forEach(b=>b.disabled=false);
 $('#start').textContent='入庭 · 开始切磋';
 $('#loadStatus').textContent='';
}).catch(e=>{$('#loadStatus').textContent='角色资源尚未加载成功，请刷新重试。';console.error(e)});

function tone(freq,duration=.1,type='sine',gain=.03){if(!audioOn)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();let o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(50,freq*.35),audio.currentTime+duration);g.gain.setValueAtTime(gain,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}catch{}}
function showAnn(text,duration=1.5){$('#announcement').textContent=text;$('#announcement').style.opacity='1';announceTime=duration}

function setup(nextMode=mode,customChallenger=null){
 finale=null;mode=typeof nextMode==='string'?nextMode:mode;roundSerial++;clearTimeout(resultTimer);
 if(customChallenger)showcaseChallenger=customChallenger;
 duel=mode==='showcase'?new AutoDuel(showcaseChallenger):new Duel(choice);
 const pKind=duel.player.kind,eKind=duel.enemy.kind;
 const pMeta=ROLE_META[pKind]||ROLE_META.cat,eMeta=ROLE_META[eKind]||ROLE_META.xiaosi;
 $('#moveCallouts').classList.remove('reversed');
 fx=[];texts=[];shake=0;flash=0;
 input.left=input.right=input.guard=false;
 $('#spectator').classList.toggle('hidden',mode!=='showcase');
 if($('#spectatorSub'))$('#spectatorSub').textContent=`${pMeta.name} VS ${eMeta.name} · 1分钟巅峰博弈 · 小司险胜`;
 $('#again').textContent=mode==='showcase'?'再看一次':'再来一局';
 $('#hud .round>span').textContent=mode==='showcase'?'限时演武':'友谊切磋';
 $('#hud .player .name span').textContent=mode==='showcase'?pMeta.title:'PLAYER';
 $('#hud .enemy .name span').textContent=mode==='showcase'?eMeta.title:'RIVAL';
 $('#pause').textContent='Ⅱ';
 comboReadout.reset();moveCallouts.reset();moveIds={};runCycle=new RunCycle();hitVisual=new WeakMap();vfx.reset();landTimes=new WeakMap();slamTimes=new WeakMap();
 $('#intro').classList.add('hidden');$('#endModal').classList.add('hidden');
 for(const id of['hud','abilityBar','touchMove'])$('#'+id).classList.remove('hidden');
 $('#pName').textContent=pMeta.name;
 $('#eName').textContent=eMeta.name;
 updatePortraits();
 $('#abilityBar [data-action="skill"] b').textContent=pMeta.skillName;
 $('#abilityBar [data-action="skill"] small').textContent=pMeta.skillDesc;
 for(const [key,label] of Object.entries(pMeta.specials))document.querySelector(`[data-action="${key}"] b`).textContent=label;
 for(const key of ['roar','charm','launch']){const z=specialFor(pKind,key);document.querySelector(`[data-action="${key}"] small`).textContent=z.cooldown+'s 冷却'}
 $('#characterTips').textContent=pMeta.tips;
 if(mode==='showcase'){for(const id of['abilityBar','touchMove'])$('#'+id).classList.add('hidden');$('#characterTips').textContent='自动演武 · Esc 暂停 / 继续 · 可随时返回';}
 duel.start();tone(440,.3);
}

$('#motion').textContent=reduced?'动效 轻':'动效 全';
$('#motion').onclick=()=>{reduced=!reduced;setSetting('motion',reduced?'light':'full');$('#motion').textContent=reduced?'动效 轻':'动效 全'};
$('#pause').onclick=()=>{if(duel.started&&!duel.ended){duel.paused=!duel.paused;$('#pause').textContent=duel.paused?'▶':'Ⅱ';showAnn(duel.paused?'已暂停 · 点击 ▶ 继续':'继续切磋',duel.paused?10000:1)}};
$('#start').onclick=()=>{if(ready)setup('manual')};
document.querySelectorAll('.showcase-start').forEach(b=>b.onclick=()=>{if(ready)setup('showcase',b.dataset.showcase||'bear')});
document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{choice=b.dataset.choice;duel=new Duel(choice);updatePortraits();document.querySelectorAll('[data-choice]').forEach(x=>x.classList.toggle('selected',x===b))});
$('#again').onclick=()=>setup(mode,showcaseChallenger);

function returnMenu(){
 finale=null;roundSerial++;clearTimeout(resultTimer);duel.reset();mode='manual';
 input.left=input.right=input.guard=false;fx=[];texts=[];shake=0;flash=0;
 vfx.reset();comboReadout.reset();moveCallouts.reset();moveIds={};
 $('#combo').classList.remove('visible');$('#characterTips').textContent='';$('#announcement').style.opacity='0';$('#announcement').textContent='';announceTime=0;$('#pause').textContent='Ⅱ';
 $('#endModal').classList.add('hidden');$('#intro').classList.remove('hidden');
 for(const id of['hud','abilityBar','touchMove','spectator'])$('#'+id).classList.add('hidden');
 duel=new Duel(choice);
 updatePortraits();
}
$('#back').onclick=returnMenu;$('#leaveShowcase').onclick=returnMenu;
$('#sound').onclick=()=>{audioOn=!audioOn;setSetting('sound',audioOn?'on':'off');$('#sound').textContent='音效 '+(audioOn?'开':'关')};

let fullscreenTransitionUntil=0,fullscreenEscapeUntil=0;
function fullscreenFailure(){const message='此浏览器暂未允许全屏，可使用浏览器自身的全屏功能。';if(duel.started)showAnn(message,3);else $('#loadStatus').textContent=message;}
$('#fullscreen').onclick=async()=>{fullscreenTransitionUntil=performance.now()+500;try{if(document.fullscreenElement){await document.exitFullscreen()}else if(document.fullscreenEnabled&&$('#game').requestFullscreen){await $('#game').requestFullscreen()}else fullscreenFailure()}catch{fullscreenFailure()}};
addEventListener('fullscreenchange',()=>{const full=!!document.fullscreenElement;if(!full)fullscreenEscapeUntil=performance.now()+80;$('#fullscreen').textContent=full?'⛶ 退出':'⛶ 全屏';$('#fullscreen').setAttribute('aria-label',full?'退出全屏':'进入全屏');$('#fullscreen').setAttribute('aria-pressed',String(full));$('#fullscreen').title=full?'退出全屏（Esc）':'进入浏览器全屏，Esc 退出';input.left=input.right=input.guard=false;resize()});

function help(){pausedByHelp=!duel.paused;duel.paused=true;$('#helpModal').classList.remove('hidden')};
$('#help').onclick=help;
$('#helpModal .close').onclick=$('#helpModal .closeHelp').onclick=()=>{$('#helpModal').classList.add('hidden');if(pausedByHelp)duel.paused=false};
$('#creditsOpen').onclick=()=>$('#creditsModal').classList.remove('hidden');
$('#creditsModal .close').onclick=()=>$('#creditsModal').classList.add('hidden');
$('#brand').onclick=e=>{e.preventDefault();help()};

const map={j:'attack',k:'skill',l:'dash',u:'ultimate',i:'roar',o:'charm',p:'launch',' ':'jump',shift:'dash'};
addEventListener('keydown',e=>{let k=e.key.toLowerCase();if(k==='escape'&&(document.fullscreenElement||performance.now()<fullscreenEscapeUntil)){fullscreenTransitionUntil=performance.now()+500;if(document.fullscreenElement)document.exitFullscreen().catch(fullscreenFailure);return;}if([' ','arrowleft','arrowright','arrowup','arrowdown'].includes(k))e.preventDefault();if(mode==='manual'&&k==='f')input.guard=true;if(mode==='manual'&&(k==='a'||k==='arrowleft'))input.left=true;if(mode==='manual'&&(k==='d'||k==='arrowright'))input.right=true;if(k==='escape'&&duel.started&&!duel.ended){duel.paused=!duel.paused;$('#pause').textContent=duel.paused?'▶':'Ⅱ';showAnn(duel.paused?'已暂停 · Esc 继续':'继续切磋',duel.paused?10000:1);return}if(mode==='manual'&&!e.repeat&&map[k])duel.action(duel.player,map[k])});
addEventListener('keyup',e=>{let k=e.key.toLowerCase();if(k==='escape')fullscreenEscapeUntil=0;if(k==='f')input.guard=false;if(k==='a'||k==='arrowleft')input.left=false;if(k==='d'||k==='arrowright')input.right=false});
addEventListener('blur',()=>{input.left=input.right=input.guard=false;if(duel.started&&!duel.ended&&performance.now()>=fullscreenTransitionUntil){duel.paused=true;$('#pause').textContent='▶';showAnn('已暂停 · 点击 ▶ 继续',10000)}});
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();if(mode==='manual')duel.action(duel.player,b.dataset.action)}));
document.querySelectorAll('[data-hold]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);input[b.dataset.hold]=mode==='manual'});for(let ev of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>input[b.dataset.hold]=false)});

function particles(x,y,color,n=20){for(let i=0;i<n;i++){let a=Math.random()*Math.PI*2,v=70+Math.random()*260;fx.push({type:'particle',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.3+Math.random()*.45,max:.75,color,size:2+Math.random()*4})}}

function events(){
 vfx.charScale=charScale;
 for(const ev of duel.events.splice(0)){
  moveCallouts.feed(ev,duel.t);
  if(ev.type!=='hit'||(ev.damage>0&&!ev.blocked))vfx.emit(ev);
  if(ev.type==='airescape'){
   const a=ev.actor;
   tone(620,.18,'sine',.04);
   tone(880,.24,'triangle',.035);
   texts.push({x:a.x,y:GROUND-a.y-(170*charScale+20),value:'凌空浮空 · 30s冷却',life:1.15,max:1.15,blocked:true});
  }
  if(ev.type==='land'){
   landTimes.set(ev.actor,ambient);
   if(ev.airborne){
    slamTimes.set(ev.actor,ambient);
    vfx.emit({type:'knockdown',actor:ev.actor});
    shake=Math.max(shake,0.28);
   }
   // "大橘为重" (pounce) landing triggers a heavy ground-shaking tremor!
   if(ev.skill==='pounce'){
    shake=Math.max(shake,0.62);
    flash=Math.max(flash,0.045);
    tone(58,.24,'sawtooth',.045);
   }
  }
  const a=ev.actor,c=a?.kind==='cat'?'#ffd460':a?.kind==='bear'?'#ffd363':'#f0f6ff';
  const chestY=a?GROUND-a.y-82*charScale:GROUND-60;
  if(ev.type==='announce'||ev.type==='notice')showAnn(ev.text);
  if(ev.type==='jump'||ev.type==='land'){
   const jumpCol=a?.kind==='cat'?'#ffe082':a?.kind==='bear'?'#ffd86b':'#eef6ff';
   particles(a.x,GROUND,jumpCol,ev.type==='land'?14:9);
   fx.push({type:'groundring',x:a.x,y:GROUND,life:.38,max:.38,color:jumpCol});
   if(ev.type==='land')tone(70,.07,'triangle',.02);
  }
  if(ev.type==='swing')tone(280,.1,'triangle',.025);
  if(ev.type==='slash'){
   if(a.kind!=='cat')fx.push({type:'slash',x:a.x+a.face*58*charScale,y:chestY,face:a.face,life:.36,max:.36,color:c,chain:ev.chain});
   fx.push({type:'orislash',x:a.x+a.face*52*charScale,y:chestY,face:a.face,life:.26,max:.26,color:a.kind==='cat'?'#ffca4b':a.kind==='bear'?'#ffd363':'#ffffff',subColor:c,chain:ev.chain||0});
   particles(a.x+a.face*85*charScale,chestY,c,10);
  }
  if(ev.type==='charge'&&a.kind==='cat')fx.push({type:'ring',x:a.x,y:chestY,life:.45,max:.45,color:c});
  if(ev.type==='cast'){
   tone(a.kind==='cat'?330:a.kind==='bear'?240:720,.24,'triangle');
   if(a.kind==='cat'){particles(a.x+a.face*40*charScale,chestY,c,18);fx.push({type:'groundring',x:a.x,y:GROUND,life:.5,max:.5,color:c})}
  }
  if(ev.type==='dash'){fx.push({type:'trail',actor:{...a},x:a.x,y:a.y,face:a.face,life:.32,max:.32});tone(190,.18,'triangle',.018)}
  if(ev.type==='telegraph')fx.push({type:'warning',actor:a,x:a.x,y:GROUND,life:.55,max:.55,color:'#fc787e'});
  if(ev.type==='hit'&&ev.damage>0){
   if(ev.source?.player||mode==='showcase'){
    if(mode==='showcase'&&comboReadout.owner!==ev.source){comboReadout.reset();comboReadout.owner=ev.source}
    comboReadout.hit(ev.damage,duel.t);
    const srcKind=ev.source?.kind||'cat';
    $('#combo .combo-kicker').textContent=mode==='showcase'
     ?(srcKind==='cat'?'脏脏包 · 赤焰连势':srcKind==='bear'?'弗雷迪 · 机甲连势':'小司 · 月影连势')
     :'枫起 · 连势';
   }
   const strong=ev.damage>=24;
   const dir=ev.source?.face||1;
   texts.push({x:a.x+dir*12,y:GROUND-a.y-(165*charScale+18),value:'−'+ev.damage,life:1.05,max:1.05,heavy:strong,dir,blocked:ev.blocked});
   if(!ev.blocked&&!ev.holdTick&&ev.skill!=='love'&&ev.source?.action?.skill!=='love'&&a.heldBy!==ev.source){
    // Store impact pose & timing for 2-stage hit-stop shudder + directional recoil on the character
    const hitPose=spritePose(a,ambient,duel.started,ambient-(landTimes.get(a)??-100));
    hitVisual.set(a,{time:duel.t,dir,damage:ev.damage,strong,pose:{...hitPose},srcKind:ev.source?.kind||'cat'});
    const hitColor=ev.source?.kind==='cat'?'#ffd460':ev.source?.kind==='bear'?'#ffd363':'#f5f9ff';
    particles(a.x,chestY,hitColor,strong?38:16);
    fx.push({type:'impact',x:a.x,y:chestY,life:strong?.38:.24,max:strong?.38:.24,color:'#fff4d8',strong});
    // Ori-style razor cross-slash light needle at the point of impact
    fx.push({
     type:'oriflare',
     x:a.x-dir*10*charScale,
     y:chestY,
     dir,
     angle:(dir>0?-0.22:Math.PI+0.22)+(Math.random()-0.5)*0.35,
     life:strong?.34:.22,
     max:strong?.34:.22,
     color:hitColor,
     strong
    });
    // Only shake the scene on specific heavy skills (pounce, launch, gearlaunch, ultimate >=25 dmg), NEVER on basic attacks!
    const isHeavySkill=ev.damage>=25||ev.skill==='pounce'||ev.skill==='launch'||ev.skill==='gearlaunch';
    if(isHeavySkill){
     shake=Math.min(1,Math.max(shake,ev.damage>=40?0.68:0.42));
     flash=Math.max(flash,ev.damage>=40?0.07:0.03);
    }
    tone(strong?62:108,strong?.22:.11,'sawtooth',strong?.05:.03);
    tone(strong?520:440,.05,'triangle',.022);
   }
  }
  if(ev.type==='block'){
   tone(720,.09,'triangle',.035);
   texts.push({x:a.x,y:GROUND-a.y-(155*charScale+16),value:'格挡',life:.55,max:.55,blocked:true});
   fx.push({type:'oriflare',x:a.x+a.face*28*charScale,y:chestY,dir:-a.face,angle:0,life:.18,max:.18,color:'#9beeff',strong:false});
  }
  if(ev.type==='guardbreak'){
   showAnn('架势崩解 · 暂时无法防御',1.1);
   tone(90,.3,'sawtooth',.04);
   shake=Math.max(shake,0.45);
  }
  if(ev.type==='ultimate'){
   flash=.06;
   shake=Math.max(shake,0.32);
   tone(160,.75,'triangle',.045);
  }
  if(ev.type==='burst'){
   particles(a.x,GROUND-a.y-95*charScale,c,80);
   flash=.14;
   shake=.82;
  }
  if(ev.type==='knockdown'){
   showAnn('连击保护 · 起身后无敌 3 秒',1.5);
   tone(55,.25,'triangle',.04);
   shake=Math.max(shake,0.32);
  }
  if(ev.type==='special'){
   if(ev.phase==='start'){
    tone((ev.skill==='charm'||ev.skill==='toreador')?660:(ev.skill==='roar'||ev.skill==='jumpscare')?115:400,.25,'triangle',.035);
   }else if(ev.phase==='pulse'){
    if(ev.skill==='pounce'){shake=Math.max(shake,0.62);flash=Math.max(flash,0.045);}
    else if(ev.skill==='launch'||ev.skill==='gearlaunch'){shake=Math.max(shake,0.36);}
    else if(ev.skill==='roar'||ev.skill==='jumpscare'){shake=Math.max(shake,0.22);}
   }
  }
  if(ev.type==='end'){
   const winner=ev.won?duel.player:duel.enemy,loser=ev.won?duel.enemy:duel.player;
   finale=new Finale(winner,loser,ev.won);duel.projectiles=[];hitVisual=new WeakMap();moveCallouts.reset();
   winner.action=null;winner.state='idle';winner.y=0;winner.vy=0;loser.action=null;loser.guarding=false;loser.recovery=0;loser.charmed=0;loser.rooted=0;
   $('#characterTips').textContent='切磋落幕 · 稍作喘息';
  }
 }
}

function showResult(){
 if(!finale||finale.shown)return;finale.shown=true;
 $('#spectator').classList.add('hidden');$('#characterTips').textContent='';
 const winner=finale.winner;$('#winnerName').textContent=roleName(winner.kind)+'胜';
 $('#endModal').dataset.winner=winner.kind;
 $('#resultText').textContent=mode==='showcase'?'高手过招 · 以武会友 · 稍作喘息':(finale.won?'你赢下了这场切磋 · 友谊依旧':'枫叶落定 · 下一场再战');
 $('#endModal').classList.remove('hidden');
}

// Helper to draw a tinted single-frame silhouette from `image` using the 256x320 `rimCanvas`
function drawTintedFrame(c,image,sample,h,color,ox=0,oy=0,alpha=1,comp='source-over'){
 rimCtx.clearRect(0,0,256,320);
 rimCtx.globalCompositeOperation='source-over';
 rimCtx.drawImage(image,sample.sx,sample.sy,256,320,0,0,256,320);
 rimCtx.globalCompositeOperation='source-in';
 rimCtx.fillStyle=color;
 rimCtx.fillRect(0,0,256,320);
 c.save();
 c.globalAlpha=alpha;
 c.globalCompositeOperation=comp;
 c.drawImage(rimCanvas,0,0,256,320,-h*sample.px/320+ox,-h*sample.py/320+oy,h*256/320,h);
 c.restore();
}

/**
 * Upright Martial-Arts Footwork & Posture Kinematics:
 * Gives Xiaosi, Zangzangbao, and Freddy crisp horizontal step-ins, vertical leaps,
 * and subtle weight shifts while strictly keeping `tilt: 0` (ZERO whole-body rotation)
 * so characters NEVER appear tilted or rotated diagonally.
 */
function computeActionPosture(a){
 const out={tilt:0,lungeX:0,liftY:0,sx:1,sy:1};
 if(a.heldBy||a.knockdown>0)return out;
 const act=a.action;
 if(act){
  const dur=Math.max(0.18,act.duration||0.42);
  const p=clamp(act.t/dur,0,1);
  const sk=act.skill||act.type;
  if(act.type==='attack'){
   const ch=act.chain||0;
   const swing=Math.sin(p*Math.PI);
   const windup=p<0.22?-Math.sin(p/0.22*Math.PI):Math.sin((p-0.22)/0.78*Math.PI);
   if(ch===0){
    out.lungeX=windup*14*charScale;
    out.sx=1+swing*0.04;
    out.sy=1-swing*0.03;
   }else if(ch===1){
    out.lungeX=swing*18*charScale;
    out.liftY=-swing*8*charScale;
    out.sx=1+swing*0.04;
    out.sy=1+swing*0.03;
   }else{
    out.lungeX=windup*22*charScale;
    out.liftY=-swing*12*charScale;
    out.sx=1+swing*0.06;
    out.sy=1-swing*0.04;
   }
  }else if(act.type==='skill'){
   if(p<0.38){
    const w=Math.sin(p/0.38*Math.PI*0.5);
    out.lungeX=-10*w*charScale;
   }else{
    const r=Math.sin((p-0.38)/0.62*Math.PI);
    out.lungeX=18*r*charScale;
    out.sx=1+0.05*r;
   }
  }else if(sk==='roar'||sk==='jumpscare'){
   const pulse=p<0.2?-p/0.2:Math.sin((p-0.2)/0.8*Math.PI);
   out.lungeX=pulse*16*charScale;
   out.sx=1+Math.max(0,pulse)*0.06;
   out.sy=1-Math.max(0,pulse)*0.04;
  }else if(sk==='love'){
   if(!a.holding){
    const reach=Math.sin(Math.min(1,act.t/0.38)*Math.PI);
    out.lungeX=16*reach*charScale;
   }else{
    out.liftY=-Math.abs(Math.sin(act.t*7.5))*5*charScale;
   }
  }else if(sk==='charm'||sk==='cry'||sk==='toreador'){
   const env=Math.sin(p*Math.PI);
   if(a.kind==='bear'){
    out.liftY=-Math.abs(Math.cos(act.t*10))*8*env*charScale;
   }else{
    out.liftY=3*env*charScale;
   }
  }else if(sk==='launch'||sk==='pounce'||sk==='gearlaunch'){
   const env=Math.sin(p*Math.PI);
   if(sk==='pounce'){
    out.lungeX=14*env*charScale;
   }else{
    out.lungeX=14*env*charScale;
    out.liftY=-42*env*charScale;
    out.sy=1+0.04*env;
   }
  }else if(act.type==='ultimate'){
   if(p<0.55){
    const w=Math.sin(p/0.55*Math.PI);
    out.liftY=-18*w*charScale;
   }else{
    const r=Math.sin((p-0.55)/0.45*Math.PI);
    out.lungeX=20*r*charScale;
    out.sx=1+0.06*r;
   }
  }else if(act.type==='dash'){
   const env=Math.sin(p*Math.PI);
   out.lungeX=12*env*charScale;
   out.sx=1+0.06*env;
   out.sy=1-0.04*env;
  }
 }else if(a.guarding){
  out.lungeX=-5*charScale;
  out.sx=1.02;
  out.sy=0.96;
 }
 return out;
}

function actor(c,a,ghost=false){
 const image=assets[a.kind];if(!image)return;
 const defeated=finale?.loser===a;
 const hit=hitVisual.get(a),age=hit?duel.t-hit.time:10;
 // Phase 1 (0..52ms): visual hit-stop freeze on contact pose; Phase 2 (52..220ms): directional knockback recoil
 const inHitStop=!defeated&&!ghost&&age>=0&&age<0.052;
 const pose=defeated?{row:6,frame:4}:inHitStop&&hit.pose?{...hit.pose}:spritePose(a,ambient,duel.started,ambient-(landTimes.get(a)??-100));
 if(a.y===0&&!a.action&&ambient-(slamTimes.get(a)??-100)<.23){pose.row=6;pose.frame=5+2*clamp((ambient-slamTimes.get(a))/.23,0,1)}
 const spec=CHARACTER[a.kind]||CHARACTER.xiaosi,held=!!a.heldBy;

 // "大橘为重" (pounceScale) swells to full 100% exaggerated Giant Orange Cat scale (up to 2.1x of 100% height)!
 const rawSize=pounceScale(a.pounceVisual);
 const pounceProgress=clamp((rawSize-1)/1.1,0,1);
 const effectiveScale=charScale+(1.0-charScale)*pounceProgress;
 const size=rawSize;
 const h=held?160*charScale:spec.height*size*effectiveScale;

 const y=held?GROUND-a.heldBy.y-125*charScale:GROUND-a.y;
 const walking=!ghost&&pose.row===1&&a.y===0&&!a.action&&!inHitStop;
 const walkFrame=runCycle.frame(a,walking);
 let sample=spriteSample(a.kind,pose,spec,{held,walkFrame:walking?walkFrame:null});
 if(defeated&&finale.grounded)sample={key:a.kind+'-defeat',sx:finale.frame%8*256,sy:Math.floor(finale.frame/8)*320,px:128,py:300};
 const x=held?a.heldBy.x+a.heldBy.face*32*charScale:boundedVisualX(a.x,defeated||sample.key==='cat-charm'?Math.max(size,1.02):size,spec.height*effectiveScale,sample.px,a.face);
 a.renderInfo={x,y,face:a.face,h,row:pose.row,frame:Math.round(pose.frame),sample};

 // Crisp 2-stage hit reaction: high-frequency directional shudder during hit-stop, then snappy knockback slide (no diagonal rotation)
 let hitOffsetX=0,hitOffsetY=0;
 if(!ghost&&!held&&age>=0&&age<0.22){
  const dir=hit?.dir||1;
  const strong=hit?.strong?1.35:1;
  if(age<0.052){
   hitOffsetX=Math.sin(age*290)*7.5*strong*dir;
   hitOffsetY=Math.cos(age*230)*2.2*strong;
  }else{
   const p=(age-0.052)/0.168;
   const ease=Math.pow(1-clamp(p,0,1),2);
   hitOffsetX=dir*11*strong*ease;
  }
 }

 const post=defeated?{tilt:0,lungeX:0,liftY:0,sx:1,sy:1}:computeActionPosture(a,ambient);

 let sheetKey=sample.key;
 if(a.kind==='xiaosi'&&xiaosiOutfit!=='classic'){
  if(sheetKey==='xiaosi')sheetKey=`xiaosi-${xiaosiOutfit}`;
  else if(sheetKey==='xiaosi-run')sheetKey=`xiaosi-${xiaosiOutfit}-run`;
  else if(sheetKey==='xiaosi-defeat')sheetKey=`xiaosi-${xiaosiOutfit}-defeat`;
 }
 const sheetImg=assets[sheetKey]||assets[sample.key]||image;
 c.save();
 c.translate(x+hitOffsetX+post.lungeX*(held?a.heldBy.face:a.face),y+hitOffsetY);
 c.scale(held?a.heldBy.face:a.face,1);

 // Ground contact shadow (stays anchored on the floor)
 if(!ghost&&!held){
  c.save();
  c.globalAlpha=.44*clamp(1-a.y/500,.22,1);
  c.fillStyle='#100b1d';
  c.beginPath();
  c.ellipse(0,a.y,(defeated||sample.key==='cat-charm'?60:32+Math.min(a.y*.035,14))*size*effectiveScale,5.2*size*effectiveScale,0,0,7);
  c.fill();
  c.restore();
 }

 // Apply vertical lift and subtle scale around lower-torso pivot (-h * 0.30) without any diagonal rotation
 c.translate(0,post.liftY-h*0.30);
 if(!held&&(post.sx!==1||post.sy!==1))c.scale(post.sx,post.sy);
 c.translate(0,h*0.30);

 // Ori Bioluminescent Back-Aura behind character:
 // Zangzangbao ('cat') = Golden; Xiaosi ('xiaosi') = Silver-White; Freddy ('bear') = Amber-Gold & Midnight Violet
 if(oriMode&&!ghost&&!defeated){
  c.save();
  c.globalCompositeOperation='screen';
  const auraR=(a.action?.type==='ultimate'?118:rawSize>1.05?135:76)*effectiveScale;
  const auraY=-h*0.46;
  const g=c.createRadialGradient(0,auraY,2,0,auraY,auraR);
  if(a.kind==='cat'){
   g.addColorStop(0,'rgba(255, 224, 112, 0.36)');
   g.addColorStop(0.48,'rgba(255, 182, 56, 0.16)');
   g.addColorStop(1,'rgba(255, 145, 25, 0)');
  }else if(a.kind==='bear'){
   g.addColorStop(0,'rgba(255, 216, 102, 0.36)');
   g.addColorStop(0.48,'rgba(192, 118, 255, 0.18)');
   g.addColorStop(1,'rgba(130, 60, 220, 0)');
  }else{
   g.addColorStop(0,'rgba(255, 255, 255, 0.36)');
   g.addColorStop(0.48,'rgba(225, 238, 255, 0.16)');
   g.addColorStop(1,'rgba(195, 218, 255, 0)');
  }
  c.fillStyle=g;
  c.beginPath();c.arc(0,auraY,auraR,0,Math.PI*2);c.fill();
  c.restore();
 }

 // Dynamic flowing Celestial Silk Ribbons ('流云披帛') for Xiaosi's custom outfits ('moon' & 'maple')
 if(a.kind==='xiaosi'&&xiaosiOutfit!=='classic'&&!ghost&&!defeated&&!held){
  c.save();
  c.globalCompositeOperation='screen';
  const isMoon=xiaosiOutfit==='moon';
  const moveBoost=clamp(Math.hypot(a.vx||0,a.vy||0)/380,0,1.25)+(a.action?0.45:0);
  for(let r=0;r<2;r++){
   const startX=(-10-r*6)*effectiveScale;
   const startY=-h*(0.52+r*0.08);
   const len=(56+r*18+moveBoost*24)*effectiveScale;
   const wave1=Math.sin(ambient*5.2+r*2.1)*14*effectiveScale;
   const wave2=Math.cos(ambient*6.8+r*1.7)*22*effectiveScale;
   const lift=(a.y>10?18:-6)*effectiveScale;
   const rg=c.createLinearGradient(startX,startY,startX-len,startY+lift);
   if(isMoon){
    rg.addColorStop(0,'rgba(255, 255, 255, 0.78)');
    rg.addColorStop(0.55,'rgba(215, 234, 255, 0.52)');
    rg.addColorStop(1,'rgba(190, 215, 255, 0)');
   }else{
    rg.addColorStop(0,'rgba(255, 226, 148, 0.78)');
    rg.addColorStop(0.55,'rgba(255, 130, 118, 0.52)');
    rg.addColorStop(1,'rgba(225, 70, 80, 0)');
   }
   c.strokeStyle=rg;
   c.lineWidth=(4.2-r*1.1)*effectiveScale;
   c.lineCap='round';
   c.beginPath();
   c.moveTo(startX,startY);
   c.bezierCurveTo(
    startX-len*0.38,startY-10*effectiveScale+wave1,
    startX-len*0.72,startY+8*effectiveScale+wave2+lift*0.5,
    startX-len,startY+wave1*0.8+lift
   );
   c.stroke();
  }
  c.restore();
 }

 // Knockback ghost echo during heavy hit recoil or "大橘为重" pounce flight
 if(!ghost&&!reduced&&((age>=0.02&&age<0.15&&hit?.strong)||rawSize>1.05)){
  const ghostCol=rawSize>1.05?'#ffd460':(hit?.srcKind==='cat'?'#ffc852':hit?.srcKind==='bear'?'#ffd363':'#ffffff');
  drawTintedFrame(c,sheetImg,sample,h,ghostCol,-(hit?.dir||a.face)*a.face*9*effectiveScale,0,0.34,'screen');
 }

 // Ori Dual-Edge Character Rim Light
 if(oriMode&&!ghost&&!reduced){
  const backRimCol=a.kind==='cat'?'#ffe885':a.kind==='bear'?'#ffd86b':'#ffffff';
  const frontRimCol=a.kind==='cat'?'#ffc247':a.kind==='bear'?'#c77dff':'#e2eeff';
  drawTintedFrame(c,sheetImg,sample,h,backRimCol,-1.6,-2.0,0.44,'screen');
  drawTintedFrame(c,sheetImg,sample,h,frontRimCol,1.8,-1.1,0.40,'screen');
 }

 // Main crisp 3D-rendered sprite frame
 if(age<.06&&!reduced)c.filter='brightness(1.75) contrast(1.12)';
 drawSprite(c,sheetImg,sample,h);
 c.filter='none';

 // Crisp Ori Hit-Flash Overlay
 if(!ghost&&!reduced&&age>=0&&age<0.075){
  const flashAlpha=clamp(1-age/0.075,0,1);
  const flashCol=age<0.032?'#ffffff':(hit?.srcKind==='cat'?'#ffbe6b':hit?.srcKind==='bear'?'#ffd86b':'#96f2ff');
  drawTintedFrame(c,sheetImg,sample,h,flashCol,0,0,flashAlpha*0.58,'screen');
 }
 c.restore();

 // Guard / Recovery / Airborne Status overlays scaled to nimble character height
 const headY=GROUND-a.y-(178*charScale+14);
 const midY=GROUND-a.y-82*charScale;
 if(!ghost&&(a.recovery>0||a.guarding)){
  c.save();c.globalCompositeOperation='screen';
  c.strokeStyle=a.recovery>0?'#9feaff':'#a9dcff';c.lineWidth=a.guarding?3:2;c.globalAlpha=.65;
  c.beginPath();
  if(a.guarding)c.ellipse(a.x+a.face*34*charScale,midY,42*charScale,84*charScale,0,-Math.PI*.75,Math.PI*.75);
  else c.ellipse(a.x,midY,56*charScale,92*charScale,0,0,7);
  c.stroke();
  c.globalAlpha=1;c.fillStyle='#e1faff';c.font='15px sans-serif';c.textAlign='center';
  c.fillText(a.recovery>0?'保护 '+a.recovery.toFixed(1)+'s':'防御 · '+Math.ceil(a.guard),a.x,headY);
  c.restore();
 }else if(!ghost&&a.y>0&&a.juggleHits>0&&!a.heldBy){
  c.save();
  c.fillStyle=a.cooldowns.airEscape<=0?'#b8f2ff':'#ffcf96';
  c.font='bold 14px sans-serif';
  c.textAlign='center';
  c.fillText(a.cooldowns.airEscape<=0?'受击浮空 · 按空格脱身':'浮空受击 · 冷却 '+Math.ceil(a.cooldowns.airEscape)+'s',a.x,headY);
  c.restore();
 }
 if(!ghost&&(a.charmed>0||a.rooted>0)){
  c.save();c.fillStyle=a.rooted>0?'#b9e8ff':'#ffc0df';c.font='bold 18px serif';c.textAlign='center';
  c.fillText(a.rooted>0?'泪目定身 · 可防御':'♥ 心动 ♥',a.x,headY);
  c.restore();
 }
}

function renderFx(c,dt){
 const cs=charScale;
 for(const f of fx){
  f.life-=dt;let q=clamp(f.life/f.max,0,1),p=1-q;
  c.save();c.globalAlpha=q;
  if(f.type==='particle'){
   f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=180*dt;
   c.globalCompositeOperation='screen';
   c.fillStyle=f.color;c.translate(f.x,f.y);c.rotate(p*4);
   c.shadowColor=f.color;c.shadowBlur=8;
   c.beginPath();c.ellipse(0,0,f.size*(0.9+q*0.6),f.size*0.48,0,0,Math.PI*2);c.fill();
  }
  else if(f.type==='trail'){c.globalAlpha=q*.26;actor(c,{...f.actor,x:f.x,y:f.y,face:f.face},true)}
  else if(f.type==='warning'){
   c.strokeStyle=f.color;c.lineWidth=2.5;
   c.beginPath();c.ellipse(f.actor.x,GROUND,(46+10*p)*cs,5.5*cs,0,0,7);c.stroke();
   c.font='21px serif';c.fillStyle=f.color;c.textAlign='center';
   c.fillText('!',f.actor.x,GROUND-195*cs);
  }
  else if(f.type==='groundring'){
   c.globalCompositeOperation='screen';c.strokeStyle=f.color;c.lineWidth=2*q;
   c.beginPath();c.ellipse(f.x,f.y,(22+98*p)*cs,(3.5+8*p)*cs,0,0,7);c.stroke();
  }
  else if(f.type==='orislash'){
   c.globalCompositeOperation='screen';
   c.translate(f.x,f.y);c.scale(f.face||1,1);
   const r=(88+36*p)*cs,rot=(f.chain-1)*0.55+p*0.45;
   c.rotate(rot);
   for(let k=2;k>=0;k--){
    c.globalAlpha=q*(k===0?0.95:k===1?0.55:0.28);
    c.strokeStyle=k===0?'#ffffff':k===1?f.color:f.subColor;
    c.lineWidth=(k===0?3.2:k===1?8:15)*q*cs;
    c.lineCap='round';
    c.beginPath();c.arc(0,0,r-k*4*cs,-1.35+p*0.25,1.05+p*0.35);c.stroke();
   }
  }
  else if(f.type==='oriflare'){
   c.globalCompositeOperation='screen';
   c.translate(f.x,f.y);
   const scaleMul=(f.strong?1.35:0.95)*(0.8+0.2*cs);
   c.strokeStyle=f.color;
   c.lineWidth=(f.strong?3.2:2.0)*q;
   c.globalAlpha=q*0.8;
   c.beginPath();c.arc(0,0,(14+115*Math.pow(p,0.65))*scaleMul,0,Math.PI*2);c.stroke();
   c.rotate(f.angle||0);
   const len=(145+95*p)*scaleMul,thick=(f.strong?13:8.5)*q*scaleMul;
   const g=c.createLinearGradient(-len,0,len,0);
   g.addColorStop(0,'rgba(255,255,255,0)');
   g.addColorStop(0.25,f.color);
   g.addColorStop(0.5,'#ffffff');
   g.addColorStop(0.75,f.color);
   g.addColorStop(1,'rgba(255,255,255,0)');
   c.globalAlpha=q;
   c.fillStyle=g;
   c.beginPath();
   c.moveTo(-len,0);c.quadraticCurveTo(0,-thick,len,0);c.quadraticCurveTo(0,thick,-len,0);
   c.fill();
   const len2=len*0.42,thick2=thick*0.55;
   c.beginPath();
   c.moveTo(0,-len2);c.quadraticCurveTo(thick2,0,0,len2);c.quadraticCurveTo(-thick2,0,0,-len2);
   c.fill();
  }
  else{
   c.globalCompositeOperation='screen';c.translate(f.x,f.y);c.scale(f.face||1,1);
   let texture='light_01',size=120*cs,rot=0;
   if(f.type==='slash'){
    texture=['slash_01','slash_02','slash_03'][f.chain%3];
    size=(190+75*p)*cs;rot=(f.chain-1)*.65+.5*p;c.rotate(rot);
    for(let j=0;j<3;j++){c.save();c.rotate(j*.18);let im=tint(texture,j===0?'#fff5df':f.color);c.globalAlpha=q*(j===0?.95:.48);if(im)c.drawImage(im,-size/2-j*8,-size/2,size,size);c.restore()}
    c.strokeStyle='#fff7e8';c.lineWidth=2*q;c.beginPath();c.arc(0,0,(70+24*p)*cs,-1.45,1.0);c.stroke();
   }
   else if(f.type==='impact'){
    size=((f.strong?210:125)+155*p)*cs;
    let im=tint('spark_01','#fff5d8');c.rotate(.5+p);
    if(im)c.drawImage(im,-size/2,-size/2,size,size);
    c.strokeStyle=f.color;c.lineWidth=2.6*q;c.beginPath();c.arc(0,0,(10+90*p)*cs,0,7);c.stroke();
    c.lineWidth=1.2;
    for(let j=0;j<8;j++){c.rotate(Math.PI/4);c.beginPath();c.moveTo((16+30*p)*cs,0);c.lineTo((52+95*p)*cs,0);c.stroke()}
   }
   else if(f.type==='ring'||f.type==='aura'){
    size=(f.type==='aura'?210:88)*cs*(1+.5*p);rot=p*3;
    let im=tint('magic_03',f.color);c.rotate(rot);
    if(im)c.drawImage(im,-size/2,-size/2,size,size);
    c.rotate(-rot*2);c.strokeStyle=f.color;c.lineWidth=2;c.beginPath();c.arc(0,0,size*.5,0,7);c.stroke();
    c.globalAlpha=q*.6;c.beginPath();c.arc(0,0,size*.6,0,7);c.stroke();
   }
   else if(f.type==='burst'){
    let ease=1-Math.pow(1-p,3),radius=(110+ease*520)*cs;c.rotate(-.35+p*.5);
    for(let j=0;j<3;j++){let im=tint('slash_02',j===0?'#fff4dc':f.color);c.globalAlpha=q*(.65-j*.12);if(im)c.drawImage(im,-radius/2-j*20,-radius/2,radius,radius);c.rotate(.4)}
    c.strokeStyle=f.color;c.lineWidth=8*q;c.beginPath();c.ellipse(0,0,(38+ease*550)*cs,(28+ease*120)*cs,0,0,7);c.stroke();
   }
   else if(f.type==='pillar'){
    let age=f.max-f.life;
    if(age>f.delay){
     let v=(age-f.delay)/(f.max-f.delay),height=230*cs*Math.sin(Math.PI*clamp(v,0,1));
     c.globalAlpha=(1-v)*.75;
     let g=c.createLinearGradient(0,0,0,-height);
     g.addColorStop(0,f.color);g.addColorStop(.65,f.kind==='cat'?'#ffc96eaa':'#e8d8ff88');g.addColorStop(1,'#ffffff00');
     c.fillStyle=g;c.beginPath();c.moveTo(-28*cs,0);c.quadraticCurveTo(-42*cs,-height*.5,0,-height);c.quadraticCurveTo(38*cs,-height*.55,28*cs,0);c.fill();
     c.strokeStyle='#fff1d5';c.lineWidth=2;c.beginPath();c.moveTo(0,0);c.lineTo(0,-height*.8);c.stroke();
    }
   }
  }
  c.restore();
 }
 fx=fx.filter(f=>f.life>0).slice(-450);

 for(const t of texts){
  t.life-=dt;t.y-=55*dt;t.x+=(t.dir||0)*16*dt;
  c.save();c.globalAlpha=Math.min(1,t.life*3);
  c.fillStyle=t.blocked?'#bceeff':t.heavy?'#fff4c9':'#ffe3a8';
  c.strokeStyle='#22152c';c.lineWidth=4.5;
  let pop=1+Math.max(0,t.life/t.max-.7)*1.45;
  c.translate(t.x,t.y);c.scale(pop,pop);
  c.font=`italic 900 ${t.heavy?42:t.blocked?22:32}px Georgia`;
  c.textAlign='center';c.strokeText(t.value,0,0);c.fillText(t.value,0,0);
  c.restore();
 }
 texts=texts.filter(t=>t.life>0);
}

function projectile(c,z){
 if(z.owner.kind==='xiaosi'){vfx.moonBladeProjectile(c,z,ambient,GROUND);return;}
 if(z.owner.kind==='bear'){vfx.bearSonicProjectile(c,z,ambient,GROUND);return;}
 const cs=charScale,col=z.owner.kind==='cat'?'#ffb35f':'#d4b4ff';
 const py=GROUND-(z.y-85+85*cs),sc=0.78+0.22*cs;
 c.save();c.translate(z.x,py);c.scale((z.vx>0?1:-1)*sc,sc);c.globalCompositeOperation='screen';
 let tail=c.createLinearGradient(-165,0,20,0);tail.addColorStop(0,'#ffffff00');tail.addColorStop(.7,col+'88');tail.addColorStop(1,'#fff6e5');
 c.fillStyle=tail;c.beginPath();c.moveTo(15,0);c.quadraticCurveTo(-50,-22,-165,0);c.quadraticCurveTo(-40,22,15,0);c.fill();
 let im=tint(z.owner.kind==='cat'?'fire_01':'slash_01',col);if(im)c.drawImage(im,-55,-60,120,120);
 c.fillStyle='#fff5d9';c.beginPath();c.ellipse(0,0,12,5,0,0,7);c.fill();
 for(let j=0;j<4;j++){c.fillStyle=col;c.globalAlpha=.7-j*.13;c.beginPath();c.arc(-35-j*25,Math.sin(ambient*16+j)*7,4-j*.6,0,7);c.fill()}
 c.restore();
}

function drawMoveCallouts(){
 for(const a of[duel.player,duel.enemy])moveCallouts.guard(a,duel.t);
 const state=moveCallouts.snapshot(duel.t);
 const pairs=[
  {card:$('#moveCat'),actor:duel.player,side:'left'},
  {card:$('#moveXiaosi'),actor:duel.enemy,side:'right'}
 ];
 for(const {card,actor:act,side} of pairs){
  if(!card||!act)continue;
  const kind=act.kind,m=state[kind],visible=!!m&&duel.started&&!duel.ended;
  card.classList.toggle('visible',visible);
  card.classList.toggle('bear',kind==='bear');
  card.setAttribute('aria-hidden',String(!visible));
  const actorSpan=card.querySelector('.move-meta span');
  if(actorSpan)actorSpan.textContent=roleName(kind);
  if(!m)continue;
  if(moveIds[side]!==m.id){
   moveIds[side]=m.id;
   card.querySelector('strong').textContent=m.name;
   card.querySelector('small').textContent=({normal:'普攻连式',movement:'身法',special:'专属招式',ultimate:'绝技奥义',defense:'防御',break:'破防'})[m.category]||m.category;
   card.querySelector('kbd').textContent=m.key;
   card.classList.toggle('ultimate',m.key==='U');
   card.classList.toggle('beat-a',m.id%2===0);
   card.classList.toggle('beat-b',m.id%2!==0);
  }
  card.style.setProperty('--remaining',clamp((m.expires-duel.t)/(m.duration||1),0,1));
 }
}

function hud(){
 $('#game').classList.toggle('reduced-motion',reduced);
 drawMoveCallouts();
 const p=duel.player,e=duel.enemy;
 $('#pHp').style.width=p.hp/p.maxHp*100+'%';
 $('#eHp').style.width=e.hp/e.maxHp*100+'%';
 $('#pEnergy').style.width=p.energy+'%';
 $('#eEnergy').style.width=e.energy+'%';
 $('#time').textContent=Math.ceil(mode==='showcase'?Math.max(0,60-(duel.elapsed||0)-Math.min(3,finale?.age||0)):duel.time);
 $('#combo').classList.toggle('visible',(comboReadout.visible(duel.t)&&!duel.ended));
 $('#combo').setAttribute('aria-hidden',String(!(comboReadout.visible(duel.t)&&!duel.ended)));
 $('#comboCount').textContent=comboReadout.hits;
 $('#combo').style.setProperty('--pop',1+Math.max(0,1-(duel.t-comboReadout.last)/.16)*.16);
 $('#pGuard').style.width=p.guard/p.maxGuard*100+'%';
 $('#eGuard').style.width=e.guard/e.maxGuard*100+'%';
 $('#guardButton').classList.toggle('active',p.guarding);
 $('#guardButton small').textContent=p.guardBreak>0?'破防 '+p.guardBreak.toFixed(1)+'s':Math.ceil(p.guard)+' / 100';
 for(const b of document.querySelectorAll('#abilityBar [data-action]')){
  let a=b.dataset.action,cd=p.cooldowns[a];
  b.style.opacity=a==='ultimate'&&p.energy<100?'.55':'1';
  b.querySelector('i').style.height=(a==='ultimate'?100-p.energy:clamp(cd/(specialFor(p.kind,a)?.cooldown??(a==='skill'?2.4:a==='dash'?1.2:.28))*100,0,100))+'%';
 }
}

function buildDynamicLights(){
 const lights=[];
 for(const a of[duel.player,duel.enemy]){
  const isCat=a.kind==='cat',isBear=a.kind==='bear';
  const boost=a.action?.type==='ultimate'?1.9:a.pounceVisual?1.75:a.action?1.35:1;
  lights.push({
   x:a.x,
   y:GROUND-a.y,
   r:145*charScale*boost,
   color:isCat?'#ffd256':isBear?'#ffd86b':'#f2f7ff',
   alpha:clamp((0.55-a.y/480)*boost,0.12,0.88)
  });
 }
 for(const z of duel.projectiles){
  lights.push({
   x:z.x,
   y:GROUND,
   r:130*charScale,
   color:z.owner.kind==='cat'?'#ffd256':z.owner.kind==='bear'?'#d896ff':'#f5f9ff',
   alpha:0.72
  });
 }
 for(const f of fx){
  if(f.type==='oriflare'||f.type==='impact'||f.type==='orislash'||f.type==='burst'){
   const q=clamp(f.life/f.max,0,1);
   lights.push({
    x:f.x,
    y:GROUND,
    r:(f.type==='burst'?280:165)*charScale,
    color:f.color||'#ffe5a8',
    alpha:q*0.85
   });
  }
 }
 return lights;
}

function frame(ms){
 if(!portfolioActive||document.hidden){last=ms;requestAnimationFrame(frame);return}
 const elapsed=Math.max(0,(ms-last)/1000||.016),dt=Math.min(elapsed,.05);
 last=ms;ambient+=dt;
 duel.step(mode==='showcase'?elapsed:dt*COMBAT_RATE,input);
 events();
 if(finale&&finale.step(elapsed))showResult();
 if(announceTime>0){announceTime-=dt;if(announceTime<=0)$('#announcement').style.opacity='0'}

 if(!duel.started){duel.player.x=310;duel.enemy.x=1290;duel.player.face=1;duel.enemy.face=-1;}

 // Rock-steady background during normal play (shake === 0);
 // crisp multi-plane 3D tremor ONLY when specific heavy skills trigger `shake`!
 const trauma=reduced?0:shake*shake;
 const dx=trauma>0.001?Math.sin(ambient*78)*trauma*11:0;
 const dy=trauma>0.001?Math.cos(ambient*62)*trauma*6.5:0;
 shake=Math.max(0,shake-dt*2.8);

 const sceneOpts={
  shakeX:dx,
  shakeY:dy,
  lights:buildDynamicLights(),
  actors:[duel.player,duel.enemy],
  stageTheme,
  arenaImg:assets['adventure-arena']
 };

 // 1. Draw 2.5D multi-plane background & 3D perspective stone terrace
 ctx.setTransform(view.bgX,0,0,view.bgY,0,0);
 scene.draw(ctx,ambient,sceneOpts);

 // 2. Draw stage actors, projectiles, and VFX
 ctx.setTransform(scale,0,0,scale,ox+dx*scale,oy+dy*scale);

 if(!duel.paused&&ambient-lastGhost>.035){
  lastGhost=ambient;
  for(const a of[duel.player,duel.enemy])if(a.action?.type==='dash')fx.push({type:'trail',actor:{...a},x:a.x,y:a.y,face:a.face,life:.24,max:.24});
 }
 for(const a of [duel.player,duel.enemy].sort((a,b)=>Number(!!a.heldBy)-Number(!!b.heldBy)))actor(ctx,a);
 for(const z of duel.projectiles)projectile(ctx,z);
 renderFx(ctx,duel.paused?0:dt);
 vfx.draw(ctx,duel.paused?0:dt,{reduced,assets,ground:GROUND,charScale});

 // 3. Draw 3D Foreground Framing Layer (Overhanging maple boughs, ground mist & bokeh)
 if(oriMode){
  ctx.setTransform(view.bgX,0,0,view.bgY,0,0);
  scene.drawForeground(ctx,ambient,sceneOpts);
 }

 // 4. Screen-space impact flash on heavy skills
 ctx.setTransform(1,0,0,1,0,0);
 if(flash>0){
  ctx.fillStyle=`rgba(215, 245, 255, ${reduced?Math.min(.02,flash):flash})`;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  flash=Math.max(0,flash-dt*1.5);
 }
 if(!oriMode){
  let v=ctx.createRadialGradient(canvas.width*.5,canvas.height*.45,canvas.height*.2,canvas.width*.5,canvas.height*.45,Math.max(canvas.width,canvas.height)*.72);
  v.addColorStop(0,'#180e2400');v.addColorStop(1,'#180e2433');
  ctx.fillStyle=v;ctx.fillRect(0,0,canvas.width,canvas.height);
 }
 hud();
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Explicit debug surface for repeatable QA; no hidden state writes required in browser.
window.battleStatus=()=>({ready,started:duel.started,paused:duel.paused,ended:duel.ended,oriMode,charScale,stageTheme,player:{kind:duel.player.kind,x:duel.player.x,hp:duel.player.hp,energy:duel.player.energy},enemy:{kind:duel.enemy.kind,x:duel.enemy.x,hp:duel.enemy.hp,energy:duel.enemy.energy},time:duel.time});

// Portfolio host lifecycle: never keep a hidden arcade window fighting or drawing.
let portfolioActive=true;
addEventListener('message',event=>{
 if(event.source!==parent||event.origin!==location.origin||event.data?.type!=='cty:game-visibility')return;
 portfolioActive=event.data.active===true;
 if(!portfolioActive){input.left=input.right=input.guard=false;if(duel.started&&!duel.ended){duel.paused=true;$('#pause').textContent='▶';showAnn('已暂停 · 点击 ▶ 继续',10000)}}
});
