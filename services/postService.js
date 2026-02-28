const { db, _, getOpenid } = require('../utils/cloud.js')

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

// 获取帖子列表
function getPosts() {
  if (USE_MOCK) {
    return Promise.resolve(mockPosts)
  }
  return db.collection('posts')
    .orderBy('createTime', 'desc')
    .get()
    .then(res => res.data)
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
  return db.collection('posts').doc(postId).get().then(res => res.data)
}

// 增加浏览量
function increaseViews(postId) {
  return db.collection('posts').doc(postId).update({
    data: {
      views: _.inc(1)
    }
  })
}

// 点赞帖子
function likePost(postId, isLiked) {
  if (USE_MOCK) {
    const post = mockPosts.find(p => p._id === postId)
    if (post) {
      post.likes = isLiked ? (post.likes || 0) + 1 : Math.max(0, (post.likes || 1) - 1)
    }
    return Promise.resolve({ success: true })
  }
  return db.collection('posts').doc(postId).update({
    data: {
      likes: _.inc(isLiked ? 1 : -1)
    }
  })
}

// 收藏帖子
function collectPost(postId, isCollected) {
  if (USE_MOCK) {
    const post = mockPosts.find(p => p._id === postId)
    if (post) {
      post.collects = isCollected ? (post.collects || 0) + 1 : Math.max(0, (post.collects || 1) - 1)
    }
    return Promise.resolve({ success: true })
  }
  return db.collection('posts').doc(postId).update({
    data: {
      collects: _.inc(isCollected ? 1 : -1)
    }
  })
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
  return db.collection('posts')
    .where({ type: type })
    .orderBy('createTime', 'desc')
    .get()
    .then(res => res.data)
}

// 按地区筛选帖子
function getPostsByRegion(region) {
  return db.collection('posts')
    .where({ location: db.RegExp({ regexp: region, options: 'i' }) })
    .orderBy('createTime', 'desc')
    .get()
    .then(res => res.data)
}

// 搜索帖子
function searchPosts(keyword) {
  return db.collection('posts')
    .where(_.or([
      { title: db.RegExp({ regexp: keyword, options: 'i' }) },
      { content: db.RegExp({ regexp: keyword, options: 'i' }) },
      { 'author.name': db.RegExp({ regexp: keyword, options: 'i' }) }
    ]))
    .orderBy('likes', 'desc')
    .get()
    .then(res => res.data)
}

// 发布帖子
function publishPost(postData) {
  const data = {
    ...postData,
    createTime: db.serverDate(),
    likes: 0,
    comments: 0,
    views: 0,
    collects: 0
  }
  return db.collection('posts').add({ data }).then(res => res._id)
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
  publishPost
}