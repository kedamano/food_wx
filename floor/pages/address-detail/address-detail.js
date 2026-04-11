/**
 * 地址详情页面逻辑
 */
var addressApi = require('../../api/address');
var requestApi = require('../../api/request');
var showLoading = requestApi.showLoading;
var hideLoading = requestApi.hideLoading;
var showError = requestApi.showError;
var showSuccess = requestApi.showSuccess;

Page({
  data: {
    // 地址信息
    address: null,
    // 是否为选择模式
    isSelectMode: false
  },

  // 页面加载
  onLoad: function(options) {
    var self = this;
    console.log('地址详情页面加载，参数：', options);

    // 检查是否为选择模式
    if (options.selectMode === 'true') {
      this.setData({ isSelectMode: true });
    }

    // 获取地址ID
    var addressId = options.id;
    if (!addressId) {
      showError('地址ID不存在');
      setTimeout(function() {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 加载地址详情
    self.loadAddressDetail(addressId);
  },

  // 加载地址详情
  loadAddressDetail: function(addressId) {
    var self = this;
    try {
      showLoading('加载中...');
      addressApi.getAddressDetail(addressId).then(function(address) {
        if (address) {
          self.setData({ address: address });
        } else {
          showError('地址不存在');
          setTimeout(function() {
            wx.navigateBack();
          }, 1500);
        }
      }).catch(function(error) {
        console.error('加载地址详情失败:', error);
        showError('加载失败');
      }).finally(function() {
        hideLoading();
      });
    } catch (error) {
      console.error('加载地址详情失败:', error);
      showError('加载失败');
      hideLoading();
    }
  },

  // 编辑地址
  onEditAddress: function() {
    if (!this.data.address) return;

    wx.navigateTo({
      url: '/pages/address-edit/address-edit?id=' + this.data.address.id
    });
  },

  // 删除地址
  onDeleteAddress: function() {
    var self = this;
    if (!this.data.address) return;

    try {
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这个地址吗？',
        success: function(res) {
          if (!res.confirm) return;

          showLoading('删除中...');
          addressApi.deleteAddress(self.data.address.id).then(function(result) {
            if (result.success) {
              showSuccess('删除成功');
              setTimeout(function() {
                // 返回上一页并刷新列表
                var pages = getCurrentPages();
                var prevPage = pages[pages.length - 2];
                if (prevPage && prevPage.route === 'pages/address/address') {
                  prevPage.loadAddresses();
                }
                wx.navigateBack();
              }, 1500);
            } else {
              showError('删除失败');
            }
          }).catch(function(error) {
            console.error('删除地址失败:', error);
            showError('删除失败');
          }).finally(function() {
            hideLoading();
          });
        }
      });
    } catch (error) {
      console.error('删除地址失败:', error);
      showError('删除失败');
    }
  },

  // 设置默认地址
  onSetDefault: function() {
    var self = this;
    if (!this.data.address) return;

    try {
      showLoading('设置中...');
      addressApi.setDefaultAddress(this.data.address.id).then(function(result) {
        if (result.success) {
          showSuccess('设置成功');
          // 重新加载地址详情
          self.loadAddressDetail(self.data.address.id);
          // 刷新地址列表
          var pages = getCurrentPages();
          var listPage = null;
          for (var i = 0; i < pages.length; i++) {
            if (pages[i].route === 'pages/address/address') {
              listPage = pages[i];
              break;
            }
          }
          if (listPage) {
            listPage.loadAddresses();
          }
        } else {
          showError('设置失败');
        }
      }).catch(function(error) {
        console.error('设置默认地址失败:', error);
        showError('设置失败');
      }).finally(function() {
        hideLoading();
      });
    } catch (error) {
      console.error('设置默认地址失败:', error);
      showError('设置失败');
      hideLoading();
    }
  },

  // 选择地址（选择模式）
  onSelectAddress: function() {
    if (!this.data.address || !this.data.isSelectMode) return;

    // 返回选择的地址
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.route === 'pages/order-confirm/order-confirm') {
      prevPage.setData({
        selectedAddress: this.data.address
      });
    }

    wx.navigateBack();
  },

  // 复制地址
  onCopyAddress: function() {
    if (!this.data.address) return;

    var fullAddress = this.data.address.name + ' ' + this.data.address.phone + '\n' + this.data.address.province + this.data.address.city + this.data.address.district + this.data.address.detail;

    wx.setClipboardData({
      data: fullAddress,
      success: function() {
        showSuccess('地址已复制');
      },
      fail: function() {
        showError('复制失败');
      }
    });
  },

  // 拨打电话
  onMakePhoneCall: function() {
    if (!this.data.address) return;

    wx.makePhoneCall({
      phoneNumber: this.data.address.phone
    });
  }
});
