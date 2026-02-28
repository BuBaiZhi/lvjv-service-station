const { db, _, getOpenid } = require('../utils/cloud.js')

// 提交举报
function createReport(reportData) {
  const openid = getOpenid()
  const data = {
    ...reportData,
    _openid: openid,
    status: 'pending',
    createTime: db.serverDate()
  }
  return db.collection('reports').add({ data }).then(res => res._id)
}

// 获取举报列表（管理员用）
function getReports() {
  return db.collection('reports')
    .orderBy('createTime', 'desc')
    .get()
    .then(res => res.data)
}

// 处理举报（管理员用）
function handleReport(reportId, result) {
  return db.collection('reports').doc(reportId).update({
    data: {
      status: 'handled',
      result: result,
      handleTime: db.serverDate()
    }
  })
}

module.exports = {
  createReport,
  getReports,
  handleReport
}