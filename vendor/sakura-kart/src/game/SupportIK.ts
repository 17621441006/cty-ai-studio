import * as THREE from 'three';

/** Small, allocation-free two-bone solve. The animation supplies the elbow
 * pole and palm orientation; only the arm chain moves toward a support point. */
export function supportArm(avatar: THREE.Object3D, side: 'Left' | 'Right', palmPad: THREE.Vector3) {
  const upper = avatar.getObjectByName(side + 'UpperArm')!;
  const lower = avatar.getObjectByName(side + 'ForeArm')!;
  const hand = avatar.getObjectByName(side + 'Hand')!;
  const shoulder = new THREE.Vector3(), elbow = new THREE.Vector3(), wrist = new THREE.Vector3();
  const goal = new THREE.Vector3(), axis = new THREE.Vector3(), bend = new THREE.Vector3();
  const wantedElbow = new THREE.Vector3(), from = new THREE.Vector3(), to = new THREE.Vector3();
  const delta = new THREE.Quaternion(), world = new THREE.Quaternion(), parent = new THREE.Quaternion();
  const palm = new THREE.Quaternion();
  const offset = palmPad.clone().applyQuaternion(new THREE.Quaternion(.5, side === 'Left' ? .5 : -.5, side === 'Left' ? .5 : -.5, .5).invert());
  const worldOffset = new THREE.Vector3();
  const contact = new THREE.Object3D(); contact.name = side + 'SupportPalm'; contact.position.copy(offset); hand.add(contact);
  const turn = (bone: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3) => {
    delta.setFromUnitVectors(from.copy(a).normalize(), to.copy(b).normalize());
    bone.getWorldQuaternion(world); bone.parent!.getWorldQuaternion(parent).invert();
    bone.quaternion.copy(parent.multiply(delta).multiply(world)); bone.updateWorldMatrix(false, true);
  };
  return { hand, contact, solve(target: THREE.Vector3, weight: number) {
    if (weight <= 0) return;
    upper.updateWorldMatrix(true, true);
    upper.getWorldPosition(shoulder); lower.getWorldPosition(elbow); hand.getWorldPosition(wrist);
    hand.getWorldQuaternion(palm);
    worldOffset.copy(offset).applyQuaternion(palm);
    goal.copy(target).sub(worldOffset).lerp(wrist, 1 - weight);
    const l1 = shoulder.distanceTo(elbow), l2 = elbow.distanceTo(wrist);
    axis.subVectors(goal, shoulder);
    const d = THREE.MathUtils.clamp(axis.length(), Math.abs(l1 - l2) + .0001, l1 + l2 - .0001);
    axis.normalize();
    bend.subVectors(elbow, shoulder).addScaledVector(axis, -bend.dot(axis));
    if (bend.lengthSq() < 1e-8) bend.set(0, -1, 0).addScaledVector(axis, axis.y);
    bend.normalize();
    const along = (l1 * l1 + d * d - l2 * l2) / (2 * d);
    wantedElbow.copy(shoulder).addScaledVector(axis, along).addScaledVector(bend, Math.sqrt(Math.max(0, l1 * l1 - along * along)));
    turn(upper, elbow.sub(shoulder), wantedElbow.sub(shoulder));
    lower.getWorldPosition(elbow); hand.getWorldPosition(wrist);
    turn(lower, wrist.sub(elbow), goal.sub(elbow));
    hand.parent!.getWorldQuaternion(parent).invert(); hand.quaternion.copy(parent.multiply(palm));
    hand.updateWorldMatrix(false, true);
  }};
}
