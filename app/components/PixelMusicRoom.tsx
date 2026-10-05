'use client';
import {useAnimationClock} from "@/app/components/AnimationScope";
import {useEffect,useRef,useState} from 'react';
import {useMusic} from './MusicContext';
import {newRunner,stepRunner,runnerItems,RUNNER_FLOOR,RUNNER_FINISH,type Runner} from '@/lib/pixel-runner';
const palettes=[['#182239','#384f72','#edc984','#6a845e'],['#30372d','#8fa58b','#e6dcb8','#526851'],['#312331','#97677d','#f3d3a8','#6b617d']];
export function paintRunner(ctx:CanvasRenderingContext2D,s:Runner,img:HTMLImageElement|null,palette=0){
 const cols=palettes[(palette+Math.min(2,Math.floor(s.world/1800)))%3],world=s.world,t=s.time;
 ctx.imageSmoothingEnabled=false;ctx.fillStyle=cols[0];ctx.fillRect(0,0,800,350);
 for(let i=0;i<34;i++){ctx.fillStyle='#e6d7aa';ctx.fillRect(((i*79-world*.08)%800+800)%800,45+i*47%110,2,2)}
 for(let layer=0;layer<2;layer++){ctx.fillStyle=layer===0?cols[1]:cols[3];ctx.beginPath();ctx.moveTo(0,270);for(let x=0;x<=800;x+=20)ctx.lineTo(x,190+layer*40+Math.sin((x+world*(.18+layer*.2))*.007)*30+Math.sin(x*.021)*7);ctx.lineTo(800,350);ctx.lineTo(0,350);ctx.fill()}
 ctx.fillStyle=cols[2];ctx.fillRect(0,RUNNER_FLOOR,800,55);ctx.fillStyle=cols[3];for(let i=0;i<55;i++){const x=((i*24-world)%824+824)%824;ctx.fillRect(x,310,18,3);ctx.fillRect(x+7,329,19,3)}
 for(const o of runnerItems){const x=o.x-world;if(x< -o.w||x>800||s.taken.has(o.id)||s.broken.has(o.id))continue;
  if(o.kind==='platform'){ctx.fillStyle='#ddc694';ctx.fillRect(x,o.y,o.w,5);ctx.fillStyle='#695545';ctx.fillRect(x,o.y+5,o.w,9);ctx.fillStyle='#af8860';for(let a=5;a<o.w;a+=18)ctx.fillRect(x+a,o.y+5,2,7)}
  else if(o.kind==='crate'){ctx.fillStyle='#765039';ctx.fillRect(x,o.y,o.w,o.h);ctx.strokeStyle='#d4a36c';ctx.lineWidth=3;ctx.strokeRect(x+3,o.y+3,o.w-6,o.h-6);ctx.beginPath();ctx.moveTo(x+6,o.y+6);ctx.lineTo(x+o.w-6,o.y+o.h-6);ctx.stroke()}
  else if(o.kind==='coin'){const width=5+Math.abs(Math.cos(t*4+o.id))*(o.w-5);ctx.fillStyle='#95632f';ctx.fillRect(x+(o.w-width)/2-1,o.y-1,width+2,o.h+2);ctx.fillStyle='#f5d275';ctx.fillRect(x+(o.w-width)/2,o.y,width,o.h);ctx.fillStyle='#fff0b7';ctx.fillRect(x+(o.w-width)/2+2,o.y+3,2,o.h-6)}
  else{ctx.fillStyle='#dfb8f5';ctx.font='bold 27px monospace';ctx.fillText('♪',x,o.y+23);ctx.fillStyle='#fff2c0';ctx.fillRect(x+7,o.y-5+Math.sin(t*5)*2,2,2)}
 }
 if(s.magnet>0){ctx.strokeStyle='#cea8f566';ctx.setLineDash([3,6]);ctx.beginPath();ctx.arc(s.x+21,s.feet-28,68,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])}
 if(img?.complete&&img.naturalWidth){ctx.save();if(s.immune>0)ctx.globalAlpha=.65+Math.sin(t*25)*.25;if(s.dash>0){ctx.globalAlpha=.2;ctx.drawImage(img,img.naturalWidth*1102/2172,img.naturalHeight*139/724,img.naturalWidth*527/2172,img.naturalHeight*505/724,s.x-25,s.feet-44,44,44);ctx.globalAlpha=1}ctx.drawImage(img,img.naturalWidth*1102/2172,img.naturalHeight*139/724,img.naturalWidth*527/2172,img.naturalHeight*505/724,s.x,s.feet-44,44,44);ctx.restore()}
 for(const e of s.effects){ctx.globalAlpha=1-e.age/.85;ctx.font='bold 15px monospace';ctx.fillStyle=e.color;ctx.fillText(e.text,e.x-world,e.y)}ctx.globalAlpha=1;
 const finish=RUNNER_FINISH+140-world;if(finish<800){ctx.fillStyle='#dfdcc3';ctx.fillRect(finish,139,4,156);ctx.fillStyle='#dda59f';ctx.fillRect(finish+4,140,59,28);ctx.fillStyle='#132738';ctx.font='bold 12px monospace';ctx.fillText('HOME',finish+10,159)}
 ctx.fillStyle='#121c30dc';ctx.fillRect(0,0,800,38);ctx.fillStyle='#eee0bb';ctx.font='bold 14px monospace';ctx.fillText(`CTY WORLD ${Math.min(3,1+Math.floor(world/1800))}/3`,16,24);ctx.fillText(`COINS ${String(s.coins).padStart(2,'0')}   SCORE ${s.score}`,241,24);ctx.fillStyle='#efa7a1';ctx.fillText('♥ '.repeat(s.hp),684,24);
 ctx.fillStyle='#162535';ctx.fillRect(18,331,764,6);ctx.fillStyle='#f1d294';ctx.fillRect(18,331,764*world/RUNNER_FINISH,6);
}
export default function PixelMusicRoom(){
 const animationClock=useAnimationClock(),{requestFrame,cancelFrame}=animationClock;
 const music=useMusic(),canvas=useRef<HTMLCanvasElement>(null),state=useRef(newRunner()),input=useRef({jump:false,dash:false,axis:0}),keys=useRef(new Set<string>());
 const [running,setRunning]=useState(true),[auto,setAuto]=useState(true),[palette,setPalette]=useState(0),[hud,setHud]=useState({coins:0,score:0,combo:0,hp:3,cooldown:0,status:'running'}),settings=useRef({running,auto,palette});settings.current={running,auto,palette};
 const reset=()=>{state.current=newRunner();input.current={jump:false,dash:false,axis:0};keys.current.clear();setRunning(true)};
 useEffect(()=>{const ctx=canvas.current?.getContext('2d');if(!ctx)return;const img=new Image();img.src='/assets/cat-avatars.webp';let raf=0,last=0,lastUI=0;
  const tick=(now:number)=>{raf=requestFrame(tick);const dt=Math.min(.08,(now-last)/1000||0);last=now;if(document.hidden)return;const s=state.current;if(settings.current.running)stepRunner(s,input.current,dt,settings.current.auto);paintRunner(ctx,s,img,settings.current.palette);if(now-lastUI>120){setHud({coins:s.coins,score:s.score,combo:s.combo,hp:s.hp,cooldown:s.cooldown,status:s.status});lastUI=now}};
  const blur=()=>{keys.current.clear();input.current={jump:false,dash:false,axis:0}};window.addEventListener('blur',blur);document.addEventListener('visibilitychange',blur);raf=requestFrame(tick);return()=>{cancelFrame(raf);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',blur)};
 },[]);
 const axis=()=>{input.current.axis=(keys.current.has('ArrowRight')?1:0)-(keys.current.has('ArrowLeft')?1:0)};
 const control=(kind:'jump'|'dash')=>{if(state.current.status!=='running')reset();input.current[kind]=true;setRunning(true)};
 return <div className={'pixel-room pixel-runner-room palette-'+palette} tabIndex={0} onKeyDown={e=>{if((e.target as HTMLElement).closest('input,select,[role=slider]'))return;const k=e.key.toLowerCase();if([' ','a','b','shift','arrowleft','arrowright','p','r'].includes(k)){e.preventDefault();e.stopPropagation();if(e.repeat)return;if(k===' '||k==='a')control('jump');if(k==='b'||k==='shift')control('dash');if(k==='p')setRunning(v=>!v);if(k==='r')reset();keys.current.add(e.key);axis()}}} onKeyUp={e=>{keys.current.delete(e.key);axis()}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node)){keys.current.clear();input.current.axis=0}}}>
  <div className="game-cartridge"><span>{music.track.title}</span><small>CTY GAME PAK · MOON RUN</small></div>
  <div className="handheld"><div className="handheld-dpad">{([-1,1] as const).map(d=><button key={d} aria-label={d<0?'向左移动':'向右移动'} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);input.current.axis=d}} onPointerUp={()=>input.current.axis=0} onPointerCancel={()=>input.current.axis=0} onLostPointerCapture={()=>input.current.axis=0}>{d<0?'◀':'▶'}</button>)}</div><div className="handheld-screen"><canvas ref={canvas} width={800} height={350} aria-label="月夜金币跑酷：A二段跳，B冲刺碎箱，音符吸附金币" onPointerDown={e=>(e.currentTarget.closest('.pixel-room') as HTMLElement)?.focus()}/>{(!running||hud.status!=='running')&&<div className="runner-result"><b>{hud.status==='won'?'带着星光回家了！':hud.status==='over'?'猫猫歇一会，再出发。':'暂停在这一刻'}</b><span>金币 {hud.coins} · 得分 {hud.score}</span><button onClick={hud.status==='running'?()=>setRunning(true):reset}>{hud.status==='running'?'继续冒险':'再跑一趟'}</button></div>}</div><div className="handheld-ab"><button onClick={()=>control('jump')}>A<small>二段跳</small></button><button onClick={()=>control('dash')} aria-label="冲刺，可击碎木箱" disabled={hud.cooldown>0}>B<small>{hud.cooldown>0?hud.cooldown.toFixed(1)+'s':'冲刺'}</small></button></div><div className="handheld-bottom"><span>CTY · POCKET</span><button onClick={()=>setPalette(v=>(v+1)%3)}>SELECT</button><button onClick={()=>hud.status==='running'?setRunning(v=>!v):reset()}>{running?'PAUSE':'START'}</button><button aria-label={music.playing?'暂停音乐':'播放音乐'} onClick={music.toggle}>♫</button></div></div>
  <div className="pixel-settings"><button className={auto?'chosen':''} onClick={()=>setAuto(v=>!v)}>{auto?'自动跳跃 · 点此亲自玩':'手动跳跃'}</button><span>金币 {hud.coins} · 连击 ×{hud.combo}</span><button onClick={reset}>重新出发</button></div><p className="runner-instructions">A / 空格 二段跳 · B / Shift 冲刺碎箱 · ← → 移动 · ♪ 音符吸金币 · 3 段旅程</p>
 </div>
}
