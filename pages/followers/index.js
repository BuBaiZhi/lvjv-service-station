const followService = require('../../services/followService.js')
const nav = require('../../utils/navigation.js')

Page({
  data: {
    userId: null,              // 目标用户 ID（如果有的话）
    followerList: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    empty: false,
    theme: 'light',
    elderMode: false
  },

  onLoad(options) {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false,
      userId: options.userId || null  // 如果传了 userId，则查看他人的粉丝列表
    })
    
    this.loadFollowerList()
  },

  onShow() {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme,
      elderMode: app.globalData.elderMode
    })
  },

  // 加载粉丝列表
  async loadFollowerList() {
    if (this.data.loading || !this.data.hasMore) return
    
    this.setData({ loading: true })
    
    try {
      const list = await followService.getFollowerList(this.data.page, this.data.pageSize)
      
      if (this.data.page === 1) {
        this.setData({
          followerList: list,
          empty: list.length === 0,
          hasMore: list.length === this.data.pageSize
        })
      } else {
        this.setData({
          followerList: [...this.data.followerList, ...list],
          hasMore: list.length === this.data.pageSize
        })
      }
      
      console.log('[Followers] 加载粉丝列表:', list.length, '条')
    } catch (error) {
      console.error('[Followers] 加载粉丝列表失败:', error)
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.loadFollowerList()
    wx.stopPullDownRefresh()
  },

  // 上拉加载
  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 })
      this.loadFollowerList()
    }
  },

  // 关注粉丝
  async follow(e) {
    const followerId = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index
    
    try {
      await followService.follow(followerId)
      
      // 更新列表项状态
      const list = this.data.followerList
      list[index].isFollowing = true
      this.setData({ followerList: list })
      
      wx.showToast({
        title: '已关注',
        icon: 'success'
      })
    } catch (error) {
      console.error('[Followers] 关注失败:', error)
      wx.showToast({
        title: '关注失败',
        icon: 'none'
      })
    }
  },

  // 进入用户主页
  goToUserDetail(e) {
    const userId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/user-detail/index?userId=${userId}`
    })
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack()
  }
})
