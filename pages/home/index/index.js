const houseService = require('../../../services/houseService.js')

Page({
  data: {
    theme: 'light',
    elderMode: false,
    banners: [
      { title: '暖冬必选', desc: '三亚·NCC社区', image: 'https://picsum.photos/600/300?random=1' },
      { title: '数字游民基地', desc: '海南环岛据点', image: 'https://picsum.photos/600/300?random=2' },
      { title: '硬件顶配', desc: '出门就是海', image: 'https://picsum.photos/600/300?random=3' }
    ],
    categories: [
      { icon: '🔥', name: '热门', iconSrc: '/images/icons/category/火焰-copy.png' },
      { icon: '🏖️', name: '海岛', iconSrc: '/images/icons/category/海岛.png' },
      { icon: '🏔️', name: '山居', iconSrc: '/images/icons/category/山峰.png' },
      { icon: '🏘️', name: '古镇', iconSrc: '/images/icons/category/古镇民俗.png' },
      { icon: '🌾', name: '田园', iconSrc: '/images/icons/category/田野.png' }
    ],
    regions: ['全部', '三亚', '大理', '黄山', '北京', '上海', '深圳', '成都', '杭州', '厦门', '青岛', '西安'],
    currentRegion: '全部',
    showRegionModal: false,
    houses: [],
    loading: true
  },

  onLoad() {
    // 获取全局主题设置
    const app = getApp()
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false
    })
    this.loadRecommendedHouses()
  },

  onShow() {
    // 更新主题设置
    const app = getApp()
    this.setData({
      theme: app.globalData.theme,
      elderMode: app.globalData.elderMode
    })
    this.loadRecommendedHouses()
  },

  showRegionPicker() {
    this.setData({ showRegionModal: true })
  },

  hideRegionPicker() {
    this.setData({ showRegionModal: false })
  },

  selectRegion(e) {
    const region = e.currentTarget.dataset.region
    this.setData({ 
      currentRegion: region,
      showRegionModal: false 
    })
    this.loadRecommendedHouses()
  },

  loadRecommendedHouses() {
    this.setData({ loading: true })
    
    houseService.getHouseList().then(houses => {
      let filtered = houses
      if (this.data.currentRegion !== '全部') {
        filtered = houses.filter(house => 
          house.location && house.location.includes(this.data.currentRegion)
        )
      }
      
      const sorted = filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0))
      const recommended = sorted.slice(0, 6).map(house => ({
        id: house._id,
        title: house.title,
        location: house.location,
        price: house.price,
        unit: house.unit || '天',
        image: house.image || 'https://picsum.photos/200/200?random=1',
        tags: house.tags || [],
        likes: house.likes || 0
      }))
      
      this.setData({ 
        houses: recommended,
        loading: false
      })
    }).catch(err => {
      console.error('加载房源失败:', err)
      this.setData({ loading: false })
    })
  },

  onSearch() {
    wx.navigateTo({
      url: '/pages/home/search/search'
    })
  },

  onPublishHouse() {
    wx.navigateTo({
      url: '/pages/house/publish/publish'
    })
  },

  onFilter() {
    wx.navigateTo({
      url: '/pages/house/listing/listing'
    })
  },

  onBannerTap(e) {
    const index = e.currentTarget.dataset.index
    const banner = this.data.banners[index]
    wx.showToast({
      title: `查看活动: ${banner.title}`,
      icon: 'none'
    })
  },

  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    wx.showToast({
      title: `查看${category}房源`,
      icon: 'none'
    })
    wx.navigateTo({
      url: `/pages/house/listing/listing?category=${category}`
    })
  },

  onHouseTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/house/detail/detail?id=${id}`
    })
  },

  onViewAll() {
    wx.navigateTo({
      url: '/pages/house/listing/listing'
    })
  },

  goToAdmin() {
    wx.navigateTo({
      url: '/pages/admin/index'
    })
  }
})