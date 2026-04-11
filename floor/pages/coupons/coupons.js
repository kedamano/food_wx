// pages/coupons/coupons.js

Page({
  data: {
    activeTab: 'available',
    coupons: [],
    displayCoupons: [],
    couponStats: {
      available: 0,
      used: 0,
      expired: 0
    },
    recommendCoupons: [],
    isLoading: false
  },

  onLoad: function() {
    this.loadCoupons();
  },

  onShow: function() {
    if (!this.data.coupons.length) {
      this.loadCoupons();
    }
  },

  onBackClick: function() {
    wx.navigateBack({ delta: 1 });
  },

  onTabChange: function(e) {
    var tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.filterCoupons();
  },

  filterCoupons: function() {
    var coupons = this.data.coupons;
    var activeTab = this.data.activeTab;
    var filtered = [];

    if (activeTab === 'available') {
      for (var i = 0; i < coupons.length; i++) {
        if (coupons[i].status === 'available') {
          filtered.push(coupons[i]);
        }
      }
    } else if (activeTab === 'used') {
      for (var j = 0; j < coupons.length; j++) {
        if (coupons[j].status === 'used') {
          filtered.push(coupons[j]);
        }
      }
    } else if (activeTab === 'expired') {
      for (var k = 0; k < coupons.length; k++) {
        if (coupons[k].status === 'expired') {
          filtered.push(coupons[k]);
        }
      }
    }

    this.setData({ displayCoupons: filtered });
  },

  onSelectCoupon: function(e) {
    var coupon = e.currentTarget.dataset.coupon;
    if (coupon && coupon.id) {
      wx.navigateTo({
        url: '/pages/coupon-detail/coupon-detail?id=' + coupon.id
      });
    }
  },

  onRecommendCoupon: function(e) {
    wx.showToast({ title: '兑换功能开发中', icon: 'none' });
  },

  // 从后端加载优惠券数据
  loadCoupons: function() {
    var self = this;
    var app = getApp();
    var userId = app.globalData.userId || wx.getStorageSync('userId') || 1;

    self.setData({ isLoading: true });

    app.authRequest({
      url: '/coupon/user/' + userId,
      method: 'GET'
    }).then(function(res) {
      self.setData({ isLoading: false });
      if (res && res.code === 200 && res.data) {
        var list = Array.isArray(res.data) ? res.data : [];
        var coupons = [];
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          var isExpiring = false;
          if (item.endTime) {
            var endDate = new Date(item.endTime);
            var now = new Date();
            if (endDate - now < 7 * 86400000) {
              isExpiring = true;
            }
          }
          coupons.push({
            id: item.couponId || item.id,
            name: item.couponName || item.name || '优惠券',
            discount: item.discount || item.amount || 0,
            condition: item.minAmount ? '满' + item.minAmount + '可用' : '无门槛',
            expiry: item.endTime || item.expiry || '2026-12-31',
            status: item.status === 0 ? 'available' : (item.status === 1 ? 'used' : 'expired'),
            statusText: item.status === 0 ? '可用' : (item.status === 1 ? '已使用' : '已过期'),
            type: item.type || 'discount',
            minAmount: item.minAmount || 0,
            isExpiring: isExpiring
          });
        }

        var availableCount = 0;
        var usedCount = 0;
        var expiredCount = 0;
        for (var m = 0; m < coupons.length; m++) {
          if (coupons[m].status === 'available') {
            availableCount++;
          } else if (coupons[m].status === 'used') {
            usedCount++;
          } else if (coupons[m].status === 'expired') {
            expiredCount++;
          }
        }
        var stats = {
          available: availableCount,
          used: usedCount,
          expired: expiredCount
        };

        var displayCoupons = [];
        for (var n = 0; n < coupons.length; n++) {
          if (coupons[n].status === 'available') {
            displayCoupons.push(coupons[n]);
          }
        }

        self.setData({
          coupons: coupons,
          displayCoupons: displayCoupons,
          couponStats: stats,
          recommendCoupons: []
        });
      } else {
        self.setData({
          coupons: [],
          displayCoupons: [],
          couponStats: { available: 0, used: 0, expired: 0 },
          recommendCoupons: []
        });
      }
    }).catch(function(err) {
      console.error('加载优惠券失败', err);
      self.setData({
        isLoading: false,
        coupons: [],
        displayCoupons: [],
        couponStats: { available: 0, used: 0, expired: 0 },
        recommendCoupons: []
      });
    });
  },

  onPullDownRefresh: function() {
    this.loadCoupons();
    wx.stopPullDownRefresh();
  }
});
