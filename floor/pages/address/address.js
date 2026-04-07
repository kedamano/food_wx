/**
 * 收货地址管理页面逻辑
 */
const addressApi = require('../../api/address');
const { showLoading, hideLoading, showError, showSuccess } = require('../../api/request');

Page({
  data: {
    // 地址列表
    addresses: [],
    // 加载状态
    isLoading: true,
    // 选择模式
    isSelectMode: false,
  },

  // 页面加载
  async onLoad(options) {
    console.log('收货地址页面加载');

    // 检查是否为选择模式
    if (options.selectMode === 'true') {
      this.setData({ isSelectMode: true });
    }

    // 加载地址列表
    await this.loadAddresses();
  },

  // 返回按钮点击
  onBackClick() {
    console.log('返回按钮点击');
    wx.navigateBack({
      delta: 1
    });
  },

  // 添加地址
  onAddAddress() {
    console.log('添加地址');
    wx.navigateTo({
      url: '/pages/address-edit/address-edit'
    });
  },

  // 选择地址
  onAddressSelect(e) {
    const address = e.currentTarget.dataset.address;
    console.log('选择地址：', address);

    // 如果是在选择模式（例如从订单确认页过来），则返回选择的地址
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.route === 'pages/order-confirm/order-confirm') {
      // 设置上一个页面的地址
      prevPage.setData({
        selectedAddress: address
      });
      wx.navigateBack();
      return;
    }

    // 普通模式，进入地址详情
    wx.navigateTo({
      url: `/pages/address-detail/address-detail?id=${address.id}`
    });
  },

  // 编辑地址
  onEditAddress(e) {
    const address = e.currentTarget.dataset.address;
    console.log('编辑地址：', address);

    wx.navigateTo({
      url: `/pages/address-edit/address-edit?id=${address.id}`
    });
  },

  // 删除地址
  onDeleteAddress(e) {
    const address = e.currentTarget.dataset.address;
    console.log('删除地址：', address);

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteAddress(address.id);
        }
      }
    });
  },

  // 删除地址
  async deleteAddress(addressId) {
    try {
      const result = await addressApi.deleteAddress(addressId);
      if (result.success) {
        // 重新加载地址列表
        await this.loadAddresses();
        showSuccess('删除成功');
      } else {
        showError('删除失败');
      }
    } catch (error) {
      console.error('删除地址失败:', error);
      showError('删除失败');
    }
  },

  // 加载地址列表
  async loadAddresses() {
    try {
      showLoading('加载中...');
      const addresses = await addressApi.getAddressList();
      this.setData({
        addresses,
        isLoading: false,
      });
    } catch (error) {
      console.error('加载地址失败:', error);
      showError('加载地址失败');
      this.setData({ isLoading: false });
    } finally {
      hideLoading();
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    this.loadAddresses();

    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});