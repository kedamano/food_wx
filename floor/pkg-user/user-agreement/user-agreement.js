/**
 * 用户协议页面
 */
Page({
  data: {
    lastUpdate: '2026年4月1日'
  },

  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '用户协议'
    });
  },

  onBack: function() {
    wx.navigateBack();
  }
});
