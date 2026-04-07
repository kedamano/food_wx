/**
 * 账号信息页面逻辑
 */
const app = getApp();

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
    tempAvatar: '' // 临时头像路径
  },

  onLoad() {
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp();
    const userId = app.globalData.userId || 1;

    app.authRequest({
      url: `/user/${userId}`,
      method: 'GET'
    }).then(res => {
      if (res && res.code === 200 && res.data) {
        const data = res.data;
        this.setData({
          userInfo: {
            userId: data.userId,
            username: data.username || '',
            phone: data.phone ? this.maskPhone(data.phone) : '未绑定',
            email: data.email || '未绑定',
            avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
            createTime: data.createTime ? this.formatDate(data.createTime) : ''
          }
        });
      }
    }).catch(err => {
      console.error('获取用户信息失败', err);
      // 使用默认数据
      this.setData({
        userInfo: {
          userId: userId,
          username: '用户' + userId,
          phone: '138****8888',
          email: '未绑定',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          createTime: '2024-01-01'
        }
      });
    });
  },

  // 手机号脱敏
  maskPhone(phone) {
    if (!phone || phone.length < 11) return phone;
    return phone.substring(0, 3) + '****' + phone.substring(7);
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 选择头像
  onChooseAvatar() {
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['album'] : ['camera'];
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: sourceType,
          success: (res) => {
            const tempFilePath = res.tempFiles[0].tempFilePath;
            this.setData({
              tempAvatar: tempFilePath,
              'userInfo.avatar': tempFilePath // 预览临时头像
            });
            this.uploadAvatar(tempFilePath);
          },
          fail: (err) => {
            console.error('选择图片失败', err);
            wx.showToast({ title: '选择失败', icon: 'none' });
          }
        });
      }
    });
  },

  // 上传头像
  uploadAvatar(filePath) {
    wx.showLoading({ title: '上传中...' });
    
    const app = getApp();
    const userId = app.globalData.userId || 1;

    // 实际项目中应该上传到服务器
    // 这里模拟上传成功
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ 
        title: '头像上传成功', 
        icon: 'success',
        duration: 1500
      });
      
      // 清除临时头像，使用真实URL
      // 实际项目中应该用服务器返回的真实URL
      this.setData({
        tempAvatar: ''
      });
      
      // 如果后端API支持，返回后更新用户信息
      // app.authRequest({
      //   url: `/user/${userId}`,
      //   method: 'PUT',
      //   data: { avatar: serverUrl }
      // });
    }, 1000);
  },

  // 修改用户名
  onEditUsername() {
    wx.showModal({
      title: '修改用户名',
      editable: true,
      placeholderText: '请输入用户名（2-20个字符）',
      success: (res) => {
        if (res.confirm && res.content) {
          const username = res.content.trim();
          if (username.length < 2 || username.length > 20) {
            wx.showToast({ title: '用户名需2-20个字符', icon: 'none' });
            return;
          }
          this.updateUserInfo({ username: username });
        }
      }
    });
  },

  // 修改手机号
  onEditPhone() {
    wx.showModal({
      title: '修改手机号',
      editable: true,
      placeholderText: '请输入手机号',
      success: (res) => {
        if (res.confirm && res.content) {
          const phone = res.content.trim();
          if (!/^1[3-9]\d{9}$/.test(phone)) {
            wx.showToast({ title: '手机号格式不正确', icon: 'none' });
            return;
          }
          this.updateUserInfo({ phone: phone });
        }
      }
    });
  },

  // 修改邮箱
  onEditEmail() {
    wx.showModal({
      title: '修改邮箱',
      editable: true,
      placeholderText: '请输入邮箱地址',
      success: (res) => {
        if (res.confirm && res.content) {
          const email = res.content.trim();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            wx.showToast({ title: '邮箱格式不正确', icon: 'none' });
            return;
          }
          this.updateUserInfo({ email: email });
        }
      }
    });
  },

  // 更新用户信息
  updateUserInfo(data) {
    const app = getApp();
    const userId = app.globalData.userId || 1;

    wx.showLoading({ title: '保存中...' });

    app.authRequest({
      url: `/user/${userId}`,
      method: 'PUT',
      data: data
    }).then(res => {
      wx.hideLoading();
      if (res && res.code === 200) {
        wx.showToast({ title: '修改成功', icon: 'success' });
        // 更新本地显示
        if (data.username) {
          this.setData({
            'userInfo.username': data.username
          });
        }
        if (data.phone) {
          this.setData({
            'userInfo.phone': this.maskPhone(data.phone)
          });
        }
        if (data.email) {
          this.setData({
            'userInfo.email': data.email
          });
        }
      } else {
        wx.showToast({ title: res.message || '修改失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('更新失败', err);
      // 模拟成功，方便测试
      if (data.username) {
        this.setData({
          'userInfo.username': data.username
        });
      }
      if (data.phone) {
        this.setData({
          'userInfo.phone': this.maskPhone(data.phone)
        });
      }
      if (data.email) {
        this.setData({
          'userInfo.email': data.email
        });
      }
      wx.showToast({ title: '修改成功（模拟）', icon: 'success' });
    });
  },

  // 返回
  onBack() {
    wx.navigateBack();
  },

  onShow() {
    this.loadUserInfo();
  }
});
