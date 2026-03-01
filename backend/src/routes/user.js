/**
 * 用户路由
 * 路径前缀: /api/user
 */

const express = require('express')
const router = express.Router()
const multer = require('multer')

// 中间件
const { verifyAccessToken } = require('../middleware/auth')
const { rateLimit, getRateLimit } = require('../middleware/rateLimit')

// 控制器
const userController = require('../controllers/userController')

// ============================================
// Multer配置 - 内存存储
// ============================================
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 限制2MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('只支持图片文件'), false)
    }
  }
})

// ============================================
// 路由定义
// ============================================

/**
 * GET /api/user/me
 * 获取当前登录用户信息
 * 需要认证
 */
router.get('/me', verifyAccessToken, userController.getCurrentUser)

/**
 * GET /api/user/stats
 * 获取当前用户统计数据
 * 需要认证
 */
router.get('/stats', verifyAccessToken, userController.getUserStats)

/**
 * GET /api/user/search
 * 搜索用户
 */
router.get('/search', rateLimit({ windowMs: 60 * 1000, max: 20 }), userController.searchUsers)

/**
 * GET /api/user/:userId
 * 获取用户公开信息
 */
router.get('/:userId', userController.getUserById)

/**
 * PUT /api/user/info
 * 更新用户信息
 * 需要认证
 */
router.put('/info', verifyAccessToken, userController.updateUserInfo)

/**
 * POST /api/user/identity
 * 设置用户身份
 * 需要认证
 */
router.post('/identity', 
  verifyAccessToken,
  rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }),
  userController.setIdentity
)

/**
 * PUT /api/user/settings
 * 更新用户设置
 * 需要认证
 */
router.put('/settings', verifyAccessToken, userController.updateSettings)

/**
 * POST /api/user/avatar
 * 上传头像
 * 需要认证
 */
router.post('/avatar',
  verifyAccessToken,
  getRateLimit('upload'),
  upload.single('file'),
  userController.uploadAvatar
)

module.exports = router
