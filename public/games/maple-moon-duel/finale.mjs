export const RESULT_DELAY=3;
export class Finale{
 constructor(winner,loser,won){this.winner=winner;this.loser=loser;this.won=won;this.age=0;this.startY=loser.y;this.fallDuration=Math.max(.45,Math.min(.75,Math.sqrt(Math.max(0,loser.y)/900)+.2));this.shown=false}
 step(dt){this.age+=Math.max(0,Number(dt)||0);const q=Math.min(1,this.age/this.fallDuration);this.loser.y=this.startY*(1-q)*(1-q);this.loser.vy=0;this.winner.stateT+=Math.min(dt,.1);return this.age>=RESULT_DELAY}
 get grounded(){return this.age>=this.fallDuration}
 get frame(){return Math.floor(Math.max(0,this.age-this.fallDuration)/1.8*16)%16}
}
