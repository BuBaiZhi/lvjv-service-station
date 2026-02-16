<template>
  <div class="user-center">
    <!-- 主要内容区域（包含用户卡片和菜单） -->
    <div class="content-scroll">
      <!-- 页面顶部状态栏 -->
      <div class="status-bar"></div>

      <!-- 用户信息卡片 -->
      <UserCard />

      <!-- 功能入口卡片 -->
      <div class="modules-container">
        <!-- 我的交易 -->
        <div class="module-card" @click="navigateTo('order-list')">
          <div class="module-icon">📦</div>
          <div class="module-name">我的交易</div>
          <div class="module-arrow">›</div>
        </div>

        <!-- 我的发布 -->
        <div class="module-card" @click="navigateTo('publish-list')">
          <div class="module-icon">📝</div>
          <div class="module-name">我的发布</div>
          <div class="module-arrow">›</div>
        </div>

        <!-- 我的记录 -->
        <div class="module-card" @click="navigateTo('history-list')">
          <div class="module-icon">📋</div>
          <div class="module-name">我的记录</div>
          <div class="module-arrow">›</div>
        </div>

        <!-- 服务与支持 -->
        <div class="module-card" @click="navigateTo('service-support')">
          <div class="module-icon">🆘</div>
          <div class="module-name">服务与支持</div>
          <div class="module-arrow">›</div>
        </div>

        <!-- 设置 -->
        <div class="module-card" @click="navigateTo('settings')">
          <div class="module-icon">⚙️</div>
          <div class="module-name">设置</div>
          <div class="module-arrow">›</div>
        </div>
      </div>

      <!-- 底部间距 -->
      <div class="bottom-spacing"></div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">加载中...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import UserCard from '../../components/UserCard.vue'

// 状态管理
const router = useRouter()
const userStore = useUserStore()
const isLoading = ref(false)

// 页面初始化
onMounted(() => {
  initPage()
})

// 初始化页面
const initPage = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 500)
}

// 导航到二级页面
const navigateTo = (page: string) => {
  const routeMap: Record<string, string> = {
    'order-list': '/pages/user-center/order-list',
    'publish-list': '/pages/user-center/publish-list',
    'history-list': '/pages/user-center/history-list',
    'service-support': '/pages/user-center/service-support',
    'settings': '/pages/user-center/settings'
  }
  
  const path = routeMap[page]
  if (path) {
    router.push(path)
  }
}

// 上拉加载
const onReachBottom = () => {
  console.log('到达底部')
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

.user-center {
  width: 100%;
  height: 100vh;
  background-color: $bg-secondary;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .content-scroll {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .status-bar {
    height: 20px;
  }

  .modules-container {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    width: 100%;
    padding: $spacing-lg;
  }

  .module-card {
    background-color: white;
    border-radius: $radius-lg;
    padding: $spacing-md $spacing-lg;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    box-shadow: $shadow-sm;
    transition: all 0.3s ease;
    position: relative;
    cursor: pointer;
    min-height: 50px;
    border: 1px solid $border-light;

    &:hover {
      box-shadow: $shadow-md;
      background-color: $bg-secondary;
    }

    &:active {
      transform: scale(0.98);
      box-shadow: $shadow-md;
    }

    .module-icon {
      font-size: 24px;
      margin-right: $spacing-md;
      flex-shrink: 0;
      line-height: 1;
    }

    .module-name {
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      color: $text-primary;
      text-align: left;
      margin: 0;
      flex: 1;
    }

    .module-arrow {
      font-size: $font-size-lg;
      color: $primary-color;
      margin-left: $spacing-md;
      flex-shrink: 0;
      opacity: 0.6;
      transition: opacity 0.3s ease;
    }

    &:hover .module-arrow {
      opacity: 1;
    }
  }

  .bottom-spacing {
    height: $spacing-3xl;
  }

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    .loading-spinner {
      background-color: white;
      padding: 20px 40px;
      border-radius: 8px;
      font-size: 16px;
      color: #333;
    }
  }
}
</style>
