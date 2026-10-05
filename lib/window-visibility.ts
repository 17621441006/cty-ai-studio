type WindowInfo={id:string;min:boolean;max:boolean;z:number;motion?:string};
export function coveringWindow(windows:WindowInfo[]){return windows.filter(w=>!w.min&&w.max&&!w.motion).reduce<WindowInfo|null>((top,w)=>!top||w.z>top.z?w:top,null)}
export function windowCanAnimate(w:WindowInfo,{moonOpen,mobile,activeId,coverZ}:{moonOpen:boolean;mobile:boolean;activeId?:string;coverZ?:number}){
 const miniMusic=w.id==='music'&&w.min;
 if(moonOpen||w.motion||(!miniMusic&&w.min))return false;
 if(mobile)return !w.min&&w.id===activeId;
 return coverZ===undefined||(miniMusic?5:w.z)>=coverZ;
}
