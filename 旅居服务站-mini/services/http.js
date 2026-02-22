/**
 * HTTP 拦截器
 * services/http.js
 * 🌟 功能：自动注入 accessToken、双 Token 刷新机制、401 队列处理
 */

// 重要：不在模块顶层调用 getApp()，否则会导致加载错误
// 而是在需要使用时通过 getApp() 获取

// API 基础配置（默认值，可以被 app.globalData 覆盖）
const defaultApiConfig = {
  baseURL: 'http://localhost:3000'  // 默认使用本地后端
}

/**
 * 获取 app 实例和配置
 */
function getAppData() {
  try {
    const app = getApp()
    return {
      app: app,
      api: app ? app.api : defaultApiConfig
    }
  } catch (e) {
    return {
      app: null,
      api: defaultApiConfig
    }
  }
}

// 🌟 Refresh 队列机制 - 防止并发 401 多次刷新
let isRefreshing = false              // 是否正在刷新 Token
let pendingRequests = []              // 待处理请求队列

/**
 * 添加待处理请求
 */
function addPendingRequest(callback) {
  pendingRequests.push(callback)
}

/**
 * 重试所有待处理请求
 */
function retryPendingRequests(accessToken) {
  pendingRequests.forEach(callback => {
    callback(accessToken)
  })
  pendingRequests = []
}

/**
 * 🌟 统一 HTTP 请求方法
 * 特性：
 * - 自动注入 accessToken
 * - 处理 401 认证失败 + 自动刷新
 * - Refresh 队列机制（防止并发）
 * - 自动重试
 */
function request(url, options = {}) {
  const { app, api } = getAppData()
  
  return new Promise((resolve, reject) => {
    // 获取 accessToken（短期 token）
    const accessToken = app ? app.globalData.accessToken : null || wx.getStorageSync('accessToken')

    const header = {
      ...options.header,
      'Content-Type': 'application/json'
    }

    // 🌟 自动注入 accessToken
    if (accessToken) {
      header['Authorization'] = `Bearer ${accessToken}`
    }

    wx.request({
      url: `${api.baseURL}${url}`,
      method: options.method || 'GET',
      data: options.data,
      header,
      success(res) {
        // 🌟 处理 401 - accessToken 过期
        if (res.statusCode === 401) {
          if (isRefreshing) {
            // 正在刷新中，加入队列等待
            console.log('[HTTP] 已在刷新 Token，加入队列...')
            addPendingRequest((newAccessToken) => {
              // 使用新 token 重试原请求
              const newHeader = { ...header }
              newHeader['Authorization'] = `Bearer ${newAccessToken}`

              wx.request({
                url: `${app.api.baseURL}${url}`,
                method: options.method || 'GET',
                data: options.data,
                header: newHeader,
                success: (retryRes) => {
                  if (retryRes.statusCode >= 200 && retryRes.statusCode < 300) {
                    resolve(retryRes.data)
                  } else if (retryRes.statusCode === 401) {
                    // 新 token 仍然无效
                    reject(new Error('认证失败，请重新登录'))
                  } else {
                    reject(new Error(retryRes.data?.message || '请求失败'))
                  }
                },
                fail: (error) => {
                  reject(new Error('网络请求失败'))
                }
              })
            })
          } else {
            // 第一个 401，开始刷新 Token
            isRefreshing = true
            console.log('[HTTP] 401 detected，开始刷新 Token...')

            handleTokenExpired()
              .then((newAccessToken) => {
                // Token 刷新成功
                isRefreshing = false
                console.log('[HTTP] Token 刷新成功')

                // 重试所有待处理请求
                retryPendingRequests(newAccessToken)

                // 重试原请求
                const newHeader = { ...header }
                newHeader['Authorization'] = `Bearer ${newAccessToken}`

                wx.request({
                  url: `${app.api.baseURL}${url}`,
                  method: options.method || 'GET',
                  data: options.data,
                  header: newHeader,
                  success: (retryRes) => {
                    resolve(retryRes.data)
                  },
                  fail: reject
                })
              })
              .catch((error) => {
                // Token 刷新失败
                isRefreshing = false
                pendingRequests = []
                reject(error)
              })
          }
          return
        }

        // 🌟 处理其他状态码
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 成功
          resolve(res.data)
        } else if (res.statusCode === 403) {
          // 权限不足
          reject(new Error('权限不足'))
        } else if (res.statusCode === 404) {
          // 资源不存在
          reject(new Error('资源不存在'))
        } else if (res.statusCode >= 500) {
          // 服务器错误
          reject(new Error('服务器错误，请稍后重试'))
        } else {
          // 其他错误
          reject(new Error(res.data?.message || '请求失败'))
        }
      },
      fail(error) {
        console.error('[HTTP] 网络请求失败:', error)
        reject(new Error('网络请求失败'))
      }
    })
  })
}

/**
 * 🌟 处理 Token 过期 - 使用 refreshToken 获取新 accessToken
 */
function handleTokenExpired() {
  const { app, api } = getAppData()
  
  return new Promise((resolve, reject) => {
    const refreshToken = app ? app.globalData.refreshToken : null || wx.getStorageSync('refreshToken')

    if (!refreshToken) {
      // 没有 refreshToken，无法刷新，需要重新登录
      console.error('[HTTP] 没有 refreshToken，无法刷新')
      clearAuth()
      reject(new Error('认证已过期，请重新登录'))
      return
    }

    // 🌟 关键：使用 refreshToken 请求新的 accessToken
    wx.request({
      url: `${api.baseURL}/api/auth/refresh`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${refreshToken}`,  // 使用 refreshToken
        'Content-Type': 'application/json'
      },
      success(res) {
        if (res.statusCode === 200) {
          const { accessToken, refreshToken: newRefreshToken, expiresIn } = res.data.data || res.data

          if (!accessToken) {
            reject(new Error('服务器未返回新 Token'))
            return
          }

          // 更新 accessToken（必须）
          wx.setStorageSync('accessToken', accessToken)
          if (app) app.globalData.accessToken = accessToken

          // 更新 refreshToken（如果服务器返回新的）
          if (newRefreshToken) {
            wx.setStorageSync('refreshToken', newRefreshToken)
            if (app) app.globalData.refreshToken = newRefreshToken
          }

          console.log('[HTTP] Token 已刷新')
          resolve(accessToken)
        } else {
          // 刷新失败（如 refreshToken 也过期了）
          console.error('[HTTP] Token 刷新失败:', res.statusCode)
          clearAuth()
          reject(new Error('认证已过期，请重新登录'))
        }
      },
      fail(error) {
        console.error('[HTTP] 刷新 Token 网络错误:', error)
        clearAuth()
        reject(new Error('网络错误，请检查连接'))
      }
    })
  })
}

/**
 * 清理认证信息并跳转登录页
 */
function clearAuth() {
  const { app } = getAppData()
  
  // 清理全局状态
  if (app) {
    app.globalData.accessToken = null
    app.globalData.refreshToken = null
    app.globalData.userInfo = null
    app.globalData.isLogin = false
  }

  // 清理本地存储
  wx.removeStorageSync('accessToken')
  wx.removeStorageSync('refreshToken')
  wx.removeStorageSync('userInfo')

  // 显示提示
  wx.showToast({
    title: '登录已过期，请重新登录',
    icon: 'error',
    duration: 2000
  })

  // 延迟后跳转登录页
  setTimeout(() => {
    wx.redirectTo({
      url: '/pages/login/index'
    })
  }, 2000)
}

module.exports = {
  request
}
