'use client';
import {useCallback, useEffect, useMemo, useRef, useState, type CSSProperties} from 'react';
import {ChevronLeft, ChevronRight, ArrowUpRight, Pause, Play, List, X} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogTitle} from '@/components/ui/dialog';
import {EXHIBITS_PER_ORBIT, getMoonWorks, moonCategories, moonWorks, moonWorkIndex, orbitWorks} from '@/lib/moon-gallery';
import type {AppId} from '@/lib/desktop-apps';
import MoonGalleryScene, {type MoonGalleryHandle, type MoonGallerySnapshot} from './moon/MoonGalleryScene';

export default function MoonSpace({open, onChange, onOpen}: {open: boolean; onChange: (open: boolean) => void; onOpen: (id: AppId) => void}) {
  const [category, setCategory] = useState('全部'), [orbit, setOrbit] = useState(0);
  const [selected, setSelected] = useState<AppId>(moonWorks[0].id), [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false), [entered, setEntered] = useState(false), [fallback, setFallback] = useState(false), [list, setList] = useState(false);
  const memory = useRef<MoonGallerySnapshot | null>(null);
  const scene = useRef<MoonGalleryHandle>(null), closeButton = useRef<HTMLButtonElement>(null);
  const works = useMemo(() => getMoonWorks(category), [category]);
  const exhibits = useMemo(() => orbitWorks(works, orbit), [works, orbit]);
  const current = works.find(work => work.id === selected) || exhibits[0];
  const pages = Math.ceil(works.length / EXHIBITS_PER_ORBIT);
  const onReady = useCallback(() => setReady(true), []);
  const onFallback = useCallback(() => {setFallback(true); setReady(true);}, []);
  useEffect(() => {if (!ready) return; const timer = setTimeout(() => setEntered(true), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1900); return () => clearTimeout(timer);}, [ready]);
  function chooseCategory(value: string) {setCategory(value); setOrbit(0); setSelected(getMoonWorks(value)[0].id);}
  function focusWork(id: AppId) {
    const index = moonWorkIndex(works, id), page = Math.floor(index / EXHIBITS_PER_ORBIT);
    setSelected(id); setList(false);
    if (orbit !== page) setOrbit(page);
    else scene.current?.focus(id);
  }
  function step(delta: number) {const index = moonWorkIndex(works, current.id); focusWork(works[(index + delta + works.length) % works.length].id);}
  function nextOrbit() {const next = (orbit + 1) % pages; setOrbit(next); setSelected(works[next * EXHIBITS_PER_ORBIT].id);}
  function openWork(id: AppId) {setEntered(true); onOpen(id);}
  function activateWork(id: AppId) {if (fallback || !scene.current) openWork(id); else scene.current.activate(id);}
  return <Dialog open={open} onOpenChange={onChange}>
    <DialogContent placement="bottom" className={'moon-gallery ' + (entered ? 'moon-gallery-entered' : '')} showCloseButton={false} onContextMenu={event => {event.preventDefault(); event.stopPropagation();}}
      onOpenAutoFocus={event => {event.preventDefault(); closeButton.current?.focus();}}
      onKeyDown={event => {
        if (event.target instanceof HTMLInputElement || event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); event.currentTarget.querySelector<HTMLElement>('[data-moon-stage]')?.focus({preventScroll: true});}
        if (event.key === 'Enter' && event.target instanceof HTMLElement && event.target.dataset.moonStage) {event.preventDefault(); activateWork(current.id);}
      }}>
      <header className="moon-gallery-header">
        <div className="moon-gallery-title"><img src="/assets/scenery/moon.webp" alt="" width={46} height={46}/><div><DialogTitle>月面作品馆</DialogTitle><span>WORKS ON THE MOON</span></div></div>
        <button ref={closeButton} className="moon-return" onClick={() => onChange(false)}><ChevronLeft size={17}/>返回桌面 <kbd>Esc</kbd></button>
        <DialogDescription className="moon-gallery-description">拖动月球，自由漫游 · 点击金色相框，打开作品</DialogDescription>
      </header>
      <nav className="moon-categories" aria-label="月面作品分类">
        {moonCategories.map(value => <button key={value} aria-pressed={category === value} onClick={() => chooseCategory(value)}>{value}<span>{getMoonWorks(value).length}</span></button>)}
      </nav>
      <section className="moon-gallery-stage" data-moon-stage="true" tabIndex={0} aria-label="立体月面作品馆。拖动旋转；左右方向键选择作品，Enter 打开。">
        {!fallback && <MoonGalleryScene ref={scene} memory={memory} works={exhibits} selected={selected} paused={paused || list} onReady={onReady} onFallback={onFallback} onSelect={setSelected} onOpen={openWork}/>}
        <div className="moon-stage-corner" aria-hidden="true"><span>CTY / LUNAR ARCHIVE</span><i/>一颗月亮，收藏所有灵感。</div>
        {!ready && <div className="moon-scene-loading" role="status"><i/><span>正在点亮月面…</span></div>}
        {fallback && <div className="moon-fallback"><p>当前设备使用相册模式，作品仍可直接打开。</p><div>{works.map(work => <button key={work.id} onClick={() => openWork(work.id)}><img src={work.cover} alt="" loading="lazy"/><span>{work.name}</span></button>)}</div></div>}
        <div className="moon-stage-tools">
          {!fallback && <button onClick={() => setPaused(value => !value)} aria-label={paused ? '继续月球旋转' : '暂停月球旋转'} title={paused ? '继续旋转' : '暂停旋转'}>{paused ? <Play size={17}/> : <Pause size={17}/>}</button>}
          <button onClick={() => setList(value => !value)} aria-expanded={list} aria-label="浏览全部展牌" title="全部展牌"><List size={18}/></button>
          {pages > 1 && <button className="moon-orbit-next" onClick={nextOrbit} aria-label="切换下一组月面展牌">展区 {orbit + 1}/{pages}<ChevronRight size={15}/></button>}
        </div>
        {list && <aside className="moon-work-list" aria-label="全部展牌"><header><b>{category === '全部' ? '全部展牌' : category} · {works.length}</b><button onClick={() => setList(false)} aria-label="收起展牌列表"><X size={18}/></button></header><div>{works.map(work => <button key={work.id} aria-pressed={current.id === work.id} onClick={() => focusWork(work.id)}><img src={work.cover} alt="" loading="lazy"/><span>{work.name}<small>{work.category}</small></span><ChevronRight size={14}/></button>)}</div></aside>}
      </section>
      <footer className="moon-gallery-footer">
        <div className="moon-gallery-count"><i/>{works.length} 件作品<span> / {String(moonWorkIndex(works, current.id) + 1).padStart(2, '0')}</span></div>
        <div className="moon-current-work"><button className="moon-step" onClick={() => step(-1)} aria-label="上一件作品"><ChevronLeft size={20}/></button><button className="moon-open-work" onClick={() => activateWork(current.id)}><img src={current.cover} alt=""/><span><small>{current.category}</small><b>{current.name}</b></span><ArrowUpRight size={18}/></button><button className="moon-step" onClick={() => step(1)} aria-label="下一件作品"><ChevronRight size={20}/></button></div>
        <span className="moon-key-help">← → 换展牌 · Enter 打开</span>
      </footer>
      {!entered && <div className={'moon-entry ' + (ready ? 'is-ready' : '')} aria-hidden="true"><div className="moon-warp-stars">{Array.from({length:32}, (_, index) => <i key={index} style={{'--a': `${index * 137.5}deg`, '--d': `${80 + index % 7 * 37}px`, '--delay': `${index % 5 * 35}ms`} as CSSProperties}/>)}</div><img src="/assets/scenery/moon.webp" alt=""/><div className="moon-entry-copy"><span>CTY / MOON 01</span><b>穿过星光，抵达灵感。</b><small>{ready ? '欢迎来到月面作品馆' : '正在点亮月面…'}</small></div></div>}
    </DialogContent>
  </Dialog>;
}
