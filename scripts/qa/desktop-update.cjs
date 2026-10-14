const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file,extra={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,require,Error,...extra});return m.exports;}
const layout=load('lib/desktop-layout.ts');
const ids=Array.from({length:24},(_,i)=>`zp-${i}`);
const order=layout.completeDesktopOrder([ids[2],ids[2],'removed',ids[1]],ids);
assert.equal(order.length,24);assert.equal(new Set(order).size,24);assert.equal(order[0],ids[2]);
for(const width of [760,820,1024,1366,1920,2560])for(const height of [580,640,768,900,1080,1440]){
 const {columns,spacing}=layout.desktopGrid(24,width,height);
 const slot=Math.min(58,Math.max(38,spacing-45));
 // 3px padding + 4px gap + 32px text + 2px border fit each row.
 assert.ok(spacing>=slot+41 || slot===58 && spacing>=99,`${width}x${height}: icon rows overlap`);
 const points=order.map((id,i)=>({id,x:25+i%columns*116,y:28+Math.floor(i/columns)*spacing}));
 assert.ok(points.every(p=>p.x+112<=width&&p.y+slot+41<height-45));
 const swapped=layout.swapDesktopOrder(order,order[0],order[17]);
 assert.equal(swapped[17],order[0]);assert.equal(new Set(swapped).size,order.length);
}
const memory=new Map();let reloads=0;
const recovery=load('lib/chunk-recovery.ts',{URL,Date,sessionStorage:{getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)},location:{href:'https://example.test/?track=1',replace:url=>{assert.ok(url.includes('track=1'));reloads++;}}});
assert.ok(recovery.isChunkError(new Error('Failed to fetch dynamically imported module: /old.js')));
assert.ok(!recovery.isChunkError(new Error('invalid score')));
assert.equal(recovery.reloadFreshOnce(),true);assert.equal(recovery.reloadFreshOnce(),false);assert.equal(reloads,1);
console.log('PASS: migration, 36 desktop sizes, unique icon swaps, stale-chunk detection and reload-loop guard.');
