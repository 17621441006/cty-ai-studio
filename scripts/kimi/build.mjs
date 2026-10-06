import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import ts from 'typescript';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {build as bundle} from 'esbuild';
import {learningRoutes,publicPath,desktopURL,rewriteTextAssets} from './paths.mjs';
const root=path.resolve(fileURLToPath(new URL('../../',import.meta.url))),out=path.join(root,'dist'),cache=path.join(root,'.kimi');
const sources=JSON.parse(await fs.readFile(new URL('./sources.json',import.meta.url),'utf8'));
const run=(args,cwd)=>execFileSync('git',args,{cwd,stdio:'inherit'});
await fs.mkdir(cache,{recursive:true});
for(const [id,spec] of Object.entries(sources)){
 const dir=path.join(cache,'sources',id);await fs.mkdir(path.dirname(dir),{recursive:true});
 try{await fs.access(path.join(dir,'.git'))}catch{run(['clone','--no-checkout','https://github.com/'+spec.repository+'.git',dir],root)}
 try{execFileSync('git',['cat-file','-e',spec.commit+'^{commit}'],{cwd:dir,stdio:'ignore'})}catch{run(['fetch','origin',spec.commit],dir)}
 // A --no-checkout clone can already have the requested HEAD, but no files yet.
 run(['checkout','--detach',spec.commit],dir);
 execFileSync('git',['diff','--quiet','HEAD','--'],{cwd:dir});
 if(execFileSync('git',['rev-parse','HEAD'],{cwd:dir,encoding:'utf8'}).trim()!==spec.commit)throw Error('Source revision mismatch: '+id);
}
await fs.rm(out,{recursive:true,force:true});await fs.mkdir(out,{recursive:true});
const sourceDir=id=>path.join(cache,'sources',id);
const entriesFor=async dir=>new Set(await fs.readdir(dir));
const aiEntries=await entriesFor(path.join(sourceDir('ai'),'public'));
const usacoEntries=await entriesFor(path.join(sourceDir('usaco'),'public'));
function adapt(code,file,id,entries){
 if(id==='main'){
  code=code.replace("const assistantOrigin='https://ai-cat.jackchen911006.chatgpt.site'","const assistantOrigin=window.location.origin");
  if(file.endsWith('learning-navigation.ts'))code=code.replace("export const learningOrigin='https://ai-cat.jackchen911006.chatgpt.site'","export const learningOrigin=window.location.origin").replace('learningOrigin+safeLearningPath(path)',"learningOrigin+(safeLearningPath(path)==='/'?'/ai':safeLearningPath(path))");
  code=code.replaceAll('(?:learn|','(?:ai|learn|');
 }else if(id==='usaco'){
  code=code.replaceAll("'/editor/vs'","'/usaco/editor/vs'").replace("new Worker('/python-worker.js')","new Worker('/usaco/python-worker.js',{type:'module'})");
 }else if(id==='ai'){
  code=code.replace("const portfolio='https://dirtybag-time-apartment.jackchen911006.chatgpt.site'","const portfolio=window.location.origin");
  code=code.replaceAll('(?:learn|','(?:ai|learn|');
 }
 if(/\.(css|json)$/.test(file)){
  if(id!=='main'&&file.endsWith('/app/globals.css'))code+='\n'+['app','components','lib','hooks'].map(dir=>'@source '+JSON.stringify(path.join(sourceDir(id),dir))+';').join('\n');
  return id==='main'?code:rewriteTextAssets(code,id,entries);
 }
 const kind=file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS;
 const source=ts.createSourceFile(file,code,ts.ScriptTarget.Latest,true,kind),edits=[];
 function visit(node){
  if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)){
   const value=id==='main'?desktopURL(node.text):publicPath(node.text,id,entries);
   if(value!==node.text)edits.push([node.getStart(source),node.end,JSON.stringify(value)]);
  }else if(ts.isTemplateHead(node)){
   const value=id==='main'?desktopURL(node.text):publicPath(node.text,id,entries);
   if(value!==node.text)edits.push([node.getStart(source)+1,node.end-2,value]);
  }
  ts.forEachChild(node,visit);
 }visit(source);
 for(const [start,end,value] of edits.sort((a,b)=>b[0]-a[0]))code=code.slice(0,start)+value+code.slice(end);
 return code;
}
async function buildApp(id,src,base,entry,entries=new Set()){
 const temp=path.join(cache,'entries',id);await fs.mkdir(temp,{recursive:true});
 const layout=await fs.readFile(path.join(src,'app/layout.tsx'),'utf8');
 const styles=[...layout.matchAll(/import ["']([^"']+\.css)["'];/g)].map(m=>'import '+JSON.stringify(m[1].startsWith('.')?path.resolve(src,'app',m[1]):m[1])+';').join('\n');
 await fs.writeFile(path.join(temp,'main.tsx'),`import React from 'react';import{createRoot}from'react-dom/client';\n${styles}\n${entry}\ncreateRoot(document.getElementById('root')!).render(<App/>);`);
 const theme=id==='ai'?`<script>try{const t=localStorage.getItem('ai-practice-theme');document.documentElement.classList.toggle('dark',t?t==='dark':matchMedia('(prefers-color-scheme:dark)').matches)}catch{}</script>`:'';
 await fs.writeFile(path.join(temp,'index.html'),`<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${id==='main'?'CTY AI STUDIO':id==='ai'?'AI 进阶研习所':'USACO Lab'}</title>${theme}</head><body><div id="root"></div><script type="module" src="./main.tsx"></script></body></html>`);
 await build({configFile:false,root:temp,base,publicDir:false,logLevel:'warn',plugins:[{name:'cty-portable-paths',enforce:'pre',transform(code,file){if(file.startsWith(src+'/')&&!file.includes('/node_modules/')&&/\.(tsx?|jsx?|json|css)$/.test(file))return {code:adapt(code,file,id,entries),map:null}}},react()],resolve:{alias:{'@':src,'next/dynamic':path.join(root,'scripts/kimi/dynamic.tsx')},dedupe:['react','react-dom']},css:{postcss:path.join(root,'postcss.config.mjs')},build:{outDir:path.join(out,base),emptyOutDir:false,chunkSizeWarningLimit:2500}});
}
await buildApp('main',root,'/',`import App from ${JSON.stringify(path.join(root,'app/page.tsx'))};`);
await buildApp('ai',sourceDir('ai'),'/ai/',`import Hub from ${JSON.stringify(path.join(sourceDir('ai'),'components/hub.tsx'))};import Assistant from ${JSON.stringify(path.join(sourceDir('ai'),'app/desktop-assistant/page.tsx'))};import{navigationItems}from ${JSON.stringify(path.join(sourceDir('ai'),'lib/navigation.ts'))};const p=location.pathname.replace(/\\/$/,'');function App(){return p==='/desktop-assistant'?<Assistant/>:<Hub view={navigationItems.find(x=>x.href===p)?.id||'home'}/>}`,aiEntries);
await buildApp('usaco',sourceDir('usaco'),'/usaco/',`import App from ${JSON.stringify(path.join(sourceDir('usaco'),'app/page.tsx'))};`,usacoEntries);
async function copyPublic(src,dest,id,entries){
 await fs.mkdir(dest,{recursive:true});for(const d of await fs.readdir(src,{withFileTypes:true})){const from=path.join(src,d.name),to=path.join(dest,d.name);if(d.isDirectory()){await copyPublic(from,to,id,entries);continue}if(!d.isFile())continue;
  if(id&&/\.(?:html|css|js|mjs|json|svg)$/.test(d.name)){let text=await fs.readFile(from,'utf8');text=rewriteTextAssets(text,id,entries);if(id==='usaco'&&d.name==='python-worker.js')text=text.replace('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/','/python/').replace("importScripts(base+'pyodide.js');","const {loadPyodide}=await import(base+'pyodide.mjs');");await fs.writeFile(to,text)}else await fs.copyFile(from,to);
 }
}
await copyPublic(path.join(root,'public'),out);
await copyPublic(path.join(sourceDir('ai'),'public'),path.join(out,'ai-assets'),'ai',aiEntries);
await copyPublic(path.join(sourceDir('usaco'),'public'),path.join(out,'usaco'),'usaco',usacoEntries);
const houseDist=path.join(sourceDir('home'),'dist');await copyPublic(houseDist,path.join(out,'tingjian'),'home',await entriesFor(houseDist));
// Physical entry files keep refresh/deep links working without a blanket SPA rewrite.
const aiHTML=await fs.readFile(path.join(out,'ai/index.html'));
for(const route of learningRoutes){await fs.mkdir(path.join(out,route),{recursive:true});await fs.writeFile(path.join(out,route,'index.html'),aiHTML)}
// Monaco and Python are local assets, loaded only after opening an exercise.
const monaco=path.join(root,'node_modules/monaco-editor/min/vs');await fs.cp(monaco,path.join(out,'usaco/editor/vs'),{recursive:true});
await fs.mkdir(path.join(root,'dist-server'),{recursive:true});
await bundle({entryPoints:[path.join(root,'scripts/kimi/api-entry.ts')],bundle:true,platform:'node',format:'esm',target:'node22',outfile:path.join(root,'dist-server/api.mjs'),alias:{'@':sourceDir('ai'),'cloudflare:workers':path.join(root,'scripts/kimi/server-env.mjs'),'@/app/chatgpt-auth':path.join(root,'scripts/kimi/visitor.mjs')},external:['node:*']});
const files=[];async function scan(dir){for(const item of await fs.readdir(dir,{withFileTypes:true})){const f=path.join(dir,item.name);if(item.isDirectory())await scan(f);else if(item.isFile()){const b=await fs.readFile(f);files.push({path:path.relative(out,f),bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')})}}}await scan(out);
await fs.writeFile(path.join(out,'deployment-manifest.json'),JSON.stringify({format:1,sources,routes:['/',...learningRoutes.map(r=>'/'+r+'/'),'/usaco/','/tingjian/'],files},null,2));
console.log(`Kimi build complete: ${files.length} files, ${(files.reduce((n,f)=>n+f.bytes,0)/1024/1024).toFixed(1)} MiB. All assets are loaded on demand. Upload all of dist/.`);
