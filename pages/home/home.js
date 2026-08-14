const app = getApp();

const DAILY_QUOTES = [
  { text: "把生活调成自己喜欢的频道，一蔬一饭，皆是平淡生活里的温柔光芒。", author: "生活漫记" },
  { text: "日出有盼，日落有念。心怀浪漫宇宙，也珍惜人间日常的小确幸。", author: "晨昏随笔" },
  { text: "热爱漫无边际，生活自有分寸。愿你在每一个晨光里，都有奔赴山海的勇气。", author: "星海寄语" },
  { text: "成年人的体面，是把情绪调成静音模式，在喧嚣的世界里守住内心的从容。", author: "自律笔记" },
  { text: "慢慢来，谁不是翻山越岭去相遇。凡是过往，皆为序章。", author: "时光拾遗" },
  { text: "去吹吹晚风吧，也许晚风能吹散所有的疲惫与烦恼。", author: "治愈手账" },
  { text: "在平淡的日子里，也要把每一个细节过成值得纪念的诗篇。", author: "人间烟火" }
];

const PRESET_QUOTES = [
  // 爆款精选 / 朋友圈
  { id: '1', category: 'pyq', tag: '朋友圈', content: '今天的天气好得不像话，风很温柔，云很柔软，阳光正好。', author: '日常碎碎念' },
  { id: '2', category: 'pyq', tag: '周末', content: '开启周末治愈充电模式：咖啡已就位，快乐不打烊。', author: '周末惬意' },
  { id: '3', category: 'pyq', tag: '自拍', content: '今日份自拍打卡：分享一点点阳光和好心情。', author: '心情日记' },
  { id: '4', category: 'pyq', tag: '美食', content: '火锅咕嘟咕嘟，人间热气腾腾，没有什么烦恼是一顿美食解决不了的。', author: '吃货指南' },
  { id: '5', category: 'pyq', tag: '夜宵', content: '月亮不睡我不睡，我是人间小美味，深夜的快乐从这一口开始。', author: '深夜食堂' },

  // 小红书种草 / 笔记
  { id: '6', category: 'xhs', tag: '好物种草', content: '挖到宝了！颜值与实用并存的神仙好物，自用一个月彻底沦陷，真的按头安利！', author: '好物测评' },
  { id: '7', category: 'xhs', tag: '穿搭指南', content: '今日OOTD：低饱和度温柔穿搭，法式松弛感拿捏，显白又显气质。', author: '穿搭日记' },
  { id: '8', category: 'xhs', tag: '数码好物', content: '提升幸福感的数码配件清单，用过就回不去，打工人桌面美学必备！', author: '数码玩家' },
  { id: '9', category: 'xhs', tag: '居家美学', content: '把家布置成喜欢的模样，下班推开门的瞬间，所有的疲惫都被治愈了。', author: '独居生活' },

  // 早安晚安 / 晨光暮色
  { id: '10', category: 'morning', tag: '早安', content: '早安！每一个清晨都是新的起点，带上微笑与好运，去开启元气满满的一天。', author: '晨光寄语' },
  { id: '11', category: 'morning', tag: '早安', content: '清晨的阳光洒在窗台，愿今日所有的美好如期而至，努力且坚定。', author: '晨安物语' },
  { id: '12', category: 'morning', tag: '晚安', content: '把今天所有的不开心都留在黑夜里，闭上双眼，愿你今夜好梦，晚安。', author: '暮色晚安' },
  { id: '13', category: 'morning', tag: '晚安', content: '月亮已经打烊，星星还在眨眼。愿世间美好与你环环相扣，晚安好梦。', author: '夜幕絮语' },

  // 职场工作 / 高情商回复
  { id: '14', category: 'work', tag: '周报总结', content: '本周核心推进了3项关键业务落地，复盘链路痛点并完成优化，下周将继续聚焦转化效能提升。', author: '职场周报' },
  { id: '15', category: 'work', tag: '高情商回复', content: '收到，您的建议非常中肯且专业，我们已迅速调整方案并同步跟进最新进度。', author: '沟通之道' },
  { id: '16', category: 'work', tag: '职场自嘲', content: '打工人的生存哲学：做完PPT先深呼吸，只要咖啡还在，思路就还能抢救。', author: '职场日常' },
  { id: '17', category: 'work', tag: '项目汇报', content: '针对本次项目交付，我们从“效率升级”、“体验平滑”、“投资回报”三个维度完成了全面验收。', author: '汇报模版' },

  // 诗词文艺 / 国风雅韵
  { id: '18', category: 'poetry', tag: '国风', content: '浮生偷得半日闲，清茶一盏度流年。且将新火试新茶，诗酒趁年华。', author: '诗意江南' },
  { id: '19', category: 'poetry', tag: '古风', content: '山有木兮木有枝，心悦君兮君可知。愿借春风十里，吹尽江南千树花。', author: '墨染流年' },
  { id: '20', category: 'poetry', tag: '唯美', content: '落霞与孤鹜齐飞，秋水共长天一色。人间山河远阔，万物皆有回响。', author: '诗意天地' },

  // 浪漫情话 / 恋爱物语
  { id: '21', category: 'love', tag: '浪漫', content: '其实世间所有的美好，都比不上此时此刻和你一起吹吹晚风、看落日余晖。', author: '心动信号' },
  { id: '22', category: 'love', tag: '告白', content: '你是我平淡岁月里的星辰大海，有你在的地方，连空气都是甜甜的。', author: '告白情书' },
  { id: '23', category: 'love', tag: '纪念日', content: '感谢有你的陪伴，每一个春夏秋冬，因为有你，所有的平凡都变成了惊喜。', author: '时光恋歌' },

  // 励志自律 / 搞钱成长
  { id: '24', category: 'growth', tag: '自律', content: '自律的顶端是享受孤独。不要在最能吃苦的年纪选择安逸，悄悄拔尖，然后惊艳所有人。', author: '成长笔记' },
  { id: '25', category: 'growth', tag: '搞钱', content: '与其焦虑未来，不如专注于提升当下的核心价值。专注搞钱与自我提升，才是最硬的底气。', author: '财富认知' },
  { id: '26', category: 'growth', tag: '坚持', content: '任何看似波澜不惊的日复一日，都会在某一天让你看到坚持的意义。加油！', author: '励志金句' }
];

const SENSITIVE_WORDS_LIB = [
  '最顶级', '第一', '最全', '独家唯一', '国家级', '世界级', '全网首发', '绝对', '万能', '保本', '100%有效', '无敌', '顶级爆款'
];

Page({
  data: {
    activeTab: 'home',
    searchKeyword: '',
    currentDateStr: '',
    dailyQuoteIndex: 0,
    dailyQuote: DAILY_QUOTES[0],
    
    activeCategory: 'all',
    categories: [
      { id: 'all', name: '🔥 热门推荐' },
      { id: 'pyq', name: '📸 朋友圈' },
      { id: 'xhs', name: '💄 小红书' },
      { id: 'morning', name: '☀️ 早安晚安' },
      { id: 'work', name: '💼 职场周报' },
      { id: 'poetry', name: '🍂 国风文艺' },
      { id: 'love', name: '💖 浪漫表白' },
      { id: 'growth', name: '🚀 自律搞钱' }
    ],

    allQuotes: PRESET_QUOTES,
    filteredQuotes: PRESET_QUOTES,

    // Tool Modal State
    showToolModal: false,
    activeToolType: 'clean', // 'clean', 'font', 'check'
    toolInputText: '',
    toolResultText: '',
    fontVariants: [],
    sensitiveHits: []
  },

  onLoad() {
    this.initDateString();
    this.pickDailyQuote();
    this.filterQuotes();
  },

  onShow() {
    this.setData({
      activeTab: 'home'
    });
  },

  initDateString() {
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const week = weeks[date.getDay()];
    this.setData({
      currentDateStr: `${month}月${day}日 · ${week}`
    });
  },

  pickDailyQuote() {
    const rand = Math.floor(Math.random() * DAILY_QUOTES.length);
    this.setData({
      dailyQuoteIndex: rand,
      dailyQuote: DAILY_QUOTES[rand]
    });
  },

  onRefreshQuote() {
    let nextIndex = (this.data.dailyQuoteIndex + 1) % DAILY_QUOTES.length;
    this.setData({
      dailyQuoteIndex: nextIndex,
      dailyQuote: DAILY_QUOTES[nextIndex]
    });
    wx.showToast({
      title: '已换一换',
      icon: 'none'
    });
  },

  onSelectCategory(e) {
    const category = e.currentTarget.dataset.id;
    this.setData({
      activeCategory: category
    }, () => {
      this.filterQuotes();
    });
  },

  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    }, () => {
      this.filterQuotes();
    });
  },

  onClearSearch() {
    this.setData({
      searchKeyword: ''
    }, () => {
      this.filterQuotes();
    });
  },

  filterQuotes() {
    const { activeCategory, searchKeyword, allQuotes } = this.data;
    const kw = (searchKeyword || '').trim().toLowerCase();

    let list = allQuotes;
    if (activeCategory !== 'all') {
      list = list.filter(item => item.category === activeCategory);
    }

    if (kw) {
      list = list.filter(item => {
        return item.content.toLowerCase().indexOf(kw) !== -1 ||
               (item.tag && item.tag.toLowerCase().indexOf(kw) !== -1) ||
               (item.author && item.author.toLowerCase().indexOf(kw) !== -1);
      });
    }

    this.setData({
      filteredQuotes: list
    });
  },

  onCopyDailyQuote() {
    const text = this.data.dailyQuote.text;
    wx.setClipboardData({
      data: text,
      success() {
        wx.showToast({
          title: '已复制金句',
          icon: 'success'
        });
      }
    });
  },

  onCopyText(e) {
    const text = e.currentTarget.dataset.text;
    if (!text) return;
    wx.setClipboardData({
      data: text,
      success() {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  // 联动跳转到润色工坊 (Tab 3)
  onGoToPolish(e) {
    const text = e.currentTarget.dataset.text || this.data.dailyQuote.text;
    if (app && app.globalData) {
      app.globalData.prefillPolishText = text;
    }
    wx.redirectTo({
      url: `/pages/polish/polish?text=${encodeURIComponent(text)}`
    });
  },

  // Quick Tools Handler
  openToolModal(e) {
    const tool = e.currentTarget.dataset.tool || 'clean';
    this.setData({
      showToolModal: true,
      activeToolType: tool,
      toolInputText: '',
      toolResultText: '',
      fontVariants: [],
      sensitiveHits: []
    });
  },

  closeToolModal() {
    this.setData({
      showToolModal: false,
      toolInputText: '',
      toolResultText: ''
    });
  },

  switchToolTab(e) {
    const tool = e.currentTarget.dataset.tool;
    this.setData({
      activeToolType: tool,
      toolResultText: '',
      fontVariants: [],
      sensitiveHits: []
    }, () => {
      this.executeActiveTool();
    });
  },

  onToolInput(e) {
    this.setData({
      toolInputText: e.detail.value
    }, () => {
      this.executeActiveTool();
    });
  },

  onPasteToTool() {
    const that = this;
    wx.getClipboardData({
      success(res) {
        if (res.data) {
          that.setData({
            toolInputText: res.data
          }, () => {
            that.executeActiveTool();
          });
        }
      }
    });
  },

  executeActiveTool() {
    const text = this.data.toolInputText;
    if (!text) {
      this.setData({
        toolResultText: '',
        fontVariants: [],
        sensitiveHits: []
      });
      return;
    }

    const { activeToolType } = this.data;
    if (activeToolType === 'clean') {
      this.executeCleanText(text);
    } else if (activeToolType === 'font') {
      this.executeFontTransform(text);
    } else if (activeToolType === 'check') {
      this.executeSensitiveCheck(text);
    }
  },

  executeCleanText(text) {
    // 1. 去除多余空行 (连续两个及以上空行合并为一个)
    let cleaned = text.replace(/\n\s*\n/g, '\n');
    // 2. 去除每行首尾多余空格
    cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');
    // 3. 规范常见标点符号
    cleaned = cleaned.replace(/,/g, '，').replace(/\?/g, '？').replace(/!/g, '！').replace(/:/g, '：');
    // 4. 首尾清理
    cleaned = cleaned.trim();

    const charCount = cleaned.length;
    const wordCount = cleaned.replace(/\s+/g, '').length;
    const lineCount = cleaned.split('\n').filter(l => l.length > 0).length;

    this.setData({
      toolResultText: cleaned,
      toolStats: `字符数: ${charCount} | 去空字符: ${wordCount} | 段落数: ${lineCount}`
    });
  },

  executeFontTransform(text) {
    // 生成几种经典好看的花样符号字体包装
    const sample = text.trim();
    if (!sample) return;

    const variants = [
      { name: '✨ 仙气星芒', text: `✨ ꧁༺ ${sample} ༻꧂ ✨` },
      { name: '🌿 治愈绿意', text: `🍃 [ ${sample} ] 𓂃 𓈒𓏸` },
      { name: '💌 胶囊标签', text: `🏷️ ❮ ${sample} ❯` },
      { name: '🖤 极简轻奢', text: `「 ${sample} 」` },
      { name: '🌸 花瓣甜心', text: `✿*:･ﾟ ${sample} ﾟ･:*✿` },
      { name: '💫 霓虹光芒', text: `˗ˋˏ ${sample} ˎˊ˗` }
    ];

    this.setData({
      fontVariants: variants
    });
  },

  executeSensitiveCheck(text) {
    const hits = [];
    SENSITIVE_WORDS_LIB.forEach(word => {
      if (text.indexOf(word) !== -1) {
        hits.push(word);
      }
    });

    this.setData({
      sensitiveHits: hits
    });
  },

  onCopyToolResult() {
    const text = this.data.toolResultText;
    if (!text) return;
    wx.setClipboardData({
      data: text,
      success() {
        wx.showToast({
          title: '已复制处理结果',
          icon: 'success'
        });
      }
    });
  },

  onApplyToolToPolish() {
    const text = this.data.toolResultText || this.data.toolInputText;
    if (!text) {
      wx.showToast({
        title: '请输入文案',
        icon: 'none'
      });
      return;
    }
    this.closeToolModal();
    if (app && app.globalData) {
      app.globalData.prefillPolishText = text;
    }
    wx.redirectTo({
      url: `/pages/polish/polish?text=${encodeURIComponent(text)}`
    });
  },

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
  },

  onShareAppMessage() {
    return {
      title: '灵感文案库 - 自媒体爆款文案与排版工具',
      path: '/pages/home/home'
    };
  },

  onShareTimeline() {
    return {
      title: '灵感文案库 - 自媒体爆款文案与排版工具'
    };
  }
});
