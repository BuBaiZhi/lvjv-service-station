require('dotenv').config()
const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/auth')

/**
 * Express 应用主入口
 * 原因：初始化 Express 应用，配置中间件和路由
 * 功能：启动 HTTP 服务器，监听客户端请求
 */

const app = express()
const PORT = process.env.PORT || 3000

// 中间件配置
app.use(cors()) // 允许跨域请求（小程序调用后端需要）
app.use(express.json()) // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })) // 解析 URL 编码的请求体

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`)
  next()
})

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    code: 0,
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  })
})

// 路由挂载
app.use('/api/auth', authRoutes)

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  })
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('[Error]', err)
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n🚀 服务器启动成功！`)
  console.log(`📍 服务地址: http://localhost:${PORT}`)
  console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`)
  console.log(`📝 登录接口: POST http://localhost:${PORT}/api/auth/login`)
  console.log(`\n⚠️  请确保 MySQL 已启动且配置正确（数据库名: ${process.env.DB_NAME}）\n`)
})

module.exports = app
