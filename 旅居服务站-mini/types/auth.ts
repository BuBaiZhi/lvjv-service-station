/**
 * 认证相关类型定义
 * types/auth.ts
 */

/**
 * 🌟 双 Token 模式 - 生产级标准
 * accessToken: 短期（1~2小时），用于 API 请求
 * refreshToken: 长期（7天），用于刷新 accessToken
 */
interface AuthTokens {
  accessToken: string       // 短期 token（1~2小时）
  refreshToken: string      // 长期 token（7天）
  expiresIn: number         // accessToken 过期时间（秒）
}

/**
 * 登录请求参数
 */
interface LoginRequest {
  code?: string              // 微信登录 code
  phoneNumber?: string       // 手机号
  userInfo?: {
    nickName: string
    avatarUrl: string
    gender: 0 | 1 | 2       // 0未知 1男 2女
    province?: string
    city?: string
  }
  method: 'wechat' | 'phone' | 'guest'
}

/**
 * 登录响应数据
 */
interface LoginResponse {
  accessToken: string       // 🌟 短期 token
  refreshToken: string      // 🌟 长期 token
  expiresIn: number         // token 过期时间
  userInfo: {
    id: string
    nickName: string
    avatarUrl: string
    gender: 0 | 1 | 2
    identity?: 'villager' | 'visitor'  // 身份：villager/visitor
    createdAt: string
  }
}

/**
 * 刷新 Token 响应
 */
interface RefreshTokenResponse {
  accessToken: string
  refreshToken?: string     // 可选：后端可能返回新的 refreshToken
  expiresIn: number
}

/**
 * 用户完整信息
 */
interface UserInfo {
  id: string
  nickName: string
  avatarUrl: string
  gender: 0 | 1 | 2
  identity: 'villager' | 'visitor'
  phone?: string
  province: string
  city: string
  signature?: string
  level?: number            // 用户等级
  createdAt: string
  updatedAt: string
}

/**
 * 全局认证状态
 */
interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  userInfo: UserInfo | null
  isLogin: boolean
  isGuest: boolean
}

/**
 * 身份选择参数
 */
interface IdentityUpdateRequest {
  identity: 'villager' | 'visitor'
}

module.exports = {
  // 导出类型给其他模块使用
}
