const houseService = require('../../services/houseService.js')

Page({
  data: {
    viewMode: 'list',
    currentSort: 'comprehensive',
    allHouses: [],
    filteredHouses: [],
    hasMore: true,
    refreshing: false,
    
    // 筛选相关
    showPriceModal: false,
    showFacilityModal: false,
    minPrice: '',
    maxPrice: '',
    priceRanges: [
      { text: '0-50', min: 0, max: 50 },
      { text: '50-100', min: 50, max: 100 },
      { text: '100-200', min: 100, max: 200 },
      { text: '200以上', min: 200, max: 9999 }
    ],
    facilities: ['WiFi', '工位', '厨房', '洗衣机', '空调', '投影', '停车', '泳池'],
    selectedFacilities: [],
    
    // 地图相关
    latitude: 18.2529,
    longitude: 109.5120,
    scale: 14,
    markers: [],
    selectedHouse: null,
    
    // 分类参数
    currentCategory: '',
    loading: true
  },

  onLoad(options) {
    this.setData({ 
      currentCategory: options.category || '' 
    })
    this.loadHouses()
  },

  onShow() {
    this.loadHouses()
  },

  loadHouses() {
    this.setData({ loading: true })
    
    houseService.getHouseList().then(houses => {
      console.log('从数据库获取到房源:', houses)
      
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
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    })
  },

  applyFilters() {
    let filtered = [...this.data.allHouses]
    
    // 分类筛选
    if (this.data.currentCategory === '海岛') {
      filtered = filtered.filter(h => h.title && h.title.includes('三亚'))
    } else if (this.data.currentCategory === '山居') {
      filtered = filtered.filter(h => 
        (h.title && (h.title.includes('黔县') || h.title.includes('大理'))) ||
        (h.location && (h.location.includes('黄山') || h.location.includes('大理')))
      )
    }
    
    // 价格筛选
    if (this.data.minPrice) {
      filtered = filtered.filter(h => h.price >= Number(this.data.minPrice))
    }
    if (this.data.maxPrice) {
      filtered = filtered.filter(h => h.price <= Number(this.data.maxPrice))
    }
    
    // 设施筛选
    if (this.data.selectedFacilities.length > 0) {
      filtered = filtered.filter(h => 
        this.data.selectedFacilities.every(f => h.facilities && h.facilities.includes(f))
      )
    }
    
    // 排序
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
    console.log('点击房源，_id:', id)
    
    if (!id) {
      wx.showToast({
        title: '房源ID不存在',
        icon: 'none'
      })
      return
    }
    
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`,
      fail: (err) => {
        console.error('跳转失败:', err)
      }
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
    this.applyFilters()
  },

  resetPrice() {
    this.setData({
      minPrice: '',
      maxPrice: ''
    })
  },

  showFacilityFilter() {
    this.setData({ showFacilityModal: true })
  },

  hideFacilityFilter() {
    this.setData({ showFacilityModal: false })
  },

  onFacilityChange(e) {
    const facility = e.currentTarget.dataset.facility
    let selected = this.data.selectedFacilities
    
    if (e.detail.value.length > 0) {
      selected.push(facility)
    } else {
      selected = selected.filter(f => f !== facility)
    }
    
    this.setData({ selectedFacilities: selected })
  },

  applyFacilityFilter() {
    this.hideFacilityFilter()
    this.applyFilters()
  },

  resetFacilities() {
    this.setData({ selectedFacilities: [] })
  },

  onSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    })
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
        url: `/pages/detail/detail?id=${this.data.selectedHouse._id}`
      })
    }
  },

  onViewDetail(e) {
    e.stopPropagation()
    if (this.data.selectedHouse) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${this.data.selectedHouse._id}`
      })
    }
  },

  onLocate() {
    wx.showToast({
      title: '定位功能开发中',
      icon: 'none'
    })
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
        this.setData({ 
          hasMore: false, 
          loading: false 
        })
      }, 500)
    }
  }
})