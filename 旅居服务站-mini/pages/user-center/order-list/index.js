// 我的交易页面
const app = getApp()

Page({
  data: {
    theme: 'light',
    appVersion: 'standard',
    activeTab: 'all',
    orderList: []
  },

  onLoad() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    this.loadOrderList()
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
    this.setData({ orderList: mockOrders })
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
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
