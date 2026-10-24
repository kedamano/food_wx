// S4 验收：app.authRequest 行为锁定（200/错误/401 刷新重试/单飞）
describe('app.authRequest 行为', () => {
  let captured;
  let wxRequestMock;

  beforeEach(() => {
    vi.resetModules();
    wxRequestMock = vi.fn();
    const storage = {};
    global.wx = {
      request: wxRequestMock,
      getStorageSync: (k) => (k === 'token' ? storage.token : (storage[k] !== undefined ? storage[k] : '')),
      setStorageSync: (k, v) => { storage[k] = v; },
      removeStorageSync: (k) => { delete storage[k]; },
      getAccountInfoSync: () => ({ miniProgram: { envVersion: 'develop' } }),
      showToast: vi.fn(),
      showModal: vi.fn(),
      navigateTo: vi.fn(),
      getSystemInfoSync: () => ({ model: 'test', platform: 'devtools' })
    };
    storage.token = 'old-token';

    const AppCtor = global.App;
    global.App = function (cfg) { captured = cfg; };
    require('../app');
    global.App = AppCtor;
    global.getApp = () => captured;
    // 启动（初始化 authRequest 等）
    captured.onLaunch.call(captured);
  });

  function driveResponse(statusCode, body) {
    const call = wxRequestMock.mock.calls[wxRequestMock.mock.calls.length - 1][0];
    call.success({ statusCode, data: body, header: {} });
  }

  test('200 + code 200 → resolve 整个 body', async () => {
    const p = captured.authRequest({ url: '/food/categories', method: 'GET' });
    driveResponse(200, { code: 200, data: [{ id: 1 }] });
    const body = await p;
    expect(body.code).toBe(200);
    expect(body.data).toEqual([{ id: 1 }]);
  });

  test('业务错误（code 500）→ reject 且错误信息取 message', async () => {
    const p = captured.authRequest({ url: '/x', method: 'GET' });
    driveResponse(200, { code: 500, message: '库存不足' });
    await expect(p).rejects.toThrow('库存不足');
  });

  test('HTTP 401 → 调 /user/refresh-token，成功后带新 Token 重试原请求', async () => {
    const p = captured.authRequest({ url: '/order/user/1?size=10', method: 'GET' });

    expect(wxRequestMock).toHaveBeenCalledTimes(1);
    expect(wxRequestMock.mock.calls[0][0].url).toContain('/order/user/1');
    driveResponse(401, {});

    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    expect(wxRequestMock).toHaveBeenCalledTimes(2);
    const refreshCall = wxRequestMock.mock.calls[1][0];
    expect(refreshCall.url).toContain('/user/refresh-token');
    expect(refreshCall.data.token).toBe('old-token');
    refreshCall.success({ statusCode: 200, data: { code: 200, data: { token: 'new-token' } } });

    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    expect(wxRequestMock).toHaveBeenCalledTimes(3);
    const retry = wxRequestMock.mock.calls[2][0];
    expect(retry.url).toContain('/order/user/1');
    expect(retry.header.Authorization).toBe('Bearer new-token');
    driveResponse(200, { code: 200, data: { list: [] } });

    const body = await p;
    expect(body.code).toBe(200);
    expect(getApp().globalData.token).toBe('new-token');
  });

  test('刷新失败 → reject，不无限重试', async () => {
    const p = captured.authRequest({ url: '/x', method: 'GET' });
    driveResponse(401, {});
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    driveResponse(200, { code: 401, message: 'Token无效' });
    await expect(p).rejects.toThrow();
    expect(wxRequestMock).toHaveBeenCalledTimes(2);
  });
});
