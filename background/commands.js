// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "read-mode",
    title: "View in Reading Mode",
    contexts: ["page", "selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "read-mode") {
    chrome.tabs.sendMessage(tab.id, { action: 'toggleReader' });
  }
});

// Existing keyboard shortcut handler
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-reader-mode") {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(tab.id, { action: 'toggleReader' });
    });
  }
}); 