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
    this.isFullscreen = false;
    
    // Add keyboard shortcut listener
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
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

    // Calculate reading time
    const readingTime = this.calculateReadingTime(article.content);

    // Insert reader content with reading time
    this.readerContent.innerHTML = `
      <div class="reader-header">
        <h1>${article.title}</h1>
        <div class="reading-time">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          ${readingTime}
        </div>
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
    // If summary exists, handle toggle
    const existingSummary = this.readerContent.querySelector('.reader-summary');
    if (existingSummary) {
      existingSummary.remove();
      this.updateSummarizeButton('show');
      return;
    }

    try {
      console.log('Starting summarization...');
      const article = this.readerContent.querySelector('.reader-content');
      const text = article.textContent;
      
      console.log('Article text length:', text.length);
      
      // Show loading state while maintaining icon
      this.updateSummarizeButton('loading');
      
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
      
      // Update button to "Hide summary"
      this.updateSummarizeButton('hide');
    } catch (error) {
      console.error('Summary failed:', error);
      // Show error message to user
      const errorMessage = error.code === 'QUOTA_EXCEEDED' 
        ? 'You have reached your daily summary limit. Upgrade to continue using this feature.'
        : 'Failed to generate summary. Please try again.';
      
      this.showError(errorMessage);
      this.updateSummarizeButton('show');
    }
  }

  updateSummarizeButton(state) {
    const icon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="21" y1="10" x2="7" y2="10"></line>
        <line x1="21" y1="6" x2="3" y2="6"></line>
        <line x1="21" y1="14" x2="3" y2="14"></line>
        <line x1="21" y1="18" x2="7" y2="18"></line>
      </svg>
    `;

    switch (state) {
      case 'loading':
        this.summaryButton.innerHTML = `${icon}Summarizing...`;
        this.summaryButton.disabled = true;
        break;
      case 'hide':
        this.summaryButton.innerHTML = `${icon}Hide summary`;
        this.summaryButton.disabled = false;
        break;
      case 'show':
      default:
        this.summaryButton.innerHTML = `${icon}Summarize`;
        this.summaryButton.disabled = false;
        break;
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

  calculateReadingTime(text) {
    const wordsPerMinute = 225; // Average reading speed
    const wordCount = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    
    if (minutes < 1) {
      return 'Less than 1 min read';
    } else if (minutes === 1) {
      return '1 min read';
    } else {
      return `${minutes} min read`;
    }
  }

  toggleFocusMode() {
    if (!this.isFullscreen) {
      // Enter fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
      this.readerContent.classList.add('focus-mode');
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      this.readerContent.classList.remove('focus-mode');
    }
    this.isFullscreen = !this.isFullscreen;
  }

  handleKeyboardShortcuts(e) {
    // Only handle shortcuts when reader mode is enabled
    if (!this.isEnabled) return;

    // Alt + F for focus mode
    if (e.altKey && e.key.toLowerCase() === 'f') {
      e.preventDefault(); // Prevent default browser behavior
      this.toggleFocusMode();
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