<template>
  <div class="edit-profile-page">
    <!-- 背景选择器 -->
    <BackgroundSelector ref="backgroundSelector" @confirm="onBackgroundConfirm" />

    <!-- 页面头部 -->
    <div class="page-header">
      <button class="btn-back" @click="goBack">←</button>
      <div class="page-title">编辑资料</div>
      <div class="btn-placeholder"></div>
    </div>

    <!-- 页面内容 -->
    <div class="content-scroll">
      <div class="edit-container">
        <!-- 头像编辑区 -->
        <div class="avatar-section">
          <div class="avatar-container">
            <img :src="formData.avatar" class="avatar" />
          </div>
          <button class="btn-upload-avatar" @click="uploadAvatar">更换头像</button>
        </div>

        <!-- 基本信息编辑区 -->
        <div class="form-section">
          <!-- 昵称 -->
          <div class="form-group">
            <label class="form-label">昵称</label>
            <input
              v-model="formData.nickname"
              type="text"
              class="form-input"
              placeholder="请输入昵称"
              maxlength="20"
            />
            <div class="form-hint">{{ formData.nickname.length }}/20</div>
          </div>

          <!-- 性别 -->
          <div class="form-group">
            <label class="form-label">性别</label>
            <div class="gender-options">
              <button
                v-for="option in genderOptions"
                :key="option.value"
                class="gender-btn"
                :class="{ active: formData.gender === option.value }"
                @click="formData.gender = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- 身份 -->
          <div class="form-group">
            <label class="form-label">身份</label>
            <div class="identity-options">
              <button
                v-for="option in identityOptions"
                :key="option.value"
                class="identity-btn"
                :class="{ active: formData.identity === option.value }"
                @click="formData.identity = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- 个人简介 -->
          <div class="form-group">
            <label class="form-label">个人简介</label>
            <textarea
              v-model="formData.bio"
              class="form-textarea"
              placeholder="请输入个人简介"
              maxlength="200"
            ></textarea>
            <div class="form-hint">{{ formData.bio.length }}/200</div>
          </div>
        </div>

        <!-- 背景编辑区 -->
        <div class="background-section">
          <div class="section-title">卡片背景</div>
          <div class="background-preview" :style="backgroundPreviewStyle"></div>
          <button class="btn-edit-background" @click="openBackgroundSelector">编辑背景</button>
        </div>

        <!-- 底部间距 -->
        <div class="bottom-spacing"></div>
      </div>
    </div>

    <!-- 页面底部按钮 -->
    <div class="page-footer">
      <button class="btn-cancel" @click="cancel">取消</button>
      <button class="btn-save" :disabled="isSaveDisabled" @click="saveProfile">保存</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="saving" class="loading-overlay">
      <div class="loading-spinner">保存中...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import BackgroundSelector from '../../components/BackgroundSelector.vue'
import { getBackgroundStyle } from '../../services/background'

// 类型定义
interface FormData {
  avatar: string
  nickname: string
  gender: 'male' | 'female' | 'other' | null
  identity: 'villager' | 'nomad'
  bio: string
}

// 状态管理
const userStore = useUserStore()
const router = useRouter()
const formData = ref<FormData>({
  avatar: '',
  nickname: '',
  gender: null,
  identity: 'villager',
  bio: ''
})

const loading = ref(false)
const saving = ref(false)
const backgroundSelector = ref<InstanceType<typeof BackgroundSelector>>()

// 选项列表
const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '其他', value: 'other' }
]

const identityOptions = [
  { label: '村民', value: 'villager' },
  { label: '游民', value: 'nomad' }
]

// 计算属性
const isSaveDisabled = computed(() => {
  return !formData.value.nickname || saving.value
})

const backgroundPreviewStyle = computed(() => {
  return getBackgroundStyle()
})

// 方法
// 加载用户信息
const loadUserProfile = async () => {
  loading.value = true
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 从用户存储中获取信息
    const userInfo = userStore.userInfo
    formData.value = {
      avatar: userInfo.avatar,
      nickname: userInfo.nickname,
      gender: userInfo.gender,
      identity: userInfo.identity,
      bio: userInfo.bio
    }
  } finally {
    loading.value = false
  }
}

// 上传头像
const uploadAvatar = () => {
  if (typeof uni === 'undefined') {
    // 浏览器环境
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event: any) => {
          formData.value.avatar = event.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  } else {
    // uni-app 环境
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        formData.value.avatar = res.tempFilePaths[0]
      }
    })
  }
}

// 打开背景选择器
const openBackgroundSelector = () => {
  backgroundSelector.value?.openModal()
}

// 背景确认回调
const onBackgroundConfirm = () => {
  console.log('背景已更新')
}

// 验证表单
const validateForm = (): boolean => {
  if (!formData.value.nickname) {
    alert('昵称不能为空')
    return false
  }
  if (formData.value.nickname.length < 2 || formData.value.nickname.length > 20) {
    alert('昵称长度应为 2-20 字')
    return false
  }
  if (formData.value.bio.length > 200) {
    alert('简介长度不能超过 200 字')
    return false
  }
  return true
}

// 保存修改
const saveProfile = async () => {
  if (!validateForm()) return
  
  saving.value = true
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新用户信息到存储
    userStore.updateUserInfo({
      avatar: formData.value.avatar,
      nickname: formData.value.nickname,
      gender: formData.value.gender,
      identity: formData.value.identity,
      bio: formData.value.bio
    })
    
    // 显示成功提示
    if (typeof uni === 'undefined') {
      alert('保存成功')
    } else {
      uni.showToast({ title: '保存成功', icon: 'success' })
    }
    
    // 停留在当前页面
    // 保存成功，用户可以继续修改其他信息
  } finally {
    saving.value = false
  }
}

// 取消修改
const cancel = () => {
  goBack()
}

// 返回
const goBack = () => {
  router.back()
}

// 页面加载
onMounted(() => {
  loadUserProfile()
})
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

.edit-profile-page {
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
    display: flex;
    flex-direction: column;
  }

  .edit-container {
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
  }

  // 头像编辑区
  .avatar-section {
    text-align: center;
    margin-bottom: $spacing-3xl;
    padding: $spacing-xl;
    background-color: white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;

    .avatar-container {
      margin-bottom: $spacing-lg;

      .avatar {
        width: 120px;
        height: 120px;
        border-radius: 9999px;
        border: 3px solid $primary-color;
        object-fit: cover;
      }
    }

    .btn-upload-avatar {
      padding: $spacing-md $spacing-xl;
      margin: 0;
      border: none;
      background-color: $primary-color;
      color: white;
      border-radius: $radius-md;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: darken($primary-color, 10%);
      }

      &:active {
        transform: scale(0.98);
      }
    }
  }

  // 表单区
  .form-section {
    background-color: white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    padding: $spacing-lg;
    margin-bottom: $spacing-lg;

    .form-group {
      margin-bottom: $spacing-lg;

      &:last-child {
        margin-bottom: 0;
      }

      .form-label {
        display: block;
        font-size: $font-size-base;
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-bottom: $spacing-md;
      }

      .form-input,
      .form-textarea {
        width: 100%;
        padding: $spacing-md;
        border: 1px solid $border-light;
        border-radius: $radius-md;
        font-size: $font-size-base;
        color: $text-primary;
        font-family: inherit;
        transition: border-color 0.3s ease;

        &:focus {
          outline: none;
          border-color: $primary-color;
        }

        &::placeholder {
          color: $text-secondary;
        }
      }

      .form-textarea {
        resize: vertical;
        min-height: 100px;
      }

      .form-hint {
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-top: $spacing-sm;
        text-align: right;
      }

      // 性别选项
      .gender-options,
      .identity-options {
        display: flex;
        gap: $spacing-md;

        .gender-btn,
        .identity-btn {
          flex: 1;
          padding: $spacing-md;
          border: 1px solid $border-light;
          background-color: white;
          border-radius: $radius-md;
          font-size: $font-size-base;
          color: $text-primary;
          cursor: pointer;
          transition: all 0.3s ease;

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
  }

  // 背景编辑区
  .background-section {
    background-color: white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    padding: $spacing-lg;
    margin-bottom: $spacing-lg;

    .section-title {
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      color: $text-primary;
      margin-bottom: $spacing-md;
    }

    .background-preview {
      width: 100%;
      height: 120px;
      border-radius: $radius-md;
      margin-bottom: $spacing-md;
      box-shadow: $shadow-md;
    }

    .btn-edit-background {
      width: 100%;
      padding: $spacing-md;
      margin: 0;
      border: none;
      background-color: $primary-color;
      color: white;
      border-radius: $radius-md;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: darken($primary-color, 10%);
      }

      &:active {
        transform: scale(0.98);
      }
    }
  }

  .bottom-spacing {
    height: $spacing-3xl;
  }

  // 页面底部按钮
  .page-footer {
    height: 60px;
    background-color: white;
    display: flex;
    gap: $spacing-md;
    padding: $spacing-md $spacing-lg;
    box-shadow: $shadow-lg;
    position: relative;
    z-index: 10;

    button {
      flex: 1;
      padding: $spacing-md;
      border: none;
      border-radius: $radius-md;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      cursor: pointer;
      transition: all 0.3s ease;

      &.btn-cancel {
        background-color: white;
        color: $text-primary;
        border: 1px solid $border-light;

        &:hover {
          background-color: $bg-secondary;
        }

        &:active {
          transform: scale(0.98);
        }
      }

      &.btn-save {
        background-color: $primary-color;
        color: white;

        &:hover:not(:disabled) {
          background-color: darken($primary-color, 10%);
        }

        &:active:not(:disabled) {
          transform: scale(0.98);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
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
