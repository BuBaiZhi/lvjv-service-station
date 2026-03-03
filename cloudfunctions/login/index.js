// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  // 查询用户是否存在
  const userRes = await db.collection('users').where({
    _openid: openid
  }).get()
  
  let userInfo
  if (userRes.data.length === 0) {
    // 新用户，创建记录
    userInfo = {
      _openid: openid,
      nickName: '微信用户',
      avatarUrl: '',
      role: '村民',
      createTime: db.serverDate()
    }
    await db.collection('users').add({
      data: userInfo
    })
  } else {
    userInfo = userRes.data[0]
  }
  
  return {
    openid: openid,
    token: openid, // 简单用openid当token
    userInfo: userInfo
  }
}