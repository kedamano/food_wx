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
        image: '/images/banners/banner_1.jpg'
      },
      {
        id: 2,
        title: '新店开业 特惠尝鲜',
        subtitle: '全场满减，惊喜不断',
        image: '/images/banners/banner_2.jpg'
      },
      {
        id: 3,
        title: '人气美食榜单',
        subtitle: '百万吃货都在吃',
        image: '/images/banners/banner_3.jpg'
      }
    ],

    // 功能入口
    channelList: [
      { id: 1, name: '美食', icon: 'store', bgColor: '#FFF2E8', iconColor: '#FF6633' },
      { id: 2, name: '甜品饮品', icon: 'gift', bgColor: '#FDE8F0', iconColor: '#FF6699' },
      { id: 3, name: '快餐简餐', icon: 'bag', bgColor: '#FFF2E8', iconColor: '#FF8855' },
      { id: 4, name: '火锅烤肉', icon: 'hot', bgColor: '#FFF3E0', iconColor: '#FF9800' },
      { id: 5, name: '面条米粉', icon: 'store', bgColor: '#E3F2FD', iconColor: '#2196F3' },
      { id: 6, name: '烧烤撸串', icon: 'hot', bgColor: '#FBE9E7', iconColor: '#E64A19' },
      { id: 7, name: '自助餐', icon: 'store', bgColor: '#F3E5F5', iconColor: '#9C27B0' },
      { id: 8, name: '生鲜超市', icon: 'list', bgColor: '#E8F5E9', iconColor: '#009688' },
      { id: 9, name: '排行榜', icon: 'star-fill', bgColor: '#FFF8E1', iconColor: '#FFB300' },
      { id: 10, name: '全部分类', icon: 'grid', bgColor: '#F5F5F5', iconColor: '#757575' }
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
    wx.navigateTo({ url: '/pkg-user/search/search' });
  },

  // 扫码
  onScanTap: function () {
    wx.scanCode({
      onlyFromCamera: false,
      success: function (res) {
        var result = res.result || '';
        // 结果为纯数字时视为商品ID，跳转商品详情
        if (/^\d+$/.test(result)) {
          wx.navigateTo({ url: '/pages/food-detail/food-detail?foodId=' + result });
          return;
        }
        wx.showModal({ title: '扫码结果', content: result || '（空）', showCancel: false });
      },
      fail: function () {}
    });
  },

  // 功能入口 - 携带分类参数跳转到分类页
  onChannelTap: function (e) {
    var channel = e.currentTarget.dataset.channel;
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
    var self = this;
    // 真实倒计时：到当天 24:00 的剩余秒数（每日特惠自然日结束）
    var computeRemain = function () {
      var now = new Date();
      var end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      return Math.max(0, Math.floor((end - now) / 1000));
    };
    var totalSeconds = computeRemain();
    var timer = setInterval(function () {
      totalSeconds--;
      if (totalSeconds <= 0) { totalSeconds = computeRemain(); }
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

  // 切后台时暂停倒计时（tab 页常驻，避免后台空转每秒 setData）
  onHide: function () {
    if (this._countdownTimer) { clearInterval(this._countdownTimer); this._countdownTimer = null; }
  },

  onShow: function () {
    // 从后台回来且没有计时器时恢复
    if (!this._countdownTimer && this.startCountdown) this.startCountdown();
  },

  onUnload: function () {
    if (this._countdownTimer) clearInterval(this._countdownTimer);
  },

  // 筛选商家
  filterStores: function (filter) {
    var allStores = this._allStores || [];
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

  // 错误重试（error-retry 组件）
  onDataRetry: function () {
    this.setData({ isRefreshing: true, showError: false });
    var self = this;
    self.loadDataFromServer().then(function () {
      self.setData({ isRefreshing: false });
    }).catch(function () {
      self.setData({ isRefreshing: false });
    });
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

    self.setData({ showError: false });
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
            self.setData({ showError: true });
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
              discount: Math.max(5, Math.round(Number(f.price) / Math.max(1, Number(f.price) * 1.5) * 10)) + '折'
            });
          }

          // 处理商家数据
          var tagPool = ['必吃榜', '人气旺', '品质优选', '回头客多', '环境优雅', '味道赞'];
          var dealPool = ['满100减20', '新客立减15', '满50减8', '招牌菜8折', '双人套餐特惠'];
          // 按 storeId 稳定取样，避免每次进入页面随机变化
          var pickStable = function (pool, seed) {
            return pool[seed % pool.length];
          };
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

          // 全量商家放页面实例（非渲染数据不进 data）；checkAllDone 是普通函数，用闭包里的 self
          self._allStores = processedStores;
          self.setData({
            banners: bannersData,
            promoList: promoList,
            nearbyStores: processedStores
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
      { id: 1, title: '周末美食大放送', subtitle: '精选好店，限时5折', image: '/images/banners/banner_1.jpg' },
      { id: 2, title: '新店开业 特惠尝鲜', subtitle: '全场满减，惊喜不断', image: '/images/banners/banner_2.jpg' },
      { id: 3, title: '人气美食榜单', subtitle: '百万吃货都在吃', image: '/images/banners/banner_3.jpg' }
    ];
    app.authRequest({
      url: '/food/banners',
      method: 'GET',
      success: function (res) {
        if (res && res.code === 200 && res.data) {
          // 后端 Banner 字段是 imageUrl，映射为 wxml 使用的 image 并解析为包内路径
          var mapped = [];
          for (var i = 0; i < res.data.length; i++) {
            var b = res.data[i];
            mapped.push({
              id: b.id,
              title: b.title,
              subtitle: b.subtitle,
              image: app.resolveImageUrl(b.imageUrl || b.image) || ''
            });
          }
          onSuccess(mapped);
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
              reviews: store.reviews || store.sales || 0,
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
