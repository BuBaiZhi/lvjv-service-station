/**
 * 用户中心 Pinia Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Order, PublishItem, HistoryItem, FavoriteItem, UserSettings } from '../types/user'
import { mockUser, mockOrders, mockPublishItems, mockBrowseHistory, mockFavorites } from '../mock/userData'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User>(mockUser)
  const orders = ref<Order[]>(mockOrders)
  const publishItems = ref<PublishItem[]>(mockPublishItems)
  const browseHistory = ref<HistoryItem[]>(mockBrowseHistory)
  const favorites = ref<FavoriteItem[]>(mockFavorites)
  const settings = ref<UserSettings>({
    notificationEnabled: true,
    privacyMode: false,
    identity: 'villager',
    theme: 'light',
    appVersion: 'standard'
  })

  // 计算属性
  const userInfo = computed(() => user.value)
  
  const orderStats = computed(() => ({
    total: orders.value.length,
    pending: orders.value.filter(o => o.status === 'pending').length,
    confirmed: orders.value.filter(o => o.status === 'confirmed').length,
    completed: orders.value.filter(o => o.status === 'completed').length
  }))

  const publishStats = computed(() => ({
    total: publishItems.value.length,
    published: publishItems.value.filter(p => p.status === 'published').length,
    draft: publishItems.value.filter(p => p.status === 'draft').length,
    offline: publishItems.value.filter(p => p.status === 'offline').length
  }))

  // 获取订单列表（按类型筛选）
  const getOrdersByType = (type?: string) => {
    if (!type) return orders.value
    return orders.value.filter(o => o.type === type)
  }

  // 获取发布内容（按类型筛选）
  const getPublishByType = (type?: string) => {
    if (!type) return publishItems.value
    return publishItems.value.filter(p => p.type === type)
  }

  // 添加浏览历史
  const addBrowseHistory = (item: HistoryItem) => {
    // 移除重复项
    browseHistory.value = browseHistory.value.filter(h => h.id !== item.id)
    // 添加到最前面
    browseHistory.value.unshift(item)
    // 只保留最近100条
    if (browseHistory.value.length > 100) {
      browseHistory.value = browseHistory.value.slice(0, 100)
    }
  }

  // 清空浏览历史
  const clearBrowseHistory = () => {
    browseHistory.value = []
  }

  // 添加收藏
  const addFavorite = (item: FavoriteItem) => {
    const exists = favorites.value.find(f => f.id === item.id)
    if (!exists) {
      favorites.value.unshift(item)
    }
  }

  // 移除收藏
  const removeFavorite = (id: string) => {
    favorites.value = favorites.value.filter(f => f.id !== id)
  }

  // 检查是否已收藏
  const isFavorited = (id: string) => {
    return favorites.value.some(f => f.id === id)
  }

  // 更新用户信息
  const updateUserInfo = (newInfo: Partial<User>) => {
    user.value = { ...user.value, ...newInfo }
  }

  // 更新用户设置
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
  }

  // 切换身份
  const switchIdentity = (identity: 'villager' | 'nomad') => {
    user.value.identity = identity
    settings.value.identity = identity
  }

  // 删除发布内容
  const deletePublish = (id: string) => {
    publishItems.value = publishItems.value.filter(p => p.id !== id)
  }

  // 下架发布内容
  const offlinePublish = (id: string) => {
    const item = publishItems.value.find(p => p.id === id)
    if (item) {
      item.status = 'offline'
    }
  }

  // 发布草稿
  const publishDraft = (id: string) => {
    const item = publishItems.value.find(p => p.id === id)
    if (item) {
      item.status = 'published'
      item.updateTime = new Date().toISOString().split('T')[0]
    }
  }

  // 删除订单
  const deleteOrder = (id: string) => {
    orders.value = orders.value.filter(o => o.id !== id)
  }

  return {
    // 状态
    user,
    orders,
    publishItems,
    browseHistory,
    favorites,
    settings,
    
    // 计算属性
    userInfo,
    orderStats,
    publishStats,
    
    // 方法
    getOrdersByType,
    getPublishByType,
    addBrowseHistory,
    clearBrowseHistory,
    addFavorite,
    removeFavorite,
    isFavorited,
    updateUserInfo,
    updateSettings,
    switchIdentity,
    deletePublish,
    offlinePublish,
    publishDraft,
    deleteOrder
  }
})
