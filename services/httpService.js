// services/httpService.js
const request = require('../utils/request') // HTTP请求封装

// 登录服务
function login(code) {
  return request({
    url: '/auth/login',
    method: 'POST',
    data: { code }
  })
}

// 获取用户信息
function getUserInfo(token) {
  return request({
    url: '/user/info',
    method: 'GET',
    header: {
      'Authorization': `Bearer ${token}`
    }
  })
}

// 更新用户信息
function updateUserInfo(token, userInfo) {
  return request({
    url: '/user/update',
    method: 'POST',
    header: {
      'Authorization': `Bearer ${token}`
    },
    data: userInfo
  })
}

// 获取订单列表
function getOrderList(token) {
  return request({
    url: '/order/list',
    method: 'GET',
    header: {
      'Authorization': `Bearer ${token}`
    }
  })
}

// 获取发布列表
function getPublishList(token) {
  return request({
    url: '/publish/list',
    method: 'GET',
    header: {
      'Authorization': `Bearer ${token}`
    }
  })
}

// 获取历史列表
function getHistoryList(token) {
  return request({
    url: '/history/list',
    method: 'GET',
    header: {
      'Authorization': `Bearer ${token}`
    }
  })
}

// 获取支持数据
function getSupportData(token) {
  return request({
    url: '/support/data',
    method: 'GET',
    header: {
      'Authorization': `Bearer ${token}`
    }
  })
}

// 复杂报表
function getComplexReport(params) {
  return request({
    url: '/report/complex',
    method: 'POST',
    data: params
  })
}

module.exports = {
  login,
  getUserInfo,
  updateUserInfo,
  getOrderList,
  getPublishList,
  getHistoryList,
  getSupportData,
  getComplexReport
}