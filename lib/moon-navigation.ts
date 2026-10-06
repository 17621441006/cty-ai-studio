import type {AppId} from './desktop-apps';

export type MoonNavigation = {screen: 'desktop' | 'moon' | 'work'; workIds: AppId[]};
export type MoonNavigationAction = {type: 'enter' | 'desktop' | 'return'} | {type: 'open' | 'forget'; id: AppId};
export const initialMoonNavigation: MoonNavigation = {screen: 'desktop', workIds: []};

export function moonNavigationReducer(state: MoonNavigation, action: MoonNavigationAction): MoonNavigation {
  if (action.type === 'desktop') return initialMoonNavigation;
  if (action.type === 'enter' || action.type === 'return') return {screen: 'moon', workIds: []};
  if (state.screen === 'desktop') return state;
  if (action.type === 'open') return {screen: 'work', workIds: [...state.workIds.filter(id => id !== action.id), action.id]};
  if (action.type === 'forget') return {...state, workIds: state.workIds.filter(id => id !== action.id)};
  return state;
}

// A delayed close of an older window must not interrupt a subsequently opened work.
export function returnsToMoon(state: MoonNavigation, id: AppId) {
  return state.screen === 'work' && state.workIds.at(-1) === id;
}
