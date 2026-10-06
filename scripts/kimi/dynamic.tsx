import {lazy,Suspense,type ComponentType} from 'react';
// This entry builds only browser components. The Sites entry retains next/dynamic.
export default function dynamic<P extends object>(load:()=>Promise<ComponentType<P>|{default:ComponentType<P>}>,options:{loading?:ComponentType;ssr?:boolean}={}){
 const Component=lazy(async()=>{const value=await load();return {default:typeof value==='function'?value:(value as {default:ComponentType<P>}).default}});
 const Loading=options.loading;
 return function Dynamic(props:P){return <Suspense fallback={Loading?<Loading/>:null}><Component {...props}/></Suspense>};
}
