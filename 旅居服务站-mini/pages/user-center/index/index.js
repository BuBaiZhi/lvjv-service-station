// 用户中心首页
const app = getApp()

Page({
  data: {
    theme: 'light',
    appVersion: 'standard',
    isLoggedIn: false,  // 是否已登录
    backgroundType: 'gradient',
    userInfo: null,    // 默认 null，登录后加载
    stats: {
      postCount: 0,
      commentCount: 0,
      likeCount: 0
    },
    menuList: [
      {
        id: 2,
        icon: '💰',
        title: '我的交易',
        path: '/pages/user-center/order-list/index'
      },
      {
        id: 3,
        icon: '📢',
        title: '我的发布',
        path: '/pages/user-center/publish-list/index'
      },
      {
        id: 4,
        icon: '🕐',
        title: '浏览历史',
        path: '/pages/user-center/history-list/index'
      },
      {
        id: 5,
        icon: '💬',
        title: '服务与支持',
        path: '/pages/user-center/service-support/index'
      },
      {
        id: 6,
        icon: '⚙️',
        title: '设置',
        path: '/pages/user-center/settings/index'
      }
    ]
  },

  onLoad() {
    console.log('[UserCenter] onLoad 执行')
    this.syncTheme()
    this.checkAuth()
  },

  onShow() {
    console.log('[UserCenter] onShow 执行')
    this.syncTheme()
    this.checkAuth()
  },

  // 同步主题
  syncTheme() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
  },

  // 检查认证状态
  checkAuth() {
    // 直接获取认证状态
    const authMode = wx.getStorageSync('authMode')
    
    if (authMode === 'user') {
      // 已登录用户
      this.setData({ isLoggedIn: true })
      this.loadUserInfo()
    } else if (authMode === 'guest') {
      // 游客模式
      this.setData({ isLoggedIn: false, userInfo: null })
    } else {
      // 未登录
      this.setData({ isLoggedIn: false, userInfo: null })
    }
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
    if (userInfo) {
      const user = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo
      this.setData({ 
        userInfo: user,
        backgroundType: user.backgroundType || 'gradient',
        stats: user.stats || { postCount: 0, commentCount: 0, likeCount: 0 }
      })
    }
  },

  // 去登录 - 使用统一跳转
  goToLogin() {
    wx.navigateTo({ url: '/pages/login/index' })
  },

  // 菜单项点击 - 检查登录状态
  onMenuTap(e) {
    // 直接检查登录状态
    const authMode = wx.getStorageSync('authMode')
    
    if (!authMode) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    if (authMode === 'guest') {
      wx.showToast({
        title: '游客无法使用此功能',
        icon: 'none'
      })
      return
    }
    
    const path = e.currentTarget.dataset.path
    wx.navigateTo({
      url: path
    })
  },

  // 跳转到编辑资料
  goToEditProfile() {
    wx.navigateTo({
      url: '/pages/user-center/edit-profile/index'
    })
  }
})
