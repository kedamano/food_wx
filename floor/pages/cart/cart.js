// 购物车页面逻辑
var app = getApp();

Page({
  data: {
    activeTab: 2,
    cartCount: 0,
    isEditMode: false,
    storeInfo: {
      name: '川味人家',
      distance: '1.2km',
      deliveryTime: '30分钟'
    },
    cartItems: [],
    coupons: [
      { id: 1, name: '新人专享券', discount: 15, condition: '满50可用', minAmount: 50 },
      { id: 2, name: '会员专享券', discount: 10, condition: '满30可用', minAmount: 30 },
      { id: 3, name: '周末特惠券', discount: 20, condition: '满80可用', minAmount: 80 }
    ],
    selectedCoupon: null,
    showCouponModal: false,
    recommendItems: [
      { id: 201, name: '香辣鸡翅', price: 18.00, image: '/images/foods/chicken_wings.png' },
      { id: 202, name: '冰爽可乐', price: 5.00, image: '/images/foods/cola.png' },
      { id: 203, name: '水果沙拉', price: 22.00, image: '/images/foods/fruit_salad.png' },
      { id: 204, name: '经典冰淇淋', price: 8.00, image: '/images/foods/ice_cream.png' }
    ],
    subtotal: '0.00',
    deliveryFee: '5.00',
    discount: '0.00',
    totalAmount: '0.00',
    selectedCount: 0,
    allSelected: false
  },

  onLoad: function () {
    console.log('购物车页面加载');
    this.setData({
      subtotal: '0.00',
      deliveryFee: '5.00',
      discount: '0.00',
      totalAmount: '0.00'
    });
    this.loadCartData();
    this.calculateCosts();
  },

  loadCartData: function () {
    var self = this;
    var app = getApp();

    app.authRequest({
      url: '/cart/user/' + (app.globalData.userId || 1),
      method: 'GET',
      success: function (res) {
        if (res && res.code === 200 && res.data && res.data.length > 0) {
          var cartData = res.data;
          var formattedCartItems = [];
          for (var i = 0; i < cartData.length; i++) {
            var item = cartData[i];
            formattedCartItems.push({
              id: item.foodId,
              name: item.name,
              price: Number(item.price) || 0,
              image: app.resolveImageUrl(item.image) || self.getDefaultFoodImage(item.name),
              quantity: Number(item.quantity) || 0,
              selected: true,
              cartId: item.cartId,
              itemTotal: Number((Number(item.price) || 0) * (Number(item.quantity) || 0)).toFixed(2)
            });
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
    console.log('返回按钮点击');
    wx.navigateBack({ delta: 1 });
  },

  onEditClick: function () {
    var isEditMode = this.data.isEditMode;
    this.setData({ isEditMode: !isEditMode });
    console.log('切换编辑模式：', !isEditMode);
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

    var updatedItems = [];
    for (var i = 0; i < cartItems.length; i++) {
      var item = cartItems[i];
      if (item.id === itemId) {
        var newQuantity = item.quantity - 1;
        if (newQuantity >= 1) {
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
      } else {
        updatedItems.push(item);
      }
    }

    this.setData({ cartItems: updatedItems });
    this.updateGlobalCart(updatedItems);
    this.calculateCosts();
  },

  onQuantityPlus: function (e) {
    var itemId = e.currentTarget.dataset.itemId;
    var cartItems = this.data.cartItems;

    var updatedItems = [];
    for (var i = 0; i < cartItems.length; i++) {
      var item = cartItems[i];
      if (item.id === itemId) {
        var newQuantity = item.quantity + 1;
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
    this.updateGlobalCart(updatedItems);
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
    this.updateGlobalCart(updatedItems);
    this.calculateCosts();
  },

  onDeleteItem: function (e) {
    var itemId = e.currentTarget.dataset.itemId;
    var cartItems = this.data.cartItems;
    var self = this;

    wx.showModal({
      title: '确认删除',
      content: '确定要从购物车中删除这个商品吗？',
      success: function (res) {
        if (res.confirm) {
          var updatedItems = [];
          for (var i = 0; i < cartItems.length; i++) {
            if (cartItems[i].id !== itemId) {
              updatedItems.push(cartItems[i]);
            }
          }

          self.setData({ cartItems: updatedItems });
          self.updateGlobalCart(updatedItems);
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
    for (var j = 0; j < selectedItems.length; j++) {
      var si = selectedItems[j];
      orderItems.push({
        foodId: si.id,
        name: si.name,
        price: si.price,
        image: si.image,
        quantity: si.quantity,
        totalPrice: (si.price * si.quantity).toFixed(2)
      });
    }

    var orderInfo = {
      orderId: Date.now(),
      items: orderItems,
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
        console.log('跳转到订单确认页成功');
      },
      fail: function (err) {
        console.error('跳转失败：', err);
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  onGoShopping: function () {
    console.log('去选购');
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
        storeId: this.data.storeInfo.id || 1
      });
    }
    app.updateCart(globalCart);
  },

  onShow: function () {
    console.log('购物车页面显示');
    this.useGlobalCartData();
    this.calculateCosts();
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
