const videosData = require("../../../data/videos.js");

Page({
  data: {
    id: null,
    video: null
  },
  onLoad(options) {
    if (options && options.id) {
      const video = videosData.getVideoById(options.id);
      this.setData({
        id: options.id,
        video: video
      });
    }
  }
})
