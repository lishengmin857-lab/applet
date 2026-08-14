App({
  onLaunch() {
    this.initStorage();
  },

  initStorage() {
    // Check daily quota reset
    const today = new Date().toDateString();
    const lastUseDate = wx.getStorageSync('lastUseDate') || '';

    if (lastUseDate !== today) {
      wx.setStorageSync('lastUseDate', today);
      wx.setStorageSync('dailyRemainCount', 10);
    }

    // Initialize empty records if they don't exist
    if (!wx.getStorageSync('records')) {
      wx.setStorageSync('records', []);
    }

    // Initialize empty favorites if they don't exist
    if (!wx.getStorageSync('favorites')) {
      wx.setStorageSync('favorites', []);
    }

    // Initialize user metadata
    if (wx.getStorageSync('totalGenerateCount') === '') {
      wx.setStorageSync('totalGenerateCount', 0);
    }
    if (wx.getStorageSync('isVip') === '') {
      wx.setStorageSync('isVip', false);
    }
  },

  globalData: {
    userInfo: null,
    appVersion: '1.0.1',
    buildDate: '2026.08.12',
    // apiBaseUrl: 'http://127.0.0.1:3100'
    apiBaseUrl: 'https://xiezuozhushou.site'
  }
});
