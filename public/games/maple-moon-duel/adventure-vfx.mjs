import {ParticleVFX} from './particle-vfx.mjs';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const LIVE_TYPES=new Set(['slash','cast','charge','ultimate','burst','hit','block','guardbreak','dash','land','special']);
/** Cosmetic only. 1600x900 world, depth-positive terrace ground = 480+depth.
 * Warning footprints/projectiles belong to the adventure renderer, not this layer.
 */
export class AdventureVFX{
 constructor(){this.groups=[];this.impacts=[];this.painter=new ParticleVFX();this.reduced=false;}
 reset(){for(const g of this.groups)g.vfx.reset();this.groups=[];this.impacts=[];this.painter.reset();}
 get particleCount(){return this.groups.reduce((n,g)=>n+g.vfx.particles.length,0)+this.painter.particles.length;}
 feed(ev){
  if(!ev)return;
  if(ev.type==='hazard'){
   if(ev.phase!=='impact'||!ev.hazard)return;
   const h=ev.hazard;this.impacts.push({kind:h.kind,x:h.x,ground:480+(h.depth||0),rx:h.rx||80,rd:h.rd||30,t:0,life:h.kind==='storm'?1.1:h.kind==='slam'?1.15:.75,seed:h.id||1,face:h.owner?.face||1});
   if(this.impacts.length>12)this.impacts.splice(0,this.impacts.length-12);return;
  }
  if(!ev.actor||!LIVE_TYPES.has(ev.type))return;
  const a=ev.actor,ground=480+(a.depth||0);
  // Keep phase events on their original depth layer, but unrelated casts capture
  // their own footprint rather than dragging a previous eruption across lanes.
  let g=ev.type==='special'&&ev.phase!=='start'||ev.type==='land'&&ev.skill==='pounce'?this.groups.findLast(g=>g.actor===a&&g.vfx.effects.some(f=>f.type===(ev.skill==='launch'?'launcher':ev.skill))):null;
  g??=this.groups.findLast(g=>g.actor===a&&Math.abs(g.ground-ground)<2);
  if(!g){
   const vfx=new ParticleVFX();g={actor:a,ground,vfx};this.groups.push(g);
   const spray=vfx.spray.bind(vfx);
   vfx.spray=(x,y,n,...args)=>{const remaining=Math.max(0,96-this.particleCount);spray(x,y,Math.min(n,remaining),...args);};
   if(this.groups.length>12)this.groups.shift();
  }
  g.vfx.ground=g.ground;g.vfx.reduced=this.reduced;g.vfx.emit(ev);
  let excess=this.groups.reduce((n,q)=>n+q.vfx.effects.length,0)-24;
  for(const q of this.groups){if(excess<=0)break;const n=Math.min(excess,q.vfx.effects.length);q.vfx.effects.splice(0,n);excess-=n;}
 }
 draw(ctx,dt,{reduced=false,assets={}}={}){
  dt=clamp(Number(dt)||0,0,.05);this.reduced=reduced;this.painter.reduced=reduced;
  for(const g of [...this.groups].sort((a,b)=>a.ground-b.ground))g.vfx.draw(ctx,dt,{reduced,assets,ground:g.ground});
  this.groups=this.groups.filter(g=>g.vfx.effects.length||g.vfx.particles.length);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  for(const f of this.impacts){f.t+=dt;this.impact(ctx,f);}
  ctx.restore();this.impacts=this.impacts.filter(f=>f.t<f.life);
 }
 impact(c,f){
  const p=clamp(f.t/f.life),q=1-p,x=f.x,g=f.ground,v=this.painter;
  // Impacts land on their actual hazard footprint; no full-floor opaque wash.
  if(f.kind==='slam'){
   const fall=clamp(f.t/.16),head=g-20-(1-fall)*360;
   v.glow(c,x,head,150,180,'#bd92ff',q*.6);
   v.bolt(c,x-55,head-180,x,head,f.seed,f.t,'#e7ccff',4,q,false);
   c.save();c.translate(x,head);c.rotate(-.35);c.globalAlpha=q;c.fillStyle='#ceb3ff';c.beginPath();c.moveTo(0,-58);c.lineTo(38,-20);c.lineTo(24,28);c.lineTo(-25,35);c.lineTo(-40,-12);c.closePath();c.fill();c.restore();
   if(fall>=1){for(let k=0;k<2;k++)v.ring(c,x,g,Math.min(f.rx*1.15,30+(f.t-.16)*(450+k*120)),Math.min(f.rd,8+(f.t-.16)*85),'#d3b1ff',q*.6,3-k);
    for(let k=0;k<8;k++){const ang=k*Math.PI/4,dist=35+p*f.rx;c.globalAlpha=q;c.fillStyle=k%2?'#cbb3ef':'#65517e';const xx=x+Math.cos(ang)*dist,yy=g+Math.sin(ang)*dist*.28-Math.sin(p*Math.PI)*40;c.fillRect(xx,yy,7,5);}}
  }else if(f.kind==='storm'){
   v.bolt(c,x-30,g-360,x,g-8,f.seed,f.t,'#cb9aff',3,q);v.bolt(c,x+40,g-290,x,g-8,f.seed+17,f.t,'#eee0ff',1.5,q*.75);
   v.glow(c,x,g-18,Math.min(230,f.rx*2.3),100,'#bb8dff',q*.55);
   v.ring(c,x,g,20+p*f.rx,5+p*f.rd,'#dcc3ff',q*.7,2);
   for(let k=0;k<4;k++){const ang=k*Math.PI/2+f.seed;v.bolt(c,x,g-8,x+Math.cos(ang)*f.rx,g+Math.sin(ang)*f.rd,f.seed+k,f.t,'#dfc7ff',1,q*.65,false);}
  }else if(f.kind==='sweep'){
   const xx=x-f.face*f.rx+f.face*f.rx*2*p;
   v.crescent(c,xx,g-60,90,-.2*f.face,q);
   for(let k=1;k<=2;k++)v.crescent(c,xx-f.face*k*35,g-60,90-k*8,-.2*f.face,q*.2);
   v.glow(c,xx,g-30,150,100,'#b89eff',q*.3);
  }else if(f.kind==='bolt'){
   v.bolt(c,x-f.face*f.rx,g-55,x+f.face*f.rx,g-55,f.seed,f.t,'#d6afff',2,q);
   v.glow(c,x+f.face*f.rx*p,g-55,100,85,'#cda8ff',q*.5);
  }else{
   // Grunt/brute claw impacts: tight three-cut accents, not boss-sized geometry.
   v.claw(c,x,g-60,f.face,p,'#d9b5ff',.7);
  }
 }
}
