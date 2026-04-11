/**
 * 地址编辑页面逻辑
 */
var addressApi = require('../../api/address');

Page({
  data: {
    isEditMode: false,
    addressId: null,
    formData: {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false,
      isHome: false,
      isWork: false
    },
    errors: {},
    // 省市区选项（简化版）
    regions: {
      provinces: ['广东省', '浙江省', '江苏省', '上海市', '北京市', '四川省', '湖北省', '湖南省', '山东省', '河南省'],
      cities: ['深圳市', '广州市', '杭州市', '苏州市', '上海市', '北京市', '成都市', '武汉市', '长沙市', '青岛市'],
      districts: ['南山区', '福田区', '罗湖区', '宝安区', '西湖区', '工业园区', '浦东新区', '朝阳区', '锦江区', '江汉区']
    },
    regionIndex: [0, 0, 0]
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ isEditMode: true, addressId: parseInt(options.id) });
      this.loadAddressDetail(parseInt(options.id));
    }
  },

  // 加载地址详情（编辑时）
  loadAddressDetail: function(id) {
    var that = this;
    wx.showLoading({ title: '加载中...' });
    addressApi.getAddressDetail(id).then(function(address) {
      wx.hideLoading();
      if (address) {
        that.setData({
          formData: {
            name: address.name || '',
            phone: address.phone || '',
            province: address.province || '',
            city: address.city || '',
            district: address.district || '',
            detail: address.detail || '',
            isDefault: address.isDefault || false,
            isHome: address.isHome || false,
            isWork: address.isWork || false
          }
        });
      } else {
        wx.showToast({ title: '地址不存在', icon: 'none' });
        setTimeout(function() { wx.navigateBack(); }, 1500);
      }
    }).catch(function(err) {
      wx.hideLoading();
      console.error('加载地址失败:', err);
    });
  },

  // 表单输入
  onFormInput: function(e) {
    var field = e.currentTarget.dataset.field;
    var value = e.detail.value;
    var obj = {};
    obj['formData.' + field] = value;
    obj['errors.' + field] = '';
    this.setData(obj);
  },

  // 切换默认地址
  onToggleDefault: function(e) {
    this.setData({ 'formData.isDefault': e.detail.value });
  },

  // 切换标签
  onToggleTag: function(e) {
    var tag = e.currentTarget.dataset.tag;
    var obj = {};
    obj['formData.' + tag] = !this.data.formData[tag];
    this.setData(obj);
  },

  // 省市区选择改变
  onRegionChange: function(e) {
    var value = e.detail.value;
    this.setData({
      regionIndex: value,
      'formData.province': this.data.regions.provinces[value[0]] || '',
      'formData.city': this.data.regions.cities[value[1]] || '',
      'formData.district': this.data.regions.districts[value[2]] || ''
    });
  },

  // 表单验证
  validateForm: function() {
    var formData = this.data.formData;
    var errors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = '请输入有效的姓名';
    }
    if (!formData.phone || !/^1[3-9]\d{9}$/.test(formData.phone)) {
      errors.phone = '请输入有效的手机号码';
    }
    if (!formData.province || !formData.city || !formData.district) {
      errors.location = '请选择省市区';
    }
    if (!formData.detail || formData.detail.trim().length < 5) {
      errors.detail = '请输入详细地址（至少5个字符）';
    }
    this.setData({ errors: errors });
    return Object.keys(errors).length === 0;
  },

  // 保存地址
  onSaveAddress: function() {
    if (!this.validateForm()) return;
    var that = this;
    wx.showLoading({ title: '保存中...' });

    var savePromise = that.data.isEditMode
      ? addressApi.updateAddress(that.data.addressId, that.data.formData)
      : addressApi.createAddress(that.data.formData);

    savePromise.then(function() {
      wx.hideLoading();
      wx.showToast({ title: that.data.isEditMode ? '修改成功' : '添加成功', icon: 'success' });
      setTimeout(function() {
        wx.navigateBack();
      }, 1200);
    }).catch(function(err) {
      wx.hideLoading();
      console.error('保存失败:', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    });
  },

  onShow: function() {
    this.setData({ errors: {} });
  }
});
