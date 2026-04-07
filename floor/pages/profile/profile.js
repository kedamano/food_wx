/**
 * 个人中心页面逻辑
 */
const userApi = require('../../api/user');
const orderApi = require('../../api/order');
const { showError, showSuccess, showLoading, hideLoading } = require('../../api/request');

Page({
  data: {
    // 底部导航栏
    activeTab: 3,
    cartCount: 0,

    // 用户信息
    userInfo: {
      isLoggedIn: false,
      name: '张三',
      level: '普通会员',
      points: 0,
      avatar: ''
    },

    // 订单统计
    orderStats: {
      pending: 0,      // 待付款
      preparing: 0,    // 制作中
      delivering: 0,   // 配送中
      completed: 0     // 已完成
    },

    // 用户统计数据
    userStats: {
      totalOrders: 0,
      favoriteStores: 0,
      totalSpending: 0,
      couponCount: 0
    },

    // 页面加载状态
    loading: false,
    // 缓存大小
    cacheSize: '0KB',
  },

  // 页面加载
  async onLoad() {
    console.log('个人中心页面加载');
    await this.initPageData();
  },

  /**
   * 初始化页面数据
   */
  async initPageData() {
    try {
      // 检查登录状态
      await this.checkLoginStatus();
      
      // 获取页面数据
      await this.fetchPageData();
      
      // 计算缓存大小
      this.calculateCacheSize();
    } catch (error) {
      console.error('初始化页面数据失败:', error);
      showError('加载数据失败');
    }
  },

  /**
   * 检查登录状态
   */
  async checkLoginStatus() {
    const isLoggedIn = userApi.checkLoginStatus();
    this.setData({
      'userInfo.isLoggedIn': isLoggedIn,
    });

    if (isLoggedIn) {
      try {
        // 获取用户信息
        const userInfo = await userApi.getUserInfo();
        this.setData({
          userInfo: {
            ...this.data.userInfo,
            ...userInfo,
            isLoggedIn: true,
          },
        });
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 如果获取失败，清除登录状态
        userApi.clearAuthInfo();
        this.setData({
          'userInfo.isLoggedIn': false,
        });
      }
    }
  },

  /**
   * 获取页面所需数据
   */
  async fetchPageData() {
    const isLoggedIn = this.data.userInfo.isLoggedIn;
    
    if (!isLoggedIn) {
      // 未登录时显示默认数据
      this.setData({
        userStats: {
          totalOrders: 0,
          favoriteStores: 0,
          totalSpending: 0,
          couponCount: 0,
        },
        orderStats: {
          pending: 0,
          preparing: 0,
          delivering: 0,
          completed: 0,
        },
      });
      return;
    }

    try {
      // 并行获取统计数据和订单统计数据
      Promise.all([
        userApi.getUserStats(),
        orderApi.getOrderStats(),
      ]).then(([userStats, orderStats]) => {
        this.setData({
          userStats: {
            ...this.data.userStats,
            ...userStats,
          },
          orderStats: {
            ...this.data.orderStats,
            ...orderStats,
          },
        });
      }).catch(error => {
        console.error('获取页面数据失败:', error);
        // 使用默认数据
        this.setData({
          userStats: {
            orders: 0,
            favorites: 0,
            spending: 0,
          },
          orderStats: {
            pending: 0,
            delivering: 0,
            completed: 0,
          },
        });
      });
    } catch (error) {
      console.error('获取页面数据失败:', error);
      showError('加载数据失败');
    }
  },

  /**
   * 刷新数据
   */
  async refreshData() {
    await this.checkLoginStatus();
    await this.fetchPageData();
  },

  /**
   * 计算缓存大小
   */
  calculateCacheSize() {
    try {
      const cacheInfo = wx.getStorageInfoSync();
      const size = cacheInfo.currentSize || 0;
      const sizeInKB = (size / 1024).toFixed(2);
      const sizeInMB = (size / 1024 / 1024).toFixed(2);

      this.setData({
        cacheSize: size >= 1024 ? `${sizeInMB}MB` : `${sizeInKB}KB`,
      });
    } catch (error) {
      console.error('计算缓存大小失败:', error);
    }
  },

  /**
   * 头像点击事件
   */
  async onAvatarClick() {
    const { isLoggedIn } = this.data.userInfo;

    if (!isLoggedIn) {
      // 未登录，跳转到登录页面
      wx.navigateTo({
        url: '/pages/login/login',
        success: () => {
          // 监听登录成功后的回调
          this.onShow();
        },
      });
    } else {
      // 已登录，跳转到个人信息页面
      wx.navigateTo({
        url: '/pages/profile/userinfo',
      });
    }
  },

  /**
   * 设置按钮点击事件
   */
  onSettingsClick() {
    wx.navigateTo({
      url: '/pages/settings/settings',
    });
  },

  /**
   * 查看订单详情
   */
  async onViewAllOrders() {
    const { isLoggedIn } = this.data.userInfo;

    if (!isLoggedIn) {
      await this.showLoginConfirm();
      return;
    }

    wx.navigateTo({
      url: '/pages/orders/orders',
    });
  },

  /**
   * 订单状态点击事件
   */
  async onOrderStatusClick(e) {
    const { status } = e.currentTarget.dataset;
    const { isLoggedIn } = this.data.userInfo;

    if (!isLoggedIn) {
      await this.showLoginConfirm();
      return;
    }

    wx.navigateTo({
      url: `/pages/orders/orders?status=${status}`,
    });
  },

  /**
   * 统计数据点击事件
   */
  async onStatClick(e) {
    const { stat } = e.currentTarget.dataset;
    const { isLoggedIn } = this.data.userInfo;

    if (!isLoggedIn) {
      await this.showLoginConfirm();
      return;
    }

    switch (stat) {
      case 'orders':
        wx.navigateTo({
          url: '/pages/orders/orders',
        });
        break;
      case 'favorites':
        wx.navigateTo({
          url: '/pages/favorites/favorites',
        });
        break;
      case 'spending':
        wx.navigateTo({
          url: '/pages/spending/spending',
        });
        break;
      default:
        break;
    }
  },

  /**
   * 菜单点击事件
   */
  async onMenuClick(e) {
    const { menu } = e.currentTarget.dataset;
    const { isLoggedIn } = this.data.userInfo;

    if (!isLoggedIn && ['address', 'payment', 'coupons', 'reviews', 'points'].includes(menu)) {
      await this.showLoginConfirm();
      return;
    }

    switch (menu) {
      case 'address':
        wx.navigateTo({
          url: '/pages/address/address',
        });
        break;
      case 'payment':
        wx.navigateTo({
          url: '/pages/payment/payment',
        });
        break;
      case 'coupons':
        wx.navigateTo({
          url: '/pages/coupon/coupon',
        });
        break;
      case 'reviews':
        wx.navigateTo({
          url: '/pages/review/review',
        });
        break;
      case 'share':
        // 分享功能已在onShareAppMessage中实现
        break;
      case 'points':
        wx.navigateTo({
          url: '/pages/points/points',
        });
        break;
      case 'customer':
        wx.navigateTo({
          url: '/pages/customer/customer',
        });
        break;
      case 'settings':
        wx.navigateTo({
          url: '/pages/settings/settings',
        });
        break;
      default:
        break;
    }
  },

  /**
   * 退出登录
   */
  async onLogout() {
    try {
      const confirm = await new Promise((resolve) => {
        wx.showModal({
          title: '提示',
          content: '确定要退出登录吗？',
          success: (res) => {
            resolve(res.confirm);
          },
        });
      });

      if (!confirm) return;

      showLoading('退出中...');

      // 调用退出登录API
      await userApi.logout();

      // 清除登录信息
      userApi.clearAuthInfo();

      showSuccess('退出成功');

      // 重置页面数据
      this.setData({
        userInfo: {
          isLoggedIn: false,
          name: '',
          level: '普通会员',
          points: 0,
          avatar: '',
        },
        userStats: {
          totalOrders: 0,
          favoriteStores: 0,
          totalSpending: 0,
          couponCount: 0,
        },
        orderStats: {
          pending: 0,
          preparing: 0,
          delivering: 0,
          completed: 0,
        },
      });

    } catch (error) {
      console.error('退出登录失败:', error);
      showError('退出失败');
    } finally {
      hideLoading();
    }
  },

  /**
   * 显示登录确认框
   */
  showLoginConfirm() {
    return new Promise((resolve) => {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            });
          }
          resolve();
        },
      });
    });
  },

  // 页面显示
  onShow() {
    console.log('个人中心页面显示');
    // 页面显示时刷新数据
    this.refreshData();
  },

  // 下拉刷新
  async onPullDownRefresh() {
    try {
      await this.refreshData();
      wx.stopPullDownRefresh();
      showSuccess('刷新成功');
    } catch (error) {
      console.error('刷新失败:', error);
      wx.stopPullDownRefresh();
      showError('刷新失败');
    }
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '美食小程序 - 个人中心',
      path: '/pages/profile/profile',
    };
  },

  /**
   * 页面错误处理
   */
  onError(error) {
    console.error('页面错误:', error);
    showError('页面加载失败');
  },

  /**
   * 页面不存在
   */
  onPageNotFound() {
    wx.showToast({
      title: '页面不存在',
      icon: 'none',
    });
  },
});