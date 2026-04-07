/**
 * 支付方式相关API接口
 */
const { api, showLoading, hideLoading, showError, showSuccess } = require('./request');

// 模拟支付方式数据
const mockPaymentMethods = [
  {
    id: 1,
    name: '微信支付',
    type: 'WECHAT',
    number: '绑定微信账户',
    icon: 'fa-weixin',
    status: '已启用',
    isDefault: true,
    createTime: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '支付宝',
    type: 'ALIPAY',
    number: '绑定支付宝账户',
    icon: '💙',
    status: '已启用',
    isDefault: false,
    createTime: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    name: '银行卡',
    type: 'BANK_CARD',
    number: '尾号 8888',
    icon: 'fa-credit-card',
    status: '已启用',
    isDefault: false,
    createTime: '2024-01-03T00:00:00Z',
    bankName: '招商银行',
    cardType: '信用卡',
  },
  {
    id: 4,
    name: '余额支付',
    type: 'BALANCE',
    number: '账户余额 ¥128.50',
    icon: '💰',
    status: '可用',
    isDefault: false,
    createTime: '2024-01-04T00:00:00Z',
    balance: 128.50,
  },
];

/**
 * 获取支付方式列表
 * @returns {Promise}
 */
function getPaymentMethodList() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPaymentMethods);
    }, 300);
  });
}

/**
 * 获取单个支付方式详情
 * @param {number} paymentId - 支付方式ID
 * @returns {Promise}
 */
function getPaymentMethodDetail(paymentId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const payment = mockPaymentMethods.find(p => p.id === parseInt(paymentId));
      resolve(payment || null);
    }, 200);
  });
}

/**
 * 创建支付方式
 * @param {Object} data - 支付方式数据
 * @returns {Promise}
 */
function createPaymentMethod(data) {
  showLoading('添加中...');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      hideLoading();
      
      const newPayment = {
        id: Date.now(),
        ...data,
        createTime: new Date().toISOString(),
        status: '已启用',
      };
      
      mockPaymentMethods.push(newPayment);
      showSuccess('添加成功');
      resolve(newPayment);
    }, 1000);
  });
}

/**
 * 更新支付方式
 * @param {number} paymentId - 支付方式ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
function updatePaymentMethod(paymentId, data) {
  showLoading('更新中...');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      hideLoading();
      
      const index = mockPaymentMethods.findIndex(p => p.id === parseInt(paymentId));
      if (index !== -1) {
        mockPaymentMethods[index] = {
          ...mockPaymentMethods[index],
          ...data,
        };
        
        showSuccess('更新成功');
        resolve(mockPaymentMethods[index]);
      } else {
        showError('支付方式不存在');
        resolve(null);
      }
    }, 800);
  });
}

/**
 * 删除支付方式
 * @param {number} paymentId - 支付方式ID
 * @returns {Promise}
 */
function deletePaymentMethod(paymentId) {
  showLoading('删除中...');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      hideLoading();
      
      const index = mockPaymentMethods.findIndex(p => p.id === parseInt(paymentId));
      if (index !== -1) {
        const payment = mockPaymentMethods[index];
        
        // 检查是否为默认支付方式
        if (payment.isDefault) {
          showError('不能删除默认支付方式');
          resolve({ success: false });
          return;
        }
        
        mockPaymentMethods.splice(index, 1);
        showSuccess('删除成功');
        resolve({ success: true });
      } else {
        showError('支付方式不存在');
        resolve({ success: false });
      }
    }, 500);
  });
}

/**
 * 设置默认支付方式
 * @param {number} paymentId - 支付方式ID
 * @returns {Promise}
 */
function setDefaultPaymentMethod(paymentId) {
  showLoading('设置中...');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      hideLoading();
      
      const targetIndex = mockPaymentMethods.findIndex(p => p.id === parseInt(paymentId));
      if (targetIndex !== -1) {
        // 取消所有默认支付方式
        mockPaymentMethods.forEach(p => {
          p.isDefault = false;
        });
        
        // 设置新的默认支付方式
        mockPaymentMethods[targetIndex].isDefault = true;
        
        showSuccess('设置成功');
        resolve({ success: true });
      } else {
        showError('支付方式不存在');
        resolve({ success: false });
      }
    }, 500);
  });
}

/**
 * 获取默认支付方式
 * @returns {Promise}
 */
function getDefaultPaymentMethod() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const defaultPayment = mockPaymentMethods.find(p => p.isDefault);
      resolve(defaultPayment || null);
    }, 200);
  });
}

/**
 * 验证支付方式
 * @param {Object} data - 支付方式数据
 * @returns {Object} 验证结果
 */
function validatePaymentMethod(data) {
  const errors = {};
  
  // 验证必填字段
  if (!data.name || data.name.trim().length < 2) {
    errors.name = '请输入有效的支付方式名称';
  }
  
  if (!data.type) {
    errors.type = '请选择支付方式类型';
  }
  
  // 银行卡类型特殊验证
  if (data.type === 'BANK_CARD') {
    if (!data.bankName || data.bankName.trim().length < 2) {
      errors.bankName = '请输入银行名称';
    }
    
    if (!data.cardNumber || !/^\d{16,19}$/.test(data.cardNumber)) {
      errors.cardNumber = '请输入有效的银行卡号（16-19位数字）';
    }
    
    if (!data.cardType) {
      errors.cardType = '请选择卡类型';
    }
    
    if (!data.expireDate || !/^(0[1-9]|1[0-2])\/(\d{2})$/.test(data.expireDate)) {
      errors.expireDate = '请输入有效的有效期（MM/YY格式）';
    }
    
    if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
      errors.cvv = '请输入有效的CVV安全码（3-4位数字）';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * 获取支付方式统计
 * @returns {Promise}
 */
function getPaymentMethodStats() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stats = {
        total: mockPaymentMethods.length,
        enabled: mockPaymentMethods.filter(p => p.status === '已启用').length,
        disabled: mockPaymentMethods.filter(p => p.status === '已禁用').length,
        default: mockPaymentMethods.filter(p => p.isDefault).length,
        byType: {
          WECHAT: mockPaymentMethods.filter(p => p.type === 'WECHAT').length,
          ALIPAY: mockPaymentMethods.filter(p => p.type === 'ALIPAY').length,
          BANK_CARD: mockPaymentMethods.filter(p => p.type === 'BANK_CARD').length,
          BALANCE: mockPaymentMethods.filter(p => p.type === 'BALANCE').length,
        },
      };
      resolve(stats);
    }, 200);
  });
}

module.exports = {
  getPaymentMethodList,
  getPaymentMethodDetail,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  getDefaultPaymentMethod,
  validatePaymentMethod,
  getPaymentMethodStats,
  mockPaymentMethods, // 导出供其他模块使用
};