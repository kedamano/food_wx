// API 接口配置文件
module.exports = {
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

  currentEnv: 'development',

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
    },
    address: {
      list: '/address/list',
      detail: '/address/:id',
      default: '/address/default',
      add: '/address/add',
      update: '/address/update',
      delete: '/address/delete/:id',
      setDefault: '/address/set-default/:id'
    }
  },

  getApiUrl: function(endpoint, params) {
    params = params || {};
    var env = this.environments[this.currentEnv];
    var url = env.baseURL + endpoint;
    var keys = Object.keys(params);
    for (var i = 0; i < keys.length; i++) {
      url = url.replace(':' + keys[i], params[keys[i]]);
    }
    return url;
  },

  getTimeout: function() {
    return this.environments[this.currentEnv].timeout;
  }
};

// 地址相关API URL（快捷访问）
module.exports.ADDRESS_LIST = module.exports.endpoints.address.list;
module.exports.ADDRESS_DETAIL = module.exports.endpoints.address.detail;
module.exports.ADDRESS_DEFAULT = module.exports.endpoints.address.default;
module.exports.ADDRESS_ADD = module.exports.endpoints.address.add;
module.exports.ADDRESS_UPDATE = module.exports.endpoints.address.update;
module.exports.ADDRESS_DELETE = module.exports.endpoints.address.delete;
module.exports.ADDRESS_SET_DEFAULT = module.exports.endpoints.address.setDefault;
