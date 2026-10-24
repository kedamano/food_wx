/**
 * 隐私政策页面
 */
Page({
  data: {
    lastUpdate: '2026年4月1日'
  },

  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '隐私政策'
    });
  },

  onBack: function() {
    wx.navigateBack();
  }
});
