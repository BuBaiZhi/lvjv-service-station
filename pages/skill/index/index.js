const tasksData = require("../../../data/tasks.js");
const videosData = require("../../../data/videos.js");
const themeService = require("../../../services/themeService.js");
const app = getApp();

Page({
  data: {
    theme: 'light',
    elderMode: false,
    banners: [
      {
        id: 1,
        image: "https://images.pexels.com/photos/1181672/pexels-photo-1181672.jpeg"
      },
      {
        id: 2,
        image: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg"
      }
    ],
    hotTasks: [],
    latestVideos: []
  },
  onLoad() {
    const tasks = tasksData.getTasks();
    const videos = videosData.getVideos();
    this.setData({
      hotTasks: tasks.slice(0, 3),
      latestVideos: videos.slice(0, 2)
    });
  },
  onShow() {
    // 获取全局主题设置
    this.setData({
      theme: app.globalData.theme || 'light',
      elderMode: app.globalData.elderMode || false
    });
    
    if (this.getTabBar) {
      const tb = this.getTabBar();
      if (tb && tb.setSelectedByRoute) {
        tb.setSelectedByRoute(getCurrentPages().slice(-1)[0].route);
      }
    }
    themeService.applyThemeToPage(this);
  },
  onSearchConfirm(e) {
    const value = e.detail.value || "";
    if (!value) {
      return;
    }
    wx.navigateTo({
      url: "/pages/skill/task-list/task-list?keyword=" + encodeURIComponent(value)
    });
  },
  gotoTaskList() {
    wx.navigateTo({
      url: "/pages/skill/task-list/task-list"
    });
  },
  gotoVideoList() {
    wx.navigateTo({
      url: "/pages/skill/video-list/video-list"
    });
  },
  gotoResourceList() {
    wx.navigateTo({
      url: "/pages/skill/resource-list/resource-list"
    });
  },
  gotoTaskDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/skill/task-detail/task-detail?id=" + id
    });
  },
  gotoVideoDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/skill/video-detail/video-detail?id=" + id
    });
  }
})
