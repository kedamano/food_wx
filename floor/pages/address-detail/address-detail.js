/**
 * 地址详情页面逻辑
 */
const addressApi = require('../../api/address');
const { showLoading, hideLoading, showError, showSuccess } = require('../../api/request');

Page({
  data: {
    // 地址信息
    address: null,
    // 是否为选择模式
    isSelectMode: false,
  },

  // 页面加载
  async onLoad(options) {
    console.log('地址详情页面加载，参数：', options);

    // 检查是否为选择模式
    if (options.selectMode === 'true') {
      this.setData({ isSelectMode: true });
    }

    // 获取地址ID
    const addressId = options.id;
    if (!addressId) {
      showError('地址ID不存在');
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 加载地址详情
    await this.loadAddressDetail(addressId);
  },

  // 加载地址详情
  async loadAddressDetail(addressId) {
    try {
      showLoading('加载中...');
      const address = await addressApi.getAddressDetail(addressId);
      if (address) {
        this.setData({ address });
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

  // 编辑地址
  onEditAddress() {
    if (!this.data.address) return;

    wx.navigateTo({
      url: `/pages/address-edit/address-edit?id=${this.data.address.id}`,
    });
  },

  // 删除地址
  async onDeleteAddress() {
    if (!this.data.address) return;

    try {
      const confirm = await new Promise((resolve) => {
        wx.showModal({
          title: '确认删除',
          content: '确定要删除这个地址吗？',
          success: (res) => resolve(res.confirm),
        });
      });

      if (!confirm) return;

      showLoading('删除中...');
      const result = await addressApi.deleteAddress(this.data.address.id);
      
      if (result.success) {
        showSuccess('删除成功');
        setTimeout(() => {
          // 返回上一页并刷新列表
          const pages = getCurrentPages();
          const prevPage = pages[pages.length - 2];
          if (prevPage && prevPage.route === 'pages/address/address') {
            prevPage.loadAddresses();
          }
          wx.navigateBack();
        }, 1500);
      } else {
        showError('删除失败');
      }
    } catch (error) {
      console.error('删除地址失败:', error);
      showError('删除失败');
    } finally {
      hideLoading();
    }
  },

  // 设置默认地址
  async onSetDefault() {
    if (!this.data.address) return;

    try {
      showLoading('设置中...');
      const result = await addressApi.setDefaultAddress(this.data.address.id);
      
      if (result.success) {
        showSuccess('设置成功');
        // 重新加载地址详情
        await this.loadAddressDetail(this.data.address.id);
        // 刷新地址列表
        const pages = getCurrentPages();
        const listPage = pages.find(page => page.route === 'pages/address/address');
        if (listPage) {
          listPage.loadAddresses();
        }
      } else {
        showError('设置失败');
      }
    } catch (error) {
      console.error('设置默认地址失败:', error);
      showError('设置失败');
    } finally {
      hideLoading();
    }
  },

  // 选择地址（选择模式）
  onSelectAddress() {
    if (!this.data.address || !this.data.isSelectMode) return;

    // 返回选择的地址
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.route === 'pages/order-confirm/order-confirm') {
      prevPage.setData({
        selectedAddress: this.data.address,
      });
    }

    wx.navigateBack();
  },

  // 复制地址
  onCopyAddress() {
    if (!this.data.address) return;

    const fullAddress = `${this.data.address.name} ${this.data.address.phone}\n${this.data.address.province}${this.data.address.city}${this.data.address.district}${this.data.address.detail}`;

    wx.setClipboardData({
      data: fullAddress,
      success: () => {
        showSuccess('地址已复制');
      },
      fail: () => {
        showError('复制失败');
      },
    });
  },

  // 拨打电话
  onMakePhoneCall() {
    if (!this.data.address) return;

    wx.makePhoneCall({
      phoneNumber: this.data.address.phone,
    });
  },
});