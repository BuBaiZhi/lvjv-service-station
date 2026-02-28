const themeService = require("../../../services/themeService.js");
const app = getApp();

Page({
  data: {
    theme: 'light',
    elderMode: false,
    sessionList: [
      {
        id: 1,
        nickname: "稻田边木屋房东",
        avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
        lastMessage: "好的，欢迎来玩。",
        time: "昨天",
        unread: 0
      },
      {
        id: 2,
        nickname: "合作社小李",
        avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
        lastMessage: "任务详情我发你啦。",
        time: "2分钟前",
        unread: 2
      }
    ]
  },
  gotoChat(e) {
    const id = e.currentTarget.dataset.id;
    const idx = this.data.sessionList.findIndex(function (s) { return s.id === id; });
    if (idx >= 0) {
      const list = this.data.sessionList.slice();
      list[idx].unread = 0;
      this.setData({ sessionList: list });
      wx.setStorageSync("session:list", list);
      this.syncUnreadStat();
    }
    wx.navigateTo({
      url: "/pages/message/chat/chat?id=" + id
    });
  },
  onShow() {
    // 获取全局主题设置
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false
    });
    
    const saved = wx.getStorageSync("session:list");
    if (saved && saved.length) {
      this.setData({ sessionList: saved });
      this.syncUnreadStat();
    } else {
      wx.setStorageSync("session:list", this.data.sessionList);
      this.syncUnreadStat();
    }
    if (this.getTabBar) {
      const tb = this.getTabBar();
      if (tb && tb.setSelectedByRoute) {
        tb.setSelectedByRoute(getCurrentPages().slice(-1)[0].route);
      }
    }
    themeService.applyThemeToPage(this);
  },
  syncUnreadStat() {
    const sum = this.data.sessionList.reduce(function (acc, cur) {
      return acc + (cur.unread || 0);
    }, 0);
    wx.setStorageSync("stat:unread", sum);
  }
})
