import assert from 'node:assert/strict';
const base=process.argv.find(x=>/^https?:\/\//.test(x));
if(!base)throw Error('Usage: node scripts/kimi/smoke.mjs https://your-published-host [--require-cloud]');
const origin=new URL(base).origin;
async function check(route,type,pattern){
 const response=await fetch(origin+route,{signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});
 assert.equal(response.status,200,route+' returned '+response.status);
 assert.ok(response.headers.get('content-type')?.includes(type),route+' has wrong MIME type (possibly an HTML fallback)');
 if(pattern){const body=await response.text();assert.match(body,pattern,route+' is the wrong application')}
 else await response.body?.cancel();
 console.log('PASS',route);
}
await Promise.all([
 check('/','text/html',/CTY AI STUDIO/),check('/ai/','text/html',/\/ai\/assets\//),
 check('/learn/?lesson=1','text/html',/\/ai\/assets\//),check('/desktop-assistant/','text/html',/\/ai\/assets\//),
 check('/usaco/','text/html',/USACO Lab/),check('/tingjian/','text/html',/庭间/),
 check('/games/inkwave/index.html','text/html',/INKWAVE|inkwave/i),
 check('/usaco/python-worker.js','javascript',/pyodide\.mjs/),
 check('/python/pyodide.asm.wasm','application/wasm'),
]);
const response=await fetch(origin+'/api/assistant',{signal:AbortSignal.timeout(20000)});
assert.equal(response.status,200,'AI backend is not deployed');
assert.ok(response.headers.get('content-type')?.includes('application/json'),'API was rewritten to index.html');
const data=await response.json();assert.equal(typeof data.configured,'boolean');
if(process.argv.includes('--require-cloud'))assert.equal(data.configured,true,'Configure the API key privately on the server');
console.log('PASS API connection contract; cloudConfigured='+data.configured+'. Test a real answer and storage persistence manually.');
