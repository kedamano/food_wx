// 全部评价页面逻辑

Page({
  data: {
    foodId: null,
    foodName: '',
    reviews: [],
    allReviews: [],
    reviewStats: {
      total: 0,
      avgRating: 0,
      withImage: 0,
      fiveStarCount: 0,
      fourStarCount: 0,
      threeStarCount: 0
    },
    currentFilter: 'all', // all / good / medium / bad / withImage
    filterTabs: [
      { key: 'all', label: '全部' },
      { key: 'good', label: '好评' },
      { key: 'medium', label: '中评' },
      { key: 'bad', label: '差评' },
      { key: 'withImage', label: '有图' }
    ],
    isLoading: true
  },

  onLoad: function(options) {
    var foodId = options.foodId || null;
    var foodName = options.foodName || '该商品';
    this.setData({ foodId: foodId, foodName: foodName });
    this.loadReviews(foodId);
  },

  onBackClick: function() {
    wx.navigateBack({ delta: 1 });
  },

  // 切换筛选 tab
  onFilterChange: function(e) {
    var key = e.currentTarget.dataset.key;
    this.setData({ currentFilter: key });
    this.applyFilter(key);
  },

  // 应用筛选
  applyFilter: function(filterType) {
    var self = this;
    var list = (this.data.allReviews || []).slice();
    var filtered = [];
    switch (filterType) {
      case 'good':
        for (var i = 0; i < list.length; i++) {
          if (list[i].rating >= 4) filtered.push(list[i]);
        }
        break;
      case 'medium':
        for (var j = 0; j < list.length; j++) {
          if (list[j].rating >= 2 && list[j].rating < 4) filtered.push(list[j]);
        }
        break;
      case 'bad':
        for (var k = 0; k < list.length; k++) {
          if (list[k].rating < 2) filtered.push(list[k]);
        }
        break;
      case 'withImage':
        for (var m = 0; m < list.length; m++) {
          if (list[m].images && list[m].images.length > 0) filtered.push(list[m]);
        }
        break;
      default:
        filtered = list;
        break;
    }
    this.setData({ reviews: filtered });
  },

  // 加载评价
  loadReviews: function(foodId) {
    var self = this;
    self.setData({ isLoading: true });

    if (!foodId) {
      self.setData({ reviews: [], allReviews: [], reviewStats: { total: 0, avgRating: '0.0', withImage: 0, fiveStarCount: 0, fourStarCount: 0, threeStarCount: 0 }, isLoading: false });
      return;
    }

    app.authRequest({
      url: '/review/food/' + foodId,
      method: 'GET'
    }).then(function(res) {
      self.setData({ isLoading: false });
      if (res && res.code === 200 && res.data) {
        var rawList = Array.isArray(res.data) ? res.data : [];
        var list = [];
        for (var ri = 0; ri < rawList.length; ri++) {
          var r = rawList[ri];
          var rating = r.rating || 5;
          var stars = [];
          for (var si = 0; si < rating; si++) stars.push(si + 1);
          list.push({
            id: r.reviewId || r.id,
            userName: r.userName || r.nickname || '匿名用户',
            avatarText: (r.userName || r.nickname || '匿')[0],
            rating: rating,
            time: r.createTime || '',
            content: r.content || '',
            images: r.images || [],
            stars: stars
          });
        }

        var total = list.length;
        var ratingSum = 0;
        for (var ti = 0; ti < list.length; ti++) {
          ratingSum += list[ti].rating;
        }
        var avgRating = total > 0 ? (ratingSum / total).toFixed(1) : '0.0';
        var withImage = 0;
        for (var wi = 0; wi < list.length; wi++) {
          if (list[wi].images && list[wi].images.length > 0) withImage++;
        }
        var fiveStarCount = 0;
        for (var fi = 0; fi < list.length; fi++) {
          if (list[fi].rating === 5) fiveStarCount++;
        }
        var fourStarCount = 0;
        for (var fri = 0; fri < list.length; fri++) {
          if (list[fri].rating === 4) fourStarCount++;
        }
        var threeStarCount = 0;
        for (var tii = 0; tii < list.length; tii++) {
          if (list[tii].rating <= 3) threeStarCount++;
        }

        self.setData({
          reviews: list,
          allReviews: list,
          reviewStats: { total: total, avgRating: avgRating, withImage: withImage, fiveStarCount: fiveStarCount, fourStarCount: fourStarCount, threeStarCount: threeStarCount },
          isLoading: false
        });
      } else {
        self.setData({ reviews: [], allReviews: [], reviewStats: { total: 0, avgRating: '0.0', withImage: 0, fiveStarCount: 0, fourStarCount: 0, threeStarCount: 0 }, isLoading: false });
      }
    }).catch(function(err) {
      console.error('加载评价失败', err);
      self.setData({ reviews: [], allReviews: [], reviewStats: { total: 0, avgRating: '0.0', withImage: 0, fiveStarCount: 0, fourStarCount: 0, threeStarCount: 0 }, isLoading: false });
    });
  },

  onPullDownRefresh: function() {
    this.loadReviews(this.data.foodId);
    wx.stopPullDownRefresh();
  }
});
