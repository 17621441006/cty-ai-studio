// DOM-event regression harness for the actual game runtime (Node 24, no browser).
// Deliberately emits focusout when a focused overlay button is removed.
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {installGameFocusGuard} from '../../app/components/arcade/original-stars/stars-focus.mjs';
registerHooks({resolve(specifier,context,next){return next(specifier.endsWith('/lib/pixel-cat')?specifier+'.ts':specifier,context);}});
const {createStarsRuntime}=await import('../../app/components/arcade/original-stars/stars-runtime-adapter.js');
let doc,frames,frameID,now;
const context=new Proxy({createLinearGradient(){return {addColorStop(){}};}},{get:(target,key)=>key in target?target[key]:()=>{}});
class Element extends EventTarget {
 constructor(tag='div'){super();this.tagName=tag.toUpperCase();this.ownerDocument=doc;this.children=[];this.style={};this.className='';this.classList={add(){},toggle(){}};this.clientWidth=420;this.clientHeight=620;this.offsetHeight=28;this.parentElement=null;}
 append(...nodes){for(const node of nodes){if(typeof node!=='string'){node.parentElement=this;this.children.push(node);}}}
 contains(node){return node===this||this.children.some(child=>child.contains(node));}
 replaceChildren(...nodes){
  if(this.children.some(node=>node.contains(doc.activeElement))){const previous=doc.activeElement;doc.activeElement=doc.body;emitFocusOut(previous,null);}
  for(const node of this.children)node.parentElement=null;this.children=[];this.append(...nodes);
 }
 focus(){if(doc.activeElement===this)return;const previous=doc.activeElement;doc.activeElement=this;if(previous)emitFocusOut(previous,this);}
 click(){this.dispatchEvent(new Event('click'));}
 setAttribute(){}getContext(){return context;}getBoundingClientRect(){return {left:0,top:0,width:420,height:600};}
 setPointerCapture(){}releasePointerCapture(){}
 querySelector(selector){for(const node of this.children){if(selector==='button'&&node.tagName==='BUTTON')return node;const found=node.querySelector(selector);if(found)return found;}return null;}
 closest(){return null;}
}
function emitFocusOut(node,relatedTarget){for(let current=node;current;current=current.parentElement){const event=new Event('focusout');Object.defineProperty(event,'relatedTarget',{value:relatedTarget});current.dispatchEvent(event);}}
function setup(){
 doc=new EventTarget();doc.hidden=false;doc.createElement=tag=>new Element(tag);doc.createTextNode=text=>new Element('text');doc.body=new Element('body');doc.activeElement=doc.body;
 Object.assign(globalThis,{document:doc,window:new EventTarget(),Image:class {},ResizeObserver:class {observe(){}disconnect(){}},localStorage:{getItem(){return null;},setItem(){}}});
 frames=new Map();frameID=0;now=0;globalThis.requestAnimationFrame=callback=>{frames.set(++frameID,callback);return frameID;};globalThis.cancelAnimationFrame=id=>frames.delete(id);
 const outer=new Element(),game=createStarsRuntime();doc.body.append(outer);outer.append(game.el);const cleanup=installGameFocusGuard(outer,game);game.onShow();
 return {outer,game,cleanup:()=>{cleanup();game.destroy();}};
}
function frame(){now+=1000/60;const batch=[...frames.values()];frames.clear();batch.forEach(callback=>callback(now));}
const settle=()=>new Promise(resolve=>queueMicrotask(resolve));

test('mouse/keyboard-focused Start button enters play and countdown advances',async()=>{
 const {game,cleanup}=setup();const start=game.el.querySelector('button');start.focus();start.click();await settle();assert.equal(game.state,'playing');assert.equal(doc.activeElement,game.el);
 for(let i=0;i<90;i++)frame();assert.ok(game.peek().time<119);assert.ok(game.peek().items.length>0);cleanup();
});
test('touch-style Start click without button focus also starts the round',async()=>{
 const {game,cleanup}=setup();game.el.querySelector('button').click();await settle();assert.equal(game.state,'playing');cleanup();
});
test('Continue can be clicked repeatedly without returning to the pause overlay',async()=>{
 const {game,cleanup}=setup();game.start();
 for(let i=0;i<5;i++){game.pause();const resume=game.el.querySelector('button');resume.focus();resume.click();await settle();assert.equal(game.state,'playing');frame();}
 cleanup();
});
test('temporary null focus during button removal does not pause after focus settles inside',async()=>{
 const {game,outer,cleanup}=setup();game.start();const removed=new Element('button');outer.append(removed);removed.focus();emitFocusOut(removed,null);game.el.focus();await settle();assert.equal(game.state,'playing');cleanup();
});
test('real focus outside the app pauses, then Continue recovers',async()=>{
 const {game,cleanup}=setup();game.start();const outside=new Element('button');doc.body.append(outside);outside.focus();await settle();assert.equal(game.state,'paused');const pausedTime=game.peek().time;for(let i=0;i<60;i++)frame();assert.equal(game.peek().time,pausedTime);
 game.el.querySelector('button').focus();game.el.querySelector('button').click();await settle();assert.equal(game.state,'playing');cleanup();
});
test('hiding and returning preserves pause; pending focus checks are disposed safely',async()=>{
 const {game,outer,cleanup}=setup();game.start();game.onHide();assert.equal(game.state,'paused');game.onShow();assert.equal(game.state,'paused');game.resume();outer.dispatchEvent(new Event('focusout'));cleanup();await settle();assert.equal(frames.size,0);
});
