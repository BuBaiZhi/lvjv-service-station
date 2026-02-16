/**
 * 用户中心 Mock 数据
 */

import type { User, Order, PublishItem, HistoryItem, FavoriteItem } from '../types/user'

// Mock 用户信息
export const mockUser: User = {
  id: 'user_001',
  avatar: 'https://via.placeholder.com/100',
  nickname: '山里的小王',
  gender: 'male',
  identity: 'villager',
  bio: '热爱乡村生活，欢迎各位游民来我们村体验',
  postCount: 24,
  commentCount: 156,
  likeCount: 89,
  joinDate: '2024-01-15'
}

// Mock 订单列表
export const mockOrders: Order[] = [
  {
    id: 'order_001',
    type: 'house',
    title: '山景民宿 - 2间卧室',
    image: 'https://via.placeholder.com/200x150',
    price: 288,
    status: 'completed',
    createTime: '2024-02-01',
    updateTime: '2024-02-05',
    description: '舒适的山景民宿，适合度假'
  },
  {
    id: 'order_002',
    type: 'activity',
    title: '春节庙会活动',
    image: 'https://via.placeholder.com/200x150',
    price: 0,
    status: 'confirmed',
    createTime: '2024-02-08',
    updateTime: '2024-02-08',
    description: '参加村里的春节庙会'
  },
  {
    id: 'order_003',
    type: 'skill',
    title: '农业种植技能咨询',
    image: 'https://via.placeholder.com/200x150',
    price: 99,
    status: 'pending',
    createTime: '2024-02-10',
    updateTime: '2024-02-10',
    description: '学习有机蔬菜种植技巧'
  },
  {
    id: 'order_004',
    type: 'house',
    title: '田园小屋 - 1间卧室',
    image: 'https://via.placeholder.com/200x150',
    price: 188,
    status: 'completed',
    createTime: '2024-01-20',
    updateTime: '2024-01-25',
    description: '宁静的田园小屋'
  }
]

// Mock 发布内容
export const mockPublishItems: PublishItem[] = [
  {
    id: 'pub_001',
    type: 'house',
    title: '山景民宿 - 2间卧室',
    image: 'https://via.placeholder.com/200x150',
    status: 'published',
    createTime: '2024-01-10',
    updateTime: '2024-02-10',
    viewCount: 234,
    likeCount: 45,
    description: '舒适的山景民宿，适合度假'
  },
  {
    id: 'pub_002',
    type: 'activity',
    title: '春节庙会活动',
    image: 'https://via.placeholder.com/200x150',
    status: 'published',
    createTime: '2024-01-15',
    updateTime: '2024-02-08',
    viewCount: 567,
    likeCount: 89,
    description: '参加村里的春节庙会'
  },
  {
    id: 'pub_003',
    type: 'skill',
    title: '有机蔬菜种植技能分享',
    image: 'https://via.placeholder.com/200x150',
    status: 'published',
    createTime: '2024-02-01',
    updateTime: '2024-02-09',
    viewCount: 123,
    likeCount: 34,
    description: '分享20年的种植经验'
  },
  {
    id: 'pub_004',
    type: 'post',
    title: '村里的冬天真美',
    image: 'https://via.placeholder.com/200x150',
    status: 'published',
    createTime: '2024-01-20',
    updateTime: '2024-01-20',
    viewCount: 456,
    likeCount: 78,
    description: '分享村里冬天的风景'
  },
  {
    id: 'pub_005',
    type: 'house',
    title: '田园小屋 - 1间卧室',
    image: 'https://via.placeholder.com/200x150',
    status: 'draft',
    createTime: '2024-02-05',
    updateTime: '2024-02-05',
    viewCount: 0,
    likeCount: 0,
    description: '宁静的田园小屋'
  }
]

// Mock 浏览历史
export const mockBrowseHistory: HistoryItem[] = [
  {
    id: 'hist_001',
    type: 'house',
    title: '海景别墅 - 3间卧室',
    image: 'https://via.placeholder.com/200x150',
    viewTime: '2024-02-10 14:30',
    url: '/pages/house-detail/index?id=house_001'
  },
  {
    id: 'hist_002',
    type: 'activity',
    title: '乡村手工艺工坊',
    image: 'https://via.placeholder.com/200x150',
    viewTime: '2024-02-10 12:15',
    url: '/pages/activity-detail/index?id=activity_001'
  },
  {
    id: 'hist_003',
    type: 'skill',
    title: '茶艺表演技能',
    image: 'https://via.placeholder.com/200x150',
    viewTime: '2024-02-09 18:45',
    url: '/pages/skill-detail/index?id=skill_001'
  },
  {
    id: 'hist_004',
    type: 'post',
    title: '春天的田野',
    image: 'https://via.placeholder.com/200x150',
    viewTime: '2024-02-09 10:20',
    url: '/pages/post-detail/index?id=post_001'
  }
]

// Mock 收藏内容
export const mockFavorites: FavoriteItem[] = [
  {
    id: 'fav_001',
    type: 'house',
    title: '山景民宿 - 2间卧室',
    image: 'https://via.placeholder.com/200x150',
    collectTime: '2024-02-08',
    url: '/pages/house-detail/index?id=house_001'
  },
  {
    id: 'fav_002',
    type: 'activity',
    title: '春节庙会活动',
    image: 'https://via.placeholder.com/200x150',
    collectTime: '2024-02-07',
    url: '/pages/activity-detail/index?id=activity_001'
  },
  {
    id: 'fav_003',
    type: 'skill',
    title: '有机蔬菜种植技能',
    image: 'https://via.placeholder.com/200x150',
    collectTime: '2024-02-06',
    url: '/pages/skill-detail/index?id=skill_001'
  }
]
