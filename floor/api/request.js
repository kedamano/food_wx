/**
 * API请求封装模块
 * 基于微信小程序wx.request封装，支持Promise和async/await
 */

const CONFIG = {
  // 后端API基础URL，实际使用时替换为真实地址
  baseURL: 'https://api.example.com',
  // 请求超时时间
  timeout: 10000,
  // 默认请求头
  header: {
    'Content-Type': 'application/json',
  },
};

/**
 * 请求拦截器
 */
const requestInterceptors = {
  onFulfilled: (config) => {
    // 添加token到请求头
    const token = wx.getStorageSync('token');
    if (token) {
      config.header.Authorization = `Bearer ${token}`;
    }

    // 添加时间戳防止缓存
    if (config.method === 'GET') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  onRejected: (error) => {
    return Promise.reject(error);
  },
};

/**
 * 响应拦截器
 */
const responseInterceptors = {
  onFulfilled: (response) => {
    const { statusCode, data } = response;

    // 根据状态码处理响应
    if (statusCode >= 200 && statusCode < 300) {
      // 业务成功处理：支持 code === 0、code === 200 或 success === true
      if (data.code === 0 || data.code === 200 || data.success) {
        // 返回完整的数据结构，包含 code、message、data
        return data;
      } else {
        // 业务错误
        return Promise.reject({
          message: data.message || '请求失败',
          code: data.code,
          response,
        });
      }
    } else if (statusCode === 401) {
      // 未授权，清除 token 并跳转登录
      wx.clearStorageSync();
      wx.navigateTo({
        url: '/pages/login/login',
      });
      return Promise.reject({
        message: '登录已过期，请重新登录',
        code: 401,
        response,
      });
    } else {
      // HTTP 错误
      return Promise.reject({
        message: `HTTP 错误：${statusCode}`,
        code: statusCode,
        response,
      });
    }
  },
  onRejected: (error) => {
    return Promise.reject(error);
  },
};

/**
 * 基础请求函数
 */
function request(options) {
  // 应用请求拦截器
  let config = { ...options };
  config = requestInterceptors.onFulfilled(config);

  return new Promise((resolve, reject) => {
    wx.request({
      url: config.url?.startsWith('http') ? config.url : CONFIG.baseURL + config.url,
      method: config.method || 'GET',
      data: config.data,
      header: {
        ...CONFIG.header,
        ...config.header,
      },
      timeout: config.timeout || CONFIG.timeout,
      success: (response) => {
        try {
          const result = responseInterceptors.onFulfilled(response);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        const rejectedError = responseInterceptors.onRejected(error);
        reject(rejectedError);
      },
    });
  });
}

/**
 * HTTP方法快捷函数
 */
const api = {
  get(url, params = {}) {
    return request({
      url,
      method: 'GET',
      data: params,
    });
  },

  post(url, data = {}) {
    return request({
      url,
      method: 'POST',
      data,
    });
  },

  put(url, data = {}) {
    return request({
      url,
      method: 'PUT',
      data,
    });
  },

  delete(url, data = {}) {
    return request({
      url,
      method: 'DELETE',
      data,
    });
  },

  upload(url, filePath, formData = {}) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: CONFIG.baseURL + url,
        filePath,
        name: 'file',
        formData,
        header: {
          ...CONFIG.header,
          Authorization: `Bearer ${wx.getStorageSync('token')}`,
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            const response = { ...res, data };
            const result = responseInterceptors.onFulfilled(response);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        fail: (error) => {
          reject(error);
        },
      });
    });
  },
};

/**
 * 显示加载提示
 */
function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true,
  });
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示错误提示
 */
function showError(message, duration = 2000) {
  wx.showToast({
    title: message,
    icon: 'none',
    duration,
  });
}

/**
 * 显示成功提示
 */
function showSuccess(message, duration = 1500) {
  wx.showToast({
    title: message,
    icon: 'success',
    duration,
  });
}

module.exports = {
  CONFIG,
  api,
  request,
  showLoading,
  hideLoading,
  showError,
  showSuccess,
  requestInterceptors,
  responseInterceptors,
};