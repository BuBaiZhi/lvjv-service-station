const { db, _, getOpenid } = require('../utils/cloud.js')

// 获取消息列表
function getMessages() {
  const openid = getOpenid()
  return db.collection('messages')
    .where({ to: openid })
    .orderBy('createTime', 'desc')
    .get()
    .then(res => res.data)
}

// 发送消息
function sendMessage(to, content, type = 'text') {
  const openid = getOpenid()
  const data = {
    from: openid,
    to: to,
    content: content,
    type: type,
    isRead: false,
    createTime: db.serverDate()
  }
  return db.collection('messages').add({ data }).then(res => res._id)
}

// 标记已读
function markAsRead(messageId) {
  return db.collection('messages').doc(messageId).update({
    data: {
      isRead: true
    }
  })
}

// 获取未读消息数
function getUnreadCount() {
  const openid = getOpenid()
  return db.collection('messages')
    .where({
      to: openid,
      isRead: false
    })
    .count()
    .then(res => res.total)
}

module.exports = {
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount
}