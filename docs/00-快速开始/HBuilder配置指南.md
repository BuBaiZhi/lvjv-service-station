# HBuilder 配置指南

## 📋 概述

本指南说明如何在 HBuilder 中正确配置和运行本项目。

---

## 🎯 项目配置方式

### 方式选择

本项目支持两种开发方式，**建议选择其中一种**：

#### 方式 1：HBuilder IDE 方式（推荐新手）

**优点**：
- ✅ 无需命令行操作
- ✅ 一键运行和调试
- ✅ 内置小程序模拟器
- ✅ 自动热更新

**缺点**：
- ❌ 依赖 HBuilder IDE
- ❌ 不能使用 npm 脚本

#### 方式 2：CLI 方式（推荐开发者）

**优点**：
- ✅ 灵活性高
- ✅ 可以使用 npm 脚本
- ✅ 支持自定义构建
- ✅ 便于 CI/CD 集成

**缺点**：
- ❌ 需要命令行操作
- ❌ 需要配置环境

---

## 🚀 方式 1：HBuilder IDE 方式

### 第 1 步：在 HBuilder 中打开项目

```
1. 打开 HBuilder
2. 文件 → 打开文件夹
3. 选择项目根目录
4. 点击打开
```

### 第 2 步：安装依赖

在 HBuilder 中打开终端：

```bash
# 菜单 → 工具 → 终端 → 新建终端

# 然后运行
npm install
npm install pinia uni-ui
```

### 第 3 步：运行项目

#### 在浏览器中预览（推荐）

```
菜单 → 运行 → 运行到浏览器 → Chrome
```

**效果**：
- 浏览器自动打开
- 显示项目效果
- 修改代码自动刷新

#### 在小程序模拟器中预览

```
菜单 → 运行 → 运行到小程序模拟器 → 微信开发者工具
```

**效果**：
- 微信开发者工具自动打开
- 显示真实小程序环境
- 支持所有小程序特性

### 第 4 步：调试

按 F12 打开开发者工具：

```
- Console：查看日志和错误
- Elements：查看 DOM 结构
- Network：查看网络请求
- Application：查看本地存储
```

---

## 🖥️ 方式 2：CLI 方式

### 第 1 步：安装依赖

```bash
npm install
npm install pinia uni-ui
```

### 第 2 步：启动开发服务器

```bash
npm run dev
```

**输出**：
```
  VITE v4.4.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 第 3 步：打开浏览器

访问 `http://localhost:5173/`

### 第 4 步：调试

- 按 F12 打开开发者工具
- 修改代码自动刷新

---

## ⚙️ 项目配置文件说明

### `pages.json` - 页面路由配置

```json
{
  "pages": [
    {
      "path": "pages/user-center/index",
      "style": {
        "navigationBarTitleText": "用户中心",
        "enablePullDownRefresh": true
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarBackgroundColor": "#F5F5F5"
  }
}
```

**说明**：
- `pages`：所有页面的路由配置
- `globalStyle`：全局样式配置
- `tabBar`：底部标签栏配置（可选）

### `package.json` - 项目依赖配置

```json
{
  "name": "user-center",
  "version": "1.0.0",
  "scripts": {
    "dev": "uni",
    "build:h5": "uni build -p h5",
    "build:app": "uni build -p app"
  },
  "dependencies": {
    "vue": "^3.3.0",
    "pinia": "^2.1.0"
  }
}
```

**说明**：
- `scripts`：npm 命令脚本
- `dependencies`：项目依赖

### `vite.config.js` - Vite 构建配置

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    hmr: {
      overlay: true
    }
  }
})
```

**说明**：
- `plugins`：Vite 插件配置
- `server`：开发服务器配置

### `tsconfig.json` - TypeScript 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  }
}
```

**说明**：
- TypeScript 编译选项
- 类型检查配置

---

## 🔧 常见配置修改

### 修改 API 地址

编辑 `services/api.config.ts`：

```typescript
export const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3000/api',  // 开发环境
    timeout: 10000
  },
  production: {
    baseURL: 'https://api.example.com',    // 生产环境
    timeout: 10000
  }
}
```

### 修改项目名称

编辑 `package.json`：

```json
{
  "name": "my-project",
  "version": "1.0.0"
}
```

### 修改页面标题

编辑 `pages.json`：

```json
{
  "pages": [
    {
      "path": "pages/user-center/index",
      "style": {
        "navigationBarTitleText": "我的页面"
      }
    }
  ]
}
```

### 修改颜色主题

编辑 `styles/variables.scss`：

```scss
// 主色调
$primary-color: #4CAF50;      // 改为你的颜色
$secondary-color: #FDD835;    // 改为你的颜色
```

---

## 🐛 常见问题

### Q: 项目无法启动

**解决**：
```bash
# 1. 清除缓存
npm cache clean --force

# 2. 删除 node_modules
rm -rf node_modules

# 3. 重新安装
npm install
```

### Q: 页面空白

**解决**：
1. 按 F12 打开开发者工具
2. 查看 Console 标签页的错误信息
3. 根据错误信息调整代码

### Q: 样式不生效

**解决**：
1. 检查 `styles/variables.scss` 是否正确导入
2. 清除浏览器缓存（Ctrl + Shift + Delete）
3. 重新启动开发服务器

### Q: 找不到模块

**解决**：
1. 检查文件路径是否正确
2. 检查文件是否存在
3. 重启 HBuilder 或开发服务器

### Q: npm 安装失败

**解决**：
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 重新安装
npm install
```

---

## 📱 构建和发布

### 构建 H5 版本

```bash
npm run build:h5
```

**输出**：`dist/` 文件夹

### 构建 App 版本

```bash
npm run build:app
```

**输出**：可用于打包成 APK 或 IPA

### 构建小程序版本

在 HBuilder 中：

```
菜单 → 发行 → 小程序-微信
```

---

## ✅ 配置检查清单

- [ ] 项目已在 HBuilder 中打开
- [ ] 依赖已安装（npm install）
- [ ] 可以在浏览器中预览
- [ ] 可以在小程序模拟器中预览
- [ ] 开发者工具可以打开（F12）
- [ ] 修改代码可以自动刷新
- [ ] 没有控制台错误

---

## 💡 最佳实践

### 1. 定期清理缓存

```bash
# 每周清理一次
npm cache clean --force
```

### 2. 使用版本控制

```bash
# 初始化 Git
git init

# 添加 .gitignore
echo "node_modules/" > .gitignore
echo "dist/" >> .gitignore
echo ".DS_Store" >> .gitignore

# 提交代码
git add .
git commit -m "Initial commit"
```

### 3. 定期更新依赖

```bash
# 检查过期依赖
npm outdated

# 更新依赖
npm update
```

### 4. 使用 TypeScript

- 所有新文件都使用 `.ts` 或 `.tsx` 扩展名
- 定义清晰的类型
- 启用严格模式

---

## 🎯 下一步

1. ✅ 完成项目配置
2. ✅ 在浏览器中预览
3. ✅ 查看各个页面
4. ✅ 修改代码测试热更新
5. ✅ 打开开发者工具调试

**现在你已经准备好开发了！** 🚀

