// 用户评价页面逻辑
Page({
  data: {
    // 评价列表
    reviews: [],
    // 评价统计
    reviewStats: {
      total: 0,
      withImage: 0,
      avgRating: 0
    },
    // 加载状态
    isLoading: true
  },

  // 页面加载
  onLoad(options) {
    console.log('用户评价页面加载');

    // 加载评价数据
    this.loadReviews();
  },

  // 返回按钮点击
  onBackClick() {
    console.log('返回按钮点击');
    wx.navigateBack({
      delta: 1
    });
  },

  // 筛选评价
  onFilterReviews() {
    console.log('筛选评价');
    wx.showActionSheet({
      itemList: ['全部评价', '好评', '中评', '差评', '有图评价'],
      success: (res) => {
        const filterType = ['all', 'good', 'medium', 'bad', 'withImage'][res.tapIndex];
        console.log('筛选类型：', filterType);
        this.filterReviews(filterType);
      }
    });
  },

  // 评价详情
  onReviewDetail(e) {
    const review = e.currentTarget.dataset.review;
    console.log('评价详情：', review);
    
    wx.navigateTo({
      url: `/pages/review-detail/review-detail?id=${review.id}`
    });
  },

  // 修改评价
  onEditReview(e) {
    e.stopPropagation();
    const review = e.currentTarget.dataset.review;
    console.log('修改评价：', review);
    
    wx.navigateTo({
      url: `/pages/review-edit/review-edit?id=${review.id}`
    });
  },

  // 删除评价
  onDeleteReview(e) {
    e.stopPropagation();
    const review = e.currentTarget.dataset.review;
    console.log('删除评价：', review);
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条评价吗？删除后将无法恢复。',
      success: (res) => {
        if (res.confirm) {
          this.deleteReview(review.id);
        }
      }
    });
  },

  // 删除评价
  deleteReview(reviewId) {
    console.log('删除评价ID：', reviewId);
    
    const updatedReviews = this.data.reviews.filter(item => item.id !== reviewId);
    this.setData({ reviews: updatedReviews });
    
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
  },

  // 筛选评价
  filterReviews(filterType) {
    let filteredReviews = this.data.allReviews || this.data.reviews;
    
    switch (filterType) {
      case 'good':
        filteredReviews = filteredReviews.filter(item => item.rating >= 4);
        break;
      case 'medium':
        filteredReviews = filteredReviews.filter(item => item.rating >= 2 && item.rating < 4);
        break;
      case 'bad':
        filteredReviews = filteredReviews.filter(item => item.rating < 2);
        break;
      case 'withImage':
        filteredReviews = filteredReviews.filter(item => item.images.length > 0);
        break;
    }
    
    this.setData({
      reviews: filteredReviews
    });
  },

  // 加载评价数据
  loadReviews() {
    // 模拟评价数据
    const mockReviews = [
      {
        id: 1,
        storeName: '川味人家',
        foodNames: '经典牛肉面 x2',
        rating: 5,
        content: '味道真的很棒！牛肉炖得很烂，面条很有劲道，汤也很好喝。强烈推荐！',
        reviewTime: '2024-01-15',
        images: [
          '/images/foods/review_1.png',
          '/images/foods/review_2.png'
        ]
      },
      {
        id: 2,
        storeName: '披萨大师',
        foodNames: '芝士培根披萨',
        rating: 4,
        content: '披萨很香，芝士很多，配送也很快。就是价格稍微贵了点。',
        reviewTime: '2024-01-14',
        images: []
      },
      {
        id: 3,
        storeName: '汉堡王',
        foodNames: '香辣鸡腿堡套餐',
        rating: 3,
        content: '味道还可以，但是分量有点少，吃完还想再来一份。',
        reviewTime: '2024-01-13',
        images: []
      }
    ];

    // 计算统计数据
    const stats = {
      total: mockReviews.length,
      withImage: mockReviews.filter(item => item.images.length > 0).length,
      avgRating: (mockReviews.reduce((sum, item) => sum + item.rating, 0) / mockReviews.length).toFixed(1)
    };

    this.setData({
      reviews: mockReviews,
      allReviews: mockReviews,
      reviewStats: stats,
      isLoading: false
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    this.loadReviews();

    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});