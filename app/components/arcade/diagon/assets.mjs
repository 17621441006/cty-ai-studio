// All images are served with the app; no third-party requests during the walk.
const root='/works/worlds/materials/';
export const DIAGON_MATERIALS=Object.fromEntries(['brick','plaster','paving','cobble'].map(name=>[name,{
 map:`${root}diagon_${name}_color.webp`,normalMap:`${root}diagon_${name}_normal.jpg`,roughnessMap:`${root}diagon_${name}_roughness.webp`
}]));
export const DIAGON_ASSETS=Object.values(DIAGON_MATERIALS).flatMap(m=>Object.values(m));
const aborted=()=>new DOMException('Loading cancelled','AbortError');

function sleep(ms,signal){return new Promise((resolve,reject)=>{
 if(signal.aborted){reject(aborted());return;}
 const stop=()=>{clearTimeout(timer);reject(aborted());};
 const timer=setTimeout(()=>{signal.removeEventListener('abort',stop);resolve();},ms);
 signal.addEventListener('abort',stop,{once:true});
});}

async function decodeImage(url,{signal}){
 const response=await fetch(url,{signal,cache:'default'});
 if(!response.ok||response.headers.get('content-type')?.includes('text/html'))throw new Error(`Texture unavailable: ${url} (${response.status})`);
 const objectURL=URL.createObjectURL(await response.blob()),image=new Image();image.decoding='async';
 const stop=()=>{image.src='';URL.revokeObjectURL(objectURL);};signal.addEventListener('abort',stop,{once:true});
 try{
  if(signal.aborted)throw aborted();
  image.src=objectURL;await image.decode();
  if(signal.aborted)throw aborted();
  if(!image.naturalWidth||!image.naturalHeight)throw new Error(`Empty texture: ${url}`);
  return image;
 }finally{signal.removeEventListener('abort',stop);URL.revokeObjectURL(objectURL);}
}

/** A stalled request, decode failure or 404 cannot leave the loading screen spinning forever. */
export async function loadWithRetry(url,{signal,request=decodeImage,timeoutMs=18000,attempts=3,retryDelayMs=500,onRetry=(_url,_attempt)=>{}}){
 for(let attempt=0;attempt<attempts;attempt++){
  if(signal.aborted)throw aborted();
  const controller=new AbortController();let timer;
  const stop=()=>controller.abort();signal.addEventListener('abort',stop,{once:true});
  let cancel;
  try{
   const deadline=new Promise((_,reject)=>{
    cancel=()=>reject(aborted());controller.signal.addEventListener('abort',cancel,{once:true});
    timer=setTimeout(()=>{reject(new Error(`Texture timed out: ${url}`));controller.abort();},timeoutMs);
   });
   return await Promise.race([request(url,{signal:controller.signal}),deadline]);
  }catch(error){
   if(signal.aborted)throw aborted();
   if(attempt===attempts-1)throw error;
   onRetry(url,attempt+1);
  }finally{clearTimeout(timer);controller.signal.removeEventListener('abort',cancel);signal.removeEventListener('abort',stop);controller.abort();}
  await sleep(retryDelayMs*(attempt+1),signal);
 }
}

export async function loadDiagonImages({signal,onProgress=(_done,_total)=>{},onRetry=(_url,_attempt)=>{},request=decodeImage,timeoutMs=18000,retryDelayMs=500,assets=DIAGON_ASSETS}){
 const controller=new AbortController(),images=new Map(),urls=[...new Set(assets)];let cursor=0,loaded=0;
 const stop=()=>controller.abort();signal.addEventListener('abort',stop,{once:true});
 if(signal.aborted)controller.abort();
 async function worker(){while(cursor<urls.length){
  const url=urls[cursor++];const image=await loadWithRetry(url,{signal:controller.signal,request,timeoutMs,retryDelayMs,onRetry});
  images.set(url,image);onProgress(++loaded,urls.length);
 }}
 try{await Promise.all(Array.from({length:Math.min(4,urls.length)},worker));return images;}
 catch(error){controller.abort();throw error;}
 finally{signal.removeEventListener('abort',stop);}
}

/** Reveal is deliberately last: decoded textures → complete geometry → GPU warm-up → first frame. */
export async function prepareDiagon({signal,load,build,warm,render,onStage=(_stage)=>{}}){
 const check=()=>{if(signal.aborted)throw aborted();};
 check();onStage('textures');const images=await load();check();
 onStage('geometry');const world=await build(images);check();
 onStage('lighting');await warm(world);check();
 onStage('frame');await render(world);check();onStage('ready');return world;
}
