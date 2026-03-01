const themeService = require('../../../services/themeService.js')
const draftService = require('../../../services/draftService.js')
const nav = require('../../../utils/navigation.js')
const authModel = require('../../../models/authModel.js')

Page({
  data: {
    theme: 'light',
    elderMode: false,
    isGuest: false,
    userInfo: {
      name: '田园旅人',
      avatar: 'https://picsum.photos/120/120?random=1',
      role: '村民',
      postCount: 12,
      followerCount: 48,
      followingCount: 23,
      joinTime: '2024年春'
    },
    draftCount: 0
  },

  async onLoad() {
    // 先尝试初始化认证状态（防止 app.js 的 init 还没完成）
    const authMode = wx.getStorageSync('authMode')
    const accessToken = wx.getStorageSync('accessToken')
    
    console.log('[Profile] authMode:', authMode, 'accessToken:', !!accessToken)
    
    // 如果没有登录信息，跳转到登录页
    if (!authMode || authMode === 'unauthenticated') {
      console.log('[Profile] 用户未登录，跳转到登录页')
      // TabBar 页面使用 reLaunch 跳转
      wx.reLaunch({ url: nav.routes.AUTH.LOGIN })
      return
    }
    
    // 如果是用户模式但没有 token，也需要重新登录
    if (authMode === 'user' && !accessToken) {
      console.log('[Profile] Token 缺失，跳转到登录页')
      wx.reLaunch({ url: nav.routes.AUTH.LOGIN })
      return
    }
    
    // 获取主题设置
    const app = getApp()
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false,
      isGuest: authMode === 'guest'
    })
    
    // 加载用户信息
    await this.loadUserInfo()
  },

  onShow() {
    // 每次显示页面时检查登录状态
    const authMode = wx.getStorageSync('authMode')
    if (!authMode || authMode === 'unauthenticated') {
      console.log('[Profile] onShow: 用户未登录，跳转到登录页')
      wx.reLaunch({ url: nav.routes.AUTH.LOGIN })
      return
    }
    
    // 更新主题（防止从设置页返回时没更新）
    const app = getApp()
    this.setData({
      theme: app.globalData.theme,
      elderMode: app.globalData.elderMode
    })
    
    // 加载草稿数量
    this.loadDraftCount()
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      // 从认证模型获取用户信息
      const userInfo = await authModel.getCurrentUser()
      if (userInfo) {
        this.setData({
          userInfo: {
            ...this.data.userInfo,
            ...userInfo
          }
        })
      }
    } catch (error) {
      console.error('Failed to load user info:', error)
      // 使用默认数据
    }
  },

  // 加载草稿数量
  async loadDraftCount() {
    try {
      const drafts = await draftService.getUserDrafts()
      this.setData({ draftCount: drafts ? drafts.length : 0 })
    } catch (error) {
      console.error('加载草稿数量失败:', error)
    }
  },

  // 跳转到设置页
  goToSettings() {
    wx.navigateTo({ url: nav.routes.USER.SETTINGS })
  },

  // 我的发布
  goToMyPosts() {
    wx.navigateTo({ url: nav.routes.USER.PUBLISH_LIST })
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
    wx.navigateTo({ url: nav.routes.USER.DRAFTS })
  },

  // 浏览历史（互动记录）
  goToHistory() {
    wx.navigateTo({ url: nav.routes.USER.HISTORY })
  },

  // 我的交易
  goToOrders() {
    wx.navigateTo({ url: nav.routes.USER.ORDERS })
  },

  // 服务与支持
  goToSupport() {
    wx.navigateTo({ url: nav.routes.USER.SUPPORT })
  },

  // 退出登录
  async onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.logout()
            wx.showToast({
              title: '已退出',
              icon: 'success'
            })
            
            // 跳转到登录页
            wx.redirectTo({
              url: nav.routes.AUTH.LOGIN
            })
          } catch (error) {
            console.error('Logout failed:', error)
            wx.showToast({
              title: '退出失败',
              icon: 'error'
            })
          }
        }
      }
    })
  }
})