// Records page JS controller
Page({
  data: {
    records: [],
    activeTab: 'records',
    stylesConfig: {
      funny: { name: '幽默' },
      sincere: { name: '真诚' },
      professional: { name: '专业' },
      poetry: { name: '诗词' },
      aesthetic: { name: '唯美' },
      romantic: { name: '浪漫' }
    }
  },

  onShow() {
    this.setData({
      activeTab: 'records'
    });
    this.loadRecords();
  },

  loadRecords() {
    const rawRecords = wx.getStorageSync('records') || [];
    // Sort by createdAt descending
    const sorted = rawRecords.sort((a, b) => b.createdAt - a.createdAt);
    
    // Format times
    const formatted = sorted.map(item => {
      return {
        ...item,
        timeFormatted: this.formatTime(new Date(item.createdAt))
      };
    });

    this.setData({
      records: formatted
    });
  },

  formatTime(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  onCopy(e) {
    const id = e.currentTarget.dataset.id;
    const record = this.data.records.find(r => r.id === id);
    if (!record) return;

    wx.setClipboardData({
      data: record.resultText,
      success() {
        wx.showToast({
          title: '已复制结果',
          icon: 'success'
        });
      }
    });
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    const that = this;

    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这条记录吗？',
      success(res) {
        if (res.confirm) {
          let rawRecords = wx.getStorageSync('records') || [];
          rawRecords = rawRecords.filter(r => r.id !== id);
          wx.setStorageSync('records', rawRecords);
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
          
          that.loadRecords();
        }
      }
    });
  },

  goHome() {
    wx.redirectTo({
      url: '/pages/home/home'
    });
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
