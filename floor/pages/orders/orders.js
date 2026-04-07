// pages/orders/orders.js
const app = getApp()

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

  onLoad(options) {
    // 从选项卡切换进入时，可以指定默认标签
    if (options.status) {
      this.setData({ activeTab: options.status })
    }
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadOrders()
    this.loadStatistics()
  },

  onPullDownRefresh() {
    this.loadOrders()
    this.loadStatistics()
    wx.stopPullDownRefresh()
  },

  // 加载订单统计数据
  loadStatistics() {
    app.authRequest({
      url: '/order/statistics',
      method: 'GET'
    }).then(res => {
      if (res && res.code === 200 && res.data) {
        const stats = res.data
        const tabs = this.data.statusTabs.map(tab => {
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
          return tab
        })
        this.setData({ statusTabs: tabs })
      }
    }).catch(err => {
      console.error('加载订单统计失败', err)
    })
  },

  // 加载订单列表
  loadOrders() {
    const userId = app.globalData.userId || wx.getStorageSync('userId') || 1
    
    this.setData({ loading: true })
    
    app.authRequest({
      url: `/order/user/${userId}`,
      method: 'GET'
    }).then(res => {
      this.setData({ loading: false })
      
      if (res && res.code === 200 && res.data) {
        let orders = res.data
        
        // 根据当前标签筛选订单
        if (this.data.activeTab !== 'all') {
          orders = orders.filter(order => order.status === this.data.activeTab)
        }
        
        // 格式化订单数据
        orders = orders.map(order => this.formatOrder(order))
        
        this.setData({
          orders: orders,
          empty: orders.length === 0
        })
      } else {
        this.setData({
          orders: [],
          empty: true
        })
      }
    }).catch(err => {
      this.setData({ loading: false })
      console.error('加载订单失败', err)
      // 如果请求失败，尝试使用本地 mock 数据
      this.useMockData()
    })
  },

  // 格式化订单数据
  formatOrder(order) {
    // 格式化状态显示
    const statusMap = {
      '待付款': { text: '待付款', class: 'pending' },
      '待接单': { text: '待接单', class: 'pending' },
      '已接单': { text: '已接单', class: 'preparing' },
      '制作中': { text: '制作中', class: 'preparing' },
      '配送中': { text: '配送中', class: 'delivering' },
      '已完成': { text: '已完成', class: 'completed' },
      '已取消': { text: '已取消', class: 'completed' }
    }
    
    const statusInfo = statusMap[order.status] || { text: order.status, class: 'pending' }
    
    // 格式化时间
    let orderTime = ''
    if (order.createTime) {
      const date = new Date(order.createTime)
      orderTime = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }
    
    // 格式化金额
    const finalAmount = order.payAmount ? order.payAmount.toFixed(2) : '0.00'
    
    return {
      orderId: order.orderId,
      storeName: order.storeName || '美食商家',
      status: order.status,
      statusText: statusInfo.text,
      statusClass: statusInfo.class,
      orderTime: orderTime,
      finalAmount: finalAmount,
      items: order.items || [],
      address: order.address,
      phone: order.phone
    }
  },

  // 使用 Mock 数据（请求失败时的降级处理）
  useMockData() {
    const mockOrders = [
      {
        orderId: 1,
        storeName: '湘菜馆',
        status: '已完成',
        statusText: '已完成',
        statusClass: 'completed',
        orderTime: '04/06 12:30',
        finalAmount: '68.50',
        items: [
          { name: '剁椒鱼头', quantity: 1, price: '38.00', image: '' },
          { name: '小炒肉', quantity: 1, price: '28.00', image: '' }
        ]
      },
      {
        orderId: 2,
        storeName: '麦当劳',
        status: '配送中',
        statusText: '配送中',
        statusClass: 'delivering',
        orderTime: '04/07 18:20',
        finalAmount: '45.00',
        items: [
          { name: '巨无霸套餐', quantity: 1, price: '35.00', image: '' },
          { name: '薯条(中)', quantity: 1, price: '10.00', image: '' }
        ]
      },
      {
        orderId: 3,
        storeName: '面食馆',
        status: '待付款',
        statusText: '待付款',
        statusClass: 'pending',
        orderTime: '04/07 19:00',
        finalAmount: '32.00',
        items: [
          { name: '牛肉拉面', quantity: 1, price: '32.00', image: '' }
        ]
      }
    ]
    
    // 根据标签筛选
    let orders = mockOrders
    if (this.data.activeTab !== 'all') {
      orders = orders.filter(order => order.status === this.data.activeTab)
    }
    
    this.setData({
      orders: orders,
      empty: orders.length === 0
    })
  },

  // 切换标签
  onTabChange(e) {
    const status = e.currentTarget.dataset.status
    this.setData({ activeTab: status })
    this.loadOrders()
  },

  // 跳转到订单详情
  onOrderDetail(e) {
    const orderId = e.currentTarget.dataset.orderId
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?orderId=${orderId}`
    })
  },

  // 搜索订单
  onSearchOrders() {
    wx.showToast({
      title: '搜索功能开发中',
      icon: 'none'
    })
  },

  // 取消订单
  onCancelOrder(e) {
    const orderId = e.currentTarget.dataset.orderId
    wx.showModal({
      title: '确认取消',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          app.authRequest({
            url: `/order/${orderId}/cancel`,
            method: 'PUT'
          }).then(res => {
            if (res && res.code === 200) {
              wx.showToast({ title: '订单已取消', icon: 'success' })
              this.loadOrders()
              this.loadStatistics()
            }
          }).catch(err => {
            console.error('取消订单失败', err)
            wx.showToast({ title: '取消失败', icon: 'none' })
          })
        }
      }
    })
  },

  // 支付订单
  onPayOrder(e) {
    const orderId = e.currentTarget.dataset.orderId
    wx.navigateTo({
      url: `/pages/payment/payment?orderId=${orderId}`
    })
  },

  // 催单
  onRemindOrder(e) {
    const orderId = e.currentTarget.dataset.orderId
    app.authRequest({
      url: `/order/${orderId}/remind`,
      method: 'PUT'
    }).then(res => {
      if (res && res.code === 200) {
        wx.showToast({ title: '已提醒商家', icon: 'success' })
      }
    }).catch(err => {
      console.error('催单失败', err)
      wx.showToast({ title: '催单失败', icon: 'none' })
    })
  },

  // 查看配送
  onTrackOrder(e) {
    const orderId = e.currentTarget.dataset.orderId
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?orderId=${orderId}&tab=track`
    })
  },

  // 确认收货
  onConfirmReceive(e) {
    const orderId = e.currentTarget.dataset.orderId
    wx.showModal({
      title: '确认收货',
      content: '确认已收到商品？',
      success: (res) => {
        if (res.confirm) {
          app.authRequest({
            url: `/order/${orderId}/complete`,
            method: 'PUT'
          }).then(res => {
            if (res && res.code === 200) {
              wx.showToast({ title: '确认收货成功', icon: 'success' })
              this.loadOrders()
              this.loadStatistics()
            }
          }).catch(err => {
            console.error('确认收货失败', err)
            wx.showToast({ title: '操作失败', icon: 'none' })
          })
        }
      }
    })
  },

  // 评价订单
  onReviewOrder(e) {
    const orderId = e.currentTarget.dataset.orderId
    wx.navigateTo({
      url: `/pages/review/review?orderId=${orderId}`
    })
  },

  // 再来一单
  onOrderAgain(e) {
    const orderId = e.currentTarget.dataset.orderId
    // 找到对应的订单
    const order = this.data.orders.find(o => o.orderId === orderId)
    if (order) {
      // 获取商家ID并跳转到商家页面
      app.authRequest({
        url: `/order/${orderId}`,
        method: 'GET'
      }).then(res => {
        if (res && res.code === 200 && res.data) {
          const storeId = res.data.storeId
          wx.navigateTo({
            url: `/pages/store-detail/store-detail?storeId=${storeId}`
          })
        }
      }).catch(err => {
        console.error('获取订单详情失败', err)
        wx.showToast({ title: '操作失败', icon: 'none' })
      })
    }
  },

  // 去购物
  onGoShopping() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
