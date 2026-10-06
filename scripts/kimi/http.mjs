import {createHmac,timingSafeEqual,randomUUID} from 'node:crypto';
import path from 'node:path';
export function session(cookie,secret){
 const value=(cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('cty_visitor='))?.slice(12)||'';
 const [id,signature]=value.split('.');
 const sign=id=>createHmac('sha256',secret).update(id).digest('hex');
 if(/^[a-f0-9-]{36}$/.test(id||'')&&/^[a-f0-9]{64}$/.test(signature||'')){
  const expected=sign(id);if(timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))return {id,value,fresh:false};
 }
 const next=randomUUID();return {id:next,value:next+'.'+sign(next),fresh:true};
}
export function assetPath(root,pathname){
 let decoded;try{decoded=decodeURIComponent(pathname)}catch{return null}
 if(decoded.includes('\\')||decoded.includes('\0')||decoded.split('/').some(s=>s==='..'||s.startsWith('.')))return null;
 const file=path.resolve(root,'.'+(decoded.startsWith('/')?decoded:'/'+decoded));
 return file===root||file.startsWith(root+path.sep)?file:null;
}
export function byteRange(header,size){
 if(!header)return null;const match=/^bytes=(\d*)-(\d*)$/.exec(header);
 if(!match||(!match[1]&&!match[2]))return false;
 const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
 const end=match[1]?(match[2]?Math.min(Number(match[2]),size-1):size-1):size-1;
 return Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&start>=0&&start<size&&end>=start?{start,end}:false;
}
