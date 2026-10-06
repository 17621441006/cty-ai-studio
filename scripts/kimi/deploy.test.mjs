import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {session,assetPath,byteRange} from './http.mjs';
import {openDatabase} from './database.mjs';
import {publicPath,desktopURL,rewriteTextAssets} from './paths.mjs';

test('deployment paths preserve external URLs, query strings and non-asset Python paths',()=>{
 const entries=new Set(['images','python-worker.js']);
 assert.equal(publicPath('/images/cat.webp','ai',entries),'/ai-assets/images/cat.webp');
 assert.equal(publicPath('/','ai',entries),'/ai');
 assert.equal(publicPath('/learn?lesson=5','ai',entries),'/learn?lesson=5');
 assert.equal(publicPath('//cdn.test/image','ai',entries),'//cdn.test/image');
 assert.equal(desktopURL('https://ai-cat.jackchen911006.chatgpt.site/learn?lesson=5'),'/learn?lesson=5');
 assert.equal(rewriteTextAssets("'/workspace/test.py' '/images/a.png'",'ai',entries),"'/workspace/test.py' '/ai-assets/images/a.png'");
});
test('visitor sessions reject forged cookies and keep valid independent identities',()=>{
 const a=session('', 'secret'),b=session('', 'secret');assert.notEqual(a.id,b.id);
 assert.equal(session('cty_visitor='+a.value,'secret').id,a.id);
 assert.notEqual(session('cty_visitor='+a.value,'other secret').id,a.id);
 assert.notEqual(session('cty_visitor='+a.id+'.'+'0'.repeat(64),'secret').id,a.id);
});
test('media seeking supports regular and suffix byte ranges',()=>{
 assert.deepEqual(byteRange('bytes=4-9',100),{start:4,end:9});
 assert.deepEqual(byteRange('bytes=-10',100),{start:90,end:99});
 assert.deepEqual(byteRange('bytes=90-',100),{start:90,end:99});
 assert.equal(byteRange('bytes=200-',100),false);assert.equal(byteRange('bytes=9-4',100),false);
});
test('static server cannot expose source, secrets or traversal targets',()=>{
 assert.equal(assetPath('/site/dist','/.kimi-data/session-secret'),null);
 assert.equal(assetPath('/site/dist','/%2e%2e/package.json'),null);
 assert.equal(assetPath('/site/dist','/a%5c..%5cb'),null);
 assert.equal(assetPath('/site/dist','/ai/index.html'),'/site/dist/ai/index.html');
});
test('reused AI APIs report missing key honestly and isolate learning progress',async()=>{
 const {handle}=await import('../../dist-server/api.mjs');const directory=await mkdtemp(path.join(os.tmpdir(),'cty-deploy-')),db=openDatabase(directory);
 const visitor={userId:'guest:one',fullName:'访客'},config={db};
 try{
  const status=await handle(new Request('https://cty.test/api/assistant'),visitor,config);assert.equal(status.status,200);assert.equal((await status.json()).configured,false);
  const request=(origin)=>new Request('https://cty.test/api/assistant',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({question:'写一首关于海港的诗'})});
  assert.equal((await handle(request('https://evil.test'),visitor,config)).status,403);
  assert.equal((await handle(request('https://cty.test'),visitor,config)).status,503);
  await db.prepare('INSERT INTO workshop_progress VALUES (?, ?, ?, ?)').bind('guest:one',123,'{}',1).run();
  const get=id=>handle(new Request('https://cty.test/api/workshop-progress'),{userId:id,fullName:'访客'},config);
  assert.equal((await (await get('guest:one')).json()).completedAt,123);
  assert.equal((await (await get('guest:two')).json()).completedAt,null);
 }finally{db.close();await rm(directory,{recursive:true,force:true})}
});
