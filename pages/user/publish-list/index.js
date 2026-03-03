// 我的发布页面
const app = getApp()
const postService = require('../../../services/postService.js')

Page({
  data: {
    theme: 'light',
    appVersion: 'standard',
    activeTab: 'all',
    publishList: [],
    filteredList: [],
    loading: false
  },

  async onLoad() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    await this.loadPublishList()
  },

  onShow() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    this.loadPublishList()
  },

  // 加载发布列表
  async loadPublishList() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      const openid = wx.getStorageSync('openid')
      console.log('[PublishList] 加载用户发布，openid:', openid)
      
      let publishList
      
      if (openid) {
        // 获取当前用户的发布列表
        publishList = await postService.getUserPosts(openid, 1, 50)
      } else {
        // 没有 openid 时，获取所有帖子（调试用）
        console.log('[PublishList] 无 openid，获取所有帖子')
        publishList = await postService.getPosts()
      }
      
      console.log('[PublishList] 原始数据:', publishList)
      
      // 格式化数据
      const formattedList = publishList.map(item => {
        // 确定类型：优先使用 _type，否则使用 type
        const itemType = item._type || item.type || 'post'
        return {
          id: item._id || item.id,
          title: item.title || item.name || '无标题',
          type: itemType,
          typeText: this.getTypeText(itemType),
          status: item.status || 'active',
          views: item.views || item.viewCount || 0,
          likes: item.likes || 0,
          date: item.createTime ? this.formatDate(item.createTime) : '未知',
          image: item.coverImage || item.image || item.images?.[0] || 'https://picsum.photos/400/300?random=10'
        }
      })

      this.setData({ 
        publishList: formattedList,
        filteredList: formattedList,
        empty: formattedList.length === 0
      })
      
      console.log('[PublishList] 加载成功:', formattedList.length, '条')
    } catch (error) {
      console.error('[PublishList] 加载失败:', error)
      this.setData({ 
        publishList: [],
        filteredList: [],
        empty: true
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 获取类型文本
  getTypeText(type) {
    const typeMap = {
      'house': '房源',
      'post': '帖子',
      'activity': '活动',
      'skill': '技能',
      'share': '分享'
    }
    return typeMap[type] || '帖子'
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return '未知'
    if (typeof date === 'string') return date.substring(0, 10)
    if (date.toISOString) return date.toISOString().substring(0, 10)
    return '未知'
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    
    // 根据分类筛选（type 字段）
    if (tab === 'all') {
      this.setData({ filteredList: this.data.publishList })
    } else {
      const filtered = this.data.publishList.filter(item => item.type === tab)
      this.setData({ filteredList: filtered })
    }
  },

  // 查看详情
  viewDetail(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.filteredList.find(i => i.id === id)
    
    if (!item) {
      wx.showToast({ title: '内容不存在', icon: 'none' })
      return
    }
    
    // 根据类型跳转到不同详情页
    if (item.type === 'house') {
      wx.navigateTo({ url: `/pages/house/detail/detail?id=${id}` })
    } else {
      wx.navigateTo({ url: `/pages/square/detail/detail?id=${id}` })
    }
  },

  // 编辑发布
  editPublish(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.filteredList.find(i => i.id === id)
    
    if (!item) {
      wx.showToast({ title: '内容不存在', icon: 'none' })
      return
    }
    
    // 根据类型跳转到不同的编辑页面
    if (item.type === 'house') {
      wx.navigateTo({ url: `/pages/house/publish/publish?id=${id}&mode=edit` })
    } else {
      wx.navigateTo({ url: `/pages/square/publish/publish?id=${id}&mode=edit` })
    }
  },

  // 删除发布
  deletePublish(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条发布吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 新增发布
  addPublish() {
    wx.showActionSheet({
      itemList: ['发布房源', '发布帖子'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.navigateTo({ url: '/pages/house/publish/publish' })
        } else if (res.tapIndex === 1) {
          wx.navigateTo({ url: '/pages/square/publish/publish' })
        }
      }
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})
