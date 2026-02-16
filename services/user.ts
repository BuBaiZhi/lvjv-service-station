/**
 * 用户相关 API 服务
 * 当前阶段使用 Mock 数据，后期可直接替换为真实 API 调用
 */

import type { User, Order, PublishItem, HistoryItem, FavoriteItem } from '../types/user'
import { mockUser, mockOrders, mockPublishItems, mockBrowseHistory, mockFavorites } from '../mock/userData'
import { get, post, put, del } from './http'
import { API_ENDPOINTS } from './api.config'

/**
 * 获取用户信息
 */
export const fetchUserInfo = async (): Promise<User> => {
  try {
    // 后期替换为真实 API 调用
    // return get<User>(API_ENDPOINTS.user.info)
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockUser)
      }, 300)
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    throw error
  }
}

/**
 * 获取订单列表
 */
export const fetchOrders = async (type?: string): Promise<Order[]> => {
  try {
    // 后期替换为真实 API 调用
    // return get<Order[]>(API_ENDPOINTS.orders.list, { data: { type } })
    
    return new Promise((resolve) => {
      setTimeout(() => {
        if (type) {
          resolve(mockOrders.filter(o => o.type === type))
        } else {
          resolve(mockOrders)
        }
      }, 300)
    })
  } catch (error) {
    console.error('获取订单列表失败:', error)
    throw error
  }
}

/**
 * 获取发布内容列表
 */
export const fetchPublishItems = async (type?: string): Promise<PublishItem[]> => {
  try {
    // 后期替换为真实 API 调用
    // return get<PublishItem[]>(API_ENDPOINTS.publish.list, { data: { type } })
    
    return new Promise((resolve) => {
      setTimeout(() => {
        if (type) {
          resolve(mockPublishItems.filter(p => p.type === type))
        } else {
          resolve(mockPublishItems)
        }
      }, 300)
    })
  } catch (error) {
    console.error('获取发布内容失败:', error)
    throw error
  }
}

/**
 * 获取浏览历史
 */
export const fetchBrowseHistory = async (): Promise<HistoryItem[]> => {
  try {
    // 后期替换为真实 API 调用
    // return get<HistoryItem[]>(API_ENDPOINTS.history.list)
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockBrowseHistory)
      }, 300)
    })
  } catch (error) {
    console.error('获取浏览历史失败:', error)
    throw error
  }
}

/**
 * 获取收藏列表
 */
export const fetchFavorites = async (): Promise<FavoriteItem[]> => {
  try {
    // 后期替换为真实 API 调用
    // return get<FavoriteItem[]>(API_ENDPOINTS.favorites.list)
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockFavorites)
      }, 300)
    })
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    throw error
  }
}

/**
 * 更新用户信息
 */
export const updateUserInfo = async (userInfo: Partial<User>): Promise<User> => {
  try {
    // 后期替换为真实 API 调用
    // return post<User>(API_ENDPOINTS.user.update, userInfo)
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockUser, ...userInfo })
      }, 300)
    })
  } catch (error) {
    console.error('更新用户信息失败:', error)
    throw error
  }
}

/**
 * 删除订单
 */
export const deleteOrder = async (orderId: string): Promise<boolean> => {
  try {
    // 后期替换为真实 API 调用
    // await del(API_ENDPOINTS.orders.delete.replace(':id', orderId))
    // return true
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 300)
    })
  } catch (error) {
    console.error('删除订单失败:', error)
    throw error
  }
}

/**
 * 删除发布内容
 */
export const deletePublish = async (publishId: string): Promise<boolean> => {
  try {
    // 后期替换为真实 API 调用
    // await del(API_ENDPOINTS.publish.delete.replace(':id', publishId))
    // return true
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 300)
    })
  } catch (error) {
    console.error('删除发布内容失败:', error)
    throw error
  }
}

/**
 * 下架发布内容
 */
export const offlinePublish = async (publishId: string): Promise<boolean> => {
  try {
    // 后期替换为真实 API 调用
    // await post(API_ENDPOINTS.publish.offline.replace(':id', publishId))
    // return true
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 300)
    })
  } catch (error) {
    console.error('下架发布内容失败:', error)
    throw error
  }
}

/**
 * 发布草稿
 */
export const publishDraft = async (publishId: string): Promise<boolean> => {
  try {
    // 后期替换为真实 API 调用
    // await post(API_ENDPOINTS.publish.publish.replace(':id', publishId))
    // return true
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 300)
    })
  } catch (error) {
    console.error('发布草稿失败:', error)
    throw error
  }
}

/**
 * 上传头像
 */
export const uploadAvatar = async (filePath: string): Promise<string> => {
  try {
    // 后期替换为真实 API 调用
    // const response = await uni.uploadFile({
    //   url: `${getApiConfig().baseURL}${API_ENDPOINTS.user.avatar}`,
    //   filePath: filePath,
    //   name: 'file'
    // })
    // return JSON.parse(response.data).url
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('https://via.placeholder.com/100')
      }, 500)
    })
  } catch (error) {
    console.error('上传头像失败:', error)
    throw error
  }
}

/**
 * 清空浏览历史
 */
export const clearBrowseHistory = async (): Promise<boolean> => {
  try {
    // 后期替换为真实 API 调用
    // await post(API_ENDPOINTS.history.clear)
    // return true
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 300)
    })
  } catch (error) {
    console.error('清空浏览历史失败:', error)
    throw error
  }
}

/**
 * 添加收藏
 */
export const addFavorite = async (itemId: string): Promise<boolean> => {
  try {
    // 后期替换为真实 API 调用
    // await post(API_ENDPOINTS.favorites.add, { itemId })
    // return true
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 300)
    })
  } catch (error) {
    console.error('添加收藏失败:', error)
    throw error
  }
}

/**
 * 移除收藏
 */
export const removeFavorite = async (itemId: string): Promise<boolean> => {
  try {
    // 后期替换为真实 API 调用
    // await del(API_ENDPOINTS.favorites.delete.replace(':id', itemId))
    // return true
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 300)
    })
  } catch (error) {
    console.error('移除收藏失败:', error)
    throw error
  }
}
