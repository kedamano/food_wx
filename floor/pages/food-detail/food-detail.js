// 美食详情页逻辑
Page({
  data: {
    // 当前显示的图片索引
    currentImageIndex: 0,
    // 美食信息
    food: {
      id: 0,
      name: '',
      price: 0,
      rating: 0,
      reviews: 0,
      sales: 0,
      monthlySales: 0,
      deliveryTime: '',
      description: '',
      stock: 0,
      images: [],
      tags: {
        hot: false,
        classic: false,
        combo: false,
        healthy: false
      }
    },

    // 商家信息
    store: {
      id: 0,
      name: '',
      logo: '',
      rating: 0,
      monthlySales: 0,
      distance: '',
      deliveryTime: ''
    },

    // 用户评价
    reviews: [],

    // 数量选择
    quantity: 1,

    // 购物车数量
    cartCount: 0,

    // 购物车弹窗
    showCartPopup: false,
    cartPopupItems: [],
    cartPopupCount: 0,
    cartPopupTotal: '0.00',

    // 收藏状态
    isFavorite: false,

    // 加载状态
    isLoading: true
  },

  // 页面加载
  onLoad: function(options) {
    console.log('美食详情页加载，参数：', options);

    // 获取美食ID
    var foodId = options.foodId || 1;

    // 加载美食数据
    this.loadFoodData(foodId);

    // 加载评价数据
    this.loadReviewsData(foodId);

    // 加载商家信息
    this.loadStoreData();

    // 更新购物车数量
    this.updateCartCount();
  },

  onShow: function() {
    // 页面显示时刷新购物车数量
    this.updateCartCount();
  },

  // 图片切换事件
  onImageChange: function(e) {
    var currentIndex = e.detail.current;
    this.setData({
      currentImageIndex: currentIndex
    });
    console.log('切换到图片：', currentIndex + 1);
  },

  // 加载美食数据
  loadFoodData: function(foodId) {
    var self = this;
    wx.showLoading({
      title: '加载中...'
    });

    return new Promise(function(resolve, reject) {
      var app = getApp();
      app.authRequest({
        url: '/food/' + foodId, // 使用新的API系统
        method: 'GET',
        success: function(res) {
          console.log('美食详情响应数据:', res);
          
          // app.authRequest 返回的是 {code, message, data} 格式
          if (res && res.code === 200 && res.data) {
            // 处理后端返回的数据格式
            var foodData = res.data;
            var processedData = {
              id: foodData.foodId || foodData.id || foodId,
              name: foodData.name || '未知美食',
              price: Number(foodData.price) || 0,
              rating: Number(foodData.rating) || 4.5,
              reviews: Number(foodData.reviews) || 0,
              sales: Number(foodData.sales) || 0,
              monthlySales: Number(foodData.monthlySales) || 0,
              deliveryTime: foodData.deliveryTime || '30 分钟',
              description: foodData.description || '暂无描述',
              stock: Number(foodData.stock) || 99,
              image: app.resolveImageUrl(foodData.image) || 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&h=600&fit=crop',
              images: [app.resolveImageUrl(foodData.image) || 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&h=600&fit=crop'],
              tags: self.processTags(foodData.tags)
            };
            
            console.log('处理后的美食数据:', processedData);

            self.setData({
              food: processedData,
              isLoading: false
            });

            wx.hideLoading();
            resolve(processedData);
          } else {
            // API 返回错误，使用默认空数据
            console.log('美食详情加载失败，foodId:', foodId);
            var emptyFoodData = {
              id: foodId,
              name: '暂无数据',
              price: 0,
              rating: 0,
              reviews: 0,
              sales: 0,
              monthlySales: 0,
              deliveryTime: '30 分钟',
              description: '加载失败，请重试',
              stock: 0,
              image: '',
              images: [],
              tags: { hot: false, classic: false, combo: false, healthy: false }
            };

            self.setData({
              food: emptyFoodData,
              isLoading: false
            });
            
            wx.hideLoading();
            resolve(emptyFoodData);
          }
        },
        fail: function(err) {
          console.error('美食详情请求失败:', err);
          wx.hideLoading();
          
          var failFoodData = {
            id: foodId,
            name: '加载失败',
            price: 0,
            rating: 0,
            reviews: 0,
            sales: 0,
            monthlySales: 0,
            deliveryTime: '30 分钟',
            description: '网络错误，请重试',
            stock: 0,
            image: '',
            images: [],
            tags: { hot: false, classic: false, combo: false, healthy: false }
          };

          self.setData({
            food: failFoodData,
            isLoading: false
          });
          
          resolve(failFoodData);
        }
      });
    });
  },

  // 处理标签数据
  processTags: function(tags) {
    if (!tags) {
      return {
        hot: true,
        classic: true,
        combo: false,
        healthy: false
      };
    }
    
    // 如果 tags 是数组格式
    if (Array.isArray(tags)) {
      var result = {};
      var hot = false;
      var classic = false;
      var combo = false;
      var healthy = false;
      
      for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];
        if (tag === '热销' || tag === 'hot') {
          hot = true;
        }
        if (tag === '经典' || tag === 'classic') {
          classic = true;
        }
        if (tag === '套餐' || tag === 'combo') {
          combo = true;
        }
        if (tag === '健康' || tag === 'healthy') {
          healthy = true;
        }
      }
      
      return {
        hot: hot,
        classic: classic,
        combo: combo,
        healthy: healthy
      };
    }
    
    // 如果 tags 是对象格式
    return {
      hot: tags.hot || false,
      classic: tags.classic || false,
      combo: tags.combo || false,
      healthy: tags.healthy || false
    };
  },

  // 加载评价数据
  loadReviewsData: function(foodId) {
    if (!foodId) {
      this.setData({ reviews: [] });
      return;
    }
    
    var self = this;
    var app = getApp();
    app.authRequest({
      url: '/review/food/' + foodId,
      method: 'GET',
      success: function(res) {
        if (res && res.code === 200) {
          var reviews = res.data || [];
          self.setData({ reviews: reviews });
        } else {
          self.setData({ reviews: [] });
        }
      },
      fail: function() {
        self.setData({ reviews: [] });
      }
    });
  },

  // 加载商家数据
  loadStoreData: function() {
    var self = this;
    var app = getApp();
    app.authRequest({
      url: '/store/all',
      method: 'GET',
      success: function(res) {
        if (res && res.code === 200 && res.data && res.data.length > 0) {
          var storeData = res.data[0];
          self.setData({
            store: {
              id: storeData.storeId || storeData.id || 1,
              name: storeData.name || storeData.storeName || '商家',
              logo: app.resolveImageUrl ? app.resolveImageUrl(storeData.logo || storeData.image) : (storeData.logo || storeData.image || ''),
              rating: Number(storeData.rating) || 4.5,
              monthlySales: storeData.sales || 0,
              distance: '1.2km',
              deliveryTime: '30分钟'
            }
          });
        }
      },
      fail: function() {
        // 静默失败，使用默认空值
      }
    });
  },

  // 数量减少
  onQuantityMinus: function() {
    var currentQuantity = this.data.quantity;
    if (currentQuantity > 1) {
      this.setData({
        quantity: currentQuantity - 1
      });
      this.updateTotalPrice();
    } else {
      wx.showToast({
        title: '数量不能小于1',
        icon: 'none'
      });
    }
  },

  // 数量增加
  onQuantityPlus: function() {
    var currentQuantity = this.data.quantity;
    var stock = this.data.food.stock;

    if (currentQuantity < stock) {
      this.setData({
        quantity: currentQuantity + 1
      });
      this.updateTotalPrice();
    } else {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      });
    }
  },

  // 数量输入变化
  onQuantityChange: function(e) {
    var inputValue = parseInt(e.detail.value);
    var stock = this.data.food.stock;

    if (inputValue < 1) {
      this.setData({
        quantity: 1
      });
      wx.showToast({
        title: '数量不能小于1',
        icon: 'none'
      });
    } else if (inputValue > stock) {
      this.setData({
        quantity: stock
      });
      wx.showToast({
        title: '库存只有' + stock + '份',
        icon: 'none'
      });
    } else {
      this.setData({
        quantity: inputValue
      });
    }

    this.updateTotalPrice();
  },

  // 更新总价
  updateTotalPrice: function() {
    var food = this.data.food;
    var quantity = this.data.quantity;
    var totalPrice = (food.price * quantity).toFixed(2);
    console.log('总价更新：', totalPrice);
    // 这里可以更新UI显示总价
  },

  // 返回按钮点击
  onBackClick: function() {
    console.log('返回按钮点击');
    wx.navigateBack({
      delta: 1
    });
  },

  // 收藏按钮点击
  onFavoriteClick: function() {
    var isFavorite = this.data.isFavorite;
    var newFavoriteStatus = !isFavorite;

    this.setData({
      isFavorite: newFavoriteStatus
    });

    wx.showToast({
      title: newFavoriteStatus ? '已收藏' : '已取消收藏',
      icon: 'success'
    });

    // 更新收藏状态到服务器
    this.updateFavoriteStatus(newFavoriteStatus);
  },

  // 更新收藏状态
  updateFavoriteStatus: function(isFavorite) {
    // 实际项目中应该调用API更新收藏状态
    console.log('更新收藏状态：', isFavorite);
  },

  // 购物车按钮点击 - 弹出购物车详情弹窗
  onCartClick: function() {
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

  // 隐藏购物车弹窗
  hideCartPopup: function() {
    this.setData({ showCartPopup: false });
  },

  // 购物车商品数量减少
  onCartItemMinus: function(e) {
    var index = e.currentTarget.dataset.index;
    var app = getApp();
    var cart = app.globalData.cart || [];

    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
    } else {
      // 数量为1时删除
      cart.splice(index, 1);
    }

    app.globalData.cart = cart;
    var cartCount = 0;
    for (var i = 0; i < cart.length; i++) {
      cartCount += cart[i].quantity;
    }
    app.globalData.cartCount = cartCount;
    this.refreshCartPopup(cart);
    this.updateCartCount();
  },

  // 购物车商品数量增加
  onCartItemPlus: function(e) {
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
    this.updateCartCount();
  },

  // 清空购物车
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
    this.updateCartCount();
    wx.showToast({ title: '已清空购物车', icon: 'none' });
  },

  // 刷新购物车弹窗数据
  refreshCartPopup: function(cart) {
    var totalCount = 0;
    var totalPrice = 0;
    for (var i = 0; i < cart.length; i++) {
      totalCount += cart[i].quantity;
      totalPrice += cart[i].price * cart[i].quantity;
    }
    // 预计算每项小计，WXML 不支持 .toFixed()
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

  // 跳转到购物车页面
  goToCart: function() {
    this.setData({ showCartPopup: false });
    wx.switchTab({ url: '/pages/cart/cart' });
  },

  // 加入购物车
  onAddToCart: function() {
    var food = this.data.food;
    var quantity = this.data.quantity;

    // 验证库存
    if (quantity > food.stock) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      });
      return;
    }

    // 添加到购物车
    var cartItem = {
      foodId: food.id,
      name: food.name,
      price: food.price,
      image: food.images[0] || '',
      quantity: quantity,
      storeId: this.data.store.id
    };

    // 获取现有购物车数据
    var app = getApp();
    var cart = app.globalData.cart || [];

    // 检查是否已存在
    var existingItemIndex = -1;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].foodId === food.id) {
        existingItemIndex = i;
        break;
      }
    }
    if (existingItemIndex !== -1) {
      // 更新数量
      cart[existingItemIndex].quantity += quantity;
    } else {
      // 添加新商品
      cart.push(cartItem);
    }

    // 使用 app.updateCart 统一更新，自动保存到本地存储
    app.updateCart(cart);

    // 更新购物车数量显示
    this.updateCartCount();

    // 显示成功提示
    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 2000
    });

    console.log('添加到购物车：', cartItem);
  },

  // 立即购买
  onBuyNow: function() {
    var food = this.data.food;
    var quantity = this.data.quantity;
    var store = this.data.store;

    // 验证库存
    if (quantity > food.stock) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      });
      return;
    }

    // 验证商家信息
    if (!store.id) {
      wx.showToast({
        title: '商家信息加载中，请稍后再试',
        icon: 'none'
      });
      return;
    }

    // 创建订单信息
    var orderInfo = {
      orderId: Date.now(), // 临时订单ID
      items: [{
        foodId: food.id,
        name: food.name,
        price: food.price,
        image: food.images[0] || '',
        quantity: quantity,
        totalPrice: (food.price * quantity).toFixed(2)
      }],
      store: store,
      totalAmount: (food.price * quantity).toFixed(2),
      deliveryFee: 5.00, // 配送费
      discount: 0,
      finalAmount: (food.price * quantity + 5).toFixed(2),
      orderTime: new Date().toISOString()
    };

    // 验证订单金额
    if (parseFloat(orderInfo.finalAmount) <= 0) {
      wx.showToast({
        title: '订单金额错误',
        icon: 'none'
      });
      return;
    }

    // 存储订单信息到全局
    var app = getApp();
    app.globalData.currentOrder = orderInfo;

    // 跳转到订单确认页
    wx.navigateTo({
      url: '/pages/order-confirm/order-confirm',
      success: function() {
        console.log('跳转到订单确认页成功');
      },
      fail: function(err) {
        console.error('跳转失败：', err);
        wx.showToast({
          title: '页面跳转失败，请重试',
          icon: 'none'
        });
        // 清除订单信息
        app.globalData.currentOrder = null;
      }
    });
  },

  // 查看商家信息
  onStoreInfoClick: function() {
    var storeId = this.data.store.id;
    console.log('查看商家信息：', storeId);
    
    // 直接尝试跳转，商家详情页已存在
    wx.navigateTo({
      url: '/pages/store-detail/store-detail?storeId=' + storeId,
      success: function(res) {
        console.log('跳转到商家详情页成功');
      },
      fail: function(err) {
        console.error('跳转失败：', err);
        
        // 如果页面不存在，显示模拟商家信息
        if (err.errMsg.indexOf('no such file or directory') !== -1) {
          wx.showModal({
            title: '商家信息',
            content: '商家ID: ' + storeId + '\n商家名称: 川味人家\n评分: 4.7\n配送时间: 30分钟\n距离: 1.2km',
            showCancel: false
          });
        } else {
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 查看全部评价
  onViewAllReviews: function() {
    console.log('查看全部评价');
    wx.navigateTo({
      url: '/pages/reviews/reviews?foodId=' + this.data.food.id
    });
  },

  // 更新购物车数量
  updateCartCount: function() {
    var app = getApp();
    var cartCount = app.globalData.cartCount || 0;

    this.setData({
      cartCount: cartCount
    });
  },

  // 分享功能
  onShareAppMessage: function() {
    var food = this.data.food;
    return {
      title: '【' + food.name + '】¥' + food.price + ' - 美食小程序',
      path: '/pages/food-detail/food-detail?foodId=' + food.id
    };
  }
});