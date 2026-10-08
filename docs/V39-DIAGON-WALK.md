# V39 — 对角巷夜游

Replaces the playable `christmas-walk` entry with an original Three.js first-person Diagon Alley-inspired street. Keeps the existing work ID so desktop shortcuts, saved layouts, catalogue links and fuzzy search continue working. The former winter implementation remains in source for rollback; the new entry loads a separate scene only when opened.

## Experience

- Sixteen shops with curved projecting shop windows, recessed stock, arched upper windows, fanlight bars, slate roofs, dormers, chimney pots, guttering, gilded signs and street lamps.
- Named wand shop, bookseller, apothecary, robe shop and joke shop; a columned Gringotts-inspired bank terminates the street.
- Fixed 1.68 m eye height on a Catmull–Rom route, sampled by arc length, with two broad bends. No repeating street chunks, camera roll, head bob or automatic aerial orbit. The camera eases its heading through bends and stops at the plaza.
- Drag to look on touch or mouse, pause to look around, reset view, three walking speeds, route scrubber and five stops. Keyboard W/S moves along the route, A/D or arrows changes the view, Space pauses; Escape recentres the view. Route navigation follows the corridor, never cuts directly through buildings.
- Scene loading reports actual texture load completion and waits for a rendered frame. WebGL failure/context loss presents Retry instead of an empty canvas. Photo export is available.

## Assets and research

The model geometry is newly constructed here; textures are the existing local 512 px winter brick, plaster, cobble and paving sets. No paid Meshy account, private credit or external model file was accessed. No code or model was copied from the repositories below.

Resources examined:

- https://github.com/Lulzx/hogwarts — repository describes itself as a crawled mirror of another deployment; not selected as a reusable licensed asset source.
- https://github.com/theminhnguyen/hogwarts-3d — procedural fan-project reference; no source copied.
- https://github.com/zbovaird/harry-potter-philosophers-stone — GitHub API did not identify a license; no source copied.
- https://www.meshy.ai/3d-models/the-magical-pet-shop-01a0087b-9b45-77fb-812f-f3529ddce7a9 — CC0-labelled stylized shop candidate. Its miniature pet-shop subject did not fit this walk-through street, and it was not downloaded.
- https://sketchfab.com/3d-models/diagon-alley-v2-035d64d1a17a438ea6b9d29d32f1bdb8 — scanned 346k-triangle scene, CC BY-NC-SA; not downloaded or embedded.

The cover was rendered offline from this scene's actual geometry, local textures and entry camera using native EGL, with approximate lighting. It is not a photograph, generated concept illustration or browser screenshot.

## Performance and validation

- Approximately 249k triangles, 48 static material batches and 112 meshes including movable signs. Shared geometry during construction; merged geometry thereafter.
- Two nearby point lights, no point-light shadows; one 1024 px directional shadow map updated on asset completion rather than every frame. No post-processing passes or full-scene reflection buffers.
- 72 motes, a handful of emissive window materials and low-amplitude sign sway. Nearby lights ease to their new positions.
- Mobile pixel ratio capped at 1.25; automatic reduction to 1 on sustained slow frames. These are budgets, not measured device frame-rate claims.
- Uses the existing per-window animation clock, which sleeps when hidden/minimized. No 3D scene is constructed on the portfolio homepage before opening the work. No CDN, external iframe or new model download dependency.
- TypeScript, production build and `node --test scripts/qa/diagon-walk.mjs` validate route height, turn continuity, end clamping, frame-gap handling, geometry budget, local texture existence, ground normals and collision clearance along the actual scene route.
- Offline native geometry renders inspected at the gateway, two bends and bank. Browser preview/control tooling is unavailable in this environment; no claim of on-device Safari or live WebGL performance verification.

GitHub synchronization selectively updates business files. All `scripts/kimi/` deployment adapters and explicit `index.html` paths remain unchanged.
