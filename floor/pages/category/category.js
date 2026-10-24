// 分类页面 - 大众点评风格
var app = getApp();

Page({
  data: {
    selectedCategoryIndex: -1,
    selectedCategory: '',
    activeSubCategory: '',
    cartCount: 0,
    isLoading: false,

    // 分类从后端 /food/categories 加载（真实数据），渐变色按序号取池
    mainCategories: [],

    subCategories: [],
    categoryFoods: []
  },

  onLoad: function (options) {
    if (options && options.category) {
      var idx = this.findCategoryIndex(options.category);
      if (idx >= 0) {
        this.onCategoryTap({ currentTarget: { dataset: { index: idx, category: this.data.mainCategories[idx] } } });
      }
    }
  },

  onShow: function () {
    this.updateCartCount();
    var self = this;
    var tabParam = wx.getStorageSync('categoryTabParam');
    if (!tabParam) return;
    wx.removeStorageSync('categoryTabParam');
    var handle = function () {
      if (tabParam === 'promo') {
        self.loadAllPromoFoods();
      } else {
        self.selectByName(tabParam);
      }
    };
    if (this.data.mainCategories.length === 0) {
      this.loadCategoriesFromServer(handle);
    } else {
      handle();
    }
  },

  // 从后端加载真实分类
  loadCategoriesFromServer: function (done) {
    var self = this;
    var app = getApp();
    var colorPool = [
      'linear-gradient(135deg, #FF9A9E, #FAD0C4)',
      'linear-gradient(135deg, #A1C4FD, #C2E9FB)',
      'linear-gradient(135deg, #FFD93D, #F6B93B)',
      'linear-gradient(135deg, #E0C3FC, #8EC5FC)',
      'linear-gradient(135deg, #FF8855, #FF6633)',
      'linear-gradient(135deg, #95E1D3, #F38181)',
      'linear-gradient(135deg, #FF6B6B, #ee5a5a)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #89f7fe, #66a6ff)',
      'linear-gradient(135deg, #ffecd2, #fcb69f)'
    ];
    app.authRequest({
      url: '/food/categories',
      method: 'GET'
    }).then(function (res) {
      var cats = [];
      if (res && res.code === 200 && Array.isArray(res.data)) {
        for (var i = 0; i < res.data.length; i++) {
          var c = res.data[i];
          cats.push({
            id: c.id || c.categoryId,
            name: c.name || c.categoryName,
            color: colorPool[i % colorPool.length]
          });
        }
      }
      self.setData({ mainCategories: cats });
      if (typeof done === 'function') done();
    }).catch(function (err) {
      console.error('[category] 分类加载失败', err);
      // 自动重试一次，避免瞬时网络/热重载问题导致侧栏空白
      if (!self._catRetried) {
        self._catRetried = true;
        setTimeout(function () {
          self.loadCategoriesFromServer(done);
        }, 1500);
        return;
      }
      self.setData({ mainCategories: [] });
      if (typeof done === 'function') done();
    });
  },

  // 按名称选中分类
  selectByName: function (name) {
    var idx = this.findCategoryIndex(name);
    if (idx >= 0) {
      this.onCategoryTap({ currentTarget: { dataset: { index: idx, category: this.data.mainCategories[idx] } } });
    }
  },

  // 查找分类索引
  findCategoryIndex: function (name) {
    var cats = this.data.mainCategories;
    for (var i = 0; i < cats.length; i++) {
      if (cats[i].name === name) return i;
    }
    return -1;
  },

  // 加载所有优惠美食
  loadAllPromoFoods: function () {
    var self = this;
    this.setData({
      selectedCategoryIndex: -1,
      selectedCategory: '限时特惠',
      isLoading: true
    });

    app.authRequest({
      url: '/food/recommend',
      method: 'GET',
      success: function (res) {
        if (res && res.code === 200 && res.data) {
          var foods = [];
          var list = res.data || [];
          for (var i = 0; i < list.length; i++) {
            var f = list[i];
            var food = {};
            for (var key in f) { food[key] = f[key]; }
            food.image = app.resolveImageUrl(f.image) || f.image;
            food.id = f.foodId || f.id;
            foods.push(food);
          }
          self.setData({ categoryFoods: foods, isLoading: false });
        } else {
          self.setData({ isLoading: false });
        }
      },
      fail: function () {
        self.setData({ isLoading: false });
      }
    });
  },

  onSearchClick: function () {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  onCategoryTap: function (e) {
    var dataset = e.currentTarget.dataset;
    var index = dataset.index;
    var category = dataset.category;
    var subCategories = this.getSubCategories(category.name);

    this.setData({
      selectedCategoryIndex: index,
      selectedCategory: category.name,
      activeSubCategory: '',
      isLoading: true,
      subCategories: subCategories
    });
    this.loadCategoryFoods(category);
  },

  onSubCategoryTap: function (e) {
    var sub = e.currentTarget.dataset.subcategory;
    var newActive = sub.name === this.data.activeSubCategory ? '' : sub.name;
    this.setData({ activeSubCategory: newActive });

    if (this.data.activeSubCategory) {
      var filtered = [];
      for (var i = 0; i < this.data.categoryFoods.length; i++) {
        if (this.data.categoryFoods[i].subCategory === sub.name) {
          filtered.push(this.data.categoryFoods[i]);
        }
      }
      if (filtered.length > 0) {
        this.setData({ categoryFoods: filtered });
        return;
      }
    }
    // 重新加载
    var category = this.data.mainCategories[this.data.selectedCategoryIndex];
    if (category) this.loadCategoryFoods(category);
  },

  getSubCategories: function (categoryName) {
    return [];
  },

  loadCategoryFoods: function (category) {
    var self = this;
    app.authRequest({
      url: '/food/category/' + category.id,
      method: 'GET',
      success: function (res) {
        if (res && res.code === 200 && res.data) {
          var foods = [];
          var list = res.data || [];
          for (var i = 0; i < list.length; i++) {
            var f = list[i];
            var food = {};
            for (var key in f) { food[key] = f[key]; }
            food.image = app.resolveImageUrl ? app.resolveImageUrl(f.image) : f.image;
            foods.push(food);
          }
          self.setData({ categoryFoods: foods, isLoading: false });
        } else {
          self.setData({ categoryFoods: [], isLoading: false });
        }
      },
      fail: function () {
        self.setData({ categoryFoods: [], isLoading: false });
      }
    });
  },

  onAddToCart: function (e) {
    var item = e.currentTarget.dataset.item;
    // app.addToCart 内部做本地合并并在登录态下同步服务端
    app.addToCart({
      foodId: item.id,
      name: item.name,
      price: item.price,
      image: item.image || '',
      quantity: 1,
      storeId: item.storeId || 1
    });
    this.updateCartCount();
  },

  onFoodTap: function (e) {
    var foodId = e.currentTarget.dataset.foodId;
    wx.navigateTo({ url: '/pages/food-detail/food-detail?foodId=' + foodId });
  },

  updateCartCount: function () {
    this.setData({ cartCount: app.globalData.cartCount || 0 });
  },

  onPullDownRefresh: function () {
    var self = this;
    var category = this.data.mainCategories[this.data.selectedCategoryIndex];
    if (category) this.loadCategoryFoods(category);
    setTimeout(function () { wx.stopPullDownRefresh(); }, 1000);
  },

  onShareAppMessage: function () {
    return { title: '美食分类 - 发现更多美味', path: '/pages/category/category' };
  }
});
