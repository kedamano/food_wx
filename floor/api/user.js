/**
 * 用户相关API接口
 */
const { api, showLoading, hideLoading } = require('./request');

// 模拟数据
const mockData = {
  user: {
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
    stats: {
      totalOrders: 23,
      favoriteStores: 12,
      totalSpending: 1580.50,
      couponCount: 5,
      reviewCount: 18,
      addressCount: 3,
    },
    orderStats: {
      pending: 2,
      preparing: 1,
      delivering: 3,
      completed: 17,
    },
  },
};

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @returns {Promise}
 */
function login(data) {
  showLoading('登录中...');
  
  // 总是使用模拟数据（微信小程序环境）
  return new Promise((resolve) => {
    setTimeout(() => {
      hideLoading();
      const authInfo = {
        token: 'mock-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        userInfo: mockData.user.info,
      };
      resolve(authInfo);
    }, 1000);
  });
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
function getUserInfo() {
  // 微信小程序环境总是使用模拟数据
  return Promise.resolve(mockData.user.info);
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息数据
 * @returns {Promise}
 */
function updateUserInfo(data) {
  showLoading('更新中...');
  
  // 开发模式使用模拟数据
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return new Promise((resolve) => {
      setTimeout(() => {
        hideLoading();
        resolve(data);
      }, 500);
    });
  }

  return api.put('/user/info', data)
    .finally(() => {
      hideLoading();
    });
}

/**
 * 获取用户统计数据
 * @returns {Promise}
 */
function getUserStats() {
  // 微信小程序环境总是使用模拟数据
  return Promise.resolve(mockData.user.stats);
}

/**
 * 获取用户订单统计
 * @returns {Promise}
 */
function getUserOrderStats() {
  // 开发模式使用模拟数据
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return Promise.resolve(mockData.user.orderStats);
  }

  return api.get('/user/order-stats');
}

/**
 * 退出登录
 * @returns {Promise}
 */
function logout() {
  // 微信小程序环境总是使用模拟数据
  return Promise.resolve({ success: true });
}

/**
 * 刷新token
 * @param {string} refreshToken - 刷新token
 * @returns {Promise}
 */
function refreshToken(refreshToken) {
  return api.post('/auth/refresh', { refreshToken });
}

/**
 * 检查登录状态
 * @returns {boolean}
 */
function checkLoginStatus() {
  const token = wx.getStorageSync('token');
  const userInfo = wx.getStorageSync('userInfo');

  // 同步到全局变量
  const app = getApp();
  app.globalData.token = token;
  app.globalData.userInfo = userInfo;

  return !!(token && userInfo);
}

/**
 * 保存登录信息
 * @param {Object} authInfo - 认证信息
 */
function saveAuthInfo(authInfo) {
  wx.setStorageSync('token', authInfo.token);
  wx.setStorageSync('refreshToken', authInfo.refreshToken);
  wx.setStorageSync('userInfo', authInfo.userInfo);

  // 同步到全局变量
  const app = getApp();
  app.globalData.token = authInfo.token;
  app.globalData.userInfo = authInfo.userInfo;
}

/**
 * 清除登录信息
 */
function clearAuthInfo() {
  wx.removeStorageSync('token');
  wx.removeStorageSync('refreshToken');
  wx.removeStorageSync('userInfo');

  // 清除全局变量
  const app = getApp();
  app.globalData.token = null;
  app.globalData.userInfo = null;
}

/**
 * 发送验证码
 * @param {string} phone - 手机号
 * @param {string} type - 验证码类型：register-注册，forget-忘记密码
 * @returns {Promise}
 */
function sendVerifyCode(phone, type = 'forget') {
  showLoading('发送中...');
  
  // 微信小程序环境直接调用真实API
  return api.post('/user/send-verify-code', { phone, type })
    .finally(() => {
      hideLoading();
    });
}

/**
 * 验证验证码
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @returns {Promise}
 */
function verifyCode(phone, code) {
  showLoading('验证中...');
  
  // 开发模式使用模拟数据
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return new Promise((resolve) => {
      setTimeout(() => {
        hideLoading();
        // 模拟验证成功（实际项目中应该根据验证码验证）
        resolve({ success: true, message: '验证码验证成功' });
      }, 500);
    });
  }

  return api.post('/user/verify-code', { phone, code })
    .finally(() => {
      hideLoading();
    });
}

/**
 * 重置密码
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @param {string} newPassword - 新密码
 * @returns {Promise}
 */
function resetPassword(phone, code, newPassword) {
  showLoading('重置中...');
  
  // 开发模式使用模拟数据
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return new Promise((resolve) => {
      setTimeout(() => {
        hideLoading();
        // 模拟重置成功
        resolve({ success: true, message: '密码重置成功' });
      }, 1000);
    });
  }

  return api.post('/user/reset-password', { phone, code, newPassword })
    .finally(() => {
      hideLoading();
    });
}

module.exports = {
  login,
  getUserInfo,
  updateUserInfo,
  getUserStats,
  getUserOrderStats,
  logout,
  refreshToken,
  checkLoginStatus,
  saveAuthInfo,
  clearAuthInfo,
  sendVerifyCode,
  verifyCode,
  resetPassword
};