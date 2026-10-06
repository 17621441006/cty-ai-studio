import {catalogueApps, type AppId, type AppInfo} from './desktop-apps';
import thumbnails from '../app/components/catalogue-thumbnails.json';

export const MOON_RADIUS = 5;
export const EXHIBITS_PER_ORBIT = 18;
const optimized = thumbnails as Record<string, {thumb: string; preview: string}>;
export type MoonWork = AppInfo & {cover: string};
// One catalogue, one set of destinations. No iframe, game or model is loaded here.
export const moonWorks: MoonWork[] = catalogueApps
  .filter(work => work.id !== 'zp-next-ai')
  .map(work => ({...work, cover: optimized[work.image || '']?.thumb || work.image ||
    (work.id === 'zp-promo' ? '/works/benchmark/covers/opus-promo-cover.webp' : '/assets/scenery/cat-sitting.webp')}))
  .sort((a, b) => Number(b.id === 'zp-benchmark') - Number(a.id === 'zp-benchmark'));
export const moonCategories = ['全部', ...new Set(moonWorks.map(work => work.category))];
export function getMoonWorks(category: string) {
  return category === '全部' ? moonWorks : moonWorks.filter(work => work.category === category);
}
export function orbitWorks(works: MoonWork[], orbit: number) {
  const pages = Math.max(1, Math.ceil(works.length / EXHIBITS_PER_ORBIT));
  const page = Math.max(0, Math.min(pages - 1, orbit));
  return works.slice(page * EXHIBITS_PER_ORBIT, (page + 1) * EXHIBITS_PER_ORBIT);
}
export function moonFramePose(index: number, count: number) {
  const rows = Math.min(3, count), row = index % rows;
  const inRow = Math.ceil((count - row) / rows), column = Math.floor(index / rows);
  const latitude = rows === 1 ? 0 : [0, .77, -.77][row];
  const longitude = column * Math.PI * 2 / inRow + (row === 0 ? 0 : row === 1 ? .42 : -.42);
  const radius = MOON_RADIUS + .39;
  return {latitude, longitude, x: radius * Math.cos(latitude) * Math.sin(longitude),
    y: radius * Math.sin(latitude), z: radius * Math.cos(latitude) * Math.cos(longitude)};
}
export function moonCameraDistance(aspect: number) {
  const vertical = 42 * Math.PI / 360;
  const horizontal = Math.atan(Math.tan(vertical) * Math.max(.2, aspect));
  return 6.35 / Math.sin(Math.min(vertical, horizontal));
}
export function nearestAngle(from: number, target: number) {
  return from + Math.atan2(Math.sin(target - from), Math.cos(target - from));
}
export function moonWorkIndex(works: MoonWork[], id: AppId) { return Math.max(0, works.findIndex(work => work.id === id)); }
