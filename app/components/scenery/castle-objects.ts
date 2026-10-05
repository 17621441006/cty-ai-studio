export type CastleObject={id:string;depth:number;outline:number[][]};
/** Original masonry is clipped into independently lit scene objects; no duplicate tower underneath. */
export const castleObjects:CastleObject[]=[
 {id:'astronomy-court',depth:.25,outline:[[863,566],[863,454],[885,443],[886,367],[895,321],[913,254],[930,337],[938,369],[938,444],[950,431],[960,389],[970,420],[984,417],[996,401],[1016,314],[1033,395],[1042,414],[1043,365],[1057,339],[1067,297],[1079,344],[1097,341],[1111,253],[1128,330],[1143,365],[1143,482],[1156,459],[1165,480],[1176,500],[1196,490],[1207,447],[1220,504],[1230,572],[1240,598],[1136,618],[1003,584]]},
 {id:'clock-gate',depth:.45,outline:[[1178,564],[1206,552],[1226,577],[1269,583],[1269,501],[1284,414],[1303,499],[1304,606],[1347,614],[1369,548],[1382,635],[1397,658],[1368,672],[1301,656],[1240,623],[1200,609]]},
 {id:'great-hall',depth:.72,outline:[[104,478],[136,458],[137,370],[147,351],[153,317],[163,263],[178,329],[183,312],[193,302],[202,265],[212,206],[220,265],[224,294],[256,288],[271,239],[285,157],[299,241],[302,282],[348,282],[359,239],[376,162],[391,243],[393,286],[400,279],[408,319],[417,327],[418,248],[435,193],[427,148],[428,116],[438,84],[447,114],[453,126],[476,62],[497,14],[509,58],[530,153],[554,226],[568,255],[560,282],[553,292],[553,348],[574,351],[575,321],[596,244],[603,219],[625,326],[626,366],[632,367],[641,326],[646,283],[662,386],[664,529],[620,563],[471,553],[431,509],[375,484],[342,446],[322,457],[320,479],[190,499],[104,491]]},
 {id:'stone-bridge',depth:1,outline:[[624,545],[628,493],[645,486],[665,476],[685,470],[685,448],[708,393],[727,448],[727,466],[748,467],[751,365],[761,339],[785,271],[812,340],[822,365],[820,438],[830,438],[839,362],[853,439],[856,548],[867,550],[868,577],[841,608],[821,643],[801,670],[777,691],[770,614],[748,664],[740,633],[718,673],[709,608],[688,637],[681,590],[662,609],[656,571],[638,591],[633,560]]},
 {id:'waterside-chapel',depth:1.25,outline:[[1059,759],[1060,711],[1083,688],[1098,654],[1108,698],[1118,697],[1125,648],[1138,710],[1138,754],[1176,774],[1105,783]]},
];
export function traceCastleObject(ctx:CanvasRenderingContext2D,object:CastleObject){ctx.beginPath();object.outline.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
function contains(points:number[][],x:number,y:number){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [ax,ay]=points[i],[bx,by]=points[j];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;}return inside;}
export type CastleWindow={x:number;y:number;w:number;h:number;objectId:string;phase:number;period:number;mask:HTMLCanvasElement;lamp:HTMLCanvasElement};
/** Discover the actual amber window pixels, so a switched-off room never paints over stone. */
export function createCastleLightMap(image:HTMLImageElement):CastleWindow[]{
 const c=document.createElement('canvas');c.width=1536;c.height=1024;const ctx=c.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(image,0,0,1536,1024);const {data}=ctx.getImageData(0,0,1536,780),mark=new Uint8Array(1536*780),result:CastleWindow[]=[];
 const lit=(i:number)=>{const p=i*4;return data[p]>108&&data[p+1]>65&&data[p+1]<242&&data[p+2]<168&&data[p]>data[p+1]*1.09&&data[p+1]>data[p+2]*1.18};
 for(let y=90;y<765;y++)for(let x=102;x<1400;x++){
  const start=y*1536+x;if(mark[start]||!lit(start))continue;const todo=[start],pixels:number[]=[];mark[start]=1;let minX=x,maxX=x,minY=y,maxY=y;
  while(todo.length){const i=todo.pop()!,px=i%1536,py=Math.floor(i/1536);pixels.push(i);minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,py);maxY=Math.max(maxY,py);for(const n of [i-1,i+1,i-1536,i+1536])if(n>=0&&n<mark.length&&!mark[n]&&lit(n)){mark[n]=1;todo.push(n);}}
  if(pixels.length<3||pixels.length>3000||maxX-minX>35||maxY-minY>105)continue;
  const object=[...castleObjects].reverse().find(o=>contains(o.outline,(minX+maxX)/2,(minY+maxY)/2));if(!object)continue;
  const mask=document.createElement('canvas');mask.width=maxX-minX+1;mask.height=maxY-minY+1;const mc=mask.getContext('2d')!,im=mc.createImageData(mask.width,mask.height);
  for(const i of pixels){const k=((Math.floor(i/1536)-minY)*mask.width+i%1536-minX)*4;im.data[k]=19;im.data[k+1]=33;im.data[k+2]=55;im.data[k+3]=255;}mc.putImageData(im,0,0);
  const lamp=document.createElement('canvas');lamp.width=mask.width;lamp.height=mask.height;const lc=lamp.getContext('2d')!;lc.drawImage(mask,0,0);lc.globalCompositeOperation='source-in';lc.fillStyle='#ffcd78';lc.fillRect(0,0,lamp.width,lamp.height);
  const noise=Math.sin(minX*127.1+minY*311.7)*43758.5453,seed=Math.floor((noise-Math.floor(noise))*997);result.push({x:minX,y:minY,w:mask.width,h:mask.height,objectId:object.id,phase:seed*.13,period:9+seed%20,mask,lamp});
 }
 // Extra dormant rooms on the existing masonry, with independent light masks.
 const rooms:{x:number;y:number;w:number;h:number;id:string}[]=[];
 const grid=(id:string,xs:number[],ys:number[],w=3,h=7)=>{for(const y of ys)for(const x of xs)rooms.push({id,x,y,w,h})};
 grid('great-hall',[434,447,462,480,497,513,530,544],[316,343,370,391]);
 grid('great-hall',[327,343,358],[465,481],3,7);
 grid('great-hall',[583,598,612],[354,377],3,6);
 grid('stone-bridge',[765,780,795,809],[394,417,442,463],3,6);
 grid('astronomy-court',[893,905,919,930],[411,433,454],3,6);
 grid('astronomy-court',[1003,1014,1026],[455,481,511],3,8);
 grid('astronomy-court',[1110,1122,1133],[402,430,457],3,8);
 grid('waterside-chapel',[1093,1105,1117],[723],4,17);
 for(const room of rooms){
  const object=castleObjects.find(o=>o.id===room.id)!;if(!contains(object.outline,room.x,room.y))continue;
  if(result.some(l=>room.x>=l.x-3&&room.x<=l.x+l.w+3&&room.y>=l.y-4&&room.y<=l.y+l.h+4))continue;
  const mask=document.createElement('canvas');mask.width=room.w;mask.height=room.h;const mc=mask.getContext('2d')!;mc.fillStyle='#122139';mc.fillRect(1,0,Math.max(1,room.w-2),1);mc.fillRect(0,1,room.w,room.h-1);
  const lamp=document.createElement('canvas');lamp.width=room.w;lamp.height=room.h;const lc=lamp.getContext('2d')!;lc.drawImage(mask,0,0);lc.globalCompositeOperation='source-in';lc.fillStyle='#ffd895';lc.fillRect(0,0,room.w,room.h);
  const seed=room.x*17+room.y*31;result.push({x:room.x,y:room.y,w:room.w,h:room.h,objectId:room.id,phase:seed%123,period:8+seed%18,mask,lamp});
 }
 return result;
}
export function castleWindowLight(window:Pick<CastleWindow,'phase'|'period'>,time:number){
 const period=window.period*.75,t=(time+window.phase)/period,cycle=Math.floor(t),p=t-cycle;
 const on=Math.sin(cycle*12.9898+window.phase*8.31)>-.25,previous=Math.sin((cycle-1)*12.9898+window.phase*8.31)>-.25;
 const e=Math.min(1,p*period/1.5),fade=e*e*(3-2*e);return (previous?1:.04)+(Number(on)-Number(previous))*.96*fade;
}
/** Broad, slow architectural lighting, never a moving scan across the building. */
export function castleFacadeLight(id:string,time:number){const period=id==='stone-bridge'?18:id==='waterside-chapel'?14:25,phase=id==='stone-bridge'?1.8:id==='waterside-chapel'?4.1:id==='astronomy-court'?2.7:id==='clock-gate'?.9:0;return .3+.7*(.5+.5*Math.sin(time*Math.PI*2/period+phase));}
