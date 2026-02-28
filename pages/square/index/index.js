const postService = require('../../../services/postService.js')

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
    const postId = e.currentTarget.dataset.id
    if (postId) {
      wx.navigateTo({
        url: `/pages/square/detail/detail?id=${postId}`
      })
    }
  },

  onAuthorTap(e) {
    const authorId = e.currentTarget.dataset.authorId
    if (authorId) {
      wx.navigateTo({
        url: `/pages/user/profile/profile?id=${authorId}`
      })
    }
  },

  onPostLike(e) {
    const { postId, isLiked, likes } = e.currentTarget.dataset
    const newIsLiked = !isLiked
    const newLikes = newIsLiked ? (likes || 0) + 1 : Math.max(0, (likes || 1) - 1)
    
    // 调用服务
    postService.likePost(postId, newIsLiked).then(() => {
      const posts = this.data.posts.map(item => {
        if (item._id === postId) {
          item.isLiked = newIsLiked
          item.likes = newLikes
        }
        return item
      })
      this.setData({ posts })
      wx.showToast({
        title: newIsLiked ? '点赞成功' : '取消点赞',
        icon: 'none'
      })
    }).catch(err => {
      console.error('点赞失败:', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    })
  },

  onPostCollect(e) {
    const { postId, isCollected } = e.currentTarget.dataset
    const newIsCollected = !isCollected
    
    // 调用服务
    postService.collectPost(postId, newIsCollected).then(() => {
      const posts = this.data.posts.map(item => {
        if (item._id === postId) {
          item.isCollected = newIsCollected
        }
        return item
      })
      this.setData({ posts })
      wx.showToast({
        title: newIsCollected ? '收藏成功' : '取消收藏',
        icon: 'success'
      })
    }).catch(err => {
      console.error('收藏失败:', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    })
  },

  onPostComment(e) {
    const { postId } = e.currentTarget.dataset
    // 跳转到详情页进行评论
    wx.navigateTo({
      url: `/pages/square/detail/detail?id=${postId}&focusComment=true`
    })
  },

  onShare(e) {
    // 触发微信分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '邻里广场 - 发现有趣的内容',
      path: '/pages/square/index/index'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '邻里广场 - 发现有趣的内容',
      query: ''
    }
  },

  onCloseCommentModal() {
    this.setData({ showCommentModal: false })
  },

  onCommentAvatarTap(e) {
    const { userId } = e.detail
    wx.navigateTo({
      url: `/pages/user/profile/profile?id=${userId}`
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
    this.applyFilters()
  },

  showMoreFilter() {
    this.setData({ showMoreFilterModal: true })
  },

  hideMoreFilter() {
    this.setData({ showMoreFilterModal: false })
  },

  setFilterType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ filterType: type })
  },

  setFilterTime(e) {
    const time = e.currentTarget.dataset.time
    this.setData({ filterTime: time })
  },

  setFilterImage(e) {
    const image = e.currentTarget.dataset.image
    this.setData({ filterImage: image })
  },

  resetFilter() {
    this.setData({
      filterType: 'all',
      filterTime: 'all',
      filterImage: 'all',
      currentRegion: '全部'
    })
    this.hideMoreFilter()
    this.applyFilters()
  },

  applyFilter() {
    this.hideMoreFilter()
    this.applyFilters()
  },

  applyFilters() {
    postService.getPosts().then(allPosts => {
      let filtered = [...allPosts]
      
      // 地区筛选
      if (this.data.currentRegion !== '全部') {
        filtered = filtered.filter(item => 
          item.location && item.location.includes(this.data.currentRegion)
        )
      }
      
      // 类型筛选
      if (this.data.filterType !== 'all') {
        filtered = filtered.filter(item => item.type === this.data.filterType)
      }
      
      // 图片筛选
      if (this.data.filterImage === 'has') {
        filtered = filtered.filter(item => item.images && item.images.length > 0)
      } else if (this.data.filterImage === 'no') {
        filtered = filtered.filter(item => !item.images || item.images.length === 0)
      }
      
      this.setData({ posts: filtered })
    })
  },

  onSearch() {
    wx.navigateTo({
      url: '/pages/square/search/search'
    })
  },

  onPublish() {
    wx.navigateTo({
      url: '/pages/square/publish/publish'
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