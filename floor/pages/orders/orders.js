// pages/orders/orders.js

Page({
  // 触底分页：每页条数
  PAGE_SIZE: 10,

  data: {
    orders: [],
    hasMore: false,
    // 状态标签配置
    statusTabs: [
      { status: 'all', name: '全部', count: 0 },
      { status: '待付款', name: '待付款', count: 0 },
      { status: '制作中', name: '制作中', count: 0 },
      { status: '配送中', name: '配送中', count: 0 },
      { status: '已完成', name: '已完成', count: 0 }
    ],
    activeTab: 'all',
    searchKeyword: '',
    loading: false,
    empty: false
  },

  onLoad: function(options) {
    // 从选项卡切换进入时，可以指定默认标签
    if (options.status) {
      this.setData({ activeTab: options.status })
    }
  },

  onShow: function() {
    // 每次显示页面时刷新数据
    this.loadOrders(true)
    this.loadStatistics()
  },

  onPullDownRefresh: function() {
    this.loadOrders(true)
    this.loadStatistics()
    wx.stopPullDownRefresh()
  },

  // 加载订单统计数据
  loadStatistics: function() {
    var app = getApp()
    var self = this
    app.authRequest({
      url: '/order/statistics',
      method: 'GET'
    }).then(function(res) {
      if (res && res.code === 200 && res.data) {
        var stats = res.data
        var tabs = []
        for (var i = 0; i < self.data.statusTabs.length; i++) {
          var tab = { status: self.data.statusTabs[i].status, name: self.data.statusTabs[i].name, count: self.data.statusTabs[i].count }
          if (tab.status === 'all') {
            tab.count = stats.totalOrders || 0
          } else if (tab.status === '待付款') {
            tab.count = stats.pendingOrders || 0
          } else if (tab.status === '制作中') {
            tab.count = stats.preparingOrders || 0
          } else if (tab.status === '配送中') {
            tab.count = stats.deliveringOrders || 0
          } else if (tab.status === '已完成') {
            tab.count = stats.completedOrders || 0
          }
          tabs.push(tab)
        }
        self.setData({ statusTabs: tabs })
      }
    }).catch(function(err) {
      console.error('加载订单统计失败', err)
    })
  },

  // 加载订单列表（服务端分页）
  loadOrders: function(reset) {
    var app = getApp()
    var self = this

    // 未登录不请求，展示空态
    if (!app.isLoggedIn()) {
      self.setData({ orders: [], empty: true })
      return
    }

    if (reset || !this._page) {
      this._page = 1
    }

    self.setData({ loading: true })

    var url = '/order/user/' + app.getCurrentUserId()
      + '?page=' + this._page + '&size=' + this.PAGE_SIZE
    if (this.data.activeTab !== 'all') {
      url += '&status=' + encodeURIComponent(this.data.activeTab)
    }

    app.authRequest({
      url: url,
      method: 'GET'
    }).then(function(res) {
      self.setData({ loading: false })

      if (res && res.code === 200 && res.data) {
        var list = res.data.list || []
        var total = res.data.total || 0

        var formatted = []
        for (var i = 0; i < list.length; i++) {
          formatted.push(self.formatOrder(list[i]))
        }

        var merged = self._page === 1 ? formatted : self.data.orders.concat(formatted)
        self.setData({
          orders: merged,
          empty: merged.length === 0,
          hasMore: merged.length < total
        })
      } else {
        self.setData({
          orders: [],
          empty: true,
          hasMore: false
        })
      }
    }).catch(function(err) {
      self.setData({ loading: false })
      console.error('加载订单失败', err)
      self.setData({
        orders: [],
        empty: true,
        hasMore: false
      })
    })
  },

  // 触底加载下一页（服务端分页）
  onReachBottom: function() {
    if (!this.data.hasMore || this.data.loading) return
    this._page = (this._page || 1) + 1
    this.loadOrders(false)
  },

  // 格式化订单数据
  formatOrder: function(order) {
    // 格式化状态显示
    var statusMap = {
      '待付款': { text: '待付款', cls: 'pending' },
      '待接单': { text: '待接单', cls: 'pending' },
      '已接单': { text: '已接单', cls: 'preparing' },
      '制作中': { text: '制作中', cls: 'preparing' },
      '配送中': { text: '配送中', cls: 'delivering' },
      '已完成': { text: '已完成', cls: 'completed' },
      '已取消': { text: '已取消', cls: 'completed' }
    }
    
    var statusInfo = statusMap[order.status] || { text: order.status, cls: 'pending' }
    
    // 格式化时间
    var orderTime = ''
    if (order.createTime) {
      var timeStr = order.createTime.replace('T', ' ').replace(/-/g, '/')
      var date = new Date(timeStr)
      if (isNaN(date.getTime())) {
        // 解析失败，直接截取字符串
        var parts = order.createTime.substring(0, 16).replace('T', ' ').split(/[-\s:]/)
        orderTime = parseInt(parts[1]) + '/' + parseInt(parts[2]) + ' ' + parts[3] + ':' + parts[4]
      } else {
        var month = date.getMonth() + 1
        var day = date.getDate()
        var hours = date.getHours().toString()
        if (hours.length < 2) hours = '0' + hours
        var minutes = date.getMinutes().toString()
        if (minutes.length < 2) minutes = '0' + minutes
        orderTime = month + '/' + day + ' ' + hours + ':' + minutes
      }
    }
    
    // 格式化金额
    var finalAmount = order.payAmount ? order.payAmount.toFixed(2) : '0.00'

    // 后端返回的字段是 orderDetails
    var rawItems = order.orderDetails || order.items || []
    var items = []
    for (var ii = 0; ii < rawItems.length; ii++) {
      var it = rawItems[ii]
      items.push({
        foodId: it.foodId,
        name: it.foodName || it.name || '商品',
        price: parseFloat(it.price) || 0,
        quantity: it.quantity || 1,
        image: it.image || ''
      })
    }

    return {
      orderId: order.orderId,
      storeName: order.storeName || '美食商家',
      status: order.status,
      statusText: statusInfo.text,
      statusClass: statusInfo.cls,
      orderTime: orderTime,
      finalAmount: finalAmount,
      items: items,
      address: order.address,
      phone: order.phone
    }
  },

  // 切换标签
  onTabChange: function(e) {
    var status = e.currentTarget.dataset.status
    this.setData({ activeTab: status, searchKeyword: '' })
    this.loadOrders(true)
  },

  // 跳转到订单详情
  onOrderDetail: function(e) {
    var orderId = e.currentTarget.dataset.orderId
    wx.navigateTo({
      url: '/pages/order-detail/order-detail?orderId=' + orderId
    })
  },

  // 搜索订单：对当前列表按订单号/商家名/状态本地过滤
  onSearchOrders: function() {
    var self = this;
    wx.showModal({
      title: '搜索订单',
      editable: true,
      placeholderText: '输入订单号、商家名或状态',
      success: function(res) {
        if (!res.confirm) return;
        var keyword = (res.content || '').trim();
        if (!keyword) {
          // 清空关键词：恢复完整列表
          self.setData({ searchKeyword: '' });
          self.loadOrders(true);
          return;
        }
        self.setData({ searchKeyword: keyword });
        self.filterOrders(keyword);
      }
    });
  },

  // 本地过滤已加载的订单
  filterOrders: function(keyword) {
    var kw = keyword.toLowerCase();
    var filtered = [];
    for (var i = 0; i < this.data.orders.length; i++) {
      var o = this.data.orders[i];
      var storeName = (o.storeName || (o.store && o.store.name) || '').toLowerCase();
      var orderNo = String(o.orderNo || o.orderId || '').toLowerCase();
      var statusText = o.statusText || o.status || '';
      if (orderNo.indexOf(kw) !== -1 || storeName.indexOf(kw) !== -1 || statusText.indexOf(keyword) !== -1) {
        filtered.push(o);
      }
    }
    this.setData({
      orders: filtered,
      empty: filtered.length === 0,
      hasMore: false
    });
  },

  // 取消订单
  onCancelOrder: function(e) {
    var self = this
    var app = getApp()
    var orderId = e.currentTarget.dataset.orderId
    wx.showModal({
      title: '确认取消',
      content: '确定要取消该订单吗？',
      success: function(res) {
        if (res.confirm) {
          app.authRequest({
            url: '/order/' + orderId + '/cancel',
            method: 'PUT'
          }).then(function(res) {
            if (res && res.code === 200) {
              wx.showToast({ title: '订单已取消', icon: 'success' })
              self.loadOrders()
              self.loadStatistics()
            }
          }).catch(function(err) {
            console.error('取消订单失败', err)
            wx.showToast({ title: '取消失败', icon: 'none' })
          })
        }
      }
    })
  },

  // 支付订单
  onPayOrder: function(e) {
    var orderId = e.currentTarget.dataset.orderId
    wx.navigateTo({
      url: '/pages/payment/payment?orderId=' + orderId
    })
  },

  // 催单
  onRemindOrder: function(e) {
    var app = getApp()
    var orderId = e.currentTarget.dataset.orderId
    app.authRequest({
      url: '/order/' + orderId + '/remind',
      method: 'PUT'
    }).then(function(res) {
      if (res && res.code === 200) {
        wx.showToast({ title: '已提醒商家', icon: 'success' })
      }
    }).catch(function(err) {
      console.error('催单失败', err)
      wx.showToast({ title: '催单失败', icon: 'none' })
    })
  },

  // 查看配送
  onTrackOrder: function(e) {
    var orderId = e.currentTarget.dataset.orderId
    wx.navigateTo({
      url: '/pages/order-detail/order-detail?orderId=' + orderId + '&tab=track'
    })
  },

  // 确认收货
  onConfirmReceive: function(e) {
    var self = this
    var app = getApp()
    var orderId = e.currentTarget.dataset.orderId
    wx.showModal({
      title: '确认收货',
      content: '确认已收到商品？',
      success: function(res) {
        if (res.confirm) {
          app.authRequest({
            url: '/order/' + orderId + '/complete',
            method: 'PUT'
          }).then(function(res) {
            if (res && res.code === 200) {
              wx.showToast({ title: '确认收货成功', icon: 'success' })
              self.loadOrders()
              self.loadStatistics()
            }
          }).catch(function(err) {
            console.error('确认收货失败', err)
            wx.showToast({ title: '操作失败', icon: 'none' })
          })
        }
      }
    })
  },

  // 评价订单
  onReviewOrder: function(e) {
    var orderId = e.currentTarget.dataset.orderId
    wx.navigateTo({
      url: '/pages/order-review/order-review?orderId=' + orderId
    })
  },

  // 再来一单
  onOrderAgain: function(e) {
    var self = this
    var app = getApp()
    var orderId = e.currentTarget.dataset.orderId
    // 找到对应的订单
    var order = null
    for (var i = 0; i < self.data.orders.length; i++) {
      if (self.data.orders[i].orderId === orderId) {
        order = self.data.orders[i]
        break
      }
    }
    if (order) {
      // 获取商家ID并跳转到商家页面
      app.authRequest({
        url: '/order/' + orderId,
        method: 'GET'
      }).then(function(res) {
        if (res && res.code === 200 && res.data) {
          var storeId = res.data.storeId
          wx.navigateTo({
            url: '/pages/store-detail/store-detail?storeId=' + storeId
          })
        }
      }).catch(function(err) {
        console.error('获取订单详情失败', err)
        wx.showToast({ title: '操作失败', icon: 'none' })
      })
    }
  },

  // 去购物
  onGoShopping: function() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
