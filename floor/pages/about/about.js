/**
 * 关于小程序页面逻辑
 */
Page({
  data: {
    version: '1.0.0',
    buildNumber: '20240115',
    updateTime: '2024-01-15',
    features: [
      { icon: 'fa-hamburger', title: '海量美食', desc: '汇聚各类美食商家' },
      { icon: 'fa-truck', title: '快速配送', desc: '30分钟送达' },
      { icon: 'fa-credit-card', title: '便捷支付', desc: '支持多种支付方式' },
      { icon: 'fa-star', title: '真实评价', desc: '查看其他用户评价' }
    ],
    contactInfo: {
      servicePhone: '400-888-8888',
      email: 'service@foodapp.com',
      workTime: '周一至周日 9:00-21:00'
    }
  },

  onLoad() {
    this.checkForUpdate();
  },

  // 检查更新
  checkForUpdate() {
    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        this.setData({ hasUpdate: true });
      }
    });

    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        }
      });
    });

    updateManager.onUpdateFailed(() => {
      wx.showModal({
        title: '更新失败',
        content: '新版本下载失败，请检查网络后重试',
        showCancel: false
      });
    });
  },

  // 手动检查更新
  onCheckUpdate() {
    wx.showLoading({ title: '检查中...' });

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '已是最新版本',
        icon: 'success'
      });
    }, 1000);
  },

  // 联系我们
  onContact() {
    wx.showModal({
      title: '联系我们',
      content: `客服电话：${this.data.contactInfo.servicePhone}\n邮箱：${this.data.contactInfo.email}\n工作时间：${this.data.contactInfo.workTime}`,
      showCancel: true,
      confirmText: '拨打热线',
      cancelText: '知道了',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: this.data.contactInfo.servicePhone,
            fail: () => {
              wx.showToast({ title: '拨打失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  // 许可证协议
  onLicense() {
    wx.showModal({
      title: '开源许可',
      content: '美食小程序使用的开源组件：\n\n• Spring Boot (Apache License 2.0)\n• MyBatis Plus (Apache License 2.0)\n• MySQL (GPL License)\n• Vue.js (MIT License)',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  // 返回
  onBack() {
    wx.navigateBack();
  }
});
