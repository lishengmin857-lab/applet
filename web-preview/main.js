// Main Simulator JS for AI Copywriter (Elegant Glassmorphic Redesign)

// State Management
let state = {
  inputText: '',
  selectedStyle: 'sincere', // Default: 真诚
  currentTab: 'home',
  records: [],
  dailyRemainCount: 10,
  totalGenerateCount: 0,
  isVip: false,
  currentGeneratedResult: null
};

// Style Definitions
const STYLES = {
  funny: { name: '幽默', class: 'tag-funny' },
  sincere: { name: '真诚', class: 'tag-sincere' },
  professional: { name: '专业', class: 'tag-professional' },
  poetry: { name: '诗词', class: 'tag-poetry' },
  aesthetic: { name: '唯美', class: 'tag-aesthetic' },
  romantic: { name: '浪漫', class: 'tag-romantic' }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  bindEvents();
  renderApp();
});

// Storage Methods
function initStorage() {
  const today = new Date().toDateString();
  const lastUseDate = localStorage.getItem('lastUseDate') || '';
  
  if (lastUseDate !== today) {
    localStorage.setItem('lastUseDate', today);
    localStorage.setItem('dailyRemainCount', '10');
    state.dailyRemainCount = 10;
  } else {
    state.dailyRemainCount = parseInt(localStorage.getItem('dailyRemainCount') || '10', 10);
  }
  
  state.records = JSON.parse(localStorage.getItem('records') || '[]');
  state.totalGenerateCount = parseInt(localStorage.getItem('totalGenerateCount') || '0', 10);
  state.isVip = localStorage.getItem('isVip') === 'true';
}

function saveStorage() {
  localStorage.setItem('records', JSON.stringify(state.records));
  localStorage.setItem('dailyRemainCount', state.dailyRemainCount.toString());
  localStorage.setItem('totalGenerateCount', state.totalGenerateCount.toString());
  localStorage.setItem('isVip', state.isVip.toString());
}

// UI Rendering
function renderApp() {
  // Update state labels in Dev Controls
  document.getElementById('vip-status-label').textContent = state.isVip ? 'VIP会员' : '普通用户';
  document.getElementById('vip-status-text').textContent = state.isVip ? 'VIP无限次数会员' : '普通免费账户';
  
  // Profile stats
  const vipBadge = document.getElementById('vip-badge');
  if (vipBadge) vipBadge.style.display = state.isVip ? 'inline-block' : 'none';
  
  document.getElementById('quota-remain').textContent = state.isVip ? '∞' : state.dailyRemainCount;
  
  // Total stats
  document.getElementById('stat-total').textContent = state.totalGenerateCount;

  renderRecordsList();
}

// Render History List (Glassmorphic cards)
function renderRecordsList() {
  const container = document.getElementById('records-list');
  const emptyState = document.getElementById('records-empty');
  
  if (!container) return;
  container.innerHTML = '';
  
  if (state.records.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }
  
  emptyState.style.display = 'none';
  
  // Display latest first
  [...state.records].reverse().forEach(record => {
    const card = document.createElement('div');
    card.className = 'glass-card record-card';
    
    const styleInfo = STYLES[record.style] || { name: '定制', class: 'tag-sincere' };
    const timeStr = new Date(record.createdAt).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    card.innerHTML = `
      <div class="record-card-header">
        <span class="record-style-tag ${styleInfo.class}">${styleInfo.name}风格</span>
        <span class="record-time">${timeStr}</span>
      </div>
      <div class="record-content-box">
        <div class="record-orig-text">原文: ${escapeHTML(record.inputText)}</div>
        <div class="record-gen-text">${escapeHTML(record.resultText)}</div>
      </div>
      <div class="record-actions">
        <button class="record-action-btn btn-del" data-id="${record.id}">删除</button>
        <button class="record-action-btn btn-copy" data-id="${record.id}">复制</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Event Bindings
function bindEvents() {
  // Tab Navigation
  document.querySelectorAll('.tab-item').forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  const textarea = document.getElementById('textarea-input');
  
  // Textarea input character count
  textarea.addEventListener('input', (e) => {
    state.inputText = e.target.value;
    document.getElementById('input-length').textContent = state.inputText.length;
  });

  // Paste Action
  document.getElementById('btn-paste').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        textarea.value = text;
        state.inputText = text;
        document.getElementById('input-length').textContent = text.length;
        showToast('已成功粘贴剪贴板内容');
      } else {
        mockPasteFallback();
      }
    } catch (err) {
      mockPasteFallback();
    }
  });

  // Clear Action
  document.getElementById('btn-clear').addEventListener('click', () => {
    textarea.value = '';
    state.inputText = '';
    document.getElementById('input-length').textContent = '0';
    showToast('内容已清空');
  });

  // Style Cards Row click (3 Vertical panels)
  document.querySelectorAll('.style-card').forEach(card => {
    card.addEventListener('click', () => {
      const styleKey = card.getAttribute('data-style');
      document.querySelectorAll('.style-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.selectedStyle = styleKey;
    });
  });

  // Generate Button Click
  document.getElementById('btn-generate').addEventListener('click', () => {
    generateCopywriting();
  });

  // Modal Actions
  document.getElementById('modal-btn-close').addEventListener('click', closeModal);
  document.getElementById('modal-btn-copy').addEventListener('click', () => {
    if (state.currentGeneratedResult) {
      copyToClipboard(state.currentGeneratedResult.resultText);
    }
  });
  
  document.getElementById('modal-btn-favorite').addEventListener('click', () => {
    if (state.currentGeneratedResult) {
      state.currentGeneratedResult.isFavorite = !state.currentGeneratedResult.isFavorite;
      const favBtn = document.getElementById('modal-btn-favorite');
      
      // Update record in records array
      state.records = state.records.map(r => {
        if (r.id === state.currentGeneratedResult.id) {
          r.isFavorite = state.currentGeneratedResult.isFavorite;
        }
        return r;
      });
      saveStorage();

      if (state.currentGeneratedResult.isFavorite) {
        favBtn.classList.add('active');
        favBtn.querySelector('span').textContent = '已收藏';
        favBtn.querySelector('svg').setAttribute('fill', 'currentColor');
        showToast('已保存至收藏');
      } else {
        favBtn.classList.remove('active');
        favBtn.querySelector('span').textContent = '收藏';
        favBtn.querySelector('svg').setAttribute('fill', 'none');
        showToast('已取消收藏');
      }
    }
  });

  document.getElementById('modal-btn-regenerate').addEventListener('click', () => {
    closeModal();
    generateCopywriting();
  });

  // Record list Copy / Delete Actions
  const recordsContainer = document.getElementById('records-list');
  if (recordsContainer) {
    recordsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      
      const id = btn.getAttribute('data-id');
      if (btn.classList.contains('btn-copy')) {
        const record = state.records.find(r => r.id === id);
        if (record) copyToClipboard(record.resultText);
      } else if (btn.classList.contains('btn-del')) {
        deleteRecord(id);
      }
    });
  }

  // Profile Menu Dialog Clicks
  document.getElementById('menu-vip').addEventListener('click', () => {
    showDialog('会员特权说明', `
      <p>👑 <strong>尊享文案润色 VIP 特权：</strong></p><br>
      <p>1. <strong>无限次极速润色：</strong> 尊享专属服务器，生成次数无限制。</p>
      <p>2. <strong>智能语境重排：</strong> 优化长难句，输出更有力量的逻辑排布。</p>
      <p>3. <strong>解锁全部专业级风格：</strong> 深度体验各大场景的行业用语包。</p>
      <br>
      <p style="color: #C4B097; font-weight: 700;">👉 您可通过左侧控制面板中的“切换 VIP 身份”立即模拟开通体验。</p>
    `);
  });

  document.getElementById('menu-share').addEventListener('click', () => {
    state.dailyRemainCount = Math.min(10, state.dailyRemainCount + 5);
    saveStorage();
    renderApp();
    showToast('🎁 邀请成功！已奖励您 5 次生成次数！');
  });

  document.getElementById('menu-guide-profile').addEventListener('click', showGuideDialog);
  document.getElementById('btn-guide').addEventListener('click', showGuideDialog);

  document.getElementById('menu-support').addEventListener('click', () => {
    showDialog('官方客户服务', `
      <p>👩‍💼 <strong>官方在线客服</strong></p><br>
      <p>如果您在使用本工具时遇到内容拦截、生成问题或有任何吐槽，请添加客服官方微信：</p>
      <p style="margin: 12px 0; font-weight: bold; font-size: 15px; color: #AC977D;">WeChat ID: Polish_AI_Support</p>
      <p>服务时间：周一至周日 09:00 - 21:00</p>
    `);
  });

  document.getElementById('dialog-btn-close').addEventListener('click', () => {
    document.getElementById('info-dialog').style.display = 'none';
  });

  // Dev controls
  document.getElementById('btn-toggle-vip').addEventListener('click', () => {
    state.isVip = !state.isVip;
    saveStorage();
    renderApp();
    showToast(state.isVip ? '👑 已切换为 VIP 身份' : '⚙️ 已恢复普通用户状态');
  });

  document.getElementById('btn-reset-storage').addEventListener('click', () => {
    localStorage.clear();
    state.records = [];
    state.dailyRemainCount = 10;
    state.totalGenerateCount = 0;
    state.isVip = false;
    saveStorage();
    renderApp();
    showToast('⚙️ 本地存储已重置');
  });
}

function showGuideDialog() {
  showDialog('文案润色使用指南', `
    <p>💡 <strong>让文字更有力量的秘诀：</strong></p><br>
    <p>1. <strong>输入初稿：</strong> 随手写下一段您想要修改的大白话或营销思路。</p>
    <p>2. <strong>选择调性风格：</strong></p>
    <ul>
      <li><strong>幽默</strong>：添加诙谐段子，吸睛引流；</li>
      <li><strong>真诚</strong>：走心真实，引发情感共鸣；</li>
      <li><strong>专业</strong>：行业高级术语，逻辑清晰；</li>
      <li><strong>诗词</strong>：古风雅致，蕴含传统墨香；</li>
      <li><strong>唯美</strong>：字句温柔治愈，富于画面感；</li>
      <li><strong>浪漫</strong>：温情脉脉，散发如诗浪漫。</li>
    </ul><br>
    <p>3. <strong>一键润色：</strong> 点击按钮，AI 将润色并重排版，一键复制即可使用！</p>
  `);
}

// Tab Switching
window.switchTab = function(tabId) {
  state.currentTab = tabId;
  
  // Update Tab buttons
  document.querySelectorAll('.tab-item').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update Page containers
  document.querySelectorAll('.page-content').forEach(page => {
    if (page.id === `page-${tabId}`) {
      page.classList.add('active');
    } else {
      page.classList.remove('active');
    }
  });

  // Update navbar title
  const navTitle = document.getElementById('nav-title');
  if (tabId === 'home') navTitle.textContent = '文案润色';
  else if (tabId === 'records') navTitle.textContent = '润色记录';
  else if (tabId === 'profile') navTitle.textContent = '我的';
  
  // Re-render
  renderApp();
};

// Paste Fallback
function mockPasteFallback() {
  const mockTexts = [
    "刚做完今天的工作汇报PPT，感觉整个人都虚脱了。每天都在写这些虚头巴脑的东西，真的有意义吗？想辞职，但是看看银行卡余额，还是默默写代码吧。",
    "今天去打卡了一家超级好吃的螺蛳粉店，汤底很浓，配料很足，就是排队排了半小时，太折磨了。不过吃完之后觉得一切都值了，强烈推荐大家去！",
    "新入手的这款无线降噪耳机，音质真的惊艳到我了！戴上之后整个世界都安静了，而且戴久了耳朵一点都不疼，续航也超强，简直是数码党的福音。"
  ];
  const randText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
  
  const textarea = document.getElementById('textarea-input');
  textarea.value = randText;
  state.inputText = randText;
  document.getElementById('input-length').textContent = randText.length;
  showToast('📋 模拟粘贴：已为您粘贴样本文案');
}

// Dialog Overlay
function showDialog(title, contentHtml) {
  document.getElementById('dialog-title').textContent = title;
  document.getElementById('dialog-body').innerHTML = contentHtml;
  document.getElementById('info-dialog').style.display = 'flex';
}

// Toast
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

// Generate Copywriting
function generateCopywriting() {
  const text = state.inputText.trim();
  
  if (!text) {
    showToast('请输入你想要润色的文案');
    return;
  }
  if (text.length < 3) {
    showToast('文案过短，多输入几个字吧');
    return;
  }
  if (!state.isVip && state.dailyRemainCount <= 0) {
    showToast('今日额度已用完');
    return;
  }

  // Show loading
  const loader = document.getElementById('loading-modal');
  loader.style.display = 'flex';

  setTimeout(() => {
    loader.style.display = 'none';

    if (!state.isVip) {
      state.dailyRemainCount--;
    }
    state.totalGenerateCount++;

    const resultText = aiEngineSimulate(text, state.selectedStyle);

    const newRecord = {
      id: Date.now().toString(),
      inputText: text,
      resultText: resultText,
      style: state.selectedStyle,
      isFavorite: false,
      createdAt: Date.now()
    };

    state.records.push(newRecord);
    state.currentGeneratedResult = newRecord;

    saveStorage();
    renderApp();

    openResultModal(newRecord);
  }, 1500);
}

// Helper to escape HTML
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Mock AI engine for 6 elegant styles (Humorous, Sincere, Professional, Poetry, Aesthetic, Romantic)
function aiEngineSimulate(inputText, style) {
  let topic = "这个主题";
  if (inputText.includes("螺蛳粉") || inputText.includes("吃")) topic = "特色美食";
  else if (inputText.includes("工作") || inputText.includes("PPT") || inputText.includes("汇报")) topic = "职场汇报";
  else if (inputText.includes("耳机") || inputText.includes("数码")) topic = "数码体验";
  
  const cleanInput = inputText.length > 50 ? inputText.substring(0, 50) + '...' : inputText;

  if (style === 'funny') {
    return `✨ 【幽默风润色版】 ✨

关于“${topic}”，我的辣评来了：
"${cleanInput}"

救命！这玩意儿简直是打工人的续命解药吧！😂 
大可不必装得一本正经，用我的话说就是：真香！强烈建议收藏这套逻辑，不然下次你想吐槽都找不到词儿！[哈哈]

💡 趣味标签：#打工人自嘲 #笑死在评论区 #趣味体验`;
  }

  if (style === 'sincere') {
    return `✨ 【真诚风润色版】 ✨

“${inputText}”

掏心窝子说，其实我们真正在意的，是那些被认真对待的细节。
对于“${topic}”，试了好多别的方法都不尽人意。但这一次，它的真实温润让我切实感受到了诚意，有一种被细心呵护的微小仪式感。❤️

不需要浮夸的修饰，真诚就是最直击人心的力量。

💡 治愈标签：#真诚分享 #自用好物 #生活感悟`;
  }

  if (style === 'professional') {
    return `✨ 【专业风润色版】 ✨

关于【${topic}】的客观梳理与逻辑评估：

针对初稿：“${cleanInput}”，从专业结构上可优化为以下核心三要点：

1️⃣ 效能升级：优化了传统流转中的效率瓶颈，重组了底层链路；
2️⃣ 体验平滑：通过设计交互改良，降低了用户的使用门槛与学习成本；
3️⃣ 投资回报：在同等预算配置下，其耐久性与实用效益处于行业第一梯队。

总结：这并非感性层面的尝试，而是一项旨在实现效率最大化的理性投资。

💡 深度标签：#深度思考 #效率指南 #专业复盘`;
  }

  if (style === 'poetry') {
    return `✨ 【诗词风润色版】 ✨

关于“${topic}”，引诗一首，尽显诗意：

“${inputText}”

若是将此化为墨香，便如：
「浮生偷得半日闲，螺蛳粉里度流年。」
「案前牍背空折腰，红尘滚滚复自嘲。」

且将俗世烦扰化为笔下诗情，岁月悠长，山河无恙，万物皆可入诗入画。卷起清风，敬这烟火人间。🍂

💡 诗意标签：#国风雅韵 #诗意生活 #人间烟火`;
  }

  if (style === 'aesthetic') {
    return `✨ 【唯美风润色版】 ✨

关于“${topic}”的温柔呢喃：

“${inputText}”

在时光的褶皱里，我们总能捕捉到一抹温柔的亮色。生活里的那些琐碎与疲惫，都在温热的雾气中被悄然抚平。像是在黄昏的微风里，听一首没有歌词的钢琴曲，每个细节都闪烁着治愈人心的微光。✨

愿所有的相遇，都是温柔的伏笔。

💡 唯美标签：#温柔治愈 #唯美语录 #时光寄语`;
  }

  if (style === 'romantic') {
    return `✨ 【浪漫风润色版】 ✨

关于“${topic}”，这是送给你的浪漫情书：

“${inputText}”

其实，世间所有的美好，都比不上此时此刻与你共享的浪漫。工作再累，生活再忙，只要能看到落日微光，尝到人间烟火，一切就都有了甜意。就像宇宙中两颗微尘的相遇，连呼吸都沾染了玫瑰色的香气。🌹

你是生活里所有浪漫的唯一归属。

💡 浪漫标签：#浪漫情书 #落日温柔 #心动信号`;
  }

  return inputText;
}

// Copy clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('文案已复制');
  }).catch(() => {
    showToast('复制失败，请手动选择');
  });
}

// Delete Record
function deleteRecord(id) {
  state.records = state.records.filter(r => r.id !== id);
  saveStorage();
  renderApp();
  showToast('记录已删除');
}

// Modal open/close
function openResultModal(record) {
  const modal = document.getElementById('result-modal');
  const tag = document.getElementById('result-tag');
  const textContent = document.getElementById('result-content-text');
  const favBtn = document.getElementById('modal-btn-favorite');

  tag.textContent = STYLES[record.style]?.name || '定制';
  textContent.textContent = record.resultText;
  
  // Reset fav btn
  favBtn.classList.remove('active');
  favBtn.querySelector('span').textContent = '收藏';
  favBtn.querySelector('svg').setAttribute('fill', 'none');

  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('result-modal').style.display = 'none';
  state.currentGeneratedResult = null;
}
