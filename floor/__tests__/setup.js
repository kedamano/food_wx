/**
 * Vitest 测试环境初始化 — 模拟微信小程序全局 API
 *
 * 微信小程序无浏览器 DOM, 但 JS 逻辑层可以独立测试。
 * 此文件在测试运行前执行, mock 微信小程序全局对象。
 */

// ============ Jest → Vitest 兼容层 ============
// vitest 的 vi.* 和 jest.* API 几乎完全兼容, 这里做一个全局映射
// 让使用 jest.fn() 的测试代码无需修改即可在 vitest 中运行
if (typeof globalThis.jest === 'undefined') {
  globalThis.jest = {};
}
// 将 vi 的核心方法映射到 jest 全局对象
globalThis.jest.fn = function() { return vi.fn.apply(vi, arguments); };
globalThis.jest.spyOn = function() { return vi.spyOn.apply(vi, arguments); };
globalThis.jest.clearAllMocks = function() { return vi.clearAllMocks(); };
globalThis.jest.resetAllMocks = function() { return vi.resetAllMocks(); };
globalThis.jest.restoreAllMocks = function() { return vi.restoreAllMocks(); };
globalThis.jest.mock = function() { return vi.mock.apply(vi, arguments); };
globalThis.jest.unmock = function() { return vi.unmock.apply(vi, arguments); };
globalThis.jest.requireActual = function(m) { return vi.importActual(m); };

// ============ vitest 自带的 beforeEach/afterEach ============

// ============ wx 全局对象 mock ============
globalThis.wx = {
  // 存储 API
  getStorageSync: vi.fn(function(key) {
    return globalThis.__wxStorage[key] || null;
  }),
  setStorageSync: vi.fn(function(key, value) {
    globalThis.__wxStorage[key] = value;
  }),
  removeStorageSync: vi.fn(function(key) {
    delete globalThis.__wxStorage[key];
  }),
  clearStorageSync: vi.fn(function() {
    globalThis.__wxStorage = {};
  }),

  // 网络请求 API
  request: vi.fn(function(options) {
    if (globalThis.__wxRequestMock) {
      return globalThis.__wxRequestMock(options);
    }
    // 默认成功返回
    if (options.success) {
      options.success({
        statusCode: 200,
        data: { code: 200, data: {}, message: 'ok' }
      });
    }
  }),

  uploadFile: vi.fn(function(options) {
    if (options.success) {
      options.success({
        statusCode: 200,
        data: JSON.stringify({ code: 200, data: {}, message: 'ok' })
      });
    }
  }),

  // UI API
  showLoading: vi.fn(),
  hideLoading: vi.fn(),
  showToast: vi.fn(),
  showModal: vi.fn(),
  navigateTo: vi.fn(),
  redirectTo: vi.fn(),
  switchTab: vi.fn(),
  navigateBack: vi.fn(),

  // 用户 API
  login: vi.fn(function(options) {
    if (options && options.success) {
      options.success({ code: 'mock-wx-login-code' });
    }
  }),

  getUserInfo: vi.fn(),

  // 其他常用 API
  getSystemInfoSync: vi.fn(function() {
    return {
      model: 'iPhone 14',
      system: 'iOS 16.0',
      version: '8.0.0',
      SDKVersion: '2.32.0'
    };
  }),

  setNavigationBarTitle: vi.fn(),
  setNavigationBarColor: vi.fn(),
  pageScrollTo: vi.fn(),
  createAnimation: vi.fn()
};

// ============ 全局存储 mock ============
globalThis.__wxStorage = {};

// ============ 网络请求定制 mock ============
/**
 * 在测试中设置 wx.request 的自定义行为:
 * mockWxRequest(function(options) {
 *   options.success({ statusCode: 200, data: { ... } });
 * });
 */
globalThis.mockWxRequest = function(handler) {
  globalThis.__wxRequestMock = handler;
};

/**
 * 重置 wx.request mock 为默认行为
 */
globalThis.resetWxRequestMock = function() {
  globalThis.__wxRequestMock = null;
};

// ============ getApp mock ============
/**
 * 在测试中设置 getApp() 的返回值:
 * mockGetApp({ globalData: { userInfo: {...} } });
 */
var mockAppInstance = {
  globalData: {
    userInfo: null,
    token: null,
    baseURL: 'http://localhost:8080/api'
  },
  resolveImageUrl: vi.fn(function(path) { return path; }),
  authRequest: vi.fn()
};

globalThis.getApp = vi.fn(function() {
  return mockAppInstance;
});

globalThis.mockGetApp = function(app) {
  Object.assign(mockAppInstance, app);
  globalThis.getApp = vi.fn(function() { return mockAppInstance; });
};

// ============ getCurrentPages mock ============
globalThis.getCurrentPages = vi.fn(function() {
  return [];
});

// ============ Page/Component/App 构造函数 mock ============
globalThis.Page = vi.fn(function(options) { return options; });
globalThis.Component = vi.fn(function(options) { return options; });
globalThis.App = vi.fn(function(options) { return options; });
