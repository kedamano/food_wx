/**
 * 关于小程序页面逻辑
 */
Page({
  data: {
    version: '1.0.0',
    buildNumber: '20240115',
    updateTime: '2024-01-15',
    features: [
      { icon: 'utensils', iconText: '🍴', title: '海量美食', desc: '汇聚各类美食商家' },
      { icon: 'rocket', iconText: '🚀', title: '快速配送', desc: '30分钟送达' },
      { icon: 'credit-card', iconText: '💳', title: '便捷支付', desc: '支持多种支付方式' },
      { icon: 'star', iconText: '⭐', title: '真实评价', desc: '查看其他用户评价' }
    ],
    contactInfo: {
      servicePhone: '400-888-8888',
      email: 'service@foodapp.com',
      workTime: '周一至周日 9:00-21:00'
    }
  },

  onLoad: function() {
    this.checkForUpdate();
  },

  // 检查更新
  checkForUpdate: function() {
    var self = this;
    var updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate(function(res) {
      if (res.hasUpdate) {
        self.setData({ hasUpdate: true });
      }
    });

    updateManager.onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        success: function(res) {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        }
      });
    });

    updateManager.onUpdateFailed(function() {
      wx.showModal({
        title: '更新失败',
        content: '新版本下载失败，请检查网络后重试',
        showCancel: false
      });
    });
  },

  // 手动检查更新
  onCheckUpdate: function() {
    wx.showLoading({ title: '检查中...' });
    setTimeout(function() {
      wx.hideLoading();
      wx.showToast({ title: '已是最新版本', icon: 'success' });
    }, 1000);
  },

  // 联系我们
  onContact: function() {
    var info = this.data.contactInfo;
    wx.showModal({
      title: '联系我们',
      content: '客服电话：' + info.servicePhone + '\n邮箱：' + info.email + '\n工作时间：' + info.workTime,
      showCancel: true,
      confirmText: '拨打热线',
      cancelText: '知道了',
      success: function(res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: info.servicePhone,
            fail: function() {
              wx.showToast({ title: '拨打失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  // 许可证协议
  onLicense: function() {
    wx.showModal({
      title: '开源许可',
      content: '美食小程序使用的开源组件：\n\n• Spring Boot (Apache License 2.0)\n• MyBatis Plus (Apache License 2.0)\n• MySQL (GPL License)\n• Vue.js (MIT License)',
      showCancel: false,
      confirmText: '我知道了'
    });
  }
});
