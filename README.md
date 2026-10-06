# CTY AI STUDIO · Kimi 发布分支

**先阅读 [KIMI-DEPLOY.md](KIMI-DEPLOY.md)。**

该分支保留主站内容与手机修复，提供普通 Vite 前端和 Node 后端部署入口，并自动包含 AI 研习所、USACO、庭间的固定源码版本。

```sh
npm ci
npm run build
npm run check:deploy
npm run test:deploy
npm start
```

前端上传整个 `dist/`；完整功能还需要运行服务端并私密配置 AI 密钥和持久存储。不能只发布首页或仅复制 `dist/client`。

主站日常开发继续使用 `main`。这不是手机/PC 两套项目，而是平台部署适配；不要把此分支的运行配置覆盖回 Sites。
