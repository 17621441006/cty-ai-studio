# V37 · 接星星开始 / 继续按钮与封面修复

The focused overlay button was removed while the round had already switched to `playing`. Its `focusout` with a null target could synchronously invoke auto-pause, including during Continue.

- Transfer focus to the persistent game root before changing state or removing the overlay button.
- Decide auto-pause after focus settles (microtask), using the actual active element within the whole game, including its footer. Dispose pending checks on unmount.
- Preserve intentional pause when focus really leaves the game, when the window is hidden or when the browser loses focus.
- Replace the substitute vector-cat cover with a light WebP rendered from the exact in-game `PIXEL_CAT_ATLAS` and `PIXEL_CAT_CROP`. No generated or redrawn replacement character. Cover path is versioned to refresh caches.

Checks: six DOM-event regression scenarios run against the actual game runtime with a small non-browser DOM harness (focused Start, touch-style click, repeated Continue, transient null focus, genuine focus exit, hide/dispose). Existing ten gameplay tests and TypeScript/build also pass. Browser and iPhone device verification remain unavailable in this environment.

`node --test scripts/qa/stars-interaction.mjs` uses Node 24 for the test-only TS import hook. The application deployment still builds normally; no Kimi deployment-layer changes or new runtime dependencies.
