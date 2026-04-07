/**
 * 地址编辑页面逻辑
 */
const addressApi = require('../../api/address');
const { showLoading, hideLoading, showError, showSuccess } = require('../../api/request');

Page({
  data: {
    // 编辑模式（false为新增，true为编辑）
    isEditMode: false,
    // 地址ID（编辑模式时使用）
    addressId: null,
    // 表单数据
    formData: {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false,
      isHome: false,
      isWork: false,
    },
    // 表单验证错误
    errors: {},
    // 省市区选项
    regions: {
      provinces: ['广东省', '浙江省', '江苏省', '山东省', '河南省'],
      cities: ['深圳市', '杭州市', '苏州市', '青岛市', '郑州市'],
      districts: ['南山区', '福田区', '西湖区', '工业园区', '市南区'],
    },
    // 当前选择的省市区索引
    regionIndex: [0, 0, 0],
  },

  // 页面加载
  async onLoad(options) {
    console.log('地址编辑页面加载，参数：', options);

    // 检查是否为编辑模式
    if (options.id) {
      this.setData({
        isEditMode: true,
        addressId: parseInt(options.id),
      });
      // 加载地址详情
      await this.loadAddressDetail();
    }
  },

  // 加载地址详情
  async loadAddressDetail() {
    try {
      showLoading('加载中...');
      const address = await addressApi.getAddressDetail(this.data.addressId);
      if (address) {
        this.setData({
          formData: {
            ...address,
            isHome: address.isHome || false,
            isWork: address.isWork || false,
          },
        });
      } else {
        showError('地址不存在');
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      console.error('加载地址详情失败:', error);
      showError('加载失败');
    } finally {
      hideLoading();
    }
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

  // 切换默认地址
  onToggleDefault(e) {
    this.setData({
      'formData.isDefault': e.detail.value,
    });
  },

  // 切换标签
  onToggleTag(e) {
    const { tag } = e.currentTarget.dataset;
    this.setData({
      [`formData.${tag}`]: !this.data.formData[tag],
    });
  },

  // 省市区选择器改变
  onRegionChange(e) {
    const { value } = e.detail;
    this.setData({
      regionIndex: value,
      'formData.province': this.data.regions.provinces[value[0]],
      'formData.city': this.data.regions.cities[value[1]],
      'formData.district': this.data.regions.districts[value[2]],
    });
  },

  // 区域选择器列改变
  onRegionColumnChange(e) {
    const { column, value } = e.detail;
    const newIndex = [...this.data.regionIndex];
    newIndex[column] = value;
    this.setData({ regionIndex: newIndex });
  },

  // 表单验证
  validateForm() {
    const { formData } = this.data;
    const errors = {};

    // 验证姓名
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = '请输入有效的姓名';
    }

    // 验证手机号
    if (!formData.phone || !/^1[3-9]\d{9}$/.test(formData.phone)) {
      errors.phone = '请输入有效的手机号码';
    }

    // 验证省市区
    if (!formData.province || !formData.city || !formData.district) {
      errors.location = '请选择完整的省市区';
    }

    // 验证详细地址
    if (!formData.detail || formData.detail.trim().length < 5) {
      errors.detail = '请输入详细的街道地址（至少5个字符）';
    }

    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  // 保存地址
  async onSaveAddress() {
    if (!this.validateForm()) {
      return;
    }

    try {
      if (this.data.isEditMode) {
        // 编辑模式
        await addressApi.updateAddress(this.data.addressId, this.data.formData);
        showSuccess('更新成功');
      } else {
        // 新增模式
        await addressApi.createAddress(this.data.formData);
        showSuccess('添加成功');
      }

      // 返回上一页并刷新列表
      setTimeout(() => {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage && prevPage.route === 'pages/address/address') {
          prevPage.loadAddresses();
        }
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('保存地址失败:', error);
      showError(this.data.isEditMode ? '更新失败' : '添加失败');
    }
  },

  // 页面显示
  onShow() {
    // 清除错误提示
    this.setData({ errors: {} });
  },
});