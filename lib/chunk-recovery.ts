export function isChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk [\w-]+ failed|ChunkLoadError|error loading dynamically imported module/i.test(message);
}
export function reloadFreshOnce() {
  try {
    const now = Date.now(), last = Number(sessionStorage.getItem('cty-chunk-reload') || 0);
    if (now - last < 60000) return false;
    sessionStorage.setItem('cty-chunk-reload', String(now));
    const url = new URL(location.href);
    url.searchParams.set('_cty_refresh', String(now));
    location.replace(url.href);
    return true;
  } catch { return false; }
}
