export type StarsRuntime={el:HTMLDivElement;destroy:()=>void;onShow:()=>void;onHide:()=>void;onResize:()=>void;start:()=>void;pause:()=>void;resume:()=>void;state:string;score:number};
export function createStarsRuntime(host:{emit:()=>void;isActive:()=>boolean},options?:{storageKey?:string;sound?:Record<string,unknown>}):StarsRuntime;
