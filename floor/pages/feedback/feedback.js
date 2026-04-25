/**
 * 意见反馈页面逻辑
 */
var app = getApp();

Page({
  data: {
    feedbackTypes: [
      { id: 1, name: '功能建议', iconText: '💡' },
      { id: 2, name: 'Bug反馈', iconText: '🐛' },
      { id: 3, name: '体验问题', iconText: '📱' },
      { id: 4, name: '其他', iconText: '✏️' }
    ],
    selectedType: null,
    content: '',
    contactInfo: '',
    images: [],
    maxImages: 3,
    submitting: false
  },

  onLoad: function() {
    this.setData({ selectedType: 1 });
  },

  // 选择反馈类型
  onSelectType: function(e) {
    this.setData({ selectedType: e.currentTarget.dataset.id });
  },

  // 输入反馈内容
  onInputContent: function(e) {
    this.setData({ content: e.detail.value });
  },

  // 输入联系方式
  onInputContact: function(e) {
    this.setData({ contactInfo: e.detail.value });
  },

  // 添加图片
  onAddImage: function() {
    var self = this;
    if (this.data.images.length >= this.data.maxImages) {
      wx.showToast({ title: '最多上传' + this.data.maxImages + '张图片', icon: 'none' });
      return;
    }

    wx.chooseMedia({
      count: this.data.maxImages - this.data.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        var newImages = res.tempFiles.map(function(item) { return item.tempFilePath; });
        self.setData({
          images: self.data.images.concat(newImages).slice(0, self.data.maxImages)
        });
      }
    });
  },

  // 删除图片
  onRemoveImage: function(e) {
    var index = e.currentTarget.dataset.index;
    var images = this.data.images;
    images.splice(index, 1);
    this.setData({ images: images });
  },

  // 预览图片
  onPreviewImage: function(e) {
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.images[index],
      urls: this.data.images
    });
  },

  // 提交反馈
  onSubmit: function() {
    var self = this;
    var selectedType = this.data.selectedType;
    var content = this.data.content;
    var contactInfo = this.data.contactInfo;
    var images = this.data.images;

    if (!content || content.trim().length < 10) {
      wx.showToast({ title: '请输入至少10个字符的反馈内容', icon: 'none' });
      return;
    }

    if (this.data.submitting) return;
    this.setData({ submitting: true });

    var app = getApp();
    var userId = app.globalData.userId || 0;

    var feedbackData = {
      userId: userId,
      type: selectedType,
      content: content.trim(),
      contact: contactInfo.trim()
    };

    wx.showLoading({ title: '提交中...' });

    app.authRequest({
      url: '/feedback',
      method: 'POST',
      data: feedbackData
    }).then(function(res) {
      wx.hideLoading();
      self.setData({ submitting: false });
      if (res && res.code === 200) {
        wx.showModal({
          title: '提交成功',
          content: '感谢您的反馈，我们会尽快处理！',
          showCancel: false,
          success: function() { wx.navigateBack(); }
        });
      } else {
        wx.showToast({ title: res.message || '提交失败', icon: 'none' });
      }
    }).catch(function(err) {
      wx.hideLoading();
      self.setData({ submitting: false });
      console.error('提交反馈失败', err);
      // 降级：本地存储兜底
      var feedbackList = wx.getStorageSync('feedbackList') || [];
      feedbackList.unshift({
        userId: feedbackData.userId,
        type: feedbackData.type,
        content: feedbackData.content,
        contact: feedbackData.contact,
        createTime: new Date().toISOString(),
        status: 'pending',
        id: Date.now()
      });
      wx.setStorageSync('feedbackList', feedbackList);
      wx.showModal({
        title: '提交成功',
        content: '感谢您的反馈！（已暂存本地）',
        showCancel: false,
        success: function() { wx.navigateBack(); }
      });
    });
  },

  // 查看反馈历史
  onViewHistory: function() {
    var feedbackList = wx.getStorageSync('feedbackList') || [];

    if (feedbackList.length === 0) {
      wx.showToast({ title: '暂无反馈记录', icon: 'none' });
      return;
    }

    var message = '';
    var types = this.data.feedbackTypes;
    var list = feedbackList.slice(0, 5);
    for (var fi = 0; fi < list.length; fi++) {
      var item = list[fi];
      var typeName = '其他';
      for (var i = 0; i < types.length; i++) {
        if (types[i].id === item.type) { typeName = types[i].name; break; }
      }
      var statusText = item.status === 'pending' ? '处理中' : '已处理';
      var time = new Date(item.createTime).toLocaleDateString();
      message += (fi + 1) + '. [' + typeName + '] ' + statusText + ' - ' + time + '\n';
    }

    wx.showModal({
      title: '反馈历史',
      content: message || '暂无反馈记录',
      showCancel: false,
      confirmText: '知道了'
    });
  }
});
