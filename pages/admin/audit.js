Page({
  data: {
    currentTab: 'post',
    postPendingCount: 5,
    housePendingCount: 3,
    postList: [],
    houseList: [],
    todayPending: 8,
    todayApproved: 12,
    todayRejected: 2
  },

  onLoad() {
    this.loadPostList()
    this.loadHouseList()
  },

  loadPostList() {
    // 模拟待审核帖子
    this.setData({
      postList: [
        {
          id: 'p1',
          authorName: 'VK游民',
          authorAvatar: 'https://picsum.photos/100/100?random=1',
          authorRole: '村民',
          title: '寻找深圳有趣的朋友',
          content: '刚搬到深圳想寻找有趣的朋友们平时一起玩，可以DeepTalk，散步约饭...',
          images: ['https://picsum.photos/600/400?random=1'],
          tags: ['深圳', '搭子', '交友'],
          time: '5分钟前'
        },
        {
          id: 'p2',
          authorName: '数字乡建',
          authorAvatar: 'https://picsum.photos/100/100?random=2',
          authorRole: '数字游民',
          title: '【招募】数字游民社区主理人',
          content: '我们需要一位社区主理人，负责组织活动、维护社群氛围...',
          images: [],
          tags: ['招募', '主理人'],
          time: '15分钟前'
        }
      ]
    })
  },

  loadHouseList() {
    // 模拟待审核房源
    this.setData({
      houseList: [
        {
          id: 'h1',
          authorName: 'NCC社区',
          authorAvatar: 'https://picsum.photos/100/100?random=3',
          authorRole: '数字游民',
          title: '三亚NCC社区·唯吾岛',
          location: '海南省三亚市崖州区',
          price: 45,
          unit: '天',
          image: 'https://picsum.photos/600/400?random=2',
          description: '出门是海，硬件顶配，暖冬必选。NCC社区三亚据点...',
          time: '25分钟前'
        }
      ]
    })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
  },

  approve(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: '已通过',
      icon: 'success'
    })
  },

  reject(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '拒绝原因',
      editable: true,
      placeholderText: '请输入拒绝原因',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '已拒绝',
            icon: 'success'
          })
        }
      }
    })
  },

  viewDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.showToast({
      title: '详情页开发中',
      icon: 'none'
    })
  }
})