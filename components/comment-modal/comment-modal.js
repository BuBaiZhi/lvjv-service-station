Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    postId: {
      type: String,
      value: ''
    },
    commentCount: {
      type: Number,
      value: 0
    }
  },

  data: {
    comments: [],
    inputValue: '',
    replyTo: null,
    replyToName: '',
    replyPlaceholder: ''
  },

  observers: {
    'visible': function(visible) {
      if (visible) {
        this.loadComments()
      }
    }
  },

  methods: {
    loadComments() {
      const mockComments = [
        {
          _id: 'c1',
          userId: 'user002',
          userName: 'VK游民',
          avatar: 'https://picsum.photos/100/100?random=2',
          identity: '村民',
          content: '深圳哪里好玩呀？我也刚搬来！',
          time: '5分钟前',
          likeCount: 3,
          isLiked: false,
          replies: [
            {
              id: 'r1',
              userId: 'user003',
              userName: '深圳小助手',
              avatar: 'https://picsum.photos/100/100?random=3',
              replyTo: 'VK游民',
              content: '推荐南山区万象天地，有很多咖啡厅适合办公',
              time: '2分钟前'
            }
          ]
        }
      ]
      this.setData({ comments: mockComments })
    },

    onClose() {
      this.triggerEvent('close')
    },

    onAvatarTap(e) {
      const userId = e.currentTarget.dataset.userId
      this.triggerEvent('avatarTap', { userId })
    },

    onLikeComment(e) {
      const commentId = e.currentTarget.dataset.id
      const comments = this.data.comments.map(item => {
        if (item._id === commentId) {
          item.isLiked = !item.isLiked
          item.likeCount = item.isLiked ? item.likeCount + 1 : item.likeCount - 1
        }
        return item
      })
      this.setData({ comments })
      wx.showToast({ title: item.isLiked ? '点赞成功' : '取消点赞', icon: 'success' })
    },

    onReply(e) {
      const { id, name } = e.currentTarget.dataset
      this.setData({
        replyTo: id,
        replyToName: name,
        replyPlaceholder: `回复 ${name}:`
      })
    },

    onInput(e) {
      this.setData({ inputValue: e.detail.value })
    },

    onSend() {
      if (!this.data.inputValue.trim()) {
        wx.showToast({ title: '请输入评论内容', icon: 'none' })
        return
      }

      // 构建新评论
      const newComment = {
        _id: 'comment_' + Date.now(),
        userId: 'currentUser',
        userName: '当前用户',
        avatar: 'https://picsum.photos/100/100?random=999',
        identity: '村民',
        content: this.data.inputValue,
        time: '刚刚',
        likeCount: 0,
        isLiked: false,
        replies: []
      }

      // 如果是回复
      if (this.data.replyTo) {
        const comments = this.data.comments.map(item => {
          if (item._id === this.data.replyTo) {
            item.replies = item.replies || []
            item.replies.push({
              id: 'reply_' + Date.now(),
              userId: 'currentUser',
              userName: '当前用户',
              avatar: 'https://picsum.photos/100/100?random=999',
              replyTo: this.data.replyToName,
              content: this.data.inputValue,
              time: '刚刚'
            })
          }
          return item
        })
        this.setData({ comments })
      } else {
        // 新评论
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

      wx.showToast({ title: '评论成功', icon: 'success' })
      
      // 通知父组件更新评论数
      this.triggerEvent('commentAdded')
    },

    stopPropagation() {}
  }
})