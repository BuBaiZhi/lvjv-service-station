const { db, _, getOpenid } = require('../utils/cloud.js')

// 开发模式：使用模拟数据
const USE_MOCK = true

// 模拟房源数据
const mockHouses = [
  {
    _id: 'house_1',
    title: '三亚NCC社区·唯吾岛',
    location: '海南省三亚市崖州区',
    price: 45,
    unit: '天',
    image: 'https://picsum.photos/400/300?random=1',
    images: ['https://picsum.photos/400/300?random=1', 'https://picsum.photos/400/300?random=2'],
    tags: ['海景', 'WiFi', '厨房'],
    facilities: ['WiFi', '工位', '厨房', '空调'],
    rating: 4.8,
    likes: 128,
    description: '温馨舒适的海景房，适合数字游民办公和度假。',
    host: { id: 'host_1', name: '房东小王', avatar: 'https://picsum.photos/100/100?random=10' },
    reviews: [
      { id: 'r1', name: '旅行者张三', avatar: 'https://picsum.photos/100/100?random=60', rating: 5, content: '非常棒的体验！房间干净整洁，房东很热情。', time: '3天前', likeCount: 12, isLiked: false },
      { id: 'r2', name: '数字游民李四', avatar: 'https://picsum.photos/100/100?random=61', rating: 4, content: '位置很好，适合远程办公，网络稳定。', time: '1周前', likeCount: 8, isLiked: false, reply: '感谢您的好评，欢迎下次再来！', replyTime: '6天前' }
    ]
  },
  {
    _id: 'house_2',
    title: '大理古城·苍山脚下',
    location: '云南省大理白族自治州',
    price: 68,
    unit: '天',
    image: 'https://picsum.photos/400/300?random=3',
    images: ['https://picsum.photos/400/300?random=3'],
    tags: ['山景', '古城'],
    facilities: ['WiFi', '厨房'],
    rating: 4.6,
    likes: 89,
    description: '苍山脚下的安静小院，远离喧嚣。',
    host: { id: 'host_2', name: '房东小李', avatar: 'https://picsum.photos/100/100?random=11' },
    reviews: [
      { id: 'r3', name: '文艺青年', avatar: 'https://picsum.photos/100/100?random=62', rating: 5, content: '太美了！每天早上醒来就能看到苍山，非常治愈。', time: '2天前', likeCount: 15, isLiked: false }
    ]
  },
  {
    _id: 'house_3',
    title: '黄山宏村·水墨人家',
    location: '安徽省黄山市黟县',
    price: 55,
    unit: '天',
    image: 'https://picsum.photos/400/300?random=4',
    images: ['https://picsum.photos/400/300?random=4'],
    tags: ['古镇', '山居'],
    facilities: ['WiFi', '停车'],
    rating: 4.9,
    likes: 156,
    description: '徽派建筑，感受水墨江南。',
    host: { id: 'host_3', name: '房东老张', avatar: 'https://picsum.photos/100/100?random=12' },
    reviews: [
      { id: 'r4', name: '摄影师小王', avatar: 'https://picsum.photos/100/100?random=63', rating: 5, content: '拍照绝佳！每个角落都是风景。', time: '5天前', likeCount: 20, isLiked: false }
    ]
  }
]

// 获取房源列表
function getHouseList() {
  if (USE_MOCK) {
    return Promise.resolve(mockHouses)
  }
  return db.collection('houses')
    .orderBy('createTime', 'desc')
    .get()
    .then(res => res.data)
}

// 获取单个房源详情
function getHouseById(houseId) {
  if (USE_MOCK) {
    const house = mockHouses.find(h => h._id === houseId)
    if (house) {
      return Promise.resolve(house)
    }
    // 如果找不到，返回第一个模拟数据
    return Promise.resolve(mockHouses[0])
  }
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