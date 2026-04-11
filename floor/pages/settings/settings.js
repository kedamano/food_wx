/**
 * 设置页面逻辑
 */
var requestUtils = require('../../api/request');
var showLoading = requestUtils.showLoading;
var hideLoading = requestUtils.hideLoading;
var showError = requestUtils.showError;
var showSuccess = requestUtils.showSuccess;

Page({
  data: {
    // 设置选项
    settings: {
      orderNotifications: true,
      promoNotifications: false,
      customerServiceNotifications: true,
      autoLocation: true,
      autoUpdate: true,
      language: '中文'
    },
    // 缓存大小
    cacheSize: '12.5MB',
    // 版本信息
    version: '1.0.0'
  },

  // 页面加载
  onLoad: function(options) {
    console.log('设置页面加载');

    var self = this;
    // 加载设置
    self.loadSettings();
    // 计算缓存大小
    self.calculateCacheSize();
  },

  // 返回按钮点击
  onBackClick: function() {
    console.log('返回按钮点击');
    wx.navigateBack({
      delta: 1
    });
  },

  // 保存设置
  onSaveSettings: function() {
    console.log('保存设置');
    var self = this;
    
    showLoading('保存中...');
    
    // 保存设置到本地存储
    self.saveSettings();
    
    hideLoading();
    showSuccess('设置已保存');

    // 返回上一页
    setTimeout(function() {
      wx.navigateBack();
    }, 1500);
  },

  // 账号信息
  onAccountInfo: function() {
    console.log('账号信息');
    wx.navigateTo({
      url: '/pages/account-info/account-info'
    });
  },

  // 安全设置
  onSecurity: function() {
    console.log('安全设置');
    wx.navigateTo({
      url: '/pages/security/security'
    });
  },

  // 隐私设置
  onPrivacy: function() {
    console.log('隐私设置');
    wx.navigateTo({
      url: '/pages/privacy/privacy'
    });
  },

  // 开关设置变化
  onSwitchChange: function(e) {
    var setting = e.currentTarget.dataset.setting;
    var value = e.detail.value;
    console.log('开关变化：', setting, value);

    // 更新设置
    var settings = this.data.settings;
    settings[setting] = value;
    this.setData({
      settings: settings
    });

    // 特殊处理：自动定位
    if (setting === 'autoLocation' && value) {
      this.requestLocationPermission();
    }
  },

  // 请求定位权限
  requestLocationPermission: function() {
    console.log('请求定位权限');
    var self = this;
    
    // 模拟请求定位权限
    wx.showModal({
      title: '位置权限',
      content: '允许小程序使用您的位置信息，以便为您提供更精准的商家推荐和配送服务',
      success: function(res) {
        if (!res.confirm) {
          // 用户拒绝，恢复开关状态
          var settings = self.data.settings;
          settings.autoLocation = false;
          self.setData({
            settings: settings
          });
        }
      }
    });
  },

  // 语言设置
  onLanguage: function() {
    console.log('语言设置');
    var self = this;
    wx.showActionSheet({
      itemList: ['中文', 'English'],
      success: function(res) {
        var language = res.tapIndex === 0 ? '中文' : 'English';
        var settings = self.data.settings;
        settings.language = language;
        self.setData({
          settings: settings
        });
      }
    });
  },

  // 清除缓存
  onClearCache: function() {
    console.log('清除缓存');
    var self = this;
    
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？这将删除历史记录、图片缓存等临时文件。',
      success: function(res) {
        if (res.confirm) {
          self.clearCache();
        }
      }
    });
  },

  // 清除缓存操作
  clearCache: function() {
    console.log('执行清除缓存');
    var self = this;
    
    showLoading('清除中...');

    // 清除本地存储
    wx.clearStorageSync();

    // 模拟清除缓存
    setTimeout(function() {
      self.setData({
        cacheSize: '0MB'
      });
      showSuccess('缓存已清除');
      hideLoading();
    }, 1000);
  },

  // 关于小程序
  onAbout: function() {
    console.log('关于小程序');
    wx.navigateTo({
      url: '/pages/about/about'
    });
  },

  // 帮助中心
  onHelp: function() {
    console.log('帮助中心');
    wx.navigateTo({
      url: '/pages/help/help'
    });
  },

  // 意见反馈
  onFeedback: function() {
    console.log('意见反馈');
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
  },

  // 检查更新
  onVersion: function() {
    console.log('检查更新');
    var self = this;
    
    wx.showLoading({
      title: '检查更新...'
    });

    // 模拟检查更新
    setTimeout(function() {
      wx.hideLoading();
      wx.showModal({
        title: '检查更新',
        content: '当前版本：' + self.data.version + '\n已是最新版本',
        showCancel: false,
        confirmText: '知道了'
      });
    }, 1000);
  },

  // 退出登录
  onLogout: function() {
    var self = this;
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: function(res) {
        if (res.confirm) {
          showLoading('退出中...');

          // 清除登录状态
          var app = getApp();
          app.globalData.userInfo = null;

          showSuccess('已退出登录');

          // 返回首页
          setTimeout(function() {
            wx.switchTab({
              url: '/pages/index/index',
            });
          }, 1500);
        }
      },
      fail: function() {
        hideLoading();
      }
    });
  },

  // 加载设置
  loadSettings: function() {
    // 从本地存储加载设置
    var savedSettings = wx.getStorageSync('userSettings');
    
    if (savedSettings) {
      this.setData({
        settings: savedSettings
      });
    }
  },

  // 保存设置到本地
  saveSettings: function() {
    var settings = this.data.settings;
    wx.setStorageSync('userSettings', settings);
  },

  // 计算缓存大小
  calculateCacheSize: function() {
    try {
      var info = wx.getStorageInfoSync();
      var sizeKB = info.currentSize || 0;
      var cacheSize = sizeKB < 1024 ? sizeKB + 'KB' : (sizeKB / 1024).toFixed(1) + 'MB';
      this.setData({ cacheSize: cacheSize });
    } catch (e) {
      console.error('获取缓存大小失败', e);
      this.setData({ cacheSize: '0KB' });
    }
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    console.log('下拉刷新');
    
    this.loadSettings();
    this.calculateCacheSize();

    setTimeout(function() {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});
