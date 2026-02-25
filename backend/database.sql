-- MySQL 数据库建表脚本
-- 旅居服务站 - 用户表

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `travel_service` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `travel_service`;

-- 创建用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `openid` VARCHAR(100) UNIQUE NOT NULL COMMENT '微信唯一标识',
  `nickname` VARCHAR(255) COMMENT '昵称',
  `avatar_url` VARCHAR(500) COMMENT '头像 URL',
  `gender` INT DEFAULT 0 COMMENT '性别（0：未知，1：男，2：女）',
  `province` VARCHAR(100) COMMENT '所在省份',
  `city` VARCHAR(100) COMMENT '所在城市',
  `country` VARCHAR(100) COMMENT '所在国家',
  `identity` VARCHAR(50) COMMENT '身份（villager：村民，tourist：游客，null：未选择）',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_openid (`openid`),
  INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 示例数据（可选）
-- INSERT INTO users (openid, nickname, avatar_url, gender, province, city) 
-- VALUES ('test_openid_123', '测试用户', 'https://example.com/avatar.jpg', 1, '浙江', '杭州');
