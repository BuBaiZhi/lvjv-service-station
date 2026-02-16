<template>
  <div class="service-support-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <button class="btn-back" @click="goBack">←</button>
      <div class="page-title">服务与支持</div>
      <div class="btn-placeholder"></div>
    </div>

    <!-- 服务选项 -->
    <div class="content-scroll">
      <div class="services-container">
        <!-- 客服中心 -->
        <div class="service-card" @click="goToService('customer-service')">
          <div class="service-icon">💬</div>
          <div class="service-content">
            <div class="service-title">客服中心</div>
            <div class="service-desc">联系我们的客服团队</div>
          </div>
          <div class="service-arrow">›</div>
        </div>

        <!-- 服务站咨询 -->
        <div class="service-card" @click="goToService('station-consult')">
          <div class="service-icon">🏘️</div>
          <div class="service-content">
            <div class="service-title">服务站咨询</div>
            <div class="service-desc">咨询当地服务站相关事宜</div>
          </div>
          <div class="service-arrow">›</div>
        </div>

        <!-- 常见问题 -->
        <div class="service-card" @click="goToService('faq')">
          <div class="service-icon">❓</div>
          <div class="service-content">
            <div class="service-title">常见问题</div>
            <div class="service-desc">查看常见问题和解答</div>
          </div>
          <div class="service-arrow">›</div>
        </div>

        <!-- 关于我们 -->
        <div class="service-card" @click="goToService('about')">
          <div class="service-icon">ℹ️</div>
          <div class="service-content">
            <div class="service-title">关于我们</div>
            <div class="service-desc">了解平台信息和使用条款</div>
          </div>
          <div class="service-arrow">›</div>
        </div>

        <!-- 反馈建议 -->
        <div class="service-card" @click="goToService('feedback')">
          <div class="service-icon">📝</div>
          <div class="service-content">
            <div class="service-title">反馈建议</div>
            <div class="service-desc">向我们提供宝贵的意见</div>
          </div>
          <div class="service-arrow">›</div>
        </div>

        <!-- 联系方式 -->
        <div class="contact-section">
          <div class="section-title">联系方式</div>
          <div class="contact-item">
            <div class="contact-label">电话</div>
            <div class="contact-value">400-123-4567</div>
          </div>
          <div class="contact-item">
            <div class="contact-label">邮箱</div>
            <div class="contact-value">service@example.com</div>
          </div>
          <div class="contact-item">
            <div class="contact-label">工作时间</div>
            <div class="contact-value">周一至周五 9:00-18:00</div>
          </div>
        </div>

        <!-- 底部间距 -->
        <div class="bottom-spacing"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回上级页面
const goBack = () => {
  router.go(-1)
}

// 跳转到服务页面
const goToService = (service: string) => {
  const serviceMap: Record<string, string> = {
    'customer-service': '/pages/service/customer-service',
    'station-consult': '/pages/service/station-consult',
    'faq': '/pages/service/faq',
    'about': '/pages/service/about',
    'feedback': '/pages/service/feedback'
  }

  const url = serviceMap[service]
  if (url) {
    if (typeof uni === 'undefined') {
      alert(`服务页面：${service}`)
    } else {
      uni.navigateTo({ url })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

.service-support-page {
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

  .content-scroll {
    flex: 1;
    overflow-y: auto;
  }

  .services-container {
    padding: $spacing-lg;

    .service-card {
      background: $bg-primary;
      border-radius: $radius-lg;
      box-shadow: $shadow-sm;
      padding: $spacing-lg;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: $spacing-md;
      cursor: pointer;
      transition: all $transition-base;

      &:hover {
        box-shadow: $shadow-md;
      }

      &:active {
        box-shadow: $shadow-lg;
        transform: translateY(-2px);
      }

      .service-icon {
        font-size: 32px;
        margin-right: $spacing-lg;
        flex-shrink: 0;
      }

      .service-content {
        flex: 1;

        .service-title {
          font-size: $font-size-base;
          font-weight: $font-weight-semibold;
          color: $text-primary;
          margin-bottom: $spacing-xs;
        }

        .service-desc {
          font-size: $font-size-sm;
          color: $text-secondary;
        }
      }

      .service-arrow {
        font-size: $font-size-lg;
        color: $primary-color;
        margin-left: $spacing-md;
        flex-shrink: 0;
      }
    }

    .contact-section {
      background: $bg-primary;
      border-radius: $radius-lg;
      box-shadow: $shadow-sm;
      padding: $spacing-lg;
      margin-top: $spacing-lg;

      .section-title {
        font-size: $font-size-lg;
        font-weight: $font-weight-semibold;
        color: $text-primary;
        margin-bottom: $spacing-lg;
        padding-bottom: $spacing-md;
        border-bottom: 1px solid $border-light;
      }

      .contact-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: $spacing-md 0;
        border-bottom: 1px solid $border-light;

        &:last-child {
          border-bottom: none;
        }

        .contact-label {
          font-size: $font-size-sm;
          color: $text-secondary;
          min-width: 60px;
        }

        .contact-value {
          font-size: $font-size-sm;
          color: $text-primary;
          font-weight: $font-weight-medium;
          text-align: right;
          flex: 1;
        }
      }
    }

    .bottom-spacing {
      height: $spacing-3xl;
    }
  }
}
</style>
