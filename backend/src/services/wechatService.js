const axios = require('axios')

/**
 * 微信 code2Session 服务
 * 原因：后端需要用微信临时登录码换取用户的 openid，这是微信官方规范
 * 功能：调用微信服务器的 code2Session 接口，获取 openid 和 session_key
 */

/**
 * 调用微信 code2Session 接口
 * @param {string} code - 从小程序前端 wx.login() 获取的临时登录码
 * @returns {Promise<{openid, session_key}>} 返回用户的唯一标识 openid 和会话密钥
 */
async function getWechatUserInfo(code) {
  try {
    const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WECHAT_APPID,
        secret: process.env.WECHAT_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    })

    const { openid, session_key, errcode, errmsg } = response.data

    // 微信返回错误
    if (errcode) {
      throw new Error(`微信服务错误 [${errcode}]: ${errmsg}`)
    }

    console.log(`[WeChat] 成功获取 openid: ${openid}`)
    return { openid, session_key }
  } catch (error) {
    console.error('[WeChat] code2Session 调用失败:', error.message)
    throw error
  }
}

module.exports = {
  getWechatUserInfo
}
