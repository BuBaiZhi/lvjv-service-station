/**
 * API 配置文件
 * 统一管理所有 API 端点和配置
 */

// API 基础配置
export const API_CONFIG = {
  // 开发环境
  development: {
    baseURL: 'http://localhost:3000/api',
    timeout: 10000
  },
  // 生产环境
  production: {
    baseURL: 'https://api.example.com',
    timeout: 10000
  }
}

// 获取当前环境的 API 配置
export const getApiConfig = () => {
  const env = process.env.NODE_ENV || 'development'
  return API_CONFIG[env as keyof typeof API_CONFIG]
}

// API 端点定义
export const API_ENDPOINTS = {
  // 用户相关
  user: {
    info: '/user/info',
    update: '/user/update',
    avatar: '/user/avatar'
  },
  // 订单相关
  orders: {
    list: '/orders',
    detail: '/orders/:id',
    create: '/orders',
    update: '/orders/:id',
    delete: '/orders/:id'
  },
  // 发布内容相关
  publish: {
    list: '/publish',
    detail: '/publish/:id',
    create: '/publish',
    update: '/publish/:id',
    delete: '/publish/:id',
    publish: '/publish/:id/publish',
    offline: '/publish/:id/offline'
  },
  // 浏览历史相关
  history: {
    list: '/history',
    add: '/history',
    delete: '/history/:id',
    clear: '/history/clear'
  },
  // 收藏相关
  favorites: {
    list: '/favorites',
    add: '/favorites',
    delete: '/favorites/:id'
  }
}

// 请求超时时间（毫秒）
export const REQUEST_TIMEOUT = 10000

// 重试配置
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000
}

// 错误代码映射
export const ERROR_CODES = {
  // 客户端错误
  400: '请求参数错误',
  401: '未授权，请登录',
  403: '禁止访问',
  404: '请求资源不存在',
  408: '请求超时',
  429: '请求过于频繁',

  // 服务器错误
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',

  // 自定义错误
  1000: '网络连接失败',
  1001: '请求被中断',
  1002: '数据解析失败'
}

// 获取错误信息
export const getErrorMessage = (code: number | string): string => {
  return ERROR_CODES[code as keyof typeof ERROR_CODES] || '未知错误'
}
