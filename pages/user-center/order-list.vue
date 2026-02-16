<template>
  <div class="order-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <button class="btn-back" @click="goBack">←</button>
      <div class="page-title">我的交易</div>
      <div class="btn-placeholder"></div>
    </div>

    <!-- 交易列表 -->
    <div class="list-scroll">
      <div class="list-container">
        <!-- 空状态 -->
        <div v-if="orderList.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <div class="empty-text">暂无交易</div>
          <button class="btn-back-home" @click="goHome">返回首页</button>
        </div>

        <!-- 交易卡片列表 -->
        <div v-else class="order-items">
          <div
            v-for="order in orderList"
            :key="order.id"
            class="order-card"
          >
            <!-- 交易图片 -->
            <img :src="order.image" class="order-image" />

            <!-- 交易信息 -->
            <div class="order-info">
              <!-- 标题和状态 -->
              <div class="order-header">
                <div class="order-title">{{ order.title }}</div>
                <div class="order-status" :class="order.status">
                  {{ statusLabel(order.status) }}
                </div>
              </div>

              <!-- 描述 -->
              <div class="order-description">{{ order.description }}</div>

              <!-- 价格和时间 -->
              <div class="order-footer">
                <div class="order-price">
                  <span v-if="order.price > 0">¥{{ order.price }}</span>
                  <span v-else>免费</span>
                </div>
                <div class="order-time">{{ formatDate(order.createTime) }}</div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="order-actions">
              <button class="action-btn" @click.stop="handleAction(order.id, order.status)">
                {{ actionLabel(order.status) }}
              </button>
            </div>
          </div>
        </div>

        <!-- 底部间距 -->
        <div class="bottom-spacing"></div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">加载中...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import type { Order } from '../../types/user'

// 状态管理
const router = useRouter()
const userStore = useUserStore()
const orderList = ref<Order[]>([])
const loading = ref(false)

// 页面初始化
onMounted(() => {
  loadOrders()
})

// 加载交易列表
const loadOrders = async () => {
  loading.value = true
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 从用户存储中获取订单列表
    orderList.value = userStore.orders
  } finally {
    loading.value = false
  }
}

// 交易状态标签
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

// 处理交易操作
const handleAction = (orderId: string, status: string) => {
  switch (status) {
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

// 确认交易
const confirmOrder = (orderId: string) => {
  const handleConfirm = () => {
    // 更新订单状态
    const order = orderList.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'confirmed'
    }
  }

  if (typeof uni === 'undefined') {
    handleConfirm()
    alert('交易已确认')
  } else {
    uni.showModal({
      title: '确认交易',
      content: '确定要确认这个交易吗？',
      success: (res) => {
        if (res.confirm) {
          handleConfirm()
          uni.showToast({ title: '交易已确认', icon: 'success' })
        }
      }
    })
  }
}

// 完成交易
const completeOrder = (orderId: string) => {
  const handleComplete = () => {
    // 更新订单状态
    const order = orderList.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'completed'
    }
  }

  if (typeof uni === 'undefined') {
    handleComplete()
    alert('交易已完成')
  } else {
    uni.showModal({
      title: '完成交易',
      content: '确定要完成这个交易吗？',
      success: (res) => {
        if (res.confirm) {
          handleComplete()
          uni.showToast({ title: '交易已完成', icon: 'success' })
        }
      }
    })
  }
}

// 跳转评价页面
const goToReview = (orderId: string) => {
  if (typeof uni === 'undefined') {
    alert('评价页面')
  } else {
    uni.navigateTo({
      url: `/pages/review/index?orderId=${orderId}`
    })
  }
}

// 删除交易
const deleteOrder = (orderId: string) => {
  if (typeof uni === 'undefined') {
    userStore.deleteOrder(orderId)
    orderList.value = userStore.orders
    alert('交易已删除')
  } else {
    uni.showModal({
      title: '删除交易',
      content: '确定要删除这个交易吗？',
      success: (res) => {
        if (res.confirm) {
          userStore.deleteOrder(orderId)
          orderList.value = userStore.orders
          uni.showToast({ title: '交易已删除', icon: 'success' })
        }
      }
    })
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 返回首页
const goHome = () => {
  router.push('/pages/index/index')
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

.order-list-page {
  width: 100%;
  height: 100vh;
  background-color: $bg-secondary;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  // 页面头部
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

  // 列表滚动区域
  .list-scroll {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  // 列表容器
  .list-container {
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;

    // 空状态
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
        margin-bottom: $spacing-xl;
      }

      .btn-back-home {
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
          transform: scale(0.98);
        }
      }
    }

    // 交易卡片列表
    .order-items {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;

      // 交易卡片
      .order-card {
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

        // 交易图片
        .order-image {
          width: 80px;
          height: 80px;
          border-radius: $radius-md;
          flex-shrink: 0;
          object-fit: cover;
        }

        // 交易信息
        .order-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 80px;

          // 标题和状态
          .order-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: $spacing-sm;
            margin-bottom: $spacing-sm;

            .order-title {
              font-size: $font-size-base;
              font-weight: $font-weight-semibold;
              color: $text-primary;
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }

            .order-status {
              padding: 4px 10px;
              border-radius: $radius-sm;
              font-size: $font-size-xs;
              font-weight: $font-weight-medium;
              white-space: nowrap;
              flex-shrink: 0;

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

          // 描述
          .order-description {
            font-size: $font-size-sm;
            color: $text-secondary;
            margin-bottom: $spacing-sm;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          // 价格和时间
          .order-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: $font-size-sm;
            color: $text-secondary;

            .order-price {
              font-weight: $font-weight-semibold;
              color: $primary-color;
            }
          }
        }

        // 操作按钮
        .order-actions {
          display: flex;
          align-items: flex-start;
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
            white-space: nowrap;

            &:hover {
              background-color: darken($primary-color, 10%);
            }

            &:active {
              background-color: darken($primary-color, 20%);
            }
          }
        }
      }
    }

    // 底部间距
    .bottom-spacing {
      height: $spacing-3xl;
    }
  }

  // 加载状态
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
      padding: $spacing-xl;
      border-radius: $radius-md;
      font-size: $font-size-base;
      color: $text-primary;
    }
  }
}
</style>
