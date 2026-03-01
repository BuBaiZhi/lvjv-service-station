/**
 * 用户模型 - 数据库操作层
 * 功能：提供用户的完整CRUD操作
 */

const pool = require('../config/database')
const logger = require('../utils/logger')

// ============================================
// 查询操作
// ============================================

/**
 * 根据ID查找用户
 * @param {number} userId - 用户ID
 * @returns {Promise<Object|null>} 用户记录或null
 */
async function findUserById(userId) {
  try {
    const connection = await pool.getConnection()
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    )
    connection.release()
    return rows.length > 0 ? rows[0] : null
  } catch (error) {
    logger.error('findUserById 失败', { userId, error: error.message })
    throw error
  }
}

/**
 * 根据openid查找用户
 * @param {string} openid - 微信唯一标识
 * @returns {Promise<Object|null>} 用户记录或null
 */
async function findUserByOpenid(openid) {
  try {
    const connection = await pool.getConnection()
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE openid = ?',
      [openid]
    )
    connection.release()
    return rows.length > 0 ? rows[0] : null
  } catch (error) {
    logger.error('findUserByOpenid 失败', { openid, error: error.message })
    throw error
  }
}

/**
 * 根据手机号查找用户
 * @param {string} phone - 手机号
 * @returns {Promise<Object|null>} 用户记录或null
 */
async function findUserByPhone(phone) {
  try {
    const connection = await pool.getConnection()
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE phone = ?',
      [phone]
    )
    connection.release()
    return rows.length > 0 ? rows[0] : null
  } catch (error) {
    logger.error('findUserByPhone 失败', { phone, error: error.message })
    throw error
  }
}

/**
 * 获取用户公开信息（排除敏感字段）
 * @param {number} userId - 用户ID
 * @returns {Promise<Object|null>} 用户公开信息
 */
async function getUserPublicInfo(userId) {
  try {
    const connection = await pool.getConnection()
    const [rows] = await connection.query(
      `SELECT 
        id, nickname, avatar_url, gender, bio, province, city,
        identity, identity_verified, post_count, follower_count, 
        following_count, created_at
       FROM users WHERE id = ?`,
      [userId]
    )
    connection.release()
    return rows.length > 0 ? rows[0] : null
  } catch (error) {
    logger.error('getUserPublicInfo 失败', { userId, error: error.message })
    throw error
  }
}

/**
 * 搜索用户
 * @param {string} keyword - 搜索关键词
 * @param {number} limit - 限制数量
 * @returns {Promise<Array>} 用户列表
 */
async function searchUsers(keyword, limit = 20) {
  try {
    const connection = await pool.getConnection()
    const [rows] = await connection.query(
      `SELECT id, nickname, avatar_url, identity, bio
       FROM users 
       WHERE (nickname LIKE ? OR bio LIKE ?) AND status = 'active'
       ORDER BY follower_count DESC
       LIMIT ?`,
      [`%${keyword}%`, `%${keyword}%`, limit]
    )
    connection.release()
    return rows
  } catch (error) {
    logger.error('searchUsers 失败', { keyword, error: error.message })
    throw error
  }
}

// ============================================
// 创建操作
// ============================================

/**
 * 创建新用户
 * @param {Object} userData - 用户数据
 * @returns {Promise<number>} 新用户ID
 */
async function createUser(userData) {
  const { openid, nickname, avatar_url, gender, province, city, country } = userData
  try {
    const connection = await pool.getConnection()
    const [result] = await connection.query(
      `INSERT INTO users (openid, nickname, avatar_url, gender, province, city, country)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [openid, nickname || '旅居用户', avatar_url || '', gender || 0, province, city, country]
    )
    connection.release()
    logger.info('创建新用户', { openid, userId: result.insertId })
    return result.insertId
  } catch (error) {
    logger.error('createUser 失败', { openid, error: error.message })
    throw error
  }
}

// ============================================
// 更新操作
// ============================================

/**
 * 更新用户信息
 * @param {number} userId - 用户ID
 * @param {Object} updateData - 更新数据
 * @returns {Promise<boolean>} 是否更新成功
 */
async function updateUser(userId, updateData) {
  try {
    // 过滤允许更新的字段
    const allowedFields = [
      'nickname', 'avatar_url', 'gender', 'bio', 'phone', 'wechat',
      'province', 'city', 'identity', 'theme', 'app_version',
      'notification_enabled', 'privacy_mode'
    ]
    
    const filteredData = {}
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        filteredData[key] = value
      }
    }
    
    if (Object.keys(filteredData).length === 0) {
      return false
    }
    
    const connection = await pool.getConnection()
    const fields = Object.keys(filteredData).map(key => `${key} = ?`).join(', ')
    const values = [...Object.values(filteredData), userId]
    
    const [result] = await connection.query(
      `UPDATE users SET ${fields} WHERE id = ?`,
      values
    )
    connection.release()
    
    logger.info('更新用户信息', { userId, fields: Object.keys(filteredData) })
    return result.affectedRows > 0
  } catch (error) {
    logger.error('updateUser 失败', { userId, error: error.message })
    throw error
  }
}

/**
 * 更新用户头像
 * @param {number} userId - 用户ID
 * @param {string} avatarUrl - 头像URL
 * @returns {Promise<boolean>} 是否更新成功
 */
async function updateAvatar(userId, avatarUrl) {
  try {
    const connection = await pool.getConnection()
    const [result] = await connection.query(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [avatarUrl, userId]
    )
    connection.release()
    logger.info('更新用户头像', { userId })
    return result.affectedRows > 0
  } catch (error) {
    logger.error('updateAvatar 失败', { userId, error: error.message })
    throw error
  }
}

/**
 * 设置用户身份
 * @param {number} userId - 用户ID
 * @param {string} identity - 身份类型
 * @returns {Promise<boolean>} 是否更新成功
 */
async function setIdentity(userId, identity) {
  const validIdentities = ['villager', 'nomad', 'unset']
  if (!validIdentities.includes(identity)) {
    throw new Error('无效的身份类型')
  }
  
  try {
    const connection = await pool.getConnection()
    const [result] = await connection.query(
      'UPDATE users SET identity = ? WHERE id = ?',
      [identity, userId]
    )
    connection.release()
    logger.info('设置用户身份', { userId, identity })
    return result.affectedRows > 0
  } catch (error) {
    logger.error('setIdentity 失败', { userId, error: error.message })
    throw error
  }
}

/**
 * 更新最后登录时间
 * @param {number} userId - 用户ID
 * @returns {Promise<void>}
 */
async function updateLastLogin(userId) {
  try {
    const connection = await pool.getConnection()
    await connection.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [userId]
    )
    connection.release()
  } catch (error) {
    logger.error('updateLastLogin 失败', { userId, error: error.message })
    // 不抛出错误，登录时间更新失败不影响登录
  }
}

/**
 * 增加发布计数
 * @param {number} userId - 用户ID
 * @returns {Promise<void>}
 */
async function incrementPostCount(userId) {
  try {
    const connection = await pool.getConnection()
    await connection.query(
      'UPDATE users SET post_count = post_count + 1 WHERE id = ?',
      [userId]
    )
    connection.release()
  } catch (error) {
    logger.error('incrementPostCount 失败', { userId, error: error.message })
  }
}

/**
 * 更新粉丝/关注计数
 * @param {number} userId - 用户ID
 * @param {string} field - follower_count 或 following_count
 * @param {number} delta - 变化量 (+1 或 -1)
 */
async function updateFollowCount(userId, field, delta) {
  try {
    const connection = await pool.getConnection()
    await connection.query(
      `UPDATE users SET ${field} = ${field} + ? WHERE id = ?`,
      [delta, userId]
    )
    connection.release()
  } catch (error) {
    logger.error('updateFollowCount 失败', { userId, field, error: error.message })
  }
}

// ============================================
// 删除操作
// ============================================

/**
 * 软删除用户（设置status为deleted）
 * @param {number} userId - 用户ID
 * @returns {Promise<boolean>} 是否删除成功
 */
async function deleteUser(userId) {
  try {
    const connection = await pool.getConnection()
    const [result] = await connection.query(
      "UPDATE users SET status = 'deleted' WHERE id = ?",
      [userId]
    )
    connection.release()
    logger.info('删除用户', { userId })
    return result.affectedRows > 0
  } catch (error) {
    logger.error('deleteUser 失败', { userId, error: error.message })
    throw error
  }
}

// ============================================
// 统计操作
// ============================================

/**
 * 获取用户统计数据
 * @param {number} userId - 用户ID
 * @returns {Promise<Object>} 统计数据
 */
async function getUserStats(userId) {
  try {
    const connection = await pool.getConnection()
    const [rows] = await connection.query(
      `SELECT post_count, order_count, follower_count, following_count
       FROM users WHERE id = ?`,
      [userId]
    )
    connection.release()
    return rows[0] || null
  } catch (error) {
    logger.error('getUserStats 失败', { userId, error: error.message })
    throw error
  }
}

module.exports = {
  // 查询
  findUserById,
  findUserByOpenid,
  findUserByPhone,
  getUserPublicInfo,
  searchUsers,
  
  // 创建
  createUser,
  
  // 更新
  updateUser,
  updateAvatar,
  setIdentity,
  updateLastLogin,
  incrementPostCount,
  updateFollowCount,
  
  // 删除
  deleteUser,
  
  // 统计
  getUserStats
}
