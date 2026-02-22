require('dotenv').config()
const mysql = require('mysql2/promise')

/**
 * MySQL 连接池配置
 * 原因：使用连接池而非单个连接，可以支持并发请求，提高性能
 * 功能：导出连接池实例，供业务代码调用
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

module.exports = pool
