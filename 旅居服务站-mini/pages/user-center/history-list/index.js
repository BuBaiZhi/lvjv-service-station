// 浏览历史页面
const app = getApp()

Page({
  data: {
    theme: 'light',
    appVersion: 'standard',
    historyList: [],
    isEditMode: false,
    selectedIds: []
  },

  onLoad() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    this.loadHistoryList()
  },

  // 加载浏览历史
  loadHistoryList() {
    // 模拟数据
    const mockHistory = [
      {
        id: 1,
        title: '精装公寓出租',
        type: 'house',
        price: 150,
        date: '2026-02-14 14:30',
        image: '/images/placeholder.png'
      },
      {
        id: 2,
        title: '周末露营活动',
        type: 'activity',
        price: 80,
        date: '2026-02-13 10:20',
        image: '/images/placeholder.png'
      },
      {
        id: 3,
        title: '钢琴教学',
        type: 'skill',
        price: 120,
        date: '2026-02-12 16:45',
        image: '/images/placeholder.png'
      },
      {
        id: 4,
        title: '海景房',
        type: 'house',
        price: 300,
        date: '2026-02-11 09:15',
        image: '/images/placeholder.png'
      }
    ]
    this.setData({ historyList: mockHistory })
  },

  // 切换编辑模式
  toggleEditMode() {
    this.setData({
      isEditMode: !this.data.isEditMode,
      selectedIds: []
    })
  },

  // 选择/取消选择
  toggleSelect(e) {
    const id = e.currentTarget.dataset.id
    const selectedIds = this.data.selectedIds
    const index = selectedIds.indexOf(id)
    
    if (index > -1) {
      selectedIds.splice(index, 1)
    } else {
      selectedIds.push(id)
    }
    
    this.setData({ selectedIds })
  },

  // 全选
  selectAll() {
    const allIds = this.data.historyList.map(item => item.id)
    this.setData({ selectedIds: allIds })
  },

  // 删除选中
  deleteSelected() {
    if (this.data.selectedIds.length === 0) {
      wx.showToast({
        title: '请选择要删除的记录',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${this.data.selectedIds.length} 条记录吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
          this.setData({
            isEditMode: false,
            selectedIds: []
          })
          this.loadHistoryList()
        }
      }
    })
  },

  // 查看详情
  viewDetail(e) {
    if (this.data.isEditMode) return
    
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: '详情功能开发中',
      icon: 'none'
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})
