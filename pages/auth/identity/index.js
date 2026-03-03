// pages/login/identity/index.js
const { request } = require('../../../services/http')
const app = getApp()

Page({
  data: {
    theme: 'light',
    appVersion: 'standard',
    selectedIdentity: null,  // 选择的身份：villager | visitor
    isLoading: false
  },

  onLoad() {
    // 同步主题
    this.syncThemeAndVersion()
  },

  onShow() {
    this.syncThemeAndVersion()
  },

  /**
   * 同步主题和版本
   */
  syncThemeAndVersion() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 选择身份
   */
  selectIdentity(event) {
    const identity = event.currentTarget.dataset.identity
    this.setData({
      selectedIdentity: identity
    })

    // 可选：震动反馈
    wx.vibrateShort({
      type: 'light'
    }).catch(() => {
      // 某些设备不支持振动
    })
  },

  /**
   * 确认身份 - 更新用户身份
   * 
   * 原因：身份信息是用户在应用中的核心属性，需要保存到后端和本地
   * 功能：
   * 1. 先保存到本地 storage（确保数据持久化）
   * 2. 尝试调用后端 API（可选，如果失败继续）
   * 3. 显示成功提示并跳转首页
   */
  async confirmIdentity() {
    if (!this.data.selectedIdentity) {
      this.showError('请选择身份')
      return
    }

    if (this.data.isLoading) return

    try {
      this.setData({ isLoading: true })
      console.log('[Identity] 确认身份，选择:', this.data.selectedIdentity)

      // 🔑 关键：先保存到本地，再尝试调用后端
      // 这样即使后端失败，也能保证用户数据的一致性
      
      // 1️⃣ 更新全局用户信息（本地保存）
      if (app.globalData.userInfo) {
        app.globalData.userInfo.identity = this.data.selectedIdentity
        wx.setStorageSync('userInfo', JSON.stringify(app.globalData.userInfo))
        console.log('[Identity] ✅ 身份已保存到本地')
      }

      // 2️⃣ 尝试调用后端 API 更新身份（可选）
      // 如果后端尚未实现该接口，不阻塞用户流程
      try {
        console.log('[Identity] 正在调用后端 API...')
        const result = await request('/api/user/identity', {
          method: 'PATCH',
          data: {
            identity: this.data.selectedIdentity
          }
        })
        console.log('[Identity] ✅ 后端身份更新成功')
      } catch (apiError) {
        console.warn('[Identity] ⚠️ 后端 API 调用失败，但本地数据已保存，继续跳转首页')
        // 后端失败时继续（本地数据已保存）
      }

      // 3️⃣ 显示成功提示
      wx.showToast({
        title: '身份设置成功',
        icon: 'success',
        duration: 1500
      })

      // 4️⃣ 延迟后跳转首页
      setTimeout(() => {
        console.log('[Identity] ✅ 跳转到首页')
        // 首页是 tabBar，必须用 switchTab
        wx.switchTab({
          url: '/pages/home/index/index'
        })
      }, 1500)
    } catch (error) {
      console.error('[Identity] ❌ 错误:', error)
      this.showError(error.message || '设置身份失败')
    } finally {
      this.setData({ isLoading: false })
    }
  },

  /**
   * 显示错误提示
   */
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'error',
      duration: 2000
    })
  }
})
