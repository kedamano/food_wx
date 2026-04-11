/**
 * 个人中心页面逻辑
 */
var userApi = require('../../api/user');
var orderApi = require('../../api/order');
var requestModule = require('../../api/request');

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
  onLoad: function(options) {
    var self = this;
    console.log('个人中心页面加载');
    self.initPageData();
  },

  /**
   * 初始化页面数据
   */
  initPageData: function() {
    var self = this;
    self.checkLoginStatus()
      .then(function() {
        return self.fetchPageData();
      })
      .then(function() {
        self.calculateCacheSize();
      })
      .catch(function(error) {
        console.error('初始化页面数据失败:', error);
        if (typeof requestModule.showError === 'function') {
          requestModule.showError('加载数据失败');
        } else if (typeof showError === 'function') {
          showError('加载数据失败');
        }
      });
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus: function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      var isLoggedIn = userApi.checkLoginStatus();
      self.setData({
        'userInfo.isLoggedIn': isLoggedIn,
      });

      if (isLoggedIn) {
        userApi.getUserInfo()
          .then(function(userInfo) {
            // 手动合并对象
            var newUserInfo = {};
            var key;
            for (key in self.data.userInfo) {
              newUserInfo[key] = self.data.userInfo[key];
            }
            for (key in userInfo) {
              newUserInfo[key] = userInfo[key];
            }
            newUserInfo.isLoggedIn = true;
            self.setData({
              userInfo: newUserInfo,
            });
            resolve();
          })
          .catch(function(error) {
            console.error('获取用户信息失败:', error);
            // 如果获取失败（Token过期），清除登录状态并提示重新登录
            userApi.clearAuthInfo();
            self.setData({
              'userInfo.isLoggedIn': false,
            });
            // 提示用户重新登录
            wx.showModal({
              title: '登录已过期',
              content: '您的登录已过期，请重新登录',
              confirmText: '去登录',
              success: function(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/login/login',
                  });
                }
              }
            });
            resolve();
          });
      } else {
        resolve();
      }
    });
  },

  /**
   * 获取页面所需数据
   */
  fetchPageData: function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      var isLoggedIn = self.data.userInfo.isLoggedIn;

      if (!isLoggedIn) {
        // 未登录时显示默认数据
        self.setData({
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
        resolve();
        return;
      }

      // 使用计数器处理 Promise.all
      var completedCount = 0;
      var totalCount = 2;
      var userStatsResult = null;
      var orderStatsResult = null;

      function checkAllComplete() {
        completedCount++;
        if (completedCount >= totalCount) {
          // 手动合并对象
          if (userStatsResult) {
            var newUserStats = {};
            var key;
            for (key in self.data.userStats) {
              newUserStats[key] = self.data.userStats[key];
            }
            for (key in userStatsResult) {
              newUserStats[key] = userStatsResult[key];
            }
            self.setData({ userStats: newUserStats });
          }
          if (orderStatsResult) {
            var newOrderStats = {};
            for (key in self.data.orderStats) {
              newOrderStats[key] = self.data.orderStats[key];
            }
            for (key in orderStatsResult) {
              newOrderStats[key] = orderStatsResult[key];
            }
            self.setData({ orderStats: newOrderStats });
          }
          resolve();
        }
      }

      userApi.getUserStats()
        .then(function(data) {
          userStatsResult = data;
          checkAllComplete();
        })
        .catch(function(error) {
          console.error('获取用户统计失败:', error);
          userStatsResult = {
            orders: 0,
            favorites: 0,
            spending: 0,
          };
          checkAllComplete();
        });

      orderApi.getOrderStats()
        .then(function(data) {
          orderStatsResult = data;
          checkAllComplete();
        })
        .catch(function(error) {
          console.error('获取订单统计失败:', error);
          orderStatsResult = {
            pending: 0,
            delivering: 0,
            completed: 0,
          };
          checkAllComplete();
        });
    });
  },

  /**
   * 刷新数据
   */
  refreshData: function() {
    var self = this;
    self.checkLoginStatus()
      .then(function() {
        return self.fetchPageData();
      });
  },

  /**
   * 计算缓存大小
   */
  calculateCacheSize: function() {
    try {
      var cacheInfo = wx.getStorageInfoSync();
      var size = cacheInfo.currentSize || 0;
      var sizeInKB = (size / 1024).toFixed(2);
      var sizeInMB = (size / 1024 / 1024).toFixed(2);

      this.setData({
        cacheSize: size >= 1024 ? sizeInMB + 'MB' : sizeInKB + 'KB',
      });
    } catch (error) {
      console.error('计算缓存大小失败:', error);
    }
  },

  /**
   * 头像点击事件
   */
  onAvatarClick: function() {
    var self = this;
    var isLoggedIn = self.data.userInfo.isLoggedIn;

    if (!isLoggedIn) {
      // 未登录，跳转到登录页面
      wx.navigateTo({
        url: '/pages/login/login',
        success: function() {
          // 监听登录成功后的回调
          self.onShow();
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
  onSettingsClick: function() {
    wx.navigateTo({
      url: '/pages/settings/settings',
    });
  },

  /**
   * 清除缓存
   */
  onClearCache: function() {
    var self = this;
    wx.showModal({
      title: '提示',
      content: '确定要清除缓存吗？',
      success: function(res) {
        if (res.confirm) {
          try {
            wx.clearStorageSync();
            self.setData({
              cacheSize: '0KB',
            });
            wx.showToast({
              title: '缓存已清除',
              icon: 'success',
            });
          } catch (error) {
            console.error('清除缓存失败:', error);
            wx.showToast({
              title: '清除失败',
              icon: 'none',
            });
          }
        }
      },
    });
  },

  /**
   * 关于我们
   */
  onAbout: function() {
    wx.navigateTo({
      url: '/pages/about/about',
    });
  },

  /**
   * 查看订单详情
   */
  onViewAllOrders: function() {
    var self = this;
    var isLoggedIn = self.data.userInfo.isLoggedIn;

    if (!isLoggedIn) {
      self.showLoginConfirm();
      return;
    }

    wx.navigateTo({
      url: '/pages/orders/orders',
    });
  },

  /**
   * 订单状态点击事件
   */
  onOrderStatusClick: function(e) {
    var self = this;
    var status = e.currentTarget.dataset.status;
    var isLoggedIn = self.data.userInfo.isLoggedIn;

    if (!isLoggedIn) {
      self.showLoginConfirm();
      return;
    }

    // 将英文状态映射为中文状态（orders 页面使用中文状态筛选）
    var statusMap = {
      pending: '待付款',
      preparing: '制作中',
      delivering: '配送中',
      completed: '已完成'
    };
    var tabStatus = statusMap[status] || status;

    wx.navigateTo({
      url: '/pages/orders/orders?status=' + tabStatus,
    });
  },

  /**
   * 统计数据点击事件
   */
  onStatClick: function(e) {
    var self = this;
    var stat = e.currentTarget.dataset.stat;
    var isLoggedIn = self.data.userInfo.isLoggedIn;

    if (!isLoggedIn) {
      self.showLoginConfirm();
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
  onMenuClick: function(e) {
    var self = this;
    var menu = e.currentTarget.dataset.menu;
    var isLoggedIn = self.data.userInfo.isLoggedIn;

    var requiresLoginMenus = ['address', 'payment', 'coupons', 'reviews', 'points'];
    // 手动检查数组包含
    var needsLogin = false;
    for (var i = 0; i < requiresLoginMenus.length; i++) {
      if (requiresLoginMenus[i] === menu) {
        needsLogin = true;
        break;
      }
    }

    if (!isLoggedIn && needsLogin) {
      self.showLoginConfirm();
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
          url: '/pages/coupons/coupons',
        });
        break;
      case 'reviews':
        wx.navigateTo({
          url: '/pages/user-reviews/user-reviews',
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
  onLogout: function() {
    var self = this;

    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: function(modalRes) {
        if (!modalRes.confirm) return;

        if (typeof requestModule.showLoading === 'function') {
          requestModule.showLoading('退出中...');
        } else if (typeof showLoading === 'function') {
          showLoading('退出中...');
        }

        userApi.logout()
          .then(function() {
            // 清除登录信息
            userApi.clearAuthInfo();

            if (typeof requestModule.showSuccess === 'function') {
              requestModule.showSuccess('退出成功');
            } else if (typeof showSuccess === 'function') {
              showSuccess('退出成功');
            }

            // 重置页面数据
            self.setData({
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
          })
          .catch(function(error) {
            console.error('退出登录失败:', error);
            if (typeof requestModule.showError === 'function') {
              requestModule.showError('退出失败');
            } else if (typeof showError === 'function') {
              showError('退出失败');
            }
          })
          .finally(function() {
            if (typeof requestModule.hideLoading === 'function') {
              requestModule.hideLoading();
            } else if (typeof hideLoading === 'function') {
              hideLoading();
            }
          });
      }
    });
  },

  /**
   * 显示登录确认框
   */
  showLoginConfirm: function() {
    var self = this;
    return new Promise(function(resolve) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        success: function(res) {
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
  onShow: function() {
    console.log('个人中心页面显示');
    // 页面显示时刷新数据
    this.refreshData();
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    var self = this;
    self.refreshData()
      .then(function() {
        wx.stopPullDownRefresh();
        if (typeof requestModule.showSuccess === 'function') {
          requestModule.showSuccess('刷新成功');
        } else if (typeof showSuccess === 'function') {
          showSuccess('刷新成功');
        }
      })
      .catch(function(error) {
        console.error('刷新失败:', error);
        wx.stopPullDownRefresh();
        if (typeof requestModule.showError === 'function') {
          requestModule.showError('刷新失败');
        } else if (typeof showError === 'function') {
          showError('刷新失败');
        }
      });
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: '美食小程序 - 个人中心',
      path: '/pages/profile/profile',
    };
  },

  /**
   * 页面错误处理
   */
  onError: function(error) {
    console.error('页面错误:', error);
    if (typeof requestModule.showError === 'function') {
      requestModule.showError('页面加载失败');
    } else if (typeof showError === 'function') {
      showError('页面加载失败');
    }
  },

  /**
   * 页面不存在
   */
  onPageNotFound: function() {
    wx.showToast({
      title: '页面不存在',
      icon: 'none',
    });
  },
});
