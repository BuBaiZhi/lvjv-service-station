<template>
  <view class="history-list">
    <!-- Tabs 切换 -->
    <uni-segmented-control
      :current="currentTab"
      :values="tabList"
      @clickItem="onTabChange"
      class="tabs"
    />

    <!-- 历史记录列表 -->
    <view class="list-container">
      <view v-if="filteredItems.length === 0" class="empty-state">
        <view class="empty-icon">🕐</view>
        <view class="empty-text">暂无记录</view>
      </view>

      <view v-else class="history-items">
        <!-- 清空按钮（仅浏览历史显示） -->
        <view v-if="currentTab === 0" class="clear-btn-container">
          <button class="btn-clear" @click="clearHistory">清空浏览历史</button>
        </view>

        <!-- 历史项目 -->
        <view
          v-for="item in filteredItems"
          :key="item.id"
          class="history-item"
          @click="goToDetail(item)"
        >
          <!-- 历史图片 -->
          <image :src="item.image" class="history-image" mode="aspectFill" />

          <!-- 历史信息 -->
          <view class="history-info">
            <view class="history-title">{{ item.title }}</view>
            <view class="history-time">
              {{ currentTab === 0 ? formatViewTime(item.viewTime) : formatCollectTime(item.collectTime) }}
            </view>
          </view>

          <!-- 删除按钮 -->
          <view class="history-delete">
            <button class="btn-delete" @click.stop="deleteItem(item.id)">删除</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <uni-load-more :status="loadMoreStatus" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
import type { HistoryItem, FavoriteItem } from '../types/user'

// 状态管理
const userStore = useUserStore()
const currentTab = ref(0)
const loadMoreStatus = ref<'more' | 'loading' | 'noMore'>('more')

// Tabs 配置
const tabList = ['浏览历史', '收藏']

// 获取过滤后的项目
const filteredItems = computed(() => {
  if (currentTab.value === 0) {
    return userStore.browseHistory
  } else {
    return userStore.favorites
  }
})

// Tab 切换
const onTabChange = (index: number) => {
  currentTab.value = index
}

// 格式化浏览时间
const formatViewTime = (timeStr: string): string => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

// 格式化收藏时间
const formatCollectTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 跳转详情页
const goToDetail = (item: HistoryItem | FavoriteItem) => {
  if (item.url) {
    uni.navigateTo({
      url: item.url
    })
  }
}

// 删除项目
const deleteItem = (itemId: string) => {
  if (currentTab.value === 0) {
    // 删除浏览历史
    userStore.browseHistory = userStore.browseHistory.filter(h => h.id !== itemId)
  } else {
    // 删除收藏
    userStore.removeFavorite(itemId)
  }
  uni.showToast({ title: '已删除', icon: 'success' })
}

// 清空浏览历史
const clearHistory = () => {
  uni.showModal({
    title: '清空浏览历史',
    content: '确定要清空所有浏览历史吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.clearBrowseHistory()
        uni.showToast({ title: '已清空', icon: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
@import '../styles/variables.scss';

.history-list {
  .tabs {
    margin-bottom: $spacing-lg;
  }

  .list-container {
    .empty-state {
      @include flex-center;
      flex-direction: column;
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

    .history-items {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;

      .clear-btn-container {
        text-align: right;
        margin-bottom: $spacing-md;

        .btn-clear {
          @include button-reset;
          padding: 8px 16px;
          background-color: $error-color;
          color: white;
          border-radius: $radius-md;
          font-size: $font-size-sm;
          font-weight: $font-weight-medium;
          transition: background-color $transition-base;

          &:active {
            background-color: darken($error-color, 10%);
          }
        }
      }

      .history-item {
        @include card-style;
        display: flex;
        gap: $spacing-md;
        align-items: center;
        cursor: pointer;
        transition: box-shadow $transition-base;

        &:active {
          box-shadow: $shadow-lg;
        }

        .history-image {
          width: 80px;
          height: 80px;
          border-radius: $radius-md;
          flex-shrink: 0;
          object-fit: cover;
        }

        .history-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;

          .history-title {
            font-size: $font-size-base;
            font-weight: $font-weight-medium;
            color: $text-primary;
            margin-bottom: $spacing-sm;
            @include text-truncate;
          }

          .history-time {
            font-size: $font-size-sm;
            color: $text-secondary;
          }
        }

        .history-delete {
          display: flex;
          align-items: center;

          .btn-delete {
            @include button-reset;
            padding: 6px 12px;
            background-color: $border-light;
            color: $text-secondary;
            border-radius: $radius-md;
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            transition: background-color $transition-base;

            &:active {
              background-color: $border-color;
            }
          }
        }
      }
    }
  }
}
</style>
