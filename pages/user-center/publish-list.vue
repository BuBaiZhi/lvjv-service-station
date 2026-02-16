<template>
  <div class="publish-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <button class="btn-back" @click="goBack">←</button>
      <div class="page-title">我的发布</div>
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

    <!-- 发布列表 -->
    <div class="list-scroll">
      <div class="list-container">
        <div v-if="filteredPublish.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-text">暂无发布内容</div>
          <button class="btn-publish" @click="createNewPublish">发布新内容</button>
        </div>

        <div v-else class="publish-items">
          <div
            v-for="item in filteredPublish"
            :key="item.id"
            class="publish-item"
            @click="goToDetail(item.id)"
          >
            <!-- 发布图片 -->
            <img :src="item.image" class="publish-image" />

            <!-- 发布信息 -->
            <div class="publish-info">
              <div class="publish-header">
                <div class="publish-title">{{ item.title }}</div>
                <div class="publish-status" :class="item.status">
                  {{ statusLabel(item.status) }}
                </div>
              </div>

              <div class="publish-description" v-if="item.description">
                {{ item.description }}
              </div>

              <div class="publish-stats">
                <div class="stat">👁 {{ item.viewCount }}</div>
                <div class="stat">❤ {{ item.likeCount }}</div>
              </div>

              <div class="publish-time">{{ formatDate(item.updateTime) }}</div>
            </div>

            <!-- 操作按钮 -->
            <div class="publish-actions">
              <button class="action-btn edit-btn" @click.stop="editPublish(item.id)">
                编辑
              </button>
              <button class="action-btn" @click.stop="handleAction(item.id, item.status)">
                {{ actionLabel(item.status) }}
              </button>
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
import type { PublishItem } from '../../types/user'

// 状态管理
const router = useRouter()
const userStore = useUserStore()
const currentTab = ref(0)

// Tabs 配置
const tabList = ['全部', '房源', '活动', '技能', '交流']
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

// 操作按钮标签
const actionLabel = (status: string): string => {
  const actionMap: Record<string, string> = {
    draft: '发布',
    published: '下架',
    offline: '删除'
  }
  return actionMap[status] || '操作'
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 跳转详情
const goToDetail = (publishId: string) => {
  if (typeof uni === 'undefined') {
    // 浏览器环境：模拟跳转
    alert(`跳转到发布详情页：${publishId}`)
  } else {
    // uni-app 环境
    uni.navigateTo({
      url: `/pages/publish-detail/index?id=${publishId}`
    })
  }
}

// 编辑发布
const editPublish = (publishId: string) => {
  if (typeof uni === 'undefined') {
    // 浏览器环境：模拟编辑
    alert(`编辑发布内容：${publishId}`)
  } else {
    // uni-app 环境
    uni.navigateTo({
      url: `/pages/publish-edit/index?id=${publishId}`
    })
  }
}

// 创建新发布
const createNewPublish = () => {
  if (typeof uni === 'undefined') {
    // 浏览器环境：模拟创建
    alert('创建新发布内容')
  } else {
    // uni-app 环境
    uni.navigateTo({
      url: '/pages/publish-create/index'
    })
  }
}

// 返回上级页面
const goBack = () => {
  router.go(-1)
}

// 处理操作
const handleAction = (publishId: string, status: string) => {
  switch (status) {
    case 'draft':
      publishDraft(publishId)
      break
    case 'published':
      offlinePublish(publishId)
      break
    case 'offline':
      deletePublish(publishId)
      break
  }
}

// 发布草稿
const publishDraft = (publishId: string) => {
  if (typeof uni === 'undefined') {
    userStore.publishDraft(publishId)
    alert('发布成功')
  } else {
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
}

// 下架发布
const offlinePublish = (publishId: string) => {
  if (typeof uni === 'undefined') {
    userStore.offlinePublish(publishId)
    alert('已下架')
  } else {
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
}

// 删除发布
const deletePublish = (publishId: string) => {
  if (typeof uni === 'undefined') {
    userStore.deletePublish(publishId)
    alert('已删除')
  } else {
    uni.showModal({
      title: '删除内容',
      content: '确定要删除这个内容吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          userStore.deletePublish(publishId)
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  }
}

// 上拉加载
const onReachBottom = () => {
  console.log('到达底部')
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

.publish-list-page {
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
        margin-bottom: $spacing-lg;
      }

      .btn-publish {
        padding: 10px 20px;
        margin: 0;
        border: none;
        background-color: $primary-color;
        color: white;
        border-radius: $radius-md;
        font-size: $font-size-base;
        font-weight: $font-weight-medium;
        cursor: pointer;
        transition: background-color $transition-base;

        &:hover {
          background-color: darken($primary-color, 10%);
        }

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
        background: $bg-primary;
        border-radius: $radius-lg;
        box-shadow: $shadow-sm;
        padding: $spacing-lg;
        display: flex;
        gap: $spacing-md;
        cursor: pointer;
        transition: box-shadow $transition-base;
        align-items: flex-start;

        &:hover {
          box-shadow: $shadow-md;
        }

        &:active {
          box-shadow: $shadow-lg;
        }

        .publish-image {
          width: 80px;
          height: 80px;
          border-radius: $radius-md;
          flex-shrink: 0;
          object-fit: cover;
        }

        .publish-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 80px;

          .publish-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: $spacing-sm;
            margin-bottom: $spacing-sm;

            .publish-title {
              font-size: $font-size-base;
              font-weight: $font-weight-medium;
              color: $text-primary;
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }

            .publish-status {
              padding: 4px 10px;
              border-radius: $radius-sm;
              font-size: $font-size-xs;
              font-weight: $font-weight-medium;
              white-space: nowrap;
              flex-shrink: 0;

              &.draft {
                background-color: #F5F5F5;
                color: #757575;
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
            line-height: $line-height-normal;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .publish-stats {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: $font-size-sm;
            color: $text-secondary;
            margin-bottom: $spacing-sm;

            .stat {
              display: flex;
              align-items: center;
              gap: 4px;
            }
          }

          .publish-time {
            font-size: $font-size-xs;
            color: $text-hint;
          }
        }

        .publish-actions {
          display: flex;
          flex-direction: column;
          gap: $spacing-sm;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;

          .action-btn {
            padding: 6px 12px;
            margin: 0;
            border: none;
            background-color: $primary-color;
            color: white;
            border-radius: $radius-md;
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            transition: background-color $transition-base;
            cursor: pointer;
            width: 100%;

            &:hover {
              background-color: darken($primary-color, 10%);
            }

            &:active {
              background-color: $primary-dark;
            }
          }

          .edit-btn {
            background-color: $secondary-color;

            &:hover {
              background-color: darken($secondary-color, 10%);
            }

            &:active {
              background-color: $secondary-dark;
            }
          }
        }
      }
    }
  }
}
</style>
