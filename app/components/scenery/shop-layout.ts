export type PixelShop = { id: string; label: string; subLabel: string; app: string; x: number; y: number; width: number; height: number; color: string };
const clamp = (n:number,a:number,b:number) => Math.max(a,Math.min(b,n));
const shopSpecs = [
  { id: 'family', label: 'FamilyMart 全家', subLabel: '24H · 灵感补给', app: 'cat', x: 0, w: 108, color: '#49e8c0' },
  { id: 'pancake', label: '老上海葱油饼', subLabel: '热乎的街头故事', app: 'zp-sweetrove', x: 0, w: 108, color: '#ffc575' },
  { id: 'zhen', label: '振鼎鸡', subLabel: '今夜也有好味道', app: 'works', x: 0, w: 90, color: '#ff787e' },
  { id: 'tims', label: 'TIMS COFFEE', subLabel: '咖啡与一首唱片', app: 'music', x: 0, w: 112, color: '#ff9aaf' },
];
export function getShopLayout(width: number, height: number): PixelShop[] {
  const signHeight = clamp(height * .028, 20, 25), road = clamp(height * .0493, 36, 44), body = clamp(height * .056, 40, 54);
  const factor=clamp(width/1364,.65,1.2), gap=12*factor, total=shopSpecs.reduce((n,s)=>n+s.w*factor,0)+gap*3;
  let left=width*.54-total/2;
  return shopSpecs.map(s => { const x=left; left+=s.w*factor+gap; return ({ id: s.id, label: s.label, subLabel: s.subLabel, app: s.app, x, y: height - road - body - signHeight, width: s.w*factor, height: signHeight, color: s.color }); });
}

