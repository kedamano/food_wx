// 美食详情页逻辑
Page({
  data: {
    // 当前显示的图片索引
    currentImageIndex: 0,
    // 美食信息
    food: {
      id: 0,
      name: '',
      price: 0,
      rating: 0,
      reviews: 0,
      sales: 0,
      monthlySales: 0,
      deliveryTime: '',
      description: '',
      stock: 0,
      images: [],
      tags: {
        hot: false,
        classic: false,
        combo: false,
        healthy: false
      }
    },

    // 商家信息
    store: {
      id: 0,
      name: '',
      logo: '',
      rating: 0,
      monthlySales: 0,
      distance: '',
      deliveryTime: ''
    },

    // 用户评价
    reviews: [],

    // 数量选择
    quantity: 1,

    // 购物车数量
    cartCount: 0,

    // 收藏状态
    isFavorite: false,

    // 加载状态
    isLoading: true
  },

  // 页面加载
  onLoad(options) {
    console.log('美食详情页加载，参数：', options);

    // 获取美食ID
    const foodId = options.foodId || 1;

    // 加载美食数据
    this.loadFoodData(foodId);

    // 加载评价数据
    this.loadReviewsData(foodId);

    // 加载商家信息
    this.loadStoreData();

    // 更新购物车数量
    this.updateCartCount();
  },

  // 图片切换事件
  onImageChange(e) {
    const currentIndex = e.detail.current;
    this.setData({
      currentImageIndex: currentIndex
    });
    console.log('切换到图片：', currentIndex + 1);
  },

  // 加载美食数据
  async loadFoodData(foodId) {
    wx.showLoading({
      title: '加载中...'
    });

    return new Promise((resolve, reject) => {
      const app = getApp();
      app.authRequest({
        url: `/food/${foodId}`, // 使用新的API系统
        method: 'GET',
        success: (res) => {
          console.log('美食详情响应数据:', res);
          
          // app.authRequest 返回的是 {code, message, data} 格式
          if (res && res.code === 200 && res.data) {
            // 处理后端返回的数据格式
            const foodData = res.data;
            const processedData = {
              id: foodData.foodId || foodData.id || foodId,
              name: foodData.name || '未知美食',
              price: Number(foodData.price) || 0,
              rating: Number(foodData.rating) || 4.5,
              reviews: Number(foodData.reviews) || 0,
              sales: Number(foodData.sales) || 0,
              monthlySales: Number(foodData.monthlySales) || 0,
              deliveryTime: foodData.deliveryTime || '30 分钟',
              description: foodData.description || '暂无描述',
              stock: Number(foodData.stock) || 99,
              image: foodData.image || 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&h=600&fit=crop',
              images: [foodData.image || 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&h=600&fit=crop'],
              tags: this.processTags(foodData.tags)
            };
            
            console.log('处理后的美食数据:', processedData);

            this.setData({
              food: processedData,
              isLoading: false
            });

            wx.hideLoading();
            resolve(processedData);
          } else {
            // API 返回错误或需要登录，使用模拟数据
            console.log('使用美食模拟数据，foodId:', foodId);
            const mockFoods = {
              1: { name: '牛肉面', price: 28.00, rating: 4.8, description: '精选优质牛肉，搭配劲道面条' },
              2: { name: '宫保鸡丁', price: 35.00, rating: 4.6, description: '经典川菜，麻辣鲜香' },
              3: { name: '麻辣香锅', price: 45.00, rating: 4.6, description: '多种食材搭配，麻辣鲜香' },
              4: { name: '芝士披萨', price: 68.00, rating: 4.9, description: '香浓芝士，酥脆饼底' },
              5: { name: '牛肉汉堡', price: 32.00, rating: 4.5, description: '大块牛肉饼，新鲜蔬菜' },
              6: { name: '水果沙拉', price: 22.00, rating: 4.7, description: '新鲜水果，营养健康' },
              7: { name: '鸡翅', price: 25.00, rating: 4.6, description: '外酥里嫩，香辣可口' },
              8: { name: '冰淇淋', price: 18.00, rating: 4.7, description: '丝滑香甜，冰凉解暑' },
              9: { name: '可乐', price: 8.00, rating: 4.3, description: '冰爽可乐，解渴必备' },
              10: { name: '四川火锅', price: 88.00, rating: 4.9, description: '正宗川味，麻辣鲜香' }
            };
            
            const mockInfo = mockFoods[foodId] || { name: '未知美食', price: 0, rating: 4.5, description: '暂无描述' };
            
            const mockFoodData = {
              id: foodId,
              name: mockInfo.name,
              price: mockInfo.price,
              rating: mockInfo.rating,
              reviews: Math.floor(Math.random() * 200) + 50,
              sales: Math.floor(Math.random() * 500) + 100,
              monthlySales: Math.floor(Math.random() * 200) + 50,
              deliveryTime: '30 分钟',
              description: mockInfo.description,
              stock: 99,
              images: [
                'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&h=600&fit=crop'
              ],
              tags: {
                hot: Math.random() > 0.5,
                classic: Math.random() > 0.5,
                combo: Math.random() > 0.5,
                healthy: Math.random() > 0.5
              }
            };

            this.setData({
              food: mockFoodData,
              isLoading: false
            });
            
            wx.hideLoading();
            resolve(mockFoodData);
          }
        },
        fail: (err) => {
          console.error('美食详情请求失败:', err);
          wx.hideLoading();
          
          // 降级使用模拟数据
          const mockFoodData = {
            id: foodId,
            name: '美食',
            price: 30.00,
            rating: 4.5,
            reviews: 100,
            sales: 200,
            monthlySales: 80,
            deliveryTime: '30 分钟',
            description: '美味可口',
            stock: 99,
            images: [
              'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&h=600&fit=crop'
            ],
            tags: {
              hot: true,
              classic: true,
              combo: false,
              healthy: false
            }
          };

          this.setData({
            food: mockFoodData,
            isLoading: false
          });
          
          resolve(mockFoodData);
        }
      });
    });
  },

  // 处理标签数据
  processTags(tags) {
    if (!tags) {
      return {
        hot: true,
        classic: true,
        combo: false,
        healthy: false
      };
    }
    
    // 如果 tags 是数组格式
    if (Array.isArray(tags)) {
      return {
        hot: tags.includes('热销') || tags.includes('hot'),
        classic: tags.includes('经典') || tags.includes('classic'),
        combo: tags.includes('套餐') || tags.includes('combo'),
        healthy: tags.includes('健康') || tags.includes('healthy')
      };
    }
    
    // 如果 tags 是对象格式
    return {
      hot: tags.hot || false,
      classic: tags.classic || false,
      combo: tags.combo || false,
      healthy: tags.healthy || false
    };
  },

  // 加载评价数据
  loadReviewsData(foodId) {
    console.log('加载评价数据，foodId:', foodId);
    
    if (!foodId) {
      console.log('foodId 无效，使用模拟评价');
      this.setData({
        reviews: this.getMockReviews()
      });
      return;
    }
    
    const app = getApp();
    app.authRequest({
      url: `/review/food/${foodId}`,
      method: 'GET',
      success: (res) => {
        console.log('评价数据响应:', res);
        
        // app.authRequest 返回的是 {code, message, data} 格式
        if (res && res.code === 200) {
          let reviews = res.data || [];
          
          console.log('评价数据加载成功:', reviews);
          this.setData({
            reviews: reviews.length > 0 ? reviews : this.getMockReviews(foodId)
          });
        } else {
          this.setData({
            reviews: this.getMockReviews(foodId)
          });
        }
      },
      fail: (err) => {
        console.error('评价数据请求失败:', err);
        this.setData({
          reviews: this.getMockReviews(foodId)
        });
      }
    });
  },

  // 获取模拟评价数据
  getMockReviews() {
    return [
      {
        id: 1,
        userName: '美食家小王',
        rating: 5,
        time: '2024-01-15',
        content: '味道真的很棒！牛肉炖得很烂，面条很有劲道，汤也很好喝。强烈推荐！',
        images: [
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'
        ]
      },
      {
        id: 2,
        userName: '吃货小李',
        rating: 4,
        time: '2024-01-14',
        content: '整体不错，味道很好，就是分量有点少，吃完还想再来一份！',
        images: []
      },
      {
        id: 3,
        userName: '美食达人',
        rating: 5,
        time: '2024-01-13',
        content: '这是我吃过最好吃的牛肉面！没有之一！汤底浓郁，牛肉鲜嫩，面条 Q 弹。',
        images: [
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'
        ]
      }
    ];
  },

  // 加载商家数据
  loadStoreData() {
    // 模拟商家数据
    const mockStoreData = {
      id: 1,
      name: '川味人家',
      logo: '/images/foods/sichuan_cuisine.png',
      rating: 4.7,
      monthlySales: 2345,
      distance: '1.2km',
      deliveryTime: '30分钟'
    };

    this.setData({
      store: mockStoreData
    });
  },

  // 数量减少
  onQuantityMinus() {
    const currentQuantity = this.data.quantity;
    if (currentQuantity > 1) {
      this.setData({
        quantity: currentQuantity - 1
      });
      this.updateTotalPrice();
    } else {
      wx.showToast({
        title: '数量不能小于1',
        icon: 'none'
      });
    }
  },

  // 数量增加
  onQuantityPlus() {
    const currentQuantity = this.data.quantity;
    const stock = this.data.food.stock;

    if (currentQuantity < stock) {
      this.setData({
        quantity: currentQuantity + 1
      });
      this.updateTotalPrice();
    } else {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      });
    }
  },

  // 数量输入变化
  onQuantityChange(e) {
    const inputValue = parseInt(e.detail.value);
    const stock = this.data.food.stock;

    if (inputValue < 1) {
      this.setData({
        quantity: 1
      });
      wx.showToast({
        title: '数量不能小于1',
        icon: 'none'
      });
    } else if (inputValue > stock) {
      this.setData({
        quantity: stock
      });
      wx.showToast({
        title: `库存只有${stock}份`,
        icon: 'none'
      });
    } else {
      this.setData({
        quantity: inputValue
      });
    }

    this.updateTotalPrice();
  },

  // 更新总价
  updateTotalPrice() {
    const { food, quantity } = this.data;
    const totalPrice = (food.price * quantity).toFixed(2);
    console.log('总价更新：', totalPrice);
    // 这里可以更新UI显示总价
  },

  // 返回按钮点击
  onBackClick() {
    console.log('返回按钮点击');
    wx.navigateBack({
      delta: 1
    });
  },

  // 收藏按钮点击
  onFavoriteClick() {
    const isFavorite = this.data.isFavorite;
    const newFavoriteStatus = !isFavorite;

    this.setData({
      isFavorite: newFavoriteStatus
    });

    wx.showToast({
      title: newFavoriteStatus ? '已收藏' : '已取消收藏',
      icon: 'success'
    });

    // 更新收藏状态到服务器
    this.updateFavoriteStatus(newFavoriteStatus);
  },

  // 更新收藏状态
  updateFavoriteStatus(isFavorite) {
    // 实际项目中应该调用API更新收藏状态
    console.log('更新收藏状态：', isFavorite);
  },

  // 购物车按钮点击
  onCartClick() {
    console.log('购物车按钮点击');
    wx.switchTab({
      url: '/pages/cart/cart'
    });
  },

  // 加入购物车
  onAddToCart() {
    const { food, quantity } = this.data;

    // 验证库存
    if (quantity > food.stock) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      });
      return;
    }

    // 添加到购物车
    const cartItem = {
      foodId: food.id,
      name: food.name,
      price: food.price,
      image: food.images[0] || '',
      quantity: quantity,
      storeId: this.data.store.id
    };

    // 获取现有购物车数据
    const app = getApp();
    let cart = app.globalData.cart || [];

    // 检查是否已存在
    const existingItemIndex = cart.findIndex(item => item.foodId === food.id);
    if (existingItemIndex !== -1) {
      // 更新数量
      cart[existingItemIndex].quantity += quantity;
    } else {
      // 添加新商品
      cart.push(cartItem);
    }

    // 更新全局购物车数据
    app.globalData.cart = cart;
    app.globalData.cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // 更新购物车数量显示
    this.updateCartCount();

    // 显示成功提示
    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 2000
    });

    console.log('添加到购物车：', cartItem);
  },

  // 立即购买
  onBuyNow() {
    const { food, quantity, store } = this.data;

    // 验证库存
    if (quantity > food.stock) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      });
      return;
    }

    // 验证商家信息
    if (!store.id) {
      wx.showToast({
        title: '商家信息加载中，请稍后再试',
        icon: 'none'
      });
      return;
    }

    // 创建订单信息
    const orderInfo = {
      orderId: Date.now(), // 临时订单ID
      items: [{
        foodId: food.id,
        name: food.name,
        price: food.price,
        image: food.images[0] || '',
        quantity: quantity,
        totalPrice: (food.price * quantity).toFixed(2)
      }],
      store: store,
      totalAmount: (food.price * quantity).toFixed(2),
      deliveryFee: 5.00, // 配送费
      discount: 0,
      finalAmount: (food.price * quantity + 5).toFixed(2),
      orderTime: new Date().toISOString()
    };

    // 验证订单金额
    if (orderInfo.finalAmount <= 0) {
      wx.showToast({
        title: '订单金额错误',
        icon: 'none'
      });
      return;
    }

    // 存储订单信息到全局
    const app = getApp();
    app.globalData.currentOrder = orderInfo;

    // 检查订单确认页是否存在
    wx.getFileSystemManager().access({
      path: '/pages/order-confirm/order-confirm',
      success: () => {
        // 页面存在，跳转到订单确认页
        wx.navigateTo({
          url: '/pages/order-confirm/order-confirm',
          success: (res) => {
            console.log('跳转到订单确认页成功');
          },
          fail: (err) => {
            console.error('跳转失败：', err);
            wx.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
            
            // 清除订单信息
            app.globalData.currentOrder = null;
          }
        });
      },
      fail: (err) => {
        console.error('订单确认页不存在：', err);
        wx.showToast({
          title: '订单功能尚未完善',
          icon: 'none'
        });
        
        // 清除订单信息
        app.globalData.currentOrder = null;
      }
    });
  },

  // 查看商家信息
  onStoreInfoClick() {
    const storeId = this.data.store.id;
    console.log('查看商家信息：', storeId);
    
    // 直接尝试跳转，商家详情页已存在
    wx.navigateTo({
      url: `/pages/store-detail/store-detail?storeId=${storeId}`,
      success: (res) => {
        console.log('跳转到商家详情页成功');
      },
      fail: (err) => {
        console.error('跳转失败：', err);
        
        // 如果页面不存在，显示模拟商家信息
        if (err.errMsg.includes('no such file or directory')) {
          wx.showModal({
            title: '商家信息',
            content: `商家ID: ${storeId}\n商家名称: 川味人家\n评分: 4.7\n配送时间: 30分钟\n距离: 1.2km`,
            showCancel: false
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

  // 查看全部评价
  onViewAllReviews() {
    console.log('查看全部评价');
    wx.navigateTo({
      url: `/pages/reviews/reviews?foodId=${this.data.food.id}`
    });
  },

  // 更新购物车数量
  updateCartCount() {
    const app = getApp();
    const cartCount = app.globalData.cartCount || 0;

    this.setData({
      cartCount: cartCount
    });
  },

  // 分享功能
  onShareAppMessage() {
    const food = this.data.food;
    return {
      title: `【${food.name}】¥${food.price} - 美食小程序`,
      path: `/pages/food-detail/food-detail?foodId=${food.id}`
    };
  }
});