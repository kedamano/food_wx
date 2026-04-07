Page({
  data: {
    topics: [
      {
        id: 1,
        title: '美食测评',
        description: '分享你的美食体验',
        icon: 'fa-star',
        posts: 1234,
        followers: 5678
      },
      {
        id: 2,
        title: '食谱分享',
        description: '交流烹饪心得',
        icon: 'fa-book',
        posts: 2345,
        followers: 6789
      },
      {
        id: 3,
        title: '餐厅推荐',
        description: '发现身边美食',
        icon: 'fa-map-marker',
        posts: 3456,
        followers: 7890
      }
    ]
  },

  onTopicTap(e) {
    const topic = e.currentTarget.dataset.topic;
    console.log('点击话题：', topic);
    wx.showToast({
      title: `进入${topic}话题`,
      icon: 'none'
    });
  },

  onLoad() {
    console.log('话题页面加载');
  }
});