/**
 * 支付方式相关API接口
 * 注意：后端暂无 PaymentController，支付方式数据暂存在本地 storage
 * TODO: 后端新增支付接口后替换为真实API调用
 */
var requestHelper = require('./request');

var STORAGE_KEY = 'payment_methods';

// 默认支付方式（首次使用时初始化）
var DEFAULT_PAYMENT_METHODS = [
  {
    id: 1,
    name: '微信支付',
    type: 'WECHAT',
    number: '绑定微信账户',
    icon: 'fa-comment-dollar',
    status: '已启用',
    isDefault: true,
    createTime: new Date().toISOString()
  },
  {
    id: 2,
    name: '余额支付',
    type: 'BALANCE',
    number: '账户余额',
    icon: 'fa-wallet',
    status: '可用',
    isDefault: false,
    createTime: new Date().toISOString()
  }
];

/**
 * 从本地存储获取支付方式列表
 * @returns {Array}
 */
function _getPaymentsFromStorage() {
  try {
    var list = wx.getStorageSync(STORAGE_KEY);
    return list || DEFAULT_PAYMENT_METHODS;
  } catch (e) {
    return DEFAULT_PAYMENT_METHODS;
  }
}

/**
 * 保存支付方式列表到本地存储
 * @param {Array} payments
 */
function _savePaymentsToStorage(payments) {
  wx.setStorageSync(STORAGE_KEY, payments);
}

/**
 * 获取支付方式列表
 * @returns {Promise}
 */
function getPaymentMethodList() {
  return new Promise(function(resolve) {
    resolve(_getPaymentsFromStorage());
  });
}

/**
 * 获取单个支付方式详情
 * @param {number} paymentId - 支付方式ID
 * @returns {Promise}
 */
function getPaymentMethodDetail(paymentId) {
  return new Promise(function(resolve) {
    var payments = _getPaymentsFromStorage();
    var payment = payments.find(function(p) {
      return p.id === parseInt(paymentId);
    });
    resolve(payment || null);
  });
}

/**
 * 创建支付方式
 * @param {Object} data - 支付方式数据
 * @returns {Promise}
 */
function createPaymentMethod(data) {
  showLoading('添加中...');
  return new Promise(function(resolve) {
    setTimeout(function() {
      hideLoading();
      var payments = _getPaymentsFromStorage();
      var newPayment = {
        id: Date.now(),
        name: data.name,
        type: data.type,
        number: data.number,
        icon: data.icon,
        status: '已启用',
        isDefault: data.isDefault || false,
        createTime: new Date().toISOString()
      };

      if (newPayment.isDefault) {
        payments.forEach(function(p) {
          p.isDefault = false;
        });
      }

      payments.push(newPayment);
      _savePaymentsToStorage(payments);
      showSuccess('添加成功');
      resolve(newPayment);
    }, 500);
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
  return new Promise(function(resolve) {
    setTimeout(function() {
      hideLoading();
      var payments = _getPaymentsFromStorage();
      var index = payments.findIndex(function(p) {
        return p.id === parseInt(paymentId);
      });
      if (index !== -1) {
        if (data.isDefault) {
          payments.forEach(function(p) {
            p.isDefault = false;
          });
        }
        var merged = {};
        for (var pk in payments[index]) merged[pk] = payments[index][pk];
        for (var dk in data) merged[dk] = data[dk];
        payments[index] = merged;
        _savePaymentsToStorage(payments);
        showSuccess('更新成功');
        resolve(payments[index]);
      } else {
        showError('支付方式不存在');
        resolve(null);
      }
    }, 500);
  });
}

/**
 * 删除支付方式
 * @param {number} paymentId - 支付方式ID
 * @returns {Promise}
 */
function deletePaymentMethod(paymentId) {
  showLoading('删除中...');
  return new Promise(function(resolve) {
    setTimeout(function() {
      hideLoading();
      var payments = _getPaymentsFromStorage();
      var index = payments.findIndex(function(p) {
        return p.id === parseInt(paymentId);
      });
      if (index !== -1) {
        var payment = payments[index];
        if (payment.isDefault) {
          showError('不能删除默认支付方式');
          resolve({ success: false });
          return;
        }
        payments.splice(index, 1);
        _savePaymentsToStorage(payments);
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
  return new Promise(function(resolve) {
    setTimeout(function() {
      hideLoading();
      var payments = _getPaymentsFromStorage();
      var targetIndex = payments.findIndex(function(p) {
        return p.id === parseInt(paymentId);
      });
      if (targetIndex !== -1) {
        payments.forEach(function(p) {
          p.isDefault = false;
        });
        payments[targetIndex].isDefault = true;
        _savePaymentsToStorage(payments);
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
  return new Promise(function(resolve) {
    var payments = _getPaymentsFromStorage();
    var defaultPayment = payments.find(function(p) {
      return p.isDefault;
    });
    resolve(defaultPayment || null);
  });
}

/**
 * 验证支付方式
 * @param {Object} data - 支付方式数据
 * @returns {Object} 验证结果
 */
function validatePaymentMethod(data) {
  var errors = {};
  
  if (!data.name || data.name.trim().length < 2) {
    errors.name = '请输入有效的支付方式名称';
  }
  
  if (!data.type) {
    errors.type = '请选择支付方式类型';
  }
  
  if (data.type === 'BANK_CARD') {
    if (!data.bankName || data.bankName.trim().length < 2) {
      errors.bankName = '请输入银行名称';
    }
    if (!data.cardNumber || !/^\d{16,19}$/.test(data.cardNumber)) {
      errors.cardNumber = '请输入有效的银行卡号（16-19位数字）';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors
  };
}

module.exports = {
  getPaymentMethodList,
  getPaymentMethodDetail,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  getDefaultPaymentMethod,
  validatePaymentMethod
};
