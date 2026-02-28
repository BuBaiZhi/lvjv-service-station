// app.js - 应用入口
const themeService = require('./services/themeService.js')
const authModel = require('./models/authModel')

App({
  async onLaunch() {
    // 初始化云开发
    wx.cloud.init({
      env: 'cloud1-5gtcvd31d726486e',
      traceUser: true
    })

    // 初始化认证状态
    await authModel.init()
    
    // 初始化主题和版本
    const settings = themeService.getThemeSettings()
    this.globalData.theme = settings.theme
    this.globalData.elderMode = settings.elderMode
  },

  globalData: {
    userInfo: null,
    theme: 'light',
    elderMode: false,
    appVersion: 'standard',
    accessToken: null,
    refreshToken: null,
    // API 配置
    api: {
      baseURL: 'http://localhost:3000'
    },
    // 认证状态统一管理
    getAuthState: () => authModel.getAuthState(),
    getCurrentUser: () => authModel.getCurrentUser(),
    hasPermission: (permission) => authModel.hasPermission(permission)
  },
  
  // 便捷的认证方法
  async loginWithCode(code) {
    return await authModel.loginWithCode(code)
  },
  
  async loginAsGuest() {
    return await authModel.loginAsGuest()
  },
  
  async logout() {
    return await authModel.logout()
  },
  
  // 设置主题
  setTheme(theme) {
    this.globalData.theme = theme
    
    // 同步保存到 themeService
    const settings = themeService.getThemeSettings()
    settings.theme = theme
    themeService.saveThemeSettings(settings)
    
    // 设置页面根元素的类名
    if (typeof this.pageClasses !== 'undefined') {
      this.pageClasses = this.pageClasses.replace(/\s*dark\s*/g, '').replace(/\s*light\s*/g, '')
    }
    
    // 通知所有页面更新
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (page.setData) {
        page.setData({ theme })
      }
    })
  },
  
  // 设置老人模式
  setElderMode(elderMode) {
    this.globalData.elderMode = elderMode
    
    // 同步保存到 themeService
    const settings = themeService.getThemeSettings()
    settings.elderMode = elderMode
    themeService.saveThemeSettings(settings)
    
    // 通知所有页面更新
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (page.setData) {
        page.setData({ elderMode })
      }
    })
  }
})
