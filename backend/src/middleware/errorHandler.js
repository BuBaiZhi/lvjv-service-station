/**
 * 统一错误处理中间件
 * 功能：捕获所有错误，返回标准化响应
 */

const logger = require('../utils/logger')
const { AppError } = require('../utils/errors')

/**
 * 错误处理中间件
 */
function errorHandler(err, req, res, next) {
  // 如果响应已发送，交给默认错误处理
  if (res.headersSent) {
    return next(err)
  }
  
  // 记录错误日志
  const errorInfo = {
    message: err.message,
    code: err.code,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    ip: req.ip
  }
  
  // 根据错误类型决定日志级别
  if (err.isOperational) {
    // 可预期的错误，记录警告
    logger.warn(`[Operational Error] ${err.message}`, errorInfo)
  } else {
    // 不可预期的错误，记录错误
    logger.error(`[Unexpected Error] ${err.message}`, errorInfo)
  }
  
  // 构建响应
  const response = {
    code: err.code || 500,
    message: err.message || '服务器内部错误',
    timestamp: new Date().toISOString()
  }
  
  // 开发环境返回堆栈信息
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack
    response.details = errorInfo
  }
  
  // 返回响应
  res.status(err.statusCode || 500).json(response)
}

/**
 * 404 处理中间件
 */
function notFoundHandler(req, res, next) {
  const err = new Error(`接口不存在: ${req.method} ${req.path}`)
  err.code = 404
  err.statusCode = 404
  err.isOperational = true
  next(err)
}

/**
 * 异步错误包装器
 * 用于包装异步路由处理器，自动捕获异常
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.findAll()
 *   res.json({ code: 0, data: users })
 * }))
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * 未捕获异常处理
 */
function setupGlobalErrorHandlers() {
  // 未捕获的Promise异常
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('未捕获的Promise异常', { reason, promise })
    // 生产环境下可以选择退出进程
    // process.exit(1)
  })
  
  // 未捕获的异常
  process.on('uncaughtException', (error) => {
    logger.error('未捕获的异常', { error: error.message, stack: error.stack })
    // 生产环境下应该退出进程
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  })
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  setupGlobalErrorHandlers
}
