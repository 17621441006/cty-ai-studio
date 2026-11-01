# 月华 · 枫月对决（V10）

从原游戏源码版本 `8aee12846266a024ac41ad7942d18f788ea82eb9` 导入。完整可运行资源在 `public/games/maple-moon-duel/`，无需 Unity、登录或外部素材 CDN。保留手动切磋、自动演武及「月蚀古庭」闯关模式。

游戏厅应用 ID：`zp-maple-moon-duel`。入口：`/games/maple-moon-duel/index.html`。独立部署时整目录复制即可，游戏内部使用相对路径；也可放在站点子目录。作品集遵循现有根路径部署约定。

适配：接受宿主同源 `cty:game-visibility` 消息，失焦/最小化暂停并清除移动输入；隐藏时停止绘制，恢复后手动继续。保持原游戏玩法。素材来源与许可见游戏内 `credits.html`，不能将全部角色原创素材视为开源。

回归测试（在仓库根目录）：

```sh
for f in vendor/maple-moon-duel/*test.mjs; do node "$f" || exit; done
pnpm exec tsc --noEmit
pnpm build
```

README.md 保留原游戏版本说明。现有 main → Kimi 打包工作流会包含本游戏的 public 资源；不修改 Kimi 部署适配器。GitHub 打包成功不等于第三方托管网站已更新。
