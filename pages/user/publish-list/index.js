// 我的发布页面
const app = getApp()

// 开发模式：使用模拟数据
const USE_MOCK = true

Page({
  data: {
    theme: 'light',
    appVersion: 'standard',
    activeTab: 'all',
    publishList: [],
    filteredList: []
  },

  async onLoad() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    await this.loadPublishList()
  },

  onShow() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    this.loadPublishList()
  },

  // 加载发布列表
  async loadPublishList() {
    if (USE_MOCK) {
      this.loadMockData()
      return
    }
    
    try {
      const api = require('../../../services/apiProxy.js')
      const publishList = await api.getPublishList()
      
      if (publishList) {
        this.setData({ 
          publishList: publishList,
          filteredList: publishList 
        })
      }
    } catch (error) {
      console.error('Failed to load publish list:', error)
      this.loadMockData()
    }
  },

  // 加载模拟数据
  loadMockData() {
    const mockPublish = [
      {
        id: 'house_1',
        title: '三亚NCC社区·唯吾岛',
        type: 'house',
        typeText: '房源',
        status: 'active',
        views: 128,
        likes: 23,
        date: '2026-01-10',
        image: 'https://picsum.photos/400/300?random=21'
      },
      {
        id: 'post_1',
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
        id: 'post_2',
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
        id: 'post_3',
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

  // 查看详情
  viewDetail(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.filteredList.find(i => i.id === id)
    
    if (!item) {
      wx.showToast({ title: '内容不存在', icon: 'none' })
      return
    }
    
    // 根据类型跳转到不同详情页
    if (item.type === 'house') {
      wx.navigateTo({ url: `/pages/house/detail/detail?id=${id}` })
    } else {
      wx.navigateTo({ url: `/pages/square/detail/detail?id=${id}` })
    }
  },

  // 编辑发布
  editPublish(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.filteredList.find(i => i.id === id)
    
    if (!item) {
      wx.showToast({ title: '内容不存在', icon: 'none' })
      return
    }
    
    // 根据类型跳转到不同的编辑页面
    if (item.type === 'house') {
      wx.navigateTo({ url: `/pages/house/publish/publish?id=${id}&mode=edit` })
    } else {
      wx.navigateTo({ url: `/pages/square/publish/publish?id=${id}&mode=edit` })
    }
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
    wx.showActionSheet({
      itemList: ['发布房源', '发布帖子'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.navigateTo({ url: '/pages/house/publish/publish' })
        } else if (res.tapIndex === 1) {
          wx.navigateTo({ url: '/pages/square/publish/publish' })
        }
      }
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})
