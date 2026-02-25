# 🚀 后端快速开始指南

## 📁 项目结构

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MySQL 连接池配置
│   ├── controllers/
│   │   └── authController.js    # 认证业务逻辑（登录、刷新 token）
│   ├── services/
│   │   └── wechatService.js     # 微信 API 调用（code2Session）
│   ├── models/
│   │   └── user.js              # 用户数据库模型（CRUD）
│   ├── middleware/
│   │   └── auth.js              # JWT 认证中间件
│   ├── routes/
│   │   └── auth.js              # 认证路由（login、refresh）
│   └── app.js                   # Express 应用入口
├── .env                         # 环境变量（已添加 .gitignore）
├── .gitignore                   # Git 忽略文件
├── database.sql                 # MySQL 建表脚本
├── package.json                 # 项目配置和依赖
└── README.md                    # 项目说明
```

## 🔧 1️⃣ 初始化项目

### 步骤 1：安装依赖
```bash
cd e:\Desktop\校园\挑战杯\旅居服务站\backend
npm install
```

**依赖说明：**
- `express` - Web 框架
- `mysql2` - MySQL 驱动
- `jsonwebtoken` - JWT 令牌生成和验证
- `dotenv` - 环境变量管理
- `cors` - 跨域资源共享
- `axios` - HTTP 客户端（调用微信 API）
- `nodemon` - 自动重启（开发环境）

### 步骤 2：检查 `.env` 文件

已为您创建 `.env` 文件，包含以下配置：

```
WECHAT_APPID=wxf39739846f0c3925
WECHAT_SECRET=95e8bdd8c70341f9eb3e0b81886e33eb
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=zmy666
DB_NAME=travel_service
JWT_SECRET=d92f8a1e5b7c4d3f6a9b0c2e8f1a7d5c9e3b1f6a2d8c4e7
PORT=3000
```

⚠️ **重要提示：**
- ✅ `.env` 已添加到 `.gitignore`，不会提交到 Git
- ✅ JWT_SECRET 只在后端保存，前端看不到
- ✅ 数据库密码只在本地 `.env` 中，不会泄露

## 📊 2️⃣ 初始化数据库

### 步骤 1：创建数据库和表

使用 MySQL 客户端（如 MySQL Workbench、Navicat 或命令行）执行 `database.sql` 文件：

```bash
mysql -h localhost -u root -p < database.sql
```

或者在 MySQL 命令行中粘贴内容：

```sql
-- 复制 database.sql 中的所有 SQL 语句执行
```

**表结构说明：**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,          -- 用户 ID
  openid VARCHAR(100) UNIQUE NOT NULL,        -- 微信唯一标识
  nickname VARCHAR(255),                      -- 昵称
  avatar_url VARCHAR(500),                    -- 头像 URL
  gender INT DEFAULT 0,                       -- 性别
  province VARCHAR(100),                      -- 所在省份
  city VARCHAR(100),                          -- 所在城市
  country VARCHAR(100),                       -- 所在国家
  identity VARCHAR(50),                       -- 身份（villager|tourist|null）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_openid (openid),
  INDEX idx_created_at (created_at)
);
```

## 🎯 3️⃣ 启动后端服务

### 开发模式（推荐）
```bash
npm run dev
```

输出示例：
```
🚀 服务器启动成功！
📍 服务地址: http://localhost:3000
🔗 健康检查: http://localhost:3000/api/health
📝 登录接口: POST http://localhost:3000/api/auth/login

⚠️  请确保 MySQL 已启动且配置正确（数据库名: travel_service）
```

### 生产模式
```bash
npm start
```

## 🔌 4️⃣ API 接口说明

### 健康检查
```
GET http://localhost:3000/api/health
```

**响应示例：**
```json
{
  "code": 0,
  "message": "服务运行正常",
  "timestamp": "2026-02-21T10:30:00Z"
}
```

---

### 微信小程序登录
```
POST http://localhost:3000/api/auth/login
```

**请求头：**
```
Content-Type: application/json
```

**请求体：**
```json
{
  "code": "021ccc...",
  "userInfo": {
    "nickName": "张三",
    "avatarUrl": "https://...",
    "gender": 1,
    "province": "浙江",
    "city": "杭州",
    "country": "中国"
  }
}
```

**响应成功（200，code: 0）：**
```json
{
  "code": 0,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "userInfo": {
      "id": 1,
      "nickName": "张三",
      "avatarUrl": "https://...",
      "gender": 1,
      "province": "浙江",
      "city": "杭州",
      "country": "中国",
      "identity": null,
      "createdAt": "2026-02-21T10:30:00Z"
    }
  }
}
```

**响应失败（401，code: 401）：**
```json
{
  "code": 401,
  "message": "微信登录失败，请检查登录码是否有效"
}
```

---

### 刷新 Token
```
POST http://localhost:3000/api/auth/refresh
```

**请求头：**
```
Content-Type: application/json
```

**请求体：**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**响应成功（200，code: 0）：**
```json
{
  "code": 0,
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

## 🔄 5️⃣ 登录流程详解

### 小程序端流程
1. 用户点击登录按钮
2. 执行 `wx.login()` 获取临时登录码 `code`
3. 执行 `wx.getUserProfile()` 获取用户信息（头像、昵称等）
4. 调用后端 `/api/auth/login` 接口，传送 `code` + `userInfo`

### 后端处理流程
1. 接收前端的 `code` 和 `userInfo`
2. 调用微信服务器 `code2Session` 接口，用 `code` 换取 `openid`
3. 根据 `openid` 查询数据库：
   - **用户存在**：返回现有用户信息
   - **用户不存在**：创建新用户记录
4. 生成 JWT tokens：
   - **accessToken**：短期 token（1小时过期），用于请求认证
   - **refreshToken**：长期 token（30天过期），用于刷新 accessToken
5. 返回 `accessToken`、`refreshToken` 和用户信息给前端

### 前端保存流程
1. 接收后端响应的 tokens 和用户信息
2. 保存到 `wx.storage`（持久化）
3. 保存到 `app.globalData`（内存）
4. 标记 `authMode = 'user'`（已登录状态）
5. 跳转到身份选择页面（首次登录）或首页

## 🛡️ 6️⃣ Token 管理

### Token 过期处理
- **accessToken 过期（1小时）**：
  - 前端发请求时自动用 `refreshToken` 调用 `/api/auth/refresh`
  - 获取新的 `accessToken`
  - 自动重试原请求

- **refreshToken 过期（30天）**：
  - 无法刷新，需要用户重新登录
  - 清理本地认证信息
  - 跳转登录页

### HTTP 拦截器（前端）
前端的 `services/http.js` 已配置了完整的 token 管理机制：
- 自动注入 `Authorization: Bearer <accessToken>` 头
- 自动处理 401 响应
- 自动刷新 token
- 并发请求队列管理

## 🧪 7️⃣ 测试建议

### 使用 Postman 测试后端接口

#### 测试 1：健康检查
```
GET http://localhost:3000/api/health
```

#### 测试 2：模拟登录
使用真实的微信 `code` 测试（需要从小程序获取）

或者修改 `authController.js` 添加测试端点（仅开发环境）

### 使用小程序测试前端流程

1. 确保小程序 `app.js` 中的 API 地址配置正确：
   ```javascript
   api: {
     baseURL: 'http://localhost:3000'  // 开发环境
   }
   ```

2. 在小程序中点击登录按钮，完整流程应该是：
   - ✅ 弹出微信授权框
   - ✅ 点击允许后获取用户信息
   - ✅ 调用后端 `/api/auth/login` 接口
   - ✅ 保存 tokens 和用户信息
   - ✅ 跳转到身份选择页面或首页

## 🚨 常见问题

### Q1: 后端无法连接到 MySQL
**排查步骤：**
1. 确保 MySQL 已启动
2. 检查 `.env` 中的 `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD` 是否正确
3. 确保已执行 `database.sql` 建表
4. 检查数据库名 `travel_service` 是否存在

### Q2: 小程序调用后端返回跨域错误
**解决方案：**
1. 确保后端 `app.js` 中配置了 `cors()`
2. 在微信公众平台配置服务器域名：
   - 检查 `project.config.json` 中的请求域名
   - 添加 `localhost:3000` 到本地开发域名

### Q3: Token 验证失败
**排查步骤：**
1. 检查 `.env` 中的 `JWT_SECRET` 是否与前端一致（不应该一致！前端不需要知道）
2. 检查 `Authorization` 头格式是否为 `Bearer <token>`
3. 检查 token 是否过期

### Q4: 微信 code2Session 返回错误
**常见错误：**
- `errcode: 40001` - AppID 或 AppSecret 错误
- `errcode: 40002` - AppID 或 AppSecret 错误
- `errcode: 40013` - 无效的 AppID
- `errcode: 45011` - code 使用过一次或已过期

**解决方案：**
1. 检查 `.env` 中的 `WECHAT_APPID` 和 `WECHAT_SECRET` 是否正确
2. 确保 `code` 是从 `wx.login()` 刚获取的（5分钟内）
3. 同一个 `code` 只能使用一次

## 📦 下一步

后端登录服务已完全实现，可以进行以下扩展：

1. **添加其他 API 端点**（用户信息、发布内容等）
2. **实现身份选择接口**（villager 或 tourist）
3. **添加数据库迁移脚本**（用于团队协作）
4. **配置生产环境**（真实服务器、数据库等）
5. **添加日志系统**（Winston、Morgan 等）
6. **添加速率限制**（防止暴力攻击）

祝您开发愉快！🎉
