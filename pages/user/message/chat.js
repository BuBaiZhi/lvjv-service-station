Page({
  data: {
    userId: '',
    userName: '',
    messages: [],
    inputValue: '',
    scrollTop: 99999
  },

  onLoad(options) {
    this.setData({
      userId: options.userId,
      userName: options.name || '房东'
    })
    this.loadMessages()
  },

  loadMessages() {
    const mockMessages = [
      {
        id: 1,
        isSelf: false,
        avatar: 'https://picsum.photos/100/100?random=1',
        content: '你好，这个房源还有吗？',
        time: '14:30'
      },
      {
        id: 2,
        isSelf: true,
        avatar: 'https://picsum.photos/100/100?random=2',
        content: '有的，请问你想预订几天？',
        time: '14:32'
      }
    ]
    this.setData({ messages: mockMessages })
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value })
  },

  onSend() {
    if (!this.data.inputValue.trim()) return
    
    const newMsg = {
      id: Date.now(),
      isSelf: true,
      avatar: 'https://picsum.photos/100/100?random=2',
      content: this.data.inputValue,
      time: new Date().toLocaleTimeString().slice(0,5)
    }
    
    this.setData({
      messages: [...this.data.messages, newMsg],
      inputValue: '',
      scrollTop: 99999
    })
  },

  onBack() {
    wx.navigateBack()
  }
})