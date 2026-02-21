const postService = require('../../services/postService.js')

Page({
  data: {
    categories: [],
    currentTab: 'rec',
    posts: [],
    refreshing: false,
    showCommentModal: false,
    currentPostId: '',
    loading: false,
    hasMore: true
  },

  onLoad() {
    console.log('square.js onLoad')
    this.loadCategories()
    this.loadPosts()
  },

  onShow() {
    // 每次显示页面时刷新帖子列表
    this.loadPosts(true)
  },

  // 加载分类
  loadCategories() {
    postService.getCategories().then(categories => {
      this.setData({ categories })
    })
  },

  // 加载帖子列表
  loadPosts(refresh = false) {
    this.setData({ loading: true })
    
    postService.getPosts().then(posts => {
      console.log('加载帖子成功:', posts.length)
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

  // 点击帖子卡片
  onPostTap(e) {
    const postId = e.detail.postId
    console.log('点击帖子ID:', postId)
    
    wx.navigateTo({
      url: `/pages/square-detail/detail?id=${postId}`,
      fail: (err) => {
        console.error('跳转失败:', err)
        wx.showToast({
          title: '页面不存在',
          icon: 'none'
        })
      }
    })
  },

  // 点击作者
  onAuthorTap(e) {
    const { authorId } = e.detail
    wx.navigateTo({
      url: `/pages/profile/profile?id=${authorId}`
    })
  },

  // 点赞
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

  // 收藏
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

  // 打开评论弹窗
  onPostComment(e) {
    const { postId } = e.detail
    this.setData({
      showCommentModal: true,
      currentPostId: postId
    })
  },

  // 关闭评论弹窗
  onCloseCommentModal() {
    this.setData({ showCommentModal: false })
  },

  // 评论弹窗点击头像
  onCommentAvatarTap(e) {
    const { userId } = e.detail
    wx.navigateTo({
      url: `/pages/profile/profile?id=${userId}`
    })
  },

  // 切换分类
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
    
    // 重新加载帖子，可以按分类筛选
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
      } else if (tab === 'samecity') {
        wx.showToast({ 
          title: '同城功能开发中', 
          icon: 'none' 
        })
        return
      }
      
      this.setData({ posts: filteredPosts })
    })
  },

  // 搜索
  onSearch() {
    wx.navigateTo({
      url: '/pages/square-search/square-search'
    })
  },

  // 发布
  onPublish() {
    wx.navigateTo({
      url: '/pages/publish/publish'
    })
  },

  // 下拉刷新
  onRefresh() {
    this.setData({ refreshing: true })
    this.loadPosts(true)
  },

  // 上拉加载更多
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