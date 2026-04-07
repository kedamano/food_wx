// pages/points/points.js
const app = getApp()

Page({
  data: {
    // 用户积分
    userPoints: 0,
    // 今日可获积分
    todayPoints: 0,
    // 本月累计积分
    monthlyPoints: 0,
    // 每日任务
    dailyTasks: [
      {
        id: 1,
        name: '签到',
        points: 20,
        icon: 'fa-calendar-check',
        completed: false
      },
      {
        id: 2,
        name: '完成订单',
        points: 50,
        icon: 'fa-utensils',
        completed: false
      },
      {
        id: 3,
        name: '评价订单',
        points: 30,
        icon: 'fa-star',
        completed: false
      },
      {
        id: 4,
        name: '分享小程序',
        points: 20,
        icon: 'fa-share-alt',
        completed: false
      }
    ],
    // 积分商品
    products: [
      {
        id: 1,
        name: '5元通用券',
        points: 500,
        originalPrice: 5,
        stock: 999,
        icon: 'fa-ticket-alt'
      },
      {
        id: 2,
        name: '10元满减券',
        points: 980,
        originalPrice: 10,
        stock: 256,
        icon: 'fa-ticket-alt'
      },
      {
        id: 3,
        name: '20元无门槛券',
        points: 1980,
        originalPrice: 20,
        stock: 89,
        icon: 'fa-ticket-alt'
      },
      {
        id: 4,
        name: '50元大额券',
        points: 4880,
        originalPrice: 50,
        stock: 32,
        icon: 'fa-ticket-alt'
      },
      {
        id: 5,
        name: '100元超值券',
        points: 9880,
        originalPrice: 100,
        stock: 12,
        icon: 'fa-ticket-alt'
      },
      {
        id: 6,
        name: '定制餐具套装',
        points: 1280,
        stock: 45,
        icon: 'fa-utensils'
      }
    ],
    // 排序文本
    sortText: '积分从低到高',
    // 积分记录
    recentHistory: []
  },

  // 页面加载
  onLoad(options) {
    console.log('积分商城页面加载');
    this.loadUserPointsInfo();
    this.checkDailyTasks();
  },

  // 页面显示时刷新
  onShow() {
    this.loadUserPointsInfo();
    this.checkDailyTasks();
  },

  // 加载用户积分信息
  loadUserPointsInfo() {
    const userId = app.globalData.userId || wx.getStorageSync('userId') || 1;

    app.authRequest({
      url: `/user/points/${userId}`,
      method: 'GET'
    }).then(res => {
      if (res && res.code === 200 && res.data) {
        this.setData({
          userPoints: res.data.points || 0,
          todayPoints: res.data.todayPoints || 0,
          monthlyPoints: res.data.monthlyPoints || 0
        });
        
        // 保存到本地
        wx.setStorageSync('userPoints', res.data.points);
      }
    }).catch(err => {
      console.error('加载积分信息失败', err);
      // 使用本地缓存
      const cachedPoints = wx.getStorageSync('userPoints') || 0;
      this.setData({ userPoints: cachedPoints });
    });
  },

  // 检查每日任务完成状态
  checkDailyTasks() {
    // 检查今日是否已签到
    const today = new Date().toDateString();
    const signInDate = wx.getStorageSync('signInDate');
    
    const tasks = [...this.data.dailyTasks];
    tasks[0].completed = (signInDate === today);
    
    this.setData({ dailyTasks: tasks });
  },

  // 返回按钮点击
  onBackClick() {
    console.log('返回按钮点击');
    wx.navigateBack({
      delta: 1
    });
  },

  // 积分规则
  onPointsRule() {
    console.log('积分规则');
    wx.showModal({
      title: '积分规则',
      content: '• 签到：每日20积分\n• 完成订单：每单50积分\n• 评价订单：每次30积分\n• 分享小程序：每次20积分\n• 积分有效期：12个月',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 领取积分（签到）
  onGetPoints() {
    console.log('领取积分');

    // 检查是否已经签到
    const today = new Date().toDateString();
    const signInDate = wx.getStorageSync('signInDate');
    
    if (signInDate === today) {
      wx.showToast({
        title: '今日已签到',
        icon: 'none'
      });
      return;
    }

    const userId = app.globalData.userId || wx.getStorageSync('userId') || 1;

    wx.showLoading({
      title: '签到中...'
    });

    app.authRequest({
      url: `/user/sign-in/${userId}`,
      method: 'POST'
    }).then(res => {
      wx.hideLoading();
      
      if (res && res.code === 200 && res.data) {
        // 更新签到状态
        const updatedTasks = this.data.dailyTasks.map(task => 
          task.name === '签到' ? { ...task, completed: true } : task
        );

        // 更新用户积分
        const newUserPoints = res.data.totalPoints || (this.data.userPoints + 20);

        this.setData({
          userPoints: newUserPoints,
          dailyTasks: updatedTasks,
          todayPoints: this.data.todayPoints + 20
        });

        // 保存签到日期
        wx.setStorageSync('signInDate', today);
        wx.setStorageSync('userPoints', newUserPoints);

        wx.showToast({
          title: '签到成功，获得20积分',
          icon: 'success'
        });

        // 添加到积分记录
        const newHistory = {
          id: Date.now(),
          type: '收入',
          points: '+20',
          icon: 'fa-calendar-check',
          time: new Date().toLocaleString()
        };

        this.setData({
          recentHistory: [newHistory, ...this.data.recentHistory]
        });
      } else {
        wx.showToast({
          title: res.message || '签到失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('签到失败', err);
      
      // 如果请求失败，使用本地模拟
      const today = new Date().toDateString();
      const signInDate = wx.getStorageSync('signInDate');
      
      if (signInDate !== today) {
        const updatedTasks = this.data.dailyTasks.map(task => 
          task.name === '签到' ? { ...task, completed: true } : task
        );
        
        const newUserPoints = this.data.userPoints + 20;
        
        this.setData({
          userPoints: newUserPoints,
          dailyTasks: updatedTasks,
          todayPoints: this.data.todayPoints + 20
        });
        
        wx.setStorageSync('signInDate', today);
        wx.setStorageSync('userPoints', newUserPoints);
        
        wx.showToast({
          title: '签到成功，获得20积分',
          icon: 'success'
        });
        
        const newHistory = {
          id: Date.now(),
          type: '收入',
          points: '+20',
          icon: 'fa-calendar-check',
          time: new Date().toLocaleString()
        };
        
        this.setData({
          recentHistory: [newHistory, ...this.data.recentHistory]
        });
      } else {
        wx.showToast({
          title: '今日已签到',
          icon: 'none'
        });
      }
    });
  },

  // 任务点击
  onTaskClick(e) {
    const task = e.currentTarget.dataset.task;
    console.log('任务点击：', task);

    if (task.completed) {
      wx.showToast({
        title: '任务已完成',
        icon: 'none'
      });
      return;
    }

    // 根据任务类型跳转到对应页面
    switch (task.name) {
      case '完成订单':
        wx.switchTab({
          url: '/pages/index/index'
        });
        break;
      case '评价订单':
        wx.navigateTo({
          url: '/pages/orders/orders?status=completed'
        });
        break;
      case '分享小程序':
        // 触发分享
        wx.shareAppMessage({
          title: '美食小程序 - 发现美味，享受生活',
          path: '/pages/index/index'
        });
        break;
      default:
        wx.showToast({
          title: '任务开发中',
          icon: 'none'
        });
    }
  },

  // 排序点击
  onSortClick() {
    console.log('排序点击');
    wx.showActionSheet({
      itemList: ['积分从低到高', '积分从高到低', '热度排序'],
      success: (res) => {
        const sortIndex = res.tapIndex;
        const sortOptions = ['积分从低到高', '积分从高到低', '热度排序'];
        const sortText = sortOptions[sortIndex];

        this.setData({
          sortText: sortText
        });

        // 执行排序
        this.sortProducts(sortIndex);
      }
    });
  },

  // 排序商品
  sortProducts(sortType) {
    let sortedProducts = [...this.data.products];

    switch (sortType) {
      case 0: // 积分从低到高
        sortedProducts.sort((a, b) => a.points - b.points);
        break;
      case 1: // 积分从高到低
        sortedProducts.sort((a, b) => b.points - a.points);
        break;
      case 2: // 热度排序
        sortedProducts.sort((a, b) => b.stock - a.stock);
        break;
    }

    this.setData({
      products: sortedProducts
    });
  },

  // 商品点击
  onProductClick(e) {
    const product = e.currentTarget.dataset.product;
    console.log('商品点击：', product);

    // 检查库存
    if (product.stock <= 0) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      });
      return;
    }

    // 检查积分是否足够
    if (this.data.userPoints < product.points) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      });
      return;
    }

    // 确认兑换
    wx.showModal({
      title: '确认兑换',
      content: `确定要用 ${product.points} 积分兑换 ${product.name} 吗？`,
      success: (res) => {
        if (res.confirm) {
          this.exchangeProduct(product);
        }
      }
    });
  },

  // 兑换商品
  exchangeProduct(product) {
    console.log('兑换商品：', product);

    const userId = app.globalData.userId || wx.getStorageSync('userId') || 1;

    wx.showLoading({
      title: '兑换中...'
    });

    // 调用后端API扣除积分
    app.authRequest({
      url: '/user/points',
      method: 'PUT',
      data: {
        points: product.points,
        type: 'subtract'
      }
    }).then(res => {
      wx.hideLoading();

      if (res && res.code === 200) {
        // 扣除积分
        const newUserPoints = this.data.userPoints - product.points;

        // 减少库存
        const updatedProducts = this.data.products.map(item => 
          item.id === product.id ? { ...item, stock: item.stock - 1 } : item
        );

        this.setData({
          userPoints: newUserPoints,
          products: updatedProducts
        });

        // 保存到本地
        wx.setStorageSync('userPoints', newUserPoints);

        // 添加到积分记录
        const newHistory = {
          id: Date.now(),
          type: '支出',
          points: `-${product.points}`,
          icon: 'fa-gift',
          time: new Date().toLocaleString()
        };

        this.setData({
          recentHistory: [newHistory, ...this.data.recentHistory]
        });

        wx.showToast({
          title: '兑换成功',
          icon: 'success'
        });
        
        // 跳转到优惠券页面
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/coupons/coupons'
          });
        }, 1500);
      } else {
        wx.showToast({
          title: res.message || '兑换失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('兑换失败', err);
      
      // 如果请求失败，使用本地模拟
      const newUserPoints = this.data.userPoints - product.points;
      const updatedProducts = this.data.products.map(item => 
        item.id === product.id ? { ...item, stock: item.stock - 1 } : item
      );

      this.setData({
        userPoints: newUserPoints,
        products: updatedProducts
      });

      wx.setStorageSync('userPoints', newUserPoints);

      const newHistory = {
        id: Date.now(),
        type: '支出',
        points: `-${product.points}`,
        icon: 'fa-gift',
        time: new Date().toLocaleString()
      };

      this.setData({
        recentHistory: [newHistory, ...this.data.recentHistory]
      });

      wx.showToast({
        title: '兑换成功',
        icon: 'success'
      });
    });
  },

  // 查看积分记录
  onViewHistory() {
    console.log('查看积分记录');
    wx.navigateTo({
      url: '/pages/points-history/points-history'
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    this.loadUserPointsInfo();
    this.checkDailyTasks();

    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});
