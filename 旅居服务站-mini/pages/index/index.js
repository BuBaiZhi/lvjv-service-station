// 首页
const app = getApp()

Page({
  data: {
    theme: 'light',
    appVersion: 'standard',
    bannerList: [
      { id: 1, image: 'https://picsum.photos/750/320?random=1', title: '民宿推荐' },
      { id: 2, image: 'https://picsum.photos/750/320?random=2', title: '技能分享' },
      { id: 3, image: 'https://picsum.photos/750/320?random=3', title: '活动聚会' }
    ],
    categoryList: [
      { id: 1, icon: '🏠', name: '民宿', path: '/pages/house/index' },
      { id: 2, icon: '🎓', name: '技能', path: '/pages/skill/index' },
      { id: 3, icon: '🎉', name: '活动', path: '/pages/activity/index' },
      { id: 4, icon: '📢', name: '广场', path: '/pages/square/index' }
    ],
    hotList: [
      {
        id: 1,
        title: '温馨两居室',
        type: 'house',
        price: 200,
        image: 'https://picsum.photos/400/300?random=4',
        tags: ['近地铁', '独立卫浴']
      },
      {
        id: 2,
        title: '英语口语教学',
        type: 'skill',
        price: 80,
        image: 'https://picsum.photos/400/300?random=5',
        tags: ['线上授课', '灵活时间']
      },
      {
        id: 3,
        title: '周末登山活动',
        type: 'activity',
        price: 50,
        image: 'https://picsum.photos/400/300?random=6',
        tags: ['健康运动', '结交朋友']
      }
    ]
  },

  onLoad() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
  },

  onShow() {
    // 每次显示页面时更新主题
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
  },

  // 轮播图切换
  onBannerChange(e) {
    console.log('Banner changed:', e.detail.current)
  },

  // 分类点击
  onCategoryTap(e) {
    const path = e.currentTarget.dataset.path
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 查看热门项目详情
  viewDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: '详情功能开发中',
      icon: 'none'
    })
  },

  // 搜索
  onSearch() {
    wx.showToast({
      title: '搜索功能开发中',
      icon: 'none'
    })
  }
})