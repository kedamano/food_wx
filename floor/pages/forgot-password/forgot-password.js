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
  onLoad(options) {
    console.log('忘记密码页面加载');
  },
  
  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
    // 清除错误提示
    if (this.data.errorMessage) {
      this.setData({ errorMessage: '' });
    }
  },
  
  // 验证码输入
  onVerifyCodeInput(e) {
    this.setData({
      verifyCode: e.detail.value
    });
    // 清除错误提示
    if (this.data.errorMessage) {
      this.setData({ errorMessage: '' });
    }
  },
  
  // 新密码输入
  onNewPasswordInput(e) {
    this.setData({
      newPassword: e.detail.value
    });
    // 清除错误提示
    if (this.data.errorMessage) {
      this.setData({ errorMessage: '' });
    }
  },
  
  // 确认密码输入
  onConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
    // 清除错误提示
    if (this.data.errorMessage) {
      this.setData({ errorMessage: '' });
    }
  },
  
  // 切换密码可见性
  onTogglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },
  
  // 发送验证码
  onSendVerifyCode() {
    const { phone } = this.data;
    
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
    
    // 调用发送验证码API
    const { sendVerifyCode } = require('../../api/user');
    sendVerifyCode(phone)
      .then(res => {
        if (res.success) {
          wx.showToast({
            title: '验证码已发送',
            icon: 'success'
          });
          
          // 开始倒计时
          this.startCountdown();
        } else {
          this.showError(res.message || '发送验证码失败');
          this.setData({ isSendingCode: false });
        }
      })
      .catch(err => {
        console.error('发送验证码失败：', err);
        this.showError('发送验证码失败');
        this.setData({ isSendingCode: false });
      });
  },
  
  // 开始倒计时
  startCountdown() {
    const timer = setInterval(() => {
      const { countdown } = this.data;
      if (countdown <= 1) {
        clearInterval(timer);
        this.setData({
          isSendingCode: false,
          countdown: 60
        });
      } else {
        this.setData({
          countdown: countdown - 1
        });
      }
    }, 1000);
  },
  
  // 下一步
  onNextStep() {
    const { phone, verifyCode } = this.data;
    
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
    
    // 调用验证验证码API
    const { verifyCode: verifyCodeAPI } = require('../../api/user');
    verifyCodeAPI(phone, verifyCode)
      .then(res => {
        if (res.success) {
          // 验证成功，进入下一步
          this.setData({
            currentStep: 2,
            isLoading: false
          });
          wx.hideLoading();
        } else {
          this.showError(res.message || '验证码错误');
        }
      })
      .catch(err => {
        console.error('验证失败：', err);
        this.showError('验证失败');
      });
  },
  
  // 重置密码
  onResetPassword() {
    const { newPassword, confirmPassword } = this.data;
    
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
    
    // 调用重置密码API
    const { resetPassword } = require('../../api/user');
    resetPassword(this.data.phone, this.data.verifyCode, newPassword)
      .then(res => {
        if (res.success) {
          // 重置成功，进入完成步骤
          this.setData({
            currentStep: 3,
            isLoading: false
          });
          wx.hideLoading();
        } else {
          this.showError(res.message || '重置密码失败');
        }
      })
      .catch(err => {
        console.error('重置密码失败：', err);
        this.showError('重置密码失败');
      });
  },
  
  // 显示错误
  showError(message) {
    this.setData({
      errorMessage: message,
      isLoading: false
    });
    wx.hideLoading();
  },
  
  // 跳转到登录页面
  onGoToLogin() {
    wx.navigateBack({
      delta: 2 // 返回到登录页面（因为从登录页面过来）
    });
  },
  
  // 页面分享
  onShareAppMessage() {
    return {
      title: '美食小程序 - 忘记密码',
      path: '/pages/forgot-password/forgot-password'
    };
  }
});