const postService = require('../../../services/postService.js')
const commentService = require('../../../services/commentService.js')

Page({
  data: {
    theme: 'light',
    elderMode: false,
    post: null,
    comments: [],
    relatedPosts: [],
    loading: true,
    inputValue: '',
    inputFocused: false,
    replyTo: null,
    replyToName: '',
    replyPlaceholder: '',
    currentPostId: '',
    commentSort: 'hot',
    userAvatar: 'https://picsum.photos/100/100?random=999',
    safeAreaBottom: 0
  },

  onLoad(options) {
    const app = getApp()
    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false,
      safeAreaBottom: systemInfo.screenHeight - systemInfo.safeArea.bottom
    })
    
    if (!options || !options.id) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      return
    }
    
    const postId = options.id
    this.setData({ loading: true, currentPostId: postId })
    this.loadData(postId)
    this.increaseViewCount(postId)
  },

  onShow() {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme,
      elderMode: app.globalData.elderMode
    })
  },

  loadData(postId) {
    Promise.all([
      postService.getPostById(postId),
      commentService.getComments(postId)
    ]).then(([post, comments]) => {
      this.loadRelatedPosts(post)
      this.setData({
        post,
        comments: this.sortComments(comments),
        loading: false
      })
    }).catch(err => {
      console.error('加载失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    })
  },

  loadRelatedPosts(currentPost) {
    postService.getPosts().then(posts => {
      const related = posts
        .filter(p => p._id !== currentPost._id)
        .filter(p => p.type === currentPost.type || 
               (p.tags && currentPost.tags && 
                p.tags.some(tag => currentPost.tags.includes(tag))))
        .slice(0, 5)
        .map(item => ({
          ...item,
          coverImage: item.image || (item.images && item.images[0]) || '/images/default-image.png',
          shortTitle: item.title || (item.content && item.content.slice(0, 20)) || '帖子'
        }))
      this.setData({ relatedPosts: related })
    })
  },

  increaseViewCount(postId) {
    postService.increaseViews(postId).catch(err => {
      console.error('增加浏览量失败:', err)
    })
  },

  sortComments(comments) {
    if (this.data.commentSort === 'hot') {
      return comments.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
    } else {
      return comments.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    }
  },

  toggleCommentSort() {
    const newSort = this.data.commentSort === 'hot' ? 'latest' : 'hot'
    this.setData({ commentSort: newSort })
    this.setData({ comments: this.sortComments(this.data.comments) })
  },

  refreshComments() {
    commentService.getComments(this.data.currentPostId).then(comments => {
      this.setData({ comments: this.sortComments(comments) })
    })
  },

  formatTime(time) {
    if (!time) return ''
    const now = new Date()
    const postTime = new Date(time)
    const diff = now - postTime
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return minutes + '分钟前'
    if (hours < 24) return hours + '小时前'
    if (days < 30) return days + '天前'
    return postTime.toLocaleDateString()
  },

  formatNumber(num) {
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num
  },

  onAuthorTap(e) {
    const authorId = e.currentTarget.dataset.authorId
    wx.navigateTo({ url: `/pages/user/profile/profile?id=${authorId}` })
  },

  onFollow() {
    const isFollowed = !this.data.post.isFollowed
    this.setData({ 'post.isFollowed': isFollowed })
    wx.showToast({ title: isFollowed ? '关注成功' : '取消关注', icon: 'none' })
  },

  onLike() {
    const isLiked = !this.data.post.isLiked
    const likes = isLiked ? this.data.post.likes + 1 : this.data.post.likes - 1
    this.setData({ 'post.isLiked': isLiked, 'post.likes': likes })
    postService.likePost(this.data.currentPostId, isLiked)
  },

  onCollect() {
    const isCollected = !this.data.post.isCollected
    const collects = isCollected ? (this.data.post.collects || 0) + 1 : (this.data.post.collects || 0) - 1
    this.setData({ 'post.isCollected': isCollected, 'post.collects': collects })
    wx.showToast({ title: isCollected ? '收藏成功' : '取消收藏', icon: 'success' })
    postService.collectPost(this.data.currentPostId, isCollected)
  },

  onComment() {
    // 兼容旧调用
    this.focusComment()
  },

  focusComment() {
    // 直接聚焦到输入框，不需要滚动
    this.setData({ inputFocused: true })
  },

  previewImage(e) {
    const { index, images } = e.currentTarget.dataset
    wx.previewImage({ current: images[index], urls: images })
  },

  onTagTap(e) {
    const tag = e.currentTarget.dataset.tag
    wx.navigateTo({ url: `/pages/square/index/index?tag=${tag}` })
  },

  onLikesList() {
    wx.showToast({ title: '点赞列表开发中', icon: 'none' })
  },

  onCollectsList() {
    wx.showToast({ title: '收藏列表开发中', icon: 'none' })
  },

  onMoreRelated() {
    wx.navigateTo({ url: `/pages/square/index/index?type=${this.data.post.type}` })
  },

  onRelatedTap(e) {
    const id = e.currentTarget.dataset.id
    wx.redirectTo({ url: `/pages/square/detail/detail?id=${id}` })
  },

  onCommentAvatarTap(e) {
    const userId = e.currentTarget.dataset.userId
    wx.navigateTo({ url: `/pages/user/profile/profile?id=${userId}` })
  },

  onReply(e) {
    const { id, name } = e.currentTarget.dataset
    this.setData({
      replyTo: id,
      replyToName: name,
      replyPlaceholder: `回复 ${name}:`
    })
    this.onComment()
  },

  onLikeComment(e) {
    const commentId = e.currentTarget.dataset.id
    const comments = this.data.comments.map(item => {
      if (item._id === commentId) {
        item.isLiked = !item.isLiked
        item.likeCount = item.isLiked ? (item.likeCount || 0) + 1 : (item.likeCount || 1) - 1
      }
      return item
    })
    this.setData({ comments })
    commentService.likeComment(this.data.currentPostId, commentId).catch(err => {
      console.error('点赞失败:', err)
    })
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value })
  },

  onInputBlur() {
    this.setData({ inputFocused: false })
  },

  onSendComment() {
    if (!this.data.inputValue.trim()) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }

    wx.showLoading({ title: '发送中...' })

    // 构建评论数据
    const commentData = {
      userId: 'currentUser',
      userName: '当前用户',
      avatar: this.data.userAvatar,
      content: this.data.inputValue
    }

    if (this.data.replyTo) {
      // 回复评论
      commentService.addReply(
        this.data.currentPostId,
        this.data.replyTo,
        {
          ...commentData,
          replyTo: this.data.replyToName
        }
      ).then(() => {
        this.onCommentSuccess(true)
      }).catch(err => {
        wx.hideLoading()
        console.error('回复失败:', err)
        wx.showToast({ title: '回复失败', icon: 'none' })
      })
    } else {
      // 新评论
      commentService.addComment(
        this.data.currentPostId,
        commentData
      ).then(() => {
        this.onCommentSuccess(false)
      }).catch(err => {
        wx.hideLoading()
        console.error('评论失败:', err)
        wx.showToast({ title: '评论失败', icon: 'none' })
      })
    }
  },

  onCommentSuccess(isReply) {
    wx.hideLoading()
    
    // 构建新评论/回复
    if (isReply) {
      // 添加回复到对应评论
      const comments = this.data.comments.map(item => {
        if (item._id === this.data.replyTo) {
          item.replies = item.replies || []
          item.replies.push({
            id: 'reply_' + Date.now(),
            userId: 'currentUser',
            userName: '当前用户',
            avatar: this.data.userAvatar,
            replyTo: this.data.replyToName,
            content: this.data.inputValue,
            createTime: new Date().toISOString()
          })
        }
        return item
      })
      this.setData({ comments })
    } else {
      // 添加新评论到列表顶部
      const newComment = {
        _id: 'comment_' + Date.now(),
        userId: 'currentUser',
        userName: '当前用户',
        avatar: this.data.userAvatar,
        identity: '村民',
        content: this.data.inputValue,
        likeCount: 0,
        isLiked: false,
        createTime: new Date().toISOString(),
        replies: []
      }
      this.setData({
        comments: [newComment, ...this.data.comments]
      })
    }

    // 清空输入
    this.setData({
      inputValue: '',
      replyTo: null,
      replyToName: '',
      replyPlaceholder: ''
    })

    // 更新评论数
    this.setData({ 'post.comments': this.data.post.comments + 1 })
    
    wx.showToast({ title: isReply ? '回复成功' : '评论成功', icon: 'success' })
  },

  onShare() {
    wx.showActionSheet({
      itemList: ['分享给朋友', '分享到朋友圈'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.onShareAppMessage()
        } else if (res.tapIndex === 1) {
          this.onShareTimeline()
        }
      }
    })
  },

  onShareAppMessage() {
    const post = this.data.post
    return {
      title: post.title || post.content.slice(0, 20),
      path: `/pages/square/detail/detail?id=${post._id}`,
      imageUrl: post.images && post.images[0] ? post.images[0] : '/images/share-default.png'
    }
  },

  onShareTimeline() {
    const post = this.data.post
    return {
      title: post.title || post.content.slice(0, 20),
      query: `id=${post._id}`,
      imageUrl: post.images && post.images[0] ? post.images[0] : '/images/share-default.png'
    }
  },

  onReport() {
    wx.showActionSheet({
      itemList: ['垃圾广告', '色情低俗', '虚假信息', '人身攻击', '其他问题'],
      success: (res) => {
        const reasons = ['垃圾广告', '色情低俗', '虚假信息', '人身攻击', '其他问题']
        const selectedReason = reasons[res.tapIndex]
        
        if (selectedReason === '其他问题') {
          wx.showModal({
            title: '举报',
            content: '请描述具体问题',
            editable: true,
            placeholderText: '请输入详细原因...',
            success: (modalRes) => {
              if (modalRes.confirm) {
                this.submitReport(selectedReason, modalRes.content)
              }
            }
          })
        } else {
          wx.showModal({
            title: '确认举报',
            content: `确定要举报该内容为"${selectedReason}"吗？`,
            success: (modalRes) => {
              if (modalRes.confirm) {
                this.submitReport(selectedReason)
              }
            }
          })
        }
      }
    })
  },

  submitReport(reason, detail = '') {
    wx.showLoading({ title: '提交中...' })
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({ title: '举报已提交', icon: 'success', duration: 2000 })
    }, 1000)
  }
})