<template>
  <view class="order-list">
    <!-- Tabs 切换 -->
    <uni-segmented-control
      :current="currentTab"
      :values="tabList"
      @clickItem="onTabChange"
      class="tabs"
    />

    <!-- 订单列表 -->
    <view class="list-container">
      <view v-if="filteredOrders.length === 0" class="empty-state">
        <view class="empty-icon">📦</view>
        <view class="empty-text">暂无订单</view>
      </view>

      <view v-else class="order-items">
        <view
          v-for="order in filteredOrders"
          :key="order.id"
          class="order-item"
          @click="goToOrderDetail(order.id)"
        >
          <!-- 订单图片 -->
          <image :src="order.image" class="order-image" mode="aspectFill" />

          <!-- 订单信息 -->
          <view class="order-info">
            <view class="order-header">
              <view class="order-title">{{ order.title }}</view>
              <view class="order-status" :class="order.status">
                {{ statusLabel(order.status) }}
              </view>
            </view>

            <view class="order-description">{{ order.description }}</view>

            <view class="order-footer">
              <view class="order-price">
                <text v-if="order.price > 0">¥{{ order.price }}</text>
                <text v-else>免费</text>
              </view>
              <view class="order-time">{{ formatDate(order.createTime) }}</view>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="order-actions">
            <button class="action-btn" @click.stop="handleAction(order.id)">
              {{ actionLabel(order.status) }}
            </button>
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
import type { Order } from '../types/user'

// 状态管理
const userStore = useUserStore()
const currentTab = ref(0)
const loadMoreStatus = ref<'more' | 'loading' | 'noMore'>('more')

// Tabs 配置
const tabList = ['全部', '房源', '活动', '技能']
const typeMap = ['', 'house', 'activity', 'skill']

// 获取过滤后的订单
const filteredOrders = computed(() => {
  const type = typeMap[currentTab.value]
  return userStore.getOrdersByType(type)
})

// Tab 切换
const onTabChange = (index: number) => {
  currentTab.value = index
}

// 订单状态标签
const statusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 操作按钮标签
const actionLabel = (status: string): string => {
  const actionMap: Record<string, string> = {
    pending: '确认',
    confirmed: '完成',
    completed: '评价',
    cancelled: '删除'
  }
  return actionMap[status] || '操作'
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 跳转订单详情
const goToOrderDetail = (orderId: string) => {
  uni.navigateTo({
    url: `/pages/order-detail/index?id=${orderId}`
  })
}

// 处理操作
const handleAction = (orderId: string) => {
  const order = userStore.orders.find(o => o.id === orderId)
  if (!order) return

  switch (order.status) {
    case 'pending':
      confirmOrder(orderId)
      break
    case 'confirmed':
      completeOrder(orderId)
      break
    case 'completed':
      goToReview(orderId)
      break
    case 'cancelled':
      deleteOrder(orderId)
      break
  }
}

// 确认订单
const confirmOrder = (orderId: string) => {
  uni.showModal({
    title: '确认订单',
    content: '确定要确认这个订单吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '订单已确认', icon: 'success' })
      }
    }
  })
}

// 完成订单
const completeOrder = (orderId: string) => {
  uni.showModal({
    title: '完成订单',
    content: '确定要完成这个订单吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '订单已完成', icon: 'success' })
      }
    }
  })
}

// 跳转评价页面
const goToReview = (orderId: string) => {
  uni.navigateTo({
    url: `/pages/review/index?orderId=${orderId}`
  })
}

// 删除订单
const deleteOrder = (orderId: string) => {
  uni.showModal({
    title: '删除订单',
    content: '确定要删除这个订单吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.deleteOrder(orderId)
        uni.showToast({ title: '订单已删除', icon: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
@import '../styles/variables.scss';

.order-list {
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

    .order-items {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;

      .order-item {
        @include card-style;
        display: flex;
        gap: $spacing-md;
        cursor: pointer;
        transition: box-shadow $transition-base;

        &:active {
          box-shadow: $shadow-lg;
        }

        .order-image {
          width: 100px;
          height: 100px;
          border-radius: $radius-md;
          flex-shrink: 0;
          object-fit: cover;
        }

        .order-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          .order-header {
            @include flex-between;
            margin-bottom: $spacing-sm;

            .order-title {
              font-size: $font-size-base;
              font-weight: $font-weight-medium;
              color: $text-primary;
              flex: 1;
              @include text-truncate;
            }

            .order-status {
              margin-left: $spacing-md;
              padding: 4px 8px;
              border-radius: $radius-sm;
              font-size: $font-size-xs;
              font-weight: $font-weight-medium;
              white-space: nowrap;

              &.pending {
                background-color: #FFF3CD;
                color: #856404;
              }

              &.confirmed {
                background-color: #D1ECF1;
                color: #0C5460;
              }

              &.completed {
                background-color: #D4EDDA;
                color: #155724;
              }

              &.cancelled {
                background-color: #F8D7DA;
                color: #721C24;
              }
            }
          }

          .order-description {
            font-size: $font-size-sm;
            color: $text-secondary;
            margin-bottom: $spacing-sm;
            @include text-clamp(1);
          }

          .order-footer {
            @include flex-between;
            font-size: $font-size-sm;
            color: $text-secondary;

            .order-price {
              font-weight: $font-weight-semibold;
              color: $primary-color;
            }
          }
        }

        .order-actions {
          display: flex;
          align-items: center;

          .action-btn {
            @include button-reset;
            padding: 6px 12px;
            background-color: $primary-color;
            color: white;
            border-radius: $radius-md;
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            transition: background-color $transition-base;

            &:active {
              background-color: $primary-dark;
            }
          }
        }
      }
    }
  }
}
</style>
