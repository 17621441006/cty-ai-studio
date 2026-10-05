'use client';
import dynamic from 'next/dynamic';
const Cards=dynamic(()=>import('./CardDuels').then(m=>m.Jianfeng),{ssr:false});
const Aquas=dynamic(()=>import('./CardDuels').then(m=>m.Aquas),{ssr:false});
const Stars=dynamic(()=>import('./Stars'),{ssr:false});
const Hunger=dynamic(()=>import('./Hunger'),{ssr:false});
const Street=dynamic(()=>import('./StreetWorld'),{ssr:false});
const Journey=dynamic(()=>import('./Journey'),{ssr:false});
const Bridge=dynamic(()=>import('./Bridge'),{ssr:false});
const Sweetrove=dynamic(()=>import('./Sweetrove'),{ssr:false});
const Album=dynamic(()=>import('./Archives').then(m=>m.BuildAlbum),{ssr:false});
const Hackathon=dynamic(()=>import('./Hackathon'),{ssr:false});
export const arcadeIds=['aquas-duel','jianfeng','stars','voxel-rampage','christmas-walk','rain-lamp','long-journey','hunger-guy','terraria-bridge','sweetrove','builds','hackathon'];
export default function ArcadeWork({id}:{id:string}){switch(id){case 'aquas-duel':return <Aquas/>;case 'jianfeng':return <Cards/>;case 'stars':return <Stars/>;case 'hunger-guy':return <Hunger/>;case 'voxel-rampage':return <Street kind="voxel"/>;case 'christmas-walk':return <Street kind="snow"/>;case 'rain-lamp':return <Street kind="rain"/>;case 'long-journey':return <Journey/>;case 'terraria-bridge':return <Bridge/>;case 'sweetrove':return <Sweetrove/>;case 'builds':return <Album/>;case 'hackathon':return <Hackathon/>;default:return null}}
