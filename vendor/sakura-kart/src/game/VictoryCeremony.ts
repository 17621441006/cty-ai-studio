import * as THREE from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { loadSharedModel } from '../kart/ModelLibrary';
import { FAMILY, loadFamilyAvatar, familyCharacter, type FamilyClip } from '../kart/FamilyAvatar';
import { RaceState, type Ctx, type System } from '../types';
import { ceremonyPose, companionPose, CEREMONY_DURATION, PODIUM_HEIGHT, SIDE_PODIUM_X } from './CeremonyTimeline';

import { supportArm } from './SupportIK';

/** A small independent scene shares the game's renderer. No second canvas or
 * permanent render pass: it is only drawn for an actual first-place finish. */
export class VictoryCeremony implements System {
  active = false;
  ready = false;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(38, 16 / 9, .05, 80);
  private cat = new THREE.Group();
  private trophy!: THREE.Object3D;
  private bottle!: THREE.Object3D;
  private catMixer!: THREE.AnimationMixer;
  private companions: { id: string; avatar: THREE.Object3D; mixer: THREE.AnimationMixer; actions: Partial<Record<FamilyClip, THREE.AnimationAction>>; arms: ReturnType<typeof supportArm>[] }[] = [];
  private supportLeft!: THREE.Object3D;
  private supportRight!: THREE.Object3D;
  private supportTarget = new THREE.Vector3();
  private leftPaw!: THREE.Object3D;
  private rightPaw!: THREE.Object3D;
  private bottleMouth!: THREE.Object3D;
  private cork?: THREE.Object3D;
  private corkRest = new THREE.Vector3();
  private timer = 0;
  private waiting = 0;
  private failed = false;
  private won = false;
  private ctx!: Ctx;
  private overlay!: HTMLDivElement;
  private caption!: HTMLElement;
  private label = '';
  private popped = false;
  private unsub?: () => void;
  private foam!: THREE.Points;
  private ribbons!: THREE.InstancedMesh;
  private foamPositions = new Float32Array(240 * 3);
  private dummy = new THREE.Object3D();
  private mouth = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private q = new THREE.Quaternion();

  init(ctx: Ctx) {
    this.ctx = ctx;
    this.scene.background = new THREE.Color('#d4e7f1');
    this.scene.fog = new THREE.Fog('#d4e7f1', 16, 35);
    this.scene.environment = ctx.envMap;
    this.scene.add(new THREE.HemisphereLight(0xfff1e0, 0x647085, 2.1));
    const key = new THREE.DirectionalLight(0xffe6c9, 3.2);
    key.position.set(-3, 6, 4); this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xe3efff, 1.4);
    fill.position.set(4, 3, -2); this.scene.add(fill);
    this.buildStage(ctx);
    this.buildParticles();
    this.scene.add(this.cat);
    this.overlay = document.createElement('div');
    this.overlay.className = 'kr-ceremony';
    this.overlay.hidden = true;
    this.overlay.innerHTML = '<div class="kr-ceremony-heading"><span>SAKURA TOWN GRAND PRIX</span><h1>脏脏包，冠军！</h1><p aria-live="polite"></p></div><button type="button" class="kr-ceremony-skip">查看成绩 <span>↵</span></button><div class="kr-ceremony-foot">CHAMPION · 01</div>';
    document.getElementById('ui')!.append(this.overlay);
    this.caption = this.overlay.querySelector('p')!;
    this.overlay.querySelector('button')!.onclick = e => { e.stopPropagation(); this.stop(); };
    this.overlay.addEventListener('pointerdown', e => e.stopPropagation());
    this.unsub = ctx.bus.on(e => {
      if (e.type === 'finish' && e.kart.isPlayer && e.place === 1) {
        this.won = true; this.replay();
      }
    });
    // Start loading beside the rest of boot. Racing does not depend on these
    // optional celebration assets, and a failed request has a visible exit.
    void this.load().catch(error => { this.failed = true; console.warn('颁奖资源加载失败', error); });
  }

  private async load() {
    const [cat, props, ...people] = await Promise.all([
      loadSharedModel('v9-family/zangzangbao.glb'),
      loadSharedModel('celebration-props-v6.glb'),
      ...FAMILY.map(p => loadFamilyAvatar(p.id)),
    ]);
    const wholeCat = clone(cat.scene);
    this.cat.name = 'podium-zangzangbao'; this.cat.add(wholeCat);
    this.catMixer = new THREE.AnimationMixer(wholeCat);
    const clip = cat.animations.find(c => c.name === 'ceremony');
    if (!clip) throw new Error('Missing whole-cat ceremony animation');
    const action = this.catMixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce, 1); action.clampWhenFinished = true; action.play();
    wholeCat.traverse(o => { if ((o as THREE.SkinnedMesh).isSkinnedMesh) o.frustumCulled = false; });
    const need = (root: THREE.Object3D, name: string) => {
      const o = root.getObjectByName(name);
      if (!o) throw new Error('Missing ceremony anchor: ' + name);
      return o;
    };
    this.leftPaw = need(wholeCat, 'leftGrip'); this.rightPaw = need(wholeCat, 'rightGrip');
    this.supportLeft = need(wholeCat, 'bellySupportLeft'); this.supportRight = need(wholeCat, 'bellySupportRight');
    this.companions = people.map((model, i) => {
      const person = familyCharacter(model, 'idle');
      const actions: Partial<Record<FamilyClip, THREE.AnimationAction>> = {};
      for (const name of ['idle', 'walk', 'clap', 'cheer', 'lift'] as FamilyClip[]) {
        const clip = model.animations.find(c => c.name === name);
        if (!clip) throw new Error('Missing family ceremony animation: ' + name);
        actions[name] = person.mixer.clipAction(clip).play().setEffectiveWeight(name === 'idle' ? 1 : 0);
      }
      person.avatar.name = 'podium-' + FAMILY[i].id;
      this.scene.add(person.avatar);
      const pads = FAMILY[i].id === 'xiaosi' ? [[.0202,.0044,.0389],[.0115,.0093,.0349]] : [[.0102,-.0006,.0395],[-.0105,.0015,.0331]];
      return { id: FAMILY[i].id, ...person, actions, arms: [supportArm(person.avatar, 'Left', new THREE.Vector3(...pads[0])), supportArm(person.avatar, 'Right', new THREE.Vector3(...pads[1]))] };
    });
    this.orderCompanions();
    const propsScene = clone(props.scene);
    this.trophy = need(propsScene, 'trophy'); this.bottle = need(propsScene, 'bottle');
    this.trophy.position.set(0, 0, 0); this.bottle.position.set(0, 0, 0);
    this.scene.add(this.trophy, this.bottle);
    this.bottleMouth = need(this.bottle, 'bottleMouth');
    this.cork = this.bottle.getObjectByName('bottleCork');
    if (this.cork) this.corkRest.copy(this.cork.position);
    this.trophy.visible = this.bottle.visible = false;
    this.ready = true;
  }

  private orderCompanions() {
    const order = this.ctx.race.standings || [];
    const placement = (id: string) => {
      const i = order.findIndex(k => k.object?.getObjectByProperty('name', id));
      return i < 0 ? FAMILY.findIndex(p => p.id === id) : i;
    };
    this.companions.sort((a, b) => placement(a.id) - placement(b.id));
    this.companions.forEach((p, i) => {
      p.avatar.position.set(i === 0 ? -SIDE_PODIUM_X : SIDE_PODIUM_X, i === 0 ? .31 : .26, 0);
      p.avatar.rotation.y = i === 0 ? .18 : -.18;
    });
    const names = this.companions.map(c => FAMILY.find(p => p.id === c.id)!.name);
    this.overlay.querySelector('.kr-ceremony-foot')!.textContent = `${names[0]} · 脏脏包 · ${names[1]}`;
  }

  replay() {
    if (!this.won || !this.ctx.race.player.finished || this.ctx.race.player.place !== 1) return;
    this.active = true; this.timer = 0; this.waiting = 0; this.label = '';
    this.popped = false;
    if (this.ready) this.orderCompanions();
    this.overlay.hidden = false;
    document.documentElement.dataset.ceremony = 'true';
    this.ctx.input.setNitroHeld?.(false);
  }

  private stop() {
    this.active = false;
    this.overlay.hidden = true;
    delete document.documentElement.dataset.ceremony;
  }

  update(ctx: Ctx, dt: number) {
    if (ctx.race.state === RaceState.Countdown || ctx.race.state === RaceState.Menu) {
      this.won = false;
      if (this.active) this.stop();
    }
    if (!this.active) return;
    if ((this.timer > .65 || this.waiting > .65) && (ctx.input.state.itemPressed || ctx.input.state.pausePressed)) { this.stop(); return; }
    if (!this.ready) {
      this.waiting += dt;
      this.caption.textContent = this.failed ? '颁奖画面暂时未能加载，可以先查看成绩' : '正在准备冠军舞台…';
      return;
    }
    this.timer += dt;
    if (this.timer >= 8.55 && !this.popped) {
      this.popped = true; ctx.bus.emit({ type: 'ui', name: 'champagne-pop' });
    }
    this.pose(this.timer);
    if (this.timer >= CEREMONY_DURATION) this.stop();
  }

  /** Also used by the CPU pose check; all motion comes from this timeline. */
  pose(t: number) {
    const p = ceremonyPose(t);
    // Let the entry jump occupy the upper frame before the title fades in.
    (this.overlay.querySelector('.kr-ceremony-heading') as HTMLElement).style.opacity = String(THREE.MathUtils.smoothstep(t, 2.1, 2.7));
    this.cat.position.set(p.x, p.y, p.z);
    this.cat.scale.setScalar(1);
    this.cat.rotation.y = 0;
    this.catMixer.setTime(Math.max(0, Math.min(t, CEREMONY_DURATION - .001)));
    this.cat.updateMatrixWorld(true);
    for (let i = 0; i < this.companions.length; i++) {
      const person = this.companions[i], side = i === 0 ? -1 : 1;
      const pose = companionPose(t, side);
      person.avatar.position.set(pose.x, pose.y, pose.z); person.avatar.rotation.y = pose.yaw;
      for (const [name, weight] of Object.entries(pose.weights)) {
        const action = person.actions[name as FamilyClip]!;
        action.setEffectiveWeight(weight);
        const duration = action.getClip().duration;
        action.time = name === 'lift' ? THREE.MathUtils.clamp(t - 16, 0, duration - .001)
          : name === 'cheer' ? THREE.MathUtils.clamp(t - 10.2, 0, duration - .001)
          : name === 'walk' ? Math.max(0, t - 13.8) % duration
          : Math.max(0, t + i * .12) % duration;
      }
      person.mixer.update(0); person.avatar.updateMatrixWorld(true);
      const support = side < 0 ? this.supportRight : this.supportLeft;
      person.arms.forEach((arm, hand) => {
        support.getWorldPosition(this.supportTarget);
        this.supportTarget.z += (hand === 0 ? 1 : -1) * side * .10;
        arm.solve(this.supportTarget, pose.contact);
      });
    }
    // Keep the complete, naturally proportioned cat. The cup and bottle sit
    // on the front corners of its step, clear of the face, fur and short paws.
    this.trophy.visible = t >= 2.35;
    this.trophy.rotation.set(0, -.14, 0);
    this.trophy.scale.setScalar(.57);
    this.trophy.position.set(.37, PODIUM_HEIGHT + .018, .54);
    this.bottle.visible = t >= 6.4;
    this.bottle.scale.setScalar(.82);
    this.bottle.rotation.set(p.spraying ? .48 : .08, 0, .12 + p.shake * .075);
    this.bottle.position.set(-.37, PODIUM_HEIGHT + .023, .54);
    // Tilting pivots about the bottle's base. Foam goes forward, away from faces.
    if (this.cork) {
      const age = Math.max(0, t - 8.55);
      this.cork.visible = age < .7;
      this.cork.position.copy(this.corkRest);
      if (age > 0 && age < .7) this.cork.position.y += age * 2.8 - age * age * 1.6;
      this.cork.rotation.z = this.cork.visible ? age * 8 : 0;
    }
    this.bottle.updateMatrixWorld(true);
    this.updateParticles(t, p.spraying);
    if (p.label !== this.label) { this.label = p.label; this.caption.textContent = p.label; }
    const portrait = this.camera.aspect < .85;
    const entry = 1 - THREE.MathUtils.smoothstep(t, 1.8, 2.8);
    const together = THREE.MathUtils.smoothstep(t, 14.5, 18.3);
    const wide = portrait ? Math.max(9.2, 6.2 / this.camera.aspect) : 6.25;
    const close = portrait ? Math.max(7.4, 3.7 / this.camera.aspect) : 4.85;
    const distance = THREE.MathUtils.lerp(wide, close, together) + entry * .5;
    const orbit = (.12 * Math.sin(Math.min(t, 26) * .17) - .13) * (1 - together);
    this.camera.position.set(Math.sin(orbit) * distance, portrait ? 2.1 : 1.85 + together * .20, Math.cos(orbit) * distance);
    this.camera.lookAt(0, 1.12 - entry * .16 + p.carry * .24, 0);
  }

  render(ctx: Ctx) {
    if (!this.ready) return false;
    this.camera.aspect = ctx.width / ctx.height;
    this.camera.updateProjectionMatrix();
    const renderer = ctx.renderer;
    const oldTone = renderer.toneMapping, oldExposure = renderer.toneMappingExposure;
    renderer.setRenderTarget(null);
    try {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.clear(true, true, true);
      renderer.render(this.scene, this.camera);
    } catch (error) {
      console.warn('颁奖画面暂时不可用，返回成绩页', error);
      this.stop(); return false;
    } finally {
      renderer.toneMapping = oldTone; renderer.toneMappingExposure = oldExposure;
    }
    return true;
  }

  private buildStage(ctx: Ctx) {
    const floor = new THREE.Mesh(new THREE.CircleGeometry(18, 64), new THREE.MeshStandardMaterial({ color: '#d5d0c7', roughness: .95 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -.015; this.scene.add(floor);
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.78, .12, 64), new THREE.MeshStandardMaterial({ color: '#253645', roughness: .6 }));
    deck.position.y = -.04; this.scene.add(deck);
    const podium = (x: number, height: number, rank: string, color: string) => {
      const shape = new THREE.Shape();
      const w = x === 0 ? 1.70 : .91, d = x === 0 ? 1.28 : .86, r = .08;
      shape.moveTo(-w/2+r,-d/2);shape.lineTo(w/2-r,-d/2);shape.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);
      shape.lineTo(w/2,d/2-r);shape.quadraticCurveTo(w/2,d/2,w/2-r,d/2);
      shape.lineTo(-w/2+r,d/2);shape.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);
      shape.lineTo(-w/2,-d/2+r);shape.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);
      const g = new THREE.ExtrudeGeometry(shape,{depth:height-.035,bevelEnabled:true,bevelSize:.025,bevelThickness:.0175,bevelSegments:3,steps:1});
      g.rotateX(-Math.PI/2);g.translate(0,.0175,0);
      const mesh = new THREE.Mesh(g,new THREE.MeshStandardMaterial({color,roughness:.35,metalness:.25}));mesh.name = 'podium-' + rank;mesh.position.x=x;this.scene.add(mesh);
      const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const c=canvas.getContext('2d')!;
      c.fillStyle='#fff8e5';c.textAlign='center';c.textBaseline='middle';c.font='900 185px sans-serif';c.fillText(rank,128,140);
      const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
      const number=new THREE.Mesh(new THREE.PlaneGeometry(.24,.24),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));
      number.position.set(x,height*.52,d/2+.026);this.scene.add(number);
    };
    podium(0,PODIUM_HEIGHT,'1','#c98939'); podium(-SIDE_PODIUM_X,.31,'2','#799ba8');podium(SIDE_PODIUM_X,.26,'3','#bc7883');
    // Reuse the already-loaded town geometry/materials; no new texture or town
    // downloads. Keep both trees behind the stage and the face in open light.
    const copyTown = (key:string,x:number,z:number,scale:number) => {
      const group=new THREE.Group();
      ctx.scene.traverse(o=>{const m=o as THREE.Mesh;if(m.isMesh&&m.userData.sourceAsset===key&&(!m.name.includes('-lod')||m.name.endsWith('-lod0'))){
        const copy=new THREE.Mesh(m.geometry,m.material);copy.frustumCulled=false;group.add(copy);
      }});
      group.position.set(x,0,z);group.scale.setScalar(scale);this.scene.add(group);
    };
    copyTown('sakura-natural-rounded',-3.6,-3.8,.65);
    copyTown('sakura-natural-sweeping',3.9,-4.1,.65);
    copyTown('merchant-house',-5.5,-8,.75);
    copyTown('townhouse-middle',4.9,-9,.8);
    // Shallow foot/contact shadows keep the cat and podium grounded without
    // enabling the race's costly dynamic shadow pass for a short cutscene.
    const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
    const c=canvas.getContext('2d')!,gradient=c.createRadialGradient(32,32,2,32,32,31);
    gradient.addColorStop(0,'#0006');gradient.addColorStop(1,'#0000');c.fillStyle=gradient;c.fillRect(0,0,64,64);
    const shadow=new THREE.Mesh(new THREE.PlaneGeometry(.85,.6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false}));
    shadow.rotation.x=-Math.PI/2;shadow.position.set(0,PODIUM_HEIGHT+.002,0);this.scene.add(shadow);
  }

  private buildParticles() {
    const foamGeometry=new THREE.BufferGeometry();
    foamGeometry.setAttribute('position',new THREE.BufferAttribute(this.foamPositions,3).setUsage(THREE.DynamicDrawUsage));
    const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d')!;
    const gradient=g.createRadialGradient(16,16,1,16,16,15);gradient.addColorStop(0,'white');gradient.addColorStop(.55,'#fff9');gradient.addColorStop(1,'#fff0');g.fillStyle=gradient;g.fillRect(0,0,32,32);
    this.foam=new THREE.Points(foamGeometry,new THREE.PointsMaterial({color:'#fff3ce',size:.048,map:new THREE.CanvasTexture(c),transparent:true,opacity:.86,depthWrite:false}));
    this.foam.frustumCulled=false;this.foam.visible=false;this.scene.add(this.foam);
    this.ribbons=new THREE.InstancedMesh(new THREE.PlaneGeometry(.025,.063),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}),150);
    this.ribbons.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.ribbons.frustumCulled=false;
    const colors=['#ffd16a','#ec85b3','#87d9d4','#fff7e4'];
    for(let i=0;i<150;i++)this.ribbons.setColorAt(i,new THREE.Color(colors[i%4]));
    this.scene.add(this.ribbons);
  }

  private updateParticles(t:number,spraying:boolean) {
    this.foam.visible=spraying;
    if(spraying){
      this.bottleMouth.getWorldPosition(this.mouth);this.bottle.getWorldQuaternion(this.q);
      this.direction.copy(UP).applyQuaternion(this.q);
      for(let i=0;i<240;i++){
        const age=((t-8.55)+i/240*1.2)%1.2,hash=Math.sin(i*127.1)*43758.5453,seed=hash-Math.floor(hash);
        const v=2.4+seed*1.7,spread=age*.28;
        this.foamPositions[i*3]=this.mouth.x+this.direction.x*v*age+Math.sin(i*2.39)*spread;
        this.foamPositions[i*3+1]=this.mouth.y+this.direction.y*v*age-2.3*age*age;
        this.foamPositions[i*3+2]=this.mouth.z+this.direction.z*v*age+Math.cos(i*1.77)*spread;
      }
      this.foam.geometry.getAttribute('position').needsUpdate=true;
    }
    this.ribbons.visible=t>=3.3;
    for(let i=0;i<150;i++){
      const age=(Math.max(0,t-3.3)+i*.057)%5.5;
      const seed=(Math.sin(i*78.233)*43758.5453)%1;
      this.dummy.position.set(Math.sin(i*4.1)*2.8+Math.sin(age*2+i)*.25,3.8-age*.66,.3+Math.cos(i*3.2)*1.9);
      this.dummy.rotation.set(age*3+seed,age*2.4+i,age*1.8);
      this.dummy.updateMatrix();this.ribbons.setMatrixAt(i,this.dummy.matrix);
    }
    this.ribbons.instanceMatrix.needsUpdate=true;
  }

  dispose(){this.unsub?.();this.overlay?.remove();}
}
const UP = new THREE.Vector3(0,1,0);
