const IDENTITIES = {
  VILLAGER: '村民',
  NOMAD: '数字游民'
}

const mockPosts = [
  {
    id: 'post001',
    type: '活动',
    title: '过年不想孤零零宅家？E人的能量没处释放？！！',
    content: '收留过年不回家的社交牛X症患者！来NCC数字游民社区当代理主理人..',
    images: [],
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
    title: '寻找深圳有趣的朋友们平时一起玩',
    content: '刚搬到深圳想寻找有趣的朋友们平时一起玩，可以DeepTalk，散步约饭...',
    images: [],
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
    title: '【预算5000】新媒体运营（短视频拍摄及剪辑制作）',
    content: '重点培训实用性的短视频拍摄及剪辑制作，培养2名以上能熟练掌握并独立完成的镇村干部...',
    images: [],
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
  IDENTITIES,
  mockPosts,
  categories
}