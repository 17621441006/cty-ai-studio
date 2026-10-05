export type FrameClock = ReturnType<typeof createFrameClock>;

/** A window keeps its simulation state while its scheduled work is asleep. */
export function createFrameClock(initiallyActive = true) {
  const jobs = new Map<number, FrameRequestCallback>();
  const listeners = new Set<() => void>();
  let next = 0, native = 0, active = initiallyActive, attached = false;
  let hidden = false, pausedAt = 0, pauseOffset = 0, lastFrame = -Infinity;
  const time = () => (pausedAt || performance.now()) - pauseOffset;
  const running = () => active && !hidden;
  function schedule() {
    if (!native && jobs.size && running()) native = window.requestAnimationFrame(flush);
  }
  function flush(now: number) {
    native = 0;
    if (!running()) return;
    // A 120/144 Hz display should not double the work of every desktop canvas.
    if (now - lastFrame < 1000 / 60 - .5) { schedule(); return; }
    lastFrame = now;
    for (const [id, callback] of [...jobs]) {
      if (!jobs.delete(id)) continue;
      try { callback(now - pauseOffset); }
      catch (error) { queueMicrotask(() => { throw error; }); }
    }
    schedule();
  }
  function sync(wasRunning: boolean) {
    if (wasRunning && !running()) {
      pausedAt = performance.now();
      if (native) window.cancelAnimationFrame(native);
      native = 0;
    } else if (!wasRunning && running()) {
      if (pausedAt) pauseOffset += performance.now() - pausedAt;
      pausedAt = 0;
      lastFrame = -Infinity;
      schedule();
    }
    listeners.forEach(listener => listener());
  }
  const visibility = () => { const before = running(); hidden = document.hidden; sync(before); };
  function attach() {
    if (attached || typeof document === 'undefined') return;
    attached = true;
    const before = running(); hidden = document.hidden;
    if (!running() && !pausedAt) pausedAt = performance.now();
    document.addEventListener('visibilitychange', visibility);
    sync(before);
  }
  return {
    requestFrame(callback: FrameRequestCallback) { attach(); const id = ++next; jobs.set(id, callback); schedule(); return id; },
    cancelFrame(id: number) { jobs.delete(id); if (!jobs.size && native) { window.cancelAnimationFrame(native); native = 0; } },
    setActive(value: boolean) { attach(); const before = running(); active = value; sync(before); },
    isActive: running,
    now: time,
    subscribe(listener: () => void) { attach(); listeners.add(listener); return () => { listeners.delete(listener); }; },
    dispose() { if (native) window.cancelAnimationFrame(native); native = 0; jobs.clear(); listeners.clear(); if (attached) document.removeEventListener('visibilitychange', visibility); attached = false; },
  };
}

let defaultClock: FrameClock | undefined;
export const getDefaultFrameClock = () => defaultClock ??= createFrameClock();
