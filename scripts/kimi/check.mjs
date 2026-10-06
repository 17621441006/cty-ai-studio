import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../../',import.meta.url)),out=path.join(root,'dist');
const manifest=JSON.parse(await fs.readFile(path.join(out,'deployment-manifest.json'),'utf8'));
const names=new Set(manifest.files.map(f=>f.path));
let checked=0;
for(const f of manifest.files){const data=await fs.readFile(path.join(out,f.path));if(data.length!==f.bytes||createHash('sha256').update(data).digest('hex')!==f.sha256)throw Error('Incomplete/changed asset: '+f.path);checked++}
for(const route of manifest.routes){const name=route.replace(/^\//,'')+'index.html';if(!names.has(name))throw Error('Missing entry: '+name)}
const required=['python/pyodide.asm.wasm','python/pyodide.mjs','usaco/python-worker.js','usaco/editor/vs/loader.js','games/inkwave/index.html','games/loire/index.html','tingjian/tour/tour.js'];
for(const file of required)if(!names.has(file))throw Error('Missing lazy resource: '+file);
// Follow real script/style/preload references in ALL produced HTML entrypoints.
let references=0;for(const f of manifest.files.filter(f=>f.path.endsWith('.html'))){
 const html=await fs.readFile(path.join(out,f.path),'utf8');
 for(const tag of html.matchAll(/<(?:script|link)\b[^>]*>/g))for(const attr of tag[0].matchAll(/(?:src|href)=["']([^"']+)["']/g)){
  const value=attr[1];if(/^(?:[a-z]+:|\/\/|#)/i.test(value))continue;
  const target=decodeURIComponent(new URL(value,'https://cty.test/'+f.path).pathname.slice(1));
  if(!names.has(target))throw Error(`Broken resource in ${f.path}: ${target}`);references++;
 }
}
const appAssets=manifest.files.filter(f=>/^(?:ai|usaco)?\/?assets\/.*\.js$/.test(f.path));
for(const f of appAssets){const text=await fs.readFile(path.join(out,f.path),'utf8');if(/https:\/\/(?:ai-cat|usaco-bronze-lab|tingjian-space-lab)\.jackchen911006\.chatgpt\.site/.test(text))throw Error('Unmigrated owned app URL: '+f.path)}
const worker=await fs.readFile(path.join(out,'usaco/python-worker.js'),'utf8');if(worker.includes('cdn.jsdelivr.net'))throw Error('Python worker still depends on CDN');
await fs.access(path.join(root,'dist-server/api.mjs'));
console.log(`PASS: ${checked} files hash-checked; ${manifest.routes.length} page entries; ${references} HTML runtime references; local Python/Monaco/AI/USACO/庭间 verified.`);
