const videos = [
  {
    id: 1,
    title: "从零开始做乡村短视频账号",
    cover: "https://images.pexels.com/photos/6898859/pexels-photo-6898859.jpeg",
    publisher: "乡村运营课",
    duration: "18:30",
    level: "入门",
    description: "讲解如何定位乡村短视频账号，选题、脚本、拍摄到剪辑的完整流程。",
    url: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: 2,
    title: "教你用手机拍出好看的农产品照片",
    cover: "https://images.pexels.com/photos/4397910/pexels-photo-4397910.jpeg",
    publisher: "田间摄影课堂",
    duration: "12:05",
    level: "入门",
    description: "通过实例讲解光线、构图、布景的小技巧，提升农产品图片质感。",
    url: "https://www.w3schools.com/html/movie.mp4"
  }
];

function getVideos() {
  return videos;
}

function getVideoById(id) {
  const targetId = Number(id);
  return videos.find(function (item) {
    return item.id === targetId;
  }) || null;
}

module.exports = {
  getVideos: getVideos,
  getVideoById: getVideoById
};
