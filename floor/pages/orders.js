// 订单管理页面逻辑
Page({
  data: {
    activeTab: 'all',
    orders: [],
    statusTabs: [],
    isLoading: true,
    hasMore: true,
    currentPage: 1,
    pageSize: 10
  },

  onLoad(options) {
    console.log('订单页面加载，参数：', options);
    const initialStatus = options.status || 'all';
    this.setData({ activeTab: initialStatus });
    this.loadStatusTabs();
    this.loadOrders();
  },

  onBackClick() {
    wx.navigateBack({ delta: 1 });
  },

  onTabChange(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ activeTab: status, currentPage: 1, orders: [] });
    this.loadOrders();
  },

  loadStatusTabs() {
    const orderStats = { pending: 2, preparing: 1, delivering: 3, completed: 17 };
    const tabs = [
      { status: 'all', name: '全部', count: 23 },
      { status: 'pending', name: '待付款', count: orderStats.pending },
      { status: 'preparing', name: '制作中', count: orderStats.preparing },
      { status: 'delivering', name: '配送中', count: orderStats.delivering },
      { status: 'completed', name: '已完成', count: orderStats.completed }
    ];
    this.setData({ statusTabs: tabs });
  },

  loadOrders() {
    wx.showLoading({ title: '加载中...' });
    setTimeout(() => {
      const mockOrders = this.getMockOrders();
      const filteredOrders = this.filterOrdersByStatus(mockOrders);
      this.setData({ orders: filteredOrders, isLoading: false, hasMore: false });
      wx.hideLoading();
    }, 1000);
  },

  filterOrdersByStatus(allOrders) {
    const { activeTab } = this.data;
    if (activeTab === 'all') return allOrders;
    return allOrders.filter(order => order.status === activeTab);
  },

  getMockOrders() {
    return [
      {
        orderId: '202401150001',
        storeName: '川味人家',
        status: 'pending',
        statusText: '待付款',
        orderTime: '2024-01-15 12:30',
        finalAmount: 89.00,
        items: [{ foodId: 1, name: '经典牛肉面', price: 28.00, quantity: 2, image: '' }]
      },
      {
        orderId: '202401150002',
        storeName: '披萨大师',
        status: 'preparing',
        statusText: '制作中',
        orderTime: '2024-01-15 11:20',
        finalAmount: 125.00,
        items: [{ foodId: 4, name: '芝士培根披萨', price: 68.00, quantity: 1, image: '' }]
      }
    ];
  },

  onOrderDetail(e) {
    const orderId = e.currentTarget.dataset.orderId;
    wx.showToast({ title: '订单详情开发中', icon: 'none' });
  },

  onGoShopping() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  onPullDownRefresh() {
    this.setData({ currentPage: 1 });
    this.loadOrders();
    setTimeout(() => wx.stopPullDownRefresh(), 1000);
  }
});