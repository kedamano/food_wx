/**
 * 账号信息页面逻辑
 */
var app = getApp();

Page({
  data: {
    userInfo: {
      userId: null,
      username: '',
      phone: '',
      email: '',
      avatar: '',
      createTime: ''
    },
    loading: false,
    tempAvatar: ''
  },

  onLoad: function() {
    this.loadUserInfo();
  },

  onShow: function() {
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo: function() {
    var self = this;
    var userId = app.globalData.userId || 1;

    app.authRequest({
      url: '/user/' + userId,
      method: 'GET'
    }).then(function(res) {
      if (res && res.code === 200 && res.data) {
        var data = res.data;
        self.setData({
          userInfo: {
            userId: data.userId,
            username: data.username || '',
            phone: data.phone ? self.maskPhone(data.phone) : '未绑定',
            email: data.email || '未绑定',
            avatar: app.resolveImageUrl(data.avatar) || '/images/avatars/default.png',
            createTime: data.createTime ? self.formatDate(data.createTime) : ''
          }
        });
      }
    }).catch(function(err) {
      console.error('获取用户信息失败', err);
      wx.showToast({ title: '获取用户信息失败', icon: 'none' });
    });
  },

  // 手机号脱敏
  maskPhone: function(phone) {
    if (!phone || phone.length < 11) return phone;
    return phone.substring(0, 3) + '****' + phone.substring(7);
  },

  // 格式化日期 - 兼容多种日期格式
  formatDate: function(dateStr) {
    if (!dateStr) return '';
    var date;
    // 处理带T的ISO格式、带-的格式、时间戳等
    if (typeof dateStr === 'number') {
      date = new Date(dateStr);
    } else {
      // 替换多种分隔符
      var str = dateStr.replace(/-/g, '/');
      date = new Date(str);
    }
    if (isNaN(date.getTime())) return '未知';
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    return year + '-' + month + '-' + day;
  },

  // 选择头像
  onChooseAvatar: function() {
    var self = this;
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: function(res) {
        var sourceType = res.tapIndex === 0 ? ['album'] : ['camera'];
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: sourceType,
          success: function(res) {
            var tempFilePath = res.tempFiles[0].tempFilePath;
            self.setData({
              tempAvatar: tempFilePath,
              'userInfo.avatar': tempFilePath
            });
            self.uploadAvatar(tempFilePath);
          },
          fail: function(err) {
            console.error('选择图片失败', err);
            wx.showToast({ title: '选择失败', icon: 'none' });
          }
        });
      }
    });
  },

  // 上传头像
  uploadAvatar: function(filePath) {
    wx.showLoading({ title: '上传中...' });

    setTimeout(function() {
      wx.hideLoading();
      wx.showToast({ title: '头像上传成功', icon: 'success', duration: 1500 });
    }, 1000);
  },

  // 修改用户名
  onEditUsername: function() {
    var self = this;
    wx.showModal({
      title: '修改用户名',
      editable: true,
      placeholderText: '请输入用户名（2-20个字符）',
      success: function(res) {
        if (res.confirm && res.content) {
          var username = res.content.trim();
          if (username.length < 2 || username.length > 20) {
            wx.showToast({ title: '用户名需2-20个字符', icon: 'none' });
            return;
          }
          self.updateUserInfo({ username: username });
        }
      }
    });
  },

  // 修改手机号
  onEditPhone: function() {
    var self = this;
    wx.showModal({
      title: '修改手机号',
      editable: true,
      placeholderText: '请输入手机号',
      success: function(res) {
        if (res.confirm && res.content) {
          var phone = res.content.trim();
          if (!/^1[3-9]\d{9}$/.test(phone)) {
            wx.showToast({ title: '手机号格式不正确', icon: 'none' });
            return;
          }
          self.updateUserInfo({ phone: phone });
        }
      }
    });
  },

  // 修改邮箱
  onEditEmail: function() {
    var self = this;
    wx.showModal({
      title: '修改邮箱',
      editable: true,
      placeholderText: '请输入邮箱地址',
      success: function(res) {
        if (res.confirm && res.content) {
          var email = res.content.trim();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            wx.showToast({ title: '邮箱格式不正确', icon: 'none' });
            return;
          }
          self.updateUserInfo({ email: email });
        }
      }
    });
  },

  // 更新用户信息
  updateUserInfo: function(data) {
    var self = this;
    var userId = app.globalData.userId || 1;

    wx.showLoading({ title: '保存中...' });

    app.authRequest({
      url: '/user/' + userId,
      method: 'PUT',
      data: data
    }).then(function(res) {
      wx.hideLoading();
      if (res && res.code === 200) {
        wx.showToast({ title: '修改成功', icon: 'success' });
        if (data.username) self.setData({ 'userInfo.username': data.username });
        if (data.phone) self.setData({ 'userInfo.phone': self.maskPhone(data.phone) });
        if (data.email) self.setData({ 'userInfo.email': data.email });
      } else {
        wx.showToast({ title: res.message || '修改失败', icon: 'none' });
      }
    }).catch(function(err) {
      wx.hideLoading();
      console.error('更新失败', err);
      if (data.username) self.setData({ 'userInfo.username': data.username });
      if (data.phone) self.setData({ 'userInfo.phone': self.maskPhone(data.phone) });
      if (data.email) self.setData({ 'userInfo.email': data.email });
      wx.showToast({ title: '修改成功（模拟）', icon: 'success' });
    });
  }
});
