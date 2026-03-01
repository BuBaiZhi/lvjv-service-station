/**
 * Express 应用主入口
 * 功能：初始化应用，配置中间件和路由
 */

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')

// 中间件
const { errorHandler, notFoundHandler, setupGlobalErrorHandlers } = require('./middleware/errorHandler')
const { rateLimit } = require('./middleware/rateLimit')

// 路由
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const orderRoutes = require('./routes/order')

// 工具
const logger = require('./utils/logger')

// 初始化应用
const app = express()
const PORT = process.env.PORT || 3000

// ============================================
// 全局错误处理设置
// ============================================
setupGlobalErrorHandlers()

// ============================================
// 中间件配置
// ============================================

// 跨域支持
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// 请求体解析
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 静态文件服务（上传的文件）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// 请求日志中间件
app.use((req, res, next) => {
  const startTime = Date.now()
  res.on('finish', () => {
    const responseTime = Date.now() - startTime
    logger.request(req, res, responseTime)
  })
  next()
})

// 全局限流
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  skip: (req) => req.path === '/api/health'
}))

// ============================================
// 路由配置
// ============================================

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    code: 0,
    message: '服务运行正常',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
  })
})

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/order', orderRoutes)

// ============================================
// 错误处理
// ============================================

app.use(notFoundHandler)
app.use(errorHandler)

// ============================================
// 启动服务器
// ============================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50))
  console.log('🚀 旅居服务站后端启动成功！')
  console.log('='.repeat(50))
  console.log(`📍 服务地址: http://localhost:${PORT}`)
  console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`)
  console.log('')
  console.log('📡 API接口:')
  console.log('   认证模块:')
  console.log(`   POST /api/auth/login      - 微信登录`)
  console.log(`   POST /api/auth/refresh    - 刷新Token`)
  console.log('')
  console.log('   用户模块:')
  console.log(`   GET  /api/user/me         - 获取当前用户`)
  console.log(`   PUT  /api/user/info       - 更新用户信息`)
  console.log(`   POST /api/user/avatar     - 上传头像`)
  console.log(`   POST /api/user/identity   - 设置身份`)
  console.log('')
  console.log('   订单模块:')
  console.log(`   GET  /api/order/list      - 获取订单列表`)
  console.log(`   GET  /api/order/stats     - 获取订单统计`)
  console.log(`   GET  /api/order/:id       - 获取订单详情`)
  console.log(`   POST /api/order           - 创建订单`)
  console.log(`   PUT  /api/order/:id/cancel  - 取消订单`)
  console.log(`   PUT  /api/order/:id/confirm - 确认订单`)
  console.log('')
  console.log(`📁 上传目录: ${path.join(__dirname, '../uploads')}`)
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`)
  console.log('='.repeat(50) + '\n')
  
  logger.info('服务器启动成功', { port: PORT })
})

module.exports = app
