document.addEventListener('DOMContentLoaded', () => {
  loadSavedArticles();
  
  // Back button handler
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'popup.html';
  });
});

function shareArticle(article) {
  // Create share data
  const shareData = {
    title: article.title,
    text: `Check out this article: ${article.title}`,
    url: article.url
  };

  // Use Web Share API if available
  if (navigator.share) {
    navigator.share(shareData)
      .catch(error => console.log('Error sharing:', error));
  } else {
    // Fallback: Copy to clipboard
    const shareText = `${article.title}\n${article.url}`;
    navigator.clipboard.writeText(shareText)
      .then(() => {
        showNotification('Link copied to clipboard');
      })
      .catch(error => {
        console.error('Failed to copy:', error);
        showNotification('Failed to copy link', true);
      });
  }
}

function showNotification(message, isError = false) {
  const notification = document.createElement('div');
  notification.className = `share-notification ${isError ? 'error' : 'success'}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

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
      <div class="article-card" data-id="${article.id}">
        <div class="article-header">
          <a href="${article.url}" class="article-title-link" target="_blank">
            <h3 class="article-title">${article.title}</h3>
          </a>
          <div class="article-meta">
            <span class="reading-time">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${article.readingTime}
            </span>
            <span class="save-date">Saved ${new Date(article.savedAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div class="article-actions">
          <button class="action-button primary-button open-article" data-url="${article.url}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Open Article
          </button>
          <button class="action-button secondary-button share-article" data-article='${JSON.stringify(article)}'>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            Share
          </button>
          <button class="action-button delete-button remove-article" data-id="${article.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Remove
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

    document.querySelectorAll('.share-article').forEach(button => {
      button.addEventListener('click', () => {
        const article = JSON.parse(button.dataset.article);
        shareArticle(article);
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
        
        // Remove the article card with animation
        const card = document.querySelector(`.article-card[data-id="${articleId}"]`);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.remove();
          if (document.querySelectorAll('.article-card').length === 0) {
            loadSavedArticles(); // Reload to show "No articles" message
          }
        }, 300);
      });
    });
  } catch (error) {
    console.error('Failed to load saved articles:', error);
    document.getElementById('saved-articles-list').innerHTML = 
      '<p class="error">Failed to load saved articles</p>';
  }
} 