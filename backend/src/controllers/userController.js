/**
 * 用户控制器
 * 功能：处理用户相关的HTTP请求
 */

const userModel = require('../models/user')
const uploadService = require('../services/uploadService')
const logger = require('../utils/logger')
const { BadRequestError, NotFoundError, UnauthorizedError } = require('../utils/errors')

// ============================================
// 获取当前用户信息
// ============================================
async function getCurrentUser(req, res, next) {
  try {
    // 从认证中间件获取用户ID
    const userId = req.user?.id
    
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const user = await userModel.findUserById(userId)
    
    if (!user) {
      throw new NotFoundError('用户不存在')
    }
    
    // 排除敏感字段
    const userData = {
      id: user.id,
      openid: user.openid,
      nickname: user.nickname,
      avatarUrl: user.avatar_url,
      gender: user.gender,
      bio: user.bio,
      phone: user.phone,
      wechat: user.wechat,
      province: user.province,
      city: user.city,
      identity: user.identity,
      identityVerified: user.identity_verified,
      theme: user.theme,
      appVersion: user.app_version,
      notificationEnabled: user.notification_enabled,
      postCount: user.post_count,
      orderCount: user.order_count,
      followerCount: user.follower_count,
      followingCount: user.following_count,
      createdAt: user.created_at
    }
    
    res.json({
      code: 0,
      message: '获取成功',
      data: userData
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 获取用户公开信息
// ============================================
async function getUserById(req, res, next) {
  try {
    const { userId } = req.params
    
    if (!userId) {
      throw new BadRequestError('用户ID不能为空')
    }
    
    const user = await userModel.getUserPublicInfo(parseInt(userId))
    
    if (!user) {
      throw new NotFoundError('用户不存在')
    }
    
    res.json({
      code: 0,
      message: '获取成功',
      data: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        gender: user.gender,
        bio: user.bio,
        province: user.province,
        city: user.city,
        identity: user.identity,
        identityVerified: user.identity_verified,
        postCount: user.post_count,
        followerCount: user.follower_count,
        followingCount: user.following_count,
        createdAt: user.created_at
      }
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 更新用户信息
// ============================================
async function updateUserInfo(req, res, next) {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const { nickname, bio, phone, wechat, province, city, gender } = req.body
    
    // 构建更新数据
    const updateData = {}
    if (nickname !== undefined) {
      if (nickname.length > 50) {
        throw new BadRequestError('昵称不能超过50个字符')
      }
      updateData.nickname = nickname
    }
    if (bio !== undefined) {
      if (bio.length > 200) {
        throw new BadRequestError('简介不能超过200个字符')
      }
      updateData.bio = bio
    }
    if (phone !== undefined) {
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        throw new BadRequestError('手机号格式不正确')
      }
      updateData.phone = phone
    }
    if (wechat !== undefined) {
      updateData.wechat = wechat
    }
    if (province !== undefined) {
      updateData.province = province
    }
    if (city !== undefined) {
      updateData.city = city
    }
    if (gender !== undefined) {
      updateData.gender = parseInt(gender)
    }
    
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError('没有需要更新的内容')
    }
    
    const success = await userModel.updateUser(userId, updateData)
    
    if (!success) {
      throw new BadRequestError('更新失败')
    }
    
    logger.info('更新用户信息成功', { userId, fields: Object.keys(updateData) })
    
    res.json({
      code: 0,
      message: '更新成功',
      data: { updatedFields: Object.keys(updateData) }
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 设置用户身份
// ============================================
async function setIdentity(req, res, next) {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const { identity } = req.body
    
    if (!identity) {
      throw new BadRequestError('请选择身份')
    }
    
    const validIdentities = ['villager', 'nomad']
    if (!validIdentities.includes(identity)) {
      throw new BadRequestError('无效的身份类型')
    }
    
    const success = await userModel.setIdentity(userId, identity)
    
    if (!success) {
      throw new BadRequestError('设置失败')
    }
    
    const identityNames = {
      villager: '村民',
      nomad: '数字游民'
    }
    
    logger.info('设置用户身份成功', { userId, identity })
    
    res.json({
      code: 0,
      message: `已设置为${identityNames[identity]}`,
      data: { identity }
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 更新用户设置
// ============================================
async function updateSettings(req, res, next) {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const { theme, appVersion, notificationEnabled, privacyMode } = req.body
    
    const updateData = {}
    
    if (theme !== undefined) {
      if (!['light', 'dark'].includes(theme)) {
        throw new BadRequestError('无效的主题设置')
      }
      updateData.theme = theme
    }
    
    if (appVersion !== undefined) {
      if (!['standard', 'elderly'].includes(appVersion)) {
        throw new BadRequestError('无效的应用版本')
      }
      updateData.app_version = appVersion
    }
    
    if (notificationEnabled !== undefined) {
      updateData.notification_enabled = notificationEnabled ? 1 : 0
    }
    
    if (privacyMode !== undefined) {
      updateData.privacy_mode = privacyMode ? 1 : 0
    }
    
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError('没有需要更新的设置')
    }
    
    const success = await userModel.updateUser(userId, updateData)
    
    if (!success) {
      throw new BadRequestError('更新失败')
    }
    
    logger.info('更新用户设置成功', { userId, settings: updateData })
    
    res.json({
      code: 0,
      message: '设置已保存'
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 上传头像
// ============================================
async function uploadAvatar(req, res, next) {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    if (!req.file) {
      throw new BadRequestError('请选择要上传的头像')
    }
    
    // 上传文件
    const result = await uploadService.uploadAvatar(req.file, userId)
    
    // 更新用户头像URL
    await userModel.updateAvatar(userId, result.url)
    
    logger.info('上传头像成功', { userId, url: result.url })
    
    res.json({
      code: 0,
      message: '上传成功',
      data: {
        avatarUrl: result.url
      }
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 获取用户统计数据
// ============================================
async function getUserStats(req, res, next) {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      throw new UnauthorizedError('请先登录')
    }
    
    const stats = await userModel.getUserStats(userId)
    
    if (!stats) {
      throw new NotFoundError('用户不存在')
    }
    
    res.json({
      code: 0,
      message: '获取成功',
      data: {
        postCount: stats.post_count,
        orderCount: stats.order_count,
        followerCount: stats.follower_count,
        followingCount: stats.following_count
      }
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 搜索用户
// ============================================
async function searchUsers(req, res, next) {
  try {
    const { keyword, limit = 20 } = req.query
    
    if (!keyword || keyword.trim().length === 0) {
      throw new BadRequestError('请输入搜索关键词')
    }
    
    const users = await userModel.searchUsers(keyword.trim(), parseInt(limit))
    
    res.json({
      code: 0,
      message: '搜索成功',
      data: users.map(user => ({
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        identity: user.identity,
        bio: user.bio
      }))
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getCurrentUser,
  getUserById,
  updateUserInfo,
  setIdentity,
  updateSettings,
  uploadAvatar,
  getUserStats,
  searchUsers
}
