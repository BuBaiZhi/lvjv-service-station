// 在云开发控制台运行此脚本，导入初始数据
const db = wx.cloud.database()

// 导入房源数据
const houses = [
  // 把 config/houses.js 里的数据复制到这里
]

houses.forEach(house => {
  db.collection('houses').add({
    data: {
      ...house,
      createTime: db.serverDate()
    }
  })
})

// 导入帖子数据
const posts = [
  // 把 config/posts.js 里的数据复制到这里
]

posts.forEach(post => {
  db.collection('posts').add({
    data: {
      ...post,
      createTime: db.serverDate()
    }
  })
})