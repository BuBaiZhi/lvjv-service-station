# 后端 API 开发设计与实施计划

**项目名称**：旅居服务站  
**文档版本**：v1.0  
**创建日期**：2026-02-25  
**负责人**：后端开发团队  
**状态**：待审核

---

## 📋 目录

1. [项目现状分析](#一项目现状分析)
2. [API 架构设计](#二api-架构设计)
3. [数据库完整设计](#三数据库完整设计)
4. [分阶段开发计划](#四分阶段开发计划)
5. [详细开发任务](#五详细开发任务)
6. [风险分析与评估](#六风险分析与评估)
7. [质量保证策略](#七质量保证策略)
8. [测试计划](#八测试计划)

---

## 一、项目现状分析

### 1.1 已完成部分

✅ **认证模块（60% 完成）**

| 功能 | 状态 | 说明 |
|------|------|------|
| 微信登录 | ✅ 完成 | `POST /api/auth/login` |
| Token 刷新 | ✅ 完成 | `POST /api/auth/refresh` |
| 用户查询（Model） | ✅ 完成 | `findUserByOpenid` |
| 用户创建（Model） | ✅ 完成 | `createUser` |
| 用户更新（Model） | ✅ 完成 | `updateUser` |
| JWT 认证中间件 | ✅ 完成 | `middleware/auth.js` |

✅ **基础设施（80% 完成）**

| 组件 | 状态 | 说明 |
|------|------|------|
| Express 应用 | ✅ 完成 | `src/app.js` |
| 数据库连接池 | ✅ 完成 | `config/database.js` |
| 微信服务 | ✅ 完成 | `services/wechatService.js` |
| 环境配置 | ✅ 完成 | `.env` |
| 错误处理 | ⚠️ 基础 | 需完善 |
| 日志系统 | ❌ 缺失 | 待开发 |
| 参数验证 | ❌ 缺失 | 待开发 |

### 1.2 待开发部分

❌ **用户模块 API（40% 缺失）**
- 获取用户信息接口
- 更新用户信息接口
- 上传头像接口
- 选择身份接口

❌ **订单模块 API（100% 缺失）**
- 订单 CRUD
- 订单状态流转
- 订单评价

❌ **内容模块 API（100% 缺失）**
- 民宿、技能、活动、广场
- 发布、列表、详情、搜索

❌ **消息模块 API（100% 缺失）**
- 系统通知
- 私聊功能

### 1.3 数据库现状

⚠️ **数据库表不完整**

**已创建**：
- `users` 表（基础字段，缺少完整字段）

**待创建**：
- `items` 表（核心内容表）
- `orders` 表（订单表）
- `messages` 表（消息表）
- `chat_messages` 表（聊天表）
- `favorites` 表（收藏表）
- `browse_history` 表（浏览历史表）
- `likes` 表（点赞表）
- `comments` 表（评论表）
- `follows` 表（关注表）

---

## 二、API 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────┐
│           前端（微信小程序）                │
└──────────────────┬──────────────────────────┘
                   │ HTTPS + JSON
┌──────────────────▼──────────────────────────┐
│         Nginx 反向代理（可选）              │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Express 应用（Node.js）              │
├─────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  中间件  │  │  路由层  │  │ 控制器层 │  │
│  ├──────────┤  ├──────────┤  ├──────────┤  │
│  │ - 认证   │→ │ - Auth   │→ │ - Auth   │  │
│  │ - 日志   │  │ - User   │  │ - User   │  │
│  │ - 错误   │  │ - Item   │  │ - Item   │  │
│  │ - 验证   │  │ - Order  │  │ - Order  │  │
│  │ - CORS   │  │ - Message│  │ - Message│  │
│  └──────────┘  └──────────┘  └─────┬────┘  │
│                                     │       │
│                            ┌────────▼────┐  │
│                            │   服务层    │  │
│                            ├─────────────┤  │
│                            │ - Wechat    │  │
│                            │ - Upload    │  │
│                            │ - SMS       │  │
│                            └────────┬────┘  │
│                                     │       │
│                            ┌────────▼────┐  │
│                            │   模型层    │  │
│                            ├─────────────┤  │
│                            │ - User      │  │
│                            │ - Item      │  │
│                            │ - Order     │  │
│                            │ - Message   │  │
│                            └────────┬────┘  │
└─────────────────────────────────────┼───────┘
                                      │
                         ┌────────────▼────────────┐
                         │   MySQL 数据库          │
                         │  - users                │
                         │  - items                │
                         │  - orders               │
                         │  - messages             │
                         │  - ...                  │
                         └─────────────────────────┘
```

### 2.2 分层职责

#### 2.2.1 中间件层（Middleware）

| 中间件 | 职责 | 优先级 |
|--------|------|--------|
| **认证中间件** | 验证 JWT token | 🔴 高 |
| **日志中间件** | 记录请求日志 | 🟡 中 |
| **错误处理中间件** | 统一错误响应 | 🔴 高 |
| **参数验证中间件** | 验证请求参数 | 🔴 高 |
| **CORS 中间件** | 跨域支持 | ✅ 已完成 |
| **限流中间件** | 防止暴力请求 | 🟢 低 |
| **上传中间件** | 文件上传处理 | 🟡 中 |

#### 2.2.2 路由层（Routes）

按业务模块划分：

```javascript
/api/
├── /auth            // 认证模块
│   ├── POST /login
│   ├── POST /refresh
│   └── POST /logout
│
├── /user            // 用户模块
│   ├── GET /info
│   ├── PUT /info
│   ├── POST /avatar
│   └── PUT /identity
│
├── /item            // 内容模块
│   ├── GET /list
│   ├── GET /:id
│   ├── POST /create
│   ├── PUT /:id
│   ├── DELETE /:id
│   ├── GET /search
│   └── POST /:id/view
│
├── /order           // 订单模块
│   ├── POST /create
│   ├── GET /list
│   ├── GET /:id
│   ├── PUT /:id/status
│   ├── POST /:id/pay
│   ├── POST /:id/cancel
│   └── POST /:id/evaluate
│
├── /message         // 消息模块
│   ├── GET /list
│   ├── GET /unread-count
│   ├── PUT /:id/read
│   ├── GET /chat/:userId
│   └── POST /send
│
├── /favorite        // 收藏模块
│   ├── POST /add
│   ├── DELETE /remove
│   └── GET /list
│
├── /history         // 历史模块
│   ├── POST /add
│   └── GET /list
│
├── /comment         // 评论模块
│   ├── POST /create
│   ├── GET /list
│   ├── DELETE /:id
│   └── POST /:id/like
│
└── /follow          // 关注模块
    ├── POST /add
    ├── DELETE /remove
    └── GET /list
```

#### 2.2.3 控制器层（Controllers）

负责业务逻辑处理：

```javascript
controllers/
├── authController.js      // ✅ 已完成
├── userController.js      // ❌ 待开发
├── itemController.js      // ❌ 待开发
├── orderController.js     // ❌ 待开发
├── messageController.js   // ❌ 待开发
├── favoriteController.js  // ❌ 待开发
├── historyController.js   // ❌ 待开发
├── commentController.js   // ❌ 待开发
└── followController.js    // ❌ 待开发
```

#### 2.2.4 服务层（Services）

封装第三方服务或复杂业务逻辑：

```javascript
services/
├── wechatService.js       // ✅ 已完成
├── uploadService.js       // ❌ 待开发（OSS/本地文件）
├── smsService.js          // ❌ 待开发（短信验证码）
├── notificationService.js // ❌ 待开发（消息推送）
└── paymentService.js      // ❌ 待开发（微信支付）
```

#### 2.2.5 模型层（Models）

封装数据库操作：

```javascript
models/
├── user.js                // ✅ 已完成（部分）
├── item.js                // ❌ 待开发
├── order.js               // ❌ 待开发
├── message.js             // ❌ 待开发
├── favorite.js            // ❌ 待开发
├── history.js             // ❌ 待开发
├── comment.js             // ❌ 待开发
├── like.js                // ❌ 待开发
└── follow.js              // ❌ 待开发
```

### 2.3 API 响应规范

#### 2.3.1 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    // 业务数据
  },
  "timestamp": 1708847461
}
```

#### 2.3.2 失败响应

```json
{
  "code": 400,
  "message": "参数错误",
  "errors": [
    {
      "field": "title",
      "message": "标题不能为空"
    }
  ],
  "timestamp": 1708847461
}
```

#### 2.3.3 分页响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "timestamp": 1708847461
}
```

### 2.4 错误码设计

| 错误码范围 | 说明 | 示例 |
|-----------|------|------|
| 0 | 成功 | 0 |
| 400-499 | 客户端错误 | 400: 参数错误, 401: 未授权, 404: 不存在 |
| 500-599 | 服务端错误 | 500: 服务器错误, 503: 服务不可用 |
| 1000-1999 | 业务错误 | 1001: 用户不存在, 1002: 订单状态不正确 |

---

## 三、数据库完整设计

### 3.1 数据库 ER 图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   users     │     │   orders    │     │  messages   │
│   (用户表)   │     │   (订单表)  │     │  (消息表)   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │◄────│ buyer_id    │     │ id (PK)     │
│ openid      │     │ seller_id   │     │ from_id     │
│ nickname    │     │ item_id(FK) │     │ to_id       │
│ avatar_url  │     │ order_no    │     │ content     │
│ identity    │     │ total_amount│     │ type        │
│ ...         │     │ status      │     │ is_read     │
└──────┬──────┘     └─────┬───────┘     └──────┬──────┘
       │                  │                    │
       │                  │                    │
       │        ┌─────────▼────────┐           │
       │        │   items          │           │
       │        │  (内容表)         │           │
       │        ├──────────────────┤           │
       │        │ id (PK)          │           │
       │────────┤ user_id (FK)     │           │
       │        │ type             │           │
       │        │ category         │           │
       │        │ title            │           │
       │        │ price            │           │
       │        │ status           │           │
       │        │ view_count       │           │
       │        │ like_count       │           │
       │        └──────┬───────────┘           │
       │               │                       │
       │               │                       │
┌──────▼───────┐ ┌────▼───────┐ ┌─────▼──────┐
│ favorites    │ │  likes     │ │ comments   │
│  (收藏表)     │ │ (点赞表)   │ │ (评论表)   │
├──────────────┤ ├────────────┤ ├────────────┤
│ user_id (FK) │ │ user_id    │ │ user_id    │
│ item_id (FK) │ │ item_id    │ │ item_id    │
└──────────────┘ └────────────┘ │ content    │
                                └────────────┘
```

### 3.2 核心表设计

#### 3.2.1 users 表（用户表）- 需扩展

**当前字段**（database.sql）：
```sql
- id, openid, nickname, avatar_url, gender
- province, city, country, identity
- created_at, updated_at
```

**需要添加的字段**：
```sql
ALTER TABLE users ADD COLUMN `phone` VARCHAR(20) COMMENT '手机号';
ALTER TABLE users ADD COLUMN `wechat` VARCHAR(50) COMMENT '微信号';
ALTER TABLE users ADD COLUMN `bio` TEXT COMMENT '个人简介';
ALTER TABLE users ADD COLUMN `location` VARCHAR(100) COMMENT '所在地';
ALTER TABLE users ADD COLUMN `theme` ENUM('light', 'dark') DEFAULT 'light';
ALTER TABLE users ADD COLUMN `app_version` ENUM('standard', 'elderly') DEFAULT 'standard';
ALTER TABLE users ADD COLUMN `notification_enabled` TINYINT(1) DEFAULT 1;
ALTER TABLE users ADD COLUMN `post_count` INT DEFAULT 0;
ALTER TABLE users ADD COLUMN `order_count` INT DEFAULT 0;
ALTER TABLE users ADD COLUMN `status` ENUM('active', 'banned') DEFAULT 'active';
```

#### 3.2.2 items 表（内容表）- 需创建

**核心字段**：
```sql
CREATE TABLE `items` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '发布者ID',
  `type` ENUM('house', 'skill', 'activity', 'post') NOT NULL,
  `category` VARCHAR(30),
  `title` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `images` JSON COMMENT '图片数组',
  `price` DECIMAL(10,2),
  `unit` VARCHAR(20) COMMENT '单位：元/天、元/次',
  `location` VARCHAR(100),
  `contact` JSON COMMENT '{phone, wechat}',
  
  -- 统计
  `view_count` INT DEFAULT 0,
  `like_count` INT DEFAULT 0,
  `comment_count` INT DEFAULT 0,
  `favorite_count` INT DEFAULT 0,
  
  -- 状态
  `status` ENUM('draft', 'published', 'offline', 'deleted') DEFAULT 'draft',
  
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 3.2.3 orders 表（订单表）- 需创建

详见 API 设计文档第 2.2.3 节

#### 3.2.4 messages 表（消息表）- 需创建

详见 API 设计文档第 2.2.4 节

### 3.3 数据库初始化 SQL

创建完整的 `database_full.sql` 文件，包含所有表结构。

---

## 四、分阶段开发计划

### 4.1 开发原则

1. **小步快跑**：每次开发 1 个功能，立即测试
2. **测试先行**：先写测试用例，再写实现代码
3. **增量开发**：先核心功能，后扩展功能
4. **及时重构**：发现问题立即优化

### 4.2 阶段划分

| 阶段 | 目标 | 工作量 | 优先级 |
|------|------|--------|--------|
| **阶段 0** | 基础设施完善 | 1 天 | 🔴 最高 |
| **阶段 1** | 用户模块完善 | 2 天 | 🔴 高 |
| **阶段 2** | 内容模块（核心 CRUD） | 3 天 | 🔴 高 |
| **阶段 3** | 订单模块（核心流程） | 3 天 | 🔴 高 |
| **阶段 4** | 消息模块（基础功能） | 2 天 | 🟡 中 |
| **阶段 5** | 扩展功能（收藏、点赞、评论） | 2 天 | 🟡 中 |
| **阶段 6** | 完善与优化 | 2 天 | 🟢 低 |

**总计**：15 天（约 3 周）

---

## 五、详细开发任务

### 阶段 0：基础设施完善（1 天）

#### 任务 0.1：数据库完整初始化

**目标**：创建所有必需的数据库表

**步骤**：
1. 创建 `database_full.sql` 文件
2. 包含所有 9 张表的创建语句
3. 添加必要的索引和外键
4. 插入测试数据

**文件**：
- `backend/database_full.sql`（新建）

**测试**：
```sql
-- 验证所有表已创建
SHOW TABLES;

-- 验证表结构
DESCRIBE users;
DESCRIBE items;
DESCRIBE orders;
...
```

**预计时间**：2 小时

---

#### 任务 0.2：创建统一响应工具

**目标**：统一 API 响应格式

**步骤**：
1. 创建 `utils/response.js`
2. 实现 `success()` 和 `error()` 方法
3. 在所有 Controller 中使用

**代码示例**：
```javascript
// utils/response.js
function success(data, message = 'success') {
  return {
    code: 0,
    message,
    data,
    timestamp: Math.floor(Date.now() / 1000)
  }
}

function error(code, message, errors = null) {
  const response = {
    code,
    message,
    timestamp: Math.floor(Date.now() / 1000)
  }
  if (errors) {
    response.errors = errors
  }
  return response
}

module.exports = { success, error }
```

**预计时间**：1 小时

---

#### 任务 0.3：创建参数验证中间件

**目标**：统一参数验证

**步骤**：
1. 安装 `joi` 或 `express-validator`
2. 创建 `middleware/validate.js`
3. 定义验证规则

**代码示例**：
```javascript
// middleware/validate.js
const Joi = require('joi')

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
      return res.status(400).json({
        code: 400,
        message: '参数验证失败',
        errors
      })
    }
    
    req.body = value
    next()
  }
}

module.exports = { validate }
```

**预计时间**：2 小时

---

#### 任务 0.4：改进错误处理中间件

**目标**：统一错误处理

**步骤**：
1. 修改 `app.js` 的错误处理中间件
2. 区分业务错误和系统错误
3. 记录详细错误日志

**代码示例**：
```javascript
// app.js 中的错误处理中间件
app.use((err, req, res, next) => {
  console.error('[Error]', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  })
  
  // 业务错误
  if (err.statusCode && err.statusCode < 500) {
    return res.status(err.statusCode).json({
      code: err.code || err.statusCode,
      message: err.message,
      timestamp: Math.floor(Date.now() / 1000)
    })
  }
  
  // 系统错误
  res.status(500).json({
    code: 500,
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : err.message,
    timestamp: Math.floor(Date.now() / 1000)
  })
})
```

**预计时间**：1 小时

---

#### 任务 0.5：创建业务错误类

**目标**：方便抛出业务错误

**步骤**：
1. 创建 `utils/errors.js`
2. 定义常见业务错误类

**代码示例**：
```javascript
// utils/errors.js
class BusinessError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.name = 'BusinessError'
  }
}

class NotFoundError extends BusinessError {
  constructor(message = '资源不存在') {
    super(404, message, 404)
    this.name = 'NotFoundError'
  }
}

class UnauthorizedError extends BusinessError {
  constructor(message = '未授权') {
    super(401, message, 401)
    this.name = 'UnauthorizedError'
  }
}

class ValidationError extends BusinessError {
  constructor(message = '参数验证失败', errors = []) {
    super(400, message, 400)
    this.errors = errors
    this.name = 'ValidationError'
  }
}

module.exports = {
  BusinessError,
  NotFoundError,
  UnauthorizedError,
  ValidationError
}
```

**预计时间**：1 小时

---

### 阶段 1：用户模块完善（2 天）

#### 任务 1.1：获取用户信息接口

**API**：`GET /api/user/info`

**功能**：获取当前登录用户的详细信息

**步骤**：
1. 在 `userController.js` 中实现 `getUserInfo`
2. 在 `routes/user.js` 中添加路由
3. 使用认证中间件保护路由
4. 编写单元测试

**代码示例**：
```javascript
// controllers/userController.js
const userModel = require('../models/user')
const { success, error } = require('../utils/response')
const { NotFoundError } = require('../utils/errors')

async function getUserInfo(req, res, next) {
  try {
    const userId = req.user.userId  // 从 JWT 中获取
    
    const user = await userModel.findUserById(userId)
    
    if (!user) {
      throw new NotFoundError('用户不存在')
    }
    
    res.json(success({
      id: user.id,
      nickName: user.nickname,
      avatarUrl: user.avatar_url,
      gender: user.gender,
      identity: user.identity,
      bio: user.bio,
      phone: user.phone,
      wechat: user.wechat,
      location: user.location,
      theme: user.theme,
      appVersion: user.app_version,
      notificationEnabled: user.notification_enabled,
      postCount: user.post_count,
      orderCount: user.order_count,
      createdAt: user.created_at
    }))
  } catch (err) {
    next(err)
  }
}

module.exports = { getUserInfo }
```

**测试**：
```javascript
// 使用 Postman 或 curl
curl -X GET http://localhost:3000/api/user/info \
  -H "Authorization: Bearer <token>"
```

**预计时间**：1 小时

---

#### 任务 1.2：更新用户信息接口

**API**：`PUT /api/user/info`

**功能**：更新用户资料

**步骤**：
1. 定义验证规则
2. 实现 `updateUserInfo` 控制器
3. 添加路由
4. 编写测试

**代码示例**：
```javascript
// controllers/userController.js
const Joi = require('joi')

const updateUserSchema = Joi.object({
  nickname: Joi.string().min(2).max(20),
  bio: Joi.string().max(200).allow(''),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/),
  wechat: Joi.string().max(50),
  location: Joi.string().max(100),
  gender: Joi.number().valid(0, 1, 2)
})

async function updateUserInfo(req, res, next) {
  try {
    const userId = req.user.userId
    const updateData = req.body
    
    // 过滤允许更新的字段
    const allowedFields = ['nickname', 'bio', 'phone', 'wechat', 'location', 'gender']
    const filteredData = {}
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field]
      }
    })
    
    if (Object.keys(filteredData).length === 0) {
      throw new ValidationError('没有可更新的字段')
    }
    
    await userModel.updateUser(userId, filteredData)
    
    res.json(success(null, '更新成功'))
  } catch (err) {
    next(err)
  }
}
```

**预计时间**：2 小时

---

#### 任务 1.3：选择身份接口

**API**：`PUT /api/user/identity`

**功能**：首次登录选择身份（村民/数字游民）

**步骤**：
1. 验证身份值
2. 更新数据库
3. 返回更新后的用户信息

**代码示例**：
```javascript
async function updateIdentity(req, res, next) {
  try {
    const userId = req.user.userId
    const { identity } = req.body
    
    if (!['villager', 'nomad'].includes(identity)) {
      throw new ValidationError('身份类型错误')
    }
    
    await userModel.updateUser(userId, { identity })
    
    const user = await userModel.findUserById(userId)
    
    res.json(success({
      identity: user.identity
    }, '身份更新成功'))
  } catch (err) {
    next(err)
  }
}
```

**预计时间**：1 小时

---

#### 任务 1.4：上传头像接口

**API**：`POST /api/user/avatar`

**功能**：上传并更新用户头像

**步骤**：
1. 安装 `multer` 处理文件上传
2. 创建 `uploadService.js`
3. 实现头像上传控制器
4. 添加路由

**代码示例**：
```javascript
// services/uploadService.js
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises

// 配置文件存储
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/avatars')
    await fs.mkdir(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `avatar-${uniqueSuffix}${ext}`)
  }
})

// 文件过滤
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)
  
  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('只能上传图片文件（jpg, png, webp）'))
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter
})

module.exports = { upload }

// controllers/userController.js
async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      throw new ValidationError('请选择图片文件')
    }
    
    const userId = req.user.userId
    const avatarUrl = `/uploads/avatars/${req.file.filename}`
    
    await userModel.updateUser(userId, { avatar_url: avatarUrl })
    
    res.json(success({
      avatarUrl: `http://localhost:${process.env.PORT}${avatarUrl}`
    }, '头像上传成功'))
  } catch (err) {
    next(err)
  }
}
```

**预计时间**：3 小时

---

### 阶段 2：内容模块（3 天）

**说明**：由于内容模块较大，此处仅列出核心接口，详细实现在开发时展开。

#### 任务 2.1：创建 Item Model

**功能**：封装 items 表的 CRUD 操作

**方法**：
- `createItem(data)` - 创建内容
- `findItemById(id)` - 查询详情
- `findItemsByType(type, filters, pagination)` - 查询列表
- `updateItem(id, data)` - 更新内容
- `deleteItem(id)` - 删除内容
- `incrementViewCount(id)` - 增加浏览量

**预计时间**：4 小时

---

#### 任务 2.2：发布内容接口

**API**：`POST /api/item/create`

**功能**：发布民宿/技能/活动/帖子

**验证规则**：
```javascript
const createItemSchema = Joi.object({
  type: Joi.string().valid('house', 'skill', 'activity', 'post').required(),
  category: Joi.string().max(30),
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().max(5000).required(),
  images: Joi.array().items(Joi.string().uri()),
  price: Joi.number().min(0),
  unit: Joi.string().max(20),
  location: Joi.string().max(100),
  contact: Joi.object({
    phone: Joi.string(),
    wechat: Joi.string()
  })
})
```

**预计时间**：3 小时

---

#### 任务 2.3：获取内容列表接口

**API**：`GET /api/item/list`

**功能**：分页获取内容列表，支持筛选

**查询参数**：
- `type` - 内容类型（house/skill/activity/post）
- `category` - 分类
- `page` - 页码
- `pageSize` - 每页数量
- `sort` - 排序（latest/hot/price_asc/price_desc）

**预计时间**：3 小时

---

#### 任务 2.4：获取内容详情接口

**API**：`GET /api/item/:id`

**功能**：获取内容详细信息，同时记录浏览历史

**预计时间**：2 小时

---

#### 任务 2.5：更新内容接口

**API**：`PUT /api/item/:id`

**功能**：更新自己发布的内容

**权限**：只能更新自己的内容

**预计时间**：2 小时

---

#### 任务 2.6：删除内容接口

**API**：`DELETE /api/item/:id`

**功能**：删除（软删除）自己发布的内容

**预计时间**：1 小时

---

#### 任务 2.7：搜索内容接口

**API**：`GET /api/item/search`

**功能**：关键词搜索

**查询参数**：
- `keyword` - 搜索关键词
- `type` - 内容类型（可选）
- `page` - 页码
- `pageSize` - 每页数量

**预计时间**：3 小时

---

### 阶段 3：订单模块（3 天）

#### 任务 3.1：创建 Order Model

**功能**：封装 orders 表操作

**方法**：
- `createOrder(data)` - 创建订单
- `findOrderById(id)` - 查询订单
- `findOrdersByUser(userId, role, filters)` - 查询用户订单
- `updateOrderStatus(id, status)` - 更新订单状态
- `addOrderEvaluation(id, rating, review)` - 添加评价

**预计时间**：4 小时

---

#### 任务 3.2：创建订单接口

**API**：`POST /api/order/create`

**功能**：创建新订单

**流程**：
1. 验证商品是否存在
2. 生成订单号
3. 计算总金额
4. 创建订单记录
5. 发送通知给卖家

**预计时间**：4 小时

---

#### 任务 3.3：获取订单列表接口

**API**：`GET /api/order/list`

**功能**：获取我的订单（买家/卖家视角）

**查询参数**：
- `role` - buyer/seller
- `status` - 订单状态
- `page` - 页码
- `pageSize` - 每页数量

**预计时间**：3 小时

---

#### 任务 3.4：获取订单详情接口

**API**：`GET /api/order/:id`

**功能**：获取订单详细信息

**权限**：只能查看自己的订单

**预计时间**：2 小时

---

#### 任务 3.5：更新订单状态接口

**API**：`PUT /api/order/:id/status`

**功能**：更新订单状态

**状态流转**：
- pending → confirmed（卖家确认）
- confirmed → completed（买家/卖家完成）
- pending/confirmed → cancelled（取消）

**预计时间**：3 小时

---

#### 任务 3.6：评价订单接口

**API**：`POST /api/order/:id/evaluate`

**功能**：买家评价订单

**验证规则**：
```javascript
const evaluateSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  review: Joi.string().max(500).required()
})
```

**预计时间**：2 小时

---

### 阶段 4：消息模块（2 天）

#### 任务 4.1：创建 Message Model

**功能**：封装消息表操作

**方法**：
- `createMessage(data)` - 创建消息
- `findMessagesByUser(userId, type, filters)` - 查询用户消息
- `markAsRead(messageId)` - 标记已读
- `getUnreadCount(userId)` - 获取未读数

**预计时间**：3 小时

---

#### 任务 4.2：获取消息列表接口

**API**：`GET /api/message/list`

**功能**：获取消息列表

**查询参数**：
- `type` - 消息类型（可选）
- `isRead` - 是否已读（可选）
- `page` - 页码
- `pageSize` - 每页数量

**预计时间**：2 小时

---

#### 任务 4.3：获取未读消息数接口

**API**：`GET /api/message/unread-count`

**功能**：获取未读消息数量

**预计时间**：1 小时

---

#### 任务 4.4：标记消息已读接口

**API**：`PUT /api/message/:id/read`

**功能**：标记消息为已读

**预计时间**：1 小时

---

#### 任务 4.5：发送私聊消息接口（可选）

**API**：`POST /api/message/send`

**功能**：发送私聊消息

**预计时间**：3 小时

---

### 阶段 5：扩展功能（2 天）

#### 任务 5.1：收藏功能

**API**：
- `POST /api/favorite/add` - 添加收藏
- `DELETE /api/favorite/remove` - 取消收藏
- `GET /api/favorite/list` - 获取收藏列表

**预计时间**：3 小时

---

#### 任务 5.2：浏览历史功能

**API**：
- `POST /api/history/add` - 添加浏览记录（在获取详情时自动调用）
- `GET /api/history/list` - 获取浏览历史

**预计时间**：2 小时

---

#### 任务 5.3：评论功能

**API**：
- `POST /api/comment/create` - 发表评论
- `GET /api/comment/list` - 获取评论列表
- `DELETE /api/comment/:id` - 删除评论
- `POST /api/comment/:id/like` - 点赞评论

**预计时间**：4 小时

---

#### 任务 5.4：关注功能（可选）

**API**：
- `POST /api/follow/add` - 关注用户
- `DELETE /api/follow/remove` - 取消关注
- `GET /api/follow/list` - 获取关注/粉丝列表

**预计时间**：3 小时

---

### 阶段 6：完善与优化（2 天）

#### 任务 6.1：添加日志系统

**工具**：使用 `winston` 库

**功能**：
- 记录所有 API 请求
- 记录错误日志
- 按日期分割日志文件

**预计时间**：3 小时

---

#### 任务 6.2：添加接口文档

**工具**：使用 `Swagger` 或手动编写 Markdown

**内容**：
- 所有 API 的请求/响应示例
- 参数说明
- 错误码列表

**预计时间**：4 小时

---

#### 任务 6.3：性能优化

**优化项**：
- 添加数据库查询索引
- 使用 Redis 缓存热点数据（可选）
- 优化 SQL 查询语句

**预计时间**：3 小时

---

#### 任务 6.4：安全加固

**加固项**：
- 添加请求限流
- SQL 注入防护
- XSS 防护
- 敏感数据加密

**预计时间**：4 小时

---

## 六、风险分析与评估

### 6.1 技术风险

#### 风险 1：数据库设计不完善

**描述**：当前数据库只有基础的 users 表，缺少核心业务表

**影响**：🔴 高

**应对措施**：
- ✅ 在阶段 0 立即创建所有表
- ✅ 严格按照 API 设计文档创建表结构
- ✅ 创建完成后立即验证

**状态**：待执行

---

#### 风险 2：参数验证不完整

**描述**：当前没有统一的参数验证机制，容易出现数据错误

**影响**：🔴 高

**应对措施**：
- ✅ 在阶段 0 引入 Joi 验证库
- ✅ 为每个接口定义验证规则
- ✅ 统一错误响应格式

**状态**：待执行

---

#### 风险 3：并发问题

**描述**：订单创建、库存扣减等操作可能出现并发问题

**影响**：🟡 中

**应对措施**：
- 使用数据库事务
- 添加乐观锁或悲观锁
- 关键操作添加分布式锁（如需要）

**状态**：开发时处理

---

#### 风险 4：性能瓶颈

**描述**：大量数据查询可能导致性能问题

**影响**：🟡 中

**应对措施**：
- 添加必要的数据库索引
- 使用分页查询
- 考虑引入 Redis 缓存（可选）

**状态**：阶段 6 优化

---

### 6.2 开发风险

#### 风险 5：开发工作量评估不准

**描述**：实际开发可能比预估时间长

**影响**：🟡 中

**应对措施**：
- 每个任务预留 20% 缓冲时间
- 优先完成核心功能
- 非核心功能可延后

**状态**：持续监控

---

#### 风险 6：缺少自动化测试

**描述**：没有单元测试和集成测试，回归测试成本高

**影响**：🟡 中

**应对措施**：
- 核心接口编写单元测试
- 使用 Postman 编写接口测试集
- 建立测试数据库

**状态**：逐步完善

---

### 6.3 业务风险

#### 风险 7：需求变更

**描述**：前端需求可能发生变化，导致后端需要调整

**影响**：🟢 低

**应对措施**：
- 与前端保持密切沟通
- API 设计保持灵活性
- 使用版本控制

**状态**：持续沟通

---

## 七、质量保证策略

### 7.1 代码规范

#### 7.1.1 命名规范

**文件命名**：
- 控制器：`xxxController.js`（小驼峰）
- 模型：`xxx.js`（小写）
- 路由：`xxx.js`（小写）
- 工具：`xxxUtil.js` 或 `xxx.js`

**变量命名**：
- 常量：`UPPER_SNAKE_CASE`
- 变量/函数：`camelCase`
- 类：`PascalCase`

#### 7.1.2 注释规范

**函数注释**：
```javascript
/**
 * 创建订单
 * @param {Object} orderData - 订单数据
 * @param {number} orderData.itemId - 商品ID
 * @param {number} orderData.quantity - 数量
 * @returns {Promise<Object>} 订单信息
 * @throws {ValidationError} 参数验证失败
 * @throws {NotFoundError} 商品不存在
 */
async function createOrder(orderData) {
  // ...
}
```

**关键逻辑注释**：
```javascript
// 1. 验证商品是否存在
const item = await itemModel.findById(itemId)
if (!item) {
  throw new NotFoundError('商品不存在')
}

// 2. 生成订单号
const orderNo = generateOrderNo()
```

### 7.2 错误处理规范

#### 7.2.1 使用自定义错误类

```javascript
// ❌ 不好的做法
if (!user) {
  return res.status(404).json({ message: '用户不存在' })
}

// ✅ 好的做法
if (!user) {
  throw new NotFoundError('用户不存在')
}
```

#### 7.2.2 统一错误捕获

```javascript
async function someController(req, res, next) {
  try {
    // 业务逻辑
  } catch (err) {
    next(err)  // 交给错误处理中间件
  }
}
```

### 7.3 数据库操作规范

#### 7.3.1 使用连接池

```javascript
// ✅ 好的做法
const connection = await pool.getConnection()
try {
  const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [userId])
  return rows[0]
} finally {
  connection.release()  // 确保释放连接
}
```

#### 7.3.2 使用参数化查询

```javascript
// ❌ 不好的做法（SQL 注入风险）
const sql = `SELECT * FROM users WHERE name = '${name}'`

// ✅ 好的做法
const sql = 'SELECT * FROM users WHERE name = ?'
const [rows] = await connection.query(sql, [name])
```

### 7.4 安全规范

#### 7.4.1 敏感数据处理

```javascript
// ❌ 不好的做法：返回所有字段
res.json(success(user))

// ✅ 好的做法：只返回必要字段
res.json(success({
  id: user.id,
  nickname: user.nickname,
  avatar: user.avatar
  // 不返回 openid、phone 等敏感信息
}))
```

#### 7.4.2 权限验证

```javascript
// 更新内容前验证权限
async function updateItem(req, res, next) {
  try {
    const itemId = req.params.id
    const userId = req.user.userId
    
    const item = await itemModel.findById(itemId)
    
    // 验证是否是内容创建者
    if (item.user_id !== userId) {
      throw new UnauthorizedError('无权修改此内容')
    }
    
    // 执行更新
    await itemModel.update(itemId, req.body)
    res.json(success(null, '更新成功'))
  } catch (err) {
    next(err)
  }
}
```

---

## 八、测试计划

### 8.1 测试策略

#### 8.1.1 测试金字塔

```
       /\
      /  \  E2E测试（少量）
     /────\
    /      \  集成测试（适量）
   /────────\
  /          \  单元测试（大量）
 /────────────\
```

### 8.2 单元测试

**工具**：Jest + Supertest

**覆盖范围**：
- 所有 Model 方法
- 核心 Controller 方法
- 工具函数

**示例**：
```javascript
// tests/models/user.test.js
describe('User Model', () => {
  test('findUserById should return user', async () => {
    const user = await userModel.findUserById(1)
    expect(user).toHaveProperty('id', 1)
    expect(user).toHaveProperty('nickname')
  })
  
  test('findUserById should return null for invalid id', async () => {
    const user = await userModel.findUserById(999999)
    expect(user).toBeNull()
  })
})
```

### 8.3 接口测试

**工具**：Postman + Newman

**测试内容**：
- 正常请求流程
- 异常参数处理
- 权限验证
- 边界条件

**测试用例示例**：

| 接口 | 测试用例 | 预期结果 |
|------|---------|---------|
| POST /api/auth/login | 有效 code + userInfo | 返回 token 和用户信息 |
| POST /api/auth/login | 缺少 code | 返回 400 错误 |
| GET /api/user/info | 有效 token | 返回用户信息 |
| GET /api/user/info | 无效 token | 返回 401 错误 |
| PUT /api/user/info | 有效数据 | 更新成功 |
| PUT /api/user/info | 昵称过长 | 返回 400 错误 |

### 8.4 压力测试（可选）

**工具**：Apache Bench (ab) 或 Artillery

**测试指标**：
- QPS（每秒查询数）
- 响应时间
- 错误率

**测试场景**：
```bash
# 测试登录接口
ab -n 1000 -c 100 -p login.json -T application/json \
  http://localhost:3000/api/auth/login
```

### 8.5 测试数据准备

创建测试数据脚本：

```sql
-- test_data.sql
INSERT INTO users (openid, nickname, avatar_url, identity, created_at)
VALUES 
  ('test_openid_1', '测试用户1', 'https://example.com/avatar1.jpg', 'villager', NOW()),
  ('test_openid_2', '测试用户2', 'https://example.com/avatar2.jpg', 'nomad', NOW());

INSERT INTO items (user_id, type, category, title, description, price, status, created_at)
VALUES
  (1, 'house', '山景', '温馨两居室', '临近地铁...', 200.00, 'published', NOW()),
  (1, 'skill', '摄影', '专业摄影服务', '十年摄影经验...', 80.00, 'published', NOW());
```

---

## 九、项目交付标准

### 9.1 代码交付

- [x] 所有代码提交到 Git 仓库
- [x] 代码遵循规范
- [x] 关键代码有注释
- [x] 没有调试代码（console.log）
- [x] 没有硬编码敏感信息

### 9.2 文档交付

- [x] API 接口文档
- [x] 数据库设计文档
- [x] 部署文档
- [x] 测试用例文档

### 9.3 测试交付

- [x] 核心功能单元测试
- [x] Postman 接口测试集
- [x] 测试数据脚本

### 9.4 环境交付

- [x] 开发环境可运行
- [x] 数据库初始化脚本
- [x] .env.example 示例配置
- [x] README.md 使用说明

---

## 十、开发流程与规范

### 10.1 Git 提交规范

**提交信息格式**：
```
<type>(<scope>): <subject>

<body>
```

**type 类型**：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

**示例**：
```bash
git commit -m "feat(user): 添加更新用户信息接口"
git commit -m "fix(order): 修复订单状态流转 bug"
```

### 10.2 开发流程

```
1. 切换到 develop 分支
   git checkout develop
   git pull origin develop

2. 创建功能分支
   git checkout -b feature/user-api

3. 开发功能 + 测试

4. 提交代码
   git add .
   git commit -m "feat(user): 完成用户模块 API"

5. 推送到远程
   git push origin feature/user-api

6. 创建 Pull Request

7. Code Review

8. 合并到 develop
```

### 10.3 每日工作流程

**上午**：
1. 同步最新代码
2. 查看当天任务
3. 开始开发

**下午**：
1. 完成功能开发
2. 编写/运行测试
3. 提交代码
4. 更新进度

**晚上**：
1. Code Review（如有 PR）
2. 解决测试中发现的问题

---

## 十一、附录

### 附录 A：开发环境要求

| 软件 | 版本 | 说明 |
|------|------|------|
| Node.js | 14+ | 建议 16+ |
| MySQL | 5.7+ | 或 8.0+ |
| Git | 2.0+ | 版本控制 |
| Postman | 最新版 | 接口测试 |

### 附录 B：依赖包清单

**生产依赖**：
```json
{
  "express": "^4.18.2",
  "mysql2": "^3.6.0",
  "jsonwebtoken": "^9.0.2",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "axios": "^1.6.0",
  "joi": "^17.11.0",
  "multer": "^1.4.5-lts.1",
  "winston": "^3.11.0"
}
```

**开发依赖**：
```json
{
  "nodemon": "^3.0.1",
  "jest": "^29.7.0",
  "supertest": "^6.3.3"
}
```

### 附录 C：快速命令

```bash
# 启动开发服务器
npm run dev

# 运行测试
npm test

# 数据库初始化
mysql -u root -p < backend/database_full.sql

# 查看日志
tail -f logs/app.log
```

---

**文档状态**：✅ 待审核  
**下一步**：审核通过后开始阶段 0 开发  
**预计完成时间**：3 周（15 个工作日）

---

**End of Document**
