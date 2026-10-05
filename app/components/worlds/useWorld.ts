'use client';
import {useAnimationClock} from '../AnimationScope';
import {useEffect,useRef,useState} from 'react';
import type * as T from 'three';
import {createWorldEngine,type WorldBundle,type WorldSettings} from './engine';
export function useWorld(factory:(simple:boolean)=>WorldBundle,key:string,settings:WorldSettings){
 const clock=useAnimationClock();
 const host=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createWorldEngine>|null>(null),creator=useRef(factory),[fallback,setFallback]=useState(false),[error,setError]=useState(''),[selected,setSelected]=useState<T.Object3D|null>(null),[photo,setPhoto]=useState<string|null>(null),[,refresh]=useState(0);creator.current=factory;
 useEffect(()=>{if(!host.current)return;try{engine.current=createWorldEngine(host.current,setFallback,o=>{setSelected(o);refresh(n=>n+1)},setPhoto,clock)}catch{setError('场景暂时未能打开，请关闭窗口后重新进入。')}return()=>{engine.current?.dispose();engine.current=null}},[]);
 useEffect(()=>{try{engine.current?.load(creator.current(engine.current.simple));setError('')}catch{setError('这个场景未能载入，请换个场景后再试。')}},[key]);
 useEffect(()=>{engine.current?.update(settings)},[settings]);
 return {host,engine,fallback,error,selected,photo,setPhoto};
}
