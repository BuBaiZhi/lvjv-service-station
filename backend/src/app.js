/**
 * Express 应用主入口
 */

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')

const { errorHandler, notFoundHandler, setupGlobalErrorHandlers } = require('./middleware/errorHandler')
const { rateLimit } = require('./middleware/rateLimit')

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const orderRoutes = require('./routes/order')
const messageRoutes = require('./routes/message')

const logger = require('./utils/logger')

const app = express()
const PORT = process.env.PORT || 3000

setupGlobalErrorHandlers()

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use((req, res, next) => {
  const startTime = Date.now()
  res.on('finish', () => { logger.request(req, res, Date.now() - startTime) })
  next()
})

app.use(rateLimit({ windowMs: 60 * 1000, max: 100, skip: (req) => req.path === '/api/health' }))

app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: '服务运行正常', data: { status: 'healthy', timestamp: new Date().toISOString() } })
})

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/message', messageRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log('\n🚀 旅居服务站后端启动成功！')
  console.log('📍 服务地址: http://localhost:' + PORT)
  console.log('📡 已加载模块: auth, user, order, message')
  logger.info('服务器启动成功', { port: PORT })
})

module.exports = app
