/**
 * 客服中心页面逻辑
 */
Page({
  data: {
    servicePhone: '400-123-4567',
    serviceTime: '9:00-21:00',
    faqList: [
      { id: 1, question: '如何修改收货地址？', answer: '进入"我的"->"收货地址"页面，点击编辑按钮即可修改地址信息。' },
      { id: 2, question: '如何申请退款？', answer: '在订单详情页面点击"联系客服"按钮，描述退款原因，客服会尽快处理。' },
      { id: 3, question: '配送费怎么收取？', answer: '配送费根据距离商家远近收取，一般为3-8元。部分商家满一定金额可免配送费。' },
      { id: 4, question: '如何使用优惠券？', answer: '在购物车结算时，点击优惠券区域选择要使用的优惠券即可自动抵扣金额。' },
      { id: 5, question: '订单超时未送达怎么办？', answer: '请在订单详情页面点击催单按钮，或直接联系客服处理。' },
      { id: 6, question: '如何联系商家？', answer: '进入商家详情页面，点击商家电话即可直接拨打。' }
    ],
    expandedId: null
  },

  // 展开收起FAQ
  onToggleFaq: function(e) {
    var id = e.currentTarget.dataset.id;
    var currentExpanded = this.data.expandedId;
    this.setData({
      expandedId: currentExpanded === id ? null : id
    });
  },

  // 拨打客服电话
  onCallService: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.servicePhone
    });
  },

  // 在线聊天
  onOnlineChat: function() {
    wx.showToast({
      title: '在线客服暂未开放',
      icon: 'none'
    });
  },

  // 意见反馈
  onFeedback: function() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
  },

  // 返回
  onBack: function() {
    wx.navigateBack();
  }
});
