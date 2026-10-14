import * as THREE from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import type { Kart } from './Kart';
import type { VehicleOption } from '../types';
import { loadSharedModel } from './ModelLibrary';

export const VEHICLE_OPTIONS: readonly VehicleOption[] = [
  { id: 'classic', name: '樱花敞篷车', detail: '当前款 · 珊瑚红与青绿', color: '#e98096', badge: '原版' },
  { id: 'meshy', name: '738 号定制车', detail: '白色车身 · 青色车架', color: '#73cacb', badge: '738' },
  { id: 'racing125', name: '125cc 竞速车', detail: '橙黑涂装 · 专业卡丁车', color: '#f39b49', badge: '71' },
  { id: 'eagle', name: '鹰翼赛车', detail: '蓝青车身 · 橙色尾翼', color: '#58b9cd', badge: '翼' },
  { id: 'black', name: '曜黑卡丁车', detail: '全新黑色车身 · 低趴竞速', color: '#b4c7d6', badge: 'NEW' },
];

const _yaw = new THREE.Quaternion(), _spin = new THREE.Quaternion();
const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0);
const STEERING_AXIS = new THREE.Vector3(0, Math.cos(-.95), Math.sin(-.95));
const appearanceAsset = (id: string) => id === 'classic' ? Promise.resolve(null) : loadSharedModel(`${id === 'black' ? 'v10' : id === 'eagle' ? 'v9' : 'v8'}-vehicles/${id}.glb`);
type Wheel = { node: THREE.Object3D; source: THREE.Object3D; rest: THREE.Vector3; rotation: THREE.Quaternion; radius: number };

/** Replace visual bodywork only. Physics, handling, collisions and lap progress stay on Kart. */
export class VehicleAppearance {
  /** Prepare the whole family's selection before replacing any visible car. */
  static async prepare(ids: readonly string[]) { await Promise.all(ids.map(appearanceAsset)); }
  id = 'classic';
  private root: THREE.Object3D;
  private body: THREE.Object3D;
  private bodyHost = new THREE.Group();
  private wheelHost = new THREE.Group();
  private originals: THREE.Object3D[];
  private wheels: Wheel[] = [];
  private steering?: THREE.Object3D;
  private steeringRest = new THREE.Quaternion();
  private sourceSteering?: THREE.Object3D;
  private sequence = 0;

  constructor(private kart: Kart) {
    this.root = kart.visual.children[0];
    this.body = this.root.userData.body;
    this.originals = this.body.children.filter(n => n !== this.root.userData.driver?.root);
    const tyres = this.root.getObjectByName('tyres');
    if (tyres) this.originals.push(tyres);
    this.bodyHost.name = 'vehicleAppearanceBody';
    this.wheelHost.name = 'vehicleAppearanceWheels';
    this.body.add(this.bodyHost); this.root.add(this.wheelHost);
    this.root.userData.detailNodes.push(this.wheelHost);
    this.sourceSteering = this.root.userData.driver?.root.getObjectByName('steeringWheel');
    this.root.userData.updateAppearancePose = () => this.update();
  }

  async select(id: string): Promise<boolean> {
    if (!VEHICLE_OPTIONS.some(o => o.id === id)) return false;
    const token = ++this.sequence;
    const asset = await appearanceAsset(id);
    if (token !== this.sequence) return false;
    this.bodyHost.clear(); this.wheelHost.clear(); this.wheels.length = 0; this.steering = undefined;
    for (const node of this.originals) { node.userData.skinHidden = !!asset; node.visible = !asset; }
    if (this.sourceSteering) this.sourceSteering.visible = true;
    if (asset) {
      const model = clone(asset.scene);
      model.updateMatrixWorld(true);
      for (const name of ['wheelFL', 'wheelFR', 'wheelRL', 'wheelRR']) {
        const node = model.getObjectByName(name), source = this.root.getObjectByName(name);
        if (!node || !source) continue;
        const matrix = node.matrixWorld.clone();
        node.removeFromParent(); matrix.decompose(node.position, node.quaternion, node.scale);
        this.wheelHost.add(node);
        this.wheels.push({ node, source, rest: node.position.clone(), rotation: node.quaternion.clone(), radius: node.userData.radius || node.position.y || .3 });
      }
      this.steering = model.getObjectByName('steeringWheel');
      if (this.steering) {
        this.steeringRest.copy(this.steering.quaternion);
        if (this.sourceSteering) this.sourceSteering.visible = false;
      }
      model.traverse(o => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) { mesh.castShadow = false; mesh.receiveShadow = false; }
      });
      this.bodyHost.add(model);
    }
    this.id = id; this.root.userData.vehicleAppearance = id;
    this.update();
    return true;
  }

  update() {
    for (const w of this.wheels) {
      w.node.position.y = w.rest.y + w.source.position.y - (w.source.userData.restY || .36);
      _yaw.setFromAxisAngle(Y, w.source.rotation.y);
      _spin.setFromAxisAngle(X, w.source.rotation.x * (w.source.userData.radius || .36) / w.radius);
      w.node.quaternion.copy(_yaw).multiply(_spin).multiply(w.rotation);
    }
    if (this.steering && this.sourceSteering) {
      const angle = this.sourceSteering.parent?.rotation.y || 0;
      _yaw.setFromAxisAngle(STEERING_AXIS, angle);
      this.steering.quaternion.copy(_yaw).multiply(this.steeringRest);
    }
  }
}
