import {allReferenceWorks} from './reference-catalog';
export type AppId='cat'|'minecraft'|'home'|'ai'|'usaco'|'works'|'about'|'photos'|'stickers'|'guide'|'music'|'terminal'|`zp-${string}`;
export type AppInfo={id:AppId;name:string;icon:number;category:string;description:string;url?:string;owner?:'CTY STUDIO';image?:string;desktop?:boolean;catalogue?:boolean;status?:string;referenceId?:string;collection?:string};
export const apps:AppInfo[]=[
 {id:'cat',name:'猫助手',icon:0,category:'桌面',description:'AI 问答、桌面导航，和脏脏包的小日常',url:'https://ai-cat.jackchen911006.chatgpt.site/desktop-assistant'},
 {id:'minecraft',name:'Minecraft.py',icon:1,category:'编程与学习',description:'右边写 Python，左边让方块世界生长。',url:'https://blockcraft.ok.kimi.link',image:'/works/covers/minecraft.webp'},
 {id:'works',name:'作品集',icon:4,category:'桌面',description:'所有创作，收在同一台电脑里。'},
 {id:'home',name:'3D 房屋设计',icon:2,category:'设计',description:'庭间的前八套原设计 · 六十四个空间。',url:'https://tingjian-space-lab.jackchen911006.chatgpt.site',image:'/works/home/dusk-living.webp'},
 {id:'about',name:'我是谁.txt',icon:18,category:'桌面',description:'这台电脑背后的人'},
 {id:'ai',name:'AI 研习所',icon:3,category:'编程与学习',description:'完整课程、智能体工坊、办公工具与 3D 实验。',url:'https://ai-cat.jackchen911006.chatgpt.site',image:'/works/covers/ai.webp'},
 {id:'photos',name:'超Q相册',icon:6,category:'记忆',description:'十张 Q 版照片，收藏家人、旅途与想象。',image:'/works/photos/family-1.webp'},
 {id:'usaco',name:'USACO Lab',icon:5,category:'编程与学习',description:'铜组到银组，回到原来的题目与算法练习。',url:'https://usaco-bronze-lab.jackchen911006.chatgpt.site',image:'/works/covers/usaco.webp'},
 {id:'stickers',name:'脏脏包表情',icon:7,category:'设计',description:'十六个日常表情，和不同世界的猫咪。',image:'/works/sticker-collection.png'},
 {id:'music',name:'月光唱片机',icon:8,category:'音乐与影像',description:'自己的歌曲与封面，收起来就是随身听。',image:'/assets/mosaic-vinyl.webp'},
 {id:'terminal',name:'终端',icon:9,category:'桌面',description:'输入命令，控制猫咪星球桌面。'},
 {id:'guide',name:'使用说明.txt',icon:19,category:'桌面',description:'窗口、快捷键与安装到电脑的方法'},
 {id:'zp-art-review',name:'文艺复兴',icon:22,category:'桌面',description:'梵高的星夜与哈利波特的魔法世界，两段画中旅程。',owner:'CTY STUDIO',collection:'文艺复兴'},
 {id:'zp-focus',name:'专注世界',icon:13,category:'桌面',description:'像素小镇与尘路，专注时世界也在生长。',owner:'CTY STUDIO',collection:'专注世界'},
 {id:'zp-rooms',name:'五个房间',icon:11,category:'桌面',description:'唱片行、墨、末班电车、Live House、像素关卡。',owner:'CTY STUDIO',referenceId:'music-rooms'},
 {id:'zp-gallery',name:'3D 展厅',icon:12,category:'桌面',description:'法罗群岛、马特洪峰、隅间、三寸人间。',owner:'CTY STUDIO',collection:'3D 展厅'},
 {id:'zp-arcade',name:'游戏厅',icon:10,category:'桌面',description:'INKWAVE 墨浪、圣旗纪元、AFTERSPAN、Aquas Duel 与接星星。',owner:'CTY STUDIO',collection:'游戏厅'},
 {id:'zp-tv',name:'电视台',icon:14,category:'桌面',description:'模型创作短片，打开即可观看。',owner:'CTY STUDIO'},
 {id:'zp-builds',name:'建筑相册',icon:20,category:'桌面',description:'Summerhouse 建筑作品与相册。',owner:'CTY STUDIO'},
 {id:'zp-desktop',name:'重构进度.txt',icon:15,category:'桌面',description:'查看作品迁入桌面的批次与进度。',owner:'CTY STUDIO'},
 {id:'zp-hackathon',name:'Reset Hackathon',icon:21,category:'桌面',description:'Reset Hackathon 创作记录与作品。',owner:'CTY STUDIO'},
 ...allReferenceWorks.map(w=>({id:`zp-${w.id}` as AppId,name:w.name,icon:w.icon,category:w.category,description:w.description,image:w.image,owner:'CTY STUDIO' as const,desktop:false,catalogue:w.catalogue!==false,status:w.status,referenceId:w.id})),
];
export const desktopApps=apps.filter(a=>a.desktop!==false);
export const catalogueApps=apps.filter(a=>a.category!=='桌面'&&a.catalogue!==false);
export const getApp=(id:AppId)=>apps.find(a=>a.id===id)!;
