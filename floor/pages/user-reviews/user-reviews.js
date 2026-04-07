// pages/user-reviews/user-reviews.js
const app = getApp()

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

  onLoad(options) {
    console.log('用户评价页面加载');
    this.loadUserReviews();
  },

  onShow() {
    this.loadUserReviews();
  },

  onPullDownRefresh() {
    this.loadUserReviews();
    wx.stopPullDownRefresh();
  },

  // 加载用户评价列表
  loadUserReviews() {
    const userId = app.globalData.userId || wx.getStorageSync('userId') || 1;

    this.setData({ loading: true });

    app.authRequest({
      url: `/review/user/${userId}`,
      method: 'GET'
    }).then(res => {
      this.setData({ loading: false });

      if (res && res.code === 200 && res.data) {
        let reviews = res.data;
        
        // 格式化评价数据
        reviews = reviews.map(review => this.formatReview(review));
        
        // 计算统计数据
        const statistics = this.calculateStatistics(reviews);
        
        this.setData({
          reviews: reviews,
          statistics: statistics
        });
      } else {
        this.setData({
          reviews: [],
          statistics: {
            totalReviews: 0,
            avgRating: '0.0',
            fiveStarCount: 0
          }
        });
      }
    }).catch(err => {
      this.setData({ loading: false });
      console.error('加载评价列表失败', err);
      // 使用缓存数据
      this.useCachedData();
    });
  },

  // 格式化评价数据
  formatReview(review) {
    // 格式化时间
    let createTime = '';
    if (review.createTime) {
      const date = new Date(review.createTime);
      createTime = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    // 解析图片
    let images = [];
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
  calculateStatistics(reviews) {
    const totalReviews = reviews.length;
    let totalRating = 0;
    let fiveStarCount = 0;

    reviews.forEach(review => {
      totalRating += review.rating;
      if (review.rating >= 5) {
        fiveStarCount++;
      }
    });

    const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : '0.0';

    return {
      totalReviews: totalReviews,
      avgRating: avgRating,
      fiveStarCount: fiveStarCount
    };
  },

  // 使用缓存数据
  useCachedData() {
    const cachedReviews = wx.getStorageSync('cachedUserReviews') || [];
    
    if (cachedReviews.length > 0) {
      const reviews = cachedReviews.map(review => this.formatReview(review));
      const statistics = this.calculateStatistics(reviews);
      
      this.setData({
        reviews: reviews,
        statistics: statistics
      });
    } else {
      // 使用 mock 数据
      this.useMockData();
    }
  },

  // 使用 Mock 数据
  useMockData() {
    const mockReviews = [
      {
        reviewId: 1,
        orderId: 1,
        foodId: 1,
        foodName: '牛肉拉面',
        foodImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop',
        rating: 5,
        content: '牛肉面非常好吃，汤很浓郁，牛肉也很嫩，强烈推荐！',
        images: [],
        createTime: '04/06 12:30',
        likeCount: 12,
        isLiked: false
      },
      {
        reviewId: 2,
        orderId: 2,
        foodId: 2,
        foodName: '宫保鸡丁',
        foodImage: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=200&h=200&fit=crop',
        rating: 4,
        content: '宫保鸡丁很正宗，味道很棒！',
        images: [],
        createTime: '04/05 18:20',
        likeCount: 8,
        isLiked: true
      },
      {
        reviewId: 3,
        orderId: 3,
        foodId: 3,
        foodName: '麻辣香锅',
        foodImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop',
        rating: 5,
        content: '麻辣香锅太棒了！麻辣鲜香，配菜丰富，推荐！',
        images: [],
        createTime: '04/04 19:00',
        likeCount: 15,
        isLiked: false
      }
    ];

    const statistics = this.calculateStatistics(mockReviews);
    
    this.setData({
      reviews: mockReviews,
      statistics: statistics
    });

    // 缓存数据
    wx.setStorageSync('cachedUserReviews', mockReviews);
  },

  // 查看评价详情
  onReviewDetail(e) {
    const review = e.currentTarget.dataset.review;
    console.log('查看评价详情：', review);
    
    wx.showModal({
      title: review.foodName,
      content: review.content,
      showCancel: false,
      confirmText: '关闭'
    });
  },

  // 点赞评价
  onLikeReview(e) {
    const review = e.currentTarget.dataset.review;
    console.log('点赞评价：', review.reviewId);

    // 更新本地状态
    const reviews = this.data.reviews.map(item => {
      if (item.reviewId === review.reviewId) {
        return {
          ...item,
          isLiked: !item.isLiked,
          likeCount: item.isLiked ? item.likeCount - 1 : item.likeCount + 1
        };
      }
      return item;
    });

    this.setData({ reviews });

    // 调用后端 API
    wx.showToast({
      title: review.isLiked ? '取消点赞' : '点赞成功',
      icon: 'none'
    });
  },

  // 回复评价
  onReplyReview(e) {
    const review = e.currentTarget.dataset.review;
    console.log('回复评价：', review.reviewId);

    wx.showToast({
      title: '回复功能开发中',
      icon: 'none'
    });
  },

  // 预览图片
  onPreviewImage(e) {
    const images = e.currentTarget.dataset.images;
    const index = e.currentTarget.dataset.index;
    
    wx.previewImage({
      urls: images,
      current: images[index]
    });
  },

  // 去评价
  onGoOrders() {
    wx.navigateTo({
      url: '/pages/orders/orders?status=completed'
    });
  }
})
