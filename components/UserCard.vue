<template>
  <div class="user-card">
    <div class="card-container" :style="cardBackgroundStyle">
      <!-- 背景装饰 -->
      <div class="card-bg"></div>

      <!-- 用户信息内容 -->
      <div class="card-content">
        <!-- 头像和基本信息 -->
        <div class="user-info">
          <img :src="user.avatar" class="avatar" />
          <div class="info-text">
            <div class="nickname">{{ user.nickname }}</div>
            <div class="identity-badge">
              <span class="badge" :class="user.identity">
                {{ identityLabel }}
              </span>
              <span v-if="user.gender" class="gender">{{ genderLabel }}</span>
            </div>
            <div class="bio">{{ user.bio }}</div>
          </div>
        </div>

        <!-- 编辑按钮 -->
        <div class="edit-btn">
          <button @click="goToEditProfile" class="btn-edit">编辑资料</button>
        </div>
      </div>

      <!-- 社区参与数据 -->
      <div class="stats-container">
        <div class="stat-item">
          <div class="stat-value">{{ user.postCount }}</div>
          <div class="stat-label">发帖</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ user.commentCount }}</div>
          <div class="stat-label">评论</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ user.likeCount }}</div>
          <div class="stat-label">获赞</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getBackgroundStyle } from '../services/background'

// 状态管理
const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.userInfo)

// 获取卡片背景样式
const cardBackgroundStyle = computed(() => {
  return getBackgroundStyle()
})

// 身份标签
const identityLabel = computed(() => {
  return user.value.identity === 'villager' ? '村民' : '数字游民'
})

// 性别标签
const genderLabel = computed(() => {
  const genderMap: Record<string, string> = {
    male: '男',
    female: '女',
    other: '其他'
  }
  return user.value.gender ? genderMap[user.value.gender] : ''
})

// 编辑资料
const goToEditProfile = () => {
  router.push('/pages/user-center/edit-profile')
}
</script>

<style lang="scss" scoped>
@import '../styles/variables.scss';

.user-card {
  padding: $spacing-lg;
  background-color: $bg-secondary;

  .card-container {
    background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
    border-radius: $radius-xl;
    overflow: hidden;
    box-shadow: $shadow-lg;
    position: relative;

    .card-bg {
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
      background-size: 50px 50px;
      opacity: 0.5;
    }

    .card-content {
      position: relative;
      z-index: 1;
      padding: $spacing-xl;

      .user-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: $spacing-xl;

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: $radius-full;
          border: 3px solid rgba(255, 255, 255, 0.3);
          flex-shrink: 0;
          object-fit: cover;
        }

        .info-text {
          flex: 1;
          margin-left: $spacing-lg;
          color: white;

          .nickname {
            font-size: $font-size-lg;
            font-weight: $font-weight-bold;
            margin-bottom: $spacing-sm;
          }

          .identity-badge {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            margin-bottom: $spacing-md;
            gap: $spacing-md;

            .badge {
              display: inline-block;
              padding: 4px 12px;
              background-color: rgba(255, 255, 255, 0.3);
              border-radius: $radius-full;
              font-size: $font-size-xs;
              font-weight: $font-weight-medium;

              &.villager {
                background-color: rgba(255, 255, 255, 0.4);
              }

              &.nomad {
                background-color: rgba(255, 255, 255, 0.3);
              }
            }

            .gender {
              font-size: $font-size-xs;
              opacity: 0.9;
            }
          }

          .bio {
            font-size: $font-size-sm;
            opacity: 0.95;
            line-height: $line-height-normal;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      }

      .edit-btn {
        text-align: right;

        .btn-edit {
          padding: 8px 20px;
          margin: 0;
          border: none;
          background-color: rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: $radius-full;
          font-size: $font-size-sm;
          font-weight: $font-weight-medium;
          transition: background-color $transition-base;
          cursor: pointer;
          font-family: inherit;

          &:hover {
            background-color: rgba(255, 255, 255, 0.4);
          }

          &:active {
            background-color: rgba(255, 255, 255, 0.5);
          }

          &:focus {
            outline: none;
          }
        }
      }
    }

    .stats-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: $spacing-lg $spacing-xl;
      background-color: rgba(0, 0, 0, 0.1);
      border-top: 1px solid rgba(255, 255, 255, 0.2);

      .stat-item {
        flex: 1;
        text-align: center;
        color: white;

        .stat-value {
          font-size: $font-size-xl;
          font-weight: $font-weight-bold;
          margin-bottom: $spacing-xs;
        }

        .stat-label {
          font-size: $font-size-xs;
          opacity: 0.9;
        }
      }

      .stat-divider {
        width: 1px;
        height: 30px;
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }
}
</style>
