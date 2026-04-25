/**
 * 收货地址相关API接口
 * 已接入后端 AddressController
 */
var requestModule = require('./request');
var api = requestModule.api;
var config = require('./config');

/**
 * 获取地址列表
 */
function getAddressList() {
  return api.get(config.ADDRESS_LIST).then(function(res) {
    // 转换后端数据格式为前端格式
    var addresses = res.data || [];
    return addresses.map(function(item) {
      return formatAddressFromBackend(item);
    });
  });
}

/**
 * 获取地址详情
 */
function getAddressDetail(addressId) {
  return api.get(config.ADDRESS_DETAIL.replace(':id', addressId)).then(function(res) {
    return formatAddressFromBackend(res.data);
  });
}

/**
 * 获取默认地址
 */
function getDefaultAddress() {
  return api.get(config.ADDRESS_DEFAULT).then(function(res) {
    return formatAddressFromBackend(res.data);
  }).catch(function(err) {
    // 404表示没有默认地址，返回null
    if (err.code === 404) {
      return null;
    }
    throw err;
  });
}

/**
 * 创建地址
 */
function createAddress(data) {
  wx.showLoading({ title: '保存中...' });
  // 转换前端数据格式为后端格式
  var backendData = formatAddressToBackend(data);
  
  return api.post(config.ADDRESS_ADD, backendData).then(function(res) {
    wx.hideLoading();
    wx.showToast({ title: '保存成功', icon: 'success' });
    return formatAddressFromBackend(res.data);
  }).catch(function(err) {
    wx.hideLoading();
    wx.showToast({ title: err.message || '保存失败', icon: 'none' });
    throw err;
  });
}

/**
 * 更新地址
 */
function updateAddress(addressId, data) {
  wx.showLoading({ title: '更新中...' });
  // 转换前端数据格式为后端格式
  var backendData = formatAddressToBackend(data);
  backendData.addressId = parseInt(addressId);
  
  return api.put(config.ADDRESS_UPDATE, backendData).then(function(res) {
    wx.hideLoading();
    wx.showToast({ title: '更新成功', icon: 'success' });
    return formatAddressFromBackend(res.data);
  }).catch(function(err) {
    wx.hideLoading();
    wx.showToast({ title: err.message || '更新失败', icon: 'none' });
    throw err;
  });
}

/**
 * 删除地址
 */
function deleteAddress(addressId) {
  wx.showLoading({ title: '删除中...' });
  return api.delete(config.ADDRESS_DELETE.replace(':id', addressId)).then(function(res) {
    wx.hideLoading();
    wx.showToast({ title: '删除成功', icon: 'success' });
    return { success: true };
  }).catch(function(err) {
    wx.hideLoading();
    wx.showToast({ title: err.message || '删除失败', icon: 'none' });
    throw err;
  });
}

/**
 * 设置默认地址
 */
function setDefaultAddress(addressId) {
  wx.showLoading({ title: '设置中...' });
  return api.put(config.ADDRESS_SET_DEFAULT.replace(':id', addressId)).then(function(res) {
    wx.hideLoading();
    wx.showToast({ title: '设置成功', icon: 'success' });
    return { success: true };
  }).catch(function(err) {
    wx.hideLoading();
    wx.showToast({ title: err.message || '设置失败', icon: 'none' });
    throw err;
  });
}

/**
 * 将后端地址数据转换为前端格式
 */
function formatAddressFromBackend(item) {
  if (!item) return null;
  
  // 处理tag字段
  var isHome = item.tag === 'home';
  var isWork = item.tag === 'work';
  
  return {
    id: item.addressId,
    addressId: item.addressId,
    name: item.name,
    phone: item.phone,
    province: item.province || '',
    city: item.city || '',
    district: item.district || '',
    detail: item.detail,
    fullAddress: item.fullAddress || '',
    tag: item.tag || 'other',
    isHome: isHome,
    isWork: isWork,
    isDefault: item.isDefault === 1,
    createTime: item.createTime
  };
}

/**
 * 将前端地址数据转换为后端格式
 */
function formatAddressToBackend(data) {
  // 确定tag字段
  var tag = 'other';
  if (data.isHome) {
    tag = 'home';
  } else if (data.isWork) {
    tag = 'work';
  } else if (data.tag) {
    tag = data.tag;
  }
  
  return {
    name: data.name,
    phone: data.phone,
    province: data.province,
    city: data.city,
    district: data.district,
    detail: data.detail,
    tag: tag,
    isDefault: data.isDefault ? 1 : 0
  };
}

/**
 * 验证地址数据
 */
function validateAddress(data) {
  var errors = {};

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
    errors: errors
  };
}

module.exports = {
  getAddressList: getAddressList,
  getAddressDetail: getAddressDetail,
  getDefaultAddress: getDefaultAddress,
  createAddress: createAddress,
  updateAddress: updateAddress,
  deleteAddress: deleteAddress,
  setDefaultAddress: setDefaultAddress,
  validateAddress: validateAddress
};
