# Kimi 发布指南：CTY AI STUDIO

本分支是 **完整源工程的部署适配分支**，不是截图重做版。手机修复与主分支一致。它不改变原 ChatGPT Sites 的权限，也不需要把原站改成公开。

## 已查证的 Kimi 平台说明（2026-10-06）

- [构建应用功能介绍](https://www.kimi.com/help/websites/websites-overview)：支持前后端预览、发布和源码导出；预览不等于发布，修改后需要更新发布。
- [全栈能力说明](https://www.kimi.com/help/websites/websites-why-not-working)：支持数据库与登录，但第三方 OAuth 和复杂服务端 API 集成仍列为限制。
- [导入既有 GitHub 工程](https://www.kimi.com/capabilities/business-website-builder)：支持通过 GitHub 插件导入项目。

这些公开页面没有给出统一的静态包体上限、单文件上限、自定义 Node 服务进程或持久磁盘契约。本工程的 Node 适配器是可运行的通用方案，**不代表已验证 Kimi 会原样接受 Node/SQLite**。请 Kimi 读取当前会话可用的建站/部署工具要求：若支持自定义 Node 进程，按下文运行；否则保留完整前端，将列出的 API 和数据表适配到 Kimi 支持的后端。不能把纯静态上传称为完整全栈发布。

## 为什么之前只能打开主桌面

主分支运行在 Vinext + Cloudflare Worker；`dist/client` 单独不是完整的原项目。AI 研习所、助手、USACO 和庭间原来指向独立的 `*.chatgpt.site`，而这些地址可能需要原站权限。仅克隆主仓库不会获得它们的应用源码、后端、登录会话或数据。

本分支构建时按 `scripts/kimi/sources.json` 的固定提交取回三个自有仓库，任何取回或构建失败都会停止。重用原组件和内容，不用简化介绍页代替。所有素材仍在用户打开对应作品后按需请求。

| 入口 | 发布后的地址 / 内容 |
| --- | --- |
| 主桌面 | `/`，手机壁纸面板与标题已修复 |
| AI 研习所 | `/ai/`，完整课程、办公工具、智能体工坊、3D 实验等 |
| 研习所深链接 | `/learn/`、`/tools/`、`/ontology/` 等，每个路由有实际 HTML 入口 |
| AI 小脏 | `/desktop-assistant/`，同源通信、模糊打开应用、站内检索、本地模型；云端问答见下文 |
| USACO | `/usaco/`，题库、可视化、官方测试文件、本地 Monaco 与 Python 运行时 |
| 庭间完整工作台 | `/tingjian/`，来自自有仓库的完整静态发布文件 |
| Minecraft Python 展示 | 主站内的 Python 与 3D 代码、模型、场景和 Pyodide |
| 游戏厅 / 相册 / 唱片机等 | 主站全部原有本地资源，含 INKWAVE、Loire、AFTERSPAN、照片和音频 |

**仍有明确的外部依赖：**

- 精细版马特洪峰、法罗群岛、三寸人间依用户原要求继续用 `zpeterstudio.com` 的原场景；其可用性及 iframe 策略由原站决定。
- Minecraft 的“原始完整学习站”链接仍保留原地址，主站中的 Minecraft Python 演示无需它。`17621441006/blockcraft-academy` 是独立私有项目：若也要迁出完整学习站，需给 Kimi 该仓库访问权限并另行部署，再更新入口。不能把桌面演示说成完整学习站已迁移。
- 本地大模型由 WebLLM 按需下载模型；不能承诺在所有手机上运行。
- INKWAVE 本地电脑对战完整；多人 relay 没有部署。

## 构建：在仓库根目录运行

需要 Git、Node.js **22.13+（推荐 Node 24）**、npm，以及访问 GitHub/npm 的网络。

```sh
git clone --branch kimi-deploy --single-branch https://github.com/17621441006/cty-ai-studio.git
cd cty-ai-studio
npm ci
npm run build
npm run check:deploy
npm run test:deploy
```

不要使用主分支的 Sites 构建方式，不要运行 `next export`，不要只拷贝 `index.html` 或只上传 `assets/`。没有 GitHub 访问权限或出现下载失败时应停止并报告，不能跳过子项目继续发布。

产物：

- `dist/`：完整前端、多页面入口、图片、字体、音频、视频、游戏、WASM、编辑器与测试数据。
- `dist-server/api.mjs`：从研习所真实路由打包的后端。
- `scripts/kimi/server.mjs`、`database.mjs`、`http.mjs`：通用 Node 服务、数据适配与 HTTP 媒体分段读取。
- `dist/deployment-manifest.json`：文件数量、大小和逐文件 SHA-256；`check:deploy` 用它检查是否漏传/损坏源产物。

本次完整构建约 **734.5 MiB，3,857 个文件**，包括三个独立项目。这是全部资源体积，**不是首页下载量**。若 Kimi 当前部署额度不接受，应报告实际返回的限制，使用它支持的静态存储/CDN或将独立子应用分开部署并更新路径；不能删掉题库、图片、游戏或只发布主桌面来凑体积。不要推测一个未公布的容量上限。

## 后端与配置

支持 Node 进程的平台：

```sh
npm start
```

| 配置 | 说明 |
| --- | --- |
| `PORT` | 平台分配端口，默认 3000；也接受 `--port` |
| `HOST` | 默认 `0.0.0.0`，也接受 `--host` |
| `PUBLIC_ORIGIN` | 实际公开站点的 origin，例如 `https://你的域名`，不含路径；HTTPS 反向代理部署时必须配置 |
| `OPENROUTER_API_KEY` | 私密服务端变量。用户通过平台的秘密配置界面提供，绝不能填进前端、GitHub、部署日志或聊天输出 |
| `DATA_DIR` | **持久目录**，存新的交流内容、学习进度和会话签名；默认 `.kimi-data`。临时沙盒目录不算持久化 |
| `SESSION_SECRET` | 可选的稳定签名密钥；未设时自动在 DATA_DIR 创建，不能放到 `dist/` |

原站 ChatGPT 登录、原有用户记录和密钥不会被复制。通用 Node 版使用**新的匿名访客身份**和独立 SQLite，浏览器 cookie 区分记录；它不冒充 ChatGPT 用户，也不导入原私有数据库。交流内容在新部署的访客间公开。若需要账号间同步，请由 Kimi 适配其正式登录和数据库，并保留服务端身份校验。

平台无法运行本服务时，需完整映射以下 API，前端代码和 URL 不变：

| API | 方法 | 作用 |
| --- | --- | --- |
| `/api/assistant` | GET / POST | 配置状态 / 原研习问答，含 SSE |
| `/api/desktop-assistant` | GET / POST | 桌面知识、原 AI 问答，含 SSE |
| `/api/research-brief` | POST | 带证据引用的研究整理 |
| `/api/video-script` | POST | 视频脚本生成 |
| `/api/discussions` | GET / POST | 交流帖子与回复 |
| `/api/workshop-progress` | GET / POST | 校验后的学习进度 |

代码位于固定 AI 源码和 `scripts/kimi/api-entry.ts`；数据表定义位于 `scripts/kimi/database.mjs`。需要保留请求校验、跨站校验、限流、错误状态与流式响应。平台若不支持某项，应如实报告并提供可用后端承载方案，不能返回假回答或“保存成功”。

没有密钥时，云端明确报告未配置，站内检索/导航和其他浏览器功能仍可使用；这不是已经完成云端 AI 联调。

## 发布与验收

1. 静态文件按原目录映射在域名根路径；API 路由到后端。**不要把 `/api/*`、`.wasm`、`.gz`、音频、脚本或子应用的请求统一重写为主站 HTML。**
2. 必须正确返回 JS/CSS/WASM/媒体 MIME。音频视频支持 Range/206，才能拖动进度；`.json.gz` 是题库主动解压的文件，不可伪造错误 Content-Encoding。
3. 子应用应允许同源 iframe；避免全站 `X-Frame-Options: DENY`。请核对 Kimi 预览外层 iframe 的平台要求。不要为了嵌入原私有站放宽原站权限。
4. 在 Kimi 的发布操作后，检查**实际公开网址**而不是只看预览；已有网址要点“更新发布”。
5. 对真实地址运行：

```sh
node scripts/kimi/smoke.mjs https://实际发布域名 --require-cloud
```

6. 手动验证 AI 小脏生成一条真实回答、研究/视频 API、交流回复与重启后的进度保留；`configured: true` 不能证明密钥有效。
7. 以 320 / 375 / 390 / 430px 手机宽度检查：壁纸面板无水平越界、可滚动可关闭；标题只在左侧且不压住助手；无重复时钟。验证 PC 桌面未退化。
8. 点开 AI 研习所、USACO、庭间和游戏后再加载大资源；刷新深链接不能回到主桌面；音乐进度可拖动、WASM 与游戏无 404。不要用 iframe 的 onload 作为业务功能成功的证明。

当前已通过本地生产构建、完整产物检查和服务端单元/集成检查。**尚未在 Kimi 账号内实际发布，也没有真实手机浏览器验收。** 报告中请区分“代码已适配”“平台部署成功”“人工功能验收通过”。
