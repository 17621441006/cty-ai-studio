import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const models = new Map<string, Promise<GLTF>>();
/** Shared downloads and geometry; callers clone the scene/rig, never the buffers. */
export function loadSharedModel(path: string): Promise<GLTF> {
  let pending = models.get(path);
  if (!pending) {
    const url = new URL('../assets/' + path, document.baseURI).href;
    pending = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url);
    models.set(path, pending);
    pending.catch(() => { if (models.get(path) === pending) models.delete(path); });
  }
  return pending;
}
