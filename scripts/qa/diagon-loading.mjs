import test from 'node:test';
import assert from 'node:assert/strict';
import {loadWithRetry,loadDiagonImages,prepareDiagon,DIAGON_ASSETS} from '../../app/components/arcade/diagon/assets.mjs';
const signal=()=>new AbortController().signal;

test('a stalled image is retried and the eventual decoded image is returned',async()=>{
 let calls=0,aborts=0;const expected={width:512};
 const image=await loadWithRetry('/stone',{signal:signal(),timeoutMs:12,retryDelayMs:1,request:(_url,{signal})=>{calls++;signal.addEventListener('abort',()=>aborts++);return calls===1?new Promise(()=>{}):Promise.resolve(expected);}});
 assert.equal(image,expected);assert.equal(calls,2);assert.ok(aborts>=1);
});
test('persistent texture failure rejects instead of reporting ready or hanging',async()=>{
 let calls=0;await assert.rejects(loadWithRetry('/404',{signal:signal(),retryDelayMs:1,request:async()=>{calls++;throw new Error('404');}}),/404/);assert.equal(calls,3);
});
test('closing the work aborts in-flight requests without scheduling retries',async()=>{
 const controller=new AbortController();let calls=0;
 const pending=loadWithRetry('/pending',{signal:controller.signal,timeoutMs:1000,request:()=>{calls++;return new Promise(()=>{});}});
 controller.abort();await assert.rejects(pending,{name:'AbortError'});assert.equal(calls,1);
});
test('asset pool is bounded, URLs are unique and every decoded image completes before scene creation',async()=>{
 let active=0,peak=0,completed=0;const progress=[];
 const images=await loadDiagonImages({signal:signal(),assets:[...DIAGON_ASSETS,DIAGON_ASSETS[0]],onProgress:(done,total)=>progress.push([done,total]),request:async url=>{active++;peak=Math.max(peak,active);await new Promise(r=>setTimeout(r,2));active--;completed++;return {url};}});
 assert.equal(peak,4);assert.equal(completed,12);assert.equal(images.size,12);assert.deepEqual(progress.at(-1),[12,12]);
});
test('entrance stays covered until textures, geometry, shaders and the first render finish in order',async()=>{
 const events=[];let finishWarm;const gpu=new Promise(r=>finishWarm=r);
 const prepared=prepareDiagon({signal:signal(),onStage:v=>events.push(v),load:async()=>new Map(),build:async()=>({scene:true}),warm:()=>gpu,render:async()=>events.push('rendered')});
 await new Promise(r=>setTimeout(r,1));assert.deepEqual(events,['textures','geometry','lighting']);
 finishWarm();await prepared;assert.deepEqual(events,['textures','geometry','lighting','frame','rendered','ready']);
});
test('GPU/render failure never enters the ready state and closing during preparation never reveals stale content',async()=>{
 const stages=[];await assert.rejects(prepareDiagon({signal:signal(),onStage:v=>stages.push(v),load:async()=>new Map(),build:async()=>({}),warm:async()=>{throw new Error('GPU');},render:async()=>{}}),/GPU/);assert.ok(!stages.includes('ready'));
 const c=new AbortController();await assert.rejects(prepareDiagon({signal:c.signal,load:async()=>{c.abort();return new Map();},build:async()=>{assert.fail('must not build');},warm:async()=>{},render:async()=>{}}),{name:'AbortError'});
});
