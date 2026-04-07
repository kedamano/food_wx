// pages/coupons/coupons.js
const app = getApp()

Page({
  data: {
    // 当前激活的标签
    activeTab: 'available',
    // 优惠券列表
    coupons: [],
    // 显示优惠券列表（筛选后）
    displayCoupons: [],
    // 优惠券统计
    couponStats: {
      available: 0,
      used: 0,
      expired: 0
    },
    // 推荐优惠券
    recommendCoupons: [],
    // 加载状态
    isLoading: true
  },

  // 页面加载
  onLoad(options) {
    console.log('优惠券页面加载');
    // 加载优惠券数据
    this.loadCoupons();
    this.loadStatistics();
  },

  // 页面显示时刷新
  onShow() {
    this.loadCoupons();
    this.loadStatistics();
  },

  // 返回按钮点击
  onBackClick() {
    console.log('返回按钮点击');
    wx.navigateBack({
      delta: 1
    });
  },

  // 兑换优惠券
  onExchangeCoupon() {
    console.log('兑换优惠券');
    wx.navigateTo({
      url: '/pages/coupon-exchange/coupon-exchange'
    });
  },

  // 标签切换
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    console.log('标签切换：', tab);

    this.setData({
      activeTab: tab
    });

    // 筛选优惠券
    this.filterCoupons();
  },

  // 筛选优惠券
  filterCoupons() {
    const { coupons, activeTab } = this.data;

    let filteredCoupons = [];
    switch (activeTab) {
      case 'available':
        filteredCoupons = coupons.filter(item => item.status === 'available');
        break;
      case 'used':
        filteredCoupons = coupons.filter(item => item.status === 'used');
        break;
      case 'expired':
        filteredCoupons = coupons.filter(item => item.status === 'expired');
        break;
    }

    this.setData({
      displayCoupons: filteredCoupons
    });
  },

  // 选择优惠券
  onSelectCoupon(e) {
    const coupon = e.currentTarget.dataset.coupon;
    console.log('选择优惠券：', coupon);

    // 如果是在选择模式（例如从订单确认页过来），则返回选择的优惠券
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.route === 'pages/order-confirm/order-confirm') {
      // 验证优惠券是否可用
      if (coupon.status !== 'available') {
        wx.showToast({
          title: '优惠券不可用',
          icon: 'none'
        });
        return;
      }

      // 设置上一个页面的优惠券
      prevPage.setData({
        selectedCoupon: coupon
      });
      wx.navigateBack();
      return;
    }

    // 普通模式，查看详情
    wx.navigateTo({
      url: `/pages/coupon-detail/coupon-detail?id=${coupon.id}`
    });
  },

  // 推荐优惠券点击
  onRecommendCoupon(e) {
    const coupon = e.currentTarget.dataset.coupon;
    console.log('推荐优惠券点击：', coupon);

    const userId = app.globalData.userId || wx.getStorageSync('userId') || 1;

    wx.showModal({
      title: '兑换优惠券',
      content: `确定要兑换 ${coupon.name} 吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '兑换中...'
          });

          app.authRequest({
            url: '/coupon/exchange',
            method: 'POST',
            data: {
              userId: userId,
              couponId: coupon.couponId
            }
          }).then(res => {
            wx.hideLoading();
            if (res && res.code === 200) {
              wx.showToast({
                title: '兑换成功',
                icon: 'success'
              });
              // 重新加载优惠券
              this.loadCoupons();
              this.loadStatistics();
            } else {
              wx.showToast({
                title: res.message || '兑换失败',
                icon: 'none'
              });
            }
          }).catch(err => {
            wx.hideLoading();
            console.error('兑换优惠券失败', err);
            wx.showToast({
              title: '兑换失败',
              icon: 'none'
            });
          });
        }
      }
    });
  },

  // 加载优惠券数据
  loadCoupons() {
    const userId = app.globalData.userId || wx.getStorageSync('userId') || 1;

    this.setData({ isLoading: true });

    app.authRequest({
      url: `/coupon/user/${userId}`,
      method: 'GET'
    }).then(res => {
      this.setData({ isLoading: false });

      if (res && res.code === 200 && res.data) {
        let coupons = res.data;
        
        // 检查是否即将过期（3天内）
        coupons = coupons.map(coupon => {
          if (coupon.expiry) {
            const expiryDate = new Date(coupon.expiry);
            const now = new Date();
            const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            coupon.isExpiring = diffDays <= 3 && diffDays > 0;
          }
          return coupon;
        });

        // 筛选当前标签的数据
        this.setData({ coupons: coupons });
        this.filterCoupons();
      } else {
        // 如果请求失败，使用本地存储的缓存数据
        this.useCachedData();
      }
    }).catch(err => {
      this.setData({ isLoading: false });
      console.error('加载优惠券失败', err);
      // 使用本地存储的缓存数据
      this.useCachedData();
    });
  },

  // 加载优惠券统计数据
  loadStatistics() {
    const userId = app.globalData.userId || wx.getStorageSync('userId') || 1;

    app.authRequest({
      url: `/coupon/statistics/${userId}`,
      method: 'GET'
    }).then(res => {
      if (res && res.code === 200 && res.data) {
        const stats = res.data;
        this.setData({
          couponStats: {
            available: stats.available || 0,
            used: stats.used || 0,
            expired: stats.expired || 0
          }
        });
        
        // 同时加载推荐优惠券
        this.loadRecommendCoupons();
      }
    }).catch(err => {
      console.error('加载优惠券统计失败', err);
    });
  },

  // 加载推荐优惠券
  loadRecommendCoupons() {
    app.authRequest({
      url: '/coupon/available',
      method: 'GET'
    }).then(res => {
      if (res && res.code === 200 && res.data) {
        // 过滤出用户还没有兑换的优惠券作为推荐
        const userCouponIds = this.data.coupons.map(c => c.couponId);
        const recommendCoupons = res.data
          .filter(coupon => !userCouponIds.includes(coupon.couponId))
          .slice(0, 3)
          .map(coupon => ({
            couponId: coupon.couponId,
            name: coupon.couponName,
            discount: coupon.discountAmount,
            condition: '满' + coupon.minAmount.intValue() + '可用'
          }));

        this.setData({ recommendCoupons: recommendCoupons });
      }
    }).catch(err => {
      console.error('加载推荐优惠券失败', err);
    });
  },

  // 使用缓存数据（请求失败时的降级处理）
  useCachedData() {
    // 尝试从本地存储加载
    const cachedCoupons = wx.getStorageSync('cachedCoupons') || [];
    
    if (cachedCoupons.length > 0) {
      this.setData({
        coupons: cachedCoupons,
        isLoading: false
      });
      this.filterCoupons();
    } else {
      // 使用默认的 mock 数据
      this.useMockData();
    }
  },

  // 使用 Mock 数据
  useMockData() {
    const mockCoupons = [
      {
        id: 1,
        name: '新人专享券',
        discount: 15,
        condition: '满50可用',
        expiry: '2026-12-31',
        status: 'available',
        statusText: '可用',
        statusIcon: 'fa-ticket-alt',
        type: 'discount',
        isExpiring: false
      },
      {
        id: 2,
        name: '会员专享券',
        discount: 10,
        condition: '满30可用',
        expiry: '2026-06-30',
        status: 'available',
        statusText: '可用',
        statusIcon: 'fa-ticket-alt',
        type: 'discount',
        isExpiring: true
      }
    ];

    // 计算统计数据
    const stats = {
      available: mockCoupons.filter(item => item.status === 'available').length,
      used: mockCoupons.filter(item => item.status === 'used').length,
      expired: mockCoupons.filter(item => item.status === 'expired').length
    };

    // 模拟推荐优惠券
    const mockRecommendCoupons = [
      {
        couponId: 3,
        name: '首单立减券',
        discount: 25,
        condition: '满60可用'
      },
      {
        couponId: 4,
        name: '新用户专享',
        discount: 50,
        condition: '满100可用'
      }
    ];

    this.setData({
      coupons: mockCoupons,
      displayCoupons: mockCoupons.filter(item => item.status === 'available'),
      couponStats: stats,
      recommendCoupons: mockRecommendCoupons,
      isLoading: false
    });

    // 缓存数据
    wx.setStorageSync('cachedCoupons', mockCoupons);
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    this.loadCoupons();
    this.loadStatistics();

    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});
