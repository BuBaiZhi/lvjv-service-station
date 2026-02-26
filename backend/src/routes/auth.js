const express = require('express')
const { login, refreshAccessToken } = require('../controllers/authController')

const router = express.Router()

/**
 * 路由模块 - 定义认证相关的 API 路由
 * 原因：将路由定义分离出来，保持代码组织清晰
 * 功能：定义 POST /api/auth/login 和 POST /api/auth/refresh 两个端点
 */

/**
 * POST /api/auth/login
 * 微信小程序登录接口
 * 
 * 请求体：
 * {
 *   "code": "string",          // wx.login() 获取的临时登录码
 *   "userInfo": {
 *     "nickName": "string",
 *     "avatarUrl": "string",
 *     "gender": 0|1|2,
 *     "province": "string",
 *     "city": "string",
 *     "country": "string"
 *   }
 * }
 * 
 * 响应成功 (200, code: 0)：
 * {
 *   "code": 0,
 *   "data": {
 *     "accessToken": "eyJhbGc...",
 *     "refreshToken": "eyJhbGc...",
 *     "userInfo": {
 *       "id": 1,
 *       "nickName": "用户昵称",
 *       "avatarUrl": "https://...",
 *       "identity": null,  // 首次登录为 null
 *       "createdAt": "2026-02-21T10:30:00Z"
 *     }
 *   }
 * }
 * 
 * 响应失败 (401, code: 401)：
 * {
 *   "code": 401,
 *   "message": "微信登录失败"
 * }
 */
router.post('/login', login)

/**
 * POST /api/auth/refresh
 * 刷新 accessToken 接口
 * 
 * 请求体：
 * {
 *   "refreshToken": "eyJhbGc..."
 * }
 * 
 * 响应成功 (200, code: 0)：
 * {
 *   "code": 0,
 *   "data": {
 *     "accessToken": "eyJhbGc..."  // 新的 accessToken
 *   }
 * }
 */
router.post('/refresh', refreshAccessToken)

module.exports = router
