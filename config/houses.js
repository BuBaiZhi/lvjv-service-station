// 房源数据配置文件
const houses = [
  {
    id: '1',
    title: '三亚NCC社区·唯吾岛',
    price: 45,
    unit: '天',
    location: '海南省三亚市崖州区崖城镇镇海村委会',
    distance: '距海边200米',
    rating: 4.9,
    commentCount: 128,
    image: 'https://picsum.photos/600/400?random=1',
    images: [
      'https://picsum.photos/600/400?random=1',
      'https://picsum.photos/600/400?random=2',
      'https://picsum.photos/600/400?random=3'
    ],
    facilities: ['WiFi', '工位', '厨房', '洗衣机', '热水', '空调', '投影', '停车'],
    tags: ['出门是海', '硬件顶配', '环岛据点'],
    features: ['WiFi', '工位', '厨房', '活动区'],
    latitude: 18.2529,
    longitude: 109.5120,
    host: {
      id: 'host001',
      name: 'NCC社区',
      avatar: 'https://picsum.photos/100/100?random=4',
      identity: '数字游民',
      desc: '数字游民社区主理人 · 环岛据点'
    },
    description: '出门是海，硬件顶配，暖冬必选。NCC社区三亚据点，专为数字游民打造的共居共创空间。步行2分钟到海边，配备专业工位、高速WiFi、多功能厅、厨房等设施。每周举办分享会、工作坊、海边日出瑜伽等活动。',
    reviews: [
      {
        id: 'r1',
        name: '小陈在流浪',
        avatar: 'https://picsum.photos/100/100?random=5',
        rating: 5.0,
        time: '3天前',
        content: '环境超棒！出门就是海，工位很舒服，网速快。认识了几个有趣的小伙伴，下次还会来。'
      }
    ]
  },
  {
    id: '2',
    title: '黔县数字乡建',
    price: 38,
    unit: '天',
    location: '安徽黄山黔县碧阳镇',
    distance: '距宏村景区3公里',
    rating: 4.8,
    commentCount: 56,
    image: 'https://picsum.photos/600/400?random=2',
    images: [
      'https://picsum.photos/600/400?random=7',
      'https://picsum.photos/600/400?random=8',
      'https://picsum.photos/600/400?random=9'
    ],
    facilities: ['WiFi', '工位', '庭院', '茶室', '自行车'],
    tags: ['数字游民', '共创空间', '安静'],
    features: ['WiFi', '工位', '庭院', '茶室'],
    latitude: 29.9246,
    longitude: 117.9386,
    host: {
      id: 'host002',
      name: '数字乡建',
      avatar: 'https://picsum.photos/100/100?random=10',
      identity: '数字游民',
      desc: '乡村建设者 · 共创空间主理人'
    },
    description: '徽派建筑改造的数字游民共居空间，白墙黛瓦，安静怡人。配备专业工位、高速网络，定期举办乡村振兴主题沙龙。',
    reviews: []
  },
  {
    id: '3',
    title: '大理共居社区',
    price: 52,
    unit: '天',
    location: '云南大理古城西门村',
    distance: '距古城步行10分钟',
    rating: 4.7,
    commentCount: 89,
    image: 'https://picsum.photos/600/400?random=3',
    images: [
      'https://picsum.photos/600/400?random=12',
      'https://picsum.photos/600/400?random=13',
      'https://picsum.photos/600/400?random=14'
    ],
    facilities: ['WiFi', '工位', '厨房', '院子', '每周活动'],
    tags: ['苍山洱海', '自由职业者', '每周活动'],
    features: ['WiFi', '工位', '院子', '活动'],
    latitude: 25.6866,
    longitude: 100.1575,
    host: {
      id: 'host003',
      name: '大理共居',
      avatar: 'https://picsum.photos/100/100?random=15',
      identity: '数字游民',
      desc: '大理数字游民社区 · 活动组织者'
    },
    description: '位于大理古城边的数字游民社区，有一个大院子，每周举办分享会、徒步、集市等活动。',
    reviews: []
  }
]

// 房源列表页用的简化数据
const houseList = houses.map(house => ({
  id: house.id,
  title: house.title,
  price: house.price,
  unit: house.unit,
  location: house.location,
  distance: house.distance,
  rating: house.rating,
  commentCount: house.commentCount,
  image: house.image,
  tags: house.tags,
  features: house.features,
  latitude: house.latitude,
  longitude: house.longitude
}))

module.exports = {
  houses,
  houseList
}