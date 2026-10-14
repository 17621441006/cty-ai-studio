# Integrated Sakura racer

Source imported from the owner’s 脏脏包 · 雨夜飞车 Site, commit b29db310f54d7168b716ff1c638f944e814b6443 (V10). The latest Sakura mode is retained; the separate experimental rain mode remains in its original Site and is not part of this portfolio entry.

Runtime: `public/games/sakura/cartoon/index.html`. Shared avatar and vehicle models are in `public/games/sakura/assets`. All runtime files and license notices are checked in; no external Site is embedded or cloned at runtime. The portfolio only loads the game after opening its window.

Rebuild (Node 24): `npm ci --prefix vendor/sakura-kart`, then `npm run build --prefix vendor/sakura-kart`. Public assets are already checked in. Vite intentionally preserves those assets and writes the compiled game in place. Remove superseded index hash JS/CSS after a rebuild.

Integration changes: explicit index.html navigation; omit the experimental mode link; suspend simulation/audio via same-origin parent visibility messages; original music encoded as MP3 to reduce downloads. Controls, physics, cat, five vehicles and family opponents are retained. See LICENSE and UPSTREAM-NOTICE.md for the original source/asset notices.

Deployment budget: unused Kenney preview, unused SU7, old title art and unused road maps are excluded. All three music loops are MP3. The cover and rocket textures use WebP; rider/family/vehicle models and town assets are unchanged.
