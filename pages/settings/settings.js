const themeService = require('../../services/themeService.js')

Page({
  data: {
    theme: 'light',
    elderMode: false
  },

  onLoad() {
    const app = getApp()
    const settings = themeService.getThemeSettings()
    this.setData({
      theme: settings.theme,
      elderMode: settings.elderMode
    })
  },

  onShow() {
    const settings = themeService.getThemeSettings()
    this.setData({
      theme: settings.theme,
      elderMode: settings.elderMode
    })
  },

  toggleTheme() {
    const settings = themeService.toggleTheme()
    this.setData({ theme: settings.theme })
    
    // 更新全局变量
    const app = getApp()
    app.globalData.theme = settings.theme
    
    // 通知所有页面更新
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (page.setData) {
        page.setData({ theme: settings.theme })
      }
    })
    
    wx.showToast({
      title: settings.theme === 'light' ? '日间模式' : '夜间模式',
      icon: 'none'
    })
  },

  toggleElderMode() {
    const settings = themeService.toggleElderMode()
    this.setData({ elderMode: settings.elderMode })
    
    // 更新全局变量
    const app = getApp()
    app.globalData.elderMode = settings.elderMode
    
    // 通知所有页面更新
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (page.setData) {
        page.setData({ elderMode: settings.elderMode })
      }
    })
    
    wx.showToast({
      title: settings.elderMode ? '老人模式已开启' : '老人模式已关闭',
      icon: 'none'
    })
  },

  clearCache() {
    wx.showModal({
      title: '提示',
      content: '确定清除所有缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.showToast({ title: '缓存已清除', icon: 'success' })
        }
      }
    })
  },

  about() {
    wx.showModal({
      title: '关于我们',
      content: '数字游民旅居服务站 v1.0.0\n\n一个连接乡村与数字游民的平台',
      showCancel: false
    })
  },

  feedback() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  goBack() {
    wx.navigateBack()
  }
})