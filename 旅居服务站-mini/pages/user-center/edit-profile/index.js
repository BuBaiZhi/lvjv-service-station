// 编辑资料页面
const app = getApp()

Page({
  data: {
    theme: 'light',
    appVersion: 'standard',
    userInfo: {
      avatar: 'https://picsum.photos/200/200?random=10',
      nickname: '旅行者',
      gender: 'male',
      age: '13',
      phone: '',
      signature: '',
      identity: 'villager',
      id: 2123,
      background: ''
    },
    // 背景类型: 'gradient'(渐变) 或 'image'(图片)
    backgroundType: 'gradient',
    // 预设渐变背景
    presetGradients: [
      { name: '紫色梦幻', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { name: '绿色清新', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
      { name: '橙色活力', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { name: '蓝色海洋', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
      { name: '粉色浪漫', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
      { name: '金色夕阳', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' }
    ]
  },

  onLoad() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    // 加载用户信息
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo() {
    // 从本地存储或全局数据获取用户信息
    const userInfo = wx.getStorageSync('userInfo') || this.data.userInfo
    this.setData({ userInfo })
  },

  // 修改头像
  changeAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.setData({
          'userInfo.avatar': tempFilePath
        })
      }
    })
  },

  // 更换背景
  changeBackground() {
    wx.showActionSheet({
      itemList: ['选择预设背景', '上传自定义背景', '恢复默认背景'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 预设背景
          this.showPresetBackgrounds()
        } else if (res.tapIndex === 1) {
          // 上传背景
          wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
              this.setData({
                'userInfo.background': res.tempFilePaths[0],
                backgroundType: 'image'
              })
              wx.showToast({ title: '背景已更新', icon: 'success' })
            }
          })
        } else if (res.tapIndex === 2) {
          // 恢复默认
          this.setData({
            'userInfo.background': '',
            backgroundType: 'gradient'
          })
          wx.showToast({ title: '已恢复默认', icon: 'success' })
        }
      }
    })
  },

  // 显示预设背景选择
  showPresetBackgrounds() {
    const presets = this.data.presetGradients
    const itemList = presets.map(item => item.name)
    
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        const selected = presets[res.tapIndex]
        this.setData({
          'userInfo.background': selected.gradient,
          backgroundType: 'gradient'
        })
        wx.showToast({ title: '背景已更新', icon: 'success' })
      }
    })
  },

  // 昵称输入
  onNicknameInput(e) {
    this.setData({
      'userInfo.nickname': e.detail.value
    })
  },

  // 选择性别
  selectGender(e) {
    const gender = e.currentTarget.dataset.gender
    this.setData({
      'userInfo.gender': gender
    })
  },

  // 年龄输入
  onAgeInput(e) {
    this.setData({
      'userInfo.age': e.detail.value
    })
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      'userInfo.phone': e.detail.value
    })
  },

  // 签名输入
  onSignatureInput(e) {
    this.setData({
      'userInfo.signature': e.detail.value
    })
  },

  // 保存资料
  saveProfile() {
    // 验证必填项
    if (!this.data.userInfo.nickname) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return
    }

    // 保存到本地存储
    wx.setStorageSync('userInfo', this.data.userInfo)
    
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500
    })

    // 延迟返回
    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})