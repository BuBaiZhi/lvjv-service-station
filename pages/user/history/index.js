// 浏览历史页面
const app = getApp()
const likeService = require('../../../services/likeService.js')
const favoriteService = require('../../../services/favoriteService.js')

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
    selectedIds: [],
    loading: false
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
    if (this.data.loading) return
    this.setData({ loading: true })
    
    try {
      const openid = wx.getStorageSync('openid')
      console.log('[History] 加载互动记录，openid:', openid)
      
      // 加载点赞列表
      const likes = await likeService.getLikeList()
      const likesList = likes.map(item => ({
        id: item._id || item.itemId,
        itemId: item.itemId,
        title: item.title || '内容',
        type: item.itemType || 'post',
        date: item.createTime ? this.formatDate(item.createTime) : '未知',
        image: item.image || 'https://picsum.photos/200/200?random=40'
      }))
      
      // 加载收藏列表
      const collects = await favoriteService.getFavoriteList()
      const collectsList = collects.map(item => ({
        id: item._id || item.itemId,
        itemId: item.itemId,
        title: item.title || '内容',
        type: item.itemType || 'post',
        date: item.createTime ? this.formatDate(item.createTime) : '未知',
        image: item.image || 'https://picsum.photos/200/200?random=40'
      }))
      
      // 浏览历史暂时使用本地存储
      const historyList = wx.getStorageSync('local_browse_history') || []
      
      this.setData({ 
        historyList,
        likesList,
        collectsList,
        commentsList: []
      })
      
      this.applyFilters()
      console.log('[History] 加载成功:', { history: historyList.length, likes: likesList.length, collects: collectsList.length })
    } catch (error) {
      console.error('[History] 加载失败:', error)
      this.setData({ 
        historyList: [],
        likesList: [],
        collectsList: [],
        commentsList: []
      })
      this.applyFilters()
    } finally {
      this.setData({ loading: false })
    }
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return '未知'
    if (typeof date === 'string') return date.substring(0, 10)
    if (date.toISOString) return date.toISOString().substring(0, 10)
    return '未知'
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
