/**
 * 消费明细页面逻辑
 */

Page({
  data: {
    spendingList: [],
    totalSpending: 0,
    totalSpendingStr: '0.00',
    monthSpending: 0,
    loading: false,
    empty: false,
    currentMonth: '',
    months: ['全部', '近1月', '近3月', '近6月', '近1年']
  },

  onLoad: function() {
    var now = new Date();
    var monthStr = now.getFullYear() + '年' + (now.getMonth() + 1) + '月';
    this.setData({ currentMonth: monthStr });
    this.loadSpendingList();
  },

  onShow: function() {
    if (!this.data.spendingList.length) {
      this.loadSpendingList();
    }
  },

  onPullDownRefresh: function() {
    this.loadSpendingList();
    wx.stopPullDownRefresh();
  },

  // 筛选月份
  onFilterMonth: function(e) {
    var month = e.currentTarget.dataset.month;
    this.setData({ currentMonth: month });
    this.filterByMonth(month);
  },

  // 按月份筛选
  filterByMonth: function(month) {
    var allList = this.data.allList || this.data.spendingList;
    if (month === '全部') {
      this.setData({ spendingList: allList });
      return;
    }
    var filtered = allList.slice();
    this.setData({ spendingList: filtered });
  },

  // 加载消费明细（从已完成的订单中获取）
  loadSpendingList: function() {
    var self = this;
    var app = getApp();
    self.setData({ loading: true });

    var userId = app.globalData.userId || wx.getStorageSync('userId') || 1;

    app.authRequest({
      url: '/order/user/' + userId,
      method: 'GET'
    }).then(function(res) {
      self.setData({ loading: false });
      if (res && res.code === 200 && res.data) {
        var orders = Array.isArray(res.data) ? res.data : [];
        // 只显示已完成或已支付的订单
        var completedOrders = [];
        for (var i = 0; i < orders.length; i++) {
          if (orders[i].status === '已完成' || orders[i].status === 'completed') {
            completedOrders.push(orders[i]);
          }
        }
        var list = [];
        var total = 0;
        for (var j = 0; j < completedOrders.length; j++) {
          var formatted = self.formatSpending(completedOrders[j]);
          if (formatted) {
            list.push(formatted);
            total += formatted.amount;
          }
        }
        self.setData({
          spendingList: list,
          allList: list,
          totalSpending: total,
          totalSpendingStr: total.toFixed(2),
          monthSpending: total,
          empty: list.length === 0
        });
      } else {
        self.setData({ spendingList: [], allList: [], totalSpending: 0, totalSpendingStr: '0.00', monthSpending: 0, empty: true });
      }
    }).catch(function(err) {
      console.error('加载消费明细失败', err);
      self.setData({ loading: false, spendingList: [], allList: [], totalSpending: 0, totalSpendingStr: '0.00', monthSpending: 0, empty: true });
    });
  },

  // 格式化消费记录
  formatSpending: function(order) {
    if (!order) return null;
    try {
      var date = new Date(order.createTime || order.orderTime || Date.now());
      var dateStr = (date.getMonth() + 1) + '月' + date.getDate() + '日';
      var amount = parseFloat(order.payAmount || order.finalAmount || order.totalAmount || order.amount || 0);
      amount = isNaN(amount) ? 0 : amount;
      var items = order.items;
      var itemsStr = '美食';
      if (Array.isArray(items)) {
        var itemNames = [];
        for (var i = 0; i < items.length; i++) {
          var name = items[i].name || items[i].foodName || '';
          if (name) {
            itemNames.push(name);
          }
        }
        itemsStr = itemNames.join('、') || '美食';
      } else if (typeof items === 'string') {
        itemsStr = items;
      }
      var hours = String(date.getHours());
      var minutes = String(date.getMinutes());
      if (hours.length < 2) hours = '0' + hours;
      if (minutes.length < 2) minutes = '0' + minutes;
      return {
        orderId: order.orderId || order.id || 0,
        storeName: order.storeName || order.store_name || '美食商家',
        items: itemsStr,
        amount: amount,
        amountStr: amount.toFixed(2),
        date: dateStr,
        time: hours + ':' + minutes,
        status: order.status || '已完成'
      };
    } catch (e) {
      console.error('格式化消费记录失败', e);
      return null;
    }
  },

  // 查看订单详情
  onOrderDetail: function(e) {
    var orderId = e.currentTarget.dataset.orderId;
    wx.navigateTo({
      url: '/pages/order-detail/order-detail?orderId=' + orderId
    });
  }
});
