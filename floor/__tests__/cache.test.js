// S 规格验收：utils/cache.js（TDD 红→绿）
describe('utils/cache', () => {
  let cache;
  let store;

  beforeEach(() => {
    vi.resetModules();
    store = {};
    global.wx = {
      setStorageSync: (k, v) => { store[k] = v; },
      getStorageSync: (k) => (k in store ? store[k] : ''),
      removeStorageSync: (k) => { delete store[k]; },
      getStorageInfoSync: () => ({ keys: Object.keys(store) })
    };
    cache = require('../utils/cache');
  });

  test('set/get 往返', () => {
    cache.set('store:1', { name: 'A' });
    expect(cache.get('store:1')).toEqual({ name: 'A' });
  });

  test('get 不存在的 key 返回 null', () => {
    expect(cache.get('nope')).toBeNull();
  });

  test('TTL 过期后返回 null 并被清除', () => {
    cache.set('stats:1', { totalOrders: 5 }, 50);
    expect(cache.get('stats:1')).toEqual({ totalOrders: 5 });
    const rawKey = Object.keys(store).find(k => k.indexOf('cache:stats:1') === 0);
    // 手动把时间戳拨回 100 秒前，模拟过期
    store[rawKey].t = Date.now() - 100000;
    expect(cache.get('stats:1')).toBeNull();
    expect(store[rawKey]).toBeUndefined();
  });

  test('ttl=0 表示永久有效', () => {
    cache.set('forever', 42, 0);
    const rawKey = Object.keys(store).find(k => k.indexOf('cache:forever') === 0);
    store[rawKey].t = Date.now() - 999999999;
    expect(cache.get('forever')).toBe(42);
  });

  test('clearPrefix 只清指定前缀', () => {
    cache.set('stats:1', 1);
    cache.set('coupons:1', 2);
    cache.set('store:1', 3);
    expect(cache.clearPrefix('stats:')).toBe(1);
    expect(cache.get('stats:1')).toBeNull();
    expect(cache.get('coupons:1')).toBe(2);
    expect(cache.get('store:1')).toBe(3);
  });

  test('clearAll 清空全部缓存', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clearAll();
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBeNull();
  });

  test('sizeKB 返回非负数', () => {
    cache.set('store:1', { big: 'payload' });
    expect(cache.sizeKB()).toBeGreaterThanOrEqual(0);
  });

  describe('swr stale-while-revalidate', () => {
    test('有缓存：先 onCache 秒显，fetch 成功后写缓存并 onSuccess', async () => {
      cache.set('store:1', { name: '旧数据' });
      const seen = [];
      let doneFn;
      const fetcher = (done) => { doneFn = done; };
      const p = cache.swr('store:1', 60000, fetcher, {
        onCache: (d) => seen.push(['cache', d]),
        onSuccess: (d) => seen.push(['fresh', d])
      });
      expect(seen).toEqual([['cache', { name: '旧数据' }]]);
      doneFn({ name: '新数据' });
      await p;
      expect(seen[1]).toEqual(['fresh', { name: '新数据' }]);
      expect(cache.get('store:1')).toEqual({ name: '新数据' });
    });

    test('无缓存：只走 onSuccess，不触发 onCache/onFail', async () => {
      const seen = [];
      let doneFn;
      const p = cache.swr('coupons:1', 60000, (done) => { doneFn = done; }, {
        onCache: (d) => seen.push(['cache', d]),
        onSuccess: (d) => seen.push(['fresh', d]),
        onFail: () => seen.push(['fail'])
      });
      doneFn([1, 2]);
      await p;
      expect(seen).toEqual([['fresh', [1, 2]]]);
    });

    test('fetch 失败：有缓存时保留缓存数据不报错', async () => {
      cache.set('address:1', [{ id: 1 }]);
      let failCalled = false;
      const p = cache.swr('address:1', 60000, (done, fail) => { fail(new Error('net')); }, {
        onCache: (d) => { failCalled = d.length === 1; },
        onFail: () => { throw new Error('不应触发 onFail'); }
      });
      await p;
      expect(failCalled).toBe(true);
      expect(cache.get('address:1')).toEqual([{ id: 1 }]);
    });

    test('fetch 失败：无缓存时触发 onFail', async () => {
      let failed = false;
      const p = cache.swr('points:1', 60000, (done, fail) => { fail(new Error('net')); }, {
        onFail: () => { failed = true; }
      });
      await p;
      expect(failed).toBe(true);
    });
  });
});
