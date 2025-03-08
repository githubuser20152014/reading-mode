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