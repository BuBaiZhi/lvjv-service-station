/**
 * Express 应用主入口
 * 功能：初始化应用，配置中间件和路由
 */

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')

// 中间件
const { errorHandler, notFoundHandler, asyncHandler, setupGlobalErrorHandlers } = require('./middleware/errorHandler')
const { rateLimit } = require('./middleware/rateLimit')

// 路由
const authRoutes = require('./routes/auth')

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
  origin: '*', // 开发环境允许所有来源，生产环境应配置具体域名
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
  
  // 响应完成时记录日志
  res.on('finish', () => {
    const responseTime = Date.now() - startTime
    logger.request(req, res, responseTime)
  })
  
  next()
})

// 全局限流（标准限制）
app.use(rateLimit({
  windowMs: 60 * 1000,  // 1分钟
  max: 100,             // 最多100次请求
  skip: (req) => {
    // 健康检查跳过限流
    return req.path === '/api/health'
  }
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
// TODO: 添加更多路由
// app.use('/api/users', userRoutes)
// app.use('/api/items', itemRoutes)
// app.use('/api/orders', orderRoutes)
// app.use('/api/messages', messageRoutes)

// ============================================
// 错误处理
// ============================================

// 404处理
app.use(notFoundHandler)

// 统一错误处理
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
  console.log(`📝 登录接口: POST http://localhost:${PORT}/api/auth/login`)
  console.log(`📁 上传目录: ${path.join(__dirname, '../uploads')}`)
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`)
  console.log('='.repeat(50))
  console.log(`\n⚠️  请确保 MySQL 已启动且配置正确`)
  console.log(`   数据库: ${process.env.DB_NAME || 'travel_service'}\n`)
  
  logger.info('服务器启动成功', { port: PORT })
})

module.exports = app
