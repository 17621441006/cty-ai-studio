# 脏脏包 · 樱花卡丁车 / 雨夜飞车 V7

The existing owner-private Site contains two independent game pages. `dist/index.html` opens the Sakura kart homepage at `dist/cartoon/index.html`; `dist/rain.html` retains the rain motorcycle mode, marked 测试中. Navigation unloads the previous page, so only one render loop runs.

## Rain mode

The original V1 architectural atlas, tall waterfront facades, deep blue night and warm lamps are restored. Damp asphalt keeps a restrained sheen with no planar mirror. The 800 m V2 course remains: two 180 m straights with eased broad turns. Stable full-body and driving cameras, manual/automatic driving, three-lap timing and phone controls remain.

The rider is an unclothed, round, fluffy cat based on the owner's original Meshy model. Head, chest and torso retain the original identity and fur. Short limbs are posed on the bike. The Night GT handlebars move inward/back and the footpegs are raised to fit the animal's proportions. This is a posed model, not a full walking or finger-IK rig.

## Cartoon mode

`cartoon/` contains the adapted source of the user's requested repository, https://github.com/CCCIRCCCLE715/chinese-can-fly-kart , main commit `8a89d81a21466c3a7d67ffefdf7d8eab30dce4e3`. Its actual Sakura town, kart physics, eight-racer field, three laps, drift, items and touch controls are retained. The player uses a whole cat model; changing karts transfers the cat. The imported SU7-with-human mesh is unused. Static mode links work on both pages.

The phone pairing service is not part of this static Site. Keyboard, touch and gamepad input are retained. Phone quality defaults to the upstream Low/adaptive settings; camera shake, rolling horizon, speed/boost FOV changes and motion blur are disabled.

Build cartoon source from its directory with `npm ci` then `npm run build`; Vite writes only `dist/cartoon/`. The rain mode is buildless. All runtime assets are served locally by the Site.

## Checks and sources

`node tools/verify-v3.mjs` checks main-mode GLB structure, local imports/assets, three-lap physics and full model projection across six aspect ratios and three camera views. Cartoon code is typechecked and built with TypeScript/Vite. Model contact, body seams and appearance are checked using offline mesh renders. These are not browser-rendering or actual phone interaction tests; the required Sites browser-control capability is unavailable.

Detailed attribution is in `dist/credits.html` and `dist/cartoon/UPSTREAM-NOTICE.md`. The upstream MIT license, Sakura MIT and asset-specific CC0 notices are retained. Cat source stays in `source-assets/`; model build scripts stay in `tools/assets/`. The Night GT is an original adaptation of kreems' CC BY 4.0 JAWA mechanics, not an official BMW asset.

## V4 performance and visibility revision

The cartoon player uses the Sakura Open low roadster and `zangzangbao-kart-v4.glb`. The face and body are retained; forepaws move to a lower rim. Source changes keep the existing track and wheelbase.

Desktop starts with the light Medium pipeline: one scene render, one tone/colour pass and one FXAA pass. No AO scene rerender, bloom pyramid or radial streaks. Medium has one 1024 shadow map. The road fragment uses four texture samples rather than 39, and only two gravel textures load instead of nine. Smoke uses four puffs per cloud on Low/Medium instead of ten, has near-camera fading, and retains collision records. This is an analytical reduction of work, not measured FPS.

`cd cartoon && node tools/run-v4-checks.mjs` validates steering precision/sign, smoke collisions/lifetime, post-pass construction and road shader composition. `python check-camera-bounds.py` checks the final cat against authored static/menu camera projection. Offline vehicle comparison images are under `tools/verification-images/v4/`. Browser rendering and the user's black-rectangle reproduction remain unverified because the required Sites control-browser capability is unavailable. The screenshot's rays match the removed grade effect, but the underlying black framebuffer region was not conclusively diagnosed.

The cartoon credits page is removed. Upstream and asset licenses are retained as source/distribution notices.

## V5 — clarity, cat silhouette and stored nitro

- Desktop Medium renders up to 2.1 MP and no longer overrides the CSS resolution floor. Dynamic scenery shadows are off on Medium; contact shadows remain. High retains scenery shadows. FXAA subpixel smoothing is reduced; the corner shows a live FPS sample.
- Unchanged town instance buffers no longer upload every frame. Tree billboard transforms reuse cached data; the physics boundary reuses its track sample.
- Rear wheel arches and supports removed. Original head/coat and paw anchors retained; the cat waist and lower torso are sculpted fuller in `zangzangbao-kart-v5.glb`. Chase camera pulls back from 5.6 m to 6.85 m, with more height.
- Shift + steering builds persistent drift energy. Hold X/N, gamepad right-stick click or the on-screen nitro button to spend it. There is no automatic player mini-turbo on releasing a drift; ordinary pads/items still work.
- Title has an automatic driving demo, with club-pace opponents and no forced lead-retaking. The driver uses the real track/physics/drift/energy/items and crossing-order ranking. The race HUD has a takeover/toggle button; deliberate driving input also takes over.
- `node tools/run-v5-checks.mjs <seed> <kart> <hz>` runs production CPU physics/race/item logic with native Canvas staging; only network-loaded cat/rocket visuals are substituted. Tests and `CAMERA-BOUNDS-CHECK.json` do not measure browser/GPU FPS.

## V7 — roadster, continuous coat, competition and stable rendering

- Smooth road tyres, fine longitudinal tread and silver alloy rims replace the chunky tread and bright blue hubs. No rear fenders. Coral/turquoise hero coachwork retains the original physics and wheelbase.
- V7 cat restores continuous source fur/UV across the neck, back and lower body. Weighted forearms track the steering-wheel rim while shoulders stay fixed. The cat remains unclothed. The podium sequence uses the matching coat. Conservative UV-preserving simplification retains119,718 rider triangles in4 draws (6.75MB Meshopt GLB); aggressive reductions were rejected after visible texture damage. Fur remains sculpted source geometry rather than a strand groom.
- Every selected kart starts eighth. Two nearby championship rivals use the real steering, collision and lap timing systems; the demo makes a late challenge for first.
- Four pickup types: persistent banana peel, homing lucky bell, five-second sakura shield and flying rocket. Peels lob to a bounded road location and stop; collisions consume them. A full pool never evicts an unhit peel.
- Only Low/Medium are offered. Old High/Ultra URLs are clamped to Medium. Buffer resizes and watchdog rebuilds are deferred until immediately before the next game/ceremony draw. A shared 256px baked blossom mask replaces expensive per-fragment trigonometry; existing tree LOD transitions move to32/80m Medium and28/70m Low. The FPS label counts actual submitted frames.
- Validation: `cd cartoon && node tools/run-v7-systems.mjs` checks real item effects,128-peel preservation,120-second persistence at14 road/throw cases, all selected grids, quality clamp and queued render changes. `node tools/run-v7-avatar.mjs` checks actual V7 GLB arms and wheel contact. `node tools/run-v7-championship.mjs` checks three full CPU races; `node tools/run-v7-ceremony.mjs` checks podium poses and lifecycle. Results accompany `tools/delivery-v7-checks.json`.
- Browser control is unavailable in this environment. CPU/geometry checks and builds do not establish the user's device FPS or prove every intermittent black flash is gone.
