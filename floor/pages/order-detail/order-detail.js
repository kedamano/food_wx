// 订单详情页面逻辑

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
    console.log('订单详情页面加载，参数：', options);

    // 获取订单ID
    var orderId = options.orderId || '202401150001';

    // 加载订单详情
    this.loadOrderDetail(orderId);
  },

  // 返回按钮点击
  onBackClick: function() {
    console.log('返回按钮点击');
    wx.navigateBack({
      delta: 1
    });
  },

  // 分享订单
  onShareOrder: function() {
    console.log('分享订单');
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
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
    console.log('复制订单号');
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
    console.log('评价订单');
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
        console.log('检查订单评价状态响应：', res);

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
    var self = this;
    console.log('再来一单');
    wx.showLoading({
      title: '加载中...'
    });

    setTimeout(function() {
      wx.hideLoading();
      wx.showToast({
        title: '已添加到购物车',
        icon: 'success'
      });

      // 跳转到购物车
      wx.switchTab({
        url: '/pages/cart/cart'
      });
    }, 1000);
  },

  // 联系客服
  onHelp: function() {
    console.log('联系客服');
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
    console.log('加载订单详情：', orderId);

    app.authRequest({
      url: '/order/' + orderId,
      method: 'GET'
    }).then(function(res) {
      if (res && res.code === 200 && res.data) {
        var order = res.data;
        var items = [];
        var rawItems = order.items || [];
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
          status: order.status || 'pending',
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
      '待接单': '待接单', '已接单': '已接单',
      '制作中': '制作中', 'preparing': '制作中',
      '配送中': '配送中', 'delivering': '配送中',
      '已完成': '已完成', 'completed': '已完成',
      '已取消': '已取消', 'cancelled': '已取消'
    };
    return map[status] || status || '未知';
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
    var steps = [
      { name: '已下单', time: '2024-01-15 12:30', completed: true },
      { name: '已支付', time: '2024-01-15 12:35', completed: true },
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
