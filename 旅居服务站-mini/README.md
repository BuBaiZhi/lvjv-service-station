# 旅居服务站 - 微信小程序

<p align="center">
  <img src="https://img.shields.io/badge/WeChat-%E5%B0%8F%E7%A8%8B%E5%BA%8F-blue" alt="WeChat Mini Program">
  <img src="https://img.shields.io/badge/Version-1.3.0-green" alt="Version">
</p>

微信小程序原生开发项目，提供旅居服务相关的用户中心功能。

---

## 项目结构

```
旅居服务站-mini/
├── app.js              # 小程序入口
├── app.json            # 全局配置
├── app.wxss            # 全局样式
├── project.config.json # 项目配置
├── sitemap.json        # Sitemap配置
├── images/             # 图片资源
└── pages/              # 页面目录
    ├── index/          # 首页
    └── user-center/    # 用户中心
        ├── index/              # 用户中心主页
        ├── edit-profile/       # 编辑资料
        ├── order-list/         # 我的交易
        ├── publish-list/       # 我的发布
        ├── history-list/       # 我的记录
        ├── service-support/    # 服务与支持
        └── settings/           # 设置
```

---

## 功能特性

### 用户中心

- **用户卡片**
  - 头像、昵称显示
  - 身份徽章（村民/游民）
  - 性别、年龄、ID展示
  - 个性签名
  - 渐变背景（6种预设 + 自定义上传）

- **统计数据**
  - 帖子数、评论数、点赞数

- **功能菜单**
  - 编辑资料
  - 我的交易
  - 我的发布
  - 我的记录
  - 服务与支持
  - 设置

### 编辑资料

- 头像更换（相册/拍照）
- 背景更换：
  - 6种预设渐变背景
  - 自定义图片上传
  - 恢复默认背景
- 个人信息编辑（昵称、性别、年龄、手机号、签名）
- 数据本地持久化

### 设置

- 主题切换（浅色/深色）
- 应用版本（标准版/老人友好版）
- 清除缓存

---

## 快速开始

### 开发环境

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

2. 导入项目：
   - 打开微信开发者工具
   - 点击"导入项目"
   - 选择 `旅居服务站-mini` 目录
   - 填写 AppID（可以使用测试号）

3. 编译运行：
   - 点击编译按钮或使用快捷键 Ctrl+B
   - 即可在模拟器中预览

### 目录结构说明

| 目录/文件 | 说明 |
|----------|------|
| `app.js` | 小程序入口，定义全局数据和方法 |
| `app.json` | 全局配置，包括页面路径、窗口样式等 |
| `app.wxss` | 全局样式，所有页面共享 |
| `pages/` | 页面目录，每个子目录为一个页面 |
| `images/` | 图片资源目录 |

---

## 页面说明

### 首页 (pages/index/)

小程序首页，展示欢迎信息和基础入口。

### 用户中心 (pages/user-center/index/)

用户个人信息中心，包含：
- 用户信息卡片（带渐变背景）
- 统计数据展示
- 功能菜单列表

### 编辑资料 (pages/user-center/edit-profile/)

个人信息编辑页面：
- 头部用户卡片（支持背景更换）
- 表单区域（头像、昵称、性别、年龄、手机号、签名）
- 保存功能

### 我的交易 (pages/user-center/order-list/)

订单列表页面，展示用户的交易记录。

### 我的发布 (pages/user-center/publish-list/)

发布列表页面，展示用户发布的旅居信息。

### 我的记录 (pages/user-center/history-list/)

浏览记录页面，记录用户的浏览历史。

### 服务与支持 (pages/user-center/service-support/)

服务支持页面，提供常见帮助入口。

### 设置 (pages/user-center/settings/)

应用设置页面：
- 主题切换
- 版本切换（标准版/老人版）
- 清除缓存

---

## 技术栈

- **开发框架**：微信小程序原生开发
- **语言**：JavaScript
- **模板**：WXML
- **样式**：WXSS
- **单位**：rpx（响应式单位）

---

## 更新日志

### v1.3.0 (2026-02-18)

- 完成微信小程序原生开发
- 实现用户中心完整功能
- 支持渐变背景更换（6种预设 + 自定义上传）
- 支持深色模式和老人友好版

---

## 后续开发计划

- [ ] 首页内容模块开发
- [ ] 数据接口对接
- [ ] 用户登录功能
- [ ] 详情页开发
- [ ] 评论功能
- [ ] 消息通知

---

## 注意事项

1. 图片占位符使用 picsum.photos 网络图片
2. 数据存储使用 wx.setStorageSync 本地存储
3. 老人友好版支持字体放大和按钮增大
4. 开发时注意使用 rpx 单位保证响应式布局
