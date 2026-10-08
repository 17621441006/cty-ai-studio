import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import * as T from 'three';
import {makeRoute,poseAt,advanceTour,stepYaw,EYE_HEIGHT,STOPS} from '../../app/components/arcade/diagon/route.mjs';

test('tour stays at walking height and has continuous curved turns, never an aerial camera',()=>{
 const route=makeRoute();let last=poseAt(route,0);let turning=0;
 for(let i=1;i<=1000;i++){const current=poseAt(route,i/1000);assert.equal(current.position.y,EYE_HEIGHT);assert.ok(current.position.distanceTo(last.position)<.15);const angle=current.tangent.angleTo(last.tangent);assert.ok(angle<.04);turning+=angle;last=current;}
 assert.ok(turning>1.3);assert.ok(route.getLength()>60&&route.getLength()<90);assert.ok(STOPS.every(s=>s.u>=0&&s.u<=1));
});
test('large elapsed gaps cannot skip down the street, and progress stops at the plaza',()=>{
 const length=makeRoute().getLength();assert.equal(advanceTour(.5,0,1,length),.5);assert.equal(advanceTour(.5,3,0,length),.5);assert.ok(advanceTour(.5,100,.82,length)-.5<.001);assert.equal(advanceTour(.99999,.05,1,length),1);
 const next=stepYaw(Math.PI-.01,-Math.PI+.01,1/60);assert.ok(Math.abs(next-(Math.PI-.01))<.01);
});

// Build the actual scene without a browser; validate geometry and local texture URLs.
test('scene has bounded geometry, local assets, an upright floor and a clear walking corridor',async()=>{
 const urls=[];const ctx=new Proxy({createRadialGradient(){return {addColorStop(){}};}},{get:(t,k)=>k in t?t[k]:()=>{}});
 class Image {constructor(){this.listeners={};}addEventListener(k,f){this.listeners[k]=f;}removeEventListener(){}set src(url){urls.push(url);queueMicrotask(()=>this.listeners.load?.call(this));}}
 globalThis.document={createElement:()=>({width:1,height:1,getContext:()=>ctx}),createElementNS:()=>new Image()};
 const {buildDiagon}=await import('../../app/components/arcade/diagon/scene.ts');
 let done;const ready=new Promise(r=>done=r),world=buildDiagon(new T.LoadingManager(done));await ready;world.group.updateMatrixWorld(true);
 let triangles=0;const meshes=[];world.group.traverse(o=>{if(o.isMesh){meshes.push(o);triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});
 assert.ok(meshes.length<150,`meshes=${meshes.length}`);assert.ok(triangles<350000,`triangles=${triangles}`);assert.equal(world.stats.shops,16);
 for(const url of new Set(urls)){assert.ok(url.startsWith('/works/worlds/materials/'));assert.ok(existsSync(new URL('../../public'+url,import.meta.url)),url);}
 const ray=new T.Raycaster();
 for(let i=0;i<64;i++){const p=poseAt(world.route,i/63).position;for(let j=0;j<6;j++){const a=j/6*Math.PI*2;ray.set(p,new T.Vector3(Math.sin(a),0,Math.cos(a)));ray.near=0;ray.far=.65;assert.equal(ray.intersectObjects(meshes,false).length,0,`collision at route ${i}/63`);}}
 ray.set(poseAt(world.route,.35).position,new T.Vector3(0,-1,0));ray.far=2;const floor=ray.intersectObjects(meshes,false)[0];assert.ok(floor);assert.ok(Math.abs(floor.point.y)<.2);assert.ok(floor.face.normal.y>.9);
 world.dispose();delete globalThis.document;
});
