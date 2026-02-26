const postService = require('../../services/postService.js')

Page({
  data: {
    theme: 'light',
    elderMode: false,
    categories: [],
    currentTab: 'rec',
    posts: [],
    refreshing: false,
    showCommentModal: false,
    currentPostId: '',
    loading: false,
    hasMore: true,
    currentRegion: '全部',
    regions: ['全部', '北京', '上海', '深圳', '杭州', '成都', '三亚', '大理', '黄山'],
    showRegionModal: false,
    showMoreFilterModal: false,
    filterType: 'all',
    filterTime: 'all',
    filterImage: 'all'
  },

  onLoad() {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false
    })
    this.loadCategories()
    this.loadPosts()
  },

  onShow() {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme,
      elderMode: app.globalData.elderMode
    })
    this.loadPosts(true)
  },

  loadCategories() {
    postService.getCategories().then(categories => {
      this.setData({ categories })
    })
  },

  loadPosts(refresh = false) {
    this.setData({ loading: true })
    
    postService.getPosts().then(posts => {
      this.setData({ 
        posts: posts,
        loading: false,
        refreshing: false
      })
    }).catch(err => {
      console.error('加载帖子失败:', err)
      this.setData({ loading: false, refreshing: false })
    })
  },

  onPostTap(e) {
    const postId = e.detail.postId
    wx.navigateTo({
      url: `/pages/square-detail/detail?id=${postId}`
    })
  },

  onAuthorTap(e) {
    const { authorId } = e.detail
    wx.navigateTo({
      url: `/pages/profile/profile?id=${authorId}`
    })
  },

  onPostLike(e) {
    const { postId, isLiked, likes } = e.detail
    const posts = this.data.posts.map(item => {
      if (item._id === postId) {
        item.isLiked = isLiked
        item.likes = likes
      }
      return item
    })
    this.setData({ posts })
    wx.showToast({
      title: isLiked ? '点赞成功' : '取消点赞',
      icon: 'none'
    })
  },

  onPostCollect(e) {
    const { postId, isCollected } = e.detail
    const posts = this.data.posts.map(item => {
      if (item._id === postId) {
        item.isCollected = isCollected
      }
      return item
    })
    this.setData({ posts })
    wx.showToast({
      title: isCollected ? '收藏成功' : '取消收藏',
      icon: 'success'
    })
  },

  onPostComment(e) {
    const { postId } = e.detail
    this.setData({
      showCommentModal: true,
      currentPostId: postId
    })
  },

  onCloseCommentModal() {
    this.setData({ showCommentModal: false })
  },

  onCommentAvatarTap(e) {
    const { userId } = e.detail
    wx.navigateTo({
      url: `/pages/profile/profile?id=${userId}`
    })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
    postService.getPosts().then(allPosts => {
      let filteredPosts = [...allPosts]
      if (tab === 'partner') {
        filteredPosts = filteredPosts.filter(item => item.type === '找搭子')
      } else if (tab === 'latest') {
        filteredPosts = filteredPosts.sort((a, b) => {
          if (a.time && a.time.includes('刚刚')) return -1
          if (b.time && b.time.includes('刚刚')) return 1
          return 0
        })
      }
      this.setData({ posts: filteredPosts })
    })
  },

  showRegionPicker() {
    this.setData({ showRegionModal: true })
  },

  hideRegionPicker() {
    this.setData({ showRegionModal: false })
  },

  selectRegion(e) {
    const region = e.currentTarget.dataset.region
    this.setData({ 
      currentRegion: region,
      showRegionModal: false 
    })
    // 这里可以按地区筛选
  },

  showMoreFilter() {
    this.setData({ showMoreFilterModal: true })
  },

  hideMoreFilter() {
    this.setData({ showMoreFilterModal: false })
  },

  onSearch() {
    wx.navigateTo({
      url: '/pages/square-search/square-search'
    })
  },

  onPublish() {
    wx.navigateTo({
      url: '/pages/publish/publish'
    })
  },

  onRefresh() {
    this.setData({ refreshing: true })
    this.loadPosts(true)
  },

  onLoadMore() {
    if (this.data.hasMore) {
      this.setData({ loading: true })
      setTimeout(() => {
        this.setData({ 
          hasMore: false, 
          loading: false 
        })
      }, 500)
    }
  }
})