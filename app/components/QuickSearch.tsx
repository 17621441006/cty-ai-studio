'use client';
import {searchApps} from '@/lib/app-search';
import {useEffect,useRef,useState} from 'react';
import {Search,CornerDownLeft,ChevronLeft,ChevronRight,Moon} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {apps,AppId} from '@/lib/desktop-apps';
import Icon from './DesktopIcon';
export default function QuickSearch({shown,onChange,open,displayName}:{shown:boolean;onChange:(shown:boolean)=>void;open:(id:AppId)=>void;displayName:(id:AppId)=>string}){
 const [query,setQuery]=useState(''),[selected,setSelected]=useState(0);const list=useRef<HTMLDivElement>(null);
 const popular:AppId[]=['works','zp-rooms','zp-focus','zp-gallery','music','minecraft','zp-arcade','terminal'];
 const hits=(query.trim()?searchApps(query,apps,displayName):popular.map(id=>apps.find(a=>a.id===id)!)).slice(0,16);
 useEffect(()=>{if(shown){setQuery('');setSelected(0)}},[shown]);useEffect(()=>{list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({block:'nearest'})},[selected]);
 function choose(id:AppId){onChange(false);open(id)}
 return <Dialog open={shown} onOpenChange={onChange}><DialogContent className="quick-search-dialog" showCloseButton={false}><DialogTitle className="sr-only">搜索桌面作品</DialogTitle><DialogDescription className="sr-only">搜索作品集中的应用，使用上下键选择，回车打开。</DialogDescription><label className="quick-search-field"><Search size={21}/><input autoFocus value={query} onChange={e=>{setQuery(e.target.value);setSelected(0)}} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setSelected(s=>Math.max(0,Math.min(hits.length-1,s+1)))}if(e.key==='ArrowUp'){e.preventDefault();setSelected(s=>Math.max(0,s-1))}if(e.key==='Enter'&&hits[selected]){e.preventDefault();choose(hits[selected].id)}}} aria-label="搜索桌面作品" aria-controls="quick-search-results" aria-activedescendant={hits[selected]?'result-'+hits[selected].id:undefined} placeholder="找作品、房间、游戏…"/><button onClick={()=>onChange(false)}>ESC</button></label><div className="quick-search-heading">{query?'搜索结果':'常用入口'}<span>{hits.length} 项</span></div><div className="quick-search-results" ref={list} role="listbox" id="quick-search-results" aria-label="搜索结果">{hits.map((a,i)=><button id={'result-'+a.id} role="option" aria-selected={selected===i} key={a.id} onMouseEnter={()=>setSelected(i)} onClick={()=>choose(a.id)}><Icon n={a.icon} small/><span><b>{displayName(a.id)}</b><small>{a.category}</small></span><CornerDownLeft size={16}/></button>)}{!hits.length&&<p className="quick-search-empty">没有找到。可以试试“音乐”“专注”或“3D”。</p>}</div><footer>↑ ↓ 选择 <span>Enter 打开</span><span>Ctrl / ⌘ K 搜索</span></footer></DialogContent></Dialog>
}
