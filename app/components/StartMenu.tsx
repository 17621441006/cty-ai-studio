'use client';
import {useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {Search,ChevronRight,ChevronLeft,FolderOpen} from 'lucide-react';
import {apps,catalogueApps,getApp,type AppId} from '@/lib/desktop-apps';
import {searchApps} from '@/lib/app-search';
import Icon from './DesktopIcon';
type Item={key:string;label:string;icon:number;app?:AppId;children?:Item[]};
type Props={order:AppId[];displayName:(id:AppId)=>string;open:(id:AppId)=>void;onClose:()=>void};
export default function StartMenu({order,displayName,open,onClose}:Props){
 const root=useRef<HTMLElement>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),[path,setPath]=useState<string[]>([]),[query,setQuery]=useState('');
 const items=useMemo(()=>{const item=(id:AppId):Item=>({key:id,label:displayName(id),icon:getApp(id).icon,app:id});const category=(name:string)=>catalogueApps.filter(a=>a.category===name).map(a=>item(a.id));
  return order.map(id=>{const entry=item(id);if(id==='works')entry.children=[...new Set(catalogueApps.map(a=>a.category))].map(name=>({key:name,label:name,icon:4,children:category(name)}));else if(getApp(id).collection)entry.children=category(getApp(id).collection!);else if(id==='zp-rooms')entry.children=['vinyl','ink','train','live','pixel'].map(room=>item(`zp-room-${room}`));return entry});
 },[order,displayName]);
 const first=items.find(i=>i.key===path[0]),second=first?.children?.find(i=>i.key===path[1]);
 const columns=[{title:'桌面',list:items,parent:undefined as Item|undefined},...(first?.children?[{title:first.label,list:first.children,parent:first}]:[]),...(second?.children?[{title:second.label,list:second.children,parent:second}]:[])];
 const results=query.trim()?searchApps(query,apps,displayName).map(a=>({key:a.id,label:displayName(a.id),icon:a.icon,app:a.id} as Item)):null;
 const cancel=()=>{if(timer.current){clearTimeout(timer.current);timer.current=null}};
 function reveal(item:Item,depth:number,focus=false){cancel();setPath(p=>[...p.slice(0,depth),...(item.children?[item.key]:[])]);if(focus&&item.children)requestAnimationFrame(()=>root.current?.querySelectorAll<HTMLElement>('.start-column')[depth+1]?.querySelector<HTMLButtonElement>('[data-entry]')?.focus())}
 useEffect(()=>{const close=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node)&&!(e.target as HTMLElement).closest('[data-start-toggle]'))onClose()};document.addEventListener('pointerdown',close);return()=>{document.removeEventListener('pointerdown',close);if(timer.current)clearTimeout(timer.current)}},[onClose]);
 function back(){cancel();setPath(p=>p.slice(0,-1));requestAnimationFrame(()=>root.current?.querySelectorAll<HTMLElement>('.start-column')[Math.max(0,columns.length-2)]?.querySelector<HTMLButtonElement>('[aria-expanded="true"]')?.focus())}
 return <section ref={root} className="cty-start-menu" aria-label="CTY-OS 分层开始菜单" data-depth={columns.length} onContextMenu={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();onClose();document.querySelector<HTMLButtonElement>('[data-start-toggle]')?.focus()}if(e.key==='ArrowLeft'&&path.length&&!(e.target instanceof HTMLInputElement)){e.preventDefault();back()}if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)&&!(e.target instanceof HTMLInputElement)){const col=(e.target as HTMLElement).closest('.start-column');if(!col)return;const buttons=Array.from(col.querySelectorAll<HTMLButtonElement>('[data-entry]')),current=buttons.indexOf(e.target as HTMLButtonElement);if(current<0)return;e.preventDefault();const index=e.key==='Home'?0:e.key==='End'?buttons.length-1:(current+(e.key==='ArrowDown'?1:buttons.length-1))%buttons.length;buttons[index]?.focus()}}}>
  <div className="cty-start-heading"><Icon n={0} small/><div><b>CTY—OS</b><span>创作，分门别类地收藏。</span></div><button aria-label="关闭开始菜单" onClick={onClose}>×</button></div>
  <label className="cty-start-search"><Search size={14}/><input autoFocus={typeof window!=='undefined'&&window.innerWidth>=760} placeholder="搜索全部作品…" aria-label="搜索全部作品" value={query} onChange={e=>{cancel();setQuery(e.target.value)}}/><kbd>ESC</kbd></label>
  {path.length>0&&!results&&<button className="start-mobile-back" onClick={back}><ChevronLeft size={14}/>返回 · {columns[columns.length-2].title}</button>}
  <div className="start-columns">
   {(results?[{title:`搜索结果 · ${results.length}`,list:results,parent:undefined}]:columns).map((column,depth)=><div key={column.title} className="start-column" role="group" aria-label={column.title}><header><span>{String(depth+1).padStart(2,'0')} / {column.title}</span>{column.parent?.app&&<button onClick={()=>open(column.parent!.app!)} title={`打开${column.title}`} aria-label={`打开${column.title}`}><FolderOpen size={15}/></button>}</header><div className="start-column-scroll">{column.list.map((item,i)=><button key={item.key} data-entry data-branch={!!item.children} style={{'--entry-delay':`${Math.min(i,9)*17}ms`} as CSSProperties} className={path[depth]===item.key?'branch-active':''} aria-expanded={item.children?path[depth]===item.key:undefined} onPointerEnter={e=>{if(e.pointerType==='mouse'&&!results){cancel();timer.current=setTimeout(()=>reveal(item,depth),140)}}} onPointerLeave={cancel} onClick={()=>item.children?reveal(item,depth,true):item.app&&open(item.app)} onKeyDown={e=>{if(e.key==='ArrowRight'&&item.children){e.preventDefault();reveal(item,depth,true)}}}><Icon n={item.icon} small/><span>{item.label}</span>{item.children&&<ChevronRight size={13}/>}</button>)}{column.list.length===0&&<p className="start-empty">没有找到这个作品。换个关键词试试。</p>}</div></div>)}
  </div>
  <footer><span>{results?'选择作品即可打开':'悬停逐层展开 · 点击文件夹右上角打开'}</span><small>{order.length} 个桌面入口</small></footer>
 </section>
}
