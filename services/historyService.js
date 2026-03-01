// 浏览历史服务 - 支持云数据库和本地存储双模式
const LOCAL_STORAGE_KEY = 'local_history'

// 最大历史记录数
const MAX_HISTORY_COUNT = 100

// 尝试获取云开发模块
let cloudModule = null
try {
  cloudModule = require('../utils/cloud.js')
} catch (e) {
  console.log('[historyService] 云开发模块不可用，使用本地存储模式')
}

// ========== 本地存储方法 ==========

function getLocalHistory() {
  try {
    return wx.getStorageSync(LOCAL_STORAGE_KEY) || []
  } catch (e) {
    return []
  }
}

function saveLocalHistory(itemId, itemType, itemData = {}) {
  let history = getLocalHistory()
  
  // 移除已存在的相同记录
  history = history.filter(h => h.itemId !== itemId)
  
  // 添加新记录到开头
  history.unshift({
    _id: 'local_' + Date.now(),
    itemId,
    itemType,
    itemData,
    createTime: new Date().toISOString()
  })
  
  // 限制记录数量
  if (history.length > MAX_HISTORY_COUNT) {
    history = history.slice(0, MAX_HISTORY_COUNT)
  }
  
  wx.setStorageSync(LOCAL_STORAGE_KEY, history)
  return Promise.resolve(true)
}

function clearLocalHistory() {
  wx.setStorageSync(LOCAL_STORAGE_KEY, [])
  return Promise.resolve(true)
}

// ========== 云开发方法 ==========

async function saveCloudHistory(itemId, itemType, itemData = {}) {
  const { db, _, getOpenid } = cloudModule
  const openid = getOpenid()
  
  // 删除已存在的相同记录
  await db.collection('history')
    .where({ _openid: openid, itemId: itemId })
    .remove()
  
  // 添加新记录
  const data = {
    itemId,
    itemType,
    itemData,
    _openid: openid,
    createTime: db.serverDate()
  }
  
  await db.collection('history').add({ data })
  return true
}

async function getCloudHistory(page = 1, pageSize = 20) {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  const res = await db.collection('history')
    .where({ _openid: openid })
    .orderBy('createTime', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  
  return res.data
}

async function getCloudHistoryCount() {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  const res = await db.collection('history')
    .where({ _openid: openid })
    .count()
  
  return res.total
}

async function deleteCloudHistory(historyId) {
  const { db } = cloudModule
  
  await db.collection('history').doc(historyId).remove()
  return true
}

async function clearCloudHistory() {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  await db.collection('history')
    .where({ _openid: openid })
    .remove()
  
  return true
}

// ========== 统一接口（带降级） ==========

// 记录浏览历史
function addHistory(itemId, itemType = 'house', itemData = {}) {
  // 先保存到本地
  saveLocalHistory(itemId, itemType, itemData)
  
  // 尝试同步到云端
  if (cloudModule && cloudModule.db) {
    return saveCloudHistory(itemId, itemType, itemData).catch(err => {
      console.log('[historyService] 云端记录失败，已保存到本地:', err.message)
      return true
    })
  }
  
  return Promise.resolve(true)
}

// 获取浏览历史
function getHistory(page = 1, pageSize = 20) {
  if (cloudModule && cloudModule.db) {
    return getCloudHistory(page, pageSize).catch(err => {
      console.log('[historyService] 云端获取失败，使用本地数据:', err.message)
      return getLocalHistory().slice((page - 1) * pageSize, page * pageSize)
    })
  }
  
  const history = getLocalHistory()
  return Promise.resolve(history.slice((page - 1) * pageSize, page * pageSize))
}

// 获取历史记录数量
function getHistoryCount() {
  if (cloudModule && cloudModule.db) {
    return getCloudHistoryCount().catch(err => {
      console.log('[historyService] 云端获取数量失败，使用本地数据:', err.message)
      return getLocalHistory().length
    })
  }
  return Promise.resolve(getLocalHistory().length)
}

// 删除单条历史记录
function deleteHistory(historyId) {
  // 删除本地
  let history = getLocalHistory()
  history = history.filter(h => h._id !== historyId)
  wx.setStorageSync(LOCAL_STORAGE_KEY, history)
  
  // 尝试删除云端
  if (cloudModule && cloudModule.db) {
    return deleteCloudHistory(historyId).catch(err => {
      console.log('[historyService] 云端删除失败:', err.message)
      return true
    })
  }
  
  return Promise.resolve(true)
}

// 清空浏览历史
function clearHistory() {
  // 清空本地
  clearLocalHistory()
  
  // 尝试清空云端
  if (cloudModule && cloudModule.db) {
    return clearCloudHistory().catch(err => {
      console.log('[historyService] 云端清空失败:', err.message)
      return true
    })
  }
  
  return Promise.resolve(true)
}

// 按类型获取历史
function getHistoryByType(itemType, page = 1, pageSize = 20) {
  return getHistory(page, pageSize).then(history => {
    return history.filter(h => h.itemType === itemType)
  })
}

// 检查是否已浏览过
function hasViewed(itemId) {
  const history = getLocalHistory()
  return Promise.resolve(history.some(h => h.itemId === itemId))
}

module.exports = {
  addHistory,
  getHistory,
  getHistoryCount,
  deleteHistory,
  clearHistory,
  getHistoryByType,
  hasViewed,
  // 暴露本地方法供调试
  getLocalHistory,
  MAX_HISTORY_COUNT
}
