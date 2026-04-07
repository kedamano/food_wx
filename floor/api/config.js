// API 接口配置文件
module.exports = {
  // 环境配置
  environments: {
    development: {
      baseURL: 'http://localhost:8080/api',
      timeout: 10000
    },
    production: {
      baseURL: 'https://your-api-domain.com/api',
      timeout: 15000
    }
  },
  
  // 当前环境（小程序环境）
  currentEnv: 'development',
  
  // API 接口定义
  endpoints: {
    food: {
      detail: '/food/:id',
      reviews: '/review/food/:id',
      all: '/food/all',
      recommend: '/food/recommend',
      banners: '/food/banners',
      categories: '/food/categories'
    },
    review: {
      add: '/review',
      byFood: '/review/food/:foodId',
      byUser: '/review/user/:userId',
      byOrder: '/review/order/:orderId'
    },
    cart: {
      get: '/cart/user/:userId',
      add: '/cart',
      update: '/cart',
      delete: '/cart/:id'
    },
    order: {
      create: '/order',
      detail: '/order/:id',
      list: '/order/user/:userId'
    },
    user: {
      info: '/user/info',
      login: '/user/login',
      logout: '/user/logout'
    },
    store: {
      nearby: '/store/nearby',
      detail: '/store/:id'
    }
  },
  
  // 获取完整 API 地址
  getApiUrl(endpoint, params = {}) {
    const env = this.environments[this.currentEnv];
    let url = env.baseURL + endpoint;
    
    // 替换路径参数
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
    
    return url;
  },
  
  // 获取超时时间
  getTimeout() {
    return this.environments[this.currentEnv].timeout;
  }
};