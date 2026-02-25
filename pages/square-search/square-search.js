const postService = require('../../services/postService.js')

Page({
  data: {
    theme: 'light',
    elderMode: false,
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
    const app = getApp()
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false
    })
    this.loadSearchHistory()
    this.loadAllPosts()
  },

  onShow() {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme,
      elderMode: app.globalData.elderMode
    })
  },

  loadAllPosts() {
    postService.getPosts().then(posts => {
      this.setData({ allPosts: posts })
    }).catch(err => {
      console.error('加载帖子失败:', err)
    })
  },

  loadSearchHistory() {
    const history = wx.getStorageSync('squareSearchHistory') || []
    this.setData({ history })
  },

  saveSearchHistory(keyword) {
    if (!keyword.trim()) return
    let history = this.data.history
    history = history.filter(item => item !== keyword)
    history.unshift(keyword)
    history = history.slice(0, 10)
    wx.setStorageSync('squareSearchHistory', history)
    this.setData({ history })
  },

  onInput(e) {
    const keyword = e.detail.value
    this.setData({ keyword })
    if (keyword.trim()) {
      this.searchPosts(keyword)
    } else {
      this.clearResults()
    }
  },

  clearResults() {
    this.setData({
      postResults: [],
      activityResults: [],
      partnerResults: [],
      skillResults: [],
      userResults: []
    })
  },

  searchPosts(keyword) {
    const allPosts = this.data.allPosts
    const lowerKeyword = keyword.toLowerCase()
    
    const results = allPosts.filter(item => 
      (item.title && item.title.toLowerCase().includes(lowerKeyword)) || 
      (item.content && item.content.toLowerCase().includes(lowerKeyword)) ||
      (item.author && item.author.name && item.author.name.toLowerCase().includes(lowerKeyword))
    )
    
    this.setData({
      postResults: results,
      activityResults: results.filter(item => item.type === '活动'),
      partnerResults: results.filter(item => item.type === '找搭子'),
      skillResults: results.filter(item => item.type === '技能变现')
    })
  },

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

  setFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter })
  },

  onSearch() {
    if (!this.data.keyword.trim()) return
    this.saveSearchHistory(this.data.keyword)
  },

  clearInput() {
    this.setData({ keyword: '' })
    this.clearResults()
  },

  onCancel() {
    wx.navigateBack()
  },

  clearHistory() {
    wx.removeStorageSync('squareSearchHistory')
    this.setData({ history: [] })
  },

  onHistoryTap(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.searchPosts(keyword)
  },

  onHotTap(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.searchPosts(keyword)
    this.saveSearchHistory(keyword)
  },

  onPostTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/square-detail/detail?id=${id}` })
  },

  onUserTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/profile/profile?id=${id}` })
  }
})