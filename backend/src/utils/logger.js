/**
 * 日志系统 - 统一日志管理
 * 功能：控制台输出 + 文件存储（生产环境）
 */

const fs = require('fs')
const path = require('path')

// 日志级别
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
}

// 当前日志级别（开发环境DEBUG，生产环境INFO）
const currentLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG

// 日志颜色（控制台）
const COLORS = {
  DEBUG: '\x1b[36m',  // 青色
  INFO: '\x1b[32m',   // 绿色
  WARN: '\x1b[33m',   // 黄色
  ERROR: '\x1b[31m',  // 红色
  RESET: '\x1b[0m'
}

// 日志目录
const LOG_DIR = path.join(__dirname, '../../logs')

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

/**
 * 格式化时间
 */
function formatTime(date) {
  return date.toISOString().replace('T', ' ').substring(0, 19)
}

/**
 * 获取调用堆栈信息
 */
function getCallerInfo() {
  const stack = new Error().stack.split('\n')
  // 跳过前几行（Error、getCallerInfo、log方法）
  const callerLine = stack[3] || ''
  const match = callerLine.match(/at\s+(.+)\s+\((.+):(\d+):(\d+)\)/)
  if (match) {
    return {
      function: match[1].trim(),
      file: path.basename(match[2]),
      line: match[3]
    }
  }
  return { function: 'unknown', file: 'unknown', line: '0' }
}

/**
 * 写入日志文件
 */
function writeToFile(level, message, meta = {}) {
  if (process.env.NODE_ENV !== 'production') return
  
  const logFile = path.join(LOG_DIR, `${new Date().toISOString().split('T')[0]}.log`)
  const logEntry = JSON.stringify({
    time: formatTime(new Date()),
    level,
    message,
    ...meta
  }) + '\n'
  
  fs.appendFileSync(logFile, logEntry)
}

/**
 * 创建日志方法
 */
function createLogMethod(level, levelName) {
  return function(message, meta = {}) {
    if (level < currentLevel) return
    
    const time = formatTime(new Date())
    const caller = getCallerInfo()
    const color = COLORS[levelName]
    const reset = COLORS.RESET
    
    // 控制台输出
    const prefix = `[${time}] [${levelName}] [${caller.file}:${caller.line}]`
    console.log(`${color}${prefix}${reset} ${message}`)
    
    // 如果有额外信息，输出
    if (Object.keys(meta).length > 0) {
      console.log(meta)
    }
    
    // 写入文件
    writeToFile(levelName, message, { ...meta, ...caller })
  }
}

const logger = {
  debug: createLogMethod(LOG_LEVELS.DEBUG, 'DEBUG'),
  info: createLogMethod(LOG_LEVELS.INFO, 'INFO'),
  warn: createLogMethod(LOG_LEVELS.WARN, 'WARN'),
  error: createLogMethod(LOG_LEVELS.ERROR, 'ERROR'),
  
  /**
   * 记录HTTP请求
   */
  request(req, res, responseTime) {
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    }
    
    if (res.statusCode >= 400) {
      this.warn(`HTTP ${req.method} ${req.path} - ${res.statusCode}`, logData)
    } else {
      this.info(`HTTP ${req.method} ${req.path} - ${res.statusCode}`, logData)
    }
  }
}

module.exports = logger
