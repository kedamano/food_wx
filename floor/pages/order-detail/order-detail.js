// 订单详情页面逻辑
var app = getApp();

Page({
  data: {
    // 订单信息
    orderInfo: {
      orderId: '',
      status: '',
      statusText: '',
      subtotal: 0,
      deliveryFee: 0,
      discount: 0,
      finalAmount: 0,
      items: [],
      address: {
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: ''
      },
      store: {
        name: '',
        distance: ''
      }
    },
    // 配送信息
    deliveryInfo: {
      name: '',
      phone: '',
      avatar: '',
      progress: '',
      estimatedTime: ''
    },
    // 状态步骤
    statusSteps: [],
    // 状态图标
    statusIcon: 'fa-hourglass-half', statusIconText: 'â³',
    // 状态描述
    statusDesc: ''
  },

  // 页面加载
  onLoad: function(options) {
    var self = this;

    // 获取订单ID
    var orderId = options.orderId;
    if (!orderId) {
      wx.showToast({ title: '缺少订单参数', icon: 'none' });
      setTimeout(function() { wx.navigateBack(); }, 1500);
      return;
    }

    // 加载订单详情
    this.loadOrderDetail(orderId);
  },

  // 返回按钮点击
  onBackClick: function() {
    wx.navigateBack({
      delta: 1
    });
  },

  // 分享订单（wxml 用 open-type="share" 触发）
  onShareAppMessage: function() {
    var orderInfo = this.data.orderInfo || {};
    var storeName = (orderInfo.store && orderInfo.store.name) || '美食订单';
    return {
      title: '我在' + storeName + '点了一份外卖，快来看看',
      path: '/pages/index/index'
    };
  },

  // 联系骑手
  onContactDelivery: function() {
    var self = this;
    var orderId = this.data.orderInfo.orderId;

    wx.showLoading({ title: '加载中...' });

    app.authRequest({
      url: '/order/' + orderId,
      method: 'GET'
    }).then(function(res) {
      wx.hideLoading();
      if (res && res.code === 200 && res.data) {
        var riderName = res.data.riderName || '配送员';
        var riderPhone = res.data.riderPhone || '暂无电话';
        wx.showModal({
          title: '联系骑手',
          content: '骑手：' + riderName + '\n电话：' + riderPhone,
          success: function(res) {
            if (res.confirm && riderPhone !== '暂无电话') {
              wx.makePhoneCall({ phoneNumber: riderPhone });
            }
          }
        });
      } else {
        wx.showToast({ title: '暂无骑手信息', icon: 'none' });
      }
    }).catch(function(err) {
      wx.hideLoading();
      console.error('获取骑手信息失败', err);
      wx.showToast({ title: '获取骑手信息失败', icon: 'none' });
    });
  },

  // 复制订单号
  onCopyOrderId: function() {
    var self = this;
    wx.setClipboardData({
      data: this.data.orderInfo.orderId,
      success: function() {
        wx.showToast({
          title: '订单号已复制',
          icon: 'success'
        });
      }
    });
  },

  // 取消订单
  onCancelOrder: function() {
    var self = this;
    var orderId = this.data.orderInfo.orderId;
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          app.authRequest({
            url: '/order/' + orderId + '/cancel',
            method: 'PUT'
          }).then(function(res) {
            wx.hideLoading();
            if (res && res.code === 200) {
              wx.showToast({ title: '订单已取消', icon: 'success' });
              self.setData({
                'orderInfo.status': '已取消',
                'orderInfo.statusText': '已取消'
              });
              setTimeout(function() { wx.navigateBack(); }, 1500);
            } else {
              wx.showToast({ title: res.message || '取消失败', icon: 'none' });
            }
          }).catch(function(err) {
            wx.hideLoading();
            console.error('取消订单失败', err);
            wx.showToast({ title: '取消失败', icon: 'none' });
          });
        }
      }
    });
  },

  // 支付订单
  onPayOrder: function() {
    var self = this;
    var orderId = this.data.orderInfo.orderId;
    wx.showLoading({ title: '获取支付参数...' });

    // 先向后端要支付参数：mode=wechat 走真实微信支付，mode=mock 走模拟支付
    app.authRequest({
      url: '/order/' + orderId + '/pay-params',
      method: 'POST'
    }).then(function(res) {
      wx.hideLoading();
      if (!res || res.code !== 200 || !res.data) {
        wx.showToast({ title: (res && res.message) || '获取支付参数失败', icon: 'none' });
        return;
      }

      if (res.data.mode === 'wechat') {
        self.requestWechatPay(orderId, res.data);
      } else {
        self.requestMockPay(orderId);
      }
    }).catch(function(err) {
      wx.hideLoading();
      console.error('获取支付参数失败', err);
      wx.showToast({ title: '获取支付参数失败', icon: 'none' });
    });
  },

  // 真实微信支付
  requestWechatPay: function(orderId, payParams) {
    var self = this;
    wx.requestPayment({
      timeStamp: payParams.timeStamp,
      nonceStr: payParams.nonceStr,
      package: payParams.package,
      signType: payParams.signType || 'MD5',
      paySign: payParams.paySign,
      success: function() {
        wx.showToast({ title: '支付成功', icon: 'success' });
        self.loadOrderDetail(orderId);
      },
      fail: function(err) {
        console.error('微信支付失败', err);
        // 用户取消或支付失败后轮询一次订单状态，回调可能已到账
        setTimeout(function() { self.loadOrderDetail(orderId); }, 1500);
        if (err && err.errMsg && err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '支付未完成', icon: 'none' });
        }
      }
    });
  },

  // 模拟支付（后端未配置微信支付商户号时的降级路径）
  requestMockPay: function(orderId) {
    var self = this;
    wx.showLoading({ title: '支付中...' });
    app.authRequest({
      url: '/order/' + orderId + '/pay',
      method: 'PUT'
    }).then(function(res) {
      wx.hideLoading();
      if (res && res.code === 200) {
        wx.showToast({ title: '支付成功', icon: 'success' });
        self.setData({
          'orderInfo.status': '制作中',
          'orderInfo.statusText': '制作中'
        });
        self.loadOrderDetail(orderId);
      } else {
        wx.showToast({ title: res.message || '支付失败', icon: 'none' });
      }
    }).catch(function(err) {
      wx.hideLoading();
      console.error('支付失败', err);
      wx.showToast({ title: '支付失败', icon: 'none' });
    });
  },

  // 催单
  onRemindOrder: function() {
    var self = this;
    var orderId = this.data.orderInfo.orderId;

    app.authRequest({
      url: '/order/' + orderId + '/remind',
      method: 'PUT'
    }).then(function(res) {
      if (res && res.code === 200) {
        wx.showToast({ title: '已提醒商家', icon: 'success' });
      } else {
        wx.showToast({ title: res.message || '催单失败', icon: 'none' });
      }
    }).catch(function(err) {
      console.error('催单失败', err);
      wx.showToast({ title: '催单失败', icon: 'none' });
    });
  },

  // 查看配送
  onTrackDelivery: function() {
    var self = this;
    var orderId = this.data.orderInfo.orderId;

    wx.showLoading({ title: '加载中...' });

    app.authRequest({
      url: '/order/' + orderId,
      method: 'GET'
    }).then(function(res) {
      wx.hideLoading();
      if (res && res.code === 200 && res.data) {
        var order = res.data;
        var trackingData = {
          orderId: orderId,
          status: order.status || '配送中',
          progress: 65,
          rider: {
            name: order.riderName || '配送员',
            phone: order.riderPhone || '',
            avatar: '/images/foods/rider_avatar.png',
            rating: 4.8
          },
          estimatedTime: order.estimatedTime || '30分钟',
          steps: [
            { name: '商家取餐', completed: true, time: '' },
            { name: '配送中', completed: false, active: true, time: '' },
            { name: '即将送达', completed: false, time: '' },
            { name: '已送达', completed: false, time: '' }
          ]
        };
        wx.navigateTo({
          url: '/pages/delivery-track/delivery-track?orderId=' + orderId + '&trackingData=' + encodeURIComponent(JSON.stringify(trackingData))
        });
      } else {
        wx.showToast({ title: '获取配送信息失败', icon: 'none' });
      }
    }).catch(function(err) {
      wx.hideLoading();
      console.error('获取配送信息失败', err);
      wx.showToast({ title: '获取配送信息失败', icon: 'none' });
    });
  },

  // 确认收货
  onConfirmReceive: function() {
    var self = this;
    var orderId = this.data.orderInfo.orderId;

    wx.showModal({
      title: '确认收货',
      content: '确认已经收到商品吗？',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });

          app.authRequest({
            url: '/order/' + orderId + '/complete',
            method: 'PUT'
          }).then(function(res) {
            wx.hideLoading();
            if (res && res.code === 200) {
              wx.showToast({ title: '确认收货成功', icon: 'success' });
              self.setData({
                'orderInfo.status': '已完成',
                'orderInfo.statusText': '已完成'
              });
              self.loadOrderDetail(orderId);
              if (res.data && res.data.pointsAwarded) {
                wx.showModal({
                  title: '积分奖励',
                  content: '获得' + res.data.pointsAwarded + '积分奖励！',
                  showCancel: false
                });
              }
            } else {
              wx.showToast({ title: res.message || '操作失败', icon: 'none' });
            }
          }).catch(function(err) {
            wx.hideLoading();
            console.error('确认收货失败', err);
            wx.showToast({ title: '操作失败', icon: 'none' });
          });
        }
      }
    });
  },

  // 评价订单
  onReviewOrder: function() {
    var self = this;
    var orderId = this.data.orderInfo.orderId;

    // 检查订单是否已完成
    if (this.data.orderInfo.status !== '已完成') {
      wx.showToast({
        title: '订单尚未完成，无法评价',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '加载中...'
    });

    // 检查是否已经评价过
    var token = wx.getStorageSync('token');
    app.authRequest({
      url: '/review/order/' + orderId,
      method: 'GET',
      success: function(res) {
        wx.hideLoading();

        if (res && res.code === 200 && res.data) {
          // 已经评价过
          wx.showModal({
            title: '提示',
            content: '该订单已经评价过了',
            showCancel: false
          });
        } else {
          // 未评价，跳转到评价页面
          wx.navigateTo({
            url: '/pages/order-review/order-review?orderId=' + orderId
          });
        }
      },
      fail: function(err) {
        wx.hideLoading();
        console.error('评价状态检查失败：', err);
        wx.showModal({
          title: '提示',
          content: '网络连接失败',
          showCancel: false
        });
      }
    });
  },

  // 再来一单
  onOrderAgain: function() {
    var app = getApp();
    var details = this.data.orderInfo.items || [];
    if (!details || details.length === 0) {
      wx.showToast({ title: '订单中没有商品信息', icon: 'none' });
      return;
    }

    for (var i = 0; i < details.length; i++) {
      var item = details[i];
      app.addToCart({
        foodId: item.foodId,
        name: item.name,
        price: Number(item.price) || 0,
        image: item.image || '',
        quantity: Number(item.quantity) || 1,
        storeId: this.data.orderInfo.storeId
      });
    }

    wx.switchTab({
      url: '/pages/cart/cart'
    });
  },

  // 联系客服
  onHelp: function() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567\n在线时间：9:00-21:00',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 加载订单详情
  loadOrderDetail: function(orderId) {
    var self = this;

    app.authRequest({
      url: '/order/' + orderId,
      method: 'GET'
    }).then(function(res) {
      if (res && res.code === 200 && res.data) {
        var order = res.data;
        var items = [];
        // 后端返回字段是 orderDetails
        var rawItems = order.orderDetails || order.items || [];
        for (var mi = 0; mi < rawItems.length; mi++) {
          var item = rawItems[mi];
          items.push({
            foodId: item.foodId || item.id,
            name: item.foodName || item.name,
            price: parseFloat(item.price) || 0,
            quantity: item.quantity || 1,
            image: item.image || ''
          });
        }
        var orderInfo = {
          orderId: order.orderId || orderId,
          // wxml 按英文标识判断按钮显隐，这里统一归一化
          status: self.getStatusCls(order.status),
          statusText: self.getStatusText(order.status),
          subtotal: parseFloat(order.totalAmount) || 0,
          deliveryFee: parseFloat(order.deliveryFee) || 5,
          discount: parseFloat(order.discount) || 0,
          finalAmount: parseFloat(order.payAmount) || 0,
          orderTime: order.createTime || '',
          payTime: order.payTime || '',
          remark: order.remark || '',
          items: items,
          address: {
            name: order.receiverName || order.userName || '',
            phone: order.receiverPhone || order.phone || '',
            province: order.province || '',
            city: order.city || '',
            district: order.district || '',
            detail: order.address || ''
          },
          store: {
            name: order.storeName || '美食商家',
            distance: ''
          }
        };

        var deliveryInfo = {
          name: order.riderName || '配送员',
          phone: order.riderPhone || '',
          avatar: '/images/foods/rider_avatar.png',
          progress: self.getProgressText(order.status),
          estimatedTime: order.estimatedTime || '预计30分钟内送达'
        };

        var statusSteps = self.getStatusSteps(order.status);
        var statusConfig = self.getStatusConfig(order.status);

        self.setData({
          orderInfo: orderInfo,
          deliveryInfo: deliveryInfo,
          statusSteps: statusSteps,
          statusIcon: statusConfig.icon, statusIconText: statusConfig.iconText,
          statusDesc: statusConfig.desc
        });
      } else {
        wx.showToast({ title: '获取订单详情失败', icon: 'none' });
      }
    }).catch(function(err) {
      console.error('加载订单详情失败', err);
      wx.showToast({ title: '网络错误', icon: 'none' });
    });
  },

  // 获取状态文字
  getStatusText: function(status) {
    var map = {
      '待付款': '待付款', 'pending': '待付款',
      '已支付': '已支付', 'paid': '已支付',
      '待接单': '待接单', '已接单': '已接单',
      '制作中': '制作中', 'preparing': '制作中',
      '配送中': '配送中', 'delivering': '配送中',
      '已完成': '已完成', 'completed': '已完成',
      '已取消': '已取消', 'cancelled': '已取消',
      '已退款': '已退款', 'refunded': '已退款'
    };
    return map[status] || status || '未知';
  },

  // 状态 → wxml 用的英文标识
  getStatusCls: function(status) {
    var map = {
      '待付款': 'pending', 'pending': 'pending',
      '已支付': 'paid', 'paid': 'paid',
      '制作中': 'preparing', 'preparing': 'preparing',
      '配送中': 'delivering', 'delivering': 'delivering',
      '已完成': 'completed', 'completed': 'completed',
      '已取消': 'cancelled', 'cancelled': 'cancelled',
      '已退款': 'refunded', 'refunded': 'refunded'
    };
    return map[status] || 'pending';
  },

  // 退款
  onRefundOrder: function() {
    var self = this;
    var orderId = this.data.orderInfo.orderId;
    wx.showModal({
      title: '申请退款',
      content: '确定要对该订单发起退款吗？',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          app.authRequest({
            url: '/order/' + orderId + '/refund',
            method: 'PUT'
          }).then(function(res) {
            wx.hideLoading();
            if (res && res.code === 200) {
              wx.showToast({ title: '退款成功', icon: 'success' });
              self.loadOrderDetail(orderId);
            } else {
              wx.showToast({ title: (res && res.message) || '退款失败', icon: 'none' });
            }
          }).catch(function(err) {
            wx.hideLoading();
            console.error('退款失败', err);
            wx.showToast({ title: '退款失败', icon: 'none' });
          });
        }
      }
    });
  },

  // 获取进度文字
  getProgressText: function(status) {
    var map = {
      '待付款': '等待支付', 'pending': '等待支付',
      '制作中': '商家正在制作', 'preparing': '商家正在制作',
      '配送中': '正在配送中', 'delivering': '正在配送中',
      '已完成': '已送达', 'completed': '已送达'
    };
    return map[status] || '处理中';
  },

  // 获取状态步骤
  getStatusSteps: function(status) {
    var orderInfo = this.data.orderInfo || {};
    var steps = [
      { name: '已下单', time: (orderInfo.orderTime || '').slice(0, 16), completed: true },
      { name: '已支付', time: (orderInfo.payTime || '').slice(0, 16), completed: true },
      { name: '制作中', time: '', completed: status === 'preparing' || status === 'delivering' || status === 'completed' },
      { name: '配送中', time: '', completed: status === 'delivering' || status === 'completed', active: status === 'delivering' },
      { name: '已完成', time: '', completed: status === 'completed', active: status === 'completed' }
    ];

    return steps;
  },

  // 获取状态配置
  getStatusConfig: function(status) {
    var configs = {
      pending: { icon: 'fa-hourglass-half', iconText: 'â³', desc: '等待支付' },
      preparing: { icon: 'fa-utensils', iconText: 'ð´', desc: '商家正在制作' },
      delivering: { icon: 'fa-bicycle', iconText: 'ð²', desc: '骑手正在配送' },
      completed: { icon: 'fa-check-circle', iconText: 'â', desc: '订单已完成' }
    };

    return configs[status] || configs.pending;
  }
});
