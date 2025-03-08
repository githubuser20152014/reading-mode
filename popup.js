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

        // Save API key when save button is clicked
        saveButton.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            chrome.storage.sync.set({ 'openai_api_key': apiKey }, () => {
                // Show success indicator
                apiKeyInput.classList.add('saved');
                saveButton.textContent = 'Saved!';
                saveButton.style.backgroundColor = '#28a745';
                
                setTimeout(() => {
                    apiKeyInput.classList.remove('saved');
                    saveButton.textContent = 'Save';
                    saveButton.style.backgroundColor = '#8b6b4d';
                }, 1500);
            });
        });

        // Toggle API key visibility
        toggleVisibility.addEventListener('click', () => {
            apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
            toggleVisibility.classList.toggle('visible');
        });
    }
}); 