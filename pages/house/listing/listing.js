const houseService = require('../../../services/houseService.js')

Page({
  data: {
    theme: 'light',
    elderMode: false,
    viewMode: 'list',
    currentSort: 'comprehensive',
    allHouses: [],
    filteredHouses: [],
    hasMore: true,
    refreshing: false,
    
    showPriceModal: false,
    showFacilityModal: false,
    minPrice: '',
    maxPrice: '',
    priceFilterActive: false,
    facilityFilterActive: false,
    priceRanges: [
      { text: '0-50', min: 0, max: 50 },
      { text: '50-100', min: 50, max: 100 },
      { text: '100-200', min: 100, max: 200 },
      { text: '200以上', min: 200, max: 9999 }
    ],
    facilities: ['WiFi', '工位', '厨房', '洗衣机', '空调', '投影', '停车', '泳池'],
    facilityIcons: {
      'WiFi': '📶',
      '工位': '💻',
      '厨房': '🍳',
      '洗衣机': '🧺',
      '空调': '❄️',
      '投影': '🎬',
      '停车': '🚗',
      '泳池': '🏊'
    },
    selectedFacilities: [],
    
    latitude: 18.2529,
    longitude: 109.5120,
    scale: 14,
    markers: [],
    selectedHouse: null,
    
    currentCategory: '',
    loading: true
  },

  onLoad(options) {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false,
      currentCategory: options.category || '' 
    })
    this.loadHouses()
  },

  onShow() {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme,
      elderMode: app.globalData.elderMode
    })
    this.loadHouses()
  },

  loadHouses() {
    this.setData({ loading: true })
    
    houseService.getHouseList().then(houses => {
      this.setData({
        allHouses: houses,
        filteredHouses: houses,
        markers: houses.map(house => ({
          id: house._id,
          latitude: house.latitude || 18.2529,
          longitude: house.longitude || 109.5120,
          title: house.title,
          iconPath: '/images/tabbar/home-active.png',
          width: 40,
          height: 50
        })),
        loading: false
      })
      this.applyFilters()
    }).catch(err => {
      console.error('加载房源失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    })
  },

  applyFilters() {
    let filtered = [...this.data.allHouses]
    
    if (this.data.currentCategory === '海岛') {
      filtered = filtered.filter(h => h.title && h.title.includes('三亚'))
    } else if (this.data.currentCategory === '山居') {
      filtered = filtered.filter(h => 
        (h.title && (h.title.includes('黔县') || h.title.includes('大理'))) ||
        (h.location && (h.location.includes('黄山') || h.location.includes('大理')))
      )
    }
    
    if (this.data.minPrice) {
      filtered = filtered.filter(h => h.price >= Number(this.data.minPrice))
    }
    if (this.data.maxPrice) {
      filtered = filtered.filter(h => h.price <= Number(this.data.maxPrice))
    }
    
    if (this.data.selectedFacilities.length > 0) {
      filtered = filtered.filter(h => 
        this.data.selectedFacilities.every(f => h.facilities && h.facilities.includes(f))
      )
    }
    
    if (this.data.currentSort === 'price') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (this.data.currentSort === 'latest') {
      filtered.sort((a, b) => {
        if (a.createTime > b.createTime) return -1
        if (a.createTime < b.createTime) return 1
        return 0
      })
    }
    
    this.setData({ 
      filteredHouses: filtered,
      markers: filtered.map(house => ({
        id: house._id,
        latitude: house.latitude || 18.2529,
        longitude: house.longitude || 109.5120,
        title: house.title,
        iconPath: '/images/tabbar/home-active.png',
        width: 40,
        height: 50
      }))
    })
  },

  onHouseTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/house/detail/detail?id=${id}`
    })
  },

  onSort(e) {
    const sort = e.currentTarget.dataset.sort
    this.setData({ currentSort: sort })
    this.applyFilters()
  },

  showPriceFilter() {
    this.setData({ showPriceModal: true })
  },

  hidePriceFilter() {
    this.setData({ showPriceModal: false })
  },

  onMinPrice(e) {
    this.setData({ minPrice: e.detail.value })
  },

  onMaxPrice(e) {
    this.setData({ maxPrice: e.detail.value })
  },

  selectPriceRange(e) {
    const { min, max } = e.currentTarget.dataset
    this.setData({
      minPrice: String(min),
      maxPrice: String(max)
    })
  },

  applyPriceFilter() {
    this.hidePriceFilter()
    this.setData({
      priceFilterActive: !!(this.data.minPrice || this.data.maxPrice)
    })
    this.applyFilters()
  },

  resetPrice() {
    this.setData({
      minPrice: '',
      maxPrice: '',
      priceFilterActive: false
    })
    this.hidePriceFilter()
    this.applyFilters()
  },

  showFacilityFilter() {
    this.setData({ showFacilityModal: true })
  },

  hideFacilityFilter() {
    this.setData({ showFacilityModal: false })
  },

  toggleFacility(e) {
    const facility = e.currentTarget.dataset.facility
    let selected = [...this.data.selectedFacilities]
    const index = selected.indexOf(facility)
    if (index > -1) {
      selected.splice(index, 1)
    } else {
      selected.push(facility)
    }
    this.setData({ selectedFacilities: selected })
  },

  applyFacilityFilter() {
    this.hideFacilityFilter()
    this.setData({
      facilityFilterActive: this.data.selectedFacilities.length > 0
    })
    this.applyFilters()
  },

  resetFacilities() {
    this.setData({ 
      selectedFacilities: [],
      facilityFilterActive: false
    })
    this.hideFacilityFilter()
    this.applyFilters()
  },

  onSearch() {
    wx.navigateTo({ url: '/pages/home/search/search' })
  },

  onFilter() {
    this.showPriceFilter()
  },

  switchView(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({
      viewMode: mode,
      selectedHouse: null
    })
  },

  onMarkerTap(e) {
    const markerId = e.detail.markerId
    const house = this.data.filteredHouses.find(h => h._id === markerId)
    this.setData({ selectedHouse: house })
  },

  onSelectedCardTap() {
    if (this.data.selectedHouse) {
      wx.navigateTo({
        url: `/pages/house/detail/detail?id=${this.data.selectedHouse._id}`
      })
    }
  },

  onViewDetail(e) {
    e.stopPropagation()
    if (this.data.selectedHouse) {
      wx.navigateTo({
        url: `/pages/house/detail/detail?id=${this.data.selectedHouse._id}`
      })
    }
  },

  onLocate() {
    wx.showToast({ title: '定位功能开发中', icon: 'none' })
  },

  onRefresh() {
    this.setData({ refreshing: true })
    this.loadHouses()
    this.setData({ refreshing: false })
  },

  onLoadMore() {
    if (this.data.hasMore) {
      this.setData({ loading: true })
      setTimeout(() => {
        this.setData({ hasMore: false, loading: false })
      }, 500)
    }
  }
})