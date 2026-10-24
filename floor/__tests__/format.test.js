// S1 验收：utils/format.js 日期格式化（TDD 红→绿）
describe('utils/format.formatDateTime', () => {
  let fmt;
  beforeEach(() => { fmt = require('../utils/format'); });

  test('ISO 字符串（含 T）格式化为 YYYY/MM/DD HH:mm', () => {
    expect(fmt.formatDateTime('2026-10-24T15:05:09')).toBe('2026/10/24 15:05');
  });

  test('普通日期时间字符串', () => {
    expect(fmt.formatDateTime('2026-01-05 08:30:00')).toBe('2026/01/05 08:30');
  });

  test('LocalDateTime 数组形式 [y,m,d,h,m,s]', () => {
    expect(fmt.formatDateTime([2026, 10, 24, 9, 5, 3])).toBe('2026/10/24 09:05');
  });

  test('毫秒时间戳', () => {
    expect(fmt.formatDateTime(new Date(2026, 0, 2, 3, 4).getTime())).toBe('2026/01/02 03:04');
  });

  test('Date 对象', () => {
    expect(fmt.formatDateTime(new Date(2026, 11, 31, 23, 59))).toBe('2026/12/31 23:59');
  });

  test('非法输入返回空串：null / undefined / 非日期字符串 / 空数组', () => {
    expect(fmt.formatDateTime(null)).toBe('');
    expect(fmt.formatDateTime(undefined)).toBe('');
    expect(fmt.formatDateTime('not-a-date')).toBe('');
    expect(fmt.formatDateTime([])).toBe('');
  });

  test('个位补零', () => {
    expect(fmt.formatDateTime([2026, 3, 4, 5, 6, 0])).toBe('2026/03/04 05:06');
  });
});

describe('utils/format.formatDate', () => {
  const fmt = require('../utils/format');
  test('仅输出日期', () => {
    expect(fmt.formatDate('2026-10-24T15:05:09')).toBe('2026/10/24');
    expect(fmt.formatDate([2026, 1, 2, 10, 0, 0])).toBe('2026/01/02');
    expect(fmt.formatDate(null)).toBe('');
  });
});
