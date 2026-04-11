/**
 * 订单相关API接口
 */
var requestHelper = require('./request');
var api = requestHelper.api;
var showLoading = requestHelper.showLoading;
var hideLoading = requestHelper.hideLoading;

/**
 * 获取用户订单列表
 * @param {number} userId - 用户ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
function getOrderList(userId, params) {
  showLoading('加载中...');
  return api.get('/order/user/' + userId, params || {})
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
 * 获取订单详情
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
function getOrderDetail(orderId) {
  showLoading('加载中...');
  return api.get('/order/' + orderId)
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
 * 创建订单
 * @param {Object} data - 订单数据 { storeId, deliveryFee, address, phone, remark, cartIds }
 * @returns {Promise}
 */
function createOrder(data) {
  showLoading('创建中...');
  return api.post('/order', data)
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
 * 取消订单
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
function cancelOrder(orderId) {
  showLoading('处理中...');
  return api.put('/order/' + orderId + '/cancel')
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
 * 确认收货
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
function confirmOrder(orderId) {
  showLoading('处理中...');
  return api.put('/order/' + orderId + '/complete')
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
 * 支付订单
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
function payOrder(orderId) {
  showLoading('支付中...');
  return api.put('/order/' + orderId + '/pay')
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
 * 催单
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
function remindOrder(orderId) {
  showLoading('处理中...');
  return api.put('/order/' + orderId + '/remind')
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
 * 获取订单统计数据
 * @returns {Promise}
 */
function getOrderStats() {
  return api.get('/order/statistics');
}

/**
 * 获取指定状态的订单列表
 * @param {string} status - 订单状态
 * @param {Object} params - 其他查询参数
 * @returns {Promise}
 */
function getOrdersByStatus(status, params) {
  showLoading('加载中...');
  return api.get('/order/status/' + status, params || {})
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
 * 获取骑手信息
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
function getRiderInfo(orderId) {
  return api.get('/order/' + orderId + '/rider');
}

/**
 * 获取配送追踪信息
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
function getTrackingInfo(orderId) {
  return api.get('/order/' + orderId + '/tracking');
}

/**
 * 更新订单状态
 * @param {number} orderId - 订单ID
 * @param {string} status - 新状态
 * @returns {Promise}
 */
function updateOrderStatus(orderId, status) {
  return api.put('/order/' + orderId + '/status', { status: status });
}

/**
 * 删除订单
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
function deleteOrder(orderId) {
  showLoading('删除中...');
  return api.delete('/order/' + orderId)
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
  getOrderList,
  getOrderDetail,
  createOrder,
  cancelOrder,
  confirmOrder,
  payOrder,
  remindOrder,
  getOrderStats,
  getOrdersByStatus,
  getRiderInfo,
  getTrackingInfo,
  updateOrderStatus,
  deleteOrder
};
