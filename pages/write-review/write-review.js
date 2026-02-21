const reviewService = require('../../services/reviewService.js')
const houseService = require('../../services/houseService.js')

Page({
  data: {
    houseId: '',
    houseInfo: null,
    rating: 0,
    content: '',
    images: [],
    isAnonymous: false,
    canSubmit: false
  },

  onLoad(options) {
    console.log('写评价页面接收参数:', options)
    const houseId = options.id
    
    if (!houseId) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      return
    }
    
    this.setData({ houseId })
    this.loadHouseInfo(houseId)
  },

  loadHouseInfo(houseId) {
    console.log('加载房源信息, ID:', houseId)
    
    houseService.getHouseById(houseId).then(house => {
      console.log('获取到房源信息:', house)
      this.setData({ houseInfo: house })
    }).catch(err => {
      console.error('加载房源信息失败:', err)
      wx.showToast({
        title: '加载房源信息失败',
        icon: 'none'
      })
    })
  },

  setRating(e) {
    const rating = e.currentTarget.dataset.star
    this.setData({ rating })
    this.checkCanSubmit()
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value })
    this.checkCanSubmit()
  },

  chooseImage() {
    wx.chooseImage({
      count: 9 - this.data.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          images: [...this.data.images, ...res.tempFilePaths]
        })
      }
    })
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images.filter((_, i) => i !== index)
    this.setData({ images })
  },

  toggleAnonymous(e) {
    this.setData({ isAnonymous: e.detail.value.length > 0 })
  },

  checkCanSubmit() {
    const canSubmit = this.data.rating > 0 && this.data.content.trim().length > 0
    this.setData({ canSubmit })
  },

  onSubmit() {
    if (!this.data.canSubmit) {
      wx.showToast({
        title: '请填写评分和评价内容',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '提交中...' })

    const reviewData = {
      houseId: this.data.houseId,
      userId: 'currentUser',
      userName: this.data.isAnonymous ? '匿名用户' : '当前用户',
      userAvatar: 'https://picsum.photos/100/100?random=999',
      rating: this.data.rating,
      content: this.data.content,
      images: this.data.images,
      time: '刚刚',
      likeCount: 0,
      isLiked: false
    }

    reviewService.addReview(reviewData).then(reviewId => {
      wx.hideLoading()
      console.log('评价成功，文档ID:', reviewId)
      
      wx.showToast({
        title: '评价成功',
        icon: 'success',
        duration: 1500,
        success: () => {
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2]
          if (prevPage && prevPage.loadHouseDetail) {
            prevPage.loadHouseDetail(this.data.houseId)
          }
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      })
    }).catch(err => {
      wx.hideLoading()
      console.error('评价失败:', err)
      wx.showToast({
        title: '评价失败',
        icon: 'none'
      })
    })
  }
})