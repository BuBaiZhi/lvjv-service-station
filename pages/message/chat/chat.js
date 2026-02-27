Page({
  data: {
    inputText: "",
    messages: [],
    scrollTo: ""
  },
  onLoad(options) {
    this.sessionId = Number(options && options.id || 0);
    const now = this.formatTime(new Date());
    const preset = [
      { id: 1, from: "peer", text: "你好，欢迎来稻花村！", time: now },
      { id: 2, from: "mine", text: "你好，想咨询下周末的活动。", time: now }
    ];
    this.setData({
      messages: preset,
      scrollTo: "msg-" + preset[preset.length - 1].id
    });
  },
  onInput(e) {
    const value = e.detail.value || "";
    this.setData({
      inputText: value
    });
  },
  onSend() {
    const text = (this.data.inputText || "").trim();
    if (!text) {
      return;
    }
    const now = this.formatTime(new Date());
    const nextId = this.data.messages.length ? this.data.messages[this.data.messages.length - 1].id + 1 : 1;
    const list = this.data.messages.concat([{ id: nextId, from: "mine", text: text, time: now }]);
    this.setData({
      messages: list,
      inputText: "",
      scrollTo: "msg-" + nextId
    });
    setTimeout(() => {
      const replyId = nextId + 1;
      const reply = { id: replyId, from: "peer", text: "收到，我们这边帮你安排。", time: this.formatTime(new Date()) };
      this.setData({
        messages: this.data.messages.concat([reply]),
        scrollTo: "msg-" + replyId
      });
      if (this.sessionId) {
        const list = wx.getStorageSync("session:list") || [];
        const idx = list.findIndex(function (s) { return s.id === this.sessionId; }.bind(this));
        if (idx >= 0) {
          list[idx].unread = (list[idx].unread || 0) + 1;
          list[idx].lastMessage = reply.text;
          list[idx].time = "刚刚";
          wx.setStorageSync("session:list", list);
          const sum = list.reduce(function (acc, cur) { return acc + (cur.unread || 0); }, 0);
          wx.setStorageSync("stat:unread", sum);
        }
      }
    }, 600);
  },
  formatTime(date) {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return h + ":" + m;
  }
})
