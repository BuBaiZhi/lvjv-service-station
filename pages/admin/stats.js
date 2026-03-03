Page({
  data: {
    currentTimeRange: 'day',
    stats: {
      dau: 0,
      newUsers: 0,
      posts: 0,
      bookings: 0
    },
    userDistribution: {
      nomad: 0,
      villager: 0,
      admin: 0,
      nomadPercent: 0,
      villagerPercent: 0,
      adminPercent: 0
    },
    contentStats: {
      totalPosts: 0,
      totalHouses: 0,
      totalComments: 0,
      pendingCount: 0
    },
    userTrend: []
  },

  onLoad() {
    this.loadStats()
  },

  setTimeRange(e) {
    const range = e.currentTarget.dataset.range
    this.setData({ currentTimeRange: range })
    this.loadStats()
  },

  loadStats() {
    // 基础统计数据
    const nomad = 456
    const villager = 789
    const admin = 3
    const total = nomad + villager + admin

    this.setData({
      stats: {
        dau: 1234,
        newUsers: 56,
        posts: 89,
        bookings: 34
      },
      userDistribution: {
        nomad: nomad,
        villager: villager,
        admin: admin,
        nomadPercent: ((nomad / total) * 100).toFixed(1),
        villagerPercent: ((villager / total) * 100).toFixed(1),
        adminPercent: ((admin / total) * 100).toFixed(1)
      },
      contentStats: {
        totalPosts: 1234,
        totalHouses: 456,
        totalComments: 5678,
        pendingCount: 23
      },
      userTrend: [
        { date: '周一', value: 120 },
        { date: '周二', value: 135 },
        { date: '周三', value: 142 },
        { date: '周四', value: 158 },
        { date: '周五', value: 165 },
        { date: '周六', value: 189 },
        { date: '周日', value: 176 }
      ]
    })
  },

  // 导出单个数据
  exportData(e) {
    const type = e.currentTarget.dataset.type
    const typeNames = {
      users: '日活用户',
      newUsers: '新增用户',
      posts: '新增帖子',
      bookings: '预订量'
    }
    
    wx.showToast({
      title: `正在导出${typeNames[type]}`,
      icon: 'none',
      duration: 1500
    })

    setTimeout(() => {
      wx.showToast({
        title: '导出成功',
        icon: 'success'
      })
    }, 1000)
  },

  // 导出图表
  exportChart(e) {
    const type = e.currentTarget.dataset.type
    const typeNames = {
      users: '用户分布',
      trend: '增长趋势'
    }
    
    wx.showToast({
      title: `正在导出${typeNames[type]}`,
      icon: 'none',
      duration: 1500
    })

    setTimeout(() => {
      wx.showToast({
        title: '导出成功',
        icon: 'success'
      })
    }, 1000)
  },

  // 导出全部数据
  exportAllData() {
    wx.showToast({
      title: '正在导出全部数据',
      icon: 'none',
      duration: 2000
    })

    setTimeout(() => {
      wx.showToast({
        title: '导出成功',
        icon: 'success'
      })
    }, 1500)
  }
})