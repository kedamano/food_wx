// S2 验收：utils/order-format.js 订单摘要纯函数（TDD 红→绿）
const { formatOrderSummary } = require('../utils/order-format');

describe('formatOrderSummary', () => {
  test('已完成订单：状态映射、金额、时间', () => {
    const out = formatOrderSummary({
      orderId: 7,
      status: '已完成',
      createTime: '2026-10-01T12:30:00',
      payAmount: 88.5,
      storeName: '川味人家',
      orderDetails: [{ foodId: 1, foodName: '水煮鱼', price: 58, quantity: 1 }]
    });
    expect(out.statusClass).toBe('completed');
    expect(out.statusText).toBe('已完成');
    expect(out.finalAmount).toBe('88.50');
    expect(out.orderTime).toBe('10/01 12:30');
    expect(out.storeName).toBe('川味人家');
    expect(out.items).toHaveLength(1);
    expect(out.items[0].name).toBe('水煮鱼');
    expect(out.items[0].price).toBe(58);
  });

  test('五种状态映射到正确的样式类', () => {
    const cases = {
      '待付款': 'pending', '制作中': 'preparing', '配送中': 'delivering',
      '已完成': 'completed', '已取消': 'completed'
    };
    for (const [status, cls] of Object.entries(cases)) {
      expect(formatOrderSummary({ orderId: 1, status }).statusClass).toBe(cls);
    }
  });

  test('明细优先取 orderDetails，兼容 items；name 兼容 foodName', () => {
    const a = formatOrderSummary({ orderId: 1, status: '已完成', orderDetails: [{ foodName: 'A', price: 1, quantity: 2 }] });
    const b = formatOrderSummary({ orderId: 1, status: '已完成', items: [{ name: 'B', price: 2, quantity: 1 }] });
    expect(a.items[0].name).toBe('A');
    expect(b.items[0].name).toBe('B');
  });

  test('空明细 → items 为空数组（页面据此隐藏商品区）', () => {
    expect(formatOrderSummary({ orderId: 1, status: '待付款' }).items).toEqual([]);
  });

  test('未知状态：原文透传 + pending 兜底样式', () => {
    const out = formatOrderSummary({ orderId: 1, status: '已退款' });
    expect(out.statusText).toBe('已退款');
    expect(out.statusClass).toBe('pending');
  });

  test('金额缺省为 0.00', () => {
    expect(formatOrderSummary({ orderId: 1, status: '待付款' }).finalAmount).toBe('0.00');
  });
});
