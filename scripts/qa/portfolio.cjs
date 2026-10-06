/* Local game lifecycle/collision and resource-boundary regression checks. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'../..'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
let random=.04,time=0,id=0;const frames=new Map(),images=[];
const math=Object.create(Math);math.random=()=>random;
class Events{constructor(){this.listeners=new Map()}addEventListener(k,f){if(!this.listeners.has(k))this.listeners.set(k,new Set());this.listeners.get(k).add(f)}removeEventListener(k,f){this.listeners.get(k)?.delete(f)}send(k,event={}){for(const f of this.listeners.get(k)||[])f(event)}}
class Element extends Events{
 constructor(tag){super();this.tagName=tag.toUpperCase();this.nodeType=1;this.style={};this.dataset={};this.children=[];this.clientWidth=600;this.clientHeight=500;this.offsetHeight=24;this.offsetParent=true;this.classList={toggle(){}}}
 setAttribute(k,v){this[k]=v}append(...nodes){for(const n of nodes){if(n&&typeof n==='object')n.parentElement=this;this.children.push(n)}}replaceChildren(...n){this.children=[];this.append(...n)}
 focus(){document.activeElement=this}closest(){return null}contains(n){return n===this||this.children.some(c=>c?.contains?.(n))}setPointerCapture(){}
 querySelector(tag){return this.children.find(c=>c?.tagName===tag.toUpperCase())||this.children.map(c=>c?.querySelector?.(tag)).find(Boolean)}
 getBoundingClientRect(){return {left:0,top:0,width:parseFloat(this.style.width)||this.clientWidth,height:parseFloat(this.style.height)||this.clientHeight}}
 getContext(){return context}
}
const context=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});
const document=new Events();document.hidden=false;document.createElement=t=>new Element(t);document.createTextNode=t=>({textContent:t,nodeType:3});
const window=new Events();class Image{set src(value){images.push(value)}}
const cache={};
function load(file){
 file=path.resolve(root,file);if(cache[file])return cache[file];const m={exports:{}};cache[file]=m.exports;
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 function localRequire(name){if(name.endsWith('.css'))return {};if(name.startsWith('@/')||name.startsWith('.')){let p=name.startsWith('@/')?path.join(root,name.slice(2)):path.resolve(path.dirname(file),name);if(!path.extname(p)){p=['.ts','.tsx','.js'].map(x=>p+x).find(x=>fs.existsSync(x))}return load(p)}return require(name)}
 vm.runInNewContext(code,{module:m,exports:m.exports,require:localRequire,document,window,Image,Math:math,ResizeObserver:class{observe(){}disconnect(){}},localStorage:{getItem:()=>null,setItem(){}},setTimeout:()=>0,requestAnimationFrame:f=>{frames.set(++id,f);return id},cancelAnimationFrame:n=>frames.delete(n)});return m.exports;
}
const {safeLearningPath,learningUrl,learningOrigin}=load('lib/learning-navigation.ts');
assert.equal(safeLearningPath('//evil.example/'),'/');
for(const route of ['/learn?lesson=context','/agents','/tools','/ontology','/projects'])assert.equal(learningUrl(route),learningOrigin+route);
assert.equal(learningUrl('https://evil.example/'),learningOrigin+'/');
const page=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');
assert.ok(page.includes("case 'ai':return <OriginalApp"),'AI learning must open the full original application');
assert.ok(!page.includes('AILearningPreview'),'do not substitute selected excerpts');
const {createStarsRuntime}=load('app/components/arcade/original-stars/stars-runtime-adapter.js');
let hits=0;const game=createStarsRuntime({emit(){},isActive:()=>true},{sound:{error(){hits++}}});
game.onShow();game.start();const canvas=game.el.querySelector('canvas');assert.equal(canvas.width,320,'double pixel density preserves the cat face');
function tick(seconds){for(let i=0;i<Math.ceil(seconds*60);i++){time+=1000/60;for(const [key,fn]of [...frames])if(frames.delete(key))fn(time)}}
function target(x){const r=canvas.getBoundingClientRect();canvas.send('pointermove',{pointerType:'mouse',clientX:x/160*r.width})}
target(14);tick(9);assert.ok(game.score>=5,'gold stars must be catchable by the new cat');
random=.10;target(11);tick(6);assert.ok(hits>0,'blue blocks must still trigger the stun/penalty');
game.pause();const frozen=game.peek();tick(2);assert.equal(game.peek().time,frozen.time);assert.equal(game.state,'paused');
game.onHide();assert.equal(frames.size,0);game.onShow();game.resume();tick(.2);assert.ok(game.peek().time<frozen.time);
assert.deepEqual(images,['/assets/cat-avatars.webp'],'use our existing local Persian cat atlas');
game.destroy();assert.equal(frames.size,0);assert.equal([...document.listeners.values()].reduce((n,s)=>n+s.size,0),0);
console.log('PASS: full AI application/deep links, original cat atlas, star catches, block penalty, pause/hide/resume and cleanup.');
