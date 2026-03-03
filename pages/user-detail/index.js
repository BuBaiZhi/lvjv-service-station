const authModel = require('../../models/authModel.js')
const followService = require('../../services/followService.js')
const postService = require('../../services/postService.js')

Page({
  data: {
    userId: null,
    isOwnProfile: false,
    userInfo: null,
    isFollowing: false,
    contentList: [],
    activeTab: 'posts',
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    theme: 'light',
    elderMode: false
  },

  onLoad(options) {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false
    })
    
    // 获取目标用户 ID
    const userId = options.userId
    
    // 如果没有传 userId，则认为是自己的主页
    const isOwnProfile = !userId
    const currentUserId = userId || wx.getStorageSync('userId') || 'unknown'
    
    this.setData({ 
      userId: currentUserId,
      isOwnProfile: isOwnProfile
    })
    
    console.log('[UserDetail] onLoad:', { userId: currentUserId, isOwnProfile })
    
    this.loadUserInfo()
    this.loadContent()
  },

  onShow() {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme,
      elderMode: app.globalData.elderMode
    })
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const userInfo = await authModel.getCurrentUser(this.data.userId)
      
      if (userInfo) {
        this.setData({ userInfo })
      }
      
      // 如果不是自己的主页，检查是否已关注
      if (!this.data.isOwnProfile && this.data.userId) {
        const isFollowing = await followService.isFollowing(this.data.userId)
        this.setData({ isFollowing })
      }
      
      console.log('[UserDetail] 用户信息:', userInfo)
    } catch (error) {
      console.error('[UserDetail] 加载用户信息失败:', error)
    }
  },

  // 加载内容（帖子/发布）
  async loadContent() {
    if (this.data.loading || !this.data.hasMore) return
    
    this.setData({ loading: true })
    
    try {
      let list = []
      const userId = this.data.userId
      
      if (this.data.activeTab === 'posts') {
        // 获取用户的发布/帖子
        list = await postService.getUserPosts(userId, this.data.page, this.data.pageSize)
      } else if (this.data.activeTab === 'houses') {
        // 房源列表（需要实现 houseService.getUserHouses）
        // list = await houseService.getUserHouses(userId, this.data.page, this.data.pageSize)
        list = []
      }
      
      if (this.data.page === 1) {
        this.setData({
          contentList: list,
          hasMore: list.length === this.data.pageSize
        })
      } else {
        this.setData({
          contentList: [...this.data.contentList, ...list],
          hasMore: list.length === this.data.pageSize
        })
      }
      
      console.log('[UserDetail] 加载内容:', { tab: this.data.activeTab, count: list.length })
    } catch (error) {
      console.error('[UserDetail] 加载内容失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 上拉加载
  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 })
      this.loadContent()
    }
  },

  // 切换选项卡
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab,
      page: 1,
      hasMore: true,
      contentList: []
    })
    this.loadContent()
  },

  // 关注用户
  async followUser() {
    try {
      await followService.follow(this.data.userId)
      this.setData({ isFollowing: true })
      wx.showToast({
        title: '已关注',
        icon: 'success'
      })
    } catch (error) {
      console.error('[UserDetail] 关注失败:', error)
      wx.showToast({
        title: '关注失败',
        icon: 'none'
      })
    }
  },

  // 取消关注
  async unfollowUser() {
    wx.showModal({
      title: '取消关注',
      content: '确定要取消关注吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await followService.unfollow(this.data.userId)
            this.setData({ isFollowing: false })
            wx.showToast({
              title: '已取消关注',
              icon: 'success'
            })
          } catch (error) {
            console.error('[UserDetail] 取消关注失败:', error)
            wx.showToast({
              title: '取消关注失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 发送消息
  sendMessage() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 编辑资料（自己的主页）
  editProfile() {
    wx.navigateTo({
      url: '/pages/user/settings/index'
    })
  },

  // 进入粉丝列表
  goToFollowers() {
    if (!this.data.userId) return
    wx.navigateTo({
      url: `/pages/followers/index?userId=${this.data.userId}`
    })
  },

  // 进入关注列表
  goToFollowing() {
    if (!this.data.userId) return
    wx.navigateTo({
      url: `/pages/follows/index?userId=${this.data.userId}`
    })
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack()
  }
})
