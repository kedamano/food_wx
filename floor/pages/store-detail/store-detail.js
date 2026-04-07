// 商家详情页面逻辑
Page({
  data: {
    // 商家信息
    storeInfo: {
      id: 0,
      name: '',
      banner: '',
      distance: '',
      deliveryTime: '',
      price: 0,
      rating: 0,
      notice: ''
    },
    
    // 商品分类
    categories: [],
    currentCategory: 0,
    
    // 商品列表
    foodList: [],
    
    // 购物车
    cartItems: [],
    cartCount: 0,
    cartTotal: 0
  },

  // 页面加载
  onLoad(options) {
    console.log('商家详情页加载，参数：', options);
    
    // 获取商家ID
    const storeId = options.storeId || 1;
    
    // 加载商家信息
    this.loadStoreInfo(storeId);
    
    // 加载分类
    this.loadCategories();
    
    // 加载商品
    this.loadFoods(storeId);
    
    // 加载购物车
    this.loadCart();
  },

  // 返回按钮点击
  onBackClick() {
    console.log('返回按钮点击');
    wx.navigateBack({
      delta: 1
    });
  },

  // 分享按钮点击
  onShareClick() {
    console.log('分享按钮点击');
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  // 分类点击
  onCategoryTap(e) {
    const categoryId = e.currentTarget.dataset.category;
    console.log('点击分类：', categoryId);
    
    this.setData({
      currentCategory: parseInt(categoryId)
    });
    
    // 重新加载商品
    const storeId = this.data.storeInfo.id;
    this.loadFoods(storeId, categoryId);
  },

  // 添加商品到购物车
  onAddToCart(e) {
    const item = e.currentTarget.dataset.item;
    console.log('添加商品到购物车：', item);
    
    // 获取现有购物车数据
    const app = getApp();
    let cart = app.globalData.cart || [];
    
    // 检查是否已存在
    const existingItemIndex = cart.findIndex(cartItem => cartItem.foodId === item.id);
    if (existingItemIndex !== -1) {
      // 更新数量
      cart[existingItemIndex].quantity += 1;
    } else {
      // 添加新商品
      cart.push({
        foodId: item.id,
        name: item.name,
        price: item.price,
        image: item.image || '',
        quantity: 1,
        storeId: this.data.storeInfo.id
      });
    }
    
    // 更新全局购物车数据
    app.globalData.cart = cart;
    app.globalData.cartCount = cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    
    // 更新购物车显示
    this.updateCartDisplay();
    
    // 显示成功提示
    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 1500
    });
  },

  // 结算
  onSettle() {
    console.log('结算');
    
    const { cartItems, cartTotal } = this.data;
    
    if (cartItems.length === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      });
      return;
    }
    
    // 创建订单信息
    const orderInfo = {
      orderId: Date.now().toString(),
      storeId: this.data.storeInfo.id,
      storeName: this.data.storeInfo.name,
      items: cartItems,
      totalAmount: cartTotal,
      deliveryFee: 5.00,
      discount: 0,
      finalAmount: cartTotal + 5.00,
      orderTime: new Date().toISOString(),
      status: 'pending'
    };
    
    // 保存订单到全局
    const app = getApp();
    app.globalData.currentOrder = orderInfo;
    
    // 跳转到订单确认页
    wx.navigateTo({
      url: '/pages/order-confirm/order-confirm',
      success: (res) => {
        console.log('跳转到订单确认页成功');
      },
      fail: (err) => {
        console.error('跳转失败：', err);
        
        // 如果订单确认页不存在，显示订单信息
        if (err.errMsg.includes('not found')) {
          wx.showModal({
            title: '订单信息',
            content: `订单号: ${orderInfo.orderId}\n商家: ${orderInfo.storeName}\n商品数量: ${cartItems.length}\n总金额: ¥${orderInfo.finalAmount}\n订单已创建成功！`,
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                // 清空购物车
                app.globalData.cart = [];
                app.globalData.cartCount = 0;
                this.loadCart();
              }
            }
          });
        } else {
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 加载商家信息
  loadStoreInfo(storeId) {
    console.log('加载商家信息：', storeId);
    
    const app = getApp();
    app.authRequest({
      url: `/store/${storeId}`,
      method: 'GET',
      success: (res) => {
        console.log('商家详情响应数据:', res);
        
        // app.authRequest 返回的是 {code, message, data} 格式
        if (res && res.code === 200 && res.data) {
          const storeData = res.data;
          const processedData = {
            id: storeData.storeId || storeData.id || storeId,
            name: storeData.storeName || storeData.name || '未知商家',
            logo: storeData.logo || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=200&h=200&fit=crop',
            banner: storeData.banner || storeData.logo || 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&h=600&fit=crop',
            distance: storeData.distance || '1.5km',
            deliveryTime: storeData.deliveryTime ? `${storeData.deliveryTime}分钟` : '30分钟',
            price: storeData.priceLevel || storeData.price || 25.00,
            rating: Number(storeData.rating) || 4.5,
            notice: storeData.notice || '欢迎光临！',
            address: storeData.address || '',
            phone: storeData.phone || '',
            deliveryFee: storeData.deliveryFee || 5.00,
            status: storeData.status === 1 ? '营业中' : '休息中'
          };
          
          console.log('处理后的商家数据:', processedData);
          
          this.setData({
            storeInfo: processedData
          });
        } else {
          // API 返回错误，使用模拟数据
          console.log('使用商家模拟数据，storeId:', storeId);
          this.setStoreMockData(storeId);
        }
      },
      fail: (err) => {
        console.error('商家详情请求失败:', err);
        this.setStoreMockData(storeId);
      }
    });
  },
  
  // 设置商家模拟数据
  setStoreMockData(storeId) {
    const mockStores = {
      1: { name: '川味人家', banner: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop' },
      2: { name: '面点王', banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop' },
      3: { name: '披萨达人', banner: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop' },
      4: { name: '汉堡世界', banner: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop' }
    };
    
    const mockInfo = mockStores[storeId] || { name: '未知商家', banner: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&h=600&fit=crop' };
    
    const mockStoreData = {
      id: storeId,
      name: mockInfo.name,
      banner: mockInfo.banner,
      distance: '1.2km',
      deliveryTime: '30分钟',
      price: 25.00,
      rating: 4.5 + Math.random() * 0.5,
      notice: '欢迎光临！今日特惠：满100减20，满200减50！'
    };
    
    this.setData({
      storeInfo: mockStoreData
    });
  },

  // 加载分类
  loadCategories() {
    console.log('加载分类');
    
    const mockCategories = [
      { id: 1, name: '招牌菜' },
      { id: 2, name: '热销榜' },
      { id: 3, name: '套餐' },
      { id: 4, name: '主食' },
      { id: 5, name: '小吃' },
      { id: 6, name: '饮品' }
    ];
    
    this.setData({
      categories: mockCategories
    });
  },

  // 加载商品
  loadFoods(storeId, categoryId = 0) {
    console.log('加载商品，商家ID：', storeId, '分类ID：', categoryId);
    
    // 模拟商品数据
    const mockFoods = [
      {
        id: 1,
        name: '经典牛肉面',
        price: 28.00,
        rating: 4.8,
        sales: 156,
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=300&h=200&fit=crop',
        description: '精选优质牛肉，搭配劲道面条'
      },
      {
        id: 2,
        name: '担担面',
        price: 25.00,
        rating: 4.5,
        sales: 178,
        image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=300&h=200&fit=crop',
        description: '传统川菜，麻辣鲜香'
      },
      {
        id: 3,
        name: '麻辣香锅',
        price: 45.00,
        rating: 4.6,
        sales: 178,
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=300&h=200&fit=crop',
        description: '多种食材搭配，麻辣鲜香'
      }
    ];
    
    // 根据分类过滤
    let filteredFoods = mockFoods;
    if (categoryId === 1) {
      filteredFoods = mockFoods.filter(food => food.rating >= 4.7);
    } else if (categoryId === 2) {
      filteredFoods = mockFoods.filter(food => food.sales >= 170);
    } else if (categoryId === 3) {
      filteredFoods = mockFoods.filter(food => food.price <= 30);
    }
    
    this.setData({
      foodList: filteredFoods
    });
  },

  // 加载购物车
  loadCart() {
    const app = getApp();
    const cart = app.globalData.cart || [];
    const cartCount = app.globalData.cartCount || 0;
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    this.setData({
      cartItems: cart,
      cartCount: cartCount,
      cartTotal: cartTotal
    });
  },

  // 更新购物车显示
  updateCartDisplay() {
    this.loadCart();
  },

  // 页面显示
  onShow() {
    console.log('商家详情页显示');
    // 更新购物车
    this.updateCartDisplay();
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    
    const storeId = this.data.storeInfo.id;
    this.loadFoods(storeId, this.data.currentCategory);
    
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 分享功能
  onShareAppMessage() {
    const store = this.data.storeInfo;
    return {
      title: `${store.name} - 美食小程序`,
      path: `/pages/store-detail/store-detail?storeId=${store.id}`
    };
  }
});