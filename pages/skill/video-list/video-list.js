const videosData = require("../../../data/videos.js");

Page({
  data: {
    videos: []
  },
  onLoad() {
    const list = videosData.getVideos();
    this.setData({
      videos: list
    });
  },
  gotoDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/skill/video-detail/video-detail?id=" + id
    });
  }
})
