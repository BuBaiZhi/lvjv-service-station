const themeService = require('./services/themeService.js')

App({
  onLaunch() {
    // 初始化云开发
    wx.cloud.init({
      env: 'cloud1-9g8d2qsuf2481170',
      traceUser: true
    })

    // 初始化主题
    const settings = themeService.getThemeSettings()
    this.globalData.theme = settings.theme
    this.globalData.elderMode = settings.elderMode
    
    console.log('小程序启动，主题:', settings)
  },

  globalData: {
    userInfo: null,
    theme: 'light',
    elderMode: false
  }
})