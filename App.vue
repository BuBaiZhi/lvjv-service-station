<template>
  <div class="app-container">
    <!-- 路由视图 -->
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed, onMounted, watch, nextTick } from 'vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()

// 计算深色模式状态
const isDarkMode = computed(() => userStore.settings.theme === 'dark')

// 计算老人友好版状态
const isElderlyMode = computed(() => userStore.settings.appVersion === 'elderly')

// 监听主题变化
watch(isDarkMode, (newVal) => {
  nextTick(() => {
    applyTheme(newVal)
    // 死缕晕强制重排
    setTimeout(() => {
      applyTheme(newVal)
    }, 50)
  })
}, { immediate: true })

// 监听老人版变化
watch(isElderlyMode, (newVal) => {
  nextTick(() => {
    applyElderlyMode(newVal)
  })
}, { immediate: true })

// 应用主题函数
const applyTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.setAttribute('data-dark-mode', 'true')
  } else {
    document.documentElement.removeAttribute('data-dark-mode')
  }
}

// 应用老人版函数
const applyElderlyMode = (isElderly: boolean) => {
  if (isElderly) {
    document.documentElement.setAttribute('data-elderly-mode', 'true')
  } else {
    document.documentElement.removeAttribute('data-elderly-mode')
  }
}

// 初始化主题
onMounted(() => {
  applyTheme(userStore.settings.theme === 'dark')
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
}

.app-container {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  color: #212121;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* ========== 深色模式全局样式 ========== */

html[data-dark-mode='true'] .app-container {
  background-color: #1a1a1a;
  color: #f0f0f0;
}

html[data-dark-mode='true'] .page-header {
  background-color: #252525 !important;
  color: #f0f0f0 !important;
  border-color: #3a3a3a !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5) !important;
}

html[data-dark-mode='true'] .page-title {
  color: #f0f0f0 !important;
}

html[data-dark-mode='true'] .btn-back {
  color: #66bb6a !important;
}

html[data-dark-mode='true'] .btn-placeholder {
  color: #f0f0f0 !important;
}

html[data-dark-mode='true'] .content-scroll,
html[data-dark-mode='true'] .list-scroll,
html[data-dark-mode='true'] .list-container,
html[data-dark-mode='true'] .edit-container {
  background-color: #1a1a1a !important;
}

html[data-dark-mode='true'] .setting-item,
html[data-dark-mode='true'] .publish-item,
html[data-dark-mode='true'] .order-card,
html[data-dark-mode='true'] .history-item,
html[data-dark-mode='true'] .favorite-item,
html[data-dark-mode='true'] .service-card {
  background-color: #2d2d2d !important;
  color: #f0f0f0 !important;
  border-color: #3a3a3a !important;
}

/* 特别处理用户卡片 */
html[data-dark-mode='true'] .user-card {
  background-color: #1a1a1a !important;
}

html[data-dark-mode='true'] .section-title {
  color: #a0a0a0 !important;
}

html[data-dark-mode='true'] .label-title,
html[data-dark-mode='true'] .publish-title,
html[data-dark-mode='true'] .order-title,
html[data-dark-mode='true'] .history-title,
html[data-dark-mode='true'] .favorite-title,
html[data-dark-mode='true'] .service-title {
  color: #f0f0f0 !important;
}

html[data-dark-mode='true'] .label-desc,
html[data-dark-mode='true'] .form-hint,
html[data-dark-mode='true'] .publish-time,
html[data-dark-mode='true'] .publish-description,
html[data-dark-mode='true'] .order-description,
html[data-dark-mode='true'] .history-time,
html[data-dark-mode='true'] .favorite-time,
html[data-dark-mode='true'] .order-footer,
html[data-dark-mode='true'] .publish-stats,
html[data-dark-mode='true'] .history-type,
html[data-dark-mode='true'] .favorite-type,
html[data-dark-mode='true'] .service-desc,
html[data-dark-mode='true'] .history-info,
html[data-dark-mode='true'] .publish-info,
html[data-dark-mode='true'] .order-info,
html[data-dark-mode='true'] .favorite-info {
  color: #a0a0a0 !important;
}

html[data-dark-mode='true'] .form-input,
html[data-dark-mode='true'] .form-textarea {
  background-color: #333 !important;
  color: #f0f0f0 !important;
  border-color: #3a3a3a !important;
}

html[data-dark-mode='true'] .form-input::placeholder,
html[data-dark-mode='true'] .form-textarea::placeholder {
  color: #707070 !important;
}

html[data-dark-mode='true'] .avatar-section,
html[data-dark-mode='true'] .form-section,
html[data-dark-mode='true'] .background-section {
  background-color: #2d2d2d !important;
  color: #f0f0f0 !important;
}

html[data-dark-mode='true'] .tabs {
  background-color: #252525 !important;
  border-color: #3a3a3a !important;
}

html[data-dark-mode='true'] .tab-btn {
  color: #a0a0a0 !important;
  background-color: transparent !important;
}

html[data-dark-mode='true'] .tab-btn.active {
  background-color: #4CAF50 !important;
  color: #ffffff !important;
}

html[data-dark-mode='true'] .empty-state {
  color: #a0a0a0 !important;
}

html[data-dark-mode='true'] .empty-icon {
  filter: brightness(0.9);
}

html[data-dark-mode='true'] .loading-overlay {
  background-color: rgba(0, 0, 0, 0.8) !important;
}

html[data-dark-mode='true'] .loading-spinner {
  background-color: #2d2d2d !important;
  color: #f0f0f0 !important;
}

html[data-dark-mode='true'] .page-footer {
  background-color: #252525 !important;
  border-top-color: #3a3a3a !important;
}

html[data-dark-mode='true'] .btn-cancel {
  background-color: #333 !important;
  color: #f0f0f0 !important;
  border-color: #3a3a3a !important;
}

html[data-dark-mode='true'] .order-price {
  color: #66bb6a !important;
}

html[data-dark-mode='true'] .gender-btn,
html[data-dark-mode='true'] .identity-btn {
  background-color: #333 !important;
  color: #f0f0f0 !important;
  border-color: #3a3a3a !important;
}

html[data-dark-mode='true'] .gender-btn.active,
html[data-dark-mode='true'] .identity-btn.active {
  background-color: #4CAF50 !important;
  color: #ffffff !important;
  border-color: #4CAF50 !important;
}

html[data-dark-mode='true'] .publish-header,
html[data-dark-mode='true'] .order-header {
  color: #f0f0f0 !important;
}

html[data-dark-mode='true'] input[type="checkbox"] {
  accent-color: #4CAF50;
}

html[data-dark-mode='true'] .publish-status,
html[data-dark-mode='true'] .order-status {
  color: #212121 !important;
}

html[data-dark-mode='true'] .service-arrow,
html[data-dark-mode='true'] .setting-arrow {
  color: #66bb6a !important;
}

/* ========== 老人友好版全局样式 ========== */

html[data-elderly-mode='true'] body {
  font-size: 20px !important;
  line-height: 1.8 !important;
}

html[data-elderly-mode='true'] button,
html[data-elderly-mode='true'] input[type='button'],
html[data-elderly-mode='true'] input[type='submit'] {
  min-height: 56px !important;
  padding: 12px 24px !important;
  font-size: 20px !important;
}

html[data-elderly-mode='true'] .page-title {
  font-size: 28px !important;
}

html[data-elderly-mode='true'] .page-header {
  height: 68px !important;
}

html[data-elderly-mode='true'] .label-title,
html[data-elderly-mode='true'] .publish-title,
html[data-elderly-mode='true'] .order-title,
html[data-elderly-mode='true'] .setting-label .label-title {
  font-size: 20px !important;
}

html[data-elderly-mode='true'] .label-desc,
html[data-elderly-mode='true'] .form-hint,
html[data-elderly-mode='true'] .publish-description,
html[data-elderly-mode='true'] .order-description,
html[data-elderly-mode='true'] .setting-label .label-desc {
  font-size: 18px !important;
}

html[data-elderly-mode='true'] .form-input,
html[data-elderly-mode='true'] .form-textarea {
  font-size: 20px !important;
  padding: 16px !important;
  line-height: 1.8 !important;
}

html[data-elderly-mode='true'] .setting-item,
html[data-elderly-mode='true'] .publish-item,
html[data-elderly-mode='true'] .order-card {
  margin-bottom: 20px !important;
  padding: 20px !important;
}

html[data-elderly-mode='true'] .tab-btn {
  font-size: 20px !important;
  padding: 12px 24px !important;
  min-height: 50px !important;
}

html[data-elderly-mode='true'] input[type='checkbox'] {
  width: 24px !important;
  height: 24px !important;
  cursor: pointer !important;
}

html[data-elderly-mode='true'] .section-title {
  font-size: 18px !important;
}

html[data-elderly-mode='true'] .publish-time,
html[data-elderly-mode='true'] .history-time,
html[data-elderly-mode='true'] .order-time {
  font-size: 16px !important;
}

html[data-elderly-mode='true'] .empty-text {
  font-size: 20px !important;
}

html[data-elderly-mode='true'] .empty-icon {
  font-size: 64px !important;
}

html[data-elderly-mode='true'] .btn-back {
  font-size: 32px !important;
}

html[data-elderly-mode='true'] .service-card {
  padding: 24px !important;
}

html[data-elderly-mode='true'] .service-icon {
  font-size: 40px !important;
}

html[data-elderly-mode='true'] .service-title {
  font-size: 20px !important;
}

html[data-elderly-mode='true'] .service-desc {
  font-size: 16px !important;
}

html[data-elderly-mode='true'] .service-arrow {
  font-size: 28px !important;
}

html[data-elderly-mode='true'] .page-footer button {
  font-size: 20px !important;
  min-height: 56px !important;
  padding: 12px 24px !important;
}

html[data-elderly-mode='true'] .btn-upload-avatar,
html[data-elderly-mode='true'] .btn-publish,
html[data-elderly-mode='true'] .btn-back-home,
html[data-elderly-mode='true'] .btn-edit-background {
  font-size: 20px !important;
  min-height: 56px !important;
  padding: 12px 24px !important;
}

html[data-elderly-mode='true'] .avatar {
  width: 100px !important;
  height: 100px !important;
}

html[data-elderly-mode='true'] .stats-container {
  padding: 20px 24px !important;
}

html[data-elderly-mode='true'] .stat-value {
  font-size: 28px !important;
}

html[data-elderly-mode='true'] .stat-label {
  font-size: 16px !important;
}

html[data-elderly-mode='true'] .gender-badge,
html[data-elderly-mode='true'] .badge {
  font-size: 18px !important;
  padding: 6px 16px !important;
}

html[data-elderly-mode='true'] .action-btn {
  font-size: 18px !important;
  min-height: 50px !important;
  padding: 10px 20px !important;
}

html[data-elderly-mode='true'] .edit-btn {
  font-size: 18px !important;
}

html[data-elderly-mode='true'] .favorite-title,
html[data-elderly-mode='true'] .history-title {
  font-size: 18px !important;
}

html[data-elderly-mode='true'] .form-label {
  font-size: 20px !important;
}
</style>
