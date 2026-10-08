# Catch Stars — character scale and moon shield

- Retained the original orange Persian atlas and face. Character art is now 74% of the previous size, with the feet anchored to the same floor.
- Replaced the square-ended angular tail with a rounded, curved tail. The tip follows the base with a phase lag; idle sway has a roughly 3.8-second cycle. Facing still mirrors the entire rig, including the tail and alternating paws.
- Replaced the blue canopy and stick with a compact floating gold buckler, ivory crescent inlay and brass edging. Pickup, impact colours and catalogue cover match the new shield.
- Renderer and collision model share `lib/star-cat-geometry.mjs`. Only hazards hit the overhead shield; stars pass through it to the character. The protective rim has its own hitbox. Five-second powers and 120-second rounds are unchanged.
- Added collision regression coverage for the reduced body and overhead rim. Existing Start/Continue focus and mobile drag regression checks remain intact.
- No new network dependency, 3D engine or model download in the game. The existing sprite atlas is reused; tail and shield use a bounded number of Canvas paths. The cover is WebP and loaded through the existing catalogue flow.

## Meshy materials researched

These are public candidates, not downloaded or incorporated assets. No private Meshy account, subscription credits or API key was used. The public model pages list CC0 at the time reviewed (2026-10-08); verify the downloaded asset's terms and geometry before incorporation.

- [Magical Shield — AvivPerets](https://www.meshy.ai/3d-models/019ac517-3228-7b69-85b6-7fcf82e6b981): candidate for a future 3D shield prop; this game's moon buckler is code-drawn, not that model.
- [Aegis Orb — Kaideus](https://www.meshy.ai/3d-models/019c8ddd-c82f-7a18-a593-3748cb221e96): candidate for magical desktop/3D effects. Evaluate silhouette, triangle count and texture size before using.
- [Meshy character animation guide](https://docs.meshy.ai/en/webapp/guides/animate): supports humanoid and quadruped rigging and FBX/GLB export. For any future animated 3D Zangzangbao, start from the approved cat reference, inspect the result, then export small sprite animations if the target remains this 2D game.

## Validation

`node --test scripts/qa/catch-stars.mjs scripts/qa/stars-interaction.mjs` covers gameplay, collision geometry and the actual runtime's DOM focus transitions. TypeScript and production build are checked separately. Native Canvas renders were inspected for idle, left/right movement, soot, shield, typical phone scale and the catalogue cover. This is not an on-device iOS Safari test.

GitHub updates are selective: no edits to the Kimi deployment adapter or its explicit `index.html` routes.
