// app.js
App({
  onLaunch: function() {
    var logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    this.initGlobalData();
    this.initAuthRequest();
    this.loadUserInfo();
  },

  initGlobalData: function() {
    if (!this.globalData.cart) {
      this.globalData.cart = [];
    }
    if (!this.globalData.cartCount) {
      this.globalData.cartCount = 0;
    }
    if (!this.globalData.userInfo) {
      this.globalData.userInfo = {
        isLoggedIn: false,
        name: '',
        avatar: '',
        level: '普通会员',
        points: 0,
        phone: '',
        email: ''
      };
    }
    if (!this.globalData.currentOrder) {
      this.globalData.currentOrder = null;
    }
    if (!this.globalData.searchHistory) {
      this.globalData.searchHistory = [];
    }
    if (!this.globalData.favoriteStores) {
      this.globalData.favoriteStores = [];
    }
    if (!this.globalData.addresses) {
      this.globalData.addresses = [];
    }
    if (!this.globalData.coupons) {
      this.globalData.coupons = [];
    }
    if (!this.globalData.loadingStatus) {
      this.globalData.loadingStatus = {
        banners: false,
        foods: false,
        stores: false,
        categories: false
      };
    }
    if (!this.globalData.lastRequest) {
      this.globalData.lastRequest = null;
    }
  },

  globalData: {
    userInfo: null,
    token: null,
    userId: null,
    cartCount: 0,
    cart: [],
    searchHistory: [],
    currentOrder: null
  },

  globalErrorHandle: function(error, showToast) {
    if (showToast === undefined) showToast = true;
    console.error('全局错误:', error);
    if (showToast) {
      wx.showToast({
        title: error.message || '操作失败',
        icon: 'none'
      });
    }
  },

  handleNetworkError: function(error) {
    var self = this;
    wx.showModal({
      title: '网络连接失败',
      content: '请检查网络设置后重试',
      confirmText: '重试',
      success: function(res) {
        if (res.confirm) {
          self.retryLastRequest();
        }
      }
    });
  },

  handleAuthError: function(error) {
    this.userLogout();
    wx.navigateTo({ url: '/pages/login/login' });
  },

  handleBusinessError: function(error) {
    if (error.data && error.data.details) {
      wx.showModal({
        title: '操作提示',
        content: error.data.details,
        showCancel: false
      });
    }
  },

  handleUnknownError: function(error) {
    wx.setStorageSync('errorLog', {
      timestamp: new Date().toISOString(),
      error: error.toString(),
      stack: error.stack
    });
  },

  retryLastRequest: function() {
    var lastRequest = this.globalData.lastRequest;
    if (lastRequest) {
      wx.showLoading({ title: '重试中...' });
      lastRequest().finally(function() {
        wx.hideLoading();
      });
    }
  },

  wrapRequest: function(requestFn, options) {
    options = options || {};
    var self = this;
    return function() {
      var args = Array.prototype.slice.call(arguments);
      var startTime = Date.now();
      try {
        self.globalData.lastRequest = function() { return requestFn.apply(null, args); };
        var result = requestFn.apply(null, args);
        var duration = Date.now() - startTime;
        return result;
      } catch (error) {
        self.globalErrorHandle(error, options.showToast);
        throw error;
      }
    };
  },

  apiConfig: require('./api/config'),

  /**
   * 当前环境 API 基础地址（来自 api/config.js，随开发/正式环境自适应）
   */
  apiBase: function() {
    return this.apiConfig.environments[this.apiConfig.currentEnv].baseURL;
  },

  getAuthHeaderConfig: function() {
    var token = this.globalData.token || wx.getStorageSync('token');
    if (token) {
      return {
        // 统一使用 Bearer 前缀，与 api/request.js 保持一致
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      };
    }
    return { 'Content-Type': 'application/json' };
  },

  resolveApiUrl: function(url) {
    if (url && url.indexOf('http') === 0) return url;
    if (url && url.indexOf('/') === 0) return this.apiBase() + url;
    if (url) {
      var parts = url.split('/');
      if (parts.length >= 2) {
        var ns = this.apiConfig.endpoints[parts[0]];
        if (ns) {
          var endpoint = ns[parts[1]];
          if (endpoint) {
            var params = {};
            for (var i = 2; i < parts.length - 1; i += 2) {
              if (parts[i + 1]) params[parts[i]] = parts[i + 1];
            }
            return this.apiConfig.getApiUrl(endpoint, params);
          }
        }
      }
    }
    return this.apiBase() + (url || '');
  },

  resolveImageUrl: function(url) {
    if (!url) return '';
    if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) return url;
    // 使用完整 URL（微信小程序需要）
    if (url.indexOf('/images/') === 0) return this.apiBase() + url;
    if (url.indexOf('/') === 0) return this.apiBase() + url;
    return url;
  },

  createAuthRequest: function(originalRequest) {
    var self = this;
    return function(options) {
      if (!options.header) options.header = {};
      options.url = self.resolveApiUrl(options.url);
      var authHeaders = self.getAuthHeaderConfig();

      var successCallback = options.success;
      var failCallback = options.fail;
      var completeCallback = options.complete;

      var extendedOptions = {};
      for (var key in options) {
        extendedOptions[key] = options[key];
      }
      extendedOptions.header = {};
      for (var hk in options.header) {
        extendedOptions.header[hk] = options.header[hk];
      }
      var authHeaders = self.getAuthHeaderConfig();
      for (hk in authHeaders) {
        extendedOptions.header[hk] = authHeaders[hk];
      }
      extendedOptions.timeout = self.apiConfig.getTimeout();

      var promise = new Promise(function(resolve, reject) {
        extendedOptions.success = function(res) {
          if (res.statusCode === 401) {
            // HTTP 401 统一走重新登录
            self.handleAuthError({ message: '登录已过期', code: 'AUTH_ERROR' });
            reject(new Error('登录已过期'));
          } else if (res.statusCode === 200) {
            if (res.data && (res.data.code === 401 || res.data.message === '未登录')) {
              self.handleAuthError({ message: '未登录', code: 'AUTH_ERROR' });
              reject(new Error('未登录'));
            } else if (res.data && res.data.code === 200) {
              if (successCallback) successCallback(res.data);
              resolve(res.data);
            } else if (res.statusCode === 200 && (!res.data || !res.data.code)) {
              if (successCallback) successCallback(res.data || res);
              resolve(res.data || res);
            } else {
              if (failCallback) {
                failCallback(new Error(res.data.message || '请求失败'));
              } else {
                reject(new Error(res.data.message || '请求失败'));
              }
            }
          } else {
            if (failCallback) {
              failCallback(new Error('请求失败：' + res.statusCode));
            } else {
              reject(new Error('请求失败：' + res.statusCode));
            }
          }
        };
        extendedOptions.fail = function(err) {
          console.error('请求失败：', err);
          if (failCallback) failCallback(err);
          // 不再 reject，由 failCallback 处理错误
        };
        extendedOptions.complete = function() {
          if (completeCallback) completeCallback();
        };
        originalRequest(extendedOptions);
      });

      // 如果有 fail 回调，错误已被回调处理，不再抛出
      if (failCallback) {
        return promise.catch(function() {});
      }
      return promise;
    };
  },

  initAuthRequest: function() {
    this.authRequest = this.createAuthRequest(wx.request);
  },

  loadUserInfo: function() {
    var token = wx.getStorageSync('token');
    var userInfo = wx.getStorageSync('userInfo');
    var userId = wx.getStorageSync('userId');
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      if (userId) this.globalData.userId = userId;
      // 登录态下以后端购物车为准
      this.syncCartFromServer();
    }
  },

  /**
   * 是否处于登录态（有 token 且能确定 userId）
   */
  isLoggedIn: function() {
    var token = this.globalData.token || wx.getStorageSync('token');
    var userId = this.globalData.userId || wx.getStorageSync('userId');
    return !!(token && userId);
  },

  getCurrentUserId: function() {
    return this.globalData.userId || wx.getStorageSync('userId');
  },

  /**
   * 登录后合并本地购物车到服务端，并拉取服务端购物车
   */
  mergeLocalCartToServer: function() {
    var self = this;
    var userId = this.getCurrentUserId();
    if (!userId || !this.globalData.cart || this.globalData.cart.length === 0) {
      this.syncCartFromServer();
      return;
    }
    var items = [];
    for (var i = 0; i < this.globalData.cart.length; i++) {
      var item = this.globalData.cart[i];
      items.push({
        foodId: item.foodId,
        quantity: item.quantity,
        storeId: item.storeId
      });
    }
    wx.request({
      url: this.apiBase() + '/cart/user/' + userId + '/merge',
      method: 'POST',
      header: this.getAuthHeaderConfig(),
      data: items,
      success: function(res) {
        // 合并完成后清空本地购物车，以服务端为准
        self.globalData.cart = [];
        self.globalData.cartCount = 0;
        wx.removeStorageSync('cart');
        wx.removeStorageSync('cartCount');
        self.syncCartFromServer();
      },
      fail: function(err) {
        console.error('合并购物车失败：', err);
      }
    });
  },

  /**
   * 拉取服务端购物车并更新本地缓存（仅登录态）
   */
  syncCartFromServer: function() {
    var self = this;
    if (!this.isLoggedIn()) return;
    var userId = this.getCurrentUserId();
    wx.request({
      url: this.apiBase() + '/cart/user/' + userId,
      method: 'GET',
      header: this.getAuthHeaderConfig(),
      success: function(res) {
        if (res.statusCode === 200 && res.data && res.data.code === 200 && Array.isArray(res.data.data)) {
          var serverCart = [];
          for (var i = 0; i < res.data.data.length; i++) {
            var item = res.data.data[i];
            serverCart.push({
              foodId: item.foodId,
              name: item.foodName,
              price: Number(item.foodPrice) || 0,
              image: item.foodImage,
              quantity: Number(item.quantity) || 1,
              storeId: item.storeId,
              cartId: item.cartId
            });
          }
          self.updateCart(serverCart);
        }
      },
      fail: function(err) {
        console.error('同步购物车失败：', err);
      }
    });
  },

  updateCart: function(cartItems) {
    this.globalData.cart = cartItems;
    var totalCount = 0;
    for (var i = 0; i < cartItems.length; i++) {
      totalCount += cartItems[i].quantity;
    }
    this.globalData.cartCount = totalCount;
    wx.setStorageSync('cart', cartItems);
    wx.setStorageSync('cartCount', this.globalData.cartCount);

    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1];
    if (currentPage && currentPage.route === 'pages/cart/cart' && typeof currentPage.useGlobalCartData === 'function') {
      currentPage.useGlobalCartData();
    }
    for (var j = 0; j < pages.length; j++) {
      var tabBar = pages[j].selectComponent('#tabbar');
      if (tabBar) tabBar.updateCartCount(this.globalData.cartCount);
    }
  },

  /**
   * 加入购物车：本地立即生效；登录态下同步到服务端
   */
  addToCart: function(foodItem) {
    var self = this;
    var cart = this.globalData.cart;
    var existingIndex = -1;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].foodId === foodItem.foodId) { existingIndex = i; break; }
    }
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += foodItem.quantity;
    } else {
      cart.push(foodItem);
    }
    this.updateCart(cart);
    wx.showToast({ title: '已加入购物车', icon: 'success' });

    if (this.isLoggedIn()) {
      wx.request({
        url: this.apiBase() + '/cart',
        method: 'POST',
        header: this.getAuthHeaderConfig(),
        data: {
          foodId: foodItem.foodId,
          quantity: foodItem.quantity,
          storeId: foodItem.storeId
        },
        success: function(res) {
          if (res.statusCode === 200 && res.data && res.data.code === 200) {
            // 回填服务端 cartId，便于后续更新/删除
            var saved = res.data.data;
            for (var k = 0; k < self.globalData.cart.length; k++) {
              if (self.globalData.cart[k].foodId === foodItem.foodId && !self.globalData.cart[k].cartId && saved) {
                self.globalData.cart[k].cartId = saved.cartId;
              }
            }
            wx.setStorageSync('cart', self.globalData.cart);
          } else if (res.statusCode === 401) {
            self.handleAuthError({ message: '登录已过期' });
          }
        }
      });
    }
  },

  /**
   * 从购物车移除：本地立即生效；登录态下同步删除服务端
   */
  removeFromCart: function(foodId, cartId) {
    var cart = this.globalData.cart;
    var updatedCart = [];
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].foodId !== foodId) updatedCart.push(cart[i]);
    }
    this.updateCart(updatedCart);

    if (this.isLoggedIn()) {
      var userId = this.getCurrentUserId();
      var url = cartId
        ? this.apiBase() + '/cart/' + cartId
        : this.apiBase() + '/cart/user/' + userId + '/food/' + foodId;
      wx.request({
        url: url,
        method: 'DELETE',
        header: this.getAuthHeaderConfig(),
        success: function(res) {
          if (res.statusCode === 401) {
            getApp().handleAuthError({ message: '登录已过期' });
          }
        }
      });
    }
  },

  /**
   * 更新购物车项数量：本地立即生效；登录态下同步到服务端
   */
  updateCartItemQuantity: function(foodId, quantity, cartId) {
    var cart = this.globalData.cart;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].foodId === foodId) {
        cart[i].quantity = quantity;
        this.updateCart(cart);
        break;
      }
    }

    if (this.isLoggedIn() && cartId) {
      wx.request({
        url: this.apiBase() + '/cart/' + cartId,
        method: 'PUT',
        header: this.getAuthHeaderConfig(),
        data: { quantity: quantity },
        success: function(res) {
          if (res.statusCode === 401) {
            getApp().handleAuthError({ message: '登录已过期' });
          }
        }
      });
    }
  },

  clearCart: function(syncServer) {
    this.globalData.cart = [];
    this.globalData.cartCount = 0;
    // 本地存储也要清空，与内存保持一致
    wx.removeStorageSync('cart');
    wx.removeStorageSync('cartCount');

    if (syncServer && this.isLoggedIn()) {
      var userId = this.getCurrentUserId();
      wx.request({
        url: this.apiBase() + '/cart/user/' + userId + '/clear',
        method: 'DELETE',
        header: this.getAuthHeaderConfig(),
        success: function(res) {
          if (res.statusCode === 401) {
            getApp().handleAuthError({ message: '登录已过期' });
          }
        }
      });
    }
  },

  userLogin: function(userInfo) {
    var merged = {};
    for (var key in userInfo) merged[key] = userInfo[key];
    merged.isLoggedIn = true;
    this.globalData.userInfo = merged;
    wx.setStorageSync('userInfo', this.globalData.userInfo);
  },

  userLogout: function() {
    this.globalData.userInfo = {
      isLoggedIn: false,
      name: '',
      avatar: '',
      level: '普通会员',
      points: 0,
      phone: '',
      email: ''
    };
    wx.removeStorageSync('userInfo');
    this.clearCart();
  },

  updateUserInfo: function(userInfo) {
    var merged = {};
    var existing = this.globalData.userInfo || {};
    for (var key in existing) merged[key] = existing[key];
    for (var k in userInfo) merged[k] = userInfo[k];
    this.globalData.userInfo = merged;
    wx.setStorageSync('userInfo', this.globalData.userInfo);
  },

  addSearchHistory: function(keyword) {
    var history = this.globalData.searchHistory;
    var filteredHistory = [];
    for (var i = 0; i < history.length; i++) {
      if (history[i] !== keyword) filteredHistory.push(history[i]);
    }
    filteredHistory.unshift(keyword);
    this.globalData.searchHistory = filteredHistory.slice(0, 10);
    wx.setStorageSync('searchHistory', this.globalData.searchHistory);
  },

  clearSearchHistory: function() {
    this.globalData.searchHistory = [];
    wx.removeStorageSync('searchHistory');
  },

  addFavoriteStore: function(storeId) {
    var favorites = this.globalData.favoriteStores;
    if (favorites.indexOf(storeId) === -1) {
      favorites.push(storeId);
      wx.setStorageSync('favoriteStores', favorites);
    }
  },

  removeFavoriteStore: function(storeId) {
    var favorites = this.globalData.favoriteStores;
    var updatedFavorites = [];
    for (var i = 0; i < favorites.length; i++) {
      if (favorites[i] !== storeId) updatedFavorites.push(favorites[i]);
    }
    this.globalData.favoriteStores = updatedFavorites;
    wx.setStorageSync('favoriteStores', updatedFavorites);
  },

  isFavoriteStore: function(storeId) {
    return this.globalData.favoriteStores.indexOf(storeId) !== -1;
  },

  addAddress: function(address) {
    var addresses = this.globalData.addresses;
    addresses.push(address);
    this.globalData.addresses = addresses;
    wx.setStorageSync('addresses', addresses);
  },

  updateAddress: function(addressId, address) {
    var addresses = this.globalData.addresses;
    for (var i = 0; i < addresses.length; i++) {
      if (addresses[i].id === addressId) {
        addresses[i] = address;
        break;
      }
    }
    this.globalData.addresses = addresses;
    wx.setStorageSync('addresses', addresses);
  },

  deleteAddress: function(addressId) {
    var addresses = this.globalData.addresses;
    var updatedAddresses = [];
    for (var i = 0; i < addresses.length; i++) {
      if (addresses[i].id !== addressId) updatedAddresses.push(addresses[i]);
    }
    this.globalData.addresses = updatedAddresses;
    wx.setStorageSync('addresses', updatedAddresses);
  },

  setDefaultAddress: function(addressId) {
    var addresses = this.globalData.addresses;
    for (var i = 0; i < addresses.length; i++) {
      addresses[i].isDefault = (addresses[i].id === addressId);
    }
    this.globalData.addresses = addresses;
    wx.setStorageSync('addresses', addresses);
  },

  getDefaultAddress: function() {
    var addresses = this.globalData.addresses;
    for (var i = 0; i < addresses.length; i++) {
      if (addresses[i].isDefault) return addresses[i];
    }
    return null;
  }
});
