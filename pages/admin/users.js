Page({
  data: {
    keyword: '',
    currentFilter: 'all',
    users: [],
    refreshing: false,
    showActionModal: false,
    currentUser: null
  },

  onLoad() {
    this.loadUsers()
  },

  loadUsers() {
    // 模拟用户数据
    const mockUsers = [
      {
        id: 'u1',
        name: '游牧鸟官方',
        avatar: 'https://picsum.photos/100/100?random=1',
        role: '管理者',
        status: '正常',
        registerTime: '2024-01-01',
        postCount: 128,
        houseCount: 5,
        fansCount: 18943
      },
      {
        id: 'u2',
        name: 'VK游民',
        avatar: 'https://picsum.photos/100/100?random=2',
        role: '村民',
        status: '正常',
        registerTime: '2024-02-15',
        postCount: 23,
        houseCount: 0,
        fansCount: 45
      },
      {
        id: 'u3',
        name: '数字乡建',
        avatar: 'https://picsum.photos/100/100?random=3',
        role: '数字游民',
        status: '正常',
        registerTime: '2024-01-20',
        postCount: 56,
        houseCount: 2,
        fansCount: 9597
      },
      {
        id: 'u4',
        name: 'NCC社区',
        avatar: 'https://picsum.photos/100/100?random=4',
        role: '数字游民',
        status: '禁用',
        registerTime: '2023-12-10',
        postCount: 89,
        houseCount: 3,
        fansCount: 18943
      }
    ]
    
    this.setData({ users: mockUsers })
  },

  onSearch(e) {
    const keyword = e.detail.value
    this.setData({ keyword })
    // 实际应该调用搜索接口
  },

  setFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter })
    this.loadUsers() // 重新加载数据
  },

  onRefresh() {
    this.setData({ refreshing: true })
    setTimeout(() => {
      this.loadUsers()
      this.setData({ refreshing: false })
    }, 500)
  },

  goToUserDetail(e) {
    const id = e.currentTarget.dataset.id
    const user = this.data.users.find(u => u.id === id)
    this.setData({
      showActionModal: true,
      currentUser: user
    })
  },

  closeActionModal() {
    this.setData({
      showActionModal: false,
      currentUser: null
    })
  },

  changeRole() {
    wx.showActionSheet({
      itemList: ['村民', '数字游民', '管理者'],
      success: (res) => {
        const roles = ['村民', '数字游民', '管理者']
        const newRole = roles[res.tapIndex]
        
        wx.showToast({
          title: `已修改为${newRole}`,
          icon: 'success'
        })
        
        this.closeActionModal()
      }
    })
  },

  toggleStatus() {
    const newStatus = this.data.currentUser.status === '正常' ? '禁用' : '正常'
    wx.showToast({
      title: `账号已${newStatus}`,
      icon: 'success'
    })
    this.closeActionModal()
  },

  deleteUser() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该用户吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '用户已删除',
            icon: 'success'
          })
          this.closeActionModal()
        }
      }
    })
  }
})