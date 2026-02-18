// app.js - 应用入口
App({
  onLaunch() {
    // 小程序启动时执行
    console.log('旅居服务站小程序启动')
  },

  // 全局数据
  globalData: {
    userInfo: null,
    theme: 'light',        // 主题：light/dark
    appVersion: 'standard'  // 版本：standard/elderly
  },

  // 主题切换
  setTheme(theme) {
    this.globalData.theme = theme
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (page.onThemeChange) {
        page.onThemeChange(theme)
      }
    })
  },

  // 应用版本切换（老人版）
  setAppVersion(version) {
    this.globalData.appVersion = version
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (page.onAppVersionChange) {
        page.onAppVersionChange(version)
      }
    })
  }
})
