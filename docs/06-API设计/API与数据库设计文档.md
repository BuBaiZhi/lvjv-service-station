# API 与数据库设计文档

**项目名称**：旅居服务站  
**版本**：v1.0  
**日期**：2026-02-16  
**状态**：初版（供团队协作参考）

---
APPID：wxf39739846f0c3925
secretID：95e8bdd8c70341f9eb3e0b81886e33eb

wx.clearStorageSync()

## 一、项目模块总览

本项目包含 **6 个核心模块**：

| 模块 | 说明 | 优先级 | 负责人员 |
|------|------|--------|----------|
| 用户中心 | 个人资料、设置、交易、发布、记录 | ✅ 已完成 | 当前开发 |
| 民宿 | 民宿房源浏览、预订、入住 | 🔴 高 | 其他开发 |
| 广场 | 内容发布、点赞、评论、分享 | 🔴 高 | 其他开发 |
| 技能 | 技能展示、预约、交易 | 🔴 高 | 其他开发 |
| 消息 | 通知、聊天、客服 | 🟡 中 | 其他开发 |
| 首页 | 入口、推荐、搜索 | 🟡 中 | 其他开发 |

---

## 二、数据库设计

### 2.1 ER 图关系

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │     │   orders    │     │  messages   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │◄────│ user_id(FK) │     │ id (PK)     │
│ avatar      │     │ id (PK)     │     │ from_id     │
│ nickname    │     │ type        │     │ to_id       │
│ gender      │     │ status      │     │ content     │
│ identity    │     │ price       │     │ created_at  │
│ bio         │     │ created_at  │     └──────┬──────┘
│ app_version │     └──────┬──────┘            │
│ theme       │            │                   │
└──────┬──────┘            │                   │
       │                   │                   │
       │     ┌─────────────┴─────────────┐     │
       │     │        items             │     │
       │     ├─────────────┬────────────┤     │
       │     │ id (PK)     │            │     │
       │     │ user_id(FK) │            │     │
       │     │ type        │            │     │
       │     │ category    │            │     │
       │     │ title       │            │     │
       │     │ images      │            │     │
       │     │ price       │            │     │
       │     │ status      │            │     │
       │     │ view_count  │            │     │
       │     │ like_count  │            │     │
       │     │ created_at  │            │     │
       │     └─────────────┴────────────┘     │
       │                                       │
       │     ┌─────────────┐     ┌─────────────┐
       │     │  favorites  │     │  history    │
       │     ├─────────────┤     ├─────────────┤
       │     │ id (PK)     │     │ id (PK)     │
       └────►│ user_id(FK) │     │ user_id(FK) │
       │     │ item_id(FK) │     │ item_id(FK) │
       │     │ created_at  │     │ created_at  │
       │     └─────────────┘     └─────────────┘
       │
       │     ┌─────────────┐
       │     │  comments   │
       │     ├─────────────┤
       │────►│ id (PK)     │
       │     │ user_id(FK) │
       │     │ item_id(FK) │
       │     │ content     │
       │     │ parent_id   │
       │     │ created_at  │
       │     └─────────────┘
```

### 2.2 数据表详细设计

#### 2.2.1 用户表 (users)

```sql
CREATE TABLE `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `openid` VARCHAR(64) COMMENT '微信_openid',
  `unionid` VARCHAR(64) COMMENT '微信_unionid',
  `avatar` VARCHAR(255) DEFAULT '' COMMENT '头像URL',
  `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
  `gender` ENUM('male', 'female', 'other') DEFAULT NULL COMMENT '性别',
  `identity` ENUM('villager', 'nomad') DEFAULT 'villager' COMMENT '身份：村民/数字游民',
  `bio` TEXT COMMENT '个人简介',
  `phone` VARCHAR(20) COMMENT '手机号',
  `wechat` VARCHAR(50) COMMENT '微信号',
  `location` VARCHAR(100) COMMENT '所在地',
  
  -- 设置相关
  `theme` ENUM('light', 'dark') DEFAULT 'light' COMMENT '主题',
  `app_version` ENUM('standard', 'elderly') DEFAULT 'standard' COMMENT '应用版本',
  `notification_enabled` TINYINT(1) DEFAULT 1 COMMENT '通知开关',
  `privacy_mode` TINYINT(1) DEFAULT 0 COMMENT '隐私模式',
  
  -- 统计
  `post_count` INT DEFAULT 0 COMMENT '发布数量',
  `order_count` INT DEFAULT 0 COMMENT '交易数量',
  `follower_count` INT DEFAULT 0 COMMENT '粉丝数',
  `following_count` INT DEFAULT 0 COMMENT '关注数',
  
  -- 状态
  `status` ENUM('active', 'banned', 'deleted') DEFAULT 'active' COMMENT '账号状态',
  `last_login_at` DATETIME COMMENT '最后登录时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_openid` (`openid`),
  INDEX `idx_identity` (`identity`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

#### 2.2.2 内容/物品表 (items)

**说明**：这是核心内容表，通过 `type` 和 `category` 区分不同模块的内容

```sql
CREATE TABLE `items` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '物品ID',
  `user_id` INT NOT NULL COMMENT '发布者ID',
  `type` ENUM('house', 'skill', 'activity', 'post') NOT NULL COMMENT '类型：民宿/技能/活动/帖子',
  `category` VARCHAR(30) COMMENT '细分分类',
  `title` VARCHAR(100) NOT NULL COMMENT '标题',
  `description` TEXT COMMENT '详细描述',
  `images` JSON COMMENT '图片列表JSON',
  `price` DECIMAL(10,2) COMMENT '价格',
  `unit` VARCHAR(20) COMMENT '价格单位：元/天、元/次',
  `location` VARCHAR(100) COMMENT '位置',
  `contact` JSON COMMENT '联系方式JSON：{phone, wechat}',
  
  -- 民宿专属
  `house_info` JSON COMMENT '民宿信息：{bedroom, bathroom, capacity, facilities}',
  -- 技能专属
  `skill_info` JSON COMMENT '技能信息：{category, experience, certificate}',
  -- 活动专属
  `activity_info` JSON COMMENT '活动信息：{date, duration, max_people}',
  
  -- 状态
  `status` ENUM('draft', 'pending', 'published', 'offline', 'deleted') DEFAULT 'draft',
  
  -- 统计
  `view_count` INT DEFAULT 0 COMMENT '浏览次数',
  `like_count` INT DEFAULT 0 COMMENT '点赞次数',
  `comment_count` INT DEFAULT 0 COMMENT '评论次数',
  `share_count` INT DEFAULT 0 COMMENT '分享次数',
  `order_count` INT DEFAULT 0 COMMENT '订单数量',
  
  -- 时间
  `published_at` DATETIME COMMENT '发布时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`),
  INDEX `idx_published` (`published_at`),
  INDEX `idx_location` (`location`(20))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='内容/物品表';
```

#### 2.2.3 订单表 (orders)

```sql
CREATE TABLE `orders` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
  `order_no` VARCHAR(32) UNIQUE NOT NULL COMMENT '订单编号',
  `buyer_id` INT NOT NULL COMMENT '买家ID',
  `seller_id` INT NOT NULL COMMENT '卖家ID',
  `item_id` INT NOT NULL COMMENT '物品ID',
  `type` ENUM('house', 'skill', 'activity') NOT NULL COMMENT '类型',
  
  -- 交易信息
  `title` VARCHAR(100) COMMENT '订单标题',
  `image` VARCHAR(255) COMMENT '订单图片',
  `price` DECIMAL(10,2) NOT NULL COMMENT '单价',
  `quantity` INT DEFAULT 1 COMMENT '数量',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '总价',
  
  -- 民宿预约信息
  `check_in` DATE COMMENT '入住日期',
  `check_out` DATE COMMENT '退房日期',
  `guest_count` INT COMMENT '入住人数',
  -- 技能/活动预约信息
  `appointment_date` DATETIME COMMENT '预约时间',
  
  -- 状态流程
  -- house: pending(待确认) → confirmed(已确认) → completed(已完成) → evaluated(已评价)
  -- skill/activity: pending → confirmed → completed → evaluated
  -- 取消: pending → cancelled, confirmed → cancelled
  `status` ENUM('pending', 'confirmed', 'completed', 'evaluated', 'cancelled', 'refunded') DEFAULT 'pending',
  
  -- 支付
  `payment_method` ENUM('wechat', 'alipay', 'offline') COMMENT '支付方式',
  `payment_status` ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
  `paid_at` DATETIME COMMENT '支付时间',
  
  -- 评价
  `rating` TINYINT COMMENT '评分1-5',
  `review` TEXT COMMENT '评价内容',
  `reviewed_at` DATETIME COMMENT '评价时间',
  
  -- 备注
  `remark` TEXT COMMENT '买家备注',
  `admin_remark` TEXT COMMENT '管理员备注',
  
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`),
  INDEX `idx_buyer` (`buyer_id`),
  INDEX `idx_seller` (`seller_id`),
  INDEX `idx_item` (`item_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';
```

#### 2.2.4 消息表 (messages)

```sql
CREATE TABLE `messages` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
  `type` ENUM('system', 'order', 'comment', 'like', 'follow', 'chat') NOT NULL COMMENT '消息类型',
  `from_id` INT COMMENT '发送者ID（系统消息为0）',
  `to_id` INT NOT NULL COMMENT '接收者ID',
  `item_id` INT COMMENT '相关物品ID',
  `order_id` INT COMMENT '相关订单ID',
  
  -- 消息内容
  `title` VARCHAR(50) COMMENT '标题',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `extra` JSON COMMENT '扩展数据',
  
  -- 状态
  `is_read` TINYINT(1) DEFAULT 0 COMMENT '是否已读',
  `read_at` DATETIME COMMENT '阅读时间',
  
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_to` (`to_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';

-- 聊天记录表（私聊）
CREATE TABLE `chat_messages` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '聊天ID',
  `room_id` VARCHAR(32) NOT NULL COMMENT '聊天室ID（双方ID组合）',
  `from_id` INT NOT NULL COMMENT '发送者ID',
  `to_id` INT NOT NULL COMMENT '接收者ID',
  `message_type` ENUM('text', 'image', 'voice') DEFAULT 'text',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `is_read` TINYINT(1) DEFAULT 0,
  
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_room` (`room_id`),
  INDEX `idx_to` (`to_id`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天记录表';
```

#### 2.2.5 收藏表 (favorites)

```sql
CREATE TABLE `favorites` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `item_type` ENUM('house', 'skill', 'activity', 'post') NOT NULL,
  
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_user_item` (`user_id`, `item_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_item` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';
```

#### 2.2.6 浏览历史表 (browse_history)

```sql
CREATE TABLE `browse_history` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `item_type` ENUM('house', 'skill', 'activity', 'post') NOT NULL,
  `title` VARCHAR(100) COMMENT '记录时的标题（防变更）',
  `image` VARCHAR(255) COMMENT '记录时的图片（防变更）',
  
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='浏览历史表';
```

#### 2.2.7 点赞表 (likes)

```sql
CREATE TABLE `likes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `item_type` ENUM('house', 'skill', 'activity', 'post') NOT NULL,
  
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_user_item` (`user_id`, `item_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_item` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点赞表';
```

#### 2.2.8 评论表 (comments)

```sql
CREATE TABLE `comments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '评论者ID',
  `item_id` INT NOT NULL COMMENT '被评论的物品ID',
  `parent_id` INT DEFAULT 0 COMMENT '父评论ID（0为顶层）',
  `reply_to_id` INT COMMENT '回复谁的用户ID',
  
  `content` TEXT NOT NULL COMMENT '评论内容',
  `like_count` INT DEFAULT 0 COMMENT '点赞数',
  
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`),
  FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE,
  INDEX `idx_item` (`item_id`),
  INDEX `idx_parent` (`parent_id`),
  INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';
```

#### 2.2.9 关注表 (follows)

```sql
CREATE TABLE `follows` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `follower_id` INT NOT NULL COMMENT '关注者ID',
  `following_id` INT NOT NULL COMMENT '被关注者ID',
  
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_follow` (`follower_id`, `following_id`),
  INDEX `idx_follower` (`follower_id`),
  INDEX `idx_following` (`following_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注表';
```

---

## 三、API 接口设计

### 3.1 接口规范

```
Base URL: https://api.lvji.com/v1

请求头:
  Content-Type: application/json
  Authorization: Bearer <token>
  X-App-Version: 1.0.0
  X-Device-ID: <设备ID>

响应格式:
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "timestamp": 1234567890
}

错误码:
  200 成功
  400 参数错误
  401 未授权
  403 禁止访问
  404 资源不存在
  500 服务器错误
```

### 3.2 模块化接口设计

#### 3.2.1 用户模块 (User)

```
【用户】
GET    /users/:id                    获取用户详情
PUT    /users/:id                    更新用户资料
POST   /users/:id/avatar             上传头像
GET    /users/:id/items              获取用户发布的内容
GET    /users/:id/orders             获取用户的订单
GET    /users/:id/favorites          获取用户收藏
GET    /users/:id/followers          获取粉丝列表
GET    /users/:id/following          获取关注列表
POST   /users/:id/follow             关注用户
DELETE /users/:id/follow/:target_id  取消关注

【设置】
GET    /users/:id/settings           获取用户设置
PUT    /users/:id/settings           更新用户设置
PUT    /users/:id/settings/theme     更新主题
PUT    /users/:id/settings/version   更新应用版本

【认证】
POST   /auth/login                  微信登录
POST   /auth/register               注册
POST   /auth/refresh                刷新Token
POST   /auth/logout                  登出
```

#### 3.2.2 民宿模块 (House)

```
【民宿列表】
GET    /houses                      获取民宿列表（支持分页、筛选、排序）
GET    /houses/:id                  获取民宿详情
GET    /houses/featured             获取推荐民宿
GET    /houses/search               搜索民宿

【民宿筛选参数】
  type: house
  category: 民宿类型（山景、海景、乡村、城镇）
  location: 地点
  price_min: 最低价
  price_max: 最高价
  bedroom: 卧室数量
  capacity: 可住人数
  facilities: 设施（wifi,空调,厨房...）
  sort: price_asc|price_desc|rating|created_at

【房东】
GET    /houses/owner/:user_id       获取某用户的民宿列表
POST   /houses                      发布民宿
PUT    /houses/:id                   更新民宿
DELETE /houses/:id                   删除民宿
PUT    /houses/:id/status           更新民宿状态

【预约】
POST   /houses/:id/book             预约民宿
GET    /houses/:id/availability     查看可预约日期
```

#### 3.2.3 技能模块 (Skill)

```
【技能列表】
GET    /skills                      获取技能列表
GET    /skills/:id                  获取技能详情
GET    /skills/featured             获取推荐技能
GET    /skills/categories           获取技能分类

【技能筛选参数】
  type: skill
  category: 技能分类（摄影、烹饪、驾驶、翻译...）
  price_min: 最低价
  price_max: 最高价
  rating: 评分
  sort: price_asc|price_desc|rating|order_count

【发布】
GET    /skills/owner/:user_id       获取某用户的技能列表
POST   /skills                      发布技能
PUT    /skills/:id                   更新技能
DELETE /skills/:id                   删除技能

【预约】
POST   /skills/:id/book             预约技能服务
GET    /skills/:id/schedule         查看可预约时间
```

#### 3.2.4 活动模块 (Activity)

```
【活动列表】
GET    /activities                  获取活动列表
GET    /activities/:id              获取活动详情
GET    /activities/featured         获取推荐活动
GET    /activities/calendar         获取活动日历

【活动筛选参数】
  type: activity
  category: 活动类型（徒步、聚餐、文化体验...）
  location: 地点
  date: 日期
  price_min: 最低价
  price_max: 最高价
  remaining: 是否还有名额
  sort: date|price_asc|price_desc|popular

【发布】
POST   /activities                  发布活动
PUT    /activities/:id               更新活动
DELETE /activities/:id               删除活动

【报名】
POST   /activities/:id/join         报名参加活动
GET    /activities/:id/participants 获取参与者列表
POST   /activities/:id/cancel       取消报名
```

#### 3.2.5 广场模块 (Square/Post)

```
【帖子列表】
GET    /posts                       获取帖子列表（广场）
GET    /posts/:id                   获取帖子详情
GET    /posts/user/:user_id          获取用户帖子

【帖子筛选参数】
  type: post
  category: 分类（分享、问答、结伴...）
  sort: latest|popular|comment

【发布】
POST   /posts                        发布帖子
PUT    /posts/:id                    更新帖子
DELETE /posts/:id                    删除帖子

【互动】
POST   /posts/:id/like               点赞
DELETE /posts/:id/like               取消点赞
GET    /posts/:id/likes              获取点赞列表
POST   /posts/:id/comment            评论
GET    /posts/:id/comments           获取评论列表
DELETE /posts/:id/comments/:comment_id 删除评论
POST   /posts/:id/share              分享
```

#### 3.2.6 消息模块 (Message)

```
【通知】
GET    /notifications                获取通知列表
GET    /notifications/unread          获取未读通知数
PUT    /notifications/:id/read       标记已读
PUT    /notifications/read-all       全部标记已读
DELETE /notifications/:id             删除通知

【聊天】
GET    /chats                        获取会话列表
GET    /chats/:room_id               获取聊天记录
POST   /chats/:room_id               发送消息
PUT    /chats/:room_id/read          标记已读

【客服】
GET    /service/contact              获取客服联系方式
POST   /service/feedback             提交反馈
GET    /service/faq                  获取常见问题
```

#### 3.2.7 订单模块 (Order - 通用)

```
【订单列表】
GET    /orders                       获取订单列表
GET    /orders/:id                   获取订单详情

【订单筛选参数】
  role: buyer|seller|all
  type: house|skill|activity
  status: pending|confirmed|completed|evaluated|cancelled|refunded
  sort: created_at|updated_at

【订单操作】
POST   /orders                       创建订单
PUT    /orders/:id/status            更新订单状态
  - confirm: 确认订单（待确认→已确认）
  - complete: 完成订单（已确认→已完成）
  - cancel: 取消订单
  - refund: 申请退款

POST   /orders/:id/pay               支付订单
POST   /orders/:id/evaluate          评价订单
GET    /orders/:statistics           获取订单统计
```

#### 3.2.8 公共接口

```
【首页】
GET    /home/recommend               获取首页推荐
GET    /home/banners                 获取轮播图
GET    /home/categories              获取分类入口

【搜索】
GET    /search                      全局搜索
  q: 关键词
  type: house|skill|activity|post|user
  page: 页码
  limit: 每页数量

【文件上传】
POST   /upload/image                 上传图片
POST   /upload/avatar                上传头像
POST   /upload/multiple              批量上传

【通用】
GET    /dict/:type                   获取字典数据
GET    /regions                      获取地区数据
GET    /config                       获取系统配置
```

---

## 四、通用接口示例

### 4.1 分页参数规范

```
GET /houses?page=1&limit=20&sort=created_at&order=desc

参数说明：
  page: 页码（默认1）
  limit: 每页数量（默认20，最大100）
  sort: 排序字段
  order: asc|desc）

响应：
排序方式（{
  "code": 200,
  "data": {
    "list": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "total_pages": 8
    }
  }
}
```

### 4.2 筛选参数示例

```
GET /houses?category=山景&location=大理&price_min=100&price_max=500&bedroom=2&sort=price_asc

响应：
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "title": "大理山景民宿",
        "category": "山景",
        "location": "大理",
        "price": 199.00,
        "images": ["..."],
        "house_info": { "bedroom": 2, "bathroom": 1 }
      }
    ],
    "pagination": { ... }
  }
}
```

---

## 五、WebSocket 实时消息

### 5.1 连接地址

```
wss://api.lvji.com/ws?token=<token>
```

### 5.2 消息类型

```json
// 收到新消息
{
  "type": "message",
  "data": {
    "id": 1,
    "from_id": 100,
    "content": "你好",
    "created_at": "2026-02-16 10:00:00"
  }
}

// 订单状态变更
{
  "type": "order_status",
  "data": {
    "order_id": 1,
    "status": "confirmed",
    "message": "您的订单已确认"
  }
}

// 新通知
{
  "type": "notification",
  "data": {
    "id": 1,
    "type": "like",
    "content": "有人点赞了您的民宿"
  }
}

// 点赞数更新
{
  "type": "like_update",
  "data": {
    "item_id": 1,
    "like_count": 15
  }
}
```

---

## 六、数据字典

### 6.1 内容类型 (items.type)

| 值 | 说明 | 模块 |
|------|------|------|
| house | 民宿 | 民宿模块 |
| skill | 技能 | 技能模块 |
| activity | 活动 | 活动模块 |
| post | 帖子 | 广场模块 |

### 6.2 订单状态 (orders.status)

| 状态 | 说明 | 适用类型 |
|------|------|----------|
| pending | 待确认 | 全部 |
| confirmed | 已确认 | 全部 |
| completed | 已完成 | 全部 |
| evaluated | 已评价 | 全部 |
| cancelled | 已取消 | 全部 |
| refunded | 已退款 | 全部 |

### 6.3 消息类型 (messages.type)

| 类型 | 说明 |
|------|------|
| system | 系统通知 |
| order | 订单通知 |
| comment | 评论通知 |
| like | 点赞通知 |
| follow | 关注通知 |
| chat | 私聊消息 |

### 6.4 民宿分类

| 分类 | 说明 |
|------|------|
| 山景 | 山区景观民宿 |
| 海景 | 海边/海滨民宿 |
| 乡村 | 乡村田园民宿 |
| 城镇 | 城市/城镇民宿 |
| 古镇 | 古镇/古城民宿 |
| 湖景 | 湖泊周边民宿 |

### 6.5 技能分类

| 分类 | 说明 |
|------|------|
| 摄影 | 摄影服务 |
| 烹饪 | 烹饪/美食制作 |
| 驾驶 | 司机/包车 |
| 翻译 | 语言翻译 |
| 向导 | 当地向导 |
| 手工艺 | 手工艺教学 |
| 艺术 | 艺术/音乐教学 |
| 其他 | 其他技能 |

---

## 七、版本兼容性

### 7.1 API 版本控制

```
v1 (当前): /api/v1/*
v2 (规划中): /api/v2/*
```

### 7.2 向下兼容策略

- 新增字段会添加默认值，不影响旧版本
- 废弃字段会提前通知，保留至少6个月
- 重大变更会发布新版本

---

## 八、团队协作约定

### 8.1 接口命名规范

- 资源用复数：`/houses` 而非 `/house`
- 嵌套资源：`/houses/:id/comments`
- 动作用 POST：`/houses/:id/book`

### 8.2 错误处理规范

```json
{
  "code": 400,
  "message": "参数错误",
  "errors": [
    { "field": "price", "message": "价格不能为空" }
  ]
}
```

### 8.3 状态码约定

- `code < 200`: 系统级错误
- `200-299`: 成功
- `400-499`: 客户端错误
- `500-599`: 服务器错误

---

## 九、待补充内容

1. **第三方登录** - 微信登录完整流程
2. **支付流程** - 微信支付/支付宝集成
3. **文件存储** - OSS 配置和使用
4. **缓存策略** - Redis 使用场景
5. **搜索优化** - Elasticsearch 方案
6. **消息推送** - 极光/个推集成

---

## 十、文档维护

| 版本 | 日期 | 修改人 | 说明 |
|------|------|--------|------|
| v1.0 | 2026-02-16 | 开发团队 | 初版设计 |

---

**下一步**：

1. 确认数据库表结构是否有遗漏
2. 确认 API 接口是否覆盖所有需求
3. 各模块开发人员根据此文档开发
4. 后续迭代中补充支付、推送等细节
