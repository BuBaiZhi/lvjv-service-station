// 我的交易页面
const app = getApp()

// 开发模式：使用模拟数据
const USE_MOCK = true

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

  async onLoad() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    await this.loadOrderList()
  },

  onShow() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    this.loadOrderList()
  },

  // 加载订单列表
  async loadOrderList() {
    if (USE_MOCK) {
      this.loadMockData()
      return
    }
    
    try {
      const api = require('../../../services/apiProxy.js')
      const orders = await api.getOrderList()
      
      if (orders) {
        this.setData({ 
          orderList: orders,
          filteredList: orders 
        })
        this.applyFilters()
      }
    } catch (error) {
      console.error('Failed to load order list:', error)
      this.loadMockData()
    }
  },

  // 加载模拟数据
  loadMockData() {
    const mockOrders = [
      {
        id: 'order_1',
        relatedId: 'house_1',
        title: '三亚NCC社区·唯吾岛',
        type: 'house',
        status: 'completed',
        statusText: '已完成',
        price: 200,
        date: '2026-01-15',
        image: 'https://picsum.photos/200/200?random=11'
      },
      {
        id: 'order_2',
        relatedId: 'post_1',
        title: '教授英语课程',
        type: 'skill',
        status: 'ongoing',
        statusText: '进行中',
        price: 80,
        date: '2026-02-01',
        image: 'https://picsum.photos/200/200?random=12'
      },
      {
        id: 'order_3',
        relatedId: 'post_2',
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
    const type = e.currentTarget.dataset.type
    
    // 如果没有type值，说明是点击下拉按钮，切换面板显示
    if (type === undefined || type === null) {
      this.setData({ typeFilterShow: !this.data.typeFilterShow })
      return
    }
    
    // 有type值，说明是点击选项，执行筛选
    this.setData({ 
      typeFilter: type,
      typeFilterShow: false
    }, () => {
      this.applyFilters()
    })
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
    const order = this.data.filteredList.find(item => item.id === orderId)
    
    if (!order) {
      wx.showToast({ title: '订单不存在', icon: 'none' })
      return
    }
    
    // 根据订单类型跳转到不同详情页
    if (order.type === 'house') {
      wx.navigateTo({ url: `/pages/house/detail/detail?id=${order.relatedId}` })
    } else {
      wx.navigateTo({ url: `/pages/square/detail/detail?id=${order.relatedId}` })
    }
  },

  // 联系对方
  contactSeller(e) {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})
