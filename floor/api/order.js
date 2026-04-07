/**
 * 订单相关API接口
 */
const { api, showLoading, hideLoading } = require('./request');

// 模拟数据
const mockData = {
  user: {
    orderStats: {
      pending: 2,
      preparing: 1,
      delivering: 3,
      completed: 17,
    },
  },
  orders: {
    list: [
      {
        id: 1001,
        orderNo: 'ORD202401010001',
        status: 'pending',
        statusText: '待付款',
        totalAmount: 68.50,
        items: [
          {
            id: 1,
            name: '经典牛肉面',
            price: 28.50,
            quantity: 2,
            image: '/images/foods/beef_noodles.png',
          },
          {
            id: 2,
            name: '可乐',
            price: 5.50,
            quantity: 3,
            image: '/images/foods/cola.png',
          },
        ],
        store: {
          id: 1,
          name: '川味小馆',
          image: '/images/foods/sichuan_cuisine.png',
        },
        createTime: '2024-01-01T10:30:00Z',
        address: '北京市朝阳区xxx街道xxx号',
      },
      {
        id: 1002,
        orderNo: 'ORD202401010002',
        status: 'preparing',
        statusText: '制作中',
        totalAmount: 45.00,
        items: [
          {
            id: 3,
            name: '香辣鸡翅',
            price: 22.00,
            quantity: 2,
            image: '/images/foods/chicken_wings.png',
          },
        ],
        store: {
          id: 2,
          name: '炸鸡汉堡店',
          image: '/images/foods/chicken_wings.png',
        },
        createTime: '2024-01-01T11:00:00Z',
        address: '北京市朝阳区xxx街道xxx号',
      },
      {
        id: 1003,
        orderNo: 'ORD202401010003',
        status: 'delivering',
        statusText: '配送中',
        totalAmount: 89.90,
        items: [
          {
            id: 4,
            name: '沙拉轻食',
            price: 35.90,
            quantity: 1,
            image: '/images/foods/salad.png',
          },
          {
            id: 5,
            name: '冰淇淋',
            price: 12.00,
            quantity: 2,
            image: '/images/foods/ice_cream.png',
          },
        ],
        store: {
          id: 3,
          name: '轻食餐厅',
          image: '/images/foods/salad.png',
        },
        createTime: '2024-01-01T09:15:00Z',
        address: '北京市朝阳区xxx街道xxx号',
        rider: {
          id: 1,
          name: '骑手小王',
          avatar: '/images/foods/rider_avatar.png',
          phone: '13900139000',
        },
      },
    ],

    detail: {
      id: 1001,
      orderNo: 'ORD202401010001',
      status: 'pending',
      statusText: '待付款',
      totalAmount: 68.50,
      items: [
        {
          id: 1,
          name: '经典牛肉面',
          price: 28.50,
          quantity: 2,
          image: '/images/foods/beef_noodles.png',
          description: '正宗川味，麻辣鲜香',
        },
        {
          id: 2,
          name: '可乐',
          price: 5.50,
          quantity: 3,
          image: '/images/foods/cola.png',
          description: '冰镇可乐，清爽解腻',
        },
      ],
      store: {
        id: 1,
        name: '川味小馆',
        image: '/images/foods/sichuan_cuisine.png',
        phone: '010-12345678',
        address: '北京市朝阳区xxx街道xxx号',
        rating: 4.5,
      },
      createTime: '2024-01-01T10:30:00Z',
      payTime: null,
      deliveryTime: null,
      finishTime: null,
      address: {
        name: '张三',
        phone: '13800138000',
        detail: '北京市朝阳区xxx街道xxx号',
        landmark: '附近地标',
      },
      remark: '不要香菜，多放辣椒',
      coupon: {
        id: 1,
        name: '新用户专享券',
        amount: 10,
      },
    },
  },
};

/**
 * 获取用户订单列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
function getOrderList(params = {}) {
  showLoading('加载中...');

  // 开发模式使用模拟数据
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return new Promise((resolve) => {
      setTimeout(() => {
        hideLoading();
        
        const { status, page = 1, pageSize = 10 } = params;
        let filteredOrders = [...mockData.orders.list];

        // 按状态筛选
        if (status && status !== 'all') {
          filteredOrders = filteredOrders.filter(order => order.status === status);
        }

        // 分页处理
        const start = (page - 1) * pageSize;
        const end = start + parseInt(pageSize);
        const pagedOrders = filteredOrders.slice(start, end);

        resolve({
          list: pagedOrders,
          total: filteredOrders.length,
          page,
          pageSize,
        });
      }, 500);
    });
  }

  return api.get('/orders', params)
    .finally(() => {
      hideLoading();
    });
}

/**
 * 获取订单详情
 * @param {string} orderId - 订单ID
 * @returns {Promise}
 */
function getOrderDetail(orderId) {
  showLoading('加载中...');

  // 开发模式使用模拟数据
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return new Promise((resolve) => {
      setTimeout(() => {
        hideLoading();
        
        // 查找对应的订单详情
        const order = mockData.orders.detail.id === parseInt(orderId) 
          ? mockData.orders.detail 
          : mockData.orders.list.find(o => o.id === parseInt(orderId)) || mockData.orders.detail;
        
        resolve(order);
      }, 300);
    });
  }

  return api.get(`/orders/${orderId}`)
    .finally(() => {
      hideLoading();
    });
}

/**
 * 创建订单
 * @param {Object} data - 订单数据
 * @returns {Promise}
 */
function createOrder(data) {
  showLoading('创建中...');

  // 开发模式使用模拟数据
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return new Promise((resolve) => {
      setTimeout(() => {
        hideLoading();
        
        const newOrder = {
          id: Date.now(),
          orderNo: 'ORD' + Date.now(),
          status: 'pending',
          statusText: '待付款',
          totalAmount: data.totalAmount || 0,
          items: data.items || [],
          store: data.store || {},
          createTime: new Date().toISOString(),
          address: data.address || '',
          ...data,
        };
        
        resolve(newOrder);
      }, 1000);
    });
  }

  return api.post('/orders', data)
    .finally(() => {
      hideLoading();
    });
}

/**
 * 取消订单
 * @param {string} orderId - 订单ID
 * @returns {Promise}
 */
function cancelOrder(orderId) {
  showLoading('处理中...');

  // 开发模式使用模拟数据
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return new Promise((resolve) => {
      setTimeout(() => {
        hideLoading();
        resolve({ success: true, message: '订单已取消' });
      }, 500);
    });
  }

  return api.post(`/orders/${orderId}/cancel`)
    .finally(() => {
      hideLoading();
    });
}

/**
 * 确认收货
 * @param {string} orderId - 订单ID
 * @returns {Promise}
 */
function confirmOrder(orderId) {
  showLoading('处理中...');

  // 开发模式使用模拟数据
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return new Promise((resolve) => {
      setTimeout(() => {
        hideLoading();
        resolve({ success: true, message: '确认收货成功' });
      }, 500);
    });
  }

  return api.post(`/orders/${orderId}/confirm`)
    .finally(() => {
      hideLoading();
    });
}

/**
 * 获取订单统计数据
 * @returns {Promise}
 */
function getOrderStats() {
  // 小程序环境直接使用模拟数据（开发阶段）
  return Promise.resolve(mockData.user.orderStats);
}

/**
 * 获取订单状态列表
 * @param {string} status - 订单状态
 * @param {Object} params - 其他查询参数
 * @returns {Promise}
 */
function getOrdersByStatus(status, params = {}) {
  showLoading('加载中...');
  return api.get(`/orders/status/${status}`, params)
    .finally(() => {
      hideLoading();
    });
}

module.exports = {
  getOrderList,
  getOrderDetail,
  createOrder,
  cancelOrder,
  confirmOrder,
  getOrderStats,
  getOrdersByStatus,
};