/**
 * 意见反馈页面逻辑
 */
const app = getApp();

Page({
  data: {
    feedbackTypes: [
      { id: 1, name: '功能建议', icon: 'fa-lightbulb' },
      { id: 2, name: 'Bug反馈', icon: 'fa-bug' },
      { id: 3, name: '体验问题', icon: 'fa-mobile-alt' },
      { id: 4, name: '其他', icon: 'fa-edit' }
    ],
    selectedType: null,
    content: '',
    contactInfo: '',
    images: [],
    maxImages: 3,
    submitting: false
  },

  onLoad() {
    // 默认选择第一个类型
    this.setData({
      selectedType: 1
    });
  },

  // 选择反馈类型
  onSelectType(e) {
    const typeId = e.currentTarget.dataset.id;
    this.setData({
      selectedType: typeId
    });
  },

  // 输入反馈内容
  onInputContent(e) {
    this.setData({
      content: e.detail.value
    });
  },

  // 输入联系方式
  onInputContact(e) {
    this.setData({
      contactInfo: e.detail.value
    });
  },

  // 添加图片
  onAddImage() {
    if (this.data.images.length >= this.data.maxImages) {
      wx.showToast({ title: `最多上传${this.data.maxImages}张图片`, icon: 'none' });
      return;
    }

    wx.chooseMedia({
      count: this.data.maxImages - this.data.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(item => item.tempFilePath);
        this.setData({
          images: [...this.data.images, ...newImages].slice(0, this.data.maxImages)
        });
      }
    });
  },

  // 删除图片
  onRemoveImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    images.splice(index, 1);
    this.setData({ images });
  },

  // 预览图片
  onPreviewImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.images[index],
      urls: this.data.images
    });
  },

  // 提交反馈
  onSubmit() {
    const { selectedType, content, contactInfo, images } = this.data;

    // 验证
    if (!content || content.trim().length < 10) {
      wx.showToast({ title: '请输入至少10个字符的反馈内容', icon: 'none' });
      return;
    }

    if (this.data.submitting) return;

    this.setData({ submitting: true });

    // 获取当前用户ID
    const userId = app.globalData.userId || 1;

    // 构建反馈数据
    const feedbackData = {
      userId: userId,
      type: selectedType,
      content: content.trim(),
      contact: contactInfo.trim(),
      images: images
    };

    // 模拟提交（实际项目中应调用API）
    setTimeout(() => {
      // 保存到本地历史记录
      const feedbackList = wx.getStorageSync('feedbackList') || [];
      feedbackList.unshift({
        ...feedbackData,
        createTime: new Date().toISOString(),
        status: 'pending',
        id: Date.now()
      });
      wx.setStorageSync('feedbackList', feedbackList);

      this.setData({ submitting: false });

      wx.showModal({
        title: '提交成功',
        content: '感谢您的反馈，我们会尽快处理！',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
    }, 1500);
  },

  // 查看反馈历史
  onViewHistory() {
    const feedbackList = wx.getStorageSync('feedbackList') || [];

    if (feedbackList.length === 0) {
      wx.showToast({ title: '暂无反馈记录', icon: 'none' });
      return;
    }

    let message = '';
    feedbackList.slice(0, 5).forEach((item, index) => {
      const typeName = this.data.feedbackTypes.find(t => t.id === item.type)?.name || '其他';
      const statusText = item.status === 'pending' ? '处理中' : '已处理';
      const time = new Date(item.createTime).toLocaleDateString();
      message += `${index + 1}. [${typeName}] ${statusText} - ${time}\n`;
    });

    wx.showModal({
      title: '反馈历史',
      content: message || '暂无反馈记录',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 返回
  onBack() {
    wx.navigateBack();
  }
});
