'use client';
import {Component, useEffect, type ReactNode} from 'react';
import {isChunkError, reloadFreshOnce} from '@/lib/chunk-recovery';

export function DeploymentRecovery() {
  useEffect(() => {
    const preload = (event: Event) => {event.preventDefault(); reloadFreshOnce();};
    const rejected = (event: PromiseRejectionEvent) => {
      if (isChunkError(event.reason)) {event.preventDefault(); reloadFreshOnce();}
    };
    window.addEventListener('vite:preloadError', preload);
    window.addEventListener('unhandledrejection', rejected);
    return () => {window.removeEventListener('vite:preloadError', preload); window.removeEventListener('unhandledrejection', rejected);};
  }, []);
  return null;
}

export default class ModuleBoundary extends Component<{children: ReactNode; onClose?: () => void}, {error: Error | null}> {
  state = {error: null as Error | null};
  static getDerivedStateFromError(error: Error) {return {error};}
  componentDidCatch(error: Error) {if (isChunkError(error)) reloadFreshOnce();}
  render() {
    if (!this.state.error) return this.props.children;
    return <div className="module-recovery" role="alert"><span>CTY / RECONNECT</span><h2>这个窗口需要重新连接</h2><p>网站可能刚刚更新，或网络暂时中断。刷新后即可重新载入。</p><button onClick={() => location.reload()}>刷新并继续</button>{this.props.onClose && <button onClick={this.props.onClose}>返回桌面</button>}</div>;
  }
}
