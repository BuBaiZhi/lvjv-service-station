// models/authModel.js
/**
 * 统一身份模型
 * authState: 'unauthenticated' | 'guest' | 'user'
 * userRole: 'villager' | 'traveler' | 'admin'
 * authSource: 'cloud' | 'http' (权威身份来源)
 */
class AuthModel {
  constructor() {
    this.state = 'unauthenticated' // 默认未认证
    this.user = null
    this.token = null
    this.openid = null
    this.authSource = null // 权威身份来源
  }

  // 初始化认证状态
  async init() {
    // 兼容两种 key 命名方式
    const token = wx.getStorageSync('accessToken') || wx.getStorageSync('access_token')
    const authMode = wx.getStorageSync('authMode')
    
    // 如果 authMode 存在，直接恢复状态
    if (authMode === 'user' && token) {
      this.state = 'user'
      this.token = token
      this.authSource = 'local'
      // 尝试获取用户信息
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        try {
          this.user = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo
        } catch (e) {
          this.user = userInfo
        }
      }
      console.log('[AuthModel] 从本地恢复认证状态: user')
      return
    }
    
    // 优先从HTTP后端恢复认证状态
    if (token) {
      try {
        const userInfo = await this.validateHttpToken(token)
        if (userInfo) {
          this.state = 'user'
          this.user = userInfo
          this.token = token
          this.authSource = 'http'
          return
        }
      } catch (error) {
        console.log('HTTP token validation failed, trying cloud...')
      }
    }

    // 备选：从云开发恢复
    try {
      const openid = wx.getStorageSync('cloud_openid')
      if (openid) {
        const cloudUser = await this.validateCloudIdentity(openid)
        if (cloudUser) {
          this.state = 'user'
          this.user = cloudUser
          this.openid = openid
          this.authSource = 'cloud'
          return
        }
      }
    } catch (error) {
      console.log('Cloud identity validation failed')
    }

    // 最终：检查游客模式
    const isGuest = wx.getStorageSync('is_guest') || authMode === 'guest'
    if (isGuest) {
      this.state = 'guest'
      this.authSource = 'local'
    }
  }

  // HTTP方式登录
  async loginWithCode(code) {
    try {
      // 1. 通过HTTP后端获取token
      const result = await require('../services/httpService').login(code)
      
      // 2. 设置认证状态
      this.state = 'user'
      this.user = result.user
      this.token = result.token
      this.authSource = 'http'
      
      // 3. 持久化存储
      wx.setStorageSync('access_token', result.token)
      wx.setStorageSync('user_info', result.user)
      
      return result
    } catch (error) {
      throw error
    }
  }

  // 游客模式
  async loginAsGuest() {
    this.state = 'guest'
    this.authSource = 'local'
    wx.setStorageSync('is_guest', true)
    
    // 生成临时用户信息
    this.user = {
      id: 'guest_' + Date.now(),
      nickname: '游客',
      avatar: 'https://example.com/guest-avatar.png',
      role: 'guest'
    }
  }

  // 登出
  async logout() {
    // 清理所有认证信息（兼容两种 key）
    wx.removeStorageSync('authMode')
    wx.removeStorageSync('accessToken')
    wx.removeStorageSync('refreshToken')
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('access_token')
    wx.removeStorageSync('refresh_token')
    wx.removeStorageSync('user_info')
    wx.removeStorageSync('is_guest')
    
    // 重置状态
    this.state = 'unauthenticated'
    this.user = null
    this.token = null
    this.openid = null
    this.authSource = null
  }

  // 验证HTTP token
  async validateHttpToken(token) {
    try {
      const httpService = require('../services/httpService')
      return await httpService.getUserInfo(token)
    } catch (error) {
      return null
    }
  }

  // 验证云开发身份
  async validateCloudIdentity(openid) {
    try {
      const cloudService = require('../services/cloudService')
      return await cloudService.getCurrentUser()
    } catch (error) {
      return null
    }
  }

  // 检查权限
  hasPermission(permission) {
    if (this.state === 'unauthenticated') return false
    
    // 根据角色和权限判断
    if (this.user?.role === 'admin') return true
    if (permission === 'read' && this.state !== 'unauthenticated') return true
    
    return false
  }

  // 获取当前用户信息
  getCurrentUser() {
    return this.user
  }

  // 获取认证状态
  getAuthState() {
    return this.state
  }

  // 获取权威身份来源
  getAuthSource() {
    return this.authSource
  }
}

// 全局实例
const authInstance = new AuthModel()
module.exports = authInstance