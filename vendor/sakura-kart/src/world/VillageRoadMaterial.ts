import * as THREE from 'three';
import { assetUrl } from '../core/AssetUrl';
interface SurfaceMaps { map: THREE.Texture; normalMap: THREE.Texture; roughnessMap: THREE.Texture }
let gravel: Pick<SurfaceMaps, 'map' | 'normalMap'> | null = null;

export async function loadVillageRoadTextures(renderer: THREE.WebGLRenderer) {
  const loader = new THREE.TextureLoader();
  const [map, normalMap] = await Promise.all(['albedo', 'normal'].map(kind =>
    loader.loadAsync(assetUrl(`/assets/road-surfaces/gravel_ground_01-${kind}.jpg`))));
  for (const texture of [map, normalMap]) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  }
  map.colorSpace = THREE.SRGBColorSpace;
  normalMap.colorSpace = THREE.NoColorSpace;
  gravel = { map, normalMap };
}
export function disposeVillageRoadTextures() {
  if (gravel) { gravel.map.dispose(); gravel.normalMap.dispose(); gravel = null; }
}

const ROAD_GLSL = /*glsl*/`
  varying float vPaving; varying vec2 vRoadWorld;
  uniform sampler2D uStoneMap, uStoneNormal;
  uniform float uStoneRate;
  float roadBlend; vec2 stoneUv, roadMetres;
  float roadHash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float roadNoise(vec2 p) {
    vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
    return mix(mix(roadHash(i),roadHash(i+vec2(1,0)),f.x),
      mix(roadHash(i+vec2(0,1)),roadHash(i+1.0),f.x),f.y);
  }
`;

/** Four texture reads: softer gravel and sculpted paving under the scene light. */
export function createVillageRoadMaterial(fallback: SurfaceMaps, stone: THREE.MeshStandardMaterial, stoneRate: number): THREE.MeshStandardMaterial {
  const fine = gravel ?? fallback;
  const material = new THREE.MeshStandardMaterial({
    map: fine.map, normalMap: fine.normalMap, vertexColors: true,
    roughness: .94, metalness: 0, normalScale: new THREE.Vector2(.22,.22), envMapIntensity: .35,
  });
  material.name = 'soft-mineral-road';
  material.userData.roadSources = ['gravel_ground_01'];
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, {
      uStoneMap: { value: stone.map }, uStoneNormal: { value: stone.normalMap },
      uStoneRate: { value: stoneRate },
    });
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aPaving; varying float vPaving; varying vec2 vRoadWorld;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPaving=aPaving;vRoadWorld=(modelMatrix*vec4(position,1.0)).xz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n'+ROAD_GLSL)
      .replace('#include <map_fragment>', /*glsl*/`
        roadMetres=vMapUv*3.5;stoneUv=vMapUv*uStoneRate;
        float broad=roadNoise(vRoadWorld*.08+31.6);
        roadBlend=clamp(vPaving,0.0,1.0);
        vec3 grit=texture2D(map,roadMetres/3.5).rgb;
        float gritL=dot(grit,vec3(.2126,.7152,.0722));
        grit=mix(grit,vec3(gritL)*vec3(1.06,1.01,.94),.38);
        grit=mix(grit,vec3(.39,.33,.26),.20)*(.94+.12*broad);
        vec3 slabs=texture2D(uStoneMap,stoneUv).rgb;
        slabs=mix(slabs,vec3(dot(slabs,vec3(.2126,.7152,.0722))),.12);
        diffuseColor.rgb*=mix(grit,slabs,roadBlend);`)
      .replace('#include <normal_fragment_maps>', /*glsl*/`
        vec3 gritN=texture2D(normalMap,roadMetres/3.5).xyz*2.0-1.0;
        vec3 stoneN=texture2D(uStoneNormal,stoneUv).xyz*2.0-1.0;
        gritN.xy*=.16;stoneN.xy*=.28;
        normal=normalize(tbn*normalize(mix(gritN,stoneN,roadBlend)));`);
  };
  material.customProgramCacheKey = () => 'village-soft-mineral-v4';
  return material;
}
