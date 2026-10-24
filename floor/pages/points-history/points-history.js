// pages/points-history/points-history.js
var app = getApp()

Page({
  data: {
    // 筛选类型
    filterType: 'all',
    // 筛选选项
    filterTabs: [
      { key: 'all', name: '全部' },
      { key: '收入', name: '收入' },
      { key: '支出', name: '支出' }
    ],
    // 积分记录列表
    historyList: [],
    // 用户总积分
    userPoints: 0,
    // 加载中
    loading: true,
    // 空状态
    isEmpty: false
  },

  onLoad: function() {
    this.loadUserPoints();
    this.loadHistory();
  },

  onShow: function() {
    this.loadUserPoints();
    this.loadHistory();
  },

  onPullDownRefresh: function() {
    var self = this;
    this.loadHistory();
    setTimeout(function() {
      wx.stopPullDownRefresh();
    }, 800);
  },

  // 加载用户积分
  loadUserPoints: function() {
    var self = this;
    var userId = app.globalData.userId || wx.getStorageSync('userId') || 1;

    app.authRequest({
      url: '/user/points/' + userId,
      method: 'GET'
    }).then(function(res) {
      if (res && res.code === 200 && res.data) {
        self.setData({ userPoints: res.data.points || 0 });
      }
    }).catch(function() {
      var cached = wx.getStorageSync('userPoints') || 0;
      self.setData({ userPoints: cached });
    });
  },

  // 加载积分记录
  loadHistory: function() {
    var self = this;
    this.setData({ loading: true });

    var userId = app.globalData.userId || wx.getStorageSync('userId') || 1;

    app.authRequest({
      url: '/user/points-history/' + userId,
      method: 'GET'
    }).then(function(res) {
      self.setData({ loading: false });
      if (res && res.code === 200 && res.data && res.data.length > 0) {
        var rawList = res.data;
        var list = [];
        for (var i = 0; i < rawList.length; i++) {
          list.push(self.formatRecord(rawList[i]));
        }
        wx.setStorageSync('pointsHistory', list);
        self.applyFilter(list);
      } else {
        // 使用本地缓存
        self.useLocalHistory();
      }
    }).catch(function(err) {
      console.error('加载积分记录失败', err);
      self.setData({ loading: false });
      self.useLocalHistory();
    });
  },

  // 使用本地历史
  useLocalHistory: function() {
    var history = wx.getStorageSync('pointsHistory') || [];
    // 无数据时展示空态，不再使用假记录兜底
    this.applyFilter(history);
  },


  // 格式化日期
  formatDate: function(date) {
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var h = date.getHours().toString();
    if (h.length < 2) h = '0' + h;
    var min = date.getMinutes().toString();
    if (min.length < 2) min = '0' + min;
    return m + '/' + d + ' ' + h + ':' + min;
  },

  // 格式化记录
  formatRecord: function(item) {
    var icon = item.icon || (item.type === '收入' ? 'fa-coins' : 'fa-gift');
    var ICON_TEXT = {
      'fa-check': '\u2713',
      'fa-utensils': '\uD83C\uDF74',
      'fa-star': '\u2B50',
      'fa-share-alt': '\uD83D\uDD17',
      'fa-ticket-alt': '\uD83C\uDFAB',
      'fa-gem': '\uD83D\uDC8E',
      'fa-gift': '\uD83C\uDF81',
      'fa-coins': '\uD83D\uDCB5'
    };
    return {
      id: item.id || Date.now(),
      type: item.type || '收入',
      desc: item.desc || item.description || (item.type === '收入' ? '获得积分' : '消费积分'),
      points: item.points || (item.type === '收入' ? '+' + (item.amount || 0) : '-' + (item.amount || 0)),
      icon: icon,
      iconText: item.iconText || ICON_TEXT[icon] || '\u2713',
      time: item.time || item.createTime || new Date().toLocaleString()
    };
  },

  // 应用筛选
  applyFilter: function(allList) {
    var filterType = this.data.filterType;
    var filtered;

    if (filterType !== 'all') {
      filtered = [];
      for (var i = 0; i < allList.length; i++) {
        if (allList[i].type === filterType) {
          filtered.push(allList[i]);
        }
      }
    } else {
      filtered = allList;
    }

    this.setData({
      historyList: filtered,
      isEmpty: filtered.length === 0
    });
  },

  // 切换筛选
  onFilterTap: function(e) {
    var key = e.currentTarget.dataset.key;
    this.setData({ filterType: key });
    var allHistory = wx.getStorageSync('pointsHistory') || [];
    this.applyFilter(allHistory);
  },

  // 清空积分记录
  onClearHistory: function() {
    var self = this;
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有积分记录吗？此操作不可撤销。',
      confirmColor: '#FF6633',
      success: function(res) {
        if (res.confirm) {
          wx.removeStorageSync('pointsHistory');
          self.setData({
            historyList: [],
            isEmpty: true
          });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  }
});
