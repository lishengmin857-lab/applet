// Profile page JS controller
const app = getApp();

Page({
  data: {
    isVip: false,
    dailyRemainCount: 10,
    totalGenerateCount: 0,
    activeTab: 'profile',
    appVersion: app.globalData.appVersion,
    buildDate: app.globalData.buildDate
  },

  onShow() {
    this.setData({
      activeTab: 'profile'
    });
    this.loadUserData();
  },

  loadUserData() {
    const isVip = wx.getStorageSync('isVip') || false;
    const dailyRemainCount = wx.getStorageSync('dailyRemainCount') !== '' ? wx.getStorageSync('dailyRemainCount') : 10;
    const totalGenerateCount = wx.getStorageSync('totalGenerateCount') || 0;

    this.setData({
      isVip,
      dailyRemainCount,
      totalGenerateCount
    });
  },

  toggleVip() {
    const currentVip = this.data.isVip;
    const newVip = !currentVip;
    
    wx.setStorageSync('isVip', newVip);
    this.setData({
      isVip: newVip
    });

    wx.showToast({
      title: newVip ? '开通成功！享受无限生成' : '已恢复为免费体验会员',
      icon: 'none',
      duration: 2000
    });
  },

  showGuide() {
    wx.showModal({
      title: '使用指南',
      content: '1. 输入初稿：输入你想修改的文案\n2. 选择风格：包括幽默、真诚、专业、诗词、唯美、浪漫等多种不同调性风格\n3. 开始润色：点击按钮一键输出结果，直接复制使用！',
      showCancel: false,
      confirmText: '知道啦'
    });
  },

  onShareAppMessage() {
    return {
      title: '发现一个超好用的文案灵感与排版润色工具，让文字更有力量！',
      path: '/pages/home/home'
    };
  },

  // Navigation redirect handler
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    const routes = {
      home: '/pages/home/home',
      videoparse: '/pages/videoparse/videoparse',
      polish: '/pages/polish/polish',
      records: '/pages/records/records',
      profile: '/pages/profile/profile'
    };
    
    const targetUrl = routes[tab];
    if (targetUrl && tab !== this.data.activeTab) {
      wx.redirectTo({
        url: targetUrl
      });
    }
  }
});
