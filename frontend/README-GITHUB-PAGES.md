## GitHub Pages 部署（仅前端静态）

GitHub Pages 只能托管静态文件。你需要把后端（Node/Express）单独部署到一台服务器或云平台，然后把前端的 `API_BASE_URL` 指向线上后端地址。

### 1. 推送到 GitHub

你可以推送整个仓库，也可以只推送 `frontend/` 到一个新的仓库。仓库名会影响 Pages 的访问路径。

### 2. 启用 Pages（Actions 方式）

1) 打开 GitHub 仓库 → Settings → Pages  
2) Source 选择 `GitHub Actions`

之后每次 push 到 `main/master` 都会自动构建并发布到 Pages。

### 3. 配置后端地址（必须）

在 GitHub 仓库 → Settings → Secrets and variables → Actions → Variables  
新增变量：

- `API_BASE_URL`：例如 `https://你的后端域名/api/v1`

工作流会把它注入到前端构建里（webpack DefinePlugin）。

### 4. 访问地址

默认是：

`https://<你的GitHub用户名>.github.io/<仓库名>/`

### 5. 路由说明

前端已切换为 Hash 路由（`/#/students` 这种），避免 GitHub Pages 的刷新 404 问题。
