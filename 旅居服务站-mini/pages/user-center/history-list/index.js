// 浏览历史页面
const app = getApp()

Page({
  data: {
    theme: 'light',
    appVersion: 'standard',
    // 主分类：history(浏览) / favorite(收藏)
    activeTab: 'history',
    // 类型筛选 - 独立为每个分类记录
    historyTypeFilter: 'all',
    favoriteTypeFilter: 'all',
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
    favoriteList: [],
    // 筛选后数据
    filteredList: [],
    isEditMode: false,
    selectedIds: []
  },

  onLoad() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    this.loadHistoryList()
  },

  onShow() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
  },

  // 加载浏览历史
  loadHistoryList() {
    // 模拟浏览历史数据
    const mockHistory = [
      {
        id: 1,
        title: '精装公寓出租',
        type: 'house',
        price: 150,
        date: '2026-02-14 14:30',
        image: 'https://picsum.photos/200/200?random=31'
      },
      {
        id: 2,
        title: '周末露营活动',
        type: 'activity',
        price: 80,
        date: '2026-02-13 10:20',
        image: 'https://picsum.photos/200/200?random=32'
      },
      {
        id: 3,
        title: '钢琴教学',
        type: 'skill',
        price: 120,
        date: '2026-02-12 16:45',
        image: 'https://picsum.photos/200/200?random=33'
      },
      {
        id: 4,
        title: '海景房',
        type: 'house',
        price: 300,
        date: '2026-02-11 09:15',
        image: 'https://picsum.photos/200/200?random=34'
      },
      {
        id: 5,
        title: '旅居生活分享',
        type: 'share',
        price: 0,
        date: '2026-02-10 20:00',
        image: 'https://picsum.photos/200/200?random=35'
      }
    ]

    // 模拟收藏数据
    const mockFavorite = [
      {
        id: 101,
        title: '温馨民宿推荐',
        type: 'house',
        price: 200,
        date: '2026-02-15 15:00',
        image: 'https://picsum.photos/200/200?random=41'
      },
      {
        id: 102,
        title: '春季徒步活动',
        type: 'activity',
        price: 50,
        date: '2026-02-14 11:30',
        image: 'https://picsum.photos/200/200?random=42'
      },
      {
        id: 103,
        title: '吉他课程',
        type: 'skill',
        price: 100,
        date: '2026-02-13 18:20',
        image: 'https://picsum.photos/200/200?random=43'
      }
    ]

    this.setData({ 
      historyList: mockHistory,
      favoriteList: mockFavorite
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
    
    const filterKey = this.data.activeTab === 'history' ? 'historyTypeFilter' : 'favoriteTypeFilter'
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
    const sourceList = this.data.activeTab === 'history' 
      ? this.data.historyList 
      : this.data.favoriteList
    
    let result = sourceList
    
    // 按类型筛选 - 使用对应分类的筛选值
    const typeFilter = this.data.activeTab === 'history' 
      ? this.data.historyTypeFilter 
      : this.data.favoriteTypeFilter
    
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
    wx.showToast({
      title: '详情功能开发中',
      icon: 'none'
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})
