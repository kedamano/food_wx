// 商家详情页 - 大众点评风格
Page({
  data: {
    storeInfo: { id: 0, name: '', banner: '', distance: '', deliveryTime: '', price: 0, rating: 0, notice: '', status: '' },
    storeImages: [],
    isCollected: false,
    categories: [],
    currentCategory: 0,
    foodList: [],
    cartItems: [],
    cartCount: 0,
    cartTotal: 0,
    activeTab: 'menu',
    deals: [],
    reviewsList: [],
    showCartPopup: false,
    cartPopupItems: [],
    cartPopupCount: 0,
    cartPopupTotal: '0.00'
  },

  onLoad: function(options) {
    var storeId = parseInt(options.storeId) || 1;
    var self = this;
    this.loadStoreInfo(storeId);
    this.loadCategories();
    this.loadFoods(storeId);
    this.loadCart();
    // 检查收藏状态（调用后端）
    this.checkFavoriteStatus(storeId);
  },

  goBack: function() { wx.navigateBack({ delta: 1 }); },

  onShare: function() {
    var self = this;
    wx.showActionSheet({
      itemList: ['分享给朋友', '生成海报', '复制链接'],
      success: function(res) {
        if (res.tapIndex === 0) {
          // 使用微信分享
          wx.showShareMenu({ withShareTicket: true });
        } else if (res.tapIndex === 1) {
          wx.showToast({ title: '海报生成中...', icon: 'none' });
          setTimeout(function() {
            wx.showToast({ title: '海报已保存到相册', icon: 'success' });
          }, 1500);
        } else if (res.tapIndex === 2) {
          wx.setClipboardData({
            data: '美食探店 - ' + self.data.storeInfo.name,
            success: function() {
              wx.showToast({ title: '链接已复制', icon: 'success' });
            }
          });
        }
      }
    });
  },

  // 检查是否已收藏（调用后端）
  checkFavoriteStatus: function(storeId) {
    var self = this;
    var app = getApp();
    app.authRequest({
      url: '/favorite/check/' + storeId,
      method: 'GET'
    }).then(function(res) {
      if (res && res.code === 200 && res.data) {
        self.setData({ isCollected: res.data.isFavorite || false });
      }
    }).catch(function() {
      // 未登录时降级为本地存储
      var favoriteIds = wx.getStorageSync('favoriteStoreIds') || [];
      var isCollected = false;
      for (var i = 0; i < favoriteIds.length; i++) {
        if (favoriteIds[i] === storeId) { isCollected = true; break; }
      }
      self.setData({ isCollected: isCollected });
    });
  },

  toggleCollect: function() {
    var self = this;
    var app = getApp();
    var storeId = this.data.storeInfo.id;
    var isCollected = !this.data.isCollected;

    if (isCollected) {
      // 收藏
      app.authRequest({
        url: '/favorite',
        method: 'POST',
        data: { storeId: storeId }
      }).then(function(res) {
        if (res && (res.code === 200 || res.code === 400)) {
          self.setData({ isCollected: true });
          wx.showToast({ title: '已收藏', icon: 'success' });
        }
      }).catch(function(err) {
        wx.showToast({ title: '收藏失败，请先登录', icon: 'none' });
      });
    } else {
      // 取消收藏
      app.authRequest({
        url: '/favorite/' + storeId,
        method: 'DELETE'
      }).then(function(res) {
        self.setData({ isCollected: false });
        wx.showToast({ title: '已取消收藏', icon: 'success' });
      }).catch(function(err) {
        wx.showToast({ title: '操作失败', icon: 'none' });
      });
    }
  },

  switchTab: function(e) {
    var tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    if (tab === 'reviews' && this.data.reviewsList.length === 0) {
      this.loadReviews();
    }
  },

  onCategoryTap: function(e) {
    var id = e.currentTarget.dataset.id;
    this.setData({ currentCategory: id });
    this.loadFoods(this.data.storeInfo.id, id);
  },

  onAddToCart: function(e) {
    var self = this;
    var item = e.currentTarget.dataset.item;
    var app = getApp();
    var cart = app.globalData.cart || [];
    var idx = -1;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].foodId === item.id) {
        idx = i;
        break;
      }
    }
    if (idx !== -1) {
      cart[idx].quantity += 1;
    } else {
      cart.push({
        foodId: item.id,
        name: item.name,
        price: item.price,
        image: item.image || '',
        quantity: 1,
        storeId: this.data.storeInfo.id
      });
    }
    app.updateCart(cart);
    this.updateCartDisplay();
    wx.showToast({ title: '已加入购物车', icon: 'success', duration: 800 });
  },

  onCartTap: function() {
    var self = this;
    var app = getApp();
    var cart = app.globalData.cart || [];
    var totalCount = 0;
    var totalPrice = 0;
    for (var i = 0; i < cart.length; i++) {
      totalCount += cart[i].quantity;
      totalPrice += cart[i].price * cart[i].quantity;
    }
    var items = [];
    for (var j = 0; j < cart.length; j++) {
      var item = cart[j];
      var newItem = {};
      for (var key in item) {
        newItem[key] = item[key];
      }
      newItem.subtotal = (item.price * item.quantity).toFixed(2);
      items.push(newItem);
    }

    this.setData({
      cartPopupItems: items,
      cartPopupCount: totalCount,
      cartPopupTotal: totalPrice.toFixed(2),
      showCartPopup: true
    });
  },

  hideCartPopup: function() {
    this.setData({ showCartPopup: false });
  },

  onCartItemMinus: function(e) {
    var self = this;
    var index = e.currentTarget.dataset.index;
    var app = getApp();
    var cart = app.globalData.cart || [];

    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
    } else {
      cart.splice(index, 1);
    }

    app.globalData.cart = cart;
    var cartCount = 0;
    for (var i = 0; i < cart.length; i++) {
      cartCount += cart[i].quantity;
    }
    app.globalData.cartCount = cartCount;
    this.refreshCartPopup(cart);
    this.updateCartDisplay();
  },

  onCartItemPlus: function(e) {
    var self = this;
    var index = e.currentTarget.dataset.index;
    var app = getApp();
    var cart = app.globalData.cart || [];

    cart[index].quantity += 1;
    app.globalData.cart = cart;
    var cartCount = 0;
    for (var i = 0; i < cart.length; i++) {
      cartCount += cart[i].quantity;
    }
    app.globalData.cartCount = cartCount;
    this.refreshCartPopup(cart);
    this.updateCartDisplay();
  },

  clearCart: function() {
    var app = getApp();
    app.globalData.cart = [];
    app.globalData.cartCount = 0;
    this.setData({
      cartPopupItems: [],
      cartPopupCount: 0,
      cartPopupTotal: '0.00',
      showCartPopup: false
    });
    this.updateCartDisplay();
    wx.showToast({ title: '已清空购物车', icon: 'none' });
  },

  refreshCartPopup: function(cart) {
    var totalCount = 0;
    var totalPrice = 0;
    for (var i = 0; i < cart.length; i++) {
      totalCount += cart[i].quantity;
      totalPrice += cart[i].price * cart[i].quantity;
    }
    var items = [];
    for (var j = 0; j < cart.length; j++) {
      var item = cart[j];
      var newItem = {};
      for (var key in item) {
        newItem[key] = item[key];
      }
      newItem.subtotal = (item.price * item.quantity).toFixed(2);
      items.push(newItem);
    }
    this.setData({
      cartPopupItems: items,
      cartPopupCount: totalCount,
      cartPopupTotal: totalPrice.toFixed(2)
    });
  },

  goToCartFromPopup: function() {
    this.setData({ showCartPopup: false });
    wx.switchTab({ url: '/pages/cart/cart' });
  },

  onSettle: function() {
    var cartItems = this.data.cartItems;
    var cartTotal = this.data.cartTotal;
    if (cartItems.length === 0) {
      wx.showToast({ title: '购物车为空', icon: 'none' });
      return;
    }
    var orderInfo = {
      orderId: Date.now().toString(),
      storeId: this.data.storeInfo.id,
      storeName: this.data.storeInfo.name,
      items: cartItems,
      totalAmount: cartTotal,
      deliveryFee: this.data.storeInfo.deliveryFee || 5,
      discount: 0,
      finalAmount: cartTotal + (this.data.storeInfo.deliveryFee || 5),
      orderTime: new Date().toISOString(),
      status: 'pending'
    };
    var app = getApp();
    app.globalData.currentOrder = orderInfo;
    wx.navigateTo({
      url: '/pages/order-confirm/order-confirm',
      fail: function() {
        wx.showModal({
          title: '订单信息',
          content: '订单已创建！金额：¥' + orderInfo.finalAmount,
          showCancel: false
        });
      }
    });
  },

  loadStoreInfo: function(storeId) {
    var self = this;
    var app = getApp();
    app.authRequest({
      url: '/store/' + storeId,
      method: 'GET',
      success: function(res) {
        if (res && res.code === 200 && res.data) {
          var d = res.data;
          var deliveryTimeStr = d.deliveryTime ? d.deliveryTime + '分钟' : '30分钟';
          var deliveryFeeVal = d.deliveryFee || 5;
          var priceLevelVal = d.priceLevel || d.price || 25;
          var tagsArray = d.tags || ['味道赞', '环境好', '服务棒'];
          var info = {
            id: d.storeId || d.id || storeId,
            name: d.storeName || d.name || '未知商家',
            banner: app.resolveImageUrl(d.banner) || app.resolveImageUrl(d.logo) || '',
            distance: d.distance || '1.5km',
            deliveryTime: deliveryTimeStr,
            price: priceLevelVal,
            rating: Number(d.rating) || 4.5,
            notice: d.notice || '欢迎光临！',
            address: d.address || '',
            phone: d.phone || '',
            deliveryFee: deliveryFeeVal,
            status: d.status === 1 ? '营业中' : '休息中',
            reviews: d.reviews || 0,
            tags: tagsArray,
            businessHours: d.businessHours || '10:00 - 22:00'
          };
          var dealsArr = [
            { badge: '满减', text: '满100减' + Math.floor(info.price) },
            { badge: '新客', text: '新用户立减15元' },
            { badge: '折扣', text: '招牌菜享8折优惠' }
          ];
          var storeImagesArr = [];
          if (info.banner) {
            storeImagesArr.push(info.banner);
            storeImagesArr.push(info.banner);
          }
          self.setData({
            storeInfo: info,
            storeImages: storeImagesArr,
            deals: dealsArr
          });
        } else {
          wx.showToast({ title: '加载商家信息失败', icon: 'none' });
        }
      },
      fail: function() {
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  loadCategories: function() {
    this.setData({
      categories: [
        { id: 1, name: '招牌推荐' },
        { id: 2, name: '热销榜' },
        { id: 3, name: '主食' },
        { id: 4, name: '小吃' },
        { id: 5, name: '饮品' },
        { id: 6, name: '套餐' }
      ]
    });
  },

  loadFoods: function(storeId, categoryId) {
    var self = this;
    var app = getApp();
    var url = '/food/store/' + storeId;
    app.authRequest({
      url: url,
      method: 'GET',
      success: function(res) {
        if (res && res.code === 200 && res.data) {
          var list = [];
          for (var i = 0; i < res.data.length; i++) {
            var f = res.data[i];
            list.push({
              id: f.foodId || f.id,
              name: f.foodName || f.name,
              price: f.price,
              description: f.description || '',
              sales: f.sales || f.monthlySales || 0,
              image: app.resolveImageUrl(f.image) || app.resolveImageUrl(f.cover) || ''
            });
          }
          self.setData({ foodList: list });
        } else {
          self.setData({ foodList: [] });
        }
      },
      fail: function() {
        self.setData({ foodList: [] });
      }
    });
  },

  loadReviews: function() {
    var self = this;
    var app = getApp();
    var storeId = self.data.storeInfo.id;
    app.authRequest({
      url: '/food/store/' + storeId,
      method: 'GET',
      success: function(res) {
        if (res && res.code === 200 && res.data && res.data.length > 0) {
          var foodId = res.data[0].foodId || res.data[0].id;
          app.authRequest({
            url: '/review/food/' + foodId,
            method: 'GET',
            success: function(reviewRes) {
              if (reviewRes && reviewRes.code === 200 && reviewRes.data) {
                var dataArray = Array.isArray(reviewRes.data) ? reviewRes.data : [];
                var list = [];
                for (var i = 0; i < dataArray.length; i++) {
                  var r = dataArray[i];
                  list.push({
                    userName: r.userName || r.nickname || '匿名用户',
                    starCount: r.rating || 5,
                    content: r.content || '',
                    time: r.createTime || '',
                    images: r.images || []
                  });
                }
                self.setData({ reviewsList: list });
              } else {
                self.setData({ reviewsList: [] });
              }
            },
            fail: function() {
              self.setData({ reviewsList: [] });
            }
          });
        } else {
          self.setData({ reviewsList: [] });
        }
      },
      fail: function() {
        self.setData({ reviewsList: [] });
      }
    });
  },

  loadCart: function() {
    var self = this;
    var app = getApp();
    var cart = app.globalData.cart || [];
    var cartTotal = 0;
    for (var i = 0; i < cart.length; i++) {
      cartTotal += cart[i].price * cart[i].quantity;
    }
    this.setData({
      cartItems: cart,
      cartCount: app.globalData.cartCount || 0,
      cartTotal: cartTotal
    });
  },

  updateCartDisplay: function() {
    this.loadCart();
  },

  onShow: function() {
    this.updateCartDisplay();
  },

  onPullDownRefresh: function() {
    var self = this;
    this.loadFoods(this.data.storeInfo.id, this.data.currentCategory);
    setTimeout(function() {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  onShareAppMessage: function() {
    var self = this;
    return {
      title: self.data.storeInfo.name + ' - 美食探店',
      path: '/pages/store-detail/store-detail?storeId=' + self.data.storeInfo.id
    };
  }
});
