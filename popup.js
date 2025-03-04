// Get UI elements
const toggleButton = document.getElementById('toggleReader');
const darkModeCheckbox = document.getElementById('darkMode');

// Ensure dark mode is unchecked by default
darkModeCheckbox.checked = false;

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