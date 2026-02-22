const jwt = require('jsonwebtoken')
const { getWechatUserInfo } = require('../services/wechatService')
const userModel = require('../models/user')

/**
 * 登录控制器 - 处理微信小程序登录流程
 * 原因：集中处理登录的业务逻辑，包括微信验证、数据库查询、token生成等
 * 功能：实现完整的 code → openid → token 的登录链路
 */

/**
 * 微信小程序登录
 * 流程：
 * 1. 小程序前端通过 wx.login() 获取 code
 * 2. 前端发送 code + userInfo 到后端
 * 3. 后端用 code 换取 openid（调用微信 code2Session）
 * 4. 查询数据库中是否存在该用户
 * 5. 不存在则创建新用户
 * 6. 生成 accessToken 和 refreshToken
 * 7. 返回用户信息和 tokens
 */
async function login(req, res) {
  try {
    const { code, userInfo } = req.body

    // 1️⃣ 验证请求参数
    if (!code || !userInfo) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数：code 或 userInfo'
      })
    }

    console.log(`[Login] 收到登录请求，code: ${code.substring(0, 10)}...`)

    // 2️⃣ 调用微信服务交换 openid
    let wechatData
    try {
      wechatData = await getWechatUserInfo(code)
    } catch (wechatError) {
      console.error('[Login] 微信验证失败:', wechatError.message)
      return res.status(401).json({
        code: 401,
        message: '微信登录失败，请检查登录码是否有效'
      })
    }

    const { openid } = wechatData
    const { nickName, avatarUrl, gender, province, city, country } = userInfo

    // 3️⃣ 查询或创建用户
    let user = await userModel.findUserByOpenid(openid)

    if (!user) {
      // 首次登录，创建新用户
      const userId = await userModel.createUser({
        openid,
        nickname: nickName || '微信用户',
        avatar_url: avatarUrl || null,
        gender: gender || 0,
        province: province || null,
        city: city || null,
        country: country || null
      })

      // 重新查询获取完整的用户信息
      user = await userModel.findUserByOpenid(openid)
      console.log(`[Login] 创建新用户成功: id=${userId}`)
    } else {
      console.log(`[Login] 用户已存在: id=${user.id}`)
    }

    // 4️⃣ 生成 JWT tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        openid: user.openid,
        nickname: user.nickname,
        type: 'access'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '1h' }
    )

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        openid: user.openid,
        type: 'refresh'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '30d' }
    )

    console.log(`[Login] tokens 生成成功: userId=${user.id}`)

    // 5️⃣ 返回响应
    res.status(200).json({
      code: 0,
      data: {
        accessToken,
        refreshToken,
        userInfo: {
          id: user.id,
          nickName: user.nickname,
          avatarUrl: user.avatar_url,
          gender: user.gender,
          province: user.province,
          city: user.city,
          country: user.country,
          identity: user.identity, // 首次登录为 null，用户需选择身份
          createdAt: user.created_at
        }
      }
    })
  } catch (error) {
    console.error('[Login] 服务器错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    })
  }
}

/**
 * 刷新 accessToken
 * 原因：accessToken 有效期短（1小时），过期后需要用 refreshToken 重新获取
 * 功能：验证 refreshToken，生成新的 accessToken
 */
async function refreshAccessToken(req, res) {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({
        code: 400,
        message: '缺少 refreshToken'
      })
    }

    // 验证 refreshToken
    let decoded
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)
    } catch (error) {
      return res.status(401).json({
        code: 401,
        message: '刷新令牌无效或已过期'
      })
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        code: 401,
        message: '令牌类型错误'
      })
    }

    // 生成新的 accessToken
    const newAccessToken = jwt.sign(
      {
        userId: decoded.userId,
        openid: decoded.openid,
        type: 'access'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '1h' }
    )

    console.log(`[Refresh] 刷新 token 成功: userId=${decoded.userId}`)

    res.status(200).json({
      code: 0,
      data: {
        accessToken: newAccessToken
      }
    })
  } catch (error) {
    console.error('[Refresh] 服务器错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    })
  }
}

module.exports = {
  login,
  refreshAccessToken
}
