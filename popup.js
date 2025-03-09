// Get UI elements
const toggleButton = document.getElementById('toggleReader');
const darkModeCheckbox = document.getElementById('darkMode');

// Ensure dark mode is unchecked by default
darkModeCheckbox.checked = false;

// Get font control elements
const fontFamilySelect = document.getElementById('fontFamily');
const fontSizeInput = document.getElementById('fontSize');
const fontSizeDisplay = document.getElementById('fontSizeDisplay');
const lineHeightInput = document.getElementById('lineHeight');
const lineHeightDisplay = document.getElementById('lineHeightDisplay');

// Settings panel controls
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const backBtn = document.getElementById('backBtn');

// Check reading mode state when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: 'getState' }, (response) => {
    if (response && response.isEnabled) {
      toggleButton.textContent = 'Exit Reading Mode';
      const settingsPanel = document.querySelector('.settings');
      settingsPanel.classList.add('visible');
    }
  });
});

// Handle reader mode toggle
toggleButton.addEventListener('click', async () => {
  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Send toggle message to content script
  chrome.tabs.sendMessage(tab.id, { action: 'toggleReader' }, (response) => {
    if (response && response.success) {
      // Update button text based on reader mode state
      toggleButton.textContent = response.isEnabled ? 'Reading Mode' : 'Exit Reading Mode';
      // Show/hide dark mode settings
      const settingsPanel = document.querySelector('.settings');
      settingsPanel.classList.toggle('visible', !response.isEnabled);
      
      // Reset dark mode when exiting reading mode
      if (response.isEnabled) {
        darkModeCheckbox.checked = false;
        chrome.tabs.sendMessage(tab.id, { 
          action: 'setDarkMode', 
          darkMode: false 
        });
      }
    }
  });
});

// Handle dark mode toggle
darkModeCheckbox.addEventListener('change', (e) => {
  const isDarkMode = e.target.checked;
  
  // Send dark mode state to content script
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { 
      action: 'setDarkMode', 
      darkMode: isDarkMode 
    });
  });
});

// Handle font family changes
fontFamilySelect.addEventListener('change', (e) => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { 
      action: 'setFontFamily', 
      fontFamily: e.target.value 
    });
  });
});

// Handle font size changes
fontSizeInput.addEventListener('input', (e) => {
  const size = e.target.value;
  fontSizeDisplay.textContent = `${size}px`;
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { 
      action: 'setFontSize', 
      fontSize: size 
    });
  });
});

// Handle line height changes
lineHeightInput.addEventListener('input', (e) => {
  const height = e.target.value;
  lineHeightDisplay.textContent = height;
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { 
      action: 'setLineHeight', 
      lineHeight: height 
    });
  });
});

// Update article insights
function updateInsights(stats) {
  document.getElementById('readingTime').textContent = 
    `~${stats.readingTime} min`;
}

// Listen for insight updates
chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === 'updateInsights') {
    updateInsights(request.stats);
  }
});

// Settings panel controls
settingsBtn.addEventListener('click', () => {
  settingsPanel.classList.toggle('visible');
});

// Back button handler
backBtn.addEventListener('click', () => {
  settingsPanel.classList.remove('visible');
});

// Close settings when clicking outside
document.addEventListener('click', (e) => {
  if (!settingsPanel.contains(e.target) && 
      !settingsBtn.contains(e.target) && 
      settingsPanel.classList.contains('visible')) {
    settingsPanel.classList.remove('visible');
  }
});

// Handle AI settings
document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('openai-api-key');
    const toggleVisibility = document.querySelector('.toggle-visibility');
    const saveButton = document.querySelector('.save-key-btn');

    if (apiKeyInput && toggleVisibility && saveButton) {
        // Load saved API key
        chrome.storage.sync.get('openai_api_key', (result) => {
            if (result.openai_api_key) {
                apiKeyInput.value = result.openai_api_key;
            }
        });

        // Validate API key format
        function validateApiKeyFormat(apiKey) {
            if (!apiKey.startsWith('sk-') || apiKey.length < 40) {
                throw new Error('Invalid API key. Please check and try again');
            }
            return true;
        }

        // Test API key with a minimal API call
        async function testApiKey(apiKey) {
            try {
                const response = await fetch('https://api.openai.com/v1/models', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error('Invalid API key. Please check and try again');
                }

                return true;
            } catch (error) {
                throw new Error('Invalid API key. Please check and try again');
            }
        }

        // Show validation message
        function showValidationMessage(message, isError = false) {
            const existingMessage = document.querySelector('.validation-message');
            if (existingMessage) {
                existingMessage.remove();
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = `validation-message ${isError ? 'error' : 'success'}`;
            messageDiv.textContent = message;
            
            const container = apiKeyInput.parentElement.parentElement;
            container.insertBefore(messageDiv, apiKeyInput.parentElement.nextSibling);

            setTimeout(() => messageDiv.remove(), 3000);
        }

        // Save API key with validation
        async function saveApiKey(apiKey) {
            try {
                // First validate format
                validateApiKeyFormat(apiKey);
                
                // Show loading state
                saveButton.textContent = 'Validating...';
                saveButton.disabled = true;
                
                // Test the API key
                await testApiKey(apiKey);

                // If validation passes, save the key
                await chrome.storage.sync.set({ 'openai_api_key': apiKey });
                
                // Show success state
                apiKeyInput.classList.add('saved');
                saveButton.textContent = 'Saved!';
                saveButton.style.backgroundColor = '#28a745';
                showValidationMessage('API key saved successfully!');
                
                setTimeout(() => {
                    apiKeyInput.classList.remove('saved');
                    saveButton.textContent = 'Save';
                    saveButton.style.backgroundColor = '#8b6b4d';
                    saveButton.disabled = false;
                }, 1500);

            } catch (error) {
                // Show error state
                saveButton.textContent = 'Save';
                saveButton.disabled = false;
                showValidationMessage('Invalid API key. Please check and try again', true);
                apiKeyInput.classList.add('error');
                
                setTimeout(() => {
                    apiKeyInput.classList.remove('error');
                }, 1500);
            }
        }

        // Save API key when save button is clicked
        saveButton.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            if (!apiKey) {
                showValidationMessage('Invalid API key. Please check and try again', true);
                return;
            }
            saveApiKey(apiKey);
        });

        // Toggle API key visibility
        toggleVisibility.addEventListener('click', () => {
            apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
            toggleVisibility.classList.toggle('visible');
        });
    }
});

// Load saved articles when popup opens
async function loadSavedArticles() {
  try {
    const result = await chrome.storage.sync.get('savedArticlesMeta');
    const savedArticlesMeta = result.savedArticlesMeta || [];
    const articlesList = document.getElementById('saved-articles-list');
    
    if (savedArticlesMeta.length === 0) {
      articlesList.innerHTML = '<p class="no-articles">No saved articles yet</p>';
      return;
    }

    // Sort articles by save date (newest first)
    savedArticlesMeta.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

    articlesList.innerHTML = savedArticlesMeta.map(article => `
      <div class="saved-article">
        <div class="article-info">
          <h3 class="article-title">${article.title}</h3>
          <div class="article-meta">
            <span class="reading-time">${article.readingTime}</span>
            <span class="save-date">Saved ${new Date(article.savedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="article-actions">
          <button class="open-article" data-url="${article.url}" title="Open article">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>
          <button class="remove-article" data-id="${article.id}" title="Remove from saved">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    `).join('');

    // Add event listeners for article actions
    document.querySelectorAll('.open-article').forEach(button => {
      button.addEventListener('click', () => {
        chrome.tabs.create({ url: button.dataset.url });
      });
    });

    document.querySelectorAll('.remove-article').forEach(button => {
      button.addEventListener('click', async () => {
        const articleId = button.dataset.id;
        const result = await chrome.storage.sync.get('savedArticlesMeta');
        const savedArticlesMeta = result.savedArticlesMeta || [];
        
        // Remove from sync storage
        const updatedMeta = savedArticlesMeta.filter(article => article.id !== articleId);
        await chrome.storage.sync.set({ savedArticlesMeta: updatedMeta });
        
        // Remove from local storage
        await chrome.storage.local.remove(`article_${articleId}`);
        
        // Reload the list
        loadSavedArticles();
      });
    });
  } catch (error) {
    console.error('Failed to load saved articles:', error);
    document.getElementById('saved-articles-list').innerHTML = 
      '<p class="error">Failed to load saved articles</p>';
  }
}

// Call loadSavedArticles when popup opens
document.addEventListener('DOMContentLoaded', loadSavedArticles);

// Handle reading list button
document.getElementById('viewSavedArticles').addEventListener('click', () => {
  chrome.tabs.create({
    url: 'saved-articles.html',
    active: true
  });
}); 