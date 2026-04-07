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
    // 支付方式
    paymentMethod: 'wechat',
    // 备注信息
    remark: '',
    // 是否正在提交
    isSubmitting: false
  },

  // 页面加载
  onLoad(options) {
    console.log('订单确认页面加载');

    // 获取订单信息
    this.loadOrderInfo();

    // 加载默认地址
    this.loadDefaultAddress();
  },

  // 返回按钮点击
  onBackClick() {
    console.log('返回按钮点击');
    wx.navigateBack({
      delta: 1
    });
  },

  // 首页按钮点击
  onHomeClick() {
    console.log('首页按钮点击');
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 选择地址
  onSelectAddress() {
    console.log('选择地址');
    wx.navigateTo({
      url: '/pages/address/address',
      success: (res) => {
        // 监听地址选择事件
        res.onPageReceive = (data) => {
          if (data.selectedAddress) {
            this.setData({
              selectedAddress: data.selectedAddress
            });
          }
        };
      }
    });
  },

  // 选择优惠券
  onSelectCoupon() {
    console.log('选择优惠券');
    wx.showModal({
      title: '选择优惠券',
      content: '优惠券功能开发中，敬请期待！',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 选择支付方式
  onSelectPayment(e) {
    const paymentMethod = e.currentTarget.dataset.method;
    console.log('选择支付方式：', paymentMethod);

    this.setData({
      paymentMethod: paymentMethod
    });
  },

  // 备注输入
  onRemarkInput(e) {
    const remark = e.detail.value;
    console.log('备注输入：', remark);

    this.setData({
      remark: remark
    });
  },

  // 取消订单
  onCancelOrder() {
    console.log('取消订单');
    wx.navigateBack({
      delta: 1
    });
  },

  // 确认订单
  onConfirmOrder() {
    console.log('确认订单');

    // 验证地址
    if (!this.data.selectedAddress) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      });
      return;
    }

    // 防止重复提交
    if (this.data.isSubmitting) {
      return;
    }

    this.setData({
      isSubmitting: true
    });

    wx.showLoading({
      title: '提交中...'
    });

    // 模拟订单提交
    setTimeout(() => {
      wx.hideLoading();

      // 生成订单号
      const orderNumber = 'ORD' + Date.now();

      // 创建订单数据
      const orderData = {
        orderId: orderNumber,
        orderInfo: this.data.orderInfo,
        address: this.data.selectedAddress,
        paymentMethod: this.data.paymentMethod,
        remark: this.data.remark,
        orderTime: new Date().toISOString(),
        status: 'pending'
      };

      // 保存订单到全局
      const app = getApp();
      if (!app.globalData.orders) {
        app.globalData.orders = [];
      }
      app.globalData.orders.unshift(orderData);

      // 显示成功提示
      wx.showToast({
        title: '订单提交成功',
        icon: 'success',
        duration: 2000
      });

      // 延迟跳转到订单详情
      setTimeout(() => {
        // 清空购物车
        app.globalData.cart = [];
        app.globalData.cartCount = 0;

        // 跳转到订单详情页
        wx.redirectTo({
          url: `/pages/order-detail/order-detail?orderId=${orderNumber}`
        });
      }, 2000);
    }, 1500);
  },

  // 加载订单信息
  loadOrderInfo() {
    const app = getApp();
    const currentOrder = app.globalData.currentOrder;

    if (!currentOrder) {
      wx.showToast({
        title: '订单信息错误',
        icon: 'none'
      });
      wx.navigateBack();
      return;
    }

    // 计算小计
    const subtotal = currentOrder.items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);

    this.setData({
      orderInfo: {
        orderId: currentOrder.orderId,
        items: currentOrder.items,
        store: currentOrder.store,
        subtotal: subtotal.toFixed(2),
        deliveryFee: currentOrder.deliveryFee,
        discount: currentOrder.discount,
        finalAmount: currentOrder.finalAmount
      }
    });
  },

  // 加载默认地址
  loadDefaultAddress() {
    // 模拟获取默认地址
    setTimeout(() => {
      const mockAddress = {
        id: 1,
        name: '张三',
        phone: '13800138000',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技园南区软件产业基地1栋1201室'
      };

      this.setData({
        selectedAddress: mockAddress
      });
    }, 500);
  }
});