// 登录页面逻辑
Page({
  data: {
    // 表单数据
    username: '',
    password: '',
    rememberMe: false,
    showPassword: false,
    
    // 状态
    isLoading: false,
    errorMessage: '',
    
    // 配置
    autoLogin: false
  },
  
  // 页面加载
  onLoad(options) {
    console.log('登录页面加载，参数：', options);
    
    // 检查是否已经登录
    this.checkLoginStatus();
    
    // 自动填充记住的用户名
    this.loadRememberedUser();
  },
  
  // 检查登录状态
  checkLoginStatus() {
    const app = getApp();
    const token = app.globalData.token;
    
    if (token) {
      // 已登录，跳转到首页
      wx.showToast({
        title: '已登录，正在跳转',
        icon: 'none'
      });
      
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    }
  },
  
  // 加载记住的用户
  loadRememberedUser() {
    const rememberedUser = wx.getStorageSync('rememberedUser');
    if (rememberedUser && rememberedUser.username) {
      this.setData({
        username: rememberedUser.username,
        rememberMe: true
      });
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
  
  // 切换密码可见性
  onTogglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },
  
  // 切换记住我
  onToggleRemember() {
    this.setData({
      rememberMe: !this.data.rememberMe
    });
  },
  
  // 忘记密码
  onForgotPassword() {
    wx.navigateTo({
      url: '/pages/forgot-password/forgot-password'
    });
  },
  
  // 微信登录
  onWeChatLogin() {
    wx.showLoading({
      title: '微信登录中...'
    });
    
    // 调用微信登录API
    wx.login({
      success: (res) => {
        console.log('微信登录成功：', res);
        
        if (res.code) {
          // 发送到后端验证
          this.weChatLoginToBackend(res.code);
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
  
  // 微信登录后端验证
  weChatLoginToBackend(code) {
    wx.request({
      url: '/user/wechat-login',
      method: 'POST',
      data: {
        code: code
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          // 登录成功
          this.handleLoginSuccess(res.data.data);
        } else {
          wx.showToast({
            title: res.data.message || '微信登录失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('微信登录后端请求失败：', err);
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 登录表单提交
  onLoginSubmit(e) {
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
      title: '登录中...'
    });
    
    // 调用登录API
    this.callLoginAPI();
  },
  
  // 验证表单
  validateForm() {
    const { username, password } = this.data;
    
    if (!username || username.trim() === '') {
      this.showError('请输入用户名');
      return false;
    }
    
    if (!password || password.trim() === '') {
      this.showError('请输入密码');
      return false;
    }
    
    if (password.length < 6) {
      this.showError('密码长度至少为6位');
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
  
  // 调用登录 API
  callLoginAPI() {
    const { username, password } = this.data;
      
    // 使用新的 API 系统
    const app = getApp();
    console.log('准备调用登录 API，用户名:', username);
    
    app.authRequest({
      url: '/user/login',  // 使用相对路径，自动添加/api 前缀
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        username: username.trim(),
        password: password
      },
      success: (res) => {
        console.log('=== 进入 success 回调 ===');
        console.log('登录响应：', res);
        console.log('res.code:', res?.code);
          
        // 响应拦截器已经处理过，直接检查 res
        if (res && res.code === 200) {
          console.log('code === 200，准备调用 handleLoginSuccess');
          // 标准格式：res 就是 data.data
          this.handleLoginSuccess(res);
        } else if (res && res.token && res.user) {
          console.log('兼容格式，直接返回 token 和 user');
          // 兼容格式：直接返回 token 和 user
          this.handleLoginSuccess(res);
        } else {
          console.log('错误响应，显示错误信息');
          // 错误响应
          this.showError(res.message || '登录失败');
        }
      },
      fail: (err) => {
        console.error('=== 进入 fail 回调 ===');
        console.error('登录请求失败：', err);
        this.showError('网络连接失败');
      }
    });
  },
  
  // 处理登录成功
  handleLoginSuccess(data) {
    console.log('handleLoginSuccess 接收到的数据：', data);
    
    // 处理数据结构：后端返回的是 {code: 200, message: '...', data: {token: '...', user: {...}}}
    const token = data.data ? data.data.token : data.token;
    const user = data.data ? data.data.user : data.user;
    
    console.log('提取的 token:', token);
    console.log('提取的 user:', user);
    
    if (!token || !user) {
      this.showError('登录数据异常');
      return;
    }
    
    // 保存 token 到全局
    const app = getApp();
    app.globalData.token = token;
    app.globalData.userInfo = user;
    app.globalData.userId = user.userId;
    
    // 保存到本地存储
    wx.setStorageSync('token', token);
    wx.setStorageSync('userInfo', user);
    wx.setStorageSync('userId', user.userId);

    // 调用 app 的登录方法
    app.userLogin(user);
    
    // 处理记住我
    if (this.data.rememberMe) {
      wx.setStorageSync('rememberedUser', {
        username: this.data.username
      });
    } else {
      wx.removeStorageSync('rememberedUser');
    }
    
    // 显示成功提示
    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500
    });
    
    // 延迟跳转到首页
    setTimeout(() => {
      // 关闭所有页面，跳转到首页
      wx.reLaunch({
        url: '/pages/index/index',
        success: () => {
          console.log('跳转到首页成功');
        },
        fail: (err) => {
          console.error('跳转到首页失败：', err);
          // 如果 reLaunch 失败，尝试 switchTab
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      });
    }, 1000);
  },
  
  // 跳转到注册页面
  onGoToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  },
  
  // 页面显示
  onShow() {
    // 清除错误提示
    if (this.data.errorMessage) {
      this.setData({ errorMessage: '' });
    }
  },
  
  // 页面卸载
  onUnload() {
    // 清理数据
    this.setData({
      isLoading: false,
      errorMessage: ''
    });
  },
  
  // 分享功能
  onShareAppMessage() {
    return {
      title: '美食小程序 - 用户登录',
      path: '/pages/login/login'
    };
  }
});