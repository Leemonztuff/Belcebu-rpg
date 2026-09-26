# 🎮 菠萝战纪 (Brawlore) - GitHub 提交与部署指南

为了将游戏顺利上传到 GitHub 并通过 **GitHub Pages** 免费在线游玩，我们已经为您准备好了所有必要的配置文件和自动化部署工作流。

请按照以下步骤，在您的本地电脑上完成代码库的初始化和上传。

---

## 🚀 准备工作

我们已经为您完成了以下优化准备：
1. **GitHub Pages 自动化工作流 (`.github/workflows/deploy.yml`)**：推送到 GitHub 后，会自动触发 Actions 编译并发布游戏，无需手动配置。
2. **PWA 相对路径优化 (`manifest.json`)**：将 `start_url` 设为 `./index.html`，保证游戏在 GitHub Pages 子目录（如 `https://用户名.github.io/仓库名/`）下离线缓存和 Service Worker 完美运行。
3. **干净的代码库过滤 (`.gitignore`)**：已自动将 AI Studio 相关的本地临时配置文件（如 `.agents/`、`metadata.json`、`*task.md` 等）排除，保证上传到 GitHub 的代码纯净、专业。
4. **MIT 开源许可证 (`LICENSE`)**：添加了标准的 MIT 开源协议。
5. **项目元数据 (`package.json`)**：同步了项目描述、作者信息及名称。

---

## 🛠️ 第一步：在本地初始化 Git 仓库

打开您的终端/命令行工具（如 CMD、PowerShell、Terminal），进入游戏项目的根目录，然后依次运行以下命令：

```bash
# 1. 初始化本地 Git 仓库
git init

# 2. 将所有文件添加到暂存区（.gitignore 会自动过滤掉不需要的临时文件）
git add .

# 3. 提交本地首个版本
git commit -m "feat: 游戏初版发布，加入 GitHub Pages 自动化部署与 PWA 优化"

# 4. 强制设置主分支名称为 main
git branch -M main
```

---

## 🌐 第二步：在 GitHub 上创建并关联远程仓库

1. 登录您的 [GitHub 账号](https://github.com/)。
2. 点击右上角的 **"+"** -> **"New repository"**（新建仓库）。
3. 填写仓库信息：
   - **Repository name**: 输入您的仓库名字（例如：`brawlore-rpg` 或 `diablo-web`）。
   - **Public/Private**: 选择 **Public**（公开，若想使用 GitHub Pages 免费托管，公开仓库最方便）。
   - **不要** 勾选 "Add a README file"、"Add .gitignore" 或 "Choose a license"（因为我们本地已经为您完美创建好了）。
4. 点击 **"Create repository"**。
5. 创建成功后，复制页面上显示的关联命令并运行：

```bash
# 关联您在 GitHub 上刚创建的远程仓库（请将下方 URL 替换为您自己的仓库地址）
git remote add origin https://github.com/您的用户名/您的仓库名.git

# 推送代码到 GitHub
git push -u origin main
```

---

## ⚡ 第三步：配置并启用 GitHub Pages（免费在线玩）

代码上传成功后，我们需要在 GitHub 仓库中启用 GitHub Actions 部署方式：

1. 进入您的 GitHub 仓库页面，点击上方的 **"Settings"**（设置）选项卡。
2. 在左侧菜单栏中，找到 **"Code and automation"** 下的 **"Pages"**。
3. 在 **"Build and deployment"** -> **"Source"** 下，将下拉菜单从 **"Deploy from a branch"** 切换为 **"GitHub Actions"**。
4. **无需任何额外配置！** 
5. 此时点击仓库上方的 **"Actions"** 选项卡，您会看到一个名为 `Deploy to GitHub Pages` 的工作流正在自动运行 🚀。
6. 等待 1~2 分钟运行完成后，Actions 页面会提供一个绿色的部署链接，例如：
   `https://您的用户名.github.io/您的仓库名/`
7. 点击链接，即可在手机、平板或电脑浏览器中直接开始游玩！

---

## 📱 手机端/移动端适配说明

为了实现极致的移动端体验，游戏内已经针对移动浏览器进行了如下深度适配：
- **PWA (Progressive Web App)**：支持在手机浏览器中“添加到主屏幕”，像原生 App 一样全屏、无边框游玩。
- **自适应视口**：采用物理防锯齿和视口缩放，支持横竖屏自适应及触摸手势。
- **自动战斗与自动拾取**：在手机上开启 `自动战斗`，完美释放双手，轻松挂机刷宝！
- **流畅的离线收益**：下线后再上线，可领取多达 8 小时的离线金币和装备奖励。

祝您和您的玩家在庇护所世界中冒险愉快！如有任何代码修改，只需再次运行 `git add .`、`git commit` 和 `git push`，您的在线游戏就会自动更新！
