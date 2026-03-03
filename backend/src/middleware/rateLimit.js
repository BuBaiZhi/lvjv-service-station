/**
 * 限流中间件
 * 功能：防止恶意请求，保护服务器资源
 */

const logger = require('../utils/logger')
const { TooManyRequestsError } = require('../utils/errors')

/**
 * 内存存储（适用于单机）
 * 生产环境建议使用 Redis
 */
class MemoryStore {
  constructor() {
    this.requests = new Map()
    // 每10分钟清理一次过期记录
    setInterval(() => this.cleanup(), 10 * 60 * 1000)
  }
  
  // 获取客户端标识的请求记录
  get(key) {
    return this.requests.get(key) || { count: 0, firstRequest: Date.now() }
  }
  
  // 增加请求计数
  increment(key) {
    const record = this.get(key)
    record.count++
    record.lastRequest = Date.now()
    this.requests.set(key, record)
    return record
  }
  
  // 重置记录
  reset(key) {
    this.requests.delete(key)
  }
  
  // 清理过期记录
  cleanup() {
    const now = Date.now()
    const maxAge = 60 * 60 * 1000 // 1小时
    for (const [key, record] of this.requests.entries()) {
      if (now - record.lastRequest > maxAge) {
        this.requests.delete(key)
      }
    }
  }
}

// 全局存储实例
const store = new MemoryStore()

/**
 * 获取客户端标识
 * 优先使用用户ID，其次使用IP
 */
function getClientId(req) {
  // 已登录用户使用用户ID
  if (req.user && req.user.id) {
    return `user:${req.user.id}`
  }
  // 未登录用户使用IP
  return `ip:${req.ip || req.connection.remoteAddress}`
}

/**
 * 创建限流中间件
 * 
 * @param {Object} options - 配置选项
 * @param {number} options.windowMs - 时间窗口（毫秒）
 * @param {number} options.max - 最大请求数
 * @param {string} options.message - 超限时的错误消息
 * @param {Function} options.keyGenerator - 自定义标识生成器
 * @param {Function} options.skip - 跳过限流的条件
 * 
 * @example
 * // 每分钟最多100次请求
 * router.use(rateLimit({ windowMs: 60 * 1000, max: 100 }))
 * 
 * // 每小时最多5次登录尝试
 * router.post('/login', rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), loginController)
 */
function rateLimit(options = {}) {
  const {
    windowMs = 60 * 1000,  // 默认1分钟
    max = 100,             // 默认100次
    message = '请求过于频繁，请稍后再试',
    keyGenerator = getClientId,
    skip = null
  } = options
  
  return (req, res, next) => {
    // 检查是否跳过限流
    if (skip && skip(req)) {
      return next()
    }
    
    // 获取客户端标识
    const key = keyGenerator(req)
    
    // 获取请求记录
    const record = store.get(key)
    const now = Date.now()
    
    // 检查是否在时间窗口内
    if (now - record.firstRequest > windowMs) {
      // 超出时间窗口，重置计数
      store.reset(key)
      store.increment(key)
      return next()
    }
    
    // 检查是否超过限制
    if (record.count >= max) {
      const retryAfter = Math.ceil((record.firstRequest + windowMs - now) / 1000)
      logger.warn(`限流触发: ${key}`, { 
        count: record.count, 
        max, 
        retryAfter 
      })
      
      // 设置重试头
      res.setHeader('Retry-After', retryAfter)
      res.setHeader('X-RateLimit-Limit', max)
      res.setHeader('X-RateLimit-Remaining', 0)
      res.setHeader('X-RateLimit-Reset', record.firstRequest + windowMs)
      
      return next(new TooManyRequestsError(message))
    }
    
    // 增加计数
    const newRecord = store.increment(key)
    
    // 设置响应头
    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - newRecord.count))
    res.setHeader('X-RateLimit-Reset', record.firstRequest + windowMs)
    
    next()
  }
}

/**
 * 预设限流配置
 */
const presets = {
  // 宽松限制 - 一般API
  loose: {
    windowMs: 60 * 1000,  // 1分钟
    max: 100
  },
  
  // 标准限制 - 大多数API
  standard: {
    windowMs: 60 * 1000,  // 1分钟
    max: 60
  },
  
  // 严格限制 - 敏感操作
  strict: {
    windowMs: 60 * 1000,  // 1分钟
    max: 10
  },
  
  // 登录限制 - 防暴力破解
  login: {
    windowMs: 15 * 60 * 1000,  // 15分钟
    max: 5,
    message: '登录尝试次数过多，请15分钟后再试'
  },
  
  // 短信验证码限制
  sms: {
    windowMs: 60 * 60 * 1000,  // 1小时
    max: 5,
    message: '验证码发送次数过多，请1小时后再试'
  },
  
  // 文件上传限制
  upload: {
    windowMs: 60 * 60 * 1000,  // 1小时
    max: 20,
    message: '上传次数过多，请稍后再试'
  }
}

/**
 * 获取预设限流中间件
 */
function getRateLimit(preset) {
  return rateLimit(presets[preset] || presets.standard)
}

module.exports = {
  rateLimit,
  presets,
  getRateLimit
}
