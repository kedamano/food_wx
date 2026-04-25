/**
 * 收货地址管理页面逻辑
 */
var addressApi = require('../../api/address');

Page({
  data: {
    addresses: [],
    isLoading: true,
    isSelectMode: false
  },

  onLoad: function(options) {
    if (options.selectMode === 'true') {
      this.setData({ isSelectMode: true });
    }
    this.loadAddresses();
  },

  onShow: function() {
    // 每次显示时刷新，保证新增/编辑后数据更新
    this.loadAddresses();
  },

  // 加载地址列表
  loadAddresses: function() {
    var that = this;
    that.setData({ isLoading: true });
    addressApi.getAddressList().then(function(addresses) {
      that.setData({ addresses: addresses || [], isLoading: false });
    }).catch(function(err) {
      console.error('加载地址失败:', err);
      that.setData({ isLoading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  // 新建地址
  onAddAddress: function() {
    wx.navigateTo({ url: '/pages/address-edit/address-edit' });
  },

  // 点击地址（选择模式返回，普通模式编辑）
  onAddressSelect: function(e) {
    var address = e.currentTarget.dataset.address;
    if (this.data.isSelectMode) {
      // 选择模式：通过 EventChannel 回传数据，再返回上一页
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2];
      // 优先使用 EventChannel（order-confirm 页面通过 events 监听）
      var eventChannel = this.getOpenerEventChannel();
      if (eventChannel && typeof eventChannel.emit === 'function') {
        eventChannel.emit('addressSelected', { address: address });
      } else if (prevPage) {
        // 兜底：直接 setData 到上一页
        prevPage.setData({ selectedAddress: address });
      }
      wx.navigateBack();
      return;
    }
    // 普通模式：直接进编辑
    wx.navigateTo({ url: '/pages/address-edit/address-edit?id=' + address.id });
  },

  // 编辑地址
  onEditAddress: function(e) {
    var address = e.currentTarget.dataset.address;
    wx.navigateTo({ url: '/pages/address-edit/address-edit?id=' + address.id });
  },

  // 设为默认
  onSetDefault: function(e) {
    var id = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: '设为默认',
      content: '确定将此地址设为默认地址吗？',
      success: function(res) {
        if (res.confirm) {
          addressApi.setDefaultAddress(id).then(function() {
            that.loadAddresses();
          });
        }
      }
    });
  },

  // 删除地址
  onDeleteAddress: function(e) {
    var id = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      success: function(res) {
        if (res.confirm) {
          addressApi.deleteAddress(id).then(function(result) {
            if (result.success) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              that.loadAddresses();
            } else {
              wx.showToast({ title: '删除失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  onPullDownRefresh: function() {
    this.loadAddresses();
    wx.stopPullDownRefresh();
  }
});
