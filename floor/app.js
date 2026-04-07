// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    // 初始化全局数据
    this.initGlobalData()

    // 初始化认证请求
    this.initAuthRequest()

    // 加载用户信息
    this.loadUserInfo()
  },

  // 初始化全局数据
  initGlobalData() {
    // 购物车数据
    if (!this.globalData.cart) {
      this.globalData.cart = []
    }

    // 购物车数量
    if (!this.globalData.cartCount) {
      this.globalData.cartCount = 0
    }

    // 用户信息
    if (!this.globalData.userInfo) {
      this.globalData.userInfo = {
        isLoggedIn: false,
        name: '',
        avatar: '',
        level: '普通会员',
        points: 0,
        phone: '',
        email: ''
      }
    }

    // 当前订单
    if (!this.globalData.currentOrder) {
      this.globalData.currentOrder = null
    }

    // 搜索历史
    if (!this.globalData.searchHistory) {
      this.globalData.searchHistory = []
    }

    // 收藏商家
    if (!this.globalData.favoriteStores) {
      this.globalData.favoriteStores = []
    }

    // 收货地址
    if (!this.globalData.addresses) {
      this.globalData.addresses = []
    }

    // 优惠券
    if (!this.globalData.coupons) {
      this.globalData.coupons = []
    }

    // 加载状态
    if (!this.globalData.loadingStatus) {
      this.globalData.loadingStatus = {
        banners: false,
        foods: false,
        stores: false,
        categories: false
      }
    }

    // 最后请求记录
    if (!this.globalData.lastRequest) {
      this.globalData.lastRequest = null
    }

    console.log('全局数据初始化完成')
  },

  // 全局数据
  globalData: {
    userInfo: null,
    token: null,
    userId: null,
    cartCount: 0,
    cart: [],
    searchHistory: [],
    currentOrder: null
  },

  // 全局错误处理
  globalErrorHandle(error, showToast = true) {
    console.error('全局错误:', error);
    if (showToast) {
      wx.showToast({
        title: error.message || '操作失败',
        icon: 'none'
      });
    }
  },

  // 网络错误处理
  handleNetworkError(error) {
    console.log('网络错误：', error);
    // 可以在这里添加重试逻辑
    wx.showModal({
      title: '网络连接失败',
      content: '请检查网络设置后重试',
      confirmText: '重试',
      success: (res) => {
        if (res.confirm) {
          // 触发重试逻辑
          this.retryLastRequest();
        }
      }
    });
  },

  // 认证错误处理
  handleAuthError(error) {
    console.log('认证错误：', error);
    // 清除用户信息，跳转到登录页
    this.userLogout();
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 业务错误处理
  handleBusinessError(error) {
    console.log('业务错误：', error);
    // 显示具体的业务错误信息
    if (error.data && error.data.details) {
      wx.showModal({
        title: '操作提示',
        content: error.data.details,
        showCancel: false
      });
    }
  },

  // 未知错误处理
  handleUnknownError(error) {
    console.log('未知错误：', error);
    // 记录错误日志
    wx.setStorageSync('errorLog', {
      timestamp: new Date().toISOString(),
      error: error.toString(),
      stack: error.stack
    });
  },

  // 重试最后一次请求
  retryLastRequest() {
    const lastRequest = this.globalData.lastRequest;
    if (lastRequest) {
      wx.showLoading({ title: '重试中...' });
      // 重新执行请求
      lastRequest().finally(() => {
        wx.hideLoading();
      });
    }
  },

  // 包装请求方法，自动处理错误和认证
  wrapRequest(requestFn, options = {}) {
    return async (...args) => {
      const startTime = Date.now();

      try {
        // 记录请求
        this.globalData.lastRequest = () => requestFn(...args);

        // 执行请求
        const result = await requestFn(...args);

        // 记录请求时间
        const duration = Date.now() - startTime;
        console.log(`请求完成：${requestFn.name}，耗时：${duration}ms`);

        return result;
      } catch (error) {
        // 统一错误处理
        this.globalErrorHandle(error, options.showToast);

        // 抛出错误给调用者
        throw error;
      }
    };
  },

  // 导入 API 配置
  apiConfig: require('./api/config'),

  // 获取带认证头的请求配置
  getAuthHeaderConfig() {
    const token = this.globalData.token || wx.getStorageSync('token');
    if (token) {
      return {
        'Authorization': token,
        'Content-Type': 'application/json'
      };
    }
    return {
      'Content-Type': 'application/json'
    };
  },

  // 统一处理 API 路径
  resolveApiUrl(url) {
    // 如果已经是完整 URL，直接返回
    if (url && url.startsWith('http')) {
      return url;
    }

    // 处理以/开头的路径
    if (url && url.startsWith('/')) {
      return `http://localhost:8080/api${url}`;
    }

    // 处理命名空间路径，如 'food/detail/5'
    if (url) {
      const parts = url.split('/');
      if (parts.length >= 2) {
        const endpoint = this.apiConfig.endpoints[parts[0]]?.[parts[1]];
        if (endpoint) {
          // 提取参数
          const params = {};
          parts.slice(2).forEach((part, index) => {
            if (index % 2 === 0 && parts[index + 3]) {
              params[part] = parts[index + 3];
            }
          });
          return this.apiConfig.getApiUrl(endpoint, params);
        }
      }
    }

    // 默认处理
    return `http://localhost:8080/api${url || ''}`;
  },

  // 创建带认证头的请求函数
  createAuthRequest(originalRequest) {
    return (options) => {
      // 确保有 header 配置
      if (!options.header) {
        options.header = {};
      }

      // 统一处理 API 路径
      options.url = this.resolveApiUrl(options.url);

      // 添加认证头
      const authHeaders = this.getAuthHeaderConfig();
      Object.assign(options.header, authHeaders);

      // 记录请求信息
      console.log(`请求：${options.method || 'GET'} ${options.url}`);
      console.log(`请求头：`, options.header);

      // 保存回调函数
      const successCallback = options.success;
      const failCallback = options.fail;
      const completeCallback = options.complete;

      const promise = new Promise((resolve, reject) => {
        console.log('开始发送请求...');
        originalRequest({
          ...options,
          timeout: this.apiConfig.getTimeout(),
          success: (res) => {
            console.log(`响应：${res.statusCode} ${options.url}`);
            console.log(`响应数据：`, res.data);
            console.log('响应数据 code:', res.data?.code);
            console.log('响应数据 message:', res.data?.message);
            
            if (res.statusCode === 200) {
              // 检查是否是认证错误
              if (res.data && (res.data.code === 401 || res.data.message === '未登录')) {
                // Token 过期或无效
                console.log('检测到认证错误，拒绝 Promise');
                this.handleAuthError({ message: '未登录', code: 'AUTH_ERROR' });
                reject(new Error('未登录'));
              } else if (res.data && res.data.code === 200) {
                // 标准成功响应：返回 res.data，这样调用方可以直接获取到 code、data 等
                console.log('登录成功，准备 resolve，数据:', res.data);
                
                // 先执行回调函数（如果存在）
                if (successCallback) {
                  console.log('执行 success 回调');
                  successCallback(res.data);
                }
                
                // 再 resolve Promise
                resolve(res.data);
                console.log('resolve 已调用');
              } else if (res.statusCode === 200 && (!res.data || !res.data.code)) {
                // 兼容处理：如果没有 data 或 data.code，但 statusCode 是 200，也认为是成功
                console.log('兼容模式，返回数据:', res.data || res);
                
                if (successCallback) {
                  console.log('执行 success 回调（兼容模式）');
                  successCallback(res.data || res);
                }
                
                resolve(res.data || res);
              } else {
                // 其他情况
                console.log('其他情况，拒绝 Promise');
                if (failCallback) {
                  failCallback(new Error(res.data.message || '请求失败'));
                }
                reject(new Error(res.data.message || '请求失败'));
              }
            } else {
              console.log('状态码不是 200，拒绝 Promise:', res.statusCode);
              if (failCallback) {
                failCallback(new Error(`请求失败：${res.statusCode}`));
              }
              reject(new Error(`请求失败：${res.statusCode}`));
            }
          },
          fail: (err) => {
            console.log('请求失败，进入 fail 回调');
            console.error(`请求失败：`, err);
            if (failCallback) {
              console.log('执行 fail 回调');
              failCallback(err);
            }
            reject(err);
          },
          complete: () => {
            console.log('请求完成（complete 回调）');
            if (completeCallback) {
              completeCallback();
            }
          }
        });
      });

      // 添加日志，查看 Promise 状态
      console.log('Promise 已创建，返回:', promise);
      
      // 返回 Promise，支持 .then() 和 .catch()
      return promise.then(result => {
        console.log('Promise.then 被调用，结果:', result);
        return result;
      }).catch(error => {
        console.error('Promise.catch 被调用，错误:', error);
        throw error;
      });
    };
  },

  // 初始化认证请求
  initAuthRequest() {
    this.authRequest = this.createAuthRequest(wx.request);
  },

  // 加载用户信息
  loadUserInfo() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');

    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      console.log('用户信息加载成功：', userInfo);
    }
  },

  // 更新购物车
  updateCart(cartItems) {
    this.globalData.cart = cartItems
    this.globalData.cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    // 保存到本地存储
    wx.setStorageSync('cart', cartItems)
    wx.setStorageSync('cartCount', this.globalData.cartCount)

    // 触发购物车更新事件
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]

    // 如果当前是购物车页面，更新数据
    if (currentPage.route === 'pages/cart/cart') {
      currentPage.setData({
        cartItems: cartItems
      })
    }

    // 更新所有页面的底部导航栏
    pages.forEach(page => {
      const tabBar = page.selectComponent('#tabbar')
      if (tabBar) {
        tabBar.updateCartCount(this.globalData.cartCount)
      }
    })

    // 触发全局购物车更新事件
    this.triggerEvent('cartUpdated', {
      cartItems: cartItems,
      cartCount: this.globalData.cartCount
    })
  },

  // 添加商品到购物车
  addToCart(foodItem) {
    const cart = this.globalData.cart
    const existingItem = cart.find(item => item.foodId === foodItem.foodId)

    if (existingItem) {
      existingItem.quantity += foodItem.quantity
    } else {
      cart.push(foodItem)
    }

    this.updateCart(cart)

    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    })
  },

  // 从购物车移除商品
  removeFromCart(foodId) {
    const cart = this.globalData.cart
    const updatedCart = cart.filter(item => item.foodId !== foodId)

    this.updateCart(updatedCart)
  },

  // 更新购物车商品数量
  updateCartItemQuantity(foodId, quantity) {
    const cart = this.globalData.cart
    const item = cart.find(item => item.foodId === foodId)

    if (item) {
      item.quantity = quantity
      this.updateCart(cart)
    }
  },

  // 清空购物车
  clearCart() {
    this.globalData.cart = []
    this.globalData.cartCount = 0
  },

  // 用户登录
  userLogin(userInfo) {
    this.globalData.userInfo = {
      ...userInfo,
      isLoggedIn: true
    }

    // 保存到本地存储
    wx.setStorageSync('userInfo', this.globalData.userInfo)

    console.log('用户登录成功：', this.globalData.userInfo)
  },

  // 用户退出登录
  userLogout() {
    this.globalData.userInfo = {
      isLoggedIn: false,
      name: '',
      avatar: '',
      level: '普通会员',
      points: 0,
      phone: '',
      email: ''
    }

    // 清除本地存储
    wx.removeStorageSync('userInfo')

    // 清空购物车
    this.clearCart()

    console.log('用户退出登录')
  },

  // 更新用户信息
  updateUserInfo(userInfo) {
    this.globalData.userInfo = {
      ...this.globalData.userInfo,
      ...userInfo
    }

    // 保存到本地存储
    wx.setStorageSync('userInfo', this.globalData.userInfo)

    console.log('用户信息更新：', this.globalData.userInfo)
  },

  // 添加搜索历史
  addSearchHistory(keyword) {
    const history = this.globalData.searchHistory
    const filteredHistory = history.filter(item => item !== keyword)
    filteredHistory.unshift(keyword)

    // 最多保存10条搜索历史
    this.globalData.searchHistory = filteredHistory.slice(0, 10)

    // 保存到本地存储
    wx.setStorageSync('searchHistory', this.globalData.searchHistory)
  },

  // 清除搜索历史
  clearSearchHistory() {
    this.globalData.searchHistory = []
    wx.removeStorageSync('searchHistory')
  },

  // 添加收藏商家
  addFavoriteStore(storeId) {
    const favorites = this.globalData.favoriteStores
    if (!favorites.includes(storeId)) {
      favorites.push(storeId)
      wx.setStorageSync('favoriteStores', favorites)
      console.log('收藏商家：', storeId)
    }
  },

  // 取消收藏商家
  removeFavoriteStore(storeId) {
    const favorites = this.globalData.favoriteStores
    const updatedFavorites = favorites.filter(id => id !== storeId)
    this.globalData.favoriteStores = updatedFavorites
    wx.setStorageSync('favoriteStores', updatedFavorites)
    console.log('取消收藏商家：', storeId)
  },

  // 检查是否收藏商家
  isFavoriteStore(storeId) {
    return this.globalData.favoriteStores.includes(storeId)
  },

  // 添加收货地址
  addAddress(address) {
    const addresses = this.globalData.addresses
    addresses.push(address)
    this.globalData.addresses = addresses
    wx.setStorageSync('addresses', addresses)
    console.log('添加收货地址：', address)
  },

  // 更新收货地址
  updateAddress(addressId, address) {
    const addresses = this.globalData.addresses
    const index = addresses.findIndex(addr => addr.id === addressId)
    if (index !== -1) {
      addresses[index] = address
      this.globalData.addresses = addresses
      wx.setStorageSync('addresses', addresses)
      console.log('更新收货地址：', address)
    }
  },

  // 删除收货地址
  deleteAddress(addressId) {
    const addresses = this.globalData.addresses
    const updatedAddresses = addresses.filter(addr => addr.id !== addressId)
    this.globalData.addresses = updatedAddresses
    wx.setStorageSync('addresses', updatedAddresses)
    console.log('删除收货地址：', addressId)
  },

  // 设置默认地址
  setDefaultAddress(addressId) {
    const addresses = this.globalData.addresses
    addresses.forEach(addr => {
      addr.isDefault = addr.id === addressId
    })
    this.globalData.addresses = addresses
    wx.setStorageSync('addresses', addresses)
    console.log('设置默认地址：', addressId)
  },

  // 获取默认地址
  getDefaultAddress() {
    return this.globalData.addresses.find(addr => addr.isDefault) || null
  }
})

