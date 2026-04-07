/**
 * 支付方式详情页面逻辑
 */
const paymentApi = require('../../api/payment');
const { showLoading, hideLoading, showError, showSuccess } = require('../../api/request');

Page({
  data: {
    // 支付方式信息
    payment: null,
    // 是否为选择模式
    isSelectMode: false,
  },

  // 页面加载
  async onLoad(options) {
    console.log('支付方式详情页面加载，参数：', options);

    // 检查是否为选择模式
    if (options.selectMode === 'true') {
      this.setData({ isSelectMode: true });
    }

    // 获取支付方式ID
    const paymentId = options.id;
    if (!paymentId) {
      showError('支付方式ID不存在');
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 加载支付方式详情
    await this.loadPaymentDetail(paymentId);
  },

  // 加载支付方式详情
  async loadPaymentDetail(paymentId) {
    try {
      showLoading('加载中...');
      const payment = await paymentApi.getPaymentMethodDetail(paymentId);
      if (payment) {
        this.setData({ payment });
      } else {
        showError('支付方式不存在');
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      console.error('加载支付方式详情失败:', error);
      showError('加载失败');
    } finally {
      hideLoading();
    }
  },

  // 编辑支付方式
  onEditPayment() {
    if (!this.data.payment) return;

    wx.navigateTo({
      url: `/pages/payment-edit/payment-edit?id=${this.data.payment.id}`,
    });
  },

  // 删除支付方式
  async onDeletePayment() {
    if (!this.data.payment) return;

    try {
      // 检查是否为默认支付方式
      if (this.data.payment.isDefault) {
        showError('不能删除默认支付方式');
        return;
      }

      const confirm = await new Promise((resolve) => {
        wx.showModal({
          title: '确认删除',
          content: '确定要删除这个支付方式吗？',
          success: (res) => resolve(res.confirm),
        });
      });

      if (!confirm) return;

      showLoading('删除中...');
      const result = await paymentApi.deletePaymentMethod(this.data.payment.id);
      
      if (result.success) {
        showSuccess('删除成功');
        setTimeout(() => {
          // 返回上一页并刷新列表
          const pages = getCurrentPages();
          const prevPage = pages[pages.length - 2];
          if (prevPage && prevPage.route === 'pages/payment/payment') {
            prevPage.loadPaymentMethods();
          }
          wx.navigateBack();
        }, 1500);
      } else {
        showError('删除失败');
      }
    } catch (error) {
      console.error('删除支付方式失败:', error);
      showError('删除失败');
    } finally {
      hideLoading();
    }
  },

  // 设置默认支付方式
  async onSetDefault() {
    if (!this.data.payment) return;

    try {
      showLoading('设置中...');
      const result = await paymentApi.setDefaultPaymentMethod(this.data.payment.id);
      
      if (result.success) {
        showSuccess('设置成功');
        // 重新加载支付方式详情
        await this.loadPaymentDetail(this.data.payment.id);
        // 刷新支付方式列表
        const pages = getCurrentPages();
        const listPage = pages.find(page => page.route === 'pages/payment/payment');
        if (listPage) {
          listPage.loadPaymentMethods();
        }
      } else {
        showError('设置失败');
      }
    } catch (error) {
      console.error('设置默认支付方式失败:', error);
      showError('设置失败');
    } finally {
      hideLoading();
    }
  },

  // 选择支付方式（选择模式）
  onSelectPayment() {
    if (!this.data.payment || !this.data.isSelectMode) return;

    // 返回选择的支付方式
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.route === 'pages/order-confirm/order-confirm') {
      prevPage.setData({
        paymentMethod: this.data.payment.id,
      });
    }

    wx.navigateBack();
  },

  // 复制支付信息
  onCopyPaymentInfo() {
    if (!this.data.payment) return;

    const info = this.data.payment.number || this.data.payment.cardNumber || '';
    if (!info) {
      showError('没有可复制的信息');
      return;
    }

    wx.setClipboardData({
      data: info,
      success: () => {
        showSuccess('信息已复制');
      },
      fail: () => {
        showError('复制失败');
      },
    });
  },
});