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
      console.log('Initializing premium service...');
      this.premiumService = new PremiumService();
      await this.premiumService.init();
      console.log('Premium service features:', this.premiumService.features);
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
        <div class="reader-controls"></div>
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
    console.log('Checking premium features for summarization...');
    console.log('Summarization enabled:', this.premiumService.features.summarization.enabled);
    console.log('Daily quota:', this.premiumService.features.summarization.dailyQuota);
    
    if (this.premiumService.features.summarization.enabled || 
        this.premiumService.features.summarization.dailyQuota > 0) {
      console.log('Creating summary button...');
      this.summaryButton = document.createElement('button');
      this.summaryButton.className = 'reader-control-button summary-button';
      this.summaryButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="21" y1="10" x2="7" y2="10"></line>
          <line x1="21" y1="6" x2="3" y2="6"></line>
          <line x1="21" y1="14" x2="3" y2="14"></line>
          <line x1="21" y1="18" x2="7" y2="18"></line>
        </svg>
        Summarize
      `;
      this.summaryButton.addEventListener('click', () => this.handleSummary());
      
      // Add button to reader controls
      const controls = this.readerContent.querySelector('.reader-controls');
      controls.appendChild(this.summaryButton);
      
      console.log('Summary button created and added to the controls');
    } else {
      console.log('Conditions not met for showing summary button');
    }

    // Initialize highlighter after reader mode content is created
    const readerContent = document.querySelector('.reader-content');
    if (readerContent && typeof Highlighter !== 'undefined') {
        // Only initialize if not already initialized
        if (!window.highlighter) {
            window.highlighter = new Highlighter(readerContent);
        }
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
      console.log('Starting summarization...');
      const article = this.readerContent.querySelector('.reader-content');
      const text = article.textContent;
      
      console.log('Article text length:', text.length);
      
      // Store original button content
      const originalContent = this.summaryButton.innerHTML;
      
      // Show loading state while maintaining icon
      this.summaryButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="21" y1="10" x2="7" y2="10"></line>
          <line x1="21" y1="6" x2="3" y2="6"></line>
          <line x1="21" y1="14" x2="3" y2="14"></line>
          <line x1="21" y1="18" x2="7" y2="18"></line>
        </svg>
        Summarizing...
      `;
      this.summaryButton.disabled = true;
      
      console.log('Calling AI service...');
      // Generate summary with OpenAI
      const prompt = `Please provide a concise 3-point summary of the following article. Format as three bullet points:\n\n${text}`;
      
      if (!this.premiumService || !this.premiumService.aiService) {
        throw new Error('AI service not initialized');
      }
      
      console.log('Sending request to OpenAI...');
      const summary = await this.premiumService.aiService.summarizeArticle(prompt);
      console.log('Received summary:', summary);
      
      // Display summary
      this.showSummary(summary);
    } catch (error) {
      console.error('Summary failed:', error);
      // Show error message to user
      const errorMessage = error.code === 'QUOTA_EXCEEDED' 
        ? 'You have reached your daily summary limit. Upgrade to continue using this feature.'
        : 'Failed to generate summary. Please try again.';
      
      this.showError(errorMessage);
    } finally {
      // Restore original button content
      this.summaryButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="21" y1="10" x2="7" y2="10"></line>
          <line x1="21" y1="6" x2="3" y2="6"></line>
          <line x1="21" y1="14" x2="3" y2="14"></line>
          <line x1="21" y1="18" x2="7" y2="18"></line>
        </svg>
        Summarize
      `;
      this.summaryButton.disabled = false;
    }
  }

  showSummary(summary) {
    // Remove existing summary if present
    const existingSummary = this.readerContent.querySelector('.reader-summary');
    if (existingSummary) {
      existingSummary.remove();
    }

    // Create summary container
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'reader-summary';

    // Add title
    const title = document.createElement('h3');
    title.innerHTML = 'Key Points <span class="ai-badge">AI</span>';
    summaryContainer.appendChild(title);

    // Split summary into bullet points and ensure exactly 3 points
    let bulletPoints = summary.split('\n')
      .map(point => point.trim())
      .filter(point => point.length > 0)
      .slice(0, 3);  // Limit to 3 points

    // Add bullet points
    bulletPoints.forEach(point => {
      const bulletPoint = document.createElement('span');
      bulletPoint.className = 'bullet-point';
      // Remove any leading dashes or bullets that might come from the API
      bulletPoint.textContent = point.replace(/^[-•*]\s*/, '').trim();
      summaryContainer.appendChild(bulletPoint);
    });

    // Insert summary at the top of the content
    const content = this.readerContent.querySelector('.reader-content');
    content.insertBefore(summaryContainer, content.firstChild);

    // Scroll to summary with smooth animation
    summaryContainer.scrollIntoView({ behavior: 'smooth' });
  }

  showError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'reader-summary-error';
    errorContainer.textContent = message;
    
    const content = this.readerContent.querySelector('.reader-content');
    content.insertBefore(errorContainer, content.firstChild);
    
    // Remove error after 5 seconds
    setTimeout(() => {
      errorContainer.remove();
    }, 5000);
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