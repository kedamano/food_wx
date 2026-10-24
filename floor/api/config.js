// API 接口配置文件
// 环境自适应：开发者工具走 localhost；真机调试走电脑局域网 IP；体验版/正式版走线上域名
// 上线前把 PRODUCTION_BASEURL 替换为真实域名，并在小程序后台配置 request 合法域名
var PRODUCTION_BASEURL = 'https://your-api-domain.com/api';

// 真机调试：改成你电脑的局域网 IP（ipconfig 查看 IPv4 地址），手机需与电脑同一 Wi-Fi
var LAN_BASEURL = 'http://192.168.1.7:8080/api';

function detectEnv() {
  try {
    var envVersion = wx.getAccountInfoSync().miniProgram.envVersion;
    // develop: 开发者工具与开发版；trial: 体验版；release: 正式版
    return (envVersion === 'trial' || envVersion === 'release') ? 'production' : 'development';
  } catch (e) {
    return 'development';
  }
}

// 开发环境下区分运行载体：开发者工具用 localhost，真机用局域网 IP
function resolveDevBaseURL() {
  try {
    var info = wx.getDeviceInfo ? wx.getDeviceInfo() : wx.getSystemInfoSync();
    if (info.platform === 'devtools') {
      return 'http://localhost:8080/api';
    }
    return LAN_BASEURL;
  } catch (e) {
    return 'http://localhost:8080/api';
  }
}

module.exports = {
  environments: {
    development: {
      baseURL: resolveDevBaseURL(),
      timeout: 10000
    },
    production: {
      baseURL: PRODUCTION_BASEURL,
      timeout: 15000
    }
  },

  currentEnv: detectEnv(),

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
