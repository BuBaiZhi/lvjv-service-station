/**
 * 消息模型 - 数据库操作层
 * 功能：消息通知的完整CRUD操作
 */

const pool = require('../config/database')
const logger = require('../utils/logger')

// ============================================
// 查询操作
// ============================================

/**
 * 获取用户消息列表
 * @param {number} userId - 用户ID
 * @param {string} type - 消息类型筛选
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 */
async function getMessages(userId, type = null, page = 1, pageSize = 20) {
  try {
    const connection = await pool.getConnection()
    const offset = (page - 1) * pageSize
    
    let whereClause = 'user_id = ?'
    const params = [userId]
    
    if (type) {
      whereClause += ' AND type = ?'
      params.push(type)
    }
    
    // 查询总数
    const [countRows] = await connection.query(
      `SELECT COUNT(*) as total FROM messages WHERE ${whereClause}`,
      params
    )
    const total = countRows[0].total
    
    // 查询未读数
    const [unreadRows] = await connection.query(
      `SELECT COUNT(*) as unread FROM messages WHERE user_id = ? AND is_read = 0`,
      [userId]
    )
    const unreadCount = unreadRows[0].unread
    
    // 查询列表
    params.push(offset, pageSize)
    const [rows] = await connection.query(
      `SELECT * FROM messages 
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT ?, ?`,
      params
    )
    
    connection.release()
    
    return {
      list: rows,
      total,
      unreadCount,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  } catch (error) {
    logger.error('getMessages 失败', { userId, error: error.message })
    throw error
  }
}

/**
 * 获取消息详情
 */
async function getMessageById(messageId, userId) {
  try {
    const connection = await pool.getConnection()
    const [rows] = await connection.query(
      'SELECT * FROM messages WHERE id = ? AND user_id = ?',
      [messageId, userId]
    )
    connection.release()
    return rows.length > 0 ? rows[0] : null
  } catch (error) {
    logger.error('getMessageById 失败', { messageId, error: error.message })
    throw error
  }
}

/**
 * 获取未读消息数量（按类型分组）
 */
async function getUnreadCount(userId) {
  try {
    const connection = await pool.getConnection()
    const [rows] = await connection.query(
      `SELECT type, COUNT(*) as count 
       FROM messages 
       WHERE user_id = ? AND is_read = 0 
       GROUP BY type`,
      [userId]
    )
    
    const [totalRow] = await connection.query(
      `SELECT COUNT(*) as total FROM messages WHERE user_id = ? AND is_read = 0`,
      [userId]
    )
    
    connection.release()
    
    const countByType = {}
    rows.forEach(row => {
      countByType[row.type] = row.count
    })
    
    return {
      total: totalRow[0].total,
      byType: countByType
    }
  } catch (error) {
    logger.error('getUnreadCount 失败', { userId, error: error.message })
    throw error
  }
}

// ============================================
// 创建操作
// ============================================

/**
 * 创建系统消息
 */
async function createMessage(messageData) {
  const { userId, type, title, content, data = null } = messageData
  
  try {
    const connection = await pool.getConnection()
    const [result] = await connection.query(
      `INSERT INTO messages (user_id, type, title, content, data, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, 0, NOW())`,
      [userId, type, title, content, data ? JSON.stringify(data) : null]
    )
    connection.release()
    
    logger.info('创建消息成功', { userId, type, title })
    return result.insertId
  } catch (error) {
    logger.error('createMessage 失败', { messageData, error: error.message })
    throw error
  }
}

/**
 * 批量创建消息（广播）
 */
async function createBroadcast(userIds, type, title, content, data = null) {
  try {
    const connection = await pool.getConnection()
    
    const values = userIds.map(userId => [
      userId, type, title, content, data ? JSON.stringify(data) : null, 0
    ])
    
    await connection.query(
      `INSERT INTO messages (user_id, type, title, content, data, is_read, created_at)
       VALUES ?`,
      [values.map(v => [...v, new Date()])]
    )
    
    connection.release()
    
    logger.info('批量创建消息成功', { count: userIds.length, type, title })
    return userIds.length
  } catch (error) {
    logger.error('createBroadcast 失败', { error: error.message })
    throw error
  }
}

// ============================================
// 更新操作
// ============================================

/**
 * 标记消息为已读
 */
async function markAsRead(messageId, userId) {
  try {
    const connection = await pool.getConnection()
    const [result] = await connection.query(
      'UPDATE messages SET is_read = 1 WHERE id = ? AND user_id = ?',
      [messageId, userId]
    )
    connection.release()
    return result.affectedRows > 0
  } catch (error) {
    logger.error('markAsRead 失败', { messageId, error: error.message })
    throw error
  }
}

/**
 * 标记所有消息为已读
 */
async function markAllAsRead(userId, type = null) {
  try {
    const connection = await pool.getConnection()
    
    let sql = 'UPDATE messages SET is_read = 1 WHERE user_id = ? AND is_read = 0'
    const params = [userId]
    
    if (type) {
      sql += ' AND type = ?'
      params.push(type)
    }
    
    const [result] = await connection.query(sql, params)
    connection.release()
    
    logger.info('标记所有消息已读', { userId, type, count: result.affectedRows })
    return result.affectedRows
  } catch (error) {
    logger.error('markAllAsRead 失败', { userId, error: error.message })
    throw error
  }
}

// ============================================
// 删除操作
// ============================================

/**
 * 删除消息
 */
async function deleteMessage(messageId, userId) {
  try {
    const connection = await pool.getConnection()
    const [result] = await connection.query(
      'DELETE FROM messages WHERE id = ? AND user_id = ?',
      [messageId, userId]
    )
    connection.release()
    return result.affectedRows > 0
  } catch (error) {
    logger.error('deleteMessage 失败', { messageId, error: error.message })
    throw error
  }
}

/**
 * 清空已读消息
 */
async function clearReadMessages(userId) {
  try {
    const connection = await pool.getConnection()
    const [result] = await connection.query(
      'DELETE FROM messages WHERE user_id = ? AND is_read = 1',
      [userId]
    )
    connection.release()
    
    logger.info('清空已读消息', { userId, count: result.affectedRows })
    return result.affectedRows
  } catch (error) {
    logger.error('clearReadMessages 失败', { userId, error: error.message })
    throw error
  }
}

// ============================================
// 快捷创建方法
// ============================================

/**
 * 创建订单通知
 */
async function createOrderNotification(userId, orderId, orderNo, status) {
  const statusTexts = {
    'paid': '已支付',
    'confirmed': '已确认',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  
  return createMessage({
    userId,
    type: 'order',
    title: '订单状态更新',
    content: `您的订单 ${orderNo} 状态已更新为：${statusTexts[status] || status}`,
    data: { orderId, orderNo, status }
  })
}

/**
 * 创建评论通知
 */
async function createCommentNotification(userId, itemId, itemType, commenterName) {
  const typeNames = {
    'house': '民宿',
    'skill': '技能',
    'post': '帖子',
    'activity': '活动'
  }
  
  return createMessage({
    userId,
    type: 'comment',
    title: '收到新评论',
    content: `${commenterName} 评论了您的${typeNames[itemType] || '内容'}`,
    data: { itemId, itemType }
  })
}

/**
 * 创建点赞通知
 */
async function createLikeNotification(userId, itemId, itemType, likerName) {
  const typeNames = {
    'house': '民宿',
    'skill': '技能',
    'post': '帖子',
    'activity': '活动'
  }
  
  return createMessage({
    userId,
    type: 'like',
    title: '收到新点赞',
    content: `${likerName} 赞了您的${typeNames[itemType] || '内容'}`,
    data: { itemId, itemType }
  })
}

/**
 * 创建关注通知
 */
async function createFollowNotification(userId, followerId, followerName) {
  return createMessage({
    userId,
    type: 'follow',
    title: '新增粉丝',
    content: `${followerName} 关注了你`,
    data: { followerId }
  })
}

/**
 * 创建系统公告
 */
async function createSystemNotice(userId, title, content) {
  return createMessage({
    userId,
    type: 'system',
    title,
    content
  })
}

module.exports = {
  // 查询
  getMessages,
  getMessageById,
  getUnreadCount,
  
  // 创建
  createMessage,
  createBroadcast,
  
  // 更新
  markAsRead,
  markAllAsRead,
  
  // 删除
  deleteMessage,
  clearReadMessages,
  
  // 快捷方法
  createOrderNotification,
  createCommentNotification,
  createLikeNotification,
  createFollowNotification,
  createSystemNotice
}
