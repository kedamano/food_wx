// 订单评价页面逻辑
Page({
  data: {
    // 订单ID
    orderId: '',
    // 订单信息
    orderInfo: {
      storeName: '',
      foodItems: [],
      orderTime: ''
    },
    // 评分
    rating: 5,
    // 评价内容
    reviewContent: '',
    // 图片列表
    images: [],
    // 加载状态
    isLoading: false
  },

  // 页面加载
  onLoad(options) {
    console.log('订单评价页面加载，参数：', options);

    // 获取订单ID
    const orderId = options.orderId;
    if (!orderId) {
      wx.showModal({
        title: '提示',
        content: '订单ID不能为空',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
      return;
    }

    this.setData({
      orderId: orderId
    });

    // 加载订单信息
    this.loadOrderInfo(orderId);
  },

  // 加载订单信息
  loadOrderInfo(orderId) {
    wx.showLoading({
      title: '加载中...'
    });

    const token = wx.getStorageSync('token');
    wx.request({
      url: `/order/${orderId}`,
      method: 'GET',
      header: {
        'Authorization': token || ''
      },
      success: (res) => {
        wx.hideLoading();
        console.log('订单信息响应：', res);

        if (res.statusCode === 200 && res.data.code === 200) {
          const order = res.data.data;
          const orderInfo = {
            storeName: order.storeName || '未知商家',
            foodItems: this.formatFoodItems(order.orderDetails || []),
            orderTime: this.formatOrderTime(order.createTime)
          };

          this.setData({
            orderInfo: orderInfo
          });
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.message || '获取订单信息失败',
            showCancel: false
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('订单信息请求失败：', err);
        wx.showModal({
          title: '提示',
          content: '网络连接失败',
          showCancel: false
        });
      }
    });
  },

  // 格式化食物项目
  formatFoodItems(details) {
    if (!details || details.length === 0) {
      return [];
    }

    return details.map(detail => ({
      name: detail.foodName,
      quantity: detail.quantity,
      price: detail.price
    }));
  },

  // 格式化订单时间
  formatOrderTime(createTime) {
    if (!createTime) {
      return '';
    }

    const date = new Date(createTime);
    return date.toLocaleString('zh-CN');
  },

  // 评分改变
  onRatingChange(e) {
    console.log('评分改变：', e.detail.value);
    this.setData({
      rating: e.detail.value
    });
  },

  // 评价内容输入
  onReviewContentInput(e) {
    this.setData({
      reviewContent: e.detail.value
    });
  },

  // 选择图片
  onChooseImage() {
    const currentImages = this.data.images;
    if (currentImages.length >= 9) {
      wx.showToast({
        title: '最多只能选择9张图片',
        icon: 'none'
      });
      return;
    }

    wx.chooseImage({
      count: 9 - currentImages.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('选择图片成功：', res);
        this.setData({
          images: currentImages.concat(res.tempFilePaths)
        });
      },
      fail: (err) => {
        console.error('选择图片失败：', err);
      }
    });
  },

  // 删除图片
  onDeleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          images.splice(index, 1);
          this.setData({
            images: images
          });
        }
      }
    });
  },

  // 查看图片
  onPreviewImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;

    wx.previewImage({
      urls: images,
      current: images[index]
    });
  },

  // 提交评价
  onSubmitReview() {
    const { orderId, rating, reviewContent, images } = this.data;

    // 验证输入
    if (!reviewContent || reviewContent.trim() === '') {
      wx.showToast({
        title: '请输入评价内容',
        icon: 'none'
      });
      return;
    }

    if (reviewContent.length < 10) {
      wx.showToast({
        title: '评价内容至少需要10个字',
        icon: 'none'
      });
      return;
    }

    this.setData({
      isLoading: true
    });

    wx.showLoading({
      title: '提交中...'
    });

    // 准备评价数据
    const reviewData = {
      orderId: parseInt(orderId),
      rating: rating,
      content: reviewContent.trim(),
      images: images
    };

    console.log('提交评价数据：', reviewData);

    // 调用后端评价接口
    const token = wx.getStorageSync('token');
    wx.request({
      url: `/review/order/${orderId}`,
      method: 'POST',
      header: {
        'Authorization': token || '',
        'Content-Type': 'application/json'
      },
      data: reviewData,
      success: (res) => {
        wx.hideLoading();
        this.setData({
          isLoading: false
        });
        console.log('评价提交响应：', res);

        if (res.statusCode === 200 && res.data.code === 200) {
          wx.showToast({
            title: '评价成功',
            icon: 'success'
          });

          // 延迟返回订单详情页
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.message || '评价提交失败',
            showCancel: false
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({
          isLoading: false
        });
        console.error('评价提交请求失败：', err);
        wx.showModal({
          title: '提示',
          content: '网络连接失败',
          showCancel: false
        });
      }
    });
  },

  // 返回
  onBack() {
    wx.navigateBack();
  }
});