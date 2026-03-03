Page({
  data: {
    currentDate: '',
    stats: {
      userCount: 0,
      pendingCount: 0,
      postCount: 0,
      houseCount: 0
    },
    pendingList: [],
    recentUsers: []
  },

  onLoad() {
    this.setCurrentDate()
    this.loadStats()
    this.loadPendingList()
    this.loadRecentUsers()
  },

  setCurrentDate() {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekday = weekdays[date.getDay()]
    
    this.setData({
      currentDate: `${year}.${month}.${day} ${weekday}`
    })
  },

  loadStats() {
    // 模拟统计数据
    this.setData({
      stats: {
        userCount: 128,
        pendingCount: 12,
        postCount: 356,
        houseCount: 89
      }
    })
  },

  loadPendingList() {
    // 模拟待审核数据
    this.setData({
      pendingList: [
        {
          id: 'p1',
          type: '帖子',
          title: '寻找深圳有趣的朋友',
          author: 'VK游民',
          image: 'https://picsum.photos/100/100?random=1',
          time: '5分钟前'
        },
        {
          id: 'h1',
          type: '房源',
          title: '三亚NCC社区·唯吾岛',
          author: 'NCC社区',
          image: 'https://picsum.photos/100/100?random=2',
          time: '15分钟前'
        },
        {
          id: 'p2',
          type: '帖子',
          title: '【招募】数字游民社区主理人',
          author: '游牧鸟官方',
          image: 'https://picsum.photos/100/100?random=3',
          time: '25分钟前'
        }
      ]
    })
  },

  loadRecentUsers() {
    // 模拟最近注册用户
    this.setData({
      recentUsers: [
        {
          id: 'u1',
          name: '数字游民小明',
          avatar: 'https://picsum.photos/100/100?random=4',
          role: '数字游民',
          registerTime: '2024-03-15'
        },
        {
          id: 'u2',
          name: '村民小李',
          avatar: 'https://picsum.photos/100/100?random=5',
          role: '村民',
          registerTime: '2024-03-14'
        },
        {
          id: 'u3',
          name: '自由职业者阿杰',
          avatar: 'https://picsum.photos/100/100?random=6',
          role: '数字游民',
          registerTime: '2024-03-14'
        }
      ]
    })
  },

  goToUsers() {
    wx.navigateTo({
      url: '/pages/admin/users'
    })
  },

  goToAudit() {
    wx.navigateTo({
      url: '/pages/admin/audit'
    })
  },

  goToPosts() {
    wx.showToast({
      title: '帖子管理开发中',
      icon: 'none'
    })
  },

  goToHouses() {
    wx.showToast({
      title: '房源管理开发中',
      icon: 'none'
    })
  },

  goToStats() {
    wx.navigateTo({
      url: '/pages/admin/stats'
    })
  },

  goToSettings() {
    wx.showToast({
      title: '系统设置开发中',
      icon: 'none'
    })
  },

  goToAuditDetail(e) {
    const { id, type } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/admin/audit-detail?id=${id}&type=${type}`
    })
  },

  goToUserDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/admin/user-detail?id=${id}`
    })
  }
})