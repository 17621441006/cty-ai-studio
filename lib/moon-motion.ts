export function moonFrameTurn(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const angle = Math.PI * 2 * (.5 - Math.cos(p * Math.PI) / 2);
  // Lift the frame clear of the mosaic while its long edge turns inward.
  return {angle, lift: 1.18 * Math.abs(Math.sin(angle)) + .1 * Math.sin(p * Math.PI)};
}
