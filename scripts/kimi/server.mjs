import {createServer} from 'node:http';
import {readFile,mkdir,writeFile,stat,realpath} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {openDatabase} from './database.mjs';
import {session,assetPath,byteRange} from './http.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url)),publicRoot=path.join(root,'dist');
const dataDir=path.resolve(process.env.DATA_DIR||path.join(root,'.kimi-data'));
await mkdir(dataDir,{recursive:true,mode:0o700});
let secret=process.env.SESSION_SECRET;
if(!secret){const file=path.join(dataDir,'session-secret');try{secret=await readFile(file,'utf8')}catch{secret=randomBytes(32).toString('hex');try{await writeFile(file,secret,{flag:'wx',mode:0o600})}catch(error){if(error.code!=='EEXIST')throw error;secret=await readFile(file,'utf8')}}}
const db=openDatabase(dataDir),{handle}=await import('../../dist-server/api.mjs');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.mp3':'audio/mpeg','.m4a':'audio/mp4','.mp4':'video/mp4','.ogg':'audio/ogg','.wav':'audio/wav','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.wasm':'application/wasm','.pdf':'application/pdf','.gz':'application/gzip'};
const ipCounts=new Map();
const server=createServer(async(req,res)=>{try{
 const origin=process.env.PUBLIC_ORIGIN||'http://'+req.headers.host,url=new URL(req.url||'/',origin);
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 if(url.pathname==='/healthz'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:true,cloudConfigured:!!process.env.OPENROUTER_API_KEY}));return}
 if(url.pathname.startsWith('/api/')){
  const now=Date.now(),ip=req.socket.remoteAddress||'local';for(const [key,value]of ipCounts)if(now-value.start>60000)ipCounts.delete(key);
  const count=ipCounts.get(ip)||{start:now,total:0};count.total++;ipCounts.set(ip,count);
  if(count.total>90){res.writeHead(429,{'Content-Type':'application/json','Retry-After':'60'});res.end(JSON.stringify({error:'请求过于频繁，请稍后再试。'}));return}
  const originHeader=req.headers.origin;
  if((originHeader&&originHeader!==new URL(origin).origin)||req.headers['sec-fetch-site']==='cross-site'){res.writeHead(403,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'请求来源不匹配。'}));return}
  if(!['GET','POST'].includes(req.method)){res.writeHead(405);res.end();return}
  let bytes=0;const chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>100000){res.writeHead(413);res.end();return}chunks.push(chunk)}
  const cookie=session(req.headers.cookie,secret);
  if(cookie.fresh)res.setHeader('Set-Cookie',`cty_visitor=${cookie.value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000${origin.startsWith('https:')?'; Secure':''}`);
  const controller=new AbortController();res.on('close',()=>{if(!res.writableEnded)controller.abort()});
  const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(value&&key!=='content-length')headers.set(key,Array.isArray(value)?value.join(','):value);
  const request=new Request(url,{method:req.method,headers,body:req.method==='POST'?Buffer.concat(chunks):undefined,signal:controller.signal});
  const response=await handle(request,{userId:'guest:'+cookie.id,fullName:'访客 '+cookie.id.slice(0,4)},{key:process.env.OPENROUTER_API_KEY,db});
  res.statusCode=response.status;response.headers.forEach((v,k)=>res.setHeader(k,v));
  if(response.body)await pipeline(Readable.fromWeb(response.body),res);else res.end();return;
 }
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return}
 let file=assetPath(publicRoot,url.pathname);if(!file){res.writeHead(400);res.end();return}
 let info;try{info=await stat(file);if(info.isDirectory()){file=path.join(file,'index.html');info=await stat(file)}const physical=await realpath(file);if(!physical.startsWith(publicRoot+path.sep))throw Error('Outside public root')}catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('页面或资源未找到');return}
 if(!info.isFile()){res.writeHead(404);res.end();return}
 const ext=path.extname(file).toLowerCase();res.setHeader('Content-Type',mime[ext]||'application/octet-stream');res.setHeader('Accept-Ranges','bytes');res.setHeader('Cache-Control',ext==='.html'?'no-cache':'public, max-age=3600');
 const range=byteRange(req.headers.range,info.size);if(range===false){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return}
 const length=range?range.end-range.start+1:info.size;res.setHeader('Content-Length',length);
 if(range){res.statusCode=206;res.setHeader('Content-Range',`bytes ${range.start}-${range.end}/${info.size}`)}
 if(req.method==='HEAD'){res.end();return}await pipeline(createReadStream(file,range||undefined),res);
 }catch(error){console.error('Request failed:',error.name);if(!res.headersSent)res.writeHead(500,{'Content-Type':'application/json'});if(!res.writableEnded)res.end(JSON.stringify({error:'服务暂时不可用，请稍后重试。'}))}});
const argument=(name)=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:undefined};
const port=Number(argument('--port')||process.env.PORT||3000),host=argument('--host')||process.env.HOST||'0.0.0.0';
server.listen(port,host,()=>console.log(`CTY portable server listening on ${host}:${port}; configure PUBLIC_ORIGIN and persistent DATA_DIR on the hosting platform.`));
function stop(){server.close(()=>{db.close();process.exit(0)})}process.on('SIGTERM',stop);process.on('SIGINT',stop);
