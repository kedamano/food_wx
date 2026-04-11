// 搜索页

Page({
  data: {
    keyword: '',
    hasSearched: false,
    activeTab: 'food',
    foodResults: [],
    storeResults: [],
    searchHistory: [],
    hotSearches: ['牛肉面', '披萨', '烤肉', '奶茶', '麻辣香锅', '寿司']
  },

  onLoad: function(options) {
    var self = this;
    // 如果从其他页面传入关键词
    if (options.keyword) {
      this.setData({ keyword: options.keyword });
      this.doSearch(options.keyword);
    }
    // 加载搜索历史
    var history = wx.getStorageSync('searchHistory') || [];
    this.setData({ searchHistory: history });
  },

  // 输入
  onInput: function(e) {
    this.setData({ keyword: e.detail.value });
  },

  // 搜索
  onSearch: function() {
    var keyword = this.data.keyword.trim();
    if (!keyword) {
      wx.showToast({ title: '请输入搜索内容', icon: 'none' });
      return;
    }
    this.doSearch(keyword);
  },

  // 执行搜索
  doSearch: function(keyword) {
    var self = this;
    // 添加搜索历史
    this.addHistory(keyword);
    this.setData({
      hasSearched: true,
      keyword: keyword,
      foodResults: [],
      storeResults: []
    });

    wx.showLoading({ title: '搜索中...' });

    // 同时搜索美食和商家，手动模拟 Promise.all
    var pending = 2;
    var foodsResult = null;
    var storesResult = null;

    function checkDone() {
      if (pending === 0) {
        self.setData({ foodResults: foodsResult || [], storeResults: storesResult || [] });
        wx.hideLoading();
      }
    }

    self.searchFoods(keyword).then(function(foods) {
      foodsResult = foods;
      pending--;
      checkDone();
    }).catch(function() {
      foodsResult = [];
      pending--;
      checkDone();
    });

    self.searchStores(keyword).then(function(stores) {
      storesResult = stores;
      pending--;
      checkDone();
    }).catch(function() {
      storesResult = [];
      pending--;
      checkDone();
    });
  },

  // 搜索美食
  searchFoods: function(keyword) {
    var self = this;
    return new Promise(function(resolve) {
      var app = getApp();
      app.authRequest({
        url: '/food/search?name=' + encodeURIComponent(keyword),
        method: 'GET',
        success: function(res) {
          if (res && res.code === 200 && res.data) {
            var list = [];
            var rawList = res.data || [];
            for (var i = 0; i < rawList.length; i++) {
              var f = rawList[i];
              list.push({
                id: f.foodId || f.id,
                name: f.name,
                price: Number(f.price) || 0,
                rating: Number(f.rating) || 0,
                image: app.resolveImageUrl(f.image) || '',
                sales: f.sales || 0,
                categoryName: f.categoryName || ''
              });
            }
            resolve(list);
          } else {
            resolve([]);
          }
        },
        fail: function() { resolve([]); }
      });
    });
  },

  // 搜索商家
  searchStores: function(keyword) {
    var self = this;
    return new Promise(function(resolve) {
      var app = getApp();
      app.authRequest({
        url: '/store/search?storeName=' + encodeURIComponent(keyword),
        method: 'GET',
        success: function(res) {
          if (res && res.code === 200 && res.data) {
            var list = [];
            var rawList = res.data || [];
            for (var i = 0; i < rawList.length; i++) {
              var s = rawList[i];
              list.push({
                id: s.storeId || s.id,
                name: s.name || s.storeName,
                price: s.priceLevel || s.price || 30,
                rating: Number(s.rating) || 0,
                logo: app.resolveImageUrl(s.logo) || '',
                distance: s.distance || ''
              });
            }
            resolve(list);
          } else {
            resolve([]);
          }
        },
        fail: function() { resolve([]); }
      });
    });
  },

  // 切换Tab
  switchTab: function(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  // 清除输入
  onClear: function() {
    this.setData({ keyword: '', hasSearched: false, foodResults: [], storeResults: [] });
  },

  // 取消搜索
  onCancel: function() {
    wx.navigateBack();
  },

  // 点击搜索历史
  onHistoryTap: function(e) {
    var keyword = e.currentTarget.dataset.item || e.target.dataset.item;
    if (keyword) {
      this.setData({ keyword: keyword });
      this.doSearch(keyword);
    }
  },

  // 点击热门搜索
  onHotTap: function(e) {
    var keyword = e.currentTarget.dataset.item || e.target.dataset.item;
    if (keyword) {
      this.setData({ keyword: keyword });
      this.doSearch(keyword);
    }
  },

  // 清空搜索历史
  onClearHistory: function() {
    this.setData({ searchHistory: [] });
    wx.removeStorageSync('searchHistory');
  },

  // 添加搜索历史
  addHistory: function(keyword) {
    var self = this;
    var history = wx.getStorageSync('searchHistory') || [];
    // filter 改为 for 循环
    var newHistory = [];
    for (var i = 0; i < history.length; i++) {
      if (history[i] !== keyword) {
        newHistory.push(history[i]);
      }
    }
    history = newHistory;
    history.unshift(keyword);
    history = history.slice(0, 10);
    wx.setStorageSync('searchHistory', history);
    this.setData({ searchHistory: history });
  },

  // 点击美食
  onFoodTap: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/food-detail/food-detail?foodId=' + id });
  },

  // 点击商家
  onStoreTap: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/store-detail/store-detail?storeId=' + id });
  }
});
