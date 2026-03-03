// utils/themeUtil.js
class ThemeManager {
  constructor() {
    this.currentTheme = 'light'
    this.currentMode = 'standard' // standard | elderly
  }

  // 获取当前主题设置
  getCurrentSettings() {
    return {
      theme: wx.getStorageSync('theme') || 'light',
      mode: wx.getStorageSync('appVersion') || 'standard'
    }
  }

  // 设置主题
  setTheme(theme) {
    this.currentTheme = theme
    wx.setStorageSync('theme', theme)
    this.applyThemeToAllPages(theme, this.currentMode)
  }

  // 设置模式（老人模式等）
  setMode(mode) {
    this.currentMode = mode
    wx.setStorageSync('appVersion', mode)
    this.applyThemeToAllPages(this.currentTheme, mode)
  }

  // 应用主题到所有页面
  applyThemeToAllPages(theme, mode) {
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (page.setData) {
        page.setData({
          theme,
          appVersion: mode,
          elderlyMode: mode === 'elderly'
        })
      }
    })
  }

  // 获取当前主题类名
  getThemeClass() {
    const settings = this.getCurrentSettings()
    const classes = ['page']
    
    if (settings.theme) {
      classes.push(settings.theme)
    }
    
    if (settings.mode === 'elderly') {
      classes.push('elderly')
    }
    
    return classes.join(' ')
  }

  // 初始化主题
  init() {
    const settings = this.getCurrentSettings()
    this.currentTheme = settings.theme
    this.currentMode = settings.mode
  }
}

const themeManager = new ThemeManager()
module.exports = themeManager