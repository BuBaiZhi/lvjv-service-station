const jwt = require('jsonwebtoken')

/**
 * JWT 验证中间件
 * 原因：保护需要认证的接口，验证请求中的 token 是否有效
 * 功能：从 Authorization 头提取 token，验证并解码，将用户信息传递给下一个中间件
 */

/**
 * 验证 accessToken 中间件
 * 用于需要认证的接口（如获取用户信息、发布内容等）
 */
function verifyAccessToken(req, res, next) {
  try {
    // 从 Authorization 头获取 token
    // 格式: "Bearer eyJhbGc..."
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({
        code: 401,
        message: '缺少认证令牌'
      })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '无效的认证令牌格式'
      })
    }

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: '令牌已过期，请刷新'
      })
    }
    return res.status(401).json({
      code: 401,
      message: '无效的认证令牌'
    })
  }
}

module.exports = {
  verifyAccessToken
}
