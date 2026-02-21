const { db, _, getOpenid } = require('../utils/cloud.js')

// 获取房源列表
function getHouseList() {
  return db.collection('houses')
    .orderBy('createTime', 'desc')
    .get()
    .then(res => res.data)
}

// 获取单个房源详情
function getHouseById(houseId) {
  return db.collection('houses').doc(houseId).get().then(res => res.data)
}

// 获取推荐房源（首页用）
function getRecommendedHouses() {
  return db.collection('houses')
    .where({
      recommend: true
    })
    .limit(3)
    .get()
    .then(res => res.data)
}

// 搜索房源
function searchHouses(keyword) {
  return db.collection('houses')
    .where(_.or([
      { title: db.RegExp({ regexp: keyword, options: 'i' }) },
      { location: db.RegExp({ regexp: keyword, options: 'i' }) }
    ]))
    .get()
    .then(res => res.data)
}

// 发布房源（修改后的关键代码）
function publishHouse(houseData) {
  const openid = getOpenid()
  const data = {
    ...houseData,
    createTime: db.serverDate(),
    viewCount: 0
  }
  return db.collection('houses').add({ data }).then(res => res._id)
}

// 收藏房源
function favoriteHouse(houseId, isFavorite) {
  const openid = getOpenid()
  return db.collection('favorites').add({
    data: {
      houseId: houseId,
      type: 'house',
      createTime: db.serverDate()
    }
  })
}

module.exports = {
  getHouseList,
  getHouseById,
  getRecommendedHouses,
  searchHouses,
  publishHouse,
  favoriteHouse
}