// 收藏服务 - 支持云数据库和本地存储双模式
const LOCAL_STORAGE_KEY = 'local_favorites'

// 尝试获取云开发模块
let cloudModule = null
try {
  cloudModule = require('../utils/cloud.js')
} catch (e) {
  console.log('[favoriteService] 云开发模块不可用，使用本地存储模式')
}

// ========== 本地存储方法 ==========

function getLocalFavorites() {
  try {
    return wx.getStorageSync(LOCAL_STORAGE_KEY) || []
  } catch (e) {
    return []
  }
}

function saveLocalFavorite(itemId, itemType, itemData = {}) {
  const favorites = getLocalFavorites()
  const exists = favorites.find(f => f.itemId === itemId)
  if (exists) return Promise.resolve(false) // 已收藏
  
  favorites.unshift({
    _id: 'local_' + Date.now(),
    itemId,
    itemType,
    itemData,
    createTime: new Date().toISOString()
  })
  wx.setStorageSync(LOCAL_STORAGE_KEY, favorites)
  return Promise.resolve(true)
}

function removeLocalFavorite(itemId) {
  const favorites = getLocalFavorites().filter(f => f.itemId !== itemId)
  wx.setStorageSync(LOCAL_STORAGE_KEY, favorites)
  return Promise.resolve(true)
}

function checkLocalFavorited(itemId) {
  const favorites = getLocalFavorites()
  return Promise.resolve(favorites.some(f => f.itemId === itemId))
}

// ========== 云开发方法 ==========

async function saveCloudFavorite(itemId, itemType, itemData = {}) {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  // 检查是否已收藏
  const checkRes = await db.collection('favorites')
    .where({ _openid: openid, itemId: itemId })
    .count()
  
  if (checkRes.total > 0) {
    return false // 已收藏
  }
  
  const data = {
    itemId,
    itemType,
    itemData,
    _openid: openid,
    createTime: db.serverDate()
  }
  
  await db.collection('favorites').add({ data })
  return true
}

async function removeCloudFavorite(itemId) {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  const res = await db.collection('favorites')
    .where({ _openid: openid, itemId: itemId })
    .remove()
  
  return res.stats.removed > 0
}

async function checkCloudFavorited(itemId) {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  const res = await db.collection('favorites')
    .where({ _openid: openid, itemId: itemId })
    .count()
  
  return res.total > 0
}

async function getCloudFavoriteList(itemType = null, page = 1, pageSize = 20) {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  let query = db.collection('favorites').where({ _openid: openid })
  if (itemType) {
    query = query.where({ itemType: itemType })
  }
  
  const res = await query
    .orderBy('createTime', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  
  return res.data
}

async function getCloudFavoriteCount(itemType = null) {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  let query = db.collection('favorites').where({ _openid: openid })
  if (itemType) {
    query = query.where({ itemType: itemType })
  }
  
  const res = await query.count()
  return res.total
}

// ========== 统一接口（带降级） ==========

// 收藏
function favorite(itemId, itemType = 'house', itemData = {}) {
  // 先保存到本地
  saveLocalFavorite(itemId, itemType, itemData)
  
  // 尝试同步到云端
  if (cloudModule && cloudModule.db) {
    return saveCloudFavorite(itemId, itemType, itemData).catch(err => {
      console.log('[favoriteService] 云端收藏失败，已保存到本地:', err.message)
      return true
    })
  }
  
  return Promise.resolve(true)
}

// 取消收藏
function unfavorite(itemId) {
  // 删除本地
  removeLocalFavorite(itemId)
  
  // 尝试删除云端
  if (cloudModule && cloudModule.db) {
    return removeCloudFavorite(itemId).catch(err => {
      console.log('[favoriteService] 云端取消收藏失败:', err.message)
      return true
    })
  }
  
  return Promise.resolve(true)
}

// 检查是否已收藏
function isFavorited(itemId) {
  if (cloudModule && cloudModule.db) {
    return checkCloudFavorited(itemId).catch(err => {
      console.log('[favoriteService] 云端检查失败，使用本地数据:', err.message)
      return checkLocalFavorited(itemId)
    })
  }
  return checkLocalFavorited(itemId)
}

// 获取收藏列表
function getFavoriteList(itemType = null, page = 1, pageSize = 20) {
  if (cloudModule && cloudModule.db) {
    return getCloudFavoriteList(itemType, page, pageSize).catch(err => {
      console.log('[favoriteService] 云端获取失败，使用本地数据:', err.message)
      return getLocalFavorites()
    })
  }
  return Promise.resolve(getLocalFavorites())
}

// 获取收藏数量
function getFavoriteCount(itemType = null) {
  if (cloudModule && cloudModule.db) {
    return getCloudFavoriteCount(itemType).catch(err => {
      console.log('[favoriteService] 云端获取数量失败，使用本地数据:', err.message)
      return getLocalFavorites().length
    })
  }
  return Promise.resolve(getLocalFavorites().length)
}

// 切换收藏状态
async function toggleFavorite(itemId, itemType = 'house', itemData = {}) {
  const favorited = await isFavorited(itemId)
  if (favorited) {
    await unfavorite(itemId)
    return { favorited: false }
  } else {
    await favorite(itemId, itemType, itemData)
    return { favorited: true }
  }
}

module.exports = {
  favorite,
  unfavorite,
  isFavorited,
  getFavoriteList,
  getFavoriteCount,
  toggleFavorite,
  // 暴露本地方法供调试
  getLocalFavorites
}
