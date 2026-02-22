/**
 * 统一认证工具
 * utils/auth.js
 * 🌟 功能：所有页面的鉴权和跳转都通过这里统一处理
 */

// 获取 app 实例
const getAppGlobal = () => getApp()

/**
 * 检查用户是否已登录
 * @returns {boolean}
 */
function isLoggedIn() {
  const authMode = wx.getStorageSync('authMode')
  return authMode === 'user'
}

/**
 * 检查用户是否为游客
 * @returns {boolean}
 */
function isGuest() {
  const authMode = wx.getStorageSync('authMode')
  return authMode === 'guest'
}

/**
 * 检查用户是否已认证（用户或游客）
 * @returns {boolean}
 */
function isAuthenticated() {
  const authMode = wx.getStorageSync('authMode')
  return authMode === 'user' || authMode === 'guest'
}

/**
 * 检查登录状态并跳转
 * @param {string} loginPageUrl - 登录页路径
 * @returns {boolean} - 是否已登录
 */
function checkLoginAndRedirect(loginPageUrl = '/pages/login/index') {
  if (!isAuthenticated()) {
    wx.navigateTo({ url: loginPageUrl })
    return false
  }
  return true
}

/**
 * 检查登录状态，如果是游客则提示
 * @param {string} tipMessage - 提示消息
 * @returns {boolean} - 是否可以继续操作
 */
function checkLoginWithTip(tipMessage = '请先登录') {
  if (!isAuthenticated()) {
    wx.showToast({
      title: tipMessage,
      icon: 'none'
    })
    return false
  }
  
  if (isGuest()) {
    wx.showToast({
      title: '游客无法使用此功能',
      icon: 'none'
    })
    return false
  }
  
  return true
}

/**
 * 统一的跳转方法（带登录检查）
 * @param {string} url - 目标页面路径
 * @param {boolean} requireLogin - 是否需要登录
 */
function navigateWithAuth(url, requireLogin = false) {
  if (requireLogin && !isAuthenticated()) {
    wx.navigateTo({ url: '/pages/login/index' })
    return
  }
  
  if (requireLogin && isGuest()) {
    wx.showToast({
      title: '此功能需要登录后使用',
      icon: 'none'
    })
    return
  }
  
  wx.navigateTo({ url })
}

/**
 * 退出登录
 */
function logout() {
  wx.removeStorageSync('authMode')
  wx.removeStorageSync('accessToken')
  wx.removeStorageSync('refreshToken')
  wx.removeStorageSync('userInfo')
  
  const app = getAppGlobal()
  if (app) {
    app.globalData.authMode = null
    app.globalData.accessToken = null
    app.globalData.refreshToken = null
    app.globalData.userInfo = null
    app.globalData.isLogin = false
    app.globalData.isGuest = false
  }
  
  wx.showToast({
    title: '已退出登录',
    icon: 'success'
  })
  
  setTimeout(() => {
    wx.switchTab({ url: '/pages/index/index' })
  }, 1000)
}

module.exports = {
  isLoggedIn,
  isGuest,
  isAuthenticated,
  checkLoginAndRedirect,
  checkLoginWithTip,
  navigateWithAuth,
  logout
}
