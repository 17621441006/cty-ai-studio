import * as THREE from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import type { Kart } from './Kart';
import type { DriverRig } from './Driver';
import { loadSharedModel } from './ModelLibrary';

export const FAMILY = [
  { id: 'xiaosi', name: '小司', vehicle: 'eagle' },
  { id: 'xiaoyong', name: '小涌', vehicle: 'racing125' },
] as const;
export type FamilyId = typeof FAMILY[number]['id'];
export const loadFamilyAvatar = (id: FamilyId) => loadSharedModel(`v9-family/${id}.glb`);
export type FamilyClip = 'riding' | 'idle' | 'walk' | 'clap' | 'cheer' | 'lift';

/** Separate skeletons share the same geometry and textures in race and ceremony. */
export function familyCharacter(model: GLTF, clipName: FamilyClip) {
  const avatar = clone(model.scene);
  const mixer = new THREE.AnimationMixer(avatar);
  const clip = model.animations.find(c => c.name === clipName);
  if (!clip) throw new Error(`Missing family animation: ${clipName}`);
  mixer.clipAction(clip).play(); mixer.setTime(0);
  avatar.traverse(o => {
    const mesh = o as THREE.SkinnedMesh;
    if (mesh.isMesh) { mesh.castShadow = false; mesh.receiveShadow = true; }
    // Authored animation bounds, not the straight-leg bind pose, own culling.
    if (mesh.isSkinnedMesh) mesh.frustumCulled = false;
  });
  return { avatar, mixer };
}

export function installFamilyAvatar(kart: Kart, model: GLTF, id: FamilyId) {
  const root = kart.visual.children[0];
  const rig = root.userData.driver as DriverRig;
  const { avatar } = familyCharacter(model, 'riding');
  avatar.name = id;
  avatar.position.set(0, -.42, .14);
  let bound = false;
  return () => {
    rig.installAvatar(avatar); rig.setAvatarActive(true);
    root.userData.catPlayer = true; // The old baked driver must never replace a family member.
    root.userData.familyId = id;
    root.userData.authoredDriver = avatar;
    const impostor = root.userData.impostor as THREE.Mesh;
    if (impostor) { impostor.visible = false; impostor.castShadow = false; }
    if (!bound) {
      const wheel = rig.root.getObjectByName('steeringWheel');
      if (wheel) bindHumanSteering(avatar, wheel);
      bound = true;
    }
  };
}

/** Two-bone solve follows each authored wrist around the rim, without scaling limbs. */
function bindHumanSteering(avatar: THREE.Object3D, wheel: THREE.Object3D) {
  avatar.updateWorldMatrix(true, true); wheel.updateWorldMatrix(true, false);
  const arms = ['Left', 'Right'].map(side => {
    const upper = avatar.getObjectByName(side + 'UpperArm')!;
    const lower = avatar.getObjectByName(side + 'ForeArm')!;
    const hand = avatar.getObjectByName(side + 'Hand')!;
    const wrist = hand.getWorldPosition(new THREE.Vector3());
    return { upper, lower, hand, uq: upper.quaternion.clone(), lq: lower.quaternion.clone(),
      hq: hand.quaternion.clone(), wrist: wheel.worldToLocal(wrist.clone()) };
  });
  const shoulder = new THREE.Vector3(), elbow = new THREE.Vector3(), wrist = new THREE.Vector3();
  const target = new THREE.Vector3(), axis = new THREE.Vector3(), bend = new THREE.Vector3();
  const wantedElbow = new THREE.Vector3(), from = new THREE.Vector3(), to = new THREE.Vector3();
  const delta = new THREE.Quaternion(), world = new THREE.Quaternion(), parent = new THREE.Quaternion();
  const turn = (bone: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3) => {
    delta.setFromUnitVectors(from.copy(a).normalize(), to.copy(b).normalize());
    bone.getWorldQuaternion(world); bone.parent!.getWorldQuaternion(parent).invert();
    bone.quaternion.copy(parent.multiply(delta).multiply(world));
    bone.updateWorldMatrix(false, true);
  };
  avatar.userData.poseSteering = () => {
    wheel.updateWorldMatrix(true, false);
    for (const a of arms) {
      a.upper.quaternion.copy(a.uq); a.lower.quaternion.copy(a.lq); a.hand.quaternion.copy(a.hq);
      a.upper.updateWorldMatrix(true, true);
      a.upper.getWorldPosition(shoulder); a.lower.getWorldPosition(elbow); a.hand.getWorldPosition(wrist);
      target.copy(a.wrist).applyMatrix4(wheel.matrixWorld);
      axis.subVectors(target, shoulder);
      // Re-measure after the chassis squash/boost scale and driver lean.
      const l1 = shoulder.distanceTo(elbow), l2 = elbow.distanceTo(wrist);
      const d = Math.max(Math.abs(l1 - l2) + .0001, Math.min(axis.length(), l1 + l2 - .0001)); axis.normalize();
      bend.subVectors(elbow, shoulder).addScaledVector(axis, -bend.dot(axis));
      if (bend.lengthSq() < 1e-8) bend.set(0, -1, 0).addScaledVector(axis, axis.y);
      bend.normalize();
      const along = (l1 * l1 + d * d - l2 * l2) / (2 * d);
      const height = Math.sqrt(Math.max(0, l1 * l1 - along * along));
      wantedElbow.copy(shoulder).addScaledVector(axis, along).addScaledVector(bend, height);
      turn(a.upper, elbow.sub(shoulder), wantedElbow.sub(shoulder));
      a.lower.getWorldPosition(elbow); a.hand.getWorldPosition(wrist);
      turn(a.lower, wrist.sub(elbow), target.sub(elbow));
    }
  };
}
