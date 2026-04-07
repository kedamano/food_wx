// index.js
Page({
  data: {
    // 轮播图数据
    banners: [
      {
        id: 1,
        title: '美食天堂',
        subtitle: '探索全球美味',
        background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop'
      },
      {
        id: 2,
        title: '限时优惠',
        subtitle: '满 100 减 30',
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop'
      },
      {
        id: 3,
        title: '新商家入驻',
        subtitle: '品质保证，值得信赖',
        background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop'
      }
    ],

    // 分类数据
    categories: [
      {
        id: 1,
        name: '面食',
        icon: 'fa-utensils',
        color: 'linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)',
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=150&h=150&fit=crop'
      },
      {
        id: 2,
        name: '披萨',
        icon: 'fa-pizza-slice',
        color: 'linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 100%)',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&h=150&fit=crop'
      },
      {
        id: 3,
        name: '汉堡',
        icon: 'fa-hamburger',
        color: 'linear-gradient(135deg, #FFD93D 0%, #F6B93B 100%)',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop'
      },
      {
        id: 4,
        name: '甜品',
        icon: 'fa-ice-cream',
        color: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=150&h=150&fit=crop'
      }
    ],

    // 推荐美食数据
    recommendFoods: [
      {
        id: 1,
        name: '经典牛肉面',
        price: 28.00,
        rating: 4.8,
        icon: 'fa-utensils',
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=300&h=200&fit=crop',
        sales: 156,
        reviews: 89
      },
      {
        id: 2,
        name: '香辣鸡腿堡套餐',
        price: 35.00,
        rating: 4.6,
        icon: 'fa-fire',
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=300&h=200&fit=crop',
        sales: 234,
        reviews: 127
      },
      {
        id: 3,
        name: '芝士培根披萨',
        price: 68.00,
        rating: 4.9,
        icon: 'fa-pizza-slice',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
        sales: 89,
        reviews: 45
      },
      {
        id: 4,
        name: '草莓圣代',
        price: 18.00,
        rating: 4.7,
        icon: 'fa-ice-cream',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop',
        sales: 312,
        reviews: 168
      },
      {
        id: 5,
        name: '担担面',
        price: 25.00,
        rating: 4.5,
        icon: 'fa-fire',
        image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=300&h=200&fit=crop',
        sales: 178,
        reviews: 92
      },
      {
        id: 6,
        name: '水果沙拉',
        price: 22.00,
        rating: 4.4,
        icon: 'fa-bread-slice',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
        sales: 145,
        reviews: 76
      }
    ],

    // 附近商家数据
    nearbyStores: [
      {
        id: 1,
        name: '川味人家',
        price: 45,
        rating: 4.7,
        icon: 'fa-fire',
        distance: '1.2km',
        deliveryTime: '30 分钟',
        banner: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=300&h=200&fit=crop'
      },
      {
        id: 2,
        name: '披萨大师',
        price: 68,
        rating: 4.6,
        icon: 'fa-pizza-slice',
        distance: '0.8km',
        deliveryTime: '25 分钟',
        banner: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop'
      },
      {
        id: 3,
        name: '汉堡王',
        price: 35,
        rating: 4.5,
        icon: 'fa-hamburger',
        distance: '2.1km',
        deliveryTime: '35 分钟',
        banner: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop'
      },
      {
        id: 4,
        name: '甜品屋',
        price: 28,
        rating: 4.8,
        icon: 'fa-ice-cream',
        distance: '1.5km',
        deliveryTime: '20 分钟',
        banner: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop'
      }
    ],

    // 搜索栏状态
    isSearchFocused: false,
    searchValue: '',
    searchHistory: [],

    // 底部导航栏
    activeTab: 0,
    cartCount: 0
  },

  // 搜索框获得焦点
  onSearchFocus(e) {
    this.setData({
      isSearchFocused: true
    });
    console.log('搜索框获得焦点');
  },

  // 搜索框失去焦点
  onSearchBlur(e) {
    this.setData({
      isSearchFocused: false,
      searchValue: e.detail.value
    });
    console.log('搜索框失去焦点，搜索值：', e.detail.value);
    
    // 保存搜索历史
    if (e.detail.value.trim()) {
      this.addSearchHistory(e.detail.value.trim());
    }
  },

  // 搜索确认
  onSearchConfirm(e) {
    const searchValue = e.detail.value.trim();
    console.log('搜索确认：', searchValue);
    
    if (searchValue) {
      // 保存搜索历史
      this.addSearchHistory(searchValue);
      
      // 显示搜索提示
      wx.showToast({
        title: `搜索：${searchValue}`,
        icon: 'none'
      });
      
      // 实际项目中这里应该执行搜索逻辑
      // this.performSearch(searchValue);
    }
  },

  // 清除搜索
  onClearSearch() {
    this.setData({
      searchValue: ''
    });
    console.log('清除搜索');
  },

  // 添加搜索历史
  addSearchHistory(keyword) {
    const searchHistory = this.data.searchHistory;
    const filteredHistory = searchHistory.filter(item => item !== keyword);
    filteredHistory.unshift(keyword);
    
    // 最多保存10条搜索历史
    this.setData({
      searchHistory: filteredHistory.slice(0, 10)
    });
    
    // 保存到全局和本地存储
    const app = getApp();
    app.globalData.searchHistory = this.data.searchHistory;
    wx.setStorageSync('searchHistory', this.data.searchHistory);
  },

  // 分类点击事件
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category;
    console.log('点击分类：', category);

    // 跳转到分类页面
    wx.navigateTo({
      url: `/pages/category/category?category=${category}`
    });
  },

  // 美食点击事件
  onFoodTap(e) {
    const foodId = e.currentTarget.dataset.foodId;
    console.log('点击美食：', foodId);

    // 跳转到美食详情页
    wx.navigateTo({
      url: `/pages/food-detail/food-detail?foodId=${foodId}`
    });
  },

  // 商家点击事件
  onStoreTap(e) {
    const storeId = e.currentTarget.dataset.storeId;
    console.log('点击商家：', storeId);

    // 跳转到商家详情页
    wx.navigateTo({
      url: `/pages/store-detail/store-detail?storeId=${storeId}`
    });
  },

  // 查看更多美食
  async onMoreFoods() {
    console.log('查看更多美食');
    
    // 显示加载提示
    wx.showLoading({
      title: '加载更多...'
    });
    
    try {
      const app = getApp();
      const result = await new Promise((resolve, reject) => {
        app.authRequest({
          url: '/food/all',
          method: 'GET',
          success: (res) => {
            console.log('全部美食响应：', res);
            if (res.code === 200) {
              resolve(res.data);
            } else {
              reject(new Error(res.message || '获取美食列表失败'));
            }
          },
          fail: (err) => {
            console.error('全部美食请求失败:', err);
            reject(err);
          }
        });
      });
      
      wx.hideLoading();
      
      // 跳转到美食列表页面
      wx.navigateTo({
        url: '/pages/subcategory/subcategory?type=food&title=全部美食'
      });
      
    } catch (error) {
      wx.hideLoading();
      console.error('加载更多美食失败:', error);
      wx.showToast({
        title: '加载失败，请稍后重试',
        icon: 'none'
      });
    }
  },

  // 查看更多商家
  async onMoreStores() {
    console.log('查看更多商家');
    
    // 显示加载提示
    wx.showLoading({
      title: '加载更多...'
    });
    
    try {
      const app = getApp();
      const result = await new Promise((resolve, reject) => {
        app.authRequest({
          url: '/store/nearby',
          method: 'GET',
          success: (res) => {
            console.log('附近商家响应：', res);
            if (res.code === 200) {
              resolve(res.data);
            } else {
              reject(new Error(res.message || '获取商家列表失败'));
            }
          },
          fail: (err) => {
            console.error('附近商家请求失败:', err);
            reject(err);
          }
        });
      });
      
      wx.hideLoading();
      
      // 跳转到商家列表页面
      wx.navigateTo({
        url: '/pages/subcategory/subcategory?type=store&title=附近商家'
      });
      
    } catch (error) {
      wx.hideLoading();
      console.error('加载更多商家失败:', error);
      wx.showToast({
        title: '加载失败，请稍后重试',
        icon: 'none'
      });
    }
  },

  // 页面加载
  onLoad() {
    console.log('首页加载完成');
    
    // 清除旧缓存，避免显示旧数据
    wx.removeStorageSync('nearbyStores');
    wx.removeStorageSync('banners');
    wx.removeStorageSync('categories');
    wx.removeStorageSync('recommendFoods');
    
    console.log('已清除缓存');

    // 设置底部导航栏
    this.updateTabBar();

    // 从服务器加载数据
    this.loadDataFromServer();
  },

  // 更新底部导航栏
  updateTabBar() {
    // 获取全局app实例
    const app = getApp();

    // 更新购物车数量
    const cartCount = app.globalData.cartCount || 0;

    // 设置底部导航栏数据
    this.setData({
      cartCount: cartCount,
      activeTab: 0 // 首页为第0个标签
    });

    // 触发底部导航栏更新
    const tabBar = this.selectComponent('#tabbar');
    if (tabBar) {
      tabBar.setData({
        activeTab: 0,
        cartCount: cartCount
      });
    }
  },

  // 从服务器加载数据（带缓存）
  async loadDataFromServer() {
    wx.showLoading({
      title: '加载中...'
    });

    try {
      // 并行加载所有数据（带缓存）
      const [banners, categories, foods, stores] = await Promise.all([
        this.getBannersWithCache(),
        this.getCategoriesWithCache(),
        this.getRecommendFoodsWithCache(),
        this.getNearbyStoresWithCache()
      ]);

      // 更新页面数据
      this.setData({
        banners: banners,
        categories: categories,
        recommendFoods: foods,
        nearbyStores: stores,
        isLoading: false
      });

      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      
      // 更详细的错误处理
      let errorMessage = '加载失败，请重试';
      if (error.code === 'NETWORK_ERROR') {
        errorMessage = '网络连接失败，请检查网络设置';
      } else if (error.code === 'TIMEOUT_ERROR') {
        errorMessage = '请求超时，请稍后重试';
      } else if (error.code === 'SERVER_ERROR') {
        errorMessage = '服务器繁忙，请稍后重试';
      }

      wx.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      });
      
      // 记录错误日志
      console.error('数据加载错误：', error);
      
      // 触发错误处理
      const app = getApp();
      app.globalErrorHandle(error, false);
    }
  },

  // 带缓存的轮播图获取
  async getBannersWithCache() {
    const cacheKey = 'banners';
    const cache = wx.getStorageSync(cacheKey);
    const cacheTime = 5 * 60 * 1000; // 5分钟缓存

    // 检查缓存是否有效
    if (cache && cache.data && cache.timestamp && 
        Date.now() - cache.timestamp < cacheTime) {
      console.log('使用缓存的轮播图数据');
      return cache.data;
    }

    // 获取新数据
    const data = await this.getBanners();
    
    // 更新缓存
    wx.setStorageSync(cacheKey, {
      data: data,
      timestamp: Date.now()
    });

    return data;
  },

  // 带缓存的分类获取
  async getCategoriesWithCache() {
    const cacheKey = 'categories';
    const cache = wx.getStorageSync(cacheKey);
    const cacheTime = 10 * 60 * 1000; // 10分钟缓存

    // 检查缓存是否有效
    if (cache && cache.data && cache.timestamp && 
        Date.now() - cache.timestamp < cacheTime) {
      console.log('使用缓存的分类数据');
      return cache.data;
    }

    // 获取新数据
    const data = await this.getCategories();
    
    // 更新缓存
    wx.setStorageSync(cacheKey, {
      data: data,
      timestamp: Date.now()
    });

    return data;
  },

  // 带缓存的推荐美食获取
  async getRecommendFoodsWithCache() {
    const cacheKey = 'recommendFoods';
    const cache = wx.getStorageSync(cacheKey);
    const cacheTime = 3 * 60 * 1000; // 3分钟缓存

    // 检查缓存是否有效
    if (cache && cache.data && cache.timestamp && 
        Date.now() - cache.timestamp < cacheTime) {
      console.log('使用缓存的推荐美食数据');
      return cache.data;
    }

    // 获取新数据
    const data = await this.getRecommendFoods();
    
    // 更新缓存
    wx.setStorageSync(cacheKey, {
      data: data,
      timestamp: Date.now()
    });

    return data;
  },

  // 带缓存的附近商家获取
  async getNearbyStoresWithCache() {
    const cacheKey = 'nearbyStores';
    const cacheTime = 1 * 60 * 1000; // 1 分钟缓存

    // 不使用缓存，直接从服务器获取最新数据
    const data = await this.getNearbyStores();
    
    // 更新缓存
    wx.setStorageSync(cacheKey, {
      data: data,
      timestamp: Date.now()
    });

    return data;
  },

  // 清除缓存
  clearCache() {
    wx.removeStorageSync('banners');
    wx.removeStorageSync('categories');
    wx.removeStorageSync('recommendFoods');
    wx.removeStorageSync('nearbyStores');
    wx.showToast({
      title: '缓存已清除',
      icon: 'success'
    });
  },

  // 清除特定缓存
  clearCacheByKey(key) {
    wx.removeStorageSync(key);
    console.log(`清除缓存：${key}`);
  },

  // 获取轮播图数据
  async getBanners() {
    return new Promise((resolve, reject) => {
      const app = getApp();
      app.authRequest({
        url: '/food/banners',
        method: 'GET',
        success: (res) => {
          // app.authRequest 返回的是 {code, message, data} 格式
          if (res && res.code === 200 && res.data) {
            resolve(res.data);
          } else {
            console.error('获取轮播图失败:', res);
            reject(new Error(res && res.message ? res.message : '获取轮播图失败'));
          }
        },
        fail: (err) => {
          console.error('轮播图请求失败:', err);
          // 降级使用在线图片
          resolve([
            {
              id: 1,
              title: '美食天堂',
              subtitle: '探索全球美味',
              background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
              image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop'
            },
            {
              id: 2,
              title: '限时优惠',
              subtitle: '满 100 减 30',
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
              image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop'
            },
            {
              id: 3,
              title: '新商家入驻',
              subtitle: '品质保证，值得信赖',
              background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
              image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop'
            }
          ]);
        }
      });
    });
  },

  // 获取分类数据
  async getCategories() {
    return new Promise((resolve, reject) => {
      const app = getApp();
      app.authRequest({
        url: '/food/categories',
        method: 'GET',
        success: (res) => {
          // app.authRequest 返回的是 {code, message, data} 格式
          if (res && res.code === 200 && res.data) {
            resolve(res.data);
          } else {
            console.error('获取分类失败:', res);
            reject(new Error(res && res.message ? res.message : '获取分类失败'));
          }
        },
        fail: (err) => {
          console.error('分类请求失败:', err);
          // 降级使用在线图片
          resolve([
            {
              id: 1,
              name: '面食',
              icon: 'fa-utensils',
              color: 'linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)',
              image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=150&h=150&fit=crop'
            },
            {
              id: 2,
              name: '披萨',
              icon: 'fa-pizza-slice',
              color: 'linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 100%)',
              image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&h=150&fit=crop'
            },
            {
              id: 3,
              name: '汉堡',
              icon: 'fa-hamburger',
              color: 'linear-gradient(135deg, #FFD93D 0%, #F6B93B 100%)',
              image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop'
            },
            {
              id: 4,
              name: '甜品',
              icon: 'fa-ice-cream',
              color: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
              image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=150&h=150&fit=crop'
            }
          ]);
        }
      });
    });
  },

  // 获取推荐美食
  async getRecommendFoods() {
    return new Promise((resolve, reject) => {
      const app = getApp();
      app.authRequest({
        url: '/food/recommend',
        method: 'GET',
        success: (res) => {
          console.log('推荐美食响应:', res);
          // app.authRequest 返回的是 {code, message, data} 格式
          if (res && res.code === 200 && res.data) {
            // 格式化数据，将 foodId 转为 id
            const formattedFoods = res.data.map(food => ({
              id: food.foodId || food.id,
              name: food.name,
              price: Number(food.price) || 0,
              rating: Number(food.rating) || 4.5,
              icon: 'fa-utensils',
              image: food.image || 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=300&h=200&fit=crop',
              sales: food.sales || 0,
              reviews: food.reviews || Math.floor(Math.random() * 200)
            }));
            console.log('格式化后的美食数据:', formattedFoods);
            resolve(formattedFoods);
          } else {
            console.error('获取推荐美食失败:', res);
            reject(new Error(res && res.message ? res.message : '获取推荐美食失败'));
          }
        },
        fail: (err) => {
          console.error('推荐美食请求失败:', err);
          // 降级使用在线图片
          resolve([
            {
              id: 1,
              name: '经典牛肉面',
              price: 28.00,
              rating: 4.8,
              icon: 'fa-utensils',
              image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=300&h=200&fit=crop',
              sales: 156,
              reviews: 89
            },
            {
              id: 2,
              name: '香辣鸡腿堡套餐',
              price: 35.00,
              rating: 4.6,
              icon: 'fa-fire',
              image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=300&h=200&fit=crop',
              sales: 234,
              reviews: 127
            },
            {
              id: 3,
              name: '芝士培根披萨',
              price: 68.00,
              rating: 4.9,
              icon: 'fa-pizza-slice',
              image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
              sales: 89,
              reviews: 45
            },
            {
              id: 4,
              name: '草莓圣代',
              price: 18.00,
              rating: 4.7,
              icon: 'fa-ice-cream',
              image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop',
              sales: 312,
              reviews: 168
            },
            {
              id: 5,
              name: '担担面',
              price: 25.00,
              rating: 4.5,
              icon: 'fa-fire',
              image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=300&h=200&fit=crop',
              sales: 178,
              reviews: 92
            },
            {
              id: 6,
              name: '水果沙拉',
              price: 22.00,
              rating: 4.4,
              icon: 'fa-bread-slice',
              image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
              sales: 145,
              reviews: 76
            }
          ]);
        }
      });
    });
  },

  // 图片加载成功
  onImageLoad(e) {
    const foodId = e.currentTarget.dataset.foodId;
    const foods = this.data.recommendFoods.map(item => {
      if (item.id == foodId) {
        item.imageLoaded = true;
      }
      return item;
    });
    this.setData({ recommendFoods: foods });
  },

  // 图片加载失败
  onImageError(e) {
    const foodId = e.currentTarget.dataset.foodId;
    console.error('图片加载失败：', foodId, e.detail);
    
    // 使用占位图替代
    const foods = this.data.recommendFoods.map(item => {
      if (item.id == foodId) {
        item.imageError = true;
      }
      return item;
    });
    this.setData({ recommendFoods: foods });

    // 显示错误提示
    wx.showToast({
      title: '图片加载失败',
      icon: 'none',
      duration: 1500
    });
  },

  // 获取附近商家
  async getNearbyStores() {
    return new Promise((resolve, reject) => {
      const app = getApp();
      app.authRequest({
        url: '/store/nearby',
        method: 'GET',
        success: (res) => {
          console.log('附近商家响应完整数据:', JSON.stringify(res, null, 2));
          
          // app.authRequest 返回的是 {code, message, data} 格式
          if (res && res.code === 200 && res.data) {
            const stores = res.data;
            // 处理数据，添加在线图片，将 storeId 转为 id
            const formattedStores = stores.map((store, index) => ({
              id: store.storeId || store.id,
              name: store.storeName || store.name,
              price: store.priceLevel || store.price || 30,
              rating: Number(store.rating) || 4.5,
              distance: store.distance || '1km',
              deliveryTime: store.deliveryTime || '30 分钟',
              icon: store.icon || 'fa-store',
              reviews: store.reviews || Math.floor(Math.random() * 200) + 50,
              banner: store.logo || store.banner || this.getStoreImageByIndex(index)
            }));
            console.log('格式化后的商家数据:', formattedStores);
            resolve(formattedStores);
          } else {
            console.error('获取商家数据格式错误:', res);
            reject(new Error(res && res.message ? res.message : '获取附近商家失败'));
          }
        },
        fail: (err) => {
          console.error('附近商家请求失败:', err);
          // 降级使用在线图片
          resolve([
            {
              id: 1,
              name: '川味人家',
              price: 45,
              rating: 4.7,
              icon: 'fa-fire',
              distance: '1.2km',
              deliveryTime: '30 分钟',
              banner: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=300&h=200&fit=crop',
              reviews: 156
            },
            {
              id: 2,
              name: '披萨大师',
              price: 68,
              rating: 4.6,
              icon: 'fa-pizza-slice',
              distance: '0.8km',
              deliveryTime: '25 分钟',
              banner: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
              reviews: 98
            },
            {
              id: 3,
              name: '汉堡王',
              price: 35,
              rating: 4.5,
              icon: 'fa-hamburger',
              distance: '2.1km',
              deliveryTime: '35 分钟',
              banner: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
              reviews: 120
            },
            {
              id: 4,
              name: '甜品屋',
              price: 28,
              rating: 4.8,
              icon: 'fa-ice-cream',
              distance: '1.5km',
              deliveryTime: '20 分钟',
              banner: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop',
              reviews: 87
            }
          ]);
        }
      });
    });
  },

  // 根据索引获取商家图片
  getStoreImageByIndex(index) {
    const images = [
      'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop'
    ];
    return images[index % images.length];
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    this.loadDataFromServer();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1500);
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '美食小程序 - 发现美味，享受生活',
      path: '/pages/index/index'
    };
  }
});
