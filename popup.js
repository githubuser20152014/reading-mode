// Get UI elements
const toggleButton = document.getElementById('toggleReader');
const darkModeCheckbox = document.getElementById('darkMode');

// Load saved dark mode preference
chrome.storage.sync.get(['darkMode'], (result) => {
  const isDarkMode = result.darkMode || false;
  darkModeCheckbox.checked = isDarkMode;
});

// Handle reader mode toggle
toggleButton.addEventListener('click', async () => {
  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Send toggle message to content script
  chrome.tabs.sendMessage(tab.id, { action: 'toggleReader' }, (response) => {
    if (response && response.success) {
      // Update button text based on reader mode state
      toggleButton.textContent = response.isEnabled ? 'Exit Reading Mode' : 'Reading Mode';
    }
  });
});

// Handle dark mode toggle
darkModeCheckbox.addEventListener('change', (e) => {
  const isDarkMode = e.target.checked;
  
  // Save preference
  chrome.storage.sync.set({ darkMode: isDarkMode });
  
  // Send dark mode state to content script
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { 
      action: 'setDarkMode', 
      darkMode: isDarkMode 
    });
  });
}); 