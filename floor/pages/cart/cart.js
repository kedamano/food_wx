// 购物车页面逻辑
var app = getApp();

Page({
  data: {
    activeTab: 2,
    cartCount: 0,
    isEditMode: false,
    storeInfo: {
      name: '',
      distance: '',
      deliveryTime: ''
    },
    cartItems: [],
    coupons: [],
    selectedCoupon: null,
    showCouponModal: false,
    recommendItems: [],
    subtotal: '0.00',
    deliveryFee: '5.00',
    discount: '0.00',
    totalAmount: '0.00',
    selectedCount: 0,
    allSelected: false
  },

  onLoad: function () {
    this.setData({
      subtotal: '0.00',
      deliveryFee: '5.00',
      discount: '0.00',
      totalAmount: '0.00'
    });
    this.loadCartData();
    this.loadCoupons();
    this.calculateCosts();
  },

  // 从后端加载本人可用优惠券（替换原写死的 3 张假券）
  loadCoupons: function () {
    var self = this;
    var app = getApp();
    if (!app.isLoggedIn()) {
      self.setData({ coupons: [] });
      return;
    }
    app.authRequest({
      url: '/coupon/user/' + app.getCurrentUserId(),
      method: 'GET'
    }).then(function (res) {
      if (res && res.code === 200 && Array.isArray(res.data)) {
        var list = [];
        for (var i = 0; i < res.data.length; i++) {
          var item = res.data[i];
          if (item.status !== 'available') continue;
          list.push({
            id: item.id, // 用户优惠券ID
            name: item.name || '优惠券',
            discount: Number(item.discount) || 0,
            condition: item.condition || '无门槛',
            minAmount: Number(item.minAmount) || 0
          });
        }
        self.setData({ coupons: list });
      }
    }).catch(function () {
      self.setData({ coupons: [] });
    });
  },

  // 按店铺 id 拉取店铺名，替换写死的"川味人家"
  loadStoreInfo: function (storeId) {
    var self = this;
    if (!storeId) return;
    app.authRequest({
      url: '/store/' + storeId,
      method: 'GET'
    }).then(function (res) {
      if (res && res.code === 200 && res.data) {
        self.setData({
          'storeInfo.name': res.data.storeName || res.data.name || '',
          'storeInfo.deliveryTime': (res.data.deliveryTime || '') + (res.data.deliveryTime ? '分钟' : '')
        });
      }
    }).catch(function () {});
  },

  loadCartData: function () {
    var self = this;
    var app = getApp();

    // 未登录时使用本地购物车（登录后会自动合并到服务端）
    if (!app.isLoggedIn()) {
      self.useGlobalCartData();
      return;
    }

    app.authRequest({
      url: '/cart/user/' + app.getCurrentUserId(),
      method: 'GET',
      success: function (res) {
        if (res && res.code === 200 && res.data && res.data.length > 0) {
          var cartData = res.data;
          var formattedCartItems = [];
          for (var i = 0; i < cartData.length; i++) {
            var item = cartData[i];
            formattedCartItems.push({
              id: item.foodId,
              name: item.foodName || item.name,
              price: Number(item.foodPrice) || Number(item.price) || 0,
              image: app.resolveImageUrl(item.foodImage || item.image) || self.getDefaultFoodImage(item.foodName),
              quantity: Number(item.quantity) || 0,
              selected: true,
              cartId: item.cartId,
              storeId: item.storeId,
              itemTotal: ((Number(item.foodPrice) || Number(item.price) || 0) * (Number(item.quantity) || 0)).toFixed(2)
            });
          }

          // 从购物车数据中提取 storeId 更新到 storeInfo
          var firstStoreId = cartData[0].storeId;
          if (firstStoreId) {
            self.setData({ 'storeInfo.id': firstStoreId });
            self.loadStoreInfo(firstStoreId);
          }

          self.setData({
            cartItems: formattedCartItems
          }, function () {
            self.calculateCosts();
          });

          var totalCount = 0;
          for (var j = 0; j < cartData.length; j++) {
            totalCount += (Number(cartData[j].quantity) || 0);
          }
          app.globalData.cartCount = totalCount;
        } else {
          // 服务端购物车为空时回退本地
          self.useGlobalCartData();
        }
      },
      fail: function (err) {
        console.error('购物车请求失败:', err);
        self.useGlobalCartData();
      }
    });
  },

  useGlobalCartData: function () {
    var self = this;
    var app = getApp();
    var cart = app.globalData.cart || [];

    var formattedCartItems = [];
    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      formattedCartItems.push({
        id: item.foodId,
        name: item.name,
        price: Number(item.price) || 0,
        image: app.resolveImageUrl(item.image) || self.getDefaultFoodImage(item.name),
        quantity: Number(item.quantity) || 0,
        selected: true,
        storeId: item.storeId,
        itemTotal: Number((Number(item.price) || 0) * (Number(item.quantity) || 0)).toFixed(2)
      });
    }

    self.setData({
      cartItems: formattedCartItems
    }, function () {
      self.calculateCosts();
    });

    var totalCount = 0;
    for (var j = 0; j < cart.length; j++) {
      totalCount += (Number(cart[j].quantity) || 0);
    }
    app.globalData.cartCount = totalCount;
  },

  onBackClick: function () {
    wx.navigateBack({ delta: 1 });
  },

  onEditClick: function () {
    var isEditMode = this.data.isEditMode;
    this.setData({ isEditMode: !isEditMode });
  },

  onItemSelect: function (e) {
    var itemId = e.currentTarget.dataset.itemId;
    var selected = e.detail.value;
    var cartItems = this.data.cartItems;

    var updatedItems = [];
    for (var i = 0; i < cartItems.length; i++) {
      var item = cartItems[i];
      if (item.id === itemId) {
        var newItem = {};
        for (var key in item) {
          newItem[key] = item[key];
        }
        newItem.selected = selected;
        updatedItems.push(newItem);
      } else {
        updatedItems.push(item);
      }
    }

    this.setData({ cartItems: updatedItems });
    this.calculateCosts();
  },

  onSelectAll: function (e) {
    var selected = e.detail.value;
    var cartItems = this.data.cartItems;

    var updatedItems = [];
    for (var i = 0; i < cartItems.length; i++) {
      var item = cartItems[i];
      var newItem = {};
      for (var key in item) {
        newItem[key] = item[key];
      }
      newItem.selected = selected;
      updatedItems.push(newItem);
    }

    this.setData({
      cartItems: updatedItems,
      allSelected: selected
    });
    this.calculateCosts();
  },

  onQuantityMinus: function (e) {
    var itemId = e.currentTarget.dataset.itemId;
    var cartItems = this.data.cartItems;

    // 局部 setData：只更新目标项的数量与小计，避免整组数组重渲染
    for (var i = 0; i < cartItems.length; i++) {
      if (cartItems[i].id === itemId) {
        var newQuantity = cartItems[i].quantity - 1;
        if (newQuantity >= 1) {
          this.setData({
            ['cartItems[' + i + '].quantity']: newQuantity,
            ['cartItems[' + i + '].itemTotal']: (cartItems[i].price * newQuantity).toFixed(2)
          });
        }
        break;
      }
    }
    this.syncQuantityChange(itemId);
    this.calculateCosts();
  },

  onQuantityPlus: function (e) {
    var itemId = e.currentTarget.dataset.itemId;
    var cartItems = this.data.cartItems;

    for (var i = 0; i < cartItems.length; i++) {
      if (cartItems[i].id === itemId) {
        var newQuantity = cartItems[i].quantity + 1;
        this.setData({
          ['cartItems[' + i + '].quantity']: newQuantity,
          ['cartItems[' + i + '].itemTotal']: (cartItems[i].price * newQuantity).toFixed(2)
        });
        break;
      }
    }
    this.syncQuantityChange(itemId);
    this.calculateCosts();
  },

  onQuantityChange: function (e) {
    var itemId = e.currentTarget.dataset.itemId;
    var newQuantity = parseInt(e.detail.value);
    var cartItems = this.data.cartItems;

    if (newQuantity < 1) {
      wx.showToast({ title: '数量不能小于 1', icon: 'none' });
      return;
    }

    var updatedItems = [];
    for (var i = 0; i < cartItems.length; i++) {
      var item = cartItems[i];
      if (item.id === itemId) {
        var newItem = {};
        for (var key in item) {
          newItem[key] = item[key];
        }
        newItem.quantity = newQuantity;
        newItem.itemTotal = (item.price * newQuantity).toFixed(2);
        updatedItems.push(newItem);
      } else {
        updatedItems.push(item);
      }
    }

    this.setData({ cartItems: updatedItems });
    this.syncQuantityChange(itemId);
    this.calculateCosts();
  },

  onDeleteItem: function (e) {
    var itemId = e.currentTarget.dataset.itemId;
    var cartItems = this.data.cartItems;
    var self = this;
    var app = getApp();

    wx.showModal({
      title: '确认删除',
      content: '确定要从购物车中删除这个商品吗？',
      success: function (res) {
        if (res.confirm) {
          // 找到被删项的 cartId，登录态下同步删除服务端
          var deletedCartId = null;
          for (var d = 0; d < cartItems.length; d++) {
            if (cartItems[d].id === itemId) {
              deletedCartId = cartItems[d].cartId;
              break;
            }
          }
          app.removeFromCart(itemId, deletedCartId);

          var updatedItems = [];
          for (var i = 0; i < cartItems.length; i++) {
            if (cartItems[i].id !== itemId) {
              updatedItems.push(cartItems[i]);
            }
          }

          self.setData({ cartItems: updatedItems });
          self.calculateCosts();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  onSelectCoupon: function () {
    this.setData({ showCouponModal: true });
  },

  onCloseCouponModal: function () {
    this.setData({ showCouponModal: false });
  },

  onChooseCoupon: function (e) {
    var coupon = e.currentTarget.dataset.coupon;
    var subtotal = parseFloat(this.data.subtotal) || 0;

    if (!coupon) {
      this.setData({ selectedCoupon: null });
      this.calculateCosts();
      this.onCloseCouponModal();
      return;
    }

    if (subtotal < coupon.minAmount) {
      wx.showToast({ title: '还需满' + coupon.minAmount + '元才能使用', icon: 'none' });
      return;
    }

    this.setData({ selectedCoupon: coupon });
    this.calculateCosts();
    this.onCloseCouponModal();
    wx.showToast({ title: '已选择' + coupon.name, icon: 'success' });
  },

  onAddRecommend: function (e) {
    var item = e.currentTarget.dataset.item;
    var app = getApp();

    // 检查是否已在购物车中
    var existingIndex = -1;
    for (var i = 0; i < this.data.cartItems.length; i++) {
      if (this.data.cartItems[i].id === item.id) {
        existingIndex = i;
        break;
      }
    }

    if (existingIndex >= 0) {
      wx.showToast({ title: '已在购物车中', icon: 'none' });
      return;
    }

    var newItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      selected: true,
      itemTotal: item.price.toFixed(2)
    };

    // 用 concat 代替 [...arr, item]
    var updatedItems = this.data.cartItems.concat([newItem]);

    this.setData({ cartItems: updatedItems });
    this.updateGlobalCart(updatedItems);
    this.calculateCosts();
    wx.showToast({ title: '已添加到购物车', icon: 'success' });
  },

  onSettle: function () {
    var self = this;
    var selectedItems = [];
    for (var i = 0; i < this.data.cartItems.length; i++) {
      if (this.data.cartItems[i].selected) {
        selectedItems.push(this.data.cartItems[i]);
      }
    }

    if (selectedItems.length === 0) {
      wx.showToast({ title: '请先选择商品', icon: 'none' });
      return;
    }

    var subtotalNum = parseFloat(this.data.subtotal) || 0;
    var deliveryFeeNum = parseFloat(this.data.deliveryFee) || 0;
    var discountNum = parseFloat(this.data.discount) || 0;
    var finalAmount = Math.max(0, subtotalNum + deliveryFeeNum - discountNum).toFixed(2);

    var orderItems = [];
    var cartIds = [];
    for (var j = 0; j < selectedItems.length; j++) {
      var si = selectedItems[j];
      orderItems.push({
        foodId: si.id,
        cartId: si.cartId,
        name: si.name,
        price: si.price,
        image: si.image,
        quantity: si.quantity,
        totalPrice: (si.price * si.quantity).toFixed(2)
      });
      if (si.cartId) {
        cartIds.push(si.cartId);
      }
    }

    var orderInfo = {
      orderId: Date.now(),
      items: orderItems,
      cartIds: cartIds,
      storeId: self.data.storeInfo.id || (selectedItems[0] && selectedItems[0].storeId) || 1,
      store: self.data.storeInfo,
      subtotal: self.data.subtotal,
      totalAmount: self.data.totalAmount,
      deliveryFee: self.data.deliveryFee,
      discount: self.data.discount,
      finalAmount: finalAmount,
      selectedCoupon: self.data.selectedCoupon,
      orderTime: new Date().toISOString()
    };

    app.globalData.currentOrder = orderInfo;

    wx.navigateTo({
      url: '/pages/order-confirm/order-confirm',
      success: function (res) {
      },
      fail: function (err) {
        console.error('跳转失败：', err);
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  onGoShopping: function () {
    wx.switchTab({ url: '/pages/index/index' });
  },

  calculateCosts: function () {
    var cartItems = this.data.cartItems || [];
    var selectedCoupon = this.data.selectedCoupon;

    var subtotal = 0;
    var selectedCount = 0;
    for (var i = 0; i < cartItems.length; i++) {
      if (cartItems[i].selected) {
        var price = Number(cartItems[i].price) || 0;
        var quantity = Number(cartItems[i].quantity) || 0;
        subtotal += price * quantity;
        selectedCount += quantity;
      }
    }

    var deliveryFee = this.calculateDeliveryFee();

    var discount = 0;
    if (selectedCoupon && subtotal >= selectedCoupon.minAmount) {
      discount = Math.min(selectedCoupon.discount, subtotal);
    }

    var totalAmount = Math.max(0, subtotal + deliveryFee - discount);

    var allSelected = true;
    if (cartItems.length === 0) {
      allSelected = false;
    } else {
      for (var j = 0; j < cartItems.length; j++) {
        if (!cartItems[j].selected) {
          allSelected = false;
          break;
        }
      }
    }

    this.setData({
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      discount: discount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      selectedCount: selectedCount,
      allSelected: allSelected
    });
  },

  calculateDeliveryFee: function () {
    var distance = parseFloat(this.data.storeInfo.distance);
    if (isNaN(distance)) {
      return 5; // 距离未知时的默认配送费
    }
    if (distance <= 1) {
      return 3;
    } else if (distance <= 2) {
      return 5;
    } else if (distance <= 3) {
      return 7;
    } else {
      return 10;
    }
  },

  /**
   * 数量变更后同步：更新全局缓存，登录态下再同步到服务端
   */
  syncQuantityChange: function (itemId) {
    var target = null;
    for (var i = 0; i < this.data.cartItems.length; i++) {
      if (this.data.cartItems[i].id === itemId) {
        target = this.data.cartItems[i];
        break;
      }
    }
    if (!target) return;
    this.updateGlobalCart(this.data.cartItems);
    app.updateCartItemQuantity(target.id, target.quantity, target.cartId);
  },

  updateGlobalCart: function (cartItems) {
    var globalCart = [];
    for (var i = 0; i < cartItems.length; i++) {
      var item = cartItems[i];
      globalCart.push({
        foodId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        storeId: item.storeId || this.data.storeInfo.id || 1,
        cartId: item.cartId
      });
    }
    app.updateCart(globalCart);
  },

  onShow: function () {
    // 登录态以服务端购物车为准，未登录使用本地
    if (app.isLoggedIn()) {
      this.loadCartData();
    } else {
      this.useGlobalCartData();
      this.calculateCosts();
    }
  },

  onShareAppMessage: function () {
    return {
      title: '美食小程序 - 购物车',
      path: '/pages/cart/cart'
    };
  },

  onImageError: function (e) {
    var index = e.currentTarget.dataset.index;
    console.error('商品图片加载失败，索引:', index);
    var cartItems = this.data.cartItems;
    if (cartItems[index]) {
      cartItems[index].imageError = true;
      this.setData({ cartItems: cartItems });
    }
  },

  onRecommendImageError: function (e) {
    var index = e.currentTarget.dataset.index;
    console.error('推荐商品图片加载失败，索引:', index);
    var recommendItems = this.data.recommendItems;
    if (recommendItems[index]) {
      recommendItems[index].imageError = true;
      this.setData({ recommendItems: recommendItems });
    }
  },

  getDefaultFoodImage: function (foodName) {
    var imageMap = {
      '牛肉面': '/images/foods/beef_noodles.png',
      '汉堡': '/images/foods/beef_burger.png',
      '鸡翅': '/images/foods/chicken_wings.png',
      '可乐': '/images/foods/cola.png',
      '沙拉': '/images/foods/salad.png',
      '水果沙拉': '/images/foods/fruit_salad.png',
      '冰淇淋': '/images/foods/ice_cream.png',
      '宫保鸡丁': '/images/foods/kung_pao_chicken.png',
      '麻辣香锅': '/images/foods/mala_xiangguo.png',
      '披萨': '/images/foods/cheese_pizza.png',
      '川菜': '/images/foods/sichuan_cuisine.png'
    };

    var keys = Object.keys(imageMap);
    for (var i = 0; i < keys.length; i++) {
      if (foodName && foodName.indexOf(keys[i]) !== -1) {
        return imageMap[keys[i]];
      }
    }

    return '/images/foods/beef_noodles.png';
  }
});
