// 我的交易页面
const app = getApp()

Page({
  data: {
    theme: 'light',
    appVersion: 'standard',
    activeTab: 'all',
    orderList: [],
    filteredList: [],
    // 下拉筛选
    typeFilter: 'all',
    typeFilterShow: false,
    typeOptions: [
      { value: 'all', label: '全部类型' },
      { value: 'house', label: '民宿' },
      { value: 'skill', label: '技能' },
      { value: 'activity', label: '活动' },
      { value: 'goods', label: '二手物品' }
    ]
  },

  onLoad() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    this.loadOrderList()
  },

  onShow() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
  },

  // 加载订单列表
  loadOrderList() {
    // 模拟数据
    const mockOrders = [
      {
        id: 1,
        title: '温馨两居室',
        type: 'house',
        status: 'completed',
        statusText: '已完成',
        price: 200,
        date: '2026-01-15',
        image: 'https://picsum.photos/200/200?random=11'
      },
      {
        id: 2,
        title: '教授英语课程',
        type: 'skill',
        status: 'ongoing',
        statusText: '进行中',
        price: 80,
        date: '2026-02-01',
        image: 'https://picsum.photos/200/200?random=12'
      },
      {
        id: 3,
        title: '周末登山活动',
        type: 'activity',
        status: 'pending',
        statusText: '待确认',
        price: 50,
        date: '2026-02-20',
        image: 'https://picsum.photos/200/200?random=13'
      }
    ]
    this.setData({ 
      orderList: mockOrders,
      filteredList: mockOrders 
    })
    // 确保初始筛选正确
    this.applyFilters()
  },

  // 切换状态标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    console.log('switchTab:', tab)
    // 先关闭下拉面板，再切换标签
    this.setData({ 
      activeTab: tab,
      typeFilterShow: false
    }, () => {
      console.log('activeTab updated to:', tab)
      this.applyFilters()
    })
  },

  // 切换类型筛选
  toggleTypeFilter(e) {
    // 获取 data-index
    const index = parseInt(e.currentTarget.dataset.index)
    
    // 判断是否是点击下拉按钮（index 不存在或为 NaN）
    if (isNaN(index)) {
      // 点击下拉按钮，切换面板显示
      this.setData({ typeFilterShow: !this.data.typeFilterShow })
      return
    }
    
    // index 存在，读取对应的 option 值
    const selectedOption = this.data.typeOptions[index]
    if (selectedOption) {
      console.log('[Order] 选择筛选类型:', selectedOption.value)
      this.setData({ 
        typeFilter: selectedOption.value,
        typeFilterShow: false
      }, () => {
        this.applyFilters()
      })
    }
  },

  // 下拉遮罩点击 - 防止事件冒泡
  preventClose() {
    // 仅阻断事件传播，不执行任何操作
  },

  // 关闭筛选面板
  closeTypeFilter() {
    this.setData({ typeFilterShow: false })
  },

  // 应用筛选
  applyFilters() {
    console.log('applyFilters - activeTab:', this.data.activeTab, 'typeFilter:', this.data.typeFilter)
    let result = this.data.orderList
    
    // 按状态筛选
    if (this.data.activeTab !== 'all') {
      result = result.filter(item => item.status === this.data.activeTab)
    }
    
    // 按类型筛选
    if (this.data.typeFilter !== 'all') {
      result = result.filter(item => item.type === this.data.typeFilter)
    }
    
    console.log('applyFilters - result:', result)
    this.setData({ filteredList: result })
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.showToast({
      title: '订单详情功能开发中',
      icon: 'none'
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})
