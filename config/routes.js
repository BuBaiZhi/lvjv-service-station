// config/routes.js
module.exports = {
  // 认证相关路由
  AUTH: {
    LOGIN: '/pages/auth/login/index',
    IDENTITY: '/pages/auth/identity/index'
  },
  
  // 首页相关路由
  HOME: {
    INDEX: '/pages/home/index/index',
    SEARCH: '/pages/home/search/search'
  },
  
  // 用户中心路由
  USER: {
    PROFILE: '/pages/user/profile/profile',
    EDIT_PROFILE: '/pages/user/edit-profile/index',
    ORDERS: '/pages/user/orders/index',
    PUBLISH_LIST: '/pages/user/publish-list/index',
    DRAFTS: '/pages/user/drafts/index',
    HISTORY: '/pages/user/history/index',
    SUPPORT: '/pages/user/support/index',
    SETTINGS: '/pages/user/settings/index',
    MESSAGE: '/pages/user/message/chat'
  },
  
  // 房源相关路由
  HOUSE: {
    DETAIL: '/pages/house/detail/detail',
    PUBLISH: '/pages/house/publish/publish',
    BOOKING: '/pages/house/booking/booking',
    LISTING: '/pages/house/listing/listing',
    MAP_PICKER: '/pages/house/map-picker/map-picker'
  },
  
  // 广场相关路由
  SQUARE: {
    INDEX: '/pages/square/index/index',
    DETAIL: '/pages/square/detail/detail',
    SEARCH: '/pages/square/search/search',
    PUBLISH: '/pages/square/publish/publish',
    REVIEWS: '/pages/square/reviews/reviews',
    WRITE_REVIEW: '/pages/square/write-review/write-review'
  },
  
  // 管理相关路由
  ADMIN: {
    DASHBOARD: '/pages/admin/index',
    USERS: '/pages/admin/users',
    AUDIT: '/pages/admin/audit',
    STATS: '/pages/admin/stats'
  },
  
  // 公共页面路由
  COMMON: {
    REPORT_SUCCESS: '/pages/common/report-success/report-success'
  }
}
