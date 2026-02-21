const houseService = require('../../services/houseService.js')

Page({
  data: {
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
    this.loadSearchHistory()
    this.loadAllHouses()
  },

  // 加载所有房源
  loadAllHouses() {
    houseService.getHouseList().then(houses => {
      this.setData({ allHouses: houses })
    }).catch(err => {
      console.error('加载房源失败:', err)
    })
  },

  // 加载搜索历史
  loadSearchHistory() {
    const history = wx.getStorageSync('houseSearchHistory') || []
    this.setData({ history })
  },

  // 保存搜索历史
  saveSearchHistory(keyword) {
    if (!keyword.trim()) return
    
    let history = this.data.history
    // 去重
    history = history.filter(item => item !== keyword)
    // 添加到开头
    history.unshift(keyword)
    // 只保留最近10条
    history = history.slice(0, 10)
    
    wx.setStorageSync('houseSearchHistory', history)
    this.setData({ history })
  },

  // 输入
  onInput(e) {
    const keyword = e.detail.value
    this.setData({ keyword })
    
    if (keyword.trim()) {
      this.searchHouses(keyword)
    } else {
      this.setData({ filteredHouses: [] })
    }
  },

  // 搜索房源
  searchHouses(keyword) {
    this.setData({ loading: true })
    
    // 按标题和位置搜索
    const results = this.data.allHouses.filter(item => 
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      item.location.toLowerCase().includes(keyword.toLowerCase())
    )
    
    this.setData({ 
      filteredHouses: results,
      loading: false 
    })
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
      keyword: '',
      filteredHouses: []
    })
  },

  // 取消
  onCancel() {
    wx.navigateBack()
  },

  // 清空历史
  clearHistory() {
    wx.removeStorageSync('houseSearchHistory')
    this.setData({ history: [] })
  },

  // 点击历史记录
  onHistoryTap(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.searchHouses(keyword)
  },

  // 点击热门搜索
  onHotTap(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.searchHouses(keyword)
    this.saveSearchHistory(keyword)
  },

  // 点击热门目的地
  onDestinationTap(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.searchHouses(keyword)
    this.saveSearchHistory(keyword)
  },

  // 点击房源
  onHouseTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  }
})