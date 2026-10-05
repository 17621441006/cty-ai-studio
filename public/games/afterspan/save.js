(function(root){'use strict';
const KEY='afterspan-save',VERSION=2;
const integer=(value,max=1e9)=>Number.isFinite(value)?Math.max(0,Math.min(max,Math.floor(value))):0;
class SaveStore {
 constructor(storage,rooms){this.storage=storage;this.rooms=rooms;this.status='saved';this.message='';this.data=this.fresh();this.load();}
 fresh(){return {version:VERSION,started:false,highestUnlocked:0,lastCompleted:null,resumeRoom:this.rooms[0].id,totalDeaths:0,completed:false,settings:{sound:true,effects:true},rooms:{}};}
 index(id){return this.rooms.findIndex(r=>r.id===id);}
 normalize(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid save');
  const d={...raw,...this.fresh(),rooms:{...(raw.rooms||{})}};
  d.highestUnlocked=integer(raw.highestUnlocked,this.rooms.length-1);
  d.totalDeaths=integer(raw.totalDeaths);d.lastCompleted=typeof raw.lastCompleted==='string'?raw.lastCompleted:null;
  d.started=raw.started===true||d.highestUnlocked>0||d.totalDeaths>0;
  for(const [id,record] of Object.entries(d.rooms)){
   if(!record||typeof record!=='object'){delete d.rooms[id];continue;}
   d.rooms[id]={completed:record.completed===true,deaths:integer(record.deaths),bestTime:Number.isFinite(record.bestTime)&&record.bestTime>0?record.bestTime:null};
   if(d.rooms[id].completed){const index=this.index(id);if(index>=0)d.highestUnlocked=Math.max(d.highestUnlocked,Math.min(this.rooms.length-1,index+1));}
  }
  d.completed=d.rooms[this.rooms.at(-1).id]?.completed===true||(raw.completed===true&&raw.lastCompleted===this.rooms.at(-1).id);
  // Stable room IDs survive future additions; unknown records remain in the save.
  d.resumeRoom=this.index(raw.resumeRoom)>=0&&this.index(raw.resumeRoom)<=d.highestUnlocked?raw.resumeRoom:this.rooms[d.highestUnlocked].id;
  d.settings={sound:raw.settings?.sound!==false,effects:raw.settings?.effects!==false};
  return d;
 }
 load(){
  let encoded=null;
  try{
   encoded=this.storage.getItem(KEY);
   if(encoded!==null){this.data=this.normalize(JSON.parse(encoded));return;}
   // V1 stored completed room indices. Import them without clearing either key.
   const legacy=this.storage.getItem('afterspan-cleared');
   if(legacy!==null){const list=JSON.parse(legacy);if(!Array.isArray(list))throw Error('Invalid legacy save');
    for(const index of list)if(Number.isInteger(index)&&index>=0&&index<10){const id=this.rooms[index]?.id;if(id){this.data.rooms[id]={completed:true,deaths:0,bestTime:null};this.data.highestUnlocked=Math.max(this.data.highestUnlocked,Math.min(index+1,this.rooms.length-1));this.data.lastCompleted=id;}}
    this.data.resumeRoom=this.rooms[this.data.highestUnlocked].id;this.persist();this.message='Previous completed rooms imported.';
   }
  }catch(error){
   if(encoded!==null)try{this.storage.setItem(KEY+'-recovery',encoded);}catch(backupError){}
   this.status='unavailable';this.message='Local save could not be loaded. The menu is safe to use; a recovery copy is kept when storage permits.';
  }
 }
 persist(){
  try{this.storage.setItem(KEY,JSON.stringify(this.data));this.status='saved';return true;}
  catch(error){this.status='unavailable';this.message='Local storage is unavailable. Progress is kept for this session.';return false;}
 }
 record(id){return this.data.rooms[id]||(this.data.rooms[id]={completed:false,deaths:0,bestTime:null});}
 select(index){if(!Number.isInteger(index)||index<0||index>this.data.highestUnlocked)return false;this.data.started=true;this.data.resumeRoom=this.rooms[index].id;this.persist();return true;}
 complete(index,time){
  if(index<0||index>=this.rooms.length||index>this.data.highestUnlocked)return false;
  const room=this.rooms[index],r=this.record(room.id);r.completed=true;
  if(Number.isFinite(time)&&time>0)r.bestTime=r.bestTime===null?time:Math.min(r.bestTime,time);
  this.data.lastCompleted=room.id;this.data.highestUnlocked=Math.max(this.data.highestUnlocked,Math.min(index+1,this.rooms.length-1));
  this.data.resumeRoom=this.rooms[Math.min(index+1,this.rooms.length-1)].id;
  if(index===this.rooms.length-1)this.data.completed=true;
  return this.persist();
 }
 death(index){this.data.totalDeaths++;this.record(this.rooms[index].id).deaths++;this.persist();}
 setting(name,value){if(name!=='sound'&&name!=='effects')return;this.data.settings[name]=!!value;this.persist();}
 reset(){
  this.data=this.fresh();
  try{this.storage.removeItem('afterspan-cleared');this.storage.removeItem('afterspan-room');this.storage.removeItem(KEY+'-recovery');}catch(error){}
  return this.persist();
 }
}
const API={SaveStore,KEY,VERSION};if(typeof module!=='undefined')module.exports=API;else root.Afterspan.SaveStore=SaveStore;
})(typeof window!=='undefined'?window:globalThis);
