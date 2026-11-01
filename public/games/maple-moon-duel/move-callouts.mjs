// Immutable names match the existing ability bar / core ultimate labels.
const freeze = value => { if(value && typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);} return value; };
const common={attack:['连击 · 第一式','连击 · 第二式','连击 · 第三式'],dash:'闪身',jump:'跳跃',airescape:'凌空浮空',guard:'防御',block:'格挡成功',guardbreak:'破防'};
export const MOVE_NAMES=freeze({
 cat:{...common,skill:'焰爪',roar:'猫吼功',charm:'躺平撒娇',launch:'大橘为重',ultimate:'赤焰 · 裂地燎原'},
 xiaosi:{...common,skill:'月刃',roar:'强制爱',charm:'哭给你看',launch:'踏月升莲',ultimate:'月华 · 雷月领域'},
 bear:{...common,skill:'音律震波',roar:'午夜咆哮',charm:'八音盒舞',launch:'发条升龙',ultimate:'午夜 · 惊魂谢幕'}
});
const durations={normal:.7,movement:.65,special:1.1,ultimate:1.4,defense:.7,break:1};
const keys={attack:'J',skill:'K',dash:'L',jump:'Space',airescape:'Space',roar:'I',charm:'O',launch:'P',ultimate:'U',guard:'F',block:'F',guardbreak:'F'};
const specialKeys={
 cat:{roar:'roar',charm:'charm',pounce:'launch'},
 xiaosi:{love:'roar',cry:'charm',launch:'launch'},
 bear:{jumpscare:'roar',toreador:'charm',gearlaunch:'launch'}
};
export class MoveCallouts {
 constructor(){this.reset();}
 reset(){this.lanes={cat:null,xiaosi:null,bear:null};this.pending={cat:null,xiaosi:null,bear:null};this.guarding={cat:false,xiaosi:false,bear:false};this.blockUntil={cat:-Infinity,xiaosi:-Infinity,bear:-Infinity};this.seen=new WeakSet();this.sequence=0;}
 _advance(kind,now){
  if(this.lanes[kind]&&this.lanes[kind].expires<=now)this.lanes[kind]=null;
  const p=this.pending[kind];
  if(p&&p.staleAt<=now)this.pending[kind]=null;
  else if(p&&!this.lanes[kind]){this.lanes[kind]=Object.freeze({...p.value,started:now,duration:durations[p.value.category],expires:now+durations[p.value.category]});this.pending[kind]=null;}
 }
 _show(kind,move,now,chain=0){
  if(!MOVE_NAMES[kind]||!Number.isFinite(now))return null;
  this._advance(kind,now);
  const category=move==='ultimate'?'ultimate':['roar','charm','launch','skill'].includes(move)?'special':move==='attack'?'normal':['dash','jump','airescape'].includes(move)?'movement':move==='guardbreak'?'break':'defense';
  const name=move==='attack'?MOVE_NAMES[kind].attack[Math.max(0,Math.min(2,Number.isInteger(chain)?chain:0))]:MOVE_NAMES[kind][move];
  if(!name)return null;
  const value=Object.freeze({name,category,key:keys[move],kind,id:++this.sequence,started:now,duration:durations[category],expires:now+durations[category]});
  const current=this.lanes[kind];
  if(category==='defense'&&current&&['special','ultimate','normal','movement'].includes(current.category)){
   this.pending[kind]={value,staleAt:now+.8};return value;
  }
  this.lanes[kind]=value;this.pending[kind]=null;return value;
 }
 feed(ev,now){
  if(!ev||typeof ev!=='object'||!Number.isFinite(now)||!MOVE_NAMES[ev.actor?.kind]||this.seen.has(ev))return null;
  const kind=ev.actor.kind;
  let move={swing:'attack',charge:'skill',ultimate:'ultimate',airescape:'airescape'}[ev.type];
  if(ev.type==='special'&&ev.phase==='start')move=specialKeys[kind]?.[ev.skill];
  if(!move)return null;
  this.seen.add(ev);
  if(move==='block'){if(now<this.blockUntil[kind])return null;this.blockUntil[kind]=now+.75;}
  return this._show(kind,move,now,ev.chain??ev.actor.action?.chain??ev.actor.chain??0);
 }
 guard(){return null;}
 snapshot(now){
  if(!Number.isFinite(now))throw new TypeError('MoveCallouts.snapshot requires simulation time in seconds');
  for(const kind of ['cat','xiaosi','bear'])this._advance(kind,now);
  return Object.freeze({cat:this.lanes.cat,xiaosi:this.lanes.xiaosi,bear:this.lanes.bear});
 }
}
