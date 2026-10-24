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

  // 加载设备列表（后端真实数据，最近登录为当前设备）
  loadDevices: function() {
    var self = this;
    var app = getApp();
    this.setData({ loading: true });

    app.authRequest({
      url: '/user/devices',
      method: 'GET'
    }).then(function(res) {
      var devices = [];
      if (res && res.code === 200 && Array.isArray(res.data)) {
        for (var i = 0; i < res.data.length; i++) {
          var d = res.data[i];
          devices.push({
            id: d.deviceId,
            name: d.deviceName || '未知设备',
            type: d.deviceModel || d.deviceName || '',
            platform: d.platform || '',
            lastTime: (d.loginTime || '').replace('T', ' ').slice(0, 16),
            isCurrent: i === 0
          });
        }
      }
      self.setData({ devices: devices, loading: false });
    }).catch(function() {
      self.setData({ loading: false, devices: [] });
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

  // 解绑设备操作（后端删除）
  unbindDevice: function(deviceId) {
    var self = this;
    var app = getApp();
    wx.showLoading({ title: '解绑中...' });

    app.authRequest({
      url: '/user/devices/' + deviceId,
      method: 'DELETE'
    }).then(function(res) {
      wx.hideLoading();
      if (res && res.code === 200) {
        wx.showToast({ title: '解绑成功', icon: 'success' });
        self.loadDevices();
      } else {
        wx.showToast({ title: (res && res.message) || '解绑失败', icon: 'none' });
      }
    }).catch(function() {
      wx.hideLoading();
      wx.showToast({ title: '网络异常', icon: 'none' });
    });
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

  // 全部解绑操作（保留当前设备，逐个解绑其余）
  unbindAllDevices: function() {
    var self = this;
    var app = getApp();
    var targets = [];
    for (var i = 1; i < this.data.devices.length; i++) {
      targets.push(this.data.devices[i].id);
    }
    if (targets.length === 0) {
      wx.showToast({ title: '没有其他设备', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '解绑中...' });
    var pending = targets.length;
    for (var j = 0; j < targets.length; j++) {
      app.authRequest({
        url: '/user/devices/' + targets[j],
        method: 'DELETE'
      }).finally ? app.authRequest({ url: '/user/devices/' + targets[j], method: 'DELETE' }).then(function(){}, function(){}) : null;
    }
    setTimeout(function() {
      wx.hideLoading();
      self.loadDevices();
      wx.showToast({ title: '已解绑其他设备', icon: 'success' });
    }, targets.length * 200 + 400);
  },

  // 返回
  onBack: function() {
    wx.navigateBack();
  }
});
