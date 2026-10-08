// Logical playfield units. Art, power effects and collisions share this geometry.
export const STAR_CAT_SCALE = .74;
export const STAR_CAT_SIZE = {width: 24 * STAR_CAT_SCALE, height: 25 * STAR_CAT_SCALE};
export const STAR_SHIELD = {halfWidth: 10, radiusY: 4.5, centerHeight: 25};
export const starCatBounds = (x, feet) => ({x0: x - 10.5 * STAR_CAT_SCALE, x1: x + 10.5 * STAR_CAT_SCALE, y0: feet - 23 * STAR_CAT_SCALE, y1: feet});
export const starShieldBounds = (x, feet) => ({x0: x - STAR_SHIELD.halfWidth, x1: x + STAR_SHIELD.halfWidth, y0: feet - STAR_SHIELD.centerHeight - STAR_SHIELD.radiusY, y1: feet - STAR_SHIELD.centerHeight + STAR_SHIELD.radiusY});
