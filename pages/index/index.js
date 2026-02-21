const houseService = require('../../services/houseService.js')

Page({
  data: {
    banners: [
      { title: '暖冬必选', desc: '三亚·NCC社区', color: 'linear-gradient(135deg, #ff9a9e, #fad0c4)' },
      { title: '数字游民基地', desc: '海南环岛据点', color: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)' },
      { title: '硬件顶配', desc: '出门就是海', color: 'linear-gradient(135deg, #84fab0, #8fd3f4)' }
    ],
    categories: [
      { icon: '🔥', name: '热门' },
      { icon: '🏖️', name: '海岛' },
      { icon: '🏔️', name: '山居' },
      { icon: '🏙️', name: '城市' }
    ],
    // 地区选择相关
    regions: ['全部', '三亚', '大理', '黄山', '北京', '上海', '深圳', '成都', '杭州', '厦门', '青岛', '西安'],
    currentRegion: '全部',
    showRegionModal: false,
    
    houses: [],
    loading: true
  },

  onLoad() {
    this.loadRecommendedHouses()
  },

  onShow() {
    this.loadRecommendedHouses()
  },

  // 显示地区选择弹窗
  showRegionPicker() {
    this.setData({ showRegionModal: true })
  },

  hideRegionPicker() {
    this.setData({ showRegionModal: false })
  },

  // 选择地区
  selectRegion(e) {
    const region = e.currentTarget.dataset.region
    this.setData({ 
      currentRegion: region,
      showRegionModal: false 
    })
    this.loadRecommendedHouses()
  },

  // 从云数据库获取推荐房源
  loadRecommendedHouses() {
    this.setData({ loading: true })
    
    houseService.getHouseList().then(houses => {
      console.log('获取到房源数据:', houses)
      
      // 1. 按地区筛选
      let filtered = houses
      if (this.data.currentRegion !== '全部') {
        filtered = houses.filter(house => 
          house.location && house.location.includes(this.data.currentRegion)
        )
      }
      
      // 2. 按点赞量排序
      const sorted = filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0))
      
      // 3. 取前6个
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

  // ✅ 搜索 - 跳转到搜索页
  onSearch() {
    console.log('点击搜索框，跳转到搜索页')
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },

  // 发布房源
  onPublishHouse() {
    wx.navigateTo({
      url: '/pages/publish-house/publish-house'
    })
  },

  // 筛选
  onFilter() {
    wx.navigateTo({
      url: '/pages/listing/listing'
    })
  },

  // 点击轮播图
  onBannerTap(e) {
    const index = e.currentTarget.dataset.index
    const banner = this.data.banners[index]
    
    wx.showToast({
      title: `查看活动: ${banner.title}`,
      icon: 'none'
    })
  },

  // 点击分类
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    
    wx.showToast({
      title: `查看${category}房源`,
      icon: 'none'
    })
    
    wx.navigateTo({
      url: `/pages/listing/listing?category=${category}`
    })
  },

  // 点击房源卡片
  onHouseTap(e) {
    const id = e.currentTarget.dataset.id
    console.log('点击房源ID:', id)
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  // 点击查看更多
  onViewAll() {
    wx.navigateTo({
      url: '/pages/listing/listing'
    })
  },

  // 跳转到管理员后台
  goToAdmin() {
    wx.navigateTo({
      url: '/pages/admin/index'
    })
  }
})