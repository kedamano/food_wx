/**
 * API请求封装模块
 * 基于微信小程序wx.request封装，支持Promise
 */

var CONFIG = {
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  header: {
    'Content-Type': 'application/json',
  }
};

/**
 * 请求拦截器
 */
var requestInterceptors = {
  onFulfilled: function(config) {
    // 确保 header 对象存在（不能直接引用 CONFIG.header，否则会污染全局配置）
    if (!config.header) {
      config.header = {
        'Content-Type': 'application/json'
      };
    }
    var token = wx.getStorageSync('token');
    if (token) {
      config.header.Authorization = 'Bearer ' + token;
    }
    if (config.method === 'GET') {
      config.params = config.params || {};
      config.params._t = Date.now();
    }
    return config;
  },
  onRejected: function(error) {
    return Promise.reject(error);
  }
};

/**
 * 响应拦截器
 */
var responseInterceptors = {
  onFulfilled: function(response) {
    var statusCode = response.statusCode;
    var data = response.data;

    if (statusCode >= 200 && statusCode < 300) {
      if (!data) {
        return Promise.reject({
          message: '响应数据为空',
          code: statusCode,
          response: response
        });
      }
      if (data.code === 0 || data.code === 200 || data.success) {
        return data;
      } else {
        return Promise.reject({
          message: data.message || '请求失败',
          code: data.code,
          response: response
        });
      }
    } else if (statusCode === 401) {
      wx.clearStorageSync();
      wx.navigateTo({ url: '/pages/login/login' });
      return Promise.reject({
        message: '登录已过期，请重新登录',
        code: 401,
        response: response
      });
    } else {
      return Promise.reject({
        message: 'HTTP 错误：' + statusCode,
        code: statusCode,
        response: response
      });
    }
  },
  onRejected: function(error) {
    return Promise.reject(error);
  }
};

/**
 * 基础请求函数
 */
function request(options) {
  var config = {};
  for (var key in options) {
    config[key] = options[key];
  }
  config = requestInterceptors.onFulfilled(config);

  return new Promise(function(resolve, reject) {
    var requestUrl = (config.url && config.url.indexOf('http') === 0) ? config.url : CONFIG.baseURL + config.url;

    var mergedHeader = {};
    var key;
    for (key in CONFIG.header) mergedHeader[key] = CONFIG.header[key];
    if (config.header) {
      for (key in config.header) mergedHeader[key] = config.header[key];
    }

    wx.request({
      url: requestUrl,
      method: config.method || 'GET',
      data: config.data,
      header: mergedHeader,
      timeout: config.timeout || CONFIG.timeout,
      success: function(response) {
        try {
          var result = responseInterceptors.onFulfilled(response);
          if (result && typeof result.then === 'function') {
            result.then(function(data) { resolve(data); }).catch(function(err) { reject(err); });
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      },
      fail: function(error) {
        var rejectedError = responseInterceptors.onRejected(error);
        reject(rejectedError);
      }
    });
  });
}

/**
 * HTTP方法快捷函数
 */
var api = {
  get: function(url, params) {
    params = params || {};
    return request({ url: url, method: 'GET', data: params });
  },
  post: function(url, data) {
    data = data || {};
    return request({ url: url, method: 'POST', data: data });
  },
  put: function(url, data) {
    data = data || {};
    return request({ url: url, method: 'PUT', data: data });
  },
  delete: function(url, data) {
    data = data || {};
    return request({ url: url, method: 'DELETE', data: data });
  },
  upload: function(url, filePath, formData) {
    formData = formData || {};
    return new Promise(function(resolve, reject) {
      var uploadHeader = {};
      for (var hk in CONFIG.header) uploadHeader[hk] = CONFIG.header[hk];
      uploadHeader.Authorization = 'Bearer ' + wx.getStorageSync('token');

      wx.uploadFile({
        url: CONFIG.baseURL + url,
        filePath: filePath,
        name: 'file',
        formData: formData,
        header: uploadHeader,
        success: function(res) {
          try {
            var data = JSON.parse(res.data);
            var response = {};
            for (var key in res) response[key] = res[key];
            response.data = data;
            var result = responseInterceptors.onFulfilled(response);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        fail: function(error) {
          reject(error);
        }
      });
    });
  }
};

function showLoading(title) {
  wx.showLoading({ title: title || '加载中...', mask: true });
}

function hideLoading() {
  wx.hideLoading();
}

function showError(message, duration) {
  wx.showToast({ title: message, icon: 'none', duration: duration || 2000 });
}

function showSuccess(message, duration) {
  wx.showToast({ title: message, icon: 'success', duration: duration || 1500 });
}

module.exports = {
  CONFIG: CONFIG,
  api: api,
  request: request,
  showLoading: showLoading,
  hideLoading: hideLoading,
  showError: showError,
  showSuccess: showSuccess,
  requestInterceptors: requestInterceptors,
  responseInterceptors: responseInterceptors
};
