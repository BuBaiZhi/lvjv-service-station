const { db, _, getOpenid } = require('../utils/cloud.js')

// 获取帖子列表
function getPosts() {
  return db.collection('posts')
    .orderBy('createTime', 'desc')
    .get()
    .then(res => res.data)
}

// 获取单个帖子详情
function getPostById(postId) {
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
  return db.collection('posts').doc(postId).update({
    data: {
      likes: _.inc(isLiked ? 1 : -1)
    }
  })
}

// 收藏帖子
function collectPost(postId, isCollected) {
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