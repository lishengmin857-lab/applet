// Polish page JS controller
const app = getApp();

Page({
  data: {
    inputText: '',
    selectedStyle: 'sincere',
    selectedStyleName: '真诚',
    selectedMaxChars: 50,
    lengthOptions: [50, 100, 200, 300],
    loading: false,
    showResultModal: false,
    currentResult: null,
    activeTab: 'polish'
  },

  onLoad(options) {
    if (wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }

    // Check prefilled text from Tab 1 or route params
    let text = '';
    if (options && options.text) {
      try {
        text = decodeURIComponent(options.text);
      } catch (e) {
        text = options.text;
      }
    } else if (app && app.globalData && app.globalData.prefillPolishText) {
      text = app.globalData.prefillPolishText;
      app.globalData.prefillPolishText = '';
    }

    if (text) {
      this.setData({
        inputText: text
      });
    }
  },

  onShow() {
    this.setData({
      activeTab: 'polish',
      loading: false
    });

    if (app && app.globalData && app.globalData.prefillPolishText) {
      this.setData({
        inputText: app.globalData.prefillPolishText
      });
      app.globalData.prefillPolishText = '';
    }
  },

  onInput(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  onClear() {
    this.setData({
      inputText: ''
    });
    wx.showToast({
      title: '已清空内容',
      icon: 'success'
    });
  },

  onPaste() {
    const that = this;
    wx.getClipboardData({
      success(res) {
        if (res.data) {
          that.setData({
            inputText: res.data
          });
          wx.showToast({
            title: '已粘贴文本',
            icon: 'success'
          });
        } else {
          that.mockPaste();
        }
      },
      fail() {
        that.mockPaste();
      }
    });
  },

  mockPaste() {
    const mockTexts = [
      "刚做完今天的工作汇报PPT，感觉整个人都虚脱了。每天都在写这些虚头巴脑的东西，真的有意义吗？想辞职，但是看看银行卡余额，还是默默写代码吧。",
      "今天去打卡了一家超级好吃的螺蛳粉店，汤底很浓，配料很足，就是排队排了半小时，太折磨了。不过吃完之后觉得一切都值了，强烈推荐大家去！",
      "新入手的这款无线降噪耳机，音质真的惊艳到我了！戴上之后整个世界都安静了，而且戴久了耳朵一点都不疼，续航也超强，简直是数码党的福音。"
    ];
    const randText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
    this.setData({
      inputText: randText
    });
    wx.showToast({
      title: '已粘贴样本文案',
      icon: 'none'
    });
  },

  onSelectStyle(e) {
    const style = e.currentTarget.dataset.style;
    const names = {
      funny: '幽默',
      sincere: '真诚',
      professional: '专业',
      poetry: '诗词',
      aesthetic: '唯美',
      romantic: '浪漫'
    };
    this.setData({
      selectedStyle: style,
      selectedStyleName: names[style]
    });
  },

  onSelectLength(e) {
    const maxChars = Number(e.currentTarget.dataset.length);
    if (!this.data.lengthOptions.includes(maxChars)) {
      return;
    }
    this.setData({
      selectedMaxChars: maxChars
    });
  },

  onGenerate() {
    const text = this.data.inputText.trim();
    
    if (!text) {
      wx.showToast({
        title: '请输入文案',
        icon: 'none'
      });
      return;
    }
    if (text.length < 3) {
      wx.showToast({
        title: '文案过短哦',
        icon: 'none'
      });
      return;
    }

    const isVip = wx.getStorageSync('isVip') || false;
    const dailyRemainCount = wx.getStorageSync('dailyRemainCount') !== '' ? wx.getStorageSync('dailyRemainCount') : 10;
    
    if (!isVip && dailyRemainCount <= 0) {
      wx.showModal({
        title: '额度已用完',
        content: '今日免费生成次数已用完，请明天再来使用。',
        showCancel: false,
        confirmText: '知道了'
      });
      return;
    }

    this.setData({
      loading: true
    });

    this.requestGenerateCopy({
      inputText: text,
      style: this.data.selectedStyle,
      maxChars: this.data.selectedMaxChars
    }).then((result) => {
      const newRecord = {
        id: result.id || Date.now().toString(),
        inputText: text,
        resultText: result.resultText,
        style: this.data.selectedStyle,
        isFavorite: false,
        createdAt: Date.now()
      };

      this.saveGeneratedRecord(newRecord, { isVip, dailyRemainCount });
      this.setData({
        loading: false,
        showResultModal: true,
        currentResult: newRecord
      });
    }).catch((error) => {
      this.setData({ loading: false });
      const message = error.message || '生成失败，请稍后再试';
      if (message.length > 18) {
        wx.showModal({
          title: '生成失败',
          content: message,
          showCancel: false,
          confirmText: '知道了'
        });
      } else {
        wx.showToast({
          title: message,
          icon: 'none'
        });
      }
    });
  },

  requestGenerateCopy(payload) {
    const apiBaseUrl = String(app.globalData.apiBaseUrl || '').replace(/\/+$/, '');
    if (!apiBaseUrl || apiBaseUrl.indexOf('your-domain.com') !== -1) {
      return Promise.reject(new Error('请先配置接口域名'));
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${apiBaseUrl}/api/v1/miniapp/copy/generate`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: payload,
        timeout: 60000,
        success(res) {
          const data = res.data || {};
          if (res.statusCode >= 200 && res.statusCode < 300 && data.resultText) {
            resolve(data);
            return;
          }
          console.log('wx.request generate response error', {
            statusCode: res.statusCode,
            data
          });
          reject(new Error(data.error || data.message || `生成失败(${res.statusCode})`));
        },
        fail(err) {
          console.log('wx.request generate fail', err);
          reject(new Error(err.errMsg || '网络异常，请稍后再试'));
        }
      });
    });
  },

  saveGeneratedRecord(newRecord, quotaState) {
    let records = wx.getStorageSync('records') || [];
    records.push(newRecord);
    wx.setStorageSync('records', records);

    if (!quotaState.isVip) {
      wx.setStorageSync('dailyRemainCount', quotaState.dailyRemainCount - 1);
    }

    const totalGenerateCount = (wx.getStorageSync('totalGenerateCount') || 0) + 1;
    wx.setStorageSync('totalGenerateCount', totalGenerateCount);
  },

  onCopyResult() {
    if (!this.data.currentResult) return;
    wx.setClipboardData({
      data: this.data.currentResult.resultText,
      success() {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      }
    });
  },

  onRegenerate() {
    this.setData({
      showResultModal: false
    });
    this.onGenerate();
  },

  onCloseModal() {
    this.setData({
      showResultModal: false,
      currentResult: null
    });
  },

  onShowGuide() {
    wx.showModal({
      title: '使用指南',
      content: '1. 输入初稿：输入你想修改的文案\n2. 选择风格：幽默（吸睛段子）、真诚（情感表述）、专业（结构化分析）、诗词、唯美、浪漫\n3. 开始润色：点击按钮一键输出结果，直接复制使用！',
      showCancel: false,
      confirmText: '知道啦'
    });
  },

  onShareAppMessage() {
    return {
      title: '文案润色工坊 - 让文字更有力量',
      path: '/pages/polish/polish'
    };
  },

  onShareTimeline() {
    return {
      title: '文案润色工坊 - 让文字更有力量'
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
