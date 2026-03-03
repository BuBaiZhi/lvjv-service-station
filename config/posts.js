const IDENTITIES = {
  VILLAGER: '村民',
  NOMAD: '数字游民'
}

const posts = [
  {
    id: 'post001',
    type: '活动',
    title: '过年不想孤零零宅家？E人的能量没处释放？！！',
    content: '收留过年不回家的社交牛X症患者！来NCC数字游民社区当代理主理人...',
    images: [
      'https://picsum.photos/600/400?random=1',
      'https://picsum.photos/600/400?random=2'
    ],
    author: {
      id: 'user001',
      name: '游牧鸟官方',
      avatar: 'https://picsum.photos/100/100?random=1',
      identity: IDENTITIES.NOMAD
    },
    likes: 18943,
    comments: 27,
    time: '27天前',
    tags: ['招募', '主理人', '过年'],
    isLiked: false,
    isCollected: false
  },
  {
    id: 'post002',
    type: '找搭子',
    title: '寻找深圳有趣的朋友',
    content: '刚搬到深圳想寻找有趣的朋友们平时一起玩...',
    images: [
      'https://picsum.photos/600/400?random=3',
      'https://picsum.photos/600/400?random=4'
    ],
    author: {
      id: 'user002',
      name: 'VK游民',
      avatar: 'https://picsum.photos/100/100?random=2',
      identity: IDENTITIES.VILLAGER
    },
    likes: 45,
    comments: 12,
    time: '刚刚',
    tags: ['深圳', '搭子', '交友'],
    isLiked: false,
    isCollected: false
  },
  {
    id: 'post003',
    type: '技能变现',
    title: '【预算5000】新媒体运营',
    content: '重点培训实用性的短视频拍摄及剪辑制作...',
    images: [
      'https://picsum.photos/600/400?random=5',
      'https://picsum.photos/600/400?random=6'
    ],
    author: {
      id: 'user003',
      name: '数字乡建',
      avatar: 'https://picsum.photos/100/100?random=3',
      identity: IDENTITIES.NOMAD
    },
    likes: 9597,
    comments: 8,
    time: '30天前',
    tags: ['招募', '短视频', '培训'],
    isLiked: false,
    isCollected: false
  }
]

const categories = [
  { id: 'rec', name: '推荐' },
  { id: 'latest', name: '最新' },
  { id: 'samecity', name: '同城' },
  { id: 'partner', name: '找搭子' }
]

module.exports = {
  posts,
  categories,
  IDENTITIES
}