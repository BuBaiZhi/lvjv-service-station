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
    replyPlaceholder: ''
  },

  lifetimes: {
    attached() {
      this.loadComments()
    }
  },

  methods: {
    loadComments() {
      const mockComments = [
        {
          id: 'c1',
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
        if (item.id === commentId) {
          item.isLiked = !item.isLiked
          item.likeCount = item.isLiked ? item.likeCount + 1 : item.likeCount - 1
        }
        return item
      })
      this.setData({ comments })
    },

    onReply(e) {
      const { id, name } = e.currentTarget.dataset
      this.setData({
        replyTo: id,
        replyPlaceholder: `回复 ${name}:`
      })
    },

    onInput(e) {
      this.setData({ inputValue: e.detail.value })
    },

    onSend() {
      if (!this.data.inputValue.trim()) return
      wx.showToast({ title: '评论已发送', icon: 'success' })
      this.setData({ inputValue: '', replyTo: null, replyPlaceholder: '' })
    },

    stopPropagation() {}
  }
})