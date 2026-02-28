const resourcesData = require("../../../data/resources.js");
const themeService = require("../../../services/themeService.js");
const app = getApp();

Page({
  data: {
    theme: 'light',
    elderMode: false,
    keyword: "",
    activeType: "找资源",
    list: [],
    filteredList: []
  },
  onShow() {
    // 获取全局主题设置
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false
    });
    
    const list = resourcesData.getResources();
    this.setData({
      list: list
    });
    this.filter();
    themeService.applyThemeToPage(this);
  },
  onInputKeyword(e) {
    this.setData({
      keyword: e.detail.value || ""
    });
  },
  onSearchConfirm() {
    this.filter();
  },
  onTypeChange(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({
      activeType: key
    });
    this.filter();
  },
  filter() {
    const type = this.data.activeType;
    const keyword = (this.data.keyword || "").trim().toLowerCase();
    let list = this.data.list;
    if (type) {
      list = list.filter(function (item) {
        return item.type === type;
      });
    }
    if (keyword) {
      list = list.filter(function (item) {
        const text = (item.title + " " + item.location + " " + item.desc + " " + (item.tags || []).join(" ")).toLowerCase();
        return text.indexOf(keyword) !== -1;
      });
    }
    this.setData({
      filteredList: list
    });
  },
  gotoPublish() {
    wx.navigateTo({
      url: "/pages/skill/resource-publish/resource-publish"
    });
  },
  contact(e) {
    const contact = e.currentTarget.dataset.contact || "";
    const title = e.currentTarget.dataset.title || "";
    let list = wx.getStorageSync("session:list") || [];
    let target = list.find(function (s) { return s.nickname === contact; });
    if (!target) {
      const nextId = list.length ? Math.max.apply(null, list.map(function (s) { return s.id; })) + 1 : 1;
      target = {
        id: nextId,
        nickname: contact || "对接联系人",
        avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
        lastMessage: "关于资源对接：" + title,
        time: "刚刚",
        unread: 0
      };
      list.unshift(target);
      wx.setStorageSync("session:list", list);
    }
    wx.navigateTo({
      url: "/pages/message/chat/chat?id=" + target.id
    });
  }
});
