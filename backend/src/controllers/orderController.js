/**
 * 订单控制器
 * 功能：处理订单相关的HTTP请求
 */

const orderModel = require('../models/order')
const logger = require('../utils/logger')
const { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError, BusinessError } = require('../utils/errors')

// ============================================
// 获取订单列表
// ============================================
async function getOrders(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const { role = 'buyer', status, page = 1, pageSize = 10 } = req.query
    
    // 验证角色
    if (!['buyer', 'seller'].includes(role)) {
      throw new BadRequestError('角色参数无效')
    }
    
    const result = await orderModel.getUserOrders(
      userId,
      role,
      status || null,
      parseInt(page),
      parseInt(pageSize)
    )
    
    res.json({
      code: 0,
      message: '获取成功',
      data: {
        list: result.list.map(order => ({
          id: order.id,
          orderNo: order.order_no,
          itemType: order.item_type,
          itemTitle: order.item_title,
          itemImage: order.item_image,
          totalAmount: order.total_amount,
          status: order.status,
          startDate: order.start_date,
          endDate: order.end_date,
          guestCount: order.guest_count,
          createdAt: order.created_at,
          otherNickname: order.other_nickname,
          otherAvatar: order.other_avatar
        })),
        total: result.total,
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
// 获取订单详情
// ============================================
async function getOrderById(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const { orderId } = req.params
    
    // 检查权限
    const { hasPermission, reason, role, order } = await orderModel.checkOrderPermission(parseInt(orderId), userId)
    
    if (!hasPermission) {
      throw new ForbiddenError(reason)
    }
    
    res.json({
      code: 0,
      message: '获取成功',
      data: {
        id: order.id,
        orderNo: order.order_no,
        itemType: order.item_type,
        itemId: order.item_id,
        itemTitle: order.item_title,
        itemImage: order.item_image,
        price: order.price,
        deposit: order.deposit,
        totalAmount: order.total_amount,
        status: order.status,
        startDate: order.start_date,
        endDate: order.end_date,
        guestCount: order.guest_count,
        remark: order.remark,
        createdAt: order.created_at,
        payTime: order.pay_time,
        confirmTime: order.confirm_time,
        completeTime: order.complete_time,
        cancelTime: order.cancel_time,
        cancelReason: order.cancel_reason,
        buyer: {
          id: order.user_id,
          nickname: order.buyer_nickname,
          avatar: order.buyer_avatar
        },
        seller: {
          id: order.seller_id,
          nickname: order.seller_nickname,
          avatar: order.seller_avatar
        },
        myRole: role
      }
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 创建订单
// ============================================
async function createOrder(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const { sellerId, itemId, itemType, price, deposit, startDate, endDate, guestCount, remark } = req.body
    
    // 参数验证
    if (!sellerId || !itemId || !itemType || !price) {
      throw new BadRequestError('缺少必要参数')
    }
    
    if (!['house', 'skill', 'activity'].includes(itemType)) {
      throw new BadRequestError('物品类型无效')
    }
    
    // 不能购买自己的商品
    if (parseInt(sellerId) === userId) {
      throw new BusinessError('不能购买自己发布的商品')
    }
    
    const result = await orderModel.createOrder({
      userId,
      sellerId,
      itemId,
      itemType,
      price,
      deposit: deposit || 0,
      startDate,
      endDate,
      guestCount: guestCount || 1,
      remark
    })
    
    logger.info('订单创建成功', { userId, orderId: result.orderId })
    
    res.status(201).json({
      code: 0,
      message: '订单创建成功',
      data: {
        orderId: result.orderId,
        orderNo: result.orderNo
      }
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 取消订单
// ============================================
async function cancelOrder(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const { orderId } = req.params
    const { cancelReason } = req.body
    
    // 检查权限
    const { hasPermission, reason, order } = await orderModel.checkOrderPermission(parseInt(orderId), userId)
    
    if (!hasPermission) {
      throw new ForbiddenError(reason)
    }
    
    // 只有待支付状态可以取消
    if (order.status !== 'pending') {
      throw new BusinessError('当前订单状态不可取消')
    }
    
    const success = await orderModel.cancelOrder(order.id, cancelReason)
    
    if (!success) {
      throw new BusinessError('取消订单失败')
    }
    
    logger.info('订单已取消', { userId, orderId: order.id })
    
    res.json({
      code: 0,
      message: '订单已取消'
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 确认订单（卖家）
// ============================================
async function confirmOrder(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const { orderId } = req.params
    
    // 检查权限（只有卖家可以确认）
    const { hasPermission, reason, role, order } = await orderModel.checkOrderPermission(parseInt(orderId), userId)
    
    if (!hasPermission || role !== 'seller') {
      throw new ForbiddenError('只有卖家可以确认订单')
    }
    
    // 只有已支付状态可以确认
    if (order.status !== 'paid') {
      throw new BusinessError('当前订单状态不可确认')
    }
    
    const success = await orderModel.confirmOrder(order.id)
    
    if (!success) {
      throw new BusinessError('确认订单失败')
    }
    
    logger.info('订单已确认', { userId, orderId: order.id })
    
    res.json({
      code: 0,
      message: '订单已确认'
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 完成订单
// ============================================
async function completeOrder(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const { orderId } = req.params
    
    // 检查权限
    const { hasPermission, reason, order } = await orderModel.checkOrderPermission(parseInt(orderId), userId)
    
    if (!hasPermission) {
      throw new ForbiddenError(reason)
    }
    
    // 只有已确认状态可以完成
    if (order.status !== 'confirmed') {
      throw new BusinessError('当前订单状态不可完成')
    }
    
    const success = await orderModel.completeOrder(order.id)
    
    if (!success) {
      throw new BusinessError('完成订单失败')
    }
    
    logger.info('订单已完成', { userId, orderId: order.id })
    
    res.json({
      code: 0,
      message: '订单已完成'
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 获取订单统计
// ============================================
async function getOrderStats(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const stats = await orderModel.getUserOrderStats(userId)
    
    res.json({
      code: 0,
      message: '获取成功',
      data: {
        buyer: {
          total: stats.buyer.total,
          pending: stats.buyer.pending,
          paid: stats.buyer.paid,
          completed: stats.buyer.completed
        },
        seller: {
          total: stats.seller.total,
          pending: stats.seller.pending,
          confirmed: stats.seller.confirmed
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  confirmOrder,
  completeOrder,
  getOrderStats
}
