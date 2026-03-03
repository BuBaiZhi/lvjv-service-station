// 设置页面
const app = getApp()
const nav = require('../../../utils/navigation.js')

Page({
  data: {
    theme: 'light',
    elderMode: false
  },

  onLoad() {
    this.setData({
      theme: app.globalData.theme,
      elderMode: app.globalData.elderMode
    })
  },

  onShow() {
    this.setData({
      theme: app.globalData.theme,
      elderMode: app.globalData.elderMode
    })
  },

  // 切换主题
  switchTheme(e) {
    const theme = e.currentTarget.dataset.theme
    app.setTheme(theme)
    this.setData({ theme })
    
    wx.showToast({
      title: theme === 'dark' ? '已切换到深色模式' : '已切换到浅色模式',
      icon: 'success'
    })
  },

  // 切换老人模式
  switchElderMode(e) {
    const elderMode = e.currentTarget.dataset.elderMode === true || e.currentTarget.dataset.elderMode === 'true'
    app.setElderMode(elderMode)
    this.setData({ elderMode })
    
    wx.showToast({
      title: elderMode ? '已切换到老人版' : '已切换到标准版',
      icon: 'success'
    })
  },

  // 跳转到编辑资料
  goToEditProfile() {
    wx.navigateTo({ url: nav.routes.USER.EDIT_PROFILE })
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