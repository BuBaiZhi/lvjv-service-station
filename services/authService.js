// services/authService.js
// 统一的认证管理
function getToken() {
  return wx.getStorageSync('access_token')
}

function setToken(token) {
  wx.setStorageSync('access_token', token)
}

function clearToken() {
  wx.removeStorageSync('access_token')
  wx.removeStorageSync('refresh_token')
}

function isAuthenticated() {
  const token = getToken()
  return !!token
}

module.exports = {
  getToken,
  setToken,
  clearToken,
  isAuthenticated
}