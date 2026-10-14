# Upstream notice — 脏脏包 · 樱花卡丁车

This static game mode adapts the exact repository requested by the user:
https://github.com/CCCIRCCCLE715/chinese-can-fly-kart

Imported main commit: `8a89d81a21466c3a7d67ffefdf7d8eab30dce4e3`.

The upstream repository credits Ryan Campbell / Kart Royale:
https://github.com/ryancampbell/kart-royale
Reference commit: `036c0efb025f5ecf8fc31c405e9d818c61e03e21`.

Source code license: MIT, Copyright (c) 2026 Ryan Campbell. The complete original notice is retained in LICENSE. This edition retains the actual kart physics, track, town, drift, items, AI, touch input and race systems.

## Modifications in this edition

- Title and menu adapted to 脏脏包 · 樱花卡丁车.
- Player's complete human torso, helmet, visor and arms are hidden and replaced by the owner's complete unclothed cat model; the original steering wheel is retained. Choosing another kart transfers the cat avatar to that kart. The player uses actual geometry for detail and shadows so the pre-existing human-driver bake cannot reappear.
- The existing detailed procedural kart is used. The upstream imported SU7 model is not instantiated in this edition because its human driver and cockpit share geometry.
- Static asset base is relative so this mode can live at `cartoon/` beside the rain mode. The cat is loaded from `../assets/zangzangbao-kart-v4.glb`.
- Local keyboard, gamepad and touch controls retained. LAN phone pairing UI/server integration removed from the frontend. No external analytics.
- Portrait rotation blocker removed; safe-area-aware mode links added.
- Stable camera: no screen shake, horizon roll, speed/boost lens pumping or automatic cinematic orbit. The title uses a fixed front three-quarter cat showcase; portrait uses a 60-degree vertical lens and a longer camera arm. Motion blur and depth of field disabled by default. Original handheld Low-quality and adaptive rendering budget retained.

## Scene and third-party material licenses

- 62 downloaded town assets: 3D Assets, CC0 1.0 Universal. The publisher describes these as AI-assisted geometry. Exact sources, license metadata and original download URLs are retained in `assets/japanese-town/catalog.json`; details in `assets/japanese-town/README.md`.
- Nine sakura growth forms: Leonxlnx / Sakura Realm, MIT, Copyright (c) 2026 Leonxlnx. Source https://github.com/Leonxlnx/sakura-realm at commit `4dd670e9ccbf7dba6a72462288fd8111021b3006`. Full notice: `assets/japanese-town/licenses/sakura-realm-MIT.txt`.
- Road PBR maps: Poly Haven, CC0 1.0 Universal. Gravel Stones by Amal Kumar; Gravel Ground 01 and Brown Mud Dry by Rob Tuytel. Optional Sandy Gravel by Charlotte Baglioni is retained from upstream. Exact files and checksums: `assets/road-surfaces/sources.json`; notice: `assets/road-surfaces/LICENSE.txt`.
- Kenney Starter Kit Racing notice: `maps/kenney/LICENSE-Starter-Kit-Racing.txt`.
- Three.js notice: `maps/kenney/LICENSE-Three.txt`.
- Upstream rocket, kart and audio files are retained as repository-provided assets. Upstream does not supply a separate CC0 notice for these files. We do not represent them as CC0. Source README records that kart and rocket were exported from project-provided assets; brands in those models do not imply endorsement.
- 脏脏包 cat mesh and texture are adapted from the user's own supplied model. They are not offered as part of the third-party CC0 asset sets.

Original README and source history remain in the source distribution. This is a static adaptation, not an official release or endorsement by any upstream creator or represented brand.

## V4 adaptation

- Authored low open roadster: lowered bonnet, side sills, seat, steering wheel and rear engine; no high roll hoop, headrest, wing or mirrors. Original lofted bodywork, wheel/suspension geometry and licenses retained.
- Only the cat forepaws/forelegs are lowered to the new rim. Face, head, chest, round body and coat data remain unchanged.
- Desktop now defaults to Medium with a light ACES/FXAA finish; AO, radial streaks, chromatic effects and grain are disabled. Road shader uses four texture reads. Item smoke has fewer puffs and fades near the camera; collision logic is retained.
- Gentler manual steering and desktop-appropriate controls. Credits page removed from navigation and output; all license files and this notice remain in the distribution.

## V5 adaptation

Rear wheel arches removed; original cat mesh resculpted through the waist without changing face/coat/paw contacts. Stored drift energy and manual nitro added, with optional automatic driving against club-pace opponents. CPU and draw-buffer updates reduced; default dynamic scenery shadows disabled while keeping contact shadows. Upstream and asset licenses remain in this distribution.

## V8 family race and garage

- Restored Xiaoyong and Xiaosi from the user's cozy-life-v0.16.html. Original faces, GAP clothing and skeletons retained; seam-preserving optimization, reduced maps and new seated / celebration poses. These personal models are not part of the CC0 asset collection.
- Podium cat uses the user's intact animated life-project cat, at uniform scale with native leap/play/idle motions. No forced upright reshaping or limb grafts.
- Three supplied vehicle derivatives add selectable appearances without changing race stats. Four wheels retain their source mesh and rotate at their measured radius.
- Racing Kart 125cc (low poly), by sceeth: https://sketchfab.com/3d-models/racing-kart-125cc-low-poly-556de8fb71fc4f6c96a2786d3b6552c0 — CC BY 4.0.
- Vinnie the Eagle - World Skills 2025, by David Robertson (RevanGT): https://sketchfab.com/3d-models/vinnie-the-eagle-world-skills-2025-f03ce3ff3db64ea2b82bb446d59d268e — CC BY 4.0; original eagle excluded.
- Both cars have normalized coordinates, separated wheel pivots, adapted seats and smaller texture maps. License: https://creativecommons.org/licenses/by/4.0/.
- The third vehicle is the owner-supplied Meshy kart, conservatively reduced from ~1M to ~40k triangles while retaining its original UVs. No public redistribution license is inferred.

Full V8 vehicle attribution: [ATTRIBUTION.txt](../assets/v8-vehicles/ATTRIBUTION.txt).
