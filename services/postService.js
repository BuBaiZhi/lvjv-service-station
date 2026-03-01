// 帖子服务 - 支持云数据库和本地存储双模式
const LOCAL_STORAGE_KEY = 'local_posts'

// 尝试获取云开发模块
let cloudModule = null
try {
  cloudModule = require('../utils/cloud.js')
} catch (e) {
  console.log('[postService] 云开发模块不可用，使用本地存储模式')
}

// 开发模式：使用模拟数据
const USE_MOCK = true

// 模拟帖子数据
const mockPosts = [
  {
    _id: 'post_1',
    title: '周末徒步活动招募',
    content: '本周六组织徒步活动，有兴趣的朋友可以一起参加！',
    type: '活动',
    author: { id: 'user_1', name: '户外达人', avatar: 'https://picsum.photos/100/100?random=20' },
    images: ['https://picsum.photos/400/300?random=30'],
    likes: 45,
    comments: 12,
    views: 234,
    collects: 8,
    createTime: '2026-02-25',
    tags: ['徒步', '户外']
  },
  {
    _id: 'post_2',
    title: '寻找编程搭子',
    content: '在大理旅居，想找个一起写代码的朋友，可以一起办公、交流技术。',
    type: '找搭子',
    author: { id: 'user_2', name: '程序员小王', avatar: 'https://picsum.photos/100/100?random=21' },
    images: [],
    likes: 23,
    comments: 5,
    views: 156,
    collects: 3,
    createTime: '2026-02-24',
    tags: ['编程', '搭子']
  },
  {
    _id: 'post_3',
    title: '吉他教学',
    content: '提供吉他入门教学服务，一对一指导，每小时80元。',
    type: '技能变现',
    author: { id: 'user_3', name: '音乐人阿杰', avatar: 'https://picsum.photos/100/100?random=22' },
    images: ['https://picsum.photos/400/300?random=31'],
    likes: 67,
    comments: 18,
    views: 312,
    collects: 15,
    createTime: '2026-02-23',
    tags: ['音乐', '教学']
  }
]

// ========== 本地存储方法 ==========

function getLocalPosts() {
  try {
    const local = wx.getStorageSync(LOCAL_STORAGE_KEY)
    return local || mockPosts
  } catch (e) {
    return mockPosts
  }
}

function saveLocalPost(postData) {
  const posts = getLocalPosts()
  const newPost = {
    ...postData,
    _id: 'local_' + Date.now(),
    likes: 0,
    comments: 0,
    views: 0,
    collects: 0,
    status: 'active',
    createTime: new Date().toISOString()
  }
  posts.unshift(newPost)
  wx.setStorageSync(LOCAL_STORAGE_KEY, posts)
  return Promise.resolve(newPost._id)
}

// ========== 统一接口（带降级） ==========

// 获取帖子列表
function getPosts() {
  if (USE_MOCK) {
    return Promise.resolve(mockPosts)
  }
  if (cloudModule && cloudModule.db) {
    const { db } = cloudModule
    return db.collection('posts')
      .orderBy('createTime', 'desc')
      .get()
      .then(res => res.data)
      .catch(err => {
        console.log('[postService] 云端获取失败，使用本地数据:', err.message)
        return getLocalPosts()
      })
  }
  return Promise.resolve(getLocalPosts())
}

// 获取单个帖子详情
function getPostById(postId) {
  if (USE_MOCK) {
    const post = mockPosts.find(p => p._id === postId)
    if (post) {
      return Promise.resolve(post)
    }
    // 如果找不到，返回第一个模拟数据
    return Promise.resolve(mockPosts[0])
  }
  if (cloudModule && cloudModule.db) {
    const { db } = cloudModule
    return db.collection('posts').doc(postId).get()
      .then(res => res.data)
      .catch(err => {
        console.log('[postService] 云端获取详情失败，使用本地数据:', err.message)
        const posts = getLocalPosts()
        return posts.find(p => p._id === postId) || posts[0]
      })
  }
  const posts = getLocalPosts()
  return Promise.resolve(posts.find(p => p._id === postId) || posts[0])
}

// 增加浏览量
function increaseViews(postId) {
  if (cloudModule && cloudModule.db) {
    const { db, _ } = cloudModule
    return db.collection('posts').doc(postId).update({
      data: { views: _.inc(1) }
    }).catch(() => {})
  }
  return Promise.resolve()
}

// 点赞帖子（已迁移到 likeService）
function likePost(postId, isLiked) {
  const likeService = require('./likeService.js')
  if (isLiked) {
    return likeService.like(postId, 'post')
  } else {
    return likeService.unlike(postId)
  }
}

// 收藏帖子（已迁移到 favoriteService）
function collectPost(postId, isCollected) {
  const favoriteService = require('./favoriteService.js')
  if (isCollected) {
    return favoriteService.favorite(postId, 'post')
  } else {
    return favoriteService.unfavorite(postId)
  }
}

// 获取分类
function getCategories() {
  return Promise.resolve([
    { id: 'rec', name: '推荐' },
    { id: 'latest', name: '最新' },
    { id: 'samecity', name: '同城' },
    { id: 'partner', name: '找搭子' }
  ])
}

// 按类型筛选帖子
function getPostsByType(type) {
  if (USE_MOCK) {
    return Promise.resolve(mockPosts.filter(p => p.type === type))
  }
  if (cloudModule && cloudModule.db) {
    const { db } = cloudModule
    return db.collection('posts')
      .where({ type: type })
      .orderBy('createTime', 'desc')
      .get()
      .then(res => res.data)
      .catch(() => [])
  }
  return Promise.resolve([])
}

// 按地区筛选帖子
function getPostsByRegion(region) {
  if (USE_MOCK) {
    return Promise.resolve(mockPosts)
  }
  if (cloudModule && cloudModule.db) {
    const { db } = cloudModule
    return db.collection('posts')
      .where({ location: db.RegExp({ regexp: region, options: 'i' }) })
      .orderBy('createTime', 'desc')
      .get()
      .then(res => res.data)
      .catch(() => [])
  }
  return Promise.resolve([])
}

// 搜索帖子
function searchPosts(keyword) {
  if (USE_MOCK) {
    const results = mockPosts.filter(p => 
      p.title.includes(keyword) || p.content.includes(keyword)
    )
    return Promise.resolve(results)
  }
  if (cloudModule && cloudModule.db) {
    const { db, _ } = cloudModule
    return db.collection('posts')
      .where(_.or([
        { title: db.RegExp({ regexp: keyword, options: 'i' }) },
        { content: db.RegExp({ regexp: keyword, options: 'i' }) }
      ]))
      .orderBy('likes', 'desc')
      .get()
      .then(res => res.data)
      .catch(() => [])
  }
  return Promise.resolve([])
}

// 发布帖子
function publishPost(postData) {
  // 先保存到本地
  saveLocalPost(postData)
  
  // 尝试同步到云端
  if (cloudModule && cloudModule.db && !USE_MOCK) {
    const { db, getOpenid } = cloudModule
    const openid = getOpenid()
    const data = {
      ...postData,
      _openid: openid,
      createTime: db.serverDate(),
      likes: 0,
      comments: 0,
      views: 0,
      collects: 0
    }
    return db.collection('posts').add({ data }).then(res => res._id)
      .catch(err => {
        console.log('[postService] 云端发布失败，已保存到本地:', err.message)
        return 'local_' + Date.now()
      })
  }
  return Promise.resolve('local_' + Date.now())
}

module.exports = {
  getPosts,
  getPostById,
  increaseViews,
  likePost,
  collectPost,
  getCategories,
  getPostsByType,
  getPostsByRegion,
  searchPosts,
  publishPost,
  // 暴露本地方法供调试
  getLocalPosts
}