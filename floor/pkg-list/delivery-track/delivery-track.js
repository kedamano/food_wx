// 配送跟踪页面逻辑
// 数据由 order-detail 页通过 trackingData 参数传入（JSON）
Page({
  data: {
    orderId: '',
    status: '配送中',
    progress: 0,
    rider: null,
    estimatedTime: '',
    steps: []
  },

  onLoad: function(options) {
    var data = null;
    if (options.trackingData) {
      try {
        data = JSON.parse(decodeURIComponent(options.trackingData));
      } catch (e) {
        console.error('解析配送数据失败', e);
      }
    }

    if (!data) {
      wx.showModal({
        title: '提示',
        content: '配送信息加载失败',
        showCancel: false,
        success: function() { wx.navigateBack(); }
      });
      return;
    }

    this.setData({
      orderId: data.orderId || '',
      status: data.status || '配送中',
      progress: data.progress || 0,
      rider: data.rider || null,
      estimatedTime: data.estimatedTime || '',
      steps: data.steps || []
    });
  },

  // 拨打骑手电话
  onCallRider: function() {
    var rider = this.data.rider;
    if (rider && rider.phone) {
      wx.makePhoneCall({ phoneNumber: rider.phone });
    } else {
      wx.showToast({ title: '暂无骑手电话', icon: 'none' });
    }
  }
});
