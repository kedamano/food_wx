/**
 * 收藏商家页面逻辑
 */

Page({
  data: {
    favoriteStores: [],
    loading: false,
    empty: false
  },

  onLoad: function() {
    this.loadFavoriteStores();
  },

  onShow: function() {
    if (!this.data.favoriteStores.length) {
      this.loadFavoriteStores();
    }
  },

  onPullDownRefresh: function() {
    this.loadFavoriteStores();
    wx.stopPullDownRefresh();
  },

  // 加载收藏的商家列表（从后端获取）
  loadFavoriteStores: function() {
    var self = this;
    var app = getApp();
    self.setData({ loading: true });

    // 后端暂无收藏接口，从所有商家中筛选已收藏的
    // 使用本地存储保存收藏列表
    var favoriteIds = wx.getStorageSync('favoriteStoreIds') || [];

    app.authRequest({
      url: '/store/all',
      method: 'GET'
    }).then(function(res) {
      self.setData({ loading: false });
      if (res && res.code === 200 && res.data) {
        var allStores = Array.isArray(res.data) ? res.data : [];
        var stores = [];
        for (var i = 0; i < allStores.length; i++) {
          var s = allStores[i];
          var sid = s.storeId || s.id;
          var isFound = false;
          for (var fi = 0; fi < favoriteIds.length; fi++) {
            if (favoriteIds[fi] === sid) {
              isFound = true;
              break;
            }
          }
          if (isFound) {
            stores.push({
              storeId: s.storeId || s.id,
              name: s.storeName || s.name,
              image: app.resolveImageUrl(s.logo) || app.resolveImageUrl(s.banner) || '/images/stores/default.png',
              rating: s.rating || 0,
              monthlySales: s.monthlySales || 0,
              distance: s.distance || '未知',
              deliveryTime: s.deliveryTime ? s.deliveryTime + '分钟' : '未知',
              deliveryFee: s.deliveryFee || 0,
              minOrder: s.minOrder || 0,
              tags: s.tags || [],
              isFavorite: true
            });
          }
        }
        self.setData({
          favoriteStores: stores,
          empty: stores.length === 0
        });
      } else {
        self.setData({ favoriteStores: [], empty: true });
      }
    }).catch(function(err) {
      console.error('加载收藏商家失败', err);
      self.setData({ loading: false, favoriteStores: [], empty: true });
    });
  },

  // 跳转到商家详情
  onStoreDetail: function(e) {
    var storeId = e.currentTarget.dataset.storeId;
    wx.navigateTo({
      url: '/pages/store-detail/store-detail?storeId=' + storeId
    });
  },

  // 取消收藏
  onCancelFavorite: function(e) {
    var storeId = e.currentTarget.dataset.storeId;
    var storeName = e.currentTarget.dataset.name;
    var self = this;
    e.stopPropagation();

    wx.showModal({
      title: '取消收藏',
      content: '确定取消收藏「' + storeName + '」吗？',
      success: function(res) {
        if (res.confirm) {
          // 从本地存储中移除收藏ID
          var favoriteIds = wx.getStorageSync('favoriteStoreIds') || [];
          var newFavoriteIds = [];
          for (var i = 0; i < favoriteIds.length; i++) {
            if (favoriteIds[i] !== storeId) {
              newFavoriteIds.push(favoriteIds[i]);
            }
          }
          wx.setStorageSync('favoriteStoreIds', newFavoriteIds);

          // 更新列表
          var updatedStores = [];
          for (var j = 0; j < self.data.favoriteStores.length; j++) {
            if (self.data.favoriteStores[j].storeId !== storeId) {
              updatedStores.push(self.data.favoriteStores[j]);
            }
          }
          self.setData({
            favoriteStores: updatedStores,
            empty: updatedStores.length === 0
          });
          wx.showToast({ title: '已取消收藏', icon: 'success' });
        }
      }
    });
  }
});
