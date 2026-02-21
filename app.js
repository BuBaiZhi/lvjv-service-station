// app.js
App({
  onLaunch() {
    // 初始化云开发
    wx.cloud.init({
      env: 'cloud1-9g8d2qsuf2481170',  // ✅ 注意 F 是大写！
      traceUser: true
    })

    console.log('云开发初始化成功')
  },

  globalData: {
    userInfo: null
  }
})