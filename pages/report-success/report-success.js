Page({
  data: {
    reason: '',
    detail: ''
  },

  onLoad(options) {
    this.setData({
      reason: options.reason || '',
      detail: options.detail || ''
    })
  },

  goBack() {
    wx.navigateBack()
  },

  viewReportStatus() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  }
})