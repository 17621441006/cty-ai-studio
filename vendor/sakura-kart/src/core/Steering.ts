/** Manual driving: small taps nudge the car, sustained input still turns it. */
export function gentleSteer(input: number, speed: number, drifting = false): number {
  const axis = Math.max(-1, Math.min(1, Number.isFinite(input) ? input : 0));
  const pace = Math.max(0, Math.min(1, (Math.abs(speed) - 5) / 22));
  const lock = drifting ? 0.86 : 0.9 - 0.42 * pace;
  return Math.sign(axis) * Math.pow(Math.abs(axis), 1.12) * lock;
}
