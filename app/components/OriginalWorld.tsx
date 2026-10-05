'use client';
import {useState} from 'react';
import {RotateCw,ExternalLink} from 'lucide-react';
import AppLoading from './AppLoading';
export const originalWorlds={
 'zp-matterhorn':{title:'马特洪峰',url:'https://zpeterstudio.com/apps/matterhorn/?view=riffelsee&t=9.5'},
 'zp-faroe':{title:'法罗群岛',url:'https://zpeterstudio.com/apps/faroe/?view=mulafossur'},
 'zp-three-worlds':{title:'三寸人间',url:'https://zpeterstudio.com/apps/three-worlds/'},
} as const;
export default function OriginalWorld({id}:{id:keyof typeof originalWorlds}){
 const world=originalWorlds[id],[revision,setRevision]=useState(0),[ready,setReady]=useState(false);
 const reload=()=>{setReady(false);setRevision(n=>n+1)};
 return <div className="original-world"><div className="original-world-stage"><iframe key={id+revision} src={world.url} title={world.title+'完整场景'} allow="fullscreen; autoplay; clipboard-write" allowFullScreen onLoad={()=>setReady(true)}/>{!ready&&<AppLoading key={id+revision} name={world.title} detail="正在载入精细场景与材质" elapsed onRetry={reload}/>}</div><footer><span>拖动环绕 · 滚轮缩放</span><div><button onClick={reload} aria-label="重新载入场景"><RotateCw size={13}/>重新载入</button><a href={world.url} target="_blank" rel="noreferrer"><ExternalLink size={13}/>画面未显示？打开场景</a></div></footer></div>
}
