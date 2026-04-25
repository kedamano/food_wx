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
    // 省市区数据（三级联动）
    regionData: [
      {
        name: '广东省',
        cities: [
          { name: '深圳市', districts: ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区', '盐田区'] },
          { name: '广州市', districts: ['天河区', '越秀区', '海珠区', '荔湾区', '白云区', '番禺区'] }
        ]
      },
      {
        name: '浙江省',
        cities: [
          { name: '杭州市', districts: ['西湖区', '拱墅区', '上城区', '滨江区', '萧山区', '余杭区'] },
          { name: '宁波市', districts: ['海曙区', '江北区', '鄞州区', '镇海区', '北仑区'] }
        ]
      },
      {
        name: '北京市',
        cities: [
          { name: '北京市', districts: ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '通州区'] }
        ]
      },
      {
        name: '上海市',
        cities: [
          { name: '上海市', districts: ['浦东新区', '黄浦区', '徐汇区', '长宁区', '静安区', '普陀区'] }
        ]
      }
    ],
    provinces: ['广东省', '浙江省', '北京市', '上海市'],
    cities: ['深圳市', '广州市', '杭州市', '宁波市', '北京市', '上海市'],
    districts: ['南山区', '福田区', '罗湖区', '宝安区', '西湖区', '拱墅区', '朝阳区', '海淀区', '浦东新区', '黄浦区'],
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

  // 省市区列变化
  onRegionColumnChange: function(e) {
    var column = e.detail.column;
    var value = e.detail.value;
    var regionIndex = this.data.regionIndex.slice();
    regionIndex[column] = value;

    if (column === 0) {
      // 选省 → 更新市和区
      var province = this.data.regionData[value];
      var cityNames = [];
      for (var i = 0; i < province.cities.length; i++) {
        cityNames.push(province.cities[i].name);
      }
      var districtNames = province.cities[0].districts;
      regionIndex[1] = 0;
      regionIndex[2] = 0;
      this.setData({
        regionIndex: regionIndex,
        cities: cityNames,
        districts: districtNames
      });
    } else if (column === 1) {
      // 选市 → 更新区
      var provinceData = this.data.regionData[regionIndex[0]];
      var cityData = provinceData.cities[value];
      regionIndex[2] = 0;
      this.setData({
        regionIndex: regionIndex,
        districts: cityData.districts
      });
    } else {
      this.setData({ regionIndex: regionIndex });
    }
  },

  // 省市区选择确认
  onRegionChange: function(e) {
    var value = e.detail.value;
    this.setData({
      regionIndex: value,
      'formData.province': this.data.provinces[value[0]] || '',
      'formData.city': this.data.cities[value[1]] || '',
      'formData.district': this.data.districts[value[2]] || ''
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
