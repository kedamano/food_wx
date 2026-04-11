/**
 * 用户相关API接口
 */
var requestHelper = require('./request');
var api = requestHelper.api;
var showLoading = requestHelper.showLoading;
var hideLoading = requestHelper.hideLoading;

/**
 * 用户登录
 * @param {Object} data - 登录数据 { username, password }
 * @returns {Promise}
 */
function login(data) {
  showLoading('登录中...');
  return api.post('/user/login', data)
    .then(function(res) {
      hideLoading();
      return res;
    })
    .catch(function(err) {
      hideLoading();
      return Promise.reject(err);
    });
}

/**
 * 用户注册
 * @param {Object} data - 注册数据 { username, password, phone, verifyCode }
 * @returns {Promise}
 */
function register(data) {
  showLoading('注册中...');
  return api.post('/user/register', data)
    .then(function(res) {
      hideLoading();
      return res;
    })
    .catch(function(err) {
      hideLoading();
      return Promise.reject(err);
    });
}

/**
 * 微信注册
 * @param {Object} data - 微信注册数据 { code, username, phone }
 * @returns {Promise}
 */
function wechatRegister(data) {
  showLoading('注册中...');
  return api.post('/user/wechat-register', data)
    .then(function(res) {
      hideLoading();
      return res;
    })
    .catch(function(err) {
      hideLoading();
      return Promise.reject(err);
    });
}

/**
 * 获取用户信息（根据Token）
 * @returns {Promise}
 */
function getUserInfo() {
  return api.get('/user/info');
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息数据
 * @returns {Promise}
 */
function updateUserInfo(data) {
  showLoading('更新中...');
  return api.put('/user/info', data)
    .then(function(res) {
      hideLoading();
      return res;
    })
    .catch(function(err) {
      hideLoading();
      return Promise.reject(err);
    });
}

/**
 * 获取用户统计数据（从订单统计接口获取）
 * @returns {Promise}
 */
function getUserStats() {
  return api.get('/order/statistics');
}

/**
 * 获取用户订单统计
 * @returns {Promise}
 */
function getUserOrderStats() {
  return api.get('/order/statistics');
}

/**
 * 退出登录
 * @returns {Promise}
 */
function logout() {
  // 后端无退出接口，前端清除登录态
  return Promise.resolve({ success: true });
}

/**
 * 刷新token
 * @param {string} refreshToken - 刷新token
 * @returns {Promise}
 */
function refreshToken(refreshToken) {
  return api.post('/auth/refresh', { refreshToken: refreshToken });
}

/**
 * 检查登录状态
 * @returns {boolean}
 */
function checkLoginStatus() {
  var token = wx.getStorageSync('token');
  var userInfo = wx.getStorageSync('userInfo');

  // 同步到全局变量
  var app = getApp();
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
  var app = getApp();
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
  var app = getApp();
  app.globalData.token = null;
  app.globalData.userInfo = null;
}

/**
 * 发送验证码
 * @param {string} phone - 手机号
 * @param {string} type - 验证码类型：register-注册，forget-忘记密码
 * @returns {Promise}
 */
function sendVerifyCode(phone, type) {
  showLoading('发送中...');
  return api.post('/user/send-verify-code', { phone: phone, type: type || 'forget' })
    .then(function(res) {
      hideLoading();
      return res;
    })
    .catch(function(err) {
      hideLoading();
      return Promise.reject(err);
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
  return api.post('/user/verify-code', { phone: phone, code: code })
    .then(function(res) {
      hideLoading();
      return res;
    })
    .catch(function(err) {
      hideLoading();
      return Promise.reject(err);
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
  return api.post('/user/reset-password', { phone: phone, code: code, newPassword: newPassword })
    .then(function(res) {
      hideLoading();
      return res;
    })
    .catch(function(err) {
      hideLoading();
      return Promise.reject(err);
    });
}

/**
 * 获取用户积分信息
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
function getUserPointsInfo(userId) {
  return api.get('/user/points/' + userId);
}

/**
 * 用户签到
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
function signIn(userId) {
  showLoading('签到中...');
  return api.post('/user/sign-in/' + userId)
    .then(function(res) {
      hideLoading();
      return res;
    })
    .catch(function(err) {
      hideLoading();
      return Promise.reject(err);
    });
}

module.exports = {
  login: login,
  register: register,
  wechatRegister: wechatRegister,
  getUserInfo: getUserInfo,
  updateUserInfo: updateUserInfo,
  getUserStats: getUserStats,
  getUserOrderStats: getUserOrderStats,
  logout: logout,
  refreshToken: refreshToken,
  checkLoginStatus: checkLoginStatus,
  saveAuthInfo: saveAuthInfo,
  clearAuthInfo: clearAuthInfo,
  sendVerifyCode: sendVerifyCode,
  verifyCode: verifyCode,
  resetPassword: resetPassword,
  getUserPointsInfo: getUserPointsInfo,
  signIn: signIn
};
