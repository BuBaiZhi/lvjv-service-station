-- ============================================
-- 旅居服务站 - 数据库建表脚本
-- 版本: v1.0
-- 日期: 2026-02-26
-- ============================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `travel_service` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `travel_service`;

-- ============================================
-- 1. 用户表 (users)
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `openid` VARCHAR(100) UNIQUE NOT NULL COMMENT '微信唯一标识',
  `unionid` VARCHAR(100) COMMENT '微信开放平台唯一标识',
  `nickname` VARCHAR(50) NOT NULL DEFAULT '旅居用户' COMMENT '昵称',
  `avatar_url` VARCHAR(500) DEFAULT '' COMMENT '头像URL',
  `gender` TINYINT DEFAULT 0 COMMENT '性别（0：未知，1：男，2：女）',
  `phone` VARCHAR(20) COMMENT '手机号',
  `wechat` VARCHAR(50) COMMENT '微信号',
  `bio` VARCHAR(200) DEFAULT '' COMMENT '个人简介',
  `province` VARCHAR(50) COMMENT '省份',
  `city` VARCHAR(50) COMMENT '城市',
  
  -- 身份相关
  `identity` ENUM('villager', 'nomad', 'unset') DEFAULT 'unset' COMMENT '身份（村民/数字游民/未设置）',
  `identity_verified` TINYINT(1) DEFAULT 0 COMMENT '身份是否认证',
  
  -- 设置相关
  `theme` ENUM('light', 'dark') DEFAULT 'light' COMMENT '主题',
  `app_version` ENUM('standard', 'elderly') DEFAULT 'standard' COMMENT '应用版本（标准/适老）',
  `notification_enabled` TINYINT(1) DEFAULT 1 COMMENT '通知开关',
  `privacy_mode` TINYINT(1) DEFAULT 0 COMMENT '隐私模式',
  
  -- 统计字段
  `post_count` INT DEFAULT 0 COMMENT '发布数量',
  `order_count` INT DEFAULT 0 COMMENT '交易数量',
  `follower_count` INT DEFAULT 0 COMMENT '粉丝数',
  `following_count` INT DEFAULT 0 COMMENT '关注数',
  
  -- 状态
  `status` ENUM('active', 'banned', 'deleted') DEFAULT 'active' COMMENT '账号状态',
  `last_login_at` DATETIME COMMENT '最后登录时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX `idx_openid` (`openid`),
  INDEX `idx_identity` (`identity`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 2. 内容/物品表 (items)
-- 核心内容表，通过 type 区分不同模块
-- ============================================
CREATE TABLE IF NOT EXISTS `items` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '物品ID',
  `user_id` INT NOT NULL COMMENT '发布者ID',
  `type` ENUM('house', 'skill', 'activity', 'post') NOT NULL COMMENT '类型：民宿/技能/活动/帖子',
  `category` VARCHAR(30) COMMENT '细分分类',
  `title` VARCHAR(100) NOT NULL COMMENT '标题',
  `description` TEXT COMMENT '详细描述',
  `images` JSON COMMENT '图片列表JSON',
  `cover_image` VARCHAR(500) COMMENT '封面图片',
  `price` DECIMAL(10,2) COMMENT '价格',
  `unit` VARCHAR(20) COMMENT '价格单位：元/天、元/次',
  `location` VARCHAR(100) COMMENT '位置',
  `latitude` DECIMAL(10,7) COMMENT '纬度',
  `longitude` DECIMAL(10,7) COMMENT '经度',
  `contact` JSON COMMENT '联系方式JSON：{phone, wechat}',
  
  -- 民宿专属字段
  `house_info` JSON COMMENT '民宿信息：{bedroom, bathroom, capacity, facilities}',
  -- 技能专属字段
  `skill_info` JSON COMMENT '技能信息：{category, experience, certificate}',
  -- 活动专属字段
  `activity_info` JSON COMMENT '活动信息：{date, duration, max_people}',
  
  -- 统计
  `view_count` INT DEFAULT 0 COMMENT '浏览数',
  `like_count` INT DEFAULT 0 COMMENT '点赞数',
  `comment_count` INT DEFAULT 0 COMMENT '评论数',
  `favorite_count` INT DEFAULT 0 COMMENT '收藏数',
  
  -- 状态
  `status` ENUM('draft', 'pending', 'active', 'rejected', 'expired', 'deleted') DEFAULT 'active' COMMENT '状态',
  `reject_reason` VARCHAR(200) COMMENT '拒绝原因',
  `is_top` TINYINT(1) DEFAULT 0 COMMENT '是否置顶',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `expired_at` DATETIME COMMENT '过期时间',
  
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_category` (`category`),
  INDEX `idx_location` (`location`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_price` (`price`),
  FULLTEXT INDEX `ft_title_desc` (`title`, `description`),
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容物品表';

-- ============================================
-- 3. 订单表 (orders)
-- ============================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
  `order_no` VARCHAR(32) UNIQUE NOT NULL COMMENT '订单编号',
  `user_id` INT NOT NULL COMMENT '买家ID',
  `seller_id` INT NOT NULL COMMENT '卖家ID',
  `item_id` INT NOT NULL COMMENT '物品ID',
  `item_type` ENUM('house', 'skill', 'activity') NOT NULL COMMENT '物品类型',
  
  -- 订单金额
  `price` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  `deposit` DECIMAL(10,2) DEFAULT 0 COMMENT '押金',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '总金额',
  
  -- 预约信息
  `start_date` DATE COMMENT '开始日期',
  `end_date` DATE COMMENT '结束日期',
  `guest_count` INT DEFAULT 1 COMMENT '人数',
  `remark` VARCHAR(500) COMMENT '备注',
  
  -- 状态
  `status` ENUM('pending', 'paid', 'confirmed', 'completed', 'cancelled', 'refunded') DEFAULT 'pending' COMMENT '订单状态',
  `cancel_reason` VARCHAR(200) COMMENT '取消原因',
  `pay_time` DATETIME COMMENT '支付时间',
  `confirm_time` DATETIME COMMENT '确认时间',
  `complete_time` DATETIME COMMENT '完成时间',
  `cancel_time` DATETIME COMMENT '取消时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_seller_id` (`seller_id`),
  INDEX `idx_item_id` (`item_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- ============================================
-- 4. 消息表 (messages)
-- 系统通知
-- ============================================
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
  `user_id` INT NOT NULL COMMENT '接收用户ID',
  `type` ENUM('system', 'order', 'comment', 'like', 'follow') NOT NULL COMMENT '消息类型',
  `title` VARCHAR(100) NOT NULL COMMENT '消息标题',
  `content` TEXT COMMENT '消息内容',
  `data` JSON COMMENT '关联数据JSON',
  `is_read` TINYINT(1) DEFAULT 0 COMMENT '是否已读',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_created_at` (`created_at`),
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息通知表';

-- ============================================
-- 5. 聊天消息表 (chat_messages)
-- ============================================
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '聊天消息ID',
  `from_id` INT NOT NULL COMMENT '发送者ID',
  `to_id` INT NOT NULL COMMENT '接收者ID',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `type` ENUM('text', 'image', 'location') DEFAULT 'text' COMMENT '消息类型',
  `is_read` TINYINT(1) DEFAULT 0 COMMENT '是否已读',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  INDEX `idx_from_id` (`from_id`),
  INDEX `idx_to_id` (`to_id`),
  INDEX `idx_created_at` (`created_at`),
  
  FOREIGN KEY (`from_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`to_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天消息表';

-- ============================================
-- 6. 收藏表 (favorites)
-- ============================================
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '收藏ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `item_id` INT NOT NULL COMMENT '物品ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  UNIQUE KEY `uk_user_item` (`user_id`, `item_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_item_id` (`item_id`),
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- ============================================
-- 7. 浏览历史表 (browse_history)
-- ============================================
CREATE TABLE IF NOT EXISTS `browse_history` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '历史ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `item_id` INT NOT NULL COMMENT '物品ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_item_id` (`item_id`),
  INDEX `idx_created_at` (`created_at`),
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='浏览历史表';

-- ============================================
-- 8. 点赞表 (likes)
-- ============================================
CREATE TABLE IF NOT EXISTS `likes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `item_id` INT NOT NULL COMMENT '物品ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  UNIQUE KEY `uk_user_item` (`user_id`, `item_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_item_id` (`item_id`),
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞表';

-- ============================================
-- 9. 评论表 (comments)
-- ============================================
CREATE TABLE IF NOT EXISTS `comments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `item_id` INT NOT NULL COMMENT '物品ID',
  `content` VARCHAR(500) NOT NULL COMMENT '评论内容',
  `parent_id` INT DEFAULT NULL COMMENT '父评论ID',
  `reply_to_id` INT DEFAULT NULL COMMENT '回复用户ID',
  `like_count` INT DEFAULT 0 COMMENT '点赞数',
  `status` ENUM('active', 'deleted') DEFAULT 'active' COMMENT '状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_item_id` (`item_id`),
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_created_at` (`created_at`),
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ============================================
-- 10. 关注表 (follows)
-- ============================================
CREATE TABLE IF NOT EXISTS `follows` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '关注ID',
  `follower_id` INT NOT NULL COMMENT '关注者ID',
  `following_id` INT NOT NULL COMMENT '被关注者ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  UNIQUE KEY `uk_follower_following` (`follower_id`, `following_id`),
  INDEX `idx_follower_id` (`follower_id`),
  INDEX `idx_following_id` (`following_id`),
  
  FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关注表';

-- ============================================
-- 11. 评价表 (reviews)
-- ============================================
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '评价ID',
  `order_id` INT NOT NULL COMMENT '订单ID',
  `user_id` INT NOT NULL COMMENT '评价者ID',
  `seller_id` INT NOT NULL COMMENT '被评价者ID',
  `item_id` INT NOT NULL COMMENT '物品ID',
  `rating` TINYINT NOT NULL COMMENT '评分（1-5）',
  `content` VARCHAR(500) COMMENT '评价内容',
  `images` JSON COMMENT '评价图片',
  `reply` VARCHAR(200) COMMENT '商家回复',
  `reply_at` DATETIME COMMENT '回复时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_seller_id` (`seller_id`),
  INDEX `idx_item_id` (`item_id`),
  INDEX `idx_rating` (`rating`),
  
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价表';

-- ============================================
-- 12. 草稿表 (drafts)
-- ============================================
CREATE TABLE IF NOT EXISTS `drafts` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '草稿ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `type` ENUM('house', 'skill', 'activity', 'post') NOT NULL COMMENT '类型',
  `content` JSON NOT NULL COMMENT '草稿内容JSON',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_updated_at` (`updated_at`),
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='草稿表';

-- ============================================
-- 初始化数据
-- ============================================

-- 插入测试用户（可选）
-- INSERT INTO users (openid, nickname, avatar_url, gender, province, city, identity) 
-- VALUES 
--   ('test_openid_001', '田园旅人', 'https://picsum.photos/120/120?random=1', 1, '浙江', '杭州', 'villager'),
--   ('test_openid_002', '云游四海', 'https://picsum.photos/120/120?random=2', 2, '上海', '上海', 'nomad');
