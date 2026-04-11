/**
 * 支付方式详情页面逻辑
 */
var paymentApi = require('../../api/payment');
var requestApi = require('../../api/request');
var showLoading = requestApi.showLoading;
var hideLoading = requestApi.hideLoading;
var showError = requestApi.showError;
var showSuccess = requestApi.showSuccess;

Page({
  data: {
    // 支付方式信息
    payment: null,
    // 是否为选择模式
    isSelectMode: false
  },

  // 页面加载
  onLoad: function(options) {
    var self = this;
    console.log('支付方式详情页面加载，参数：', options);

    // 检查是否为选择模式
    if (options.selectMode === 'true') {
      this.setData({ isSelectMode: true });
    }

    // 获取支付方式ID
    var paymentId = options.id;
    if (!paymentId) {
      showError('支付方式ID不存在');
      setTimeout(function() {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 加载支付方式详情
    self.loadPaymentDetail(paymentId);
  },

  // 加载支付方式详情
  loadPaymentDetail: function(paymentId) {
    var self = this;
    try {
      showLoading('加载中...');
      paymentApi.getPaymentMethodDetail(paymentId).then(function(payment) {
        if (payment) {
          self.setData({ payment: payment });
        } else {
          showError('支付方式不存在');
          setTimeout(function() {
            wx.navigateBack();
          }, 1500);
        }
      }).catch(function(error) {
        console.error('加载支付方式详情失败:', error);
        showError('加载失败');
      }).finally(function() {
        hideLoading();
      });
    } catch (error) {
      console.error('加载支付方式详情失败:', error);
      showError('加载失败');
      hideLoading();
    }
  },

  // 编辑支付方式
  onEditPayment: function() {
    if (!this.data.payment) return;

    wx.navigateTo({
      url: '/pages/payment-edit/payment-edit?id=' + this.data.payment.id
    });
  },

  // 删除支付方式
  onDeletePayment: function() {
    var self = this;
    if (!this.data.payment) return;

    try {
      // 检查是否为默认支付方式
      if (this.data.payment.isDefault) {
        showError('不能删除默认支付方式');
        return;
      }

      wx.showModal({
        title: '确认删除',
        content: '确定要删除这个支付方式吗？',
        success: function(res) {
          if (!res.confirm) return;

          showLoading('删除中...');
          paymentApi.deletePaymentMethod(self.data.payment.id).then(function(result) {
            if (result.success) {
              showSuccess('删除成功');
              setTimeout(function() {
                // 返回上一页并刷新列表
                var pages = getCurrentPages();
                var prevPage = pages[pages.length - 2];
                if (prevPage && prevPage.route === 'pages/payment/payment') {
                  prevPage.loadPaymentMethods();
                }
                wx.navigateBack();
              }, 1500);
            } else {
              showError('删除失败');
            }
          }).catch(function(error) {
            console.error('删除支付方式失败:', error);
            showError('删除失败');
          }).finally(function() {
            hideLoading();
          });
        }
      });
    } catch (error) {
      console.error('删除支付方式失败:', error);
      showError('删除失败');
    }
  },

  // 设置默认支付方式
  onSetDefault: function() {
    var self = this;
    if (!this.data.payment) return;

    try {
      showLoading('设置中...');
      paymentApi.setDefaultPaymentMethod(this.data.payment.id).then(function(result) {
        if (result.success) {
          showSuccess('设置成功');
          // 重新加载支付方式详情
          self.loadPaymentDetail(self.data.payment.id);
          // 刷新支付方式列表
          var pages = getCurrentPages();
          var listPage = null;
          for (var i = 0; i < pages.length; i++) {
            if (pages[i].route === 'pages/payment/payment') {
              listPage = pages[i];
              break;
            }
          }
          if (listPage) {
            listPage.loadPaymentMethods();
          }
        } else {
          showError('设置失败');
        }
      }).catch(function(error) {
        console.error('设置默认支付方式失败:', error);
        showError('设置失败');
      }).finally(function() {
        hideLoading();
      });
    } catch (error) {
      console.error('设置默认支付方式失败:', error);
      showError('设置失败');
      hideLoading();
    }
  },

  // 选择支付方式（选择模式）
  onSelectPayment: function() {
    if (!this.data.payment || !this.data.isSelectMode) return;

    // 返回选择的支付方式
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.route === 'pages/order-confirm/order-confirm') {
      prevPage.setData({
        paymentMethod: this.data.payment.id
      });
    }

    wx.navigateBack();
  },

  // 复制支付信息
  onCopyPaymentInfo: function() {
    if (!this.data.payment) return;

    var info = this.data.payment.number || this.data.payment.cardNumber || '';
    if (!info) {
      showError('没有可复制的信息');
      return;
    }

    wx.setClipboardData({
      data: info,
      success: function() {
        showSuccess('信息已复制');
      },
      fail: function() {
        showError('复制失败');
      }
    });
  }
});
