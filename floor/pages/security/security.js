/**
 * 安全设置页面逻辑
 */
var app = getApp();

Page({
  data: {
    userId: null,
    phoneBound: false,
    emailBound: false,
    passwordSet: true,
    bindWechat: false,
    securityLevel: 'low',
    securityLevelText: '低',
    levelPercent: 20,
    securityTip: '建议绑定手机号和邮箱以提高账号安全'
  },

  onLoad: function() {
    this.setData({
      userId: app.globalData.userId || 1
    });
    this.loadSecurityInfo();
  },

  // 计算安全等级
  calcSecurityLevel: function() {
    var score = 0;
    if (this.data.phoneBound) score += 30;
    if (this.data.emailBound) score += 30;
    if (this.data.passwordSet) score += 25;
    if (this.data.bindWechat) score += 15;

    var level = 'low';
    var text = '低';
    var tip = '建议绑定手机号和邮箱以提高账号安全';
    if (score >= 80) {
      level = 'high'; text = '高'; tip = '您的账号安全性很好';
    } else if (score >= 50) {
      level = 'medium'; text = '中'; tip = '建议绑定更多方式以提高安全';
    }

    this.setData({
      securityLevel: level,
      securityLevelText: text,
      levelPercent: Math.max(score, 20),
      securityTip: tip
    });
  },

  // 加载安全信息
  loadSecurityInfo: function() {
    var self = this;
    var userId = this.data.userId;
    if (!userId) return;

    app.authRequest({
      url: '/user/' + userId,
      method: 'GET'
    }).then(function(res) {
      if (res && res.code === 200 && res.data) {
        self.setData({
          phoneBound: !!res.data.phone,
          emailBound: !!res.data.email
        });
        self.calcSecurityLevel();
      }
    }).catch(function(err) {
      console.error('获取安全信息失败', err);
      self.calcSecurityLevel();
    });
  },

  // 修改密码
  onChangePassword: function() {
    var self = this;
    wx.showModal({
      title: '修改密码',
      editable: true,
      placeholderText: '请输入新密码（至少6位）',
      success: function(res) {
        if (res.confirm && res.content) {
          if (res.content.length >= 6) {
            self.updatePassword(res.content);
          } else {
            wx.showToast({ title: '密码至少6位', icon: 'none' });
          }
        }
      }
    });
  },

  // 更新密码
  updatePassword: function(newPassword) {
    app.authRequest({
      url: '/user/' + this.data.userId + '/password',
      method: 'PUT',
      data: { password: newPassword }
    }).then(function(res) {
      if (res && res.code === 200) {
        wx.showToast({ title: '密码修改成功', icon: 'success' });
      } else {
        wx.showToast({ title: res.message || '修改失败', icon: 'none' });
      }
    }).catch(function(err) {
      console.error('修改密码失败', err);
      wx.showToast({ title: '修改失败', icon: 'none' });
    });
  },

  // 绑定/修改手机号
  onBindPhone: function() {
    var self = this;
    wx.showModal({
      title: '绑定手机号',
      editable: true,
      placeholderText: '请输入手机号',
      success: function(res) {
        if (res.confirm && res.content) {
          if (/^1[3-9]\d{9}$/.test(res.content)) {
            self.bindPhone(res.content);
          } else {
            wx.showToast({ title: '手机号格式不正确', icon: 'none' });
          }
        }
      }
    });
  },

  // 绑定手机号
  bindPhone: function(phone) {
    var self = this;
    app.authRequest({
      url: '/user/' + this.data.userId,
      method: 'PUT',
      data: { phone: phone }
    }).then(function(res) {
      if (res && res.code === 200) {
        self.setData({ phoneBound: true });
        wx.showToast({ title: '手机号绑定成功', icon: 'success' });
      } else {
        wx.showToast({ title: '绑定失败', icon: 'none' });
      }
    }).catch(function(err) {
      console.error('绑定手机号失败', err);
      wx.showToast({ title: '绑定失败', icon: 'none' });
    });
  },

  // 绑定邮箱
  onBindEmail: function() {
    var self = this;
    wx.showModal({
      title: '绑定邮箱',
      editable: true,
      placeholderText: '请输入邮箱地址',
      success: function(res) {
        if (res.confirm && res.content) {
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(res.content)) {
            self.bindEmail(res.content);
          } else {
            wx.showToast({ title: '邮箱格式不正确', icon: 'none' });
          }
        }
      }
    });
  },

  // 绑定邮箱
  bindEmail: function(email) {
    var self = this;
    app.authRequest({
      url: '/user/' + this.data.userId,
      method: 'PUT',
      data: { email: email }
    }).then(function(res) {
      if (res && res.code === 200) {
        self.setData({ emailBound: true });
        wx.showToast({ title: '邮箱绑定成功', icon: 'success' });
      } else {
        wx.showToast({ title: '绑定失败', icon: 'none' });
      }
    }).catch(function(err) {
      console.error('绑定邮箱失败', err);
      wx.showToast({ title: '绑定失败', icon: 'none' });
    });
  },

  // 绑定微信
  onBindWechat: function() {
    // 微信小程序中，微信绑定通常由微信自动处理
    wx.showToast({ title: '微信已自动绑定', icon: 'success' });
    this.setData({ bindWechat: true });
  },

  // 登录设备管理
  onDeviceManagement: function() {
    wx.navigateTo({
      url: '/pages/device-management/device-management'
    });
  },

  // 返回
  onBack: function() {
    wx.navigateBack();
  }
});
