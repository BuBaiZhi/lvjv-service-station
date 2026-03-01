// 关注服务 - 支持云数据库和本地存储双模式
const LOCAL_STORAGE_KEY = 'local_follows'

// 尝试获取云开发模块
let cloudModule = null
try {
  cloudModule = require('../utils/cloud.js')
} catch (e) {
  console.log('[followService] 云开发模块不可用，使用本地存储模式')
}

// ========== 本地存储方法 ==========

function getLocalFollows() {
  try {
    return wx.getStorageSync(LOCAL_STORAGE_KEY) || []
  } catch (e) {
    return []
  }
}

function saveLocalFollow(followingId, followingData = {}) {
  const follows = getLocalFollows()
  const exists = follows.find(f => f.followingId === followingId)
  if (exists) return Promise.resolve(false) // 已关注
  
  follows.unshift({
    _id: 'local_' + Date.now(),
    followingId,
    followingData,
    createTime: new Date().toISOString()
  })
  wx.setStorageSync(LOCAL_STORAGE_KEY, follows)
  return Promise.resolve(true)
}

function removeLocalFollow(followingId) {
  const follows = getLocalFollows().filter(f => f.followingId !== followingId)
  wx.setStorageSync(LOCAL_STORAGE_KEY, follows)
  return Promise.resolve(true)
}

function checkLocalFollowing(followingId) {
  const follows = getLocalFollows()
  return Promise.resolve(follows.some(f => f.followingId === followingId))
}

// ========== 云开发方法 ==========

async function saveCloudFollow(followingId, followingData = {}) {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  // 检查是否已关注
  const checkRes = await db.collection('follows')
    .where({ followingId: followingId })
    .count()
  
  if (checkRes.total > 0) {
    return false // 已关注
  }
  
  const data = {
    followingId,
    followingData
    // 注意：不要手动设置 _openid，云数据库会自动添加
  }
  
  await db.collection('follows').add({ data })
  return true
}

async function removeCloudFollow(followingId) {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  const res = await db.collection('follows')
    .where({ followingId: followingId })
    .remove()
  
  return res.stats.removed > 0
}

async function checkCloudFollowing(followingId) {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  const res = await db.collection('follows')
    .where({ followingId: followingId })
    .count()
  
  return res.total > 0
}

// 获取关注列表
async function getCloudFollowingList(page = 1, pageSize = 20) {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  const res = await db.collection('follows')
    .where({ followerId: openid })
    .orderBy('createTime', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  
  return res.data
}

// 获取粉丝列表
async function getCloudFollowerList(page = 1, pageSize = 20) {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  const res = await db.collection('follows')
    .where({ followingId: openid })
    .orderBy('createTime', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  
  return res.data
}

// 获取关注数
async function getCloudFollowingCount() {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  const res = await db.collection('follows')
    .where({ followerId: openid })
    .count()
  
  return res.total
}

// 获取粉丝数
async function getCloudFollowerCount() {
  const { db, getOpenid } = cloudModule
  const openid = getOpenid()
  
  const res = await db.collection('follows')
    .where({ followingId: openid })
    .count()
  
  return res.total
}

// ========== 统一接口（带降级） ==========

// 关注
function follow(followingId, followingData = {}) {
  // 先保存到本地
  saveLocalFollow(followingId, followingData)
  
  // 尝试同步到云端
  if (cloudModule && cloudModule.db) {
    return saveCloudFollow(followingId, followingData).catch(err => {
      console.log('[followService] 云端关注失败，已保存到本地:', err.message)
      return true
    })
  }
  
  return Promise.resolve(true)
}

// 取消关注
function unfollow(followingId) {
  // 删除本地
  removeLocalFollow(followingId)
  
  // 尝试删除云端
  if (cloudModule && cloudModule.db) {
    return removeCloudFollow(followingId).catch(err => {
      console.log('[followService] 云端取消关注失败:', err.message)
      return true
    })
  }
  
  return Promise.resolve(true)
}

// 检查是否已关注
function isFollowing(followingId) {
  if (cloudModule && cloudModule.db) {
    return checkCloudFollowing(followingId).catch(err => {
      console.log('[followService] 云端检查失败，使用本地数据:', err.message)
      return checkLocalFollowing(followingId)
    })
  }
  return checkLocalFollowing(followingId)
}

// 获取关注列表
function getFollowingList(page = 1, pageSize = 20) {
  if (cloudModule && cloudModule.db) {
    return getCloudFollowingList(page, pageSize).catch(err => {
      console.log('[followService] 云端获取关注列表失败，使用本地数据:', err.message)
      return getLocalFollows()
    })
  }
  return Promise.resolve(getLocalFollows())
}

// 获取粉丝列表
function getFollowerList(page = 1, pageSize = 20) {
  if (cloudModule && cloudModule.db) {
    return getCloudFollowerList(page, pageSize).catch(err => {
      console.log('[followService] 云端获取粉丝列表失败:', err.message)
      return []
    })
  }
  return Promise.resolve([])
}

// 获取关注数
function getFollowingCount() {
  if (cloudModule && cloudModule.db) {
    return getCloudFollowingCount().catch(err => {
      console.log('[followService] 云端获取关注数失败，使用本地数据:', err.message)
      return getLocalFollows().length
    })
  }
  return Promise.resolve(getLocalFollows().length)
}

// 获取粉丝数
function getFollowerCount() {
  if (cloudModule && cloudModule.db) {
    return getCloudFollowerCount().catch(err => {
      console.log('[followService] 云端获取粉丝数失败:', err.message)
      return 0
    })
  }
  return Promise.resolve(0)
}

// 切换关注状态
async function toggleFollow(followingId, followingData = {}) {
  const following = await isFollowing(followingId)
  if (following) {
    await unfollow(followingId)
    return { following: false }
  } else {
    await follow(followingId, followingData)
    return { following: true }
  }
}

module.exports = {
  follow,
  unfollow,
  isFollowing,
  getFollowingList,
  getFollowerList,
  getFollowingCount,
  getFollowerCount,
  toggleFollow,
  // 暴露本地方法供调试
  getLocalFollows
}
