/**
 * Vue Router 配置
 */

import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 页面组件
import HomePage from '../pages/index/index.vue'
import UserCenterPage from '../pages/user-center/index.vue'
import EditProfilePage from '../pages/user-center/edit-profile.vue'
import OrderListPage from '../pages/user-center/order-list.vue'
import PublishListPage from '../pages/user-center/publish-list.vue'
import HistoryListPage from '../pages/user-center/history-list.vue'
import ServiceSupportPage from '../pages/user-center/service-support.vue'
import SettingsPage from '../pages/user-center/settings.vue'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/pages/user-center/index'
  },
  {
    path: '/pages/index/index',
    component: HomePage,
    meta: { title: '首页' }
  },
  {
    path: '/pages/user-center/index',
    component: UserCenterPage,
    meta: { title: '用户中心' }
  },
  {
    path: '/pages/user-center/edit-profile',
    component: EditProfilePage,
    meta: { title: '编辑资料' }
  },
  {
    path: '/pages/user-center/order-list',
    component: OrderListPage,
    meta: { title: '我的交易' }
  },
  {
    path: '/pages/user-center/publish-list',
    component: PublishListPage,
    meta: { title: '我的发布' }
  },
  {
    path: '/pages/user-center/history-list',
    component: HistoryListPage,
    meta: { title: '我的记录' }
  },
  {
    path: '/pages/user-center/service-support',
    component: ServiceSupportPage,
    meta: { title: '服务与支持' }
  },
  {
    path: '/pages/user-center/settings',
    component: SettingsPage,
    meta: { title: '设置' }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫 - 更新页面标题
router.beforeEach((to, from, next) => {
  const title = to.meta.title as string
  if (title) {
    document.title = title
  }
  next()
})

export default router
