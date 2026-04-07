/**
 * 登录设备管理页面
 */
const app = getApp();

Page({
  data: {
    devices: [],
    loading: false,
    currentDeviceId: 'current-device-id'
  },

  onLoad() {
    this.loadDevices();
  },

  // 加载设备列表
  loadDevices() {
    this.setData({ loading: true });
    
    // 模拟设备数据
    const devices = [
      {
        id: 'current-device-id',
        name: '当前设备',
        type: 'iPhone 14 Pro',
        platform: 'iOS',
        location: '北京市朝阳区',
        lastTime: new Date().toLocaleString(),
        isCurrent: true
      },
      {
        id: 'device-2',
        name: 'Windows 电脑',
        type: 'Chrome 浏览器',
        platform: 'Windows',
        location: '北京市海淀区',
        lastTime: '2026-04-05 14:30:00',
        isCurrent: false
      },
      {
        id: 'device-3',
        name: 'iPad Pro',
        type: 'iPad Pro 12.9',
        platform: 'iPadOS',
        location: '北京市东城区',
        lastTime: '2026-04-03 09:15:00',
        isCurrent: false
      }
    ];

    this.setData({
      devices: devices,
      loading: false
    });
  },

  // 解绑设备
  onUnbindDevice(e) {
    const deviceId = e.currentTarget.dataset.deviceId;
    const device = this.data.devices.find(d => d.id === deviceId);
    
    if (!device) return;
    
    wx.showModal({
      title: '确认解绑',
      content: `确定要解绑设备"${device.name}"吗？解绑后该设备需要重新登录。`,
      success: (res) => {
        if (res.confirm) {
          this.unbindDevice(deviceId);
        }
      }
    });
  },

  // 解绑设备操作
  unbindDevice(deviceId) {
    wx.showLoading({ title: '解绑中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 从列表中移除
      const devices = this.data.devices.filter(d => d.id !== deviceId);
      this.setData({ devices: devices });
      
      wx.showToast({
        title: '解绑成功',
        icon: 'success'
      });
    }, 500);
  },

  // 全部解绑
  onUnbindAll() {
    wx.showModal({
      title: '全部解绑',
      content: '确定要解绑所有设备吗？解绑后所有设备都需要重新登录。',
      success: (res) => {
        if (res.confirm) {
          this.unbindAllDevices();
        }
      }
    });
  },

  // 全部解绑操作
  unbindAllDevices() {
    wx.showLoading({ title: '解绑中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 只保留当前设备
      const devices = this.data.devices.filter(d => d.isCurrent);
      this.setData({ devices: devices });
      
      wx.showToast({
        title: '全部解绑成功',
        icon: 'success'
      });
    }, 500);
  },

  // 返回
  onBack() {
    wx.navigateBack();
  }
});
