// index.js - 大众点评风格首页
var app = getApp();

Page({
  data: {
    city: '北京',
    cityIndex: 0,
    cityList: ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆', '天津', '苏州', '长沙', '厦门', '青岛', '大连', '沈阳', '哈尔滨'],
    isRefreshing: false,
    hasMore: true,
    activeFilter: 'default',

    // 轮播图
    banners: [
      {
        id: 1,
        title: '周末美食大放送',
        subtitle: '精选好店，限时5折',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop'
      },
      {
        id: 2,
        title: '新店开业 特惠尝鲜',
        subtitle: '全场满减，惊喜不断',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop'
      },
      {
        id: 3,
        title: '人气美食榜单',
        subtitle: '百万吃货都在吃',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop'
      }
    ],

    // 功能入口
    channelList: [
      { id: 1, name: '美食', icon: '🍜', bgColor: '#FFF2E8', iconColor: '#FF6633' },
      { id: 2, name: '甜品饮品', icon: '🍰', bgColor: '#FDE8F0', iconColor: '#FF6699' },
      { id: 3, name: '快餐简餐', icon: '🍔', bgColor: '#FFF2E8', iconColor: '#FF8855' },
      { id: 4, name: '火锅烤肉', icon: '🔥', bgColor: '#FFF3E0', iconColor: '#FF9800' },
      { id: 5, name: '面条米粉', icon: '🍝', bgColor: '#E3F2FD', iconColor: '#2196F3' },
      { id: 6, name: '烧烤撸串', icon: '🍗', bgColor: '#FBE9E7', iconColor: '#E64A19' },
      { id: 7, name: '自助餐', icon: '🍽️', bgColor: '#F3E5F5', iconColor: '#9C27B0' },
      { id: 8, name: '生鲜超市', icon: '🥕', bgColor: '#E8F5E9', iconColor: '#009688' },
      { id: 9, name: '排行榜', icon: '🏆', bgColor: '#FFF8E1', iconColor: '#FFB300' },
      { id: 10, name: '全部分类', icon: '☰', bgColor: '#F5F5F5', iconColor: '#757575' }
    ],

    // 限时特惠
    promoList: [],
    countdown: { h: '02', m: '30', s: '45' },

    // 商家列表
    nearbyStores: [],

    // 搜索
    searchValue: ''
  },

  onLoad: function () {
    // 恢复上次选择的城市
    var savedCity = wx.getStorageSync('currentCity');
    if (savedCity) {
      var cityList = this.data.cityList;
      var idx = cityList.indexOf(savedCity);
      if (idx >= 0) {
        this.setData({ city: savedCity, cityIndex: idx });
      }
    }
    this.loadDataFromServer();
    this.startCountdown();
  },

  onShow: function () {
    // 可在此刷新数据
  },

  // 城市选择
  onCityChange: function (e) {
    var idx = e.detail.value;
    var city = this.data.cityList[idx];
    this.setData({ city: city, cityIndex: idx });
    wx.setStorageSync('currentCity', city);
    wx.showToast({ title: '已切换到' + city, icon: 'none' });
    // 刷新商家列表
    this.loadDataFromServer();
  },

  // 搜索
  onSearchTap: function () {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  // 扫码
  onScanTap: function () {
    wx.scanCode({
      onlyFromCamera: false,
      success: function (res) {
        console.log('扫码结果：', res);
        wx.showToast({ title: '扫码成功', icon: 'success' });
      },
      fail: function () {}
    });
  },

  // 功能入口 - 携带分类参数跳转到分类页
  onChannelTap: function (e) {
    var channel = e.currentTarget.dataset.channel;
    console.log('点击功能入口：', channel.name);
    if (channel.name === '全部分类') {
      wx.setStorageSync('categoryTabParam', '');
      wx.switchTab({ url: '/pages/category/category' });
    } else if (channel.name === '排行榜') {
      wx.setStorageSync('categoryTabParam', '排行榜');
      wx.switchTab({ url: '/pages/category/category' });
    } else {
      wx.setStorageSync('categoryTabParam', channel.name);
      wx.switchTab({ url: '/pages/category/category' });
    }
  },

  // 筛选
  onFilterTap: function (e) {
    var filter = e.currentTarget.dataset.filter;
    this.setData({ activeFilter: filter });
    this.filterStores(filter);
  },

  // 倒计时
  startCountdown: function () {
    var totalSeconds = 2 * 3600 + 30 * 60 + 45;
    var self = this;
    var timer = setInterval(function () {
      totalSeconds--;
      if (totalSeconds <= 0) { clearInterval(timer); return; }
      var h = String(Math.floor(totalSeconds / 3600));
      if (h.length < 2) h = '0' + h;
      var m = String(Math.floor((totalSeconds % 3600) / 60));
      if (m.length < 2) m = '0' + m;
      var s = String(totalSeconds % 60);
      if (s.length < 2) s = '0' + s;
      self.setData({ countdown: { h: h, m: m, s: s } });
    }, 1000);
    this._countdownTimer = timer;
  },

  onUnload: function () {
    if (this._countdownTimer) clearInterval(this._countdownTimer);
  },

  // 筛选商家
  filterStores: function (filter) {
    var allStores = this.data._allStores || [];
    // 用 slice 复制数组，避免直接修改
    var stores = allStores.slice();
    if (filter === 'rating') {
      stores.sort(function (a, b) { return b.rating - a.rating; });
    } else if (filter === 'nearby') {
      stores.sort(function (a, b) { return parseFloat(a.distance) - parseFloat(b.distance); });
    }
    this.setData({ nearbyStores: stores });
  },

  // 更多特惠
  onMorePromo: function () {
    wx.setStorageSync('categoryTabParam', 'promo');
    wx.switchTab({ url: '/pages/category/category' });
  },

  // 商家点击
  onStoreTap: function (e) {
    var storeId = e.currentTarget.dataset.storeId;
    wx.navigateTo({ url: '/pages/store-detail/store-detail?storeId=' + storeId });
  },

  // 美食点击
  onFoodTap: function (e) {
    var foodId = e.currentTarget.dataset.foodId;
    wx.navigateTo({ url: '/pages/food-detail/food-detail?foodId=' + foodId });
  },

  // 加载更多
  loadMore: function () {
    wx.showToast({ title: '已加载全部', icon: 'none' });
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    var self = this;
    self.setData({ isRefreshing: true });
    self.loadDataFromServer().then(function () {
      self.setData({ isRefreshing: false });
    }).catch(function () {
      self.setData({ isRefreshing: false });
    });
  },

  // 从服务器加载数据（ES5 版本）
  loadDataFromServer: function () {
    var self = this;
    wx.showLoading({ title: '加载中...' });

    return new Promise(function (resolve, reject) {
      // 并行请求 banners、foods、stores
      var bannersDone = false;
      var foodsDone = false;
      var storesDone = false;
      var bannersData = [];
      var foodsData = [];
      var storesData = [];
      var hasError = false;

      function checkAllDone() {
        if (bannersDone && foodsDone && storesDone) {
          if (hasError) {
            wx.hideLoading();
            reject(new Error('部分数据加载失败'));
            return;
          }

          // 生成特惠列表
          var foodsSlice = foodsData.slice(0, 6);
          var promoList = [];
          for (var i = 0; i < foodsSlice.length; i++) {
            var f = foodsSlice[i];
            promoList.push({
              id: f.id,
              name: f.name,
              price: f.price,
              rating: f.rating,
              image: f.image,
              sales: f.sales,
              reviews: f.reviews,
              originalPrice: (Number(f.price) * 1.5).toFixed(0),
              discount: Math.floor(Math.random() * 3 + 5) + '折'
            });
          }

          // 处理商家数据
          var tagPool = ['必吃榜', '人气旺', '品质优选', '回头客多', '环境优雅', '味道赞'];
          var dealPool = ['满100减20', '新客立减15', '满50减8', '招牌菜8折', '双人套餐特惠'];
          var reviewKeywords = ['口味绝佳', '环境很好', '性价比高', '分量十足', '服务热情', '食材新鲜'];

          var processedStores = [];
          for (var j = 0; j < storesData.length; j++) {
            var store = storesData[j];
            processedStores.push({
              id: store.id,
              name: store.name,
              price: store.price,
              rating: store.rating,
              distance: store.distance,
              deliveryTime: store.deliveryTime,
              reviews: store.reviews,
              banner: store.banner,
              rank: j < 3 ? j + 1 : null,
              tags: [tagPool[j % tagPool.length]],
              deals: [dealPool[j % dealPool.length]],
              reviewKeyword: reviewKeywords[j % reviewKeywords.length]
            });
          }

          self.setData({
            banners: bannersData,
            promoList: promoList,
            nearbyStores: processedStores,
            _allStores: processedStores
          });

          wx.hideLoading();
          resolve();
        }
      }

      // 请求 banners
      self.getBanners(function (data) {
        bannersData = data;
        bannersDone = true;
        checkAllDone();
      }, function () {
        bannersDone = true;
        hasError = true;
        checkAllDone();
      });

      // 请求推荐美食
      self.getRecommendFoods(function (data) {
        foodsData = data;
        foodsDone = true;
        checkAllDone();
      }, function () {
        foodsDone = true;
        hasError = true;
        checkAllDone();
      });

      // 请求附近商家
      self.getNearbyStores(function (data) {
        storesData = data;
        storesDone = true;
        checkAllDone();
      }, function () {
        storesDone = true;
        hasError = true;
        checkAllDone();
      });
    });
  },

  // 获取轮播图
  getBanners: function (onSuccess, onFail) {
    var defaultBanners = [
      { id: 1, title: '周末美食大放送', subtitle: '精选好店，限时5折', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop' },
      { id: 2, title: '新店开业 特惠尝鲜', subtitle: '全场满减，惊喜不断', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop' },
      { id: 3, title: '人气美食榜单', subtitle: '百万吃货都在吃', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop' }
    ];
    app.authRequest({
      url: '/food/banners',
      method: 'GET',
      success: function (res) {
        if (res && res.code === 200 && res.data) {
          onSuccess(res.data);
        } else {
          onSuccess(defaultBanners);
        }
      },
      fail: function () {
        onSuccess(defaultBanners.slice(0, 2));
      }
    });
  },

  // 获取推荐美食
  getRecommendFoods: function (onSuccess, onFail) {
    app.authRequest({
      url: '/food/recommend',
      method: 'GET',
      success: function (res) {
        if (res && res.code === 200 && res.data) {
          var formatted = [];
          for (var i = 0; i < res.data.length; i++) {
            var food = res.data[i];
            formatted.push({
              id: food.foodId || food.id,
              name: food.name,
              price: Number(food.price) || 0,
              rating: Number(food.rating) || 4.5,
              image: app.resolveImageUrl(food.image) || '',
              sales: food.sales || 0,
              reviews: food.reviews || 0
            });
          }
          onSuccess(formatted);
        } else {
          onSuccess([]);
        }
      },
      fail: function () {
        onSuccess([]);
      }
    });
  },

  // 获取附近商家
  getNearbyStores: function (onSuccess, onFail) {
    app.authRequest({
      url: '/store/nearby',
      method: 'GET',
      success: function (res) {
        if (res && res.code === 200 && res.data) {
          var formatted = [];
          for (var i = 0; i < res.data.length; i++) {
            var store = res.data[i];
            formatted.push({
              id: store.storeId || store.id,
              name: store.storeName || store.name,
              price: store.priceLevel || store.price || 30,
              rating: Number(store.rating) || 4.5,
              distance: store.distance || '1.5km',
              deliveryTime: store.deliveryTime || '30 分钟',
              reviews: store.reviews || Math.floor(Math.random() * 200) + 50,
              banner: app.resolveImageUrl(store.logo) || store.banner || ''
            });
          }
          onSuccess(formatted);
        } else {
          onSuccess([]);
        }
      },
      fail: function () {
        onSuccess([]);
      }
    });
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: '美食探店 - 发现身边美味',
      path: '/pages/index/index'
    };
  }
});
