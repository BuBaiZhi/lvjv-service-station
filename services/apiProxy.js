// services/apiProxy.js (统一服务代理层)
const cloudService = require('./cloudService')  // 云开发服务
const httpService = require('./httpService')    // HTTP服务
const authService = require('./authService')    // 认证服务

// 房源相关 - 使用云开发
function getHouseList(params) {
  return cloudService.getHouseList(params)
}

function publishHouse(data) {
  return cloudService.publishHouse(data)
}

// 认证相关 - 使用HTTP
function login(code) {
  return httpService.login(code)
}

function refreshToken(token) {
  return httpService.refreshToken(token)
}

// 复杂报表等 - 使用HTTP
function getComplexReport(params) {
  return httpService.getComplexReport(params)
}

// 用户信息 - 统一处理
async function getUserInfo() {
  const token = authService.getToken()
  if (token) {
    // 优先使用HTTP后端获取用户信息
    return await httpService.getUserInfo(token)
  } else {
    // 降级到云开发
    return await cloudService.getCurrentUser()
  }
}

// 更新用户信息
async function updateUserInfo(userInfo) {
  const token = authService.getToken()
  if (token) {
    // 优先使用HTTP后端更新用户信息
    return await httpService.updateUserInfo(token, userInfo)
  } else {
    // 降级到云开发
    return await cloudService.updateCurrentUser(userInfo)
  }
}

// 获取订单列表
async function getOrderList() {
  const token = authService.getToken()
  if (token) {
    // 优先使用HTTP后端获取订单列表
    return await httpService.getOrderList(token)
  } else {
    // 降级到云开发
    return await cloudService.getOrderList()
  }
}

// 获取发布列表
async function getPublishList() {
  const token = authService.getToken()
  if (token) {
    // 优先使用HTTP后端获取发布列表
    return await httpService.getPublishList(token)
  } else {
    // 降级到云开发
    return await cloudService.getPublishList()
  }
}

// 获取历史列表
async function getHistoryList() {
  const token = authService.getToken()
  if (token) {
    // 优先使用HTTP后端获取历史列表
    return await httpService.getHistoryList(token)
  } else {
    // 降级到云开发
    return await cloudService.getHistoryList()
  }
}

// 获取支持数据
async function getSupportData() {
  const token = authService.getToken()
  if (token) {
    // 优先使用HTTP后端获取支持数据
    return await httpService.getSupportData(token)
  } else {
    // 降级到云开发
    return await cloudService.getSupportData()
  }
}

module.exports = {
  // 房源服务
  getHouseList,
  publishHouse,
  
  // 认证服务
  login,
  refreshToken,
  
  // 用户服务
  getUserInfo,
  updateUserInfo,
  
  // 订单服务
  getOrderList,
  
  // 发布服务
  getPublishList,
  
  // 历史服务
  getHistoryList,
  
  // 支持服务
  getSupportData,
  
  // 报表服务
  getComplexReport
}