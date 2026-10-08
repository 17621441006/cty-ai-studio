import {apps,type AppInfo,type AppId} from './desktop-apps';
import {rankEntries,resolveEntries,type SearchEntry} from './fuzzy-search';
export const appAliases:Record<string,string[]>={
 'zp-arcade':['游戏机','游戏','游戏厅','小游戏'],
 'zp-loire':['帝国时代','帝国时代2','征服者','圣旗纪元','卢瓦尔','贞德','AOE','RTS'],
 'zp-inkwave':['inkwave','墨浪','喷墨','墨水大战','涂地','争地战'],
 'zp-afterspan':['AFTERSPAN','时隙','时空平台','穿越游戏'],
 photos:['超Q相册','超Q','AI Q版相册','相册','照片','Q版','Q版相册','Q版AI相册','AI相册','全家福','家人','xiangce','photo album'],
 cat:['AI小脏','小脏','猫咪','助手','聊天'], minecraft:['Minecraft','Python','方块','我的世界'],
 home:['房屋','装修','庭间','暮色私邸','家装','3D'],ai:['AI-cat','研习所','AI学习','人工智能'],usaco:['算法','竞赛','USACO'],
 music:['音乐','唱片','随身听','听歌','歌曲'], 'zp-rooms':['音乐','房间','五个房间'],
 'zp-gallery':['3D','展厅','3D空间'], 'zp-builds':['建筑相册','建筑照片','Summerhouse'],
 'zp-stars':['接星星','借星星','星星','接星星小游戏'], 'zp-christmas-walk':['对角巷','对角巷夜游','哈利波特漫步','哈利波特城堡','魔法街','雪夜漫步','雪街','圣诞雪街','圣诞雪景','雪夜'],
 'zp-art-review':['文艺复兴','文艺复习','文艺','艺术漫游'], 'zp-vangogh-tour':['梵高','星夜','漫游星夜','画中漫游'], 'zp-wizard-tour':['哈利波特','霍格沃茨','对角巷','魔法漫游'],
 'zp-dust-road':['尘路','dust road','骑龙','卡卡西','木叶漫游'],works:['所有作品','全部作品','作品','作品集'],
 'zp-benchmark':['创作实验室','AI实验室','模型实测','OPUS5.5','大模型评测','评测','opus'],terminal:['命令行','控制台','终端'],
 stickers:['表情包','贴纸','猫表情'],guide:['帮助','说明','操作说明'],about:['作者','关于','我是谁'],
};
export function appEntries(displayName?:(id:AppId)=>string,source:AppInfo[]=apps):SearchEntry[]{return [...new Map(source.filter(a=>a.id!=='zp-music-rooms').map(a=>[a.id,{id:a.id,title:displayName?.(a.id)||a.name,description:a.description,aliases:[a.name,...(appAliases[a.id]||[]),a.category]}])).values()]}
export function searchApps(query:string,source:AppInfo[]=apps,displayName?:(id:AppId)=>string):AppInfo[]{const index=new Map(source.map(a=>[a.id,a]));return rankEntries(query,appEntries(displayName,source)).map(r=>index.get(r.entry.id as AppId)!)}
export function resolveApp(question:string,displayName?:(id:AppId)=>string){return resolveEntries(question,appEntries(displayName))}
