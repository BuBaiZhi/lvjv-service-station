// utils/cloud.js
const db = wx.cloud.database()
const _ = db.command

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