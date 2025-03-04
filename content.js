class ReadingMode {
  constructor() {
    this.isEnabled = false;
    this.originalContent = null;
    this.readerContent = null;
  }

  async init() {
    // Initialize Readability when needed
    if (!this.originalContent) {
      this.originalContent = document.cloneNode(true);
    }
  }

  async enable() {
    await this.init();
    
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
  } else if (request.action === 'setDarkMode') {
    readingMode.setDarkMode(request.darkMode);
    sendResponse({ success: true });
  }
}); 