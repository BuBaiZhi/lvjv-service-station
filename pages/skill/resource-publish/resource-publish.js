const resourcesData = require("../../../data/resources.js");

Page({
  data: {
    type: "发需求",
    title: "",
    contact: "",
    location: "",
    tagsText: "",
    desc: ""
  },
  onTypeChange(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ type: key });
  },
  onInputTitle(e) {
    this.setData({ title: e.detail.value || "" });
  },
  onInputContact(e) {
    this.setData({ contact: e.detail.value || "" });
  },
  onInputLocation(e) {
    this.setData({ location: e.detail.value || "" });
  },
  onInputTags(e) {
    this.setData({ tagsText: e.detail.value || "" });
  },
  onInputDesc(e) {
    this.setData({ desc: e.detail.value || "" });
  },
  onSubmit() {
    const payload = {
      type: this.data.type,
      title: (this.data.title || "").trim(),
      contact: (this.data.contact || "").trim(),
      location: (this.data.location || "").trim(),
      desc: (this.data.desc || "").trim(),
      tags: (this.data.tagsText || "").split(/[,\s]+/).filter(Boolean)
    };
    if (!payload.title) {
      wx.showToast({ title: "请输入标题", icon: "none" });
      return;
    }
    resourcesData.addResource(payload);
    wx.showToast({ title: "已发布", icon: "success" });
    setTimeout(function () {
      wx.navigateBack();
    }, 400);
  }
});
