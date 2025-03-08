class AIService {
  constructor() {
    this.apiKey = null;
  }

  async init() {
    const result = await chrome.storage.sync.get('openai_api_key');
    this.apiKey = result.openai_api_key;
  }

  async summarizeArticle(text) {
    try {
      if (!this.apiKey) {
        await this.init();
        if (!this.apiKey) {
          throw new Error('OpenAI API key not found');
        }
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "system",
            content: "You are a helpful assistant that creates concise bullet-point summaries. Create exactly 3 key points, each starting with a bullet point •"
          }, {
            role: "user",
            content: `Summarize this article in exactly 3 bullet points:\n\n${text}`
          }],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate summary');
      }

      const data = await response.json();
      const summary = data.choices[0].message.content;
      return summary;
    } catch (error) {
      console.error('Summarization failed:', error);
      if (error.message.includes('API key')) {
        throw new Error('Please set up your OpenAI API key in the extension settings');
      }
      throw error;
    }
  }
} 