import type { IKart } from '../types';
import type { HazardLike, RacingLine } from './AI';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const PASS_CLEARANCE = 2.65;

/** Persistent passing corridor plus a separate longitudinal safety envelope.
 * All positions use track distance/lateral, including across the start line.
 * The small field is scanned directly; no paths or objects are allocated per tick.
 */
export class TrafficPlanner {
  active = false;
  lateral = 0;
  speedLimit = Infinity;
  clearForBoost = true;
  nearestAhead = Infinity;
  stoppedAhead = false;
  rearClear = true;
  passOpen = false;
  private rival: IKart | null = null;
  private side = 0;
  private held = 0;
  private blocked = 0;

  reset() {
    this.active = false; this.rival = null; this.side = 0;
    this.held = this.blocked = 0; this.lateral = 0;
    this.speedLimit = this.nearestAhead = Infinity; this.clearForBoost = true;
    this.stoppedAhead = false;
    this.rearClear = true; this.passOpen = false;
  }

  private gap(k: IKart, o: IKart, length: number) {
    let d = (o.t - k.t) * length;
    if (d > length * .5) d -= length;
    if (d < -length * .5) d += length;
    return d;
  }

  private lat(k: IKart, line: RacingLine) {
    return line.lateralOf(k.position.x, k.position.y, k.position.z, k.t);
  }

  private relevant(k: IKart, o: IKart) {
    return o !== k && Math.abs(o.position.y - k.position.y) < 2.2;
  }

  update(k: IKart, karts: readonly IKart[], hazards: readonly HazardLike[], line: RacingLine,
    dt: number, margin: number) {
    const d = k.t * line.length, lat = this.lat(k, line), speed = Math.max(0, k.forwardSpeed);
    const reach = clamp(16 + speed * .85, 24, 48);
    const i = line.index(d), j = line.index(d + reach);
    const limit = Math.max(.6, Math.min(line.half[i], line.half[j]) - margin);
    this.speedLimit = this.nearestAhead = Infinity; this.clearForBoost = true;
    this.stoppedAhead = false;
    this.rearClear = true; this.passOpen = false;
    this.held += dt;

    let nearest: IKart | null = null, nearestGap = Infinity;
    for (const o of karts) {
      if (!this.relevant(k, o)) continue;
      const gap = this.gap(k, o, line.length), side = Math.abs(this.lat(o, line) - lat);
      if (gap < 0 && gap > -25 && side < 2.4
        && (gap > -6 || gap + (o.forwardSpeed - k.forwardSpeed) * .9 > -5)) this.rearClear = false;
      if (gap < 0 || gap > reach) continue;
      const closing = speed - Math.max(0, o.forwardSpeed);
      if (side < 2.4) {
        this.nearestAhead = Math.min(this.nearestAhead, gap);
        if (gap < 14 && o.forwardSpeed < 2) this.stoppedAhead = true;
        // Opening a lane takes time. Do not spend nitro into the car ahead.
        if (gap < 10 + speed * .55 + Math.max(0, closing) * 1.2) this.clearForBoost = false;
        const catchRange = Math.max(12, 10 + Math.max(0, closing) * 2.2);
        if (gap < nearestGap && gap < catchRange && (closing > .8 || gap < 12)) { nearest = o; nearestGap = gap; }
      }
      // Once the nose points safely past a stationary obstacle, the road's
      // lateral coordinates alone overestimate the danger and crawl-lock the
      // car. Test the actual forward ray before continuing to limit speed.
      const dx = o.position.x - k.position.x, dz = o.position.z - k.position.z;
      const rayClearance = Math.abs(dx * k.forward.z - dz * k.forward.x);
      const passingStopped = o.forwardSpeed < 2 && rayClearance > 2.15;
      if (side < 2.05 && !passingStopped) {
        const desiredGap = 3.2 + speed * .12;
        const cap = Math.max(0, o.forwardSpeed) + (gap - desiredGap) * .95;
        this.speedLimit = Math.min(this.speedLimit, Math.max(0, cap));
      }
    }

    if (this.rival) {
      const gap = this.gap(k, this.rival, line.length);
      if (!this.relevant(k, this.rival) || !karts.includes(this.rival) || gap < -6 || gap > reach + 12
        || (gap > 24 && this.rival.forwardSpeed >= speed - .5)) {
        this.rival = null; this.side = 0; this.blocked = 0;
      }
    }
    if (nearest && (!this.rival || nearestGap < this.gap(k, this.rival, line.length) - 4)) {
      this.rival = nearest; this.held = 0; this.blocked = 0;
    }
    this.active = !!this.rival;
    if (!this.rival) return;

    const rivalLat = this.lat(this.rival, line), rivalGap = this.gap(k, this.rival, line.length);
    const neg = clamp(rivalLat - PASS_CLEARANCE, -limit, limit);
    const pos = clamp(rivalLat + PASS_CLEARANCE, -limit, limit);
    const negScore = this.candidateScore(neg, -1, rivalLat, rivalGap, lat, limit, k, karts, hazards, line);
    const posScore = this.candidateScore(pos, 1, rivalLat, rivalGap, lat, limit, k, karts, hazards, line);
    const currentScore = this.side < 0 ? negScore : posScore;
    const otherScore = this.side < 0 ? posScore : negScore;
    // Stay committed until fully alongside and clear. A blocked route can be
    // reconsidered after a short pause, never flipped by tiny lateral noise.
    if (currentScore >= 100) this.blocked += dt; else this.blocked = 0;
    if (!this.side || (this.blocked > .65 && this.held > 1.2 && otherScore + 30 < currentScore)) {
      this.side = negScore < posScore ? -1 : 1;
      this.held = this.blocked = 0;
    }
    const score = this.side < 0 ? negScore : posScore;
    this.passOpen = score < 100;
    if (score >= 100) {
      // Both routes occupied: leave space, wait for a gap, and retain our side.
      // Braking is independent of the lateral planner so a queue cannot become
      // a full-throttle shoving contest.
      this.lateral = clamp(lat, -limit, limit);
    } else {
      this.lateral = this.side < 0 ? neg : pos;
    }
    // Once established in the clear adjacent lane, boost may finish the pass.
    // The forward scan above still vetoes any car inside the boost corridor.
    if (Math.abs(this.lateral - lat) > .7) this.clearForBoost = false;
  }

  private candidateScore(target: number, side: number, rivalLat: number, rivalGap: number,
    ownLat: number, limit: number, k: IKart, karts: readonly IKart[], hazards: readonly HazardLike[], line: RacingLine) {
    if (Math.abs(target - rivalLat) < 2.3) return 1000;
    let score = Math.abs(target - ownLat) * 1.4 + Math.abs(target) * .15;
    // Stable tie-break: two similar drivers need not choose the same side.
    score += side === (k.id % 2 ? -1 : 1) ? 0 : .12;
    if (side !== this.side && this.side) score += 1.8;
    const horizon = clamp(Math.max(0, rivalGap) / Math.max(4, k.forwardSpeed - (this.rival?.forwardSpeed || 0)), .4, 1.5);
    for (const o of karts) {
      if (!this.relevant(k, o) || o === this.rival) continue;
      const gap = this.gap(k, o, line.length), olat = this.lat(o, line);
      const futureGap = gap + (o.forwardSpeed - k.forwardSpeed) * horizon;
      // Include a fast car approaching from behind; keep clear of its lane.
      if (gap < -12 || gap > Math.max(14, rivalGap + 9)) continue;
      const inLane = Math.abs(olat - target) < 2.3;
      const crosses = olat > Math.min(ownLat, target) - 1.9 && olat < Math.max(ownLat, target) + 1.9;
      if ((inLane && futureGap > -6 && futureGap < Math.max(10, rivalGap + 5)) || (crosses && Math.abs(gap) < 4)) score += 120;
    }
    const i = line.index(k.t * line.length);
    for (const h of hazards) {
      if (h.owner === k.id || Math.abs(h.y - k.position.y) > 3) continue;
      const dx = h.x - k.position.x, dz = h.z - k.position.z;
      const ahead = dx * k.forward.x + dz * k.forward.z;
      const sideAt = ownLat + dx * line.bx[i] + dz * line.bz[i];
      if (ahead > -2 && ahead < Math.max(15, rivalGap + 8) && Math.abs(sideAt - target) < h.r + 1.5) score += 140;
    }
    return score + Math.max(0, Math.abs(target) - limit + .5) * 2;
  }
}
