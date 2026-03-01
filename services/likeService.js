// 点赞服务 - 支持云数据库和本地存储双模式
const LOCAL_STORAGE_KEY = 'local_likes'

// 尝试获取云开发模块
let cloudModule = null
try {
  cloudModule = require('../utils/cloud.js')
} catch (e) {
  console.log('[likeService] 云开发模块不可用，使用本地存储模式')
}

// ========== 本地存储方法 ==========

function getLocalLikes() {
  try {
    return wx.getStorageSync(LOCAL_STORAGE_KEY) || []
  } catch (e) {
    return []
  }
}

function saveLocalLike(itemId, itemType) {
  const likes = getLocalLikes()
  const exists = likes.find(l => l.itemId === itemId)
  if (exists) return Promise.resolve(false) // 已点赞
  
  likes.unshift({
    _id: 'local_' + Date.now(),
    itemId,
    itemType,
    createTime: new Date().toISOString()
  })
  wx.setStorageSync(LOCAL_STORAGE_KEY, likes)
  return Promise.resolve(true)
}

function removeLocalLike(itemId) {
  const likes = getLocalLikes().filter(l => l.itemId !== itemId)
  wx.setStorageSync(LOCAL_STORAGE_KEY, likes)
  return Promise.resolve(true)
}

function checkLocalLiked(itemId) {
  const likes = getLocalLikes()
  return Promise.resolve(likes.some(l => l.itemId === itemId))
}

// ========== 云开发方法 ==========

async function saveCloudLike(itemId, itemType) {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  // 检查是否已点赞
  const checkRes = await db.collection('likes')
    .where({ itemId: itemId })
    .count()
  
  if (checkRes.total > 0) {
    return false // 已点赞
  }
  
  const data = {
    itemId,
    itemType
    // 注意：不要手动设置 _openid，云数据库会自动添加
  }
  
  await db.collection('likes').add({ data })
  return true
}

async function removeCloudLike(itemId) {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  const res = await db.collection('likes')
    .where({ itemId: itemId })
    .remove()
  
  return res.stats.removed > 0
}

async function checkCloudLiked(itemId) {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  const res = await db.collection('likes')
    .where({ itemId: itemId })
    .count()
  
  return res.total > 0
}

async function getCloudLikeList(itemType = null, page = 1, pageSize = 20) {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  let query = db.collection('likes').where({ _openid: openid })
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

// ========== 统一接口（带降级） ==========

// 点赞
function like(itemId, itemType = 'post') {
  // 先保存到本地
  saveLocalLike(itemId, itemType)
  
  // 尝试同步到云端
  if (cloudModule && cloudModule.db) {
    return saveCloudLike(itemId, itemType).catch(err => {
      console.log('[likeService] 云端点赞失败，已保存到本地:', err.message)
      return true
    })
  }
  
  return Promise.resolve(true)
}

// 取消点赞
function unlike(itemId) {
  // 删除本地
  removeLocalLike(itemId)
  
  // 尝试删除云端
  if (cloudModule && cloudModule.db) {
    return removeCloudLike(itemId).catch(err => {
      console.log('[likeService] 云端取消点赞失败:', err.message)
      return true
    })
  }
  
  return Promise.resolve(true)
}

// 检查是否已点赞
function isLiked(itemId) {
  if (cloudModule && cloudModule.db) {
    return checkCloudLiked(itemId).catch(err => {
      console.log('[likeService] 云端检查失败，使用本地数据:', err.message)
      return checkLocalLiked(itemId)
    })
  }
  return checkLocalLiked(itemId)
}

// 获取点赞列表
function getLikeList(itemType = null, page = 1, pageSize = 20) {
  if (cloudModule && cloudModule.db) {
    return getCloudLikeList(itemType, page, pageSize).catch(err => {
      console.log('[likeService] 云端获取失败，使用本地数据:', err.message)
      return getLocalLikes()
    })
  }
  return Promise.resolve(getLocalLikes())
}

// 切换点赞状态
async function toggleLike(itemId, itemType = 'post') {
  const liked = await isLiked(itemId)
  if (liked) {
    await unlike(itemId)
    return { liked: false }
  } else {
    await like(itemId, itemType)
    return { liked: true }
  }
}

module.exports = {
  like,
  unlike,
  isLiked,
  getLikeList,
  toggleLike,
  // 暴露本地方法供调试
  getLocalLikes
}
