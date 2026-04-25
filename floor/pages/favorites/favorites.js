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
    var userId = app.globalData.userId || wx.getStorageSync('userId');
    self.setData({ loading: true });

    if (!userId) {
      self.setData({ loading: false, favoriteStores: [], empty: true });
      return;
    }

    app.authRequest({
      url: '/favorite/user/' + userId,
      method: 'GET'
    }).then(function(res) {
      self.setData({ loading: false });
      if (res && res.code === 200 && res.data) {
        var stores = Array.isArray(res.data) ? res.data : [];
        var list = [];
        for (var i = 0; i < stores.length; i++) {
          var s = stores[i];
          list.push({
            storeId: s.storeId,
            name: s.storeName || s.name,
            image: app.resolveImageUrl(s.logo) || '/images/stores/default.png',
            rating: s.rating || 0,
            deliveryTime: s.deliveryTime || '30分钟',
            deliveryFee: s.deliveryFee || 0,
            isFavorite: true
          });
        }
        self.setData({ favoriteStores: list, empty: list.length === 0 });
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
    var app = getApp();
    e.stopPropagation();

    wx.showModal({
      title: '取消收藏',
      content: '确定取消收藏「' + storeName + '」吗？',
      success: function(res) {
        if (res.confirm) {
          // 调用后端取消收藏接口
          app.authRequest({
            url: '/favorite/' + storeId,
            method: 'DELETE'
          }).then(function(delRes) {
            // 更新列表
            var updatedStores = [];
            for (var j = 0; j < self.data.favoriteStores.length; j++) {
              if (self.data.favoriteStores[j].storeId !== storeId) {
                updatedStores.push(self.data.favoriteStores[j]);
              }
            }
            self.setData({ favoriteStores: updatedStores, empty: updatedStores.length === 0 });
            wx.showToast({ title: '已取消收藏', icon: 'success' });
          }).catch(function(err) {
            wx.showToast({ title: '操作失败', icon: 'none' });
          });
        }
      }
    });
  }
});
