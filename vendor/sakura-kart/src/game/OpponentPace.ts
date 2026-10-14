/** Two close rivals, five club drivers; speed changes never change race progress. */
type Racer = {id:number;isPlayer:boolean;finished:boolean;raceDistance:number;forwardSpeed:number;stats?:{topSpeedMul:number}};
const clamp=(x:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,x));
export class OpponentPace {
  private time=0;
  private paces=new Map<number,number>();
  private assists=new Map<number,number>();
  private rivals:number[]=[];
  reset(){this.time=0;this.paces.clear();this.assists.clear();this.rivals=[];}
  isRival(id:number){return this.rivals.includes(id);}
  forKart(id:number){return this.paces.get(id)??.9;}
  assistFor(id:number){return this.assists.get(id)??0;}
  update(karts:readonly Racer[],player:Racer,length:number,dt:number,_visible?:ReadonlySet<number>,_fullSpeed=30,_demo=false){
    if(dt<=0)return;
    this.time+=dt;
    if(!this.rivals.length)this.rivals=karts.filter(k=>!k.isPlayer).slice(0,2).map(k=>k.id);
    const progress=Math.max(0,player.raceDistance)/length;
    const finale=clamp((progress-2.48)/.22,0,1);
    for(const k of karts){
      if(k.isPlayer)continue;
      const rival=this.rivals.indexOf(k.id);
      const gap=k.raceDistance-player.raceDistance;
      const targetGap=rival>=0?(12+rival*16)*(1-finale)-(32+rival*14)*finale:-110-(k.id%5)*35;
      const nominal=(rival>=0?1.05:.86)/(k.stats?.topSpeedMul??1);
      const closing = player.forwardSpeed-k.forwardSpeed;
      const correction=clamp((targetGap-gap)*.010+(rival>=0?closing*.010:0),-.55,rival>=0?.30:.06);
      const variation=.012*Math.sin(this.time*.22+k.id*2.4);
      const target=clamp(nominal+correction+variation,.65,1.22);
      // Bounded longitudinal help is applied by Race only with throttle and no braking.
      const previous=this.forKart(k.id);
      const assist=rival>=0?clamp((targetGap-gap)*.035,-.35,1.1):0;
      const beforeAssist=this.assistFor(k.id);
      this.assists.set(k.id,beforeAssist+(assist-beforeAssist)*(1-Math.exp(-dt/1.1)));
      this.paces.set(k.id,previous+(target-previous)*(1-Math.exp(-dt/1.1)));
    }
  }
}
