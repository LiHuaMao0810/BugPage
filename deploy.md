# 一键部署指南

这是一个纯前端项目，可以部署到多个静态网站托管平台。以下是几种主流的一键部署方案：

## 🚀 GitHub Pages 部署

### 方法1：通过GitHub Actions自动部署

1. 将代码推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择"GitHub Actions"作为源
4. 项目会自动部署到：`https://你的用户名.github.io/仓库名`

### 方法2：直接部署

1. 进入GitHub仓库设置
2. 找到"Pages"选项
3. 选择"Deploy from a branch"
4. 选择"main"分支和"/ (root)"文件夹
5. 点击"Save"

## 🌐 Netlify 部署

### 拖拽部署（最简单）

1. 访问 [netlify.com](https://netlify.com)
2. 注册/登录账户
3. 将整个项目文件夹拖拽到部署区域
4. 自动获得一个 `.netlify.app` 域名

### Git连接部署

1. 在Netlify中点击"New site from Git"
2. 连接GitHub仓库
3. 构建设置：
   - Build command: 留空
   - Publish directory: `/`
4. 点击"Deploy site"

## ⚡ Vercel 部署

### 一键部署

1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub账户登录
3. 点击"New Project"
4. 选择你的仓库
5. 框架预设选择"Other"
6. 点击"Deploy"

### 使用Vercel CLI

```bash
# 安装Vercel CLI
npm i -g vercel

# 在项目目录中运行
vercel

# 按照提示完成部署
```

## 🔥 Firebase Hosting

### 部署步骤

1. 安装Firebase CLI：
```bash
npm install -g firebase-tools
```

2. 登录Firebase：
```bash
firebase login
```

3. 初始化项目：
```bash
firebase init hosting
```

4. 配置选择：
   - Public directory: `.` (当前目录)
   - Single-page app: `No`
   - 不覆盖index.html

5. 部署：
```bash
firebase deploy
```

## 📦 其他平台

### Surge.sh
```bash
# 安装surge
npm install -g surge

# 在项目目录中运行
surge
```

### GitHub Codespaces
1. 在GitHub仓库中点击"Code" > "Codespaces"
2. 创建新的Codespace
3. 运行：`python -m http.server 8000`
4. 端口会自动转发，可以公开访问

## 🛠️ 自定义域名

大部分平台都支持自定义域名：

1. **Netlify**: 在站点设置中添加自定义域名
2. **Vercel**: 在项目设置中添加域名
3. **GitHub Pages**: 在仓库设置的Pages部分添加

## 📋 部署检查清单

- [ ] 确保所有文件路径使用相对路径
- [ ] 检查PDF.js CDN链接是否可访问
- [ ] 测试在不同设备上的响应式效果
- [ ] 验证所有功能正常工作
- [ ] 设置自定义域名（可选）

## 🔧 环境变量配置

由于这是纯前端项目，不需要环境变量。所有配置都在代码中硬编码。

## 📱 PWA支持（可选扩展）

如果想要添加PWA支持，可以创建以下文件：

- `manifest.json` - 应用清单
- `sw.js` - Service Worker
- 在HTML中添加相应的meta标签

## 🚨 注意事项

1. **HTTPS要求**：现代浏览器要求某些功能（如文件上传）必须在HTTPS环境下运行
2. **CORS问题**：如果遇到跨域问题，确保使用HTTPS部署
3. **缓存策略**：部署后可能需要强制刷新浏览器缓存

选择任一平台，几分钟内就能完成部署！推荐使用Netlify或Vercel，它们提供了最佳的开发体验。