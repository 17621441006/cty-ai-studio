import {iconInk} from './icon-art-bounds';
/** Solid ledges, measured from the icon artwork rather than its transparent box. */
const rasterContact=[
 [.3134,.3112,.7914],[.3315,.3100,.6054],[.3517,.3067,.6268],[.2683,.2379,.7159],
 [.1928,.2751,.6900],[.1432,.3484,.6370],[.1838,.3112,.6629],[.1950,.1860,.7475],
];
const utilityContact:Record<number,number[]>={8:[4,4,28],9:[4,3,28],10:[2,7,25],11:[3,7,25],12:[3,3,29],13:[2,8,24],14:[9,3,29],15:[3,5,26],16:[12,5,27],17:[6,8,26],18:[2,5,21],19:[7,3,29],20:[12,12,27],21:[8,9,23],22:[11,2,29]};
export function iconContact(n:number,r:Pick<DOMRect,'top'|'left'|'width'|'height'>,normalized=false){
 const [top,left,right]=n<8?rasterContact[n]:(utilityContact[n]||[5,4,28]).map(v=>v/32);
 if(normalized){
  const [x,y,w,h]=iconInk(n),units=n<8?443.5:32,scale=Math.min(r.width/w,r.height/h),leftPad=(r.width-w*scale)/2,topPad=r.height-h*scale;
  return {top:r.top+topPad+(top*units-y)*scale,left:r.left+leftPad+(left*units-x)*scale,right:r.left+leftPad+(right*units-x)*scale};
 }
 return {top:r.top+r.height*top,left:r.left+r.width*left,right:r.left+r.width*right};
}
