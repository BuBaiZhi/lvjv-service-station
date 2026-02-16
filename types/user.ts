/**
 * 用户相关类型定义
 */

// 用户身份类型
export type UserIdentity = 'villager' | 'nomad'

// 用户基本信息
export interface User {
  id: string
  avatar: string
  nickname: string
  gender?: 'male' | 'female' | 'other'
  identity: UserIdentity
  bio: string
  postCount: number
  commentCount: number
  likeCount: number
  joinDate: string
}

// 订单类型
export type OrderType = 'house' | 'activity' | 'skill'
export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Order {
  id: string
  type: OrderType
  title: string
  image: string
  price: number
  status: OrderStatus
  createTime: string
  updateTime: string
  description?: string
}

// 发布内容类型
export type PublishType = 'house' | 'activity' | 'skill' | 'post'
export type PublishStatus = 'draft' | 'published' | 'offline'

export interface PublishItem {
  id: string
  type: PublishType
  title: string
  image: string
  status: PublishStatus
  createTime: string
  updateTime: string
  viewCount: number
  likeCount: number
  description?: string
}

// 历史记录类型
export interface HistoryItem {
  id: string
  type: PublishType
  title: string
  image: string
  viewTime: string
  url?: string
}

// 收藏项目
export interface FavoriteItem {
  id: string
  type: PublishType
  title: string
  image: string
  collectTime: string
  url?: string
}

// 用户设置
export interface UserSettings {
  notificationEnabled: boolean
  privacyMode: boolean
  identity: UserIdentity
  theme?: 'light' | 'dark'
  appVersion?: 'standard' | 'elderly'
}

// 服务咨询
export interface ConsultMessage {
  id: string
  content: string
  sender: 'user' | 'service'
  timestamp: string
  type: 'text' | 'image'
}
