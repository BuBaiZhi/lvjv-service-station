const { db, _, getOpenid } = require('../utils/cloud.js')

// 创建订单
function createBooking(bookingData) {
  const openid = getOpenid()
  const data = {
    ...bookingData,
    _openid: openid,
    status: 'pending',
    createTime: db.serverDate()
  }
  return db.collection('bookings').add({ data }).then(res => res._id)
}

// 获取用户订单
function getUserBookings() {
  const openid = getOpenid()
  return db.collection('bookings')
    .where({ _openid: openid })
    .orderBy('createTime', 'desc')
    .get()
    .then(res => res.data)
}

// 支付订单
function payBooking(bookingId) {
  return db.collection('bookings').doc(bookingId).update({
    data: {
      status: 'paid',
      payTime: db.serverDate()
    }
  })
}

module.exports = {
  createBooking,
  getUserBookings,
  payBooking
}