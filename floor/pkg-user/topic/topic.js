// 话题页：真实数据 + 详情跳转
var app = getApp();

Page({
  data: {
    topics: [],
    isLoading: true
  },

  onLoad: function() {
    this.loadTopics();
  },

  onPullDownRefresh: function() {
    this.loadTopics();
    wx.stopPullDownRefresh();
  },

  loadTopics: function() {
    var self = this;
    app.authRequest({
      url: '/topic/list',
      method: 'GET'
    }).then(function(res) {
      var topics = [];
      if (res && res.code === 200 && Array.isArray(res.data)) {
        for (var i = 0; i < res.data.length; i++) {
          var t = res.data[i];
          topics.push({
            id: t.topicId,
            title: t.title,
            description: t.description || '',
            cover: app.resolveImageUrl(t.cover) || '',
            icon: 'star-fill',
            posts: t.participantCount || 0,
            followers: t.participantCount || 0
          });
        }
      }
      self.setData({ topics: topics, isLoading: false });
    }).catch(function() {
      self.setData({ topics: [], isLoading: false });
    });
  },

  onTopicTap: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/topic-detail/topic-detail?id=' + id
    });
  }
});
