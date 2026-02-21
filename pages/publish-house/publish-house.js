const houseService = require('../../services/houseService.js')

Page({
  data: {
    // 表单数据
    title: '',
    coverImage: '',
    images: [],
    location: '',
    latitude: '',
    longitude: '',
    price: '',
    description: '',
    tags: [],
    tagInput: '',
    
    // 设施选项
    facilityOptions: ['WiFi', '工位', '厨房', '洗衣机', '空调', '投影', '停车', '泳池', '庭院', '宠物友好'],
    selectedFacilities: [],
    
    // 发布状态
    canPublish: false
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({ title: e.detail.value })
    this.checkCanPublish()
  },

  // 选择封面图
  chooseCover() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          coverImage: res.tempFilePaths[0]
        })
        this.checkCanPublish()
      }
    })
  },

  // 删除封面
  removeCover() {
    this.setData({ coverImage: '' })
    this.checkCanPublish()
  },

  // 选择多图
  chooseImages() {
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

  // 删除图片
  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images.filter((_, i) => i !== index)
    this.setData({ images })
  },

  // 打开地图选点
  openMapPicker() {
    wx.navigateTo({
      url: '/pages/map-picker/map-picker'
    })
  },

  // 价格输入
  onPriceInput(e) {
    this.setData({ price: e.detail.value })
    this.checkCanPublish()
  },

  // 设施选择
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

  // 房源介绍
  onDescInput(e) {
    this.setData({ description: e.detail.value })
    this.checkCanPublish()
  },

  // 标签输入
  onTagInput(e) {
    this.setData({ tagInput: e.detail.value })
  },

  // 添加标签
  addTag(e) {
    const tag = this.data.tagInput.trim()
    if (tag && this.data.tags.length < 5) {
      this.setData({
        tags: [...this.data.tags, tag],
        tagInput: ''
      })
    }
  },

  // 删除标签
  removeTag(e) {
    const index = e.currentTarget.dataset.index
    const tags = this.data.tags.filter((_, i) => i !== index)
    this.setData({ tags })
  },

  // 清除位置
  clearLocation() {
    this.setData({
      location: '',
      latitude: '',
      longitude: ''
    })
    this.checkCanPublish()
  },

  // 检查是否可以发布
  checkCanPublish() {
    const canPublish = 
      this.data.title.trim() !== '' &&
      this.data.coverImage !== '' &&
      this.data.location !== '' &&
      this.data.price !== '' &&
      this.data.description.trim() !== ''
    
    this.setData({ canPublish })
  },

  // 提交表单
  onSubmit(e) {
    if (!this.data.canPublish) {
      wx.showToast({
        title: '请填写必填项',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '发布中...'
    })

    // 构建房源数据（注意：去掉手动生成的 id，让云数据库自动生成 _id）
    const houseData = {
      title: this.data.title,
      price: parseInt(this.data.price),
      unit: '天',
      location: this.data.location,
      latitude: this.data.latitude || 18.2529,
      longitude: this.data.longitude || 109.5120,
      image: this.data.coverImage,
      images: [this.data.coverImage, ...this.data.images],
      facilities: this.data.selectedFacilities,
      tags: this.data.tags,
      description: this.data.description,
      rating: 5.0,
      commentCount: 0,
      distance: '距您未知',
      host: {
        id: 'currentUser',
        name: '当前用户',
        avatar: 'https://picsum.photos/100/100?random=999',
        identity: '数字游民',
        desc: '房东'
      },
      reviews: [],
      isFavorite: false
    }

    // 调用云数据库服务发布房源
    houseService.publishHouse(houseData).then(houseId => {
      wx.hideLoading()
      console.log('发布成功，文档ID:', houseId)
      
      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 1500,
        success: () => {
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      })
    }).catch(err => {
      wx.hideLoading()
      console.error('发布失败:', err)
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      })
    })
  }
})