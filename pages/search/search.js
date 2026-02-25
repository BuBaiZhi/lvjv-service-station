const houseService = require('../../services/houseService.js')

Page({
  data: {
    theme: 'light',
    elderMode: false,
    keyword: '',
    allHouses: [],
    filteredHouses: [],
    history: [],
    hotKeywords: ['三亚', '大理', '黄山', '北京', '上海', '深圳', '成都', '杭州'],
    hotDestinations: ['三亚·NCC社区', '大理共居社区', '黔县数字乡建', '北京数字游民基地', '上海共创空间'],
    currentFilter: 'all',
    loading: false
  },

  onLoad() {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false
    })
    this.loadSearchHistory()
    this.loadAllHouses()
  },

  onShow() {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme,
      elderMode: app.globalData.elderMode
    })
  },

  loadAllHouses() {
    houseService.getHouseList().then(houses => {
      this.setData({ allHouses: houses })
    }).catch(err => {
      console.error('加载房源失败:', err)
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
      this.setData({ filteredHouses: [] })
    }
  },

  searchHouses(keyword) {
    this.setData({ loading: true })
    const results = this.data.allHouses.filter(item => 
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      item.location.toLowerCase().includes(keyword.toLowerCase())
    )
    this.setData({ filteredHouses: results, loading: false })
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
    this.setData({ keyword: '', filteredHouses: [] })
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

  onDestinationTap(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.searchHouses(keyword)
    this.saveSearchHistory(keyword)
  },

  onHouseTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  }
})