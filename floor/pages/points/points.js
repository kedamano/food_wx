// pages/points/points.js
var app = getApp();

// FontAwesome 图标名转 emoji（小程序不支持 FA 字体）
var ICON_MAP = {
  'fa-check': '\u2713',
  'fa-utensils': '\uD83C\uDF74',
  'fa-star': '\u2B50',
  'fa-share-alt': '\uD83D\uDD17',
  'fa-ticket-alt': '\uD83C\uDFAB',
  'fa-gem': '\uD83D\uDC8E',
  'fa-gift': '\uD83C\uDF81',
  'fa-check-circle': '\u2705',
  'fa-times-circle': '\u274C',
  'fa-exclamation-circle': '\u26A0',
  'fa-info-circle': '\u2139',
  'fa-dollar-sign': '\uD83D\uDCB5'
};

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
        icon: 'fa-check',
        iconText: '\u2713',
        completed: false
      },
      {
        id: 2,
        name: '完成订单',
        points: 50,
        icon: 'fa-utensils',
        iconText: '\uD83C\uDF74',
        completed: false
      },
      {
        id: 3,
        name: '评价订单',
        points: 30,
        icon: 'fa-star',
        iconText: '\u2B50',
        completed: false
      },
      {
        id: 4,
        name: '分享小程序',
        points: 20,
        icon: 'fa-share-alt',
        iconText: '\uD83D\uDD17',
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
        icon: 'fa-ticket-alt',
        iconText: '\uD83C\uDFAB'
      },
      {
        id: 2,
        name: '10元满减券',
        points: 980,
        originalPrice: 10,
        stock: 256,
        icon: 'fa-ticket-alt',
        iconText: '\uD83C\uDFAB'
      },
      {
        id: 3,
        name: '20元无门槛券',
        points: 1980,
        originalPrice: 20,
        stock: 89,
        icon: 'fa-ticket-alt',
        iconText: '\uD83C\uDFAB'
      },
      {
        id: 4,
        name: '50元大额券',
        points: 4880,
        originalPrice: 50,
        stock: 32,
        icon: 'fa-ticket-alt',
        iconText: '\uD83C\uDFAB'
      },
      {
        id: 5,
        name: '100元超值券',
        points: 9880,
        originalPrice: 100,
        stock: 12,
        icon: 'fa-gem',
        iconText: '\uD83D\uDC8E'
      },
      {
        id: 6,
        name: '定制餐具套装',
        points: 1280,
        stock: 45,
        icon: 'fa-utensils',
        iconText: '\uD83C\uDF74'
      }
    ],
    // 排序文本
    sortText: '积分从低到高',
    // 积分记录
    recentHistory: []
  },

  // 页面加载
  onLoad: function(options) {
    console.log('积分商城页面加载');
    this.loadUserPointsInfo();
    this.checkDailyTasks();
    this.loadRecentHistory();
  },

  // 页面显示时刷新
  onShow: function() {
    this.loadUserPointsInfo();
    this.checkDailyTasks();
    this.loadRecentHistory();
  },

  // 加载用户积分信息
  loadUserPointsInfo: function() {
    var self = this;
    var userId = app.globalData.userId || wx.getStorageSync('userId') || 1;

    app.authRequest({
      url: '/user/points/' + userId,
      method: 'GET'
    }).then(function(res) {
      if (res && res.code === 200 && res.data) {
        self.setData({
          userPoints: res.data.points || 0,
          todayPoints: res.data.todayPoints || 0,
          monthlyPoints: res.data.monthlyPoints || 0
        });
        wx.setStorageSync('userPoints', res.data.points);
      }
    }).catch(function(err) {
      console.error('加载积分信息失败', err);
      var cachedPoints = wx.getStorageSync('userPoints') || 0;
      self.setData({ userPoints: cachedPoints });
    });
  },

  // 加载最近积分记录
  loadRecentHistory: function() {
    var history = wx.getStorageSync('pointsHistory') || [];
    // 只显示最近3条
    this.setData({
      recentHistory: history.slice(0, 3)
    });
  },

  // 检查每日任务完成状态
  checkDailyTasks: function() {
    var today = new Date().toDateString();
    var signInDate = wx.getStorageSync('signInDate');

    var tasks = [];
    for (var i = 0; i < this.data.dailyTasks.length; i++) {
      var task = this.data.dailyTasks[i];
      var taskCopy = {};
      for (var tk in task) taskCopy[tk] = task[tk];
      tasks.push(taskCopy);
    }
    tasks[0].completed = (signInDate === today);

    this.setData({ dailyTasks: tasks });
  },

  // 积分规则
  onPointsRule: function() {
    wx.showModal({
      title: '积分规则',
      content: '• 签到：每日20积分\n• 完成订单：每单50积分\n• 评价订单：每次30积分\n• 分享小程序：每次20积分\n• 积分有效期：12个月',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 领取积分（签到）
  onGetPoints: function() {
    var self = this;

    var today = new Date().toDateString();
    var signInDate = wx.getStorageSync('signInDate');

    if (signInDate === today) {
      wx.showToast({ title: '今日已签到', icon: 'none' });
      return;
    }

    var userId = app.globalData.userId || wx.getStorageSync('userId') || 1;

    wx.showLoading({ title: '签到中...' });

    app.authRequest({
      url: '/user/sign-in/' + userId,
      method: 'POST'
    }).then(function(res) {
      wx.hideLoading();

      if (res && res.code === 200 && res.data) {
        var updatedTasks = [];
        for (var ti = 0; ti < self.data.dailyTasks.length; ti++) {
          var tsk = self.data.dailyTasks[ti];
          var tCopy = {};
          for (var tj in tsk) tCopy[tj] = tsk[tj];
          if (tsk.name === '签到') {
            tCopy.completed = true;
          }
          updatedTasks.push(tCopy);
        }

        var newUserPoints = res.data.totalPoints || (self.data.userPoints + 20);

        self.setData({
          userPoints: newUserPoints,
          dailyTasks: updatedTasks,
          todayPoints: self.data.todayPoints + 20
        });

        wx.setStorageSync('signInDate', today);
        wx.setStorageSync('userPoints', newUserPoints);

        // 添加积分记录
        var newRecord = {
          id: Date.now(),
          type: '收入',
          desc: '每日签到',
          points: '+20',
          icon: 'fa-check',
          iconText: '\u2713',
          time: new Date().toLocaleString()
        };
        var history = wx.getStorageSync('pointsHistory') || [];
        history.unshift(newRecord);
        wx.setStorageSync('pointsHistory', history);
        self.loadRecentHistory();

        wx.showToast({ title: '签到成功，获得20积分', icon: 'success' });
      } else {
        wx.showToast({ title: res.message || '签到失败', icon: 'none' });
      }
    }).catch(function(err) {
      wx.hideLoading();
      console.error('签到失败', err);

      var today2 = new Date().toDateString();
      var signInDate2 = wx.getStorageSync('signInDate');

      if (signInDate2 !== today2) {
        var updatedTasks2 = [];
        for (var ti2 = 0; ti2 < self.data.dailyTasks.length; ti2++) {
          var tsk2 = self.data.dailyTasks[ti2];
          var tCopy2 = {};
          for (var tj2 in tsk2) tCopy2[tj2] = tsk2[tj2];
          if (tsk2.name === '签到') {
            tCopy2.completed = true;
          }
          updatedTasks2.push(tCopy2);
        }

        var newUserPoints2 = self.data.userPoints + 20;

        self.setData({
          userPoints: newUserPoints2,
          dailyTasks: updatedTasks2,
          todayPoints: self.data.todayPoints + 20
        });

        wx.setStorageSync('signInDate', today2);
        wx.setStorageSync('userPoints', newUserPoints2);

        var newRecord2 = {
          id: Date.now(),
          type: '收入',
          desc: '每日签到',
          points: '+20',
          icon: 'fa-check',
          iconText: '\u2713',
          time: new Date().toLocaleString()
        };
        var history2 = wx.getStorageSync('pointsHistory') || [];
        history2.unshift(newRecord2);
        wx.setStorageSync('pointsHistory', history2);
        self.loadRecentHistory();

        wx.showToast({ title: '签到成功，获得20积分', icon: 'success' });
      } else {
        wx.showToast({ title: '今日已签到', icon: 'none' });
      }
    });
  },

  // 任务点击
  onTaskClick: function(e) {
    var task = e.currentTarget.dataset.task;

    if (task.completed) {
      wx.showToast({ title: '任务已完成', icon: 'none' });
      return;
    }

    switch (task.name) {
      case '完成订单':
        wx.switchTab({ url: '/pages/index/index' });
        break;
      case '评价订单':
        wx.navigateTo({ url: '/pages/orders/orders?status=completed' });
        break;
      case '分享小程序':
        wx.showToast({ title: '请在菜单中分享', icon: 'none' });
        break;
      default:
        wx.showToast({ title: '任务开发中', icon: 'none' });
    }
  },

  // 排序点击
  onSortClick: function() {
    var self = this;
    wx.showActionSheet({
      itemList: ['积分从低到高', '积分从高到低', '热度排序'],
      success: function(res) {
        var sortIndex = res.tapIndex;
        var sortOptions = ['积分从低到高', '积分从高到低', '热度排序'];
        var sortText = sortOptions[sortIndex];
        self.setData({ sortText: sortText });
        self.sortProducts(sortIndex);
      }
    });
  },

  // 排序商品
  sortProducts: function(sortType) {
    var sortedProducts = this.data.products.slice();

    if (sortType === 0) {
      sortedProducts.sort(function(a, b) { return a.points - b.points; });
    } else if (sortType === 1) {
      sortedProducts.sort(function(a, b) { return b.points - a.points; });
    } else {
      sortedProducts.sort(function(a, b) { return b.stock - a.stock; });
    }

    this.setData({ products: sortedProducts });
  },

  // 商品点击
  onProductClick: function(e) {
    var self = this;
    var product = e.currentTarget.dataset.product;

    if (product.stock <= 0) {
      wx.showToast({ title: '库存不足', icon: 'none' });
      return;
    }

    if (this.data.userPoints < product.points) {
      wx.showToast({ title: '积分不足', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认兑换',
      content: '确定要用 ' + product.points + ' 积分兑换 ' + product.name + ' 吗？',
      success: function(res) {
        if (res.confirm) {
          self.exchangeProduct(product);
        }
      }
    });
  },

  // 兑换商品
  exchangeProduct: function(product) {
    var self = this;
    var userId = app.globalData.userId || wx.getStorageSync('userId') || 1;

    wx.showLoading({ title: '兑换中...' });

    app.authRequest({
      url: '/user/points',
      method: 'PUT',
      data: {
        points: product.points,
        type: 'subtract'
      }
    }).then(function(res) {
      wx.hideLoading();

      if (res && res.code === 200) {
        var newUserPoints = self.data.userPoints - product.points;
        var updatedProducts = [];
        for (var pi = 0; pi < self.data.products.length; pi++) {
          var prodItem = self.data.products[pi];
          var pCopy = {};
          for (var pk in prodItem) pCopy[pk] = prodItem[pk];
          if (prodItem.id === product.id) {
            pCopy.stock = prodItem.stock - 1;
          }
          updatedProducts.push(pCopy);
        }

        self.setData({
          userPoints: newUserPoints,
          products: updatedProducts
        });

        wx.setStorageSync('userPoints', newUserPoints);

        // 添加积分记录
        var newRecord = {
          id: Date.now(),
          type: '支出',
          desc: '兑换' + product.name,
          points: '-' + product.points,
          icon: 'fa-gift',
          iconText: '\uD83C\uDF81',
          time: new Date().toLocaleString()
        };
        var history = wx.getStorageSync('pointsHistory') || [];
        history.unshift(newRecord);
        wx.setStorageSync('pointsHistory', history);
        self.loadRecentHistory();

        wx.showToast({ title: '兑换成功', icon: 'success' });

        setTimeout(function() {
          wx.navigateTo({ url: '/pages/coupons/coupons' });
        }, 1500);
      } else {
        wx.showToast({ title: res.message || '兑换失败', icon: 'none' });
      }
    }).catch(function(err) {
      wx.hideLoading();
      console.error('兑换失败', err);

      var newUserPoints2 = self.data.userPoints - product.points;
      var updatedProducts2 = [];
      for (var pi2 = 0; pi2 < self.data.products.length; pi2++) {
        var prodItem2 = self.data.products[pi2];
        var pCopy2 = {};
        for (var pk2 in prodItem2) pCopy2[pk2] = prodItem2[pk2];
        if (prodItem2.id === product.id) {
          pCopy2.stock = prodItem2.stock - 1;
        }
        updatedProducts2.push(pCopy2);
      }

      self.setData({
        userPoints: newUserPoints2,
        products: updatedProducts2
      });

      wx.setStorageSync('userPoints', newUserPoints2);

      var newRecord2 = {
        id: Date.now(),
        type: '支出',
        desc: '兑换' + product.name,
        points: '-' + product.points,
        icon: 'fa-gift',
        iconText: '\uD83C\uDF81',
        time: new Date().toLocaleString()
      };
      var history2 = wx.getStorageSync('pointsHistory') || [];
      history2.unshift(newRecord2);
      wx.setStorageSync('pointsHistory', history2);
      self.loadRecentHistory();

      wx.showToast({ title: '兑换成功', icon: 'success' });
    });
  },

  // 查看积分记录
  onViewHistory: function() {
    wx.navigateTo({
      url: '/pages/points-history/points-history'
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadUserPointsInfo();
    this.checkDailyTasks();
    this.loadRecentHistory();

    setTimeout(function() {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});
