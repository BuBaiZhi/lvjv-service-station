<template>
  <view class="settings-list">
    <!-- 编辑个人资料 -->
    <view class="setting-item" @click="goToEditProfile">
      <view class="setting-content">
        <view class="setting-title">编辑个人资料</view>
        <view class="setting-desc">修改昵称、头像等信息</view>
      </view>
      <view class="setting-arrow">›</view>
    </view>

    <!-- 身份切换 -->
    <view class="setting-item">
      <view class="setting-content">
        <view class="setting-title">身份切换</view>
        <view class="setting-desc">在村民和游民之间切换</view>
      </view>
      <view class="setting-control">
        <uni-switch
          :checked="isVillager"
          @change="switchIdentity"
          class="switch"
        />
      </view>
    </view>

    <!-- 通知设置 -->
    <view class="setting-item">
      <view class="setting-content">
        <view class="setting-title">通知设置</view>
        <view class="setting-desc">管理消息通知偏好</view>
      </view>
      <view class="setting-control">
        <uni-switch
          :checked="notificationEnabled"
          @change="toggleNotification"
          class="switch"
        />
      </view>
    </view>

    <!-- 隐私与安全 -->
    <view class="setting-item" @click="goToPrivacy">
      <view class="setting-content">
        <view class="setting-title">隐私与账号安全</view>
        <view class="setting-desc">管理隐私设置和账号安全</view>
      </view>
      <view class="setting-arrow">›</view>
    </view>

    <!-- 关于应用 -->
    <view class="setting-item" @click="goToAbout">
      <view class="setting-content">
        <view class="setting-title">关于应用</view>
        <view class="setting-desc">版本信息和更新日志</view>
      </view>
      <view class="setting-arrow">›</view>
    </view>

    <!-- 退出登录 -->
    <view class="setting-item logout" @click="logout">
      <view class="setting-content">
        <view class="setting-title">退出登录</view>
      </view>
      <view class="setting-arrow">›</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

// 状态管理
const userStore = useUserStore()

// 计算属性
const isVillager = computed(() => userStore.settings.identity === 'villager')
const notificationEnabled = computed(() => userStore.settings.notificationEnabled)

// 编辑个人资料
const goToEditProfile = () => {
  uni.navigateTo({
    url: '/pages/user-center/edit-profile'
  })
}

// 切换身份
const switchIdentity = (event: any) => {
  const identity = event.detail.value ? 'villager' : 'nomad'
  userStore.switchIdentity(identity)
  uni.showToast({
    title: `已切换为${identity === 'villager' ? '村民' : '数字游民'}`,
    icon: 'success'
  })
}

// 切换通知
const toggleNotification = (event: any) => {
  userStore.updateSettings({
    notificationEnabled: event.detail.value
  })
  uni.showToast({
    title: event.detail.value ? '已启用通知' : '已禁用通知',
    icon: 'success'
  })
}

// 隐私与安全
const goToPrivacy = () => {
  uni.navigateTo({
    url: '/pages/privacy/index'
  })
}

// 关于应用
const goToAbout = () => {
  uni.navigateTo({
    url: '/pages/about/index'
  })
}

// 退出登录
const logout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除登录信息
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        
        // 返回登录页
        uni.reLaunch({
          url: '/pages/login/index'
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
@import '../styles/variables.scss';

.settings-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;

  .setting-item {
    @include card-style;
    @include flex-between;
    cursor: pointer;
    transition: box-shadow $transition-base;

    &:active {
      box-shadow: $shadow-lg;
    }

    &.logout {
      .setting-content {
        .setting-title {
          color: $error-color;
        }
      }
    }

    .setting-content {
      flex: 1;

      .setting-title {
        font-size: $font-size-base;
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-bottom: $spacing-xs;
      }

      .setting-desc {
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }

    .setting-control {
      display: flex;
      align-items: center;
      margin-left: $spacing-md;

      .switch {
        transform: scale(0.8);
      }
    }

    .setting-arrow {
      font-size: $font-size-xl;
      color: $text-hint;
      margin-left: $spacing-md;
      flex-shrink: 0;
    }
  }
}
</style>
