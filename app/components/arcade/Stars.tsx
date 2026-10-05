'use client';
import {useWindowVisible} from '../AnimationScope';
import {useEffect,useRef} from 'react';
import {createStarsRuntime,type StarsRuntime} from './original-stars/stars-runtime-adapter';
export default function Stars(){
 const visible=useWindowVisible();
 const mount=useRef<HTMLDivElement>(null),runtime=useRef<StarsRuntime|null>(null);
 useEffect(()=>{const holder=mount.current;if(!holder)return;const game=createStarsRuntime({emit(){},isActive(){return holder.contains(document.activeElement) && (holder.closest('.retro-window')?.classList.contains('focused') ?? true)}},{storageKey:'cty-stars-best'});runtime.current=game;holder.appendChild(game.el);game.onShow();const focusout=(e:FocusEvent)=>{if(!holder.parentElement?.contains(e.relatedTarget as Node)&&game.state==='playing'){game.pause()}};holder.addEventListener('focusout',focusout);return()=>{holder.removeEventListener('focusout',focusout);game.destroy();game.el.remove();runtime.current=null}},[]);
 useEffect(()=>{if(visible)runtime.current?.onShow();else runtime.current?.onHide()},[visible]);
 function toggle(){const game=runtime.current;if(!game)return;if(game.state==='paused'){game.resume()}else if(game.state==='playing'){game.pause()}}
 return <div className="stars-original"><div ref={mount} className="stars-original-mount"/><footer><span>蓝色方块：眩晕 0.7 秒 · −3 分 · 连续接星有加成</span><button onMouseDown={e=>e.preventDefault()} onClick={toggle}>暂停 / 继续</button></footer></div>;
}
