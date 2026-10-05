# Batch 4 reconstruction

Original reference surfaces inspected in this session:

- https://zpeterstudio.com/apps/aquas/
- https://zpeterstudio.com/apps/jianfeng/
- https://zpeterstudio.com/?open=game
- https://zpeterstudio.com/?open=works
- https://zpeterstudio.com/?open=builds
- https://zpeterstudio.com/?open=hackathon
- https://sweetrove.com/

The account owner requested merging their other portfolio into CTY STUDIO with local runtime assets. Original titles, project covers, Sweetrove watercolor assets, 17 Summerhouse cover illustrations, 34 journal texts, and Hackathon factual records were retrieved from visible original pages. No source account identity is presented as a separate creator in the desktop UI. World map geography comes from the original Natural Earth / World Atlas based map.

## Scope

- Aquas: 23 positions, three regions, turn phases, resource/shop purchases, size and weight, swallowing/sinking, scores and termination. Reduced practice deck; fish-specific abilities, tools and shop refresh omitted, stated in rules. Four fish stats observed in the original plus three explicit size practice cards.
- Jianfeng: A–K, simultaneous choice, difference-based scoring, A/K exception, discard threshold and three heart identities. Full identity deck, campaigns and achievements omitted and stated in rules.
- Stars: original 30 second loop, gold +1 / silver +5 / hazard -3. Base-score practice; original combo multiplier was not verified and was not invented.
- Voxel: 69 modular buildings, dinosaur locomotion, automatic collision, tail sweep, stomp, collapsing debris. Browser core demonstration rather than full original physics.
- Snow: repeating winter street, bakery fronts, lamps and first-person stroll. Repeating street, not the full procedural network.
- Rain: six-customer local night-shift demo with stocking, heating and serving. Dialogue explicitly marked as rewritten for the reconstruction.
- Long Journey: 1–5 focus segments, reward journal, breaks, cottage placement. Desktop Godot systems beyond this core omitted. Screenshot background uses a CSS scenery crop to exclude the original fixed HUD.
- Hunger: training-room movement, bite, dash, enemies and three upgrade choices. Browser core demo, not the full roguelite.
- Terraria: deterministic feedback-loop simulation, explicitly disconnected from Terraria and from model APIs. Demo channel names are not asserted to be the original protocol.
- Sweetrove: 16 country directories, 108 watercolor cards, 34 original articles, three original routes, local passport. Full recipe histories and 63-shop database remain future migration work. Route information is labeled as the original dated snapshot.
- Builds: all 17 original pixel cover illustrations, not full videos.
- Hackathon: original five-round factual archive; no fabricated playable entries, no playoff champion. Original final cancellation preserved.
- Next AI product: remains awaiting content.

## Validation

TypeScript and production build; finite geometry and Canvas fallback for three new 3D scenes; dinosaur damage, repeating snow road, pause behavior, photo/disposal lifecycle; 169 card pairs and Aquas weight/source/scoring boundaries; all catalog image paths checked. Browser preview was blocked in this environment; no production URL was used to bypass that restriction.

# Batch 5 / 2026-10-04

- Sweetrove: matched all 108 existing dessert IDs to original detailed stories, ingredient lists and technique notes. Migrated 24 explicit dessert-specific quantified recipes and 63 original shop records (47 cities). The 84 remaining entries show ingredient/technique notes, not generated quantities. Original heuristic recipe drafts were deliberately not migrated as authored recipes. Added recipe ingredient/step checklists, passport completion, country/city/text shop filters, saved shop addresses and source links. Eight shops preserve their recorded verification date; other entries explicitly have no recorded date.
- Public original data sources: `https://sweetrove.com/assets/dessert-data-DJN8h5_V.js`, `https://sweetrove.com/assets/recipe-search-349SHacC.js`, `https://sweetrove.com/assets/pilot-trust-data-DEVm5L5J.js`. Retrieved 2026-10-04. Snapshot information is not a current opening-hours guarantee.
- Long Journey: versioned local save for task, timer deadline, rewards, journal, accumulated focus and furniture. Pause/resume and reopening preserve progress. An expired current segment awards once and waits for explicit start of the next segment. Thirty-second demonstrations do not inflate real focus minutes. Save export included; no server account synchronization claimed.

## Visual restoration and companion

- By explicit request, Matterhorn, Faroe and Three Worlds now embed their original high-detail scenes; Matterhorn is first in the 3D category. Original pages responded 200 without frame-blocking headers, and their published HTML contains parent-frame-aware layout. Real client embedding was not browser-tested in this environment. Loading indicator, reload and user-triggered fallback link remain available.
- Stillroom keeps local placement and all five rooms. New furniture geometry, draped bedding, shelves/books, window openings, curtains, rough plaster, linen and wood PBR maps. Nine 512 px CC0 texture maps total about 1.4 MiB, locally served. Source attribution/license details live in `public/works/worlds/materials/SOURCE_LICENSES.txt`.
- Cat carries a visual proxy behind itself with a rope. Only successful arrival swaps two existing desktop positions atomically; drag, sort, arrange or viewport changes cancel without changing layout.

Validation for this update: TypeScript; Journey pause/resume, one-segment offline completion, duplicate reward prevention and demo-duration exclusion; all dessert/shop joins and 24 recipe structures; Matterhorn category order; finite geometry and local texture availability for all five rooms; asynchronous texture propagation; cabinet light attachment; full-object floor bounds before and after dragging/rotation. Static geometry merging reduces room mesh counts to 93 / 101 / 103 / 99 / 113 while preserving separately draggable furniture. Browser preview remains policy-blocked; no alternate browser route was used and no rendered-frame/FPS claim is made.
