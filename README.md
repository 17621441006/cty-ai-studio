# CTY AI STUDIO

月光像素桌面作品集：可拖动窗口、桌面猫咪、动态壁纸、音乐播放器，以及内置的学习、游戏和艺术漫游作品。

## 本地运行

需要 Node.js 22.13 或更新版本，以及 pnpm 11.25.0（与 `packageManager` 声明一致）。本仓库使用 `pnpm-lock.yaml`，按锁文件安装依赖：

```sh
pnpm install --frozen-lockfile
pnpm dev
```

打开终端实际输出的本地地址。生产构建：

```sh
pnpm build
pnpm start
```

本项目采用 React、TypeScript、Vinext 和 Canvas / Three.js。详细运行环境和 Sites 发布说明见 [运行说明](docs/RUNTIME.md)。现有 `.openai/hosting.json` 属于原站点；独立部署时应使用自己的托管配置。

## 主要目录

| 目录 | 内容 |
| --- | --- |
| `app/components` | 桌面、播放器、猫咪、窗口、内置作品界面 |
| `app/components/scenery` | 外滩、海港、城堡的场景对象和绘制 |
| `lib` | 角色动作、交通互动、应用索引及游戏逻辑 |
| `public/games/loire` | 完整内置的帝国时代风格试玩，包括游戏代码及资源 |
| `public/works` | 艺术漫游、Minecraft 模型、模型实测等内置作品 |
| `public/python` | 本地 Python / Pyodide 运行资源 |
| `public/assets` | 桌面图像、角色、相册、场景、封面资源 |
| `archive/source-art` | 原始美术素材备份，不进入部署包 |

## 备份边界

本仓库包含桌面和内置作品源码、随项目发布的图片/音视频/模型/运行依赖。部分完整应用仍由其他站点提供，其清单和已有 GitHub 仓库见 [作品来源与备份范围](docs/PROJECT-SOURCES.md)。

浏览器里自行导入的歌曲、封面和本地设置属于该浏览器的本地数据，不会自动成为 Git 源码。AI 助手仍使用 AI-cat 站点的服务，主仓库不包含其运行时密钥。

2026-10-05 的性能修复与验证见 [v25 记录](docs/V25-PERFORMANCE.md) 和 [v26 按需加载与运行性能](docs/V26-PERFORMANCE.md)。

v27 调整了凤凰原地渐隐、城堡灯火与月相自动轮换，见 [场景更新记录](docs/V27-SCENERY.md)。每次网站内容发布后，都应同步本 GitHub 仓库并核对源码一致。

v28 柔化桌面与内置作品音效，修正“文艺复兴”名称，并移出已停用的部署素材；主站与 AI 研习所的体积核查见 [音效与体积记录](docs/V28-AUDIO-SIZE.md)。

v29 将桌面 AI 研习所改为本地精选体验，更新“风中优雅”与接星星图标，接回像素脏脏包并恢复掉落猫叫，见 [展示与角色更新记录](docs/V29-PREVIEW-CAT.md)。
