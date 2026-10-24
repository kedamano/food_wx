// S 规格见 docs/specs/SDD-前端迭代：数据缓存层（stale-while-revalidate）
// 存储基于 wx.setStorageSync，key 统一前缀 cache:，支持 TTL 与按前缀清除

var PREFIX = 'cache:';

function fullKey(key) {
  return PREFIX + key;
}

function set(key, value, ttlMs) {
  try {
    wx.setStorageSync(fullKey(key), {
      v: value,
      t: Date.now(),
      ttl: ttlMs || 0
    });
    return true;
  } catch (e) {
    return false;
  }
}

function get(key) {
  var raw;
  try {
    raw = wx.getStorageSync(fullKey(key));
  } catch (e) {
    return null;
  }
  if (!raw || typeof raw !== 'object' || raw.t === undefined) return null;
  if (raw.ttl > 0 && Date.now() - raw.t > raw.ttl) {
    remove(key);
    return null;
  }
  return raw.v;
}

function remove(key) {
  try {
    wx.removeStorageSync(fullKey(key));
  } catch (e) { /* 忽略 */ }
}

/** 清除指定前缀的所有缓存（如 'stats:' 'coupons:'），返回清除数量 */
function clearPrefix(prefix) {
  var keys = [];
  try {
    keys = wx.getStorageInfoSync().keys || [];
  } catch (e) {
    return 0;
  }
  var n = 0;
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].indexOf(PREFIX + prefix) === 0) {
      wx.removeStorageSync(keys[i]);
      n++;
    }
  }
  return n;
}

/** 清除全部 cache: 前缀缓存 */
function clearAll() {
  return clearPrefix('');
}

/** 缓存占用体积（KB，粗估） */
function sizeKB() {
  var total = 0;
  var info;
  try {
    info = wx.getStorageInfoSync();
  } catch (e) {
    return 0;
  }
  for (var i = 0; i < (info.keys || []).length; i++) {
    if (info.keys[i].indexOf(PREFIX) === 0) {
      try {
        total += JSON.stringify(wx.getStorageSync(info.keys[i])).length;
      } catch (e) { /* 忽略单条 */ }
    }
  }
  return Math.round(total / 1024);
}

/**
 * stale-while-revalidate：有缓存先 onCache 秒显，同时后台 fetch；
 * fetch 成功写缓存并 onSuccess；失败且无缓存时 onFail。
 * fetcher(done, fail) 由调用方封装网络请求。
 */
function swr(key, ttlMs, fetcher, hooks) {
  hooks = hooks || {};
  var cached = get(key);
  var hasCache = cached !== null;
  if (hasCache && hooks.onCache) {
    hooks.onCache(cached);
  }
  fetcher(function(data) {
    set(key, data, ttlMs);
    if (hooks.onSuccess) hooks.onSuccess(data);
  }, function(err) {
    if (!hasCache && hooks.onFail) hooks.onFail(err);
  });
  return hasCache;
}

/** 用户相关缓存前缀（登录/退出时清理） */
var USER_PREFIXES = ['stats:', 'coupons:', 'address:', 'points:', 'favorites:'];

function clearUserCaches() {
  for (var i = 0; i < USER_PREFIXES.length; i++) {
    clearPrefix(USER_PREFIXES[i]);
  }
}

module.exports = {
  set: set,
  get: get,
  remove: remove,
  clearPrefix: clearPrefix,
  clearAll: clearAll,
  clearUserCaches: clearUserCaches,
  sizeKB: sizeKB,
  swr: swr,
  PREFIX: PREFIX
};
