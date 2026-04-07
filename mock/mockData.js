/**
 * 模拟后端接口数据
 * 用于开发和测试，当后端接口未准备好时使用
 */

const mockData = {
  // 用户相关模拟数据
  user: {
    // 用户信息
    info: {
      id: 1,
      name: '美食爱好者',
      level: '黄金会员',
      points: 1280,
      avatar: '',
      phone: '13800138000',
      email: 'user@example.com',
      createTime: '2024-01-01T00:00:00Z',
    },

    // 用户统计数据
    stats: {
      totalOrders: 23,
      favoriteStores: 12,
      totalSpending: 1580.50,
      couponCount: 5,
      reviewCount: 18,
      addressCount: 3,
    },

    // 订单统计
    orderStats: {
      pending: 2,      // 待付款
      preparing: 1,    // 制作中
      delivering: 3,   // 配送中
      completed: 17,   // 已完成
    },
  },

  // 订单相关模拟数据
  orders: {
    // 订单列表
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

    // 订单详情
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

  // 商家相关模拟数据
  stores: {
    // 商家列表
    list: [
      {
        id: 1,
        name: '川味小馆',
        image: '/images/foods/sichuan_cuisine.png',
        rating: 4.5,
        sales: 1234,
        deliveryTime: 30,
        deliveryFee: 3.5,
        minOrder: 20,
        tags: ['川菜', '麻辣', '快餐'],
        distance: '1.2km',
        isFavorite: true,
      },
      {
        id: 2,
        name: '炸鸡汉堡店',
        image: '/images/foods/chicken_wings.png',
        rating: 4.2,
        sales: 856,
        deliveryTime: 25,
        deliveryFee: 2.5,
        minOrder: 15,
        tags: ['快餐', '炸鸡', '汉堡'],
        distance: '0.8km',
        isFavorite: false,
      },
      {
        id: 3,
        name: '轻食餐厅',
        image: '/images/foods/salad.png',
        rating: 4.8,
        sales: 423,
        deliveryTime: 35,
        deliveryFee: 4.0,
        minOrder: 25,
        tags: ['健康', '沙拉', '轻食'],
        distance: '2.1km',
        isFavorite: true,
      },
    ],
  },

  // 商品相关模拟数据
  foods: {
    // 商品列表
    list: [
      {
        id: 1,
        name: '经典牛肉面',
        price: 28.50,
        originalPrice: 32.50,
        image: '/images/foods/beef_noodles.png',
        description: '正宗川味，麻辣鲜香，选用优质牛肉',
        category: '主食',
        sales: 567,
        rating: 4.6,
        stock: 100,
        specs: [
          { name: '份量', values: ['小份', '中份', '大份'] },
          { name: '辣度', values: ['微辣', '中辣', '重辣'] },
        ],
        attrs: [
          { name: '加香菜', price: 1 },
          { name: '加辣椒', price: 1 },
          { name: '加蒜', price: 1 },
        ],
      },
      {
        id: 2,
        name: '香辣鸡翅',
        price: 22.00,
        originalPrice: 25.00,
        image: '/images/foods/chicken_wings.png',
        description: '外酥里嫩，香辣可口',
        category: '小吃',
        sales: 892,
        rating: 4.7,
        stock: 50,
        specs: [
          { name: '数量', values: ['2个', '4个', '6个'] },
        ],
        attrs: [],
      },
    ],
  },

  // 评价相关模拟数据
  reviews: {
    // 用户评价列表
    userReviews: [
      {
        id: 1,
        orderId: 1001,
        storeId: 1,
        storeName: '川味小馆',
        storeImage: '/images/foods/sichuan_cuisine.png',
        foodName: '经典牛肉面',
        rating: 5,
        content: '味道很棒，牛肉很嫩，汤很香！',
        images: ['/images/review_1.png'],
        createTime: '2024-01-01T12:00:00Z',
        isAnonymous: false,
      },
      {
        id: 2,
        orderId: 1002,
        storeId: 2,
        storeName: '炸鸡汉堡店',
        storeImage: '/images/foods/chicken_wings.png',
        foodName: '香辣鸡翅',
        rating: 4,
        content: '鸡翅外酥里嫩，味道不错，就是有点咸',
        images: [],
        createTime: '2024-01-02T13:30:00Z',
        isAnonymous: true,
      },
    ],

    // 商家评价列表
    storeReviews: [
      {
        id: 1,
        userId: 1,
        userName: '美食爱好者',
        userAvatar: '',
        orderId: 1001,
        foodName: '经典牛肉面',
        rating: 5,
        content: '味道很棒，牛肉很嫩，汤很香！',
        images: ['/images/review_1.png'],
        createTime: '2024-01-01T12:00:00Z',
        isAnonymous: false,
        reply: '感谢您的评价，欢迎再次光临！',
      },
      {
        id: 2,
        userId: 2,
        userName: '匿名用户',
        userAvatar: '',
        orderId: 1002,
        foodName: '香辣鸡翅',
        rating: 4,
        content: '鸡翅外酥里嫩，味道不错，就是有点咸',
        images: [],
        createTime: '2024-01-02T13:30:00Z',
        isAnonymous: true,
        reply: null,
      },
    ],
  },

  // 优惠券相关模拟数据
  coupons: {
    // 可用优惠券
    available: [
      {
        id: 1,
        name: '新用户专享券',
        amount: 10,
        minAmount: 30,
        expireDate: '2024-12-31',
        status: 'available',
        description: '新用户首次下单可用',
      },
      {
        id: 2,
        name: '满减券',
        amount: 5,
        minAmount: 50,
        expireDate: '2024-06-30',
        status: 'available',
        description: '满50元可用',
      },
      {
        id: 3,
        name: '会员专享券',
        amount: 8,
        minAmount: 40,
        expireDate: '2024-03-31',
        status: 'available',
        description: '黄金会员专享',
      },
    ],

    // 已使用优惠券
    used: [
      {
        id: 4,
        name: '春节特惠券',
        amount: 20,
        minAmount: 100,
        usedDate: '2024-02-10',
        status: 'used',
        orderNo: 'ORD202402100001',
      },
    ],

    // 过期优惠券
    expired: [
      {
        id: 5,
        name: '店庆优惠券',
        amount: 15,
        minAmount: 80,
        expireDate: '2024-01-31',
        status: 'expired',
      },
    ],
  },
};

module.exports = mockData;