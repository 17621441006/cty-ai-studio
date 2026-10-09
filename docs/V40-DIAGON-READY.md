# V40 — Reliable entry and a complete Diagon Alley street

## Loading repair

The V39 `LoadingManager` had no request deadline or retry. It treated errored images as completed and the render loop could throw repeatedly before hiding the loader. Shader/texture upload happened on the first visible frames. The user's specific device failure could not be reproduced here, so this change hardens those observed failure paths rather than claiming a verified device-specific root cause.

- A dedicated local asset manifest preloads and decodes all 12 unique texture images, with four concurrent requests, an 18-second per-attempt timeout and up to three attempts. HTTP errors, an HTML response, invalid images and request/decode stalls all fail explicitly.
- Closing/retrying aborts pending requests and preparation; an old request cannot reveal a disposed scene. No third-party host is contacted by the runtime.
- Preparation stages: image download/decode, complete geometry, GPU texture upload, asynchronous shader compilation (45-second safety deadline), shadow generation and two initial renders. The loader remains until all stages succeed.
- The ready screen then enables **进入对角巷**. Walking remains at the starting position until that button is clicked; all scene controls are disabled beforehand. Context loss, shader failure and runtime render errors show a retry screen.
- GPU upload is spread over preparation frames. The live tour still sleeps with its containing desktop window. Mobile rendering omits multisample antialiasing and caps pixel ratio at 1.25; slow-frame reduction to 1 remains. `preserveDrawingBuffer` is no longer used; photo export renders immediately before capture.

## Street and materials

- Six more shops (22 total) continue the final bend and both sides of the approach to Gringotts. Background wings are pulled in and given layered cornices, windows, roof ridges and chimneys.
- Added a side-passage sign, an old wall clock, low iron railings and stone urns. Corrected vertical scale multiplication for cauldrons, top-hat ornament and shrubs.
- Cobblestone Floor 09 by Charlotte Baglioni (Poly Haven, CC0) now supplies diffuse, OpenGL normal and roughness maps. Its 2.2 m scale is used on the street and the square, replacing the large stretched paving. Added individual kerbstone joints, drainage grates and subtle irregular wet patches.
- Recompressed existing CC0 brick/plaster/paving maps without changing other scenes. Total 12-map transfer: **1,316,602 bytes**, versus approximately 2.2 MB for the earlier textures. Floor maps are 1024 px; wall/pavement maps remain 512 px. Source URLs, original checksum verification and output SHA-256 values are in `public/works/worlds/materials/diagon-sources.json`.
- Transparent glow pools, glass and puddles no longer cast opaque shadows. Two nearby point lights remain the limit; one static 1024 px moon shadow, no reflection render targets or post-processing.
- Static sign materials are reused. Final geometry: 130 meshes, 340,807 triangles, 42 static material batches. Six new shops do not increase real-time light count.
- The catalogue cover is an offline native render of the actual updated geometry/materials, with approximate lighting, not a browser screenshot.

## Reference and verification

No new user reference image was attached to this turn. Used the official Warner Bros. set reference for close-set façades, bowed windows, cobbles and warm shop lighting:

- https://www.wbstudiotour.co.uk/the-experience/explore-the-tour/sets/diagon-alley/
- https://polyhaven.com/a/cobblestone_floor_09

`node --test scripts/qa/diagon-loading.mjs scripts/qa/diagon-walk.mjs` covers timeout/retry, persistent failure, cancellation, concurrency, full preparation order, GPU failure gating, route/camera continuity, 64-point collision clearance, street-end building enclosure and geometry budgets. TypeScript and the production build are also required before publication. Native geometry renders inspected at five route positions. Browser preview tooling is unavailable in this environment; actual iPhone Safari loading and frame rate remain unverified.

Business files are selectively synchronized to GitHub `main` and `kimi-deploy`. The existing Kimi build adapters and GitHub workflow are preserved.
