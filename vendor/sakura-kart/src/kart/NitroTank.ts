/** Persistent drift energy. Simulation seconds make charge/drain frame-rate independent. */
export class NitroTank {
  energy = 0;
  active = false;
  reset() { this.energy = 0; this.active = false; }
  earn(effectiveDriftSeconds: number) {
    if (!this.active && Number.isFinite(effectiveDriftSeconds))
      this.energy = Math.min(1, this.energy + Math.max(0, effectiveDriftSeconds) * 0.18);
  }
  step(dt: number, held: boolean, eligible: boolean): boolean {
    if (!Number.isFinite(dt) || dt <= 0) { this.active = false; return false; }
    const threshold = this.active ? 0 : 0.08;
    this.active = held && eligible && this.energy > threshold;
    if (this.active) this.energy = Math.max(0, this.energy - dt * 0.25);
    return this.active;
  }
}
