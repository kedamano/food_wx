/**
 * 收货地址相关API接口
 */
const { api, showLoading, hideLoading, showError, showSuccess } = require('./request');

// 模拟数据
const mockAddresses = [
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园南区软件产业基地1栋1201室',
    isDefault: true,
    createTime: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '李四',
    phone: '13900139000',
    province: '广东省',
    city: '深圳市',
    district: '福田区',
    detail: '福田CBD商务中心大厦25楼2501室',
    isDefault: false,
    createTime: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    name: '王五',
    phone: '13700137000',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    detail: '天河体育中心体育西路188号城建大厦8楼',
    isDefault: false,
    createTime: '2024-01-03T00:00:00Z',
  },
];

/**
 * 获取用户地址列表
 * @returns {Promise}
 */
function getAddressList() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAddresses);
    }, 300);
  });
}

/**
 * 获取单个地址详情
 * @param {number} addressId - 地址ID
 * @returns {Promise}
 */
function getAddressDetail(addressId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const address = mockAddresses.find(addr => addr.id === parseInt(addressId));
      resolve(address || null);
    }, 200);
  });
}

/**
 * 创建新地址
 * @param {Object} data - 地址数据
 * @returns {Promise}
 */
function createAddress(data) {
  showLoading('保存中...');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      hideLoading();
      
      const newAddress = {
        id: Date.now(),
        ...data,
        createTime: new Date().toISOString(),
      };
      
      // 如果是默认地址，需要取消其他默认地址
      if (data.isDefault) {
        mockAddresses.forEach(addr => {
          addr.isDefault = false;
        });
      }
      
      mockAddresses.push(newAddress);
      resolve(newAddress);
    }, 1000);
  });
}

/**
 * 更新地址
 * @param {number} addressId - 地址ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
function updateAddress(addressId, data) {
  showLoading('更新中...');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      hideLoading();
      
      const index = mockAddresses.findIndex(addr => addr.id === parseInt(addressId));
      if (index !== -1) {
        // 如果是默认地址，需要取消其他默认地址
        if (data.isDefault) {
          mockAddresses.forEach(addr => {
            addr.isDefault = false;
          });
        }
        
        mockAddresses[index] = {
          ...mockAddresses[index],
          ...data,
        };
        
        resolve(mockAddresses[index]);
      } else {
        showError('地址不存在');
        resolve(null);
      }
    }, 800);
  });
}

/**
 * 删除地址
 * @param {number} addressId - 地址ID
 * @returns {Promise}
 */
function deleteAddress(addressId) {
  showLoading('删除中...');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      hideLoading();
      
      const index = mockAddresses.findIndex(addr => addr.id === parseInt(addressId));
      if (index !== -1) {
        mockAddresses.splice(index, 1);
        showSuccess('删除成功');
        resolve({ success: true });
      } else {
        showError('地址不存在');
        resolve({ success: false });
      }
    }, 500);
  });
}

/**
 * 设置默认地址
 * @param {number} addressId - 地址ID
 * @returns {Promise}
 */
function setDefaultAddress(addressId) {
  showLoading('设置中...');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      hideLoading();
      
      const targetIndex = mockAddresses.findIndex(addr => addr.id === parseInt(addressId));
      if (targetIndex !== -1) {
        // 取消所有默认地址
        mockAddresses.forEach(addr => {
          addr.isDefault = false;
        });
        
        // 设置新的默认地址
        mockAddresses[targetIndex].isDefault = true;
        
        showSuccess('设置成功');
        resolve({ success: true });
      } else {
        showError('地址不存在');
        resolve({ success: false });
      }
    }, 500);
  });
}

/**
 * 获取默认地址
 * @returns {Promise}
 */
function getDefaultAddress() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const defaultAddress = mockAddresses.find(addr => addr.isDefault);
      resolve(defaultAddress || null);
    }, 200);
  });
}

/**
 * 验证地址
 * @param {Object} data - 地址数据
 * @returns {Object} 验证结果
 */
function validateAddress(data) {
  const errors = {};
  
  // 验证必填字段
  if (!data.name || data.name.trim().length < 2) {
    errors.name = '请输入有效的姓名';
  }
  
  if (!data.phone || !/^1[3-9]\d{9}$/.test(data.phone)) {
    errors.phone = '请输入有效的手机号码';
  }
  
  if (!data.province || !data.city || !data.district) {
    errors.location = '请选择完整的省市区';
  }
  
  if (!data.detail || data.detail.trim().length < 5) {
    errors.detail = '请输入详细的街道地址（至少5个字符）';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

module.exports = {
  getAddressList,
  getAddressDetail,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
  validateAddress,
  mockAddresses, // 导出供其他模块使用
};