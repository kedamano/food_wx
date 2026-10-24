// pages/user-reviews/user-reviews.js
var app = getApp();

Page({
  data: {
    // 评价列表
    reviews: [],
    // 统计数据
    statistics: {
      totalReviews: 0,
      avgRating: '0.0',
      fiveStarCount: 0
    },
    // 加载状态
    loading: false
  },

  onLoad: function(options) {
    this.loadUserReviews();
  },

  onShow: function() {
    this.loadUserReviews();
  },

  onPullDownRefresh: function() {
    this.loadUserReviews();
    wx.stopPullDownRefresh();
  },

  // 加载用户评价列表
  loadUserReviews: function() {
    var userId = app.globalData.userId || wx.getStorageSync('userId') || 1;

    this.setData({ loading: true });

    var self = this;
    app.authRequest({
      url: '/review/user/' + userId,
      method: 'GET'
    }).then(function(res) {
      self.setData({ loading: false });

      if (res && res.code === 200 && res.data) {
        var reviews = res.data;

        // 格式化评价数据 - 用 for 循环替换 map
        var formattedReviews = [];
        for (var i = 0; i < reviews.length; i++) {
          formattedReviews.push(self.formatReview(reviews[i]));
        }

        // 计算统计数据
        var statistics = self.calculateStatistics(formattedReviews);

        self.setData({
          reviews: formattedReviews,
          statistics: statistics
        });
      } else {
        self.setData({
          reviews: [],
          statistics: {
            totalReviews: 0,
            avgRating: '0.0',
            fiveStarCount: 0
          }
        });
      }
    }).catch(function(err) {
      self.setData({ loading: false });
      console.error('加载评价列表失败', err);
      // 使用缓存数据
      self.useCachedData();
    });
  },

  // 格式化评价数据
  formatReview: function(review) {
    // 格式化时间
    var createTime = '';
    if (review.createTime) {
      var date = new Date(review.createTime);
      var month = date.getMonth() + 1;
      var day = date.getDate();
      var hours = date.getHours().toString().padStart(2, '0');
      var minutes = date.getMinutes().toString().padStart(2, '0');
      createTime = month + '/' + day + ' ' + hours + ':' + minutes;
    }

    // 解析图片
    var images = [];
    if (review.images) {
      try {
        images = typeof review.images === 'string' ? JSON.parse(review.images) : review.images;
      } catch (e) {
        images = [];
      }
    }

    return {
      reviewId: review.reviewId,
      orderId: review.orderId,
      foodId: review.foodId,
      foodName: review.foodName || '美食',
      foodImage: review.foodImage || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop',
      rating: review.rating || 5,
      content: review.content || '',
      images: images,
      createTime: createTime,
      likeCount: review.likeCount || 0,
      isLiked: review.isLiked || false
    };
  },

  // 计算统计数据
  calculateStatistics: function(reviews) {
    var totalReviews = reviews.length;
    var totalRating = 0;
    var fiveStarCount = 0;

    // 用 for 循环替换 forEach
    for (var i = 0; i < reviews.length; i++) {
      var review = reviews[i];
      totalRating += review.rating;
      if (review.rating >= 5) {
        fiveStarCount++;
      }
    }

    var avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : '0.0';

    return {
      totalReviews: totalReviews,
      avgRating: avgRating,
      fiveStarCount: fiveStarCount
    };
  },

  // 使用缓存数据
  useCachedData: function() {
    var cachedReviews = wx.getStorageSync('cachedUserReviews') || [];
    var self = this;

    if (cachedReviews.length > 0) {
      // 用 for 循环替换 map
      var reviews = [];
      for (var i = 0; i < cachedReviews.length; i++) {
        reviews.push(self.formatReview(cachedReviews[i]));
      }
      var statistics = self.calculateStatistics(reviews);

      self.setData({
        reviews: reviews,
        statistics: statistics
      });
    } else {
      // 加载失败/无数据：展示空态，不使用假数据
      this.setData({ isLoading: false, reviews: [] });
    }
  },


  // 查看评价详情
  onReviewDetail: function(e) {
    var review = e.currentTarget.dataset.review;

    wx.showModal({
      title: review.foodName,
      content: review.content,
      showCancel: false,
      confirmText: '关闭'
    });
  },

  // 点赞评价
  onLikeReview: function(e) {
    // 评价点赞暂无后端支持
    wx.showToast({ title: '点赞功能即将上线', icon: 'none' });
    return;
  },
  onLikeReviewOld: function(e) {
    var review = e.currentTarget.dataset.review;

    var self = this;
    // 用 for 循环替换 map
    var reviews = [];
    for (var i = 0; i < this.data.reviews.length; i++) {
      var item = this.data.reviews[i];
      if (item.reviewId === review.reviewId) {
        reviews.push({
          reviewId: item.reviewId,
          orderId: item.orderId,
          foodId: item.foodId,
          foodName: item.foodName,
          foodImage: item.foodImage,
          rating: item.rating,
          content: item.content,
          images: item.images,
          createTime: item.createTime,
          likeCount: item.isLiked ? item.likeCount - 1 : item.likeCount + 1,
          isLiked: !item.isLiked
        });
      } else {
        reviews.push(item);
      }
    }

    this.setData({ reviews: reviews });

    // 调用后端 API
    wx.showToast({
      title: review.isLiked ? '取消点赞' : '点赞成功',
      icon: 'none'
    });
  },

  // 回复评价
  onReplyReview: function(e) {
    // 商家回复暂无后端支持
    wx.showToast({ title: '回复功能即将上线', icon: 'none' });
    return;
  },
  onReplyReviewOld: function(e) {
    var review = e.currentTarget.dataset.review;
    var self = this;
    wx.showModal({
      title: '回复评价',
      editable: true,
      placeholderText: '请输入回复内容...',
      confirmText: '发送',
      success: function(res) {
        if (res.confirm && res.content) {
          // 保存回复到本地
          var replies = wx.getStorageSync('reviewReplies') || {};
          var replyList = replies[review.reviewId] || [];
          replyList.push({
            content: res.content,
            time: new Date().toLocaleString(),
            reviewer: '我'
          });
          replies[review.reviewId] = replyList;
          wx.setStorageSync('reviewReplies', replies);
          wx.showToast({ title: '回复成功', icon: 'success' });
        }
      }
    });
  },

  // 预览图片
  onPreviewImage: function(e) {
    var images = e.currentTarget.dataset.images;
    var index = e.currentTarget.dataset.index;

    wx.previewImage({
      urls: images,
      current: images[index]
    });
  },

  // 去评价
  onGoOrders: function() {
    wx.navigateTo({
      url: '/pages/orders/orders?status=completed'
    });
  }
});
