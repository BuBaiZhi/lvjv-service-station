Page({
  data: {
    // 地图参数
    latitude: 39.9085,
    longitude: 116.3974,
    scale: 16,
    markers: [],
    
    // 搜索
    keyword: '',
    searchMode: false,
    
    // 地点列表
    places: [],
    showPlaces: true,
    
    // 选中地点
    selectedPlace: null
  },

  onLoad(options) {
    // 获取当前位置
    this.getCurrentLocation()
    
    // 加载附近地点
    this.loadNearbyPlaces()
  },

  // 获取当前位置
  getCurrentLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
        this.loadNearbyPlaces()
      },
      fail: () => {
        wx.showToast({
          title: '获取位置失败，使用默认位置',
          icon: 'none'
        })
      }
    })
  },

  // 加载附近地点（模拟数据，实际应调用地图API）
  loadNearbyPlaces() {
    const mockPlaces = [
      {
        name: '三亚NCC社区·唯吾岛',
        address: '海南省三亚市崖州区崖城镇镇海村委会',
        distance: '距您200m',
        latitude: 18.2529,
        longitude: 109.5120
      },
      {
        name: '崖州古城',
        address: '海南省三亚市崖州区崖州路',
        distance: '距您500m',
        latitude: 18.2579,
        longitude: 109.5180
      },
      {
        name: '崖州湾',
        address: '海南省三亚市崖州区崖州湾',
        distance: '距您800m',
        latitude: 18.2479,
        longitude: 109.5070
      }
    ]
    
    this.setData({
      places: mockPlaces
    })
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      keyword: e.detail.value
    })
  },

  // 执行搜索
  onSearch() {
    if (!this.data.keyword) return
    
    this.setData({
      searchMode: true
    })
    
    // 模拟搜索（实际应调用地图API）
    const mockSearchResults = [
      {
        name: '搜索结果：' + this.data.keyword,
        address: '海南省三亚市崖州区',
        distance: '距您300m',
        latitude: 18.2529,
        longitude: 109.5120
      }
    ]
    
    this.setData({
      places: mockSearchResults
    })
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      keyword: '',
      searchMode: false
    })
    this.loadNearbyPlaces()
  },

  // 取消
  onCancel() {
    wx.navigateBack()
  },

  // 点击地图
  onMapTap(e) {
    // 在地图点击位置添加临时标记
    this.setData({
      selectedPlace: {
        name: '点击的位置',
        address: `纬度: ${e.detail.latitude.toFixed(4)}, 经度: ${e.detail.longitude.toFixed(4)}`,
        latitude: e.detail.latitude,
        longitude: e.detail.longitude
      }
    })
  },

  // 点击标记
  onMarkerTap(e) {
    const markerId = e.detail.markerId
    const place = this.data.places[markerId]
    if (place) {
      this.setData({
        selectedPlace: place
      })
    }
  },

  // 选择地点
  selectPlace(e) {
    const place = e.currentTarget.dataset.item
    this.setData({
      selectedPlace: place,
      latitude: place.latitude,
      longitude: place.longitude,
      markers: [{
        id: 0,
        latitude: place.latitude,
        longitude: place.longitude,
        title: place.name,
        iconPath: '/images/tabbar/home-active.png',
        width: 40,
        height: 50
      }]
    })
  },

  // 定位到当前位置
  onLocate() {
    this.getCurrentLocation()
  },

  // 确认选择
  onConfirm() {
    if (this.data.selectedPlace) {
      // 返回选中的地点
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      
      if (prevPage) {
        prevPage.setData({
          location: this.data.selectedPlace.address || this.data.selectedPlace.name,
          latitude: this.data.selectedPlace.latitude,
          longitude: this.data.selectedPlace.longitude
        })
        prevPage.checkCanPublish()
      }
      
      wx.navigateBack()
    }
  }
})