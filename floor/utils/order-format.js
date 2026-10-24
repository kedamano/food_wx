// 订单列表卡片摘要的纯函数（从 pages/orders 的 formatOrder 抽离，便于单测）
var format = require('./format');

var STATUS_MAP = {
  '待付款': { text: '待付款', cls: 'pending' },
  '待接单': { text: '待接单', cls: 'pending' },
  '已接单': { text: '已接单', cls: 'preparing' },
  '制作中': { text: '制作中', cls: 'preparing' },
  '配送中': { text: '配送中', cls: 'delivering' },
  '已完成': { text: '已完成', cls: 'completed' },
  '已取消': { text: '已取消', cls: 'completed' }
};

function formatOrderSummary(order) {
  var statusInfo = STATUS_MAP[order.status] || { text: order.status, cls: 'pending' };

  return {
    orderId: order.orderId,
    orderNo: order.orderNo,
    storeName: order.storeName || '美食商家',
    status: order.status,
    statusText: statusInfo.text,
    statusClass: statusInfo.cls,
    orderTime: format.formatDateTime(order.createTime).slice(5), // MM/DD HH:mm
    finalAmount: order.payAmount != null ? Number(order.payAmount).toFixed(2) : '0.00',
    items: mapItems(order.orderDetails || order.items || []),
    address: order.address,
    phone: order.phone
  };
}

function mapItems(rawItems) {
  var items = [];
  for (var i = 0; i < rawItems.length; i++) {
    var it = rawItems[i];
    items.push({
      foodId: it.foodId,
      name: it.foodName || it.name || '商品',
      price: parseFloat(it.price) || 0,
      quantity: it.quantity || 1,
      image: it.image || ''
    });
  }
  return items;
}

module.exports = {
  formatOrderSummary: formatOrderSummary,
  STATUS_MAP: STATUS_MAP
};
