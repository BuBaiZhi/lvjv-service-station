const { PERMISSIONS } = require('../config/roles.js')

// 获取当前用户角色（从全局数据或存储中）
function getCurrentUserRole() {
  const app = getApp()
  return app.globalData.userInfo?.role || '村民' // 默认村民
}

// 检查是否有某个权限
function hasPermission(permissionName) {
  const role = getCurrentUserRole()
  return PERMISSIONS[role]?.[permissionName] || false
}

// 检查是否是指定角色
function isRole(roleName) {
  const role = getCurrentUserRole()
  return role === roleName
}

module.exports = {
  getCurrentUserRole,
  hasPermission,
  isRole
}