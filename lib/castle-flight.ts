export type Flight={seed:number;direction:1|-1;duration:number;startY:number;endY:number;arch:number;wiggle:number};
export function newCastleFlight(random:()=>number=Math.random):Flight{return {seed:random()*Math.PI*2,direction:random()>.5?1:-1,duration:10+random()*6,startY:.15+random()*.32,endY:.15+random()*.33,arch:(random()-.5)*.38,wiggle:.012+random()*.025}}
export function sampleCastleFlight(f:Flight,progress:number,w:number,h:number){
 const p=Math.max(-.08,Math.min(1.08,progress)),x=(f.direction===1?p:1-p)*(w+200)-100;
 const y=h*(f.startY+(f.endY-f.startY)*p+Math.sin(p*Math.PI)*f.arch+Math.sin(p*12+f.seed)*f.wiggle);
 const dy=h*((f.endY-f.startY)+Math.cos(p*Math.PI)*Math.PI*f.arch+Math.cos(p*12+f.seed)*12*f.wiggle);
 return {x,y:Math.max(36,Math.min(h*.64,y)),angle:Math.max(-.3,Math.min(.3,Math.atan2(dy,w+200))),direction:f.direction};
}
