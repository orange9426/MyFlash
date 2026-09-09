# 将 MyFlash 部署到自己的 GitHub

## 推荐：全程使用网页，不安装 Git

1. 在 GitHub 新建名为 `MyFlash` 的公开仓库，不勾选初始化 README。
2. 在空仓库页面点击 `uploading an existing file`；已有内容的仓库点击 `Add file → Upload files`。
3. 用 Windows 文件资源管理器打开 `D:\Game\MyGame\StaircaseTrial-main`。
4. 选择目录内的源码文件和文件夹，排除 `node_modules` 和 `dist`，拖入上传区域。当前排除这两个目录后共 72 个文件，低于网页单次 100 个文件的限制。
5. 拖入的是项目目录里面的内容，不是最外层 `StaircaseTrial-main` 文件夹，也不是 ZIP。上传后仓库根目录应直接显示 `package.json`、`index.html`、`src`、`.github` 等。
6. 页面底部填写提交说明，例如 `Initialize MyFlash`，点击 `Commit changes`。确认默认分支为 `main`。
7. 进入 `Settings → Pages → Build and deployment`，把 Source 设为 `GitHub Actions`。
8. 在 `Actions → Deploy to GitHub Pages → Run workflow` 中选择 main 并运行，等待 build 和 deploy 成功。随后访问 `https://你的GitHub用户名.github.io/MyFlash/`。

如果拖放时 `.github` 未上传，可在仓库根目录点击 `Add file → Create new file`，文件名填 `.github/workflows/deploy.yml`，复制本地同名文件的全部内容后提交。

网页上传不会根据 `.gitignore` 自动排除选中的依赖文件夹，必须手动排除 `node_modules` 和 `dist`。后续更新也可在仓库根目录通过 Upload files 上传修改后的同路径文件；删除和重命名需另行处理仓库中的旧文件。

参考：[GitHub 官方网页上传说明](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)。

---

以下是可选的 Git 命令行方式；使用上面的网页方式时无需执行。

## 1. 创建仓库

登录 GitHub，新建名为 `MyFlash` 的公开仓库。不要勾选初始化 README、.gitignore 或许可证，本地已有这些文件。保留项目原有许可证及作者信息。

本地文件夹当前没有 `.git`，以下步骤按首次上传编写。本地文件夹仍叫 StaircaseTrial-main，不影响仓库名称与网站地址。

## 2. 首次上传

在 PowerShell 中执行。先把下面远端地址中的 `YOUR_USERNAME` 替换为自己的 GitHub 用户名：

```powershell
cd D:\Game\MyGame\StaircaseTrial-main
npm ci
npm run build
git init -b main
git add .
git commit -m "Initialize MyFlash"
git remote add origin https://github.com/YOUR_USERNAME/MyFlash.git
git push -u origin main
```

如果 Git 提示缺少提交者信息，在当前目录设置 `git config user.name "你的名字"` 和 `git config user.email "你的GitHub邮箱"`，再执行提交与推送。推送时按 Git 的提示完成 GitHub 身份验证。

`node_modules` 和 `dist` 已被忽略；上传的是源码，由 Actions 构建。不要只上传 dist，也不要遗漏 `.github/workflows/deploy.yml`。

## 3. 开启 Pages

进入仓库 Settings → Pages，在 Build and deployment 下将 Source 选择为 **GitHub Actions**。

进入 Actions → Deploy to GitHub Pages → Run workflow，选择 main 后运行。工作流也会在以后每次推送到 main 时自动运行。如果首次推送时尚未开启 Pages 导致失败，开启后重新运行即可。

等待 build 和 deploy 都成功，再打开 Pages 设置页给出的网站地址：

```text
https://YOUR_USERNAME.github.io/MyFlash/
```

手机浏览器打开相同网址即可，不需要电脑保持运行。首次发布可能需要等待数分钟。仓库名大小写和配置中的 `/MyFlash/` 保持一致。

## 4. 后续更新

```powershell
npm run lint
npm run build
git add .
git commit -m "Update MyFlash"
git push
```

## 常见问题

- 页面 404：确认 Pages 已选择 GitHub Actions，deploy 成功，访问地址包含 `/MyFlash/`。
- 页面空白或静态资源 404：确认 vite.config.ts 的 base 是 `/MyFlash/`，再重新构建并推送。
- 手机与电脑进度不同：存档保存在各自浏览器中，不会跨设备同步；localhost 和 GitHub Pages 也属于不同站点。
- 只想修改已有 GitHub 仓库名：在该仓库 Settings → General → Repository name 改为 MyFlash，再更新本地 origin 地址及部署路径。本文档不会自动修改任何线上仓库。

参考：[GitHub 官方 Pages 发布源配置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。
