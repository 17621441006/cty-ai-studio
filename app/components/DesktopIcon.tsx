import type {ReactNode} from 'react';
import {iconInk} from '@/lib/icon-art-bounds';
// Deliberate pixel silhouettes, sharing the navy / parchment / brass desktop palette.
const ink='#09182c',gold='#f2c66d',light='#fff0bb',brass='#a97436',blue='#5596c3',ice='#b6dddf',deep='#244d79';
const R=({x,y,w,h,c}:{x:number;y:number;w:number;h:number;c:string})=><rect x={x} y={y} width={w} height={h} fill={c}/>;
function Art({n,normalized=false}:{n:number;normalized?:boolean}){let art:ReactNode;
 switch(n){
 case 22:art=<><path fill={brass} d="M2 8h12l3 4h13v17H2z"/><path fill={gold} d="M2 7h11l3 4h13v16H2z"/><path fill={deep} d="M6 13h7l3 2 3-2h7v11h-7l-3 2-3-2H6z"/><path fill={ice} d="M7 14h6v9H7zM19 14h6v9h-6z"/><path fill={light} d="M15 15h2v9h-2zM22 3h2v2h2v2h-2v2h-2V7h-2V5h2z"/></>;break;
 case 8:art=<><path fill={brass} d="M3 23h26v6H3zM5 6h22v19H5z"/><path fill={gold} d="M4 4h24v20H4z"/><path fill={light} d="M4 4h24v2H4zM4 4h2v20H4z"/><path fill={ink} d="M11 6h9v2h4v4h2v7h-3v3H10v-2H7V10h4z"/><path fill={deep} d="M12 8h7v2h3v7h-2v3h-9v-3H9v-5h3z"/><path fill={gold} d="M13 12h5v6h-5zM25 7h2v10h-4v-2h2z"/><R x={15} y={14} w={2} h={2} c={light}/><R x={6} y={26} w={5} h={2} c={ink}/><R x={23} y={26} w={3} h={2} c={light}/></>;break;
 case 9:art=<><path fill={brass} d="M3 5h26v22H3z"/><R x={3} y={4} w={25} h={20} c={gold}/><R x={5} y={6} w={21} h={15} c={ink}/><path fill={ice} d="M8 9h2v2h2v2h-2v2H8v-2h2v-2H8zM15 16h7v2h-7z"/><R x={9} y={26} w={14} h={3} c={blue}/><R x={13} y={24} w={6} h={2} c={deep}/><R x={5} y={4} w={21} h={1} c={light}/></>;break;
 case 10:art=<><path fill={brass} d="M7 2h18v27H5V12h2z"/><path fill={gold} d="M8 3h16v23H6V14h2z"/><R x={10} y={6} w={12} h={10} c={ink}/><path fill={blue} d="M11 7h10v6H11zM7 21h16v5H7z"/><path fill={light} d="M14 8h2v2h2v2h-2v2h-2v-2h-2v-2h2z"/><R x={10} y={18} w={2} h={4} c={ink}/><R x={9} y={17} w={4} h={2} c={brass}/><R x={18} y={19} w={2} h={2} c={'#f4906f'}/><R x={22} y={18} w={2} h={2} c={ice}/></>;break;
 case 11:art=<><path fill={deep} d="M2 7h28v22H2z"/><path fill={gold} d="M2 7h28v2H2zM2 9h2v18h24V9h2v20H2z"/><R x={5} y={11} w={6} h={6} c={blue}/><R x={13} y={11} w={6} h={6} c={light}/><R x={21} y={11} w={6} h={6} c={brass}/><R x={5} y={19} w={10} h={7} c={brass}/><R x={17} y={19} w={10} h={7} c={blue}/><path fill={light} d="M7 3h18v2H7zM4 5h24v2H4zM22 21h1v2h-1zM12 21h1v2h-1z"/></>;break;
 case 12:art=<><path fill={brass} d="M3 3h26v26H3z"/><R x={4} y={4} w={24} h={24} c={gold}/><R x={6} y={6} w={20} h={20} c={ink}/><R x={8} y={8} w={16} h={16} c={deep}/><path fill={blue} d="M8 21h3v-4h3v-4h3v4h3v-6h2v7h2v6H8z"/><path fill={light} d="M17 9h3v3h-3zM12 17h3v2h-3zM20 12h2v3h-2z"/><R x={9} y={28} w={14} h={2} c={brass}/></>;break;
 case 13:art=<><path fill={brass} d="M8 2h16v5H8zM10 7h12v4h-2v3h-3v4h3v3h2v4h2v5H8v-5h2v-4h2v-3h3v-4h-3v-3h-2z"/><path fill={light} d="M9 3h14v2H9zM9 27h14v2H9z"/><path fill={ice} d="M11 7h10v4h-2v3h-5v-3h-3zM14 20h4v3h3v3H11v-3h3z"/><path fill={gold} d="M13 9h6v2h-2v3h-2v-3h-2zM15 17h2v6h3v3h-8v-3h3z"/></>;break;
 case 14:art=<><path fill={ice} d="M9 1h2v2h2v2h2v2h2V5h2V3h2V1h2v3h-2v2h-2v3H13V7h-2V5H9z"/><R x={3} y={9} w={26} h={18} c={brass}/><R x={3} y={9} w={25} h={16} c={gold}/><R x={5} y={11} w={17} h={12} c={ink}/><R x={7} y={13} w={13} h={8} c={blue}/><path fill={ice} d="M8 14h4v2h-4zM14 18h5v2h-5zM25 12h2v3h-2z"/><R x={24} y={18} w={3} h={4} c={brass}/><path fill={ink} d="M6 27h3v3H6zM23 27h3v3h-3z"/></>;break;
 case 15:art=<><path fill={brass} d="M7 5h21v25H7z"/><R x={5} y={3} w={21} h={25} c={gold}/><R x={7} y={6} w={17} h={20} c={light}/><R x={11} y={2} w={10} h={5} c={blue}/><path fill={deep} d="M9 11h2v2h2v-4h2v6H9zM17 11h5v2h-5zM9 18h6v5H9zM17 19h5v2h-5z"/><R x={10} y={19} w={4} h={3} c={blue}/></>;break;
 case 16:art=<><path fill={brass} d="M7 15h19v13H7z"/><path fill={'#e4a08b'} d="M5 14h22v8H5zM8 22h17v4H8z"/><path fill={light} d="M5 12h22v4H5zM5 20h22v2H5zM3 28h26v2H3z"/><path fill={'#c4515b'} d="M13 5h6v3h3v5h-9V9h-2V7h2z"/><path fill={'#92b27f'} d="M15 2h2v4h-2zM17 2h5v2h-5z"/></>;break;
 case 17:art=<><path fill={brass} d="M8 6h18v20H6V8h2z"/><R x={8} y={8} w={16} h={16} c={gold}/><R x={10} y={10} w={12} h={12} c={ink}/><path fill={ice} d="M12 17h2v3h-2zM16 14h2v6h-2zM20 11h1v9h-1z"/>{[10,15,20].map(x=><g key={x}><R x={x} y={3} w={2} h={4} c={blue}/><R x={x} y={26} w={2} h={4} c={blue}/><R x={3} y={x} w={4} h={2} c={blue}/><R x={26} y={x} w={4} h={2} c={blue}/></g>)}</>;break;
 case 18:art=<><path fill={brass} d="M6 3h16v5h5v22H6z"/><path fill={light} d="M5 2h16v6h5v20H5z"/><path fill={gold} d="M21 2v6h5z"/><path fill={blue} d="M10 8h7v6h-7zM8 16h11v4H8z"/><path fill={brass} d="M8 23h15v1H8zM8 25h11v1H8z"/></>;break;
 case 19:art=<><path fill={brass} d="M3 5h11v2h4V5h11v23H18v2h-4v-2H3z"/><path fill={light} d="M4 4h9v2h2v21h-2v-2H4zM18 6h2V4h8v21h-8v2h-2z"/><path fill={blue} d="M6 8h6v2H6zM6 13h6v1H6zM6 17h6v1H6zM20 9h6v1h-6zM20 13h6v1h-6zM20 17h4v1h-4z"/><R x={15} y={7} w={3} h={20} c={gold}/></>;break;
 case 20:art=<><path fill={blue} d="M2 21h5v-5h6v-5h9v6h7v12H2z"/><path fill={brass} d="M2 21h9v8H2zM14 13h10v16H14z"/><path fill={gold} d="M12 12h3V9h3V6h3v3h3v3h3v2H12zM1 21v-2h3v-3h4v3h3v2z"/><path fill={light} d="M17 16h4v5h-4zM4 23h3v4H4z"/><R x={18} y={24} w={3} h={5} c={ink}/><path fill={ice} d="M25 19h3v3h-3zM10 25h3v3h-3z"/></>;break;
 case 21:art=<><path fill={gold} d="M14 2h4v3h3v3h2v13H9V8h2V5h3z"/><path fill={light} d="M14 5h3v4h-3zM11 10h9v8h-9z"/><R x={13} y={11} w={5} h={5} c={blue}/><R x={14} y={12} w={2} h={2} c={ice}/><path fill={blue} d="M7 15h3v9H5v-6h2zM22 15h3v3h2v6h-5z"/><path fill={brass} d="M11 21h9v3h-9z"/><path fill={gold} d="M12 24h7v4h-2v3h-3v-3h-2z"/></>;break;
 default:art=<R x={8} y={8} w={16} h={16} c={gold}/>;
 }
 return <svg viewBox={normalized?iconInk(n).join(" "):"0 0 32 32"} preserveAspectRatio="xMidYMax meet" fill="none" shapeRendering="crispEdges">{art}</svg>
}
export default function DesktopIcon({n,small=false,normalized=false}:{n:number;small?:boolean;normalized?:boolean}){
 if(normalized){
  const [x,y,w,h]=iconInk(n),box=[n%4*443.5+x,Math.floor(n/4)*443.5+y,w,h];
  return <span aria-hidden="true" data-normalized="true" className={`${n<8?'pixel-icon':'utility-icon pixel-drawn'} normalized-icon`}>
   {n<8?<svg viewBox={box.join(' ')} preserveAspectRatio="xMidYMax meet"><image href="/assets/desktop-icons.webp" width="1774" height="887"/></svg>:<Art n={n} normalized/>}
  </span>;
 }
 return n>7?<span aria-hidden="true" className={`utility-icon pixel-drawn utility-${n} ${small?'small':''}`}><Art n={n}/></span>:<span aria-hidden="true" className={`pixel-icon ${small?'small':''}`} style={{backgroundPosition:`${(n%4)*100/3}% ${Math.floor(n/4)*100}%`}}/>;
}
