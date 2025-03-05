class AIService {
  constructor() {
    this.backendURL = 'https://your-backend.com/api';
  }

  async summarizeArticle(text) {
    try {
      const response = await fetch(`${this.backendURL}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getUserToken()}`
        },
        body: JSON.stringify({ text })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Summarization failed:', error);
      throw error;
    }
  }

  async getUserToken() {
    // Get authenticated user token
    const auth = await chrome.storage.sync.get('authToken');
    return auth.authToken;
  }
} 