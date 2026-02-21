// 我的发布页面
const app = getApp()

Page({
  data: {
    theme: 'light',
    appVersion: 'standard',
    activeTab: 'all',
    publishList: [],
    filteredList: []
  },

  onLoad() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    this.loadPublishList()
  },

  onShow() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
  },

  // 加载发布列表
  loadPublishList() {
    // 模拟数据
    const mockPublish = [
      {
        id: 1,
        title: '阳光大床房出租',
        type: 'house',
        typeText: '房源',
        status: 'active',
        views: 128,
        likes: 23,
        date: '2026-01-10',
        image: 'https://picsum.photos/400/300?random=21'
      },
      {
        id: 2,
        title: '周末徒步活动',
        type: 'activity',
        typeText: '活动',
        status: 'active',
        views: 56,
        likes: 12,
        date: '2026-02-05',
        image: 'https://picsum.photos/400/300?random=22'
      },
      {
        id: 3,
        title: '吉他入门教学',
        type: 'skill',
        typeText: '技能',
        status: 'active',
        views: 89,
        likes: 18,
        date: '2025-12-20',
        image: 'https://picsum.photos/400/300?random=23'
      },
      {
        id: 4,
        title: '旅居生活分享',
        type: 'share',
        typeText: '分享',
        status: 'active',
        views: 156,
        likes: 45,
        date: '2026-02-10',
        image: 'https://picsum.photos/400/300?random=24'
      }
    ]
    this.setData({ 
      publishList: mockPublish,
      filteredList: mockPublish 
    })
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    
    // 根据分类筛选
    if (tab === 'all') {
      this.setData({ filteredList: this.data.publishList })
    } else {
      const filtered = this.data.publishList.filter(item => item.type === tab)
      this.setData({ filteredList: filtered })
    }
  },

  // 编辑发布
  editPublish(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    })
  },

  // 删除发布
  deletePublish(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条发布吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 新增发布
  addPublish() {
    wx.showToast({
      title: '新增发布功能开发中',
      icon: 'none'
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})
