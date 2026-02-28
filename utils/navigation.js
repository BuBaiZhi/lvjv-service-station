// utils/navigation.js
const routes = require('../config/routes.js')

// 统一导航方法
function navigateTo(routeName, params = {}) {
  const route = getRouteByPath(routeName)
  let url = route
  
  // 添加参数
  if (Object.keys(params).length > 0) {
    const queryString = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&')
    url += (url.includes('?') ? '&' : '?') + queryString
  }
  
  wx.navigateTo({ url })
}

function redirectTo(routeName, params = {}) {
  const route = getRouteByPath(routeName)
  let url = route
  
  if (Object.keys(params).length > 0) {
    const queryString = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&')
    url += (url.includes('?') ? '&' : '?') + queryString
  }
  
  wx.redirectTo({ url })
}

// TabBar 页面跳转
function switchTab(routeName) {
  const route = getRouteByPath(routeName)
  wx.switchTab({ url: route })
}

// 关闭所有页面跳转
function reLaunch(routeName, params = {}) {
  const route = getRouteByPath(routeName)
  let url = route
  
  if (Object.keys(params).length > 0) {
    const queryString = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&')
    url += (url.includes('?') ? '&' : '?') + queryString
  }
  
  wx.reLaunch({ url })
}

// 返回上一页
function navigateBack(delta = 1) {
  wx.navigateBack({ delta })
}

// 根据路径名获取完整路径
function getRouteByPath(path) {
  // 支持简写形式，如 'USER.PROFILE' -> '/pages/user/profile/profile'
  // 也支持直接返回完整路径
  if (path.startsWith('/pages/')) {
    return path
  }
  
  const pathParts = path.split('.')
  let current = routes
  
  for (const part of pathParts) {
    current = current[part]
    if (!current) {
      throw new Error(`Route path "${path}" not found`)
    }
  }
  
  return current
}

module.exports = {
  navigateTo,
  redirectTo,
  switchTab,
  reLaunch,
  navigateBack,
  getRouteByPath,
  routes
}