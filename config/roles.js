// 角色定义
const ROLES = {
  VILLAGER: '村民',
  NOMAD: '数字游民',
  ADMIN: '管理者'
}

// 权限配置
const PERMISSIONS = {
  // 村民权限
  [ROLES.VILLAGER]: {
    canPublishHouse: false,
    canPublishSkill: false,
    canManageOwnHouse: false,
    canManageAllHouse: false,
    canManageUsers: false
  },
  // 数字游民权限
  [ROLES.NOMAD]: {
    canPublishHouse: true,
    canPublishSkill: true,
    canManageOwnHouse: true,
    canManageAllHouse: false,
    canManageUsers: false
  },
  // 管理者权限
  [ROLES.ADMIN]: {
    canPublishHouse: true,
    canPublishSkill: true,
    canManageOwnHouse: true,
    canManageAllHouse: true,
    canManageUsers: true
  }
}

module.exports = {
  ROLES,
  PERMISSIONS
}