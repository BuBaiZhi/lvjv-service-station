/**
 * 订单模型 - 数据库操作层
 * 功能：订单的完整CRUD操作
 */

const pool = require('../config/database')
const logger = require('../utils/logger')

/**
 * 生成订单编号
 * 格式: ORD + 时间戳 + 4位随机数
 */
function generateOrderNo() {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ORD${timestamp}${random}`
}

// ============================================
// 查询操作
// ============================================

/**
 * 根据ID查找订单
 */
async function findOrderById(orderId) {
  try {
    const connection = await pool.getConnection()
    const [rows] = await connection.query(
      `SELECT o.*, 
        i.title as item_title, i.type as item_type, i.cover_image as item_image,
        buyer.nickname as buyer_nickname, buyer.avatar_url as buyer_avatar,
        seller.nickname as seller_nickname, seller.avatar_url as seller_avatar
       FROM orders o
       LEFT JOIN items i ON o.item_id = i.id
       LEFT JOIN users buyer ON o.user_id = buyer.id
       LEFT JOIN users seller ON o.seller_id = seller.id
       WHERE o.id = ?`,
      [orderId]
    )
    connection.release()
    return rows.length > 0 ? rows[0] : null
  } catch (error) {
    logger.error('findOrderById 失败', { orderId, error: error.message })
    throw error
  }
}

/**
 * 根据订单编号查找订单
 */
async function findOrderByNo(orderNo) {
  try {
    const connection = await pool.getConnection()
    const [rows] = await connection.query(
      'SELECT * FROM orders WHERE order_no = ?',
      [orderNo]
    )
    connection.release()
    return rows.length > 0 ? rows[0] : null
  } catch (error) {
    logger.error('findOrderByNo 失败', { orderNo, error: error.message })
    throw error
  }
}

/**
 * 获取用户的订单列表
 * @param {number} userId - 用户ID
 * @param {string} role - 角色: 'buyer'(买家) 或 'seller'(卖家)
 * @param {string} status - 订单状态筛选
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 */
async function getUserOrders(userId, role = 'buyer', status = null, page = 1, pageSize = 10) {
  try {
    const connection = await pool.getConnection()
    const offset = (page - 1) * pageSize
    
    let whereClause = role === 'buyer' ? 'o.user_id = ?' : 'o.seller_id = ?'
    const params = [userId]
    
    if (status) {
      whereClause += ' AND o.status = ?'
      params.push(status)
    }
    
    // 查询总数
    const [countRows] = await connection.query(
      `SELECT COUNT(*) as total FROM orders o WHERE ${whereClause}`,
      params
    )
    const total = countRows[0].total
    
    // 查询列表
    params.push(offset, pageSize)
    const [rows] = await connection.query(
      `SELECT o.*, 
        i.title as item_title, i.type as item_type, i.cover_image as item_image,
        u.nickname as other_nickname, u.avatar_url as other_avatar
       FROM orders o
       LEFT JOIN items i ON o.item_id = i.id
       LEFT JOIN users u ON ${role === 'buyer' ? 'o.seller_id' : 'o.user_id'} = u.id
       WHERE ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ?, ?`,
      params
    )
    
    connection.release()
    
    return {
      list: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  } catch (error) {
    logger.error('getUserOrders 失败', { userId, error: error.message })
    throw error
  }
}

// ============================================
// 创建操作
// ============================================

/**
 * 创建订单
 */
async function createOrder(orderData) {
  const { userId, sellerId, itemId, itemType, price, deposit = 0, 
          startDate, endDate, guestCount = 1, remark } = orderData
  
  const orderNo = generateOrderNo()
  const totalAmount = parseFloat(price) + parseFloat(deposit)
  
  try {
    const connection = await pool.getConnection()
    const [result] = await connection.query(
      `INSERT INTO orders 
       (order_no, user_id, seller_id, item_id, item_type, price, deposit, total_amount, 
        start_date, end_date, guest_count, remark, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [orderNo, userId, sellerId, itemId, itemType, price, deposit, totalAmount,
       startDate, endDate, guestCount, remark]
    )
    connection.release()
    
    logger.info('创建订单成功', { orderNo, orderId: result.insertId, userId })
    
    return {
      orderId: result.insertId,
      orderNo
    }
  } catch (error) {
    logger.error('createOrder 失败', { orderData, error: error.message })
    throw error
  }
}

// ============================================
// 更新操作
// ============================================

/**
 * 更新订单状态
 */
async function updateOrderStatus(orderId, status, extraData = {}) {
  try {
    const connection = await pool.getConnection()
    
    const updateFields = ['status = ?']
    const params = [status]
    
    // 根据状态设置时间
    if (status === 'paid') {
      updateFields.push('pay_time = NOW()')
    } else if (status === 'confirmed') {
      updateFields.push('confirm_time = NOW()')
    } else if (status === 'completed') {
      updateFields.push('complete_time = NOW()')
    } else if (status === 'cancelled') {
      updateFields.push('cancel_time = NOW()')
      if (extraData.cancelReason) {
        updateFields.push('cancel_reason = ?')
        params.push(extraData.cancelReason)
      }
    }
    
    params.push(orderId)
    
    const [result] = await connection.query(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    )
    
    connection.release()
    
    logger.info('更新订单状态', { orderId, status })
    return result.affectedRows > 0
  } catch (error) {
    logger.error('updateOrderStatus 失败', { orderId, error: error.message })
    throw error
  }
}

/**
 * 取消订单
 */
async function cancelOrder(orderId, cancelReason = '') {
  return updateOrderStatus(orderId, 'cancelled', { cancelReason })
}

/**
 * 确认订单
 */
async function confirmOrder(orderId) {
  return updateOrderStatus(orderId, 'confirmed')
}

/**
 * 完成订单
 */
async function completeOrder(orderId) {
  return updateOrderStatus(orderId, 'completed')
}

// ============================================
// 统计操作
// ============================================

/**
 * 获取用户订单统计
 */
async function getUserOrderStats(userId) {
  try {
    const connection = await pool.getConnection()
    
    // 买家统计
    const [buyerStats] = await connection.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
       FROM orders WHERE user_id = ?`,
      [userId]
    )
    
    // 卖家统计
    const [sellerStats] = await connection.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed
       FROM orders WHERE seller_id = ?`,
      [userId]
    )
    
    connection.release()
    
    return {
      buyer: buyerStats[0],
      seller: sellerStats[0]
    }
  } catch (error) {
    logger.error('getUserOrderStats 失败', { userId, error: error.message })
    throw error
  }
}

/**
 * 检查用户是否有权操作订单
 */
async function checkOrderPermission(orderId, userId) {
  const order = await findOrderById(orderId)
  if (!order) return { hasPermission: false, reason: '订单不存在' }
  
  if (order.user_id === userId) {
    return { hasPermission: true, role: 'buyer', order }
  }
  if (order.seller_id === userId) {
    return { hasPermission: true, role: 'seller', order }
  }
  
  return { hasPermission: false, reason: '无权操作此订单' }
}

module.exports = {
  // 查询
  findOrderById,
  findOrderByNo,
  getUserOrders,
  
  // 创建
  createOrder,
  
  // 更新
  updateOrderStatus,
  cancelOrder,
  confirmOrder,
  completeOrder,
  
  // 统计
  getUserOrderStats,
  
  // 权限
  checkOrderPermission,
  
  // 工具
  generateOrderNo
}
