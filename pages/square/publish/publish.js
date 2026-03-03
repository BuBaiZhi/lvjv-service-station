const postService = require('../../../services/postService.js')
const draftService = require('../../../services/draftService.js')

Page({
  data: {
    categories: [
      { name: '活动信息', value: '活动' },
      { name: '找搭子', value: '找搭子' },
      { name: '技能变现', value: '技能变现' },
      { name: '社区讨论', value: '讨论' }
    ],
    currentCategory: '活动',
    title: '',
    content: '',
    images: [],
    tags: [],
    tagInput: '',
    location: '',
    canPublish: false,
    draftId: null,
    saveTimer: null,
    // 编辑模式
    isEdit: false,
    editId: ''
  },

  onLoad(options) {
    // 1. 编辑模式：加载已有帖子
    if (options.id && options.mode === 'edit') {
      this.setData({ isEdit: true, editId: options.id })
      this.loadPostData(options.id)
      wx.setNavigationBarTitle({ title: '编辑帖子' })
      return
    }
    
    // 2. 加载指定草稿
    if (options.draftId) {
      this.loadDraft(options.draftId)
    } else {
      // 3. 检查是否有未完成的草稿
      this.checkLastDraft()
    }
  },

  // 加载帖子数据（编辑模式）
  async loadPostData(postId) {
    try {
      const post = await postService.getPostById(postId)
      if (post) {
        this.setData({
          currentCategory: post.type || '活动',
          title: post.title || '',
          content: post.content || '',
          images: post.images || [],
          tags: post.tags || [],
          location: post.location || ''
        })
        this.checkCanPublish()
      }
    } catch (error) {
      console.error('加载帖子数据失败:', error)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 检查最近的草稿
  checkLastDraft() {
    draftService.getUserDrafts().then(drafts => {
      if (drafts && drafts.length > 0) {
        const lastDraft = drafts[0]  // 取最新的
        wx.showModal({
          title: '发现草稿',
          content: '是否继续上次未完成的发布？',
          success: (res) => {
            if (res.confirm) {
              this.loadDraft(lastDraft._id)
            }
          }
        })
      }
    })
  },

  // ✅ 检查是否可以发布
  checkCanPublish() {
    const canPublish = this.data.content.trim().length > 0
    this.setData({ canPublish })
  },

  // ✅ 自动保存草稿（防抖）
  autoSaveDraft() {
    // 清除之前的定时器
    if (this.data.saveTimer) {
      clearTimeout(this.data.saveTimer)
    }

    // 如果没有内容，不保存
    if (!this.data.content.trim() && !this.data.title.trim() && this.data.images.length === 0) {
      return
    }

    // 设置新的定时器，2秒后保存
    const timer = setTimeout(() => {
      this.saveDraft()
    }, 2000)

    this.setData({ saveTimer: timer })
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({ title: e.detail.value })
    this.checkCanPublish()
    this.autoSaveDraft()
  },

  // 内容输入
  onContentInput(e) {
    this.setData({ content: e.detail.value })
    this.checkCanPublish()
    this.autoSaveDraft()
  },

  // 标签输入
  onTagInput(e) {
    this.setData({ tagInput: e.detail.value })
  },

  // 添加标签
  addTag(e) {
    const tag = this.data.tagInput.trim()
    if (tag && this.data.tags.length < 5) {
      this.setData({
        tags: [...this.data.tags, tag],
        tagInput: ''
      })
      this.autoSaveDraft()
    }
  },

  // 删除标签
  removeTag(e) {
    const index = e.currentTarget.dataset.index
    const tags = this.data.tags.filter((_, i) => i !== index)
    this.setData({ tags })
    this.autoSaveDraft()
  },

  // 选择分类
  selectCategory(e) {
    const value = e.currentTarget.dataset.value
    this.setData({ currentCategory: value })
    this.autoSaveDraft()
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 9 - this.data.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          images: [...this.data.images, ...res.tempFilePaths]
        })
        this.checkCanPublish()
        this.autoSaveDraft()
      }
    })
  },

  // 删除图片
  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images.filter((_, i) => i !== index)
    this.setData({ images })
    this.checkCanPublish()
    this.autoSaveDraft()
  },

  // 选择位置
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          location: res.name || res.address
        })
        this.autoSaveDraft()
      },
      fail: () => {
        wx.showToast({
          title: '定位失败',
          icon: 'none'
        })
      }
    })
  },

  // ✅ 保存草稿到云数据库
  saveDraft() {
    // 如果没有内容，不保存
    if (!this.data.content.trim() && !this.data.title.trim() && this.data.images.length === 0) {
      return
    }

    console.log('正在保存草稿...')

    const draftData = {
      type: 'post',
      category: this.data.currentCategory,
      title: this.data.title,
      content: this.data.content,
      images: this.data.images,
      tags: this.data.tags,
      location: this.data.location,
      updateTime: new Date()
    }

    if (this.data.draftId) {
      // 更新现有草稿
      draftService.updateDraft(this.data.draftId, draftData).then(() => {
        console.log('草稿已更新')
      }).catch(err => {
        console.error('更新草稿失败:', err)
      })
    } else {
      // 新建草稿
      draftService.saveDraft(draftData).then(draftId => {
        this.setData({ draftId })
        console.log('草稿已保存, ID:', draftId)
      }).catch(err => {
        console.error('保存草稿失败:', err)
      })
    }
  },

  // ✅ 加载草稿
  loadDraft(draftId) {
    wx.showLoading({ title: '加载草稿...' })

    draftService.getDraft(draftId).then(draft => {
      if (draft) {
        this.setData({
          currentCategory: draft.category || '活动',
          title: draft.title || '',
          content: draft.content || '',
          images: draft.images || [],
          tags: draft.tags || [],
          location: draft.location || '',
          draftId: draft._id
        })
        this.checkCanPublish()
        wx.hideLoading()
        wx.showToast({
          title: '草稿加载成功',
          icon: 'success'
        })
      }
    }).catch(err => {
      wx.hideLoading()
      console.error('加载草稿失败:', err)
    })
  },

  // ✅ 发布帖子
  onPublish() {
    if (!this.data.canPublish) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    wx.showLoading({ title: this.data.isEdit ? '保存中...' : '发布中...' })

    const postData = {
      type: this.data.currentCategory,
      title: this.data.title,
      content: this.data.content,
      images: this.data.images,
      tags: this.data.tags,
      location: this.data.location
    }

    if (this.data.isEdit) {
      // 编辑模式：更新帖子
      this.updatePost(postData)
    } else {
      // 新建模式：发布帖子
      this.createPost(postData)
    }
  },

  // 创建新帖子
  createPost(postData) {
    const fullData = {
      ...postData,
      author: {
        id: 'currentUser',
        name: '当前用户',
        avatar: 'https://picsum.photos/100/100?random=999',
        identity: '村民',
        level: 1
      },
      createTime: new Date(),
      likes: 0,
      comments: 0,
      views: 0,
      collects: 0
    }

    postService.publishPost(fullData).then(newPostId => {
      // 发布成功后删除草稿
      if (this.data.draftId) {
        draftService.deleteDraft(this.data.draftId).catch(err => {
          console.error('删除草稿失败:', err)
        })
      }

      wx.hideLoading()
      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 1500,
        success: () => {
          this.notifyPrevPage()
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      })
    }).catch(err => {
      wx.hideLoading()
      console.error('发布失败:', err)
      wx.showToast({ title: '发布失败', icon: 'none' })
    })
  },

  // 更新帖子
  updatePost(postData) {
    // 模拟更新成功
    wx.hideLoading()
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    })
  },

  // 通知上一页刷新
  notifyPrevPage() {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage) {
      if (prevPage.loadPosts) {
        prevPage.loadPosts(true)
      }
      if (prevPage.loadRecommendedHouses) {
        prevPage.loadRecommendedHouses()
      }
    }
  },

  // ✅ 页面卸载时清理定时器
  onUnload() {
    if (this.data.saveTimer) {
      clearTimeout(this.data.saveTimer)
    }
  }
})