// 分类页面逻辑
Page({
  data: {
    // 当前激活的标签页
    activeTab: 1,
    
    // 购物车数量
    cartCount: 0,

    // 一级分类数据
    mainCategories: [
      {
        id: 1,
        name: '面食',
        icon: 'fa-utensils',
        color: 'linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)'
      },
      {
        id: 2,
        name: '披萨',
        icon: 'fa-pizza-slice',
        color: 'linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 100%)'
      },
      {
        id: 3,
        name: '汉堡',
        icon: 'fa-hamburger',
        color: 'linear-gradient(135deg, #FFD93D 0%, #F6B93B 100%)'
      },
      {
        id: 4,
        name: '甜品',
        icon: 'fa-ice-cream',
        color: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)'
      },
      {
        id: 5,
        name: '饮料',
        icon: 'fa-wine-bottle',
        color: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)'
      },
      {
        id: 6,
        name: '沙拉',
        icon: 'fa-leaf',
        color: 'linear-gradient(135deg, #95E1D3 0%, #F38181 100%)'
      }
    ],

    // 二级分类数据
    subCategories: [],
    selectedCategory: '',

    // 分类美食数据
    categoryFoods: [],

    // 加载状态
    isLoading: false
  },

  // 页面加载
  onLoad(options) {
    console.log('分类页面加载，参数：', options);

    // 更新购物车数量
    this.updateCartCount();

    // 如果有分类参数，直接加载该分类
    if (options.category) {
      this.loadCategoryData(options.category);
    }
  },

  // 点击搜索栏
  onSearchClick() {
    console.log('点击搜索栏');
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },

  // 点击一级分类
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category;
    console.log('点击分类：', category);

    this.loadCategoryData(category);
  },

  // 加载分类数据
  loadCategoryData(category) {
    this.setData({
      isLoading: true,
      selectedCategory: category
    });

    // 模拟加载二级分类
    setTimeout(() => {
      const subCategories = this.getSubCategories(category);
      this.setData({
        subCategories: subCategories
      });

      // 加载分类美食
      this.loadCategoryFoods(category);
    }, 500);
  },

  // 获取二级分类
  getSubCategories(category) {
    const subCategoryMap = {
      '面食': [
        { id: 1, name: '牛肉面' },
        { id: 2, name: '炸酱面' },
        { id: 3, name: '刀削面' },
        { id: 4, name: '拉面' }
      ],
      '披萨': [
        { id: 5, name: '意式披萨' },
        { id: 6, name: '美式披萨' },
        { id: 7, name: '薄底披萨' },
        { id: 8, name: '厚底披萨' }
      ],
      '汉堡': [
        { id: 9, name: '牛肉汉堡' },
        { id: 10, name: '鸡肉汉堡' },
        { id: 11, name: '素食汉堡' },
        { id: 12, name: '双层汉堡' }
      ],
      '甜品': [
        { id: 13, name: '冰淇淋' },
        { id: 14, name: '蛋糕' },
        { id: 15, name: '圣代' },
        { id: 16, name: '奶昔' }
      ],
      '饮料': [
        { id: 17, name: '果汁' },
        { id: 18, name: '奶茶' },
        { id: 19, name: '咖啡' },
        { id: 20, name: '汽水' }
      ],
      '沙拉': [
        { id: 21, name: '水果沙拉' },
        { id: 22, name: '蔬菜沙拉' },
        { id: 23, name: '鸡肉沙拉' },
        { id: 24, name: '海鲜沙拉' }
      ]
    };

    return subCategoryMap[category] || [];
  },

  // 加载分类美食
  async loadCategoryFoods(category) {
    return new Promise((resolve, reject) => {
      // 获取 token（使用 Bearer 格式）
      const storageToken = wx.getStorageSync('token');
      const globalToken = getApp().globalData.token;
      const token = storageToken || globalToken;
      
      console.log('分类页面获取 token:', token ? '已获取' : '未获取');

      wx.request({
        url: `/food/category/${category.id}`,
        method: 'GET',
        header: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            this.setData({
              categoryFoods: res.data.data,
              isLoading: false
            });
            resolve(res.data.data);
          } else if (res.statusCode === 401) {
            // Token 过期或无效
            console.warn('Token 已过期，清除无效 Token');
            wx.removeStorageSync('token');
            getApp().globalData.token = null;
            
            // 使用模拟数据
            const mockFoods = this.getMockFoods(category.name);
            this.setData({
              categoryFoods: mockFoods,
              isLoading: false
            });
            
            // 提示用户（不强制跳转，避免影响浏览）
            wx.showToast({
              title: '登录已过期，部分功能受限',
              icon: 'none',
              duration: 2000
            });
            
            resolve(mockFoods);
          } else {
            console.error('分类美食请求失败:', res.data.message);
            // 降级使用模拟数据
            const mockFoods = this.getMockFoods(category.name);
            this.setData({
              categoryFoods: mockFoods,
              isLoading: false
            });
            resolve(mockFoods);
          }
        },
        fail: (err) => {
          console.error('分类美食请求失败:', err);
          // 降级使用模拟数据
          const mockFoods = this.getMockFoods(category.name);
          this.setData({
            categoryFoods: mockFoods,
            isLoading: false
          });
          resolve(mockFoods);
        }
      });
    });
  },

  // 获取模拟美食数据
  getMockFoods(category) {
    const foodMap = {
      '面食': [
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
          name: '担担面',
          price: 25.00,
          rating: 4.5,
          icon: 'fa-fire',
          image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=300&h=200&fit=crop',
          sales: 178,
          reviews: 92
        },
        {
          id: 3,
          name: '刀削面',
          price: 22.00,
          rating: 4.6,
          icon: 'fa-utensils',
          image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=300&h=200&fit=crop',
          sales: 145,
          reviews: 76
        }
      ],
      '披萨': [
        {
          id: 4,
          name: '芝士培根披萨',
          price: 68.00,
          rating: 4.9,
          icon: 'fa-pizza-slice',
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
          sales: 89,
          reviews: 45
        },
        {
          id: 5,
          name: '水果披萨',
          price: 45.00,
          rating: 4.4,
          icon: 'fa-apple-alt',
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
          sales: 112,
          reviews: 67
        }
      ],
      '汉堡': [
        {
          id: 6,
          name: '香辣鸡腿堡套餐',
          price: 35.00,
          rating: 4.6,
          icon: 'fa-hamburger',
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
          sales: 234,
          reviews: 127
        },
        {
          id: 7,
          name: '牛肉汉堡',
          price: 32.00,
          rating: 4.5,
          icon: 'fa-hamburger',
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
          sales: 189,
          reviews: 95
        }
      ],
      '甜品': [
        {
          id: 8,
          name: '草莓圣代',
          price: 18.00,
          rating: 4.7,
          icon: 'fa-ice-cream',
          image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop',
          sales: 312,
          reviews: 168
        },
        {
          id: 9,
          name: '巧克力蛋糕',
          price: 28.00,
          rating: 4.8,
          icon: 'fa-birthday-cake',
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop',
          sales: 256,
          reviews: 142
        },
        {
          id: 10,
          name: '冰淇淋',
          price: 15.00,
          rating: 4.6,
          icon: 'fa-ice-cream',
          image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop',
          sales: 423,
          reviews: 215
        }
      ],
      '饮料': [
        {
          id: 11,
          name: '芒果汁',
          price: 15.00,
          rating: 4.5,
          icon: 'fa-wine-bottle',
          image: 'https://images.unsplash.com/photo-1622483767020-38c985e645ac?w=300&h=200&fit=crop',
          sales: 98,
          reviews: 43
        },
        {
          id: 12,
          name: '可乐',
          price: 5.00,
          rating: 4.3,
          icon: 'fa-wine-bottle',
          image: 'https://images.unsplash.com/photo-1622483767020-38c985e645ac?w=300&h=200&fit=crop',
          sales: 567,
          reviews: 234
        }
      ],
      '沙拉': [
        {
          id: 13,
          name: '水果沙拉',
          price: 22.00,
          rating: 4.4,
          icon: 'fa-leaf',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
          sales: 145,
          reviews: 76
        },
        {
          id: 14,
          name: '鸡肉沙拉',
          price: 32.00,
          rating: 4.6,
          icon: 'fa-leaf',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
          sales: 178,
          reviews: 92
        },
        {
          id: 15,
          name: '海鲜沙拉',
          price: 38.00,
          rating: 4.7,
          icon: 'fa-fish',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
          sales: 134,
          reviews: 68
        }
      ]
    };

    return foodMap[category] || [];
  },

  // 点击二级分类
  onSubCategoryTap(e) {
    const subcategory = e.currentTarget.dataset.subcategory;
    console.log('点击二级分类：', subcategory);

    // 跳转到子分类页面
    wx.navigateTo({
      url: `/pages/subcategory/subcategory?category=${this.data.selectedCategory}&subcategory=${subcategory}`
    });
  },

  // 点击美食
  onFoodTap(e) {
    const foodId = e.currentTarget.dataset.foodId;
    console.log('点击美食：', foodId);

    // 跳转到美食详情页
    wx.navigateTo({
      url: `/pages/food-detail/food-detail?foodId=${foodId}`
    });
  },

  // 更新购物车数量
  updateCartCount() {
    const app = getApp();
    const cartCount = app.globalData.cartCount || 0;

    this.setData({
      cartCount: cartCount
    });

    // 更新底部导航栏
    const tabBar = this.selectComponent('#tabbar');
    if (tabBar) {
      tabBar.setData({
        cartCount: cartCount,
        activeTab: 1
      });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    
    if (this.data.selectedCategory) {
      this.loadCategoryFoods(this.data.selectedCategory);
    }
    
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 页面显示
  onShow() {
    console.log('分类页面显示');
    this.updateCartCount();
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '美食分类 - 发现更多美味',
      path: '/pages/category/category'
    };
  }
});