// app.js - 应用入口
const auth = require('./services/auth')  // 🌟 认证服务
const { request } = require('./services/http')  // 🌟 HTTP 拦截器

App({
  onLaunch() {
    console.log('旅居服务站小程序启动')
    
    // 初始化认证状态
    this.initAuth()
    
    // 初始化主题和版本
    this.initTheme()
  },

  // 全局数据
  globalData: {
    // 🌟 统一认证模式: 'user'=正式用户, 'guest'=游客, null=未登录
    authMode: null,
    
    // 保留旧字段兼容
    accessToken: null,
    refreshToken: null,
    userInfo: null,
    isLogin: false,
    isGuest: false,
    
    // 主题相关
    theme: 'light',
    appVersion: 'standard'
  },

  // API 配置
  api: {
    baseURL: 'http://localhost:3000'  // 后端地址（开发环境：localhost:3000，生产环境：替换为真实服务器地址）
  },

  /**
   * 🌟 初始化认证状态
   * 使用统一的 authMode 字段：'user' | 'guest' | null
   */
  initAuth() {
    // 读取统一认证模式
    const authMode = wx.getStorageSync('authMode')
    
    if (authMode === 'user') {
      // 正式用户模式
      const accessToken = wx.getStorageSync('accessToken')
      const refreshToken = wx.getStorageSync('refreshToken')
      const userInfoStr = wx.getStorageSync('userInfo')
      
      if (accessToken && refreshToken) {
        try {
          this.globalData.authMode = 'user'
          this.globalData.accessToken = accessToken
          this.globalData.refreshToken = refreshToken
          this.globalData.userInfo = userInfoStr ? JSON.parse(userInfoStr) : null
          this.globalData.isLogin = true
          this.globalData.isGuest = false
          
          console.log('[App] 用户认证状态已恢复')
        } catch (error) {
          console.error('[App] 认证初始化失败:', error)
          this.clearAuth()
        }
      } else {
        // token 缺失，认为登录已过期
        console.warn('[App] token 缺失，清理认证状态')
        this.clearAuth()
      }
    } else if (authMode === 'guest') {
      this.globalData.authMode = 'guest'
      this.globalData.isGuest = true
      this.globalData.isLogin = false
      console.log('[App] 游客模式已恢复')
    } else {
      // 未登录
      this.globalData.authMode = null
      console.log('[App] 未登录状态')
    }
  },

  /**
   * 验证 Token 有效性（可选）
   */
  verifyToken() {
    auth.verifyToken()
      .catch(() => {
        // token 无效，清理
        auth.clearAuth()
      })
  },

  /**
   * 初始化主题和版本
   */
  initTheme() {
    const theme = wx.getStorageSync('theme') || 'light'
    const appVersion = wx.getStorageSync('appVersion') || 'standard'
    
    this.globalData.theme = theme
    this.globalData.appVersion = appVersion
    
    console.log(`[App] 主题: ${theme}, 版本: ${appVersion}`)
  },

  /**
   * 设置主题
   */
  setTheme(theme) {
    this.globalData.theme = theme
    wx.setStorageSync('theme', theme)
    
    // 通知所有页面更新
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (page.setData) {
        page.setData({ theme })
      }
    })
    
    console.log(`[App] 主题已切换: ${theme}`)
  },

  /**
   * 设置应用版本（老人版）
   */
  setAppVersion(version) {
    this.globalData.appVersion = version
    wx.setStorageSync('appVersion', version)
    
    // 通知所有页面更新
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (page.setData) {
        page.setData({ appVersion: version })
      }
    })
    
    console.log(`[App] 应用版本已切换: ${version}`)
  },

  /**
   * 登出
   */
  async logout() {
    try {
      await auth.logout()
      
      // 跳转登录页
      wx.redirectTo({
        url: '/pages/login/index'
      })
    } catch (error) {
      console.error('[App] 登出失败:', error)
      auth.clearAuth()
    }
  },

  /**
   * 获取当前用户信息
   */
  getUserInfo() {
    return this.globalData.userInfo
  },

  /**
   * 检查认证状态（统一入口）
   * @returns {boolean} true=已认证(用户或游客), false=未登录
   */
  isAuthenticated() {
    return this.globalData.authMode === 'user' || this.globalData.authMode === 'guest'
  },

  /**
   * 检查是否已登录（正式用户）
   */
  isLoggedIn() {
    return this.globalData.authMode === 'user' && !!this.globalData.accessToken
  },

  /**
   * 检查是否为游客
   */
  isGuest() {
    return this.globalData.authMode === 'guest'
  },

  /**
   * 🌟 清除认证状态
   */
  clearAuth() {
    this.globalData.authMode = null
    this.globalData.accessToken = null
    this.globalData.refreshToken = null
    this.globalData.userInfo = null
    this.globalData.isLogin = false
    this.globalData.isGuest = false
    
    wx.removeStorageSync('authMode')
    wx.removeStorageSync('accessToken')
    wx.removeStorageSync('refreshToken')
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('isGuest')
    
    console.log('[App] 认证状态已清除')
  }
})
