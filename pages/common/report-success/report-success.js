Page({
  data: {
    theme: 'light',
    appVersion: 'standard'
  },

  onLoad(options) {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
  },

  onShow() {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
  },

  goHome() {
    wx.switchTab({
      url: '/pages/home/index/index'
    })
  }
})