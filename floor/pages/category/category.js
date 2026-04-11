// 分类页面 - 大众点评风格
var app = getApp();

Page({
  data: {
    selectedCategoryIndex: -1,
    selectedCategory: '',
    activeSubCategory: '',
    cartCount: 0,
    isLoading: false,

    mainCategories: [
      { id: 1, name: '面食', icon: 'fa-cookie-bite', color: 'linear-gradient(135deg, #FF9A9E, #FAD0C4)' },
      { id: 2, name: '披萨', icon: 'fa-pizza-slice', color: 'linear-gradient(135deg, #A1C4FD, #C2E9FB)' },
      { id: 3, name: '汉堡', icon: 'fa-hamburger', color: 'linear-gradient(135deg, #FFD93D, #F6B93B)' },
      { id: 4, name: '甜品', icon: 'fa-birthday-cake', color: 'linear-gradient(135deg, #E0C3FC, #8EC5FC)' },
      { id: 5, name: '饮料', icon: 'fa-coffee', color: 'linear-gradient(135deg, #4ECDC4, #44A08D)' },
      { id: 6, name: '沙拉', icon: 'fa-leaf', color: 'linear-gradient(135deg, #95E1D3, #F38181)' },
      { id: 7, name: '火锅', icon: 'fa-fire', color: 'linear-gradient(135deg, #FF6B6B, #ee5a5a)' },
      { id: 8, name: '烧烤', icon: 'fa-drumstick-bite', color: 'linear-gradient(135deg, #f093fb, #f5576c)' },
      { id: 9, name: '日料', icon: 'fa-fish', color: 'linear-gradient(135deg, #89f7fe, #66a6ff)' },
      { id: 10, name: '快餐', icon: 'fa-bolt', color: 'linear-gradient(135deg, #ffecd2, #fcb69f)' }
    ],

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
    var tabParam = wx.getStorageSync('categoryTabParam');
    if (tabParam) {
      wx.removeStorageSync('categoryTabParam');
      if (tabParam === 'promo') {
        this.loadAllPromoFoods();
      } else {
        var idx = this.findCategoryIndex(tabParam);
        if (idx >= 0) {
          this.onCategoryTap({ currentTarget: { dataset: { index: idx, category: this.data.mainCategories[idx] } } });
        }
      }
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
    var cart = app.globalData.cart || [];

    var found = false;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].foodId === item.id) {
        cart[i].quantity += 1;
        found = true;
        break;
      }
    }
    if (!found) {
      cart.push({ foodId: item.id, name: item.name, price: item.price, image: item.image || '', quantity: 1, storeId: 1 });
    }
    app.updateCart(cart);
    wx.showToast({ title: '已加入购物车', icon: 'success', duration: 600 });
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
