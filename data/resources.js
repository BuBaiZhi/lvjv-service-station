let resources = [
  {
    id: 1,
    title: "帮忙找短视频剪辑老师来村里上课",
    type: "找资源",
    contact: "乡村服务站小王",
    location: "稻花村",
    desc: "计划每周一次线下课，面向村里年轻人和返乡大学生，内容包括短视频拍摄和剪辑。",
    tags: ["培训", "短视频"]
  },
  {
    id: 2,
    title: "有一批土鸡蛋寻求城市渠道合作",
    type: "发需求",
    contact: "合作社小李",
    location: "本地合作社",
    desc: "每月稳定供应 5000 枚散养土鸡蛋，希望对接城市社区团购或小型商超。",
    tags: ["农产品", "渠道对接"]
  }
];

function getResources() {
  const saved = wx.getStorageSync("resources:list");
  if (saved && saved.length) {
    resources = saved;
  }
  return resources;
}

function addResource(payload) {
  const list = getResources();
  const nextId = list.length ? list[0].id + 1 : 1;
  const item = {
    id: nextId,
    title: payload.title,
    type: payload.type || "发需求",
    contact: payload.contact || "",
    location: payload.location || "",
    desc: payload.desc || "",
    tags: payload.tags || []
  };
  list.unshift(item);
  wx.setStorageSync("resources:list", list);
  return item;
}

module.exports = {
  getResources: getResources,
  addResource: addResource
};
