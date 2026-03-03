// middleware/authMiddleware.js
const authModel = require('../models/authModel')

// 认证中间件 - 检查页面访问权限
function requireAuth(options = {}) {
  const { roles = [], permissions = [], redirect = true } = options
  
  return function(page) {
    const checkAuth = async () => {
      const authState = authModel.getAuthState()
      
      if (authState === 'unauthenticated') {
        if (redirect) {
          wx.redirectTo({
            url: '/pages/auth/login/index'
          })
          return false
        } else {
          return false
        }
      }
      
      // 检查角色权限
      if (roles.length > 0) {
        const user = authModel.getCurrentUser()
        if (!roles.includes(user?.role)) {
          wx.showToast({
            title: '权限不足',
            icon: 'none'
          })
          return false
        }
      }
      
      return true
    }
    
    return checkAuth()
  }
}

// 页面级认证装饰器
function withAuth(WrappedPage, authOptions) {
  const originalOnLoad = WrappedPage.onLoad
  
  WrappedPage.onLoad = function(options) {
    // 检查认证状态
    const isAuth = requireAuth(authOptions)(this)
    if (isAuth) {
      // 调用原始onLoad
      if (originalOnLoad) {
        originalOnLoad.call(this, options)
      }
    }
  }
  
  return WrappedPage
}

module.exports = {
  requireAuth,
  withAuth,
  authModel
}