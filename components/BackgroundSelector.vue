<template>
  <div class="background-selector-modal" v-if="isVisible" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- 标题 -->
      <div class="modal-header">
        <h3>选择卡片背景</h3>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <!-- 默认背景选项 -->
      <div class="section">
        <h4>预设背景</h4>
        <div class="default-backgrounds">
          <div
            v-for="bg in defaultBackgrounds"
            :key="bg.id"
            class="background-option"
            :class="{ active: isSelected(bg.id) }"
            :style="{ background: bg.gradient }"
            @click="selectBackground(bg.id)"
          >
            <span class="bg-name">{{ bg.name }}</span>
            <span v-if="isSelected(bg.id)" class="check-mark">✓</span>
          </div>
        </div>
      </div>

      <!-- 上传自定义背景 -->
      <div class="section">
        <h4>自定义背景</h4>
        <div class="upload-area">
          <input
            type="file"
            ref="fileInput"
            accept="image/jpeg,image/png,image/webp"
            @change="handleFileSelect"
            style="display: none"
          />
          <button class="upload-btn" @click="triggerFileInput">
            📁 选择图片
          </button>
          <p class="upload-hint">支持 JPG、PNG、WebP 格式，文件大小不超过 500KB</p>
        </div>
      </div>

      <!-- 预览 -->
      <div class="section">
        <h4>预览效果</h4>
        <div class="preview-card" :style="previewStyle">
          <div class="preview-content">
            <div class="preview-avatar"></div>
            <div class="preview-text">
              <div class="preview-name">用户昵称</div>
              <div class="preview-badge">身份标签</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="modal-footer">
        <button class="btn-cancel" @click="closeModal">取消</button>
        <button class="btn-confirm" @click="confirmSelection">确认</button>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner">处理中...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  getDefaultBackgrounds,
  getBackgroundStyle,
  getUserBackground,
  saveUserBackground,
  handleFileUpload,
  handleUniFileUpload
} from '../services/background'

// 状态
const isVisible = ref(false)
const isLoading = ref(false)
const fileInput = ref<HTMLInputElement>()
const selectedBackgroundId = ref<string>('')
const selectedImageUrl = ref<string>('')
const defaultBackgrounds = ref(getDefaultBackgrounds())

// 初始化选中的背景
const initializeSelection = () => {
  const userBg = getUserBackground()
  if (userBg.type === 'custom' && userBg.imageUrl) {
    selectedImageUrl.value = userBg.imageUrl
    selectedBackgroundId.value = ''
  } else {
    selectedBackgroundId.value = userBg.backgroundId || 'green'
    selectedImageUrl.value = ''
  }
}

// 打开模态框
const openModal = () => {
  initializeSelection()
  isVisible.value = true
}

// 关闭模态框
const closeModal = () => {
  isVisible.value = false
}

// 检查是否选中
const isSelected = (bgId: string) => {
  return selectedBackgroundId.value === bgId && !selectedImageUrl.value
}

// 选择默认背景
const selectBackground = (bgId: string) => {
  selectedBackgroundId.value = bgId
  selectedImageUrl.value = ''
}

// 触发文件输入
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  isLoading.value = true
  try {
    const dataUrl = await handleFileUpload(file)
    selectedImageUrl.value = dataUrl
    selectedBackgroundId.value = ''
  } catch (error) {
    alert(error instanceof Error ? error.message : '上传失败')
  } finally {
    isLoading.value = false
    // 重置文件输入
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

// 预览样式
const previewStyle = computed(() => {
  if (selectedImageUrl.value) {
    return {
      backgroundImage: `url(${selectedImageUrl.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }

  const bg = defaultBackgrounds.value.find(b => b.id === selectedBackgroundId.value)
  if (bg) {
    return {
      background: bg.gradient
    }
  }

  return {
    background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)'
  }
})

// 确认选择
const confirmSelection = () => {
  if (selectedImageUrl.value) {
    saveUserBackground('', selectedImageUrl.value)
  } else {
    saveUserBackground(selectedBackgroundId.value || 'green')
  }
  
  // 发送事件通知父组件
  emit('confirm')
  closeModal()
}

// 暴露方法给父组件
defineExpose({
  openModal,
  closeModal
})

// 定义事件
const emit = defineEmits<{
  confirm: []
}>()
</script>

<style lang="scss" scoped>
@import '../styles/variables.scss';

.background-selector-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: $spacing-lg;

  .modal-content {
    background-color: white;
    border-radius: $radius-lg;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: $shadow-xl;

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: $spacing-lg;
      border-bottom: 1px solid $border-light;

      h3 {
        margin: 0;
        font-size: $font-size-lg;
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }

      .close-btn {
        padding: 0;
        margin: 0;
        border: none;
        background: none;
        font-size: $font-size-lg;
        color: $text-secondary;
        cursor: pointer;
        transition: color $transition-base;

        &:hover {
          color: $text-primary;
        }
      }
    }

    .section {
      padding: $spacing-lg;
      border-bottom: 1px solid $border-light;

      h4 {
        margin: 0 0 $spacing-md 0;
        font-size: $font-size-base;
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }

      .default-backgrounds {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: $spacing-md;

        .background-option {
          aspect-ratio: 1;
          border-radius: $radius-md;
          cursor: pointer;
          transition: all $transition-base;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid transparent;
          overflow: hidden;

          &:hover {
            transform: scale(1.05);
          }

          &.active {
            border-color: white;
            box-shadow: 0 0 0 3px $primary-color;
          }

          .bg-name {
            font-size: $font-size-xs;
            color: white;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            text-align: center;
            opacity: 0;
            transition: opacity $transition-base;
          }

          .check-mark {
            position: absolute;
            top: $spacing-sm;
            right: $spacing-sm;
            font-size: $font-size-lg;
            color: white;
            background-color: $primary-color;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          &:hover .bg-name {
            opacity: 1;
          }
        }
      }

      .upload-area {
        text-align: center;

        .upload-btn {
          padding: $spacing-lg $spacing-xl;
          margin: 0;
          border: 2px dashed $border-color;
          background-color: $bg-secondary;
          color: $text-primary;
          border-radius: $radius-md;
          font-size: $font-size-base;
          font-weight: $font-weight-medium;
          cursor: pointer;
          transition: all $transition-base;
          width: 100%;

          &:hover {
            border-color: $primary-color;
            background-color: $primary-extra-light;
          }

          &:active {
            transform: scale(0.98);
          }
        }

        .upload-hint {
          margin: $spacing-md 0 0 0;
          font-size: $font-size-sm;
          color: $text-secondary;
        }
      }

      .preview-card {
        aspect-ratio: 16 / 9;
        border-radius: $radius-lg;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: $shadow-md;

        .preview-content {
          display: flex;
          align-items: center;
          gap: $spacing-lg;
          padding: $spacing-lg;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: $radius-md;

          .preview-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.3);
            flex-shrink: 0;
          }

          .preview-text {
            color: white;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);

            .preview-name {
              font-size: $font-size-base;
              font-weight: $font-weight-semibold;
              margin-bottom: $spacing-xs;
            }

            .preview-badge {
              font-size: $font-size-sm;
              opacity: 0.9;
            }
          }
        }
      }
    }

    .modal-footer {
      display: flex;
      gap: $spacing-md;
      padding: $spacing-lg;
      background-color: $bg-secondary;
      border-radius: 0 0 $radius-lg $radius-lg;

      button {
        flex: 1;
        padding: $spacing-md $spacing-lg;
        border: none;
        border-radius: $radius-md;
        font-size: $font-size-base;
        font-weight: $font-weight-medium;
        cursor: pointer;
        transition: all $transition-base;

        &.btn-cancel {
          background-color: white;
          color: $text-primary;
          border: 1px solid $border-color;

          &:hover {
            background-color: $bg-secondary;
          }

          &:active {
            transform: scale(0.98);
          }
        }

        &.btn-confirm {
          background-color: $primary-color;
          color: white;

          &:hover {
            background-color: darken($primary-color, 10%);
          }

          &:active {
            transform: scale(0.98);
          }
        }
      }
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: $radius-lg;

      .loading-spinner {
        background-color: white;
        padding: $spacing-lg $spacing-xl;
        border-radius: $radius-md;
        font-size: $font-size-base;
        color: $text-primary;
      }
    }
  }
}
</style>
