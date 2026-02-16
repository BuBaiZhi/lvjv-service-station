<template>
  <div class="settings-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <button class="btn-back" @click="goBack">←</button>
      <div class="page-title">设置</div>
      <div class="btn-placeholder"></div>
    </div>

    <!-- 背景选择器 -->
    <BackgroundSelector ref="backgroundSelector" @confirm="onBackgroundConfirm" />

    <div class="content-scroll">
      <div class="settings-container">
        <!-- 账户设置 -->
        <div class="settings-section">
          <div class="section-title">账户设置</div>

          <div class="setting-item" @click="goToEditProfile">
            <div class="setting-label">
              <div class="label-title">编辑个人资料</div>
              <div class="label-desc">修改昵称、头像、背景等信息</div>
            </div>
            <div class="setting-arrow">›</div>
          </div>

          <div class="setting-item" @click="openBackgroundSelector">
            <div class="setting-label">
              <div class="label-title">卡片背景</div>
              <div class="label-desc">选择或上传卡片背景</div>
            </div>
            <div class="setting-arrow">›</div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <div class="label-title">身份切换</div>
              <div class="label-desc">在村民和游民之间切换</div>
            </div>
            <div class="setting-control">
              <input type="checkbox" :checked="isVillager" @change="switchIdentity" />
            </div>
          </div>
        </div>

        <!-- 通知设置 -->
        <div class="settings-section">
          <div class="section-title">通知设置</div>

          <div class="setting-item">
            <div class="setting-label">
              <div class="label-title">启用通知</div>
              <div class="label-desc">接收订单和消息通知</div>
            </div>
            <div class="setting-control">
              <input type="checkbox" :checked="settings.notificationEnabled" @change="toggleNotification" />
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <div class="label-title">隐私模式</div>
              <div class="label-desc">隐藏个人信息和活动记录</div>
            </div>
            <div class="setting-control">
              <input type="checkbox" :checked="settings.privacyMode" @change="togglePrivacy" />
            </div>
          </div>
        </div>

        <!-- 显示设置 -->
        <div class="settings-section">
          <div class="section-title">显示设置</div>

          <div class="setting-item">
            <div class="setting-label">
              <div class="label-title">深色模式</div>
              <div class="label-desc">在深色和浅色主题之间切换</div>
            </div>
            <div class="setting-control">
              <input type="checkbox" :checked="isDarkMode" @change="toggleTheme" />
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <div class="label-title">应用版本</div>
              <div class="label-desc">选择适合您的界面风格</div>
            </div>
            <div class="setting-control version-selector">
              <button
                class="version-btn"
                :class="{ active: settings.appVersion === 'standard' }"
                @click="switchAppVersion('standard')"
              >
                标准版
              </button>
              <button
                class="version-btn"
                :class="{ active: settings.appVersion === 'elderly' }"
                @click="switchAppVersion('elderly')"
              >
                老人版
              </button>
            </div>
          </div>
        </div>

        <!-- 其他设置 -->
        <div class="settings-section">
          <div class="section-title">其他</div>

          <div class="setting-item" @click="clearCache">
            <div class="setting-label">
              <div class="label-title">清除缓存</div>
              <div class="label-desc">清除应用缓存数据</div>
            </div>
            <div class="setting-arrow">›</div>
          </div>

          <div class="setting-item" @click="goToAbout">
            <div class="setting-label">
              <div class="label-title">关于应用</div>
              <div class="label-desc">版本 1.0.0</div>
            </div>
            <div class="setting-arrow">›</div>
          </div>

          <div class="setting-item" @click="logout">
            <div class="setting-label">
              <div class="label-title logout-text">退出登录</div>
            </div>
            <div class="setting-arrow">›</div>
          </div>
        </div>

        <!-- 底部间距 -->
        <div class="bottom-spacing"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import BackgroundSelector from '../../components/BackgroundSelector.vue'

const router = useRouter()

// 状态管理
const userStore = useUserStore()
const settings = computed(() => userStore.settings)
const backgroundSelector = ref<InstanceType<typeof BackgroundSelector>>()

// 身份状态
const isVillager = computed(() => userStore.settings.identity === 'villager')

// 深色模式状态
const isDarkMode = computed(() => userStore.settings.theme === 'dark')

// 返回上级页面
const goBack = () => {
  router.go(-1)
}

// 打开背景选择器
const openBackgroundSelector = () => {
  backgroundSelector.value?.openModal()
}

// 背景确认回调
const onBackgroundConfirm = () => {
  // 背景已保存，组件会自动更新
  console.log('背景已更新')
}

// 切换身份
const switchIdentity = (event: any) => {
  const identity = event.target.checked ? 'villager' : 'nomad'
  userStore.switchIdentity(identity as 'villager' | 'nomad')
  if (typeof uni === 'undefined') {
    alert(`已切换为${identity === 'villager' ? '村民' : '数字游民'}`)
  } else {
    uni.showToast({
      title: `已切换为${identity === 'villager' ? '村民' : '数字游民'}`,
      icon: 'success'
    })
  }
}

// 切换通知
const toggleNotification = (event: any) => {
  userStore.updateSettings({
    notificationEnabled: event.target.checked
  })
  if (typeof uni === 'undefined') {
    alert(event.target.checked ? '已启用通知' : '已禁用通知')
  } else {
    uni.showToast({
      title: event.target.checked ? '已启用通知' : '已禁用通知',
      icon: 'success'
    })
  }
}

// 切换隐私模式
const togglePrivacy = (event: any) => {
  userStore.updateSettings({
    privacyMode: event.target.checked
  })
  if (typeof uni === 'undefined') {
    alert(event.target.checked ? '已启用隐私模式' : '已禁用隐私模式')
  } else {
    uni.showToast({
      title: event.target.checked ? '已启用隐私模式' : '已禁用隐私模式',
      icon: 'success'
    })
  }
}

// 切换主题
const toggleTheme = (event: any) => {
  const theme = event.target.checked ? 'dark' : 'light'
  userStore.updateSettings({ theme })
  if (typeof uni === 'undefined') {
    alert(`已切换为${theme === 'dark' ? '深色' : '浅色'}主题`)
  } else {
    uni.showToast({
      title: `已切换为${theme === 'dark' ? '深色' : '浅色'}主题`,
      icon: 'success'
    })
  }
}

// 切换应用版本
const switchAppVersion = (version: 'standard' | 'elderly') => {
  userStore.updateSettings({ appVersion: version })
  if (typeof uni === 'undefined') {
    alert(`已切换为${version === 'elderly' ? '老人友好版' : '标准版'}`)
  } else {
    uni.showToast({
      title: `已切换为${version === 'elderly' ? '老人友好版' : '标准版'}`,
      icon: 'success'
    })
  }
}

// 编辑资料
const goToEditProfile = () => {
  if (typeof uni === 'undefined') {
    router.push('/pages/user-center/edit-profile')
  } else {
    uni.navigateTo({
      url: '/pages/user-center/edit-profile'
    })
  }
}

// 清除缓存
const clearCache = () => {
  if (typeof uni === 'undefined') {
    if (confirm('确定要清除所有缓存数据吗？')) {
      alert('缓存已清除')
    }
  } else {
    uni.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          uni.clearStorageSync()
          uni.showToast({ title: '缓存已清除', icon: 'success' })
        }
      }
    })
  }
}

// 关于应用
const goToAbout = () => {
  if (typeof uni === 'undefined') {
    alert('关于应用页面')
  } else {
    uni.navigateTo({
      url: '/pages/about/index'
    })
  }
}

// 退出登录
const logout = () => {
  if (typeof uni === 'undefined') {
    if (confirm('确定要退出登录吗？')) {
      alert('已退出登录')
    }
  } else {
    uni.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          uni.showToast({ title: '已退出登录', icon: 'success' })
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/index/index'
            })
          }, 1000)
        }
      }
    })
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

.settings-page {
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

  .settings-container {
    padding: $spacing-lg;

    .settings-section {
      margin-bottom: $spacing-lg;

      .section-title {
        font-size: $font-size-sm;
        font-weight: $font-weight-semibold;
        color: $text-secondary;
        text-transform: uppercase;
        padding: $spacing-md $spacing-lg;
        margin-bottom: $spacing-md;
      }

      .setting-item {
        background: $bg-primary;
        border-radius: $radius-lg;
        box-shadow: $shadow-sm;
        padding: $spacing-lg;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: $spacing-sm;
        cursor: pointer;
        transition: all $transition-base;

        &:hover {
          box-shadow: $shadow-md;
        }

        &:active {
          box-shadow: $shadow-lg;
        }

        .setting-label {
          flex: 1;

          .label-title {
            font-size: $font-size-base;
            font-weight: $font-weight-medium;
            color: $text-primary;
            margin-bottom: $spacing-xs;

            &.logout-text {
              color: $error-color;
            }
          }

          .label-desc {
            font-size: $font-size-sm;
            color: $text-secondary;
          }
        }

        .setting-control {
          margin-left: $spacing-lg;
          flex-shrink: 0;

          input[type="checkbox"] {
            width: 20px;
            height: 20px;
            cursor: pointer;
          }

          &.version-selector {
            display: flex;
            gap: $spacing-sm;
            margin-left: $spacing-lg;

            .version-btn {
              padding: 8px 16px;
              border: 2px solid $border-light;
              background-color: white;
              border-radius: $radius-md;
              font-size: $font-size-sm;
              cursor: pointer;
              transition: all $transition-base;
              color: $text-primary;
              font-weight: $font-weight-medium;
              white-space: nowrap;

              &:hover {
                border-color: $primary-color;
              }

              &.active {
                background-color: $primary-color;
                color: white;
                border-color: $primary-color;
              }

              &:active {
                transform: scale(0.98);
              }
            }
          }
        }

        .setting-arrow {
          font-size: $font-size-lg;
          color: $primary-color;
          margin-left: $spacing-lg;
          flex-shrink: 0;
        }
      }
    }

    .bottom-spacing {
      height: $spacing-3xl;
    }
  }
}
</style>
