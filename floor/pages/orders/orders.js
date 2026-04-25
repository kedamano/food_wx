// pages/orders/orders.js

Page({
  data: {
    // 状态标签配置
    statusTabs: [
      { status: 'all', name: '全部', count: 0 },
      { status: '待付款', name: '待付款', count: 0 },
      { status: '制作中', name: '制作中', count: 0 },
      { status: '配送中', name: '配送中', count: 0 },
      { status: '已完成', name: '已完成', count: 0 }
    ],
    activeTab: 'all',
    orders: [],
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
    this.loadOrders()
    this.loadStatistics()
  },

  onPullDownRefresh: function() {
    this.loadOrders()
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

  // 加载订单列表
  loadOrders: function() {
    var app = getApp()
    var self = this
    var userId = app.globalData.userId || wx.getStorageSync('userId') || 1
    
    self.setData({ loading: true })
    
    app.authRequest({
      url: '/order/user/' + userId,
      method: 'GET'
    }).then(function(res) {
      self.setData({ loading: false })
      
      if (res && res.code === 200 && res.data) {
        var orders = res.data
        
        // 根据当前标签筛选订单
        if (self.data.activeTab !== 'all') {
          var filtered = []
          for (var i = 0; i < orders.length; i++) {
            if (orders[i].status === self.data.activeTab) {
              filtered.push(orders[i])
            }
          }
          orders = filtered
        }
        
        // 格式化订单数据
        var formatted = []
        for (var i = 0; i < orders.length; i++) {
          formatted.push(self.formatOrder(orders[i]))
        }
        orders = formatted
        
        self.setData({
          orders: orders,
          empty: orders.length === 0
        })
      } else {
        self.setData({
          orders: [],
          empty: true
        })
      }
    }).catch(function(err) {
      self.setData({ loading: false })
      console.error('加载订单失败', err)
      self.setData({
        orders: [],
        empty: true
      })
    })
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
    
    return {
      orderId: order.orderId,
      storeName: order.storeName || '美食商家',
      status: order.status,
      statusText: statusInfo.text,
      statusClass: statusInfo.cls,
      orderTime: orderTime,
      finalAmount: finalAmount,
      items: order.items || [],
      address: order.address,
      phone: order.phone
    }
  },

  // 切换标签
  onTabChange: function(e) {
    var status = e.currentTarget.dataset.status
    this.setData({ activeTab: status })
    this.loadOrders()
  },

  // 跳转到订单详情
  onOrderDetail: function(e) {
    var orderId = e.currentTarget.dataset.orderId
    wx.navigateTo({
      url: '/pages/order-detail/order-detail?orderId=' + orderId
    })
  },

  // 搜索订单
  onSearchOrders: function() {
    wx.showToast({
      title: '搜索功能开发中',
      icon: 'none'
    })
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
      url: '/pages/review/review?orderId=' + orderId
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
