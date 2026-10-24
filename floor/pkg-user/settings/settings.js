/**
 * 设置页面逻辑
 */
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
    cacheSize: '计算中...',
    // 版本信息
    version: '1.0.0'
  },

  // 页面加载
  onLoad: function(options) {

    var self = this;
    // 加载设置
    self.loadSettings();
    // 计算缓存大小
    self.calculateCacheSize();
  },

  // 返回按钮点击
  onBackClick: function() {
    wx.navigateBack({
      delta: 1
    });
  },

  // 保存设置
  onSaveSettings: function() {
    this.saveSettings();
    wx.showToast({ title: '设置已保存', icon: 'success' });
    setTimeout(function() {
      wx.navigateBack();
    }, 1500);
  },

  // 账号信息
  onAccountInfo: function() {
    wx.navigateTo({
      url: '/pkg-user/account-info/account-info'
    });
  },

  // 安全设置
  onSecurity: function() {
    wx.navigateTo({
      url: '/pkg-user/security/security'
    });
  },

  // 隐私设置
  onPrivacy: function() {
    wx.navigateTo({
      url: '/pkg-user/privacy/privacy'
    });
  },

  // 开关设置变化
  onSwitchChange: function(e) {
    var setting = e.currentTarget.dataset.setting;
    var value = e.detail.value;

    // 更新设置
    var settings = this.data.settings;
    settings[setting] = value;
    this.setData({
      settings: settings
    });

    // 自动保存到本地
    this.saveSettings();

    // 特殊处理：自动定位
    if (setting === 'autoLocation' && value) {
      this.requestLocationPermission();
    }
  },

  // 请求定位权限：真实读取/申请/引导系统设置
  requestLocationPermission: function() {
    var self = this;
    wx.getSetting({
      success: function(res) {
        var granted = res.authSetting['scope.userLocation'];
        if (granted) {
          wx.showToast({ title: '定位权限已开启', icon: 'success' });
        } else if (granted === false) {
          wx.showModal({
            title: '定位权限未开启',
            content: '是否前往设置开启定位权限？',
            success: function(r) {
              if (r.confirm) {
                wx.openSetting({
                  success: function(setting) {
                    if (setting.authSetting['scope.userLocation']) {
                      wx.showToast({ title: '已开启', icon: 'success' });
                    }
                  }
                });
              } else {
                self.revertAutoLocation();
              }
            }
          });
        } else {
          wx.authorize({
            scope: 'scope.userLocation',
            success: function() {
              wx.showToast({ title: '授权成功', icon: 'success' });
            },
            fail: function() {
              self.revertAutoLocation();
            }
          });
        }
      }
    });
  },

  // 用户拒绝授权时回退开关
  revertAutoLocation: function() {
    var settings = this.data.settings;
    settings.autoLocation = false;
    this.setData({ settings: settings });
  },

  // 语言设置
  onLanguage: function() {
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
        // 自动保存
        self.saveSettings();
      }
    });
  },

  // 清除缓存
  onClearCache: function() {
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
    var self = this;

    // 清除本地存储（保留 token 和用户设置）+ 数据缓存层
    var token = wx.getStorageSync('token');
    var userSettings = wx.getStorageSync('userSettings');
    var privacySettings = wx.getStorageSync('privacySettings');
    cache.clearAll();
    wx.clearStorageSync();
    if (token) wx.setStorageSync('token', token);
    if (userSettings) wx.setStorageSync('userSettings', userSettings);
    if (privacySettings) wx.setStorageSync('privacySettings', privacySettings);

    self.setData({ cacheSize: '0KB' });
    wx.showToast({ title: '缓存已清除', icon: 'success' });
  },

  // 关于小程序
  onAbout: function() {
    wx.navigateTo({
      url: '/pkg-user/about/about'
    });
  },

  // 帮助中心
  onHelp: function() {
    wx.navigateTo({
      url: '/pkg-user/help/help'
    });
  },

  // 意见反馈
  onFeedback: function() {
    wx.navigateTo({
      url: '/pkg-user/feedback/feedback'
    });
  },

  // 检查更新：wx.getUpdateManager 真实现
  onVersion: function() {
    var self = this;
    var updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate(function(res) {
      if (!res.hasUpdate) {
        wx.showModal({
          title: '检查更新',
          content: '当前版本：' + self.data.version + '\n已是最新版本',
          showCancel: false,
          confirmText: '知道了'
        });
      }
    });

    updateManager.onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function(res) {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        }
      });
    });

    updateManager.onUpdateFailed(function() {
      wx.showToast({ title: '新版本下载失败', icon: 'none' });
    });
  },

  // 退出登录
  onLogout: function() {
    var self = this;
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: function(res) {
        if (res.confirm) {
          // 清除登录状态
          var app = getApp();
var cache = require('../../utils/cache');
          app.globalData.userInfo = null;
          app.globalData.userId = null;
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');

          wx.showToast({ title: '已退出登录', icon: 'success' });

          // 返回首页
          setTimeout(function() {
            wx.switchTab({
              url: '/pages/index/index',
            });
          }, 1500);
        }
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
    
    this.loadSettings();
    this.calculateCacheSize();

    setTimeout(function() {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});
