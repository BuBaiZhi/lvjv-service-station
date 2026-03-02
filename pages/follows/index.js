const followService = require('../../services/followService.js')
const nav = require('../../utils/navigation.js')

Page({
  data: {
    userId: null,              // 目标用户 ID（如果有的话）
    followingList: [],
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
      userId: options.userId || null  // 如果传了 userId，则查看他人的关注列表
    })
    
    this.loadFollowingList()
  },

  onShow() {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme,
      elderMode: app.globalData.elderMode
    })
  },

  // 加载关注列表
  async loadFollowingList() {
    if (this.data.loading || !this.data.hasMore) return
    
    this.setData({ loading: true })
    
    try {
      const list = await followService.getFollowingList(this.data.page, this.data.pageSize)
      
      if (this.data.page === 1) {
        this.setData({
          followingList: list,
          empty: list.length === 0,
          hasMore: list.length === this.data.pageSize
        })
      } else {
        this.setData({
          followingList: [...this.data.followingList, ...list],
          hasMore: list.length === this.data.pageSize
        })
      }
      
      console.log('[Follows] 加载关注列表:', list.length, '条')
    } catch (error) {
      console.error('[Follows] 加载关注列表失败:', error)
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
    this.loadFollowingList()
    wx.stopPullDownRefresh()
  },

  // 上拉加载
  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 })
      this.loadFollowingList()
    }
  },

  // 取消关注
  async unfollow(e) {
    const followingId = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index
    
    wx.showModal({
      title: '取消关注',
      content: '确定要取消关注吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await followService.unfollow(followingId)
            
            // 删除列表中的该项
            const list = this.data.followingList
            list.splice(index, 1)
            this.setData({
              followingList: list,
              empty: list.length === 0
            })
            
            wx.showToast({
              title: '已取消关注',
              icon: 'success'
            })
          } catch (error) {
            console.error('[Follows] 取消关注失败:', error)
            wx.showToast({
              title: '取消关注失败',
              icon: 'none'
            })
          }
        }
      }
    })
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
