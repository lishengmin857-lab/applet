// Video Parse Page Controller
const app = getApp();

const PLATFORMS = [
  { name: '抖音', icon: '🎵' },
  { name: '快手', icon: '⚡' },
  { name: 'B站', icon: '📺' },
  { name: 'YouTube', icon: '▶' },
  { name: '小红书', icon: '📕' }
];

// Extract video URL from share text
function extractVideoUrl(text) {
  if (!text) return '';
  const clean = text.replace(/锟斤拷|锟|斤|拷/g, '').trim();

  const patterns = [
    /https?:\/\/v\.douyin\.com\/[a-zA-Z0-9_\-]+\/?/i,
    /https?:\/\/www\.douyin\.com\/video\/\d+/i,
    /https?:\/\/www\.kuaishou\.com\/short-video\/[a-zA-Z0-9]+/i,
    /https?:\/\/v\.kuaishou\.com\/[a-zA-Z0-9]+/i,
    /https?:\/\/www\.bilibili\.com\/video\/[a-zA-Z0-9]+/i,
    /https?:\/\/b23\.tv\/[a-zA-Z0-9]+/i,
    /https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_\-]+/i,
    /https?:\/\/www\.xiaohongshu\.com\/discovery\/item\/[a-zA-Z0-9]+/i,
    /https?:\/\/xhslink\.com\/[a-zA-Z0-9]+/i,
    /https?:\/\/www\.instagram\.com\/[^\s]+/i,
    /https?:\/\/[^\s\u4e00-\u9fa5]+/i
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match) return match[0];
  }
  return clean;
}

// Format duration into string
function formatDuration(seconds) {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Get readable platform name
function getPlatformName(extractor) {
  const map = {
    douyin: '抖音',
    kuaishou: '快手',
    bilibili: 'B站',
    youtube: 'YouTube',
    xiaohongshu: '小红书',
    instagram: 'Instagram'
  };
  return map[String(extractor || '').toLowerCase()] || extractor || '全网视频';
}

Page({
  data: {
    inputUrl: '',
    loading: false,
    parseProgress: 0,
    videoInfo: null,
    selectedFormatId: null,
    selectedFormatUrl: null,
    durationStr: '',
    platformName: '',
    platforms: PLATFORMS,
    activeTab: 'videoparse'
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
      activeTab: 'videoparse',
      loading: false
    });
  },

  onUrlInput(e) {
    this.setData({
      inputUrl: e.detail.value
    });
  },

  onClearUrl() {
    this.setData({
      inputUrl: '',
      videoInfo: null,
      selectedFormatId: null,
      selectedFormatUrl: null
    });
    wx.showToast({
      title: '已清空链接',
      icon: 'success'
    });
  },

  onPaste() {
    const that = this;
    wx.getClipboardData({
      success(res) {
        if (res.data) {
          const extracted = extractVideoUrl(res.data);
          that.setData({
            inputUrl: extracted
          });
          wx.showToast({
            title: extracted !== res.data ? '已自动提取链接' : '已粘贴链接',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '剪贴板内容为空',
            icon: 'none'
          });
        }
      },
      fail() {
        wx.showToast({
          title: '无法读取剪贴板',
          icon: 'none'
        });
      }
    });
  },

  onParse() {
    const rawUrl = this.data.inputUrl.trim();
    if (!rawUrl) {
      wx.showToast({
        title: '请先输入视频链接',
        icon: 'none'
      });
      return;
    }

    const videoUrl = extractVideoUrl(rawUrl);

    this.setData({
      loading: true,
      parseProgress: 0,
      videoInfo: null,
      selectedFormatId: null,
      selectedFormatUrl: null
    });

    // Simulate progress bar animation
    const progressTimer = setInterval(() => {
      const cur = this.data.parseProgress;
      if (cur < 85) {
        this.setData({
          parseProgress: Math.min(85, Math.floor(cur + Math.random() * 15 + 5))
        });
      }
    }, 250);

    this.requestParseVideo(videoUrl)
      .then((data) => {
        clearInterval(progressTimer);
        const firstFormat = data.formats?.[0] || null;
        this.setData({
          loading: false,
          parseProgress: 100,
          videoInfo: data,
          selectedFormatId: firstFormat?.format_id || null,
          selectedFormatUrl: firstFormat?.url || null,
          durationStr: formatDuration(data.duration),
          platformName: getPlatformName(data.extractor)
        });
      })
      .catch((error) => {
        clearInterval(progressTimer);
        this.setData({
          loading: false,
          parseProgress: 0
        });
        const message = error.message || '解析失败，请稍后再试';
        wx.showModal({
          title: '解析失败',
          content: message,
          showCancel: false,
          confirmText: '知道了'
        });
      });
  },

  requestParseVideo(url) {
    const apiBaseUrl = String(app.globalData.apiBaseUrl || '').replace(/\/+$/, '');
    if (!apiBaseUrl || apiBaseUrl.indexOf('your-domain.com') !== -1) {
      return Promise.reject(new Error('请先配置接口域名'));
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${apiBaseUrl}/api/v1/miniapp/video/parse`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: { url },
        timeout: 60000,
        success(res) {
          const data = res.data || {};
          if (res.statusCode >= 200 && res.statusCode < 300 && data.ok && data.data) {
            resolve(data.data);
            return;
          }
          console.log('wx.request video parse error', { statusCode: res.statusCode, data });
          reject(new Error(data.error || data.message || `解析失败(${res.statusCode})`));
        },
        fail(err) {
          console.log('wx.request video parse fail', err);
          reject(new Error(err.errMsg || '网络异常，请稍后再试'));
        }
      });
    });
  },

  onSelectFormat(e) {
    const { id, url } = e.currentTarget.dataset;
    this.setData({
      selectedFormatId: id,
      selectedFormatUrl: url
    });
  },

  onCopyUrl() {
    const url = this.data.selectedFormatUrl;
    if (!url) {
      wx.showToast({
        title: '请先选择格式',
        icon: 'none'
      });
      return;
    }

    wx.setClipboardData({
      data: url,
      success() {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        });
      }
    });
  },

  onSaveToAlbum() {
    const sourceUrl = this.data.selectedFormatUrl;
    if (!sourceUrl) {
      wx.showToast({
        title: '请先选择格式',
        icon: 'none'
      });
      return;
    }

    const selectedFormat = this.data.videoInfo?.formats?.find((f) => f.format_id === this.data.selectedFormatId);
    const proxyPath = selectedFormat?.download_url;
    if (!proxyPath) {
      wx.showToast({
        title: '下载地址无效，请重新解析',
        icon: 'none'
      });
      return;
    }

    const apiBaseUrl = String(app.globalData.apiBaseUrl || '').replace(/\/+$/, '');
    const downloadUrl = /^https?:\/\//i.test(proxyPath)
      ? proxyPath
      : `${apiBaseUrl}${proxyPath.startsWith('/') ? '' : '/'}${proxyPath}`;
    const isImage = selectedFormat?.is_video === false || Boolean(sourceUrl.match(/\.(jpeg|jpg|png|webp)($|\?)/i));
    const rawExt = String(selectedFormat?.ext || (isImage ? 'jpg' : 'mp4')).toLowerCase();
    const fileExt = /^[a-z0-9]{2,5}$/.test(rawExt) ? rawExt : (isImage ? 'jpg' : 'mp4');
    const targetFilePath = `${wx.env.USER_DATA_PATH}/media_${Date.now()}.${fileExt}`;

    const that = this;
    wx.showLoading({
      title: '正在下载中...',
      mask: true
    });

    const downloadTask = wx.downloadFile({
      url: downloadUrl,
      filePath: targetFilePath,
      success(res) {
        const downloadedFilePath = res.filePath || res.tempFilePath || targetFilePath;
        if ((res.statusCode === 200 || res.statusCode === 206) && downloadedFilePath) {
          wx.showLoading({
            title: '正在保存到相册...',
            mask: true
          });
          wx.getFileSystemManager().stat({
            path: downloadedFilePath,
            success(statRes) {
              const fileSize = Number(statRes.stats?.size || 0);
              if (fileSize <= 0) {
                wx.hideLoading();
                that.removeDownloadedFile(downloadedFilePath);
                wx.showModal({
                  title: '保存失败',
                  content: '下载的文件为空，请重新解析后再试。',
                  showCancel: false
                });
                return;
              }
              console.log('Downloaded media file:', { path: downloadedFilePath, size: fileSize });
              that.saveMediaToAlbum(downloadedFilePath, isImage, true);
            },
            fail(statErr) {
              wx.hideLoading();
              console.error('Downloaded file stat fail:', statErr, downloadedFilePath);
              wx.showModal({
                title: '保存失败',
                content: `下载完成，但文件不存在：${statErr.errMsg || 'unknown error'}`,
                showCancel: false
              });
            }
          });
        } else {
          wx.hideLoading();
          that.removeDownloadedFile(downloadedFilePath);
          wx.showToast({
            title: `下载失败(${res.statusCode})`,
            icon: 'none'
          });
        }
      },
      fail(err) {
        wx.hideLoading();
        console.error('wx.downloadFile fail', err);
        wx.showModal({
          title: '下载失败',
          content: '小程序直接下载受限或超时，是否复制直链到剪贴板？',
          confirmText: '复制直链',
          success(modalRes) {
            if (modalRes.confirm) {
              that.onCopyUrl();
            }
          }
        });
      }
    });

    downloadTask.onProgressUpdate((res) => {
      wx.showLoading({
        title: `下载中 ${res.progress}%`,
        mask: true
      });
    });
  },

  removeDownloadedFile(filePath) {
    if (!filePath || !String(filePath).startsWith(wx.env.USER_DATA_PATH)) return;
    wx.getFileSystemManager().unlink({
      filePath,
      fail(err) {
        console.warn('Remove downloaded file fail:', err);
      }
    });
  },

  saveMediaToAlbum(tempFilePath, isImage, removeAfterSave = false) {
    const that = this;
    const saveApi = isImage ? wx.saveImageToPhotosAlbum : wx.saveVideoToPhotosAlbum;

    saveApi({
      filePath: tempFilePath,
      success() {
        wx.hideLoading();
        wx.showToast({
          title: isImage ? '图片已存入相册' : '视频已存入相册',
          icon: 'success',
          duration: 2500
        });
      },
      fail(err) {
        wx.hideLoading();
        console.error('Save to photos album fail:', err, { filePath: tempFilePath });
        if (err.errMsg && (err.errMsg.includes('auth deny') || err.errMsg.includes('auth denied') || err.errMsg.includes('authorize:fail'))) {
          wx.showModal({
            title: '需要保存相册权限',
            content: '请在微信设置中允许小程序保存图片/视频到手机相册。',
            confirmText: '去设置',
            success(res) {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
        } else {
          wx.showModal({
            title: '保存失败',
            content: err.errMsg || '视频保存失败，请稍后再试。',
            showCancel: false,
            confirmText: '知道了'
          });
        }
      },
      complete() {
        if (removeAfterSave) that.removeDownloadedFile(tempFilePath);
      }
    });
  },

  onShowGuide() {
    wx.showModal({
      title: '支持的平台',
      content: '目前支持：\n• 抖音 / 抖音极速版\n• 快手 / 快手极速版\n• 哔哩哔哩 (B站)\n• YouTube\n• 小红书\n\n提取后的链接不含水印，复制到浏览器即可下载！',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  formatFileSize(bytes) {
    if (!bytes) return '大小未知';
    const mb = bytes / 1024 / 1024;
    return mb < 1024 ? `${mb.toFixed(1)} MB` : `${(mb / 1024).toFixed(2)} GB`;
  },

  onShareAppMessage() {
    return {
      title: '全平台视频无水印解析提取',
      path: '/pages/videoparse/videoparse'
    };
  },

  onShareTimeline() {
    return {
      title: '全平台视频无水印解析提取'
    };
  },

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
  }
});
