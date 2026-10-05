# 作品来源与 GitHub 备份范围

核对日期：2026-10-05。目标 GitHub 账号：`17621441006`。

## 独立原项目

| 桌面入口 | 运行方式 | 已核实的 GitHub 源码 |
| --- | --- | --- |
| AI-cat / AI研习所 / AI小脏 | `ai-cat.jackchen911006.chatgpt.site`，助手为 `/desktop-assistant` | https://github.com/17621441006/ai-cat （非空，含助手路由） |
| USACO | `usaco-bronze-lab.jackchen911006.chatgpt.site` | https://github.com/17621441006/usaco-bronze-lab （完整源码已上传，Public） |
| Minecraft Python | 演示程序、Pyodide、模型已内置；完整学习项目仍有外部入口 | https://github.com/17621441006/blockcraft-academy （非空，私有） |
| 3D房屋 / 庭间 | 64 张设计图内置；完整工作台外部打开 | https://github.com/17621441006/tingjian-studio （非空） |

以上核验仓库具有实际项目代码，不代表本次已将它们与各自最新在线版本逐文件同步。AI-cat 与 AI研习所共用一个原项目，无需重复仓库。

USACO 恢复源提交：`56d71b0fa49819fdc042416a004ab2bab6cfb069`。完整源码已上传独立仓库；主桌面里的外链不能代替原站源码。

## 已完整内置，不需单独创建仓库

- 帝国时代风格 / Loire 试玩：`public/games/loire/index.html`，配套 `desktop-bridge.js`、`cover.jpg`。游戏脚本、Three.js 和 17 张内嵌图片包含在本项目，不依赖另一个游戏站点运行。
- 文艺复习的梵高与魔法漫游：`public/works/art-tours/`，包含世界脚本、Three.js 依赖和纹理。
- AFTERSPAN、像素游戏、音乐场景、隅间、工作台等本地重构：应用组件及对应 `public` 资源随主仓库保存。
- 模型实测展示：`public/works/benchmark/` 已本地化，含视频、字体和运行依赖；原始来源仓库 https://github.com/Zp-Peter/gpt6-opus55-benchmark-showcase 已存在。

## 仍然依赖外部页面的 3D 原作

| 作品 | 当前页面 | 原源码状态 |
| --- | --- | --- |
| 马特洪峰 | `https://zpeterstudio.com/apps/matterhorn/?view=riffelsee&t=9.5` | 上述 showcase 仓库含 `benchmarks/matterhorn/opus/` 完整实现，相同 URL 参数；与当前线上部署是否完全一致未核实 |
| 法罗群岛 | `https://zpeterstudio.com/apps/faroe/?view=mulafossur` | 未在已核实仓库找到原始源码；待补充原项目位置 |
| 3D 多重世界 | `https://zpeterstudio.com/apps/three-worlds/` | 未在已核实仓库找到原始源码；待补充原项目位置 |

这三个外部页面的链接已被主仓库保存，但链接不等于其完整源码备份。当前项目也保留部分早期本地实现；不能将这些替代版本误标为外部原作的完整备份。

## 上传状态

2026-10-05 已完成上传，两个仓库按用户要求设为 **Public**：

- 主项目：https://github.com/17621441006/cty-ai-studio ，1,027 个源文件及资源。
- USACO：https://github.com/17621441006/usaco-bronze-lab ，1,843 个源文件及资源。

完整源码包同时保存在各仓库的 `source-backup-2026-10-05` Release 附件中。克隆项目请使用 `main` 分支；下载归档请选命名的 `cty-source.tar.gz` 或 `usaco-source.tar.gz` 附件。

导入后已核对 Git 文件树哈希：

| 项目 | 本地来源提交 | 完整匹配的远端提交 |
| --- | --- | --- |
| CTY AI STUDIO | `4cb74cd07e34e14ac745a985bde27adac35d5962` | `406262ae5f92b1562c79fe075cca32f6f383bae4` |
| USACO | `56d71b0fa49819fdc042416a004ab2bab6cfb069` | `4bc043a1881b9b0db958ad0e7ce7d3a52758e710` |

两个远端提交的完整文件树分别与其本地来源完全一致，包括内容、文件名及文件权限。本记录随后更新为实际完成状态。一次性导入工作流已移除。
