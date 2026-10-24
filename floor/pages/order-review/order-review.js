// 订单评价页面逻辑
Page({
  data: {
    orderId: '',
    orderInfo: {
      storeName: '',
      foodItems: [],
      orderTime: ''
    },
    rating: 5,
    reviewContent: '',
    images: [],
    isLoading: false
  },

  onLoad: function(options) {
    console.log('订单评价页面加载，参数：', options);
    var orderId = options.orderId;
    if (!orderId) {
      wx.showModal({
        title: '提示',
        content: '订单ID不能为空',
        showCancel: false,
        success: function() { wx.navigateBack(); }
      });
      return;
    }
    this.setData({ orderId: orderId });
    this.loadOrderInfo(orderId);
  },

  loadOrderInfo: function(orderId) {
    var self = this;
    wx.showLoading({ title: '加载中...' });

    var app = getApp();
    app.authRequest({
      url: '/order/' + orderId,
      method: 'GET'
    }).then(function(res) {
      wx.hideLoading();
      if (res && res.code === 200 && res.data) {
        var order = res.data;
        self.setData({
          orderInfo: {
            storeName: order.storeName || '未知商家',
            foodItems: self.formatFoodItems(order.orderDetails || []),
            orderTime: self.formatOrderTime(order.createTime)
          }
        });
      } else {
        wx.showModal({ title: '提示', content: (res && res.message) || '获取订单信息失败', showCancel: false });
      }
    }).catch(function(err) {
      wx.hideLoading();
      console.error('订单信息请求失败：', err);
      wx.showModal({ title: '提示', content: '网络连接失败', showCancel: false });
    });
  },

  formatFoodItems: function(details) {
    if (!details || details.length === 0) return [];
    var list = [];
    for (var i = 0; i < details.length; i++) {
      var detail = details[i];
      list.push({ foodId: detail.foodId, name: detail.foodName, quantity: detail.quantity, price: detail.price });
    }
    return list;
  },

  formatOrderTime: function(createTime) {
    if (!createTime) return '';
    var date = new Date(createTime);
    return date.toLocaleString('zh-CN');
  },

  onRatingChange: function(e) {
    this.setData({ rating: e.detail.value });
  },

  onReviewContentInput: function(e) {
    this.setData({ reviewContent: e.detail.value });
  },

  onChooseImage: function() {
    var self = this;
    var currentImages = self.data.images;
    if (currentImages.length >= 9) {
      wx.showToast({ title: '最多只能选择9张图片', icon: 'none' });
      return;
    }
    wx.chooseImage({
      count: 9 - currentImages.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        self.setData({ images: currentImages.concat(res.tempFilePaths) });
      },
      fail: function(err) {
        console.error('选择图片失败：', err);
      }
    });
  },

  onDeleteImage: function(e) {
    var self = this;
    var index = e.currentTarget.dataset.index;
    var images = self.data.images;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: function(res) {
        if (res.confirm) {
          images.splice(index, 1);
          self.setData({ images: images });
        }
      }
    });
  },

  onPreviewImage: function(e) {
    var index = e.currentTarget.dataset.index;
    var images = this.data.images;
    wx.previewImage({ urls: images, current: images[index] });
  },

  onSubmitReview: function() {
    var self = this;
    var orderId = self.data.orderId;
    var rating = self.data.rating;
    var reviewContent = self.data.reviewContent;
    var images = self.data.images;

    if (!reviewContent || reviewContent.trim() === '') {
      wx.showToast({ title: '请输入评价内容', icon: 'none' });
      return;
    }
    if (reviewContent.length < 10) {
      wx.showToast({ title: '评价内容至少需要10个字', icon: 'none' });
      return;
    }

    self.setData({ isLoading: true });
    wx.showLoading({ title: '提交中...' });

    var reviewData = {
      orderId: parseInt(orderId),
      // 评价表要求关联菜品，取订单第一个菜品
      foodId: this.data.orderInfo.foodItems && this.data.orderInfo.foodItems.length > 0
        ? this.data.orderInfo.foodItems[0].foodId : null,
      rating: rating,
      content: reviewContent.trim(),
      images: images
    };

    if (!reviewData.foodId) {
      wx.showToast({ title: '订单缺少菜品信息，无法评价', icon: 'none' });
      return;
    }

    var app = getApp();
    app.authRequest({
      url: '/review/order/' + orderId,
      method: 'POST',
      data: reviewData
    }).then(function(res) {
      wx.hideLoading();
      if (res && res.code === 200) {
        wx.showToast({ title: '评价成功', icon: 'success' });
        setTimeout(function() { wx.navigateBack(); }, 1500);
      } else {
        self.setData({ isLoading: false });
        wx.showModal({ title: '提示', content: (res && res.message) || '评价提交失败', showCancel: false });
      }
    }).catch(function(err) {
      wx.hideLoading();
      self.setData({ isLoading: false });
      console.error('评价提交请求失败：', err);
      wx.showModal({ title: '提示', content: '网络连接失败', showCancel: false });
    });
  },

  onBack: function() {
    wx.navigateBack();
  }
});
