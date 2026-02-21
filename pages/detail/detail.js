const houseService = require('../../services/houseService.js')
const reviewService = require('../../services/reviewService.js')

Page({
  data: {
    house: null,
    facilityIcons: ['Wi-Fi', '💻', '🍳', '🧺', '🚿', '🧊', '🎵', '🏊'],
    ratingStats: null,
    loading: true
  },

  onLoad(options) {
    const houseId = options.id
    console.log('房源详情页接收参数:', options)
    
    if (!houseId) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      return
    }
    
    this.loadHouseDetail(houseId)
  },

  onShow() {
    if (this.data.house && this.data.house._id) {
      this.loadHouseDetail(this.data.house._id)
    }
  },

  loadHouseDetail(id) {
    this.setData({ loading: true })
    
    Promise.all([
      houseService.getHouseById(id),
      reviewService.getReviewStats(id)
    ]).then(([house, stats]) => {
      console.log('获取到房源数据:', house)
      console.log('评价统计:', stats)
      
      this.setData({ 
        house: house,
        ratingStats: stats,
        loading: false
      })
    }).catch(err => {
      console.error('加载失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    })
  },

  previewImage(e) {
    const index = e.currentTarget.dataset.index
    wx.previewImage({
      current: this.data.house.images[index],
      urls: this.data.house.images
    })
  },

  onFavorite() {
    this.setData({
      'house.isFavorite': !this.data.house.isFavorite
    })
    wx.showToast({
      title: this.data.house.isFavorite ? '已收藏' : '已取消',
      icon: 'success'
    })
  },

  onMap() {
    const house = this.data.house
    wx.showActionSheet({
      itemList: ['查看地图', '开始导航'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.openLocation({
            latitude: house.latitude || 18.2529,
            longitude: house.longitude || 109.5120,
            name: house.title,
            address: house.location
          })
        } else if (res.tapIndex === 1) {
          wx.openLocation({
            latitude: house.latitude || 18.2529,
            longitude: house.longitude || 109.5120,
            name: house.title,
            address: house.location,
            scale: 18
          })
        }
      }
    })
  },

  onContact() {
    const house = this.data.house
    wx.showActionSheet({
      itemList: ['发消息', '打电话'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.navigateTo({
            url: `/pages/message/chat?userId=${house.host?.id}&name=${house.host?.name}`
          })
        } else if (res.tapIndex === 1) {
          wx.makePhoneCall({
            phoneNumber: '13800138000'
          })
        }
      }
    })
  },

  onCustomerService() {
    wx.showToast({
      title: '客服功能开发中',
      icon: 'none'
    })
  },

  // ✅ 修复：用 _id 跳转
  onViewAllReviews() {
    wx.navigateTo({
      url: `/pages/reviews/reviews?id=${this.data.house._id}`
    })
  },

  onReviewImageTap(e) {
    const { images, index } = e.currentTarget.dataset
    wx.previewImage({
      current: images[index],
      urls: images
    })
  },

  onLikeReview(e) {
    const reviewId = e.currentTarget.dataset.id
    wx.showToast({
      title: '点赞功能开发中',
      icon: 'none'
    })
  },

  onReplyReview(e) {
    const reviewId = e.currentTarget.dataset.id
    wx.showToast({
      title: '回复功能开发中',
      icon: 'none'
    })
  },

  // ✅ 修复：用 _id 跳转
  onBook() {
    wx.navigateTo({
      url: `/pages/booking/booking?id=${this.data.house._id}`
    })
  },

  // ✅ 修复：用 _id 跳转
  onWriteReview() {
    wx.navigateTo({
      url: `/pages/write-review/write-review?id=${this.data.house._id}`
    })
  },

  onShare() {
    wx.showActionSheet({
      itemList: ['分享给朋友', '分享到朋友圈'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.onShareAppMessage()
        } else if (res.tapIndex === 1) {
          this.onShareTimeline()
        }
      }
    })
  },

  onShareAppMessage() {
    const house = this.data.house
    return {
      title: house?.title || '房源详情',
      path: `/pages/detail/detail?id=${house?._id}`,
      imageUrl: house?.images?.[0] || '/images/share-default.png'
    }
  },

  onShareTimeline() {
    const house = this.data.house
    return {
      title: house?.title || '房源详情',
      query: `id=${house?._id}`,
      imageUrl: house?.images?.[0] || '/images/share-default.png'
    }
  }
})