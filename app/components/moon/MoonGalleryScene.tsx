'use client';
import {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import * as THREE from 'three';
import {useAnimationClock} from '../AnimationScope';
import {moonCameraDistance, moonFramePose, nearestAngle, type MoonWork} from '@/lib/moon-gallery';
import type {AppId} from '@/lib/desktop-apps';
import {moonFrameTurn} from '@/lib/moon-motion';
import {createFrameGeometry, createLunarStars, createMosaicMoon, pickMoonExhibit} from './moon-model';

export type MoonGalleryHandle = {focus: (id: AppId) => void; activate: (id: AppId) => void};
export type MoonGallerySnapshot = {yaw: number; pitch: number; elapsed: number; orbitTime: number; works: string};
export type MoonGalleryProps = {works: MoonWork[]; selected: AppId; paused: boolean; memory: {current: MoonGallerySnapshot | null}; onSelect: (id: AppId) => void; onOpen: (id: AppId) => void; onReady: () => void; onFallback: () => void};
type Frame = {work: MoonWork; anchor: THREE.Group; group: THREE.Group; picture: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>; reverse: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>; gold: THREE.MeshStandardMaterial; canvas: HTMLCanvasElement; texture: THREE.CanvasTexture; reverseTexture: THREE.CanvasTexture; pose: ReturnType<typeof moonFramePose>};
type Controller = MoonGalleryHandle & {setWorks: (works: MoonWork[], selected: AppId) => void};
const ease = (value: number) => 1 - (1 - value) ** 3;

function paintExhibit(canvas: HTMLCanvasElement, work: MoonWork, image?: CanvasImageSource & {width: number; height: number}) {
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  const w = canvas.width, h = canvas.height, pictureHeight = h - 46;
  ctx.fillStyle = '#07182c'; ctx.fillRect(0, 0, w, h);
  if (image && work.id === 'zp-stars') {
    // Recreate the falling-star scene around the familiar, instead of using an unrelated cover.
    ctx.fillStyle = '#0b2344'; ctx.fillRect(0, 0, w, pictureHeight);
    for (let i = 0; i < 25; i++) {ctx.fillStyle = i % 4 ? '#789dbc' : '#e5c773'; ctx.fillRect((i * 61 + 19) % w, (i * 43 + 15) % (pictureHeight - 20), 2, 2);}
    ctx.fillStyle = '#edd59a'; ctx.font = '34px serif'; ctx.fillText('★', 70, 63); ctx.fillText('★', 248, 133); ctx.fillText('★', 154, 93);
    ctx.fillStyle = '#448ac3'; ctx.fillRect(285, 43, 17, 17);
    ctx.fillStyle = '#cfbb87'; ctx.fillRect(0, pictureHeight - 13, w, 3);
    ctx.drawImage(image, w / 2 - 42, pictureHeight - 99, 80, 86);
  } else if (image) {
    const crop = Math.max(w / image.width, pictureHeight / image.height), sw = w / crop, sh = pictureHeight / crop;
    ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, 0, 0, w, pictureHeight);
  } else {
    // A real title card while its small cover arrives, never a desktop icon.
    ctx.fillStyle = '#173350'; ctx.fillRect(8, 8, w - 16, pictureHeight - 16);
    ctx.fillStyle = '#b5cbd3'; ctx.font = '20px monospace'; ctx.textAlign = 'center'; ctx.fillText(work.category, w / 2, pictureHeight / 2);
  }
  ctx.textAlign = 'left'; ctx.fillStyle = '#ddbd74'; ctx.fillRect(0, pictureHeight, w, 2);
  ctx.fillStyle = '#f5e2af'; ctx.font = '18px system-ui, sans-serif';
  let title = work.name; while (ctx.measureText(title).width > w - 34) title = title.slice(0, -1);
  ctx.fillText(title + (title !== work.name ? '…' : ''), 14, h - 15);
}

const MoonGalleryScene = forwardRef<MoonGalleryHandle, MoonGalleryProps>(function MoonGalleryScene(props, ref) {
  const host = useRef<HTMLDivElement>(null), tooltip = useRef<HTMLDivElement>(null), callbacks = useRef(props), controller = useRef<Controller | null>(null);
  callbacks.current = props;
  const clock = useAnimationClock();
  useImperativeHandle(ref, () => ({focus: id => controller.current?.focus(id), activate: id => controller.current?.activate(id)}), []);
  useEffect(() => {
    const mount = host.current; if (!mount) return;
    const compact = matchMedia('(max-width: 759px), (pointer: coarse)').matches;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let renderer: THREE.WebGLRenderer;
    try {renderer = new THREE.WebGLRenderer({alpha: true, antialias: !compact, powerPreference: 'low-power'});} catch {callbacks.current.onFallback(); return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, compact ? 1.35 : 1.7));
    renderer.setClearColor(0x030b19, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
    const canvas = renderer.domElement; canvas.setAttribute('aria-hidden', 'true'); mount.insertBefore(canvas, mount.firstChild);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(42, 1, .1, 200);
    const world = new THREE.Group(), globe = new THREE.Group(); scene.add(world); world.add(globe); world.rotation.z = -.045;
    globe.add(createMosaicMoon(compact)); scene.add(createLunarStars());
    scene.add(new THREE.HemisphereLight('#d7ebff', '#58677d', 2.0));
    const key = new THREE.DirectionalLight('#fff1cf', 3.0); key.position.set(-7, 10, 13); scene.add(key);
    const fill = new THREE.DirectionalLight('#77bafa', .8); fill.position.set(7, -3, -6); scene.add(fill);
    const orbit = new THREE.Group(); scene.add(orbit); orbit.rotation.z = -.26;
    const ellipse = new THREE.EllipseCurve(0, 0, 6.95, 5.75, 0, Math.PI * 2, false, 0);
    const orbitPoints = ellipse.getPoints(160).map(point => new THREE.Vector3(point.x, point.y, -1.6));
    orbit.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(orbitPoints), new THREE.LineBasicMaterial({color: '#c7a963', transparent: true, opacity: .42})));
    const beadGeometry = new THREE.BoxGeometry(.08, .08, .08), beadMaterial = new THREE.MeshBasicMaterial({color: '#f2d68e'});
    const beads = Array.from({length: 4}, () => {const bead = new THREE.Mesh(beadGeometry, beadMaterial); orbit.add(bead); return bead;});
    const sparkleGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.13, 0, 0), new THREE.Vector3(.13, 0, 0), new THREE.Vector3(0, -.13, 0), new THREE.Vector3(0, .13, 0)]);
    const sparkleMaterial = new THREE.LineBasicMaterial({color: '#cfb675', transparent: true, opacity: .75});
    for (let i = 0; i < 10; i++) {const star = new THREE.LineSegments(sparkleGeometry, sparkleMaterial); star.position.set(Math.sin(i * 2.4) * (8 + i), Math.cos(i * 1.7) * (5 + i / 2), -4); scene.add(star);}
    const frameGeometry = createFrameGeometry(), planeGeometry = new THREE.PlaneGeometry(1.78, 1.3), backGeometry = new THREE.BoxGeometry(1.86, 1.38, .13);
    const backMaterial = new THREE.MeshStandardMaterial({color: '#293342', roughness: 1});
    const saved = callbacks.current.memory.current;
    let frames: Frame[] = [], disposed = false, request = 0, width = 1, height = 1, lastRender = 0, start = -1, elapsed = saved?.elapsed ?? 0, orbitTime = saved?.orbitTime ?? 0;
    let dirty = true, hoverDirty = false, hovered: Frame | undefined, down = false, pointerId = -1, travel = 0, lastX = 0, lastY = 0, vx = 0, vy = 0, holdUntil = 0;
    let yaw = saved?.yaw ?? .17, pitch = saved?.pitch ?? .08, target: {yaw: number; pitch: number} | null = null, loading = new AbortController();
    let restored = false, nextFlip = elapsed + 4.2, flipIndex = 0;
    let flip: {frame: Frame; progress: number; duration: number; open: boolean} | null = null;
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(5, 5);
    const images = new Map<string, ImageBitmap>(), imageAbort = new AbortController();
    let textureGeneration = 0;
    const resize = () => {width = Math.max(1, mount.clientWidth); height = Math.max(1, mount.clientHeight); renderer.setSize(width, height, false); camera.aspect = width / height; camera.position.set(0, 0, moonCameraDistance(camera.aspect)); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld(); dirty = true;};
    const observer = new ResizeObserver(resize); observer.observe(mount); resize();
    const imageFor = async (url: string, signal: AbortSignal) => {
      if (images.has(url)) return images.get(url)!;
      const response = await fetch(url, {signal}); if (!response.ok) throw Error('cover unavailable');
      const blob = await response.blob(); if (signal.aborted || disposed) throw Error('closed');
      const bitmap = await createImageBitmap(blob, {resizeWidth: 512, resizeQuality: 'medium'});
      if (signal.aborted || disposed) {bitmap.close(); throw Error('closed');}
      if (images.has(url)) {bitmap.close(); return images.get(url)!;}
      images.set(url, bitmap); return bitmap;
    };
    // This tiny, transparent familiar belongs on the pole, never across the exhibits.
    imageFor('/assets/scenery/cat-sitting.webp', imageAbort.signal).then(bitmap => {
      if (disposed) return;
      const sheet = document.createElement('canvas'); sheet.width = 192; sheet.height = 204;
      sheet.getContext('2d')?.drawImage(bitmap, 0, 0, 192, 204);
      const texture = new THREE.CanvasTexture(sheet); texture.colorSpace = THREE.SRGBColorSpace;
      const cat = new THREE.Sprite(new THREE.SpriteMaterial({map: texture, transparent: true, alphaTest: .12, depthWrite: false, toneMapped: false}));
      cat.position.set(0, 5.71, 0); cat.scale.set(.83, .89, 1); globe.add(cat); dirty = true;
    }).catch(() => {});
    function clearHover() {hovered = undefined; if (tooltip.current) tooltip.current.hidden = true; canvas.style.cursor = down ? 'grabbing' : 'grab';}
    function pick(): Frame | undefined {
      if (!saved && elapsed < 1.6 && !reduce.matches) return;
      world.updateMatrixWorld(true); raycaster.setFromCamera(pointer, camera);
      const hit = pickMoonExhibit(raycaster, frames.flatMap(frame => [frame.picture, frame.reverse]));
      return hit ? frames.find(frame => frame.picture === hit || frame.reverse === hit) : undefined;
    }
    function updateHover() {
      const next = down || flip?.open ? undefined : pick();
      if (next !== hovered) {hovered = next; dirty = true; if (next) callbacks.current.onSelect(next.work.id);}
      const label = tooltip.current;
      if (label) {
        label.hidden = !next;
        if (next) {label.textContent = next.work.name + ' ↗'; label.style.left = `${Math.max(8, Math.min(width - 250, (pointer.x + 1) * width / 2 - 65))}px`; label.style.top = `${Math.max(8, Math.min(height - 44, (1 - pointer.y) * height / 2 + 20))}px`;}
      }
      canvas.style.cursor = down ? 'grabbing' : next ? 'pointer' : 'grab';
    }
    const focus = (id: AppId) => {
      const frame = frames.find(item => item.work.id === id); if (!frame) return;
      target = {yaw: nearestAngle(yaw, -frame.pose.longitude), pitch: frame.pose.latitude}; vx = vy = 0; holdUntil = elapsed + 4.5; dirty = true; clearHover();
      if (reduce.matches) {yaw = target.yaw; pitch = target.pitch; target = null;}
    };
    const activate = (id: AppId) => {
      if (flip?.open) return;
      const frame = frames.find(item => item.work.id === id); if (!frame) return;
      callbacks.current.onSelect(id); holdUntil = elapsed + 4; vx = vy = 0; clearHover();
      if (reduce.matches) {callbacks.current.onOpen(id); return;}
      flip = {frame, progress: 0, duration: .78, open: true}; dirty = true;
    };
    function clearFrames() {flip = null; for (const frame of frames) {globe.remove(frame.anchor); frame.gold.dispose(); frame.picture.material.dispose(); frame.reverse.material.dispose(); frame.texture.dispose(); frame.reverseTexture.dispose();} frames = [];}
    function setWorks(works: MoonWork[], selected: AppId) {
      loading.abort(); loading = new AbortController(); const signal = loading.signal, generation = ++textureGeneration;
      clearHover(); clearFrames();
      frames = works.map((work, index) => {
        const pose = moonFramePose(index, works.length), anchor = new THREE.Group(), group = new THREE.Group();
        anchor.position.set(pose.x, pose.y, pose.z); anchor.lookAt(anchor.position.clone().multiplyScalar(2)); anchor.add(group);
        const gold = new THREE.MeshStandardMaterial({color: '#dfbe77', metalness: .48, roughness: .44, emissive: '#aa6f17', emissiveIntensity: .035});
        group.add(new THREE.Mesh(frameGeometry, gold));
        const backing = new THREE.Mesh(backGeometry, backMaterial); backing.position.z = -.055; group.add(backing);
        const sheet = document.createElement('canvas'); sheet.width = 384; sheet.height = 280; paintExhibit(sheet, work);
        const texture = new THREE.CanvasTexture(sheet); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        const picture = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({map: texture, toneMapped: false})); picture.position.z = .089; group.add(picture);
        const reverseSheet = document.createElement('canvas'); reverseSheet.width = 384; reverseSheet.height = 280; paintExhibit(reverseSheet, work);
        const ctx = reverseSheet.getContext('2d'); if (ctx) {ctx.textAlign = 'center'; ctx.fillStyle = '#dfbe77'; ctx.font = '14px monospace'; ctx.fillText('CTY / LUNAR ARCHIVE', 192, 49); ctx.font = '14px system-ui'; ctx.fillText('轻触，打开这份灵感', 192, 181);}
        const reverseTexture = new THREE.CanvasTexture(reverseSheet); reverseTexture.colorSpace = THREE.SRGBColorSpace;
        const reverse = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({map: reverseTexture, toneMapped: false})); reverse.position.z = -.125; reverse.rotation.y = Math.PI; group.add(reverse); globe.add(anchor);
        return {work, anchor, group, gold, canvas: sheet, texture, picture, reverse, reverseTexture, pose};
      });
      if (restored || !saved || saved.works !== works.map(work => work.id).join('|')) focus(selected);
      else holdUntil = elapsed + 2;
      restored = true; dirty = true;
      // Three small thumbnails at a time; stale orbit requests are cancelled.
      const queue = [...frames].sort((a, b) => Number(b.work.id === selected) - Number(a.work.id === selected));
      const loadNext = async () => {
        while (queue.length && !signal.aborted && !disposed) {
          const frame = queue.shift()!;
          try {const bitmap = await imageFor(frame.work.cover, signal); if (disposed || signal.aborted || generation !== textureGeneration) return; paintExhibit(frame.canvas, frame.work, bitmap); frame.texture.needsUpdate = true; dirty = true;} catch {if (signal.aborted) return;}
        }
      };
      for (let i = 0; i < 3; i++) void loadNext();
    }
    controller.current = {focus, activate, setWorks};
    const pointerPosition = (event: PointerEvent) => {const rect = canvas.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);};
    const pointerDown = (event: PointerEvent) => {if (event.button !== 0 || down || flip?.open) return; pointerPosition(event); down = true; pointerId = event.pointerId; lastX = event.clientX; lastY = event.clientY; travel = 0; vx = vy = 0; target = null; canvas.setPointerCapture(pointerId); clearHover();};
    const pointerMove = (event: PointerEvent) => {
      pointerPosition(event); hoverDirty = true;
      if (!down || event.pointerId !== pointerId) return;
      const dx = event.clientX - lastX, dy = event.clientY - lastY; travel += Math.hypot(dx, dy); lastX = event.clientX; lastY = event.clientY;
      vx = dx / Math.min(width, height) * 3.8; vy = dy / Math.min(width, height) * 2.5;
      yaw += vx; pitch = THREE.MathUtils.clamp(pitch + vy, -1.12, 1.12); dirty = true; holdUntil = elapsed + 3;
    };
    const release = (event: PointerEvent) => {if (event.pointerId !== pointerId) return; const click = down && travel < 8 && event.type !== 'pointercancel'; down = false; pointerId = -1; if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); pointerPosition(event); if (reduce.matches) vx = vy = 0; if (click) {const frame = pick(); if (frame) activate(frame.work.id);} hoverDirty = true; dirty = true;};
    const leave = () => {if (!down) {pointer.set(5, 5); clearHover(); dirty = true;}};
    const cancelDrag = () => {down = false; pointerId = -1; vx = vy = 0; pointer.set(5, 5); clearHover(); dirty = true;};
    const lost = (event: Event) => {event.preventDefault(); callbacks.current.onFallback();};
    const motion = () => {dirty = true; if (reduce.matches) vx = vy = 0;}; reduce.addEventListener('change', motion);
    canvas.addEventListener('pointerdown', pointerDown); canvas.addEventListener('pointermove', pointerMove); canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release); canvas.addEventListener('pointerleave', leave); canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('lostpointercapture', cancelDrag); window.addEventListener('blur', cancelDrag);
    const render = (now: number) => {
      if (disposed) return; request = clock.requestFrame(render);
      if (compact && now - lastRender < 32) return;
      if (start < 0) start = now - (saved?.elapsed ?? 0) * 1000;
      const dt = Math.min(.05, (now - lastRender) / 1000 || .016); lastRender = now; elapsed = (now - start) / 1000;
      const intro = saved || reduce.matches ? 1 : ease(Math.min(1, elapsed / 1.7));
      const auto = !callbacks.current.paused && !reduce.matches && !down && !hovered && !target && !flip?.open && elapsed > holdUntil;
      let moving = auto || down || intro < 1;
      if (target) {
        const amount = 1 - Math.exp(-dt * 7); yaw += (target.yaw - yaw) * amount; pitch += (target.pitch - pitch) * amount; moving = true;
        if (Math.abs(target.yaw - yaw) + Math.abs(target.pitch - pitch) < .002) {yaw = target.yaw; pitch = target.pitch; target = null;}
      } else if (!down && !reduce.matches && Math.abs(vx) + Math.abs(vy) > .0001) {
        yaw += vx * dt * 42; pitch = THREE.MathUtils.clamp(pitch + vy * dt * 42, -1.12, 1.12); vx *= Math.exp(-dt * 7); vy *= Math.exp(-dt * 7); moving = true;
      } else if (auto) yaw += dt * .042;
      world.scale.setScalar(.45 + intro * .55); globe.rotation.set(pitch, yaw + (1 - intro) * 1.35, 0, 'XYZ');
      if (auto && !flip && elapsed > nextFlip) {
        world.updateMatrixWorld(true);
        const visible = frames.filter(frame => {const normal = new THREE.Vector3(0, 0, 1).transformDirection(frame.anchor.matrixWorld), at = frame.anchor.getWorldPosition(new THREE.Vector3()); return normal.dot(camera.position.clone().sub(at).normalize()) > .7;});
        if (visible.length) flip = {frame: visible[flipIndex++ % visible.length], progress: 0, duration: 1.45, open: false};
        nextFlip = elapsed + 7.5;
      }
      let completed: AppId | undefined;
      if (flip) {
        const advancing = !callbacks.current.paused || flip.open;
        if (advancing) flip.progress += dt / flip.duration;
        if (reduce.matches) flip.progress = 1;
        if (flip.progress >= 1) {if (flip.open) completed = flip.frame.work.id; flip = null; nextFlip = elapsed + 7.5;}
        moving = moving || advancing;
      }
      for (const frame of frames) {
        const turning = flip?.frame === frame ? moonFrameTurn(flip.progress) : {angle: 0, lift: 0};
        const hoverLift = frame === hovered && !reduce.matches ? .2 : 0, lift = turning.lift + hoverLift;
        if (Math.abs(frame.group.position.z - lift) > .001) moving = true;
        frame.group.position.z = flip?.frame === frame ? lift : THREE.MathUtils.lerp(frame.group.position.z, lift, 1 - Math.exp(-dt * 12));
        frame.group.rotation.y = turning.angle;
        frame.group.rotation.z = frame === hovered && !reduce.matches ? -.035 : 0;
        frame.gold.emissiveIntensity = frame === hovered ? .55 : frame.work.id === callbacks.current.selected ? .2 : .035;
      }
      if (!moving && !dirty && !hoverDirty && !completed) return;
      if (hoverDirty) {updateHover(); hoverDirty = false;}
      if (!reduce.matches && !callbacks.current.paused) orbitTime += dt * .06;
      beads.forEach((bead, index) => {const angle = index * Math.PI / 2 + orbitTime; bead.position.set(Math.cos(angle) * 6.95, Math.sin(angle) * 5.75, -1.6);});
      renderer.render(scene, camera); dirty = false;
      if (completed) callbacks.current.onOpen(completed);
    };
    request = clock.requestFrame(render); callbacks.current.onReady();
    return () => {
      callbacks.current.memory.current = {yaw, pitch, elapsed, orbitTime, works: frames.map(frame => frame.work.id).join('|')};
      disposed = true; loading.abort(); imageAbort.abort(); controller.current = null; clock.cancelFrame(request); observer.disconnect(); reduce.removeEventListener('change', motion);
      canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointermove', pointerMove); canvas.removeEventListener('pointerup', release); canvas.removeEventListener('pointercancel', release); canvas.removeEventListener('pointerleave', leave); canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('lostpointercapture', cancelDrag); window.removeEventListener('blur', cancelDrag);
      clearFrames(); const geometries = new Set<THREE.BufferGeometry>([frameGeometry, planeGeometry, backGeometry]), materials = new Set<THREE.Material>([backMaterial]), textures = new Set<THREE.Texture>();
      scene.traverse(object => {const mesh = object as THREE.Mesh; if (mesh.geometry) geometries.add(mesh.geometry); if (mesh.material) for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {materials.add(material); for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);} if (object instanceof THREE.InstancedMesh) object.dispose();});
      textures.forEach(texture => texture.dispose()); materials.forEach(material => material.dispose()); geometries.forEach(geometry => geometry.dispose()); images.forEach(bitmap => bitmap.close()); images.clear(); renderer.dispose(); canvas.remove();
    };
  }, [clock]);
  useEffect(() => {controller.current?.setWorks(props.works, callbacks.current.selected);}, [props.works]);
  return <div ref={host} className="moon-webgl"><div ref={tooltip} className="moon-frame-tooltip" hidden/></div>;
});
export default MoonGalleryScene;
