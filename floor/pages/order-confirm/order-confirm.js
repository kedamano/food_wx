// 订单确认页面逻辑

Page({
  data: {
    // 订单信息
    orderInfo: {
      orderId: '',
      items: [],
      store: {
        name: '',
        deliveryTime: ''
      },
      subtotal: 0,
      deliveryFee: 5,
      discount: 0,
      finalAmount: 0
    },
    // 选中的地址
    selectedAddress: null,
    // 选中的优惠券
    selectedCoupon: null,
    // 优惠券列表
    coupons: [],
    // 优惠券弹窗
    showCouponModal: false,
    // 支付方式
    paymentMethod: 'wechat',
    // 备注信息
    remark: '',
    // 是否正在提交
    isSubmitting: false
  },

  // 页面加载
  onLoad: function(options) {
    var self = this;
    console.log('订单确认页面加载');

    // 获取订单信息
    this.loadOrderInfo();

    // 加载默认地址
    this.loadDefaultAddress();

    // 加载可用优惠券
    this.loadCoupons();
  },

  // 返回按钮点击
  onBackClick: function() {
    console.log('返回按钮点击');
    wx.navigateBack({
      delta: 1
    });
  },

  // 首页按钮点击
  onHomeClick: function() {
    console.log('首页按钮点击');
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 选择地址
  onSelectAddress: function() {
    var self = this;
    console.log('选择地址');
    wx.navigateTo({
      url: '/pages/address/address',
      success: function(res) {
        // 监听地址选择事件
        if (res.onPageReceive) {
          res.onPageReceive(function(data) {
            if (data.selectedAddress) {
              self.setData({
                selectedAddress: data.selectedAddress
              });
            }
          });
        }
      }
    });
  },

  // 打开优惠券选择弹窗
  onSelectCoupon: function() {
    this.setData({ showCouponModal: true });
  },

  // 关闭优惠券选择弹窗
  onCloseCouponModal: function() {
    this.setData({ showCouponModal: false });
  },

  // 选择优惠券
  onChooseCoupon: function(e) {
    var self = this;
    var coupon = e.currentTarget.dataset.coupon;
    var subtotal = parseFloat(this.data.orderInfo.subtotal) || 0;
    var deliveryFee = parseFloat(this.data.orderInfo.deliveryFee) || 0;

    // 不使用优惠券
    if (!coupon) {
      var finalAmount = (subtotal + deliveryFee).toFixed(2);
      this.setData({
        selectedCoupon: null,
        'orderInfo.discount': '0.00',
        'orderInfo.finalAmount': finalAmount
      });
      this.onCloseCouponModal();
      return;
    }

    // 校验使用条件
    if (subtotal < coupon.minAmount) {
      wx.showToast({ title: '还需满' + coupon.minAmount + '元才能使用', icon: 'none' });
      return;
    }

    var discount = Math.min(coupon.discount, subtotal);
    var finalAmount2 = Math.max(0, subtotal + deliveryFee - discount).toFixed(2);

    this.setData({
      selectedCoupon: coupon,
      'orderInfo.discount': discount.toFixed(2),
      'orderInfo.finalAmount': finalAmount2
    });
    this.onCloseCouponModal();

    wx.showToast({ title: '已选择' + coupon.name, icon: 'success' });
  },

  // 选择支付方式
  onSelectPayment: function(e) {
    var paymentMethod = e.currentTarget.dataset.method;
    console.log('选择支付方式：', paymentMethod);

    this.setData({
      paymentMethod: paymentMethod
    });
  },

  // 备注输入
  onRemarkInput: function(e) {
    var remark = e.detail.value;
    console.log('备注输入：', remark);

    this.setData({
      remark: remark
    });
  },

  // 取消订单
  onCancelOrder: function() {
    console.log('取消订单');
    wx.navigateBack({
      delta: 1
    });
  },

  // 确认订单
  onConfirmOrder: function() {
    var self = this;
    console.log('确认订单');

    // 验证地址
    if (!this.data.selectedAddress) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' });
      return;
    }

    // 防止重复提交
    if (this.data.isSubmitting) {
      return;
    }

    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '提交中...' });

    var orderInfo = this.data.orderInfo;
    var address = this.data.selectedAddress;

    // 手动转换 items 数组
    var itemsList = [];
    for (var mi = 0; mi < orderInfo.items.length; mi++) {
      var item = orderInfo.items[mi];
      itemsList.push({
        foodId: item.foodId || item.id,
        foodName: item.name,
        price: parseFloat(item.price) || 0,
        quantity: item.quantity || 1
      });
    }

    var orderData = {
      storeId: orderInfo.store ? orderInfo.store.id : orderInfo.storeId,
      storeName: orderInfo.store ? orderInfo.store.name : orderInfo.storeName || '美食商家',
      totalAmount: parseFloat(orderInfo.subtotal) || 0,
      deliveryFee: parseFloat(orderInfo.deliveryFee) || 5,
      discount: parseFloat(orderInfo.discount) || 0,
      payAmount: parseFloat(orderInfo.finalAmount) || 0,
      receiverName: address.name,
      receiverPhone: address.phone,
      address: (address.province || '') + (address.city || '') + (address.district || '') + (address.detail || ''),
      remark: this.data.remark,
      items: itemsList
    };

    app.authRequest({
      url: '/order',
      method: 'POST',
      data: orderData
    }).then(function(res) {
      wx.hideLoading();
      self.setData({ isSubmitting: false });

      if (res && res.code === 200) {
        var orderId = res.data ? (res.data.orderId || res.data) : Date.now();
        wx.showToast({ title: '订单提交成功', icon: 'success', duration: 2000 });

        // 清空购物车
        app.globalData.cart = [];
        app.globalData.cartCount = 0;

        setTimeout(function() {
          wx.redirectTo({
            url: '/pages/order-detail/order-detail?orderId=' + orderId
          });
        }, 2000);
      } else {
        wx.showToast({ title: res.message || '提交失败', icon: 'none' });
      }
    }).catch(function(err) {
      wx.hideLoading();
      self.setData({ isSubmitting: false });
      console.error('提交订单失败', err);
      wx.showToast({ title: '提交失败', icon: 'none' });
    });
  },

  // 加载订单信息
  loadOrderInfo: function() {
    var self = this;
    var app = getApp();
    var currentOrder = app.globalData.currentOrder;

    if (!currentOrder) {
      wx.showToast({
        title: '订单信息错误',
        icon: 'none'
      });
      wx.navigateBack();
      return;
    }

    // 计算小计，手动 reduce
    var items = currentOrder.items || [];
    var subtotal = 0;
    for (var si = 0; si < items.length; si++) {
      subtotal += parseFloat(items[si].totalPrice || 0);
    }
    subtotal = subtotal.toFixed(2);
    var deliveryFee = currentOrder.deliveryFee || '5.00';
    var discount = currentOrder.discount || '0.00';
    var finalAmount = Math.max(0, parseFloat(subtotal) + parseFloat(deliveryFee) - parseFloat(discount)).toFixed(2);

    this.setData({
      orderInfo: {
        orderId: currentOrder.orderId,
        items: currentOrder.items,
        store: currentOrder.store,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        discount: discount,
        finalAmount: finalAmount
      },
      // 同步购物车选择的优惠券
      selectedCoupon: currentOrder.selectedCoupon || null
    });
  },

  // 加载默认地址（从本地存储读取，后端暂无地址接口）
  loadDefaultAddress: function() {
    var self = this;
    var addresses = wx.getStorageSync('user_addresses') || [];
    if (addresses.length > 0) {
      var defaultAddr = null;
      for (var i = 0; i < addresses.length; i++) {
        if (addresses[i].isDefault) {
          defaultAddr = addresses[i];
          break;
        }
      }
      if (!defaultAddr) defaultAddr = addresses[0];
      this.setData({ selectedAddress: defaultAddr });
    }
  },

  // 加载可用优惠券
  loadCoupons: function() {
    var self = this;
    var app = getApp();
    var userId = app.globalData.userId || wx.getStorageSync('userId') || 1;

    app.authRequest({
      url: '/coupon/user/' + userId,
      method: 'GET'
    }).then(function(res) {
      if (res && res.code === 200 && res.data) {
        var rawList = Array.isArray(res.data) ? res.data : [];
        // 手动 filter + map
        var filtered = [];
        for (var fi = 0; fi < rawList.length; fi++) {
          if (rawList[fi].status === 0) {
            filtered.push(rawList[fi]);
          }
        }
        var list = [];
        for (var mi = 0; mi < filtered.length; mi++) {
          var item = filtered[mi];
          list.push({
            id: item.couponId || item.id,
            name: item.couponName || item.name || '优惠券',
            discount: item.discount || item.amount || 0,
            condition: item.minAmount ? '满' + item.minAmount + '可用' : '无门槛',
            minAmount: item.minAmount || 0
          });
        }
        self.setData({ coupons: list });
      }
    }).catch(function(err) {
      console.error('加载优惠券失败', err);
    });
  }
});
