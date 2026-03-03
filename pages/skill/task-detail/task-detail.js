const tasksData = require("../../../data/tasks.js");

Page({
  data: {
    id: null,
    task: null
  },
  onLoad(options) {
    if (options && options.id) {
      const task = tasksData.getTaskById(options.id);
      this.setData({
        id: options.id,
        task: task
      });
    }
  },
  gotoChat() {
    wx.navigateTo({
      url: "/pages/message/chat/chat"
    });
  }
})
