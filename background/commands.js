chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-reader-mode") {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(tab.id, { action: 'toggleReader' });
    });
  }
}); 