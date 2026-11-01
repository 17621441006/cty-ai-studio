/** Damage readout uses actual dealt HP, never nominal/overkill values. */
export class ComboReadout{
 constructor(){this.reset()}
 reset(){this.hits=0;this.damage=0;this.until=0;this.last=-99;this.lastDamage=0}
 hit(amount,time){if(amount<=0)return;if(time>this.until){this.hits=0;this.damage=0}this.hits=Math.min(30,this.hits+1);this.damage+=amount;this.lastDamage=amount;this.last=time;this.until=time+1.9}
 visible(time){return this.hits>0&&time<this.until}
}
