export const rebuildBatches=[
 {number:1,title:'桌面与创作实验室',state:'已完成',works:'CTY STUDIO 桌面 · 21 件模型作品 · 两部创作短片',details:'创作实验室优先、整幅缩放、站内播放；相册和桌面动效同步修正。',ids:['benchmark','promo','tv']},
 {number:2,title:'五个房间与法罗群岛',state:'已完成',works:'唱片行 · 墨 · 末班电车 · Live House · 像素关卡 · 月相唱机 · 法罗群岛',details:'核心体验已在本站重构：共享本机歌单、唱片拖动、水墨、行驶电车、音乐灯光与掌机跳跃；法罗恢复精细原版，支持天气、环绕与胶片拍照。',ids:['music-rooms','rooms','room-vinyl','room-ink','room-train','room-live','room-pixel','faroe','original-music']},
 {number:3,title:'专注与 3D 世界',state:'已完成',works:'像素小镇 · 尘路 · 马特洪峰 · 隅间 · 三寸人间',details:'专注计时与九阶段建造、房车旅行到站与装饰；尘路补充精细车舱、木纹车身、夜间车灯和道路视差。马特洪峰与三寸人间恢复精细原版。隅间保留五间卧室布置，加入真实木纹、织物与灰泥材质、细节家具和柔和光照。',ids:['pixel-focus','dust-road','matterhorn','stillroom','three-worlds']},
 {number:4,title:'游戏与创作档案',state:'核心体验已完成',works:'Aquas Duel · 见缝插针 · 接星星 · 体素暴龙 · 对角巷夜游 · 雨灯便利店 · 长旅 · 饿货 · Terraria AI Bridge · 甜境漫游 · 建筑相册 · Hackathon',details:'卡牌规则练习、接星星原版像素动画与眩晕连击、69 栋体素城、带弯道与立体橱窗的对角巷第一人称夜游、六人夜班；长旅、饿货和 AI Bridge 核心演示。17 张建筑图、甜境漫游 108 张卡片 / 34 篇文章、五届赛况均在本站。甜品配方和长旅存档已在第五批补齐；完整游戏扩展与下一项 AI 产品待继续补充。',ids:['aquas-duel','jianfeng','stars','voxel-rampage','christmas-walk','rain-lamp','long-journey','hunger-guy','terraria-bridge','sweetrove','builds','hackathon','next-ai']},
 {number:5,title:'甜味地图与旅途存档',state:'已完成',works:'甜境漫游 · 长旅',details:'108 款甜品的详细故事、24 份定量配方与 63 家店铺资料；按国家、城市与关键词查店，收藏地址、逐步勾选配方。长旅保留计时、奖励、旅记和家具，重新打开可恢复，支持导出存档。',ids:['sweetrove','long-journey']},
];
export const batchFor=(id:string)=>[...rebuildBatches].reverse().find(b=>b.ids.includes(id))||rebuildBatches[3];
