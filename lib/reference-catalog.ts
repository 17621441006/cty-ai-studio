export type ReferenceWork = {id:string;name:string;category:string;description:string;url?:string;image?:string;status:string;playable:boolean;icon:number;catalogue?:boolean};
const artwork=(file:string)=>['voxel-rampage','christmas-walk','rain-lamp','long-journey','hunger-guy'].includes(file)?'/works/arcade/'+file+'.webp':file==='sweetrove'?'/works/archives/sweetrove/watercolor/countries/france.webp':undefined;
export const referenceWorks:ReferenceWork[]=[
 {id:'vangogh-tour',name:'梵高 · 漫游星夜',category:'文艺复兴',description:'从夜间咖啡馆出发，穿过罗讷河、星夜与画中的村庄。',image:'/works/art-tours/assets/panorama.jpg',status:'可体验',playable:true,icon:22},
 {id:'wizard-tour',name:'哈利波特 · 魔法漫游',category:'文艺复兴',description:'飞越对角巷与古灵阁，穿过雪中霍格莫德，抵达黑湖和霍格沃茨。',image:'/works/art-tours/assets/wizard-alley2.jpg',status:'可体验',playable:true,icon:22},
 {id:'loire',name:'圣旗纪元 · 卢瓦尔河畔',category:'游戏厅',description:'征服者风格的原试玩版：贞德、村庄经营、波斯敌军与部队指挥。推荐电脑或横屏体验。',image:'/games/loire/cover.jpg',status:'可试玩',playable:true,icon:10},
 {id:'afterspan',name:'AFTERSPAN · 时隙',category:'游戏厅',image:'/games/afterspan/cover.png',description:'在 2076 与 2091 之间切换，穿过 22 间研究站。支持触屏操作与本机关卡存档。',status:'可试玩',playable:true,icon:10},
 {id:'benchmark',name:'AI 创作实验室',category:'编程与学习',description:'21 件模型作品：鹈鹕骑车、十种网站、恐龙、短片与雪山。',image:'/works/covers/ai-lab.webp',status:'可体验',playable:true,icon:17},
 {id:'dust-road',name:'尘路 DUST ROAD',category:'专注世界',description:'卡卡西骑龙飞越木叶村。穿过村口、火影大楼与火影岩，伴随一段专注时光。',image:'/works/covers/dragon-flight.webp',status:'可试玩',playable:true,icon:13},
 {id:'pixel-focus',name:'像素小镇 · 专注建造',category:'专注世界',description:'把一段段专注时间，变成小镇里的新建筑。',image:'/works/worlds/pixel-focus-cover.webp',status:'可试玩',playable:true,icon:13},
 {id:'music-rooms',name:'五个房间',category:'音乐与影像',description:'唱片行、墨、末班电车、Live House、像素关卡。也能导入自己的音乐。',image:'/assets/train-city.webp',status:'可体验',playable:true,icon:11},
 {id:'voxel-rampage',name:'体素暴龙 · 微缩城',category:'游戏厅',description:'霸王龙与体素城市的破坏实验。',image:artwork('voxel-rampage'),status:'展示 · 待开放',playable:false,icon:10},
 {id:'christmas-walk',name:'圣诞雪街',category:'游戏厅',description:'在雪夜的街道散步。',image:artwork('christmas-walk'),status:'展示 · 待开放',playable:false,icon:10},
 {id:'matterhorn',name:'马特洪峰',category:'3D 展厅',description:'绕行雪山与冰川，调整日照，看看利菲尔湖的倒影。',image:'/works/worlds/matterhorn-original.webp',status:'可体验',playable:true,icon:12},
 {id:'faroe',name:'法罗群岛 Føroyar',category:'3D 展厅',description:'在群岛、村庄和海蚀柱之间环绕，拍下一张胶片。',image:'/works/worlds/faroe-original.webp',status:'可体验',playable:true,icon:12},
 {id:'rain-lamp',name:'雨灯便利店 23:40',category:'游戏厅',description:'一场雨中的深夜值班。',image:artwork('rain-lamp'),status:'展示 · 待开放',playable:false,icon:10},
 {id:'aquas-duel',name:'Aquas Duel',category:'游戏厅',description:'海底棋盘、源与商店，练习部署、吞噬和逐回合占领计分。',image:'/works/covers/aquas.webp',status:'可试玩',playable:true,icon:10},
 {id:'jianfeng',name:'见缝插针',category:'游戏厅',description:'出牌、判断距离，赢得恰到好处的卡牌对决。',image:'/works/covers/jianfeng.webp',status:'可试玩',playable:true,icon:10},
 {id:'long-journey',name:'长旅 Long Journey',category:'游戏厅',description:'专注委托、奖励旅记与小屋布置；自动保存进度，回来继续旅程。',image:artwork('long-journey'),status:'制作中 · 桌面游戏',playable:false,icon:10},
 {id:'hunger-guy',name:'Hunger Guy · 饿货',category:'游戏厅',description:'饥饿小黑球的训练厨房：移动、咬击、闪避与三选一升级。',image:artwork('hunger-guy'),status:'制作中 · 桌面游戏',playable:false,icon:10},
 {id:'terraria-bridge',image:'/works/covers/terraria.webp',name:'Terraria AI Bridge',category:'编程与学习',description:'单步查看观察、决策与五通道控制，重放同一段模拟轨迹。',status:'制作中',playable:false,icon:3},
 {id:'next-ai',name:'下一个 AI 产品',category:'编程与学习',description:'下一项创作，敬请期待。',status:'即将上线',playable:false,icon:3},
 {id:'sweetrove',name:'Sweetrove · 甜境漫游',category:'设计',description:'108 款甜品的故事、24 份定量配方、63 家店铺与自己的甜味护照。',image:artwork('sweetrove'),status:'可体验',playable:true,icon:16},
 {id:'stillroom',name:'隅间 STILLROOM',category:'3D 展厅',description:'五间可以布置的卧室，移动摆件，换个角度听听窗外。',image:'/works/worlds/stillroom-cover.webp',status:'可体验',playable:true,icon:12},
 {id:'three-worlds',name:'三寸人间 · 六景',category:'3D 展厅',description:'六个微缩世界，调整天气与日照，看小人慢慢生活。',image:'/works/worlds/three-worlds-original.webp',status:'可体验',playable:true,icon:12},
];
export const extraReferenceWorks:ReferenceWork[]=[
 {id:'stars',name:'接星星',category:'游戏厅',description:'和脏脏包接住金色星星，躲开会让猫咪眩晕的蓝色方块。',status:'可试玩',playable:true,icon:23,catalogue:true},
 {id:'original-music',name:'月相唱机',category:'音乐与影像',description:'让自己的音乐与封面，随月相缓缓旋转。',image:'/assets/mosaic-vinyl.webp',status:'可体验',playable:true,icon:8,catalogue:true},
 {id:'promo',name:'创作短片',category:'音乐与影像',description:'两部模型创作短片。',status:'原版界面',playable:true,icon:14,catalogue:true},
 ...[
  ['vinyl','唱片行','翻找唱片，放下唱针，也可以搓碟。'],
  ['ink','墨','把歌曲的节拍变成水墨。'],
  ['train','末班电车','让音乐陪着一班夜间电车前行。'],
  ['live','Live House','现场灯光、应援棒与自己的歌单。'],
  ['pixel','像素关卡','把歌曲变成一关可玩的像素旅程。'],
 ].map(([id,name,description])=>({id:'room-'+id,name,description,category:'音乐与影像',status:'音乐房间',playable:true,icon:11,catalogue:false})),
];
const available=new Set(['vangogh-tour','wizard-tour','loire','afterspan','benchmark','promo','music-rooms','original-music','faroe','room-vinyl','room-ink','room-train','room-live','room-pixel','pixel-focus','dust-road','matterhorn','stillroom','three-worlds','aquas-duel','jianfeng','stars','voxel-rampage','christmas-walk','rain-lamp','long-journey','hunger-guy','terraria-bridge','sweetrove']);
const localLabels:Record<string,string>={'aquas-duel':'规则练习',jianfeng:'规则练习','long-journey':'核心演示','hunger-guy':'核心演示','terraria-bridge':'回路演示','voxel-rampage':'可试玩','christmas-walk':'场景演示','rain-lamp':'夜班演示'};
export const allReferenceWorks=[...referenceWorks,...extraReferenceWorks].map(w=>({...w,status:available.has(w.id)?localLabels[w.id]||'可体验':w.id==='next-ai'?'待补内容':'待重构',playable:available.has(w.id)}));
