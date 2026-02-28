Component({
  properties: {
    post: {
      type: Object,
      value: {}
    }
  },

  data: {
    isExpand: false
  },

  methods: {
    // 格式化时间
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

    // 格式化数字
    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w'
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
      }
      return num
    },

    // 预览图片
    previewImage(e) {
      const { index, images } = e.currentTarget.dataset
      wx.previewImage({
        current: images[index],
        urls: images
      })
      e.stopPropagation()
    },

    // 点击卡片
    onTap() {
      this.triggerEvent('tap', { postId: this.properties.post._id })
    },

    // 点击作者
    onAuthorTap(e) {
      const authorId = e.currentTarget.dataset.authorId
      this.triggerEvent('authorTap', { authorId })
      e.stopPropagation()
    },

    // 点赞
    onLike(e) {
      e.stopPropagation()
      const isLiked = !this.properties.post.isLiked
      let likes = this.properties.post.likes
      likes = isLiked ? likes + 1 : likes - 1
      
      this.triggerEvent('like', { 
        postId: this.properties.post._id,
        isLiked,
        likes
      })
      
      // 点赞动画
      this.setData({ likeAnimation: true })
      setTimeout(() => {
        this.setData({ likeAnimation: false })
      }, 300)
    },

    // 收藏
    onCollect(e) {
      e.stopPropagation()
      this.triggerEvent('collect', { 
        postId: this.properties.post._id,
        isCollected: !this.properties.post.isCollected 
      })
    },

    // 评论
    onComment(e) {
      e.stopPropagation()
      this.triggerEvent('comment', { 
        postId: this.properties.post._id,
        postTitle: this.properties.post.title,
        postAuthor: this.properties.post.author.name
      })
    },

    // 分享
    onShare(e) {
      e.stopPropagation()
      this.triggerEvent('share', { 
        postId: this.properties.post._id,
        postTitle: this.properties.post.title
      })
    }
  }
})