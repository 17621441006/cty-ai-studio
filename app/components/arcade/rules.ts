export function duelWinner(a:number,b:number):0|1|-1 {
 if(a===b)return -1;
 if(a===1&&b===13)return 0;
 if(b===1&&a===13)return 1;
 return (Math.abs(a-b)<=3?a>b:a<b)?0:1;
}
export type SeaCard={id:number;name:string;size:number;weight:number;source?:boolean};
export type SeaStack={owner:0|1;size:number;weight:number;sources:number;count:number;name:string};
export type SeaBoard=(SeaStack|null)[];
export const region=(i:number)=>i===0?3:i<7?2:1;
export function seaPlacement(board:SeaBoard,index:number,card:SeaCard,owner:0|1):{ok:boolean;message:string;stack?:SeaStack|null}{
 const old=board[index];
 if(card.source){
  if(index===0)return {ok:false,message:'源不能放在核心。'};
  if(old?.size===0)return {ok:false,message:'独立的源已占据此格，不能叠放。'};
  if(old&&old.owner!==owner)return {ok:false,message:'源只能放在空位或自己的鱼下。'};
  return {ok:true,message:'源已放置。',stack:old?{...old,sources:old.sources+1,size:old.size===0?0:Math.min(5,old.size+1),count:old.count+1}:{owner,size:0,weight:0,sources:1,count:1,name:'源'}};
 }
 if(old&&old.size===0&&old.owner!==owner)return {ok:false,message:'不能吞噬对手独立的源。'};
 const size=Math.min(5,card.size+(old?.sources||0));
 if(size<region(index))return {ok:false,message:`这里需要体型 ≥ ${region(index)}。`};
 if(card.size>=4&&(old?.count||0)<card.size-3)return {ok:false,message:`体型 ${card.size} 需要吞噬至少 ${card.size-3} 张牌。`};
 if((old?.weight||0)>size*2)return {ok:false,message:'下方牌堆过重，无法吞噬。'};
 const weight=card.weight+(old?.weight||0);
 if(weight>size*2)return {ok:true,message:'吞噬后超重，整叠沉入深渊。',stack:null};
 return {ok:true,message:old?'吞噬完成，取得这个位置。':'海洋伙伴已入场。',stack:{owner,size,weight,sources:old?.sources||0,count:(old?.count||0)+1,name:card.name}};
}
export const seaScore=(board:SeaBoard,owner:0|1)=>board.reduce((sum,s,i)=>sum+(s?.owner===owner?(s.size===0?1:region(i)):0),0);
const inner=[[0,-121],[104,-60],[104,60],[0,121],[-104,60],[-104,-60]];
const outer=[[-234,-220],[-117,-220],[117,-220],[234,-220],[234,-71],[234,71],[234,220],[117,220],[-117,220],[-234,220],[-234,71],[-234,-71],[0,-330],[344,0],[0,330],[-344,0]];
export const seaPoints=[[0,0],...inner,...outer].map(([x,y])=>({x:50+x/7.86,y:50+y/7.86}));
