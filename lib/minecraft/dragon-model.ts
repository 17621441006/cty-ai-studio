import * as THREE from 'three';
export type DragonAsset={bones:{name:string;parent:number;position:number[]}[];positions:number[];uvs:number[];indices:number[];skin:number[]};
/** Supplied USDZ: 780 triangles; articulated talons add 60 triangles in one instanced draw. */
export function buildDragon(asset:DragonAsset,texture:THREE.Texture){
 const root=new THREE.Group(),body=new THREE.Group();root.add(body);body.rotation.y=Math.PI;body.scale.setScalar(.72);
 const positions=[...asset.positions];
 // A restrained shoulder arch preserves the saddle while breaking the ruler-straight silhouette.
 for(let i=0;i<asset.skin.length;i++)if(asset.bones[asset.skin[i]].name==='body_28'){const y=positions[i*3+1],z=positions[i*3+2];if(y>.4)positions[i*3+1]+=.24*Math.exp(-Math.pow((z+.2)/1.2,2))*Math.min(1,(y-.4)/.7);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(asset.uvs,2));geometry.setIndex(asset.indices);geometry.computeVertexNormals();
 geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(asset.skin.flatMap(i=>[i,0,0,0]),4));geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(asset.skin.flatMap(()=>[1,0,0,0]),4));
 const material=new THREE.MeshStandardMaterial({map:texture,roughness:.72,metalness:.05,alphaTest:.5,side:THREE.DoubleSide});
 const mesh=new THREE.SkinnedMesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;body.add(mesh);
 const bones=asset.bones.map(b=>{const bone=new THREE.Bone();bone.name=b.name;return bone;});
 asset.bones.forEach((b,i)=>{const parent=b.parent>=0?asset.bones[b.parent]:null;bones[i].position.fromArray(b.position);if(parent)bones[i].position.sub(new THREE.Vector3().fromArray(parent.position));(b.parent>=0?bones[b.parent]:mesh).add(bones[i]);});
 mesh.updateMatrixWorld(true);const skeleton=new THREE.Skeleton(bones);mesh.bind(skeleton);body.position.y=1.44;
 const talonGeometry=new THREE.ConeGeometry(.065,.3,5,1,true),talonMaterial=new THREE.MeshStandardMaterial({color:'#d8c8a0',roughness:.66});talonGeometry.rotateX(-2.15);
 const feet=bones.filter(b=>/^(front|rear)foot1?_/.test(b.name)),talons=new THREE.InstancedMesh(talonGeometry,talonMaterial,feet.length*3);talons.castShadow=true;talons.frustumCulled=false;body.add(talons);
 const clawMatrix=new THREE.Matrix4(),bodyInverse=new THREE.Matrix4(),clawPosition=new THREE.Vector3(),clawRotation=new THREE.Quaternion(),clawScale=new THREE.Vector3(1,1,1);
 let phase=0,air=0,breathing=0;
 function mouth(){root.updateMatrixWorld(true);const head=bones.find(b=>b.name==='head_8')!;return head.localToWorld(new THREE.Vector3(0,-.18,-1.55));}
 function animate(dt:number,time:number,flying:boolean,speed:number,turn:number,vertical:number,casting=false){
  breathing=THREE.MathUtils.lerp(breathing,Number(casting),1-Math.exp(-dt*9));
  air=THREE.MathUtils.lerp(air,Number(flying),1-Math.exp(-dt*4));phase+=dt*(flying?5.2+Math.max(0,vertical)*.15:1.5);
  body.position.y=1.44+Math.sin(phase*2)*.075*air+Math.sin(time*1.7)*.025*(1-air);
  body.rotation.x=THREE.MathUtils.lerp(body.rotation.x,-vertical*.025,1-Math.exp(-dt*4));body.rotation.z=THREE.MathUtils.lerp(body.rotation.z,THREE.MathUtils.clamp(-turn*.10,-.32,.32),1-Math.exp(-dt*5));
  for(const b of bones){
   if(/^wing1?_/.test(b.name)&&['wing_34','wing1_40'].includes(b.name)){const sign=b.name==='wing_34'?1:-1;b.rotation.z=sign*((1-air)*1.15+air*(.15+Math.sin(phase)*.62));}
   else if(['wingtip_31','wingtip1_37'].includes(b.name)){const sign=b.name==='wingtip_31'?1:-1;b.rotation.z=sign*((1-air)*-.55+air*Math.sin(phase-.65)*.38);}
   else if(/^tail\d*_/.test(b.name)){const n=bones.indexOf(b)-25;b.rotation.y=Math.sin(phase*.55-n*.38)*(.027+air*.022)+turn*.006;b.rotation.x=Math.sin(phase*.7-n*.42)*(.018+air*.026);}
   else if(/^neck\d*_/.test(b.name)){const n=bones.indexOf(b)-1,arch=[.48,.18,-.07,-.16,-.18][n]||0;b.rotation.x=arch*(1-air*.32)*(1-breathing*.35)+Math.sin(time*1.5+n*.4)*.02;}
   else if(b.name==='head_8')b.rotation.x=-.15*(1-breathing);
   else if(b.name==='jaw_1')b.rotation.x=-.06-breathing*.45;
   else if(/^(front|rear)leg1?_/.test(b.name))b.rotation.x=air*.6+Math.sin(phase+(b.name.includes('1_')?Math.PI:0))*Math.min(.35,speed*.08)*(1-air);
   else if(/^(front|rear)legtip1?_/.test(b.name))b.rotation.x=-air*.75;
   else if(/^(front|rear)foot1?_/.test(b.name)){b.rotation.x=air*(-.12+Math.sin(phase*.65+feet.indexOf(b)*1.4)*.16);b.rotation.z=air*Math.sin(phase*.5+feet.indexOf(b))*.06;}
  }
  root.updateMatrixWorld(true);bodyInverse.copy(body.matrixWorld).invert();feet.forEach((foot,i)=>{const rear=foot.name.startsWith('rear'),open=air*(.5+.5*Math.sin(phase*.65+i*1.4));for(let j=0;j<3;j++){clawPosition.set((j-1)*(rear?.28:.16)*(1+open*.3),rear?-.75:-.67,rear?.68:.05);clawRotation.setFromEuler(new THREE.Euler(-open*.45,0,(j-1)*open*.18));clawMatrix.compose(clawPosition,clawRotation,clawScale).premultiply(foot.matrixWorld).premultiply(bodyInverse);talons.setMatrixAt(i*3+j,clawMatrix);}});talons.instanceMatrix.needsUpdate=true;
 }
 animate(0,0,false,0,0,0);
 return {root,animate,mouth,seatHeight:2.16,dispose:()=>{geometry.dispose();material.dispose();texture.dispose();skeleton.dispose();talons.dispose();talonGeometry.dispose();talonMaterial.dispose();}};
}
export async function loadDragon(signal:AbortSignal,kind:'fire'|'storm'='fire'){
 const response=await fetch(kind==='storm'?'/works/minecraft/models/inhabitants/ancient-dragon.json':'/works/minecraft/models/red-dragon.json',{signal});if(!response.ok)throw new Error('龙模型加载失败');const asset=await response.json() as DragonAsset;
 const texture=await new THREE.TextureLoader().loadAsync(kind==='storm'?'/works/minecraft/models/inhabitants/ancient-dragon.png':'/works/minecraft/models/red-dragon.png');texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=true;texture.magFilter=THREE.NearestFilter;texture.anisotropy=4;
 if(signal.aborted){texture.dispose();throw new Error('aborted');}return buildDragon(asset,texture);
}
