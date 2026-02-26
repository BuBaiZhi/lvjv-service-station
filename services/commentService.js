// services/commentService.js
const { db, _, getOpenid } = require('../utils/cloud.js')

// 获取评论列表
function getComments(postId) {
  return db.collection('comments')
    .where({ postId: postId })
    .orderBy('createTime', 'asc')
    .get()
    .then(res => res.data)
}

// 添加评论
function addComment(postId, content) {
  const openid = getOpenid()
  const data = {
    postId: postId,
    content: content,
    likeCount: 0,
    isLiked: false,
    replies: [],
    createTime: db.serverDate()
  }
  return db.collection('comments').add({ data }).then(res => res._id)
}

// 添加回复
function addReply(postId, commentId, replyData) {
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