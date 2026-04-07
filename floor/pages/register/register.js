// 注册页面逻辑
Page({
  data: {
    // 表单数据
    username: '',
    phone: '',
    verifyCode: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
    
    // 状态
    isLoading: false,
    errorMessage: '',
    isGettingCode: false,
    countdown: 60,
    showPassword: false,
    showConfirmPassword: false,
    agreeTerms: false,
    
    // 验证码定时器
    countdownTimer: null
  },
  
  // 页面加载
  onLoad(options) {
    console.log('注册页面加载，参数：', options);
    
    // 清除之前的定时器
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
    }
  },
  
  // 用户名输入
  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
    // 清除错误提示
    if (this.data.errorMessage) {
      this.setData({ errorMessage: '' });
    }
  },
  
  // 手机号输入
  onPhoneInput(e) {
    // 限制只能输入数字
    const phone = e.detail.value.replace(/\D/g, '');
    this.setData({
      phone: phone
    });
    // 清除错误提示
    if (this.data.errorMessage) {
      this.setData({ errorMessage: '' });
    }
  },
  
  // 验证码输入
  onVerifyCodeInput(e) {
    // 限制只能输入数字
    const verifyCode = e.detail.value.replace(/\D/g, '');
    this.setData({
      verifyCode: verifyCode
    });
    // 清除错误提示
    if (this.data.errorMessage) {
      this.setData({ errorMessage: '' });
    }
  },
  
  // 密码输入
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
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
  
  // 邀请码输入
  onInviteCodeInput(e) {
    this.setData({
      inviteCode: e.detail.value
    });
  },
  
  // 切换密码可见性
  onTogglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },
  
  // 切换确认密码可见性
  onToggleConfirmPassword() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword
    });
  },
  
  // 切换协议同意
  onToggleAgree() {
    this.setData({
      agreeTerms: !this.data.agreeTerms
    });
  },
  
  // 获取验证码
  onGetVerifyCode() {
    console.log('点击获取验证码按钮');
    const { phone } = this.data;
    console.log('当前手机号：', phone);
    console.log('当前isGettingCode状态：', this.data.isGettingCode);
    
    // 验证手机号
    if (!phone || phone.length !== 11) {
      console.log('手机号验证失败：长度不正确');
      this.showError('请输入正确的手机号');
      return;
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      console.log('手机号验证失败：格式不正确');
      this.showError('手机号格式不正确');
      return;
    }
    
    // 防止重复点击
    if (this.data.isGettingCode) {
      console.log('正在发送验证码，阻止重复点击');
      return;
    }
    
    console.log('准备发送验证码请求');
    // 发送验证码到后端
    this.sendVerifyCode(phone);
  },
  
  // 发送验证码到后端
  sendVerifyCode(phone) {
    console.log('发送验证码请求，手机号：', phone);

    this.setData({
      isGettingCode: true
    });
    
    wx.showLoading({
      title: '发送中...'
    });
    
    wx.request({
      url: 'http://localhost:8080/api/user/send-verify-code',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        phone: phone
      },
      success: (res) => {
        console.log('发送验证码响应：', res);
        console.log('响应状态码：', res.statusCode);
        console.log('响应数据：', res.data);
        if (res.data) {
          console.log('响应code：', res.data.code);
          console.log('响应message：', res.data.message);
        }

        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          // 发送成功，开始倒计时
          this.startCountdown();
          wx.showToast({
            title: '验证码已发送',
            icon: 'success'
          });
          console.log('验证码发送成功');
        } else {
          const errorMessage = res.data && res.data.message ? res.data.message : '发送验证码失败';
          console.log('验证码发送失败：', errorMessage);
          this.showError(errorMessage);
        }
      },
      fail: (err) => {
        console.error('发送验证码请求失败：', err);
        this.showError('网络连接失败');
      },
      complete: () => {
        console.log('发送验证码请求完成');
        wx.hideLoading();
        this.setData({
          isGettingCode: false
        });
      }
    });
  },
  
  // 开始倒计时
  startCountdown() {
    let countdown = 60;
    
    this.setData({
      countdown: countdown
    });
    
    const timer = setInterval(() => {
      countdown--;
      
      if (countdown <= 0) {
        clearInterval(timer);
        this.setData({
          isGettingCode: false,
          countdown: 60
        });
      } else {
        this.setData({
          countdown: countdown
        });
      }
    }, 1000);
    
    // 保存定时器
    this.setData({
      countdownTimer: timer
    });
  },
  
  // 显示用户协议
  onShowTerms() {
    wx.showModal({
      title: '用户协议',
      content: '用户协议内容展示\n\n1. 服务条款\n2. 使用规则\n3. 隐私保护\n4. 免责声明\n\n请仔细阅读并同意协议内容。',
      showCancel: true,
      confirmText: '同意',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            agreeTerms: true
          });
        }
      }
    });
  },
  
  // 显示隐私政策
  onShowPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '隐私政策内容展示\n\n1. 信息收集\n2. 信息使用\n3. 信息保护\n4. 信息共享\n\n我们承诺保护您的个人信息安全。',
      showCancel: true,
      confirmText: '同意',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            agreeTerms: true
          });
        }
      }
    });
  },
  
  // 微信注册
  onWeChatRegister() {
    wx.showLoading({
      title: '微信注册中...'
    });
    
    // 调用微信登录API
    wx.login({
      success: (res) => {
        console.log('微信登录成功：', res);
        
        if (res.code) {
          // 发送到后端进行微信注册
          this.weChatRegisterToBackend(res.code);
        } else {
          wx.showToast({
            title: '微信登录失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('微信登录失败：', err);
        wx.showToast({
          title: '微信登录失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  
  // 微信注册后端验证
  weChatRegisterToBackend(code) {
    wx.request({
      url: 'http://localhost:8080/api/user/wechat-register',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        code: code
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          // 注册成功
          this.handleRegisterSuccess(res.data.data);
        } else {
          this.showError(res.data.message || '微信注册失败');
        }
      },
      fail: (err) => {
        console.error('微信注册后端请求失败：', err);
        this.showError('网络连接失败');
      }
    });
  },
  
  // 注册表单提交
  onRegisterSubmit(e) {
    // 验证表单
    if (!this.validateForm()) {
      return;
    }
    
    // 显示加载
    this.setData({
      isLoading: true,
      errorMessage: ''
    });
    
    wx.showLoading({
      title: '注册中...'
    });
    
    // 调用注册API
    this.callRegisterAPI();
  },
  
  // 验证表单
  validateForm() {
    const { username, phone, verifyCode, password, confirmPassword, agreeTerms } = this.data;
    
    // 验证用户名
    if (!username || username.trim() === '') {
      this.showError('请输入用户名');
      return false;
    }
    
    if (username.length < 3 || username.length > 20) {
      this.showError('用户名长度为3-20个字符');
      return false;
    }
    
    const usernameRegex = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
    if (!usernameRegex.test(username)) {
      this.showError('用户名只能包含字母、数字、下划线和中文');
      return false;
    }
    
    // 验证手机号
    if (!phone || phone.length !== 11) {
      this.showError('请输入正确的手机号');
      return false;
    }
    
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      this.showError('手机号格式不正确');
      return false;
    }
    
    // 验证验证码
    if (!verifyCode || verifyCode.length !== 6) {
      this.showError('请输入6位验证码');
      return false;
    }
    
    // 验证密码
    if (!password || password.length < 6) {
      this.showError('密码长度至少为6位');
      return false;
    }
    
    // 验证确认密码
    if (password !== confirmPassword) {
      this.showError('两次输入的密码不一致');
      return false;
    }
    
    // 验证用户协议
    if (!agreeTerms) {
      this.showError('请阅读并同意用户协议');
      return false;
    }
    
    return true;
  },
  
  // 显示错误
  showError(message) {
    this.setData({
      errorMessage: message,
      isLoading: false
    });
    wx.hideLoading();
  },
  
  // 调用注册API
  callRegisterAPI() {
    const { username, phone, verifyCode, password, inviteCode } = this.data;
    
    wx.request({
      url: 'http://localhost:8080/api/user/register',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        username: username.trim(),
        phone: phone,
        verifyCode: verifyCode,
        password: password,
        inviteCode: inviteCode || ''
      },
      success: (res) => {
        console.log('注册响应：', res);
        
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            // 注册成功
            this.handleRegisterSuccess(res.data.data);
          } else {
            // 注册失败
            this.showError(res.data.message || '注册失败');
          }
        } else {
          this.showError('网络请求失败');
        }
      },
      fail: (err) => {
        console.error('注册请求失败：', err);
        this.showError('网络连接失败');
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  
  // 处理注册成功
  handleRegisterSuccess(data) {
    const { token, user } = data;
    
    // 保存token到全局
    const app = getApp();
    app.globalData.token = token;
    app.globalData.userInfo = user;
    app.globalData.userId = user.userId;
    
    // 保存到本地存储
    wx.setStorageSync('token', token);
    wx.setStorageSync('userInfo', user);
    wx.setStorageSync('userId', user.userId);
    
    // 显示成功提示
    wx.showToast({
      title: '注册成功',
      icon: 'success',
      duration: 2000
    });
    
    // 延迟跳转到首页
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }, 1500);
  },
  
  // 跳转到登录页面
  onGoToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },
  
  // 页面卸载
  onUnload() {
    // 清除定时器
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
    }
    
    // 清理数据
    this.setData({
      isLoading: false,
      isGettingCode: false,
      countdown: 60,
      errorMessage: ''
    });
  },
  
  // 分享功能
  onShareAppMessage() {
    return {
      title: '美食小程序 - 用户注册',
      path: '/pages/register/register'
    };
  }
});