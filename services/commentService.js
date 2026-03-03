// services/commentService.js
const { db, _, getOpenid } = require('../utils/cloud.js')

// 开发模式：使用模拟数据
const USE_MOCK = false

// 获取评论列表
function getComments(postId) {
  if (USE_MOCK) {
    return Promise.resolve([
      {
        _id: 'comment_1',
        postId: postId,
        userId: 'user_1',
        userName: '旅居达人',
        avatar: 'https://via.placeholder.com/100x100?text=User+1',
        identity: '村民',
        content: '这个地方真的很棒，推荐大家去体验！',
        likeCount: 12,
        isLiked: false,
        createTime: '2026-02-25 10:30',
        replies: []
      },
      {
        _id: 'comment_2',
        postId: postId,
        userId: 'user_2',
        userName: '数字游民',
        avatar: 'https://via.placeholder.com/100x100?text=User+2',
        identity: '数字游民',
        content: '请问价格可以优惠吗？',
        likeCount: 5,
        isLiked: false,
        createTime: '2026-02-25 14:20',
        replies: [
          {
            id: 'reply_1',
            userId: 'user_3',
            userName: '房东小王',
            avatar: 'https://via.placeholder.com/100x100?text=User+3',
            content: '可以的，私信联系~',
            createTime: '2026-02-25 15:00'
          }
        ]
      },
      {
        _id: 'comment_3',
        postId: postId,
        userId: 'user_4',
        userName: '旅行者小李',
        avatar: 'https://via.placeholder.com/100x100?text=User+4',
        identity: '游客',
        content: '环境看起来不错，下次我也想去体验一下！',
        likeCount: 8,
        isLiked: false,
        createTime: '2026-02-26 09:15',
        replies: []
      },
      {
        _id: 'comment_4',
        postId: postId,
        userId: 'user_5',
        userName: '咖啡爱好者',
        avatar: 'https://via.placeholder.com/100x100?text=User+5',
        identity: '村民',
        content: '请问附近有什么好吃的推荐吗？',
        likeCount: 3,
        isLiked: false,
        createTime: '2026-02-26 11:30',
        replies: []
      },
      {
        _id: 'comment_5',
        postId: postId,
        userId: 'user_6',
        userName: '民宿达人',
        avatar: 'https://via.placeholder.com/100x100?text=User+6',
        identity: '房东',
        content: '作为房东，欢迎各位来体验我们的服务！',
        likeCount: 15,
        isLiked: false,
        createTime: '2026-02-26 14:00',
        replies: []
      }
    ])
  }
  return db.collection('comments')
    .where({ postId: postId })
    .orderBy('createTime', 'asc')
    .get()
    .then(res => res.data)
}

// 添加评论
function addComment(postId, commentData) {
  if (USE_MOCK) {
    // 模拟添加成功
    return Promise.resolve('comment_' + Date.now())
  }
  const openid = getOpenid()
  const data = {
    postId: postId,
    ...commentData,
    likeCount: 0,
    isLiked: false,
    replies: [],
    createTime: db.serverDate()
  }
  return db.collection('comments').add({ data }).then(res => res._id)
}

// 添加回复
function addReply(postId, commentId, replyData) {
  if (USE_MOCK) {
    // 模拟添加成功
    return Promise.resolve('reply_' + Date.now())
  }
  const reply = {
    id: Date.now().toString(),
    ...replyData,
    createTime: db.serverDate()
  }
  return db.collection('comments').doc(commentId).update({
    data: {
      replies: _.push([reply])
    }
  })
}

// 点赞评论
function likeComment(postId, commentId) {
  if (USE_MOCK) {
    // 模拟点赞成功
    return Promise.resolve()
  }
  return db.collection('comments').doc(commentId).update({
    data: {
      likeCount: _.inc(1)
    }
  })
}

module.exports = {
  getComments,
  addComment,
  addReply,
  likeComment
}