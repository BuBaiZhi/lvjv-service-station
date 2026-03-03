// 房源搜索页面
const houseService = require('../../../services/houseService.js')

Page({
  data: {
    theme: 'light',
    elderMode: false,
    keyword: '',
    results: [],
    history: [],
    hotKeywords: ['三亚', '大理', '黄山', '深圳', '杭州', '成都', '海岛', '山居'],
    loading: false
  },

  onLoad() {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false
    })
    this.loadSearchHistory()
  },

  onShow() {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme,
      elderMode: app.globalData.elderMode
    })
  },

  loadSearchHistory() {
    const history = wx.getStorageSync('houseSearchHistory') || []
    this.setData({ history })
  },

  saveSearchHistory(keyword) {
    if (!keyword.trim()) return
    let history = this.data.history
    history = history.filter(item => item !== keyword)
    history.unshift(keyword)
    history = history.slice(0, 10)
    wx.setStorageSync('houseSearchHistory', history)
    this.setData({ history })
  },

  onInput(e) {
    const keyword = e.detail.value
    this.setData({ keyword })
    if (keyword.trim()) {
      this.searchHouses(keyword)
    } else {
      this.setData({ results: [] })
    }
  },

  searchHouses(keyword) {
    this.setData({ loading: true })
    
    houseService.getHouseList().then(houses => {
      const lowerKeyword = keyword.toLowerCase()
      const results = houses.filter(item => 
        (item.title && item.title.toLowerCase().includes(lowerKeyword)) || 
        (item.location && item.location.toLowerCase().includes(lowerKeyword)) ||
        (item.description && item.description.toLowerCase().includes(lowerKeyword))
      )
      
      this.setData({ 
        results,
        loading: false
      })
    }).catch(err => {
      console.error('搜索失败:', err)
      this.setData({ loading: false })
    })
  },

  onSearch() {
    if (!this.data.keyword.trim()) return
    this.saveSearchHistory(this.data.keyword)
    this.searchHouses(this.data.keyword)
  },

  clearInput() {
    this.setData({ keyword: '', results: [] })
  },

  onCancel() {
    wx.navigateBack()
  },

  clearHistory() {
    wx.removeStorageSync('houseSearchHistory')
    this.setData({ history: [] })
  },

  onHistoryTap(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.searchHouses(keyword)
  },

  onHotTap(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.searchHouses(keyword)
    this.saveSearchHistory(keyword)
  },

  onHouseTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/house/detail/detail?id=${id}`
    })
  }
})
