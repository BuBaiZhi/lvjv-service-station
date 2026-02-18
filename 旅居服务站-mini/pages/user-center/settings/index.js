// 设置页面
const app = getApp()

Page({
  data: {
    theme: 'light',
    appVersion: 'standard'
  },

  onLoad() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
  },

  // 切换主题
  switchTheme(e) {
    const theme = e.currentTarget.dataset.theme
    app.switchTheme(theme)
    this.setData({ theme })
    
    wx.showToast({
      title: theme === 'dark' ? '已切换到深色模式' : '已切换到浅色模式',
      icon: 'success'
    })
  },

  // 切换应用版本
  switchAppVersion(e) {
    const version = e.currentTarget.dataset.version
    app.switchAppVersion(version)
    this.setData({ appVersion: version })
    
    wx.showToast({
      title: version === 'elderly' ? '已切换到老人版' : '已切换到标准版',
      icon: 'success'
    })
  },

  // 跳转到编辑资料
  goToEditProfile() {
    wx.navigateTo({
      url: '/pages/user-center/edit-profile/index'
    })
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage({
            success: () => {
              wx.showToast({
                title: '清除成功',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  },

  // 关于我们
  aboutUs() {
    wx.showModal({
      title: '关于旅居服务站',
      content: '旅居服务站 v1.0.0\n\n为乡村数字游民提供一站式服务平台',
      showCancel: false
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})