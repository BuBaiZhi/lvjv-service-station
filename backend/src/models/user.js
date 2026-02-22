const pool = require('../config/database')

/**
 * 用户模型 - 数据库操作层
 * 原因：将数据库操作集中在模型层，保持代码清晰和可维护性
 * 功能：提供用户的增删改查操作
 */

/**
 * 根据 openid 查找用户
 * @param {string} openid - 微信唯一标识
 * @returns {Promise<Object|null>} 用户记录或 null
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
    console.error('[DB] findUserByOpenid 失败:', error.message)
    throw error
  }
}

/**
 * 创建新用户
 * @param {Object} userData - 用户数据
 * @returns {Promise<number>} 新用户的 ID
 */
async function createUser(userData) {
  const { openid, nickname, avatar_url, gender, province, city, country } = userData
  try {
    const connection = await pool.getConnection()
    const [result] = await connection.query(
      `INSERT INTO users (openid, nickname, avatar_url, gender, province, city, country, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [openid, nickname, avatar_url, gender, province, city, country]
    )
    connection.release()
    console.log(`[DB] 创建新用户: ${openid}`)
    return result.insertId
  } catch (error) {
    console.error('[DB] createUser 失败:', error.message)
    throw error
  }
}

/**
 * 更新用户信息
 * @param {number} userId - 用户 ID
 * @param {Object} updateData - 要更新的数据
 * @returns {Promise<boolean>} 是否更新成功
 */
async function updateUser(userId, updateData) {
  try {
    const connection = await pool.getConnection()
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updateData)
    values.push(userId)

    const [result] = await connection.query(
      `UPDATE users SET ${fields}, updated_at = NOW() WHERE id = ?`,
      values
    )
    connection.release()
    return result.affectedRows > 0
  } catch (error) {
    console.error('[DB] updateUser 失败:', error.message)
    throw error
  }
}

module.exports = {
  findUserByOpenid,
  createUser,
  updateUser
}
