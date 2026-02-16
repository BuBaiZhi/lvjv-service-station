<template>
  <view class="publish-list">
    <!-- Tabs 切换 -->
    <uni-segmented-control
      :current="currentTab"
      :values="tabList"
      @clickItem="onTabChange"
      class="tabs"
    />

    <!-- 发布内容列表 -->
    <view class="list-container">
      <view v-if="filteredPublish.length === 0" class="empty-state">
        <view class="empty-icon">📝</view>
        <view class="empty-text">暂无发布内容</view>
        <button class="btn-create" @click="goToCreate">发布新内容</button>
      </view>

      <view v-else class="publish-items">
        <view
          v-for="item in filteredPublish"
          :key="item.id"
          class="publish-item"
          @click="goToDetail(item.id)"
        >
          <!-- 发布图片 -->
          <image :src="item.image" class="publish-image" mode="aspectFill" />

          <!-- 发布信息 -->
          <view class="publish-info">
            <view class="publish-header">
              <view class="publish-title">{{ item.title }}</view>
              <view class="publish-status" :class="item.status">
                {{ statusLabel(item.status) }}
              </view>
            </view>

            <view class="publish-description">{{ item.description }}</view>

            <view class="publish-stats">
              <view class="stat">
                <text class="stat-icon">👁</text>
                <text class="stat-value">{{ item.viewCount }}</text>
              </view>
              <view class="stat">
                <text class="stat-icon">❤️</text>
                <text class="stat-value">{{ item.likeCount }}</text>
              </view>
              <view class="stat">
                <text class="stat-time">{{ formatDate(item.updateTime) }}</text>
              </view>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="publish-actions">
            <button class="action-btn edit" @click.stop="goToEdit(item.id)">编辑</button>
            <button class="action-btn more" @click.stop="showMoreActions(item.id)">更多</button>
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
import type { PublishItem } from '../types/user'

// 状态管理
const userStore = useUserStore()
const currentTab = ref(0)
const loadMoreStatus = ref<'more' | 'loading' | 'noMore'>('more')

// Tabs 配置
const tabList = ['全部', '房源', '活动', '技能', '交流贴']
const typeMap = ['', 'house', 'activity', 'skill', 'post']

// 获取过滤后的发布内容
const filteredPublish = computed(() => {
  const type = typeMap[currentTab.value]
  return userStore.getPublishByType(type)
})

// Tab 切换
const onTabChange = (index: number) => {
  currentTab.value = index
}

// 发布状态标签
const statusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    offline: '已下架'
  }
  return statusMap[status] || status
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 跳转详情页
const goToDetail = (publishId: string) => {
  uni.navigateTo({
    url: `/pages/publish-detail/index?id=${publishId}`
  })
}

// 跳转编辑页
const goToEdit = (publishId: string) => {
  uni.navigateTo({
    url: `/pages/publish-edit/index?id=${publishId}`
  })
}

// 跳转创建页
const goToCreate = () => {
  uni.navigateTo({
    url: '/pages/publish-create/index'
  })
}

// 显示更多操作
const showMoreActions = (publishId: string) => {
  const item = userStore.publishItems.find(p => p.id === publishId)
  if (!item) return

  const actions: string[] = []
  if (item.status === 'draft') {
    actions.push('发布')
  }
  if (item.status === 'published') {
    actions.push('下架')
  }
  actions.push('删除')

  uni.showActionSheet({
    itemList: actions,
    success: (res) => {
      const action = actions[res.tapIndex]
      handleAction(publishId, action)
    }
  })
}

// 处理操作
const handleAction = (publishId: string, action: string) => {
  switch (action) {
    case '发布':
      publishDraft(publishId)
      break
    case '下架':
      offlinePublish(publishId)
      break
    case '删除':
      deletePublish(publishId)
      break
  }
}

// 发布草稿
const publishDraft = (publishId: string) => {
  uni.showModal({
    title: '发布内容',
    content: '确定要发布这个内容吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.publishDraft(publishId)
        uni.showToast({ title: '发布成功', icon: 'success' })
      }
    }
  })
}

// 下架发布
const offlinePublish = (publishId: string) => {
  uni.showModal({
    title: '下架内容',
    content: '确定要下架这个内容吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.offlinePublish(publishId)
        uni.showToast({ title: '已下架', icon: 'success' })
      }
    }
  })
}

// 删除发布
const deletePublish = (publishId: string) => {
  uni.showModal({
    title: '删除内容',
    content: '确定要删除这个内容吗？删除后无法恢复。',
    success: (res) => {
      if (res.confirm) {
        userStore.deletePublish(publishId)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
@import '../styles/variables.scss';

.publish-list {
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
        margin-bottom: $spacing-lg;
      }

      .btn-create {
        @include button-reset;
        padding: 10px 24px;
        background-color: $primary-color;
        color: white;
        border-radius: $radius-md;
        font-size: $font-size-base;
        font-weight: $font-weight-medium;
        transition: background-color $transition-base;

        &:active {
          background-color: $primary-dark;
        }
      }
    }

    .publish-items {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;

      .publish-item {
        @include card-style;
        display: flex;
        gap: $spacing-md;
        cursor: pointer;
        transition: box-shadow $transition-base;

        &:active {
          box-shadow: $shadow-lg;
        }

        .publish-image {
          width: 100px;
          height: 100px;
          border-radius: $radius-md;
          flex-shrink: 0;
          object-fit: cover;
        }

        .publish-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          .publish-header {
            @include flex-between;
            margin-bottom: $spacing-sm;

            .publish-title {
              font-size: $font-size-base;
              font-weight: $font-weight-medium;
              color: $text-primary;
              flex: 1;
              @include text-truncate;
            }

            .publish-status {
              margin-left: $spacing-md;
              padding: 4px 8px;
              border-radius: $radius-sm;
              font-size: $font-size-xs;
              font-weight: $font-weight-medium;
              white-space: nowrap;

              &.draft {
                background-color: #E8E8E8;
                color: #666;
              }

              &.published {
                background-color: #D4EDDA;
                color: #155724;
              }

              &.offline {
                background-color: #F8D7DA;
                color: #721C24;
              }
            }
          }

          .publish-description {
            font-size: $font-size-sm;
            color: $text-secondary;
            margin-bottom: $spacing-sm;
            @include text-clamp(1);
          }

          .publish-stats {
            @include flex-between;
            font-size: $font-size-xs;
            color: $text-secondary;

            .stat {
              display: flex;
              align-items: center;
              gap: 4px;

              .stat-icon {
                font-size: 12px;
              }

              .stat-value {
                color: $text-secondary;
              }

              .stat-time {
                color: $text-hint;
              }
            }
          }
        }

        .publish-actions {
          display: flex;
          flex-direction: column;
          gap: $spacing-sm;
          justify-content: center;

          .action-btn {
            @include button-reset;
            padding: 6px 12px;
            border-radius: $radius-md;
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            transition: background-color $transition-base;

            &.edit {
              background-color: $primary-color;
              color: white;

              &:active {
                background-color: $primary-dark;
              }
            }

            &.more {
              background-color: $border-light;
              color: $text-primary;

              &:active {
                background-color: $border-color;
              }
            }
          }
        }
      }
    }
  }
}
</style>
