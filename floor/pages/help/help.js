/**
 * 帮助中心页面逻辑
 */
Page({
  data: {
    searchKeyword: '',
    categories: [
      {
        id: 1,
        name: '常见问题',
        icon: 'fa-question-circle',
        questions: [
          {
            q: '如何下单订餐？',
            a: '1. 选择您喜欢的商家和美食\n2. 点击"加入购物车"\n3. 确认订单信息\n4. 选择支付方式\n5. 完成支付，等待配送'
          },
          {
            q: '如何修改或取消订单？',
            a: '在商家接单前，您可以自行取消订单。进入"我的订单"，找到对应订单，点击"取消订单"即可。商家接单后如需取消，请联系商家或客服。'
          },
          {
            q: '订单配送时间多久？',
            a: '一般情况下，订单会在30-45分钟内送达。具体时间取决于商家准备时间和配送距离。'
          },
          {
            q: '如何申请退款？',
            a: '如果订单出现问题（如超时、未送达、食品质量问题等），您可以在订单详情页点击"申请售后"进行退款申请，我们会尽快处理。'
          },
          {
            q: '如何联系客服？',
            a: '您可以通过以下方式联系我们：\n1. 在"关于我们"页面查看客服电话\n2. 在意见反馈页面提交问题\n3. 拨打客服热线：400-888-8888'
          }
        ]
      },
      {
        id: 2,
        name: '账户问题',
        icon: 'fa-user',
        questions: [
          {
            q: '如何注册账号？',
            a: '打开小程序，点击"我的"，然后点击"登录/注册"，按照提示输入手机号和验证码即可完成注册。'
          },
          {
            q: '忘记密码怎么办？',
            a: '在登录页面点击"忘记密码"，输入注册手机号，通过验证码重置密码。'
          },
          {
            q: '如何修改个人信息？',
            a: '进入"个人中心"，点击头像区域或"账号信息"，可以修改用户名、手机号、邮箱等信息。'
          }
        ]
      },
      {
        id: 3,
        name: '支付问题',
        icon: 'fa-credit-card',
        questions: [
          {
            q: '支持哪些支付方式？',
            a: '目前支持微信支付、支付宝支付。'
          },
          {
            q: '支付失败怎么办？',
            a: '1. 检查网络连接\n2. 确认支付账户余额充足\n3. 检查微信/支付宝是否完成实名认证\n如仍无法支付，请联系客服。'
          },
          {
            q: '优惠券如何使用？',
            a: '在结算页面，系统会自动显示可用的优惠券。您也可以手动选择其他优惠券。选择后，优惠金额会自动抵扣。'
          }
        ]
      },
      {
        id: 4,
        name: '配送问题',
        icon: 'fa-truck',
        questions: [
          {
            q: '配送范围是什么？',
            a: '配送范围由商家设定，一般以商家为中心3-5公里内。具体以结算时显示为准。'
          },
          {
            q: '可以指定送达时间吗？',
            a: '目前暂不支持指定送达时间，我们会尽快为您配送。'
          },
          {
            q: '配送费如何计算？',
            a: '配送费由商家根据距离设定，具体金额在结算页面显示。部分商家会有免配送费活动。'
          }
        ]
      }
    ],
    expandedCategory: null,
    expandedQuestion: null
  },

  onLoad() {
    // 默认展开第一个分类
    this.setData({
      expandedCategory: 1
    });
  },

  // 搜索帮助
  onSearch(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
  },

  // 展开/收起分类
  onToggleCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    const currentExpanded = this.data.expandedCategory;

    this.setData({
      expandedCategory: currentExpanded === categoryId ? null : categoryId,
      expandedQuestion: null
    });
  },

  // 展开/收起问题
  onToggleQuestion(e) {
    const questionIndex = e.currentTarget.dataset.index;
    const currentExpanded = this.data.expandedQuestion;

    this.setData({
      expandedQuestion: currentExpanded === questionIndex ? null : questionIndex
    });
  },

  // 复制客服电话
  onCopyPhone() {
    wx.setClipboardData({
      data: '400-888-8888',
      success: () => {
        wx.showToast({ title: '电话已复制', icon: 'success' });
      }
    });
  },

  // 返回
  onBack() {
    wx.navigateBack();
  }
});
