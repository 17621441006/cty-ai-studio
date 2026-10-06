import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {MOON_RADIUS} from '@/lib/moon-gallery';

function random(n: number) {const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value);}
export function createMosaicMoon(compact: boolean) {
  const group = new THREE.Group(), rows = compact ? 48 : 64;
  const side = Math.PI * MOON_RADIUS / rows;
  const cells: {latitude: number; longitude: number; width: number}[] = [];
  for (let row = 0; row < rows; row++) {
    const latitude = (row + .5) / rows * Math.PI - Math.PI / 2;
    const columns = Math.max(4, Math.round(Math.cos(latitude) * rows * 2));
    for (let column = 0; column < columns; column++) cells.push({latitude, longitude: column / columns * Math.PI * 2, width: Math.PI * 2 * MOON_RADIUS * Math.cos(latitude) / columns});
  }
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({roughness: .82, metalness: .08});
  const tiles = new THREE.InstancedMesh(geometry, material, cells.length);
  const matrix = new THREE.Object3D(), direction = new THREE.Vector3(), axis = new THREE.Vector3(0, 0, 1);
  const cream = ['#fff6dc', '#f1e5c6', '#ead5a5', '#d9cba9', '#fffbea'];
  const blue = ['#427dc0', '#3274ac', '#61a1d4', '#87b7dc', '#205280', '#a5c4dc'];
  const gold = ['#e8c377', '#f4d696', '#c69d55', '#f9e3b5'];
  cells.forEach(({latitude: lat, longitude: lng, width}, i) => {
    const river = Math.abs(Math.sin(lng * 1.5 + lat * 1.2 + Math.sin(lat * 3) * .62));
    const clouds = Math.sin(lng * 4 - lat * 3) + Math.cos(lat * 9 + Math.sin(lng * 3));
    const ocean = river < .34 || (river < .65 && Math.sin(lng * 3 - lat * 5) > .79);
    const gilded = !ocean && clouds > 1.28;
    const palette = ocean ? blue : gilded ? gold : cream;
    const depth = .055 + random(i + 1) * (ocean ? .24 : gilded ? .19 : .08);
    direction.set(Math.cos(lat) * Math.sin(lng), Math.sin(lat), Math.cos(lat) * Math.cos(lng));
    matrix.position.copy(direction).multiplyScalar(MOON_RADIUS + depth / 2);
    matrix.quaternion.setFromUnitVectors(axis, direction);
    matrix.scale.set(width * .968, side * .966, depth); matrix.updateMatrix();
    tiles.setMatrixAt(i, matrix.matrix); tiles.setColorAt(i, new THREE.Color(palette[Math.floor(random(i + 50) * palette.length)]));
  });
  tiles.computeBoundingSphere(); group.add(tiles);
  const core = new THREE.Mesh(new THREE.SphereGeometry(MOON_RADIUS - .025, 64, 40), new THREE.MeshStandardMaterial({color: '#b0b4aa', roughness: 1})); group.add(core);
  // Raised tesserae form a blue ribbon, ending in a handful of loose moon pixels.
  const trail = new THREE.InstancedMesh(geometry, material, 70);
  for (let i = 0; i < 70; i++) {
    const p = i / 69, scale = .12 * (1 - p * .65), angle = p * 3.2 + .4;
    matrix.position.set(.6 + Math.sin(angle) * .8, -5 - p * 1.7, Math.cos(angle) * 1.4);
    matrix.rotation.set(i * .8, i * .37, i * .2); matrix.scale.setScalar(scale); matrix.updateMatrix();
    trail.setMatrixAt(i, matrix.matrix); trail.setColorAt(i, new THREE.Color(i % 7 ? blue[i % blue.length] : gold[i % gold.length]));
  }
  trail.computeBoundingSphere(); group.add(trail);
  return group;
}

export function createFrameGeometry() {
  const pieces: THREE.BufferGeometry[] = [];
  const box = (w: number, h: number, d: number, x: number, y: number, z: number) => pieces.push(new THREE.BoxGeometry(w, h, d).translate(x, y, z));
  box(1.99, .075, .18, 0, .718, 0); box(1.99, .075, .18, 0, -.718, 0);
  box(.075, 1.36, .18, -.955, 0, 0); box(.075, 1.36, .18, .955, 0, 0);
  box(1.86, .028, .22, 0, .659, .015); box(1.86, .028, .22, 0, -.659, .015);
  box(.028, 1.3, .22, -.893, 0, .015); box(.028, 1.3, .22, .893, 0, .015);
  for (const x of [-1, 1]) for (const y of [-1, 1]) box(.135, .135, .24, x * .964, y * .727, .018);
  const merged = mergeGeometries(pieces); pieces.forEach(piece => piece.dispose()); return merged;
}

export function createLunarStars() {
  const points = new Float32Array(540 * 3), colors = new Float32Array(540 * 3);
  for (let i = 0; i < 540; i++) {
    points[i * 3] = (random(i * 3) - .5) * 95;
    points[i * 3 + 1] = (random(i * 3 + 1) - .5) * 66;
    points[i * 3 + 2] = -10 - random(i * 3 + 2) * 24;
    const color = new THREE.Color(i % 6 ? '#699ec5' : '#ead59f').multiplyScalar(.5 + random(i + 40) * .5);
    color.toArray(colors, i * 3);
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(points, 3)); geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({size: .075, vertexColors: true, sizeAttenuation: true, transparent: true, opacity: .85, depthWrite: false}));
}

/** Only a frame in front of the opaque moon can be clicked. */
export function pickMoonExhibit(raycaster: THREE.Raycaster, pictures: THREE.Object3D[]) {
  const surface = raycaster.ray.intersectSphere(new THREE.Sphere(new THREE.Vector3(), MOON_RADIUS + .18), new THREE.Vector3());
  const limit = surface ? surface.distanceTo(raycaster.ray.origin) : Infinity;
  return raycaster.intersectObjects(pictures, false).find(hit => hit.distance < limit)?.object;
}
