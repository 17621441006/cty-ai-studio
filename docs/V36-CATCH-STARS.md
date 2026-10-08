# V36 · 接星星 / Catch Stars

- Each round lasts 120 active seconds. Two-minute scores use `cty-stars-best-120`; the old 30-second record is left intact.
- The existing orange Persian portrait has separate head/body/paw animation, visible stride, directional lean and a trailing tail. Bomb hits temporarily tint the portrait with soot and show smoke.
- Gold stars retain combo bonuses. Flashing stars award 5 points and 5 seconds of invulnerability. Shields block all hazards for 5 seconds and appear above the cat.
- Blue blocks: −3 / 0.7s stun. Diagonal meteors: −10 / 2.8s stun. Parabolic bombs: −7 / 1.4s stun / 4s soot. Score cannot go below zero. Recovery grace prevents repeated stun-lock. New hazards have advance edge warnings.
- Mobile: drag anywhere within the game surface; relative movement avoids jumping to the initial touch. Pointer capture maintains control outside the canvas. No left/right button pad. Pointer cancellation clears input. Desktop keyboard and mouse control remain available.
- Pause/window hiding/browser background freezes gameplay and power durations. Background mosaic is cached. Canvas has a bounded resolution, bounded particles and small physics steps; HUD text updates only on state changes.
- A small self-contained SVG scene replaces the generic game cover. Catalogue and game hall share the cover.

Validation: `node --test scripts/qa/catch-stars.mjs` (10 tests); TypeScript and production build. Browser/device QA unavailable in this environment; actual iPhone touch feel should be checked after deployment.

No `scripts/kimi/` changes. Sync only the changed application, cover, documentation and QA files to both GitHub branches. Preserve the GitHub-only release workflow and all explicit `index.html` deployment routing.
