const postService = require('../../services/postService.js')

Page({
  data: {
    keyword: '',
    postResults: [],
    activityResults: [],
    partnerResults: [],
    skillResults: [],
    userResults: [],
    history: [],
    hotKeywords: ['找搭子', '深圳', '活动', '技能变现', '大理', '三亚', '招募', '实习'],
    currentFilter: 'all',
    allPosts: []
  },

  onLoad() {
    this.loadSearchHistory()
    this.loadAllPosts()
  },

  // 加载所有帖子
  loadAllPosts() {
    postService.getPosts().then(posts => {
      this.setData({ allPosts: posts })
    }).catch(err => {
      console.error('加载帖子失败:', err)
    })
  },

  // 加载搜索历史
  loadSearchHistory() {
    const history = wx.getStorageSync('squareSearchHistory') || []
    this.setData({ history })
  },

  // 保存搜索历史
  saveSearchHistory(keyword) {
    if (!keyword.trim()) return
    
    let history = this.data.history
    history = history.filter(item => item !== keyword)
    history.unshift(keyword)
    history = history.slice(0, 10)
    
    wx.setStorageSync('squareSearchHistory', history)
    this.setData({ history })
  },

  // 输入
  onInput(e) {
    const keyword = e.detail.value
    this.setData({ keyword })
    
    if (keyword.trim()) {
      this.searchPosts(keyword)
    } else {
      this.clearResults()
    }
  },

  // 清空结果
  clearResults() {
    this.setData({
      postResults: [],
      activityResults: [],
      partnerResults: [],
      skillResults: [],
      userResults: []
    })
  },

  // 搜索帖子
  searchPosts(keyword) {
    const allPosts = this.data.allPosts
    const lowerKeyword = keyword.toLowerCase()
    
    const results = allPosts.filter(item => 
      (item.title && item.title.toLowerCase().includes(lowerKeyword)) || 
      (item.content && item.content.toLowerCase().includes(lowerKeyword)) ||
      (item.author && item.author.name && item.author.name.toLowerCase().includes(lowerKeyword))
    )
    
    // 按类型分类
    const postResults = results
    const activityResults = results.filter(item => item.type === '活动')
    const partnerResults = results.filter(item => item.type === '找搭子')
    const skillResults = results.filter(item => item.type === '技能变现')
    
    this.setData({
      postResults,
      activityResults,
      partnerResults,
      skillResults
    })
  },

  // 格式化时间
  formatTime(time) {
    if (!time) return ''
    
    const now = new Date()
    const postTime = new Date(time)
    const diff = now - postTime
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return minutes + '分钟前'
    if (hours < 24) return hours + '小时前'
    if (days < 30) return days + '天前'
    
    return postTime.toLocaleDateString()
  },

  // 设置筛选
  setFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter })
  },

  // 确认搜索
  onSearch() {
    if (!this.data.keyword.trim()) return
    this.saveSearchHistory(this.data.keyword)
  },

  // 清空输入
  clearInput() {
    this.setData({
      keyword: ''
    })
    this.clearResults()
  },

  // 取消
  onCancel() {
    wx.navigateBack()
  },

  // 清空历史
  clearHistory() {
    wx.removeStorageSync('squareSearchHistory')
    this.setData({ history: [] })
  },

  // 点击历史记录
  onHistoryTap(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.searchPosts(keyword)
  },

  // 点击热门搜索
  onHotTap(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.searchPosts(keyword)
    this.saveSearchHistory(keyword)
  },

  // 点击帖子
  onPostTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/square-detail/detail?id=${id}`
    })
  },

  // 点击用户
  onUserTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/profile/profile?id=${id}`
    })
  }
})