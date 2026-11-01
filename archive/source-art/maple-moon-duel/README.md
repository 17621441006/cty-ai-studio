# 月华角色源资产归档

保存月华「枫月对决 V10」预渲染角色所对应的原始 GLB，以及外观/动作参考代码。**原文件逐字节保留；不是 Unity 项目、Prefab，也不是 Blender 原始工程。**

来源仓库：[17621441006/spz_lovehome](https://github.com/17621441006/spz_lovehome)，固定提交 `889e0fa0ede73b67ff92c6b9dabb7512428b8417`。网页图集的对应关系见 `public/games/maple-moon-duel/assets/character-sprites.json`。

| 文件 | 原路径 | 大小 | 骨架 | 动画 |
|---|---|---:|---|---:|
| `cat-rig.glb` | `dist/assets/cat-rig.glb` | 4,527,212 bytes | CatRig / 31 joints | 8 |
| `xiaosi-c.glb` | `dist/assets/characters/xiaosi-c.glb` | 11,028,200 bytes | Xiaosi_Rig / 25 joints | 22 |

两个文件的 Git blob SHA 与来源提交完全一致；SHA-256、骨骼名称、动画名称、贴图尺寸、代码来源等记录在 `asset-audit.json`。

## 内容与依赖核验

- GLB 2.0 头、声明长度、块边界、bufferView 范围检查通过。
- 脏脏包：53 meshes / 53 materials / 159 张内嵌图像；小司：1 mesh / 1 material / 3 张内嵌图像。
- 两个 GLB 均无外部 buffer/image URI，无 required extensions。所有内嵌 JPEG/PNG 已实际解码核验。因此单独拿 GLB 不会缺外置贴图文件。
- 脏脏包内含 wait、walk、run、jump、jump_down、sit、front_kick_01、front_kick_02；小司含 mesh_run、mesh_kick、mesh_cast、hold_cat 等 22 段动画，完整清单见审计文件。

## 已知源资产问题（未修改原件）

`validation/` 保留 Khronos glTF Validator `2.0.0-dev.3.10` 的完整报告：

- **脏脏包：0 errors、106 warnings。** 主要是需要生成切线空间、蒙皮网格非根节点。
- **小司：4 errors、3 warnings。** 4 个 `ACCESSOR_VECTOR3_NON_UNIT` 来自第二个 primitive 的 NORMAL：3 个零法线、1 个长度约 0.32155 的非单位法线。其他警告同上。

因此这是一份忠实源资产归档，**不能宣称两者均通过无错误校验或已完成 Unity 验收**。为了可追溯，没有直接重算法线覆盖原件。之后应在工作副本中修复小司法线、生成合适切线，再做导入/光照/动画验收。

## 为什么导入 GLB 不会与网页角色一模一样

`runtime-reference/` 是同一来源提交的原样 Three.js 代码及其相对 JS 依赖，仅用于移植参考，不是可直接放进 Unity 执行的代码，也不是完整独立网页项目。它仍依赖 Three.js、GLTFLoader、原项目路径和运行时环境。关联到小涌的共享分支不表示本次归档了小涌模型。

- `modelcat.js` 使用原猫服装/身体网格与骨架，额外处理扇子显隐、持扇姿态、动作混合等。
- `human-character.js` 调整材质、动作混合，并调用 `dressXiaosi`。
- `xiaosi-style.js` / `xiaosi-reference.js` 包含参考外形适配、衣袖着色修补、海军蓝衣身衬层、丸子头与发带、项链、戒指等运行时构造。**这些补充并非全部烘焙在 xiaosi-c.glb 内。**
- 横版网页使用的仍是预渲染 PNG 图集，另外具有专用姿态、描边、相机与技能粒子。GLB 自带动画并不等同于网页所有战斗动作/特效。

## 后续 Unity 使用

将 GLB 复制到工作项目，使用支持 glTF 2.0 的导入流程（或先在 DCC 软件转换）。先修复上述法线问题，再检查比例、朝向、骨骼映射、蒙皮、动画循环、材质与法线贴图；需要复现网页外观时另移植/烘焙运行时装饰。不要默认骨架可直接用 Humanoid，也不要假定 Three.js shader 修改会自动转成 Unity 材质。本次没有启动 Unity 实测。

## 归档与许可边界

放在 `archive/source-art/` 而非 `public/`：不会增加玩家的网页下载，现有 Kimi 打包只同步 app/components/hooks/lib/public。这里保留的是用户指定项目资产与来源，不给角色重新授予 CC0 或其他开放许可；第三方/生成工具权利仍以原资产授权为准。
