import assert from'node:assert/strict';import{pounceScale,spriteSample,drawSprite,boundedVisualX,RunCycle}from'../../public/games/maple-moon-duel/sprite-sampling.mjs';import{CHARACTER}from'../../public/games/maple-moon-duel/layout.mjs';
for(const kind of['cat','xiaosi'])for(const face of[-1,1])for(let f=0;f<16;f++){
 const q=spriteSample(kind,{row:1,frame:f/2},CHARACTER[kind],{walkFrame:f});let calls=0;const c={globalAlpha:1,drawImage(...args){calls++;assert.equal(this.globalAlpha,1);assert(args.slice(1).every(Number.isFinite))}};drawSprite(c,{},q,CHARACTER[kind].height);assert.equal(calls,1);assert.equal(q.sx,f%8*256);assert.equal(q.sy,Math.floor(f/8)*320);
}
assert.equal(pounceScale(null),1);assert.equal(pounceScale({phase:'flight',flightAge:.2,interrupted:true}),2.1);assert.equal(pounceScale({phase:'impact',impactAge:.17}),2.1);assert.equal(pounceScale({phase:'impact',impactAge:.35}),1);
for(const x of[100,1500]){const v=boundedVisualX(x,2.1,286),half=286*2.1*.4;assert(v-half>=0&&v+half<=1600)}
for(const face of[-1,1]){const w=new RunCycle(),a={x:800};w.frame(a,true);for(let i=0;i<16;i++){a.x+=face*210/16;assert.equal(w.frame(a,true),(i+1)%16)}}
console.log('PASS64 run samples each one full-opacity draw; distance gait both directions; interrupted P2.1x through impact; shrink+wall visual bounds');
for(const px of[128,171])for(const face of[-1,1])for(const x of[90,100,1500,1510])for(const size of[1.1,1.6,2.1]){
 let l=286*size*px/320,r=286*size*(256-px)/320;if(face<0)[l,r]=[r,l];const v=boundedVisualX(x,size,286,px,face);assert(v-l>=-1e-9&&v+r<=1600+1e-9);
}
console.log('PASS actual cat pivots mirrored at both walls throughout growth');
for(let frame=0;frame<16;frame++){
 const s=spriteSample('cat',{row:5,frame},CHARACTER.cat);assert.equal(s.key,'cat-charm');assert.equal(s.sx,frame%8*256);assert.equal(s.sy,Math.floor(frame/8)*320);assert.equal(s.px,128);assert.equal(s.py,300);
}
console.log('PASS all16 articulated prone charm samples, own atlas and grounded pivot');
