/**
 * 订单路由
 * 路径前缀: /api/order
 */

const express = require('express')
const router = express.Router()

// 中间件
const { verifyAccessToken } = require('../middleware/auth')
const { rateLimit } = require('../middleware/rateLimit')

// 控制器
const orderController = require('../controllers/orderController')

// ============================================
// 路由定义
// ============================================

/**
 * GET /api/order/list
 * 获取订单列表
 * 需要认证
 * 
 * Query参数:
 * - role: 'buyer'(买家) | 'seller'(卖家)
 * - status: 订单状态筛选
 * - page: 页码
 * - pageSize: 每页数量
 */
router.get('/list', verifyAccessToken, orderController.getOrders)

/**
 * GET /api/order/stats
 * 获取订单统计
 * 需要认证
 */
router.get('/stats', verifyAccessToken, orderController.getOrderStats)

/**
 * GET /api/order/:orderId
 * 获取订单详情
 * 需要认证
 */
router.get('/:orderId', verifyAccessToken, orderController.getOrderById)

/**
 * POST /api/order
 * 创建订单
 * 需要认证
 * 
 * 请求体:
 * {
 *   sellerId: number,      // 卖家ID
 *   itemId: number,        // 物品ID
 *   itemType: 'house'|'skill'|'activity',
 *   price: number,         // 价格
 *   deposit: number,       // 押金
 *   startDate: string,     // 开始日期
 *   endDate: string,       // 结束日期
 *   guestCount: number,    // 人数
 *   remark: string         // 备注
 * }
 */
router.post('/',
  verifyAccessToken,
  rateLimit({ windowMs: 60 * 1000, max: 10 }), // 每分钟最多10次
  orderController.createOrder
)

/**
 * PUT /api/order/:orderId/cancel
 * 取消订单
 * 需要认证
 */
router.put('/:orderId/cancel', verifyAccessToken, orderController.cancelOrder)

/**
 * PUT /api/order/:orderId/confirm
 * 确认订单（卖家）
 * 需要认证
 */
router.put('/:orderId/confirm', verifyAccessToken, orderController.confirmOrder)

/**
 * PUT /api/order/:orderId/complete
 * 完成订单
 * 需要认证
 */
router.put('/:orderId/complete', verifyAccessToken, orderController.completeOrder)

module.exports = router
