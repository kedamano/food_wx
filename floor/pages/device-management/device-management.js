/**
 * 登录设备管理页面
 */

Page({
  data: {
    devices: [],
    loading: false,
    currentDeviceId: 'current-device-id'
  },

  onLoad: function() {
    this.loadDevices();
  },

  // 加载设备列表（从本地存储 + 系统信息）
  loadDevices: function() {
    this.setData({ loading: true });

    // 获取当前设备信息
    var systemInfo = wx.getSystemInfoSync();
    var currentDevice = {
      id: 'current-device-id',
      name: '当前设备',
      type: systemInfo.model || '未知设备',
      platform: systemInfo.platform || '未知',
      location: '',
      lastTime: new Date().toLocaleString(),
      isCurrent: true
    };

    // 从本地存储读取其他设备
    var otherDevices = wx.getStorageSync('other_devices') || [];
    var devices = [currentDevice].concat(otherDevices);
    this.setData({
      devices: devices,
      loading: false,
      currentDeviceId: 'current-device-id'
    });
  },

  // 解绑设备
  onUnbindDevice: function(e) {
    var deviceId = e.currentTarget.dataset.deviceId;
    var device = null;
    for (var i = 0; i < this.data.devices.length; i++) {
      if (this.data.devices[i].id === deviceId) {
        device = this.data.devices[i];
        break;
      }
    }
    
    if (!device) return;
    
    var self = this;
    wx.showModal({
      title: '确认解绑',
      content: '确定要解绑设备"' + device.name + '"吗？解绑后该设备需要重新登录。',
      success: function(res) {
        if (res.confirm) {
          self.unbindDevice(deviceId);
        }
      }
    });
  },

  // 解绑设备操作
  unbindDevice: function(deviceId) {
    var self = this;
    wx.showLoading({ title: '解绑中...' });

    setTimeout(function() {
      wx.hideLoading();

      // 从列表中移除并更新本地存储
      var devices = [];
      for (var i = 0; i < self.data.devices.length; i++) {
        if (self.data.devices[i].id !== deviceId) {
          devices.push(self.data.devices[i]);
        }
      }
      var otherDevices = [];
      for (var j = 0; j < devices.length; j++) {
        if (!devices[j].isCurrent) {
          otherDevices.push(devices[j]);
        }
      }
      wx.setStorageSync('other_devices', otherDevices);
      self.setData({ devices: devices });

      wx.showToast({ title: '解绑成功', icon: 'success' });
    }, 500);
  },

  // 全部解绑
  onUnbindAll: function() {
    var self = this;
    wx.showModal({
      title: '全部解绑',
      content: '确定要解绑所有设备吗？解绑后所有设备都需要重新登录。',
      success: function(res) {
        if (res.confirm) {
          self.unbindAllDevices();
        }
      }
    });
  },

  // 全部解绑操作
  unbindAllDevices: function() {
    var self = this;
    wx.showLoading({ title: '解绑中...' });

    setTimeout(function() {
      wx.hideLoading();

      // 只保留当前设备并更新本地存储
      var devices = [];
      for (var i = 0; i < self.data.devices.length; i++) {
        if (self.data.devices[i].isCurrent) {
          devices.push(self.data.devices[i]);
        }
      }
      wx.setStorageSync('other_devices', []);
      self.setData({ devices: devices });

      wx.showToast({ title: '全部解绑成功', icon: 'success' });
    }, 500);
  },

  // 返回
  onBack: function() {
    wx.navigateBack();
  }
});
