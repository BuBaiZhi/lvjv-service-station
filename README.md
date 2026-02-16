# 乡村数字游民对接平台 - 用户中心

## 📱 项目简介

这是一个为乡村和数字游民对接平台设计的用户中心模块。村民可以上传房源和技能，数字游民可以浏览和预订，双方都可以向服务站寻求帮助。

## 🎯 核心功能

### 用户信息管理
- 👤 用户头像、昵称、身份标签
- 📊 社区参与数据统计
- ✏️ 编辑个人资料

### 我的交易
- 📦 房源预订记录
- 🎉 活动报名记录
- 💼 技能服务交易
- 📋 订单状态管理

### 我的发布
- 🏠 房源管理
- 🎪 活动管理
- 🎓 技能贴管理
- 💬 交流贴管理

### 我的记录
- 🕐 浏览历史
- ❤️ 收藏内容

### 服务与支持
- 💬 客服中心
- 🏘️ 服务站咨询
- ❓ 常见问题
- ℹ️ 关于我们

### 用户设置
- 👤 编辑资料
- 🔄 身份切换
- 🔔 通知设置
- 🔒 隐私与安全

## 🎨 设计特色

### 色彩方案
- **主色调**：绿色系（#4CAF50）- 代表自然、生机、信任
- **辅助色**：鹅黄色系（#FDD835）- 代表温暖、阳光、活力
- **中性色**：灰色系 - 用于文字和背景

### 设计理念
- 乡村温暖感 + 现代简洁风格
- 清晰的视觉层级
- 统一的设计系统

## 🚀 快速开始

### 前置要求
- Node.js v14+
- npm 或 yarn

### 安装步骤

```bash
# 1. 创建 uni-app 项目
npx degit dcloudio/uni-app-ts user-center
cd user-center

# 2. 安装依赖
npm install
npm install pinia uni-ui

# 3. 复制项目文件
# 将 pages/, components/, stores/ 等文件夹复制到 src/ 目录

# 4. 启动开发服务器
npm run dev

# 5. 打开浏览器
# 访问 http://localhost:5173
```

## 📁 项目结构

```
user-center/
├── pages/                          # 页面文件
│   └── user-center/
│       ├── index.vue               # 用户中心主页面
│       ├── edit-profile.vue        # 编辑资料页
│       └── settings.vue            # 设置页
├── components/                     # 可复用组件
│   ├── UserCard.vue               # 用户信息卡片
│   ├── OrderList.vue              # 订单列表
│   ├── PublishList.vue            # 发布内容列表
│   ├── HistoryList.vue            # 历史记录列表
│   ├── ServiceSupport.vue         # 服务支持
│   └── SettingsList.vue           # 设置列表
├── stores/                         # Pinia 状态管理
│   └── user.ts                    # 用户状态 store
├── services/                       # API 服务层
│   └── user.ts                    # 用户相关 API
├── mock/                           # Mock 数据
│   └── userData.ts                # 用户 Mock 数据
├── types/                          # TypeScript 类型定义
│   └── user.ts                    # 用户相关类型
├── styles/                         # 全局样式
│   └── variables.scss             # 设计系统变量
├── utils/                          # 工具函数
│   └── storage.ts                 # 本地存储工具
└── 文档/                           # 项目文档
    ├── 快速参考卡.md              # 快速参考
    ├── 快速启动说明.md            # 快速启动
    ├── 项目运行指南.md            # 运行指南
    ├── UI设计方案.md              # 设计方案
    ├── UI组件使用指南.md          # 使用指南
    └── ...
```

## 🛠️ 技术栈

- **框架**：uni-app + Vue 3
- **语言**：TypeScript
- **状态管理**：Pinia
- **UI 组件库**：uni-ui
- **样式**：SCSS

## 📚 文档

### 快速开始
- [快速参考卡](./快速参考卡.md) - 快速参考
- [快速启动说明](./快速启动说明.md) - 5分钟快速开始
- [项目运行指南](./项目运行指南.md) - 详细运行指南

### 设计和规范
- [UI设计方案](./UI设计方案.md) - 完整的设计规范
- [UI组件使用指南](./UI组件使用指南.md) - 组件使用方法
- [UI设计总结](./UI设计总结.md) - 设计总结

### 项目信息
- [用户中心功能设计](./用户中心功能设计.md) - 功能需求
- [开发步骤计划](./开发步骤计划.md) - 开发计划
- [项目框架设计说明](./项目框架设计说明.md) - 框架设计
- [项目完整总结](./项目完整总结.md) - 项目总结

### 配置
- [配置文件示例](./配置文件示例.md) - 配置文件示例
- [如何查看项目效果](./如何查看项目效果.md) - 查看效果指南

## 🎨 设计系统

### 颜色
- 主绿色：#4CAF50
- 鹅黄色：#FDD835
- 深灰色：#212121
- 浅灰色：#F5F5F5

### 排版
- 标题：24px / 700
- 正文：16px / 400
- 辅助：12px / 400

### 间距
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 20px

## 📱 支持平台

- ✅ 浏览器（H5）
- ✅ 微信小程序
- ✅ 支付宝小程序
- ✅ 字节跳动小程序
- ✅ iOS App
- ✅ Android App

## 🔧 常用命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 构建微信小程序
npm run build:mp-weixin

# 构建支付宝小程序
npm run build:mp-alipay

# 构建字节跳动小程序
npm run build:mp-toutiao

# 预览
npm run preview
```

## 🐛 常见问题

### Q: 如何快速查看效果？
A: 参考 [快速启动说明](./快速启动说明.md)，5分钟内可以看到效果。

### Q: 如何修改颜色？
A: 编辑 `styles/variables.scss` 中的颜色变量，所有组件都会自动更新。

### Q: 如何添加新页面？
A: 在 `pages/` 目录下创建新页面，然后在 `pages.json` 中配置路由。

### Q: 如何接入真实 API？
A: 编辑 `services/user.ts` 中的 API 调用，替换 Mock 数据为真实 API。

## 📊 项目统计

- 📄 文档：15+ 个
- 📝 Vue 组件：7 个
- 🔧 TypeScript 文件：4 个
- 🎨 SCSS 文件：1 个
- 📚 代码行数：5000+ 行

## 🎓 学习资源

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)

## 📝 开发步骤

### 第一阶段：框架搭建 ✅
- ✅ 项目结构设计
- ✅ 类型定义
- ✅ Mock 数据
- ✅ 状态管理
- ✅ 组件框架

### 第二阶段：UI 设计 ✅
- ✅ 色彩系统
- ✅ 排版系统
- ✅ 组件设计
- ✅ 样式系统

### 第三阶段：组件完善 🔄
- ⏳ 样式优化
- ⏳ 交互完善
- ⏳ 动画效果

### 第四阶段：功能实现 🔄
- ⏳ 下拉刷新
- ⏳ 上拉加载
- ⏳ 本地缓存
- ⏳ 用户交互

### 第五阶段：后端接入 🔄
- ⏳ API 接口定义
- ⏳ 数据请求
- ⏳ 错误处理
- ⏳ 测试调试

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

乡村数字游民对接平台团队

## 🙏 致谢

感谢 uni-app、Vue 3、Pinia 等开源项目的支持。

---

## 🚀 现在就开始吧！

```bash
# 一键启动
npx degit dcloudio/uni-app-ts user-center && \
cd user-center && \
npm install && \
npm install pinia uni-ui && \
npm run dev
```

然后在浏览器打开 `http://localhost:5173` 查看效果！

**祝你开发愉快！** 🎉

---

## 📞 需要帮助？

- 📖 查看 [快速参考卡](./快速参考卡.md)
- 🚀 查看 [快速启动说明](./快速启动说明.md)
- 📚 查看 [项目运行指南](./项目运行指南.md)
- 🎨 查看 [UI设计方案](./UI设计方案.md)

---

**最后更新**：2024年2月11日
