# 部署指南

## 🚀 方案一：前端部署到 Vercel（快速开始）

### 前置准备
1. 注册 GitHub 账号：https://github.com
2. 注册 Vercel 账号：https://vercel.com（用 GitHub 账号登录）

### 步骤

#### 1. 创建 GitHub 仓库
- 访问 https://github.com/new
- 创建一个新仓库（可以设为 Public 或 Private）

#### 2. 初始化 Git 并推送代码
在项目目录运行：
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/您的用户名/您的仓库名.git
git push -u origin main
```

#### 3. 在 Vercel 中导入项目
- 访问 https://vercel.com/new
- 选择刚才创建的 GitHub 仓库
- 点击 "Import"

#### 4. 配置项目
- **Framework Preset**: 选择 `Other`
- **Root Directory**: 保持默认
- **Build Command**: `npm run build:client`
- **Output Directory**: `dist/client`
- **Environment Variables**: 添加 `AI_API_KEY`，值为您的 API Key

#### 5. 部署
点击 "Deploy" 按钮，等待部署完成！

---

## 🌐 方案二：完整全栈部署（推荐）

如果您需要完整的后端功能，可以使用以下平台：

### 后端部署选项
- **Railway**: https://railway.app（简单易用）
- **Render**: https://render.com
- **Fly.io**: https://fly.io

### 部署步骤
1. 先把代码推送到 GitHub
2. 在 Railway/Render 中导入项目
3. 配置环境变量 `AI_API_KEY`
4. 部署完成后会得到一个后端链接
5. 更新前端配置中的 API 地址

---

## 📝 临时分享方案（最快）

如果您只是想临时分享给朋友测试：

### 使用 ngrok（推荐）
1. 下载 ngrok：https://ngrok.com/download
2. 解压后运行：`./ngrok http 5173`
3. 复制显示的链接分享即可

---

## 💡 提示
- 确保您的 `AI_API_KEY` 已正确配置
- 本地开发时应用运行在 http://localhost:5173
- 部署后的链接是永久的，可以随时分享给任何人！