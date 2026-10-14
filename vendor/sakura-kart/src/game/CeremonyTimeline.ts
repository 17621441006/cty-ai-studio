/** Deterministic choreography; replay and skipping never affect the race. */
export const CEREMONY_DURATION = 26;
export const PODIUM_HEIGHT = .46;
export const SIDE_PODIUM_X = 1.34;
export const ease = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
export function ceremonyPose(t: number) {
  const jump = ease(.65, 1.85, t);
  const air = Math.max(0, Math.min(1, (t - .65) / 1.2));
  const catchJump = ease(17, 18.3, t);
  const catchAir = Math.max(0, Math.min(1, (t - 17) / 1.3));
  const raised = ease(18.6, 20.4, t) * (1 - ease(21.7, 23.4, t));
  const carry = .71 * catchJump + .18 * raised;
  const shake = t >= 7.1 && t < 8.55 ? Math.sin((t - 7.1) * 30) : 0;
  return {
    x: -.45 * (1 - jump), z: 1.1 * (1 - jump),
    y: PODIUM_HEIGHT * jump + Math.sin(air * Math.PI) * .82 + carry + Math.sin(catchAir * Math.PI) * .16,
    shake, spraying: t >= 8.55 && t < 13.4,
    carry, raised, catchJump,
    label: t < 2.3 ? '冠军登场' : t < 6.4 ? '这一杯，属于脏脏包' : t < 8.55 ? '摇一摇，准备庆祝！' : t < 13.4 ? '为冠军干杯！' : t < 17 ? '小司、小涌，过来一起！' : t < 18.6 ? '准备好，接住这只小冠军' : t < 23.4 ? '一、二、三——举高高！' : '下一场，也要一起赢',
  };
}
/** The walk includes a small step up; feet finish entirely on the wide top. */
export function companionPose(t: number, side: -1 | 1) {
  const arrive = ease(13.8, 16.4, t), step = ease(13.9, 14.7, t);
  const stepAir = .045 * Math.sin(Math.PI * ease(14.25, 16.4, t));
  const cheer = ease(10.2, 10.55, t) * (1 - ease(11.9, 12.35, t));
  const walk = ease(13.6, 14, t) * (1 - ease(16, 16.6, t));
  const lift = ease(16, 16.9, t);
  const clap = (1 - ease(13.5, 14, t)) * ease(1.9, 2.4, t) * (1 - cheer);
  const idle = Math.max(0, 1 - clap - cheer - walk - lift);
  const sum = idle + clap + cheer + walk + lift;
  return {
    x: side * (SIDE_PODIUM_X * (1 - arrive) + .44 * arrive),
    y: (side < 0 ? .31 : .26) * (1 - step) + PODIUM_HEIGHT * step + stepAir,
    z: -.035 * arrive,
    yaw: -side * (.18 * (1 - arrive) + Math.PI / 2 * arrive),
    weights: { idle: idle / sum, clap: clap / sum, cheer: cheer / sum, walk: walk / sum, lift: lift / sum },
    contact: ease(17.7, 18.3, t),
  };
}
