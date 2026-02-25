# UI 组件使用指南

## 🎨 设计系统快速参考

### 颜色使用

#### 主色调（绿色）
```scss
// 主绿色 - 用于主要操作、品牌色
$primary-color: #4CAF50;

// 浅绿色 - 用于次要操作、背景
$primary-light: #81C784;

// 深绿色 - 用于悬停、强调
$primary-dark: #2E7D32;

// 极浅绿 - 用于背景、禁用状态
$primary-extra-light: #E8F5E9;
```

#### 辅助色（鹅黄色）
```scss
// 鹅黄色 - 用于强调、高亮
$secondary-color: #FDD835;

// 浅黄色 - 用于背景、提示
$secondary-light: #FFF9C4;

// 深黄色 - 用于警告、重要提示
$secondary-dark: #F9A825;

// 极浅黄 - 用于轻提示背景
$secondary-extra-light: #FFFDE7;
```

---

## 📦 常用组件样式

### 1. 按钮组件

#### 主按钮（绿色）
```vue
<button class="btn-primary">确认</button>

<style scoped>
.btn-primary {
  @include btn-primary;
}
</style>
```

#### 次按钮（灰色）
```vue
<button class="btn-secondary">取消</button>

<style scoped>
.btn-secondary {
  @include btn-secondary;
}
</style>
```

#### 危险按钮（红色）
```vue
<button class="btn-danger">删除</button>

<style scoped>
.btn-danger {
  @include btn-danger;
}
</style>
```

#### 圆形按钮
```vue
<button class="btn-round">编辑资料</button>

<style scoped>
.btn-round {
  @include btn-round;
}
</style>
```

---

### 2. 卡片组件

#### 基础卡片
```vue
<view class="card">
  <view class="card-title">标题</view>
  <view class="card-content">内容</view>
</view>

<style scoped>
.card {
  @include card-style;
}

.card-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.card-content {
  font-size: $font-size-base;
  color: $text-secondary;
}
</style>
```

#### 渐变卡片（用户卡片）
```vue
<view class="gradient-card">
  <view class="card-content">内容</view>
</view>

<style scoped>
.gradient-card {
  @include gradient-primary;
  border-radius: $radius-xl;
  padding: $spacing-xl;
  color: white;
}
</style>
```

---

### 3. 状态标签

#### 待确认
```vue
<view class="status-badge pending">待确认</view>

<style scoped>
.status-badge {
  &.pending {
    @include status-badge($status-pending-bg, $status-pending-text);
  }
}
</style>
```

#### 已确认
```vue
<view class="status-badge confirmed">已确认</view>

<style scoped>
.status-badge {
  &.confirmed {
    @include status-badge($status-confirmed-bg, $status-confirmed-text);
  }
}
</style>
```

#### 已完成
```vue
<view class="status-badge completed">已完成</view>

<style scoped>
.status-badge {
  &.completed {
    @include status-badge($status-completed-bg, $status-completed-text);
  }
}
</style>
```

#### 已取消
```vue
<view class="status-badge cancelled">已取消</view>

<style scoped>
.status-badge {
  &.cancelled {
    @include status-badge($status-cancelled-bg, $status-cancelled-text);
  }
}
</style>
```

---

### 4. 列表项

#### 基础列表项
```vue
<view class="list-item">
  <view class="item-content">
    <view class="item-title">标题</view>
    <view class="item-desc">描述</view>
  </view>
  <view class="item-action">›</view>
</view>

<style scoped>
.list-item {
  @include flex-between;
  @include card-style;
  margin-bottom: $spacing-md;
  cursor: pointer;
  transition: box-shadow $transition-base;

  &:active {
    box-shadow: $shadow-lg;
  }
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.item-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.item-action {
  font-size: $font-size-xl;
  color: $text-hint;
  margin-left: $spacing-md;
}
</style>
```

---

### 5. 空状态

#### 空状态容器
```vue
<view class="empty-state">
  <view class="empty-icon">📦</view>
  <view class="empty-text">暂无数据</view>
  <button class="btn-primary">创建新内容</button>
</view>

<style scoped>
.empty-state {
  @include flex-center;
  flex-direction: column;
  padding: $spacing-3xl $spacing-lg;
  color: $text-secondary;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: $spacing-lg;
}

.empty-text {
  font-size: $font-size-base;
  margin-bottom: $spacing-lg;
}
</style>
```

---

### 6. 输入框

#### 基础输入框
```vue
<input class="input-field" type="text" placeholder="请输入" />

<style scoped>
.input-field {
  width: 100%;
  padding: 10px $spacing-md;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  font-size: $font-size-base;
  color: $text-primary;
  transition: border-color $transition-fast;

  &:focus {
    border-color: $primary-color;
    outline: none;
  }

  &::placeholder {
    color: $text-hint;
  }
}
</style>
```

---

### 7. 开关组件

#### 基础开关
```vue
<uni-switch :checked="isEnabled" @change="handleChange" />

<style scoped>
// uni-switch 默认样式已支持，可通过以下方式自定义
// 启用状态：绿色
// 禁用状态：灰色
</style>
```

---

## 🎨 常用样式组合

### 弹性布局

#### 水平居中
```scss
@include flex-center;
```

#### 两端对齐
```scss
@include flex-between;
```

#### 列布局
```scss
@include flex-column;
```

---

### 文本处理

#### 单行截断
```scss
@include text-truncate;
```

#### 多行截断（2行）
```scss
@include text-clamp(2);
```

#### 多行截断（3行）
```scss
@include text-clamp(3);
```

---

### 间距系统

```scss
// 使用间距变量
margin: $spacing-lg;           // 16px
padding: $spacing-md;          // 12px
gap: $spacing-sm;              // 8px

// 组合使用
margin: $spacing-xl $spacing-lg;  // 上下 20px，左右 16px
```

---

### 圆角系统

```scss
// 按钮、标签
border-radius: $radius-sm;     // 4px

// 输入框、小卡片
border-radius: $radius-md;     // 8px

// 列表卡片
border-radius: $radius-lg;     // 12px

// 用户卡片
border-radius: $radius-xl;     // 16px

// 头像、圆形按钮
border-radius: $radius-full;   // 9999px
```

---

### 阴影系统

```scss
// 无阴影
box-shadow: none;

// 浅阴影
box-shadow: $shadow-sm;

// 中阴影
box-shadow: $shadow-md;

// 深阴影
box-shadow: $shadow-lg;

// 超深阴影
box-shadow: $shadow-xl;
```

---

### 过渡动画

```scss
// 快速过渡（按钮、小元素）
transition: all $transition-fast;

// 标准过渡（卡片、列表）
transition: all $transition-base;

// 缓慢过渡（页面转场）
transition: all $transition-slow;
```

---

## 📱 响应式设计

### 媒体查询

```scss
// 小屏幕
@media (max-width: $breakpoint-sm) {
  font-size: $font-size-sm;
}

// 中屏幕
@media (min-width: $breakpoint-md) and (max-width: $breakpoint-lg) {
  font-size: $font-size-base;
}

// 大屏幕
@media (min-width: $breakpoint-lg) {
  font-size: $font-size-lg;
}
```

---

## 🎯 最佳实践

### 1. 颜色使用规范
- ✅ 主操作使用绿色（$primary-color）
- ✅ 警告/强调使用黄色（$secondary-color）
- ✅ 错误使用红色（$error-color）
- ✅ 信息使用蓝色（$info-color）
- ❌ 不要混乱使用颜色

### 2. 间距使用规范
- ✅ 使用间距变量（$spacing-*）
- ✅ 保持间距的一致性
- ✅ 使用 gap 替代 margin 管理列表间距
- ❌ 不要使用硬编码的像素值

### 3. 圆角使用规范
- ✅ 按钮使用 $radius-md（8px）
- ✅ 卡片使用 $radius-lg（12px）
- ✅ 用户卡片使用 $radius-xl（16px）
- ✅ 头像使用 $radius-full（圆形）
- ❌ 不要混乱使用圆角

### 4. 阴影使用规范
- ✅ 卡片使用 $shadow-md
- ✅ 悬停状态使用 $shadow-lg
- ✅ 模态框使用 $shadow-xl
- ❌ 不要过度使用阴影

### 5. 过渡使用规范
- ✅ 按钮使用 $transition-fast
- ✅ 卡片使用 $transition-base
- ✅ 页面转场使用 $transition-slow
- ❌ 不要使用过长的过渡时间

---

## 🔍 调试技巧

### 检查颜色是否正确
```scss
// 使用 SCSS 变量而不是硬编码颜色
color: $text-primary;  // ✅ 正确
color: #212121;        // ❌ 错误
```

### 检查间距是否一致
```scss
// 使用间距变量
margin: $spacing-lg;   // ✅ 正确
margin: 16px;          // ❌ 错误
```

### 检查圆角是否统一
```scss
// 使用圆角变量
border-radius: $radius-lg;  // ✅ 正确
border-radius: 12px;        // ❌ 错误
```

---

## 📚 参考资源

- 颜色系统：见 `styles/variables.scss` 中的颜色变量
- 排版系统：见 `styles/variables.scss` 中的字体变量
- Mixin 混合：见 `styles/variables.scss` 中的 Mixin 定义
- 完整设计方案：见 `UI设计方案.md`

---

## 💡 常见问题

### Q: 如何自定义颜色？
A: 修改 `styles/variables.scss` 中的颜色变量，所有使用该变量的组件都会自动更新。

### Q: 如何添加新的间距值？
A: 在 `styles/variables.scss` 中添加新的 `$spacing-*` 变量。

### Q: 如何创建新的按钮样式？
A: 在 `styles/variables.scss` 中创建新的 Mixin（如 `@mixin btn-custom`），然后在组件中使用。

### Q: 如何实现深色模式？
A: 创建新的 SCSS 文件 `styles/dark-mode.scss`，定义深色模式的颜色变量，然后根据用户设置切换。

---

这套 UI 组件使用指南可以帮助团队快速、一致地开发界面。所有样式都基于统一的设计系统，确保整个应用的视觉一致性。
