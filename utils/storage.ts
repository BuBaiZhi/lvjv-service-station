/**
 * 本地存储工具函数
 */

/**
 * 设置本地存储
 * @param key 存储键
 * @param value 存储值
 */
export const setStorage = (key: string, value: any): void => {
  try {
    uni.setStorageSync(key, JSON.stringify(value))
  } catch (error) {
    console.error(`设置存储失败 [${key}]:`, error)
  }
}

/**
 * 获取本地存储
 * @param key 存储键
 * @param defaultValue 默认值
 */
export const getStorage = <T = any>(key: string, defaultValue?: T): T | null => {
  try {
    const data = uni.getStorageSync(key)
    if (data) {
      return JSON.parse(data) as T
    }
    return defaultValue || null
  } catch (error) {
    console.error(`获取存储失败 [${key}]:`, error)
    return defaultValue || null
  }
}

/**
 * 移除本地存储
 * @param key 存储键
 */
export const removeStorage = (key: string): void => {
  try {
    uni.removeStorageSync(key)
  } catch (error) {
    console.error(`移除存储失败 [${key}]:`, error)
  }
}

/**
 * 清空所有本地存储
 */
export const clearStorage = (): void => {
  try {
    uni.clearStorageSync()
  } catch (error) {
    console.error('清空存储失败:', error)
  }
}

/**
 * 存储浏览历史
 */
export const saveBrowseHistory = (history: any[]): void => {
  setStorage('browse_history', history)
}

/**
 * 获取浏览历史
 */
export const getBrowseHistory = (): any[] => {
  return getStorage('browse_history', []) || []
}

/**
 * 存储收藏内容
 */
export const saveFavorites = (favorites: any[]): void => {
  setStorage('favorite_items', favorites)
}

/**
 * 获取收藏内容
 */
export const getFavorites = (): any[] => {
  return getStorage('favorite_items', []) || []
}

/**
 * 存储用户设置
 */
export const saveUserSettings = (settings: any): void => {
  setStorage('user_settings', settings)
}

/**
 * 获取用户设置
 */
export const getUserSettings = (): any => {
  return getStorage('user_settings', {}) || {}
}

/**
 * 存储用户身份
 */
export const saveUserIdentity = (identity: string): void => {
  setStorage('user_identity', identity)
}

/**
 * 获取用户身份
 */
export const getUserIdentity = (): string => {
  return getStorage('user_identity', 'villager') || 'villager'
}
