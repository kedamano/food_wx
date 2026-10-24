// 共享日期/金额格式化（统一此前散落 5 处的内联实现）
// 输入兼容：ISO 字符串（含 T）/ "YYYY-MM-DD HH:mm:ss" / LocalDateTime 数组 / 毫秒时间戳 / Date

function toDate(input) {
  if (input === null || input === undefined || input === '') return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  if (Array.isArray(input)) {
    // LocalDateTime 序列化数组 [y, m, d, h, mi, s]
    if (input.length < 3) return null;
    return new Date(input[0], input[1] - 1, input[2],
      input[3] || 0, input[4] || 0, input[5] || 0);
  }
  if (typeof input === 'number') {
    var d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof input === 'string') {
    var s = input.indexOf('T') > -1 ? input.replace('T', ' ').replace(/-/g, '/')
      : input.replace(/-/g, '/');
    var d2 = new Date(s);
    return isNaN(d2.getTime()) ? null : d2;
  }
  return null;
}

function pad(n) { return n < 10 ? '0' + n : '' + n; }

function formatDateTime(input) {
  var d = toDate(input);
  if (!d) return '';
  return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) +
    ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function formatDate(input) {
  var d = toDate(input);
  if (!d) return '';
  return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate());
}

module.exports = {
  formatDateTime: formatDateTime,
  formatDate: formatDate,
  toDate: toDate,
  pad: pad
};
