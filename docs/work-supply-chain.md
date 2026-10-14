# 供应链 · AI 升级改造方案

- 桌面入口：工作相关 → 供应链 · AI 升级改造方案。
- 作品集分类：工作相关。搜索和 AI 小脏沿用统一应用目录。
- 静态入口：`public/works/work/supply-chain-ai/index.html`。
- 来源：用户上传的 `供应链-AI升级改造方案.html`；原始 SHA-256 和图片来源见该目录的 `resources.json`。
- 完整保留四个场景、十二环节、三张图表、人工确认演示和 ROI 测算。该页面是交互演示，不发送真实 AI 请求。
- JS、图片、预编译 CSS 均在同一目录；无需外部 CDN。字体使用系统字体回退。第三方许可证保存在 `vendor/`。
- 主站只显示封面，打开作品才加载 iframe。隐藏窗口或标签页时暂停 Three.js 背景；无 WebGL 时仍可阅读与操作。
- Kimi 使用显式 `index.html`，与现有 `dist/` 根目录部署方式兼容。无需修改 `scripts/kimi/paths.mjs` 或 `scripts/kimi/build.mjs`。

修改 HTML/JS 中的 Tailwind 类后，使用 Tailwind CSS 3.4.17 重新生成该目录的 `styles.css`。输入为 `@tailwind base; @tailwind components; @tailwind utilities;`，content 同时包含 `index.html` 和 `app.js`，不要依赖浏览器运行时生成样式。
