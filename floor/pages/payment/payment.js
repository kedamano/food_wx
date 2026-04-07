/**
 * 支付方式管理页面逻辑
 */
const paymentApi = require('../../api/payment');
const { showLoading, hideLoading, showError, showSuccess } = require('../../api/request');

Page({
  data: {
    // 支付方式列表
    paymentMethods: [],
    // 加载状态
    isLoading: true,
    // 选择模式
    isSelectMode: false,
  },

  // 页面加载
  async onLoad(options) {
    console.log('支付方式页面加载');

    // 检查是否为选择模式
    if (options.selectMode === 'true') {
      this.setData({ isSelectMode: true });
    }

    // 加载支付方式列表
    await this.loadPaymentMethods();
  },

  // 返回按钮点击
  onBackClick() {
    console.log('返回按钮点击');
    wx.navigateBack({
      delta: 1
    });
  },

  // 添加支付方式
  onAddPayment() {
    console.log('添加支付方式');
    wx.navigateTo({
      url: '/pages/payment-add/payment-add'
    });
  },

  // 选择支付方式
  onSelectPayment(e) {
    const payment = e.currentTarget.dataset.payment;
    console.log('选择支付方式：', payment);

    // 如果是在选择模式（例如从订单确认页过来），则返回选择的支付方式
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.route === 'pages/order-confirm/order-confirm') {
      // 设置上一个页面的支付方式
      prevPage.setData({
        paymentMethod: payment.id
      });
      wx.navigateBack();
      return;
    }

    // 普通模式，查看详情
    wx.navigateTo({
      url: `/pages/payment-detail/payment-detail?id=${payment.id}`
    });
  },

  // 设为默认支付方式
  onSetDefault(e) {
    e.stopPropagation(); // 阻止事件冒泡
    const payment = e.currentTarget.dataset.payment;
    console.log('设为默认支付方式：', payment);

    wx.showModal({
      title: '设为默认',
      content: '确定要将此支付方式设为默认吗？',
      success: (res) => {
        if (res.confirm) {
          // 更新默认状态
          const updatedMethods = this.data.paymentMethods.map(item => ({
            ...item,
            isDefault: item.id === payment.id
          }));

          this.setData({
            paymentMethods: updatedMethods
          });

          wx.showToast({
            title: '设置成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 编辑支付方式
  onEditPayment(e) {
    e.stopPropagation(); // 阻止事件冒泡
    const payment = e.currentTarget.dataset.payment;
    console.log('编辑支付方式：', payment);

    wx.navigateTo({
      url: `/pages/payment-edit/payment-edit?id=${payment.id}`
    });
  },

  // 删除支付方式
  onDeletePayment(e) {
    e.stopPropagation(); // 阻止事件冒泡
    const payment = e.currentTarget.dataset.payment;
    console.log('删除支付方式：', payment);

    // 不能删除默认支付方式
    if (payment.isDefault) {
      wx.showToast({
        title: '不能删除默认支付方式',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个支付方式吗？',
      success: (res) => {
        if (res.confirm) {
          this.deletePayment(payment.id);
        }
      }
    });
  },

  // 删除支付方式
  async deletePayment(paymentId) {
    try {
      const result = await paymentApi.deletePaymentMethod(paymentId);
      if (result.success) {
        // 重新加载支付方式列表
        await this.loadPaymentMethods();
        showSuccess('删除成功');
      } else {
        showError('删除失败');
      }
    } catch (error) {
      console.error('删除支付方式失败:', error);
      showError('删除失败');
    }
  },

  // 加载支付方式列表
  loadPaymentMethods() {
    // 模拟支付方式数据
    const mockPaymentMethods = [
      {
        id: 1,
        name: '微信支付',
        number: '绑定微信账户',
        icon: 'fa-weixin',
        status: '已启用',
        isDefault: true
      },
      {
        id: 2,
        name: '支付宝',
        number: '绑定支付宝账户',
        icon: '💙',
        status: '已启用',
        isDefault: false
      },
      {
        id: 3,
        name: '银行卡',
        number: '尾号 8888',
        icon: 'fa-credit-card',
        status: '已启用',
        isDefault: false
      },
      {
        id: 4,
        name: '余额支付',
        number: '账户余额 ¥128.50',
        icon: '💰',
        status: '可用',
        isDefault: false
      }
    ];

    this.setData({
      paymentMethods: mockPaymentMethods,
      isLoading: false
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    this.loadPaymentMethods();

    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});