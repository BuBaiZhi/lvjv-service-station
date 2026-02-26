const themeService = require('../../services/themeService.js')

Page({
  data: {
    theme: 'light',
    elderMode: false,
    userInfo: {
      name: '田园旅人',
      avatar: 'https://picsum.photos/120/120?random=1',
      role: '村民',
      postCount: 12,
      followerCount: 48,
      followingCount: 23,
      joinTime: '2024年春'
    },
    draftCount: 3
  },

  onLoad() {
    // 获取主题设置
    const app = getApp()
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false
    })
    
    // 加载用户信息
    this.loadUserInfo()
  },

  onShow() {
    // 每次显示页面时更新主题（防止从设置页返回时没更新）
    const app = getApp()
    this.setData({
      theme: app.globalData.theme,
      elderMode: app.globalData.elderMode
    })
    
    // 加载草稿数量
    this.loadDraftCount()
  },

  // 加载用户信息
  loadUserInfo() {
    // TODO: 从云数据库获取真实用户信息
    // 这里先用模拟数据
  },

  // 加载草稿数量
  loadDraftCount() {
    // TODO: 从草稿服务获取数量
    // 这里先用模拟数据
  },

  // 跳转到设置页
  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  // 我的发布
  goToMyPosts() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 我的收藏
  goToFavorites() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 草稿箱
  goToDrafts() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 浏览历史
  goToHistory() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '已退出',
            icon: 'success'
          })
          // TODO: 清除登录状态
        }
      }
    })
  }
})