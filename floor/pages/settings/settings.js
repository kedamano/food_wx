/**
 * 设置页面逻辑
 */
const { showLoading, hideLoading, showError, showSuccess } = require('../../api/request');

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
  async onLoad(options) {
    console.log('设置页面加载');

    try {
      // 加载设置
      await this.loadSettings();
      // 计算缓存大小
      await this.calculateCacheSize();
    } catch (error) {
      console.error('加载设置失败:', error);
      showError('加载设置失败');
    }
  },

  // 返回按钮点击
  onBackClick() {
    console.log('返回按钮点击');
    wx.navigateBack({
      delta: 1
    });
  },

  // 保存设置
  async onSaveSettings() {
    console.log('保存设置');
    
    try {
      showLoading('保存中...');
      
      // 保存设置到本地存储
      await this.saveSettings();
      
      hideLoading();
      showSuccess('设置已保存');

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('保存设置失败:', error);
      hideLoading();
      showError('保存失败');
    }
  },

  // 账号信息
  onAccountInfo() {
    console.log('账号信息');
    wx.navigateTo({
      url: '/pages/account-info/account-info'
    });
  },

  // 安全设置
  onSecurity() {
    console.log('安全设置');
    wx.navigateTo({
      url: '/pages/security/security'
    });
  },

  // 隐私设置
  onPrivacy() {
    console.log('隐私设置');
    wx.navigateTo({
      url: '/pages/privacy/privacy'
    });
  },

  // 开关设置变化
  onSwitchChange(e) {
    const setting = e.currentTarget.dataset.setting;
    const value = e.detail.value;
    console.log('开关变化：', setting, value);

    // 更新设置
    this.setData({
      [`settings.${setting}`]: value
    });

    // 特殊处理：自动定位
    if (setting === 'autoLocation' && value) {
      this.requestLocationPermission();
    }
  },

  // 请求定位权限
  requestLocationPermission() {
    console.log('请求定位权限');
    
    // 模拟请求定位权限
    wx.showModal({
      title: '位置权限',
      content: '允许小程序使用您的位置信息，以便为您提供更精准的商家推荐和配送服务',
      success: (res) => {
        if (!res.confirm) {
          // 用户拒绝，恢复开关状态
          this.setData({
            'settings.autoLocation': false
          });
        }
      }
    });
  },

  // 语言设置
  onLanguage() {
    console.log('语言设置');
    wx.showActionSheet({
      itemList: ['中文', 'English'],
      success: (res) => {
        const language = res.tapIndex === 0 ? '中文' : 'English';
        this.setData({
          'settings.language': language
        });
      }
    });
  },

  // 清除缓存
  onClearCache() {
    console.log('清除缓存');
    
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？这将删除历史记录、图片缓存等临时文件。',
      success: (res) => {
        if (res.confirm) {
          this.clearCache();
        }
      }
    });
  },

  // 清除缓存操作
  async clearCache() {
    console.log('执行清除缓存');
    
    try {
      showLoading('清除中...');

      // 清除本地存储
      wx.clearStorageSync();

      // 模拟清除缓存
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.setData({
        cacheSize: '0MB'
      });
      showSuccess('缓存已清除');
    } catch (error) {
      console.error('清除缓存失败:', error);
      showError('清除缓存失败');
    } finally {
      hideLoading();
    }
  },

  // 关于小程序
  onAbout() {
    console.log('关于小程序');
    wx.navigateTo({
      url: '/pages/about/about'
    });
  },

  // 帮助中心
  onHelp() {
    console.log('帮助中心');
    wx.navigateTo({
      url: '/pages/help/help'
    });
  },

  // 意见反馈
  onFeedback() {
    console.log('意见反馈');
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
  },

  // 检查更新
  onVersion() {
    console.log('检查更新');
    
    wx.showLoading({
      title: '检查更新...'
    });

    // 模拟检查更新
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: '检查更新',
        content: `当前版本：${this.data.version}\n已是最新版本`,
        showCancel: false,
        confirmText: '知道了'
      });
    }, 1000);
  },

  // 退出登录
  async onLogout() {
    try {
      const confirm = await new Promise((resolve) => {
        wx.showModal({
          title: '退出登录',
          content: '确定要退出登录吗？',
          success: (res) => {
            resolve(res.confirm);
          },
        });
      });

      if (!confirm) return;

      showLoading('退出中...');

      // 调用退出登录API（如果存在）
      // await userApi.logout();

      // 清除登录状态
      const app = getApp();
      app.globalData.userInfo = null;

      showSuccess('已退出登录');

      // 返回首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index',
        });
      }, 1500);
    } catch (error) {
      console.error('退出登录失败:', error);
      showError('退出失败');
    } finally {
      hideLoading();
    }
  },

  // 加载设置
  loadSettings() {
    // 从本地存储加载设置
    const savedSettings = wx.getStorageSync('userSettings');
    
    if (savedSettings) {
      this.setData({
        settings: savedSettings
      });
    }
  },

  // 保存设置到本地
  saveSettings() {
    const settings = this.data.settings;
    wx.setStorageSync('userSettings', settings);
  },

  // 计算缓存大小
  calculateCacheSize() {
    // 模拟计算缓存大小
    const fileSystemManager = wx.getFileSystemManager();
    const cacheSize = '12.5MB'; // 模拟值
    
    this.setData({
      cacheSize: cacheSize
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    
    this.loadSettings();
    this.calculateCacheSize();

    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});