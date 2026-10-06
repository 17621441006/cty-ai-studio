const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'../..'),pending=new Map(),events=new Map(),docEvents=new Map();let sequence=0,ticks=0,errors=[];
const parent={},origin='https://cty.example',document={hidden:false,documentElement:{classList:{toggle(){}}},addEventListener:(k,f)=>docEvents.set(k,f),getElementById:()=>null};
const window={requestAnimationFrame:fn=>{pending.set(++sequence,fn);return sequence},cancelAnimationFrame:id=>pending.delete(id)};
vm.runInNewContext(fs.readFileSync(path.join(root,'public/games/inkwave/cty-host.js'),'utf8'),{window,parent,document,location:{origin},addEventListener:(k,f)=>events.set(k,f),setTimeout:fn=>errors.push(fn)});
const frame=()=>{for(const[id,fn]of[...pending])if(pending.delete(id))fn(ticks++*17)};
let count=0;function loop(){count++;window.requestAnimationFrame(loop)}window.requestAnimationFrame(loop);frame();assert.equal(count,1);
const signal=(active,source=parent,url=origin)=>events.get('message')({source,origin:url,data:{type:'cty:game-visibility',active}});
signal(false,{},origin);frame();assert.equal(count,2,'foreign windows cannot pause a game');
signal(false);for(let i=0;i<100;i++)frame();assert.equal(count,2);assert.equal(pending.size,0,'minimized iframe schedules no GPU/UI frames');
signal(true);frame();assert.equal(count,3,'one loop resumes without duplication');
document.hidden=true;docEvents.get('visibilitychange')();frame();assert.equal(count,3);
signal(true);frame();assert.equal(count,3,'parent cannot override hidden tab');
document.hidden=false;docEvents.get('visibilitychange')();frame();assert.equal(count,4);
window.requestAnimationFrame(()=>{throw Error('isolated')});let sibling=false;window.requestAnimationFrame(()=>sibling=true);frame();assert.ok(sibling);assert.equal(errors.length,1,'one callback cannot stop the other render loops');
signal(false);

// Run the real touch adapter: joystick, aim, simultaneous fire and jumping, cancel/reset.
class El{constructor(){this.events={};this.dataset={};this.style={};this.hidden=false;this.classList={toggle(){}}}addEventListener(k,f){this.events[k]=f}send(k,e={}){this.events[k]?.({pointerId:1,clientX:0,clientY:0,preventDefault(){},stopPropagation(){},...e})}setPointerCapture(){}}
const stick=new El();stick.firstElementChild=new El();const aim=new El(),pause=new El(),controls=new El();
const buttons=['ShiftLeft','Space','KeyE','KeyF','Tab'].map(k=>{const e=new El();e.dataset.key=k;return e});const fire=new El();fire.dataset.fire='true';buttons.push(fire);
controls.querySelectorAll=()=>buttons;controls.querySelector=s=>({'.cty-stick':stick,'.cty-aim':aim,'.cty-pause':pause})[s];
const touchDoc={createElement:()=>controls,body:{append(){}}};
const code=fs.readFileSync(path.join(root,'vendor/inkwave/src/cty-integration.js'),'utf8').replace(/export function /g,'function ')+'\nthis.installTouch=installTouch;';
const context={document:touchDoc};vm.createContext(context);vm.runInContext(code,context);
let pauses=0;const game={input:{keys:new Set(),pressed:new Set(),mouse:{}},match:{paused:false},menus:{current:null},pause(){pauses++}};
const G={mode:'match',audio:{init(){}}},touch=context.installTouch(game,G);touch.update();assert.equal(controls.hidden,false);
stick.send('pointerdown');stick.send('pointermove',{clientX:25,clientY:-30});assert.ok(game.input.keys.has('KeyD')&&game.input.keys.has('KeyW'));
fire.send('pointerdown',{pointerId:3});buttons[1].send('pointerdown',{pointerId:4});assert.ok(game.input.mouse.left&&game.input.keys.has('Space'));
aim.send('pointerdown',{pointerId:2});game.input.mouse.dx=game.input.mouse.dy=0;aim.send('pointermove',{pointerId:2,clientX:12,clientY:-5});assert.equal(game.input.mouse.dx,24);
fire.send('pointercancel',{pointerId:3});assert.equal(game.input.mouse.left,false);
game.match.paused=true;touch.update();assert.equal(controls.hidden,true);assert.equal(game.input.keys.size,0);
pause.send('click');assert.equal(pauses,1);

// Built ESM chunks must only reference bundled local files.
const dir=path.join(root,'public/games/inkwave/runtime');let files=0;
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(f.endsWith('.js')){files++;const s=fs.readFileSync(f,'utf8');for(const m of s.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)["']([^"']+\.js)["']/g)){assert.ok(m[1].startsWith('.'),'no CDN or unresolved bare module');assert.ok(fs.existsSync(path.resolve(path.dirname(f),m[1])),`missing chunk ${m[1]}`)}}}}
walk(dir);assert.ok(files>10);
console.log(`PASS: pause/resume, hidden tabs, trusted host messages, callback isolation, touch move/aim/fire/jump/cancel, and ${files} local ESM chunks.`);
