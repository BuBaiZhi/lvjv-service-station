const { db, _, getOpenid } = require('../utils/cloud.js')

// 开发模式：使用模拟数据
const USE_MOCK = true

// 获取房源评价
function getReviewsByHouse(houseId) {
  if (USE_MOCK) {
    return Promise.resolve([])
  }
  return db.collection('reviews')
    .where({ houseId: houseId })
    .orderBy('createTime', 'desc')
    .get()
    .then(res => res.data)
}

// 添加评价
function addReview(reviewData) {
  if (USE_MOCK) {
    // 模拟添加成功，返回模拟ID
    return Promise.resolve('review_' + Date.now())
  }
  const openid = getOpenid()
  const data = {
    ...reviewData,
    createTime: db.serverDate(),
    likeCount: 0,
    isLiked: false
  }
  return db.collection('reviews').add({ data }).then(res => res._id)
}

// 获取评价统计
function getReviewStats(houseId) {
  if (USE_MOCK) {
    return Promise.resolve({
      average: 4.8,
      total: 128,
      imageCount: 45,
      distribution: [
        { star: 5, count: 89, percentage: 69.5 },
        { star: 4, count: 26, percentage: 20.3 },
        { star: 3, count: 10, percentage: 7.8 },
        { star: 2, count: 2, percentage: 1.6 },
        { star: 1, count: 1, percentage: 0.8 }
      ]
    })
  }
  return db.collection('reviews')
    .where({ houseId: houseId })
    .get()
    .then(res => {
      const reviews = res.data
      const total = reviews.length
      let sum = 0
      const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      let imageCount = 0
      
      reviews.forEach(item => {
        sum += item.rating
        starCounts[item.rating]++
        if (item.images && item.images.length > 0) {
          imageCount++
        }
      })
      
      return {
        average: total > 0 ? (sum / total).toFixed(1) : 0,
        total: total,
        imageCount: imageCount,
        distribution: [5,4,3,2,1].map(star => ({
          star,
          count: starCounts[star],
          percentage: total > 0 ? ((starCounts[star] / total) * 100).toFixed(1) : 0
        }))
      }
    })
}

module.exports = {
  getReviewsByHouse,
  addReview,
  getReviewStats
}