// 忘记密码页面逻辑
Page({
  data: {
    // 步骤控制
    currentStep: 1,

    // 表单数据
    phone: '',
    verifyCode: '',
    newPassword: '',
    confirmPassword: '',
    showPassword: false,

    // 状态
    isLoading: false,
    errorMessage: '',
    isSendingCode: false,
    countdown: 60
  },

  // 页面加载
  onLoad: function(options) {
    console.log('忘记密码页面加载');
  },

  // 手机号输入
  onPhoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    });
    // 清除错误提示
    if (this.data.errorMessage) {
      this.setData({ errorMessage: '' });
    }
  },

  // 验证码输入
  onVerifyCodeInput: function(e) {
    this.setData({
      verifyCode: e.detail.value
    });
    // 清除错误提示
    if (this.data.errorMessage) {
      this.setData({ errorMessage: '' });
    }
  },

  // 新密码输入
  onNewPasswordInput: function(e) {
    this.setData({
      newPassword: e.detail.value
    });
    // 清除错误提示
    if (this.data.errorMessage) {
      this.setData({ errorMessage: '' });
    }
  },

  // 确认密码输入
  onConfirmPasswordInput: function(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
    // 清除错误提示
    if (this.data.errorMessage) {
      this.setData({ errorMessage: '' });
    }
  },

  // 切换密码可见性
  onTogglePassword: function() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  // 发送验证码
  onSendVerifyCode: function() {
    var phone = this.data.phone;

    // 验证手机号
    if (!phone || phone.trim() === '') {
      this.showError('请输入手机号');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      this.showError('请输入正确的手机号');
      return;
    }

    // 发送验证码
    this.setData({
      isSendingCode: true,
      countdown: 60
    });

    var self = this;
    // 调用发送验证码API
    var userApi = require('../../api/user');
    userApi.sendVerifyCode(phone)
      .then(function(res) {
        if (res.success) {
          wx.showToast({
            title: '验证码已发送',
            icon: 'success'
          });

          // 开始倒计时
          self.startCountdown();
        } else {
          self.showError(res.message || '发送验证码失败');
          self.setData({ isSendingCode: false });
        }
      })
      .catch(function(err) {
        console.error('发送验证码失败：', err);
        self.showError('发送验证码失败');
        self.setData({ isSendingCode: false });
      });
  },

  // 开始倒计时
  startCountdown: function() {
    var self = this;
    var timer = setInterval(function() {
      var countdown = self.data.countdown;
      if (countdown <= 1) {
        clearInterval(timer);
        self.setData({
          isSendingCode: false,
          countdown: 60
        });
      } else {
        self.setData({
          countdown: countdown - 1
        });
      }
    }, 1000);
  },

  // 下一步
  onNextStep: function() {
    var phone = this.data.phone;
    var verifyCode = this.data.verifyCode;

    // 验证表单
    if (!phone || phone.trim() === '') {
      this.showError('请输入手机号');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      this.showError('请输入正确的手机号');
      return;
    }

    if (!verifyCode || verifyCode.trim() === '') {
      this.showError('请输入验证码');
      return;
    }

    if (!/^\d{6}$/.test(verifyCode)) {
      this.showError('请输入6位数字验证码');
      return;
    }

    // 显示加载
    this.setData({
      isLoading: true,
      errorMessage: ''
    });

    wx.showLoading({
      title: '验证中...'
    });

    var self = this;
    // 调用验证验证码API
    var userApi = require('../../api/user');
    userApi.verifyCode(phone, verifyCode)
      .then(function(res) {
        if (res.success) {
          // 验证成功，进入下一步
          self.setData({
            currentStep: 2,
            isLoading: false
          });
          wx.hideLoading();
        } else {
          self.showError(res.message || '验证码错误');
        }
      })
      .catch(function(err) {
        console.error('验证失败：', err);
        self.showError('验证失败');
      });
  },

  // 重置密码
  onResetPassword: function() {
    var newPassword = this.data.newPassword;
    var confirmPassword = this.data.confirmPassword;

    // 验证表单
    if (!newPassword || newPassword.trim() === '') {
      this.showError('请输入新密码');
      return;
    }

    if (newPassword.length < 6) {
      this.showError('密码长度至少为6位');
      return;
    }

    if (!confirmPassword || confirmPassword.trim() === '') {
      this.showError('请确认新密码');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.showError('两次输入的密码不一致');
      return;
    }

    // 显示加载
    this.setData({
      isLoading: true,
      errorMessage: ''
    });

    wx.showLoading({
      title: '重置中...'
    });

    var self = this;
    // 调用重置密码API
    var userApi = require('../../api/user');
    userApi.resetPassword(this.data.phone, this.data.verifyCode, newPassword)
      .then(function(res) {
        if (res.success) {
          // 重置成功，进入完成步骤
          self.setData({
            currentStep: 3,
            isLoading: false
          });
          wx.hideLoading();
        } else {
          self.showError(res.message || '重置密码失败');
        }
      })
      .catch(function(err) {
        console.error('重置密码失败：', err);
        self.showError('重置密码失败');
      });
  },

  // 显示错误
  showError: function(message) {
    this.setData({
      errorMessage: message,
      isLoading: false
    });
    wx.hideLoading();
  },

  // 跳转到登录页面
  onGoToLogin: function() {
    wx.navigateBack({
      delta: 2 // 返回到登录页面（因为从登录页面过来）
    });
  },

  // 页面分享
  onShareAppMessage: function() {
    return {
      title: '美食小程序 - 忘记密码',
      path: '/pages/forgot-password/forgot-password'
    };
  }
});
