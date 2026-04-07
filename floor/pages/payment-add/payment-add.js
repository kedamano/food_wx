/**
 * 新增支付方式页面逻辑
 */
const paymentApi = require('../../api/payment');
const { showLoading, hideLoading, showError, showSuccess } = require('../../api/request');

Page({
  data: {
    // 支付方式类型
    paymentTypes: [
      { id: 'WECHAT', name: '微信支付', icon: 'fa-weixin' },
      { id: 'ALIPAY', name: '支付宝', icon: '💙' },
      { id: 'BANK_CARD', name: '银行卡', icon: 'fa-credit-card' },
      { id: 'BALANCE', name: '余额支付', icon: '💰' },
    ],
    // 表单数据
    formData: {
      name: '',
      type: 'WECHAT',
      number: '',
      bankName: '',
      cardNumber: '',
      cardType: '信用卡',
      expireDate: '',
      cvv: '',
      isDefault: false,
    },
    // 表单验证错误
    errors: {},
    // 当前选择的支付方式类型索引
    typeIndex: 0,
  },

  // 页面加载
  onLoad(options) {
    console.log('新增支付方式页面加载');
  },

  // 选择支付方式类型
  onTypeSelect(e) {
    const { index } = e.currentTarget.dataset;
    const selectedType = this.data.paymentTypes[index];
    
    this.setData({
      typeIndex: index,
      'formData.type': selectedType.id,
      'formData.name': selectedType.name,
    });
  },

  // 表单输入处理
  onFormInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value,
    });
    
    // 清除错误提示
    if (this.data.errors[field]) {
      this.setData({
        [`errors.${field}`]: null,
      });
    }
  },

  // 切换默认支付方式
  onToggleDefault(e) {
    this.setData({
      'formData.isDefault': e.detail.value,
    });
  },

  // 表单验证
  validateForm() {
    const { formData } = this.data;
    const errors = {};

    // 验证支付方式名称
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = '请输入有效的支付方式名称';
    }

    // 根据类型进行特定验证
    if (formData.type === 'BANK_CARD') {
      // 银行卡验证
      if (!formData.bankName || formData.bankName.trim().length < 2) {
        errors.bankName = '请输入银行名称';
      }

      if (!formData.cardNumber || !/^\d{16,19}$/.test(formData.cardNumber)) {
        errors.cardNumber = '请输入有效的银行卡号（16-19位数字）';
      }

      if (!formData.expireDate || !/^(0[1-9]|1[0-2])\/(\d{2})$/.test(formData.expireDate)) {
        errors.expireDate = '请输入有效的有效期（MM/YY格式）';
      }

      if (!formData.cvv || !/^\d{3,4}$/.test(formData.cvv)) {
        errors.cvv = '请输入有效的CVV安全码（3-4位数字）';
      }
    } else {
      // 其他支付方式验证
      if (!formData.number || formData.number.trim().length < 2) {
        errors.number = '请输入有效的账户信息';
      }
    }

    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  // 保存支付方式
  async onSavePayment() {
    if (!this.validateForm()) {
      return;
    }

    try {
      showLoading('添加中...');
      await paymentApi.createPaymentMethod(this.data.formData);
      showSuccess('添加成功');

      // 返回上一页并刷新列表
      setTimeout(() => {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage && prevPage.route === 'pages/payment/payment') {
          prevPage.loadPaymentMethods();
        }
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('保存支付方式失败:', error);
      showError('添加失败');
    } finally {
      hideLoading();
    }
  },

  // 页面显示
  onShow() {
    // 清除错误提示
    this.setData({ errors: {} });
  },
});