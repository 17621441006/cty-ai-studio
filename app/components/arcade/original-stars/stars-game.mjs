/** Small, deterministic game model. Timers advance only while a round is playing. */
export const ROUND_SECONDS = 120;
export const POWER_SECONDS = 5;
export const WIDTH = 160;
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const DAMAGE = {block: {points: 3, stun: .7}, meteor: {points: 10, stun: 2.8}, bomb: {points: 7, stun: 1.4}};
export const isHazard = type => Object.hasOwn(DAMAGE, type);
export const formatTime = seconds => `${Math.floor(Math.max(0, Math.ceil(seconds - 1e-7)) / 60)}:${String(Math.max(0, Math.ceil(seconds - 1e-7)) % 60).padStart(2, '0')}`;
export function createGame(height = 180) {
  return {state: 'title', height, score: 0, time: ROUND_SECONDS, combo: 0, maxCombo: 0, caught: 0,
    cat: {x: WIDTH / 2, vx: 0, face: 1, walkT: 0, moving: 0, dizzy: 0, invincible: 0, shield: 0, hurtGrace: 0, soot: 0},
    items: [], events: [], clock: 0, spawnIn: .5, powerIn: 4, nextPower: 'flash', hazardIn: 7, nextHazard: 'meteor',
    input: {left: false, right: false, target: null, dragging: false}};
}
export function startGame(game) { Object.assign(game, createGame(game.height), {state: 'playing'}); }
export function clearInput(game) { Object.assign(game.input, {left: false, right: false, target: null, dragging: false}); game.cat.vx = 0; }
export function resizeGame(game, height) {
  const scale = (height - 12) / (game.height - 12);
  for (const item of game.items) { item.y *= scale; item.vy *= scale; item.gravity *= scale; }
  game.height = height;
}
export function makeItem(type, game, random = Math.random) {
  const difficulty = 1 - game.time / ROUND_SECONDS, scale = game.height / 180;
  const item = {type, x: 10 + random() * 140, y: -8, vx: 0, vy: (34 + difficulty * 19 + random() * 8) * scale, gravity: 0, age: 0, warning: 0, dead: false};
  if (type === 'block') { item.vy *= 1.3; item.vx = (random() - .5) * 10; }
  if (type === 'flash' || type === 'shield') item.vy *= .78;
  if (type === 'meteor') {
    const direction = random() < .5 ? 1 : -1;
    item.x = direction > 0 ? 8 + random() * 30 : 122 + random() * 30;
    item.vx = direction * (25 + random() * 9); item.vy = (65 + difficulty * 20) * scale; item.warning = .85;
  }
  if (type === 'bomb') {
    const direction = random() < .5 ? 1 : -1;
    item.x = direction > 0 ? -5 : WIDTH + 5; item.y = game.height * .2;
    item.vx = direction * (26 + random() * 7); item.vy = -34 * scale; item.gravity = 42 * scale; item.warning = .7;
  }
  return item;
}
export function advanceItem(item, dt) {
  if (item.warning > 0) {
    const wait = Math.min(item.warning, dt); item.warning -= wait; dt -= wait;
  }
  item.age += dt;
  item.x += item.vx * dt;
  item.y += item.vy * dt + .5 * item.gravity * dt * dt;
  item.vy += item.gravity * dt;
}
export function collectItem(game, item) {
  item.dead = true;
  const cat = game.cat;
  if (isHazard(item.type)) {
    if (cat.invincible > 0 || cat.shield > 0 || cat.hurtGrace > 0) {
      game.events.push({kind: 'blocked', type: item.type, x: item.x, y: item.y}); return;
    }
    const damage = DAMAGE[item.type];
    game.score = Math.max(0, game.score - damage.points); game.combo = 0;
    cat.dizzy = damage.stun; cat.hurtGrace = damage.stun + .65; cat.vx = 0;
    if (item.type === 'bomb') cat.soot = 4;
    game.events.push({kind: 'hit', type: item.type, points: damage.points, x: item.x, y: item.y}); return;
  }
  if (item.type === 'shield') {
    cat.shield = POWER_SECONDS; cat.dizzy = 0;
    game.events.push({kind: 'power', type: 'shield', x: item.x, y: item.y}); return;
  }
  if (item.type === 'flash') { cat.invincible = POWER_SECONDS; cat.dizzy = 0; cat.soot = 0; }
  game.caught++; game.combo++; game.maxCombo = Math.max(game.maxCombo, game.combo);
  const points = item.type === 'flash' || item.type === 'big' ? 5 : 1 + (game.combo >= 10 ? 2 : game.combo >= 5 ? 1 : 0);
  game.score += points;
  game.events.push({kind: 'catch', type: item.type, points, x: item.x, y: item.y});
}
export function stepGame(game, dt, random = Math.random) {
  if (game.state !== 'playing') return;
  dt = Math.min(Math.max(dt, 0), game.time);
  game.time = Math.max(0, game.time - dt); if(game.time<1e-7)game.time=0; game.clock += dt;
  const cat = game.cat;
  for (const key of ['dizzy', 'invincible', 'shield', 'hurtGrace', 'soot', 'moving']) cat[key] = Math.max(0, cat[key] - dt);
  if (game.time === 0) { game.state = 'over'; clearInput(game); game.events.push({kind: 'over'}); return; }
  let direction = Number(game.input.right) - Number(game.input.left);
  if (!direction && game.input.target != null) direction = clamp((game.input.target - cat.x) / 5, -1, 1);
  if (cat.dizzy > 0) direction = 0;
  cat.vx += (direction * 125 - cat.vx) * (1 - Math.exp(-22 * dt));
  const before = cat.x;
  cat.x = clamp(cat.x + cat.vx * dt, 13, WIDTH - 13);
  if(game.input.dragging && game.input.target != null && cat.dizzy <= 0) {
    cat.x = clamp(game.input.target, 13, WIDTH - 13);
    cat.vx = (cat.x-before)/Math.max(dt,.001);
  }
  if (Math.abs(cat.x - before) > .03) { cat.face = cat.x > before ? 1 : -1; cat.walkT += Math.abs(cat.x - before) / 85; cat.moving = .1; }
  else cat.vx = 0;
  game.spawnIn -= dt; game.powerIn -= dt; game.hazardIn -= dt;
  if (game.spawnIn <= 0) {
    game.items.push(makeItem(random() < .19 ? 'block' : 'star', game, random));
    game.spawnIn = (.7 - (1 - game.time / ROUND_SECONDS) * .22) * (.85 + random() * .3);
  }
  if (game.powerIn <= 0) {
    game.items.push(makeItem(game.nextPower, game, random));
    game.nextPower = game.nextPower === 'flash' ? 'shield' : 'flash'; game.powerIn = 7 + random() * 2;
  }
  if (game.hazardIn <= 0) {
    game.items.push(makeItem(game.nextHazard, game, random));
    game.nextHazard = game.nextHazard === 'meteor' ? 'bomb' : 'meteor'; game.hazardIn = 5 + random() * 3;
  }
  const floor = game.height - 12;
  for (const item of game.items) {
    advanceItem(item, dt);
    if (item.warning > 0) continue;
    const radius = item.type === 'meteor' ? 5 : item.type === 'star' ? 3 : 4;
    const protectedTop = cat.shield > 0 && isHazard(item.type) ? floor - 32 : floor - 23;
    if (item.x + radius > cat.x - 10.5 && item.x - radius < cat.x + 10.5 && item.y + radius > protectedTop && item.y - radius < floor) collectItem(game, item);
    else if (item.y > floor + 3 || item.x < -24 || item.x > WIDTH + 24) {
      item.dead = true;
      if (item.type === 'star') game.combo = 0;
      if (isHazard(item.type) && item.y > floor) game.events.push({kind: 'ground', type: item.type, x: item.x, y: floor});
    }
  }
  game.items = game.items.filter(item => !item.dead);
}
/** Relative drag: touching an empty area never teleports the cat under the finger. */
export function dragTarget(startCatX, startClientX, clientX, canvasWidth) {
  return clamp(startCatX + (clientX - startClientX) / Math.max(1, canvasWidth) * WIDTH, 13, WIDTH - 13);
}
