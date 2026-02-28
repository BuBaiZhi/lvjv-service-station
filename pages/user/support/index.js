// 服务与支持页面
const app = getApp()
const api = require('../../../services/apiProxy.js')

Page({
  data: {
    theme: 'light',
    appVersion: 'standard',
    faqList: [
      {
        id: 1,
        question: '如何发布房源信息？',
        answer: '点击首页的"发布"按钮，选择"民宿"类型，填写房源详细信息、上传图片，提交审核后即可发布。',
        expanded: false
      },
      {
        id: 2,
        question: '如何联系房东或发布者？',
        answer: '在详情页点击"联系TA"按钮，可以通过站内消息与对方沟通。',
        expanded: false
      },
      {
        id: 3,
        question: '订单取消后如何退款？',
        answer: '订单取消后，系统会在3-5个工作日内将款项原路退回到您的支付账户。',
        expanded: false
      },
      {
        id: 4,
        question: '如何切换深色模式？',
        answer: '进入"设置"页面，在"主题设置"中可以选择浅色或深色模式。',
        expanded: false
      },
      {
        id: 5,
        question: '老人版如何使用？',
        answer: '进入"设置"页面，在"应用版本"中选择"老人友好版"，界面会自动放大字体和按钮。',
        expanded: false
      }
    ],
    contactMethods: [
      {
        id: 1,
        icon: '📞',
        title: '客服电话',
        content: '400-123-4567',
        desc: '工作日 9:00-18:00'
      },
      {
        id: 2,
        icon: '✉️',
        title: '客服邮箱',
        content: 'support@lvju.com',
        desc: '24小时内回复'
      },
      {
        id: 3,
        icon: '💬',
        title: '在线客服',
        content: '点击咨询',
        desc: '工作日 9:00-22:00'
      }
    ]
  },

  async onLoad() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
    
    // 加载FAQ和联系信息
    await this.loadSupportData()
  },

  onShow() {
    this.setData({
      theme: app.globalData.theme,
      appVersion: app.globalData.appVersion
    })
  },

  // 加载支持数据
  async loadSupportData() {
    try {
      // 从服务代理层获取支持数据
      const supportData = await api.getSupportData()
      
      // 如果获取成功，更新FAQ列表
      if (supportData && supportData.faqList) {
        this.setData({
          faqList: supportData.faqList
        })
      }
    } catch (error) {
      console.error('Failed to load support data:', error)
      // 如果加载失败，保持默认数据
    }
  },

  // 展开/收起FAQ
  toggleFaq(e) {
    const id = e.currentTarget.dataset.id
    const faqList = this.data.faqList.map(item => {
      if (item.id === id) {
        item.expanded = !item.expanded
      }
      return item
    })
    this.setData({ faqList })
  },

  // 联系客服
  contactService(e) {
    const method = e.currentTarget.dataset.method
    
    switch(method) {
      case 'phone':
        wx.makePhoneCall({
          phoneNumber: '4001234567'
        })
        break
      case 'email':
        wx.setClipboardData({
          data: 'support@lvju.com',
          success: () => {
            wx.showToast({
              title: '邮箱已复制',
              icon: 'success'
            })
          }
        })
        break
      case 'chat':
        wx.showToast({
          title: '在线客服功能开发中',
          icon: 'none'
        })
        break
    }
  },

  // 意见反馈
  submitFeedback() {
    wx.showToast({
      title: '反馈功能开发中',
      icon: 'none'
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})