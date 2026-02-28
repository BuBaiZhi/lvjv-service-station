// utils/cloud.js
// 延迟初始化数据库，确保云开发已初始化
let _db = null
let _cmd = null

// 获取数据库实例（延迟初始化）
function getDb() {
  if (!_db) {
    _db = wx.cloud.database()
    _cmd = _db.command
  }
  return _db
}

// 获取命令对象
function getCommand() {
  if (!_cmd) {
    getDb()
  }
  return _cmd
}

// 兼容旧代码的导出方式
const db = {
  get collection() {
    return getDb().collection.bind(getDb())
  },
  get serverDate() {
    return getDb().serverDate.bind(getDb())
  },
  get RegExp() {
    return getDb().RegExp.bind(getDb())
  }
}

const _ = {
  get or() {
    return getCommand().or.bind(getCommand())
  },
  get inc() {
    return getCommand().inc.bind(getCommand())
  },
  get push() {
    return getCommand().push.bind(getCommand())
  },
  get pop() {
    return getCommand().pop.bind(getCommand())
  },
  get set() {
    return getCommand().set.bind(getCommand())
  },
  get remove() {
    return getCommand().remove.bind(getCommand())
  }
}

// 获取当前用户openid
function getOpenid() {
  return wx.getStorageSync('openid') || ''
}

// 上传图片
function uploadImage(filePath, folder = 'images') {
  const ext = filePath.match(/\.[^.]+$/)[0]
  const cloudPath = folder + '/' + Date.now() + ext
  
  return wx.cloud.uploadFile({
    cloudPath: cloudPath,
    filePath: filePath
  }).then(res => res.fileID)
}

// 批量上传图片
function uploadImages(filePaths, folder = 'images') {
  const promises = filePaths.map(path => uploadImage(path, folder))
  return Promise.all(promises)
}

module.exports = {
  db,
  _,
  getOpenid,
  uploadImage,
  uploadImages
}