'use client';
import {createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode} from 'react';
import {createFrameClock, getDefaultFrameClock, type FrameClock} from '@/lib/animation-clock';

const ClockContext = createContext<FrameClock | null>(null);
export function useAnimationClock() { return useContext(ClockContext) || getDefaultFrameClock(); }
export function useWindowVisible() {
  const clock = useAnimationClock(), [active, setActive] = useState(clock.isActive);
  useEffect(() => { const sync = () => setActive(clock.isActive()); sync(); return clock.subscribe(sync); }, [clock]);
  return active;
}
export function AnimationScope({active, children}: {active: boolean; children: ReactNode}) {
  const [clock] = useState(() => createFrameClock(active));
  useLayoutEffect(() => { clock.setActive(active); }, [clock, active]);
  useEffect(() => () => clock.dispose(), [clock]);
  return <ClockContext.Provider value={clock}>{children}</ClockContext.Provider>;
}

/** Timed previews sleep too; focus timers deliberately use wall-clock deadlines. */
export function useVisibleInterval(callback: () => void, delay: number | null) {
  const latest = useRef(callback), active = useWindowVisible(); latest.current = callback;
  useEffect(() => { if (!active || delay === null) return; const id = setInterval(() => latest.current(), delay); return () => clearInterval(id); }, [active, delay]);
}
