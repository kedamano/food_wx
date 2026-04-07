/**
 * 评价相关API接口
 */
const { api, showLoading, hideLoading } = require('./request');
const mockData = require('../../mock/mockData');

/**
 * 获取用户评价列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
function getUserReviews(params = {}) {
  showLoading('加载中...');

  // 开发模式使用模拟数据
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return new Promise((resolve) => {
      setTimeout(() => {
        hideLoading();
        
        const { page = 1, pageSize = 10 } = params;
        const reviews = [...mockData.reviews.userReviews];
        
        // 分页处理
        const start = (page - 1) * pageSize;
        const end = start + parseInt(pageSize);
        const pagedReviews = reviews.slice(start, end);

        resolve({
          list: pagedReviews,
          total: reviews.length,
          page,
          pageSize,
        });
      }, 300);
    });
  }

  return api.get('/reviews/user', params)
    .finally(() => {
      hideLoading();
    });
}

/**
 * 获取商家评价列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
function getStoreReviews(params = {}) {
  showLoading('加载中...');

  // 开发模式使用模拟数据
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return new Promise((resolve) => {
      setTimeout(() => {
        hideLoading();
        
        const { storeId, page = 1, pageSize = 10 } = params;
        let reviews = [...mockData.reviews.storeReviews];
        
        // 按商家筛选
        if (storeId) {
          reviews = reviews.filter(review => 
            mockData.stores.list.find(store => 
              store.id === parseInt(storeId)
            )
          );
        }
        
        // 分页处理
        const start = (page - 1) * pageSize;
        const end = start + parseInt(pageSize);
        const pagedReviews = reviews.slice(start, end);

        resolve({
          list: pagedReviews,
          total: reviews.length,
          page,
          pageSize,
        });
      }, 300);
    });
  }

  return api.get('/reviews/store', params)
    .finally(() => {
      hideLoading();
    });
}

/**
 * 创建评价
 * @param {Object} data - 评价数据
 * @returns {Promise}
 */
function createReview(data) {
  showLoading('提交中...');

  // 开发模式使用模拟数据
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return new Promise((resolve) => {
      setTimeout(() => {
        hideLoading();
        
        const newReview = {
          id: Date.now(),
          userId: 1,
          userName: '美食爱好者',
          userAvatar: '',
          orderId: data.orderId,
          foodName: data.foodName,
          rating: data.rating,
          content: data.content,
          images: data.images || [],
          createTime: new Date().toISOString(),
          isAnonymous: data.isAnonymous || false,
          reply: null,
          ...data,
        };
        
        resolve(newReview);
      }, 1000);
    });
  }

  return api.post('/reviews', data)
    .finally(() => {
      hideLoading();
    });
}

/**
 * 回复评价
 * @param {string} reviewId - 评价ID
 * @param {Object} data - 回复数据
 * @returns {Promise}
 */
function replyReview(reviewId, data) {
  showLoading('回复中...');

  // 开发模式使用模拟数据
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return new Promise((resolve) => {
      setTimeout(() => {
        hideLoading();
        resolve({ success: true, message: '回复成功' });
      }, 500);
    });
  }

  return api.post(`/reviews/${reviewId}/reply`, data)
    .finally(() => {
      hideLoading();
    });
}

/**
 * 删除评价
 * @param {string} reviewId - 评价ID
 * @returns {Promise}
 */
function deleteReview(reviewId) {
  showLoading('删除中...');

  // 开发模式使用模拟数据
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return new Promise((resolve) => {
      setTimeout(() => {
        hideLoading();
        resolve({ success: true, message: '删除成功' });
      }, 500);
    });
  }

  return api.delete(`/reviews/${reviewId}`)
    .finally(() => {
      hideLoading();
    });
}

module.exports = {
  getUserReviews,
  getStoreReviews,
  createReview,
  replyReview,
  deleteReview,
};