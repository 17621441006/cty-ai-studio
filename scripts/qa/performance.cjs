/* Source-level performance regressions. No browser/graphics driver required. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),ts=require('typescript');
const compile=p=>ts.transpileModule(fs.readFileSync(path.join(root,p),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
let now=100,seq=0;const frames=new Map(),listeners=new Set();
const document={hidden:false,addEventListener:(n,f)=>listeners.add(f),removeEventListener:(n,f)=>listeners.delete(f)};
const window={requestAnimationFrame:f=>{frames.set(++seq,f);return seq},cancelAnimationFrame:id=>frames.delete(id)};
const moduleClock={exports:{}};vm.runInNewContext(compile('lib/animation-clock.ts'),{module:moduleClock,exports:moduleClock.exports,window,document,performance:{now:()=>now},queueMicrotask});
const {createFrameClock}=moduleClock.exports,clock=createFrameClock();
const frame=(dt=17)=>{now+=dt;for(const [id,f]of [...frames])if(frames.delete(id))f(now)};
let count=0,id=0,timestamps=[];const loop=t=>{count++;timestamps.push(t);id=clock.requestFrame(loop)};
id=clock.requestFrame(loop);frame();frame();assert.equal(count,2);
clock.setActive(false);const before=clock.now();for(let i=0;i<120;i++)frame();assert.equal(count,2);assert.equal(frames.size,0);assert.equal(clock.now(),before);
clock.setActive(true);frame();assert.equal(count,3);assert.ok(timestamps[2]-timestamps[1]<40,'restore must not fast-forward simulation time');
document.hidden=true;listeners.forEach(f=>f());for(let i=0;i<100;i++)frame();assert.equal(count,3);assert.equal(frames.size,0);
document.hidden=false;listeners.forEach(f=>f());frame();assert.equal(count,4);
clock.cancelFrame(id);frame();assert.equal(count,4);
clock.requestFrame(()=>{throw Error('disposed frame ran')});clock.dispose();frame();assert.equal(frames.size,0);assert.equal(listeners.size,0);
const cold=createFrameClock(false);let coldCount=0;cold.requestFrame(()=>coldCount++);frame();assert.equal(coldCount,0);cold.setActive(true);frame();assert.equal(coldCount,1);cold.dispose();
const fast=createFrameClock();let fastFrames=0;const fastLoop=()=>{fastFrames++;fast.requestFrame(fastLoop)};fast.requestFrame(fastLoop);for(let i=0;i<144;i++)frame(1000/144);assert.ok(fastFrames<=61&&fastFrames>=45);fast.dispose();
// Exercise the real provider with deterministic hooks. Playback progress must not
// invalidate the separate desktop controls context, and first paint must not prefetch audio.
let slots=[],cursor=0;
const react={createContext:v=>({Provider:Symbol(),value:v}),useContext:c=>c.value,useEffect(){},useState:init=>{const i=cursor++;if(!slots[i])slots[i]={value:typeof init==='function'?init():init};return [slots[i].value,v=>slots[i].value=typeof v==='function'?v(slots[i].value):v]},useRef:init=>{const i=cursor++;return slots[i]??= {current:init}},useMemo:(fn,deps)=>{const i=cursor++;if(!slots[i]||deps.some((x,j)=>!Object.is(x,slots[i].deps[j])))slots[i]={value:fn(),deps};return slots[i].value}};
const jsx={jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
const music={exports:{}};vm.runInNewContext(compile('app/components/MusicContext.tsx'),{module:music,exports:music.exports,require:n=>n==='react'?react:jsx,URL,Math,Number,Array,String,Error,crypto:globalThis.crypto});
function render(){cursor=0;return music.exports.MusicProvider({children:'desktop'})}
let tree=render(),controls=tree.props.value,audio=tree.props.children.props.children[1];assert.equal(audio.props.preload,'none');
for(let i=1;i<=120;i++){audio.props.onTimeUpdate({currentTarget:{currentTime:i}});tree=render();assert.equal(tree.props.value,controls,'progress rerendered desktop controls');audio=tree.props.children.props.children[1]}
audio.props.onPlay();tree=render();assert.equal(tree.props.value.playing,true);assert.notEqual(tree.props.value,controls);
console.log('PASS: hidden/resumed/disposed frame lifecycle, virtual time, high-refresh cap, 120 music progress updates isolated, audio preload disabled.');

const visibilityModule={exports:{}};vm.runInNewContext(compile('lib/window-visibility.ts'),{module:visibilityModule,exports:visibilityModule.exports});
const {coveringWindow,windowCanAnimate}=visibilityModule.exports;
const windows=[{id:'game',min:false,max:false,z:11},{id:'world',min:false,max:true,z:13},{id:'notes',min:false,max:false,z:15}];
assert.equal(coveringWindow(windows).id,'world');
const options={moonOpen:false,mobile:false,activeId:'notes',coverZ:13};
assert.equal(windowCanAnimate(windows[0],options),false);assert.equal(windowCanAnimate(windows[1],options),true);assert.equal(windowCanAnimate(windows[2],options),true);
assert.equal(windowCanAnimate({...windows[2],min:true},options),false);assert.equal(windowCanAnimate(windows[2],{...options,moonOpen:true}),false);
assert.equal(windowCanAnimate(windows[1],{...options,mobile:true}),false);assert.equal(windowCanAnimate(windows[2],{...options,mobile:true}),true);
assert.equal(windowCanAnimate({id:'music',z:50,min:true,max:false},options),false);assert.equal(windowCanAnimate({id:'music',z:50,min:true,max:false},{...options,coverZ:undefined}),true);
console.log('PASS: fullscreen cover below a floating window, minimized windows, mobile navigation, moon space and background audio UI.');
