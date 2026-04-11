// logs.js
var util = require('../../utils/util.js');

Page({
  data: {
    logs: []
  },
  onLoad: function() {
    var self = this;
    var logsData = wx.getStorageSync('logs') || [];
    var formattedLogs = [];
    for (var i = 0; i < logsData.length; i++) {
      formattedLogs.push({
        date: util.formatTime(new Date(logsData[i])),
        timeStamp: logsData[i]
      });
    }
    this.setData({
      logs: formattedLogs
    });
  }
});
