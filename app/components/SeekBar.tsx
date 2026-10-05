'use client';
import type {CSSProperties} from 'react';
import {useMusic,formatTime} from './MusicContext';
/** Native range owns mouse, touch and keyboard gestures; input commits immediately. */
export default function SeekBar(){
 const p=useMusic(),max=Number.isFinite(p.duration)?p.duration:0;
 const shown=Math.max(0,Math.min(max,p.position));
 return <div className="transport-progress">
  <div><span>{formatTime(shown)}</span><span>{formatTime(max)}</span></div>
  <div className="pixel-seek" style={{'--played':`${max?shown/max*100:0}%`} as CSSProperties}>
   <div className="pixel-seek-track" aria-hidden="true"><i/></div><b className="pixel-seek-thumb" aria-hidden="true"/>
   <input className="music-seek-input" type="range" min={0} max={max||1} step={.1} value={shown} disabled={!max}
    aria-label="播放进度" aria-valuetext={`${formatTime(shown)} / ${formatTime(max)}`}
    onPointerDown={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()}
    onInput={e=>p.seek(Number(e.currentTarget.value))} onChange={()=>{}}
    onKeyDown={e=>{e.stopPropagation();if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();p.seek(Math.max(0,Math.min(max,shown+(e.key==='ArrowRight'?5:-5))))}}}/>
  </div>
 </div>
}
