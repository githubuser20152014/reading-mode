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