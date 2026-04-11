/**
 * 评价相关API接口
 */
var requestHelper = require('./request');
var api = requestHelper.api;
var showLoading = requestHelper.showLoading;
var hideLoading = requestHelper.hideLoading;

/**
 * 获取用户评价列表
 * @param {number} userId - 用户ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
function getUserReviews(userId, params) {
  showLoading('加载中...');
  return api.get('/review/user/' + userId, params || {})
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
 * 获取菜品评价列表
 * @param {number} foodId - 菜品ID
 * @param {Object} params - 查询参数 { page, limit }
 * @returns {Promise}
 */
function getFoodReviews(foodId, params) {
  showLoading('加载中...');
  return api.get('/review/food/' + foodId, params || {})
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
 * 获取菜品评分信息
 * @param {number} foodId - 菜品ID
 * @returns {Promise}
 */
function getFoodRating(foodId) {
  return api.get('/review/food/' + foodId + '/rating');
}

/**
 * 获取菜品评价统计
 * @param {number} foodId - 菜品ID
 * @returns {Promise}
 */
function getReviewStatistics(foodId) {
  return api.get('/review/food/' + foodId + '/statistics');
}

/**
 * 创建评价
 * @param {Object} data - 评价数据
 * @returns {Promise}
 */
function createReview(data) {
  showLoading('提交中...');
  return api.post('/review', data)
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
 * 为订单创建评价
 * @param {number} orderId - 订单ID
 * @param {Object} data - 评价数据
 * @returns {Promise}
 */
function createReviewForOrder(orderId, data) {
  showLoading('提交中...');
  return api.post('/review/order/' + orderId, data)
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
 * 更新评价
 * @param {Object} data - 评价数据（含 reviewId）
 * @returns {Promise}
 */
function updateReview(data) {
  showLoading('更新中...');
  return api.put('/review', data)
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
 * 删除评价
 * @param {number} reviewId - 评价ID
 * @returns {Promise}
 */
function deleteReview(reviewId) {
  showLoading('删除中...');
  return api.delete('/review/' + reviewId)
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
 * 获取评价详情
 * @param {number} reviewId - 评价ID
 * @returns {Promise}
 */
function getReviewDetail(reviewId) {
  return api.get('/review/' + reviewId);
}

/**
 * 获取订单的评价
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
function getOrderReviews(orderId) {
  return api.get('/review/order/' + orderId);
}

module.exports = {
  getUserReviews,
  getFoodReviews,
  getFoodRating,
  getReviewStatistics,
  createReview,
  createReviewForOrder,
  updateReview,
  deleteReview,
  getReviewDetail,
  getOrderReviews
};
