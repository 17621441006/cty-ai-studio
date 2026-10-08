import test from 'node:test';
import assert from 'node:assert/strict';
import {starCatBounds,starShieldBounds} from '../../lib/star-cat-geometry.mjs';
import {ROUND_SECONDS, POWER_SECONDS, DAMAGE, createGame, startGame, stepGame, makeItem, collectItem, advanceItem, dragTarget, clearInput, resizeGame, formatTime} from '../../app/components/arcade/original-stars/stars-game.mjs';
const playing=()=>{const game=createGame();startGame(game);game.spawnIn=game.powerIn=game.hazardIn=Infinity;return game;};
const item=(type,game)=>({...makeItem(type,game,()=>.5),x:game.cat.x,y:game.height-25,warning:0,vx:0,vy:0});
const seconds=(game,n)=>{for(let i=0;i<Math.round(n*60);i++)stepGame(game,1/60,()=>.5);};

test('a round lasts two active minutes, with correct minutes and seconds',()=>{
 const game=playing();assert.equal(game.time,120);assert.equal(formatTime(game.time),'2:00');seconds(game,119);assert.equal(game.state,'playing');assert.equal(formatTime(game.time),'0:01');seconds(game,1);assert.equal(game.state,'over');assert.equal(game.time,0);assert.equal(formatTime(60),'1:00');
});
test('all damage, long meteor stun, soot and score floor go through real collisions',()=>{
 for(const [type,damage] of Object.entries(DAMAGE)){
  const game=playing();game.score=25;game.items=[item(type,game)];stepGame(game,1/60);
  assert.equal(game.score,25-damage.points);assert.equal(game.cat.dizzy,damage.stun);assert.equal(game.items.length,0);
  assert.equal(game.cat.soot,type==='bomb'?4:0);seconds(game,4.1);assert.equal(game.cat.soot,0);
 }
 const game=playing();collectItem(game,item('meteor',game));assert.equal(game.score,0);
});
test('flash stars protect against every hazard for five seconds and clear stun',()=>{
 const game=playing();game.cat.dizzy=2;collectItem(game,item('flash',game));assert.equal(game.cat.invincible,POWER_SECONDS);assert.equal(game.cat.dizzy,0);assert.equal(game.score,5);
 seconds(game,4.9);for(const type of Object.keys(DAMAGE))collectItem(game,item(type,game));assert.equal(game.score,5);assert.equal(game.cat.soot,0);
 seconds(game,.2);collectItem(game,item('block',game));assert.equal(game.score,2);
});
test('raised shield absorbs multiple impacts without being consumed; expires at five seconds',()=>{
 const game=playing();game.score=30;collectItem(game,item('shield',game));
 const meteor=item('meteor',game);meteor.y=game.height-43;game.items=[meteor];stepGame(game,1/60);assert.equal(game.score,30);assert.equal(game.items.length,0);
 for(const type of Object.keys(DAMAGE))collectItem(game,item(type,game));assert.equal(game.score,30);assert.equal(game.cat.dizzy,0);
 seconds(game,5);collectItem(game,item('bomb',game));assert.equal(game.score,23);assert.equal(game.cat.soot,4);
});
test('hit recovery prevents stun-lock and consecutive score deductions',()=>{
 const game=playing();game.score=100;collectItem(game,item('meteor',game));collectItem(game,item('bomb',game));assert.equal(game.score,90);assert.equal(game.cat.soot,0);seconds(game,3.5);collectItem(game,item('bomb',game));assert.equal(game.score,83);
});
test('pausing preserves remaining round, shields, stun and item positions',()=>{
 const game=playing();game.cat.shield=5;game.cat.invincible=3;game.cat.dizzy=2;game.items=[item('star',game)];game.state='paused';const before=JSON.stringify(game);stepGame(game,50);assert.equal(JSON.stringify(game),before);game.state='playing';stepGame(game,.5);assert.equal(game.cat.shield,4.5);assert.equal(game.time,119.5);
});
test('meteors fall diagonally after warning and bombs rise then descend on a parabola',()=>{
 const game=playing(),meteor=makeItem('meteor',game,()=>.25),bomb=makeItem('bomb',game,()=>.25);const mx=meteor.x,my=meteor.y;advanceItem(meteor,.5);assert.equal(meteor.x,mx);assert.equal(meteor.y,my);advanceItem(meteor,1);assert.ok(meteor.x>mx&&meteor.y>my);
 const by=bomb.y;advanceItem(bomb,1.2);assert.ok(bomb.y<by);assert.ok(bomb.vy<0);advanceItem(bomb,1.6);assert.ok(bomb.vy>0);assert.ok(bomb.y>by);assert.ok(bomb.x>0&&bomb.x<160);
});
test('phone relative drag reaches both edges, changes facing and drives paw motion',()=>{
 const game=playing();const initial=game.cat.x;
 assert.equal(dragTarget(initial,170,170,360),initial);assert.equal(dragTarget(initial,170,600,360),147);assert.equal(dragTarget(initial,170,-600,360),13);
 game.input.dragging=true;game.input.target=dragTarget(initial,170,100,360);stepGame(game,1/60);assert.equal(game.cat.face,-1);assert.equal(game.cat.x,game.input.target);assert.ok(game.cat.walkT>0&&game.cat.moving>0);
 game.input.target=130;stepGame(game,1/60);assert.equal(game.cat.face,1);assert.equal(game.cat.x,130);clearInput(game);assert.equal(game.input.dragging,false);assert.equal(game.input.target,null);assert.equal(game.cat.vx,0);
});
test('long stun holds the cat, and a new round clears every old effect and input',()=>{
 const game=playing();game.input.right=true;collectItem(game,item('meteor',game));const x=game.cat.x;seconds(game,2);assert.equal(game.cat.x,x);game.cat.shield=5;game.cat.soot=4;game.input.dragging=true;startGame(game);assert.equal(game.time,120);assert.equal(game.cat.shield,0);assert.equal(game.cat.soot,0);assert.equal(game.cat.dizzy,0);assert.equal(game.input.dragging,false);
});
test('full rounds spawn both powerups and hazards, and resize preserves flight geometry',()=>{
 const game=createGame();startGame(game);const seen=new Set();for(let i=0;i<7200;i++){stepGame(game,1/60,()=>.5);game.items.forEach(item=>seen.add(item.type));game.events.length=0;assert.ok(game.items.length<30);}
 for(const type of ['star','flash','shield','meteor','bomb'])assert.ok(seen.has(type),type);
 const resized=playing();resized.items=[makeItem('bomb',resized,()=>.25)];const before={...resized.items[0]};resizeGame(resized,240);const ratio=228/168;assert.equal(resized.items[0].y,before.y*ratio);assert.equal(resized.items[0].gravity,before.gravity*ratio);assert.equal(ROUND_SECONDS,120);
});
test('smaller visible cat has smaller collision bounds, without phantom hits from the old body size',()=>{
 const game=playing(),bounds=starCatBounds(game.cat.x,game.height-12);game.score=30;
 const outside=item('block',game);outside.x=bounds.x1+4.1;game.items=[outside];stepGame(game,1/60);
 assert.equal(game.score,30);assert.equal(game.items.length,1);
 outside.x=bounds.x1+3.9;stepGame(game,1/60);assert.equal(game.score,27);assert.equal(game.items.length,0);
});
test('moon shield catches its outer rim before the head, while stars fall through to the cat',()=>{
 const game=playing(),bounds=starShieldBounds(game.cat.x,game.height-12);game.score=30;game.cat.shield=5;
 const hazard=item('block',game);hazard.x=bounds.x1+3.9;hazard.y=bounds.y0+1;
 const star=item('star',game);star.y=(bounds.y0+bounds.y1)/2;game.items=[hazard,star];stepGame(game,1/60);
 assert.equal(game.score,30);assert.equal(game.items.length,1);assert.equal(game.items[0],star);assert.equal(game.events[0].kind,'blocked');
 star.y=game.height-20;stepGame(game,1/60);assert.equal(game.score,31);assert.equal(game.items.length,0);
});
