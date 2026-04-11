/**
 * 支付方式管理页面逻辑
 */
Page({
  data: {
    paymentMethods: [],
    isLoading: true,
    // 新增弹窗
    showAddModal: false,
    newPayment: { name: '', type: 'alipay' },
    paymentTypes: [
      { id: 'wechat',  label: '微信支付', icon: 'fa-comment-dollar', iconText: 'ð¬' },
      { id: 'alipay',  label: '支付宝',   icon: 'fa-money-bill-wave', iconText: 'ðµ' },
      { id: 'card',    label: '银行卡',   icon: 'fa-credit-card', iconText: 'ð³' },
      { id: 'balance', label: '余额支付', icon: 'fa-wallet', iconText: 'ð' }
    ]
  },

  onLoad: function() {
    this.loadPaymentMethods();
  },

  // 加载支付方式（从本地存储读取，后端暂无支付接口）
  loadPaymentMethods: function() {
    var STORAGE_KEY = 'payment_methods';
    var DEFAULT_METHODS = [
      { id: 1, name: '微信支付', number: '绑定微信账户', icon: 'fa-comment-dollar', iconText: 'ð¬', status: '已启用', isDefault: true },
      { id: 2, name: '余额支付', number: '账户余额', icon: 'fa-wallet', iconText: 'ð', status: '可用', isDefault: false }
    ];
    var saved = wx.getStorageSync(STORAGE_KEY);
    if (saved && saved.length > 0) {
      this.setData({ paymentMethods: saved, isLoading: false });
    } else {
      wx.setStorageSync(STORAGE_KEY, DEFAULT_METHODS);
      this.setData({ paymentMethods: DEFAULT_METHODS, isLoading: false });
    }
  },

  // 设为默认
  onSetDefault: function(e) {
    var id = parseInt(e.currentTarget.dataset.id);
    var that = this;
    wx.showModal({
      title: '设为默认',
      content: '确定将此支付方式设为默认吗？',
      success: function(res) {
        if (res.confirm) {
          var updated = [];
          for (var mi = 0; mi < that.data.paymentMethods.length; mi++) {
            var itm = that.data.paymentMethods[mi];
            var copy = {};
            for (var mj in itm) copy[mj] = itm[mj];
            copy.isDefault = (itm.id === id);
            updated.push(copy);
          }
          that.setData({ paymentMethods: updated });
          wx.showToast({ title: '设置成功', icon: 'success' });
        }
      }
    });
  },

  // 编辑支付方式
  onEditPayment: function(e) {
    var payment = e.currentTarget.dataset.payment;
    wx.showModal({
      title: '编辑 · ' + payment.name,
      content: '当前绑定：' + payment.number + '\n如需更换，请先解绑再重新绑定。',
      confirmText: '知道了',
      showCancel: false
    });
  },

  // 删除支付方式
  onDeletePayment: function(e) {
    var payment = e.currentTarget.dataset.payment;
    var that = this;

    if (payment.isDefault) {
      wx.showToast({ title: '不能删除默认支付方式', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: '确定要删除「' + payment.name + '」吗？',
      success: function(res) {
        if (res.confirm) {
          var updated = that.data.paymentMethods.filter(function(item) {
            return item.id !== payment.id;
          });
          that.setData({ paymentMethods: updated });
          wx.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  },

  // 添加支付方式
  onAddPayment: function() {
    var that = this;
    wx.showActionSheet({
      itemList: ['微信支付', '支付宝', '银行卡', '余额支付'],
      success: function(res) {
        var types = [
          { name: '微信支付', icon: 'fa-comment-dollar', iconText: 'ð¬', number: '绑定微信账户',   status: '已启用' },
          { name: '支付宝',   icon: 'fa-money-bill-wave', iconText: 'ðµ', number: '绑定支付宝账户', status: '已启用' },
          { name: '银行卡',   icon: 'fa-credit-card', iconText: 'ð³', number: '尾号待绑定',     status: '未启用' },
          { name: '余额支付', icon: 'fa-wallet', iconText: 'ð', number: '账户余额 ¥0.00', status: '可用'   }
        ];
        var chosen = types[res.tapIndex];

        // 检查是否已存在
        var exists = that.data.paymentMethods.some(function(item) {
          return item.name === chosen.name;
        });
        if (exists) {
          wx.showToast({ title: chosen.name + ' 已添加', icon: 'none' });
          return;
        }

        var newItem = { id: Date.now(), isDefault: false };
        for (var nk in chosen) newItem[nk] = chosen[nk];
        var updated = that.data.paymentMethods.concat([newItem]);
        that.setData({ paymentMethods: updated });
        wx.showToast({ title: '添加成功', icon: 'success' });
      }
    });
  },

  onPullDownRefresh: function() {
    this.loadPaymentMethods();
    wx.stopPullDownRefresh();
  }
});
