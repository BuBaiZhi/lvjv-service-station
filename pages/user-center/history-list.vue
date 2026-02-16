<template>
  <div class="history-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <button class="btn-back" @click="goBack">←</button>
      <div class="page-title">我的记录</div>
      <div class="btn-placeholder"></div>
    </div>

    <!-- Tabs 切换 -->
    <div class="tabs">
      <button
        v-for="(tab, index) in tabList"
        :key="index"
        class="tab-btn"
        :class="{ active: currentTab === index }"
        @click="onTabChange(index)"
      >
        {{ tab }}
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 浏览历史 Tab -->
      <div v-show="currentTab === 0" class="tab-content">
        <div class="header">
          <div class="title">浏览历史</div>
          <button class="btn-clear" @click="clearHistory">清空</button>
        </div>

        <div class="list-scroll">
          <div class="list-container">
            <div v-if="browseHistory.length === 0" class="empty-state">
              <div class="empty-icon">📋</div>
              <div class="empty-text">暂无浏览历史</div>
            </div>

            <div v-else class="history-items">
              <div
                v-for="item in browseHistory"
                :key="item.id"
                class="history-item"
                @click="goToDetail(item)"
              >
                <!-- 历史图片 -->
                <img :src="item.image" class="history-image" />

                <!-- 历史信息 -->
                <div class="history-info">
                  <div class="history-title">{{ item.title }}</div>
                  <div class="history-type">{{ typeLabel(item.type) }}</div>
                  <div class="history-time">{{ item.viewTime }}</div>
                </div>

                <!-- 删除按钮 -->
                <div class="history-actions">
                  <button class="btn-delete" @click.stop="deleteHistory(item.id)">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 收藏 Tab -->
      <div v-show="currentTab === 1" class="tab-content">
        <div class="header">
          <div class="title">我的收藏</div>
          <button class="btn-clear" @click="clearFavorites">清空</button>
        </div>

        <div class="list-scroll">
          <div class="list-container">
            <div v-if="favorites.length === 0" class="empty-state">
              <div class="empty-icon">❤️</div>
              <div class="empty-text">暂无收藏内容</div>
            </div>

            <div v-else class="favorite-items">
              <div
                v-for="item in favorites"
                :key="item.id"
                class="favorite-item"
                @click="goToFavoritesDetail(item)"
              >
                <!-- 收藏图片 -->
                <img :src="item.image" class="favorite-image" />

                <!-- 收藏信息 -->
                <div class="favorite-info">
                  <div class="favorite-title">{{ item.title }}</div>
                  <div class="favorite-type">{{ typeLabel(item.type) }}</div>
                  <div class="favorite-time">{{ formatDate(item.collectTime) }}</div>
                </div>

                <!-- 取消收藏按钮 -->
                <div class="favorite-actions">
                  <button class="btn-unfavorite" @click.stop="unfavorite(item.id)">取消</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import type { HistoryItem, FavoriteItem } from '../../types/user'

// 状态管理
const router = useRouter()
const userStore = useUserStore()
const currentTab = ref(0)

// Tabs 配置
const tabList = ['浏览历史', '我的收藏']

// 获取浏览历史
const browseHistory = computed(() => userStore.browseHistory)

// 获取收藏列表
const favorites = computed(() => userStore.favorites)

// 类型标签
const typeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    house: '房源',
    activity: '活动',
    skill: '技能',
    post: '交流'
  }
  return typeMap[type] || type
}

// Tab 切换
const onTabChange = (index: number) => {
  currentTab.value = index
}

// 返回上级页面
const goBack = () => {
  router.go(-1)
}

// 跳转详情
const goToDetail = (item: HistoryItem) => {
  if (typeof uni === 'undefined') {
    alert(`详情页面：${item.title}`)
  } else {
    if (item.url) {
      uni.navigateTo({ url: item.url })
    }
  }
}

// 跳转收藏详情
const goToFavoritesDetail = (item: FavoriteItem) => {
  if (typeof uni === 'undefined') {
    alert(`收藏详情页面：${item.title}`)
  } else {
    if (item.url) {
      uni.navigateTo({ url: item.url })
    }
  }
}

// 删除单条历史
const deleteHistory = (historyId: string) => {
  const index = userStore.browseHistory.findIndex(h => h.id === historyId)
  if (index > -1) {
    userStore.browseHistory.splice(index, 1)
    if (typeof uni === 'undefined') {
      alert('已删除')
    } else {
      uni.showToast({ title: '已删除', icon: 'success' })
    }
  }
}

// 取消收藏
const unfavorite = (favoriteId: string) => {
  userStore.removeFavorite(favoriteId)
  if (typeof uni === 'undefined') {
    alert('已取消收藏')
  } else {
    uni.showToast({ title: '已取消收藏', icon: 'success' })
  }
}

// 清空浏览历史
const clearHistory = () => {
  if (typeof uni === 'undefined') {
    if (confirm('确定要清空所有浏览历史吗？')) {
      userStore.clearBrowseHistory()
      alert('已清空')
    }
  } else {
    uni.showModal({
      title: '清空历史',
      content: '确定要清空所有浏览历史吗？',
      success: (res) => {
        if (res.confirm) {
          userStore.clearBrowseHistory()
          uni.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  }
}

// 清空收藏
const clearFavorites = () => {
  if (typeof uni === 'undefined') {
    if (confirm('确定要清空所有收藏吗？')) {
      userStore.favorites.splice(0, userStore.favorites.length) // 清空收藏数组
      alert('已清空收藏')
    }
  } else {
    uni.showModal({
      title: '清空收藏',
      content: '确定要清空所有收藏吗？',
      success: (res) => {
        if (res.confirm) {
          userStore.favorites.splice(0, userStore.favorites.length) // 清空收藏数组
          uni.showToast({ title: '已清空收藏', icon: 'success' })
        }
      }
    })
  }
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 上拉加载
const onReachBottom = () => {
  console.log('到达底部')
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

.history-list-page {
  width: 100%;
  height: 100vh;
  background-color: $bg-secondary;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .page-header {
    height: 56px;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 $spacing-lg;
    box-shadow: $shadow-md;
    position: relative;
    z-index: 10;

    .btn-back {
      padding: 0;
      margin: 0;
      border: none;
      background: none;
      font-size: 24px;
      color: $primary-color;
      cursor: pointer;
      transition: opacity 0.3s ease;

      &:hover {
        opacity: 0.7;
      }

      &:active {
        transform: scale(0.95);
      }
    }

    .page-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }

    .btn-placeholder {
      width: 24px;
    }
  }

  .tabs {
    display: flex;
    padding: $spacing-lg;
    background-color: $bg-primary;
    border-bottom: 1px solid $border-light;
    gap: $spacing-md;
    overflow-x: auto;

    .tab-btn {
      padding: 8px 16px;
      margin: 0;
      border: none;
      background-color: transparent;
      color: $text-secondary;
      border-radius: $radius-md;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      cursor: pointer;
      transition: all $transition-base;
      white-space: nowrap;

      &.active {
        background-color: $primary-color;
        color: white;
      }

      &:hover {
        background-color: $bg-secondary;
      }
    }
  }

  .content-area {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .tab-content {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg;
    background-color: $bg-primary;
    border-bottom: 1px solid $border-light;

    .title {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }

    .btn-clear {
      padding: 6px 12px;
      margin: 0;
      border: none;
      background-color: $error-color;
      color: white;
      border-radius: $radius-md;
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      transition: background-color $transition-base;
      cursor: pointer;

      &:hover {
        background-color: darken($error-color, 10%);
      }

      &:active {
        background-color: darken($error-color, 20%);
      }
    }
  }

  .list-scroll {
    flex: 1;
    overflow-y: auto;
  }

  .list-container {
    padding: $spacing-lg;

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: $spacing-3xl $spacing-lg;
      color: $text-secondary;

      .empty-icon {
        font-size: 48px;
        margin-bottom: $spacing-lg;
      }

      .empty-text {
        font-size: $font-size-base;
      }
    }

    .history-items,
    .favorite-items {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;

      .history-item,
      .favorite-item {
        background: $bg-primary;
        border-radius: $radius-lg;
        box-shadow: $shadow-sm;
        padding: $spacing-lg;
        display: flex;
        gap: $spacing-md;
        cursor: pointer;
        transition: box-shadow $transition-base;

        &:hover {
          box-shadow: $shadow-md;
        }

        &:active {
          box-shadow: $shadow-lg;
        }

        .history-image,
        .favorite-image {
          width: 80px;
          height: 80px;
          border-radius: $radius-md;
          flex-shrink: 0;
          object-fit: cover;
        }

        .history-info,
        .favorite-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          .history-title,
          .favorite-title {
            font-size: $font-size-base;
            font-weight: $font-weight-medium;
            color: $text-primary;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .history-type,
          .favorite-type {
            font-size: $font-size-sm;
            color: $primary-color;
            font-weight: $font-weight-medium;
          }

          .history-time,
          .favorite-time {
            font-size: $font-size-xs;
            color: $text-hint;
          }
        }

        .history-actions,
        .favorite-actions {
          display: flex;
          align-items: center;

          .btn-delete,
          .btn-unfavorite {
            padding: 6px 12px;
            margin: 0;
            border: none;
            background-color: $error-color;
            color: white;
            border-radius: $radius-md;
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            transition: background-color $transition-base;
            cursor: pointer;

            &:hover {
              background-color: darken($error-color, 10%);
            }

            &:active {
              background-color: darken($error-color, 20%);
            }
          }
        }
      }
    }
  }
}
</style>
