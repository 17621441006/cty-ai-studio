import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import type { Kart } from './Kart';
import type { DriverRig } from './Driver';
import { bindCatSteering } from './CatSteering';

/** The authored whole cat uses kart coordinates, +Y up and +Z forward. */
export async function loadCatAvatar(): Promise<THREE.Group> {
  const url = new URL('../assets/zangzangbao-kart-v7.glb', document.baseURI).href;
  try {
    const model = (await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url)).scene;
    let meshCount = 0;
    model.traverse(o => {
      if ((o as THREE.Mesh).isMesh) {
        meshCount++;
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    if (!meshCount) throw new Error('Empty cat asset');
    model.name = 'zangzangbao-whole-cat';
    return model;
  } catch (cause) {
    throw new Error('脏脏包的模型还没加载成功，请检查网络后重试。', { cause });
  }
}

export function installCatAvatar(kart: Kart, model: THREE.Group): (active: boolean) => void {
  const kartModel = kart.visual.children[0];
  const rig = kartModel?.userData.driver as DriverRig | undefined;
  if (!rig) throw new Error('找不到脏脏包的驾驶座。');
  const avatar = clone(model);
  // The DriverRig is already translated to this hip point by KartModel.
  // Cancel that translation because the artist delivered baked kart coordinates.
  avatar.position.set(0, -0.42, 0.14);
  rig.installAvatar(avatar);
  const wheel=rig.root.getObjectByName('steeringWheel');
  if(wheel)bindCatSteering(avatar,wheel);
  const realMeshes: { mesh: THREE.Mesh; castShadow: boolean }[] = [];
  const impostor = kartModel.userData.impostor as THREE.Mesh | undefined;
  kartModel.traverse(o => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh && mesh !== impostor && mesh.name !== 'shadowBlob') {
      realMeshes.push({ mesh, castShadow: mesh.castShadow });
    }
  });
  return active => {
    if (active) rig.installAvatar(avatar);
    rig.setAvatarActive(active);
    // The upstream bake includes its old human. Never show or cast that bake
    // for the cat player; cast the actual replacement geometry instead.
    kartModel.userData.catPlayer = active;
    for (const entry of realMeshes) entry.mesh.castShadow = active || entry.castShadow;
    if (active && impostor) { impostor.visible = false; impostor.castShadow = false; }
  };
}
