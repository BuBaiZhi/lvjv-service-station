// 草稿服务 - 支持云数据库和本地存储双模式
const LOCAL_STORAGE_KEY = 'local_drafts'

// 尝试获取云开发模块
let cloudModule = null
try {
  cloudModule = require('../utils/cloud.js')
} catch (e) {
  console.log('[draftService] 云开发模块不可用，使用本地存储模式')
}

// ========== 本地存储方法 ==========

function getLocalDrafts() {
  try {
    return wx.getStorageSync(LOCAL_STORAGE_KEY) || []
  } catch (e) {
    return []
  }
}

function saveLocalDraft(draftData) {
  const drafts = getLocalDrafts()
  const newDraft = {
    ...draftData,
    _id: 'local_' + Date.now(),
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  }
  drafts.unshift(newDraft)
  wx.setStorageSync(LOCAL_STORAGE_KEY, drafts)
  return Promise.resolve(newDraft._id)
}

function deleteLocalDraft(draftId) {
  const drafts = getLocalDrafts().filter(d => d._id !== draftId)
  wx.setStorageSync(LOCAL_STORAGE_KEY, drafts)
  return Promise.resolve()
}

function updateLocalDraft(draftId, draftData) {
  const drafts = getLocalDrafts()
  const index = drafts.findIndex(d => d._id === draftId)
  if (index >= 0) {
    drafts[index] = {
      ...drafts[index],
      ...draftData,
      updateTime: new Date().toISOString()
    }
    wx.setStorageSync(LOCAL_STORAGE_KEY, drafts)
  }
  return Promise.resolve()
}

// ========== 云开发方法 ==========

async function saveCloudDraft(draftData) {
  const { db } = cloudModule
  const data = {
    ...draftData,
    // 注意：不要手动设置 _openid，云数据库会自动添加
    createTime: db.serverDate(),
    updateTime: db.serverDate()
  }
  const res = await db.collection('drafts').add({ data })
  return res._id
}

async function getCloudDrafts() {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  const res = await db.collection('drafts')
    .where({ _openid: openid })
    .orderBy('updateTime', 'desc')
    .get()
  return res.data
}

async function deleteCloudDraft(draftId) {
  const { db } = cloudModule
  return db.collection('drafts').doc(draftId).remove()
}

async function updateCloudDraft(draftId, draftData) {
  const { db } = cloudModule
  return db.collection('drafts').doc(draftId).update({
    data: {
      ...draftData,
      updateTime: db.serverDate()
    }
  })
}

// ========== 统一接口（带降级） ==========

// 保存草稿
function saveDraft(draftData) {
  // 优先保存到本地（保证可用性）
  saveLocalDraft(draftData)
  
  // 尝试同步到云端
  if (cloudModule && cloudModule.db) {
    return saveCloudDraft(draftData).catch(err => {
      console.log('[draftService] 云端保存失败，已保存到本地:', err.message)
      return getLocalDrafts()[0]?._id
    })
  }
  
  return Promise.resolve(getLocalDrafts()[0]?._id)
}

// 获取用户的草稿列表
function getUserDrafts() {
  if (cloudModule && cloudModule.db) {
    return getCloudDrafts().catch(err => {
      console.log('[draftService] 云端获取失败，使用本地数据:', err.message)
      return getLocalDrafts()
    })
  }
  return Promise.resolve(getLocalDrafts())
}

// 获取单个草稿
function getDraft(draftId) {
  // 先查本地
  const localDrafts = getLocalDrafts()
  const localDraft = localDrafts.find(d => d._id === draftId)
  
  if (localDraft || !cloudModule || !cloudModule.db) {
    return Promise.resolve(localDraft)
  }
  
  // 尝试从云端获取
  return cloudModule.db.collection('drafts').doc(draftId).get()
    .then(res => res.data)
    .catch(() => localDraft)
}

// 删除草稿
function deleteDraft(draftId) {
  // 删除本地
  deleteLocalDraft(draftId)
  
  // 尝试删除云端
  if (cloudModule && cloudModule.db) {
    return deleteCloudDraft(draftId).catch(err => {
      console.log('[draftService] 云端删除失败:', err.message)
    })
  }
  
  return Promise.resolve()
}

// 更新草稿
function updateDraft(draftId, draftData) {
  // 更新本地
  updateLocalDraft(draftId, draftData)
  
  // 尝试更新云端
  if (cloudModule && cloudModule.db) {
    return updateCloudDraft(draftId, draftData).catch(err => {
      console.log('[draftService] 云端更新失败:', err.message)
    })
  }
  
  return Promise.resolve()
}

module.exports = {
  saveDraft,
  getDraft,
  getUserDrafts,
  deleteDraft,
  updateDraft,
  // 暴露本地方法供调试
  getLocalDrafts
}
