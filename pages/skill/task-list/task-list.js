const tasksData = require("../../../data/tasks.js");

Page({
  data: {
    keyword: "",
    tasks: [],
    filteredTasks: [],
    activeType: "all",
    typeTabs: [
      { key: "all", label: "全部" },
      { key: "摄影摄像", label: "摄影摄像" },
      { key: "设计文创", label: "设计文创" }
    ]
  },
  onLoad(options) {
    const list = tasksData.getTasks();
    let keyword = "";
    if (options && options.keyword) {
      keyword = decodeURIComponent(options.keyword);
    }
    this.setData({
      tasks: list,
      keyword: keyword
    });
    this.filterList(keyword, this.data.activeType);
  },
  onShow() {
    const list = tasksData.getTasks();
    this.setData({
      tasks: list
    });
    this.filterList(this.data.keyword, this.data.activeType);
  },
  onInputKeyword(e) {
    const value = e.detail.value || "";
    this.setData({
      keyword: value
    });
  },
  onSearchConfirm() {
    this.filterList(this.data.keyword, this.data.activeType);
  },
  onTypeChange(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({
      activeType: key
    });
    this.filterList(this.data.keyword, key);
  },
  filterList(rawKeyword, typeKey) {
    const keyword = (rawKeyword || "").trim().toLowerCase();
    let list = this.data.tasks;
    if (typeKey && typeKey !== "all") {
      list = list.filter(function (item) {
        return item.type === typeKey;
      });
    }
    if (keyword) {
      list = list.filter(function (item) {
        const text = (item.title + " " + item.type + " " + item.location).toLowerCase();
        return text.indexOf(keyword) !== -1;
      });
    }
    this.setData({
      filteredTasks: list
    });
  },
  gotoDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/skill/task-detail/task-detail?id=" + id
    });
  }
})
