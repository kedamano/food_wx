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
    statusIcon: '⏳',
    // 状态描述
    statusDesc: ''
  },

  // 页面加载
  onLoad(options) {
    console.log('订单详情页面加载，参数：', options);

    // 获取订单ID
    const orderId = options.orderId || '202401150001';

    // 加载订单详情
    this.loadOrderDetail(orderId);
  },

  // 返回按钮点击
  onBackClick() {
    console.log('返回按钮点击');
    wx.navigateBack({
      delta: 1
    });
  },

  // 分享订单
  onShareOrder() {
    console.log('分享订单');
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  // 联系骑手
  onContactDelivery() {
    console.log('联系骑手');
    const orderId = this.data.orderInfo.orderId;

    wx.showLoading({
      title: '加载中...'
    });

    // 使用模拟数据
    setTimeout(() => {
      wx.hideLoading();
      
      // 模拟骑手信息
      const riderInfo = {
        riderName: '李师傅',
        riderPhone: '13800138001',
        avatar: '/images/foods/rider_avatar.png',
      };

      wx.showModal({
        title: '联系骑手',
        content: `骑手：${riderInfo.riderName}\n电话：${riderInfo.riderPhone}`,
        success: (res) => {
          if (res.confirm) {
            // 拨打电话
            wx.makePhoneCall({
              phoneNumber: riderInfo.riderPhone
            });
          }
        }
      });
    }, 500);
  },

  // 复制订单号
  onCopyOrderId() {
    console.log('复制订单号');
    wx.setClipboardData({
      data: this.data.orderInfo.orderId,
      success: () => {
        wx.showToast({
          title: '订单号已复制',
          icon: 'success'
        });
      }
    });
  },

  // 取消订单
  onCancelOrder() {
    console.log('取消订单');
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中...'
          });

          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
              title: '订单已取消',
              icon: 'success'
            });

            // 返回订单列表
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }, 1000);
        }
      }
    });
  },

  // 支付订单
  onPayOrder() {
    console.log('支付订单');
    wx.showLoading({
      title: '支付中...'
    });

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '支付成功',
        icon: 'success'
      });

      // 更新订单状态
      this.setData({
        'orderInfo.status': 'preparing',
        'orderInfo.statusText': '制作中'
      });
    }, 1500);
  },

  // 催单
  onRemindOrder() {
    console.log('催单');
    wx.showToast({
      title: '已发送催单提醒',
      icon: 'success'
    });
  },

  // 查看配送
  onTrackDelivery() {
    console.log('查看配送');
    const orderId = this.data.orderInfo.orderId;

    wx.showLoading({
      title: '加载中...'
    });

    // 使用模拟数据
    setTimeout(() => {
      wx.hideLoading();
      
      // 模拟配送追踪数据
      const trackingData = {
        orderId: orderId,
        status: '配送中',
        progress: 65,
        currentLocation: {
          lat: 22.5431,
          lng: 113.9387
        },
        rider: {
          name: '李师傅',
          phone: '13800138001',
          avatar: '/images/foods/rider_avatar.png',
          rating: 4.8
        },
        estimatedTime: '30分钟',
        steps: [
          { name: '商家取餐', completed: true, time: '12:35' },
          { name: '配送中', completed: false, active: true, time: '' },
          { name: '即将送达', completed: false, time: '' },
          { name: '已送达', completed: false, time: '' }
        ]
      };

      // 跳转到配送追踪页面
      wx.navigateTo({
        url: `/pages/delivery-track/delivery-track?orderId=${orderId}&trackingData=${encodeURIComponent(JSON.stringify(trackingData))}`
      });
    }, 500);
  },

  // 确认收货
  onConfirmReceive() {
    console.log('确认收货');
    const orderId = this.data.orderInfo.orderId;

    wx.showModal({
      title: '确认收货',
      content: '确认已经收到商品吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中...'
          });

          // 使用模拟数据
          setTimeout(() => {
            wx.hideLoading();

            wx.showToast({
              title: '确认收货成功',
              icon: 'success'
            });

            // 更新订单状态
            this.setData({
              'orderInfo.status': 'completed',
              'orderInfo.statusText': '已完成'
            });

            // 显示积分奖励
            const pointsAwarded = 10;
            if (pointsAwarded > 0) {
              wx.showModal({
                title: '积分奖励',
                content: `获得${pointsAwarded}积分奖励！`,
                showCancel: false
              });
            }
          }, 1000);
        }
      }
    });
  },

  // 评价订单
  onReviewOrder() {
    console.log('评价订单');
    const orderId = this.data.orderInfo.orderId;
    
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
    const token = wx.getStorageSync('token');
    wx.request({
      url: `http://localhost:8080/review/order/${orderId}`,
      method: 'GET',
      header: {
        'Authorization': token || ''
      },
      success: (res) => {
        wx.hideLoading();
        console.log('检查订单评价状态响应：', res);

        if (res.statusCode === 200 && res.data.code === 200) {
          // 已经评价过
          wx.showModal({
            title: '提示',
            content: '该订单已经评价过了',
            showCancel: false
          });
        } else {
          // 未评价，跳转到评价页面
          wx.navigateTo({
            url: `/pages/order-review/order-review?orderId=${orderId}`
          });
        }
      },
      fail: (err) => {
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
  onOrderAgain() {
    console.log('再来一单');
    wx.showLoading({
      title: '加载中...'
    });

    setTimeout(() => {
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
  onHelp() {
    console.log('联系客服');
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567\n在线时间：9:00-21:00',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 加载订单详情
  loadOrderDetail(orderId) {
    console.log('加载订单详情：', orderId);

    // 模拟订单数据
    setTimeout(() => {
      const mockOrder = {
        orderId: orderId,
        status: 'delivering',
        statusText: '配送中',
        subtotal: 89.00,
        deliveryFee: 5.00,
        discount: 10.00,
        finalAmount: 84.00,
        orderTime: '2024-01-15 12:30',
        payTime: '2024-01-15 12:35',
        deliveryTime: '',
        remark: '请小心轻放',
        items: [
          {
            foodId: 1,
            name: '经典牛肉面',
            price: 28.00,
            quantity: 2,
            image: '/images/foods/beef_noodles.png'
          }
        ],
        address: {
          name: '张三',
          phone: '13800138000',
          province: '广东省',
          city: '深圳市',
          district: '南山区',
          detail: '科技园南区软件产业基地1栋1201室'
        },
        store: {
          name: '川味人家',
          distance: '1.2km'
        }
      };

      // 模拟配送信息
      const mockDeliveryInfo = {
        name: '李师傅',
        phone: '13800138001',
        avatar: '/images/foods/rider_avatar.png',
        progress: '正在配送中',
        estimatedTime: '预计30分钟内送达'
      };

      // 状态步骤
      const statusSteps = this.getStatusSteps(mockOrder.status);

      // 状态图标和描述
      const statusConfig = this.getStatusConfig(mockOrder.status);

      this.setData({
        orderInfo: mockOrder,
        deliveryInfo: mockDeliveryInfo,
        statusSteps: statusSteps,
        statusIcon: statusConfig.icon,
        statusDesc: statusConfig.desc
      });
    }, 1000);
  },

  // 获取状态步骤
  getStatusSteps(status) {
    const steps = [
      { name: '已下单', time: '2024-01-15 12:30', completed: true },
      { name: '已支付', time: '2024-01-15 12:35', completed: true },
      { name: '制作中', time: '', completed: status === 'preparing' || status === 'delivering' || status === 'completed' },
      { name: '配送中', time: '', completed: status === 'delivering' || status === 'completed', active: status === 'delivering' },
      { name: '已完成', time: '', completed: status === 'completed', active: status === 'completed' }
    ];

    return steps;
  },

  // 获取状态配置
  getStatusConfig(status) {
    const configs = {
      pending: { icon: '⏳', desc: '等待支付' },
      preparing: { icon: 'fa-utensils', desc: '商家正在制作' },
      delivering: { icon: 'fa-bicycle', desc: '骑手正在配送' },
      completed: { icon: 'fa-check-circle', desc: '订单已完成' }
    };

    return configs[status] || configs.pending;
  }
});