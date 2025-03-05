class ReadingMode {
  constructor() {
    this.isEnabled = false;
    this.originalContent = null;
    this.readerContent = null;
    this.fontFamily = 'system-ui';
    this.fontSize = '18px';
    this.lineHeight = '1.6';
    this.articleStats = {
      readingTime: 0
    };
    this.summaryButton = null;
  }

  async init() {
    // Initialize Readability when needed
    if (!this.originalContent) {
      this.originalContent = document.cloneNode(true);
    }
  }

  async initPremiumService() {
    if (!this.premiumService) {
      this.premiumService = new PremiumService();
      await this.premiumService.init();
    }
  }

  async enable() {
    await this.init();
    await this.initPremiumService();
    
    // Create reader container
    this.readerContent = document.createElement('div');
    this.readerContent.id = 'reader-mode-content';
    
    // Fade out original content
    document.body.style.transition = 'opacity 0.3s ease-in-out';
    document.body.style.opacity = '0';
    
    // Wait for fade out
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Parse article with Readability
    const documentClone = this.originalContent.cloneNode(true);
    const article = new Readability(documentClone).parse();
    
    if (!article) {
      console.error('Could not parse article content');
      return;
    }

    // Insert reader content
    this.readerContent.innerHTML = `
      <div class="reader-header">
        <h1>${article.title}</h1>
      </div>
      <div class="reader-content">
        ${article.content}
      </div>
    `;

    // Hide original content and show reader content
    document.body.style.display = 'none';
    document.body.parentNode.insertBefore(this.readerContent, document.body);
    
    // Trigger fade in
    requestAnimationFrame(() => {
      this.readerContent.classList.add('visible');
    });
    
    this.isEnabled = true;

    const stats = this.analyzeContent(article);
    chrome.runtime.sendMessage({ 
      action: 'updateInsights', 
      stats: stats 
    });

    // Add summary button only if premium or trial available
    if (this.premiumService.features.summarization.enabled || 
        this.premiumService.features.summarization.dailyQuota > 0) {
      this.summaryButton = document.createElement('button');
      this.summaryButton.className = 'summary-button';
      this.summaryButton.textContent = 'Summarize';
      this.summaryButton.addEventListener('click', () => this.handleSummary());
      this.readerContent.appendChild(this.summaryButton);
    }
  }

  disable() {
    // Fade out reader content
    this.readerContent.classList.remove('visible');
    
    // Wait for fade out
    setTimeout(() => {
      if (this.readerContent) {
        this.readerContent.remove();
      }
      document.body.style.display = '';
      document.body.style.opacity = '1';
      this.isEnabled = false;
    }, 300);
  }

  toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  setDarkMode(isDark) {
    if (this.readerContent) {
      if (isDark) {
        this.readerContent.classList.add('dark');
      } else {
        this.readerContent.classList.remove('dark');
      }
    }
  }

  setFontFamily(family) {
    if (this.readerContent) {
      this.fontFamily = family;
      this.readerContent.style.fontFamily = family;
    }
  }

  setFontSize(size) {
    if (this.readerContent) {
      this.fontSize = size + 'px';
      this.readerContent.style.fontSize = this.fontSize;
    }
  }

  setLineHeight(height) {
    if (this.readerContent) {
      this.lineHeight = height;
      this.readerContent.style.lineHeight = height;
    }
  }

  analyzeContent(article) {
    // Calculate reading time (avg reading speed: 200 words/min)
    const wordCount = article.textContent.split(/\s+/).length;
    this.articleStats.readingTime = Math.ceil(wordCount / 200);
    
    return this.articleStats;
  }

  async handleSummary() {
    try {
      const article = this.readerContent.querySelector('.reader-content');
      const text = article.textContent;
      
      // Show loading state
      this.summaryButton.textContent = 'Summarizing...';
      this.summaryButton.disabled = true;
      
      const summary = await this.premiumService.aiService.summarizeArticle(text);
      
      // Display summary
      this.showSummary(summary);
    } catch (error) {
      console.error('Summary failed:', error);
      // Show upgrade prompt if quota exceeded
      if (error.code === 'QUOTA_EXCEEDED') {
        this.showUpgradePrompt();
      }
    } finally {
      this.summaryButton.textContent = 'Summarize';
      this.summaryButton.disabled = false;
    }
  }
}

// Initialize reading mode
const readingMode = new ReadingMode();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleReader') {
    readingMode.toggle();
    sendResponse({ 
      success: true,
      isEnabled: readingMode.isEnabled 
    });
  } else if (request.action === 'getState') {
    sendResponse({ 
      success: true,
      isEnabled: readingMode.isEnabled 
    });
  } else if (request.action === 'setDarkMode') {
    readingMode.setDarkMode(request.darkMode);
    sendResponse({ success: true });
  } else if (request.action === 'setFontFamily') {
    readingMode.setFontFamily(request.fontFamily);
    sendResponse({ success: true });
  } else if (request.action === 'setFontSize') {
    readingMode.setFontSize(request.fontSize);
    sendResponse({ success: true });
  } else if (request.action === 'setLineHeight') {
    readingMode.setLineHeight(request.lineHeight);
    sendResponse({ success: true });
  }
}); 