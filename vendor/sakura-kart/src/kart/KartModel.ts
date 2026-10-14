/**
 * ============================================================================
 *  KartModel — the object the player stares at for the whole race.
 * ============================================================================
 *  V7 Sakura Open roadster: smooth road tyres, polished alloy, coral paint
 *  and low open bodywork with no rear arches obstructing the complete cat.
 *
 *  Original chunky Nintendo proportions: 0.36 m wheels against a 2.0 m body, an open
 *  tub with visible side rails, exposed wheels and a driver sitting proud of
 *  the bodywork. Nothing here is a box: every part is lofted through chamfered
 *  cross-sections so each edge carries a highlight.
 *
 *  Local frame (matches Kart.step): +Z forward, +Y up, +X is the kart's RIGHT.
 *  y = 0 is the ground contact plane, so the root can be dropped straight onto
 *  a surface probe.
 *
 *  --- what other systems can reach ------------------------------------------
 *  root.userData.body          Group  — physics animates roll / pitch / squash
 *  root.userData.driver        DriverRig — see Driver.ts for the pose API
 *  root.userData.exhausts      Object3D[2] — boost flame anchors, +Z points out
 *  root.userData.sparks        Object3D[2] — rear contact patches, drift sparks
 *  root.userData.wheelContacts Object3D[4] — FL, FR, RL, RR at ground level
 *  root.userData.livery        Livery — colours for HUD / minimap / particles
 *  root.userData.shadowBlob    Mesh — fake contact shadow, hide it if you own
 *                                     a better one
 *  root.userData.triangles     number
 *  Named children: 'body', 'driver', 'exhaustL/R', 'sparkL/R', 'wheelFL' ...
 *
 *  Wheels are returned FL, FR, RL, RR (front = +Z, and index 0/2 are the -X
 *  side, matching the ordering the physics placeholder shipped with). Each is
 *  a pivot with `rotation.order = 'YXZ'`, so physics can set `rotation.y` for
 *  steer and `rotation.x` for roll on the same object and get the right result.
 * ============================================================================
 */
import * as THREE from 'three';
import type { KartStats } from '../types';
import {
  Mesher, PANEL_SIZE, PANEL_UV, Role, WHEEL_UV, contactShadow, getLivery,
  impostorMaterial, kartMaterials, liveryGeometry, mat, shadowOnlyMaterial, syncKartEnv,
  type Built, type Livery, type Section,
} from './Liveries';
import { buildDriver, driverTriangles, DriverRig } from './Driver';

// --- hard dimensions ---------------------------------------------------------
const WHEEL_R = 0.36;
const WHEEL_HW = 0.15;
const TRACK_X = 0.72;     // half track width
const FRONT_Z = 0.72;
const REAR_Z = -0.74;

/**
 * Resample a control polyline through a Catmull-Rom so `addTube` sweeps a
 * continuous curve instead of mitring at every control point. A chrome tube
 * with faceted bends catches broken specular — the highlight jumps from facet
 * to facet instead of running along the bend — and chrome at roughness 0.15
 * needs *curvature* to have anything to reflect in the first place.
 *
 * Samples are placed at equal increments of (arc length + BEND_W x turning
 * angle), NOT at equal arc length. Equal spacing is the obvious thing and it is
 * the wrong thing: it spends the same number of samples on the roll hoop's
 * dead-straight uprights as on its shoulders, so the residual facet all piles
 * up in the two bends that are actually on the silhouette. Weighting by
 * curvature moves samples from where they buy nothing to where they buy
 * everything — on the hoop it takes the worst joint from 17.6 to 13.4 degrees
 * for exactly zero extra triangles, which is the same result as raising the
 * sample count from 22 to 30.
 */
const BEND_W = 0.5;
const _sa = new THREE.Vector3();
const _sb = new THREE.Vector3();

function smoothPath(pts: THREE.Vector3[], n: number): THREE.Vector3[] {
  const fineN = Math.max(64, (n - 1) * 8);
  const fine = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5).getSpacedPoints(fineN);
  // w[i] = cost of reaching fine[i]; strictly increasing, so it inverts cleanly
  const w = new Float64Array(fineN + 1);
  for (let i = 1; i <= fineN; i++) {
    let turn = 0;
    if (i < fineN) {
      _sa.subVectors(fine[i], fine[i - 1]).normalize();
      _sb.subVectors(fine[i + 1], fine[i]).normalize();
      turn = Math.acos(THREE.MathUtils.clamp(_sa.dot(_sb), -1, 1));
    }
    w[i] = w[i - 1] + fine[i].distanceTo(fine[i - 1]) + BEND_W * turn;
  }
  const out: THREE.Vector3[] = [fine[0].clone()];
  let k = 1;
  for (let s = 1; s < n - 1; s++) {
    const t = (s / (n - 1)) * w[fineN];
    while (k < fineN && w[k] < t) k++;
    const f = (t - w[k - 1]) / Math.max(1e-9, w[k] - w[k - 1]);
    out.push(new THREE.Vector3().lerpVectors(fine[k - 1], fine[k], f));
  }
  out.push(fine[fineN].clone());
  return out;
}

// ---------------------------------------------------------------------------
// Chassis — four merged buckets, one draw call each
// ---------------------------------------------------------------------------

interface ChassisGeo {
  paint: Built;
  decal: Built;
  chrome: Built;
  plastic: Built;
}
let _chassis: ChassisGeo | null = null;

function buildChassis(): ChassisGeo {
  if (_chassis) return _chassis;

  const P = new Mesher(); // painted bodywork
  const D = new Mesher(); // livery decal panels
  const C = new Mesher(); // chrome
  const M = new Mesher(); // matte plastic

  // --- floor pan ----------------------------------------------------------
  // Deliberately on the MATTE mesher, not the painted one. It is the darkest
  // large surface on the kart and it sits nearly edge-on to the camera, which
  // is the worst possible case for a clearcoat: round 1 put it on the lacquer
  // and the whole skirt crawled with white per-pixel sparkle. Nothing under a
  // kart is polished anyway.
  M.addLoft(
    [
      { z: -0.86, hw: 0.44, hh: 0.045, y: 0.195, r: 0.03 },
      { z: -0.40, hw: 0.47, hh: 0.05, y: 0.195, r: 0.035 },
      { z: 0.20, hw: 0.46, hh: 0.05, y: 0.20, r: 0.035 },
      { z: 0.62, hw: 0.42, hh: 0.048, y: 0.205, r: 0.03 },
      { z: 0.96, hw: 0.30, hh: 0.042, y: 0.215, r: 0.028 },
    ],
    Role.Shadowed,
    undefined,
    { corner: 1, capStart: 0.03, capEnd: 0.03, capSeg: 1 },
  );

  // --- Sakura Open: low sculpted sills, clear of the cat's chest and paws ---
  for (const side of [-1, 1]) {
    P.addLoft([
      { z: -.78, hw: .064, hh: .064, y: .287, r: .040 },
      { z: -.48, hw: .068, hh: .055, y: .280, r: .038 },
      { z: -.08, hw: .064, hh: .045, y: .264, r: .034 },
      { z: .32, hw: .060, hh: .050, y: .266, r: .035 },
      { z: .62, hw: .056, hh: .065, y: .280, r: .036 },
    ], Role.Base, mat(side * .437, 0, 0), { corner: 3, capStart: .04, capEnd: .04 });
    P.addLoft([
      { z: -.70, hw: .050, hh: .012, y: .352, r: .009 },
      { z: -.10, hw: .047, hh: .011, y: .308, r: .009 },
      { z: .52, hw: .044, hh: .011, y: .338, r: .009 },
    ], Role.Cream, mat(side * .437, 0, 0), { corner: 2, capStart: .015, capEnd: .015, capSeg: 1 });
  }

  // --- A low, wide split-tip bonnet, with no windscreen or dashboard wall ---
  P.addLoft([
    { z: .57, hw: .425, hh: .078, y: .272, r: .055, taper: -.12 },
    { z: .73, hw: .422, hh: .074, y: .272, r: .055, taper: -.14 },
    { z: .92, hw: .355, hh: .064, y: .268, r: .050, taper: -.20 },
    { z: 1.045, hw: .265, hh: .054, y: .264, r: .043, taper: -.22 },
  ], Role.Base, undefined, { corner: 3, capStart: .04, capEnd: .05 });
  // Recessed elongated cream lenses: authored contour lofts in the original mesh.
  for (const side of [-1, 1]) {
    P.addLoft([
      { z: .900, hw: .070, hh: .020, y: .327, r: .016 },
      { z: .985, hw: .059, hh: .017, y: .318, r: .014 },
    ], Role.Cream, mat(side * .244, 0, 0, 0, side * -.16, 0), { corner: 3, capStart: .025, capEnd: .028 });
  }

  // Low retro lamps match the cover's roadster. Profiled metal shells and
  // shallow convex lenses remain below the paws and clear of the tyre sweep.
  for(const side of[-1,1]) {
    const lamp=mat(side*.29,.465,.862,0,-Math.PI/2,0);
    C.addRevolve([
      -.027,0,.1, -.026,.036,.1, -.016,.055,.1,
      0,.063,.1, .014,.064,.1, .023,.059,.1, .019,.053,.1,
    ],32,Role.Steel,lamp);
    P.addRevolve([
      .020,.053,.1, .025,.043,.1, .029,.024,.1, .030,0,.1,
    ],32,Role.Cream,lamp);
    C.addTube([
      new THREE.Vector3(side*.285,.332,.816),
      new THREE.Vector3(side*.29,.385,.852),
      new THREE.Vector3(side*.29,.418,.862),
    ],.009,8,Role.Steel);
  }

  // --- side pods ----------------------------------------------------------
  for (const s of [-1, 1]) {
    // The flat run of the flank (between the corner radii) is exactly the
    // height of the livery panel that sits on it, and the tumblehome matches
    // the panel's tilt, so the decal lies flush instead of hovering.
    P.addLoft(
      [
        { z: -0.34, hw: 0.128, hh: 0.066, y: 0.268, r: 0.05, taper: -0.10 },
        { z: -0.10, hw: 0.145, hh: 0.074, y: 0.270, r: 0.05, taper: -0.10 },
        { z: 0.14, hw: 0.142, hh: 0.073, y: 0.270, r: 0.05, taper: -0.10 },
        { z: 0.32, hw: 0.118, hh: 0.062, y: 0.269, r: 0.05, taper: -0.12 },
      ],
      Role.Base,
      mat(s * 0.635, 0, 0),
      { corner: 2, capStart: 0.05, capEnd: 0.05 },
    );
    // pod intake mouth, recessed and dark so the pod reads as hollow
    M.addLoft(
      [
        { z: 0.0, hw: 0.055, hh: 0.038, y: 0.270, r: 0.03 },
        { z: 0.05, hw: 0.045, hh: 0.031, y: 0.270, r: 0.025 },
      ],
      Role.Plastic,
      mat(s * 0.635, 0, 0.30),
      { corner: 1, capStart: 0.02, capEnd: 0.02, capSeg: 1 },
    );
  }

  // --- rear engine block --------------------------------------------------
  P.addLoft(
    [
      { z: -0.94, hw: 0.30, hh: 0.100, y: 0.325, r: 0.075, taper: -0.1 },
      { z: -0.80, hw: 0.335, hh: 0.110, y: 0.330, r: 0.085, taper: -0.1 },
      { z: -0.62, hw: 0.325, hh: 0.105, y: 0.327, r: 0.08, taper: -0.12 },
    ],
    Role.Base,
    undefined,
    // shallow rear chamfer so the number plate has a flat face to sit on
    { corner: 2, capStart: 0.03, capEnd: 0.05 },
  );
  // cooling fins on top of the block
  for (let i = 0; i < 3; i++) {
    M.addLoft(
      [
        { z: -0.90, hw: 0.019, hh: 0.021, y: 0.449, r: 0.008 },
        { z: -0.66, hw: 0.019, hh: 0.025, y: 0.456, r: 0.008 },
      ],
      Role.Plastic,
      mat((i - 1) * 0.105, 0, 0),
      { corner: 1, capStart: 0.012, capEnd: 0.012, capSeg: 1 },
    );
  }
  // airbox scoop
  C.addLoft(
    [
      { z: -0.70, hw: 0.10, hh: 0.033, y: 0.484, r: 0.03 },
      { z: -0.56, hw: 0.115, hh: 0.035, y: 0.487, r: 0.035 },
    ],
    Role.Steel,
    undefined,
    { corner: 2, capStart: 0.03, capEnd: 0.035 },
  );

  // --- front bumper: a bowed bar, painted, with a chrome rub strip ---------
  const bumper = (hw: number, hh: number, y: number, role: number, mesher: Mesher, zOff: number, corner: number) => {
    const secs: Section[] = [];
    for (let i = 0; i <= 4; i++) {
      const u = (i / 4) * 2 - 1;
      secs.push({ z: u * 0.50, hw, hh, x: u * u * 0.075 + zOff, y, r: Math.min(hw, hh) * 0.8 });
    }
    // loft runs along local +Z; a quarter turn about Y sends it across the kart
    mesher.addLoft(secs, role, mat(0, 0, 1.03, 0, Math.PI / 2, 0), { corner, capStart: 0.05, capEnd: 0.05 });
  };
  bumper(0.085, 0.075, 0.30, Role.Base, P, 0, 3);
  // Rub strip, corner 3 and not 1, and 72 x 44 mm rather than 60 x 60.
  //
  // At corner 1 the ring is an octagon, and an octagon swept along a gentle bow
  // gives ONE flat facet aimed at the sky for the strip's whole 1 m length. A
  // flat facet on a metalness-1 / roughness-0.15 surface returns one env sample
  // over its entire area, so it clips to a single uniform white-blue bar with
  // no break in it anywhere — which is the closeup note verbatim, and it is a
  // geometry defect, not a roughness one. No roughness map can put a highlight
  // gradient on a surface whose normal never changes. corner 3 makes it a
  // 16-gon: the normal now turns continuously across the top, the reflection
  // sweeps through the env instead of sampling one point of it, and the bar
  // becomes a rolled highlight with a dark shoulder either side. 96 triangles.
  //
  // ROUND 7 — IT IS STILL A LIGHTSABER, AND THE REMAINING HALF IS THE SECTION.
  // corner 3 made the ring a 16-gon, but the ring was SQUARE (hw = hh = 0.030
  // with r = 0.8 x min = 0.024), which is a circle to within 6 mm. A circular
  // section swept along a bow has no preferred direction: every one of those 16
  // normals finds some part of the bright horizon band, so the "gradient" is a
  // gradient between two clipped values and the bar is uniform white over its
  // whole 1 m. 0.036 x 0.022 with r = 0.0176 is a flattened section: a narrow
  // crown that takes the sun, and shoulders that fall away fast enough to sit a
  // stop and a half darker. That is what makes a highlight read as a highlight —
  // it needs somewhere to stop. Same triangle count, and it is paired with the
  // chrome roughness and `ENV_TARGET.chrome` changes in Liveries; all three are
  // needed, none of them is sufficient.
  bumper(0.036, 0.022, 0.298, Role.Steel, C, -0.083, 3);
  // splitter under the bumper
  M.addLoft(
    [
      { z: -0.44, hw: 0.05, hh: 0.02, y: 0.185, r: 0.012 },
      { z: 0.44, hw: 0.05, hh: 0.02, y: 0.185, r: 0.012 },
    ],
    Role.Plastic,
    mat(0, 0, 0.98, 0, Math.PI / 2, 0),
    { corner: 1, capStart: 0.02, capEnd: 0.02, capSeg: 1 },
  );

  // Open roadster: deliberately no roll hoop, rear wing or high cross brace.
  // The original sculpted chassis, mechanical wheels and open engine remain.

  // --- exhaust stacks ------------------------------------------------------
  for (const s of [-1, 1]) {
    C.addTube(
      smoothPath([
        new THREE.Vector3(s * 0.17, 0.30, -0.82),
        new THREE.Vector3(s * 0.21, 0.35, -0.99),
        new THREE.Vector3(s * 0.235, 0.405, -1.09),
      ], 6),
      (t) => 0.046 + t * t * 0.018,
      // Held at 9. It was raised to 11 alongside the roll hoop and put the kart
      // 70 triangles over §5's 12 k ceiling; measured against the shots, the
      // stacks are 15-25 px across in every framing that shows them and the
      // review did not flag them. The hoop is 45 px at the closeup and WAS
      // flagged. When there is no budget left, the note wins and the guess does
      // not.
      9, Role.Steel,
    );
  }

  // --- seat, dash, column --------------------------------------------------
  M.addLoft(
    [
      { z: -0.40, hw: 0.215, hh: 0.045, y: 0.375, r: 0.03 },
      { z: -0.10, hw: 0.225, hh: 0.05, y: 0.365, r: 0.032 },
      { z: 0.06, hw: 0.205, hh: 0.045, y: 0.365, r: 0.03 },
    ],
    Role.Plastic,
    undefined,
    { corner: 1, capStart: 0.03, capEnd: 0.03, capSeg: 1 },
  );
  // backrest, raked back, with bolsters
  M.addLoft(
    [
      { z: 0.0, hw: 0.225, hh: 0.055, r: 0.04 },
      { z: 0.12, hw: 0.235, hh: 0.045, r: 0.032 },
      { z: 0.21, hw: 0.20, hh: 0.036, r: 0.027 },
    ],
    Role.Plastic,
    mat(0, 0.36, -0.40, -Math.PI / 2 + 0.30),
    { corner: 1, capStart: 0.045, capEnd: 0.05, capSeg: 1 },
  );
  for (const s of [-1, 1]) {
    M.addLoft(
      [
        { z: 0.06, hw: 0.045, hh: 0.075, r: 0.03 },
        { z: 0.17, hw: 0.046, hh: 0.050, r: 0.032 },
      ],
      Role.Plastic,
      mat(s * 0.225, 0.36, -0.40, -Math.PI / 2 + 0.30),
      { corner: 1, capStart: 0.03, capEnd: 0.03, capSeg: 1 },
    );
  }
  // Low footwell saddles meet the original short hind-paw soles at y=.311.
  // Their underside meets the floor pan, so opening the sills reveals no gap.
  for (const side of [-1, 1]) {
    M.addLoft([
      { z: -.035, hw: .066, hh: .030, y: .281, r: .024 },
      { z: .065, hw: .074, hh: .031, y: .280, r: .026 },
      { z: .150, hw: .064, hh: .028, y: .279, r: .023 },
    ], Role.Plastic, mat(side * .305, 0, 0), { corner: 2, capStart: .015, capEnd: .02, capSeg: 1 });
  }

  // No headrest: the furry back and ear silhouette stay fully exposed.

  // dash + column shroud + pedals
  M.addLoft(
    [
      { z: -0.24, hw: 0.06, hh: 0.041, y: 0.355, r: 0.035 },
      { z: 0.24, hw: 0.06, hh: 0.041, y: 0.355, r: 0.035 },
    ],
    Role.Plastic,
    mat(0, 0, 0.47, 0, Math.PI / 2, 0),
    { corner: 1, capStart: 0.04, capEnd: 0.04, capSeg: 1 },
  );
  C.addTube(
    [new THREE.Vector3(0, 0.38, 0.46), new THREE.Vector3(0, 0.66, 0.29)],
    0.028, 8, Role.Steel,
  );
  // Ignition ring on the dash. (4, 9) -> (3, 7): a 45 mm torus behind the
  // steering wheel, below the driver's forearms, at the one place on the kart
  // the chase camera never sees past the wheel boss. 30 triangles toward the
  // roll hoop.
  C.addGeometry(new THREE.TorusGeometry(0.045, 0.012, 3, 7), Role.Steel, mat(0.13, 0.403, 0.455, 0.35), 1.5);
  // (the pedal box that used to live here is fully enclosed by the nose and the
  // dash shroud — it never reached a pixel in any of the ten review shots, so
  // its 128 triangles now pay for the roll bar's continuous bends instead)

  // --- flush fuel filler; no elevated mirrors in the cat's silhouette ----
  C.addLoft([
    { z: 0, hw: .042, hh: .042, y: 0, r: .040 },
    { z: .018, hw: .040, hh: .040, y: 0, r: .038 },
  ], Role.Steel, mat(-.24, .455, -.69, Math.PI / 2), { corner: 2, capStart: .012, capEnd: .012, capSeg: 1 });

  // --- decal panels --------------------------------------------------------
  // pods: local +X must run toward the kart's nose on the left side so the
  // sponsor mark reads correctly from outside; the right-hand quadrant of the
  // atlas is drawn mirrored to compensate.
  // The extra rotation is applied on the RIGHT of the yaw so it happens in the
  // panel's own frame: it rakes the top edge inboard to follow the tumblehome.
  const [pw, ph] = PANEL_SIZE.pod;
  D.addPanel(pw, ph * .44, 0.006, PANEL_UV.podL,
    mat(-0.784, 0.270, -0.01, 0, -Math.PI / 2, 0).multiply(mat(0, 0, 0, -0.10, 0, 0)), Role.Base, 5);
  D.addPanel(pw, ph * .44, 0.006, PANEL_UV.podR,
    mat(0.784, 0.270, -0.01, 0, Math.PI / 2, 0).multiply(mat(0, 0, 0, -0.10, 0, 0)), Role.Base, 5);
  // nose deck: lies flat on the bonnet, raked with it, read by the chase camera
  const [nw, nh] = PANEL_SIZE.nose;
  D.addPanel(
    nw, nh, 0.012, PANEL_UV.nose,
    mat(0, 0.350, 0.77, 0.05, 0, 0).multiply(mat(0, 0, 0, 0, Math.PI, 0)).multiply(mat(0, 0, 0, -Math.PI / 2, 0, 0)),
    Role.Base, 6,
  );
  // tail number plate — the panel the player stares at all race
  const [tw, th] = PANEL_SIZE.tail;
  D.addPanel(tw, th * .70, 0.008, PANEL_UV.tail, mat(0, 0.343, -0.972, 0, Math.PI, 0), Role.Base, 5);

  _chassis = {
    paint: P.finish(), decal: D.finish(), chrome: C.finish(), plastic: M.finish(),
  };
  return _chassis;
}

// ---------------------------------------------------------------------------
// Wheel
// ---------------------------------------------------------------------------

let _wheel: Built | null = null;

/** Circular touring tyre: no block/scallop deformation of the silhouette. */
const TYRE_RAD = 40;

function buildWheel(): Built {
  if (_wheel) return _wheel;
  const W = new Mesher();
  // A softly crowned road carcass, with an actual rounded shoulder and sidewall.
  // Four fine longitudinal drainage channels live in the small texture below.
  W.addRevolve([
    -.126,.212,.305, -.142,.250,.365, -.148,.303,.455,
    -.140,.344,.545, -.114,.365,.600, -.074,.373,.670,
    0,.374,.800, .074,.373,.930, .114,.365,.999,
    .140,.344,.545, .148,.303,.455, .142,.250,.365, .126,.212,.305,
  ], TYRE_RAD, Role.Rubber);

  // Rolled polished outer lip and the recessed barrel, substantially larger
  // than the former small star hub. The axle and maximum wheel bounds stay put.
  W.addRevolve([
    -.110,.204,.205, .087,.204,.165,
    .120,.218,.105, .137,.217,.070, .141,.210,.052,
    .133,.202,.070, .113,.198,.112,
  ], 32, Role.Rim, undefined, .43,.02);
  // Inboard dust shield is dark graphite, not a bright featureless hub disc.
  W.addRevolve([-.118,0,.480, -.110,.190,.480],24,Role.Plastic);
  // Muted turquoise inner barrel inset; a narrow accent rather than a blue hub.
  W.addRevolve([
    .110,.198,.123, .115,.196,.123, .113,.181,.145, .092,.178,.159,
  ], 24, Role.Trim, undefined,.40,.02);

  // Five gently swept, bevelled alloy spokes. The long axis is radial and the
  // axial thickness is kept shallow, so the wheel reads as a real road rim.
  const spokes = W.mark();
  for (let i=0;i<5;i++) {
    const a=i/5*Math.PI*2+.12;
    W.addLoft([
      {z:.046,hw:.018,hh:.022,x:.011,r:.010},
      {z:.112,hw:.015,hh:.020,x:.006,r:.009},
      {z:.185,hw:.012,hh:.027,x:0,r:.010},
    ],Role.Rim,mat(.103,0,0,a,0,0),{corner:1,closeStart:false,capEnd:.010,capSeg:1});
  }
  W.remapUV(spokes,[.045,.068,.37,.016]);
  // Small rounded coral centre badge, with a polished collar.
  W.addRevolve([
    .112,.036,.078, .124,.037,.066, .134,.031,.056, .136,.025,.078,
  ],24,Role.Rim,undefined,.30,.02);
  W.addRevolve([
    .119,0,.271, .135,.012,.271, .137,.023,.271, .134,.027,.271,
  ],16,Role.Hub);
  // Full fine disc behind the spokes, never a six-sided metal sheet.
  W.addRevolve([
    -.047,.059,.190, -.047,.174,.220, -.037,.174,.220, -.037,.059,.190,
  ],24,Role.Disc,undefined,.43,.52);
  _wheel=W.finish();
  // Weld only duplicate normal values at the seam, keeping UVs and indices.
  const pos=_wheel.geo.getAttribute('position'),normal=_wheel.geo.getAttribute('normal');
  const groups=new Map<string,number[]>();
  for(let i=0;i<pos.count;i++) {
    const key=[pos.getX(i),pos.getY(i),pos.getZ(i),_wheel.roles[i]].map(v=>Math.round(v*1e6)).join(',');
    const group=groups.get(key)??[];group.push(i);groups.set(key,group);
  }
  const n=new THREE.Vector3();
  for(const group of groups.values())if(group.length>1){
    n.set(0,0,0);for(const i of group)n.add(new THREE.Vector3().fromBufferAttribute(normal,i));n.normalize();
    for(const i of group)normal.setXYZ(i,n.x,n.y,n.z);
  }
  return _wheel;
}

/** Lightweight standard PBR, generated once without canvas or external files. */
let _roadster: { wheel:THREE.MeshStandardMaterial; paint:THREE.MeshStandardMaterial;
  chrome:THREE.MeshStandardMaterial; decal:THREE.MeshStandardMaterial; steering:THREE.MeshStandardMaterial } | null = null;
const ROAD_CORAL=new THREE.Color('#ef7d8b');
const ROAD_TEAL=new THREE.Color('#78b5b1');
const ROAD_CREAM=new THREE.Color('#f6edde');
function roadsterMaterials() {
  if(_roadster)return _roadster;
  const size=256,albedo=new Uint8Array(size*size*4),orm=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
    const v=(y+.5)/size,u=(x+.5)/size,k=(y*size+x)*4;
    let rgb=[224,229,229],rough=.27,metal=.90;
    if(v>=.29){
      const grain=(Math.sin(x*2.71+y*.93)+Math.sin(x*.37-y*1.61))*.6;
      let tone=27+grain;rough=.72;metal=0;
      if(v>=.60){
        tone=31+grain;rough=.62;
        for(const center of[.668,.756,.844,.932]) {
          const d=Math.abs(v-center);
          if(d<.006){tone=15+grain;rough=.83;}
          else if(d<.009)tone=24+grain;
        }
      } else if(Math.abs(v-.338)<.004||Math.abs(v-.520)<.003)tone=22+grain;
      rgb=[tone,tone+1,tone+2];
    }else if(v>.255){rgb=[244,239,230];rough=.28;metal=.55;}
    else if(u>.51){rgb=[146,151,153];rough=.49;metal=.72;}
    for(let c=0;c<3;c++)albedo[k+c]=Math.round(rgb[c]);albedo[k+3]=255;
    orm[k]=255;orm[k+1]=Math.round(rough*255);orm[k+2]=Math.round(metal*255);orm[k+3]=255;
  }
  const texture=(data:Uint8Array,srgb=false)=>{
    const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);
    t.colorSpace=srgb?THREE.SRGBColorSpace:THREE.NoColorSpace;
    t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;
    t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;
  };
  const wheel=new THREE.MeshStandardMaterial({vertexColors:true,map:texture(albedo,true),roughnessMap:texture(orm),metalnessMap:null,roughness:1,metalness:1});
  wheel.metalnessMap=wheel.roughnessMap;wheel.name='Roadster_SmoothRoadRubber_ChromeAlloy';
  const paint=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.28,metalness:.24});paint.name='Roadster_CoralCeramic';
  const chrome=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.23,metalness:.9});chrome.name='Roadster_PolishedChrome';
  const steering=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.53,metalness:.12});steering.name='Roadster_SoftGrip';
  const decals=new Uint8Array(size*size*4);
  const rgb=(c:THREE.Color)=>c.clone().convertLinearToSRGB().toArray().map(v=>Math.round(v*255));
  const coral=rgb(ROAD_CORAL),teal=rgb(ROAD_TEAL),cream=rgb(ROAD_CREAM);
  const rect=(u:number,v:number,r:readonly[number,number,number,number])=>u>=r[0]&&u<=r[0]+r[2]&&v>=r[1]&&v<=r[1]+r[3];
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const u=(x+.5)/size,v=(y+.5)/size,k=(y*size+x)*4;let color=coral;
    if(rect(u,v,PANEL_UV.nose)){
      const a=(u-PANEL_UV.nose[0])/PANEL_UV.nose[2],b=(v-PANEL_UV.nose[1])/PANEL_UV.nose[3];
      const w=.29+.10*b;color=Math.abs(a-.5)<w?teal:Math.abs(a-.5)<w+.045?cream:coral;
    }else if(rect(u,v,PANEL_UV.tail)){
      const b=(v-PANEL_UV.tail[1])/PANEL_UV.tail[3];color=b>.37&&b<.62?cream:coral;
    }else for(const r of[PANEL_UV.podL,PANEL_UV.podR])if(rect(u,v,r)){
      const b=(v-r[1])/r[3];color=b>.42&&b<.63?cream:coral;
    }
    for(let c=0;c<3;c++)decals[k+c]=color[c];decals[k+3]=255;
  }
  const decal=new THREE.MeshStandardMaterial({map:texture(decals,true),roughness:.31,metalness:.20});decal.name='Roadster_CoralMintCoachwork';
  return _roadster={wheel,paint,chrome,decal,steering};
}

function roadsterGeometry(built:Built,l:Livery,body=false){
  const g=liveryGeometry(built,l),c=g.getAttribute('color'),white=new THREE.Color('#edf1ef'),rim=new THREE.Color('#e3e8e8');
  for(let i=0;i<built.roles.length;i++){
    const role=built.roles[i];let col:THREE.Color|undefined;
    if(body){if(role===Role.Base)col=ROAD_CORAL;else if(role===Role.Trim)col=ROAD_TEAL;else if(role===Role.Cream)col=ROAD_CREAM;}
    else {if(role===Role.Rim)col=rim;else if(role===Role.Trim)col=ROAD_TEAL;else if(role===Role.Hub)col=ROAD_CORAL;else col=white;}
    if(col)c.setXYZ(i,col.r,col.g,col.b);
  }
  return g;
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

const _perLivery = new Map<number, {
  paint: THREE.BufferGeometry;
  chrome: THREE.BufferGeometry;
  plastic: THREE.BufferGeometry;
  wheel: THREE.BufferGeometry;
  tris: number;
}>();

function liveryGeos(l: Livery) {
  let hit = _perLivery.get(l.index);
  if (hit) return hit;
  const ch = buildChassis();
  const wh = buildWheel();
  hit = {
    paint: liveryGeometry(ch.paint, l),
    chrome: liveryGeometry(ch.chrome, l),
    plastic: liveryGeometry(ch.plastic, l),
    wheel: roadsterGeometry(wh, l),
    tris: ch.paint.triangles + ch.decal.triangles + ch.chrome.triangles + ch.plastic.triangles
      + wh.triangles * 4 + driverTriangles(),
  };
  _perLivery.set(l.index, hit);
  return hit;
}

// ---------------------------------------------------------------------------
// Far LOD / shadow proxy
// ---------------------------------------------------------------------------

/** Parts the merged mesh must not swallow. */
const IMPOSTOR_SKIP = new Set(['shadowBlob']);

const _im = new THREE.Matrix3();
const _iv = new THREE.Vector3();
const _ic = new THREE.Color();
/** World matrix of the part (or instance) currently being baked. */
const _iw = new THREE.Matrix4();
/** Scratch for the per-frame tyre instance matrices. */
const _tw = new THREE.Matrix4();

/**
 * Downsampled, linear-space copy of a base-colour map, for baking into the
 * merged mesh's colour attribute.
 *
 * The wheel is the reason this exists. `C_RUBBER` is deliberately pure white —
 * "albedo comes from the wheel atlas" — so a merge that only reads the colour
 * attribute produces a kart on four cream doughnuts. The impostor carries no
 * maps (see `impostorMaterial`), so whatever the map was contributing has to
 * end up in the vertices instead.
 *
 * 64 px, not 1024: the browser's own downscale box-filters the whole atlas for
 * free, which is exactly what is wanted. Sampling the full-resolution tread at
 * a vertex is a coin toss between a groove and a block, and the merged mesh
 * would inherit that noise as per-vertex mottling. What it should inherit is
 * the average, because the average is all that survives at 20 m.
 */
const SAMPLE_RES = 64;
const _mapCache = new WeakMap<THREE.Texture, Float32Array | null>();

function mapSamples(t: THREE.Texture): Float32Array | null {
  const hit = _mapCache.get(t);
  if (hit !== undefined) return hit;
  let out: Float32Array | null = null;
  // V7 road-wheel/coachwork atlases are DataTextures. Reading their typed array
  // keeps the far LOD black and metallic without sending raw pixels to canvas.
  const raw=t.image as {data?:Uint8Array;width?:number;height?:number};
  if(raw?.data && raw.width && raw.height) {
    out=new Float32Array(SAMPLE_RES*SAMPLE_RES*3);
    const srgb=t.colorSpace===THREE.SRGBColorSpace;
    for(let y=0;y<SAMPLE_RES;y++)for(let x=0;x<SAMPLE_RES;x++) {
      const sx=Math.min(raw.width-1,Math.floor((x+.5)/SAMPLE_RES*raw.width));
      const sy=Math.min(raw.height-1,Math.floor((y+.5)/SAMPLE_RES*raw.height));
      for(let c=0;c<3;c++){
        const v=raw.data[(sy*raw.width+sx)*4+c]/255;
        out[(y*SAMPLE_RES+x)*3+c]=srgb?(v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)):v;
      }
    }
    _mapCache.set(t,out);return out;
  }
  try {
    const src = t.image as CanvasImageSource & { width?: number; height?: number };
    if (src && (src.width || 0) > 0) {
      const c = document.createElement('canvas');
      c.width = c.height = SAMPLE_RES;
      const g = c.getContext('2d', { willReadFrequently: true })!;
      g.drawImage(src, 0, 0, SAMPLE_RES, SAMPLE_RES);
      const d = g.getImageData(0, 0, SAMPLE_RES, SAMPLE_RES).data;
      const srgb = t.colorSpace === THREE.SRGBColorSpace;
      out = new Float32Array(SAMPLE_RES * SAMPLE_RES * 3);
      for (let i = 0, n = SAMPLE_RES * SAMPLE_RES; i < n; i++) {
        for (let k = 0; k < 3; k++) {
          const v = d[i * 4 + k] / 255;
          // Vertex colours are consumed in linear working space, so an sRGB
          // map has to be decoded here or the tyres come out two stops light.
          out[i * 3 + k] = srgb
            ? (v < 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
            : v;
        }
      }
    }
  } catch {
    // A cross-origin or not-yet-decoded image is not worth failing a build for;
    // the part just keeps its authored vertex colour.
    out = null;
  }
  _mapCache.set(t, out);
  return out;
}

/** Multiplies `out` by the map's colour at (u, v), honouring flipY/repeat. */
function sampleMap(s: Float32Array, t: THREE.Texture, u: number, v: number, out: THREE.Color) {
  let x = u * t.repeat.x + t.offset.x;
  let y = v * t.repeat.y + t.offset.y;
  // The upload flips the image when flipY is on, so an unflipped read has to
  // undo it. The wheel atlas is authored flipY off; the surface details are not.
  if (t.flipY) y = 1 - y;
  x -= Math.floor(x);
  y -= Math.floor(y);
  const ix = Math.min(SAMPLE_RES - 1, (x * SAMPLE_RES) | 0);
  const iy = Math.min(SAMPLE_RES - 1, (y * SAMPLE_RES) | 0);
  const i = (iy * SAMPLE_RES + ix) * 3;
  out.r *= s[i];
  out.g *= s[i + 1];
  out.b *= s[i + 2];
}

/**
 * Bakes every mesh hanging off a freshly built kart into one buffer, in the
 * root's frame and at rest pose.
 *
 * Rest pose is the whole approximation: the wheels are unsteered and unspun,
 * the body is unrolled and the driver is sitting up straight. That is exactly
 * as wrong as it sounds and exactly as invisible as it needs to be — this mesh
 * is only ever seen from 26 m (where a 4 degree body roll is a pixel) or as a
 * shadow caster under a sun 63 degrees up (where the kart's own shadow is a
 * short blob mostly hidden by the kart standing on it).
 *
 * The source geometries are shared per livery, so nothing here is mutated; the
 * merge reads them and writes a new buffer.
 */
function mergeToImpostor(root: THREE.Object3D): THREE.BufferGeometry | null {
  root.updateMatrixWorld(true);
  const pos: number[] = [];
  const nrm: number[] = [];
  const uv: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  let base = 0;

  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!(m as unknown as { isMesh?: boolean }).isMesh) return;
    if (IMPOSTOR_SKIP.has(m.name)) return;
    const g = m.geometry;
    const p = g.getAttribute('position') as THREE.BufferAttribute | undefined;
    if (!p) return;
    const n = g.getAttribute('normal') as THREE.BufferAttribute | undefined;
    const u = g.getAttribute('uv') as THREE.BufferAttribute | undefined;
    const c = g.getAttribute('color') as THREE.BufferAttribute | undefined;
    // The part's own base colour and base-colour map, folded into the vertices.
    // Both matter: the visor's whole albedo is `material.color` (it has no
    // colour attribute at all), and the tyre's is `material.map` (`C_RUBBER` is
    // pure white on purpose, because the atlas is supposed to supply it).
    const src = m.material as THREE.MeshStandardMaterial;
    const baseCol = src?.color;
    const baseMap = src?.map ?? null;
    const samples = baseMap ? mapSamples(baseMap) : null;

    // An InstancedMesh contributes once PER INSTANCE, each at its own matrix.
    // The four tyres are one instanced draw (see the wheel loop in `buildKart`),
    // and baking only the base geometry would put a single wheel at the kart's
    // origin — a far kart on one centre wheel, and a shadow to match, because
    // this bake is also the kart's only shadow caster.
    const inst = m as unknown as { isInstancedMesh?: boolean; count?: number;
      instanceMatrix?: THREE.InstancedBufferAttribute };
    const reps = inst.isInstancedMesh === true ? inst.count ?? 0 : 1;

    for (let r = 0; r < reps; r++) {
      if (inst.isInstancedMesh === true && inst.instanceMatrix) {
        _iw.fromArray(inst.instanceMatrix.array as ArrayLike<number>, r * 16);
        _iw.premultiply(m.matrixWorld);
      } else {
        _iw.copy(m.matrixWorld);
      }
      _im.getNormalMatrix(_iw);
      for (let i = 0; i < p.count; i++) {
        _iv.fromBufferAttribute(p, i).applyMatrix4(_iw);
        pos.push(_iv.x, _iv.y, _iv.z);
        if (n) {
          _iv.fromBufferAttribute(n, i).applyMatrix3(_im).normalize();
          nrm.push(_iv.x, _iv.y, _iv.z);
        } else nrm.push(0, 1, 0);
        const tu = u ? u.getX(i) : 0;
        const tv = u ? u.getY(i) : 0;
        uv.push(tu, tv);

        if (c) _ic.setRGB(c.getX(i), c.getY(i), c.getZ(i));
        else _ic.setRGB(1, 1, 1);
        if (baseCol) _ic.multiply(baseCol);
        if (samples && baseMap) sampleMap(samples, baseMap, tu, tv, _ic);
        col.push(_ic.r, _ic.g, _ic.b);
      }
      const index = g.getIndex();
      if (index) for (let i = 0; i < index.count; i++) idx.push(base + index.getX(i));
      else for (let i = 0; i < p.count; i++) idx.push(base + i);
      base += p.count;
    }
  });

  if (!base) return null;
  return clusterDecimate(pos, nrm, uv, col, idx);
}

/**
 * Cell edge for the impostor's vertex clustering, metres.
 *
 * THE BAKE WAS NOT A REDUCTION. Measured with tools/perf.mjs and
 * `__kartShadow.report()`, the merged mesh came out at 11 962 triangles against
 * 11 900 for the fifteen detail meshes it replaces — it collapsed fifteen draw
 * calls into one and left every triangle exactly where it was. So a kart at
 * 60 m, drawn as a single "far LOD", was rasterising a full-detail wheel tread
 * and a full-detail driver's hand, and so was the shadow pass, twice, for all
 * eight karts.
 *
 * Two things bound how coarse the cells may be, and 3 cm clears both:
 *
 *   - The near cascade is 4096 px across ~110 m, i.e. 2.69 cm per texel, so a
 *     3 cm cell moves a shadow silhouette by about one texel — inside the PCF
 *     kernel that is already blurring it.
 *   - `DrawBudget.LOD_SWAP` hands the camera this mesh at 20 m. A 62-degree
 *     lens sees 24.0 m of height there, so a 1.1 m kart is ~50 px at 1080p and
 *     one centimetre is 0.45 px: a 3 cm cell is 1.4 px of silhouette.
 *
 * Clustering merges by MEAN position rather than to the cell centre, which
 * matters for exactly that second bound — snapping to centres would put the
 * error at a full cell instead of half of one, and it quantises a smooth
 * revolve into visible steps.
 *
 * DO NOT RAISE THIS TO BUY TRIANGLES. The curve was swept in-page
 * (tools/tex-probe.mjs --label sweep), re-clustering the built impostor at six
 * cell sizes, and it is shallow because the kart is not over-tessellated for
 * these two uses in the first place — its mean triangle edge is already about
 * three centimetres:
 *
 *     cell    tris    vs the un-clustered 11 962
 *     3 cm    9 209        77%      <- here
 *     4 cm    7 811        65%
 *     5 cm    6 821        57%
 *     6 cm    6 326        53%
 *     8 cm    4 821        40%
 *    10 cm    3 637        30%
 *
 * Every rung past 3 cm is bought from the silhouette, and the silhouette is the
 * entire justification `DrawBudget` gives for swapping to this mesh at all. The
 * whole kart field is ~200k of a 3.2M-triangle frame, so the most an aggressive
 * setting could win is around 2% of the frame's triangles in exchange for
 * chunking the one thing the far LOD exists to preserve. Not a good trade.
 */
const IMPOSTOR_CELL = 0.030;

/**
 * Grid vertex clustering — the merge's actual reduction step.
 *
 * Vertices sharing a cell collapse to one, and any triangle left with two
 * corners in the same cluster is dropped. That is the whole algorithm; it is
 * chosen over anything smarter because it is O(n), allocation-light, runs once
 * at build time, and cannot fail in a way that produces a hole — collapsing a
 * cluster too eagerly loses a triangle, never opens one.
 *
 * The cluster key carries a coarse COLOUR bucket as well as the cell. The
 * impostor has no maps, so its whole albedo lives in the colour attribute, and
 * a purely spatial cell three centimetres across happily spans the tyre and the
 * rim, or the driver's glove and their sleeve. Averaging those gives a merged
 * mesh that is right in shape and muddy in colour — the one thing the far LOD
 * is supposed to preserve verbatim, because the livery is how a player tells
 * the field apart. Four levels per channel on a square-root ramp (these are
 * linear-space values, and a linear ramp puts almost every painted surface in
 * the bottom bucket) keeps those pairs apart and costs very little reduction.
 */
function clusterDecimate(
  pos: number[], nrm: number[], uv: number[], col: number[], idx: number[],
): THREE.BufferGeometry {
  const n = pos.length / 3;
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < n; i++) {
    const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }
  const inv = 1 / IMPOSTOR_CELL;
  // +1 so a vertex exactly on the max face gets its own cell rather than
  // indexing one past the end of the grid.
  const nx = Math.max(1, Math.floor((maxX - minX) * inv) + 1);
  const ny = Math.max(1, Math.floor((maxY - minY) * inv) + 1);

  /** 0..3 per channel on a sqrt ramp; see the colour note above. */
  const bucket = (c: number) => {
    const q = Math.sqrt(c < 0 ? 0 : c > 1 ? 1 : c) * 3.999;
    return q < 0 ? 0 : q > 3 ? 3 : q | 0;
  };

  // Cluster id per source vertex, and per-cluster running sums.
  const map = new Int32Array(n).fill(-1);
  const keys = new Map<number, number>();
  const cPos: number[] = [], cNrm: number[] = [], cUv: number[] = [], cCol: number[] = [];
  const cCount: number[] = [];
  for (let i = 0; i < n; i++) {
    const cx = Math.floor((pos[i * 3] - minX) * inv);
    const cy = Math.floor((pos[i * 3 + 1] - minY) * inv);
    const cz = Math.floor((pos[i * 3 + 2] - minZ) * inv);
    const cell = (cz * ny + cy) * nx + cx;
    const tint = (bucket(col[i * 3]) << 4) | (bucket(col[i * 3 + 1]) << 2) | bucket(col[i * 3 + 2]);
    const key = cell * 64 + tint;
    let c = keys.get(key);
    if (c === undefined) {
      c = cCount.length;
      keys.set(key, c);
      cPos.push(0, 0, 0); cNrm.push(0, 0, 0); cUv.push(0, 0); cCol.push(0, 0, 0);
      cCount.push(0);
    }
    map[i] = c;
    cCount[c]++;
    cPos[c * 3] += pos[i * 3]; cPos[c * 3 + 1] += pos[i * 3 + 1]; cPos[c * 3 + 2] += pos[i * 3 + 2];
    cNrm[c * 3] += nrm[i * 3]; cNrm[c * 3 + 1] += nrm[i * 3 + 1]; cNrm[c * 3 + 2] += nrm[i * 3 + 2];
    cUv[c * 2] += uv[i * 2]; cUv[c * 2 + 1] += uv[i * 2 + 1];
    cCol[c * 3] += col[i * 3]; cCol[c * 3 + 1] += col[i * 3 + 1]; cCol[c * 3 + 2] += col[i * 3 + 2];
  }

  const m = cCount.length;
  const oPos = new Float32Array(m * 3);
  const oNrm = new Float32Array(m * 3);
  const oUv = new Float32Array(m * 2);
  const oCol = new Float32Array(m * 3);
  for (let c = 0; c < m; c++) {
    const k = 1 / cCount[c];
    oPos[c * 3] = cPos[c * 3] * k;
    oPos[c * 3 + 1] = cPos[c * 3 + 1] * k;
    oPos[c * 3 + 2] = cPos[c * 3 + 2] * k;
    // A cluster that straddles both faces of a thin panel — a wing, the visor —
    // sums to nothing. Renormalising that gives NaN, and a single NaN normal is
    // enough for the whole draw to come out black on some drivers, so fall back
    // to straight up rather than trusting the average.
    let nxv = cNrm[c * 3], nyv = cNrm[c * 3 + 1], nzv = cNrm[c * 3 + 2];
    const len = Math.hypot(nxv, nyv, nzv);
    if (len > 1e-4) { nxv /= len; nyv /= len; nzv /= len; } else { nxv = 0; nyv = 1; nzv = 0; }
    oNrm[c * 3] = nxv; oNrm[c * 3 + 1] = nyv; oNrm[c * 3 + 2] = nzv;
    oUv[c * 2] = cUv[c * 2] * k; oUv[c * 2 + 1] = cUv[c * 2 + 1] * k;
    oCol[c * 3] = cCol[c * 3] * k;
    oCol[c * 3 + 1] = cCol[c * 3 + 1] * k;
    oCol[c * 3 + 2] = cCol[c * 3 + 2] * k;
  }

  const oIdx: number[] = [];
  for (let i = 0; i + 2 < idx.length; i += 3) {
    const a = map[idx[i]], b = map[idx[i + 1]], d = map[idx[i + 2]];
    if (a === b || b === d || a === d) continue;
    oIdx.push(a, b, d);
  }

  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(oPos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(oNrm, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(oUv, 2));
  out.setAttribute('color', new THREE.BufferAttribute(oCol, 3));
  out.setIndex(m > 65535 ? new THREE.Uint32BufferAttribute(oIdx, 1) : new THREE.Uint16BufferAttribute(oIdx, 1));
  out.computeBoundingSphere();
  // What the reduction actually was, so `__kartShadow.report()` can state it
  // rather than a harness having to rebuild the un-clustered mesh to find out.
  out.userData.mergedVerts = n;
  out.userData.mergedTris = idx.length / 3;
  return out;
}

// ---------------------------------------------------------------------------
// Shadow debugging
// ---------------------------------------------------------------------------

/**
 * Every kart built this session, so the capture harness can interrogate the
 * shadow path without reaching through Race into Kart into `visual`.
 *
 * Why this exists: a kart's ENTIRE contribution to both cascades is one mesh
 * (`kartImpostor`) — `buildKart` force-clears `castShadow` on all fifteen
 * detail meshes the moment the bake succeeds, and `DrawBudget` then owns that
 * mesh's `visible` and `castShadow` flags from `lateUpdate`. So there are four
 * independent ways for a kart to end up casting nothing at all, and from a
 * screenshot they are indistinguishable from each other and from "the cascade
 * never saw it". `__kartShadow.report()` separates them in one call, and
 * `detailShadows(true)` is the A/B: if the kart's shadow appears with the
 * detail meshes casting, the bake or its flags are at fault; if it still does
 * not, the caster was never the problem and the cascade is.
 */
const _built: THREE.Group[] = [];

export interface KartShadowDebug {
  /** Per kart: is it in the scene, is its impostor visible, is it casting. */
  report(): Array<Record<string, unknown>>;
  /** Hide the contact shadows, to judge the cascade's own shadow alone. */
  contact(on: boolean): void;
  /**
   * Put every detail mesh back in the shadow map. Costs ~15 extra shadow draws
   * per kart, so it is a diagnostic and never a shipping state.
   */
  detailShadows(on: boolean): void;
}

function kartShadowDebug(): KartShadowDebug {
  const live = () => _built.filter((r) => r.parent !== null);
  return {
    report: () => live().map((r) => {
      const imp = r.userData.impostor as THREE.Mesh | null;
      const blob = r.userData.shadowBlob as THREE.Mesh | undefined;
      const geo = imp?.geometry;
      if (geo && !geo.boundingSphere) geo.computeBoundingSphere();
      let casters = 0;
      r.traverse((o) => { if ((o as THREE.Mesh).isMesh && o.castShadow) casters++; });
      return {
        kart: r.name,
        worldY: r.getWorldPosition(_iv).y.toFixed(3),
        impostor: imp ? 'built' : 'MISSING',
        impostorVisible: imp?.visible ?? false,
        impostorCastShadow: imp?.castShadow ?? false,
        impostorRadius: geo?.boundingSphere?.radius.toFixed(3) ?? '-',
        impostorTris: geo?.getIndex() ? geo.getIndex()!.count / 3 : 0,
        // Before clustering, so the far LOD's reduction is readable in one call.
        // See IMPOSTOR_CELL: the bake used to be a draw-call reduction only.
        mergedTris: geo?.userData?.mergedTris ?? 0,
        impostorVerts: geo?.getAttribute('position')?.count ?? 0,
        mergedVerts: geo?.userData?.mergedVerts ?? 0,
        meshesCastingShadow: casters,
        contactShadowVisible: blob?.visible ?? false,
      };
    }),
    contact: (on: boolean) => {
      for (const r of live()) {
        const b = r.userData.shadowBlob as THREE.Mesh | undefined;
        if (b) b.visible = on;
      }
    },
    detailShadows: (on: boolean) => {
      for (const r of live()) {
        const imp = r.userData.impostor as THREE.Mesh | null;
        r.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh && m !== imp && m.name !== 'shadowBlob') m.castShadow = on;
        });
      }
    },
  };
}

/** Anchor whose +Z points along `dir` — VFX emits along an anchor's forward. */
function anchor(name: string, x: number, y: number, z: number, dir?: THREE.Vector3): THREE.Object3D {
  const o = new THREE.Object3D();
  o.name = name;
  o.position.set(x, y, z);
  if (dir) o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize());
  return o;
}

/**
 * @param hero  build the player's kart. Identical geometry; the bodywork gets
 *              the hot sun-side rim (see `heroPaint`) so the subject holds its
 *              silhouette against the tarmac at chase-camera size. Optional and
 *              defaulting to false, so existing callers are unaffected — Kart.ts
 *              should pass `isPlayer` here when it next changes.
 */
export function buildKart(
  stats: KartStats, hero = false,
): { root: THREE.Group; wheels: THREE.Object3D[] } {
  const livery = getLivery(stats);
  const mats = kartMaterials();
  const retro = roadsterMaterials();
  const paint = hero ? retro.paint : mats.paint;
  const geos = liveryGeos(livery);
  const chassis = buildChassis();

  const root = new THREE.Group();
  root.name = `kart_${livery.name}`;

  // Everything that rolls and pitches with the springs hangs off `body`; the
  // wheels stay on the root so physics can drive them per-corner.
  const body = new THREE.Group();
  body.name = 'body';
  root.add(body);

  const add = (geo: THREE.BufferGeometry, material: THREE.Material, name: string) => {
    const m = new THREE.Mesh(geo, material);
    m.name = name;
    m.castShadow = true;
    m.receiveShadow = true;
    body.add(m);
    return m;
  };
  // The kart's whole material set is authored against an absolute environment
  // response and then divided by whatever `scene.environmentIntensity` happens
  // to be (see ENV_TARGET in Liveries). Reading it here rather than hard-coding
  // the reciprocal means the karts stay correct if the sky is ever retuned —
  // and in round 1 the sky's 0.40 global is precisely what turned eight
  // clearcoated karts into eight matte clay toys. One float compare per frame.
  add(hero ? roadsterGeometry(chassis.paint,livery,true) : geos.paint, paint, 'bodyPaint').onBeforeRender = (_r, scene) => {
    syncKartEnv(scene.environmentIntensity);
    const env=Math.max(.05,scene.environmentIntensity);
    retro.wheel.envMapIntensity=.78/env;retro.paint.envMapIntensity=.92/env;retro.chrome.envMapIntensity=.9/env;retro.decal.envMapIntensity=.92/env;
  };
  add(chassis.decal.geo, hero ? retro.decal : livery.decalMat, 'bodyLivery');
  add(geos.chrome, hero ? retro.chrome : mats.chrome, 'bodyChrome');
  add(geos.plastic, mats.plastic, 'bodyPlastic');

  // --- driver -------------------------------------------------------------
  const driver: DriverRig = buildDriver(livery);
  if(hero)driver.root.traverse(o=>{
    const mesh=o as THREE.Mesh;
    if(!mesh.isMesh||mesh.name!=='steeringWheel')return;
    mesh.geometry=mesh.geometry.clone();const colors=mesh.geometry.getAttribute('color');
    if(colors)for(let i=0;i<colors.count;i++){
      const near=(c:THREE.Color)=>Math.abs(colors.getX(i)-c.r)+Math.abs(colors.getY(i)-c.g)+Math.abs(colors.getZ(i)-c.b)<1e-5;
      const color=near(livery.base)?ROAD_CORAL:near(livery.trim)?ROAD_TEAL:undefined;
      if(color)colors.setXYZ(i,color.r,color.g,color.b);
    }
    mesh.material=retro.steering;
  });
  driver.root.position.set(0, 0.42, -0.14);
  body.add(driver.root);

  // --- wheels: FL, FR, RL, RR (index 0/2 are the -X side) -----------------
  const wheels: THREE.Object3D[] = [];
  const wheelContacts: THREE.Object3D[] = [];
  /** Hub node per corner, holding the outboard flip. Posed into `tyres` below. */
  const hubs: THREE.Object3D[] = [];
  const layout: [number, number, string][] = [
    [-TRACK_X, FRONT_Z, 'FL'],
    [TRACK_X, FRONT_Z, 'FR'],
    [-TRACK_X, REAR_Z, 'RL'],
    [TRACK_X, REAR_Z, 'RR'],
  ];
  for (const [x, z, label] of layout) {
    const pivot = new THREE.Group();
    pivot.name = `wheel${label}`;
    // steer (Y) must be applied before spin (X) or the axle tilts
    pivot.rotation.order = 'YXZ';
    pivot.position.set(x, WHEEL_R, z);
    pivot.userData.side = Math.sign(x);
    pivot.userData.front = z > 0;
    pivot.userData.radius = WHEEL_R;
    pivot.userData.restY = WHEEL_R;

    const hub = new THREE.Group();
    hub.rotation.y = x > 0 ? 0 : Math.PI; // rim face always points outboard
    pivot.add(hub);
    root.add(pivot);
    wheels.push(pivot);
    hubs.push(hub);

    const contact = anchor(`contact${label}`, x, 0.01, z);
    root.add(contact);
    wheelContacts.push(contact);
  }

  // --- the four tyres, as one instanced draw -------------------------------
  // Same geometry, same material, four different matrices: the textbook case
  // for instancing, and it was costing four draw calls per near kart — 20 of
  // them in a mid-pack frame, out of a 250 budget.
  //
  // The corner nodes stay exactly as they were. `wheelFL`..`wheelRR` are what
  // the suspension steers, spins and lifts, and what the VFX hang off; all this
  // does is stop each of them carrying its own mesh and read their poses into
  // one instance buffer instead. Instance i is corner i, so `wheels[i]` and
  // instance i never disagree about which tyre is which.
  const tyres = new THREE.InstancedMesh(geos.wheel, retro.wheel, 4);
  tyres.name = 'tyres';
  tyres.castShadow = true;
  tyres.receiveShadow = true;
  tyres.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const poseTyres = () => {
    for (let i = 0; i < 4; i++) {
      const pivot = wheels[i];
      const hub = hubs[i];
      // Both are driven by physics every frame; three has already refreshed
      // them by render time, but updating here costs two compositions and
      // removes any dependence on that ordering.
      pivot.updateMatrix();
      hub.updateMatrix();
      _tw.multiplyMatrices(pivot.matrix, hub.matrix);
      tyres.setMatrixAt(i, _tw);
    }
    tyres.instanceMatrix.needsUpdate = true;
  };
  poseTyres();
  // Culled as one object. The bounds are computed from the rest pose and then
  // padded by the suspension's travel, because three caches an InstancedMesh's
  // bounding sphere and will not see the wheels move afterwards.
  tyres.computeBoundingSphere();
  if (tyres.boundingSphere) tyres.boundingSphere.radius += 0.35;
  // onBeforeRender also updates the contact shadow: it runs after physics poses
  // the corners for the frame being drawn.
  tyres.onBeforeRender = poseTyres;
  root.add(tyres);

  // --- effect anchors ------------------------------------------------------
  const exDir = new THREE.Vector3(0, 0.55, -0.84);
  const exhausts = [
    anchor('exhaustL', -0.235, 0.415, -1.12, exDir),
    anchor('exhaustR', 0.235, 0.415, -1.12, exDir),
  ];
  for (const e of exhausts) body.add(e);
  // Sparks come off the rear contact patches, just inboard of the tyre wall,
  // and live on the root so they stay pinned to the ground while the body
  // rolls. Separate objects from the contacts so physics and VFX can move
  // theirs independently.
  const sparks = [
    anchor('sparkL', -(TRACK_X - WHEEL_HW * 0.5), 0.05, REAR_Z),
    anchor('sparkR', TRACK_X - WHEEL_HW * 0.5, 0.05, REAR_Z),
  ];
  for (const s of sparks) root.add(s);

  // --- contact shadow ------------------------------------------------------
  // Shaped from the axle layout, so its four dark lobes land on the four
  // contact patches rather than smearing one oval over the whole footprint —
  // that is the contact AO §9.4 calls mandatory, and it is what stops the kart
  // reading as a sprite composited onto the road.
  //
  // The lobes are driven from the wheels every frame, which is what makes the
  // shadow move with the suspension rather than sit under the kart like a mat:
  // the loaded corner of a kart in a drift gets a small hard patch and the
  // unloaded one goes wide and faint. `onBeforeRender` is used for the same
  // reason as the tyre instances — it runs after physics has posed the wheels
  // for the frame being drawn.
  const contact = contactShadow({ trackX: TRACK_X, frontZ: FRONT_Z, rearZ: REAR_Z });
  const shadowBlob = contact.mesh;
  shadowBlob.name = 'shadowBlob';
  root.add(shadowBlob);
  shadowBlob.onBeforeRender = () => {
    for (let i = 0; i < 4; i++) contact.setWheel(i, wheels[i].position.y - WHEEL_R);
  };

  // --- far LOD / shadow proxy ----------------------------------------------
  // Built last, after every part is in place and posed, because it is just a
  // bake of the assembled model. See `mergeToImpostor`. The detail meshes stop
  // casting shadows at the same time: from here on this one mesh is the kart's
  // entire contribution to both cascades, near or far, and DrawBudget decides
  // per frame whether it is also what the camera sees.
  const impostorGeo = mergeToImpostor(root);
  let impostor: THREE.Mesh | null = null;
  if (impostorGeo) {
    impostor = new THREE.Mesh(impostorGeo, shadowOnlyMaterial());
    impostor.name = 'kartImpostor';
    impostor.castShadow = true;
    impostor.receiveShadow = true;
    // after the opaque queue, so the shadow-only pose is killed at early-Z
    impostor.renderOrder = 4;
    root.add(impostor);
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if ((m as unknown as { isMesh?: boolean }).isMesh && m !== impostor) m.castShadow = false;
    });
  }

  root.userData.impostor = impostor;
  root.userData.impostorMat = impostorMaterial();
  root.userData.shadowOnlyMat = shadowOnlyMaterial();
  /** everything DrawBudget hides when the kart collapses to its impostor */
  root.userData.detailNodes = [body, ...wheels, tyres];
  root.userData.body = body;
  root.userData.driver = driver;
  root.userData.exhausts = exhausts;
  root.userData.exhaustTips = exhausts;
  root.userData.sparks = sparks;
  root.userData.wheelContacts = wheelContacts;
  root.userData.wheels = wheels;
  root.userData.livery = livery;
  root.userData.shadowBlob = shadowBlob;
  root.userData.triangles = geos.tris;

  _built.push(root);
  (globalThis as unknown as { __kartShadow?: KartShadowDebug }).__kartShadow ??= kartShadowDebug();

  return { root, wheels };
}
