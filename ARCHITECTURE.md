# 架构审计与 AAA 迁移路线

本文件记录当前代码库审计结论、目标目录结构和分阶段迁移计划。阶段 1 已在 `feature/aaa-architecture-refactor` 分支完成。

## 一、现状审计

### 优点（迁移中必须保留）

- **对象池体系**：ParticlePool、DamageNumberPool、ProjectilePool、EnemyPool、FlyingPickupPool 等贯穿全项目，GC 压力受控。
- **IndexedDB 存档**：`SAVE_DATA_VERSION` 显式版本号 + 迁移函数，旧档兼容有保障。
- **i18n 三语**：英文/西文/中文回退链完整，用户文本统一走 I18N。
- **画质分级与视口缩放**：`graphicsQuality` 驱动渲染分辨率，离屏画布做血迹层，LOS 缓存按区域失效。
- **回归体系**：`tools/verify.ps1` 覆盖语法检查、非 live 回归、精灵资源合同，约 110 项检查。
- **缓存治理**：index.html 所有资源带 `?v=` 版本号，Service Worker 采用 network-first。

### 问题（本次迁移的动因）

1. **根目录扁平**：38 个浏览器端 JS 与图片、音频、字体、工具混在同一层，无法一眼区分「运行时代码 / 静态数据 / 部署脚本 / 资源」。
2. **game.js 巨石**：单文件约 1.9 万行，承担主循环、地图、渲染、伤害、成就、NPC、纸娃娃等多重职责，测试只能靠 `indexOf` 抽取函数片段（脆弱）。
3. **命名无分层**：`skill-branches.js`、`abyss-system.js` 等平铺，看不出系统归属与依赖方向。
4. **构建脚本硬编码清单**：`tools/vercel-build.cjs` 逐个列出文件名，新增/移动文件必须手动同步，漏项即线上缺文件。
5. **语法检查只扫根目录**：`verify.ps1` 原先仅检查根目录与 `pb_hooks/` 的顶层 JS，子目录代码不受检。

## 二、目标结构（阶段 1 已落地）

```
Belcebu-rpg/
├── index.html            # 唯一入口，按依赖顺序加载 src/ 脚本
├── style.css / skill-art.css
├── server.js / sw.js     # 本地服务与 Service Worker（需在根目录）
├── gsap.min.js / pocketbase.umd.js   # 第三方 vendor，暂留根目录
├── art/  audio/  fonts/  public/     # 静态资源（阶段 2 处理根目录散图）
├── tools/                # 回归测试与构建脚本
├── pb_hooks/  pb_migrations/         # PocketBase 服务端
└── src/                  # 全部浏览器端游戏代码
    ├── core/        game.js            # 主循环与全局集成（待拆分，见阶段 2）
    ├── data/        constants / items-data / set-items / runes-data / skill-art
    ├── systems/
    │   ├── combat/       auto-battle / combat-tactics
    │   ├── ai/           enemy-system
    │   ├── inventory/    item-system
    │   ├── skill/        skill-branches
    │   ├── progression/  daily-quest / season-system / talent-draft / abyss-system / return-bonus
    │   └── save/         save-system
    ├── ui/          ui-panels / gsap-animations / share-card / changelog
    ├── i18n/        i18n / i18n-content-*（6 个内容表）
    ├── graphics/    sprite-renderer / vfx-manifest / art-samples / environment-art / elemental-3d / physical-3d / shield-3d
    ├── audio/       audio
    └── net/         online / market
```

分层依赖方向（约束后续拆分）：`data → systems → core → ui`，`graphics/audio/i18n/net` 为横切层；`systems` 之间不互相 require 全局巨石函数，跨系统逻辑收敛到 `core/game.js` 的集成点。

## 三、迁移计划

### 阶段 1：目录归位（本分支已完成）

- [x] 38 个浏览器端 JS `git mv` 至 `src/` 对应分层，保留文件名（历史可追溯，diff 只含路径变更）。
- [x] 全仓库约 230 处引用同步更新：index.html 脚本标签、tools/ 回归脚本、`package.json` lint、`vercel-build.cjs`、`assert-versioned-asset` 资产名。
- [x] `vercel-build.cjs` 改为整体复制 `src/` 目录，消除硬编码文件清单。
- [x] `verify.ps1` 语法检查覆盖 `src/` 与 `pb_hooks/` 递归。
- [x] 移动文件的 index.html `?v=` 统一升至 `202609301610`。
- [x] AGENTS.md 模块导航表更新为新路径。
- [x] `tools/verify.ps1`：107 项通过；7 项失败与 `main`（9a9de6f）基线逐条一致，属既有问题，本分支零回归：
  - `test-item-collection-achievements.ps1`、`test-map-size-contract.ps1`、`test-mobile-ui-and-warning-contract.ps1`（既有解析/断言问题）
  - `test-skill-art.js`、`test-skill-branch-behavior.js`（`SKILL_TREE` 未定义，对应 #9 提交前的既有回归）
  - `test-specter-wall-retreat.js`（game.js 中代码标记缺失，既有）
  - `sprite-assets`（spark 图集 1024≠512，既有资源问题）

### 阶段 2：巨石拆分与依赖治理（待办）

1. **拆分 `src/core/game.js`**：按职责切出 `render/`（视口与地图绘制）、`player/`（状态与受伤）、`achievements/`、`npc/`（纸娃娃）等模块；每个子模块独立后补齐直接单元测试，替代 `indexOf` 抽片段式测试。
2. **数据下沉**：`BASE_ITEMS`、`SKILL_TREE` 等纯数据从逻辑文件彻底分离到 `src/data/`，修复既有 `SKILL_TREE is not defined` 回归。
3. **根目录散图归档**：`items-painted.webp`、`hero-*.png` 等约 40 个图片移入 `art/` 或 `public/`，同步 style.css、game.js 与精灵合同脚本中的路径（注意 `vercel-build.cjs` 顶层资源拷贝规则）。
4. **vendor 独立**：`gsap.min.js`、`pocketbase.umd.js` 移入 `vendor/`。
5. **测试路径收敛**：新增 `tools/source-paths.js` 作为路径映射唯一事实源，测试统一经其取文件，避免下次移动再次全量改测试。

### 阶段 3：构建与模块化（远期，需权衡）

1. 评估 ES Modules + 轻量打包（Vite/esbuild）替代传统 `<script>` 顺序加载；收益是 import 依赖显式化与 Tree-shaking，代价是引入构建步骤（当前约束为零构建运行）。
2. 若引入打包，保持 `index.html` 无构建回退路径（或 Service Worker 预缓存 dist），避免本地打开即坏。
3. `sw.js` 预缓存清单接入构建产物，替代 network-first 兜底。

## 四、约束与回滚

- 阶段 1 **不改任何运行时行为**：仅移动文件与同步引用；脚本内容除路径字符串外零变更。
- 回滚：整个迁移为单分支原子工作，`git checkout main` 即回到原结构。
- 合并前基线对照：以 `main` 上同样失败的 7 项为已知债，不作为本分支验收条件；新增失败必须为 0。
