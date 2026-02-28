const { db, _, getOpenid } = require('../utils/cloud.js')

// 获取当前用户信息
function getCurrentUser() {
  const openid = getOpenid()
  return db.collection('users').where({
    _openid: openid
  }).get().then(res => res.data[0] || null)
}

// 更新用户信息
function updateUser(userData) {
  const openid = getOpenid()
  return db.collection('users').where({
    _openid: openid
  }).update({
    data: userData
  })
}

// 获取用户详情（根据ID）
function getUserById(userId) {
  return db.collection('users').doc(userId).get().then(res => res.data)
}

module.exports = {
  getCurrentUser,
  updateUser,
  getUserById
}