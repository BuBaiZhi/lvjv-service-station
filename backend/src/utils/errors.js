/**
 * 自定义错误类
 * 用于创建标准化的错误响应
 */

class AppError extends Error {
  constructor(message, code = 500, statusCode = 500) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.isOperational = true // 标识可预期的错误
    Error.captureStackTrace(this, this.constructor)
  }
}

// 400 错误 - 请求参数错误
class BadRequestError extends AppError {
  constructor(message = '请求参数错误') {
    super(message, 400, 400)
  }
}

// 401 错误 - 未认证
class UnauthorizedError extends AppError {
  constructor(message = '请先登录') {
    super(message, 401, 401)
  }
}

// 403 错误 - 无权限
class ForbiddenError extends AppError {
  constructor(message = '没有权限执行此操作') {
    super(message, 403, 403)
  }
}

// 404 错误 - 资源不存在
class NotFoundError extends AppError {
  constructor(message = '请求的资源不存在') {
    super(message, 404, 404)
  }
}

// 409 错误 - 资源冲突
class ConflictError extends AppError {
  constructor(message = '资源已存在') {
    super(message, 409, 409)
  }
}

// 422 错误 - 业务逻辑错误
class BusinessError extends AppError {
  constructor(message = '操作失败') {
    super(message, 422, 422)
  }
}

// 429 错误 - 请求过于频繁
class TooManyRequestsError extends AppError {
  constructor(message = '请求过于频繁，请稍后再试') {
    super(message, 429, 429)
  }
}

// 500 错误 - 服务器内部错误
class InternalServerError extends AppError {
  constructor(message = '服务器内部错误') {
    super(message, 500, 500)
  }
}

// 503 错误 - 服务不可用
class ServiceUnavailableError extends AppError {
  constructor(message = '服务暂时不可用') {
    super(message, 503, 503)
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  BusinessError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError
}
