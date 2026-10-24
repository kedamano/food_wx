/**
 * utils/util.js 单元测试
 *
 * 测试 formatTime, formatNumber 函数
 */
var util = require('../utils/util');

beforeEach(function() {
  jest.clearAllMocks();
});

describe('utils/util.js', function() {

  describe('formatTime', function() {

    it('格式化 Date 对象应返回正确格式的字符串', function() {
      // 创建一个固定日期的 Date 对象: 2025-01-15 14:30:00
      var date = new Date(2025, 0, 15, 14, 30, 0);

      var result = util.formatTime(date);

      // 期望格式: "YYYY/MM/DD HH:MM:SS"
      expect(result).toBe('2025/01/15 14:30:00');
    });

    it('格式化后字符串应包含年月日和时分秒', function() {
      var date = new Date();
      var result = util.formatTime(date);

      // 应包含日期分隔符和空格
      expect(result).toContain('/');
      expect(result).toContain(' ');
      expect(result).toContain(':');
    });

    it('返回值应为字符串类型', function() {
      var date = new Date();
      var result = util.formatTime(date);

      expect(typeof result).toBe('string');
    });

    it('返回值长度应为 19 位 (YYYY/MM/DD HH:MM:SS)', function() {
      var date = new Date(2025, 0, 15, 14, 30, 0);
      var result = util.formatTime(date);

      expect(result.length).toBe(19);
    });

    it('不同日期返回不同结果', function() {
      var date1 = new Date(2025, 0, 1);
      var date2 = new Date(2025, 5, 15);

      var result1 = util.formatTime(date1);
      var result2 = util.formatTime(date2);

      expect(result1).not.toBe(result2);
    });

  });

  describe('formatNumber (内部逻辑)', function() {

    it('单位数应该前面补零', function() {
      var date = new Date(2025, 0, 5, 1, 5, 5);
      var result = util.formatTime(date);

      // 月份、日期、小时、分钟、秒都应该补零
      expect(result).toBe('2025/01/05 01:05:05');
    });

    it('双位数不应补零', function() {
      var date = new Date(2025, 10, 15, 14, 35, 55);
      var result = util.formatTime(date);

      expect(result).toBe('2025/11/15 14:35:55');
    });

  });

});
