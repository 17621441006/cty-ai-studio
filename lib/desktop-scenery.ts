import type {TrafficTrick} from './cat-traffic';
export const wallpapers=[
 {id:'castle',name:'霍格沃茨之夜',detail:'塔楼灯火，追逐金色飞贼的扫帚'},

 {id:'clouds',name:'月下云海',detail:'云慢慢走，星星偶尔来'},
 {id:'shanghai',name:'雨夜外滩',detail:'万国建筑、夜行车流与不打烊的小店'},
 {id:'harbor',name:'灯火海港',detail:'海风、灯塔与一片碎月光'},
] as const;
export type WallpaperId=typeof wallpapers[number]['id'];
export type TrafficState={active:boolean;id:number;x:number;width:number;height:number;speed:number;direction:1|-1;frontWheel?:number;rearWheel?:number;trick?:TrafficTrick};
export const emptyTraffic:TrafficState={active:false,id:0,x:-130,width:104,height:34,speed:165,direction:1};
export const moonPhases=[
 {name:'满月',light:1,side:1,glyph:'●'},
 {name:'盈凸月',light:.78,side:1,glyph:'◕'},
 {name:'上弦月',light:.5,side:1,glyph:'◑'},
 {name:'蛾眉月',light:.18,side:1,glyph:'☽'},
 {name:'全食',light:0,side:1,glyph:'○'},
 {name:'残月',light:.18,side:-1,glyph:'☾'},
 {name:'下弦月',light:.5,side:-1,glyph:'◐'},
 {name:'亏凸月',light:.78,side:-1,glyph:'◔'},
] as const;
// Rig support paws end at canvas y=162 -> CSS y=81. All wallpapers share the taskbar goldline.
export const catFootBaseline=81;
// Keep the full cream paw above the gold road edge, on every wallpaper.
export const catGroundLevel=(floor:number)=>floor-3;
export function moonIsLit(x:number,y:number,light:number,side:number){
 const z=Math.sqrt(Math.max(0,1-x*x-y*y));
 const angle=Math.acos(2*light-1);
 return x*side*Math.sin(angle)+z*Math.cos(angle)>0;
}
export function carApproachesCat(car:TrafficState,catX:number){
 if(!car.active)return false;
 const distance=car.direction===1?catX+25-(car.x+car.width):car.x-(catX+61);
 return distance>=-8&&distance<car.speed*.48;
}
