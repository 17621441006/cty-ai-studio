'use client';
import {useAnimationClock} from "@/app/components/AnimationScope";

import {useEffect, useRef, type MutableRefObject} from 'react';

export type CatMood = 'walk'|'rest'|'perch'|'grab'|'fall'|'leap'|'carry'|'hop'|'shield'|'portal'|'sail'|'fish'|'wand'|'patronus';
type Point = {x:number; y:number};
type Rect = {x:number; y:number; width:number; height:number};

// Measured alpha bounds plus two transparent source pixels on every side.
// They use reference pixels; source coordinates scale with the actual image.
export const CAT_RIG_ATLAS = {
  width: 1254,
  height: 1254,
  head: {x:29, y:132, width:571, height:443},
  body: {x:659, y:276, width:561, height:316},
  tail: {x:134, y:725, width:368, height:462},
} satisfies {width:number; height:number; head:Rect; body:Rect; tail:Rect};

const TAU = Math.PI * 2;
const CYCLE_CSS_PX = 24;
const CYCLE_CANVAS_PX = CYCLE_CSS_PX * 2;
const STANCE = .62;
const PAW_Y = 157; // Paw outline ends at 162 canvas pixels = 81 CSS pixels.
const OUTLINE = '#30190f';
const mod = (value:number, divisor:number) => ((value % divisor) + divisor) % divisor;
const clamp = (value:number, min:number, max:number) => Math.max(min, Math.min(max, value));

type Leg = {hip:Point; phase:number; hind:boolean; far:boolean};
// Hind and fore contacts are a quarter-cycle apart, with opposite sides half
// a cycle apart. A .62 stance duty always leaves at least two feet planted.
const LEGS:Leg[] = [
  {hip:{x:61,y:118}, phase:.5, hind:true, far:true},
  {hip:{x:113,y:119}, phase:.25, hind:false, far:true},
  {hip:{x:65,y:119}, phase:0, hind:true, far:false},
  {hip:{x:118,y:120}, phase:.75, hind:false, far:false},
];

/** Exported for a small numeric grounding check without running React. */
export function catPawAtDistance(distance:number, leg:Leg, moving:boolean, tuck=0):Point {
  const hip = leg.hip;
  if (tuck > 0) {
    return {x:hip.x + (leg.hind ? 9 : -10) * tuck, y:PAW_Y - 23 * tuck};
  }
  if (!moving) return {x:hip.x + (leg.far ? -3 : 3), y:PAW_Y};
  const phase = mod(distance / CYCLE_CSS_PX + leg.phase, 1);
  const halfStance = CYCLE_CANVAS_PX * STANCE / 2;
  if (phase < STANCE) {
    // d(local paw x)/d(travel) = -2 canvas px per CSS px: no stance skating.
    return {x:hip.x + halfStance - CYCLE_CANVAS_PX * phase, y:PAW_Y};
  }
  const swing = (phase - STANCE) / (1 - STANCE);
  const ease = swing * swing * (3 - 2 * swing);
  return {
    x:hip.x - halfStance + 2 * halfStance * ease,
    y:PAW_Y - Math.sin(Math.PI * swing) * (leg.hind ? 15 : 18),
  };
}

function kneeBetween(hip:Point, paw:Point, hind:boolean):Point {
  const dx = paw.x - hip.x, dy = paw.y - hip.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const upper = hind ? 23 : 22, lower = 24;
  const reach = Math.min(distance, upper + lower - .2);
  const along = (upper * upper - lower * lower + reach * reach) / (2 * reach);
  const side = Math.sqrt(Math.max(0, upper * upper - along * along));
  const bend = hind ? 1 : -1;
  return {x:hip.x + dx / distance * along + dy / distance * side * bend,
    y:hip.y + dy / distance * along - dx / distance * side * bend};
}

function drawPaw(ctx:CanvasRenderingContext2D, paw:Point, far:boolean) {
  const {x,y} = paw;
  ctx.beginPath();
  ctx.moveTo(x-3,y-6);
  ctx.bezierCurveTo(x-6,y-6,x-7,y-3,x-7,y);
  ctx.bezierCurveTo(x-7,y+2,x-6,y+4,x-4,y+4);
  ctx.lineTo(x+4,y+4);
  ctx.bezierCurveTo(x+6,y+4,x+7,y+2,x+7,y);
  ctx.bezierCurveTo(x+7,y-3,x+6,y-6,x+3,y-6);
  ctx.closePath();
  ctx.fillStyle = far ? '#e7cfaa' : '#fff1d9';
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x-2.1,y+2); ctx.lineTo(x-2.1,y+3.2);
  ctx.moveTo(x+2.1,y+2); ctx.lineTo(x+2.1,y+3.2);
  ctx.strokeStyle = far ? '#ab8061' : '#c39876';
  ctx.lineWidth = .75;
  ctx.stroke();
}

function drawLeg(ctx:CanvasRenderingContext2D, leg:Leg, paw:Point, bob:number) {
  const hip = {x:leg.hip.x, y:leg.hip.y + bob};
  const knee = kneeBetween(hip, paw, leg.hind);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const stroke = (color:string, width:number) => {
    ctx.beginPath();
    ctx.moveTo(hip.x,hip.y);
    ctx.quadraticCurveTo(knee.x,knee.y,(knee.x+paw.x)/2,(knee.y+paw.y-2)/2);
    ctx.lineTo(paw.x,paw.y-2);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  };
  stroke(OUTLINE, leg.far ? 13 : 15);
  stroke(leg.far ? '#d88b48' : '#ffb66a', leg.far ? 8.7 : 10.7);
  // A small stripe makes the procedural legs belong to the tabby body.
  const stripeT = leg.hind ? .35 : .3;
  const sx = hip.x+(knee.x-hip.x)*stripeT, sy = hip.y+(knee.y-hip.y)*stripeT;
  ctx.beginPath();
  ctx.moveTo(sx-3.2,sy-1); ctx.quadraticCurveTo(sx,sy+1.5,sx+2.9,sy+1.8);
  ctx.strokeStyle = leg.far ? '#aa602e' : '#e7893e';
  ctx.lineWidth = 2.5; ctx.stroke();
  drawPaw(ctx,paw,leg.far);
}

function drawAtlasPart(ctx:CanvasRenderingContext2D, image:HTMLImageElement, source:Rect, destination:Rect) {
  const sx = image.naturalWidth/CAT_RIG_ATLAS.width;
  const sy = image.naturalHeight/CAT_RIG_ATLAS.height;
  ctx.drawImage(image,source.x*sx,source.y*sy,source.width*sx,source.height*sy,
    destination.x,destination.y,destination.width,destination.height);
}

export function drawCatRig(ctx:CanvasRenderingContext2D, atlas:HTMLImageElement, mood:CatMood, distance:number, reduced:boolean, age:number, progress?:number) {
  const moving = !reduced && (mood === 'walk' || mood === 'carry');
  const phase = mod(distance/CYCLE_CSS_PX,1);
  const bob = moving ? Math.sin(phase*TAU*2)*.8 : 0;
  const airborne = mood === 'hop' || mood === 'leap';
  const airProgress = progress ?? clamp(age/(mood === 'hop' ? 1750 : 700),0,1);
  const tuck = airborne && !reduced ? Math.pow(Math.sin(airProgress*Math.PI),.7) : 0;
  const spell=mood==='wand'||mood==='patronus',magic=mood==='shield'||mood==='portal'||spell;
  const tailAngle = moving ? Math.sin(phase*TAU)*.065 : magic?-.1:0;
  const paws = LEGS.map(leg => catPawAtDistance(distance,leg,moving,tuck));
  if(spell)paws[3]={x:153,y:130};
  else if(magic)paws[3]={x:151+(mood==='portal'&&!reduced?Math.sin(age*.006)*5:0),y:(mood==='shield'?114:110)+(mood==='portal'&&!reduced?Math.cos(age*.006)*5:0)};

  ctx.save();
  ctx.translate(48,117+bob);
  ctx.rotate(tailAngle);
  drawAtlasPart(ctx,atlas,CAT_RIG_ATLAS.tail,{x:-37,y:-56,width:45,height:57});
  ctx.restore();

  for (let i=0;i<2;i++) drawLeg(ctx,LEGS[i],paws[i],bob);
  drawAtlasPart(ctx,atlas,CAT_RIG_ATLAS.body,{x:44,y:94+bob,width:86,height:48});
  for (let i=2;i<4;i++) drawLeg(ctx,LEGS[i],paws[i],bob);
  drawAtlasPart(ctx,atlas,CAT_RIG_ATLAS.head,{x:99,y:77+bob*.7,width:68,height:53});
  if(spell){
    drawLeg(ctx,LEGS[3],paws[3],0);
    ctx.lineCap='round';ctx.strokeStyle='#24140e';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(151,132);ctx.lineTo(169,92);ctx.stroke();
    ctx.strokeStyle='#ac8159';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(153,130);ctx.lineTo(169,92);ctx.stroke();
    ctx.shadowColor=mood==='patronus'?'#c8f3ff':'#ffd29b';ctx.shadowBlur=9;ctx.fillStyle=mood==='patronus'?'#f5ffff':'#fff2c1';ctx.beginPath();ctx.arc(169,92,2.8,0,TAU);ctx.fill();ctx.shadowBlur=0;
  }
}

export default function CatSprite({mood,travel,airProgress}:{mood:CatMood;travel:MutableRefObject<number>;airProgress?:MutableRefObject<number>}) {
 const animationClock=useAnimationClock(),{requestFrame,cancelFrame}=animationClock;
  const canvas = useRef<HTMLCanvasElement>(null);
  const mode = useRef(mood); mode.current = mood;
  const travelled = useRef(travel); travelled.current = travel;

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    const atlas = new Image(), poses = new Image(), fallback = new Image();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0, lastPaint = -Infinity, changedAt = 0, previousMode = mode.current;
    let invalidated = true, previousKey = '';
    const invalidate = () => {invalidated = true;};
    for (const image of [atlas,poses,fallback]) {image.decoding='async'; image.onload=invalidate;}
    atlas.src='/assets/cat-rig-v12-display.webp';
    atlas.onerror=()=>{fallback.src='/assets/cat-walk-sheet-v9.webp'};
    reduced.addEventListener('change',invalidate);
    document.addEventListener('visibilitychange',invalidate);

    const draw = (now:number) => {
      raf=requestFrame(draw);
      if (document.hidden || now-lastPaint < 1000/60-1) return;
      const current = mode.current;
      if(['perch','grab','fall'].includes(current)&&!poses.src)poses.src='/assets/cat-poses-v9.webp';
      if (current !== previousMode) {changedAt=now; previousMode=current; invalidated=true;}
      const age = now-changedAt;
      const animate = !reduced.matches && (current==='walk'||current==='carry');
      const air = !reduced.matches && (current==='hop'||current==='leap'||current==='portal');
      const distance = travelled.current.current;
      const key = `${current}:${animate ? distance.toFixed(3) : 0}:${air ? Math.floor(age/33) : 0}:${reduced.matches}`;
      if (!invalidated && key === previousKey) return;
      if (!(atlas.complete&&atlas.naturalWidth) && !(fallback.complete&&fallback.naturalWidth)) return;
      invalidated=false; previousKey=key; lastPaint=now;
      ctx.clearRect(0,0,172,172);
      ctx.imageSmoothingEnabled=true;
      ctx.imageSmoothingQuality='high';

      if (poses.complete&&poses.naturalWidth&&['perch','grab','fall'].includes(current)) {
        if (current==='perch') ctx.drawImage(poses,82,283,830,435,4,86,164,86);
        else ctx.drawImage(poses,1147,26,503,832,38,8,96,159);
      } else if (atlas.complete&&atlas.naturalWidth) {
        drawCatRig(ctx,atlas,current,distance,reduced.matches,age,airProgress?.current);
      } else {
        // Keep the recognizable cat visible while its component atlas decodes.
        const scale=156/423;
        ctx.drawImage(fallback,910,88,420,336,86-420*scale/2,162-336*scale,420*scale,336*scale);
      }
    };
    raf=requestFrame(draw);
    return () => {
      cancelFrame(raf);
      for (const image of [atlas,poses,fallback]) image.onload=null;
      reduced.removeEventListener('change',invalidate);
      document.removeEventListener('visibilitychange',invalidate);
    };
  },[]);

  return <canvas className="tiny-cat-walk" ref={canvas} width={172} height={172} role="img"
    aria-label={mood==='grab'?'被轻轻提起来的脏脏包':mood==='perch'?'趴在窗沿的脏脏包':'脏脏包'}/>;
}
