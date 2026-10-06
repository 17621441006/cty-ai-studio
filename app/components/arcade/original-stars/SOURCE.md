Catch Stars local adaptation

Source retrieved from the user-specified original portfolio on 2026-10-04:
https://zpeterstudio.com/assets/v3-CvGhtCfI.js
https://zpeterstudio.com/fonts/fusion-pixel-12.woff2

Gameplay and the pixel scenery are retained locally. Added React lifecycle cleanup, local score key, pause freezing, window focus isolation, blur/minimize handling and scoped styling.

v29 replaces the original black cat with the existing orange Persian CTY character from `public/assets/cat-avatars.webp`, shared with the pixel music adventure. Its cropped portrait, alternating paws and draw/hit bounds are maintained in `lib/pixel-cat.ts`. The game's internal canvas uses 2× resolution to keep the face legible without changing its scenery's pixel grid. The original source file remains for its palette and provenance; its black-cat renderer is no longer called. No remote game page or runtime script is requested.
