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

    var token = wx.getStorageSync('token');
    wx.request({
      url: 'http://localhost:8080/api/order/' + orderId,
      method: 'GET',
      header: { 'Authorization': token || '' },
      success: function(res) {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data.code === 200) {
          var order = res.data.data;
          self.setData({
            orderInfo: {
              storeName: order.storeName || '未知商家',
              foodItems: self.formatFoodItems(order.orderDetails || []),
              orderTime: self.formatOrderTime(order.createTime)
            }
          });
        } else {
          wx.showModal({ title: '提示', content: res.data.message || '获取订单信息失败', showCancel: false });
        }
      },
      fail: function(err) {
        wx.hideLoading();
        console.error('订单信息请求失败：', err);
        wx.showModal({ title: '提示', content: '网络连接失败', showCancel: false });
      }
    });
  },

  formatFoodItems: function(details) {
    if (!details || details.length === 0) return [];
    var list = [];
    for (var i = 0; i < details.length; i++) {
      var detail = details[i];
      list.push({ name: detail.foodName, quantity: detail.quantity, price: detail.price });
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
      rating: rating,
      content: reviewContent.trim(),
      images: images
    };

    var token = wx.getStorageSync('token');
    wx.request({
      url: 'http://localhost:8080/api/review/order/' + orderId,
      method: 'POST',
      header: { 'Authorization': token || '', 'Content-Type': 'application/json' },
      data: reviewData,
      success: function(res) {
        wx.hideLoading();
        self.setData({ isLoading: false });
        if (res.statusCode === 200 && res.data.code === 200) {
          wx.showToast({ title: '评价成功', icon: 'success' });
          setTimeout(function() { wx.navigateBack(); }, 1500);
        } else {
          wx.showModal({ title: '提示', content: res.data.message || '评价提交失败', showCancel: false });
        }
      },
      fail: function(err) {
        wx.hideLoading();
        self.setData({ isLoading: false });
        console.error('评价提交请求失败：', err);
        wx.showModal({ title: '提示', content: '网络连接失败', showCancel: false });
      }
    });
  },

  onBack: function() {
    wx.navigateBack();
  }
});
