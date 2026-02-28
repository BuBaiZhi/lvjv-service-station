/**
 * 认证服务
 * services/auth.js
 * 专门处理小程序登录业务逻辑
 */

const { request } = require('./http')

/**
 * 🌟 微信登录
 * 标准流程：wx.login() → wx.getUserProfile() → 后端认证
 */
async function loginWithWeChat(code, userInfo) {
  try {
    if (!code) {
      throw new Error('获取登录码失败，请重试')
    }

    if (!userInfo) {
      throw new Error('获取用户信息失败，请授权')
    }

    console.log('[Auth] 调用后端登录接口...')

    // 调用后端 API
    const response = await request('/api/auth/login', {
      method: 'POST',
      data: {
        code,
        userInfo
      }
    })

    // 后端返回格式: { code: 0, data: { accessToken, refreshToken, userInfo } }
    if (!response || response.code !== 0) {
      throw new Error(response?.message || '登录失败')
    }

    const result = response.data
    
    // 保存认证信息
    saveAuthInfo(result)

    console.log('[Auth] 微信登录成功')
    return result
  } catch (error) {
    console.error('[Auth] 微信登录失败:', error)
    throw error
  }
}

/**
 * 手机号登录
 * （此功能需要后端支持短信验证码流程）
 */
async function loginWithPhone() {
  try {
    // TODO: 实现手机号登录流程
    // 1. 获取用户输入的手机号
    // 2. 发送验证码
    // 3. 验证码验证
    // 4. 调用后端 API 登录

    throw new Error('手机号登录功能开发中...')
  } catch (error) {
    console.error('[Auth] 手机登录失败:', error)
    throw error
  }
}

/**
 * 验证 Token 有效性
 */
async function verifyToken() {
  try {
    const result = await request('/api/auth/verify', {
      method: 'GET'
    })

    return result
  } catch (error) {
    console.error('[Auth] Token 验证失败:', error)
    throw error
  }
}

/**
 * 登出
 */
async function logout() {
  try {
    // 调用后端登出接口（可选）
    await request('/api/auth/logout', {
      method: 'POST'
    }).catch(() => {
      // 忽略错误，继续清理本地状态
    })

    // 清理本地认证信息
    clearAuth()
  } catch (error) {
    console.error('[Auth] 登出失败:', error)
    throw error
  }
}

/**
 * 🌟 保存认证信息
 * 包括双 Token 模式
 * 
 * 功能：
 * - 将 accessToken 和 refreshToken 保存到 storage （持久化）
 * - 将用户信息保存到 globalData （内存旧一次空）
 * - 有效旧一次闲置时，下次启动时从 storage 中恢复
 */
function saveAuthInfo(result) {
  const app = getApp()
  
  const {
    accessToken,
    refreshToken,
    expiresIn,
    userInfo
  } = result

  if (!accessToken || !refreshToken) {
    throw new Error('服务器返回的 token 信息不完整')
  }

  try {
    // 保存到本地存储
    wx.setStorageSync('accessToken', accessToken)
    wx.setStorageSync('refreshToken', refreshToken)
    wx.setStorageSync('userInfo', JSON.stringify(userInfo))

    // 保存到全局状态
    app.globalData.accessToken = accessToken
    app.globalData.refreshToken = refreshToken
    app.globalData.userInfo = userInfo
    app.globalData.isLogin = true
    app.globalData.isGuest = false

    console.log('[Auth] 认证信息保存成功')
  } catch (error) {
    console.error('[Auth] 保存认证信息失败:', error)
    throw error
  }
}

/**
 * 🌟 清理认证信息
 * 
 * 功能：用户登出时，清理所有的认证状态
 */
function clearAuth() {
  const app = getApp()
  
  try {
    // 清理全局状态
    app.globalData.accessToken = null
    app.globalData.refreshToken = null
    app.globalData.userInfo = null
    app.globalData.isLogin = false
    app.globalData.isGuest = false

    // 清理本地存傧
    wx.removeStorageSync('accessToken')
    wx.removeStorageSync('refreshToken')
    wx.removeStorageSync('userInfo')

    console.log('[Auth] 认证信息已清理')
  } catch (error) {
    console.error('[Auth] 清理认证信息失败:', error)
  }
}

/**
 * 检查是否已登录
 */
function isLoggedIn() {
  const accessToken = wx.getStorageSync('accessToken')
  return !!accessToken
}

/**
 * 检查是否为游客
 */
function isGuest() {
  const authMode = wx.getStorageSync('authMode')
  return authMode === 'guest'
}

/**
 * 获取当前 accessToken
 */
function getAccessToken() {
  return wx.getStorageSync('accessToken')
}

/**
 * 获取当前 refreshToken
 */
function getRefreshToken() {
  return wx.getStorageSync('refreshToken')
}

/**
 * 获取当前用户信息
 */
function getUserInfo() {
  const userInfoStr = wx.getStorageSync('userInfo')
  if (userInfoStr) {
    try {
      return JSON.parse(userInfoStr)
    } catch (e) {
      return null
    }
  }
  return null
}

// 导出所有认证方法
module.exports = {
  loginWithWeChat,
  loginWithPhone,
  verifyToken,
  logout,
  saveAuthInfo,
  clearAuth,
  isLoggedIn,
  isGuest,
  getAccessToken,
  getRefreshToken,
  getUserInfo
}
