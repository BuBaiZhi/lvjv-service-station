/**
 * 消息路由
 * 路径前缀: /api/message
 */

const express = require('express')
const router = express.Router()

// 中间件
const { verifyAccessToken } = require('../middleware/auth')

// 控制器
const messageController = require('../controllers/messageController')

// ============================================
// 路由定义
// ============================================

/**
 * GET /api/message/list
 * 获取消息列表
 */
router.get('/list', verifyAccessToken, messageController.getMessages)

/**
 * GET /api/message/unread
 * 获取未读消息数量
 */
router.get('/unread', verifyAccessToken, messageController.getUnreadCount)

/**
 * GET /api/message/:messageId
 * 获取消息详情（自动标记已读）
 */
router.get('/:messageId', verifyAccessToken, messageController.getMessageById)

/**
 * PUT /api/message/:messageId/read
 * 标记消息为已读
 */
router.put('/:messageId/read', verifyAccessToken, messageController.markAsRead)

/**
 * PUT /api/message/read-all
 * 标记全部消息为已读
 */
router.put('/read-all', verifyAccessToken, messageController.markAllAsRead)

/**
 * DELETE /api/message/:messageId
 * 删除消息
 */
router.delete('/:messageId', verifyAccessToken, messageController.deleteMessage)

/**
 * DELETE /api/message/clear-read
 * 清空已读消息
 */
router.delete('/clear-read', verifyAccessToken, messageController.clearReadMessages)

module.exports = router
