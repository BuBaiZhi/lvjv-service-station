// 用户中心首页
const app = getApp()

Page({
  data: {
    theme: 'light',
    appVersion: 'standard',
    userInfo: {
      avatar: 'https://picsum.photos/200/200?random=10',
      nickname: '旅行者',
      signature: '探索世界，发现自我',
      identity: 'villager',  // 村民 villager / 游民 nomad
      gender: 'male',         // 男 male / 女 female
      age: 28,
      id: 2123,
      background: ''  // 背景图URL
    },
    stats: {
      postCount: 24,
      commentCount: 156,
      likeCount: 89
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
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    this.loadUserInfo()
  },

  onShow() {
    // 每次显示页面时更新主题和用户信息
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  // 菜单项点击
  onMenuTap(e) {
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