<template>
  <view class="service-support">
    <!-- 客服中心 -->
    <view class="service-item" @click="goToCustomerService">
      <view class="service-icon">💬</view>
      <view class="service-content">
        <view class="service-title">客服中心</view>
        <view class="service-desc">联系我们的客服团队</view>
      </view>
      <view class="service-arrow">›</view>
    </view>

    <!-- 服务站咨询 -->
    <view class="service-item" @click="goToConsult">
      <view class="service-icon">🏘️</view>
      <view class="service-content">
        <view class="service-title">服务站咨询</view>
        <view class="service-desc">向服务站寻求帮助</view>
      </view>
      <view class="service-arrow">›</view>
    </view>

    <!-- 常见问题 -->
    <view class="service-item" @click="goToFAQ">
      <view class="service-icon">❓</view>
      <view class="service-content">
        <view class="service-title">常见问题</view>
        <view class="service-desc">查看常见问题解答</view>
      </view>
      <view class="service-arrow">›</view>
    </view>

    <!-- 关于我们 -->
    <view class="service-item" @click="goToAbout">
      <view class="service-icon">ℹ️</view>
      <view class="service-content">
        <view class="service-title">关于我们</view>
        <view class="service-desc">了解平台信息</view>
      </view>
      <view class="service-arrow">›</view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 跳转客服中心
const goToCustomerService = () => {
  // 使用微信小程序的客服能力
  uni.showToast({
    title: '客服功能开发中',
    icon: 'none'
  })
  // 实际项目中可以使用：
  // open-type="contact" 在按钮上
}

// 跳转服务站咨询
const goToConsult = () => {
  uni.navigateTo({
    url: '/pages/consult/index'
  })
}

// 跳转常见问题
const goToFAQ = () => {
  uni.navigateTo({
    url: '/pages/faq/index'
  })
}

// 跳转关于我们
const goToAbout = () => {
  uni.navigateTo({
    url: '/pages/about/index'
  })
}
</script>

<style lang="scss" scoped>
@import '../styles/variables.scss';

.service-support {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;

  .service-item {
    @include card-style;
    @include flex-between;
    cursor: pointer;
    transition: box-shadow $transition-base;

    &:active {
      box-shadow: $shadow-lg;
    }

    .service-icon {
      font-size: 32px;
      margin-right: $spacing-md;
      flex-shrink: 0;
    }

    .service-content {
      flex: 1;

      .service-title {
        font-size: $font-size-base;
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-bottom: $spacing-xs;
      }

      .service-desc {
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }

    .service-arrow {
      font-size: $font-size-xl;
      color: $text-hint;
      margin-left: $spacing-md;
      flex-shrink: 0;
    }
  }
}
</style>
