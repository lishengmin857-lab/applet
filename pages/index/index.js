// Home page JS controller
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
    activeTab: 'home'
  },

  onLoad() {
    if (wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }
  },

  onShow() {
    this.setData({
      activeTab: 'home',
      loading: false
    });
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

  onToggleFavorite() {
    if (!this.data.currentResult) return;
    const targetId = this.data.currentResult.id;
    let records = wx.getStorageSync('records') || [];
    let updatedResult = null;

    records = records.map(r => {
      if (r.id === targetId) {
        r.isFavorite = !r.isFavorite;
        updatedResult = r;
      }
      return r;
    });

    wx.setStorageSync('records', records);
    
    this.setData({
      currentResult: updatedResult
    });

    wx.showToast({
      title: updatedResult.isFavorite ? '已收藏' : '已取消收藏',
      icon: 'success'
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
      content: '1. 输入初稿：输入你想修改的文案\n2. 选择风格：幽默（吸睛段子）、真诚（情感表述）、专业（结构化分析）\n3. 开始润色：点击按钮一键输出结果，直接复制使用！',
      showCancel: false,
      confirmText: '知道啦'
    });
  },

  onShareAppMessage() {
    return {
      title: '文案润色大师 - 让文字更有力量',
      path: '/pages/index/index'
    };
  },

  onShareTimeline() {
    return {
      title: '文案润色大师 - 让文字更有力量'
    };
  },

  // Navigation redirect handler
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    const routes = {
      home: '/pages/index/index',
      videoparse: '/pages/videoparse/videoparse',
      records: '/pages/records/records',
      profile: '/pages/profile/profile'
    };
    
    const targetUrl = routes[tab];
    if (targetUrl && tab !== this.data.activeTab) {
      wx.redirectTo({
        url: targetUrl
      });
    }
  },

  // Mock AI Engine
  aiEngineSimulate(inputText, style) {
    let topic = "这个主题";
    if (inputText.indexOf("螺蛳粉") !== -1 || inputText.indexOf("吃") !== -1) topic = "特色美食";
    else if (inputText.indexOf("工作") !== -1 || inputText.indexOf("PPT") !== -1 || inputText.indexOf("汇报") !== -1) topic = "职场汇报";
    else if (inputText.indexOf("耳机") !== -1 || inputText.indexOf("数码") !== -1) topic = "数码体验";
    
    const cleanInput = inputText.length > 50 ? inputText.substring(0, 50) + '...' : inputText;

    if (style === 'funny') {
      return `✨ 【幽默风润色版】 ✨\n\n关于“${topic}”，我的辣评来了：\n"${cleanInput}"\n\n救命！这玩意儿简直是打工人的续命解药吧！😂 \n大可不必装得一本正经，用我的话说就是：真香！强烈建议收藏这套逻辑，不然下次你想吐槽都找不到词儿！[哈哈]\n\n💡 趣味标签：#打工人自嘲 #笑死在评论区 #趣味体验`;
    }

    if (style === 'sincere') {
      return `✨ 【真诚风润色版】 ✨\n\n“${inputText}”\n\n掏心窝子说，其实我们真正在意的，是那些被认真对待的细节。\n对于“${topic}”，试了好多别的方法都不尽人意。但这一次，它的真实温润让我切实感受到了诚意，有一种被细心呵护的微小仪式感。❤️\n\n不需要浮夸的修饰，真诚就是最直击人心的力量。\n\n💡 治愈标签：#真诚分享 #自用好物 #生活感悟`;
    }

    if (style === 'professional') {
      return `✨ 【专业风润色版】 ✨\n\n关于【${topic}】的客观梳理与逻辑评估：\n\n针对初稿：“${cleanInput}”，从专业结构上可优化为以下核心三要点：\n\n1️⃣ 效能升级：优化了传统流转中的效率瓶颈，重组了底层链路；\n2️⃣ 体验平滑：通过设计交互改良，降低了用户的使用门槛与学习成本；\n3️⃣ 投资回报：在同等预算配置下，其使用效益处于行业第一梯队。\n\n总结：这并非感性层面的尝试，而是一项旨在实现效率最大化的理性投资。\n\n💡 深度标签：#深度思考 #效率指南 #专业复盘`;
    }

    if (style === 'poetry') {
      return `✨ 【诗词风润色版】 ✨\n\n关于“${topic}”，引诗一首，尽显诗意：\n\n“${inputText}”\n\n若是将此化为墨香，便如：\n「浮生偷得半日闲，螺蛳粉里度流年。」\n「案前牍背空折腰，红尘滚滚复自嘲。」\n\n且将俗世烦扰化为笔下诗情，岁月悠长，山河无恙，万物皆可入诗入画。卷起清风，敬这烟火人间。🍂\n\n💡 诗意标签：#国风雅韵 #诗意生活 #人间烟火`;
    }

    if (style === 'aesthetic') {
      return `✨ 【唯美风润色版】 ✨\n\n关于“${topic}”的温柔呢喃：\n\n“${inputText}”\n\n在时光的褶皱里，我们总能捕捉到一抹温柔的亮色。生活里的那些琐碎与疲惫，都在温热的雾气中被悄然抚平。像是在黄昏的微风里，听一首没有歌词的钢琴曲，每个细节都闪烁着治愈人心的微光。✨\n\n愿所有的相遇，都是温柔的伏笔。\n\n💡 唯美标签：#温柔治愈 #唯美语录 #时光寄语`;
    }

    if (style === 'romantic') {
      return `✨ 【浪漫风润色版】 ✨\n\n关于“${topic}”，这是送给你的浪漫情书：\n\n“${inputText}”\n\n其实，世间所有的美好，都比不上此时此刻与你共享的浪漫。工作再累，生活再忙，只要能看到落日微光，尝到人间烟火，一切就都有了甜意。就像宇宙中两颗微尘的相遇，连呼吸都沾染了玫瑰色的香气。🌹\n\n你是生活里所有浪漫的唯一归属。\n\n💡 浪漫标签：#浪漫情书 #落日温柔 #心动信号`;
    }

    return inputText;
  }
});
