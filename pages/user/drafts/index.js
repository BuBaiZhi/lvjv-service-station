const draftService = require('../../../services/draftService.js')
const themeService = require('../../../services/themeService.js')
const nav = require('../../../utils/navigation.js')
const app = getApp()

// 草稿类型映射
const DRAFT_TYPE_MAP = {
  'post': { name: '帖子', icon: '📝', route: '/pages/square/publish/publish' },
  'house': { name: '房源', icon: '🏠', route: '/pages/house/publish/publish' },
  'resource': { name: '资源', icon: '📦', route: '/pages/skill/resource-publish/resource-publish' }
}

Page({
  data: {
    theme: 'light',
    elderMode: false,
    tabs: [
      { key: 'all', name: '全部' },
      { key: 'post', name: '帖子' },
      { key: 'house', name: '房源' },
      { key: 'resource', name: '资源' }
    ],
    currentTab: 'all',
    draftList: [],
    filteredList: [],
    loading: true,
    isEmpty: false
  },

  onLoad(options) {
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false
    })
    
    // 如果从外部传入类型，切换到对应tab
    if (options.type && DRAFT_TYPE_MAP[options.type]) {
      this.setData({ currentTab: options.type })
    }
    
    this.loadDrafts()
  },

  onShow() {
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false
    })
    themeService.applyThemeToPage(this)
    
    // 每次显示时重新加载草稿
    this.loadDrafts()
  },

  // 加载草稿列表
  async loadDrafts() {
    this.setData({ loading: true })
    
    try {
      const drafts = await draftService.getUserDrafts()
      
      // 格式化草稿数据
      const formattedDrafts = (drafts || []).map(draft => {
        const typeInfo = DRAFT_TYPE_MAP[draft.type] || { name: '未知', icon: '📄', route: '' }
        return {
          ...draft,
          typeName: typeInfo.name,
          typeIcon: typeInfo.icon,
          route: typeInfo.route,
          timeText: this.formatTime(draft.updateTime || draft.createTime),
          previewText: this.getPreviewText(draft)
        }
      })
      
      this.setData({
        draftList: formattedDrafts,
        loading: false
      })
      
      this.filterDrafts()
    } catch (error) {
      console.error('加载草稿失败:', error)
      this.setData({
        draftList: [],
        filteredList: [],
        loading: false,
        isEmpty: true
      })
    }
  },

  // 筛选草稿
  filterDrafts() {
    const { currentTab, draftList } = this.data
    let filtered = draftList
    
    if (currentTab !== 'all') {
      filtered = draftList.filter(d => d.type === currentTab)
    }
    
    this.setData({
      filteredList: filtered,
      isEmpty: filtered.length === 0
    })
  },

  // 切换Tab
  switchTab(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ currentTab: key })
    this.filterDrafts()
  },

  // 继续编辑
  editDraft(e) {
    const draft = e.currentTarget.dataset.draft
    if (!draft || !draft.route) {
      wx.showToast({ title: '无法编辑此草稿', icon: 'none' })
      return
    }
    
    wx.navigateTo({
      url: `${draft.route}?draftId=${draft._id}`
    })
  },

  // 删除草稿
  deleteDraft(e) {
    const draft = e.currentTarget.dataset.draft
    const index = e.currentTarget.dataset.index
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除这个${draft.typeName}草稿吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await draftService.deleteDraft(draft._id)
            
            // 更新列表
            const newList = this.data.draftList.filter(d => d._id !== draft._id)
            this.setData({ draftList: newList })
            this.filterDrafts()
            
            wx.showToast({ title: '已删除', icon: 'success' })
          } catch (error) {
            console.error('删除草稿失败:', error)
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 格式化时间
  formatTime(dateStr) {
    if (!dateStr) return ''
    
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    
    // 1小时内
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return minutes <= 1 ? '刚刚' : `${minutes}分钟前`
    }
    
    // 今天
    if (date.toDateString() === now.toDateString()) {
      return `今天 ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`
    }
    
    // 昨天
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return `昨天 ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`
    }
    
    // 其他
    return `${date.getMonth() + 1}月${date.getDate()}日`
  },

  padZero(num) {
    return num < 10 ? '0' + num : num
  },

  // 获取预览文本
  getPreviewText(draft) {
    if (draft.content) {
      return draft.content.length > 50 
        ? draft.content.substring(0, 50) + '...' 
        : draft.content
    }
    if (draft.title) {
      return draft.title
    }
    return '暂无内容'
  }
})
