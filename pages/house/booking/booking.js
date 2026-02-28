Page({
  data: {
    house: null,
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    nights: 1,
    subtotal: 0,
    serviceFee: 0,
    total: 0,
    showPayment: false,
    showCalendar: false,
    calendarType: 'checkIn',
    years: [],
    months: [],
    days: [],
    datePickerValue: [0, 0, 0],
    currentYear: 2025,
    currentMonth: 1,
    currentDay: 1
  },

  onLoad(options) {
    const houseId = options.id
    this.loadHouse(houseId)
    this.initDatePicker()
  },

  loadHouse(id) {
    const mockHouse = {
      id: id,
      title: '三亚NCC社区·唯吾岛',
      price: 45,
      unit: '天',
      location: '海南省三亚市崖州区',
      image: 'https://picsum.photos/600/400?random=1'
    }
    this.setData({ house: mockHouse })
    this.calculateTotal()
  },

  initDatePicker() {
    const years = []
    const months = []
    const days = []
    const now = new Date()
    
    for (let i = 0; i < 5; i++) {
      years.push(now.getFullYear() + i)
    }
    for (let i = 1; i <= 12; i++) {
      months.push(i)
    }
    for (let i = 1; i <= 31; i++) {
      days.push(i)
    }
    
    this.setData({
      years,
      months,
      days,
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1,
      currentDay: now.getDate()
    })
  },

  showCalendar(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      showCalendar: true,
      calendarType: type
    })
  },

  hideCalendar() {
    this.setData({ showCalendar: false })
  },

  onDateChange(e) {
    const val = e.detail.value
    const year = this.data.years[val[0]]
    const month = this.data.months[val[1]]
    const day = this.data.days[val[2]]
    this.setData({
      currentYear: year,
      currentMonth: month,
      currentDay: day
    })
  },

  confirmDate() {
    const date = `${this.data.currentYear}-${this.data.currentMonth}-${this.data.currentDay}`
    if (this.data.calendarType === 'checkIn') {
      this.setData({ checkIn: date })
    } else {
      this.setData({ checkOut: date })
    }
    this.hideCalendar()
    this.calculateNights()
    this.calculateTotal()
  },

  calculateNights() {
    if (this.data.checkIn && this.data.checkOut) {
      this.setData({ nights: 1 })
    }
  },

  increaseAdults() {
    if (this.data.adults < 10) {
      this.setData({ adults: this.data.adults + 1 })
    }
  },

  decreaseAdults() {
    if (this.data.adults > 1) {
      this.setData({ adults: this.data.adults - 1 })
    }
  },

  increaseChildren() {
    if (this.data.children < 5) {
      this.setData({ children: this.data.children + 1 })
    }
  },

  decreaseChildren() {
    if (this.data.children > 0) {
      this.setData({ children: this.data.children - 1 })
    }
  },

  calculateTotal() {
    const price = this.data.house?.price || 0
    const nights = this.data.nights || 1
    const subtotal = price * nights
    const serviceFee = Math.round(subtotal * 0.1)
    const total = subtotal + serviceFee

    this.setData({
      subtotal,
      serviceFee,
      total
    })
  },

  onBook() {
    if (!this.data.checkIn || !this.data.checkOut) {
      wx.showToast({
        title: '请选择入住日期',
        icon: 'none'
      })
      return
    }
    this.setData({ showPayment: true })
  },

  closePayment() {
    this.setData({ showPayment: false })
  },

  onConfirmPay() {
    wx.showLoading({ title: '支付中...' })
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 1500,
        success: () => {
          this.setData({ showPayment: false })
          setTimeout(() => {
            // 跳转到我的订单页面
            wx.redirectTo({
              url: '/pages/user/orders/index'
            })
          }, 1500)
        }
      })
    }, 1000)
  }
})