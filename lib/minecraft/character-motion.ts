/** Physics inputs shared by the gameplay character and its articulated animation. */
export type CharacterMotion = {
  hitAge?: number;
  hitStrength?: number;
  hitDirection?: [number,number,number];
  weaponStage?: number;
  weaponAttacking?: boolean;
  weaponAttackAge?: number;
  weaponDrawn?: boolean;
  grounded?: boolean;
  grappling?: boolean;
  grappleEquipped?: boolean;
  grappleTarget?: [number,number,number];
  sasukeTechnique?: 'q'|'r'|'f'|'t'|'z'|'v';
  sasukeAge?: number;
  sasukeStage?: number;
  verticalSpeed?: number;
  speed?: number;
  turn?: number;
  swimming?: boolean;
  jumpCharge?: number;
  ability?: 'f' | 'j' | 'k';
  abilityAge?: number;
  technique?: 'q'|'r'|'f'|'t'|'z'|'v';
  techniqueAge?: number;
};

/** Two-bone sagittal IK. The knee bends backwards; the foot target is root-relative. */
export function legPose(y: number, z: number, thigh = .42, shin = .40) {
  const distance = Math.max(.08, Math.min(thigh + shin - .002, Math.hypot(y, z)));
  const clamp = (x: number) => Math.max(-1, Math.min(1, x));
  const hip = Math.atan2(-z, -y) - Math.acos(clamp((thigh * thigh + distance * distance - shin * shin) / (2 * thigh * distance)));
  const knee = Math.PI - Math.acos(clamp((thigh * thigh + shin * shin - distance * distance) / (2 * thigh * shin)));
  return { hip, knee, ankle: -hip - knee };
}
