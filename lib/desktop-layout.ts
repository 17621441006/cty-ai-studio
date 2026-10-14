import type {AppId} from './desktop-apps';

// Persist the order, never viewport-specific pixel coordinates. Adding an app,
// resizing, or a cat swap cannot leave two icons occupying the same slot.
export function completeDesktopOrder(order: unknown, ids: AppId[]): AppId[] {
  const allowed = new Set(ids);
  return [...new Set([...(Array.isArray(order) ? order.filter((id): id is AppId => allowed.has(id)) : []), ...ids])];
}
export function desktopGrid(count: number, width: number, height: number) {
  const rowsAvailable = Math.max(1, Math.floor((Math.max(580, height) - 110) / 86));
  const columns = width < 760 ? 2 : Math.min(Math.max(3, Math.ceil(count / rowsAvailable)), Math.floor((width - 50) / 116));
  const rows = Math.max(1, Math.ceil(count / columns));
  const spacing = Math.min(107, Math.floor((Math.max(580, height) - 110) / rows));
  return {columns, rows, spacing};
}
export function swapDesktopOrder(order: AppId[], first: AppId, second: AppId) {
  return order.map(id => id === first ? second : id === second ? first : id);
}
