// 房源服务 - 支持云数据库和本地存储双模式
const LOCAL_STORAGE_KEY = 'local_houses'

// 尝试获取云开发模块
let cloudModule = null
try {
  cloudModule = require('../utils/cloud.js')
} catch (e) {
  console.log('[houseService] 云开发模块不可用，使用本地存储模式')
}

// 开发模式：使用模拟数据
const USE_MOCK = false

// 模拟房源数据
const mockHouses = [
  {
    _id: 'house_1',
    title: '三亚NCC社区·唯吾岛',
    location: '海南省三亚市崖州区',
    price: 45,
    unit: '天',
    image: 'https://via.placeholder.com/400x300?text=House+1',
    images: ['https://via.placeholder.com/400x300?text=House+1a', 'https://via.placeholder.com/400x300?text=House+1b'],
    tags: ['海景', 'WiFi', '厨房'],
    facilities: ['WiFi', '工位', '厨房', '空调'],
    rating: 4.8,
    likes: 128,
    description: '温馨舒适的海景房，适合数字游民办公和度假。',
    host: { id: 'host_1', name: '房东小王', avatar: 'https://via.placeholder.com/100x100?text=Host+1' },
    reviews: [
      { id: 'r1', name: '旅行者张三', avatar: 'https://via.placeholder.com/100x100?text=User+1', rating: 5, content: '非常棒的体验！房间干净整洁，房东很热情。', time: '3天前', likeCount: 12, isLiked: false },
      { id: 'r2', name: '数字游民李四', avatar: 'https://via.placeholder.com/100x100?text=User+2', rating: 4, content: '位置很好，适合远程办公，网络稳定。', time: '1周前', likeCount: 8, isLiked: false, reply: '感谢您的好评，欢迎下次再来！', replyTime: '6天前' }
    ]
  },
  {
    _id: 'house_2',
    title: '大理古城·苍山脚下',
    location: '云南省大理白族自治州',
    price: 68,
    unit: '天',
    image: 'https://via.placeholder.com/400x300?text=House+2',
    images: ['https://via.placeholder.com/400x300?text=House+2'],
    tags: ['山景', '古城'],
    facilities: ['WiFi', '厨房'],
    rating: 4.6,
    likes: 89,
    description: '苍山脚下的安静小院，远离喧嚣。',
    host: { id: 'host_2', name: '房东小李', avatar: 'https://via.placeholder.com/100x100?text=Host+2' },
    reviews: [
      { id: 'r3', name: '文艺青年', avatar: 'https://via.placeholder.com/100x100?text=User+3', rating: 5, content: '太美了！每天早上醒来就能看到苍山，非常治愈。', time: '2天前', likeCount: 15, isLiked: false }
    ]
  },
  {
    _id: 'house_3',
    title: '黄山宏村·水墨人家',
    location: '安徽省黄山市黟县',
    price: 55,
    unit: '天',
    image: 'https://via.placeholder.com/400x300?text=House+3',
    images: ['https://via.placeholder.com/400x300?text=House+3'],
    tags: ['古镇', '山居'],
    facilities: ['WiFi', '停车'],
    rating: 4.9,
    likes: 156,
    description: '徽派建筑，感受水墨江南。',
    host: { id: 'host_3', name: '房东老张', avatar: 'https://via.placeholder.com/100x100?text=Host+3' },
    reviews: [
      { id: 'r4', name: '摄影师小王', avatar: 'https://via.placeholder.com/100x100?text=User+4', rating: 5, content: '拍照绝佳！每个角落都是风景。', time: '5天前', likeCount: 20, isLiked: false }
    ]
  }
]

// ========== 本地存储方法 ==========

function getLocalHouses() {
  try {
    const local = wx.getStorageSync(LOCAL_STORAGE_KEY)
    return local || mockHouses
  } catch (e) {
    return mockHouses
  }
}

function saveLocalHouse(houseData) {
  const houses = getLocalHouses()
  const newHouse = {
    ...houseData,
    _id: 'local_' + Date.now(),
    viewCount: 0,
    likeCount: 0,
    favoriteCount: 0,
    status: 'active',
    createTime: new Date().toISOString()
  }
  houses.unshift(newHouse)
  wx.setStorageSync(LOCAL_STORAGE_KEY, houses)
  return Promise.resolve(newHouse._id)
}

// ========== 统一接口（带降级） ==========

// 获取房源列表
function getHouseList() {
  if (USE_MOCK) {
    return Promise.resolve(mockHouses)
  }
  if (cloudModule && cloudModule.db) {
    const { db } = cloudModule
    return db.collection('houses')
      .orderBy('createTime', 'desc')
      .get()
      .then(res => res.data)
      .catch(err => {
        console.log('[houseService] 云端获取失败，使用本地数据:', err.message)
        return getLocalHouses()
      })
  }
  return Promise.resolve(getLocalHouses())
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
  if (cloudModule && cloudModule.db) {
    const { db } = cloudModule
    return db.collection('houses').doc(houseId).get()
      .then(res => res.data)
      .catch(err => {
        console.log('[houseService] 云端获取详情失败，使用本地数据:', err.message)
        const houses = getLocalHouses()
        return houses.find(h => h._id === houseId) || houses[0]
      })
  }
  const houses = getLocalHouses()
  return Promise.resolve(houses.find(h => h._id === houseId) || houses[0])
}

// 获取推荐房源（首页用）
function getRecommendedHouses() {
  if (cloudModule && cloudModule.db) {
    const { db } = cloudModule
    return db.collection('houses')
      .where({ recommend: true })
      .limit(3)
      .get()
      .then(res => res.data)
      .catch(() => mockHouses.slice(0, 3))
  }
  return Promise.resolve(mockHouses.slice(0, 3))
}

// 搜索房源
function searchHouses(keyword) {
  if (USE_MOCK) {
    const results = mockHouses.filter(h => 
      h.title.includes(keyword) || h.location.includes(keyword)
    )
    return Promise.resolve(results)
  }
  if (cloudModule && cloudModule.db) {
    const { db, _ } = cloudModule
    return db.collection('houses')
      .where(_.or([
        { title: db.RegExp({ regexp: keyword, options: 'i' }) },
        { location: db.RegExp({ regexp: keyword, options: 'i' }) }
      ]))
      .get()
      .then(res => res.data)
      .catch(() => [])
  }
  return Promise.resolve([])
}

// 发布房源（修改后的关键代码）
function publishHouse(houseData) {
  // 先保存到本地
  saveLocalHouse(houseData)
  
  // 尝试同步到云端
  if (cloudModule && cloudModule.db && !USE_MOCK) {
    const { db } = cloudModule
    const data = {
      ...houseData,
      // 注意：不要手动设置 _openid，云数据库会自动添加
      createTime: db.serverDate(),
      viewCount: 0
    }
    return db.collection('houses').add({ data }).then(res => res._id)
      .catch(err => {
        console.log('[houseService] 云端发布失败，已保存到本地:', err.message)
        return 'local_' + Date.now()
      })
  }
  return Promise.resolve('local_' + Date.now())
}

// 收藏房源（已迁移到 favoriteService）
function favoriteHouse(houseId, isFavorite) {
  // 使用统一的收藏服务
  const favoriteService = require('./favoriteService.js')
  if (isFavorite) {
    return favoriteService.favorite(houseId, 'house')
  } else {
    return favoriteService.unfavorite(houseId)
  }
}

module.exports = {
  getHouseList,
  getHouseById,
  getRecommendedHouses,
  searchHouses,
  publishHouse,
  favoriteHouse,
  // 暴露本地方法供调试
  getLocalHouses
}