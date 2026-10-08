/** Render a cover from the game's exact, unmodified cat atlas (no substitute illustration).
 * Optional asset-authoring tool: Node 22+ and @napi-rs/canvas; not used by either deployment build.
 */
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {PIXEL_CAT_ATLAS,PIXEL_CAT_CROP} from '../lib/pixel-cat.ts';
import {drawMoonShield} from '../lib/star-shield.mjs';
const require=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'package.json'):import.meta.url);
const {createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
GlobalFonts.loadSystemFonts();
GlobalFonts.registerFromPath('public/fonts/stars-pixel.woff2','StarsPixel');
const W=960,H=600,canvas=createCanvas(W,H),ctx=canvas.getContext('2d');
const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#06142b');bg.addColorStop(1,'#214461');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
for(let i=0;i<75;i++){ctx.fillStyle=i%4?'#7694a05e':'#f3dcaa';ctx.fillRect(18+(i*83)%925,15+(i*61)%485,i%4?2:3,i%4?2:3);}
function star(x,y,size,color='#f4d994'){
 ctx.fillStyle=color;ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,r=i%2?size*.27:size;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();ctx.fillStyle='#fff5d4';ctx.fillRect(x-2,y-2,4,4);
}
// Moon and tiles echo the real playfield, with extra breathing room for the cat.
ctx.fillStyle='#eddcab';ctx.beginPath();ctx.arc(810,114,54,0,Math.PI*2);ctx.fill();
for(let row=-4;row<5;row++)for(let col=-4;col<5;col++)if(row*row+col*col<20&&(col*3+row*7+40)%5<2){ctx.fillStyle='#91b0bc';ctx.fillRect(806+col*10,110+row*10,8,8);}
ctx.strokeStyle='#fae4ac';ctx.lineWidth=2;ctx.beginPath();ctx.arc(810,114,55,0,Math.PI*2);ctx.stroke();
for(let x=0;x<W;x+=24)for(let y=527;y<H;y+=24){ctx.fillStyle=y===527?'#d6c193':(x+y)%5?'#315273':'#51748a';ctx.fillRect(x,y,21,21);ctx.fillStyle=y===527?'#f3dfaf':'#7494a9';ctx.fillRect(x,y,21,3);}
ctx.fillStyle='#b7cad2';ctx.font='13px StarsPixel';ctx.fillText('CTY / MOONLIGHT ARCADE',58,78);
ctx.font='56px StarsPixel';ctx.fillStyle='#fff0c9';ctx.fillText('CATCH',57,180);ctx.fillText('STARS',57,254);
ctx.font='13px StarsPixel';ctx.fillStyle='#a2b8c8';ctx.fillText('A STARRY NIGHT WITH',61,297);ctx.fillText('ZANGZANGBAO',61,321);
// Exact same crop and aspect ratio as the game. Only nearest-neighbour scaling.
const atlas=await loadImage(await readFile('public'+PIXEL_CAT_ATLAS));
const cat=createCanvas(48,50),p=cat.getContext('2d'),crop=PIXEL_CAT_CROP;
p.imageSmoothingEnabled=true;p.imageSmoothingQuality='high';p.drawImage(atlas,crop.x,crop.y,crop.width,crop.height,0,0,48,50);
ctx.fillStyle='#05102666';ctx.beginPath();ctx.ellipse(699,525,132,14,0,0,Math.PI*2);ctx.fill();
ctx.imageSmoothingEnabled=false;ctx.drawImage(cat,557,224,288,300);ctx.imageSmoothingEnabled=true;
// The same moon-engraved gold buckler as the playable scene.
drawMoonShield(ctx,700,192,9,0);
star(697,132,18);star(501,296,19);star(459,358,13);star(353,416,17);star(524,94,9);star(886,344,10);
// Quiet diagonal meteor and a clearly visible round bomb, using in-game colours.
const tail=ctx.createLinearGradient(370,51,436,117);tail.addColorStop(0,'#d18b4000');tail.addColorStop(1,'#efb174');ctx.fillStyle=tail;ctx.beginPath();ctx.moveTo(368,46);ctx.lineTo(442,104);ctx.lineTo(422,125);ctx.closePath();ctx.fill();ctx.fillStyle='#e7b281';ctx.fillRect(420,104,18,18);ctx.fillStyle='#986d67';ctx.fillRect(425,110,12,12);
ctx.strokeStyle='#c7a267';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(192,418);ctx.quadraticCurveTo(195,393,214,407);ctx.stroke();star(214,407,7);
ctx.fillStyle='#030c1b';ctx.strokeStyle='#657e92';ctx.beginPath();ctx.arc(189,438,23,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle='#9ba9b6';ctx.lineWidth=4;ctx.beginPath();ctx.arc(189,438,14,3.7,4.7);ctx.stroke();
ctx.fillStyle='#edd8a0';ctx.fillRect(62,351,91,32);ctx.fillStyle='#182d43';ctx.font='13px StarsPixel';ctx.fillText('02:00',82,374);
await writeFile('public/works/covers/catch-stars-v38.webp',await canvas.encode('webp',88));
console.log('Rendered cover with the unchanged in-game cat atlas.');
