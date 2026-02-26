const { db, _, getOpenid } = require('../utils/cloud.js')

// 获取房源评价
function getReviewsByHouse(houseId) {
  return db.collection('reviews')
    .where({ houseId: houseId })
    .orderBy('createTime', 'desc')
    .get()
    .then(res => res.data)
}

// 添加评价（已修复）
function addReview(reviewData) {
  const openid = getOpenid()  // 这行可以留着，虽然没用到
  const data = {
    ...reviewData,
    // _openid: openid,  // ✅ 已删除！系统会自动添加
    createTime: db.serverDate(),
    likeCount: 0,
    isLiked: false
  }
  return db.collection('reviews').add({ data }).then(res => res._id)
}

// 获取评价统计
function getReviewStats(houseId) {
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