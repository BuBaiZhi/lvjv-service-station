const houseService = require('../../../services/houseService.js')
const reviewService = require('../../../services/reviewService.js')

Page({
  data: {
    theme: 'light',
    elderMode: false,
    house: null,
    facilityIcons: ['Wi-Fi', '💻', '🍳', '🧺', '🚿', '🧊', '🎵', '🏊'],
    ratingStats: null,
    loading: true
  },

  onLoad(options) {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false
    })
    
    const houseId = options.id
    if (!houseId) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      return
    }
    this.loadHouseDetail(houseId)
  },

  onShow() {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme,
      elderMode: app.globalData.elderMode
    })
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
      this.setData({ 
        house: house,
        ratingStats: stats,
        loading: false
      })
    }).catch(err => {
      console.error('加载失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
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
            url: `/pages/user/message/chat?userId=${house.host?.id}&name=${house.host?.name}`
          })
        } else if (res.tapIndex === 1) {
          wx.makePhoneCall({ phoneNumber: '13800138000' })
        }
      }
    })
  },

  onCustomerService() {
    wx.showToast({ title: '客服功能开发中', icon: 'none' })
  },

  onViewAllReviews() {
    wx.navigateTo({
      url: `/pages/square/reviews/reviews?id=${this.data.house._id}`
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
    const reviews = this.data.house.reviews.map(item => {
      if (item.id === reviewId) {
        item.isLiked = !item.isLiked
        item.likeCount = item.isLiked ? (item.likeCount || 0) + 1 : (item.likeCount || 1) - 1
      }
      return item
    })
    this.setData({ 'house.reviews': reviews })
    wx.showToast({ title: '点赞成功', icon: 'success' })
  },

  onReplyReview(e) {
    const reviewId = e.currentTarget.dataset.id
    wx.showModal({
      title: '回复评价',
      editable: true,
      placeholderText: '写下你的回复...',
      success: (res) => {
        if (res.confirm && res.content) {
          this.addReplyToReview(reviewId, res.content)
        }
      }
    })
  },

  addReplyToReview(reviewId, content) {
    const reviews = this.data.house.reviews.map(item => {
      if (item.id === reviewId) {
        if (!item.reply) {
          item.reply = content
          item.replyTime = '刚刚'
        }
      }
      return item
    })
    this.setData({ 'house.reviews': reviews })
    wx.showToast({ title: '回复成功', icon: 'success' })
  },

  onBook() {
    wx.navigateTo({
      url: `/pages/house/booking/booking?id=${this.data.house._id}`
    })
  },

  onWriteReview() {
    wx.navigateTo({
      url: `/pages/square/write-review/write-review?id=${this.data.house._id}`
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
      path: `/pages/house/detail/detail?id=${house?._id}`,
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