// 浏览历史页面
const app = getApp()

// 开发模式：使用模拟数据
const USE_MOCK = true

Page({
  data: {
    theme: 'light',
    appVersion: 'standard',
    // 主分类：history(浏览) / likes(点赞) / collects(收藏) / comments(评论)
    activeTab: 'history',
    // 类型筛选 - 独立为每个分类记录
    historyTypeFilter: 'all',
    likesTypeFilter: 'all',
    collectsTypeFilter: 'all',
    commentsTypeFilter: 'all',
    // 当前展示的筛选值（根据 activeTab 动态计算）
    currentTypeFilter: 'all',
    typeFilterShow: false,
    typeOptions: [
      { value: 'all', label: '全部' },
      { value: 'house', label: '民宿' },
      { value: 'activity', label: '活动' },
      { value: 'skill', label: '技能' },
      { value: 'share', label: '分享' }
    ],
    // 原始数据
    historyList: [],
    likesList: [],
    collectsList: [],
    commentsList: [],
    // 筛选后数据
    filteredList: [],
    isEditMode: false,
    selectedIds: []
  },

  async onLoad(options) {
    // 支持从其他页面跳转指定类型
    if (options && options.type) {
      const validTypes = ['history', 'likes', 'collects', 'comments']
      if (validTypes.includes(options.type)) {
        this.setData({ activeTab: options.type })
      }
    }
    
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    await this.loadHistoryList()
  },

  onShow() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    // 重新加载历史列表，以反映最新状态
    this.loadHistoryList()
  },

  // 加载浏览历史
  async loadHistoryList() {
    // 开发模式直接使用模拟数据
    if (USE_MOCK) {
      this.loadMockData()
      return
    }
    
    try {
      // 从服务代理层获取浏览历史
      const api = require('../../../services/apiProxy.js')
      const historyData = await api.getHistoryList()
      
      if (historyData) {
        this.setData({ 
          historyList: historyData.historyList || [],
          favoriteList: historyData.favoriteList || []
        })
        this.applyFilters()
      }
    } catch (error) {
      console.error('Failed to load history list:', error)
      this.loadMockData()
    }
  },

  // 加载模拟数据
  loadMockData() {
    // 模拟浏览历史数据
    const mockHistory = [
      {
        id: 'house_1',
        title: '三亚NCC社区·唯吾岛',
        type: 'house',
        price: 45,
        date: '2026-02-14 14:30',
        image: 'https://picsum.photos/200/200?random=31'
      },
      {
        id: 'post_1',
        title: '周末露营活动',
        type: 'activity',
        price: 80,
        date: '2026-02-13 10:20',
        image: 'https://picsum.photos/200/200?random=32'
      },
      {
        id: 'post_2',
        title: '钢琴教学',
        type: 'skill',
        price: 120,
        date: '2026-02-12 16:45',
        image: 'https://picsum.photos/200/200?random=33'
      }
    ]

    // 模拟点赞数据
    const mockLikes = [
      {
        id: 'house_3',
        title: '黄山宏村·水墨人家',
        type: 'house',
        price: 55,
        date: '2026-02-15 15:00',
        image: 'https://picsum.photos/200/200?random=41'
      },
      {
        id: 'post_4',
        title: '春季徒步活动',
        type: 'activity',
        price: 50,
        date: '2026-02-14 11:30',
        image: 'https://picsum.photos/200/200?random=42'
      }
    ]

    // 模拟收藏数据
    const mockCollects = [
      {
        id: 'house_2',
        title: '大理古城·苍山脚下',
        type: 'house',
        price: 68,
        date: '2026-02-15 09:15',
        image: 'https://picsum.photos/200/200?random=34'
      },
      {
        id: 'post_5',
        title: '吉他课程',
        type: 'skill',
        price: 100,
        date: '2026-02-13 18:20',
        image: 'https://picsum.photos/200/200?random=43'
      }
    ]

    // 模拟评论数据
    const mockComments = [
      {
        id: 'comment_1',
        title: '周末露营活动',
        type: 'activity',
        content: '这个活动很棒，期待参加！',
        date: '2026-02-14 16:00',
        image: 'https://picsum.photos/200/200?random=51'
      },
      {
        id: 'comment_2',
        title: '三亚NCC社区',
        type: 'house',
        content: '环境很好，推荐大家来体验！',
        date: '2026-02-13 12:30',
        image: 'https://picsum.photos/200/200?random=52'
      }
    ]

    this.setData({ 
      historyList: mockHistory,
      likesList: mockLikes,
      collectsList: mockCollects,
      commentsList: mockComments
    })
    
    this.applyFilters()
  },

  // 切换主分类（浏览/收藏）
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ 
      activeTab: tab,
      typeFilterShow: false,
      // 不重置筛选，让每个分类保留各自的状态
    }, () => {
      this.applyFilters()
    })
  },

  // 切换类型筛选
  toggleTypeFilter(e) {
    const type = e.currentTarget.dataset.type
    
    if (type === undefined || type === null) {
      this.setData({ typeFilterShow: !this.data.typeFilterShow })
      return
    }
    
    let filterKey
    switch (this.data.activeTab) {
      case 'history':
        filterKey = 'historyTypeFilter'
        break
      case 'likes':
        filterKey = 'likesTypeFilter'
        break
      case 'collects':
        filterKey = 'collectsTypeFilter'
        break
      case 'comments':
        filterKey = 'commentsTypeFilter'
        break
      default:
        filterKey = 'historyTypeFilter'
    }
    
    this.setData({ 
      [filterKey]: type,
      typeFilterShow: false
    }, () => {
      this.applyFilters()
    })
  },

  // 关闭筛选面板
  closeTypeFilter() {
    this.setData({ typeFilterShow: false })
  },

  // 应用筛选
  applyFilters() {
    let sourceList
    switch (this.data.activeTab) {
      case 'history':
        sourceList = this.data.historyList
        break
      case 'likes':
        sourceList = this.data.likesList
        break
      case 'collects':
        sourceList = this.data.collectsList
        break
      case 'comments':
        sourceList = this.data.commentsList
        break
      default:
        sourceList = this.data.historyList
    }
    
    let result = sourceList
    
    // 按类型筛选 - 使用对应分类的筛选值
    let typeFilter
    switch (this.data.activeTab) {
      case 'history':
        typeFilter = this.data.historyTypeFilter
        break
      case 'likes':
        typeFilter = this.data.likesTypeFilter
        break
      case 'collects':
        typeFilter = this.data.collectsTypeFilter
        break
      case 'comments':
        typeFilter = this.data.commentsTypeFilter
        break
      default:
        typeFilter = 'all'
    }
    
    if (typeFilter !== 'all') {
      result = result.filter(item => item.type === typeFilter)
    }
    
    this.setData({ 
      currentTypeFilter: typeFilter,
      filteredList: result 
    })
  },

  // 选择/取消选择
  toggleSelect(e) {
    const id = e.currentTarget.dataset.id
    const selectedIds = this.data.selectedIds
    const index = selectedIds.indexOf(id)
    
    if (index > -1) {
      selectedIds.splice(index, 1)
    } else {
      selectedIds.push(id)
    }
    
    this.setData({ selectedIds })
  },

  // 全选
  selectAll() {
    const allIds = this.data.historyList.map(item => item.id)
    this.setData({ selectedIds: allIds })
  },

  // 删除选中
  deleteSelected() {
    if (this.data.selectedIds.length === 0) {
      wx.showToast({
        title: '请选择要删除的记录',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${this.data.selectedIds.length} 条记录吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
          this.setData({
            isEditMode: false,
            selectedIds: []
          })
          this.loadHistoryList()
        }
      }
    })
  },

  // 查看详情
  viewDetail(e) {
    if (this.data.isEditMode) return
    
    const id = e.currentTarget.dataset.id
    const item = this.data.filteredList.find(i => i.id === id)
    
    if (!item) {
      wx.showToast({ title: '内容不存在', icon: 'none' })
      return
    }
    
    // 根据类型跳转到不同详情页
    if (item.type === 'house') {
      wx.navigateTo({ url: `/pages/house/detail/detail?id=${id}` })
    } else if (item.type === 'activity' || item.type === 'skill' || item.type === 'share') {
      wx.navigateTo({ url: `/pages/square/detail/detail?id=${id}` })
    } else {
      wx.showToast({ title: '详情功能开发中', icon: 'none' })
    }
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})
