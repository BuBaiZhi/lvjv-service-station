const tasks = [
  {
    id: 1,
    title: "帮拍短视频并剪辑成宣传片",
    type: "摄影摄像",
    reward: 300,
    publisher: "合作社小李",
    location: "稻花村",
    mode: "线下",
    tags: ["短视频", "剪辑"],
    description: "为乡村合作社拍摄一条 1 分钟左右的宣传短视频，需要简单剪辑和配乐，时间安排在本周末。",
    requirement: "会用手机或相机拍摄，懂基础剪辑软件，如剪映等。",
    contact: "微信：xc-video-01"
  },
  {
    id: 2,
    title: "农产品电商详情页设计",
    type: "设计文创",
    reward: 500,
    publisher: "农场阿强",
    location: "线上远程",
    mode: "远程",
    tags: ["电商设计", "图片排版"],
    description: "为农场新上线的农产品设计 3 款详情页模板，需要有电商设计经验，交付 PSD 或可编辑源文件。",
    requirement: "熟练使用 PS 或类似工具，有电商详情页案例优先。",
    contact: "电话：13800000000"
  }
];

function getTasks() {
  return tasks;
}

function getTaskById(id) {
  const targetId = Number(id);
  return tasks.find(function (item) {
    return item.id === targetId;
  }) || null;
}

function addTask(payload) {
  const nextId = tasks.length ? tasks[tasks.length - 1].id + 1 : 1;
  const task = {
    id: nextId,
    title: payload.title,
    type: payload.type,
    reward: payload.reward,
    publisher: payload.publisher || "乡亲",
    location: payload.location || "",
    mode: payload.mode || "远程",
    tags: payload.tags || [],
    description: payload.description || "",
    requirement: payload.requirement || "",
    contact: payload.contact || ""
  };
  tasks.unshift(task);
  return task;
}

module.exports = {
  getTasks: getTasks,
  getTaskById: getTaskById,
  addTask: addTask
};
