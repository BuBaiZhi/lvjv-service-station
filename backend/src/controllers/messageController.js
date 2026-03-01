/**
 * 消息控制器
 * 功能：处理消息通知相关的HTTP请求
 */

const messageModel = require('../models/message')
const logger = require('../utils/logger')
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../utils/errors')

// ============================================
// 获取消息列表
// ============================================
async function getMessages(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const { type, page = 1, pageSize = 20 } = req.query
    
    // 验证类型
    if (type && !['system', 'order', 'comment', 'like', 'follow'].includes(type)) {
      throw new BadRequestError('消息类型无效')
    }
    
    const result = await messageModel.getMessages(
      userId,
      type || null,
      parseInt(page),
      parseInt(pageSize)
    )
    
    res.json({
      code: 0,
      message: '获取成功',
      data: {
        list: result.list.map(msg => ({
          id: msg.id,
          type: msg.type,
          title: msg.title,
          content: msg.content,
          data: msg.data,
          isRead: msg.is_read === 1,
          createdAt: msg.created_at
        })),
        total: result.total,
        unreadCount: result.unreadCount,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      }
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 获取消息详情
// ============================================
async function getMessageById(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const { messageId } = req.params
    
    const message = await messageModel.getMessageById(parseInt(messageId), userId)
    
    if (!message) {
      throw new NotFoundError('消息不存在')
    }
    
    // 自动标记为已读
    if (message.is_read === 0) {
      await messageModel.markAsRead(parseInt(messageId), userId)
    }
    
    res.json({
      code: 0,
      message: '获取成功',
      data: {
        id: message.id,
        type: message.type,
        title: message.title,
        content: message.content,
        data: message.data,
        isRead: true,
        createdAt: message.created_at
      }
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 获取未读数量
// ============================================
async function getUnreadCount(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const result = await messageModel.getUnreadCount(userId)
    
    res.json({
      code: 0,
      message: '获取成功',
      data: {
        total: result.total,
        byType: result.byType
      }
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 标记消息已读
// ============================================
async function markAsRead(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const { messageId } = req.params
    
    const success = await messageModel.markAsRead(parseInt(messageId), userId)
    
    if (!success) {
      throw new NotFoundError('消息不存在')
    }
    
    res.json({
      code: 0,
      message: '已标记为已读'
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 标记全部已读
// ============================================
async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const { type } = req.body
    
    const count = await messageModel.markAllAsRead(userId, type || null)
    
    res.json({
      code: 0,
      message: `已将 ${count} 条消息标记为已读`,
      data: { count }
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 删除消息
// ============================================
async function deleteMessage(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const { messageId } = req.params
    
    const success = await messageModel.deleteMessage(parseInt(messageId), userId)
    
    if (!success) {
      throw new NotFoundError('消息不存在')
    }
    
    res.json({
      code: 0,
      message: '删除成功'
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 清空已读消息
// ============================================
async function clearReadMessages(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const count = await messageModel.clearReadMessages(userId)
    
    res.json({
      code: 0,
      message: `已清空 ${count} 条已读消息`,
      data: { count }
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getMessages,
  getMessageById,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteMessage,
  clearReadMessages
}
