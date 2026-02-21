const reviewService = require('../../services/reviewService.js')

Page({
  data: {
    houseId: '',
    currentFilter: 'all',
    reviews: [],
    ratingSummary: {
      average: 0,
      total: 0,
      imageCount: 0,
      distribution: [],
      starCounts: {}
    },
    pageNum: 1,
    pageSize: 10,
    hasMore: true,
    refreshing: false,
    loading: false
  },

  onLoad(options) {
    console.log('评价列表页接收参数:', options)
    const houseId = options.id
    
    if (!houseId) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      return
    }
    
    this.setData({ houseId })
    this.loadReviews()
  },

  loadReviews(refresh = false) {
    if (this.data.loading) return
    this.setData({ loading: true })
    
    reviewService.getReviewsByHouse(this.data.houseId).then(reviews => {
      console.log('获取到评价数据:', reviews)
      
      let filteredReviews = [...reviews]
      if (this.data.currentFilter !== 'all') {
        if (this.data.currentFilter === 'image') {
          filteredReviews = filteredReviews.filter(item => item.images && item.images.length > 0)
        } else {
          const starFilter = parseInt(this.data.currentFilter)
          filteredReviews = filteredReviews.filter(item => item.rating === starFilter)
        }
      }
      
      this.setData({
        reviews: filteredReviews,
        loading: false,
        refreshing: false
      })
      
      this.calculateRatingSummary(reviews)
    }).catch(err => {
      console.error('加载评价失败:', err)
      this.setData({ loading: false, refreshing: false })
    })
  },

  calculateRatingSummary(reviews) {
    const total = reviews.length
    let sum = 0
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    let imageCount = 0
    
    reviews.forEach(item => {
      sum += item.rating
      starCounts[item.rating]++
      if (item.images && item.images.length > 0) {
        imageCount++
      }
    })
    
    const average = total > 0 ? (sum / total).toFixed(1) : 0
    
    const distribution = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: starCounts[star],
      percentage: total > 0 ? ((starCounts[star] / total) * 100).toFixed(1) : 0
    }))
    
    this.setData({
      ratingSummary: {
        average,
        total,
        imageCount,
        distribution,
        starCounts
      }
    })
  },

  setFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      currentFilter: filter,
      pageNum: 1,
      hasMore: true
    })
    this.loadReviews(true)
  },

  onLike(e) {
    console.log('点赞评价:', e.currentTarget.dataset.id)
  },

  onReply(e) {
    const reviewId = e.currentTarget.dataset.id
    wx.showModal({
      title: '回复评价',
      editable: true,
      placeholderText: '请输入回复内容',
      success: (res) => {
        if (res.confirm && res.content) {
          wx.showToast({
            title: '回复成功',
            icon: 'success'
          })
        }
      }
    })
  },

  onShare() {
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    })
  },

  onUserTap(e) {
    const userId = e.currentTarget.dataset.userId
    wx.navigateTo({
      url: `/pages/profile/profile?id=${userId}`
    })
  },

  onImageTap(e) {
    const { index, images } = e.currentTarget.dataset
    wx.previewImage({
      current: images[index],
      urls: images
    })
  },

  onWriteReview() {
    wx.navigateTo({
      url: `/pages/write-review/write-review?id=${this.data.houseId}`
    })
  },

  onRefresh() {
    this.setData({ refreshing: true })
    this.loadReviews(true)
  },

  onLoadMore() {
    if (this.data.hasMore) {
      this.loadReviews()
    }
  }
})