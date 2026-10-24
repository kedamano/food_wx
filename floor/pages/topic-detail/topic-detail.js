// 话题详情：话题信息 + 参与商家
var app = getApp();

Page({
  data: {
    topic: null,
    stores: [],
    isLoading: true
  },

  onLoad: function(options) {
    var topicId = options.id;
    if (!topicId) {
      wx.navigateBack();
      return;
    }
    var self = this;
    app.authRequest({
      url: '/topic/' + topicId,
      method: 'GET'
    }).then(function(res) {
      if (res && res.code === 200 && res.data) {
        var t = res.data;
        var stores = [];
        for (var i = 0; i < (t.stores || []).length; i++) {
          var st = t.stores[i];
          stores.push({
            id: st.storeId,
            name: st.storeName,
            logo: app.resolveImageUrl(st.logo) || '',
            rating: st.rating || 0,
            address: st.address || ''
          });
        }
        self.setData({
          topic: {
            id: t.topicId,
            title: t.title,
            description: t.description || '',
            cover: app.resolveImageUrl(t.cover) || '',
            followers: t.participantCount || 0
          },
          stores: stores,
          isLoading: false
        });
        wx.setNavigationBarTitle({ title: t.title || '话题详情' });
      } else {
        self.setData({ isLoading: false });
        wx.showToast({ title: (res && res.message) || '话题不存在', icon: 'none' });
      }
    }).catch(function() {
      self.setData({ isLoading: false });
    });
  },

  onJoinTap: function() {
    var self = this;
    var topic = this.data.topic;
    if (!topic) return;
    app.authRequest({
      url: '/topic/' + topic.id + '/join',
      method: 'POST'
    }).then(function(res) {
      if (res && res.code === 200) {
        self.setData({ 'topic.followers': topic.followers + 1 });
        wx.showToast({ title: '已参与', icon: 'success' });
      } else {
        wx.showToast({ title: (res && res.message) || '参与失败', icon: 'none' });
      }
    }).catch(function() {
      wx.showToast({ title: '网络异常', icon: 'none' });
    });
  },

  onStoreTap: function(e) {
    wx.navigateTo({ url: '/pages/store-detail/store-detail?storeId=' + e.currentTarget.dataset.id });
  }
});
