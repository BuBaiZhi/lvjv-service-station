/**
 * 参数验证中间件
 * 功能：统一验证请求参数，支持多种验证规则
 */

const logger = require('../utils/logger')

/**
 * 验证规则类型
 */
const validators = {
  // 必填
  required: (value) => value !== undefined && value !== null && value !== '',
  
  // 字符串类型
  string: (value) => typeof value === 'string',
  
  // 数字类型
  number: (value) => !isNaN(Number(value)),
  
  // 整数
  integer: (value) => Number.isInteger(Number(value)),
  
  // 正整数
  positiveInteger: (value) => Number.isInteger(Number(value)) && Number(value) > 0,
  
  // 邮箱
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  
  // 手机号（中国）
  phone: (value) => /^1[3-9]\d{9}$/.test(value),
  
  // 最小长度
  minLength: (value, min) => String(value).length >= min,
  
  // 最大长度
  maxLength: (value, max) => String(value).length <= max,
  
  // 范围
  range: (value, [min, max]) => {
    const num = Number(value)
    return num >= min && num <= max
  },
  
  // 枚举值
  enum: (value, enumValues) => enumValues.includes(value),
  
  // 数组
  array: (value) => Array.isArray(value),
  
  // 对象
  object: (value) => typeof value === 'object' && value !== null && !Array.isArray(value),
  
  // 布尔
  boolean: (value) => typeof value === 'boolean' || ['true', 'false', '0', '1'].includes(String(value)),
  
  // 日期格式
  date: (value) => !isNaN(Date.parse(value)),
  
  // URL
  url: (value) => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },
  
  // JSON
  json: (value) => {
    try {
      JSON.parse(value)
      return true
    } catch {
      return false
    }
  }
}

/**
 * 错误消息模板
 */
const errorMessages = {
  required: '字段 {field} 是必填项',
  string: '字段 {field} 必须是字符串',
  number: '字段 {field} 必须是数字',
  integer: '字段 {field} 必须是整数',
  positiveInteger: '字段 {field} 必须是正整数',
  email: '字段 {field} 格式不正确',
  phone: '字段 {field} 必须是有效的手机号',
  minLength: '字段 {field} 长度不能少于 {param}',
  maxLength: '字段 {field} 长度不能超过 {param}',
  range: '字段 {field} 必须在 {param} 范围内',
  enum: '字段 {field} 必须是 {param} 之一',
  array: '字段 {field} 必须是数组',
  object: '字段 {field} 必须是对象',
  boolean: '字段 {field} 必须是布尔值',
  date: '字段 {field} 必须是有效的日期',
  url: '字段 {field} 必须是有效的URL',
  json: '字段 {field} 必须是有效的JSON'
}

/**
 * 格式化错误消息
 */
function formatMessage(template, field, param) {
  return template
    .replace('{field}', field)
    .replace('{param}', Array.isArray(param) ? param.join('-') : String(param))
}

/**
 * 验证单个字段
 */
function validateField(value, rules, fieldName) {
  const errors = []
  
  for (const rule of rules) {
    // 处理字符串规则（如 'required', 'string'）
    if (typeof rule === 'string') {
      if (validators[rule] && !validators[rule](value)) {
        errors.push(formatMessage(errorMessages[rule], fieldName))
      }
    }
    // 处理对象规则（如 { minLength: 6 }）
    else if (typeof rule === 'object') {
      const [ruleName, ruleParam] = Object.entries(rule)[0]
      
      // 如果是required规则且值为空，跳过其他验证
      if (ruleName === 'required' && !validators.required(value)) {
        errors.push(formatMessage(errorMessages.required, fieldName))
        continue
      }
      
      // 非必填字段为空时跳过验证
      if (!rules.includes('required') && !validators.required(value)) {
        continue
      }
      
      if (validators[ruleName] && !validators[ruleName](value, ruleParam)) {
        errors.push(formatMessage(errorMessages[ruleName], fieldName, ruleParam))
      }
    }
  }
  
  return errors
}

/**
 * 创建验证中间件
 * @param {Object} schema - 验证规则
 * @param {string} source - 参数来源 'body' | 'query' | 'params'
 * @returns {Function} Express中间件
 * 
 * @example
 * // 使用示例
 * const validate = require('../middleware/validate')
 * 
 * router.post('/login', validate({
 *   code: ['required', 'string', { minLength: 10 }],
 *   userInfo: ['object']
 * }), loginController)
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source]
    const errors = {}
    
    // 遍历验证规则
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field]
      const fieldErrors = validateField(value, rules, field)
      
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors
      }
    }
    
    // 有错误则返回
    if (Object.keys(errors).length > 0) {
      logger.warn('参数验证失败', { errors, source })
      return res.status(400).json({
        code: 400,
        message: '参数验证失败',
        errors
      })
    }
    
    next()
  }
}

/**
 * 常用验证规则预设
 */
const presets = {
  // 登录验证
  login: {
    code: ['required', 'string']
  },
  
  // 用户信息更新
  userInfo: {
    nickname: ['string', { maxLength: 50 }],
    bio: ['string', { maxLength: 200 }],
    phone: ['phone'],
    wechat: ['string', { maxLength: 50 }]
  },
  
  // 发布内容
  publishItem: {
    type: ['required', { enum: ['house', 'skill', 'post', 'activity'] }],
    title: ['required', 'string', { minLength: 2, maxLength: 100 }],
    description: ['string', { maxLength: 5000 }]
  },
  
  // 分页查询
  pagination: {
    page: ['integer', { range: [1, 1000] }],
    pageSize: ['integer', { range: [1, 100] }]
  }
}

/**
 * 获取预设验证规则
 */
function getPreset(name, source = 'query') {
  return validate(presets[name], source)
}

module.exports = {
  validate,
  validators,
  presets,
  getPreset
}
