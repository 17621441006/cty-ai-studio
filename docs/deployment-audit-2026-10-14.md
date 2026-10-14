# CTY publication audit — 2026-10-14

- Sites versions 39, 40 and 41 all have succeeded production deployments. GitHub pushes and Kimi Release generation are separate from a Sites publication; neither publishes the other host.
- A production request for `/_next/static/chunks/MoonSpace-DWaO1FWm.js` returned 404 at 2026-10-14 08:10:50 UTC during the V41 deployment. That old chunk is absent from the new build. The moon gallery source, frame animation and navigation remained present.
- A new module error boundary and one-reload-per-minute recovery prevent a stale dynamic import from leaving the desktop unusable. Moon navigation is retained across the recovery. The moon caption also offers an explicit entry.
- Stored absolute icon coordinates were being mixed with the resized/default grid after adding applications. Preferences now store order and names only; dragging and cat swaps exchange occupied slots. Legacy names and order are retained.
- The standalone racer was present in a separate Site, source commit `b29db310f54d7168b716ff1c638f944e814b6443`, but absent from the portfolio catalogue and repository. It is now included locally as `zp-sakura-kart` in the game collection and shared moon catalogue.
- Kimi `scripts/kimi/` adapters are not changed. Every embedded entry is explicit `index.html`; the release still contains `dist/` at the same root.

Browser interaction testing was unavailable in this environment. Validation covers TypeScript, production builds, catalogue/navigation and layout math, local runtime assets and deployment status; it does not measure device FPS.
