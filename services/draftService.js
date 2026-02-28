const { db, _, getOpenid } = require('../utils/cloud.js')

// 保存草稿
function saveDraft(draftData) {
  const openid = getOpenid()
  const data = {
    ...draftData,
    _openid: openid,
    createTime: db.serverDate(),
    updateTime: db.serverDate()
  }
  return db.collection('drafts').add({ data }).then(res => res._id)
}

// 获取草稿
function getDraft(draftId) {
  return db.collection('drafts').doc(draftId).get().then(res => res.data)
}

// 获取用户的草稿列表
function getUserDrafts() {
  const openid = getOpenid()
  return db.collection('drafts')
    .where({ _openid: openid })
    .orderBy('updateTime', 'desc')
    .get()
    .then(res => res.data)
}

// 删除草稿
function deleteDraft(draftId) {
  return db.collection('drafts').doc(draftId).remove()
}

// 更新草稿
function updateDraft(draftId, draftData) {
  return db.collection('drafts').doc(draftId).update({
    data: {
      ...draftData,
      updateTime: db.serverDate()
    }
  })
}

module.exports = {
  saveDraft,
  getDraft,
  getUserDrafts,
  deleteDraft,
  updateDraft
}