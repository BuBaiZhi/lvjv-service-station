/**
 * HTTP 请求工具
 * 统一处理所有 HTTP 请求，包括拦截、错误处理等
 */

import { getApiConfig, REQUEST_TIMEOUT, getErrorMessage } from './api.config'

// 请求配置接口
interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  header?: Record<string, string>
  timeout?: number
}

// 响应接口
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 发送 HTTP 请求
 */
export const request = async <T = any>(config: RequestConfig): Promise<T> => {
  const apiConfig = getApiConfig()
  const url = `${apiConfig.baseURL}${config.url}`
  const timeout = config.timeout || REQUEST_TIMEOUT

  try {
    const response = await uni.request({
      url,
      method: config.method || 'GET',
      data: config.data,
      header: {
        'Content-Type': 'application/json',
        ...config.header
      },
      timeout
    })

    // 处理响应
    return handleResponse<T>(response)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * GET 请求
 */
export const get = <T = any>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<T> => {
  return request<T>({
    ...config,
    url,
    method: 'GET'
  })
}

/**
 * POST 请求
 */
export const post = <T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<T> => {
  return request<T>({
    ...config,
    url,
    method: 'POST',
    data
  })
}

/**
 * PUT 请求
 */
export const put = <T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<T> => {
  return request<T>({
    ...config,
    url,
    method: 'PUT',
    data
  })
}

/**
 * DELETE 请求
 */
export const del = <T = any>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<T> => {
  return request<T>({
    ...config,
    url,
    method: 'DELETE'
  })
}

/**
 * 处理响应
 */
const handleResponse = <T = any>(response: any): T => {
  const { statusCode, data } = response

  // 检查 HTTP 状态码
  if (statusCode >= 200 && statusCode < 300) {
    // 成功响应
    if (data.code === 0 || data.code === 200) {
      return data.data || data
    } else {
      // API 返回错误
      throw new Error(data.message || '请求失败')
    }
  } else if (statusCode === 401) {
    // 未授权，需要重新登录
    uni.showToast({
      title: '登录已过期，请重新登录',
      icon: 'none'
    })
    // 这里可以跳转到登录页
    throw new Error('未授权')
  } else if (statusCode === 404) {
    throw new Error('请求资源不存在')
  } else if (statusCode >= 500) {
    throw new Error('服务器错误，请稍后重试')
  } else {
    throw new Error(getErrorMessage(statusCode))
  }
}

/**
 * 处理错误
 */
const handleError = (error: any): never => {
  let message = '网络请求失败'

  if (error.errMsg) {
    if (error.errMsg.includes('timeout')) {
      message = '请求超时，请检查网络'
    } else if (error.errMsg.includes('abort')) {
      message = '请求被中断'
    } else {
      message = error.errMsg
    }
  }

  uni.showToast({
    title: message,
    icon: 'none'
  })

  throw new Error(message)
}

/**
 * 批量请求
 */
export const all = <T = any>(requests: Promise<any>[]): Promise<T[]> => {
  return Promise.all(requests)
}

/**
 * 竞速请求（返回最快的响应）
 */
export const race = <T = any>(requests: Promise<any>[]): Promise<T> => {
  return Promise.race(requests)
}
