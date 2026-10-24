/**
 * api/request.js 单元测试
 *
 * 测试微信小程序请求封装模块的核心功能:
 * - 请求拦截器 (token 注入, 时间戳添加)
 * - 响应拦截器 (状态码处理, 401 处理)
 * - HTTP 方法快捷函数 (get, post, put, delete)
 * - Loading / Toast 辅助函数
 */
var requestModule = require('../api/request');

beforeEach(function() {
  global.__wxStorage = {};
  global.resetWxRequestMock();
  jest.clearAllMocks();
});

describe('api/request.js', function() {

  // ==================== 模块导出验证 ====================
  describe('模块导出', function() {

    it('应导出 api 对象', function() {
      expect(requestModule.api).toBeDefined();
      expect(typeof requestModule.api).toBe('object');
    });

    it('api 应包含 get/post/put/delete/upload 方法', function() {
      expect(typeof requestModule.api.get).toBe('function');
      expect(typeof requestModule.api.post).toBe('function');
      expect(typeof requestModule.api.put).toBe('function');
      expect(typeof requestModule.api.delete).toBe('function');
      expect(typeof requestModule.api.upload).toBe('function');
    });

    it('应导出 showLoading/hideLoading/showError/showSuccess 辅助函数', function() {
      expect(typeof requestModule.showLoading).toBe('function');
      expect(typeof requestModule.hideLoading).toBe('function');
      expect(typeof requestModule.showError).toBe('function');
      expect(typeof requestModule.showSuccess).toBe('function');
    });

    it('应导出基础 request 函数', function() {
      expect(typeof requestModule.request).toBe('function');
    });

    it('应导出 CONFIG 配置对象', function() {
      expect(requestModule.CONFIG).toBeDefined();
      expect(typeof requestModule.CONFIG.baseURL).toBe('string');
      expect(typeof requestModule.CONFIG.timeout).toBe('number');
    });
  });

  // ==================== 请求拦截器 ====================
  describe('请求拦截器', function() {

    it('应自动添加 Bearer token 到请求头', function() {
      wx.setStorageSync('token', 'test-token-123');

      var config = { url: '/test', method: 'GET' };
      var intercepted = requestModule.requestInterceptors.onFulfilled(config);

      expect(intercepted.header.Authorization).toBe('Bearer test-token-123');
    });

    it('无 token 时不应添加 Authorization 头', function() {
      wx.removeStorageSync('token');

      var config = { url: '/test', method: 'GET' };
      var intercepted = requestModule.requestInterceptors.onFulfilled(config);

      expect(intercepted.header.Authorization).toBeUndefined();
    });

    it('GET 请求应自动添加时间戳参数防止缓存', function() {
      var config = { url: '/test', method: 'GET' };
      var intercepted = requestModule.requestInterceptors.onFulfilled(config);

      expect(intercepted.params).toBeDefined();
      expect(typeof intercepted.params._t).toBe('number');
    });

    it('POST 请求不应添加 params (只有 GET 才需要防缓存时间戳)', function() {
      var config = { url: '/test', method: 'POST', data: { name: 'test' } };
      var intercepted = requestModule.requestInterceptors.onFulfilled(config);

      // POST 请求不会创建 params 对象，因为没有 _t 时间戳的需要
      expect(intercepted.params).toBeUndefined();
    });

  });

  // ==================== 响应拦截器 ====================
  describe('响应拦截器', function() {

    it('200 状态码且 data.code=200 的响应应同步返回数据', function() {
      var response = {
        statusCode: 200,
        data: { code: 200, data: { name: 'test' }, message: 'ok' }
      };

      var result = requestModule.responseInterceptors.onFulfilled(response);

      // code=200 时同步返回 data 对象
      expect(result.code).toBe(200);
      expect(result.data.name).toBe('test');
    });

    it('200 状态码且 data.code=0 的响应应同步返回数据', function() {
      var response = {
        statusCode: 200,
        data: { code: 0, data: {}, message: 'ok' }
      };

      var result = requestModule.responseInterceptors.onFulfilled(response);

      expect(result.code).toBe(0);
    });

    it('200 状态码且 data.success=true 的响应应同步返回数据', function() {
      var response = {
        statusCode: 200,
        data: { success: true, data: {}, message: 'ok' }
      };

      var result = requestModule.responseInterceptors.onFulfilled(response);

      expect(result.success).toBe(true);
    });

    it('200 状态码但 data.code 为错误码应返回 rejected Promise', function() {
      var response = {
        statusCode: 200,
        data: { code: 400, message: '参数错误' }
      };

      var result = requestModule.responseInterceptors.onFulfilled(response);

      // 应该返回一个 Promise（rejected）
      expect(result).toBeDefined();
      expect(typeof result.then).toBe('function');

      return result.then(function() {
        throw new Error('应该 reject 而不应该 resolve');
      }).catch(function(err) {
        expect(err.code).toBe(400);
        expect(err.message).toBe('参数错误');
      });
    });

    it('401 状态码应清除存储并返回 rejected Promise', function() {
      wx.setStorageSync('token', 'some-token');
      var response = { statusCode: 401, data: {} };

      var result = requestModule.responseInterceptors.onFulfilled(response);

      // 验证存储被清除
      expect(wx.getStorageSync('token')).toBeNull();

      return result.then(function() {
        throw new Error('应该 reject');
      }).catch(function(err) {
        expect(err.code).toBe(401);
        expect(err.message).toBe('登录已过期，请重新登录');
      });
    });

    it('500 状态码应返回 rejected Promise', function() {
      var response = {
        statusCode: 500,
        data: {}
      };

      var result = requestModule.responseInterceptors.onFulfilled(response);

      return result.then(function() {
        throw new Error('应该 reject');
      }).catch(function(err) {
        expect(err.code).toBe(500);
      });
    });

    it('data 为 null/undefined 时应返回 rejected Promise', function() {
      var response = {
        statusCode: 200,
        data: null
      };

      var result = requestModule.responseInterceptors.onFulfilled(response);

      return result.then(function() {
        throw new Error('应该 reject');
      }).catch(function(err) {
        expect(err.message).toBe('响应数据为空');
      });
    });

  });

  // ==================== Loading/Toast 辅助函数 ====================
  describe('辅助函数', function() {

    it('showLoading 应调用 wx.showLoading', function() {
      requestModule.showLoading('测试加载');
      expect(wx.showLoading).toHaveBeenCalledWith({
        title: '测试加载',
        mask: true
      });
    });

    it('showLoading 默认标题应为"加载中..."', function() {
      requestModule.showLoading();
      expect(wx.showLoading).toHaveBeenCalledWith({
        title: '加载中...',
        mask: true
      });
    });

    it('hideLoading 应调用 wx.hideLoading', function() {
      requestModule.hideLoading();
      expect(wx.hideLoading).toHaveBeenCalled();
    });

    it('showError 应调用 wx.showToast 并设置 icon 为 none', function() {
      requestModule.showError('错误信息');
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '错误信息',
        icon: 'none',
        duration: 2000
      });
    });

    it('showSuccess 应调用 wx.showToast 并设置 icon 为 success', function() {
      requestModule.showSuccess('操作成功');
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '操作成功',
        icon: 'success',
        duration: 1500
      });
    });
  });

  // ==================== HTTP 方法快捷函数 ====================
  describe('HTTP 快捷方法', function() {

    it('api.get 应调用 wx.request 并携带正确参数', function() {
      mockWxRequest(function(options) {
        expect(options.method).toBe('GET');
        expect(options.url).toContain('/test-endpoint');
        options.success({
          statusCode: 200,
          data: { code: 200, data: 'get-result' }
        });
      });

      return requestModule.api.get('/test-endpoint').then(function(result) {
        expect(result.code).toBe(200);
        expect(result.data).toBe('get-result');
      });
    });

    it('api.post 应调用 wx.request 并携带 data', function() {
      var postData = { name: 'test', value: 123 };

      mockWxRequest(function(options) {
        expect(options.method).toBe('POST');
        expect(options.data).toEqual(postData);
        options.success({
          statusCode: 200,
          data: { code: 200, data: 'post-result' }
        });
      });

      return requestModule.api.post('/test-endpoint', postData).then(function(result) {
        expect(result.code).toBe(200);
        expect(result.data).toBe('post-result');
      });
    });

    it('api.put 应调用 wx.request 携带 PUT 方法和 data', function() {
      mockWxRequest(function(options) {
        expect(options.method).toBe('PUT');
        options.success({
          statusCode: 200,
          data: { code: 200 }
        });
      });

      return requestModule.api.put('/test-endpoint', { key: 'value' }).then(function(result) {
        expect(result.code).toBe(200);
      });
    });

    it('api.delete 应调用 wx.request 携带 DELETE 方法', function() {
      mockWxRequest(function(options) {
        expect(options.method).toBe('DELETE');
        options.success({
          statusCode: 200,
          data: { code: 200 }
        });
      });

      return requestModule.api.delete('/test-endpoint').then(function(result) {
        expect(result.code).toBe(200);
      });
    });

    it('api.get 带参数时应正确传递', function() {
      mockWxRequest(function(options) {
        expect(options.data.page).toBe(1);
        expect(options.data.size).toBe(10);
        options.success({
          statusCode: 200,
          data: { code: 200, data: [] }
        });
      });

      return requestModule.api.get('/test-list', { page: 1, size: 10 }).then(function(result) {
        expect(result.code).toBe(200);
      });
    });

  });

  // ==================== CONFIG 配置验证 ====================
  describe('CONFIG 配置', function() {

    it('baseURL 应为字符串', function() {
      expect(typeof requestModule.CONFIG.baseURL).toBe('string');
    });

    it('timeout 应为正数', function() {
      expect(typeof requestModule.CONFIG.timeout).toBe('number');
      expect(requestModule.CONFIG.timeout).toBeGreaterThan(0);
    });

    it('默认 header 应包含 Content-Type: application/json', function() {
      expect(requestModule.CONFIG.header['Content-Type']).toBe('application/json');
    });
  });

});
