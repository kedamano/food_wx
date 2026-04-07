/**
 * 隐私设置页面逻辑
 */
Page({
  data: {
    // 隐私设置
    privacySettings: {
      allowLocation: true,
      allowCamera: true,
      allowMicrophone: false,
      allowNotification: true,
      showOnlineStatus: true,
      showLastLogin: false,
      allowSearchByPhone: false,
      allowRecommendation: true
    }
  },

  onLoad() {
    this.loadPrivacySettings();
  },

  // 加载隐私设置
  loadPrivacySettings() {
    const savedSettings = wx.getStorageSync('privacySettings');
    if (savedSettings) {
      this.setData({ privacySettings: savedSettings });
    }
  },

  // 保存隐私设置到本地
  savePrivacySettings() {
    wx.setStorageSync('privacySettings', this.data.privacySettings);
  },

  // 开关变化
  onSwitchChange(e) {
    const setting = e.currentTarget.dataset.setting;
    const value = e.detail.value;

    this.setData({
      [`privacySettings.${setting}`]: value
    });

    this.savePrivacySettings();

    // 根据设置类型显示提示
    if (setting === 'allowLocation') {
      if (value) {
        this.requestLocationPermission();
      }
    } else if (setting === 'allowCamera' || setting === 'allowMicrophone') {
      if (value) {
        this.requestPermission(setting === 'allowCamera' ? 'camera' : 'record');
      }
    }
  },

  // 请求权限
  requestPermission(permission) {
    wx.showModal({
      title: '权限申请',
      content: permission === 'camera' ? '允许小程序使用您的相机权限' : '允许小程序使用您的麦克风权限',
      success: (res) => {
        if (!res.confirm) {
          // 用户拒绝，关闭开关
          const setting = permission === 'camera' ? 'allowCamera' : 'allowMicrophone';
          this.setData({
            [`privacySettings.${setting}`]: false
          });
          this.savePrivacySettings();
        }
      }
    });
  },

  // 请求位置权限
  requestLocationPermission() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log('位置获取成功', res);
      },
      fail: (err) => {
        wx.showToast({ title: '位置权限获取失败', icon: 'none' });
        this.setData({
          'privacySettings.allowLocation': false
        });
        this.savePrivacySettings();
      }
    });
  },

  // 清除位置历史
  onClearLocationHistory() {
    wx.showModal({
      title: '清除位置历史',
      content: '确定要清除所有位置历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '位置历史已清除', icon: 'success' });
        }
      }
    });
  },

  // 查看隐私政策
  onPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/privacy-policy/privacy-policy'
    });
  },

  // 查看用户协议
  onUserAgreement() {
    wx.navigateTo({
      url: '/pages/user-agreement/user-agreement'
    });
  },

  // 返回
  onBack() {
    wx.navigateBack();
  }
});
