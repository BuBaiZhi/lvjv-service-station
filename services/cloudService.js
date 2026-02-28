// services/cloudService.js
const { db, _, getOpenid } = require('../utils/cloud.js')

// 房源服务
function getHouseList() {
  return db.collection('houses')
    .orderBy('createTime', 'desc')
    .get()
    .then(res => res.data)
}

function publishHouse(houseData) {
  const openid = getOpenid()
  const data = {
    ...houseData,
    createTime: db.serverDate(),
    viewCount: 0
  }
  return db.collection('houses').add({ data }).then(res => res._id)
}

// 获取当前用户信息（云开发）
function getCurrentUser() {
  const openid = getOpenid()
  return db.collection('users').where({
    _openid: openid
  }).get().then(res => res.data[0] || null)
}

// 更新当前用户信息（云开发）
function updateCurrentUser(userInfo) {
  const openid = getOpenid()
  return db.collection('users').where({
    _openid: openid
  }).update({
    data: userInfo
  })
}

// 获取订单列表（云开发）
function getOrderList() {
  const openid = getOpenid()
  return db.collection('orders').where({
    _openid: openid
  }).get().then(res => res.data || [])
}

// 获取发布列表（云开发）
function getPublishList() {
  const openid = getOpenid()
  return db.collection('publish').where({
    _openid: openid
  }).get().then(res => res.data || [])
}

// 获取历史列表（云开发）
function getHistoryList() {
  const openid = getOpenid()
  return db.collection('history').where({
    _openid: openid
  }).get().then(res => res.data || [])
}

// 获取支持数据（云开发）
function getSupportData() {
  return db.collection('support').doc('faq').get().then(res => res.data || {})
}

module.exports = {
  getHouseList,
  publishHouse,
  getCurrentUser,
  updateCurrentUser,
  getOrderList,
  getPublishList,
  getHistoryList,
  getSupportData
}