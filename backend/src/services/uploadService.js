/**
 * 文件上传服务
 * 功能：统一处理文件上传，支持本地存储和OSS
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const logger = require('../utils/logger')
const { BadRequestError, InternalServerError } = require('../utils/errors')

// 上传目录
const UPLOAD_DIR = path.join(__dirname, '../../uploads')

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  fs.mkdirSync(path.join(UPLOAD_DIR, 'avatars'), { recursive: true })
  fs.mkdirSync(path.join(UPLOAD_DIR, 'images'), { recursive: true })
  fs.mkdirSync(path.join(UPLOAD_DIR, 'documents'), { recursive: true })
}

/**
 * 文件类型配置
 */
const FILE_TYPES = {
  image: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  avatar: {
    mimeTypes: ['image/jpeg', 'image/png'],
    extensions: ['.jpg', '.jpeg', '.png'],
    maxSize: 2 * 1024 * 1024, // 2MB
  },
  document: {
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.pdf', '.doc', '.docx'],
    maxSize: 10 * 1024 * 1024, // 10MB
  }
}

/**
 * 生成唯一文件名
 */
function generateFileName(originalName) {
  const ext = path.extname(originalName).toLowerCase()
  const timestamp = Date.now()
  const random = crypto.randomBytes(8).toString('hex')
  return `${timestamp}_${random}${ext}`
}

/**
 * 验证文件类型
 */
function validateFileType(file, type) {
  const config = FILE_TYPES[type]
  if (!config) {
    throw new BadRequestError(`不支持的文件类型: ${type}`)
  }
  
  // 检查MIME类型
  if (!config.mimeTypes.includes(file.mimetype)) {
    throw new BadRequestError(`文件类型不支持，允许的类型: ${config.extensions.join(', ')}`)
  }
  
  // 检查文件大小
  if (file.size > config.maxSize) {
    const maxSizeMB = (config.maxSize / 1024 / 1024).toFixed(1)
    throw new BadRequestError(`文件大小超出限制，最大允许 ${maxSizeMB}MB`)
  }
  
  // 检查扩展名
  const ext = path.extname(file.originalname).toLowerCase()
  if (!config.extensions.includes(ext)) {
    throw new BadRequestError(`文件扩展名不支持`)
  }
  
  return true
}

/**
 * 本地存储上传
 */
class LocalUploadService {
  /**
   * 上传单个文件
   */
  async uploadFile(file, type = 'image', subDir = '') {
    try {
      // 验证文件
      validateFileType(file, type)
      
      // 生成文件名
      const fileName = generateFileName(file.originalname)
      
      // 目标目录
      const targetDir = subDir 
        ? path.join(UPLOAD_DIR, type + 's', subDir)
        : path.join(UPLOAD_DIR, type + 's')
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
      }
      
      // 目标路径
      const targetPath = path.join(targetDir, fileName)
      
      // 写入文件
      if (file.buffer) {
        // Multer memory storage
        fs.writeFileSync(targetPath, file.buffer)
      } else if (file.path) {
        // Multer disk storage
        fs.renameSync(file.path, targetPath)
      }
      
      // 返回访问URL
      const relativePath = path.relative(UPLOAD_DIR, targetPath).replace(/\\/g, '/')
      const url = `/uploads/${relativePath}`
      
      logger.info(`文件上传成功: ${url}`)
      
      return {
        url,
        fileName,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      }
    } catch (error) {
      logger.error(`文件上传失败: ${error.message}`)
      throw error
    }
  }
  
  /**
   * 上传多个文件
   */
  async uploadFiles(files, type = 'image', subDir = '') {
    const results = []
    for (const file of files) {
      const result = await this.uploadFile(file, type, subDir)
      results.push(result)
    }
    return results
  }
  
  /**
   * 删除文件
   */
  async deleteFile(url) {
    try {
      // 从URL提取相对路径
      const relativePath = url.replace('/uploads/', '')
      const filePath = path.join(UPLOAD_DIR, relativePath)
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        logger.info(`文件删除成功: ${url}`)
        return true
      }
      return false
    } catch (error) {
      logger.error(`文件删除失败: ${error.message}`)
      return false
    }
  }
  
  /**
   * 获取文件信息
   */
  getFileInfo(url) {
    const relativePath = url.replace('/uploads/', '')
    const filePath = path.join(UPLOAD_DIR, relativePath)
    
    if (!fs.existsSync(filePath)) {
      return null
    }
    
    const stats = fs.statSync(filePath)
    return {
      url,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    }
  }
}

/**
 * OSS上传服务（预留接口）
 * 生产环境可接入阿里云OSS、腾讯云COS等
 */
class OSSUploadService {
  constructor() {
    // TODO: 初始化OSS客户端
    this.enabled = false
  }
  
  async uploadFile(file, type = 'image', subDir = '') {
    // TODO: 实现OSS上传
    throw new InternalServerError('OSS服务未配置')
  }
  
  async uploadFiles(files, type = 'image', subDir = '') {
    // TODO: 实现OSS批量上传
    throw new InternalServerError('OSS服务未配置')
  }
  
  async deleteFile(url) {
    // TODO: 实现OSS删除
    throw new InternalServerError('OSS服务未配置')
  }
}

/**
 * 统一上传服务
 * 根据配置选择存储方式
 */
class UploadService {
  constructor() {
    // 根据环境变量选择存储方式
    const storageType = process.env.UPLOAD_STORAGE || 'local'
    
    if (storageType === 'oss') {
      this.service = new OSSUploadService()
    } else {
      this.service = new LocalUploadService()
    }
    
    this.storageType = storageType
  }
  
  /**
   * 上传头像
   */
  async uploadAvatar(file, userId) {
    return this.service.uploadFile(file, 'avatar', String(userId))
  }
  
  /**
   * 上传图片
   */
  async uploadImage(file) {
    return this.service.uploadFile(file, 'image')
  }
  
  /**
   * 上传多张图片
   */
  async uploadImages(files) {
    return this.service.uploadFiles(files, 'image')
  }
  
  /**
   * 上传文档
   */
  async uploadDocument(file) {
    return this.service.uploadFile(file, 'document')
  }
  
  /**
   * 删除文件
   */
  async deleteFile(url) {
    return this.service.deleteFile(url)
  }
  
  /**
   * 获取文件信息
   */
  getFileInfo(url) {
    if (this.service instanceof LocalUploadService) {
      return this.service.getFileInfo(url)
    }
    return null
  }
}

// 导出单例
const uploadService = new UploadService()

module.exports = {
  uploadService,
  UploadService,
  LocalUploadService,
  OSSUploadService,
  FILE_TYPES,
  validateFileType,
  generateFileName
}
