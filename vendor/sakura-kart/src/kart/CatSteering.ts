import * as THREE from 'three';

/** Bend the authored forearms progressively; keep the shoulders fixed and paws on the rim. */
export function bindCatSteering(avatar:THREE.Object3D,wheel:THREE.Object3D) {
  avatar.updateWorldMatrix(true,true);wheel.updateWorldMatrix(true,false);
  const uniforms:{value:number}[]=[];
  const markers:{node:THREE.Object3D;toWheel:THREE.Matrix4;fromWheel:THREE.Matrix4;rest:THREE.Vector3}[]=[];
  const wheelInverse=wheel.matrixWorld.clone().invert();
  for(const name of ['leftArm','rightArm']){
    const arm=avatar.getObjectByName(name);
    if(!arm)continue;
    arm.traverse(obj=>{
      const mesh=obj as THREE.Mesh;
      if(!mesh.isMesh)return;
      const weight=mesh.geometry.getAttribute('_grip_weight')??mesh.geometry.getAttribute('_GRIP_WEIGHT');
      if(!weight)return;
      mesh.geometry.setAttribute('aCatGrip',weight);
      if(!mesh.geometry.userData.catGripBounds){mesh.geometry.computeBoundingSphere();mesh.geometry.boundingSphere!.radius+=.2;mesh.geometry.userData.catGripBounds=true;}
      const toWheel=wheelInverse.clone().multiply(mesh.matrixWorld);
      const fromWheel=toWheel.clone().invert();
      const angle={value:0};uniforms.push(angle);
      const patch=(material:THREE.Material)=>{
        material.onBeforeCompile=shader=>{
          shader.uniforms.uCatSteer=angle;
          shader.uniforms.uCatToWheel={value:toWheel};
          shader.uniforms.uCatFromWheel={value:fromWheel};
          shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
            attribute float aCatGrip;
            uniform float uCatSteer;
            uniform mat4 uCatToWheel;
            uniform mat4 uCatFromWheel;
            mat3 catTurn(){float c=cos(uCatSteer),s=sin(uCatSteer);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}`);
          shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
            vec3 catP=catTurn()*(uCatToWheel*vec4(transformed,1.)).xyz;
            transformed=mix(transformed,(uCatFromWheel*vec4(catP,1.)).xyz,aCatGrip);`);
          shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
            vec3 catN=mat3(uCatFromWheel)*catTurn()*mat3(uCatToWheel)*objectNormal;
            objectNormal=normalize(mix(objectNormal,catN,aCatGrip));`);
        };
        material.customProgramCacheKey=()=> 'cat-rim-grip-v7';
      };
      const material=(mesh.material as THREE.Material).clone();patch(material);mesh.material=material;
      mesh.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});patch(mesh.customDepthMaterial);
      mesh.customDistanceMaterial=new THREE.MeshDistanceMaterial();patch(mesh.customDistanceMaterial);
    });
    const paw=arm.getObjectByName(name==='leftArm'?'leftPaw':'rightPaw');
    if(paw){const toWheel=wheelInverse.clone().multiply(paw.parent!.matrixWorld);markers.push({node:paw,toWheel,fromWheel:toWheel.clone().invert(),rest:paw.position.clone()});}
  }
  const rotated=new THREE.Vector3(),turn=new THREE.Matrix4();
  const update=(angle:number)=>{
    for(const uniform of uniforms)uniform.value=angle;
    turn.makeRotationY(angle);
    for(const m of markers){rotated.copy(m.rest).applyMatrix4(m.toWheel).applyMatrix4(turn).applyMatrix4(m.fromWheel);m.node.position.copy(rotated);}
  };
  avatar.userData.poseSteering=update;
  return {update,armCount:uniforms.length,markers:markers.map(m=>m.node)};
}
